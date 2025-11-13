// สมองประเมิน ADR — โหมด C: ใช้ token/เงื่อนไขต่อ-ADR แบบไม่แชร์กัน
(function () {
  // ---------------------------------------------------------------------------
  // Helpers (numeric & safe getters)
  // ---------------------------------------------------------------------------
  function num(v) {
    const n = Number(String(v ?? "").toString().replace(/[, ]+/g, ""));
    return Number.isFinite(n) ? n : NaN;
  }
  function arr(v) {
    return Array.isArray(v) ? v : [];
  }
  function has(arrLike, val) {
    return arr(arrLike).includes(val);
  }
  function truthy(v) {
    if (v === true) return true;
    if (typeof v === "string") {
      const s = v.trim();
      if (!s) return false;
      return !/^(false|null|undefined|0|no|ไม่|ไม่มี)$/i.test(s);
    }
    return !!v;
  }

  // ---------------------------------------------------------------------------
  // Shortcuts to app data
  // ---------------------------------------------------------------------------
  function getD() { return window.drugAllergyData || {}; }
  function P1() { return getD().page1 || {}; }
  function P2() { return getD().page2 || {}; }
  function P3() { return getD().page3 || {}; }

  // หน้า 1
  function shapes() { return arr(P1().rashShapes); }
  function colors() { return arr(P1().rashColors); }
  function locs()   { return arr(P1().locations); }
  function onset()  { return P1().onset || ""; } // "1h","1to6h","6to24h","1w","2w","3w","4w","other"

  // หน้า 1: blocks/booleans
  function itch()    { return (P1().itch && P1().itch.has) || false; }
  function swelling(){ return (P1().swelling && P1().swelling.has) || false; }
  function painKey(k){ return !!(P1().pain && P1().pain[k]); }
  function blisters(k){ return !!(P1().blisters && P1().blisters[k]); } // small/medium/large
  function exu(k){ return !!(P1().exudate && P1().exudate[k]); } // serous, crust
  function scaleKey(k){ return !!(P1().scales && P1().scales[k]); } // scale,dry,peel
  function detachKey(k){ return !!(P1().skinDetach && P1().skinDetach[k]); } // center, lt10, gt30
  function mucosalGt1(){ return !!P1().mucosalCountGt1; }
  function distribution(){ return P1().distribution || ""; }

  // หน้า 2: mapped tokens (ตาม page2.js เวอร์ชันล่าสุด)
  function P2has(path) {
    const p2 = P2();
    const seg = path.split(".");
    let cur = p2;
    for (const s of seg) {
      if (cur == null) return false;
      cur = cur[s];
    }
    return truthy(cur);
  }
  function resp(t){ return P2has("resp."+t); }  // dyspnea, wheeze
  function cv(t){ return P2has("cv."+t); }      // hypotension, shock
  function gi(t){ return P2has("gi."+t); }      // nausea, dysphagia, diarrhea, cramp
  function misc(t){ return P2has('misc["'+t+'"]') || P2has("misc."+t); }
  function organFlag(k){ return !!(P2().organsFlags && P2().organsFlags[k]); }

  // หน้า 2: บาง vital proxy (ตั้งไว้ใน page2 เพื่อกระตุ้นเงื่อนไข)
  function HR(){ return num(P2().HR); }
  function RR(){ return num(P2().RR); }
  function SpO2(){ return num(P2().SpO2); }

  // หน้า 3: labs (ยังไม่บังคับต้องมี)
  function lab(path) {
    // path เช่น "cbc.wbc.value", "cbc.neutPct.value", "cbc.eosPct.value", "lft.ast.value"
    const p3 = P3();
    const seg = path.split(".");
    let cur = p3;
    for (const s of seg) {
      if (cur == null) return NaN;
      cur = cur[s];
    }
    return num(cur && cur.value != null ? cur.value : cur);
  }

  // onset helpers
  function onsetAny(keys) { return keys.some(k => onset() === k); }

  // addScore: เก็บรายละเอียด token ที่ทำคะแนน
  function mkScoreBox() {
    const sb = Object.create(null);
    sb.total = 0;
    sb.tokens = []; // [{label, w}]
    sb.add = (label, w = 1) => { sb.total += w; sb.tokens.push({label, w}); };
    return sb;
  }

  // ---------------------------------------------------------------------------
  // ADR RULES (แยกชุด — ไม่แชร์ token)
  // ใส่คะแนนตามที่สเปคกำหนด (x2/x3/x4)
  // ---------------------------------------------------------------------------
  const RULES = [
    {
      key: "urticaria",
      label: "Urticaria (Type I / Pseudoallergy)",
      eval() {
        const s = mkScoreBox();
        // 1. รูปร่าง (ที่กำหนด)
        if (has(shapes(), "ขอบหยัก")) s.add("ขอบหยัก");
        if (has(shapes(), "วงกลม")) s.add("วงกลม");
        if (has(shapes(), "ขอบวงนูนแดงด้านในเรียบ")) s.add("ขอบวงนูนแดงด้านในเรียบ");
        // 2. สี
        ["แดง","แดงซีด","ซีด","สีผิวปกติ"].forEach(c => { if (has(colors(), c)) s.add("สี: "+c); });
        // 3. ลักษณะสำคัญ x2
        if (has(shapes(), "ตุ่มนูน")) s.add("ตุ่มนูน (x2)", 2);
        if (has(shapes(), "ปื้นนูน")) s.add("ปื้นนูน (x2)", 2);
        // 4. อาการเพิ่ม
        if (itch()) s.add("คัน");
        // 5. พบไม่บ่อย
        if (swelling()) s.add("บวม (พบไม่บ่อย)");
        // 6. ตำแหน่ง
        ["ทั่วร่างกาย","มือ","เท้า","แขน","ขา","หน้า","รอบดวงตา","ลำคอ","ลำตัว","หลัง"].forEach(L=>{
          if (has(locs(), L)) s.add("ตำแหน่ง: "+L);
        });
        // 7. เวลา
        if (onset() === "1h") s.add("ภายใน 1 ชั่วโมง");
        return s;
      }
    },

    {
      key: "anaphylaxis",
      label: "Anaphylaxis (Type I / Pseudoallergy)",
      eval() {
        const s = mkScoreBox();
        // 1. รูปร่าง
        ["ตุ่มนูน","ปื้นนูน","บวม","นูนหนา","ผิวหนังตึง"].forEach(shape=>{
          if (has(shapes(), shape)) s.add("รูปร่าง: "+shape);
        });
        // 2. สำคัญ x2
        if (resp("wheeze")) s.add("หายใจมีเสียงวี๊ด (x2)", 2);
        if (resp("dyspnea") || RR() > 21 || HR() > 100 || SpO2() > 0 && SpO2() < 94) s.add("หอบเหนื่อย/หายใจลำบาก (x2)", 2);
        // 3. ผิวหนัง
        if (itch()) s.add("คัน");
        ["แดง","สีผิวปกติ"].forEach(c => { if (has(colors(), c)) s.add("สีผิว: "+c); });
        // 4. พบไม่บ่อย (GI)
        if (gi("diarrhea")) s.add("ท้องเสีย (พบไม่บ่อย)");
        if (gi("dysphagia")) s.add("กลืนลำบาก (พบไม่บ่อย)");
        if (gi("cramp")) s.add("ปวดบิดท้อง (พบไม่บ่อย)");
        if (gi("nausea")) s.add("คลื่นไส้/อาเจียน (พบไม่บ่อย)");
        // 5. เวลา
        if (onsetAny(["1h","1to6h"])) s.add("ระยะเวลาเข้าเกณฑ์ (≤6ชม.)");
        // 6. ระบบอื่น
        if (cv("hypotension")) s.add("BP ต่ำ (<90/60)");
        if (cv("shock")) s.add("BP ลดลง ≥40 mmHg ของ baseline systolic เดิม");
        // 7. Lab/vital proxy
        if (HR() > 100) s.add("HR >100");
        if (SpO2() > 0 && SpO2() < 94) s.add("SpO₂ <94%");
        return s;
      }
    },

    {
      key: "angioedema",
      label: "Angioedema (Type I / Pseudoallergy)",
      eval() {
        const s = mkScoreBox();
        // 1. รูปร่าง
        if (has(shapes(), "นูนหนา")) s.add("นูนหนา");
        if (has(shapes(), "ขอบไม่ชัดเจน")) s.add("ขอบไม่ชัดเจน");
        // 2. สี
        ["สีผิวปกติ","แดง"].forEach(c => { if (has(colors(), c)) s.add("สี: "+c); });
        // 3. ลักษณะสำคัญ x2
        if (swelling()) s.add("บวม (x2)", 2);
        // 4. เพิ่มเติม
        if (has(shapes(), "ผิวหนังตึง")) s.add("ผิวหนังตึง");
        if (itch()) s.add("คัน (พบน้อย)");
        if (!itch()) s.add("ไม่คัน (พบน้อย)");
        if (painKey("pain")) s.add("ปวด (พบน้อย)");
        if (painKey("burn")) s.add("แสบ (พบน้อย)");
        // 5. ตำแหน่งเด่น
        ["ริมฝีปาก","รอบดวงตา","ลิ้น","อวัยวะเพศ"].forEach(L=>{ if (has(locs(), L)) s.add("ตำแหน่ง: "+L); });
        // 6. เวลา
        if (onset() === "1h") s.add("ภายใน 1 ชั่วโมง");
        return s;
      }
    },

    {
      key: "mpr",
      label: "Maculopapular rash (Type IV)",
      eval() {
        const s = mkScoreBox();
        // 1. รูปร่าง
        if (has(shapes(),"ปื้นแดง")) s.add("ปื้นแดง");
        if (has(shapes(),"ปื้นนูน")) s.add("ปื้นนูน");
        if (has(shapes(),"ตุ่มนูน")) s.add("ตุ่มนูน");
        // 2. สี
        if (has(colors(),"แดง")) s.add("สีแดง");
        // 3. สำคัญ x2
        if (has(shapes(),"จุดเล็กแดง")) s.add("จุดเล็กแดง (x2)", 2);
        // 4. เพิ่มเติม
        if (itch()) s.add("คัน");
        // 5. พบน้อย
        if (truthy(P2has("misc.fever") || num(P3()?.cbc?.eosPct?.value) > 5)) s.add("ไข้/Eosinophil >5%");
        // 6. ตำแหน่ง/การกระจาย
        if (distribution()==="สมมาตร") s.add("การกระจาย: สมมาตร");
        ["ลำตัว","แขน","หน้า","ลำคอ"].forEach(L=>{ if (has(locs(), L)) s.add("ตำแหน่ง: "+L); });
        // 7. เวลา
        if (onsetAny(["1to6h","6to24h","1w","2w"])) s.add("ระยะเวลาเข้าเกณฑ์");
        // 8. อวัยวะ
        if (organFlag("hepatitis")) s.add("ตับอักเสบ");
        if (organFlag("kidneyFail") || organFlag("nephritis")) s.add("ไตอักเสบ/ไตวาย");
        return s;
      }
    },

    {
      key: "fde",
      label: "Fixed drug eruption (Type IV)",
      eval() {
        const s = mkScoreBox();
        // 1. รูปร่าง
        if (has(shapes(),"วงกลม")) s.add("วงกลม");
        if (has(shapes(),"วงรี")) s.add("วงรี");
        // 2. สี
        if (has(colors(),"แดง")) s.add("แดง");
        if (has(colors(),"ดำ/คล้ำ")) s.add("ดำ/คล้ำ");
        // 3. สำคัญ x3
        if (has(colors(),"ม่วง/คล้ำ")) s.add("ม่วง/คล้ำ (x3)", 3);
        // 4. ผิวหนังเพิ่ม
        if (detachKey("center")) s.add("ผิวหลุดลอกตรงกลาง");
        if (painKey("sore")) s.add("เจ็บ");
        if (painKey("burn")) s.add("แสบ");
        if (has(shapes(),"ผิวหนังตึง")) s.add("ตึง");
        // 5. พบน้อย
        if (swelling()) s.add("บวม (พบน้อย)");
        if (blisters("small")) s.add("ตุ่มน้ำขนาดเล็ก (พบน้อย)");
        if (blisters("medium")) s.add("ตุ่มน้ำขนาดกลาง (พบน้อย)");
        if (blisters("large")) s.add("ตุ่มน้ำขนาดใหญ่ (พบน้อย)");
        // 6. ตำแหน่ง
        ["ริมฝีปาก","หน้า","มือ","เท้า","แขน","ขา","อวัยวะเพศ","ตำแหน่งเดิมกับครั้งก่อน"].forEach(L=>{
          if (has(locs(), L)) s.add("ตำแหน่ง: "+L);
        });
        // 7. เวลา
        if (onsetAny(["1w","2w"])) s.add("ภายใน 1–2 สัปดาห์");
        // 8. ระบบอื่น
        if (P2has("misc.fever")) s.add("ไข้");
        if (gi("nausea")) s.add("คลื่นไส้/อาเจียน");
        if (P2has("msk") && (P2has('msk["ปวดเมื่อยกล้ามเนื้อ"].checked') || false)) s.add("ปวดเมื่อยกล้ามเนื้อ");
        // 9. ขอบ
        if (has(shapes(),"ขอบเรียบ")) s.add("ขอบเรียบ");
        if (has(shapes(),"ขอบเขตชัด")) s.add("ขอบเขตชัด");
        return s;
      }
    },

    {
      key: "agep",
      label: "AGEP (Type IV)",
      eval() {
        const s = mkScoreBox();
        // 1. รูปร่าง/สี
        if (has(shapes(),"ปื้นแดง")) s.add("ผื่น/ปื้นแดง");
        if (has(colors(),"แดง")) s.add("สีแดง");
        if (has(colors(),"เหลือง")) s.add("สีเหลือง");
        // 3. สำคัญ x3
        if (truthy(P1().pustule && P1().pustule.has)) s.add("ตุ่มหนอง (x3)", 3);
        // 4. เพิ่มเติม
        if (swelling()) s.add("บวม");
        if (itch()) s.add("คัน");
        if (painKey("sore")) s.add("เจ็บ");
        // 5. พบน้อย (เลือดออกผิว/แห้ง/ลอก/ขุย)
        if (misc("ปื้น/จ้ำเลือด")) s.add("ปื้น/จ้ำเลือด");
        if (scaleKey("dry"))  s.add("แห้ง");
        if (scaleKey("peel")) s.add("ลอก");
        if (scaleKey("scale")) s.add("ขุย");
        // 6. ตำแหน่ง
        ["หน้า","รักแร้","ทั่วร่างกาย","ขาหนีบ"].forEach(L=>{ if (has(locs(),L)) s.add("ตำแหน่ง: "+L); });
        // 7. เวลา
        if (onsetAny(["6to24h","1w","2w","3w"])) s.add("เวลาเข้าเกณฑ์");
        // 8. ระบบอื่น
        if (P2has("misc.fever")) s.add("ไข้ >37.5°C");
        // 9. Lab (ถ้ามี)
        const wbc = lab("cbc.wbc.value"); if (wbc > 11000) s.add("WBC >11000");
        const neut = lab("cbc.neutPct.value"); if (neut > 75) s.add("Neutrophil >75%");
        return s;
      }
    },

    {
      key: "sjs",
      label: "SJS (Type IV)",
      eval() {
        const s = mkScoreBox();
        // 1. รูปร่าง/สี
        if (has(colors(),"ดำ/คล้ำ")) s.add("ดำ/คล้ำ");
        if (has(colors(),"เทา")) s.add("เทา");
        if (has(colors(),"แดง")) s.add("แดง");
        // 3. สำคัญ x3
        if (detachKey("lt10")) s.add("ผิวหนังหลุดลอก ≤10% BSA (x3)", 3);
        // 4. เพิ่มเติม
        if (exu("serous")) s.add("น้ำเหลือง");
        if (blisters("small")) s.add("ตุ่มน้ำเล็ก");
        if (blisters("medium")) s.add("ตุ่มน้ำกลาง");
        if (blisters("large")) s.add("ตุ่มน้ำใหญ่");
        // 5. พบ
        if (exu("crust")) s.add("สะเก็ด");
        // 6. ตำแหน่ง
        if (has(locs(),"ลำตัว")) s.add("ลำตัว");
        // 7. เวลา (ครอบคลุมตามสเปค)
        if (onsetAny(["1to6h","6to24h","1w","2w","3w"])) s.add("เวลาเข้าเกณฑ์");
        // 8. ระบบอื่น
        if (P2has("misc.fever")) s.add("ไข้");
        if (P2has("misc.fatigue") || P2has("msk") ) s.add("ปวดเมื่อยกล้ามเนื้อ/อ่อนเพลีย");
        if (gi("nausea")) s.add("คลื่นไส้/อาเจียน");
        if (misc("เลือดออกในทางเดินอาหาร")) s.add("เลือดออกในทางเดินอาหาร");
        // 9. อวัยวะมิวโคซา
        if (mucosalGt1()) s.add("จำนวนผื่นบริเวณเยื่อบุ > 1 (mucosal)");
        return s;
      }
    },

    {
      key: "ten",
      label: "TEN (Type IV)",
      eval() {
        const s = mkScoreBox();
        // 1. รูปร่าง
        if (has(shapes(),"ปื้นแดง")) s.add("ปื้นแดง");
        if (has(shapes(),"วงกลม")) s.add("เป้าธนูไม่ครบ 3 ชั้น (อนุมานจากวง)");
        // 2. สี
        if (has(colors(),"แดง")) s.add("แดง");
        if (has(colors(),"ดำ/คล้ำ")) s.add("ดำ/คล้ำ");
        // 3. สำคัญ x3
        if (detachKey("gt30")) s.add("ผิวหนังหลุดลอก >30% BSA (x3)", 3);
        // 4. เพิ่มเติม
        if (blisters("large")) s.add("ตุ่มน้ำขนาดใหญ่");
        if (exu("serous")) s.add("น้ำเหลือง");
        if (exu("crust")) s.add("สะเก็ด");
        // 5. พบน้อย
        if (has(colors(),"ซีด")) s.add("ซีด");
        if (misc("เลือดออกในทางเดินอาหาร")) s.add("เลือดออก GI");
        if (gi("dysphagia")) s.add("กลืนลำบาก");
        // 6. ตำแหน่ง
        ["ลำตัว","แขน","ขา","หน้า","มือ","เท้า","ศีรษะ","ทั่วร่างกาย","ริมฝีปาก"].forEach(L=>{
          if (has(locs(),L)) s.add("ตำแหน่ง: "+L);
        });
        // 7. เวลา
        if (onsetAny(["1w","2w","3w"])) s.add("เวลา 1–3 สัปดาห์");
        // 8. ระบบอื่น
        if (P2has("misc.fever")) s.add("ไข้");
        if (P2has("misc.fatigue") || P2has("msk")) s.add("ปวดเมื่อยกล้ามเนื้อ/อ่อนเพลีย");
        if (gi("nausea")) s.add("คลื่นไส้/อาเจียน");
        if (P2has("misc.soreThroat")) s.add("เจ็บคอ");
        if (gi("diarrhea")) s.add("ท้องเสีย");
        if (P2has("misc.conjunctivitis")) s.add("เยื่อบุตาอักเสบ");
        // 9. อวัยวะ
        if (organFlag("kidneyFail")) s.add("ไตวาย");
        if (organFlag("hepatitis")) s.add("ตับอักเสบ");
        if (organFlag("pneumonia")) s.add("ปอดอักเสบ");
        // 10. Lab (เผื่อมี)
        const cr = lab("rft.cr.value"); if (cr >= 0.3) s.add("Creatinine ↑ (ตามเกณฑ์)");
        const alt = lab("lft.alt.value"); const ast = lab("lft.ast.value");
        if ((alt >= 40) || (ast >= 40)) s.add("ALT/AST ≥ 40 U/L");
        if (SpO2() > 0 && SpO2() < 94) s.add("SpO₂ <94%");
        return s;
      }
    },

    {
      key: "dress",
      label: "DRESS (Type IV)",
      eval() {
        const s = mkScoreBox();
        // 1. รูปร่าง/สี
        if (has(shapes(),"ปื้นแดง") || has(shapes(),"ผื่นราบ")) s.add("ผื่น/ปื้นแดง");
        if (has(colors(),"แดง")) s.add("แดง");
        // 3. สำคัญ x3 — Eos ≥10% หรือ atypical lymphocyte
        const eosPct = lab("cbc.eosPct.value");
        if (eosPct >= 10) s.add("Eosinophil ≥10% (x3)", 3);
        // 4. ผิวหนังเพิ่ม
        if (blisters("small")) s.add("ตุ่มน้ำเล็ก");
        if (blisters("medium")) s.add("ตุ่มน้ำกลาง");
        if (blisters("large")) s.add("ตุ่มน้ำใหญ่");
        if (misc("ปื้น/จ้ำเลือด")) s.add("จ้ำเลือด");
        // 5. ตำแหน่ง
        ["หน้า","ลำตัว","แขน","ขา"].forEach(L=>{ if (has(locs(),L)) s.add("ตำแหน่ง: "+L); });
        // 6. ระบบอื่น
        if (P2has("misc.fever")) s.add("ไข้");
        // 7. เวลา — 1–6 สัปดาห์ (หน้า 1 มีถึง 4w + other)
        if (onsetAny(["1w","2w","3w","4w"])) s.add("ระยะเวลา ≤4สัปดาห์ (ครอบช่วงส่วนหนึ่ง)");
        // 8. Lab
        const alt = lab("lft.alt.value"), ast = lab("lft.ast.value");
        if ((alt >= 40) || (ast >= 40)) s.add("ALT/AST ≥ 40 U/L");
        const cr = lab("rft.cr.value"); if (cr >= 0.3) s.add("Creatinine ↑ เกณฑ์ AKI");
        // UA protein+
        const protein = lab("ua.protein.value"); if (protein > 0) s.add("Urine protein +");
        if (SpO2() > 0 && SpO2() < 94) s.add("SpO₂ <94%");
        // 9. อวัยวะ
        if (P2has("misc.lymph") || truthy(P2().organs && P2().organs["ต่อมน้ำเหลืองโต"]?.checked)) s.add("ต่อมน้ำเหลืองโต");
        if (organFlag("hepatitis")) s.add("ตับอักเสบ");
        if (organFlag("nephritis") || organFlag("kidneyFail")) s.add("ไตอักเสบ/ไตวาย");
        if (organFlag("pneumonia")) s.add("ปอดอักเสบ");
        if (organFlag("myocarditis")) s.add("กล้ามเนื้อหัวใจอักเสบ");
        return s;
      }
    },

    {
      key: "em",
      label: "Erythema multiforme (Type IV)",
      eval() {
        const s = mkScoreBox();
        // 1. รูปร่าง
        if (has(shapes(),"ตุ่มนูน")) s.add("ตุ่มนูน");
        if (has(shapes(),"ขอบวงนูนแดงด้านในเรียบ")) s.add("ขอบวงนูนแดงด้านในเรียบ");
        // 2. สี
        if (has(colors(),"แดง")) s.add("แดง");
        if (has(colors(),"แดงซีด")) s.add("แดงซีด");
        // 3. สำคัญ x3
        if (has(shapes(),"วงกลม 3 ชั้น")) s.add("วงกลม 3 ชั้น (x3)", 3);
        // 4. เพิ่มเติม
        if (blisters("small")) s.add("ตุ่มน้ำเล็ก");
        if (blisters("medium")) s.add("ตุ่มน้ำกลาง");
        if (exu("serous")) s.add("พอง/น้ำเหลือง");
        // 5. พบน้อย
        if (exu("crust")) s.add("สะเก็ด");
        // 6–7 เวลา
        if (onsetAny(["1to6h","6to24h","1w"])) s.add("เวลาเข้าเกณฑ์");
        // 9. ตำแหน่งแขน/ขา/มือ/เท้า/หน้า/ลำตัว/หลัง/ลำคอ
        ["มือ","เท้า","แขน","ขา","หน้า","ลำตัว","หลัง","ลำคอ"].forEach(L=>{ if (has(locs(),L)) s.add("ตำแหน่ง: "+L); });
        // mucosal (ช่องปาก/จมูก/ทวาร/อวัยวะเพศ)
        if (has(locs(),"ทวาร") || has(locs(),"อวัยวะเพศ")) s.add("มิวโคซาเกี่ยวข้อง (อนุมาน)");
        return s;
      }
    },

    {
      key: "photosens",
      label: "Photosensitivity drug eruption (Type IV)",
      eval() {
        const s = mkScoreBox();
        // 1. รูปร่าง
        if (has(shapes(),"ขอบเขตชัด")) s.add("ขอบเขตชัด");
        if (has(shapes(),"ปื้นแดง")) s.add("ปื้นแดง");
        if (has(shapes(),"จุดเล็กแดง")) s.add("จุดแดงเล็ก");
        // 2. สี
        if (has(colors(),"ดำ/คล้ำ")) s.add("ดำ/คล้ำ");
        if (has(colors(),"แดง")) s.add("แดง");
        // 3. สำคัญ x2
        if (has(colors(),"แดงไหม้")) s.add("แดงไหม้ (x2)", 2);
        // 4. เพิ่มเติม
        if (exu("serous")) s.add("น้ำเหลือง");
        if (exu("crust")) s.add("สะเก็ด");
        // 5. อาจพบ
        if (blisters("small")) s.add("ตุ่มน้ำเล็ก");
        if (blisters("medium")) s.add("ตุ่มน้ำกลาง");
        if (blisters("large")) s.add("ตุ่มน้ำใหญ่");
        if (scaleKey("peel")) s.add("ลอก");
        if (scaleKey("scale")) s.add("ขุย");
        if (itch()) s.add("คัน");
        // 6. ตำแหน่ง
        ["หน้า","มือ","แขน","ขา"].forEach(L=>{ if (has(locs(),L)) s.add("ตำแหน่ง: "+L); });
        // 7. เวลา
        if (onsetAny(["1h","1to6h","6to24h","1w"])) s.add("เวลาเข้าเกณฑ์");
        // 8. เด่น x2
        if (painKey("burn")) s.add("แสบเด่น (x2)", 2);
        return s;
      }
    },

    {
      key: "exfol",
      label: "Exfoliative dermatitis (Type IV)",
      eval() {
        const s = mkScoreBox();
        // 1. รูปร่าง
        if (has(shapes(),"ผิวหนังตึง")) s.add("ผิวหนังตึง");
        // 2. สี
        if (has(colors(),"แดง")) s.add("แดง");
        // 3–4 สำคัญ x3
        if (scaleKey("dry"))  s.add("แห้ง (x3)", 3);
        if (scaleKey("scale")) s.add("ขุย (x3)", 3);
        // 5. อื่นๆ
        if (itch()) s.add("คัน");
        // 6. ตำแหน่ง
        ["ทั่วร่างกาย","มือ","เท้า","ศีรษะ"].forEach(L=>{ if (has(locs(),L)) s.add("ตำแหน่ง: "+L); });
        // 7. เวลา
        if (onsetAny(["3w","1to6h","6to24h","1w","2w","4w"])) s.add("เวลาเข้าเกณฑ์");
        // 8. ระบบอื่น
        if (P2has("misc.fever")) s.add("ไข้");
        if (P2has("misc.chill")) s.add("หนาวสั่น");
        if (P2has("misc.fatigue")) s.add("อ่อนเพลีย");
        if (gi("nausea")) s.add("ดีซ่าน/ตับ (อนุมานได้จาก GI)");
        // 9. อวัยวะ
        if (truthy(P2().organs && P2().organs["ต่อมน้ำเหลืองโต"]?.checked)) s.add("ต่อมน้ำเหลืองโต");
        if (truthy(P2().organs && P2().organs["ตับโต"]?.checked)) s.add("ตับโต");
        if (truthy(P2().organs && P2().organs["ม้ามโต"]?.checked)) s.add("ม้ามโต");
        if (truthy(P2().organs && P2().organs["ขาบวม"]?.checked)) s.add("ขาบวม");
        // 10. เด่น x3
        if (has(colors(),"มันเงา")) s.add("มันเงา (x3)", 3);
        if (scaleKey("peel")) s.add("ลอก (x3)", 3);
        return s;
      }
    },

    {
      key: "eczema",
      label: "Eczematous drug eruption (Type IV)",
      eval() {
        const s = mkScoreBox();
        // 1. รูปร่าง
        if (has(shapes(),"ตุ่มนูน")) s.add("ตุ่มนูน");
        if (has(shapes(),"ปื้นแดง")) s.add("ปื้นแดง");
        // 2. สี
        if (has(colors(),"แดง")) s.add("แดง");
        // 3. สำคัญ x2
        if (itch()) s.add("คัน (x2)", 2);
        // 4. เพิ่มเติม
        if (has(shapes(),"นูนหนา")) s.add("นูนหนา");
        if (has(shapes(),"ปื้นแดง")) s.add("ผื่นแดง");
        // 5. อื่นๆ
        if (has(shapes(),"จุดเล็กแดง")) s.add("จุดเล็กแดง");
        if (exu("serous")) s.add("น้ำเหลือง");
        if (exu("crust")) s.add("สะเก็ด");
        // 6. ตำแหน่ง
        ["ลำตัว","แขน","ขา","หน้า","ลำคอ"].forEach(L=>{ if (has(locs(),L)) s.add("ตำแหน่ง: "+L); });
        // 7. เวลา
        if (onsetAny(["1to6h","6to24h","1w","2w","3w"])) s.add("เวลาเข้าเกณฑ์");
        // 8. อาจพบ x2
        if (scaleKey("scale")) s.add("ขุย (x2)", 2);
        if (scaleKey("dry")) s.add("แห้ง (x2)", 2);
        if (scaleKey("peel")) s.add("ลอก (x2)", 2);
        // 9. การกระจาย
        if (distribution()==="สมมาตร") s.add("สมมาตร");
        // 10. ตุ่มน้ำ
        if (blisters("small")) s.add("ตุ่มน้ำเล็ก");
        if (blisters("medium")) s.add("ตุ่มน้ำกลาง");
        if (blisters("large")) s.add("ตุ่มน้ำใหญ่");
        return s;
      }
    },

    {
      key: "bullous",
      label: "Bullous drug eruption (Type IV)",
      eval() {
        const s = mkScoreBox();
        // 1. รูปร่าง
        if (blisters("small")) s.add("ตุ่มน้ำขนาดเล็ก");
        if (has(shapes(),"พอง")) s.add("พอง");
        if (has(shapes(),"ผิวหนังตึง")) s.add("ตึง");
        // 2. สี
        if (has(colors(),"แดง")) s.add("แดง");
        // 3. สำคัญ x2
        if (blisters("medium")) s.add("ตุ่มน้ำขนาดกลาง (x2)", 2);
        if (blisters("large")) s.add("ตุ่มน้ำขนาดใหญ่ (x2)", 2);
        // 4. เพิ่มเติม
        if (painKey("sore")) s.add("เจ็บ");
        if (painKey("burn")) s.add("แสบ");
        // 5. สีด้านใน (ใส) x3 — อนุมานจากสีผิว "ใส"
        if (has(colors(),"ใส")) s.add("ภายในใส (x3)", 3);
        // 6. ตำแหน่ง
        ["ลำตัว","แขน","ขา","เท้า"].forEach(L=>{ if (has(locs(),L)) s.add("ตำแหน่ง: "+L); });
        // 7. เวลา
        if (onsetAny(["1to6h","6to24h","1w","2w","3w"])) s.add("เวลาเข้าเกณฑ์");
        return s;
      }
    },

    {
      key: "serumSickness",
      label: "Serum sickness (Type III)",
      eval() {
        const s = mkScoreBox();
        // 1. อาการ
        if (has(shapes(),"ตุ่มนูน")) s.add("ตุ่มนูน");
        if (has(colors(),"แดง")) s.add("แดง");
        if (swelling()) s.add("บวม");
        if (itch()) s.add("คัน");
        // 2. สำคัญ x2
        if (P2has("misc.fever")) s.add("ไข้ >37.5°C (x2)", 2);
        // 3. อวัยวะ
        if (truthy(P2().organs && P2().organs["ต่อมน้ำเหลืองโต"]?.checked)) s.add("ต่อมน้ำเหลืองโต");
        if (organFlag("nephritis")) s.add("ไตอักเสบ");
        // 4. Lab
        const protein = lab("ua.protein.value"); if (protein > 0) s.add("protein +");
        // C3/C4 ไม่พร้อมก็ข้าม
        // 5. เวลา
        if (onsetAny(["1to6h","6to24h","1w","2w","3w"])) s.add("เวลาเข้าเกณฑ์");
        // 6. Lab2 RBC (ไม่บังคับ)
        // 7. ระบบอื่น x2
        if (P2has('msk')) {
          // map จาก page2 (ปวดข้อ/ข้ออักเสบ)
          s.add("ปวดข้อ/ข้ออักเสบ (x2)", 2);
        }
        // 8. ตำแหน่ง
        ["รอบดวงตา","มือ","เท้า","ลำตัว","แขน","ขา"].forEach(L=>{ if (has(locs(),L)) s.add("ตำแหน่ง: "+L); });
        return s;
      }
    },

    {
      key: "vasculitis",
      label: "Vasculitis (Type III)",
      eval() {
        const s = mkScoreBox();
        // 1. อาการผิว
        if (has(shapes(),"ตุ่มนูน")) s.add("ตุ่มนูน");
        if (has(shapes(),"ปื้นแดง")) s.add("ผื่นแดง/ปื้นแดง");
        if (has(colors(),"แดง")) s.add("แดง");
        // 2. ระบบอื่น
        if (P2has("misc.fever")) s.add("ไข้");
        // arthralgia/arthritis/myalgia/lymph
        if (P2has("msk")) s.add("ปวดข้อ/ข้ออักเสบ/กล้ามเนื้อ");
        if (truthy(P2().organs && P2().organs["ต่อมน้ำเหลืองโต"]?.checked)) s.add("ต่อมน้ำเหลืองโต");
        // 3. อวัยวะ
        if (organFlag("nephritis") || organFlag("kidneyFail")) s.add("ไตอักเสบ/ไตวาย");
        // 4. อาการเลือดออก
        if (resp("hemoptysis") || misc("ไอเป็นเลือด")) s.add("ไอเป็นเลือด/ถุงลมเลือดออก");
        if (misc("เลือดออกในทางเดินอาหาร")) s.add("เลือดออก GI");
        // 5. เวลา
        if (onsetAny(["1to6h","6to24h","1w","2w","3w"])) s.add("เวลาเข้าเกณฑ์");
        // 6–7 labs (protein+, C3/C4, Cr↑) — ใส่ได้เมื่อ page3 พร้อม
        const protein = lab("ua.protein.value"); if (protein > 0) s.add("protein +");
        const cr = lab("rft.cr.value"); if (cr >= 0.3) s.add("Creatinine ↑");
        // 8. เด่น x2
        if (misc("ปื้น/จ้ำเลือด") || misc("จ้ำเลือด")) s.add("จ้ำเลือด (x2)", 2);
        if (has(locs(),"ขา")) s.add("ตำแหน่งขา (x2)", 2);
        return s;
      }
    },

    {
      key: "hemolytic",
      label: "Hemolytic anemia (Type II)",
      eval() {
        const s = mkScoreBox();
        // 1. สำคัญ x2
        if (has(colors(),"ซีด")) s.add("ซีด (x2)", 2);
        if (gi("nausea")) {/*no-op*/} // ไม่เกี่ยวโดยตรง
        if (P2has('gi')) {/*no-op*/}
        if (P2has("gi") && misc("ดีซ่าน (ตัวเหลือง/ตาเหลือง)")) s.add("ดีซ่าน (x2)", 2);
        // 2. ระบบอื่น x3
        if (misc("ปัสสาวะสีชา/สีดำ")) s.add("ปัสสาวะสีชา/สีดำ (x3)", 3);
        // 3. อวัยวะ
        if (organFlag("kidneyFail")) s.add("ไตวาย");
        // 6. Hb drop x3 (ต้องใช้ lab หลังอัปเดต)
        // 7. LDH สูง (รอ lab)
        // 8. BP
        if (cv("hypotension")) s.add("BP ต่ำ");
        if (cv("shock")) s.add("BP ลดลง ≥40");
        // 9. อื่น
        if (truthy(P2().gu && P2().gu["ปวดหลังส่วนเอว"]?.checked)) s.add("ปวดหลังส่วนเอว");
        if (truthy(P2().gi && P2().gi["ปวดแน่นชายโครงขวา"]?.checked)) s.add("ปวดแน่นชายโครงขวา");
        // เวลา
        if (onsetAny(["1to6h","6to24h","1w"])) s.add("เวลาเข้าเกณฑ์");
        return s;
      }
    },

    {
      key: "pancytopenia",
      label: "Pancytopenia (Type II)",
      eval() {
        const s = mkScoreBox();
        // 1. อาการ
        if (has(colors(),"ซีด")) s.add("ซีด");
        if (P2has("misc.fatigue")) s.add("อ่อนเพลีย");
        // 2. ระบบอื่น
        if (misc("ปัสสาวะสีชา/สีดำ")) s.add("ปัสสาวะสีชา/สีดำ");
        if (P2has("misc.chill")) s.add("หนาวสั่น");
        if (P2has("misc.soreThroat")) s.add("เจ็บคอ");
        if (truthy(P2().gi && P2().gi["แผลในปาก"]?.checked)) s.add("แผลในปาก");
        // 3. ผิดปกติ x3 (เลือดออกง่าย)
        if (misc("จุดเลือดออก")) s.add("จุดเลือดออก (x3)", 3);
        if (misc("ฟกช้ำ")) s.add("ฟกช้ำ (x3)", 3);
        if (truthy(P2().ent && P2().ent["เลือดกำเดาไหล"]?.checked)) s.add("เลือดกำเดาไหล (x3)", 3);
        if (truthy(P2().gi && P2().gi["เหงือกเลือดออก"]?.checked)) s.add("เหงือกเลือดออก (x3)", 3);
        // 4. HR สูง
        if (HR() > 100 || P2().examHRHigh) s.add("HR >100");
        // 5–10 labs (Hb/Hct/WBC/Plt) — จะคิดจริงเมื่อ page3 เสร็จ
        const hb  = lab("cbc.hb.value");  if (hb > 0 && hb < 10) s.add("Hb <10 g/dL (x2)", 2);
        const hct = lab("cbc.hct.value"); if (hct > 0 && hct < 30) s.add("Hct <30% (x2)", 2);
        const wbc = lab("cbc.wbc.value"); if (wbc > 0 && wbc < 4000) s.add("WBC <4000 (x2)", 2);
        const plt = lab("cbc.plt.value"); if (plt > 0 && plt < 100000) s.add("Plt <100,000 (x2)", 2);
        // เวลา
        if (onsetAny(["1to6h","6to24h","1w","2w"])) s.add("เวลาเข้าเกณฑ์");
        return s;
      }
    },

    {
      key: "neutropenia",
      label: "Neutropenia (Type II)",
      eval() {
        const s = mkScoreBox();
        if (P2has("misc.chill")) s.add("หนาวสั่น");
        if (P2has("misc.soreThroat")) s.add("เจ็บคอ");
        if (truthy(P2().gi && P2().gi["แผลในปาก"]?.checked)) s.add("แผลในปาก");
        if (P2has("misc.fever")) s.add("ไข้");
        if (organFlag("pneumonia")) s.add("ปอดอักเสบ");
        const anc = lab("cbc.anc.value");
        if (anc > 0 && anc < 1500) s.add("ANC <1500 (x4)", 4);
        if (onsetAny(["1to6h","6to24h","1w","2w","3w"])) s.add("เวลาเข้าเกณฑ์");
        return s;
      }
    },

    {
      key: "thrombocytopenia",
      label: "Thrombocytopenia (Type II)",
      eval() {
        const s = mkScoreBox();
        // 1. อาการ x2
        if (misc("จุดเลือดออก")) s.add("จุดเลือดออก (x2)", 2);
        if (misc("ปื้น/จ้ำเลือด")) s.add("ปื้น/จ้ำเลือด (x2)", 2);
        // 2. ระบบอื่น
        if (truthy(P2().gi && P2().gi["เหงือกเลือดออก"]?.checked)) s.add("เหงือกเลือดออก");
        if (misc("เลือดออกในทางเดินอาหาร")) s.add("เลือดออก GI");
        if (truthy(P2().gu && P2().gu["ปัสสาวะเลือดออก"]?.checked)) s.add("ปัสสาวะเลือดออก");
        // 3. Lab
        const plt = lab("cbc.plt.value"); if (plt > 0 && plt < 150000) s.add("Plt <150,000");
        // 4. เวลา
        if (onsetAny(["1to6h","6to24h","1w"])) s.add("เวลาเข้าเกณฑ์");
        return s;
      }
    },

    {
      key: "nephritis",
      label: "Nephritis (Type II)",
      eval() {
        const s = mkScoreBox();
        // 1. อาการ
        if (P2has("misc.fever")) s.add("ไข้");
        if (P2has("msk")) s.add("ปวดข้อ");
        if (P2has("misc.fatigue")) s.add("อ่อนเพลีย");
        // 2. ระบบปัสสาวะ
        if (misc("ปัสสาวะออกน้อย")) s.add("ปัสสาวะออกน้อย");
        if (misc("ปัสสาวะขุ่น")) s.add("ปัสสาวะขุ่น");
        // 3. อวัยวะ
        if (truthy(P2().organs && P2().organs["ขาบวม"]?.checked)) s.add("ขาบวม");
        if (swelling()) s.add("บวม");
        // 4. Lab
        const cr = lab("rft.cr.value"); if (cr >= 0.3) s.add("Creatinine ↑ (x3)", 3);
        const egfr = lab("rft.egfr.value"); if (egfr > 0 && egfr < 60) s.add("eGFR <60 (x3)", 3);
        // 5. เวลา
        if (onsetAny(["1to6h","6to24h","1w","2w"])) s.add("เวลาเข้าเกณฑ์");
        return s;
      }
    },
  ];

  // ---------------------------------------------------------------------------
  // Public compute: คืนรายการ {key,label,total,tokens[]}
  // ---------------------------------------------------------------------------
  function computeAll() {
    const results = [];
    for (const R of RULES) {
      try {
        const box = R.eval();
        if (!box || !Number.isFinite(box.total)) continue;
        results.push({ key: R.key, label: R.label, total: box.total, tokens: box.tokens });
      } catch (e) {
        // ป้องกันทั้งระบบล้ม
        results.push({ key: R.key, label: R.label, total: 0, tokens: [{label:"(rule error suppressed)", w:0}] });
      }
    }
    results.sort((a,b)=>b.total - a.total);
    return results;
  }

  // export
  window.brainRules = { computeAll };
})();

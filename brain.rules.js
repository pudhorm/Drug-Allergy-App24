// ===================== brain.rules.js (REPLACE WHOLE FILE) =====================
// สมองประเมิน ADR — โหมด C: ใช้ token/เงื่อนไขต่อ-ADR แบบไม่แชร์กัน
// รองรับ 2 โหมดพร้อมกัน:
//   • window.brainRules_vEval = { computeAll, __rules }   // เครื่องยนต์ประเมินแบบ eval (ของเดิม)
//   • window.brainRules       = [ {id,name,tokens:[key|{key,w}]} ]  // โหมด token ที่ brain.js ใช้ทำกราฟ

(function () {
  // ---------------------------------------------------------------------------
  // Helpers (numeric & safe getters)
  // ---------------------------------------------------------------------------
  function num(v) {
    const n = Number(String(v ?? "").toString().replace(/[, ]+/g, ""));
    return Number.isFinite(n) ? n : NaN;
  }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function has(arrLike, val) { return arr(arrLike).includes(val); }
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

  // หน้า 2: vital proxy
  function HR(){ return num(P2().HR); }
  function RR(){ return num(P2().RR); }
  function SpO2(){ return num(P2().SpO2); }

  // หน้า 3: labs (ยังไม่บังคับต้องมี)
  function lab(path) {
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
  // ADR RULES (แบบ eval ของเดิม) — ครบ 21 รายการ
  // ---------------------------------------------------------------------------
  const RULES = [
    // Type I / pseudoallergy
    {
      key: "urticaria",
      label: "Urticaria (Type I / Pseudoallergy)",
      eval() {
        const s = mkScoreBox();
        if (has(shapes(), "ขอบหยัก")) s.add("ขอบหยัก");
        if (has(shapes(), "วงกลม")) s.add("วงกลม");
        if (has(shapes(), "ขอบวงนูนแดงด้านในเรียบ")) s.add("ขอบวงนูนแดงด้านในเรียบ");
        ["แดง","แดงซีด","ซีด","สีผิวปกติ"].forEach(c => { if (has(colors(), c)) s.add("สี: "+c); });
        if (has(shapes(), "ตุ่มนูน")) s.add("ตุ่มนูน (x2)", 2);
        if (has(shapes(), "ปื้นนูน")) s.add("ปื้นนูน (x2)", 2);
        if (itch()) s.add("คัน");
        if (swelling()) s.add("บวม (พบไม่บ่อย)");
        ["ทั่วร่างกาย","มือ","เท้า","แขน","ขา","หน้า","รอบดวงตา","ลำคอ","ลำตัว","หลัง"].forEach(L=>{
          if (has(locs(), L)) s.add("ตำแหน่ง: "+L);
        });
        if (onset() === "1h") s.add("ภายใน 1 ชั่วโมง");
        return s;
      }
    },
    {
      key: "anaphylaxis",
      label: "Anaphylaxis (Type I / Pseudoallergy)",
      eval() {
        const s = mkScoreBox();
        ["ตุ่มนูน","ปื้นนูน","บวม","นูนหนา","ผิวหนังตึง"].forEach(shape=>{
          if (has(shapes(), shape)) s.add("รูปร่าง: "+shape);
        });
        if (resp("wheeze")) s.add("หายใจมีเสียงวี๊ด (x2)", 2);
        if (resp("dyspnea") || RR() > 21 || HR() > 100 || (SpO2() > 0 && SpO2() < 94)) s.add("หอบเหนื่อย/หายใจลำบาก (x2)", 2);
        if (itch()) s.add("คัน");
        ["แดง","สีผิวปกติ"].forEach(c => { if (has(colors(), c)) s.add("สีผิว: "+c); });
        if (gi("diarrhea")) s.add("ท้องเสีย (พบไม่บ่อย)");
        if (gi("dysphagia")) s.add("กลืนลำบาก (พบไม่บ่อย)");
        if (gi("cramp")) s.add("ปวดบิดท้อง (พบไม่บ่อย)");
        if (gi("nausea")) s.add("คลื่นไส้/อาเจียน (พบไม่บ่อย)");
        if (onsetAny(["1h","1to6h"])) s.add("ระยะเวลาเข้าเกณฑ์ (≤6ชม.)");
        if (cv("hypotension")) s.add("BP ต่ำ (<90/60)");
        if (cv("shock")) s.add("BP ลดลง ≥40 mmHg ของ baseline systolic เดิม");
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
        if (has(shapes(), "นูนหนา")) s.add("นูนหนา");
        if (has(shapes(), "ขอบไม่ชัดเจน")) s.add("ขอบไม่ชัดเจน");
        ["สีผิวปกติ","แดง"].forEach(c => { if (has(colors(), c)) s.add("สี: "+c); });
        if (swelling()) s.add("บวม (x2)", 2);
        if (has(shapes(), "ผิวหนังตึง")) s.add("ผิวหนังตึง");
        if (itch()) s.add("คัน (พบน้อย)");
        if (!itch()) s.add("ไม่คัน (พบน้อย)");
        if (painKey("pain")) s.add("ปวด (พบน้อย)");
        if (painKey("burn")) s.add("แสบ (พบน้อย)");
        ["ริมฝีปาก","รอบดวงตา","ลิ้น","อวัยวะเพศ"].forEach(L=>{ if (has(locs(), L)) s.add("ตำแหน่ง: "+L); });
        if (onset() === "1h") s.add("ภายใน 1 ชั่วโมง");
        return s;
      }
    },

    // Type IV (ผิวหนัง)
    {
      key: "mpr",
      label: "Maculopapular rash (Type IV)",
      eval() {
        const s = mkScoreBox();
        if (has(shapes(),"ปื้นแดง")) s.add("ปื้นแดง");
        if (has(shapes(),"ปื้นนูน")) s.add("ปื้นนูน");
        if (has(shapes(),"ตุ่มนูน")) s.add("ตุ่มนูน");
        if (has(colors(),"แดง")) s.add("สีแดง");
        if (has(shapes(),"จุดเล็กแดง")) s.add("จุดเล็กแดง (x2)", 2);
        if (itch()) s.add("คัน");
        if (truthy(P2has("misc.fever") || num(P3()?.cbc?.eosPct?.value) > 5)) s.add("ไข้/Eosinophil >5%");
        if (distribution()==="สมมาตร") s.add("การกระจาย: สมมาตร");
        ["ลำตัว","แขน","หน้า","ลำคอ"].forEach(L=>{ if (has(locs(), L)) s.add("ตำแหน่ง: "+L); });
        if (onsetAny(["1to6h","6to24h","1w","2w"])) s.add("ระยะเวลาเข้าเกณฑ์");
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
        if (has(shapes(),"วงกลม")) s.add("วงกลม");
        if (has(shapes(),"วงรี")) s.add("วงรี");
        if (has(colors(),"แดง")) s.add("แดง");
        if (has(colors(),"ดำ/คล้ำ")) s.add("ดำ/คล้ำ");
        if (has(colors(),"ม่วง/คล้ำ")) s.add("ม่วง/คล้ำ (x3)", 3);
        if (detachKey("center")) s.add("ผิวหลุดลอกตรงกลาง");
        if (painKey("sore")) s.add("เจ็บ");
        if (painKey("burn")) s.add("แสบ");
        if (has(shapes(),"ผิวหนังตึง")) s.add("ตึง");
        if (swelling()) s.add("บวม (พบน้อย)");
        if (blisters("small")) s.add("ตุ่มน้ำขนาดเล็ก (พบน้อย)");
        if (blisters("medium")) s.add("ตุ่มน้ำขนาดกลาง (พบน้อย)");
        if (blisters("large")) s.add("ตุ่มน้ำขนาดใหญ่ (พบน้อย)");
        ["ริมฝีปาก","หน้า","มือ","เท้า","แขน","ขา","อวัยวะเพศ","ตำแหน่งเดิมกับครั้งก่อน"].forEach(L=>{
          if (has(locs(), L)) s.add("ตำแหน่ง: "+L);
        });
        if (onsetAny(["1w","2w"])) s.add("ภายใน 1–2 สัปดาห์");
        if (P2has("misc.fever")) s.add("ไข้");
        if (gi("nausea")) s.add("คลื่นไส้/อาเจียน");
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
        if (has(shapes(),"ปื้นแดง")) s.add("ผื่น/ปื้นแดง");
        if (has(colors(),"แดง")) s.add("สีแดง");
        if (has(colors(),"เหลือง")) s.add("สีเหลือง");
        if (truthy(P1().pustule && P1().pustule.has)) s.add("ตุ่มหนอง (x3)", 3);
        if (swelling()) s.add("บวม");
        if (itch()) s.add("คัน");
        if (painKey("sore")) s.add("เจ็บ");
        if (misc("ปื้น/จ้ำเลือด")) s.add("ปื้น/จ้ำเลือด");
        if (scaleKey("dry"))  s.add("แห้ง");
        if (scaleKey("peel")) s.add("ลอก");
        if (scaleKey("scale")) s.add("ขุย");
        ["หน้า","รักแร้","ทั่วร่างกาย","ขาหนีบ"].forEach(L=>{ if (has(locs(),L)) s.add("ตำแหน่ง: "+L); });
        if (onsetAny(["6to24h","1w","2w","3w"])) s.add("เวลาเข้าเกณฑ์");
        if (P2has("misc.fever")) s.add("ไข้ >37.5°C");
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
        if (has(colors(),"ดำ/คล้ำ")) s.add("ดำ/คล้ำ");
        if (has(colors(),"เทา")) s.add("เทา");
        if (has(colors(),"แดง")) s.add("แดง");
        if (detachKey("lt10")) s.add("ผิวหนังหลุดลอก ≤10% BSA (x3)", 3);
        if (exu("serous")) s.add("น้ำเหลือง");
        if (blisters("small")) s.add("ตุ่มน้ำเล็ก");
        if (blisters("medium")) s.add("ตุ่มน้ำกลาง");
        if (blisters("large")) s.add("ตุ่มน้ำใหญ่");
        if (exu("crust")) s.add("สะเก็ด");
        if (has(locs(),"ลำตัว")) s.add("ลำตัว");
        if (onsetAny(["1to6h","6to24h","1w","2w","3w"])) s.add("เวลาเข้าเกณฑ์");
        if (P2has("misc.fever")) s.add("ไข้");
        if (P2has("misc.fatigue") || P2has("msk") ) s.add("ปวดเมื่อยกล้ามเนื้อ/อ่อนเพลีย");
        if (gi("nausea")) s.add("คลื่นไส้/อาเจียน");
        if (misc("เลือดออกในทางเดินอาหาร")) s.add("เลือดออกในทางเดินอาหาร");
        if (mucosalGt1()) s.add("จำนวนผื่นบริเวณเยื่อบุ > 1 (mucosal)");
        return s;
      }
    },
    {
      key: "ten",
      label: "TEN (Type IV)",
      eval() {
        const s = mkScoreBox();
        if (has(shapes(),"ปื้นแดง")) s.add("ปื้นแดง");
        if (has(shapes(),"วงกลม")) s.add("เป้าธนูไม่ครบ 3 ชั้น (อนุมานจากวง)");
        if (has(colors(),"แดง")) s.add("แดง");
        if (has(colors(),"ดำ/คล้ำ")) s.add("ดำ/คล้ำ");
        if (detachKey("gt30")) s.add("ผิวหนังหลุดลอก >30% BSA (x3)", 3);
        if (blisters("large")) s.add("ตุ่มน้ำขนาดใหญ่");
        if (exu("serous")) s.add("น้ำเหลือง");
        if (exu("crust")) s.add("สะเก็ด");
        if (has(colors(),"ซีด")) s.add("ซีด");
        if (misc("เลือดออกในทางเดินอาหาร")) s.add("เลือดออก GI");
        if (gi("dysphagia")) s.add("กลืนลำบาก");
        ["ลำตัว","แขน","ขา","หน้า","มือ","เท้า","ศีรษะ","ทั่วร่างกาย","ริมฝีปาก"].forEach(L=>{
          if (has(locs(),L)) s.add("ตำแหน่ง: "+L);
        });
        if (onsetAny(["1w","2w","3w"])) s.add("เวลา 1–3 สัปดาห์");
        if (P2has("misc.fever")) s.add("ไข้");
        if (P2has("misc.fatigue") || P2has("msk")) s.add("ปวดเมื่อยกล้ามเนื้อ/อ่อนเพลีย");
        if (gi("nausea")) s.add("คลื่นไส้/อาเจียน");
        if (P2has("misc.soreThroat")) s.add("เจ็บคอ");
        if (gi("diarrhea")) s.add("ท้องเสีย");
        if (P2has("misc.conjunctivitis")) s.add("เยื่อบุตาอักเสบ");
        if (organFlag("kidneyFail")) s.add("ไตวาย");
        if (organFlag("hepatitis")) s.add("ตับอักเสบ");
        if (organFlag("pneumonia")) s.add("ปอดอักเสบ");
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
        if (has(shapes(),"ปื้นแดง") || has(shapes(),"ผื่นราบ")) s.add("ผื่น/ปื้นแดง");
        if (has(colors(),"แดง")) s.add("แดง");
        const eosPct = lab("cbc.eosPct.value");
        if (eosPct >= 10) s.add("Eosinophil ≥10% (x3)", 3);
        if (blisters("small")) s.add("ตุ่มน้ำเล็ก");
        if (blisters("medium")) s.add("ตุ่มน้ำกลาง");
        if (blisters("large")) s.add("ตุ่มน้ำใหญ่");
        if (misc("ปื้น/จ้ำเลือด")) s.add("จ้ำเลือด");
        ["หน้า","ลำตัว","แขน","ขา"].forEach(L=>{ if (has(locs(),L)) s.add("ตำแหน่ง: "+L); });
        if (P2has("misc.fever")) s.add("ไข้");
        if (onsetAny(["1w","2w","3w","4w"])) s.add("ระยะเวลา ≤4สัปดาห์ (ครอบช่วงส่วนหนึ่ง)");
        const alt = lab("lft.alt.value"), ast = lab("lft.ast.value");
        if ((alt >= 40) || (ast >= 40)) s.add("ALT/AST ≥ 40 U/L");
        const cr = lab("rft.cr.value"); if (cr >= 0.3) s.add("Creatinine ↑ เกณฑ์ AKI");
        const protein = lab("ua.protein.value"); if (protein > 0) s.add("Urine protein +");
        if (SpO2() > 0 && SpO2() < 94) s.add("SpO₂ <94%");
        if (P2has("misc.lymph") || truthy(P2().organs && P2().organs["ต่อมน้ำเหลืองโต"]?.checked)) s.add("ต่อมน้ำเหลืองโต");
        if (organFlag("hepatitis")) s.add("ตับอักเสบ");
        if (organFlag("nephritis") || organFlag("kidneyFail")) s.add("ไตอักเสบ/ไตวาย");
        if (organFlag("pneumonia")) s.add("ปอดอักเสบ");
        if (organFlag("myocarditis")) s.add("กล้ามเนื้อหัวใจอักเสบ");
        return s;
      }
    },

    // Type IV (ผิวหนัง — ต่อ)
    {
      key: "em",
      label: "Erythema multiforme (Type IV)",
      eval() {
        const s = mkScoreBox();
        if (has(shapes(),"ตุ่มนูน")) s.add("ตุ่มนูน");
        if (has(shapes(),"ขอบวงนูนแดงด้านในเรียบ")) s.add("ขอบวงนูนแดงด้านในเรียบ");
        if (has(colors(),"แดง")) s.add("แดง");
        if (has(colors(),"แดงซีด")) s.add("แดงซีด");
        if (has(shapes(),"วงกลม 3 ชั้น")) s.add("วงกลม 3 ชั้น (x3)", 3);
        if (blisters("small")) s.add("ตุ่มน้ำเล็ก");
        if (blisters("medium")) s.add("ตุ่มน้ำกลาง");
        if (exu("serous")) s.add("พอง/น้ำเหลือง");
        if (exu("crust")) s.add("สะเก็ด");
        if (onsetAny(["1to6h","6to24h","1w"])) s.add("เวลาเข้าเกณฑ์");
        ["มือ","เท้า","แขน","ขา","หน้า","ลำตัว","หลัง","ลำคอ"].forEach(L=>{ if (has(locs(),L)) s.add("ตำแหน่ง: "+L); });
        if (has(locs(),"ทวาร") || has(locs(),"อวัยวะเพศ")) s.add("มิวโคซาเกี่ยวข้อง (อนุมาน)");
        return s;
      }
    },
    {
      key: "photosens",
      label: "Photosensitivity drug eruption (Type IV)",
      eval() {
        const s = mkScoreBox();
        if (has(shapes(),"ขอบเขตชัด")) s.add("ขอบเขตชัด");
        if (has(shapes(),"ปื้นแดง")) s.add("ปื้นแดง");
        if (has(shapes(),"จุดเล็กแดง")) s.add("จุดแดงเล็ก");
        if (has(colors(),"ดำ/คล้ำ")) s.add("ดำ/คล้ำ");
        if (has(colors(),"แดง")) s.add("แดง");
        if (has(colors(),"แดงไหม้")) s.add("แดงไหม้ (x2)", 2);
        if (exu("serous")) s.add("น้ำเหลือง");
        if (exu("crust")) s.add("สะเก็ด");
        if (blisters("small")) s.add("ตุ่มน้ำเล็ก");
        if (blisters("medium")) s.add("ตุ่มน้ำกลาง");
        if (blisters("large")) s.add("ตุ่มน้ำใหญ่");
        if (scaleKey("peel")) s.add("ลอก");
        if (scaleKey("scale")) s.add("ขุย");
        if (itch()) s.add("คัน");
        ["หน้า","มือ","แขน","ขา"].forEach(L=>{ if (has(locs(),L)) s.add("ตำแหน่ง: "+L); });
        if (onsetAny(["1h","1to6h","6to24h","1w"])) s.add("เวลาเข้าเกณฑ์");
        if (painKey("burn")) s.add("แสบเด่น (x2)", 2);
        return s;
      }
    },
    {
      key: "exfol",
      label: "Exfoliative dermatitis (Type IV)",
      eval() {
        const s = mkScoreBox();
        if (has(shapes(),"ผิวหนังตึง")) s.add("ผิวหนังตึง");
        if (has(colors(),"แดง")) s.add("แดง");
        if (scaleKey("dry"))  s.add("แห้ง (x3)", 3);
        if (scaleKey("scale")) s.add("ขุย (x3)", 3);
        if (itch()) s.add("คัน");
        ["ทั่วร่างกาย","มือ","เท้า","ศีรษะ"].forEach(L=>{ if (has(locs(),L)) s.add("ตำแหน่ง: "+L); });
        if (onsetAny(["3w","1to6h","6to24h","1w","2w","4w"])) s.add("เวลาเข้าเกณฑ์");
        if (P2has("misc.fever")) s.add("ไข้");
        if (P2has("misc.chill")) s.add("หนาวสั่น");
        if (P2has("misc.fatigue")) s.add("อ่อนเพลีย");
        if (gi("nausea")) s.add("ดีซ่าน/ตับ (อนุมาน)");
        if (truthy(P2().organs && P2().organs["ต่อมน้ำเหลืองโต"]?.checked)) s.add("ต่อมน้ำเหลืองโต");
        if (truthy(P2().organs && P2().organs["ตับโต"]?.checked)) s.add("ตับโต");
        if (truthy(P2().organs && P2().organs["ม้ามโต"]?.checked)) s.add("ม้ามโต");
        if (truthy(P2().organs && P2().organs["ขาบวม"]?.checked)) s.add("ขาบวม");
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
        if (has(shapes(),"ตุ่มนูน")) s.add("ตุ่มนูน");
        if (has(shapes(),"ปื้นแดง")) s.add("ปื้นแดง");
        if (has(colors(),"แดง")) s.add("แดง");
        if (itch()) s.add("คัน (x2)", 2);
        if (has(shapes(),"นูนหนา")) s.add("นูนหนา");
        if (has(shapes(),"ปื้นแดง")) s.add("ผื่นแดง");
        if (has(shapes(),"จุดเล็กแดง")) s.add("จุดเล็กแดง");
        if (exu("serous")) s.add("น้ำเหลือง");
        if (exu("crust")) s.add("สะเก็ด");
        ["ลำตัว","แขน","ขา","หน้า","ลำคอ"].forEach(L=>{ if (has(locs(),L)) s.add("ตำแหน่ง: "+L); });
        if (onsetAny(["1to6h","6to24h","1w","2w","3w"])) s.add("เวลาเข้าเกณฑ์");
        if (scaleKey("scale")) s.add("ขุย (x2)", 2);
        if (scaleKey("dry")) s.add("แห้ง (x2)", 2);
        if (scaleKey("peel")) s.add("ลอก (x2)", 2);
        if (distribution()==="สมมาตร") s.add("สมมาตร");
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
        if (blisters("small")) s.add("ตุ่มน้ำขนาดเล็ก");
        if (has(shapes(),"พอง")) s.add("พอง");
        if (has(shapes(),"ผิวหนังตึง")) s.add("ตึง");
        if (has(colors(),"แดง")) s.add("แดง");
        if (blisters("medium")) s.add("ตุ่มน้ำขนาดกลาง (x2)", 2);
        if (blisters("large")) s.add("ตุ่มน้ำขนาดใหญ่ (x2)", 2);
        if (painKey("sore")) s.add("เจ็บ");
        if (painKey("burn")) s.add("แสบ");
        if (has(colors(),"ใส")) s.add("ภายในใส (x3)", 3);
        ["ลำตัว","แขน","ขา","เท้า"].forEach(L=>{ if (has(locs(),L)) s.add("ตำแหน่ง: "+L); });
        if (onsetAny(["1to6h","6to24h","1w","2w","3w"])) s.add("เวลาเข้าเกณฑ์");
        return s;
      }
    },

    // Type III (Immune complex)
    {
      key: "serumSickness",
      label: "Serum sickness (Type III)",
      eval() {
        const s = mkScoreBox();
        if (has(shapes(),"ตุ่มนูน")) s.add("ตุ่มนูน");
        if (has(colors(),"แดง")) s.add("แดง");
        if (swelling()) s.add("บวม");
        if (itch()) s.add("คัน");
        if (P2has("misc.fever")) s.add("ไข้ >37.5°C (x2)", 2);
        if (truthy(P2().organs && P2().organs["ต่อมน้ำเหลืองโต"]?.checked)) s.add("ต่อมน้ำเหลืองโต");
        if (organFlag("nephritis")) s.add("ไตอักเสบ");
        const protein = lab("ua.protein.value"); if (protein > 0) s.add("protein +");
        if (onsetAny(["1to6h","6to24h","1w","2w","3w"])) s.add("เวลาเข้าเกณฑ์");
        if (P2has('msk')) s.add("ปวดข้อ/ข้ออักเสบ (x2)", 2);
        ["รอบดวงตา","มือ","เท้า","ลำตัว","แขน","ขา"].forEach(L=>{ if (has(locs(),L)) s.add("ตำแหน่ง: "+L); });
        return s;
      }
    },
    {
      key: "vasculitis",
      label: "Vasculitis (Type III)",
      eval() {
        const s = mkScoreBox();
        if (has(shapes(),"ตุ่มนูน")) s.add("ตุ่มนูน");
        if (has(shapes(),"ปื้นแดง")) s.add("ผื่นแดง/ปื้นแดง");
        if (has(colors(),"แดง")) s.add("แดง");
        if (P2has("misc.fever")) s.add("ไข้");
        if (P2has("msk")) s.add("ปวดข้อ/ข้ออักเสบ/กล้ามเนื้อ");
        if (truthy(P2().organs && P2().organs["ต่อมน้ำเหลืองโต"]?.checked)) s.add("ต่อมน้ำเหลืองโต");
        if (organFlag("nephritis") || organFlag("kidneyFail")) s.add("ไตอักเสบ/ไตวาย");
        if (resp("hemoptysis") || misc("ไอเป็นเลือด")) s.add("ไอเป็นเลือด/ถุงลมเลือดออก");
        if (misc("เลือดออกในทางเดินอาหาร")) s.add("เลือดออก GI");
        if (onsetAny(["1to6h","6to24h","1w","2w","3w"])) s.add("เวลาเข้าเกณฑ์");
        const protein = lab("ua.protein.value"); if (protein > 0) s.add("protein +");
        const cr = lab("rft.cr.value"); if (cr >= 0.3) s.add("Creatinine ↑");
        if (misc("ปื้น/จ้ำเลือด") || misc("จ้ำเลือด")) s.add("จ้ำเลือด (x2)", 2);
        if (has(locs(),"ขา")) s.add("ตำแหน่งขา (x2)", 2);
        return s;
      }
    },

    // Type II (Cytotoxic)
    {
      key: "hemolytic",
      label: "Hemolytic anemia (Type II)",
      eval() {
        const s = mkScoreBox();
        if (has(colors(),"ซีด")) s.add("ซีด (x2)", 2);
        if (misc("ปัสสาวะสีชา/สีดำ")) s.add("ปัสสาวะสีชา/สีดำ (x3)", 3);
        if (organFlag("kidneyFail")) s.add("ไตวาย");
        if (cv("hypotension")) s.add("BP ต่ำ");
        if (cv("shock")) s.add("BP ลดลง ≥40");
        if (truthy(P2().gu && P2().gu["ปวดหลังส่วนเอว"]?.checked)) s.add("ปวดหลังส่วนเอว");
        if (truthy(P2().gi && P2().gi["ปวดแน่นชายโครงขวา"]?.checked)) s.add("ปวดแน่นชายโครงขวา");
        if (onsetAny(["1to6h","6to24h","1w"])) s.add("เวลาเข้าเกณฑ์");
        return s;
      }
    },
    {
      key: "pancytopenia",
      label: "Pancytopenia (Type II)",
      eval() {
        const s = mkScoreBox();
        if (has(colors(),"ซีด")) s.add("ซีด");
        if (P2has("misc.fatigue")) s.add("อ่อนเพลีย");
        if (misc("ปัสสาวะสีชา/สีดำ")) s.add("ปัสสาวะสีชา/สีดำ");
        if (P2has("misc.chill")) s.add("หนาวสั่น");
        if (P2has("misc.soreThroat")) s.add("เจ็บคอ");
        if (truthy(P2().gi && P2().gi["แผลในปาก"]?.checked)) s.add("แผลในปาก");
        if (misc("จุดเลือดออก")) s.add("จุดเลือดออก (x3)", 3);
        if (misc("ฟกช้ำ")) s.add("ฟกช้ำ (x3)", 3);
        if (truthy(P2().ent && P2().ent["เลือดกำเดาไหล"]?.checked)) s.add("เลือดกำเดาไหล (x3)", 3);
        if (truthy(P2().gi && P2().gi["เหงือกเลือดออก"]?.checked)) s.add("เหงือกเลือดออก (x3)", 3);
        if (HR() > 100 || P2().examHRHigh) s.add("HR >100");
        const hb  = lab("cbc.hb.value");  if (hb > 0 && hb < 10) s.add("Hb <10 g/dL (x2)", 2);
        const hct = lab("cbc.hct.value"); if (hct > 0 && hct < 30) s.add("Hct <30% (x2)", 2);
        const wbc = lab("cbc.wbc.value"); if (wbc > 0 && wbc < 4000) s.add("WBC <4000 (x2)", 2);
        const plt = lab("cbc.plt.value"); if (plt > 0 && plt < 100000) s.add("Plt <100,000 (x2)", 2);
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
        if (misc("จุดเลือดออก")) s.add("จุดเลือดออก (x2)", 2);
        if (misc("ปื้น/จ้ำเลือด")) s.add("ปื้น/จ้ำเลือด (x2)", 2);
        if (truthy(P2().gi && P2().gi["เหงือกเลือดออก"]?.checked)) s.add("เหงือกเลือดออก");
        if (misc("เลือดออกในทางเดินอาหาร")) s.add("เลือดออก GI");
        if (truthy(P2().gu && P2().gu["ปัสสาวะเลือดออก"]?.checked)) s.add("ปัสสาวะเลือดออก");
        const plt = lab("cbc.plt.value"); if (plt > 0 && plt < 150000) s.add("Plt <150,000");
        if (onsetAny(["1to6h","6to24h","1w"])) s.add("เวลาเข้าเกณฑ์");
        return s;
      }
    },
    {
      key: "nephritis",
      label: "Nephritis (Type II)",
      eval() {
        const s = mkScoreBox();
        if (P2has("misc.fever")) s.add("ไข้");
        if (P2has("msk")) s.add("ปวดข้อ");
        if (P2has("misc.fatigue")) s.add("อ่อนเพลีย");
        if (misc("ปัสสาวะออกน้อย")) s.add("ปัสสาวะออกน้อย");
        if (misc("ปัสสาวะขุ่น")) s.add("ปัสสาวะขุ่น");
        if (truthy(P2().organs && P2().organs["ขาบวม"]?.checked)) s.add("ขาบวม");
        if (swelling()) s.add("บวม");
        const cr = lab("rft.cr.value"); if (cr >= 0.3) s.add("Creatinine ↑ (x3)", 3);
        const egfr = lab("rft.egfr.value"); if (egfr > 0 && egfr < 60) s.add("eGFR <60 (x3)", 3);
        if (onsetAny(["1to6h","6to24h","1w","2w"])) s.add("เวลาเข้าเกณฑ์");
        return s;
      }
    },
  ];

  // ---------------------------------------------------------------------------
  // Public compute (เครื่องยนต์ eval เดิม)
  // ---------------------------------------------------------------------------
  function computeAll() {
    const results = [];
    for (const R of RULES) {
      try {
        const box = R.eval();
        if (!box || !Number.isFinite(box.total)) continue;
        results.push({ key: R.key, label: R.label, total: box.total, tokens: box.tokens });
      } catch (e) {
        results.push({ key: R.key, label: R.label, total: 0, tokens: [{label:"(rule error suppressed)", w:0}] });
      }
    }
    results.sort((a,b)=>b.total - a.total);
    return results;
  }

  // expose โหมด eval (เก็บ rules ไว้ด้วย เผื่อภายนอกอยากอ่าน)
  window.brainRules_vEval = { computeAll, __rules: RULES };

  // ---------------------------------------------------------------------------
  // โหมด TOKEN สำหรับ brain.js (ใช้ทำกราฟ %) — ครบ 21 ADR
  // ใช้ key ที่สอดคล้องกับ collectSignals() ใน brain.js
  // ---------------------------------------------------------------------------
  window.brainRules = [
    // Type I / Pseudoallergy
    { id:"urticaria",   name:"Urticaria", tokens:[
      {key:"derm:คัน",w:3},{key:"shape:ปื้นนูน",w:2},{key:"shape:ตุ่มนูน",w:2},
      {key:"color:แดง",w:1},{key:"onset:1h",w:1},{key:"onset:1-6h",w:1}
    ]},
    { id:"anaphylaxis", name:"Anaphylaxis", tokens:[
      {key:"sys:wheeze",w:3},{key:"sys:dyspnea",w:3},{key:"sys:hypotension",w:4},
      {key:"sys:SpO2<94",w:3},{key:"onset:1h",w:2},{key:"onset:1-6h",w:2}
    ]},
    { id:"angioedema",  name:"Angioedema", tokens:[
      {key:"derm:บวม",w:4},{key:"shape:ผิวหนังตึง",w:1},{key:"derm:เจ็บ",w:1}
    ]},

    // Type IV (ผิวหนัง)
    { id:"mpr",         name:"Maculopapular rash", tokens:[
      {key:"shape:ปื้นนูน",w:1},{key:"shape:ปื้นแดง",w:2},{key:"color:แดง",w:1},
      {key:"derm:คัน",w:1},{key:"pos:สมาตร",w:1}
    ]},
    { id:"fde",         name:"Fixed drug eruption", tokens:[
      {key:"shape:วงกลม",w:2},{key:"shape:วงรี",w:1},{key:"color:ม่วง/คล้ำ",w:3},
      {key:"mucosa:>1",w:2},{key:"derm:ผิวหนังหลุดลอกตรงกลางผื่น",w:1}
    ]},
    { id:"agep",        name:"AGEP", tokens:[
      {key:"derm:ตุ่มหนอง",w:4},{key:"lab:WBC>11000",w:1},{key:"lab:Neut>75",w:1},
      {key:"sys:ไข้",w:1}
    ]},
    { id:"sjs",         name:"SJS", tokens:[
      {key:"derm:ผิวหลุด<10%",w:4},{key:"mucosa:>1",w:3},{key:"color:ดำ/คล้ำ",w:1}
    ]},
    { id:"ten",         name:"TEN", tokens:[
      {key:"derm:ผิวหลุด>30%",w:6},{key:"mucosa:>1",w:2},{key:"sys:SpO2<94",w:1}
    ]},
    { id:"dress",       name:"DRESS", tokens:[
      {key:"lab:Eo>=10",w:4},{key:"organ:hepatitis",w:3},{key:"organ:AKI",w:3},
      {key:"sys:ไข้",w:1}
    ]},
    { id:"em",          name:"Erythema multiforme", tokens:[
      {key:"shape:วงกลม 3 ชั้น",w:4},{key:"shape:ตุ่มนูน",w:1},{key:"color:แดง",w:1},
      {key:"mucosa:>1",w:1}
    ]},
    { id:"photosens",   name:"Photosensitivity drug eruption", tokens:[
      {key:"color:แดงไหม้",w:3},{key:"pos:หน้า",w:1},{key:"pos:มือ",w:1},{key:"derm:แสบ",w:1}
    ]},
    { id:"exfol",       name:"Exfoliative dermatitis", tokens:[
      {key:"derm:ลอก",w:3},{key:"derm:ขุย",w:3},{key:"color:มันเงา",w:2},{key:"sys:ไข้",w:1}
    ]},
    { id:"eczema",      name:"Eczematous drug eruption", tokens:[
      {key:"derm:คัน",w:3},{key:"shape:ปื้นแดง",w:1},{key:"derm:ขุย",w:1},{key:"derm:แห้ง",w:1}
    ]},
    { id:"bullous",     name:"Bullous drug eruption", tokens:[
      {key:"derm:ตุ่มน้ำกลาง",w:2},{key:"derm:ตุ่มน้ำใหญ่",w:3},{key:"derm:เจ็บ",w:1},{key:"color:ใส",w:2}
    ]},

    // Type III
    { id:"serumSickness", name:"Serum sickness", tokens:[
      {key:"sys:ไข้",w:2},{key:"lab:UA:protein+",w:2},{key:"organ:nephritis",w:2},{key:"derm:บวม",w:1}
    ]},
    { id:"vasculitis",  name:"Vasculitis", tokens:[
      {key:"derm:จุดเลือดออก",w:3},{key:"derm:ปื้น/จ้ำเลือด",w:3},{key:"lab:UA:protein+",w:1},{key:"lab:CrRise",w:1}
    ]},

    // Type II
    { id:"hemolytic",   name:"Hemolytic anemia", tokens:[
      {key:"color:ซีด",w:3},{key:"sys:ปัสสาวะสีชา/สีดำ",w:3},{key:"lab:LDHสูง",w:2}
    ]},
    { id:"pancytopenia", name:"Pancytopenia", tokens:[
      {key:"lab:Hb<10",w:2},{key:"lab:WBC<4000",w:2},{key:"lab:Plt<100k",w:2},{key:"sys:HR>100",w:1}
    ]},
    { id:"neutropenia", name:"Neutropenia", tokens:[
      {key:"organ:pneumonia",w:2},{key:"sys:ไข้",w:2},{key:"lab:AtypicalLym",w:1}
    ]},
    { id:"thrombocytopenia", name:"Thrombocytopenia", tokens:[
      {key:"derm:จุดเลือดออก",w:3},{key:"derm:ปื้น/จ้ำเลือด",w:3},{key:"lab:Plt<150k",w:2}
    ]},
    { id:"nephritis",   name:"Nephritis", tokens:[
      {key:"lab:CrRise",w:3},{key:"lab:eGFR<60",w:3},{key:"sys:ปัสสาวะออกน้อย",w:1},{key:"lab:UA:protein+",w:2}
    ]},
  ];
})();

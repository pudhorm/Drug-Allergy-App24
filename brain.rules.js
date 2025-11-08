// ===================== brain.rules.js (REPLACE WHOLE FILE) =====================
// โหมด C: "แมตช์ตรงตัว" ระหว่างสิ่งที่ผู้ใช้ติ้กในหน้า 1–3 กับเกณฑ์ของแต่ละ ADR
// แลปทุกตัวที่มี cutpoint จะถูกนำมาคิด "เฉพาะเมื่อผู้ใช้ติ๊กเลือก" ช่องนั้นเท่านั้น

(function () {
  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  function num(v) {
    const n = Number(String(v ?? "").toString().replace(/[, ]+/g, ""));
    return Number.isFinite(n) ? n : NaN;
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
  function norm(s) { return String(s || "").trim(); }
  function tok(prefix, name) { return prefix + ":" + norm(name); }

  // อ่าน metric ที่อาจอยู่ได้หลายรูปแบบ และเช็คว่า "ผู้ใช้ติ๊กเลือก" แล้วหรือยัง
  function readMetric(objOrNumber, siblingsOrNull, fieldNameHint) {
    let value = NaN, picked = false;
    if (objOrNumber && typeof objOrNumber === "object") {
      const o = objOrNumber;
      value = num(o.value ?? o.val ?? o.v ?? o.data ?? o.number);
      picked = !!(o.checked || o.has || o.use || o.selected || o.enable || o.enabled);
    } else {
      value = num(objOrNumber);
      if (siblingsOrNull && fieldNameHint) {
        const c1 = siblingsOrNull[fieldNameHint + "_checked"];
        const c2 = siblingsOrNull[fieldNameHint + "_has"];
        const c3 = siblingsOrNull[fieldNameHint + "_use"];
        picked = !!(c1 || c2 || c3);
      }
    }
    return { value, picked, hasValue: Number.isFinite(value) };
  }

  // ---------------------------------------------------------------------------
  // เก็บสัญญาณจากหน้า 1–3 เป็น Set ของโทเคน
  // ---------------------------------------------------------------------------
  function collectSignals(d) {
    const T = new Set();

    const p1 = (d && d.page1) || d.skin || {};
    const p2 = (d && d.page2) || d.other || {};
    const p3 = (d && d.page3) || d.lab || {};

    // -------- หน้า 1 --------
    const shapes = [].concat(p1.rashShapes || p1.shape || []);
    shapes.forEach(s => T.add(tok("shape", s)));

    const colors = [].concat(p1.rashColors || p1.color || []);
    colors.forEach(c => T.add(tok("color", c)));

    const borders = [].concat(p1.rashBorders || p1.border || []);
    borders.forEach(b => T.add(tok("border", b)));

    const blisters = [].concat(p1.blisterTypes || p1.blister || []);
    blisters.forEach(b => T.add(tok("blister", b)));
    if (p1.pustule && (p1.pustule.has || p1.pustule === true)) T.add("skin:ตุ่มหนอง");
    if (truthy(p1.bulla)) T.add("blister:พอง");

    const sd = p1.skinDetach || {};
    if (sd.center) T.add("peeling:ผิวหนังหลุดลอกตรงกลางผื่น");
    if (sd.lt10)   T.add("peeling:ไม่เกิน10%BSA");
    if (sd.gt30)   T.add("peeling:เกิน30%BSA");

    const itch = p1.itch || {};
    if (itch.has || itch === true) T.add("sym:คัน");
    if (itch.none === true) T.add("sym:ไม่คัน");
    const pain = p1.pain || {};
    if (pain.pain) T.add("sym:ปวด");
    if (pain.burning) T.add("sym:แสบ");
    if (pain.tight) T.add("sym:ตึง");

    const swelling = p1.swelling || {};
    if (swelling.has || swelling === true) T.add("sym:บวม");

    if (truthy(p1.crust))    T.add("skin:สะเก็ด");
    if (truthy(p1.serous))   T.add("skin:น้ำเหลือง");
    if (truthy(p1.dry))      T.add("skin:แห้ง");
    if (truthy(p1.scale))    T.add("skin:ขุย");
    if (truthy(p1.peel))     T.add("skin:ลอก");
    if (truthy(p1.shiny))    T.add("skin:มันเงา");
    if (colors.includes("ใส")) T.add("color:ใส");

    const locs = [].concat(p1.locations || p1.rashLocations || []);
    locs.forEach(l => T.add(tok("loc", l)));
    if (p1.distribution === "สมมาตร") T.add("dist:สมมาตร");

    const onset = norm(p1.onset || p1.timeline || "");
    if (onset) T.add(tok("onset", onset));

    // -------- หน้า 2 --------
    const r = p2.resp || {};
    if (truthy(r.wheeze))    T.add("resp:หายใจมีเสียงวี๊ด");
    if (truthy(r.dyspnea))   T.add("resp:หายใจลำบาก");
    if (truthy(r.tachypnea)) T.add("resp:หอบเหนื่อย");

    const cv = p2.cv || {};
    if (truthy(cv.hypotension)) T.add("cv:BPต่ำ");
    if (truthy(cv.shock))       T.add("cv:BPลดลง≥40");

    const gi = p2.gi || {};
    if (truthy(gi.diarrhea))  T.add("gi:ท้องเสีย");
    if (truthy(gi.dysphagia)) T.add("gi:กลืนลำบาก");
    if (truthy(gi.cramp))     T.add("gi:ปวดบิดท้อง");
    if (truthy(gi.nausea))    T.add("gi:คลื่นไส้อาเจียน");

    const misc = p2.misc || {};
    if (truthy(misc.fever))         T.add("sys:ไข้");
    if (truthy(misc.chill))         T.add("sys:หนาวสั่น");
    if (truthy(misc.fatigue))       T.add("sys:อ่อนเพลีย");
    if (truthy(misc.soreThroat))    T.add("sys:เจ็บคอ");
    if (truthy(misc.oralUlcer))     T.add("sys:แผลในปาก");
    if (truthy(misc.bleedingGI))    T.add("sys:เลือดออกในทางเดินอาหาร");
    if (truthy(misc.lymph))         T.add("sys:ต่อมน้ำเหลืองโต");
    if (truthy(misc.corneal))       T.add("sys:แผลกระจกตา");
    if (truthy(misc.conjunctivitis))T.add("sys:เยื่อบุตาอักเสบ");

    if (num(p2.HR) > 100) T.add("vital:HR>100");
    if (num(p2.RR) > 21)  T.add("vital:RR>21");
    if (num(p2.SpO2) > 0 && num(p2.SpO2) < 94) T.add("vital:SpO2<94");

    if (truthy(misc.hemorrhageSkin)) T.add("skin:ปื้น/จ้ำเลือด");
    if (truthy(misc.petechiae))     T.add("skin:จุดเลือดออก");
    if (truthy(p2.examHRHigh) || num(p2.HR) > 100) T.add("exam:HR>100");

    const org = p2.organs || {};
    if (truthy(org.kidneyFail)) T.add("org:ไตวาย");
    if (truthy(org.hepatitis))  T.add("org:ตับอักเสบ");
    if (truthy(org.pneumonia))  T.add("org:ปอดอักเสบ");
    if (truthy(org.myocarditis))T.add("org:กล้ามเนื้อหัวใจอักเสบ");

    // -------- หน้า 3: LABs → นับเมื่อ "ติ๊กเลือก" เท่านั้น --------
    const cbc = p3.cbc || {};
    { const m = readMetric(cbc.ANC ?? cbc.anc, cbc, "ANC"); if (m.picked && m.hasValue && m.value < 1500) T.add("lab:ANC<1500"); }
    { const m = readMetric(cbc.WBC ?? cbc.wbc, cbc, "WBC"); if (m.picked && m.hasValue && m.value < 4000) T.add("lab:WBC<4000"); }
    { const m = readMetric(cbc.Hb  ?? cbc.hb , cbc, "Hb" ); if (m.picked && m.hasValue && m.value < 10)    T.add("lab:Hb<10"); }
    { const m = readMetric(cbc.Hct ?? cbc.hct, cbc, "Hct"); if (m.picked && m.hasValue && m.value < 30)    T.add("lab:Hct<30"); }
    { const m = readMetric(cbc.Plt ?? cbc.plt, cbc, "Plt"); if (m.picked && m.hasValue && m.value < 100000)T.add("lab:Plt<100k"); }
    { const m = readMetric(cbc.eosinophilPct ?? cbc.eos, cbc, "eosinophilPct"); if (m.picked && m.hasValue && m.value >= 10) T.add("lab:Eos>=10%"); }
    { const m = readMetric(cbc.AEC ?? cbc.aec, cbc, "AEC"); if (m.picked && m.hasValue && m.value >= 1500) T.add("lab:AEC>=1500"); }

    const lft = p3.lft || {};
    { const m = readMetric(lft.ALT ?? lft.alt, lft, "ALT"); if (m.picked && m.hasValue && m.value >= 40) T.add("lab:ALT>=40"); }
    { const m = readMetric(lft.AST ?? lft.ast, lft, "AST"); if (m.picked && m.hasValue && m.value >= 40) T.add("lab:AST>=40"); }

    const rft = p3.rft || {};
    {
      const mCr   = readMetric(rft.Cr ?? rft.creatinine, rft, "Cr");
      const mGFR  = readMetric(rft.eGFR ?? rft.egfr, rft, "eGFR");
      const base  = num(rft.baselineCr);
      if (mCr.picked && mCr.hasValue) {
        const risen = (Number.isFinite(base) && mCr.value >= 1.5 * base) || (!Number.isFinite(base) && mCr.value >= 1.5);
        const delta = Number.isFinite(base) ? (mCr.value - base) : 0;
        if (risen || delta >= 0.3) T.add("lab:Cr↑>=0.3or1.5x");
      }
      if (mGFR.picked && mGFR.hasValue && mGFR.value < 60) T.add("lab:eGFR<60");
    }

    const ua = p3.ua || {};
    {
      const m = readMetric(ua.protein ?? ua.proteinPositive, ua, "protein");
      const asText = norm(ua.protein);
      if ((m.picked && (asText === "+" || asText === "positive")) || (m.picked && m.hasValue && m.value > 0)) {
        T.add("lab:protein+");
      }
    }

    const card = p3.cardiac || {};
    {
      const mTi = readMetric(card.troponinI, card, "troponinI");
      const mTt = readMetric(card.troponinT, card, "troponinT");
      if ((mTi.picked && mTi.hasValue && mTi.value > 0.04) || (mTt.picked && mTt.hasValue && mTt.value > 0.03)) {
        T.add("lab:troponin↑");
      }
    }

    const comp = p3.complement || {};
    {
      const mC3 = readMetric(comp.C3, comp, "C3");
      const mC4 = readMetric(comp.C4, comp, "C4");
      if (mC3.picked && mC3.hasValue && mC3.value < 90) T.add("lab:C3<90");
      if (mC4.picked && mC4.hasValue && mC4.value < 10) T.add("lab:C4<10");
    }

    const gas = p3.ox || {};
    {
      const m = readMetric(gas.SpO2, gas, "SpO2");
      if (m.picked && m.hasValue && m.value < 94) T.add("lab:SpO2<94");
    }

    return T;
  }

  // ---------------------------------------------------------------------------
  // 2) นิยามข้อใหญ่ของแต่ละ ADR (21 แบบ)
  // ---------------------------------------------------------------------------
  const ADR_DEFS = {
    urticaria: {
      title: "Urticaria",
      majors: [
        { anyOf: [tok("border","ขอบหยัก"), tok("shape","วงกลม"), tok("border","ขอบวงนูนแดงด้านในเรียบ")] },
        { anyOf: [tok("color","แดง"), tok("color","แดงซีด"), tok("color","ซีด"), tok("color","สีผิวปกติ")] },
        { anyOf: [tok("shape","ตุ่มนูน"), tok("shape","ปื้นนูน")], weight: 2 },
        { anyOf: ["sym:คัน"] },
        { anyOf: ["sym:บวม"] },
        { anyOf: [tok("loc","ทั่วร่างกาย"), tok("loc","มือ"), tok("loc","เท้า"), tok("loc","แขน"), tok("loc","ขา"), tok("loc","หน้า"), tok("loc","รอบดวงตา"), tok("loc","ลำคอ"), tok("loc","ลำตัว"), tok("loc","หลัง")] },
        { anyOf: [tok("onset","ภายใน 1 ชั่วโมง")] },
      ],
    },

    anaphylaxis: {
      title: "Anaphylaxis",
      majors: [
        { anyOf: [tok("shape","ตุ่มนูน"), tok("shape","ปื้นนูน"), "sym:บวม", "sym:ตึง"] },
        { anyOf: ["resp:หายใจมีเสียงวี๊ด","resp:หอบเหนื่อย","resp:หายใจลำบาก","vital:RR>21","vital:HR>100","vital:SpO2<94"], weight: 2 },
        { anyOf: ["sym:คัน", tok("color","แดง"), tok("color","สีผิวปกติ")] },
        { anyOf: ["gi:ท้องเสีย","gi:กลืนลำบาก","gi:ปวดบิดท้อง","gi:คลื่นไส้อาเจียน"] },
        { anyOf: [tok("onset","ภายใน 1 ชั่วโมง"), tok("onset","ภายใน 1–6 ชั่วโมง")] },
        { anyOf: ["cv:BPต่ำ","cv:BPลดลง≥40"] },
        { anyOf: ["exam:HR>100","vital:SpO2<94"] },
      ],
    },

    angioedema: {
      title: "Angioedema",
      majors: [
        { anyOf: [tok("shape","นูนหนา"), tok("border","ขอบไม่ชัดเจน")] },
        { anyOf: [tok("color","สีผิวปกติ"), tok("color","แดง")] },
        { anyOf: ["sym:บวม"], weight: 2 },
        { anyOf: ["sym:ตึง"] },
        { anyOf: ["sym:คัน","sym:ไม่คัน","sym:ปวด","sym:แสบ"] },
        { anyOf: [tok("loc","ริมฝีปาก"), tok("loc","รอบดวงตา"), tok("loc","ลิ้น"), tok("loc","อวัยวะเพศ")] },
        { anyOf: [tok("onset","ภายใน 1 ชั่วโมง")] },
      ],
    },

    maculopapular: {
      title: "Maculopapular rash",
      majors: [
        { anyOf: [tok("shape","ปื้นแดง"), tok("shape","ปื้นนูน"), tok("shape","ตุ่มนูน")] },
        { anyOf: [tok("color","แดง")] },
        { anyOf: ["skin:จุดเล็กแดง"], weight: 2 },
        { anyOf: ["sym:คัน"] },
        { anyOf: ["sys:ไข้", "lab:Eos>=10%"] },
        { anyOf: ["dist:สมมาตร", tok("loc","ลำตัว"), tok("loc","แขน"), tok("loc","ใบหน้า"), tok("loc","ลำคอ")] },
        { anyOf: [tok("onset","ภายใน 1-6 ชั่วโมง"), tok("onset","ภายใน 6-24 ชั่วโมง"), tok("onset","ภายใน 1 สัปดาห์"), tok("onset","ภายใน 2 สัปดาห์")] },
        { anyOf: ["sys:ต่อมน้ำเหลืองโต","sys:ข้ออักเสบ","org:ไตอักเสบ","org:ตับอักเสบ"] },
      ],
    },

    fde: {
      title: "Fixed drug eruption",
      majors: [
        { anyOf: [tok("shape","วงกลม"), tok("shape","วงรี")] },
        { anyOf: [tok("color","แดง"), tok("color","ดำ/คล้ำ")] },
        { anyOf: [tok("color","ม่วง/คล้ำ")], weight: 3 },
        { anyOf: ["peeling:ผิวหนังหลุดลอกตรงกลางผื่น","sym:เจ็บ","sym:แสบ","sym:ตึง"] },
        { anyOf: ["sym:บวม","blister:พอง","blister:ตุ่มน้ำขนาดเล็ก","blister:ตุ่มน้ำขนาดกลาง","blister:ตุ่มน้ำขนาดใหญ่"] },
        { anyOf: [tok("loc","ริมฝีปาก"), tok("loc","หน้า"), tok("loc","มือ"), tok("loc","เท้า"), tok("loc","แขน"), tok("loc","ขา"), tok("loc","อวัยวะเพศ"), tok("loc","ตำแหน่งเดิมกับครั้งก่อน")] },
        { anyOf: [tok("onset","ภายใน 1 สัปดาห์"), tok("onset","ภายใน 2 สัปดาห์")] },
        { anyOf: ["sys:ไข้","gi:คลื่นไส้อาเจียน","sys:ปวดเมื่อยกล้ามเนื้อ"] },
        { anyOf: [tok("border","ขอบเรียบ"), tok("border","ขอบเขตชัดเจน")] },
      ],
    },

    agep: {
      title: "AGEP",
      majors: [
        { anyOf: [tok("shape","ผื่นแดง")] },
        { anyOf: [tok("color","แดง"), tok("color","เหลือง")] },
        { anyOf: ["skin:ตุ่มหนอง"], weight: 3 },
        { anyOf: ["sym:บวม","sym:คัน","sym:เจ็บ"] },
        { anyOf: ["skin:ปื้น/จ้ำเลือด","skin:แห้ง","skin:ลอก","skin:ขุย"] },
        { anyOf: [tok("loc","หน้า"), tok("loc","รักแร้"), tok("loc","ทั่วร่างกาย"), tok("loc","ขาหนีบ")] },
        { anyOf: [tok("onset","ภายใน 6-24 ชั่วโมง"), tok("onset","ภายใน 1 สัปดาห์"), tok("onset","ภายใน 2 สัปดาห์"), tok("onset","ภายใน 3 สัปดาห์")] },
        { anyOf: ["sys:ไข้"] },
        { anyOf: ["lab:WBC<4000", "lab:Neutrophil>75%", "exam:HR>100"] },
      ],
    },

    sjs: {
      title: "SJS",
      majors: [
        { anyOf: [tok("shape","วงกลมคล้ายเป้าธนู (ไม่ครบ 3 ชั้น)")] },
        { anyOf: [tok("color","ดำ/คล้ำ"), tok("color","เทา"), tok("color","แดง")] },
        { anyOf: ["peeling:ไม่เกิน10%BSA"], weight: 3 },
        { anyOf: ["skin:น้ำเหลือง","blister:พอง","blister:ตุ่มน้ำขนาดเล็ก","blister:ตุ่มน้ำขนาดกลาง","blister:ตุ่มน้ำขนาดใหญ่"] },
        { anyOf: ["skin:สะเก็ด"] },
        { anyOf: [tok("loc","ลำตัว")] },
        { anyOf: [tok("onset","ภายใน 1-6 ชั่วโมง"), tok("onset","ภายใน 6-24 ชั่วโมง"), tok("onset","ภายใน 1 สัปดาห์"), tok("onset","ภายใน 2 สัปดาห์"), tok("onset","ภายใน 3 สัปดาห์")] },
        { anyOf: ["sys:ไข้","sys:ปวดเมื่อยกล้ามเนื้อ","gi:คลื่นไส้อาเจียน","sys:เลือดออกในทางเดินอาหาร"] },
        { anyOf: [tok("loc","ริมฝีปาก"), tok("loc","รอบดวงตา"), tok("loc","ลำตัว"), tok("loc","แขน"), tok("loc","ขา"), tok("loc","หน้า"), tok("loc","มือ"), tok("loc","เท้า")] },
        { anyOf: ["mucosa:>1"] },
      ],
    },

    ten: {
      title: "TEN",
      majors: [
        { anyOf: [tok("shape","ผื่นแดง"), tok("shape","ปื้นแดง"), tok("shape","วงกลมคล้ายเป้าธนู (ไม่ครบ 3 ชั้น)")] },
        { anyOf: [tok("color","แดง"), tok("color","ดำ/คล้ำ")] },
        { anyOf: ["peeling:เกิน30%BSA"], weight: 3 },
        { anyOf: ["blister:ตุ่มน้ำขนาดใหญ่","skin:น้ำเหลือง","skin:สะเก็ด"] },
        { anyOf: [tok("color","ซีด"), "lab:Hb<10","sys:เลือดออกในทางเดินอาหาร","gi:กลืนลำบาก"] },
        { anyOf: [tok("loc","ลำตัว"), tok("loc","แขน"), tok("loc","ขา"), tok("loc","หน้า"), tok("loc","มือ"), tok("loc","เท้า"), tok("loc","ศีรษะ"), tok("loc","ทั่วร่างกาย"), tok("loc","ริมฝีปาก")] },
        { anyOf: [tok("onset","ภายใน 1 สัปดาห์"), tok("onset","ภายใน 2 สัปดาห์"), tok("onset","ภายใน 3 สัปดาห์")] },
        { anyOf: ["sys:ไข้","sys:ปวดเมื่อยกล้ามเนื้อ","gi:คลื่นไส้อาเจียน","sys:เจ็บคอ","sys:ปวดข้อ","gi:ท้องเสีย","sys:เยื่อบุตาอักเสบ"] },
        { anyOf: ["org:ไตวาย","org:ตับอักเสบ","org:ปอดอักเสบ"] },
        { anyOf: ["lab:Cr↑>=0.3or1.5x", "lab:protein+", "lab:SpO2<94", "lab:ALT>=40", "lab:AST>=40"] },
      ],
    },

    dress: {
      title: "DRESS",
      majors: [
        { anyOf: [tok("shape","ผื่นแดง"), tok("shape","ปื้นแดง")] },
        { anyOf: [tok("color","แดง")] },
        { anyOf: ["lab:Eos>=10%","lab:AEC>=1500","lab:atypicalLymphocyte"], weight: 3 },
        { anyOf: ["blister:ตุ่มน้ำขนาดเล็ก","blister:ตุ่มน้ำขนาดกลาง","blister:ตุ่มน้ำขนาดใหญ่","skin:ปื้น/จ้ำเลือด"] },
        { anyOf: [tok("loc","หน้า"), tok("loc","ลำตัว"), tok("loc","แขน"), tok("loc","ขา")] },
        { anyOf: ["sys:ไข้"] },
        { anyOf: [tok("onset","ภายใน 1 สัปดาห์"), tok("onset","ภายใน 2 สัปดาห์"), tok("onset","ภายใน 3 สัปดาห์"), tok("onset","ภายใน 4 สัปดาห์"), tok("onset","ภายใน 5 สัปดาห์"), tok("onset","ภายใน 6 สัปดาห์")] },
        { anyOf: ["lab:ALT>=40","lab:AST>=40","lab:Cr↑>=0.3or1.5x","lab:protein+","lab:SpO2<94","lab:troponin↑","sys:EKGผิดปกติ"] },
        { anyOf: ["org:ตับอักเสบ","org:ไตอักเสบ","org:ไตวาย","org:ปอดอักเสบ","org:กล้ามเนื้อหัวใจอักเสบ","org:ต่อมไทรอยด์อักเสบ"] },
      ],
    },

    em: {
      title: "Erythema multiforme (EM)",
      majors: [
        { anyOf: [tok("shape","ตุ่มนูน"), tok("border","ขอบวงนูนแดงด้านในเรียบ")] },
        { anyOf: [tok("color","แดง"), tok("color","แดงซีด")] },
        { anyOf: [tok("shape","วงกลม 3 ชั้น (เป้าธนู)"), tok("shape","วงกลม 3 ชั้น")], weight: 3 },
        { anyOf: ["blister:พอง","blister:ตุ่มน้ำขนาดเล็ก","blister:ตุ่มน้ำขนาดกลาง"] },
        { anyOf: ["skin:สะเก็ด"] },
        { anyOf: [tok("onset","ภายใน 1-6 ชั่วโมง"), tok("onset","ภายใน 6-24 ชั่วโมง"), tok("onset","ภายใน 1 สัปดาห์")] },
        { anyOf: [tok("loc","ช่องปาก"), tok("loc","จมูก"), tok("loc","ทวาร"), tok("loc","อวัยวะเพศ")] },
        { anyOf: ["sys:ไข้","sys:อ่อนเพลีย","sys:ปวดเมื่อยกล้ามเนื้อ","sys:เจ็บคอ","sys:ปวดข้อ"] },
        { anyOf: [tok("loc","มือ"), tok("loc","เท้า"), tok("loc","แขน"), tok("loc","ขา"), tok("loc","หน้า"), tok("loc","ลำตัว"), tok("loc","หลัง"), tok("loc","ลำคอ")] },
      ],
    },

    photosensitivity: {
      title: "Photosensitivity drug eruption",
      majors: [
        { anyOf: [tok("border","ขอบเขตชัด"), tok("shape","ปื้นแดง"), tok("skin","จุดแดงเล็ก")] },
        { anyOf: [tok("color","ดำ/คล้ำ"), tok("color","แดง")] },
        { anyOf: [tok("color","แดงไหม้")], weight: 2 },
        { anyOf: ["skin:น้ำเหลือง","skin:สะเก็ด"] },
        { anyOf: ["blister:ตุ่มน้ำขนาดเล็ก","blister:ตุ่มน้ำขนาดกลาง","blister:ตุ่มน้ำขนาดใหญ่","skin:ลอก","skin:ขุย","sym:คัน"] },
        { anyOf: [tok("loc","หน้า"), tok("loc","หน้าอก"), tok("loc","มือ"), tok("loc","แขน"), tok("loc","ขา")] },
        { anyOf: [tok("onset","ภายใน 1-6 ชั่วโมง"), tok("onset","ภายใน 6-24 ชั่วโมง"), tok("onset","ภายใน 1 สัปดาห์"), tok("onset","ภายใน 1 ชั่วโมง")] },
        { anyOf: ["sym:แสบ"], weight: 2 },
      ],
    },

    exfoliative: {
      title: "Exfoliative dermatitis",
      majors: [
        { anyOf: ["sym:ตึง"] },
        { anyOf: [tok("color","แดง")] },
        { anyOf: ["skin:แห้ง"], weight: 3 },
        { anyOf: ["skin:ขุย"], weight: 3 },
        { anyOf: ["sym:คัน"] },
        { anyOf: [tok("loc","ทั่วร่างกาย"), tok("loc","มือ"), tok("loc","เท้า"), tok("loc","ศีรษะ")] },
        { anyOf: [tok("onset","ภายใน 3 สัปดาห์"), tok("onset","ภายใน 1-6 ชั่วโมง"), tok("onset","ภายใน 6-24 ชั่วโมง"), tok("onset","ภายใน 1 สัปดาห์"), tok("onset","ภายใน 2 สัปดาห์"), tok("onset","ภายใน 4 สัปดาห์")] },
        { anyOf: ["sys:ไข้","sys:หนาวสั่น","sys:อ่อนเพลีย","sys:ดีซ่าน"] },
        { anyOf: ["sys:ต่อมน้ำเหลืองโต","sys:ตับโต","sys:ม้ามโต","sym:ขาบวม"] },
        { anyOf: ["skin:มันเงา","skin:ลอก"], weight: 3 },
      ],
    },

    eczematous: {
      title: "Eczematous drug eruption",
      majors: [
        { anyOf: [tok("shape","ตุ่มนูน"), tok("shape","ปื้นแดง")] },
        { anyOf: [tok("color","แดง")] },
        { anyOf: ["sym:คัน"], weight: 2 },
        { anyOf: ["sym:ตึง", tok("shape","ผื่นแดง")] },
        { anyOf: ["skin:จุดเล็กแดง","skin:น้ำเหลือง","skin:สะเก็ด"] },
        { anyOf: [tok("loc","ลำตัว"), tok("loc","แขน"), tok("loc","ขา"), tok("loc","หน้า"), tok("loc","ลำคอ")] },
        { anyOf: [tok("onset","ภายใน 1-6 ชั่วโมง"), tok("onset","ภายใน 6-24 ชั่วโมง"), tok("onset","ภายใน 1 สัปดาห์"), tok("onset","ภายใน 2 สัปดาห์"), tok("onset","ภายใน 3 สัปดาห์")] },
        { anyOf: ["skin:ขุย","skin:แห้ง","skin:ลอก"], weight: 2 },
        { anyOf: ["dist:สมมาตร"] },
        { anyOf: ["blister:ตุ่มน้ำขนาดเล็ก","blister:ตุ่มน้ำขนาดกลาง","blister:ตุ่มน้ำขนาดใหญ่"] },
      ],
    },

    bullous: {
      title: "Bullous Drug Eruption",
      majors: [
        { anyOf: ["blister:ตุ่มน้ำขนาดเล็ก","blister:พอง","sym:ตึง"] },
        { anyOf: [tok("color","แดง")] },
        { anyOf: ["blister:ตุ่มน้ำขนาดกลาง","blister:ตุ่มน้ำขนาดใหญ่"], weight: 2 },
        { anyOf: ["sym:เจ็บ","sym:แสบ"] },
        { anyOf: [tok("color","ใส")], weight: 3 },
        { anyOf: [tok("loc","ลำตัว"), tok("loc","แขน"), tok("loc","ขา"), tok("loc","เท้า")] },
        { anyOf: [tok("onset","ภายใน 1-6 ชั่วโมง"), tok("onset","ภายใน 6-24 ชั่วโมง"), tok("onset","ภายใน 1 สัปดาห์"), tok("onset","ภายใน 2 สัปดาห์"), tok("onset","ภายใน 3 สัปดาห์")] },
      ],
    },

    serumSickness: {
      title: "Serum sickness",
      majors: [
        { anyOf: ["sym:ตุ่มนูน","tok:แดง","sym:บวม","sym:คัน"].map(x => x.replace("tok:","color:")) },
        { anyOf: ["sys:ไข้"], weight: 2 },
        { anyOf: ["sys:ต่อมน้ำเหลืองโต","org:ไตอักเสบ"] },
        { anyOf: ["lab:protein+","lab:C3<90","lab:C4<10"] },
        { anyOf: [tok("onset","ภายใน 1-6 ชั่วโมง"), tok("onset","ภายใน 6-24 ชั่วโมง"), tok("onset","ภายใน 1 สัปดาห์"), tok("onset","ภายใน 2 สัปดาห์"), tok("onset","ภายใน 3 สัปดาห์")] },
        { anyOf: ["ua:RBC5-10/HPF"] },
        { anyOf: ["sys:ปวดข้อ","sys:ข้ออักเสบ"], weight: 2 },
        { anyOf: [tok("loc","รอบดวงตา"), tok("loc","มือ"), tok("loc","เท้า"), tok("loc","ลำตัว"), tok("loc","แขน"), tok("loc","ขา")] },
      ],
    },

    vasculitis: {
      title: "Vasculitis",
      majors: [
        { anyOf: ["sym:ตุ่มนูน", tok("shape","ผื่นแดง"), tok("color","แดง")].map(x => (x.startsWith("sym:ตุ่มนูน")?tok("shape","ตุ่มนูน"):x)) },
        { anyOf: ["sys:ไข้","sys:ปวดข้อ","sys:ข้ออักเสบ","sys:ปวดกล้ามเนื้อ","sys:ต่อมน้ำเหลืองโต"] },
        { anyOf: ["org:ไตอักเสบ","org:ไตวาย","sys:ต่อมน้ำเหลืองโต"] },
        { anyOf: ["sys:ไอเป็นเลือด","sys:ถุงลมเลือดออก","sys:เลือดออกในทางเดินอาหาร"] },
        { anyOf: [tok("onset","ภายใน 1-6 ชั่วโมง"), tok("onset","ภายใน 6-24 ชั่วโมง"), tok("onset","ภายใน 1 สัปดาห์"), tok("onset","ภายใน 2 สัปดาห์"), tok("onset","ภายใน 3 สัปดาห์")] },
        { anyOf: ["lab:protein+","lab:C3<90","lab:C4<10"] },
        { anyOf: ["lab:Cr↑>=0.3or1.5x"] },
        { anyOf: ["skin:ปื้น/จ้ำเลือด", tok("loc","ขา")], weight: 2 },
      ],
    },

    hemolytic: {
      title: "Hemolytic anemia",
      majors: [
        { anyOf: [tok("color","ซีด"), "sys:ดีซ่าน"], weight: 2 },
        { anyOf: ["sys:ปัสสาวะสีชา/สีดำ"], weight: 3 },
        { anyOf: ["org:ไตวาย"] },
        { anyOf: ["lab:IgG+","lab:C3+"] },
        { anyOf: [tok("onset","ภายใน 1-6 ชั่วโมง"), tok("onset","ภายใน 6-24 ชั่วโมง"), tok("onset","ภายใน 1 สัปดาห์")] },
        { anyOf: ["lab:Hb<10"], weight: 3 },
        { anyOf: ["lab:LDHสูง"] },
        { anyOf: ["cv:BPต่ำ","cv:BPลดลง≥40"] },
        { anyOf: ["sys:ปวดหลังส่วนเอว","sys:ปวดแน่นชายโครงขวา"] },
      ],
    },

    pancytopenia: {
      title: "Pancytopenia",
      majors: [
        { anyOf: [tok("color","ซีด"), "sys:อ่อนเพลีย"] },
        { anyOf: ["sys:ปัสสาวะสีชา/สีดำ","sys:หนาวสั่น","sys:เจ็บคอ","sys:แผลในปาก"] },
        { anyOf: ["skin:จุดเลือดออก","skin:ฟกช้ำ","sys:เลือดกำเดาไหล","sys:เหงือกเลือดออก"], weight: 3 },
        { anyOf: ["exam:HR>100"] },
        { anyOf: [tok("onset","ภายใน 1-6 ชั่วโมง"), tok("onset","ภายใน 6-24 ชั่วโมง"), tok("onset","ภายใน 1 สัปดาห์"), tok("onset","ภายใน 2 สัปดาห์")] },
        { anyOf: ["sys:ไข้"] },
        { anyOf: ["lab:Hb<10"], weight: 2 },
        { anyOf: ["lab:Hct<30"], weight: 2 },
        { anyOf: ["lab:WBC<4000"], weight: 2 },
        { anyOf: ["lab:Plt<100k"], weight: 2 },
      ],
    },

    neutropenia: {
      title: "Neutropenia",
      majors: [
        { anyOf: ["sys:หนาวสั่น","sys:เจ็บคอ","sys:แผลในปาก"] },
        { anyOf: ["sys:ไข้","sys:แผลในปาก","sys:ทอนซิลอักเสบ"] },
        { anyOf: ["org:ปอดอักเสบ"] },
        { anyOf: ["lab:ANC<1500"], weight: 4 },
      ],
    },

    thrombocytopenia: {
      title: "Thrombocytopenia",
      majors: [
        { anyOf: ["skin:จุดเลือดออก","skin:ปื้น/จ้ำเลือด"], weight: 2 },
        { anyOf: ["sys:เหงือกเลือดออก","sys:เลือดออกในทางเดินอาหาร","ua:RBC+"] },
        { anyOf: ["lab:Plt<150000", "lab:Plt<100k"] },
        { anyOf: [tok("onset","ภายใน 1-6 ชั่วโมง"), tok("onset","ภายใน 6-24 ชั่วโมง"), tok("onset","ภายใน 1 สัปดาห์")] },
      ],
    },

    nephritis: {
      title: "Nephritis",
      majors: [
        { anyOf: ["sys:ไข้","sys:ปวดข้อ","sys:อ่อนเพลีย"] },
        { anyOf: ["sys:ปัสสาวะออกน้อย","sys:ปัสสาวะขุ่น"] },
        { anyOf: ["sym:ขาบวม","sym:บวม"] },
        { anyOf: ["lab:Cr↑>=0.3or1.5x","lab:eGFR<60"], weight: 3 },
        { anyOf: [tok("onset","ภายใน 1-6 ชั่วโมง"), tok("onset","ภายใน 6-24 ชั่วโมง"), tok("onset","ภายใน 1 สัปดาห์"), tok("onset","ภายใน 2 สัปดาห์")] },
      ],
    },
  };

  // ---------------------------------------------------------------------------
  // 3) เครื่องคิดคะแนนโหมด C
  // ---------------------------------------------------------------------------
  function scoreC(tokens, def) {
    const majors = def.majors || [];
    const N = majors.length || 0;
    if (!N) return 0;
    let anyMatched = false;
    let sumWeight = 0;
    for (const m of majors) {
      const any = (m.anyOf || []);
      const matched = any.some(t => tokens.has(t));
      if (matched) { anyMatched = true; sumWeight += Number(m.weight || 1); }
    }
    if (!anyMatched) return 0;
    return Math.round((100 * sumWeight) / N);
  }

  // ---------------------------------------------------------------------------
  // 4) Public API
  // ---------------------------------------------------------------------------
  function brainRank(mode) {
    const d = window.drugAllergyData || {};
    if (mode !== "C") mode = "C";
    const tokens = collectSignals(d);
    const results = [];
    Object.keys(ADR_DEFS).forEach(key => {
      const def = ADR_DEFS[key];
      const pctC = scoreC(tokens, def);
      results.push({ key, title: def.title || key, pctC });
    });
    results.sort((a, b) => (b.pctC || 0) - (a.pctC || 0));
    return { mode: "C", results };
  }

  window.brainRank = brainRank;
})();

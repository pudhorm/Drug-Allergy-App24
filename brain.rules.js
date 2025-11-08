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
  // รองรับรูปแบบ:
  //   1) x = 123 , และมี x_checked / xHas / xUse เป็น true
  //   2) x = { value:123, checked:true } หรือ { v:123, has:true } หรือ { value:123, use:true }
  function readMetric(objOrNumber, siblingsOrNull, fieldNameHint) {
    let value = NaN, picked = false;

    // กรณีเป็นอ็อบเจ็กต์
    if (objOrNumber && typeof objOrNumber === "object") {
      const o = objOrNumber;
      value = num(o.value ?? o.val ?? o.v ?? o.data ?? o.number);
      picked = !!(o.checked || o.has || o.use || o.selected || o.enable || o.enabled);
    } else {
      // กรณีเป็นเลขล้วน ๆ
      value = num(objOrNumber);
      // มองหาแฟล็กพี่น้อง เช่น ANC_checked, ANC_has, ANC_use
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

    // -------- หน้า 1: รูปร่าง/สี/ขอบ/ฯลฯ --------
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

    // -------- หน้า 2: ระบบอื่น ๆ / vitals --------
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
    if (truthy(misc.fever))       T.add("sys:ไข้");
    if (truthy(misc.chill))       T.add("sys:หนาวสั่น");
    if (truthy(misc.fatigue))     T.add("sys:อ่อนเพลีย");
    if (truthy(misc.soreThroat))  T.add("sys:เจ็บคอ");
    if (truthy(misc.oralUlcer))   T.add("sys:แผลในปาก");
    if (truthy(misc.bleedingGI))  T.add("sys:เลือดออกในทางเดินอาหาร");
    if (truthy(misc.lymph))       T.add("sys:ต่อมน้ำเหลืองโต");
    if (truthy(misc.corneal))     T.add("sys:แผลกระจกตา");
    if (truthy(misc.conjunctivitis)) T.add("sys:เยื่อบุตาอักเสบ");

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

    // -------- หน้า 3: L abs — นับเฉพาะเมื่อ "ติ๊กเลือก" แล้วเท่านั้น --------
    const cbc = p3.cbc || {};

    // ANC
    {
      const m = readMetric(cbc.ANC ?? cbc.anc, cbc, "ANC");
      if (m.picked && m.hasValue && m.value < 1500) T.add("lab:ANC<1500");
    }
    // WBC
    {
      const m = readMetric(cbc.WBC ?? cbc.wbc, cbc, "WBC");
      if (m.picked && m.hasValue && m.value < 4000) T.add("lab:WBC<4000");
    }
    // Hb
    {
      const m = readMetric(cbc.Hb ?? cbc.hb, cbc, "Hb");
      if (m.picked && m.hasValue && m.value < 10) T.add("lab:Hb<10");
    }
    // Hct
    {
      const m = readMetric(cbc.Hct ?? cbc.hct, cbc, "Hct");
      if (m.picked && m.hasValue && m.value < 30) T.add("lab:Hct<30");
    }
    // Plt
    {
      const m = readMetric(cbc.Plt ?? cbc.plt, cbc, "Plt");
      if (m.picked && m.hasValue && m.value < 100000) T.add("lab:Plt<100k");
    }
    // Eosinophil %
    {
      const m = readMetric(cbc.eosinophilPct ?? cbc.eos, cbc, "eosinophilPct");
      if (m.picked && m.hasValue && m.value >= 10) T.add("lab:Eos>=10%");
    }
    // AEC
    {
      const m = readMetric(cbc.AEC ?? cbc.aec, cbc, "AEC");
      if (m.picked && m.hasValue && m.value >= 1500) T.add("lab:AEC>=1500");
    }

    // LFT
    const lft = p3.lft || {};
    {
      const m = readMetric(lft.ALT ?? lft.alt, lft, "ALT");
      if (m.picked && m.hasValue && m.value >= 40) T.add("lab:ALT>=40");
    }
    {
      const m = readMetric(lft.AST ?? lft.ast, lft, "AST");
      if (m.picked && m.hasValue && m.value >= 40) T.add("lab:AST>=40");
    }

    // RFT
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

    // Urine protein
    const ua = p3.ua || {};
    {
      const m = readMetric(ua.protein ?? ua.proteinPositive, ua, "protein");
      const asText = norm(ua.protein);
      if ((m.picked && (asText === "+" || asText === "positive")) || (m.picked && m.hasValue && m.value > 0)) {
        T.add("lab:protein+");
      }
    }

    // อื่น ๆ
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
  // 2) นิยามข้อใหญ่ของแต่ละ ADR (21 แบบ) — (คงเดิมจากเวอร์ชันก่อน)
  // ---------------------------------------------------------------------------
  const ADR_DEFS = {
    // …………… (คงเดิมทั้งหมด: urticaria, anaphylaxis, angioedema, maculopapular, fde, agep,
    // sjs, ten, dress, em, photosensitivity, exfoliative, eczematous, bullous,
    // serumSickness, vasculitis, hemolytic, pancytopenia, neutropenia,
    // thrombocytopenia, nephritis)
    // ---- ใส่บล็อกเดิมทั้งหมดที่คุณใช้อยู่ ณ ตอนก่อนหน้า ----
  };

  // ---------------------------------------------------------------------------
  // 3) เครื่องคิดคะแนนโหมด C (คงเดิม)
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
  // 4) Public API (คงเดิม)
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

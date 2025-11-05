// ============================ brain.rules.js ============================
// ตั้งกติกา "สมอง" สำหรับหน้า 6: เกณฑ์ Gate + คะแนน + คำอธิบาย
// ไม่แตะต้อง brain.js — เพียงประกาศ window.brainRules ให้ brain.js ไปใช้เอง
// ปลอดภัยกับหลายโครงสร้างข้อมูล (รองรับชื่อฟิลด์ซ้ำรูปแบบจากหน้า 1–3)
//
// อ้างอิงกรอบเกณฑ์ (โดยย่อ):
// - Urticaria/Angioedema: EAACI/GA2LEN/EuroGuiDerm/APAAACI 2022; drug-induced frame
// - Anaphylaxis: WAO/EAACI/AAAAI 2020+ (3 criteria window)
// - DRESS: RegiSCAR (Kardaun et al.); timing 2–6 สัปดาห์ + ผิวหนัง + สัญญาณระบบ/เลือด + อวัยวะอย่างน้อย 1
// - AGEP: EuroSCAR (Sidoroff et al.) — ตุ่มหนองเล็กจำนวนมากบนพื้น erythema, ไข้, neutrophilia
// - SJS/TEN: Bastuji-Garin (นิยาม %BSA <10 / >30), mucosal ≥2 แห่ง (SJS ชัด), สัญญาณนำ 1–3 วัน
// - EM: targetoid 3 ชั้น, ผิวหนัง + เยื่อบุ (minor vs major)
// - FDE: วงกลม/รี สีแดงจัด/ม่วงคล้ำ กลับตำแหน่งเดิม, timing re-exposure <24h
// - MP rash (MPE): maculo+papular สมมาตร, itching มักมี, timing ~2 สัปดาห์, eos อาจสูง >5%
// - Photosensitivity: ตำแหน่งโดนแดด, phototoxic vs photoallergic timing
// - Bullous Drug Eruption: bullae ตึง, เจ็บแสบ, ตำแหน่งลำตัว/แขนขา
// - Cytopenias/Nephritis/Serum-sickness-like: cutoff ตามที่ผู้ใช้ให้
//
// ======================================================================

// ----------------------------- helpers --------------------------------
(function initBrainRules() {
  const g = (window.drugAllergyData || {});
  // ดึงหน้า
  const P1 = g.page1 || {};
  const P2 = g.page2 || {};
  const P3 = g.page3 || {};

  // ---- safe pickers ----
  const arr = (v) => Array.isArray(v) ? v : (v == null ? [] : [v]).filter(Boolean);
  const has = (obj, k) => !!(obj && Object.prototype.hasOwnProperty.call(obj, k));

  // หน้า 1: skin fields (ยืดหยุ่นชื่อ)
  const rashShapes  = new Set([ ...arr(P1.rashShape), ...arr(P1.rashShapes) ]);
  const rashColors  = new Set([ ...arr(P1.rashColor), ...arr(P1.rashColors) ]);
  const locations   = new Set([ ...arr(P1.locations), ...arr(P1.location) ]);
  const itch        = (P1.itch && (P1.itch.has || P1.itch === true)) ? true : (P1.itch === "คัน" || P1.itch === "itch");
  const swelling    = (P1.swelling && (P1.swelling.has || P1.swelling === true)) || rashShapes.has("บวม");
  const pustule     = (P1.pustule && (P1.pustule.has || P1.pustule === true));
  const painBurn    = (P1.pain && (P1.pain.has || P1.pain === true)) || (P1.burn && (P1.burn.has || P1.burn === true));
  const skinDetach  = {
    lt10  : P1.skinDetach?.lt10 || rashShapes.has("ผิวหนังหลุดลอกไม่เกิน 10%") || rashShapes.has("ไม่เกิน 10% BSA"),
    gt30  : P1.skinDetach?.gt30 || rashShapes.has("เกิน 30% BSA") || rashColors.has("หลุดลอก >30%"),
    center: P1.skinDetach?.center || rashShapes.has("ผิวหนังหลุดลอกตรงกลางผื่น"),
  };

  // หน้า 2: systems
  const resp = P2.resp || {};
  const cv   = P2.cv   || {};
  const gi   = P2.gi   || {};
  const mucosalSites = new Set([
    ...(arr(P2.mucosa) || []),
    ...(arr(P1.mucosa) || [])
  ]); // ถ้ามีระบบเก็บ mucosa

  // หน้า 3: labs (คีย์เป็นกลุ่ม)
  const L = P3 || {};
  const cbc  = L.cbc  || {};
  const lft  = L.lft  || {};
  const rft  = L.rft  || {};
  const lung = L.lung || {};
  const heart= L.heart|| {};
  const immuno = L.immuno || {};

  // อ่านค่าตัวเลขสบายๆ
  const num = (v) => {
    const n = Number(String(v ?? "").replace(/[, ]+/g,""));
    return Number.isFinite(n) ? n : NaN;
  };
  const getVal = (grp, key) => num(grp?.[key]?.value);

  // cutoffs (อิงข้อความที่ผู้ใช้ให้)
  const CUT = {
    eosPct: 10,              // %
    eosAbs700: 700,          // /µL
    eosAbs1500: 1500,        // /µL (stronger)
    ALT_AST_2xULN_or_40: 40, // U/L — ใช้ ≥40 U/L เป็น threshold ขั้นต้น
    SpO2_low: 94,            // %
    troponinI: 0.04,         // ng/mL
    troponinT_low: 0.01,     // ng/mL (ช่วง 0.01–0.03)
    Cr_rise: 0.3,            // mg/dL ใน 48 ชม. (ต้องมี baseline ถ้าจะเป๊ะ)
    ANC_neutropenia: 1500,   // /µL
    ANC_mod: 999,
    ANC_severe: 500,
    Hb_low: 10,              // g/dL
    WBC_low: 4000,           // /µL
    Plt_low: 150000,         // /µL
    Plt_severe: 50000,       // /µL
  };

  // labs actual
  const eosPct   = Number.isFinite(num(cbc?.eos?.value))  ? num(cbc?.eos?.value)  : num(cbc?.aec?.value) < 100 ? num(cbc?.eos?.value) : NaN;
  const aecAbs   = Number.isFinite(num(cbc?.aec?.value))  ? num(cbc?.aec?.value)  : NaN;
  const atypical = Number.isFinite(num(cbc?.atypical?.value)) ? num(cbc?.atypical?.value) : NaN;
  const hb       = num(cbc?.hb?.value);
  const wbc      = num(cbc?.wbc?.value);
  const plt      = num(cbc?.plt?.value);
  const neutPct  = num(cbc?.neut?.value);
  const anc      = Number.isFinite(wbc) && Number.isFinite(neutPct) ? Math.round((wbc * neutPct / 100)) : NaN;

  const ALT      = num(lft?.alt?.value);
  const AST      = num(lft?.ast?.value);

  const Cr       = num(rft?.cre?.value ?? rft?.creatinine?.value);
  const eGFR     = num(rft?.egfr?.value);
  const UA_prot  = (L.ua?.protein?.value ?? "").toString().trim(); // mg/dL or "+"

  const SpO2     = num(lung?.spo2?.value);
  const CXR      = (lung?.cxr?.value ?? "").toString().toLowerCase();

  const tropI    = num(heart?.tropi?.value);
  const tropT    = num(heart?.tropt?.value);
  const ckmb     = num(heart?.ckmb?.value);
  const EKG      = (heart?.ekg?.value ?? "").toString().toLowerCase();

  const IgE      = num(immuno?.ige?.value);
  const C3C4     = (immuno?.c3c4?.value ?? "").toString().toLowerCase();

  // เวลาเริ่มอาการจากหน้า 1 (อาจเก็บไว้ต่างรูป)
  const onsetRaw = (P1.onset || P1.timeline || "").toString().trim(); // ตัวเลือก: "< 1 hr", "1–6 hr", "6–24 hr", "1–6 wk", ...
  const onset = {
    lt1h: /^(<\s*1\s*h|ภายใน\s*1\s*ชั่วโมง)/i.test(onsetRaw),
    h1to6: /(1[\s–-]*6\s*h|1–6 ชั่วโมง)/i.test(onsetRaw),
    h6to24: /(6[\s–-]*24\s*h|6–24 ชั่วโมง)/i.test(onsetRaw),
    wk1to6: /(1[\s–-]*6\s*w|1–6\s*สัปดาห์)/i.test(onsetRaw)
  };

  // สถานะระบบหายใจ/ไหลเวียน/ทางเดินอาหาร (หน้า 2)
  const hasResp = !!(resp.dyspnea || resp.wheeze || resp.tachypnea || resp.stridor || resp.hoarseness);
  const hasCV   = !!(cv.hypotension || cv.shock);
  const hasGI   = !!(gi.colicky || gi.nausea || gi.vomit || gi.diarrhea);

  // mucosa involvement (เราจะตีความจาก patterns หน้า 1/2 ถ้ามีการบันทึก)
  // ใช้เงื่อนไขหลวม ๆ จาก field ผิวหนังที่เกี่ยว mucosa
  const mucosaAny = (
    locations.has("ปาก") || locations.has("ตา") || locations.has("อวัยวะเพศ") ||
    mucosalSites.size >= 1
  );
  const mucosaCount = (() => {
    let c = 0;
    if (locations.has("ปาก")) c++;
    if (locations.has("ตา")) c++;
    if (locations.has("อวัยวะเพศ")) c++;
    // รับจากหน้า 2 ถ้าจัดเก็บเป็นชุด
    c += mucosalSites.size;
    return c;
  })();

  // ตัวช่วยคะแนน/เหตุผล
  function explPush(list, cond, text) { if (cond) list.push(text); return cond; }
  function addScore(s, cond, w) { return s + (cond ? w : 0); }

  // --------------------------- RULES CORE -------------------------------
  const rules = [];

  // ========== URTICARIA ==========
  rules.push({
    id: "urticaria",
    label: "Urticaria (Type I/Immediate or pseudoallergy)",
    gate(d) {
      // wheal & flare: ปื้นนูน/ลมพิษ + คัน, ไม่มีขุย/สะเก็ด/ตุ่มน้ำ/หนอง; onset < 1h supportive
      const hasWhealShape = rashShapes.has("ตุ่มนูน") || rashShapes.has("ปื้นนูน") || rashShapes.has("วงกลมชั้นเดียว") || rashShapes.has("วงกลม 3 ชั้น");
      const notScaleVesPus = !(rashShapes.has("ขุย") || rashShapes.has("สะเก็ด")) && !(P1.blister && (P1.blister.small || P1.blister.medium || P1.blister.large)) && !pustule;
      return hasWhealShape && itch && notScaleVesPus;
    },
    score(d) {
      let s = 0, reasons = [];
      s = addScore(s, itch, 3) && explPush(reasons, itch, "คันเด่นชัด");
      s = addScore(s, rashShapes.has("ปื้นนูน") || rashShapes.has("ตุ่มนูน"), 2) && explPush(reasons, (rashShapes.has("ปื้นนูน")||rashShapes.has("ตุ่มนูน")), "ลักษณะ wheal/wheal-like");
      s = addScore(s, rashColors.has("แดง"), 1) && explPush(reasons, rashColors.has("แดง"), "ผื่นแดง");
      s = addScore(s, onset.lt1h, 2) && explPush(reasons, onset.lt1h, "onset < 1 ชั่วโมง");
      s = addScore(s, hasResp || hasCV, 1) && explPush(reasons, (hasResp||hasCV), "ร่วมระบบอื่น (พิจารณา anaphylaxis ด้วย)");
      return { score: s, reasons };
    }
  });

  // ========== ANGIOEDEMA ==========
  rules.push({
    id: "angioedema",
    label: "Angioedema (Type I/Immediate or bradykinin-mediated pseudoallergy)",
    gate() {
      // บวมชั้นลึก ไม่มีขอบเขตชัดเจน, มักไม่คัน/คันน้อย, onset <1h ช่วยยืนยัน
      return swelling;
    },
    score() {
      let s=0, reasons=[];
      s = addScore(s, swelling, 3) && explPush(reasons, swelling, "บวมเด่นชั้นลึก (angioedema)");
      s = addScore(s, !itch, 1) && explPush(reasons, !itch, "ไม่คันหรือคันน้อย");
      s = addScore(s, onset.lt1h, 2) && explPush(reasons, onset.lt1h, "onset < 1 ชั่วโมง");
      s = addScore(s, hasResp || hasCV, 2) && explPush(reasons, (hasResp||hasCV), "ร่วมระบบอื่น (เสี่ยง anaphylaxis)");
      return { score: s, reasons };
    }
  });

  // ========== ANAPHYLAXIS ==========
  rules.push({
    id: "anaphylaxis",
    label: "Anaphylaxis (Type I/Immediate or pseudoallergy)",
    gate() {
      // Criteria 1: skin/mucosa + (resp or CV)
      const skinOrMucosa = itch || swelling || mucosaAny || rashShapes.size > 0;
      const crit1 = skinOrMucosa && (hasResp || hasCV);

      // Criteria 2: ≥2 systems (skin/mucosa, resp, cv, gi)
      const sysCount = (skinOrMucosa?1:0) + (hasResp?1:0) + (hasCV?1:0) + (hasGI?1:0);
      const crit2 = sysCount >= 2;

      // Criteria 3: hypotension (เราตีความจาก cv.hypotension/shock) — ไม่ได้เช็ค SBP exact
      const crit3 = !!cv.hypotension || !!cv.shock;

      return !!(crit1 || crit2 || crit3);
    },
    score() {
      let s=0, reasons=[];
      const skinOrMucosa = itch || swelling || mucosaAny || rashShapes.size > 0;
      s = addScore(s, onset.lt1h || onset.h1to6, 2) && explPush(reasons, (onset.lt1h||onset.h1to6), "onset เร็ว (นาที–ชั่วโมง)");
      s = addScore(s, skinOrMucosa && hasResp, 4) && explPush(reasons, (skinOrMucosa&&hasResp), "skin/mucosa + ระบบหายใจ");
      s = addScore(s, skinOrMucosa && hasCV, 4) && explPush(reasons, (skinOrMucosa&&hasCV), "skin/mucosa + ระบบไหลเวียน");
      s = addScore(s, hasGI, 1) && explPush(reasons, hasGI, "มี GI symptoms ร่วม");
      s = addScore(s, SpO2 && SpO2 < CUT.SpO2_low, 1) && explPush(reasons, (SpO2 && SpO2 < CUT.SpO2_low), `SpO₂ < ${CUT.SpO2_low}%`);
      return { score: s, reasons };
    }
  });

  // ========== FIXED DRUG ERUPTION (FDE) ==========
  rules.push({
    id: "fde",
    label: "Fixed Drug Eruption (Type IV/Delayed)",
    gate() {
      const shape = rashShapes.has("วงกลมชั้นเดียว") || rashShapes.has("วงรี");
      const color = rashColors.has("แดงจัด") || rashColors.has("ม่วง") || rashColors.has("แดงไหม้");
      return shape && color;
    },
    score() {
      let s=0, reasons=[];
      const painItch = itch || painBurn;
      s = addScore(s, rashShapes.has("วงกลมชั้นเดียว") || rashShapes.has("วงรี"), 2) &&
          explPush(reasons, (rashShapes.has("วงกลมชั้นเดียว")||rashShapes.has("วงรี")), "รูปร่างวง/วงรี");
      s = addScore(s, rashColors.has("แดงจัด") || rashColors.has("ม่วง"), 2) &&
          explPush(reasons, (rashColors.has("แดงจัด")||rashColors.has("ม่วง")), "สีแดงจัด/อมม่วงคล้ำ");
      s = addScore(s, painItch, 1) && explPush(reasons, painItch, "เจ็บๆคันๆ");
      s = addScore(s, P1.blister && (P1.blister.large || P1.blister.medium), 1) &&
          explPush(reasons, (P1.blister && (P1.blister.large||P1.blister.medium)), "มีตุ่มน้ำกรณีรุนแรง");
      // timing: แรก 1–2 wk; re-exposure <24h (ถ้าผู้ใช้มี timeline page5 เชื่อมต่อ อาจยกระดับใน brain.js)
      return { score: s, reasons };
    }
  });

  // ========== MACULOPAPULAR EXANTHEM (MPE / MP rash) ==========
  rules.push({
    id: "mpe",
    label: "Maculopapular rash (MPE, Type IV/Delayed)",
    gate() {
      const macPap = rashShapes.has("ตุ่มแบนราบ") || rashShapes.has("ตุ่มนูน") || rashShapes.has("ปื้นนูน");
      const red    = rashColors.has("แดง");
      const sym    = locations.size ? true : false; // ถ้ามีข้อมูลตำแหน่งมักสมมาตร
      return macPap && red;
    },
    score() {
      let s=0, reasons=[];
      s = addScore(s, rashColors.has("แดง"), 2) && explPush(reasons, rashColors.has("แดง"), "ผื่นแดง");
      s = addScore(s, rashShapes.has("ตุ่มนูน") || rashShapes.has("ตุ่มแบนราบ") || rashShapes.has("ปื้นนูน"), 2) &&
          explPush(reasons, (rashShapes.has("ตุ่มนูน")||rashShapes.has("ตุ่มแบนราบ")||rashShapes.has("ปื้นนูน")), "macule/papule");
      s = addScore(s, itch, 1) && explPush(reasons, itch, "คัน");
      s = addScore(s, eosPct >= 5, 1) && explPush(reasons, eosPct >= 5, "Eosinophil ↑ (>5%)");
      s = addScore(s, onset.wk1to6, 1) && explPush(reasons, onset.wk1to6, "onset ~1–2 สัปดาห์ (ตัวชี้นำ Type IV)");
      return { score: s, reasons };
    }
  });

  // ========== AGEP ==========
  rules.push({
    id: "agep",
    label: "AGEP (Type IV/Delayed; EuroSCAR)",
    gate() {
      return !!pustule; // ตุ่มหนองเล็กจำนวนมาก <5mm
    },
    score() {
      let s=0, reasons=[];
      s = addScore(s, pustule, 3) && explPush(reasons, pustule, "ตุ่มหนองเล็กจำนวนมาก");
      // ไข้สูง ≥38°C — ถ้ามี field temp ในหน้า 2 (คุณมีช่อง “ไข้ (°C)” หน้า 2): ให้เพิ่มได้ในอนาคต
      const neutHigh = Number.isFinite(neutPct) && neutPct >= 70; // heuristic
      s = addScore(s, neutHigh, 1) && explPush(reasons, neutHigh, "Neutrophil สูง (สนับสนุน AGEP)");
      s = addScore(s, onset.wk1to6, 1) && explPush(reasons, onset.wk1to6, "onset ~1–3 สัปดาห์");
      return { score: s, reasons };
    }
  });

  // ========== EXFOLIATIVE DERMATITIS ==========
  rules.push({
    id: "exfoliative",
    label: "Exfoliative dermatitis (Type IV/Delayed)",
    gate() {
      // แดงทั้งตัว + ลอกเป็นขุย, มันเงา/น้ำเหลือง/สะเก็ด
      const redish = rashColors.has("แดง") || rashColors.has("มันเงา");
      const scale  = rashShapes.has("ขุย") || rashShapes.has("ผิวหลุดลอก") || rashShapes.has("ลอก");
      return redish && scale;
    },
    score() {
      let s=0, reasons=[];
      const scale = rashShapes.has("ขุย") || rashColors.has("มันเงา");
      s = addScore(s, scale, 3) && explPush(reasons, scale, "แดงทั่ว + ลอกเป็นขุย/มันเงา");
      s = addScore(s, onset.wk1to6, 1) && explPush(reasons, onset.wk1to6, "onset 1–6 สัปดาห์");
      return { score: s, reasons };
    }
  });

  // ========== PHOTOSENSITIVITY ==========
  rules.push({
    id: "photosensitivity",
    label: "Photosensitivity drug eruption (phototoxic/photoallergic; Type IV component)",
    gate() {
      // ตำแหน่งโดนแดด + ลักษณะพิเศษ
      const sunSites = ["หน้า","หน้าอกนอกเสื้อ","หลังมือ","แขนด้านนอก","หน้าแข้ง"];
      const onSun = sunSites.some(s => locations.has(s)) || locations.has("หน้า");
      const photoLook = rashColors.has("แดงไหม้") || (itch && (P1.ooze || P1.crust)); // คร่าว ๆ
      return onSun && photoLook;
    },
    score() {
      let s=0, reasons=[];
      const onSun = locations.has("หน้า") || locations.size>0;
      s = addScore(s, onSun, 2) && explPush(reasons, onSun, "ตำแหน่งโดนแดดชัด");
      s = addScore(s, rashColors.has("แดงไหม้"), 2) && explPush(reasons, rashColors.has("แดงไหม้"), "แดงไหม้/แสบร้อน (phototoxic)");
      s = addScore(s, itch, 1) && explPush(reasons, itch, "คัน/ตุ่มน้ำ/น้ำเหลือง (photoallergic)");
      return { score: s, reasons };
    }
  });

  // ========== BULLOUS DRUG ERUPTION ==========
  rules.push({
    id: "bullousDE",
    label: "Bullous Drug Eruption (Type IV/Delayed)",
    gate() {
      return !!(P1.blister && (P1.blister.large || P1.blister.medium));
    },
    score() {
      let s=0, reasons=[];
      const bullae = P1.blister && (P1.blister.large || P1.blister.medium);
      s = addScore(s, bullae, 3) && explPush(reasons, bullae, "ตุ่มน้ำพองตึง/ขนาดใหญ่");
      s = addScore(s, painBurn, 1) && explPush(reasons, painBurn, "เจ็บแสบ");
      s = addScore(s, onset.wk1to6, 1) && explPush(reasons, onset.wk1to6, "onset 1–3 สัปดาห์");
      return { score: s, reasons };
    }
  });

  // ========== ERYTHEMA MULTIFORME (EM) ==========
  rules.push({
    id: "em",
    label: "Erythema multiforme (Type IV/Delayed)",
    gate() {
      // target-like 3 ชั้น, ผิวหนัง + เยื่อบุ 1 ตำแหน่ง (minor) / >1 (major ≈ SJS)
      const targetish = rashShapes.has("วงกลม 3 ชั้น") || rashShapes.has("เป้ายิงธนู");
      return targetish;
    },
    score() {
      let s=0, reasons=[];
      const targetish = rashShapes.has("วงกลม 3 ชั้น") || rashShapes.has("เป้ายิงธนู");
      s = addScore(s, targetish, 3) && explPush(reasons, targetish, "targetoid (3 ชั้น) ลักษณะ EM");
      s = addScore(s, mucosaAny, 1) && explPush(reasons, mucosaAny, "มีเยื่อบุร่วม");
      s = addScore(s, onset.wk1to6, 1) && explPush(reasons, onset.wk1to6, "onset ~1 สัปดาห์");
      // ถ้า mucosa ≥2 ควรผลักไป SJS ในกติกา SJS/TEN
      return { score: s, reasons };
    }
  });

  // ========== SJS ==========
  rules.push({
    id: "sjs",
    label: "SJS (Type IV/Delayed)",
    gate() {
      // Atypical target lesion, mucosal ≥2 sites, skin detachment <10%
      const atypicalTarget = rashShapes.has("เป้าไม่ครบ 3 ชั้น") || skinDetach.center || rashColors.has("เทา") || rashColors.has("ดำ");
      const muc2 = mucosaCount >= 2;
      const detLT10 = !!skinDetach.lt10;
      return (atypicalTarget && muc2) || detLT10;
    },
    score() {
      let s=0, reasons=[];
      s = addScore(s, mucosaCount >= 2, 3) && explPush(reasons, mucosaCount >= 2, "เยื่อบุ ≥2 แห่ง");
      s = addScore(s, skinDetach.lt10, 3) && explPush(reasons, skinDetach.lt10, "ผิวหนังหลุดลอก <10% BSA");
      s = addScore(s, onset.wk1to6, 1) && explPush(reasons, onset.wk1to6, "onset 1–3 สัปดาห์");
      return { score: s, reasons };
    }
  });

  // ========== TEN ==========
  rules.push({
    id: "ten",
    label: "TEN (Type IV/Delayed)",
    gate() {
      return !!skinDetach.gt30;
    },
    score() {
      let s=0, reasons=[];
      s = addScore(s, skinDetach.gt30, 5) && explPush(reasons, skinDetach.gt30, "ผิวหนังหลุดลอก >30% BSA");
      s = addScore(s, mucosaAny, 1) && explPush(reasons, mucosaAny, "มักมีเยื่อบุร่วม");
      s = addScore(s, onset.wk1to6, 1) && explPush(reasons, onset.wk1to6, "onset 1–3 สัปดาห์");
      return { score: s, reasons };
    }
  });

  // ========== DRESS (RegiSCAR gate) ==========
  rules.push({
    id: "dress",
    label: "DRESS (Type IV/Delayed; RegiSCAR-like gate)",
    gate() {
      // ต้องมี: ผิวหนัง + (กลุ่มระบบ/เม็ดเลือด ≥1) + (อวัยวะภายใน ≥1) + timing 2–6 สัปดาห์
      const skinReq = true; // มีผื่นใดๆ หน้าที่คุณเก็บไว้ถือว่ามี (ปรับเข้ม: สีแดง/ลอก/ตุ่ม/จ้ำเลือดใดๆ)
      const sysOrHema =
        (eosPct >= CUT.eosPct) ||
        (aecAbs >= CUT.eosAbs700) ||
        (Number.isFinite(atypical) && atypical > 0) ||
        (P2.fever && num(P2.fever.value) >= 37.5) ||
        (P2.nodes && P2.nodes.has); // ต่อมน้ำเหลืองโต ถ้ามีช่อง

      const organ =
        (ALT >= CUT.ALT_AST_2xULN_or_40) || (AST >= CUT.ALT_AST_2xULN_or_40) ||
        (Number.isFinite(Cr) && Cr >= 1.5) || // งานจริงควรเทียบ baseline — ที่นี่ใช้ heuristic
        (!!UA_prot && UA_prot !== "0" && UA_prot !== "neg") ||
        (SpO2 && SpO2 < CUT.SpO2_low) ||
        (tropI && tropI > CUT.troponinI) ||
        (tropT && tropT > CUT.troponinT_low) ||
        (/st|\bqt\b|block|arrhythm/.test(EKG)) ||
        P2.thyroiditis || P2.pneumonitis || P2.nephritis || P2.hepatitis; // ช่องเผื่อหน้า 2

      const timingOK = onset.wk1to6; // 2–6 สัปดาห์ (เราใส่เป็นช่วง 1–6 สัปดาห์จากตัวเลือก)
      return skinReq && sysOrHema && organ && timingOK;
    },
    score() {
      let s=0, reasons=[];
      const e_eos = (aecAbs >= CUT.eosAbs1500) || (eosPct >= CUT.eosPct);
      s = addScore(s, e_eos, 2) && explPush(reasons, e_eos, "Eosinophil สูง (≥10% หรือ AEC ≥700/µL; เด่นถ้า ≥1500/µL)");
      const liver = (ALT >= CUT.ALT_AST_2xULN_or_40) || (AST >= CUT.ALT_AST_2xULN_or_40);
      s = addScore(s, liver, 2) && explPush(reasons, liver, "LFT สูง (ตับอักเสบ)");
      const kidney = (Number.isFinite(Cr) && Cr >= 1.5) || (!!UA_prot && UA_prot !== "0" && UA_prot !== "neg");
      s = addScore(s, kidney, 2) && explPush(reasons, kidney, "ไตเกี่ยวข้อง (Cr/UA)");
      s = addScore(s, SpO2 && SpO2 < CUT.SpO2_low, 1) && explPush(reasons, (SpO2 && SpO2 < CUT.SpO2_low), "SpO₂ <94%");
      s = addScore(s, onset.wk1to6, 2) && explPush(reasons, onset.wk1to6, "onset 2–6 สัปดาห์");
      return { score: s, reasons };
    }
  });

  // ========== SERUM SICKNESS-LIKE ==========
  rules.push({
    id: "serumSickness",
    label: "Serum-sickness–like reaction (Type III frame)",
    gate() {
      // ไข้ + ผื่น (urticarial/morbilliform) + ข้ออักเสบ/ปวดข้อ + ต่อมน้ำเหลืองโต; C3/C4 ลดลงในแท้ (ถ้ามี)
      const fever = P2.fever && num(P2.fever.value) >= 38;
      const rashUrtOrMPE = rashShapes.has("ปื้นนูน") || rashShapes.has("ตุ่มนูน") || rashColors.has("แดง");
      const joint = P2.msk?.arthralgia || P2.msk?.arthritis || P2.msk?.jointPain;
      const nodes = P2.nodes?.has;
      return (fever && rashUrtOrMPE && (joint || nodes));
    },
    score() {
      let s=0, reasons=[];
      const cLow = /c3.*<\s*90|c4.*<\s*10/.test(C3C4);
      s = addScore(s, true, 2) && explPush(reasons, true, "ไข้ + ผื่น + ข้อ/ต่อมน้ำเหลือง");
      s = addScore(s, cLow, 1) && explPush(reasons, cLow, "Complement ต่ำ (กรณี serum sickness แท้)");
      return { score: s, reasons };
    }
  });

  // ========== HEMOLYTIC ANEMIA ==========
  rules.push({
    id: "hemolyticAnemia",
    label: "Immune hemolytic anemia (Type II)",
    gate() {
      // ใช้ heuristic จากอาการ + เม็ดเลือด (Hb ต่ำอย่างมีนัย) — DAT/LDH/indirect bili/haptoglobin ไม่ได้เก็บในหน้า 3 ตอนนี้
      return Number.isFinite(hb) && hb < (CUT.Hb_low - 1); // <9 g/dL เน้นกรณีเด่น
    },
    score() {
      let s=0, reasons=[];
      s = addScore(s, Number.isFinite(hb) && hb < CUT.Hb_low, 2) && explPush(reasons, (Number.isFinite(hb) && hb < CUT.Hb_low), `Hb ต่ำ (<${CUT.Hb_low} g/dL)`);
      s = addScore(s, cv.hypotension || cv.shock, 1) && explPush(reasons, (cv.hypotension||cv.shock), "ความดันต่ำ/ช็อก");
      // ถ้ามี UA hemoglobinuria แยกจาก RBC (ปัจจุบันไม่มีฟิลด์): ข้ามไป
      return { score: s, reasons };
    }
  });

  // ========== PANCYTOPENIA ==========
  rules.push({
    id: "pancytopenia",
    label: "Pancytopenia (Type II frame)",
    gate() {
      // Hb <10, WBC <4,000, Plt <100,000 — อย่างน้อย 2 ใน 3
      const c = [
        Number.isFinite(hb)  && hb  < 10,
        Number.isFinite(wbc) && wbc < 4000,
        Number.isFinite(plt) && plt < 100000,
      ].filter(Boolean).length;
      return c >= 2;
    },
    score() {
      let s=0, reasons=[];
      s = addScore(s, Number.isFinite(hb) && hb < 10, 1) && explPush(reasons, (Number.isFinite(hb) && hb < 10), "Hb <10");
      s = addScore(s, Number.isFinite(wbc) && wbc < 4000, 1) && explPush(reasons, (Number.isFinite(wbc) && wbc < 4000), "WBC <4,000");
      s = addScore(s, Number.isFinite(plt) && plt < 100000, 1) && explPush(reasons, (Number.isFinite(plt) && plt < 100000), "Plt <100,000");
      return { score: s, reasons };
    }
  });

  // ========== NEUTROPENIA ==========
  rules.push({
    id: "neutropenia",
    label: "Neutropenia (Type II frame)",
    gate() {
      return Number.isFinite(anc) && anc < CUT.ANC_neutropenia;
    },
    score() {
      let s=0, reasons=[];
      s = addScore(s, Number.isFinite(anc) && anc < CUT.ANC_neutropenia, 2) && explPush(reasons, (Number.isFinite(anc) && anc < CUT.ANC_neutropenia), `ANC <${CUT.ANC_neutropenia}`);
      s = addScore(s, anc < CUT.ANC_severe, 1) && explPush(reasons, (anc < CUT.ANC_severe), `Severe <${CUT.ANC_severe}`);
      return { score: s, reasons };
    }
  });

  // ========== THROMBOCYTOPENIA ==========
  rules.push({
    id: "thrombocytopenia",
    label: "Thrombocytopenia (Type II frame)",
    gate() {
      return Number.isFinite(plt) && plt < CUT.Plt_low;
    },
    score() {
      let s=0, reasons=[];
      s = addScore(s, Number.isFinite(plt) && plt < CUT.Plt_low, 2) && explPush(reasons, (Number.isFinite(plt) && plt < CUT.Plt_low), `Plt <${CUT.Plt_low}`);
      s = addScore(s, Number.isFinite(plt) && plt < CUT.Plt_severe, 1) && explPush(reasons, (Number.isFinite(plt) && plt < CUT.Plt_severe), `<${CUT.Plt_severe} (รุนแรง)`);
      return { score: s, reasons };
    }
  });

  // ========== NEPHRITIS ==========
  rules.push({
    id: "nephritis",
    label: "Drug-induced nephritis (Type II/IV frame)",
    gate() {
      // Cr ↑ / eGFR <60 / UA-protein / hematuria (ถ้าเก็บ) + อาการนำไข้/ผื่น/ปวดสีข้าง (หน้า 2)
      const renal =
        (Number.isFinite(Cr) && Cr >= 1.5) ||
        (Number.isFinite(eGFR) && eGFR < 60) ||
        (!!UA_prot && UA_prot !== "0" && UA_prot !== "neg");
      return renal;
    },
    score() {
      let s=0, reasons=[];
      const renal =
        (Number.isFinite(Cr) && Cr >= 1.5) ||
        (Number.isFinite(eGFR) && eGFR < 60) ||
        (!!UA_prot && UA_prot !== "0" && UA_prot !== "neg");
      s = addScore(s, renal, 3) && explPush(reasons, renal, "ไตเกี่ยวข้อง (Cr/eGFR/UA protein)");
      s = addScore(s, onset.wk1to6, 1) && explPush(reasons, onset.wk1to6, "onset 1–2 สัปดาห์ (พบบ่อย)");
      return { score: s, reasons };
    }
  });

  // ------------------------- REGISTER RULES -----------------------------
  window.brainRules = rules;

  // (ตัวเลือก) ให้ brain.js เห็น cutoff ใช้งานร่วม (ไม่บังคับ)
  window.brainCutoffs = CUT;

  // หมายเหตุ:
  // - brain.js ของคุณจะเป็นคนเรียกใช้ window.brainRules เพื่อให้คะแนน + จัดอันดับ
  // - ปุ่ม "รีเฟรชผลประเมิน" ในหน้า 6 จะคอล brain.js (evaluateDrugAllergy/brainComputeAndRender)
  //   ซึ่งจะอ่านกฎจากไฟล์นี้อัตโนมัติ
  //
  // หากต้องการ fine-tune น้ำหนัก: แก้ใน score() ของแต่ละ phenotype ได้เลย
})();

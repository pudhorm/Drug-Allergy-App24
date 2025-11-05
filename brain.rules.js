// ===================== brain.rule.js — สมองประเมินชนิดผื่นแพ้ยา (เวอร์ชันใหม่ทั้งไฟล์) =====================
(function () {
  // --------- UTIL ---------
  const d = () => (window.drugAllergyData || {});
  const p1 = () => (d().page1 || {});
  const p2 = () => (d().page2 || {});
  const p3 = () => (d().page3 || {});
  const arr = (v) => (Array.isArray(v) ? v : []);
  const str = (v) => (v == null ? "" : String(v));
  const num = (v) => {
    const n = Number(String(v).replace(/[, ]+/g, ""));
    return Number.isFinite(n) ? n : NaN;
  };
  const hasAny = (...vals) => vals.some(Boolean);

  function includesInsensitive(a, needle) {
    return arr(a).some((x) => String(x).trim() === String(needle).trim());
  }

  // --------- READ SIGNALS (ทนทานชื่อฟิลด์เดิมของคุณ) ---------
  function readSignals() {
    const _p1 = p1();
    const _p2 = p2();
    const _p3 = p3();

    const rashShapes  = arr(_p1.rashShapes || _p1.rashShape);
    const rashColors  = arr(_p1.rashColors || _p1.rashColor);
    const locations   = arr(_p1.locations || _p1.rashLocations || _p1.site);
    const itch        = _p1.itch && (_p1.itch.has || _p1.itch === true || _p1.itch === "คัน");
    const swelling    = _p1.swelling && (_p1.swelling.has || _p1.swelling === true);
    const painBurn    = _p1.pain?.has || _p1.burning?.has || _p1.pain === true;
    const pustule     = _p1.pustule?.has || includesInsensitive(rashShapes, "ตุ่มหนอง");
    const vesicle     = _p1.blister?.has || includesInsensitive(rashShapes, "ตุ่มน้ำ");
    const peelCenter  = _p1.skinDetach?.center || includesInsensitive(rashShapes, "ผิวหนังหลุดลอกตรงกลางผื่น");
    const skinLt10    = _p1.skinDetach?.lt10;
    const skinGt30    = _p1.skinDetach?.gt30;
    const dryScale    = (_p1.scales?.has || _p1.dry?.has || _p1.peeling?.has || includesInsensitive(rashShapes, "ขุย/แห้ง/ลอก"));

    const onsetRaw = str(_p1.onset || _p1.timeline);
    const onset = {
      lt1h: /ภายใน\s*1\s*ชั่วโมง|<\s*1\s*hr|<\s*1\s*ชม/i.test(onsetRaw),
      h1_6: /1[\s–-]?6\s*ชั่วโมง|1-6\s*ชม|1–6\s*ชม/i.test(onsetRaw),
      h6_24: /6[\s–-]?24\s*ชั่วโมง|6-24\s*ชม/i.test(onsetRaw),
      d1_7: /1[\s–-]?7\s*วัน|1-7\s*วัน/i.test(onsetRaw),
      w1_3: /1[\s–-]?3\s*สัปดาห์|1-3\s*สัปดาห์/i.test(onsetRaw),
      w1_6: /1[\s–-]?6\s*สัปดาห์|1-6\s*สัปดาห์/i.test(onsetRaw),
      w2_6: /2[\s–-]?6\s*สัปดาห์|2-6\s*สัปดาห์/i.test(onsetRaw),
      custom: onsetRaw
    };

    // page2 systems
    const resp = _p2.resp || {};
    const cv   = _p2.cv || {};
    const gi   = _p2.gi || {};
    const fever = _p2.fever?.value || _p2.fever || _p1.fever; // บางที่อยู่หน้า 1 หรือ 2
    const feverVal = num(fever);

    // page3 labs
    const cbc = _p3.cbc || {};
    const lft = _p3.lft || {};
    const rft = _p3.rft || {};
    const inflam = _p3.inflam || _p3.inflammation || {};
    const igE = num(_p3?.immunology?.ige?.value || _p3?.ige?.value);

    const eosPct = num(cbc?.eos?.value);
    const aec    = num(cbc?.aec?.value);
    const wbc    = num(cbc?.wbc?.value || cbc?.WBC?.value);
    const neut   = num(cbc?.neutrophil?.value || cbc?.neut?.value);
    const hb     = num(cbc?.hb?.value || cbc?.hemoglobin?.value);
    const plt    = num(cbc?.platelet?.value);
    const anc    = num(cbc?.anc?.value);

    const alt = num(lft?.alt?.value);
    const ast = num(lft?.ast?.value);
    const biliT = num(lft?.tb || lft?.tbil || lft?.totalBili?.value);
    const biliD = num(lft?.db || lft?.directBili?.value);

    const cr  = num(rft?.creatinine?.value || rft?.cr?.value);
    const bun = num(rft?.bun?.value);
    const egfr = num(rft?.egfr?.value);
    const spo2 = num(_p2?.resp?.spo2?.value || _p2?.spo2?.value);

    // CV hypotension flags (คร่าวๆ ถ้ามี)
    const hypotension = !!(cv?.hypotension || cv?.shock || (num(cv?.sbp) && num(cv?.sbp) < 90));

    // EM target 3 ชั้น (หน้า 1: รูปร่าง/สี)
    const target3 = includesInsensitive(rashShapes, "วงกลม 3 ชั้น") || includesInsensitive(rashShapes, "วง 3 ชั้น") || /3\s*ชั้น/i.test(rashShapes.join(","));

    // รูปแบบอื่นๆ
    const symmetric = includesInsensitive(_p1.distribution || [], "สมมาตร") || /สมมาตร/i.test(str(_p1.distributionText));
    const mucosaCount = num(_p1?.mucosaSitesCount?.value) || 0;
    const mucosaAny = !!(_p1?.mucosaInvolved || mucosaCount > 0);

    // FDE features ที่สำคัญ
    const wellDemarcated = includesInsensitive(rashShapes, "ขอบเรียบ") || includesInsensitive(rashShapes, "ขอบชัด") || _p1.wellDemarcated;
    const roundOval = includesInsensitive(rashShapes, "วงกลมชั้นเดียว") || includesInsensitive(rashShapes, "วงรี") || _p1.roundOrOval;
    const violaceousCenter = includesInsensitive(rashColors, "ม่วง") || includesInsensitive(rashColors, "ดำ") || /คล้ำ|ม่วง/i.test(rashColors.join(","));
    const solitaryOrFew = num(_p1?.lesionCount) === 1 || num(_p1?.lesionCount) <= 3 || _p1?.count?.solitary || _p1?.count?.few;
    const recursSameSite = !!_p1?.recursSameSite;
    const leavesPIH = !!_p1?.PIH_after || includesInsensitive(rashColors, "ดำ");

    // Photosensitivity
    const sunExposedOnly = !!_p1?.sunExposedOnly;
    const sharpClothingLines = !!_p1?.sharpClothingLines;
    const photoHistory = !!_p1?.photoHistory;

    // ผู้ใช้ “มีข้อมูล” อย่างน้อย 1 อย่าง?
    const anyUserInput =
      hasAny(rashShapes.length, rashColors.length, locations.length, itch, swelling, pustule, vesicle, peelCenter, skinLt10, skinGt30, dryScale) ||
      hasAny(resp?.dyspnea, resp?.wheeze, resp?.stridor, resp?.hoarseness) ||
      hasAny(cv?.hypotension, cv?.shock, num(cv?.sbp)) ||
      hasAny(feverVal, eosPct, aec, alt, ast, cr, anc, plt, egfr, spo2) ||
      hasAny(target3, symmetric, mucosaAny, wellDemarcated, roundOval, violaceousCenter, solitaryOrFew, recursSameSite, leavesPIH, sunExposedOnly, sharpClothingLines, photoHistory);

    return {
      rashShapes, rashColors, locations, itch, swelling, painBurn, pustule, vesicle, peelCenter, skinLt10, skinGt30, dryScale,
      onset, resp, cv, gi, feverVal,
      eosPct, aec, wbc, neut, hb, plt, anc, alt, ast, biliT, biliD, cr, bun, egfr, spo2, hypotension,
      target3, symmetric, mucosaAny, mucosaCount,
      wellDemarcated, roundOval, violaceousCenter, solitaryOrFew, recursSameSite, leavesPIH,
      sunExposedOnly, sharpClothingLines, photoHistory,
      anyUserInput
    };
  }

  // --------- RULE CORE (gate + pattern + penalty) ---------
  function scoreBlock(sig, block) {
    let s = 0, why = [];

    function add(v, reason) { s += v; if (reason) why.push(reason + ` (+${v})`); }
    function sub(v, reason) { s -= v; if (reason) why.push(reason + ` (−${v})`); }

    // convenience helpers
    const T = {
      timing: {
        urticaria_ae: () => sig.onset.lt1h || sig.onset.h1_6,
        anaphylaxis: () => sig.onset.lt1h || sig.onset.h1_6 || sig.onset.h6_24,
        fde_first: () => sig.onset.w1_3 || sig.onset.d1_7 || sig.onset.w1_6,
        fde_reexpo: () => /24\s*ช|24\s*h|1\s*วัน/i.test(sig.onset.custom),
        mpe:       () => sig.onset.d1_7 || sig.onset.w1_3,
        em:        () => sig.onset.d1_7 || sig.onset.w1_3,
        agep:      () => sig.onset.d1_7 || /1-3\s*วัน|1[\s–-]?3\s*วัน/i.test(sig.onset.custom),
        sjsten:    () => sig.onset.w1_3 || sig.onset.d1_7,
        dress:     () => sig.onset.w2_6 || sig.onset.w1_6
      }
    };

    // run block rule-set (each phenotype implements below)
    block(sig, { add, sub, T });

    return { score: s, why };
  }

  // --------- PHENOTYPE RULES ---------
  const PHENOS = [
    {
      key: "Urticaria",
      base: 1,
      runner(sig, api) {
        const { add, sub, T } = api;
        if (T.timing.urticaria_ae()) add(2, "เวลาเข้ากับลมพิษเฉียบพลัน");
        if (sig.itch) add(2, "คันเด่น");
        if (includesInsensitive(sig.rashShapes, "ปื้นนูน")) add(2, "ลักษณะปื้นนูน (wheal)");
        if (sig.swelling) add(1, "บวมร่วม");
        if (sig.pustule || sig.vesicle || sig.dryScale) sub(2, "มีตุ่มน้ำ/หนอง/ขุย (ไม่จำเพาะลมพิษ)");
        if (sig.mucosaAny) sub(1, "เกี่ยวเยื่อบุ (ไม่เด่นในลมพิษทั่วไป)");
      }
    },
    {
      key: "Angioedema",
      base: 1,
      runner(sig, api) {
        const { add, sub, T } = api;
        if (T.timing.urticaria_ae()) add(2, "เริ่มเร็ว <6 ชม.");
        if (sig.swelling) add(3, "บวมชัด (ชั้นลึก)");
        if (!sig.itch && sig.painBurn) add(1, "ปวด/แสบมากกว่า 'คัน' (bradykinin-mediated ได้)");
        if (sig.pustule || sig.vesicle || sig.dryScale) sub(2, "มีตุ่ม/ขุย ไม่ใช่ลักษณะ AE");
      }
    },
    {
      key: "Anaphylaxis",
      base: 0,
      runner(sig, api) {
        const { add, sub, T } = api;
        if (T.timing.anaphylaxis()) add(2, "เวลาเข้าได้กับภาวะแอนาฟิลักซิส");
        const skin = sig.itch || includesInsensitive(sig.rashShapes, "ปื้นนูน");
        const resp = sig.resp?.dyspnea || sig.resp?.wheeze || sig.resp?.stridor || sig.resp?.hoarseness;
        const cv   = sig.hypotension;
        const gi   = sig.gi?.cramp || sig.gi?.vomit || sig.gi?.diarrhea;
        let systems = 0;
        if (skin) systems++;
        if (resp) systems++;
        if (cv) systems++;
        if (gi) systems++;
        if (systems >= 2) add(5, "มี ≥2 ระบบพร้อมกัน (WAO)");
        if (sig.hypotension) add(3, "ความดันต่ำ/ช็อก");
        if (sig.spo2 && sig.spo2 < 94) add(2, "SpO₂ <94%");
      }
    },
    {
      key: "Fixed drug eruption",
      base: 1,
      runner(sig, api) {
        const { add, sub, T } = api;
        if (T.timing.fde_first()) add(1, "เวลา (ครั้งแรก ~1–2 สัปดาห์)");
        if (T.timing.fde_reexpo()) add(3, "re-exposure ≤24 ชม.");
        if (sig.roundOval) add(2, "รอยกลม/รี");
        if (sig.wellDemarcated) add(2, "ขอบคมชัด");
        if (sig.violaceousCenter) add(2, "กลางม่วง/คล้ำ");
        if (sig.solitaryOrFew) add(2, "จำนวนเดี่ยว/น้อย");
        if (sig.recursSameSite) add(2, "ขึ้นซ้ำตำแหน่งเดิม");
        if (sig.leavesPIH) add(1, "ทิ้งรอยดำหลังยุบ");
        if (sig.symmetric) sub(2, "กระจายสมมาตรแบบกว้าง (ชี้ MPE)");
        if (sig.mucosaAny && sig.mucosaCount > 1) sub(2, "เยื่อบุหลายตำแหน่ง (สวน FDE)");
      }
    },
    {
      key: "Maculopapular exanthem",
      base: 1,
      runner(sig, api) {
        const { add, sub, T } = api;
        if (T.timing.mpe()) add(2, "เวลา ~5–14 วันหลังเริ่มยา");
        if (sig.symmetric) add(2, "สมมาตรลำตัวเด่น");
        if (sig.itch) add(1, "คัน");
        if (!sig.mucosaAny) add(1, "ไม่มีเยื่อบุ");
        // แยกจาก FDE
        if (sig.solitaryOrFew && sig.wellDemarcated && sig.leavesPIH) sub(3, "แพทเทิร์น FDE");
        // แยกจาก EM/AGEP
        if (sig.target3) sub(2, "มี target 3 ชั้น (ชี้ EM)");
        if (sig.pustule) sub(2, "ตุ่มหนองจำนวนมาก (ชี้ AGEP)");
      }
    },
    {
      key: "Erythema multiforme",
      base: 0,
      runner(sig, api) {
        const { add, sub, T } = api;
        if (T.timing.em()) add(1, "เวลา ~1 สัปดาห์");
        if (sig.target3) add(4, "target lesion 3 ชั้นชัด");
        if (sig.mucosaAny && sig.mucosaCount <= 1) add(1, "เยื่อบุ 0–1 แห่ง (EM)");
        if (sig.mucosaCount >= 2) sub(2, "เยื่อบุหลายแห่ง (ไป SJS)");
      }
    },
    {
      key: "AGEP",
      base: 0,
      runner(sig, api) {
        const { add, sub, T } = api;
        if (T.timing.agep()) add(2, "เวลา 1–3 วัน/ไม่กี่วัน");
        if (sig.pustule) add(4, "ตุ่มหนองเล็ก non-follicular จำนวนมาก");
        if (sig.feverVal && sig.feverVal >= 38) add(1, "ไข้ ≥38 °C");
        if (num(sig.neut) && sig.neut > 7500) add(1, "นิวโทรฟิลสูง");
        if (sig.dryScale) add(1, "ตามด้วยลอกเป็นขุย");
        if (sig.mucosaAny) sub(1, "เยื่อบุไม่เด่นใน AGEP");
      }
    },
    {
      key: "SJS",
      base: 0,
      runner(sig, api) {
        const { add, sub, T } = api;
        if (T.timing.sjsten()) add(1, "เวลา 1–3 สัปดาห์");
        if (sig.mucosaCount >= 2) add(3, "เยื่อบุ ≥2 แห่ง");
        if (sig.skinLt10 || sig.peelCenter) add(2, "ผิวหลุดลอกเล็กน้อย/เริ่มกลางผื่น");
        if (sig.skinGt30) sub(3, "หลุดลอก >30% (ไป TEN)");
      }
    },
    {
      key: "TEN",
      base: 0,
      runner(sig, api) {
        const { add, sub, T } = api;
        if (T.timing.sjsten()) add(1, "เวลา 1–3 สัปดาห์");
        if (sig.skinGt30) add(5, "ผิวหนังหลุดลอก >30% BSA");
        if (sig.mucosaCount >= 2) add(2, "เยื่อบุหลายแห่งร่วม");
      }
    },
    {
      key: "Photosensitivity drug eruption",
      base: 0,
      runner(sig, api) {
        const { add } = api;
        if (sig.sunExposedOnly) add(3, "จำกัดเฉพาะบริเวณโดนแดด");
        if (sig.sharpClothingLines) add(2, "มีเส้นขอบเสื้อผ้าชัด");
        if (sig.photoHistory) add(1, "สัมพันธ์แสงแดด/ยา");
        if (includesInsensitive(sig.rashColors, "แดงไหม้")) add(1, "ลักษณะไหม้แดด");
      }
    },
    {
      key: "Eczematous drug eruption",
      base: 0,
      runner(sig, api) {
        const { add, sub } = api;
        if (sig.dryScale) add(2, "ขุย/แห้ง/ลอก");
        if (sig.itch) add(1, "คันมาก");
        if (sig.vesicle) add(1, "ตุ่มน้ำ/น้ำเหลือง");
        if (sig.pustule) sub(1, "ตุ่มหนองจำนวนมาก (สวน eczematous)");
      }
    },
    {
      key: "Exfoliative dermatitis",
      base: 0,
      runner(sig, api) {
        const { add } = api;
        if (sig.dryScale && sig.symmetric) add(2, "แดงลอกทั่วร่างกายแบบต่อเนื่อง");
        if (includesInsensitive(sig.rashColors, "มันเงา")) add(1, "ผิวมันเงา");
      }
    },
    {
      key: "Bullous drug eruption",
      base: 0,
      runner(sig, api) {
        const { add, sub } = api;
        if (sig.vesicle && !sig.skinGt30) add(2, "ตุ่มน้ำพองใหญ่/ไม่กว้างมาก");
        if (sig.painBurn) add(1, "เจ็บแสบ");
        if (sig.skinGt30) sub(2, "ลอกกว้าง >30% (ไป TEN)");
      }
    },
    {
      key: "DRESS (RegiSCAR pattern)",
      base: 0,
      runner(sig, api) {
        const { add, sub, T } = api;
        if (T.timing.dress()) add(2, "เวลา 2–6 สัปดาห์");
        // Gate 3 ชั้นย่อ: ผิวหนัง + (ไข้/เม็ดเลือด) + อวัยวะภายใน
        let gate = 0;
        const skin = true; // มีผื่นอยู่แล้วจากหน้าผิวหนัง
        if (skin) gate++;
        const sys = ((sig.feverVal && sig.feverVal >= 37.5) ? 1 : 0) +
                    ((Number.isFinite(sig.eosPct) && sig.eosPct >= 10) || (Number.isFinite(sig.aec) && sig.aec >= 700) ? 1 : 0);
        if (sys) gate++;
        const organ = (
          (Number.isFinite(sig.alt) && sig.alt >= 40) || (Number.isFinite(sig.ast) && sig.ast >= 40) ||
          (Number.isFinite(sig.cr) && (sig.cr - (num(p3()?.rft?.cr_base) || 0)) >= 0.3) ||
          (Number.isFinite(sig.spo2) && sig.spo2 < 94)
        );
        if (organ) gate++;
        if (gate >= 3) add(5, "ผ่าน RegiSCAR gate (ผิวหนัง + ระบบ/เม็ดเลือด + อวัยวะ)");
        if (sig.eosPct >= 10 || sig.aec >= 700) add(1, "Eosinophilia");
        if (sig.alt >= 40 || sig.ast >= 40) add(1, "ตับอักเสบ");
      }
    },
    {
      key: "Serum sickness / SSLR",
      base: 0,
      runner(sig, api) {
        const { add } = api;
        if (sig.feverVal && sig.feverVal >= 38) add(1, "ไข้");
        if (sig.itch || includesInsensitive(sig.rashShapes, "ปื้นนูน")) add(1, "ผื่นลมพิษ/MP rash");
        if (sig.cv?.edema_periorbital || sig.swelling) add(1, "บวมรอบตา/บวม");
        // complement/lab ละไว้ถ้ายังไม่มีในแบบฟอร์ม
      }
    },
    {
      key: "Hemolytic anemia (Type II)",
      base: 0,
      runner(sig, api) {
        const { add } = api;
        if (Number.isFinite(sig.hb) && sig.hb < 10) add(2, "Hb ต่ำ");
        // ถ้ามี LDH/indirect bili/haptoglobin ในอนาคตจะเพิ่มได้
      }
    },
    {
      key: "Neutropenia (Type II)",
      base: 0,
      runner(sig, api) {
        const { add } = api;
        if (Number.isFinite(sig.anc) && sig.anc < 1500) add(3, "ANC <1500");
      }
    },
    {
      key: "Thrombocytopenia (Type II)",
      base: 0,
      runner(sig, api) {
        const { add } = api;
        if (Number.isFinite(sig.plt) && sig.plt < 150000) add(3, "Platelet <150,000");
      }
    },
    {
      key: "Drug-induced nephritis (Type II)",
      base: 0,
      runner(sig, api) {
        const { add } = api;
        if (Number.isFinite(sig.cr) && sig.cr >= (num(p3()?.rft?.cr_base) || 0) + 0.3) add(2, "Cr ↑ ≥0.3 mg/dL");
        if (Number.isFinite(sig.egfr) && sig.egfr < 60) add(1, "eGFR <60");
      }
    }
  ];

  // --------- MAIN COMPUTE ---------
  function compute() {
    const sig = readSignals();

    // ถ้าไม่กรอกอะไรเลย → ยังให้ “อันดับ” จาก basePrior เบาๆ เพื่อไม่ขึ้น empty
    // แต่หากผู้ใช้กรอกอย่างน้อย 1 อย่าง ระบบจะให้คะแนนจริงจังตามกฎ
    const results = PHENOS.map(ph => {
      const { score, why } = scoreBlock(sig, (sig2, api) => ph.runner(sig2, api));
      const total = ph.base + score;
      return { name: ph.key, score: total, why };
    });

    // จัดอันดับสูง→ต่ำ
    results.sort((a, b) => b.score - a.score);

    // ตัด Top 5 เสมอ
    const top5 = results.slice(0, 5);

    return { sig, results, top5 };
  }

  // --------- RENDER ---------
  function renderRanked({ top5 }) {
    let el = document.getElementById("brainBox");
    if (!el) {
      el = document.createElement("div");
      el.id = "brainBox";
      el.style.display = "none"; // ให้ bridge หน้า 6 mirror ไปเอง
      document.body.appendChild(el);
    }

    const html = `
      <div class="p6-brain-output">
        <div style="font-weight:800; margin-bottom:.35rem;">ผลการประเมิน — 5 อันดับที่เป็นไปได้</div>
        <ol class="p6-list" style="margin:0 0 6px 18px; padding:0;">
          ${top5
            .map((it, i) => {
              const why = it.why.slice(0, 3).map(w => `<li>${w}</li>`).join("") || "<li>หลักฐานสนับสนุนเบื้องต้น</li>";
              return `
                <li style="margin:6px 0;">
                  <div><strong>${i + 1}) ${it.name}</strong> — คะแนน ${it.score.toFixed(1)}</div>
                  <ul style="margin:2px 0 0 18px;">${why}</ul>
                </li>`;
            })
            .join("")}
        </ol>
        <div class="p6-muted" style="margin-top:.4rem;">(ระบบจะอัปเดตอัตโนมัติเมื่อกรอก/ติ๊กข้อมูลเพิ่ม หรือลองกด “รีเฟรชผลประเมิน” ที่หน้า 6)</div>
      </div>
    `;
    el.innerHTML = html;

    // แจ้งให้ bridge อัปเดตไป #p6BrainBox
    try { document.dispatchEvent(new Event("da:update")); } catch (_) {}
  }

  // --------- PUBLIC API ---------
  function brainComputeAndRender() {
    try {
      const out = compute();
      renderRanked(out);
      return out;
    } catch (e) {
      console.warn("[brain.rule] compute error:", e);
      // แม้ error ก็จะพยายามเรนเดอร์อันดับจาก basePrior ให้ได้ 5 อันดับ
      try {
        const fallback = { top5: PHENOS.slice(0, 5).map(p => ({ name: p.key, score: p.base, why: ["base prior"] })) };
        renderRanked(fallback);
      } catch (_) {}
    }
  }

  // bind global
  window.brainComputeAndRender = brainComputeAndRender;

  // auto-run when data updates
  document.addEventListener("da:update", () => {
    try { brainComputeAndRender(); } catch (_) {}
  });

  // run once on load (เผื่อหน้า 6 เปิดอยู่)
  setTimeout(() => { try { brainComputeAndRender(); } catch (_) {} }, 0);
})();

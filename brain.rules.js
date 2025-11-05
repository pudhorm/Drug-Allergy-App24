// ============================== brain.rules.js (DROP-IN REPLACEMENT) ==============================
// Gate-first ADR engine + weighted fallback, with explain panel.
// Compatible with your page6 bridges (expects: window.evaluateDrugAllergy, window.brainComputeAndRender)
// Writes HTML into #brainBox (page6.js already mirrors this to #p6BrainBox)

(function () {
  // --------------------------- Safe helpers ---------------------------
  function get(o, path, dflt) {
    try {
      return path.split(".").reduce((x, k) => (x && k in x ? x[k] : undefined), o) ?? dflt;
    } catch {
      return dflt;
    }
  }
  function num(v) {
    if (v == null) return NaN;
    const n = Number(String(v).replace(/[, ]+/g, ""));
    return Number.isFinite(n) ? n : NaN;
  }
  function bool(v) {
    if (v == null) return false;
    if (typeof v === "boolean") return v;
    const s = String(v).toLowerCase();
    return s === "true" || s === "yes" || s === "1" || s === "on" || s === "พบ" || s === "มี";
  }
  function arr(x) { return Array.isArray(x) ? x : []; }

  // --------------------------- Input snapshot ---------------------------
  function readSnapshot() {
    const d  = window.drugAllergyData || {};
    const p1 = d.page1 || {};
    const p2 = d.page2 || {};
    const p3 = d.page3 || {};

    // normalize common fields thatเราเคยใช้ในหน้า 1–3
    const rashShapes   = arr(p1.rashShapes || p1.rashShape || p1["1_1"] || []);
    const rashColors   = arr(p1.rashColors || p1.rashColor || []);
    const pustule      = get(p1, "pustule.has", false) || bool(get(p1, "pustule", false));
    const itch         = get(p1, "itch.has", false) || bool(p1.itch);
    const swelling     = get(p1, "swelling.has", false) || bool(p1.swelling);
    const skinDetach   = {
      center : !!get(p1, "skinDetach.center", false) || !!get(p1, "peeling.center", false),
      lt10   : !!get(p1, "skinDetach.lt10", false)   || !!/10%/i.test(String(get(p1,"peeling",""))),
      gt30   : !!get(p1, "skinDetach.gt30", false)   || !!/>\s*30%|เกิน\s*30/i.test(String(get(p1,"peeling","")))
    };
    const locations    = arr(p1.locations || p1.location || []);
    const onsetLabel   = String(p1.onset || p1.timeline || "").trim(); // e.g., "< 1 hr", "1–6 ชั่วโมง", "1–6 สัปดาห์", ...

    // หน้า 2
    const resp = {
      dyspnea   : !!get(p2, "resp.dyspnea", false),
      wheeze    : !!get(p2, "resp.wheeze", false),
      tachypnea : !!get(p2, "resp.tachypnea", false),
      stridor   : !!get(p2, "resp.stridor", false)
    };
    const cv = {
      hypotension : !!get(p2, "cv.hypotension", false) || bool(get(p2, "cv.lowBP", false)),
      shock       : !!get(p2, "cv.shock", false),
      sbp         : num(get(p2, "cv.sbp", NaN))
    };
    const feverC   = num(get(p2, "inflammation.feverC", get(p2, "feverC", get(p2, "fever", NaN))));
    const lnSwollen= !!get(p2, "lymphadenopathy", false) || !!get(p2, "nodes.enlarged", false);
    const mucosaCount = (function () {
      // ประมาณจำนวนเยื่อบุที่เกี่ยวข้องจากสัญญาณที่เรามี
      let c = 0;
      if (bool(get(p2, "vision.conjunctivitis", false))) c++;
      if (bool(get(p2, "gi.mucosaMouth", false)) || bool(get(p2,"throat.sore", false))) c++;
      if (bool(get(p2, "gu.genitalMucosa", false))) c++;
      if (bool(get(p2, "resp.nasalMucosa", false))) c++;
      return c;
    })();

    // หน้า 3 (Lab) — ใช้คีย์ตรงกับ page3.js เวอร์ชันล่าสุดของคุณ
    const eosPct = num(get(p3, "cbc.eos.value", NaN));
    const aec    = num(get(p3, "cbc.aec.value", NaN));
    const neut   = num(get(p3, "cbc.neut.value", NaN));
    const wbc    = num(get(p3, "cbc.wbc.value", NaN));

    const alt    = num(get(p3, "lft.alt.value", NaN));
    const ast    = num(get(p3, "lft.ast.value", NaN));

    const bun    = num(get(p3, "rft.bun.value", NaN));
    const cre    = num(get(p3, "rft.cre.value", NaN));
    const egfr   = num(get(p3, "rft.egfr.value", NaN));
    const uo     = num(get(p3, "rft.uo.value", NaN));

    const uaProtein = String(get(p3, "ua.protein.value", "")).toLowerCase(); // "mg/dL / +"
    const uaRBC     = num(get(p3, "ua.rbc.value", NaN));
    const uaWBC     = num(get(p3, "ua.wbc.value", NaN));

    const spo2   = num(get(p3, "lung.spo2.value", NaN));
    const cxrTxt = String(get(p3, "lung.cxr.value", "")).toLowerCase();

    const tropI  = num(get(p3, "heart.tropi.value", NaN));
    const tropT  = num(get(p3, "heart.tropt.value", NaN));
    const ckmb   = num(get(p3, "heart.ckmb.value", NaN));
    const ekgTxt = String(get(p3, "heart.ekg.value", "")).toLowerCase();

    // flags organ involvement (approx)
    const organ = {
      liver: Number.isFinite(alt) && alt >= 40 || Number.isFinite(ast) && ast >= 40,
      kidney: (Number.isFinite(cre) && cre >= 1.3) || (Number.isFinite(egfr) && egfr < 60) || /protein|\+/.test(uaProtein),
      lung: (Number.isFinite(spo2) && spo2 < 94) || /infiltrat|patchy|opacit|pneumon/i.test(cxrTxt),
      heart: (Number.isFinite(tropI) && tropI > 0.04) || (Number.isFinite(tropT) && tropT >= 0.01) ||
             (Number.isFinite(ckmb) && ckmb > 0) || /(st[- ]?t|av block|qt|arrhythm)/i.test(ekgTxt)
    };

    return {
      ready: !!(p1.__saved && p2.__saved && p3.__saved),
      p1, p2, p3,
      rashShapes, rashColors, pustule, itch, swelling, skinDetach, locations, onsetLabel,
      resp, cv, feverC, lnSwollen, mucosaCount,
      eosPct, aec, neut, wbc, alt, ast, bun, cre, egfr, uo, uaProtein, uaRBC, uaWBC,
      spo2, cxrTxt, tropI, tropT, ckmb, ekgTxt, organ
    };
  }

  // --------------------------- Timing classifiers ---------------------------
  function isImmediateOnset(onsetLabel) {
    const s = (onsetLabel || "").toLowerCase();
    return /<\s*1\s*hr|<\s*1\s*ช|^1.?6\s*ชั่วโมง|1-6\s*ช|ภายในไม่กี่นาที|ภายใน.*ชั่วโมง/.test(s);
  }
  function isDelayed1to3w(onsetLabel) {
    const s = (onsetLabel || "").toLowerCase();
    return /(1.?3\s*สัปดาห์|1-3\s*สัปดาห์|1–3\s*สัปดาห์)/.test(s);
  }
  function isDelayed1to6w(onsetLabel) {
    const s = (onsetLabel || "").toLowerCase();
    return /(1.?6\s*สัปดาห์|1-6\s*สัปดาห์|1–6\s*สัปดาห์|2\s*สัปดาห์|3\s*สัปดาห์|4\s*สัปดาห์|5\s*สัปดาห์|6\s*สัปดาห์)/.test(s);
  }

  // --------------------------- GATES (hard classification) ---------------------------
  function gateAnaphylaxis(s, log) {
    // Criteria 1 or 2 within ~≤6 hr
    const skinOrMucosa = (s.itch || s.swelling || arr(s.rashShapes).length > 0);
    const respHit = s.resp.dyspnea || s.resp.wheeze || s.resp.stridor;
    const cvHit   = s.cv.hypotension || s.cv.shock || (Number.isFinite(s.cv.sbp) && s.cv.sbp < 90);

    const giHit   = !!get(s.p2, "gi.cramp", false) || !!get(s.p2, "gi.vomit", false) || !!get(s.p2, "gi.diarrhea", false);

    const systems = [
      skinOrMucosa ? "ผิวหนัง/เยื่อบุ" : null,
      respHit ? "หายใจ" : null,
      cvHit ? "ไหลเวียนโลหิต" : null,
      giHit ? "ทางเดินอาหาร" : null
    ].filter(Boolean);

    const isImmed = isImmediateOnset(s.onsetLabel);
    const ok = (isImmed && ((skinOrMucosa && (respHit || cvHit)) || (systems.length >= 2)));
    if (ok) {
      log.push("✅ Anaphylaxis: เข้าตามเกณฑ์ (≤6 ชม.) + ระบบที่เกี่ยวข้อง: " + systems.join(", "));
      return { label: "Anaphylaxis", confidence: "high" };
    }
    log.push("❌ Anaphylaxis: ยังไม่เข้าเกณฑ์ (ตรวจ onset/ระบบร่วม)");
    return null;
  }

  function gateTENSJS(s, log) {
    // TEN first
    if (s.skinDetach.gt30) {
      log.push("✅ TEN: ผิวหนังหลุดลอก >30% BSA");
      return { label: "TEN", confidence: "high" };
    }
    // SJS — mucosa ≥2 หรือ skin detach <10% + รูปแบบผื่นเข้ากัน
    const muc2 = s.mucosaCount >= 2;
    const sjsLike = s.skinDetach.lt10 || s.skinDetach.center;
    if (muc2 && isDelayed1to3w(s.onsetLabel)) {
      log.push("✅ SJS: เยื่อบุ ≥2 แห่ง + ระยะเวลาเข้ากัน (1–3 สัปดาห์)");
      return { label: "SJS", confidence: "high" };
    }
    if (sjsLike && isDelayed1to3w(s.onsetLabel)) {
      log.push("✅ SJS: ผิวหนังหลุดลอกเล็กน้อย/กลางผื่น + ระยะเวลา 1–3 สัปดาห์");
      return { label: "SJS", confidence: "medium" };
    }
    log.push("❌ SJS/TEN: ยังไม่เข้าเกณฑ์");
    return null;
  }

  function gateAGEP(s, log) {
    const neutHigh = Number.isFinite(s.neut) && s.neut >= 70; // คร่าว ๆ
    const feverHi  = Number.isFinite(s.feverC) && s.feverC >= 38.0;
    if (s.pustule && isDelayed1to3w(s.onsetLabel) && (feverHi || neutHigh)) {
      log.push("✅ AGEP: ตุ่มหนอง <5mm จำนวนมาก + (ไข้≥38 หรือ neutrophil สูง) + onset 1–3 สัปดาห์");
      return { label: "AGEP", confidence: "high" };
    }
    log.push("❌ AGEP: ยังไม่เข้าเกณฑ์");
    return null;
  }

  function gateDRESS_RegiSCAR_like(s, log) {
    // Gate ต้องมีครบ: ผิวหนัง + (สัญญาณระบบ/เลือด ≥1) + (อวัยวะภายใน ≥1) + onset 2–6 สัปดาห์
    const skin = arr(s.rashShapes).length > 0 || arr(s.rashColors).length > 0 || s.skinDetach.center || s.skinDetach.lt10 || s.skinDetach.gt30;
    const sysOrBlood =
      (Number.isFinite(s.feverC) && s.feverC >= 37.5) ||
      s.lnSwollen ||
      (Number.isFinite(s.eosPct) && s.eosPct >= 10) ||
      (Number.isFinite(s.aec) && s.aec >= 700) ||
      bool(get(s.p3, "cbc.atypical.checked", false));
    const organHit = !!(s.organ.liver || s.organ.kidney || s.organ.lung || s.organ.heart);
    const timingOK = isDelayed1to6w(s.onsetLabel);

    if (skin && sysOrBlood && organHit && timingOK) {
      log.push("✅ DRESS Gate ผ่าน: ผิวหนัง + (ไข้/ต่อมน้ำเหลือง/เลือด) + อวัยวะภายใน ≥1 + onset 2–6 สัปดาห์");
      return { label: "DRESS", confidence: "high" };
    }
    log.push("❌ DRESS Gate: ยังไม่ครบเงื่อนไขหลัก (ตรวจผิวหนัง/ไข้-เลือด/อวัยวะ/เวลา)");
    return null;
  }

  // --------------------------- Weighted fallback ---------------------------
  function weightedFallback(s, log) {
    const score = Object.create(null);
    const add = (k, w, msg) => {
      score[k] = (score[k] || 0) + w;
      if (msg) log.push(`+${w} ${k}: ${msg}`);
    };

    // Urticaria
    if (s.itch) add("Urticaria", 3, "คันมาก");
    if (arr(s.rashShapes).includes("ปื้นนูน")) add("Urticaria", 2, "รูปร่างปื้นนูน");
    if (arr(s.rashColors).includes("แดง")) add("Urticaria", 1, "สีแดง/flare");
    if (isImmediateOnset(s.onsetLabel)) add("Urticaria", 1, "onset เร็ว");

    // Angioedema
    if (s.swelling) add("Angioedema", 3, "บวมชั้นลึก/ไม่มีขอบเขตชัด");
    if (isImmediateOnset(s.onsetLabel)) add("Angioedema", 1, "onset เร็ว");

    // Maculopapular exanthem (MPE)
    if (arr(s.rashColors).includes("แดง")) add("Maculopapular rash", 1, "สีแดง");
    if (arr(s.rashShapes).length >= 1) add("Maculopapular rash", 1, "มี macule/papule");
    if (isDelayed1to6w(s.onsetLabel)) add("Maculopapular rash", 1, "onset 1–6 สัปดาห์");

    // FDE
    const hasRing = arr(s.rashShapes).some(x => /วง|วงรี/i.test(x));
    const hasRedPurple = arr(s.rashColors).some(x => /(ม่วง|แดงจัด|แดงเข้ม)/i.test(x));
    if (hasRing && hasRedPurple) add("Fixed drug eruption", 2, "วง/วงรี + แดงจัด/อมม่วง");
    if (locations.length && locations.some(x => /ริมฝีปาก|อวัยวะเพศ|มือ|เท้า/i.test(x))) add("Fixed drug eruption", 1, "ตำแหน่งพบบ่อย FDE");
    if (isDelayed1to6w(s.onsetLabel)) add("Fixed drug eruption", 1, "onset ตามแบบ");

    // Photosensitivity
    const sunExposed = locations.some(x => /ใบหน้า|หลังมือ|แขน.*นอก|หน้าอก.*นอกเสื้อ|หน้าแข้ง/i.test(x));
    const burny = arr(s.rashColors).some(x => /แดงไหม้/i.test(x));
    if (sunExposed && burny) add("Photosensitivity drug eruption", 2, "บริเวณโดนแดด + แดงไหม้");
    if (!s.itch && sunExposed) add("Photosensitivity drug eruption", 1, "ไม่คัน/แสบร้อน (phototoxic)");

    // AGEP (อ่อน)
    if (s.pustule) add("AGEP", 2, "ตุ่มหนอง <5mm จำนวนมาก");
    if (Number.isFinite(s.feverC) && s.feverC >= 38) add("AGEP", 1, "ไข้สูง");

    // SJS/TEN (อ่อน ถ้าไม่ผ่าน gate)
    if (s.skinDetach.lt10 || s.skinDetach.center) add("SJS", 2, "ผิวหลุดลอกเล็กน้อย/กลางผื่น");
    if (s.mucosaCount >= 1) add("SJS", 1, "เยื่อบุอย่างน้อย 1");
    if (s.skinDetach.gt30) add("TEN", 3, ">30% (เข้ม)"); // เผื่อข้อมูลไม่แน่ชัดจาก Gate

    // DRESS (อ่อน ถ้าไม่ผ่าน gate)
    if ((Number.isFinite(s.eosPct) && s.eosPct >= 10) || (Number.isFinite(s.aec) && s.aec >= 700)) add("DRESS", 2, "Eosinophil สูง");
    if (s.organ.liver || s.organ.kidney || s.organ.lung || s.organ.heart) add("DRESS", 2, "อวัยวะภายในเกี่ยวข้อง");
    if (Number.isFinite(s.feverC) && s.feverC >= 37.5) add("DRESS", 1, "ไข้");
    if (isDelayed1to6w(s.onsetLabel)) add("DRESS", 1, "onset 2–6 สัปดาห์");

    // EM
    const targety =
      arr(s.rashShapes).some(x => /(เป้า|target|วง.*3\s*ชั้น)/i.test(x)) ||
      arr(s.rashColors).some(x => /(วง.*3\s*ชั้น)/i.test(x));
    if (targety) add("Erythema multiforme", 2, "target-like lesion");

    // Bullous DE
    const blisterBig =
      arr(s.rashShapes).some(x => /(ตุ่มน้ำใหญ่|ตุ่มน้ำพอง|bulla|bullous)/i.test(x)) ||
      /ใหญ่|พองตึง/i.test(String(get(s.p1,"blister","")));
    if (blisterBig) add("Bullous Drug Eruption", 2, "ตุ่มน้ำพองตึง/ใหญ่");

    // Rank
    const ranked = Object.entries(score).sort((a, b) => b[1] - a[1]);
    if (!ranked.length) return null;
    const [topLabel, topScore] = ranked[0];
    const conf = topScore >= 5 ? "medium" : "low";
    log.push(`⇒ Fallback เลือก: ${topLabel} (คะแนน ${topScore})`);
    return { label: topLabel, confidence: conf, ranking: ranked };
  }

  // --------------------------- Main evaluate ---------------------------
  function evaluate() {
    const explain = [];
    const snap = readSnapshot();

    if (!snap.ready) {
      explain.push("ℹ️ ยังบันทึกหน้า 1–3 ไม่ครบ จึงยังไม่เริ่มประเมิน (รอ __saved = true ครบทั้งสามหน้า)");
      return { ready: false, label: null, confidence: "low", explain, snap };
    }

    // Priority: Anaphylaxis > SJS/TEN > DRESS > AGEP > others
    let res =
      gateAnaphylaxis(snap, explain) ||
      gateTENSJS(snap, explain)      ||
      gateDRESS_RegiSCAR_like(snap, explain) ||
      gateAGEP(snap, explain);

    if (!res) {
      res = weightedFallback(snap, explain);
    }
    if (!res) {
      explain.push("ไม่มี pattern ที่ชัดเจนพอจากข้อมูลที่กรอก");
      return { ready: true, label: null, confidence: "low", explain, snap };
    }
    return { ready: true, ...res, explain, snap };
  }

  // --------------------------- Render to #brainBox ---------------------------
  function ensureBrainBox() {
    let box = document.getElementById("brainBox");
    if (!box) {
      box = document.createElement("div");
      box.id = "brainBox";
      box.style.display = "none"; // page6.js จะ mirror
      document.body.appendChild(box);
    }
    return box;
  }

  function render(result) {
    const box = ensureBrainBox();
    if (!result.ready) {
      box.innerHTML = `<div class="p6-muted">ยังไม่มีข้อมูลเพียงพอจากหน้า 1–3 หรือยังไม่คำนวณ</div>`;
      return;
    }
    if (!result.label) {
      box.innerHTML = `<div class="p6-muted">ยังไม่มีสัญญาณเด่นพอจากข้อมูลที่กรอก</div>
      ${renderExplain(result.explain)}`;
      return;
    }

    let rankingHTML = "";
    if (result.ranking && result.ranking.length) {
      rankingHTML = `
        <ol class="p6-list" style="margin-top:.35rem;">
          ${result.ranking.slice(0, 6).map(([k, v], i) => `<li>${i + 1}) ${k} <span style="color:#6b7280">(+${v})</span></li>`).join("")}
        </ol>`;
    }

    box.innerHTML = `
      <div>
        <div style="font-weight:700;margin-bottom:.25rem;">
          ผลเด่น: <span style="font-weight:800;">${result.label}</span>
          <span style="color:#6b7280;font-weight:600;margin-left:.25rem;">(ความเชื่อมั่น: ${result.confidence})</span>
        </div>
        ${rankingHTML}
        ${renderExplain(result.explain)}
      </div>
    `;
  }

  function renderExplain(lines) {
    if (!lines || !lines.length) return "";
    return `
      <details style="margin-top:.5rem;">
        <summary style="cursor:pointer;font-weight:700;color:#374151">ดูเหตุผล/เกณฑ์ที่ตรง</summary>
        <ul style="margin:.4rem 0 0 1.1rem;padding:0;list-style:disc;color:#374151;font-size:.92rem;">
          ${lines.map(safeText).map(t => `<li>${t}</li>`).join("")}
        </ul>
      </details>
    `;
  }
  function safeText(s){ return String(s).replace(/[<>&]/g, m => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[m])); }

  // --------------------------- Public API ---------------------------
  let lastEpoch = 0;

  window.evaluateDrugAllergy = function evaluateDrugAllergy(opts) {
    // opts: {force, epoch}
    if (opts && Number.isFinite(opts.epoch)) lastEpoch = opts.epoch;
    // ทำเฉพาะคำนวน/คืนค่า ไม่เรนเดอร์
    try {
      return evaluate();
    } catch (e) {
      console.warn("[brain.rules] evaluate error:", e);
      return { ready:false, label:null, confidence:"low", explain:[String(e)] };
    }
  };

  window.brainComputeAndRender = function brainComputeAndRender(opts) {
    if (opts && Number.isFinite(opts.epoch)) lastEpoch = opts.epoch;
    const res = window.evaluateDrugAllergy(opts);
    render(res);
    return res;
  };

  // คำนวณครั้งแรกแบบนุ่มนวล
  setTimeout(() => { try { window.brainComputeAndRender({ epoch: ++lastEpoch }); } catch(_) {} }, 0);
  // ให้หน้าอื่นเรียกซ้ำได้ผ่าน da:update (page6.js มีอยู่แล้ว แต่อันนี้สำรอง)
  document.addEventListener("da:update", () => { try { window.brainComputeAndRender({ epoch: ++lastEpoch }); } catch(_) {} });

})();

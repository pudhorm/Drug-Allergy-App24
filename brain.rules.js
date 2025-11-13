// ===================== brain.js (REPLACE WHOLE FILE) =====================
(function () {
  // --------- Helpers ----------
  function bag() {
    const b = Object.create(null);
    return {
      set(k) { b[k] = true; },
      has(k) { return !!b[k]; },
      dump() { return b; }
    };
  }
  function pct(got, max) { return max ? Math.round((got / max) * 100) : 0; }

  // --------- Collect features from Page 1 ----------
  function collectP1(f) {
    const p1 = (window.drugAllergyData || {}).page1 || {};

    // Shapes
    (p1.rashShapes || []).forEach(s => {
      if (s === "ตุ่มนูน") f.set("shape.papule");
      if (s === "ตุ่มแบนราบ") f.set("shape.macule_flat");
      if (s === "ปื้นนูน") f.set("shape.plaque_raised");
      if (s === "นูนหนา") f.set("shape.thick_raised");                 // ✅
      if (s === "วงกลมชั้นเดียว") { f.set("shape.circle_single"); f.set("shape.target_like_not_3ring"); }
      if (s === "วงกลม 3 ชั้น") f.set("shape.target_3ring");
      if (s === "วงรี") f.set("shape.oval");
      if (s === "ขอบหยัก") f.set("shape.border_irregular");
      if (s === "ขอบเรียบ") f.set("shape.border_smooth");
      if (s === "ขอบไม่ชัดเจน") f.set("shape.border_blur");
      if (s === "จุดเล็ก") f.set("shape.small_red_dots");
    });

    // Colors
    (p1.rashColors || []).forEach(c => {
      if (c === "แดง") f.set("color.red");
      if (c === "แดงไหม้") f.set("color.burn_red");
      if (c === "แดงซีด") f.set("color.pale_red");
      if (c === "ซีด") f.set("color.pale");
      if (c === "ใส") f.set("color.clear");
      if (c === "ม่วง") f.set("color.purple");
      if (c === "เหลือง") f.set("color.yellow");
      if (c === "มันเงา") f.set("color.glossy");
      if (c === "ดำ") f.set("color.black");
      if (c === "เทา") f.set("color.gray");
    });

    // Vesicles/bullae
    if (p1.blisters?.small) f.set("blister.small");
    if (p1.blisters?.medium) f.set("blister.medium");
    if (p1.blisters?.large) f.set("blister.large");

    // Detach
    if (p1.skinDetach?.center) f.set("detach.center");
    if (p1.skinDetach?.lt10) f.set("detach.lt10");
    if (p1.skinDetach?.gt30) f.set("detach.gt30");

    // Scale/dry/peel
    if (p1.scales?.scale) f.set("scale.scales");
    if (p1.scales?.dry) f.set("scale.dry");
    if (p1.scales?.peel) f.set("scale.peel");

    // Exudate/crust
    if (p1.exudate?.serous) f.set("exudate.serous");
    if (p1.exudate?.crust) f.set("exudate.crust");

    // Itch
    if (p1.itch?.has) f.set("itch.yes");
    if (p1.itch?.none) f.set("itch.no");

    // Pain/burning/sore/tight
    if (p1.pain?.pain) f.set("pain.pain");
    if (p1.pain?.burn) f.set("pain.burn");
    if (p1.pain?.sore) f.set("pain.sore");
    if (p1.pain?.tight) f.set("skin.tight");                           // ✅

    // Swelling / Pustule
    if (p1.swelling?.has) f.set("swelling", true);
    if (p1.pustule?.has) f.set("pustule", true);

    // Locations
    (p1.locations || []).forEach(loc => {
      if (loc === "ทั่วร่างกาย") f.set("loc.generalized");
      if (loc === "มือ") f.set("loc.hand");
      if (loc === "เท้า") f.set("loc.foot");
      if (loc === "หน้า") f.set("loc.face");
      if (loc === "แขน") f.set("loc.arm");
      if (loc === "ขา") f.set("loc.leg");
      if (loc === "ริมฝีปาก") f.set("loc.lip");
      if (loc === "รอบดวงตา") f.set("loc.periocular");
      if (loc === "ลำคอ") f.set("loc.neck");
      if (loc === "อวัยวะเพศ") f.set("loc.genital");
      if (loc === "ทวาร") f.set("loc.perianal");
      if (loc === "หลัง") f.set("loc.back");
      if (loc === "ลำตัว") f.set("loc.trunk");
      if (loc === "ลิ้น") f.set("loc.tongue");                         // ✅
    });

    if (p1.distribution === "สมมาตร") f.set("dist.symmetric");
    if (p1.distribution === "ไม่สมาตร") f.set("dist.asymmetric");

    // Onset
    if (p1.onset === "1h") f.set("onset.1h");
    if (p1.onset === "1to6h") f.set("onset.1to6h");
    if (p1.onset === "6to24h") f.set("onset.6to24h");
    if (p1.onset === "1w") f.set("onset.1w");
    if (p1.onset === "2w") f.set("onset.2w");
    if (p1.onset === "3w") f.set("onset.3w");
    if (p1.onset === "4w") f.set("onset.4w");

    // SJS mucosal >1
    if (p1.mucosalCountGt1) f.set("sjs.mucosal_gt1");                  // ✅
  }

  // --------- Collect features from Page 2 ----------
  function collectP2(f) {
    const p2 = (window.drugAllergyData || {}).page2 || {};
    // Respiratory
    if (p2.resp && p2.resp["หายใจมีเสียงวี๊ด"]?.checked) f.set("resp.wheeze");
    if (p2.resp && p2.resp["หอบเหนื่อย/หายใจลำบาก (RR>21 หรือ HR>100 หรือ SpO2<94%)"]?.checked) {
      f.set("resp.dyspnea");
      f.set("lab.spO2_lt94_or_rr_hr");
    }
    // CV
    if (p2.cv && p2.cv["BP ต่ำ (<90/60)"]?.checked) f.set("cv.bp_low");
    if (p2.cv && p2.cv["BP ลดลง ≥30% ของ baseline systolic เดิม"]?.checked) f.set("cv.bp_drop_30pct");
    if (p2.cv && p2.cv["HR สูง (>100)"]?.checked) f.set("cv.hr_high");
    // GI
    if (p2.gi && p2.gi["ท้องเสีย"]?.checked) f.set("gi.diarrhea");
    if (p2.gi && p2.gi["กลืนลำบาก"]?.checked) f.set("gi.dysphagia");
    if (p2.gi && p2.gi["คลื่นไส้/อาเจียน"]?.checked) f.set("gi.nv");
    if (p2.gi && p2.gi["เลือดออกในทางเดินอาหาร"]?.checked) f.set("gi.bleed");
    // Systemic/eye/msk
    if (p2.other && p2.other["ไข้ Temp > 37.5 °C"]?.checked) f.set("sys.fever");
    if (p2.other && p2.other["อ่อนเพลีย"]?.checked) f.set("sys.fatigue");
    if (p2.msk && p2.msk["ปวดเมื่อยกล้ามเนื้อ"]?.checked) f.set("sys.myalgia");
    if (p2.eye && p2.eye["เยื่อบุตาอักเสบ (ตาแดง)"]?.checked) f.set("eye.conjunctivitis");
  }

  // --------- Scoring rules (กลุ่มข้อใหญ่ + boost x2/x3) ----------
  const RULES = [
    {
      key: "urticaria",
      title: "Urticaria",
      name: "Urticaria",
      phenotype: "Urticaria",
      rules: [
        { anyOf: ["shape.border_irregular", "shape.circle_single", "shape.border_smooth"] },
        { anyOf: ["color.red", "color.pale_red", "color.pale"] },
        { anyOf: ["shape.papule", "shape.plaque_raised"], boost: 2 },
        { anyOf: ["itch.yes"] },
        { anyOf: ["swelling"] },
        { anyOf: ["loc.generalized", "loc.hand", "loc.foot", "loc.arm", "loc.leg", "loc.face", "loc.periocular", "loc.neck", "loc.trunk", "loc.back"] },
        { anyOf: ["onset.1h"] }
      ]
    },
    {
      key: "anaphylaxis",
      title: "Anaphylaxis",
      name: "Anaphylaxis",
      phenotype: "Anaphylaxis",
      rules: [
        { anyOf: ["shape.papule", "shape.plaque_raised", "swelling", "shape.thick_raised"] },
        { anyOf: ["resp.wheeze", "resp.dyspnea"], boost: 2 },
        { anyOf: ["itch.yes", "color.red"] },
        { anyOf: ["gi.diarrhea", "gi.dysphagia", "gi.nv"] },
        { anyOf: ["onset.1h", "onset.1to6h"] },
        { anyOf: ["cv.bp_low", "cv.bp_drop_30pct"] },
        { anyOf: ["cv.hr_high", "lab.spO2_lt94_or_rr_hr"] }
      ]
    },
    {
      key: "angioedema",
      title: "Angioedema",
      name: "Angioedema",
      phenotype: "Angioedema",
      rules: [
        { anyOf: ["shape.thick_raised", "shape.border_blur"] },
        { anyOf: ["color.pale", "color.red"] },
        { anyOf: ["swelling"], boost: 2 },
        { anyOf: ["skin.tight", "pain.pain", "pain.burn", "itch.yes"] },
        { anyOf: ["loc.lip", "loc.periocular", "loc.tongue", "loc.genital"] },
        { anyOf: ["onset.1h"] },
        { anyOf: ["dist.symmetric", "dist.asymmetric", "loc.generalized", "loc.trunk", "loc.arm", "loc.leg", "loc.face"] }
      ]
    },
    {
      key: "mpr",
      title: "Maculopapular rash",
      name: "Maculopapular rash",
      phenotype: "Maculopapular rash",
      rules: [
        { anyOf: ["shape.plaque_raised", "shape.papule"] },
        { anyOf: ["color.red"] },
        { anyOf: ["shape.small_red_dots"], boost: 2 },
        { anyOf: ["itch.yes"] },
        { anyOf: ["sys.fever"] }, // eos >5% จะเติมจาก lab page ได้ในอนาคต
        { anyOf: ["dist.symmetric", "loc.trunk", "loc.arm", "loc.face", "loc.neck"] },
        { anyOf: ["onset.1to6h", "onset.6to24h", "onset.1w", "onset.2w"] }
      ]
    },
    {
      key: "fde",
      title: "Fixed drug eruption",
      name: "Fixed drug eruption",
      phenotype: "Fixed drug eruption",
      rules: [
        { anyOf: ["shape.circle_single", "shape.oval"] },
        { anyOf: ["color.red", "color.black"] },
        { anyOf: ["color.purple"], boost: 3 },
        { anyOf: ["detach.center", "pain.pain", "pain.burn", "skin.tight"] },
        { anyOf: ["swelling", "blister.small", "blister.medium", "blister.large"] },
        { anyOf: ["loc.lip", "loc.face", "loc.hand", "loc.foot", "loc.arm", "loc.leg", "loc.genital"] },
        { anyOf: ["onset.1w", "onset.2w"] },
        { anyOf: ["sys.fever", "gi.nv", "sys.myalgia"] },
        { anyOf: ["shape.border_smooth"] }
      ]
    },
    {
      key: "agep",
      title: "AGEP",
      name: "AGEP",
      phenotype: "AGEP",
      rules: [
        { anyOf: ["color.red"] },
        { anyOf: ["color.yellow"] },
        { anyOf: ["pustule"], boost: 3 },
        { anyOf: ["swelling", "itch.yes", "pain.sore"] },
        { anyOf: ["exudate.crust", "scale.dry", "scale.peel", "scale.scales"] },
        { anyOf: ["loc.face", "loc.generalized"] }, // รักแร้/ขาหนีบไม่ได้อยู่ในชุดตำแหน่ง แต่อ่านเป็น generalized/face ได้
        { anyOf: ["onset.6to24h", "onset.1w", "onset.2w", "onset.3w"] },
        { anyOf: ["sys.fever"] }
      ]
    },
    {
      key: "sjs",
      title: "SJS",
      name: "SJS",
      phenotype: "SJS",
      rules: [
        { anyOf: ["shape.target_like_not_3ring"] },
        { anyOf: ["color.black", "color.gray", "color.red"] },
        { anyOf: ["detach.lt10"], boost: 3 },
        { anyOf: ["exudate.serous", "blister.large", "blister.small", "blister.medium"] },
        { anyOf: ["exudate.crust"] },
        { anyOf: ["loc.trunk"] },
        { anyOf: ["onset.1to6h", "onset.6to24h", "onset.1w", "onset.2w", "onset.3w"] },
        { anyOf: ["sys.fever", "sys.myalgia", "gi.nv", "gi.bleed"] },
        { anyOf: ["loc.lip", "loc.periocular", "loc.trunk", "loc.arm", "loc.leg", "loc.face", "loc.hand", "loc.foot"] },
        { anyOf: ["sjs.mucosal_gt1"] }                                  // ✅ เยื่อบุ > 1
      ]
    },
    {
      key: "ten",
      title: "TEN",
      name: "TEN",
      phenotype: "TEN",
      rules: [
        { anyOf: ["color.red", "color.black"] },
        { anyOf: ["shape.target_like_not_3ring", "shape.plaque_raised"] },
        { anyOf: ["detach.gt30"], boost: 3 },
        { anyOf: ["blister.large", "exudate.serous", "exudate.crust"] },
        { anyOf: ["color.pale"] },
        { anyOf: ["loc.trunk", "loc.arm", "loc.leg", "loc.face", "loc.hand", "loc.foot", "loc.generalized", "loc.lip"] },
        { anyOf: ["onset.1w", "onset.2w", "onset.3w"] },
        { anyOf: ["sys.fever", "sys.myalgia", "gi.nv", "eye.conjunctivitis"] },
        { anyOf: ["lab.cr_rise", "lab.ast_alt_elev", "lab.protein_urine", "lab.spO2_lt94_or_rr_hr"] }
      ]
    }
  ];

  // --------- Scoring ----------
  function scoreOne(ruleSet, fbag) {
    let got = 0, max = 0;
    for (const g of ruleSet.rules) {
      const w = g.boost ? Number(g.boost) : 1;
      max += w;
      const ok = (g.anyOf || []).some(t => fbag.has(t));
      if (ok) got += w;
    }
    return pct(got, max);
  }

  function compute() {
    const d = window.drugAllergyData || {};
    const ready = !!(d.page1 && d.page1.__saved && d.page2 && d.page2.__saved && d.page3 && d.page3.__saved);
    if (!ready) {
      // ให้ UI เก่าที่ใช้ globals ก็รู้สถานะ
      window.brainScores = [];
      window.brainTop = null;
      window.brainLabels = [];
      window.brainValues = [];
      window.brainReady = false;
      document.dispatchEvent(new Event("brain:update"));
      return;
    }

    const f = bag();
    collectP1(f);
    collectP2(f);

    const results = RULES.map(r => ({
      key: r.key,
      title: r.title,
      name: r.name,
      phenotype: r.phenotype,
      score: scoreOne(r, f)
    })).sort((a, b) => b.score - a.score);

    // ---- expose globals (รองรับหน้า 6 หลายแบบ) ----
    window.brainScores = results;
    window.brainTop = results[0] || null;
    window.brainLabels = results.map(x => x.title || x.name || x.phenotype);
    window.brainValues = results.map(x => x.score);
    window.brainReady = true;

    // ยิงอีเวนต์ให้หน้า 6 ไปรีเฟรช
    document.dispatchEvent(new Event("brain:update"));

    // ถ้าหน้า 6 ของคุณใช้ p6BrainBox ผมเรนเดอร์ให้ด้วย (เผื่อ)
    const box = document.getElementById("p6BrainBox");
    if (box) {
      const rows = results.map(r => `
        <div class="p6-row">
          <div class="p6-label">${r.title}</div>
          <div class="p6-bar"><div class="p6-fill" style="width:${r.score}%"></div></div>
          <div class="p6-val">${r.score}%</div>
        </div>
      `).join("");
      box.innerHTML = `
        <div class="p6-card">
          <div class="p6-head">ผลการประเมินเบื้องต้น</div>
          <div class="p6-sub">ผลเด่น: <strong>${results[0]?.title || "-"}</strong></div>
          <div class="p6-list">${rows}</div>
        </div>
      `;
      if (!document.getElementById("p6-style")) {
        const st = document.createElement("style");
        st.id = "p6-style";
        st.textContent = `
          .p6-card{background:#fff;border:1px solid rgba(0,0,0,.06);border-radius:14px;padding:14px;box-shadow:0 10px 24px rgba(0,0,0,.06)}
          .p6-head{font-weight:800;color:#111827;margin-bottom:6px}
          .p6-sub{font-size:.92rem;color:#374151;margin-bottom:10px}
          .p6-row{display:grid;grid-template-columns:220px 1fr 48px;align-items:center;gap:10px;margin:.35rem 0}
          .p6-label{color:#111827}
          .p6-bar{height:14px;background:#f3f4f6;border-radius:999px;overflow:hidden}
          .p6-fill{height:100%;background:linear-gradient(90deg,#7c3aed,#06b6d4)}
          .p6-val{text-align:right;font-weight:700;color:#111827}
        `;
        document.head.appendChild(st);
      }
    }
  }

  // --------- Public API ----------
  window.brainRules = RULES;            // ให้หน้า 6 ที่ดึงกฎไปใช้ได้
  window.evaluateDrugAllergy = compute; // ฟังก์ชันคำนวณกลาง
  window.refreshBrain = compute;        // alias เผื่อปุ่ม "รีเฟรชผลประเมิน"

  // เมื่อข้อมูลอัปเดตจากหน้า 1–3 ให้คำนวณใหม่
  document.addEventListener("da:update", compute);

  // ถ้าโหลดหน้า 6 แล้วอยากคำนวณทันที (กรณีข้อมูลพร้อมแล้ว)
  setTimeout(compute, 0);
})();

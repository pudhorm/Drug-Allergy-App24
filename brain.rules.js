// ===================== brain.js (REPLACE WHOLE FILE) =====================
(function () {
  // ===== จุดหมายการเรนเดอร์: เฉพาะหน้า 6 =====
  function renderIntoPage6(html) {
    var box = document.getElementById("p6BrainBox"); // มีอยู่ในหน้า 6
    if (!box) return;
    box.innerHTML = html;
  }

  // ===== ตัวเก็บฟีเจอร์แบบ boolean tokens =====
  function FeatureBag() {
    const bag = Object.create(null);
    return {
      set(k, v) { if (v) bag[k] = true; },
      has(k) { return !!bag[k]; },
      dump() { return bag; }
    };
  }

  // ===== ดึงข้อมูลจากหน้า 1 → สร้าง tokens =====
  function collectFromPage1(feat) {
    const p1 = (window.drugAllergyData || {}).page1 || {};

    // --- รูปร่างผื่น ---
    (p1.rashShapes || []).forEach(s => {
      if (s === "ตุ่มนูน") feat.set("shape.papule", true);
      if (s === "ตุ่มแบนราบ") feat.set("shape.macule_flat", true);
      if (s === "ปื้นนูน") feat.set("shape.plaque_raised", true);
      if (s === "วงกลมชั้นเดียว") {
        feat.set("shape.circle_single", true);
        // ใช้แทน "วงกลมเป้าธนู (ไม่ครบ 3 ชั้น)" สำหรับ SJS
        feat.set("shape.target_like_not_3ring", true);
      }
      if (s === "วงกลม 3 ชั้น") feat.set("shape.target_3ring", true);
      if (s === "วงรี") feat.set("shape.oval", true);
      if (s === "ขอบหยัก") feat.set("shape.border_irregular", true);
      if (s === "ขอบเรียบ") feat.set("shape.border_smooth", true);
      if (s === "ขอบไม่ชัดเจน") feat.set("shape.border_blur", true);
      if (s === "จุดเล็ก") feat.set("shape.small_red_dots", true);
    });

    // --- สีผื่น ---
    (p1.rashColors || []).forEach(c => {
      if (c === "แดง") feat.set("color.red", true);
      if (c === "แดงไหม้") feat.set("color.burn_red", true);
      if (c === "แดงซีด") feat.set("color.pale_red", true);
      if (c === "ซีด") feat.set("color.pale", true);
      if (c === "ใส") feat.set("color.clear", true);
      if (c === "ม่วง") feat.set("color.purple", true);
      if (c === "เหลือง") feat.set("color.yellow", true);
      if (c === "มันเงา") feat.set("color.glossy", true);
      if (c === "ดำ") feat.set("color.black", true);
      if (c === "เทา") feat.set("color.gray", true);
    });

    // --- ตุ่มน้ำ ---
    if (p1.blisters?.small) feat.set("blister.small", true);
    if (p1.blisters?.medium) feat.set("blister.medium", true);
    if (p1.blisters?.large) feat.set("blister.large", true); // ใช้คำว่า bulla ในบางกฎ

    // --- ผิวหนังหลุดลอก ---
    if (p1.skinDetach?.center) feat.set("detach.center", true);
    if (p1.skinDetach?.lt10) feat.set("detach.lt10", true);
    if (p1.skinDetach?.gt30) feat.set("detach.gt30", true);

    // --- ขุย/แห้ง/ลอก ---
    if (p1.scales?.scale) feat.set("scale.scales", true);
    if (p1.scales?.dry) feat.set("scale.dry", true);
    if (p1.scales?.peel) feat.set("scale.peel", true);

    // --- น้ำเหลือง / สะเก็ด ---
    if (p1.exudate?.serous) feat.set("exudate.serous", true);
    if (p1.exudate?.crust) feat.set("exudate.crust", true);

    // --- คัน ---
    if (p1.itch?.has) feat.set("itch.yes", true);
    if (p1.itch?.severe) feat.set("itch.severe", true);
    if (p1.itch?.mild) feat.set("itch.mild", true);
    if (p1.itch?.none) feat.set("itch.no", true);

    // --- ปวด/แสบ/เจ็บ ---
    if (p1.pain?.pain) feat.set("pain.pain", true);
    if (p1.pain?.burn) feat.set("pain.burn", true);
    if (p1.pain?.sore) feat.set("pain.sore", true);

    // --- บวม ---
    if (p1.swelling?.has) feat.set("swelling", true);

    // --- ตุ่มหนอง ---
    if (p1.pustule?.has) feat.set("pustule", true);

    // --- ตำแหน่ง/การกระจายตัว ---
    (p1.locations || []).forEach(loc => {
      if (loc === "ทั่วร่างกาย") feat.set("loc.generalized", true);
      if (loc === "มือ") feat.set("loc.hand", true);
      if (loc === "เท้า") feat.set("loc.foot", true);
      if (loc === "หน้า") feat.set("loc.face", true);
      if (loc === "แขน") feat.set("loc.arm", true);
      if (loc === "ขา") feat.set("loc.leg", true);
      if (loc === "ริมฝีปาก") feat.set("loc.lip", true);
      if (loc === "รอบดวงตา") feat.set("loc.periocular", true);
      if (loc === "ลำคอ") feat.set("loc.neck", true);
      if (loc === "อวัยวะเพศ") feat.set("loc.genital", true);
      if (loc === "ทวาร") feat.set("loc.perianal", true);
      if (loc === "หลัง") feat.set("loc.back", true);
      if (loc === "ลำตัว") feat.set("loc.trunk", true);
    });

    // --- การกระจายตัว ---
    if (p1.distribution === "สมมาตร") feat.set("dist.symmetric", true);
    if (p1.distribution === "ไม่สมาตร") feat.set("dist.asymmetric", true);

    // --- ระยะเวลา (onset) ---
    if (p1.onset === "1h") feat.set("onset.1h", true);
    if (p1.onset === "1to6h") feat.set("onset.1to6h", true);
    if (p1.onset === "6to24h") feat.set("onset.6to24h", true);
    if (p1.onset === "1w") feat.set("onset.1w", true);
    if (p1.onset === "2w") feat.set("onset.2w", true);
    if (p1.onset === "3w") feat.set("onset.3w", true);
    if (p1.onset === "4w") feat.set("onset.4w", true);

    // --- ✅ ใหม่: จำนวนผื่นบริเวณเยื่อบุ > 1 (เช็คบ็อกซ์ในตำแหน่ง) ---
    if (p1.mucosalCountGt1) feat.set("sjs.mucosal_gt1", true);
  }

  // ===== ดึงข้อมูลจากหน้า 2 → สร้าง tokens (บางส่วนที่จำเป็น) =====
  function collectFromPage2(feat) {
    const p2 = (window.drugAllergyData || {}).page2 || {};

    // 1) ระบบหายใจ
    if (p2.resp && p2.resp["หายใจมีเสียงวี๊ด"]?.checked) feat.set("resp.wheeze", true);
    if (p2.resp && p2.resp["หอบเหนื่อย/หายใจลำบาก (RR>21 หรือ HR>100 หรือ SpO2<94%)"]?.checked) {
      feat.set("resp.dyspnea", true);
      feat.set("lab.spO2_lt94_or_rr_hr", true);
    }

    // 2) ระบบไหลเวียนโลหิต
    if (p2.cv && p2.cv["BP ต่ำ (<90/60)"]?.checked) feat.set("cv.bp_low", true);
    if (p2.cv && p2.cv["BP ลดลง ≥30% ของ baseline systolic เดิม"]?.checked) feat.set("cv.bp_drop_30pct", true);
    if (p2.cv && p2.cv["HR สูง (>100)"]?.checked) feat.set("cv.hr_high", true);

    // 3) ระบบทางเดินอาหาร
    if (p2.gi && p2.gi["ท้องเสีย"]?.checked) feat.set("gi.diarrhea", true);
    if (p2.gi && p2.gi["กลืนลำบาก"]?.checked) feat.set("gi.dysphagia", true);
    if (p2.gi && p2.gi["คลื่นไส้/อาเจียน"]?.checked) feat.set("gi.nv", true);
    if (p2.gi && p2.gi["เลือดออกในทางเดินอาหาร"]?.checked) feat.set("gi.bleed", true);

    // 4) อื่นๆที่ใช้บ่อย
    if (p2.other && p2.other["ไข้ Temp > 37.5 °C"]?.checked) feat.set("sys.fever", true);
    if (p2.other && p2.other["อ่อนเพลีย"]?.checked) feat.set("sys.fatigue", true);
    if (p2.msk && p2.msk["ปวดเมื่อยกล้ามเนื้อ"]?.checked) feat.set("sys.myalgia", true);
    if (p2.eye && p2.eye["เยื่อบุตาอักเสบ (ตาแดง)"]?.checked) feat.set("eye.conjunctivitis", true);
  }

  // ===== ดึงข้อมูลจากหน้า 3 (ถ้าต้องการค่าแลป) =====
  function collectFromPage3(feat) {
    const p3 = (window.drugAllergyData || {}).page3 || {};
    // ใส่เฉพาะที่จำเป็นต่อกฎตอนนี้ (เผื่อใช้ในอนาคต)
    // ตัวอย่าง:
    // if ((p3.cbc || {}).eosinophilPct > 10) feat.set("lab.eos_gt10pct", true);
  }

  // ===== กฎต่อโรค (แยก “ข้อใหญ่” เป็นกลุ่ม คะแนนคิดเป็นรายกลุ่ม) =====
  // วิธีคิดคะแนน:
  // - แต่ละ phenotype มีกลุ่ม rules[] หลายก้อน (คือ “ข้อใหญ่”)
  // - กลุ่มหนึ่งๆ “ผ่าน” ถ้า anyOf อย่างน้อย 1 token เป็นจริง
  // - กลุ่มมี boost (น้ำหนัก) ได้ เช่น x2, x3 ถ้าระบุ boost
  // - คะแนนสุดท้าย = (ผลรวม boost ของกลุ่มที่ผ่าน / ผลรวม boost ของทุกกลุ่ม) * 100
  // ⇒ ถ้าติ้กครบทุกข้อใหญ่ → 100% เต็ม
  const brainRules = [
    // ================= Urticaria =================
    {
      phenotype: "Urticaria",
      rules: [
        { anyOf: ["shape.border_irregular", "shape.circle_single", "shape.border_smooth"] },          // 1 รูปร่าง
        { anyOf: ["color.red", "color.pale_red", "color.pale"] },                                      // 2 สี
        { anyOf: ["shape.papule", "shape.plaque_raised"], boost: 2 },                                  // 3 ลักษณะสำคัญ (x2)
        { anyOf: ["itch.yes"] },                                                                        // 4 อาการผิว
        { anyOf: ["swelling"] },                                                                        // 5 อาการพบน้อย
        { anyOf: ["loc.generalized","loc.hand","loc.foot","loc.arm","loc.leg","loc.face","loc.periocular","loc.neck","loc.trunk","loc.back"] }, // 6 ตำแหน่ง
        { anyOf: ["onset.1h"] }                                                                         // 7 เวลา
      ]
    },

    // ================= Anaphylaxis =================
    {
      phenotype: "Anaphylaxis",
      rules: [
        { anyOf: ["shape.papule","shape.plaque_raised","swelling"], },                                  // 1 รูปร่าง (รวม "บวม/นูนหนา/ตึง" มาจากตัวเลือกหน้า 1)
        { anyOf: ["resp.wheeze", "resp.dyspnea"], boost: 2 },                                           // 2 ลักษณะสำคัญ x2
        { anyOf: ["itch.yes", "color.red"] },                                                           // 3 ผิวหนังร่วม
        { anyOf: ["gi.diarrhea", "gi.dysphagia", "gi.nv"] },                                            // 4 อาการพบน้อย
        { anyOf: ["onset.1h","onset.1to6h"] },                                                          // 5 เวลา
        { anyOf: ["cv.bp_low", "cv.bp_drop_30pct"] },                                                   // 6 ระบบอื่น
        { anyOf: ["cv.hr_high", "lab.spO2_lt94_or_rr_hr"] }                                             // 7 แลป/ชีพจร
      ]
    },

    // ================= Angioedema =================
    {
      phenotype: "Angioedema",
      rules: [
        { anyOf: ["shape.plaque_raised","shape.border_blur"] },                                         // 1 รูปร่าง: นูนหนา/ขอบไม่ชัด
        { anyOf: ["color.pale","color.red"] },                                                          // 2 สี (สีผิวปกติ=ไม่ติ๊กสี → ไม่บังคับ)
        { anyOf: ["swelling"], boost: 2 },                                                              // 3 ลักษณะสำคัญ (บวม) x2
        { anyOf: ["pain.burn", "pain.pain", "itch.yes"] },                                              // 4 อาการเพิ่มเติม (ตึง/ปวด/แสบ/คัน) -> map ด้วย pain/itch
        { anyOf: ["loc.lip","loc.periocular","loc.genital","loc.tongue"] },                             // 5 ตำแหน่งเด่น
        { anyOf: ["onset.1h"] },                                                                        // 6 เวลา
        { anyOf: ["dist.symmetric","dist.asymmetric","loc.generalized","loc.trunk","loc.arm","loc.leg","loc.face"] } // 7 การกระจาย/อื่นๆ (กันกรณีติ้กครบ 7 ข้อใหญ่ได้ 100%)
      ]
    },

    // ================= Maculopapular rash =================
    {
      phenotype: "Maculopapular rash",
      rules: [
        { anyOf: ["shape.plaque_raised","shape.papule"] },                                              // 1 รูปร่าง
        { anyOf: ["color.red"] },                                                                       // 2 สี
        { anyOf: ["shape.small_red_dots"], boost: 2 },                                                  // 3 ลักษณะสำคัญ x2
        { anyOf: ["itch.yes"] },                                                                         // 4 อาการผิว
        { anyOf: ["sys.fever","lab.eos_gt5pct"] },                                                      // 5 พบน้อย (ถ้ามี)
        { anyOf: ["dist.symmetric","loc.trunk","loc.arm","loc.face","loc.neck"] },                      // 6 ตำแหน่ง
        { anyOf: ["onset.1to6h","onset.6to24h","onset.1w","onset.2w"] }                                 // 7 เวลา
      ]
    },

    // ================= Fixed drug eruption =================
    {
      phenotype: "Fixed drug eruption",
      rules: [
        { anyOf: ["shape.circle_single","shape.oval"] },                                                // 1 รูปร่าง
        { anyOf: ["color.red","color.black"] },                                                         // 2 สี
        { anyOf: ["color.purple"], boost: 3 },                                                          // 3 ลักษณะสำคัญ x3
        { anyOf: ["detach.center","pain.pain","pain.burn"] },                                           // 4 อาการผิว
        { anyOf: ["swelling","blister.small","blister.medium","blister.large"] },                       // 5 พบน้อย
        { anyOf: ["loc.lip","loc.face","loc.hand","loc.foot","loc.arm","loc.leg","loc.genital"] },      // 6 ตำแหน่ง
        { anyOf: ["onset.1w","onset.2w"] },                                                             // 7 เวลา
        { anyOf: ["sys.fever","gi.nv","sys.myalgia"] },                                                 // 8 ระบบอื่น
        { anyOf: ["shape.border_smooth"] }                                                              // 9 ขอบเรียบ/เขตชัด
      ]
    },

    // ================= AGEP =================
    {
      phenotype: "AGEP",
      rules: [
        { anyOf: ["color.red"] },                                                                       // 1 รูปร่าง/สีรวม
        { anyOf: ["color.yellow"] },                                                                    // 2 สีเหลือง
        { anyOf: ["pustule"], boost: 3 },                                                               // 3 ลักษณะสำคัญ x3
        { anyOf: ["swelling","itch.yes","pain.sore"] },                                                 // 4 อาการผิว
        { anyOf: ["exudate.crust","scale.dry","scale.peel","scale.scales"] },                           // 5 พบน้อย
        { anyOf: ["loc.face","loc.axilla","loc.generalized","loc.groin"] },                             // 6 ตำแหน่ง
        { anyOf: ["onset.6to24h","onset.1w","onset.2w","onset.3w"] },                                   // 7 เวลา
        { anyOf: ["sys.fever"] },                                                                        // 8 ระบบอื่น
        { anyOf: ["lab.wbc_gt11000","lab.neut_gt75pct"] }                                               // 9 แลป (ถ้ามี)
      ]
    },

    // ================= SJS =================
    {
      phenotype: "SJS",
      rules: [
        { anyOf: ["shape.target_like_not_3ring"] },                                                     // 1 รูปร่าง
        { anyOf: ["color.black","color.gray","color.red"] },                                            // 2 สี
        { anyOf: ["detach.lt10"], boost: 3 },                                                           // 3 ลักษณะสำคัญ x3
        { anyOf: ["exudate.serous","blister.large","blister.small","blister.medium"] },                 // 4 อาการผิวเพิ่ม
        { anyOf: ["exudate.crust"] },                                                                   // 5 สะเก็ด
        { anyOf: ["loc.trunk"] },                                                                       // 6 ตำแหน่ง
        { anyOf: ["onset.1to6h","onset.6to24h","onset.1w","onset.2w","onset.3w"] },                     // 7 เวลา
        { anyOf: ["sys.fever","sys.myalgia","gi.nv","gi.bleed"] },                                      // 8 ระบบอื่น
        { anyOf: ["loc.lip","loc.periocular","loc.trunk","loc.arm","loc.leg","loc.face","loc.hand","loc.foot"] }, // 9 อวัยวะ/บริเวณ
        { anyOf: ["sjs.mucosal_gt1"] }                                                                  // 10 ✅ จำนวนผื่นบริเวณเยื่อบุ > 1
      ]
    },

    // ================= TEN =================
    {
      phenotype: "TEN",
      rules: [
        { anyOf: ["color.red","color.black"] },                                                         // 1 สี
        { anyOf: ["shape.target_like_not_3ring","shape.plaque_raised"] },                               // 2 รูปร่าง
        { anyOf: ["detach.gt30"], boost: 3 },                                                           // 3 ลักษณะสำคัญ x3
        { anyOf: ["blister.large","exudate.serous","exudate.crust"] },                                  // 4 อาการผิวเพิ่ม
        { anyOf: ["color.pale"] },                                                                      // 5 พบน้อย
        { anyOf: ["loc.trunk","loc.arm","loc.leg","loc.face","loc.hand","loc.foot","loc.generalized","loc.lip"] }, // 6 ตำแหน่ง
        { anyOf: ["onset.1w","onset.2w","onset.3w"] },                                                  // 7 เวลา
        { anyOf: ["sys.fever","sys.myalgia","gi.nv","eye.conjunctivitis"] },                            // 8 ระบบอื่น
        { anyOf: ["lab.cr_rise","lab.ast_alt_elev","lab.protein_urine","lab.spO2_lt94_or_rr_hr"] }      // 9 แลป/ชีพจร (ถ้ามี)
      ]
    },

    // ====== ตัวอื่น ๆ (ย่อ) สามารถเติมตามสเปคของคุณได้ =====
  ];

  // ===== คำนวณคะแนนจากกฎแบบ “กลุ่มข้อใหญ่” =====
  function scorePhenotype(ruleSet, feat) {
    let got = 0, max = 0;
    for (const g of ruleSet.rules) {
      const w = g.boost ? Number(g.boost) : 1;
      max += w;
      const ok = (g.anyOf || []).some(tk => feat.has(tk));
      if (ok) got += w;
    }
    if (max === 0) return 0;
    return Math.round((got / max) * 100);
  }

  // ===== ประเมินภาพรวม =====
  function evaluate() {
    const d = window.drugAllergyData || {};
    const ready = !!(d.page1 && d.page1.__saved && d.page2 && d.page2.__saved && d.page3 && d.page3.__saved);
    if (!ready) {
      renderIntoPage6('<div class="p6-muted">ยังไม่มีข้อมูลเพียงพอจากหน้า 1–3 หรือยังไม่คำนวณ</div>');
      return;
    }

    // เก็บ tokens
    const feat = FeatureBag();
    collectFromPage1(feat);
    collectFromPage2(feat);
    collectFromPage3(feat);

    // คำนวณทุก phenotype
    const results = brainRules.map(rs => ({
      name: rs.phenotype,
      score: scorePhenotype(rs, feat)
    }));

    // หา max เพื่อแสดง "ผลเด่น"
    results.sort((a, b) => b.score - a.score);
    const top = results[0];

    // เรนเดอร์เป็น bars
    const rows = results.map(r => {
      return `
      <div class="p6-row">
        <div class="p6-label">${r.name}</div>
        <div class="p6-bar">
          <div class="p6-fill" style="width:${r.score}%"></div>
        </div>
        <div class="p6-val">${r.score}%</div>
      </div>`;
    }).join("");

    const html = `
      <div class="p6-card">
        <div class="p6-head">ผลการประเมินเบื้องต้น</div>
        <div class="p6-sub">ผลเด่น: <strong>${top ? top.name : "-"}</strong></div>
        <div class="p6-list">${rows}</div>
      </div>
      <style>
        .p6-card{background:#fff;border:1px solid rgba(0,0,0,.06);border-radius:14px;padding:14px;box-shadow:0 10px 24px rgba(0,0,0,.06)}
        .p6-head{font-weight:800;color:#111827;margin-bottom:6px}
        .p6-sub{font-size:.92rem;color:#374151;margin-bottom:10px}
        .p6-row{display:grid;grid-template-columns:180px 1fr 48px;align-items:center;gap:10px;margin:.35rem 0}
        .p6-label{color:#111827}
        .p6-bar{height:14px;background:#f3f4f6;border-radius:999px;overflow:hidden}
        .p6-fill{height:100%;background:linear-gradient(90deg,#7c3aed,#06b6d4)}
        .p6-val{font-weight:700;color:#111827;text-align:right}
        .p6-muted{color:#6b7280}
      </style>
    `;
    renderIntoPage6(html);
  }

  // ===== ให้ฟังก์ชันนี้ใช้ภายนอกได้ =====
  window.brainRules = brainRules;
  window.evaluateDrugAllergy = evaluate;

  // ===== auto re-evaluate เมื่อมีการอัปเดต =====
  document.addEventListener("da:update", evaluate);
})();

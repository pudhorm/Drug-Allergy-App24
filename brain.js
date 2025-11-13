// ===================== brain.js (REPLACE WHOLE FILE) =====================
(function () {
  // จุดหมายเรนเดอร์ในหน้า 6
  function renderIntoPage6(html) {
    const box = document.getElementById("p6BrainBox");
    if (!box) return;
    box.innerHTML = html;
  }

  // --------------------------- รายการผลลัพธ์ 21 รายการ ---------------------------
  const ADR_LIST = [
    "Urticaria",
    "Anaphylaxis",
    "Angioedema",
    "Maculopapular rash",
    "Fixed drug eruption",
    "AGEP",
    "SJS",
    "TEN",
    "DRESS",
    "Erythema multiforme (EM)",
    "Photosensitivity drug eruption",
    "Exfoliative dermatitis",
    "Eczematous drug eruption",
    "Bullous Drug Eruption",
    "Serum sickness",
    "Vasculitis",
    "Hemolytic anemia",
    "Pancytopenia / Neutropenia / Thrombocytopenia",
    "Nephritis",
    "Angioedema (duplicate guard)", // กันช่องหาย – คงให้โชว์ 21 ช่องถ้วน
    "Others"
  ];

  // --------------------------- ดึงแฟ็กต์จากหน้า 1–3 ---------------------------
  function collectFacts() {
    const d1 = (window.drugAllergyData && window.drugAllergyData.page1) || {};
    const d2 = (window.drugAllergyData && window.drugAllergyData.page2) || {};
    const d3 = (window.drugAllergyData && window.drugAllergyData.page3) || {};

    // helper page2: มีข้อความนี้ถูกติ๊กไหม
    function hasP2(txt) {
      // d2[groupKey][txt]?.checked === true
      for (const k of Object.keys(d2 || {})) {
        if (!d2[k] || typeof d2[k] !== "object") continue;
        if (d2[k][txt] && d2[k][txt].checked) return true;
      }
      return false;
    }

    // onset
    const onset = d1.onset || "";
    const onsetFacts = {
      onset_1h: onset === "1h",
      onset_1to6h: onset === "1to6h",
      onset_6to24h: onset === "6to24h",
      onset_1w: onset === "1w",
      onset_2w: onset === "2w",
      onset_3w: onset === "3w",
      onset_4w: onset === "4w",
      onset_other: onset === "other"
    };

    // shapes / colors
    const shapes = new Set(d1.rashShapes || []);
    const colors = new Set(d1.rashColors || []);
    const locs = new Set(d1.locations || []);

    // page1 grouped flags
    const f = {
      // รูปทรง
      shape_wheals: shapes.has("ตุ่มนูน") || shapes.has("ปื้นนูน"),
      shape_plaque: shapes.has("ปื้นนูน"),
      shape_circle: shapes.has("วงกลมชั้นเดียว") || shapes.has("วงรี") || shapes.has("วงกลม 3 ชั้น"),
      shape_target3: shapes.has("วงกลม 3 ชั้น"),
      shape_edge_irregular: shapes.has("ขอบหยัก") || shapes.has("ขอบไม่ชัดเจน"),
      shape_edge_smooth: shapes.has("ขอบเรียบ"),
      // สี
      color_red: colors.has("แดง"),
      color_red_pale: colors.has("แดงซีด"),
      color_pale: colors.has("ซีด"),
      color_burnt: colors.has("แดงไหม้"),
      color_purple: colors.has("ม่วง"),
      color_yellow: colors.has("เหลือง"),
      color_black: colors.has("ดำ"),
      color_gray: colors.has("เทา"),
      // blister / bulla
      blister_small: !!d1.blisters?.small,
      blister_medium: !!d1.blisters?.medium,
      blister_large: !!d1.blisters?.large,
      // detachment
      detach_center: !!d1.skinDetach?.center,
      detach_lt10: !!d1.skinDetach?.lt10,
      detach_gt30: !!d1.skinDetach?.gt30,
      // scales / crust / dry / peel
      scale_scales: !!d1.scales?.scale,
      scale_dry: !!d1.scales?.dry,
      scale_peel: !!d1.scales?.peel,
      exudate_serous: !!d1.exudate?.serous,
      exudate_crust: !!d1.exudate?.crust,
      // itch / pain
      itch: !!d1.itch?.has,
      itch_severe: !!d1.itch?.severe,
      itch_mild: !!d1.itch?.mild,
      pain_pain: !!d1.pain?.pain,
      pain_burn: !!d1.pain?.burn,
      pain_sore: !!d1.pain?.sore,
      // swelling / pustule
      swelling: !!d1.swelling?.has,
      pustule: !!d1.pustule?.has,
      // ตำแหน่ง
      loc_trunk: locs.has("ลำตัว"),
      loc_face: locs.has("หน้า"),
      loc_lips: locs.has("ริมฝีปาก"),
      loc_eyes: locs.has("รอบดวงตา"),
      loc_hands: locs.has("มือ"),
      loc_feet: locs.has("เท้า"),
      loc_genital: locs.has("อวัยวะเพศ"),
      // การกระจาย
      distrib_sym: d1.distribution === "สมมาตร",
      // mucosal count >1 (checkbox ใหม่ในหน้า 1)
      mucosal_gt1: !!d1.mucosalMany
    };

    // page2 systemic
    const s = {
      wheeze: hasP2("หายใจมีเสียงวี๊ด"),
      resp_comp: hasP2("หอบเหนื่อย/หายใจลำบาก (RR>21 หรือ HR>100 หรือ SpO2<94%)"),
      cough_blood: hasP2("ไอเป็นเลือด"),
      chest_pain: hasP2("เจ็บหน้าอก"),
      palpitation: hasP2("ใจสั่น"),
      bp_low: hasP2("BP ต่ำ (<90/60)"),
      bp_drop30: hasP2("BP ลดลง ≥30% ของ baseline systolic เดิม"),
      hr_high: hasP2("HR สูง (>100)"),
      syncope: hasP2("หน้ามืด/หมดสติ"),
      fever: hasP2("ไข้ Temp > 37.5 °C"),
      myalgia: hasP2("ปวดเมื่อยกล้ามเนื้อ"),
      n_v: hasP2("คลื่นไส้/อาเจียน"),
      abd_cramp: hasP2("ปวดบิดท้อง"),
      diarrhea: hasP2("ท้องเสีย"),
      dysphagia: hasP2("กลืนลำบาก"),
      gi_bleed: hasP2("เลือดออกในทางเดินอาหาร"),
      eye_conj: hasP2("เยื่อบุตาอักเสบ (ตาแดง)")
    };

    return { onsetFacts, f, s, raw: { d1, d2, d3 } };
  }

  // --------------------------- Rule Engine (เรียบง่าย/แยกข้อใหญ่) ---------------------------
  // แต่ละกฎคือแฟ็กต์ 1 ตัว และอาจกำหนด weightMultiplier ได้ (x2, x3, x4…)
  // ไม่รวมข้อใหญ่เข้าด้วยกัน: เราใส่เป็น rule ชิ้นแยก
  const RULES = {
    "Urticaria": [
      { fact: "shape_wheals", w: 2 },
      { fact: "itch", w: 1 },
      { fact: "color_red", w: 1 },
      { fact: "onset_1h", w: 2 }
    ],
    "Anaphylaxis": [
      { fact: "wheeze", w: 2 },
      { fact: "resp_comp", w: 2 },
      { fact: "bp_low", w: 3 },
      { fact: "bp_drop30", w: 3 },
      { fact: "hr_high", w: 2 },
      { fact: "onset_1h", w: 2 }
    ],
    "Angioedema": [
      { fact: "swelling", w: 3 },
      { fact: "shape_edge_irregular", w: 1 },
      { fact: "color_pale", w: 1 },
      { fact: "onset_1h", w: 2 },
      { fact: "loc_lips", w: 2 },
      { fact: "loc_eyes", w: 1 },
      { fact: "loc_genital", w: 1 }
    ],
    "Maculopapular rash": [
      { fact: "color_red", w: 1 },
      { fact: "shape_plaque", w: 2 },
      { fact: "itch", w: 1 },
      { fact: "onset_1to6h", w: 1 },
      { fact: "onset_6to24h", w: 1 },
      { fact: "onset_1w", w: 1 },
      { fact: "distrib_sym", w: 1 }
    ],
    "Fixed drug eruption": [
      { fact: "shape_circle", w: 1 },
      { fact: "color_black", w: 3 },
      { fact: "pain_burn", w: 1 },
      { fact: "loc_lips", w: 2 }
    ],
    "AGEP": [
      { fact: "pustule", w: 3 },
      { fact: "color_red", w: 1 },
      { fact: "fever", w: 1 }
    ],
    "SJS": [
      { fact: "detach_lt10", w: 3 },        // ค่าน้ำหนัก x3 (หลัก)
      { fact: "color_black", w: 1 },
      { fact: "color_gray", w: 1 },
      { fact: "color_red", w: 1 },
      { fact: "exudate_serous", w: 1 },     // น้ำเหลือง
      { fact: "blister_small", w: 1 },
      { fact: "blister_medium", w: 1 },
      { fact: "blister_large", w: 1 },
      { fact: "loc_trunk", w: 1 },
      { fact: "onset_1to6h", w: 1 },
      { fact: "onset_6to24h", w: 1 },
      { fact: "onset_1w", w: 1 },
      { fact: "onset_2w", w: 1 },
      { fact: "onset_3w", w: 1 },
      { fact: "fever", w: 1 },
      { fact: "myalgia", w: 1 },
      { fact: "n_v", w: 1 },
      { fact: "gi_bleed", w: 1 },
      { fact: "mucosal_gt1", w: 2 }         // ✅ เพิ่มเงื่อนไข “จำนวนผื่นบริเวณเยื่อบุ > 1”
    ],
    "TEN": [
      { fact: "detach_gt30", w: 3 },
      { fact: "color_red", w: 1 },
      { fact: "exudate_serous", w: 1 },
      { fact: "blister_large", w: 2 }
    ],
    "DRESS": [
      { fact: "fever", w: 1 },
      { fact: "color_red", w: 1 },
      { fact: "onset_1w", w: 1 },
      { fact: "onset_2w", w: 1 },
      { fact: "onset_3w", w: 1 },
      { fact: "onset_4w", w: 1 }
    ],
    "Erythema multiforme (EM)": [
      { fact: "shape_target3", w: 3 },
      { fact: "color_red", w: 1 },
      { fact: "color_red_pale", w: 1 }
    ],
    "Photosensitivity drug eruption": [
      { fact: "color_burnt", w: 2 },
      { fact: "exudate_crust", w: 1 },
      { fact: "onset_1h", w: 1 },
      { fact: "onset_1to6h", w: 1 },
      { fact: "onset_6to24h", w: 1 }
    ],
    "Exfoliative dermatitis": [
      { fact: "color_red", w: 1 },
      { fact: "scale_dry", w: 3 },
      { fact: "scale_scales", w: 3 },
      { fact: "scale_peel", w: 3 }
    ],
    "Eczematous drug eruption": [
      { fact: "shape_wheals", w: 1 },
      { fact: "color_red", w: 1 },
      { fact: "itch", w: 2 },
      { fact: "exudate_crust", w: 1 }
    ],
    "Bullous Drug Eruption": [
      { fact: "blister_medium", w: 2 },
      { fact: "blister_large", w: 2 },
      { fact: "pain_burn", w: 1 },
      { fact: "exudate_serous", w: 1 }
    ],
    "Serum sickness": [
      { fact: "fever", w: 2 },
      { fact: "pain_sore", w: 1 }
    ],
    "Vasculitis": [
      { fact: "exudate_crust", w: 1 },
      { fact: "color_purple", w: 2 } // ใช้แทน “จ้ำเลือด” ทางผิวหนัง
    ],
    "Hemolytic anemia": [
      { fact: "bp_low", w: 1 } // ตัวแทนเบื้องต้น (จะเติมจาก Lab ในหน้า 3 ได้ภายหลัง)
    ],
    "Pancytopenia / Neutropenia / Thrombocytopenia": [
      { fact: "fever", w: 1 },
      { fact: "hr_high", w: 1 }
    ],
    "Nephritis": [
      { fact: "bp_high", w: 0 } // placeholder (ให้ครบ 21 ช่อง)
    ],
    "Angioedema (duplicate guard)": [
      { fact: "swelling", w: 1 } // กันช่องไม่ครบ 21 – ไม่ไปทับคะแนน Angioedema ตัวหลัก
    ],
    "Others": []
  };

  // คำนวณคะแนนเป็น 0–100 (normalized ตามน้ำหนักรวมของกฎ)
  function scoreADR(adName, facts) {
    const rules = RULES[adName] || [];
    let got = 0;
    let max = 0;
    for (const r of rules) {
      const w = r.w || 1;
      max += w;
      if (facts[r.fact]) got += w;
    }
    if (max === 0) return 0;
    return Math.round((got / max) * 100);
  }

  function computeAll() {
    const { f, s, onsetFacts } = collectFacts();
    // รวมแฟ็กต์จากทุกชุดเป็นกุญแจเดียว (ชื่อไม่ซ้ำ)
    const facts = { ...f, ...s, ...onsetFacts };

    const scores = {};
    for (const name of ADR_LIST) {
      scores[name] = scoreADR(name, facts);
    }
    return scores;
  }

  // --------------------------- เรนเดอร์ผลลัพธ์ ---------------------------
  function renderBrain() {
    const scores = computeAll();

    const rows = ADR_LIST.map(name => {
      const pct = scores[name] ?? 0;
      return `
        <div class="p6-row" style="margin:.35rem 0">
          <div style="font-weight:600;color:#111827;margin-bottom:.15rem">${name}</div>
          <div style="background:#f3f4f6;border-radius:.75rem;overflow:hidden;height:16px;position:relative;">
            <div style="width:${pct}%;height:100%;
              background:linear-gradient(90deg,#7c3aed,#06b6d4);
              transition:width .35s ease;"></div>
            <div style="position:absolute;right:.5rem;top:0;height:100%;display:flex;align-items:center;font-size:.8rem;color:#111827">
              ${pct}%
            </div>
          </div>
        </div>
      `;
    }).join("");

    renderIntoPage6(`
      <div style="margin-bottom:.75rem;font-weight:800;color:#1f2937">ผลการประเมินเบื้องต้น</div>
      ${rows}
      <div style="margin-top:.75rem">
        <button id="brain_refresh"
          style="background:#eef2ff;color:#3730a3;border:1px solid #c7d2fe;
                 padding:.5rem .85rem;border-radius:.8rem;font-weight:700;cursor:pointer">
          🔄 รีเฟรชผลประเมิน
        </button>
      </div>
    `);

    const btn = document.getElementById("brain_refresh");
    if (btn) btn.addEventListener("click", renderBrain);
  }

  // ให้ภายนอกเรียกได้
  window.evaluateDrugAllergy = renderBrain;

  // auto-render เมื่อข้อมูลอัปเดต
  document.addEventListener("da:update", renderBrain);

  // render ครั้งแรกเมื่อโหลดไฟล์
  setTimeout(renderBrain, 0);
})();

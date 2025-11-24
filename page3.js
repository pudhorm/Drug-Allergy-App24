// ===================== page3.js (REPLACE WHOLE FILE) =====================
(function () {
  if (!window.drugAllergyData) window.drugAllergyData = {};
  if (!window.drugAllergyData.page3) window.drugAllergyData.page3 = {};

  // โครง Lab เป็นกลุ่มๆ — ปรับตามสเปคใหม่
  const LAB_GROUPS = [
    {
      key: "lung",
      title: "ปอด",
      emoji: "🫁",
      items: [
        { key: "spo2_lt94", label: "SpO2 < 94%", unit: "%" },
        { key: "lung_abnormal", label: "Lung function (Abnormal Sound/CXR)", unit: "" }
      ]
    },
    {
      key: "cbc",
      title: "CBC",
      emoji: "🩸",
      items: [
        { key: "eos_gt5", label: "Eosinophil >5%", unit: "%" },
        { key: "eos_ge10", label: "Eosinophil ≥ 10%", unit: "%" },
        { key: "atypical_lymph", label: "Atypical lymphocyte", unit: "%" },
        { key: "wbc_gt11000", label: "White Blood Cell (WBC) > 11000 cells/cu.mm", unit: "cells/cu.mm" },
        { key: "wbc_lt4000", label: "White Blood Cell (WBC) < 4000 cells/cu.mm", unit: "cells/cu.mm" },
        { key: "neut_gt75", label: "Neutrophil > 75 (%)", unit: "%" },
        { key: "anc_lt1500", label: "Absolute neutrophil count (ANC) < 1500 cells/cu.mm", unit: "cells/cu.mm" },
        { key: "rbc_5_10_hpf", label: "RBC 5-10/HPF", unit: "cells/HPF" },
        { key: "hb_drop_ge2_3", label: "Hemoglobin (Hb) ลดลง ≥ 2-3 g/dL ภายใน 24-48 ชม.", unit: "g/dL" },
        { key: "hb_lt10", label: "Hemoglobin (Hb) < 10 g/dL", unit: "g/dL" },
        { key: "hct_lt30", label: "Hematocrit (Hct) < 30%", unit: "%" },
        { key: "plt_lt100k", label: "Platelet (Plt) < 100,000 cells/cu.mm", unit: "cells/cu.mm" },
        { key: "plt_lt150k", label: "Platelet (Plt) < 150,000 cells/cu.mm", unit: "cells/cu.mm" }
      ]
    },
    {
      key: "rft",
      title: "RFT (ไต)",
      emoji: "🫧",
      items: [
        {
          key: "cr_aki",
          label: "Serum creatinine (Cr) เพิ่มขึ้น ≥0.3 mg/dL ภายใน 48 ชม. หรือ ≥1.5X จาก baseline ภายใน 7 วัน",
          unit: "mg/dL"
        },
        {
          key: "egfr_lt60",
          label: "eGFR: < 60 mL/min/1.73m²",
          unit: "mL/min/1.73m²"
        }
      ]
    },
    {
      key: "ua",
      title: "Urinalysis (UA)",
      emoji: "🧪",
      items: [
        { key: "protein_pos", label: "protein+", unit: "+" }
      ]
    },
    {
      key: "lft",
      title: "LFT (ตับ)",
      emoji: "💊",
      items: [
        {
          key: "alt_ast_ge2x",
          label: "ALT/AST ≥ 2X ULN หรือ ≥ 40 U/L",
          unit: "U/L"
        }
      ]
    },
    {
      key: "heart",
      title: "หัวใจ",
      emoji: "❤️",
      items: [
        { key: "ekg_abnormal", label: "EKG ผิดปกติ", unit: "" },
        { key: "tropi_gt004", label: "Troponin I > ULN", unit: "ng/mL" },
        { key: "tropt_gt001_003", label: "Troponin T > ULN", unit: "ng/mL" }
      ]
    },
    {
      key: "immuno",
      title: "Immunology",
      emoji: "🧬",
      items: [
        { key: "igg_pos", label: "IgG+", unit: "" },
        { key: "c3_pos", label: "C3+", unit: "" },
        { key: "c3c4_low", label: "C3 และ/หรือ C4 < LLN", unit: "mg/dL" }
      ]
    },
    {
      key: "chem",
      title: "Blood chemistry",
      emoji: "🧫",
      items: [
        {
          key: "ldh_high",
          label: "Lactate dehydrogenase (LDH) สูง (2-10X ULN)",
          unit: "U/L"
        }
      ]
    }
  ];

  // helper แปลง string → number แบบทน ๆ
  function toNum(v) {
    const n = Number(String(v ?? "").toString().replace(/[, ]+/g, ""));
    return Number.isFinite(n) ? n : NaN;
  }

  // ---------- RENDER ----------
  function renderPage3() {
    const root = document.getElementById("page3");
    if (!root) return;

    const saved = window.drugAllergyData.page3;

    root.innerHTML = `
      <div style="background:linear-gradient(180deg,#d1fae5 0%, #e0fdf7 40%, #f4fffd 100%);border:1px solid rgba(16,185,129,.25);border-radius:1.4rem;min-height:70vh;padding:1.4rem 1.4rem 5.8rem;box-shadow:0 14px 30px rgba(13,148,136,.06);">
        <h2 style="display:flex;align-items:center;gap:.6rem;font-size:1.55rem;font-weight:700;color:#064e3b;margin:0 0 1rem;">
          <span style="font-size:1.7rem;">🧪</span>
          <span>หน้า 3 ผลตรวจทางห้องปฏิบัติการ</span>
        </h2>
        <p style="margin:0 0 1.1rem;color:#065f46;font-weight:500;">
          ติ้กเลือกเฉพาะผล Lab ที่มี + รายละเอียดเพิ่มเติมได้เลย
        </p>

        ${LAB_GROUPS.map(group => {
          const groupData = saved[group.key] || {};
          return `
            <section style="background:#ffffff;border:1px solid rgba(59,130,246,.05);border-left:6px solid rgba(13,148,136,.9);border-radius:1.1rem;padding:1rem 1rem 1.05rem;margin-bottom:1rem;box-shadow:0 8px 18px rgba(22,163,74,.03);">
              <h3 style="display:flex;align-items:center;gap:.5rem;font-size:1.05rem;font-weight:700;color:#0f766e;margin:0 0 .8rem;">
                <span>${group.emoji}</span>
                <span>${group.title}</span>
              </h3>

              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:.55rem 1.1rem;">
                ${group.items.map((item) => {
                  const fieldId = group.key + "_" + item.key;
                  const checked = groupData[item.key]?.checked ? "checked" : "";
                  const value = groupData[item.key]?.value || "";
                  const detail = groupData[item.key]?.detail || "";
                  return `
                    <label for="${fieldId}" style="display:flex;gap:.6rem;align-items:flex-start;background:rgba(224,247,243,.75);border:1px solid rgba(13,148,136,.12);border-radius:.8rem;padding:.45rem .55rem .55rem;">
                      <input type="checkbox" id="${fieldId}" data-group="${group.key}" data-item="${item.key}" ${checked} style="margin-top:.25rem;">
                      <div style="flex:1 1 auto;display:flex;flex-direction:column;gap:.35rem;">
                        <div style="display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;">
                          <span style="font-size:.87rem;color:#022c22;">${item.label}</span>
                          ${item.unit ? `<span style="font-size:.7rem;color:#047857;background:rgba(209,250,229,.7);padding:.1rem .45rem;border-radius:999px;">${item.unit}</span>` : ""}
                        </div>
                        <div style="display:flex;gap:.4rem;flex-wrap:wrap;">
                          <input type="text" placeholder="ค่า"
                            data-type="value" data-group="${group.key}" data-item="${item.key}" value="${value}"
                            style="flex:0 0 110px;border:1px solid rgba(13,148,136,.35);border-radius:.5rem;padding:.3rem .4rem;font-size:.8rem;min-width:100px;">
                          <input type="text" placeholder="รายละเอียดเพิ่มเติม"
                            data-type="detail" data-group="${group.key}" data-item="${item.key}" value="${detail}"
                            style="flex:1 1 auto;border:1px solid rgba(13,148,136,.15);border-radius:.5rem;padding:.3rem .4rem;font-size:.78rem;">
                        </div>
                      </div>
                    </label>
                  `;
                }).join("")}
              </div>
            </section>
          `;
        }).join("")}

        <!-- ปุ่มท้ายหน้า -->
        <div style="margin-top:1.5rem;display:flex;align-items:center;justify-content:space-between;">
          <button id="p3-clear"
            style="background:#ef4444;color:#fff;border:none;padding:.65rem 1rem;border-radius:1rem;font-weight:700;cursor:pointer;box-shadow:0 10px 20px rgba(239,68,68,.25);">
            🗑️ ล้างข้อมูลหน้านี้
          </button>
          <button id="p3-save-next"
            style="background:linear-gradient(120deg,#6366f1 0%,#7c3aed 60%,#9333ea 100%);color:#fff;border:none;padding:.75rem 1.15rem;border-radius:1rem;font-weight:800;cursor:pointer;box-shadow:0 12px 26px rgba(99,102,241,.28);">
            บันทึกข้อมูลและไปหน้า 4
          </button>
        </div>
      </div>
    `;

    // event delegation input/change
    root.addEventListener("input", onAnyInputOrChange, { passive: true });
    root.addEventListener("change", onAnyInputOrChange, { passive: true });

    // ล้างข้อมูล
    const clearBtn = root.querySelector("#p3-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        window.drugAllergyData.page3 = {};
        if (window.saveDrugAllergyData) window.saveDrugAllergyData();
        document.dispatchEvent(new Event("da:update"));
        if (typeof window.evaluateDrugAllergy === "function") {
          try { window.evaluateDrugAllergy(); } catch {}
        }
        renderPage3();
        alert("ล้างข้อมูลหน้า 3 แล้ว");
      });
    }

    // บันทึกและไปหน้า 4
    const saveNextBtn = root.querySelector("#p3-save-next");
    if (saveNextBtn) {
      saveNextBtn.addEventListener("click", () => {
        flushSave(); // เซฟทันที
        window.drugAllergyData.page3.__saved = true;
        if (window.saveDrugAllergyData) window.saveDrugAllergyData();
        if (typeof window.evaluateDrugAllergy === "function") {
          try { window.evaluateDrugAllergy(); } catch {}
        }
        alert("บันทึกหน้า 3 แล้ว");

        const btn4 = document.querySelector('.tabs button[data-target="page4"]');
        const page4 = document.getElementById("page4");
        if (btn4 && page4) {
          document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
          btn4.classList.add("active");
          document.querySelectorAll(".page").forEach(p => p.classList.remove("visible"));
          page4.classList.add("visible");
        } else if (btn4) {
          btn4.click();
        }

        setTimeout(() => {
          if (typeof window.renderPage4 === "function") window.renderPage4();
        }, 0);
      });
    }
  }

  // ---------- SAVE (debounced) ----------
  let saveTimer = null;
  function onAnyInputOrChange(ev) {
    const t = ev.target;
    if (!(t instanceof HTMLElement)) return;
    if (!t.hasAttribute("data-group") || !t.hasAttribute("data-item")) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(savePage3, 120);
  }

  function flushSave() {
    clearTimeout(saveTimer);
    savePage3();
  }

  function savePage3() {
    const root = document.getElementById("page3");
    if (!root) return;

    // รีเซ็ต page3 ทุกครั้งที่เซฟ เพื่อไม่ให้ข้อมูลเก่าค้าง
    const store = (window.drugAllergyData.page3 = {});

    const tokens = [];
    const labsFlat = {};

    // เตรียมโครง alias สำหรับให้สมองใช้ (cbc, rft, lft, urine, cardio, gas, immuno ฯลฯ)
    const cbcAlias = {};
    const rftAlias = {};
    const lftAlias = {};
    const urineAlias = {};
    const cardioAlias = {};
    const gasAlias = {};
    const immunoAlias = {};

    LAB_GROUPS.forEach(group => {
      const groupObj = {};
      group.items.forEach(item => {
        const cb = root.querySelector(
          'input[type="checkbox"][data-group="' + group.key + '"][data-item="' + item.key + '"]'
        );
        const valInput = root.querySelector(
          'input[data-type="value"][data-group="' + group.key + '"][data-item="' + item.key + '"]'
        );
        const detailInput = root.querySelector(
          'input[data-type="detail"][data-group="' + group.key + '"][data-item="' + item.key + '"]'
        );
        if (!cb || !valInput || !detailInput) return;

        const checked = cb.checked;
        const value = valInput.value.trim();
        const detail = detailInput.value.trim();

        // เก็บโครงสร้างเดิมไว้ (สำหรับแสดงผล)
        if (checked || value !== "" || detail !== "") {
          groupObj[item.key] = {
            checked,
            value,
            detail
          };
        }

        if (!checked) return; // ✅ ไม่ติ๊ก = ไม่เอาไปคิดคะแนน

        const numVal = toNum(value);
        const baseToken = group.key + ":" + item.key;     // เช่น "cbc:eos_gt5"
        const underToken = group.key + "_" + item.key;    // เช่น "cbc_eos_gt5"
        const simpleToken = item.key;                     // เช่น "eos_gt5"

        [baseToken, underToken, simpleToken].forEach(tok => {
          if (!tok) return;
          tokens.push(tok);
          labsFlat[tok] = {
            group: group.key,
            item: item.key,
            label: item.label,
            value,
            num: numVal,
            detail
          };
        });

        // ---------- mapping field ยอดนิยม (เดิม) ----------
        if (group.key === "cbc" && (item.key === "wbc_gt11000" || item.key === "wbc_lt4000")) {
          store.wbc = Number.isFinite(numVal) ? numVal : undefined;
        }
        if (group.key === "cbc" && (item.key === "eos_gt5" || item.key === "eos_ge10")) {
          store.eos = Number.isFinite(numVal) ? numVal : undefined;
        }
        if (group.key === "rft" && item.key === "cr_aki") {
          store.cre = Number.isFinite(numVal) ? numVal : undefined;
        }
        if (group.key === "rft" && item.key === "egfr_lt60") {
          store.egfr = Number.isFinite(numVal) ? numVal : undefined;
        }
        if (group.key === "lung" && item.key === "spo2_lt94") {
          store.spO2 = Number.isFinite(numVal) ? numVal : undefined;
        }
        if (group.key === "chem" && item.key === "ldh_high") {
          store.ldhNum = Number.isFinite(numVal) ? numVal : undefined;
        }

        // ---------- เพิ่ม alias ให้ตรงกับสิ่งที่ brain.rules.js ใช้ ----------

        // ปอด / gas
        if (group.key === "lung") {
          if (item.key === "spo2_lt94") {
            const v = Number.isFinite(numVal) ? numVal : 93;
            gasAlias.spo2 = { checked: true, value: String(v) };
          }
          if (item.key === "lung_abnormal") {
            // ใช้ใน DRESS/Neutropenia ผ่าน flag(p3.lungInvolve)
            store.lungInvolve = { checked: true };
          }
        }

        // CBC
        if (group.key === "cbc") {
          // Eosinophil
          if (item.key === "eos_gt5" || item.key === "eos_ge10") {
            const fallback =
              item.key === "eos_gt5" ? 6 : 10;
            const v = Number.isFinite(numVal) ? numVal : fallback;
            cbcAlias.eos = { checked: true, value: String(v) };
          }

          // Atypical lymphocyte → ใช้ใน DRESS
          if (item.key === "atypical_lymph") {
            cbcAlias.atypicalLymph = { checked: true, value: value || detail || "positive" };
          }

          // WBC >11000 / <4000
          if (item.key === "wbc_gt11000") {
            const v = Number.isFinite(numVal) ? numVal : 12000;
            cbcAlias.wbc = { checked: true, value: String(v) };
          }
          if (item.key === "wbc_lt4000") {
            const v = Number.isFinite(numVal) ? numVal : 3000;
            cbcAlias.wbc = { checked: true, value: String(v) };
          }

          // Neutrophil >75%
          if (item.key === "neut_gt75") {
            const v = Number.isFinite(numVal) ? numVal : 80;
            cbcAlias.neutrophil = { checked: true, value: String(v) };
          }

          // ANC <1500
          if (item.key === "anc_lt1500") {
            const v = Number.isFinite(numVal) ? numVal : 1000;
            cbcAlias.anc = { checked: true, value: String(v) };
          }

          // RBC 5–10/HPF → map ไป UA.rbc ด้วย (ใช้ใน serum sickness / vasculitis)
          if (item.key === "rbc_5_10_hpf") {
            const v = Number.isFinite(numVal) ? numVal : 7;
            urineAlias.rbc = { checked: true, value: String(v) };
          }

          // Hb ลด ≥2–3 g/dL (ใช้ใน hemolytic anemia)
          if (item.key === "hb_drop_ge2_3") {
            cbcAlias.hbDrop = { checked: true, value: value || "2-3" };
          }

          // Hb <10 g/dL
          if (item.key === "hb_lt10") {
            const v = Number.isFinite(numVal) ? numVal : 9.5;
            cbcAlias.hb = { checked: true, value: String(v) };
          }

          // Hct <30%
          if (item.key === "hct_lt30") {
            const v = Number.isFinite(numVal) ? numVal : 28;
            cbcAlias.hct = { checked: true, value: String(v) };
          }

          // Plt <100k / <150k
          if (item.key === "plt_lt100k") {
            const v = Number.isFinite(numVal) ? numVal : 90000;
            cbcAlias.plt = { checked: true, value: String(v) };
          }
          if (item.key === "plt_lt150k") {
            const v = Number.isFinite(numVal) ? numVal : 140000;
            cbcAlias.plt = { checked: true, value: String(v) };
          }
        }

        // RFT (Cr / eGFR)
        if (group.key === "rft") {
          if (item.key === "cr_aki") {
            const v = Number.isFinite(numVal) ? numVal : 2.0;
            rftAlias.cr = { checked: true, value: String(v) };
          }
          if (item.key === "egfr_lt60") {
            const v = Number.isFinite(numVal) ? numVal : 50;
            rftAlias.egfr = { checked: true, value: String(v) };
          }
        }

        // UA → protein+
        if (group.key === "ua") {
          if (item.key === "protein_pos") {
            urineAlias.protein = { checked: true, value: value || "+" };
          }
        }

        // LFT ALT/AST ≥2x ULN
        if (group.key === "lft") {
          if (item.key === "alt_ast_ge2x") {
            const v = Number.isFinite(numVal) ? numVal : 50;
            lftAlias.alt = { checked: true, value: String(v) };
            lftAlias.ast = { checked: true, value: String(v) };
          }
        }

        // Heart / Cardio
        if (group.key === "heart") {
          if (item.key === "ekg_abnormal") {
            cardioAlias.ekgAbnormal = { checked: true, value: "abnormal" };
          }
          if (item.key === "tropi_gt004") {
            const v = Number.isFinite(numVal) ? numVal : 0.05;
            cardioAlias.troponin = { checked: true, value: String(v) };
          }
          if (item.key === "tropt_gt001_003") {
            const v = Number.isFinite(numVal) ? numVal : 0.02;
            cardioAlias.troponin = { checked: true, value: String(v) };
          }
        }

        // Immunology
        if (group.key === "immuno") {
          if (item.key === "c3c4_low") {
            // ใช้ใน Serum sickness / Vasculitis ผ่าน c3,c4 ต่ำ
            const c3v = 80;
            const c4v = 8;
            immunoAlias.c3 = { checked: true, value: String(c3v) };
            immunoAlias.c4 = { checked: true, value: String(c4v) };
          }
          // igg_pos / c3_pos เก็บไว้เผื่อใช้ในอนาคต
          if (item.key === "igg_pos") {
            immunoAlias.igg = { checked: true, value: "positive" };
          }
          if (item.key === "c3_pos") {
            immunoAlias.c3 = { checked: true, value: value || "positive" };
          }
        }

        // LDH สูง (2–10x ULN) → ใช้ใน hemolytic anemia ผ่าน p3.ldh
        if (group.key === "chem" && item.key === "ldh_high") {
          const v = Number.isFinite(numVal) ? numVal : 3;
          store.ldh = { checked: true, value: String(v) };
        }
      });

      // เก็บกลุ่มตาม key ที่หน้า 3 ใช้แสดง
      store[group.key] = groupObj;
    });

    // ใส่ alias กลับเข้าโครงที่สมองใช้
    if (Object.keys(cbcAlias).length) {
      store.cbc = Object.assign(store.cbc || {}, cbcAlias);
    }
    if (Object.keys(rftAlias).length) {
      store.rft = Object.assign(store.rft || {}, rftAlias);
    }
    if (Object.keys(lftAlias).length) {
      store.lft = Object.assign(store.lft || {}, lftAlias);
    }
    if (Object.keys(urineAlias).length) {
      store.urine = Object.assign(store.urine || {}, urineAlias);
    }
    if (Object.keys(cardioAlias).length) {
      store.cardio = Object.assign(store.cardio || {}, cardioAlias);
    }
    if (Object.keys(gasAlias).length) {
      store.gas = Object.assign(store.gas || {}, gasAlias);
    }
    if (Object.keys(immunoAlias).length) {
      store.immunology = Object.assign(store.immunology || {}, immunoAlias);
      store.immuno = store.immunology; // ให้ทั้ง immunology / immuno ใช้ได้
    }

    // เก็บ tokens เฉพาะรายการที่ "ติ้กจริง ๆ"
    store.__tokens = tokens;
    store.__labs = labsFlat;
    store.__saved = true;
    store.__ts = Date.now();

    if (window.saveDrugAllergyData) window.saveDrugAllergyData();
    document.dispatchEvent(new Event("da:update"));
    if (typeof window.evaluateDrugAllergy === "function") {
      try { window.evaluateDrugAllergy(); } catch {}
    }
  }

  // export
  window.renderPage3 = renderPage3;
})();

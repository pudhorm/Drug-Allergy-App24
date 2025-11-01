// page3.js
(function () {
  if (!window.drugAllergyData) window.drugAllergyData = {};
  if (!window.drugAllergyData.page3) window.drugAllergyData.page3 = {};

  const LAB_SECTIONS = [
    {
      key: "cbc",
      title: "CBC",
      emoji: "🩸",
      items: [
        // แก้ชื่อ + หน่วยตรงนี้
        { key: "wbc", label: "White Blood Cell", unit: "cells/cu.mm" },
        { key: "aec", label: "Absolute eosinophil count (AEC)", unit: "/µL" },
        { key: "neut", label: "Neutrophil", unit: "%" },
        { key: "lym", label: "Lymphocyte", unit: "%" },
        { key: "atyp", label: "Atypical lymphocytes", unit: "%" },
        { key: "eos", label: "Eosinophil", unit: "%" },
        { key: "hb", label: "Hemoglobin (Hb)", unit: "g/dL" },
        // แก้หน่วยตรงนี้
        { key: "plt", label: "Platelet (Plt)", unit: "cells/cu.mm" }
      ]
    },
    {
      key: "lft",
      title: "LFT (ตับ)",
      emoji: "💊",
      items: [
        { key: "ast", label: "AST", unit: "U/L" },
        { key: "alt", label: "ALT", unit: "U/L" },
        { key: "alp", label: "ALP", unit: "U/L" },
        { key: "tbili", label: "Total Bilirubin", unit: "mg/dL" },
        { key: "dbili", label: "Direct Bilirubin", unit: "mg/dL" }
      ]
    },
    {
      key: "rft",
      title: "RFT (ไต)",
      emoji: "🫗",
      items: [
        { key: "bun", label: "BUN", unit: "mg/dL" },
        { key: "crt", label: "Creatinine", unit: "mg/dL" },
        { key: "egfr", label: "eGFR", unit: "mL/min/1.73m²" },
        { key: "uo", label: "UO (Urine output)", unit: "mL/kg/hr" }
      ]
    },
    {
      key: "electrolyte",
      title: "Electrolytes",
      emoji: "⚡",
      items: [
        { key: "na", label: "Na", unit: "mmol/L" },
        { key: "k", label: "K", unit: "mmol/L" },
        { key: "cl", label: "Cl", unit: "mmol/L" },
        { key: "hco3", label: "HCO₃⁻ (TCO₂)", unit: "mmol/L" },
        { key: "ca", label: "Ca", unit: "mg/dL" },
        { key: "mg", label: "Mg", unit: "mg/dL" },
        { key: "phos", label: "Phosphate", unit: "mg/dL" }
      ]
    },
    {
      key: "ua",
      title: "Urinalysis (UA)",
      emoji: "🧫",
      items: [
        { key: "protein", label: "Protein", unit: "mg/dL / +" },
        { key: "rbc", label: "Blood / RBC", unit: "cells/HPF" },
        { key: "wbc", label: "WBC", unit: "cells/HPF" },
        { key: "nitrite", label: "Nitrite", unit: "pos/neg" },
        { key: "le", label: "Leukocyte esterase", unit: "pos/neg" },
        { key: "sg", label: "Specific gravity", unit: "" },
        { key: "ph", label: "pH", unit: "" },
        { key: "glucose", label: "Glucose", unit: "mg/dL / +" },
        { key: "ketone", label: "Ketone", unit: "+" }
      ]
    },
    {
      key: "lung",
      title: "ปอด",
      emoji: "🫁",
      items: [
        { key: "spo2", label: "SpO₂", unit: "%" },
        { key: "lungfx", label: "Lung function (sound / CXR)", unit: "" }
      ]
    },
    {
      key: "heart",
      title: "หัวใจ",
      emoji: "❤️",
      items: [
        { key: "trop_i", label: "Troponin I", unit: "ng/mL" },
        { key: "trop_t", label: "Troponin T", unit: "ng/mL" },
        { key: "ckmb", label: "CK-MB", unit: "ng/mL" },
        { key: "ekg", label: "EKG", unit: "ค่า/ผล" }
      ]
    },
    {
      key: "immuno",
      title: "Immunology / Allergy",
      emoji: "🧬",
      items: [
        { key: "ige", label: "IgE", unit: "IU/mL" },
        { key: "c3c4", label: "Complement (C3/C4)", unit: "mg/dL" }
      ]
    }
  ];

  function renderPage3() {
    const root = document.getElementById("page3");
    if (!root) return;

    const saved = window.drugAllergyData.page3 || {};

    root.innerHTML = `
      <div class="p3-wrapper" style="
        background: radial-gradient(circle at top, #d1fae5 0%, #ecfdf3 45%, #ffffff 85%);
        border: 1px solid rgba(16, 185, 129, .12);
        border-radius: 1.4rem;
        padding: 1.3rem 1.5rem 3.6rem;
        box-shadow: 0 12px 30px rgba(22, 163, 74, 0.07);
      ">
        <h1 style="display:flex;align-items:center;gap:.5rem;font-size:1.45rem;font-weight:700;color:#065f46;margin:0 0 1.1rem;">
          <span>🧪</span>
          <span>หน้า 3 ผลตรวจทางห้องปฏิบัติการ</span>
        </h1>
        <p style="margin:0 0 1.2rem;color:#065f46;opacity:.85;font-size:.88rem;">
          ติ้กเลือกเฉพาะผล Lab ที่มี + รายละเอียดเพิ่มเติมได้เลย
        </p>

        <div class="p3-grid" style="display:flex;flex-direction:column;gap:1rem;">
          ${LAB_SECTIONS.map(sec => {
            const secData = saved[sec.key] || {};
            return `
              <div class="p3-card" style="
                background: rgba(255,255,255,.94);
                border: 1px solid rgba(5, 150, 105, .12);
                border-radius: 1.05rem;
                padding: 1rem 1rem 1.1rem;
                box-shadow: 0 8px 15px rgba(15,118,110,.03);
              ">
                <div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.7rem;">
                  <span style="font-size:1.35rem;">${sec.emoji}</span>
                  <h2 style="font-size:1.05rem;font-weight:700;color:#065f46;margin:0;">${sec.title}</h2>
                </div>
                <div class="p3-items" style="
                  display:grid;
                  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                  gap:.6rem .7rem;
                ">
                  ${sec.items.map(item => {
                    const id = `${sec.key}_${item.key}`;
                    const row = secData[item.key] || {};
                    const checked = row.checked ? "checked" : "";
                    const value = row.value ?? "";
                    const detail = row.detail ?? "";
                    return `
                      <label for="${id}" style="
                        display:grid;
                        grid-template-columns: auto 120px 55px;
                        grid-template-rows: auto auto;
                        gap:.3rem .5rem;
                        align-items:center;
                        background: rgba(209, 250, 229, .25);
                        border: 1px solid rgba(22, 163, 74, .08);
                        border-radius:.7rem;
                        padding:.4rem .5rem .55rem;
                      ">
                        <div style="display:flex;align-items:center;gap:.4rem;">
                          <input type="checkbox" id="${id}" data-sec="${sec.key}" data-item="${item.key}" ${checked}
                            style="width:16px;height:16px;accent-color:#059669;">
                          <span style="font-size:.83rem;color:#0f172a;">${item.label}</span>
                        </div>
                        <input type="text" placeholder="ค่า" value="${value}"
                          class="p3-val" data-sec="${sec.key}" data-item="${item.key}"
                          style="width:100%;border:1px solid rgba(16,185,129,.35);border-radius:.55rem;padding:.3rem .4rem;font-size:.78rem;${checked ? "" : "opacity:.35;"}" ${checked ? "" : "disabled"}>
                        <span style="font-size:.7rem;color:#047857;">${item.unit || ""}</span>
                        <input type="text" placeholder="รายละเอียดเพิ่มเติม"
                          class="p3-detail" data-sec="${sec.key}" data-item="${item.key}"
                          value="${detail}"
                          style="grid-column:1 / 4;width:100%;border:1px solid rgba(16,185,129,.12);border-radius:.55rem;padding:.32rem .4rem;font-size:.75rem;${checked ? "" : "display:none;"}">
                      </label>
                    `;
                  }).join("")}
                </div>
              </div>
            `;
          }).join("")}
        </div>

        <div style="display:flex;gap:1rem;margin-top:1.6rem;flex-wrap:wrap;">
          <button id="p3-save-next" style="
            background: linear-gradient(120deg,#22c55e 0%,#0f766e 70%);
            color:#fff;border:none;border-radius:.9rem;
            padding:.7rem 1.4rem;font-weight:600;cursor:pointer;
            box-shadow:0 10px 20px rgba(15,118,110,.25);
          ">บันทึกข้อมูลและไปหน้า 4</button>
          <button id="p3-clear" style="
            background:#ef4444;color:#fff;border:none;border-radius:.9rem;
            padding:.7rem 1.1rem;font-weight:600;cursor:pointer;
            box-shadow:0 10px 16px rgba(239,68,68,.28);
          ">ล้างข้อมูลหน้านี้</button>
        </div>
      </div>
    `;

    // bind events
    LAB_SECTIONS.forEach(sec => {
      sec.items.forEach(item => {
        const cb = root.querySelector(
          `input[type="checkbox"][data-sec="${sec.key}"][data-item="${item.key}"]`
        );
        const valInput = root.querySelector(
          `.p3-val[data-sec="${sec.key}"][data-item="${item.key}"]`
        );
        const detailInput = root.querySelector(
          `.p3-detail[data-sec="${sec.key}"][data-item="${item.key}"]`
        );
        if (!cb || !valInput || !detailInput) return;

        cb.addEventListener("change", () => {
          if (cb.checked) {
            valInput.disabled = false;
            valInput.style.opacity = "1";
            detailInput.style.display = "block";
          } else {
            valInput.disabled = true;
            valInput.style.opacity = ".35";
            valInput.value = "";
            detailInput.style.display = "none";
            detailInput.value = "";
          }
          savePage3();
        });

        valInput.addEventListener("input", savePage3);
        detailInput.addEventListener("input", savePage3);
      });
    });

    const btnSaveNext = document.getElementById("p3-save-next");
    const btnClear = document.getElementById("p3-clear");

    if (btnSaveNext) {
      btnSaveNext.addEventListener("click", () => {
        savePage3();
        const btn4 = document.querySelector('.tabs button[data-target="page4"]');
        const page4 = document.getElementById("page4");
        if (btn4 && page4) {
          document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
          btn4.classList.add("active");
          document.querySelectorAll(".page").forEach(p => p.classList.remove("visible"));
          page4.classList.add("visible");
        }
      });
    }

    if (btnClear) {
      btnClear.addEventListener("click", () => {
        LAB_SECTIONS.forEach(sec => {
          sec.items.forEach(item => {
            const cb = root.querySelector(
              `input[type="checkbox"][data-sec="${sec.key}"][data-item="${item.key}"]`
            );
            const v = root.querySelector(
              `.p3-val[data-sec="${sec.key}"][data-item="${item.key}"]`
            );
            const d = root.querySelector(
              `.p3-detail[data-sec="${sec.key}"][data-item="${item.key}"]`
            );
            if (!cb || !v || !d) return;
            cb.checked = false;
            v.value = "";
            v.disabled = true;
            v.style.opacity = ".35";
            d.value = "";
            d.style.display = "none";
          });
        });
        window.drugAllergyData.page3 = {};
        if (window.saveDrugAllergyData) window.saveDrugAllergyData();
      });
    }
  }

  function savePage3() {
    const root = document.getElementById("page3");
    if (!root) return;
    const store = (window.drugAllergyData.page3 = {});

    LAB_SECTIONS.forEach(sec => {
      const secObj = {};
      sec.items.forEach(item => {
        const cb = root.querySelector(
          `input[type="checkbox"][data-sec="${sec.key}"][data-item="${item.key}"]`
        );
        const v = root.querySelector(
          `.p3-val[data-sec="${sec.key}"][data-item="${item.key}"]`
        );
        const d = root.querySelector(
          `.p3-detail[data-sec="${sec.key}"][data-item="${item.key}"]`
        );
        if (!cb || !v || !d) return;
        if (cb.checked || v.value.trim() !== "" || d.value.trim() !== "") {
          secObj[item.key] = {
            checked: cb.checked,
            value: v.value.trim(),
            detail: d.value.trim()
          };
        }
      });
      store[sec.key] = secObj;
    });

    if (window.saveDrugAllergyData) window.saveDrugAllergyData();
  }

  window.renderPage3 = renderPage3;
})();

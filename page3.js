// page3.js
(function () {
  // เตรียมที่เก็บข้อมูลรวมของแอพ
  if (!window.drugAllergyData) window.drugAllergyData = {};
  if (!window.drugAllergyData.page3) window.drugAllergyData.page3 = {};

  // ---------------- กำหนดกลุ่มแลบ ----------------
  // แต่ละรายการ: label, unit, placeholder, icon อยู่ฝั่ง HTML
  const LAB_SECTIONS = [
    {
      key: "cbc",
      title: "CBC",
      emoji: "🩸",
      rows: [
        { name: "WBC", unit: "/µL" },
        { name: "Absolute eosinophil count (AEC)", unit: "/µL" },
        { name: "Neutrophil (%)", unit: "%" },
        { name: "Lymphocyte (%)", unit: "%" },
        { name: "Atypical lymphocytes (%)", unit: "%" },
        { name: "Eosinophil (%)", unit: "%" },
        { name: "Hemoglobin (Hb)", unit: "g/dL" },
        { name: "Platelet (Plt)", unit: "/µL" }
      ]
    },
    {
      key: "lft",
      title: "LFT (ตับ)",
      emoji: "💊",
      rows: [
        { name: "AST", unit: "U/L" },
        { name: "ALT", unit: "U/L" },
        { name: "ALP", unit: "U/L" },
        { name: "Total Bilirubin", unit: "mg/dL" },
        { name: "Direct Bilirubin", unit: "mg/dL" }
      ]
    },
    {
      key: "rft",
      title: "RFT (ไต)",
      emoji: "🫧",
      rows: [
        { name: "BUN", unit: "mg/dL" },
        { name: "Creatinine", unit: "mg/dL" },
        { name: "eGFR", unit: "mL/min/1.73m²" },
        { name: "UO (Urine output)", unit: "mL/kg/hr" }
      ]
    },
    {
      key: "electro",
      title: "Electrolytes",
      emoji: "⚡",
      rows: [
        { name: "Na", unit: "mmol/L" },
        { name: "K", unit: "mmol/L" },
        { name: "Cl", unit: "mmol/L" },
        { name: "HCO3- (TCO2)", unit: "mmol/L" },
        { name: "Ca", unit: "mg/dL" },
        { name: "Mg", unit: "mg/dL" },
        { name: "Phosphate", unit: "mg/dL" }
      ]
    },
    {
      key: "ua",
      title: "Urinalysis (UA)",
      emoji: "🧪",
      rows: [
        { name: "Protein", unit: "mg/dL / +" },
        { name: "Blood/RBC", unit: "cells/HPF" },
        { name: "WBC", unit: "cells/HPF" },
        { name: "Nitrite", unit: "pos/neg" },
        { name: "Leukocyte esterase", unit: "pos/neg" },
        { name: "Specific gravity", unit: "" },
        { name: "pH", unit: "" },
        { name: "Glucose", unit: "mg/dL / +" },
        { name: "Ketone", unit: "+" }
      ]
    },
    {
      key: "lung",
      title: "ปอด",
      emoji: "🫁",
      rows: [
        { name: "SpO2", unit: "%" },
        { name: "Lung function (sound/CXR)", unit: "" }
      ]
    },
    {
      key: "heart",
      title: "หัวใจ",
      emoji: "❤️",
      rows: [
        { name: "Troponin I", unit: "ng/mL" },
        { name: "Troponin T", unit: "ng/mL" },
        { name: "CK-MB", unit: "ng/mL" },
        { name: "EKG", unit: "" }
      ]
    },
    {
      key: "immuno",
      title: "Immunology / Allergy",
      emoji: "🧬",
      rows: [
        { name: "IgE", unit: "IU/mL" },
        { name: "Complement (C3/C4)", unit: "mg/dL" }
      ]
    }
  ];

  // -------------- เรนเดอร์หน้า 3 -----------------
  function renderPage3() {
    const root = document.getElementById("page3");
    if (!root) return;

    const store = window.drugAllergyData.page3;

    root.innerHTML = `
      <div class="p3-wrapper">
        <h2 class="p3-title">
          <span class="icon">🧪</span>
          หน้า 3 ผลตรวจทางห้องปฏิบัติการ
        </h2>

        <p class="p3-subtitle">ติ้กเลือกเฉพาะแลบที่มี แล้วกรอกค่า + รายละเอียดเพิ่มเติมได้เลย</p>

        <div class="p3-sections">
          ${LAB_SECTIONS.map(section => {
            const savedSec = store[section.key] || {};
            return `
              <section class="p3-section">
                <header class="p3-section-header">
                  <span class="p3-section-icon">${section.emoji}</span>
                  <h3>${section.title}</h3>
                </header>
                <div class="p3-rows">
                  ${section.rows
                    .map((row, idx) => {
                      const rowId = `${section.key}_${idx}`;
                      const savedRow = savedSec[row.name] || {};
                      const checked = savedRow.checked ? "checked" : "";
                      const value = savedRow.value || "";
                      const detail = savedRow.detail || "";
                      return `
                        <div class="p3-row">
                          <label class="p3-row-check">
                            <input type="checkbox"
                                   id="${rowId}"
                                   data-sec="${section.key}"
                                   data-name="${row.name}"
                                   ${checked}>
                            <span>${row.name}</span>
                          </label>
                          <div class="p3-row-inputs">
                            <input type="text"
                                   class="p3-val"
                                   data-sec="${section.key}"
                                   data-name="${row.name}"
                                   value="${value}"
                                   placeholder="ค่า/ผล">
                            <span class="p3-unit">${row.unit || ""}</span>
                            <input type="text"
                                   class="p3-detail"
                                   data-sec="${section.key}"
                                   data-name="${row.name}"
                                   value="${detail}"
                                   placeholder="รายละเอียดเพิ่มเติม"
                                   style="${checked ? "" : "display:none"}">
                          </div>
                        </div>
                      `;
                    })
                    .join("")}
                </div>
              </section>
            `;
          }).join("")}
        </div>

        <div class="p3-actions">
          <button class="btn-primary" id="p3_save">บันทึกข้อมูลและไปหน้า 4</button>
          <button class="btn-danger" id="p3_clear">🗑️ ล้างข้อมูลหน้านี้</button>
        </div>
      </div>
    `;

    // ---------- ผูก event ----------
    LAB_SECTIONS.forEach(section => {
      section.rows.forEach((row, idx) => {
        const cb = document.getElementById(`${section.key}_${idx}`);
        const valInput = root.querySelector(
          `.p3-val[data-sec="${section.key}"][data-name="${row.name}"]`
        );
        const detailInput = root.querySelector(
          `.p3-detail[data-sec="${section.key}"][data-name="${row.name}"]`
        );

        if (!cb || !valInput || !detailInput) return;

        cb.addEventListener("change", () => {
          if (cb.checked) {
            detailInput.style.display = "block";
          } else {
            detailInput.style.display = "none";
            // detailInput.value = ""; // จะไม่ลบทิ้งทันที เผื่อกดผิด
          }
          savePage3();
        });

        valInput.addEventListener("input", savePage3);
        detailInput.addEventListener("input", savePage3);
      });
    });

    // ปุ่มล้าง
    const clearBtn = document.getElementById("p3_clear");
    clearBtn.addEventListener("click", () => {
      window.drugAllergyData.page3 = {};
      renderPage3(); // วาดใหม่ให้สะอาด
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();
    });

    // ปุ่มบันทึก + ไปหน้า 4
    const saveBtn = document.getElementById("p3_save");
    saveBtn.addEventListener("click", () => {
      savePage3();
      alert("บันทึกหน้า 3 แล้ว");
      // สลับแท็บไปหน้า 4
      const btn4 = document.querySelector('.tabs button[data-target="page4"]');
      if (btn4) btn4.click();
    });
  }

  // -------------- ฟังก์ชันเซฟ -----------------
  function savePage3() {
    const root = document.getElementById("page3");
    if (!root) return;

    const store = (window.drugAllergyData.page3 = window.drugAllergyData.page3 || {});

    LAB_SECTIONS.forEach(section => {
      const secObj = {};
      section.rows.forEach(row => {
        const cb = root.querySelector(
          `input[type="checkbox"][data-sec="${section.key}"][data-name="${row.name}"]`
        );
        const valInput = root.querySelector(
          `.p3-val[data-sec="${section.key}"][data-name="${row.name}"]`
        );
        const detailInput = root.querySelector(
          `.p3-detail[data-sec="${section.key}"][data-name="${row.name}"]`
        );

        if (!cb || !valInput || !detailInput) return;

        const hasData = cb.checked || valInput.value.trim() !== "" || detailInput.value.trim() !== "";
        if (hasData) {
          secObj[row.name] = {
            checked: cb.checked,
            value: valInput.value.trim(),
            detail: detailInput.value.trim()
          };
        }
      });
      store[section.key] = secObj;
    });

    if (window.saveDrugAllergyData) window.saveDrugAllergyData();
  }

  // export
  window.renderPage3 = renderPage3;
})();

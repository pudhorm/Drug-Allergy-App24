// page3.js (REPLACE WHOLE FILE)
(function () {
  if (!window.drugAllergyData) window.drugAllergyData = {};
  if (!window.drugAllergyData.page3) window.drugAllergyData.page3 = {};

  // โครง Lab เป็นกลุ่มๆ
  const LAB_GROUPS = [
    {
      key: "cbc",
      title: "CBC",
      emoji: "🩸",
      items: [
        { key: "wbc", label: "White Blood Cell (WBC)", unit: "cells/cu.mm" },
        { key: "aec", label: "Absolute eosinophil count (AEC)", unit: "cells/cu.mm" },
        { key: "neut", label: "Neutrophil (%)", unit: "%" },
        { key: "lymph", label: "Lymphocyte (%)", unit: "%" },
        { key: "atypical", label: "Atypical lymphocytes (%)", unit: "%" },
        { key: "eos", label: "Eosinophil (%)", unit: "%" },
        { key: "hb", label: "Hemoglobin (Hb)", unit: "g/dL" },
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
        { key: "tbil", label: "Total Bilirubin", unit: "mg/dL" },
        { key: "dbil", label: "Direct Bilirubin", unit: "mg/dL" }
      ]
    },
    {
      key: "rft",
      title: "RFT (ไต)",
      emoji: "🫧",
      items: [
        { key: "bun", label: "BUN", unit: "mg/dL" },
        { key: "cre", label: "Creatinine", unit: "mg/dL" },
        { key: "egfr", label: "eGFR", unit: "mL/min/1.73m²" },
        { key: "uo", label: "UO (Urine output)", unit: "mL/kg/hr" }
      ]
    },
    {
      key: "electro",
      title: "Electrolytes",
      emoji: "⚡",
      items: [
        { key: "na", label: "Na", unit: "mmol/L" },
        { key: "k", label: "K", unit: "mmol/L" },
        { key: "cl", label: "Cl", unit: "mmol/L" },
        { key: "hco3", label: "HCO3- (TCO2)", unit: "mmol/L" },
        { key: "ca", label: "Ca", unit: "mg/dL" },
        { key: "mg", label: "Mg", unit: "mg/dL" },
        { key: "phos", label: "Phosphate", unit: "mg/dL" }
      ]
    },
    {
      key: "ua",
      title: "Urinalysis (UA)",
      emoji: "🧪",
      items: [
        { key: "protein", label: "Protein", unit: "mg/dL / +" },
        { key: "rbc", label: "Blood/RBC", unit: "cells/HPF" },
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
        { key: "spo2", label: "SpO2", unit: "%" },
        { key: "cxr", label: "Lung function (sound/CXR)", unit: "" }
      ]
    },
    {
      key: "heart",
      title: "หัวใจ",
      emoji: "❤️",
      items: [
        { key: "tropi", label: "Troponin I", unit: "ng/mL" },
        { key: "tropt", label: "Troponin T", unit: "ng/mL" },
        { key: "ckmb", label: "CK-MB", unit: "ng/mL" },
        { key: "ekg", label: "EKG", unit: "" }
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
                  const fieldId = `${group.key}_${item.key}`;
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
                            style="flex:0 0 110px;border:1px solid rgba(13,148,136,.35);border-radius:.5rem;padding:.3rem .4rem;font-size:.8rem;min-width:100px;${checked ? "" : "background:#fff;"}">
                          <input type="text" placeholder="รายละเอียดเพิ่มเติม"
                            data-type="detail" data-group="${group.key}" data-item="${item.key}" value="${detail}"
                            style="flex:1 1 auto;border:1px solid rgba(13,148,136,.15);border-radius:.5rem;padding:.3rem .4rem;font-size:.78rem;${checked ? "" : "background:#fff;"}">
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

    // bind inputs
    LAB_GROUPS.forEach(group => {
      group.items.forEach(item => {
        const cb = root.querySelector(`input[type="checkbox"][data-group="${group.key}"][data-item="${item.key}"]`);
        const valInput = root.querySelector(`input[data-type="value"][data-group="${group.key}"][data-item="${item.key}"]`);
        const detailInput = root.querySelector(`input[data-type="detail"][data-group="${group.key}"][data-item="${item.key}"]`);
        if (!cb || !valInput || !detailInput) return;

        cb.addEventListener("change", savePage3);
        valInput.addEventListener("input", savePage3);
        detailInput.addEventListener("input", savePage3);
      });
    });

    // ล้างข้อมูล + popup
    const clearBtn = root.querySelector("#p3-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        window.drugAllergyData.page3 = {};
        renderPage3();
        alert("ล้างข้อมูลหน้า 3 แล้ว");
      });
    }

    // บันทึกและไปหน้า 4 + popup + เรนเดอร์หน้า 4 ทันที
    const saveNextBtn = root.querySelector("#p3-save-next");
    if (saveNextBtn) {
      saveNextBtn.addEventListener("click", () => {
        savePage3();
        window.drugAllergyData.page3.__saved = true;
        if (window.saveDrugAllergyData) window.saveDrugAllergyData();
        alert("บันทึกหน้า 3 แล้ว");

        // เปลี่ยนแท็บไปหน้า 4
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

        // เรียก renderPage4() ทันที + เผื่อ DOM ยังไม่พร้อม ให้ retry สั้นๆ
        const callRender = () => { if (typeof window.renderPage4 === "function") window.renderPage4(); };
        callRender();
        let tries = 0;
        const iv = setInterval(() => {
          const el = document.getElementById("page4");
          if (el) {
            clearInterval(iv);
            callRender();
          } else if (++tries > 10) {
            clearInterval(iv);
          }
        }, 30);
        // เผื่อกรณี animation frame
        requestAnimationFrame(callRender);
      });
    }

    function savePage3() {
      const store = (window.drugAllergyData.page3 = window.drugAllergyData.page3 || {});
      LAB_GROUPS.forEach(group => {
        const groupObj = {};
        group.items.forEach(item => {
          const cb = root.querySelector(`input[type="checkbox"][data-group="${group.key}"][data-item="${item.key}"]`);
          const valInput = root.querySelector(`input[data-type="value"][data-group="${group.key}"][data-item="${item.key}"]`);
          const detailInput = root.querySelector(`input[data-type="detail"][data-group="${group.key}"][data-item="${item.key}"]`);
          if (!cb || !valInput || !detailInput) return;
          if (cb.checked || valInput.value.trim() !== "" || detailInput.value.trim() !== "") {
            groupObj[item.key] = {
              checked: cb.checked,
              value: valInput.value.trim(),
              detail: detailInput.value.trim()
            };
          }
        });
        store[group.key] = groupObj;
      });
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();
    }
  }

  // export
  window.renderPage3 = renderPage3;
})();

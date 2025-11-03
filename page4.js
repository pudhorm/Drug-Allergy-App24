// page4.js
(function () {
  // เตรียมที่เก็บรวม
  if (!window.drugAllergyData) window.drugAllergyData = {};
  if (!window.drugAllergyData.page4) {
    window.drugAllergyData.page4 = {
      drugs: [
        { name: "", answers: {} } // { qIndex: "yes" | "no" | "dk" }
      ]
    };
  }

  // --------------------- ค่าคะแนนของ Naranjo ---------------------
  const NARANJO_QUESTIONS = [
    {
      text: "1. มีรายงานการแพ้ยานี้มาก่อนหรือไม่?",
      choices: [
        { key: "yes", label: "ใช่ (+1)", score: 1 },
        { key: "no",  label: "ไม่ใช่ (0)", score: 0 },
        { key: "dk",  label: "ไม่ทราบ (0)", score: 0 }
      ]
    },
    {
      text: "2. อาการเกิดขึ้นหลังให้ยาหรือไม่?",
      choices: [
        { key: "yes", label: "ใช่ (+2)", score: 2 },
        { key: "no",  label: "ไม่ใช่ (-1)", score: -1 },
        { key: "dk",  label: "ไม่ทราบ (0)", score: 0 }
      ]
    },
    {
      text: "3. อาการดีขึ้นเมื่อหยุดยาหรือให้ยาต้านแพ้หรือไม่?",
      choices: [
        { key: "yes", label: "ใช่ (+1)", score: 1 },
        { key: "no",  label: "ไม่ใช่ (0)", score: 0 },
        { key: "dk",  label: "ไม่ทราบ (0)", score: 0 }
      ]
    },
    {
      text: "4. อาการเกิดซ้ำเมื่อให้ยาอีกครั้งหรือไม่?",
      choices: [
        { key: "yes", label: "ใช่ (+2)", score: 2 },
        { key: "no",  label: "ไม่ใช่ (-1)", score: -1 },
        { key: "dk",  label: "ไม่ทราบ (0)", score: 0 }
      ]
    },
    {
      text: "5. มีสาเหตุอื่นที่อาจทำให้เกิดอาการนี้หรือไม่?",
      choices: [
        { key: "yes", label: "ใช่ (-1)", score: -1 },
        { key: "no",  label: "ไม่ใช่ (+2)", score: 2 },
        { key: "dk",  label: "ไม่ทราบ (0)", score: 0 }
      ]
    },
    {
      text: "6. อาการเกิดขึ้นเมื่อให้ยาหลอกหรือไม่?",
      choices: [
        { key: "yes", label: "ใช่ (-1)", score: -1 },
        { key: "no",  label: "ไม่ใช่ (+1)", score: 1 },
        { key: "dk",  label: "ไม่ทราบ (0)", score: 0 }
      ]
    },
    {
      text: "7. พบยาในเลือดหรือของเหลวในร่างกายหรือไม่?",
      choices: [
        { key: "yes", label: "ใช่ (+1)", score: 1 },
        { key: "no",  label: "ไม่ใช่ (0)", score: 0 },
        { key: "dk",  label: "ไม่ทราบ (0)", score: 0 }
      ]
    },
    {
      text: "8. อาการรุนแรงขึ้นเมื่อเพิ่มขนาดยาหรือไม่?",
      choices: [
        { key: "yes", label: "ใช่ (+1)", score: 1 },
        { key: "no",  label: "ไม่ใช่ (0)", score: 0 },
        { key: "dk",  label: "ไม่ทราบ (0)", score: 0 }
      ]
    },
    {
      text: "9. ผู้ป่วยเคยมีอาการคล้ายกันกับยาตัวเดียวกันหรือยาคล้ายกันหรือไม่?",
      choices: [
        { key: "yes", label: "ใช่ (+1)", score: 1 },
        { key: "no",  label: "ไม่ใช่ (0)", score: 0 },
        { key: "dk",  label: "ไม่ทราบ (0)", score: 0 }
      ]
    },
    {
      text: "10. มีการยืนยันด้วยวิธีการทางวัตถุประสงค์หรือไม่?",
      choices: [
        { key: "yes", label: "ใช่ (+1)", score: 1 },
        { key: "no",  label: "ไม่ใช่ (0)", score: 0 },
        { key: "dk",  label: "ไม่ทราบ (0)", score: 0 }
      ]
    }
  ];

  function calcNaranjoScore(drug) {
    let total = 0;
    const ans = drug.answers || {};
    NARANJO_QUESTIONS.forEach((q, idx) => {
      const picked = ans[idx];
      if (!picked) return;
      const found = q.choices.find(c => c.key === picked);
      if (found) total += found.score;
    });
    return total;
  }

  function getInterpretation(score) {
    if (score >= 9) return "แน่นอน (Definite)";
    if (score >= 5) return "น่าจะเป็น (Probable)";
    if (score >= 1) return "อาจเป็นไปได้ (Possible)";
    return "ไม่น่าจะเป็น (Doubtful)";
  }

  // ----- สไตล์ปุ่ม (สีอ่อนเป็นค่าเริ่มต้น / กดแล้วเข้มขึ้น) -----
  function buttonStyle(choiceKey, active) {
    // สีอ่อน (default)
    let bg = "rgba(229,231,235,.6)";   // เทา fallback
    let bd = "rgba(209,213,219,1)";
    let fg = "#374151";

    if (choiceKey === "yes") {
      bg = "rgba(34,197,94,.14)";  // เขียวอ่อน
      bd = "rgba(22,163,74,.7)";
      fg = "#166534";
      if (active) {
        bg = "rgba(34,197,94,.32)";
        bd = "rgba(22,163,74,1)";
        fg = "#14532d";
      }
    } else if (choiceKey === "no") {
      bg = "rgba(248,113,113,.16)"; // แดงอ่อน
      bd = "rgba(248,113,113,.9)";
      fg = "#b91c1c";
      if (active) {
        bg = "rgba(248,113,113,.34)";
        bd = "rgba(220,38,38,1)";
        fg = "#7f1d1d";
      }
    } else if (choiceKey === "dk") {
      bg = "rgba(252,211,77,.18)";  // เหลืองอ่อน
      bd = "rgba(234,179,8,1)";
      fg = "#92400e";
      if (active) {
        bg = "rgba(252,211,77,.36)";
        bd = "rgba(202,138,4,1)";
        fg = "#7c2d12";
      }
    }
    // กำหนดให้ปุ่ม “กินเต็มแถว” (flex:1)
    return `flex:1; border:1px solid ${bd}; background:${bg}; color:${fg}; 
            padding:.55rem .75rem; border-radius:.75rem; font-weight:600;
            cursor:pointer; text-align:center; font-size:.9rem; 
            min-width:0; transition:transform .06s ease-out;`;
  }

  function renderPage4() {
    const root = document.getElementById("page4");
    if (!root) return;

    const store = window.drugAllergyData.page4;

    root.innerHTML = `
      <div class="p4-bg" style="background:linear-gradient(135deg,#ffe0ec 0%,#ffddc3 35%,#ffffff 100%);border:1px solid rgba(255,135,170,.25);border-radius:1.4rem;padding:1.4rem 1.4rem 5.5rem;box-shadow:0 14px 28px rgba(255,110,150,.12);position:relative;overflow:hidden;">
        <div style="position:absolute;inset:0;pointer-events:none;">
          <div style="position:absolute;width:120px;height:120px;border-radius:999px;background:radial-gradient(circle,rgba(255,255,255,.9),rgba(255,255,255,0));top:-40px;right:-30px;filter:drop-shadow(0 10px 18px rgba(255,135,170,.35));"></div>
          <div style="position:absolute;width:95px;height:95px;border-radius:999px;background:radial-gradient(circle,rgba(255,255,255,.8),rgba(255,255,255,0));bottom:-30px;left:15%;"></div>
          <div style="position:absolute;width:70px;height:70px;border-radius:999px;background:radial-gradient(circle,rgba(255,255,255,.7),rgba(255,255,255,0));top:40%;left:-20px;"></div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;position:relative;z-index:5;margin-bottom:1rem;">
          <h2 style="font-size:1.45rem;font-weight:700;color:#3f3d56;display:flex;align-items:center;gap:.5rem;margin:0;">
            <span style="font-size:1.6rem;">📊</span>
            <span>หน้า 4 Naranjo Algorithm</span>
          </h2>
          <button id="p4_add_drug" style="background:linear-gradient(120deg,#22c55e 0%,#16a34a 100%);border:none;color:#fff;padding:.55rem 1.3rem;border-radius:1.2rem;font-weight:600;display:flex;align-items:center;gap:.45rem;cursor:pointer;box-shadow:0 10px 18px rgba(34,197,94,.35);">
            <span style="font-size:1.1rem;">＋</span>
            <span>เพิ่มยาตัวใหม่</span>
          </button>
        </div>

        <p style="margin:0 0 1rem;color:#6b7280;position:relative;z-index:5;">เลือกคำตอบในแต่ละข้อ — ปุ่มจะกินเต็มแถวและแสดงสีตั้งแต่เริ่ม (กดแล้วสีเข้มขึ้น)</p>

        <div id="p4_drug_container" style="display:flex;flex-direction:column;gap:1.1rem;position:relative;z-index:5;"></div>

        <div style="margin-top:1.5rem;display:flex;flex-direction:column;gap:.75rem;position:relative;z-index:5;">
          <button id="p4_save_next" style="background:linear-gradient(120deg,#6366f1 0%,#a855f7 70%);color:#fff;border:none;padding:.65rem 1rem;border-radius:1.1rem;font-weight:600;cursor:pointer;box-shadow:0 10px 20px rgba(99,102,241,.25);">บันทึกข้อมูลและไปหน้า 5</button>
          <button id="p4_clear" style="background:#ef4444;color:#fff;border:none;padding:.6rem 1rem;border-radius:1.1rem;font-weight:600;cursor:pointer;box-shadow:0 8px 16px rgba(239,68,68,.25);">🗑 ล้างข้อมูลหน้านี้</button>
        </div>
      </div>
    `;

    const container = root.querySelector("#p4_drug_container");

    function renderDrugCards() {
      container.innerHTML = "";
      store.drugs.forEach((drug, idx) => {
        const score = calcNaranjoScore(drug);
        const txt = getInterpretation(score);

        const card = document.createElement("div");
        card.className = "p4-card";
        card.style.cssText =
          "background:#fff; border:1px solid rgba(255,161,175,.3); border-radius:1.05rem; padding:1rem 1rem 1.1rem; box-shadow:0 10px 20px rgba(255,135,170,.06);";

        // เนื้อการ์ด
        card.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.7rem;">
            <h3 style="margin:0;font-size:1.05rem;font-weight:700;color:#312e81;">ยาตัวที่ ${idx + 1}</h3>
            ${idx > 0 ? `<button data-remove="${idx}" style="background:rgba(248,113,113,.12);color:#b91c1c;border:none;border-radius:.8rem;padding:.25rem .65rem;font-size:.7rem;cursor:pointer;">ลบตัวนี้</button>` : ""}
          </div>
          <label style="display:block;margin-bottom:1rem;">
            <span style="display:block;font-size:.8rem;margin-bottom:.35rem;color:#6b7280;">ชื่อยา</span>
            <input type="text" data-drug-name="${idx}" value="${drug.name || ""}" placeholder="ระบุชื่อยา เช่น Amoxicillin" style="width:100%;border:1px solid rgba(248,113,113,.28);border-radius:.7rem;padding:.55rem .6rem;font-size:.9rem;outline:none;">
          </label>

          <div style="display:flex;flex-direction:column;gap:.8rem;">
            ${NARANJO_QUESTIONS.map((q, qIdx) => {
              const picked = drug.answers && drug.answers[qIdx];
              // แถวละ 3 ปุ่ม กินเต็มความกว้าง
              const row =
                `<div style="display:flex;gap:.55rem;align-items:stretch;width:100%;">
                  ${q.choices.map(ch => {
                    const active = picked === ch.key;
                    return `
                      <button
                        class="p4-choice-btn"
                        data-drug="${idx}"
                        data-q="${qIdx}"
                        data-choice="${ch.key}"
                        style="${buttonStyle(ch.key, active)}">
                        ${ch.label}
                      </button>
                    `;
                  }).join("")}
                 </div>`;

              return `
                <div style="background:rgba(255,248,251,.7);border:1px solid rgba(255,198,215,.2);border-radius:.8rem;padding:.65rem .6rem;">
                  <div style="font-weight:700;color:#403b5f;margin-bottom:.5rem;font-size:.95rem;">${q.text}</div>
                  ${row}
                </div>
              `;
            }).join("")}
          </div>

          <div style="margin-top:1rem;background:rgba(255,237,241,.75);border:1px solid rgba(255,175,197,.35);border-radius:.7rem;padding:.6rem .7rem;">
            <div style="font-size:.78rem;color:#6b7280;">ผลการประเมิน</div>
            <div style="font-size:1.7rem;font-weight:700;color:#312e81;line-height:1.1;">${score} คะแนน</div>
            <div style="font-size:.9rem;color:#374151;">${txt}</div>
          </div>
        `;
        container.appendChild(card);
      });

      hookEvents();
    }

    function hookEvents() {
      // ชื่อยา
      container.querySelectorAll("[data-drug-name]").forEach(inp => {
        inp.addEventListener("input", () => {
          const idx = Number(inp.dataset.drugName);
          store.drugs[idx].name = inp.value;
          save();
        });
      });

      // ปุ่มลบ
      container.querySelectorAll("[data-remove]").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = Number(btn.dataset.remove);
          store.drugs.splice(idx, 1);
          if (!store.drugs.length) store.drugs.push({ name: "", answers: {} });
          renderDrugCards();
          save();
        });
      });

      // ปุ่มเลือกคำตอบ
      container.querySelectorAll(".p4-choice-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const dIdx = Number(btn.dataset.drug);
          const qIdx = Number(btn.dataset.q);
          const choice = btn.dataset.choice;

          const drug = store.drugs[dIdx];
          if (!drug.answers) drug.answers = {};

          // ถ้ากดซ้ำ -> ยกเลิก (ลบการเลือก)
          if (drug.answers[qIdx] === choice) {
            delete drug.answers[qIdx];
          } else {
            drug.answers[qIdx] = choice;
          }

          save();
          renderDrugCards(); // re-render เพื่ออัปเดตสี/ความเข้ม
        });
      });
    }

    // ปุ่มเพิ่มยาตัวใหม่
    root.querySelector("#p4_add_drug").addEventListener("click", () => {
      store.drugs.push({ name: "", answers: {} });
      renderDrugCards();
      save();
    });

    // ปุ่มบันทึกและไปหน้า 5
    root.querySelector("#p4_save_next").addEventListener("click", () => {
      save();
      const btn = document.querySelector('.tabs button[data-target="page5"]');
      if (btn) btn.click();
    });

    // ปุ่มล้าง
    root.querySelector("#p4_clear").addEventListener("click", () => {
      store.drugs = [{ name: "", answers: {} }];
      renderDrugCards();
      save();
    });

    function save() {
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();
    }

    // render ครั้งแรก
    renderDrugCards();
  }

  // export
  window.renderPage4 = renderPage4;
})();

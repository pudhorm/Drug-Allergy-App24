// page4.js (replace whole file)
(function () {
  if (!window.drugAllergyData) window.drugAllergyData = {};
  if (!window.drugAllergyData.page4) {
    window.drugAllergyData.page4 = {
      drugs: [{ name: "", answers: {} }],
    };
  }

  // === เพิ่ม: ตัวช่วยยิงอีเวนต์อัปเดตให้หน้า 6 รู้ตัว ===
  function emitUpdate(source) {
    try {
      document.dispatchEvent(
        new CustomEvent("da:update", {
          detail: { source: source || "page4", ts: Date.now() },
        })
      );
    } catch (e) {
      // เงียบไว้ ไม่ให้พังหน้า
    }
  }

  const NARANJO_QUESTIONS = [
    {
      text: "1. เคยมีสรุปหรือรายงานการเกิดปฏิกิริยานี้มาแล้วหรือไม่?",
      choices: [
        { key: "yes", label: "ใช่ (+1)", score: 1 },
        { key: "no", label: "ไม่ใช่ (0)", score: 0 },
        { key: "dk", label: "ไม่ทราบ (0)", score: 0 },
      ],
    },
    {
      text: "2. อาการไม่พึงประสงค์นี้เกิดขึ้นภายหลังได้รับยาที่คิดว่าเป็นสาเหตุหรือไม่?",
      choices: [
        { key: "yes", label: "ใช่ (+2)", score: 2 },
        { key: "no", label: "ไม่ใช่ (-1)", score: -1 },
        { key: "dk", label: "ไม่ทราบ (0)", score: 0 },
      ],
    },
    {
      text: "3. อาการไม่พึงประสงค์ดีขึ้นเมื่อหยุดยาหรือให้ยาต้านที่จำเพาะเจาะจงหรือไม่?",
      choices: [
        { key: "yes", label: "ใช่ (+1)", score: 1 },
        { key: "no", label: "ไม่ใช่ (0)", score: 0 },
        { key: "dk", label: "ไม่ทราบ (0)", score: 0 },
      ],
    },
    {
      text: "4. อาการไม่พึงประสงค์ดังกล่าวเกิดขึ้นอีกเมื่อเริ่มให้ยาใหม่หรือไม่?",
      choices: [
        { key: "yes", label: "ใช่ (+2)", score: 2 },
        { key: "no", label: "ไม่ใช่ (-1)", score: -1 },
        { key: "dk", label: "ไม่ทราบ (0)", score: 0 },
      ],
    },
    {
      text: "5. มีสาเหตุอื่นที่อาจทำให้เกิดปฏิกิริยานี้(นอกเหนือจากยาของผู้ป่วย)ได้หรือไม่?",
      choices: [
        { key: "yes", label: "ใช่ (-1)", score: -1 },
        { key: "no", label: "ไม่ใช่ (+2)", score: 2 },
        { key: "dk", label: "ไม่ทราบ (0)", score: 0 },
      ],
    },
    {
      text: "6.ปฏิกิริยาดังกล่าวเกิดขึ้นอีกเมื่อให้ยาหลอกหรือไม่?",
      choices: [
        { key: "yes", label: "ใช่ (-1)", score: -1 },
        { key: "no", label: "ไม่ใช่ (+1)", score: 1 },
        { key: "dk", label: "ไม่ทราบ (0)", score: 0 },
      ],
    },
    {
      text: "7. สามารถตรวจวัดปริมาณยาได้ในเลือด(หรือของเหลวอื่น)ในปริมาณความเข้มข้นที่เป็นพิษหรือไม่?",
      choices: [
        { key: "yes", label: "ใช่ (+1)", score: 1 },
        { key: "no", label: "ไม่ใช่ (0)", score: 0 },
        { key: "dk", label: "ไม่ทราบ (0)", score: 0 },
      ],
    },
    {
      text: "8. ปฏิกิริยารุนแรงขึ้นเมื่อเพิ่มขนาดยาหรือลดความรุนแรงลงเมื่อลดขนาดยาหรือไม่?",
      choices: [
        { key: "yes", label: "ใช่ (+1)", score: 1 },
        { key: "no", label: "ไม่ใช่ (0)", score: 0 },
        { key: "dk", label: "ไม่ทราบ (0)", score: 0 },
      ],
    },
    {
      text: "9. ผู้ป่วยเคยมีปฏิกิริยาที่เหมือนหรือคล้ายกันมาก่อนในการได้รับยาครั้งก่อนๆหรือไม่?",
      choices: [
        { key: "yes", label: "ใช่ (+1)", score: 1 },
        { key: "no", label: "ไม่ใช่ (0)", score: 0 },
        { key: "dk", label: "ไม่ทราบ (0)", score: 0 },
      ],
    },
    {
      text: "10. อาการไม่พึงประสงค์นี้ได้รับการยืนยันโดยหลักฐานที่เป็นรูปธรรมหรือไม่?",
      choices: [
        { key: "yes", label: "ใช่ (+1)", score: 1 },
        { key: "no", label: "ไม่ใช่ (0)", score: 0 },
        { key: "dk", label: "ไม่ทราบ (0)", score: 0 },
      ],
    },
  ];

  function calcNaranjoScore(drug) {
    let total = 0;
    const ans = drug.answers || {};
    NARANJO_QUESTIONS.forEach((q, i) => {
      const picked = ans[i];
      if (!picked) return;
      const found = q.choices.find((c) => c.key === picked);
      if (found) total += found.score;
    });
    return total;
  }

  function interp(score) {
    if (score >= 9) return "แน่นอน (Definite)";
    if (score >= 5) return "น่าจะเป็น (Probable)";
    if (score >= 1) return "อาจเป็นไปได้ (Possible)";
    return "ไม่น่าจะเป็น (Doubtful)";
  }

  function renderPage4() {
    const root = document.getElementById("page4");
    if (!root) return;

    const store = window.drugAllergyData.page4;

    root.innerHTML = `
      <div class="p4-bg" style="background:linear-gradient(135deg,#ffe0ec 0%,#ffddc3 40%,#ffffff 100%);border:1px solid rgba(255,135,170,.25);border-radius:1.4rem;padding:1.4rem 1.4rem 5.5rem;box-shadow:0 14px 28px rgba(255,110,150,.12);position:relative;overflow:hidden;">
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
          <button id="p4_add_drug"
            style="background:#22c55e;color:#fff;border:none;padding:.6rem 1.2rem;border-radius:999px;font-weight:800;letter-spacing:.2px;display:flex;align-items:center;gap:.45rem;cursor:pointer;box-shadow:0 10px 18px rgba(34,197,94,.35);">
            <span style="font-size:1.2rem;">+</span><span>เพิ่มยา</span>
          </button>
        </div>

        <p style="margin:0 0 1rem;color:#5b6472;position:relative;z-index:5;">เลือกคำตอบในแต่ละข้อแล้วระบบจะคำนวณคะแนนอัตโนมัติ</p>

        <div id="p4_drug_container" style="display:flex;flex-direction:column;gap:1.1rem;position:relative;z-index:5;"></div>

        <div style="margin-top:1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;position:relative;z-index:5;">
          <button id="p4_clear"
            style="background:#ef4444;color:#fff;border:none;padding:.65rem 1rem;border-radius:1rem;font-weight:700;cursor:pointer;box-shadow:0 10px 20px rgba(239,68,68,.25);">
            🗑️ ล้างข้อมูลหน้านี้
          </button>
          <button id="p4_save_next"
            style="background:linear-gradient(120deg,#6366f1 0%,#7c3aed 60%,#9333ea 100%);color:#fff;border:none;padding:.75rem 1.15rem;border-radius:1rem;font-weight:800;cursor:pointer;box-shadow:0 12px 26px rgba(99,102,241,.28);">
            บันทึกข้อมูลและไปหน้า 5
          </button>
        </div>
      </div>
    `;

    const container = root.querySelector("#p4_drug_container");

    function renderDrugCards() {
      container.innerHTML = "";
      store.drugs.forEach((drug, idx) => {
        const score = calcNaranjoScore(drug);
        const txt = interp(score);

        const card = document.createElement("div");
        card.style.cssText =
          "background:#fff;border:1px solid rgba(255,161,175,.28);border-radius:1.05rem;padding:1rem 1rem 1.1rem;box-shadow:0 10px 20px rgba(255,135,170,.06);";

        card.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.7rem;">
            <h3 style="margin:0;font-size:1.05rem;font-weight:800;color:#312e81;">ยาตัวที่ ${idx + 1}</h3>
            ${idx > 0 ? `<button data-remove="${idx}" style="background:rgba(248,113,113,.12);color:#b91c1c;border:none;border-radius:.8rem;padding:.25rem .65rem;font-size:.75rem;font-weight:700;cursor:pointer;">ลบ</button>` : ""}
          </div>
          <label style="display:block;margin-bottom:1rem;">
            <span style="display:block;font-size:.8rem;margin-bottom:.35rem;color:#6b7280;">ชื่อยา</span>
            <input type="text" data-drug-name="${idx}" value="${drug.name || ""}" placeholder="ระบุชื่อยา เช่น Amoxicillin"
              style="width:100%;border:1px solid rgba(248,113,113,.28);border-radius:.7rem;padding:.55rem .6rem;font-size:.95rem;outline:none;">
          </label>

          ${NARANJO_QUESTIONS.map((q, qIdx) => {
            const picked = drug.answers && drug.answers[qIdx];
            return `
              <div style="background:rgba(255,248,251,.7);border:1px solid rgba(255,198,215,.22);border-radius:.9rem;padding:.6rem .65rem;margin:.6rem 0;">
                <div style="font-weight:700;color:#403b5f;margin-bottom:.55rem;font-size:.92rem;">${q.text}</div>
                <div class="p4-choice-row" style="display:flex;justify-content:space-between;gap:.6rem;flex-wrap:wrap;">
                  ${q.choices.map(ch => {
                    const isActive = picked === ch.key;

                    let bg = "#ffffff";
                    let br = "rgba(209,213,219,1)";
                    let col = "#374151";

                    if (isActive && ch.key === "yes") {
                      bg = "rgba(22,163,74,.35)";
                      br = "rgba(21,128,61,1)";
                      col = "#14532d";
                    } else if (isActive && ch.key === "no") {
                      bg = "rgba(239,68,68,.35)";
                      br = "rgba(185,28,28,1)";
                      col = "#7f1d1d";
                    } else if (isActive && ch.key === "dk") {
                      bg = "rgba(234,179,8,.35)";
                      br = "rgba(161,98,7,1)";
                      col = "#713f12";
                    } else {
                      if (ch.key === "yes") { bg = "rgba(34,197,94,.14)"; br = "rgba(34,197,94,.5)"; col = "#166534"; }
                      if (ch.key === "no")  { bg = "rgba(248,113,113,.14)"; br = "rgba(248,113,113,.6)"; col = "#b91c1c"; }
                      if (ch.key === "dk")  { bg = "rgba(234,179,8,.16)";  br = "rgba(234,179,8,.65)";  col = "#92400e"; }
                    }

                    const width = "min(28%, 320px)";

                    return `
                      <button
                        class="p4-choice-btn"
                        data-drug="${idx}"
                        data-q="${qIdx}"
                        data-choice="${ch.key}"
                        style="
                          width:${width};
                          min-width:180px;
                          border:1px solid ${br};
                          background:${bg};
                          color:${col};
                          padding:.58rem .6rem;
                          border-radius:.85rem;
                          font-weight:700;
                          cursor:pointer;
                          text-align:center;
                          box-shadow:${isActive ? "inset 0 0 0 2px rgba(0,0,0,.05), 0 6px 14px rgba(2,6,23,.12)" : "0 4px 10px rgba(2,6,23,.06)"};
                          transition:transform .06s ease, filter .06s ease;">
                        ${ch.label}
                      </button>
                    `;
                  }).join("")}
                </div>
              </div>
            `;
          }).join("")}

          <div style="margin-top:1rem;background:rgba(255,237,241,.75);border:1px solid rgba(255,175,197,.35);border-radius:.7rem;padding:.65rem .75rem;">
            <div style="font-size:.78rem;color:#6b7280;">ผลการประเมิน</div>
            <div style="font-size:1.7rem;font-weight:800;color:#312e81;line-height:1.1;">${score} คะแนน</div>
            <div style="font-size:.95rem;color:#374151;">${txt}</div>
          </div>
        `;
        container.appendChild(card);
      });

      hookEvents();
    }

    function hookEvents() {
      container.querySelectorAll("[data-drug-name]").forEach((inp) => {
        inp.addEventListener("input", () => {
          const idx = Number(inp.dataset.drugName);
          store.drugs[idx].name = inp.value;
          save();            // บันทึก
          emitUpdate("page4"); // แจ้งหน้า 6 ให้รู้ตัว
        });
      });

      container.querySelectorAll("[data-remove]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = Number(btn.dataset.remove);
          store.drugs.splice(idx, 1);
          if (!store.drugs.length) store.drugs.push({ name: "", answers: {} });
          renderDrugCards();
          save();
          emitUpdate("page4");
        });
      });

      container.querySelectorAll(".p4-choice-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const dIdx = Number(btn.dataset.drug);
          const qIdx = Number(btn.dataset.q);
          const choice = btn.dataset.choice;
          const drug = store.drugs[dIdx];
          if (!drug.answers) drug.answers = {};
          if (drug.answers[qIdx] === choice) {
            delete drug.answers[qIdx];
          } else {
            drug.answers[qIdx] = choice;
          }
          save();
          emitUpdate("page4");
          renderDrugCards();
        });
      });
    }

    // ปุ่มเพิ่มยา
    root.querySelector("#p4_add_drug").addEventListener("click", () => {
      store.drugs.push({ name: "", answers: {} });
      renderDrugCards();
      save();
      emitUpdate("page4");
    });

    // ปุ่มบันทึกและไปหน้า 5 — แสดง popup
    root.querySelector("#p4_save_next").addEventListener("click", () => {
      save();
      emitUpdate("page4"); // ให้หน้า 6 (และส่วนอื่น) รีคอมพิวต์ได้ทันที
      alert("บันทึกหน้า 4 แล้ว");
      const btn = document.querySelector('.tabs button[data-target="page5"]');
      if (btn) btn.click();
    });

    // ปุ่มล้าง — แสดง popup
    root.querySelector("#p4_clear").addEventListener("click", () => {
      store.drugs = [{ name: "", answers: {} }];
      renderDrugCards();
      save();
      emitUpdate("page4");
      alert("ล้างข้อมูลหน้า 4 แล้ว");
    });

    function save() {
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();
      // ไม่ alert ที่นี่ เพื่อไม่รบกวน UX; หน้าที่ต้องแจ้งจะทำเอง
    }

    renderDrugCards();
  }

  window.renderPage4 = renderPage4;
})();

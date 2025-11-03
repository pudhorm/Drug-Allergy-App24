// page4.js
(function () {
  // เตรียมที่เก็บ
  if (!window.drugAllergyData) window.drugAllergyData = {};
  if (!window.drugAllergyData.page4) {
    window.drugAllergyData.page4 = {
      drugs: [{ name: "", answers: {} }]
    };
  }

  // --------------------- Naranjo ---------------------
  const Q = [
    { t: "1. มีรายงานการแพ้ยานี้มาก่อนหรือไม่?", y: 1, n: 0, d: 0 },
    { t: "2. อาการเกิดขึ้นหลังให้ยาหรือไม่?", y: 2, n: -1, d: 0 },
    { t: "3. อาการดีขึ้นเมื่อหยุดยาหรือให้ยาต้านแพ้หรือไม่?", y: 1, n: 0, d: 0 },
    { t: "4. อาการเกิดซ้ำเมื่อให้ยาอีกครั้งหรือไม่?", y: 2, n: -1, d: 0 },
    { t: "5. มีสาเหตุอื่นที่อาจทำให้เกิดอาการนี้หรือไม่?", y: -1, n: 2, d: 0 },
    { t: "6. อาการเกิดขึ้นเมื่อให้ยาหลอกหรือไม่?", y: -1, n: 1, d: 0 },
    { t: "7. พบยาในเลือดหรือของเหลวในร่างกายหรือไม่?", y: 1, n: 0, d: 0 },
    { t: "8. อาการรุนแรงขึ้นเมื่อเพิ่มขนาดยาหรือไม่?", y: 1, n: 0, d: 0 },
    { t: "9. ผู้ป่วยเคยมีอาการคล้ายกันกับยาตัวเดียวกันหรือยาคล้ายกันหรือไม่?", y: 1, n: 0, d: 0 },
    { t: "10. มีการยืนยันด้วยวิธีการทางวัตถุประสงค์หรือไม่?", y: 1, n: 0, d: 0 }
  ];

  function calc(drug) {
    let s = 0;
    const a = drug.answers || {};
    Q.forEach((q, i) => {
      if (a[i] === "yes") s += q.y;
      else if (a[i] === "no") s += q.n;
      else if (a[i] === "dk") s += q.d;
    });
    return s;
  }
  function interp(score) {
    if (score >= 9) return "แน่นอน (Definite)";
    if (score >= 5) return "น่าจะเป็น (Probable)";
    if (score >= 1) return "อาจเป็นไปได้ (Possible)";
    return "ไม่น่าจะเป็น (Doubtful)";
  }

  // ---------- สไตล์ปุ่ม (อักษรเดิม, ปุ่มสั้นลง, active เข้มขึ้น) ----------
  // ปุ่มแต่ละอันจะกว้างประมาณ 28% ของแถว เพื่อให้ “สั้นลง” และยังเรียง 3 ปุ่มในแถวเดียว
  function btnStyle(kind, active) {
    // ขนาดตัวอักษร “เท่าเดิม”
    const base =
      "flex:0 0 28%; max-width:32%; min-width:220px; " + // สั้นลง ไม่เต็มแถว
      "border-radius:.8rem; padding:.6rem .9rem; " +
      "font-weight:700; font-size:.95rem; text-align:center; " +
      "cursor:pointer; transition:transform .06s ease-out, filter .06s ease-out;";

    if (kind === "yes") {
      const bg = active ? "rgba(34,197,94,.55)" : "rgba(34,197,94,.22)";
      const bd = active ? "rgba(22,163,74,1)" : "rgba(22,163,74,.75)";
      const fg = active ? "#14532d" : "#166534";
      return `${base} background:${bg}; border:2px solid ${bd}; color:${fg};`;
    }
    if (kind === "no") {
      const bg = active ? "rgba(248,113,113,.55)" : "rgba(248,113,113,.22)";
      const bd = active ? "rgba(220,38,38,1)" : "rgba(248,113,113,.85)";
      const fg = active ? "#7f1d1d" : "#b91c1c";
      return `${base} background:${bg}; border:2px solid ${bd}; color:${fg};`;
    }
    // dk
    const bg = active ? "rgba(252,211,77,.55)" : "rgba(252,211,77,.22)";
    const bd = active ? "rgba(202,138,4,1)" : "rgba(234,179,8,.95)";
    const fg = active ? "#7c2d12" : "#92400e";
    return `${base} background:${bg}; border:2px solid ${bd}; color:${fg};`;
  }

  function renderPage4() {
    const root = document.getElementById("page4");
    if (!root) return;

    const store = window.drugAllergyData.page4;

    root.innerHTML = `
      <div style="background:linear-gradient(135deg,#ffe0ec 0%,#ffddc3 35%,#ffffff 100%);border:1px solid rgba(255,135,170,.25);border-radius:1.4rem;padding:1.2rem 1.2rem 5rem;box-shadow:0 14px 28px rgba(255,110,150,.12);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:.8rem;margin-bottom:.9rem;">
          <h2 style="font-size:1.35rem;font-weight:700;color:#3f3d56;display:flex;align-items:center;gap:.45rem;margin:0;">
            <span style="font-size:1.4rem;">📊</span><span>หน้า 4 Naranjo Algorithm</span>
          </h2>
          <button id="p4_add_drug" style="background:linear-gradient(120deg,#22c55e 0%,#16a34a 100%);border:none;color:#fff;padding:.5rem 1.05rem;border-radius:1rem;font-weight:600;display:flex;align-items:center;gap:.4rem;cursor:pointer;box-shadow:0 8px 16px rgba(34,197,94,.28);">
            <span style="font-size:1rem;">＋</span><span>เพิ่มยาตัวใหม่</span>
          </button>
        </div>

        <div id="p4_drug_container" style="display:flex;flex-direction:column;gap:.95rem;"></div>

        <div style="margin-top:1.2rem;display:flex;flex-direction:column;gap:.6rem;">
          <button id="p4_save_next" style="background:linear-gradient(120deg,#6366f1 0%,#a855f7 70%);color:#fff;border:none;padding:.55rem .9rem;border-radius:1rem;font-weight:600;cursor:pointer;box-shadow:0 8px 18px rgba(99,102,241,.25);">บันทึกข้อมูลและไปหน้า 5</button>
          <button id="p4_clear" style="background:#ef4444;color:#fff;border:none;padding:.5rem .9rem;border-radius:1rem;font-weight:600;cursor:pointer;box-shadow:0 8px 16px rgba(239,68,68,.25);">🗑 ล้างข้อมูลหน้านี้</button>
        </div>
      </div>
    `;

    const container = root.querySelector("#p4_drug_container");

    function renderCards() {
      container.innerHTML = "";
      store.drugs.forEach((drug, idx) => {
        const score = calc(drug);
        const txt = interp(score);

        const card = document.createElement("div");
        card.style.cssText =
          "background:#fff;border:1px solid rgba(255,161,175,.3);border-radius:1.05rem;padding:.9rem .9rem 1rem;box-shadow:0 10px 20px rgba(255,135,170,.06);";

        card.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.6rem;">
            <h3 style="margin:0;font-size:1rem;font-weight:700;color:#312e81;">ยาตัวที่ ${idx + 1}</h3>
            ${idx > 0 ? `<button data-remove="${idx}" style="background:rgba(248,113,113,.12);color:#b91c1c;border:none;border-radius:.7rem;padding:.2rem .55rem;font-size:.68rem;cursor:pointer;">ลบตัวนี้</button>` : ""}
          </div>
          <label style="display:block;margin-bottom:.8rem;">
            <span style="display:block;font-size:.78rem;margin-bottom:.3rem;color:#6b7280;">ชื่อยา</span>
            <input type="text" data-drug-name="${idx}" value="${drug.name || ""}" placeholder="ระบุชื่อยา เช่น Amoxicillin" style="width:100%;border:1px solid rgba(248,113,113,.28);border-radius:.6rem;padding:.45rem .55rem;font-size:.95rem;outline:none;">
          </label>

          <div style="display:flex;flex-direction:column;gap:.7rem;">
            ${Q.map((q, qIdx) => {
              const picked = drug.answers && drug.answers[qIdx];
              return `
                <div style="background:rgba(255,248,251,.7);border:1px solid rgba(255,198,215,.2);border-radius:.75rem;padding:.55rem .55rem;">
                  <div style="font-weight:700;color:#403b5f;margin-bottom:.45rem;font-size:.95rem;">${q.t}</div>
                  <div style="display:flex;gap:.6rem;justify-content:space-between;flex-wrap:wrap;">
                    <button class="p4-choice-btn" data-drug="${idx}" data-q="${qIdx}" data-choice="yes" style="${btnStyle("yes", picked === "yes")}">ใช่ (${q.y >= 0 ? "+"+q.y: q.y})</button>
                    <button class="p4-choice-btn" data-drug="${idx}" data-q="${qIdx}" data-choice="no"  style="${btnStyle("no",  picked === "no")}">ไม่ใช่ (${q.n})</button>
                    <button class="p4-choice-btn" data-drug="${idx}" data-q="${qIdx}" data-choice="dk"  style="${btnStyle("dk",  picked === "dk")}">ไม่ทราบ (${q.d})</button>
                  </div>
                </div>
              `;
            }).join("")}
          </div>

          <div style="margin-top:.8rem;background:rgba(255,237,241,.75);border:1px solid rgba(255,175,197,.35);border-radius:.65rem;padding:.5rem .6rem;">
            <div style="font-size:.75rem;color:#6b7280;">ผลการประเมิน</div>
            <div style="font-size:1.5rem;font-weight:700;color:#312e81;line-height:1.1;">${score} คะแนน</div>
            <div style="font-size:.9rem;color:#374151;">${txt}</div>
          </div>
        `;
        container.appendChild(card);
      });

      bindEvents();
    }

    function bindEvents() {
      container.querySelectorAll("[data-drug-name]").forEach(inp => {
        inp.addEventListener("input", () => {
          const idx = Number(inp.dataset.drugName);
          store.drugs[idx].name = inp.value;
          save();
        });
      });

      container.querySelectorAll("[data-remove]").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = Number(btn.dataset.remove);
          store.drugs.splice(idx, 1);
          if (!store.drugs.length) store.drugs.push({ name: "", answers: {} });
          renderCards(); save();
        });
      });

      container.querySelectorAll(".p4-choice-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const dIdx = Number(btn.dataset.drug);
          const qIdx = Number(btn.dataset.q);
          const choice = btn.dataset.choice;
          const drug = store.drugs[dIdx];
          drug.answers = drug.answers || {};
          if (drug.answers[qIdx] === choice) delete drug.answers[qIdx];
          else drug.answers[qIdx] = choice;
          save();
          renderCards(); // เพื่ออัปเดตความเข้มสี
        });
      });
    }

    root.querySelector("#p4_add_drug").addEventListener("click", () => {
      store.drugs.push({ name: "", answers: {} });
      renderCards(); save();
    });

    root.querySelector("#p4_save_next").addEventListener("click", () => {
      save();
      const btn = document.querySelector('.tabs button[data-target="page5"]');
      if (btn) btn.click();
    });

    root.querySelector("#p4_clear").addEventListener("click", () => {
      store.drugs = [{ name: "", answers: {} }];
      renderCards(); save();
    });

    function save() {
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();
    }

    renderCards();
  }

  window.renderPage4 = renderPage4;
})();

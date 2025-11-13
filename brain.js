// ===================== brain.js (REPLACE WHOLE FILE) =====================
(function () {
  // จุดหมายเรนเดอร์ในหน้า 6
  function renderIntoPage6(html) {
    const box = document.getElementById("p6BrainBox");
    if (!box) return;
    box.innerHTML = html;
  }

  // ลำดับการแสดงผล 21 ADR (ต้องตรงกับ key ใน brain.rules.js)
  const ADR_ORDER = [
    { key: "urticaria",          title: "Urticaria" },
    { key: "anaphylaxis",        title: "Anaphylaxis" },
    { key: "angioedema",         title: "Angioedema" },
    { key: "maculopapular",      title: "Maculopapular rash" },
    { key: "fde",                title: "Fixed drug eruption" },
    { key: "agep",               title: "AGEP" },
    { key: "sjs",                title: "SJS" },
    { key: "ten",                title: "TEN" },
    { key: "dress",              title: "DRESS" },
    { key: "em",                 title: "Erythema multiforme (EM)" },
    { key: "photosensitivity",   title: "Photosensitivity drug eruption" },
    { key: "exfoliative",        title: "Exfoliative dermatitis" },
    { key: "eczematous",         title: "Eczematous drug eruption" },
    { key: "bullous",            title: "Bullous Drug Eruption" },
    { key: "serumSickness",      title: "Serum sickness" },
    { key: "vasculitis",         title: "Vasculitis" },
    { key: "hemolytic",          title: "Hemolytic anemia" },
    { key: "pancytopenia",       title: "Pancytopenia" },
    { key: "neutropenia",        title: "Neutropenia" },
    { key: "thrombocytopenia",   title: "Thrombocytopenia" },
    { key: "nephritis",          title: "Nephritis" }
  ];

  // ดึงคะแนนจากสมองโหมด C (brain.rules.js)
  function computeFromBrainRules() {
    if (typeof window.brainRank !== "function") {
      return { ready: false, results: [], top: null, anySignal: false };
    }

    // brainRank("C") จะดึง token จากหน้า 1–3 และคิดคะแนน pctC ให้ทุก ADR
    const ranked = window.brainRank("C") || { results: [] };
    const byKey = Object.create(null);
    (ranked.results || []).forEach(r => {
      if (!r || !r.key) return;
      byKey[r.key] = r;
    });

    // เรียงและเติมให้ครบ 21 ช่องตาม ADR_ORDER
    const merged = ADR_ORDER.map(def => {
      const found = byKey[def.key] || {};
      const score = typeof found.pctC === "number" ? found.pctC : 0;
      return {
        key: def.key,
        title: def.title || found.title || def.key,
        score
      };
    });

    // หาตัวที่เด่นสุด
    let top = merged[0] || null;
    for (const r of merged) {
      if (!top || r.score > top.score) top = r;
    }
    const anySignal = merged.some(r => r.score > 0);

    return { ready: true, results: merged, top, anySignal };
  }

  // เรนเดอร์ผลในหน้า 6
  function renderBrain() {
    const { ready, results, top, anySignal } = computeFromBrainRules();

    if (!ready) {
      renderIntoPage6(
        '<div class="p6-muted">สมอง ADR (brain.rules.js) ยังไม่พร้อมใช้งาน</div>'
      );
      return;
    }

    // ---- อัปเดตตัวแปร global ให้หน้า 6 ส่วนอื่น ๆ ใช้ต่อได้ ----
    window.brainScores = results;
    window.brainTop = top;
    window.brainLabels = results.map(r => r.title);
    window.brainValues = results.map(r => r.score);
    window.brainReady = anySignal;
    document.dispatchEvent(new Event("brain:update"));

    // ---- สร้างแถวแสดงคะแนนแต่ละ ADR ----
    const rows = results
      .map(r => {
        const highlight = top && r.key === top.key && r.score > 0;
        return `
        <div class="p6-row" style="margin:.35rem 0">
          <div style="font-weight:600;color:${
            highlight ? "#4c1d95" : "#111827"
          };margin-bottom:.15rem">
            ${highlight ? "⭐ " : ""}${r.title}
          </div>
          <div style="background:#f3f4f6;border-radius:.75rem;overflow:hidden;height:16px;position:relative;">
            <div style="width:${r.score}%;height:100%;
                background:linear-gradient(90deg,#7c3aed,#06b6d4);
                transition:width .35s ease;"></div>
            <div style="position:absolute;right:.5rem;top:0;height:100%;
                        display:flex;align-items:center;font-size:.8rem;color:#111827">
              ${r.score}%
            </div>
          </div>
        </div>
      `;
      })
      .join("");

    const summaryLine = anySignal
      ? `ระบบพบลักษณะเด่นที่เข้าได้กับ <strong>${top.title}</strong> (ประมาณ ${top.score}%)`
      : `ยังไม่มีสัญญาณเด่นจากข้อมูลที่กรอก ระบบจะแสดงคะแนนเมื่อมีการกรอกข้อมูลเพิ่ม`;

    // ---- ใส่ HTML ลงหน้า 6 ----
    renderIntoPage6(`
      <div style="margin-bottom:.5rem;font-weight:800;color:#1f2937">
        ผลการประเมินเบื้องต้น
      </div>
      <div style="font-size:.9rem;color:#4b5563;margin-bottom:.75rem">
        ${summaryLine}
      </div>
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
    if (btn) btn.onclick = renderBrain;
  }

  // ให้ภายนอกเรียกได้
  window.evaluateDrugAllergy = renderBrain;
  window.refreshBrain = renderBrain;

  // auto-render เมื่อข้อมูลอัปเดตจากหน้า 1–3
  document.addEventListener("da:update", renderBrain);

  // render ครั้งแรกเมื่อโหลดไฟล์
  setTimeout(renderBrain, 0);
})();

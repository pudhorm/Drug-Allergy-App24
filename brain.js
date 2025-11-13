// ===================== brain.js (REPLACE WHOLE FILE) =====================
(function () {
  // จุดหมายเรนเดอร์ในหน้า 6
  function renderIntoPage6(html) {
    const box = document.getElementById("p6BrainBox");
    if (!box) return;
    box.innerHTML = html;
  }

  // ใส่สไตล์ของกราฟแนวนอน (เฉพาะหน้า 6)
  function ensureStyles() {
    if (document.getElementById("p6-brain-style")) return;
    const st = document.createElement("style");
    st.id = "p6-brain-style";
    st.textContent = `
      #p6BrainBox .brain-card{
        background:#ffffff;
        border-radius:16px;
        border:1px solid rgba(15,23,42,0.05);
        padding:16px 18px 14px;
        box-shadow:0 10px 24px rgba(15,23,42,0.06);
      }
      #p6BrainBox .brain-title{
        font-weight:800;
        font-size:1rem;
        color:#111827;
        margin-bottom:6px;
      }
      #p6BrainBox .brain-sub{
        font-size:.9rem;
        color:#4b5563;
        margin-bottom:10px;
      }
      #p6BrainBox .brain-row{
        display:grid;
        grid-template-columns:minmax(0,260px) 1fr 52px;
        align-items:center;
        gap:10px;
        margin:4px 0;
      }
      #p6BrainBox .brain-label{
        font-size:.9rem;
        color:#111827;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }
      #p6BrainBox .brain-label-top{
        color:#4c1d95;
        font-weight:700;
      }
      #p6BrainBox .brain-bar{
        height:16px;
        background:#f3f4f6;
        border-radius:999px;
        overflow:hidden;
      }
      #p6BrainBox .brain-fill{
        height:100%;
        background:linear-gradient(90deg,#7c3aed,#06b6d4);
        transition:width .35s ease;
      }
      #p6BrainBox .brain-val{
        font-size:.85rem;
        text-align:right;
        color:#111827;
        font-weight:600;
      }
      #p6BrainBox .brain-footer{
        margin-top:.75rem;
        display:flex;
        justify-content:flex-start;
      }
      #p6BrainBox .brain-refresh{
        background:#eef2ff;
        color:#3730a3;
        border:1px solid #c7d2fe;
        padding:.45rem .9rem;
        border-radius:.8rem;
        font-weight:700;
        font-size:.9rem;
        cursor:pointer;
      }
      #p6BrainBox .brain-muted{
        font-size:.9rem;
        color:#6b7280;
      }
    `;
    document.head.appendChild(st);
  }

  // ดึงคะแนนจาก brain.rules.js (โหมด C)
  function computeFromBrainRules() {
    if (typeof window.brainRank !== "function") {
      return { ready: false, results: [], top: null, anySignal: false };
    }

    const ranked = window.brainRank("C") || { results: [] };
    const raw = Array.isArray(ranked.results) ? ranked.results.slice() : [];

    // ให้แน่ใจว่ามีค่า pctC และ sort จากมากไปน้อย (กันกรณีสมองในอนาคตเปลี่ยน)
    const results = raw
      .map(r => ({
        key: r.key || "",
        title: r.title || r.name || r.phenotype || r.key || "",
        score: typeof r.pctC === "number" ? r.pctC : 0
      }))
      .sort((a, b) => b.score - a.score);

    if (!results.length) {
      return { ready: true, results: [], top: null, anySignal: false };
    }

    let top = results[0];
    for (const r of results) {
      if (r.score > top.score) top = r;
    }
    const anySignal = results.some(r => r.score > 0);

    return { ready: true, results, top, anySignal };
  }

  // สร้าง HTML กราฟแนวนอน 21 ADR
  function renderBrain() {
    ensureStyles();

    const { ready, results, top, anySignal } = computeFromBrainRules();

    if (!ready) {
      renderIntoPage6(
        `<div class="brain-card"><div class="brain-muted">
          สมองประเมิน ADR (brain.rules.js) ยังไม่พร้อมใช้งาน
        </div></div>`
      );
      // เคลียร์สถานะ global
      window.brainScores = [];
      window.brainTop = null;
      window.brainLabels = [];
      window.brainValues = [];
      window.brainReady = false;
      document.dispatchEvent(new Event("brain:update"));
      return;
    }

    // อัปเดตตัวแปรให้ส่วนอื่นใช้ (เช่นถ้าจะเอาไปวาดกราฟแบบอื่น)
    window.brainScores = results;
    window.brainTop = top || null;
    window.brainLabels = results.map(r => r.title);
    window.brainValues = results.map(r => r.score);
    window.brainReady = anySignal;
    document.dispatchEvent(new Event("brain:update"));

    if (!results.length) {
      renderIntoPage6(
        `<div class="brain-card"><div class="brain-muted">
          ยังไม่มีข้อมูลเพียงพอ ระบบจะแสดงกราฟเมื่อมีการกรอกข้อมูลในหน้า 1–3
        </div></div>`
      );
      return;
    }

    const summaryLine = anySignal
      ? `ระบบพบลักษณะเด่นที่เข้าได้มากที่สุดกับ <strong>${top.title}</strong> (ประมาณ ${top.score}%)`
      : `ยังไม่มีสัญญาณเด่นพอจากข้อมูลที่กรอก ระบบจะแสดงคะแนนเมื่อมีการกรอกข้อมูลเพิ่ม`;

    const rowsHtml = results
      .map((r) => {
        const labelClass =
          top && r.key === top.key && r.score > 0
            ? "brain-label brain-label-top"
            : "brain-label";
        return `
          <div class="brain-row">
            <div class="${labelClass}">${r.title}</div>
            <div class="brain-bar">
              <div class="brain-fill" style="width:${r.score}%;"></div>
            </div>
            <div class="brain-val">${r.score}%</div>
          </div>
        `;
      })
      .join("");

    renderIntoPage6(`
      <div class="brain-card">
        <div class="brain-title">ผลการประเมินเบื้องต้น</div>
        <div class="brain-sub">${summaryLine}</div>
        ${rowsHtml}
        <div class="brain-footer">
          <button id="brain_refresh" class="brain-refresh">
            🔄 รีเฟรชผลประเมิน
          </button>
        </div>
      </div>
    `);

    const btn = document.getElementById("brain_refresh");
    if (btn) btn.onclick = renderBrain;
  }

  // ให้ภายนอกเรียกใช้ได้
  window.evaluateDrugAllergy = renderBrain;
  window.refreshBrain = renderBrain;

  // คำนวณใหม่เมื่อข้อมูลหน้า 1–3 เปลี่ยน
  document.addEventListener("da:update", renderBrain);

  // คำนวณครั้งแรกเมื่อโหลดไฟล์
  setTimeout(renderBrain, 0);
})();

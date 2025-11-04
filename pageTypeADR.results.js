// pageTypeADR.results.js
// เติมผลประเมินลงใน <div id="pTypeResult"> โดยไม่แก้ pageTypeADR.js เดิม
(function () {
  // เก็บฟังก์ชัน render เดิมไว้ แล้วครอบให้เราเติมสรุปทีหลัง
  const origRender = window.renderPageTypeADR;

  function safeHTML(s) {
    return String(s || "").replace(/[&<>"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  }

  function ensureAI() {
    // ถ้ามี brain แล้วเรียก evaluateAll เพื่อให้ได้ผลล่าสุด
    if (window.DABrain && typeof window.DABrain.evaluateAll === "function") {
      return window.DABrain.evaluateAll();
    }
    // เผื่อกรณีที่ brain เก็บผลไว้ใน data (หน้าอื่นคำนวณมาแล้ว)
    return (window.drugAllergyData && window.drugAllergyData.page6 && window.drugAllergyData.page6.ai) || null;
  }

  function renderResultBox() {
    const box = document.getElementById("pTypeResult");
    if (!box) return;

    const ai = ensureAI();
    const ranking = (ai && ai.ranking) || [];
    const best = ai && ai.best;

    if (!ai || !ranking.length || !best) {
      box.innerHTML = `
        <h4>ผลที่เลือก</h4>
        <div class="pType-selected" id="pTypeSelected">
          <span class="pType-chip">ยังไม่ได้เลือก</span>
        </div>
        <div style="margin-top:.6rem;background:#fff;border:1px solid #e5e7eb;border-radius:.8rem;padding:.7rem;">
          <div style="font-weight:700;color:#111827;margin-bottom:.25rem;">ผลการประเมินเบื้องต้น</div>
          <p style="margin:.2rem 0;color:#334155">ยังไม่มีข้อมูลเพียงพอจากหน้า 1–3 หรือยังไม่คำนวณ</p>
          <button id="pTypeRecalc" style="margin-top:.4rem;background:#6366f1;color:#fff;border:none;padding:.45rem .8rem;border-radius:.6rem;font-weight:700;cursor:pointer">
            🔄 รีเฟรชผลประเมิน
          </button>
        </div>
      `;
      const btn = document.getElementById("pTypeRecalc");
      if (btn) btn.onclick = () => { ensureAI(); renderResultBox(); };
      return;
    }

    const reasons = (ai.reasons && ai.reasons[best.id]) || [];
    const topReasons = reasons.slice(0, 6).map(r => `<li>${safeHTML(r)}</li>`).join("");

    const top5 = ranking.slice(0, 5).map((r, i) => {
      const pct = Math.max(4, Math.min(100, Math.round((r.score / Math.max(1, ranking[0].score)) * 100)));
      return `
        <div style="display:flex;align-items:center;gap:.6rem;margin:.35rem 0;">
          <div style="width:1.3rem;text-align:right;color:#334155">${i + 1}.</div>
          <div style="flex:1;">
            <div style="display:flex;justify-content:space-between;font-weight:600;">
              <span>${safeHTML(r.label)}</span>
              <span style="color:#64748b">${r.score}</span>
            </div>
            <div style="height:6px;background:#e5e7eb;border-radius:999px;overflow:hidden;margin-top:.25rem;">
              <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#818cf8,#a78bfa)"></div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    box.innerHTML = `
      <h4>ผลที่เลือก</h4>
      <div class="pType-selected" id="pTypeSelected">
        <span class="pType-chip">${safeHTML(best.label)}</span>
        <span class="pType-chip">คะแนนรวม: ${best.score}</span>
      </div>

      <div style="margin-top:.8rem;background:#ffffff;border:1px solid #e5e7eb;border-radius:.8rem;padding:.8rem;">
        <div style="font-weight:700;color:#111827;margin-bottom:.35rem;">เหตุผลย่อ (บางส่วน)</div>
        ${topReasons ? `<ul style="margin:.1rem 0 0 .9rem;color:#374151">${topReasons}</ul>` : `<p style="margin:0;color:#6b7280">— ไม่มีเหตุผลประกอบ —</p>`}
      </div>

      <div style="margin-top:.8rem;">
        <div style="font-weight:700;color:#111827;margin-bottom:.35rem;">อันดับคะแนน Top-5</div>
        ${top5}
        <small style="display:block;margin-top:.4rem;color:#64748b">อัปเดต: ${new Date(ai.lastEvaluatedAt).toLocaleString()}</small>
      </div>
    `;
  }

  // ครอบ render เดิมไม่ให้เสีย และเติมผลหลังจากนั้น
  window.renderPageTypeADR = function () {
    if (typeof origRender === "function") origRender();
    // หน่วงเล็กน้อยเผื่อ DOM ภายในเพิ่งถูกวาด
    setTimeout(renderResultBox, 0);
  };

  // อัปเดตเมื่อมีการบันทึกหน้าอื่น ๆ
  document.addEventListener("da:update", function () {
    setTimeout(renderResultBox, 0);
  });

  // ถ้าหน้านี้ถูกโหลดไว้แล้ว ให้ลองเติมผลทันที
  if (document.getElementById("pageTypeADR")?.classList.contains("visible")) {
    setTimeout(renderResultBox, 0);
  }
})();


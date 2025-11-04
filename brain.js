<!-- brain.js (REPLACE WHOLE FILE) -->
<script>
(function () {
  // ===== จุดหมายการเรนเดอร์: เฉพาะหน้า 6 =====
  function renderIntoPage6(html) {
    const box = document.getElementById("p6BrainBox");
    if (!box) return;
    box.innerHTML = html;
  }

  // ===== ตัวอย่าง compute แบบ placeholder (รองรับกฎจริงที่จะเติมทีหลัง) =====
  // คาดว่าในอนาคตคุณจะมี window.brainRules ตามสเปคคะแนน 21 กลุ่ม
  function computeSummary() {
    const d = window.drugAllergyData || {};
    const p1 = d.page1 || {};
    const p2 = d.page2 || {};
    const p3 = d.page3 || {};

    // ถ้ายังไม่ได้กดบันทึกหน้า 1–3 ให้บอกผู้ใช้
    const ready = !!(d.page1?.__saved && d.page2?.__saved && d.page3?.__saved);
    if (!ready) {
      return `<div class="p6-muted">ยังไม่มีข้อมูลเพียงพอจากหน้า 1–3 หรือยังไม่คำนวณ</div>`;
    }

    // ถ้าใส่กฎไว้ใน window.brainRules ให้คำนวณจริง
    const rules = window.brainRules || null;
    if (!rules) {
      return `<div class="p6-muted">ยังไม่ได้ใส่ “สมอง/กฎการให้คะแนน” ของ 21 กลุ่ม<br/>คุณสามารถเพิ่มกฎใน <code>window.brainRules</code> ภายหลังได้</div>`;
    }

    // โครงคำนวณอย่างง่าย: loop ทุกกลุ่ม → เรียก rules[group].score(d) → เก็บคะแนน
    const results = [];
    Object.keys(rules).forEach((groupKey) => {
      try {
        const score = typeof rules[groupKey].score === "function"
          ? Number(rules[groupKey].score(d)) || 0
          : 0;
        results.push({ key: groupKey, name: rules[groupKey].title || groupKey, score });
      } catch (e) { /* noop */ }
    });

    // จัดอันดับ
    results.sort((a,b)=> b.score - a.score);
    const top = results[0];

    return `
      <div>
        ${top ? `<div style="font-weight:800;margin-bottom:.35rem;">ผลเด่น: ${top.name} (คะแนน ${top.score})</div>` : ""}
        <ol class="p6-list">
          ${results.map(r=>`<li><strong>${r.name}</strong> — ${r.score} คะแนน</li>`).join("") || `<li>ยังไม่มีผล</li>`}
        </ol>
      </div>
    `;
  }

  // ===== ฟังก์ชันสาธารณะ: ให้หน้า 6 เรียกใช้ =====
  function brainComputeAndRender() {
    try {
      renderIntoPage6(`<div class="p6-muted">กำลังประมวลผล…</div>`);
      const html = computeSummary();
      renderIntoPage6(html);
    } catch (e) {
      renderIntoPage6(`<div class="p6-empty">เกิดข้อผิดพลาดในการคำนวณ</div>`);
      console.error("[brain] compute error:", e);
    }
  }

  // export
  window.brainComputeAndRender = brainComputeAndRender;

  // เฝ้าฟังเหตุการณ์อัพเดตข้อมูล → รีเฟรชผลอัตโนมัติเมื่ออยู่หน้า 6
  document.addEventListener("da:update", () => {
    const page6 = document.getElementById("page6");
    if (page6 && page6.classList.contains("visible")) {
      if (window.brainComputeAndRender) window.brainComputeAndRender();
    }
  });
})();
</script>

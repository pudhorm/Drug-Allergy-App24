// brain.js (REPLACE WHOLE FILE) — pure JS, no <script> tag
(function () {
  // ===== จุดหมายการเรนเดอร์: เฉพาะหน้า 6 =====
  function renderIntoPage6(html) {
    var box = document.getElementById("p6BrainBox");
    if (!box) return;
    box.innerHTML = html;
  }

  // ===== ตัวอย่าง compute แบบ placeholder (รองรับกฎจริงที่จะเติมทีหลัง) =====
  // คาดว่าในอนาคตคุณจะมี window.brainRules ตามสเปคคะแนน 21 กลุ่ม
  function computeSummary() {
    var d = window.drugAllergyData || {};
    var p1 = d.page1 || {};
    var p2 = d.page2 || {};
    var p3 = d.page3 || {};

    // ถ้ายังไม่ได้กดบันทึกหน้า 1–3 ให้บอกผู้ใช้
    var ready = !!(p1.__saved === true && p2.__saved === true && p3.__saved === true);
    if (!ready) {
      return '<div class="p6-muted">ยังไม่มีข้อมูลเพียงพอจากหน้า 1–3 หรือยังไม่คำนวณ</div>';
    }

    // ถ้าใส่กฎไว้ใน window.brainRules ให้คำนวณจริง
    var rules = window.brainRules || null;
    if (!rules) {
      return '<div class="p6-muted">ยังไม่ได้ใส่ “สมอง/กฎการให้คะแนน” ของ 21 กลุ่ม<br/>คุณสามารถเพิ่มกฎใน <code>window.brainRules</code> ภายหลังได้</div>';
    }

    // โครงคำนวณอย่างง่าย: loop ทุกกลุ่ม → เรียก rules[group].score(d) → เก็บคะแนน
    var results = [];
    Object.keys(rules).forEach(function (groupKey) {
      try {
        var scorer = rules[groupKey] && rules[groupKey].score;
        var score = (typeof scorer === "function") ? Number(scorer(d)) || 0 : 0;
        results.push({ key: groupKey, name: (rules[groupKey].title || groupKey), score: score });
      } catch (e) { /* noop */ }
    });

    // จัดอันดับ
    results.sort(function (a, b) { return b.score - a.score; });
    var top = results[0];

    var listHTML = results.length
      ? '<ol class="p6-list">' + results.map(function (r) {
          return '<li><strong>' + r.name + '</strong> — ' + r.score + ' คะแนน</li>';
        }).join("") + '</ol>'
      : '<ol class="p6-list"><li>ยังไม่มีผล</li></ol>';

    return [
      '<div>',
        (top ? '<div style="font-weight:800;margin-bottom:.35rem;">ผลเด่น: ' + top.name + ' (คะแนน ' + top.score + ')</div>' : ''),
        listHTML,
      '</div>'
    ].join("");
  }

  // ===== ฟังก์ชันสาธารณะ: ให้หน้า 6 เรียกใช้ =====
  function brainComputeAndRender() {
    try {
      renderIntoPage6('<div class="p6-muted">กำลังประมวลผล…</div>');
      var html = computeSummary();
      renderIntoPage6(html);
    } catch (e) {
      renderIntoPage6('<div class="p6-empty">เกิดข้อผิดพลาดในการคำนวณ</div>');
      console.error("[brain] compute error:", e);
    }
  }

  // export
  window.brainComputeAndRender = brainComputeAndRender;

  // เฝ้าฟังเหตุการณ์อัพเดตข้อมูล → รีเฟรชผลอัตโนมัติเมื่ออยู่หน้า 6
  document.addEventListener("da:update", function () {
    var page6 = document.getElementById("page6");
    if (page6 && page6.classList.contains("visible")) {
      if (window.brainComputeAndRender) window.brainComputeAndRender();
    }
  });
})();

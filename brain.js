// brain.js (pure JS — no HTML tags)
(function () {
  function renderIntoPage6(html) {
    var box = document.getElementById("p6BrainBox");
    if (box) box.innerHTML = html;
  }

  function computeSummary() {
    var d = window.drugAllergyData || {};
    var ready = !!(d.page1 && d.page1.__saved && d.page2 && d.page2.__saved && d.page3 && d.page3.__saved);
    if (!ready) {
      return '<div class="p6-muted">ยังไม่มีข้อมูลเพียงพอจากหน้า 1–3 หรือยังไม่คำนวณ</div>';
    }

    var rules = window.brainRules || null;
    if (!rules) {
      return '<div class="p6-muted">ยังไม่ได้ใส่ “สมอง/กฎการให้คะแนน” ของ 21 กลุ่ม<br/>คุณสามารถเพิ่มกฎใน <code>window.brainRules</code> ภายหลังได้</div>';
    }

    var results = [];
    Object.keys(rules).forEach(function (key) {
      var r = rules[key];
      var score = 0;
      try { score = typeof r.score === 'function' ? Number(r.score(d)) || 0 : 0; } catch (e) {}
      results.push({ key: key, name: r.title || key, score: score });
    });

    results.sort(function (a, b) { return b.score - a.score; });
    var top = results[0];

    var list = results.map(function (r) {
      return '<li><strong>' + r.name + '</strong> — ' + r.score + ' คะแนน</li>';
    }).join('') || '<li>ยังไม่มีผล</li>';

    return '<div>' +
      (top ? '<div style="font-weight:800;margin-bottom:.35rem;">ผลเด่น: ' + top.name + ' (คะแนน ' + top.score + ')</div>' : '') +
      '<ol class="p6-list">' + list + '</ol>' +
    '</div>';
  }

  function brainComputeAndRender() {
    try {
      renderIntoPage6('<div class="p6-muted">กำลังประมวลผล…</div>');
      var html = computeSummary();
      renderIntoPage6(html);
    } catch (e) {
      renderIntoPage6('<div class="p6-empty">เกิดข้อผิดพลาดในการคำนวณ</div>');
      console.error('[brain] compute error:', e);
    }
  }

  window.brainComputeAndRender = brainComputeAndRender;

  document.addEventListener('da:update', function () {
    var page6 = document.getElementById('page6');
    if (page6 && page6.classList.contains('visible')) {
      if (window.brainComputeAndRender) window.brainComputeAndRender();
    }
  });
})();

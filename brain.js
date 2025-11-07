// ===================== brain.js (REPLACE WHOLE FILE) =====================
(function () {
  // ===== จุดหมายการเรนเดอร์: เฉพาะหน้า 6 =====
  function renderIntoPage6(html) {
    var box = document.getElementById("p6BrainBox");
    if (!box) return;
    box.innerHTML = html;
  }

  // ถือว่า “บันทึกแล้ว/พอมีข้อมูล” ถ้ามี __saved หรือมีข้อมูลจริงอย่างน้อย 1 ฟิลด์
  function isSavedOrHasData(pageObj) {
    if (!pageObj) return false;
    if (pageObj.__saved) return true;
    var keys = Object.keys(pageObj).filter(function (k) { return k.indexOf("__") !== 0; });
    return keys.length > 0;
  }

  // สร้างกราฟแท่งแนวนอน (%C) 21 แบบ
  function buildBars(results){
    var rows = results.map(function(r){
      var pct = Number(r.pctC || 0);
      // clamp 0–100 และปัดทศนิยมให้ดูดี
      var w = Math.max(0, Math.min(100, pct));
      var txt = Math.round(w);
      return (
        '<div class="p6-bar-row">' +
          '<div class="p6-bar-label">'+ r.title +'</div>' +
          '<div class="p6-bar-track">' +
            '<div class="p6-bar-fill" style="width:'+ w +'%;"></div>' +
            '<div class="p6-bar-text">'+ txt +'%</div>' +
          '</div>' +
        '</div>'
      );
    }).join("");
    return (
      '<div class="p6-bars">' + rows + '</div>' +
      '<style>' +
        '.p6-bars{display:flex;flex-direction:column;gap:8px;margin-top:6px}' +
        '.p6-bar-row{display:grid;grid-template-columns:220px 1fr;gap:10px;align-items:center}' +
        '.p6-bar-label{font-size:.92rem;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
        '.p6-bar-track{position:relative;height:28px;background:#f3f4f6;border-radius:9999px;overflow:hidden}' +
        '.p6-bar-fill{position:absolute;height:100%;left:0;top:0;background:linear-gradient(90deg,#7c3aed,#22d3ee);box-shadow:0 6px 18px rgba(124,58,237,.25)}' +
        '.p6-bar-text{position:absolute;right:8px;top:50%;transform:translateY(-50%);font-weight:700;color:#111827;font-size:.9rem}' +
      '</style>'
    );
  }

  // ===== คำนวณ + เรนเดอร์ =====
  function computeSummary() {
    var d = window.drugAllergyData || {};

    var ok1 = isSavedOrHasData(d.page1);
    var ok2 = isSavedOrHasData(d.page2);
    var ok3 = isSavedOrHasData(d.page3);
    var ready = !!(ok1 && ok2 && ok3);

    if (!ready) {
      return '<div class="p6-muted">ยังไม่มีข้อมูลเพียงพอจากหน้า 1–3 หรือยังไม่คำนวณ</div>';
    }

    // ใช้สมองรุ่นใหม่: brainRank('C') → ได้ %C ทุก ADR (absolute % ไม่ normalize)
    if (typeof window.brainRank === "function") {
      try {
        var out = window.brainRank('C') || { results: [] };
        var results = Array.isArray(out.results) ? out.results : [];
        if (!results.length) return '<div class="p6-empty">ยังไม่มีผล</div>';

        // ไม่ normalize; จัดระเบียบ: clamp 0–100 + sort มาก→น้อย
        results = results.map(function(r){
          var p = Number(r.pctC || 0);
          return Object.assign({}, r, { pctC: Math.max(0, Math.min(100, p)) });
        }).sort(function(a,b){ return (b.pctC||0) - (a.pctC||0); });

        // หัวข้อ “ผลเด่น” (ตัวที่ %C มากสุดหลัง sort)
        var leader = results[0];
        var headerHTML = leader
          ? '<div style="font-weight:800;margin-bottom:.35rem;">ผลเด่น: '+ leader.title +'</div>'
          : '';

        return headerHTML + buildBars(results);
      } catch (e) {
        console.error("[brain] rank error", e);
        return '<div class="p6-empty">เกิดข้อผิดพลาดในการคำนวณ</div>';
      }
    }

    // Fallback แบบเก่า (ถ้าไม่มี brainRank)
    var rules = window.brainRules || null;
    if (!rules) {
      return '<div class="p6-muted">ยังไม่มีสมอง/กฎการให้คะแนน</div>';
    }
    var results_old = [];
    Object.keys(rules).forEach(function (key) {
      try {
        var fn = rules[key] && rules[key].score;
        var sc = (typeof fn === "function") ? Number(fn(d)) || 0 : 0;
        results_old.push({ key: key, title: rules[key].title || key, pctC: sc });
      } catch (e) {}
    });
    results_old = results_old
      .map(function(r){ r.pctC = Math.max(0, Math.min(100, Number(r.pctC||0))); return r; })
      .sort(function(a,b){ return (b.pctC||0) - (a.pctC||0); });
    return buildBars(results_old);
  }

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
    if (page6 && page6.classList && page6.classList.contains("visible")) {
      window.brainComputeAndRender();
    }
  });
})();

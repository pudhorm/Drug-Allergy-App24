// ===================== brain.js (REPLACE WHOLE FILE) =====================
(function () {
  // ===== จุดหมายการเรนเดอร์: เฉพาะหน้า 6 =====
  function renderIntoPage6(html) {
    var box = document.getElementById("p6BrainBox");
    if (!box) return;
    box.innerHTML = html;
  }

  // ===== ตัวช่วย: ถือว่า “บันทึกแล้ว/พอมีข้อมูล” ถ้ามีธง __saved หรือมีข้อมูลจริงอย่างน้อย 1 ฟิลด์ =====
  function isSavedOrHasData(pageObj) {
    if (!pageObj) return false;
    if (pageObj.__saved) return true;
    // มีคีย์ที่ไม่ใช่เมตาอย่างน้อย 1 อันถือว่า “กรอกมาแล้วบางส่วน”
    var keys = Object.keys(pageObj).filter(function (k) { return k.indexOf("__") !== 0; });
    return keys.length > 0;
  }

  // ===== คำนวณผลสรุป =====
  function computeSummary() {
    var d = window.drugAllergyData || {};

    // ยอมรับทั้งกรณี __saved หรือมีข้อมูลจริงอย่างน้อย 1 ช่องในแต่ละหน้า
    var ok1 = isSavedOrHasData(d.page1);
    var ok2 = isSavedOrHasData(d.page2);
    var ok3 = isSavedOrHasData(d.page3);
    var ready = !!(ok1 && ok2 && ok3);

    if (!ready) {
      return '<div class="p6-muted">ยังไม่มีข้อมูลเพียงพอจากหน้า 1–3 หรือยังไม่คำนวณ</div>';
    }

    // ====== โหมด A: ใช้เอนจินใหม่จาก brain.rules.js (window.brainRank) ======
    if (typeof window.brainRank === "function") {
      try {
        var ranked = window.brainRank(); // { tags:[], results:[{title,pct,score,denom,detail}] }
        var results = Array.isArray(ranked && ranked.results) ? ranked.results : [];
        if (!results.length) return '<div class="p6-empty">ยังไม่มีผล</div>';

        // เอา Top 3 (brain.rules.js เรียงมาแล้ว แต่ป้องกันไว้)
        results.sort(function(a,b){ return (b.pct||0) - (a.pct||0) || (b.score||0) - (a.score||0); });
        var top3 = results.slice(0, 3);

        var listHTML = top3.map(function (r, i) {
          var pct = (r.pct != null) ? r.pct : Math.round(((r.score||0)/(r.denom||1))*100);
          return '<li><strong>' + (i+1) + ')</strong> ' + (r.title || r.name || r.key) +
                 ' <span style="color:#6b7280">(' + pct + '%)</span></li>';
        }).join("");

        var lead = top3[0] ? (top3[0].title || top3[0].name || top3[0].key) : "";
        return '' +
          '<div>' +
            (lead ? '<div style="font-weight:800;margin-bottom:.35rem;">ผลเด่น: ' + lead + '</div>' : '') +
            '<ol class="p6-list">' + (listHTML || '<li>ยังไม่มีผล</li>') + '</ol>' +
          '</div>';
      } catch (e) {
        console.error("[brain] brainRank error:", e);
        // ถ้าเอนจินใหม่มีปัญหา → ตกกลับไปโหมด B
      }
    }

    // ====== โหมด B: ใช้รูปแบบเก่า (window.brainRules ที่มี .score(d)) ======
    var rules = window.brainRules || null;
    if (!rules) {
      return '<div class="p6-muted">ยังไม่ได้ใส่ “สมอง/กฎการให้คะแนน”<br/>โปรดโหลด <code>brain.rules.js</code> หรือกำหนด <code>window.brainRules</code>/<code>window.brainRank</code></div>';
    }

    var resultsLegacy = [];
    Object.keys(rules).forEach(function (key) {
      try {
        var fn = rules[key] && rules[key].score;
        var sc = (typeof fn === "function") ? Number(fn(d)) || 0 : 0;
        resultsLegacy.push({ key: key, name: rules[key].title || key, score: sc });
      } catch (e) { /* ignore */ }
    });

    if (!resultsLegacy.length) return '<div class="p6-empty">ยังไม่มีผล</div>';

    resultsLegacy.sort(function(a,b){ return b.score - a.score; });
    var top3Legacy = resultsLegacy.slice(0, 3);

    var listLegacy = top3Legacy.map(function (r, i) {
      return '<li><strong>' + (i+1) + ')</strong> ' + r.name + '</li>';
    }).join("");

    var leadLegacy = top3Legacy[0] ? top3Legacy[0].name : "";
    return '' +
      '<div>' +
        (leadLegacy ? '<div style="font-weight:800;margin-bottom:.35rem;">ผลเด่น: ' + leadLegacy + '</div>' : '') +
        '<ol class="p6-list">' + (listLegacy || '<li>ยังไม่มีผล</li>') + '</ol>' +
      '</div>';
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
    if (page6 && page6.classList && page6.classList.contains("visible")) {
      try { window.brainComputeAndRender(); } catch (_) {}
    }
  });
})();

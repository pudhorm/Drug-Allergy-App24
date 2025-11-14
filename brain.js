// ===================== brain.js (REPLACE WHOLE FILE) =====================
// สมองส่วนแสดงผลหน้า 6 — ใช้ engine จาก brain.rules.js โหมด C (computeAll)

(function () {
  // ------------------------------------------------------------
  // Helper: render HTML เข้า box หน้า 6
  // ------------------------------------------------------------
  function renderIntoPage6(html) {
    var box = document.getElementById("p6BrainBox");
    if (!box) return;
    box.innerHTML = html;
  }

  // ป้องกัน XSS เล็กน้อย
  function esc(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ------------------------------------------------------------
  // แปลงผลคะแนนเป็น %
  //   – ใช้ maxScore ของเคสนี้เป็น 100%
  // ------------------------------------------------------------
  function toPercent(total, maxScore) {
    if (!maxScore || maxScore <= 0) return 0;
    var p = Math.round((total / maxScore) * 100);
    if (p < 0) p = 0;
    if (p > 100) p = 100;
    return p;
  }

  // ------------------------------------------------------------
  // view: สร้าง bar แนวนอน 1 แถว
  // ------------------------------------------------------------
  function renderBarRow(idx, name, percent, raw) {
    return (
      '<div class="p6-bar-row">' +
      '  <div class="p6-bar-rank">' +
      (idx < 9 ? "0" + (idx + 1) : idx + 1) +
      "</div>" +
      '  <div class="p6-bar-main">' +
      '    <div class="p6-bar-label">' +
      esc(name) +
      "</div>" +
      '    <div class="p6-bar-track">' +
      '      <div class="p6-bar-fill" style="width:' +
      percent +
      '%;"></div>' +
      "    </div>" +
      "  </div>" +
      '  <div class="p6-bar-score">' +
      esc(percent + "%") +
      "</div>" +
      "</div>"
    );
  }

  // ------------------------------------------------------------
  // view: รายละเอียดตัวแปรที่ถูกนับ (tokens) ของแต่ละ ADR
  // ------------------------------------------------------------
  function renderTokenCard(result) {
    var html = "";
    html += '<div class="p6-token-card">';
    html += '  <div class="p6-token-title">' + esc(result.label || result.key) + "</div>";

    if (!result.tokens || !result.tokens.length) {
      html += '  <p class="p6-token-empty">ไม่มีตัวแปรที่ถูกนับ</p>';
    } else {
      html += '  <ul class="p6-token-list">';
      result.tokens.forEach(function (tk) {
        var label = tk && tk.label != null ? tk.label : "";
        var w = tk && typeof tk.w === "number" ? tk.w : 1;
        var wText = w === 1 ? "" : " (+" + w + ")";
        html +=
          '    <li><span class="p6-token-dot">•</span> ' +
          esc(label + wText) +
          "</li>";
      });
      html += "  </ul>";
    }

    html += "</div>";
    return html;
  }

  // ------------------------------------------------------------
  // main compute & render
  // ------------------------------------------------------------
  function computeSummaryHTML() {
    var d = window.drugAllergyData || {};

    // ต้องบันทึกหน้า 1–3 ก่อน
    var ready =
      d.page1 && d.page1.__saved && d.page2 && d.page2.__saved && d.page3 && d.page3.__saved;

    if (!ready) {
      return (
        '<div class="p6-panel">' +
        '<h3 class="p6-title">ผลการประเมินเบื้องต้น</h3>' +
        '<p class="p6-muted">ยังไม่มีข้อมูลเพียงพอจากหน้า 1–3 หรือยังไม่ได้กดบันทึก</p>' +
        "</div>"
      );
    }

    // ใช้ engine โหมด C จาก brain.rules.js
    var engine = window.brainRules_vEval;
    if (!engine || typeof engine.computeAll !== "function") {
      return (
        '<div class="p6-panel">' +
        '<h3 class="p6-title">ผลการประเมินเบื้องต้น</h3>' +
        '<p class="p6-error">ไม่พบฟังก์ชัน brainRules_vEval.computeAll() โปรดตรวจสอบไฟล์ brain.rules.js</p>' +
        "</div>"
      );
    }

    var allResults = engine.computeAll() || [];

    // ใช้เฉพาะ ADR ที่มีคะแนน > 0 ตามโหมด C
    var positives = allResults.filter(function (r) {
      return r && typeof r.total === "number" && r.total > 0;
    });

    if (!positives.length) {
      return (
        '<div class="p6-panel">' +
        '<h3 class="p6-title">ผลการประเมินเบื้องต้น</h3>' +
        '<p class="p6-muted">ยังไม่มีสัญญาณเด่นพอจากข้อมูลที่กรอก</p>' +
        "</div>"
      );
    }

    // เรียงจากมากไปน้อย (engine ก็เรียงมาแล้ว แต่กันพลาด)
    positives.sort(function (a, b) {
      return b.total - a.total;
    });

    var maxScore = positives[0].total || 1;

    // เติม % ลงในแต่ละผล
    positives.forEach(function (r) {
      r.percent = toPercent(r.total, maxScore);
    });

    // Top 5
    var top5 = positives.slice(0, 5);

    var html = "";

    // --------------------------------------------------------
    // บล็อก 1: ผลการประเมินเบื้องต้น (Top 5 + รายละเอียดตัวแปร)
    // --------------------------------------------------------
    html += '<section class="p6-panel p6-panel-main">';
    html += '  <h3 class="p6-title">ผลการประเมินเบื้องต้น</h3>';

    // แถบสรุป Top 5
    html += '  <div class="p6-card p6-card-top5">';
    html +=
      '    <div class="p6-card-header">📊 สรุปคะแนนความเป็นไปได้ (Top 5)</div>' +
      '    <div class="p6-card-body">';

    top5.forEach(function (r, idx) {
      html += renderBarRow(idx, r.label || r.key, r.percent, r.total);
    });

    html += "    </div>";
    html += "  </div>";

    // รายละเอียดตัวแปรที่ถูกนับ (ใช้ details/summary เพื่อไม่ให้เว็บหนัก)
    html += '  <details class="p6-details-variables">';
    html +=
      '    <summary class="p6-details-summary">▼ ดูรายละเอียดตัวแปรที่ถูกนับ</summary>';
    html += '    <div class="p6-token-grid">';

    top5.forEach(function (r) {
      html += renderTokenCard(r);
    });

    html += "    </div>";
    html += "  </details>";

    html += "</section>";

    // --------------------------------------------------------
    // บล็อก 2: กราฟคะแนนเป็นเปอร์เซ็นต์ (เฉพาะ ADR ที่ได้คะแนน)
    //   – ไม่มี "กราฟผลคะแนนย่อย (Top signals)" แล้ว
    // --------------------------------------------------------
    html += '<section class="p6-panel p6-panel-all">';
    html +=
      '  <h3 class="p6-title">📈 สรุปคะแนนเป็นเปอร์เซ็นต์ (ครบ 21 ADR – แสดงเฉพาะที่ได้คะแนน)</h3>';
    html += '  <div class="p6-card p6-card-all">';
    html += '    <div class="p6-card-body">';

    positives.forEach(function (r, idx) {
      html += renderBarRow(idx, r.label || r.key, r.percent, r.total);
    });

    html += "    </div>";
    html += "  </div>";
    html += "</section>";

    // *** ไม่มีบล็อก "กราฟผลคะแนนย่อย (Top signals)" อีกต่อไป ***

    return html;
  }

  // ------------------------------------------------------------
  // public: refresh (เรียกจากปุ่มหน้า 6)
  // ------------------------------------------------------------
  function refresh() {
    renderIntoPage6('<div class="p6-loading">กำลังคำนวณผลการประเมิน...</div>');
    // ใช้ setTimeout เล็กน้อยให้ UI ไม่ค้าง
    setTimeout(function () {
      try {
        var html = computeSummaryHTML();
        renderIntoPage6(html);
      } catch (e) {
        console.error("drugAllergyBrain error:", e);
        renderIntoPage6(
          '<div class="p6-panel"><h3 class="p6-title">ผลการประเมินเบื้องต้น</h3>' +
            '<p class="p6-error">เกิดข้อผิดพลาดระหว่างคำนวณผล กรุณาลองใหม่อีกครั้ง</p></div>'
        );
      }
    }, 10);
  }

  // export ให้หน้า 6 เรียกใช้
  window.drugAllergyBrain = {
    refresh: refresh,
  };
})();

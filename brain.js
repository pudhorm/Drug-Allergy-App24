// ===================== brain.js (REPLACE WHOLE FILE) =====================
// แสดงผลหน้า 6 โดยใช้กฎโหมด C จาก brain.rules.js
// - ดึงคะแนนจาก window.brainRules หรือ window.brainRules_vEval (รองรับทั้งสองแบบ)
// - แปลงคะแนนเป็น % แบบเทียบกับคะแนนสูงสุดของเคสนั้น
// - แสดงเฉพาะ ADR ที่มีคะแนน > 0 เท่านั้น
// - ซ่อนบล็อก "กราฟผลคะแนนย่อย (Top signals)" ออกจากหน้า 6

(function () {
  // ------------------------------------------------------------
  // DOM helpers
  // ------------------------------------------------------------
  function renderIntoPage6(html) {
    var box = document.getElementById("p6BrainBox");
    if (!box) return;
    box.innerHTML = html;
  }

  function esc(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ซ่อน section "กราฟผลคะแนนย่อย (Top signals)" ถ้ามีอยู่ใน DOM
  function hideTopSignalsSection() {
    try {
      var headings = document.querySelectorAll("h2, h3, h4");
      headings.forEach(function (h) {
        if (!h || !h.textContent) return;
        if (h.textContent.indexOf("กราฟผลคะแนนย่อย") !== -1) {
          var sec = h.closest("section") || h.parentElement;
          if (sec) {
            sec.style.display = "none";
          }
        }
      });
    } catch (e) {
      console.warn("hideTopSignalsSection error:", e);
    }
  }

  // ------------------------------------------------------------
  // ดึง engine ที่ใช้คำนวณจาก brain.rules.js
  //   รองรับทั้ง:
  //   - window.brainRules_vEval.computeAll()
  //   - window.brainRules.computeAll()
  //   - หรือ brainRules เป็นฟังก์ชันที่คืน array ของผลลัพธ์
  // ------------------------------------------------------------
  function getResultsFromEngine() {
    var br = window.brainRules_vEval || window.brainRules || null;
    if (!br) return null;

    try {
      if (typeof br.computeAll === "function") {
        return br.computeAll();
      }
      if (typeof br === "function") {
        return br();
      }
    } catch (e) {
      console.error("brain.js: error calling computeAll:", e);
      return null;
    }

    return null;
  }

  // ------------------------------------------------------------
  // แปลงคะแนนเป็น %
  // ------------------------------------------------------------
  function toPercent(total, maxScore) {
    if (!maxScore || maxScore <= 0) return 0;
    var p = Math.round((total / maxScore) * 100);
    if (p < 0) p = 0;
    if (p > 100) p = 100;
    return p;
  }

  // ------------------------------------------------------------
  // view: แถวกราฟแนวนอน 1 แถว
  // ------------------------------------------------------------
  function renderBarRow(idx, name, percent) {
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
  // view: รายละเอียด token ที่ถูกนับของแต่ละ ADR (แบบรูปเก่า)
  // ------------------------------------------------------------
  function renderTokenCard(result) {
    var html = "";
    html += '<div class="p6-token-card">';
    html +=
      '  <div class="p6-token-title">' + esc(result.label || result.key) + "</div>";

    var tokens = result.tokens || [];
    if (!tokens.length) {
      html += '  <p class="p6-token-empty">ไม่มีตัวแปรที่ถูกนับ</p>';
    } else {
      html += '  <ul class="p6-token-list">';
      tokens.forEach(function (tk) {
        if (!tk) return;
        var label = tk.label != null ? String(tk.label) : "";
        var w = typeof tk.w === "number" ? tk.w : 1;
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
  // คำนวณ + สร้าง HTML ทั้งบล็อก
  // ------------------------------------------------------------
  function computeSummaryHTML() {
    var d = window.drugAllergyData || {};

    // ต้องกด "บันทึก" หน้า 1–3 แล้วเท่านั้น
    var ready =
      d.page1 &&
      d.page1.__saved &&
      d.page2 &&
      d.page2.__saved &&
      d.page3 &&
      d.page3.__saved;

    if (!ready) {
      return (
        '<section class="p6-panel p6-panel-main">' +
        '  <h3 class="p6-title">ผลการประเมินเบื้องต้น</h3>' +
        '  <p class="p6-muted">ยังไม่มีข้อมูลเพียงพอจากหน้า 1–3 หรือยังไม่ได้กดบันทึก</p>' +
        "</section>"
      );
    }

    // ดึงผลจาก engine
    var allResults = getResultsFromEngine();
    if (!allResults || !Array.isArray(allResults) || !allResults.length) {
      return (
        '<section class="p6-panel p6-panel-main">' +
        '  <h3 class="p6-title">ผลการประเมินเบื้องต้น</h3>' +
        '  <p class="p6-error">ไม่สามารถคำนวณผลได้ กรุณาตรวจสอบไฟล์ brain.rules.js</p>' +
        "</section>"
      );
    }

    // เอาเฉพาะ ADR ที่มีคะแนน > 0 (โหมด C: แสดงเฉพาะข้อที่มีสัญญาณจริง)
    var positives = allResults.filter(function (r) {
      return r && typeof r.total === "number" && r.total > 0;
    });

    if (!positives.length) {
      return (
        '<section class="p6-panel p6-panel-main">' +
        '  <h3 class="p6-title">ผลการประเมินเบื้องต้น</h3>' +
        '  <p class="p6-muted">ยังไม่มีสัญญาณเด่นพอจากข้อมูลที่กรอก</p>' +
        "</section>"
      );
    }

    // เรียงมาก -> น้อย กันพลาด
    positives.sort(function (a, b) {
      return b.total - a.total;
    });

    var maxScore = positives[0].total || 1;
    positives.forEach(function (r) {
      r.percent = toPercent(r.total, maxScore);
    });

    var top5 = positives.slice(0, 5);

    var html = "";

    // --------------------------------------------------------
    // บล็อก 1: Top 5 + รายละเอียดตัวแปร (เหมือนรูปเดิม)
    // --------------------------------------------------------
    html += '<section class="p6-panel p6-panel-main">';
    html += '  <h3 class="p6-title">ผลการประเมินเบื้องต้น</h3>';

    html += '  <div class="p6-card p6-card-top5">';
    html +=
      '    <div class="p6-card-header">📊 สรุปคะแนนความสอดคล้อง (Top 5)</div>';
    html += '    <div class="p6-card-body">';

    top5.forEach(function (r, idx) {
      html += renderBarRow(idx, r.label || r.key, r.percent);
    });

    html += "    </div>";
    html += "  </div>";

    // รายละเอียดตัวแปรที่ถูกนับ
    html +=
      '  <details class="p6-details-variables"><summary class="p6-details-summary">▼ ดูรายละเอียดตัวแปรที่ถูกนับ</summary>';
    html += '    <div class="p6-token-grid">';
    top5.forEach(function (r) {
      html += renderTokenCard(r);
    });
    html += "    </div>";
    html += "  </details>";

    html += "</section>";

    // --------------------------------------------------------
    // บล็อก 2: กราฟคะแนนเป็น % (เฉพาะ ADR ที่มีคะแนน)
    // --------------------------------------------------------
    html += '<section class="p6-panel p6-panel-all">';
    html +=
      '  <h3 class="p6-title">📈 สรุปคะแนนเป็นเปอร์เซ็นต์ (เฉพาะ ADR ที่ได้คะแนน)</h3>';
    html += '  <div class="p6-card p6-card-all">';
    html += '    <div class="p6-card-body">';

    positives.forEach(function (r, idx) {
      html += renderBarRow(idx, r.label || r.key, r.percent);
    });

    html += "    </div>";
    html += "  </div>";
    html += "</section>";

    return html;
  }

  // ------------------------------------------------------------
  // public: เรียกจากปุ่ม "รีเฟรชผลประเมิน"
  // ------------------------------------------------------------
  function refresh() {
    hideTopSignalsSection(); // ซ่อนกราฟผลคะแนนย่อยทุกครั้งที่รีเฟรช

    renderIntoPage6(
      '<div class="p6-loading">กำลังคำนวณผลการประเมิน...</div>'
    );

    setTimeout(function () {
      try {
        var html = computeSummaryHTML();
        renderIntoPage6(html);
      } catch (e) {
        console.error("drugAllergyBrain error:", e);
        renderIntoPage6(
          '<section class="p6-panel"><h3 class="p6-title">ผลการประเมินเบื้องต้น</h3>' +
            '<p class="p6-error">เกิดข้อผิดพลาดระหว่างคำนวณผล กรุณาลองใหม่อีกครั้ง</p></section>'
        );
      }
    }, 10);
  }

  // export ให้หน้า 6 ใช้
  window.drugAllergyBrain = {
    refresh: refresh,
  };
  // เผื่อโค้ดเก่าเรียกแบบฟังก์ชันตรง ๆ
  window.drugAllergyBrain_refresh = refresh;

  // ซ่อนกราฟ Top signals ทันทีที่โหลดสคริปต์ (กันกรณีที่ยังไม่กดปุ่มรีเฟรช)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hideTopSignalsSection);
  } else {
    hideTopSignalsSection();
  }
})();

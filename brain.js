// ===================== brain.js (REPLACE WHOLE FILE) =====================
// หน้า 6 : สรุปผลการประเมิน ADR (โหมด C)
// ใช้ผลคำนวณจาก brain.rules.js : window.brainRules_vEval.computeAll()
// - นับคะแนนเฉพาะตัวที่ผู้ใช้ติ๊กแล้วกฎใน brain.rules.js ให้คะแนน
// - แสดงเฉพาะ ADR ที่มีคะแนน > 0
// - เปลี่ยนคะแนนเป็นเปอร์เซ็นต์โดยอิงจากตัวที่ได้คะแนนสูงสุดในเคสนั้น (ตัวที่มากสุด = 100%)
// - เรียงจากเปอร์เซ็นต์มาก → น้อย
// - แสดงกล่องรายละเอียด "ตัวแปรที่ถูกนับ" ตาม tokens ของแต่ละ ADR
// - ซ่อนบล็อก "กราฟผลคะแนนย่อย (Top signals)" เดิมออกจากหน้า

(function () {
  // -------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------
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

  function toPercent(score, maxScore) {
    if (!maxScore || maxScore <= 0) return 0;
    var p = Math.round((score / maxScore) * 100);
    if (p < 0) p = 0;
    if (p > 100) p = 100;
    return p;
  }

  // ซ่อนบล็อก "กราฟผลคะแนนย่อย (Top signals)" เดิมออกไป
  function hideTopSignalsSection() {
    try {
      var root = document.body;
      if (!root) return;
      var nodes = root.querySelectorAll("*");
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (!el || !el.textContent) continue;
        if (el.textContent.indexOf("กราฟผลคะแนนย่อย") !== -1 ||
            el.textContent.indexOf("Top signals") !== -1) {
          var sec = el.closest ? el.closest("section,div") : el.parentElement;
          if (sec) sec.style.display = "none";
          else el.style.display = "none";
        }
      }
    } catch (e) {
      console.warn("hideTopSignalsSection error:", e);
    }
  }

  // ดึงผลจาก engine ใน brain.rules.js
  function getResultsFromEngine() {
    // โหมดหลัก: brainRules_vEval.computeAll()
    if (
      window.brainRules_vEval &&
      typeof window.brainRules_vEval.computeAll === "function"
    ) {
      try {
        var r = window.brainRules_vEval.computeAll();
        if (Array.isArray(r)) return r;
      } catch (e) {
        console.error("brainRules_vEval.computeAll error:", e);
      }
    }

    // fallback เผื่อกรณีเก่า (ถ้าเคยมี)
    if (
      window.brainRules &&
      typeof window.brainRules.computeAll === "function"
    ) {
      try {
        var r2 = window.brainRules.computeAll();
        if (Array.isArray(r2)) return r2;
      } catch (e2) {
        console.error("brainRules.computeAll error:", e2);
      }
    }

    return [];
  }

  // -------------------------------------------------------------------
  // View helpers
  // -------------------------------------------------------------------
  function renderBarRow(idx, name, percent) {
    var rank = idx + 1;
    var rankStr = rank < 10 ? "0" + rank : "" + rank;

    return (
      '<div class="p6-bar-row">' +
      '  <div class="p6-bar-rank">' +
      esc(rankStr) +
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

  function renderTokenCard(result) {
    var html = "";
    html += '<div class="p6-token-card">';
    html +=
      '  <div class="p6-token-title">' +
      esc(result.label || result.key) +
      "</div>";

    var tokens = result.tokens || [];
    if (!tokens.length) {
      html +=
        '  <p class="p6-token-empty">ไม่มีตัวแปรที่ถูกนับ</p>';
    } else {
      html += '  <ul class="p6-token-list">';
      for (var i = 0; i < tokens.length; i++) {
        var tk = tokens[i];
        if (!tk) continue;
        var label = tk.label != null ? String(tk.label) : "";
        var w = typeof tk.w === "number" ? tk.w : 1;
        var wText = w === 1 ? "" : " (+" + w + ")";
        html +=
          '    <li><span class="p6-token-dot">•</span> ' +
          esc(label + wText) +
          "</li>";
      }
      html += "  </ul>";
    }

    html += "</div>";
    return html;
  }

  // -------------------------------------------------------------------
  // Build HTML summary (ใช้ทุกครั้งที่กดรีเฟรชผลประเมิน)
  // -------------------------------------------------------------------
  function buildSummaryHTML() {
    var results = getResultsFromEngine(); // [{key,label,total,tokens}, ...]

    if (!results || !results.length) {
      return (
        '<section class="p6-panel p6-panel-main">' +
        '  <h3 class="p6-title">ผลการประเมินเบื้องต้น</h3>' +
        '  <p class="p6-muted">ยังไม่มีสัญญาณเด่นพอจากข้อมูลที่กรอก หรือยังไม่ได้กดบันทึกหน้า 1–3</p>' +
        "</section>"
      );
    }

    // เอาเฉพาะ ADR ที่ได้คะแนน > 0 (ตามหลัก: นับเฉพาะสิ่งที่ผู้ใช้ติ้กจนเข้าเกณฑ์ ADR นั้น ๆ)
    var positives = [];
    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      if (!r || typeof r.total !== "number") continue;
      if (r.total > 0) positives.push(r);
    }

    if (!positives.length) {
      return (
        '<section class="p6-panel p6-panel-main">' +
        '  <h3 class="p6-title">ผลการประเมินเบื้องต้น</h3>' +
        '  <p class="p6-muted">ยังไม่มี ADR ใดเข้าเกณฑ์จากข้อมูลที่กรอก</p>' +
        "</section>"
      );
    }

    // เรียงคะแนนมาก → น้อย
    positives.sort(function (a, b) {
      return b.total - a.total;
    });

    // ใช้คะแนนสูงสุดในเคสนี้เป็นฐาน 100%
    var maxScore = positives[0].total || 1;
    for (var j = 0; j < positives.length; j++) {
      positives[j].percent = toPercent(
        positives[j].total,
        maxScore
      );
    }

    // เตรียม Top 5 สำหรับรายละเอียดตัวแปร (เหมือนรูปเดิม)
    var top5 = positives.slice(0, 5);

    var html = "";

    // ===== Block 1: Top 5 + รายละเอียดตัวแปร =====
    html += '<section class="p6-panel p6-panel-main">';
    html += '  <h3 class="p6-title">ผลการประเมินเบื้องต้น</h3>';

    html += '  <div class="p6-card p6-card-top5">';
    html +=
      '    <div class="p6-card-header">📊 สรุปคะแนนความสอดคล้อง (Top 5)</div>';
    html += '    <div class="p6-card-body">';
    for (var k = 0; k < top5.length; k++) {
      var t = top5[k];
      html += renderBarRow(k, t.label || t.key, t.percent);
    }
    html += "    </div>";
    html += "  </div>";

    html +=
      '  <details class="p6-details-variables" open>' +
      '    <summary class="p6-details-summary">▼ ดูรายละเอียดตัวแปรที่ถูกนับ</summary>';
    html += '    <div class="p6-token-grid">';
    for (var m = 0; m < top5.length; m++) {
      html += renderTokenCard(top5[m]);
    }
    html += "    </div>";
    html += "  </details>";

    html += "</section>";

    // ===== Block 2: กราฟ % ครบทุก ADR ที่ได้คะแนน =====
    html += '<section class="p6-panel p6-panel-all">';
    html +=
      '  <h3 class="p6-title">📈 สรุปคะแนนเป็นเปอร์เซ็นต์ (ครบ ' +
      esc(String(positives.length)) +
      " ADR)</h3>";
    html += '  <div class="p6-card p6-card-all">';
    html += '    <div class="p6-card-body">';
    for (var n = 0; n < positives.length; n++) {
      var r2 = positives[n];
      html += renderBarRow(n, r2.label || r2.key, r2.percent);
    }
    html += "    </div>";
    html += "  </div>";
    html += "</section>";

    return html;
  }

  // -------------------------------------------------------------------
  // Refresh function (เรียกจากปุ่มหน้า 6)
  // -------------------------------------------------------------------
  function refresh() {
    try {
      hideTopSignalsSection();

      renderIntoPage6(
        '<div class="p6-loading">กำลังคำนวณผลการประเมิน...</div>'
      );

      // ใช้ setTimeout เล็กน้อยกันหน้าแข็ง
      setTimeout(function () {
        var html = buildSummaryHTML();
        renderIntoPage6(html);
      }, 20);
    } catch (e) {
      console.error("drugAllergyBrain.refresh error:", e);
      renderIntoPage6(
        '<section class="p6-panel">' +
          '<h3 class="p6-title">ผลการประเมินเบื้องต้น</h3>' +
          '<p class="p6-error">เกิดข้อผิดพลาดระหว่างคำนวณผล กรุณาลองใหม่อีกครั้ง</p>' +
        "</section>"
      );
    }
  }

  // -------------------------------------------------------------------
  // Export ให้ปุ่มหน้า 6 ใช้งาน
  // -------------------------------------------------------------------
  window.drugAllergyBrain = { refresh: refresh };
  window.drugAllergyBrain_refresh = refresh;

  // ซ่อน Top signals ตั้งแต่โหลดหน้า (กันมันแสดงทับ)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hideTopSignalsSection);
  } else {
    hideTopSignalsSection();
  }
})();

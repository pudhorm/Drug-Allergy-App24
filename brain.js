// ===================== brain.js (REPLACE WHOLE FILE) =====================
// หน้า 6 : สรุปผลการประเมิน ADR
// ใช้ผลคำนวณจาก brain.rules.js โหมด C (computeAll() คืน array ของ {key,label,total,tokens})
// - แปลงคะแนนเป็น % โดยเทียบกับคะแนนสูงสุดของเคสนั้น
// - แสดงเฉพาะ ADR ที่มีคะแนน > 0 เท่านั้น
// - แสดง Top 5 + รายละเอียดตัวแปรที่ถูกนับ
// - มีกล่อง % ของ ADR ทั้งหมดที่ได้คะแนน
// - ซ่อนส่วน "กราฟผลคะแนนย่อย (Top signals)" ออกจากหน้า

(function () {
  // -------------------------------------------------------------------
  // DOM helpers
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

  // ซ่อน section "กราฟผลคะแนนย่อย (Top signals)" ให้หายไปจากหน้า 6
  function hideTopSignalsSection() {
    try {
      var nodes = document.body ? document.body.querySelectorAll("*") : [];
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (!el || !el.textContent) continue;
        if (el.textContent.indexOf("กราฟผลคะแนนย่อย") !== -1) {
          var sec = el.closest("section");
          if (!sec) sec = el.parentElement;
          if (sec) sec.style.display = "none";
        }
      }
    } catch (e) {
      console.warn("hideTopSignalsSection error:", e);
    }
  }

  // -------------------------------------------------------------------
  // ดึงผลคำนวณจาก brain.rules.js
  //   รองรับ:
  //   - window.brainRules_vEval.computeAll()
  //   - window.brainRules.computeAll()
  //   - ถ้าเป็น array อย่างเดียว ถือว่า error
  // -------------------------------------------------------------------
  function getResultsFromEngine() {
    var engine = null;

    if (window.brainRules_vEval && typeof window.brainRules_vEval.computeAll === "function") {
      engine = window.brainRules_vEval;
    } else if (window.brainRules && typeof window.brainRules.computeAll === "function") {
      engine = window.brainRules;
    }

    if (!engine) return null;

    try {
      var res = engine.computeAll();
      if (res && Object.prototype.toString.call(res) === "[object Array]") {
        return res;
      }
      return null;
    } catch (e) {
      console.error("brain.js: computeAll() error:", e);
      return null;
    }
  }

  function toPercent(total, maxScore) {
    if (!maxScore || maxScore <= 0) return 0;
    var p = Math.round((total / maxScore) * 100);
    if (p < 0) p = 0;
    if (p > 100) p = 100;
    return p;
  }

  // -------------------------------------------------------------------
  // view helpers
  // -------------------------------------------------------------------
  function renderBarRow(idx, name, percent) {
    var rank = idx + 1;
    var rankStr = rank < 10 ? "0" + rank : "" + rank;

    return (
      '<div class="p6-bar-row">' +
      '  <div class="p6-bar-rank">' + esc(rankStr) + "</div>" +
      '  <div class="p6-bar-main">' +
      '    <div class="p6-bar-label">' + esc(name) + "</div>" +
      '    <div class="p6-bar-track">' +
      '      <div class="p6-bar-fill" style="width:' + percent + '%;"></div>' +
      "    </div>" +
      "  </div>" +
      '  <div class="p6-bar-score">' + esc(percent + "%") + "</div>" +
      "</div>"
    );
  }

  function renderTokenCard(result) {
    var html = "";
    html += '<div class="p6-token-card">';
    html += '  <div class="p6-token-title">' + esc(result.label || result.key) + "</div>";

    var tokens = result.tokens || [];
    if (!tokens.length) {
      html += '  <p class="p6-token-empty">ไม่มีตัวแปรที่ถูกนับ</p>';
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
  // สร้าง HTML ทั้งบล็อก
  // -------------------------------------------------------------------
  function buildSummaryHTML() {
    // ดึงผลจาก engine
    var results = getResultsFromEngine();
    if (!results || !results.length) {
      return (
        '<section class="p6-panel p6-panel-main">' +
        '  <h3 class="p6-title">ผลการประเมินเบื้องต้น</h3>' +
        '  <p class="p6-muted">ยังไม่มีสัญญาณเด่นพอจากข้อมูลที่กรอก หรือไม่สามารถคำนวณผลได้</p>' +
        "</section>"
      );
    }

    // เอาเฉพาะตัวที่ได้คะแนน > 0 (ตามที่คุณต้องการ โหมด C)
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
        '  <p class="p6-muted">ยังไม่มีสัญญาณเด่นพอจากข้อมูลที่กรอก</p>' +
        "</section>"
      );
    }

    // เรียงมาก -> น้อย
    positives.sort(function (a, b) {
      return b.total - a.total;
    });

    var maxScore = positives[0].total || 1;

    for (var j = 0; j < positives.length; j++) {
      positives[j].percent = toPercent(positives[j].total, maxScore);
    }

    var top5 = positives.slice(0, 5);

    var html = "";

    // ---------------- Block 1 : Top 5 + รายละเอียดตัวแปร ----------------
    html += '<section class="p6-panel p6-panel-main">';
    html += '  <h3 class="p6-title">ผลการประเมินเบื้องต้น</h3>';

    html += '  <div class="p6-card p6-card-top5">';
    html += '    <div class="p6-card-header">📊 สรุปคะแนนความสอดคล้อง (Top 5)</div>';
    html += '    <div class="p6-card-body">';
    for (var k = 0; k < top5.length; k++) {
      var t = top5[k];
      html += renderBarRow(k, t.label || t.key, t.percent);
    }
    html += "    </div>";
    html += "  </div>";

    html +=
      '  <details class="p6-details-variables"><summary class="p6-details-summary">▼ ดูรายละเอียดตัวแปรที่ถูกนับ</summary>';
    html += '    <div class="p6-token-grid">';
    for (var m = 0; m < top5.length; m++) {
      html += renderTokenCard(top5[m]);
    }
    html += "    </div>";
    html += "  </details>";

    html += "</section>";

    // ---------------- Block 2 : กราฟ % เฉพาะ ADR ที่ได้คะแนน ----------------
    html += '<section class="p6-panel p6-panel-all">';
    html +=
      '  <h3 class="p6-title">📈 สรุปคะแนนเป็นเปอร์เซ็นต์ (เฉพาะ ADR ที่ได้คะแนน)</h3>';
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
  // public refresh (เรียกจากปุ่ม "รีเฟรชผลประเมิน")
  // -------------------------------------------------------------------
  function refresh() {
    try {
      hideTopSignalsSection(); // ซ่อนกราฟผลคะแนนย่อยทุกครั้ง

      renderIntoPage6(
        '<div class="p6-loading">กำลังคำนวณผลการประเมิน...</div>'
      );

      // ใช้ setTimeout เล็กน้อยกันหน้าแข็ง
      setTimeout(function () {
        var html = buildSummaryHTML();
        renderIntoPage6(html);
      }, 10);
    } catch (e) {
      console.error("drugAllergyBrain.refresh error:", e);
      renderIntoPage6(
        '<section class="p6-panel"><h3 class="p6-title">ผลการประเมินเบื้องต้น</h3>' +
          '<p class="p6-error">เกิดข้อผิดพลาดระหว่างคำนวณผล กรุณาลองใหม่อีกครั้ง</p></section>'
      );
    }
  }

  // export ให้หน้า 6 เรียกใช้ (อย่าเปลี่ยนชื่อ object นี้)
  window.drugAllergyBrain = {
    refresh: refresh
  };
  // เผื่อโค้ดเก่าเรียกชื่ออื่น
  window.drugAllergyBrain_refresh = refresh;

  // ซ่อน Top signals ตั้งแต่โหลดสคริปต์
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hideTopSignalsSection);
  } else {
    hideTopSignalsSection();
  }
})();

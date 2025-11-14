// ===================== brain.js (REPLACE WHOLE FILE) =====================
// หน้าที่: แปลงผลจาก brain.rules.js → HTML ที่หน้า 6
// - แสดงกราฟแนวนอนครบทั้ง 21 ADR (เรียงตาม % จากมากไปน้อย)
// - แสดงรายละเอียดตัวแปรที่ถูกนับเฉพาะ ADR ที่มีคะแนน
// - ซ่อนการ์ด "กราฟผลคะแนนย่อย (Top signals)" เดิม
// *** ห้ามแก้โค้ดหน้าอื่น ๆ ***

(function () {
  "use strict";

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  function getData() {
    return window.drugAllergyData || {};
  }

  function pad2(n) {
    n = Number(n) || 0;
    return (n < 10 ? "0" : "") + String(n);
  }

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function clampPercent(x) {
    if (!isFinite(x) || x <= 0) return 0;
    if (x > 100) return 100;
    return Math.round(x);
  }

  // ที่วางผลสรุปในหน้า 6
  function renderIntoPage6(html) {
    var box = document.getElementById("p6BrainBox");
    if (!box) return;
    box.innerHTML = html;
  }

  // ซ่อนการ์ด "กราฟผลคะแนนย่อย (Top signals)" โดยไม่ไปยุ่งกับไฟล์หน้าอื่น
  function hideTopSignalsCard() {
    try {
      // ถ้ามี id/class เฉพาะ ใช้ได้เลย (กันไว้ก่อน)
      var byId = document.getElementById("p6TopSignals");
      if (byId) {
        byId.style.display = "none";
        return;
      }

      // ถ้าไม่มีก็ลองหา element ที่มีข้อความหัวข้อดังกล่าว
      var nodes = document.querySelectorAll("section,div");
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (!el || !el.textContent) continue;
        if (el.textContent.indexOf("กราฟผลคะแนนย่อย") !== -1) {
          el.style.display = "none";
          break;
        }
      }
    } catch (e) {
      // เงียบไว้ ไม่ให้หน้าอื่นพัง
      console.warn("hideTopSignalsCard error:", e);
    }
  }

  // ---------------------------------------------------------------------------
  // แปลงกฎ + คะแนน → โครงสร้างที่ใช้วาดกราฟ
  // ---------------------------------------------------------------------------
  function buildResults() {
    var rulesEval = (window.brainRules_vEval && window.brainRules_vEval.computeAll)
      ? window.brainRules_vEval.computeAll()
      : [];

    var rulesToken = window.brainRules || [];

    // map จาก key → {total,tokens}
    var evalMap = Object.create(null);
    if (Array.isArray(rulesEval)) {
      for (var i = 0; i < rulesEval.length; i++) {
        var r = rulesEval[i];
        if (!r || !r.key) continue;
        evalMap[r.key] = r;
      }
    }

    var results = [];

    if (!Array.isArray(rulesToken) || !rulesToken.length) {
      // ไม่มีข้อมูลกฎ token เลย
      return results;
    }

    for (var j = 0; j < rulesToken.length; j++) {
      var rt = rulesToken[j];
      if (!rt || !rt.id) continue;

      var ev = evalMap[rt.id] || { total: 0, tokens: [] };
      var tokens = Array.isArray(rt.tokens) ? rt.tokens : [];

      // คำนวณ maxScore ของ ADR นี้จาก token (mode C: ต่อ-ADR)
      var maxScore = 0;
      for (var k = 0; k < tokens.length; k++) {
        var t = tokens[k];
        var w = t && typeof t.w === "number" ? t.w : 1;
        maxScore += Math.abs(w);
      }
      if (!isFinite(maxScore) || maxScore <= 0) {
        maxScore = 1; // กันศูนย์
      }

      var score = Number(ev.total) || 0;
      var percent = clampPercent((score / maxScore) * 100);

      results.push({
        id: rt.id,
        name: rt.name || (ev && ev.label) || rt.id,
        score: score,
        maxScore: maxScore,
        percent: percent,
        detailTokens: Array.isArray(ev.tokens) ? ev.tokens : []
      });
    }

    // เรียง % จากมากไปน้อย แล้วตามชื่อ
    results.sort(function (a, b) {
      if (b.percent !== a.percent) return b.percent - a.percent;
      var na = a.name || "";
      var nb = b.name || "";
      return na.localeCompare(nb, "th");
    });

    return results;
  }

  // ---------------------------------------------------------------------------
  // สร้าง HTML สำหรับหน้า 6
  // ---------------------------------------------------------------------------
  function buildSummaryHTML() {
    var d = getData();

    // ต้องกดบันทึกหน้า 1–3 ก่อนเท่านั้น (ตรรกะเดิม)
    var ready = !!(
      d.page1 && d.page1.__saved &&
      d.page2 && d.page2.__saved &&
      d.page3 && d.page3.__saved
    );

    if (!ready) {
      return '<div class="p6-muted">ยังไม่มีข้อมูลเพียงพอจากหน้า 1–3 หรือยังไม่คำนวณ</div>';
    }

    var rows = buildResults();
    if (!rows.length) {
      return '<div class="p6-muted">ยังไม่พบผลการประเมินจากกฎที่ตั้งค่าไว้</div>';
    }

    var anyPositive = false;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].score > 0) { anyPositive = true; break; }
    }

    var html = "";

    // หัวการ์ด
    html += '<div class="p6-card p6-main-summary">';
    html += '  <div class="p6-card-header">';
    html += '    <span class="p6-card-title">📊 สรุปคะแนนเป็นเปอร์เซ็นต์ (ครบ 21 ADR)</span>';
    html += '    <span class="p6-card-subtitle">คิดคะแนนเฉพาะตัวแปรที่ถูกติ้กแยกตามแต่ละชนิดการแพ้ยา</span>';
    html += '  </div>';
    html += '  <div class="p6-card-body">';

    // กราฟแนวนอนครบ 21 ADR
    html += '    <div class="p6-bar-list">';
    for (var r = 0; r < rows.length; r++) {
      var row = rows[r];
      var pct = row.percent;
      var rank = pad2(r + 1);

      html += '      <div class="p6-bar-row">';
      html += '        <div class="p6-bar-rank">' + rank + '</div>';
      html += '        <div class="p6-bar-info">';
      html += '          <div class="p6-bar-label">' + escapeHtml(row.name) + '</div>';
      html += '          <div class="p6-bar-track">';
      html += '            <div class="p6-bar-fill" style="width:' + pct + '%;"></div>';
      html += '          </div>';
      html += '        </div>';
      html += '        <div class="p6-bar-percent">' + pct + '%</div>';
      html += '      </div>';
    }
    html += '    </div>'; // .p6-bar-list

    // รายละเอียดตัวแปรที่ถูกนับ
    html += '    <details class="p6-detail-wrapper" open>';
    html += '      <summary>ดูรายละเอียดตัวแปรที่ถูกนับ</summary>';

    if (!anyPositive) {
      html += '      <div class="p6-muted">ยังไม่มีตัวแปรใดเข้าเกณฑ์คะแนนในข้อมูลที่กรอก</div>';
    } else {
      html += '      <div class="p6-detail-grid">';
      for (var j = 0; j < rows.length; j++) {
        var row2 = rows[j];
        if (!row2.detailTokens || !row2.detailTokens.length || row2.score <= 0) continue;

        html += '        <section class="p6-detail-card">';
        html += '          <h4>' + escapeHtml(row2.name) + '</h4>';
        html += '          <ul>';

        for (var tIndex = 0; tIndex < row2.detailTokens.length; tIndex++) {
          var tk = row2.detailTokens[tIndex];
          if (!tk || !tk.label) continue;
          var wtxt = (tk.w && tk.w !== 1) ? " (x" + tk.w + ")" : "";
          html += '            <li>' + escapeHtml(tk.label) + wtxt + '</li>';
        }

        html += '          </ul>';
        html += '        </section>';
      }
      html += '      </div>'; // .p6-detail-grid
    }

    html += '    </details>'; // details
    html += '  </div>'; // card body
    html += '</div>'; // card

    return html;
  }

  // ---------------------------------------------------------------------------
  // Trigger คำนวณ + render
  // ---------------------------------------------------------------------------
  function recomputeAndRender() {
    hideTopSignalsCard();
    var html;
    try {
      html = buildSummaryHTML();
    } catch (e) {
      console.error("brain.js: buildSummaryHTML error", e);
      html = '<div class="p6-error">เกิดข้อผิดพลาดในการคำนวณผลการประเมิน</div>';
    }
    renderIntoPage6(html);
  }

  // เผย API เล็ก ๆ เผื่อหน้าอื่นเรียก
  window.drugAllergyBrain = {
    recompute: recomputeAndRender,
    _buildResults: buildResults
  };

  // ฟัง event จากหน้าอื่น ๆ
  window.addEventListener("da:update", recomputeAndRender);
  window.addEventListener("da:recompute", recomputeAndRender);

  // เผื่อโหลดหน้า 6 หลังจาก DOM พร้อม
  document.addEventListener("DOMContentLoaded", function () {
    // จะ render แค่ถ้ามี p6BrainBox จริง
    if (document.getElementById("p6BrainBox")) {
      recomputeAndRender();
    }
  });
})();

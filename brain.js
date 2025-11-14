// ===================== brain.js (REPLACE WHOLE FILE) =====================
// สมองหน้า 6: แสดงผลคะแนน ADR ทั้ง 21 ตัวแบบเปอร์เซ็นต์ + รายละเอียดตัวแปรที่ถูกนับ
// - ใช้ผลคำนวณจาก window.brainComputeAndRender() / window.brainResult (brain.rules.js โหมด C)
// - คิดคะแนนแบบ "ต่อ-ADR" (mode C) ไม่เอาเกณฑ์ของ ADR อื่นมาปน
// - ซ่อนการ์ด "กราฟผลคะแนนย่อย (Top signals)" เดิม แล้วใช้การ์ดนี้แทน

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

  // จุดที่ใช้เรนเดอร์ในหน้า 6 (มีอยู่แล้วตั้งแต่เวอร์ชันก่อน)
  function renderIntoPage6(html) {
    var box = document.getElementById("p6BrainBox");
    if (!box) return;
    box.innerHTML = html;
  }

  // ซ่อนการ์ด "กราฟผลคะแนนย่อย (Top signals)"
  function hideTopSignalsCard() {
    try {
      var byId = document.getElementById("p6TopSignals");
      if (byId) {
        byId.style.display = "none";
        return;
      }
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
      console.warn("hideTopSignalsCard error:", e);
    }
  }

  // ---------------------------------------------------------------------------
  // ดึงผลคะแนนจาก brain.rules.js (โหมด C ตัวใหม่)
  // ---------------------------------------------------------------------------
  function getBrainResultFromRules() {
    var all = null;

    // ถ้ามีฟังก์ชันสมองโดยตรง ให้เรียกก่อน (ถึงแม้มันจะเรนเดอร์ของตัวเอง เราจะเขียนทับทีหลัง)
    if (typeof window.brainComputeAndRender === "function") {
      try {
        all = window.brainComputeAndRender();
      } catch (e) {
        console.error("brain.js: brainComputeAndRender error", e);
      }
    }

    // fallback: ใช้ค่าแคช global ถ้ามี
    if (!all && window.brainResult) {
      all = window.brainResult;
    }

    if (!all || typeof all !== "object") {
      all = { results: {}, scoresForChart: {} };
    }
    if (!all.results) all.results = {};
    if (!all.scoresForChart) all.scoresForChart = {};
    return all;
  }

  function buildResults() {
    var all = getBrainResultFromRules(); // {results: {id: {...}}, scoresForChart:{}}
    var resMap = all.results || {};
    var results = [];

    // แปลงผลจาก brain.rules.js → โครงสร้างที่ brain.js ใช้
    Object.keys(resMap).forEach(function (key) {
      var r = resMap[key] || {};
      var name = r.label || r.id || key;
      var raw = Number(r.raw) || 0;
      var max = Number(r.max) || 0;
      if (!isFinite(max) || max <= 0) max = 1;
      var pct = r.percent;
      if (!isFinite(pct)) {
        pct = (raw / max) * 100;
      }
      pct = clampPercent(pct);

      // matchedMajors: รายชื่อ "ข้อใหญ่" ที่เข้าเกณฑ์ → แปลงเป็น token สำหรับโชว์ใน details
      var majors = Array.isArray(r.matchedMajors) ? r.matchedMajors : [];
      var detailTokens = majors.map(function (label) {
        return { label: label, w: 1 };
      });

      results.push({
        id: r.id || key,
        name: name,
        score: raw,
        maxScore: max,
        percent: pct,
        detailTokens: detailTokens
      });
    });

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
  // สร้าง HTML สรุป (หน้า 6)
  // ---------------------------------------------------------------------------
  function buildSummaryHTML() {
    var d = getData();

    // ต้องมีข้อมูลหน้า 1 และ 2 (อนุโลมว่า lab หน้า 3 ยังไม่กรอก/ยังไม่บันทึกก็ให้คิดได้)
    var hasP1 =
      d.page1 &&
      (d.page1.__saved || Object.keys(d.page1).length > 0);
    var hasP2 =
      d.page2 &&
      (d.page2.__saved || Object.keys(d.page2).length > 0);

    if (!hasP1 || !hasP2) {
      return '<div class="p6-muted">ยังไม่มีข้อมูลเพียงพอจากหน้า 1–2 หรือยังไม่คำนวณ</div>';
    }

    var rows = buildResults();
    if (!rows.length) {
      return '<div class="p6-muted">ยังไม่พบผลการประเมินจากกฎที่ตั้งค่าไว้</div>';
    }

    var anyPositive = false;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].score > 0) {
        anyPositive = true;
        break;
      }
    }

    var html = "";

    // การ์ดหลัก: สรุปเปอร์เซ็นต์ทั้ง 21 ADR
    html += '<div class="p6-card p6-main-summary">';
    html += '  <div class="p6-card-header">';
    html += '    <span class="p6-card-title">📊 สรุปคะแนนเป็นเปอร์เซ็นต์ (ครบ 21 ADR)</span>';
    html += '    <span class="p6-card-subtitle">คิดคะแนนเฉพาะตัวแปรที่ถูกติ้ก แยกตามชนิดการแพ้ยาแต่ละข้อ</span>';
    html += '  </div>';
    html += '  <div class="p6-card-body">';

    // กราฟแท่งแนวนอน
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
    html += '      <summary>ดูรายละเอียดตัวแปรที่ถูกนับ (เฉพาะ ADR ที่มีคะแนน)</summary>';

    if (!anyPositive) {
      html += '      <div class="p6-muted">ยังไม่มีตัวแปรเข้าเกณฑ์คะแนนในข้อมูลที่กรอก</div>';
    } else {
      html += '      <div class="p6-detail-grid">';
      for (var j = 0; j < rows.length; j++) {
        var row2 = rows[j];
        if (!row2.detailTokens || !row2.detailTokens.length || row2.score <= 0)
          continue;

        html += '        <section class="p6-detail-card">';
        html += '          <h4>' + escapeHtml(row2.name) + '</h4>';
        html += '          <ul>';
        for (var tIndex = 0; tIndex < row2.detailTokens.length; tIndex++) {
          var tk = row2.detailTokens[tIndex];
          if (!tk || !tk.label) continue;
          var wtxt = tk.w && tk.w !== 1 ? " (x" + tk.w + ")" : "";
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
  // คำนวณ + render
  // ---------------------------------------------------------------------------
  function recomputeAndRender() {
    hideTopSignalsCard();
    var html;
    try {
      html = buildSummaryHTML();
    } catch (e) {
      console.error("brain.js: buildSummaryHTML error", e);
      html =
        '<div class="p6-error">เกิดข้อผิดพลาดในการคำนวณผลการประเมิน</div>';
    }
    renderIntoPage6(html);
  }

  // ผูกปุ่ม "รีเฟรชผลประเมิน" (ค้นหาจากข้อความบนปุ่ม เพื่อไม่ต้องเดา id)
  function hookRefreshButton() {
    try {
      var btns = document.querySelectorAll("button");
      for (var i = 0; i < btns.length; i++) {
        var b = btns[i];
        if (!b || !b.textContent) continue;
        if (b.textContent.indexOf("รีเฟรชผลประเมิน") !== -1) {
          b.addEventListener("click", function (ev) {
            ev.preventDefault();
            recomputeAndRender();
          });
          break;
        }
      }
    } catch (e) {
      console.warn("hookRefreshButton error:", e);
    }
  }

  // เผย API ไว้เผื่อหน้าอื่นเรียก
  window.drugAllergyBrain = {
    recompute: recomputeAndRender
  };

  // ฟัง event จากหน้าอื่น (เมื่อกดบันทึกหน้า 1–3)
  window.addEventListener("da:update", recomputeAndRender);
  window.addEventListener("da:recompute", recomputeAndRender);

  // พยายาม hook ปุ่ม + แสดงผลทันทีที่โหลดสคริปต์
  hookRefreshButton();
  recomputeAndRender();

  // กันกรณี element ยังไม่อยู่ตอนโหลดสคริปต์
  document.addEventListener("DOMContentLoaded", function () {
    hookRefreshButton();
    recomputeAndRender();
  });
})();

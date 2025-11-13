// ===================== brain.js (REPLACE WHOLE FILE) =====================
(function () {
  // -------------------- helpers --------------------
  function renderIntoPage6(html) {
    var box = document.getElementById("p6BrainBox");
    if (!box) return;
    box.innerHTML = html;
  }

  // หน้าไหนต้อง "บันทึก" ก่อนถึงจะยอมคำนวณ
  // ==> หน้า 1 และ 2 ต้องมี __saved; หน้า 3 (Lab) เป็น optional
  function corePagesReady() {
    var d = window.drugAllergyData || {};
    var p1ok = !!(d.page1 && d.page1.__saved);
    var p2ok = !!(d.page2 && d.page2.__saved);
    return { ok: p1ok && p2ok, hasP3: !!(d.page3 && d.page3.__saved) };
  }

  // ใส่สไตล์กราฟแนวนอนครั้งเดียว
  function ensureStyles() {
    if (document.getElementById("p6-brain-style")) return;
    var css = `
      #p6BrainBox { font-size: 0.92rem; color:#111827; }
      .p6-brain-wrap{margin-top:0.25rem;}
      .p6-brain-row{
        display:grid;
        grid-template-columns: minmax(140px, 220px) 1fr 40px;
        gap:10px;
        align-items:center;
        margin:0.25rem 0;
      }
      .p6-brain-label{white-space:normal;}
      .p6-brain-bar{
        position:relative;
        height:16px;
        border-radius:999px;
        overflow:hidden;
        background:#f3f4f6;
      }
      .p6-brain-bar-fill{
        height:100%;
        border-radius:999px;
        background:linear-gradient(90deg,#7c3aed 0%,#06b6d4 100%);
        transition:width .35s ease;
      }
      .p6-brain-val{
        text-align:right;
        font-weight:700;
        font-size:0.8rem;
      }
      .p6-brain-summary{
        font-weight:600;
        margin-bottom:0.35rem;
      }
      .p6-muted{
        color:#6b7280;
        font-size:0.9rem;
      }
    `;
    var tag = document.createElement("style");
    tag.id = "p6-brain-style";
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  // -------------------- main compute + render --------------------
  function brainComputeAndRender() {
    ensureStyles();

    var ready = corePagesReady();
    if (!ready.ok) {
      renderIntoPage6(
        '<div class="p6-muted">ยังไม่มีข้อมูลเพียงพอจากหน้า 1–2 หรือยังไม่ได้กดบันทึก</div>'
      );
      return;
    }

    if (typeof window.brainRank !== "function") {
      renderIntoPage6(
        '<div class="p6-muted">ยังไม่พบโมดูลสมอง (brain.rules.js) กรุณาตรวจสอบว่าโหลดไฟล์ดังกล่าวแล้ว</div>'
      );
      return;
    }

    // ใช้โหมด C จาก brain.rules.js (แมตช์ตรงตัว, ไม่ปนข้อใหญ่)
    var out = window.brainRank("C") || {};
    var results = Array.isArray(out.results) ? out.results.slice() : [];

    // เรียงจาก % มาก → น้อย เผื่อ brainRank ยังไม่ได้ sort
    results.sort(function (a, b) {
      return (b.pctC || 0) - (a.pctC || 0);
    });

    // ถ้าทุกตัวเป็น 0 ให้แสดงข้อความแทนกราฟ
    var hasSignal = results.some(function (r) {
      return (r.pctC || 0) > 0;
    });

    if (!results.length || !hasSignal) {
      renderIntoPage6(
        '<div class="p6-muted">ยังไม่มีสัญญาณเด่นพอจากข้อมูลที่กรอก</div>'
      );
      return;
    }

    // สรุปตัวที่เด่นสุด
    var top = results[0];
    var summaryHtml =
      '<div class="p6-brain-summary">ผลเด่น: <strong>' +
      (top.title || top.name || top.key || "-") +
      "</strong> (" +
      (top.pctC || 0) +
      "%)</div>";

    // วาดกราฟ 21 แถว (หรือเท่าที่ brainRank คืนมา) ตามลำดับคะแนน
    var rows = results
      .map(function (r) {
        var name = r.title || r.name || r.phenotype || r.key;
        var pct = r.pctC || 0;
        return (
          '<div class="p6-brain-row">' +
          '<div class="p6-brain-label">' +
          name +
          "</div>" +
          '<div class="p6-brain-bar">' +
          '<div class="p6-brain-bar-fill" style="width:' +
          pct +
          '%;"></div>' +
          "</div>" +
          '<div class="p6-brain-val">' +
          pct +
          "%</div>" +
          "</div>"
        );
      })
      .join("");

    renderIntoPage6('<div class="p6-brain-wrap">' + summaryHtml + rows + "</div>");
  }

  // -------------------- public API & hooks --------------------
  window.brainComputeAndRender = brainComputeAndRender;
  // ให้โค้ดเก่าเรียกชื่อเดิมได้ด้วย
  window.evaluateDrugAllergy = brainComputeAndRender;
  window.refreshBrain = brainComputeAndRender;

  // เมื่อหน้า 1–3 กดบันทึกแล้วยิง event da:update → คำนวณใหม่
  document.addEventListener("da:update", brainComputeAndRender);

  // เผื่อโหลดหน้า 6 ตอนข้อมูลพร้อมแล้ว ให้ลองคำนวณครั้งแรกเลย
  setTimeout(brainComputeAndRender, 0);
})();

// ===================== brain.js (REPLACE WHOLE FILE) =====================
(function () {
  // ===== จุดหมายเรนเดอร์: เฉพาะหน้า 6 =====
  function renderIntoPage6(html) {
    var box = document.getElementById("p6BrainBox");
    if (!box) return;
    box.innerHTML = html;
  }

  // ===== ใส่สไตล์กราฟแนวนอน (เหมือนเวอร์ชันเดิม) =====
  function ensureStyle() {
    if (document.getElementById("p6-style")) return;
    var st = document.createElement("style");
    st.id = "p6-style";
    st.textContent = `
      #p6BrainBox .p6-card{
        background:#fff;
        border:1px solid rgba(0,0,0,.06);
        border-radius:14px;
        padding:14px;
        box-shadow:0 10px 24px rgba(0,0,0,.06);
      }
      #p6BrainBox .p6-head{
        font-weight:800;
        color:#111827;
        margin-bottom:6px;
      }
      #p6BrainBox .p6-sub{
        font-size:.92rem;
        color:#374151;
        margin-bottom:10px;
      }
      #p6BrainBox .p6-row{
        display:grid;
        grid-template-columns:220px 1fr 48px;
        align-items:center;
        gap:10px;
        margin:.35rem 0;
      }
      #p6BrainBox .p6-label{
        color:#111827;
        font-size:.9rem;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }
      #p6BrainBox .p6-bar{
        height:14px;
        background:#f3f4f6;
        border-radius:999px;
        overflow:hidden;
      }
      #p6BrainBox .p6-fill{
        height:100%;
        background:linear-gradient(90deg,#7c3aed,#06b6d4);
        transition:width .35s ease;
      }
      #p6BrainBox .p6-val{
        text-align:right;
        font-weight:700;
        color:#111827;
        font-size:.9rem;
      }
      #p6BrainBox .p6-muted{
        font-size:.9rem;
        color:#6b7280;
      }
    `;
    document.head.appendChild(st);
  }

  // ===== ดึงคะแนนจาก brain.rules.js โหมด C =====
  function getScoresFromBrainRules() {
    // ถ้าไฟล์ brain.rules.js ยังไม่โหลด หรือไม่มี brainRank → บอกว่ายังไม่พร้อม
    if (typeof window.brainRank !== "function") {
      return { ready: false, results: [], top: null, anySignal: false };
    }

    // brainRank("C") จะไป collect token จากหน้า 1–3 และคิดคะแนนให้ทุก ADR
    var ranked = window.brainRank("C") || {};
    var list = Array.isArray(ranked.results) ? ranked.results.slice() : [];

    // แปลงโครงสร้างให้เหลือ (key, title, score) แล้ว sort มาก→น้อย
    var results = list
      .map(function (r) {
        return {
          key: r.key || "",
          title: r.title || r.name || r.phenotype || r.key || "",
          score: typeof r.pctC === "number" ? r.pctC : 0
        };
      })
      .sort(function (a, b) {
        return (b.score || 0) - (a.score || 0);
      });

    if (!results.length) {
      return { ready: true, results: [], top: null, anySignal: false };
    }

    var top = results[0];
    for (var i = 0; i < results.length; i++) {
      if (results[i].score > top.score) top = results[i];
    }
    var anySignal = results.some(function (r) { return r.score > 0; });

    return { ready: true, results: results, top: top, anySignal: anySignal };
  }

  // ===== คำนวณ + สร้าง HTML กราฟ 21 ADR =====
  function compute() {
    ensureStyle();

    var info = getScoresFromBrainRules();
    var ready = info.ready;
    var results = info.results;
    var top = info.top;
    var anySignal = info.anySignal;

    // อัปเดตตัวแปร global เผื่อหน้า 6 ส่วนอื่นจะใช้ต่อ
    window.brainScores = results || [];
    window.brainTop = top || null;
    window.brainLabels = (results || []).map(function (r) { return r.title; });
    window.brainValues = (results || []).map(function (r) { return r.score; });
    window.brainReady = !!anySignal;
    document.dispatchEvent(new Event("brain:update"));

    // ถ้า brain.rules.js ยังไม่พร้อม
    if (!ready) {
      renderIntoPage6(
        '<div class="p6-card"><div class="p6-muted">สมองประเมิน ADR (brain.rules.js) ยังไม่พร้อมใช้งาน</div></div>'
      );
      return;
    }

    // ถ้ายังไม่มีผลเลย
    if (!results.length) {
      renderIntoPage6(
        '<div class="p6-card"><div class="p6-muted">ยังไม่มีข้อมูลเพียงพอ ระบบจะแสดงกราฟเมื่อมีการกรอกข้อมูลในหน้า 1–3</div></div>'
      );
      return;
    }

    var summary = anySignal
      ? 'ระบบพบลักษณะเด่นที่เข้าได้มากที่สุดกับ <strong>' +
        (top.title || '-') +
        "</strong> (" + (top.score || 0) + '%)'
      : "ยังไม่มีสัญญาณเด่นพอจากข้อมูลที่กรอก ระบบจะแสดงคะแนนเมื่อมีการกรอกข้อมูลเพิ่ม";

    var rows = results
      .map(function (r) {
        return (
          '<div class="p6-row">' +
            '<div class="p6-label">' + r.title + "</div>" +
            '<div class="p6-bar"><div class="p6-fill" style="width:' + r.score + '%"></div></div>' +
            '<div class="p6-val">' + r.score + "%</div>" +
          "</div>"
        );
      })
      .join("");

    renderIntoPage6(
      '<div class="p6-card">' +
        '<div class="p6-head">ผลการประเมินเบื้องต้น</div>' +
        '<div class="p6-sub">' + summary + "</div>" +
        rows +
      "</div>"
    );
  }

  // ===== Public API =====
  window.evaluateDrugAllergy = compute; // ใช้กับปุ่ม "รีเฟรชผลประเมิน"
  window.refreshBrain = compute;

  // คำนวณใหม่ทุกครั้งที่มี event จากหน้า 1–3
  document.addEventListener("da:update", compute);

  // คำนวณครั้งแรกหลังโหลดไฟล์
  setTimeout(compute, 0);
})();

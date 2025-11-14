// ===================== brain.js (REPLACE WHOLE FILE) =====================
(function () {
  // ===== จุดหมายการเรนเดอร์หน้า 6 =====
  function getBox() {
    return document.getElementById("p6BrainBox");
  }
  function renderIntoPage6(html) {
    var box = getBox();
    if (box) box.innerHTML = html;
  }

  // ===== ซ่อนกราฟคะแนนย่อย (เฉพาะ id ที่รู้จักเท่านั้น) =====
  function hideMinorSignalsSafely() {
    ["p6MiniSignals", "p6MinorSignalsBox", "p6TopSignals", "p6SignalsChart"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
    // ไม่ทำ text-scan ทั้งหน้า เพื่อป้องกันข้อมูลส่วนอื่นหาย
  }

  // ===== Helper: อ่านสัญญาณจากหน้า 1–3 (นับเฉพาะที่ติ๊ก/เลือก) =====
  function collectSignals() {
    var d = window.drugAllergyData || {};
    var p1 = d.page1 || {};
    var p2 = d.page2 || {};
    var p3 = d.page3 || {};

    var set = new Set();

    // ---- หน้า 1 ----
    (p1.rashShapes || []).forEach((s) => set.add("shape:" + s));
    (p1.rashColors || []).forEach((c) => set.add("color:" + c));

    if (p1.blisters?.small) set.add("derm:ตุ่มน้ำเล็ก");
    if (p1.blisters?.medium) set.add("derm:ตุ่มน้ำกลาง");
    if (p1.blisters?.large) set.add("derm:ตุ่มน้ำใหญ่");

    if (p1.skinDetach?.center) set.add("derm:ผิวหนังหลุดลอกตรงกลางผื่น");
    if (p1.skinDetach?.lt10) set.add("derm:ผิวหลุด<10%");
    if (p1.skinDetach?.gt30) set.add("derm:ผิวหลุด>30%");

    if (p1.scales?.scale) set.add("derm:ขุย");
    if (p1.scales?.dry) set.add("derm:แห้ง");
    if (p1.scales?.peel) set.add("derm:ลอก");

    if (p1.exudate?.serous) set.add("derm:น้ำเหลือง");
    if (p1.exudate?.crust) set.add("derm:สะเก็ด");

    if (p1.itch?.has) set.add("derm:คัน");
    if (p1.itch?.none) set.add("derm:ไม่คัน");

    if (p1.pain?.pain) set.add("derm:เจ็บ");
    if (p1.pain?.burn) set.add("derm:แสบ");
    if (p1.pain?.sore) set.add("derm:เจ็บ");

    if (p1.swelling?.has) set.add("derm:บวม");
    if (p1.pustule?.has) set.add("derm:ตุ่มหนอง");

    (p1.locations || []).forEach((loc) => set.add("pos:" + loc));
    if (p1.distribution === "สมมาตร") set.add("pos:สมมาตร");
    if (p1.mucosalCountGt1) set.add("mucosa:>1");

    switch (p1.onset) {
      case "1h": set.add("onset:1h"); break;
      case "1to6h": set.add("onset:1-6h"); break;
      case "6to24h": set.add("onset:6-24h"); break;
      case "1w": set.add("onset:1w"); break;
      case "2w": set.add("onset:2w"); break;
      case "3w": set.add("onset:3w"); break;
      case "4w": set.add("onset:4w"); break;
    }

    // ---- หน้า 2 ----
    if (p2?.resp?.wheeze) set.add("sys:wheeze");
    if (p2?.resp?.dyspnea) set.add("sys:dyspnea");
    if (p2?.cv?.hypotension) set.add("sys:hypotension");
    if (p2?.cv?.shock) set.add("sys:bp_drop");
    if (typeof p2?.SpO2 === "number" && p2.SpO2 < 94) set.add("sys:SpO2<94");

    if (p2?.gi?.nausea) set.add("sys:คลื่นไส้อาเจียน");
    if (p2?.gi?.dysphagia) set.add("sys:กลืนลำบาก");
    if (p2?.gi?.diarrhea) set.add("sys:ท้องเสีย");
    if (p2?.gi?.cramp) set.add("sys:ปวดบิดท้อง");

    if (p2?.misc?.conjunctivitis) set.add("sys:เยื่อบุตาอักเสบ");
    if (p2?.misc?.soreThroat) set.add("sys:เจ็บคอ");
    if (p2?.misc?.fever) set.add("sys:ไข้");
    if (p2?.misc?.fatigue) set.add("sys:อ่อนเพลีย");
    if (p2?.misc?.chill) set.add("sys:หนาวสั่น");

    if (p2?.misc?.petechiae) set.add("derm:จุดเลือดออก");
    if (p2?.misc?.hemorrhageSkin) set.add("derm:ปื้น/จ้ำเลือด");

    if (p2?.misc?.["ปัสสาวะสีชา/สีดำ"]) set.add("sys:ปัสสาวะสีชา/สีดำ");
    if (p2?.misc?.["ปัสสาวะออกน้อย"]) set.add("sys:ปัสสาวะออกน้อย");
    if (p2?.misc?.["ปัสสาวะขุ่น"]) set.add("sys:ปัสสาวะขุ่น");

    var org = p2?.organsFlags || {};
    if (org.kidneyFail) set.add("organ:AKI");
    if (org.hepatitis) set.add("organ:hepatitis");
    if (org.pneumonia) set.add("organ:pneumonia");
    if (org.myocarditis) set.add("organ:myocarditis");

    // ---- หน้า 3 ----
    function labChecked(group, item) {
      var g = p3[group];
      var row = g && g[item];
      return !!(row && row.checked);
    }
    function labNumber(group, item) {
      var g = p3[group];
      var row = g && g[item];
      var v = row && row.value;
      var n = Number((v || "").toString().replace(/[, ]+/g, ""));
      return Number.isFinite(n) ? n : NaN;
    }

    if (labChecked("cbc", "eos")) {
      var eop = labNumber("cbc", "eos");
      if (eop >= 10) set.add("lab:Eo>=10");
      if (eop > 5) set.add("lab:Eo>5");
    }
    if (labChecked("cbc", "wbc") && labNumber("cbc", "wbc") > 11000) set.add("lab:WBC>11000");
    if (labChecked("cbc", "neut") && labNumber("cbc", "neut") > 75) set.add("lab:Neut>75");

    if (labChecked("lft", "ast") || labChecked("lft", "alt")) {
      var ast = labChecked("lft", "ast") ? labNumber("lft", "ast") : NaN;
      var alt = labChecked("lft", "alt") ? labNumber("lft", "alt") : NaN;
      if ((ast >= 40 && !isNaN(ast)) || (alt >= 40 && !isNaN(alt))) set.add("lab:ALT/AST>=40");
    }

    if (labChecked("rft", "egfr") && labNumber("rft", "egfr") < 60) set.add("lab:eGFR<60");
    if (labChecked("ua", "protein")) set.add("lab:UA:protein+");

    if (labChecked("lung", "spo2") && labNumber("lung", "spo2") < 94) set.add("sys:SpO2<94");

    return set;
  }

  // ===== คำนวณคะแนนแต่ละ ADR =====
  function computeScores(signals) {
    var tokenRules = Array.isArray(window.brainRules) ? window.brainRules : [];

    // Fallback: ถ้าไม่มี tokenRules ให้ใช้เครื่องยนต์ eval (ถ้ามี)
    if (!tokenRules.length && window.brainRules_vEval && typeof window.brainRules_vEval.computeAll === "function") {
      var evalResults = window.brainRules_vEval.computeAll() || [];
      tokenRules = evalResults.map(function (r) {
        return { id: r.key || r.id, name: r.label || r.name || r.key, tokens: [{ key: "__eval__:" + (r.key || r.id), w: Math.max(0, r.total || 0) }] };
      });
      evalResults.forEach(function (r) { signals.add("__eval__:" + (r.key || r.id)); });
    }

    // ถ้ายังไม่มี rule เลย ให้คืนอาร์เรย์ว่าง (จะไม่ไปแตะกล่องหน้า 6)
    if (!tokenRules.length) return [];

    var results = tokenRules.map(function (adr) {
      var score = 0;
      (adr.tokens || []).forEach(function (tok) {
        var key = typeof tok === "string" ? tok : tok.key;
        var w = typeof tok === "string" ? 1 : (tok.w || 1);
        if (signals.has(key)) score += w;
      });
      return { id: adr.id, name: adr.name || adr.label || adr.id, score: score };
    });

    // เรียงมาก→น้อย (แสดงครบทั้งหมด 21 ADR หากตั้งไว้ใน tokenRules)
    results.sort(function (a, b) { return b.score - a.score; });
    return results;
  }

  // ===== เรนเดอร์ผลเป็นเปอร์เซ็นต์ (เทียบอันดับ 1) =====
  function renderResults(results) {
    if (!Array.isArray(results) || !results.length) {
      // ไม่มีผลลัพธ์: ไม่แตะกล่อง เพื่อป้องกันข้อมูลเดิมหาย
      return;
    }

    var max = results[0].score > 0 ? results[0].score : 1;
    var rows = results.map(function (r, idx) {
      var pct = Math.round((r.score / max) * 100);
      return `
        <div style="display:flex;align-items:center;gap:.6rem;margin:.35rem 0;">
          <div style="flex:0 0 2.2rem;text-align:right;font-weight:700;color:#9d174d;">${String(idx+1).padStart(2,"0")}</div>
          <div style="flex:1 1 auto;">
            <div style="display:flex;justify-content:space-between;gap:.5rem;">
              <div style="font-weight:700;color:#4a044e">${escapeHTML(r.name)}</div>
              <div style="font-weight:800;color:#4a044e">${pct}%</div>
            </div>
            <div style="height:14px;background:#fde7f2;border-radius:999px;overflow:hidden;border:1px solid rgba(236,72,153,.3);">
              <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#fbcfe8,#f9a8d4,#f472b6);"></div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    var html = `
      <div class="p6-card" style="background:linear-gradient(180deg,#ffeaf4 0%,#fff7fb 60%,#ffffff 100%);border:1px solid rgba(236,72,153,.25);border-radius:1.2rem;padding:1rem 1rem 1.2rem;box-shadow:0 10px 24px rgba(236,72,153,.15);">
        <h3 style="margin:0 0 .6rem;font-weight:800;color:#9d174d;">📊 สรุปคะแนนความสอดคล้อง (เป็น % เทียบอันดับ 1)</h3>
        <div style="display:flex;flex-direction:column">${rows}</div>
      </div>
    `;
    renderIntoPage6(html);
  }

  function escapeHTML(s) {
    return String(s || "").replace(/[&<>"']/g, function (m) {
      return ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[m];
    });
  }

  // ===== ฟังก์ชันหลัก =====
  function evaluate() {
    hideMinorSignalsSafely(); // ซ่อนกราฟย่อยเฉพาะบล็อกที่ระบุ
    var box = getBox();
    if (!box) return; // ยังไม่เข้าหน้า 6 — รอให้มีกล่องก่อน

    var signals = collectSignals();
    var results = computeScores(signals);
    renderResults(results);
    return results;
  }

  // ===== ให้หน้าอื่นเรียกได้ =====
  window.evaluateDrugAllergy = evaluate;

  // ===== Re-render เมื่อมี #p6BrainBox โผล่ (เช่น เปลี่ยนแท็บ) =====
  var mo;
  function ensureRenderWhenBoxAvailable() {
    if (getBox()) {
      try { evaluate(); } catch {}
      return;
    }
    if (!mo) {
      mo = new MutationObserver(function () {
        if (getBox()) {
          try { evaluate(); } catch {}
        }
      });
      mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
    }
  }

  // ===== Hooks =====
  document.addEventListener("da:update", function () {
    try { evaluate(); } catch (e) {}
  });
  document.addEventListener("DOMContentLoaded", ensureRenderWhenBoxAvailable);
  setTimeout(ensureRenderWhenBoxAvailable, 0);
})();

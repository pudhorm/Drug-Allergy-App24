// ===================== brain.js (REPLACE WHOLE FILE) =====================
(function () {
  // ===== จุดหมายการเรนเดอร์หน้า 6 =====
  function renderIntoPage6(html) {
    var box = document.getElementById("p6BrainBox");
    if (box) box.innerHTML = html;
  }

  // ===== Helper: อ่านค่าจากหน้า 1–3 แบบ "นับเฉพาะที่ติ๊ก/เลือก" =====
  function collectSignals() {
    var d = window.drugAllergyData || {};
    var p1 = d.page1 || {};
    var p2 = d.page2 || {};
    var p3 = d.page3 || {};

    var set = new Set();

    // ---- หน้า 1: รูปร่าง ----
    (p1.rashShapes || []).forEach((s) => set.add("shape:" + s));
    if (p1.rashShapesOther && p1.rashShapesOther.trim()) set.add("shape:อื่นๆ");

    // สี
    (p1.rashColors || []).forEach((c) => set.add("color:" + c));
    if (p1.rashColorsOther && p1.rashColorsOther.trim()) set.add("color:อื่นๆ");

    // ตุ่มน้ำ
    if (p1.blisters?.small) set.add("derm:ตุ่มน้ำเล็ก");
    if (p1.blisters?.medium) set.add("derm:ตุ่มน้ำกลาง");
    if (p1.blisters?.large) set.add("derm:ตุ่มน้ำใหญ่");

    // ผิวหลุดลอก
    if (p1.skinDetach?.center) set.add("derm:ผิวหนังหลุดลอกตรงกลางผื่น");
    if (p1.skinDetach?.lt10) set.add("derm:ผิวหลุด<10%");
    if (p1.skinDetach?.gt30) set.add("derm:ผิวหลุด>30%");

    // ขุย/แห้ง/ลอก
    if (p1.scales?.scale) set.add("derm:ขุย");
    if (p1.scales?.dry) set.add("derm:แห้ง");
    if (p1.scales?.peel) set.add("derm:ลอก");

    // น้ำเหลือง/สะเก็ด
    if (p1.exudate?.serous) set.add("derm:น้ำเหลือง");
    if (p1.exudate?.crust) set.add("derm:สะเก็ด");

    // คัน
    if (p1.itch?.has) set.add("derm:คัน");
    if (p1.itch?.none) set.add("derm:ไม่คัน");

    // ปวด/แสบ/เจ็บ/ตึง
    if (p1.pain?.pain) set.add("derm:เจ็บ");
    if (p1.pain?.burn) set.add("derm:แสบ");
    if (p1.pain?.sore) set.add("derm:เจ็บ");
    if (p1.pain?.tight) set.add("derm:ตึง");

    // บวม
    if (p1.swelling?.has) set.add("derm:บวม");

    // ตุ่มหนอง
    if (p1.pustule?.has) set.add("derm:ตุ่มหนอง");

    // ตำแหน่ง
    (p1.locations || []).forEach((loc) => set.add("pos:" + loc));
    if (p1.distribution === "สมมาตร") set.add("pos:สมมาตร");
    if (p1.mucosalCountGt1) set.add("mucosa:>1");

    // Onset
    switch (p1.onset) {
      case "1h": set.add("onset:1h"); break;
      case "1to6h": set.add("onset:1-6h"); break;
      case "6to24h": set.add("onset:6-24h"); break;
      case "1w": set.add("onset:1w"); break;
      case "2w": set.add("onset:2w"); break;
      case "3w": set.add("onset:3w"); break;
      case "4w": set.add("onset:4w"); break;
      default: break;
    }

    // ---- หน้า 2 ----
    if (p2?.resp?.wheeze) set.add("sys:wheeze");
    if (p2?.resp?.dyspnea) set.add("sys:dyspnea");

    if (p2?.cv?.hypotension) set.add("sys:hypotension");
    if (p2?.cv?.shock) set.add("sys:bp_drop");

    if (p2?.examHRHigh || (typeof p2?.HR === "number" && p2.HR > 100)) set.add("sys:HR>100");
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

    // ---- หน้า 3: Lab ----
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

    if (labChecked("cbc", "wbc")) {
      var wbc = labNumber("cbc", "wbc");
      if (wbc > 11000) set.add("lab:WBC>11000");
      if (wbc < 4000) set.add("lab:WBC<4000");
    }
    if (labChecked("cbc", "eos")) {
      var eop = labNumber("cbc", "eos");
      if (eop >= 10) set.add("lab:Eo>=10");
      if (eop > 5) set.add("lab:Eo>5");
    }
    if (labChecked("cbc", "neut")) {
      var np = labNumber("cbc", "neut");
      if (np > 75) set.add("lab:Neut>75");
    }
    if (labChecked("cbc", "hb")) {
      var hb = labNumber("cbc", "hb");
      if (hb < 10) set.add("lab:Hb<10");
      if ((p3.cbc.hb.detail || "").includes("↓≥2-3")) set.add("lab:Hb↓≥2-3g/dL/48h");
    }
    if (labChecked("cbc", "plt")) {
      var plt = labNumber("cbc", "plt");
      if (plt < 100000) set.add("lab:Plt<100k");
      if (plt < 150000) set.add("lab:Plt<150k");
    }
    if (labChecked("cbc", "atypical")) {
      var aty = labNumber("cbc", "atypical");
      if (aty > 0) set.add("lab:AtypicalLym");
    }

    if (labChecked("lft", "ast") || labChecked("lft", "alt")) {
      var ast = labChecked("lft", "ast") ? labNumber("lft", "ast") : NaN;
      var alt = labChecked("lft", "alt") ? labNumber("lft", "alt") : NaN;
      if ((ast >= 40 && !isNaN(ast)) || (alt >= 40 && !isNaN(alt))) set.add("lab:ALT/AST>=40");
      if ((ast >= 80 && !isNaN(ast)) || (alt >= 80 && !isNaN(alt))) set.add("lab:ALT/AST>=2x");
    }

    if (labChecked("rft", "cre")) {
      if ((p3.rft.cre.detail || "").match(/(rise|increase|≥0\.3|1\.5x)/i)) set.add("lab:CrRise");
    }
    if (labChecked("rft", "egfr")) {
      var eg = labNumber("rft", "egfr");
      if (!isNaN(eg) && eg < 60) set.add("lab:eGFR<60");
    }
    if (labChecked("ua", "protein")) set.add("lab:UA:protein+");

    if (labChecked("lung", "spo2")) {
      var sp = labNumber("lung", "spo2");
      if (sp < 94) set.add("sys:SpO2<94");
    }
    if (labChecked("heart", "ekg")) set.add("lab:EKGผิดปกติ");
    if (labChecked("heart", "tropi")) {
      var ti = labNumber("heart", "tropi");
      if (ti > 0.04) set.add("lab:TropI>0.04");
    }
    if (labChecked("heart", "tropt")) {
      var tt = labNumber("heart", "tropt");
      if (tt > 0.01) set.add("lab:TropT>0.01-0.03");
    }

    if (p3.immuno?.c3c4?.checked) {
      var txt = (p3.immuno.c3c4.detail || "").toLowerCase();
      if (txt.includes("c3<90")) set.add("lab:C3<90");
      if (txt.includes("c4<10")) set.add("lab:C4<10");
      if (txt.includes("c3+")) set.add("lab:C3+");
    }
    if (p3.immuno?.ige?.checked) {
      var iged = (p3.immuno.ige.detail || "").toLowerCase();
      if (iged.includes("igg+")) set.add("lab:IgG+");
      if (iged.includes("ldh")) set.add("lab:LDHสูง");
    }

    return set;
  }

  // ===== รวมกฎโหมด token และเติมให้ครบ 21 ADR =====
  function getAllRules() {
    // รายชื่อมาตรฐาน 21 ADR
    var STANDARD = [
      ["urticaria","Urticaria"],
      ["anaphylaxis","Anaphylaxis"],
      ["angioedema","Angioedema"],
      ["mpr","Maculopapular rash"],
      ["fde","Fixed drug eruption"],
      ["agep","AGEP"],
      ["sjs","SJS"],
      ["ten","TEN"],
      ["dress","DRESS"],
      ["em","Erythema multiforme"],
      ["photosens","Photosensitivity drug eruption"],
      ["exfol","Exfoliative dermatitis"],
      ["eczema","Eczematous drug eruption"],
      ["bullous","Bullous Drug Eruption"],
      ["serumSickness","Serum sickness"],
      ["vasculitis","Vasculitis"],
      ["hemolytic","Hemolytic anemia"],
      ["pancytopenia","Pancytopenia"],
      ["neutropenia","Neutropenia"],
      ["thrombocytopenia","Thrombocytopenia"],
      ["nephritis","Nephritis"],
    ];

    var arr = Array.isArray(window.brainRules) ? window.brainRules.slice() : [];

    // แปลงให้เป็น map แล้วเติมตัวที่ขาดด้วย token ว่าง
    var map = new Map(arr.map(x => [String(x.id||x.key||x.name).trim(), x]));
    STANDARD.forEach(([id, name]) => {
      if (!map.has(id)) map.set(id, { id, name, tokens: [] });
      else {
        var r = map.get(id);
        r.id = id; r.name = r.name || name;
        r.tokens = Array.isArray(r.tokens) ? r.tokens : [];
      }
    });
    return Array.from(map.values());
  }

  // ===== คำนวณคะแนนแต่ละ ADR =====
  function computeScores(signals, rules) {
    var results = rules.map((adr) => {
      var score = 0;
      (adr.tokens || []).forEach((tok) => {
        var key = typeof tok === "string" ? tok : tok.key;
        var w = typeof tok === "string" ? 1 : (tok.w || 1);
        if (signals.has(key)) score += w;
      });
      return { id: adr.id, name: adr.name, score };
    });
    // เรียงจากมากไปน้อย
    results.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    // ทำเปอร์เซ็นต์อิงคะแนนมากสุด
    var max = Math.max(0, ...results.map(r => r.score));
    results.forEach(r => {
      r.pct = max > 0 ? Math.round((r.score / max) * 100) : 0;
    });
    return results;
  }

  // ===== เรนเดอร์ผล (แบบเปอร์เซ็นต์ 0–100 แสดงครบ 21 ADR) =====
  function renderResults(results) {
    var rows = results.map((r, idx) => {
      var pct = r.pct;
      var bar = `
        <div style="display:flex;align-items:center;gap:.6rem;">
          <div style="flex:0 0 1.8rem;text-align:right;font-weight:700;color:#9d174d;">${String(idx+1).padStart(2,"0")}</div>
          <div style="flex:1 1 auto;">
            <div style="font-weight:700;color:#4a044e;margin-bottom:.15rem;">${r.name}</div>
            <div style="height:14px;background:#fde7f2;border-radius:999px;overflow:hidden;border:1px solid rgba(236,72,153,.3);">
              <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#fbcfe8,#f9a8d4,#f472b6);"></div>
            </div>
          </div>
          <div style="flex:0 0 3.8rem;text-align:right;color:#4a044e;font-weight:800;">${pct}%</div>
        </div>`;
      return bar;
    }).join("");

    var html = `
      <div class="p6-card" style="background:linear-gradient(180deg,#ffeaf4 0%,#fff7fb 60%,#ffffff 100%);border:1px solid rgba(236,72,153,.25);border-radius:1.2rem;padding:1rem 1rem 1.2rem;box-shadow:0 10px 24px rgba(236,72,153,.15);">
        <h3 style="margin:0 0 .6rem;font-weight:800;color:#9d174d;">📊 สรุปคะแนนเป็นเปอร์เซ็นต์ (แสดงครบ 21 ADR)</h3>
        <div style="display:flex;flex-direction:column;gap:.5rem;">
          ${rows}
        </div>
      </div>
    `;
    renderIntoPage6(html);

    // ซ่อนส่วน "กราฟผลคะแนนย่อย (Top signals)" ถ้ามีใน DOM (ไม่แตะส่วนอื่น)
    try {
      var candidates = [];
      candidates.push(document.getElementById("p6TopSignals"));
      candidates.push(document.getElementById("p6SignalsBox"));
      candidates.push(document.getElementById("p6SignalChart"));
      candidates.push(document.querySelector('[data-p6="signals"]'));
      // จับจากหัวข้อภาษาไทย
      Array.from(document.querySelectorAll("h1,h2,h3,h4")).forEach(h=>{
        if (h && /กราฟผลคะแนนย่อย/i.test(h.textContent||"")) candidates.push(h.closest(".p6-card")||h.parentElement);
      });
      candidates.filter(Boolean).forEach(el => { el.style.display = "none"; });
    } catch (_) {}
  }

  // ===== ฟังก์ชันหลัก =====
  function evaluate() {
    // ตรวจความพร้อมข้อมูลหน้า 1–3 (แต่ไม่ hard-block การเรนเดอร์)
    var d = window.drugAllergyData || {};
    var ready = !!(d.page1 && d.page2 && d.page3);

    var rules = getAllRules();                 // 21 ADR ครบแน่
    var signals = collectSignals();            // รวมสัญญาณจากหน้า 1–3
    var results = computeScores(signals, rules);

    // ถ้าไม่มีสัญญาณเลย ให้แสดงกรอบว่าง + 0%
    renderResults(results);

    return { ready, results };
  }

  // ===== ผูก event =====
  document.addEventListener("da:update", () => {
    try { evaluate(); } catch (e) { /* no-op เพื่อไม่ให้หน้าแฮงค์ */ }
  });

  // ให้หน้า 6 เรียกได้เอง/manual refresh
  window.evaluateDrugAllergy = evaluate;

  // คำนวณครั้งแรกถ้าพร้อม
  setTimeout(() => { try { evaluate(); } catch {} }, 0);
})();

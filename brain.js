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
    (p1.rashShapes || []).forEach((s) => {
      set.add("shape:" + s);
      // special: ถ้าเป็น "ผิวหนังตึง" ให้สะท้อนเป็นสัญญาณผิวด้วย
      if (s === "ผิวหนังตึง") set.add("derm:ตึง");
    });

    // สีผื่น
    (p1.rashColors || []).forEach((c) => set.add("color:" + c));

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

    // ปวด/แสบ/เจ็บ (ไม่บวกซ้ำคีย์เดียวกัน)
    if (p1.pain?.pain) set.add("derm:ปวด");
    if (p1.pain?.burn) set.add("derm:แสบ");
    if (p1.pain?.sore) set.add("derm:เจ็บ");

    // บวม
    if (p1.swelling?.has) set.add("derm:บวม");

    // ตุ่มหนอง
    if (p1.pustule?.has) set.add("derm:ตุ่มหนอง");

    // ตำแหน่ง/การกระจาย
    (p1.locations || []).forEach((loc) => set.add("pos:" + loc));
    if (p1.distribution === "สมมาตร") set.add("pos:สมมาตร");
    if (p1.mucosalCountGt1) set.add("mucosa:>1");

    // Onset
    switch (p1.onset) {
      case "1h":     set.add("onset:1h"); break;
      case "1to6h":  set.add("onset:1-6h"); break;
      case "6to24h": set.add("onset:6-24h"); break;
      case "1w":     set.add("onset:1w"); break;
      case "2w":     set.add("onset:2w"); break;
      case "3w":     set.add("onset:3w"); break;
      case "4w":     set.add("onset:4w"); break;
      default: break;
    }

    // ---- หน้า 2: คีย์สากลจาก collectPage2() ----
    // Respiratory
    if (p2?.resp?.wheeze) set.add("sys:wheeze");
    if (p2?.resp?.dyspnea) set.add("sys:dyspnea");

    // Cardiovascular
    if (p2?.cv?.hypotension) set.add("sys:hypotension");
    // ใช้ proxy ของ “BP ลดลง ≥30% baseline systolic เดิม”
    if (p2?.cv?.shock) set.add("sys:bp_drop");

    // Vitals flags
    if (p2?.examHRHigh || (typeof p2?.HR === "number" && p2.HR > 100)) set.add("sys:HR>100");
    if (typeof p2?.SpO2 === "number" && p2.SpO2 < 94) set.add("sys:SpO2<94");

    // GI
    if (p2?.gi?.nausea) set.add("sys:คลื่นไส้อาเจียน");
    if (p2?.gi?.dysphagia) set.add("sys:กลืนลำบาก");
    if (p2?.gi?.diarrhea) set.add("sys:ท้องเสีย");
    if (p2?.gi?.cramp) set.add("sys:ปวดบิดท้อง");
    if (p2?.misc?.bleedingGI) set.add("sys:เลือดออกในทางเดินอาหาร");

    // Eye/ENT/Other
    if (p2?.misc?.conjunctivitis) set.add("sys:เยื่อบุตาอักเสบ");
    if (p2?.misc?.soreThroat) set.add("sys:เจ็บคอ");
    if (p2?.misc?.fever) set.add("sys:ไข้");
    if (p2?.misc?.fatigue) set.add("sys:อ่อนเพลีย");
    if (p2?.misc?.chill) set.add("sys:หนาวสั่น");

    // Skin hemorrhage
    if (p2?.misc?.petechiae) set.add("derm:จุดเลือดออก");
    if (p2?.misc?.hemorrhageSkin) set.add("derm:ปื้น/จ้ำเลือด");

    // GU flags
    if (p2?.misc?.["ปัสสาวะสีชา/สีดำ"]) set.add("sys:ปัสสาวะสีชา/สีดำ");
    if (p2?.misc?.["ปัสสาวะออกน้อย"]) set.add("sys:ปัสสาวะออกน้อย");
    if (p2?.misc?.["ปัสสาวะขุ่น"]) set.add("sys:ปัสสาวะขุ่น");

    // Organs
    var org = p2?.organsFlags || {};
    if (org.kidneyFail)  set.add("organ:AKI");
    if (org.hepatitis)   set.add("organ:hepatitis");
    if (org.pneumonia)   set.add("organ:pneumonia");
    if (org.myocarditis) set.add("organ:myocarditis");

    // ---- หน้า 3: Lab (นับเฉพาะช่องที่ "ติ๊ก" จริงเท่านั้น) ----
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

    // CBC
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

    // LFT
    if (labChecked("lft", "ast") || labChecked("lft", "alt")) {
      var ast = labChecked("lft", "ast") ? labNumber("lft", "ast") : NaN;
      var alt = labChecked("lft", "alt") ? labNumber("lft", "alt") : NaN;
      if ((ast >= 40 && !isNaN(ast)) || (alt >= 40 && !isNaN(alt))) set.add("lab:ALT/AST>=40");
      if ((ast >= 80 && !isNaN(ast)) || (alt >= 80 && !isNaN(alt))) set.add("lab:ALT/AST>=2x");
    }

    // RFT
    if (labChecked("rft", "cre")) {
      if ((p3.rft.cre.detail || "").match(/(rise|increase|≥0\.3|1\.5x)/i)) set.add("lab:CrRise");
    }
    if (labChecked("rft", "egfr")) {
      var eg = labNumber("rft", "egfr");
      if (!isNaN(eg) && eg < 60) set.add("lab:eGFR<60");
    }
    if (labChecked("ua", "protein")) set.add("lab:UA:protein+");

    // Lung/Heart/Vitals
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

    // Complement / IgE/IgG (จาก detail)
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

  // ===== คำนวณคะแนนแต่ละ ADR =====
  function computeScores(signals, rules) {
    var results = rules.map((adr) => {
      var score = 0;
      var hits = [];
      (adr.tokens || []).forEach((tok) => {
        var key = typeof tok === "string" ? tok : tok.key;
        var w = typeof tok === "string" ? 1 : (tok.w || 1);
        if (signals.has(key)) {
          score += w;
          hits.push({ key, w });
        }
      });
      return { id: adr.id, name: adr.name, score, hits };
    });
    results.sort((a, b) => b.score - a.score);
    return results;
  }

  // ===== เรนเดอร์ผล + กราฟ "สีชมพูนม" =====
  function renderResults(results) {
    if (!Array.isArray(results) || !results.length) {
      renderIntoPage6(
        `<div class="p6-muted">ยังไม่มีคะแนน (ยังไม่ได้กำหนดกฎใน <code>brain.rules.js</code> หรือยังไม่ติ๊กข้อมูลเพียงพอ)</div>`
      );
      return;
    }

    var top = results.slice(0, 5);
    var max = top[0] ? Math.max(1, top[0].score) : 1;

    var html = `
      <div class="p6-card" style="background:linear-gradient(180deg,#ffeaf4 0%,#fff7fb 60%,#ffffff 100%);border:1px solid rgba(236,72,153,.25);border-radius:1.2rem;padding:1rem 1rem 1.2rem;box-shadow:0 10px 24px rgba(236,72,153,.15);">
        <h3 style="margin:0 0 .6rem;font-weight:800;color:#9d174d;">📊 สรุปคะแนนความสอดคล้อง (Top 5)</h3>
        <div style="display:flex;flex-direction:column;gap:.5rem;">
          ${top
            .map((r, i) => {
              var pct = Math.round((r.score / max) * 100);
              return `
                <div style="display:flex;align-items:center;gap:.6rem;">
                  <div style="flex:0 0 2rem;text-align:right;font-weight:700;color:#9d174d;">#${i + 1}</div>
                  <div style="flex:1 1 auto;">
                    <div style="font-weight:700;color:#4a044e;margin-bottom:.15rem;">${r.name}</div>
                    <div style="height:14px;background:#fde7f2;border-radius:999px;overflow:hidden;border:1px solid rgba(236,72,153,.3);">
                      <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#fbcfe8,#f9a8d4,#f472b6);"></div>
                    </div>
                  </div>
                  <div style="flex:0 0 3.2rem;text-align:right;color:#4a044e;font-weight:800;">${r.score}</div>
                </div>
              `;
            })
            .join("")}
        </div>

        <details style="margin-top:.8rem;">
          <summary style="cursor:pointer;color:#9d174d;font-weight:700;">ดูรายละเอียดตัวแปรที่ถูกนับ</summary>
          <div style="margin-top:.6rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:.6rem;">
            ${top
              .map((r) => {
                return `
                  <div style="background:#fff;border:1px solid rgba(236,72,153,.2);border-radius:.8rem;padding:.6rem;">
                    <div style="font-weight:700;color:#be185d;margin-bottom:.3rem;">${r.name}</div>
                    ${
                      r.hits.length
                        ? `<ul style="margin:0;padding-left:1rem;font-size:.92rem;color:#6b21a8;">${r.hits
                            .map((h) => `<li>${h.key} <b style="color:#9d174d;">(+${h.w})</b></li>`)
                            .join("")}</ul>`
                        : `<div style="color:#6b7280;">ไม่มีตัวแปรที่ถูกนับ</div>`
                    }
                  </div>
                `;
              })
              .join("")}
          </div>
        </details>
      </div>
    `;

    renderIntoPage6(html);
  }

  // ===== ฟังก์ชันหลัก =====
  function evaluate() {
    var rules = Array.isArray(window.brainRules) ? window.brainRules : [];
    var signals = collectSignals();          // รวมสัญญาณจากหน้า 1–3 (เฉพาะติ๊ก/เลือก)
    var results = computeScores(signals, rules);
    renderResults(results);
    return results;
  }

  // ===== ผูก event =====
  document.addEventListener("da:update", () => {
    try { evaluate(); } catch (e) { /* no-op */ }
  });

  // ให้หน้า 6 เรียกได้ (เข้ากับ page6.js เวอร์ชันที่ใช้ brainComputeAndRender)
  window.brainComputeAndRender = evaluate;
  // คง alias เดิมเผื่อโค้ดส่วนอื่นเรียกอยู่
  window.evaluateDrugAllergy = evaluate;

  // คำนวณครั้งแรกถ้าพร้อม
  setTimeout(() => { try { evaluate(); } catch {} }, 0);
})();

// ===================== brain.js (REPLACE WHOLE FILE) =====================
// หน้า 6 — สรุปผลประเมินแบบ bars เปอร์เซ็นต์ เรียงจากมาก→น้อย ครบ 21 ADR
// ทำงานร่วมได้ทั้ง 2 โหมดกฎ:
//   • window.brainRules_vEval = { computeAll() }  (เครื่องยนต์ eval)
//   • window.brainRules = [ {id,name,tokens:[key|{key,w}]} ]  (โหมด token)
//
// หมายเหตุ:
// - โค้ดนี้ "ไม่แตะส่วนอื่นของหน้า 6" นอกจากกล่องแสดงผลหลัก (#p6BrainBox)
// - ลบ/ซ่อนบล็อก “กราฟผลคะแนนย่อย (Top signals)” อัตโนมัติถ้ามีอยู่เดิม
// - รองรับปุ่ม/อีเวนต์เดิม: document.dispatchEvent(new Event('da:update'))

(function () {
  // ===== จุดหมายการเรนเดอร์หน้า 6 =====
  function renderIntoPage6(html) {
    var box = document.getElementById("p6BrainBox");
    if (box) box.innerHTML = html;
  }

  // ===== Helper =====
  function num(v) {
    var n = Number(String(v ?? "").toString().replace(/[, ]+/g, ""));
    return Number.isFinite(n) ? n : NaN;
  }
  function truthy(v) {
    if (v === true) return true;
    if (typeof v === "string") {
      var s = v.trim();
      if (!s) return false;
      return !/^(false|null|undefined|0|no|ไม่|ไม่มี)$/i.test(s);
    }
    return !!v;
  }

  // ===== Helper: อ่านค่าจากหน้า 1–3 แบบ "นับเฉพาะที่ติ๊ก/เลือก" แล้วแปลงเป็น tokens =====
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
    function P2has(path) {
      var cur = p2, seg = path.split(".");
      for (var i=0;i<seg.length;i++){ if (cur == null) return false; cur = cur[seg[i]]; }
      return truthy(cur);
    }
    // Respiratory
    if (P2has("resp.wheeze")) set.add("sys:wheeze");
    if (P2has("resp.dyspnea")) set.add("sys:dyspnea");

    // Cardiovascular
    if (P2has("cv.hypotension")) set.add("sys:hypotension");
    if (P2has("cv.shock")) set.add("sys:bp_drop");

    // Vitals
    if (p2?.examHRHigh || (typeof p2?.HR === "number" && p2.HR > 100)) set.add("sys:HR>100");
    if (typeof p2?.SpO2 === "number" && p2.SpO2 < 94) set.add("sys:SpO2<94");

    // GI
    if (P2has("gi.nausea")) set.add("sys:คลื่นไส้อาเจียน");
    if (P2has("gi.dysphagia")) set.add("sys:กลืนลำบาก");
    if (P2has("gi.diarrhea")) set.add("sys:ท้องเสีย");
    if (P2has("gi.cramp")) set.add("sys:ปวดบิดท้อง");
    if (P2has('misc["เลือดออกในทางเดินอาหาร"]')) set.add("sys:เลือดออกในทางเดินอาหาร");

    // Eye/ENT/Other
    if (P2has("misc.conjunctivitis")) set.add("sys:เยื่อบุตาอักเสบ");
    if (P2has("misc.soreThroat")) set.add("sys:เจ็บคอ");
    if (P2has("misc.fever")) set.add("sys:ไข้");
    if (P2has("misc.fatigue")) set.add("sys:อ่อนเพลีย");
    if (P2has("misc.chill")) set.add("sys:หนาวสั่น");

    // Skin hemorrhage
    if (P2has("misc.petechiae")) set.add("derm:จุดเลือดออก");
    if (P2has('misc["ปื้น/จ้ำเลือด"]')) set.add("derm:ปื้น/จ้ำเลือด");

    // GU flags
    if (P2has('misc["ปัสสาวะสีชา/สีดำ"]')) set.add("sys:ปัสสาวะสีชา/สีดำ");
    if (P2has('misc["ปัสสาวะออกน้อย"]')) set.add("sys:ปัสสาวะออกน้อย");
    if (P2has('misc["ปัสสาวะขุ่น"]')) set.add("sys:ปัสสาวะขุ่น");

    // Organs
    var org = p2?.organsFlags || {};
    if (org.kidneyFail) set.add("organ:AKI");
    if (org.hepatitis) set.add("organ:hepatitis");
    if (org.pneumonia) set.add("organ:pneumonia");
    if (org.myocarditis) set.add("organ:myocarditis");

    // ---- หน้า 3: Lab (เฉพาะช่องที่ถูกติ๊ก/มีค่า) ----
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
      var crd = (p3.rft.cre.detail || "").toLowerCase();
      if (/(rise|increase|≥0\.3|1\.5x)/i.test(crd)) set.add("lab:CrRise");
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

    // Complement / IgE detail
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

  // ===== คำนวณคะแนนจาก 2 โหมดกฎ =====
  function computeFromTokenRules(signals, tokenRules) {
    // tokenRules: [ {id,name,tokens:[key|{key,w}]} ]
    return tokenRules.map(function (adr) {
      var score = 0, hits = [];
      (adr.tokens || []).forEach(function (tok) {
        var key = typeof tok === "string" ? tok : tok.key;
        var w = typeof tok === "string" ? 1 : (tok.w || 1);
        if (signals.has(key)) { score += w; hits.push({ key: key, w: w }); }
      });
      return { id: adr.id, name: adr.name, score: score, hits: hits };
    });
  }

  function computeFromEvalEngine() {
    // window.brainRules_vEval.computeAll() -> [{key,label,total,tokens}]
    var raw = (window.brainRules_vEval && typeof window.brainRules_vEval.computeAll === "function")
      ? window.brainRules_vEval.computeAll() : [];
    return raw.map(function (r) {
      return { id: r.key, name: r.label || r.key, score: Number(r.total) || 0, hits: (r.tokens||[]).map(function(t){return {key:t.label||"", w:t.w||1};}) };
    });
  }

  // ===== เรนเดอร์ผลแบบ “เปอร์เซ็นต์” เรียงทั้งหมด (แสดงทั้ง 21 ADR) =====
  function renderResults(results) {
    // เรียงมาก→น้อย
    results.sort(function (a,b){ return b.score - a.score; });

    // หาคะแนนสูงสุดเพื่อทำเปอร์เซ็นต์
    var maxScore = results.length ? Math.max(1, results[0].score) : 1;

    var rows = results.map(function(r, idx){
      var pct = maxScore > 0 ? Math.round((r.score / maxScore) * 100) : 0;
      return (
        '<div style="display:flex;align-items:center;gap:.6rem;padding:.25rem 0;">' +
          '<div style="flex:0 0 2rem;text-align:right;font-weight:700;color:#9d174d;">#' + (idx+1) + '</div>' +
          '<div style="flex:1 1 auto;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.15rem;">' +
              '<div style="font-weight:700;color:#4a044e;">' + r.name + '</div>' +
              '<div style="font-weight:800;color:#4a044e;">' + pct + '%</div>' +
            '</div>' +
            '<div style="height:14px;background:#fde7f2;border-radius:999px;overflow:hidden;border:1px solid rgba(236,72,153,.3);">' +
              '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,#fbcfe8,#f9a8d4,#f472b6);"></div>' +
            '</div>' +
          '</div>' +
          '<div style="flex:0 0 3.2rem;text-align:right;color:#4a044e;font-weight:800;">' + r.score + '</div>' +
        '</div>'
      );
    }).join("");

    var html =
      '<div class="p6-card" style="background:linear-gradient(180deg,#ffeaf4 0%,#fff7fb 60%,#ffffff 100%);border:1px solid rgba(236,72,153,.25);border-radius:1.2rem;padding:1rem 1rem 1.2rem;box-shadow:0 10px 24px rgba(236,72,153,.15);">' +
        '<h3 style="margin:0 0 .6rem;font-weight:800;color:#9d174d;">📊 สรุปคะแนนความสอดคล้อง (แสดงทั้งหมด · เปอร์เซ็นต์เทียบคะแนนสูงสุด)</h3>' +
        '<div style="display:flex;flex-direction:column;gap:.5rem;">' + rows + '</div>' +
      '</div>';

    renderIntoPage6(html);
  }

  // ===== ลบ/ซ่อนบล็อก “กราฟผลคะแนนย่อย (Top signals)” ถ้ามี =====
  function removeTopSignalsBlock() {
    var candidates = [
      document.getElementById('p6TopSignals'),
      document.getElementById('p6Signals'),
      document.querySelector('.p6-top-signals'),
      document.querySelector('[data-role="p6-top-signals"]')
    ];
    candidates.forEach(function(el){ if (el && el.parentNode) try { el.parentNode.removeChild(el); } catch(_){} });

    // สำรอง: ถ้ามี heading ที่มีข้อความนี้ ให้ซ่อนทั้งกล่องบรรทัดถัดไป
    var all = Array.from(document.querySelectorAll('*'));
    var target = all.find(function(el){
      return /กราฟผลคะแนนย่อย\s*\(Top signals\)/.test((el.textContent||"").trim());
    });
    if (target) {
      // ลองหากรอบ container
      var parent = target.closest('section,div,article');
      if (parent && parent.parentNode) try { parent.parentNode.removeChild(parent); } catch(_){}
    }
  }

  // ===== ฟังก์ชันหลัก =====
  var evaluateQueued = false;
  function evaluate() {
    if (evaluateQueued) return;
    evaluateQueued = true;
    requestAnimationFrame(function(){
      evaluateQueued = false;

      removeTopSignalsBlock(); // เอากราฟย่อยออก

      // เตรียมข้อมูล
      var signals = collectSignals();

      // เลือกโหมดกฎ
      var results = [];
      if (Array.isArray(window.brainRules) && window.brainRules.length) {
        results = computeFromTokenRules(signals, window.brainRules);
      } else if (window.brainRules_vEval && typeof window.brainRules_vEval.computeAll === "function") {
        results = computeFromEvalEngine();
      } else {
        // ไม่มีสมอง
        renderIntoPage6('<div class="p6-muted">ยังไม่พบกฎสำหรับการคำนวณ (brain.rules.js)</div>');
        return;
      }

      renderResults(results);
    });
  }

  // ===== ผูก event =====
  document.addEventListener("da:update", function () {
    try { evaluate(); } catch (e) { /* no-op */ }
  });

  // ให้หน้า 6 เรียกได้เอง
  window.evaluateDrugAllergy = evaluate;

  // คำนวณครั้งแรกถ้าพร้อม
  setTimeout(function(){ try { evaluate(); } catch(_){} }, 0);
})();

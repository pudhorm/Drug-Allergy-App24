// ===================== brain.js (REPLACE WHOLE FILE) =====================
(function () {
  // ---------- Utility ----------
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function num(v){ const n = Number(String(v??"").replace(/[, ]+/g,"")); return Number.isFinite(n)?n:NaN; }

  // ---------- Standard 21 ADR ----------
  const ADR21 = [
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

  // ---------- Signals extractor (สรุปสัญญาณจาก page1–3 ให้เป็น token) ----------
  function collectSignals() {
    const d = window.drugAllergyData || {};
    const p1 = d.page1 || {};
    const p2 = d.page2 || {};
    const p3 = d.page3 || {};
    const set = new Set();

    // หน้า 1
    (p1.rashShapes||[]).forEach(s=>set.add("shape:"+s));
    (p1.rashColors||[]).forEach(c=>set.add("color:"+c));
    (p1.locations||[]).forEach(l=>set.add("pos:"+l));
    if (p1.distribution==="สมมาตร") set.add("pos:สมมาตร");
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
    if (p1.pain?.burn) set.add("derm:แสบ");
    if (p1.pain?.sore || p1.pain?.pain) set.add("derm:เจ็บ");
    if (p1.swelling?.has) set.add("derm:บวม");
    if (p1.pustule?.has) set.add("derm:ตุ่มหนอง");
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

    // หน้า 2
    if (p2?.resp?.wheeze) set.add("sys:wheeze");
    if (p2?.resp?.dyspnea) set.add("sys:dyspnea");
    if (p2?.cv?.hypotension) set.add("sys:hypotension");
    if (p2?.cv?.shock) set.add("sys:bp_drop");
    if (p2?.misc?.fever) set.add("sys:ไข้");
    if (p2?.misc?.fatigue) set.add("sys:อ่อนเพลีย");
    if (p2?.misc?.chill) set.add("sys:หนาวสั่น");
    if (p2?.gi?.nausea) set.add("sys:คลื่นไส้อาเจียน");
    if (p2?.gi?.dysphagia) set.add("sys:กลืนลำบาก");
    if (p2?.gi?.diarrhea) set.add("sys:ท้องเสีย");
    if (p2?.gi?.cramp) set.add("sys:ปวดบิดท้อง");
    if ((typeof p2?.HR==="number" && p2.HR>100) || p2?.examHRHigh) set.add("sys:HR>100");
    if (typeof p2?.SpO2==="number" && p2.SpO2<94) set.add("sys:SpO2<94");

    const org = p2?.organsFlags || {};
    if (org.kidneyFail) set.add("organ:AKI");
    if (org.hepatitis) set.add("organ:hepatitis");
    if (org.pneumonia) set.add("organ:pneumonia");
    if (org.myocarditis) set.add("organ:myocarditis");

    // หน้า 3 (เฉพาะที่ติ๊ก)
    const p3 = d.page3 || {};
    function checked(g,k){ return !!(p3[g] && p3[g][k] && p3[g][k].checked); }
    function val(g,k){ return num(p3[g] && p3[g][k] && p3[g][k].value); }

    if (checked("cbc","wbc")) { const w=val("cbc","wbc"); if (w>11000) set.add("lab:WBC>11000"); if (w<4000) set.add("lab:WBC<4000"); }
    if (checked("cbc","eos")) { const e=val("cbc","eos"); if (e>=10) set.add("lab:Eo>=10"); if (e>5) set.add("lab:Eo>5"); }
    if (checked("cbc","neut")) { const n=val("cbc","neut"); if (n>75) set.add("lab:Neut>75"); }
    if (checked("cbc","hb")) { const hb=val("cbc","hb"); if (hb<10) set.add("lab:Hb<10"); if ((p3.cbc.hb.detail||"").includes("≥2-3")) set.add("lab:Hb↓≥2-3g/dL/48h"); }
    if (checked("cbc","plt")) { const plt=val("cbc","plt"); if (plt<150000) set.add("lab:Plt<150k"); if (plt<100000) set.add("lab:Plt<100k"); }

    if (checked("lft","ast") || checked("lft","alt")) {
      const ast = checked("lft","ast") ? val("lft","ast") : NaN;
      const alt = checked("lft","alt") ? val("lft","alt") : NaN;
      if ((ast>=40&&!Number.isNaN(ast)) || (alt>=40&&!Number.isNaN(alt))) set.add("lab:ALT/AST>=40");
      if ((ast>=80&&!Number.isNaN(ast)) || (alt>=80&&!Number.isNaN(alt))) set.add("lab:ALT/AST>=2x");
    }

    if (checked("rft","cre") && (p3.rft.cre.detail||"").match(/(rise|increase|≥0\.3|1\.5x)/i)) set.add("lab:CrRise");
    if (checked("rft","egfr")) { const e = val("rft","egfr"); if (e<60) set.add("lab:eGFR<60"); }

    if (checked("ua","protein")) set.add("lab:UA:protein+");

    if (checked("lung","spo2")) { const s = val("lung","spo2"); if (s<94) set.add("sys:SpO2<94"); }

    if (checked("heart","tropi")) { const ti = val("heart","tropi"); if (ti>0.04) set.add("lab:TropI>0.04"); }
    if (checked("heart","tropt")) { const tt = val("heart","tropt"); if (tt>0.01) set.add("lab:TropT>0.01-0.03"); }
    if (checked("heart","ekg")) set.add("lab:EKGผิดปกติ");

    return set;
  }

  // ---------- Build rules (ensure 21 items present) ----------
  function getRulesForTokenMode() {
    const arr = Array.isArray(window.brainRules) ? window.brainRules.slice() : [];
    const map = new Map(arr.map(x => [String(x.id||x.key||x.name).trim(), x]));
    ADR21.forEach(([id, name]) => {
      if (!map.has(id)) map.set(id, { id, name, tokens: [] });
      else {
        const r = map.get(id);
        r.id = id; r.name = r.name || name;
        if (!Array.isArray(r.tokens)) r.tokens = [];
      }
    });
    return Array.from(map.values());
  }

  // ---------- Scoring ----------
  function computeByToken(signals, rules) {
    const out = rules.map(r => {
      let score = 0;
      (r.tokens||[]).forEach(t=>{
        const k = typeof t === "string" ? t : t.key;
        const w = typeof t === "string" ? 1 : (t.w||1);
        if (signals.has(k)) score += w;
      });
      return { id:r.id, name:r.name, score };
    });
    out.sort((a,b)=> b.score - a.score || a.name.localeCompare(b.name));
    const max = Math.max(0, ...out.map(o=>o.score));
    out.forEach(o => o.pct = max>0 ? Math.round(o.score/max*100) : 0);
    return out;
  }

  function computeByEval() {
    const ve = window.brainRules_vEval && typeof window.brainRules_vEval.computeAll === "function"
      ? window.brainRules_vEval.computeAll() : [];
    // map -> ensure 21 entries
    const map = new Map(ve.map(x => [x.key, x]));
    const list = ADR21.map(([id,name]) => {
      const r = map.get(id);
      return { id, name, score: r ? (r.total||0) : 0 };
    });
    list.sort((a,b)=> b.score - a.score || a.name.localeCompare(b.name));
    const max = Math.max(0, ...list.map(o=>o.score));
    list.forEach(o => o.pct = max>0 ? Math.round(o.score/max*100) : 0);
    return list;
  }

  // ---------- Renderers ----------
  function makeBarRow(idx, name, pct) {
    return `
      <div style="display:flex;align-items:center;gap:.65rem">
        <div style="width:2.2rem;text-align:right;font-weight:800;color:#9d174d">${String(idx+1).padStart(2,"0")}</div>
        <div style="flex:1 1 auto">
          <div style="font-weight:700;color:#4a044e;margin-bottom:.22rem">${name}</div>
          <div style="height:14px;border-radius:999px;background:#fde7f2;border:1px solid rgba(236,72,153,.28);overflow:hidden">
            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#fbcfe8,#f9a8d4,#f472b6)"></div>
          </div>
        </div>
        <div style="width:3.8rem;text-align:right;font-weight:800;color:#4a044e">${pct}%</div>
      </div>`;
  }

  function renderIntoExistingCard(results) {
    // หา card “สรุปคะแนนความสอดคล้อง (Top 5)” แล้วแทนที่เนื้อหาภายใน
    const header = $all("h1,h2,h3,h4").find(h => /สรุปคะแนนความสอดคล้อง/i.test(h.textContent||""));
    if (!header) return false;

    // parent card (กรอบชมพู)
    const card = header.closest(".p6-card") || header.parentElement;
    if (!card) return false;

    // แก้หัวข้อให้สื่อว่าเป็นเปอร์เซ็นต์และครบ 21 ADR
    header.textContent = "สรุปคะแนนความสอดคล้อง (เปอร์เซ็นต์ — 21 ADR)";

    // สร้างบล็อกแท่ง
    const rows = results.map((r,i)=>makeBarRow(i, r.name, r.pct)).join("");
    // ที่เดิมมักมีแถวแท่ง 5 แท่ง + รายละเอียดด้านล่าง เราแทนที่เฉพาะส่วนแท่ง
    // หา container เดิมของแท่งจาก progress list
    let container = card.querySelector("[data-p6-bars]") || card.querySelector(".p6-bars") || card;
    container.innerHTML = `
      <div data-p6-bars style="display:flex;flex-direction:column;gap:.55rem">${rows}</div>
    `;
    return true;
  }

  function renderAsStandalone(results) {
    const box = document.getElementById("p6BrainBox");
    if (!box) return false;
    const rows = results.map((r,i)=>makeBarRow(i, r.name, r.pct)).join("");
    box.innerHTML = `
      <div class="p6-card" style="background:linear-gradient(180deg,#ffeaf4, #fff7fb 60%, #fff); border:1px solid rgba(236,72,153,.25); border-radius:1.2rem; padding:1rem 1rem 1.2rem; box-shadow:0 10px 24px rgba(236,72,153,.12);">
        <h3 style="margin:0 0 .6rem; color:#9d174d; font-weight:800">📊 สรุปคะแนนเป็นเปอร์เซ็นต์ (ครบ 21 ADR)</h3>
        <div style="display:flex;flex-direction:column;gap:.55rem">
          ${rows}
        </div>
      </div>
    `;
    return true;
  }

  // ซ่อน “กราฟผลคะแนนย่อย (Top signals)”
  function hideTopSignals() {
    try {
      const heads = $all("h1,h2,h3,h4").filter(h => /กราฟผลคะแนนย่อย/i.test(h.textContent||""));
      heads.forEach(h => {
        const wrap = h.closest(".p6-card") || h.parentElement;
        if (wrap) wrap.style.display = "none";
      });
      // เผื่อมี id/class อื่น
      ["p6TopSignals","p6SignalsBox","p6SignalChart"].forEach(id=>{
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
      });
      const guess = $('[data-p6="signals"]');
      if (guess) guess.style.display = "none";
    } catch {}
  }

  // ---------- Evaluate & Render ----------
  function evaluateAndRender() {
    hideTopSignals();

    let results;
    try {
      const rules = getRulesForTokenMode();
      const signals = collectSignals();
      results = computeByToken(signals, rules);
    } catch {
      // fallback to eval mode ถ้าไม่มีโหมด token
      results = computeByEval();
    }

    // พยายามแทนที่การ์ดเดิมก่อน ถ้าไม่พบให้เรนเดอร์ลง p6BrainBox
    const ok = renderIntoExistingCard(results);
    if (!ok) renderAsStandalone(results);

    return results;
  }

  // รันเมื่อข้อมูลอัปเดต
  document.addEventListener("da:update", () => { try { evaluateAndRender(); } catch {} });

  // รันครั้งแรก
  setTimeout(() => { try { evaluateAndRender(); } catch {} }, 0);

  // เผย public API
  window.evaluateDrugAllergy = evaluateAndRender;
})();

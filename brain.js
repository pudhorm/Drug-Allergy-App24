// ===================== brain.js (REPLACE WHOLE FILE) =====================
(function () {
  // ---------------- Utils ----------------
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const $ = (sel, root) => (root || document).querySelector(sel);
  const on = (el, ev, fn) => el && el.addEventListener(ev, fn, { passive: true });

  function num(v) { const n = Number(String(v ?? "").replace(/[, ]+/g, "")); return Number.isFinite(n) ? n : NaN; }
  function raf(fn){ return window.requestAnimationFrame ? requestAnimationFrame(fn) : setTimeout(fn,0); }

  // -------- 21 ADR (id, name) --------
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

  // -------- Signals collector (สรุปจาก page1–3 เป็น token) --------
  function collectSignals() {
    const d = window.drugAllergyData || {};
    const p1 = d.page1 || {}, p2 = d.page2 || {}, p3 = d.page3 || {};
    const S = new Set();

    // page1
    (p1.rashShapes||[]).forEach(s=>S.add("shape:"+s));
    (p1.rashColors||[]).forEach(c=>S.add("color:"+c));
    (p1.locations||[]).forEach(l=>S.add("pos:"+l));
    if (p1.distribution==="สมมาตร") S.add("pos:สมมาตร");
    if (p1.blisters?.small) S.add("derm:ตุ่มน้ำเล็ก");
    if (p1.blisters?.medium) S.add("derm:ตุ่มน้ำกลาง");
    if (p1.blisters?.large) S.add("derm:ตุ่มน้ำใหญ่");
    if (p1.scales?.scale) S.add("derm:ขุย");
    if (p1.scales?.dry) S.add("derm:แห้ง");
    if (p1.scales?.peel) S.add("derm:ลอก");
    if (p1.exudate?.serous) S.add("derm:น้ำเหลือง");
    if (p1.exudate?.crust) S.add("derm:สะเก็ด");
    if (p1.skinDetach?.center) S.add("derm:ผิวหนังหลุดลอกตรงกลางผื่น");
    if (p1.skinDetach?.lt10) S.add("derm:ผิวหลุด<10%");
    if (p1.skinDetach?.gt30) S.add("derm:ผิวหลุด>30%");
    if (p1.itch?.has) S.add("derm:คัน");
    if (p1.itch?.none) S.add("derm:ไม่คัน");
    if (p1.pain?.burn) S.add("derm:แสบ");
    if (p1.pain?.sore || p1.pain?.pain) S.add("derm:เจ็บ");
    if (p1.swelling?.has) S.add("derm:บวม");
    if (p1.pustule?.has) S.add("derm:ตุ่มหนอง");
    if (p1.mucosalCountGt1) S.add("mucosa:>1");
    switch (p1.onset) {
      case "1h": S.add("onset:1h"); break;
      case "1to6h": S.add("onset:1-6h"); break;
      case "6to24h": S.add("onset:6-24h"); break;
      case "1w": S.add("onset:1w"); break;
      case "2w": S.add("onset:2w"); break;
      case "3w": S.add("onset:3w"); break;
      case "4w": S.add("onset:4w"); break;
    }

    // page2
    if (p2?.resp?.wheeze) S.add("sys:wheeze");
    if (p2?.resp?.dyspnea) S.add("sys:dyspnea");
    if (p2?.cv?.hypotension) S.add("sys:hypotension");
    if (p2?.cv?.shock) S.add("sys:bp_drop");
    if (p2?.misc?.fever) S.add("sys:ไข้");
    if (p2?.misc?.fatigue) S.add("sys:อ่อนเพลีย");
    if (p2?.misc?.chill) S.add("sys:หนาวสั่น");
    if (p2?.gi?.nausea) S.add("sys:คลื่นไส้อาเจียน");
    if (p2?.gi?.dysphagia) S.add("sys:กลืนลำบาก");
    if (p2?.gi?.diarrhea) S.add("sys:ท้องเสีย");
    if (p2?.gi?.cramp) S.add("sys:ปวดบิดท้อง");
    if ((typeof p2.HR==="number" && p2.HR>100) || p2.examHRHigh) S.add("sys:HR>100");
    if (typeof p2.SpO2==="number" && p2.SpO2<94) S.add("sys:SpO2<94");

    const org = p2?.organsFlags || {};
    if (org.kidneyFail) S.add("organ:AKI");
    if (org.hepatitis) S.add("organ:hepatitis");
    if (org.pneumonia) S.add("organ:pneumonia");
    if (org.myocarditis) S.add("organ:myocarditis");

    // page3 (คิดเฉพาะที่ติ๊ก)
    const p3c = d.page3 || {};
    const chk = (g,k)=>!!(p3c[g]&&p3c[g][k]&&p3c[g][k].checked);
    const val = (g,k)=>num(p3c[g]&&p3c[g][k]&&p3c[g][k].value);

    if (chk("cbc","wbc")) { const w=val("cbc","wbc"); if (w>11000) S.add("lab:WBC>11000"); if (w<4000) S.add("lab:WBC<4000"); }
    if (chk("cbc","eos")) { const e=val("cbc","eos"); if (e>=10) S.add("lab:Eo>=10"); if (e>5) S.add("lab:Eo>5"); }
    if (chk("cbc","neut")) { const n=val("cbc","neut"); if (n>75) S.add("lab:Neut>75"); }
    if (chk("cbc","hb")) { const hb=val("cbc","hb"); if (hb<10) S.add("lab:Hb<10"); if ((p3c.cbc.hb.detail||"").includes("≥2")) S.add("lab:Hb↓≥2-3g/dL/48h"); }
    if (chk("cbc","plt")) { const p=val("cbc","plt"); if (p<150000) S.add("lab:Plt<150k"); if (p<100000) S.add("lab:Plt<100k"); }

    if (chk("lft","ast")||chk("lft","alt")){
      const ast=chk("lft","ast")?val("lft","ast"):NaN, alt=chk("lft","alt")?val("lft","alt"):NaN;
      if ((ast>=40&&!Number.isNaN(ast))||(alt>=40&&!Number.isNaN(alt))) S.add("lab:ALT/AST>=40");
      if ((ast>=80&&!Number.isNaN(ast))||(alt>=80&&!Number.isNaN(alt))) S.add("lab:ALT/AST>=2x");
    }

    if (chk("rft","cre") && (p3c.rft.cre.detail||"").match(/0\.3|1\.5x|rise|increase/i)) S.add("lab:CrRise");
    if (chk("rft","egfr")) { const e=val("rft","egfr"); if (e<60) S.add("lab:eGFR<60"); }
    if (chk("ua","protein")) S.add("lab:UA:protein+");

    if (chk("lung","spo2")) { const s=val("lung","spo2"); if (s<94) S.add("sys:SpO2<94"); }

    if (chk("heart","tropi")) { const ti=val("heart","tropi"); if (ti>0.04) S.add("lab:TropI>0.04"); }
    if (chk("heart","tropt")) { const tt=val("heart","tropt"); if (tt>0.01) S.add("lab:TropT>0.01"); }
    if (chk("heart","ekg")) S.add("lab:EKGผิดปกติ");

    return S;
  }

  // -------- Rules loader (token mode) --------
  function getTokenRules(){
    const arr = Array.isArray(window.brainRules) ? window.brainRules.slice() : [];
    const map = new Map(arr.map(x=>[String(x.id||x.key||x.name||"").trim(), x]));
    ADR21.forEach(([id,name])=>{
      if(!map.has(id)) map.set(id,{id,name,tokens:[]});
      else { const r=map.get(id); r.id=id; r.name=r.name||name; if(!Array.isArray(r.tokens)) r.tokens=[]; }
    });
    return Array.from(map.values());
  }

  // -------- Scoring --------
  function computeByToken(signals, rules){
    const out = rules.map(r=>{
      let score = 0;
      (r.tokens||[]).forEach(t=>{
        const k = typeof t==="string" ? t : t.key;
        const w = typeof t==="string" ? 1 : (t.w||1);
        if (signals.has(k)) score += w;
      });
      return { id:r.id, name:r.name, score };
    });
    out.sort((a,b)=> b.score - a.score || a.name.localeCompare(b.name));
    const max = Math.max(0, ...out.map(o=>o.score));
    out.forEach(o=> o.pct = max>0 ? Math.round(o.score/max*100) : 0);
    return out;
  }
  function computeByEval(){
    const ve = (window.brainRules_vEval && typeof window.brainRules_vEval.computeAll==="function")
               ? window.brainRules_vEval.computeAll() : [];
    const map = new Map(ve.map(x=>[x.key,x]));
    const list = ADR21.map(([id,name])=>{
      const r = map.get(id);
      return { id, name, score: r ? (r.total||0) : 0 };
    });
    list.sort((a,b)=> b.score - a.score || a.name.localeCompare(b.name));
    const max = Math.max(0, ...list.map(o=>o.score));
    list.forEach(o=> o.pct = max>0 ? Math.round(o.score/max*100) : 0);
    return list;
  }

  // -------- Render --------
  function barRow(i, name, pct){
    return `
      <div style="display:flex;align-items:center;gap:.6rem">
        <div style="width:2.2rem;text-align:right;font-weight:800;color:#9d174d">${String(i+1).padStart(2,"0")}</div>
        <div style="flex:1">
          <div style="font-weight:700;color:#4a044e;margin-bottom:.2rem">${name}</div>
          <div style="height:14px;border-radius:999px;background:#fde7f2;border:1px solid rgba(236,72,153,.28);overflow:hidden">
            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#fbcfe8,#f9a8d4,#f472b6)"></div>
          </div>
        </div>
        <div style="width:3.5rem;text-align:right;font-weight:800;color:#4a044e">${pct}%</div>
      </div>`;
  }

  function findPrimaryCard() {
    // การ์ดผลสรุปของเดิมอาจใช้หัวข้อไทยเหล่านี้
    const heads = $$("h1,h2,h3,h4").filter(h =>
      /ผลการประเมินเบื้องต้น|สรุปคะแนนความสอดคล้อง/i.test(h.textContent||"")
    );
    if (heads.length===0) return null;
    return heads[0].closest(".p6-card") || heads[0].parentElement;
  }

  function hideTopSignals() {
    // ซ่อนบล็อก “กราฟผลคะแนนย่อย (Top signals)”
    $$("h1,h2,h3,h4").forEach(h=>{
      if (/กราฟผลคะแนนย่อย/i.test(h.textContent||"")) {
        const wrap = h.closest(".p6-card") || h.parentElement;
        if (wrap) wrap.style.display = "none";
      }
    });
    ["p6TopSignals","p6SignalsBox","p6SignalChart"].forEach(id=>{
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
    const attr = $('[data-p6="signals"]');
    if (attr) attr.style.display = "none";
  }

  function render(results){
    hideTopSignals();

    let card = findPrimaryCard();
    if (card) {
      // ปรับหัวข้อให้บอกว่าเป็นเปอร์เซ็นต์ & ครบ 21 ADR
      const head = $$("h1,h2,h3,h4", card).find(h=>/ผลการประเมินเบื้องต้น|สรุปคะแนนความสอดคล้อง/i.test(h.textContent||""));
      if (head) head.textContent = "สรุปคะแนนความสอดคล้อง (เปอร์เซ็นต์ — 21 ADR)";

      // หาโซนแท่งเดิม ถ้าไม่เจอให้สร้างใหม่ใน card
      let zone = card.querySelector("[data-p6-bars]") || card.querySelector(".p6-bars");
      if (!zone) {
        zone = document.createElement("div");
        zone.setAttribute("data-p6-bars","1");
        card.appendChild(zone);
      }
      const rows = results.map((r,i)=>barRow(i, r.name, r.pct)).join("");
      zone.innerHTML = `<div style="display:flex;flex-direction:column;gap:.55rem">${rows}</div>`;
      return;
    }

    // ไม่พบการ์ดเดิม — เรนเดอร์แบบสแตนด์อโลน
    const box = document.getElementById("p6BrainBox");
    if (box) {
      const rows = results.map((r,i)=>barRow(i, r.name, r.pct)).join("");
      box.innerHTML = `
        <div class="p6-card" style="background:linear-gradient(180deg,#ffeaf4,#fff7fb 60%,#fff);border:1px solid rgba(236,72,153,.25);border-radius:1.2rem;padding:1rem 1rem 1.2rem;box-shadow:0 10px 24px rgba(236,72,153,.12);">
          <h3 style="margin:0 0 .6rem;color:#9d174d;font-weight:800">📊 สรุปคะแนนเป็นเปอร์เซ็นต์ (ครบ 21 ADR)</h3>
          <div style="display:flex;flex-direction:column;gap:.55rem">${rows}</div>
        </div>`;
    }
  }

  // -------- Evaluate --------
  function evaluate(){
    let results;
    try {
      if (Array.isArray(window.brainRules) && window.brainRules.length) {
        const rules = getTokenRules();
        const sigs = collectSignals();
        results = computeByToken(sigs, rules);
      } else {
        results = computeByEval();
      }
    } catch (e) {
      // fallback สุดท้ายป้องกันหน้าแฮงก์
      try { results = computeByEval(); } catch {}
    }
    if (!results) results = ADR21.map(([id,name])=>({id,name,score:0,pct:0}));
    raf(()=>render(results));
    return results;
  }

  // -------- Boot & observers (กัน “หน้าไม่ตอบสนอง”) --------
  function boot() {
    evaluate();

    // อัปเดตเมื่อข้อมูลเปลี่ยน
    on(document,"da:update", ()=>evaluate());

    // เฝ้า DOM: ถ้าผู้ใช้สลับแท็บไปหน้า 6 ทีหลัง ให้เรนเดอร์อัตโนมัติ
    const obs = new MutationObserver(()=>{
      const card = findPrimaryCard() || $("#p6BrainBox");
      if (card) evaluate();
    });
    obs.observe(document.body, { childList:true, subtree:true });

    // รันซ้ำแบบเว้นช่วงสั้นๆ 2–3 ครั้ง กันเคสโหลดช้า
    setTimeout(()=>evaluate(), 150);
    setTimeout(()=>evaluate(), 600);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once:true });
  } else {
    boot();
  }

  // เผยฟังก์ชันให้เรียกเองได้
  window.evaluateDrugAllergy = evaluate;
})();

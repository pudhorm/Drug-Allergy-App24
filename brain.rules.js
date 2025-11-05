/* ============================== brain.rules.js — Gate→Score + Live Debug (DROP-IN) ==============================
 * จุดเด่น
 * - ยืดหยุ่นชื่อฟิลด์จากหน้า 1–3 (รองรับหลาย alias)
 * - Gate ลำดับ: SJS/TEN > Anaphylaxis > DRESS(RegiSCAR-like) > AGEP > (Fallback แบบถ่วงน้ำหนัก)
 * - แผงดีบัก: แสดง Snapshot Input + หลักฐานการตัดสินใจแบบบรรทัดต่อบรรทัด
 * - ปรับจูน runtime ได้ผ่าน window.BRAIN_TUNING โดยไม่แก้ไฟล์
 * -------------------------------------------------------------------------------------------------------------- */

(function () {
  // --------------------------- Tuning knobs (แก้สดได้ที่ console: window.BRAIN_TUNING = {...}) ----------------
  const DEFAULT_TUNING = {
    ANAPHYLAXIS_MAX_HR: 6,
    DRESS_MIN_EOS_PCT: 10,
    DRESS_MIN_AEC: 700,
    DRESS_LIVER_ALT_AST_MIN: 40, // หรือใช้ ≥2×ULN ที่หน้า 3 หากมี
    LUNG_SPO2_CUTOFF: 94,
    HEART_TROP_I: 0.04,
    HEART_TROP_T: 0.01,
    SJS_MIN_MUCOUS: 2,
    SJS_DELAY_WEEKS_MIN: 1,
    SJS_DELAY_WEEKS_MAX: 3,
    DRESS_DELAY_WEEKS_MIN: 2,
    DRESS_DELAY_WEEKS_MAX: 6,
    AGEP_DELAY_WEEKS_MIN: 1,
    AGEP_DELAY_WEEKS_MAX: 3
  };
  function T(k){ const t = (window.BRAIN_TUNING||{}); return (k in t)? t[k] : DEFAULT_TUNING[k]; }

  // --------------------------- Safe helpers ---------------------------
  const has = (o,k)=>o&&Object.prototype.hasOwnProperty.call(o,k);
  function get(o, path, dflt) {
    try {
      const v = path.split(".").reduce((x,k)=> (x && has(x,k)? x[k]: undefined), o);
      return (v==null? dflt : v);
    } catch { return dflt; }
  }
  function n(v){ if(v==null) return NaN; const x=Number(String(v).replace(/[, ]+/g,"")); return Number.isFinite(x)?x:NaN; }
  function b(v){ if(v==null) return false; if(typeof v==="boolean") return v; const s=String(v).toLowerCase(); return ["true","1","yes","on","พบ","มี"].includes(s); }
  const arr = x => Array.isArray(x) ? x : (x? [x]: []);

  // --------------------------- Onset parsing ---------------------------
  function onsetHours(onsetLabel){
    if(!onsetLabel) return NaN;
    const s = String(onsetLabel).toLowerCase();
    if (/<\s*1\s*hr|<\s*1\s*ช/.test(s)) return 0.5;
    if (/1\s*[-–]?\s*6\s*ชั่วโมง|1-6\s*ช/.test(s)) return 3; // use midpoint
    if (/ภายในไม่กี่นาที|ภายใน.*ชั่วโมง/.test(s)) return 2;
    // สัปดาห์ → ชั่วโมง แบบคร่าวๆ
    const m = s.match(/(\d)\s*[–-]?\s*(\d)?\s*สัปดาห์/);
    if (m) {
      const a = Number(m[1]||"1"), b = Number(m[2]||m[1]);
      const midWeek = (a+b)/2;
      return midWeek*7*24;
    }
    if (/2\s*สัปดาห์/.test(s)) return 2*7*24;
    if (/3\s*สัปดาห์/.test(s)) return 3*7*24;
    if (/4\s*สัปดาห์/.test(s)) return 4*7*24;
    if (/5\s*สัปดาห์/.test(s)) return 5*7*24;
    if (/6\s*สัปดาห์/.test(s)) return 6*7*24;
    return NaN;
  }
  const isImmediate = (h)=> Number.isFinite(h) && h <= T("ANAPHYLAXIS_MAX_HR");
  const inWeeks = (h,a,b)=> Number.isFinite(h) && h >= a*7*24 && h <= b*7*24;

  // --------------------------- Snapshot (รองรับ alias จากหน้า 1–3) ---------------------------
  function readSnapshot() {
    const d  = window.drugAllergyData || {};
    const p1 = d.page1 || {};
    const p2 = d.page2 || {};
    const p3 = d.page3 || {};

    // หน้า 1
    const rashShapes = arr(p1.rashShapes || p1.rashShape || p1["1_1"]);
    const rashColors = arr(p1.rashColors || p1.rashColor);
    const blisterRaw = (p1.blister || p1["1_3"] || "");
    const blisterTxt = (typeof blisterRaw==="string")? blisterRaw : JSON.stringify(blisterRaw);
    const pustule    = b(get(p1,"pustule.has", get(p1,"pustule", false)));
    const itch       = b(get(p1,"itch.has", get(p1,"itch", false)));
    const swelling   = b(get(p1,"swelling.has", get(p1,"swelling", false)));
    const peelingTxt = (p1.peeling || get(p1,"skinDetach.text","") || "");
    const skinDetach = {
      center : b(get(p1,"skinDetach.center", /กลาง/.test(peelingTxt))),
      lt10   : b(get(p1,"skinDetach.lt10",   /ไม่เกิน\s*10%|≤\s*10%|<\s*10%/.test(peelingTxt))),
      gt30   : b(get(p1,"skinDetach.gt30",   />\s*30%|เกิน\s*30/.test(peelingTxt)))
    };
    const locations  = arr(p1.locations || p1.location);
    const onsetLabel = String(p1.onset || p1.timeline || "").trim();
    const onsetHrs   = onsetHours(onsetLabel);

    // หน้า 2
    const resp = {
      dyspnea   : b(get(p2,"resp.dyspnea", false)),
      wheeze    : b(get(p2,"resp.wheeze", false)),
      tachypnea : b(get(p2,"resp.tachypnea", false)),
      stridor   : b(get(p2,"resp.stridor", false))
    };
    const cv = {
      hypotension : b(get(p2,"cv.hypotension", get(p2,"cv.lowBP", false))),
      shock       : b(get(p2,"cv.shock", false)),
      sbp         : n(get(p2,"cv.sbp", NaN))
    };
    const feverC = n(get(p2,"inflammation.feverC", get(p2,"feverC", get(p2,"fever", NaN))));
    const lnSwollen = b(get(p2,"lymphadenopathy", get(p2,"nodes.enlarged", false)));

    // ประมาณจำนวนเยื่อบุที่เกี่ยวข้อง
    let mucosaCount = 0;
    if (b(get(p2,"vision.conjunctivitis", false))) mucosaCount++;
    if (b(get(p2,"gi.mucosaMouth", false)) || b(get(p2,"throat.sore", false))) mucosaCount++;
    if (b(get(p2,"gu.genitalMucosa", false))) mucosaCount++;
    if (b(get(p2,"resp.nasalMucosa", false))) mucosaCount++;

    // หน้า 3 (Lab)
    const eosPct = n(get(p3,"cbc.eos.value", NaN));
    const aec    = n(get(p3,"cbc.aec.value", NaN));
    const neut   = n(get(p3,"cbc.neut.value", NaN));
    const wbc    = n(get(p3,"cbc.wbc.value", NaN));

    const alt    = n(get(p3,"lft.alt.value", NaN));
    const ast    = n(get(p3,"lft.ast.value", NaN));

    const cre    = n(get(p3,"rft.cre.value", NaN));
    const egfr   = n(get(p3,"rft.egfr.value", NaN));
    const uaProt = String(get(p3,"ua.protein.value","")).toLowerCase();

    const spo2   = n(get(p3,"lung.spo2.value", NaN));
    const cxrTxt = String(get(p3,"lung.cxr.value","")).toLowerCase();

    const tropI  = n(get(p3,"heart.tropi.value", NaN));
    const tropT  = n(get(p3,"heart.tropt.value", NaN));
    const ckmb   = n(get(p3,"heart.ckmb.value", NaN));
    const ekgTxt = String(get(p3,"heart.ekg.value","")).toLowerCase();

    const organ = {
      liver : (Number.isFinite(alt)&&alt>=T("DRESS_LIVER_ALT_AST_MIN")) || (Number.isFinite(ast)&&ast>=T("DRESS_LIVER_ALT_AST_MIN")),
      kidney: (Number.isFinite(cre)&&cre>=1.3) || (Number.isFinite(egfr)&&egfr<60) || /\+|protein/.test(uaProt),
      lung  : (Number.isFinite(spo2)&&spo2<T("LUNG_SPO2_CUTOFF")) || /(infiltrat|patchy|opacity|pneumon)/i.test(cxrTxt),
      heart : (Number.isFinite(tropI)&&tropI>T("HEART_TROP_I")) || (Number.isFinite(tropT)&&tropT>=T("HEART_TROP_T")) ||
              (Number.isFinite(ckmb)&&ckmb>0) || /(st[- ]?t|av block|qt|arrhythm)/i.test(ekgTxt)
    };

    return {
      ready: !!(p1.__saved && p2.__saved && p3.__saved),
      p1,p2,p3,
      rashShapes,rashColors,blisterTxt,pustule,itch,swelling,skinDetach,locations,onsetLabel,onsetHrs,
      resp,cv,feverC,lnSwollen,mucosaCount,
      eosPct,aec,neut,wbc,alt,ast,cre,egfr,uaProt,spo2,cxrTxt,tropI,tropT,ckmb,ekgTxt,organ
    };
  }

  // --------------------------- Explain collector ---------------------------
  function Explain(){ this.lines=[]; }
  Explain.prototype.say = function(s){ this.lines.push(String(s)); };
  Explain.prototype.dump = function(){ return this.lines.slice(); };

  // --------------------------- Gates ---------------------------
  function gateSJS_TEN(s, E){
    if (s.skinDetach.gt30) { E.say("✅ TEN: ผิวหลุดลอก >30% BSA"); return {label:"TEN",conf:"high"}; }
    const delayOK = inWeeks(s.onsetHrs, T("SJS_DELAY_WEEKS_MIN"), T("SJS_DELAY_WEEKS_MAX"));
    if ((s.skinDetach.lt10 || s.skinDetach.center) && delayOK && s.mucosaCount>=1) {
      E.say("✅ SJS: ผิวหลุดลอกเล็กน้อย/กลางผื่น + เยื่อบุ ≥1 + onset เข้า 1–3 สัปดาห์");
      return {label:"SJS", conf: s.mucosaCount>=T("SJS_MIN_MUCOUS")? "high":"medium"};
    }
    if (s.mucosaCount>=T("SJS_MIN_MUCOUS") && delayOK) {
      E.say("✅ SJS: เยื่อบุ ≥2 + onset 1–3 สัปดาห์");
      return {label:"SJS", conf:"high"};
    }
    E.say("❌ SJS/TEN: ยังไม่ผ่าน Gate");
    return null;
  }

  function gateAnaphylaxis(s, E){
    const skinOrMucosa = s.itch || s.swelling || s.rashShapes.length>0;
    const respHit = s.resp.dyspnea || s.resp.wheeze || s.resp.stridor;
    const cvHit   = s.cv.hypotension || s.cv.shock || (Number.isFinite(s.cv.sbp)&&s.cv.sbp<90);
    const giHit   = b(get(s.p2,"gi.cramp",false)) || b(get(s.p2,"gi.vomit",false)) || b(get(s.p2,"gi.diarrhea",false));
    const systems = [ skinOrMucosa&&"ผิวหนัง/เยื่อบุ", respHit&&"หายใจ", cvHit&&"ไหลเวียน", giHit&&"ทางเดินอาหาร" ].filter(Boolean);
    if (isImmediate(s.onsetHrs) && ((skinOrMucosa && (respHit||cvHit)) || systems.length>=2)) {
      E.say("✅ Anaphylaxis: onset ≤6 ชม. + ระบบเกี่ยวข้อง: "+systems.join(", "));
      return {label:"Anaphylaxis", conf:"high"};
    }
    E.say("❌ Anaphylaxis: ยังไม่ผ่าน Gate");
    return null;
  }

  function gateDRESS(s, E){
    const skin = s.rashShapes.length || s.rashColors.length || s.skinDetach.center || s.skinDetach.lt10 || s.skinDetach.gt30;
    const sysOrBlood = (Number.isFinite(s.feverC)&&s.feverC>=37.5) || s.lnSwollen ||
                       (Number.isFinite(s.eosPct)&&s.eosPct>=T("DRESS_MIN_EOS_PCT")) ||
                       (Number.isFinite(s.aec)&&s.aec>=T("DRESS_MIN_AEC")) ||
                       b(get(s.p3,"cbc.atypical.checked",false));
    const organ = s.organ.liver || s.organ.kidney || s.organ.lung || s.organ.heart;
    const timing = inWeeks(s.onsetHrs, T("DRESS_DELAY_WEEKS_MIN"), T("DRESS_DELAY_WEEKS_MAX"));
    if (skin && sysOrBlood && organ && timing) {
      E.say("✅ DRESS Gate: ผิวหนัง + (ไข้/ต่อมน้ำเหลือง/เลือด) + อวัยวะ ≥1 + onset 2–6 สัปดาห์");
      return {label:"DRESS", conf:"high"};
    }
    E.say("❌ DRESS Gate: ยังไม่ครบ");
    return null;
  }

  function gateAGEP(s, E){
    const delayOK = inWeeks(s.onsetHrs, T("AGEP_DELAY_WEEKS_MIN"), T("AGEP_DELAY_WEEKS_MAX"));
    const feverHi = Number.isFinite(s.feverC)&&s.feverC>=38.0;
    const neutHi  = Number.isFinite(s.neut)&&s.neut>=70;
    if (s.pustule && delayOK && (feverHi || neutHi)) {
      E.say("✅ AGEP: ตุ่มหนอง <5mm มาก + (ไข้≥38 หรือ neut สูง) + onset 1–3 สัปดาห์");
      return {label:"AGEP", conf:"high"};
    }
    E.say("❌ AGEP Gate: ยังไม่ครบ");
    return null;
  }

  // --------------------------- Weighted fallback ---------------------------
  function fallbackScore(s, E){
    const S = Object.create(null);
    const add = (k,w,msg)=>{ S[k]=(S[k]||0)+w; if(msg) E.say(`+${w} ${k}: ${msg}`); };

    // Urticaria
    if (s.itch) add("Urticaria",3,"คันเด่น");
    if (s.rashShapes.includes("ปื้นนูน")) add("Urticaria",2,"รูปร่างปื้นนูน");
    if (s.rashColors.includes("แดง")) add("Urticaria",1,"สีแดง/flare");
    if (isImmediate(s.onsetHrs)) add("Urticaria",1,"onset เร็ว");

    // Angioedema
    if (s.swelling) add("Angioedema",3,"บวมชั้นลึก");
    if (isImmediate(s.onsetHrs)) add("Angioedema",1,"onset เร็ว");

    // Maculopapular exanthem (MPE)
    if (s.rashColors.includes("แดง")) add("Maculopapular rash",1,"แดง");
    if (s.rashShapes.length>=1) add("Maculopapular rash",1,"macule/papule");
    if (inWeeks(s.onsetHrs,1,6)) add("Maculopapular rash",1,"onset 1–6 สัปดาห์");

    // FDE
    const ringish = s.rashShapes.some(x=>/วง|วงรี|target/i.test(x));
    const purple  = s.rashColors.some(x=>/(ม่วง|แดงเข้ม|แดงจัด|คล้ำ)/i.test(x));
    const fdeLoc  = s.locations.some(x=>/ริมฝีปาก|อวัยวะเพศ|มือ|เท้า/i.test(x));
    if (ringish && purple) add("Fixed drug eruption",2,"วง/วงรี + สีอมม่วง/แดงจัด");
    if (fdeLoc) add("Fixed drug eruption",1,"ตำแหน่งพบบ่อย FDE");
    if (inWeeks(s.onsetHrs,1,6)) add("Fixed drug eruption",1,"onset เข้ากับ FDE");

    // Photosensitivity
    const sunPos = s.locations.some(x=>/ใบหน้า|หลังมือ|แขน.*นอก|หน้าอก.*นอกเสื้อ|หน้าแข้ง/i.test(x));
    const burny  = s.rashColors.some(x=>/แดงไหม้/i.test(x));
    if (sunPos && burny) add("Photosensitivity drug eruption",2,"บริเวณโดนแดด + แดงไหม้");
    if (!s.itch && sunPos) add("Photosensitivity drug eruption",1,"ไม่คันลักษณะ phototoxic");

    // AGEP (อ่อน)
    if (s.pustule) add("AGEP",2,"ตุ่มหนอง <5mm มาก");
    if (Number.isFinite(s.feverC)&&s.feverC>=38) add("AGEP",1,"ไข้สูง");

    // SJS/TEN (อ่อน)
    if (s.skinDetach.lt10 || s.skinDetach.center) add("SJS",2,"ผิวหลุดลอกเล็กน้อย/กลางผื่น");
    if (s.mucosaCount>=1) add("SJS",1,"เยื่อบุ≥1");
    if (s.skinDetach.gt30) add("TEN",3,">30% (ข้อมูลอาจไม่ครบ)");

    // DRESS (อ่อน)
    if ((Number.isFinite(s.eosPct)&&s.eosPct>=T("DRESS_MIN_EOS_PCT"))||(Number.isFinite(s.aec)&&s.aec>=T("DRESS_MIN_AEC"))) add("DRESS",2,"eosinophil สูง");
    if (s.organ.liver||s.organ.kidney||s.organ.lung||s.organ.heart) add("DRESS",2,"อวัยวะภายในเกี่ยวข้อง");
    if (Number.isFinite(s.feverC)&&s.feverC>=37.5) add("DRESS",1,"ไข้");
    if (inWeeks(s.onsetHrs, T("DRESS_DELAY_WEEKS_MIN"), T("DRESS_DELAY_WEEKS_MAX"))) add("DRESS",1,"onset 2–6 สัปดาห์");

    // EM
    const target3 = s.rashShapes.some(x=>/(เป้า|target|วง.*3\s*ชั้น)/i.test(x)) || s.rashColors.some(x=>/(วง.*3\s*ชั้น)/i.test(x));
    if (target3) add("Erythema multiforme",2,"target-like (3 ชั้น)");

    // Bullous
    const bullous = /ตุ่มน้ำ(ใหญ่|พอง)|bulla|bullous|พองตึง/i.test(s.blisterTxt);
    if (bullous) add("Bullous Drug Eruption",2,"ตุ่มน้ำพองตึง/ใหญ่");

    const ranked = Object.entries(S).sort((a,b)=>b[1]-a[1]);
    if (!ranked.length) return null;
    const [top, val] = ranked[0];
    const conf = val>=5? "medium":"low";
    E.say(`⇒ Fallback เลือก ${top} (คะแนน ${val})`);
    return {label:top, conf, ranking:ranked};
  }

  // --------------------------- Evaluate & Render ---------------------------
  function evaluateAll(){
    const E = new Explain();
    const s = readSnapshot();

    if (!s.ready) {
      E.say("ยังไม่ได้กดบันทึกครบหน้า 1–3");
      return { ready:false, label:null, conf:"low", explain:E.dump(), snap:s };
    }

    // Gate priority: SJS/TEN > Anaphylaxis > DRESS > AGEP
    let res = gateSJS_TEN(s,E) || gateAnaphylaxis(s,E) || gateDRESS(s,E) || gateAGEP(s,E);
    if (!res) res = fallbackScore(s,E) || {label:null, conf:"low"};
    return { ready:true, ...res, explain:E.dump(), snap:s };
  }

  function ensureBrainBox(){
    let box = document.getElementById("brainBox");
    if (!box){
      box = document.createElement("div");
      box.id = "brainBox";
      box.style.display = "none"; // page6 mirror จะคัดลอกไป #p6BrainBox เอง
      document.body.appendChild(box);
    }
    return box;
  }

  function fmt(v){
    if (v===true) return "✓";
    if (v===false) return "—";
    if (v==null || v==="") return "—";
    if (typeof v==="number" && !Number.isFinite(v)) return "—";
    return String(v);
  }

  function renderDebug(result){
    const s = result.snap;
    return `
      <details style="margin-top:.6rem;">
        <summary style="cursor:pointer;font-weight:700;color:#374151">ดูข้อมูลที่ใช้ประเมิน (Live snapshot)</summary>
        <div style="display:grid;grid-template-columns: 220px 1fr; gap:6px 14px; font-size:.92rem; margin-top:.5rem;">
          <div style="color:#6b7280">Onset (ชั่วโมงโดยประมาณ)</div><div>${fmt(s.onsetHrs)}</div>
          <div style="color:#6b7280">รูปร่างผื่น</div><div>${fmt(s.rashShapes.join(", "))}</div>
          <div style="color:#6b7280">สีผื่น</div><div>${fmt(s.rashColors.join(", "))}</div>
          <div style="color:#6b7280">ตุ่มหนอง</div><div>${fmt(s.pustule)}</div>
          <div style="color:#6b7280">คัน</div><div>${fmt(s.itch)}</div>
          <div style="color:#6b7280">บวม (angioedema)</div><div>${fmt(s.swelling)}</div>
          <div style="color:#6b7280">หลุดลอก &lt;10%</div><div>${fmt(s.skinDetach.lt10)}</div>
          <div style="color:#6b7280">หลุดลอกตรงกลางผื่น</div><div>${fmt(s.skinDetach.center)}</div>
          <div style="color:#6b7280">หลุดลอก &gt;30%</div><div>${fmt(s.skinDetach.gt30)}</div>
          <div style="color:#6b7280">มิวคอซาเกี่ยวข้อง (จำนวน)</div><div>${fmt(s.mucosaCount)}</div>
          <div style="color:#6b7280">ตำแหน่ง</div><div>${fmt(s.locations.join(", "))}</div>

          <div style="grid-column:1/-1;height:1px;background:#e5e7eb;margin:.25rem 0;"></div>

          <div style="color:#6b7280">ไข้ (°C)</div><div>${fmt(s.feverC)}</div>
          <div style="color:#6b7280">Eosinophil %</div><div>${fmt(s.eosPct)}</div>
          <div style="color:#6b7280">AEC (/µL)</div><div>${fmt(s.aec)}</div>
          <div style="color:#6b7280">ALT / AST</div><div>${fmt(s.alt)} / ${fmt(s.ast)}</div>
          <div style="color:#6b7280">Creatinine / eGFR</div><div>${fmt(s.cre)} / ${fmt(s.egfr)}</div>
          <div style="color:#6b7280">UA โปรตีน</div><div>${fmt(s.uaProt)}</div>
          <div style="color:#6b7280">SpO₂</div><div>${fmt(s.spo2)}</div>
          <div style="color:#6b7280">Troponin I / T</div><div>${fmt(s.tropI)} / ${fmt(s.tropT)}</div>
          <div style="color:#6b7280">EKG</div><div>${fmt(s.ekgTxt)}</div>
        </div>
      </details>
    `;
  }

  function renderExplain(lines){
    if (!lines || !lines.length) return "";
    return `
      <details style="margin-top:.5rem;">
        <summary style="cursor:pointer;font-weight:700;color:#374151">ดูเหตุผล/เกณฑ์ที่ตรง</summary>
        <ul style="margin:.4rem 0 0 1.1rem; padding:0; list-style:disc; color:#374151; font-size:.92rem;">
          ${lines.map(x=>String(x).replace(/[<>&]/g,m=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[m]))).map(t=>`<li>${t}</li>`).join("")}
        </ul>
      </details>
    `;
  }

  function render(result){
    const box = ensureBrainBox();

    if (!result.ready) {
      box.innerHTML = `<div class="p6-muted">ยังไม่ได้กดบันทึกครบหน้า 1–3</div>`;
      return;
    }
    if (!result.label) {
      box.innerHTML = `<div class="p6-muted">ยังไม่มีสัญญาณเด่นพอจากข้อมูลที่กรอก</div>${renderExplain(result.explain)}${renderDebug(result)}`;
      return;
    }

    const ranking = result.ranking && result.ranking.length
      ? `<ol class="p6-list" style="margin-top:.35rem;">${
          result.ranking.slice(0,8).map(([k,v],i)=>`<li>${i+1}) ${k} <span style="color:#6b7280">(+${v})</span></li>`).join("")
        }</ol>` : "";

    box.innerHTML = `
      <div>
        <div style="font-weight:700;margin-bottom:.25rem;">
          ผลเด่น: <span style="font-weight:800;">${result.label}</span>
          <span style="color:#6b7280;font-weight:600;margin-left:.25rem;">(ความเชื่อมั่น: ${result.conf})</span>
        </div>
        ${ranking}
        ${renderExplain(result.explain)}
        ${renderDebug(result)}
      </div>
    `;
  }

  // --------------------------- Public API ---------------------------
  window.evaluateDrugAllergy = function(opts){ try { return evaluateAll(); } catch(e){ console.warn(e); return {ready:false,label:null,conf:"low",explain:[String(e)]}; } };
  window.brainComputeAndRender = function(opts){ const r = window.evaluateDrugAllergy(opts); try{ render(r); }catch(e){ console.warn(e);} return r; };

  // kickoff & hooks
  setTimeout(()=>{ try{ window.brainComputeAndRender(); }catch(_){} },0);
  document.addEventListener("da:update", ()=>{ try{ window.brainComputeAndRender(); }catch(_){} });
})();

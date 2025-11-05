// ===================== page6.js — หน้า 6 (Type of ADR + Visual Timeline) =====================
(function () {
  if (!window.drugAllergyData) window.drugAllergyData = {};

  // ---------- ตรวจความพร้อมของหน้า 1–3 ----------
  function checkCorePagesReady() {
    const d = window.drugAllergyData || {};
    const p1 = !!(d.page1 && d.page1.__saved === true);
    const p2 = !!(d.page2 && d.page2.__saved === true);
    const p3 = !!(d.page3 && d.page3.__saved === true);
    const missing = [];
    if (!p1) missing.push("หน้า 1 ผิวหนัง");
    if (!p2) missing.push("หน้า 2 ระบบอื่นๆ");
    if (!p3) missing.push("หน้า 3 Lab");
    return { ready: p1 && p2 && p3, missing };
  }

  // ---------- Naranjo helpers (สอดคล้องหน้า 4) ----------
  const P6_NARANJO_QUESTIONS = [
    { idx: 0,  yes: +1, no: 0,  dk: 0 },
    { idx: 1,  yes: +2, no: -1, dk: 0 },
    { idx: 2,  yes: +1, no: 0,  dk: 0 },
    { idx: 3,  yes: +2, no: -1, dk: 0 },
    { idx: 4,  yes: -1, no: +2, dk: 0 },
    { idx: 5,  yes: -1, no: +1, dk: 0 },
    { idx: 6,  yes: +1, no: 0,  dk: 0 },
    { idx: 7,  yes: +1, no: 0,  dk: 0 },
    { idx: 8,  yes: +1, no: 0,  dk: 0 },
    { idx: 9,  yes: +1, no: 0,  dk: 0 },
  ];
  function p6_calcNaranjoScore(drug) {
    if (!drug || !drug.answers) return 0;
    let total = 0;
    for (const q of P6_NARANJO_QUESTIONS) {
      const picked = drug.answers[q.idx];
      if (!picked) continue;
      total += q[picked] ?? 0;
    }
    return total;
  }
  function p6_interp(score) {
    if (score >= 9) return "แน่นอน (Definite)";
    if (score >= 5) return "น่าจะเป็น (Probable)";
    if (score >= 1) return "อาจเป็นไปได้ (Possible)";
    return "ไม่น่าจะเป็น (Doubtful)";
  }

  // ---------- เครื่องมือวันที่/เวลา ----------
  function fmtDateTH(str) {
    if (!str) return "—";
    const pure = String(str).trim().split(" ")[0];
    let d;
    if (pure.includes("-")) { const [y,m,dd]=pure.split("-").map(Number); if (y&&m&&dd) d=new Date(y,m-1,dd); }
    else if (pure.includes("/")) { const [dd,m,y]=pure.split("/").map(Number); if (y&&m&&dd) d=new Date(y,m-1,dd); }
    if (!d) return str;
    return d.toLocaleDateString("th-TH",{day:"numeric",month:"short",year:"numeric"});
  }
  function fmtTime(str){ if(!str) return ""; const t=String(str).slice(0,5); return t+" น."; }
  function rangeStr(sD,sT,eD,eT){
    const start=`${fmtDateTH(sD)}${sT?(" "+fmtTime(sT)):""}`;
    const end = eD ? `${fmtDateTH(eD)}${eT?(" "+fmtTime(eT)):""}` : "ปัจจุบัน";
    return `${start} → ${end}`;
  }

  // ---------- ดึงข้อมูลจากหน้า 4 / 5 ----------
  function getNaranjoListFromPage4() {
    const p4 = (window.drugAllergyData && window.drugAllergyData.page4) || {};
    const drugs = Array.isArray(p4.drugs) ? p4.drugs : [];
    if (!drugs.length) return [];
    return drugs.map((d, i) => {
      const total = p6_calcNaranjoScore(d);
      return {
        name: (d.name && d.name.trim()) ? d.name.trim() : `ยา ${i + 1}`,
        total,
        interpretation: p6_interp(total),
      };
    });
  }
  function getPage5Data() {
    const p5 = (window.drugAllergyData && window.drugAllergyData.page5) || {};
    return {
      drugs: Array.isArray(p5.drugLines) ? p5.drugLines : [],
      adrs:  Array.isArray(p5.adrLines)  ? p5.adrLines  : []
    };
  }

  // ---------- Visual Timeline (ตรรกะเดียวกับหน้า 5) ----------
  function p6DrawVisualTimeline() {
    const dateRow = document.getElementById("p6DateRow");
    const drugLane = document.getElementById("p6DrugLane");
    const adrLane  = document.getElementById("p6AdrLane");
    const sc       = document.getElementById("p6TimelineScroll");
    if (!dateRow || !drugLane || !adrLane) return;

    const { drugs, adrs } = getPage5Data();

    dateRow.innerHTML = "";
    drugLane.innerHTML = "";
    adrLane.innerHTML = "";
    if (!drugs.length && !adrs.length) return;

    const MS_DAY = 24*60*60*1000;
    const DAY_W  = 120;

    function parseDate(str){
      if(!str) return null;
      const pure=String(str).trim().split(" ")[0];
      if(pure.includes("-")){ const [y,m,d]=pure.split("-").map(Number); if(y&&m&&d) return new Date(y,m-1,d); }
      if(pure.includes("/")){ const [d,m,y]=pure.split("/").map(Number); if(y&&m&&d) return new Date(y,m-1,d); }
      return null;
    }

    const today = new Date(); const today0=new Date(today.getFullYear(),today.getMonth(),today.getDate());

    let minDate = null;
    drugs.forEach(d=>{ const s=parseDate(d.startDate); if(s && (!minDate || s<minDate)) minDate=s; });
    adrs.forEach(a=>{ const s=parseDate(a.startDate); if(s && (!minDate || s<minDate)) minDate=s; });
    if(!minDate) minDate = today0;

    const maxDate = today0;
    const totalDays = Math.floor((maxDate - minDate)/MS_DAY) + 1;

    // หัววัน
    dateRow.style.display="grid";
    dateRow.style.gridTemplateColumns=`repeat(${totalDays}, ${DAY_W}px)`;
    for(let i=0;i<totalDays;i++){
      const d = new Date(minDate.getFullYear(),minDate.getMonth(),minDate.getDate()+i);
      const cell=document.createElement("div");
      cell.className="p6-date-cell";
      cell.textContent = d.toLocaleDateString("th-TH",{day:"numeric",month:"short"});
      dateRow.appendChild(cell);
    }

    // Lanes
    const ROW_H=46;
    function prepLane(el,rows){
      el.style.display="grid";
      el.style.gridTemplateColumns=`repeat(${totalDays}, ${DAY_W}px)`;
      el.style.gridAutoRows=ROW_H+"px";
      el.style.rowGap="6px";
      el.style.height=(Math.max(rows,1)*(ROW_H+6))+"px";
      el.innerHTML="";
    }
    prepLane(drugLane, drugs.length);
    prepLane(adrLane,  adrs.length);
    adrLane.style.marginTop="10px";

    function dayIndexOf(date){ return Math.floor((date - minDate)/MS_DAY); }

    // วาดยา
    drugs.forEach((d,idx)=>{
      const start=parseDate(d.startDate); if(!start) return;

      let end;
      if (d.stopDate){ const e=parseDate(d.stopDate); end = e? new Date(e.getFullYear(),e.getMonth(),e.getDate()-1): maxDate; }
      else end=maxDate;

      if (end<start) end=start;
      if (end>maxDate) end=maxDate;

      const sIdx = dayIndexOf(start);
      const eIdx = dayIndexOf(end);

      const isSameDayExplicit =
        d.startDate && d.stopDate &&
        parseDate(d.startDate) && parseDate(d.stopDate) &&
        dayIndexOf(parseDate(d.startDate)) === dayIndexOf(parseDate(d.stopDate));

      if (isSameDayExplicit) {
        const cell = document.createElement("div");
        cell.style.gridColumn = `${sIdx + 1} / ${sIdx + 2}`;
        cell.style.gridRow = `${idx + 1}`;
        cell.style.display = "flex";
        cell.style.alignItems = "center";
        cell.style.justifyContent = "flex-start";
        const dot = document.createElement("div");
        dot.title = (d.name||"").trim() || `ยาตัวที่ ${idx+1}`;
        dot.style.width = "16px";
        dot.style.height = "16px";
        dot.style.borderRadius = "9999px";
        dot.style.background = "linear-gradient(90deg,#1679ff 0%,#25c4ff 100%)";
        dot.style.boxShadow = "0 8px 22px rgba(15,23,42,.12)";
        dot.style.marginLeft = "4px";
        cell.appendChild(dot);
        drugLane.appendChild(cell);
        return;
      }

      const bar=document.createElement("div");
      bar.className="p6-bar p6-bar-drug";
      bar.textContent = (d.name && d.name.trim()) ? d.name.trim() : `ยาตัวที่ ${idx+1}`;
      bar.style.gridColumn = `${sIdx+1} / ${eIdx+2}`;
      bar.style.gridRow = `${idx+1}`;
      drugLane.appendChild(bar);
    });

    // วาด ADR
    adrs.forEach((a,idx)=>{
      const start=parseDate(a.startDate); if(!start) return;

      let end;
      if (a.endDate){ const e=parseDate(a.endDate); end = e? new Date(e.getFullYear(),e.getMonth(),e.getDate()-1): maxDate; }
      else end=maxDate;

      if (end<start) end=start;
      if (end>maxDate) end=maxDate;

      const sIdx = dayIndexOf(start);
      const eIdx = dayIndexOf(end);

      const isSameDayExplicit =
        a.startDate && a.endDate &&
        parseDate(a.startDate) && parseDate(a.endDate) &&
        dayIndexOf(parseDate(a.startDate)) === dayIndexOf(parseDate(a.endDate));

      if (isSameDayExplicit) {
        const cell = document.createElement("div");
        cell.style.gridColumn = `${sIdx + 1} / ${sIdx + 2}`;
        cell.style.gridRow = `${idx + 1}`;
        cell.style.display = "flex";
        cell.style.alignItems = "center";
        cell.style.justifyContent = "flex-start";
        const dot = document.createElement("div");
        dot.title = (a.symptom||"").trim() || `ADR ${idx+1}`;
        dot.style.width = "16px";
        dot.style.height = "16px";
        dot.style.borderRadius = "9999px";
        dot.style.background = "linear-gradient(90deg,#f43f5e 0%,#f97316 100%)";
        dot.style.boxShadow = "0 8px 22px rgba(15,23,42,.12)";
        dot.style.marginLeft = "4px";
        cell.appendChild(dot);
        adrLane.appendChild(cell);
        return;
      }

      const bar=document.createElement("div");
      bar.className="p6-bar p6-bar-adr";
      bar.textContent = (a.symptom && a.symptom.trim()) ? a.symptom.trim() : `ADR ${idx+1}`;
      bar.style.gridColumn = `${sIdx+1} / ${eIdx+2}`;
      bar.style.gridRow = `${idx+1}`;
      adrLane.appendChild(bar);
    });

    if (sc) sc.scrollLeft = sc.scrollWidth;
  }

  // ---------- ส่วนที่ 2 / 3 / 4 ----------
  function renderSection2(drugNames) {
    return `
      <div class="p6-block sec2">
        <div class="p6-head"><div class="p6-emoji">💊</div><div class="p6-head-title">ส่วนที่ 2: ยาที่มีรายงานการเกิดการแพ้ยาดังกล่าว</div></div>
        <div class="p6-subcard">
          <div class="p6-sub-title">ยาที่ผู้ป่วยได้รับ:</div>
          <p class="p6-muted">${drugNames && drugNames.length ? drugNames.join(", ") : "ยังไม่มีข้อมูลยา (รอข้อมูลจากหน้า 4 / 5 หรือระบบ timeline)"}</p>
        </div>
        <div class="p6-subcard"><div class="p6-sub-title">รายงานการแพ้:</div><p class="p6-muted">รอข้อมูลและการวิเคราะห์ภายหลังกำหนดกฎการประเมิน…</p></div>
      </div>
    `;
  }
  function renderSection3() {
    return `
      <div class="p6-block sec3">
        <div class="p6-head"><div class="p6-emoji">💉</div><div class="p6-head-title">ส่วนที่ 3: แนวทางการรักษาเฉพาะตามชนิดการแพ้</div></div>
        <div class="p6-subcard"><div class="p6-sub-title">การรักษาเฉพาะ:</div>
          <p class="p6-muted">ส่วนนี้จะดึงจาก “สมองการแพ้ยา” ภายหลัง</p>
        </div>
      </div>
    `;
  }
  function renderSection4() {
    const naranjoList = getNaranjoListFromPage4();
    const { drugs, adrs } = getPage5Data();

    const drugList = drugs.length
      ? `<ol class="p6-list">${drugs.map((d,i)=>`<li><strong>${(d.name||'').trim()||('ยาตัวที่ '+(i+1))}</strong> — ${rangeStr(d.startDate,d.startTime,d.stopDate,d.stopTime)}</li>`).join("")}</ol>`
      : `<p class="p6-muted">— ไม่มีรายการยา —</p>`;

    const adrList = adrs.length
      ? `<ol class="p6-list">${adrs.map((a,i)=>`<li><strong>${(a.symptom||'').trim()||('ADR '+(i+1))}</strong> — ${rangeStr(a.startDate,a.startTime,a.endDate,a.endTime)}</li>`).join("")}</ol>`
      : `<p class="p6-muted">— ไม่มี ADR —</p>`;

    const visualBox = `
      <div class="p6-visual-box">
        <h4 class="p6-visual-title">Visual Timeline</h4>
        <div id="p6TimelineScroll" class="p6-timeline-scroll">
          <div id="p6DateRow"></div>
          <div class="p6-lane">
            <div class="p6-lane-label">ยา</div>
            <div id="p6DrugLane"></div>
          </div>
          <div class="p6-lane">
            <div class="p6-lane-label p6-lane-adr">ADR</div>
            <div id="p6AdrLane"></div>
          </div>
        </div>
      </div>
    `;

    const naranjoHTML = naranjoList.length
      ? `
        <div class="p6-naranjo-list">
          ${naranjoList.map(item => `
            <div class="p6-naranjo-item">
              <div class="p6-naranjo-name">${item.name}</div>
              <div class="p6-naranjo-score">${item.total}</div>
            </div>
            <p class="p6-muted" style="margin-top:2px;margin-bottom:10px;">สรุป: ${item.interpretation}</p>
          `).join("")}
        </div>
      `
      : `<div class="p6-empty">ยังไม่มีข้อมูล Naranjo (กรุณากดบันทึกในหน้า 4)</div>`;

    return `
      <div class="p6-block sec4">
        <div class="p6-head"><div class="p6-emoji">📊</div><div class="p6-head-title">ส่วนที่ 4: ผลการประเมิน Naranjo และ Timeline</div></div>

        <div class="p6-subcard">
          <div class="p6-sub-title">ผลประเมิน Naranjo Adverse Drug Reaction Probability Scale</div>
          ${naranjoHTML}
        </div>

        <div class="p6-subcard">
          <div class="p6-sub-title">Timeline แสดงความสัมพันธ์ระหว่างยาและอาการ</div>
          <div class="p6-timeline-readable">
            <div class="p6-sub-sub">
              <div class="p6-sub-title" style="margin-bottom:.35rem;">💊 รายการยา</div>
              ${drugList}
            </div>
            <div class="p6-sub-sub" style="margin-top:.65rem;">
              <div class="p6-sub-title" style="margin-bottom:.35rem;">🧪 ADR</div>
              ${adrList}
            </div>
          </div>
          ${visualBox}
        </div>
      </div>
    `;
  }

  // ---------- เรนเดอร์หน้า 6 ----------
  function renderPage6() {
    const root = document.getElementById("p6Root");
    if (!root) return;

    const readyInfo = checkCorePagesReady();

    // รายการชนิดย่อย
    const subtypesList = `
      <ul class="p6-muted" style="margin-top:.35rem;">
        <li>Urticaria</li>
        <li>Anaphylaxis</li>
        <li>Angioedema</li>
        <li>Maculopapular rash</li>
        <li>Fixed drug eruption</li>
        <li>AGEP</li>
        <li>SJS</li>
        <li>TEN</li>
        <li>DRESS</li>
        <li>Erythema multiforme</li>
        <li>Photosensitivity drug eruption</li>
        <li>Exfoliative dermatitis</li>
        <li>Eczematous drug eruption</li>
        <li>Bullous Drug Eruption</li>
        <li>Serum sickness</li>
        <li>Vasculitis</li>
        <li>Hemolytic anemia</li>
        <li>Pancytopenia / Neutropenia / Thrombocytopenia</li>
        <li>Nephritis</li>
      </ul>
    `;

    const section1HTML = `
      <div class="p6-block sec1">
        <div class="p6-head">
          <div class="p6-emoji">🤖</div>
          <div class="p6-head-title">ส่วนที่ 1: Type of ADR (Non-immunologic &amp; Immunologic)</div>
        </div>
        <div class="p6-subcard">
          <div class="p6-sub-title">อาการ/อาการแสดงทางคลินิกของการแพ้ยา</div>
          ${subtypesList}
          ${
            readyInfo.ready
              ? `<p class="p6-muted" style="margin-top:.35rem;">
                   ระบบจะประเมินจากข้อมูลที่กดบันทึกครบหน้า 1–3 แล้วสรุปว่า<strong>เข้ากับชนิดย่อยใด</strong>โดยอัตโนมัติ
                 </p>`
              : `<div class="p6-empty">ยังขาดข้อมูลจาก: ${readyInfo.missing.join(", ")}</div>
                 <p class="p6-muted" style="margin-top:.35rem;">กรุณากด <strong>บันทึก</strong> ให้ครบทั้ง 3 หน้า (หน้า 1 ผิวหนัง, หน้า 2 ระบบอื่นๆ, หน้า 3 Lab) ก่อน จึงจะเริ่มประเมินชนิดย่อยได้</p>`
          }
        </div>

        <div class="p6-subcard">
          <div class="p6-sub-title">ผลการประเมินเบื้องต้น</div>
          <div id="p6BrainBox" class="p6-muted">ยังไม่มีข้อมูลเพียงพอจากหน้า 1–3 หรือยังไม่คำนวณ</div>
          <div style="margin-top:.6rem;">
            <button id="p6BrainRefreshBtn" class="p6-btn p6-btn-outline">🔄 รีเฟรชผลประเมิน</button>
          </div>
        </div>
      </div>
    `;

    const p4 = (window.drugAllergyData && window.drugAllergyData.page4) || {};
    const drugNames = Array.isArray(p4.drugs) ? p4.drugs.map(d=>d.name).filter(Boolean) : [];

    root.innerHTML = `
      <div class="p6-wrapper">
        ${section1HTML}
        ${renderSection2(drugNames)}
        ${renderSection3()}
        ${renderSection4()}
        <div class="p6-footer-btns">
          <button class="p6-btn p6-btn-print" onclick="p6PrintTimeline()">🖨️ Print / PDF</button>
          <button class="p6-btn p6-btn-next" onclick="alert('ยังไม่ได้สร้างหน้า 7 — เดี๋ยวเราต่อให้ตอนใส่สมอง')">➡️ บันทึกข้อมูลและไปหน้า 7</button>
        </div>
      </div>
    `;

    // สร้าง alias #brainBox ครั้งแรกเท่านั้น แล้วค่อยยิง da:update หนึ่งครั้ง
    requestAnimationFrame(() => {
      if (!window.__p6AliasDone) {
        let alias = document.getElementById("brainBox");
        if (!alias) {
          const box = document.getElementById("p6BrainBox");
          alias = document.createElement("div");
          alias.id = "brainBox";
          alias.style.display = "none";
          if (box && box.parentNode) box.parentNode.insertBefore(alias, box.nextSibling);
          else document.body.appendChild(alias);
        }
        window.__p6AliasDone = true;
        document.dispatchEvent(new Event("da:update")); // ยิงครั้งเดียว
      }
    });

    // ปุ่มรีเฟรชผล
    const btnBrain = document.getElementById("p6BrainRefreshBtn");
    if (btnBrain) {
      btnBrain.addEventListener("click", () => {
        try { if (window.evaluateDrugAllergy) window.evaluateDrugAllergy(); } catch(_) {}
        try { if (window.brainComputeAndRender) window.brainComputeAndRender(); } catch(_) {}
        // ให้ bridge/mirror ทำงานต่อ
        document.dispatchEvent(new Event("da:update"));
      });
    }

    // วาด timeline ครั้งแรก
    setTimeout(() => { try { p6DrawVisualTimeline(); } catch(e){ console.error("[page6] draw timeline:", e); } }, 0);
  }

  // ---------- Inject style ----------
  (function injectP6Styles(){
    if (document.getElementById("p6-visual-style")) return;
    const css = `
      .p6-visual-box{background:#fff;border:1px solid #edf2f7;border-radius:16px;padding:14px;margin-top:10px;}
      .p6-visual-title{margin:0 0 8px;font-size:1.05rem;font-weight:700;color:#111827;}
      .p6-timeline-scroll{overflow:auto;padding-bottom:6px}
      .p6-date-cell{border-bottom:1px solid #edf2f7;font-size:12px;font-weight:600;white-space:nowrap;padding-bottom:2px;text-align:left}
      .p6-lane{display:flex;gap:10px;align-items:flex-start;margin-top:8px}
      .p6-lane-label{width:38px;flex:0 0 38px;font-weight:700;color:#06705d;padding-top:10px}
      .p6-lane-label.p6-lane-adr{color:#c53030}
      .p6-bar{height:34px;border-radius:9999px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;white-space:nowrap;box-shadow:0 8px 22px rgba(15,23,42,.12);font-size:12px}
      .p6-bar-drug{background:linear-gradient(90deg,#1679ff 0%,#25c4ff 100%)}
      .p6-bar-adr{background:linear-gradient(90deg,#f43f5e 0%,#f97316 100%)}
      .p6-list{margin:0 0 6px 18px;padding:0}
      .p6-naranjo-item{display:flex;justify-content:space-between;align-items:center;background:#E8FFF0;border:1px solid #A7F3D0;border-radius:12px;padding:.6rem .8rem;margin:.35rem 0;}
      .p6-naranjo-name{font-weight:800;color:#064E3B;}
      .p6-naranjo-score{background:#ECFDF5;color:#065F46;border:1px solid #A7F3D0;border-radius:10px;padding:.15rem .6rem;font-weight:800;min-width:2.2rem;text-align:center;}
    `;
    const tag=document.createElement("style");
    tag.id="p6-visual-style"; tag.textContent=css;
    document.head.appendChild(tag);
  })();

  // ---------- Bridge: mirror #brainBox -> #p6BrainBox ----------
  (function () {
    if (window.__p6BridgeBound) return;
    window.__p6BridgeBound = true;

    let observer = null;

    function mirrorNow() {
      const dest = document.getElementById("p6BrainBox");
      if (!dest) return;
      const src =
        document.getElementById("brainBox") ||
        document.getElementById("resultBox") ||
        document.getElementById("result") ||
        document.querySelector("[data-brain-output]") ||
        document.querySelector(".brain-output");
      if (src && dest.innerHTML !== src.innerHTML) dest.innerHTML = src.innerHTML;
    }

    function ensure() {
      const dest = document.getElementById("p6BrainBox");
      if (!dest) return;

      const src =
        document.getElementById("brainBox") ||
        document.getElementById("resultBox") ||
        document.getElementById("result") ||
        document.querySelector("[data-brain-output]") ||
        document.querySelector(".brain-output");

      if (observer) { try { observer.disconnect(); } catch(_) {} observer = null; }
      if (src) {
        observer = new MutationObserver(mirrorNow);
        observer.observe(src, { childList: true, characterData: true, subtree: true });
        mirrorNow();
      }
    }

    document.addEventListener("da:update", () => { ensure(); mirrorNow(); });
    document.addEventListener("DOMContentLoaded", ensure);
    window.addEventListener("load", ensure);
    setTimeout(() => { ensure(); mirrorNow(); }, 0);
  })();

  // ---------- Fallback คำนวณเบื้องต้นในเครื่อง (ถ้าไม่มี brain.js) ----------
  (function () {
    if (window.__p6LocalBrainBound) return;
    window.__p6LocalBrainBound = true;

    function num(v) {
      const n = Number(String(v).replace(/[, ]+/g, ""));
      return Number.isFinite(n) ? n : NaN;
    }

    function localBrainCompute() {
      const box = document.getElementById("p6BrainBox");
      if (!box) return;

      const d  = window.drugAllergyData || {};
      const p1 = d.page1 || {};
      const p2 = d.page2 || {};
      const p3 = d.page3 || {};

      if (!(p1.__saved && p2.__saved && p3.__saved)) return;

      const scores = Object.create(null);
      const add = (k, w) => { scores[k] = (scores[k] || 0) + (w || 1); };

      // Heuristics
      if (p1.itch?.has) add("Urticaria", 3);
      if ((p1.rashShapes || []).includes("ปื้นนูน")) add("Urticaria", 2);
      if ((p1.rashColors || []).includes("แดง")) add("Maculopapular rash", 2);
      if (p1.swelling?.has) add("Angioedema", 3);
      if ((p2.resp?.dyspnea || p2.resp?.wheeze || p2.resp?.tachypnea) ||
          (p2.cv?.hypotension || p2.cv?.shock)) add("Anaphylaxis", 4);
      if (p1.pustule?.has) add("AGEP", 3);
      if (p1.skinDetach?.gt30) add("TEN", 5);
      if (p1.skinDetach?.lt10 || p1.skinDetach?.center) add("SJS", 3);
      if ((p1.rashColors || []).includes("แดงไหม้") && (p1.locations || []).includes("หน้า"))
        add("Photosensitivity drug eruption", 2);

      const aec = num(p3?.cbc?.aec?.value ?? p3?.cbc?.eos?.value);
      const eosPct = num(p3?.cbc?.eos?.value);
      const alt = num(p3?.lft?.alt?.value);
      const ast = num(p3?.lft?.ast?.value);
      if ((Number.isFinite(aec) && aec >= 1500) || (Number.isFinite(eosPct) && eosPct >= 10)) add("DRESS", 2);
      if ((Number.isFinite(alt) && alt > 100) || (Number.isFinite(ast) && ast > 100)) add("DRESS", 1);

      const ranked = Object.entries(scores).sort((a,b)=>b[1]-a[1]);
      if (!ranked.length) return;

      const leader = ranked[0][0];
      box.innerHTML = `
        <div>
          <div style="font-weight:700;margin-bottom:.25rem;">ผลเด่น: <span style="font-weight:800;">${leader}</span></div>
          <ol class="p6-list" style="margin-top:.35rem;">
            ${ranked.map(([k],i)=>`<li>${i+1}) ${k}</li>`).join("")}
          </ol>
        </div>
      `;
    }

    document.addEventListener("da:update", localBrainCompute);
    document.addEventListener("click", (e) => {
      if (e.target && e.target.id === "p6BrainRefreshBtn") localBrainCompute();
    });
    setTimeout(localBrainCompute, 0);
  })();

  // ---------- Auto-refresh เมื่อข้อมูลหน้า 1–3 เปลี่ยน (ไม่ re-render ทั้งหน้า) ----------
  (function () {
    if (window.__p6AutoRefreshBound) return;
    window.__p6AutoRefreshBound = true;

    let rafId = 0;
    function runRefresh() {
      if (rafId) return; // throttle
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        try {
          if (typeof window.evaluateDrugAllergy === "function") window.evaluateDrugAllergy();
          if (typeof window.brainComputeAndRender === "function") window.brainComputeAndRender();
          if (typeof p6DrawVisualTimeline === "function") p6DrawVisualTimeline(); // วาดเฉพาะ timeline
        } catch (e) {
          console.warn("[page6] auto-refresh error:", e);
        }
      });
    }

    document.addEventListener("da:update", runRefresh);
  })();

  // ---------- Export ----------
  window.renderPage6 = renderPage6;
})();


// ====== พิมพ์หน้า 6 (ตามเวอร์ชันเดิมของคุณ) ======
function p6PrintTimeline() {
  const root = document.getElementById("p6Root");
  const pageSnapshot = root ? root.outerHTML : "";

  const p5 = (window.drugAllergyData && window.drugAllergyData.page5) || { drugLines: [], adrLines: [] };
  const drugs = Array.isArray(p5.drugLines) ? p5.drugLines : [];
  const adrs  = Array.isArray(p5.adrLines)  ? p5.adrLines  : [];

  function fmtDateTHLocal(str) {
    if (!str) return "—";
    const pure = String(str).trim().split(" ")[0];
    let d;
    if (pure.includes("-")) { const [y,m,dd] = pure.split("-").map(Number); if (y && m && dd) d = new Date(y, m-1, dd); }
    else if (pure.includes("/")) { const [dd,m,y] = pure.split("/").map(Number); if (y && m && dd) d = new Date(y, m-1, dd); }
    if (!d) return str;
    return d.toLocaleDateString("th-TH", { day:"numeric", month:"short", year:"numeric" });
  }
  function fmtTimeLocal(str) { if (!str) return ""; const t = String(str).slice(0,5); return t + " น."; }

  const summaryHTML = `
    <section class="p6-print-summary">
      <h3>🗂️ สรุปข้อมูลที่กรอก</h3>
      <div class="sec">
        <h4>💊 รายการยา</h4>
        ${
          drugs.length
            ? `<ol>
                ${drugs.map(d=>{
                  const name=(d.name||"").trim() || "(ไม่ระบุชื่อยา)";
                  const sD=fmtDateTHLocal(d.startDate);
                  const sT=fmtTimeLocal(d.startTime);
                  const eD=fmtDateTHLocal(d.stopDate);
                  const eT=fmtTimeLocal(d.stopTime);
                  return `<li><strong>${name}</strong> — เริ่ม ${sD}${sT?" "+sT:""} · หยุด ${eD}${eT?" "+eT:""}</li>`;
                }).join("")}
               </ol>`
            : `<p class="muted">— ไม่มีรายการยา —</p>`
        }
      </div>
      <div class="sec">
        <h4>🧪 ADR</h4>
        ${
          adrs.length
            ? `<ol>
                ${adrs.map(a=>{
                  const sym=(a.symptom||"").trim() || "(ไม่ระบุอาการ)";
                  const sD=fmtDateTHLocal(a.startDate);
                  const sT=fmtTimeLocal(a.startTime);
                  const eD=fmtDateTHLocal(a.endDate);
                  const eT=fmtTimeLocal(a.endTime);
                  return `<li><strong>${sym}</strong> — เริ่ม ${sD}${sT?" "+sT:""} · หาย ${eD}${eT?" "+eT:""}</li>`;
                }).join("")}
               </ol>`
            : `<p class="muted">— ไม่มี ADR —</p>`
        }
      </div>
    </section>
  `;

  const win = window.open("", "_blank", "width=1200,height=800");
  win.document.write(`
    <html>
      <head>
        <meta charset="utf-8" />
        <title>พิมพ์หน้า 6</title>
        <style>
          * { box-sizing:border-box; font-family:system-ui,-apple-system,"Segoe UI",sans-serif; }
          body { margin:0; padding:12px 16px 16px; background:#fff;
                 -webkit-print-color-adjust: exact !important;
                 print-color-adjust: exact !important; }

          .tabs, .p6-footer-btns, .p6-btn, .p6-btn-group, button { display:none !important; }
          .p6-visual-box { display:none !important; }

          .p6-print-summary {
            border:1px solid #e5e7eb; border-radius:12px; padding:12px 14px;
            margin:12px 0 14px; background:#fafafa;
          }
          .p6-print-summary h3 { margin:0 0 8px; }
          .p6-print-summary h4 { margin:10px 0 6px; }
          .p6-print-summary ol { margin:0 0 6px 18px; padding:0; }
          .p6-print-summary li { margin:2px 0; }
          .p6-print-summary .muted { color:#6b7280; margin:0; }

          .p6-visual-box-print { background:#fff; border:1px solid #edf2f7; border-radius:16px; padding:14px; }
          #printTimelineScroll { overflow:visible; width:auto; max-width:none; display:inline-block; background:#fff; }
          #printDateRow, #printDrugLane, #printAdrLane { display:grid; grid-auto-rows:40px; row-gap:6px; }
          .p6-date-cell { border-bottom:1px solid #edf2f7; font-size:11px; font-weight:600; white-space:nowrap; padding-bottom:2px; text-align:left; }
          .p6-lane { display:flex; gap:10px; align-items:flex-start; margin-top:6px; }
          .p6-lane-label { width:38px; flex:0 0 38px; font-weight:700; color:#06705d; padding-top:10px; }
          .p6-lane-adr { color:#c53030 !important; }
          .p6-bar { height:34px; border-radius:9999px; display:flex; align-items:center; justify-content:center;
                    color:#fff; font-weight:600; white-space:nowrap; box-shadow:0 8px 22px rgba(15,23,42,.12); font-size:12px; }
          .p6-bar-drug { background:linear-gradient(90deg,#1679ff 0%,#25c4ff 100%); }
          .p6-bar-adr  { background:linear-gradient(90deg,#f43f5e 0%,#f97316 100%); }

          @page { size:A4 landscape; margin:8mm; }
          @media print { body { background:#fff; } }
        </style>
      </head>
      <body>
        ${pageSnapshot}
        ${summaryHTML}

        <div class="p6-visual-box-print">
          <h4 style="margin:0 0 8px;font-size:1.05rem;font-weight:700;color:#111827;">Visual Timeline</h4>
          <div id="printTimelineScroll">
            <div id="printDateRow"></div>
            <div class="p6-lane">
              <div class="p6-lane-label">ยา</div>
              <div id="printDrugLane"></div>
            </div>
            <div class="p6-lane">
              <div class="p6-lane-label p6-lane-adr">ADR</div>
              <div id="printAdrLane"></div>
            </div>
          </div>
        </div>

        <script>
          (function(){
            const p5 = (window.opener && window.opener.window && window.opener.window.drugAllergyData && window.opener.window.drugAllergyData.page5) || { drugLines: [], adrLines: [] };
            const drugs = Array.isArray(p5.drugLines) ? p5.drugLines : [];
            const adrs  = Array.isArray(p5.adrLines)  ? p5.adrLines  : [];

            function parseDate(str){
              if(!str) return null;
              const pure=String(str).trim().split(" ")[0];
              if(pure.includes("-")){ const [y,m,d]=pure.split("-").map(Number); if(y&&m&&d) return new Date(y,m-1,d); }
              if(pure.includes("/")){ const [d,m,y]=pure.split("/").map(Number); if(y&&m&&d) return new Date(y,m-1,d); }
              return null;
            }

            const dateRow = document.getElementById("printDateRow");
            const drugLane = document.getElementById("printDrugLane");
            const adrLane  = document.getElementById("printAdrLane");
            const box      = document.getElementById("printTimelineScroll");

            const MS_DAY = 24*60*60*1000;
            const today = new Date(); const today0=new Date(today.getFullYear(),today.getMonth(),today.getDate());

            let minDate = null;
            drugs.forEach(d=>{ const s=parseDate(d.startDate); if(s && (!minDate || s<minDate)) minDate=s; });
            adrs.forEach(a=>{ const s=parseDate(a.startDate); if(s && (!minDate || s<minDate)) minDate=s; });
            if(!minDate) minDate = today0;

            const maxDate = today0;
            const totalDays = Math.floor((maxDate - minDate)/MS_DAY) + 1;

            const PRINT_DAY_W = 45;
            dateRow.style.display="grid";
            dateRow.style.gridTemplateColumns="repeat("+totalDays+", "+PRINT_DAY_W+"px)";
            for(let i=0;i<totalDays;i++){
              const d = new Date(minDate.getFullYear(),minDate.getMonth(),minDate.getDate()+i);
              const cell=document.createElement("div");
              cell.className="p6-date-cell";
              cell.textContent = d.toLocaleDateString("th-TH",{day:"numeric",month:"short"});
              dateRow.appendChild(cell);
            }

            const ROW_H=40;
            function prepLane(el,rows){
              el.innerHTML="";
              el.style.display="grid";
              el.style.gridTemplateColumns="repeat("+totalDays+", "+PRINT_DAY_W+"px)";
              el.style.gridAutoRows=ROW_H+"px";
              el.style.rowGap="6px";
              el.style.height=(Math.max(rows,1)*(ROW_H+6))+"px";
            }
            prepLane(drugLane, drugs.length);
            prepLane(adrLane,  adrs.length);

            function dayIndexOf(date){ return Math.floor((date - minDate)/MS_DAY); }

            drugs.forEach((d,idx)=>{
              const s=parseDate(d.startDate); if(!s) return;
              let e; if (d.stopDate){ const _e=parseDate(d.stopDate); e = _e? new Date(_e.getFullYear(),_e.getMonth(),_e.getDate()-1): maxDate; } else e=maxDate;
              if (e<s) e=s; if (e>maxDate) e=maxDate;
              const bar=document.createElement("div");
              bar.className="p6-bar p6-bar-drug";
              bar.textContent = (d.name && String(d.name).trim()) ? String(d.name).trim() : "ยา "+(idx+1);
              bar.style.gridColumn = (dayIndexOf(s)+1) + " / " + (dayIndexOf(e)+2);
              bar.style.gridRow = (idx+1);
              drugLane.appendChild(bar);
            });

            adrs.forEach((a,idx)=>{
              const s=parseDate(a.startDate); if(!s) return;
              let e; if (a.endDate){ const _e=parseDate(a.endDate); e = _e? new Date(_e.getFullYear(),_e.getMonth(),_e.getDate()-1): maxDate; } else e=maxDate;
              if (e<s) e=s; if (e>maxDate) e=maxDate;
              const bar=document.createElement("div");
              bar.className="p6-bar p6-bar-adr";
              bar.textContent = (a.symptom && String(a.symptom).trim()) ? String(a.symptom).trim() : "ADR "+(idx+1);
              bar.style.gridColumn = (dayIndexOf(s)+1) + " / " + (dayIndexOf(e)+2);
              bar.style.gridRow = (idx+1);
              adrLane.appendChild(bar);
            });

            // Label ทุก 4 วัน + ต้น/ท้าย
            const cells = Array.from(dateRow.children);
            const lastIdx = cells.length - 1;
            cells.forEach(function (cell, i) {
              if (i === 0 || i === lastIdx) return;
              if (i % 4 !== 0) cell.textContent = "";
            });

            // scale ให้พอดีกระดาษ
            const maxWidth = Math.min(1120, window.innerWidth - 80);
            const totalWidth = totalDays * PRINT_DAY_W + 60;
            if (totalWidth > maxWidth) {
              const scale = maxWidth / totalWidth;
              box.style.transform = "scale(" + scale.toFixed(3) + ")";
              box.style.transformOrigin = "top left";
            }

            window.print();
            setTimeout(function(){ window.close(); }, 500);
          })();
        </script>
      </body>
    </html>
  `);
  win.document.close();
}

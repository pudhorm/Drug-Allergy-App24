// ====================== page6.js ======================
(function () {
  if (!window.drugAllergyData) window.drugAllergyData = {};

  function checkCorePagesReady() {
    const d = window.drugAllergyData || {};
    const p1 = !!(d.page1 && d.page1.__saved);
    const p2 = !!(d.page2 && d.page2.__saved);
    const p3 = !!(d.page3 && d.page3.__saved);
    const missing = [];
    if (!p1) missing.push("หน้า 1 ผิวหนัง");
    if (!p2) missing.push("หน้า 2 ระบบอื่นๆ");
    if (!p3) missing.push("หน้า 3 Lab");
    return { ready: p1 && p2 && p3, missing };
  }

  // --- helpers time ---
  function fmtDateTH(str) {
    if (!str) return "—";
    const pure = String(str).trim().split(" ")[0];
    let d;
    if (pure.includes("-")) { const [y,m,dd]=pure.split("-").map(Number); if (y&&m&&dd) d=new Date(y,m-1,dd); }
    else if (pure.includes("/")) { const [dd,m,y]=pure.split("/").map(Number); if (y&&m&&dd) d=new Date(y,m-1,dd); }
    return d ? d.toLocaleDateString("th-TH",{day:"numeric",month:"short",year:"numeric"}) : str;
  }
  function fmtTime(str){ if(!str) return ""; const t=String(str).slice(0,5); return t+" น."; }
  function rangeStr(sD,sT,eD,eT){
    const s = `${fmtDateTH(sD)}${sT?(" "+fmtTime(sT)):""}`;
    const e = eD ? `${fmtDateTH(eD)}${eT?(" "+fmtTime(eT)):""}` : "ปัจจุบัน";
    return `${s} → ${e}`;
  }
  function escapeHTML(s){ return String(s||"").replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])); }

  function getPage5Data() {
    const p5 = (window.drugAllergyData && window.drugAllergyData.page5) || {};
    return {
      drugs: Array.isArray(p5.drugLines) ? p5.drugLines : [],
      adrs:  Array.isArray(p5.adrLines)  ? p5.adrLines  : [],
      pharmacistNote: p5.pharmacistNote || "",
      doctorNote:     p5.doctorNote || ""
    };
  }

  // --- Visual Timeline (read-only copy) ---
  function p6DrawVisualTimeline() {
    const dateRow = document.getElementById("p6DateRow");
    const drugLane = document.getElementById("p6DrugLane");
    const adrLane  = document.getElementById("p6AdrLane");
    const sc       = document.getElementById("p6TimelineScroll");
    if (!dateRow || !drugLane || !adrLane) return;

    const { drugs, adrs } = getPage5Data();
    dateRow.innerHTML = ""; drugLane.innerHTML = ""; adrLane.innerHTML = "";
    if (!drugs.length && !adrs.length) return;

    const MS_DAY=24*60*60*1000, DAY_W=120;
    function parseDate(str){
      if(!str) return null;
      const pure=String(str).trim().split(" ")[0];
      if(pure.includes("-")){ const [y,m,d]=pure.split("-").map(Number); if(y&&m&&d) return new Date(y,m-1,d); }
      if(pure.includes("/")){ const [d,m,y]=pure.split("/").map(Number); if(y&&m&&d) return new Date(y,m-1,d); }
      return null;
    }
    const today0 = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    let minDate = null;
    drugs.forEach(d=>{ const s=parseDate(d.startDate); if(s && (!minDate || s<minDate)) minDate=s; });
    adrs.forEach(a=>{ const s=parseDate(a.startDate); if(s && (!minDate || s<minDate)) minDate=s; });
    if(!minDate) minDate=today0;
    const maxDate=today0;
    const totalDays = Math.floor((maxDate-minDate)/MS_DAY)+1;

    dateRow.style.display="grid";
    dateRow.style.gridTemplateColumns=`repeat(${totalDays}, ${DAY_W}px)`;
    for(let i=0;i<totalDays;i++){
      const d=new Date(minDate.getFullYear(),minDate.getMonth(),minDate.getDate()+i);
      const cell=document.createElement("div");
      cell.className="p6-date-cell";
      cell.textContent=d.toLocaleDateString("th-TH",{day:"numeric",month:"short"});
      dateRow.appendChild(cell);
    }

    const ROW_H=46;
    function prep(el,rows){ el.style.display="grid"; el.style.gridTemplateColumns=`repeat(${totalDays}, ${DAY_W}px)`; el.style.gridAutoRows=ROW_H+"px"; el.style.rowGap="6px"; el.style.height=Math.max(rows,1)*(ROW_H+6)+"px"; el.innerHTML=""; }
    prep(drugLane, getPage5Data().drugs.length);
    prep(adrLane,  getPage5Data().adrs.length);
    adrLane.style.marginTop="10px";

    function dayIndexOf(date){ return Math.floor((date - minDate)/MS_DAY); }

    getPage5Data().drugs.forEach((d,idx)=>{
      const s=parseDate(d.startDate); if(!s) return;
      let e; if(d.stopDate){ const _e=parseDate(d.stopDate); e=_e?new Date(_e.getFullYear(),_e.getMonth(),_e.getDate()-1):maxDate; } else e=maxDate;
      if(e<s) e=s; if(e>maxDate) e=maxDate;
      const bar=document.createElement("div"); bar.className="p6-bar p6-bar-drug"; bar.textContent=(d.name||"").trim()||("ยาตัวที่ "+(idx+1));
      bar.style.gridColumn=`${dayIndexOf(s)+1} / ${dayIndexOf(e)+2}`; bar.style.gridRow=`${idx+1}`; drugLane.appendChild(bar);
    });

    getPage5Data().adrs.forEach((a,idx)=>{
      const s=parseDate(a.startDate); if(!s) return;
      let e; if(a.endDate){ const _e=parseDate(a.endDate); e=_e?new Date(_e.getFullYear(),_e.getMonth(),_e.getDate()-1):maxDate; } else e=maxDate;
      if(e<s) e=s; if(e>maxDate) e=maxDate;
      const bar=document.createElement("div"); bar.className="p6-bar p6-bar-adr"; bar.textContent=(a.symptom||"").trim()||("ADR "+(idx+1));
      bar.style.gridColumn=`${dayIndexOf(s)+1} / ${dayIndexOf(e)+2}`; bar.style.gridRow=`${idx+1}`; adrLane.appendChild(bar);
    });

    sc && (sc.scrollLeft = sc.scrollWidth);
  }

  // --- Section 4 (Naranjo & Timeline + Notes) ---
  function renderSection4() {
    const { drugs, adrs, pharmacistNote, doctorNote } = getPage5Data();

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

    // Notes: show saved text; printing (below) will render blank boxes for handwriting.
    const notesHTML = `
      <div class="p6-notes-under">
        <div class="p6-note">
          <div class="p6-note-title">Pharmacist Note</div>
          <div class="p6-note-box">${escapeHTML(pharmacistNote)}</div>
        </div>
        <div class="p6-note">
          <div class="p6-note-title">Doctor Note</div>
          <div class="p6-note-box">${escapeHTML(doctorNote)}</div>
        </div>
      </div>
    `;

    return `
      <div class="p6-block sec4">
        <div class="p6-head"><div class="p6-emoji">📊</div><div class="p6-head-title">ส่วนที่ 4: ผลการประเมิน Naranjo และ Timeline</div></div>

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
          ${notesHTML}
        </div>
      </div>
    `;
  }

  function renderSection1() {
    const status = checkCorePagesReady();
    const list = `
      <ul class="p6-muted" style="margin-top:.35rem;">
        <li>Urticaria</li><li>Anaphylaxis</li><li>Angioedema</li><li>Maculopapular rash</li>
        <li>Fixed drug eruption</li><li>AGEP</li><li>SJS</li><li>TEN</li><li>DRESS</li>
        <li>Erythema multiforme</li><li>Photosensitivity</li><li>Exfoliative dermatitis</li>
        <li>Eczematous drug eruption</li><li>Bullous Drug Eruption</li><li>Serum sickness</li>
        <li>Vasculitis</li><li>Hemolytic anemia</li><li>Pancytopenia</li><li>Neutropenia</li>
        <li>Thrombocytopenia</li><li>Nephritis</li>
      </ul>
    `;
    return `
      <div class="p6-block sec1">
        <div class="p6-head"><div class="p6-emoji">🤖</div><div class="p6-head-title">ส่วนที่ 1: Type of ADR (Non-immunologic & Immunologic)</div></div>
        <div class="p6-subcard">
          <div class="p6-sub-title">อาการ/อาการแสดงทางคลินิกของการแพ้ยา</div>
          ${list}
          ${status.ready ? `<p class="p6-muted" style="margin-top:.35rem;">เมื่อกดบันทึกครบหน้า 1–3 ระบบจะใช้ “สมองประเมิน” เพื่อสรุปชนิดย่อยไว้ที่นี่</p>`
                         : `<div class="p6-empty">ยังขาดข้อมูลจาก: ${status.missing.join(", ")}</div>`}
        </div>
      </div>
    `;
  }

  function renderSection2_3() {
    return `
      <div class="p6-block sec2"><div class="p6-head"><div class="p6-emoji">💊</div><div class="p6-head-title">ส่วนที่ 2: ยาที่มีรายงานการเกิดการแพ้ยาดังกล่าว</div></div>
        <div class="p6-subcard"><p class="p6-muted">รอการเชื่อม “สมองประเมิน”</p></div></div>
      <div class="p6-block sec3"><div class="p6-head"><div class="p6-emoji">💉</div><div class="p6-head-title">ส่วนที่ 3: แนวทางการรักษาเฉพาะตามชนิดการแพ้</div></div>
        <div class="p6-subcard"><p class="p6-muted">รอการเชื่อม “สมองประเมิน”</p></div></div>
    `;
  }

  function injectStylesOnce() {
    if (document.getElementById("p6-style-added")) return;
    const css = `
      .p6-visual-box{background:#fff;border:1px solid #edf2f7;border-radius:16px;padding:14px;margin-top:10px;}
      .p6-visual-title{margin:0 0 8px;font-size:1.05rem;font-weight:700;color:#111827}
      .p6-timeline-scroll{overflow:auto;padding-bottom:6px}
      .p6-date-cell{border-bottom:1px solid #edf2f7;font-size:12px;font-weight:600;white-space:nowrap;padding-bottom:2px;text-align:left}
      .p6-lane{display:flex;gap:10px;align-items:flex-start;margin-top:8px}
      .p6-lane-label{width:38px;flex:0 0 38px;font-weight:700;color:#06705d;padding-top:10px}
      .p6-lane-label.p6-lane-adr{color:#c53030}
      .p6-bar{height:34px;border-radius:9999px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;white-space:nowrap;box-shadow:0 8px 22px rgba(15,23,42,.12);font-size:12px}
      .p6-bar-drug{background:linear-gradient(90deg,#1679ff 0%,#25c4ff 100%)}
      .p6-bar-adr{background:linear-gradient(90deg,#f43f5e 0%,#f97316 100%)}
      .p6-note-box{min-height:88px;border:1px dashed #d1d5db;border-radius:10px;padding:8px;background:#fafafa;white-space:pre-wrap}
      .p6-note-title{font-weight:700;margin:10px 0 6px}
      .p6-notes-under{margin-top:8px}
    `;
    const tag = document.createElement("style");
    tag.id = "p6-style-added"; tag.textContent = css; document.head.appendChild(tag);
  }

  function renderPage6() {
    injectStylesOnce();
    const root = document.getElementById("p6Root"); if (!root) return;
    root.innerHTML = `
      <div class="p6-wrapper">
        ${renderSection1()}
        ${renderSection2_3()}
        ${renderSection4()}
        <div class="p6-footer-btns">
          <button class="p6-btn p6-btn-print" onclick="p6PrintTimeline()">🖨️ Print / PDF</button>
        </div>
      </div>
    `;
    setTimeout(()=>{ try{ p6DrawVisualTimeline(); } catch(e){ console.error("[page6] draw", e); } }, 0);
  }

  document.addEventListener("da:update", () => { window.renderPage6 && window.renderPage6(); });
  window.renderPage6 = renderPage6;
})();

// ---- Print page 6: include two blank boxes for Pharmacist/Doctor notes ----
function p6PrintTimeline() {
  const pageHTML = (document.getElementById("p6Root") || {}).outerHTML || "";
  const win = window.open("", "_blank", "width=1200,height=800");
  win.document.write(`
    <html>
      <head>
        <meta charset="utf-8" />
        <title>พิมพ์หน้า 6</title>
        <style>
          *{box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
          body{margin:0;padding:12px 16px;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
          .p6-btn,.p6-footer-btns{display:none!important}
          .p6-visual-box{display:none!important} /* ใช้เฉพาะสรุปข้อความกับช่องลายมือ */
          .p6-print-notes{margin-top:8px}
          .p6-print-note{margin-top:10px}
          .p6-print-note .t{font-weight:700;margin:0 0 6px}
          .p6-print-note .b{border:1.6px solid #111;border-radius:10px;height:120px}
          @page{size:A4;margin:10mm}
        </style>
      </head>
      <body>
        ${pageHTML}
        <div class="p6-print-notes">
          <div class="p6-print-note"><div class="t">Pharmacist Note</div><div class="b"></div></div>
          <div class="p6-print-note"><div class="t">Doctor Note</div><div class="b"></div></div>
        </div>
        <script>
          (function(){
            // render compact grid widths for any timeline that slipped through
            const dr=document.querySelector('#p6DateRow'), dg=document.querySelector('#p6DrugLane'), ad=document.querySelector('#p6AdrLane'), box=document.querySelector('#p6TimelineScroll');
            if(dr && dg && ad && box){
              const W=45, dayCount=dr.children.length||1, cols="repeat("+dayCount+", "+W+"px)";
              dr.style.gridTemplateColumns=cols; dg.style.gridTemplateColumns=cols; ad.style.gridTemplateColumns=cols;
            }
            window.print(); setTimeout(()=>window.close(), 500);
          })();
        </script>
      </body>
    </html>
  `);
  win.document.close();
}

// ====================== page5.js ======================

// ---- helper: broadcast update for page 6 ----
function p5EmitUpdate(source) {
  try {
    document.dispatchEvent(
      new CustomEvent("da:update", { detail: { source: source || "page5", ts: Date.now() } })
    );
  } catch {}
}

// ---- init storage for page 5 ----
(function () {
  const root = (window.drugAllergyData = window.drugAllergyData || {});
  if (!root.page5) root.page5 = {};
  const p5 = root.page5;
  p5.drugLines = Array.isArray(p5.drugLines) ? p5.drugLines : [];
  p5.adrLines  = Array.isArray(p5.adrLines)  ? p5.adrLines  : [];
  // notes
  if (typeof p5.pharmacistNote !== "string") p5.pharmacistNote = "";
  if (typeof p5.doctorNote !== "string")     p5.doctorNote     = "";
})();

// ---- render page 5 ----
window.renderPage5 = function () {
  const pageEl = document.getElementById("page5");
  if (!pageEl) return;

  const { drugLines, adrLines, pharmacistNote, doctorNote } = window.drugAllergyData.page5;

  pageEl.innerHTML = `
    <div class="p5-wrapper">
      <div class="p5-header-line">
        <h2>📅 หน้า 5 Timeline ประเมินการแพ้ยา</h2>
        <div class="p5-btn-group">
          <button id="p5AddDrug" class="p5-btn-add-drug">+ เพิ่มยา</button>
          <button id="p5AddAdr"  class="p5-btn-add-adr">+ เพิ่ม ADR</button>
        </div>
      </div>

      <!-- เวลา ณ ปัจจุบัน -->
      <div id="p5NowBox" class="p5-meta-now"></div>

      <!-- รายการยา -->
      <div class="p5-form-block">
        <h3 style="display:flex;align-items:center;gap:.5rem;margin:0 0 .5rem;">
          <span style="font-size:1.3rem;">💊</span> รายการยา
        </h3>
        ${drugLines.map((d, idx) => `
          <div class="p5-drug-card" data-idx="${idx}">
            <div class="p5-field">
              <label>ยาตัวที่ ${idx + 1}</label>
              <input type="text" class="p5-drug-name" value="${d.name || ""}" placeholder="ระบุชื่อยา" />
            </div>
            <div class="p5-field"><label>เริ่มให้ยา</label>
              <input type="date" class="p5-drug-start" value="${d.startDate || ""}" />
            </div>
            <div class="p5-field"><label>เวลา</label>
              <input type="time" class="p5-drug-start-time" value="${d.startTime || ""}" />
            </div>
            <div class="p5-field"><label>หยุดยา</label>
              <input type="date" class="p5-drug-stop" value="${d.stopDate || ""}" />
            </div>
            <div class="p5-field"><label>เวลา</label>
              <input type="time" class="p5-drug-stop-time" value="${d.stopTime || ""}" />
            </div>
            <div class="p5-field" style="align-self:center;">
              <button class="p5-line-del" data-kind="drug" data-idx="${idx}">ลบ</button>
            </div>
          </div>
        `).join("")}
      </div>

      <!-- ADR -->
      <div class="p5-form-block">
        <h3 style="display:flex;align-items:center;gap:.5rem;margin:0 0 .5rem;">
          <span style="font-size:1.3rem;">🧪</span> ADR (Adverse Drug Reaction)
        </h3>
        ${adrLines.map((a, idx) => `
          <div class="p5-adr-card" data-idx="${idx}">
            <div class="p5-field">
              <label>ADR ${idx + 1} (อาการ)</label>
              <input type="text" class="p5-adr-symptom" value="${a.symptom || ""}" placeholder="เช่น ผื่น, บวม, แน่นหน้าอก" />
            </div>
            <div class="p5-field"><label>วันที่เกิด</label>
              <input type="date" class="p5-adr-start" value="${a.startDate || ""}" />
            </div>
            <div class="p5-field"><label>เวลาที่เกิด</label>
              <input type="time" class="p5-adr-start-time" value="${a.startTime || ""}" />
            </div>
            <div class="p5-field"><label>วันที่หาย</label>
              <input type="date" class="p5-adr-end" value="${a.endDate || ""}" />
            </div>
            <div class="p5-field"><label>เวลาที่หาย</label>
              <input type="time" class="p5-adr-end-time" value="${a.endTime || ""}" />
            </div>
            <div class="p5-field" style="align-self:center;">
              <button class="p5-line-del" data-kind="adr" data-idx="${idx}">ลบ</button>
            </div>
          </div>
        `).join("")}
      </div>

      <!-- Timeline -->
      <div class="p5-timeline-box">
        <h3 style="margin-bottom:0;">Visual Timeline</h3>
        <div id="p5TimelineScroll">
          <div id="p5DateRow"></div>
          <div class="p5-lane">
            <div class="p5-lane-label">ยา</div>
            <div id="p5DrugLane"></div>
          </div>
          <div class="p5-lane">
            <div class="p5-lane-label p5-lane-adr">ADR</div>
            <div id="p5AdrLane"></div>
          </div>
        </div>
      </div>

      <!-- NOTE: ใต้ Timeline ตามที่ขอ -->
      <div class="p5-notes">
        <div class="p5-note-card">
          <div class="p5-note-title">Pharmacist Note</div>
          <textarea id="p5PharmNote" rows="6" placeholder="พิมพ์บันทึกเภสัชกรรม...">${pharmacistNote || ""}</textarea>
        </div>
        <div class="p5-note-card">
          <div class="p5-note-title">Doctor Note</div>
          <textarea id="p5DocNote" rows="6" placeholder="พิมพ์บันทึกแพทย์...">${doctorNote || ""}</textarea>
        </div>
      </div>

      <!-- ปุ่มล่าง -->
      <div class="p5-footer-btns">
        <button id="p5GoSummary" class="p5-bottom-btn p5-bottom-primary">ไปหน้า 6 (สรุป)</button>
        <button id="p5Clear"     class="p5-bottom-btn p5-bottom-danger">🗑️ ล้าง & โหลดใหม่</button>
        <button id="p5Print"     class="p5-bottom-btn p5-bottom-print">🖨️ พิมพ์ Timeline</button>
      </div>
    </div>
  `;

  // เพิ่ม/ลบรายการ
  const btnAddDrug = document.getElementById("p5AddDrug");
  btnAddDrug && btnAddDrug.addEventListener("click", () => {
    window.drugAllergyData.page5.drugLines.push({ name:"", startDate:"", startTime:"", stopDate:"", stopTime:"" });
    window.saveDrugAllergyData && window.saveDrugAllergyData();
    p5EmitUpdate("page5"); window.renderPage5();
  });

  const btnAddAdr = document.getElementById("p5AddAdr");
  btnAddAdr && btnAddAdr.addEventListener("click", () => {
    window.drugAllergyData.page5.adrLines.push({ symptom:"", startDate:"", startTime:"", endDate:"", endTime:"" });
    window.saveDrugAllergyData && window.saveDrugAllergyData();
    p5EmitUpdate("page5"); window.renderPage5();
  });

  pageEl.querySelectorAll(".p5-line-del").forEach((btn) => {
    btn.addEventListener("click", function () {
      const kind = this.dataset.kind; const idx = +this.dataset.idx;
      if (kind === "drug") window.drugAllergyData.page5.drugLines.splice(idx, 1);
      else window.drugAllergyData.page5.adrLines.splice(idx, 1);
      window.saveDrugAllergyData && window.saveDrugAllergyData();
      p5EmitUpdate("page5"); window.renderPage5();
    });
  });

  // bind inputs — drugs
  pageEl.querySelectorAll(".p5-drug-card").forEach((card) => {
    const i = +card.dataset.idx, store = window.drugAllergyData.page5.drugLines[i];
    card.querySelector(".p5-drug-name")?.addEventListener("input", e => { store.name = e.target.value; safeDraw(); saveEmit(); });
    card.querySelector(".p5-drug-start")?.addEventListener("change", e => { store.startDate = e.target.value; safeDraw(); saveEmit(); });
    card.querySelector(".p5-drug-start-time")?.addEventListener("change", e => { store.startTime = e.target.value; saveEmit(); });
    card.querySelector(".p5-drug-stop")?.addEventListener("change", e => { store.stopDate = e.target.value; safeDraw(); saveEmit(); });
    card.querySelector(".p5-drug-stop-time")?.addEventListener("change", e => { store.stopTime = e.target.value; saveEmit(); });
  });

  // bind inputs — ADRs
  pageEl.querySelectorAll(".p5-adr-card").forEach((card) => {
    const i = +card.dataset.idx, store = window.drugAllergyData.page5.adrLines[i];
    card.querySelector(".p5-adr-symptom")?.addEventListener("input", e => { store.symptom = e.target.value; safeDraw(); saveEmit(); });
    card.querySelector(".p5-adr-start")?.addEventListener("change", e => { store.startDate = e.target.value; safeDraw(); saveEmit(); });
    card.querySelector(".p5-adr-start-time")?.addEventListener("change", e => { store.startTime = e.target.value; saveEmit(); });
    card.querySelector(".p5-adr-end")?.addEventListener("change", e => { store.endDate = e.target.value; safeDraw(); saveEmit(); });
    card.querySelector(".p5-adr-end-time")?.addEventListener("change", e => { store.endTime = e.target.value; saveEmit(); });
  });

  // notes
  document.getElementById("p5PharmNote")?.addEventListener("input", e => {
    window.drugAllergyData.page5.pharmacistNote = e.target.value;
    window.saveDrugAllergyData && window.saveDrugAllergyData();
    p5EmitUpdate("page5");
  });
  document.getElementById("p5DocNote")?.addEventListener("input", e => {
    window.drugAllergyData.page5.doctorNote = e.target.value;
    window.saveDrugAllergyData && window.saveDrugAllergyData();
    p5EmitUpdate("page5");
  });

  // ปุ่มบันทึกไปหน้า 6
  document.getElementById("p5GoSummary")?.addEventListener("click", () => {
    window.drugAllergyData.page5.__saved = true;
    window.saveDrugAllergyData && window.saveDrugAllergyData();
    p5EmitUpdate("page5");
    const tabBtn = document.querySelector('.tabs button[data-target="page6"]');
    tabBtn && tabBtn.click();
    window.renderPage6 && window.renderPage6();
  });

  // ปุ่มล้าง
  document.getElementById("p5Clear")?.addEventListener("click", () => {
    window.drugAllergyData.page5 = { drugLines: [], adrLines: [], pharmacistNote:"", doctorNote:"" };
    window.saveDrugAllergyData && window.saveDrugAllergyData();
    p5EmitUpdate("page5"); window.renderPage5();
    alert("ล้างข้อมูลหน้า 5 แล้ว");
  });

  // ปุ่มพิมพ์
  document.getElementById("p5Print")?.addEventListener("click", p5PrintTimeline);

  // วาด timeline
  function safeDraw() { try { drawTimeline(); } catch(e) { console.error("[page5] drawTimeline error:", e); } }
  (function () { safeDraw(); })();

  // เวลา ณ ปัจจุบัน
  setTimeout(p5UpdateNowBox, 50);
};

// ---- drawing timeline (ของเดิม) ----
function drawTimeline() {
  const dateRow = document.getElementById("p5DateRow");
  const drugLane = document.getElementById("p5DrugLane");
  const adrLane  = document.getElementById("p5AdrLane");
  if (!dateRow || !drugLane || !adrLane) return;

  const p5 = (window.drugAllergyData && window.drugAllergyData.page5) || { drugLines: [], adrLines: [] };
  const drugs = Array.isArray(p5.drugLines) ? p5.drugLines : [];
  const adrs  = Array.isArray(p5.adrLines)  ? p5.adrLines  : [];

  if (!drugs.length && !adrs.length) {
    dateRow.innerHTML = ""; drugLane.innerHTML = ""; adrLane.innerHTML = ""; return;
  }

  const MS_DAY = 24*60*60*1000, DAY_W = 120;

  function parseDate(str){
    if(!str) return null;
    const pure = String(str).trim().split(" ")[0];
    if (pure.includes("-")) { const [y,m,d]=pure.split("-").map(Number); if(y&&m&&d) return new Date(y,m-1,d); }
    if (pure.includes("/")) { const [d,m,y]=pure.split("/").map(Number); if(y&&m&&d) return new Date(y,m-1,d); }
    return null;
  }

  const now = new Date(); const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let minDate = null;
  drugs.forEach(d => { const s=parseDate(d.startDate); if(s && (!minDate || s<minDate)) minDate=s; });
  adrs.forEach(a => { const s=parseDate(a.startDate); if(s && (!minDate || s<minDate)) minDate=s; });
  if (!minDate) minDate = today;

  const maxDate = today;
  const totalDays = Math.floor((maxDate - minDate)/MS_DAY) + 1;

  dateRow.innerHTML = "";
  dateRow.style.display = "grid";
  dateRow.style.gridTemplateColumns = `repeat(${totalDays}, ${DAY_W}px)`;
  for (let i=0;i<totalDays;i++){
    const d = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()+i);
    const cell = document.createElement("div");
    cell.className = "p5-date-cell";
    cell.textContent = d.toLocaleDateString("th-TH", { day:"numeric", month:"short" });
    dateRow.appendChild(cell);
  }

  const ROW_H=46;
  function prepLane(el,rows){
    el.innerHTML=""; el.style.display="grid";
    el.style.gridTemplateColumns = `repeat(${totalDays}, ${DAY_W}px)`;
    el.style.gridAutoRows=ROW_H+"px"; el.style.rowGap="6px"; el.style.height = Math.max(rows,1)*(ROW_H+6)+"px";
  }
  prepLane(drugLane, drugs.length); prepLane(adrLane, adrs.length); adrLane.style.marginTop="10px";

  function dayIndexOf(date){ return Math.floor((date - minDate)/MS_DAY); }

  drugs.forEach((d,idx)=>{
    const start = parseDate(d.startDate); if(!start) return;
    let end;
    if (d.stopDate) { const e=parseDate(d.stopDate); end = e? new Date(e.getFullYear(), e.getMonth(), e.getDate()-1): maxDate; }
    else end = maxDate;
    if (end<start) end=start; if (end>maxDate) end=maxDate;

    const startIdx = dayIndexOf(start), endIdx = dayIndexOf(end);
    const isSameDayExplicit = d.startDate && d.stopDate && parseDate(d.startDate) && parseDate(d.stopDate) &&
      dayIndexOf(parseDate(d.startDate)) === dayIndexOf(parseDate(d.stopDate));
    if (isSameDayExplicit){
      const cell=document.createElement("div");
      cell.style.gridColumn = `${startIdx+1} / ${startIdx+2}`;
      cell.style.gridRow = `${idx+1}`;
      cell.style.display="flex"; cell.style.alignItems="center"; cell.style.justifyContent="flex-start";
      const dot=document.createElement("div");
      dot.title=d.name||`ยาตัวที่ ${idx+1}`;
      dot.style.width="16px"; dot.style.height="16px"; dot.style.borderRadius="9999px";
      dot.style.background="linear-gradient(90deg,#1679ff 0%,#25c4ff 100%)"; dot.style.boxShadow="0 8px 22px rgba(15,23,42,.12)";
      dot.style.marginLeft="4px"; cell.appendChild(dot); drugLane.appendChild(cell); return;
    }

    const bar=document.createElement("div");
    bar.className="p5-bar p5-bar-drug"; bar.textContent=d.name||`ยาตัวที่ ${idx+1}`;
    bar.style.gridColumn = `${startIdx+1} / ${endIdx+2}`; bar.style.gridRow = `${idx+1}`;
    drugLane.appendChild(bar);
  });

  adrs.forEach((a,idx)=>{
    const start = parseDate(a.startDate); if(!start) return;
    let end; if (a.endDate){ const e=parseDate(a.endDate); end = e? new Date(e.getFullYear(),e.getMonth(),e.getDate()-1): maxDate; } else end = maxDate;
    if (end<start) end=start; if (end>maxDate) end=maxDate;
    const startIdx = dayIndexOf(start), endIdx = dayIndexOf(end);
    const isSameDayExplicit = a.startDate && a.endDate && parseDate(a.startDate) && parseDate(a.endDate) &&
      dayIndexOf(parseDate(a.startDate)) === dayIndexOf(parseDate(a.endDate));
    if (isSameDayExplicit){
      const cell=document.createElement("div");
      cell.style.gridColumn = `${startIdx+1} / ${startIdx+2}`;
      cell.style.gridRow = `${idx+1}`;
      cell.style.display="flex"; cell.style.alignItems="center"; cell.style.justifyContent="flex-start";
      const dot=document.createElement("div");
      dot.title=a.symptom||`ADR ${idx+1}`;
      dot.style.width="16px"; dot.style.height="16px"; dot.style.borderRadius="9999px";
      dot.style.background="linear-gradient(90deg,#f43f5e 0%,#f97316 100%)"; dot.style.boxShadow="0 8px 22px rgba(15,23,42,.12)";
      dot.style.marginLeft="4px"; cell.appendChild(dot); adrLane.appendChild(cell); return;
    }
    const bar=document.createElement("div");
    bar.className="p5-bar p5-bar-adr"; bar.textContent=a.symptom||`ADR ${idx+1}`;
    bar.style.gridColumn = `${startIdx+1} / ${endIdx+2}`; bar.style.gridRow = `${idx+1}`;
    adrLane.appendChild(bar);
  });

  document.getElementById("p5TimelineScroll")?.scrollTo({ left: 1e9 });
}

// ---- now-box (real seconds) ----
function p5UpdateNowBox() {
  const el = document.getElementById("p5NowBox"); if (!el) return;
  const now = new Date();
  const dateTH = now.toLocaleDateString("th-TH", { day:"numeric", month:"short", year:"numeric" });
  const hh=String(now.getHours()).padStart(2,"0"), mm=String(now.getMinutes()).padStart(2,"0"), ss=String(now.getSeconds()).padStart(2,"0");
  el.textContent = `📅 วันที่/เวลา ณ ตอนนี้: ${dateTH} ${hh}:${mm}:${ss} น.`;
}
setInterval(p5UpdateNowBox, 1000);

// ---- print page 5: Notes placed AFTER timeline, boxes blank for handwriting ----
function p5PrintTimeline() {
  const page = document.getElementById("page5"); if (!page) { window.print(); return; }
  const pageHTML = page.outerHTML;

  const win = window.open("", "_blank", "width=1200,height=800");
  win.document.write(`
    <html>
      <head>
        <meta charset="utf-8" />
        <title>พิมพ์หน้า 5 Timeline</title>
        <style>
          *{box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
          body{margin:0;padding:12px 16px 16px;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
          .p5-btn-group,.p5-footer-btns,.p5-form-block,.p5-notes{display:none!important}
          .p5-timeline-box{background:#fff;border:1px solid #edf2f7;border-radius:16px;padding:14px}
          #p5TimelineScroll{overflow:visible!important;width:auto!important;max-width:none!important;display:inline-block}
          #p5DateRow,#p5DrugLane,#p5AdrLane{display:grid;grid-auto-rows:40px;row-gap:6px}
          .p5-date-cell{border-bottom:1px solid #edf2f7;font-size:11px;font-weight:600;white-space:nowrap;padding-bottom:2px;text-align:left}
          .p5-lane{display:flex;gap:10px;align-items:flex-start;margin-top:6px}
          .p5-lane-label{width:38px;flex:0 0 38px;font-weight:700;color:#06705d;padding-top:10px}
          .p5-lane-adr{color:#c53030}
          .p5-bar{height:34px;border-radius:9999px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;white-space:nowrap;box-shadow:0 8px 22px rgba(15,23,42,.12);font-size:12px}
          .p5-bar-drug{background:linear-gradient(90deg,#1679ff 0%,#25c4ff 100%)}
          .p5-bar-adr{background:linear-gradient(90deg,#f43f5e 0%,#f97316 100%)}
          /* Notes (blank boxes) */
          .print-notes{margin-top:10px}
          .print-note{margin-top:10px}
          .print-note .t{font-weight:700;margin:0 0 6px}
          .print-note .b{border:1.6px solid #111;border-radius:10px;height:120px}
          @page{size:A4 landscape;margin:8mm}
        </style>
      </head>
      <body>
        ${pageHTML}
        <div class="print-notes">
          <div class="print-note">
            <div class="t">Pharmacist Note</div>
            <div class="b"></div>
          </div>
          <div class="print-note">
            <div class="t">Doctor Note</div>
            <div class="b"></div>
          </div>
        </div>
        <script>
          (function(){
            const box = document.getElementById("p5TimelineScroll");
            const dateRow = document.getElementById("p5DateRow");
            const drugLane = document.getElementById("p5DrugLane");
            const adrLane  = document.getElementById("p5AdrLane");
            if (box && dateRow && drugLane && adrLane) {
              const dayCount = dateRow.children.length || 1;
              const W = 45;
              const cols = "repeat("+dayCount+", "+W+"px)";
              dateRow.style.gridTemplateColumns = cols;
              drugLane.style.gridTemplateColumns = cols;
              adrLane.style.gridTemplateColumns  = cols;
              const cells = Array.from(dateRow.children);
              const lastIdx = cells.length - 1;
              cells.forEach((c,i)=>{ if(i!==0 && i!==lastIdx && i%4!==0) c.textContent=""; });
              const maxWidth = 1000, totalWidth = dayCount*W + 60;
              if (totalWidth>maxWidth){ const s = maxWidth/totalWidth; box.style.transform="scale("+s.toFixed(3)+")"; box.style.transformOrigin="top left"; }
            }
            window.print(); setTimeout(()=>window.close(), 500);
          })();
        </script>
      </body>
    </html>
  `);
  win.document.close();
}

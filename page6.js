// ====================== page6.js ======================
// ทำให้ Visual Timeline หน้า 6 แสดงผลเหมือนหน้า 5 และอัปเดตอัตโนมัติเมื่อหน้า 5 เปลี่ยน

(function ensureRoot() {
  window.drugAllergyData = window.drugAllergyData || {};
  window.drugAllergyData.page5 = window.drugAllergyData.page5 || { drugLines: [], adrLines: [] };
})();

// ---------- Render หน้า 6 ----------
window.renderPage6 = function renderPage6() {
  const host = document.getElementById("page6");
  if (!host) return;

  // ไม่ไปแตะส่วนอื่น ๆ ของหน้า 6: เราสร้างบล็อกของเราเองแบบมี id เฉพาะ
  // ถ้ามีอยู่แล้วจะรีเฟรชเฉพาะภายใน
  const BLOCK_ID = "p6-vtimeline-block";
  let block = document.getElementById(BLOCK_ID);

  const wrapperHTML = `
    <div id="${BLOCK_ID}" class="p6-vt-wrap" style="margin-top:8px;">
      <div class="p6-timeline-box" style="background:#fff;border:1px solid #edf2f7;border-radius:16px;padding:14px;">
        <h3 style="margin:0 0 8px;font-size:1.25rem;font-weight:700;">Visual Timeline</h3>
        <div id="p6TimelineScroll" style="overflow:auto;white-space:nowrap;">
          <div id="p6DateRow"></div>
          <div class="p6-lane" style="display:flex;gap:10px;align-items:flex-start;margin-top:6px;">
            <div class="p6-lane-label" style="width:38px;flex:0 0 38px;font-weight:700;color:#06705d;padding-top:10px;">ยา</div>
            <div id="p6DrugLane"></div>
          </div>
          <div class="p6-lane" style="display:flex;gap:10px;align-items:flex-start;margin-top:6px;">
            <div class="p6-lane-label p6-lane-adr" style="width:38px;flex:0 0 38px;font-weight:700;color:#c53030;padding-top:10px;">ADR</div>
            <div id="p6AdrLane"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  if (!block) {
    // แทรกท้าย #page6 (ไม่ยุ่งเนื้อหาเดิม)
    const temp = document.createElement("div");
    temp.innerHTML = wrapperHTML;
    host.appendChild(temp.firstElementChild);
  } else {
    block.outerHTML = wrapperHTML;
  }

  // วาดครั้งแรก
  try { drawTimeline6(); } catch (e) { console.error("[page6] drawTimeline6 error:", e); }
};

// ---------- ฟังก์ชันวาด Timeline (โคลนตรรกะจากหน้า 5) ----------
function drawTimeline6() {
  const dateRow = document.getElementById("p6DateRow");
  const drugLane = document.getElementById("p6DrugLane");
  const adrLane = document.getElementById("p6AdrLane");
  if (!dateRow || !drugLane || !adrLane) return;

  const page5 = (window.drugAllergyData && window.drugAllergyData.page5) || { drugLines: [], adrLines: [] };
  const drugs = Array.isArray(page5.drugLines) ? page5.drugLines : [];
  const adrs  = Array.isArray(page5.adrLines)  ? page5.adrLines  : [];

  // ถ้าไม่มีข้อมูล เคลียร์หน้าจอ
  if (!drugs.length && !adrs.length) {
    dateRow.innerHTML = "";
    drugLane.innerHTML = "";
    adrLane.innerHTML = "";
    return;
  }

  const MS_DAY = 24 * 60 * 60 * 1000;
  const DAY_W  = 120; // ใช้สเกลเดียวกับหน้า 5

  function parseDate(str) {
    if (!str) return null;
    const pure = String(str).trim().split(" ")[0];
    if (pure.includes("-")) {
      const [y, m, d] = pure.split("-").map(Number);
      if (!y || !m || !d) return null;
      return new Date(y, m - 1, d);
    }
    if (pure.includes("/")) {
      const [d, m, y] = pure.split("/").map(Number);
      if (!d || !m || !y) return null;
      return new Date(y, m - 1, d);
    }
    return null;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // หา minDate จากทุกแถว
  let minDate = null;
  drugs.forEach(d => { const s = parseDate(d.startDate); if (s && (!minDate || s < minDate)) minDate = s; });
  adrs.forEach(a => { const s = parseDate(a.startDate); if (s && (!minDate || s < minDate)) minDate = s; });
  if (!minDate) minDate = today;

  // max = วันนี้
  const maxDate = today;
  const totalDays = Math.floor((maxDate.getTime() - minDate.getTime()) / MS_DAY) + 1;

  // วาดหัววัน
  dateRow.innerHTML = "";
  dateRow.style.display = "grid";
  dateRow.style.gridTemplateColumns = `repeat(${totalDays}, ${DAY_W}px)`;
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate() + i);
    const cell = document.createElement("div");
    cell.className = "p6-date-cell";
    cell.style.borderBottom = "1px solid #edf2f7";
    cell.style.fontSize = "11px";
    cell.style.fontWeight = "600";
    cell.style.whiteSpace = "nowrap";
    cell.style.paddingBottom = "2px";
    cell.style.textAlign = "left";
    cell.textContent = d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
    dateRow.appendChild(cell);
  }

  // เตรียม lane
  const ROW_H = 46;
  function prepLane(el, rows) {
    el.innerHTML = "";
    el.style.display = "grid";
    el.style.gridTemplateColumns = `repeat(${totalDays}, ${DAY_W}px)`;
    el.style.gridAutoRows = ROW_H + "px";
    el.style.rowGap = "6px";
    el.style.height = rows * (ROW_H + 6) + "px";
  }
  prepLane(drugLane, Math.max(drugs.length, 1));
  prepLane(adrLane, Math.max(adrs.length, 1));
  adrLane.style.marginTop = "10px";

  function dayIndexOf(date) {
    return Math.floor((date.getTime() - minDate.getTime()) / MS_DAY);
  }

  // วาดยา
  drugs.forEach((d, idx) => {
    const start = parseDate(d.startDate);
    if (!start) return;

    let end;
    if (d.stopDate) {
      const stop = parseDate(d.stopDate);
      end = stop ? new Date(stop.getFullYear(), stop.getMonth(), stop.getDate() - 1) : maxDate;
    } else end = maxDate;

    if (end < start) end = start;
    if (end > maxDate) end = maxDate;

    const startIdx = dayIndexOf(start);
    const endIdx = dayIndexOf(end);

    const isSameDayExplicit =
      d.startDate && d.stopDate &&
      parseDate(d.startDate) && parseDate(d.stopDate) &&
      dayIndexOf(parseDate(d.startDate)) === dayIndexOf(parseDate(d.stopDate));

    if (isSameDayExplicit) {
      const cell = document.createElement("div");
      cell.style.gridColumn = `${startIdx + 1} / ${startIdx + 2}`;
      cell.style.gridRow = `${idx + 1}`;
      cell.style.display = "flex";
      cell.style.alignItems = "center";
      cell.style.justifyContent = "flex-start";
      const dot = document.createElement("div");
      dot.title = d.name || `ยาตัวที่ ${idx + 1}`;
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

    const bar = document.createElement("div");
    bar.textContent = d.name || `ยาตัวที่ ${idx + 1}`;
    bar.style.height = "34px";
    bar.style.borderRadius = "9999px";
    bar.style.display = "flex";
    bar.style.alignItems = "center";
    bar.style.justifyContent = "center";
    bar.style.color = "#fff";
    bar.style.fontWeight = "600";
    bar.style.whiteSpace = "nowrap";
    bar.style.boxShadow = "0 8px 22px rgba(15,23,42,.12)";
    bar.style.fontSize = "12px";
    bar.style.background = "linear-gradient(90deg,#1679ff 0%,#25c4ff 100%)";
    bar.style.position = "relative";
    bar.style.left = "0";
    bar.style.width = "100%";
    bar.style.gridColumn = `${startIdx + 1} / ${endIdx + 2}`;
    bar.style.gridRow = `${idx + 1}`;
    drugLane.appendChild(bar);
  });

  // วาด ADR
  adrs.forEach((a, idx) => {
    const start = parseDate(a.startDate);
    if (!start) return;

    let end;
    if (a.endDate) {
      const e = parseDate(a.endDate);
      end = e ? new Date(e.getFullYear(), e.getMonth(), e.getDate() - 1) : maxDate;
    } else end = maxDate;

    if (end < start) end = start;
    if (end > maxDate) end = maxDate;

    const startIdx = dayIndexOf(start);
    const endIdx = dayIndexOf(end);

    const isSameDayExplicit =
      a.startDate && a.endDate &&
      parseDate(a.startDate) && parseDate(a.endDate) &&
      dayIndexOf(parseDate(a.startDate)) === dayIndexOf(parseDate(a.endDate));

    if (isSameDayExplicit) {
      const cell = document.createElement("div");
      cell.style.gridColumn = `${startIdx + 1} / ${startIdx + 2}`;
      cell.style.gridRow = `${idx + 1}`;
      cell.style.display = "flex";
      cell.style.alignItems = "center";
      cell.style.justifyContent = "flex-start";
      const dot = document.createElement("div");
      dot.title = a.symptom || `ADR ${idx + 1}`;
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

    const bar = document.createElement("div");
    bar.textContent = a.symptom || `ADR ${idx + 1}`;
    bar.style.height = "34px";
    bar.style.borderRadius = "9999px";
    bar.style.display = "flex";
    bar.style.alignItems = "center";
    bar.style.justifyContent = "center";
    bar.style.color = "#fff";
    bar.style.fontWeight = "600";
    bar.style.whiteSpace = "nowrap";
    bar.style.boxShadow = "0 8px 22px rgba(15,23,42,.12)";
    bar.style.fontSize = "12px";
    bar.style.background = "linear-gradient(90deg,#f43f5e 0%,#f97316 100%)";
    bar.style.position = "relative";
    bar.style.left = "0";
    bar.style.width = "100%";
    bar.style.gridColumn = `${startIdx + 1} / ${endIdx + 2}`;
    bar.style.gridRow = `${idx + 1}`;
    adrLane.appendChild(bar);
  });

  // เลื่อนไปด้านขวาสุดเหมือนหน้า 5
  const sc = document.getElementById("p6TimelineScroll");
  if (sc) sc.scrollLeft = sc.scrollWidth;
}

// ---------- อัปเดตอัตโนมัติเมื่อหน้า 5 เปลี่ยน ----------
document.addEventListener("da:update", (e) => {
  // วาดใหม่เฉพาะส่วน timeline ของหน้า 6
  try { drawTimeline6(); } catch (err) { /* เงียบ */ }
});

// (รีเฟรชอัตโนมัติเมื่อเปิดแท็บหน้า 6)
(function firstRenderWhenVisible() {
  const tabBtn = document.querySelector('.tabs button[data-target="page6"]');
  if (!tabBtn) return;
  tabBtn.addEventListener("click", () => {
    // หน่วงสั้นๆ เพื่อให้ DOM ของหน้า 6 ติดตั้งแล้ว
    setTimeout(() => { if (window.renderPage6) window.renderPage6(); }, 20);
  });
})();

// เรียกวาดทันทีถ้าโหลดหน้ามาแล้วมี #page6
setTimeout(() => { if (document.getElementById("page6")) window.renderPage6(); }, 0);

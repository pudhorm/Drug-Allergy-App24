// ===== drawTimeline แบบจุดอ้างอิงตรงกัน =====
function drawTimeline() {
  const dateRow  = document.getElementById("p5DateRow");
  const drugLane = document.getElementById("p5DrugLane");
  const adrLane  = document.getElementById("p5AdrLane");
  if (!dateRow || !drugLane || !adrLane) return;

  // ให้หัวแถววันขยับมาขวา เท่ากับ label "ยา" + gap (.6rem ประมาณ 12px)
  const LANE_OFFSET = 82; // ถ้าคุณไปแก้ความกว้าง label ทีหลัง แก้เลขนี้ตัวเดียว

  const root  = window.drugAllergyData || {};
  const page5 = root.page5 || { drugLines: [], adrLines: [] };

  // ใช้ข้อมูลจากโครงสร้างใหม่ก่อน ถ้าไม่มีค่อย fallback ของเก่า
  const drugs =
    (Array.isArray(page5.drugLines) && page5.drugLines) ||
    (Array.isArray(root.timelineDrugs) ? root.timelineDrugs : []);
  const adrs =
    (Array.isArray(page5.adrLines) && page5.adrLines) ||
    (Array.isArray(root.timelineAdrs) ? root.timelineAdrs : []);

  // ถ้าไม่มีอะไรเลยก็ล้างจอ
  if (!drugs.length && !adrs.length) {
    dateRow.innerHTML = "";
    drugLane.innerHTML = "";
    adrLane.innerHTML  = "";
    return;
  }

  const MS_DAY = 24 * 60 * 60 * 1000;
  const DAY_W  = 120;

  // ให้ทุกวันเป็นเที่ยงคืนก่อนจะไปคำนวณ
  const toMidnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  function parseDate(str) {
    if (!str) return null;
    const pure = String(str).trim().split(" ")[0];
    // dd/mm/yyyy
    if (pure.includes("/")) {
      const [d, m, y] = pure.split("/").map(Number);
      if (!d || !m || !y) return null;
      return new Date(y, m - 1, d);
    }
    // yyyy-mm-dd
    if (pure.includes("-")) {
      const [y, m, d] = pure.split("-").map(Number);
      if (!y || !m || !d) return null;
      return new Date(y, m - 1, d);
    }
    return null;
  }

  const now   = new Date();
  const today = toMidnight(now);

  // ===== 1) หา minDate =====
  let minDate = null;

  // จากยา
  drugs.forEach((d) => {
    const s  = d.startDate || d.start || d.giveDate;
    const dt = s ? toMidnight(parseDate(s)) : null;
    if (dt && (!minDate || dt < minDate)) minDate = dt;
  });

  // จาก ADR
  adrs.forEach((a) => {
    const s  = a.startDate || a.eventDate || a.symptomDate;
    const dt = s ? toMidnight(parseDate(s)) : null;
    if (dt && (!minDate || dt < minDate)) minDate = dt;
  });

  if (!minDate) minDate = today;

  // ปลายสุด = วันนี้เสมอ
  const maxDate = today;

  // ===== 2) วาดหัววัน =====
  const totalDays = Math.floor((maxDate - minDate) / MS_DAY) + 1;

  dateRow.innerHTML = "";
  // ให้หัวแถววันเลื่อนมาขวาเท่ากับช่อง label
  dateRow.style.paddingLeft = LANE_OFFSET + "px";

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(
      minDate.getFullYear(),
      minDate.getMonth(),
      minDate.getDate() + i
    );
    const cell = document.createElement("div");
    cell.className = "p5-date-cell";
    cell.style.width = DAY_W + "px";
    cell.textContent = d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
    });
    dateRow.appendChild(cell);
  }

  // ===== 3) เตรียม lane =====
  drugLane.innerHTML = "";
  adrLane.innerHTML  = "";

  // แปลงวัน → ระยะซ้าย
  function dateToLeftPx(date) {
    const dm = toMidnight(date);
    const diffDay = Math.floor((dm - minDate) / MS_DAY);
    return diffDay * DAY_W;
  }

  // เอาแบบตรงๆ: start ถึง end รวมวัน end ด้วย
  function widthFromTo(startDate, endDate) {
    const diffDay = Math.floor((endDate - startDate) / MS_DAY);
    const days = diffDay + 1; // 7 → 7 = 1 ช่อง
    return days * DAY_W;
  }

  // ความกว้างสูงสุดที่วาดได้ (ไม่ให้เลย)
  const maxTimelineWidth = totalDays * DAY_W;

  // ===== 4) วาดยา =====
  drugs.forEach((d, idx) => {
    const startStr = d.startDate || d.start || d.giveDate;
    if (!startStr) return;

    const start = toMidnight(parseDate(startStr));

    // วันหยุด
    const stopStr = d.stopDate || d.endDate || d.stop;
    let end = stopStr ? toMidnight(parseDate(stopStr)) : maxDate;

    // กันคว่ำ
    if (end < start) end = start;
    // ไม่ให้เกินวันนี้
    if (end > maxDate) end = maxDate;

    let left  = dateToLeftPx(start);
    let width = widthFromTo(start, end);

    // ถ้าเลยแกน ให้ตัด
    if (left + width > maxTimelineWidth) {
      width = maxTimelineWidth - left;
    }
    // กันแถบสั้นเกินในวันเดียว
    if (width < DAY_W * 0.5) width = DAY_W * 0.5;

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-drug";
    bar.textContent = d.name || d.drugName || `ยาตัวที่ ${idx + 1}`;
    bar.style.left  = left + "px";
    bar.style.width = width + "px";
    drugLane.appendChild(bar);
  });

  // ===== 5) วาด ADR =====
  adrs.forEach((a, idx) => {
    const startStr = a.startDate || a.eventDate || a.symptomDate;
    if (!startStr) return;

    const start = toMidnight(parseDate(startStr));

    const stopStr = a.endDate || a.resolveDate;
    let end = stopStr ? toMidnight(parseDate(stopStr)) : maxDate;

    if (end < start) end = start;
    if (end > maxDate) end = maxDate;

    let left  = dateToLeftPx(start);
    let width = widthFromTo(start, end);

    if (left + width > maxTimelineWidth) {
      width = maxTimelineWidth - left;
    }
    if (width < DAY_W * 0.5) width = DAY_W * 0.5;

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-adr";
    bar.textContent = a.symptom || a.name || `ADR ${idx + 1}`;
    bar.style.left  = left + "px";
    bar.style.width = width + "px";
    adrLane.appendChild(bar);
  });

  // ===== 6) เลื่อนให้เห็นปลาย =====
  const sw = document.getElementById("p5TimelineScroll");
  if (sw) sw.scrollLeft = sw.scrollWidth;
}

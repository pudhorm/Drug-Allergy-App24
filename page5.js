// ===== drawTimeline เวอร์ชันลบออก 2 วัน =====
function drawTimeline() {
  const dateRow = document.getElementById("p5DateRow");
  const drugLane = document.getElementById("p5DrugLane");
  const adrLane = document.getElementById("p5AdrLane");
  if (!dateRow || !drugLane || !adrLane) return;

  const store = window.drugAllergyData || {};
  const page5 = store.page5 || { drugLines: [], adrLines: [] };

  const drugs =
    (Array.isArray(page5.drugLines) && page5.drugLines) ||
    (Array.isArray(store.timelineDrugs) ? store.timelineDrugs : []);
  const adrs =
    (Array.isArray(page5.adrLines) && page5.adrLines) ||
    (Array.isArray(store.timelineAdrs) ? store.timelineAdrs : []);

  // ถ้าไม่มีข้อมูลเลยก็ล้างแล้วจบ
  if (!drugs.length && !adrs.length) {
    dateRow.innerHTML = "";
    drugLane.innerHTML = "";
    adrLane.innerHTML = "";
    return;
  }

  const MS_DAY = 24 * 60 * 60 * 1000;
  const DAY_W = 120;

  // แปลงวันที่แบบยืดหยุ่น
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

  function addDays(date, n) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
  }

  // วันนี้จริงๆ (ตามเครื่อง)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // ----- หา minDate (วันแรกสุดที่ต้องโชว์) -----
  let minDate = null;

  // จากยา
  drugs.forEach((d) => {
    const s = parseDate(d.startDate || d.start || d.giveDate);
    if (s && (!minDate || s < minDate)) {
      minDate = s;
    }
  });

  // จาก ADR
  adrs.forEach((a) => {
    const s = parseDate(a.startDate || a.eventDate || a.symptomDate);
    if (s && (!minDate || s < minDate)) {
      minDate = s;
    }
  });

  // ถ้าไม่เจอสักอันก็ใช้วันนี้
  if (!minDate) {
    minDate = today;
  }

  // ปลายสุด = วันนี้เสมอ
  const maxDate = today;

  // ----- วาดหัวตารางวัน -----
  const totalDays = Math.floor((maxDate - minDate) / MS_DAY) + 1; // รวมวันนี้
  dateRow.innerHTML = "";
  for (let i = 0; i < totalDays; i++) {
    const d = addDays(minDate, i);
    const cell = document.createElement("div");
    cell.className = "p5-date-cell";
    cell.style.width = DAY_W + "px";
    cell.textContent = d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
    });
    dateRow.appendChild(cell);
  }

  // เคลียร์ lane ก่อนวาดใหม่
  drugLane.innerHTML = "";
  adrLane.innerHTML = "";

  // แปลงวันที่ → ระยะซ้าย
  function dateToLeftPx(date) {
    const diffDay = Math.floor((date - minDate) / MS_DAY);
    return diffDay * DAY_W;
  }

  // คำนวณความกว้างแถบ (เวอร์ชันหัก 2 วัน)
  function calcWidthPx(startDate, endDate) {
    const diffDay = Math.floor((endDate - startDate) / MS_DAY); // จำนวนวันต่างกันจริงๆ
    // เดิมเราจะ +1 เพื่อรวมวันจบด้วย
    // ตอนนี้คุณขอ "ให้ -2" เพราะมันยาวเกิน 2 วัน
    let days = diffDay + 1 - 2;

    // กันไม่ให้ติดลบ / เป็น 0
    if (days < 1) days = 1;

    let w = days * DAY_W;
    // แถบสั้นมากให้มีขั้นต่ำ
    if (w < DAY_W * 0.6) w = DAY_W * 0.6;
    return w;
  }

  // ----- วาดยา -----
  drugs.forEach((d, idx) => {
    const start = parseDate(d.startDate || d.start || d.giveDate);
    if (!start) return;

    // วันหยุด ถ้าไม่ใส่ → วันนี้
    const endRaw = d.stopDate || d.endDate || d.stop;
    let endDate = endRaw ? parseDate(endRaw) : maxDate;
    if (!endDate) endDate = maxDate;

    // กันกรณีใส่วันหยุดน้อยกว่าวันเริ่ม
    if (endDate < start) endDate = start;
    // กันเลยไปเกินวันนี้
    if (endDate > maxDate) endDate = maxDate;

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-drug";
    bar.textContent = d.name || d.drugName || `ยาตัวที่ ${idx + 1}`;

    bar.style.left = dateToLeftPx(start) + "px";
    bar.style.width = calcWidthPx(start, endDate) + "px";

    drugLane.appendChild(bar);
  });

  // ----- วาด ADR -----
  adrs.forEach((a, idx) => {
    const start = parseDate(a.startDate || a.eventDate || a.symptomDate);
    if (!start) return;

    const endRaw = a.endDate || a.resolveDate;
    let endDate = endRaw ? parseDate(endRaw) : maxDate;
    if (!endDate) endDate = maxDate;
    if (endDate < start) endDate = start;
    if (endDate > maxDate) endDate = maxDate;

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-adr";
    bar.textContent = a.symptom || a.name || `ADR ${idx + 1}`;

    bar.style.left = dateToLeftPx(start) + "px";
    bar.style.width = calcWidthPx(start, endDate) + "px";

    adrLane.appendChild(bar);
  });

  // เลื่อนให้เห็นวันสุดท้ายเลย
  const sw = document.getElementById("p5TimelineScroll");
  if (sw) {
    sw.scrollLeft = sw.scrollWidth;
  }
}

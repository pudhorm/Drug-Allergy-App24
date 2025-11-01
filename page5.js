// ===== drawTimeline เวอร์ชันหักปลาย 2 วัน (ไม่ทำให้ปุ่มพัง) =====
function drawTimeline() {
  const dateRow = document.getElementById("p5DateRow");
  const drugLane = document.getElementById("p5DrugLane");
  const adrLane = document.getElementById("p5AdrLane");
  if (!dateRow || !drugLane || !adrLane) return;

  // ดึงข้อมูลแบบเซฟๆ
  const root = window.drugAllergyData || {};
  const page5 = root.page5 || { drugLines: [], adrLines: [] };

  const drugs = Array.isArray(page5.drugLines) ? page5.drugLines : [];
  const adrs = Array.isArray(page5.adrLines) ? page5.adrLines : [];

  // ถ้าไม่มีอะไรเลยก็ล้างจอแล้วจบ
  if (!drugs.length && !adrs.length) {
    dateRow.innerHTML = "";
    drugLane.innerHTML = "";
    adrLane.innerHTML = "";
    return;
  }

  const MS_DAY = 24 * 60 * 60 * 1000;
  const DAY_W = 120;

  // --- helper ---
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

  // วันนี้ (ตัดเวลาออก)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // ===== 1) หา minDate =====
  let minDate = null;

  drugs.forEach((d) => {
    const s = parseDate(d.startDate || d.start || d.giveDate);
    if (s && (!minDate || s < minDate)) minDate = s;
  });

  adrs.forEach((a) => {
    const s = parseDate(a.startDate || a.eventDate || a.symptomDate);
    if (s && (!minDate || s < minDate)) minDate = s;
  });

  if (!minDate) {
    minDate = today;
  }

  // ปลายสุด = วันนี้เสมอ
  const maxDate = today;

  // ===== 2) วาดแถววันที่ =====
  const totalDays = Math.floor((maxDate - minDate) / MS_DAY) + 1;
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

  // ===== 3) เตรียมเลน =====
  drugLane.innerHTML = "";
  adrLane.innerHTML = "";

  function dateToLeftPx(date) {
    const diffDay = Math.floor((date - minDate) / MS_DAY);
    return diffDay * DAY_W;
  }

  // คำนวณความกว้าง (ใช้ end ที่ถูก trim แล้ว)
  function calcWidthPx(startDate, endDate) {
    const diffDay = Math.floor((endDate - startDate) / MS_DAY);
    const days = diffDay + 1; // รวมวันจบ
    let w = days * DAY_W;
    if (w < DAY_W * 0.6) w = DAY_W * 0.6;
    return w;
  }

  // helper สำหรับ "หักปลาย 2 วัน" แต่ไม่ให้เลยจุด start
  function trimEndMinus2(startDate, endDate) {
    // หักเฉพาะกรณีที่มีช่วงมากกว่า 2 วัน
    let trimmed = addDays(endDate, -2);
    // ถ้าหักแล้วเลยมาชนก่อนวันเริ่ม → กลับไปวันเริ่ม
    if (trimmed < startDate) {
      trimmed = startDate;
    }
    return trimmed;
  }

  // ===== 4) วาดยา =====
  drugs.forEach((d, idx) => {
    const start = parseDate(d.startDate || d.start || d.giveDate);
    if (!start) return;

    const endRaw = d.stopDate || d.endDate || d.stop;
    let endDate = endRaw ? parseDate(endRaw) : maxDate;
    if (!endDate) endDate = maxDate;

    // ไม่ให้วันหยุด < วันเริ่ม
    if (endDate < start) endDate = start;
    // ไม่ให้เกินวันนี้
    if (endDate > maxDate) endDate = maxDate;

    // หักปลาย 2 วันแบบที่ขอ
    const finalEnd = trimEndMinus2(start, endDate);

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-drug";
    bar.textContent = d.name || d.drugName || `ยาตัวที่ ${idx + 1}`;
    bar.style.left = dateToLeftPx(start) + "px";
    bar.style.width = calcWidthPx(start, finalEnd) + "px";
    drugLane.appendChild(bar);
  });

  // ===== 5) วาด ADR =====
  adrs.forEach((a, idx) => {
    const start = parseDate(a.startDate || a.eventDate || a.symptomDate);
    if (!start) return;

    const endRaw = a.endDate || a.resolveDate;
    let endDate = endRaw ? parseDate(endRaw) : maxDate;
    if (!endDate) endDate = maxDate;

    if (endDate < start) endDate = start;
    if (endDate > maxDate) endDate = maxDate;

    const finalEnd = trimEndMinus2(start, endDate);

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-adr";
    bar.textContent = a.symptom || a.name || `ADR ${idx + 1}`;
    bar.style.left = dateToLeftPx(start) + "px";
    bar.style.width = calcWidthPx(start, finalEnd) + "px";
    adrLane.appendChild(bar);
  });

  // ===== 6) เลื่อนให้เห็นวันท้าย =====
  const sw = document.getElementById("p5TimelineScroll");
  if (sw) {
    sw.scrollLeft = sw.scrollWidth;
  }
}

// ===== drawTimeline เวอร์ชันตรงวัน (ไม่แตะ layout อื่น) =====
function drawTimeline() {
  const dateRow = document.getElementById("p5DateRow");
  const drugLane = document.getElementById("p5DrugLane");
  const adrLane  = document.getElementById("p5AdrLane");
  if (!dateRow || !drugLane || !adrLane) return;

  // ----- ดึงข้อมูลจาก store -----
  const store = window.drugAllergyData || {};
  const drugs =
    (store.page5 && Array.isArray(store.page5.drugLines) && store.page5.drugLines) ||
    (Array.isArray(store.timelineDrugs) ? store.timelineDrugs : []);
  const adrs =
    (store.page5 && Array.isArray(store.page5.adrLines) && store.page5.adrLines) ||
    (Array.isArray(store.timelineAdrs) ? store.timelineAdrs : []);

  // ถ้าไม่มีเลยก็ล้างแล้วจบ
  if (!drugs.length && !adrs.length) {
    dateRow.innerHTML = "";
    drugLane.innerHTML = "";
    adrLane.innerHTML = "";
    return;
  }

  const MS_DAY = 24 * 60 * 60 * 1000;
  const DAY_W  = 120; // ต้องตรงกับ CSS

  // แปลงวันที่ได้ทั้ง dd/mm/yyyy และ yyyy-mm-dd
  function parseDate(str) {
    if (!str) return null;
    const pure = String(str).trim().split(" ")[0];
    if (pure.includes("/")) {
      const [d, m, y] = pure.split("/").map(Number);
      if (!d || !m || !y) return null;
      return new Date(y, m - 1, d);
    }
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
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // ----- หา minDate จากข้อมูลทั้งหมด -----
  let minDate = null;
  drugs.forEach(d => {
    const s = parseDate(d.startDate || d.start || d.giveDate);
    if (s) {
      if (!minDate || s < minDate) minDate = s;
    }
  });
  adrs.forEach(a => {
    const s = parseDate(a.startDate || a.eventDate || a.symptomDate);
    if (s) {
      if (!minDate || s < minDate) minDate = s;
    }
  });

  if (!minDate) {
    minDate = today;
  }

  // ปลายสุด = วันนี้ เสมอ
  const maxDate = today;

  // ----- วาดแถววันที่ -----
  const totalDays = Math.floor((maxDate - minDate) / MS_DAY) + 1;
  dateRow.innerHTML = "";
  for (let i = 0; i < totalDays; i++) {
    const d = addDays(minDate, i);
    const cell = document.createElement("div");
    cell.className = "p5-date-cell";
    cell.style.width = DAY_W + "px";
    cell.textContent = d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short"
    });
    dateRow.appendChild(cell);
  }

  // เคลียร์เลนก่อน
  drugLane.innerHTML = "";
  adrLane.innerHTML  = "";

  // แปลงวันที่ → px จากซ้าย
  function dateToLeftPx(date) {
    const diffDay = Math.floor((date - minDate) / MS_DAY);
    return diffDay * DAY_W;
  }

  // คำนวณความกว้างแบบ “รวมวันสุดท้ายด้วย”
  // เช่น 27 → 29 = 3 วัน → 3 * DAY_W
  function calcWidthPx(startDate, endDate) {
    const diffDay = Math.floor((endDate - startDate) / MS_DAY);
    const days = diffDay + 1; // <<< ตรงนี้แหละที่ทำให้ไม่ขาด/ไม่เลย
    let w = days * DAY_W;
    if (w < DAY_W * 0.6) w = DAY_W * 0.6; // กันแท่งสั้นเกิน
    return w;
  }

  // ----- วาดยา -----
  drugs.forEach((d, idx) => {
    const start = parseDate(d.startDate || d.start || d.giveDate);
    if (!start) return;

    // วันหยุดที่กรอก
    const endRaw = d.stopDate || d.endDate || d.stop;
    let endDate  = endRaw ? parseDate(endRaw) : maxDate;

    // ถ้า parse ไม่ได้ให้ใช้วันนี้
    if (!endDate) endDate = maxDate;
    // ถ้ากรอกวันหยุดน้อยกว่าวันเริ่ม → บังคับเท่าวันเริ่ม
    if (endDate < start) endDate = start;
    // ถ้ากรอกวันหยุดเป็นอนาคต → บังคับให้จบที่วันนี้ (ตามที่คุณสั่ง)
    if (endDate > maxDate) endDate = maxDate;

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-drug";
    bar.textContent = d.drugName || d.name || `ยาตัวที่ ${idx + 1}`;

    bar.style.left  = dateToLeftPx(start) + "px";
    bar.style.width = calcWidthPx(start, endDate) + "px";

    drugLane.appendChild(bar);
  });

  // ----- วาด ADR -----
  adrs.forEach((a, idx) => {
    const start = parseDate(a.startDate || a.eventDate || a.symptomDate);
    if (!start) return;

    const endRaw = a.endDate || a.resolveDate;
    let endDate  = endRaw ? parseDate(endRaw) : maxDate;

    if (!endDate) endDate = maxDate;
    if (endDate < start) endDate = start;
    if (endDate > maxDate) endDate = maxDate;

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-adr";
    bar.textContent = a.symptom || a.name || `ADR ${idx + 1}`;

    bar.style.left  = dateToLeftPx(start) + "px";
    bar.style.width = calcWidthPx(start, endDate) + "px";

    adrLane.appendChild(bar);
  });

  // เลื่อนมาด้านขวาให้เห็น "วันนี้"
  const sw = document.getElementById("p5TimelineScroll");
  if (sw) {
    sw.scrollLeft = sw.scrollWidth;
  }
}

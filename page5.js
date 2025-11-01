// ===== drawTimeline เวอร์ชันตรงสเปค =====
function drawTimeline() {
  const dateRow = document.getElementById("p5DateRow");   // แถววันที่ด้านบน
  const drugLane = document.getElementById("p5DrugLane"); // ช่องวาดแถบยา
  const adrLane  = document.getElementById("p5AdrLane");  // ช่องวาดแถบ ADR

  if (!dateRow || !drugLane || !adrLane) return;

  // ----- 1) ดึงข้อมูลจากศูนย์กลาง -----
  // รองรับได้ 2 แบบ: แบบใหม่ (page5.drugLines) และของเก่าที่คุณเคยใช้ (timelineDrugs)
  const store = window.drugAllergyData || {};
  const drugs =
    (store.page5 && Array.isArray(store.page5.drugLines) && store.page5.drugLines) ||
    (Array.isArray(store.timelineDrugs) ? store.timelineDrugs : []);
  const adrs =
    (store.page5 && Array.isArray(store.page5.adrLines) && store.page5.adrLines) ||
    (Array.isArray(store.timelineAdrs) ? store.timelineAdrs : []);

  // ถ้าไม่มีข้อมูลเลยให้ล้างจอแล้วจบ
  if (!drugs.length && !adrs.length) {
    dateRow.innerHTML = "";
    drugLane.innerHTML = "";
    adrLane.innerHTML = "";
    return;
  }

  // ----- 2) helper จัดการวันที่ -----
  const MS_DAY = 24 * 60 * 60 * 1000;
  // รับได้ทั้ง "dd/mm/yyyy" และ "yyyy-mm-dd" และ "yyyy-mm-dd HH:mm"
  function parseDate(str) {
    if (!str) return null;
    // ตัดเวลาออกถ้ามี
    const pure = String(str).trim().split(" ")[0];
    // 1) dd/mm/yyyy
    if (pure.includes("/")) {
      const [d, m, y] = pure.split("/").map(Number);
      if (!d || !m || !y) return null;
      return new Date(y, m - 1, d);
    }
    // 2) yyyy-mm-dd
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

  // วันนี้ตามเครื่อง (ซึ่งคุณอยู่ไทยก็จะเป็นปฏิทินไทยอยู่แล้ว)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // ----- 3) หา minDate และ maxDate (ปลายต้องเป็น "วันนี้") -----
  let minDate = null;

  // ดูจากยา
  drugs.forEach((d) => {
    // ของคุณบางตัวชื่อ field อาจเป็น drugName / name / ชื่ออื่น
    const s = parseDate(d.startDate || d.start || d.giveDate);
    if (s) {
      if (!minDate || s < minDate) minDate = s;
    }
  });

  // ดูจาก ADR
  adrs.forEach((a) => {
    // ในรูปคุณตั้งชื่อเป็นวันที่เกิด / วันเริ่มอาการ
    const s = parseDate(a.startDate || a.eventDate || a.symptomDate);
    if (s) {
      if (!minDate || s < minDate) minDate = s;
    }
  });

  // ถ้าไม่เจอเลย ก็ใช้วันนี้
  if (!minDate) {
    minDate = today;
  }

  // ปลายสุด = วันนี้ (ห้ามหยุดก่อน)
  const maxDate = today;

  // ----- 4) คำนวณจำนวนวันและวาดแกน X -----
  const DAY_W = 120; // ต้องตรงกับใน style.css ของคุณ
  const totalDays = Math.floor((maxDate.getTime() - minDate.getTime()) / MS_DAY) + 1;

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

  // ----- 5) เตรียมเลน -----
  drugLane.innerHTML = "";
  adrLane.innerHTML = "";

  // helper: วันที่ → ระยะทางซ้าย (px) จากวันแรก
  function dateToLeftPx(date) {
    const diffDay = Math.floor((date.getTime() - minDate.getTime()) / MS_DAY);
    return diffDay * DAY_W;
  }

  // helper: วันที่เริ่ม + วันที่จบ → ความกว้าง
  function calcWidthPx(startDate, endDate) {
    const diffDay = Math.floor((endDate.getTime() - startDate.getTime()) / MS_DAY);
    // +1 เพราะถ้าเริ่ม = จบ ต้องกิน 1 ช่องเต็ม
    return (diffDay + 1) * DAY_W - 12; // -12 ให้ปลายไม่ล้ำเกินกรอบ
  }

  // ----- 6) วาดแถบ "ยา" ให้ปลายหยุดตรงวันหยุด ถ้าไม่มีวันหยุดให้ไปวันนี้ -----
  drugs.forEach((d, idx) => {
    const start = parseDate(d.startDate || d.start || d.giveDate);
    if (!start) return; // ไม่มีวันเริ่มก็วาดไม่ได้

    // ถ้ามีวันหยุด → ใช้วันนั้นเลย
    const end = d.stopDate || d.endDate || d.stop;
    const endDateRaw = end ? parseDate(end) : null;

    // ถ้าไม่มีวันหยุด → ongoing → วันนี้
    let endDate = endDateRaw ? endDateRaw : maxDate;

    // ถ้า user กรอกวันหยุดน้อยกว่าวันเริ่ม → บังคับเท่าวันเริ่ม
    if (endDate < start) endDate = start;

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-drug";
    bar.textContent = d.drugName || d.name || `ยาตัวที่ ${idx + 1}`;

    // จัดตำแหน่ง
    const left = dateToLeftPx(start);
    const width = calcWidthPx(start, endDate);

    bar.style.left = left + "px";
    bar.style.width = width + "px";

    drugLane.appendChild(bar);
  });

  // ----- 7) วาดแถบ "ADR" แบบเดียวกัน -----
  adrs.forEach((a, idx) => {
    // บางคนเก็บว่า startDate, บางคนเก็บ eventDate
    const start = parseDate(a.startDate || a.eventDate || a.symptomDate);
    if (!start) return;

    const end = a.endDate || a.resolveDate;
    const endDateRaw = end ? parseDate(end) : null;
    let endDate = endDateRaw ? endDateRaw : maxDate;
    if (endDate < start) endDate = start;

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-adr";
    bar.textContent = a.symptom || a.name || `ADR ${idx + 1}`;

    const left = dateToLeftPx(start);
    const width = calcWidthPx(start, endDate);

    bar.style.left = left + "px";
    bar.style.width = width + "px";

    adrLane.appendChild(bar);
  });

  // ----- 8) เลื่อนให้เห็นด้านขวาถ้ามันยาว -----
  const scrollWrap = document.getElementById("p5TimelineScroll");
  if (scrollWrap) {
    // เลื่อนมาด้านขวานิดหน่อยให้เห็นวันนี้
    scrollWrap.scrollLeft = scrollWrap.scrollWidth;
  }
}

// ===== drawTimeline เวอร์ชันแก้วันเริ่ม/วันหยุด =====
function drawTimeline() {
  const dateRow = document.getElementById("p5DateRow");
  const drugLane = document.getElementById("p5DrugLane");
  const adrLane  = document.getElementById("p5AdrLane");

  if (!dateRow || !drugLane || !adrLane) return;

  // ดึงข้อมูลจากตัวแปรกลาง (รองรับชื่อเก่าๆ ด้วย)
  const store = window.drugAllergyData || {};
  const drugs =
    (store.page5 && Array.isArray(store.page5.drugLines) && store.page5.drugLines) ||
    (Array.isArray(store.timelineDrugs) ? store.timelineDrugs : []);
  const adrs =
    (store.page5 && Array.isArray(store.page5.adrLines) && store.page5.adrLines) ||
    (Array.isArray(store.timelineAdrs) ? store.timelineAdrs : []);

  // ถ้าไม่มีอะไรเลยก็ล้างแล้วจบ
  if (!drugs.length && !adrs.length) {
    dateRow.innerHTML = "";
    drugLane.innerHTML = "";
    adrLane.innerHTML = "";
    return;
  }

  // ========== helper วันที่ ==========
  const MS_DAY = 24 * 60 * 60 * 1000;

  function parseDate(str) {
    if (!str) return null;
    const s = String(str).trim();

    // 1) yyyy-mm-dd (ค่าจาก input type="date")
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [y, m, d] = s.split("-").map(Number);
      return new Date(y, m - 1, d);
    }

    // 2) dd/mm/yyyy
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
      const [d, m, y] = s.split("/").map(Number);
      return new Date(y, m - 1, d);
    }

    // 3) dd-mm-yyyy (กันไว้เผื่อ)
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(s)) {
      const [d, m, y] = s.split("-").map(Number);
      return new Date(y, m - 1, d);
    }

    return null;
  }

  function addDays(date, n) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
  }

  // วันนี้ (เครื่องคุณ) → ใช้เป็น day max ถ้าไม่ระบุวันสิ้นสุด
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // ========== หา minDate ของข้อมูล ==========
  let minDate = null;

  // ดูจากยา
  drugs.forEach((d) => {
    const start =
      parseDate(d.startDate) ||
      parseDate(d.start) ||
      parseDate(d.giveDate) ||
      null;
    if (start) {
      if (!minDate || start < minDate) minDate = start;
    }
  });

  // ดูจาก ADR
  adrs.forEach((a) => {
    const start =
      parseDate(a.startDate) ||
      parseDate(a.eventDate) ||
      parseDate(a.symptomDate) ||
      null;
    if (start) {
      if (!minDate || start < minDate) minDate = start;
    }
  });

  // ถ้ายังไม่มีเลยก็ใช้วันนี้
  if (!minDate) {
    minDate = today;
  }

  // ปลายสุดของแกน X = วันนี้ เสมอ
  const maxDate = today;

  // ========== วาดแถววันที่ ==========
  const DAY_W = 120; // ต้องตรงกับ style.css
  const totalDays =
    Math.floor((maxDate.getTime() - minDate.getTime()) / MS_DAY) + 1;

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

  // เคลียร์เลนก่อนวาดใหม่
  drugLane.innerHTML = "";
  adrLane.innerHTML = "";

  // helper: แปลง date → ระยะจากซ้าย
  function dateToLeftPx(date) {
    const diffDay = Math.floor((date.getTime() - minDate.getTime()) / MS_DAY);
    return diffDay * DAY_W;
  }

  // helper: คำนวณความกว้างของแท่งให้พอดีกับ “วันสุดท้าย”
  // จุดสำคัญ → ถ้ามีวันหยุดให้ตัดที่วันนั้นเลย, ถ้าไม่มีให้ตัดที่วันนี้
  function widthFromTo(startDate, endDate) {
    const diffDay = Math.floor(
      (endDate.getTime() - startDate.getTime()) / MS_DAY
    );
    // diffDay = 0  → วันเดียว → กว้าง = 1 ช่อง
    return (diffDay + 1) * DAY_W - 4; // -4 ให้ขอบไม่ล้น
  }

  // ========== วาดแถบ “ยา” ==========
  drugs.forEach((d, idx) => {
    const start =
      parseDate(d.startDate) ||
      parseDate(d.start) ||
      parseDate(d.giveDate);
    if (!start) return; // ไม่มีวันเริ่ม วาดไม่ได้

    // รองรับชื่อ field วันหยุดได้หลายแบบ
    const endRaw =
      d.stopDate ||
      d.endDate ||
      d.stop ||
      d.stopDrugDate ||
      d.dateStop ||
      null;
    let end = endRaw ? parseDate(endRaw) : null;

    // ถ้าไม่ได้ระบุวันหยุด → ใช้วันนี้
    if (!end) {
      end = today;
    }

    // กันกรณีกรอกวันหยุด < วันเริ่ม
    if (end < start) {
      end = start;
    }

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-drug";
    bar.textContent = d.drugName || d.name || `ยาตัวที่ ${idx + 1}`;

    const left = dateToLeftPx(start);
    const width = widthFromTo(start, end);

    bar.style.left = left + "px";
    bar.style.width = width + "px";

    drugLane.appendChild(bar);
  });

  // ========== วาดแถบ “ADR” ==========
  adrs.forEach((a, idx) => {
    const start =
      parseDate(a.startDate) ||
      parseDate(a.eventDate) ||
      parseDate(a.symptomDate);
    if (!start) return;

    const endRaw =
      a.endDate ||
      a.resolveDate ||
      a.stopDate ||
      a.dateStop ||
      null;
    let end = endRaw ? parseDate(endRaw) : null;

    if (!end) {
      end = today;
    }
    if (end < start) {
      end = start;
    }

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-adr";
    bar.textContent = a.symptom || a.name || `ADR ${idx + 1}`;

    const left = dateToLeftPx(start);
    const width = widthFromTo(start, end);

    bar.style.left = left + "px";
    bar.style.width = width + "px";

    adrLane.appendChild(bar);
  });

  // เลื่อนให้เห็นด้านขวาสุดนิดหน่อย
  const scrollWrap = document.getElementById("p5TimelineScroll");
  if (scrollWrap) {
    scrollWrap.scrollLeft = scrollWrap.scrollWidth;
  }
}

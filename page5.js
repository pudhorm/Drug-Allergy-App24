// ===== drawTimeline เวอร์ชันตรงสเปค ตรงวันเป๊ะ =====
function drawTimeline() {
  const dateRow = document.getElementById("p5DateRow");   // แถววันที่ด้านบน
  const drugLane = document.getElementById("p5DrugLane"); // ช่องวาดแถบยา
  const adrLane  = document.getElementById("p5AdrLane");  // ช่องวาดแถบ ADR

  if (!dateRow || !drugLane || !adrLane) return;

  // ----- 1) ดึงข้อมูลจากศูนย์กลาง -----
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

  // รับได้ทั้ง "dd/mm/yyyy", "yyyy-mm-dd", "yyyy-mm-dd HH:mm"
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

  // วันนี้ (ปัดเวลาออก)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // ----- 3) หา minDate (วันแรกสุดที่เจอ) -----
  let minDate = null;

  // จากยา
  drugs.forEach((d) => {
    const s = parseDate(d.startDate || d.start || d.giveDate);
    if (s) {
      if (!minDate || s < minDate) minDate = s;
    }
  });

  // จาก ADR
  adrs.forEach((a) => {
    const s = parseDate(a.startDate || a.eventDate || a.symptomDate);
    if (s) {
      if (!minDate || s < minDate) minDate = s;
    }
  });

  // ถ้าไม่เจอเลย ให้เริ่มวันนี้
  if (!minDate) {
    minDate = today;
  }

  // ปลายสุดบังคับเป็น "วันนี้" เสมอ
  const maxDate = today;

  // ----- 4) วาดแกน X -----
  const DAY_W = 120;              // ต้องตรงกับ style.css
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

  // ----- 5) เคลียร์เลน -----
  drugLane.innerHTML = "";
  adrLane.innerHTML = "";

  // ===== helper แปลงวันที่ → index → px =====
  // วันที่ → index (0 = วันแรกบนแกน)
  function dateToIndex(date) {
    return Math.floor((date.getTime() - minDate.getTime()) / MS_DAY);
  }
  // index → px
  function indexToLeftPx(idx) {
    return idx * DAY_W;
  }
  // startIndex, endIndex → width
  function calcWidthFromIndex(startIdx, endIdx) {
    // เช่น เริ่ม 0 จบ 0 → กิน 1 ช่อง = 1 * DAY_W
    const daysCount = endIdx - startIdx + 1;
    return daysCount * DAY_W;
  }

  // ----- 6) วาด "ยา" ให้ตรงเป๊ะ -----
  drugs.forEach((d, idx) => {
    const startDate = parseDate(d.startDate || d.start || d.giveDate);
    if (!startDate) return;

    // ถ้ามีวันหยุดให้ใช้วันนั้น, ถ้าไม่มีให้ใช้วันนี้
    const rawEnd = d.stopDate || d.endDate || d.stop;
    let endDate = rawEnd ? parseDate(rawEnd) : maxDate;
    if (!endDate) endDate = maxDate;

    // ถ้าวันจบน้อยกว่าวันเริ่ม → บังคับเท่าวันเริ่ม
    if (endDate < startDate) endDate = startDate;

    const startIdx = dateToIndex(startDate);
    const endIdx   = dateToIndex(endDate);

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-drug";
    bar.textContent = d.drugName || d.name || `ยาตัวที่ ${idx + 1}`;
    bar.title = `${bar.textContent}\nเริ่ม: ${startDate.toLocaleDateString("th-TH")}  ${
      rawEnd ? "หยุด: " + endDate.toLocaleDateString("th-TH") : "(ongoing)"
    }`;

    bar.style.left = indexToLeftPx(startIdx) + "px";
    bar.style.width = calcWidthFromIndex(startIdx, endIdx) + "px";

    drugLane.appendChild(bar);
  });

  // ----- 7) วาด "ADR" ให้ตรงเป๊ะ -----
  adrs.forEach((a, idx) => {
    const startDate = parseDate(a.startDate || a.eventDate || a.symptomDate);
    if (!startDate) return;

    const rawEnd = a.endDate || a.resolveDate;
    let endDate = rawEnd ? parseDate(rawEnd) : maxDate;
    if (!endDate) endDate = maxDate;
    if (endDate < startDate) endDate = startDate;

    const startIdx = dateToIndex(startDate);
    const endIdx   = dateToIndex(endDate);

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-adr";
    bar.textContent = a.symptom || a.name || `ADR ${idx + 1}`;
    bar.title = `${bar.textContent}\nเริ่ม: ${startDate.toLocaleDateString("th-TH")}  ${
      rawEnd ? "หาย: " + endDate.toLocaleDateString("th-TH") : "(ongoing)"
    }`;

    bar.style.left = indexToLeftPx(startIdx) + "px";
    bar.style.width = calcWidthFromIndex(startIdx, endIdx) + "px";

    adrLane.appendChild(bar);
  });

  // ----- 8) ให้ scroll เห็นวันล่าสุด -----
  const scrollWrap = document.getElementById("p5TimelineScroll");
  if (scrollWrap) {
    scrollWrap.scrollLeft = scrollWrap.scrollWidth;
  }
}

// ===== drawTimeline เวอร์ชันตรงวัน =====
function drawTimeline() {
  const dateRow = document.getElementById("p5DateRow");
  const drugLane = document.getElementById("p5DrugLane");
  const adrLane = document.getElementById("p5AdrLane");

  if (!dateRow || !drugLane || !adrLane) return;

  const store = window.drugAllergyData || {};
  const drugs =
    (store.page5 && Array.isArray(store.page5.drugLines) && store.page5.drugLines) ||
    (Array.isArray(store.timelineDrugs) ? store.timelineDrugs : []);
  const adrs =
    (store.page5 && Array.isArray(store.page5.adrLines) && store.page5.adrLines) ||
    (Array.isArray(store.timelineAdrs) ? store.timelineAdrs : []);

  if (!drugs.length && !adrs.length) {
    dateRow.innerHTML = "";
    drugLane.innerHTML = "";
    adrLane.innerHTML = "";
    return;
  }

  const MS_DAY = 24 * 60 * 60 * 1000;
  const DAY_W = 120;

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

  const now = new Date();
  // วันนี้ (ตัดเวลาออก) → เอา “วันนี้” จริงๆ เป็น day end
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // ----- หา min/max -----
  let minDate = null;
  drugs.forEach((d) => {
    const s = parseDate(d.startDate || d.start || d.giveDate);
    if (s) {
      if (!minDate || s < minDate) minDate = s;
    }
  });
  adrs.forEach((a) => {
    const s = parseDate(a.startDate || a.eventDate || a.symptomDate);
    if (s) {
      if (!minDate || s < minDate) minDate = s;
    }
  });
  if (!minDate) minDate = today;

  // ปลายสุดต้องเป็น “วันนี้” เสมอ
  const maxDate = today;

  // ----- วาดหัวตารางวัน -----
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

  // เคลียร์เลน
  drugLane.innerHTML = "";
  adrLane.innerHTML = "";

  function dateToLeftPx(date) {
    const diffDay = Math.floor((date - minDate) / MS_DAY);
    return diffDay * DAY_W;
  }

  // ความกว้าง: “พอดีวันจบ” ไม่บวกเพิ่ม 1 วัน
  function calcWidthPx(startDate, endDate) {
    const diffDay = Math.floor((endDate - startDate) / MS_DAY); // 27→29 = 2
    let w = diffDay * DAY_W;
    // ถ้าวันเดียวให้มีความกว้างหน่อย
    if (w < DAY_W * 0.6) w = DAY_W * 0.6;
    return w;
  }

  // ----- วาดยา -----
  drugs.forEach((d, idx) => {
    const start = parseDate(d.startDate || d.start || d.giveDate);
    if (!start) return;

    // ถ้ามีวันหยุด → ใช้วันนั้นเลย (ไม่ต้อง -1 อีกแล้ว)
    const endRaw = d.stopDate || d.endDate || d.stop;
    let endDate = endRaw ? parseDate(endRaw) : maxDate;
    if (!endDate) endDate = maxDate;

    // กันกรณี stop < start
    if (endDate < start) endDate = start;

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-drug";
    bar.textContent = d.drugName || d.name || `ยาตัวที่ ${idx + 1}`;

    const left = dateToLeftPx(start);
    const width = calcWidthPx(start, endDate);

    bar.style.left = left + "px";
    bar.style.width = width + "px";

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

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-adr";
    bar.textContent = a.symptom || a.name || `ADR ${idx + 1}`;

    const left = dateToLeftPx(start);
    const width = calcWidthPx(start, endDate);

    bar.style.left = left + "px";
    bar.style.width = width + "px";

    adrLane.appendChild(bar);
  });

  // เลื่อนมาเห็นวันท้าย (วันนี้)
  const sw = document.getElementById("p5TimelineScroll");
  if (sw) {
    sw.scrollLeft = sw.scrollWidth;
  }
}

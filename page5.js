// ===== drawTimeline เวอร์ชันล็อกวันขวาไม่ให้เลย 1 วัน =====
function drawTimeline() {
  const dateRow = document.getElementById("p5DateRow");
  const drugLane = document.getElementById("p5DrugLane");
  const adrLane = document.getElementById("p5AdrLane");
  if (!dateRow || !drugLane || !adrLane) return;

  const store = window.drugAllergyData || {};
  const page5 = store.page5 || { drugLines: [], adrLines: [] };

  const drugs = Array.isArray(page5.drugLines) ? page5.drugLines : [];
  const adrs = Array.isArray(page5.adrLines) ? page5.adrLines : [];

  // ถ้าไม่มีอะไรเลยก็ล้างแล้วออก
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

  // วันนี้แบบตัดเวลา
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // ---------- หา minDate (วันแรกสุดของกราฟ) ----------
  let minDate = null;
  drugs.forEach((d) => {
    const s = parseDate(d.startDate || d.start || d.giveDate);
    if (s && (!minDate || s < minDate)) minDate = s;
  });
  adrs.forEach((a) => {
    const s = parseDate(a.startDate || a.eventDate || a.symptomDate);
    if (s && (!minDate || s < minDate)) minDate = s;
  });
  if (!minDate) minDate = today;

  // ปลายกราฟ = วันนี้
  const maxDate = today;

  // ---------- วาดแถววันที่ ----------
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

  // เคลียร์ lane
  drugLane.innerHTML = "";
  adrLane.innerHTML = "";

  function dateToLeftPx(date) {
    const diffDay = Math.floor((date - minDate) / MS_DAY);
    return diffDay * DAY_W;
  }

  // คิดความกว้างแบบ “ตามจำนวนวันจริง”
  function calcWidthPx(startDate, endDate) {
    const diffDay = Math.floor((endDate - startDate) / MS_DAY) + 1; // รวมวันเริ่ม
    let w = diffDay * DAY_W;
    if (w < DAY_W * 0.6) w = DAY_W * 0.6;
    return w;
  }

  // ========== วาดยา ==========
  drugs.forEach((d, idx) => {
    const start = parseDate(d.startDate || d.start || d.giveDate);
    if (!start) return;

    const rawEnd = d.stopDate || d.endDate || d.stop;
    let endDate = rawEnd ? parseDate(rawEnd) : maxDate;

    // ถ้ามีระบุหยุดจริง → ลด 1 วันเพื่อไม่ให้กินวันถัดไป
    if (rawEnd && endDate) {
      const adj = addDays(endDate, -1);
      // อย่าให้เลยวันเริ่ม
      endDate = adj >= start ? adj : start;
    }

    // ถ้าไม่มีวันหยุด หรือแปลงไม่ได้ → ใช้วันนี้
    if (!endDate) endDate = maxDate;
    if (endDate > maxDate) endDate = maxDate;
    if (endDate < start) endDate = start;

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-drug";
    bar.textContent = d.name || d.drugName || `ยาตัวที่ ${idx + 1}`;
    bar.style.left = dateToLeftPx(start) + "px";
    bar.style.width = calcWidthPx(start, endDate) + "px";
    drugLane.appendChild(bar);
  });

  // ========== วาด ADR ==========
  adrs.forEach((a, idx) => {
    const start = parseDate(a.startDate || a.eventDate || a.symptomDate);
    if (!start) return;

    const rawEnd = a.endDate || a.resolveDate;
    let endDate = rawEnd ? parseDate(rawEnd) : maxDate;

    // ถ้ามีระบุวันหาย → ลด 1 วันไม่ให้ล้ำ
    if (rawEnd && endDate) {
      const adj = addDays(endDate, -1);
      endDate = adj >= start ? adj : start;
    }

    if (!endDate) endDate = maxDate;
    if (endDate > maxDate) endDate = maxDate;
    if (endDate < start) endDate = start;

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-adr";
    bar.textContent = a.symptom || a.name || `ADR ${idx + 1}`;
    bar.style.left = dateToLeftPx(start) + "px";
    bar.style.width = calcWidthPx(start, endDate) + "px";
    adrLane.appendChild(bar);
  });

  // เลื่อนให้เห็นวันล่าสุด
  const sw = document.getElementById("p5TimelineScroll");
  if (sw) {
    sw.scrollLeft = sw.scrollWidth;
  }
}

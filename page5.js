// ===== drawTimeline แบบไม่เลื่อนจอไปขวา และล็อกซ้าย/ขวาให้ตรงช่องวัน =====
function drawTimeline() {
  const dateRow = document.getElementById("p5DateRow");
  const drugLane = document.getElementById("p5DrugLane");
  const adrLane = document.getElementById("p5AdrLane");
  if (!dateRow || !drugLane || !adrLane) return;

  // สำคัญ: ให้ลูกที่เป็นแทบวางแบบ absolute ได้
  drugLane.style.position = "relative";
  adrLane.style.position = "relative";

  const root = window.drugAllergyData || {};
  const page5 = root.page5 || { drugLines: [], adrLines: [] };
  const drugs = Array.isArray(page5.drugLines) ? page5.drugLines : [];
  const adrs = Array.isArray(page5.adrLines) ? page5.adrLines : [];

  if (!drugs.length && !adrs.length) {
    dateRow.innerHTML = "";
    drugLane.innerHTML = "";
    adrLane.innerHTML = "";
    return;
  }

  const MS_DAY = 24 * 60 * 60 * 1000;
  const DAY_W = 120; // ความกว้าง 1 วัน

  // รองรับ 3 แบบ: dd/mm/yyyy, dd-mm-yyyy, yyyy-mm-dd
  function parseDate(str) {
    if (!str) return null;
    const s = String(str).trim();

    // 27/10/2025
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
      const [d, m, y] = s.split("/").map(Number);
      return new Date(y, m - 1, d);
    }
    // 27-10-2025
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(s)) {
      const [d, m, y] = s.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    // 2025-10-27 ← ค่านี้มาจาก input type="date"
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) {
      const [y, m, d] = s.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    return null;
  }

  function addDays(date, n) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // --------------------
  // 1) หา min/max จากข้อมูลจริง
  // --------------------
  let minDate = null;
  let maxDate = today; // ถ้าไม่ระบุวันหยุดให้จบที่วันนี้

  drugs.forEach((d) => {
    const s = parseDate(d.startDate);
    if (s && (!minDate || s < minDate)) minDate = s;

    const e = parseDate(d.stopDate);
    if (e && e > maxDate) maxDate = e;
  });

  adrs.forEach((a) => {
    const s = parseDate(a.startDate);
    if (s && (!minDate || s < minDate)) minDate = s;

    const e = parseDate(a.endDate);
    if (e && e > maxDate) maxDate = e;
  });

  if (!minDate) minDate = today;

  // --------------------
  // 2) วาดหัววันที่
  // --------------------
  const totalDays = Math.floor((maxDate - minDate) / MS_DAY) + 1;
  dateRow.innerHTML = "";

  const labelWidth =
    document.querySelector(".p5-lane-label")?.offsetWidth || 70;
  dateRow.style.paddingLeft = labelWidth + "px";

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

  // --------------------
  // 3) เคลียร์เลน แล้วตั้งความสูงตามจำนวนบรรทัด
  // --------------------
  drugLane.innerHTML = "";
  adrLane.innerHTML = "";

  const DRUG_ROW_H = 36;
  const ADR_ROW_H = 36;
  drugLane.style.height =
    44 + Math.max(0, drugs.length - 1) * DRUG_ROW_H + "px";
  adrLane.style.height = 44 + Math.max(0, adrs.length - 1) * ADR_ROW_H + "px";

  // แปลงวันที่ → ระยะทาง
  function dateToX(date) {
    const diffDay = Math.floor((date - minDate) / MS_DAY);
    return diffDay * DAY_W;
  }

  // กำหนดวันจบ ถ้าไม่มีให้ใช้วันนี้ และห้าม < วันเริ่ม
  function clampEnd(start, rawEnd) {
    if (!rawEnd) return today;
    if (rawEnd < start) return start;
    return rawEnd;
  }

  // --------------------
  // 4) วาด "ยา" ให้คนละบรรทัด
  // --------------------
  drugs.forEach((d, idx) => {
    const start = parseDate(d.startDate);
    if (!start) return;
    const rawEnd = parseDate(d.stopDate);
    const end = clampEnd(start, rawEnd);

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-drug";
    bar.textContent = d.name || `ยาตัวที่ ${idx + 1}`;
    bar.style.position = "absolute";

    // ล็อกซ้ายให้ตรงช่องวัน + label
    const left = dateToX(start) + labelWidth;
    // ล็อกขวาให้จบที่วันสุดท้ายพอดีช่อง
    const dayCount = Math.floor((end - start) / MS_DAY) + 1; // 27→29 = 3 วัน
    let width = dayCount * DAY_W;
    // ลดออกนิดให้ไม่ชนเส้น
    width = width - 12;

    bar.style.left = left + "px";
    bar.style.width = width + "px";
    bar.style.top = 7 + idx * DRUG_ROW_H + "px";

    drugLane.appendChild(bar);
  });

  // --------------------
  // 5) วาด ADR ให้คนละบรรทัด
  // --------------------
  adrs.forEach((a, idx) => {
    const start = parseDate(a.startDate);
    if (!start) return;
    const rawEnd = parseDate(a.endDate);
    const end = clampEnd(start, rawEnd);

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-adr";
    bar.textContent = a.symptom || `ADR ${idx + 1}`;
    bar.style.position = "absolute";

    const left = dateToX(start) + labelWidth;
    const dayCount = Math.floor((end - start) / MS_DAY) + 1;
    let width = dayCount * DAY_W;
    width = width - 12;

    bar.style.left = left + "px";
    bar.style.width = width + "px";
    bar.style.top = 7 + idx * ADR_ROW_H + "px";

    adrLane.appendChild(bar);
  });

  // --------------------
  // 6) ❗อย่าเลื่อนจอไปขวาสุดอีกแล้ว
  // --------------------
  const sc = document.getElementById("p5TimelineScroll");
  if (sc) {
    sc.scrollLeft = 0; // ให้เริ่มเห็นตั้งแต่วันที่แรกสุด
  }
}

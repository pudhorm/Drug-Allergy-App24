// วางแทน drawTimeline เดิมใน page5.js
function drawTimeline() {
  const dateRow = document.getElementById("p5DateRow");   // แถววันที่ด้านบน
  const drugLane = document.getElementById("p5DrugLane"); // ช่องวาดแถบยา
  const adrLane  = document.getElementById("p5AdrLane");  // ช่องวาดแถบ ADR

  if (!dateRow || !drugLane || !adrLane) return;

  // ดึงข้อมูลจากตัวแปรกลาง
  const drugs = (window.drugAllergyData && window.drugAllergyData.timelineDrugs) || [];
  const adrs  = (window.drugAllergyData && window.drugAllergyData.timelineAdrs)  || [];

  // ถ้าไม่มีข้อมูลเลย เคลียร์แล้วจบ
  if (!drugs.length && !adrs.length) {
    dateRow.innerHTML = "";
    drugLane.innerHTML = "";
    adrLane.innerHTML = "";
    return;
  }

  const MS_DAY = 24 * 60 * 60 * 1000;

  // ฟังก์ชันแปลง "dd/mm/yyyy" → Date
  function parseTH(dstr) {
    if (!dstr) return null;
    const [d, m, y] = dstr.split("/").map(Number);
    if (!d || !m || !y) return null;
    return new Date(y, m - 1, d);
  }
  // ช่วยบวก/ลบวัน
  function addDays(d, n) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }

  // วันนี้ (จากเครื่อง) เอาเวลาออก
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // =========================
  // 1) หา min / max ของข้อมูล
  // =========================
  let minDate = null;
  let maxDate = null;

  // รวมยา
  drugs.forEach((d) => {
    const s = parseTH(d.startDate);
    if (s) {
      // ✅ ซ้ายต้องเริ่ม -1 วัน
      const sAdj = addDays(s, -1);
      if (!minDate || sAdj < minDate) minDate = sAdj;
    }
    const e = parseTH(d.stopDate);
    if (e) {
      // ✅ ถ้ามีวันหยุด → ปลายต้องสั้นกว่า 1 วัน
      const eAdj = addDays(e, -1);
      if (!maxDate || eAdj > maxDate) maxDate = eAdj;
    }
  });

  // รวม ADR
  adrs.forEach((a) => {
    const s = parseTH(a.startDate);
    if (s) {
      const sAdj = addDays(s, -1);
      if (!minDate || sAdj < minDate) minDate = sAdj;
    }
    const e = parseTH(a.endDate);
    if (e) {
      const eAdj = addDays(e, -1);
      if (!maxDate || eAdj > maxDate) maxDate = eAdj;
    }
  });

  // ถ้ายังไม่มี minDate เลย ให้เท่ากับวันนี้ -1
  if (!minDate) minDate = addDays(today, -1);

  // max จากข้อมูล (ที่มีวันจบ) อาจจะต่ำกว่าวันนี้
  // แต่ user สั่งว่า "แกน X ต้อง plot ถึงวันที่ปัจจุบัน +1"
  const todayPlus1 = addDays(today, 1);
  if (!maxDate || todayPlus1 > maxDate) {
    maxDate = todayPlus1;          // ✅ แกน X ไปถึงวันนี้ +1 เสมอ
  }

  // ความกว้างของ 1 วันบน timeline
  const DAY_W = 120; // จะให้เลื่อนยาวได้

  // จำนวนวันบนแกน
  const totalDays =
    Math.floor((maxDate.getTime() - minDate.getTime()) / MS_DAY) + 1;

  // =========================
  // 2) วาดแถววันที่ด้านบน
  // =========================
  dateRow.innerHTML = "";
  for (let i = 0; i < totalDays; i++) {
    const d = addDays(minDate, i);
    const cell = document.createElement("div");
    cell.className = "p5-date-cell";
    // แสดงแบบ 1 พ.ย. (หรือจะเปลี่ยนรูปแบบทีหลังได้)
    const thMonth = d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
    });
    cell.textContent = thMonth;
    cell.style.width = DAY_W + "px";
    dateRow.appendChild(cell);
  }

  // เคลียร์เลน
  drugLane.innerHTML = "";
  adrLane.innerHTML = "";

  // helper แปลงวันที่ → offset px จาก minDate
  function dayOffsetPx(d) {
    const diff =
      Math.floor((d.getTime() - minDate.getTime()) / MS_DAY);
    return diff * DAY_W;
  }

  // =========================
  // 3) วาดแถบยา
  // =========================
  drugs.forEach((d, idx) => {
    const s = parseTH(d.startDate);
    if (!s) return;

    // ✅ เริ่ม -1 วันตามที่สั่ง
    const startAdj = addDays(s, -1);

    let endAdj;
    const e = parseTH(d.stopDate);
    if (e) {
      // ✅ ถ้ามีวันหยุด → สั้นกว่าวันนั้น 1 วัน
      endAdj = addDays(e, -1);
    } else {
      // ✅ ongoing → วันนี้ -1
      endAdj = addDays(today, -1);
    }

    // ถ้า endAdj < startAdj ให้บังคับเท่ากัน
    if (endAdj < startAdj) endAdj = startAdj;

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-drug";
    bar.textContent = d.name ? d.name : "Drug " + (idx + 1);

    const left = dayOffsetPx(startAdj);
    const right = dayOffsetPx(endAdj);
    bar.style.left = left + "px";
    bar.style.width = (right - left || DAY_W * 0.4) + "px";

    drugLane.appendChild(bar);
  });

  // =========================
  // 4) วาดแถบ ADR
  // =========================
  adrs.forEach((a, idx) => {
    const s = parseTH(a.startDate);
    if (!s) return;

    // ✅ เริ่ม -1 วัน
    const startAdj = addDays(s, -1);

    let endAdj;
    const e = parseTH(a.endDate);
    if (e) {
      // มีวันหาย → สั้นกว่า 1 วัน
      endAdj = addDays(e, -1);
    } else {
      // ongoing → วันนี้ -1
      endAdj = addDays(today, -1);
    }
    if (endAdj < startAdj) endAdj = startAdj;

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-adr";
    bar.textContent = a.symptom ? a.symptom : "ADR " + (idx + 1);

    const left = dayOffsetPx(startAdj);
    const right = dayOffsetPx(endAdj);
    bar.style.left = left + "px";
    bar.style.width = (right - left || DAY_W * 0.4) + "px";

    adrLane.appendChild(bar);
  });

  // ให้เลนเลื่อนตามความกว้างจริง
  const scrollWrap = document.getElementById("p5TimelineScroll");
  if (scrollWrap) {
    scrollWrap.scrollLeft = 0;
  }
}

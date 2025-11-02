// ====== drawTimeline (เดิม + ขยายความสูง lane) ======
function drawTimeline() {
  const dateRow = document.getElementById("p5DateRow");
  const drugLane = document.getElementById("p5DrugLane");
  const adrLane = document.getElementById("p5AdrLane");
  if (!dateRow || !drugLane || !adrLane) return;

  const root = window.drugAllergyData || {};
  const page5 = root.page5 || { drugLines: [], adrLines: [] };
  const drugs = Array.isArray(page5.drugLines) ? page5.drugLines : [];
  const adrs = Array.isArray(page5.adrLines) ? page5.adrLines : [];

  // ถ้าไม่มีข้อมูลเลยให้เคลียร์
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
    if (pure.includes("-")) {
      const [y, m, d] = pure.split("-").map(Number);
      if (!y || !m || !d) return null;
      return new Date(y, m - 1, d);
    }
    if (pure.includes("/")) {
      const [d, m, y] = pure.split("/").map(Number);
      if (!d || !m || !y) return null;
      return new Date(y, m - 1, d);
    }
    return null;
  }

  // วันนี้แบบตัดเวลา
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // ---------- หา minDate แบบเดิม (อย่าแตะ) ----------
  let minDate = null;
  drugs.forEach((d) => {
    const s = parseDate(d.startDate);
    if (s && (!minDate || s < minDate)) minDate = s;
  });
  adrs.forEach((a) => {
    const s = parseDate(a.startDate);
    if (s && (!minDate || s < minDate)) minDate = s;
  });
  if (!minDate) minDate = today;

  // ปลายสุด = วันนี้ (เหมือนเดิม)
  const maxDate = today;

  const totalDays =
    Math.floor((maxDate.getTime() - minDate.getTime()) / MS_DAY) + 1;

  // ---------- แถววัน ----------
  dateRow.innerHTML = "";
  dateRow.style.display = "grid";
  dateRow.style.gridTemplateColumns = `repeat(${totalDays}, ${DAY_W}px)`;
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(
      minDate.getFullYear(),
      minDate.getMonth(),
      minDate.getDate() + i
    );
    const cell = document.createElement("div");
    cell.className = "p5-date-cell";
    cell.textContent = d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short"
    });
    dateRow.appendChild(cell);
  }

  // ---------- เตรียม lane (จุดที่เพิ่ม) ----------
  // ความสูงต่อแถว (ให้ตรงกับดีไซน์เดิม)
  const ROW_H = 46;

  function prepLane(el, rows) {
    el.innerHTML = "";
    el.style.display = "grid";
    el.style.gridTemplateColumns = `repeat(${totalDays}, ${DAY_W}px)`;
    el.style.gridAutoRows = ROW_H + "px";
    el.style.rowGap = "6px";
    // ★ สำคัญ: ขยายความสูงตามจำนวนแถบจริง
    el.style.height = rows * (ROW_H + 6) + "px";
  }

  const drugRows = Math.max(drugs.length, 1);
  const adrRows = Math.max(adrs.length, 1);

  prepLane(drugLane, drugRows);
  prepLane(adrLane, adrRows);

  // กันไม่ให้ ADR ไปทับเลนบนเลย ให้มีช่องว่างนิดหน่อย
  adrLane.style.marginTop = "10px";

  function dayIndexOf(date) {
    return Math.floor((date.getTime() - minDate.getTime()) / MS_DAY);
  }

  // ---------- วาดยา (เหมือนของที่ถูกต้องรอบที่แล้ว) ----------
  drugs.forEach((d, idx) => {
    const start = parseDate(d.startDate);
    if (!start) return;

    // ถ้ามี stop → ใช้ stop - 1 วัน (ตามที่บอกว่า “ช้าไป 1 วัน”)
    let end;
    if (d.stopDate) {
      const parsedStop = parseDate(d.stopDate);
      if (parsedStop) {
        end = new Date(
          parsedStop.getFullYear(),
          parsedStop.getMonth(),
          parsedStop.getDate() - 1
        );
      } else {
        end = maxDate;
      }
    } else {
      end = maxDate;
    }

    if (end < start) end = start;
    if (end > maxDate) end = maxDate;

    const startIdx = dayIndexOf(start);
    const endIdx = dayIndexOf(end);

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-drug";
    bar.textContent = d.name || `ยาตัวที่ ${idx + 1}`;

    bar.style.position = "relative";
    bar.style.left = "0";
    bar.style.width = "100%";

    // แยกแต่ละตัวเป็นคนละแถว
    bar.style.gridColumn = `${startIdx + 1} / ${endIdx + 2}`;
    bar.style.gridRow = `${idx + 1}`;

    drugLane.appendChild(bar);
  });

  // ---------- วาด ADR (ให้ไม่ซ้อน + หลายแถวได้) ----------
  adrs.forEach((a, idx) => {
    const start = parseDate(a.startDate);
    if (!start) return;

    let end;
    if (a.endDate) {
      const parsedEnd = parseDate(a.endDate);
      if (parsedEnd) {
        end = new Date(
          parsedEnd.getFullYear(),
          parsedEnd.getMonth(),
          parsedEnd.getDate() - 1
        );
      } else {
        end = maxDate;
      }
    } else {
      end = maxDate;
    }

    if (end < start) end = start;
    if (end > maxDate) end = maxDate;

    const startIdx = dayIndexOf(start);
    const endIdx = dayIndexOf(end);

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-adr";
    bar.textContent = a.symptom || `ADR ${idx + 1}`;

    bar.style.position = "relative";
    bar.style.left = "0";
    bar.style.width = "100%";

    // แต่ละ ADR ตัวละแถวใต้ lane ของ ADR
    bar.style.gridColumn = `${startIdx + 1} / ${endIdx + 2}`;
    bar.style.gridRow = `${idx + 1}`;

    adrLane.appendChild(bar);
  });

  // ---------- เลื่อนให้เห็นวันท้าย ----------
  const sc = document.getElementById("p5TimelineScroll");
  if (sc) sc.scrollLeft = sc.scrollWidth;
}

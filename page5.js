// ====== drawTimeline (ล็อกซ้ายไว้เหมือนเดิม ลดขวาเฉพาะที่กรอก stop) ======
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
    // รูปแบบ yyyy-mm-dd (input type="date")
    if (pure.includes("-")) {
      const [y, m, d] = pure.split("-").map(Number);
      if (!y || !m || !d) return null;
      return new Date(y, m - 1, d);
    }
    // รูปแบบ dd/mm/yyyy
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

  // หา min-date จากทุกอย่าง (เหมือนเดิม ไม่แตะ)
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

  // ---------- เตรียม lane ----------
  function prepLane(el) {
    el.innerHTML = "";
    el.style.display = "grid";
    el.style.gridTemplateColumns = `repeat(${totalDays}, ${DAY_W}px)`;
    el.style.gridAutoRows = "44px";
    el.style.rowGap = "6px";
  }
  prepLane(drugLane);
  prepLane(adrLane);

  function dayIndexOf(date) {
    return Math.floor((date.getTime() - minDate.getTime()) / MS_DAY);
  }

  // ---------- วาดยา ----------
  drugs.forEach((d, idx) => {
    const start = parseDate(d.startDate);
    if (!start) return;

    // ===== จุดที่แก้: ถ้าผู้ใช้กรอก stopDate → หด 1 วัน =====
    let end;
    if (d.stopDate) {
      const parsedStop = parseDate(d.stopDate);
      if (parsedStop) {
        // หดออก 1 วันให้ตรงวันในหัวตาราง
        end = new Date(
          parsedStop.getFullYear(),
          parsedStop.getMonth(),
          parsedStop.getDate() - 1
        );
      } else {
        end = maxDate;
      }
    } else {
      // ไม่กรอก → จบวันนี้
      end = maxDate;
    }
    // กันทุกเคส
    if (end < start) end = start;
    if (end > maxDate) end = maxDate;

    const startIdx = dayIndexOf(start);
    const endIdx = dayIndexOf(end);

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-drug";
    bar.textContent = d.name || `ยาตัวที่ ${idx + 1}`;

    // ไม่แตะ logic จุดเริ่ม
    bar.style.position = "relative";
    bar.style.left = "0";
    bar.style.width = "100%";

    // ครอบตั้งแต่ startIdx → endIdx แบบ inclusive
    bar.style.gridColumn = `${startIdx + 1} / ${endIdx + 2}`;
    bar.style.gridRow = `${idx + 1}`;

    drugLane.appendChild(bar);
  });

  // ---------- วาด ADR ----------
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

    bar.style.gridColumn = `${startIdx + 1} / ${endIdx + 2}`;
    bar.style.gridRow = `${idx + 1}`;

    adrLane.appendChild(bar);
  });

  const sc = document.getElementById("p5TimelineScroll");
  if (sc) sc.scrollLeft = sc.scrollWidth;
}

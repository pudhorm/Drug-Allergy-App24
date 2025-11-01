function buildTimeline() {
  const axis = document.getElementById("p5_tlAxis");
  const canvas = document.getElementById("p5_tlCanvas");
  if (!axis || !canvas) return;

  const { drugs, adrs } = window.drugAllergyData.timeline;

  // มีตัวจริงไหม (ไม่เอาแถวว่าง)
  const realDrugs = (drugs || []).filter(
    (d) => d.name || d.startDate || d.endDate
  );
  const realAdrs = (adrs || []).filter(
    (a) => a.name || a.startDate || a.endDate
  );

  // 1) หา min / max date
  let minDate = null;
  let maxDate = null;

  const todayTH = (function () {
    const now = new Date();
    const th = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
    th.setHours(0, 0, 0, 0);
    return th;
  })();

  function p_date(str) {
    if (!str) return null;
    const d = new Date(str);
    if (isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // ดูจากยา
  realDrugs.forEach((d) => {
    const s = p_date(d.startDate);
    const e = p_date(d.endDate);
    if (s) {
      if (!minDate || s < minDate) minDate = s;
    }
    if (e) {
      if (!maxDate || e > maxDate) maxDate = e;
    }
  });
  // ดูจาก ADR
  realAdrs.forEach((a) => {
    const s = p_date(a.startDate);
    const e = p_date(a.endDate);
    if (s) {
      if (!minDate || s < minDate) minDate = s;
    }
    if (e) {
      if (!maxDate || e > maxDate) maxDate = e;
    }
  });

  // ถ้าไม่มีอะไรเลย → วันนี้
  if (!minDate) minDate = new Date(todayTH);
  // max ต้องอย่างน้อยวันนี้
  if (!maxDate || maxDate < todayTH) maxDate = new Date(todayTH);

  // 2) วาดแกน X จาก min → max
  const DAY_MS = 24 * 60 * 60 * 1000;
  const DAY_W = 120; // 1 วัน = 120px

  function diffDays(a, b) {
    const aa = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    const bb = new Date(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((bb - aa) / DAY_MS);
  }

  const totalDays = diffDays(minDate, maxDate) + 1;
  const totalWidth = totalDays * DAY_W + 40;

  axis.innerHTML = "";
  axis.style.width = totalWidth + "px";

  const thMonth = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(minDate.getTime() + i * DAY_MS);
    const tick = document.createElement("div");
    tick.className = "tl-tick";
    tick.style.left = i * DAY_W + 20 + "px";
    tick.textContent = `${d.getDate()} ${thMonth[d.getMonth()]}`;
    axis.appendChild(tick);
  }

  // 3) วาดแถว (เฉพาะที่มีข้อมูลจริง)
  canvas.innerHTML = "";
  canvas.style.width = totalWidth + "px";

  let rowIndex = 0;

  // --- วาดยา ---
  realDrugs.forEach((d) => {
    const row = document.createElement("div");
    row.className = "tl-row";
    row.style.top = rowIndex * 62 + "px";

    const yLabel = document.createElement("div");
    yLabel.className = "tl-ylabel";
    yLabel.textContent = "ยา: " + (d.name || "");

    const track = document.createElement("div");
    track.className = "tl-track";

    row.appendChild(yLabel);
    row.appendChild(track);
    canvas.appendChild(row);

    if (d.startDate) {
      const start = p_date(d.startDate);
      let end = d.endDate ? p_date(d.endDate) : null;
      if (!end) end = new Date(todayTH);          // 👉 ไม่ระบุ = วันนี้
      if (end > maxDate) end = new Date(maxDate); // กันล้น

      const startOffset = diffDays(minDate, start);
      const left = startOffset * DAY_W + 20;

      const dur = diffDays(start, end);           // 👉 ไม่ +1 แล้ว
      const widthPx = Math.max(dur * DAY_W, 70);  // 👉 1 วัน = 70 ขั้นต่ำ

      const bar = document.createElement("div");
      bar.className = "tl-bar drug";
      bar.style.left = left + "px";
      bar.style.width = widthPx + "px";
      bar.textContent = (d.name || "") + " (" + d.startDate + ")";
      track.appendChild(bar);
    }

    rowIndex++;
  });

  // --- วาด ADR ---
  realAdrs.forEach((a) => {
    const row = document.createElement("div");
    row.className = "tl-row";
    row.style.top = rowIndex * 62 + "px";

    const yLabel = document.createElement("div");
    yLabel.className = "tl-ylabel tl-ylabel-adr";
    yLabel.textContent = "ADR: " + (a.name || "");

    const track = document.createElement("div");
    track.className = "tl-track";

    row.appendChild(yLabel);
    row.appendChild(track);
    canvas.appendChild(row);

    if (a.startDate) {
      const start = p_date(a.startDate);
      let end = a.endDate ? p_date(a.endDate) : null;
      if (!end) end = new Date(todayTH);          // 👉 ถ้าไม่ระบุให้ยาวถึงวันนี้
      if (end > maxDate) end = new Date(maxDate); // กันล้น

      const startOffset = diffDays(minDate, start);
      const left = startOffset * DAY_W + 20;

      const dur = diffDays(start, end);           // 👉 ไม่ +1
      const widthPx = Math.max(dur * DAY_W, 70);

      const bar = document.createElement("div");
      bar.className = "tl-bar adr";
      bar.style.left = left + "px";
      bar.style.width = widthPx + "px";
      bar.textContent = (a.name || "") + " (" + a.startDate + ")";
      track.appendChild(bar);
    }

    rowIndex++;
  });

  // ปรับความสูง canvas ตามจำนวนแถว
  canvas.style.minHeight = rowIndex * 62 + 60 + "px";
}

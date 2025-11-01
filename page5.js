// วางแทนของเดิมใน page5.js
function buildTimeline() {
  const axis = document.getElementById("p5_tlAxis");
  const canvas = document.getElementById("p5_tlCanvas");
  if (!axis || !canvas) return;

  const tl = window.drugAllergyData.timeline || { drugs: [], adrs: [] };
  const drugs = tl.drugs || [];
  const adrs  = tl.adrs  || [];

  // 1) ฟังก์ชันแปลงวันที่แบบ "ไม่ลบ 1 วัน"
  function parseLocalDate(str) {
    if (!str) return null;
    // input type="date" -> "2025-11-24"
    const parts = str.split("-");
    if (parts.length !== 3) return null;
    const y = Number(parts[0]);
    const m = Number(parts[1]) - 1; // 0-11
    const d = Number(parts[2]);
    return new Date(y, m, d, 0, 0, 0, 0); // local time
  }

  // 2) วันที่วันนี้ของไทย (จะใช้เฉพาะกรณีไม่กรอกวันหยุด/วันหาย)
  const nowTH = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" })
  );
  nowTH.setHours(0, 0, 0, 0);

  // 3) หา min / max จากข้อมูล “จริง” เท่านั้น
  let minDate = null;
  let maxDate = new Date(nowTH); // อย่างน้อยต้องลากถึงวันนี้

  function consider(dt) {
    if (!dt) return;
    if (!minDate || dt < minDate) minDate = dt;
    if (dt > maxDate) maxDate = dt;
  }

  // ยา
  drugs.forEach((d) => {
    const s = parseLocalDate(d.startDate);
    consider(s);

    // ถ้ามีหยุดยา → ใช้หยุดยาตัวนั้นเลย (ห้ามไปต่อถึงวันนี้)
    if (d.endDate) {
      const e = parseLocalDate(d.endDate);
      consider(e);
    } else {
      // ไม่มีวันหยุด → อย่างน้อยต้องลากถึงวันนี้
      consider(nowTH);
    }
  });

  // ADR
  adrs.forEach((a) => {
    const s = parseLocalDate(a.startDate);
    consider(s);

    if (a.endDate) {
      const e = parseLocalDate(a.endDate);
      consider(e);
    } else {
      consider(nowTH);
    }
  });

  // ถ้าไม่มีอะไรเลย ให้ใช้วันนี้ทั้งคู่
  if (!minDate) minDate = new Date(nowTH);

  // 4) คำนวณแกน
  const DAY_MS = 24 * 60 * 60 * 1000;
  const DAY_W  = 120; // px ต่อ 1 วัน

  function dayDiff(a, b) {
    const aa = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    const bb = new Date(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.floor((bb - aa) / DAY_MS); // ไม่ round เพื่อไม่ให้เพี้ยน 1 วัน
  }

  const totalDays  = dayDiff(minDate, maxDate) + 1; // inclusive
  const totalWidth = totalDays * DAY_W + 40;

  // 5) วาดแกน X
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

  // 6) วาดแถบ
  canvas.innerHTML = "";
  canvas.style.width = totalWidth + "px";

  let row = 0;

  // ----- วาดยา -----
  drugs.forEach((d) => {
    if (!d.startDate) return;
    const s = parseLocalDate(d.startDate);
    let e;
    const hasEnd = !!d.endDate;

    if (hasEnd) {
      // มีวันหยุด → จบตรงนั้นเป๊ะ ไม่ไปวันนี้
      e = parseLocalDate(d.endDate);
    } else {
      // ไม่มีวันหยุด → ยาวถึงวันนี้
      e = new Date(nowTH);
    }

    const startIdx = dayDiff(minDate, s);
    const endIdx   = dayDiff(minDate, e);

    const barLeft  = startIdx * DAY_W + 20;
    const barWidth = Math.max((endIdx - startIdx + 1) * DAY_W, 70);

    const line  = document.createElement("div");
    line.className = "tl-row";
    line.style.top = row * 60 + "px";

    const label = document.createElement("div");
    label.className = "tl-ylabel";
    label.textContent = "ยา: " + (d.name || "");

    const track = document.createElement("div");
    track.className = "tl-track";

    const bar = document.createElement("div");
    bar.className = "tl-bar drug";
    bar.style.left  = barLeft + "px";
    bar.style.width = barWidth + "px";
    bar.textContent = (d.name || "") + " (" + d.startDate + ")";

    track.appendChild(bar);
    line.appendChild(label);
    line.appendChild(track);
    canvas.appendChild(line);

    row++;
  });

  // ----- วาด ADR -----
  adrs.forEach((a) => {
    if (!a.startDate) return;
    const s = parseLocalDate(a.startDate);
    let e;
    const hasEnd = !!a.endDate;

    if (hasEnd) {
      e = parseLocalDate(a.endDate);     // จบจริง
    } else {
      e = new Date(nowTH);               // ไม่ใส่ → ยาวถึงวันนี้
    }

    const startIdx = dayDiff(minDate, s);
    const endIdx   = dayDiff(minDate, e);

    const barLeft  = startIdx * DAY_W + 20;
    const barWidth = Math.max((endIdx - startIdx + 1) * DAY_W, 70);

    const line  = document.createElement("div");
    line.className = "tl-row";
    line.style.top = row * 60 + "px";

    const label = document.createElement("div");
    label.className = "tl-ylabel tl-ylabel-adr";
    label.textContent = "ADR: " + (a.name || "");

    const track = document.createElement("div");
    track.className = "tl-track";

    const bar = document.createElement("div");
    bar.className = "tl-bar adr";
    bar.style.left  = barLeft + "px";
    bar.style.width = barWidth + "px";
    bar.textContent = (a.name || "") + " (" + a.startDate + ")";

    track.appendChild(bar);
    line.appendChild(label);
    line.appendChild(track);
    canvas.appendChild(line);

    row++;
  });

  // ความสูงรวม
  canvas.style.minHeight = row * 60 + 70 + "px";
}

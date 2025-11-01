function buildTimeline() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // เอาเวลาออก เหลือแค่วัน

  // ----- ดึงข้อมูลฟอร์ม -----
  const drugs = [];
  document.querySelectorAll("#tl-drug-list .tl-card").forEach((card) => {
    const name = card.querySelector(".tl-drug-name").value.trim() || "ยา";
    const startVal = card.querySelector(".tl-drug-start").value;
    const endVal = card.querySelector(".tl-drug-end").value;
    if (!startVal) return;

    const start = new Date(startVal);
    start.setHours(0, 0, 0, 0);

    let end;
    if (endVal) {
      end = new Date(endVal);
      end.setHours(0, 0, 0, 0);
    } else {
      // ไม่ใส่วันจบ → ยาวถึงวันนี้
      end = new Date(today.getTime());
    }

    if (end < start) end = new Date(start.getTime());

    drugs.push({ name, start, end });
  });

  const adrs = [];
  document.querySelectorAll("#tl-adr-list .tl-card").forEach((card) => {
    const name = card.querySelector(".tl-adr-name").value.trim() || "ADR";
    const startVal = card.querySelector(".tl-adr-start").value;
    const endVal = card.querySelector(".tl-adr-end").value;
    if (!startVal) return;

    const start = new Date(startVal);
    start.setHours(0, 0, 0, 0);

    let end;
    if (endVal) {
      end = new Date(endVal);
      end.setHours(0, 0, 0, 0);
    } else {
      end = new Date(today.getTime());
    }

    if (end < start) end = new Date(start.getTime());

    adrs.push({ name, start, end });
  });

  // ไม่มีข้อมูลเลย → ซ่อน
  const scroll = document.getElementById("tl-scroll");
  if (drugs.length === 0 && adrs.length === 0) {
    scroll.classList.add("hidden");
    return;
  }

  // ----- คำนวณกรอบวันที่บนแกน X -----
  let axisStart = null;
  let axisEnd = new Date(today.getTime());

  [...drugs, ...adrs].forEach((item) => {
    if (!axisStart || item.start < axisStart) axisStart = item.start;
    if (item.end > axisEnd) axisEnd = item.end;
  });

  axisStart.setHours(0, 0, 0, 0);
  axisEnd.setHours(0, 0, 0, 0);

  // จำนวนวันทั้งหมด (รวมวันสุดท้ายด้วย)
  const totalDays = Math.round((axisEnd - axisStart) / (24 * 60 * 60 * 1000));

  const ticks = document.getElementById("tl-ticks");
  const canvas = document.getElementById("tl-canvas");

  ticks.innerHTML = "";
  canvas.innerHTML = "";

  const totalWidth = (totalDays + 1) * DAY_WIDTH + 140;
  ticks.style.width = totalWidth + "px";
  canvas.style.width = totalWidth + "px";

  // ----- วาดวันที่บนแกน X (เริ่มตรงวันแรกเป๊ะ) -----
  for (let i = 0; i <= totalDays; i++) {
    const d = new Date(axisStart.getTime() + i * DAY_MS);
    const label = d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
    });
    const div = document.createElement("div");
    div.className = "tl-tick";
    div.style.left = 120 + i * DAY_WIDTH + "px";
    div.textContent = label;
    ticks.appendChild(div);
  }

  // ----- เตรียมแคนวาส -----
  const wrap = document.createElement("div");
  wrap.style.position = "relative";
  wrap.style.minHeight = "120px";

  // แถว "ยา"
  const drugRow = document.createElement("div");
  drugRow.className = "tl-row";
  drugRow.style.gridTemplateColumns = "110px 1fr";
  drugRow.innerHTML = `
    <div class="tl-ylabel" style="color:#0f766e; font-weight:700;">ยา:</div>
    <div class="tl-track" style="position:relative; height:50px; padding-left:120px;"></div>
  `;
  wrap.appendChild(drugRow);

  // แถว "ADR"
  const adrRow = document.createElement("div");
  adrRow.className = "tl-row";
  adrRow.style.gridTemplateColumns = "110px 1fr";
  adrRow.innerHTML = `
    <div class="tl-ylabel" style="color:#b91c1c; font-weight:700;">ADR:</div>
    <div class="tl-track" style="position:relative; height:50px; padding-left:120px;"></div>
  `;
  wrap.appendChild(adrRow);

  const drugTrack = drugRow.querySelector(".tl-track");
  const adrTrack = adrRow.querySelector(".tl-track");

  // ----- วาดแถบยา -----
  drugs.forEach((d) => {
    const startOffset = Math.round((d.start - axisStart) / DAY_MS); // 0 = วันแรก
    const endOffset = Math.round((d.end - axisStart) / DAY_MS);
    const spanDays = endOffset - startOffset + 1; // รวมวันตัวเอง

    const bar = document.createElement("div");
    bar.className = "tl-bar drug";
    // ตอนนี้ไม่บวก 120 แล้ว เพราะเรา padding-left ที่ track แล้ว
    bar.style.left = startOffset * DAY_WIDTH + "px";
    bar.style.width = spanDays * DAY_WIDTH - 12 + "px";
    bar.textContent = `${d.name} (${toISO(d.start)})`;
    drugTrack.appendChild(bar);
  });

  // ----- วาดแถบ ADR -----
  adrs.forEach((a) => {
    const startOffset = Math.round((a.start - axisStart) / DAY_MS);
    const endOffset = Math.round((a.end - axisStart) / DAY_MS);
    const spanDays = endOffset - startOffset + 1;

    const bar = document.createElement("div");
    bar.className = "tl-bar adr";
    bar.style.left = startOffset * DAY_WIDTH + "px";
    bar.style.width = spanDays * DAY_WIDTH - 12 + "px";
    bar.textContent = `${a.name} (${toISO(a.start)})`;
    adrTrack.appendChild(bar);
  });

  canvas.appendChild(wrap);
  scroll.classList.remove("hidden");
}

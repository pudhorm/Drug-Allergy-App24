// page5.js
(function () {
  // helper: แปลง yyyy-mm-dd -> Date
  function parseDateFromInput(el) {
    if (!el) return null;
    const v = el.value;
    if (!v) return null;
    // ค่าที่ได้จาก <input type="date"> จะเป็น yyyy-mm-dd เสมอ
    const parts = v.split("-");
    if (parts.length !== 3) return null;
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  // helper: ทำให้เป็นเที่ยงคืนกันหมด
  function normalize(d) {
    const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return dd;
  }

  // helper: วันไทยสั้นๆ
  const TH_MONTH = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];
  function formatThai(d) {
    return d.getDate() + " " + TH_MONTH[d.getMonth()];
  }

  function renderPage5() {
    const host = document.getElementById("page5");
    if (!host) return;
    host.innerHTML = `
      <div class="p5-wrapper card">
        <div class="p5-glitter-layer"></div>

        <!-- 1) ส่วนยา -->
        <section class="tl-section tl-bg-soft" aria-label="ข้อมูลยา">
          <div class="tl-head">
            <h2 class="tl-title">ยา</h2>
            <button type="button" class="btn-green-solid" id="tl-add-drug">+ เพิ่มยาตัวใหม่</button>
          </div>
          <div id="tl-drug-list"></div>
        </section>

        <!-- 2) ส่วน ADR -->
        <section class="tl-section tl-bg-soft-red" aria-label="ข้อมูล ADR">
          <div class="tl-head">
            <h2 class="tl-title">ADR (Adverse Drug Reaction)</h2>
            <button type="button" class="btn-red-solid" id="tl-add-adr">+ เพิ่ม ADR</button>
          </div>
          <div id="tl-adr-list"></div>

          <div class="tl-actions-under-adr">
            <button type="button" class="btn-blue-solid" id="tl-build">▶ สร้าง Timeline</button>
          </div>
        </section>

        <!-- 3) ส่วนแสดงผล timeline -->
        <section class="tl-section" aria-label="แผนภูมิ timeline">
          <h2 class="tl-title">Visual Timeline</h2>
          <div id="tl-scroll" class="tl-scroll hidden">
            <div id="tl-ticks" class="tl-ticks"></div>
            <div id="tl-canvas" class="tl-canvas"></div>
          </div>
        </section>

        <!-- 4) ปุ่มท้ายหน้า -->
        <div class="tl-bottom-actions">
          <button type="button" id="tl-print" class="btn-green-solid">🖨️ Print / PDF</button>
          <button type="button" id="tl-next" class="btn-purple-solid">บันทึกข้อมูลและไปหน้า 6</button>
          <button type="button" id="tl-clear" class="btn-red-solid">🗑️ ล้างข้อมูลหน้านี้</button>
        </div>
      </div>
    `;

    const drugList = host.querySelector("#tl-drug-list");
    const adrList = host.querySelector("#tl-adr-list");
    const btnAddDrug = host.querySelector("#tl-add-drug");
    const btnAddAdr = host.querySelector("#tl-add-adr");
    const btnBuild = host.querySelector("#tl-build");
    const btnClear = host.querySelector("#tl-clear");
    const btnPrint = host.querySelector("#tl-print");

    // ให้มี 1 รายการเริ่มต้น
    addDrugRow(drugList);
    addAdrRow(adrList);

    btnAddDrug.addEventListener("click", () => addDrugRow(drugList));
    btnAddAdr.addEventListener("click", () => addAdrRow(adrList));

    btnBuild.addEventListener("click", () => {
      buildTimeline(host);
    });

    btnClear.addEventListener("click", () => {
      drugList.innerHTML = "";
      adrList.innerHTML = "";
      addDrugRow(drugList);
      addAdrRow(adrList);
      const scroll = host.querySelector("#tl-scroll");
      scroll.classList.add("hidden");
      scroll.querySelector("#tl-ticks").innerHTML = "";
      scroll.querySelector("#tl-canvas").innerHTML = "";
    });

    btnPrint.addEventListener("click", () => {
      // ปริ้นเฉพาะหน้า 5
      window.print();
    });
  }

  function addDrugRow(container) {
    const wrap = document.createElement("div");
    wrap.className = "tl-card";
    wrap.innerHTML = `
      <label class="tl-label">ชื่อยา
        <input type="text" class="tl-input" data-role="drug-name" placeholder="ระบุชื่อยา" />
      </label>
      <div class="tl-grid2">
        <div>
          <label>เริ่มให้ยา</label>
          <div class="tl-inline">
            <input type="date" class="tl-input" data-role="drug-start-date" placeholder="วว/ดด/ปปปป" />
            <input type="time" class="tl-input" data-role="drug-start-time" />
          </div>
        </div>
        <div>
          <label>หยุดยา</label>
          <div class="tl-inline">
            <input type="date" class="tl-input" data-role="drug-stop-date" placeholder="วว/ดด/ปปปป" />
            <input type="time" class="tl-input" data-role="drug-stop-time" />
          </div>
        </div>
      </div>
      <button type="button" class="tl-del">ลบ</button>
    `;
    wrap.querySelector(".tl-del").addEventListener("click", () => {
      container.removeChild(wrap);
    });
    container.appendChild(wrap);
  }

  function addAdrRow(container) {
    const wrap = document.createElement("div");
    wrap.className = "tl-card";
    wrap.innerHTML = `
      <label class="tl-label">อาการ
        <input type="text" class="tl-input" data-role="adr-name" placeholder="ระบุอาการ เช่น ผื่น, คัน, บวม" />
      </label>
      <div class="tl-grid2">
        <div>
          <label>วันที่เกิด</label>
          <div class="tl-inline">
            <input type="date" class="tl-input" data-role="adr-start-date" placeholder="วว/ดด/ปปปป" />
            <input type="time" class="tl-input" data-role="adr-start-time" />
          </div>
        </div>
        <div>
          <label>วันที่หาย</label>
          <div class="tl-inline">
            <input type="date" class="tl-input" data-role="adr-end-date" placeholder="วว/ดด/ปปปป" />
            <input type="time" class="tl-input" data-role="adr-end-time" />
          </div>
        </div>
      </div>
      <button type="button" class="tl-del">ลบ</button>
    `;
    wrap.querySelector(".tl-del").addEventListener("click", () => {
      container.removeChild(wrap);
    });
    container.appendChild(wrap);
  }

  // สร้าง timeline จริง
  function buildTimeline(root) {
    const drugCards = Array.from(root.querySelectorAll("#tl-drug-list .tl-card"));
    const adrCards = Array.from(root.querySelectorAll("#tl-adr-list .tl-card"));

    const items = [];
    const today = new Date();
    const todayNorm = normalize(today);

    // เก็บจากยา
    drugCards.forEach((card, idx) => {
      const name = card.querySelector("[data-role='drug-name']").value.trim();
      const sDateEl = card.querySelector("[data-role='drug-start-date']");
      const eDateEl = card.querySelector("[data-role='drug-stop-date']");
      const s = parseDateFromInput(sDateEl);
      const e = parseDateFromInput(eDateEl);

      if (!name || !s) {
        // ถ้ายังไม่ระบุชื่อหรือวันเริ่ม ไม่ต้องวาด
        return;
      }

      const start = normalize(s);
      // ถ้ามีวันหยุด → ใช้วันหยุด, ถ้าไม่มี → วันนี้
      let end = e ? normalize(e) : todayNorm;
      // ถ้าดันกรอกวันหยุดก่อนวันเริ่ม ให้เท่ากับวันเริ่ม
      if (end < start) end = start;

      items.push({
        kind: "drug",
        label: "ยา: " + name,
        name: name,
        start,
        end,
      });
    });

    // เก็บจาก ADR
    adrCards.forEach((card, idx) => {
      const name = card.querySelector("[data-role='adr-name']").value.trim();
      const sDateEl = card.querySelector("[data-role='adr-start-date']");
      if (!name && !sDateEl.value) return; // ยังไม่กรอกเลย ข้าม

      const s = parseDateFromInput(sDateEl);
      const e = parseDateFromInput(card.querySelector("[data-role='adr-end-date']"));

      if (!s) return; // ไม่มีวันเริ่มก็ไม่รู้จะวาดจากไหน

      const start = normalize(s);
      let end = e ? normalize(e) : todayNorm;
      if (end < start) end = start;

      items.push({
        kind: "adr",
        label: "ADR: " + name,
        name: name,
        start,
        end,
      });
    });

    // ถ้าไม่มีอะไรเลย ไม่ต้องโชว์
    const scroll = root.querySelector("#tl-scroll");
    if (!items.length) {
      scroll.classList.add("hidden");
      scroll.querySelector("#tl-ticks").innerHTML = "";
      scroll.querySelector("#tl-canvas").innerHTML = "";
      return;
    }

    // คำนวณช่วงเวลา
    let minDate = items[0].start;
    let maxDate = items[0].end;
    items.forEach((it) => {
      if (it.start < minDate) minDate = it.start;
      if (it.end > maxDate) maxDate = it.end;
    });
    // ต้อง plot ถึงวันนี้เสมอ
    if (todayNorm > maxDate) {
      maxDate = todayNorm;
    }

    // วันทั้งหมด
    const days = [];
    let cur = new Date(minDate.getTime());
    while (cur <= maxDate) {
      days.push(new Date(cur.getTime()));
      cur.setDate(cur.getDate() + 1);
    }

    // วาดแกน X
    const ticksBox = scroll.querySelector("#tl-ticks");
    ticksBox.innerHTML = "";
    const pxPerDay = 112; // ยืดหน่อยเพื่อให้เห็นหัว/ท้าย
    const totalWidth = days.length * pxPerDay + 180; // + เผื่อ Y label

    ticksBox.style.position = "relative";
    ticksBox.style.height = "28px";
    ticksBox.style.minWidth = totalWidth + "px";

    days.forEach((d, i) => {
      const span = document.createElement("div");
      span.className = "tl-tick";
      span.textContent = formatThai(d);
      span.style.left = (180 + i * pxPerDay) + "px";
      ticksBox.appendChild(span);
    });

    // วาดแถบ
    const canvas = scroll.querySelector("#tl-canvas");
    canvas.innerHTML = "";
    canvas.style.position = "relative";
    canvas.style.minWidth = totalWidth + "px";

    items.forEach((it, idx) => {
      const row = document.createElement("div");
      row.className = "tl-row";
      row.style.top = idx * 58 + "px"; // ระยะห่างระหว่างแถว
      row.style.position = "relative";

      const yLabel = document.createElement("div");
      yLabel.className = "tl-ylabel";
      yLabel.textContent = it.label;
      row.appendChild(yLabel);

      const track = document.createElement("div");
      track.className = "tl-track";
      row.appendChild(track);

      // แปลงวันที่ → index
      const startIndex = Math.floor((it.start - minDate) / (1000 * 60 * 60 * 24));
      const endIndex = Math.floor((it.end - minDate) / (1000 * 60 * 60 * 24));

      const bar = document.createElement("div");
      bar.className = "tl-bar " + (it.kind === "adr" ? "adr" : "drug");
      bar.textContent = (it.name ? it.name : (it.kind === "adr" ? "ADR" : "ยา")) +
        " (" + it.start.toISOString().slice(0, 10) + ")";
      bar.style.left = (180 + startIndex * pxPerDay) + "px";
      // +1 วัน เพื่อให้จบที่วันนั้นพอดี
      const barWidth = Math.max(1, (endIndex - startIndex + 1)) * pxPerDay - 22;
      bar.style.width = barWidth + "px";

      track.appendChild(bar);
      canvas.appendChild(row);
    });

    // สูงเท่าจำนวน items
    canvas.style.height = items.length * 58 + "px";

    // โชว์
    scroll.classList.remove("hidden");
  }

  // expose
  window.renderPage5 = renderPage5;
})();

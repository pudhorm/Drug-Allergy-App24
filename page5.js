// page5.js
(function () {
  // ค่าคงที่เอาไว้คำนวณตำแหน่ง
  const DAY_MS = 24 * 60 * 60 * 1000;
  const DAY_WIDTH = 110; // ความกว้างต่อ 1 วัน (แกน X)

  // ฟังก์ชันแปลง Date -> 2025-11-01
  function toISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
  }

  // ฟังก์ชันอ่านค่า <input type=date>
  function readDateInput(inputEl) {
    const v = inputEl.value;
    if (!v) return null;
    // input type=date จะให้รูป yyyy-mm-dd เสมอแม้ UI เป็นไทย
    const d = new Date(v);
    if (isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // อัปเดตวันที่/เวลาปัจจุบัน (ไทย)
  function startClock() {
    const el = document.getElementById("tl-now");
    if (!el) return;
    function tick() {
      const now = new Date();
      // บังคับเป็นโซนไทย
      const optDate = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Bangkok",
      };
      el.textContent = new Intl.DateTimeFormat("th-TH", optDate).format(now);
    }
    tick();
    setInterval(tick, 1000);
  }

  // ====== ตัวหลัก สร้าง timeline ======
  function buildTimeline() {
    const scroll = document.getElementById("tl-scroll");
    const ticks = document.getElementById("tl-ticks");
    const canvas = document.getElementById("tl-canvas");

    if (!scroll || !ticks || !canvas) return;

    // วันนี้ (ไทย) ตัดเวลาออก
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // -------- 1) ดึงฟอร์ม "ยา" --------
    const drugCards = document.querySelectorAll("#tl-drug-list .tl-card");
    const drugs = [];
    drugCards.forEach((card) => {
      const name = card.querySelector(".tl-drug-name").value.trim() || "ยา";
      const startInput = card.querySelector(".tl-drug-start");
      const endInput = card.querySelector(".tl-drug-end");

      const startDate = readDateInput(startInput);
      if (!startDate) return; // ยังไม่ใส่วันเริ่ม -> ข้าม

      let endDate = readDateInput(endInput);
      if (!endDate) {
        // ไม่ใส่วันหยุด -> ongoing ถึงวันนี้
        endDate = new Date(today.getTime());
      }

      // ถ้าใส่วันจบน้อยกว่าวันเริ่ม ให้เท่ากับวันเริ่ม (กันแถบติดลบ)
      if (endDate < startDate) {
        endDate = new Date(startDate.getTime());
      }

      drugs.push({
        name,
        start: startDate,
        end: endDate,
      });
    });

    // -------- 2) ดึงฟอร์ม "ADR" --------
    const adrCards = document.querySelectorAll("#tl-adr-list .tl-card");
    const adrs = [];
    adrCards.forEach((card) => {
      const name = card.querySelector(".tl-adr-name").value.trim() || "ADR";
      const startInput = card.querySelector(".tl-adr-start");
      const endInput = card.querySelector(".tl-adr-end");

      const startDate = readDateInput(startInput);
      if (!startDate) return;

      let endDate = readDateInput(endInput);
      if (!endDate) {
        endDate = new Date(today.getTime());
      }
      if (endDate < startDate) {
        endDate = new Date(startDate.getTime());
      }

      adrs.push({
        name,
        start: startDate,
        end: endDate,
      });
    });

    // ถ้าไม่มีอะไรเลย ก็ซ่อน
    if (drugs.length === 0 && adrs.length === 0) {
      scroll.classList.add("hidden");
      ticks.innerHTML = "";
      canvas.innerHTML = "";
      return;
    }

    // -------- 3) หา day-range ที่ต้องแสดง --------
    // จุดเริ่ม = วันเริ่มที่เล็กสุด
    let axisStart = null;
    [...drugs, ...adrs].forEach((item) => {
      if (!axisStart || item.start < axisStart) {
        axisStart = new Date(item.start.getTime());
      }
    });
    axisStart.setHours(0, 0, 0, 0);

    // จุดจบ = วันนี้ (ไม่ใช่วันท้ายสุดที่กรอก) ตาม requirement ล่าสุด
    const axisEnd = new Date(today.getTime());
    axisEnd.setHours(0, 0, 0, 0);

    const totalDays =
      Math.round((axisEnd.getTime() - axisStart.getTime()) / DAY_MS) + 1;

    // -------- 4) วาดแกน X --------
    ticks.innerHTML = "";
    const baseLeft = 120; // ให้วันที่เริ่มที่ตำแหน่งเดียวกับ track
    const totalWidth = baseLeft + totalDays * DAY_WIDTH + 40;
    ticks.style.width = totalWidth + "px";
    canvas.innerHTML = "";
    canvas.style.width = totalWidth + "px";

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(axisStart.getTime() + i * DAY_MS);
      const label = d.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
      });
      const tick = document.createElement("div");
      tick.className = "tl-tick";
      tick.style.left = baseLeft + i * DAY_WIDTH + "px";
      tick.textContent = label;
      ticks.appendChild(tick);
    }

    // -------- 5) สร้าง 2 แถว (ยา / ADR) --------
    const wrap = document.createElement("div");
    wrap.style.position = "relative";
    wrap.style.minHeight = "130px";

    // แถว ยา
    const drugRow = document.createElement("div");
    drugRow.className = "tl-row";
    drugRow.style.gridTemplateColumns = "110px 1fr";
    drugRow.innerHTML = `
      <div class="tl-ylabel" style="color:#0f766e;font-weight:700;">ยา:</div>
      <div class="tl-track" style="position:relative;height:50px;padding-left:${baseLeft}px;"></div>
    `;
    wrap.appendChild(drugRow);

    // แถว ADR
    const adrRow = document.createElement("div");
    adrRow.className = "tl-row";
    adrRow.style.gridTemplateColumns = "110px 1fr";
    adrRow.innerHTML = `
      <div class="tl-ylabel" style="color:#b91c1c;font-weight:700;">ADR:</div>
      <div class="tl-track" style="position:relative;height:50px;padding-left:${baseLeft}px;"></div>
    `;
    wrap.appendChild(adrRow);

    const drugTrack = drugRow.querySelector(".tl-track");
    const adrTrack = adrRow.querySelector(".tl-track");

    // -------- 6) วางแถบยา --------
    drugs.forEach((drug) => {
      const startOffset = Math.round(
        (drug.start.getTime() - axisStart.getTime()) / DAY_MS
      ); // 0 = วันแรก
      const endOffset = Math.round(
        (drug.end.getTime() - axisStart.getTime()) / DAY_MS
      ); // 0 = วันแรก
      const spanDays = endOffset - startOffset + 1; // รวมวันตัวเอง

      const bar = document.createElement("div");
      bar.className = "tl-bar drug";
      bar.style.left = startOffset * DAY_WIDTH + "px";
      bar.style.width = spanDays * DAY_WIDTH - 12 + "px"; // -12 กันเลยขอบ
      bar.textContent = `${drug.name} (${toISO(drug.start)})`;
      drugTrack.appendChild(bar);
    });

    // -------- 7) วางแถบ ADR --------
    adrs.forEach((adr) => {
      const startOffset = Math.round(
        (adr.start.getTime() - axisStart.getTime()) / DAY_MS
      );
      const endOffset = Math.round(
        (adr.end.getTime() - axisStart.getTime()) / DAY_MS
      );
      const spanDays = endOffset - startOffset + 1;

      const bar = document.createElement("div");
      bar.className = "tl-bar adr";
      bar.style.left = startOffset * DAY_WIDTH + "px";
      bar.style.width = spanDays * DAY_WIDTH - 12 + "px";
      bar.textContent = `${adr.name} (${toISO(adr.start)})`;
      adrTrack.appendChild(bar);
    });

    canvas.appendChild(wrap);
    scroll.classList.remove("hidden");
  }

  // ====== เพิ่มแถว ยา / ADR ======
  function addDrugRow() {
    const list = document.getElementById("tl-drug-list");
    const card = document.createElement("div");
    card.className = "tl-card tl-bg-soft";
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <strong style="color:#0f172a;">ชื่อยา</strong>
        <button type="button" class="tl-del-small" style="background:#fee2e2;border:none;border-radius:8px;padding:4px 10px;cursor:pointer;">ลบ</button>
      </div>
      <input type="text" class="tl-drug-name" placeholder="ระบุชื่อยา เช่น Amoxicillin" style="width:100%;margin-bottom:8px;">
      <div class="tl-grid2">
        <div>
          <label>เริ่มให้ยา</label>
          <input type="date" class="tl-drug-start" style="width:100%;">
          <input type="time" class="tl-drug-start-time" style="width:100%;margin-top:4px;">
        </div>
        <div>
          <label>หยุดยา</label>
          <input type="date" class="tl-drug-end" style="width:100%;">
          <input type="time" class="tl-drug-end-time" style="width:100%;margin-top:4px;">
        </div>
      </div>
    `;
    card.querySelector(".tl-del-small").addEventListener("click", () => {
      card.remove();
    });
    list.appendChild(card);
  }

  function addAdrRow() {
    const list = document.getElementById("tl-adr-list");
    const card = document.createElement("div");
    card.className = "tl-card tl-bg-soft-red";
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <strong style="color:#b91c1c;">อาการ</strong>
        <button type="button" class="tl-del-small" style="background:#fee2e2;border:none;border-radius:8px;padding:4px 10px;cursor:pointer;">ลบ</button>
      </div>
      <input type="text" class="tl-adr-name" placeholder="ระบุอาการ เช่น ผื่น, คัน, บวม" style="width:100%;margin-bottom:8px;">
      <div class="tl-grid2">
        <div>
          <label>วันที่เกิด</label>
          <input type="date" class="tl-adr-start" style="width:100%;">
          <input type="time" class="tl-adr-start-time" style="width:100%;margin-top:4px;">
        </div>
        <div>
          <label>วันที่หาย</label>
          <input type="date" class="tl-adr-end" style="width:100%;">
          <input type="time" class="tl-adr-end-time" style="width:100%;margin-top:4px;">
        </div>
      </div>
    `;
    card.querySelector(".tl-del-small").addEventListener("click", () => {
      card.remove();
    });
    list.appendChild(card);
  }

  // ====== renderPage5 ที่ HTML เรียก ======
  window.renderPage5 = function () {
    const root = document.getElementById("page5");
    if (!root) return;

    root.innerHTML = `
      <div class="p5-wrapper" style="background:linear-gradient(135deg,#fff7d6 0%,#ffe6ff 35%,#ffffff 100%);border-radius:1.4rem;padding:1rem 1rem 4.5rem;position:relative;">
        <div class="p5-glitter-layer"></div>

        <!-- ยา -->
        <div class="tl-section tl-bg-soft" style="margin-bottom:1rem;position:relative;">
          <div class="tl-head">
            <h2 style="margin:0;font-size:1.05rem;color:#0f172a;display:flex;align-items:center;gap:.4rem;">
              <span style="font-size:1.3rem;">💊</span> ยา
            </h2>
            <button type="button" id="tl-add-drug" class="btn-green-solid" style="border-radius:999px;padding:9px 16px;font-weight:600;">+ เพิ่มยาตัวใหม่</button>
          </div>
          <div id="tl-drug-list"></div>
        </div>

        <!-- ADR -->
        <div class="tl-section tl-bg-soft-red" style="margin-bottom:1rem;position:relative;">
          <div class="tl-head">
            <h2 style="margin:0;font-size:1.05rem;color:#b91c1c;display:flex;align-items:center;gap:.4rem;">
              <span style="font-size:1.3rem;">🧴</span> ADR (Adverse Drug Reaction)
            </h2>
            <button type="button" id="tl-add-adr" class="btn-red-solid" style="border-radius:999px;padding:9px 16px;font-weight:600;">+ เพิ่ม ADR</button>
          </div>
          <div id="tl-adr-list"></div>

          <div class="tl-actions-under-adr" style="margin-top:10px;">
            <button type="button" id="tl-build" class="btn-blue-solid" style="display:inline-flex;align-items:center;gap:.4rem;border-radius:999px;">
              ▶ สร้าง Timeline
            </button>
          </div>
        </div>

        <!-- แสดงวันเวลา -->
        <div id="tl-now" style="margin-bottom:.4rem;display:flex;align-items:center;gap:.35rem;color:#0f172a;font-weight:600;">
          <span style="font-size:1.1rem;">📅</span> <span>กำลังโหลดเวลา…</span>
        </div>

        <!-- TIMELINE -->
        <div id="tl-scroll" class="tl-scroll hidden" style="min-height:140px;">
          <div id="tl-ticks" class="tl-ticks"></div>
          <div id="tl-canvas" class="tl-canvas"></div>
        </div>

        <!-- ปุ่มล่าง -->
        <div class="tl-bottom-actions" style="margin-top:1.25rem;position:static;">
          <button type="button" id="tl-print" class="btn-green-solid">🖨️ Print / PDF</button>
          <button type="button" id="tl-next" class="btn-purple-solid">บันทึกข้อมูลและไปหน้า 6</button>
          <button type="button" id="tl-clear" class="btn-red-solid">🗑️ ล้างข้อมูลหน้านี้</button>
        </div>
      </div>
    `;

    // สร้างแถวเริ่มต้น 1 ยา 1 ADR
    addDrugRow();
    addAdrRow();

    // bind ปุ่ม
    document.getElementById("tl-add-drug").addEventListener("click", addDrugRow);
    document.getElementById("tl-add-adr").addEventListener("click", addAdrRow);
    document.getElementById("tl-build").addEventListener("click", buildTimeline);
    document.getElementById("tl-clear").addEventListener("click", () => {
      document.getElementById("tl-drug-list").innerHTML = "";
      document.getElementById("tl-adr-list").innerHTML = "";
      addDrugRow();
      addAdrRow();
      document.getElementById("tl-scroll").classList.add("hidden");
      document.getElementById("tl-ticks").innerHTML = "";
      document.getElementById("tl-canvas").innerHTML = "";
    });
    document.getElementById("tl-print").addEventListener("click", () => {
      window.print();
    });
    document.getElementById("tl-next").addEventListener("click", () => {
      // แค่ไปหน้า 6 แบบง่ายๆ
      const btn = document.querySelector('.tabs button[data-target="page6"]');
      if (btn) btn.click();
    });

    // เริ่มนาฬิกา
    startClock();
  };
})();

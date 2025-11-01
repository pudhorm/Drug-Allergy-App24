// page5.js
// หน้า 5 Timeline — เวอร์ชันปรับปลายซ้าย/ขวา + เวลาไทย + ปุ่มลบเล็ก
(function () {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const DAY_WIDTH = 110; // ความกว้าง 1 วันบนแกน X

  // ฟังก์ชันช่วย
  const diffDays = (d1, d0) => Math.round((d1.getTime() - d0.getTime()) / DAY_MS);

  // แปลง date -> 2025-11-29 (ไว้เขียนบนแถบ)
  function toISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  }

  // แสดงวันเวลาปัจจุบันไทย
  function startNowClock() {
    const el = document.getElementById("tl-now-clock");
    if (!el) return;
    function tick() {
      const now = new Date();
      const f = new Intl.DateTimeFormat("th-TH", {
        dateStyle: "full",
        timeStyle: "medium",
        timeZone: "Asia/Bangkok",
      }).format(now);
      el.textContent = `📅 ${f}`;
    }
    tick();
    setInterval(tick, 1000);
  }

  // ----- สร้างหน้า 5 -----
  function renderPage5() {
    const page = document.getElementById("page5");
    if (!page) return;

    page.innerHTML = `
      <div class="p5-wrapper" style="background: radial-gradient(circle at top,#fff7c7 0%,#fde7ff 35%,#ffffff 70%); border:1px solid rgba(255,255,255,.4); border-radius:1.6rem; padding:1.2rem 1.2rem 6.2rem; box-shadow:0 18px 35px rgba(248,113,113,.04); position:relative;">
        <div class="p5-glitter-layer"></div>

        <!-- กล่องยา -->
        <div class="tl-section tl-bg-soft" style="margin-bottom:1rem; position:relative;">
          <div class="tl-head">
            <h2 style="margin:0; font-size:1.3rem; color:#0f172a;">ยา</h2>
            <div style="display:flex; gap:.5rem; align-items:center;">
              <button id="tl-add-drug" class="btn-green-solid" style="min-width:140px; display:flex; gap:.35rem; align-items:center; justify-content:center;">
                + เพิ่มยาตัวใหม่
              </button>
            </div>
          </div>
          <div id="tl-drug-list" style="display:flex; flex-direction:column; gap:.7rem;"></div>
        </div>

        <!-- กล่อง ADR -->
        <div class="tl-section tl-bg-soft-red" style="margin-bottom:1rem; position:relative;">
          <div class="tl-head">
            <h2 style="margin:0; font-size:1.3rem; color:#991b1b;">ADR (Adverse Drug Reaction)</h2>
            <div style="display:flex; gap:.5rem; align-items:center;">
              <button id="tl-add-adr" class="btn-red-solid" style="min-width:140px; display:flex; gap:.35rem; align-items:center; justify-content:center;">
                + เพิ่ม ADR
              </button>
            </div>
          </div>
          <div id="tl-adr-list" style="display:flex; flex-direction:column; gap:.7rem;"></div>

          <!-- ปุ่มสร้าง timeline -->
          <div class="tl-actions-under-adr" style="margin-top:.6rem;">
            <button id="tl-build" class="btn-blue-solid" style="display:flex; gap:.4rem; align-items:center;">
              ▶
              <span>สร้าง Timeline</span>
            </button>
          </div>
        </div>

        <!-- ผล Timeline -->
        <div class="tl-section" style="position:relative;">
          <!-- เวลาไทย -->
          <div id="tl-now-clock" style="margin-bottom:.4rem; font-weight:600; color:#1f2937;"></div>

          <h2 style="margin:0 0 .6rem; font-size:1.4rem; color:#111827;">Visual Timeline</h2>
          <div id="tl-scroll" class="tl-scroll hidden" style="min-height:160px;">
            <div id="tl-ticks" class="tl-ticks"></div>
            <div id="tl-canvas" class="tl-canvas"></div>
          </div>
        </div>

        <!-- ปุ่มล่าง -->
        <div class="tl-bottom-actions" style="position:sticky; bottom:0; gap:.6rem; margin-top:1.2rem;">
          <button id="tl-print" class="btn-green-solid" style="width:100%; display:flex; gap:.4rem; justify-content:center; align-items:center;">
            🖨️ Print / PDF
          </button>
          <button id="tl-save-next" class="btn-purple-solid" style="width:100%;">บันทึกข้อมูลและไปหน้า 6</button>
          <button id="tl-clear" class="btn-red-solid" style="width:100%;">🗑 ล้างข้อมูลหน้านี้</button>
        </div>
      </div>
    `;

    // สร้างแถวเริ่มต้น
    addDrugRow();
    addAdrRow();

    // ผูกปุ่ม
    document.getElementById("tl-add-drug").addEventListener("click", addDrugRow);
    document.getElementById("tl-add-adr").addEventListener("click", addAdrRow);
    document.getElementById("tl-build").addEventListener("click", buildTimeline);
    document.getElementById("tl-clear").addEventListener("click", clearPage5);
    document.getElementById("tl-print").addEventListener("click", () => window.print());
    document.getElementById("tl-save-next").addEventListener("click", () => {
      const btn = document.querySelector('.tabs button[data-target="page6"]');
      if (btn) btn.click();
    });

    // นาฬิกาไทย
    startNowClock();
  }

  // ----- เพิ่มการ์ดยา -----
  function addDrugRow() {
    const list = document.getElementById("tl-drug-list");
    const card = document.createElement("div");
    card.className = "tl-card";
    card.style.position = "relative";
    card.innerHTML = `
      <button class="tl-del" style="position:absolute; top:.5rem; right:.5rem; border:none; background:#fee2e2; color:#b91c1c; border-radius:.5rem; padding:.25rem .55rem; font-size:.7rem; cursor:pointer;">ลบ</button>
      <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-top:.2rem;">
        <div style="flex:1 1 180px;">
          <label>ชื่อยา</label>
          <input type="text" class="tl-drug-name" placeholder="ระบุชื่อยา" style="width:100%; border:1px solid rgba(15,23,42,.08); border-radius:.7rem; padding:.35rem .55rem;" />
        </div>
      </div>
      <div style="display:flex; gap:1rem; margin-top:.6rem; flex-wrap:wrap;">
        <div>
          <label>เริ่มให้ยา</label><br/>
          <input type="date" class="tl-drug-start" style="border:1px solid rgba(15,23,42,.08); border-radius:.6rem; padding:.25rem .55rem;" />
        </div>
        <div>
          <label>เวลา</label><br/>
          <input type="time" class="tl-drug-start-time" style="border:1px solid rgba(15,23,42,.08); border-radius:.6rem; padding:.25rem .55rem;" />
        </div>
        <div>
          <label>หยุดยา</label><br/>
          <input type="date" class="tl-drug-end" style="border:1px solid rgba(15,23,42,.08); border-radius:.6rem; padding:.25rem .55rem;" />
        </div>
        <div>
          <label>เวลา</label><br/>
          <input type="time" class="tl-drug-end-time" style="border:1px solid rgba(15,23,42,.08); border-radius:.6rem; padding:.25rem .55rem;" />
        </div>
      </div>
    `;
    card.querySelector(".tl-del").addEventListener("click", () => card.remove());
    list.appendChild(card);
  }

  // ----- เพิ่มการ์ด ADR -----
  function addAdrRow() {
    const list = document.getElementById("tl-adr-list");
    const card = document.createElement("div");
    card.className = "tl-card";
    card.style.position = "relative";
    card.innerHTML = `
      <button class="tl-del" style="position:absolute; top:.5rem; right:.5rem; border:none; background:#fee2e2; color:#b91c1c; border-radius:.5rem; padding:.25rem .55rem; font-size:.7rem; cursor:pointer;">ลบ</button>
      <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-top:.2rem;">
        <div style="flex:1 1 180px;">
          <label>อาการ</label>
          <input type="text" class="tl-adr-name" placeholder="ระบุอาการ เช่น ผื่น, คัน, บวม" style="width:100%; border:1px solid rgba(15,23,42,.08); border-radius:.7rem; padding:.35rem .55rem;" />
        </div>
      </div>
      <div style="display:flex; gap:1rem; margin-top:.6rem; flex-wrap:wrap;">
        <div>
          <label>วันที่เกิด</label><br/>
          <input type="date" class="tl-adr-start" style="border:1px solid rgba(15,23,42,.08); border-radius:.6rem; padding:.25rem .55rem;" />
        </div>
        <div>
          <label>เวลา</label><br/>
          <input type="time" class="tl-adr-start-time" style="border:1px solid rgba(15,23,42,.08); border-radius:.6rem; padding:.25rem .55rem;" />
        </div>
        <div>
          <label>วันที่หาย</label><br/>
          <input type="date" class="tl-adr-end" style="border:1px solid rgba(15,23,42,.08); border-radius:.6rem; padding:.25rem .55rem;" />
        </div>
        <div>
          <label>เวลา</label><br/>
          <input type="time" class="tl-adr-end-time" style="border:1px solid rgba(15,23,42,.08); border-radius:.6rem; padding:.25rem .55rem;" />
        </div>
      </div>
    `;
    card.querySelector(".tl-del").addEventListener("click", () => card.remove());
    list.appendChild(card);
  }

  // ----- ล้างหน้า 5 -----
  function clearPage5() {
    document.getElementById("tl-drug-list").innerHTML = "";
    document.getElementById("tl-adr-list").innerHTML = "";
    addDrugRow();
    addAdrRow();
    document.getElementById("tl-scroll").classList.add("hidden");
  }

  // ----- ปุ่มสร้าง Timeline -----
  function buildTimeline() {
    const today = new Date();
    // วันนี้แบบไทย
    today.setHours(0, 0, 0, 0);

    // -------- เก็บข้อมูลจากฟอร์ม --------
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
        // ไม่ระบุ → ยาวถึงวันนี้
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

    // ไม่มีข้อมูล -> ซ่อน
    if (drugs.length === 0 && adrs.length === 0) {
      document.getElementById("tl-scroll").classList.add("hidden");
      return;
    }

    // -------- หาแกน X --------
    let axisStart = null;
    let axisEnd = new Date(today.getTime());

    [...drugs, ...adrs].forEach((item) => {
      if (!axisStart || item.start < axisStart) axisStart = item.start;
      if (item.end > axisEnd) axisEnd = item.end;
    });

    axisStart.setHours(0, 0, 0, 0);
    axisEnd.setHours(0, 0, 0, 0);

    // จำนวนวันตั้งแต่เริ่มถึงจบ (inclusive)
    const totalDays = diffDays(axisEnd, axisStart); // 0 = วันเดียว
    const ticks = document.getElementById("tl-ticks");
    const canvas = document.getElementById("tl-canvas");
    const scroll = document.getElementById("tl-scroll");

    ticks.innerHTML = "";
    canvas.innerHTML = "";

    const totalWidth = (totalDays + 1) * DAY_WIDTH + 140;
    ticks.style.width = totalWidth + "px";
    canvas.style.width = totalWidth + "px";

    // วาดวันที่บนแกน X — ตอนนี้เริ่มที่วันแรกเป๊ะ
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

    // เตรียมแคนวาสแถว
    const wrap = document.createElement("div");
    wrap.style.position = "relative";
    wrap.style.minHeight = "120px";

    // --- แถวยา ---
    const drugRow = document.createElement("div");
    drugRow.className = "tl-row";
    drugRow.style.gridTemplateColumns = "110px 1fr";
    drugRow.innerHTML = `
      <div class="tl-ylabel" style="color:#0f766e; font-weight:700;">ยา:</div>
      <div class="tl-track" style="position:relative; height:50px;"></div>
    `;
    wrap.appendChild(drugRow);

    const drugTrack = drugRow.querySelector(".tl-track");
    drugs.forEach((d) => {
      const startOffset = diffDays(d.start, axisStart); // 0 = วันแรก
      const endOffset = diffDays(d.end, axisStart);
      const spanDays = endOffset - startOffset + 1; // นับวันตัวเองด้วย

      const bar = document.createElement("div");
      bar.className = "tl-bar drug";
      bar.style.left = 120 + startOffset * DAY_WIDTH + "px";
      bar.style.width = spanDays * DAY_WIDTH - 12 + "px";
      bar.textContent = `${d.name} (${toISO(d.start)})`;
      drugTrack.appendChild(bar);
    });

    // --- แถว ADR ---
    const adrRow = document.createElement("div");
    adrRow.className = "tl-row";
    adrRow.style.gridTemplateColumns = "110px 1fr";
    adrRow.innerHTML = `
      <div class="tl-ylabel" style="color:#b91c1c; font-weight:700;">ADR:</div>
      <div class="tl-track" style="position:relative; height:50px;"></div>
    `;
    wrap.appendChild(adrRow);

    const adrTrack = adrRow.querySelector(".tl-track");
    adrs.forEach((a) => {
      const startOffset = diffDays(a.start, axisStart);
      const endOffset = diffDays(a.end, axisStart);
      const spanDays = endOffset - startOffset + 1;

      const bar = document.createElement("div");
      bar.className = "tl-bar adr";
      bar.style.left = 120 + startOffset * DAY_WIDTH + "px";
      bar.style.width = spanDays * DAY_WIDTH - 12 + "px";
      bar.textContent = `${a.name} (${toISO(a.start)})`;
      adrTrack.appendChild(bar);
    });

    canvas.appendChild(wrap);
    scroll.classList.remove("hidden");
  }

  // export
  window.renderPage5 = renderPage5;
})();

// page5.js
// หน้า 5: Timeline ประเมินการแพ้ยา
// เวอร์ชันนี้แก้ 3 เรื่องหลัก:
// 1) แกน X เริ่มตรงวันแรกที่ผู้ใช้กรอกจริงๆ (ไม่เลื่อน +1 วันแล้ว)
// 2) ถ้าไม่กรอกวันหยุดยา / วันหาย -> แถบยาวถึง "วันนี้" (วันที่เปิดแอพ)
// 3) ปลายแถบซ้าย-ขวา ตรงกับวันที่คำนวณจริง เป๊ะ

(function () {
  const DAY_MS = 24 * 60 * 60 * 1000;

  // แปลง "24/11/2025" -> Date(2025,10,24)
  function parseThaiDate(str) {
    if (!str || str === "วว/ดด/ปปปป") return null;
    const parts = str.split("/");
    if (parts.length !== 3) return null;
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    if (Number.isNaN(d) || Number.isNaN(m) || Number.isNaN(y)) return null;
    const dt = new Date(y, m, d);
    dt.setHours(0, 0, 0, 0);
    return dt;
  }

  // แปลง Date -> 2025-11-29 เอาไว้แปะบนแถบ
  function formatISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  }

  // ส่วน HTML หลักของหน้า 5
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
            <button id="tl-add-drug" class="btn-green-solid" style="min-width:150px; display:flex; gap:.4rem; justify-content:center; align-items:center;">
              <span>+ เพิ่มยาตัวใหม่</span>
            </button>
          </div>
          <div id="tl-drug-list" style="display:flex; flex-direction:column; gap:.7rem;"></div>
        </div>

        <!-- กล่อง ADR -->
        <div class="tl-section tl-bg-soft-red" style="margin-bottom:1rem; position:relative;">
          <div class="tl-head">
            <h2 style="margin:0; font-size:1.3rem; color:#991b1b;">ADR (Adverse Drug Reaction)</h2>
            <button id="tl-add-adr" class="btn-red-solid" style="min-width:150px; display:flex; gap:.4rem; justify-content:center; align-items:center;">
              <span>+ เพิ่ม ADR</span>
            </button>
          </div>
          <div id="tl-adr-list" style="display:flex; flex-direction:column; gap:.7rem;"></div>

          <!-- ปุ่มสร้าง timeline -->
          <div class="tl-actions-under-adr" style="margin-top:.6rem;">
            <button id="tl-build" class="btn-blue-solid" style="display:flex; gap:.4rem; align-items:center;">
              <span style="font-size:1.1rem;">▶</span>
              <span>สร้าง Timeline</span>
            </button>
          </div>
        </div>

        <!-- ผล Timeline -->
        <div class="tl-section" style="position:relative;">
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

    // สร้าง 1 ช่องเริ่มต้น
    addDrugRow();
    addAdrRow();

    // ผูกปุ่ม
    document.getElementById("tl-add-drug").addEventListener("click", addDrugRow);
    document.getElementById("tl-add-adr").addEventListener("click", addAdrRow);
    document.getElementById("tl-build").addEventListener("click", buildTimeline);
    document.getElementById("tl-clear").addEventListener("click", clearPage5);
    document.getElementById("tl-print").addEventListener("click", () => window.print());
    document.getElementById("tl-save-next").addEventListener("click", () => {
      // แค่สลับหน้าไปหน้า 6
      const btn = document.querySelector('.tabs button[data-target="page6"]');
      if (btn) btn.click();
    });
  }

  // ====== ส่วนสร้าง input ของ "ยา" ======
  function addDrugRow() {
    const list = document.getElementById("tl-drug-list");
    const wrap = document.createElement("div");
    wrap.className = "tl-card";
    wrap.style.position = "relative";
    wrap.innerHTML = `
      <div style="display:flex; gap:1rem; align-items:flex-start;">
        <div style="flex:1 1 auto;">
          <label>ชื่อยา</label>
          <input type="text" class="tl-drug-name" placeholder="ระบุชื่อยา" style="width:100%; border:1px solid rgba(15,23,42,.1); border-radius:.8rem; padding:.35rem .55rem;" />
        </div>
        <div style="width:92px; align-self:stretch; background:rgba(248,113,113,.12); border-radius:.8rem; display:flex; justify-content:center; align-items:center;">
          <button class="tl-del" style="border:none; background:transparent; font-weight:700; color:#b91c1c; cursor:pointer;">ลบ</button>
        </div>
      </div>
      <div style="display:flex; gap:1rem; margin-top:.6rem; flex-wrap:wrap;">
        <div>
          <label>เริ่มให้ยา</label><br/>
          <input type="date" class="tl-drug-start" style="border:1px solid rgba(15,23,42,.1); border-radius:.6rem; padding:.25rem .45rem;" />
        </div>
        <div>
          <label>เวลา</label><br/>
          <input type="time" class="tl-drug-start-time" style="border:1px solid rgba(15,23,42,.1); border-radius:.6rem; padding:.25rem .45rem;" />
        </div>
        <div>
          <label>หยุดยา</label><br/>
          <input type="date" class="tl-drug-end" placeholder="วว/ดด/ปปปป" style="border:1px solid rgba(15,23,42,.1); border-radius:.6rem; padding:.25rem .45rem;" />
        </div>
        <div>
          <label>เวลา</label><br/>
          <input type="time" class="tl-drug-end-time" style="border:1px solid rgba(15,23,42,.1); border-radius:.6rem; padding:.25rem .45rem;" />
        </div>
      </div>
    `;
    // ปุ่มลบ
    wrap.querySelector(".tl-del").addEventListener("click", () => {
      wrap.remove();
    });
    list.appendChild(wrap);
  }

  // ====== ส่วนสร้าง input ของ "ADR" ======
  function addAdrRow() {
    const list = document.getElementById("tl-adr-list");
    const wrap = document.createElement("div");
    wrap.className = "tl-card";
    wrap.style.position = "relative";
    wrap.innerHTML = `
      <div style="display:flex; gap:1rem; align-items:flex-start;">
        <div style="flex:1 1 auto;">
          <label>อาการ</label>
          <input type="text" class="tl-adr-name" placeholder="ระบุอาการ เช่น ผื่น, คัน, บวม" style="width:100%; border:1px solid rgba(15,23,42,.1); border-radius:.8rem; padding:.35rem .55rem;" />
        </div>
        <div style="width:92px; align-self:stretch; background:rgba(254,226,226,.9); border-radius:.8rem; display:flex; justify-content:center; align-items:center;">
          <button class="tl-del" style="border:none; background:transparent; font-weight:700; color:#b91c1c; cursor:pointer;">ลบ</button>
        </div>
      </div>
      <div style="display:flex; gap:1rem; margin-top:.6rem; flex-wrap:wrap;">
        <div>
          <label>วันที่เกิด</label><br/>
          <input type="date" class="tl-adr-start" style="border:1px solid rgba(15,23,42,.1); border-radius:.6rem; padding:.25rem .45rem;" />
        </div>
        <div>
          <label>เวลา</label><br/>
          <input type="time" class="tl-adr-start-time" style="border:1px solid rgba(15,23,42,.1); border-radius:.6rem; padding:.25rem .45rem;" />
        </div>
        <div>
          <label>วันที่หาย</label><br/>
          <input type="date" class="tl-adr-end" placeholder="วว/ดด/ปปปป" style="border:1px solid rgba(15,23,42,.1); border-radius:.6rem; padding:.25rem .45rem;" />
        </div>
        <div>
          <label>เวลา</label><br/>
          <input type="time" class="tl-adr-end-time" style="border:1px solid rgba(15,23,42,.1); border-radius:.6rem; padding:.25rem .45rem;" />
        </div>
      </div>
    `;
    wrap.querySelector(".tl-del").addEventListener("click", () => {
      wrap.remove();
    });
    list.appendChild(wrap);
  }

  // ====== ปุ่มล้างข้อมูล ======
  function clearPage5() {
    document.getElementById("tl-drug-list").innerHTML = "";
    document.getElementById("tl-adr-list").innerHTML = "";
    addDrugRow();
    addAdrRow();
    document.getElementById("tl-scroll").classList.add("hidden");
  }

  // ====== สร้าง Timeline ======
  function buildTimeline() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // เก็บของยา
    const drugRows = Array.from(document.querySelectorAll("#tl-drug-list .tl-card"));
    const drugs = [];
    for (const row of drugRows) {
      const name = row.querySelector(".tl-drug-name").value.trim() || "ยากลุ่มที่ 1";
      const startStr = row.querySelector(".tl-drug-start").value;
      const endStr = row.querySelector(".tl-drug-end").value;
      const start = startStr ? new Date(startStr) : null;
      let end = endStr ? new Date(endStr) : null;

      if (!start) continue; // ยังไม่ใส่วันเริ่ม -> ไม่ต้องโชว์ใน timeline

      start.setHours(0, 0, 0, 0);

      // ถ้าไม่ระบุวันหยุด -> ใช้วันนี้เลย (คงตามที่คุณสั่ง)
      if (!end) {
        end = new Date(today.getTime());
      } else {
        end.setHours(0, 0, 0, 0);
      }

      // กันไว้ ถ้าผู้ใช้ใส่วันหยุดก่อนวันเริ่ม
      if (end < start) end = new Date(start.getTime());

      drugs.push({ name, start, end });
    }

    // เก็บของ ADR
    const adrRows = Array.from(document.querySelectorAll("#tl-adr-list .tl-card"));
    const adrs = [];
    for (const row of adrRows) {
      const name = row.querySelector(".tl-adr-name").value.trim() || "ADR";
      const startStr = row.querySelector(".tl-adr-start").value;
      const endStr = row.querySelector(".tl-adr-end").value;
      const start = startStr ? new Date(startStr) : null;
      let end = endStr ? new Date(endStr) : null;

      if (!start) continue;

      start.setHours(0, 0, 0, 0);

      if (!end) {
        end = new Date(today.getTime());
      } else {
        end.setHours(0, 0, 0, 0);
      }

      if (end < start) end = new Date(start.getTime());

      adrs.push({ name, start, end });
    }

    // ถ้าไม่มีเลย -> ไม่ต้องโชว์
    if (drugs.length === 0 && adrs.length === 0) {
      document.getElementById("tl-scroll").classList.add("hidden");
      return;
    }

    // หา "วันเริ่มของแกน X" = วันเริ่มที่เล็กที่สุด
    let axisStart = null;
    for (const d of drugs) {
      if (!axisStart || d.start < axisStart) axisStart = d.start;
    }
    for (const a of adrs) {
      if (!axisStart || a.start < axisStart) axisStart = a.start;
    }
    // เผื่อไม่มีเลย
    if (!axisStart) axisStart = new Date(today.getTime());

    // หา "วันสุดท้ายของแกน X" = max(วันที่จบทั้งหมด, วันนี้)
    let axisEnd = new Date(today.getTime());
    for (const d of drugs) {
      if (d.end > axisEnd) axisEnd = d.end;
    }
    for (const a of adrs) {
      if (a.end > axisEnd) axisEnd = a.end;
    }

    axisStart.setHours(0, 0, 0, 0);
    axisEnd.setHours(0, 0, 0, 0);

    // รวมจำนวนวันบนแกน X (แบบ inclusive) เช่น 26 → 29 = 4 วัน
    const totalDays = Math.floor((axisEnd - axisStart) / DAY_MS) + 1;
    const DAY_WIDTH = 110; // กว้าง 110px ต่อวัน จะได้เห็นชัด

    const ticks = document.getElementById("tl-ticks");
    const canvas = document.getElementById("tl-canvas");
    const scroll = document.getElementById("tl-scroll");

    ticks.innerHTML = "";
    canvas.innerHTML = "";

    // ตั้งความกว้างแคนวาสตามจำนวนวัน
    const totalWidth = totalDays * DAY_WIDTH + 140;
    ticks.style.width = totalWidth + "px";
    canvas.style.width = totalWidth + "px";

    // วาดวันบนแกน X (เริ่มตรงวันแรกเลย ไม่เลื่อนแล้ว)
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(axisStart.getTime() + i * DAY_MS);
      const thDate = d.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
      });
      const div = document.createElement("div");
      div.className = "tl-tick";
      div.style.left = i * DAY_WIDTH + 120 + "px"; // 120px เว้นซ้ายให้ Y label
      div.textContent = thDate;
      ticks.appendChild(div);
    }

    // มีกี่แถว? อย่างน้อย 2 (ยา / ADR)
    const trackWrap = document.createElement("div");
    trackWrap.style.position = "relative";
    trackWrap.style.minHeight = "120px";

    // ====== แถว "ยา:" ======
    const drugRow = document.createElement("div");
    drugRow.className = "tl-row";
    drugRow.style.gridTemplateColumns = "110px 1fr";
    drugRow.innerHTML = `
      <div class="tl-ylabel" style="color:#0f766e; font-weight:700;">ยา:</div>
      <div class="tl-track" style="position:relative; height:50px;"></div>
    `;
    trackWrap.appendChild(drugRow);

    // วาดแถบยา
    const drugTrack = drugRow.querySelector(".tl-track");
    drugs.forEach((d) => {
      const startOffset = Math.floor((d.start - axisStart) / DAY_MS); // 0 = วันแรก
      const endOffset = Math.floor((d.end - axisStart) / DAY_MS);
      const bar = document.createElement("div");
      bar.className = "tl-bar drug";
      // กว้าง = (จำนวนวันจริง + 1) * dayWidth
      const widthPx = (endOffset - startOffset + 1) * DAY_WIDTH - 12;
      bar.style.left = startOffset * DAY_WIDTH + 120 + "px"; // +120 ให้ตรงแกน
      bar.style.width = widthPx + "px";
      bar.textContent = `${d.name} (${formatISO(d.start)})`;
      drugTrack.appendChild(bar);
    });

    // ====== แถว "ADR:" ======
    const adrRow = document.createElement("div");
    adrRow.className = "tl-row";
    adrRow.style.gridTemplateColumns = "110px 1fr";
    adrRow.innerHTML = `
      <div class="tl-ylabel" style="color:#b91c1c; font-weight:700;">ADR:</div>
      <div class="tl-track" style="position:relative; height:50px;"></div>
    `;
    trackWrap.appendChild(adrRow);

    const adrTrack = adrRow.querySelector(".tl-track");
    adrs.forEach((a) => {
      const startOffset = Math.floor((a.start - axisStart) / DAY_MS);
      const endOffset = Math.floor((a.end - axisStart) / DAY_MS);
      const bar = document.createElement("div");
      bar.className = "tl-bar adr";
      const widthPx = (endOffset - startOffset + 1) * DAY_WIDTH - 12;
      bar.style.left = startOffset * DAY_WIDTH + 120 + "px";
      bar.style.width = widthPx + "px";
      bar.textContent = `${a.name} (${formatISO(a.start)})`;
      adrTrack.appendChild(bar);
    });

    canvas.appendChild(trackWrap);

    // โชว์กล่อง timeline
    scroll.classList.remove("hidden");
  }

  // เอาไปให้หน้า html เรียก
  window.renderPage5 = renderPage5;
})();

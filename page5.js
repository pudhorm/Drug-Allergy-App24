// page5.js
(function () {
  // จำนวน ms ต่อ 1 วัน
  const MS_DAY = 24 * 60 * 60 * 1000;

  // แปลง yyyy-mm-dd เป็น Date แบบไม่โดน timezone ลบ 1 วัน
  function parseLocalDate(str) {
    if (!str) return null;
    // กันเคส placeholder ที่ browser แปล
    if (str === "วว/ดด/ปปปป") return null;
    const parts = str.split("-");
    if (parts.length !== 3) return null;
    const y = Number(parts[0]);
    const m = Number(parts[1]) - 1;
    const d = Number(parts[2]);
    // คืนเป็น date local เลย
    return new Date(y, m, d);
  }

  // คืนวันนี้แบบ local (ตัดเวลาออก)
  function getTodayLocal() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  // เพิ่มวัน
  function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
  }

  // แสดงวันที่แบบไทยสั้น
  function formatThaiShort(date) {
    const mths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    return `${date.getDate()} ${mths[date.getMonth()]}`;
  }

  // แสดง yyyy-mm-dd
  function formatISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // สร้างบรรทัดยา 1 แถว
  function makeDrugRowHTML(i) {
    return `
      <div class="tl-card tl-bg-soft tl-drug-row" data-idx="${i}">
        <div class="tl-head">
          <h3 style="margin:0;font-size:1rem;color:#0f172a;">ชื่อยา</h3>
        </div>
        <div class="tl-grid2">
          <label>
            <input type="text" class="tl-drug-name" placeholder="ระบุชื่อยา" style="width:100%;" />
          </label>
          <span></span>
          <label>
            เริ่มให้ยา
            <div class="tl-inline">
              <input type="date" class="tl-drug-start" />
              <input type="time" class="tl-drug-start-time" />
            </div>
          </label>
          <label>
            หยุดยา
            <div class="tl-inline">
              <input type="date" class="tl-drug-end" />
              <input type="time" class="tl-drug-end-time" />
            </div>
          </label>
        </div>
        <button type="button" class="tl-del">ลบ</button>
      </div>
    `;
  }

  // สร้างบรรทัด ADR 1 แถว
  function makeAdrRowHTML(i) {
    return `
      <div class="tl-card tl-bg-soft-red tl-adr-row" data-idx="${i}">
        <div class="tl-head">
          <h3 style="margin:0;font-size:1rem;color:#be123c;">อาการ</h3>
        </div>
        <div class="tl-grid2">
          <label>
            <input type="text" class="tl-adr-name" placeholder="ระบุอาการ เช่น ผื่น, คัน, บวม" style="width:100%;" />
          </label>
          <span></span>
          <label>
            วันที่เกิด
            <div class="tl-inline">
              <input type="date" class="tl-adr-start" />
              <input type="time" class="tl-adr-start-time" />
            </div>
          </label>
          <label>
            วันที่หาย
            <div class="tl-inline">
              <input type="date" class="tl-adr-end" />
              <input type="time" class="tl-adr-end-time" />
            </div>
          </label>
        </div>
        <button type="button" class="tl-del">ลบ</button>
      </div>
    `;
  }

  // เรนเดอร์หน้า 5
  window.renderPage5 = function () {
    const page = document.getElementById("page5");
    // โครงหลักของหน้า 5 (เหมือนแบบที่คุณชอบ)
    page.innerHTML = `
      <div class="p5-wrapper" style="background:linear-gradient(180deg,#fff7e5 0%,#fdeaff 40%,#ffffff 100%);border-radius:1.5rem;padding:1.4rem 1.4rem 1.4rem;box-shadow:0 18px 45px rgba(236,72,153,.08);position:relative;overflow:hidden;">
        <div class="p5-glitter-layer"></div>

        <!-- ยา -->
        <div style="background:rgba(255,255,255,.85);border:1px solid rgba(15,118,110,.08);border-radius:1.1rem;padding:1.1rem 1.3rem 1.3rem;margin-bottom:1rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <h2 style="margin:0;font-size:1.3rem;color:#0f172a;">ยา</h2>
            <button type="button" id="btnAddDrug" style="background:#16a34a;color:#fff;border:none;border-radius:1.3rem;padding:.55rem 1.3rem;font-weight:700;box-shadow:0 10px 20px rgba(22,163,74,.25);cursor:pointer;">+ เพิ่มยาตัวใหม่</button>
          </div>
          <div id="tlDrugs"></div>
        </div>

        <!-- ADR -->
        <div style="background:rgba(255,255,255,.85);border:1px solid rgba(248,113,113,.12);border-radius:1.1rem;padding:1.1rem 1.3rem 1.3rem;margin-bottom:1rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <h2 style="margin:0;font-size:1.3rem;color:#be123c;">ADR (Adverse Drug Reaction)</h2>
            <button type="button" id="btnAddADR" style="background:#ef4444;color:#fff;border:none;border-radius:1.3rem;padding:.55rem 1.3rem;font-weight:700;box-shadow:0 10px 20px rgba(239,68,68,.25);cursor:pointer;">+ เพิ่ม ADR</button>
          </div>
          <div id="tlADRs"></div>
          <div class="tl-actions-under-adr">
            <button type="button" id="btnBuildTimeline" class="btn-blue-solid" style="background:#1d4ed8;margin-top:.5rem;">▶ สร้าง Timeline</button>
          </div>
        </div>

        <!-- VISUAL TIMELINE -->
        <div id="tlTimelineBox" style="background:rgba(255,255,255,.9);border:1px solid rgba(148,163,184,.18);border-radius:1.3rem;padding:1.1rem 1.1rem 1.4rem;margin-bottom:1.2rem;">
          <h2 style="margin:0 0 .8rem 0;color:#0f172a;">Visual Timeline</h2>
          <div id="tlScroll" class="tl-scroll" style="overflow-x:auto;overflow-y:hidden;border:1px dashed rgba(0,0,0,.05);border-radius:1.1rem;background:linear-gradient(180deg,#fff,#fff5ff);">
            <div id="tlInner" style="position:relative;min-height:140px;">
              <div id="tlTicks" class="tl-ticks" style="position:relative;height:30px;margin-left:180px;"></div>
              <div id="tlRows" style="position:relative;margin-top:6px;"></div>
            </div>
          </div>
        </div>

        <!-- ปุ่มท้ายหน้า -->
        <div class="tl-bottom-actions" style="display:flex;flex-direction:column;gap:10px;">
          <button type="button" id="btnPrint" class="btn-green-solid" style="background:#16a34a;">🖨 Print / PDF</button>
          <button type="button" id="btnGo6" class="btn-purple-solid" style="background:#4f46e5;">บันทึกข้อมูลและไปหน้า 6</button>
          <button type="button" id="btnClearPage5" class="btn-red-solid" style="background:#ef4444;">🗑 ล้างข้อมูลหน้านี้</button>
        </div>
      </div>
    `;

    const drugsBox = page.querySelector("#tlDrugs");
    const adrsBox = page.querySelector("#tlADRs");
    const btnAddDrug = page.querySelector("#btnAddDrug");
    const btnAddADR = page.querySelector("#btnAddADR");
    const btnBuild = page.querySelector("#btnBuildTimeline");
    const btnPrint = page.querySelector("#btnPrint");
    const btnClear = page.querySelector("#btnClearPage5");
    const tlTicks = page.querySelector("#tlTicks");
    const tlRows = page.querySelector("#tlRows");
    const tlInner = page.querySelector("#tlInner");

    // --- สร้างแถวเริ่มต้น ---
    function addDrugRow() {
      const idx = drugsBox.querySelectorAll(".tl-drug-row").length + 1;
      const wrap = document.createElement("div");
      wrap.innerHTML = makeDrugRowHTML(idx);
      const row = wrap.firstElementChild;
      // ปุ่มลบ
      row.querySelector(".tl-del").addEventListener("click", () => {
        row.remove();
      });
      drugsBox.appendChild(row);
    }

    function addAdrRow() {
      const idx = adrsBox.querySelectorAll(".tl-adr-row").length + 1;
      const wrap = document.createElement("div");
      wrap.innerHTML = makeAdrRowHTML(idx);
      const row = wrap.firstElementChild;
      row.querySelector(".tl-del").addEventListener("click", () => {
        row.remove();
      });
      adrsBox.appendChild(row);
    }

    btnAddDrug.addEventListener("click", addDrugRow);
    btnAddADR.addEventListener("click", addAdrRow);

    // เริ่มด้วย 1 แถวต่อฝั่งเหมือนเดิม
    addDrugRow();
    addAdrRow();

    // --- ฟังก์ชันวาด timeline ---
    btnBuild.addEventListener("click", buildTimeline);

    function buildTimeline() {
      const today = getTodayLocal();

      const items = [];

      // เก็บยาก่อน
      page.querySelectorAll(".tl-drug-row").forEach((row, i) => {
        const name = row.querySelector(".tl-drug-name").value.trim() || `ยาตัวที่ ${i + 1}`;
        const startStr = row.querySelector(".tl-drug-start").value;
        const endStr = row.querySelector(".tl-drug-end").value;
        const startDate = parseLocalDate(startStr);
        if (!startDate) return; // ถ้าไม่กรอกวันเริ่ม ไม่ต้องเอา
        const endDate = endStr ? parseLocalDate(endStr) : today;
        items.push({
          type: "drug",
          name,
          start: startDate,
          end: endDate
        });
      });

      // เก็บ ADR
      page.querySelectorAll(".tl-adr-row").forEach((row, i) => {
        const name = row.querySelector(".tl-adr-name").value.trim() || `ADR ${i + 1}`;
        const startStr = row.querySelector(".tl-adr-start").value;
        const endStr = row.querySelector(".tl-adr-end").value;
        const startDate = parseLocalDate(startStr);
        if (!startDate) return;
        const endDate = endStr ? parseLocalDate(endStr) : today;
        items.push({
          type: "adr",
          name,
          start: startDate,
          end: endDate
        });
      });

      // ถ้าไม่มีข้อมูล
      if (!items.length) {
        tlTicks.innerHTML = `<p style="padding:12px 0 4px 0;color:#aaa;">ยังไม่มีข้อมูลยาหรือ ADR</p>`;
        tlRows.innerHTML = "";
        return;
      }

      // หาวันเริ่มที่เล็กที่สุด
      let minDate = items[0].start;
      items.forEach((it) => {
        if (it.start < minDate) minDate = it.start;
      });

      // maxDate = วันนี้ กับวันที่สุดท้ายสุดของข้อมูล เอาอันที่ใหญ่กว่า
      let maxDate = today;
      items.forEach((it) => {
        if (it.end > maxDate) maxDate = it.end;
      });

      // จำนวนวันทั้งหมด = ตั้งแต่วันแรก -> ถึงวันนี้ (หรือถึงวันสุดท้ายที่กรอก ถ้าเกินวันนี้)
      const totalDays = Math.floor((maxDate - minDate) / MS_DAY) + 1;

      // ความกว้างต่อวัน
      const DAY_WIDTH = 120; // px
      const LABEL_OFFSET = 180; // เผื่อที่ให้ label ฝั่งซ้าย
      const trackWidth = totalDays * DAY_WIDTH;

      // ปรับความกว้าง inner เพื่อให้ scroll ได้
      tlInner.style.width = LABEL_OFFSET + trackWidth + 40 + "px";

      // วาด tick ด้านบน
      let ticksHTML = "";
      for (let d = 0; d < totalDays; d++) {
        const cur = addDays(minDate, d);
        ticksHTML += `<div class="tl-tick" style="position:absolute;left:${LABEL_OFFSET + d * DAY_WIDTH}px;top:0;height:26px;line-height:26px;font-size:.85rem;color:#0f172a;">${formatThaiShort(cur)}</div>`;
      }
      tlTicks.innerHTML = ticksHTML;

      // วาดแต่ละแถว
      let rowsHTML = "";
      items.forEach((it, idx) => {
        const startDiff = Math.floor((it.start - minDate) / MS_DAY); // กี่วันจากจุดเริ่ม
        const endDiff = Math.floor((it.end - minDate) / MS_DAY);
        const barLeft = startDiff * DAY_WIDTH;
        const barDays = endDiff - startDiff + 1;
        const barWidth = Math.max(90, barDays * DAY_WIDTH - 16); // กันหด

        rowsHTML += `
          <div class="tl-row" style="display:grid;grid-template-columns:180px 1fr;align-items:center;gap:10px;min-height:60px;">
            <div class="tl-ylabel" style="font-weight:700;color:${it.type === "adr" ? "#b91c1c" : "#0f766e"};">
              ${it.type === "adr" ? "ADR" : "ยา"}: ${it.name}
            </div>
            <div class="tl-track" style="position:relative;height:44px;width:${trackWidth}px;">
              <div class="tl-bar ${it.type === "adr" ? "adr" : "drug"}"
                style="position:absolute;top:6px;left:${barLeft}px;width:${barWidth}px;height:32px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-weight:700;color:#000;background:${it.type === "adr" ? "#ef4444" : "#0ea5e9"};box-shadow:0 14px 25px rgba(14,165,233,.35);">
                ${it.name} (${formatISO(it.start)})
              </div>
            </div>
          </div>
        `;
      });

      tlRows.innerHTML = rowsHTML;
    }

    // พิมพ์
    btnPrint.addEventListener("click", () => {
      window.print();
    });

    // ล้างหน้า 5
    btnClear.addEventListener("click", () => {
      // เคลียร์กล่อง
      drugsBox.innerHTML = "";
      adrsBox.innerHTML = "";
      tlTicks.innerHTML = "";
      tlRows.innerHTML = "";
      // เพิ่มแถวเปล่าใหม่ให้ 1 อันเหมือนตอนเปิดใหม่
      addDrugRow();
      addAdrRow();
    });

    // ปุ่มไปหน้า 6 แค่สลับแท็บ (โครงเดิมของคุณ)
    const go6 = page.querySelector("#btnGo6");
    go6.addEventListener("click", () => {
      const tabBtn = document.querySelector('.tabs button[data-target="page6"]');
      if (tabBtn) tabBtn.click();
    });
  };
})();

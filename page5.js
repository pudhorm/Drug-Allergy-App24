// page5.js
(function () {
  // ============ utils วันที่ ============
  const MS_DAY = 24 * 60 * 60 * 1000;

  // แปลง string → {y,m,d} รองรับ "2025-11-24" กับ "24/11/2025"
  function parseYMD(str) {
    if (!str) return null;

    // แบบ yyyy-mm-dd (ค่ามาตรฐานของ input type="date")
    if (str.includes("-")) {
      const [y, m, d] = str.split("-").map((x) => +x);
      if (!y || !m || !d) return null;
      return { y, m, d };
    }

    // แบบ dd/mm/yyyy (บาง browser/locale แสดงงี้)
    if (str.includes("/")) {
      const [d, m, y] = str.split("/").map((x) => +x);
      if (!y || !m || !d) return null;
      return { y, m, d };
    }

    return null;
  }

  // วันนี้แบบไทย/local → {y,m,d}
  function todayYMD() {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
  }

  // เอา {y,m,d} → timestamp UTC (เพื่อคำนวณระยะวันไม่ให้เลื่อน)
  function ymdToUTC(ymd) {
    return Date.UTC(ymd.y, ymd.m - 1, ymd.d);
  }

  // จำนวนวันระหว่าง a → b รวมวันแรก
  function diffDays(a, b) {
    const da = ymdToUTC(a);
    const db = ymdToUTC(b);
    return Math.floor((db - da) / MS_DAY);
  }

  function formatISO(ymd) {
    return (
      ymd.y +
      "-" +
      String(ymd.m).padStart(2, "0") +
      "-" +
      String(ymd.d).padStart(2, "0")
    );
  }

  function addDaysYMD(ymd, n) {
    const base = new Date(ymd.y, ymd.m - 1, ymd.d);
    base.setDate(base.getDate() + n);
    return { y: base.getFullYear(), m: base.getMonth() + 1, d: base.getDate() };
  }

  function formatThaiShort(ymd) {
    const mths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    return `${ymd.d} ${mths[ymd.m - 1]}`;
  }

  // ============ สร้างแถวกรอกข้อมูล ============
  function makeDrugRowHTML(i) {
    return `
      <div class="tl-card tl-bg-soft tl-drug-row" data-idx="${i}">
        <div class="tl-grid2" style="align-items:flex-end;">
          <label style="grid-column:1 / -1;">
            <span style="display:block;font-weight:600;margin-bottom:.35rem;">ชื่อยา</span>
            <input type="text" class="tl-drug-name" placeholder="ระบุชื่อยา" style="width:100%;" />
          </label>
          <label>
            <span>เริ่มให้ยา</span>
            <div class="tl-inline">
              <input type="date" class="tl-drug-start" />
              <input type="time" class="tl-drug-start-time" />
            </div>
          </label>
          <label>
            <span>หยุดยา</span>
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

  function makeAdrRowHTML(i) {
    return `
      <div class="tl-card tl-bg-soft-red tl-adr-row" data-idx="${i}">
        <div class="tl-grid2" style="align-items:flex-end;">
          <label style="grid-column:1 / -1;">
            <span style="display:block;font-weight:600;margin-bottom:.35rem;">อาการ</span>
            <input type="text" class="tl-adr-name" placeholder="ระบุอาการ เช่น ผื่น, คัน, บวม" style="width:100%;" />
          </label>
          <label>
            <span>วันที่เกิด</span>
            <div class="tl-inline">
              <input type="date" class="tl-adr-start" />
              <input type="time" class="tl-adr-start-time" />
            </div>
          </label>
          <label>
            <span>วันที่หาย</span>
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

  // ============ render หน้า 5 ============
  window.renderPage5 = function () {
    const page = document.getElementById("page5");

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

        <!-- Timeline -->
        <div id="tlTimelineBox" style="background:rgba(255,255,255,.9);border:1px solid rgba(148,163,184,.18);border-radius:1.3rem;padding:1.1rem 1.1rem 1.4rem;margin-bottom:1.2rem;">
          <h2 style="margin:0 0 .8rem 0;color:#0f172a;">Visual Timeline</h2>
          <div id="tlScroll" class="tl-scroll" style="overflow-x:auto;overflow-y:hidden;border:1px dashed rgba(0,0,0,.05);border-radius:1.1rem;background:linear-gradient(180deg,#fff,#fff5ff);">
            <div id="tlInner" style="position:relative;min-height:150px;">
              <div id="tlTicks" style="position:relative;height:30px;margin-left:180px;"></div>
              <div id="tlRows" style="position:relative;margin-top:6px;"></div>
            </div>
          </div>
        </div>

        <!-- ปุ่มท้าย -->
        <div class="tl-bottom-actions" style="display:flex;flex-direction:column;gap:10px;position:sticky;bottom:0;background:linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,1));padding-top:6px;">
          <button type="button" id="btnPrint" class="btn-green-solid" style="background:#16a34a;">🖨 Print / PDF</button>
          <button type="button" id="btnGo6" class="btn-purple-solid" style="background:#4f46e5;">บันทึกข้อมูลและไปหน้า 6</button>
          <button type="button" id="btnClearPage5" class="btn-red-solid" style="background:#ef4444;">🗑 ล้างข้อมูลหน้านี้</button>
        </div>
      </div>
    `;

    // ===== อ้างอิง DOM =====
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

    // ===== เพิ่มแถวเริ่มต้น =====
    function addDrugRow() {
      const div = document.createElement("div");
      div.innerHTML = makeDrugRowHTML(1);
      const row = div.firstElementChild;
      row.querySelector(".tl-del").addEventListener("click", () => row.remove());
      drugsBox.appendChild(row);
    }

    function addAdrRow() {
      const div = document.createElement("div");
      div.innerHTML = makeAdrRowHTML(1);
      const row = div.firstElementChild;
      row.querySelector(".tl-del").addEventListener("click", () => row.remove());
      adrsBox.appendChild(row);
    }

    addDrugRow();
    addAdrRow();

    btnAddDrug.addEventListener("click", addDrugRow);
    btnAddADR.addEventListener("click", addAdrRow);

    // ===== วาด timeline =====
    btnBuild.addEventListener("click", buildTimeline);

    function buildTimeline() {
      const today = todayYMD();
      const items = [];

      // เก็บยา
      page.querySelectorAll(".tl-drug-row").forEach((row, idx) => {
        const name = row.querySelector(".tl-drug-name").value.trim() || `ยาตัวที่ ${idx + 1}`;
        const sStr = row.querySelector(".tl-drug-start").value;
        const eStr = row.querySelector(".tl-drug-end").value;

        const sYMD = parseYMD(sStr);
        if (!sYMD) return; // ไม่กรอกวันเริ่ม → ไม่เอา

        let eYMD = eStr ? parseYMD(eStr) : null;
        if (!eYMD) eYMD = today;            // ไม่กรอก → ongoing ถึงวันนี้
        if (ymdToUTC(eYMD) < ymdToUTC(sYMD)) eYMD = sYMD; // ป้องกันกรอกวันสิ้นสุดก่อนวันเริ่ม

        items.push({
          type: "drug",
          name,
          start: sYMD,
          end: eYMD
        });
      });

      // เก็บ ADR
      page.querySelectorAll(".tl-adr-row").forEach((row, idx) => {
        const name = row.querySelector(".tl-adr-name").value.trim() || `ADR ${idx + 1}`;
        const sStr = row.querySelector(".tl-adr-start").value;
        const eStr = row.querySelector(".tl-adr-end").value;
        const sYMD = parseYMD(sStr);
        if (!sYMD) return;

        let eYMD = eStr ? parseYMD(eStr) : null;
        if (!eYMD) eYMD = today;
        if (ymdToUTC(eYMD) < ymdToUTC(sYMD)) eYMD = sYMD;

        items.push({
          type: "adr",
          name,
          start: sYMD,
          end: eYMD
        });
      });

      if (!items.length) {
        tlTicks.innerHTML = `<p style="padding:10px 0;color:#bbb;">ยังไม่มีข้อมูลยาหรือ ADR</p>`;
        tlRows.innerHTML = "";
        return;
      }

      // หา minDate จาก start
      let minY = items[0].start;
      items.forEach((it) => {
        if (ymdToUTC(it.start) < ymdToUTC(minY)) minY = it.start;
      });

      // max = วันนี้ กับ end ที่มากที่สุด
      let maxY = today;
      items.forEach((it) => {
        if (ymdToUTC(it.end) > ymdToUTC(maxY)) maxY = it.end;
      });

      const totalDays = diffDays(minY, maxY) + 1;
      const DAY_W = 120;
      const LABEL_W = 180;
      const trackWidth = totalDays * DAY_W;

      tlInner.style.width = LABEL_W + trackWidth + 40 + "px";

      // วาดแกน X ทุกวัน
      let ticksHTML = "";
      for (let i = 0; i < totalDays; i++) {
        const cur = addDaysYMD(minY, i);
        ticksHTML += `<div style="position:absolute;left:${LABEL_W + i * DAY_W}px;top:0;height:30px;line-height:30px;font-size:.85rem;color:#0f172a;">${formatThaiShort(cur)}</div>`;
      }
      tlTicks.innerHTML = ticksHTML;

      // วาดแต่ละแถว
      let rowsHTML = "";
      items.forEach((it) => {
        const offStart = diffDays(minY, it.start);
        const offEnd = diffDays(minY, it.end);
        const barLeft = offStart * DAY_W;
        const barWidth = Math.max(90, (offEnd - offStart + 1) * DAY_W - 16);

        rowsHTML += `
          <div class="tl-row" style="display:grid;grid-template-columns:${LABEL_W}px 1fr;align-items:center;gap:10px;min-height:60px;">
            <div class="tl-ylabel" style="font-weight:700;color:${it.type === "adr" ? "#b91c1c" : "#0f766e"};">
              ${it.type === "adr" ? "ADR" : "ยา"}: ${it.name}
            </div>
            <div class="tl-track" style="position:relative;height:44px;width:${trackWidth}px;">
              <div class="tl-bar ${it.type === "adr" ? "adr" : "drug"}"
                style="position:absolute;top:6px;left:${barLeft}px;width:${barWidth}px;height:32px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-weight:700;color:#000;background:${it.type === "adr" ? "#ef4444" : "#0ea5e9"};box-shadow:0 10px 18px rgba(14,165,233,.35);">
                ${it.name} (${formatISO(it.start)})
              </div>
            </div>
          </div>
        `;
      });

      tlRows.innerHTML = rowsHTML;
    }

    // print
    btnPrint.addEventListener("click", () => {
      window.print();
    });

    // clear
    btnClear.addEventListener("click", () => {
      drugsBox.innerHTML = "";
      adrsBox.innerHTML = "";
      tlTicks.innerHTML = "";
      tlRows.innerHTML = "";
      addDrugRow();
      addAdrRow();
    });

    // ไปหน้า 6
    const btnGo6 = page.querySelector("#btnGo6");
    btnGo6.addEventListener("click", () => {
      const tab = document.querySelector('.tabs button[data-target="page6"]');
      if (tab) tab.click();
    });
  };
})();

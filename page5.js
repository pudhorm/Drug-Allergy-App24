// page5.js
(function () {
  // ============ utils วันที่ ============
  const DAY_PX = 120;            // ความกว้างของ 1 วันบนแกน X
  const LABEL_LEFT = 180;        // พื้นที่ชื่อ Y Axis (ชื่อยา / ADR)
  const MS_DAY = 24 * 60 * 60 * 1000;

  // แปลง string → {y,m,d} รองรับทั้ง "2025-11-24" และ "24/11/2025"
  function parseYMD(str) {
    if (!str) return null;
    str = str.trim();
    if (!str) return null;

    // yyyy-mm-dd (ค่าจาก <input type="date"> จริงๆ)
    if (str.includes("-")) {
      const [y, m, d] = str.split("-").map(Number);
      if (!y || !m || !d) return null;
      return { y, m, d };
    }

    // dd/mm/yyyy (บาง browser แสดงแบบนี้)
    if (str.includes("/")) {
      const [d, m, y] = str.split("/").map(Number);
      if (!y || !m || !d) return null;
      return { y, m, d };
    }

    return null;
  }

  // วันนี้แบบ local
  function todayYMD() {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
  }

  // {y,m,d} → UTC ms เพื่อให้เทียบวันได้ไม่เหลื่อม
  function ymdToUTC(ymd) {
    return Date.UTC(ymd.y, ymd.m - 1, ymd.d);
  }

  // เปรียบ a ก่อน b มั้ย
  function isBefore(a, b) {
    return ymdToUTC(a) < ymdToUTC(b);
  }

  // เปรียบ a หลัง b มั้ย
  function isAfter(a, b) {
    return ymdToUTC(a) > ymdToUTC(b);
  }

  // จำนวนวันระหว่าง a → b
  function diffDays(a, b) {
    return Math.floor((ymdToUTC(b) - ymdToUTC(a)) / MS_DAY);
  }

  // เพิ่มวัน
  function addDays(ymd, n) {
    const d = new Date(ymd.y, ymd.m - 1, ymd.d);
    d.setDate(d.getDate() + n);
    return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() };
  }

  // แสดงไทยสั้น
  function formatThai(ymd) {
    const mths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    return `${ymd.d} ${mths[ymd.m - 1]}`;
  }

  // iso
  function formatISO(ymd) {
    return (
      ymd.y +
      "-" +
      String(ymd.m).padStart(2, "0") +
      "-" +
      String(ymd.d).padStart(2, "0")
    );
  }

  // ============ สร้างหน้า 5 ============
  window.renderPage5 = function () {
    const page = document.getElementById("page5");

    page.innerHTML = `
      <div class="p5-wrapper" style="background:linear-gradient(180deg,#fff7e5 0%,#fdeaff 40%,#ffffff 100%);border-radius:1.5rem;padding:1.4rem 1.4rem 1.4rem;box-shadow:0 18px 45px rgba(236,72,153,.08);position:relative;overflow:hidden;">
        <div class="p5-glitter-layer"></div>

        <!-- ยา -->
        <div style="background:rgba(255,255,255,.9);border:1px solid rgba(15,118,110,.05);border-radius:1.1rem;padding:1.1rem 1.3rem 1.3rem;margin-bottom:1rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <h2 style="margin:0;font-size:1.3rem;color:#0f172a;">ยา</h2>
            <button type="button" id="btnAddDrug" style="background:#16a34a;color:#fff;border:none;border-radius:1.3rem;padding:.55rem 1.3rem;font-weight:700;box-shadow:0 10px 20px rgba(22,163,74,.25);cursor:pointer;">+ เพิ่มยาตัวใหม่</button>
          </div>
          <div id="tlDrugs"></div>
        </div>

        <!-- ADR -->
        <div style="background:rgba(255,255,255,.9);border:1px solid rgba(248,113,113,.08);border-radius:1.1rem;padding:1.1rem 1.3rem 1.3rem;margin-bottom:1rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <h2 style="margin:0;font-size:1.3rem;color:#be123c;">ADR (Adverse Drug Reaction)</h2>
            <button type="button" id="btnAddADR" style="background:#ef4444;color:#fff;border:none;border-radius:1.3rem;padding:.55rem 1.3rem;font-weight:700;box-shadow:0 10px 20px rgba(239,68,68,.25);cursor:pointer;">+ เพิ่ม ADR</button>
          </div>
          <div id="tlADRs"></div>
          <button type="button" id="btnBuildTimeline" class="btn-blue-solid" style="background:#1d4ed8;margin-top:.5rem;">▶ สร้าง Timeline</button>
        </div>

        <!-- Timeline -->
        <div id="tlTimelineBox" style="background:rgba(255,255,255,.9);border:1px solid rgba(148,163,184,.18);border-radius:1.3rem;padding:1.1rem 1.1rem 1.4rem;margin-bottom:1.2rem;">
          <h2 style="margin:0 0 .8rem 0;color:#0f172a;">Visual Timeline</h2>
          <div id="tlScroll" class="tl-scroll" style="overflow-x:auto;overflow-y:hidden;border:1px dashed rgba(0,0,0,.03);border-radius:1.1rem;background:linear-gradient(180deg,#fff,#fff5ff);">
            <div id="tlInner" style="position:relative;min-height:150px;">
              <div id="tlTicks" style="position:relative;height:30px;margin-left:${LABEL_LEFT}px;"></div>
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

    const drugsBox = page.querySelector("#tlDrugs");
    const adrsBox = page.querySelector("#tlADRs");
    const btnAddDrug = page.querySelector("#btnAddDrug");
    const btnAddADR = page.querySelector("#btnAddADR");
    const btnBuild = page.querySelector("#btnBuildTimeline");
    const btnPrint = page.querySelector("#btnPrint");
    const btnClear = page.querySelector("#btnClearPage5");
    const btnGo6 = page.querySelector("#btnGo6");
    const tlTicks = page.querySelector("#tlTicks");
    const tlRows = page.querySelector("#tlRows");
    const tlInner = page.querySelector("#tlInner");

    // ---------- template แถว ----------
    function makeDrugRow() {
      const wrap = document.createElement("div");
      wrap.innerHTML = `
        <div class="tl-card tl-bg-soft tl-drug-row" style="position:relative;border:1px solid rgba(22,101,52,.08);border-radius:1.1rem;padding:1rem 1rem 1rem;margin-bottom:.8rem;background:rgba(255,255,255,.7);">
          <div class="tl-grid2" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:flex-end;">
            <label style="grid-column:1 / -1;">
              <span style="display:block;font-weight:600;margin-bottom:.3rem;">ชื่อยา</span>
              <input type="text" class="tl-drug-name" placeholder="ระบุชื่อยา" style="width:100%;" />
            </label>
            <label>
              <span>เริ่มให้ยา</span>
              <div class="tl-inline" style="display:flex;gap:6px;">
                <input type="date" class="tl-drug-start" />
                <input type="time" class="tl-drug-start-time" />
              </div>
            </label>
            <label>
              <span>หยุดยา</span>
              <div class="tl-inline" style="display:flex;gap:6px;">
                <input type="date" class="tl-drug-end" />
                <input type="time" class="tl-drug-end-time" />
              </div>
            </label>
          </div>
          <button type="button" class="tl-del" style="position:absolute;right:1rem;bottom:1rem;background:rgba(254,226,226,1);border:none;border-radius:1rem;padding:.35rem .9rem;font-weight:700;color:#b91c1c;cursor:pointer;">ลบ</button>
        </div>
      `;
      const row = wrap.firstElementChild;
      row.querySelector(".tl-del").addEventListener("click", () => row.remove());
      return row;
    }

    function makeAdrRow() {
      const wrap = document.createElement("div");
      wrap.innerHTML = `
        <div class="tl-card tl-bg-soft-red tl-adr-row" style="position:relative;border:1px solid rgba(248,113,113,.09);border-radius:1.1rem;padding:1rem 1rem 1rem;margin-bottom:.8rem;background:rgba(255,255,255,.7);">
          <div class="tl-grid2" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:flex-end;">
            <label style="grid-column:1 / -1;">
              <span style="display:block;font-weight:600;margin-bottom:.3rem;">อาการ</span>
              <input type="text" class="tl-adr-name" placeholder="ระบุอาการ เช่น ผื่น, คัน, บวม" style="width:100%;" />
            </label>
            <label>
              <span>วันที่เกิด</span>
              <div class="tl-inline" style="display:flex;gap:6px;">
                <input type="date" class="tl-adr-start" />
                <input type="time" class="tl-adr-start-time" />
              </div>
            </label>
            <label>
              <span>วันที่หาย</span>
              <div class="tl-inline" style="display:flex;gap:6px;">
                <input type="date" class="tl-adr-end" />
                <input type="time" class="tl-adr-end-time" />
              </div>
            </label>
          </div>
          <button type="button" class="tl-del" style="position:absolute;right:1rem;bottom:1rem;background:rgba(254,226,226,1);border:none;border-radius:1rem;padding:.35rem .9rem;font-weight:700;color:#b91c1c;cursor:pointer;">ลบ</button>
        </div>
      `;
      const row = wrap.firstElementChild;
      row.querySelector(".tl-del").addEventListener("click", () => row.remove());
      return row;
    }

    // แถวเริ่มต้น
    drugsBox.appendChild(makeDrugRow());
    adrsBox.appendChild(makeAdrRow());

    btnAddDrug.addEventListener("click", () => {
      drugsBox.appendChild(makeDrugRow());
    });
    btnAddADR.addEventListener("click", () => {
      adrsBox.appendChild(makeAdrRow());
    });

    // ---------- สร้าง timeline ----------
    btnBuild.addEventListener("click", buildTimeline);

    function buildTimeline() {
      const today = todayYMD();
      const items = [];

      // เก็บยา
      page.querySelectorAll(".tl-drug-row").forEach((row, i) => {
        const name = row.querySelector(".tl-drug-name").value.trim() || `ยาตัวที่ ${i + 1}`;
        const sStr = row.querySelector(".tl-drug-start").value;
        const eStr = row.querySelector(".tl-drug-end").value;

        const sY = parseYMD(sStr);
        if (!sY) return; // ยังไม่ใส่วันเริ่ม → ไม่เอา

        let eY = eStr ? parseYMD(eStr) : null;
        if (!eY) {
          // ไม่ใส่ → ongoing = วันนี้
          eY = today;
        }
        // ถ้าเผลอใส่วันหยุด < วันเริ่ม ให้เท่ากับวันเริ่ม
        if (isBefore(eY, sY)) eY = sY;

        items.push({
          type: "drug",
          name,
          start: sY,
          end: eY
        });
      });

      // เก็บ ADR
      page.querySelectorAll(".tl-adr-row").forEach((row, i) => {
        const name = row.querySelector(".tl-adr-name").value.trim() || `ADR ${i + 1}`;
        const sStr = row.querySelector(".tl-adr-start").value;
        const eStr = row.querySelector(".tl-adr-end").value;

        const sY = parseYMD(sStr);
        if (!sY) return;

        let eY = eStr ? parseYMD(eStr) : null;
        if (!eY) {
          eY = today;
        }
        if (isBefore(eY, sY)) eY = sY;

        items.push({
          type: "adr",
          name,
          start: sY,
          end: eY
        });
      });

      if (!items.length) {
        tlTicks.innerHTML = `<p style="padding:8px 0;color:#94a3b8;">ยังไม่มีข้อมูลยาหรือ ADR</p>`;
        tlRows.innerHTML = "";
        return;
      }

      // ---- หาวันเริ่มแกน X (วันแรกสุดจากทุกตัว) ----
      let axisStart = items[0].start;
      items.forEach((it) => {
        if (isBefore(it.start, axisStart)) {
          axisStart = it.start;
        }
      });

      // ---- หาวันสุดท้ายแกน X = max(วันนี้, วันจบที่กรอก) ----
      let axisEnd = today;
      items.forEach((it) => {
        if (isAfter(it.end, axisEnd)) {
          axisEnd = it.end;
        }
      });

      const totalDays = diffDays(axisStart, axisEnd) + 1;
      const timelineWidth = LABEL_LEFT + totalDays * DAY_PX + 40;
      tlInner.style.width = timelineWidth + "px";

      // ---- วาดแกน X ให้ถึง "วันนี้" ทุกครั้ง ----
      let ticksHTML = "";
      for (let i = 0; i < totalDays; i++) {
        const cur = addDays(axisStart, i);
        ticksHTML += `<div style="position:absolute;left:${LABEL_LEFT + i * DAY_PX}px;top:0;height:30px;line-height:30px;font-size:.9rem;color:#0f172a;">${formatThai(cur)}</div>`;
      }
      tlTicks.innerHTML = ticksHTML;

      // ---- วาดรายการ ----
      let rowsHTML = "";
      items.forEach((it) => {
        const startOffset = diffDays(axisStart, it.start); // กี่วันจากแกนเริ่ม
        const endOffset = diffDays(axisStart, it.end);
        const leftPx = startOffset * DAY_PX;               // <<<<< จุดเริ่มแท่งตรงวัน
        const widthPx = Math.max(90, (endOffset - startOffset + 1) * DAY_PX - 16);

        rowsHTML += `
          <div class="tl-row" style="display:grid;grid-template-columns:${LABEL_LEFT}px 1fr;align-items:center;gap:10px;min-height:56px;">
            <div class="tl-ylabel" style="font-weight:700;color:${it.type === "adr" ? "#b91c1c" : "#0f766e"};">
              ${it.type === "adr" ? "ADR" : "ยา"}: ${it.name}
            </div>
            <div class="tl-track" style="position:relative;height:44px;width:${totalDays * DAY_PX}px;">
              <div class="tl-bar ${it.type === "adr" ? "adr" : "drug"}"
                style="position:absolute;top:6px;left:${leftPx}px;width:${widthPx}px;height:32px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-weight:700;color:#000;background:${it.type === "adr" ? "#ef4444" : "#0ea5e9"};box-shadow:0 10px 18px rgba(14,165,233,.25);">
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

    // ล้าง
    btnClear.addEventListener("click", () => {
      drugsBox.innerHTML = "";
      adrsBox.innerHTML = "";
      tlTicks.innerHTML = "";
      tlRows.innerHTML = "";
      drugsBox.appendChild(makeDrugRow());
      adrsBox.appendChild(makeAdrRow());
    });

    // ไปหน้า 6
    btnGo6.addEventListener("click", () => {
      const tab = document.querySelector('.tabs button[data-target="page6"]');
      if (tab) tab.click();
    });
  };
})();

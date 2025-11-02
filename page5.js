// ====================== page5.js ======================
// เตรียมโครงข้อมูลหน้า 5 ไว้ในตัวแปรกลาง
(function () {
  const root = (window.drugAllergyData = window.drugAllergyData || {});
  if (!root.page5) {
    root.page5 = {
      drugLines: [],
      adrLines: []
    };
  } else {
    root.page5.drugLines = Array.isArray(root.page5.drugLines)
      ? root.page5.drugLines
      : [];
    root.page5.adrLines = Array.isArray(root.page5.adrLines)
      ? root.page5.adrLines
      : [];
  }
})();

// ============= ฟังก์ชันหลักของหน้า 5 =============
window.renderPage5 = function () {
  const pageEl = document.getElementById("page5");
  if (!pageEl) return;

  const store = window.drugAllergyData.page5;
  const drugs = store.drugLines;
  const adrs = store.adrLines;

  // ---------- HTML หลัก ----------
  pageEl.innerHTML = `
    <div class="p5-wrapper">
      <div class="p5-header-line">
        <h2>📅 หน้า 5 Timeline ประเมินการแพ้ยา</h2>
        <div class="p5-btn-group">
          <button id="p5AddDrug" class="p5-btn-add-drug">+ เพิ่มยา</button>
          <button id="p5AddAdr" class="p5-btn-add-adr">+ เพิ่ม ADR</button>
        </div>
      </div>

      <!-- รายการยา -->
      <div class="p5-form-block">
        <h3 style="display:flex;align-items:center;gap:.5rem;margin:0 0 .5rem;">
          <span style="font-size:1.3rem;">💊</span> รายการยา
        </h3>
        ${drugs
          .map((d, idx) => {
            return `
              <div class="p5-drug-card" data-idx="${idx}">
                <div class="p5-field">
                  <label>ยาตัวที่ ${idx + 1}</label>
                  <input type="text" class="p5-drug-name" value="${
                    d.name || d.drugName || ""
                  }" placeholder="ระบุชื่อยา" />
                </div>
                <div class="p5-field">
                  <label>เริ่มให้ยา</label>
                  <input type="date" class="p5-drug-start" value="${
                    d.startDate || ""
                  }" />
                </div>
                <div class="p5-field">
                  <label>เวลา</label>
                  <input type="time" class="p5-drug-start-time" value="${
                    d.startTime || ""
                  }" />
                </div>
                <div class="p5-field">
                  <label>หยุดยา</label>
                  <input type="date" class="p5-drug-stop" value="${
                    d.stopDate || ""
                  }" />
                </div>
                <div class="p5-field">
                  <label>เวลา</label>
                  <input type="time" class="p5-drug-stop-time" value="${
                    d.stopTime || ""
                  }" />
                </div>
                <div class="p5-field" style="align-self:center;">
                  <button class="p5-line-del" data-kind="drug" data-idx="${idx}">ลบ</button>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>

      <!-- ADR -->
      <div class="p5-form-block">
        <h3 style="display:flex;align-items:center;gap:.5rem;margin:0 0 .5rem;">
          <span style="font-size:1.3rem;">🧪</span> ADR (Adverse Drug Reaction)
        </h3>
        ${adrs
          .map((a, idx) => {
            return `
              <div class="p5-adr-card" data-idx="${idx}">
                <div class="p5-field">
                  <label>ADR ${idx + 1} (อาการ)</label>
                  <input type="text" class="p5-adr-symptom" value="${
                    a.symptom || ""
                  }" placeholder="เช่น ผื่น, บวม, แน่นหน้าอก" />
                </div>
                <div class="p5-field">
                  <label>วันที่เกิด</label>
                  <input type="date" class="p5-adr-start" value="${
                    a.startDate || ""
                  }" />
                </div>
                <div class="p5-field">
                  <label>เวลาที่เกิด</label>
                  <input type="time" class="p5-adr-start-time" value="${
                    a.startTime || ""
                  }" />
                </div>
                <div class="p5-field">
                  <label>วันที่หาย</label>
                  <input type="date" class="p5-adr-end" value="${
                    a.endDate || ""
                  }" />
                </div>
                <div class="p5-field">
                  <label>เวลาที่หาย</label>
                  <input type="time" class="p5-adr-end-time" value="${
                    a.endTime || ""
                  }" />
                </div>
                <div class="p5-field" style="align-self:center;">
                  <button class="p5-line-del" data-kind="adr" data-idx="${idx}">ลบ</button>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>

      <!-- Timeline -->
      <div class="p5-timeline-box">
        <h3>Visual Timeline</h3>
        <div id="p5TimelineScroll">
          <div id="p5DateRow"></div>
          <div class="p5-lane">
            <div class="p5-lane-label">ยา</div>
            <div id="p5DrugLane"></div>
          </div>
          <div class="p5-lane">
            <div class="p5-lane-label p5-lane-adr">ADR</div>
            <div id="p5AdrLane"></div>
          </div>
        </div>
      </div>

      <!-- ปุ่มล่าง -->
      <div class="p5-footer-btns">
        <button id="p5GoSummary" class="p5-next">ไปหน้า 6 (สรุป)</button>
        <button id="p5Clear" class="p5-clear">ล้าง & โหลดใหม่</button>
      </div>
    </div>
  `;

  // ---------- ผูก event หลังจาก DOM พร้อมแล้ว ----------

  // ปุ่มเพิ่มยา
  const btnAddDrug = document.getElementById("p5AddDrug");
  if (btnAddDrug) {
    btnAddDrug.addEventListener("click", function () {
      window.drugAllergyData.page5.drugLines.push({
        name: "",
        startDate: "",
        startTime: "",
        stopDate: "",
        stopTime: ""
      });
      window.renderPage5();
    });
  }

  // ปุ่มเพิ่ม ADR
  const btnAddAdr = document.getElementById("p5AddAdr");
  if (btnAddAdr) {
    btnAddAdr.addEventListener("click", function () {
      window.drugAllergyData.page5.adrLines.push({
        symptom: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: ""
      });
      window.renderPage5();
    });
  }

  // ปุ่มลบแต่ละแถว
  const delBtns = pageEl.querySelectorAll(".p5-line-del");
  delBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const kind = this.dataset.kind;
      const idx = Number(this.dataset.idx);
      if (kind === "drug") {
        window.drugAllergyData.page5.drugLines.splice(idx, 1);
      } else if (kind === "adr") {
        window.drugAllergyData.page5.adrLines.splice(idx, 1);
      }
      window.renderPage5();
    });
  });

  // input ของยา
  pageEl.querySelectorAll(".p5-drug-card").forEach((card) => {
    const idx = Number(card.dataset.idx);
    const nameInput = card.querySelector(".p5-drug-name");
    const startInput = card.querySelector(".p5-drug-start");
    const startTInput = card.querySelector(".p5-drug-start-time");
    const stopInput = card.querySelector(".p5-drug-stop");
    const stopTInput = card.querySelector(".p5-drug-stop-time");

    if (nameInput)
      nameInput.addEventListener("input", (e) => {
        window.drugAllergyData.page5.drugLines[idx].name = e.target.value;
        drawTimeline();
      });
    if (startInput)
      startInput.addEventListener("change", (e) => {
        window.drugAllergyData.page5.drugLines[idx].startDate = e.target.value;
        drawTimeline();
      });
    if (startTInput)
      startTInput.addEventListener("change", (e) => {
        window.drugAllergyData.page5.drugLines[idx].startTime = e.target.value;
      });
    if (stopInput)
      stopInput.addEventListener("change", (e) => {
        window.drugAllergyData.page5.drugLines[idx].stopDate = e.target.value;
        drawTimeline();
      });
    if (stopTInput)
      stopTInput.addEventListener("change", (e) => {
        window.drugAllergyData.page5.drugLines[idx].stopTime = e.target.value;
      });
  });

  // input ของ ADR
  pageEl.querySelectorAll(".p5-adr-card").forEach((card) => {
    const idx = Number(card.dataset.idx);
    const symInput = card.querySelector(".p5-adr-symptom");
    const startInput = card.querySelector(".p5-adr-start");
    const startTInput = card.querySelector(".p5-adr-start-time");
    const endInput = card.querySelector(".p5-adr-end");
    const endTInput = card.querySelector(".p5-adr-end-time");

    if (symInput)
      symInput.addEventListener("input", (e) => {
        window.drugAllergyData.page5.adrLines[idx].symptom = e.target.value;
        drawTimeline();
      });
    if (startInput)
      startInput.addEventListener("change", (e) => {
        window.drugAllergyData.page5.adrLines[idx].startDate = e.target.value;
        drawTimeline();
      });
    if (startTInput)
      startTInput.addEventListener("change", (e) => {
        window.drugAllergyData.page5.adrLines[idx].startTime = e.target.value;
      });
    if (endInput)
      endInput.addEventListener("change", (e) => {
        window.drugAllergyData.page5.adrLines[idx].endDate = e.target.value;
        drawTimeline();
      });
    if (endTInput)
      endTInput.addEventListener("change", (e) => {
        window.drugAllergyData.page5.adrLines[idx].endTime = e.target.value;
      });
  });

  // ปุ่มไปหน้า 6
  const go6 = document.getElementById("p5GoSummary");
  if (go6) {
    go6.addEventListener("click", () => {
      const tabBtn = document.querySelector('.tabs button[data-target="page6"]');
      if (tabBtn) tabBtn.click();
      if (window.renderPage6) window.renderPage6();
    });
  }

  // ปุ่มล้างเฉพาะหน้า 5
  const clearBtn = document.getElementById("p5Clear");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      window.drugAllergyData.page5 = { drugLines: [], adrLines: [] };
      window.renderPage5();
    });
  }

  // วาด Timeline รอบแรก
  drawTimeline();
};

// ============= drawTimeline: ซ้ายตรง ขวาลด 1 วัน =============
function drawTimeline() {
  const dateRow = document.getElementById("p5DateRow");
  const drugLane = document.getElementById("p5DrugLane");
  const adrLane = document.getElementById("p5AdrLane");
  if (!dateRow || !drugLane || !adrLane) return;

  const store = window.drugAllergyData || {};
  const page5 = store.page5 || { drugLines: [], adrLines: [] };

  const drugs = Array.isArray(page5.drugLines) ? page5.drugLines : [];
  const adrs = Array.isArray(page5.adrLines) ? page5.adrLines : [];

  if (!drugs.length && !adrs.length) {
    dateRow.innerHTML = "";
    drugLane.innerHTML = "";
    adrLane.innerHTML = "";
    return;
  }

  const MS_DAY = 24 * 60 * 60 * 1000;
  const DAY_W = 120;

  function parseDate(str) {
    if (!str) return null;
    const pure = String(str).trim().split(" ")[0];
    if (pure.includes("/")) {
      const [d, m, y] = pure.split("/").map(Number);
      if (!d || !m || !y) return null;
      return new Date(y, m - 1, d);
    }
    if (pure.includes("-")) {
      const [y, m, d] = pure.split("-").map(Number);
      if (!y || !m || !d) return null;
      return new Date(y, m - 1, d);
    }
    return null;
  }
  function addDays(date, n) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // หา minDate
  let minDate = null;
  drugs.forEach((d) => {
    const s = parseDate(d.startDate || d.start || d.giveDate);
    if (s && (!minDate || s < minDate)) minDate = s;
  });
  adrs.forEach((a) => {
    const s = parseDate(a.startDate || a.eventDate || a.symptomDate);
    if (s && (!minDate || s < minDate)) minDate = s;
  });
  if (!minDate) minDate = today;

  // max คือวันนี้
  const maxDate = today;

  // วาดหัวตารางวัน
  const totalDays = Math.floor((maxDate - minDate) / MS_DAY) + 1;
  dateRow.innerHTML = "";
  for (let i = 0; i < totalDays; i++) {
    const d = addDays(minDate, i);
    const cell = document.createElement("div");
    cell.className = "p5-date-cell";
    cell.style.width = DAY_W + "px";
    cell.textContent = d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short"
    });
    dateRow.appendChild(cell);
  }

  // เคลียร์เลน
  drugLane.innerHTML = "";
  adrLane.innerHTML = "";

  function dateToLeftPx(date) {
    const diffDay = Math.floor((date - minDate) / MS_DAY);
    return diffDay * DAY_W;
  }

  function calcWidthPx(startDate, endDate) {
    const diffDay = Math.floor((endDate - startDate) / MS_DAY) + 1; // รวมวันเริ่ม
    let w = diffDay * DAY_W;
    if (w < DAY_W * 0.6) w = DAY_W * 0.6;
    return w;
  }

  // วาดยา
  drugs.forEach((d, idx) => {
    const start = parseDate(d.startDate || d.start || d.giveDate);
    if (!start) return;

    const rawEnd = d.stopDate || d.endDate || d.stop;
    let endDate = rawEnd ? parseDate(rawEnd) : maxDate;

    // มีระบุหยุด → ลด 1 วัน
    if (rawEnd && endDate) {
      const adj = addDays(endDate, -1);
      endDate = adj >= start ? adj : start;
    }

    if (!endDate) endDate = maxDate;
    if (endDate > maxDate) endDate = maxDate;
    if (endDate < start) endDate = start;

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-drug";
    bar.textContent = d.name || d.drugName || `ยาตัวที่ ${idx + 1}`;
    bar.style.left = dateToLeftPx(start) + "px";
    bar.style.width = calcWidthPx(start, endDate) + "px";
    drugLane.appendChild(bar);
  });

  // วาด ADR
  adrs.forEach((a, idx) => {
    const start = parseDate(a.startDate || a.eventDate || a.symptomDate);
    if (!start) return;

    const rawEnd = a.endDate || a.resolveDate;
    let endDate = rawEnd ? parseDate(rawEnd) : maxDate;

    if (rawEnd && endDate) {
      const adj = addDays(endDate, -1);
      endDate = adj >= start ? adj : start;
    }

    if (!endDate) endDate = maxDate;
    if (endDate > maxDate) endDate = maxDate;
    if (endDate < start) endDate = start;

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-adr";
    bar.textContent = a.symptom || a.name || `ADR ${idx + 1}`;
    bar.style.left = dateToLeftPx(start) + "px";
    bar.style.width = calcWidthPx(start, endDate) + "px";
    adrLane.appendChild(bar);
  });

  // เลื่อนไปเห็นวันล่าสุด
  const sw = document.getElementById("p5TimelineScroll");
  if (sw) {
    sw.scrollLeft = sw.scrollWidth;
  }
}

// ====================== page5.js (วางทับได้เลย) ======================

// 1) เตรียมศูนย์กลางไว้ก่อน
(function () {
  const root = (window.drugAllergyData = window.drugAllergyData || {});
  if (!root.page5) {
    root.page5 = {
      drugLines: [],
      adrLines: [],
    };
  } else {
    // กัน null / undefined
    root.page5.drugLines = Array.isArray(root.page5.drugLines)
      ? root.page5.drugLines
      : [];
    root.page5.adrLines = Array.isArray(root.page5.adrLines)
      ? root.page5.adrLines
      : [];
  }
})();

// 2) ฟังก์ชันหลักของหน้า 5
window.renderPage5 = function () {
  const pageEl = document.getElementById("page5");
  if (!pageEl) return;

  const store = window.drugAllergyData.page5;
  const drugs = store.drugLines;
  const adrs = store.adrLines;

  // ---------- HTML หลักของหน้า 5 ----------
  const html = `
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
          .map(
            (d, idx) => `
          <div class="p5-drug-card" data-idx="${idx}">
            <div class="p5-field">
              <label>ยาตัวที่ ${idx + 1}</label>
              <input type="text" class="p5-drug-name" value="${d.name || ""}" placeholder="ระบุชื่อยา" />
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
              <button class="p5-line-del" data-kind="drug" data-idx="${idx}">
                ลบ
              </button>
            </div>
          </div>
        `
          )
          .join("")}
      </div>

      <!-- ADR -->
      <div class="p5-form-block">
        <h3 style="display:flex;align-items:center;gap:.5rem;margin:0 0 .5rem;">
          <span style="font-size:1.3rem;">🧪</span> ADR (Adverse Drug Reaction)
        </h3>
        ${adrs
          .map(
            (a, idx) => `
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
              <button class="p5-line-del" data-kind="adr" data-idx="${idx}">
                ลบ
              </button>
            </div>
          </div>
        `
          )
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

      <!-- ปุ่มล่างแบบใหม่ -->
      <div class="p5-footer-btns">
        <button id="p5SaveGoP4" class="p5-save">บันทึกข้อมูลและไปหน้า 4</button>
        <button id="p5Clear" class="p5-clear">🗑 ล้างข้อมูลหน้านี้</button>
      </div>
    </div>
  `;

  pageEl.innerHTML = html;

  // ---------- ผูก event ----------

  // เพิ่มยา
  const btnAddDrug = document.getElementById("p5AddDrug");
  if (btnAddDrug) {
    btnAddDrug.addEventListener("click", () => {
      window.drugAllergyData.page5.drugLines.push({
        name: "",
        startDate: "",
        startTime: "",
        stopDate: "",
        stopTime: "",
      });
      window.renderPage5();
    });
  }

  // เพิ่ม ADR
  const btnAddAdr = document.getElementById("p5AddAdr");
  if (btnAddAdr) {
    btnAddAdr.addEventListener("click", () => {
      window.drugAllergyData.page5.adrLines.push({
        symptom: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
      });
      window.renderPage5();
    });
  }

  // ลบแถว (ยา / ADR)
  pageEl.querySelectorAll(".p5-line-del").forEach((btn) => {
    btn.addEventListener("click", () => {
      const kind = btn.dataset.kind;
      const idx = Number(btn.dataset.idx);
      if (kind === "drug") {
        window.drugAllergyData.page5.drugLines.splice(idx, 1);
      } else if (kind === "adr") {
        window.drugAllergyData.page5.adrLines.splice(idx, 1);
      }
      window.renderPage5();
    });
  });

  // อัปเดตค่า — ยา
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

  // อัปเดตค่า — ADR
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

  // ปุ่มไปหน้า 4
  const goP4 = document.getElementById("p5SaveGoP4");
  if (goP4) {
    goP4.addEventListener("click", () => {
      const tabBtn = document.querySelector('.tabs button[data-target="page4"]');
      if (tabBtn) tabBtn.click();
      if (window.renderPage4) window.renderPage4();
    });
  }

  // ปุ่มล้างหน้า 5
  const clearBtn = document.getElementById("p5Clear");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      window.drugAllergyData.page5 = { drugLines: [], adrLines: [] };
      window.renderPage5();
    });
  }

  // วาด timeline ครั้งแรก
  drawTimeline();
};

// ===== drawTimeline เวอร์ชันล็อกซ้าย-ขวาตามวันที่ =====
function drawTimeline() {
  const dateRow = document.getElementById("p5DateRow");
  const drugLane = document.getElementById("p5DrugLane");
  const adrLane  = document.getElementById("p5AdrLane");
  const scrollBox = document.getElementById("p5TimelineScroll");

  if (!dateRow || !drugLane || !adrLane) return;

  // 1) ดึงข้อมูล
  const root = window.drugAllergyData || {};
  const page5 = root.page5 || { drugLines: [], adrLines: [] };

  const drugs = Array.isArray(page5.drugLines) ? page5.drugLines : [];
  const adrs  = Array.isArray(page5.adrLines) ? page5.adrLines  : [];

  // ถ้าไม่มีอะไรให้ล้างแล้วจบ
  if (!drugs.length && !adrs.length) {
    dateRow.innerHTML = "";
    drugLane.innerHTML = "";
    adrLane.innerHTML = "";
    return;
  }

  // 2) helper วัน
  const MS_DAY = 24 * 60 * 60 * 1000;
  const DAY_W  = 120; // ต้องตรงกับ CSS

  function parseDate(str) {
    if (!str) return null;
    const pure = String(str).trim().split(" ")[0];
    // dd/mm/yyyy
    if (pure.includes("/")) {
      const [d,m,y] = pure.split("/").map(Number);
      if (!d || !m || !y) return null;
      return new Date(y, m - 1, d);
    }
    // yyyy-mm-dd
    if (pure.includes("-")) {
      const [y,m,d] = pure.split("-").map(Number);
      if (!y || !m || !d) return null;
      return new Date(y, m - 1, d);
    }
    return null;
  }

  function addDays(date, n) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
  }

  // 3) หา min และ max (max = วันนี้ เสมอ)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

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
  const maxDate = today; // ล็อกปลายขวาที่วันนี้

  // 4) วาดหัววันที่
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

  // 5) หา offset ของคำว่า "ยา" / "ADR" เพื่อให้ bar เริ่มตรงกับหัววันที่
  //    ไม่แก้ CSS แต่ให้ JS วัดเอา
  let laneOffset = 0;
  if (drugLane.parentElement) {
    const labelEl = drugLane.parentElement.querySelector(".p5-lane-label");
    if (labelEl) {
      const style = window.getComputedStyle(drugLane.parentElement);
      const gap =
        parseFloat(style.columnGap || style.gap || "0") || 0;
      laneOffset = labelEl.offsetWidth + gap;
    }
  }

  // 6) เตรียมเลน
  drugLane.innerHTML = "";
  adrLane.innerHTML = "";

  // map วัน → index
  function dayIndex(date) {
    return Math.floor((date - minDate) / MS_DAY);
  }

  // ล็อกซ้าย-ขวาให้ตรงช่องวันที่
  function barPos(startDate, endDate) {
    const sIdx = dayIndex(startDate);
    const eIdx = dayIndex(endDate);
    // อย่างน้อย 1 ช่อง
    const spanDays = Math.max(1, eIdx - sIdx + 1);
    const left = laneOffset + sIdx * DAY_W;
    // หัก padding ของ .p5-bar ออกเล็กน้อย (ไม่ให้ล้ำ)
    const PAD_FIX = 16;
    const width = spanDays * DAY_W - PAD_FIX;
    return { left, width };
  }

  // 7) วาดยา (แยกบรรทัด)
  drugs.forEach((d, idx) => {
    const start = parseDate(d.startDate || d.start || d.giveDate);
    if (!start) return;

    const endRaw = d.stopDate || d.endDate || d.stop;
    let endDate = endRaw ? parseDate(endRaw) : maxDate;
    if (!endDate) endDate = maxDate;

    // กันเลยวันนี้
    if (endDate > maxDate) endDate = maxDate;
    // กัน stop < start
    if (endDate < start) endDate = start;

    const { left, width } = barPos(start, endDate);

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-drug";
    bar.textContent = d.name || d.drugName || `ยาตัวที่ ${idx + 1}`;
    // วาดคนละบรรทัด
    bar.style.top = 6 + idx * 36 + "px";
    bar.style.left = left + "px";
    bar.style.width = width + "px";

    drugLane.appendChild(bar);
    // ปรับความสูง lane ให้รับบรรทัดหลายอัน
    drugLane.style.height = 6 + (idx + 1) * 36 + "px";
  });

  // 8) วาด ADR (แยกบรรทัด)
  adrs.forEach((a, idx) => {
    const start = parseDate(a.startDate || a.eventDate || a.symptomDate);
    if (!start) return;

    const endRaw = a.endDate || a.resolveDate;
    let endDate = endRaw ? parseDate(endRaw) : maxDate;
    if (!endDate) endDate = maxDate;

    if (endDate > maxDate) endDate = maxDate;
    if (endDate < start) endDate = start;

    const { left, width } = barPos(start, endDate);

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-adr";
    bar.textContent = a.symptom || a.name || `ADR ${idx + 1}`;
    bar.style.top = 6 + idx * 36 + "px";
    bar.style.left = left + "px";
    bar.style.width = width + "px";

    adrLane.appendChild(bar);
    adrLane.style.height = 6 + (idx + 1) * 36 + "px";
  });

  // 9) เลื่อนให้เห็นวันล่าสุด
  if (scrollBox) {
    scrollBox.scrollLeft = scrollBox.scrollWidth;
  }
}

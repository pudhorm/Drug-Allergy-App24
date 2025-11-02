// ====================== page5.js ======================

// เตรียมที่เก็บข้อมูลหน้า 5 ถ้ายังไม่มี
(function () {
  const root = (window.drugAllergyData = window.drugAllergyData || {});
  if (!root.page5) {
    root.page5 = {
      drugLines: [],
      adrLines: [],
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

// ====== เรนเดอร์หน้า 5 ======
window.renderPage5 = function () {
  const pageEl = document.getElementById("page5");
  if (!pageEl) return;

  const store = window.drugAllergyData.page5;
  const drugs = store.drugLines;
  const adrs = store.adrLines;

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
          .map(
            (d, idx) => `
            <div class="p5-drug-card" data-idx="${idx}">
              <div class="p5-field">
                <label>ยาตัวที่ ${idx + 1}</label>
                <input type="text" class="p5-drug-name" value="${d.name || ""}" placeholder="ระบุชื่อยา" />
              </div>
              <div class="p5-field">
                <label>เริ่มให้ยา</label>
                <input type="date" class="p5-drug-start" value="${d.startDate || ""}" />
              </div>
              <div class="p5-field">
                <label>เวลา</label>
                <input type="time" class="p5-drug-start-time" value="${d.startTime || ""}" />
              </div>
              <div class="p5-field">
                <label>หยุดยา</label>
                <input type="date" class="p5-drug-stop" value="${d.stopDate || ""}" />
              </div>
              <div class="p5-field">
                <label>เวลา</label>
                <input type="time" class="p5-drug-stop-time" value="${d.stopTime || ""}" />
              </div>
              <div class="p5-field" style="align-self:center;">
                <button class="p5-line-del" data-kind="drug" data-idx="${idx}">ลบ</button>
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
                <input type="text" class="p5-adr-symptom" value="${a.symptom || ""}" placeholder="เช่น ผื่น, บวม, แน่นหน้าอก" />
              </div>
              <div class="p5-field">
                <label>วันที่เกิด</label>
                <input type="date" class="p5-adr-start" value="${a.startDate || ""}" />
              </div>
              <div class="p5-field">
                <label>เวลาที่เกิด</label>
                <input type="time" class="p5-adr-start-time" value="${a.startTime || ""}" />
              </div>
              <div class="p5-field">
                <label>วันที่หาย</label>
                <input type="date" class="p5-adr-end" value="${a.endDate || ""}" />
              </div>
              <div class="p5-field">
                <label>เวลาที่หาย</label>
                <input type="time" class="p5-adr-end-time" value="${a.endTime || ""}" />
              </div>
              <div class="p5-field" style="align-self:center;">
                <button class="p5-line-del" data-kind="adr" data-idx="${idx}">ลบ</button>
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

      <!-- ปุ่มล่างตามแบบที่ต้องการ -->
      <div class="p5-footer-btns">
        <button id="p5GoSummary" class="p5-next">บันทึกข้อมูลและไปหน้า 6</button>
        <button id="p5Clear" class="p5-clear">🗑 ล้างข้อมูลหน้านี้</button>
      </div>
    </div>
  `;

  // === ผูก event ===
  const btnAddDrug = document.getElementById("p5AddDrug");
  if (btnAddDrug) {
    btnAddDrug.onclick = () => {
      window.drugAllergyData.page5.drugLines.push({
        name: "",
        startDate: "",
        startTime: "",
        stopDate: "",
        stopTime: "",
      });
      window.renderPage5();
    };
  }

  const btnAddAdr = document.getElementById("p5AddAdr");
  if (btnAddAdr) {
    btnAddAdr.onclick = () => {
      window.drugAllergyData.page5.adrLines.push({
        symptom: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
      });
      window.renderPage5();
    };
  }

  // ลบบรรทัด
  pageEl.querySelectorAll(".p5-line-del").forEach((btn) => {
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

  // อัปเดตยา
  pageEl.querySelectorAll(".p5-drug-card").forEach((card) => {
    const idx = Number(card.dataset.idx);
    const nameInput = card.querySelector(".p5-drug-name");
    const startInput = card.querySelector(".p5-drug-start");
    const stopInput = card.querySelector(".p5-drug-stop");

    if (nameInput) {
      nameInput.addEventListener("input", (e) => {
        window.drugAllergyData.page5.drugLines[idx].name = e.target.value;
        drawTimeline();
      });
    }
    if (startInput) {
      startInput.addEventListener("change", (e) => {
        window.drugAllergyData.page5.drugLines[idx].startDate = e.target.value;
        drawTimeline();
      });
    }
    if (stopInput) {
      stopInput.addEventListener("change", (e) => {
        window.drugAllergyData.page5.drugLines[idx].stopDate = e.target.value;
        drawTimeline();
      });
    }
  });

  // อัปเดต ADR
  pageEl.querySelectorAll(".p5-adr-card").forEach((card) => {
    const idx = Number(card.dataset.idx);
    const symInput = card.querySelector(".p5-adr-symptom");
    const startInput = card.querySelector(".p5-adr-start");
    const endInput = card.querySelector(".p5-adr-end");

    if (symInput) {
      symInput.addEventListener("input", (e) => {
        window.drugAllergyData.page5.adrLines[idx].symptom = e.target.value;
        drawTimeline();
      });
    }
    if (startInput) {
      startInput.addEventListener("change", (e) => {
        window.drugAllergyData.page5.adrLines[idx].startDate = e.target.value;
        drawTimeline();
      });
    }
    if (endInput) {
      endInput.addEventListener("change", (e) => {
        window.drugAllergyData.page5.adrLines[idx].endDate = e.target.value;
        drawTimeline();
      });
    }
  });

  // ไปหน้า 6
  const go6 = document.getElementById("p5GoSummary");
  if (go6) {
    go6.onclick = () => {
      const tabBtn = document.querySelector('.tabs button[data-target="page6"]');
      if (tabBtn) tabBtn.click();
      if (window.renderPage6) window.renderPage6();
    };
  }

  // ล้างหน้า 5
  const clearBtn = document.getElementById("p5Clear");
  if (clearBtn) {
    clearBtn.onclick = () => {
      window.drugAllergyData.page5 = { drugLines: [], adrLines: [] };
      window.renderPage5();
    };
  }

  // วาดครั้งแรก
  drawTimeline();
};

// ====== วาด timeline ======
function drawTimeline() {
  const dateRow = document.getElementById("p5DateRow");
  const drugLane = document.getElementById("p5DrugLane");
  const adrLane = document.getElementById("p5AdrLane");
  if (!dateRow || !drugLane || !adrLane) return;

  // ทำให้ absolute child วางตามกล่องนี้ (สำคัญมาก)
  drugLane.style.position = "relative";
  adrLane.style.position = "relative";

  const root = window.drugAllergyData || {};
  const page5 = root.page5 || { drugLines: [], adrLines: [] };
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

  // ===== parseDate รองรับทุกแบบที่คุณพิมพ์ได้จริง =====
  function parseDate(str) {
    if (!str) return null;
    const s = String(str).trim();

    // dd/mm/yyyy
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
      const [d, m, y] = s.split("/").map(Number);
      return new Date(y, m - 1, d);
    }
    // dd-mm-yyyy  ← เพิ่มอันนี้เพราะรูปล่าสุดเหมือนใช้ขีด
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(s)) {
      const [d, m, y] = s.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    // yyyy-mm-dd (จาก input type="date")
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) {
      const [y, m, d] = s.split("-").map(Number);
      return new Date(y, m - 1, d);
    }

    return null; // อ่านไม่ได้
  }

  function addDays(date, n) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
  }

  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // หา min/max จริงๆ
  let minDate = null;
  let maxDate = todayDate;

  drugs.forEach((d) => {
    const s = parseDate(d.startDate);
    if (s && (!minDate || s < minDate)) minDate = s;

    const e = parseDate(d.stopDate);
    if (e && e > maxDate) maxDate = e;
  });

  adrs.forEach((a) => {
    const s = parseDate(a.startDate);
    if (s && (!minDate || s < minDate)) minDate = s;

    const e = parseDate(a.endDate);
    if (e && e > maxDate) maxDate = e;
  });

  if (!minDate) minDate = todayDate;

  // วาดหัววัน
  const totalDays = Math.floor((maxDate - minDate) / MS_DAY) + 1;
  dateRow.innerHTML = "";

  const labelWidth = document.querySelector(".p5-lane-label")?.offsetWidth || 70;
  dateRow.style.paddingLeft = labelWidth + "px";

  for (let i = 0; i < totalDays; i++) {
    const d = addDays(minDate, i);
    const cell = document.createElement("div");
    cell.className = "p5-date-cell";
    cell.style.width = DAY_W + "px";
    cell.textContent = d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
    });
    dateRow.appendChild(cell);
  }

  // เตรียม lane
  drugLane.innerHTML = "";
  adrLane.innerHTML = "";

  const DRUG_ROW_H = 36;
  const ADR_ROW_H = 36;
  drugLane.style.height = 44 + Math.max(0, drugs.length - 1) * DRUG_ROW_H + "px";
  adrLane.style.height = 44 + Math.max(0, adrs.length - 1) * ADR_ROW_H + "px";

  function dateToX(date) {
    const diff = Math.floor((date - minDate) / MS_DAY);
    return diff * DAY_W;
  }

  function clampEnd(start, end) {
    if (!end) return todayDate;
    if (end < start) return start;
    return end;
  }

  // วาดยา คนละแถว
  drugs.forEach((d, idx) => {
    const s = parseDate(d.startDate);
    if (!s) return;
    let e = clampEnd(s, parseDate(d.stopDate));

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-drug";
    bar.textContent = d.name || `ยาตัวที่ ${idx + 1}`;

    const left = dateToX(s) + labelWidth;
    const days = Math.floor((e - s) / MS_DAY) + 1;
    let width = days * DAY_W - 10;
    if (width < DAY_W * 0.5) width = DAY_W * 0.5;

    bar.style.left = left + "px";
    bar.style.width = width + "px";
    bar.style.top = 7 + idx * DRUG_ROW_H + "px";
    bar.style.position = "absolute";

    drugLane.appendChild(bar);
  });

  // วาด ADR คนละแถว
  adrs.forEach((a, idx) => {
    const s = parseDate(a.startDate);
    if (!s) return;
    let e = clampEnd(s, parseDate(a.endDate));

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-adr";
    bar.textContent = a.symptom || `ADR ${idx + 1}`;

    const left = dateToX(s) + labelWidth;
    const days = Math.floor((e - s) / MS_DAY) + 1;
    let width = days * DAY_W - 10;
    if (width < DAY_W * 0.5) width = DAY_W * 0.5;

    bar.style.left = left + "px";
    bar.style.width = width + "px";
    bar.style.top = 7 + idx * ADR_ROW_H + "px";
    bar.style.position = "absolute";

    adrLane.appendChild(bar);
  });

  // เลื่อนให้เห็นวันล่าสุด
  const sc = document.getElementById("p5TimelineScroll");
  if (sc) sc.scrollLeft = sc.scrollWidth;
}

// ====================== page5.js ======================
// เตรียมที่เก็บข้อมูลหน้า 5 ถ้ายังไม่มี
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

// ===== ฟังก์ชันหลักของหน้า 5 =====
window.renderPage5 = function () {
  const pageEl = document.getElementById("page5");
  if (!pageEl) return;

  const store = window.drugAllergyData.page5;
  const drugs = store.drugLines;
  const adrs = store.adrLines;

  // ---------- สร้าง HTML ----------
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

      <!-- กล่อง Timeline -->
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

      <!-- ปุ่มล่าง (คง style เดิมที่คุณชอบ) -->
      <div class="p5-footer-btns">
        <button id="p5GoSummary" class="p5-next">ไปหน้า 6 (สรุป)</button>
        <button id="p5Clear" class="p5-clear">ล้าง &amp; โหลดใหม่</button>
      </div>
    </div>
  `;

  // ---------- ผูก event ----------

  // ปุ่มเพิ่มยา
  document.getElementById("p5AddDrug")?.addEventListener("click", () => {
    window.drugAllergyData.page5.drugLines.push({
      name: "",
      startDate: "",
      startTime: "",
      stopDate: "",
      stopTime: ""
    });
    window.renderPage5();
  });

  // ปุ่มเพิ่ม ADR
  document.getElementById("p5AddAdr")?.addEventListener("click", () => {
    window.drugAllergyData.page5.adrLines.push({
      symptom: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: ""
    });
    window.renderPage5();
  });

  // ปุ่มลบแต่ละบรรทัด
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

  // อัปเดตจาก input — ยา
  pageEl.querySelectorAll(".p5-drug-card").forEach((card) => {
    const idx = Number(card.dataset.idx);
    card.querySelector(".p5-drug-name")?.addEventListener("input", (e) => {
      window.drugAllergyData.page5.drugLines[idx].name = e.target.value;
      drawTimeline();
    });
    card.querySelector(".p5-drug-start")?.addEventListener("change", (e) => {
      window.drugAllergyData.page5.drugLines[idx].startDate = e.target.value;
      drawTimeline();
    });
    card.querySelector(".p5-drug-start-time")?.addEventListener("change", (e) => {
      window.drugAllergyData.page5.drugLines[idx].startTime = e.target.value;
    });
    card.querySelector(".p5-drug-stop")?.addEventListener("change", (e) => {
      window.drugAllergyData.page5.drugLines[idx].stopDate = e.target.value;
      drawTimeline();
    });
    card.querySelector(".p5-drug-stop-time")?.addEventListener("change", (e) => {
      window.drugAllergyData.page5.drugLines[idx].stopTime = e.target.value;
    });
  });

  // อัปเดตจาก input — ADR
  pageEl.querySelectorAll(".p5-adr-card").forEach((card) => {
    const idx = Number(card.dataset.idx);
    card.querySelector(".p5-adr-symptom")?.addEventListener("input", (e) => {
      window.drugAllergyData.page5.adrLines[idx].symptom = e.target.value;
      drawTimeline();
    });
    card.querySelector(".p5-adr-start")?.addEventListener("change", (e) => {
      window.drugAllergyData.page5.adrLines[idx].startDate = e.target.value;
      drawTimeline();
    });
    card.querySelector(".p5-adr-start-time")?.addEventListener("change", (e) => {
      window.drugAllergyData.page5.adrLines[idx].startTime = e.target.value;
    });
    card.querySelector(".p5-adr-end")?.addEventListener("change", (e) => {
      window.drugAllergyData.page5.adrLines[idx].endDate = e.target.value;
      drawTimeline();
    });
    card.querySelector(".p5-adr-end-time")?.addEventListener("change", (e) => {
      window.drugAllergyData.page5.adrLines[idx].endTime = e.target.value;
    });
  });

  // ปุ่มไปหน้า 6
  document.getElementById("p5GoSummary")?.addEventListener("click", () => {
    document.querySelector('.tabs button[data-target="page6"]')?.click();
    if (window.renderPage6) window.renderPage6();
  });

  // ปุ่มล้างหน้า 5
  document.getElementById("p5Clear")?.addEventListener("click", () => {
    window.drugAllergyData.page5 = { drugLines: [], adrLines: [] };
    window.renderPage5();
  });

  // วาด timeline ครั้งแรก
  drawTimeline();
};

// ===== drawTimeline: ล็อกซ้ายขวาตรงวัน + วาดคนละแถว =====
function drawTimeline() {
  const dateRow = document.getElementById("p5DateRow");
  const drugLane = document.getElementById("p5DrugLane");
  const adrLane = document.getElementById("p5AdrLane");
  if (!dateRow || !drugLane || !adrLane) return;

  const store = window.drugAllergyData || {};
  const page5 = store.page5 || { drugLines: [], adrLines: [] };
  const drugs = Array.isArray(page5.drugLines) ? page5.drugLines : [];
  const adrs = Array.isArray(page5.adrLines) ? page5.adrLines : [];

  // ถ้าไม่มีอะไรเลย เคลียร์แล้วจบ
  if (!drugs.length && !adrs.length) {
    dateRow.innerHTML = "";
    drugLane.innerHTML = "";
    adrLane.innerHTML = "";
    return;
  }

  const MS_DAY = 24 * 60 * 60 * 1000;
  const DAY_W = 120;
  const ROW_H = 40; // ความสูงต่อ 1 แถว

  function parseDate(str) {
    if (!str) return null;
    const pure = String(str).trim().split(" ")[0];
    if (pure.includes("/")) {
      // dd/mm/yyyy
      const [d, m, y] = pure.split("/").map(Number);
      if (!d || !m || !y) return null;
      return new Date(y, m - 1, d);
    }
    if (pure.includes("-")) {
      // yyyy-mm-dd
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

  // ===== หา minDate จากทุก event =====
  let minDate = null;
  function consider(date) {
    if (!date) return;
    if (!minDate || date < minDate) minDate = date;
  }
  drugs.forEach((d) => {
    consider(parseDate(d.startDate || d.start || d.giveDate));
  });
  adrs.forEach((a) => {
    consider(parseDate(a.startDate || a.eventDate || a.symptomDate));
  });
  if (!minDate) minDate = today;

  // ปลายสุด = วันนี้
  const maxDate = today;

  // ===== วาดหัววัน =====
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

  // เคลียร์ lane
  drugLane.innerHTML = "";
  adrLane.innerHTML = "";

  function dateToLeftPx(date) {
    const diff = Math.floor((date - minDate) / MS_DAY);
    return diff * DAY_W;
  }

  function clampToToday(date) {
    if (date > maxDate) return maxDate;
    return date;
  }

  // ===== วาดยา → คนละแถว =====
  drugLane.style.position = "relative";
  drugs.forEach((d, i) => {
    let start = parseDate(d.startDate || d.start || d.giveDate);
    if (!start) return;
    start = clampToToday(start);

    let end = parseDate(d.stopDate || d.endDate || d.stop);
    if (!end) end = maxDate;
    end = clampToToday(end);
    if (end < start) end = start;

    const days = Math.floor((end - start) / MS_DAY) + 1;
    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-drug";
    bar.textContent = d.name || d.drugName || `ยาตัวที่ ${i + 1}`;
    bar.style.left = dateToLeftPx(start) + "px";
    bar.style.top = 7 + i * ROW_H + "px";
    bar.style.width = days * DAY_W + "px";

    drugLane.appendChild(bar);
  });
  // ปรับความสูง lane ให้พอดีกับจำนวนยา
  const drugHeight = Math.max(44, drugs.length * ROW_H + 14);
  drugLane.style.height = drugHeight + "px";

  // ===== วาด ADR → คนละแถว =====
  adrLane.style.position = "relative";
  adrs.forEach((a, i) => {
    let start = parseDate(a.startDate || a.eventDate || a.symptomDate);
    if (!start) return;
    start = clampToToday(start);

    let end = parseDate(a.endDate || a.resolveDate);
    if (!end) end = maxDate;
    end = clampToToday(end);
    if (end < start) end = start;

    const days = Math.floor((end - start) / MS_DAY) + 1;
    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-adr";
    bar.textContent = a.symptom || a.name || `ADR ${i + 1}`;
    bar.style.left = dateToLeftPx(start) + "px";
    bar.style.top = 7 + i * ROW_H + "px";
    bar.style.width = days * DAY_W + "px";

    adrLane.appendChild(bar);
  });
  const adrHeight = Math.max(44, adrs.length * ROW_H + 14);
  adrLane.style.height = adrHeight + "px";

  // scroll ไปท้าย
  const sc = document.getElementById("p5TimelineScroll");
  if (sc) sc.scrollLeft = sc.scrollWidth;
}

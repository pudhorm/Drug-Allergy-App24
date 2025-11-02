// ====================== page5.js ======================
// เตรียมโครงเก็บข้อมูลหน้า 5 ถ้ายังไม่มี
(function () {
  const root = (window.drugAllergyData = window.drugAllergyData || {});
  if (!root.page5) {
    root.page5 = { drugLines: [], adrLines: [] };
  } else {
    root.page5.drugLines = Array.isArray(root.page5.drugLines)
      ? root.page5.drugLines
      : [];
    root.page5.adrLines = Array.isArray(root.page5.adrLines)
      ? root.page5.adrLines
      : [];
  }
})();

// ================== ฟังก์ชันหลักของหน้า 5 ==================
window.renderPage5 = function () {
  const pageEl = document.getElementById("page5");
  if (!pageEl) return;

  const store = window.drugAllergyData.page5;
  const drugs = store.drugLines;
  const adrs = store.adrLines;

  // ----- สร้าง HTML (เหมือนเดิม) -----
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

      <!-- ปุ่มล่าง (แบบที่คุณขอ) -->
      <div class="p5-footer-btns">
        <button id="p5GoSummary" class="p5-next">บันทึกข้อมูลและไปหน้า 6</button>
        <button id="p5Clear" class="p5-clear">🗑 ล้างข้อมูลหน้านี้</button>
      </div>
    </div>
  `;

  // ====== ผูกปุ่ม ======
  const btnAddDrug = document.getElementById("p5AddDrug");
  if (btnAddDrug) {
    btnAddDrug.onclick = function () {
      window.drugAllergyData.page5.drugLines.push({
        name: "",
        startDate: "",
        startTime: "",
        stopDate: "",
        stopTime: ""
      });
      window.renderPage5();
    };
  }

  const btnAddAdr = document.getElementById("p5AddAdr");
  if (btnAddAdr) {
    btnAddAdr.onclick = function () {
      window.drugAllergyData.page5.adrLines.push({
        symptom: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: ""
      });
      window.renderPage5();
    };
  }

  // ปุ่มลบในแต่ละบรรทัด
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

  // อัปเดตค่าจาก input — ยา
  pageEl.querySelectorAll(".p5-drug-card").forEach((card) => {
    const idx = Number(card.dataset.idx);
    const nameInput = card.querySelector(".p5-drug-name");
    const startInput = card.querySelector(".p5-drug-start");
    const stopInput = card.querySelector(".p5-drug-stop");

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
    if (stopInput)
      stopInput.addEventListener("change", (e) => {
        window.drugAllergyData.page5.drugLines[idx].stopDate = e.target.value;
        drawTimeline();
      });
  });

  // อัปเดตค่าจาก input — ADR
  pageEl.querySelectorAll(".p5-adr-card").forEach((card) => {
    const idx = Number(card.dataset.idx);
    const symInput = card.querySelector(".p5-adr-symptom");
    const startInput = card.querySelector(".p5-adr-start");
    const endInput = card.querySelector(".p5-adr-end");

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
    if (endInput)
      endInput.addEventListener("change", (e) => {
        window.drugAllergyData.page5.adrLines[idx].endDate = e.target.value;
        drawTimeline();
      });
  });

  // ปุ่มไปหน้า 6
  const go6 = document.getElementById("p5GoSummary");
  if (go6) {
    go6.onclick = () => {
      const tabBtn = document.querySelector('.tabs button[data-target="page6"]');
      if (tabBtn) tabBtn.click();
      if (window.renderPage6) window.renderPage6();
    };
  }

  // ปุ่มล้าง
  const clearBtn = document.getElementById("p5Clear");
  if (clearBtn) {
    clearBtn.onclick = () => {
      window.drugAllergyData.page5 = { drugLines: [], adrLines: [] };
      window.renderPage5();
    };
  }

  // วาด timeline รอบนี้
  drawTimeline();
};

// ================= drawTimeline (ล็อกซ้ายขวาตรงวัน) =================
function drawTimeline() {
  const dateRow = document.getElementById("p5DateRow");
  const drugLane = document.getElementById("p5DrugLane");
  const adrLane = document.getElementById("p5AdrLane");
  const scrollWrap = document.getElementById("p5TimelineScroll");
  if (!dateRow || !drugLane || !adrLane) return;

  const root = window.drugAllergyData || {};
  const page5 = root.page5 || { drugLines: [], adrLines: [] };
  const drugs = Array.isArray(page5.drugLines) ? page5.drugLines : [];
  const adrs = Array.isArray(page5.adrLines) ? page5.adrLines : [];

  // ไม่มีข้อมูล → ล้าง
  if (!drugs.length && !adrs.length) {
    dateRow.innerHTML = "";
    drugLane.innerHTML = "";
    adrLane.innerHTML = "";
    return;
  }

  const MS_DAY = 24 * 60 * 60 * 1000;
  const DAY_W = 120;
  const LABEL_W = 70; // ให้ตรงกับ .p5-lane-label

  function parseDate(str) {
    if (!str) return null;
    const pure = String(str).trim().split(" ")[0];
    if (pure.includes("/")) {
      const [d, m, y] = pure.split("/").map(Number);
      if (d && m && y) return new Date(y, m - 1, d);
      return null;
    }
    if (pure.includes("-")) {
      const [y, m, d] = pure.split("-").map(Number);
      if (y && m && d) return new Date(y, m - 1, d);
      return null;
    }
    return null;
  }

  function stripTime(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function addDays(d, n) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }

  const today = stripTime(new Date());

  // ===== หา first/last day จากทุกแถว =====
  let minDate = null;
  let maxEnd = today; // อย่างน้อยต้องเห็นวันนี้

  drugs.forEach((d) => {
    const s = parseDate(d.startDate);
    if (s) {
      const st = stripTime(s);
      if (!minDate || st < minDate) minDate = st;
    }
    const e = d.stopDate ? parseDate(d.stopDate) : null;
    if (e) {
      const et = stripTime(e);
      if (et > maxEnd) maxEnd = et;
    }
  });

  adrs.forEach((a) => {
    const s = parseDate(a.startDate);
    if (s) {
      const st = stripTime(s);
      if (!minDate || st < minDate) minDate = st;
    }
    const e = a.endDate ? parseDate(a.endDate) : null;
    if (e) {
      const et = stripTime(e);
      if (et > maxEnd) maxEnd = et;
    }
  });

  if (!minDate) minDate = today;
  // ถ้า maxEnd น้อยกว่าวันนี้ ให้โชว์ถึงวันนี้
  if (maxEnd < today) maxEnd = today;

  // ===== วาดหัววัน =====
  const totalDays =
    Math.floor((maxEnd.getTime() - minDate.getTime()) / MS_DAY) + 1;

  dateRow.innerHTML = "";
  // ให้หัววันเลื่อนขวาเท่ากับ label "ยา"
  dateRow.style.marginLeft = LABEL_W + "px";

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

  // ===== เตรียมเลน =====
  const totalWidthPx = totalDays * DAY_W;
  drugLane.innerHTML = "";
  adrLane.innerHTML = "";
  drugLane.style.position = "relative";
  adrLane.style.position = "relative";
  drugLane.style.width = totalWidthPx + "px";
  adrLane.style.width = totalWidthPx + "px";

  // แต่ละแท่งต้องตรงช่องวัน
  function dateToLeftPx(d) {
    const diff = Math.floor((d.getTime() - minDate.getTime()) / MS_DAY);
    return diff * DAY_W;
  }

  function widthFromStartEnd(startD, endD) {
    const diff = Math.floor(
      (endD.getTime() - startD.getTime()) / MS_DAY
    ); // 27→30 = 3
    const days = diff + 1; // รวมวันเริ่ม
    return days * DAY_W;
  }

  // ===== วาดยา (แยกชั้น) =====
  drugs.forEach((d, idx) => {
    const s = d.startDate ? parseDate(d.startDate) : null;
    if (!s) return; // ถ้าไม่กรอกวันเริ่ม ไม่ต้องวาด

    let e = d.stopDate ? parseDate(d.stopDate) : null;
    if (!e) e = today; // ongoing → จบวันนี้
    // กันเคส stop < start
    if (stripTime(e) < stripTime(s)) e = stripTime(s);
    // กันเคสเกิน timeline
    if (stripTime(e) > maxEnd) e = maxEnd;

    const start = stripTime(s);
    const end = stripTime(e);

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-drug";
    bar.textContent = d.name || `ยาตัวที่ ${idx + 1}`;
    bar.style.left = dateToLeftPx(start) + "px";
    bar.style.width = widthFromStartEnd(start, end) + "px";
    bar.style.top = 7 + idx * 38 + "px"; // เลื่อนลงทีละแท่ง

    drugLane.appendChild(bar);
  });
  // ตั้งความสูง lane ยา
  drugLane.style.height = 7 + drugs.length * 38 + "px";

  // ===== วาด ADR (แยกชั้น) =====
  adrs.forEach((a, idx) => {
    const s = a.startDate ? parseDate(a.startDate) : null;
    if (!s) return;

    let e = a.endDate ? parseDate(a.endDate) : null;
    if (!e) e = today;
    if (stripTime(e) < stripTime(s)) e = stripTime(s);
    if (stripTime(e) > maxEnd) e = maxEnd;

    const start = stripTime(s);
    const end = stripTime(e);

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-adr";
    bar.textContent = a.symptom || `ADR ${idx + 1}`;
    bar.style.left = dateToLeftPx(start) + "px";
    bar.style.width = widthFromStartEnd(start, end) + "px";
    bar.style.top = 7 + idx * 38 + "px";

    adrLane.appendChild(bar);
  });
  adrLane.style.height = 7 + adrs.length * 38 + "px";

  // เลื่อนให้เห็นวันท้าย
  if (scrollWrap) {
    scrollWrap.scrollLeft = scrollWrap.scrollWidth;
  }
}

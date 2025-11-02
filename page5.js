// ====================== page5.js ======================

// 1) เตรียมที่เก็บข้อมูลหน้า 5 ถ้ายังไม่มี
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

// 2) ฟังก์ชัน render หลักของหน้า 5
window.renderPage5 = function () {
  const pageEl = document.getElementById("page5");
  if (!pageEl) return;

  // 👇 เพิ่มแค่ตรงนี้ เพื่อใช้วันที่/เวลาปัจจุบัน
  const now = new Date();
  const nowDateTH = now.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  const nowTimeTH = now.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit"
  });
  // 👆 จบส่วนเพิ่ม

  const { drugLines, adrLines } = window.drugAllergyData.page5;

  // ---------- สร้าง HTML (เหมือนที่คุณใช้) ----------
  pageEl.innerHTML = `
    <div class="p5-wrapper">
      <div class="p5-header-line">
        <h2>📅 หน้า 5 Timeline ประเมินการแพ้ยา</h2>
        <div class="p5-btn-group">
          <button id="p5AddDrug" class="p5-btn-add-drug">+ เพิ่มยา</button>
          <button id="p5AddAdr" class="p5-btn-add-adr">+ เพิ่ม ADR</button>
        </div>
      </div>
      <!-- 👇 แทรกวันที่/เวลาไว้ตรงนี้ -->
      <div class="p5-meta-now">📆 ${nowDateTH} · ⏰ ${nowTimeTH} น.</div>

      <!-- รายการยา -->
      <div class="p5-form-block">
        <h3 style="display:flex;align-items:center;gap:.5rem;margin:0 0 .5rem;">
          <span style="font-size:1.3rem;">💊</span> รายการยา
        </h3>
        ${drugLines
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
        ${adrLines
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

      <!-- ปุ่มล่าง -->
      <div class="p5-footer-btns">
        <button id="p5GoSummary" class="p5-bottom-btn p5-bottom-primary">
          บันทึกข้อมูลและไปหน้า 6
        </button>
        <button id="p5Clear" class="p5-bottom-btn p5-bottom-danger">
          🗑️ ล้างข้อมูลหน้านี้
        </button>
      </div>
    </div>
  `;

  // ---------- ผูก event หลังจากสร้าง DOM แล้วเท่านั้น ----------

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
      window.renderPage5(); // re-render แล้วจะวาด timeline ใหม่เอง
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

  // ปุ่มลบแถว (ยา/ADR)
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

  // ผูก input ของยา
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

  // ผูก input ของ ADR
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

  // วาด timeline ครั้งแรก
  drawTimeline();
};

// 3) ฟังก์ชันวาด timeline (ตัวเดิมของคุณ ไม่แตะ)
function drawTimeline() {
  const dateRow = document.getElementById("p5DateRow");
  const drugLane = document.getElementById("p5DrugLane");
  const adrLane = document.getElementById("p5AdrLane");
  if (!dateRow || !drugLane || !adrLane) return;

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

  function parseDate(str) {
    if (!str) return null;
    const pure = String(str).trim().split(" ")[0];
    if (pure.includes("-")) {
      const [y, m, d] = pure.split("-").map(Number);
      if (!y || !m || !d) return null;
      return new Date(y, m - 1, d);
    }
    if (pure.includes("/")) {
      const [d, m, y] = pure.split("/").map(Number);
      if (!d || !m || !y) return null;
      return new Date(y, m - 1, d);
    }
    return null;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // หา minDate จากทุกแถว
  let minDate = null;
  drugs.forEach((d) => {
    const s = parseDate(d.startDate);
    if (s && (!minDate || s < minDate)) minDate = s;
  });
  adrs.forEach((a) => {
    const s = parseDate(a.startDate);
    if (s && (!minDate || s < minDate)) minDate = s;
  });
  if (!minDate) minDate = today;

  // max = วันนี้
  const maxDate = today;

  const totalDays =
    Math.floor((maxDate.getTime() - minDate.getTime()) / MS_DAY) + 1;

  // วาดหัวตารางวัน
  dateRow.innerHTML = "";
  dateRow.style.display = "grid";
  dateRow.style.gridTemplateColumns = `repeat(${totalDays}, ${DAY_W}px)`;
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(
      minDate.getFullYear(),
      minDate.getMonth(),
      minDate.getDate() + i
    );
    const cell = document.createElement("div");
    cell.className = "p5-date-cell";
    cell.textContent = d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short"
    });
    dateRow.appendChild(cell);
  }

  // เตรียม lane
  const ROW_H = 46;
  function prepLane(el, rows) {
    el.innerHTML = "";
    el.style.display = "grid";
    el.style.gridTemplateColumns = `repeat(${totalDays}, ${DAY_W}px)`;
    el.style.gridAutoRows = ROW_H + "px";
    el.style.rowGap = "6px";
    el.style.height = rows * (ROW_H + 6) + "px";
  }
  prepLane(drugLane, Math.max(drugs.length, 1));
  prepLane(adrLane, Math.max(adrs.length, 1));
  adrLane.style.marginTop = "10px";

  function dayIndexOf(date) {
    return Math.floor((date.getTime() - minDate.getTime()) / MS_DAY);
  }

  // วาด "ยา" แยกแถว
  drugs.forEach((d, idx) => {
    const start = parseDate(d.startDate);
    if (!start) return;

    let end;
    if (d.stopDate) {
      const stop = parseDate(d.stopDate);
      if (stop) {
        end = new Date(stop.getFullYear(), stop.getMonth(), stop.getDate() - 1);
      } else {
        end = maxDate;
      }
    } else {
      end = maxDate;
    }

    if (end < start) end = start;
    if (end > maxDate) end = maxDate;

    const startIdx = dayIndexOf(start);
    const endIdx = dayIndexOf(end);

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-drug";
    bar.textContent = d.name || `ยาตัวที่ ${idx + 1}`;

    bar.style.position = "relative";
    bar.style.left = "0";
    bar.style.width = "100%";
    bar.style.gridColumn = `${startIdx + 1} / ${endIdx + 2}`;
    bar.style.gridRow = `${idx + 1}`;

    drugLane.appendChild(bar);
  });

  // วาด "ADR" แยกแถว
  adrs.forEach((a, idx) => {
    const start = parseDate(a.startDate);
    if (!start) return;

    let end;
    if (a.endDate) {
      const e = parseDate(a.endDate);
      if (e) {
        end = new Date(e.getFullYear(), e.getMonth(), e.getDate() - 1);
      } else {
        end = maxDate;
      }
    } else {
      end = maxDate;
    }

    if (end < start) end = start;
    if (end > maxDate) end = maxDate;

    const startIdx = dayIndexOf(start);
    const endIdx = dayIndexOf(end);

    const bar = document.createElement("div");
    bar.className = "p5-bar p5-bar-adr";
    bar.textContent = a.symptom || `ADR ${idx + 1}`;

    bar.style.position = "relative";
    bar.style.left = "0";
    bar.style.width = "100%";
    bar.style.gridColumn = `${startIdx + 1} / ${endIdx + 2}`;
    bar.style.gridRow = `${idx + 1}`;

    adrLane.appendChild(bar);
  });

  // เลื่อนให้เห็นวันล่าสุด
  const sc = document.getElementById("p5TimelineScroll");
  if (sc) sc.scrollLeft = sc.scrollWidth;
}

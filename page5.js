// ====================== page5.js ======================

// 0) ตัวช่วยยิงอีเวนต์อัปเดตให้หน้า 6 รู้ตัว
function p5EmitUpdate(source) {
  try {
    document.dispatchEvent(
      new CustomEvent("da:update", { detail: { source: source || "page5", ts: Date.now() } })
    );
  } catch (e) {
    // เงียบไว้ ไม่ให้พังหน้า
  }
}

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

  const { drugLines, adrLines } = window.drugAllergyData.page5;

  pageEl.innerHTML = `
    <div class="p5-wrapper">
      <div class="p5-header-line">
        <h2>📅 หน้า 5 Timeline ประเมินการแพ้ยา</h2>
        <div class="p5-btn-group">
          <button id="p5AddDrug" class="p5-btn-add-drug">+ เพิ่มยา</button>
          <button id="p5AddAdr" class="p5-btn-add-adr">+ เพิ่ม ADR</button>
        </div>
      </div>

      <!-- แสดงวันที่/เวลาปัจจุบัน -->
      <div id="p5NowBox" class="p5-meta-now"></div>

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
        <button id="p5Print" class="p5-bottom-btn p5-bottom-print">
          🖨️ พิมพ์ Timeline
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
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();
      p5EmitUpdate("page5");
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
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();
      p5EmitUpdate("page5");
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
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();
      p5EmitUpdate("page5");
      window.renderPage5();
    });
  });

  // ---- helper กันพังเวลาวาด timeline ----
  function safeDrawTimeline() {
    try { drawTimeline(); } catch (e) { console.error("[page5] drawTimeline error:", e); }
  }

  // ผูก input ของยา
  pageEl.querySelectorAll(".p5-drug-card").forEach((card) => {
    const idx = Number(card.dataset.idx);
    const nameInput = card.querySelector(".p5-drug-name");
    const startInput = card.querySelector(".p5-drug-start");
    const startTimeInput = card.querySelector(".p5-drug-start-time");
    const stopInput = card.querySelector(".p5-drug-stop");
    const stopTimeInput = card.querySelector(".p5-drug-stop-time");

    if (nameInput)
      nameInput.addEventListener("input", (e) => {
        window.drugAllergyData.page5.drugLines[idx].name = e.target.value;
        safeDrawTimeline();
        if (window.saveDrugAllergyData) window.saveDrugAllergyData();
        p5EmitUpdate("page5");
      });
    if (startInput)
      startInput.addEventListener("change", (e) => {
        window.drugAllergyData.page5.drugLines[idx].startDate = e.target.value;
        safeDrawTimeline();
        if (window.saveDrugAllergyData) window.saveDrugAllergyData();
        p5EmitUpdate("page5");
      });
    if (startTimeInput)
      startTimeInput.addEventListener("change", (e) => {
        window.drugAllergyData.page5.drugLines[idx].startTime = e.target.value;
        if (window.saveDrugAllergyData) window.saveDrugAllergyData();
        p5EmitUpdate("page5");
      });
    if (stopInput)
      stopInput.addEventListener("change", (e) => {
        window.drugAllergyData.page5.drugLines[idx].stopDate = e.target.value;
        safeDrawTimeline();
        if (window.saveDrugAllergyData) window.saveDrugAllergyData();
        p5EmitUpdate("page5");
      });
    if (stopTimeInput)
      stopTimeInput.addEventListener("change", (e) => {
        window.drugAllergyData.page5.drugLines[idx].stopTime = e.target.value;
        if (window.saveDrugAllergyData) window.saveDrugAllergyData();
        p5EmitUpdate("page5");
      });
  });

  // ผูก input ของ ADR
  pageEl.querySelectorAll(".p5-adr-card").forEach((card) => {
    const idx = Number(card.dataset.idx);
    const symInput = card.querySelector(".p5-adr-symptom");
    const startInput = card.querySelector(".p5-adr-start");
    const startTimeInput = card.querySelector(".p5-adr-start-time");
    const endInput = card.querySelector(".p5-adr-end");
    const endTimeInput = card.querySelector(".p5-adr-end-time");

    if (symInput)
      symInput.addEventListener("input", (e) => {
        window.drugAllergyData.page5.adrLines[idx].symptom = e.target.value;
        safeDrawTimeline();
        if (window.saveDrugAllergyData) window.saveDrugAllergyData();
        p5EmitUpdate("page5");
      });
    if (startInput)
      startInput.addEventListener("change", (e) => {
        window.drugAllergyData.page5.adrLines[idx].startDate = e.target.value;
        safeDrawTimeline();
        if (window.saveDrugAllergyData) window.saveDrugAllergyData();
        p5EmitUpdate("page5");
      });
    if (startTimeInput)
      startTimeInput.addEventListener("change", (e) => {
        window.drugAllergyData.page5.adrLines[idx].startTime = e.target.value;
        if (window.saveDrugAllergyData) window.saveDrugAllergyData();
        p5EmitUpdate("page5");
      });
    if (endInput)
      endInput.addEventListener("change", (e) => {
        window.drugAllergyData.page5.adrLines[idx].endDate = e.target.value;
        safeDrawTimeline();
        if (window.saveDrugAllergyData) window.saveDrugAllergyData();
        p5EmitUpdate("page5");
      });
    if (endTimeInput)
      endTimeInput.addEventListener("change", (e) => {
        window.drugAllergyData.page5.adrLines[idx].endTime = e.target.value;
        if (window.saveDrugAllergyData) window.saveDrugAllergyData();
        p5EmitUpdate("page5");
      });
  });

  // ปุ่มไปหน้า 6  ✅ ตั้งธง __saved และพาไป+คำนวณ
  const go6 = document.getElementById("p5GoSummary");
  if (go6) {
    go6.addEventListener("click", () => {
      window.drugAllergyData.page5.__saved = true;
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();
      p5EmitUpdate("page5"); // แจ้งให้หน้า 6 รีคอมพิวต์
      alert("บันทึกหน้า 5 แล้ว");
      const tabBtn = document.querySelector('.tabs button[data-target="page6"]');
      if (tabBtn) tabBtn.click();
      if (window.renderPage6) window.renderPage6(); // เผื่อ router ไม่ยิงอัตโนมัติ
    });
  }

  // ปุ่มล้างเฉพาะหน้า 5  ✅ popup และบันทึก
  const clearBtn = document.getElementById("p5Clear");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      window.drugAllergyData.page5 = { drugLines: [], adrLines: [] };
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();
      p5EmitUpdate("page5");
      window.renderPage5();
      alert("ล้างข้อมูลหน้า 5 แล้ว");
    });
  }

  // ✅ ปุ่มพิมพ์ timeline
  const printBtn = document.getElementById("p5Print");
  if (printBtn) {
    printBtn.addEventListener("click", p5PrintTimeline);
  }

  // วาด timeline ครั้งแรก (กันพังด้วย safeDrawTimeline)
  (function () { try { drawTimeline(); } catch(e) { console.error("[page5] first draw error:", e); } })();

  // อัปเดตกล่องวันที่/เวลาหลัง DOM เสร็จ
  setTimeout(p5UpdateNowBox, 50);
};

// 3) ฟังก์ชันวาด timeline (ตัวเดิมของคุณ + เพิ่มเงื่อนไข "วันเดียวกันให้เป็นจุด")
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

    // 🔵 กรณีเริ่มและหยุด "วันเดียวกัน" (ฟิลด์ startDate/stopDate ถูกกรอกจริงทั้งคู่) ให้แสดงเป็นจุด
    const isSameDayExplicit =
      d.startDate && d.stopDate &&
      parseDate(d.startDate) && parseDate(d.stopDate) &&
      dayIndexOf(parseDate(d.startDate)) === dayIndexOf(parseDate(d.stopDate));

    if (isSameDayExplicit) {
      const cell = document.createElement("div");
      cell.style.gridColumn = `${startIdx + 1} / ${startIdx + 2}`;
      cell.style.gridRow = `${idx + 1}`;
      cell.style.display = "flex";
      cell.style.alignItems = "center";
      cell.style.justifyContent = "center";

      const dot = document.createElement("div");
      dot.title = d.name || `ยาตัวที่ ${idx + 1}`;
      dot.style.width = "16px";
      dot.style.height = "16px";
      dot.style.borderRadius = "9999px";
      dot.style.background = "linear-gradient(90deg,#1679ff 0%,#25c4ff 100%)";
      dot.style.boxShadow = "0 8px 22px rgba(15,23,42,.12)";

      cell.appendChild(dot);
      drugLane.appendChild(cell);
      return;
    }

    // แสดงเป็นแถบตามเดิม
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

    // 🟠 กรณีเกิดและหาย "วันเดียวกัน" (มี startDate & endDate) → แสดงจุด
    const isSameDayExplicit =
      a.startDate && a.endDate &&
      parseDate(a.startDate) && parseDate(a.endDate) &&
      dayIndexOf(parseDate(a.startDate)) === dayIndexOf(parseDate(a.endDate));

    if (isSameDayExplicit) {
      const cell = document.createElement("div");
      cell.style.gridColumn = `${startIdx + 1} / ${startIdx + 2}`;
      cell.style.gridRow = `${idx + 1}`;
      cell.style.display = "flex";
      cell.style.alignItems = "center";
      cell.style.justifyContent = "center";

      const dot = document.createElement("div");
      dot.title = a.symptom || `ADR ${idx + 1}`;
      dot.style.width = "16px";
      dot.style.height = "16px";
      dot.style.borderRadius = "9999px";
      dot.style.background = "linear-gradient(90deg,#f43f5e 0%,#f97316 100%)";
      dot.style.boxShadow = "0 8px 22px rgba(15,23,42,.12)";

      cell.appendChild(dot);
      adrLane.appendChild(cell);
      return;
    }

    // แสดงเป็นแถบตามเดิม
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

// ====== ตัวช่วยแสดงวันที่-เวลาปัจจุบัน (มีวินาทีจริง) ======
function p5UpdateNowBox() {
  const box = document.getElementById("p5NowBox");
  if (!box) return;

  const now = new Date();

  const dateTH = now.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  box.textContent = `📅 วันที่/เวลา ณ ตอนนี้: ${dateTH} ${hh}:${mm}:${ss} น.`;
}

// อัปเดตทุก 1 วิ
setInterval(p5UpdateNowBox, 1000);

// ====== พิมพ์หน้า 5 แบบสี + สรุปข้อความ (ซ่อนปุ่มเพิ่ม) ======
function p5PrintTimeline() {
  const page = document.getElementById("page5");
  if (!page) { window.print(); return; }

  // ดึงข้อมูลที่กรอกจริง
  const p5 = (window.drugAllergyData && window.drugAllergyData.page5) || { drugLines: [], adrLines: [] };
  const drugs = Array.isArray(p5.drugLines) ? p5.drugLines : [];
  const adrs  = Array.isArray(p5.adrLines)  ? p5.adrLines  : [];

  // --- helper แสดงวันที่/เวลา ---
  function fmtDateTH(str) {
    if (!str) return "—";
    const pure = String(str).trim().split(" ")[0];
    let d;
    if (pure.includes("-")) {           // YYYY-MM-DD
      const [y,m,dd] = pure.split("-").map(Number);
      if (y && m && dd) d = new Date(y, m-1, dd);
    } else if (pure.includes("/")) {    // DD/MM/YYYY
      const [dd,m,y] = pure.split("/").map(Number);
      if (y && m && dd) d = new Date(y, m-1, dd);
    }
    if (!d) return str;
    return d.toLocaleDateString("th-TH", { day:"numeric", month:"short", year:"numeric" });
  }
  function fmtTime(str) {
    if (!str) return "";
    const t = String(str).slice(0,5);
    return t + " น.";
  }

  // --- ทำสรุปข้อความจากของที่กรอก ---
  const summaryHTML = `
    <section class="p5-print-summary">
      <h3>🗂️ สรุปข้อมูลที่กรอก</h3>
      <div class="sec">
        <h4>💊 รายการยา</h4>
        ${
          drugs.length
            ? `<ol>
                ${drugs
                  .map((d) => {
                    const name = d.name?.trim() || "(ไม่ระบุชื่อยา)";
                    const sD = fmtDateTH(d.startDate);
                    const sT = fmtTime(d.startTime);
                    const eD = fmtDateTH(d.stopDate);
                    const eT = fmtTime(d.stopTime);
                    return `<li><strong>${name}</strong> — เริ่ม ${sD}${sT ? " " + sT : ""} · หยุด ${eD}${eT ? " " + eT : ""}</li>`;
                  })
                  .join("")}
              </ol>`
            : `<p class="muted">— ไม่มีรายการยา —</p>`
        }
      </div>
      <div class="sec">
        <h4>🧪 ADR</h4>
        ${
          adrs.length
            ? `<ol>
                ${adrs
                  .map((a) => {
                    const name = a.symptom?.trim() || "(ไม่ระบุอาการ)";
                    const sD = fmtDateTH(a.startDate);
                    const sT = fmtTime(a.startTime);
                    const eD = fmtDateTH(a.endDate);
                    const eT = fmtTime(a.endTime);
                    return `<li><strong>${name}</strong> — เริ่ม ${sD}${sT ? " " + sT : ""} · หาย ${eD}${eT ? " " + eT : ""}</li>`;
                  })
                  .join("")}
              </ol>`
            : `<p class="muted">— ไม่มี ADR —</p>`
        }
      </div>
    </section>
  `;

  const pageHTML = page.outerHTML;
  const win = window.open("", "_blank", "width=1200,height=800");

  win.document.write(`
    <html>
      <head>
        <meta charset="utf-8" />
        <title>พิมพ์หน้า 5 Timeline</title>
        <style>
          * { box-sizing:border-box; font-family:system-ui,-apple-system,"Segoe UI",sans-serif; }
          body { margin:0; padding:12px 16px 16px; background:#fff;
                 -webkit-print-color-adjust: exact !important;
                 print-color-adjust: exact !important; }
          .p5-footer-btns, .p5-btn-group { display:none !important; }
          .p5-form-block { display:none !important; }

          .p5-print-summary {
            border:1px solid #e5e7eb; border-radius:12px; padding:12px 14px;
            margin-bottom:14px; background:#fafafa;
          }
          .p5-print-summary h3 { margin:0 0 8px; }
          .p5-print-summary h4 { margin:10px 0 6px; }
          .p5-print-summary ol { margin:0 0 6px 18px; padding:0; }
          .p5-print-summary li { margin:2px 0; }
          .p5-print-summary .muted { color:#6b7280; margin:0; }

          .p5-timeline-box { background:#fff; border:1px solid #edf2f7; border-radius:16px; padding:14px; }
          #p5TimelineScroll { overflow:visible !important; width:auto !important; max-width:none !important; display:inline-block; background:#fff; }
          #p5DateRow, #p5DrugLane, #p5AdrLane { display:grid; grid-auto-rows:40px; row-gap:6px; }
          .p5-date-cell { border-bottom:1px solid #edf2f7; font-size:11px; font-weight:600; white-space:nowrap; padding-bottom:2px; text-align:left; }
          .p5-lane { display:flex; gap:10px; align-items:flex-start; margin-top:6px; }
          .p5-lane-label { width:38px; flex:0 0 38px; font-weight:700; color:#06705d; padding-top:10px; }
          .p5-lane-adr { color:#c53030; }
          .p5-bar { height:34px; border-radius:9999px; display:flex; align-items:center; justify-content:center;
                    color:#fff; font-weight:600; white-space:nowrap; box-shadow:0 8px 22px rgba(15,23,42,.12); font-size:12px; }
          .p5-bar-drug { background:linear-gradient(90deg,#1679ff 0%,#25c4ff 100%); }
          .p5-bar-adr  { background:linear-gradient(90deg,#f43f5e 0%,#f97316 100%); }

          @page { size:A4 landscape; margin:8mm; }
          @media print { body { background:#fff; } }
        </style>
      </head>
      <body>
        ${summaryHTML}
        ${pageHTML}
        <script>
          (function () {
            const box = document.getElementById("p5TimelineScroll");
            const dateRow = document.getElementById("p5DateRow");
            const drugLane = document.getElementById("p5DrugLane");
            const adrLane  = document.getElementById("p5AdrLane");
            if (box && dateRow && drugLane && adrLane) {
              const dayCount = dateRow.children.length || 1;
              const PRINT_DAY_W = 45;
              const cols = "repeat(" + dayCount + ", " + PRINT_DAY_W + "px)";
              dateRow.style.gridTemplateColumns = cols;
              drugLane.style.gridTemplateColumns = cols;
              adrLane.style.gridTemplateColumns  = cols;

              const cells = Array.from(dateRow.children);
              const lastIdx = cells.length - 1;
              cells.forEach(function (cell, i) {
                if (i === 0 || i === lastIdx) return;
                if (i % 4 !== 0) cell.textContent = "";
              });

              const maxWidth = 1000;
              const totalWidth = dayCount * PRINT_DAY_W + 60;
              if (totalWidth > maxWidth) {
                const scale = maxWidth / totalWidth;
                box.style.transform = "scale(" + scale.toFixed(3) + ")";
                box.style.transformOrigin = "top left";
              }
            }
            window.print();
            setTimeout(function(){ window.close(); }, 500);
          })();
        </script>
      </body>
    </html>
  `);
  win.document.close();
}

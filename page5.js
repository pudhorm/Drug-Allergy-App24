// ====================== page5.js (เวอร์ชันกันล้ม) ======================
(function () {
  const STORAGE_KEY = "drug_allergy_app_v1";

  // --- 1) ให้มีโครง page5 เสมอ ---
  function ensurePage5() {
    if (!window.drugAllergyData) {
      window.drugAllergyData = {};
    }
    if (!window.drugAllergyData.page5) {
      window.drugAllergyData.page5 = {
        drugLines: [],
        adrLines: []
      };
    }
    const p5 = window.drugAllergyData.page5;
    if (!Array.isArray(p5.drugLines)) p5.drugLines = [];
    if (!Array.isArray(p5.adrLines)) p5.adrLines = [];
    return p5;
  }

  // --- 2) เซฟกลับ localStorage ถ้ามี key นี้อยู่แล้ว ---
  function saveStore() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(window.drugAllergyData));
    } catch (err) {
      console.warn("save fail", err);
    }
  }

  // --- 3) helper สร้างการ์ดยา/การ์ด ADR (สร้างเฉพาะตอนมีกล่องให้ใส่) ---
  function buildDrugCard(line, idx) {
    const card = document.createElement("div");
    card.className = "p5-drug-card";
    card.innerHTML = `
      <div class="p5-field">
        <label>ยาตัวที่ ${idx + 1}</label>
        <input type="text" value="${line.drugName || ""}" data-role="drugName" data-index="${idx}" placeholder="ระบุชื่อยา" />
      </div>
      <div class="p5-field">
        <label>เริ่มให้ยา</label>
        <input type="date" value="${line.startDate || ""}" data-role="drugStartDate" data-index="${idx}" />
      </div>
      <div class="p5-field">
        <label>เวลา</label>
        <input type="time" value="${line.startTime || ""}" data-role="drugStartTime" data-index="${idx}" />
      </div>
      <div class="p5-field">
        <label>หยุดยา</label>
        <input type="date" value="${line.stopDate || ""}" data-role="drugStopDate" data-index="${idx}" />
      </div>
      <div class="p5-field">
        <label>เวลา</label>
        <input type="time" value="${line.stopTime || ""}" data-role="drugStopTime" data-index="${idx}" />
      </div>
    `;
    return card;
  }

  function buildAdrCard(line, idx) {
    const card = document.createElement("div");
    card.className = "p5-adr-card";
    card.innerHTML = `
      <div class="p5-field">
        <label>ADR ${idx + 1} (อาการ)</label>
        <input type="text" value="${line.symptom || ""}" data-role="adrSymptom" data-index="${idx}" placeholder="เช่น ผื่น, หอบ, ความดันต่ำ" />
      </div>
      <div class="p5-field">
        <label>วันที่เกิด</label>
        <input type="date" value="${line.startDate || ""}" data-role="adrStartDate" data-index="${idx}" />
      </div>
      <div class="p5-field">
        <label>เวลาที่เกิด</label>
        <input type="time" value="${line.startTime || ""}" data-role="adrStartTime" data-index="${idx}" />
      </div>
      <div class="p5-field">
        <label>วันที่หาย/สิ้นสุด</label>
        <input type="date" value="${line.endDate || ""}" data-role="adrEndDate" data-index="${idx}" />
      </div>
      <div class="p5-field">
        <label>เวลาที่หาย</label>
        <input type="time" value="${line.endTime || ""}" data-role="adrEndTime" data-index="${idx}" />
      </div>
    `;
    return card;
  }

  // --- 4) ฟังก์ชันหลักไว้เรียกจากปุ่มแท็บ ---
  window.renderPage5 = function () {
    const p5 = ensurePage5();

    // ตำแหน่งใช้วาดฟอร์ม (ถ้าไม่มี ก็ไม่ต้องวาด แต่อย่างน้อยไม่ error)
    const drugWrap =
      document.getElementById("p5DrugCards") ||
      document.getElementById("p5DrugArea") ||
      document.getElementById("p5DrugList");
    const adrWrap =
      document.getElementById("p5AdrCards") ||
      document.getElementById("p5AdrArea") ||
      document.getElementById("p5AdrList");

    // ----- วาดส่วนยา -----
    if (drugWrap) {
      drugWrap.innerHTML = "";
      p5.drugLines.forEach((line, idx) => {
        drugWrap.appendChild(buildDrugCard(line, idx));
      });
    }

    // ----- วาดส่วน ADR -----
    if (adrWrap) {
      adrWrap.innerHTML = "";
      p5.adrLines.forEach((line, idx) => {
        adrWrap.appendChild(buildAdrCard(line, idx));
      });
    }

    // ผูก event แบบ delegate เบาๆ (กันล้ม)
    const page5 = document.getElementById("page5");
    if (page5 && !page5.__p5Bound) {
      page5.addEventListener("input", function (ev) {
        const t = ev.target;
        const role = t.getAttribute("data-role");
        const index = Number(t.getAttribute("data-index"));
        if (!role || Number.isNaN(index)) return;

        const p5data = ensurePage5();

        // update ฝั่งยา
        if (role.startsWith("drug")) {
          const line = p5data.drugLines[index];
          if (!line) return;
          switch (role) {
            case "drugName": line.drugName = t.value; break;
            case "drugStartDate": line.startDate = t.value; break;
            case "drugStartTime": line.startTime = t.value; break;
            case "drugStopDate": line.stopDate = t.value; break;
            case "drugStopTime": line.stopTime = t.value; break;
          }
        }

        // update ฝั่ง ADR
        if (role.startsWith("adr")) {
          const line = p5data.adrLines[index];
          if (!line) return;
          switch (role) {
            case "adrSymptom": line.symptom = t.value; break;
            case "adrStartDate": line.startDate = t.value; break;
            case "adrStartTime": line.startTime = t.value; break;
            case "adrEndDate": line.endDate = t.value; break;
            case "adrEndTime": line.endTime = t.value; break;
          }
        }

        saveStore();
        // หลังเปลี่ยนค่าให้วาด timeline ใหม่ทันที
        drawTimeline();
      });
      page5.__p5Bound = true;
    }

    // เรียกวาดเส้น timeline เลย
    drawTimeline();
  };

  // --- 5) ปุ่มเพิ่มยา / เพิ่ม ADR ---
  window.p5AddDrug = function () {
    const p5 = ensurePage5();
    p5.drugLines.push({
      drugName: "",
      startDate: "",
      startTime: "",
      stopDate: "",
      stopTime: ""
    });
    saveStore();
    window.renderPage5();
  };

  window.p5AddAdr = function () {
    const p5 = ensurePage5();
    p5.adrLines.push({
      symptom: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: ""
    });
    saveStore();
    window.renderPage5();
  };

  // ถ้าปุ่มบนหน้า HTML ตั้ง id แบบนี้ จะผูกให้เลย
  window.addEventListener("DOMContentLoaded", function () {
    const addDrugBtn = document.getElementById("p5AddDrugBtn");
    const addAdrBtn = document.getElementById("p5AddAdrBtn");
    if (addDrugBtn) addDrugBtn.addEventListener("click", window.p5AddDrug);
    if (addAdrBtn) addAdrBtn.addEventListener("click", window.p5AddAdr);

    // แสดงหน้า 5 รอบแรก
    // (ถ้าเปิดหน้านี้จากแท็บอื่นทีหลัง ก็แค่เรียก window.renderPage5(); อีกที)
    window.renderPage5();
  });

  // ====================== drawTimeline เวอร์ชันตรงสเปค ======================
  // (อันเดียวกับที่คุณส่งมา ผมแค่ย้ายเข้ามาในไฟล์เดียวกัน)
  function drawTimeline() {
    const dateRow = document.getElementById("p5DateRow");   // แถววันที่ด้านบน
    const drugLane = document.getElementById("p5DrugLane"); // ช่องวาดแถบยา
    const adrLane  = document.getElementById("p5AdrLane");  // ช่องวาดแถบ ADR

    if (!dateRow || !drugLane || !adrLane) return;

    // ----- 1) ดึงข้อมูลจากศูนย์กลาง -----
    const store = window.drugAllergyData || {};
    const drugs =
      (store.page5 && Array.isArray(store.page5.drugLines) && store.page5.drugLines) ||
      (Array.isArray(store.timelineDrugs) ? store.timelineDrugs : []);
    const adrs =
      (store.page5 && Array.isArray(store.page5.adrLines) && store.page5.adrLines) ||
      (Array.isArray(store.timelineAdrs) ? store.timelineAdrs : []);

    // ถ้าไม่มีข้อมูลเลยให้ล้างจอแล้วจบ
    if (!drugs.length && !adrs.length) {
      dateRow.innerHTML = "";
      drugLane.innerHTML = "";
      adrLane.innerHTML = "";
      return;
    }

    const MS_DAY = 24 * 60 * 60 * 1000;
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

    // ----- 3) หา minDate และ maxDate (ปลายต้องเป็น "วันนี้") -----
    let minDate = null;

    drugs.forEach((d) => {
      const s = parseDate(d.startDate || d.start || d.giveDate);
      if (s) {
        if (!minDate || s < minDate) minDate = s;
      }
    });
    adrs.forEach((a) => {
      const s = parseDate(a.startDate || a.eventDate || a.symptomDate);
      if (s) {
        if (!minDate || s < minDate) minDate = s;
      }
    });

    if (!minDate) {
      minDate = today;
    }

    const maxDate = today;

    // ----- 4) คำนวณจำนวนวันและวาดแกน X -----
    const DAY_W = 120; // ต้องตรงกับใน CSS
    const totalDays = Math.floor((maxDate.getTime() - minDate.getTime()) / MS_DAY) + 1;

    dateRow.innerHTML = "";
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

    drugLane.innerHTML = "";
    adrLane.innerHTML = "";

    function dateToLeftPx(date) {
      const diffDay = Math.floor((date.getTime() - minDate.getTime()) / MS_DAY);
      return diffDay * DAY_W;
    }
    function calcWidthPx(startDate, endDate) {
      const diffDay = Math.floor((endDate.getTime() - startDate.getTime()) / MS_DAY);
      return (diffDay + 1) * DAY_W - 12;
    }

    // ----- 6) วาดแถบ "ยา" -----
    drugs.forEach((d, idx) => {
      const start = parseDate(d.startDate || d.start || d.giveDate);
      if (!start) return;

      const end = d.stopDate || d.endDate || d.stop;
      const endDateRaw = end ? parseDate(end) : null;
      let endDate = endDateRaw ? endDateRaw : maxDate;
      if (endDate < start) endDate = start;

      const bar = document.createElement("div");
      bar.className = "p5-bar p5-bar-drug";
      bar.textContent = d.drugName || d.name || `ยาตัวที่ ${idx + 1}`;

      const left = dateToLeftPx(start);
      const width = calcWidthPx(start, endDate);

      bar.style.left = left + "px";
      bar.style.width = width + "px";

      drugLane.appendChild(bar);
    });

    // ----- 7) วาดแถบ "ADR" -----
    adrs.forEach((a, idx) => {
      const start = parseDate(a.startDate || a.eventDate || a.symptomDate);
      if (!start) return;

      const end = a.endDate || a.resolveDate;
      const endDateRaw = end ? parseDate(end) : null;
      let endDate = endDateRaw ? endDateRaw : maxDate;
      if (endDate < start) endDate = start;

      const bar = document.createElement("div");
      bar.className = "p5-bar p5-bar-adr";
      bar.textContent = a.symptom || a.name || `ADR ${idx + 1}`;

      const left = dateToLeftPx(start);
      const width = calcWidthPx(start, endDate);

      bar.style.left = left + "px";
      bar.style.width = width + "px";

      adrLane.appendChild(bar);
    });

    // ----- 8) เลื่อนให้เห็นด้านขวา (วันนี้) -----
    const scrollWrap = document.getElementById("p5TimelineScroll");
    if (scrollWrap) {
      scrollWrap.scrollLeft = scrollWrap.scrollWidth;
    }
  }
})();

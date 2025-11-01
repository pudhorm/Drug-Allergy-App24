// page5.js — เวอร์ชันกันล้ม 100%
// ไม่แตะหน้า 1-4 นะ ใช้แค่ตัวแปรกลาง window.drugAllergyData ที่มีอยู่

(function () {
  const STORAGE_KEY = "drug_allergy_app_v1";

  // ---------- A. ให้แน่ใจว่ามีโครง page5 เสมอ ----------
  function ensurePage5() {
    if (typeof window.drugAllergyData !== "object" || !window.drugAllergyData) {
      window.drugAllergyData = {};
    }

    if (typeof window.drugAllergyData.page5 !== "object" || !window.drugAllergyData.page5) {
      window.drugAllergyData.page5 = {};
    }

    const p5 = window.drugAllergyData.page5;

    if (!Array.isArray(p5.drugLines)) {
      p5.drugLines = [];
    }
    if (!Array.isArray(p5.adrLines)) {
      p5.adrLines = [];
    }

    return p5;
  }

  function saveStore() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(window.drugAllergyData));
    } catch (e) {
      console.warn("save fail", e);
    }
  }

  // ---------- B. render หลัก ----------
  window.renderPage5 = function () {
    const p5 = ensurePage5();

    // กล่องที่ใช้วางการ์ดยา/ADR (ถ้าไม่มี จะไม่พัง)
    const drugBox =
      document.getElementById("p5DrugCards") ||
      document.getElementById("p5DrugArea") ||
      document.getElementById("p5DrugList");
    const adrBox =
      document.getElementById("p5AdrCards") ||
      document.getElementById("p5AdrArea") ||
      document.getElementById("p5AdrList");

    // ----- วาดฝั่งยา -----
    if (drugBox) {
      drugBox.innerHTML = "";

      p5.drugLines.forEach(function (line, idx) {
        const card = document.createElement("div");
        card.className = "p5-drug-card";
        card.innerHTML = `
          <div class="p5-field">
            <label>ยาตัวที่ ${idx + 1}</label>
            <input type="text" data-role="drugName" data-index="${idx}" value="${line.drugName || ""}" placeholder="ระบุชื่อยา" />
          </div>
          <div class="p5-field">
            <label>เริ่มให้ยา</label>
            <input type="date" data-role="drugStartDate" data-index="${idx}" value="${line.startDate || ""}" />
          </div>
          <div class="p5-field">
            <label>เวลา</label>
            <input type="time" data-role="drugStartTime" data-index="${idx}" value="${line.startTime || ""}" />
          </div>
          <div class="p5-field">
            <label>หยุดยา</label>
            <input type="date" data-role="drugStopDate" data-index="${idx}" value="${line.stopDate || ""}" />
          </div>
          <div class="p5-field">
            <label>เวลา</label>
            <input type="time" data-role="drugStopTime" data-index="${idx}" value="${line.stopTime || ""}" />
          </div>
        `;
        drugBox.appendChild(card);
      });
    }

    // ----- วาดฝั่ง ADR -----
    if (adrBox) {
      adrBox.innerHTML = "";

      p5.adrLines.forEach(function (line, idx) {
        const card = document.createElement("div");
        card.className = "p5-adr-card";
        card.innerHTML = `
          <div class="p5-field">
            <label>ADR ${idx + 1} (อาการ)</label>
            <input type="text" data-role="adrSymptom" data-index="${idx}" value="${line.symptom || ""}" placeholder="เช่น ผื่น, หอบ, BP drop" />
          </div>
          <div class="p5-field">
            <label>วันที่เกิด</label>
            <input type="date" data-role="adrStartDate" data-index="${idx}" value="${line.startDate || ""}" />
          </div>
          <div class="p5-field">
            <label>เวลาที่เกิด</label>
            <input type="time" data-role="adrStartTime" data-index="${idx}" value="${line.startTime || ""}" />
          </div>
          <div class="p5-field">
            <label>วันที่หาย/สิ้นสุด</label>
            <input type="date" data-role="adrEndDate" data-index="${idx}" value="${line.endDate || ""}" />
          </div>
          <div class="p5-field">
            <label>เวลาที่หาย</label>
            <input type="time" data-role="adrEndTime" data-index="${idx}" value="${line.endTime || ""}" />
          </div>
        `;
        adrBox.appendChild(card);
      });
    }

    // วาด timeline ด้านล่าง
    drawTimelineSafe();
  };

  // ---------- C. ปุ่มเพิ่ม ----------
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

  // ---------- D. event เดียวจับทุก input ของหน้า 5 ----------
  window.addEventListener("DOMContentLoaded", function () {
    const page5 = document.getElementById("page5");
    if (page5 && !page5.__binded) {
      page5.addEventListener("input", function (ev) {
        const el = ev.target;
        const role = el.getAttribute("data-role");
        const index = Number(el.getAttribute("data-index"));
        if (!role || Number.isNaN(index)) return;

        const p5 = ensurePage5();

        // ฝั่งยา
        if (role.indexOf("drug") === 0) {
          const line = p5.drugLines[index];
          if (!line) return;
          if (role === "drugName") line.drugName = el.value;
          if (role === "drugStartDate") line.startDate = el.value;
          if (role === "drugStartTime") line.startTime = el.value;
          if (role === "drugStopDate") line.stopDate = el.value;
          if (role === "drugStopTime") line.stopTime = el.value;
        }

        // ฝั่ง ADR
        if (role.indexOf("adr") === 0) {
          const line = p5.adrLines[index];
          if (!line) return;
          if (role === "adrSymptom") line.symptom = el.value;
          if (role === "adrStartDate") line.startDate = el.value;
          if (role === "adrStartTime") line.startTime = el.value;
          if (role === "adrEndDate") line.endDate = el.value;
          if (role === "adrEndTime") line.endTime = el.value;
        }

        saveStore();
        drawTimelineSafe();
      });

      page5.__binded = true;
    }

    // ผูกปุ่มเพิ่มถ้ามีอยู่ในหน้า
    const addDrugBtn = document.getElementById("p5AddDrugBtn");
    const addAdrBtn = document.getElementById("p5AddAdrBtn");
    if (addDrugBtn) addDrugBtn.addEventListener("click", window.p5AddDrug);
    if (addAdrBtn) addAdrBtn.addEventListener("click", window.p5AddAdr);
  });

  // ---------- E. drawTimeline แบบกันล้ม ----------
  function drawTimelineSafe() {
    const dateRow = document.getElementById("p5DateRow");
    const drugLane = document.getElementById("p5DrugLane");
    const adrLane = document.getElementById("p5AdrLane");

    if (!dateRow || !drugLane || !adrLane) return;

    const store = window.drugAllergyData || {};
    const p5 = store.page5 || {};
    const drugs = Array.isArray(p5.drugLines) ? p5.drugLines : [];
    const adrs = Array.isArray(p5.adrLines) ? p5.adrLines : [];

    // ถ้าไม่มีข้อมูลเลย ล้างแล้วจบ
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

    function addDays(d, n) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // หา minDate
    let minDate = null;
    drugs.forEach(function (d) {
      const s = parseDate(d.startDate);
      if (s) {
        if (!minDate || s < minDate) minDate = s;
      }
    });
    adrs.forEach(function (a) {
      const s = parseDate(a.startDate);
      if (s) {
        if (!minDate || s < minDate) minDate = s;
      }
    });
    if (!minDate) minDate = today;

    // max = วันนี้
    const maxDate = today;

    // วาดแกน X
    const DAY_W = 120;
    const totalDays = Math.floor((maxDate - minDate) / MS_DAY) + 1;

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

    // ล้างเลน
    drugLane.innerHTML = "";
    adrLane.innerHTML = "";

    function dateToLeftPx(date) {
      const diff = Math.floor((date - minDate) / MS_DAY);
      return diff * DAY_W;
    }
    function widthPx(start, end) {
      const diff = Math.floor((end - start) / MS_DAY);
      return (diff + 1) * DAY_W - 12;
    }

    // วาดยา
    drugs.forEach(function (d, idx) {
      const s = parseDate(d.startDate);
      if (!s) return;
      const e = d.stopDate ? parseDate(d.stopDate) : maxDate;
      const end = e && e >= s ? e : s;

      const bar = document.createElement("div");
      bar.className = "p5-bar p5-bar-drug";
      bar.textContent = d.drugName || `ยาตัวที่ ${idx + 1}`;
      bar.style.left = dateToLeftPx(s) + "px";
      bar.style.width = widthPx(s, end) + "px";
      drugLane.appendChild(bar);
    });

    // วาด ADR
    adrs.forEach(function (a, idx) {
      const s = parseDate(a.startDate);
      if (!s) return;
      const e = a.endDate ? parseDate(a.endDate) : maxDate;
      const end = e && e >= s ? e : s;

      const bar = document.createElement("div");
      bar.className = "p5-bar p5-bar-adr";
      bar.textContent = a.symptom || `ADR ${idx + 1}`;
      bar.style.left = dateToLeftPx(s) + "px";
      bar.style.width = widthPx(s, end) + "px";
      adrLane.appendChild(bar);
    });

    const scrollWrap = document.getElementById("p5TimelineScroll");
    if (scrollWrap) {
      scrollWrap.scrollLeft = scrollWrap.scrollWidth;
    }
  }
})();

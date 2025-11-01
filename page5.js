// page5.js
(function () {
  const DAY_W = 120;               // ความกว้าง 1 วัน ต้องตรงกับ CSS
  const MS_DAY = 24 * 60 * 60 * 1000;

  // -----------------------------
  // 1) เตรียมที่เก็บข้อมูลหน้า 5
  // -----------------------------
  function ensurePage5() {
    if (!window.drugAllergyData) window.drugAllergyData = {};
    const root = window.drugAllergyData;
    if (!root.page5) {
      root.page5 = {
        drugLines: [
          { drugName: "", startDate: "", startTime: "", stopDate: "", stopTime: "" },
        ],
        adrLines: [
          { symptom: "", startDate: "", startTime: "", endDate: "", endTime: "" },
        ],
      };
    } else {
      if (!Array.isArray(root.page5.drugLines)) {
        root.page5.drugLines = [
          { drugName: "", startDate: "", startTime: "", stopDate: "", stopTime: "" },
        ];
      }
      if (!Array.isArray(root.page5.adrLines)) {
        root.page5.adrLines = [
          { symptom: "", startDate: "", startTime: "", endDate: "", endTime: "" },
        ];
      }
    }
  }

  function saveAll() {
    if (window.saveDrugAllergyData) {
      window.saveDrugAllergyData();
    } else {
      // fallback
      try {
        localStorage.setItem("drug_allergy_app_v1", JSON.stringify(window.drugAllergyData));
      } catch (e) {}
    }
  }

  // -----------------------------
  // 2) ฟังก์ชัน render หน้า 5
  // -----------------------------
  window.renderPage5 = function () {
    ensurePage5();
    const wrap = document.getElementById("page5");
    const p5 = window.drugAllergyData.page5;

    wrap.innerHTML = `
      <div class="p5-wrapper">
        <div class="p5-header-line">
          <h2>📅 หน้า 5 Timeline ประเมินการแพ้ยา</h2>
          <div class="p5-btn-group">
            <button type="button" class="p5-btn-add-drug" id="p5AddDrug">+ เพิ่มยาตัวใหม่</button>
            <button type="button" class="p5-btn-add-adr" id="p5AddAdr">+ เพิ่ม ADR</button>
          </div>
        </div>

        <div class="p5-form-block" id="p5FormBlock">
          <h3 style="margin-top:0;">💊 รายการยา</h3>
          <div id="p5DrugCards">
            ${p5.drugLines
              .map((d, idx) => renderDrugCard(d, idx))
              .join("")}
          </div>

          <h3 style="margin-top:1.1rem;">🧪 ADR (Adverse Drug Reaction)</h3>
          <div id="p5AdrCards">
            ${p5.adrLines
              .map((a, idx) => renderAdrCard(a, idx))
              .join("")}
          </div>
        </div>

        <div class="p5-timeline-box">
          <h3>Visual Timeline</h3>
          <div id="p5TimelineScroll">
            <div id="p5DateRow"></div>

            <div class="p5-lane">
              <div class="p5-lane-label">ยา</div>
              <div id="p5DrugLane" class="p5-lane-track"></div>
            </div>

            <div class="p5-lane">
              <div class="p5-lane-label p5-lane-adr">ADR</div>
              <div id="p5AdrLane" class="p5-lane-track"></div>
            </div>
          </div>
        </div>

        <div class="p5-footer-btns">
          <button type="button" class="p5-next" id="p5GoSummary">บันทึกข้อมูลและไปหน้า 6</button>
          <button type="button" class="p5-clear" id="p5ClearPage">🗑 ล้างข้อมูลหน้านี้</button>
        </div>
      </div>
    `;

    // --- ผูกปุ่มเพิ่ม / ลบ
    document.getElementById("p5AddDrug").addEventListener("click", () => {
      p5.drugLines.push({
        drugName: "",
        startDate: "",
        startTime: "",
        stopDate: "",
        stopTime: "",
      });
      window.renderPage5(); // re-render
    });

    document.getElementById("p5AddAdr").addEventListener("click", () => {
      p5.adrLines.push({
        symptom: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
      });
      window.renderPage5();
    });

    // --- ผูก input ของยา
    p5.drugLines.forEach((d, idx) => {
      const base = `p5_d_${idx}_`;
      getEl(base + "name").addEventListener("input", (e) => {
        d.drugName = e.target.value;
        saveAll();
        drawTimeline();
      });
      getEl(base + "start").addEventListener("change", (e) => {
        d.startDate = e.target.value;
        saveAll();
        drawTimeline();
      });
      getEl(base + "startTime").addEventListener("change", (e) => {
        d.startTime = e.target.value;
        saveAll();
      });
      getEl(base + "stop").addEventListener("change", (e) => {
        d.stopDate = e.target.value;
        saveAll();
        drawTimeline();
      });
      getEl(base + "stopTime").addEventListener("change", (e) => {
        d.stopTime = e.target.value;
        saveAll();
      });
      getEl(base + "del").addEventListener("click", () => {
        p5.drugLines.splice(idx, 1);
        if (!p5.drugLines.length) {
          p5.drugLines.push({
            drugName: "",
            startDate: "",
            startTime: "",
            stopDate: "",
            stopTime: "",
          });
        }
        saveAll();
        window.renderPage5();
      });
    });

    // --- ผูก input ของ ADR
    p5.adrLines.forEach((a, idx) => {
      const base = `p5_a_${idx}_`;
      getEl(base + "symptom").addEventListener("input", (e) => {
        a.symptom = e.target.value;
        saveAll();
        drawTimeline();
      });
      getEl(base + "start").addEventListener("change", (e) => {
        a.startDate = e.target.value;
        saveAll();
        drawTimeline();
      });
      getEl(base + "startTime").addEventListener("change", (e) => {
        a.startTime = e.target.value;
        saveAll();
      });
      getEl(base + "end").addEventListener("change", (e) => {
        a.endDate = e.target.value;
        saveAll();
        drawTimeline();
      });
      getEl(base + "endTime").addEventListener("change", (e) => {
        a.endTime = e.target.value;
        saveAll();
      });
      getEl(base + "del").addEventListener("click", () => {
        p5.adrLines.splice(idx, 1);
        if (!p5.adrLines.length) {
          p5.adrLines.push({
            symptom: "",
            startDate: "",
            startTime: "",
            endDate: "",
            endTime: "",
          });
        }
        saveAll();
        window.renderPage5();
      });
    });

    // --- ปุ่มเคลียร์
    document.getElementById("p5ClearPage").addEventListener("click", () => {
      window.drugAllergyData.page5 = {
        drugLines: [
          { drugName: "", startDate: "", startTime: "", stopDate: "", stopTime: "" },
        ],
        adrLines: [
          { symptom: "", startDate: "", startTime: "", endDate: "", endTime: "" },
        ],
      };
      saveAll();
      window.renderPage5();
    });

    // --- ปุ่มไปหน้า 6
    document.getElementById("p5GoSummary").addEventListener("click", () => {
      saveAll();
      const btn = document.querySelector('.tabs button[data-target="page6"]');
      if (btn) btn.click();
    });

    // วาด timeline ครั้งแรก
    drawTimeline();
  };

  // เรนเดอร์ card ยา 1 ใบ
  function renderDrugCard(d, idx) {
    return `
      <div class="p5-drug-card">
        <div class="p5-field">
          <label>ยาตัวที่ ${idx + 1}</label>
          <input type="text" id="p5_d_${idx}_name" value="${d.drugName || ""}" placeholder="ระบุชื่อยา" />
        </div>
        <div class="p5-field">
          <label>เริ่มให้ยา</label>
          <input type="date" id="p5_d_${idx}_start" value="${d.startDate || ""}" />
        </div>
        <div class="p5-field">
          <label>เวลา</label>
          <input type="time" id="p5_d_${idx}_startTime" value="${d.startTime || ""}" />
        </div>
        <div class="p5-field">
          <label>หยุดยา</label>
          <input type="date" id="p5_d_${idx}_stop" value="${d.stopDate || ""}" />
        </div>
        <div class="p5-field">
          <label>เวลา</label>
          <input type="time" id="p5_d_${idx}_stopTime" value="${d.stopTime || ""}" />
        </div>
        <div class="p5-field">
          <label>&nbsp;</label>
          <button type="button" id="p5_d_${idx}_del" class="p5-btn-del-adr">ลบ</button>
        </div>
      </div>
    `;
  }

  // เรนเดอร์ card ADR 1 ใบ
  function renderAdrCard(a, idx) {
    return `
      <div class="p5-adr-card">
        <div class="p5-field">
          <label>ADR ${idx + 1}</label>
          <input type="text" id="p5_a_${idx}_symptom" value="${a.symptom || ""}" placeholder="ระบุอาการ" />
        </div>
        <div class="p5-field">
          <label>วันที่เกิด</label>
          <input type="date" id="p5_a_${idx}_start" value="${a.startDate || ""}" />
        </div>
        <div class="p5-field">
          <label>เวลา</label>
          <input type="time" id="p5_a_${idx}_startTime" value="${a.startTime || ""}" />
        </div>
        <div class="p5-field">
          <label>วันที่หาย</label>
          <input type="date" id="p5_a_${idx}_end" value="${a.endDate || ""}" />
        </div>
        <div class="p5-field">
          <label>เวลา</label>
          <input type="time" id="p5_a_${idx}_endTime" value="${a.endTime || ""}" />
        </div>
        <div class="p5-field">
          <label>&nbsp;</label>
          <button type="button" id="p5_a_${idx}_del" class="p5-btn-del-adr">ลบ</button>
        </div>
      </div>
    `;
  }

  function getEl(id) {
    return document.getElementById(id);
  }

  // -----------------------------
  // 3) drawTimeline ปรับวัน -1/-1
  // -----------------------------
  function drawTimeline() {
    ensurePage5();
    const p5 = window.drugAllergyData.page5;
    const drugs = Array.isArray(p5.drugLines) ? p5.drugLines : [];
    const adrs = Array.isArray(p5.adrLines) ? p5.adrLines : [];

    const dateRow = document.getElementById("p5DateRow");
    const drugLane = document.getElementById("p5DrugLane");
    const adrLane = document.getElementById("p5AdrLane");
    if (!dateRow || !drugLane || !adrLane) return;

    // ถ้าไม่มีข้อมูลเลย
    if (!drugs.length && !adrs.length) {
      dateRow.innerHTML = "";
      drugLane.innerHTML = "";
      adrLane.innerHTML = "";
      return;
    }

    function parseDate(str) {
      if (!str) return null;
      const pure = String(str).split(" ")[0];
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

    // วันนี้ (ตัดเวลา)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // หา minDate จากทุกอย่าง
    let minDate = null;
    [...drugs, ...adrs].forEach((item) => {
      const s =
        parseDate(item.startDate || item.start || item.giveDate || item.eventDate || item.symptomDate);
      if (s) {
        if (!minDate || s < minDate) minDate = s;
      }
    });
    if (!minDate) minDate = today;

    const maxDate = today; // ปลายเสมอ = วันนี้

    // วาดวันที่
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

    // เตรียมเลน
    drugLane.innerHTML = "";
    adrLane.innerHTML = "";

    function dateToLeftPx(date) {
      const diffDay = Math.floor((date.getTime() - minDate.getTime()) / MS_DAY);
      return diffDay * DAY_W;
    }
    function barWidthPx(start, end) {
      const diffDay = Math.floor((end.getTime() - start.getTime()) / MS_DAY);
      let w = (diffDay + 1) * DAY_W;
      if (w < DAY_W * 0.5) w = DAY_W * 0.5;
      return w - 6;
    }

    // วาดยา
    drugs.forEach((d, idx) => {
      const startRaw = parseDate(d.startDate);
      if (!startRaw) return;
      // ⭐⭐⭐ แก้ให้ “เริ่มตรงวันเลย” แต่เพราะตอนนี้มันช้าไป 1 วัน → ขยับกลับ 1 วัน
      const start = addDays(startRaw, -1);

      const stopRaw = d.stopDate ? parseDate(d.stopDate) : null;
      let end;
      if (stopRaw) {
        // ถ้าตอนนี้มันหยุดช้าไป 1 วัน → ขยับกลับ 1 วัน
        end = addDays(stopRaw, -1);
      } else {
        // ongoing → วันนี้
        end = maxDate;
      }
      if (end < start) end = start;

      const bar = document.createElement("div");
      bar.className = "p5-bar p5-bar-drug";
      bar.textContent = d.drugName ? d.drugName : `ยาตัวที่ ${idx + 1}`;

      bar.style.left = dateToLeftPx(start) + "px";
      bar.style.width = barWidthPx(start, end) + "px";

      drugLane.appendChild(bar);
    });

    // วาด ADR
    adrs.forEach((a, idx) => {
      const startRaw = parseDate(a.startDate);
      if (!startRaw) return;
      const start = addDays(startRaw, -1); // ขยับให้เร็วขึ้น 1 วัน

      const endRaw = a.endDate ? parseDate(a.endDate) : null;
      let end;
      if (endRaw) {
        end = addDays(endRaw, -1); // ขยับให้เร็วขึ้น 1 วัน
      } else {
        end = maxDate;
      }
      if (end < start) end = start;

      const bar = document.createElement("div");
      bar.className = "p5-bar p5-bar-adr";
      bar.textContent = a.symptom ? a.symptom : `ADR ${idx + 1}`;

      bar.style.left = dateToLeftPx(start) + "px";
      bar.style.width = barWidthPx(start, end) + "px";

      adrLane.appendChild(bar);
    });

    // เลื่อนให้เห็นด้านขวา
    const scrollWrap = document.getElementById("p5TimelineScroll");
    if (scrollWrap) {
      scrollWrap.scrollLeft = scrollWrap.scrollWidth;
    }
  }

  // export ให้เรียกจาก index.html ได้
  window.drawTimeline = drawTimeline;
})();

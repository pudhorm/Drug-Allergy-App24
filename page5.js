// page5.js
// หน้า 5: Timeline ประเมินการแพ้ยา
(function () {
  // ให้มีโครงเก็บข้อมูลใน data.js เสมอ
  if (!window.drugAllergyData) {
    window.drugAllergyData = {};
  }
  if (!window.drugAllergyData.page5) {
    window.drugAllergyData.page5 = {
      drugLines: [],
      adrLines: [],
    };
  }

  // ฟังก์ชันหลักที่ index.html จะเรียกเวลาเปลี่ยนแท็บ
  window.renderPage5 = function () {
    const root = document.getElementById("page5");
    if (!root) return;

    const store = window.drugAllergyData.page5;

    root.innerHTML = `
      <div class="p5-wrapper">
        <div class="p5-header-line">
          <h2>📅 หน้า 5 Timeline ประเมินการแพ้ยา</h2>
          <div class="p5-btn-group">
            <button id="p5AddDrugBtn" class="p5-btn-add-drug">+ เพิ่มยาตัวใหม่</button>
            <button id="p5AddAdrBtn" class="p5-btn-add-adr">+ เพิ่ม ADR</button>
          </div>
        </div>

        <!-- ฟอร์มยา -->
        <div id="p5DrugArea" class="p5-form-block">
          ${store.drugLines
            .map((d, i) => {
              return `
              <div class="p5-drug-card" data-index="${i}">
                <div class="p5-field" style="grid-column:1/-1;">
                  <label>💊 ยาตัวที่ ${i + 1}</label>
                </div>
                <div class="p5-field" style="grid-column:1/-1;">
                  <label>ชื่อยา</label>
                  <input type="text" data-role="drug-name" value="${d.name || ""}" placeholder="ระบุชื่อยา" />
                </div>
                <div class="p5-field">
                  <label>เริ่มให้ยา</label>
                  <input type="date" data-role="drug-start-date" value="${d.startDate || ""}" />
                </div>
                <div class="p5-field">
                  <label>เวลาเริ่ม</label>
                  <input type="time" data-role="drug-start-time" value="${d.startTime || ""}" />
                </div>
                <div class="p5-field">
                  <label>หยุดยา</label>
                  <input type="date" data-role="drug-stop-date" value="${d.stopDate || ""}" />
                </div>
                <div class="p5-field">
                  <label>เวลาหยุด</label>
                  <input type="time" data-role="drug-stop-time" value="${d.stopTime || ""}" />
                </div>
              </div>
            `;
            })
            .join("")}
        </div>

        <!-- ฟอร์ม ADR -->
        <div id="p5AdrArea" class="p5-form-block" style="background:#fff2f2;">
          <h3 style="margin:0 0 .5rem; color:#b91c1c; display:flex; align-items:center; gap:.4rem;">🔴 ADR (Adverse Drug Reaction)</h3>
          ${store.adrLines
            .map((a, i) => {
              return `
              <div class="p5-adr-card" data-adr-index="${i}">
                <div class="p5-field" style="grid-column:1/-1;">
                  <label>ADR ${i + 1}</label>
                </div>
                <div class="p5-field" style="grid-column:1/-1;">
                  <label>อาการ</label>
                  <input type="text" data-role="adr-symptom" value="${a.symptom || ""}" placeholder="เช่น ผื่น, คัน, หายใจลำบาก" />
                </div>
                <div class="p5-field">
                  <label>วันที่เกิด</label>
                  <input type="date" data-role="adr-start-date" value="${a.startDate || ""}" />
                </div>
                <div class="p5-field">
                  <label>เวลาที่เกิด</label>
                  <input type="time" data-role="adr-start-time" value="${a.startTime || ""}" />
                </div>
                <div class="p5-field">
                  <label>วันที่หาย</label>
                  <input type="date" data-role="adr-end-date" value="${a.endDate || ""}" />
                </div>
                <div class="p5-field">
                  <label>เวลาที่หาย</label>
                  <input type="time" data-role="adr-end-time" value="${a.endTime || ""}" />
                </div>
              </div>
            `;
            })
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

        <div class="p5-footer-btns">
          <button id="p5BackBtn" class="p5-clear" type="button">⬅ กลับหน้า 4</button>
          <button id="p5ClearBtn" class="p5-clear" type="button">🗑️ ล้างข้อมูลหน้านี้</button>
          <button id="p5ToPage6Btn" class="p5-next" type="button">ไปหน้า 6 (สรุปการประเมิน) ➜</button>
        </div>
      </div>
    `;

    // ผูกปุ่มเพิ่ม
    document.getElementById("p5AddDrugBtn")?.addEventListener("click", () => {
      store.drugLines.push({
        name: "",
        startDate: "",
        startTime: "",
        stopDate: "",
        stopTime: "",
      });
      window.saveDrugAllergyData?.();
      window.renderPage5();
      drawTimeline();
    });

    document.getElementById("p5AddAdrBtn")?.addEventListener("click", () => {
      store.adrLines.push({
        symptom: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
      });
      window.saveDrugAllergyData?.();
      window.renderPage5();
      drawTimeline();
    });

    // ล้างข้อมูลหน้า 5
    document.getElementById("p5ClearBtn")?.addEventListener("click", () => {
      store.drugLines = [];
      store.adrLines = [];
      window.saveDrugAllergyData?.();
      window.renderPage5();
      drawTimeline();
    });

    // ย้อนกลับหน้า 4
    document.getElementById("p5BackBtn")?.addEventListener("click", () => {
      const btn = document.querySelector('.tabs button[data-target="page4"]');
      if (btn) btn.click();
    });

    // ไปหน้า 6
    document.getElementById("p5ToPage6Btn")?.addEventListener("click", () => {
      const btn = document.querySelector('.tabs button[data-target="page6"]');
      if (btn) btn.click();
    });

    // ผูก input ของยา
    root.querySelectorAll("[data-role='drug-name']").forEach((el) => {
      el.addEventListener("input", (ev) => {
        const card = ev.target.closest(".p5-drug-card");
        const idx = Number(card.dataset.index);
        store.drugLines[idx].name = ev.target.value;
        window.saveDrugAllergyData?.();
        drawTimeline();
      });
    });
    root.querySelectorAll("[data-role='drug-start-date']").forEach((el) => {
      el.addEventListener("change", (ev) => {
        const card = ev.target.closest(".p5-drug-card");
        const idx = Number(card.dataset.index);
        store.drugLines[idx].startDate = ev.target.value;
        window.saveDrugAllergyData?.();
        drawTimeline();
      });
    });
    root.querySelectorAll("[data-role='drug-stop-date']").forEach((el) => {
      el.addEventListener("change", (ev) => {
        const card = ev.target.closest(".p5-drug-card");
        const idx = Number(card.dataset.index);
        store.drugLines[idx].stopDate = ev.target.value;
        window.saveDrugAllergyData?.();
        drawTimeline();
      });
    });

    // ผูก input ของ ADR
    root.querySelectorAll("[data-role='adr-symptom']").forEach((el) => {
      el.addEventListener("input", (ev) => {
        const card = ev.target.closest(".p5-adr-card");
        const idx = Number(card.dataset.adrIndex);
        store.adrLines[idx].symptom = ev.target.value;
        window.saveDrugAllergyData?.();
        drawTimeline();
      });
    });
    root.querySelectorAll("[data-role='adr-start-date']").forEach((el) => {
      el.addEventListener("change", (ev) => {
        const card = ev.target.closest(".p5-adr-card");
        const idx = Number(card.dataset.adrIndex);
        store.adrLines[idx].startDate = ev.target.value;
        window.saveDrugAllergyData?.();
        drawTimeline();
      });
    });
    root.querySelectorAll("[data-role='adr-end-date']").forEach((el) => {
      el.addEventListener("change", (ev) => {
        const card = ev.target.closest(".p5-adr-card");
        const idx = Number(card.dataset.adrIndex);
        store.adrLines[idx].endDate = ev.target.value;
        window.saveDrugAllergyData?.();
        drawTimeline();
      });
    });

    // สุดท้าย วาด timeline
    drawTimeline();
  };

  // ===== drawTimeline เวอร์ชันตรงวันที่เป๊ะ =====
  function drawTimeline() {
    const dateRow = document.getElementById("p5DateRow");
    const drugLane = document.getElementById("p5DrugLane");
    const adrLane = document.getElementById("p5AdrLane");
    if (!dateRow || !drugLane || !adrLane) return;

    const store = window.drugAllergyData || {};
    const p5 = store.page5 || { drugLines: [], adrLines: [] };
    const drugs = Array.isArray(p5.drugLines) ? p5.drugLines : [];
    const adrs = Array.isArray(p5.adrLines) ? p5.adrLines : [];

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

    // หา minDate
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
    const maxDate = today;

    const DAY_W = 120;
    const totalDays =
      Math.floor((maxDate.getTime() - minDate.getTime()) / MS_DAY) + 1;

    // วาดแถววันที่
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

    // เคลียร์เลน
    drugLane.innerHTML = "";
    adrLane.innerHTML = "";

    function dateToIndex(date) {
      return Math.floor((date.getTime() - minDate.getTime()) / MS_DAY);
    }
    function indexToLeftPx(idx) {
      return idx * DAY_W;
    }
    function widthFromIdx(startIdx, endIdx) {
      const days = endIdx - startIdx + 1;
      return days * DAY_W;
    }

    // วาดยา
    drugs.forEach((d, i) => {
      const s = parseDate(d.startDate);
      if (!s) return;
      const eRaw = d.stopDate;
      let e = eRaw ? parseDate(eRaw) : maxDate;
      if (!e) e = maxDate;
      if (e < s) e = s;

      const sIdx = dateToIndex(s);
      const eIdx = dateToIndex(e);

      const bar = document.createElement("div");
      bar.className = "p5-bar p5-bar-drug";
      bar.textContent = d.name || `ยาตัวที่ ${i + 1}`;
      bar.title = `${bar.textContent}\nเริ่ม: ${s.toLocaleDateString("th-TH")} ${
        eRaw ? "หยุด: " + e.toLocaleDateString("th-TH") : "(ongoing)"
      }`;
      bar.style.left = indexToLeftPx(sIdx) + "px";
      bar.style.width = widthFromIdx(sIdx, eIdx) + "px";
      drugLane.appendChild(bar);
    });

    // วาด ADR
    adrs.forEach((a, i) => {
      const s = parseDate(a.startDate);
      if (!s) return;
      const eRaw = a.endDate;
      let e = eRaw ? parseDate(eRaw) : maxDate;
      if (!e) e = maxDate;
      if (e < s) e = s;

      const sIdx = dateToIndex(s);
      const eIdx = dateToIndex(e);

      const bar = document.createElement("div");
      bar.className = "p5-bar p5-bar-adr";
      bar.textContent = a.symptom || `ADR ${i + 1}`;
      bar.title = `${bar.textContent}\nเริ่ม: ${s.toLocaleDateString("th-TH")} ${
        eRaw ? "หาย: " + e.toLocaleDateString("th-TH") : "(ongoing)"
      }`;
      bar.style.left = indexToLeftPx(sIdx) + "px";
      bar.style.width = widthFromIdx(sIdx, eIdx) + "px";
      adrLane.appendChild(bar);
    });

    const scrollWrap = document.getElementById("p5TimelineScroll");
    if (scrollWrap) {
      scrollWrap.scrollLeft = scrollWrap.scrollWidth;
    }
  }
})();

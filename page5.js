// page5.js
// ===============================
// หน้า 5 — Timeline ประเมินการแพ้ยา
// ===============================
(function () {
  // ให้มีตัวแปรกลาง
  const root = (window.drugAllergyData = window.drugAllergyData || {});
  if (!root.page5) {
    root.page5 = {
      // มีรายการยาอย่างน้อย 1 ช่อง
      drugLines: [
        {
          id: "d" + Date.now(),
          name: "",
          startDate: "",
          startTime: "",
          stopDate: "",
          stopTime: "",
        },
      ],
      adrLines: [],
    };
  }

  // ===================== helper วันที่ =====================
  const MS_DAY = 24 * 60 * 60 * 1000;

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

  function addDays(d, n) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }

  // ===================== ฟังก์ชันวาด timeline =====================
  function drawTimeline() {
    const dateRow = document.getElementById("p5DateRow");
    const drugLane = document.getElementById("p5DrugLane");
    const adrLane = document.getElementById("p5AdrLane");
    const scrollWrap = document.getElementById("p5TimelineScroll");

    if (!dateRow || !drugLane || !adrLane) return;

    const data = window.drugAllergyData || {};
    const p5 = data.page5 || { drugLines: [], adrLines: [] };
    const drugs = Array.isArray(p5.drugLines) ? p5.drugLines : [];
    const adrs = Array.isArray(p5.adrLines) ? p5.adrLines : [];

    // วันนี้
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // หา minDate จากทุกอย่าง
    let minDate = null;

    drugs.forEach((d) => {
      const s = parseDate(d.startDate);
      if (s && (!minDate || s < minDate)) minDate = s;
    });
    adrs.forEach((a) => {
      const s = parseDate(a.startDate);
      if (s && (!minDate || s < minDate)) minDate = s;
    });

    // ถ้าไม่มีข้อมูลเลย ให้โชว์วันนี้อย่างเดียว
    if (!minDate) {
      minDate = today;
    }

    // maxDate = วันนี้เสมอ
    const maxDate = today;

    // วาดแกนวันที่
    const DAY_W = 120;
    const totalDays =
      Math.floor((maxDate.getTime() - minDate.getTime()) / MS_DAY) + 1;

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
      const diff = Math.floor((date.getTime() - minDate.getTime()) / MS_DAY);
      return diff * DAY_W;
    }

    // ไม่บวก 1 วันอีกแล้ว → จะได้ตรงวัน
    function calcWidthPx(startDate, endDate) {
      const diff = Math.floor(
        (endDate.getTime() - startDate.getTime()) / MS_DAY
      ); // 0,1,2,...
      const base = DAY_W - 24; // ความกว้างขั้นต่ำ
      if (diff <= 0) return base;
      return diff * DAY_W + base;
    }

    // ===== วาดยา =====
    drugs.forEach((d, idx) => {
      const start = parseDate(d.startDate);
      if (!start) return;

      const endRaw = d.stopDate ? parseDate(d.stopDate) : null;
      let endDate = endRaw ? endRaw : maxDate;
      if (endDate < start) endDate = start;

      const bar = document.createElement("div");
      bar.className = "p5-bar p5-bar-drug";
      bar.textContent = d.name ? d.name : `ยาตัวที่ ${idx + 1}`;

      bar.style.left = dateToLeftPx(start) + "px";
      bar.style.width = calcWidthPx(start, endDate) + "px";

      drugLane.appendChild(bar);
    });

    // ===== วาด ADR =====
    adrs.forEach((a, idx) => {
      const start = parseDate(a.startDate);
      if (!start) return;

      const endRaw = a.endDate ? parseDate(a.endDate) : null;
      let endDate = endRaw ? endRaw : maxDate;
      if (endDate < start) endDate = start;

      const bar = document.createElement("div");
      bar.className = "p5-bar p5-bar-adr";
      bar.textContent = a.symptom ? a.symptom : `ADR ${idx + 1}`;

      bar.style.left = dateToLeftPx(start) + "px";
      bar.style.width = calcWidthPx(start, endDate) + "px";

      adrLane.appendChild(bar);
    });

    // เลื่อนไปด้านขวาหน่อยให้เห็นวันนี้
    if (scrollWrap) {
      scrollWrap.scrollLeft = scrollWrap.scrollWidth;
    }
  }

  // ===================== render หลัก =====================
  window.renderPage5 = function () {
    const host = document.getElementById("page5");
    if (!host) return;

    const p5 = window.drugAllergyData.page5;

    host.innerHTML = `
      <div class="p5-wrapper">
        <div class="p5-header-line">
          <h2><span style="font-size:1.25rem">📅</span> หน้า 5 Timeline ประเมินการแพ้ยา</h2>
          <div class="p5-btn-group">
            <button type="button" class="p5-btn-add-drug" data-action="add-drug">+ เพิ่มยา</button>
            <button type="button" class="p5-btn-add-adr" data-action="add-adr">+ เพิ่ม ADR</button>
          </div>
        </div>

        <!-- รายการยา -->
        <div class="p5-form-block" id="p5DrugList">
          <div class="p5-sec-title">💊 รายการยา</div>
          ${
            (p5.drugLines || [])
              .map(
                (row, idx) => `
            <div class="p5-drug-card">
              <div class="p5-field">
                <label>ยาตัวที่ ${idx + 1}</label>
                <input type="text" data-role="drug-name" data-id="${row.id}" value="${
                  row.name || ""
                }" placeholder="ระบุชื่อยา" />
              </div>
              <div class="p5-field">
                <label>เริ่มให้ยา</label>
                <input type="date" data-role="drug-startDate" data-id="${row.id}" value="${
                  row.startDate || ""
                }" />
              </div>
              <div class="p5-field">
                <label>เวลา</label>
                <input type="time" data-role="drug-startTime" data-id="${row.id}" value="${
                  row.startTime || ""
                }" />
              </div>
              <div class="p5-field">
                <label>หยุดยา</label>
                <input type="date" data-role="drug-stopDate" data-id="${row.id}" value="${
                  row.stopDate || ""
                }" />
              </div>
              <div class="p5-field">
                <label>เวลา</label>
                <input type="time" data-role="drug-stopTime" data-id="${row.id}" value="${
                  row.stopTime || ""
                }" />
              </div>
              <div class="p5-field p5-field-del">
                <button type="button" class="p5-del-btn" data-action="del-drug" data-id="${
                  row.id
                }">ลบ</button>
              </div>
            </div>
          `
              )
              .join("")
          }
        </div>

        <!-- รายการ ADR -->
        <div class="p5-form-block" id="p5AdrList">
          <div class="p5-sec-title">💉 ADR (Adverse Drug Reaction)</div>
          ${
            (p5.adrLines || [])
              .map(
                (row, idx) => `
            <div class="p5-adr-card">
              <div class="p5-field">
                <label>ADR ${idx + 1}</label>
                <input type="text" data-role="adr-symptom" data-id="${row.id}" value="${
                  row.symptom || ""
                }" placeholder="อาการ" />
              </div>
              <div class="p5-field">
                <label>วันที่เกิด</label>
                <input type="date" data-role="adr-startDate" data-id="${row.id}" value="${
                  row.startDate || ""
                }" />
              </div>
              <div class="p5-field">
                <label>เวลาที่เกิด</label>
                <input type="time" data-role="adr-startTime" data-id="${row.id}" value="${
                  row.startTime || ""
                }" />
              </div>
              <div class="p5-field">
                <label>วันที่หาย</label>
                <input type="date" data-role="adr-endDate" data-id="${row.id}" value="${
                  row.endDate || ""
                }" />
              </div>
              <div class="p5-field">
                <label>เวลาที่หาย</label>
                <input type="time" data-role="adr-endTime" data-id="${row.id}" value="${
                  row.endTime || ""
                }" />
              </div>
              <div class="p5-field p5-field-del">
                <button type="button" class="p5-del-btn" data-action="del-adr" data-id="${
                  row.id
                }">ลบ</button>
              </div>
            </div>
          `
              )
              .join("")
          }
        </div>

        <!-- timeline -->
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
          <button type="button" class="p5-next" data-action="go-summary">ไปหน้า 6 (สรุป)</button>
          <button type="button" class="p5-clear" data-action="clear-all">ล้าง & โหลดใหม่</button>
        </div>
      </div>
    `;

    // ---------- event delegation ทั้งหน้า ----------
    host.onclick = function (ev) {
      const btn = ev.target.closest("[data-action]");
      if (!btn) return;
      const act = btn.getAttribute("data-action");

      // เพิ่มยา
      if (act === "add-drug") {
        root.page5.drugLines.push({
          id: "d" + Date.now(),
          name: "",
          startDate: "",
          startTime: "",
          stopDate: "",
          stopTime: "",
        });
        window.saveDrugAllergyData && window.saveDrugAllergyData();
        window.renderPage5();
        return;
      }

      // เพิ่ม ADR
      if (act === "add-adr") {
        root.page5.adrLines.push({
          id: "a" + Date.now(),
          symptom: "",
          startDate: "",
          startTime: "",
          endDate: "",
          endTime: "",
        });
        window.saveDrugAllergyData && window.saveDrugAllergyData();
        window.renderPage5();
        return;
      }

      // ลบยา
      if (act === "del-drug") {
        const id = btn.getAttribute("data-id");
        root.page5.drugLines = root.page5.drugLines.filter((x) => x.id !== id);
        window.saveDrugAllergyData && window.saveDrugAllergyData();
        window.renderPage5();
        return;
      }

      // ลบ ADR
      if (act === "del-adr") {
        const id = btn.getAttribute("data-id");
        root.page5.adrLines = root.page5.adrLines.filter((x) => x.id !== id);
        window.saveDrugAllergyData && window.saveDrugAllergyData();
        window.renderPage5();
        return;
      }

      // ล้างทั้งหมด
      if (act === "clear-all") {
        root.page5 = { drugLines: [], adrLines: [] };
        window.saveDrugAllergyData && window.saveDrugAllergyData();
        window.renderPage5();
        return;
      }

      // ไปหน้า 6
      if (act === "go-summary") {
        window.saveDrugAllergyData && window.saveDrugAllergyData();
        const tab6 = document.querySelector('.tabs button[data-target="page6"]');
        if (tab6) tab6.click();
      }
    };

    // ---------- input delegation ----------
    host.oninput = function (ev) {
      const t = ev.target;
      const role = t.getAttribute("data-role");
      const id = t.getAttribute("data-id");
      if (!role || !id) return;

      // ยา
      if (role.startsWith("drug-")) {
        const row = root.page5.drugLines.find((x) => x.id === id);
        if (!row) return;
        if (role === "drug-name") row.name = t.value;
        if (role === "drug-startDate") row.startDate = t.value;
        if (role === "drug-startTime") row.startTime = t.value;
        if (role === "drug-stopDate") row.stopDate = t.value;
        if (role === "drug-stopTime") row.stopTime = t.value;
      }

      // ADR
      if (role.startsWith("adr-")) {
        const row = root.page5.adrLines.find((x) => x.id === id);
        if (!row) return;
        if (role === "adr-symptom") row.symptom = t.value;
        if (role === "adr-startDate") row.startDate = t.value;
        if (role === "adr-startTime") row.startTime = t.value;
        if (role === "adr-endDate") row.endDate = t.value;
        if (role === "adr-endTime") row.endTime = t.value;
      }

      window.saveDrugAllergyData && window.saveDrugAllergyData();
      drawTimeline();
    };

    // วาด timeline ครั้งแรก
    drawTimeline();
  };
})();

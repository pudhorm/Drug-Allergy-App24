// ===== หน้า 5: Timeline ประเมินการแพ้ยา =====
(function () {
  const MS_DAY = 24 * 60 * 60 * 1000;
  const CELL = 120; // ความกว้างต่อ 1 วัน (px)

  // เตรียมที่เก็บในตัวแอพ
  if (!window.drugAllergyData) window.drugAllergyData = {};
  if (!window.drugAllergyData.page5) {
    window.drugAllergyData.page5 = { drugs: [], adrs: [] };
  }
  const store = window.drugAllergyData.page5;

  // ------------ helper วันที่ ------------
  function toMidnight(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  function parseDate(dateStr, timeStr) {
    if (!dateStr) return null;
    const parts = dateStr.split("-");
    if (parts.length !== 3) return null;
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const dd = Number(parts[2]);
    let hh = 0;
    let mm = 0;
    if (timeStr && /^\d{2}:\d{2}$/.test(timeStr)) {
      const tt = timeStr.split(":");
      hh = Number(tt[0]);
      mm = Number(tt[1]);
    }
    return new Date(y, m - 1, dd, hh, mm, 0, 0);
  }
  function fmtDate(d) {
    try {
      return d.toISOString().slice(0, 10);
    } catch {
      return "";
    }
  }
  function diffDaysInclusive(a, b) {
    const A = toMidnight(a).getTime();
    const B = toMidnight(b).getTime();
    return Math.max(1, Math.floor((B - A) / MS_DAY) + 1);
  }

  // ------------ สร้าง object เริ่มต้น ------------
  function newDrug() {
    return {
      name: "",
      startDate: "",
      startTime: "",
      stopDate: "",
      stopTime: ""
    };
  }
  function newADR() {
    return {
      name: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: ""
    };
  }

  // ------------ วาดฟอร์มกรอก ------------
  function renderForms(root) {
    const drugBox = root.querySelector("#tl-drug-list");
    const adrBox = root.querySelector("#tl-adr-list");

    const drugsHtml = store.drugs
      .map((item, i) => {
        return `
        <div class="tl-card tl-drug-card">
          <div class="tl-row2">
            <label>ชื่อยา</label>
            <input type="text" value="${item.name || ""}" data-kind="drug" data-idx="${i}" data-key="name" placeholder="ระบุชื่อยา" />
          </div>
          <div class="tl-grid2">
            <div>
              <label>เริ่มให้ยา</label>
              <div class="tl-inline">
                <input type="date" value="${item.startDate || ""}" data-kind="drug" data-idx="${i}" data-key="startDate" />
                <input type="time" value="${item.startTime || ""}" data-kind="drug" data-idx="${i}" data-key="startTime" />
              </div>
            </div>
            <div>
              <label>หยุดยา</label>
              <div class="tl-inline">
                <input type="date" value="${item.stopDate || ""}" data-kind="drug" data-idx="${i}" data-key="stopDate" />
                <input type="time" value="${item.stopTime || ""}" data-kind="drug" data-idx="${i}" data-key="stopTime" />
              </div>
            </div>
          </div>
          <button class="tl-del" data-del="drug" data-idx="${i}">ลบ</button>
        </div>
      `;
      })
      .join("");

    const adrsHtml = store.adrs
      .map((item, i) => {
        return `
        <div class="tl-card tl-adr-card">
          <div class="tl-row2">
            <label>อาการ</label>
            <input type="text" value="${item.name || ""}" data-kind="adr" data-idx="${i}" data-key="name" placeholder="ระบุอาการ เช่น ผื่น, คัน, บวม" />
          </div>
          <div class="tl-grid2">
            <div>
              <label>วันที่เกิด</label>
              <div class="tl-inline">
                <input type="date" value="${item.startDate || ""}" data-kind="adr" data-idx="${i}" data-key="startDate" />
                <input type="time" value="${item.startTime || ""}" data-kind="adr" data-idx="${i}" data-key="startTime" />
              </div>
            </div>
            <div>
              <label>วันที่หาย</label>
              <div class="tl-inline">
                <input type="date" value="${item.endDate || ""}" data-kind="adr" data-idx="${i}" data-key="endDate" />
                <input type="time" value="${item.endTime || ""}" data-kind="adr" data-idx="${i}" data-key="endTime" />
              </div>
            </div>
          </div>
          <button class="tl-del" data-del="adr" data-idx="${i}">ลบ</button>
        </div>
      `;
      })
      .join("");

    drugBox.innerHTML = drugsHtml || `<div class="tl-note">ยังไม่มีรายการยา</div>`;
    adrBox.innerHTML = adrsHtml || `<div class="tl-note">ยังไม่มีรายการ ADR</div>`;

    // bind input
    root.querySelectorAll("input[data-kind]").forEach((inp) => {
      inp.addEventListener("input", () => {
        const k = inp.dataset.kind;
        const idx = Number(inp.dataset.idx);
        const key = inp.dataset.key;
        if (k === "drug") {
          store.drugs[idx][key] = inp.value;
        } else {
          store.adrs[idx][key] = inp.value;
        }
      });
    });

    // bind delete
    root.querySelectorAll("button[data-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const k = btn.dataset.del;
        const idx = Number(btn.dataset.idx);
        if (k === "drug") {
          store.drugs.splice(idx, 1);
        } else {
          store.adrs.splice(idx, 1);
        }
        renderPage5();
      });
    });
  }

  // ------------ คำนวณช่วงแกน X ให้ถึงวันนี้เสมอ ------------
  function buildAxis(drugs, adrs) {
    const today = toMidnight(new Date());
    let minStart = today;
    let maxEnd = today;

    const allDates = [];

    drugs.forEach((d) => {
      const s = parseDate(d.startDate, d.startTime);
      if (s) allDates.push(toMidnight(s));
      const e = parseDate(d.stopDate, d.stopTime);
      if (e) allDates.push(toMidnight(e));
    });

    adrs.forEach((a) => {
      const s = parseDate(a.startDate, a.startTime);
      if (s) allDates.push(toMidnight(s));
      const e = parseDate(a.endDate, a.endTime);
      if (e) allDates.push(toMidnight(e));
    });

    if (allDates.length > 0) {
      minStart = new Date(Math.min.apply(null, allDates.map((x) => x.getTime())));
      maxEnd = new Date(Math.max.apply(null, allDates.map((x) => x.getTime())));
    }

    // *** บังคับให้ปลายทางอย่างน้อย = วันนี้ ***
    if (maxEnd.getTime() < today.getTime()) {
      maxEnd = today;
    }

    return { axisStart: minStart, axisEnd: maxEnd, today };
  }

  // ------------ วาด tick ด้านบน ------------
  function renderTicks(ticksWrap, axisStart, axisEnd) {
    const days = diffDaysInclusive(axisStart, axisEnd);
    ticksWrap.style.width = days * CELL + "px";
    ticksWrap.innerHTML = "";
    for (let i = 0; i < days; i++) {
      const d = new Date(axisStart.getTime() + i * MS_DAY);
      const div = document.createElement("div");
      div.className = "tl-tick";
      div.style.left = i * CELL + "px";
      div.textContent = d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
      ticksWrap.appendChild(div);
    }
  }

  // ------------ วาดแถบ ------------
  function renderBars(gridWrap, axisStart, axisEnd, drugs, adrs) {
    const totalDays = diffDaysInclusive(axisStart, axisEnd);
    gridWrap.style.width = totalDays * CELL + "px";
    gridWrap.innerHTML = "";

    function makeRow(labelText) {
      const row = document.createElement("div");
      row.className = "tl-row";
      const label = document.createElement("div");
      label.className = "tl-ylabel";
      label.textContent = labelText;
      const track = document.createElement("div");
      track.className = "tl-track";
      row.appendChild(label);
      row.appendChild(track);
      gridWrap.appendChild(row);
      return track;
    }

    function makeBar(track, start, end, label, cls) {
      const leftDays = Math.max(0, Math.floor((toMidnight(start) - axisStart) / MS_DAY));
      const spanDays = diffDaysInclusive(start, end);
      const bar = document.createElement("div");
      bar.className = "tl-bar " + cls;
      bar.style.left = leftDays * CELL + 6 + "px";
      bar.style.width = Math.max(28, spanDays * CELL - 12) + "px";
      bar.textContent = label + " (" + fmtDate(start) + ")";
      track.appendChild(bar);
    }

    // แถวของยา
    drugs.forEach((d) => {
      const track = makeRow("ยา: " + (d.name || ""));
      const s = parseDate(d.startDate, d.startTime);
      if (!s) return;
      // ถ้าไม่ระบุหยุดยา → ยาวถึง axisEnd (ซึ่งถูกลากไปถึงวันนี้แล้ว)
      const eUser = parseDate(d.stopDate, d.stopTime);
      const e = eUser ? eUser : axisEnd;
      makeBar(track, s, e, d.name || "ยา", "drug");
    });

    // แถวของ ADR
    adrs.forEach((a) => {
      const track = makeRow("ADR: " + (a.name || ""));
      const s = parseDate(a.startDate, a.startTime);
      if (!s) return;
      const eUser = parseDate(a.endDate, a.endTime);
      const e = eUser ? eUser : axisEnd;
      makeBar(track, s, e, a.name || "ADR", "adr");
    });
  }

  // ------------ render timeline ------------
  function renderTimeline(root) {
    const drugs = store.drugs.slice();
    const adrs = store.adrs.slice();

    const axis = buildAxis(drugs, adrs);
    const ticksWrap = root.querySelector(".tl-ticks");
    const gridWrap = root.querySelector(".tl-canvas");

    renderTicks(ticksWrap, axis.axisStart, axis.axisEnd);
    renderBars(gridWrap, axis.axisStart, axis.axisEnd, drugs, adrs);

    const sc = root.querySelector(".tl-scroll");
    sc.classList.remove("hidden");
    // เลื่อนไปวันล่าสุด (วันนี้)
    sc.scrollLeft = sc.scrollWidth;
  }

  // ------------ bind ปุ่มต่างๆ ------------
  function bindActions(root) {
    // เพิ่มยา
    root.querySelector("#btn-add-drug").addEventListener("click", () => {
      store.drugs.push(newDrug());
      renderPage5();
    });
    // เพิ่ม ADR
    root.querySelector("#btn-add-adr").addEventListener("click", () => {
      store.adrs.push(newADR());
      renderPage5();
    });
    // สร้าง timeline
    root.querySelector("#btn-build-tl").addEventListener("click", () => {
      renderTimeline(root);
    });
    // print
    root.querySelector("#btn-print").addEventListener("click", () => {
      window.print();
    });
    // save แล้วไปหน้า 6
    root.querySelector("#btn-save-next").addEventListener("click", () => {
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();
      const tab6 = document.querySelector('.tabs button[data-target="page6"]');
      if (tab6) tab6.click();
    });
    // ล้าง
    root.querySelector("#btn-clear-this").addEventListener("click", () => {
      store.drugs = [];
      store.adrs = [];
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();
      renderPage5();
    });
  }

  // ------------ template html ------------
  function template() {
    return `
      <div class="tl-wrapper">
        <section class="tl-section tl-bg-soft">
          <div class="tl-head">
            <h2>ยา</h2>
            <button id="btn-add-drug" class="btn-green-solid">+ เพิ่มยาตัวใหม่</button>
          </div>
          <div id="tl-drug-list"></div>
        </section>

        <section class="tl-section tl-bg-soft-red">
          <div class="tl-head">
            <h2>ADR (Adverse Drug Reaction)</h2>
            <button id="btn-add-adr" class="btn-red-solid">+ เพิ่ม ADR</button>
          </div>
          <div id="tl-adr-list"></div>

          <div class="tl-actions-under-adr">
            <button id="btn-build-tl" class="btn-blue-solid">▶ สร้าง Timeline</button>
          </div>
        </section>

        <section class="tl-section">
          <h3>Visual Timeline</h3>
          <div class="tl-scroll hidden">
            <div class="tl-axis">
              <div class="tl-ticks"></div>
            </div>
            <div class="tl-canvas"></div>
          </div>
        </section>

        <div class="tl-bottom-actions">
          <button id="btn-print" class="btn-green-solid">🖨️ Print / PDF</button>
          <button id="btn-save-next" class="btn-purple-solid">บันทึกข้อมูลและไปหน้า 6</button>
          <button id="btn-clear-this" class="btn-red-solid">🗑️ ล้างข้อมูลหน้านี้</button>
        </div>
      </div>
    `;
  }

  // ------------ render หลัก ------------
  function renderPage5() {
    const root = document.getElementById("page5");
    if (!root) return;
    root.innerHTML = template();
    renderForms(root);
    bindActions(root);
  }

  // export
  window.renderPage5 = renderPage5;
})();

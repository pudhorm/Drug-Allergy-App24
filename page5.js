// page5.js
(function () {
  // ถ้า data.js ยังไม่ได้สร้างโครงไว้ ก็สร้างให้
  if (!window.drugAllergyData) {
    window.drugAllergyData = {};
  }
  if (!window.drugAllergyData.timeline) {
    window.drugAllergyData.timeline = {
      drugs: [],
      adrs: []
    };
  }

  // ---------- ฟังก์ชันช่วย ----------
  const TH_MONTH = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];

  function toDate(v) {
    if (!v) return null;
    // รองรับ 2025-11-01 และ 01/11/2025
    if (v.includes("/")) {
      const [d, m, y] = v.split("/");
      return new Date(Number(y), Number(m) - 1, Number(d));
    }
    return new Date(v);
  }

  function addDays(d, n) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() + n);
    return x;
  }

  // วันที่ปัจจุบันตามไทย
  function nowThaiDate() {
    // เวลาเครื่องผู้ใช้ + ใช้ offset ไทย
    const now = new Date();
    // บังคับไทย (+7)
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const th = new Date(utc + 7 * 60 * 60000);
    return th;
  }

  function fmtThaiDateLong(d) {
    const day = d.getDate();
    const month = TH_MONTH[d.getMonth()];
    const year = d.getFullYear() + 543;
    return `วัน${["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"][d.getDay()]}ที่ ${day} ${month} พ.ศ. ${year}`;
  }

  function fmtTime(d) {
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    const s = d.getSeconds().toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  // คำนวณจำนวนวันแบบเอาเฉพาะวันที่
  function diffDays(a, b) {
    const aa = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    const bb = new Date(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((bb - aa) / 86400000);
  }

  // ทำให้ end ไม่สั้นกว่า start
  function clampEnd(start, end) {
    if (end < start) return new Date(start.getFullYear(), start.getMonth(), start.getDate());
    return end;
  }

  // สร้างกล่องยา 1 กล่อง
  function renderDrugForm(idx, drug) {
    return `
      <div class="p5-drug-card" data-drug-index="${idx}">
        <div class="p5-field">
          <label>ชื่อยา</label>
          <input type="text" class="p5-drug-name" value="${drug.name || ""}" placeholder="ระบุชื่อยา เช่น Amoxicillin" />
        </div>
        <div class="p5-two-cols">
          <div class="p5-field">
            <label>เริ่มให้ยา</label>
            <div class="p5-inline">
              <input type="date" class="p5-drug-start" value="${drug.startDate || ""}">
              <input type="time" class="p5-drug-start-time" value="${drug.startTime || ""}">
            </div>
          </div>
          <div class="p5-field">
            <label>หยุดยา</label>
            <div class="p5-inline">
              <input type="date" class="p5-drug-end" value="${drug.endDate || ""}">
              <input type="time" class="p5-drug-end-time" value="${drug.endTime || ""}">
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // สร้างกล่อง ADR 1 กล่อง
  function renderAdrForm(idx, adr) {
    return `
      <div class="p5-adr-card" data-adr-index="${idx}">
        <div class="p5-field">
          <label>อาการ</label>
          <input type="text" class="p5-adr-name" value="${adr.name || ""}" placeholder="ระบุอาการ เช่น ผื่น, คัน, บวม" />
        </div>
        <div class="p5-two-cols">
          <div class="p5-field">
            <label>วันที่เกิด</label>
            <div class="p5-inline">
              <input type="date" class="p5-adr-start" value="${adr.startDate || ""}">
              <input type="time" class="p5-adr-start-time" value="${adr.startTime || ""}">
            </div>
          </div>
          <div class="p5-field">
            <label>วันที่หาย</label>
            <div class="p5-inline">
              <input type="date" class="p5-adr-end" value="${adr.endDate || ""}">
              <input type="time" class="p5-adr-end-time" value="${adr.endTime || ""}">
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // วาด timeline จริง
  function drawTimeline(root) {
    const box = root.querySelector(".p5-timeline-body");
    const { drugs, adrs } = window.drugAllergyData.timeline;

    // ดึงข้อมูลที่มีวันที่เริ่ม
    const entries = [];

    drugs.forEach((d) => {
      if (!d.startDate) return;
      const start = toDate(d.startDate);
      if (!start) return;

      // ถ้ามีวันหยุด → หยุดสั้นกว่าที่กรอก 1 วัน
      let end;
      if (d.endDate) {
        end = addDays(toDate(d.endDate), -1);
      } else {
        // ongoing → วันนี้ - 1
        end = addDays(nowThaiDate(), -1);
      }
      end = clampEnd(start, end);

      entries.push({
        kind: "drug",
        label: d.name || "ยาไม่ระบุชื่อ",
        start,
        end
      });
    });

    adrs.forEach((a) => {
      if (!a.startDate) return;
      const start = toDate(a.startDate);
      if (!start) return;

      let end;
      if (a.endDate) {
        end = addDays(toDate(a.endDate), -1);
      } else {
        end = addDays(nowThaiDate(), -1);
      }
      end = clampEnd(start, end);

      entries.push({
        kind: "adr",
        label: a.name || "ADR ไม่ระบุ",
        start,
        end
      });
    });

    if (entries.length === 0) {
      box.innerHTML = `<p class="p5-empty-tl">ยังไม่มีข้อมูล timeline จากหน้านี้</p>`;
      return;
    }

    // หาวันเริ่ม-วันจบรวม (ให้เริ่ม -1 วัน)
    let minStart = entries[0].start;
    let maxEnd = entries[0].end;
    entries.forEach((e) => {
      if (e.start < minStart) minStart = e.start;
      if (e.end > maxEnd) maxEnd = e.end;
    });

    // เริ่มก่อน 1 วัน
    minStart = addDays(minStart, -1);

    // สร้างวันที่
    const totalDays = diffDays(minStart, maxEnd) + 1;
    const DAY_W = 110; // px ต่อวัน
    const innerW = totalDays * DAY_W;

    let dateRowHtml = `<div class="p5-date-row" style="width:${innerW}px">`;
    for (let i = 0; i < totalDays; i++) {
      const d = addDays(minStart, i);
      dateRowHtml += `<div class="p5-date-cell">${d.getDate()} ${TH_MONTH[d.getMonth()]}</div>`;
    }
    dateRowHtml += `</div>`;

    // แถว timeline
    let laneHtml = "";
    entries.forEach((e, idx) => {
      const offsetDays = diffDays(minStart, e.start);
      const spanDays = diffDays(e.start, e.end) + 1; // แสดงผล -1 แล้วข้างบน
      const left = offsetDays * DAY_W;
      const width = Math.max(spanDays * DAY_W - 12, 60); // กันเหลือ 0
      const colorClass = e.kind === "drug" ? "p5-bar-drug" : "p5-bar-adr";

      laneHtml += `
        <div class="p5-lane">
          <div class="p5-lane-label ${e.kind === "adr" ? "p5-lane-adr" : ""}">${e.kind === "adr" ? "ADR:" : "ยา:"} ${e.label}</div>
          <div class="p5-lane-track" style="width:${innerW}px">
            <div class="p5-bar ${colorClass}" style="left:${left}px;width:${width}px;">
              ${e.label} (${e.start.getFullYear()}-${(e.start.getMonth()+1).toString().padStart(2,"0")}-${e.start.getDate().toString().padStart(2,"0")})
            </div>
          </div>
        </div>
      `;
    });

    box.innerHTML = `
      <div class="p5-tl-scroll">
        ${dateRowHtml}
        ${laneHtml}
      </div>
    `;
  }

  // ---------- render หลักของหน้า 5 ----------
  window.renderPage5 = function () {
    const host = document.getElementById("page5");
    if (!host) return;

    host.innerHTML = `
      <div class="p5-shell">
        <div class="p5-header-line">
          <h2>หน้า 5 Timeline ประเมินการแพ้ยา</h2>
          <div class="p5-btn-group">
            <button class="p5-btn-add-drug">+ เพิ่มยาตัวใหม่</button>
            <button class="p5-btn-del-drug">ลบยาตัวล่าสุด</button>
            <button class="p5-btn-add-adr red">+ เพิ่ม ADR</button>
            <button class="p5-btn-del-adr">ลบ ADR ล่าสุด</button>
          </div>
        </div>

        <div class="p5-form-block p5-drug-block">
          <h3>รายการยา</h3>
          <div class="p5-drug-list"></div>
        </div>

        <div class="p5-form-block p5-adr-block">
          <h3>ADR (Adverse Drug Reaction)</h3>
          <div class="p5-adr-list"></div>
        </div>

        <div class="p5-action-line">
          <button class="p5-btn-build">▶ สร้าง Timeline</button>
        </div>

        <div class="p5-nowbar">
          <span class="p5-now-icon">📅</span>
          <span class="p5-now-text">--</span>
        </div>

        <div class="p5-timeline-box">
          <h3>Visual Timeline</h3>
          <div class="p5-timeline-body"></div>
        </div>

        <div class="p5-footer-btns">
          <button class="p5-print">🖨 Print / PDF</button>
          <button class="p5-next">บันทึกข้อมูลและไปหน้า 6</button>
          <button class="p5-clear">🗑 ล้างข้อมูลหน้านี้</button>
        </div>
      </div>
    `;

    const data = window.drugAllergyData.timeline;
    const drugListEl = host.querySelector(".p5-drug-list");
    const adrListEl = host.querySelector(".p5-adr-list");

    // ฟังก์ชันโชว์ฟอร์ม
    function refreshForms() {
      // ยา
      drugListEl.innerHTML = data.drugs.map((d, i) => renderDrugForm(i, d)).join("");
      // ADR
      adrListEl.innerHTML = data.adrs.map((a, i) => renderAdrForm(i, a)).join("");

      // bind เปลี่ยนค่า
      drugListEl.querySelectorAll(".p5-drug-card").forEach((card) => {
        const idx = Number(card.dataset.drugIndex);
        card.querySelector(".p5-drug-name").addEventListener("input", (e) => {
          data.drugs[idx].name = e.target.value;
        });
        card.querySelector(".p5-drug-start").addEventListener("input", (e) => {
          data.drugs[idx].startDate = e.target.value;
        });
        card.querySelector(".p5-drug-start-time").addEventListener("input", (e) => {
          data.drugs[idx].startTime = e.target.value;
        });
        card.querySelector(".p5-drug-end").addEventListener("input", (e) => {
          data.drugs[idx].endDate = e.target.value;
        });
        card.querySelector(".p5-drug-end-time").addEventListener("input", (e) => {
          data.drugs[idx].endTime = e.target.value;
        });
      });

      adrListEl.querySelectorAll(".p5-adr-card").forEach((card) => {
        const idx = Number(card.dataset.adrIndex);
        card.querySelector(".p5-adr-name").addEventListener("input", (e) => {
          data.adrs[idx].name = e.target.value;
        });
        card.querySelector(".p5-adr-start").addEventListener("input", (e) => {
          data.adrs[idx].startDate = e.target.value;
        });
        card.querySelector(".p5-adr-start-time").addEventListener("input", (e) => {
          data.adrs[idx].startTime = e.target.value;
        });
        card.querySelector(".p5-adr-end").addEventListener("input", (e) => {
          data.adrs[idx].endDate = e.target.value;
        });
        card.querySelector(".p5-adr-end-time").addEventListener("input", (e) => {
          data.adrs[idx].endTime = e.target.value;
        });
      });
    }

    // ถ้ายังไม่มีเลยให้ใส่เปล่าๆ 1 ช่อง
    if (data.drugs.length === 0) {
      data.drugs.push({ name: "", startDate: "", startTime: "", endDate: "", endTime: "" });
    }
    if (data.adrs.length === 0) {
      data.adrs.push({ name: "", startDate: "", startTime: "", endDate: "", endTime: "" });
    }
    refreshForms();
    drawTimeline(host);

    // ปุ่มต่างๆ
    host.querySelector(".p5-btn-add-drug").addEventListener("click", () => {
      data.drugs.push({ name: "", startDate: "", startTime: "", endDate: "", endTime: "" });
      refreshForms();
    });
    host.querySelector(".p5-btn-del-drug").addEventListener("click", () => {
      if (data.drugs.length > 0) {
        data.drugs.pop();
        refreshForms();
      }
    });
    host.querySelector(".p5-btn-add-adr").addEventListener("click", () => {
      data.adrs.push({ name: "", startDate: "", startTime: "", endDate: "", endTime: "" });
      refreshForms();
    });
    host.querySelector(".p5-btn-del-adr").addEventListener("click", () => {
      if (data.adrs.length > 0) {
        data.adrs.pop();
        refreshForms();
      }
    });

    host.querySelector(".p5-btn-build").addEventListener("click", () => {
      drawTimeline(host);
    });

    host.querySelector(".p5-clear").addEventListener("click", () => {
      data.drugs = [{ name: "", startDate: "", startTime: "", endDate: "", endTime: "" }];
      data.adrs = [{ name: "", startDate: "", startTime: "", endDate: "", endTime: "" }];
      refreshForms();
      drawTimeline(host);
    });

    host.querySelector(".p5-print").addEventListener("click", () => {
      window.print();
    });

    // อัพเดทวันที่/เวลา ไทย แบบ real-time
    const nowTextEl = host.querySelector(".p5-now-text");
    function updateNow() {
      const d = nowThaiDate();
      nowTextEl.textContent = `${fmtThaiDateLong(d)} เวลา ${fmtTime(d)}`;
    }
    updateNow();
    setInterval(updateNow, 1000);
  };
})();

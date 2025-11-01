// page5.js
(function () {
  const PAGE_ID = "page5";
  const DAY_MS = 24 * 60 * 60 * 1000;
  const DAY_WIDTH = 120; // 1 วัน = 120px
  const TH_TZ = "Asia/Bangkok";

  // ให้แน่ใจว่า window.drugAllergyData มีส่วนของ timeline
  if (!window.drugAllergyData) window.drugAllergyData = {};
  if (!window.drugAllergyData.timeline) {
    window.drugAllergyData.timeline = {
      drugs: [
        {
          name: "",
          startDate: "",
          startTime: "",
          endDate: "",
          endTime: ""
        }
      ],
      adrs: [
        {
          name: "",
          startDate: "",
          startTime: "",
          endDate: "",
          endTime: ""
        }
      ]
    };
  }

  // ----------------- helper date -----------------
  function getThaiNow() {
    // ดึงเวลาประเทศไทยทุกครั้ง
    const now = new Date();
    const thNow = new Date(
      now.toLocaleString("en-US", { timeZone: TH_TZ })
    );
    return thNow;
  }

  function toDateAtMidnightTH(str) {
    // รับ "dd/mm/yyyy" => date 00:00 ของไทย
    if (!str) return null;
    const parts = str.split("/");
    if (parts.length !== 3) return null;
    const dd = parseInt(parts[0], 10);
    const mm = parseInt(parts[1], 10);
    const yyyy = parseInt(parts[2], 10);
    if (!dd || !mm || !yyyy) return null;
    // สร้างตามโซนไทย
    const d = new Date();
    d.setFullYear(yyyy, mm - 1, dd);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function formatThaiDateTime(dt) {
    // เสาร์ที่ 1 พฤศจิกายน พ.ศ. 2568 เวลา 20:17:05
    const dayNames = [
      "วันอาทิตย์ที่",
      "วันจันทร์ที่",
      "วันอังคารที่",
      "วันพุธที่",
      "วันพฤหัสบดีที่",
      "วันศุกร์ที่",
      "วันเสาร์ที่"
    ];
    const monthNames = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม"
    ];
    const d = dt.getDate();
    const m = dt.getMonth();
    const y = dt.getFullYear();
    const h = dt.getHours().toString().padStart(2, "0");
    const mi = dt.getMinutes().toString().padStart(2, "0");
    const s = dt.getSeconds().toString().padStart(2, "0");
    return (
      `${dayNames[dt.getDay()]} ${d} ${monthNames[m]} พ.ศ. ${y + 543} เวลา ${h}:${mi}:${s}`
    );
  }

  function diffDays(a, b) {
    // ต่างกันกี่วันเต็มๆ (b >= a)
    const ad = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    const bd = new Date(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((bd - ad) / DAY_MS);
  }

  // ----------------- render form -----------------
  function renderForm() {
    const root = document.getElementById(PAGE_ID);
    if (!root) return;

    const { drugs, adrs } = window.drugAllergyData.timeline;

    root.innerHTML = `
      <div class="p5-wrapper p5-timeline-shell">
        <div class="p5-bg-layer"></div>
        <div class="p5-glitter-layer"></div>

        <!-- กลุ่มยา -->
        <div class="tl-section tl-drug-card">
          <div class="tl-head">
            <h2><span class="icon">💊</span> ยา</h2>
            <div class="tl-head-actions">
              <button type="button" class="tl-del-btn-all tl-hide" id="p5_delDrugRow">ลบแถวสุดท้าย</button>
              <button type="button" class="btn-green-solid" id="p5_addDrugBtn">+ เพิ่มยาตัวใหม่</button>
            </div>
          </div>
          <div id="p5_drugList"></div>
        </div>

        <!-- กลุ่ม ADR -->
        <div class="tl-section tl-adr-card">
          <div class="tl-head">
            <h2><span class="icon">🧴</span> ADR (Adverse Drug Reaction)</h2>
            <div class="tl-head-actions">
              <button type="button" class="tl-del-btn-all tl-hide" id="p5_delAdrRow">ลบแถวสุดท้าย</button>
              <button type="button" class="btn-red-solid" id="p5_addAdrBtn">+ เพิ่ม ADR</button>
            </div>
          </div>
          <div id="p5_adrList"></div>
          <div class="tl-actions-under-adr">
            <button id="p5_buildTimeline" type="button" class="btn-blue-solid">
              ▶️ สร้าง Timeline
            </button>
          </div>
        </div>

        <!-- แสดงวันเวลาปัจจุบัน -->
        <div id="p5_nowBox" class="p5-nowbox"></div>

        <!-- พื้นที่แสดง timeline -->
        <div class="tl-section" id="p5_timelineSection" style="display:block;">
          <h2 class="tl-title-line">Visual Timeline</h2>
          <div class="tl-scroll" id="p5_tlScroll">
            <div class="tl-axis" id="p5_tlAxis"></div>
            <div class="tl-canvas" id="p5_tlCanvas"></div>
          </div>
        </div>

        <!-- ปุ่มท้ายหน้า -->
        <div class="tl-bottom-actions-fixed">
          <button type="button" class="btn-green-solid" id="p5_printBtn">🖨 Print / PDF</button>
          <button type="button" class="btn-purple-solid" id="p5_saveGo6">บันทึกข้อมูลและไปหน้า 6</button>
          <button type="button" class="btn-red-solid" id="p5_clearThis">🗑 ล้างข้อมูลหน้านี้</button>
        </div>
      </div>
    `;

    const drugList = root.querySelector("#p5_drugList");
    const adrList = root.querySelector("#p5_adrList");

    // วาดแถว "ยา"
    drugList.innerHTML = "";
    drugs.forEach((d, idx) => {
      const row = document.createElement("div");
      row.className = "tl-card tl-drug-row";
      row.dataset.index = idx.toString();
      row.innerHTML = `
        <div class="tl-row-top">
          <label>ชื่อยา</label>
          <input type="text" class="tl-input tl-drug-name" value="${d.name || ""}" placeholder="ระบุชื่อยา เช่น Amoxicillin"/>
        </div>
        <div class="tl-grid2">
          <div>
            <label>เริ่มให้ยา</label>
            <div class="tl-inline">
              <input type="date" class="tl-input tl-drug-startDate" value="${d.startDate || ""}">
              <input type="time" class="tl-input tl-drug-startTime" value="${d.startTime || ""}">
            </div>
          </div>
          <div>
            <label>หยุดยา</label>
            <div class="tl-inline">
              <input type="date" class="tl-input tl-drug-endDate" value="${d.endDate || ""}">
              <input type="time" class="tl-input tl-drug-endTime" value="${d.endTime || ""}">
            </div>
          </div>
        </div>
      `;
      drugList.appendChild(row);
    });

    // วาดแถว "ADR"
    adrList.innerHTML = "";
    adrs.forEach((a, idx) => {
      const row = document.createElement("div");
      row.className = "tl-card tl-adr-row";
      row.dataset.index = idx.toString();
      row.innerHTML = `
        <div class="tl-row-top">
          <label>อาการ</label>
          <input type="text" class="tl-input tl-adr-name" value="${a.name || ""}" placeholder="ระบุอาการ เช่น ผื่น, คัน, บวม">
        </div>
        <div class="tl-grid2">
          <div>
            <label>วันที่เกิด</label>
            <div class="tl-inline">
              <input type="date" class="tl-input tl-adr-startDate" value="${a.startDate || ""}">
              <input type="time" class="tl-input tl-adr-startTime" value="${a.startTime || ""}">
            </div>
          </div>
          <div>
            <label>วันที่หาย</label>
            <div class="tl-inline">
              <input type="date" class="tl-input tl-adr-endDate" value="${a.endDate || ""}">
              <input type="time" class="tl-input tl-adr-endTime" value="${a.endTime || ""}">
            </div>
          </div>
        </div>
      `;
      adrList.appendChild(row);
    });

    // แสดง/ซ่อนปุ่มลบแถวสุดท้าย
    const delDrugBtn = root.querySelector("#p5_delDrugRow");
    const delAdrBtn = root.querySelector("#p5_delAdrRow");
    if (window.drugAllergyData.timeline.drugs.length > 1) {
      delDrugBtn.classList.remove("tl-hide");
    } else {
      delDrugBtn.classList.add("tl-hide");
    }
    if (window.drugAllergyData.timeline.adrs.length > 1) {
      delAdrBtn.classList.remove("tl-hide");
    } else {
      delAdrBtn.classList.add("tl-hide");
    }

    // bind
    root.querySelector("#p5_addDrugBtn").addEventListener("click", () => {
      window.drugAllergyData.timeline.drugs.push({
        name: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: ""
      });
      renderForm();
    });

    delDrugBtn.addEventListener("click", () => {
      if (window.drugAllergyData.timeline.drugs.length > 1) {
        window.drugAllergyData.timeline.drugs.pop();
        renderForm();
      }
    });

    root.querySelector("#p5_addAdrBtn").addEventListener("click", () => {
      window.drugAllergyData.timeline.adrs.push({
        name: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: ""
      });
      renderForm();
    });

    delAdrBtn.addEventListener("click", () => {
      if (window.drugAllergyData.timeline.adrs.length > 1) {
        window.drugAllergyData.timeline.adrs.pop();
        renderForm();
      }
    });

    // เก็บค่ากลับเข้า state ทันทีเวลาพิมพ์
    root.querySelectorAll(".tl-drug-row").forEach((row) => {
      const idx = parseInt(row.dataset.index, 10);
      row.querySelector(".tl-drug-name").addEventListener("input", (e) => {
        window.drugAllergyData.timeline.drugs[idx].name = e.target.value;
      });
      row.querySelector(".tl-drug-startDate").addEventListener("change", (e) => {
        window.drugAllergyData.timeline.drugs[idx].startDate = e.target.value;
      });
      row.querySelector(".tl-drug-startTime").addEventListener("change", (e) => {
        window.drugAllergyData.timeline.drugs[idx].startTime = e.target.value;
      });
      row.querySelector(".tl-drug-endDate").addEventListener("change", (e) => {
        window.drugAllergyData.timeline.drugs[idx].endDate = e.target.value;
      });
      row.querySelector(".tl-drug-endTime").addEventListener("change", (e) => {
        window.drugAllergyData.timeline.drugs[idx].endTime = e.target.value;
      });
    });

    root.querySelectorAll(".tl-adr-row").forEach((row) => {
      const idx = parseInt(row.dataset.index, 10);
      row.querySelector(".tl-adr-name").addEventListener("input", (e) => {
        window.drugAllergyData.timeline.adrs[idx].name = e.target.value;
      });
      row.querySelector(".tl-adr-startDate").addEventListener("change", (e) => {
        window.drugAllergyData.timeline.adrs[idx].startDate = e.target.value;
      });
      row.querySelector(".tl-adr-startTime").addEventListener("change", (e) => {
        window.drugAllergyData.timeline.adrs[idx].startTime = e.target.value;
      });
      row.querySelector(".tl-adr-endDate").addEventListener("change", (e) => {
        window.drugAllergyData.timeline.adrs[idx].endDate = e.target.value;
      });
      row.querySelector(".tl-adr-endTime").addEventListener("change", (e) => {
        window.drugAllergyData.timeline.adrs[idx].endTime = e.target.value;
      });
    });

    // สร้าง timeline
    root.querySelector("#p5_buildTimeline").addEventListener("click", () => {
      buildTimeline();
    });

    // ปุ่ม print
    root.querySelector("#p5_printBtn").addEventListener("click", () => {
      window.print();
    });

    // ปุ่มไปหน้า 6
    root.querySelector("#p5_saveGo6").addEventListener("click", () => {
      const btn = document.querySelector('.tabs button[data-target="page6"]');
      if (btn) btn.click();
    });

    // ล้างข้อมูลหน้านี้
    root.querySelector("#p5_clearThis").addEventListener("click", () => {
      window.drugAllergyData.timeline = {
        drugs: [
          { name: "", startDate: "", startTime: "", endDate: "", endTime: "" }
        ],
        adrs: [
          { name: "", startDate: "", startTime: "", endDate: "", endTime: "" }
        ]
      };
      renderForm();
      clearTimelineCanvas();
    });

    // อัปเดตเวลาปัจจุบันทุกวินาที
    const nowBox = root.querySelector("#p5_nowBox");
    function tickNow() {
      const th = getThaiNow();
      nowBox.textContent = formatThaiDateTime(th);
    }
    tickNow();
    setInterval(tickNow, 1000);
  }

  function clearTimelineCanvas() {
    const axis = document.getElementById("p5_tlAxis");
    const canvas = document.getElementById("p5_tlCanvas");
    if (axis) axis.innerHTML = "";
    if (canvas) canvas.innerHTML = "";
  }

  function buildTimeline() {
    const axis = document.getElementById("p5_tlAxis");
    const canvas = document.getElementById("p5_tlCanvas");
    if (!axis || !canvas) return;

    const { drugs, adrs } = window.drugAllergyData.timeline;

    // 1) หาวันที่เล็กสุด และวันที่ใหญ่สุด
    let minDate = null;
    let maxDate = null;

    function considerDate(str) {
      if (!str) return null;
      const d = new Date(str);
      if (isNaN(d.getTime())) return null;
      d.setHours(0, 0, 0, 0);
      return d;
    }

    drugs.forEach((d) => {
      const s = considerDate(d.startDate);
      if (s) {
        if (!minDate || s < minDate) minDate = s;
      }
      const e = considerDate(d.endDate);
      if (e) {
        if (!maxDate || e > maxDate) maxDate = e;
      }
    });
    adrs.forEach((a) => {
      const s = considerDate(a.startDate);
      if (s) {
        if (!minDate || s < minDate) minDate = s;
      }
      const e = considerDate(a.endDate);
      if (e) {
        if (!maxDate || e > maxDate) maxDate = e;
      }
    });

    // ถ้าไม่มีวันที่เลย ให้ใช้วันนี้เป็น min/max
    const todayTH = getThaiNow();
    todayTH.setHours(0, 0, 0, 0);
    if (!minDate) minDate = new Date(todayTH);
    // maxDate ต้องเป็น "มากสุดของข้อมูล" หรือ "วันนี้" แล้วแต่ใครมากกว่า
    if (!maxDate || maxDate < todayTH) {
      maxDate = new Date(todayTH);
    }

    // 2) สร้างแกน X จาก min -> max
    const totalDays = diffDays(minDate, maxDate) + 1; // จำนวนวันรวม
    const totalWidth = totalDays * DAY_WIDTH + 40;

    axis.innerHTML = "";
    axis.style.width = totalWidth + "px";

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(minDate.getTime() + i * DAY_MS);
      const tick = document.createElement("div");
      tick.className = "tl-tick";
      tick.style.left = i * DAY_WIDTH + 20 + "px";
      // แสดงแบบ 27 ต.ค.
      const day = d.getDate();
      const monthNames = [
        "ม.ค.",
        "ก.พ.",
        "มี.ค.",
        "เม.ย.",
        "พ.ค.",
        "มิ.ย.",
        "ก.ค.",
        "ส.ค.",
        "ก.ย.",
        "ต.ค.",
        "พ.ย.",
        "ธ.ค."
      ];
      const label = `${day} ${monthNames[d.getMonth()]}`;
      tick.textContent = label;
      axis.appendChild(tick);
    }

    // 3) วาดแถว Y
    canvas.innerHTML = "";
    canvas.style.width = totalWidth + "px";

    let rowIndex = 0;

    // --- แถวของยา ---
    drugs.forEach((d) => {
      const row = document.createElement("div");
      row.className = "tl-row";
      row.style.top = rowIndex * 60 + "px";
      const yLabel = document.createElement("div");
      yLabel.className = "tl-ylabel";
      yLabel.textContent = "ยา: " + (d.name || "");
      const track = document.createElement("div");
      track.className = "tl-track";
      row.appendChild(yLabel);
      row.appendChild(track);
      canvas.appendChild(row);

      // วาด bar ถ้ามีวันที่เริ่ม
      if (d.startDate) {
        const start = considerDate(d.startDate);
        let end = d.endDate ? considerDate(d.endDate) : null;
        // ถ้าไม่มี end -> ใช้วันนี้
        if (!end) {
          end = new Date(todayTH);
        }
        // คำนวณตำแหน่งซ้าย
        const startOffsetDays = diffDays(minDate, start);
        const left = startOffsetDays * DAY_WIDTH + 20;

        // ความยาว: ไม่ให้ยาวเกิน maxDate
        let endCap = end;
        if (endCap > maxDate) endCap = new Date(maxDate);
        const durDays = diffDays(start, endCap); // ตรงนี้สำคัญ: ไม่มี +1 แล้ว
        const width = Math.max(DAY_WIDTH * (durDays + 1) - 16, 50); // -16 กันล้นวันถัดไป

        const bar = document.createElement("div");
        bar.className = "tl-bar drug";
        bar.style.left = left + "px";
        bar.style.width = width + "px";
        bar.textContent = (d.name || "") + " (" + d.startDate + ")";
        track.appendChild(bar);
      }

      rowIndex++;
    });

    // --- แถวของ ADR ---
    adrs.forEach((a) => {
      const row = document.createElement("div");
      row.className = "tl-row";
      row.style.top = rowIndex * 60 + "px";
      const yLabel = document.createElement("div");
      yLabel.className = "tl-ylabel tl-ylabel-adr";
      yLabel.textContent = "ADR: " + (a.name || "");
      const track = document.createElement("div");
      track.className = "tl-track";
      row.appendChild(yLabel);
      row.appendChild(track);
      canvas.appendChild(row);

      if (a.startDate) {
        const start = considerDate(a.startDate);
        let end = a.endDate ? considerDate(a.endDate) : null;
        if (!end) {
          end = new Date(todayTH);
        }
        if (end > maxDate) end = new Date(maxDate);

        const startOffsetDays = diffDays(minDate, start);
        const left = startOffsetDays * DAY_WIDTH + 20;

        const durDays = diffDays(start, end);
        const width = Math.max(DAY_WIDTH * (durDays + 1) - 16, 50);

        const bar = document.createElement("div");
        bar.className = "tl-bar adr";
        bar.style.left = left + "px";
        bar.style.width = width + "px";
        bar.textContent = (a.name || "") + " (" + a.startDate + ")";
        track.appendChild(bar);
      }

      rowIndex++;
    });
  }

  // ----------------- expose -----------------
  window.renderPage5 = function () {
    renderForm();
    // สร้าง timeline จากข้อมูลที่มี (จะยังว่างก็ได้)
    buildTimeline();
  };
})();

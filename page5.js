// page5.js
(function () {
  // เตรียมตัวแปรรวมของแอพ
  if (!window.drugAllergyData) window.drugAllergyData = {};
  if (!window.drugAllergyData.timeline) {
    window.drugAllergyData.timeline = { drugs: [], adrs: [] };
  }

  // =============== ฟังก์ชันเรียกจาก index.html ===============
  window.renderPage5 = function () {
    const page = document.getElementById("page5");
    if (!page) return;

    page.innerHTML = `
      <div class="p5-wrapper" style="position:relative;">
        <div class="p5-glitter-layer"></div>

        <!-- กล่องยา -->
        <div class="tl-section tl-card p5-block" id="p5_drugSection">
          <div class="p5-block-head">
            <div class="p5-title-left">
              <span class="p5-icon">💊</span>
              <div>
                <div class="p5-title">ยา</div>
                <div class="p5-sub">ระบุชื่อยา + วันที่ให้ยา/หยุดยา</div>
              </div>
            </div>
            <div class="p5-head-actions">
              <button type="button" id="p5_delDrugBtn" class="p5-mini-del-btn">ลบตัวล่าสุด</button>
              <button type="button" id="p5_addDrugBtn" class="p5-add-green">+ เพิ่มยาตัวใหม่</button>
            </div>
          </div>
          <div id="p5_drugList"></div>
        </div>

        <!-- กล่อง ADR -->
        <div class="tl-section tl-card p5-block" id="p5_adrSection">
          <div class="p5-block-head">
            <div class="p5-title-left">
              <span class="p5-icon">🩷</span>
              <div>
                <div class="p5-title">ADR (Adverse Drug Reaction)</div>
                <div class="p5-sub">ใส่วันที่เริ่มมีอาการ และวันที่อาการหมด</div>
              </div>
            </div>
            <div class="p5-head-actions">
              <button type="button" id="p5_delAdrBtn" class="p5-mini-del-btn p5-mini-del-adr">ลบตัวล่าสุด</button>
              <button type="button" id="p5_addAdrBtn" class="p5-add-red">+ เพิ่ม ADR</button>
            </div>
          </div>
          <div id="p5_adrList"></div>

          <div style="margin-top:10px;">
            <button type="button" id="p5_buildBtn" class="p5-build-btn">▶ สร้าง Timeline</button>
          </div>
        </div>

        <!-- เวลาไทย -->
        <div id="p5_nowTH" class="p5-now-box">
          <span class="p5-now-ico">📅</span>
          <span id="p5_nowTH_txt">--</span>
        </div>

        <!-- Timeline -->
        <div class="tl-section tl-card p5-tl-shell" id="p5_tlBox">
          <h2 class="p5-tl-title">Visual Timeline</h2>
          <div id="p5_tlScroll" class="p5-tl-scroll">
            <div id="p5_tlAxis" class="tl-axis"></div>
            <div id="p5_tlCanvas" class="tl-canvas"></div>
          </div>
        </div>

        <!-- ปุ่มล่าง -->
        <div class="tl-bottom-actions p5-bottom">
          <button type="button" id="p5_printBtn" class="btn-green-solid">🖨 Print / PDF</button>
          <button type="button" id="p5_nextBtn" class="btn-purple-solid">บันทึกข้อมูลและไปหน้า 6</button>
          <button type="button" id="p5_clearBtn" class="btn-red-solid">🗑 ล้างข้อมูลหน้านี้</button>
        </div>
      </div>
    `;

    // แสดงรายการ
    renderDrugList();
    renderAdrList();
    buildTimeline();     // ให้มี timeline ตั้งแต่แรก
    startThaiClock();    // เวลาไทยอัปเดตทุกวินาที

    // ผูกปุ่ม
    document.getElementById("p5_addDrugBtn").addEventListener("click", addDrug);
    document.getElementById("p5_addAdrBtn").addEventListener("click", addAdr);
    document.getElementById("p5_buildBtn").addEventListener("click", buildTimeline);

    document.getElementById("p5_delDrugBtn").addEventListener("click", () => {
      const arr = window.drugAllergyData.timeline.drugs;
      if (arr.length) {
        arr.pop();
        renderDrugList();
        buildTimeline();
      }
    });
    document.getElementById("p5_delAdrBtn").addEventListener("click", () => {
      const arr = window.drugAllergyData.timeline.adrs;
      if (arr.length) {
        arr.pop();
        renderAdrList();
        buildTimeline();
      }
    });

    document.getElementById("p5_clearBtn").addEventListener("click", () => {
      window.drugAllergyData.timeline = { drugs: [], adrs: [] };
      renderDrugList();
      renderAdrList();
      buildTimeline();
    });

    document.getElementById("p5_printBtn").addEventListener("click", () => {
      window.print();
    });

    document.getElementById("p5_nextBtn").addEventListener("click", () => {
      // กดย้ายไปหน้า 6 จากแท็บด้านบน
      const tabs = document.querySelectorAll(".tabs button");
      tabs.forEach((b) => {
        if (b.dataset.target === "page6") b.click();
      });
    });
  };

  // =============== render drug / adr form ===============
  function renderDrugList() {
    const wrap = document.getElementById("p5_drugList");
    if (!wrap) return;
    const list = window.drugAllergyData.timeline.drugs || [];

    wrap.innerHTML = list.map((d, i) => {
      return `
        <div class="p5-row-card p5-row-drug" data-idx="${i}">
          <div class="p5-row-grid">
            <div>
              <label>ชื่อยา</label>
              <input type="text" class="p5-drug-name" value="${d.name || ""}" placeholder="ระบุชื่อยา เช่น Amoxicillin" />
            </div>
            <div>
              <label>เริ่มให้ยา</label>
              <input type="date" class="p5-drug-start" value="${d.startDate || ""}" />
              <input type="time" class="p5-drug-starttime" value="${d.startTime || ""}" />
            </div>
            <div>
              <label>หยุดยา</label>
              <input type="date" class="p5-drug-end" value="${d.endDate || ""}" />
              <input type="time" class="p5-drug-endtime" value="${d.endTime || ""}" />
            </div>
          </div>
        </div>
      `;
    }).join("");

    // ผูกอีเวนต์
    wrap.querySelectorAll(".p5-row-drug").forEach((row) => {
      const idx = Number(row.dataset.idx);
      row.querySelector(".p5-drug-name").addEventListener("input", (e) => {
        window.drugAllergyData.timeline.drugs[idx].name = e.target.value;
      });
      row.querySelector(".p5-drug-start").addEventListener("change", (e) => {
        window.drugAllergyData.timeline.drugs[idx].startDate = e.target.value || "";
      });
      row.querySelector(".p5-drug-starttime").addEventListener("change", (e) => {
        window.drugAllergyData.timeline.drugs[idx].startTime = e.target.value || "";
      });
      row.querySelector(".p5-drug-end").addEventListener("change", (e) => {
        window.drugAllergyData.timeline.drugs[idx].endDate = e.target.value || "";
      });
      row.querySelector(".p5-drug-endtime").addEventListener("change", (e) => {
        window.drugAllergyData.timeline.drugs[idx].endTime = e.target.value || "";
      });
    });
  }

  function renderAdrList() {
    const wrap = document.getElementById("p5_adrList");
    if (!wrap) return;
    const list = window.drugAllergyData.timeline.adrs || [];

    wrap.innerHTML = list.map((a, i) => {
      return `
        <div class="p5-row-card p5-row-adr" data-idx="${i}">
          <div class="p5-row-grid">
            <div>
              <label>อาการ</label>
              <input type="text" class="p5-adr-name" value="${a.name || ""}" placeholder="ผื่น, คัน, บวม ฯลฯ" />
            </div>
            <div>
              <label>วันที่เกิด</label>
              <input type="date" class="p5-adr-start" value="${a.startDate || ""}" />
              <input type="time" class="p5-adr-starttime" value="${a.startTime || ""}" />
            </div>
            <div>
              <label>วันที่หาย</label>
              <input type="date" class="p5-adr-end" value="${a.endDate || ""}" />
              <input type="time" class="p5-adr-endtime" value="${a.endTime || ""}" />
            </div>
          </div>
        </div>
      `;
    }).join("");

    wrap.querySelectorAll(".p5-row-adr").forEach((row) => {
      const idx = Number(row.dataset.idx);
      row.querySelector(".p5-adr-name").addEventListener("input", (e) => {
        window.drugAllergyData.timeline.adrs[idx].name = e.target.value;
      });
      row.querySelector(".p5-adr-start").addEventListener("change", (e) => {
        window.drugAllergyData.timeline.adrs[idx].startDate = e.target.value || "";
      });
      row.querySelector(".p5-adr-starttime").addEventListener("change", (e) => {
        window.drugAllergyData.timeline.adrs[idx].startTime = e.target.value || "";
      });
      row.querySelector(".p5-adr-end").addEventListener("change", (e) => {
        window.drugAllergyData.timeline.adrs[idx].endDate = e.target.value || "";
      });
      row.querySelector(".p5-adr-endtime").addEventListener("change", (e) => {
        window.drugAllergyData.timeline.adrs[idx].endTime = e.target.value || "";
      });
    });
  }

  function addDrug() {
    window.drugAllergyData.timeline.drugs.push({
      name: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: ""
    });
    renderDrugList();
  }
  function addAdr() {
    window.drugAllergyData.timeline.adrs.push({
      name: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: ""
    });
    renderAdrList();
  }

  // =============== build timeline ===============
  function buildTimeline() {
    const axis = document.getElementById("p5_tlAxis");
    const canvas = document.getElementById("p5_tlCanvas");
    if (!axis || !canvas) return;

    const { drugs, adrs } = window.drugAllergyData.timeline;
    const drugData = (drugs || []).filter(d => d.name || d.startDate || d.endDate);
    const adrData = (adrs || []).filter(a => a.name || a.startDate || a.endDate);

    // เวลาไทยวันนี้
    const now = new Date();
    const todayTH = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
    todayTH.setHours(0,0,0,0);

    function toDate0(str) {
      if (!str) return null;
      const d = new Date(str);
      if (isNaN(d)) return null;
      d.setHours(0,0,0,0);
      return d;
    }

    // หา min / max จากข้อมูลทั้งหมด
    let minDate = null;
    let maxDate = null;

    drugData.forEach(d => {
      const s = toDate0(d.startDate);
      const e = toDate0(d.endDate);
      if (s && (!minDate || s < minDate)) minDate = s;
      if (e && (!maxDate || e > maxDate)) maxDate = e;
    });
    adrData.forEach(a => {
      const s = toDate0(a.startDate);
      const e = toDate0(a.endDate);
      if (s && (!minDate || s < minDate)) minDate = s;
      if (e && (!maxDate || e > maxDate)) maxDate = e;
    });

    if (!minDate) minDate = new Date(todayTH);
    if (!maxDate || maxDate < todayTH) maxDate = new Date(todayTH);

    const DAY_MS = 24 * 60 * 60 * 1000;
    const DAY_W = 120;

    // สำคัญ: ปรับให้ไม่คลาด 1 วัน
    function diffDays(a, b) {
      const aa = new Date(a.getFullYear(), a.getMonth(), a.getDate());
      const bb = new Date(b.getFullYear(), b.getMonth(), b.getDate());
      return Math.floor((bb - aa) / DAY_MS);   // floor แทน round
    }

    const totalDays = diffDays(minDate, maxDate) + 1;
    const totalWidth = totalDays * DAY_W + 40;

    // วาดแกน X
    axis.innerHTML = "";
    axis.style.width = totalWidth + "px";
    const thMonth = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(minDate.getTime() + i * DAY_MS);
      const tick = document.createElement("div");
      tick.className = "tl-tick";
      tick.style.left = (i * DAY_W + 20) + "px";
      tick.textContent = `${d.getDate()} ${thMonth[d.getMonth()]}`;
      axis.appendChild(tick);
    }

    // วาดแถบ
    canvas.innerHTML = "";
    canvas.style.width = totalWidth + "px";

    let row = 0;

    // ยา
    drugData.forEach(d => {
      const line = document.createElement("div");
      line.className = "tl-row";
      line.style.top = (row * 60) + "px";

      const label = document.createElement("div");
      label.className = "tl-ylabel";
      label.textContent = "ยา: " + (d.name || "");

      const track = document.createElement("div");
      track.className = "tl-track";

      line.appendChild(label);
      line.appendChild(track);
      canvas.appendChild(line);

      if (d.startDate) {
        const s = toDate0(d.startDate);
        let e = d.endDate ? toDate0(d.endDate) : null;
        if (!e) e = new Date(todayTH);
        if (e > maxDate) e = new Date(maxDate);

        const startIdx = diffDays(minDate, s);     // 0,1,2,...
        const endIdx   = diffDays(minDate, e);     // 0,1,2,...

        const left = startIdx * DAY_W + 20;
        // ไม่ +1 เพื่อไม่ให้ยาวเกินวันสิ้นสุด
        const barWidth = Math.max((endIdx - startIdx) * DAY_W, 70);

        const bar = document.createElement("div");
        bar.className = "tl-bar drug";
        bar.style.left = left + "px";
        bar.style.width = barWidth + "px";
        bar.textContent = (d.name || "") + " (" + d.startDate + ")";
        track.appendChild(bar);
      }

      row++;
    });

    // ADR
    adrData.forEach(a => {
      const line = document.createElement("div");
      line.className = "tl-row";
      line.style.top = (row * 60) + "px";

      const label = document.createElement("div");
      label.className = "tl-ylabel tl-ylabel-adr";
      label.textContent = "ADR: " + (a.name || "");

      const track = document.createElement("div");
      track.className = "tl-track";

      line.appendChild(label);
      line.appendChild(track);
      canvas.appendChild(line);

      if (a.startDate) {
        const s = toDate0(a.startDate);
        let e = a.endDate ? toDate0(a.endDate) : null;
        if (!e) e = new Date(todayTH);
        if (e > maxDate) e = new Date(maxDate);

        const startIdx = diffDays(minDate, s);
        const endIdx   = diffDays(minDate, e);

        const left = startIdx * DAY_W + 20;
        const barWidth = Math.max((endIdx - startIdx) * DAY_W, 70);

        const bar = document.createElement("div");
        bar.className = "tl-bar adr";
        bar.style.left = left + "px";
        bar.style.width = barWidth + "px";
        bar.textContent = (a.name || "") + " (" + a.startDate + ")";
        track.appendChild(bar);
      }

      row++;
    });

    canvas.style.minHeight = (row * 60 + 60) + "px";
  }

  // =============== นาฬิกาไทย ===============
  function startThaiClock() {
    const box = document.getElementById("p5_nowTH_txt");
    if (!box) return;
    function run() {
      const now = new Date();
      const th = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
      const dname = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"][th.getDay()];
      const mname = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"][th.getMonth()];
      const y = th.getFullYear() + 543;
      const hh = String(th.getHours()).padStart(2,"0");
      const mm = String(th.getMinutes()).padStart(2,"0");
      const ss = String(th.getSeconds()).padStart(2,"0");
      box.textContent = `วัน${dname}ที่ ${th.getDate()} ${mname} พ.ศ. ${y} เวลา ${hh}:${mm}:${ss}`;
    }
    run();
    setInterval(run, 1000);
  }
})();

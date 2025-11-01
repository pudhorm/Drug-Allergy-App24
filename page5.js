// page5.js
(function () {
  // เตรียม data กลาง
  if (!window.drugAllergyData) window.drugAllergyData = {};
  if (!window.drugAllergyData.timeline) {
    window.drugAllergyData.timeline = {
      drugs: [],
      adrs: []
    };
  }

  // ฟังก์ชันหลักที่หน้า index.html จะเรียก
  window.renderPage5 = function () {
    const page = document.getElementById("page5");
    if (!page) return;

    page.innerHTML = `
      <div class="p5-wrapper" style="position:relative;">
        <div class="p5-glitter-layer"></div>

        <!-- กล่องยา -->
        <div class="tl-section tl-card" id="p5_drugSection" style="margin-bottom:1rem;">
          <div class="tl-head">
            <h2 class="p5-title" style="display:flex;align-items:center;gap:.4rem;">
              <span style="font-size:1.3rem;">💊</span> ยา
            </h2>
            <div class="tl-head-actions" style="display:flex;gap:.5rem;align-items:center;">
              <button type="button" id="p5_delDrugBtn" class="p5-mini-del-btn">ลบตัวล่าสุด</button>
              <button type="button" id="p5_addDrugBtn" class="btn-green-solid" style="min-width:150px;">+ เพิ่มยาตัวใหม่</button>
            </div>
          </div>
          <div id="p5_drugList"></div>
        </div>

        <!-- กล่อง ADR -->
        <div class="tl-section tl-card" id="p5_adrSection" style="margin-bottom:1.1rem;">
          <div class="tl-head">
            <h2 class="p5-title" style="display:flex;align-items:center;gap:.4rem;">
              <span style="font-size:1.3rem;">🩷</span> ADR (Adverse Drug Reaction)
            </h2>
            <div class="tl-head-actions" style="display:flex;gap:.5rem;align-items:center;">
              <button type="button" id="p5_delAdrBtn" class="p5-mini-del-btn p5-mini-del-adr">ลบตัวล่าสุด</button>
              <button type="button" id="p5_addAdrBtn" class="btn-red-solid" style="min-width:140px;">+ เพิ่ม ADR</button>
            </div>
          </div>
          <div id="p5_adrList"></div>

          <!-- ปุ่มสร้าง timeline -->
          <div style="margin-top:12px;">
            <button type="button" id="p5_buildBtn" class="btn-blue-solid" style="display:inline-flex;align-items:center;gap:.35rem;">
              ▶ สร้าง Timeline
            </button>
          </div>
        </div>

        <!-- เวลาปัจจุบัน -->
        <div id="p5_nowTH" style="display:flex;align-items:center;gap:.4rem;margin-bottom:.4rem;color:#0f172a;font-weight:600;">
          <span style="font-size:1.15rem;">📅</span>
          <span>--</span>
        </div>

        <!-- Timeline -->
        <div class="tl-section" id="p5_tlBox" style="overflow:hidden;">
          <h2 style="margin:0 0 .75rem;font-size:1.5rem;color:#111827;">Visual Timeline</h2>
          <div id="p5_tlScroll" style="overflow-x:auto;overflow-y:hidden;border:1px dashed rgba(0,0,0,.08);border-radius:14px;background:linear-gradient(180deg,#fff,rgba(255,255,255,.9));">
            <div class="tl-axis" id="p5_tlAxis" style="position:relative;height:30px;"></div>
            <div class="tl-canvas" id="p5_tlCanvas" style="position:relative;min-height:160px;"></div>
          </div>
        </div>

        <!-- ปุ่มล่าง -->
        <div class="tl-bottom-actions" style="margin-top:10px;">
          <button type="button" id="p5_printBtn" class="btn-green-solid">🖨 Print / PDF</button>
          <button type="button" id="p5_nextBtn" class="btn-purple-solid">บันทึกข้อมูลและไปหน้า 6</button>
          <button type="button" id="p5_clearBtn" class="btn-red-solid">🗑 ล้างข้อมูลหน้านี้</button>
        </div>
      </div>
    `;

    // เรนเดอร์รายการจาก state
    renderDrugList();
    renderAdrList();
    buildTimeline(); // แสดง timeline ครั้งแรกเลย
    startThaiClock();

    // ผูกปุ่ม
    document.getElementById("p5_addDrugBtn").addEventListener("click", addDrug);
    document.getElementById("p5_addAdrBtn").addEventListener("click", addAdr);
    document.getElementById("p5_buildBtn").addEventListener("click", buildTimeline);

    document.getElementById("p5_delDrugBtn").addEventListener("click", () => {
      const arr = window.drugAllergyData.timeline.drugs;
      if (arr.length > 0) {
        arr.pop();
        renderDrugList();
        buildTimeline();
      }
    });
    document.getElementById("p5_delAdrBtn").addEventListener("click", () => {
      const arr = window.drugAllergyData.timeline.adrs;
      if (arr.length > 0) {
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
      // แค่สลับแท็บในหน้า index.html
      const btns = document.querySelectorAll(".tabs button");
      btns.forEach((b) => {
        if (b.dataset.target === "page6") b.click();
      });
    });
  };

  // ---------- render list ----------
  function renderDrugList() {
    const cont = document.getElementById("p5_drugList");
    if (!cont) return;
    const drugs = window.drugAllergyData.timeline.drugs || [];
    cont.innerHTML = drugs
      .map((d, i) => {
        return `
          <div class="tl-card tl-bg-soft p5-drug-row" data-idx="${i}" style="display:grid;grid-template-columns:1.1fr .55fr .55fr .2fr;gap:.7rem;align-items:center;margin-bottom:.6rem;">
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
            <div style="text-align:right;"></div>
          </div>
        `;
      })
      .join("");

    // ผูก input
    const rows = cont.querySelectorAll(".p5-drug-row");
    rows.forEach((row) => {
      const idx = Number(row.dataset.idx);
      const nameEl = row.querySelector(".p5-drug-name");
      const sEl = row.querySelector(".p5-drug-start");
      const stEl = row.querySelector(".p5-drug-starttime");
      const eEl = row.querySelector(".p5-drug-end");
      const etEl = row.querySelector(".p5-drug-endtime");

      nameEl.addEventListener("input", (e) => {
        window.drugAllergyData.timeline.drugs[idx].name = e.target.value;
      });
      sEl.addEventListener("change", (e) => {
        window.drugAllergyData.timeline.drugs[idx].startDate = e.target.value || "";
      });
      stEl.addEventListener("change", (e) => {
        window.drugAllergyData.timeline.drugs[idx].startTime = e.target.value || "";
      });
      eEl.addEventListener("change", (e) => {
        window.drugAllergyData.timeline.drugs[idx].endDate = e.target.value || "";
      });
      etEl.addEventListener("change", (e) => {
        window.drugAllergyData.timeline.drugs[idx].endTime = e.target.value || "";
      });
    });
  }

  function renderAdrList() {
    const cont = document.getElementById("p5_adrList");
    if (!cont) return;
    const adrs = window.drugAllergyData.timeline.adrs || [];
    cont.innerHTML = adrs
      .map((a, i) => {
        return `
          <div class="tl-card tl-bg-soft-red p5-adr-row" data-idx="${i}" style="display:grid;grid-template-columns:1.05fr .55fr .55fr .2fr;gap:.7rem;align-items:center;margin-bottom:.6rem;">
            <div>
              <label>อาการ</label>
              <input type="text" class="p5-adr-name" value="${a.name || ""}" placeholder="ผื่น, คัน, บวม ..." />
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
            <div style="text-align:right;"></div>
          </div>
        `;
      })
      .join("");

    const rows = cont.querySelectorAll(".p5-adr-row");
    rows.forEach((row) => {
      const idx = Number(row.dataset.idx);
      const nameEl = row.querySelector(".p5-adr-name");
      const sEl = row.querySelector(".p5-adr-start");
      const stEl = row.querySelector(".p5-adr-starttime");
      const eEl = row.querySelector(".p5-adr-end");
      const etEl = row.querySelector(".p5-adr-endtime");

      nameEl.addEventListener("input", (e) => {
        window.drugAllergyData.timeline.adrs[idx].name = e.target.value;
      });
      sEl.addEventListener("change", (e) => {
        window.drugAllergyData.timeline.adrs[idx].startDate = e.target.value || "";
      });
      stEl.addEventListener("change", (e) => {
        window.drugAllergyData.timeline.adrs[idx].startTime = e.target.value || "";
      });
      eEl.addEventListener("change", (e) => {
        window.drugAllergyData.timeline.adrs[idx].endDate = e.target.value || "";
      });
      etEl.addEventListener("change", (e) => {
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

  // ------------------- build timeline -------------------
  function buildTimeline() {
    const axis = document.getElementById("p5_tlAxis");
    const canvas = document.getElementById("p5_tlCanvas");
    if (!axis || !canvas) return;

    const { drugs, adrs } = window.drugAllergyData.timeline;
    const realDrugs = (drugs || []).filter((d) => d.name || d.startDate || d.endDate);
    const realAdrs = (adrs || []).filter((a) => a.name || a.startDate || a.endDate);

    // เวลาปัจจุบันไทย (ใช้เป็น today)
    const now = new Date();
    const todayTH = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
    todayTH.setHours(0, 0, 0, 0);

    function pDate(str) {
      if (!str) return null;
      const d = new Date(str);
      if (isNaN(d)) return null;
      d.setHours(0, 0, 0, 0);
      return d;
    }

    // หา min / max
    let minDate = null;
    let maxDate = null;

    realDrugs.forEach((d) => {
      const s = pDate(d.startDate);
      const e = pDate(d.endDate);
      if (s) {
        if (!minDate || s < minDate) minDate = s;
      }
      if (e) {
        if (!maxDate || e > maxDate) maxDate = e;
      }
    });
    realAdrs.forEach((a) => {
      const s = pDate(a.startDate);
      const e = pDate(a.endDate);
      if (s) {
        if (!minDate || s < minDate) minDate = s;
      }
      if (e) {
        if (!maxDate || e > maxDate) maxDate = e;
      }
    });

    if (!minDate) minDate = new Date(todayTH);
    if (!maxDate || maxDate < todayTH) maxDate = new Date(todayTH);

    const DAY_MS = 24 * 60 * 60 * 1000;
    const DAY_W = 120;

    function diffDays(a, b) {
      const aa = new Date(a.getFullYear(), a.getMonth(), a.getDate());
      const bb = new Date(b.getFullYear(), b.getMonth(), b.getDate());
      return Math.round((bb - aa) / DAY_MS);
    }

    const totalDays = diffDays(minDate, maxDate) + 1;
    const totalWidth = totalDays * DAY_W + 40;

    axis.innerHTML = "";
    axis.style.width = totalWidth + "px";

    const thMonth = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(minDate.getTime() + i * DAY_MS);
      const tick = document.createElement("div");
      tick.className = "tl-tick";
      tick.style.left = i * DAY_W + 20 + "px";
      tick.textContent = `${d.getDate()} ${thMonth[d.getMonth()]}`;
      axis.appendChild(tick);
    }

    canvas.innerHTML = "";
    canvas.style.width = totalWidth + "px";

    let rowIndex = 0;

    // วาดยา
    realDrugs.forEach((d) => {
      const row = document.createElement("div");
      row.className = "tl-row";
      row.style.top = rowIndex * 62 + "px";

      const yLabel = document.createElement("div");
      yLabel.className = "tl-ylabel";
      yLabel.textContent = "ยา: " + (d.name || "");

      const track = document.createElement("div");
      track.className = "tl-track";

      row.appendChild(yLabel);
      row.appendChild(track);
      canvas.appendChild(row);

      if (d.startDate) {
        const s = pDate(d.startDate);
        let e = d.endDate ? pDate(d.endDate) : null;
        if (!e) e = new Date(todayTH);
        if (e > maxDate) e = new Date(maxDate);

        const leftDays = diffDays(minDate, s);
        const left = leftDays * DAY_W + 20;
        const durDays = diffDays(s, e);
        const widthPx = Math.max(durDays * DAY_W, 70);

        const bar = document.createElement("div");
        bar.className = "tl-bar drug";
        bar.style.left = left + "px";
        bar.style.width = widthPx + "px";
        bar.textContent = (d.name || "") + " (" + d.startDate + ")";
        track.appendChild(bar);
      }

      rowIndex++;
    });

    // วาด ADR
    realAdrs.forEach((a) => {
      const row = document.createElement("div");
      row.className = "tl-row";
      row.style.top = rowIndex * 62 + "px";

      const yLabel = document.createElement("div");
      yLabel.className = "tl-ylabel tl-ylabel-adr";
      yLabel.textContent = "ADR: " + (a.name || "");

      const track = document.createElement("div");
      track.className = "tl-track";

      row.appendChild(yLabel);
      row.appendChild(track);
      canvas.appendChild(row);

      if (a.startDate) {
        const s = pDate(a.startDate);
        let e = a.endDate ? pDate(a.endDate) : null;
        if (!e) e = new Date(todayTH);
        if (e > maxDate) e = new Date(maxDate);

        const leftDays = diffDays(minDate, s);
        const left = leftDays * DAY_W + 20;
        const durDays = diffDays(s, e);
        const widthPx = Math.max(durDays * DAY_W, 70);

        const bar = document.createElement("div");
        bar.className = "tl-bar adr";
        bar.style.left = left + "px";
        bar.style.width = widthPx + "px";
        bar.textContent = (a.name || "") + " (" + a.startDate + ")";
        track.appendChild(bar);
      }

      rowIndex++;
    });

    canvas.style.minHeight = rowIndex * 62 + 60 + "px";
  }

  // นาฬิกาไทยด้านบน timeline
  function startThaiClock() {
    const box = document.getElementById("p5_nowTH");
    if (!box) return;
    function tick() {
      const now = new Date();
      const th = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
      const dayName = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"][th.getDay()];
      const monthName = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"][th.getMonth()];
      const yearTH = th.getFullYear() + 543;
      const hh = String(th.getHours()).padStart(2, "0");
      const mm = String(th.getMinutes()).padStart(2, "0");
      const ss = String(th.getSeconds()).padStart(2, "0");
      box.children[1].textContent = `วัน${dayName}ที่ ${th.getDate()} ${monthName} พ.ศ. ${yearTH} เวลา ${hh}:${mm}:${ss}`;
    }
    tick();
    setInterval(tick, 1000);
  }
})();

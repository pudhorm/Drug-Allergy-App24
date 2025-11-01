// page5.js
// ============================
// หน้า 5 : Timeline ประเมินการแพ้ยา
// ============================
(function () {
  // ชื่อคีย์เก็บข้อมูลรวม
  if (!window.drugAllergyData) {
    window.drugAllergyData = {};
  }
  if (!window.drugAllergyData.timeline) {
    window.drugAllergyData.timeline = {
      drugs: [],
      adrs: []
    };
  }

  const DAY_MS = 24 * 60 * 60 * 1000;

  // แปลง "dd/mm/yyyy" -> Date
  function parseDDMMYYYY(v) {
    if (!v || typeof v !== "string") return null;
    const parts = v.split("/");
    if (parts.length !== 3) return null;
    const d = Number(parts[0]);
    const m = Number(parts[1]);
    const y = Number(parts[2]);
    if (!d || !m || !y) return null;
    return new Date(y, m - 1, d);
  }

  // แปลง Date -> "dd/mm/yyyy"
  function toDDMMYYYY(dt) {
    const d = String(dt.getDate()).padStart(2, "0");
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const y = dt.getFullYear();
    return `${d}/${m}/${y}`;
  }

  // diff เป็นจำนวน "วัน" แบบปัดลง
  function dayDiff(d1, d2) {
    const t1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const t2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
    return Math.floor((t2 - t1) / DAY_MS);
  }

  // เวลาไทยแบบสวยๆ
  function formatThaiDateTimeTH(d) {
    const thaiMonths = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    const thaiDays = [
      "อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"
    ];
    const dayName = thaiDays[d.getDay()];
    const date = d.getDate();
    const monthName = thaiMonths[d.getMonth()];
    const yearBE = d.getFullYear() + 543;
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `วัน${dayName}ที่ ${date} ${monthName} พ.ศ. ${yearBE} เวลา ${hh}:${mm}:${ss}`;
  }

  // วาดหน้า 5
  function renderPage5() {
    const host = document.getElementById("page5");
    if (!host) return;

    host.innerHTML = `
      <div class="p5-wrapper" style="background:radial-gradient(circle at top, #f4d9ff 0%, #fde7ea 40%, #ffffff 80%);border:1px solid rgba(255,255,255,.6);border-radius:18px;padding:18px 18px 90px;box-shadow:0 20px 55px rgba(124,58,237,.14);position:relative;overflow:hidden;">
        
        <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-bottom:1.1rem;">
          <h2 style="margin:0;display:flex;gap:.5rem;align-items:center;font-size:1.4rem;color:#312e81;">
            <span style="font-size:1.6rem;">📅</span>
            <span>หน้า 5 Timeline ประเมินการแพ้ยา</span>
          </h2>
          <div style="display:flex;gap:.5rem;">
            <button id="p5_add_drug" style="background:#10b981;color:#fff;border:none;border-radius:1.3rem;padding:.5rem 1.4rem;font-weight:700;box-shadow:0 10px 25px rgba(16,185,129,.35);cursor:pointer;">+ เพิ่มยาตัวใหม่</button>
            <button id="p5_del_drug" style="background:#fef9c3;border:1px solid rgba(202,138,4,.3);border-radius:.7rem;padding:.4rem .85rem;font-weight:600;color:#92400e;cursor:pointer;">ลบยาตัวล่าสุด</button>
          </div>
        </div>

        <!-- กล่องยา -->
        <div id="p5_drug_box"></div>

        <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;margin:1.2rem 0 .7rem;">
          <h3 style="margin:0;display:flex;align-items:center;gap:.5rem;font-size:1.25rem;color:#b91c1c;">
            <span style="font-size:1.4rem;">💗</span>
            <span>ADR (Adverse Drug Reaction)</span>
          </h3>
          <div style="display:flex;gap:.5rem;">
            <button id="p5_del_adr" style="background:#fee2e2;border:1px solid rgba(248,113,113,.25);border-radius:.7rem;padding:.35rem .9rem;font-weight:600;color:#b91c1c;cursor:pointer;">ลบตัวล่าสุด</button>
            <button id="p5_add_adr" style="background:#ef4444;color:#fff;border:none;border-radius:1.3rem;padding:.5rem 1.35rem;font-weight:700;box-shadow:0 10px 25px rgba(248,113,113,.35);cursor:pointer;">+ เพิ่ม ADR</button>
            <button id="p5_build" style="background:#2563eb;color:#fff;border:none;border-radius:1.3rem;padding:.5rem 1.35rem;font-weight:700;box-shadow:0 10px 25px rgba(37,99,235,.35);cursor:pointer;display:flex;align-items:center;gap:.3rem;">▶ สร้าง Timeline</button>
          </div>
        </div>

        <div id="p5_adr_box"></div>

        <!-- เวลาไทย -->
        <div id="p5_now" style="margin:1.2rem 0 .4rem;font-weight:600;color:#0f172a;display:flex;align-items:center;gap:.45rem;">
          <span style="font-size:1.1rem;">🗓</span>
          <span>เวลาประเทศไทย</span>
        </div>

        <!-- กล่อง timeline -->
        <div id="p5_timeline" style="background:linear-gradient(180deg,#fff,rgba(255,255,255,.6));border:1px solid rgba(148,163,184,.35);border-radius:18px;padding:16px;min-height:180px;box-shadow:0 12px 20px rgba(15,23,42,.03);overflow-x:auto;"></div>

        <!-- ปุ่มล่าง -->
        <div style="position:sticky;bottom:0;left:0;right:0;display:flex;flex-direction:column;gap:9px;margin-top:14px;background:linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,.95));padding-top:10px;">
          <button onclick="window.print()" style="background:#16a34a;color:#fff;border:none;border-radius:14px;padding:11px 16px;font-weight:700;cursor:pointer;">🖨 Print / PDF</button>
          <button id="p5_go_page6" style="background:#4f46e5;color:#fff;border:none;border-radius:14px;padding:11px 16px;font-weight:700;cursor:pointer;">บันทึกข้อมูลและไปหน้า 6</button>
          <button id="p5_clear" style="background:#ef4444;color:#fff;border:none;border-radius:14px;padding:11px 16px;font-weight:700;cursor:pointer;">🗑 ล้างข้อมูลหน้านี้</button>
        </div>
      </div>
    `;

    // ====== set up ======
    const drugBox = document.getElementById("p5_drug_box");
    const adrBox = document.getElementById("p5_adr_box");
    const btnAddDrug = document.getElementById("p5_add_drug");
    const btnDelDrug = document.getElementById("p5_del_drug");
    const btnAddAdr = document.getElementById("p5_add_adr");
    const btnDelAdr = document.getElementById("p5_del_adr");
    const btnBuild = document.getElementById("p5_build");
    const btnClear = document.getElementById("p5_clear");
    const btnGo6 = document.getElementById("p5_go_page6");
    const divTimeline = document.getElementById("p5_timeline");
    const divNow = document.getElementById("p5_now");

    // แสดงเวลาไทยตลอด
    setInterval(() => {
      const nowTH = new Date();
      // บังคับโซนไทย (GMT+7) แบบง่ายๆ
      const utc = nowTH.getTime() + nowTH.getTimezoneOffset() * 60000;
      const bangkok = new Date(utc + 7 * 60 * 60000);
      divNow.querySelector("span:last-child").textContent = formatThaiDateTimeTH(bangkok);
    }, 1000);

    // ถ้าไม่มีข้อมูลเลย ให้ใส่ 1 ชุด
    const store = window.drugAllergyData.timeline;
    if (!store.drugs.length) {
      store.drugs.push({
        name: "",
        startDate: "",
        startTime: "",
        stopDate: "",
        stopTime: "",
      });
    }
    if (!store.adrs.length) {
      store.adrs.push({
        name: "",
        onsetDate: "",
        onsetTime: "",
        stopDate: "",
        stopTime: "",
      });
    }

    // วาดฟอร์มยา
    function drawDrugForms() {
      drugBox.innerHTML = "";
      store.drugs.forEach((d, idx) => {
        const el = document.createElement("div");
        el.style.background = "rgba(255,255,255,.7)";
        el.style.border = "1px solid rgba(148,163,184,.25)";
        el.style.borderRadius = "14px";
        el.style.padding = "12px 12px 14px";
        el.style.marginBottom = "10px";
        el.innerHTML = `
          <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.6rem;">
            <span style="width:10px;height:10px;border-radius:999px;background:#2563eb;display:inline-block;"></span>
            <strong>ยาตัวที่ ${idx + 1}</strong>
          </div>
          <label style="display:block;margin-bottom:.4rem;">ชื่อยา
            <input type="text" data-drug-name="${idx}" value="${d.name || ""}" style="width:100%;border:1px solid rgba(148,163,184,.35);border-radius:.7rem;padding:.4rem .55rem;">
          </label>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <div style="flex:1 1 220px;">
              <label>เริ่มให้ยา</label>
              <div style="display:flex;gap:6px;">
                <input type="text" placeholder="วว/ดด/ปปปป" data-drug-start-date="${idx}" value="${d.startDate || ""}" style="flex:1;border:1px solid rgba(148,163,184,.35);border-radius:.6rem;padding:.34rem .55rem;">
                <input type="time" data-drug-start-time="${idx}" value="${d.startTime || ""}" style="border:1px solid rgba(148,163,184,.35);border-radius:.6rem;padding:.25rem .45rem;">
              </div>
            </div>
            <div style="flex:1 1 220px;">
              <label>หยุดยา</label>
              <div style="display:flex;gap:6px;">
                <input type="text" placeholder="วว/ดด/ปปปป" data-drug-stop-date="${idx}" value="${d.stopDate || ""}" style="flex:1;border:1px solid rgba(148,163,184,.35);border-radius:.6rem;padding:.34rem .55rem;">
                <input type="time" data-drug-stop-time="${idx}" value="${d.stopTime || ""}" style="border:1px solid rgba(148,163,184,.35);border-radius:.6rem;padding:.25rem .45rem;">
              </div>
            </div>
          </div>
        `;
        drugBox.appendChild(el);
      });
    }

    // วาดฟอร์ม ADR
    function drawAdrForms() {
      adrBox.innerHTML = "";
      store.adrs.forEach((a, idx) => {
        const el = document.createElement("div");
        el.style.background = "rgba(254,242,242,.8)";
        el.style.border = "1px solid rgba(248,113,113,.25)";
        el.style.borderRadius = "14px";
        el.style.padding = "12px 12px 16px";
        el.style.marginBottom = "10px";
        el.innerHTML = `
          <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.6rem;">
            <span style="width:11px;height:11px;border-radius:999px;background:#ef4444;display:inline-block;"></span>
            <strong>ADR ${idx + 1}</strong>
          </div>
          <label style="display:block;margin-bottom:.4rem;">อาการ
            <input type="text" data-adr-name="${idx}" value="${a.name || ""}" style="width:100%;border:1px solid rgba(248,113,113,.3);border-radius:.7rem;padding:.4rem .55rem;">
          </label>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <div style="flex:1 1 210px;">
              <label>วันที่เกิด</label>
              <div style="display:flex;gap:6px;">
                <input type="text" placeholder="วว/ดด/ปปปป" data-adr-onset-date="${idx}" value="${a.onsetDate || ""}" style="flex:1;border:1px solid rgba(248,113,113,.35);border-radius:.6rem;padding:.34rem .55rem;">
                <input type="time" data-adr-onset-time="${idx}" value="${a.onsetTime || ""}" style="border:1px solid rgba(248,113,113,.35);border-radius:.6rem;padding:.25rem .45rem;">
              </div>
            </div>
            <div style="flex:1 1 210px;">
              <label>วันที่หาย</label>
              <div style="display:flex;gap:6px;">
                <input type="text" placeholder="วว/ดด/ปปปป" data-adr-stop-date="${idx}" value="${a.stopDate || ""}" style="flex:1;border:1px solid rgba(248,113,113,.35);border-radius:.6rem;padding:.34rem .55rem;">
                <input type="time" data-adr-stop-time="${idx}" value="${a.stopTime || ""}" style="border:1px solid rgba(248,113,113,.35);border-radius:.6rem;padding:.25rem .45rem;">
              </div>
            </div>
          </div>
        `;
        adrBox.appendChild(el);
      });
    }

    // อ่านค่าจากฟอร์มกลับเข้า store
    function syncFromForm() {
      // drugs
      store.drugs.forEach((d, idx) => {
        const name = document.querySelector(`[data-drug-name="${idx}"]`);
        const sdate = document.querySelector(`[data-drug-start-date="${idx}"]`);
        const stime = document.querySelector(`[data-drug-start-time="${idx}"]`);
        const edate = document.querySelector(`[data-drug-stop-date="${idx}"]`);
        const etime = document.querySelector(`[data-drug-stop-time="${idx}"]`);
        d.name = name ? name.value : "";
        d.startDate = sdate ? sdate.value : "";
        d.startTime = stime ? stime.value : "";
        d.stopDate = edate ? edate.value : "";
        d.stopTime = etime ? etime.value : "";
      });
      // adrs
      store.adrs.forEach((a, idx) => {
        const name = document.querySelector(`[data-adr-name="${idx}"]`);
        const odate = document.querySelector(`[data-adr-onset-date="${idx}"]`);
        const otime = document.querySelector(`[data-adr-onset-time="${idx}"]`);
        const sdate = document.querySelector(`[data-adr-stop-date="${idx}"]`);
        const stime = document.querySelector(`[data-adr-stop-time="${idx}"]`);
        a.name = name ? name.value : "";
        a.onsetDate = odate ? odate.value : "";
        a.onsetTime = otime ? otime.value : "";
        a.stopDate = sdate ? sdate.value : "";
        a.stopTime = stime ? stime.value : "";
      });
    }

    // วาด timeline
    function buildTimeline() {
      syncFromForm();

      // รวมวันเริ่มทั้งหมด
      const allStartDates = [];
      const today = new Date();
      const todayTH = new Date(today.getTime() + (7 - today.getTimezoneOffset() / 60) * 60 * 60 * 1000); // ไม่ต้องซับซ้อนมาก
      const todayMid = new Date(todayTH.getFullYear(), todayTH.getMonth(), todayTH.getDate());

      store.drugs.forEach((d) => {
        const dt = parseDDMMYYYY(d.startDate);
        if (dt) allStartDates.push(dt);
      });
      store.adrs.forEach((a) => {
        const dt = parseDDMMYYYY(a.onsetDate);
        if (dt) allStartDates.push(dt);
      });

      let chartStart;
      if (allStartDates.length) {
        chartStart = allStartDates.reduce((min, cur) => (cur < min ? cur : min), allStartDates[0]);
      } else {
        chartStart = todayMid;
      }

      // header วันที่
      const totalDays = dayDiff(chartStart, todayMid) + 1; // รวมวันนี้
      const DAY_WIDTH = 120; // แต่ละวันกว้างเท่านี้ (พอดู)

      let axisHTML = `<div style="display:flex;align-items:center;gap:0;width:${totalDays * DAY_WIDTH}px;border-bottom:2px solid rgba(15,23,42,.12);margin-bottom:10px;">`;
      for (let i = 0; i < totalDays; i++) {
        const d = new Date(chartStart.getTime() + i * DAY_MS);
        const dStr = d.toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short"
        });
        axisHTML += `<div style="width:${DAY_WIDTH}px;text-align:center;font-weight:600;color:#0f172a;">${dStr}</div>`;
      }
      axisHTML += `</div>`;

      // แกน Y + bar
      let rowsHTML = "";

      // drugs
      store.drugs.forEach((d) => {
        if (!d.name && !d.startDate) return;
        const sdt = parseDDMMYYYY(d.startDate);
        if (!sdt) return;
        const edt = d.stopDate ? parseDDMMYYYY(d.stopDate) : todayMid;

        const startIdx = dayDiff(chartStart, sdt);
        const endIdx = dayDiff(chartStart, edt); // **ไม่ +1 แล้ว**

        const left = startIdx * DAY_WIDTH;
        const width = (endIdx - startIdx + 1) * DAY_WIDTH;

        rowsHTML += `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
            <div style="width:110px;font-weight:600;color:#0f766e;">ยา: ${d.name || "-"}</div>
            <div style="flex:1;position:relative;height:50px;border-bottom:1px dashed rgba(15,23,42,.05);">
              <div style="position:absolute;left:${left}px;top:4px;width:${width}px;height:38px;background:#0ea5e9;border-radius:15px;display:flex;align-items:center;justify-content:flex-start;padding-left:12px;box-shadow:0 10px 25px rgba(14,165,233,.28);color:#000;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${d.name || "ยา"} (${sdt.getFullYear()}-${String(sdt.getMonth()+1).padStart(2,"0")}-${String(sdt.getDate()).padStart(2,"0")})
              </div>
            </div>
          </div>
        `;
      });

      // adrs
      store.adrs.forEach((a) => {
        if (!a.name && !a.onsetDate) return;
        const sdt = parseDDMMYYYY(a.onsetDate);
        if (!sdt) return;
        const edt = a.stopDate ? parseDDMMYYYY(a.stopDate) : todayMid;

        const startIdx = dayDiff(chartStart, sdt);
        const endIdx = dayDiff(chartStart, edt);

        const left = startIdx * DAY_WIDTH;
        const width = (endIdx - startIdx + 1) * DAY_WIDTH;

        rowsHTML += `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
            <div style="width:110px;font-weight:700;color:#b91c1c;">ADR:</div>
            <div style="flex:1;position:relative;height:50px;border-bottom:1px dashed rgba(15,23,42,.04);">
              <div style="position:absolute;left:${left}px;top:4px;width:${width}px;height:38px;background:#ef4444;border-radius:15px;display:flex;align-items:center;justify-content:flex-start;padding-left:12px;box-shadow:0 10px 25px rgba(248,113,113,.28);color:#000;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${a.name || "ADR"} (${sdt.getFullYear()}-${String(sdt.getMonth()+1).padStart(2,"0")}-${String(sdt.getDate()).padStart(2,"0")})
              </div>
            </div>
          </div>
        `;
      });

      divTimeline.innerHTML = `
        <div style="min-width:${totalDays * DAY_WIDTH + 150}px;">
          ${axisHTML}
          ${rowsHTML || `<p style="margin-top:12px;color:#6b7280;">ยังไม่มีข้อมูลให้วาด timeline</p>`}
        </div>
      `;
    }

    // event
    btnAddDrug.addEventListener("click", () => {
      store.drugs.push({
        name: "",
        startDate: "",
        startTime: "",
        stopDate: "",
        stopTime: "",
      });
      drawDrugForms();
    });
    btnDelDrug.addEventListener("click", () => {
      if (store.drugs.length > 1) {
        store.drugs.pop();
        drawDrugForms();
      }
    });

    btnAddAdr.addEventListener("click", () => {
      store.adrs.push({
        name: "",
        onsetDate: "",
        onsetTime: "",
        stopDate: "",
        stopTime: "",
      });
      drawAdrForms();
    });
    btnDelAdr.addEventListener("click", () => {
      if (store.adrs.length > 1) {
        store.adrs.pop();
        drawAdrForms();
      }
    });

    btnBuild.addEventListener("click", () => {
      buildTimeline();
    });

    btnClear.addEventListener("click", () => {
      store.drugs = [{
        name: "",
        startDate: "",
        startTime: "",
        stopDate: "",
        stopTime: "",
      }];
      store.adrs = [{
        name: "",
        onsetDate: "",
        onsetTime: "",
        stopDate: "",
        stopTime: "",
      }];
      drawDrugForms();
      drawAdrForms();
      buildTimeline();
    });

    btnGo6.addEventListener("click", () => {
      // แค่สลับแท็บไปหน้า 6
      const tabBtns = document.querySelectorAll(".tabs button");
      const pages = document.querySelectorAll(".page");
      tabBtns.forEach((b) => b.classList.remove("active"));
      pages.forEach((p) => p.classList.remove("visible"));
      const btn6 = Array.from(tabBtns).find((b) => b.dataset.target === "page6");
      const p6 = document.getElementById("page6");
      if (btn6) btn6.classList.add("active");
      if (p6) p6.classList.add("visible");
    });

    // วาดฟอร์มครั้งแรก + timeline ครั้งแรก
    drawDrugForms();
    drawAdrForms();
    buildTimeline();
  }

  // ให้ฟังก์ชันนี้ไปอยู่ global ตามโครง HTML เดิม
  window.renderPage5 = renderPage5;
})();

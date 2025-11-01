// page5.js
// หน้า 5 : Timeline ประเมินการแพ้ยา (เวอร์ชันมีปฏิทิน + แกนเริ่มลบ 1 วัน + ปลายขวาลบ 1 วัน)
(function () {
  if (!window.drugAllergyData) window.drugAllergyData = {};
  if (!window.drugAllergyData.timeline) {
    window.drugAllergyData.timeline = { drugs: [], adrs: [] };
  }

  const DAY_MS = 24 * 60 * 60 * 1000;

  // ----------- ตัวช่วยวันที่แบบยืดหยุ่น -----------
  // รับได้ทั้ง "dd/mm/yyyy" และ "yyyy-mm-dd"
  function parseFlexibleDate(v) {
    if (!v) return null;
    // yyyy-mm-dd (input type="date")
    if (v.includes("-")) {
      const [y, m, d] = v.split("-").map(Number);
      if (!y || !m || !d) return null;
      return new Date(y, m - 1, d);
    }
    // dd/mm/yyyy (ของเก่า)
    if (v.includes("/")) {
      const [d, m, y] = v.split("/").map(Number);
      if (!d || !m || !y) return null;
      return new Date(y, m - 1, d);
    }
    return null;
  }

  function dayDiff(d1, d2) {
    const t1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const t2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
    return Math.floor((t2 - t1) / DAY_MS);
  }

  function formatThaiDateTimeTH(d) {
    const thMonths = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
    const thDays = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"];
    const dd = thDays[d.getDay()];
    const date = d.getDate();
    const mm = thMonths[d.getMonth()];
    const be = d.getFullYear() + 543;
    const hh = String(d.getHours()).padStart(2,"0");
    const mi = String(d.getMinutes()).padStart(2,"0");
    const ss = String(d.getSeconds()).padStart(2,"0");
    return `วัน${dd}ที่ ${date} ${mm} พ.ศ. ${be} เวลา ${hh}:${mi}:${ss}`;
  }

  function renderPage5() {
    const host = document.getElementById("page5");
    if (!host) return;

    host.innerHTML = `
      <div class="p5-wrapper" style="background:radial-gradient(circle at top, #f4d9ff 0%, #fde7ea 45%, #ffffff 80%);border:1px solid rgba(255,255,255,.6);border-radius:18px;padding:18px 18px 90px;box-shadow:0 20px 55px rgba(124,58,237,.14);position:relative;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-bottom:1.1rem;">
          <h2 style="margin:0;display:flex;gap:.5rem;align-items:center;font-size:1.4rem;color:#312e81;">
            <span style="font-size:1.6rem;">📅</span>
            <span>หน้า 5 Timeline ประเมินการแพ้ยา</span>
          </h2>
          <div style="display:flex;gap:.5rem;">
            <button id="p5_add_drug" style="background:#10b981;color:#fff;border:none;border-radius:1.3rem;padding:.5rem 1.4rem;font-weight:700;box-shadow:0 10px 25px rgba(16,185,129,.35);cursor:pointer;">+ เพิ่มยาตัวใหม่</button>
            <button id="p5_del_drug" style="background:#fff;border:1px solid rgba(16,185,129,.18);border-radius:.8rem;padding:.35rem .9rem;font-weight:600;color:#166534;cursor:pointer;">ลบยาตัวล่าสุด</button>
          </div>
        </div>

        <div id="p5_drug_box"></div>

        <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;margin:1.2rem 0 .7rem;">
          <h3 style="margin:0;display:flex;align-items:center;gap:.5rem;font-size:1.25rem;color:#b91c1c;">
            <span style="font-size:1.4rem;">💗</span>
            <span>ADR (Adverse Drug Reaction)</span>
          </h3>
          <div style="display:flex;gap:.5rem;">
            <button id="p5_del_adr" style="background:#fff;border:1px solid rgba(248,113,113,.25);border-radius:.8rem;padding:.35rem .9rem;font-weight:600;color:#b91c1c;cursor:pointer;">ลบ ADR ล่าสุด</button>
            <button id="p5_add_adr" style="background:#ef4444;color:#fff;border:none;border-radius:1.3rem;padding:.5rem 1.35rem;font-weight:700;box-shadow:0 10px 25px rgba(248,113,113,.35);cursor:pointer;">+ เพิ่ม ADR</button>
            <button id="p5_build" style="background:#2563eb;color:#fff;border:none;border-radius:1.3rem;padding:.5rem 1.35rem;font-weight:700;box-shadow:0 10px 25px rgba(37,99,235,.35);cursor:pointer;display:flex;align-items:center;gap:.3rem;">▶ สร้าง Timeline</button>
          </div>
        </div>

        <div id="p5_adr_box"></div>

        <div id="p5_now" style="margin:1.2rem 0 .4rem;font-weight:600;color:#0f172a;display:flex;align-items:center;gap:.45rem;">
          <span style="font-size:1.1rem;">🗓</span>
          <span>เวลาประเทศไทย</span>
        </div>

        <div id="p5_timeline" style="background:linear-gradient(180deg,#fff,rgba(255,255,255,.65));border:1px solid rgba(148,163,184,.35);border-radius:18px;padding:16px;min-height:180px;box-shadow:0 12px 20px rgba(15,23,42,.03);overflow-x:auto;"></div>

        <div style="position:sticky;bottom:0;left:0;right:0;display:flex;flex-direction:column;gap:9px;margin-top:14px;background:linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,.95));padding-top:10px;">
          <button onclick="window.print()" style="background:#16a34a;color:#fff;border:none;border-radius:14px;padding:11px 16px;font-weight:700;cursor:pointer;">🖨 Print / PDF</button>
          <button id="p5_go_page6" style="background:#4f46e5;color:#fff;border:none;border-radius:14px;padding:11px 16px;font-weight:700;cursor:pointer;">บันทึกข้อมูลและไปหน้า 6</button>
          <button id="p5_clear" style="background:#ef4444;color:#fff;border:none;border-radius:14px;padding:11px 16px;font-weight:700;cursor:pointer;">🗑 ล้างข้อมูลหน้านี้</button>
        </div>
      </div>
    `;

    const store = window.drugAllergyData.timeline;
    const drugBox = document.getElementById("p5_drug_box");
    const adrBox = document.getElementById("p5_adr_box");
    const divNow = document.getElementById("p5_now");
    const divTimeline = document.getElementById("p5_timeline");

    // ถ้าไม่มีเลยให้มีอย่างละ 1
    if (!store.drugs.length) store.drugs.push({ name:"", startDate:"", startTime:"", stopDate:"", stopTime:"" });
    if (!store.adrs.length) store.adrs.push({ name:"", onsetDate:"", onsetTime:"", stopDate:"", stopTime:"" });

    // เวลาไทย auto
    setInterval(() => {
      const now = new Date();
      divNow.querySelector("span:last-child").textContent = formatThaiDateTimeTH(now);
    }, 1000);

    function drawDrugForms() {
      drugBox.innerHTML = "";
      store.drugs.forEach((d, idx) => {
        const el = document.createElement("div");
        el.style.cssText = "background:rgba(255,255,255,.7);border:1px solid rgba(148,163,184,.25);border-radius:14px;padding:12px 12px 14px;margin-bottom:10px;";
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
                <input type="date" data-drug-start-date="${idx}" value="${d.startDate || ""}" style="flex:1;border:1px solid rgba(148,163,184,.35);border-radius:.6rem;padding:.25rem .55rem;">
                <input type="time" data-drug-start-time="${idx}" value="${d.startTime || ""}" style="border:1px solid rgba(148,163,184,.35);border-radius:.6rem;padding:.25rem .45rem;">
              </div>
            </div>
            <div style="flex:1 1 220px;">
              <label>หยุดยา</label>
              <div style="display:flex;gap:6px;">
                <input type="date" data-drug-stop-date="${idx}" value="${d.stopDate || ""}" style="flex:1;border:1px solid rgba(148,163,184,.35);border-radius:.6rem;padding:.25rem .55rem;">
                <input type="time" data-drug-stop-time="${idx}" value="${d.stopTime || ""}" style="border:1px solid rgba(148,163,184,.35);border-radius:.6rem;padding:.25rem .45rem;">
              </div>
            </div>
          </div>
        `;
        drugBox.appendChild(el);
      });
    }

    function drawAdrForms() {
      adrBox.innerHTML = "";
      store.adrs.forEach((a, idx) => {
        const el = document.createElement("div");
        el.style.cssText = "background:rgba(254,242,242,.8);border:1px solid rgba(248,113,113,.25);border-radius:14px;padding:12px 12px 16px;margin-bottom:10px;";
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
                <input type="date" data-adr-onset-date="${idx}" value="${a.onsetDate || ""}" style="flex:1;border:1px solid rgba(248,113,113,.35);border-radius:.6rem;padding:.25rem .55rem;">
                <input type="time" data-adr-onset-time="${idx}" value="${a.onsetTime || ""}" style="border:1px solid rgba(248,113,113,.35);border-radius:.6rem;padding:.25rem .45rem;">
              </div>
            </div>
            <div style="flex:1 1 210px;">
              <label>วันที่หาย</label>
              <div style="display:flex;gap:6px;">
                <input type="date" data-adr-stop-date="${idx}" value="${a.stopDate || ""}" style="flex:1;border:1px solid rgba(248,113,113,.35);border-radius:.6rem;padding:.25rem .55rem;">
                <input type="time" data-adr-stop-time="${idx}" value="${a.stopTime || ""}" style="border:1px solid rgba(248,113,113,.35);border-radius:.6rem;padding:.25rem .45rem;">
              </div>
            </div>
          </div>
        `;
        adrBox.appendChild(el);
      });
    }

    function syncFromForm() {
      store.drugs.forEach((d, i) => {
        d.name      = document.querySelector(`[data-drug-name="${i}"]`)?.value || "";
        d.startDate = document.querySelector(`[data-drug-start-date="${i}"]`)?.value || "";
        d.startTime = document.querySelector(`[data-drug-start-time="${i}"]`)?.value || "";
        d.stopDate  = document.querySelector(`[data-drug-stop-date="${i}"]`)?.value || "";
        d.stopTime  = document.querySelector(`[data-drug-stop-time="${i}"]`)?.value || "";
      });
      store.adrs.forEach((a, i) => {
        a.name      = document.querySelector(`[data-adr-name="${i}"]`)?.value || "";
        a.onsetDate = document.querySelector(`[data-adr-onset-date="${i}"]`)?.value || "";
        a.onsetTime = document.querySelector(`[data-adr-onset-time="${i}"]`)?.value || "";
        a.stopDate  = document.querySelector(`[data-adr-stop-date="${i}"]`)?.value || "";
        a.stopTime  = document.querySelector(`[data-adr-stop-time="${i}"]`)?.value || "";
      });
    }

    function buildTimeline() {
      syncFromForm();

      const today = new Date();
      const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      const startDates = [];
      store.drugs.forEach(d => {
        const dt = parseFlexibleDate(d.startDate);
        if (dt) startDates.push(dt);
      });
      store.adrs.forEach(a => {
        const dt = parseFlexibleDate(a.onsetDate);
        if (dt) startDates.push(dt);
      });

      // ถ้ามีข้อมูล ให้เริ่ม "ย้อนหลัง 1 วัน"
      let chartStart;
      if (startDates.length) {
        const minStart = startDates.reduce((min, cur) => cur < min ? cur : min, startDates[0]);
        chartStart = new Date(minStart.getTime() - DAY_MS);   // 👈 ลบ 1 วันตามที่สั่ง
      } else {
        chartStart = new Date(todayMid.getTime() - DAY_MS);   // ไม่มีข้อมูลก็ลบ 1 วัน
      }

      const totalDays = dayDiff(chartStart, todayMid) + 1;
      const DAY_WIDTH = 120;

      // axis
      let axisHTML = `<div style="display:flex;width:${totalDays * DAY_WIDTH}px;border-bottom:2px solid rgba(15,23,42,.12);margin-bottom:10px;">`;
      for (let i = 0; i < totalDays; i++) {
        const d = new Date(chartStart.getTime() + i * DAY_MS);
        const dStr = d.toLocaleDateString("th-TH",{day:"numeric",month:"short"});
        axisHTML += `<div style="width:${DAY_WIDTH}px;text-align:center;font-weight:600;color:#0f172a;">${dStr}</div>`;
      }
      axisHTML += `</div>`;

      let rowsHTML = "";

      // ---------- วาดยา ----------
      store.drugs.forEach(d => {
        if (!d.name && !d.startDate) return;
        const sdt = parseFlexibleDate(d.startDate);
        if (!sdt) return;

        // ถ้ามีหยุด → หยุดจริง = หยุด - 1 วัน
        let edt;
        if (d.stopDate) {
          const tmpEnd = parseFlexibleDate(d.stopDate);
          if (tmpEnd) {
            edt = new Date(tmpEnd.getTime() - DAY_MS);   // 👈 สั้นกว่าวันที่กรอก 1 วัน
          } else {
            edt = todayMid;
          }
        } else {
          edt = todayMid;
        }

        // กันกรณีวันหยุดก่อนวันเริ่ม
        if (edt < sdt) edt = sdt;

        const startIdx = dayDiff(chartStart, sdt);
        const endIdx   = dayDiff(chartStart, edt);

        const left  = startIdx * DAY_WIDTH;
        const width = (endIdx - startIdx + 1) * DAY_WIDTH;

        rowsHTML += `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
            <div style="width:110px;font-weight:600;color:#0f766e;">ยา: ${d.name || "-"}</div>
            <div style="flex:1;position:relative;height:50px;border-bottom:1px dashed rgba(15,23,42,.05);">
              <div style="position:absolute;left:${left}px;top:4px;width:${width}px;height:38px;background:#0ea5e9;border-radius:15px;display:flex;align-items:center;justify-content:flex-start;padding-left:12px;box-shadow:0 10px 25px rgba(14,165,233,.28);color:#000;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${d.name || "ยา"} (${d.startDate || ""})${d.stopDate ? "" : " (Ongoing)"}
              </div>
            </div>
          </div>
        `;
      });

      // ---------- วาด ADR ----------
      store.adrs.forEach(a => {
        if (!a.name && !a.onsetDate) return;
        const sdt = parseFlexibleDate(a.onsetDate);
        if (!sdt) return;

        let edt;
        if (a.stopDate) {
          const tmpEnd = parseFlexibleDate(a.stopDate);
          if (tmpEnd) {
            edt = new Date(tmpEnd.getTime() - DAY_MS);   // 👈 สั้นกว่าวันที่หาย 1 วัน
          } else {
            edt = todayMid;
          }
        } else {
          edt = todayMid;
        }

        if (edt < sdt) edt = sdt;

        const startIdx = dayDiff(chartStart, sdt);
        const endIdx   = dayDiff(chartStart, edt);
        const left  = startIdx * DAY_WIDTH;
        const width = (endIdx - startIdx + 1) * DAY_WIDTH;

        rowsHTML += `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
            <div style="width:110px;font-weight:700;color:#b91c1c;">ADR:</div>
            <div style="flex:1;position:relative;height:50px;border-bottom:1px dashed rgba(15,23,42,.04);">
              <div style="position:absolute;left:${left}px;top:4px;width:${width}px;height:38px;background:#ef4444;border-radius:15px;display:flex;align-items:center;justify-content:flex-start;padding-left:12px;box-shadow:0 10px 25px rgba(248,113,113,.28);color:#000;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${a.name || "ADR"} (${a.onsetDate || ""})${a.stopDate ? "" : " (Ongoing)"}
              </div>
            </div>
          </div>
        `;
      });

      divTimeline.innerHTML = `
        <div style="min-width:${totalDays * DAY_WIDTH + 140}px;">
          ${axisHTML}
          ${rowsHTML || `<p style="margin-top:12px;color:#6b7280;">ยังไม่มีข้อมูลให้วาด timeline</p>`}
        </div>
      `;
    }

    // events
    document.getElementById("p5_add_drug").onclick = () => {
      store.drugs.push({ name:"", startDate:"", startTime:"", stopDate:"", stopTime:"" });
      drawDrugForms();
    };
    document.getElementById("p5_del_drug").onclick = () => {
      if (store.drugs.length > 1) {
        store.drugs.pop();
        drawDrugForms();
      }
    };
    document.getElementById("p5_add_adr").onclick = () => {
      store.adrs.push({ name:"", onsetDate:"", onsetTime:"", stopDate:"", stopTime:"" });
      drawAdrForms();
    };
    document.getElementById("p5_del_adr").onclick = () => {
      if (store.adrs.length > 1) {
        store.adrs.pop();
        drawAdrForms();
      }
    };
    document.getElementById("p5_build").onclick = buildTimeline;
    document.getElementById("p5_clear").onclick = () => {
      store.drugs = [{ name:"", startDate:"", startTime:"", stopDate:"", stopTime:"" }];
      store.adrs  = [{ name:"", onsetDate:"", onsetTime:"", stopDate:"", stopTime:"" }];
      drawDrugForms();
      drawAdrForms();
      buildTimeline();
    };
    document.getElementById("p5_go_page6").onclick = () => {
      const tabBtns = document.querySelectorAll(".tabs button");
      const pages   = document.querySelectorAll(".page");
      tabBtns.forEach(b => b.classList.remove("active"));
      pages.forEach(p => p.classList.remove("visible"));
      const b6 = Array.from(tabBtns).find(b => b.dataset.target === "page6");
      if (b6) b6.classList.add("active");
      const p6 = document.getElementById("page6");
      if (p6) p6.classList.add("visible");
    };

    // วาดตอนโหลด
    drawDrugForms();
    drawAdrForms();
    buildTimeline();
  }

  // ให้ html เรียกได้
  window.renderPage5 = renderPage5;
})();

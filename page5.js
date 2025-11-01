// page5.js
(function () {
  if (!window.drugAllergyData) window.drugAllergyData = {};
  if (!window.drugAllergyData.page5) {
    window.drugAllergyData.page5 = {
      drugs: [],
      adrs: [],
      showTimeline: false,
    };
  }

  // แปลง string -> Date (แบบวันเดียว)
  function toDate(str) {
    if (!str) return null;
    const d = new Date(str + "T00:00:00");
    return isNaN(d.getTime()) ? null : d;
  }

  // format YYYY-MM-DD
  function fmt(d) {
    if (!d) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  // loop วัน
  function eachDay(start, end) {
    const out = [];
    const cur = new Date(start.getTime());
    while (cur <= end) {
      out.push(new Date(cur.getTime()));
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }

  function renderPage5() {
    const root = document.getElementById("page5");
    if (!root) return;

    const d = window.drugAllergyData.page5;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = fmt(today);

    root.innerHTML = `
      <div class="p5-wrapper"
        style="
          background: radial-gradient(circle at 10% 20%, #fff7cc 0%, #ffe7ff 45%, #fef2ff 70%);
          border: 1px solid rgba(250, 204, 21, .25);
          border-radius: 1.4rem;
          padding: 1.25rem 1.4rem 2.3rem;
          box-shadow: 0 12px 35px rgba(250, 204, 21, 0.1);
          position: relative;
          overflow: hidden;
        ">
        <div style="position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(circle,rgba(255,255,255,.25) 1px,transparent 1px);background-size:110px 110px;opacity:.55;"></div>

        <div style="position:relative;z-index:5;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-bottom:1rem;">
            <h2 style="font-size:1.1rem;font-weight:700;color:#9a3412;display:flex;gap:.4rem;align-items:center;">
              <span>🕒</span>
              <span>หน้า 5 : Timeline การใช้ยาและ ADR</span>
            </h2>
            <p style="margin:0;font-size:.7rem;color:#b45309;">วันที่ปัจจุบัน: ${todayStr}</p>
          </div>

          <!-- กรอกยา -->
          <section style="background:rgba(255,255,255,.85);border:1px solid rgba(248,113,113,.0);border-radius:1rem;padding:1rem 1rem 1rem;margin-bottom:1rem;">
            <h3 style="margin:0 0 .7rem;display:flex;gap:.4rem;align-items:center;color:#92400e;font-weight:700;">
              <span>💊</span><span>กรอกข้อมูลยา</span>
            </h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:.55rem 1rem;">
              <label style="font-size:.8rem;color:#374151;display:flex;flex-direction:column;gap:.3rem;">
                ชื่อยา
                <input id="p5_drug_name" placeholder="เช่น Ceftriaxone" style="border:1px solid rgba(14,165,233,.35);border-radius:.6rem;padding:.4rem .55rem;font-size:.8rem;">
              </label>
              <label style="font-size:.8rem;color:#374151;display:flex;flex-direction:column;gap:.3rem;">
                วันที่เริ่มยา
                <input id="p5_drug_start" type="date" style="border:1px solid rgba(14,165,233,.35);border-radius:.6rem;padding:.35rem .55rem;font-size:.8rem;">
              </label>
              <label style="font-size:.8rem;color:#374151;display:flex;flex-direction:column;gap:.3rem;">
                วันที่หยุดยา (ถ้ามี)
                <input id="p5_drug_end" type="date" style="border:1px solid rgba(14,165,233,.35);border-radius:.6rem;padding:.35rem .55rem;font-size:.8rem;">
              </label>
            </div>
            <button id="p5_add_drug"
              style="margin-top:.7rem;background:#22c55e;border:none;color:#fff;font-weight:600;padding:.45rem .95rem;border-radius:.7rem;cursor:pointer;box-shadow:0 8px 16px rgba(34,197,94,.25);">
              + เพิ่มยาตัวใหม่
            </button>
            <div style="margin-top:.8rem;display:flex;flex-wrap:wrap;gap:.4rem;">
              ${d.drugs.map((drug,idx)=>`
                <span style="background:rgba(14,165,233,.08);border:1px solid rgba(14,165,233,.25);border-radius:999px;padding:.25rem .6rem;font-size:.7rem;color:#075985;display:inline-flex;gap:.3rem;align-items:center;">
                  ${drug.name} (${drug.start || "?"}${drug.end ? " → "+drug.end : ""})
                  <button data-del-drug="${idx}" style="background:none;border:none;color:#b91c1c;font-weight:700;cursor:pointer;">×</button>
                </span>
              `).join("")}
            </div>
          </section>

          <!-- กรอก ADR -->
          <section style="background:rgba(255,255,255,.78);border:1px solid rgba(236,72,153,.03);border-radius:1rem;padding:1rem 1rem 1rem;margin-bottom:1rem;">
            <h3 style="margin:0 0 .7rem;display:flex;gap:.4rem;align-items:center;color:#be123c;font-weight:700;">
              <span>⚠️</span><span>กรอกข้อมูล ADR</span>
            </h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:.55rem 1rem;">
              <label style="font-size:.8rem;color:#374151;display:flex;flex-direction:column;gap:.3rem;">
                ชื่อ ADR
                <input id="p5_adr_name" placeholder="เช่น ผื่นลมพิษ, SJS" style="border:1px solid rgba(236,72,153,.25);border-radius:.6rem;padding:.4rem .55rem;font-size:.8rem;">
              </label>
              <label style="font-size:.8rem;color:#374151;display:flex;flex-direction:column;gap:.3rem;">
                วันที่เริ่ม ADR
                <input id="p5_adr_start" type="date" style="border:1px solid rgba(236,72,153,.25);border-radius:.6rem;padding:.35rem .55rem;font-size:.8rem;">
              </label>
              <label style="font-size:.8rem;color:#374151;display:flex;flex-direction:column;gap:.3rem;">
                วันที่หาย (ถ้ามี)
                <input id="p5_adr_end" type="date" style="border:1px solid rgba(236,72,153,.25);border-radius:.6rem;padding:.35rem .55rem;font-size:.8rem;">
              </label>
            </div>
            <button id="p5_add_adr"
              style="margin-top:.7rem;background:#ef4444;border:none;color:#fff;font-weight:600;padding:.45rem .95rem;border-radius:.7rem;cursor:pointer;box-shadow:0 8px 16px rgba(239,68,68,.25);">
              + เพิ่ม ADR
            </button>
            <div style="margin-top:.8rem;display:flex;flex-wrap:wrap;gap:.4rem;">
              ${d.adrs.map((adr,idx)=>`
                <span style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);border-radius:999px;padding:.25rem .6rem;font-size:.7rem;color:#b91c1c;display:inline-flex;gap:.3rem;align-items:center;">
                  ${adr.name} (${adr.start || "?"}${adr.end ? " → "+adr.end : ""})
                  <button data-del-adr="${idx}" style="background:none;border:none;color:#991b1b;font-weight:700;cursor:pointer;">×</button>
                </span>
              `).join("")}
            </div>
          </section>

          <!-- ปุ่มล่าง -->
          <div style="display:flex;justify-content:space-between;gap:1rem;margin-top:1rem;">
            <button id="p5_clear"
              style="background:#ef4444;border:none;color:#fff;padding:.5rem 1.05rem;border-radius:.8rem;font-weight:600;cursor:pointer;">
              ล้างข้อมูล Timeline นี้
            </button>
            <button id="p5_build"
              style="background:#3b82f6;border:none;color:#fff;padding:.5rem 1.55rem;border-radius:.9rem;font-weight:600;cursor:pointer;box-shadow:0 10px 22px rgba(59,130,246,.35);">
              ${d.showTimeline ? "ซ่อน Timeline" : "สร้าง Timeline"}
            </button>
          </div>

          <div id="p5_timeline_area" style="margin-top:1.15rem;">
            ${d.showTimeline ? buildTimelineHTML(d, today) : ""}
          </div>
        </div>
      </div>
    `;

    // ----- Events -----
    document.getElementById("p5_add_drug").addEventListener("click", () => {
      const name = document.getElementById("p5_drug_name").value.trim();
      const start = document.getElementById("p5_drug_start").value;
      const end = document.getElementById("p5_drug_end").value;
      if (!name || !start) {
        alert("กรุณากรอกชื่อยาและวันที่เริ่มยา");
        return;
      }
      d.drugs.push({ name, start, end });
      save(); renderPage5();
    });

    root.querySelectorAll("[data-del-drug]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-del-drug"));
        d.drugs.splice(idx, 1);
        save(); renderPage5();
      });
    });

    document.getElementById("p5_add_adr").addEventListener("click", () => {
      const name = document.getElementById("p5_adr_name").value.trim();
      const start = document.getElementById("p5_adr_start").value;
      const end = document.getElementById("p5_adr_end").value;
      if (!name || !start) {
        alert("กรุณากรอกชื่อ ADR และวันที่เริ่ม ADR");
        return;
      }
      d.adrs.push({ name, start, end });
      save(); renderPage5();
    });

    root.querySelectorAll("[data-del-adr]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-del-adr"));
        d.adrs.splice(idx, 1);
        save(); renderPage5();
      });
    });

    document.getElementById("p5_clear").addEventListener("click", () => {
      if (!confirm("ล้างข้อมูลทั้งหมดของหน้า 5 ?")) return;
      d.drugs = [];
      d.adrs = [];
      d.showTimeline = false;
      save(); renderPage5();
    });

    document.getElementById("p5_build").addEventListener("click", () => {
      d.showTimeline = !d.showTimeline;
      save(); renderPage5();
    });

    function save() {
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();
    }
  }

  // ============= สร้าง HTML timeline =============
  function buildTimelineHTML(d, today) {
    // ถ้าไม่มีเลย
    if ((!d.drugs || d.drugs.length === 0) && (!d.adrs || d.adrs.length === 0)) {
      return `<p style="margin-top:.4rem;font-size:.85rem;color:#9f1239;">ยังไม่มีข้อมูลยา/ADR ให้แสดง timeline</p>`;
    }

    // หา day เริ่ม
    const allStarts = [];
    const allExplicitEnds = [];
    d.drugs.forEach(dr => {
      const st = toDate(dr.start);
      if (st) allStarts.push(st);
      const ed = toDate(dr.end);
      if (ed) allExplicitEnds.push(ed);
    });
    d.adrs.forEach(ar => {
      const st = toDate(ar.start);
      if (st) allStarts.push(st);
      const ed = toDate(ar.end);
      if (ed) allExplicitEnds.push(ed);
    });

    const minStart = allStarts.length ? new Date(Math.min(...allStarts.map(x=>x.getTime()))) : new Date(today.getTime());
    // axisEnd = max(วันนี้, ทุก end ที่ระบุ)
    const axisEnd = allExplicitEnds.length
      ? new Date(Math.max(today.getTime(), ...allExplicitEnds.map(x=>x.getTime())))
      : new Date(today.getTime());

    const dayList = eachDay(minStart, axisEnd);
    const DAY_WIDTH = 78;

    const headerDays = dayList.map(d => {
      return `<div style="min-width:${DAY_WIDTH}px;border-left:1px solid rgba(15,23,42,.04);text-align:center;font-size:.65rem;color:#78350f;">${fmt(d)}</div>`;
    }).join("");

    function makeBar(item, type) {
      const startD = toDate(item.start) || minStart;
      let endD;
      if (item.end) {
        endD = toDate(item.end);
      } else {
        // 🟣 ถ้าไม่ใส่วันสิ้นสุด -> ongoing ถึง "วันนี้" เท่านั้น
        endD = new Date(today.getTime());
      }
      if (endD < startD) endD = new Date(startD.getTime());

      const startIdx = Math.floor((startD - minStart) / (1000*60*60*24));
      const endIdx = Math.floor((endD - minStart) / (1000*60*60*24));

      const left = startIdx * DAY_WIDTH;
      const width = (endIdx - startIdx + 1) * DAY_WIDTH;

      const isOngoing = !item.end;
      const label = `${item.name} (${fmt(startD)})${isOngoing ? " ongoing" : ""}`;

      const bg = type === "drug" ? "#0ea5e9" : "#ef4444";  // 🟦 ยา = ฟ้า, ADR = แดง

      return `
        <div style="
          position:absolute;
          left:${left}px;
          top:4px;
          height:32px;
          width:${width}px;
          background:${bg};
          border-radius:.6rem;
          display:flex;
          align-items:center;
          padding:0 .5rem;
          box-shadow:0 4px 10px rgba(15,23,42,.12);
          overflow:hidden;
          white-space:nowrap;
        ">
          <span style="font-size:.7rem;font-weight:600;color:#000;">${label}</span>
        </div>
      `;
    }

    const allBars = [
      ...d.drugs.map(dr => ({ html: makeBar(dr, "drug"), name: dr.name, type: "drug" })),
      ...d.adrs.map(ar => ({ html: makeBar(ar, "adr"), name: ar.name, type: "adr" })),
    ];

    const rows = allBars.map(bar => `
      <div style="display:grid;grid-template-columns:140px 1fr;gap:.5rem;align-items:flex-start;margin-bottom:.7rem;">
        <div style="font-size:.78rem;font-weight:600;color:${bar.type==="drug"?"#0f766e":"#b91c1c"};">
          ${bar.type === "drug" ? "ยา" : "ADR"}: ${bar.name}
        </div>
        <div style="position:relative;min-height:38px;width:${dayList.length * DAY_WIDTH}px;border-bottom:1px dashed rgba(148,163,184,.2);">
          ${bar.html}
        </div>
      </div>
    `).join("");

    return `
      <div style="background:rgba(255,255,255,.4);border:1px solid rgba(203,213,225,.35);border-radius:1rem;padding:1rem .6rem 1rem;overflow-x:auto;">
        <div style="display:grid;grid-template-columns:140px 1fr;gap:.5rem;margin-bottom:.6rem;">
          <div style="font-size:.7rem;color:#57534e;">ชื่อยา / ADR</div>
          <div style="display:flex;gap:0;min-width:${dayList.length * DAY_WIDTH}px;">
            ${headerDays}
          </div>
        </div>
        ${rows}
      </div>
    `;
  }

  window.renderPage5 = renderPage5;
})();

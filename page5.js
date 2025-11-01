// page5.js
(function () {
  if (!window.drugAllergyData) window.drugAllergyData = {};
  // โหลดหน้ามาให้เริ่มเพียวๆ ทุกครั้ง
  window.drugAllergyData.page5 = {
    drugs: [
      { id: 1, name: "", startDate: "", startTime: "", endDate: "", endTime: "" }
    ],
    adrs: [
      { id: 1, name: "", startDate: "", startTime: "", endDate: "", endTime: "" }
    ]
  };

  const DAY_MS = 24 * 60 * 60 * 1000;
  const TH_MONTH_SHORT = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

  function todayZero() {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }

  function buildDate(dateStr, timeStr) {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    if (timeStr) {
      const [hh, mm] = timeStr.split(":").map(Number);
      dt.setHours(hh, mm || 0, 0, 0);
    } else {
      dt.setHours(0, 0, 0, 0);
    }
    return dt;
  }

  function formatLabel(dateStr, timeStr) {
    if (!dateStr) return "";
    if (!timeStr) return `(${dateStr})`;
    return `(${dateStr} ${timeStr})`;
  }

  function renderPage5() {
    const root = document.getElementById("page5");
    if (!root) return;

    const store = window.drugAllergyData.page5;

    root.innerHTML = `
      <div class="p5-wrapper" style="
        background: radial-gradient(circle at top, #fff5d9 0%, #ffe3ff 40%, #fdf2ff 60%, #fff);
        border: 1px solid rgba(249,168,212,.35);
        border-radius: 1.5rem;
        padding: 1.3rem 1.4rem 6.5rem;
        box-shadow: 0 12px 30px rgba(244,114,182,.15);
        position: relative;
        overflow: hidden;
      ">
        <div style="
          position:absolute;
          inset:0;
          background-image:
            radial-gradient(circle, rgba(255,255,255,0.6) 2px, rgba(255,255,255,0) 2px),
            radial-gradient(circle, rgba(255,255,255,0.35) 1.5px, rgba(255,255,255,0) 1.5px);
          background-size: 140px 140px, 110px 110px;
          background-position: 10px 10px, 50px 120px;
          pointer-events:none;
          opacity:.5;
        "></div>

        <div style="position:relative;z-index:5;">
          <header style="display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-bottom:1.2rem;">
            <h2 style="display:flex;align-items:center;gap:.5rem;font-size:1.25rem;font-weight:700;color:#312e81;margin:0;">
              <span>📅</span>
              <span>หน้า 5 Timeline ประเมินการแพ้ยา</span>
            </h2>
          </header>

          <!-- ส่วนยา -->
          <section id="p5-drugs" style="background:rgba(255,255,255,.8);border:1px solid rgba(255,196,0,.2);border-radius:1rem;padding:1rem 1rem 1.1rem;margin-bottom:1rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.8rem;">
              <h3 style="margin:0;font-size:1rem;font-weight:700;color:#0f172a;display:flex;gap:.4rem;align-items:center;">
                <span style="width:12px;height:12px;background:#0ea5e9;border-radius:999px;display:inline-block;"></span>
                <span>ยาที่ให้</span>
              </h3>
              <button id="p5-add-drug" type="button" style="background:#10b981;color:#fff;border:none;border-radius:.7rem;padding:.4rem 1.1rem;font-weight:600;cursor:pointer;box-shadow:0 6px 12px rgba(16,185,129,.25);">
                + เพิ่มยาตัวใหม่
              </button>
            </div>
            <div id="p5-drug-list" style="display:flex;flex-direction:column;gap:.6rem;"></div>
          </section>

          <!-- ส่วน ADR -->
          <section id="p5-adrs" style="background:rgba(255,255,255,.8);border:1px solid rgba(248,113,113,.2);border-radius:1rem;padding:1rem 1rem 1.1rem;margin-bottom:1rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.8rem;">
              <h3 style="margin:0;font-size:1rem;font-weight:700;color:#991b1b;display:flex;gap:.4rem;align-items:center;">
                <span style="width:12px;height:12px;background:#ef4444;border-radius:999px;display:inline-block;"></span>
                <span>ADR (Adverse Drug Reaction)</span>
              </h3>
              <button id="p5-add-adr" type="button" style="background:#ef4444;color:#fff;border:none;border-radius:.7rem;padding:.4rem 1.1rem;font-weight:600;cursor:pointer;box-shadow:0 6px 12px rgba(239,68,68,.25);">
                + เพิ่ม ADR
              </button>
            </div>
            <div id="p5-adr-list" style="display:flex;flex-direction:column;gap:.6rem;"></div>
          </section>

          <!-- Timeline -->
          <section id="p5-timeline-box" style="background:rgba(255,255,255,.9);border:1px solid rgba(148,163,184,.25);border-radius:1rem;padding:1rem 1rem 1.2rem;margin-bottom:1.4rem;display:none;">
            <h3 style="margin:0 0 .6rem;font-size:1rem;font-weight:700;color:#0f172a;">Visual Timeline</h3>
            <div id="p5-tl-scroll" style="overflow-x:auto;overflow-y:hidden;max-width:100%;padding-bottom:.5rem;">
              <div id="p5-tl-inner"></div>
            </div>
          </section>

          <!-- ปุ่มท้ายหน้า -->
          <div style="display:flex;flex-direction:column;gap:.75rem;margin-top:1.2rem;">
            <button id="p5-generate" type="button" style="background:#3b82f6;color:#fff;border:none;border-radius:1.8rem;padding:.65rem 1rem;font-weight:700;box-shadow:0 10px 20px rgba(59,130,246,.28);font-size:1rem;cursor:pointer;">
              ▶ สร้าง Timeline
            </button>
            <button id="p5-clear" type="button" style="background:#ef4444;color:#fff;border:none;border-radius:1.8rem;padding:.55rem 1rem;font-weight:600;box-shadow:0 8px 18px rgba(239,68,68,.22);cursor:pointer;">
              🗑️ ล้างข้อมูลหน้านี้
            </button>
            <button id="p5-save-go6" type="button" style="background:#8b5cf6;color:#fff;border:none;border-radius:1.8rem;padding:.6rem 1rem;font-weight:700;box-shadow:0 8px 18px rgba(139,92,246,.25);cursor:pointer;">
              💾 บันทึกข้อมูลและไปหน้า 6
            </button>
          </div>
        </div>
      </div>
    `;

    const drugListEl = root.querySelector("#p5-drug-list");
    const adrListEl = root.querySelector("#p5-adr-list");
    const addDrugBtn = root.querySelector("#p5-add-drug");
    const addAdrBtn = root.querySelector("#p5-add-adr");
    const genBtn = root.querySelector("#p5-generate");
    const clearBtn = root.querySelector("#p5-clear");
    const saveGo6Btn = root.querySelector("#p5-save-go6");
    const tlBox = root.querySelector("#p5-timeline-box");
    const tlInner = root.querySelector("#p5-tl-inner");

    function renderDrugForms() {
      drugListEl.innerHTML = "";
      store.drugs.forEach((d) => {
        const row = document.createElement("div");
        row.style.background = "rgba(236,252,255,.6)";
        row.style.border = "1px solid rgba(14,165,233,.12)";
        row.style.borderRadius = ".7rem";
        row.style.padding = ".6rem .6rem .5rem";
        row.innerHTML = `
          <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.3rem;">
            <label style="flex:1 1 240px;font-size:.78rem;color:#1f2937;">
              ชื่อยา
              <input type="text" value="${d.name}" data-type="drug" data-id="${d.id}" data-field="name"
                style="width:100%;border:1px solid rgba(14,165,233,.35);border-radius:.5rem;padding:.35rem .5rem;">
            </label>
            <button type="button" data-del-drug="${d.id}" style="background:transparent;border:none;color:#ef4444;font-weight:600;cursor:pointer;">ลบ</button>
          </div>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap;">
            <label style="flex:1 1 180px;font-size:.78rem;color:#1f2937;">
              เริ่มให้ยา
              <input type="date" value="${d.startDate}" data-type="drug" data-id="${d.id}" data-field="startDate"
                style="width:100%;border:1px solid rgba(14,165,233,.25);border-radius:.5rem;padding:.28rem .4rem;">
            </label>
            <label style="width:120px;font-size:.78rem;color:#1f2937;">
              เวลา
              <input type="time" value="${d.startTime}" data-type="drug" data-id="${d.id}" data-field="startTime"
                style="width:100%;border:1px solid rgba(14,165,233,.25);border-radius:.5rem;padding:.28rem .4rem;">
            </label>
            <label style="flex:1 1 180px;font-size:.78rem;color:#1f2937;">
              หยุดยา
              <input type="date" value="${d.endDate}" data-type="drug" data-id="${d.id}" data-field="endDate"
                style="width:100%;border:1px solid rgba(14,165,233,.25);border-radius:.5rem;padding:.28rem .4rem;">
            </label>
            <label style="width:120px;font-size:.78rem;color:#1f2937;">
              เวลา
              <input type="time" value="${d.endTime}" data-type="drug" data-id="${d.id}" data-field="endTime"
                style="width:100%;border:1px solid rgba(14,165,233,.25);border-radius:.5rem;padding:.28rem .4rem;">
            </label>
          </div>
        `;
        drugListEl.appendChild(row);
      });
    }

    function renderAdrForms() {
      adrListEl.innerHTML = "";
      store.adrs.forEach((a) => {
        const row = document.createElement("div");
        row.style.background = "rgba(255,241,242,.6)";
        row.style.border = "1px solid rgba(248,113,113,.12)";
        row.style.borderRadius = ".7rem";
        row.style.padding = ".6rem .6rem .5rem";
        row.innerHTML = `
          <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.3rem;">
            <label style="flex:1 1 240px;font-size:.78rem;color:#1f2937;">
              อาการ
              <input type="text" value="${a.name}" data-type="adr" data-id="${a.id}" data-field="name"
                style="width:100%;border:1px solid rgba(248,113,113,.35);border-radius:.5rem;padding:.35rem .5rem;">
            </label>
            <button type="button" data-del-adr="${a.id}" style="background:transparent;border:none;color:#ef4444;font-weight:600;cursor:pointer;">ลบ</button>
          </div>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap;">
            <label style="flex:1 1 180px;font-size:.78rem;color:#1f2937;">
              วันที่เกิด
              <input type="date" value="${a.startDate}" data-type="adr" data-id="${a.id}" data-field="startDate"
                style="width:100%;border:1px solid rgba(248,113,113,.25);border-radius:.5rem;padding:.28rem .4rem;">
            </label>
            <label style="width:120px;font-size:.78rem;color:#1f2937;">
              เวลา
              <input type="time" value="${a.startTime}" data-type="adr" data-id="${a.id}" data-field="startTime"
                style="width:100%;border:1px solid rgba(248,113,113,.25);border-radius:.5rem;padding:.28rem .4rem;">
            </label>
            <label style="flex:1 1 180px;font-size:.78rem;color:#1f2937;">
              วันที่หาย
              <input type="date" value="${a.endDate}" data-type="adr" data-id="${a.id}" data-field="endDate"
                style="width:100%;border:1px solid rgba(248,113,113,.25);border-radius:.5rem;padding:.28rem .4rem;">
            </label>
            <label style="width:120px;font-size:.78rem;color:#1f2937;">
              เวลา
              <input type="time" value="${a.endTime}" data-type="adr" data-id="${a.id}" data-field="endTime"
                style="width:100%;border:1px solid rgba(248,113,113,.25);border-radius:.5rem;padding:.28rem .4rem;">
            </label>
          </div>
        `;
        adrListEl.appendChild(row);
      });
    }

    renderDrugForms();
    renderAdrForms();

    addDrugBtn.addEventListener("click", () => {
      const nextId = store.drugs.length ? Math.max(...store.drugs.map(d => d.id)) + 1 : 1;
      store.drugs.push({ id: nextId, name: "", startDate: "", startTime: "", endDate: "", endTime: "" });
      renderDrugForms();
    });

    addAdrBtn.addEventListener("click", () => {
      const nextId = store.adrs.length ? Math.max(...store.adrs.map(a => a.id)) + 1 : 1;
      store.adrs.push({ id: nextId, name: "", startDate: "", startTime: "", endDate: "", endTime: "" });
      renderAdrForms();
    });

    root.addEventListener("input", (e) => {
      const el = e.target;
      const type = el.getAttribute("data-type");
      const id = Number(el.getAttribute("data-id"));
      const field = el.getAttribute("data-field");
      if (!type || !id || !field) return;
      if (type === "drug") {
        const it = store.drugs.find(d => d.id === id);
        if (it) it[field] = el.value;
      } else if (type === "adr") {
        const it = store.adrs.find(a => a.id === id);
        if (it) it[field] = el.value;
      }
    });

    root.addEventListener("click", (e) => {
      const delDrug = e.target.getAttribute("data-del-drug");
      const delAdr = e.target.getAttribute("data-del-adr");
      if (delDrug) {
        const id = Number(delDrug);
        store.drugs = store.drugs.filter(d => d.id !== id);
        if (!store.drugs.length) {
          store.drugs.push({ id: 1, name: "", startDate: "", startTime: "", endDate: "", endTime: "" });
        }
        renderDrugForms();
      }
      if (delAdr) {
        const id = Number(delAdr);
        store.adrs = store.adrs.filter(a => a.id !== id);
        if (!store.adrs.length) {
          store.adrs.push({ id: 1, name: "", startDate: "", startTime: "", endDate: "", endTime: "" });
        }
        renderAdrForms();
      }
    });

    let timelineVisible = false;

    genBtn.addEventListener("click", () => {
      timelineVisible = !timelineVisible;
      if (!timelineVisible) {
        tlBox.style.display = "none";
        return;
      }

      const today = todayZero();

      const drugItems = store.drugs
        .filter(d => d.startDate)
        .map(d => {
          const start = buildDate(d.startDate, d.startTime);
          const end = d.endDate ? buildDate(d.endDate, d.endTime) : today;
          return {
            type: "drug",
            name: d.name || "ไม่ระบุ",
            start,
            end: end < start ? start : end,
            label: `${d.name || "ไม่ระบุ"} ${formatLabel(d.startDate, d.startTime)}`
          };
        });

      const adrItems = store.adrs
        .filter(a => a.startDate)
        .map(a => {
          const start = buildDate(a.startDate, a.startTime);
          const end = a.endDate ? buildDate(a.endDate, a.endTime) : today;
          return {
            type: "adr",
            name: a.name || "ADR",
            start,
            end: end < start ? start : end,
            label: `${a.name || "ADR"} ${formatLabel(a.startDate, a.startTime)}`
          };
        });

      const allItems = [...drugItems, ...adrItems];
      if (!allItems.length) {
        tlInner.innerHTML = `<p style="color:#6b7280;font-size:.9rem;">ยังไม่มีข้อมูลวันที่เริ่มเลยค่ะ</p>`;
        tlBox.style.display = "block";
        return;
      }

      let minStart = allItems[0].start;
      let maxEnd = allItems[0].end;
      allItems.forEach(it => {
        if (it.start < minStart) minStart = it.start;
        if (it.end > maxEnd) maxEnd = it.end;
      });
      const todayZeroed = todayZero();
      if (todayZeroed > maxEnd) maxEnd = todayZeroed;

      const dayWidth = 115;
      const totalDays = Math.floor((maxEnd - minStart) / DAY_MS) + 1;
      const totalWidth = totalDays * dayWidth + 260; // +260 เพื่อไม่ให้ชนขอบเวลาเลื่อน

      // วันบนแกน X
      const daysHtml = [];
      for (let i = 0; i < totalDays; i++) {
        const d = new Date(minStart.getTime() + i * DAY_MS);
        daysHtml.push(
          `<div style="width:${dayWidth}px;text-align:center;font-size:.78rem;color:#0f172a;">${d.getDate()} ${TH_MONTH_SHORT[d.getMonth()]}</div>`
        );
      }

      const rowsHtml = [];

      drugItems.forEach(it => {
        const offsetDays = Math.floor((it.start - minStart) / DAY_MS);
        const widthDays = Math.floor((it.end - it.start) / DAY_MS) + 1;
        const widthPx = widthDays * dayWidth; // ไม่หักออกแล้ว
        rowsHtml.push(`
          <div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.7rem;">
            <div style="width:140px;font-weight:600;color:#0f766e;font-size:.83rem;flex:0 0 140px;">ยา: ${it.name}</div>
            <div style="position:relative;flex:1 1 auto;height:36px;">
              <div style="position:absolute;inset:16px 0 0 0;border-top:1px dotted rgba(15,118,110,.35);"></div>
              <div style="
                position:absolute;
                left:${offsetDays * dayWidth + 4}px;
                top:0;
                height:30px;
                width:${widthPx}px;
                background:#0ea5e9;
                color:#000;
                border-radius:999px;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:.75rem;
                font-weight:600;
                box-shadow:0 6px 14px rgba(14,165,233,.35);
                white-space:nowrap;
              ">${it.label}</div>
            </div>
          </div>
        `);
      });

      adrItems.forEach(it => {
        const offsetDays = Math.floor((it.start - minStart) / DAY_MS);
        const widthDays = Math.floor((it.end - it.start) / DAY_MS) + 1;
        const widthPx = widthDays * dayWidth;
        rowsHtml.push(`
          <div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.7rem;">
            <div style="width:140px;font-weight:600;color:#b91c1c;font-size:.83rem;flex:0 0 140px;">ADR: ${it.name}</div>
            <div style="position:relative;flex:1 1 auto;height:36px;">
              <div style="position:absolute;inset:16px 0 0 0;border-top:1px dotted rgba(248,113,113,.35);"></div>
              <div style="
                position:absolute;
                left:${offsetDays * dayWidth + 4}px;
                top:0;
                height:30px;
                width:${widthPx}px;
                background:#ef4444;
                color:#000;
                border-radius:999px;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:.75rem;
                font-weight:600;
                box-shadow:0 6px 14px rgba(248,113,113,.35);
                white-space:nowrap;
              ">${it.label}</div>
            </div>
          </div>
        `);
      });

      tlInner.innerHTML = `
        <div style="width:${totalWidth}px;padding-right:40px;">
          <div style="display:flex;margin-left:140px;margin-bottom:.5rem;border-bottom:1px solid rgba(148,163,184,.25);">
            ${daysHtml.join("")}
          </div>
          <div>
            ${rowsHtml.join("")}
          </div>
        </div>
      `;

      tlBox.style.display = "block";
    });

    clearBtn.addEventListener("click", () => {
      window.drugAllergyData.page5 = {
        drugs: [
          { id: 1, name: "", startDate: "", startTime: "", endDate: "", endTime: "" }
        ],
        adrs: [
          { id: 1, name: "", startDate: "", startTime: "", endDate: "", endTime: "" }
        ]
      };
      store.drugs = window.drugAllergyData.page5.drugs;
      store.adrs = window.drugAllergyData.page5.adrs;
      renderDrugForms();
      renderAdrForms();
      tlBox.style.display = "none";
      timelineVisible = false;
    });

    // ปุ่มบันทึกและไปหน้า 6
    saveGo6Btn.addEventListener("click", () => {
      // เผื่อมีฟังก์ชันเซฟรวมของแอพ
      if (typeof window.saveDrugAllergyData === "function") {
        window.saveDrugAllergyData();
      }
      // ไปหน้า 6
      const btn6 = document.querySelector('.tabs button[data-target="page6"]');
      if (btn6) btn6.click();
    });
  }

  window.renderPage5 = renderPage5;
})();

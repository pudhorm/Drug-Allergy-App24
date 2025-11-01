// page5.js
(function () {
  // ---------- inject css กลิตเตอร์ครั้งเดียว ----------
  function ensureP5Styles() {
    if (document.getElementById("p5-glitter-style")) return;
    const style = document.createElement("style");
    style.id = "p5-glitter-style";
    style.textContent = `
      /* ชั้นกลิตเตอร์ */
      .p5-glitter-layer {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background-image:
          radial-gradient(circle, rgba(255,255,255,.65) 0, rgba(255,255,255,0) 40%),
          radial-gradient(circle, rgba(255,255,255,.45) 0, rgba(255,255,255,0) 45%);
        background-size: 220px 220px, 160px 160px;
        mix-blend-mode: screen;
        opacity: .6;
        animation: p5sparkle 9s linear infinite;
      }
      @keyframes p5sparkle {
        0%   { background-position: 0 0, 50px 80px; opacity:.7; }
        50%  { background-position: 160px 120px, 120px 10px; opacity:.3; }
        100% { background-position: 0 0, 50px 80px; opacity:.7; }
      }
    `;
    document.head.appendChild(style);
  }

  // ---------- เตรียมที่เก็บกลาง ----------
  if (!window.drugAllergyData) window.drugAllergyData = {};
  if (!window.drugAllergyData.page5) {
    window.drugAllergyData.page5 = {
      drugs: [
        { name: "", startDate: "", startTime: "", endDate: "", endTime: "" },
      ],
      adrs: [
        { name: "", startDate: "", startTime: "", endDate: "", endTime: "" },
      ],
    };
  }

  const DAY_MS = 24 * 60 * 60 * 1000;
  const CELL_WIDTH = 120;

  function renderPage5() {
    ensureP5Styles();

    const root = document.getElementById("page5");
    if (!root) return;

    const data = window.drugAllergyData.page5;

    root.innerHTML = `
      <div class="p5-wrapper" style="
        position:relative;
        background: radial-gradient(circle at 3% 3%, #ffe485 0%, #ffb347 28%, #ff79c9 55%, #9b5fff 90%);
        border: 1px solid rgba(255,255,255,0.28);
        border-radius: 1.35rem;
        margin-top: 1rem;
        padding: 1.4rem 1.3rem 2.4rem;
        box-shadow: 0 14px 32px rgba(173, 80, 255, 0.25);
        overflow:hidden;
      ">
        <div class="p5-glitter-layer"></div>

        <header style="position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1rem;">
          <h2 style="display:flex;align-items:center;gap:.6rem;font-size:1.3rem;font-weight:700;color:#1f2937;text-shadow:0 3px 11px rgba(255,255,255,.42);">
            <span style="font-size:1.4rem;">📅</span>
            <span>หน้า 5 Timeline ประเมินการแพ้ยา</span>
          </h2>
        </header>

        <!-- ----------- ส่วนที่ 1: ยา ----------- -->
        <section style="position:relative;z-index:2;background:rgba(255,255,255,.78);backdrop-filter:blur(1.5px);border:1px solid rgba(255,255,255,.35);border-radius:1rem;padding:1rem 1rem 1.2rem;margin-bottom:1.1rem;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:.9rem;">
            <h3 style="display:flex;align-items:center;gap:.5rem;font-size:1.02rem;font-weight:700;color:#1f2937;margin:0;">
              <span style="font-size:1.25rem;">💊</span>
              <span>ยาที่ให้ผู้ป่วย</span>
            </h3>
            <button type="button" id="p5_add_drug" style="background:linear-gradient(120deg,#f97316 0%,#22c55e 80%);color:#fff;border:none;border-radius:.85rem;padding:.4rem 1.1rem .5rem;display:flex;align-items:center;gap:.35rem;font-weight:600;cursor:pointer;box-shadow:0 12px 25px rgba(249,115,22,.35);">
              <span style="font-size:1.05rem;">＋</span>
              <span>เพิ่มยาตัวใหม่</span>
            </button>
          </div>

          <div id="p5_drug_list" style="display:flex;flex-direction:column;gap:.7rem;">
            ${data.drugs.map((d, idx) => renderDrugCard(d, idx)).join("")}
          </div>
        </section>

        <!-- ----------- ส่วนที่ 2: ADR ----------- -->
        <section style="position:relative;z-index:2;background:rgba(255,244,244,.88);backdrop-filter:blur(1px);border:1px solid rgba(244,63,94,.25);border-radius:1rem;padding:1rem 1rem 1.2rem;margin-bottom:1.1rem;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:.9rem;">
            <h3 style="display:flex;align-items:center;gap:.5rem;font-size:1.02rem;font-weight:700;color:#be123c;margin:0;">
              <span style="font-size:1.25rem;">🔴</span>
              <span>ADR (Adverse Drug Reaction)</span>
            </h3>
            <button type="button" id="p5_add_adr" style="background:linear-gradient(120deg,#ef4444 0%,#f97316 90%);color:#fff;border:none;border-radius:.85rem;padding:.4rem 1.1rem .5rem;display:flex;align-items:center;gap:.35rem;font-weight:600;cursor:pointer;box-shadow:0 10px 24px rgba(248,113,113,.35);">
              <span style="font-size:1.05rem;">＋</span>
              <span>เพิ่ม ADR</span>
            </button>
          </div>

          <div id="p5_adr_list" style="display:flex;flex-direction:column;gap:.7rem;">
            ${data.adrs.map((a, idx) => renderAdrCard(a, idx)).join("")}
          </div>
        </section>

        <!-- ----------- ปุ่มสร้าง timeline ----------- -->
        <div style="position:relative;z-index:2;margin-bottom:1.1rem;">
          <button type="button" id="p5_build_timeline" style="width:240px;background:linear-gradient(120deg,#6366f1 0%,#7c3aed 60%,#db2777 100%);color:#fff;border:none;border-radius:.95rem;padding:.6rem 1.4rem .65rem;display:flex;align-items:center;justify-content:center;gap:.45rem;font-weight:650;font-size:1rem;cursor:pointer;box-shadow:0 16px 30px rgba(99,102,241,.35);">
            <span style="font-size:1.3rem;">▶</span>
            <span>สร้าง Timeline</span>
          </button>
        </div>

        <!-- ----------- ส่วนที่ 3: แสดง timeline ----------- -->
        <section id="p5_timeline_area" style="position:relative;z-index:2;background:rgba(255,255,255,.85);border:1px solid rgba(148,163,184,.18);border-radius:1rem;padding:1rem 1rem 1.2rem;min-height:240px;">
          <h3 style="font-size:1.02rem;font-weight:650;color:#111827;margin:0 0 .6rem;">Visual Timeline</h3>
          <p style="margin:0 0 .6rem;color:#6b7280;font-size:.8rem;">ระบบจะสร้างเส้นเวลาอัตโนมัติจากข้อมูลที่กรอกด้านบน</p>
          <div id="p5_timeline_canvas" style="border:1px dashed rgba(99,102,241,.15);border-radius:.7rem;background:#f8fafc;min-height:160px;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:.85rem;">
            ยังไม่มีข้อมูล ให้กรอกยาและ/หรือ ADR แล้วกด “สร้าง Timeline”
          </div>
        </section>
      </div>
    `;

    // ====== events ======
    bindDrugEvents(data);
    bindAdrEvents(data);

    const buildBtn = root.querySelector("#p5_build_timeline");
    buildBtn.addEventListener("click", () => buildTimeline());
  }

  // --------- render ยา ----------
  function renderDrugCard(d, idx) {
    return `
      <div style="background:linear-gradient(90deg,rgba(239,246,255,.9) 0%,rgba(255,255,255,.5) 75%);border:1px solid rgba(59,130,246,.25);border-radius:.75rem;padding:.7rem .7rem .4rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:.6rem;margin-bottom:.5rem;">
          <div style="font-weight:600;color:#1d4ed8;">ยาตัวที่ ${idx + 1}</div>
          <button type="button" id="p5_drug_del_${idx}" style="background:transparent;border:none;color:#ef4444;font-size:.8rem;cursor:pointer;">ลบ</button>
        </div>
        <label style="display:flex;flex-direction:column;gap:.25rem;margin-bottom:.4rem;font-size:.8rem;">
          ชื่อยา
          <input id="p5_drug_name_${idx}" value="${d.name || ""}" placeholder="ระบุชื่อยา" style="border:1px solid rgba(59,130,246,.45);border-radius:.55rem;padding:.3rem .5rem;font-size:.85rem;background:#fff;">
        </label>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;">
          <label style="flex:1 1 180px;display:flex;flex-direction:column;gap:.25rem;font-size:.8rem;">
            เริ่มให้ยา
            <div style="display:flex;gap:.35rem;">
              <input type="date" id="p5_drug_sd_${idx}" value="${d.startDate || ""}" style="flex:1;border:1px solid rgba(59,130,246,.4);border-radius:.5rem;padding:.3rem .4rem;">
              <input type="time" id="p5_drug_st_${idx}" value="${d.startTime || ""}" style="width:105px;border:1px solid rgba(59,130,246,.25);border-radius:.5rem;padding:.3rem .4rem;">
            </div>
          </label>
          <label style="flex:1 1 180px;display:flex;flex-direction:column;gap:.25rem;font-size:.8rem;">
            หยุดยา
            <div style="display:flex;gap:.35rem;">
              <input type="date" id="p5_drug_ed_${idx}" value="${d.endDate || ""}" style="flex:1;border:1px solid rgba(59,130,246,.4);border-radius:.5rem;padding:.3rem .4rem;">
              <input type="time" id="p5_drug_et_${idx}" value="${d.endTime || ""}" style="width:105px;border:1px solid rgba(59,130,246,.25);border-radius:.5rem;padding:.3rem .4rem;">
            </div>
          </label>
        </div>
      </div>
    `;
  }

  // --------- render ADR ----------
  function renderAdrCard(a, idx) {
    return `
      <div style="background:linear-gradient(90deg,rgba(254,226,226,.9) 0%,rgba(255,255,255,.5) 75%);border:1px solid rgba(248,113,113,.25);border-radius:.75rem;padding:.7rem .7rem .4rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:.6rem;margin-bottom:.5rem;">
          <div style="font-weight:600;color:#be123c;">ADR ${idx + 1}</div>
          <button type="button" id="p5_adr_del_${idx}" style="background:transparent;border:none;color:#ef4444;font-size:.8rem;cursor:pointer;">ลบ</button>
        </div>
        <label style="display:flex;flex-direction:column;gap:.25rem;margin-bottom:.4rem;font-size:.8rem;">
          อาการ
          <input id="p5_adr_name_${idx}" value="${a.name || ""}" placeholder="ระบุอาการ เช่น ผื่นขึ้น, คัน, บวม" style="border:1px solid rgba(248,113,113,.45);border-radius:.55rem;padding:.3rem .5rem;font-size:.85rem;background:#fff;">
        </label>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;">
          <label style="flex:1 1 180px;display:flex;flex-direction:column;gap:.25rem;font-size:.8rem;">
            วันที่เกิด
            <div style="display:flex;gap:.35rem;">
              <input type="date" id="p5_adr_sd_${idx}" value="${a.startDate || ""}" style="flex:1;border:1px solid rgba(248,113,113,.4);border-radius:.5rem;padding:.3rem .4rem;">
              <input type="time" id="p5_adr_st_${idx}" value="${a.startTime || ""}" style="width:105px;border:1px solid rgba(248,113,113,.25);border-radius:.5rem;padding:.3rem .4rem;">
            </div>
          </label>
          <label style="flex:1 1 180px;display:flex;flex-direction:column;gap:.25rem;font-size:.8rem;">
            วันที่หาย
            <div style="display:flex;gap:.35rem;">
              <input type="date" id="p5_adr_ed_${idx}" value="${a.endDate || ""}" style="flex:1;border:1px solid rgba(248,113,113,.4);border-radius:.5rem;padding:.3rem .4rem;">
              <input type="time" id="p5_adr_et_${idx}" value="${a.endTime || ""}" style="width:105px;border:1px solid rgba(248,113,113,.25);border-radius:.5rem;padding:.3rem .4rem;">
            </div>
          </label>
        </div>
      </div>
    `;
  }

  // --------- bind events ยา/ADR ----------
  function bindDrugEvents(data) {
    const root = document.getElementById("page5");
    const addDrugBtn = root.querySelector("#p5_add_drug");
    addDrugBtn.addEventListener("click", () => {
      data.drugs.push({ name: "", startDate: "", startTime: "", endDate: "", endTime: "" });
      renderPage5();
    });

    data.drugs.forEach((d, idx) => {
      const nameEl = document.getElementById(`p5_drug_name_${idx}`);
      const sdEl = document.getElementById(`p5_drug_sd_${idx}`);
      const stEl = document.getElementById(`p5_drug_st_${idx}`);
      const edEl = document.getElementById(`p5_drug_ed_${idx}`);
      const etEl = document.getElementById(`p5_drug_et_${idx}`);
      const delBtn = document.getElementById(`p5_drug_del_${idx}`);

      nameEl && nameEl.addEventListener("input", () => { d.name = nameEl.value; savePage5(); });
      sdEl && sdEl.addEventListener("change", () => { d.startDate = sdEl.value; savePage5(); });
      stEl && stEl.addEventListener("change", () => { d.startTime = stEl.value; savePage5(); });
      edEl && edEl.addEventListener("change", () => { d.endDate = edEl.value; savePage5(); });
      etEl && etEl.addEventListener("change", () => { d.endTime = etEl.value; savePage5(); });
      delBtn && delBtn.addEventListener("click", () => {
        data.drugs.splice(idx, 1);
        if (!data.drugs.length) data.drugs.push({ name: "", startDate: "", startTime: "", endDate: "", endTime: "" });
        renderPage5();
      });
    });
  }

  function bindAdrEvents(data) {
    const root = document.getElementById("page5");
    const addAdrBtn = root.querySelector("#p5_add_adr");
    addAdrBtn.addEventListener("click", () => {
      data.adrs.push({ name: "", startDate: "", startTime: "", endDate: "", endTime: "" });
      renderPage5();
    });

    data.adrs.forEach((a, idx) => {
      const nameEl = document.getElementById(`p5_adr_name_${idx}`);
      const sdEl = document.getElementById(`p5_adr_sd_${idx}`);
      const stEl = document.getElementById(`p5_adr_st_${idx}`);
      const edEl = document.getElementById(`p5_adr_ed_${idx}`);
      const etEl = document.getElementById(`p5_adr_et_${idx}`);
      const delBtn = document.getElementById(`p5_adr_del_${idx}`);

      nameEl && nameEl.addEventListener("input", () => { a.name = nameEl.value; savePage5(); });
      sdEl && sdEl.addEventListener("change", () => { a.startDate = sdEl.value; savePage5(); });
      stEl && stEl.addEventListener("change", () => { a.startTime = stEl.value; savePage5(); });
      edEl && edEl.addEventListener("change", () => { a.endDate = edEl.value; savePage5(); });
      etEl && etEl.addEventListener("change", () => { a.endTime = etEl.value; savePage5(); });
      delBtn && delBtn.addEventListener("click", () => {
        data.adrs.splice(idx, 1);
        if (!data.adrs.length) data.adrs.push({ name: "", startDate: "", startTime: "", endDate: "", endTime: "" });
        renderPage5();
      });
    });
  }

  // --------- build timeline ----------
  function buildTimeline() {
    const box = document.getElementById("p5_timeline_canvas");
    if (!box) return;
    const data = window.drugAllergyData.page5;

    const rows = [];
    const today = new Date();
    let minDate = null;
    let maxDate = null;

    function parseDate(dateStr, timeStr) {
      if (!dateStr) return null;
      const time = timeStr ? timeStr : "00:00";
      return new Date(`${dateStr}T${time}`);
    }

    data.drugs.forEach((d) => {
      const start = parseDate(d.startDate, d.startTime);
      if (!start) return;
      let end = parseDate(d.endDate, d.endTime);
      if (!end) end = today;
      rows.push({ type: "drug", name: d.name || "Drug", start, end });

      if (!minDate || start < minDate) minDate = start;
      if (!maxDate || end > maxDate) maxDate = end;
    });

    data.adrs.forEach((a) => {
      const start = parseDate(a.startDate, a.startTime);
      if (!start) return;
      let end = parseDate(a.endDate, a.endTime);
      if (!end) end = today;
      rows.push({ type: "adr", name: a.name || "ADR", start, end });

      if (!minDate || start < minDate) minDate = start;
      if (!maxDate || end > maxDate) maxDate = end;
    });

    if (!rows.length) {
      box.innerHTML = "ยังไม่มีข้อมูลที่สร้าง timeline ได้";
      box.style.display = "flex";
      box.style.alignItems = "center";
      box.style.justifyContent = "center";
      return;
    }

    const adjMin = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    const adjMax = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
    const totalDays = Math.max(1, Math.round((adjMax - adjMin) / DAY_MS) + 1);
    const width = totalDays * CELL_WIDTH + 160;

    const dayHeaders = [];
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(adjMin.getTime() + i * DAY_MS);
      const thDate = d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
      dayHeaders.push(
        `<div style="width:${CELL_WIDTH}px;min-width:${CELL_WIDTH}px;border-left:1px solid rgba(148,163,184,.3);padding:.35rem .4rem;font-size:.7rem;color:#0f172a;background:rgba(255,255,255,.5);backdrop-filter:blur(.5px);">${thDate}</div>`
      );
    }

    box.style.display = "block";
    box.innerHTML = `
      <div style="overflow-x:auto;max-width:100%;">
        <div style="min-width:${width}px;">
          <div style="display:flex;gap:0;">
            <div style="width:150px;background:rgba(248,250,252,.6);"></div>
            ${dayHeaders.join("")}
          </div>
          <div style="position:relative;border-top:1px solid rgba(148,163,184,.35);min-height:${rows.length * 55 + 20}px;background:linear-gradient(180deg,rgba(248,250,252,.3) 0%,rgba(255,255,255,1) 45%);">
            ${rows
              .map((row, idx) => {
                const top = idx * 55 + 10;
                const startOffset = Math.round((row.start - adjMin) / DAY_MS) * CELL_WIDTH;
                const endOffset = Math.round((row.end - adjMin) / DAY_MS + 1) * CELL_WIDTH;
                const left = 150 + startOffset;
                const barWidth = Math.max(60, endOffset - startOffset - 10);
                const color =
                  row.type === "adr"
                    ? "linear-gradient(120deg,#ef4444 0%,#f97316 95%)"
                    : "linear-gradient(120deg,#3b82f6 0%,#6366f1 95%)";
                const ongoing =
                  !row.end || row.end.toDateString() === new Date().toDateString();
                return `
                  <div style="position:absolute;left:0;top:${top}px;width:150px;font-size:.78rem;font-weight:600;color:#0f172a;">
                    ${row.type === "adr" ? "ADR" : "ยา"}: ${row.name}
                  </div>
                  <div style="position:absolute;left:${left}px;top:${top}px;height:38px;width:${barWidth}px;background:${color};border-radius:.8rem;box-shadow:0 10px 22px rgba(59,130,246,.2);color:#fff;padding:.4rem .5rem .35rem;font-size:.72rem;display:flex;flex-direction:column;justify-content:center;">
                    <span style="font-weight:650;">${row.name}</span>
                    <span style="font-size:.65rem;opacity:.9;">
                      เริ่ม: ${fmtTH(row.start)} ${ongoing ? "(Ongoing)" : `– สิ้นสุด: ${fmtTH(row.end)}`}
                    </span>
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  function savePage5() {
    if (window.saveDrugAllergyData) window.saveDrugAllergyData();
  }

  function fmtTH(dateObj) {
    if (!dateObj) return "-";
    return dateObj.toLocaleString("th-TH", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // export
  window.renderPage5 = renderPage5;
})();

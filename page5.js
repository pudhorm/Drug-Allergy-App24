// page5.js
// ======================= หน้า 5 : Timeline ประเมินการแพ้ยา =======================
window.renderPage5 = function renderPage5() {
  const host = document.getElementById("page5");
  if (!host) return;

  // ติด state ไว้ในตัวแอพหลัก
  if (!window.drugAllergyData) {
    window.drugAllergyData = {};
  }
  if (!window.drugAllergyData.timeline) {
    window.drugAllergyData.timeline = {
      drugs: [
        {
          name: "",
          startDate: "",
          startTime: "",
          endDate: "",
          endTime: "",
        },
      ],
      adrs: [
        {
          name: "",
          startDate: "",
          startTime: "",
          endDate: "",
          endTime: "",
        },
      ],
    };
  }

  const data = window.drugAllergyData.timeline;

  host.innerHTML = `
    <div class="p5-wrapper" style="background:linear-gradient(180deg,#fff7ff 0%,#fef9e7 55%,#ffffff 100%);border:1px solid rgba(254,226,226,.05);border-radius:1.4rem;padding:1.1rem 1rem 2.8rem;position:relative;">
      <div class="p5-glitter-layer"></div>

      <!-- กล่องยา -->
      <div class="tl-section tl-bg-soft" id="tl-drug-box">
        <div class="tl-head">
          <h2 style="font-weight:700;color:#164e63;margin-bottom:.35rem;">ยา</h2>
          <button type="button" id="tl-add-drug" class="btn-green-solid" style="background:#16a34a;">
            + เพิ่มยาตัวใหม่
          </button>
        </div>
        <div id="tl-drug-list"></div>
      </div>

      <!-- กล่อง ADR -->
      <div class="tl-section tl-bg-soft-red" id="tl-adr-box" style="margin-top:14px;">
        <div class="tl-head">
          <h2 style="font-weight:700;color:#991b1b;margin-bottom:.35rem;">ADR (Adverse Drug Reaction)</h2>
          <button type="button" id="tl-add-adr" class="btn-red-solid" style="background:#ef4444;">
            + เพิ่ม ADR
          </button>
        </div>
        <div id="tl-adr-list"></div>

        <div class="tl-actions-under-adr">
          <button type="button" id="tl-build" class="btn-blue-solid" style="background:#2563eb;display:inline-flex;align-items:center;gap:6px;">
            ▶ สร้าง Timeline
          </button>
        </div>
      </div>

      <!-- ภาพ timeline -->
      <div class="tl-section" style="margin-top:16px;">
        <h2 style="margin-top:0;margin-bottom:.7rem;">Visual Timeline</h2>
        <div id="tl-scroll" class="tl-scroll hidden">
          <div id="tl-ticks" class="tl-ticks"></div>
          <div id="tl-canvas" class="tl-canvas"></div>
        </div>
        <p id="tl-empty" style="margin:0.5rem 0 0;color:#94a3b8;font-size:.85rem;">ยังไม่มีข้อมูลหรือยังไม่ได้กด "สร้าง Timeline"</p>
      </div>

      <!-- ปุ่มล่าง -->
      <div class="tl-bottom-actions">
        <button type="button" id="tl-print" class="btn-green-solid" style="background:#10b981;">🖨 Print / PDF</button>
        <button type="button" id="tl-next" class="btn-blue-solid" style="background:#4f46e5;">บันทึกข้อมูลและไปหน้า 6</button>
        <button type="button" id="tl-clear" class="btn-red-solid" style="background:#ef4444;">🗑 ล้างข้อมูลหน้านี้</button>
      </div>
    </div>
  `;

  const drugListEl = host.querySelector("#tl-drug-list");
  const adrListEl = host.querySelector("#tl-adr-list");
  const buildBtn = host.querySelector("#tl-build");
  const addDrugBtn = host.querySelector("#tl-add-drug");
  const addAdrBtn = host.querySelector("#tl-add-adr");
  const clearBtn = host.querySelector("#tl-clear");
  const printBtn = host.querySelector("#tl-print");
  const nextBtn = host.querySelector("#tl-next");
  const tlScroll = host.querySelector("#tl-scroll");
  const tlTicks = host.querySelector("#tl-ticks");
  const tlCanvas = host.querySelector("#tl-canvas");
  const tlEmpty = host.querySelector("#tl-empty");

  // ---------------- helper ----------------
  function parseDateInput(str) {
    if (!str) return null;
    // รองรับ 2025-11-01 และ 01/11/2025
    if (str.includes("/")) {
      const [d, m, y] = str.split("/");
      return new Date(Number(y), Number(m) - 1, Number(d));
    }
    return new Date(str);
  }

  function formatThaiShort(d) {
    const mth = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
    return d.getDate() + " " + mth[d.getMonth()];
  }

  function renderDrugRows() {
    drugListEl.innerHTML = "";
    data.drugs.forEach((drug, idx) => {
      const row = document.createElement("div");
      row.className = "tl-card";
      row.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr auto;gap:6px 12px;align-items:center;">
          <label>
            ชื่อยา
            <input type="text" data-field="name" data-index="${idx}" value="${drug.name || ""}" style="width:100%;border:1px solid #d1d5db;border-radius:6px;padding:4px 6px;">
          </label>

          <button type="button" class="tl-del" data-type="drug" data-index="${idx}">ลบ</button>

          <div class="tl-grid2" style="grid-column:1/-1;">
            <label>
              เริ่มให้ยา
              <div class="tl-inline">
                <input type="text" data-field="startDate" data-index="${idx}" value="${drug.startDate || ""}" placeholder="วว/ดด/ปปปป" style="border:1px solid #d1d5db;border-radius:6px;padding:4px 6px;min-width:135px;">
                <input type="time" data-field="startTime" data-index="${idx}" value="${drug.startTime || ""}" style="border:1px solid #d1d5db;border-radius:6px;padding:4px 6px;">
              </div>
            </label>
            <label>
              หยุดยา
              <div class="tl-inline">
                <input type="text" data-field="endDate" data-index="${idx}" value="${drug.endDate || ""}" placeholder="วว/ดด/ปปปป" style="border:1px solid #d1d5db;border-radius:6px;padding:4px 6px;min-width:135px;">
                <input type="time" data-field="endTime" data-index="${idx}" value="${drug.endTime || ""}" style="border:1px solid #d1d5db;border-radius:6px;padding:4px 6px;">
              </div>
            </label>
          </div>
        </div>
      `;
      drugListEl.appendChild(row);
    });
  }

  function renderAdrRows() {
    adrListEl.innerHTML = "";
    data.adrs.forEach((adr, idx) => {
      const row = document.createElement("div");
      row.className = "tl-card";
      row.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr auto;gap:6px 12px;align-items:center;">
          <label>
            อาการ
            <input type="text" data-adr-field="name" data-index="${idx}" value="${adr.name || ""}" placeholder="ระบุอาการ เช่น ผื่น, คัน, บวม" style="width:100%;border:1px solid #d1d5db;border-radius:6px;padding:4px 6px;">
          </label>
          <button type="button" class="tl-del" data-type="adr" data-index="${idx}">ลบ</button>

          <div class="tl-grid2" style="grid-column:1/-1;">
            <label>
              วันที่เกิด
              <div class="tl-inline">
                <input type="text" data-adr-field="startDate" data-index="${idx}" value="${adr.startDate || ""}" placeholder="วว/ดด/ปปปป" style="border:1px solid #d1d5db;border-radius:6px;padding:4px 6px;min-width:135px;">
                <input type="time" data-adr-field="startTime" data-index="${idx}" value="${adr.startTime || ""}" style="border:1px solid #d1d5db;border-radius:6px;padding:4px 6px;">
              </div>
            </label>
            <label>
              วันที่หาย
              <div class="tl-inline">
                <input type="text" data-adr-field="endDate" data-index="${idx}" value="${adr.endDate || ""}" placeholder="วว/ดด/ปปปป" style="border:1px solid #d1d5db;border-radius:6px;padding:4px 6px;min-width:135px;">
                <input type="time" data-adr-field="endTime" data-index="${idx}" value="${adr.endTime || ""}" style="border:1px solid #d1d5db;border-radius:6px;padding:4px 6px;">
              </div>
            </label>
          </div>
        </div>
      `;
      adrListEl.appendChild(row);
    });
  }

  // ครั้งแรก
  renderDrugRows();
  renderAdrRows();

  // ---------------- handlers: input ----------------
  drugListEl.addEventListener("input", (ev) => {
    const t = ev.target;
    const idx = Number(t.dataset.index);
    const field = t.dataset.field;
    if (Number.isFinite(idx) && field) {
      data.drugs[idx][field] = t.value;
    }
  });
  adrListEl.addEventListener("input", (ev) => {
    const t = ev.target;
    const idx = Number(t.dataset.index);
    const field = t.dataset.adrField;
    if (Number.isFinite(idx) && field) {
      data.adrs[idx][field] = t.value;
    }
  });

  // ลบ
  drugListEl.addEventListener("click", (ev) => {
    const btn = ev.target.closest(".tl-del");
    if (!btn) return;
    const idx = Number(btn.dataset.index);
    if (data.drugs.length > 1) {
      data.drugs.splice(idx, 1);
    } else {
      data.drugs[0] = { name: "", startDate: "", startTime: "", endDate: "", endTime: "" };
    }
    renderDrugRows();
  });
  adrListEl.addEventListener("click", (ev) => {
    const btn = ev.target.closest(".tl-del");
    if (!btn) return;
    const idx = Number(btn.dataset.index);
    if (data.adrs.length > 1) {
      data.adrs.splice(idx, 1);
    } else {
      data.adrs[0] = { name: "", startDate: "", startTime: "", endDate: "", endTime: "" };
    }
    renderAdrRows();
  });

  // เพิ่ม
  addDrugBtn.addEventListener("click", () => {
    data.drugs.push({ name: "", startDate: "", startTime: "", endDate: "", endTime: "" });
    renderDrugRows();
  });
  addAdrBtn.addEventListener("click", () => {
    data.adrs.push({ name: "", startDate: "", startTime: "", endDate: "", endTime: "" });
    renderAdrRows();
  });

  // ---------------- build timeline ----------------
  buildBtn.addEventListener("click", () => {
    // รวบรวมวันเริ่ม/วันจบ
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let minDate = null;

    function consider(dateStr) {
      const d = parseDateInput(dateStr);
      if (!d) return;
      d.setHours(0, 0, 0, 0);
      if (!minDate || d < minDate) minDate = d;
    }

    data.drugs.forEach((d) => {
      if (d.startDate) consider(d.startDate);
      if (d.endDate) consider(d.endDate);
    });
    data.adrs.forEach((a) => {
      if (a.startDate) consider(a.startDate);
      if (a.endDate) consider(a.endDate);
    });

    // ถ้าไม่มีวันอะไรเลย → ให้วันนี้เป็นวันเริ่ม
    if (!minDate) {
      minDate = new Date(today.getTime());
    }

    // สร้าง array วันจาก minDate → วันนี้ (จริงๆ)
    const days = [];
    const cur = new Date(minDate.getTime());
    while (cur.getTime() <= today.getTime()) {
      days.push(new Date(cur.getTime()));
      cur.setDate(cur.getDate() + 1);
    }

    // วาดแกน X
    tlTicks.innerHTML = "";
    const dayWidth = 120; // px ต่อ 1 วัน
    const totalWidth = dayWidth * days.length + 200;
    tlTicks.style.width = totalWidth + "px";
    tlCanvas.style.width = totalWidth + "px";

    days.forEach((d, i) => {
      const tick = document.createElement("div");
      tick.className = "tl-tick";
      tick.style.left = (i * dayWidth + 180) + "px"; // +180 เพราะเว้นที่ชื่อ Y
      tick.textContent = formatThaiShort(d);
      tlTicks.appendChild(tick);
    });

    // วาดแถบ
    tlCanvas.innerHTML = "";

    const rows = [];

    data.drugs.forEach((d, idx) => {
      rows.push({
        type: "drug",
        label: d.name ? `ยา: ${d.name}` : `ยา #${idx + 1}`,
        start: d.startDate ? parseDateInput(d.startDate) : null,
        end: d.endDate ? parseDateInput(d.endDate) : null,
      });
    });
    data.adrs.forEach((a, idx) => {
      rows.push({
        type: "adr",
        label: a.name ? `ADR: ${a.name}` : `ADR #${idx + 1}`,
        start: a.startDate ? parseDateInput(a.startDate) : null,
        end: a.endDate ? parseDateInput(a.endDate) : null,
      });
    });

    if (!rows.length) {
      tlScroll.classList.add("hidden");
      tlEmpty.textContent = 'ยังไม่มีข้อมูล';
      return;
    }

    rows.forEach((row, rIndex) => {
      const line = document.createElement("div");
      line.className = "tl-row";

      const yLabel = document.createElement("div");
      yLabel.className = "tl-ylabel";
      yLabel.textContent = row.label;
      if (row.type === "adr") {
        yLabel.style.color = "#b91c1c";
      }

      const track = document.createElement("div");
      track.className = "tl-track";
      track.style.width = totalWidth - 180 + "px";

      // กำหนด start, end
      let startIdx = 0;
      let endIdx = days.length - 1; // default = วันนี้

      if (row.start) {
        // ถ้าวันเริ่มน้อยกว่า minDate → ใช้ 0
        const startTime = row.start.getTime();
        const minTime = minDate.getTime();
        if (startTime <= minTime) {
          startIdx = 0;
        } else {
          // หา index
          startIdx = Math.floor((startTime - minTime) / (1000 * 60 * 60 * 24));
          if (startIdx < 0) startIdx = 0;
          if (startIdx > days.length - 1) startIdx = days.length - 1;
        }
      }

      if (row.end) {
        const endTime = row.end.getTime();
        const minTime = minDate.getTime();
        // ถ้าผู้ใช้ใส่วันจบ → ต้องหยุดตรงนั้นเลย
        endIdx = Math.floor((endTime - minTime) / (1000 * 60 * 60 * 24));
        if (endIdx < startIdx) endIdx = startIdx;
        if (endIdx > days.length - 1) endIdx = days.length - 1;
      } else {
        // ถ้าไม่ใส่วันจบ → ongoing ถึงวันนี้
        endIdx = days.length - 1;
      }

      const bar = document.createElement("div");
      bar.className = "tl-bar " + (row.type === "adr" ? "adr" : "drug");
      bar.style.left = (startIdx * dayWidth) + "px";
      bar.style.width = Math.max(80, (endIdx - startIdx + 1) * dayWidth - 16) + "px";
      // เขียนชื่อ + วันเริ่มเฉยๆ
      const showDate = row.start ? ` (${row.start.getFullYear()}-${String(row.start.getMonth()+1).padStart(2,"0")}-${String(row.start.getDate()).padStart(2,"0")})` : "";
      bar.textContent = row.label.replace(/^ยา: /,"").replace(/^ADR: /,"") + showDate;

      track.appendChild(bar);
      line.appendChild(yLabel);
      line.appendChild(track);
      tlCanvas.appendChild(line);
    });

    tlEmpty.textContent = "";
    tlScroll.classList.remove("hidden");
    // scroll ไปท้ายๆ นิดนึงให้เห็นวันนี้
    tlScroll.scrollLeft = tlScroll.scrollWidth;
  });

  // ล้างข้อมูลหน้า 5
  clearBtn.addEventListener("click", () => {
    window.drugAllergyData.timeline = {
      drugs: [
        { name: "", startDate: "", startTime: "", endDate: "", endTime: "" },
      ],
      adrs: [
        { name: "", startDate: "", startTime: "", endDate: "", endTime: "" },
      ],
    };
    data.drugs = window.drugAllergyData.timeline.drugs;
    data.adrs = window.drugAllergyData.timeline.adrs;
    renderDrugRows();
    renderAdrRows();
    tlScroll.classList.add("hidden");
    tlEmpty.textContent = "ยังไม่มีข้อมูลหรือยังไม่ได้กด \"สร้าง Timeline\"";
  });

  // print
  printBtn.addEventListener("click", () => {
    window.print();
  });

  // ไปหน้า 6
  nextBtn.addEventListener("click", () => {
    const btn = document.querySelector('.tabs button[data-target="page6"]');
    if (btn) btn.click();
  });
};

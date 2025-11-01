// page5.js
(function () {
  // เคลียร์ของเก่าในรีเฟรช (ให้หน้า 5 เริ่มเปล่าๆ ทุกครั้ง)
  if (!window.drugAllergyData) window.drugAllergyData = {};
  window.drugAllergyData.page5 = {
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

  // helper แปลง dd/mm/yyyy → Date
  function parseThaiDate(str) {
    if (!str) return null;
    // รับทั้ง 2025-11-01 และ 01/11/2025
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [y, m, d] = str.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    const parts = str.split("/");
    if (parts.length !== 3) return null;
    const [d, m, y] = parts.map(Number);
    return new Date(y, m - 1, d);
  }

  // ตัดเวลาให้เป็นเที่ยงคืน
  function normalizeDate(d) {
    if (!d) return null;
    const nd = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return nd;
  }

  // แปลง Date → 25 พ.ย.
  const thMonthsShort = [
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
    "ธ.ค.",
  ];
  function formatThaiShort(d) {
    return d.getDate() + " " + thMonthsShort[d.getMonth()];
  }

  function renderPage5() {
    const root = document.getElementById("page5");
    if (!root) return;

    const d = window.drugAllergyData.page5;

    root.innerHTML = `
      <div class="p5-wrapper" style="background:linear-gradient(135deg,#fff4d9 0%,#ffe9ff 38%,#fef7ff 100%);border:1px solid rgba(255,167,196,.2);border-radius:1.4rem;padding:1.35rem 1.4rem 6.5rem;box-shadow:0 15px 35px rgba(251,146,60,.08);position:relative;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
          <h2 style="display:flex;align-items:center;gap:.6rem;font-size:1.35rem;font-weight:700;color:#7c3aed;margin:0;">
            <span style="font-size:1.5rem;">📅</span>
            <span>หน้า 5 Timeline ประเมินการแพ้ยา</span>
          </h2>
          <div class="p5-glitter" aria-hidden="true"></div>
        </div>

        <!-- ส่วนยา -->
        <section style="background:rgba(255,255,255,.82);border:1px solid rgba(124,58,237,.1);border-radius:1rem;padding:1.05rem 1rem 1.1rem;margin-bottom:1.1rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.8rem;">
            <h3 style="display:flex;align-items:center;gap:.5rem;font-size:1rem;font-weight:700;color:#0f766e;margin:0;">
              <span style="width:14px;height:14px;background:#2563eb;border-radius:999px;display:inline-block;"></span>
              <span>ยา (Drug)</span>
            </h3>
            <button id="p5_add_drug" type="button" style="background:#22c55e;color:#fff;border:none;border-radius:.7rem;padding:.45rem .95rem;font-weight:600;cursor:pointer;box-shadow:0 10px 18px rgba(34,197,94,.2);">+ เพิ่มยาตัวใหม่</button>
          </div>
          <div id="p5_drug_list" style="display:flex;flex-direction:column;gap:.6rem;"></div>
        </section>

        <!-- ส่วน ADR -->
        <section style="background:rgba(255,255,255,.82);border:1px solid rgba(255,99,132,.07);border-radius:1rem;padding:1.05rem 1rem 1.1rem;margin-bottom:1.1rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.8rem;">
            <h3 style="display:flex;align-items:center;gap:.5rem;font-size:1rem;font-weight:700;color:#be123c;margin:0;">
              <span style="width:14px;height:14px;background:#ef4444;border-radius:999px;display:inline-block;"></span>
              <span>ADR (Adverse Drug Reaction)</span>
            </h3>
            <button id="p5_add_adr" type="button" style="background:#ef4444;color:#fff;border:none;border-radius:.7rem;padding:.45rem .95rem;font-weight:600;cursor:pointer;box-shadow:0 8px 16px rgba(239,68,68,.2);">+ เพิ่ม ADR</button>
          </div>
          <div id="p5_adr_list" style="display:flex;flex-direction:column;gap:.6rem;"></div>
        </section>

        <!-- ปุ่มสร้าง timeline -->
        <div style="margin-bottom:1rem;">
          <button id="p5_build_tl" type="button" style="background:#3b82f6;color:#fff;border:none;border-radius:.8rem;padding:.6rem 1.3rem;font-weight:600;cursor:pointer;box-shadow:0 10px 20px rgba(59,130,246,.23);display:inline-flex;align-items:center;gap:.35rem;">
            ▶ สร้าง Timeline
          </button>
        </div>

        <!-- Visual timeline -->
        <section id="p5_timeline_wrap" style="background:rgba(255,255,255,.82);border:1px solid rgba(148,163,184,.16);border-radius:1rem;padding:1rem .6rem 1rem 1rem;display:none;">
          <h3 style="margin:0 0 1rem;font-size:1.05rem;font-weight:700;color:#0f172a;">Visual Timeline</h3>
          <div id="p5_timeline_outer" style="overflow-x:auto;overflow-y:hidden;">
            <div id="p5_timeline" style="min-width:100%;position:relative;"></div>
          </div>
        </section>

        <!-- ปุ่มด้านล่างแบบอยู่กับที่ -->
        <div style="position:sticky;bottom:0;left:0;right:0;margin-top:1.4rem;background:linear-gradient(180deg,rgba(255,248,252,0) 0%,rgba(255,248,252,1) 20%,rgba(255,248,252,1) 100%);padding:1.1rem .25rem 0;">
          <button id="p5_print" type="button" style="width:100%;background:#10b981;color:#fff;border:none;border-radius:.9rem;padding:.55rem 1.1rem;font-weight:600;cursor:pointer;margin-bottom:.7rem;box-shadow:0 10px 20px rgba(16,185,129,.2);">🖨️ Print / PDF</button>
          <button id="p5_go_page6" type="button" style="width:100%;background:#6366f1;color:#fff;border:none;border-radius:.9rem;padding:.7rem 1.1rem;font-weight:700;cursor:pointer;margin-bottom:.55rem;box-shadow:0 12px 22px rgba(99,102,241,.28);">บันทึกข้อมูลและไปหน้า 6</button>
          <button id="p5_clear" type="button" style="width:100%;background:#ef4444;color:#fff;border:none;border-radius:.9rem;padding:.7rem 1.1rem;font-weight:600;cursor:pointer;box-shadow:0 10px 20px rgba(239,68,68,.18);">🗑️ ล้างข้อมูลหน้านี้</button>
        </div>
      </div>
    `;

    // ใส่ style สำหรับ print (เฉพาะหน้า 5)
    addPrintStyles();

    const drugListEl = root.querySelector("#p5_drug_list");
    const adrListEl = root.querySelector("#p5_adr_list");
    const btnAddDrug = root.querySelector("#p5_add_drug");
    const btnAddAdr = root.querySelector("#p5_add_adr");
    const btnBuild = root.querySelector("#p5_build_tl");
    const btnPrint = root.querySelector("#p5_print");
    const btnClear = root.querySelector("#p5_clear");
    const btnGo6 = root.querySelector("#p5_go_page6");
    const timelineWrap = root.querySelector("#p5_timeline_wrap");
    const timelineOuter = root.querySelector("#p5_timeline_outer");
    const timelineEl = root.querySelector("#p5_timeline");

    // ---------------- render รายการยา ----------------
    function renderDrugs() {
      drugListEl.innerHTML = "";
      d.drugs.forEach((item, idx) => {
        const row = document.createElement("div");
        row.style.background = "rgba(243,244,246,.5)";
        row.style.border = "1px solid rgba(148,163,184,.1)";
        row.style.borderRadius = ".7rem";
        row.style.padding = ".55rem .55rem .85rem";
        row.style.display = "grid";
        row.style.gridTemplateColumns = "1fr";
        row.style.gap = ".45rem";

        row.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;">
            <label style="font-weight:600;color:#0f172a;font-size:.85rem;">ยาตัวที่ ${idx + 1}</label>
            ${
              idx > 0
                ? `<button type="button" data-del="${idx}" style="background:none;border:none;color:#ef4444;font-weight:600;cursor:pointer;">ลบ</button>`
                : ""
            }
          </div>
          <input type="text" data-field="name" data-idx="${idx}" placeholder="ระบุชื่อยา" value="${item.name || ""}" style="border:1px solid rgba(59,130,246,.25);border-radius:.55rem;padding:.35rem .45rem;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.45rem;">
            <label style="display:flex;flex-direction:column;gap:.25rem;font-size:.78rem;">
              <span>เริ่มให้ยา</span>
              <input type="date" data-field="startDate" data-idx="${idx}" value="${item.startDate || ""}" style="border:1px solid rgba(59,130,246,.25);border-radius:.4rem;padding:.25rem .35rem;">
            </label>
            <label style="display:flex;flex-direction:column;gap:.25rem;font-size:.78rem;">
              <span>เวลา</span>
              <input type="time" data-field="startTime" data-idx="${idx}" value="${item.startTime || ""}" style="border:1px solid rgba(59,130,246,.25);border-radius:.4rem;padding:.25rem .35rem;">
            </label>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.45rem;">
            <label style="display:flex;flex-direction:column;gap:.25rem;font-size:.78rem;">
              <span>หยุดยา</span>
              <input type="date" data-field="endDate" data-idx="${idx}" value="${item.endDate || ""}" style="border:1px solid rgba(59,130,246,.25);border-radius:.4rem;padding:.25rem .35rem;">
            </label>
            <label style="display:flex;flex-direction:column;gap:.25rem;font-size:.78rem;">
              <span>เวลา</span>
              <input type="time" data-field="endTime" data-idx="${idx}" value="${item.endTime || ""}" style="border:1px solid rgba(59,130,246,.25);border-radius:.4rem;padding:.25rem .35rem;">
            </label>
          </div>
        `;
        drugListEl.appendChild(row);
      });

      // bind
      drugListEl.querySelectorAll("input").forEach((inp) => {
        inp.addEventListener("input", (e) => {
          const field = e.target.dataset.field;
          const idx = +e.target.dataset.idx;
          d.drugs[idx][field] = e.target.value;
        });
      });
      drugListEl.querySelectorAll("[data-del]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = +btn.dataset.del;
          d.drugs.splice(idx, 1);
          renderDrugs();
        });
      });
    }

    // ---------------- render ADR ----------------
    function renderADRs() {
      adrListEl.innerHTML = "";
      d.adrs.forEach((item, idx) => {
        const row = document.createElement("div");
        row.style.background = "rgba(254,242,242,.55)";
        row.style.border = "1px solid rgba(248,113,113,.12)";
        row.style.borderRadius = ".7rem";
        row.style.padding = ".55rem .55rem .85rem";
        row.style.display = "grid";
        row.style.gridTemplateColumns = "1fr";
        row.style.gap = ".45rem";

        row.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;">
            <label style="font-weight:600;color:#b91c1c;font-size:.85rem;">ADR ${idx + 1}</label>
            ${
              idx > 0
                ? `<button type="button" data-del-adr="${idx}" style="background:none;border:none;color:#ef4444;font-weight:600;cursor:pointer;">ลบ</button>`
                : ""
            }
          </div>
          <input type="text" data-field="name" data-idx="${idx}" data-type="adr" placeholder="ระบุอาการ เช่น ผื่นขึ้น, คัน, บวม" value="${item.name || ""}" style="border:1px solid rgba(244,63,94,.25);border-radius:.55rem;padding:.35rem .45rem;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.45rem;">
            <label style="display:flex;flex-direction:column;gap:.25rem;font-size:.78rem;">
              <span>วันที่เกิด</span>
              <input type="date" data-field="startDate" data-idx="${idx}" data-type="adr" value="${item.startDate || ""}" style="border:1px solid rgba(244,63,94,.25);border-radius:.4rem;padding:.25rem .35rem;">
            </label>
            <label style="display:flex;flex-direction:column;gap:.25rem;font-size:.78rem;">
              <span>เวลา</span>
              <input type="time" data-field="startTime" data-idx="${idx}" data-type="adr" value="${item.startTime || ""}" style="border:1px solid rgba(244,63,94,.25);border-radius:.4rem;padding:.25rem .35rem;">
            </label>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.45rem;">
            <label style="display:flex;flex-direction:column;gap:.25rem;font-size:.78rem;">
              <span>วันที่หาย</span>
              <input type="date" data-field="endDate" data-idx="${idx}" data-type="adr" value="${item.endDate || ""}" style="border:1px solid rgba(244,63,94,.25);border-radius:.4rem;padding:.25rem .35rem;">
            </label>
            <label style="display:flex;flex-direction:column;gap:.25rem;font-size:.78rem;">
              <span>เวลา</span>
              <input type="time" data-field="endTime" data-idx="${idx}" data-type="adr" value="${item.endTime || ""}" style="border:1px solid rgba(244,63,94,.25);border-radius:.4rem;padding:.25rem .35rem;">
            </label>
          </div>
        `;
        adrListEl.appendChild(row);
      });

      adrListEl.querySelectorAll("input").forEach((inp) => {
        inp.addEventListener("input", (e) => {
          const field = e.target.dataset.field;
          const idx = +e.target.dataset.idx;
          const type = e.target.dataset.type;
          d.adrs[idx][field] = e.target.value;
        });
      });
      adrListEl.querySelectorAll("[data-del-adr]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = +btn.dataset.delAdr;
          d.adrs.splice(idx, 1);
          renderADRs();
        });
      });
    }

    renderDrugs();
    renderADRs();

    // ---------- ปุ่มเพิ่ม ----------
    btnAddDrug.addEventListener("click", () => {
      d.drugs.push({
        name: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
      });
      renderDrugs();
    });
    btnAddAdr.addEventListener("click", () => {
      d.adrs.push({
        name: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
      });
      renderADRs();
    });

    // ---------- สร้าง timeline ----------
    btnBuild.addEventListener("click", () => {
      // toggle แสดง/ซ่อน
      if (timelineWrap.style.display === "none") {
        timelineWrap.style.display = "block";
      }

      buildTimeline();
    });

    // ---------- ล้าง ----------
    btnClear.addEventListener("click", () => {
      window.drugAllergyData.page5 = {
        drugs: [
          { name: "", startDate: "", startTime: "", endDate: "", endTime: "" },
        ],
        adrs: [
          { name: "", startDate: "", startTime: "", endDate: "", endTime: "" },
        ],
      };
      d.drugs = window.drugAllergyData.page5.drugs;
      d.adrs = window.drugAllergyData.page5.adrs;
      renderDrugs();
      renderADRs();
      timelineWrap.style.display = "none";
      timelineEl.innerHTML = "";
    });

    // ---------- ไปหน้า 6 ----------
    btnGo6.addEventListener("click", () => {
      const btn = document.querySelector('.tabs button[data-target="page6"]');
      if (btn) btn.click();
    });

    // ---------- ปริ้น ----------
    btnPrint.addEventListener("click", () => {
      window.print();
    });

    function buildTimeline() {
      const today = normalizeDate(new Date());

      // ดึงวันเริ่มที่เล็กสุด
      let minDate = null;
      let maxDate = today; // อย่างน้อยต้องจบวันนี้

      // drugs
      d.drugs.forEach((dr) => {
        const s = dr.startDate ? normalizeDate(parseThaiDate(dr.startDate)) : null;
        const e = dr.endDate ? normalizeDate(parseThaiDate(dr.endDate)) : null;
        if (s) {
          if (!minDate || s < minDate) minDate = s;
        }
        if (e) {
          if (!maxDate || e > maxDate) maxDate = e;
        }
      });
      // adrs
      d.adrs.forEach((ad) => {
        const s = ad.startDate ? normalizeDate(parseThaiDate(ad.startDate)) : null;
        const e = ad.endDate ? normalizeDate(parseThaiDate(ad.endDate)) : null;
        if (s) {
          if (!minDate || s < minDate) minDate = s;
        }
        if (e) {
          if (!maxDate || e > maxDate) maxDate = e;
        }
      });

      if (!minDate) {
        // ถ้าไม่มีวันเลยก็เอาวันนี้
        minDate = today;
      }
      // maxDate อย่างน้อยต้องถึงวันนี้
      if (maxDate < today) maxDate = today;

      // คำนวนจำนวนวัน
      const dayMs = 24 * 60 * 60 * 1000;
      const totalDays = Math.floor((maxDate - minDate) / dayMs) + 1;

      // ความกว้างต่อวัน
      const dayWidth = 130; // กว้างขึ้นเพื่อให้เห็นวันชัด
      const totalWidth = totalDays * dayWidth + 180; // +margin

      timelineEl.style.minWidth = totalWidth + "px";
      timelineEl.innerHTML = "";

      // สร้างแกน X
      const axis = document.createElement("div");
      axis.style.display = "flex";
      axis.style.gap = "0";
      axis.style.marginLeft = "180px";
      axis.style.marginBottom = "1.1rem";
      for (let i = 0; i < totalDays; i++) {
        const ddd = new Date(minDate.getTime() + i * dayMs);
        const cell = document.createElement("div");
        cell.style.width = dayWidth + "px";
        cell.style.textAlign = "center";
        cell.style.fontSize = ".8rem";
        cell.style.color = "#1f2937";
        cell.textContent = formatThaiShort(ddd);
        axis.appendChild(cell);
      }
      timelineEl.appendChild(axis);

      // Y rows
      let currentTop = 70;

      // ----- drugs -----
      d.drugs.forEach((dr) => {
        const label = document.createElement("div");
        label.textContent = "ยา: " + (dr.name || "(ไม่ระบุ)");
        label.style.position = "absolute";
        label.style.left = "15px";
        label.style.top = currentTop + "px";
        label.style.fontWeight = "600";
        label.style.color = "#0f766e";
        timelineEl.appendChild(label);

        // แถบ
        const s = dr.startDate ? normalizeDate(parseThaiDate(dr.startDate)) : minDate;
        // ถ้าไม่ใส่ end → ถึงวันนี้จริงๆ
        const e = dr.endDate
          ? normalizeDate(parseThaiDate(dr.endDate))
          : today > maxDate
          ? today
          : maxDate;

        const startIdx = Math.max(0, Math.floor((s - minDate) / dayMs));
        const endIdx = Math.floor((e - minDate) / dayMs);

        const bar = document.createElement("div");
        bar.style.position = "absolute";
        bar.style.left = 180 + startIdx * dayWidth + 10 + "px";
        // +10 กันชนซ้าย
        bar.style.top = currentTop - 5 + "px";
        bar.style.height = "42px";
        bar.style.width = Math.max(80, (endIdx - startIdx + 1) * dayWidth - 20) + "px";
        bar.style.background = "#0ea5e9";
        bar.style.borderRadius = "999px";
        bar.style.display = "flex";
        bar.style.alignItems = "center";
        bar.style.justifyContent = "center";
        bar.style.color = "#000";
        bar.style.fontWeight = "600";
        bar.style.boxShadow = "0 10px 25px rgba(14,165,233,.35)";
        bar.textContent = (dr.name || "ยาที่ไม่ได้ระบุ") + " (" + formatDateText(s) + ")";
        timelineEl.appendChild(bar);

        currentTop += 55;
      });

      // ----- ADRs -----
      d.adrs.forEach((ad) => {
        const label = document.createElement("div");
        label.textContent = "ADR: " + (ad.name || "(ไม่ระบุ)");
        label.style.position = "absolute";
        label.style.left = "15px";
        label.style.top = currentTop + "px";
        label.style.fontWeight = "600";
        label.style.color = "#b91c1c";
        timelineEl.appendChild(label);

        const s = ad.startDate ? normalizeDate(parseThaiDate(ad.startDate)) : minDate;
        const e = ad.endDate
          ? normalizeDate(parseThaiDate(ad.endDate))
          : today > maxDate
          ? today
          : maxDate;

        const startIdx = Math.max(0, Math.floor((s - minDate) / dayMs));
        const endIdx = Math.floor((e - minDate) / dayMs);

        const bar = document.createElement("div");
        bar.style.position = "absolute";
        bar.style.left = 180 + startIdx * dayWidth + 10 + "px";
        bar.style.top = currentTop - 7 + "px";
        bar.style.height = "42px";
        bar.style.width = Math.max(80, (endIdx - startIdx + 1) * dayWidth - 20) + "px";
        bar.style.background = "#ef4444";
        bar.style.borderRadius = "999px";
        bar.style.display = "flex";
        bar.style.alignItems = "center";
        bar.style.justifyContent = "center";
        bar.style.color = "#000";
        bar.style.fontWeight = "600";
        bar.style.boxShadow = "0 10px 25px rgba(239,68,68,.38)";
        bar.textContent = (ad.name || "ADR") + " (" + formatDateText(s) + ")";
        timelineEl.appendChild(bar);

        currentTop += 55;
      });

      // ถ้าตารางกว้างมาก ให้เลื่อนไปขวาสุดหน่อย
      timelineOuter.scrollLeft = 0;
    }

    function formatDateText(d) {
      if (!d) return "";
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }

    function addPrintStyles() {
      if (document.getElementById("p5-print-style")) return;
      const style = document.createElement("style");
      style.id = "p5-print-style";
      style.textContent = `
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .topbar,
          .tabs {
            display: none !important;
          }
          #page5 {
            display: block !important;
          }
          #page5 .p5-wrapper {
            box-shadow:none !important;
            border:none !important;
            padding:0 !important;
            background:#fff !important;
          }
          #p5_timeline_outer {
            overflow: visible !important;
          }
          #p5_timeline {
            width: 100% !important;
          }
          button {
            display: none !important;
          }
          @page {
            size: landscape;
            margin: 12mm;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // export
  window.renderPage5 = renderPage5;
})();

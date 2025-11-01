// page5.js
// =================== หน้า 5 : Timeline ประเมินการแพ้ยา ===================
(function () {
  const DAY_MS = 24 * 60 * 60 * 1000;

  // สร้าง state หน้า 5 ใหม่ทุกครั้งที่โหลดไฟล์ (รีเฟรชแล้วเคลียร์)
  const page5State = {
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

  // ======= util =======
  function todayMidnight() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function parseDate(dateStr, timeStr) {
    if (!dateStr) return null;
    // dateStr มาจาก <input type="date"> จะเป็น yyyy-mm-dd
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return null;
    if (timeStr && timeStr.includes(":")) {
      const [hh, mm] = timeStr.split(":");
      d.setHours(+hh || 0, +mm || 0, 0, 0);
    } else {
      d.setHours(0, 0, 0, 0);
    }
    return d;
  }

  // format แกน X แบบไทยสั้นๆ
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
    "ธ.ค."
  ];
  function formatThShort(d) {
    return d.getDate() + " " + thMonthsShort[d.getMonth()];
  }

  // สร้างบล็อก input ยา 1 ตัว
  function createDrugCard(index, data, onChange, onDelete) {
    const wrap = document.createElement("div");
    wrap.className = "tl-card tl-bg-soft";

    wrap.innerHTML = `
      <div class="tl-head">
        <h2 style="margin:0;font-size:1rem;color:#0f172a;">ยา</h2>
        <button type="button" class="tl-del" data-del="1">ลบ</button>
      </div>
      <div class="tl-grid2">
        <div>
          <label>ชื่อยา</label>
          <input type="text" class="tl-inp-name" placeholder="ระบุชื่อยา" value="${data.name || ""}" />
        </div>
        <div></div>
        <div class="tl-inline">
          <div>
            <label>เริ่มให้ยา</label>
            <input type="date" class="tl-inp-startDate" value="${data.startDate || ""}">
          </div>
          <div>
            <label>&nbsp;</label>
            <input type="time" class="tl-inp-startTime" value="${data.startTime || ""}">
          </div>
        </div>
        <div class="tl-inline">
          <div>
            <label>หยุดยา</label>
            <input type="date" class="tl-inp-endDate" value="${data.endDate || ""}">
          </div>
          <div>
            <label>&nbsp;</label>
            <input type="time" class="tl-inp-endTime" value="${data.endTime || ""}">
          </div>
        </div>
      </div>
    `;

    // bind
    wrap.querySelector(".tl-inp-name").addEventListener("input", (e) => {
      onChange(index, { ...data, name: e.target.value });
    });
    wrap.querySelector(".tl-inp-startDate").addEventListener("change", (e) => {
      onChange(index, { ...data, startDate: e.target.value });
    });
    wrap.querySelector(".tl-inp-startTime").addEventListener("change", (e) => {
      onChange(index, { ...data, startTime: e.target.value });
    });
    wrap.querySelector(".tl-inp-endDate").addEventListener("change", (e) => {
      onChange(index, { ...data, endDate: e.target.value });
    });
    wrap.querySelector(".tl-inp-endTime").addEventListener("change", (e) => {
      onChange(index, { ...data, endTime: e.target.value });
    });
    wrap.querySelector("[data-del]").addEventListener("click", () => {
      onDelete(index);
    });

    return wrap;
  }

  // สร้างบล็อก input ADR 1 ตัว
  function createAdrCard(index, data, onChange, onDelete) {
    const wrap = document.createElement("div");
    wrap.className = "tl-card tl-bg-soft-red";

    wrap.innerHTML = `
      <div class="tl-head">
        <h2 style="margin:0;font-size:1rem;color:#b91c1c;">ADR (Adverse Drug Reaction)</h2>
        <button type="button" class="tl-del" data-del="1">ลบ</button>
      </div>
      <div class="tl-grid2">
        <div>
          <label>อาการ</label>
          <input type="text" class="tl-inp-name" placeholder="ระบุอาการ เช่น ผื่น, คัน, บวม" value="${data.name || ""}" />
        </div>
        <div></div>
        <div class="tl-inline">
          <div>
            <label>วันที่เกิด</label>
            <input type="date" class="tl-inp-startDate" value="${data.startDate || ""}">
          </div>
          <div>
            <label>&nbsp;</label>
            <input type="time" class="tl-inp-startTime" value="${data.startTime || ""}">
          </div>
        </div>
        <div class="tl-inline">
          <div>
            <label>วันที่หาย</label>
            <input type="date" class="tl-inp-endDate" value="${data.endDate || ""}">
          </div>
          <div>
            <label>&nbsp;</label>
            <input type="time" class="tl-inp-endTime" value="${data.endTime || ""}">
          </div>
        </div>
      </div>
    `;

    wrap.querySelector(".tl-inp-name").addEventListener("input", (e) => {
      onChange(index, { ...data, name: e.target.value });
    });
    wrap.querySelector(".tl-inp-startDate").addEventListener("change", (e) => {
      onChange(index, { ...data, startDate: e.target.value });
    });
    wrap.querySelector(".tl-inp-startTime").addEventListener("change", (e) => {
      onChange(index, { ...data, startTime: e.target.value });
    });
    wrap.querySelector(".tl-inp-endDate").addEventListener("change", (e) => {
      onChange(index, { ...data, endDate: e.target.value });
    });
    wrap.querySelector(".tl-inp-endTime").addEventListener("change", (e) => {
      onChange(index, { ...data, endTime: e.target.value });
    });
    wrap.querySelector("[data-del]").addEventListener("click", () => {
      onDelete(index);
    });

    return wrap;
  }

  // วาด timeline
  function buildTimeline(root, state) {
    const today = todayMidnight();

    // 1) หา minDate (วันแรกที่เริ่มยา/ADR) และ maxDate (มากสุดของ: วันนี้ กับวันสิ้นสุดที่กรอก)
    let minDate = null;
    let maxDate = new Date(today); // เริ่มจากวันนี้ก่อนเลย

    state.drugs.forEach((d) => {
      const s = parseDate(d.startDate, d.startTime);
      const e = d.endDate ? parseDate(d.endDate, d.endTime) : null;

      if (s && (!minDate || s < minDate)) minDate = s;
      if (e && e > maxDate) maxDate = e;
    });

    state.adrs.forEach((a) => {
      const s = parseDate(a.startDate, a.startTime);
      const e = a.endDate ? parseDate(a.endDate, a.endTime) : null;

      if (s && (!minDate || s < minDate)) minDate = s;
      if (e && e > maxDate) maxDate = e;
    });

    // ถ้ายังไม่มีอะไรเลย ให้ minDate = วันนี้
    if (!minDate) minDate = new Date(today);

    // 2) เตรียมกล่อง
    root.innerHTML = "";
    const scrollBox = document.createElement("div");
    scrollBox.className = "tl-scroll";
    root.appendChild(scrollBox);

    const axis = document.createElement("div");
    axis.className = "tl-ticks";
    scrollBox.appendChild(axis);

    const canvas = document.createElement("div");
    canvas.className = "tl-canvas";
    scrollBox.appendChild(canvas);

    // 3) สร้างวันบนแกน X: ต้องไปถึง "วันนี้" ทุกครั้ง
    const dayWidth = 115; // กว้างต่อวัน
    const totalDays =
      Math.round((maxDate.getTime() - minDate.getTime()) / DAY_MS) + 1;

    axis.style.position = "relative";
    axis.style.height = "32px";
    axis.style.minWidth = totalDays * dayWidth + 140 + "px";
    canvas.style.minWidth = totalDays * dayWidth + 140 + "px";

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(minDate.getTime() + i * DAY_MS);
      const tick = document.createElement("div");
      tick.className = "tl-tick";
      tick.style.left = 120 + i * dayWidth + "px";
      tick.textContent = formatThShort(d);
      axis.appendChild(tick);
    }

    // 4) วาด row : drugs ก่อน แล้วค่อย ADR
    let yIndex = 0;

    state.drugs.forEach((d) => {
      const row = document.createElement("div");
      row.className = "tl-row";
      row.style.top = 0;
      row.style.height = "56px";
      row.style.display = "grid";
      row.style.gridTemplateColumns = "110px 1fr";
      row.style.alignItems = "center";
      row.style.gap = "6px";
      row.style.marginTop = "6px";

      const label = document.createElement("div");
      label.className = "tl-ylabel";
      label.textContent = d.name ? `ยา: ${d.name}` : "ยา:";
      row.appendChild(label);

      const track = document.createElement("div");
      track.className = "tl-track";
      track.style.position = "relative";
      track.style.height = "40px";
      row.appendChild(track);

      // แถบจริง
      const s = parseDate(d.startDate, d.startTime);
      if (s) {
        let e = d.endDate
          ? parseDate(d.endDate, d.endTime)
          : new Date(today); // ถ้าไม่กรอกให้ยาวถึงวันนี้

        // ป้องกันกรณีกรอกวันสิ้นสุดก่อนวันเริ่ม
        if (e < s) e = new Date(s);

        const startOffset = Math.round(
          (s.getTime() - minDate.getTime()) / DAY_MS
        );
        const endOffset = Math.round(
          (e.getTime() - minDate.getTime()) / DAY_MS
        );

        const bar = document.createElement("div");
        bar.className = "tl-bar drug";
        bar.style.left = 120 + startOffset * dayWidth + "px";
        bar.style.width = Math.max(60, (endOffset - startOffset + 1) * dayWidth - 12) + "px";
        bar.textContent = d.name
          ? `${d.name} (${s.toISOString().slice(0, 10)})`
          : `(${s.toISOString().slice(0, 10)})`;
        track.appendChild(bar);
      }

      canvas.appendChild(row);
      yIndex++;
    });

    state.adrs.forEach((a) => {
      const row = document.createElement("div");
      row.className = "tl-row";
      row.style.display = "grid";
      row.style.gridTemplateColumns = "110px 1fr";
      row.style.alignItems = "center";
      row.style.gap = "6px";
      row.style.marginTop = "6px";

      const label = document.createElement("div");
      label.className = "tl-ylabel";
      label.style.color = "#b91c1c";
      label.textContent = a.name ? `ADR: ${a.name}` : "ADR:";
      row.appendChild(label);

      const track = document.createElement("div");
      track.className = "tl-track";
      track.style.position = "relative";
      track.style.height = "40px";
      row.appendChild(track);

      const s = parseDate(a.startDate, a.startTime);
      if (s) {
        let e = a.endDate
          ? parseDate(a.endDate, a.endTime)
          : new Date(today); // ถ้าไม่กรอกให้ยาวถึงวันนี้

        if (e < s) e = new Date(s);

        const startOffset = Math.round(
          (s.getTime() - minDate.getTime()) / DAY_MS
        );
        const endOffset = Math.round(
          (e.getTime() - minDate.getTime()) / DAY_MS
        );

        const bar = document.createElement("div");
        bar.className = "tl-bar adr";
        bar.style.left = 120 + startOffset * dayWidth + "px";
        bar.style.width = Math.max(60, (endOffset - startOffset + 1) * dayWidth - 12) + "px";
        bar.textContent = a.name
          ? `${a.name} (${s.toISOString().slice(0, 10)})`
          : `(${s.toISOString().slice(0, 10)})`;
        track.appendChild(bar);
      }

      canvas.appendChild(row);
      yIndex++;
    });
  }

  // ============== renderPage5 (export) ==============
  window.renderPage5 = function () {
    const container = document.getElementById("page5");
    if (!container) return;

    container.innerHTML = ""; // เคลียร์ก่อน

    const wrap = document.createElement("div");
    wrap.className = "p5-wrapper";
    wrap.style.position = "relative";
    wrap.style.background =
      "radial-gradient(circle at top, #fff7d6 0%, #fdf2ff 50%, #ffffff 100%)";
    wrap.style.border = "1px solid rgba(251,94,140,0.0)";
    wrap.style.borderRadius = "1.4rem";
    wrap.style.padding = "1.4rem 1.4rem 6.5rem";
    wrap.style.boxShadow = "0 20px 45px rgba(111,63,227,.05)";
    container.appendChild(wrap);

    // เลเยอร์วิบวับ
    const glitter = document.createElement("div");
    glitter.className = "p5-glitter-layer";
    wrap.appendChild(glitter);

    // ======= ส่วนยา =======
    const drugSec = document.createElement("div");
    drugSec.className = "tl-section";
    const drugHead = document.createElement("div");
    drugHead.className = "tl-head";
    drugHead.innerHTML =
      '<h2 style="font-size:1.1rem;margin:0;">ยา</h2><button type="button" class="btn-green-solid" id="p5-add-drug">+ เพิ่มยาตัวใหม่</button>';
    drugSec.appendChild(drugHead);

    const drugList = document.createElement("div");
    drugSec.appendChild(drugList);
    wrap.appendChild(drugSec);

    // ======= ส่วน ADR =======
    const adrSec = document.createElement("div");
    adrSec.className = "tl-section";
    const adrHead = document.createElement("div");
    adrHead.className = "tl-head";
    adrHead.innerHTML =
      '<h2 style="font-size:1.1rem;margin:0;">ADR (Adverse Drug Reaction)</h2><button type="button" class="btn-red-solid" id="p5-add-adr">+ เพิ่ม ADR</button>';
    adrSec.appendChild(adrHead);

    const adrList = document.createElement("div");
    adrSec.appendChild(adrList);
    wrap.appendChild(adrSec);

    // ===== ปุ่มสร้าง timeline =====
    const actionUnderAdr = document.createElement("div");
    actionUnderAdr.className = "tl-actions-under-adr";
    actionUnderAdr.innerHTML =
      '<button type="button" class="btn-blue-solid" id="p5-build-timeline">▶ สร้าง Timeline</button>';
    adrSec.appendChild(actionUnderAdr);

    // ======= กล่องแสดง timeline =======
    const visualSec = document.createElement("div");
    visualSec.className = "tl-section";
    visualSec.innerHTML = `<h2 style="margin:0 0 .7rem;">Visual Timeline</h2><div id="p5-tl-visual"></div>`;
    wrap.appendChild(visualSec);

    // ===== ปุ่มท้ายหน้า =====
    const bottom = document.createElement("div");
    bottom.className = "tl-bottom-actions";
    bottom.innerHTML = `
      <button type="button" class="btn-green-solid" id="p5-print">🖨️ Print / PDF</button>
      <button type="button" class="btn-purple-solid" id="p5-next">บันทึกข้อมูลและไปหน้า 6</button>
      <button type="button" class="btn-red-solid" id="p5-clear">🗑 ล้างข้อมูลหน้านี้</button>
    `;
    wrap.appendChild(bottom);

    // ===== ฟังก์ชัน internal =====
    function refreshDrugList() {
      drugList.innerHTML = "";
      page5State.drugs.forEach((d, idx) => {
        const el = createDrugCard(
          idx,
          d,
          (i, nd) => {
            page5State.drugs[i] = nd;
          },
          (i) => {
            page5State.drugs.splice(i, 1);
            if (page5State.drugs.length === 0) {
              page5State.drugs.push({
                name: "",
                startDate: "",
                startTime: "",
                endDate: "",
                endTime: ""
              });
            }
            refreshDrugList();
          }
        );
        drugList.appendChild(el);
      });
    }

    function refreshAdrList() {
      adrList.innerHTML = "";
      page5State.adrs.forEach((d, idx) => {
        const el = createAdrCard(
          idx,
          d,
          (i, nd) => {
            page5State.adrs[i] = nd;
          },
          (i) => {
            page5State.adrs.splice(i, 1);
            if (page5State.adrs.length === 0) {
              page5State.adrs.push({
                name: "",
                startDate: "",
                startTime: "",
                endDate: "",
                endTime: ""
              });
            }
            refreshAdrList();
          }
        );
        adrList.appendChild(el);
      });
    }

    // first render list
    refreshDrugList();
    refreshAdrList();

    // bind ปุ่มเพิ่ม
    drugHead.querySelector("#p5-add-drug").addEventListener("click", () => {
      page5State.drugs.push({
        name: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: ""
      });
      refreshDrugList();
    });
    adrHead.querySelector("#p5-add-adr").addEventListener("click", () => {
      page5State.adrs.push({
        name: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: ""
      });
      refreshAdrList();
    });

    // ปุ่มสร้าง timeline
    const tlVisual = visualSec.querySelector("#p5-tl-visual");
    actionUnderAdr
      .querySelector("#p5-build-timeline")
      .addEventListener("click", () => {
        buildTimeline(tlVisual, page5State);
      });

    // ปุ่ม print
    bottom.querySelector("#p5-print").addEventListener("click", () => {
      window.print();
    });

    // ปุ่ม next → ไปหน้า 6
    bottom.querySelector("#p5-next").addEventListener("click", () => {
      const btn = document.querySelector('.tabs button[data-target="page6"]');
      if (btn) btn.click();
    });

    // ปุ่ม clear
    bottom.querySelector("#p5-clear").addEventListener("click", () => {
      page5State.drugs = [
        {
          name: "",
          startDate: "",
          startTime: "",
          endDate: "",
          endTime: ""
        }
      ];
      page5State.adrs = [
        {
          name: "",
          startDate: "",
          startTime: "",
          endDate: "",
          endTime: ""
        }
      ];
      refreshDrugList();
      refreshAdrList();
      tlVisual.innerHTML = "";
    });

    // สร้าง timeline ครั้งแรกแบบว่าง
    buildTimeline(tlVisual, page5State);
  };
})();

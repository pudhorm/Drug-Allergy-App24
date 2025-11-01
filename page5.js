<script>
/* ===== หน้า 5: Timeline ประเมินการแพ้ยา ===== */
(function () {
  const MS_DAY = 24 * 60 * 60 * 1000;
  const CELL = 120; // ความกว้างต่อ 1 วัน (px) — ใช้กับสกรอลล์แนวนอน

  // สร้างที่เก็บหน้า 5 ถ้ายังไม่มี
  if (!window.drugAllergyData) window.drugAllergyData = {};
  if (!window.drugAllergyData.page5) {
    window.drugAllergyData.page5 = { drugs: [], adrs: [] };
  }
  const store = window.drugAllergyData.page5;

  // ---- helper: วันที่ในเขตเวลาเครื่อง (ตัดเวลาให้เป็นเที่ยงคืน) ----
  function toMidnight(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  function parseDate(dateStr, timeStr) {
    if (!dateStr) return null;
    // dateStr = YYYY-MM-DD จาก input type="date"
    const [y, m, d] = dateStr.split("-").map(Number);
    let hh = 0, mm = 0;
    if (timeStr && /^\d{2}:\d{2}$/.test(timeStr)) {
      const t = timeStr.split(":").map(Number);
      hh = t[0]; mm = t[1];
    }
    return new Date(y, (m || 1) - 1, d || 1, hh, mm, 0, 0);
  }
  function fmtDate(d) {
    try {
      return d.toISOString().slice(0, 10);
    } catch { return ""; }
  }
  function diffDaysInclusive(a, b) {
    // รวมวันปลายทางแบบปฏิทิน (เช่น 25→28 = 4 วัน)
    const A = toMidnight(a).getTime();
    const B = toMidnight(b).getTime();
    return Math.max(1, Math.floor((B - A) / MS_DAY) + 1);
  }

  // ---- UI ชุดกรอก “ยา” และ “ADR” ----
  function newDrug() {
    return { name: "", startDate: "", startTime: "", stopDate: "", stopTime: "" };
  }
  function newADR() {
    return { name: "", startDate: "", startTime: "", endDate: "", endTime: "" };
  }

  function renderForms(root) {
    // ยา
    const drugsHtml = store.drugs.map((it, i) => `
      <div class="tl-card tl-drug-card">
        <div class="tl-row2">
          <label>ชื่อยา</label>
          <input type="text" value="${it.name || ""}" data-kind="drug" data-idx="${i}" data-key="name" placeholder="ระบุชื่อยา"/>
        </div>
        <div class="tl-grid2">
          <div>
            <label>เริ่มให้ยา</label>
            <div class="tl-inline">
              <input type="date" value="${it.startDate || ""}" data-kind="drug" data-idx="${i}" data-key="startDate"/>
              <input type="time" value="${it.startTime || ""}" data-kind="drug" data-idx="${i}" data-key="startTime"/>
            </div>
          </div>
          <div>
            <label>หยุดยา</label>
            <div class="tl-inline">
              <input type="date" value="${it.stopDate || ""}" data-kind="drug" data-idx="${i}" data-key="stopDate" placeholder="วว/ดด/ปปปป"/>
              <input type="time" value="${it.stopTime || ""}" data-kind="drug" data-idx="${i}" data-key="stopTime"/>
            </div>
          </div>
        </div>
        <button class="tl-del" data-del="drug" data-idx="${i}">ลบ</button>
      </div>
    `).join("");

    // ADR
    const adrsHtml = store.adrs.map((it, i) => `
      <div class="tl-card tl-adr-card">
        <div class="tl-row2">
          <label>อาการ</label>
          <input type="text" value="${it.name || ""}" data-kind="adr" data-idx="${i}" data-key="name" placeholder="ระบุอาการ เช่น ผื่น, คัน, บวม"/>
        </div>
        <div class="tl-grid2">
          <div>
            <label>วันที่เกิด</label>
            <div class="tl-inline">
              <input type="date" value="${it.startDate || ""}" data-kind="adr" data-idx="${i}" data-key="startDate"/>
              <input type="time" value="${it.startTime || ""}" data-kind="adr" data-idx="${i}" data-key="startTime"/>
            </div>
          </div>
          <div>
            <label>วันที่หาย</label>
            <div class="tl-inline">
              <input type="date" value="${it.endDate || ""}" data-kind="adr" data-idx="${i}" data-key="endDate" placeholder="วว/ดด/ปปปป"/>
              <input type="time" value="${it.endTime || ""}" data-kind="adr" data-idx="${i}" data-key="endTime"/>
            </div>
          </div>
        </div>
        <button class="tl-del" data-del="adr" data-idx="${i}">ลบ</button>
      </div>
    `).join("");

    root.querySelector("#tl-drug-list").innerHTML = drugsHtml || `<div class="tl-note">ยังไม่มีรายการยา</div>`;
    root.querySelector("#tl-adr-list").innerHTML = adrsHtml || `<div class="tl-note">ยังไม่มีรายการ ADR</div>`;

    // bind เปลี่ยนค่า
    root.querySelectorAll('input[data-kind]').forEach(inp => {
      inp.addEventListener('input', () => {
        const k = inp.dataset.kind, idx = +inp.dataset.idx, key = inp.dataset.key;
        if (k === 'drug') store.drugs[idx][key] = inp.value;
        else store.adrs[idx][key] = inp.value;
      });
    });

    // ลบรายการ
    root.querySelectorAll('button[data-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        const k = btn.dataset.del, idx = +btn.dataset.idx;
        if (k === 'drug') store.drugs.splice(idx, 1);
        else store.adrs.splice(idx, 1);
        renderPage5(); // re-render ฟอร์ม
      });
    });
  }

  function buildAxis(drugs, adrs) {
    const today = toMidnight(new Date());
    let minStart = today;
    let maxEnd = today;

    const all = [];
    drugs.forEach(d => {
      const s = parseDate(d.startDate, d.startTime);
      if (s) all.push(s);
      const e = parseDate(d.stopDate, d.stopTime); // อาจว่าง
      if (e) all.push(e);
    });
    adrs.forEach(a => {
      const s = parseDate(a.startDate, a.startTime);
      if (s) all.push(s);
      const e = parseDate(a.endDate, a.endTime);
      if (e) all.push(e);
    });

    if (all.length) {
      minStart = toMidnight(new Date(Math.min(...all.map(x => toMidnight(x).getTime()))));
      maxEnd   = toMidnight(new Date(Math.max(...all.map(x => toMidnight(x).getTime()))));
    }

    // *** บังคับให้ maxEnd ไม่น้อยกว่าวันนี้เสมอ ***
    if (maxEnd.getTime() < today.getTime()) {
      maxEnd = today;
    }

    return { axisStart: minStart, axisEnd: maxEnd, today };
  }

  function renderTicks(ticksWrap, axisStart, axisEnd) {
    const days = diffDaysInclusive(axisStart, axisEnd);
    ticksWrap.style.width = (days * CELL) + "px";
    ticksWrap.innerHTML = "";
    for (let i = 0; i < days; i++) {
      const d = new Date(axisStart.getTime() + i * MS_DAY);
      const lab = d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
      const div = document.createElement("div");
      div.className = "tl-tick";
      div.style.left = (i * CELL) + "px";
      div.textContent = lab;
      ticksWrap.appendChild(div);
    }
  }

  function renderBars(gridWrap, axisStart, axisEnd, drugs, adrs) {
    const totalDays = diffDaysInclusive(axisStart, axisEnd);
    gridWrap.style.width = (totalDays * CELL) + "px";
    gridWrap.innerHTML = "";

    function makeRow(labelText) {
      const row = document.createElement("div");
      row.className = "tl-row";
      const label = document.createElement("div");
      label.className = "tl-ylabel";
      label.textContent = labelText;
      const track = document.createElement("div");
      track.className = "tl-track";
      row.appendChild(label);
      row.appendChild(track);
      gridWrap.appendChild(row);
      return track;
    }
    function makeBar(track, start, end, label, cls) {
      const leftDays = Math.max(0, Math.floor((toMidnight(start) - axisStart) / MS_DAY));
      const spanDays = diffDaysInclusive(start, end);
      const bar = document.createElement("div");
      bar.className = `tl-bar ${cls}`;
      bar.style.left = (leftDays * CELL + 6) + "px";
      bar.style.width = Math.max(28, spanDays * CELL - 12) + "px";
      bar.textContent = `${label} (${fmtDate(start)})`; // ข้อความสั้น: ชื่อ + วันที่เริ่ม
      track.appendChild(bar);
    }

    // แถว: ยาทุกตัว
    drugs.forEach(d => {
      const track = makeRow(`ยา: ${d.name || ""}`);
      const s = parseDate(d.startDate, d.startTime);
      if (!s) return;
      const eUser = parseDate(d.stopDate, d.stopTime);
      // ถ้าไม่มีวันหยุด → ให้ยาวถึง "วันนี้"
      const e = eUser ? eUser : axisEnd;
      makeBar(track, s, e, (d.name || "ยา"), "drug");
    });

    // แถว: ADR ทุกตัว
    adrs.forEach(a => {
      const track = makeRow(`ADR: ${a.name || ""}`);
      const s = parseDate(a.startDate, a.startTime);
      if (!s) return;
      const eUser = parseDate(a.endDate, a.endTime);
      const e = eUser ? eUser : axisEnd; // ไม่มีวันหาย → ยาวถึงวันนี้
      makeBar(track, s, e, (a.name || "ADR"), "adr");
    });
  }

  function renderTimeline(root) {
    const drugs = store.drugs.slice();
    const adrs  = store.adrs.slice();

    const { axisStart, axisEnd } = buildAxis(drugs, adrs);

    // ticks & bars
    const ticksWrap = root.querySelector(".tl-ticks");
    const gridWrap  = root.querySelector(".tl-canvas");

    renderTicks(ticksWrap, axisStart, axisEnd);
    renderBars(gridWrap, axisStart, axisEnd, drugs, adrs);

    // เปิดแสดงผล + เลื่อนให้เห็นจุด “วันนี้” ด้านขวาสุด
    const sc = root.querySelector(".tl-scroll");
    sc.classList.remove("hidden");
    sc.scrollLeft = sc.scrollWidth; // เลื่อนไปขวาสุด (วันนี้อยู่ช่วงปลาย)
  }

  function bindActions(root) {
    root.querySelector("#btn-add-drug").addEventListener("click", () => {
      store.drugs.push(newDrug());
      renderPage5();
    });
    root.querySelector("#btn-add-adr").addEventListener("click", () => {
      store.adrs.push(newADR());
      renderPage5();
    });

    root.querySelector("#btn-build-tl").addEventListener("click", () => {
      renderTimeline(root);
    });

    // พิมพ์ PDF เฉพาะหน้านี้ (ใช้ print ธรรมดา แต่เราตกแต่งด้วย @media print ใน css)
    root.querySelector("#btn-print").addEventListener("click", () => {
      window.print();
    });

    root.querySelector("#btn-save-next").addEventListener("click", () => {
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();
      // ไปหน้า 6
      const tab = document.querySelector('.tabs button[data-target="page6"]');
      if (tab) tab.click();
    });

    root.querySelector("#btn-clear-this").addEventListener("click", () => {
      store.drugs = [];
      store.adrs = [];
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();
      renderPage5();
    });
  }

  function template() {
    return `
      <div class="tl-wrapper">
        <!-- กลุ่มยา -->
        <section class="tl-section tl-bg-soft">
          <div class="tl-head">
            <h2>ยา</h2>
            <button id="btn-add-drug" class="btn-green-solid">+ เพิ่มยาตัวใหม่</button>
          </div>
          <div id="tl-drug-list"></div>
        </section>

        <!-- กลุ่ม ADR -->
        <section class="tl-section tl-bg-soft-red">
          <div class="tl-head">
            <h2>ADR (Adverse Drug Reaction)</h2>
            <button id="btn-add-adr" class="btn-red-solid">+ เพิ่ม ADR</button>
          </div>
          <div id="tl-adr-list"></div>

          <!-- ปุ่มสร้าง timeline ตามคำสั่ง: อยู่ใต้ ADR -->
          <div class="tl-actions-under-adr">
            <button id="btn-build-tl" class="btn-blue-solid">▶ สร้าง Timeline</button>
          </div>
        </section>

        <!-- แสดงผล timeline -->
        <section class="tl-section">
          <h3>Visual Timeline</h3>
          <div class="tl-scroll hidden">
            <div class="tl-axis">
              <div class="tl-ticks"></div>
            </div>
            <div class="tl-canvas"></div>
          </div>
        </section>

        <!-- ปุ่มท้ายหน้า (อยู่กับที่ของหน้า ไม่ลอย) -->
        <div class="tl-bottom-actions">
          <button id="btn-print" class="btn-green-solid">🖨️ Print / PDF</button>
          <button id="btn-save-next" class="btn-purple-solid">บันทึกข้อมูลและไปหน้า 6</button>
          <button id="btn-clear-this" class="btn-red-solid">🗑️ ล้างข้อมูลหน้านี้</button>
        </div>
      </div>
    `;
  }

  // เรนเดอร์หลัก
  function renderPage5() {
    const root = document.getElementById("page5");
    if (!root) return;
    root.innerHTML = template();
    renderForms(root);
    bindActions(root);
  }

  // export
  window.renderPage5 = renderPage5;
})();
</script>

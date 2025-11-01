<!-- page5.js -->
<script>
(function () {
  // ความกว้างต่อ 1 วันบน timeline
  const DAY_PX = 120;

  // ฟังก์ชัน normalize วันที่ให้เที่ยงคืนแบบ UTC กัน off-by-one
  function toUTCDate(y, m, d) {
    return new Date(Date.UTC(y, m - 1, d));
  }

  // รับค่าจาก input (yyyy-mm-dd หรือ dd/mm/yyyy) → Date(UTC)
  function parseInputDate(str) {
    if (!str) return null;
    if (str.includes("-")) {
      // yyyy-mm-dd
      const [y, m, d] = str.split("-").map(Number);
      return toUTCDate(y, m, d);
    }
    if (str.includes("/")) {
      // dd/mm/yyyy
      const [d, m, y] = str.split("/").map(Number);
      return toUTCDate(y, m, d);
    }
    return null;
  }

  // แปลง Date → "25 ต.ค."
  const thMonth = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  function formatShortTH(d) {
    return d.getUTCDate() + " " + thMonth[d.getUTCMonth()];
  }

  // diff แบบไม่เพี้ยนวัน
  function diffDaysUTC(d1, d2) {
    const ms = d2.getTime() - d1.getTime();
    return Math.round(ms / 86400000); // 1000*60*60*24
  }

  // ทำเวลาไทยให้โชว์ด้านบน timeline
  function startClock(dom) {
    function tick() {
      const now = new Date();
      // บังคับให้เป็นเวลาไทย
      const opts = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Bangkok"
      };
      dom.textContent = "📅 " + now.toLocaleString("th-TH", opts);
    }
    tick();
    return setInterval(tick, 1000);
  }

  // เก็บ state แค่หน้า 5 — โหลดใหม่ให้เริ่มว่าง
  let drugs = [];
  let adrs = [];

  // ---------- เรนเดอร์หลัก ----------
  window.renderPage5 = function () {
    const host = document.getElementById("page5");
    if (!host) return;

    // รีเซ็ตทุกครั้ง (ผู้ใช้บอกว่าหน้า 5 ค้างข้อมูลตอนรีเฟรช)
    drugs = [{
      name: "",
      start: "",
      startTime: "",
      stop: "",
      stopTime: ""
    }];
    adrs = [{
      name: "",
      onset: "",
      onsetTime: "",
      recover: "",
      recoverTime: ""
    }];

    host.innerHTML = `
      <div class="p5-shell">
        <div class="p5-head-row">
          <div class="p5-title-left">
            <span class="p5-icon">📅</span>
            <div>
              <h2 class="p5-title">หน้า 5 Timeline ประเมินการแพ้ยา</h2>
              <p class="p5-subtitle">เชื่อมข้อมูล “ยา” กับ “ADR” แล้ววาดเส้นเวลาให้อัตโนมัติ</p>
            </div>
          </div>
          <div class="p5-right-actions">
            <button id="p5-add-drug" class="p5-btn-green">+ เพิ่มยาตัวใหม่</button>
            <button id="p5-del-drug" class="p5-btn-ghost">ลบยาตัวล่าสุด</button>
          </div>
        </div>

        <div id="p5-drug-list"></div>

        <div class="p5-head-row p5-adr-gap">
          <div class="p5-title-left">
            <span class="p5-icon pink">💖</span>
            <h2 class="p5-title-sm">ADR (Adverse Drug Reaction)</h2>
          </div>
          <div class="p5-right-actions">
            <button id="p5-add-adr" class="p5-btn-red">+ เพิ่ม ADR</button>
            <button id="p5-del-adr" class="p5-btn-ghost">ลบตัวล่าสุด</button>
          </div>
        </div>

        <div id="p5-adr-list"></div>

        <div class="p5-datetime-row">
          <span id="p5-now"></span>
        </div>

        <div class="p5-timeline-block">
          <h3 class="p5-section-title">Visual Timeline</h3>
          <div class="p5-timeline-scroll">
            <div id="p5-axis" class="p5-axis"></div>
            <div id="p5-lines" class="p5-lines">
              <div class="p5-row-label">ยา:</div>
              <div class="p5-row-track" id="p5-drug-track"></div>

              <div class="p5-row-label red">ADR:</div>
              <div class="p5-row-track" id="p5-adr-track"></div>
            </div>
          </div>
          <div class="p5-bottom-btns">
            <button class="p5-btn-purple" onclick="window.print()">🖨 Print / PDF</button>
            <button class="p5-btn-blue" onclick="alert('จำลอง: บันทึกข้อมูลและไปหน้า 6')">บันทึกข้อมูลและไปหน้า 6</button>
            <button class="p5-btn-danger" id="p5-clear">🗑 ล้างข้อมูลหน้านี้</button>
          </div>
        </div>
      </div>
    `;

    // เริ่มนาฬิกาไทย
    const clockEl = host.querySelector("#p5-now");
    startClock(clockEl);

    // ผูกปุ่ม
    host.querySelector("#p5-add-drug").addEventListener("click", () => {
      drugs.push({ name: "", start: "", startTime: "", stop: "", stopTime: "" });
      renderDrugForms();
      renderTimeline();
    });
    host.querySelector("#p5-del-drug").addEventListener("click", () => {
      if (drugs.length > 1) {
        drugs.pop();
        renderDrugForms();
        renderTimeline();
      }
    });
    host.querySelector("#p5-add-adr").addEventListener("click", () => {
      adrs.push({ name: "", onset: "", onsetTime: "", recover: "", recoverTime: "" });
      renderAdrForms();
      renderTimeline();
    });
    host.querySelector("#p5-del-adr").addEventListener("click", () => {
      if (adrs.length > 1) {
        adrs.pop();
        renderAdrForms();
        renderTimeline();
      }
    });
    host.querySelector("#p5-clear").addEventListener("click", () => {
      drugs = [{ name: "", start: "", startTime: "", stop: "", stopTime: "" }];
      adrs = [{ name: "", onset: "", onsetTime: "", recover: "", recoverTime: "" }];
      renderDrugForms();
      renderAdrForms();
      renderTimeline();
    });

    // เรนเดอร์ฟอร์มครั้งแรก
    renderDrugForms();
    renderAdrForms();
    // เรนเดอร์ timeline ครั้งแรก
    renderTimeline();

    // ======== ฟังก์ชันย่อยใน renderPage5 ========
    function renderDrugForms() {
      const box = host.querySelector("#p5-drug-list");
      box.innerHTML = "";
      drugs.forEach((d, idx) => {
        const wrapper = document.createElement("div");
        wrapper.className = "p5-card p5-drug-card";
        wrapper.innerHTML = `
          <div class="p5-card-head">
            <div class="p5-dot blue"></div>
            <div class="p5-card-title">ยาตัวที่ ${idx + 1}</div>
          </div>
          <label class="p5-field">
            <span>ชื่อยา</span>
            <input type="text" value="${d.name || ""}" data-idx="${idx}" data-field="name" class="p5-inp" placeholder="ระบุชื่อยา เช่น Amoxicillin" />
          </label>
          <div class="p5-two-cols">
            <label class="p5-field">
              <span>เริ่มให้ยา</span>
              <input type="date" value="${d.start || ""}" data-idx="${idx}" data-field="start" class="p5-inp" />
              <input type="time" value="${d.startTime || ""}" data-idx="${idx}" data-field="startTime" class="p5-inp p5-time" />
            </label>
            <label class="p5-field">
              <span>หยุดยา</span>
              <input type="date" value="${d.stop || ""}" data-idx="${idx}" data-field="stop" class="p5-inp" />
              <input type="time" value="${d.stopTime || ""}" data-idx="${idx}" data-field="stopTime" class="p5-inp p5-time" />
            </label>
          </div>
        `;
        box.appendChild(wrapper);
      });

      // bind
      box.querySelectorAll("input").forEach((inp) => {
        inp.addEventListener("input", (e) => {
          const i = Number(e.target.dataset.idx);
          const field = e.target.dataset.field;
          drugs[i][field] = e.target.value;
          renderTimeline();
        });
      });
    }

    function renderAdrForms() {
      const box = host.querySelector("#p5-adr-list");
      box.innerHTML = "";
      adrs.forEach((a, idx) => {
        const wrap = document.createElement("div");
        wrap.className = "p5-card p5-adr-card";
        wrap.innerHTML = `
          <div class="p5-card-head">
            <div class="p5-dot red"></div>
            <div class="p5-card-title">ADR ${idx + 1}</div>
          </div>
          <label class="p5-field">
            <span>อาการ</span>
            <input type="text" value="${a.name || ""}" data-idx="${idx}" data-field="name" class="p5-inp" placeholder="ผื่น, คัน, บวม, SJS/TEN ..." />
          </label>
          <div class="p5-two-cols">
            <label class="p5-field">
              <span>วันที่เกิด</span>
              <input type="date" value="${a.onset || ""}" data-idx="${idx}" data-field="onset" class="p5-inp" />
              <input type="time" value="${a.onsetTime || ""}" data-idx="${idx}" data-field="onsetTime" class="p5-inp p5-time" />
            </label>
            <label class="p5-field">
              <span>วันที่หาย</span>
              <input type="date" value="${a.recover || ""}" data-idx="${idx}" data-field="recover" class="p5-inp" />
              <input type="time" value="${a.recoverTime || ""}" data-idx="${idx}" data-field="recoverTime" class="p5-inp p5-time" />
            </label>
          </div>
        `;
        box.appendChild(wrap);
      });

      // bind
      box.querySelectorAll("input").forEach((inp) => {
        inp.addEventListener("input", (e) => {
          const i = Number(e.target.dataset.idx);
          const field = e.target.dataset.field;
          adrs[i][field] = e.target.value;
          renderTimeline();
        });
      });
    }

    function renderTimeline() {
      const axis = host.querySelector("#p5-axis");
      const drugTrack = host.querySelector("#p5-drug-track");
      const adrTrack = host.querySelector("#p5-adr-track");

      // === รวมทุกช่วงเวลา ===
      const entries = [];

      drugs.forEach((d, i) => {
        const s = parseInputDate(d.start);
        if (!s) return;
        const e = d.stop ? parseInputDate(d.stop) : null;
        entries.push({
          type: "drug",
          label: d.name || ("ยา " + (i + 1)),
          start: s,
          end: e
        });
      });

      adrs.forEach((a, i) => {
        const s = parseInputDate(a.onset);
        if (!s) return;
        const e = a.recover ? parseInputDate(a.recover) : null;
        entries.push({
          type: "adr",
          label: a.name || ("ADR " + (i + 1)),
          start: s,
          end: e
        });
      });

      const today = new Date();
      const todayUTC = toUTCDate(today.getFullYear(), today.getMonth() + 1, today.getDate());

      if (entries.length === 0) {
        axis.innerHTML = "";
        drugTrack.innerHTML = "";
        adrTrack.innerHTML = "";
        return;
      }

      // หา earliest
      let earliest = entries[0].start;
      entries.forEach((en) => {
        if (en.start.getTime() < earliest.getTime()) {
          earliest = en.start;
        }
      });

      // หา latest = max(วันนี้, end ต่างๆ)
      let latest = todayUTC;
      entries.forEach((en) => {
        const enEnd = en.end ? en.end : todayUTC;
        if (enEnd.getTime() > latest.getTime()) {
          latest = enEnd;
        }
      });

      // จำนวนวันรวม
      const totalDays = diffDaysUTC(earliest, latest) + 1; // +1 เพื่อให้วันสุดท้ายอยู่ในช่วงพอดี
      const totalWidth = totalDays * DAY_PX;

      // วาดแกนวัน
      axis.innerHTML = `<div class="p5-axis-line" style="width:${totalWidth}px"></div>`;
      for (let i = 0; i < totalDays; i++) {
        const d = new Date(earliest.getTime() + i * 86400000);
        const tick = document.createElement("div");
        tick.className = "p5-tick";
        tick.style.left = (i * DAY_PX) + "px";
        tick.textContent = formatShortTH(d);
        axis.appendChild(tick);
      }

      // เคลียร์ track
      drugTrack.innerHTML = "";
      adrTrack.innerHTML = "";
      drugTrack.style.width = totalWidth + "px";
      adrTrack.style.width = totalWidth + "px";

      // วาดแถบ
      entries.forEach((en, idx) => {
        const startOffset = diffDaysUTC(earliest, en.start);      // วันเริ่ม
        const rawEnd = en.end ? en.end : todayUTC;
        const endOffset = diffDaysUTC(earliest, rawEnd);          // วันจบ
        // ปรับให้ไม่บวก/ลบเกิน 1 วัน
        let left = startOffset * DAY_PX;
        let width = (endOffset - startOffset + 1) * DAY_PX;
        if (width < 80) width = 80;

        const bar = document.createElement("div");
        bar.className = "p5-bar " + (en.type === "drug" ? "drug" : "adr");
        bar.style.left = (left + 12) + "px";  // ขยับนิดให้ไม่ชนแกน
        bar.style.width = (width - 20) + "px";

        bar.textContent = `${en.label} (${en.start.toISOString().slice(0,10)})${en.end ? "" : " (Ongoing)"}`;

        if (en.type === "drug") {
          drugTrack.appendChild(bar);
        } else {
          adrTrack.appendChild(bar);
        }
      });
    }
    // ===== end renderPage5 =====
  };
})();
</script>

// page5.js
(function () {
  // สร้างที่เก็บรวมถ้ายังไม่มี
  if (!window.drugAllergyData) window.drugAllergyData = {};

  // ทุกครั้งที่เข้าหน้า 5 ให้รีเซตข้อมูลหน้า 5 ใหม่เลย
  // (ผู้ใช้บอกว่ารีเฟรชแล้วข้อมูลค้าง ไม่เอา)
  window.drugAllergyData.page5 = {
    drugs: [
      {
        id: "drug_1",
        name: "",
        startDate: "",
        startTime: "",
        stopDate: "",
        stopTime: ""
      }
    ],
    adrs: [
      {
        id: "adr_1",
        name: "",
        startDate: "",
        startTime: "",
        stopDate: "",
        stopTime: ""
      }
    ]
  };

  const DAY_WIDTH = 110; // ความกว้างต่อ 1 วันบนแกน X
  const TOP_OFFSET = 70; // ระยะจากหัวตารางลงมาแถวแรก
  const ROW_HEIGHT = 60; // ระยะห่างแต่ละแถว
  const LABEL_WIDTH = 130; // ช่องซ้ายที่เขียนว่า "ยา:" "ADR:"
  let timelineShown = true; // ให้แสดงครั้งแรก

  // ฟังก์ชันช่วย: แปลง 21/11/2025 หรือ 2025-11-21 → Date
  function parseDateStr(str) {
    if (!str) return null;
    str = str.trim();
    // แบบ dd/mm/yyyy
    if (str.includes("/")) {
      const [d, m, y] = str.split("/");
      if (!d || !m || !y) return null;
      return new Date(Number(y), Number(m) - 1, Number(d));
    }
    // แบบ yyyy-mm-dd
    if (str.includes("-")) {
      const [y, m, d] = str.split("-");
      if (!d || !m || !y) return null;
      return new Date(Number(y), Number(m) - 1, Number(d));
    }
    return null;
  }

  // เอาวันนี้ตามเครื่อง (ถือว่าเป็นปฏิทินไทยตอนนี้)
  function todayDateOnly() {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }

  // ฟังก์ชันหลักของหน้า 5
  function renderPage5() {
    const root = document.getElementById("page5");
    if (!root) return;

    const data = window.drugAllergyData.page5;

    root.innerHTML = `
      <div class="p5-wrapper" style="background:linear-gradient(135deg,#fff1f2 0%,#fef3c7 32%,#f3e8ff 68%,#ffffff 100%);border:1px solid rgba(255,255,255,.35);border-radius:1.4rem;padding:1.1rem 1.25rem 1.5rem;box-shadow:0 14px 32px rgba(244, 114, 182, .12);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
          <h2 style="display:flex;gap:.5rem;align-items:center;font-size:1.35rem;color:#312e81;margin:0;">
            <span>📅</span>
            <span>หน้า 5 Timeline ประเมินการแพ้ยา</span>
          </h2>
          <div style="display:flex;gap:.5rem;">
            <button id="p5_add_drug" style="background:#22c55e;color:#fff;border:none;border-radius:.9rem;padding:.55rem 1.1rem;font-weight:600;cursor:pointer;box-shadow:0 12px 20px rgba(34,197,94,.2);">+ เพิ่มยาตัวใหม่</button>
            <button id="p5_add_adr" style="background:#ef4444;color:#fff;border:none;border-radius:.9rem;padding:.55rem 1.1rem;font-weight:600;cursor:pointer;box-shadow:0 12px 20px rgba(239,68,68,.2);">+ เพิ่ม ADR</button>
          </div>
        </div>

        <!-- ส่วนกรอกยา -->
        <section id="p5_drug_section" style="background:rgba(255,255,255,.65);border:1px solid rgba(148,163,184,.12);border-radius:1rem;padding:1rem .85rem 1rem;margin-bottom:1.05rem;">
          <h3 style="margin:0 0 .8rem;font-size:1rem;font-weight:700;color:#0f172a;">ยาที่ให้</h3>
          <div id="p5_drug_list"></div>
        </section>

        <!-- ส่วนกรอก ADR -->
        <section id="p5_adr_section" style="background:rgba(255,255,255,.6);border:1px solid rgba(248,113,113,.12);border-radius:1rem;padding:1rem .85rem 1rem;margin-bottom:1rem;">
          <h3 style="margin:0 0 .8rem;font-size:1rem;font-weight:700;color:#b91c1c;display:flex;align-items:center;gap:.4rem;">
            <span style="width:12px;height:12px;border-radius:999px;background:#b91c1c;display:inline-block;"></span>
            <span>ADR (Adverse Drug Reaction)</span>
          </h3>
          <div id="p5_adr_list"></div>
        </section>

        <!-- ปุ่มสร้าง timeline (ย้ายมาอยู่ใต้ ADR) -->
        <div style="margin-bottom:1rem;">
          <button id="p5_build_timeline" style="background:#3b82f6;color:#fff;border:none;border-radius:.9rem;padding:.6rem 1.35rem;font-weight:600;cursor:pointer;box-shadow:0 12px 20px rgba(59,130,246,.25);display:inline-flex;gap:.35rem;align-items:center;">
            ▶ สร้าง Timeline
          </button>
        </div>

        <!-- พื้นที่ Timeline -->
        <div id="p5_timeline_wrap" style="background:rgba(255,255,255,.4);border:1px solid rgba(148,163,184,.15);border-radius:1rem;padding:.9rem .6rem .6rem;">
          <h3 style="margin:0 0 .6rem;font-size:1rem;font-weight:700;color:#111827;">Visual Timeline</h3>
          <div id="p5_timeline_scroll" style="overflow-x:auto;overflow-y:hidden;width:100%;">
            <div id="p5_timeline_view" style="min-height:220px;position:relative;"></div>
          </div>
        </div>

        <!-- ปุ่มล่าง -->
        <div style="margin-top:1.2rem;display:flex;gap:.7rem;flex-wrap:wrap;">
          <button id="p5_go6" style="background:linear-gradient(120deg,#2563eb 0%,#7c3aed 100%);color:#fff;border:none;border-radius:.9rem;padding:.7rem 1.4rem;font-weight:600;flex:1 1 180px;box-shadow:0 12px 20px rgba(79,70,229,.25);">บันทึกข้อมูลและไปหน้า 6</button>
          <button id="p5_clear" style="background:#ef4444;color:#fff;border:none;border-radius:.9rem;padding:.7rem 1.2rem;font-weight:600;flex:1 1 180px;box-shadow:0 12px 20px rgba(239,68,68,.25);">🗑️ ล้างข้อมูลหน้านี้</button>
          <button id="p5_print" style="background:#e5e7eb;color:#111827;border:none;border-radius:.9rem;padding:.7rem 1.15rem;font-weight:600;flex:0 0 auto;">🖨️ Print</button>
        </div>
      </div>
    `;

    renderDrugForms();
    renderAdrForms();
    buildTimeline(); // สร้างให้เห็นเลย

    // ====== event ส่วนบน ======
    document.getElementById("p5_add_drug").addEventListener("click", () => {
      const newId = "drug_" + (data.drugs.length + 1);
      data.drugs.push({
        id: newId,
        name: "",
        startDate: "",
        startTime: "",
        stopDate: "",
        stopTime: ""
      });
      renderDrugForms();
    });

    document.getElementById("p5_add_adr").addEventListener("click", () => {
      const newId = "adr_" + (data.adrs.length + 1);
      data.adrs.push({
        id: newId,
        name: "",
        startDate: "",
        startTime: "",
        stopDate: "",
        stopTime: ""
      });
      renderAdrForms();
    });

    document.getElementById("p5_build_timeline").addEventListener("click", () => {
      timelineShown = !timelineShown;
      const wrap = document.getElementById("p5_timeline_wrap");
      if (timelineShown) {
        buildTimeline();
        wrap.style.display = "block";
        document.getElementById("p5_build_timeline").textContent = "ซ่อน Timeline";
      } else {
        wrap.style.display = "none";
        document.getElementById("p5_build_timeline").textContent = "▶ สร้าง Timeline";
      }
    });

    document.getElementById("p5_clear").addEventListener("click", () => {
      window.drugAllergyData.page5 = {
        drugs: [
          {
            id: "drug_1",
            name: "",
            startDate: "",
            startTime: "",
            stopDate: "",
            stopTime: ""
          }
        ],
        adrs: [
          {
            id: "adr_1",
            name: "",
            startDate: "",
            startTime: "",
            stopDate: "",
            stopTime: ""
          }
        ]
      };
      renderPage5(); // เรนเดอร์ใหม่เลย
    });

    document.getElementById("p5_go6").addEventListener("click", () => {
      // กดแล้วไปหน้า 6
      const btn6 = document.querySelector('.tabs button[data-target="page6"]');
      if (btn6) btn6.click();
    });

    document.getElementById("p5_print").addEventListener("click", () => {
      const win = window.open("", "_blank");
      const html = document.getElementById("p5_timeline_wrap").innerHTML;
      win.document.write(`
        <html>
          <head>
            <title>Timeline — Drug Allergy</title>
            <style>
              body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; padding: 20px; }
              .bar { color: #000; font-weight: 600; }
            </style>
          </head>
          <body>
            <h2>Timeline การให้ยา / ADR</h2>
            ${html}
          </body>
        </html>
      `);
      win.document.close();
      win.focus();
      win.print();
    });

    // ====== ฟังก์ชันย่อยที่ใช้ด้านบน ======

    function renderDrugForms() {
      const list = document.getElementById("p5_drug_list");
      list.innerHTML = "";
      data.drugs.forEach((d, idx) => {
        const box = document.createElement("div");
        box.style.marginBottom = ".7rem";
        box.style.background = "rgba(209, 250, 229, .25)";
        box.style.border = "1px solid rgba(22,163,74,.1)";
        box.style.borderRadius = ".75rem";
        box.style.padding = ".55rem .6rem .6rem";
        box.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;margin-bottom:.4rem;">
            <label style="font-weight:600;color:#065f46;">ยา ${idx + 1}</label>
            ${data.drugs.length > 1 ? `<button data-del="${d.id}" style="background:none;border:none;color:#ef4444;cursor:pointer;font-weight:600;">ลบ</button>` : ""}
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.5rem;">
            <div>
              <label style="font-size:.75rem;color:#065f46;">ชื่อยา</label>
              <input type="text" data-id="${d.id}" data-field="name" value="${d.name}" placeholder="ระบุชื่อยา" style="width:100%;border:1px solid rgba(22,163,74,.25);border-radius:.6rem;padding:.35rem .5rem;">
            </div>
            <div>
              <label style="font-size:.75rem;color:#065f46;">วันที่เริ่มให้ยา</label>
              <input type="date" data-id="${d.id}" data-field="startDate" value="${d.startDate}" style="width:100%;border:1px solid rgba(22,163,74,.25);border-radius:.6rem;padding:.25rem .35rem;">
            </div>
            <div>
              <label style="font-size:.75rem;color:#065f46;">เวลาที่เริ่ม</label>
              <input type="time" data-id="${d.id}" data-field="startTime" value="${d.startTime}" style="width:100%;border:1px solid rgba(22,163,74,.25);border-radius:.6rem;padding:.25rem .35rem;">
            </div>
            <div>
              <label style="font-size:.75rem;color:#065f46;">วันที่หยุดยา</label>
              <input type="date" data-id="${d.id}" data-field="stopDate" value="${d.stopDate}" style="width:100%;border:1px solid rgba(22,163,74,.25);border-radius:.6rem;padding:.25rem .35rem;">
            </div>
            <div>
              <label style="font-size:.75rem;color:#065f46;">เวลาที่หยุด</label>
              <input type="time" data-id="${d.id}" data-field="stopTime" value="${d.stopTime}" style="width:100%;border:1px solid rgba(22,163,74,.25);border-radius:.6rem;padding:.25rem .35rem;">
            </div>
          </div>
        `;
        list.appendChild(box);
      });

      // ผูก event
      list.querySelectorAll("input").forEach((inp) => {
        inp.addEventListener("input", (e) => {
          const id = e.target.getAttribute("data-id");
          const field = e.target.getAttribute("data-field");
          const obj = data.drugs.find((x) => x.id === id);
          if (!obj) return;
          obj[field] = e.target.value;
        });
      });
      list.querySelectorAll("button[data-del]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-del");
          data.drugs = data.drugs.filter((x) => x.id !== id);
          renderDrugForms();
        });
      });
    }

    function renderAdrForms() {
      const list = document.getElementById("p5_adr_list");
      list.innerHTML = "";
      data.adrs.forEach((d, idx) => {
        const box = document.createElement("div");
        box.style.marginBottom = ".7rem";
        box.style.background = "rgba(254, 226, 226, .35)";
        box.style.border = "1px solid rgba(252, 165, 165, .3)";
        box.style.borderRadius = ".75rem";
        box.style.padding = ".55rem .6rem .6rem";
        box.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;margin-bottom:.4rem;">
            <label style="font-weight:600;color:#b91c1c;">ADR ${idx + 1}</label>
            ${data.adrs.length > 1 ? `<button data-del="${d.id}" style="background:none;border:none;color:#ef4444;cursor:pointer;font-weight:600;">ลบ</button>` : ""}
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.5rem;">
            <div style="grid-column:1/-1;">
              <label style="font-size:.75rem;color:#b91c1c;">อาการ</label>
              <input type="text" data-adr-id="${d.id}" data-field="name" value="${d.name}" placeholder="ระบุอาการ เช่น ผื่นขึ้น, คัน, บวม" style="width:100%;border:1px solid rgba(248,113,113,.35);border-radius:.6rem;padding:.35rem .5rem;">
            </div>
            <div>
              <label style="font-size:.75rem;color:#b91c1c;">วันที่เกิด</label>
              <input type="date" data-adr-id="${d.id}" data-field="startDate" value="${d.startDate}" style="width:100%;border:1px solid rgba(248,113,113,.35);border-radius:.6rem;padding:.25rem .35rem;">
            </div>
            <div>
              <label style="font-size:.75rem;color:#b91c1c;">เวลา</label>
              <input type="time" data-adr-id="${d.id}" data-field="startTime" value="${d.startTime}" style="width:100%;border:1px solid rgba(248,113,113,.35);border-radius:.6rem;padding:.25rem .35rem;">
            </div>
            <div>
              <label style="font-size:.75rem;color:#b91c1c;">วันที่หาย</label>
              <input type="date" data-adr-id="${d.id}" data-field="stopDate" value="${d.stopDate}" style="width:100%;border:1px solid rgba(248,113,113,.35);border-radius:.6rem;padding:.25rem .35rem;">
            </div>
            <div>
              <label style="font-size:.75rem;color:#b91c1c;">เวลาที่หาย</label>
              <input type="time" data-adr-id="${d.id}" data-field="stopTime" value="${d.stopTime}" style="width:100%;border:1px solid rgba(248,113,113,.35);border-radius:.6rem;padding:.25rem .35rem;">
            </div>
          </div>
        `;
        list.appendChild(box);
      });

      // ผูก event
      list.querySelectorAll("input").forEach((inp) => {
        inp.addEventListener("input", (e) => {
          const id = e.target.getAttribute("data-adr-id");
          const field = e.target.getAttribute("data-field");
          const obj = data.adrs.find((x) => x.id === id);
          if (!obj) return;
          obj[field] = e.target.value;
        });
      });
      list.querySelectorAll("button[data-del]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-del");
          data.adrs = data.adrs.filter((x) => x.id !== id);
          renderAdrForms();
        });
      });
    }

    // ฟังก์ชันสร้าง timeline จริงๆ
    function buildTimeline() {
      const view = document.getElementById("p5_timeline_view");
      view.innerHTML = "";

      const items = []; // รวมยากับ ADR

      // ยา → สีฟ้า
      window.drugAllergyData.page5.drugs.forEach((d) => {
        if (!d.startDate) return;
        items.push({
          type: "drug",
          label: d.name ? d.name : "ยา",
          start: parseDateStr(d.startDate),
          end: d.stopDate ? parseDateStr(d.stopDate) : null
        });
      });

      // ADR → สีแดง
      window.drugAllergyData.page5.adrs.forEach((d) => {
        if (!d.startDate) return;
        items.push({
          type: "adr",
          label: d.name ? d.name : "ADR",
          start: parseDateStr(d.startDate),
          end: d.stopDate ? parseDateStr(d.stopDate) : null
        });
      });

      if (!items.length) {
        view.innerHTML = `<p style="margin:.3rem 0 0;color:#6b7280;">ยังไม่มีข้อมูลยา/ADR ให้สร้างก่อนนะ</p>`;
        return;
      }

      // หาวันเริ่มต้นทั้งหมด
      let minDate = null;
      let maxDate = todayDateOnly(); // อย่างน้อยต้องถึงวันนี้
      items.forEach((it) => {
        if (!minDate || it.start < minDate) minDate = new Date(it.start);
        // end ถ้าไม่มี -> วันนี้
        const realEnd = it.end ? new Date(it.end) : todayDateOnly();
        if (realEnd > maxDate) maxDate = new Date(realEnd);
      });

      // สร้าง array วันทั้งหมด
      const days = [];
      for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
        days.push(new Date(d));
      }

      // กำหนดความกว้างรวม
      const totalWidth = LABEL_WIDTH + days.length * DAY_WIDTH + 40;
      view.style.width = totalWidth + "px";

      // วาดหัววันที่
      days.forEach((d, idx) => {
        const head = document.createElement("div");
        head.style.position = "absolute";
        head.style.left = LABEL_WIDTH + idx * DAY_WIDTH + "px";
        head.style.top = "6px";
        head.style.width = DAY_WIDTH + "px";
        head.style.textAlign = "center";
        head.style.fontSize = ".75rem";
        head.style.color = "#1f2937";
        const dd = d.getDate().toString().padStart(2, "0");
        const mm = d.getMonth() + 1;
        head.textContent = dd + " " + monthShortThai(mm);
        view.appendChild(head);
      });

      // วาดเส้นแนวนอนแต่ละแถว
      items.forEach((it, idx) => {
        const y = TOP_OFFSET + idx * ROW_HEIGHT;
        const label = document.createElement("div");
        label.style.position = "absolute";
        label.style.left = "0";
        label.style.top = y + 6 + "px";
        label.style.width = LABEL_WIDTH - 10 + "px";
        label.style.textAlign = "right";
        label.style.fontWeight = "600";
        label.style.color = it.type === "drug" ? "#047857" : "#b91c1c";
        label.textContent = (it.type === "drug" ? "ยา: " : "ADR: ") + it.label;
        view.appendChild(label);

        const line = document.createElement("div");
        line.style.position = "absolute";
        line.style.left = LABEL_WIDTH + "px";
        line.style.top = y + 28 + "px";
        line.style.width = days.length * DAY_WIDTH + "px";
        line.style.height = "1px";
        line.style.background = "rgba(148,163,184,.35)";
        view.appendChild(line);

        // หาตำแหน่ง start / end ของแถบนี้
        const startIdx = diffInDays(minDate, it.start);
        const endDateForThisItem = it.end ? it.end : todayDateOnly(); // <-- ตรงนี้คือจุดสำคัญ: ถ้าไม่มี end ให้ใช้วันนี้ "ของใครของมัน"
        let endIdx = diffInDays(minDate, endDateForThisItem);

        // safety: ถ้าคนใส่ stopDate น้อยกว่า start ให้เท่ากับ start
        if (endIdx < startIdx) endIdx = startIdx;

        // สร้างแถบ
        const bar = document.createElement("div");
        bar.style.position = "absolute";
        bar.style.left = LABEL_WIDTH + startIdx * DAY_WIDTH + 4 + "px";
        bar.style.top = y + 8 + "px";
        const barWidth = (endIdx - startIdx + 1) * DAY_WIDTH - 16;
        bar.style.width = barWidth + "px";
        bar.style.height = "34px";
        bar.style.borderRadius = "999px";
        bar.style.display = "flex";
        bar.style.alignItems = "center";
        bar.style.justifyContent = "center";
        bar.style.fontWeight = "600";
        bar.style.color = "#000";
        bar.style.boxShadow = "0 6px 18px rgba(15,23,42,.12)";
        if (it.type === "drug") {
          bar.style.background = "#0ea5e9"; // ฟ้า
        } else {
          bar.style.background = "#ef4444"; // แดง
        }

        // แสดงเฉพาะชื่อ + วันที่เริ่ม
        const startText = toIsoLike(it.start);
        bar.textContent = `${it.label} (${startText})`;

        view.appendChild(bar);
      });
    } // end buildTimeline

    function diffInDays(start, end) {
      const one = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const two = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      return Math.floor((two - one) / (1000 * 60 * 60 * 24));
    }

    function monthShortThai(m) {
      const arr = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
      return arr[m - 1] || "";
    }

    function toIsoLike(d) {
      const y = d.getFullYear();
      const m = (d.getMonth() + 1).toString().padStart(2, "0");
      const day = d.getDate().toString().padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
  }

  // export
  window.renderPage5 = renderPage5;
})();

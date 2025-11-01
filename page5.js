// page5.js
(function () {
  if (!window.drugAllergyData) window.drugAllergyData = {};
  if (!window.drugAllergyData.page5) {
    window.drugAllergyData.page5 = {
      drugs: [],
      adrs: []
    };
  }

  const DAY = 24 * 60 * 60 * 1000;

  function today0() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function toDate0(str) {
    if (!str) return null;
    const d = new Date(str);
    if (isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // ---------- render ----------
  function renderPage5() {
    const root = document.getElementById("page5");
    if (!root) return;

    const store = window.drugAllergyData.page5;
    const drugs = Array.isArray(store.drugs) ? store.drugs : [];
    const adrs = Array.isArray(store.adrs) ? store.adrs : [];

    root.innerHTML = `
      <div class="p5-shell" style="background:linear-gradient(135deg,#fff2ff 0%,#fff6e8 18%,#fefefe 45%,#f6f0ff 100%);border:1px solid rgba(249,115,22,.06);border-radius:1.4rem;padding:1.2rem 1.3rem 5.5rem;min-height:80vh;position:relative;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-bottom:1.2rem;">
          <h2 style="font-size:1.3rem;font-weight:700;color:#9333ea;display:flex;align-items:center;gap:.45rem;">
            <span style="font-size:1.35rem;">📅</span>
            <span>หน้า 5 Timeline ประเมินการแพ้ยา</span>
          </h2>
          <div style="display:flex;gap:.5rem;">
            <button id="p5-add-drug" style="background:#22c55e;color:#fff;border:none;border-radius:.75rem;padding:.55rem 1.1rem;font-weight:600;cursor:pointer;box-shadow:0 10px 25px rgba(34,197,94,.25);">+ เพิ่มยาตัวใหม่</button>
            <button id="p5-add-adr" style="background:#ef4444;color:#fff;border:none;border-radius:.75rem;padding:.55rem 1.1rem;font-weight:600;cursor:pointer;box-shadow:0 10px 25px rgba(239,68,68,.2);">+ เพิ่ม ADR</button>
          </div>
        </div>

        <!-- ยา -->
        <div id="p5-drug-wrap" style="display:flex;flex-direction:column;gap:.7rem;margin-bottom:1.2rem;">
          ${drugs.map((dg, idx) => renderDrugBlock(dg, idx)).join("")}
        </div>

        <!-- ADR -->
        <div id="p5-adr-wrap" style="display:flex;flex-direction:column;gap:.7rem;margin-bottom:1.2rem;">
          ${adrs.map((ad, idx) => renderAdrBlock(ad, idx)).join("")}
        </div>

        <!-- ปุ่มสร้าง timeline -->
        <div style="margin-bottom:1rem;">
          <button id="p5-build" style="background:#4f46e5;color:#fff;border:none;border-radius:.85rem;padding:.55rem 1.05rem;font-weight:600;cursor:pointer;">▶ สร้าง Timeline</button>
        </div>

        <!-- แสดง timeline -->
        <div id="p5-timeline-box" style="background:rgba(255,255,255,.75);border:1px solid rgba(148,163,184,.25);border-radius:1rem;padding:1rem .9rem 1.1rem;">
          <h3 style="margin:0 0 .6rem;font-weight:700;color:#0f172a;">Visual Timeline</h3>
          <div id="p5-timeline-content"></div>
        </div>

        <!-- ปุ่มล่าง (ไม่ลอย) -->
        <div style="margin-top:1.5rem;display:flex;flex-direction:column;gap:.7rem;">
          <button id="p5-print" style="background:#10b981;color:#fff;border:none;border-radius:1rem;padding:.6rem 1rem;font-weight:700;cursor:pointer;box-shadow:0 12px 30px rgba(16,185,129,.3);">🖨️ Print / PDF</button>
          <button id="p5-save-go6" style="background:#4f46e5;color:#fff;border:none;border-radius:1rem;padding:.6rem 1rem;font-weight:700;cursor:pointer;">บันทึกข้อมูลและไปหน้า 6</button>
          <button id="p5-clear" style="background:#ef4444;color:#fff;border:none;border-radius:1rem;padding:.6rem 1rem;font-weight:700;cursor:pointer;">🗑️ ล้างข้อมูลหน้านี้</button>
        </div>
      </div>
    `;

    // ถ้ายังไม่มีข้อมูล ให้เติม 1 ช่อง
    const drugWrap = root.querySelector("#p5-drug-wrap");
    const adrWrap = root.querySelector("#p5-adr-wrap");
    if (!drugs.length) {
      window.drugAllergyData.page5.drugs = [
        { name: "", startDate: "", startTime: "", endDate: "", endTime: "" }
      ];
      drugWrap.innerHTML = renderDrugBlock(window.drugAllergyData.page5.drugs[0], 0);
    }
    if (!adrs.length) {
      window.drugAllergyData.page5.adrs = [
        { name: "", startDate: "", startTime: "", endDate: "", endTime: "" }
      ];
      adrWrap.innerHTML = renderAdrBlock(window.drugAllergyData.page5.adrs[0], 0);
    }

    bindDrugInputs(root);
    bindAdrInputs(root);

    root.querySelector("#p5-add-drug").addEventListener("click", () => {
      const arr = window.drugAllergyData.page5.drugs;
      const idx = arr.length;
      arr.push({ name: "", startDate: "", startTime: "", endDate: "", endTime: "" });
      drugWrap.insertAdjacentHTML("beforeend", renderDrugBlock(arr[idx], idx));
      bindDrugInputs(root);
    });

    root.querySelector("#p5-add-adr").addEventListener("click", () => {
      const arr = window.drugAllergyData.page5.adrs;
      const idx = arr.length;
      arr.push({ name: "", startDate: "", startTime: "", endDate: "", endTime: "" });
      adrWrap.insertAdjacentHTML("beforeend", renderAdrBlock(arr[idx], idx));
      bindAdrInputs(root);
    });

    root.querySelector("#p5-build").addEventListener("click", () => {
      buildTimeline(root);
    });

    root.querySelector("#p5-print").addEventListener("click", () => {
      window.print();
    });

    root.querySelector("#p5-clear").addEventListener("click", () => {
      window.drugAllergyData.page5 = { drugs: [], adrs: [] };
      renderPage5();
    });

    root.querySelector("#p5-save-go6").addEventListener("click", () => {
      const btn = document.querySelector('.tabs button[data-target="page6"]');
      if (btn) btn.click();
    });

    // วาดรอบแรกให้มีโครง
    buildTimeline(root);
  }

  // ---------- blocks ----------
  function renderDrugBlock(dg, idx) {
    return `
      <div class="p5-drug-block" data-idx="${idx}" style="background:rgba(224,242,254,.3);border:1px solid rgba(59,130,246,.15);border-radius:1rem;padding:.6rem .75rem .9rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.45rem;">
          <h3 style="margin:0;font-weight:700;color:#0f766e;">💊 ยาตัวที่ ${idx + 1}</h3>
          <button class="p5-del-drug" data-del="${idx}" style="background:none;border:none;color:#be123c;font-weight:600;cursor:pointer;">ลบ</button>
        </div>
        <label style="display:block;font-size:.82rem;color:#0f172a;margin-bottom:.25rem;">ชื่อยา</label>
        <input type="text" class="p5-drug-name" data-idx="${idx}" value="${dg.name || ""}" placeholder="ระบุชื่อยา" style="width:100%;border:1px solid rgba(59,130,246,.35);border-radius:.55rem;padding:.35rem .55rem;margin-bottom:.5rem;">
        <div style="display:flex;gap:.6rem;flex-wrap:wrap;">
          <div style="flex:1 1 180px;">
            <label style="font-size:.78rem;">เริ่มให้ยา</label>
            <input type="date" class="p5-drug-startdate" data-idx="${idx}" value="${dg.startDate || ""}" style="width:100%;border:1px solid rgba(59,130,246,.35);border-radius:.5rem;padding:.25rem .45rem;">
          </div>
          <div style="flex:0 0 130px;">
            <label style="font-size:.78rem;">เวลา</label>
            <input type="time" class="p5-drug-starttime" data-idx="${idx}" value="${dg.startTime || ""}" style="width:100%;border:1px solid rgba(59,130,246,.35);border-radius:.5rem;padding:.25rem .45rem;">
          </div>
          <div style="flex:1 1 180px;">
            <label style="font-size:.78rem;">วันที่หยุดยา</label>
            <input type="date" class="p5-drug-enddate" data-idx="${idx}" value="${dg.endDate || ""}" style="width:100%;border:1px solid rgba(59,130,246,.35);border-radius:.5rem;padding:.25rem .45rem;">
          </div>
          <div style="flex:0 0 130px;">
            <label style="font-size:.78rem;">เวลา</label>
            <input type="time" class="p5-drug-endtime" data-idx="${idx}" value="${dg.endTime || ""}" style="width:100%;border:1px solid rgba(59,130,246,.35);border-radius:.5rem;padding:.25rem .45rem;">
          </div>
        </div>
      </div>
    `;
  }

  function renderAdrBlock(ad, idx) {
    return `
      <div class="p5-adr-block" data-idx="${idx}" style="background:rgba(254,226,226,.6);border:1px solid rgba(248,113,113,.2);border-radius:1rem;padding:.6rem .75rem .9rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.45rem;">
          <h3 style="margin:0;font-weight:700;color:#b91c1c;">🔴 ADR (Adverse Drug Reaction)</h3>
          <button class="p5-del-adr" data-del="${idx}" style="background:none;border:none;color:#b91c1c;font-weight:600;cursor:pointer;">ลบ</button>
        </div>
        <label style="display:block;font-size:.82rem;color:#0f172a;margin-bottom:.25rem;">อาการ</label>
        <input type="text" class="p5-adr-name" data-idx="${idx}" value="${ad.name || ""}" placeholder="ระบุอาการ เช่น ผื่นขึ้น, คัน, บวม" style="width:100%;border:1px solid rgba(248,113,113,.35);border-radius:.55rem;padding:.35rem .55rem;margin-bottom:.5rem;">
        <div style="display:flex;gap:.6rem;flex-wrap:wrap;">
          <div style="flex:1 1 180px;">
            <label style="font-size:.78rem;">วันที่เกิด</label>
            <input type="date" class="p5-adr-startdate" data-idx="${idx}" value="${ad.startDate || ""}" style="width:100%;border:1px solid rgba(248,113,113,.35);border-radius:.5rem;padding:.25rem .45rem;">
          </div>
          <div style="flex:0 0 130px;">
            <label style="font-size:.78rem;">เวลา</label>
            <input type="time" class="p5-adr-starttime" data-idx="${idx}" value="${ad.startTime || ""}" style="width:100%;border:1px solid rgba(248,113,113,.35);border-radius:.5rem;padding:.25rem .45rem;">
          </div>
          <div style="flex:1 1 180px;">
            <label style="font-size:.78rem;">วันที่หาย</label>
            <input type="date" class="p5-adr-enddate" data-idx="${idx}" value="${ad.endDate || ""}" style="width:100%;border:1px solid rgba(248,113,113,.35);border-radius:.5rem;padding:.25rem .45rem;">
          </div>
          <div style="flex:0 0 130px;">
            <label style="font-size:.78rem;">เวลา</label>
            <input type="time" class="p5-adr-endtime" data-idx="${idx}" value="${ad.endTime || ""}" style="width:100%;border:1px solid rgba(248,113,113,.35);border-radius:.5rem;padding:.25rem .45rem;">
          </div>
        </div>
      </div>
    `;
  }

  // ---------- bind ----------
  function bindDrugInputs(root) {
    const blocks = root.querySelectorAll(".p5-drug-block");
    blocks.forEach((blk) => {
      const idx = Number(blk.dataset.idx);
      const nameI = blk.querySelector(".p5-drug-name");
      const sdI = blk.querySelector(".p5-drug-startdate");
      const stI = blk.querySelector(".p5-drug-starttime");
      const edI = blk.querySelector(".p5-drug-enddate");
      const etI = blk.querySelector(".p5-drug-endtime");
      const delBtn = blk.querySelector(".p5-del-drug");

      const update = () => {
        const arr = window.drugAllergyData.page5.drugs;
        if (!arr[idx]) arr[idx] = {};
        arr[idx].name = nameI.value;
        arr[idx].startDate = sdI.value;
        arr[idx].startTime = stI.value;
        arr[idx].endDate = edI.value;
        arr[idx].endTime = etI.value;
      };

      [nameI, sdI, stI, edI, etI].forEach((el) => el.addEventListener("input", update));

      delBtn.addEventListener("click", () => {
        window.drugAllergyData.page5.drugs.splice(idx, 1);
        renderPage5();
      });
    });
  }

  function bindAdrInputs(root) {
    const blocks = root.querySelectorAll(".p5-adr-block");
    blocks.forEach((blk) => {
      const idx = Number(blk.dataset.idx);
      const nameI = blk.querySelector(".p5-adr-name");
      const sdI = blk.querySelector(".p5-adr-startdate");
      const stI = blk.querySelector(".p5-adr-starttime");
      const edI = blk.querySelector(".p5-adr-enddate");
      const etI = blk.querySelector(".p5-adr-endtime");
      const delBtn = blk.querySelector(".p5-del-adr");

      const update = () => {
        const arr = window.drugAllergyData.page5.adrs;
        if (!arr[idx]) arr[idx] = {};
        arr[idx].name = nameI.value;
        arr[idx].startDate = sdI.value;
        arr[idx].startTime = stI.value;
        arr[idx].endDate = edI.value;
        arr[idx].endTime = etI.value;
      };

      [nameI, sdI, stI, edI, etI].forEach((el) => el.addEventListener("input", update));

      delBtn.addEventListener("click", () => {
        window.drugAllergyData.page5.adrs.splice(idx, 1);
        renderPage5();
      });
    });
  }

  // ---------- timeline ----------
  function buildTimeline(root) {
    const box = root.querySelector("#p5-timeline-content");
    const { drugs, adrs } = window.drugAllergyData.page5;
    const today = today0();

    // หา min / max จากข้อมูล
    let minDate = null;
    let maxDate = null;

    function consider(str) {
      const d = toDate0(str);
      if (!d) return;
      if (!minDate || d < minDate) minDate = d;
      if (!maxDate || d > maxDate) maxDate = d;
    }

    (drugs || []).forEach((dg) => {
      consider(dg.startDate);
      consider(dg.endDate);
    });
    (adrs || []).forEach((ad) => {
      consider(ad.startDate);
      consider(ad.endDate);
    });

    // ถ้าไม่มีเลยให้ใช้วันนี้ทั้งคู่
    if (!minDate) minDate = new Date(today.getTime());
    if (!maxDate) maxDate = new Date(today.getTime());

    // 💡 สำคัญ: ต้อง "ขยาย" maxDate ให้ถึงวันนี้เสมอ
    if (today > maxDate) {
      maxDate = new Date(today.getTime());
    }

    // รวม buffer อีกนิดกันปลายชน
    const totalDays =
      Math.floor((maxDate.getTime() - minDate.getTime()) / DAY) + 1;

    const unitWidth = 140;
    const timelineWidth = Math.max((totalDays + 1) * unitWidth, 850);

    // header วัน
    let daysHtml = `<div style="width:${timelineWidth}px;display:flex;position:relative;">`;
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(minDate.getTime() + i * DAY);
      const th = d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
      daysHtml += `<div style="width:${unitWidth}px;text-align:center;font-size:.78rem;color:#0f172a;">${th}</div>`;
    }
    daysHtml += `</div>`;

    // lanes
    let lanesHtml = `<div style="width:${timelineWidth}px;position:relative;margin-top:.6rem;padding-bottom:1.5rem;">`;

    // ยา
    (drugs || []).forEach((dg, i) => {
      if (!dg.startDate) return;
      const start = toDate0(dg.startDate);
      // ถ้าไม่ใส่วันที่หยุด → ยาวมาถึง "วันนี้" จริง
      const end = dg.endDate ? toDate0(dg.endDate) : today;
      const startOffset = Math.floor((start - minDate) / DAY);
      const endOffset = Math.floor((end - minDate) / DAY);
      const left = startOffset * unitWidth + 30;
      const width = Math.max((endOffset - startOffset + 1) * unitWidth - 60, 60);
      lanesHtml += `
        <div style="position:absolute;left:${left}px;top:${i * 55}px;width:${width}px;height:40px;background:#0ea5e9;border-radius:9999px;display:flex;align-items:center;justify-content:center;color:#000;font-weight:600;box-shadow:0 10px 25px rgba(14,165,233,.25);">
          ${dg.name ? dg.name : "ยา"} (${dg.startDate})
        </div>
      `;
    });

    // ADR
    const adrBaseTop = ((drugs || []).length) * 55 + 10;
    (adrs || []).forEach((ad, i) => {
      if (!ad.startDate) return;
      const start = toDate0(ad.startDate);
      const end = ad.endDate ? toDate0(ad.endDate) : today;
      const startOffset = Math.floor((start - minDate) / DAY);
      const endOffset = Math.floor((end - minDate) / DAY);
      const left = startOffset * unitWidth + 30;
      const width = Math.max((endOffset - startOffset + 1) * unitWidth - 60, 60);
      lanesHtml += `
        <div style="position:absolute;left:${left}px;top:${adrBaseTop + i * 55}px;width:${width}px;height:40px;background:#ef4444;border-radius:9999px;display:flex;align-items:center;justify-content:center;color:#000;font-weight:600;box-shadow:0 10px 25px rgba(239,68,68,.25);">
          ${ad.name ? ad.name : "ADR"} (${ad.startDate})
        </div>
      `;
    });

    lanesHtml += `</div>`;

    box.innerHTML = `
      <div style="overflow-x:auto;overflow-y:hidden;">
        ${daysHtml}
        ${lanesHtml}
      </div>
    `;
  }

  // export
  window.renderPage5 = renderPage5;
})();

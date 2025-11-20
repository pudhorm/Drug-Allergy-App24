```js
// ===================== page6.js — หน้า 6 (เสถียร ไม่กระพริบ/ไม่ค้าง) =====================
(function () {
  // --------- STATE GUARD ---------
  if (!window.drugAllergyData) window.drugAllergyData = {};
  if (window.__p6Bound) return; // กันโหลดซ้ำ
  window.__p6Bound = true;

  // --------- UTIL ---------
  // ใช้มาตรฐานเดียวกับ brain.js: __saved หรือมีข้อมูลจริง >=1 ฟิลด์ก็นับว่า “พร้อม”
  function __hasRealData(pageObj) {
    if (!pageObj) return false;
    if (pageObj.__saved) return true;
    const keys = Object.keys(pageObj).filter((k) => !k.startsWith("__"));
    return keys.length > 0;
  }

  function corePagesReady() {
    const d = window.drugAllergyData || {};
    const p1 = __hasRealData(d.page1);
    const p2 = __hasRealData(d.page2);
    const p3 = __hasRealData(d.page3);
    const missing = [];
    if (!p1) missing.push("หน้า 1 ผิวหนัง");
    if (!p2) missing.push("หน้า 2 ระบบอื่นๆ");
    if (!p3) missing.push("หน้า 3 Lab");
    return { ok: p1 && p2 && p3, missing };
  }

  function fmtDateTH(str) {
    if (!str) return "—";
    const pure = String(str).trim().split(" ")[0];
    let d;
    if (pure.includes("-")) {
      const [y, m, dd] = pure.split("-").map(Number);
      if (y && m && dd) d = new Date(y, m - 1, dd);
    } else if (pure.includes("/")) {
      const [dd, m, y] = pure.split("/").map(Number);
      if (y && m && dd) d = new Date(y, m - 1, dd);
    }
    return d
      ? d.toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : str;
  }

  function fmtTime(str) {
    if (!str) return "";
    const t = String(str).slice(0, 5);
    return t + " น.";
  }

  function rangeStr(sD, sT, eD, eT) {
    const start = `${fmtDateTH(sD)}${sT ? " " + fmtTime(sT) : ""}`;
    const end = eD ? `${fmtDateTH(eD)}${eT ? " " + fmtTime(eT) : ""}` : "ปัจจุบัน";
    return `${start} → ${end}`;
  }

  // เรนเดอร์สถานะหน้า 1–3 (เรียกซ้ำได้)
  function renderCoreStatus() {
    const status = corePagesReady();
    if (status.ok) {
      return `<p class="p6-muted" style="margin-top:.35rem;">
        ระบบจะประเมินจากข้อมูลที่กดบันทึกครบหน้า 1–3 แล้วสรุปว่า<strong>เข้ากับชนิดย่อยใด</strong>โดยอัตโนมัติ
      </p>`;
    }
    return `<div class="p6-empty">ยังขาดข้อมูลจาก: ${status.missing.join(
      ", "
    )}</div>
            <p class="p6-muted" style="margin-top:.35rem;">กรุณากด <strong>บันทึก</strong> ให้ครบทั้ง 3 หน้า</p>`;
  }

  // --------- NARANJO ---------
  const NARANJO_QUEST = [
    { idx: 0, yes: +1, no: 0, dk: 0 },
    { idx: 1, yes: +2, no: -1, dk: 0 },
    { idx: 2, yes: +1, no: 0, dk: 0 },
    { idx: 3, yes: +2, no: -1, dk: 0 },
    { idx: 4, yes: -1, no: +2, dk: 0 },
    { idx: 5, yes: -1, no: +1, dk: 0 },
    { idx: 6, yes: +1, no: 0, dk: 0 },
    { idx: 7, yes: +1, no: 0, dk: 0 },
    { idx: 8, yes: +1, no: 0, dk: 0 },
    { idx: 9, yes: +1, no: 0, dk: 0 },
  ];

  function narScore(drug) {
    if (!drug || !drug.answers) return 0;
    let t = 0;
    for (const q of NARANJO_QUEST) {
      const picked = drug.answers[q.idx];
      if (!picked) continue;
      t += q[picked] ?? 0;
    }
    return t;
  }

  function narInterp(score) {
    if (score >= 9) return "แน่นอน (Definite)";
    if (score >= 5) return "น่าจะเป็น (Probable)";
    if (score >= 1) return "อาจเป็นไปได้ (Possible)";
    return "ไม่น่าจะเป็น (Doubtful)";
  }

  function getNaranjoList() {
    const p4 = (window.drugAllergyData && window.drugAllergyData.page4) || {};
    const drugs = Array.isArray(p4.drugs) ? p4.drugs : [];
    return drugs.map((d, i) => ({
      name: d.name && d.name.trim() ? d.name.trim() : `ยา ${i + 1}`,
      total: narScore(d),
      interpretation: narInterp(narScore(d)),
    }));
  }

  // รายชื่อยาใน Naranjo (ใช้ในส่วนที่ 2)
  function getAllDrugNames() {
    const p4 = (window.drugAllergyData && window.drugAllergyData.page4) || {};
    const drugs = Array.isArray(p4.drugs) ? p4.drugs : [];
    return drugs.map((d, i) =>
      d.name && d.name.trim() ? d.name.trim() : "ยา " + (i + 1)
    );
  }

  function getPage5() {
    const p5 = (window.drugAllergyData && window.drugAllergyData.page5) || {};
    return {
      drugs: Array.isArray(p5.drugLines) ? p5.drugLines : [],
      adrs: Array.isArray(p5.adrLines) ? p5.adrLines : [],
    };
  }

  // --------- LOCAL BRAIN (fallback เฉยๆ – ถ้ามี brainComputeAndRender จะไม่ใช้ส่วนนี้) ---------
  function toNumber(v) {
    const n = Number(String(v ?? "").replace(/[, ]+/g, ""));
    return Number.isFinite(n) ? n : NaN;
  }

  function computeLocalBrain() {
    const outEl = document.getElementById("p6BrainBox");
    if (!outEl) return;

    const ready = corePagesReady();
    if (!ready.ok) {
      outEl.innerHTML =
        '<div class="p6-muted">ยังไม่มีข้อมูลเพียงพอจากหน้า 1–3 หรือยังไม่คำนวณ</div>';
      return;
    }

    const d = window.drugAllergyData || {};
    const p1 = d.page1 || {};
    const p2 = d.page2 || {};
    const p3 = d.page3 || {};

    const scores = Object.create(null);
    const add = (k, w) => {
      scores[k] = (scores[k] || 0) + (w || 1);
    };

    // Urticaria
    if (p1.itch?.has) add("Urticaria", 3);
    if ((p1.rashShapes || []).includes("ปื้นนูน")) add("Urticaria", 2);

    // Anaphylaxis (หยาบ ๆ)
    if (
      p2.resp?.dyspnea ||
      p2.resp?.wheeze ||
      p2.resp?.tachypnea ||
      p2.cv?.hypotension ||
      p2.cv?.shock
    )
      add("Anaphylaxis", 4);

    // Angioedema
    if (p1.swelling?.has) add("Angioedema", 3);

    // Maculopapular rash
    if (
      (p1.rashShapes || []).length &&
      (p1.rashColors || []).includes("แดง")
    )
      add("Maculopapular rash", 2);

    // AGEP
    if (p1.pustule?.has) add("AGEP", 3);

    // SJS/TEN
    if (p1.skinDetach?.gt30) add("TEN", 5);
    if (p1.skinDetach?.lt10 || p1.skinDetach?.center) add("SJS", 3);

    // Photosensitivity
    if (
      (p1.rashColors || []).includes("แดงไหม้") &&
      (p1.locations || []).includes("หน้า")
    )
      add("Photosensitivity drug eruption", 2);

    // DRESS (หยาบ ๆ)
    const aec = toNumber(p3?.cbc?.aec?.value ?? p3?.cbc?.eos?.value);
    const eosPct = toNumber(p3?.cbc?.eos?.value);
    const alt = toNumber(p3?.lft?.alt?.value);
    const ast = toNumber(p3?.lft?.ast?.value);
    if (
      (Number.isFinite(aec) && aec >= 1500) ||
      (Number.isFinite(eosPct) && eosPct >= 10)
    )
      add("DRESS", 2);
    if (
      (Number.isFinite(alt) && alt > 100) ||
      (Number.isFinite(ast) && ast > 100)
    )
      add("DRESS", 1);

    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    if (!ranked.length) {
      outEl.innerHTML =
        '<div class="p6-muted">ยังไม่มีสัญญาณเด่นพอจากข้อมูลที่กรอก</div>';
      return;
    }

    const leader = ranked[0][0];
    outEl.innerHTML = `
      <div>
        <div style="font-weight:700;margin-bottom:.25rem;">ผลเด่น: <strong>${leader}</strong></div>
        <ol class="p6-list" style="margin-top:.35rem;">
          ${ranked
            .map(([k], i) => `<li>${i + 1}) ${k}</li>`)
            .join("")}
        </ol>
      </div>
    `;
  }

  // --------- TIMELINE (วาดโดยไม่ re-render ทั้งหน้า) ---------
  function drawTimeline() {
    const dateRow = document.getElementById("p6DateRow");
    const drugLane = document.getElementById("p6DrugLane");
    const adrLane = document.getElementById("p6AdrLane");
    const sc = document.getElementById("p6TimelineScroll");
    if (!dateRow || !drugLane || !adrLane) return;

    const { drugs, adrs } = getPage5();
    dateRow.innerHTML = "";
    drugLane.innerHTML = "";
    adrLane.innerHTML = "";

    if (!drugs.length && !adrs.length) return;

    const MS_DAY = 86400000;
    const DAY_W = 120;

    function parseDate(str) {
      if (!str) return null;
      const pure = String(str).trim().split(" ")[0];
      if (pure.includes("-")) {
        const [y, m, d] = pure.split("-").map(Number);
        if (y && m && d) return new Date(y, m - 1, d);
      }
      if (pure.includes("/")) {
        const [d, m, y] = pure.split("/").map(Number);
        if (y && m && d) return new Date(y, m - 1, d);
      }
      return null;
    }

    const today = new Date();
    const today0 = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    let minDate = null;
    drugs.forEach((d) => {
      const s = parseDate(d.startDate);
      if (s && (!minDate || s < minDate)) minDate = s;
    });
    adrs.forEach((a) => {
      const s = parseDate(a.startDate);
      if (s && (!minDate || s < minDate)) minDate = s;
    });
    if (!minDate) minDate = today0;

    const maxDate = today0;
    const totalDays = Math.floor((maxDate - minDate) / MS_DAY) + 1;

    dateRow.style.display = "grid";
    dateRow.style.gridTemplateColumns = `repeat(${totalDays}, ${DAY_W}px)`;
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(
        minDate.getFullYear(),
        minDate.getMonth(),
        minDate.getDate() + i
      );
      const cell = document.createElement("div");
      cell.className = "p6-date-cell";
      cell.textContent = d.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
      });
      dateRow.appendChild(cell);
    }

    const ROW_H = 46;

    function prepLane(el, rows) {
      el.style.display = "grid";
      el.style.gridTemplateColumns = `repeat(${totalDays}, ${DAY_W}px)`;
      el.style.gridAutoRows = ROW_H + "px";
      el.style.rowGap = "6px";
      el.style.height = Math.max(rows, 1) * (ROW_H + 6) + "px";
      el.innerHTML = "";
    }

    prepLane(drugLane, drugs.length);
    prepLane(adrLane, adrs.length);

    const dayIndex = (d) => Math.floor((d - minDate) / MS_DAY);

    function addBar(obj, idx, lane, kind) {
      const sD = parseDate(obj.startDate);
      if (!sD) return;
      let eD;
      if (kind === "drug" ? obj.stopDate : obj.endDate) {
        const raw = parseDate(kind === "drug" ? obj.stopDate : obj.endDate);
        eD = raw
          ? new Date(raw.getFullYear(), raw.getMonth(), raw.getDate() - 1)
          : maxDate;
      } else eD = maxDate;

      if (eD < sD) eD = sD;
      if (eD > maxDate) eD = maxDate;

      const same =
        (kind === "drug" ? obj.stopDate : obj.endDate) &&
        dayIndex(parseDate(obj.startDate)) ===
          dayIndex(
            parseDate(kind === "drug" ? obj.stopDate : obj.endDate)
          );

      if (same) {
        const cell = document.createElement("div");
        cell.style.gridColumn = `${dayIndex(sD) + 1} / ${dayIndex(sD) + 2}`;
        cell.style.gridRow = `${idx + 1}`;
        cell.style.display = "flex";
        cell.style.alignItems = "center";

        const dot = document.createElement("div");
        dot.title =
          (kind === "drug"
            ? (obj.name || "").trim()
            : (obj.symptom || "").trim()) ||
          `${kind === "drug" ? "ยา" : "ADR"} ${idx + 1}`;
        dot.style.width = "16px";
        dot.style.height = "16px";
        dot.style.borderRadius = "9999px";
        dot.style.background =
          kind === "drug"
            ? "linear-gradient(90deg,#1679ff 0%,#25c4ff 100%)"
            : "linear-gradient(90deg,#f43f5e 0%,#f97316 100%)";
        dot.style.boxShadow = "0 8px 22px rgba(15,23,42,.12)";
        dot.style.marginLeft = "4px";
        cell.appendChild(dot);
        lane.appendChild(cell);
        return;
      }

      const bar = document.createElement("div");
      bar.className = `p6-bar ${
        kind === "drug" ? "p6-bar-drug" : "p6-bar-adr"
      }`;
      bar.textContent =
        kind === "drug"
          ? (obj.name && obj.name.trim()) || `ยา ${idx + 1}`
          : (obj.symptom && obj.symptom.trim()) || `ADR ${idx + 1}`;
      bar.style.gridColumn = `${dayIndex(sD) + 1} / ${dayIndex(eD) + 2}`;
      bar.style.gridRow = `${idx + 1}`;
      lane.appendChild(bar);
    }

    drugs.forEach((d, i) => addBar(d, i, drugLane, "drug"));
    adrs.forEach((a, i) => addBar(a, i, adrLane, "adr"));

    if (sc) sc.scrollLeft = sc.scrollWidth;
  }

  // --------- ADR CHART (กราฟแนวนอน 21 ADR จาก brainResult) ---------
  function updateAdrChartFromBrain() {
    const body = document.getElementById("p6AdrChartBody");
    if (!body) return;

    const brain = window.brainResult;
    if (!brain || !brain.results || !Object.keys(brain.results).length) {
      body.innerHTML =
        '<p class="p6-muted">ยังไม่มีข้อมูลเพียงพอจากหน้า 1–3 หรือยังไม่คำนวณ</p>';
      return;
    }

    const arr = Object.values(brain.results);
    if (!arr.length) {
      body.innerHTML =
        '<p class="p6-muted">ยังไม่มีข้อมูลเพียงพอจากหน้า 1–3 หรือยังไม่คำนวณ</p>';
      return;
    }

    // เรียงตาม % จากมากไปน้อย แต่แสดงครบทุก ADR
    const sorted = arr.slice().sort((a, b) => (b.percent || 0) - (a.percent || 0));
    const maxPct = Math.max(
      1,
      ...sorted.map((r) => (Number.isFinite(r.percent) ? r.percent : 0))
    );

    const rowsHtml = sorted
      .map((r) => {
        const pct = Number.isFinite(r.percent) ? Math.max(0, r.percent) : 0;
        const pctStr = pct.toFixed(1).replace(/\.0$/, "");
        const width = (pct / maxPct) * 100;
        return `
          <div class="p6-adr-chart-row">
            <div class="p6-adr-chart-label">${r.label}</div>
            <div class="p6-adr-chart-bar-track">
              <div class="p6-adr-chart-bar-fill" style="width:${width}%;"></div>
            </div>
            <div class="p6-adr-chart-pct">${pctStr}%</div>
          </div>
        `;
      })
      .join("");

    body.innerHTML = rowsHtml;
  }

  // --------- ส่วนที่ 2: ใช้ % สูงสุดจาก brainResult ---------
  function getTopAdrFromBrain() {
    const brain = window.brainResult;
    if (!brain || !brain.results) return null;
    const arr = Object.values(brain.results);
    if (!arr.length) return null;

    let best = null;
    for (const r of arr) {
      const pct = Number.isFinite(r.percent) ? r.percent : 0;
      if (!r.label && !r.id) continue;
      if (!best || pct > best.percent) {
        best = {
          id: r.id || null,
          label: r.label || r.id || "",
          percent: pct,
        };
      }
    }
    if (!best || best.percent <= 0) return null;
    return best;
  }

  function updateSection2FromBrain() {
    const boxReceived = document.getElementById("p6DrugsReceived");
    const boxReport = document.getElementById("p6DrugsReport");
    if (!boxReceived || !boxReport) return;

    const drugNames = getAllDrugNames();
    const baseDrugText = drugNames.length
      ? drugNames.join(", ")
      : "ยังไม่มีข้อมูลยา (รอข้อมูลจากหน้า 4 / 5 หรือระบบ timeline)";

    const topAdr = getTopAdrFromBrain();

    if (!topAdr) {
      // กรณียังไม่มีผลจากส่วนที่ 1
      boxReceived.textContent = baseDrugText;
      boxReport.innerHTML =
        '<p class="p6-muted">รอข้อมูลและการวิเคราะห์ภายหลังกำหนดกฎการประเมิน…</p>';
      return;
    }

    const pctStr = topAdr.percent
      ? topAdr.percent.toFixed(1).replace(/\.0$/, "")
      : "0";

    // ยังคงแสดง "ยาที่ผู้ป่วยได้รับ" ตามจริง + แจ้งว่าในส่วนที่ 2 focus เฉพาะ ADR ที่ % สูงสุด
    boxReceived.innerHTML = `
      <p class="p6-muted"> ${
        baseDrugText || "ยังไม่มีข้อมูลยา (รอข้อมูลจากหน้า 4 / 5 หรือระบบ timeline)"
      }</p>
    `;

    boxReport.innerHTML = `
      <p class="p6-muted">
        แสดงเฉพาะข้อมูลสำหรับ <strong>${topAdr.label}</strong>
        ซึ่งได้เปอร์เซ็นต์ความเข้าได้สูงที่สุดจากส่วนที่ 1
        (${pctStr}%)
      </p>
      <p class="p6-muted" style="margin-top:.35rem;">
        ในขั้นต่อไปสามารถเติมรายการยาที่มีรายงานการเกิด <strong>${topAdr.label}</strong>
        พร้อมแหล่งอ้างอิง เพื่อใช้เป็นฐานข้อมูลประกอบการประเมินในผู้ป่วยรายนี้
      </p>
    `;
  }

  // --------- RENDER (ครั้งเดียว) ---------
  function renderPage6() {
    const root = document.getElementById("p6Root");
    if (!root) return;

    if (!window.__p6RenderedOnce) {
      window.__p6RenderedOnce = true;

      const p4 =
        (window.drugAllergyData && window.drugAllergyData.page4) || {};
      const drugNames = getAllDrugNames();

      const subtypesList = `
        <ul class="p6-muted" style="margin-top:.35rem;">
          <li>Urticaria</li><li>Anaphylaxis</li><li>Angioedema</li>
          <li>Maculopapular rash</li><li>Fixed drug eruption</li><li>AGEP</li>
          <li>SJS</li><li>TEN</li><li>DRESS</li><li>Erythema multiforme</li>
          <li>Photosensitivity drug eruption</li><li>Exfoliative dermatitis</li>
          <li>Eczematous drug eruption</li><li>Bullous Drug Eruption</li>
          <li>Serum sickness</li><li>Vasculitis</li>
          <li>Hemolytic anemia</li>
          <li>Pancytopenia / Neutropenia / Thrombocytopenia</li>
          <li>Nephritis</li>
        </ul>
      `;

      function naranjoBlock() {
        const list = getNaranjoList();
        if (!list.length)
          return `<div class="p6-empty">ยังไม่มีข้อมูล Naranjo (กรุณากดบันทึกในหน้า 4)</div>`;
        return `
          <div class="p6-naranjo-list">
            ${list
              .map(
                (item) => `
              <div class="p6-naranjo-item">
                <div class="p6-naranjo-name">${item.name}</div>
                <div class="p6-naranjo-score">${item.total}</div>
              </div>
              <p class="p6-muted" style="margin-top:2px;margin-bottom:10px;">สรุป: ${item.interpretation}</p>
            `
              )
              .join("")}
          </div>
        `;
      }

      const p5 = getPage5();
      const drugList = p5.drugs.length
        ? `<ol class="p6-list">${p5.drugs
            .map(
              (d, i) => `<li><strong>${
                (d.name || "").trim() || "ยาตัวที่ " + (i + 1)
              }</strong> — ${rangeStr(
                d.startDate,
                d.startTime,
                d.stopDate,
                d.stopTime
              )}</li>`
            )
            .join("")}</ol>`
        : `<p class="p6-muted">— ไม่มีรายการยา —</p>`;
      const adrList = p5.adrs.length
        ? `<ol class="p6-list">${p5.adrs
            .map(
              (a, i) => `<li><strong>${
                (a.symptom || "").trim() || "ADR " + (i + 1)
              }</strong> — ${rangeStr(
                a.startDate,
                a.startTime,
                a.endDate,
                a.endTime
              )}</li>`
            )
            .join("")}</ol>`
        : `<p class="p6-muted">— ไม่มี ADR —</p>`;

      root.innerHTML = `
        <div class="p6-wrapper">
          <div class="p6-block sec1">
            <div class="p6-head">
              <div class="p6-emoji">🤖</div>
              <div class="p6-head-title">ส่วนที่ 1: Type of ADR (Non-immunologic &amp; Immunologic)</div>
            </div>
            <div class="p6-subcard">
              <div class="p6-sub-title">อาการ/อาการแสดงทางคลินิกของการแพ้ยา</div>
              ${subtypesList}
              <div id="p6CoreStatus">${renderCoreStatus()}</div>
            </div>

            <div class="p6-subcard">
              <div class="p6-sub-title">ผลการประเมินเบื้องต้น</div>
              <div id="p6BrainHost">
                <!-- p6BrainBox จาก index.html จะถูกย้ายมาอยู่ตรงนี้ -->
              </div>

              <!-- กล่องกราฟ ADR 21 ชนิด (แนวนอน สีชมพู) -->
              <div class="p6-adr-chart">
                <div class="p6-adr-chart-title">กราฟเปอร์เซ็นต์การเข้าได้กับ ADR ทั้ง 21 ชนิด</div>
                <div id="p6AdrChartBody" class="p6-adr-chart-body">
                  <p class="p6-muted">ยังไม่มีข้อมูลเพียงพอจากหน้า 1–3</p>
                </div>
              </div>

              <div style="margin-top:.6rem;display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;">
                <button id="p6BrainRefreshBtn" class="p6-btn p6-btn-outline">🔄 รีเฟรชผลประเมิน</button>
              </div>
            </div>
          </div>

          <div class="p6-block sec2">
            <div class="p6-head"><div class="p6-emoji">💊</div><div class="p6-head-title">ส่วนที่ 2: ยาที่มีรายงานการเกิดการแพ้ยาดังกล่าว</div></div>
            <div class="p6-subcard">
              <div class="p6-sub-title">ยาที่ผู้ป่วยได้รับ:</div>
              <div id="p6DrugsReceived" class="p6-muted">${
                drugNames && drugNames.length
                  ? drugNames.join(", ")
                  : "ยังไม่มีข้อมูลยา (รอข้อมูลจากหน้า 4 / 5 หรือระบบ timeline)"
              }</div>
            </div>
            <div class="p6-subcard">
              <div class="p6-sub-title">รายงานการแพ้:</div>
              <div id="p6DrugsReport" class="p6-muted">
                รอข้อมูลและการวิเคราะห์ภายหลังกำหนดกฎการประเมิน…
              </div>
            </div>
          </div>

          <div class="p6-block sec3">
            <div class="p6-head"><div class="p6-emoji">💉</div><div class="p6-head-title">ส่วนที่ 3: แนวทางการรักษาเฉพาะตามชนิดการแพ้</div></div>
            <div class="p6-subcard">
              <div class="p6-sub-title">การรักษาเฉพาะ:</div>
              <p class="p6-muted">ส่วนนี้จะดึงจาก “สมองการแพ้ยา” ภายหลัง</p>
            </div>
          </div>

          <div class="p6-block sec4">
            <div class="p6-head"><div class="p6-emoji">📊</div><div class="p6-head-title">ส่วนที่ 4: ผลการประเมิน Naranjo และ Timeline</div></div>
            <div class="p6-subcard">
              <div class="p6-sub-title">ผลประเมิน Naranjo Adverse Drug Reaction Probability Scale</div>
              ${naranjoBlock()}
            </div>
            <div class="p6-subcard">
              <div class="p6-sub-title">Timeline แสดงความสัมพันธ์ระหว่างยาและอาการ</div>
              <div class="p6-timeline-readable">
                <div class="p6-sub-sub">
                  <div class="p6-sub-title" style="margin-bottom:.35rem;">💊 รายการยา</div>
                  ${drugList}
                </div>
                <div class="p6-sub-sub" style="margin-top:.65rem;">
                  <div class="p6-sub-title" style="margin-bottom:.35rem;">🧪 ADR</div>
                  ${adrList}
                </div>
              </div>
              <div class="p6-visual-box">
                <h4 class="p6-visual-title">Visual Timeline</h4>
                <div id="p6TimelineScroll" class="p6-timeline-scroll">
                  <div id="p6DateRow"></div>
                  <div class="p6-lane">
                    <div class="p6-lane-label">ยา</div>
                    <div id="p6DrugLane"></div>
                  </div>
                  <div class="p6-lane">
                    <div class="p6-lane-label p6-lane-adr">ADR</div>
                    <div id="p6AdrLane"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="p6-footer-btns">
            <button class="p6-btn p6-btn-print" onclick="p6PrintTimeline()">🖨️ Print / PDF</button>
            <button class="p6-btn p6-btn-next" onclick="alert('ยังไม่ได้สร้างหน้า 7 — เดี๋ยวเราต่อให้ตอนใส่สมอง')">➡️ บันทึกข้อมูลและไปหน้า 7</button>
          </div>
        </div>
      `;

      // ย้าย p6BrainBox จาก index.html มาไว้ใน host (ไม่สร้าง id ซ้ำ)
      const externalBox = document.getElementById("p6BrainBox");
      const host = document.getElementById("p6BrainHost");
      if (externalBox && host) {
        host.appendChild(externalBox);
        if (!externalBox.innerHTML.trim()) {
          externalBox.classList.add("p6-muted");
          externalBox.textContent =
            "ยังไม่มีข้อมูลเพียงพอจากหน้า 1–3 หรือยังไม่คำนวณ";
        }
      }

      // ปุ่มรีเฟรช = คำนวณใหม่
      const btn = document.getElementById("p6BrainRefreshBtn");
      if (btn) {
        btn.addEventListener("click", () => {
          if (typeof window.brainComputeAndRender === "function") {
            try {
              window.brainComputeAndRender();
            } catch (e) {}
          } else {
            try {
              computeLocalBrain();
            } catch (e) {}
          }
          updateAdrChartFromBrain();
          updateSection2FromBrain();
        });
      }

      // ใส่สไตล์ (ครั้งเดียว)
      injectP6Styles();

      // วาด timeline ครั้งแรก
      setTimeout(drawTimeline, 0);
    }

    // ทุกครั้งที่เรียก renderPage6() หลังจากนี้ ให้คำนวณเฉพาะผล + redraw timeline เฉพาะกล่อง
    if (typeof window.brainComputeAndRender === "function") {
      try {
        window.brainComputeAndRender();
      } catch (e) {}
    } else {
      computeLocalBrain();
    }

    updateAdrChartFromBrain();
    updateSection2FromBrain();
    drawTimeline();

    // อัปเดตสถานะ core (กันกรณีถูกเรียก render ใหม่)
    const holder = document.getElementById("p6CoreStatus");
    if (holder) holder.innerHTML = renderCoreStatus();
  }

  // --------- STYLES ---------
  function injectP6Styles() {
    if (document.getElementById("p6-visual-style")) return;
    const css = `
      .p6-visual-box{background:#fff;border:1px solid #edf2f7;border-radius:16px;padding:14px;margin-top:10px;}
      .p6-visual-title{margin:0 0 8px;font-size:1.05rem;font-weight:700;color:#111827;}
      .p6-timeline-scroll{overflow:auto;padding-bottom:6px}
      .p6-date-cell{border-bottom:1px solid #edf2f7;font-size:12px;font-weight:600;white-space:nowrap;padding-bottom:2px;text-align:left}
      .p6-lane{display:flex;gap:10px;align-items:flex-start;margin-top:8px}
      .p6-lane-label{width:38px;flex:0 0 38px;font-weight:700;color:#06705d;padding-top:10px}
      .p6-lane-label.p6-lane-adr{color:#c53030}
      .p6-bar{height:34px;border-radius:9999px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;white-space:nowrap;box-shadow:0 8px 22px rgba(15,23,42,.12);font-size:12px}
      .p6-bar-drug{background:linear-gradient(90deg,#1679ff 0%,#25c4ff 100%)}
      .p6-bar-adr{background:linear-gradient(90deg,#f43f5e 0%,#f97316 100%)}
      .p6-naranjo-item{display:flex;justify-content:space-between;align-items:center;background:#E8FFF0;border:1px solid #A7F3D0;border-radius:12px;padding:.6rem .8rem;margin:.35rem 0;}
      .p6-naranjo-name{font-weight:800;color:#064E3B;}
      .p6-naranjo-score{background:#ECFDF5;color:#065F46;border:1px solid #A7F3D0;border-radius:10px;padding:.15rem .6rem;font-weight:800;min-width:2.2rem;text-align:center;}

      /* กราฟ ADR 21 ชนิด (แนวนอน สีชมพู) */
      .p6-adr-chart{
        margin-top:.6rem;
        border-radius:18px;
        border:1px solid rgba(236,72,153,.65);
        background:linear-gradient(135deg,rgba(255,241,246,0.98),rgba(251,207,232,0.95));
        padding:10px 12px;
        box-shadow:0 10px 30px rgba(236,72,153,0.18);
      }
      .p6-adr-chart-title{
        margin:0 0 6px;
        font-size:13px;
        font-weight:700;
        color:#9d174d;
      }
      .p6-adr-chart-body{
        max-height:260px;
        overflow:auto;
        padding-right:4px;
      }
      .p6-adr-chart-row{
        display:flex;
        align-items:center;
        gap:8px;
        margin:3px 0;
      }
      .p6-adr-chart-label{
        flex:0 0 160px;
        font-size:11px;
        font-weight:600;
        color:#6b21a8;
      }
      .p6-adr-chart-bar-track{
        flex:1 1 auto;
        height:18px;
        border-radius:999px;
        background:rgba(255,255,255,0.92);
        border:1px solid rgba(248,113,113,0.45);
        overflow:hidden;
        position:relative;
      }
      .p6-adr-chart-bar-fill{
        position:absolute;
        left:0;
        top:0;
        bottom:0;
        border-radius:999px;
        background:linear-gradient(90deg,#ec4899 0%,#f97316 100%);
        box-shadow:0 4px 10px rgba(244,114,182,0.55);
      }
      .p6-adr-chart-pct{
        flex:0 0 50px;
        text-align:right;
        font-size:11px;
        font-weight:800;
        color:#be185d;
      }
    `;
    const tag = document.createElement("style");
    tag.id = "p6-visual-style";
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  // --------- AUTO UPDATE (ไม่ re-render ทั้งหน้า) ---------
  document.addEventListener("da:update", () => {
    if (typeof window.brainComputeAndRender === "function") {
      window.brainComputeAndRender();
    } else {
      computeLocalBrain();
    }
    updateAdrChartFromBrain();
    updateSection2FromBrain();
    drawTimeline();
    const holder = document.getElementById("p6CoreStatus");
    if (holder) holder.innerHTML = renderCoreStatus();
  });

  // --------- EXPORT ---------
  window.renderPage6 = renderPage6;
})();


// ====== พิมพ์หน้า 6 (เหมือนเดิม) ======
function p6PrintTimeline() {
  const root = document.getElementById("p6Root");
  const pageSnapshot = root ? root.outerHTML : "";

  const p5 =
    (window.drugAllergyData && window.drugAllergyData.page5) || {
      drugLines: [],
      adrLines: [],
    };
  const drugs = Array.isArray(p5.drugLines) ? p5.drugLines : [];
  const adrs = Array.isArray(p5.adrLines) ? p5.adrLines : [];

  function fmtDateTHLocal(str) {
    if (!str) return "—";
    const pure = String(str).trim().split(" ")[0];
    let d;
    if (pure.includes("-")) {
      const [y, m, dd] = pure.split("-").map(Number);
      if (y && m && dd) d = new Date(y, m - 1, dd);
    } else if (pure.includes("/")) {
      const [dd, m, y] = pure.split("/").map(Number);
      if (y && m && dd) d = new Date(y, m - 1, dd);
    }
    return d
      ? d.toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : str;
  }

  function fmtTimeLocal(str) {
    if (!str) return "";
    const t = String(str).slice(0, 5);
    return t + " น.";
  }

  const summaryHTML = `
    <section class="p6-print-summary">
      <h3>🗂️ สรุปข้อมูลที่กรอก</h3>
      <div class="sec">
        <h4>💊 รายการยา</h4>
        ${
          drugs.length
            ? `<ol>
                ${drugs
                  .map((d) => {
                    const name = (d.name || "").trim() || "(ไม่ระบุชื่อยา)";
                    const sD = fmtDateTHLocal(d.startDate);
                    const sT = fmtTimeLocal(d.startTime);
                    const eD = fmtDateTHLocal(d.stopDate);
                    const eT = fmtTimeLocal(d.stopTime);
                    return `<li><strong>${name}</strong> — เริ่ม ${sD}${
                      sT ? " " + sT : ""
                    } · หยุด ${eD}${eT ? " " + eT : ""}</li>`;
                  })
                  .join("")}
               </ol>`
            : `<p class="muted">— ไม่มีรายการยา —</p>`
        }
      </div>
      <div class="sec">
        <h4>🧪 ADR</h4>
        ${
          adrs.length
            ? `<ol>
                ${adrs
                  .map((a) => {
                    const sym =
                      (a.symptom || "").trim() || "(ไม่ระบุอาการ)";
                    const sD = fmtDateTHLocal(a.startDate);
                    const sT = fmtTimeLocal(a.startTime);
                    const eD = fmtDateTHLocal(a.endDate);
                    const eT = fmtTimeLocal(a.endTime);
                    return `<li><strong>${sym}</strong> — เริ่ม ${sD}${
                      sT ? " " + sT : ""
                    } · หาย ${eD}${eT ? " " + eT : ""}</li>`;
                  })
                  .join("")}
               </ol>`
            : `<p class="muted">— ไม่มี ADR —</p>`
        }
      </div>
    </section>
  `;

  const win = window.open("", "_blank", "width=1200,height=800");
  win.document.write(`
    <html>
      <head>
        <meta charset="utf-8" />
        <title>พิมพ์หน้า 6</title>
        <style>
          * { box-sizing:border-box; font-family:system-ui,-apple-system,"Segoe UI",sans-serif; }
          body { margin:0; padding:12px 16px 16px; background:#fff;
                 -webkit-print-color-adjust: exact !important;
                 print-color-adjust: exact !important; }
          .tabs, .p6-footer-btns, .p6-btn, .p6-btn-group, button { display:none !important; }
          .p6-visual-box { display:none !important; }
          .p6-print-summary { border:1px solid #e5e7eb; border-radius:12px; padding:12px 14px; margin:12px 0 14px; background:#fafafa; }
          .p6-print-summary h3 { margin:0 0 8px; }
          .p6-print-summary h4 { margin:10px 0 6px; }
          .p6-print-summary ol { margin:0 0 6px 18px; padding:0; }
          .p6-print-summary li { margin:2px 0; }
          .p6-print-summary .muted { color:#6b7280; margin:0; }
          .p6-visual-box-print { background:#fff; border:1px solid #edf2f7; border-radius:16px; padding:14px; }
          #printTimelineScroll { overflow:visible; width:auto; max-width:none; display:inline-block; background:#fff; }
          #printDateRow, #printDrugLane, #printAdrLane { display:grid; grid-auto-rows:40px; row-gap:6px; }
          .p6-date-cell { border-bottom:1px solid #edf2f7; font-size:11px; font-weight:600; white-space:nowrap; padding-bottom:2px; text-align:left; }
          .p6-lane { display:flex; gap:10px; align-items:flex-start; margin-top:6px; }
          .p6-lane-label { width:38px; flex:0 0 38px; font-weight:700; color:#06705d; padding-top:10px; }
          .p6-lane-adr { color:#c53030 !important; }
          .p6-bar { height:34px; border-radius:9999px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:600; white-space:nowrap; box-shadow:0 8px 22px rgba(15,23,42,.12); font-size:12px; }
          .p6-bar-drug { background:linear-gradient(90deg,#1679ff 0%,#25c4ff 100%); }
          .p6-bar-adr  { background:linear-gradient(90deg,#f43f5e 0%,#f97316 100%); }
          @page { size:A4 landscape; margin:8mm; }
          @media print { body { background:#fff; } }
        </style>
      </head>
      <body>
        ${pageSnapshot}
        ${summaryHTML}
        <div class="p6-visual-box-print">
          <h4 style="margin:0 0 8px;font-size:1.05rem;font-weight:700;color:#111827;">Visual Timeline</h4>
          <div id="printTimelineScroll">
            <div id="printDateRow"></div>
            <div class="p6-lane">
              <div class="p6-lane-label">ยา</div>
              <div id="printDrugLane"></div>
            </div>
            <div class="p6-lane">
              <div class="p6-lane-label p6-lane-adr">ADR</div>
              <div id="printAdrLane"></div>
            </div>
          </div>
        </div>
        <script>
          (function(){
            const p5 = (window.opener && window.opener.window && window.opener.window.drugAllergyData && window.opener.window.drugAllergyData.page5) || { drugLines: [], adrLines: [] };
            const drugs = Array.isArray(p5.drugLines) ? p5.drugLines : [];
            const adrs  = Array.isArray(p5.adrLines)  ? p5.adrLines  : [];
            function parseDate(str){
              if(!str) return null;
              const pure=String(str).trim().split(" ")[0];
              if(pure.includes("-")){ const [y,m,d]=pure.split("-").map(Number); if(y&&m&&d) return new Date(y,m-1,d); }
              if(pure.includes("/")){ const [d,m,y]=pure.split("/").map(Number); if(y&&m&&d) return new Date(y,m-1,d); }
              return null;
            }
            const dateRow = document.getElementById("printDateRow");
            const drugLane = document.getElementById("printDrugLane");
            const adrLane  = document.getElementById("printAdrLane");
            const box      = document.getElementById("printTimelineScroll");
            const MS_DAY = 86400000;
            const today = new Date(); const today0=new Date(today.getFullYear(),today.getMonth(),today.getDate());
            let minDate = null;
            drugs.forEach(d=>{ const s=parseDate(d.startDate); if(s && (!minDate || s<minDate)) minDate=s; });
            adrs.forEach(a=>{ const s=parseDate(a.startDate); if(s && (!minDate || s<minDate)) minDate=s; });
            if(!minDate) minDate = today0;
            const maxDate = today0;
            const totalDays = Math.floor((maxDate - minDate)/MS_DAY) + 1;
            const PRINT_DAY_W = 45;
            dateRow.style.display="grid";
            dateRow.style.gridTemplateColumns="repeat("+totalDays+", "+PRINT_DAY_W+"px)";
            for(let i=0;i<totalDays;i++){
              const d = new Date(minDate.getFullYear(),minDate.getMonth(),minDate.getDate()+i);
              const cell=document.createElement("div");
              cell.className="p6-date-cell";
              cell.textContent = d.toLocaleDateString("th-TH",{day:"numeric",month:"short"});
              dateRow.appendChild(cell);
            }
            const ROW_H=40;
            function prepLane(el,rows){
              el.innerHTML="";
              el.style.display="grid";
              el.style.gridTemplateColumns="repeat("+totalDays+", "+PRINT_DAY_W+"px)";
              el.style.gridAutoRows=ROW_H+"px";
              el.style.rowGap="6px";
              el.style.height=(Math.max(rows,1)*(ROW_H+6))+"px";
            }
            prepLane(drugLane, drugs.length);
            prepLane(adrLane,  adrs.length);
            const dayIndexOf = (date) => Math.floor((date - minDate)/MS_DAY);
            drugs.forEach((d,idx)=>{
              const s=parseDate(d.startDate); if(!s) return;
              let e; if (d.stopDate){ const _e=parseDate(d.stopDate); e = _e? new Date(_e.getFullYear(),_e.getMonth(),_e.getDate()-1): maxDate; } else e=maxDate;
              if (e<s) e=s; if (e>maxDate) e=maxDate;
              const bar=document.createElement("div");
              bar.className="p6-bar p6-bar-drug";
              bar.textContent = (d.name && String(d.name).trim()) ? String(d.name).trim() : "ยา "+(idx+1);
              bar.style.gridColumn = (dayIndexOf(s)+1) + " / " + (dayIndexOf(e)+2);
              bar.style.gridRow = (idx+1);
              drugLane.appendChild(bar);
            });
            adrs.forEach((a,idx)=>{
              const s=parseDate(a.startDate); if(!s) return;
              let e; if (a.endDate){ const _e=parseDate(a.endDate); e = _e? new Date(_e.getFullYear(),_e.getMonth(),_e.getDate()-1): maxDate; } else e=maxDate;
              if (e<s) e=s; if (e>maxDate) e=maxDate;
              const bar=document.createElement("div");
              bar.className="p6-bar p6-bar-adr";
              bar.textContent = (a.symptom && String(a.symptom).trim()) ? String(a.symptom).trim() : "ADR "+(idx+1);
              bar.style.gridColumn = (dayIndexOf(s)+1) + " / " + (dayIndexOf(e)+2);
              bar.style.gridRow = (idx+1);
              adrLane.appendChild(bar);
            });
            const cells = Array.from(dateRow.children);
            const lastIdx = cells.length - 1;
            cells.forEach(function (cell, i) {
              if (i === 0 || i === lastIdx) return;
              if (i % 4 !== 0) cell.textContent = "";
            });
            const maxWidth = Math.min(1120, window.innerWidth - 80);
            const totalWidth = totalDays * PRINT_DAY_W + 60;
            if (totalWidth > maxWidth) {
              const scale = maxWidth / totalWidth;
              box.style.transform = "scale(" + scale.toFixed(3) + ")";
              box.style.transformOrigin = "top left";
            }
            window.print();
            setTimeout(function(){ window.close(); }, 500);
          })();
        </script>
      </body>
    </html>
  `);
  win.document.close();
}

// ===== public API =====
if (typeof window.renderPage6 === "function") {
  try {
    window.renderPage6();
  } catch (_) {}
}
```

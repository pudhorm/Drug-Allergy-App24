// ===================== page7.js (REPLACE WHOLE FILE) =====================
(function () {
  const STORAGE_KEYS = [
    "daCases_v1",
    "drugAllergyCases_v1",
    "drugAllergyCases",
    "da_case_records_v1",
  ];

  // ---------- Utils ----------
  function deepClone(obj) {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      return obj;
    }
  }

  function safeParse(str) {
    if (!str) return [];
    try {
      const v = JSON.parse(str);
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }

  function loadCases() {
    for (const key of STORAGE_KEYS) {
      const raw = localStorage.getItem(key);
      const arr = safeParse(raw);
      if (arr.length) return arr;
    }
    return [];
  }

  function saveCases(list) {
    const key = STORAGE_KEYS[0];
    localStorage.setItem(key, JSON.stringify(list || []));
  }

  function formatDateTH(iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function extractPatientFromData(data) {
    const d = data || {};
    const p1 = d.page1 || {};
    const pat = p1.patient || d.patient || {};
    const hn =
      pat.hn || pat.HN || d.hn || d.HN || (d.patient && d.patient.hn) || "";
    const name =
      pat.name ||
      pat.fullName ||
      pat.fullname ||
      d.name ||
      (d.patient && (d.patient.name || d.patient.fullName)) ||
      "";
    return { hn, name };
  }

  function pickTopAdr(brain) {
    const b = brain && brain.results ? brain : null;
    if (!b) return { label: "", percent: null };
    const arr = Object.values(b.results || {});
    if (!arr.length) return { label: "", percent: null };
    const sorted = arr
      .slice()
      .sort((a, b2) => (b2.percent || 0) - (a.percent || 0));
    const top = sorted[0] || {};
    if (!top.label) return { label: "", percent: null };
    const pct = Number.isFinite(top.percent) ? top.percent : null;
    return { label: top.label, percent: pct };
  }

  function buildAdrMainText(caseObj) {
    const label =
      caseObj.mainAdrLabel ||
      (caseObj.brain && pickTopAdr(caseObj.brain).label) ||
      "";
    const pct =
      caseObj.mainAdrPercent != null
        ? caseObj.mainAdrPercent
        : caseObj.brain
        ? pickTopAdr(caseObj.brain).percent
        : null;

    if (!label) return "-";
    if (pct == null || !Number.isFinite(+pct)) return label;
    const p = Math.round(+pct);
    return `${label} (${p}%)`;
  }

  // ---------- สร้างเคสจากข้อมูลปัจจุบัน ----------
  function snapshotCurrentCase() {
    const data = deepClone(window.drugAllergyData || {});
    const brain = deepClone(window.brainResult || null);
    const { hn, name } = extractPatientFromData(data);
    const topAdr = pickTopAdr(brain);

    return {
      id: "case_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      createdAt: new Date().toISOString(),
      hn: hn || "",
      name: name || "",
      mainAdrLabel: topAdr.label || "",
      mainAdrPercent:
        topAdr.percent != null && Number.isFinite(topAdr.percent)
          ? Math.round(topAdr.percent)
          : null,
      data,
      brain,
    };
  }

  function saveCurrentCase() {
    const all = loadCases();
    const snap = snapshotCurrentCase();
    all.push(snap);
    saveCases(all);
    renderCaseTable(); // refresh
    alert("บันทึกเคสจากข้อมูลหน้า 1–6 เรียบร้อยแล้ว");
  }

  // ---------- โหลดเคสกลับเข้าแอป ----------
  function loadCaseById(id) {
    const all = loadCases();
    const found = all.find((c) => c.id === id);
    if (!found) {
      alert("ไม่พบเคสนี้ในระบบแล้ว");
      return;
    }

    // clone ก่อนใส่กลับ เพื่อให้กดดู/แก้ไขได้หลายรอบโดยไม่ทำลายข้อมูลต้นฉบับ
    const clonedData = deepClone(found.data || {});
    window.drugAllergyData = clonedData;

    // เผื่ออยากใช้ brainResult เดิม
    if (found.brain) {
      window.brainResult = deepClone(found.brain);
    }

    // แจ้งทุกหน้าว่าข้อมูลเปลี่ยน
    try {
      const ev = new CustomEvent("da:update");
      document.dispatchEvent(ev);
    } catch (_) {}

    if (typeof window.showPage === "function") {
      window.showPage("page1");
    }
  }

  function deleteCaseById(id) {
    const all = loadCases();
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) return;
    if (!confirm("ต้องการลบเคสนี้ออกจากรายงานหรือไม่?")) return;
    all.splice(idx, 1);
    saveCases(all);
    renderCaseTable();
  }

  // ---------- UI ----------
  let searchInputEl = null;
  let countEl = null;
  let tableBodyEl = null;

  function ensureStyles() {
    if (document.getElementById("p7-style")) return;
    const css = `
    .p7-wrapper{
      max-width:1120px;
      margin:0 auto 2rem;
      padding:1.2rem 0 2.4rem;
      font-family:"Mitr", system-ui, -apple-system, "Segoe UI", sans-serif;
    }
    .p7-card{
      background:linear-gradient(135deg,#f9f5ff,#fdf4ff);
      border-radius:22px;
      box-shadow:0 18px 40px rgba(88,28,135,0.12);
      border:1px solid rgba(168,85,247,0.25);
      padding:1rem 1.2rem 1.4rem;
      margin-bottom:1.2rem;
    }
    .p7-card-save{
      background:linear-gradient(135deg,#fefce8,#faf5ff);
      border-color:rgba(234,179,8,0.55);
    }
    .p7-save-title{
      font-size:1.05rem;
      font-weight:600;
      color:#92400e;
      margin:0 0 .15rem;
    }
    .p7-save-desc{
      margin:0 0 .6rem;
      font-size:.85rem;
      color:#6b7280;
    }
    .p7-save-btn{
      border:none;
      border-radius:999px;
      padding:.45rem 1rem;
      font-size:.9rem;
      font-weight:600;
      cursor:pointer;
      background:linear-gradient(135deg,#facc15,#f97316);
      color:#78350f;
      box-shadow:0 12px 25px rgba(251,191,36,0.4);
      display:inline-flex;
      align-items:center;
      gap:.35rem;
    }
    .p7-save-btn:hover{
      filter:brightness(1.03);
      transform:translateY(-1px);
    }

    .p7-card-header{
      display:flex;
      justify-content:space-between;
      align-items:flex-start;
      gap:1rem;
      margin-bottom:.6rem;
    }
    .p7-title{
      font-size:1.05rem;
      font-weight:600;
      color:#4c1d95;
      margin-bottom:.1rem;
    }
    .p7-subtitle{
      margin:0;
      font-size:.8rem;
      color:#6b7280;
    }
    .p7-count-pill{
      padding:.25rem .8rem;
      border-radius:999px;
      background:linear-gradient(120deg,#eef2ff,#f5f3ff);
      border:1px solid rgba(129,140,248,0.7);
      font-size:.8rem;
      font-weight:600;
      color:#4338ca;
      white-space:nowrap;
      align-self:center;
    }

    .p7-search-row{
      display:flex;
      gap:.6rem;
      margin:.3rem 0 .8rem;
      align-items:center;
      flex-wrap:wrap;
    }
    .p7-search-input{
      flex:1 1 220px;
      border-radius:999px;
      border:1px solid #e5e7eb;
      padding:.45rem .9rem;
      font-size:.85rem;
      outline:none;
      background:#f9fafb;
    }
    .p7-search-input:focus{
      border-color:#a855f7;
      box-shadow:0 0 0 1px rgba(168,85,247,0.35);
      background:#ffffff;
    }
    .p7-search-btn{
      border-radius:999px;
      border:none;
      padding:.4rem .9rem;
      font-size:.85rem;
      cursor:pointer;
      background:linear-gradient(135deg,#a855f7,#6366f1);
      color:white;
      display:flex;
      align-items:center;
      gap:.25rem;
      box-shadow:0 10px 25px rgba(129,140,248,0.4);
      white-space:nowrap;
    }

    .p7-table-wrapper{
      border-radius:18px;
      background:#fdfcff;
      border:1px solid rgba(216,180,254,0.75);
      overflow:hidden;
    }
    table.p7-table{
      width:100%;
      border-collapse:separate;
      border-spacing:0;
      font-size:.85rem;
    }
    .p7-table thead{
      background:linear-gradient(90deg,#f5f3ff,#fef9ff);
    }
    .p7-table th,
    .p7-table td{
      padding:.55rem 1rem;
      text-align:left;
    }
    .p7-table th{
      font-size:.8rem;
      font-weight:600;
      color:#6b21a8;
      border-bottom:1px solid rgba(216,180,254,0.75);
      white-space:nowrap;
    }
    .p7-table td{
      color:#374151;
      vertical-align:middle;
    }
    .p7-row{
      background:linear-gradient(90deg,#faf5ff,#fdf4ff);
    }
    .p7-row:not(:last-child) td{
      border-bottom:1px solid rgba(237,233,254,0.9);
    }
    .p7-date-cell{
      display:flex;
      align-items:center;
      gap:.45rem;
      white-space:nowrap;
    }
    .p7-dot{
      width:8px;
      height:8px;
      border-radius:999px;
      background:#22c55e;
      box-shadow:0 0 0 4px rgba(34,197,94,0.15);
    }
    .p7-hn-cell{
      white-space:nowrap;
      color:#4b5563;
    }
    .p7-name-cell{
      min-width:140px;
    }
    .p7-adr-main{
      font-weight:600;
      color:#1d4ed8;
      white-space:nowrap;
    }
    .p7-actions{
      display:flex;
      gap:.4rem;
      justify-content:flex-end;
    }
    .p7-btn-view,
    .p7-btn-delete{
      border:none;
      border-radius:999px;
      padding:.28rem .8rem;
      font-size:.8rem;
      cursor:pointer;
      display:inline-flex;
      align-items:center;
      gap:.25rem;
      white-space:nowrap;
    }
    .p7-btn-view{
      background:rgba(79,70,229,0.08);
      color:#4c1d95;
    }
    .p7-btn-view:hover{
      background:rgba(79,70,229,0.16);
    }
    .p7-btn-delete{
      background:rgba(248,113,113,0.1);
      color:#b91c1c;
    }
    .p7-btn-delete:hover{
      background:rgba(248,113,113,0.18);
    }
    .p7-empty{
      text-align:center;
      padding:1.1rem .8rem;
      font-size:.85rem;
      color:#9ca3af;
    }

    @media (max-width: 900px){
      .p7-card{
        padding:.9rem .9rem 1.2rem;
      }
      .p7-name-cell{
        min-width:100px;
      }
      .p7-table th:nth-child(2),
      .p7-table td:nth-child(2){
        width:70px;
      }
    }
    `;
    const tag = document.createElement("style");
    tag.id = "p7-style";
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  // ---------- Rendering ----------
  function getFilteredCases() {
    const all = loadCases();
    if (!searchInputEl) return all;
    const q = searchInputEl.value.trim().toLowerCase();
    if (!q) return all;

    return all.filter((c) => {
      const { hn, name } = extractPatientFromData(c.data || {});
      const hnField = (c.hn || hn || "").toString().toLowerCase();
      const nameField = (c.name || name || "").toLowerCase();
      const adrField = buildAdrMainText(c).toLowerCase();
      return (
        hnField.includes(q) || nameField.includes(q) || adrField.includes(q)
      );
    });
  }

  function renderCaseTable() {
    if (!tableBodyEl || !countEl) return;
    const cases = getFilteredCases();

    countEl.textContent = cases.length.toString();

    if (!cases.length) {
      tableBodyEl.innerHTML =
        '<tr><td colspan="5" class="p7-empty">ยังไม่มีเคสที่บันทึกไว้ในระบบ</td></tr>';
      return;
    }

    const rowsHtml = cases
      .map((c) => {
        const data = c.data || {};
        const { hn, name } = extractPatientFromData(data);
        const displayHn = (c.hn || hn || "-").toString();
        const displayName = c.name || name || "-";
        const adrMain = buildAdrMainText(c);
        const dateText = formatDateTH(c.createdAt || c.date || "");

        return `
          <tr class="p7-row">
            <td>
              <div class="p7-date-cell">
                <span class="p7-dot"></span>
                <span>${dateText}</span>
              </div>
            </td>
            <td class="p7-hn-cell">${displayHn || "-"}</td>
            <td class="p7-name-cell">${displayName || "-"}</td>
            <td><span class="p7-adr-main">${adrMain}</span></td>
            <td>
              <div class="p7-actions">
                <button type="button" class="p7-btn-view" data-id="${c.id}">
                  👁️ ดู/แก้ไข
                </button>
                <button type="button" class="p7-btn-delete" data-id="${c.id}">
                  🗑 ลบ
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    tableBodyEl.innerHTML = rowsHtml;

    // bind events
    tableBodyEl.querySelectorAll(".p7-btn-view").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        loadCaseById(id);
      });
    });
    tableBodyEl.querySelectorAll(".p7-btn-delete").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        deleteCaseById(id);
      });
    });
  }

  function renderPage7() {
    const root = document.getElementById("page7");
    if (!root) return;

    ensureStyles();

    root.innerHTML = `
      <div class="p7-wrapper">
        <div class="p7-card p7-card-save">
          <p class="p7-save-title">บันทึกเคสจากข้อมูลหน้า 1–6</p>
          <p class="p7-save-desc">
            กดปุ่มด้านล่างเพื่อเก็บข้อมูลผู้ป่วยและผลประเมินปัจจุบันเป็นเคสใหม่
            สามารถเรียกกลับมาแก้ไขหรือดูย้อนหลังได้จากรายการเคสด้านล่าง
          </p>
          <button type="button" id="p7SaveBtn" class="p7-save-btn">
            💾 บันทึกข้อมูลเป็นเคสใหม่
          </button>
        </div>

        <div class="p7-card">
          <div class="p7-card-header">
            <div>
              <div class="p7-title">ผลการค้นหาเคส</div>
              <p class="p7-subtitle">
                เลือกเคสเพื่อโหลดข้อมูลเดิมขึ้นมาแสดงบนหน้า 1–6 หรือแก้ไขข้อมูลเพิ่มเติม
              </p>
            </div>
            <div class="p7-count-pill"><span id="p7CaseCount">0</span> เคส</div>
          </div>

          <div class="p7-search-row">
            <input id="p7SearchInput" class="p7-search-input" type="text"
              placeholder="ค้นหาด้วย HN หรือ ชื่อ-สกุล หรือชื่อ ADR" />
            <button type="button" id="p7SearchBtn" class="p7-search-btn">
              🔍 ค้นหา
            </button>
          </div>

          <div class="p7-table-wrapper">
            <table class="p7-table">
              <thead>
                <tr>
                  <th>วันที่บันทึก</th>
                  <th>HN</th>
                  <th>ชื่อ–สกุล</th>
                  <th>ชนิด ADR หลัก</th>
                  <th>การดำเนินการ</th>
                </tr>
              </thead>
              <tbody id="p7TableBody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    searchInputEl = document.getElementById("p7SearchInput");
    countEl = document.getElementById("p7CaseCount");
    tableBodyEl = document.getElementById("p7TableBody");

    const saveBtn = document.getElementById("p7SaveBtn");
    const searchBtn = document.getElementById("p7SearchBtn");

    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        saveCurrentCase();
      });
    }
    if (searchInputEl) {
      searchInputEl.addEventListener("input", () => renderCaseTable());
    }
    if (searchBtn) {
      searchBtn.addEventListener("click", () => renderCaseTable());
    }

    renderCaseTable();
  }

  // ---------- Export ----------
  window.renderPage7 = renderPage7;

  // ให้หน้าอื่นเรียกใช้ได้ถ้าต้องการ
  window.daCaseStore = {
    saveCurrentCase,
    loadCaseById,
    deleteCaseById,
    listCases: loadCases,
  };
})();

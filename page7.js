// ===================== page7.js — หน้า 7 รายงานเคส =====================
(function () {
  const STORAGE_KEY = "drugAllergyCases_v1";

  // --------------------- UTIL: LocalStorage ---------------------
  function loadCases() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      // เรียงจากใหม่ -> เก่า
      return arr.sort((a, b) => {
        const ta = new Date(a.createdAt || a.date || 0).getTime();
        const tb = new Date(b.createdAt || b.date || 0).getTime();
        return tb - ta;
      });
    } catch (e) {
      console.warn("loadCases error", e);
      return [];
    }
  }

  function saveCases(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list || []));
    } catch (e) {
      console.warn("saveCases error", e);
    }
  }

  function fmtDateTH(str) {
    if (!str) return "—";
    let d;
    try {
      if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
        d = new Date(str);
      } else {
        d = new Date(str);
      }
    } catch {
      d = null;
    }
    return d && !isNaN(d.getTime())
      ? d.toLocaleDateString("th-TH", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : str;
  }

  function extractPatientInfo() {
    const d = window.drugAllergyData || {};
    const p1 = d.page1 || {};

    let name =
      (p1.patientName ||
        p1.name ||
        (p1.patient && p1.patient.name) ||
        (d.patient && d.patient.name) ||
        "") + "";
    let hn =
      (p1.hn ||
        p1.patientHN ||
        (p1.patient && p1.patient.hn) ||
        (d.patient && d.patient.hn) ||
        "") + "";

    name = name.trim();
    hn = hn.trim();
    return { name, hn };
  }

  function getTopAdrLabelFromBrain() {
    const brain = window.brainResult;
    if (!brain || !brain.results) return "";
    const arr = Object.values(brain.results);
    if (!arr.length) return "";
    const sorted = arr
      .slice()
      .sort((a, b) => (b.percent || 0) - (a.percent || 0));
    const top = sorted[0];
    if (!top || !top.label) return "";
    if (!Number.isFinite(top.percent) || top.percent <= 0) return top.label;
    return top.label + ` (${top.percent.toFixed(1).replace(/\.0$/, "")}%)`;
  }

  // --------------------- RENDER UI ---------------------
  let initialized = false;

  function injectStyles() {
    if (document.getElementById("p7-style")) return;
    const css = `
      .p7-wrapper{
        padding:12px 4px 24px;
        display:flex;
        flex-direction:column;
        gap:16px;
      }
      .p7-card{
        border-radius:18px;
        background:#ffffff;
        border:1px solid #e5e7eb;
        box-shadow:0 12px 35px rgba(148,163,184,0.25);
        padding:16px 18px;
      }
      .p7-search-card{
        background:linear-gradient(135deg,#f5f3ff,#eef2ff);
        border:1px solid #e0e7ff;
      }
      .p7-search-head{
        display:flex;
        align-items:center;
        gap:10px;
        margin-bottom:10px;
      }
      .p7-search-icon{
        width:34px;
        height:34px;
        border-radius:999px;
        background:radial-gradient(circle at 30% 20%,#f9a8ff,#a855f7);
        display:flex;
        align-items:center;
        justify-content:center;
        color:#fdf2ff;
        box-shadow:0 8px 20px rgba(147,51,234,0.4);
        font-size:18px;
      }
      .p7-search-title{
        font-weight:800;
        font-size:1.05rem;
        color:#4c1d95;
      }
      .p7-search-sub{
        font-size:.85rem;
        color:#6b21a8;
      }
      .p7-search-row{
        margin-top:8px;
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        align-items:center;
      }
      .p7-input{
        flex:1 1 260px;
        min-width:220px;
        border-radius:999px;
        border:1px solid #e5e7eb;
        padding:8px 14px;
        font-size:.9rem;
        outline:none;
        background:#fff;
        box-shadow:0 4px 12px rgba(129,140,248,0.15);
      }
      .p7-input:focus{
        border-color:#a855f7;
        box-shadow:0 0 0 3px rgba(168,85,247,0.35);
      }
      .p7-btn-search{
        border-radius:999px;
        border:none;
        padding:8px 16px;
        font-size:.9rem;
        font-weight:700;
        cursor:pointer;
        display:inline-flex;
        align-items:center;
        gap:6px;
        color:#fdfcff;
        background:linear-gradient(90deg,#8b5cf6,#ec4899);
        box-shadow:0 10px 25px rgba(129,140,248,0.55);
        transition:transform .08s ease, box-shadow .08s ease, opacity .1s ease;
      }
      .p7-btn-search:hover{
        transform:translateY(-1px);
        box-shadow:0 12px 30px rgba(129,140,248,0.7);
        opacity:.96;
      }
      .p7-btn-search:active{
        transform:translateY(0);
        box-shadow:0 6px 18px rgba(129,140,248,0.55);
      }
      .p7-result-header{
        display:flex;
        justify-content:space-between;
        align-items:flex-end;
        gap:8px;
        margin-bottom:8px;
      }
      .p7-result-title{
        font-size:1.02rem;
        font-weight:800;
        color:#111827;
      }
      .p7-result-sub{
        font-size:.85rem;
        color:#6b7280;
      }
      .p7-badge-count{
        padding:3px 8px;
        border-radius:999px;
        background:rgba(129,140,248,0.1);
        color:#4338ca;
        font-size:.78rem;
        font-weight:700;
        border:1px solid rgba(129,140,248,0.35);
      }
      .p7-table-wrapper{
        margin-top:6px;
        border-radius:14px;
        overflow:hidden;
        border:1px solid #e5e7eb;
      }
      .p7-table{
        width:100%;
        border-collapse:collapse;
        font-size:.87rem;
      }
      .p7-table thead{
        background:linear-gradient(90deg,#ede9fe,#fdf2ff);
      }
      .p7-table th,
      .p7-table td{
        padding:8px 10px;
        text-align:left;
        border-bottom:1px solid #f3f4f6;
        white-space:nowrap;
      }
      .p7-table th{
        font-weight:700;
        font-size:.8rem;
        color:#4c1d95;
      }
      .p7-table tbody tr:nth-child(even){
        background:#faf5ff;
      }
      .p7-table tbody tr:hover{
        background:#eef2ff;
      }
      .p7-col-date{width:110px;}
      .p7-col-hn{width:90px;}
      .p7-col-name{min-width:160px;}
      .p7-col-adr{min-width:180px;}
      .p7-col-actions{width:130px;}
      .p7-tag-date{
        display:inline-flex;
        align-items:center;
        gap:4px;
        border-radius:999px;
        padding:2px 8px;
        background:#eef2ff;
        font-size:.78rem;
        color:#4c1d95;
        font-weight:600;
      }
      .p7-tag-dot{
        width:6px;height:6px;border-radius:999px;
        background:#6366f1;
      }
      .p7-empty-row td{
        padding:14px 10px;
        text-align:center;
        color:#9ca3af;
        font-size:.85rem;
      }

      .p7-btn-mini{
        border-radius:999px;
        border:none;
        padding:4px 10px;
        font-size:.78rem;
        font-weight:700;
        cursor:pointer;
        display:inline-flex;
        align-items:center;
        gap:4px;
        transition:background .08s ease, box-shadow .08s ease, transform .06s ease, opacity .08s ease;
        white-space:nowrap;
      }
      .p7-btn-view{
        background:rgba(129,140,248,0.1);
        color:#4338ca;
        box-shadow:0 4px 10px rgba(129,140,248,0.25);
      }
      .p7-btn-view:hover{
        background:rgba(129,140,248,0.18);
        transform:translateY(-0.5px);
      }
      .p7-btn-delete{
        background:rgba(248,113,113,0.12);
        color:#b91c1c;
        box-shadow:0 4px 10px rgba(248,113,113,0.25);
      }
      .p7-btn-delete:hover{
        background:rgba(248,113,113,0.2);
        transform:translateY(-0.5px);
      }
      .p7-action-group{
        display:flex;
        gap:6px;
        flex-wrap:wrap;
      }

      @media (max-width: 720px){
        .p7-result-header{
          flex-direction:column;
          align-items:flex-start;
        }
        .p7-col-adr{display:none;}
      }
    `;
    const tag = document.createElement("style");
    tag.id = "p7-style";
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  function buildStaticLayout(root) {
    root.innerHTML = `
      <div class="p7-wrapper">
        <div class="p7-card p7-search-card">
          <div class="p7-search-head">
            <div class="p7-search-icon">📁</div>
            <div>
              <div class="p7-search-title">ค้นหารายงานเคส</div>
              <div class="p7-search-sub">
                พิมพ์ <strong>HN</strong> หรือ <strong>ชื่อ-สกุล</strong> ของผู้ป่วย เพื่อดึงข้อมูลที่เคยกรอกในหน้า 1–6 กลับมาแก้ไขได้
              </div>
            </div>
          </div>
          <div class="p7-search-row">
            <input id="p7SearchInput" class="p7-input" placeholder="ค้นหาด้วย HN หรือ ชื่อ-สกุล" />
            <button id="p7SearchBtn" class="p7-btn-search">
              <span>🔍</span><span>ค้นหา</span>
            </button>
          </div>
        </div>

        <div class="p7-card">
          <div class="p7-result-header">
            <div>
              <div class="p7-result-title">ผลการค้นหาเคส</div>
              <div class="p7-result-sub">เลือกเคสเพื่อโหลดข้อมูลเดิมขึ้นมาแสดงที่หน้า 1–6 หรือกดลบหากต้องการล้างเคสออกจากระบบ</div>
            </div>
            <div id="p7CountBadge" class="p7-badge-count">0 เคส</div>
          </div>

          <div class="p7-table-wrapper">
            <table class="p7-table">
              <thead>
                <tr>
                  <th class="p7-col-date">วันที่บันทึก</th>
                  <th class="p7-col-hn">HN</th>
                  <th class="p7-col-name">ชื่อ-สกุล</th>
                  <th class="p7-col-adr">ชนิด ADR หลัก</th>
                  <th class="p7-col-actions">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody id="p7TableBody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const input = document.getElementById("p7SearchInput");
    const btn = document.getElementById("p7SearchBtn");
    const tbody = document.getElementById("p7TableBody");

    if (btn && input) {
      btn.addEventListener("click", () => {
        renderTable(input.value || "");
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          renderTable(input.value || "");
        }
      });
    }

    if (tbody) {
      tbody.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        const id = btn.getAttribute("data-id");
        if (!id) return;

        if (btn.classList.contains("p7-btn-view")) {
          handleViewCase(id);
        } else if (btn.classList.contains("p7-btn-delete")) {
          handleDeleteCase(id);
        }
      });
    }
  }

  function renderTable(keyword) {
    const tbody = document.getElementById("p7TableBody");
    const badge = document.getElementById("p7CountBadge");
    if (!tbody) return;

    const kw = (keyword || "").toLowerCase().trim();
    const allCases = loadCases();
    const cases = allCases.filter((c) => {
      if (!kw) return true;
      const hn = (c.hn || "").toLowerCase();
      const name = (c.name || "").toLowerCase();
      return hn.includes(kw) || name.includes(kw);
    });

    if (badge) {
      badge.textContent = `${cases.length} เคส`;
    }

    if (!cases.length) {
      tbody.innerHTML = `
        <tr class="p7-empty-row">
          <td colspan="5">ยังไม่มีเคสที่บันทึกไว้ หรือไม่พบเคสตามคำค้น</td>
        </tr>
      `;
      return;
    }

    const rows = cases
      .map((c) => {
        const dateStr = fmtDateTH(c.displayDate || c.createdAt);
        const hn = c.hn || "—";
        const name = c.name || "ไม่ระบุชื่อ";
        const adr =
          c.mainAdr ||
          c.mainAdrLabel ||
          (c.brain && c.brain.topLabel) ||
          "—";

        return `
          <tr>
            <td class="p7-col-date">
              <span class="p7-tag-date">
                <span class="p7-tag-dot"></span>
                <span>${dateStr}</span>
              </span>
            </td>
            <td class="p7-col-hn">${hn}</td>
            <td class="p7-col-name">${name}</td>
            <td class="p7-col-adr">${adr}</td>
            <td class="p7-col-actions">
              <div class="p7-action-group">
                <button class="p7-btn-mini p7-btn-view" data-id="${c.id}">
                  👁️ ดู/แก้ไข
                </button>
                <button class="p7-btn-mini p7-btn-delete" data-id="${c.id}">
                  🗑️ ลบ
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    tbody.innerHTML = rows;
  }

  // --------------------- EVENT HANDLERS ---------------------
  function handleViewCase(id) {
    const cases = loadCases();
    const found = cases.find((c) => c.id === id);
    if (!found) {
      alert("ไม่พบข้อมูลเคสในระบบ");
      return;
    }

    // 🔧 แก้จุดนี้: ใช้ object เดิมของ window.drugAllergyData แล้วลบ/ใส่ค่าใหม่
    const srcData = found.data || {};
    const clonedData = JSON.parse(JSON.stringify(srcData));

    const target =
      (window.drugAllergyData && typeof window.drugAllergyData === "object"
        ? window.drugAllergyData
        : {});

    // ลบ key เดิมทั้งหมดออกจาก object เดิม
    Object.keys(target).forEach((k) => {
      delete target[k];
    });
    // ใส่ข้อมูลใหม่จากเคสที่เลือก (clone แล้ว)
    Object.keys(clonedData).forEach((k) => {
      target[k] = clonedData[k];
    });
    window.drugAllergyData = target;

    // แจ้งให้สมองกับหน้าอื่นรีเฟรช
    try {
      document.dispatchEvent(new CustomEvent("da:update"));
    } catch (e) {
      console.warn("dispatch da:update error", e);
    }

    alert(
      "โหลดข้อมูลเคสเรียบร้อยแล้ว\nระบบจะแสดงข้อมูลเดิมในหน้า 1–6 คุณสามารถแก้ไขและบันทึกทับได้"
    );

    // เด้งไปหน้า 1 เพื่อเริ่มดู/แก้ไข
    const tab1 = document.querySelector('.tabs button[data-target="page1"]');
    if (tab1) tab1.click();
  }

  function handleDeleteCase(id) {
    if (!confirm("ยืนยันการลบเคสนี้ออกจากรายการหรือไม่?")) return;
    const allCases = loadCases();
    const remain = allCases.filter((c) => c.id !== id);
    saveCases(remain);
    renderTable(document.getElementById("p7SearchInput")?.value || "");
  }

  // --------------------- PUBLIC RENDER ---------------------
  function renderPage7() {
    const root = document.getElementById("p7Root");
    if (!root) return;

    injectStyles();
    if (!initialized) {
      initialized = true;
      buildStaticLayout(root);
    }
    renderTable(document.getElementById("p7SearchInput")?.value || "");
  }

  // --------------------- SAVE CASE & GO (เรียกจากหน้า 6) ---------------------
  function p7SaveCaseAndGo() {
    const d = window.drugAllergyData || {};
    const { name, hn } = extractPatientInfo();

    if (!name && !hn) {
      alert("กรุณากรอกชื่อหรือ HN ผู้ป่วยในหน้า 1 ก่อนบันทึกเคส");
      const tab1 = document.querySelector('.tabs button[data-target="page1"]');
      if (tab1) tab1.click();
      return;
    }

    const now = new Date();
    const id =
      "C" +
      now.getTime().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 8);

    const topAdr = getTopAdrLabelFromBrain();

    const newCase = {
      id,
      createdAt: now.toISOString(),
      displayDate: now.toISOString().slice(0, 10),
      name: name || "ไม่ระบุชื่อ",
      hn: hn || "",
      mainAdr: topAdr || "",
      data: JSON.parse(JSON.stringify(d)),
    };

    const list = loadCases();
    list.push(newCase);
    saveCases(list);

    alert("บันทึกเคสเรียบร้อยแล้ว และนำไปยังหน้า 7 รายงานเคส");

    // เปิดแท็บหน้า 7
    const tab7 = document.querySelector('.tabs button[data-target="page7"]');
    if (tab7) tab7.click();
    else {
      // ถ้ายังไม่มีแท็บหน้า 7 ก็อย่างน้อยให้ render หน้า 7 ถ้ามี container
      renderPage7();
    }
  }

  // export
  window.renderPage7 = renderPage7;
  window.p7SaveCaseAndGo = p7SaveCaseAndGo;
})();

// ===================== page7.js (REPLACE WHOLE FILE) =====================
// หน้า 7: รายงานเคส / ค้นหาเคสที่บันทึกไว้ และโหลดกลับมาแก้ไขได้หลายรอบไม่หาย

(function () {
  if (window.__p7Bound) return;
  window.__p7Bound = true;

  const STORAGE_KEY = "drugAllergyCases_v1";
  const CURRENT_ID_KEY = "__drugAllergyCurrentCaseId";

  // ---------- Utils ----------
  function deepClone(obj) {
    return obj ? JSON.parse(JSON.stringify(obj)) : obj;
  }

  function loadCases() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("loadCases error", e);
      return [];
    }
  }

  function saveCases(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error("saveCases error", e);
    }
  }

  function setCurrentCaseId(id) {
    try {
      if (id) localStorage.setItem(CURRENT_ID_KEY, id);
      else localStorage.removeItem(CURRENT_ID_KEY);
    } catch {}
  }

  function getCurrentCaseId() {
    try {
      return localStorage.getItem(CURRENT_ID_KEY) || null;
    } catch {
      return null;
    }
  }

  function fmtDateTH(strOrDate) {
    if (!strOrDate) return "—";
    let d = strOrDate instanceof Date ? strOrDate : new Date(strOrDate);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function extractPatientInfo(data) {
    // พยายามดึง HN / ชื่อ จากหลายโครงสร้างที่เป็นไปได้
    let hn = "";
    let name = "";

    if (data?.page1?.patient) {
      hn = data.page1.patient.hn || data.page1.patient.HN || hn;
      name =
        data.page1.patient.name ||
        data.page1.patient.fullName ||
        data.page1.patient.patientName ||
        name;
    }

    if (!hn && data?.patient) {
      hn = data.patient.hn || data.patient.HN || hn;
    }
    if (!name && data?.patient) {
      name =
        data.patient.name ||
        data.patient.fullName ||
        data.patient.patientName ||
        name;
    }

    return {
      hn: hn || "-",
      name: name || "-",
    };
  }

  function extractTopAdr(brainResult) {
    if (!brainResult || !brainResult.results) return { label: "-", percent: 0 };
    const arr = Object.values(brainResult.results);
    if (!arr.length) return { label: "-", percent: 0 };
    const sorted = arr
      .slice()
      .sort((a, b) => (b.percent || 0) - (a.percent || 0));
    const top = sorted[0] || {};
    const pct = Number.isFinite(top.percent) ? top.percent : 0;
    return {
      label: top.label || "-",
      percent: pct,
    };
  }

  // ---------- สร้างเคสจากข้อมูลหน้า 1–6 แล้วเก็บลง localStorage ----------
  function buildCaseFromCurrentData(existingId) {
    const data = deepClone(window.drugAllergyData || {});
    const brain = deepClone(window.brainResult || null);
    const { hn, name } = extractPatientInfo(data);
    const { label: adrLabel, percent } = extractTopAdr(brain);

    const now = new Date();
    return {
      id: existingId || "case_" + now.getTime() + "_" + Math.random().toString(36).slice(2),
      createdAt: now.toISOString(),
      hn,
      name,
      mainAdrLabel: adrLabel,
      mainAdrPercent: percent,
      snapshot: data,      // ❗ deepClone แล้ว
      brainSnapshot: brain // deepClone แล้ว
    };
  }

  function saveCurrentCaseAndGoToPage7() {
    const d = window.drugAllergyData || {};
    // ถ้ายังไม่มีข้อมูลเลย ไม่ให้เซฟ
    if (!d.page1 && !d.page2 && !d.page3 && !d.page4 && !d.page5 && !d.page6) {
      alert("ยังไม่มีข้อมูลเคส กรุณากรอกข้อมูลก่อน");
      return;
    }

    const currentId = getCurrentCaseId();
    const newCase = buildCaseFromCurrentData(currentId || undefined);

    const cases = loadCases();
    const idx = cases.findIndex((c) => c.id === newCase.id);
    if (idx >= 0) {
      cases[idx] = newCase; // แก้เคสเดิม
    } else {
      cases.unshift(newCase); // เติมเคสใหม่ด้านบน
    }
    saveCases(cases);
    setCurrentCaseId(newCase.id);

    alert("บันทึกเคสเรียบร้อยแล้ว");
    if (typeof window.showPage === "function") {
      window.showPage("page7");
    }
    if (typeof window.renderPage7 === "function") {
      window.renderPage7();
    }
  }

  // ---------- โหลดเคสกลับเข้า app เพื่อดู/แก้ไข ----------
  function loadCaseIntoApp(caseId) {
    const cases = loadCases();
    const found = cases.find((c) => c.id === caseId);
    if (!found) {
      alert("ไม่พบข้อมูลเคสนี้แล้ว");
      return;
    }

    // clone ออกมาก่อน ไม่แก้ object ใน storage ตรง ๆ
    window.drugAllergyData = deepClone(found.snapshot || {});
    window.brainResult = deepClone(found.brainSnapshot || null);
    setCurrentCaseId(found.id);

    // render หน้า 1–6 ใหม่จากข้อมูล
    if (typeof window.renderPage1 === "function") window.renderPage1();
    if (typeof window.renderPage2 === "function") window.renderPage2();
    if (typeof window.renderPage3 === "function") window.renderPage3();
    if (typeof window.renderPage4 === "function") window.renderPage4();
    if (typeof window.renderPage5 === "function") window.renderPage5();
    if (typeof window.renderPage6 === "function") window.renderPage6();

    if (typeof window.showPage === "function") {
      window.showPage("page1");
    }
  }

  // ---------- ลบเคส ----------
  function deleteCase(caseId) {
    const cases = loadCases();
    const found = cases.find((c) => c.id === caseId);
    if (!found) return;
    if (!confirm(`ต้องการลบเคสของผู้ป่วย HN ${found.hn} (${found.name}) ใช่หรือไม่?`))
      return;
    const newList = cases.filter((c) => c.id !== caseId);
    saveCases(newList);
    const cur = getCurrentCaseId();
    if (cur === caseId) setCurrentCaseId(null);
    renderPage7();
  }

  // ---------- Render UI ----------
  function injectStyles() {
    if (document.getElementById("p7-style")) return;
    const css = `
      .p7-wrapper{
        max-width:1120px;
        margin:0 auto;
        padding:18px 12px 40px;
        font-family:'Mitr', system-ui, -apple-system, 'Segoe UI', sans-serif;
      }
      .p7-card{
        background:linear-gradient(135deg,rgba(250,249,255,0.98),rgba(237,233,255,0.96));
        border-radius:20px;
        padding:18px 18px 20px;
        box-shadow:0 16px 40px rgba(79,70,229,0.12);
        border:1px solid rgba(129,140,248,0.5);
      }
      .p7-title-row{
        display:flex;
        justify-content:space-between;
        align-items:flex-end;
        gap:12px;
        margin-bottom:14px;
      }
      .p7-title{
        font-size:1.15rem;
        font-weight:700;
        color:#312e81;
        display:flex;
        align-items:center;
        gap:8px;
      }
      .p7-title-badge{
        font-size:.8rem;
        padding:2px 8px;
        border-radius:999px;
        background:rgba(129,140,248,0.16);
        color:#3730a3;
      }
      .p7-count-badge{
        font-size:.8rem;
        padding:3px 9px;
        border-radius:999px;
        background:#eef2ff;
        color:#4338ca;
        font-weight:600;
      }
      .p7-search-box{
        margin-bottom:12px;
        display:flex;
        gap:8px;
        align-items:center;
      }
      .p7-search-input{
        flex:1 1 auto;
        border-radius:999px;
        border:1px solid #e0e7ff;
        padding:8px 14px;
        font-size:.9rem;
        outline:none;
        background:#f9fafb;
      }
      .p7-search-input:focus{
        border-color:#6366f1;
        box-shadow:0 0 0 1px rgba(99,102,241,0.4);
        background:#ffffff;
      }
      .p7-search-icon{
        width:30px;
        height:30px;
        border-radius:999px;
        display:flex;
        align-items:center;
        justify-content:center;
        background:radial-gradient(circle at 0 0,#f472b6,#6366f1);
        color:#fff;
        font-size:14px;
      }

      .p7-table{
        width:100%;
        border-collapse:separate;
        border-spacing:0;
        font-size:.86rem;
        background:#fff;
        border-radius:16px;
        overflow:hidden;
        box-shadow:0 6px 18px rgba(15,23,42,0.06);
      }
      .p7-table thead{
        background:linear-gradient(90deg,#f5f3ff,#eef2ff);
      }
      .p7-table th,
      .p7-table td{
        padding:8px 10px;
        text-align:left;
      }
      .p7-table th{
        font-weight:600;
        color:#4c1d95;
        border-bottom:1px solid #e5e7eb;
        font-size:.82rem;
      }
      .p7-table tbody tr:nth-child(even){
        background:#f9fafb;
      }
      .p7-table tbody tr:hover{
        background:#eef2ff;
      }
      .p7-date-dot{
        display:inline-flex;
        align-items:center;
        gap:6px;
        font-weight:500;
        color:#111827;
      }
      .p7-date-dot span.dot{
        width:8px;
        height:8px;
        border-radius:999px;
        background:radial-gradient(circle at 0 0,#22c55e,#16a34a);
        box-shadow:0 0 0 3px rgba(34,197,94,0.25);
      }
      .p7-adr-main{
        font-weight:600;
        color:#4c1d95;
      }
      .p7-adr-sub{
        font-size:.78rem;
        color:#6b7280;
      }

      .p7-actions{
        display:flex;
        gap:6px;
        justify-content:flex-end;
      }
      .p7-btn-view,
      .p7-btn-del{
        border:none;
        border-radius:999px;
        padding:5px 10px;
        font-size:.8rem;
        cursor:pointer;
        display:inline-flex;
        align-items:center;
        gap:4px;
      }
      .p7-btn-view{
        background:rgba(129,140,248,0.18);
        color:#312e81;
      }
      .p7-btn-view:hover{
        background:rgba(129,140,248,0.32);
      }
      .p7-btn-del{
        background:rgba(248,113,113,0.1);
        color:#b91c1c;
      }
      .p7-btn-del:hover{
        background:rgba(248,113,113,0.22);
      }

      .p7-empty{
        padding:24px 12px;
        text-align:center;
        color:#6b7280;
        font-size:.88rem;
      }
    `;
    const tag = document.createElement("style");
    tag.id = "p7-style";
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  function renderTableRows(cases, keyword) {
    keyword = (keyword || "").trim().toLowerCase();
    const filtered = !keyword
      ? cases
      : cases.filter((c) => {
          return (
            c.hn.toLowerCase().includes(keyword) ||
            c.name.toLowerCase().includes(keyword)
          );
        });

    const tbody = document.getElementById("p7TableBody");
    const countEl = document.getElementById("p7CaseCount");
    if (countEl) countEl.textContent = filtered.length + " เคส";

    if (!tbody) return;
    if (!filtered.length) {
      tbody.innerHTML = `
        <tr><td colspan="5">
          <div class="p7-empty">ยังไม่มีเคสที่บันทึกไว้ หรือไม่พบเคสที่ตรงกับคำค้นหา</div>
        </td></tr>
      `;
      return;
    }

    tbody.innerHTML = filtered
      .map((c) => {
        const adrText =
          c.mainAdrLabel && Number.isFinite(c.mainAdrPercent)
            ? `${c.mainAdrLabel} (${c.mainAdrPercent.toFixed(0)}%)`
            : c.mainAdrLabel || "-";
        return `
          <tr>
            <td>
              <span class="p7-date-dot">
                <span class="dot"></span>
                ${fmtDateTH(c.createdAt)}
              </span>
            </td>
            <td>${c.hn || "-"}</td>
            <td>${c.name || "-"}</td>
            <td>
              <div class="p7-adr-main">${adrText}</div>
            </td>
            <td>
              <div class="p7-actions">
                <button class="p7-btn-view" data-id="${c.id}" type="button">
                  👁️ ดู/แก้ไข
                </button>
                <button class="p7-btn-del" data-id="${c.id}" type="button">
                  🗑 ลบ
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    // bind events
    tbody.querySelectorAll(".p7-btn-view").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        loadCaseIntoApp(id);
      });
    });
    tbody.querySelectorAll(".p7-btn-del").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        deleteCase(id);
      });
    });
  }

  function renderPage7() {
    injectStyles();
    const root = document.getElementById("page7");
    if (!root) return;

    const cases = loadCases();

    root.innerHTML = `
      <div class="p7-wrapper">
        <div class="p7-card">
          <div class="p7-title-row">
            <div class="p7-title">
              📁 ผลการค้นหาเคส
              <span class="p7-title-badge">เลือกเคสเพื่อโหลดข้อมูลเดิมขึ้นมาแสดงบนหน้า 1–6</span>
            </div>
            <span id="p7CaseCount" class="p7-count-badge">${cases.length} เคส</span>
          </div>

          <div class="p7-search-box">
            <input id="p7SearchInput" class="p7-search-input" placeholder="ค้นหาด้วย HN หรือ ชื่อ-สกุล" />
            <div class="p7-search-icon">🔍</div>
          </div>

          <table class="p7-table">
            <thead>
              <tr>
                <th style="width:140px;">วันที่บันทึก</th>
                <th style="width:90px;">HN</th>
                <th>ชื่อ-สกุล</th>
                <th style="width:260px;">ชนิด ADR หลัก</th>
                <th style="width:150px;text-align:right;">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody id="p7TableBody"></tbody>
          </table>
        </div>
      </div>
    `;

    const searchInput = document.getElementById("p7SearchInput");
    renderTableRows(cases, "");

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        renderTableRows(cases, searchInput.value || "");
      });
    }
  }

  // ---------- Public API ----------
  window.renderPage7 = renderPage7;

  // ฟังก์ชันสำหรับปุ่มในหน้า 6 (รองรับหลายชื่อเผื่อโค้ดเดิม)
  window.p7SaveCaseAndGoFromPage6 = saveCurrentCaseAndGoToPage7;
  window.p7SaveCaseAndGo = saveCurrentCaseAndGoToPage7;
  window.saveCaseAndGoToPage7 = saveCurrentCaseAndGoToPage7;
})();

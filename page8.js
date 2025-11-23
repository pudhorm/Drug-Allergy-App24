// ===================== page8.js — หน้า 8 ข้อมูลสถิติ =====================
(function () {
  const STORAGE_KEY = "drugAllergyCases_v1";

  // ลำดับ 21 ADR ให้เรียงเหมือนหน้าอื่น ๆ
  const ADR_ORDER = [
    "Urticaria",
    "Anaphylaxis",
    "Angioedema",
    "Maculopapular rash",
    "Fixed drug eruption",
    "AGEP",
    "SJS",
    "TEN",
    "DRESS",
    "Erythema multiforme",
    "Photosensitivity drug eruption",
    "Exfoliative dermatitis",
    "Eczematous drug eruption",
    "Bullous Drug Eruption",
    "Serum sickness",
    "Vasculitis",
    "Hemolytic anemia",
    "Pancytopenia",
    "Neutropenia",
    "Thrombocytopenia",
    "Nephritis"
  ];

  // ---------- util: ดึงเคสจาก localStorage (ใช้ร่วมกับหน้า 7) ----------
  function loadCases() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      console.warn("page8 loadCases error", e);
      return [];
    }
  }

  // mainAdr ที่เก็บในหน้า 7 จะมีพวก (25%) ต่อท้าย → แปลงให้เหลือชื่อสั้น ๆ
  function normalizeAdrLabel(label) {
    if (!label) return "";
    let t = String(label).trim();
    // ตัด (xx%) ทิ้ง
    t = t.replace(/\(.*?\)/g, "").trim();
    // จับคู่ด้วยชื่อใน ADR_ORDER แบบขึ้นต้นเหมือนกัน
    const lower = t.toLowerCase();
    for (let i = 0; i < ADR_ORDER.length; i++) {
      const name = ADR_ORDER[i];
      if (lower.startsWith(name.toLowerCase())) {
        return name;
      }
    }
    return t;
  }

  // ---------- ใส่ style เฉพาะของหน้า 8 ----------
  function ensureStyles() {
    if (document.getElementById("p8-style")) return;
    const css = [
      ".p8-wrapper{",
        "padding:18px 14px 26px;",
        "display:flex;",
        "flex-direction:column;",
        "gap:18px;",
      "}",
      ".p8-card{",
        "border-radius:20px;",
        "background:#ffffff;",
        "border:1px solid #e5e7eb;",
        "box-shadow:0 18px 40px rgba(148,163,184,0.35);",
        "padding:16px 18px 20px;",
      "}",
      ".p8-title{",
        "font-size:1.15rem;",
        "font-weight:800;",
        "color:#4c1d95;",
        "margin:0 0 4px;",
      "}",
      ".p8-sub{",
        "font-size:.88rem;",
        "color:#6b7280;",
        "margin:0 0 10px;",
      "}",
      ".p8-legend{",
        "display:flex;",
        "flex-wrap:wrap;",
        "gap:8px;",
        "margin-bottom:6px;",
        "font-size:.78rem;",
      "}",
      ".p8-legend-item{",
        "display:inline-flex;",
        "align-items:center;",
        "gap:6px;",
        "padding:3px 9px;",
        "border-radius:999px;",
        "background:#f9fafb;",
        "border:1px solid #e5e7eb;",
        "color:#4b5563;",
      "}",
      ".p8-dot{",
        "width:10px;height:10px;border-radius:999px;",
      "}",
      ".p8-chart{",
        "margin-top:6px;",
        "display:flex;",
        "flex-direction:column;",
        "gap:10px;",
      "}",
      ".p8-row{",
        "display:flex;",
        "align-items:center;",
        "gap:10px;",
      "}",
      ".p8-label{",
        "width:210px;",
        "min-width:210px;",
        "font-size:.84rem;",
        "color:#374151;",
        "white-space:nowrap;",
        "overflow:hidden;",
        "text-overflow:ellipsis;",
      "}",
      ".p8-bar-wrap{",
        "flex:1 1 auto;",
        "background:linear-gradient(90deg,#f9fafb,#f3e8ff);",
        "border-radius:999px;",
        "overflow:hidden;",
        "position:relative;",
        "height:36px;",
      "}",
      ".p8-bar{",
        "height:100%;",
        "border-radius:999px;",
        "position:relative;",
        "display:flex;",
        "align-items:center;",
        "padding-left:10px;",
        "font-size:.8rem;",
        "font-weight:600;",
        "color:#4b5563;",
        "cursor:default;",
        "transition:transform .08s ease, box-shadow .08s ease;",
      "}",
      ".p8-bar:hover{",
        "transform:translateY(-1px);",
        "box-shadow:0 8px 18px rgba(129,140,248,0.45);",
      "}",
      ".p8-bar::after{",
        "content:attr(data-tooltip);",
        "position:absolute;",
        "right:10px;",
        "top:50%;",
        "transform:translateY(-50%);",
        "font-size:.78rem;",
        "color:#111827;",
      "}",
      ".p8-empty{",
        "margin-top:8px;",
        "padding:14px 12px;",
        "border-radius:14px;",
        "background:#f9fafb;",
        "border:1px dashed #e5e7eb;",
        "font-size:.86rem;",
        "color:#6b7280;",
        "text-align:center;",
      "}",
      "@media(max-width:900px){",
        ".p8-label{width:160px;min-width:160px;}", 
      "}"
    ].join("");

    const tag = document.createElement("style");
    tag.id = "p8-style";
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  // พาเลตสีพาสเทลสำหรับแท่งกราฟ
  const BAR_COLORS = [
    "linear-gradient(90deg,#bfdbfe,#a5b4fc)",
    "linear-gradient(90deg,#fed7e2,#f9a8d4)",
    "linear-gradient(90deg,#bbf7d0,#6ee7b7)",
    "linear-gradient(90deg,#fee2e2,#fecaca)",
    "linear-gradient(90deg,#ddd6fe,#f5d0fe)",
    "linear-gradient(90deg,#bae6fd,#e0f2fe)",
    "linear-gradient(90deg,#fef9c3,#fee2b3)",
    "linear-gradient(90deg,#e0f2fe,#f5d0fe)",
  ];

  function pickColor(idx) {
    return BAR_COLORS[idx % BAR_COLORS.length];
  }

  // ---------- render ----------
  function renderPage8() {
    const root = document.getElementById("p8Root");
    if (!root) return;

    ensureStyles();

    const cases = loadCases();

    // นับจำนวนเคสต่อ ADR
    const counts = {};
    ADR_ORDER.forEach(name => { counts[name] = 0; });

    cases.forEach(c => {
      const raw = c.mainAdr || c.mainAdrLabel || (c.brain && c.brain.topLabel) || "";
      const norm = normalizeAdrLabel(raw);
      if (counts.hasOwnProperty(norm)) {
        counts[norm] += 1;
      }
    });

    const max = Math.max(
      1,
      ...ADR_ORDER.map(name => counts[name] || 0)
    );

    let rowsHtml = "";
    ADR_ORDER.forEach((name, idx) => {
      const value = counts[name] || 0;
      const percent = (value / max) * 100;
      const width = value === 0 ? 4 : Math.max(12, percent); // ให้แท่งสั้นสุดยังมองเห็น

      const tooltip = name + " — " + value + " เคส";

      rowsHtml += [
        '<div class="p8-row">',
          '<div class="p8-label">', name, "</div>",
          '<div class="p8-bar-wrap">',
            '<div class="p8-bar"',
              ' style="width:', width, '%; background:', pickColor(idx), ';"',
              ' data-tooltip="', tooltip, '">',
              value > 0 ? (value + " เคส") : "0 เคส",
            "</div>",
          "</div>",
        "</div>"
      ].join("");
    });

    const totalCases = cases.length;

    root.innerHTML = [
      '<div class="p8-wrapper">',
        '<div class="p8-card">',
          '<h2 class="p8-title">📊 หน้า 8 ข้อมูลสถิติ — ชนิด ADR หลัก</h2>',
          '<p class="p8-sub">',
            "สถิติจากเคสที่บันทึกในหน้า 7 รายงานเคส (รวมทั้งหมด ",
            totalCases,
            " เคส)",
          "</p>",
          '<div class="p8-legend">',
            '<span class="p8-legend-item"><span class="p8-dot" style="background:',
              BAR_COLORS[0],
            ';"></span> 1 แท่ง = 1 ชนิด ADR</span>',
            '<span class="p8-legend-item">เลื่อนเมาส์ไปที่แท่งกราฟเพื่อดูรายละเอียดจำนวนเคส</span>',
          "</div>",
          '<div class="p8-chart">',
            rowsHtml,
          "</div>",
          (totalCases === 0
            ? '<div class="p8-empty">ยังไม่มีเคสในระบบ กรุณาบันทึกเคสจากหน้า 6 และหน้า 7 ก่อน จึงจะเห็นกราฟสถิติ</div>'
            : ""),
        "</div>",
      "</div>"
    ].join("");
  }

  // export
  window.renderPage8 = renderPage8;
})();

// ====================== page8.js ======================
(function () {
  const STORAGE_KEY = "drugAllergyCases_v1";

  // --------- ดึงเคสจาก localStorage เดียวกับหน้า 7 ---------
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

  // ตัด % ออก เหลือแต่ชื่อ ADR
  function normalizeAdrName(label) {
    if (!label) return "";
    let s = String(label).trim();
    s = s.replace(/\s*\(.*/, ""); // ตัด "(25%)" ทิ้ง
    return s;
  }

  // เรียงชื่อ ADR 21 ตัวให้ตรงกับหน้าอื่น
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

  function computeStats() {
    const list = loadCases();
    const counts = {};
    ADR_ORDER.forEach((k) => (counts[k] = 0));

    list.forEach((c) => {
      const label = normalizeAdrName(
        c.mainAdr ||
          c.mainAdrLabel ||
          (c.brain && c.brain.topLabel) ||
          ""
      );
      if (!label) return;

      // ให้แมตช์แบบขึ้นต้นคำ ช่วยเวลา label ตามด้วย %
      const key = ADR_ORDER.find((k) =>
        label.toLowerCase().startsWith(k.toLowerCase())
      );
      if (!key) return;
      counts[key] += 1;
    });

    return { counts, totalCases: list.length };
  }

  // --------- render หน้า 8 ---------
  function renderPage8() {
    const root = document.getElementById("page8");
    if (!root) return;

    const stats = computeStats();
    const counts = stats.counts;
    const total = stats.totalCases;

    injectStyles();

    root.innerHTML = [
      '<div class="p8-wrapper">',
        '<div class="p8-header">',
          '<h2 class="p8-title">📊 หน้า 8 ข้อมูลสถิติ — ชนิด ADR หลัก</h2>',
          '<p class="p8-sub">สถิติจากเคสที่บันทึกในหน้า 7 รายงานเคส (รวมทั้งหมด ',
            total,
            " เคส)</p>",
        "</div>",
        '<div class="p8-chart" id="p8Chart"></div>',
        '<div id="p8Tooltip" class="p8-tooltip" aria-hidden="true"></div>',
      "</div>"
    ].join("");

    const chart = document.getElementById("p8Chart");

    // หา max เอาไป scale ความยาวแท่ง
    let max = 0;
    ADR_ORDER.forEach((k) => {
      if (counts[k] > max) max = counts[k];
    });
    if (max === 0) max = 1;

    ADR_ORDER.forEach((name, idx) => {
      const count = counts[name] || 0;
      const ratio = count > 0 ? count / max : 0;
      const widthPercent = count > 0 ? 10 + ratio * 80 : 0; // non-zero อย่างน้อย 10%

      const row = document.createElement("div");
      row.className = "p8-row";

      const label = document.createElement("div");
      label.className = "p8-row-label";
      label.textContent = name;

      const area = document.createElement("div");
      area.className = "p8-row-area";

      const bg = document.createElement("div");
      bg.className = "p8-row-bg";
      area.appendChild(bg);

      if (count > 0) {
        const bar = document.createElement("button");
        bar.type = "button";
        bar.className = "p8-bar p8-bar-" + (idx % 6);
        bar.style.width = widthPercent + "%";
        bar.setAttribute("data-name", name);
        bar.setAttribute("data-count", String(count));
        bar.textContent = name + " — " + count + " เคส";
        area.appendChild(bar);
      } else {
        const zero = document.createElement("div");
        zero.className = "p8-zero";
        zero.textContent = "0 เคส";
        area.appendChild(zero);
      }

      row.appendChild(label);
      row.appendChild(area);
      chart.appendChild(row);
    });

    setupTooltips();
  }

  // --------- CSS ของหน้า 8 (กราฟแท่งพาสเทล + tooltip) ---------
  function injectStyles() {
    if (document.getElementById("p8-style")) return;
    const css = [
      ".p8-wrapper{",
        "padding:18px 18px 32px;",
        "display:flex;",
        "flex-direction:column;",
        "gap:16px;",
      "}",
      ".p8-header{margin-bottom:4px;}",
      ".p8-title{",
        "margin:0;",
        "font-size:1.25rem;",
        "font-weight:800;",
        "color:#312e81;",
        "display:flex;",
        "align-items:center;",
        "gap:6px;",
      "}",
      ".p8-sub{",
        "margin:4px 0 0;",
        "font-size:.9rem;",
        "color:#4b5563;",
      "}",
      ".p8-chart{",
        "margin-top:10px;",
        "display:flex;",
        "flex-direction:column;",
        "gap:10px;",
      "}",
      ".p8-row{",
        "display:grid;",
        "grid-template-columns:minmax(120px,190px) 1fr;",
        "align-items:center;",
        "gap:10px;",
        "font-size:.9rem;",
      "}",
      ".p8-row-label{",
        "font-weight:600;",
        "color:#111827;",
      "}",
      ".p8-row-area{",
        "position:relative;",
        "height:34px;",
      "}",
      ".p8-row-bg{",
        "position:absolute;",
        "inset:0;",
        "border-radius:999px;",
        "background:linear-gradient(90deg,#faf5ff,#fdf2ff);",
        "opacity:.9;",
      "}",
      ".p8-bar{",
        "position:relative;",
        "z-index:1;",
        "height:100%;",
        "border:none;",
        "border-radius:999px;",
        "cursor:pointer;",
        "display:flex;",
        "align-items:center;",
        "justify-content:flex-end;",
        "padding:0 14px;",
        "font-size:.83rem;",
        "font-weight:600;",
        "color:#111827;",
        "white-space:nowrap;",
        "background:linear-gradient(90deg,#bfdbfe,#a5b4fc);",
        "box-shadow:0 10px 30px rgba(129,140,248,.45);",
        "transition:transform .12s ease,box-shadow .12s ease,opacity .12s ease;",
      "}",
      ".p8-bar:hover{",
        "transform:translateY(-1px);",
        "box-shadow:0 14px 36px rgba(129,140,248,.6);",
        "opacity:.98;",
      "}",
      ".p8-bar-1{",
        "background:linear-gradient(90deg,#fcd5ce,#fda4af);",
        "box-shadow:0 10px 30px rgba(248,113,113,.45);",
      "}",
      ".p8-bar-2{",
        "background:linear-gradient(90deg,#bbf7d0,#6ee7b7);",
        "box-shadow:0 10px 30px rgba(34,197,94,.4);",
      "}",
      ".p8-bar-3{",
        "background:linear-gradient(90deg,#fee2e2,#fed7aa);",
        "box-shadow:0 10px 30px rgba(248,171,104,.4);",
      "}",
      ".p8-bar-4{",
        "background:linear-gradient(90deg,#ddd6fe,#f9a8d4);",
        "box-shadow:0 10px 30px rgba(192,132,252,.45);",
      "}",
      ".p8-bar-5{",
        "background:linear-gradient(90deg,#bae6fd,#a7f3d0);",
        "box-shadow:0 10px 30px rgba(59,130,246,.35);",
      "}",
      ".p8-zero{",
        "position:relative;",
        "z-index:1;",
        "height:100%;",
        "display:flex;",
        "align-items:center;",
        "padding-left:12px;",
        "font-size:.8rem;",
        "color:#9ca3af;",
      "}",
      ".p8-tooltip{",
        "position:absolute;",
        "z-index:9999;",
        "pointer-events:none;",
        "padding:6px 10px;",
        "border-radius:999px;",
        "background:rgba(31,41,55,.94);",
        "color:#f9fafb;",
        "font-size:.78rem;",
        "box-shadow:0 10px 30px rgba(15,23,42,.55);",
        "opacity:0;",
        "transform:translateY(4px);",
        "transition:opacity .12s ease,transform .12s ease;",
      "}",
      ".p8-tooltip.show{",
        "opacity:1;",
        "transform:translateY(0);",
      "}",
      "@media (max-width:640px){",
        ".p8-row{grid-template-columns:minmax(80px,120px) 1fr;}",
        ".p8-row-area{height:32px;}",
        ".p8-bar{font-size:.78rem;padding:0 10px;}",
      "}"
    ].join("");

    const tag = document.createElement("style");
    tag.id = "p8-style";
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  // --------- tooltip เวลาเอาเมาส์ชี้แท่ง ---------
  function setupTooltips() {
    const tooltip = document.getElementById("p8Tooltip");
    if (!tooltip) return;

    function position(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2 + window.scrollX;
      const y = rect.top - 8 + window.scrollY;
      const tw = tooltip.offsetWidth;
      const th = tooltip.offsetHeight;

      let left = x - tw / 2;
      const minLeft = 8 + window.scrollX;
      const maxLeft =
        window.scrollX + document.documentElement.clientWidth - tw - 8;

      if (left < minLeft) left = minLeft;
      if (left > maxLeft) left = maxLeft;

      tooltip.style.left = left + "px";
      tooltip.style.top = y - th + "px";
    }

    function show(e) {
      const target = e.currentTarget;
      const name = target.getAttribute("data-name") || "";
      const count = target.getAttribute("data-count") || "0";
      tooltip.textContent = name + " — " + count + " เคส";
      tooltip.classList.add("show");
      position(e);
    }

    function hide() {
      tooltip.classList.remove("show");
    }

    document.querySelectorAll(".p8-bar").forEach((bar) => {
      bar.addEventListener("mouseenter", show);
      bar.addEventListener("mouseleave", hide);
      bar.addEventListener("mousemove", position);
      bar.addEventListener("focus", show);
      bar.addEventListener("blur", hide);
    });
  }

  // export
  window.renderPage8 = renderPage8;
})();

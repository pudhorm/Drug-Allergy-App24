// ====================== pageTypeADR.js (SAFE, no template literals) ======================
(function () {
  // สร้าง renderer ให้ router เรียกใช้
  window.renderPageTypeADR = function () {
    var root = document.getElementById("pageTypeADR");
    if (!root) return;

    root.innerHTML = [
      '<div class="pType-wrapper">',
        '<h2 class="pType-title">🧩 Type of ADR (Rawlins & Thompson)</h2>',
        '<div class="pType-grid">',
          cardHTML("A","Type A — dose-related (Augmented)","typeA"),
          cardHTML("B","Type B — non-dose-related (Bizarre)","typeB"),
          cardHTML("C","Type C — dose-related & time-related (Chronic)","typeC"),
          cardHTML("D","Type D — time-related (Delayed)","typeD"),
          cardHTML("E","Type E — withdrawal (End of use)","typeE"),
          cardHTML("F","Type F — unexpected failure of therapy (Failure)","typeF"),
        '</div>',
        '<div class="pType-actions">',
          '<button class="pType-confirm-btn" id="pTypeConfirm">กดยืนยันผล</button>',
        '</div>',
      '</div>'
    ].join("");

    // ถ้ายังไม่มี toast ในหน้า สร้างให้
    var toast = document.getElementById("pTypeToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "pTypeToast";
      toast.className = "pType-toast";
      toast.setAttribute("role", "alert");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }

    // ---------- hooks ----------
    var checkboxes = root.querySelectorAll('.pType-option input[type="checkbox"]');
    var confirmBtn = root.querySelector("#pTypeConfirm");

    var mapCodeToEls = {};
    Array.prototype.forEach.call(checkboxes, function (cb) {
      var code = cb.value;
      mapCodeToEls[code] = {
        input: cb,
        card: root.querySelector('.pType-card[data-code="' + code + '"]'),
        badge: root.querySelector('.pType-card[data-code="' + code + '"] .pType-badge')
      };
      cb.addEventListener("change", onChange);
    });

    // ── popover ข้อความสำหรับ A–F ───────────────────────────────
    var badgeA = mapCodeToEls["A"] && mapCodeToEls["A"].badge;
    var badgeB = mapCodeToEls["B"] && mapCodeToEls["B"].badge;
    var badgeC = mapCodeToEls["C"] && mapCodeToEls["C"].badge;
    var badgeD = mapCodeToEls["D"] && mapCodeToEls["D"].badge;
    var badgeE = mapCodeToEls["E"] && mapCodeToEls["E"].badge;
    var badgeF = mapCodeToEls["F"] && mapCodeToEls["F"].badge;

    if (badgeA) bindPopover(badgeA,
      '<h5>Type A — Augmented</h5>' +
      '<ul>' +
        '<li>สัมพันธ์กับฤทธิ์ทางเภสัชวิทยา (SE, drug overdose, drug–drug interaction)</li>' +
        '<li>ทำนายผลได้ / อัตราการเสียชีวิตต่ำ</li>' +
        '<li>ดีขึ้นเมื่อ "ลดขนาด/หยุดยา" (de-challenge)</li>' +
        '<li>เช่น bleeding จาก warfarin, digoxin toxicity</li>' +
      '</ul>'
    );

    if (badgeB) bindPopover(badgeB,
      '<h5>Type B — Bizarre</h5>' +
      '<ul>' +
        '<li>ไม่สัมพันธ์กับฤทธิ์ทางเภสัชวิทยา</li>' +
        '<li>ทำนายไม่ได้ / อัตราการเสียชีวิตสูง</li>' +
        '<li>เช่น Penicillin hypersensitivity, Pseudoallergy</li>' +
      '</ul>'
    );

    if (badgeC) bindPopover(badgeC,
      '<h5>Type C — Chronic</h5>' +
      '<ul>' +
        '<li>พบได้น้อย / เกี่ยวกับขนาดสะสมระยะยาว</li>' +
        '<li>อาการค่อยเป็นค่อยไป</li>' +
       '<li>เช่น retinopathy จาก chloroquin,  ONJ จากยา bisphosphonates</li>' +
      '</ul>'
    );

    if (badgeD) bindPopover(badgeD,
      '<h5>Type D — Delayed</h5>' +
      '<ul>' +
        '<li>พบได้น้อย</li>' +
        '<li>ปฏิกิริยาเกิดช้า ๆ หลังหยุดยา</li>' +
        '<li>เช่น ยาที่เหนี่ยวนำให้เกิดมะเร็ง</li>' +
      '</ul>'
    );

    if (badgeE) bindPopover(badgeE,
      '<h5>Type E — End of use</h5>' +
      '<ul>' +
        '<li>ปฏิกิริยาที่เกิดหลังหยุดยา/ขาดยา</li>' +
        '<li>เช่น withdrawal จาก Benzodiazepines</li>' +
      '</ul>'
    );

    if (badgeF) bindPopover(badgeF,
      '<h5>Type F — Failure</h5>' +
      '<ul>' +
        '<li>อาการไม่พึงประสงค์จากความล้มเหลวของการรักษา</li>' +
        '<li>มักเกิดจากปฏิกิริยาระหว่างยา (เช่น enzyme inducer ทำให้ยาคุมล้มเหลว)</li>' +
      '</ul>'
    );
    // ─────────────────────────────────────────────────────────

    function bindPopover(anchor, html) {
      var pop;

      function show() {
        hide();
        pop = document.createElement("div");
        pop.className = "pType-pop";
        pop.innerHTML = html + '<div class="pType-pop-arrow"></div>';
        document.body.appendChild(pop);

        var r = anchor.getBoundingClientRect();
        var pw = pop.offsetWidth;
        var ph = pop.offsetHeight;
        var left = r.left + window.scrollX + r.width / 2 - pw / 2;
        var top  = r.top  + window.scrollY - ph - 12;

        left = Math.max(8 + window.scrollX,
                Math.min(left, window.scrollX + document.documentElement.clientWidth - pw - 8));

        pop.style.left = left + "px";
        pop.style.top  = top  + "px";

        var arrow = pop.querySelector(".pType-pop-arrow");
        if (arrow) {
          var ax = r.left + window.scrollX + r.width / 2 - left - 8; // 8 = ครึ่งกว้างลูกศร
          arrow.style.left = Math.max(12, Math.min(ax, pw - 12)) + "px";
          arrow.style.top  = (ph - 1) + "px";
        }
      }
      function hide() {
        if (pop && pop.parentNode) pop.parentNode.removeChild(pop);
        pop = null;
      }

      anchor.addEventListener("mouseenter", show);
      anchor.addEventListener("mouseleave", hide);
      anchor.addEventListener("focus", show);
      anchor.addEventListener("blur", hide);
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        if (pop) hide(); else show();
      });
      window.addEventListener("scroll", hide, { passive: true });
      window.addEventListener("resize", hide);
    }

    function onChange() {
      Object.keys(mapCodeToEls).forEach(function (k) {
        var input = mapCodeToEls[k].input;
        var card  = mapCodeToEls[k].card;
        if (!card || !input) return;
        if (input.checked) card.classList.add("is-selected");
        else card.classList.remove("is-selected");
      });
    }

    function getChosen() {
      var arr = [];
      ["A","B","C","D","E","F"].forEach(function (c) {
        var el = mapCodeToEls[c];
        if (el && el.input && el.input.checked) arr.push(c);
      });
      return arr;
    }

    function showToast(kind, msg) {
      // หา toast อีกครั้งเผื่อผู้ใช้ย้าย DOM
      var t = document.getElementById("pTypeToast") || toast;
      if (!t) { alert(msg); return; } // fallback
      t.classList.remove("success","danger","show");
      void t.offsetWidth; // รีสตาร์ท animation
      t.textContent = msg;
      t.classList.add(kind === "success" ? "success" : "danger","show");
      setTimeout(function(){ t.classList.remove("show"); }, 2200);
    }

    // Logic ของปุ่มยืนยันตามที่กำหนด
    confirmBtn.addEventListener("click", function () {
      var chosen = getChosen();
      var hasB = chosen.indexOf("B") !== -1;
      var hasOthers = chosen.some(function (c){ return c !== "B"; });

      if (hasB && !hasOthers) {
        showToast("success","✅ ได้ Type B — ทำต่อหน้าถัดไปได้");
      } else if (!chosen.length) {
        showToast("danger","โปรดเลือกอย่างน้อย 1 ประเภทก่อน");
      } else {
        showToast("danger","⚠️ ไม่ใช่ Type B — ไม่ทำต่อหน้าถัดไป");
      }
    });

    // ===== ส่วนที่ 2: Immunologic type & Non-immunologic type (ต่อท้าย, ไม่กระทบส่วนที่ 1) =====
    injectPTypeSection2Styles();
    renderSection2(root);
  };

  // ------------------ DATA: 21 ADR สำหรับส่วนที่ 2 ------------------
  var PTYPE_ADR21 = [
    { key: "urticaria", label: "Urticaria", type: "Immunologic" },
    { key: "anaphylaxis", label: "Anaphylaxis", type: "Immunologic" },
    { key: "angioedema", label: "Angioedema", type: "Immunologic" },
    { key: "mp_rash", label: "Maculopapular rash", type: "Immunologic" },
    { key: "fde", label: "Fixed drug eruption", type: "Immunologic" },
    { key: "agep", label: "AGEP", type: "Immunologic" },
    { key: "sjs", label: "SJS", type: "Immunologic" },
    { key: "ten", label: "TEN", type: "Immunologic" },
    { key: "dress", label: "DRESS", type: "Immunologic" },
    { key: "em", label: "Erythema multiforme", type: "Immunologic" },
    { key: "photo", label: "Photosensitivity drug eruption", type: "Non-immunologic" },
    { key: "exfol", label: "Exfoliative dermatitis", type: "Immunologic" },
    { key: "eczema", label: "Eczematous drug eruption", type: "Immunologic" },
    { key: "bullous", label: "Bullous drug eruption", type: "Immunologic" },
    { key: "serum_sickness", label: "Serum sickness", type: "Immunologic" },
    { key: "vasculitis", label: "Vasculitis", type: "Immunologic" },
    { key: "hemolytic", label: "Hemolytic anemia", type: "Immunologic" },
    { key: "pancytopenia", label: "Pancytopenia / Neutropenia / Thrombocytopenia", type: "Immunologic" },
    { key: "nephritis", label: "Nephritis", type: "Immunologic" },
    { key: "drug_fever", label: "Drug fever", type: "Non-immunologic" },
    { key: "pseudo", label: "Pseudoallergy / Infusion reaction", type: "Non-immunologic" }
  ];

  // ------------------ STYLE สำหรับส่วนที่ 2 ------------------
  function injectPTypeSection2Styles() {
    if (document.getElementById("pType-sec2-style")) return;
    var css = ''
      + '.pType-sec2{margin-top:26px;padding:18px 16px 22px;border-radius:24px;'
      + 'background:linear-gradient(135deg,#faf5ff,#f5f3ff);border:1px solid #ddd6fe;'
      + 'box-shadow:0 20px 50px rgba(129,140,248,0.25);}'
      + '.pType-sec2-title{margin:0 0 4px;font-size:1.05rem;font-weight:800;color:#4c1d95;}'
      + '.pType-sec2-sub{margin:0 0 10px;font-size:.86rem;color:#6b21a8;}'
      + '.pType-adr-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));'
      + 'gap:12px;margin-top:6px;}'
      + '.pType-adr-card{border-radius:18px;background:#ffffff;border:1px solid #e5e7eb;'
      + 'padding:10px 11px 11px;box-shadow:0 10px 28px rgba(148,163,184,0.28);}'
      + '.pType-adr-head{display:flex;flex-direction:column;gap:4px;margin-bottom:6px;}'
      + '.pType-adr-name{font-size:.9rem;font-weight:700;color:#111827;line-height:1.3;}'
      + '.pType-adr-chip{align-self:flex-start;padding:2px 8px;border-radius:999px;'
      + 'font-size:.7rem;font-weight:700;margin-bottom:2px;}'
      + '.pType-adr-chip-immuno{background:rgba(52,211,153,0.15);color:#047857;'
      + 'border:1px solid rgba(16,185,129,0.55);}'
      + '.pType-adr-chip-nonimmuno{background:rgba(251,191,36,0.15);color:#92400e;'
      + 'border:1px solid rgba(245,158,11,0.55);}'
      + '.pType-adr-img-row{display:flex;gap:8px;}'
      + '.pType-adr-imgBox{flex:1 1 0;border-radius:14px;background:linear-gradient(135deg,#eef2ff,#fef9c3);'
      + 'padding:4px 5px;display:flex;flex-direction:column;gap:4px;min-height:90px;}'
      + '.pType-adr-imgTag{font-size:.7rem;font-weight:600;color:#6b21a8;}'
      + '.pType-adr-imgPlaceholder{flex:1 1 auto;border-radius:10px;border:1px dashed rgba(148,163,184,0.7);'
      + 'display:flex;align-items:center;justify-content:center;font-size:1.2rem;color:#9ca3af;'
      + 'background:rgba(249,250,251,0.85);}'
      + '.pType-adr-imgPlaceholder span{font-size:.75rem;margin-left:4px;}'
      + '@media (max-width:768px){.pType-sec2{padding:14px 10px 18px;border-radius:20px;}}';
    var style = document.createElement("style");
    style.id = "pType-sec2-style";
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ------------------ RENDER ส่วนที่ 2 (ไม่แตะส่วนที่ 1) ------------------
  function renderSection2(root) {
    var wrapper = root.querySelector(".pType-wrapper");
    if (!wrapper) return;
    // กันสร้างซ้ำ
    if (wrapper.querySelector(".pType-sec2")) return;

    var sec = document.createElement("section");
    sec.className = "pType-sec2";

    var cardsHtml = "";
    for (var i = 0; i < PTYPE_ADR21.length; i++) {
      var item = PTYPE_ADR21[i];
      var chipClass = item.type === "Immunologic" ? "pType-adr-chip-immuno" : "pType-adr-chip-nonimmuno";
      cardsHtml += [
        '<div class="pType-adr-card">',
          '<div class="pType-adr-head">',
            '<span class="pType-adr-chip ' + chipClass + '">' + item.type + '</span>',
            '<div class="pType-adr-name">' + item.label + '</div>',
          '</div>',
          '<div class="pType-adr-img-row">',
            '<div class="pType-adr-imgBox">',
              '<div class="pType-adr-imgTag">รูป 1</div>',
              '<div class="pType-adr-imgPlaceholder">🖼️<span>เพิ่มรูป</span></div>',
            '</div>',
            '<div class="pType-adr-imgBox">',
              '<div class="pType-adr-imgTag">รูป 2</div>',
              '<div class="pType-adr-imgPlaceholder">🖼️<span>เพิ่มรูป</span></div>',
            '</div>',
          '</div>',
        '</div>'
      ].join("");
    }

    sec.innerHTML = [
      '<h3 class="pType-sec2-title">ส่วนที่ 2 Immunologic type &amp; Non-immunologic type</h3>',
      '<p class="pType-sec2-sub">แสดง 21 ชนิดของ ADR โดยระบุประเภท Immunologic / Non-immunologic และเว้นช่องไว้ให้ใส่รูปประกอบ 2 รูปต่อ 1 กรณี</p>',
      '<div class="pType-adr-grid">',
        cardsHtml,
      '</div>'
    ].join("");

    wrapper.appendChild(sec);
  }

  // HTML การ์ด (ส่วนที่ 1 — ไม่เปลี่ยน)
  function cardHTML(code, title, themeClass) {
    return [
      '<div class="pType-card ' + themeClass + '" data-code="' + code + '">',
        '<div class="pType-head">',
          '<div class="pType-name">' + title + '</div>',
          '<button type="button" class="pType-badge" aria-label="รายละเอียด Type ' + code + '">Type ' + code + '</button>',
        '</div>',
        '<div class="pType-body">',
          '<div class="pType-option">',
            '<input id="pType-' + code + '" type="checkbox" value="' + code + '" />',
            '<label for="pType-' + code + '">เลือก Type ' + code + '</label>',
          '</div>',
        '</div>',
      '</div>'
    ].join("");
  }
})();

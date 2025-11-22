// ====================== pageTypeADR.js ======================
(function () {
  // สร้าง renderer ให้ router เรียกใช้
  window.renderPageTypeADR = function () {
    var root = document.getElementById("pageTypeADR");
    if (!root) return;

    // ---------- ส่วนที่ 1: Rawlins & Thompson ----------
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

        left = Math.max(
          8 + window.scrollX,
          Math.min(left, window.scrollX + document.documentElement.clientWidth - pw - 8)
        );

        pop.style.left = left + "px";
        pop.style.top  = top  + "px";

        var arrow = pop.querySelector(".pType-pop-arrow");
        if (arrow) {
          var ax = r.left + window.scrollX + r.width / 2 - left - 8;
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
      var t = document.getElementById("pTypeToast") || toast;
      if (!t) { alert(msg); return; } // fallback
      t.classList.remove("success","danger","show");
      void t.offsetWidth; // รีสตาร์ท animation
      t.textContent = msg;
      t.classList.add(kind === "success" ? "success" : "danger","show");
      setTimeout(function(){ t.classList.remove("show"); }, 2200);
    }

    // Logic ของปุ่มยืนยัน
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

    // ---------- ส่วนที่ 2: Immunologic type & Non-immunologic type ----------
    buildTypeSection2(root);
  };

  // HTML การ์ด ส่วนที่ 1
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

  // ================== ส่วนที่ 2 ==================

  function ensureSection2Styles() {
    if (document.getElementById("pType-sec2-style")) return;
    var css = [
      '.pType-sec2{',
        'margin-top:28px;',
        'padding:18px 18px 22px;',
        'border-radius:22px;',
        'background:linear-gradient(180deg,#faf5ff,#fdf2ff);',
        'border:1px solid rgba(167,139,250,0.4);',
        'box-shadow:0 18px 45px rgba(129,140,248,0.35);',
      '}',
      '.pType-sec2-title{',
        'font-size:1.1rem;',
        'font-weight:800;',
        'color:#4c1d95;',
        'margin:0 0 4px;',
        'display:flex;',
        'align-items:center;',
        'gap:6px;',
      '}',
      '.pType-sec2-sub{',
        'font-size:.87rem;',
        'color:#6b21a8;',
        'margin:0 0 14px;',
      '}',
      '.pType-sec2-badges{',
        'display:flex;',
        'flex-wrap:wrap;',
        'gap:8px;',
        'margin-bottom:10px;',
      '}',
      '.pType-tag-immune, .pType-tag-mixed{',
        'font-size:.78rem;',
        'padding:3px 10px;',
        'border-radius:999px;',
        'border:1px solid;',
        'display:inline-flex;',
        'align-items:center;',
        'gap:5px;',
        'background:#fff;',
      '}',
      '.pType-tag-immune{',
        'border-color:rgba(16,185,129,0.45);',
        'color:#047857;',
      '}',
      '.pType-tag-mixed{',
        'border-color:rgba(245,158,11,0.55);',
        'color:#b45309;',
      '}',
      '.pType-tag-dot{',
        'width:7px;height:7px;border-radius:999px;',
      '}',
      '.pType-dot-immune{background:linear-gradient(135deg,#6ee7b7,#22c55e);}',
      '.pType-dot-mixed{background:linear-gradient(135deg,#facc15,#fb923c);}',

      '.pType-sec2-list{',
        'margin-top:6px;',
        'display:flex;',
        'flex-direction:column;',
        'gap:18px;',
      '}',

      '.pType-sec2-card{',
        'background:#ffffff;',
        'border-radius:18px;',
        'border:1px solid #e5e7eb;',
        'box-shadow:0 12px 30px rgba(148,163,184,0.26);',
        'padding:12px 14px 14px;',
        'display:flex;',
        'flex-direction:column;',
        'gap:10px;',
      '}',
      '.pType-sec2-header{',
        'display:flex;',
        'justify-content:space-between;',
        'align-items:flex-start;',
        'gap:10px;',
        'flex-wrap:wrap;',
      '}',
      '.pType-sec2-name{',
        'font-weight:700;',
        'color:#312e81;',
        'font-size:.95rem;',
      '}',
      '.pType-sec2-type{',
        'font-size:.8rem;',
        'font-weight:600;',
        'padding:3px 9px;',
        'border-radius:999px;',
        'border:1px solid;',
        'display:inline-flex;',
        'align-items:center;',
        'gap:4px;',
      '}',
      '.pType-sec2-type-immune{',
        'border-color:rgba(16,185,129,0.35);',
        'background:rgba(16,185,129,0.06);',
        'color:#047857;',
      '}',
      '.pType-sec2-type-mixed{',
        'border-color:rgba(245,158,11,0.5);',
        'background:rgba(251,191,36,0.08);',
        'color:#b45309;',
      '}',

      '.pType-sec2-images{',
        'margin-top:4px;',
        'display:flex;',
        'gap:12px;',
        'align-items:stretch;',
        'justify-content:space-between;',
        'flex-wrap:wrap;',
      '}',
      '.pType-sec2-img-box{',
        'flex:1 1 48%;',
        'min-width:260px;',
      '}',
      '.pType-sec2-img-label{',
        'font-size:.78rem;',
        'color:#6b7280;',
        'margin:0 0 4px;',
      '}',
            '.pType-sec2-img-placeholder{',
        'width:100%;',
        'height:260px;',
        'border-radius:16px;',
        'overflow:hidden;',
        'background:#fff;',
        'box-shadow:0 10px 28px rgba(148,163,184,0.35);',
        'border:1px solid rgba(148,163,184,0.45);',
        'display:flex;',
        'align-items:center;',
        'justify-content:center;',
      '}',
      '.pType-sec2-img{',
        'max-width:100%;',
        'max-height:100%;',
        'object-fit:contain;',   // ✅ แสดงภาพเต็มไม่โดนตัดขอบ
        'display:block;',
      '}',

      '@media (max-width:900px){',
        '.pType-sec2-img-box{min-width:100%;}',
        '.pType-sec2-img-placeholder{height:220px;}',
      '}'
    ].join("");

    var tag = document.createElement("style");
    tag.id = "pType-sec2-style";
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  function buildTypeSection2(root) {
    ensureSection2Styles();

    var sec = document.createElement("section");
    sec.className = "pType-sec2";

    var html = [
      '<h3 class="pType-sec2-title">🧬 ส่วนที่ 2: Immunologic type &amp; Non-immunologic type</h3>',
      '<div class="pType-sec2-badges">',
        '<span class="pType-tag-immune">',
          '<span class="pType-tag-dot pType-dot-immune"></span>',
          '<span>Immunologic type</span>',
        '</span>',
        '<span class="pType-tag-mixed">',
          '<span class="pType-tag-dot pType-dot-mixed"></span>',
          '<span>Immunologic &amp; Non-immunologic type</span>',
        '</span>',
      '</div>',
      '<div class="pType-sec2-list">',

        adrRow("Urticaria", "Urticaria", true, true),
        adrRow("Anaphylaxis", "Anaphylaxis", true, true),
        adrRow("Angioedema", "Angioedema", true, true),

        adrRow("Maculopapular rash", "Maculopapular rash", true, false),
        adrRow("Fixed drug eruption", "Fixed drug eruption", true, false),
        adrRow("AGEP", "AGEP", true, false),
        adrRow("SJS", "SJS", true, false),
        adrRow("TEN", "TEN", true, false),
        adrRow("DRESS", "DRESS", true, false),
        adrRow("Erythema multiforme", "Erythema multiforme", true, false),
        adrRow("Photosensitivity drug eruption", "Photosensitivity drug eruption", true, false),
        adrRow("Exfoliative dermatitis", "Exfoliative dermatitis", true, false),
        adrRow("Eczematous drug eruption", "Eczematous drug eruption", true, false),
        adrRow("Bullous Drug Eruption", "Bullous Drug Eruption", true, false),
        adrRow("Serum sickness", "Serum sickness", true, false),
        adrRow("Vasculitis", "Vasculitis", true, false),
        adrRow("Hemolytic anemia", "Hemolytic anemia", true, false),
        adrRow("Pancytopenia", "Pancytopenia", true, false),
        adrRow("Neutropenia", "Neutropenia", true, false),
        adrRow("Thrombocytopenia", "Thrombocytopenia", true, false),
        adrRow("Nephritis", "Nephritis", true, false),

      '</div>'
    ].join("");

    sec.innerHTML = html;
    root.appendChild(sec);
  }

  // แถวของแต่ละ ADR (1 ADR ต่อ 1 แถว, 2 รูปใหญ่)
  function adrRow(label, key, isImmune, isMixed) {
    var base = key || label;
    // ใน repo ตอนนี้ไฟล์ชื่อแบบ XXX_1.png.png / XXX_2.png.png
    var img1 = base + "_1.png.png";
    var img2 = base + "_2.png.png";

    var typeClass = isMixed ? "pType-sec2-type-mixed" : "pType-sec2-type-immune";
    var dotClass  = isMixed ? "pType-dot-mixed" : "pType-dot-immune";
    var typeText  = isMixed ? "Immunologic & Non-immunologic type" : "Immunologic type";

    return [
      '<article class="pType-sec2-card">',
        '<div class="pType-sec2-header">',
          '<div class="pType-sec2-name">', label, '</div>',
          '<div class="pType-sec2-type ', typeClass, '">',
            '<span class="pType-tag-dot ', dotClass, '"></span>',
            '<span>', typeText, '</span>',
          '</div>',
        '</div>',
        '<div class="pType-sec2-images">',
          '<div class="pType-sec2-img-box">',
            '<p class="pType-sec2-img-label">ภาพตัวอย่างที่ 1</p>',
            '<div class="pType-sec2-img-placeholder">',
              '<img class="pType-sec2-img" src="', img1, '" alt="', label, ' - ตัวอย่างที่ 1" />',
            '</div>',
          '</div>',
          '<div class="pType-sec2-img-box">',
            '<p class="pType-sec2-img-label">ภาพตัวอย่างที่ 2</p>',
            '<div class="pType-sec2-img-placeholder">',
              '<img class="pType-sec2-img" src="', img2, '" alt="', label, ' - ตัวอย่างที่ 2" />',
            '</div>',
          '</div>',
        '</div>',
      '</article>'
    ].join("");
  }

})();

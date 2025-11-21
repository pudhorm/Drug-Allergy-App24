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
  };

  // HTML การ์ด
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

// ============ ส่วนขยาย: เพิ่ม "ส่วนที่ 2 Immunologic type & Non-immunologic type" โดยไม่แตะส่วนที่ 1 ============
(function () {
  if (!window.renderPageTypeADR) return;

  var originalRender = window.renderPageTypeADR;

  // ข้อมูล 21 ADR (3 ตัวแรกเป็นทั้ง Immunologic & Non-immunologic)
  var PTYPE_ADR_ITEMS = [
    { key: "urticaria",    label: "Urticaria",                                        both: true },
    { key: "anaphylaxis",  label: "Anaphylaxis",                                      both: true },
    { key: "angioedema",   label: "Angioedema",                                       both: true },
    { key: "mp_rash",      label: "Maculopapular rash",                               both: false },
    { key: "fde",          label: "Fixed drug eruption",                              both: false },
    { key: "agep",         label: "Acute generalized exanthematous pustulosis (AGEP)",both: false },
    { key: "sjs",          label: "Stevens–Johnson syndrome (SJS)",                   both: false },
    { key: "ten",          label: "Toxic epidermal necrolysis (TEN)",                 both: false },
    { key: "dress",        label: "DRESS (Drug Reaction with Eosinophilia and Systemic Symptoms)", both: false },
    { key: "em",           label: "Erythema multiforme",                              both: false },
    { key: "photo",        label: "Photosensitivity drug eruption",                   both: false },
    { key: "exfol",        label: "Exfoliative dermatitis",                           both: false },
    { key: "eczema",       label: "Eczematous drug eruption",                         both: false },
    { key: "bullous",      label: "Bullous drug eruption",                            both: false },
    { key: "serum_sick",   label: "Serum sickness / Serum sickness–like reaction",    both: false },
    { key: "vasculitis",   label: "Vasculitis",                                       both: false },
    { key: "hemolytic",    label: "Hemolytic anemia",                                 both: false },
    { key: "pancytopenia", label: "Pancytopenia / Neutropenia / Thrombocytopenia",    both: false },
    { key: "nephritis",    label: "Nephritis / Drug-induced nephritis",               both: false },
    { key: "drug_fever",   label: "Drug fever",                                       both: false },
    { key: "dili",         label: "Drug-induced liver injury (DILI)",                 both: false }
  ];

  function injectSection2Styles() {
    if (document.getElementById("pType-sec2-style")) return;
    var css = [
      ".pType-sec2{margin-top:26px;padding:16px 14px 18px;border-radius:20px;",
      "background:linear-gradient(135deg,#f5f3ff,#eef2ff);",
      "border:1px solid rgba(167,139,250,0.55);box-shadow:0 14px 40px rgba(129,140,248,0.28);}",
      ".pType-sec2-title{margin:0 0 4px;font-size:1.02rem;font-weight:800;color:#4c1d95;}",
      ".pType-sec2-sub{margin:0 0 10px;font-size:.85rem;color:#6b21a8;}",
      ".pType-sec2-list{display:flex;flex-direction:column;gap:10px;margin-top:4px;}",
      ".pType-sec2-row{display:flex;align-items:stretch;justify-content:space-between;",
      "gap:12px;padding:10px 12px;border-radius:18px;background:#ffffff;",
      "border:1px solid #e5e7eb;box-shadow:0 8px 22px rgba(148,163,184,0.22);}",
      ".pType-sec2-info{flex:1 1 0;min-width:0;}",
      ".pType-sec2-adr-name{font-weight:700;font-size:.9rem;color:#111827;margin-bottom:4px;}",
      ".pType-sec2-tags{display:flex;flex-wrap:wrap;gap:6px;}",
      ".pType-chip{display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;",
      "font-size:.78rem;font-weight:700;white-space:nowrap;}",
      ".pType-chip-immune{background:rgba(129,140,248,0.1);color:#4338ca;",
      "border:1px solid rgba(129,140,248,0.55);}",
      ".pType-chip-nonimmune{background:rgba(251,191,36,0.12);color:#92400e;",
      "border:1px solid rgba(251,191,36,0.7);}",
      ".pType-sec2-images{flex:0 0 auto;display:flex;gap:10px;}",
      ".pType-image-slot{width:170px;height:115px;border-radius:18px;",
      "background:radial-gradient(circle at 30% 20%,#fef9c3,#e0e7ff);",
      "border:1px dashed rgba(148,163,184,0.9);display:flex;align-items:center;",
      "justify-content:center;font-size:.8rem;color:#6b7280;font-weight:600;}",
      ".pType-image-slot span{opacity:.9;}",
      "@media (max-width:900px){.pType-sec2-row{flex-direction:column;align-items:flex-start;}",
      ".pType-sec2-images{width:100%;justify-content:flex-start;}",
      ".pType-image-slot{width:48%;min-width:130px;}}"
    ].join("");
    var tag = document.createElement("style");
    tag.id = "pType-sec2-style";
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  function buildSection2HTML() {
    var rows = [];
    for (var i = 0; i < PTYPE_ADR_ITEMS.length; i++) {
      var it = PTYPE_ADR_ITEMS[i];
      var chips = [
        '<span class="pType-chip pType-chip-immune">Immunologic</span>'
      ];
      if (it.both) {
        chips.push('<span class="pType-chip pType-chip-nonimmune">Non-immunologic</span>');
      }
      rows.push(
        '<div class="pType-sec2-row">' +
          '<div class="pType-sec2-info">' +
            '<div class="pType-sec2-adr-name">' + it.label + '</div>' +
            '<div class="pType-sec2-tags">' + chips.join("") + '</div>' +
          '</div>' +
          '<div class="pType-sec2-images">' +
            '<div class="pType-image-slot"><span>รูปที่ 1</span></div>' +
            '<div class="pType-image-slot"><span>รูปที่ 2</span></div>' +
          '</div>' +
        '</div>'
      );
    }

    return [
      '<div class="pType-sec2">',
        '<h3 class="pType-sec2-title">ส่วนที่ 2: Immunologic type &amp; Non-immunologic type</h3>',
        '<p class="pType-sec2-sub">',
          'จำแนก 21 ชนิดของ ADR ตามกลไกการเกิด — ',
          'ทุก ADR จัดเป็น <strong>Immunologic type</strong> ยกเว้น ',
          '<strong>Urticaria, Anaphylaxis และ Angioedema</strong> ที่จัดอยู่ได้ทั้ง ',
          '<strong>Immunologic &amp; Non-immunologic type</strong> และมีช่องสำหรับใส่รูปตัวอย่าง 2 รูปต่อ 1 ADR',
        '</p>',
        '<div class="pType-sec2-list">',
          rows.join(""),
        '</div>',
      '</div>'
    ].join("");
  }

  // override ฟังก์ชัน render แต่ยังเรียกของเดิมก่อนเสมอ
  window.renderPageTypeADR = function () {
    // วาดส่วนที่ 1 ตามเดิม
    originalRender();

    var root = document.getElementById("pageTypeADR");
    if (!root) return;
    injectSection2Styles();

    // ลบส่วนที่ 2 เดิม (ถ้ามี) เพื่อกันซ้ำ
    var old = root.querySelector(".pType-sec2");
    if (old && old.parentNode) old.parentNode.removeChild(old);

    // สร้าง DOM ส่วนที่ 2 แล้วแทรกหลัง .pType-wrapper
    var holder = document.createElement("div");
    holder.innerHTML = buildSection2HTML();
    var sec2 = holder.firstChild;

    var firstWrapper = root.querySelector(".pType-wrapper");
    if (firstWrapper && firstWrapper.parentNode) {
      firstWrapper.parentNode.insertBefore(sec2, firstWrapper.nextSibling);
    } else {
      root.appendChild(sec2);
    }
  };
})();

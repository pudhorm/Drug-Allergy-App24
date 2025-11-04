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
      '</div>',
      '<div class="pType-toast" id="pTypeToast" role="alert" aria-live="polite"></div>'
    ].join("");

    // ---------- hooks ----------
    var checkboxes = root.querySelectorAll('.pType-option input[type="checkbox"]');
    var confirmBtn = root.querySelector("#pTypeConfirm");
    var toast = root.querySelector("#pTypeToast");

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
      '</ul>'
    );

    if (badgeD) bindPopover(badgeD,
      '<h5>Type D — Delayed</h5>' +
      '<ul>' +
        '<li>พบได้น้อย</li>' +
        '<li>ปฏิกิริยาเกิดช้า ๆ หลังหยุดยา</li>' +
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
      toast.classList.remove("success","danger","show");
      void toast.offsetWidth; // รีสตาร์ท animation
      toast.textContent = msg;
      toast.classList.add(kind === "success" ? "success" : "danger","show");
      setTimeout(function(){ toast.classList.remove("show"); }, 2200);
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

// ====================== pageTypeADR.js (FULL REPLACE) ======================
(function () {
  // สร้าง renderer ให้ router เรียกใช้
  window.renderPageTypeADR = function () {
    const root = document.getElementById("pageTypeADR");
    if (!root) return;

    root.innerHTML = `
      <div class="pType-wrapper">
        <h2 class="pType-title">🧩 Type of ADR (Rawlins & Thompson)</h2>

        <div class="pType-grid">
          ${cardHTML("A","Type A — dose-related (Augmented)","typeA")}
          ${cardHTML("B","Type B — non-dose-related (Bizarre)","typeB")}
          ${cardHTML("C","Type C — dose-related & time-related (Chronic)","typeC")}
          ${cardHTML("D","Type D — time-related (Delayed)","typeD")}
          ${cardHTML("E","Type E — withdrawal (End of use)","typeE")}
          ${cardHTML("F","Type F — unexpected failure of therapy (Failure)","typeF")}
        </div>

        <div class="pType-actions">
          <button class="pType-confirm-btn" id="pTypeConfirm">กดยืนยันผล</button>
        </div>
      </div>

      <div class="pType-toast" id="pTypeToast" role="alert" aria-live="polite"></div>
    `;

    // ---------- hooks ----------
    const checkboxes = root.querySelectorAll('.pType-option input[type="checkbox"]');
    const confirmBtn = root.querySelector("#pTypeConfirm");
    const toast = root.querySelector("#pTypeToast");

    const mapCodeToEls = {};
    checkboxes.forEach((cb) => {
      const code = cb.value;
      mapCodeToEls[code] = {
        input: cb,
        card: root.querySelector(\`.pType-card[data-code="\${code}"]\`),
        badge: root.querySelector(\`.pType-card[data-code="\${code}"] .pType-badge\`)
      };
      cb.addEventListener("change", onChange);
    });

    // ── popover ข้อความสำหรับ A–F ───────────────────────────────
    const badgeA = mapCodeToEls["A"]?.badge;
    const badgeB = mapCodeToEls["B"]?.badge;
    const badgeC = mapCodeToEls["C"]?.badge;
    const badgeD = mapCodeToEls["D"]?.badge;
    const badgeE = mapCodeToEls["E"]?.badge;
    const badgeF = mapCodeToEls["F"]?.badge;

    if (badgeA) bindPopover(badgeA, `
      <h5>Type A — Augmented</h5>
      <ul>
        <li>สัมพันธ์กับฤทธิ์ทางเภสัชวิทยา (SE, drug overdose, drug–drug interaction)</li>
        <li>ทำนายผลได้ / อัตราการเสียชีวิตต่ำ</li>
        <li>ดีขึ้นเมื่อ “ลดขนาด/หยุดยา” (de-challenge)</li>
        <li>เช่น bleeding จาก warfarin, digoxin toxicity</li>
      </ul>
    `);

    if (badgeB) bindPopover(badgeB, `
      <h5>Type B — Bizarre</h5>
      <ul>
        <li>ไม่สัมพันธ์กับฤทธิ์ทางเภสัชวิทยา</li>
        <li>ทำนายไม่ได้ / อัตราการเสียชีวิตสูง</li>
        <li>เช่น Penicillin hypersensitivity, Pseudoallergy</li>
      </ul>
    `);

    if (badgeC) bindPopover(badgeC, `
      <h5>Type C — Chronic</h5>
      <ul>
        <li>พบได้น้อย / เกี่ยวกับขนาดสะสมระยะยาว</li>
        <li>อาการค่อยเป็นค่อยไป</li>
      </ul>
    `);

    if (badgeD) bindPopover(badgeD, `
      <h5>Type D — Delayed</h5>
      <ul>
        <li>พบได้น้อย</li>
        <li>ปฏิกิริยาเกิดช้า ๆ หลังหยุดยา</li>
      </ul>
    `);

    if (badgeE) bindPopover(badgeE, `
      <h5>Type E — End of use</h5>
      <ul>
        <li>ปฏิกิริยาที่เกิดหลังหยุดยา/ขาดยา</li>
        <li>เช่น withdrawal จาก Benzodiazepines</li>
      </ul>
    `);

    if (badgeF) bindPopover(badgeF, `
      <h5>Type F — Failure</h5>
      <ul>
        <li>อาการไม่พึงประสงค์จากความล้มเหลวของการรักษา</li>
        <li>มักเกิดจากปฏิกิริยาระหว่างยา (เช่น enzyme inducer ทำให้ยาคุมล้มเหลว)</li>
      </ul>
    `);
    // ─────────────────────────────────────────────────────────

    function bindPopover(anchor, html) {
      let pop;

      function show() {
        hide(); // เคลียร์ของเดิม
        pop = document.createElement("div");
        pop.className = "pType-pop";
        pop.innerHTML = html + `<div class="pType-pop-arrow"></div>`;
        document.body.appendChild(pop);

        // จัดตำแหน่งเหนือ badge
        const r = anchor.getBoundingClientRect();
        const pw = pop.offsetWidth;
        const ph = pop.offsetHeight;
        let left = r.left + window.scrollX + r.width/2 - pw/2;
        const top  = r.top  + window.scrollY - ph - 12;

        // กันตกขอบ
        left = Math.max(8 + window.scrollX,
                Math.min(left, window.scrollX + document.documentElement.clientWidth - pw - 8));

        pop.style.left = left + "px";
        pop.style.top  = top  + "px";

        const arrow = pop.querySelector(".pType-pop-arrow");
        if (arrow) {
          const ax = r.left + window.scrollX + r.width/2 - left - 8; // 8 = ครึ่งกว้างลูกศร
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
      // มือถือ: toggle
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        if (pop) hide(); else show();
      });
      window.addEventListener("scroll", hide, { passive: true });
      window.addEventListener("resize", hide);
    }

    function onChange() {
      Object.values(mapCodeToEls).forEach(({ input, card }) => {
        if (!card) return;
        card.classList.toggle("is-selected", !!input.checked);
      });
    }

    function getChosen() {
      const arr = [];
      ["A","B","C","D","E","F"].forEach((c)=>{
        const el = mapCodeToEls[c];
        if (el?.input?.checked) arr.push(c);
      });
      return arr;
    }

    function showToast(kind, msg) {
      toast.classList.remove("success","danger","show");
      void toast.offsetWidth; // รีสตาร์ท animation
      toast.textContent = msg;
      toast.classList.add(kind === "success" ? "success" : "danger","show");
      setTimeout(()=>toast.classList.remove("show"), 2200);
    }

    // Logic ของปุ่มยืนยันตามที่กำหนด
    confirmBtn.addEventListener("click", () => {
      const chosen = getChosen();
      const hasB = chosen.includes("B");
      const hasOthers = chosen.some((c)=>c!=="B");

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
    return `
      <div class="pType-card ${themeClass}" data-code="${code}">
        <div class="pType-head">
          <div class="pType-name">${title}</div>
          <button type="button" class="pType-badge" aria-label="รายละเอียด Type ${code}">Type ${code}</button>
        </div>
        <div class="pType-body">
          <div class="pType-option">
            <input id="pType-${code}" type="checkbox" value="${code}" />
            <label for="pType-${code}">เลือก Type ${code}</label>
          </div>
        </div>
      </div>
    `;
  }
})();

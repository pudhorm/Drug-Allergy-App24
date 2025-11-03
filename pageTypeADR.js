// ====================== pageTypeADR.js ======================
(function () {
  // สร้าง renderer ให้ router เรียกใช้
  window.renderPageTypeADR = function () {
    const root = document.getElementById("pageTypeADR");
    if (!root) return;

    root.innerHTML = `
      <div class="pType-wrapper">
        <h2 class="pType-title">🧩 Type of ADR (Rawlins & Thompson)</h2>

        <div class="pType-grid">
          ${cardHTML("A","Type A — dose-related (Augmented)","typeA", true)}
          ${cardHTML("B","Type B — non-dose-related (Bizarre)","typeB")}
          ${cardHTML("C","Type C — dose-related & time-related (Chronic)","typeC")}
          ${cardHTML("D","Type D — time-related (Delayed)","typeD")}
          ${cardHTML("E","Type E — withdrawal (End of use)","typeE")}
          ${cardHTML("F","Type F — unexpected failure of therapy (Failure)","typeF")}
        </div>

        <div class="pType-result" id="pTypeResult">
          <h4>ผลที่เลือก</h4>
          <div class="pType-selected" id="pTypeSelected">
            <span class="pType-chip">ยังไม่ได้เลือก</span>
          </div>
        </div>

        <div class="pType-actions">
          <button class="pType-confirm-btn" id="pTypeConfirm">กดยืนยันผล</button>
        </div>
      </div>

      <div class="pType-toast" id="pTypeToast" role="alert" aria-live="polite"></div>
    `;

    // ---------- hooks ----------
    const checkboxes = root.querySelectorAll('.pType-option input[type="checkbox"]');
    const selectedBox = root.querySelector("#pTypeSelected");
    const confirmBtn = root.querySelector("#pTypeConfirm");
    const toast = root.querySelector("#pTypeToast");

    const mapCodeToEls = {};
    checkboxes.forEach((cb) => {
      const code = cb.value;
      mapCodeToEls[code] = {
        input: cb,
        card: root.querySelector(`.pType-card[data-code="${code}"]`),
        badge: root.querySelector(`.pType-card[data-code="${code}"] .pType-badge`)
      };
      cb.addEventListener("change", onChange);
    });

    // ── popover: ทำเฉพาะ Type A ตามที่ขอ ─────────────────────
    const tipA = mapCodeToEls["A"]?.badge;
    if (tipA) {
      tipA.classList.add("pType-badge-tip");
      const contentA = `
        <h5>Type A — Augmented</h5>
        <ul>
          <li>สัมพันธ์กับฤทธิ์ทางเภสัชวิทยา (SE, drug overdose, drug–drug interaction)</li>
          <li>ทำนายผลได้</li>
          <li>อัตราการเสียชีวิตต่ำ</li>
          <li>ดีขึ้นชัดเจนเมื่อ “ลดขนาด/หยุดยา” (de-challenge)</li>
          <li>เช่น bleeding จาก warfarin, digoxin toxicity, serotonin syndrome จาก SSRIs</li>
        </ul>
      `;
      bindPopover(tipA, contentA);
    }

    function bindPopover(anchor, html) {
      let pop;

      function show() {
        hide(); // เคลียร์ของเดิม
        pop = document.createElement("div");
        pop.className = "pType-pop";
        pop.innerHTML = html + `<div class="pType-pop-arrow"></div>`;
        document.body.appendChild(pop);

        // ตำแหน่ง: ก้อนเมฆอยู่เหนือ badge กลางๆ
        const r = anchor.getBoundingClientRect();
        const pw = pop.offsetWidth;
        const ph = pop.offsetHeight;

        let left = r.left + window.scrollX + r.width/2 - pw/2;
        const top  = r.top  + window.scrollY - ph - 12;

        // กันตกขอบ
        left = Math.max(8 + window.scrollX, Math.min(left, window.scrollX + document.documentElement.clientWidth - pw - 8));

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
      // รองรับแตะบนมือถือ: toggle
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        if (pop) hide(); else show();
      });

      // ซ่อนเมื่อสกรอลล์/รีไซส์
      window.addEventListener("scroll", hide, { passive: true });
      window.addEventListener("resize", hide);
    }
    // ─────────────────────────────────────────────────────────

    function onChange() {
      Object.values(mapCodeToEls).forEach(({ input, card }) => {
        if (!card) return;
        card.classList.toggle("is-selected", !!input.checked);
      });
      renderSelected();
    }

    function renderSelected() {
      const chosen = getChosen();
      if (!chosen.length) {
        selectedBox.innerHTML = `<span class="pType-chip">ยังไม่ได้เลือก</span>`;
        return;
      }
      selectedBox.innerHTML = chosen.map((c) =>
        `<span class="pType-chip">${codeToFull(c)}</span>`
      ).join(" ");
    }

    function getChosen() {
      const arr = [];
      ["A","B","C","D","E","F"].forEach((c)=>{
        const el = mapCodeToEls[c];
        if (el?.input?.checked) arr.push(c);
      });
      return arr;
    }
    function codeToFull(code) {
      switch (code) {
        case "A": return "Type A — Augmented";
        case "B": return "Type B — Bizarre";
        case "C": return "Type C — Chronic";
        case "D": return "Type D — Delayed";
        case "E": return "Type E — End of use";
        case "F": return "Type F — Failure";
        default:  return code;
      }
    }

    function showToast(kind, msg) {
      toast.classList.remove("success","danger","show");
      void toast.offsetWidth;
      toast.textContent = msg;
      toast.classList.add(kind === "success" ? "success" : "danger","show");
      setTimeout(()=>toast.classList.remove("show"),2200);
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

  // HTML ของการ์ด; ใส่ data-tooltip เฉพาะ Type A (สำหรับ mouse cursor)
  function cardHTML(code, title, themeClass, withBadgeTip=false) {
    const badgeAttrs = withBadgeTip ? 'aria-label="แสดงรายละเอียด" tabindex="0"' : "";
    return `
      <div class="pType-card ${themeClass}" data-code="${code}">
        <div class="pType-head">
          <div class="pType-name">${title}</div>
          <div class="pType-badge" ${badgeAttrs}>Type ${code}</div>
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

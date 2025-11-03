// ====================== pageTypeADR.js ======================
(function () {
  // สร้าง renderer ไว้ให้ router เรียกใช้
  window.renderPageTypeADR = function () {
    const root = document.getElementById("pageTypeADR");
    if (!root) return;

    root.innerHTML = `
      <div class="pType-wrapper">
        <h2 class="pType-title">🧩 Type of ADR (Rawlins & Thompson)</h2>

        <div class="pType-grid">
          ${cardHTML("A", "Type A — dose-related (Augmented)", "typeA")}
          ${cardHTML("B", "Type B — non-dose-related (Bizarre)", "typeB")}
          ${cardHTML("C", "Type C — dose-related & time-related (Chronic)", "typeC")}
          ${cardHTML("D", "Type D — time-related (Delayed)", "typeD")}
          ${cardHTML("E", "Type E — withdrawal (End of use)", "typeE")}
          ${cardHTML("F", "Type F — unexpected failure of therapy (Failure)", "typeF")}
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

    // ── Hook events ──────────────────────────────────────────
    const checkboxes = root.querySelectorAll('.pType-option input[type="checkbox"]');
    const cards = root.querySelectorAll(".pType-card");
    const selectedBox = root.querySelector("#pTypeSelected");
    const confirmBtn = root.querySelector("#pTypeConfirm");
    const toast = root.querySelector("#pTypeToast");

    // id ของการ์ด => input
    const mapCodeToEls = {};
    checkboxes.forEach((cb) => {
      const code = cb.value;
      mapCodeToEls[code] = {
        input: cb,
        card: root.querySelector(`.pType-card[data-code="${code}"]`),
      };
      cb.addEventListener("change", onChange);
    });

    function onChange() {
      // toggle กรอบที่ถูกติ๊ก
      Object.values(mapCodeToEls).forEach(({ input, card }) => {
        if (!card) return;
        if (input.checked) {
          card.classList.add("is-selected");
        } else {
          card.classList.remove("is-selected");
        }
      });
      renderSelected();
    }

    function renderSelected() {
      const chosen = getChosen();
      if (!chosen.length) {
        selectedBox.innerHTML = `<span class="pType-chip">ยังไม่ได้เลือก</span>`;
        return;
      }
      selectedBox.innerHTML = chosen
        .map((c) => `<span class="pType-chip">${codeToFull(c)}</span>`)
        .join(" ");
    }

    function getChosen() {
      const arr = [];
      for (const code of ["A", "B", "C", "D", "E", "F"]) {
        const el = mapCodeToEls[code];
        if (el?.input?.checked) arr.push(code);
      }
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
      // kind: 'success' | 'danger'
      toast.classList.remove("success", "danger", "show");
      void toast.offsetWidth; // reflow ให้อนิเมชันทำงานใหม่
      toast.textContent = msg;
      toast.classList.add(kind === "success" ? "success" : "danger", "show");
      // ซ่อนเองอัตโนมัติ
      setTimeout(() => {
        toast.classList.remove("show");
      }, 2200);
    }

    // กติกา popup ตามที่กำหนด:
    // - ถ้าเลือกเฉพาะ Type B (และไม่เลือก A/C/D/E/F) => popup สีเขียว "ทำต่อหน้าถัดไปได้"
    // - ถ้าเลือก A/C/D/E/F (หรือ B ร่วมกับตัวอื่น ๆ) => popup สีแดง "ไม่ทำต่อหน้าถัดไป"
    confirmBtn.addEventListener("click", () => {
      const chosen = getChosen();
      const hasB = chosen.includes("B");
      const hasOthers = chosen.some((c) => c !== "B");

      if (hasB && !hasOthers) {
        showToast("success", "✅ ได้ Type B — ทำต่อหน้าถัดไปได้");
      } else if (!chosen.length) {
        showToast("danger", "โปรดเลือกอย่างน้อย 1 ประเภทก่อน");
      } else {
        showToast("danger", "⚠️ ไม่ใช่ Type B — ไม่ทำต่อหน้าถัดไป");
      }
    });
  };

  // ── helpers ────────────────────────────────────────────────
  function cardHTML(code, title, themeClass) {
    // ใช้ checkbox (หลายตัวเลือกได้) ตามที่ผู้ใช้ขอ
    return `
      <div class="pType-card ${themeClass}" data-code="${code}">
        <div class="pType-head">
          <div class="pType-name">${title}</div>
          <div class="pType-badge">Type ${code}</div>
        </div>
        <div class="pType-body">
          <!-- พื้นที่รายละเอียดในอนาคต (ผู้ใช้จะเติมเอง) -->
          <div class="pType-option">
            <input id="pType-${code}" type="checkbox" value="${code}" />
            <label for="pType-${code}">เลือก Type ${code}</label>
          </div>
        </div>
      </div>
    `;
  }
})();

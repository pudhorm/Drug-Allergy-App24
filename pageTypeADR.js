// ====================== pageTypeADR.js ======================
(function () {
  // กำหนดชนิด A–F + สีของแต่ละกรอบ
  const TYPES = [
    { code: "A", title: "Type A — dose-related (Augmented)", color: "#3b82f6" },     // ฟ้า
    { code: "B", title: "Type B — Non-dose related (Bizarre)", color: "#10b981" },   // เขียว
    { code: "C", title: "Type C — dose- & time-related (Chronic)", color: "#8b5cf6" },// ม่วง
    { code: "D", title: "Type D — Time-related (Delayed)", color: "#f59e0b" },       // เหลืองส้ม
    { code: "E", title: "Type E — Withdrawal (End of use)", color: "#ec4899" },      // ชมพู
    { code: "F", title: "Type F — Unexpected failure (Failure)", color: "#ef4444" }, // แดง
  ];

  function renderPageTypeADR() {
    const root = document.getElementById("pageTypeADR");
    if (!root) return;

    root.innerHTML = `
      <div class="typeadr-wrap">
        <div class="typeadr-head">
          <div class="typeadr-emoji">🧪</div>
          <h2>Type of ADR</h2>
          <span class="typeadr-sub">Non-immunologic &amp; Immunologic — หน้านี้ไม่เชื่อมข้อมูลกับหน้าอื่น</span>
        </div>

        <div class="typeadr-grid">
          ${TYPES.map((t, i) => `
            <label class="typeadr-card" data-code="${t.code}" style="--cardColor:${t.color}">
              <input type="checkbox" class="typeadr-check" data-code="${t.code}" ${i===0?"":""}/>
              <div class="typeadr-badge">Type ${t.code}</div>
              <div class="typeadr-title">${t.title}</div>
              <div class="typeadr-slot">— ใส่เนื้อหารายละเอียดของ Type ${t.code} ภายหลัง —</div>
            </label>
          `).join("")}
        </div>

        <div class="typeadr-result" id="typeadrResult">
          <div class="typeadr-result-title">ผลที่เลือก:</div>
          <div class="typeadr-result-chip" id="typeadrResultChip">— ยังไม่เลือก —</div>
        </div>

        <div class="typeadr-footer">
          <button id="typeadrConfirm" class="typeadr-confirm">กดยืนยันผล</button>
        </div>
      </div>

      <!-- Modal -->
      <div id="typeadrModal" class="typeadr-modal" aria-hidden="true">
        <div class="typeadr-modal-backdrop"></div>
        <div class="typeadr-modal-card" role="dialog" aria-modal="true">
          <div class="typeadr-modal-icon" id="typeadrModalIcon">!</div>
          <div class="typeadr-modal-title" id="typeadrModalTitle">แจ้งเตือน</div>
          <div class="typeadr-modal-body" id="typeadrModalBody">ข้อความแจ้งเตือน</div>
          <div class="typeadr-modal-actions">
            <button class="typeadr-modal-close" id="typeadrModalClose">ปิด</button>
          </div>
        </div>
      </div>
    `;

    // logic เลือกแบบ single-select (ติ๊กได้ทีละ type)
    const checks = Array.from(root.querySelectorAll(".typeadr-check"));
    const chip  = root.querySelector("#typeadrResultChip");
    function updateResult() {
      const picked = checks.find(c => c.checked);
      if (!picked) {
        chip.style.background = "#e5e7eb";
        chip.style.color = "#111827";
        chip.textContent = "— ยังไม่เลือก —";
        return;
      }
      const t = TYPES.find(x => x.code === picked.dataset.code);
      chip.style.background = t.color;
      chip.style.color = "#fff";
      chip.textContent = `Type ${t.code} — ${t.title}`;
    }
    checks.forEach(c => {
      c.addEventListener("change", (e) => {
        if (e.target.checked) {
          // ยกเลิกตัวอื่น ให้เหลือเลือกเดียว
          checks.forEach(o => { if (o !== e.target) o.checked = false; });
          // ไฮไลต์การ์ด
          highlightCards();
        } else {
          // ถ้ากดยกเลิกตัวเดิม ให้ไม่มีตัวเลือก
          highlightCards();
        }
        updateResult();
      });
    });

    function highlightCards() {
      const cards = Array.from(root.querySelectorAll(".typeadr-card"));
      cards.forEach((card) => {
        const code = card.dataset.code;
        const checked = checks.find(c => c.dataset.code === code)?.checked;
        if (checked) card.classList.add("selected");
        else card.classList.remove("selected");
      });
    }
    highlightCards();
    updateResult();

    // ปุ่มยืนยันผล → popup
    const btnConfirm = root.querySelector("#typeadrConfirm");
    const modal = root.querySelector("#typeadrModal");
    const mIcon = root.querySelector("#typeadrModalIcon");
    const mTitle = root.querySelector("#typeadrModalTitle");
    const mBody  = root.querySelector("#typeadrModalBody");
    const mClose = root.querySelector("#typeadrModalClose");

    function openModal(kind, msg) {
      // kind: "ok" | "warn"
      modal.setAttribute("aria-hidden", "false");
      modal.classList.add("show");
      if (kind === "ok") {
        modal.classList.remove("is-warn");
        modal.classList.add("is-ok");
        mIcon.textContent = "✓";
        mTitle.textContent = "ดำเนินการต่อได้";
      } else {
        modal.classList.remove("is-ok");
        modal.classList.add("is-warn");
        mIcon.textContent = "!";
        mTitle.textContent = "ไม่ควรทำต่อ";
      }
      mBody.textContent = msg;
    }
    function closeModal() {
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
    }
    mClose.addEventListener("click", closeModal);
    modal.querySelector(".typeadr-modal-backdrop").addEventListener("click", closeModal);

    btnConfirm.addEventListener("click", () => {
      const picked = checks.find(c => c.checked)?.dataset.code || null;
      if (!picked) {
        openModal("warn", "กรุณาเลือก Type อย่างน้อย 1 รายการก่อนยืนยันผล");
        return;
      }
      // เงื่อนไขป็อปอัพ:
      // A, C, D, E, F → popup สีแดง (warn) บอกว่า “ไม่ทำต่อหน้าถัดไป”
      // B → popup สีเขียว (ok) บอกว่า “ทำต่อหน้าถัดไปได้”
      if (picked === "B") {
        openModal("ok", "เป็น Type B (Bizarre) สามารถทำต่อหน้าถัดไปได้");
      } else {
        openModal("warn", `เป็น Type ${picked} — ไม่ทำต่อหน้าถัดไป`);
      }
    });
  }

  // export + auto-render
  window.renderPageTypeADR = renderPageTypeADR;
  if (document.getElementById("pageTypeADR")) renderPageTypeADR();
})();

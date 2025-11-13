// ===================== page2.js (REPLACE WHOLE FILE) =====================
(function () {
  if (!window.drugAllergyData) window.drugAllergyData = {};
  if (!window.drugAllergyData.page2) window.drugAllergyData.page2 = {};

  // โทนสีหลัก
  const COMMON_BG = "linear-gradient(90deg, rgba(239,246,255,1), rgba(219,234,254,1))";
  const COMMON_BORDER = "rgba(59,130,246,.5)";
  const COMMON_INPUT_BORDER = "rgba(59,130,246,.6)";

  // ─────────────────────────────────────────────────────────────
  // ส่วนที่ 1: อาการ/อาการแสดงระบบอื่นๆ
  // ─────────────────────────────────────────────────────────────
  const FEATURE_GROUPS = [
    {
      key: "resp",
      title: "1. ระบบหายใจ",
      emoji: "🫁",
      bg: COMMON_BG,
      border: COMMON_BORDER,
      inputBorder: COMMON_INPUT_BORDER,
      items: [
        "หายใจมีเสียงวี๊ด",
        "หอบเหนื่อย/หายใจลำบาก (RR>21 หรือ HR>100 หรือ SpO2<94%)",
        "ไอ",
        "มีเสมหะ",
        "ไอเป็นเลือด",
        "ถุงลมเลือดออก",
        "ไม่พบ"
      ]
    },
    {
      key: "cv",
      title: "2. ระบบไหลเวียนโลหิต",
      emoji: "❤️",
      bg: COMMON_BG,
      border: COMMON_BORDER,
      inputBorder: COMMON_INPUT_BORDER,
      items: [
        "เจ็บหน้าอก",
        "ใจสั่น",
        "BP ต่ำ (<90/60)",
        "BP ลดลง ≥30% ของ baseline systolic เดิม",
        "HR สูง (>100)",
        "หน้ามืด/หมดสติ",
        "โลหิตจาง",
        "ซีด",
        "ไม่พบ"
      ]
    },
    {
      key: "gi",
      title: "3. ระบบทางเดินอาหาร",
      emoji: "🍽️",
      bg: COMMON_BG,
      border: COMMON_BORDER,
      inputBorder: COMMON_INPUT_BORDER,
      items: [
        "คลื่นไส้/อาเจียน",
        "กลืนลำบาก",
        "ท้องเสีย",
        "ปวดบิดท้อง",
        "เบื่ออาหาร",
        "ดีซ่าน (ตัวเหลือง/ตาเหลือง)",
        "ปวดแน่นชายโครงด้านขวา",
        "เหงือกเลือดออก",
        "แผลในปาก",
        "เลือดออกในทางเดินอาหาร",
        "ไม่พบ"
      ]
    },
    {
      key: "msk",
      title: "4. ระบบกระดูกและกล้ามเนื้อ",
      emoji: "🦴",
      bg: COMMON_BG,
      border: COMMON_BORDER,
      inputBorder: COMMON_INPUT_BORDER,
      items: ["ปวดข้อ", "ข้ออักเสบ", "ปวดเมื่อยกล้ามเนื้อ", "ไม่พบ"]
    },
    {
      key: "eye",
      title: "5. ความผิดปกติทางตา",
      emoji: "👁️",
      bg: COMMON_BG,
      border: COMMON_BORDER,
      inputBorder: COMMON_INPUT_BORDER,
      items: ["เยื่อบุตาอักเสบ (ตาแดง)", "แผลที่กระจกตา", "ไม่พบ"]
    },
    {
      key: "gu",
      title: "6. ระบบขับถ่าย",
      emoji: "🚽",
      bg: COMMON_BG,
      border: COMMON_BORDER,
      inputBorder: COMMON_INPUT_BORDER,
      items: [
        "ปัสสาวะสีชา/สีดำ",
        "ปวดหลังส่วนเอว",
        "ปัสสาวะออกน้อย",
        "ปัสสาวะสีขุ่น",
        "ไม่พบ"
      ]
    },
    {
      key: "skin_extra",
      title: "7. ระบบผิวหนัง (เพิ่มเติม)",
      emoji: "🧴",
      bg: COMMON_BG,
      border: COMMON_BORDER,
      inputBorder: COMMON_INPUT_BORDER,
      items: ["จุดเลือดออก", "ฟกช้ำ", "ปื้น/จ้ำเลือด", "ไม่พบ"]
    },
    {
      key: "ent",
      title: "8. ระบบหู คอ จมูก",
      emoji: "👂",
      bg: COMMON_BG,
      border: COMMON_BORDER,
      inputBorder: COMMON_INPUT_BORDER,
      items: ["เจ็บคอ", "เลือดกำเดาไหล", "ทอนซิลอักเสบ", "ไม่พบ"]
    },
    {
      key: "other",
      title: "9. ระบบอื่นๆ",
      emoji: "🩻",
      bg: COMMON_BG,
      border: COMMON_BORDER,
      inputBorder: COMMON_INPUT_BORDER,
      items: ["ไข้ Temp > 37.5 °C", "อ่อนเพลีย", "หนาวสั่น", "ไม่พบ"]
    }
  ];

  // ─────────────────────────────────────────────────────────────
  // ส่วนที่ 2: อวัยวะที่ผิดปกติ
  // ─────────────────────────────────────────────────────────────
  const ORGANS = [
    "ต่อมน้ำเหลืองโต",
    "ม้ามโต",
    "ตับอักเสบ",
    "ไตอักเสบ",
    "ไตวาย",
    "กล้ามเนื้อหัวใจอักเสบ",
    "ต่อมไทรอยด์อักเสบ",
    "ปอดอักเสบ",
    "ตับโต",
    "ขาบวม",
    "ไม่พบ"
  ];

  function renderPage2() {
    const root = document.getElementById("page2");
    if (!root) return;

    const d = window.drugAllergyData.page2;

    root.innerHTML = `
      <div class="p2-wrapper" style="background:radial-gradient(circle at top, #dbeafe 0%, #eef2ff 35%, #fff 95%);border:1px solid rgba(59,130,246,.15);border-radius:1.4rem;padding:1.2rem 1.2rem 1.7rem;box-shadow:0 12px 28px rgba(148,163,184,.12);position:relative;">
        <!-- ส่วนที่ 1 -->
        <section class="p2-section" style="background:rgba(239,246,255,.95);border:1px solid rgba(59,130,246,.25);border-radius:1.05rem;padding:1rem 1rem 1.1rem;margin-bottom:1rem;">
          <h2 style="display:flex;align-items:center;gap:.5rem;font-size:1.05rem;font-weight:700;color:#1d4ed8;margin:0 0 1rem;">
            <span>🩺</span><span>ส่วนที่ 1 อาการ/อาการแสดงระบบอื่นๆ</span>
          </h2>
          <div style="display:flex;flex-direction:column;gap:1rem;">
            ${FEATURE_GROUPS.map(group => {
              const saved = d[group.key] || {};
              return `
                <div>
                  <div style="background:${group.bg};border:1px solid ${group.border};border-radius:.9rem;padding:.75rem .75rem .5rem;">
                    <h3 style="display:flex;align-items:center;gap:.45rem;font-size:.9rem;font-weight:700;color:#1f2937;margin:0 0 .55rem;">
                      <span>${group.emoji}</span><span>${group.title}</span>
                    </h3>
                    <div style="display:flex;flex-wrap:wrap;gap:.55rem;">
                      ${group.items.map((txt, idx) => {
                        const id = `${group.key}_${idx}`;
                        const checked = saved[txt]?.checked ? "checked" : "";
                        const detailVal = saved[txt]?.detail || "";
                        return `
                          <label for="${id}" style="display:flex;gap:.5rem;align-items:flex-start;background:rgba(255,255,255,.92);border:1px solid rgba(219,234,254,.7);border-radius:.7rem;padding:.45rem .55rem .55rem;width:calc(50% - .3rem);min-width:220px;">
                            <input type="checkbox" id="${id}" data-group="${group.key}" data-text="${txt}" ${checked} style="margin-top:.25rem;">
                            <div style="flex:1 1 auto;">
                              <div style="font-size:.85rem;color:#1f2937;">${txt}</div>
                              <input type="text" placeholder="รายละเอียด..." class="p2-detail" data-group="${group.key}" data-text="${txt}" value="${detailVal}" style="margin-top:.35rem;width:100%;border:1px solid ${group.inputBorder};border-radius:.5rem;padding:.35rem .5rem;font-size:.78rem;${checked ? "" : "display:none;"}background:rgba(255,255,255,.95);">
                            </div>
                          </label>
                        `;
                      }).join("")}
                    </div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </section>

        <!-- ส่วนที่ 2 -->
        <section class="p2-section" style="background:rgba(248,250,252,1);border:1px solid rgba(148,163,184,.45);border-radius:1.05rem;padding:1rem 1rem 1.1rem;">
          <h2 style="display:flex;align-items:center;gap:.5rem;font-size:1.05rem;font-weight:700;color:#111827;margin:0 0 1rem;">
            <span>🫀</span><span>ส่วนที่ 2 อวัยวะที่ผิดปกติ</span>
          </h2>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(360px,1fr));gap:.6rem;">
            ${ORGANS.map((org, idx) => {
              const id = `org_${idx}`;
              const saved = d.organs && d.organs[org];
              const checked = saved?.checked ? "checked" : "";
              const detailVal = saved?.detail || "";
              return `
                <label for="${id}" style="display:flex;gap:.6rem;align-items:flex-start;background:#ffffff;border:1px solid rgba(148,163,184,.35);border-radius:.7rem;padding:.45rem .55rem .55rem;">
                  <input type="checkbox" id="${id}" data-org="${org}" ${checked} style="margin-top:.25rem;">
                  <div style="flex:1 1 auto;">
                    <div style="font-size:.86rem;color:#1f2937;">${org}</div>
                    <input type="text" placeholder="รายละเอียด..." class="p2-org-detail" data-org="${org}" value="${detailVal}" style="margin-top:.35rem;width:100%;border:1px solid rgba(148,163,184,.75);border-radius:.5rem;padding:.35rem .5rem;font-size:.78rem;${checked ? "" : "display:none;"}background:#fff;">
                  </div>
                </label>
              `;
            }).join("")}
          </div>
        </section>

        <!-- ปุ่มด้านล่าง -->
        <div class="p2-actions" style="margin-top:1.1rem;display:flex;align-items:center;justify-content:space-between;">
          <button id="p2_clear"
            style="background:#ef4444;color:#fff;border:none;padding:.65rem 1rem;border-radius:1rem;font-weight:700;cursor:pointer;box-shadow:0 10px 20px rgba(239,68,68,.25);">
            🗑️ ล้างข้อมูลหน้านี้
          </button>
          <button id="p2_save"
            style="background:linear-gradient(120deg,#6366f1 0%,#7c3aed 60%,#9333ea 100%);color:#fff;border:none;padding:.75rem 1.15rem;border-radius:1rem;font-weight:800;cursor:pointer;box-shadow:0 12px 26px rgba(99,102,241,.28);">
            บันทึกข้อมูลและไปหน้า 3
          </button>
        </div>
      </div>
    `;

    // ผูก event ส่วนที่ 1
    FEATURE_GROUPS.forEach(group => {
      group.items.forEach((txt, idx) => {
        const cb = document.getElementById(`${group.key}_${idx}`);
        const input = root.querySelector(`.p2-detail[data-group="${group.key}"][data-text="${txt}"]`);
        if (!cb || !input) return;
        cb.addEventListener("change", () => {
          input.style.display = cb.checked ? "block" : "none";
          if (!cb.checked) input.value = "";
          collectPage2(true); // live update
        });
        input.addEventListener("input", () => collectPage2(true));
      });
    });

    // ผูก event ส่วนที่ 2
    ORGANS.forEach((org, idx) => {
      const cb = document.getElementById(`org_${idx}`);
      const input = root.querySelector(`.p2-org-detail[data-org="${org}"]`);
      if (!cb || !input) return;
      cb.addEventListener("change", () => {
        input.style.display = cb.checked ? "block" : "none";
        if (!cb.checked) input.value = "";
        collectPage2(true); // live update
      });
      input.addEventListener("input", () => collectPage2(true));
    });

    // ปุ่มล้าง
    document.getElementById("p2_clear").addEventListener("click", () => {
      window.drugAllergyData.page2 = {};
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();
      renderPage2();
      alert("ล้างข้อมูลหน้า 2 แล้ว");
    });

    // ปุ่มบันทึกและไปหน้า 3
    document.getElementById("p2_save").addEventListener("click", () => {
      collectPage2(false);   // เก็บล่าสุด
      finalizePage2();       // mark saved + แจ้งอัปเดต
      alert("บันทึกหน้า 2 แล้ว");
      const btn3 = document.querySelector('.tabs button[data-target="page3"]');
      if (btn3) btn3.click();
    });

    // เก็บครั้งแรกเผื่อ UI อื่นอ่านค่าได้ทันที
    collectPage2(true);
  }

  // เก็บข้อมูล (ถ้า live=true จะยิงอัปเดตสมองทันที)
  function collectPage2(live) {
    const root = document.getElementById("page2");
    if (!root) return;

    const store = (window.drugAllergyData.page2 = window.drugAllergyData.page2 || {});

    // ส่วนที่ 1
    FEATURE_GROUPS.forEach(group => {
      const groupObj = {};
      group.items.forEach((txt, idx) => {
        const cb = document.getElementById(`${group.key}_${idx}`);
        const input = root.querySelector(`.p2-detail[data-group="${group.key}"][data-text="${txt}"]`);
        if (!cb || !input) return;
        if (cb.checked || input.value.trim() !== "") {
          groupObj[txt] = { checked: cb.checked, detail: input.value.trim() };
        }
      });
      store[group.key] = groupObj;
    });

    // ส่วนที่ 2
    const organObj = {};
    ORGANS.forEach((org, idx) => {
      const cb = document.getElementById(`org_${idx}`);
      const input = root.querySelector(`.p2-org-detail[data-org="${org}"]`);
      if (!cb || !input) return;
      if (cb.checked || input.value.trim() !== "") {
        organObj[org] = { checked: cb.checked, detail: input.value.trim() };
      }
    });
    store.organs = organObj;

    store.__touched = true;

    if (window.saveDrugAllergyData) window.saveDrugAllergyData();

    // 🔔 อัปเดตผลประเมินแบบเรียลไทม์ (ไม่ต้องกดบันทึก)
    if (live) {
      document.dispatchEvent(new Event("da:update"));
      if (typeof window.evaluateDrugAllergy === "function") window.evaluateDrugAllergy();
    }
  }

  // ทำเครื่องหมายบันทึก + แจ้งทุกหน้าให้รีเฟรช
  function finalizePage2() {
    const store = window.drugAllergyData.page2 || (window.drugAllergyData.page2 = {});
    store.__saved  = true;
    store.__ts     = Date.now();
    store.__touched = true;
    window.drugAllergyData.page2 = Object.assign({}, store, { __saved: true, __ts: store.__ts, __touched: true });

    if (window.saveDrugAllergyData) window.saveDrugAllergyData();

    document.dispatchEvent(new Event("da:update"));
    if (typeof window.evaluateDrugAllergy === "function") window.evaluateDrugAllergy();
  }

  // export
  window.renderPage2 = renderPage2;
})();

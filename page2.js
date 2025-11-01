// page2.js
(function () {
  // ที่เก็บรวม
  if (!window.drugAllergyData) window.drugAllergyData = {};
  if (!window.drugAllergyData.page2) window.drugAllergyData.page2 = {};

  // ---------- ส่วนที่ 1: อาการระบบอื่นๆ ----------
  // ตอนนี้ให้ทุกระบบใช้สีเดียวกับ "ระบบการมองเห็น"
  const COMMON_BG = "linear-gradient(90deg, rgba(239,246,255,1), rgba(219,234,254,1))";
  const COMMON_BORDER = "rgba(59, 130, 246, .5)";
  const COMMON_INPUT_BORDER = "rgba(59,130,246,.6)";

  const FEATURE_GROUPS = [
    {
      key: "resp",
      title: "1. ระบบหายใจ",
      emoji: "🫁",
      bg: COMMON_BG,
      border: COMMON_BORDER,
      inputBorder: COMMON_INPUT_BORDER,
      // ลบ "เจ็บคอ" แล้ว
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
      title: "5. ระบบการมองเห็น",
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

  // ---------- ส่วนที่ 2: อวัยวะผิดปกติ ----------
  const ORGANS = [
    "ต่อมน้ำเหลืองโต",
    "ม้ามโต",
    "ตับอักเสบ",
    "ไตอักเสบ",
    "ไตวาย",
    "กล้ามเนื้อหัวใจอักเสบ",
    "ต่อมไทรอยด์อักเสบ",
    "ปอดอักเสบ",
    "ไม่พบ"
  ];

  function renderPage2() {
    const root = document.getElementById("page2");
    if (!root) return;
    const d = window.drugAllergyData.page2;

    root.innerHTML = `
      <div class="p2-wrapper" style="background:radial-gradient(circle at top, #dbeafe 0%, #eef2ff 35%, #fff 95%);border:1px solid rgba(59,130,246,.15);border-radius:1.4rem;padding:1.2rem 1.2rem 2.3rem;box-shadow:0 12px 28px rgba(148,163,184,.12);">
        
        <!-- ส่วนที่ 1 -->
        <section class="p2-section" style="background:rgba(239,246,255,.95);border:1px solid rgba(59,130,246,.25);border-radius:1.05rem;padding:1rem 1rem 1.1rem;margin-bottom:1rem;">
          <h2 style="display:flex;align-items:center;gap:.5rem;font-size:1.05rem;font-weight:700;color:#1d4ed8;margin:0 0 1rem;">
            <span>🩺</span>
            <span>ส่วนที่ 1 อาการ/อาการแสดงระบบอื่นๆ</span>
          </h2>

          <!-- grid 2 คอลัมน์ -->
          <div style="
            display:grid;
            grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
            gap: 1rem;
          ">
            ${FEATURE_GROUPS.map(group => {
              const isLast = group.key === "other";
              const saved = d[group.key] || {};
              return `
                <div style="${isLast ? 'grid-column:1 / -1;' : ''}">
                  <div style="background:${group.bg};border:1px solid ${group.border};border-radius:.9rem;padding:.75rem .75rem .5rem;">
                    <h3 style="display:flex;align-items:center;gap:.45rem;font-size:.9rem;font-weight:700;color:#1f2937;margin:0 0 .55rem;">
                      <span>${group.emoji}</span>
                      <span>${group.title}</span>
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
                              <input type="text" placeholder="รายละเอียด..." class="p2-detail" data-group="${group.key}" data-text="${txt}" value="${detailVal}" style="margin-top:.35rem;width:100%;border:1px solid ${group.inputBorder};border-radius:.5rem;padding:.35rem .5rem;font-size:.78rem;${checked ? '' : 'display:none;'}background:rgba(255,255,255,.95);">
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
        <section class="p2-section" style="background:rgba(224,231,255,.9);border:1px solid rgba(79,70,229,.25);border-radius:1.05rem;padding:1rem 1rem 1.1rem;">
          <h2 style="display:flex;align-items:center;gap:.5rem;font-size:1.05rem;font-weight:700;color:#3730a3;margin:0 0 1rem;">
            <span>🫀</span>
            <span>ส่วนที่ 2 อวัยวะที่ผิดปกติ</span>
          </h2>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(360px,1fr));gap:.6rem;">
            ${ORGANS.map((org, idx) => {
              const id = `org_${idx}`;
              const saved = d.organs && d.organs[org];
              const checked = saved?.checked ? "checked" : "";
              const detailVal = saved?.detail || "";
              return `
                <label for="${id}" style="display:flex;gap:.6rem;align-items:flex-start;background:rgba(255,255,255,.95);border:1px solid rgba(79,70,229,.07);border-radius:.7rem;padding:.45rem .55rem .55rem;">
                  <input type="checkbox" id="${id}" data-org="${org}" ${checked} style="margin-top:.25rem;">
                  <div style="flex:1 1 auto;">
                    <div style="font-size:.86rem;color:#1f2937;">${org}</div>
                    <input type="text" placeholder="รายละเอียด..." class="p2-org-detail" data-org="${org}" value="${detailVal}" style="margin-top:.35rem;width:100%;border:1px solid rgba(79,70,229,.32);border-radius:.5rem;padding:.35rem .5rem;font-size:.78rem;${checked ? '' : 'display:none;'}background:rgba(255,255,255,.95);">
                  </div>
                </label>
              `;
            }).join("")}
          </div>
        </section>
      </div>
    `;

    // ---------- events ส่วนที่ 1 ----------
    FEATURE_GROUPS.forEach(group => {
      group.items.forEach((txt, idx) => {
        const cb = document.getElementById(`${group.key}_${idx}`);
        const input = root.querySelector(
          `.p2-detail[data-group="${group.key}"][data-text="${txt}"]`
        );
        if (!cb || !input) return;
        cb.addEventListener("change", () => {
          input.style.display = cb.checked ? "block" : "none";
          if (!cb.checked) input.value = "";
          savePage2();
        });
        input.addEventListener("input", savePage2);
      });
    });

    // ---------- events ส่วนที่ 2 ----------
    ORGANS.forEach((org, idx) => {
      const cb = document.getElementById(`org_${idx}`);
      const input = root.querySelector(
        `.p2-org-detail[data-org="${org}"]`
      );
      if (!cb || !input) return;
      cb.addEventListener("change", () => {
        input.style.display = cb.checked ? "block" : "none";
        if (!cb.checked) input.value = "";
        savePage2();
      });
      input.addEventListener("input", savePage2);
    });

    function savePage2() {
      const store = (window.drugAllergyData.page2 =
        window.drugAllergyData.page2 || {});

      // บันทึกกลุ่มอาการ
      FEATURE_GROUPS.forEach(group => {
        const groupObj = {};
        group.items.forEach((txt, idx) => {
          const cb = document.getElementById(`${group.key}_${idx}`);
          const input = root.querySelector(
            `.p2-detail[data-group="${group.key}"][data-text="${txt}"]`
          );
          if (!cb || !input) return;
          if (cb.checked || input.value.trim() !== "") {
            groupObj[txt] = {
              checked: cb.checked,
              detail: input.value.trim()
            };
          }
        });
        store[group.key] = groupObj;
      });

      // บันทึกอวัยวะ
      const organObj = {};
      ORGANS.forEach((org, idx) => {
        const cb = document.getElementById(`org_${idx}`);
        const input = root.querySelector(
          `.p2-org-detail[data-org="${org}"]`
        );
        if (!cb || !input) return;
        if (cb.checked || input.value.trim() !== "") {
          organObj[org] = {
            checked: cb.checked,
            detail: input.value.trim()
          };
        }
      });
      store.organs = organObj;

      if (window.saveDrugAllergyData) window.saveDrugAllergyData();
    }
  }

  // export
  window.renderPage2 = renderPage2;
})();

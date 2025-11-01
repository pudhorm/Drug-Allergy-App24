// page2.js
(function () {
  // เตรียมที่เก็บรวม
  if (!window.drugAllergyData) window.drugAllergyData = {};
  if (!window.drugAllergyData.page2) window.drugAllergyData.page2 = {};

  // ---------------- กลุ่มอาการตามระบบ (ส่วนที่ 1) ----------------
  // เพิ่มสีรายระบบไว้ในอ็อบเจ็กต์แต่ละอันเลย
  const FEATURE_GROUPS = [
    {
      key: "resp",
      title: "1. ระบบหายใจ",
      emoji: "🫁",
      bg: "linear-gradient(90deg, rgba(254, 242, 242, 0.95), rgba(254, 226, 226, 1))",
      border: "rgba(248, 113, 113, .4)",
      inputBorder: "rgba(248,113,113,.5)",
      items: [
        // ลบ "เจ็บคอ" ออกแล้ว
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
      bg: "linear-gradient(90deg, rgba(255, 244, 230, 0.95), rgba(255, 224, 178, 1))",
      border: "rgba(251, 146, 60, .4)",
      inputBorder: "rgba(251,146,60,.55)",
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
      bg: "linear-gradient(90deg, rgba(255, 250, 230, 0.95), rgba(255, 238, 186, 1))",
      border: "rgba(234, 179, 8, .4)",
      inputBorder: "rgba(234,179,8,.6)",
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
      bg: "linear-gradient(90deg, rgba(236, 252, 203, 0.95), rgba(217, 249, 157, 1))",
      border: "rgba(132, 204, 22, .4)",
      inputBorder: "rgba(132,204,22,.6)",
      items: ["ปวดข้อ", "ข้ออักเสบ", "ปวดเมื่อยกล้ามเนื้อ", "ไม่พบ"]
    },
    {
      key: "eye",
      title: "5. ระบบการมองเห็น",
      emoji: "👁️",
      bg: "linear-gradient(90deg, rgba(239, 246, 255, 0.95), rgba(219, 234, 254, 1))",
      border: "rgba(59, 130, 246, .35)",
      inputBorder: "rgba(59,130,246,.55)",
      items: ["เยื่อบุตาอักเสบ (ตาแดง)", "แผลที่กระจกตา", "ไม่พบ"]
    },
    {
      key: "gu",
      title: "6. ระบบขับถ่าย",
      emoji: "🚽",
      bg: "linear-gradient(90deg, rgba(224, 242, 254, 0.95), rgba(186, 230, 253, 1))",
      border: "rgba(14, 165, 233, .35)",
      inputBorder: "rgba(14,165,233,.55)",
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
      bg: "linear-gradient(90deg, rgba(245, 243, 255, 0.98), rgba(221, 214, 254, 1))",
      border: "rgba(139, 92, 246, .35)",
      inputBorder: "rgba(139,92,246,.55)",
      items: ["จุดเลือดออก", "ฟกช้ำ", "ปื้น/จ้ำเลือด", "ไม่พบ"]
    },
    {
      key: "ent",
      title: "8. ระบบหู คอ จมูก",
      emoji: "👂",
      bg: "linear-gradient(90deg, rgba(255, 241, 242, 0.95), rgba(254, 226, 226, 1))",
      border: "rgba(248, 113, 113, .35)",
      inputBorder: "rgba(248,113,113,.55)",
      items: ["เจ็บคอ", "เลือดกำเดาไหล", "ทอนซิลอักเสบ", "ไม่พบ"]
    },
    {
      key: "other",
      title: "9. ระบบอื่นๆ",
      emoji: "🧪",
      bg: "linear-gradient(90deg, rgba(243, 244, 246, 0.95), rgba(229, 231, 235, 1))",
      border: "rgba(148, 163, 184, .35)",
      inputBorder: "rgba(148,163,184,.6)",
      items: ["ไข้ Temp > 37.5 °C", "อ่อนเพลีย", "หนาวสั่น", "ไม่พบ"]
    }
  ];

  // --------------- อวัยวะที่ผิดปกติ (ส่วนที่ 2) ----------------
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

    // ชั้นนอกสุด (คงโทนชมพู แต่มืดขึ้นนิด)
    root.innerHTML = `
      <div class="p2-wrapper" style="
        background: radial-gradient(circle at top, #ffd5da 0%, #ffccd3 35%, #ffeef1 90%);
        border: 1px solid rgba(255,92,120,.3);
        border-radius: 1.4rem;
        padding: 1.3rem 1.4rem 2.4rem;
        box-shadow: 0 12px 30px rgba(255,120,140,.15);
      ">
        
        <!-- ส่วนที่ 1 -->
        <section class="p2-section" style="
          background: rgba(255, 241, 242, 0.95);
          border: 1px solid rgba(190,18,60,.25);
          border-radius: 1.05rem;
          padding: 1.05rem 1rem 1.1rem;
          margin-bottom: 1.2rem;
        ">
          <h2 style="display:flex;align-items:center;gap:.5rem;font-size:1.05rem;font-weight:700;color:#be123c;margin:0 0 1rem;">
            <span>🩺</span>
            <span>ส่วนที่ 1 อาการ/อาการแสดงระบบอื่นๆ</span>
          </h2>

          ${FEATURE_GROUPS.map(group => {
            const selected = d[group.key] || {};
            return `
              <div class="p2-block" style="
                background: ${group.bg};
                border: 1px solid ${group.border};
                border-radius: .9rem;
                padding: .75rem .8rem .4rem;
                margin-bottom: .65rem;
              ">
                <h3 style="display:flex;align-items:center;gap:.45rem;font-size:.9rem;font-weight:700;color:#7f1d1d;margin:0 0 .55rem;">
                  <span>${group.emoji}</span>
                  <span>${group.title}</span>
                </h3>
                <div class="p2-list" style="display:flex;flex-direction:column;gap:.45rem;">
                  ${group.items
                    .map((txt, idx) => {
                      const id = `${group.key}_${idx}`;
                      const checked = selected[txt]?.checked ? "checked" : "";
                      const detailVal = selected[txt]?.detail || "";
                      return `
                        <label for="${id}" style="
                          display:flex;
                          gap:.6rem;
                          align-items:flex-start;
                          background: rgba(255, 255, 255, .88);
                          border: 1px solid rgba(255,255,255,.2);
                          border-radius:.7rem;
                          padding:.45rem .55rem .55rem;
                        ">
                          <input type="checkbox" id="${id}" data-group="${group.key}" data-text="${txt}" ${checked} style="margin-top:.25rem;">
                          <div style="flex:1 1 auto;">
                            <div style="font-size:.86rem;color:#1f2937;">${txt}</div>
                            <input type="text"
                                   placeholder="รายละเอียด..."
                                   class="p2-detail"
                                   data-group="${group.key}"
                                   data-text="${txt}"
                                   value="${detailVal}"
                                   style="margin-top:.35rem;width:100%;border:1px solid ${group.inputBorder};border-radius:.5rem;padding:.35rem .5rem;font-size:.78rem;${checked ? "" : "display:none;"};background:rgba(255,255,255,.9);">
                          </div>
                        </label>
                      `;
                    })
                    .join("")}
                </div>
              </div>
            `;
          }).join("")}
        </section>

        <!-- ส่วนที่ 2 -->
        <section class="p2-section" style="
          background: rgba(250, 232, 255, 0.95);
          border: 1px solid rgba(217,70,239,.3);
          border-radius: 1.05rem;
          padding: 1.05rem 1rem 1.1rem;
        ">
          <h2 style="display:flex;align-items:center;gap:.5rem;font-size:1.05rem;font-weight:700;color:#86198f;margin:0 0 1rem;">
            <span>🫀</span>
            <span>ส่วนที่ 2 อวัยวะที่ผิดปกติ</span>
          </h2>

          <div style="display:flex;flex-direction:column;gap:.5rem;">
            ${ORGANS.map((org, idx) => {
              const id = `org_${idx}`;
              const saved = d.organs && d.organs[org];
              const checked = saved?.checked ? "checked" : "";
              const detailVal = saved?.detail || "";
              return `
                <label for="${id}" style="
                  display:flex;
                  gap:.6rem;
                  align-items:flex-start;
                  background: rgba(255, 255, 255, .9);
                  border: 1px solid rgba(236,72,153,.12);
                  border-radius:.7rem;
                  padding:.45rem .55rem .55rem;
                ">
                  <input type="checkbox" id="${id}" data-org="${org}" ${checked} style="margin-top:.25rem;">
                  <div style="flex:1 1 auto;">
                    <div style="font-size:.86rem;color:#1f2937;">${org}</div>
                    <input type="text"
                           placeholder="รายละเอียด..."
                           class="p2-org-detail"
                           data-org="${org}"
                           value="${detailVal}"
                           style="margin-top:.35rem;width:100%;border:1px solid rgba(236,72,153,.45);border-radius:.5rem;padding:.35rem .5rem;font-size:.78rem;${checked ? "" : "display:none"};background:rgba(255,255,255,.9);">
                  </div>
                </label>
              `;
            }).join("")}
          </div>
        </section>
      </div>
    `;

    // --------- ผูก event ส่วนที่ 1 ----------
    FEATURE_GROUPS.forEach(group => {
      group.items.forEach((txt, idx) => {
        const cb = document.getElementById(`${group.key}_${idx}`);
        const input = root.querySelector(
          `.p2-detail[data-group="${group.key}"][data-text="${txt}"]`
        );
        if (!cb || !input) return;
        cb.addEventListener("change", () => {
          if (cb.checked) {
            input.style.display = "block";
          } else {
            input.style.display = "none";
            input.value = "";
          }
          savePage2();
        });
        input.addEventListener("input", savePage2);
      });
    });

    // --------- ผูก event ส่วนที่ 2 ----------
    ORGANS.forEach((org, idx) => {
      const cb = document.getElementById(`org_${idx}`);
      const input = root.querySelector(`.p2-org-detail[data-org="${org}"]`);
      if (!cb || !input) return;
      cb.addEventListener("change", () => {
        if (cb.checked) {
          input.style.display = "block";
        } else {
          input.style.display = "none";
          input.value = "";
        }
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

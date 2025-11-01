// page2.js
(function () {
  // -----------------------------
  // 1. นิยามรายการของ "ส่วนที่ 1 อาการ/อาการแสดงระบบอื่นๆ"
  // -----------------------------
  const SYSTEMS = [
    {
      key: "resp", // ระบบหายใจ
      title: "1. ระบบหายใจ",
      icon: "🫁",
      items: [
        { key: "soreThroat", label: "เจ็บคอ" },
        { key: "wheeze", label: "หายใจมีเสียงวี๊ด" },
        {
          key: "dyspnea",
          label: "หอบเหนื่อย/หายใจลำบาก (RR>21 หรือ HR>100 หรือ SpO₂<94%)",
        },
        { key: "cough", label: "ไอ" },
        { key: "sputum", label: "มีเสมหะ" },
        { key: "hemoptysis", label: "ไอเป็นเลือด" },
        { key: "bleb", label: "ถุงลมเลือดออก" },
        { key: "none", label: "ไม่พบ", noDetail: true },
      ],
    },
    {
      key: "cv",
      title: "2. ระบบไหลเวียนโลหิต",
      icon: "❤️",
      items: [
        { key: "chestPain", label: "เจ็บหน้าอก" },
        { key: "palpitation", label: "ใจสั่น" },
        { key: "lowBp", label: "BP ต่ำ (<90/60)" },
        { key: "highHr", label: "HR สูง (>100)" },
        { key: "syncope", label: "หน้ามืด/หมดสติ" },
        { key: "anemia", label: "โลหิตจาง" },
        { key: "pale", label: "ซีด" },
        { key: "none", label: "ไม่พบ", noDetail: true },
      ],
    },
    {
      key: "gi",
      title: "3. ระบบทางเดินอาหาร",
      icon: "🍽️",
      items: [
        { key: "nausea", label: "คลื่นไส้/อาเจียน" },
        { key: "dysphagia", label: "กลืนลำบาก" },
        { key: "diarrhea", label: "ท้องเสีย" },
        { key: "abdPain", label: "ปวดบิดท้อง" },
        { key: "anorexia", label: "เบื่ออาหาร" },
        { key: "jaundice", label: "ดีซ่าน (ตัวเหลือง/ตาเหลือง)" },
        { key: "ruqPain", label: "ปวดแน่นชายโครงด้านขวา" },
        { key: "gumBleed", label: "เหงือกเลือดออก" },
        { key: "oralUlcer", label: "แผลในปาก" },
        { key: "giBleed", label: "เลือดออกในทางเดินอาหาร" },
        { key: "none", label: "ไม่พบ", noDetail: true },
      ],
    },
    {
      key: "msk",
      title: "4. ระบบกระดูกและกล้ามเนื้อ",
      icon: "🦴",
      items: [
        { key: "arthralgia", label: "ปวดข้อ" },
        { key: "arthritis", label: "ข้ออักเสบ" },
        { key: "myalgia", label: "ปวดเมื่อยกล้ามเนื้อ" },
        { key: "none", label: "ไม่พบ", noDetail: true },
      ],
    },
    {
      key: "eye",
      title: "5. ระบบการมองเห็น",
      icon: "👁️",
      items: [
        { key: "conjunctivitis", label: "เยื่อบุตาอักเสบ (ตาแดง)" },
        { key: "corneal", label: "แผลที่กระจกตา" },
        { key: "none", label: "ไม่พบ", noDetail: true },
      ],
    },
    {
      key: "renal",
      title: "6. ระบบขับถ่าย",
      icon: "🚽",
      items: [
        { key: "darkUrine", label: "ปัสสาวะสีชา/สีดำ" },
        { key: "flankPain", label: "ปวดหลังส่วนเอว" },
        { key: "oliguria", label: "ปัสสาวะออกน้อย" },
        { key: "cloudyUrine", label: "ปัสสาวะขุ่น" },
        { key: "none", label: "ไม่พบ", noDetail: true },
      ],
    },
    {
      key: "skinExtra",
      title: "7. ระบบผิวหนัง (เพิ่มเติม)",
      icon: "🩹",
      items: [
        { key: "petechiae", label: "จุดเลือดออก" },
        { key: "bruise", label: "ฟกช้ำ" },
        { key: "purpura", label: "ปื้น/จ้ำเลือด" },
        { key: "none", label: "ไม่พบ", noDetail: true },
      ],
    },
    {
      key: "ent",
      title: "8. ระบบหู คอ จมูก",
      icon: "👂",
      items: [
        { key: "throatPain", label: "เจ็บคอ" },
        { key: "epistaxis", label: "เลือดกำเดาไหล" },
        { key: "tonsillitis", label: "ทอนซิลอักเสบ" },
        { key: "none", label: "ไม่พบ", noDetail: true },
      ],
    },
    {
      key: "other",
      title: "9. ระบบอื่นๆ",
      icon: "🧩",
      items: [
        { key: "fever", label: "ไข้ Temp > 37.5 °C" },
        { key: "fatigue", label: "อ่อนเพลีย" },
        { key: "chill", label: "หนาวสั่น" },
        { key: "none", label: "ไม่พบ", noDetail: true },
      ],
    },
  ];

  // -----------------------------
  // 2. นิยามรายการของ "ส่วนที่ 2 อวัยวะที่ผิดปกติ"
  // -----------------------------
  const ORGANS = [
    { key: "ln", label: "ต่อมน้ำเหลืองโต" },
    { key: "spleen", label: "ม้ามโต" },
    { key: "hepatitis", label: "ตับอักเสบ" },
    { key: "nephritis", label: "ไตอักเสบ" },
    { key: "renalFailure", label: "ไตวาย" },
    { key: "myocarditis", label: "กล้ามเนื้อหัวใจอักเสบ" },
    { key: "thyroiditis", label: "ต่อมไทรอยด์อักเสบ" },
    { key: "pneumonitis", label: "ปอดอักเสบ" },
    { key: "none", label: "ไม่พบ", noDetail: true },
  ];

  // -----------------------------
  // 3. ฟังก์ชัน render หลัก
  // -----------------------------
  function renderPage2() {
    // สร้างที่เก็บข้อมูลกลางถ้ายังไม่มี
    if (!window.drugAllergyData) window.drugAllergyData = {};
    if (!window.drugAllergyData.page2)
      window.drugAllergyData.page2 = { systems: {}, organs: {} };

    const d = window.drugAllergyData.page2;
    const root = document.getElementById("page2");
    if (!root) return;

    // ===== HTML =====
    let html = `
      <div class="p2-wrapper">
        <h2 class="p2-title">หน้า 2: ระบบอื่นๆ และอวัยวะที่ผิดปกติ</h2>

        <!-- ส่วนที่ 1 -->
        <section class="p2-section">
          <h3 class="p2-sec-title"><span class="icon">🩺</span>ส่วนที่ 1 อาการ/อาการแสดงระบบอื่นๆ</h3>
    `;

    // วาดทีละระบบ
    SYSTEMS.forEach((sys) => {
      const sysData = d.systems[sys.key] || {};
      html += `
        <div class="p2-block">
          <h4 class="p2-block-title">${sys.icon} ${sys.title}</h4>
          <div class="p2-list">
      `;
      sys.items.forEach((item) => {
        const itemData = sysData[item.key] || {};
        const checked = itemData.checked ? "checked" : "";
        const detailVal = itemData.detail ? itemData.detail : "";
        const detailStyle =
          item.noDetail || !itemData.checked ? 'style="display:none"' : "";
        const id = `p2_${sys.key}_${item.key}`;
        const detailId = `${id}_detail`;
        html += `
          <label class="p2-item">
            <input type="checkbox" id="${id}" ${checked}>
            <span>${item.label}</span>
          </label>
          ${
            item.noDetail
              ? ""
              : `<input id="${detailId}" class="p2-detail" ${detailStyle} placeholder="ระบุรายละเอียด..." value="${detailVal}">`
          }
        `;
      });
      html += `
          </div>
        </div>
      `;
    });

    html += `
        </section>

        <!-- ส่วนที่ 2 -->
        <section class="p2-section">
          <h3 class="p2-sec-title purple"><span class="icon">❤️</span>ส่วนที่ 2 อวัยวะที่ผิดปกติ</h3>
          <div class="p2-block">
            <div class="p2-list">
    `;

    ORGANS.forEach((org) => {
      const orgData = d.organs[org.key] || {};
      const checked = orgData.checked ? "checked" : "";
      const detailVal = orgData.detail || "";
      const detailStyle =
        org.noDetail || !orgData.checked ? 'style="display:none"' : "";
      const id = `p2_org_${org.key}`;
      const detailId = `${id}_detail`;

      html += `
        <label class="p2-item">
          <input type="checkbox" id="${id}" ${checked}>
          <span>${org.label}</span>
        </label>
        ${
          org.noDetail
            ? ""
            : `<input id="${detailId}" class="p2-detail" ${detailStyle} placeholder="ระบุรายละเอียด..." value="${detailVal}">`
        }
      `;
    });

    html += `
            </div>
          </div>
        </section>

        <!-- ปุ่มล่าง -->
        <div class="p2-actions">
          <button class="btn-danger" id="p2_clear">🗑️ ล้างข้อมูลหน้านี้</button>
          <button class="btn-primary" id="p2_save">บันทึกและไปหน้า 3</button>
        </div>
      </div>
    `;

    root.innerHTML = html;

    // =====================
    // ผูก event ส่วนที่ 1
    // =====================
    SYSTEMS.forEach((sys) => {
      sys.items.forEach((item) => {
        const id = `p2_${sys.key}_${item.key}`;
        const detailId = `${id}_detail`;
        const chk = document.getElementById(id);
        const detail = document.getElementById(detailId);

        if (!chk) return;

        chk.addEventListener("change", () => {
          if (!d.systems[sys.key]) d.systems[sys.key] = {};
          if (!d.systems[sys.key][item.key]) d.systems[sys.key][item.key] = {};

          d.systems[sys.key][item.key].checked = chk.checked;

          if (!item.noDetail && detail) {
            if (chk.checked) {
              detail.style.display = "block";
            } else {
              detail.style.display = "none";
              d.systems[sys.key][item.key].detail = "";
            }
          }

          if (window.saveDrugAllergyData) window.saveDrugAllergyData();
        });

        if (!item.noDetail && detail) {
          detail.addEventListener("input", () => {
            if (!d.systems[sys.key]) d.systems[sys.key] = {};
            if (!d.systems[sys.key][item.key])
              d.systems[sys.key][item.key] = {};
            d.systems[sys.key][item.key].detail = detail.value;
            if (window.saveDrugAllergyData) window.saveDrugAllergyData();
          });
        }
      });
    });

    // =====================
    // ผูก event ส่วนที่ 2
    // =====================
    ORGANS.forEach((org) => {
      const id = `p2_org_${org.key}`;
      const detailId = `${id}_detail`;
      const chk = document.getElementById(id);
      const detail = document.getElementById(detailId);

      if (!chk) return;

      chk.addEventListener("change", () => {
        if (!d.organs[org.key]) d.organs[org.key] = {};
        d.organs[org.key].checked = chk.checked;

        if (!org.noDetail && detail) {
          if (chk.checked) {
            detail.style.display = "block";
          } else {
            detail.style.display = "none";
            d.organs[org.key].detail = "";
          }
        }

        if (window.saveDrugAllergyData) window.saveDrugAllergyData();
      });

      if (!org.noDetail && detail) {
        detail.addEventListener("input", () => {
          if (!d.organs[org.key]) d.organs[org.key] = {};
          d.organs[org.key].detail = detail.value;
          if (window.saveDrugAllergyData) window.saveDrugAllergyData();
        });
      }
    });

    // ปุ่มล้าง
    document.getElementById("p2_clear").addEventListener("click", () => {
      window.drugAllergyData.page2 = { systems: {}, organs: {} };
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();
      renderPage2();
    });

    // ปุ่มบันทึกและไปหน้า 3
    document.getElementById("p2_save").addEventListener("click", () => {
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();
      // เปลี่ยนแท็บไปหน้า 3
      const btn3 = document.querySelector('.tabs button[data-target="page3"]');
      if (btn3) btn3.click();
    });
  }

  // ให้ index.html เรียกได้
  window.renderPage2 = renderPage2;
})();

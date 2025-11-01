// page2.js
(function () {
  function renderPage2() {
    // เตรียมที่เก็บข้อมูลรวม
    if (!window.drugAllergyData) {
      window.drugAllergyData = {};
    }
    if (!window.drugAllergyData.page2) {
      window.drugAllergyData.page2 = {};
    }
    const d = window.drugAllergyData.page2;
    const root = document.getElementById("page2");
    if (!root) return;

    // ========= HTML =========
    root.innerHTML = `
    <div class="p2-wrapper">
      <h2 class="p1-title">หน้า 2: ระบบอื่นๆ / อวัยวะที่ผิดปกติ</h2>

      <!-- ส่วนที่ 1 -->
      <section class="p2-section">
        <h3 class="p2-title"><span class="icon">🧠</span>ส่วนที่ 1 อาการ/อาการแสดงระบบอื่นๆ</h3>

        <!-- 1. ระบบหายใจ -->
        <div class="p2-block">
          <h4><span class="icon">🫁</span> 1. ระบบหายใจ</h4>
          ${row("resp_sore", "เจ็บคอ", d.resp_sore)}
          ${row("resp_wheeze", "หายใจมีเสียงวี๊ด", d.resp_wheeze)}
          ${row("resp_dysp", "หอบเหนื่อย/หายใจลำบาก (RR>21 หรือ HR>100 หรือ SpO2<94%)", d.resp_dysp)}
          ${row("resp_cough", "ไอ", d.resp_cough)}
          ${row("resp_sputum", "มีเสมหะ", d.resp_sputum)}
          ${row("resp_hemop", "ไอเป็นเลือด", d.resp_hemop)}
          ${row("resp_bleb", "ถุงลมเลือดออก", d.resp_bleb)}
          ${row("resp_none", "ไม่พบ", d.resp_none)}
        </div>

        <!-- 2. ระบบไหลเวียนโลหิต -->
        <div class="p2-block">
          <h4><span class="icon">❤️</span> 2. ระบบไหลเวียนโลหิต</h4>
          ${row("cv_chestpain", "เจ็บหน้าอก", d.cv_chestpain)}
          ${row("cv_palp", "ใจสั่น", d.cv_palp)}
          ${row("cv_lowbp", "BP ต่ำ (&lt;90/60)", d.cv_lowbp)}
          ${row("cv_highhr", "HR สูง (&gt;100)", d.cv_highhr)}
          ${row("cv_syncope", "หน้ามืด/หมดสติ", d.cv_syncope)}
          ${row("cv_ery", "โลหิตจาง", d.cv_ery)}
          ${row("cv_shock", "ช็อก", d.cv_shock)}
          ${row("cv_none", "ไม่พบ", d.cv_none)}
        </div>

        <!-- 3. ระบบทางเดินอาหาร -->
        <div class="p2-block">
          <h4><span class="icon">🍽️</span> 3. ระบบทางเดินอาหาร</h4>
          ${row("gi_nausea", "คลื่นไส้/อาเจียน", d.gi_nausea)}
          ${row("gi_dysphagia", "กลืนลำบาก", d.gi_dysphagia)}
          ${row("gi_diarrhea", "ท้องเสีย", d.gi_diarrhea)}
          ${row("gi_abpain", "ปวดบิดท้อง", d.gi_abpain)}
          ${row("gi_anorexia", "เบื่ออาหาร", d.gi_anorexia)}
          ${row("gi_jaundice", "ดีซ่าน (ตัวเหลือง/ตาเหลือง)", d.gi_jaundice)}
          ${row("gi_ulcer", "แผลในปาก", d.gi_ulcer)}
          ${row("gi_bleed", "เลือดออกในทางเดินอาหาร", d.gi_bleed)}
          ${row("gi_none", "ไม่พบ", d.gi_none)}
        </div>

        <!-- 4. กระดูกและกล้ามเนื้อ -->
        <div class="p2-block">
          <h4><span class="icon">🦴</span> 4. ระบบกระดูกและกล้ามเนื้อ</h4>
          ${row("ms_joint", "ปวดข้อ", d.ms_joint)}
          ${row("ms_arthritis", "ข้ออักเสบ", d.ms_arthritis)}
          ${row("ms_myalgia", "ปวดเมื่อยกล้ามเนื้อ", d.ms_myalgia)}
          ${row("ms_none", "ไม่พบ", d.ms_none)}
        </div>

        <!-- 5. การมองเห็น -->
        <div class="p2-block">
          <h4><span class="icon">👁️</span> 5. ระบบการมองเห็น</h4>
          ${row("eye_conj", "เยื่อบุตาอักเสบ (ตาแดง)", d.eye_conj)}
          ${row("eye_cornea", "แผลที่กระจกตา", d.eye_cornea)}
          ${row("eye_none", "ไม่พบ", d.eye_none)}
        </div>

        <!-- 6. ระบบขับถ่าย -->
        <div class="p2-block">
          <h4><span class="icon">🚽</span> 6. ระบบขับถ่าย</h4>
          ${row("uri_dark", "ปัสสาวะสีชา/สีดำ", d.uri_dark)}
          ${row("uri_lo", "ปัสสาวะออกน้อย", d.uri_lo)}
          ${row("uri_turbid", "ปัสสาวะขุ่น", d.uri_turbid)}
          ${row("uri_flank", "ปวดหลังส่วนเอว", d.uri_flank)}
          ${row("uri_none", "ไม่พบ", d.uri_none)}
        </div>

        <!-- 7. ผิวหนังเพิ่มเติม -->
        <div class="p2-block">
          <h4><span class="icon">🧴</span> 7. ระบบผิวหนัง (เพิ่มเติม)</h4>
          ${row("skin_pete", "จุดเลือดออก", d.skin_pete)}
          ${row("skin_purp", "ฟกช้ำ", d.skin_purp)}
          ${row("skin_bullae", "ปื้น/จ้ำเลือด", d.skin_bullae)}
          ${row("skin_none", "ไม่พบ", d.skin_none)}
        </div>

        <!-- 8. หู คอ จมูก -->
        <div class="p2-block">
          <h4><span class="icon">👂</span> 8. ระบบหู คอ จมูก</h4>
          ${row("ent_sore", "เจ็บคอ", d.ent_sore)}
          ${row("ent_bleed", "เลือดกำเดาไหล", d.ent_bleed)}
          ${row("ent_tonsil", "ทอนซิลอักเสบ", d.ent_tonsil)}
          ${row("ent_none", "ไม่พบ", d.ent_none)}
        </div>

        <!-- 9. อื่นๆ -->
        <div class="p2-block">
          <h4><span class="icon">🧩</span> 9. ระบบอื่นๆ</h4>
          ${row("oth_fever", "ไข้ Temp > 37.5 °C", d.oth_fever)}
          ${row("oth_fatigue", "อ่อนเพลีย", d.oth_fatigue)}
          ${row("oth_chill", "หนาวสั่น", d.oth_chill)}
          ${row("oth_none", "ไม่พบ", d.oth_none)}
        </div>
      </section>

      <!-- ส่วนที่ 2 -->
      <section class="p2-section">
        <h3 class="p2-title purple"><span class="icon">🫶</span>ส่วนที่ 2 อวัยวะที่ผิดปกติ</h3>
        <div class="p2-block">
          ${row("org_lymph", "ต่อมน้ำเหลืองโต", d.org_lymph)}
          ${row("org_hepat", "ตับอักเสบ", d.org_hepat)}
          ${row("org_spleen", "ม้ามโต", d.org_spleen)}
          ${row("org_thyroid", "ไทรอยด์อักเสบ", d.org_thyroid)}
          ${row("org_myocard", "กล้ามเนื้อหัวใจอักเสบ", d.org_myocard)}
          ${row("org_lung", "ปอดอักเสบ", d.org_lung)}
          ${row("org_nodes", "ต่อมไทรอยด์อักเสบ", d.org_nodes)}
          ${row("org_none", "ไม่พบ", d.org_none)}
        </div>
      </section>

      <div class="p1-actions">
        <button type="button" class="btn-danger" id="p2_clear">🗑️ ล้างข้อมูลหน้านี้</button>
        <button type="button" class="btn-primary" id="p2_save">บันทึกข้อมูลและไปหน้า 3</button>
      </div>
    </div>
    `;

    // ====== ติด event ให้ช่องรายละเอียดโผล่เมื่อเช็ก ======
    const allRows = root.querySelectorAll(".p2-row");
    allRows.forEach((rowEl) => {
      const cb = rowEl.querySelector("input[type=checkbox]");
      const detail = rowEl.querySelector(".p2-detail");
      if (!cb || !detail) return;
      // ตอนโหลดให้ซิงก์ก่อน
      detail.style.display = cb.checked ? "block" : "none";
      cb.addEventListener("change", () => {
        detail.style.display = cb.checked ? "block" : "none";
      });
    });

    // ล้าง
    root.querySelector("#p2_clear").addEventListener("click", () => {
      window.drugAllergyData.page2 = {};
      renderPage2();
    });

    // บันทึก
    root.querySelector("#p2_save").addEventListener("click", () => {
      const store = {};
      root.querySelectorAll(".p2-row").forEach((rowEl) => {
        const cb = rowEl.querySelector("input[type=checkbox]");
        const detail = rowEl.querySelector(".p2-detail");
        if (!cb) return;
        const id = cb.id;
        store[id] = {
          checked: cb.checked,
          detail: detail ? detail.value : ""
        };
      });
      window.drugAllergyData.page2 = store;
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();
      alert("บันทึกหน้า 2 แล้ว");
      // ไปหน้า 3
      const btn3 = document.querySelector('.tabs button[data-target="page3"]');
      if (btn3) btn3.click();
    });
  }

  // helper: สร้าง 1 แถว checkbox + ช่องพิมพ์
  function row(id, label, prev) {
    const checked = prev && prev.checked ? "checked" : "";
    const val = prev && prev.detail ? prev.detail : "";
    return `
      <div class="p2-row">
        <label class="p2-chk">
          <input type="checkbox" id="${id}" ${checked}>
          <span>${label}</span>
        </label>
        <input type="text" class="p2-detail" placeholder="ระบุรายละเอียด..." value="${val}" style="display:none">
      </div>
    `;
  }

  // ให้ index.html เรียกได้
  window.renderPage2 = renderPage2;
})();

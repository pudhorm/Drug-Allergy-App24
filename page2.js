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

    root.innerHTML = `
    <div class="p2-wrapper">
      <h2 class="p2-title">หน้า 2: ระบบอื่นๆ</h2>

      <!-- 🫁 ระบบหายใจ -->
      <section class="p2-section">
        <h3 class="p2-sec-title"><span class="icon">🫁</span>ระบบหายใจ</h3>
        <div class="p2-grid">
          <label class="p2-chk">
            <input type="checkbox" id="p2_resp_dyspnea" ${d.resp_dyspnea ? "checked" : ""}>
            <span>หายใจลำบาก</span>
          </label>
          <input id="p2_resp_dyspnea_txt" class="p2-detail" placeholder="รายละเอียด..." value="${d.resp_dyspnea_txt || ""}">

          <label class="p2-chk">
            <input type="checkbox" id="p2_resp_wheeze" ${d.resp_wheeze ? "checked" : ""}>
            <span>หายใจมีเสียงวี๊ด</span>
          </label>
          <input id="p2_resp_wheeze_txt" class="p2-detail" placeholder="ระบุความถี่/ปัจจัยกระตุ้น..." value="${d.resp_wheeze_txt || ""}">

          <label class="p2-chk">
            <input type="checkbox" id="p2_resp_sob" ${d.resp_sob ? "checked" : ""}>
            <span>หอบเหนื่อย</span>
          </label>
          <input id="p2_resp_sob_txt" class="p2-detail" placeholder="ระบุระดับความรุนแรง..." value="${d.resp_sob_txt || ""}">
        </div>
      </section>

      <!-- ❤️ ระบบไหลเวียนโลหิต -->
      <section class="p2-section">
        <h3 class="p2-sec-title red"><span class="icon">❤️</span>ระบบไหลเวียนโลหิต</h3>
        <div class="p2-grid">
          <label class="p2-chk">
            <input type="checkbox" id="p2_cv_dizzy" ${d.cv_dizzy ? "checked" : ""}>
            <span>หน้ามืด / วิงเวียน</span>
          </label>
          <input id="p2_cv_dizzy_txt" class="p2-detail" placeholder="เมื่อไหร่ / เป็นนานเท่าไร" value="${d.cv_dizzy_txt || ""}">

          <label class="p2-chk">
            <input type="checkbox" id="p2_cv_hrhigh" ${d.cv_hrhigh ? "checked" : ""}>
            <span>ชีพจร/HR สูง</span>
          </label>
          <input id="p2_cv_hrhigh_val" class="p2-detail" placeholder="ระบุ HR เช่น 120 bpm" value="${d.cv_hrhigh_val || ""}">

          <label class="p2-chk">
            <input type="checkbox" id="p2_cv_bphigh" ${d.cv_bphigh ? "checked" : ""}>
            <span>ความดันโลหิตสูง</span>
          </label>
          <input id="p2_cv_bphigh_val" class="p2-detail" placeholder="ระบุ BP เช่น 160/100 mmHg" value="${d.cv_bphigh_val || ""}">
        </div>
      </section>

      <!-- 🍽️ ระบบทางเดินอาหาร -->
      <section class="p2-section">
        <h3 class="p2-sec-title orange"><span class="icon">🍽️</span>ระบบทางเดินอาหาร</h3>
        <div class="p2-grid">
          <label class="p2-chk">
            <input type="checkbox" id="p2_gi_nausea" ${d.gi_nausea ? "checked" : ""}>
            <span>คลื่นไส้ / อาเจียน</span>
          </label>
          <input id="p2_gi_nausea_txt" class="p2-detail" placeholder="จำนวนครั้ง/ลักษณะ" value="${d.gi_nausea_txt || ""}">

          <label class="p2-chk">
            <input type="checkbox" id="p2_gi_dysphagia" ${d.gi_dysphagia ? "checked" : ""}>
            <span>กลืนลำบาก</span>
          </label>
          <input id="p2_gi_dysphagia_txt" class="p2-detail" placeholder="อาหารแข็ง/เหลว/น้ำลาย" value="${d.gi_dysphagia_txt || ""}">

          <label class="p2-chk">
            <input type="checkbox" id="p2_gi_diarrhea" ${d.gi_diarrhea ? "checked" : ""}>
            <span>ท้องเสีย</span>
          </label>
          <input id="p2_gi_diarrhea_txt" class="p2-detail" placeholder="ความถี่ / ลักษณะอุจจาระ" value="${d.gi_diarrhea_txt || ""}">

          <label class="p2-chk">
            <input type="checkbox" id="p2_gi_abd_pain" ${d.gi_abd_pain ? "checked" : ""}>
            <span>ปวดบิดท้อง</span>
          </label>
          <input id="p2_gi_abd_pain_txt" class="p2-detail" placeholder="ตำแหน่ง / ระดับความปวด" value="${d.gi_abd_pain_txt || ""}">

          <label class="p2-chk">
            <input type="checkbox" id="p2_gi_anorexia" ${d.gi_anorexia ? "checked" : ""}>
            <span>เบื่ออาหาร</span>
          </label>
          <input id="p2_gi_anorexia_txt" class="p2-detail" placeholder="เป็นมานานเท่าไร" value="${d.gi_anorexia_txt || ""}">

          <label class="p2-chk">
            <input type="checkbox" id="p2_gi_sorethroat" ${d.gi_sorethroat ? "checked" : ""}>
            <span>เจ็บคอ</span>
          </label>
          <input id="p2_gi_sorethroat_txt" class="p2-detail" placeholder="ระบุอาการ/มีแผลไหม" value="${d.gi_sorethroat_txt || ""}">
        </div>
      </section>

      <!-- 🦴 ระบบกล้ามเนื้อและกระดูก -->
      <section class="p2-section">
        <h3 class="p2-sec-title teal"><span class="icon">🦴</span>ระบบกล้ามเนื้อและกระดูก</h3>
        <div class="p2-grid">
          <label class="p2-chk">
            <input type="checkbox" id="p2_ms_jointpain" ${d.ms_jointpain ? "checked" : ""}>
            <span>ปวดข้อ</span>
          </label>
          <input id="p2_ms_jointpain_txt" class="p2-detail" placeholder="ข้อไหน / เสียงกรอบแกรบ / เช้าเย็น" value="${d.ms_jointpain_txt || ""}">

          <label class="p2-chk">
            <input type="checkbox" id="p2_ms_arthritis" ${d.ms_arthritis ? "checked" : ""}>
            <span>ข้ออักเสบ</span>
          </label>
          <input id="p2_ms_arthritis_txt" class="p2-detail" placeholder="บวม แดง ร้อน?" value="${d.ms_arthritis_txt || ""}">

          <label class="p2-chk">
            <input type="checkbox" id="p2_ms_myalgia" ${d.ms_myalgia ? "checked" : ""}>
            <span>ปวดเมื่อยตามตัว</span>
          </label>
          <input id="p2_ms_myalgia_txt" class="p2-detail" placeholder="ระบุระดับ / ช่วงเวลา" value="${d.ms_myalgia_txt || ""}">
        </div>
      </section>

      <!-- 🚽 ระบบขับถ่าย -->
      <section class="p2-section">
        <h3 class="p2-sec-title brown"><span class="icon">🚽</span>ระบบขับถ่าย</h3>
        <div class="p2-grid">
          <label class="p2-chk">
            <input type="checkbox" id="p2_urine_oligo" ${d.urine_oligo ? "checked" : ""}>
            <span>ปัสสาวะออกน้อย</span>
          </label>
          <input id="p2_urine_oligo_txt" class="p2-detail" placeholder="ml/วัน หรือ mL/kg/hr" value="${d.urine_oligo_txt || ""}">

          <label class="p2-chk">
            <input type="checkbox" id="p2_urine_blood" ${d.urine_blood ? "checked" : ""}>
            <span>เลือดออกในปัสสาวะ</span>
          </label>
          <input id="p2_urine_blood_txt" class="p2-detail" placeholder="สีลักษณะ / ปริมาณ" value="${d.urine_blood_txt || ""}">
        </div>
      </section>

      <!-- 👁️ ระบบการมองเห็น -->
      <section class="p2-section">
        <h3 class="p2-sec-title indigo"><span class="icon">👁️</span>ระบบการมองเห็น</h3>
        <div class="p2-grid">
          <label class="p2-chk">
            <input type="checkbox" id="p2_eye_conj" ${d.eye_conj ? "checked" : ""}>
            <span>เยื่อบุตาอักเสบ / ตาแดง</span>
          </label>
          <input id="p2_eye_conj_txt" class="p2-detail" placeholder="ข้างเดียว/สองข้าง มีขี้ตาไหม" value="${d.eye_conj_txt || ""}">

          <label class="p2-chk">
            <input type="checkbox" id="p2_eye_cornea" ${d.eye_cornea ? "checked" : ""}>
            <span>แผลที่กระจกตา</span>
          </label>
          <input id="p2_eye_cornea_txt" class="p2-detail" placeholder="ลักษณะแผล / เจ็บแสบ" value="${d.eye_cornea_txt || ""}">
        </div>
      </section>

      <!-- 🧩 ระบบอื่นๆ -->
      <section class="p2-section">
        <h3 class="p2-sec-title violet"><span class="icon">🧩</span>ระบบอื่นๆ</h3>
        <div class="p2-grid">
          <label>ไข้ (°C)
            <input id="p2_other_fever" type="text" value="${d.other_fever || ""}" placeholder="เช่น 38.5">
          </label>
          <label>อ่อนเพลีย / ไม่สบายตัว
            <input id="p2_other_fatigue" type="text" value="${d.other_fatigue || ""}" placeholder="ระบุดีเทล">
          </label>
        </div>
      </section>

      <!-- ปุ่มล่าง -->
      <div class="p2-actions">
        <button class="btn-danger" id="p2_clear">🗑️ ล้างข้อมูลหน้านี้</button>
        <button class="btn-primary" id="p2_save">บันทึกข้อมูลและไปหน้า 3</button>
      </div>
    </div>
    `;

    // ====== ผูกปุ่ม ======
    document.getElementById("p2_clear").addEventListener("click", () => {
      window.drugAllergyData.page2 = {};
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();
      renderPage2();
    });

    document.getElementById("p2_save").addEventListener("click", () => {
      const store = window.drugAllergyData.page2;

      // ระบบหายใจ
      store.resp_dyspnea = document.getElementById("p2_resp_dyspnea").checked;
      store.resp_dyspnea_txt = document.getElementById("p2_resp_dyspnea_txt").value;
      store.resp_wheeze = document.getElementById("p2_resp_wheeze").checked;
      store.resp_wheeze_txt = document.getElementById("p2_resp_wheeze_txt").value;
      store.resp_sob = document.getElementById("p2_resp_sob").checked;
      store.resp_sob_txt = document.getElementById("p2_resp_sob_txt").value;

      // ระบบไหลเวียน
      store.cv_dizzy = document.getElementById("p2_cv_dizzy").checked;
      store.cv_dizzy_txt = document.getElementById("p2_cv_dizzy_txt").value;
      store.cv_hrhigh = document.getElementById("p2_cv_hrhigh").checked;
      store.cv_hrhigh_val = document.getElementById("p2_cv_hrhigh_val").value;
      store.cv_bphigh = document.getElementById("p2_cv_bphigh").checked;
      store.cv_bphigh_val = document.getElementById("p2_cv_bphigh_val").value;

      // GI
      store.gi_nausea = document.getElementById("p2_gi_nausea").checked;
      store.gi_nausea_txt = document.getElementById("p2_gi_nausea_txt").value;
      store.gi_dysphagia = document.getElementById("p2_gi_dysphagia").checked;
      store.gi_dysphagia_txt = document.getElementById("p2_gi_dysphagia_txt").value;
      store.gi_diarrhea = document.getElementById("p2_gi_diarrhea").checked;
      store.gi_diarrhea_txt = document.getElementById("p2_gi_diarrhea_txt").value;
      store.gi_abd_pain = document.getElementById("p2_gi_abd_pain").checked;
      store.gi_abd_pain_txt = document.getElementById("p2_gi_abd_pain_txt").value;
      store.gi_anorexia = document.getElementById("p2_gi_anorexia").checked;
      store.gi_anorexia_txt = document.getElementById("p2_gi_anorexia_txt").value;
      store.gi_sorethroat = document.getElementById("p2_gi_sorethroat").checked;
      store.gi_sorethroat_txt = document.getElementById("p2_gi_sorethroat_txt").value;

      // กล้ามเนื้อ
      store.ms_jointpain = document.getElementById("p2_ms_jointpain").checked;
      store.ms_jointpain_txt = document.getElementById("p2_ms_jointpain_txt").value;
      store.ms_arthritis = document.getElementById("p2_ms_arthritis").checked;
      store.ms_arthritis_txt = document.getElementById("p2_ms_arthritis_txt").value;
      store.ms_myalgia = document.getElementById("p2_ms_myalgia").checked;
      store.ms_myalgia_txt = document.getElementById("p2_ms_myalgia_txt").value;

      // ขับถ่าย
      store.urine_oligo = document.getElementById("p2_urine_oligo").checked;
      store.urine_oligo_txt = document.getElementById("p2_urine_oligo_txt").value;
      store.urine_blood = document.getElementById("p2_urine_blood").checked;
      store.urine_blood_txt = document.getElementById("p2_urine_blood_txt").value;

      // ตา
      store.eye_conj = document.getElementById("p2_eye_conj").checked;
      store.eye_conj_txt = document.getElementById("p2_eye_conj_txt").value;
      store.eye_cornea = document.getElementById("p2_eye_cornea").checked;
      store.eye_cornea_txt = document.getElementById("p2_eye_cornea_txt").value;

      // อื่นๆ
      store.other_fever = document.getElementById("p2_other_fever").value;
      store.other_fatigue = document.getElementById("p2_other_fatigue").value;

      if (window.saveDrugAllergyData) window.saveDrugAllergyData();

      alert("บันทึกหน้า 2 แล้ว");

      // ไปหน้า 3
      const btn3 = document.querySelector('.tabs button[data-target="page3"]');
      if (btn3) btn3.click();
    });
  }

  // ให้ index.html เรียกได้
  window.renderPage2 = renderPage2;
})();

// page1.js
(function () {
  // ข้อมูลตัวเลือก
  const SHAPES = [
    "ตุ่มนูน",
    "ตุ่มแบนราบ",
    "ปื้นนูน",
    "วงกลมชั้นเดียว",
    "วงกลม 3 ชั้น",
    "วงรี",
    "ขอบหยัก",
    "ขอบเรียบ",
    "ขอบไม่ชัดเจน",
    "จุดเล็ก",
    "จ้ำเลือด"
  ];
  const COLORS = [
    "แดง",
    "แดงไหม้",
    "แดงซีด",
    "ซีด",
    "ใส",
    "ม่วง",
    "เหลือง",
    "มันเงา",
    "ดำ",
    "เทา"
  ];
  const LOCS = [
    "ทั่วร่างกาย",
    "มือ",
    "เท้า",
    "หน้า",
    "แขน",
    "ขา",
    "ริมฝีปาก",
    "รอบดวงตา",
    "ลำคอ",
    "อวัยวะเพศ",
    "ทวาร",
    "หลัง"
  ];

  // ฟังก์ชันสร้าง checkbox ธรรมดา
  function cb(id, label, checked) {
    return (
      `<label class="p1-chk">` +
      `<input type="checkbox" id="${id}" ${checked ? "checked" : ""}>` +
      `<span>${label}</span>` +
      `</label>`
    );
  }

  function renderPage1() {
    const d = window.drugAllergyData.page1 || {};
    const el = document.getElementById("page1");

    el.innerHTML =
      `
<div class="p1-wrapper">
  <h2 class="p1-title">หน้า 1: ระบบผิวหนัง / ข้อมูลผู้ป่วย</h2>

  <!-- ส่วนที่ 1 -->
  <section class="p1-section">
    <h3 class="p1-sec-title"><span class="icon">👤</span>ส่วนที่ 1 ข้อมูลผู้ป่วย</h3>
    <div class="p1-grid">
      <label>ชื่อ-สกุล
        <input id="p1_name" value="${d.name || ""}">
      </label>
      <label>HN
        <input id="p1_hn" value="${d.hn || ""}">
      </label>
      <label>อายุ (ปี)
        <input type="number" id="p1_age" value="${d.age || ""}">
      </label>
      <label>น้ำหนัก (กก.)
        <input type="number" id="p1_weight" value="${d.weight || ""}">
      </label>
      <label class="p1-col-2">โรคประจำตัว
        <input id="p1_underlying" value="${d.underlying || ""}">
      </label>
      <label class="p1-col-2">ประวัติการแพ้ยา (เดิม)
        <textarea id="p1_history">${d.drugAllergyHistory || ""}</textarea>
      </label>
    </div>
  </section>

  <!-- ส่วนที่ 2 -->
  <section class="p1-section">
    <h3 class="p1-sec-title blue"><span class="icon">🔍</span>ส่วนที่ 2 ประเมินอาการ</h3>

    <!-- 1.1 รูปร่างผื่น -->
    <div class="p1-block">
      <h4>1.1 รูปร่างผื่น</h4>
      <div class="p1-two-cols">
        ${SHAPES.map((s, i) =>
          cb("shape_" + i, s, d.rashShapes && d.rashShapes.includes(s))
        ).join("")}
      </div>
      <input id="shape_other" class="p1-other" placeholder="อื่นๆ ระบุ..." value="${d.rashShapesOther || ""}">
    </div>

    <!-- 1.2 สีผื่น -->
    <div class="p1-block">
      <h4>1.2 สีผื่น</h4>
      <div class="p1-two-cols">
        ${COLORS.map((c, i) =>
          cb("color_" + i, c, d.rashColors && d.rashColors.includes(c))
        ).join("")}
      </div>
      <input id="color_other" class="p1-other" placeholder="อื่นๆ ระบุ..." value="${d.rashColorsOther || ""}">
    </div>

    <!-- 1.3 ตุ่มน้ำ -->
    <div class="p1-block">
      <h4>1.3 ตุ่มน้ำ</h4>
      ${cb("blister_small", "ตุ่มน้ำขนาดเล็ก", d.blisters?.small)}
      ${cb("blister_medium", "ตุ่มน้ำขนาดกลาง", d.blisters?.medium)}
      ${cb("blister_large", "ตุ่มน้ำขนาดใหญ่", d.blisters?.large)}
      <input id="blister_other" class="p1-other" placeholder="อื่นๆ ระบุ..." value="${d.blisters?.other || ""}">
    </div>

    <!-- 1.4 ผิวหลุดลอก -->
    <div class="p1-block">
      <h4>1.4 ผิวหลุดลอก</h4>
      ${cb("detach_center", "ผิวหนังหลุดลอกตรงกลางผื่น", d.skinDetach?.center)}
      ${cb("detach_lt10", "ผิวหนังหลุดลอกไม่เกิน 10% ของ BSA", d.skinDetach?.lt10)}
      ${cb("detach_gt30", "ผิวหนังหลุดลอกเกิน 30% ของ BSA", d.skinDetach?.gt30)}
      ${cb("detach_none", "ไม่พบ", d.skinDetach?.none)}
      <input id="detach_other" class="p1-other" placeholder="อื่นๆ ระบุ..." value="${d.skinDetach?.other || ""}">
    </div>

    <!-- 1.5 ขุย/แห้ง/ลอก -->
    <div class="p1-block">
      <h4>1.5 ขุย/แห้ง/ลอก</h4>
      ${cb("scale_scale", "ขุย", d.scales?.scale)}
      ${cb("scale_dry", "แห้ง", d.scales?.dry)}
      ${cb("scale_peel", "ลอก", d.scales?.peel)}
      ${cb("scale_none", "ไม่พบ", d.scales?.none)}
      <input id="scale_other" class="p1-other" placeholder="อื่นๆ ระบุ..." value="${d.scales?.other || ""}">
    </div>

    <!-- 1.6 น้ำเหลือง/สะเก็ด -->
    <div class="p1-block">
      <h4>1.6 น้ำเหลือง/สะเก็ด</h4>
      ${cb("ex_serous", "น้ำเหลือง", d.exudate?.serous)}
      ${cb("ex_crust", "สะเก็ด", d.exudate?.crust)}
      ${cb("ex_none", "ไม่พบ", d.exudate?.none)}
      <input id="ex_other" class="p1-other" placeholder="อื่นๆ ระบุ..." value="${d.exudate?.other || ""}">
    </div>

    <!-- 1.7 คัน -->
    <div class="p1-block">
      <h4>1.7 คัน</h4>
      ${cb("itch_has", "คัน ✓", d.itch?.has)}
      <div class="p1-indent">
        ${cb("itch_severe", "คันมาก", d.itch?.severe)}
        ${cb("itch_mild", "คันน้อย", d.itch?.mild)}
      </div>
      ${cb("itch_none", "ไม่คัน", d.itch?.none)}
    </div>

    <!-- 1.8 ปวด/แสบ/เจ็บ -->
    <div class="p1-block">
      <h4>1.8 ปวด/แสบ/เจ็บ</h4>
      ${cb("pain_pain", "ปวด", d.pain?.pain)}
      ${cb("pain_burn", "แสบ", d.pain?.burn)}
      ${cb("pain_sore", "เจ็บ", d.pain?.sore)}
      ${cb("pain_none", "ไม่พบ", d.pain?.none)}
    </div>

    <!-- 1.9 บวม -->
    <div class="p1-block">
      <h4>1.9 บวม</h4>
      ${cb("sw_has", "บวม", d.swelling?.has)}
      ${cb("sw_none", "ไม่บวม", d.swelling?.none)}
    </div>

    <!-- 1.10 ตุ่มหนอง -->
    <div class="p1-block">
      <h4>1.10 ตุ่มหนอง</h4>
      ${cb("pus_has", "พบ", d.pustule?.has)}
      ${cb("pus_none", "ไม่พบ", d.pustule?.none)}
      <input id="pus_detail" class="p1-other" placeholder="รายละเอียด..." value="${d.pustule?.detail || ""}">
    </div>

    <!-- 1.21 ตำแหน่ง -->
    <div class="p1-block">
      <h4>1.21 ตำแหน่งที่พบ / การกระจายตัว</h4>
      <div class="p1-two-cols">
        ${LOCS.map(loc => cb("loc_" + loc, loc, d.locations && d.locations.includes(loc))).join("")}
      </div>
      <label>การกระจายตัว
        <select id="p1_distribution">
          <option value="">เลือก...</option>
          <option value="สมมาตร" ${d.distribution === "สมมาตร" ? "selected" : ""}>สมมาตร</option>
          <option value="ไม่สมมาตร" ${d.distribution === "ไม่สมมาตร" ? "selected" : ""}>ไม่สมมาตร</option>
          <option value="อื่นๆ" ${d.distribution === "อื่นๆ" ? "selected" : ""}>อื่นๆ</option>
        </select>
      </label>
      <input id="p1_distribution_other" class="p1-other" placeholder="ถ้าอื่นๆ ระบุ..." value="${d.distributionOther || ""}">
    </div>
  </section>

  <!-- ส่วนที่ 3 เวลา -->
  <section class="p1-section">
    <h3 class="p1-sec-title purple"><span class="icon">⏱️</span>ส่วนที่ 3 ระยะเวลาการเกิดอาการ</h3>
    <label>เลือกช่วงเวลา
      <select id="p1_onset">
        <option value="">เลือก...</option>
        <option value="1h" ${d.onset === "1h" ? "selected" : ""}>ภายใน 1 ชั่วโมง</option>
        <option value="1to6h" ${d.onset === "1to6h" ? "selected" : ""}>ภายใน 1–6 ชั่วโมง</option>
        <option value="6to24h" ${d.onset === "6to24h" ? "selected" : ""}>ภายใน 6–24 ชั่วโมง</option>
        <option value="1w" ${d.onset === "1w" ? "selected" : ""}>ภายใน 1 สัปดาห์</option>
        <option value="2w" ${d.onset === "2w" ? "selected" : ""}>ภายใน 2 สัปดาห์</option>
        <option value="3w" ${d.onset === "3w" ? "selected" : ""}>ภายใน 3 สัปดาห์</option>
        <option value="4w" ${d.onset === "4w" ? "selected" : ""}>ภายใน 4 สัปดาห์</option>
        <option value="other" ${d.onset === "other" ? "selected" : ""}>อื่นๆ ระบุ…</option>
      </select>
    </label>
    <input id="p1_onset_other" class="p1-other" placeholder="ถ้าอื่นๆ ระบุ..." value="${d.onsetOther || ""}">
  </section>

  <!-- ส่วนที่ 4 อัปโหลดรูป -->
  <section class="p1-section">
    <h3 class="p1-sec-title green"><span class="icon">🖼️</span>ส่วนที่ 4 แนบรูปถ่ายอาการผู้ป่วย</h3>
    <div class="p1-upload" id="p1_drop">
      <p>อัปโหลดรูปภาพ หรือ ลากมาวาง</p>
      <button type="button" class="btn-upload" id="p1_pick">เลือกไฟล์</button>
      <input type="file" id="p1_file" accept="image/*" style="display:none">
      <p class="p1-upload-name" id="p1_file_name">${d.imageName ? "ไฟล์ปัจจุบัน: " + d.imageName : "ยังไม่ได้เลือกรูป"}</p>
      ${d.imageDataUrl ? `<img src="${d.imageDataUrl}" class="p1-preview">` : ""}
    </div>
  </section>

  <!-- ปุ่ม -->
  <div class="p1-actions">
    <button class="btn-danger" id="p1_clear">🗑️ ล้างข้อมูลหน้านี้</button>
    <button class="btn-primary" id="p1_save">บันทึกข้อมูลและไปหน้า 2</button>
  </div>
</div>
`;

    // ==== อัปโหลดรูป ====
    const fileInput = document.getElementById("p1_file");
    const pickBtn = document.getElementById("p1_pick");
    const drop = document.getElementById("p1_drop");
    const nameEl = document.getElementById("p1_file_name");

    pickBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      const f = e.target.files[0];
      if (f) readFile(f);
    });
    drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("dragover"); });
    drop.addEventListener("dragleave", () => drop.classList.remove("dragover"));
    drop.addEventListener("drop", (e) => {
      e.preventDefault();
      drop.classList.remove("dragover");
      const f = e.dataTransfer.files[0];
      if (f) readFile(f);
    });

    function readFile(f) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const p1 = window.drugAllergyData.page1;
        p1.imageName = f.name;
        p1.imageDataUrl = ev.target.result;
        nameEl.textContent = "ไฟล์ปัจจุบัน: " + f.name;
        if (window.saveDrugAllergyData) window.saveDrugAllergyData();
      };
      reader.readAsDataURL(f);
    }

    // ==== ปุ่มล้าง ====
    document.getElementById("p1_clear").addEventListener("click", () => {
      window.drugAllergyData.page1 = {};
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();
      renderPage1();
    });

    // ==== ปุ่มบันทึก ====
    document.getElementById("p1_save").addEventListener("click", () => {
      const store = window.drugAllergyData.page1;

      // ส่วนที่ 1
      store.name = document.getElementById("p1_name").value;
      store.hn = document.getElementById("p1_hn").value;
      store.age = document.getElementById("p1_age").value;
      store.weight = document.getElementById("p1_weight").value;
      store.underlying = document.getElementById("p1_underlying").value;
      store.drugAllergyHistory = document.getElementById("p1_history").value;

      // 1.1
      store.rashShapes = SHAPES.filter((s, i) => document.getElementById("shape_" + i).checked);
      store.rashShapesOther = document.getElementById("shape_other").value;

      // 1.2
      store.rashColors = COLORS.filter((c, i) => document.getElementById("color_" + i).checked);
      store.rashColorsOther = document.getElementById("color_other").value;

      // 1.3
      store.blisters = {
        small: document.getElementById("blister_small").checked,
        medium: document.getElementById("blister_medium").checked,
        large: document.getElementById("blister_large").checked,
        other: document.getElementById("blister_other").value
      };

      // 1.4
      store.skinDetach = {
        center: document.getElementById("detach_center").checked,
        lt10: document.getElementById("detach_lt10").checked,
        gt30: document.getElementById("detach_gt30").checked,
        none: document.getElementById("detach_none").checked,
        other: document.getElementById("detach_other").value
      };

      // 1.5
      store.scales = {
        scale: document.getElementById("scale_scale").checked,
        dry: document.getElementById("scale_dry").checked,
        peel: document.getElementById("scale_peel").checked,
        none: document.getElementById("scale_none").checked,
        other: document.getElementById("scale_other").value
      };

      // 1.6
      store.exudate = {
        serous: document.getElementById("ex_serous").checked,
        crust: document.getElementById("ex_crust").checked,
        none: document.getElementById("ex_none").checked,
        other: document.getElementById("ex_other").value
      };

      // 1.7
      store.itch = {
        has: document.getElementById("itch_has").checked,
        severe: document.getElementById("itch_severe").checked,
        mild: document.getElementById("itch_mild").checked,
        none: document.getElementById("itch_none").checked
      };

      // 1.8
      store.pain = {
        pain: document.getElementById("pain_pain").checked,
        burn: document.getElementById("pain_burn").checked,
        sore: document.getElementById("pain_sore").checked,
        none: document.getElementById("pain_none").checked
      };

      // 1.9
      store.swelling = {
        has: document.getElementById("sw_has").checked,
        none: document.getElementById("sw_none").checked
      };

      // 1.10
      store.pustule = {
        has: document.getElementById("pus_has").checked,
        none: document.getElementById("pus_none").checked,
        detail: document.getElementById("pus_detail").value
      };

      // 1.21
      store.locations = LOCS.filter(loc => document.getElementById("loc_" + loc).checked);
      store.distribution = document.getElementById("p1_distribution").value;
      store.distributionOther = document.getElementById("p1_distribution_other").value;

      // เวลา
      store.onset = document.getElementById("p1_onset").value;
      store.onsetOther = document.getElementById("p1_onset_other").value;

      // ประเมิน
      if (window.evaluateDrugAllergy) window.evaluateDrugAllergy();
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();

      alert("บันทึกหน้า 1 แล้ว");

      // ไปหน้า 2
      const btn2 = document.querySelector('.tabs button[data-target="page2"]');
      if (btn2) btn2.click();
    });
  }

  // export
  window.renderPage1 = renderPage1;
})();

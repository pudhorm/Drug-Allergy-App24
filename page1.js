// page1.js
// หน้า 1 ระบบผิวหนัง (เวอร์ชัน 4 ส่วนตามภาพ)

window.renderPage1 = function () {
  const d = window.drugAllergyData.page1;
  const el = document.getElementById("page1");

  // สร้าง HTML
  el.innerHTML = `
    <div class="p1-wrapper">
      <h2 class="p1-title">หน้า 1: ระบบผิวหนัง / ข้อมูลผู้ป่วย</h2>

      <!-- ================= ส่วนที่ 1 ================= -->
      <section class="p1-section p1-patient" aria-labelledby="p1-sec1">
        <h3 id="p1-sec1" class="p1-sec-title">
          <span class="icon">👤</span>
          ส่วนที่ 1 ข้อมูลผู้ป่วย
        </h3>

        <div class="p1-grid">
          <label>ชื่อ-สกุล
            <input type="text" id="p1_name" placeholder="เช่น นางสาวเอ มี" value="${d.name || ""}">
          </label>
          <label>HN
            <input type="text" id="p1_hn" placeholder="เช่น 1234567" value="${d.hn || ""}">
          </label>
          <label>อายุ (ปี)
            <input type="number" id="p1_age" placeholder="เช่น 54" value="${d.age || ""}">
          </label>
          <label>น้ำหนัก (กก.)
            <input type="number" id="p1_weight" placeholder="เช่น 60" value="${d.weight || ""}">
          </label>
          <label class="p1-col-2">โรคประจำตัว
            <input type="text" id="p1_underlying" placeholder="เช่น เบาหวาน, ความดัน" value="${d.underlying || ""}">
          </label>
          <label class="p1-col-2">ประวัติการแพ้ยา (กรุณาอธิบาย)
            <textarea id="p1_drugAllergyHistory" placeholder="เช่น ผื่นลมพิษ หายใจลำบาก บวมหน้า — ระบุชื่อยา/ช่วงเวลาได้ยิ่งดี">${d.drugAllergyHistory || ""}</textarea>
          </label>
        </div>
      </section>

      <!-- ================= ส่วนที่ 2 ================= -->
      <section class="p1-section p1-skin" aria-labelledby="p1-sec2">
        <h3 id="p1-sec2" class="p1-sec-title blue">
          <span class="icon">🔍</span>
          ส่วนที่ 2 ประเมินอาการ
        </h3>

        <!-- 1.1 รูปร่างผื่น -->
        <div class="p1-block">
          <h4>1.1 รูปร่างผื่น</h4>
          <div class="p1-two-cols">
            <div>
              ${checkbox("p1_shape_tum_nun", "ตุ่มนูน", d.rashShapes?.includes("ตุ่มนูน"))}
              ${checkbox("p1_shape_tum_ban", "ตุ่มแบนราบ", d.rashShapes?.includes("ตุ่มแบนราบ"))}
              ${checkbox("p1_shape_plaque", "ปื้นนูน", d.rashShapes?.includes("ปื้นนูน"))}
              ${checkbox("p1_shape_circle1", "วงกลมชั้นเดียว", d.rashShapes?.includes("วงกลมชั้นเดียว"))}
              ${checkbox("p1_shape_circle3", "วงกลม 3 ชั้น", d.rashShapes?.includes("วงกลม 3 ชั้น"))}
              ${checkbox("p1_shape_oval", "วงรี", d.rashShapes?.includes("วงรี"))}
            </div>
            <div>
              ${checkbox("p1_shape_wave", "ขอบหยัก", d.rashShapes?.includes("ขอบหยัก"))}
              ${checkbox("p1_shape_smooth", "ขอบเรียบ", d.rashShapes?.includes("ขอบเรียบ"))}
              ${checkbox("p1_shape_unclear", "ขอบไม่ชัดเจน", d.rashShapes?.includes("ขอบไม่ชัดเจน"))}
              ${checkbox("p1_shape_dot", "จุดเล็ก", d.rashShapes?.includes("จุดเล็ก"))}
              ${checkbox("p1_shape_purpura", "จ้ำเลือด", d.rashShapes?.includes("จ้ำเลือด"))}
            </div>
          </div>
          <input type="text" id="p1_shape_other" class="p1-other" placeholder="อื่นๆ ระบุ..." value="${d.rashShapesOther || ""}">
        </div>

        <!-- 1.2 สีผื่น -->
        <div class="p1-block">
          <h4>1.2 สีผื่น</h4>
          <div class="p1-two-cols">
            <div>
              ${checkbox("p1_color_red", "แดง", d.rashColors?.includes("แดง"))}
              ${checkbox("p1_color_redburn", "แดงไหม้", d.rashColors?.includes("แดงไหม้"))}
              ${checkbox("p1_color_redpale", "แดงซีด", d.rashColors?.includes("แดงซีด"))}
              ${checkbox("p1_color_pale", "ซีด", d.rashColors?.includes("ซีด"))}
              ${checkbox("p1_color_clear", "ใส", d.rashColors?.includes("ใส"))}
              ${checkbox("p1_color_purple", "ม่วง", d.rashColors?.includes("ม่วง"))}
            </div>
            <div>
              ${checkbox("p1_color_yellow", "เหลือง", d.rashColors?.includes("เหลือง"))}
              ${checkbox("p1_color_shiny", "มันเงา", d.rashColors?.includes("มันเงา"))}
              ${checkbox("p1_color_black", "ดำ", d.rashColors?.includes("ดำ"))}
              ${checkbox("p1_color_gray", "เทา", d.rashColors?.includes("เทา"))}
            </div>
          </div>
          <input type="text" id="p1_color_other" class="p1-other" placeholder="อื่นๆ ระบุ..." value="${d.rashColorsOther || ""}">
        </div>

        <!-- 1.3 ตุ่มน้ำ -->
        <div class="p1-block">
          <h4>1.3 ตุ่มน้ำ</h4>
          ${checkbox("p1_blist_small", "ตุ่มน้ำขนาดเล็ก", d.blisters?.small)}
          ${checkbox("p1_blist_med", "ตุ่มน้ำขนาดกลาง", d.blisters?.medium)}
          ${checkbox("p1_blist_large", "ตุ่มน้ำขนาดใหญ่", d.blisters?.large)}
          <input type="text" id="p1_blist_other" class="p1-other" placeholder="อื่นๆ ระบุ..." value="${d.blisters?.other || ""}">
        </div>

        <!-- 1.4 ผิวหลุดลอก -->
        <div class="p1-block">
          <h4>1.4 ผิวหลุดลอก</h4>
          ${checkbox("p1_detach_center", "ผิวหนังหลุดลอกตรงกลางผื่น", d.skinDetach?.center)}
          ${checkbox("p1_detach_lt10", "ผิวหนังหลุดลอกไม่เกิน 10% ของ BSA", d.skinDetach?.lt10)}
          ${checkbox("p1_detach_gt30", "ผิวหนังหลุดลอกเกิน 30% ของ BSA", d.skinDetach?.gt30)}
          ${checkbox("p1_detach_none", "ไม่พบ", d.skinDetach?.none)}
          <input type="text" id="p1_detach_other" class="p1-other" placeholder="อื่นๆ ระบุ..." value="${d.skinDetach?.other || ""}">
        </div>

        <!-- 1.5 ขุย/แห้ง/ลอก -->
        <div class="p1-block">
          <h4>1.5 ขุย/แห้ง/ลอก</h4>
          ${checkbox("p1_scale", "ขุย", d.scales?.scale)}
          ${checkbox("p1_dry", "แห้ง", d.scales?.dry)}
          ${checkbox("p1_peel", "ลอก", d.scales?.peel)}
          ${checkbox("p1_scale_none", "ไม่พบ", d.scales?.none)}
          <input type="text" id="p1_scale_other" class="p1-other" placeholder="อื่นๆ ระบุ..." value="${d.scales?.other || ""}">
        </div>

        <!-- 1.6 น้ำเหลือง/สะเก็ด -->
        <div class="p1-block">
          <h4>1.6 น้ำเหลือง/สะเก็ด</h4>
          ${checkbox("p1_ex_serous", "น้ำเหลือง", d.exudate?.serous)}
          ${checkbox("p1_ex_crust", "สะเก็ด", d.exudate?.crust)}
          ${checkbox("p1_ex_none", "ไม่พบ", d.exudate?.none)}
          <input type="text" id="p1_ex_other" class="p1-other" placeholder="อื่นๆ ระบุ..." value="${d.exudate?.other || ""}">
        </div>

        <!-- 1.7 คัน -->
        <div class="p1-block">
          <h4>1.7 คัน</h4>
          ${checkbox("p1_itch_has", "คัน ✓", d.itch?.has)}
          <div class="p1-indent">
            ${checkbox("p1_itch_severe", "คันมาก", d.itch?.severe)}
            ${checkbox("p1_itch_mild", "คันน้อย", d.itch?.mild)}
          </div>
          ${checkbox("p1_itch_none", "ไม่คัน", d.itch?.none)}
        </div>

        <!-- 1.8 ปวด/แสบ/เจ็บ -->
        <div class="p1-block">
          <h4>1.8 ปวด/แสบ/เจ็บ</h4>
          ${checkbox("p1_pain_pain", "ปวด", d.pain?.pain)}
          ${checkbox("p1_pain_burn", "แสบ", d.pain?.burn)}
          ${checkbox("p1_pain_sore", "เจ็บ", d.pain?.sore)}
          ${checkbox("p1_pain_none", "ไม่พบ", d.pain?.none)}
        </div>

        <!-- 1.9 บวม -->
        <div class="p1-block">
          <h4>1.9 บวม</h4>
          ${checkbox("p1_sw_has", "บวม", d.swelling?.has)}
          ${checkbox("p1_sw_none", "ไม่บวม", d.swelling?.none)}
        </div>

        <!-- 1.10 ตุ่มหนอง -->
        <div class="p1-block">
          <h4>1.10 ตุ่มหนอง</h4>
          ${checkbox("p1_pus_has", "พบ", d.pustule?.has)}
          ${checkbox("p1_pus_none", "ไม่พบ", d.pustule?.none)}
          <input type="text" id="p1_pus_detail" class="p1-other" placeholder="รายละเอียด (ขนาด/จำนวน/ตำแหน่ง)" value="${d.pustule?.detail || ""}">
        </div>

        <!-- 1.21 ตำแหน่งที่พบ/การกระจาย -->
        <div class="p1-block">
          <h4>1.21 ตำแหน่งที่พบ / การกระจายตัว</h4>
          <div class="p1-two-cols">
            <div>
              ${locChk("p1_loc_all", "ทั่วร่างกาย", d.locations?.includes("ทั่วร่างกาย"))}
              ${locChk("p1_loc_hand", "มือ", d.locations?.includes("มือ"))}
              ${locChk("p1_loc_foot", "เท้า", d.locations?.includes("เท้า"))}
              ${locChk("p1_loc_face", "หน้า", d.locations?.includes("หน้า"))}
              ${locChk("p1_loc_arm", "แขน", d.locations?.includes("แขน"))}
              ${locChk("p1_loc_leg", "ขา", d.locations?.includes("ขา"))}
            </div>
            <div>
              ${locChk("p1_loc_lip", "ริมฝีปาก", d.locations?.includes("ริมฝีปาก"))}
              ${locChk("p1_loc_eye", "รอบดวงตา", d.locations?.includes("รอบดวงตา"))}
              ${locChk("p1_loc_neck", "ลำคอ", d.locations?.includes("ลำคอ"))}
              ${locChk("p1_loc_genital", "อวัยวะเพศ", d.locations?.includes("อวัยวะเพศ"))}
              ${locChk("p1_loc_anus", "ทวาร", d.locations?.includes("ทวาร"))}
              ${locChk("p1_loc_back", "หลัง", d.locations?.includes("หลัง"))}
            </div>
          </div>

          <label>การกระจายตัว:
            <select id="p1_distribution">
              <option value="">เลือก...</option>
              <option value="สมมาตร" ${d.distribution === "สมมาตร" ? "selected" : ""}>สมมาตร</option>
              <option value="ไม่สมมาตร" ${d.distribution === "ไม่สมมาตร" ? "selected" : ""}>ไม่สมมาตร</option>
              <option value="อื่นๆ" ${d.distribution === "อื่นๆ" ? "selected" : ""}>อื่นๆ</option>
            </select>
          </label>
          <input type="text" id="p1_distribution_other" class="p1-other" placeholder="ถ้าอื่นๆ ระบุ..." value="${d.distributionOther || ""}">
        </div>

      </section>

      <!-- ================= ส่วนที่ 3 ================= -->
      <section class="p1-section" aria-labelledby="p1-sec3">
        <h3 id="p1-sec3" class="p1-sec-title purple">
          <span class="icon">⏱️</span>
          ส่วนที่ 3 ระยะเวลาการเกิดอาการ
        </h3>
        <label>เลือกช่วงเวลาที่เริ่มมีอาการหลังได้รับยา:
          <select id="p1_onset_select">
            <option value="">เลือก...</option>
            <option value="1h" ${d.onset === "1h" ? "selected" : ""}>ภายใน 1 ชั่วโมง</option>
            <option value="1to6h" ${d.onset === "1to6h" ? "selected" : ""}>ภายใน 1-6 ชั่วโมง</option>
            <option value="6to24h" ${d.onset === "6to24h" ? "selected" : ""}>ภายใน 6-24 ชั่วโมง</option>
            <option value="1w" ${d.onset === "1w" ? "selected" : ""}>ภายใน 1 สัปดาห์</option>
            <option value="2w" ${d.onset === "2w" ? "selected" : ""}>ภายใน 2 สัปดาห์</option>
            <option value="3w" ${d.onset === "3w" ? "selected" : ""}>ภายใน 3 สัปดาห์</option>
            <option value="4w" ${d.onset === "4w" ? "selected" : ""}>ภายใน 4 สัปดาห์</option>
            <option value="5w" ${d.onset === "5w" ? "selected" : ""}>ภายใน 5 สัปดาห์</option>
            <option value="6w" ${d.onset === "6w" ? "selected" : ""}>ภายใน 6 สัปดาห์</option>
            <option value="other" ${d.onset === "other" ? "selected" : ""}>อื่นๆ ระบุ…</option>
          </select>
        </label>
        <input type="text" id="p1_onset_other" class="p1-other" placeholder="ถ้าเลือก 'อื่นๆ' ให้ระบุตรงนี้" value="${d.onsetOther || ""}">
      </section>

      <!-- ================= ส่วนที่ 4 ================= -->
      <section class="p1-section" aria-labelledby="p1-sec4">
        <h3 id="p1-sec4" class="p1-sec-title green">
          <span class="icon">🖼️</span>
          ส่วนที่ 4 แนบรูปถ่ายอาการผู้ป่วย (ถ้ามี)
        </h3>

        <div class="p1-upload" id="p1_drop">
          <div class="p1-upload-inner">
            <div class="p1-upload-icon">🖼️</div>
            <p>อัปโหลดรูปภาพ หรือ ลากมาวาง • PNG, JPG, GIF</p>
            <button type="button" class="btn-upload" id="p1_pick_btn">เลือกไฟล์</button>
            <input type="file" id="p1_file" accept="image/*" style="display:none;">
            <p class="p1-upload-name" id="p1_upload_name">${d.imageName ? "ไฟล์ปัจจุบัน: " + d.imageName : "ยังไม่ได้เลือกรูป"}</p>
            ${d.imageDataUrl ? `<img src="${d.imageDataUrl}" alt="preview" class="p1-preview">` : ""}
          </div>
        </div>
      </section>

      <!-- ปุ่มล่าง -->
      <div class="p1-actions">
        <button type="button" class="btn-danger" id="p1_clear">🗑️ ล้างข้อมูลหน้านี้</button>
        <button type="button" class="btn-primary" id="p1_save_next">บันทึกข้อมูลและไปหน้า 2</button>
      </div>
    </div>
  `;

  // ---------- ฟังก์ชันช่วยอ่านค่าจาก DOM ----------
  function getCheckedValues(prefixes) {
    const arr = [];
    prefixes.forEach(p => {
      const el = document.getElementById(p.id);
      if (el && el.checked) arr.push(p.label);
    });
    return arr;
  }

  // ---------- อัปโหลดรูป ----------
  const fileInput = document.getElementById("p1_file");
  const pickBtn = document.getElementById("p1_pick_btn");
  const drop = document.getElementById("p1_drop");
  const nameEl = document.getElementById("p1_upload_name");

  pickBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", handleFiles);
  drop.addEventListener("dragover", (e) => {
    e.preventDefault();
    drop.classList.add("dragover");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("dragover"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  });

  function handleFiles(e) {
    const file = e.target.files[0];
    if (file) processFile(file);
  }

  function processFile(file) {
    const reader = new FileReader();
    reader.onload = function (evt) {
      window.drugAllergyData.page1.imageName = file.name;
      window.drugAllergyData.page1.imageDataUrl = evt.target.result;
      nameEl.textContent = "ไฟล์ปัจจุบัน: " + file.name;
      // ใส่ preview ใหม่
      const img = document.createElement("img");
      img.src = evt.target.result;
      img.className = "p1-preview";
      drop.querySelector(".p1-upload-inner").appendChild(img);
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();
    };
    reader.readAsDataURL(file);
  }

  // ---------- ปุ่มล้าง ----------
  document.getElementById("p1_clear").addEventListener("click", () => {
    window.drugAllergyData.page1 = {
      name: "",
      hn: "",
      age: "",
      weight: "",
      underlying: "",
      drugAllergyHistory: "",
      rashShapes: [],
      rashShapesOther: "",
      rashColors: [],
      rashColorsOther: "",
      blisters: { small: false, medium: false, large: false, other: "" },
      skinDetach: { center: false, lt10: false, gt30: false, none: false, other: "" },
      scales: { scale: false, dry: false, peel: false, none: false, other: "" },
      exudate: { serous: false, crust: false, none: false, other: "" },
      itch: { has: false, severe: false, mild: false, none: false },
      pain: { pain: false, burn: false, sore: false, none: false },
      swelling: { has: false, none: false },
      pustule: { has: false, none: false, detail: "" },
      locations: [],
      distribution: "",
      distributionOther: "",
      onset: "",
      onsetOther: "",
      imageName: "",
      imageDataUrl: ""
    };
    if (window.saveDrugAllergyData) window.saveDrugAllergyData();
    // re-render
    window.renderPage1();
  });

  // ---------- ปุ่มบันทึก ----------
  document.getElementById("p1_save_next").addEventListener("click", () => {
    const store = window.drugAllergyData.page1;

    // ส่วนที่ 1
    store.name = document.getElementById("p1_name").value;
    store.hn = document.getElementById("p1_hn").value;
    store.age = document.getElementById("p1_age").value;
    store.weight = document.getElementById("p1_weight").value;
    store.underlying = document.getElementById("p1_underlying").value;
    store.drugAllergyHistory = document.getElementById("p1_drugAllergyHistory").value;

    // 1.1 รูปร่างผื่น
    const shapeMap = [
      { id: "p1_shape_tum_nun", label: "ตุ่มนูน" },
      { id: "p1_shape_tum_ban", label: "ตุ่มแบนราบ" },
      { id: "p1_shape_plaque", label: "ปื้นนูน" },
      { id: "p1_shape_circle1", label: "วงกลมชั้นเดียว" },
      { id: "p1_shape_circle3", label: "วงกลม 3 ชั้น" },
      { id: "p1_shape_oval", label: "วงรี" },
      { id: "p1_shape_wave", label: "ขอบหยัก" },
      { id: "p1_shape_smooth", label: "ขอบเรียบ" },
      { id: "p1_shape_unclear", label: "ขอบไม่ชัดเจน" },
      { id: "p1_shape_dot", label: "จุดเล็ก" },
      { id: "p1_shape_purpura", label: "จ้ำเลือด" },
    ];
    store.rashShapes = shapeMap.filter(x => document.getElementById(x.id).checked).map(x => x.label);
    store.rashShapesOther = document.getElementById("p1_shape_other").value;

    // 1.2 สีผื่น
    const colorMap = [
      { id: "p1_color_red", label: "แดง" },
      { id: "p1_color_redburn", label: "แดงไหม้" },
      { id: "p1_color_redpale", label: "แดงซีด" },
      { id: "p1_color_pale", label: "ซีด" },
      { id: "p1_color_clear", label: "ใส" },
      { id: "p1_color_purple", label: "ม่วง" },
      { id: "p1_color_yellow", label: "เหลือง" },
      { id: "p1_color_shiny", label: "มันเงา" },
      { id: "p1_color_black", label: "ดำ" },
      { id: "p1_color_gray", label: "เทา" },
    ];
    store.rashColors = colorMap.filter(x => document.getElementById(x.id).checked).map(x => x.label);
    store.rashColorsOther = document.getElementById("p1_color_other").value;

    // 1.3 ตุ่มน้ำ
    store.blisters = {
      small: document.getElementById("p1_blist_small").checked,
      medium: document.getElementById("p1_blist_med").checked,
      large: document.getElementById("p1_blist_large").checked,
      other: document.getElementById("p1_blist_other").value
    };

    // 1.4 ผิวหลุดลอก
    store.skinDetach = {
      center: document.getElementById("p1_detach_center").checked,
      lt10: document.getElementById("p1_detach_lt10").checked,
      gt30: document.getElementById("p1_detach_gt30").checked,
      none: document.getElementById("p1_detach_none").checked,
      other: document.getElementById("p1_detach_other").value
    };

    // 1.5 ขุย/แห้ง/ลอก
    store.scales = {
      scale: document.getElementById("p1_scale").checked,
      dry: document.getElementById("p1_dry").checked,
      peel: document.getElementById("p1_peel").checked,
      none: document.getElementById("p1_scale_none").checked,
      other: document.getElementById("p1_scale_other").value
    };

    // 1.6 น้ำเหลือง/สะเก็ด
    store.exudate = {
      serous: document.getElementById("p1_ex_serous").checked,
      crust: document.getElementById("p1_ex_crust").checked,
      none: document.getElementById("p1_ex_none").checked,
      other: document.getElementById("p1_ex_other").value
    };

    // 1.7 คัน
    store.itch = {
      has: document.getElementById("p1_itch_has").checked,
      severe: document.getElementById("p1_itch_severe").checked,
      mild: document.getElementById("p1_itch_mild").checked,
      none: document.getElementById("p1_itch_none").checked
    };

    // 1.8 ปวด/แสบ/เจ็บ
    store.pain = {
      pain: document.getElementById("p1_pain_pain").checked,
      burn: document.getElementById("p1_pain_burn").checked,
      sore: document.getElementById("p1_pain_sore").checked,
      none: document.getElementById("p1_pain_none").checked
    };

    // 1.9 บวม
    store.swelling = {
      has: document.getElementById("p1_sw_has").checked,
      none: document.getElementById("p1_sw_none").checked
    };

    // 1.10 ตุ่มหนอง
    store.pustule = {
      has: document.getElementById("p1_pus_has").checked,
      none: document.getElementById("p1_pus_none").checked,
      detail: document.getElementById("p1_pus_detail").value
    };

    // 1.21 ตำแหน่ง
    const locMap = [
      { id: "p1_loc_all", label: "ทั่วร่างกาย" },
      { id: "p1_loc_hand", label: "มือ" },
      { id: "p1_loc_foot", label: "เท้า" },
      { id: "p1_loc_face", label: "หน้า" },
      { id: "p1_loc_arm", label: "แขน" },
      { id: "p1_loc_leg", label: "ขา" },
      { id: "p1_loc_lip", label: "ริมฝีปาก" },
      { id: "p1_loc_eye", label: "รอบดวงตา" },
      { id: "p1_loc_neck", label: "ลำคอ" },
      { id: "p1_loc_genital", label: "อวัยวะเพศ" },
      { id: "p1_loc_anus", labe

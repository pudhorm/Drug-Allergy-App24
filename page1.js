// page1.js
(function () {
  // ----- ตัวเลือกพื้นฐาน -----
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
    "จุดเล็ก"
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

  // ===== สร้าง option อายุ 0-120 ปี + อื่นๆ =====
  function buildAgeOptions(selected) {
    const out = [];
    for (let i = 0; i <= 120; i++) {
      const v = String(i);
      out.push(
        `<option value="${v}" ${selected == v ? "selected" : ""}>${i} ปี</option>`
      );
    }
    out.push(
      `<option value="other" ${selected === "other" ? "selected" : ""}>อื่นๆ ระบุ…</option>`
    );
    return out.join("");
  }

  // ===== สร้าง option น้ำหนัก 1-200 กก. + อื่นๆ =====
  function buildWeightOptions(selected) {
    const out = [];
    for (let i = 1; i <= 200; i++) {
      const v = String(i);
      out.push(
        `<option value="${v}" ${selected == v ? "selected" : ""}>${i} กก.</option>`
      );
    }
    out.push(
      `<option value="other" ${selected === "other" ? "selected" : ""}>อื่นๆ ระบุ…</option>`
    );
    return out.join("");
  }

  // ===== สร้าง option โรคประจำตัว + อื่นๆ =====
  function buildUnderlyingOptions(selected) {
    const base = [
      "ไม่มีโรคประจำตัว",
      "เบาหวาน",
      "ความดันโลหิตสูง",
      "โรคหัวใจ",
      "โรคตับ",
      "โรคไต",
      "หอบหืด/ภูมิแพ้",
      "อื่นๆ ระบุ…"
    ];
    return base
      .map(opt => {
        const val = opt === "อื่นๆ ระบุ…" ? "other" : opt;
        return `<option value="${val}" ${selected === val ? "selected" : ""}>${opt}</option>`;
      })
      .join("");
  }

  // ----- ตัวช่วยทำ checkbox -----
  function cb(id, label, checked) {
    return `<label class="p1-chk"><input type="checkbox" id="${id}" ${checked ? "checked" : ""}><span>${label}</span></label>`;
  }

  // ========================== render ==========================
  function renderPage1() {
    // เตรียมที่เก็บ
    if (!window.drugAllergyData) {
      window.drugAllergyData = {};
    }
    if (!window.drugAllergyData.page1) {
      window.drugAllergyData.page1 = {};
    }
    const d = window.drugAllergyData.page1;
    const root = document.getElementById("page1");
    if (!root) return;

    // ===== HTML หลัก =====
    root.innerHTML = `
<div class="p1-wrapper">
  <h2 class="p1-title">หน้า 1: ระบบผิวหนัง / ข้อมูลผู้ป่วย</h2>

  <!-- ส่วนที่ 1 ข้อมูลผู้ป่วย -->
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
        <select id="p1_age_sel">
          <option value="">เลือก...</option>
          ${buildAgeOptions(d.ageSel ?? d.age ?? "")}
        </select>
        <input id="p1_age_other"
               class="p1-other"
               style="margin-top:.4rem; ${(d.ageSel === "other" || d.age === "other") ? "" : "display:none"}"
               placeholder="ระบุอายุ (ปี)"
               value="${d.ageOther || ""}">
      </label>

      <!-- น้ำหนัก: เลื่อนหาได้ -->
      <label>น้ำหนัก (กก.)
        <select id="p1_weight_sel">
          <option value="">เลือก...</option>
          ${buildWeightOptions(d.weightSel ?? d.weight ?? "")}
        </select>
        <input
          id="p1_weight_other"
          class="p1-other"
          style="margin-top:.4rem; ${(d.weightSel === "other" || d.weight === "other") ? "" : "display:none"}"
          placeholder="ระบุน้ำหนัก (กก.)"
          value="${d.weightOther || ""}">
      </label>

      <!-- โรคประจำตัว: เลื่อนหาได้ -->
      <label class="p1-col-2">โรคประจำตัว
        <select id="p1_under_sel">
          <option value="">เลือก...</option>
          ${buildUnderlyingOptions(d.underSel ?? d.underlying ?? "")}
        </select>
        <input
          id="p1_under_other"
          class="p1-other"
          style="margin-top:.4rem; ${(d.underSel === "other" || d.underlying === "other") ? "" : "display:none"}"
          placeholder="ระบุโรคประจำตัวอื่นๆ"
          value="${d.underOther || ""}">
      </label>

      <label class="p1-col-2">ประวัติการแพ้ยา (เดิม)
        <textarea id="p1_history">${d.drugAllergyHistory || ""}</textarea>
      </label>
    </div>
  </section>

  <!-- ส่วนที่ 2 ประเมินอาการ -->
  <section class="p1-section">
    <h3 class="p1-sec-title blue"><span class="icon">🔍</span>ส่วนที่ 2 ประเมินอาการ</h3>

    <!-- 1.1 รูปร่างผื่น -->
    <div class="p1-block">
      <h4>1.1 รูปร่างผื่น</h4>
      <div class="p1-two-cols">
        ${SHAPES.map((s, i) => cb("shape_" + i, s, d.rashShapes && d.rashShapes.includes(s))).join("")}
      </div>
      <input id="shape_other" class="p1-other" placeholder="อื่นๆ ระบุ..." value="${d.rashShapesOther || ""}">
    </div>

    <!-- 1.2 สีผื่น -->
    <div class="p1-block">
      <h4>1.2 สีผื่น</h4>
      <div class="p1-two-cols">
        ${COLORS.map((c, i) => cb("color_" + i, c, d.rashColors && d.rashColors.includes(c))).join("")}
      </div>
      <input id="color_other" class="p1-other" placeholder="อื่นๆ ระบุ..." value="${d.rashColorsOther || ""}">
    </div>
    
     <!-- 1.3 ตุ่มน้ำ -->
    <div class="p1-block">
      <h4>1.3 ตุ่มน้ำ</h4>
      <div class="p1-col p1-col-2col">
        <label class="p1-chk">
          <input type="checkbox" id="blister_small" ${d.blisters?.small ? "checked" : ""}>
          <span>ตุ่มน้ำขนาดเล็ก</span>
        </label>
        <label class="p1-chk">
          <input type="checkbox" id="blister_medium" ${d.blisters?.medium ? "checked" : ""}>
          <span>ตุ่มน้ำขนาดกลาง</span>
        </label>
        <label class="p1-chk">
          <input type="checkbox" id="blister_large" ${d.blisters?.large ? "checked" : ""}>
          <span>ตุ่มน้ำขนาดใหญ่</span>
        </label>
      </div>
      <input id="blister_other"
             class="p1-other"
             placeholder="อื่นๆ ระบุ..."
             value="${d.blisters?.other || ""}">
    </div>

    <!-- 1.4 ผิวหนังหลุดลอก -->
    <div class="p1-block">
      <h4>1.4 ผิวหนังหลุดลอก</h4>
      <div class="p1-col p1-col-2col">
        <label class="p1-chk">
          <input type="checkbox" id="detach_center" ${d.skinDetach?.center ? "checked" : ""}>
          <span>ผิวหนังหลุดลอกตรงกลางผื่น</span>
        </label>
        <label class="p1-chk">
          <input type="checkbox" id="detach_lt10" ${d.skinDetach?.lt10 ? "checked" : ""}>
          <span>ผิวหนังหลุดลอกไม่เกิน 10% ของ BSA</span>
        </label>
        <label class="p1-chk">
          <input type="checkbox" id="detach_gt30" ${d.skinDetach?.gt30 ? "checked" : ""}>
          <span>ผิวหนังหลุดลอกเกิน 30% ของ BSA</span>
        </label>
        <label class="p1-chk">
          <input type="checkbox" id="detach_none" ${d.skinDetach?.none ? "checked" : ""}>
          <span>ไม่พบ</span>
        </label>
      </div>
      <input id="detach_other"
             class="p1-other"
             placeholder="อื่นๆ ระบุ..."
             value="${d.skinDetach?.other || ""}">
    </div>

    <!-- 1.5 ขุย/แห้ง/ลอก -->
    <div class="p1-block">
      <h4>1.5 ขุย/แห้ง/ลอก</h4>
      <div class="p1-col p1-col-2col">
        <label class="p1-chk">
          <input type="checkbox" id="scale_scale" ${d.scales?.scale ? "checked" : ""}>
          <span>ขุย</span>
        </label>
        <label class="p1-chk">
          <input type="checkbox" id="scale_dry" ${d.scales?.dry ? "checked" : ""}>
          <span>แห้ง</span>
        </label>
        <label class="p1-chk">
          <input type="checkbox" id="scale_peel" ${d.scales?.peel ? "checked" : ""}>
          <span>ลอก</span>
        </label>
        <label class="p1-chk">
          <input type="checkbox" id="scale_none" ${d.scales?.none ? "checked" : ""}>
          <span>ไม่พบ</span>
        </label>
      </div>
      <input id="scale_other"
             class="p1-other"
             placeholder="อื่นๆ ระบุ..."
             value="${d.scales?.other || ""}">
    </div>

    <!-- 1.6 น้ำเหลือง / สะเก็ด -->
    <div class="p1-block">
      <h4>1.6 น้ำเหลือง / สะเก็ด</h4>
      <div class="p1-col p1-col-2col">
        <label class="p1-chk">
          <input type="checkbox" id="ex_serous" ${d.exudate?.serous ? "checked" : ""}>
          <span>น้ำเหลือง</span>
        </label>
        <label class="p1-chk">
          <input type="checkbox" id="ex_crust" ${d.exudate?.crust ? "checked" : ""}>
          <span>สะเก็ด</span>
        </label>
        <label class="p1-chk">
          <input type="checkbox" id="ex_none" ${d.exudate?.none ? "checked" : ""}>
          <span>ไม่พบ</span>
        </label>
      </div>
      <input id="ex_other"
             class="p1-other"
             placeholder="อื่นๆ ระบุ..."
             value="${d.exudate?.other || ""}">
    </div>


    <!-- 1.7 คัน -->
    <div class="p1-block">
      <h4>1.7 คัน</h4>
      <div class="p1-col">
        ${cb("itch_has", "คัน ✓", d.itch?.has)}
        <div class="p1-indent">
          ${cb("itch_severe", "คันมาก", d.itch?.severe)}
          ${cb("itch_mild", "คันน้อย", d.itch?.mild)}
        </div>
        ${cb("itch_none", "ไม่คัน", d.itch?.none)}
      </div>
    </div>

    
    <!-- 1.8 ปวด / แสบ / เจ็บ -->
    <div class="p1-block">
      <h4>1.8 ปวด / แสบ / เจ็บ</h4>
      <div class="p1-col p1-col-2col">
        <label class="p1-chk">
          <input type="checkbox" id="pain_pain" ${d.pain?.pain ? "checked" : ""}>
          <span>ปวด</span>
        </label>
        <label class="p1-chk">
          <input type="checkbox" id="pain_burn" ${d.pain?.burn ? "checked" : ""}>
          <span>แสบ</span>
        </label>
        <label class="p1-chk">
          <input type="checkbox" id="pain_sore" ${d.pain?.sore ? "checked" : ""}>
          <span>เจ็บ</span>
        </label>
        <label class="p1-chk">
          <input type="checkbox" id="pain_none" ${d.pain?.none ? "checked" : ""}>
          <span>ไม่พบ</span>
        </label>
      </div>
    </div>

    <!-- 1.9 บวม -->
    <div class="p1-block">
      <h4>1.9 บวม</h4>
      <div class="p1-col p1-col-2col">
        <label class="p1-chk">
          <input type="checkbox" id="sw_has" ${d.swelling?.has ? "checked" : ""}>
          <span>บวม</span>
        </label>
        <label class="p1-chk">
          <input type="checkbox" id="sw_none" ${d.swelling?.none ? "checked" : ""}>
          <span>ไม่บวม</span>
        </label>
      </div>
    </div>

    <!-- 1.10 ตุ่มหนอง -->
    <div class="p1-block">
      <h4>1.10 ตุ่มหนอง</h4>
      <div class="p1-col p1-col-2col">
        <label class="p1-chk">
          <input type="checkbox" id="pus_has" ${d.pustule?.has ? "checked" : ""}>
          <span>พบ</span>
        </label>
        <label class="p1-chk">
          <input type="checkbox" id="pus_none" ${d.pustule?.none ? "checked" : ""}>
          <span>ไม่พบ</span>
        </label>
      </div>
      <input id="pus_detail"
             class="p1-other"
             placeholder="รายละเอียด..."
             value="${d.pustule?.detail || ""}">
    </div>
    <!-- 1.21 ตำแหน่ง / การกระจายตัว -->
    <div class="p1-block">
      <h4>1.21 ตำแหน่งที่พบ / การกระจายตัว</h4>
      <div class="p1-two-cols">
        ${LOCS.map(loc => cb("loc_" + loc, loc, d.locations && d.locations.includes(loc))).join("")}
      </div>
      <label>การกระจายตัว
        <select id="p1_distribution">
          <option value="">เลือก...</option>
          <option value="สมมาตร" ${d.distribution === "สมมาตร" ? "selected" : ""}>สมมาตร</option>
          <option value="ไม่สมมาตร" ${d.distribution === "ไม่สมาตร" ? "selected" : ""}>ไม่สมมาตร</option>
          <option value="อื่นๆ" ${d.distribution === "อื่นๆ" ? "selected" : ""}>อื่นๆ</option>
        </select>
      </label>
      <input id="p1_distribution_other" class="p1-other" placeholder="ถ้าเลือกอื่นๆ ระบุ..." value="${d.distributionOther || ""}" style="${d.distribution === "อื่นๆ" ? "" : "display:none"}">
    </div>
  </section>

  <!-- ส่วนที่ 3 เวลา -->
 <section class="p1-section p1-section-onset">
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
    <input id="p1_onset_other" class="p1-other"
           style="${d.onset === "other" ? "" : "display:none"}"
           placeholder="ระบุระยะเวลา"
           value="${d.onsetOther || ""}">
  </section>

  <!-- ส่วนที่ 4 แนบรูป -->
  <section class="p1-section">
    <h3 class="p1-sec-title green"><span class="icon">🖼️</span>ส่วนที่ 4 แนบรูปถ่ายอาการผู้ป่วย</h3>
    <div class="p1-upload" id="p1_drop">
      <p>อัปโหลดรูปภาพ หรือ ลากมาวาง</p>
      <button type="button" class="btn-upload" id="p1_pick">เลือกไฟล์</button>
      <input type="file" id="p1_file" accept="image/*" style="display:none">
      <p class="p1-upload-name" id="p1_file_name">
        ${d.imageName ? "ไฟล์ปัจจุบัน: " + d.imageName : "ยังไม่ได้เลือกรูป"}
      </p>
      ${d.imageDataUrl ? `<img src="${d.imageDataUrl}" class="p1-preview">` : ""}
    </div>
  </section>

  <!-- ปุ่มล่าง -->
  <div class="p1-actions">
    <button class="btn-danger" id="p1_clear">🗑️ ล้างข้อมูลหน้านี้</button>
    <button class="btn-primary" id="p1_save">บันทึกข้อมูลและไปหน้า 2</button>
  </div>
</div>
`;

    // ================== ผูก event ==================

    // อายุ: โชว์/ซ่อนช่องอื่นๆ
    const ageSelEl = document.getElementById("p1_age_sel");
    const ageOtherEl = document.getElementById("p1_age_other");
    ageSelEl.addEventListener("change", () => {
      ageOtherEl.style.display = ageSelEl.value === "other" ? "block" : "none";
    });

    // น้ำหนัก: โชว์/ซ่อนช่องอื่นๆ
    const weightSelEl = document.getElementById("p1_weight_sel");
    const weightOtherEl = document.getElementById("p1_weight_other");
    weightSelEl.addEventListener("change", () => {
      weightOtherEl.style.display = weightSelEl.value === "other" ? "block" : "none";
    });

    // โรคประจำตัว: โชว์/ซ่อนช่องอื่นๆ
    const underSelEl = document.getElementById("p1_under_sel");
    const underOtherEl = document.getElementById("p1_under_other");
    underSelEl.addEventListener("change", () => {
      underOtherEl.style.display = underSelEl.value === "other" ? "block" : "none";
    });

    // การกระจายตัว: โชว์/ซ่อนช่องอื่นๆ
    const distSel = document.getElementById("p1_distribution");
    const distOther = document.getElementById("p1_distribution_other");
    distSel.addEventListener("change", () => {
      distOther.style.display = distSel.value === "อื่นๆ" ? "block" : "none";
    });

    // onset อื่นๆ
    const onsetSel = document.getElementById("p1_onset");
    const onsetOther = document.getElementById("p1_onset_other");
    onsetSel.addEventListener("change", () => {
      onsetOther.style.display = onsetSel.value === "other" ? "block" : "none";
    });

    // อัปโหลดรูป
    const fileInput = document.getElementById("p1_file");
    const pickBtn = document.getElementById("p1_pick");
    const dropZone = document.getElementById("p1_drop");
    const fileNameEl = document.getElementById("p1_file_name");

    function handleFile(file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        d.imageName = file.name;
        d.imageDataUrl = ev.target.result;
        fileNameEl.textContent = "ไฟล์ปัจจุบัน: " + file.name;
        if (window.saveDrugAllergyData) window.saveDrugAllergyData();
        renderPage1(); // refresh เพื่อโชว์รูป
      };
      reader.readAsDataURL(file);
    }

    pickBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      const f = e.target.files[0];
      if (f) handleFile(f);
    });
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("dragover");
    });
    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("dragover");
    });
    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    });

    // ปุ่มล้าง
    document.getElementById("p1_clear").addEventListener("click", () => {
      window.drugAllergyData.page1 = {};
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();
      renderPage1();
    });

    // ปุ่มบันทึก
    document.getElementById("p1_save").addEventListener("click", () => {
      const store = window.drugAllergyData.page1;

      // ----- ส่วนที่ 1 -----
      store.name = document.getElementById("p1_name").value;
      store.hn = document.getElementById("p1_hn").value;

      const ageSel = document.getElementById("p1_age_sel").value;
      store.ageSel = ageSel;
      store.ageOther = document.getElementById("p1_age_other").value;
      store.age = (ageSel === "other") ? store.ageOther : ageSel;

      // น้ำหนักแบบเลือก
      const weightSel = document.getElementById("p1_weight_sel").value;
      store.weightSel = weightSel;
      store.weightOther = document.getElementById("p1_weight_other").value;
      store.weight = (weightSel === "other") ? store.weightOther : weightSel;

      // โรคประจำตัวแบบเลือก
      const underSel = document.getElementById("p1_under_sel").value;
      store.underSel = underSel;
      store.underOther = document.getElementById("p1_under_other").value;
      store.underlying = (underSel === "other") ? store.underOther : underSel;

      store.drugAllergyHistory = document.getElementById("p1_history").value;

      // ----- 1.1 รูปร่างผื่น -----
      store.rashShapes = SHAPES.filter((s, i) => document.getElementById("shape_" + i).checked);
      store.rashShapesOther = document.getElementById("shape_other").value;

      // ----- 1.2 สีผื่น -----
      store.rashColors = COLORS.filter((c, i) => document.getElementById("color_" + i).checked);
      store.rashColorsOther = document.getElementById("color_other").value;

      // ----- 1.3 ตุ่มน้ำ -----
      store.blisters = {
        small: document.getElementById("blister_small").checked,
        medium: document.getElementById("blister_medium").checked,
        large: document.getElementById("blister_large").checked,
        other: document.getElementById("blister_other").value
      };

      // ----- 1.4 ผิวหนังหลุดลอก -----
      store.skinDetach = {
        center: document.getElementById("detach_center").checked,
        lt10: document.getElementById("detach_lt10").checked,
        gt30: document.getElementById("detach_gt30").checked,
        none: document.getElementById("detach_none").checked,
        other: document.getElementById("detach_other").value
      };

      // ----- 1.5 ขุย/แห้ง/ลอก -----
      store.scales = {
        scale: document.getElementById("scale_scale").checked,
        dry: document.getElementById("scale_dry").checked,
        peel: document.getElementById("scale_peel").checked,
        none: document.getElementById("scale_none").checked,
        other: document.getElementById("scale_other").value
      };

      // ----- 1.6 น้ำเหลือง/สะเก็ด -----
      store.exudate = {
        serous: document.getElementById("ex_serous").checked,
        crust: document.getElementById("ex_crust").checked,
        none: document.getElementById("ex_none").checked,
        other: document.getElementById("ex_other").value
      };

      // ----- 1.7 คัน -----
      store.itch = {
        has: document.getElementById("itch_has").checked,
        severe: document.getElementById("itch_severe").checked,
        mild: document.getElementById("itch_mild").checked,
        none: document.getElementById("itch_none").checked
      };

      // ----- 1.8 ปวด/แสบ/เจ็บ -----
      store.pain = {
        pain: document.getElementById("pain_pain").checked,
        burn: document.getElementById("pain_burn").checked,
        sore: document.getElementById("pain_sore").checked,
        none: document.getElementById("pain_none").checked
      };

      // ----- 1.9 บวม -----
      store.swelling = {
        has: document.getElementById("sw_has").checked,
        none: document.getElementById("sw_none").checked
      };

      // ----- 1.10 ตุ่มหนอง -----
      store.pustule = {
        has: document.getElementById("pus_has").checked,
        none: document.getElementById("pus_none").checked,
        detail: document.getElementById("pus_detail").value
      };

      // ----- 1.21 ตำแหน่ง -----
      store.locations = LOCS.filter(loc => document.getElementById("loc_" + loc).checked);
      store.distribution = document.getElementById("p1_distribution").value;
      store.distributionOther = document.getElementById("p1_distribution_other").value;

      // ----- เวลา -----
      store.onset = document.getElementById("p1_onset").value;
      store.onsetOther = document.getElementById("p1_onset_other").value;

      // ✅ ธงว่าหน้า 1 กดบันทึกแล้ว
      store.__saved = true;

      if (window.evaluateDrugAllergy) window.evaluateDrugAllergy();
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();

      alert("บันทึกหน้า 1 แล้ว");

      // เปลี่ยนไปหน้า 2
      const btn2 = document.querySelector('.tabs button[data-target="page2"]');
      if (btn2) btn2.click();
    });
  } // <- จบฟังก์ชัน renderPage1

  // ให้ index.html เรียกได้
  window.renderPage1 = renderPage1;
})(); // <- ปิด IIFE ให้ครบ

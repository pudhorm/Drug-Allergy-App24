// page1.js
window.renderPage1 = function () {
  const d = window.drugAllergyData.page1;
  const el = document.getElementById("page1");

  el.innerHTML = `
    <h2>หน้า 1: ระบบผิวหนัง / ข้อมูลผู้ป่วย</h2>
    <div class="card">
      <h3>ข้อมูลผู้ป่วย</h3>
      <label>ชื่อ-สกุล
        <input type="text" id="p1_name" value="${d.name || ""}">
      </label>
      <label>HN
        <input type="text" id="p1_hn" value="${d.hn || ""}">
      </label>
      <label>อายุ
        <input type="number" id="p1_age" value="${d.age || ""}">
      </label>
      <label>น้ำหนัก (กก.)
        <input type="number" id="p1_weight" value="${d.weight || ""}">
      </label>
      <label>โรคประจำตัว
        <input type="text" id="p1_underlying" value="${d.underlying || ""}">
      </label>
      <label>ประวัติการแพ้ยาเดิม
        <textarea id="p1_allergy_history">${d.drugAllergyHistory || ""}</textarea>
      </label>
    </div>

    <div class="card">
      <h3>อาการผิวหนัง</h3>
      <label>รูปร่างผื่น
        <select id="p1_rash_shape">
          <option value="">-- เลือก --</option>
          <option value="mp" ${d.rashShape === "mp" ? "selected" : ""}>Maculopapular / MP rash</option>
          <option value="urticaria" ${d.rashShape === "urticaria" ? "selected" : ""}>ลมพิษ / urticaria</option>
          <option value="bullous" ${d.rashShape === "bullous" ? "selected" : ""}>ตุ่มน้ำ / bullous</option>
          <option value="target" ${d.rashShape === "target" ? "selected" : ""}>Target-like / EM</option>
        </select>
      </label>
      <label>สีผื่น
        <input type="text" id="p1_rash_color" value="${d.rashColor || ""}">
      </label>
      <label>ผิวหนังหลุดลอก
        <select id="p1_skin_detach">
          <option value="">-- เลือก --</option>
          <option value="none" ${d.skinDetach === "none" ? "selected" : ""}>ไม่มี</option>
          <option value="lt10" ${d.skinDetach === "lt10" ? "selected" : ""}>มี แต่ไม่เกิน 10%</option>
          <option value="gt30" ${d.skinDetach === "gt30" ? "selected" : ""}>มากกว่า 30% (ระวัง SJS/TEN)</option>
        </select>
      </label>
      <label>ระยะเวลาหลังได้ยา → เริ่มมีผื่น
        <select id="p1_onset">
          <option value="">-- เลือก --</option>
          <option value="within1h" ${d.onset === "within1h" ? "selected" : ""}>ภายใน 1 ชม.</option>
          <option value="1to6h" ${d.onset === "1to6h" ? "selected" : ""}>1–6 ชม.</option>
          <option value="6to24h" ${d.onset === "6to24h" ? "selected" : ""}>6–24 ชม.</option>
          <option value="1to7d" ${d.onset === "1to7d" ? "selected" : ""}>1–7 วัน</option>
          <option value="8to21d" ${d.onset === "8to21d" ? "selected" : ""}>8–21 วัน</option>
          <option value="gt21d" ${d.onset === "gt21d" ? "selected" : ""}>มากกว่า 21 วัน</option>
        </select>
      </label>
    </div>

    <button class="btn-primary" id="p1_save">บันทึกหน้า 1</button>
    <p class="small-note">* เมื่อบันทึกแล้ว ระบบจะประเมินอัตโนมัติทันทีจากหน้า 1–3</p>
  `;

  document.getElementById("p1_save").addEventListener("click", () => {
    const g = window.drugAllergyData;
    g.page1.name = document.getElementById("p1_name").value;
    g.page1.hn = document.getElementById("p1_hn").value;
    g.page1.age = document.getElementById("p1_age").value;
    g.page1.weight = document.getElementById("p1_weight").value;
    g.page1.underlying = document.getElementById("p1_underlying").value;
    g.page1.drugAllergyHistory = document.getElementById("p1_allergy_history").value;
    g.page1.rashShape = document.getElementById("p1_rash_shape").value;
    g.page1.rashColor = document.getElementById("p1_rash_color").value;
    g.page1.skinDetach = document.getElementById("p1_skin_detach").value;
    g.page1.onset = document.getElementById("p1_onset").value;

    // ประเมินใหม่ทันที
    window.evaluateDrugAllergy();
    alert("บันทึกหน้า 1 แล้ว");
  });
};

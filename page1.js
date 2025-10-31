// page1.js
document.addEventListener("DOMContentLoaded", initPage1);

function initPage1() {
  const root = document.getElementById("page1-root");
  if (!root) return;

  // HTML ของหน้า 1
  root.innerHTML = `
    <div class="page-card">
      <!-- ส่วนที่ 1 -->
      <div class="section-title">
        <span>🧑‍⚕️</span>
        <span>ส่วนที่ 1 ข้อมูลผู้ป่วย</span>
      </div>
      <div class="form-grid-2">
        <div class="form-field">
          <div class="form-label">ชื่อ-สกุล</div>
          <input id="p1-name" type="text" class="form-input" placeholder="เช่น นางสาวกนกพร ตัวอย่าง">
        </div>
        <div class="form-field">
          <div class="form-label">HN</div>
          <input id="p1-hn" type="text" class="form-input" placeholder="เช่น 123456">
        </div>
        <div class="form-field">
          <div class="form-label">อายุ</div>
          <input id="p1-age" type="number" min="0" class="form-input">
        </div>
        <div class="form-field">
          <div class="form-label">น้ำหนัก (กก.)</div>
          <input id="p1-weight" type="number" min="0" step="0.1" class="form-input">
        </div>
        <div class="form-field">
          <div class="form-label">โรคประจำตัว</div>
          <input id="p1-underlying" type="text" class="form-input">
        </div>
        <div class="form-field" style="grid-column:1 / -1;">
          <div class="form-label">ประวัติการแพ้ยา (เคยแพ้มาก่อน)</div>
          <textarea id="p1-allergy-history" rows="2" class="form-textarea"></textarea>
        </div>
      </div>

      <!-- ส่วนที่ 2 -->
      <div class="section-title" style="margin-top:1.25rem;">
        <span>🩹</span>
        <span>ส่วนที่ 2 ประเมินผื่นผิวหนัง</span>
      </div>

      <p class="form-label">รูปร่างผื่น (เลือกได้หลายข้อ)</p>
      <div class="check-group">
        <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="ตุ่มนูน"> ตุ่มนูน</label>
        <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="ปื้นนูน"> ปื้นนูน</label>
        <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="จ้ำเลือด"> จ้ำเลือด</label>
        <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="วงกลมชั้นเดียว"> วงกลมชั้นเดียว</label>
        <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="วงกลม 3 ชั้น"> วงกลม 3 ชั้น</label>
      </div>

      <p class="form-label" style="margin-top:.75rem;">สีผื่น</p>
      <div class="check-group">
        <label class="check-inline"><input type="checkbox" name="p1-rashColor" value="แดง"> แดง</label>
        <label class="check-inline"><input type="checkbox" name="p1-rashColor" value="แดงไหม้"> แดงไหม้</label>
        <label class="check-inline"><input type="checkbox" name="p1-rashColor" value="ม่วง"> ม่วง</label>
        <label class="check-inline"><input type="checkbox" name="p1-rashColor" value="เหลือง"> เหลือง</label>
      </div>

      <p class="form-label" style="margin-top:.75rem;">ตุ่มน้ำ</p>
      <div class="check-group">
        <label class="check-inline"><input type="checkbox" name="p1-blister" value="เล็ก"> เล็ก</label>
        <label class="check-inline"><input type="checkbox" name="p1-blister" value="กลาง"> กลาง</label>
        <label class="check-inline"><input type="checkbox" name="p1-blister" value="ใหญ่"> ใหญ่</label>
      </div>

      <div class="form-field" style="margin-top:.75rem; max-width:280px;">
        <div class="form-label">ผิวหนังหลุดลอก</div>
        <select id="p1-peeling" class="form-select">
          <option value="">-- เลือก --</option>
          <option value="ผิวหนังหลุดลอกตรงกลางผื่น">ผิวหนังหลุดลอกตรงกลางผื่น</option>
          <option value="ไม่เกิน 10% BSA">ไม่เกิน 10% BSA</option>
          <option value="เกิน 30% BSA">เกิน 30% BSA</option>
        </select>
      </div>

      <p class="form-label" style="margin-top:1rem;">อาการคัน</p>
      <div class="check-group">
        <label class="check-inline"><input type="checkbox" id="p1-itch-much"> คันมาก</label>
        <label class="check-inline"><input type="checkbox" id="p1-itch-little"> คันน้อย</label>
        <label class="check-inline"><input type="checkbox" id="p1-itch-none"> ไม่คัน</label>
      </div>

      <p class="form-label" style="margin-top:1rem;">ปวด / แสบ / เจ็บ (เลือกได้หลายข้อ)</p>
      <div class="check-group">
        <label class="check-inline"><input type="checkbox" id="p1-pain-pain"> ปวด</label>
        <label class="check-inline"><input type="checkbox" id="p1-pain-burn"> แสบ</label>
        <label class="check-inline"><input type="checkbox" id="p1-pain-sore"> เจ็บ</label>
      </div>

      <p class="form-label" style="margin-top:1rem;">บวม</p>
      <div class="check-group" style="max-width:240px;">
        <label class="check-inline"><input type="checkbox" id="p1-swelling-yes"> บวม</label>
        <label class="check-inline"><input type="checkbox" id="p1-swelling-no"> ไม่บวม</label>
      </div>

      <div class="form-field" style="margin-top:.75rem;">
        <div class="form-label">ตำแหน่งที่พบผื่น</div>
        <input id="p1-location" type="text" class="form-input" placeholder="เช่น ใบหน้า ลำตัว แขน ขา ฝ่ามือ ฝ่าเท้า">
      </div>

      <div class="form-field" style="margin-top:.75rem; max-width:280px;">
        <div class="form-label">การกระจายตัว</div>
        <select id="p1-distribution" class="form-select">
          <option value="">-- เลือก --</option>
          <option value="สมมาตร">สมมาตร</option>
          <option value="ไม่สมมาตร">ไม่สมมาตร</option>
          <option value="เฉพาะที่">เฉพาะที่</option>
        </select>
      </div>

      <div class="form-field" style="margin-top:.75rem;">
        <div class="form-label">น้ำเหลือง/สะเก็ด (ระบุ)</div>
        <input id="p1-exudate" type="text" class="form-input" placeholder="เช่น มีน้ำเหลืองเล็กน้อย / มีสะเก็ดแห้ง">
      </div>

     <!-- ส่วนที่ 3 -->
<div class="section-title" style="margin-top:1.35rem;">
  <span>⏱️</span>
  <span>ส่วนที่ 3 ระยะเวลาที่เริ่มมีอาการ</span>
</div>

<div class="form-field" style="max-width:280px;">
  <div class="form-label">เลือกช่วงเวลา</div>
  <select id="p1-onset" class="form-select">
    <option value="">-- เลือก --</option>
    <option value="ภายใน 1 ชั่วโมง">ภายใน 1 ชั่วโมง</option>
    <option value="1–6 ชั่วโมง">1–6 ชั่วโมง</option>
    <option value="6–24 ชั่วโมง">6–24 ชั่วโมง</option>
    <option value="1–7 วัน">1–7 วัน</option>
    <option value="1–6 สัปดาห์">1–6 สัปดาห์</option>
  </select>
</div>


      <div style="margin-top:1.2rem;">
        <button id="p1-save" class="primary-btn">บันทึกหน้า 1</button>
        <span id="p1-status" class="save-status"></span>
      </div>
    </div>
  `;

  // ผูกปุ่มบันทึก
  const btn = document.getElementById("p1-save");
  if (btn) btn.addEventListener("click", savePage1);

  // กันบวมกับไม่บวมเลือกพร้อมกัน
  const swYes = document.getElementById("p1-swelling-yes");
  const swNo = document.getElementById("p1-swelling-no");
  if (swYes && swNo) {
    swYes.addEventListener("change", (e) => {
      if (e.target.checked) swNo.checked = false;
    });
    swNo.addEventListener("change", (e) => {
      if (e.target.checked) swYes.checked = false;
    });
  }
}

function savePage1(e) {
  if (e && e.preventDefault) e.preventDefault();

  // ผู้ป่วย
  const name = document.getElementById("p1-name").value;
  const hn = document.getElementById("p1-hn").value;
  const age = document.getElementById("p1-age").value;
  const weight = document.getElementById("p1-weight").value;
  const underlying = document.getElementById("p1-underlying").value;
  const allergyHistory = document.getElementById("p1-allergy-history").value;

  // ผิวหนัง
  const rashShapeValues = Array.from(document.querySelectorAll("input[name='p1-rashShape']:checked")).map(el => el.value);
  const rashColorValues = Array.from(document.querySelectorAll("input[name='p1-rashColor']:checked")).map(el => el.value);
  const blisterValues   = Array.from(document.querySelectorAll("input[name='p1-blister']:checked")).map(el => el.value);
  const peeling         = document.getElementById("p1-peeling").value;

  // คัน
  const itchMuch   = document.getElementById("p1-itch-much")?.checked ? "คันมาก" : "";
  const itchLittle = document.getElementById("p1-itch-little")?.checked ? "คันน้อย" : "";
  const itchNone   = document.getElementById("p1-itch-none")?.checked ? "ไม่คัน" : "";
  const itchList   = [itchMuch, itchLittle, itchNone].filter(Boolean);

  // ปวด / แสบ / เจ็บ
  const painPain = document.getElementById("p1-pain-pain")?.checked ? "ปวด" : "";
  const painBurn = document.getElementById("p1-pain-burn")?.checked ? "แสบ" : "";
  const painSore = document.getElementById("p1-pain-sore")?.checked ? "เจ็บ" : "";
  const painList = [painPain, painBurn, painSore].filter(Boolean);

  // บวม
  const swellingYes = document.getElementById("p1-swelling-yes")?.checked ? "บวม" : "";
  const swellingNo  = document.getElementById("p1-swelling-no")?.checked ? "ไม่บวม" : "";
  const swellingList = [swellingYes, swellingNo].filter(Boolean);

  const location     = document.getElementById("p1-location").value;
  const distribution = document.getElementById("p1-distribution").value;
  const exudate      = document.getElementById("p1-exudate").value;
  const onset        = document.getElementById("p1-onset").value;

  // สร้างตัวกลางถ้ายังไม่มี
  if (!window.drugAllergyData) {
    window.drugAllergyData = {};
  }

  // เก็บฝั่งข้อมูลผู้ป่วย
  window.drugAllergyData.patient = {
    name,
    hn,
    age,
    weight,
    underlying,
    drugAllergyHistory: allergyHistory,
  };

  // เก็บฝั่งผิวหนัง
  window.drugAllergyData.skin = {
    ...(window.drugAllergyData.skin || {}),
    rashShape: rashShapeValues,
    rashColor: rashColorValues,
    blister: blisterValues,
    peeling: peeling,
    itch: itchList,
    pain: painList,
    swelling: swellingList,
    location: location,
    distribution: distribution,
    exudate: exudate,
    onset: onset,
  };

  // เก็บลง localStorage ด้วย
  localStorage.setItem("drugAllergyData", JSON.stringify(window.drugAllergyData));

  // โชว์สถานะ
  const st = document.getElementById("p1-status");
  const btn = document.getElementById("p1-save");
  if (st) st.textContent = "บันทึกแล้ว ✔";
  if (btn) {
    btn.textContent = "บันทึกแล้ว ✔";
    btn.disabled = true;
  }

  console.log("★ หน้า 1 บันทึกแล้ว", window.drugAllergyData);

  // 1.5 วิ แล้วกลับเป็นปกติ
  setTimeout(() => {
    if (st) st.textContent = "";
    if (btn) {
      btn.textContent = "บันทึกหน้า 1";
      btn.disabled = false;
    }
  }, 1500);
}

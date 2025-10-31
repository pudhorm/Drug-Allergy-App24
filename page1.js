// page1.js
// หน้า 1: ข้อมูลผู้ป่วย + อาการผิวหนัง แล้วเขียนเข้า window.drugAllergyData

document.addEventListener("DOMContentLoaded", initPage1);

function initPage1() {
  const root = document.getElementById("page1-root");
  if (!root) return;

  root.innerHTML = `
    <div style="max-width:820px; background:white; padding:1rem 1.2rem; border-radius:.75rem; box-shadow:0 2px 10px rgba(0,0,0,.05);">
      <h3>🧑‍⚕️ ส่วนที่ 1 ข้อมูลผู้ป่วย</h3>
      <label>ชื่อ-สกุล
        <input id="p1-name" type="text" placeholder="เช่น นางสาวกนกพร ตัวอย่าง">
      </label>
      <label>HN
        <input id="p1-hn" type="text" placeholder="เช่น 123456">
      </label>
      <label>อายุ
        <input id="p1-age" type="number" min="0">
      </label>
      <label>น้ำหนัก (กก.)
        <input id="p1-weight" type="number" min="0" step="0.1">
      </label>
      <label>โรคประจำตัว
        <input id="p1-underlying" type="text">
      </label>
      <label>ประวัติการแพ้ยา (เคยแพ้มาก่อน)
        <textarea id="p1-allergy-history" rows="2"></textarea>
      </label>

      <h3 style="margin-top:1rem;">🩹 ส่วนที่ 2 ประเมินผื่นผิวหนัง</h3>

      <!-- 1) รูปร่างผื่น -->
      <p><strong>รูปร่างผื่น</strong> (เลือกได้หลายข้อ)</p>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:.35rem;">
        <label><input type="checkbox" name="p1-rashShape" value="ตุ่มนูน"> ตุ่มนูน</label>
        <label><input type="checkbox" name="p1-rashShape" value="ปื้นนูน"> ปื้นนูน</label>
        <label><input type="checkbox" name="p1-rashShape" value="วงกลมชั้นเดียว"> วงกลมชั้นเดียว</label>
        <label><input type="checkbox" name="p1-rashShape" value="วงกลม 3 ชั้น"> วงกลม 3 ชั้น</label>
        <label><input type="checkbox" name="p1-rashShape" value="จ้ำเลือด"> จ้ำเลือด</label>
        <label><input type="checkbox" name="p1-rashShape" value="อื่นๆ"> อื่นๆ</label>
      </div>

      <!-- 2) สีผื่น -->
      <p style="margin-top:1rem;"><strong>สีผื่น</strong> (เลือกได้หลายข้อ)</p>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:.35rem;">
        <label><input type="checkbox" name="p1-rashColor" value="แดง"> แดง</label>
        <label><input type="checkbox" name="p1-rashColor" value="แดงไหม้"> แดงไหม้</label>
        <label><input type="checkbox" name="p1-rashColor" value="ซีด"> ซีด</label>
        <label><input type="checkbox" name="p1-rashColor" value="ม่วง"> ม่วง</label>
        <label><input type="checkbox" name="p1-rashColor" value="เหลือง"> เหลือง</label>
        <label><input type="checkbox" name="p1-rashColor" value="อื่นๆ"> อื่นๆ</label>
      </div>

      <!-- 3) ตุ่มน้ำ -->
      <p style="margin-top:1rem;"><strong>ตุ่มน้ำ</strong></p>
      <label><input type="checkbox" name="p1-blister" value="เล็ก"> มีตุ่มน้ำขนาดเล็ก</label>
      <label><input type="checkbox" name="p1-blister" value="กลาง"> มีตุ่มน้ำขนาดกลาง</label>
      <label><input type="checkbox" name="p1-blister" value="ใหญ่"> มีตุ่มน้ำขนาดใหญ่</label>

      <!-- 4) ผิวหลุดลอก -->
      <p style="margin-top:1rem;"><strong>ผิวหนังหลุดลอก</strong></p>
      <select id="p1-peeling">
        <option value="">-- เลือก --</option>
        <option value="ผิวหนังหลุดลอกตรงกลางผื่น">ผิวหนังหลุดลอกตรงกลางผื่น</option>
        <option value="ไม่เกิน 10% BSA">ไม่เกิน 10% BSA</option>
        <option value="เกิน 30% BSA">เกิน 30% BSA</option>
        <option value="อื่นๆ">อื่นๆ</option>
      </select>

      <!-- 5) คัน/ไม่คัน -->
      <p style="margin-top:1rem;"><strong>อาการคัน</strong></p>
      <label><input type="radio" name="p1-itch" value="คันมาก"> คันมาก</label>
      <label><input type="radio" name="p1-itch" value="คันน้อย"> คันน้อย</label>
      <label><input type="radio" name="p1-itch" value="ไม่คัน"> ไม่คัน</label>

      <!-- 6) ปวด/แสบ/เจ็บ -->
     <p style="margin-top:1rem;"><strong>ปวด / แสบ / เจ็บ</strong> (เลือกได้หลายข้อ)</p>
     <label><input type="checkbox" id="p1-pain-pain"> ปวด</label>
     <label><input type="checkbox" id="p1-pain-burn"> แสบ</label>
     <label><input type="checkbox" id="p1-pain-sore"> เจ็บ</label>


      <!-- 7) บวม -->
      <p style="margin-top:1rem;"><strong>บวม</strong></p>
      <label><input type="radio" name="p1-swelling" value="บวม"> บวม</label>
      <label><input type="radio" name="p1-swelling" value="ไม่บวม"> ไม่บวม</label>

      <!-- 8) ตำแหน่ง -->
      <label style="margin-top:1rem; display:block;">ตำแหน่งที่พบผื่น
        <input id="p1-location" type="text" placeholder="เช่น ใบหน้า ลำตัว แขน ขา ฝ่ามือ ฝ่าเท้า">
      </label>

      <!-- 9) การกระจายตัว -->
      <label style="margin-top:.5rem; display:block;">การกระจายตัว
        <select id="p1-distribution">
          <option value="">-- เลือก --</option>
          <option value="สมมาตร">สมมาตร</option>
          <option value="ไม่สมมาตร">ไม่สมมาตร</option>
          <option value="เฉพาะที่">เฉพาะที่</option>
        </select>
      </label>

      <!-- 10) น้ำเหลือง/สะเก็ด -->
      <label style="margin-top:.5rem; display:block;">น้ำเหลือง/สะเก็ด (ระบุ)
        <input id="p1-exudate" type="text" placeholder="เช่น มีน้ำเหลืองเล็กน้อย / มีสะเก็ดแห้ง">
      </label>

      <!-- 11) ระยะเวลาที่เริ่มมีอาการ -->
      <p style="margin-top:1rem;">⏱️ ระยะเวลาที่เริ่มมีอาการ</p>
      <select id="p1-onset">
        <option value="">-- เลือก --</option>
        <option value="ภายใน 1 ชั่วโมง">ภายใน 1 ชั่วโมง</option>
        <option value="1–6 ชั่วโมง">1–6 ชั่วโมง</option>
        <option value="6–24 ชั่วโมง">6–24 ชั่วโมง</option>
        <option value="1–7 วัน">1–7 วัน</option>
        <option value="1–6 สัปดาห์">1–6 สัปดาห์</option>
      </select>

      <button id="p1-save" style="margin-top:1rem; background:#7c3aed; color:white; border:0; padding:.5rem .85rem; border-radius:.5rem; cursor:pointer;">
        บันทึกหน้า 1
      </button>
      <span id="p1-status" style="margin-left:.5rem; color:green;"></span>
    </div>
  `;

  document.getElementById("p1-save").addEventListener("click", savePage1);
}

function savePage1() {
  // ส่วนผู้ป่วย
  const name = document.getElementById("p1-name").value;
  const hn = document.getElementById("p1-hn").value;
  const age = document.getElementById("p1-age").value;
  const weight = document.getElementById("p1-weight").value;
  const underlying = document.getElementById("p1-underlying").value;
  const allergyHistory = document.getElementById("p1-allergy-history").value;

  // ผิวหนัง
  const rashShapeValues = Array.from(document.querySelectorAll("input[name='p1-rashShape']:checked")).map(el => el.value);
  const rashColorValues = Array.from(document.querySelectorAll("input[name='p1-rashColor']:checked")).map(el => el.value);
  const blisterValues = Array.from(document.querySelectorAll("input[name='p1-blister']:checked")).map(el => el.value);
  const peeling = document.getElementById("p1-peeling").value;
  const itchNode = document.querySelector("input[name='p1-itch']:checked");
  const itch = itchNode ? itchNode.value : "";
  const pain = document.getElementById("p1-pain").checked ? "มีอาการปวด/แสบ/เจ็บ" : "";
  const swellingNode = document.querySelector("input[name='p1-swelling']:checked");
  const swelling = swellingNode ? swellingNode.value : "";
  const location = document.getElementById("p1-location").value;
  const distribution = document.getElementById("p1-distribution").value;
  const exudate = document.getElementById("p1-exudate").value;
  const onset = document.getElementById("p1-onset").value;

  if (!window.drugAllergyData) {
    window.drugAllergyData = {};
  }

  // ผู้ป่วย
  window.drugAllergyData.patient = {
    name,
    hn,
    age,
    weight,
    underlying,
    drugAllergyHistory: allergyHistory
  };

  // ผิวหนัง
  window.drugAllergyData.skin = {
    ...(window.drugAllergyData.skin || {}),
    rashShape: rashShapeValues,
    rashColor: rashColorValues,
    blister: blisterValues,
    peeling: peeling,
    itch: itch,
    pain: pain,
    swelling: swelling,
    location: location,
    distribution: distribution,
    exudate: exudate,
    onset: onset
  };

  const st = document.getElementById("p1-status");
  if (st) st.textContent = "บันทึกแล้ว ✔";

  console.log("หลังบันทึกหน้า 1 =", window.drugAllergyData);
}

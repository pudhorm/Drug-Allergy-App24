// page1.js
// หน้า 1: ข้อมูลผู้ป่วย + อาการผิวหนัง แล้วเขียนเข้า window.drugAllergyData

function initPage1() {
  const root = document.getElementById("page1-root");
  if (!root) return;

  root.innerHTML = `
    <div style="max-width:720px; background:white; padding:1rem 1.2rem; border-radius:.75rem; box-shadow:0 2px 10px rgba(0,0,0,.05);">
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
      <p>รูปร่างผื่น (เลือกได้หลายข้อ)</p>
      <label><input type="checkbox" name="p1-rashShape" value="ตุ่มนูน"> ตุ่มนูน</label>
      <label><input type="checkbox" name="p1-rashShape" value="ปื้นนูน"> ปื้นนูน</label>
      <label><input type="checkbox" name="p1-rashShape" value="จ้ำเลือด"> จ้ำเลือด</label>
      <label><input type="checkbox" name="p1-rashShape" value="อื่นๆ"> อื่นๆ</label>

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

  // ผูกปุ่ม
  document.getElementById("p1-save").addEventListener("click", savePage1);
}

function savePage1() {
  // อ่านค่าจากฟอร์ม
  const name = document.getElementById("p1-name").value;
  const hn = document.getElementById("p1-hn").value;
  const age = document.getElementById("p1-age").value;
  const weight = document.getElementById("p1-weight").value;
  const underlying = document.getElementById("p1-underlying").value;
  const allergyHistory = document.getElementById("p1-allergy-history").value;
  const onset = document.getElementById("p1-onset").value;

  const rashShapeNodes = document.querySelectorAll("input[name='p1-rashShape']:checked");
  const rashShapeValues = Array.from(rashShapeNodes).map(el => el.value);

  // เขียนเข้าตัวแปรกลาง
  if (!window.drugAllergyData) {
    window.drugAllergyData = {};
  }

  window.drugAllergyData.patient = {
    name,
    hn,
    age,
    weight,
    underlying,
    drugAllergyHistory: allergyHistory
  };

  window.drugAllergyData.skin = {
    ...(window.drugAllergyData.skin || {}),
    rashShape: rashShapeValues,
    onset: onset
  };

  // แจ้งผู้ใช้
  const st = document.getElementById("p1-status");
  if (st) st.textContent = "บันทึกแล้ว ✔";

  console.log("หลังบันทึกหน้า 1 =", window.drugAllergyData);
}

// ให้รันตอนโหลดหน้า
document.addEventListener("DOMContentLoaded", initPage1);

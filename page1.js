// page1.js
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

      <p><strong>รูปร่างผื่น</strong> (เลือกได้หลายข้อ)</p>
      <label><input type="checkbox" name="p1-rashShape" value="ตุ่มนูน"> ตุ่มนูน</label>
      <label><input type="checkbox" name="p1-rashShape" value="ปื้นนูน"> ปื้นนูน</label>
      <label><input type="checkbox" name="p1-rashShape" value="จ้ำเลือด"> จ้ำเลือด</label>
      <label><input type="checkbox" name="p1-rashShape" value="วงกลมชั้นเดียว"> วงกลมชั้นเดียว</label>
      <label><input type="checkbox" name="p1-rashShape" value="วงกลม 3 ชั้น"> วงกลม 3 ชั้น</label>

      <p style="margin-top:1rem;"><strong>สีผื่น</strong></p>
      <label><input type="checkbox" name="p1-rashColor" value="แดง"> แดง</label>
      <label><input type="checkbox" name="p1-rashColor" value="แดงไหม้"> แดงไหม้</label>
      <label><input type="checkbox" name="p1-rashColor" value="ม่วง"> ม่วง</label>
      <label><input type="checkbox" name="p1-rashColor" value="เหลือง"> เหลือง</label>

      <p style="margin-top:1rem;"><strong>ตุ่มน้ำ</strong></p>
      <label><input type="checkbox" name="p1-blister" value="เล็ก"> เล็ก</label>
      <label><input type="checkbox" name="p1-blister" value="กลาง"> กลาง</label>
      <label><input type="checkbox" name="p1-blister" value="ใหญ่"> ใหญ่</label>

      <p style="margin-top:1rem;"><strong>ผิวหนังหลุดลอก</strong></p>
      <select id="p1-peeling">
        <option value="">-- เลือก --</option>
        <option value="ผิวหนังหลุดลอกตรงกลางผื่น">ผิวหนังหลุดลอกตรงกลางผื่น</option>
        <option value="ไม่เกิน 10% BSA">ไม่เกิน 10% BSA</option>
        <option value="เกิน 30% BSA">เกิน 30% BSA</option>
      </select>

      <p style="margin-top:1rem;"><strong>อาการคัน</strong></p>
      <label><input type="checkbox" id="p1-itch-much"> คันมาก</label>
      <label><input type="checkbox" id="p1-itch-little"> คันน้อย</label>
      <label><input type="checkbox" id="p1-itch-none"> ไม่คัน</label>

      <p style="margin-top:1rem;"><strong>ปวด / แสบ / เจ็บ</strong> (เลือกได้หลายข้อ)</p>
      <label><input type="checkbox" id="p1-pain-pain"> ปวด</label>
      <label><input type="checkbox" id="p1-pain-burn"> แสบ</label>
      <label><input type="checkbox" id="p1-pain-sore"> เจ็บ</label>

      <p style="margin-top:1rem;"><strong>บวม</strong></p>
      <label><input type="checkbox" id="p1-swelling-yes"> บวม</label>
      <label><input type="checkbox" id="p1-swelling-no"> ไม่บวม</label>

      <label style="margin-top:1rem; display:block;">ตำแหน่งที่พบผื่น
        <input id="p1-location" type="text" placeholder="เช่น ใบหน้า ลำตัว แขน ขา ฝ่ามือ ฝ่าเท้า">
      </label>

      <label style="margin-top:.5rem; display:block;">การกระจายตัว
        <select id="p1-distribution">
          <option value="">-- เลือก --</option>
          <option value="สมมาตร">สมมาตร</option>
          <option value="ไม่สมมาตร">ไม่สมมาตร</option>
          <option value="เฉพาะที่">เฉพาะที่</option>
        </select>
      </label>

      <label style="margin-top:.5rem; display:block;">น้ำเหลือง/สะเก็ด (ระบุ)
        <input id="p1-exudate" type="text" placeholder="เช่น มีน้ำเหลืองเล็กน้อย / มีสะเก็ดแห้ง">
      </label>

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

  const btn = document.getElementById("p1-save");
  if (btn) btn.addEventListener("click", savePage1);

  // กันบวมกับไม่บวมติ๊กพร้อมกัน
  const swYes = document.getElementById("p1-swelling-yes");
  const swNo = document.getElementById("p1-swelling-no");
  if (swYes && swNo) {
    swYes.addEventListener("change", e => {
      if (e.target.checked) swNo.checked = false;
    });
    swNo.addEventListener("change", e => {
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

  // ปวด แสบ เจ็บ
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
    rashColor: rashColorValues,
    blister: blisterValues,
    peeling: peeling,
    itch: itchList,
    pain: painList,
    swelling: swellingList,   
    location: location,
    distribution: distribution,
    exudate: exudate,
    onset: onset
  };
  localStorage.setItem("drugAllergyData", JSON.stringify(window.drugAllergyData));

  // เก็บลง localStorage ด้วย (กันหายตอนเปลี่ยนหน้า)
localStorage.setItem("drugAllergyData", JSON.stringify(window.drugAllergyData));

  const st = document.getElementById("p1-status");
  if (st) st.textContent = "บันทึกแล้ว ✔";

  console.log("★ หน้า 1 บันทึกแล้ว", window.drugAllergyData);
} ตรงไหนหาไม่เจอ

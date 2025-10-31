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
      <label><input type="checkbox" id="p1-swelling-no"> ไม่บวม<

// page1.js
document.addEventListener("DOMContentLoaded", initPage1);

function initPage1() {
  const root = document.getElementById("page1-root");
  if (!root) return;

  root.innerHTML = `
    <div class="page-card">
      <!-- ส่วนที่ 1 ข้อมูลผู้ป่วย -->
      <div class="section-box section-1">
        <div class="section-title">
          <span>🧑‍⚕️</span>
          <span>ส่วนที่ 1 ข้อมูลผู้ป่วย</span>
        </div>
        <div class="form-grid-2">
          <div class="form-field" style="grid-column:1 / -1;">
            <label class="form-label">ชื่อ-สกุล</label>
            <input id="p1-name" class="form-input" placeholder="เช่น นางสาวกนกพร ตัวอย่าง" />
          </div>
          <div class="form-field">
            <label class="form-label">HN</label>
            <input id="p1-hn" class="form-input" placeholder="เช่น 123456" />
          </div>
          <div class="form-field">
            <label class="form-label">อายุ</label>
            <select id="p1-age-select" class="form-select">
              <option value="">-- เลือก --</option>
              <option value="ทารก / เด็กเล็ก (< 1 ปี)">ทารก / เด็กเล็ก (&lt; 1 ปี)</option>
              <option value="1–5 ปี">1–5 ปี</option>
              <option value="6–12 ปี">6–12 ปี</option>
              <option value="13–18 ปี">13–18 ปี</option>
              <option value="19–40 ปี">19–40 ปี</option>
              <option value="41–60 ปี">41–60 ปี</option>
              <option value="มากกว่า 60 ปี">มากกว่า 60 ปี</option>
              <option value="other">อื่นๆ ระบุ…</option>
            </select>
            <input id="p1-age-other" class="form-input" placeholder="ระบุอายุ (ปี)" style="display:none; margin-top:.4rem;" />
          </div>
          <div class="form-field">
            <label class="form-label">น้ำหนัก (กก.)</label>
            <select id="p1-weight-select" class="form-select">
              <option value="">-- เลือก --</option>
              <option value="< 10 กก.">&lt; 10 กก.</option>
              <option value="10–20 กก.">10–20 กก.</option>
              <option value="21–40 กก.">21–40 กก.</option>
              <option value="41–60 กก.">41–60 กก.</option>
              <option value="61–80 กก.">61–80 กก.</option>
              <option value="81–100 กก.">81–100 กก.</option>
              <option value="มากกว่า 100 กก.">มากกว่า 100 กก.</option>
              <option value="other">อื่นๆ ระบุ…</option>
            </select>
            <input id="p1-weight-other" type="number" min="0" step="0.1" class="form-input" placeholder="เช่น 54.5" style="display:none; margin-top:.4rem;" />
          </div>
          <div class="form-field" style="grid-column:1 / -1;">
            <label class="form-label">โรคประจำตัว</label>
            <select id="p1-underlying-select" class="form-select">
              <option value="">-- เลือก --</option>
              <option value="ไม่มีโรคประจำตัว">ไม่มีโรคประจำตัว</option>
              <option value="เบาหวาน (DM)">เบาหวาน (DM)</option>
              <option value="ความดันโลหิตสูง (HT)">ความดันโลหิตสูง (HT)</option>
              <option value="โรคไตเรื้อรัง (CKD)">โรคไตเรื้อรัง (CKD)</option>
              <option value="หอบหืด / COPD">หอบหืด / COPD</option>
              <option value="โรคหัวใจ">โรคหัวใจ</option>
              <option value="other">อื่นๆ ระบุ…</option>
            </select>
            <input id="p1-underlying-other" class="form-input" placeholder="ระบุโรคประจำตัว" style="display:none; margin-top:.4rem;" />
          </div>
          <div class="form-field" style="grid-column:1 / -1;">
            <label class="form-label">ประวัติการแพ้ยา (เคยแพ้มาก่อน)</label>
            <textarea id="p1-allergy-history" class="form-textarea" rows="2" placeholder="เช่น แพ้ amoxicillin ผื่นขึ้น, แพ้ NSAIDs บวม"></textarea>
          </div>
        </div>
      </div>

      <!-- ส่วนที่ 2 ผิวหนัง -->
      <div class="section-box section-2">
        <div class="section-title">
          <span>🩹</span>
          <span>ส่วนที่ 2 ประเมินผื่นผิวหนัง</span>
        </div>

        <!-- รูปร่างผื่น -->
        <label class="form-label">รูปร่างผื่น</label>
        <div class="check-2col">
          <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="ตุ่มนูน"> ตุ่มนูน</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="ปื้นนูน"> ปื้นนูน</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="วงกลม 3 ชั้น"> วงกลม 3 ชั้น</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="ขอบหยัก"> ขอบหยัก</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="ขอบไม่ชัดเจน"> ขอบไม่ชัดเจน</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="จ้ำเลือด"> จ้ำเลือด</label>

          <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="ตุ่มแบนราบ"> ตุ่มแบนราบ</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="วงกลมชั้นเดียว"> วงกลมชั้นเดียว</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="วงรี"> วงรี</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="ขอบเรียบ"> ขอบเรียบ</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="จุดเล็ก"> จุดเล็ก</label>
        </div>
        <input id="p1-rashShape-other" class="form-input" placeholder="อื่นๆ ระบุ..." style="margin-bottom:1rem;">

        <!-- สีผื่น -->
        <label class="form-label">สีผื่น</label>
        <div class="check-2col">
          <label class="check-inline"><input type="checkbox" name="p1-rashColor" value="แดง"> แดง</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashColor" value="แดงไหม้"> แดงไหม้</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashColor" value="ใส"> ใส</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashColor" value="เหลือง"> เหลือง</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashColor" value="ดำ"> ดำ</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashColor" value="ซีด"> ซีด</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashColor" value="ม่วง"> ม่วง</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashColor" value="มันเงา"> มันเงา</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashColor" value="เทา"> เทา</label>
        </div>
        <input id="p1-rashColor-other" class="form-input" placeholder="อื่นๆ ระบุ..." style="margin-bottom:1rem;">

        <!-- ขุย/แห้ง/ลอก -->
        <label class="form-label">ขุย/แห้ง/ลอก</label>
        <div class="check-group" style="max-width:360px;">
          <label class="check-inline"><input type="checkbox" id="p1-scale" value="ขุย"> ขุย</label>
          <label class="check-inline"><input type="checkbox" id="p1-dry" value="แห้ง"> แห้ง</label>
          <label class="check-inline"><input type="checkbox" id="p1-peel" value="ลอก"> ลอก</label>
          <label class="check-inline"><input type="checkbox" id="p1-scale-none" value="ไม่พบ"> ไม่พบ</label>
        </div>
        <input id="p1-scale-other" class="form-input" placeholder="อื่นๆ ระบุ..." style="margin-bottom:1rem;">

        <!-- ตุ่มหนอง -->
        <label class="form-label">ตุ่มหนอง</label>
        <div class="check-group" style="max-width:240px;">
          <label class="check-inline"><input type="checkbox" id="p1-pustule-yes" value="พบ"> พบ</label>
          <label class="check-inline"><input type="checkbox" id="p1-pustule-no" value="ไม่พบ"> ไม่พบ</label>
        </div>

        <!-- ผิวหนังหลุดลอก -->
        <div class="form-field" style="margin-top:.75rem; max-width:280px;">
          <label class="form-label">ผิวหนังหลุดลอก</label>
          <select id="p1-peeling" class="form-select">
            <option value="">-- เลือก --</option>
            <option value="ผิวหนังหลุดลอกตรงกลางผื่น">ผิวหนังหลุดลอกตรงกลางผื่น</option>
            <option value="ไม่เกิน 10% BSA">ไม่เกิน 10% BSA</option>
            <option value="เกิน 30% BSA">เกิน 30% BSA</option>
          </select>
        </div>

        <!-- คัน -->
        <label class="form-label" style="margin-top:1rem;">อาการคัน</label>
        <div class="check-group" style="max-width:320px;">
          <label class="check-inline"><input type="checkbox" id="p1-itch-much"> คันมาก</label>
          <label class="check-inline"><input type="checkbox" id="p1-itch-little"> คันน้อย</label>
          <label class="check-inline"><input type="checkbox" id="p1-itch-none"> ไม่คัน</label>
        </div>

        <!-- ปวด / แสบ / เจ็บ -->
        <label class="form-label" style="margin-top:1rem;">ปวด / แสบ / เจ็บ</label>
        <div class="check-group" style="max-width:

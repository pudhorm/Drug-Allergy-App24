// page1.js
document.addEventListener("DOMContentLoaded", initPage1);

function initPage1() {
  const root = document.getElementById("page1-root");
  if (!root) return;

  root.innerHTML = `
    <div class="page-card" style="max-width:880px; margin:0 auto;">
      <!-- ส่วนที่ 1 ข้อมูลผู้ป่วย -->
      <div class="section-box section-1">
        <div class="section-title">
          <span>🧑‍⚕️</span>
          <span>ส่วนที่ 1 ข้อมูลผู้ป่วย</span>
        </div>

        <div class="form-grid-2">
          <!-- ชื่อ-สกุล -->
          <div class="form-field" style="grid-column:1 / -1;">
            <div class="form-label">ชื่อ-สกุล</div>
            <input id="p1-name" type="text" class="form-input" placeholder="เช่น นางสาวกนกพร ตัวอย่าง">
          </div>

          <!-- HN -->
          <div class="form-field">
            <div class="form-label">HN</div>
            <input id="p1-hn" type="text" class="form-input" placeholder="เช่น 123456">
          </div>

          <!-- อายุ (select + อื่นๆ) -->
          <div class="form-field">
            <div class="form-label">อายุ</div>
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
            <input id="p1-age-other" type="text" class="form-input" placeholder="ระบุอายุ (ปี)" style="margin-top:.4rem; display:none;">
          </div>

          <!-- น้ำหนัก (select + อื่นๆ) -->
          <div class="form-field">
            <div class="form-label">น้ำหนัก (กก.)</div>
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
            <input id="p1-weight-other" type="number" min="0" step="0.1" class="form-input" placeholder="เช่น 54.5" style="margin-top:.4rem; display:none;">
          </div>

          <!-- โรคประจำตัว (select + อื่นๆ) -->
          <div class="form-field" style="grid-column:1 / -1;">
            <div class="form-label">โรคประจำตัว</div>
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
            <input id="p1-underlying-other" type="text" class="form-input" placeholder="ระบุโรคประจำตัว" style="margin-top:.4rem; display:none;">
          </div>

          <!-- ประวัติการแพ้ยา -->
          <div class="form-field" style="grid-column:1 / -1;">
            <div class="form-label">ประวัติการแพ้ยา (เคยแพ้มาก่อน)</div>
            <textarea id="p1-allergy-history" rows="2" class="form-textarea" placeholder="เช่น แพ้ amoxicillin ผื่นขึ้น, แพ้ NSAIDs บวม"></textarea>
          </div>
        </div>
      </div>

      <!-- ส่วนที่ 2 ประเมินผื่นผิวหนัง -->
      <div class="section-box section-2">
        <div class="section-title">
          <span>🩹</span>
          <span>ส่วนที่ 2 ประเมินผื่นผิวหนัง</span>
        </div>

        <!-- รูปร่างผื่น -->
        <p class="form-label">รูปร่างผื่น</p>
        <div class="check-group check-2col">
          <!-- ซ้าย -->
          <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="ตุ่มนูน"> ตุ่มนูน</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="ปื้นนูน"> ปื้นนูน</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="วงกลม 3 ชั้น"> วงกลม 3 ชั้น</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="ขอบหยัก"> ขอบหยัก</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="ขอบไม่ชัดเจน"> ขอบไม่ชัดเจน</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="จ้ำเลือด"> จ้ำเลือด</label>
          <!-- ขวา -->
          <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="ตุ่มแบนราบ"> ตุ่มแบนราบ</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="วงกลมชั้นเดียว"> วงกลมชั้นเดียว</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="วงรี"> วงรี</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="ขอบเรียบ"> ขอบเรียบ</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashShape" value="จุดเล็ก"> จุดเล็ก</label>
        </div>
        <input id="p1-rashShape-other" type="text" class="form-input" placeholder="อื่นๆ ระบุ..." style="margin-top:.6rem;">

        <!-- สีผื่น -->
        <p class="form-label" style="margin-top:1rem;">สีผื่น</p>
        <div class="check-group check-2col">
          <!-- ซ้าย -->
          <label class="check-inline"><input type="checkbox" name="p1-rashColor" value="แดง"> แดง</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashColor" value="แดงซีด"> แดงซีด</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashColor" value="ใส"> ใส</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashColor" value="เหลือง"> เหลือง</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashColor" value="ดำ"> ดำ</label>
          <!-- ขวา -->
          <label class="check-inline"><input type="checkbox" name="p1-rashColor" value="แดงไหม้"> แดงไหม้</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashColor" value="ซีด"> ซีด</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashColor" value="ม่วง"> ม่วง</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashColor" value="มันเงา"> มันเงา</label>
          <label class="check-inline"><input type="checkbox" name="p1-rashColor" value="เทา"> เทา</label>
        </div>
        <input id="p1-rashColor-other" type="text" class="form-input" placeholder="อื่นๆ ระบุ..." style="margin-top:.6rem;">

        <!-- ตุ่มน้ำ -->
        <p class="form-label" style="margin-top:1rem;">ตุ่มน้ำ</p>
        <div class="check-group">
          <label class="check-inline"><input type="checkbox" name="p1-blister" value="เล็ก"> เล็ก</label>
          <label class="check-inline"><input type="checkbox" name="p1-blister" value="กลาง"> กลาง</label>
          <label class="check-inline"><input type="checkbox" name="p1-blister" value="ใหญ่"> ใหญ่</label>
        </div>

        <!-- ผิวหนังหลุดลอก -->
        <div class="form-field" style="margin-top:.75rem; max-width:280px;">
          <div class="form-label">ผิวหนังหลุดลอก</div>
          <select id="p1-peeling" class="form-select">
            <option value="">-- เลือก --</option>
            <option value="ผิวหนังหลุดลอกตรงกลางผื่น">ผิวหนังหลุดลอกตรงกลางผื่น</option>
            <option value="ไม่เกิน 10% BSA">ไม่เกิน 10% BSA</option>
            <option value="เกิน 30% BSA">เกิน 30% BSA</option>
          </select>
        </div>

        <!-- คัน -->
        <p class="form-label" style="margin-top:1rem;">อาการคัน</p>
        <div class="check-group">
          <label class="check-inline"><input type="checkbox" id="p1-itch-much"> คันมาก</label>
          <label class="check-inline"><input type="checkbox" id="p1-itch-little"> คันน้อย</label>
          <label class="check-inline"><input type="checkbox" id="p1-itch-none"> ไม่คัน</label>
        </div>

        <!-- ปวด/แสบ/เจ็บ -->
        <p class="form-label" style="margin-top:1rem;">ปวด / แสบ / เจ็บ</p>
        <div class="check-group">
          <label class="check-inline"><input type="checkbox" id="p1-pain-pain"> ปวด</label>
          <label class="check-inline"><input type="checkbox" id="p1-pain-burn"> แสบ</label>
          <label class="check-inline"><input type="checkbox" id="p1-pain-sore"> เจ็บ</label>
        </div>

        <!-- บวม -->
        <p class="form-label" style="margin-top:1rem;">บวม</p>
        <div class="check-group" style="max-width:240px;">
          <label class="check-inline"><input type="checkbox" id="p1-swelling-yes"> บวม</label>
          <label class="check-inline"><input type="checkbox" id="p1-swelling-no"> ไม่บวม</label>
        </div>

        <!-- ตำแหน่ง -->
        <div class="form-field" style="margin-top:.75rem;">
          <div class="form-label">ตำแหน่งที่พบผื่น</div>
          <input id="p1-location" type="text" class="form-input" placeholder="เช่น ใบหน้า ลำตัว แขน ขา ฝ่ามือ ฝ่าเท้า">
        </div>

        <!-- การกระจายตัว -->
        <div class="form-field" style="margin-top:.75rem; max-width:280px;">
          <div class="form-label">การกระจายตัว</div>
          <select id="p1-distribution" class="form-select">
            <option value="">-- เลือก --</option>
            <option value="สมมาตร">สมมาตร</option>
            <option value="ไม่สมมาตร">ไม่สมมาตร</option>
            <option value="เฉพาะที่">เฉพาะที่</option>
          </select>
        </div>

        <!-- น้ำเหลือง/สะเก็ด -->
        <div class="form-field" style="margin-top:.75rem;">
          <div class="form-label">น้ำเหลือง/สะเก็ด</div>
          <div class="check-group">
            <label class="check-inline"><input type="checkbox" id="p1-exu-fluid" value="มีน้ำเหลือง"> มีน้ำเหลือง</label>
            <label class="check-inline"><input type="checkbox" id="p1-exu-crust" value="มีสะเก็ด"> มีสะเก็ด</label>
            <label class="check-inline"><input type="checkbox" id="p1-exu-both" value="มีน้ำเหลืองและสะเก็ด"> มีทั้งน้ำเหลืองและสะเก็ด</label>
            <label class="check-inline"><input type="checkbox" id="p1-exu-none" value="ไม่มี"> ไม่มี</label>
            <label class="check-inline"><input type="checkbox" id="p1-exu-other-toggle" value="other"> อื่นๆ ระบุ…</label>
          </div>
          <input id="p1-exu-other" type="text" class="form-input" placeholder="ระบุลักษณะน้ำเหลือง/สะเก็ด" style="margin-top:.4rem; display:none;">
        </div>
      </div>

      <!-- ส่วนที่ 3 ระยะเวลาที่เริ่มมีอาการ -->
      <div class="section-box section-3">
        <div class="section-title">
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
            <option value="other">อื่นๆ ระบุ…</option>
          </select>
          <input id="p1-onset-other" type="text" class="form-input" placeholder="ระบุช่วงเวลา เช่น 2 เดือนหลังเริ่มยา" style="margin-top:.5rem; display:none;">
        </div>
      </div>

      <div style="margin-top:1.2rem;">
        <button id="p1-save" class="primary-btn" style="background:#7c3aed;color:white;border:0;padding:.55rem .9rem;border-radius:.5rem;cursor:pointer;">
          บันทึกหน้า 1
        </button>
        <span id="p1-status" class="save-status" style="margin-left:.5rem;"></span>
      </div>
    </div>
  `;

  // ====== ใส่ event ======
  const btn = document.getElementById("p1-save");
  if (btn) btn.addEventListener("click", savePage1);

  const ageSel = document.getElementById("p1-age-select");
  const ageOther = document.getElementById("p1-age-other");
  if (ageSel && ageOther) {
    ageSel.addEventListener("change", () => {
      ageOther.style.display = ageSel.value === "other" ? "block" : "none";
    });
  }

  const wtSel = document.getElementById("p1-weight-select");
  const wtOther = document.getElementById("p1-weight-other");
  if (wtSel && wtOther) {
    wtSel.addEventListener("change", () => {
      wtOther.style.display = wtSel.value === "other" ? "block" : "none";
    });
  }

  const undSel = document.getElementById("p1-underlying-select");
  const undOther = document.getElementById("p1-underlying-other");
  if (undSel && undOther) {
    undSel.addEventListener("change", () => {
      undOther.style.display = undSel.value === "other" ? "block" : "none";
    });
  }

  const onsetSel = document.getElementById("p1-onset");
  const onsetOther = document.getElementById("p1-onset-other");
  if (onsetSel && onsetOther) {
    onsetSel.addEventListener("change", () => {
      onsetOther.style.display = onsetSel.value === "other" ? "block" : "none";
    });
  }

  const exuOtherToggle = document.getElementById("p1-exu-other-toggle");
  const exuOtherInput = document.getElementById("p1-exu-other");
  if (exuOtherToggle && exuOtherInput) {
    exuOtherToggle.addEventListener("change", () => {
      exuOtherInput.style.display = exuOtherToggle.checked ? "block" : "none";
    });
  }

  const swYes = document.getElementById("p1-swelling-yes");
  const swNo = document.getElementById("p1-swelling-no");
  if (swYes && swNo) {
    swYes.addEventListener("change", e => { if (e.target.checked) swNo.checked = false; });
    swNo.addEventListener("change", e => { if (e.target.checked) swYes.checked = false; });
  }
}

// ================== save ==================
function savePage1(e) {
  if (e && e.preventDefault) e.preventDefault();

  const name = document.getElementById("p1-name").value;
  const hn = document.getElementById("p1-hn").value;

  // อายุ
  const ageSel = document.getElementById("p1-age-select");
  const ageOther = document.getElementById("p1-age-other");
  let age = "";
  if (ageSel) {
    age = ageSel.value === "other" ? (ageOther ? ageOther.value : "") : ageSel.value;
  }

  // น้ำหนัก
  const wtSel = document.getElementById("p1-weight-select");
  const wtOther = document.getElementById("p1-weight-other");
  let weight = "";
  if (wtSel) {
    weight = wtSel.value === "other" ? (wtOther ? wtOther.value : "") : wtSel.value;
  }

  // โรคประจำตัว
  const undSel = document.getElementById("p1-underlying-select");
  const undOther = document.getElementById("p1-underlying-other");
  let underlying = "";
  if (undSel) {
    underlying = undSel.value === "other" ? (undOther ? undOther.value : "") : undSel.value;
  }

  const allergyHistory = document.getElementById("p1-allergy-history").value;

  // รูปร่างผื่น
  const rashShapeValues = Array.from(
    document.querySelectorAll("input[name='p1-rashShape']:checked")
  ).map(el => el.value);
  const rashShapeOther = document.getElementById("p1-rashShape-other")?.value.trim();
  if (rashShapeOther) {
    rashShapeValues.push("อื่นๆ: " + rashShapeOther);
  }

  // สีผื่น
  const rashColorValues = Array.from(
    document.querySelectorAll("input[name='p1-rashColor']:checked")
  ).map(el => el.value);
  const rashColorOther = document.getElementById("p1-rashColor-other")?.value.trim();
  if (rashColorOther) {
    rashColorValues.push("อื่นๆ: " + rashColorOther);
  }

  // ตุ่มน้ำ
  const blisterValues = Array.from(
    document.querySelectorAll("input[name='p1-blister']:checked")
  ).map(el => el.value);

  // ผิวหนังหลุดลอก
  const peeling = document.getElementById("p1-peeling").value;

  // คัน
  const itchList = [
    document.getElementById("p1-itch-much")?.checked ? "คันมาก" : "",
    document.getElementById("p1-itch-little")?.checked ? "คันน้อย" : "",
    document.getElementById("p1-itch-none")?.checked ? "ไม่คัน" : "",
  ].filter(Boolean);

  // ปวด/แสบ/เจ็บ
  const painList = [
    document.getElementById("p1-pain-pain")?.checked ? "ปวด" : "",
    document.getElementById("p1-pain-burn")?.checked ? "แสบ" : "",
    document.getElementById("p1-pain-sore")?.checked ? "เจ็บ" : "",
  ].filter(Boolean);

  // บวม
  const swellingList = [
    document.getElementById("p1-swelling-yes")?.checked ? "บวม" : "",
    document.getElementById("p1-swelling-no")?.checked ? "ไม่บวม" : "",
  ].filter(Boolean);

  const location = document.getElementById("p1-location").value;
  const distribution = document.getElementById("p1-distribution").value;

  // น้ำเหลือง/สะเก็ด
  const exudateList = [
    document.getElementById("p1-exu-fluid")?.checked ? "มีน้ำเหลือง" : "",
    document.getElementById("p1-exu-crust")?.checked ? "มีสะเก็ด" : "",
    document.getElementById("p1-exu-both")?.checked ? "มีน้ำเหลืองและสะเก็ด" : "",
    document.getElementById("p1-exu-none")?.checked ? "ไม่มี" : "",
    document.getElementById("p1-exu-other-toggle")?.checked
      ? (document.getElementById("p1-exu-other")?.value || "อื่นๆ")
      : "",
  ].filter(Boolean);

  // ระยะเวลาที่เริ่มมีอาการ
  const onsetSel2 = document.getElementById("p1-onset");
  const onsetOther2 = document.getElementById("p1-onset-other");
  let onset = "";
  if (onsetSel2) {
    onset = onsetSel2.value === "other"
      ? (onsetOther2 ? onsetOther2.value : "")
      : onsetSel2.value;
  }

  // เก็บรวม
  if (!window.drugAllergyData) {
    window.drugAllergyData = {};
  }

  window.drugAllergyData.patient = {
    name,
    hn,
    age,
    weight,
    underlying,
    drugAllergyHistory: allergyHistory,
  };

  window.drugAllergyData.skin = {
    ...(window.drugAllergyData.skin || {}),
    rashShape: rashShapeValues,
    rashColor: rashColorValues,
    blister: blisterValues,
    peeling,
    itch: itchList,
    pain: painList,
    swelling: swellingList,
    location,
    distribution,
    exudate: exudateList,
    onset,
  };

  // เซฟ
  localStorage.setItem("drugAllergyData", JSON.stringify(window.drugAllergyData));

  // แจ้งผล
  const st = document.getElementById("p1-status");
  const btn = document.getElementById("p1-save");
  if (st) st.textContent = "บันทึกแล้ว ✔";
  if (btn) {
    btn.textContent = "บันทึกแล้ว ✔";
    btn.style.background = "#22c55e";
    btn.disabled = true;
  }

  console.log("★ หน้า 1 บันทึกแล้ว", window.drugAllergyData);

  setTimeout(() => {
    if (st) st.textContent = "";
    if (btn) {
      btn.textContent = "บันทึกหน้า 1";
      btn.style.background = "#7c3aed";
      btn.disabled = false;
    }
  }, 1500);
}

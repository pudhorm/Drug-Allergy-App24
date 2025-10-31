// page1.js
// หน้า 1 ระบบผิวหนัง (เวอร์ชันตัด "หัวเว็บซ้ำ" ออกแล้ว)
// สมมติว่ามี data.js ที่ประกาศ window.drugAllergyData อยู่ก่อนหน้านี้

document.addEventListener("DOMContentLoaded", function () {
  const root = document.getElementById("page1-root");
  if (!root) return;

  // ถ้ายังไม่มีตัวแปรกลาง ให้สร้างโครงให้ก่อน
  if (!window.drugAllergyData) {
    window.drugAllergyData = {
      patient: {
        name: "",
        hn: "",
        age: "",
        weight: "",
        underlying: "",
        drugAllergyHistory: "",
      },
      skin: {
        rashShape: [],
        rashColor: [],
        blisters: [],
        peeling: "",
        peelingOther: "",
        scaling: {
          flaky: false,
          dry: false,
          peeling: false,
          detail: "",
          other: "",
        },
        exudate: {
          serous: false,
          serousDetail: "",
          crust: false,
          crustDetail: "",
        },
        itch: {
          hasItch: "",
          severity: "",
        },
        pain: {
          pain: false,
          burn: false,
          sore: false,
        },
        swelling: {
          has: "",
          detail: "",
        },
        pustule: {
          has: "",
          size: "",
          count: "",
        },
        location: [],
        locationOther: "",
        distribution: "",
        distributionOther: "",
        onset: "",
        onsetOther: "",
        imageDataUrl: "",
      },
    };
  }

  const data = window.drugAllergyData;

  // ---------- วาดหน้า 1 (ไม่มีหัวซ้ำ) ----------
  root.innerHTML = `
    <div class="section-card">
      <h2 class="section-title">🧑‍⚕️ ส่วนที่ 1 ข้อมูลผู้ป่วย</h2>
      <div class="grid-3">
        <label class="field">
          <span>ชื่อ-สกุล</span>
          <input id="pt-name" type="text" />
        </label>
        <label class="field">
          <span>HN</span>
          <input id="pt-hn" type="text" />
        </label>
        <label class="field">
          <span>อายุ</span>
          <input id="pt-age" type="number" min="0" />
        </label>
        <label class="field">
          <span>น้ำหนัก (กก.)</span>
          <input id="pt-weight" type="number" min="0" step="0.1" />
        </label>
        <label class="field field-wide">
          <span>โรคประจำตัว</span>
          <input id="pt-underlying" type="text" />
        </label>
        <label class="field field-wide">
          <span>ประวัติการแพ้ยา (รายละเอียด)</span>
          <textarea id="pt-allergy-history" rows="2"></textarea>
        </label>
      </div>
    </div>

    <div class="section-card">
      <h2 class="section-title">🩹 ส่วนที่ 2 ประเมินอาการผิวหนัง</h2>

      <!-- 1.1 รูปร่างผื่น -->
      <div class="sub-block">
        <h3>1.1 รูปร่างผื่น</h3>
        <div class="chips" id="rash-shape-group">
          ${[
            "ตุ่มนูน",
            "ตุ่มแบนราบ",
            "ปื้นนูน",
            "วงกลมชั้นเดียว",
            "วงกลม 3 ชั้น",
            "วงรี",
            "ขอบหยัก",
            "ขอบเรียบ",
            "ขอบไม่ชัดเจน",
            "จุดเล็ก",
            "จ้ำเลือด",
          ]
            .map(
              (txt) => `
              <label class="chip">
                <input type="checkbox" value="${txt}" />
                <span>${txt}</span>
              </label>`
            )
            .join("")}
          <label class="chip chip-input">
            อื่นๆ
            <input id="rash-shape-other" type="text" placeholder="ระบุ" />
          </label>
        </div>
      </div>

      <!-- 1.2 สีผื่น -->
      <div class="sub-block">
        <h3>1.2 สีผื่น</h3>
        <div class="chips" id="rash-color-group">
          ${[
            "แดง",
            "แดงไหม้",
            "แดงซีด",
            "ซีด",
            "ใส",
            "ม่วง",
            "เหลือง",
            "มันเงา",
            "ดำ",
            "เทา",
          ]
            .map(
              (txt) => `
              <label class="chip chip-pink">
                <input type="checkbox" value="${txt}" />
                <span>${txt}</span>
              </label>`
            )
            .join("")}
          <label class="chip chip-input">
            อื่นๆ
            <input id="rash-color-other" type="text" placeholder="ระบุ" />
          </label>
        </div>
      </div>

      <!-- 1.3 ตุ่มน้ำ -->
      <div class="sub-block">
        <h3>1.3 ตุ่มน้ำ</h3>
        <div class="blister-buttons">
          <button type="button" data-size="small">+ เล็ก</button>
          <button type="button" data-size="medium">+ กลาง</button>
          <button type="button" data-size="large">+ ใหญ่</button>
        </div>
        <div id="blister-list" class="blister-list"></div>
      </div>

      <!-- 1.4 ผิวหลุดลอก -->
      <div class="sub-block">
        <h3>1.4 ผิวหลุดลอก</h3>
        <div class="chips" id="peeling-group">
          <label class="chip chip-orange">
            <input type="radio" name="peeling" value="ผิวหนังหลุดลอกตรงกลางผื่น" />
            <span>ผิวหนังหลุดลอกตรงกลางผื่น</span>
          </label>
          <label class="chip chip-orange">
            <input type="radio" name="peeling" value="ไม่เกิน 10% BSA" />
            <span>ไม่เกิน 10% BSA</span>
          </label>
          <label class="chip chip-orange">
            <input type="radio" name="peeling" value="เกิน 30% BSA" />
            <span>เกิน 30% BSA</span>
          </label>
          <label class="chip chip-input">
            อื่นๆ
            <input id="peeling-other" type="text" placeholder="ระบุ" />
          </label>
        </div>
      </div>

      <!-- 1.5 ขุย/แห้ง/ลอก -->
      <div class="sub-block">
        <h3>1.5 ขุย/แห้ง/ลอก</h3>
        <div class="chips line">
          <label class="chip chip-gray">
            <input id="scaling-flaky" type="checkbox" />
            <span>ขุย</span>
          </label>
          <label class="chip chip-gray">
            <input id="scaling-dry" type="checkbox" />
            <span>แห้ง</span>
          </label>
          <label class="chip chip-gray">
            <input id="scaling-peeling" type="checkbox" />
            <span>ลอก</span>
          </label>
          <input id="scaling-detail" class="inline-input" type="text" placeholder="รายละเอียด" />
          <input id="scaling-other" class="inline-input" type="text" placeholder="อื่นๆ (ระบุ)" />
        </div>
      </div>

      <!-- 1.6 น้ำเหลือง/สะเก็ด -->
      <div class="sub-block">
        <h3>1.6 น้ำเหลือง/สะเก็ด</h3>
        <div class="chips line">
          <label class="chip chip-yellow">
            <input id="exudate-serous" type="checkbox" />
            <span>น้ำเหลือง</span>
          </label>
          <input id="exudate-serous-detail" class="inline-input" type="text" placeholder="ปริมาณ/สี" />
          <label class="chip chip-yellow">
            <input id="exudate-crust" type="checkbox" />
            <span>สะเก็ด</span>
          </label>
          <input id="exudate-crust-detail" class="inline-input" type="text" placeholder="ปริมาณ/สี" />
        </div>
      </div>

      <!-- 1.7 คัน -->
      <div class="sub-block">
        <h3>1.7 คัน</h3>
        <div class="chips" id="itch-group">
          <label class="chip chip-violet">
            <input type="radio" name="itch" value="คัน" />
            <span>คัน</span>
          </label>
          <select id="itch-severity" class="inline-input" style="display:none;">
            <option value="">-- ระดับความคัน --</option>
            <option value="มาก">คันมาก</option>
            <option value="น้อย">คันน้อย</option>
          </select>
          <label class="chip chip-violet">
            <input type="radio" name="itch" value="ไม่คัน" />
            <span>ไม่คัน</span>
          </label>
        </div>
      </div>

      <!-- 1.8 ปวด/แสบ/เจ็บ -->
      <div class="sub-block">
        <h3>1.8 ปวด/แสบ/เจ็บ</h3>
        <div class="chips">
          <label class="chip chip-red">
            <input id="pain-pain" type="checkbox" />
            <span>ปวด</span>
          </label>
          <label class="chip chip-red">
            <input id="pain-burn" type="checkbox" />
            <span>แสบ</span>
          </label>
          <label class="chip chip-red">
            <input id="pain-sore" type="checkbox" />
            <span>เจ็บ</span>
          </label>
        </div>
      </div>

      <!-- 1.9 บวม -->
      <div class="sub-block">
        <h3>1.9 บวม</h3>
        <div class="chips" id="swelling-group">
          <label class="chip chip-green">
            <input type="radio" name="swelling" value="บวม" />
            <span>บวม</span>
          </label>
          <input id="swelling-detail" class="inline-input" type="text" placeholder="รายละเอียด" style="display:none;" />
          <label class="chip chip-green">
            <input type="radio" name="swelling" value="ไม่บวม" />
            <span>ไม่บวม</span>
          </label>
        </div>
      </div>

      <!-- 1.10 ตุ่มหนอง -->
      <div class="sub-block">
        <h3>1.10 ตุ่มหนอง</h3>
        <div class="chips" id="pustule-group">
          <label class="chip chip-lime">
            <input type="radio" name="pustule" value="พบ" />
            <span>พบ</span>
          </label>
          <input id="pustule-size" class="inline-input" type="text" placeholder="ขนาด" style="display:none;" />
          <input id="pustule-count" class="inline-input" type="text" placeholder="จำนวน" style="display:none;" />
          <label class="chip chip-lime">
            <input type="radio" name="pustule" value="ไม่พบ" />
            <span>ไม่พบ</span>
          </label>
        </div>
      </div>

      <!-- 1.11 ตำแหน่ง/การกระจาย -->
      <div class="sub-block">
        <h3>1.11 ตำแหน่งที่พบ / การกระจายตัว</h3>
        <div class="chips" id="location-group">
          ${[
            "ใบหน้า/ศีรษะ",
            "ลำตัว",
            "แขน",
            "ขา",
            "มือ/เท้า",
            "ลำคอ",
            "ข้อพับ",
            "เยื่อบุ",
          ]
            .map(
              (txt) => `
              <label class="chip chip-sky">
                <input type="checkbox" value="${txt}" />
                <span>${txt}</span>
              </label>`
            )
            .join("")}
          <label class="chip chip-input">
            อื่นๆ
            <input id="location-other" type="text" placeholder="ระบุ" />
          </label>
        </div>
        <div class="chips" id="distribution-group">
          <label class="chip chip-sky">
            <input type="radio" name="distribution" value="สมมาตร" />
            <span>สมมาตร</span>
          </label>
          <label class="chip chip-sky">
            <input type="radio" name="distribution" value="ไม่สมมาตร" />
            <span>ไม่สมมาตร</span>
          </label>
          <label class="chip chip-input">
            อื่นๆ
            <input id="distribution-other" type="text" placeholder="ระบุ" />
          </label>
        </div>
      </div>
    </div>

    <div class="section-card">
      <h2 class="section-title">⏱️ ส่วนที่ 3 ระยะเวลาการเกิดอาการ</h2>
      <select id="onset-select" class="wide-input">
        <option value="">-- โปรดเลือก --</option>
        <option value="ภายใน 1 ชั่วโมง">ภายใน 1 ชั่วโมง</option>
        <option value="1–6 ชั่วโมง">1–6 ชั่วโมง</option>
        <option value="6–24 ชั่วโมง">6–24 ชั่วโมง</option>
        <option value="1 สัปดาห์">1 สัปดาห์</option>
        <option value="2 สัปดาห์">2 สัปดาห์</option>
        <option value="3 สัปดาห์">3 สัปดาห์</option>
        <option value="4 สัปดาห์">4 สัปดาห์</option>
        <option value="5 สัปดาห์">5 สัปดาห์</option>
        <option value="6 สัปดาห์">6 สัปดาห์</option>
        <option value="อื่นๆ">อื่นๆ ระบุ…</option>
      </select>
      <input id="onset-other" class="wide-input" type="text" placeholder="ระบุระยะเวลา" style="display:none;" />
    </div>

    <div class="section-card">
      <h2 class="section-title">🖼️ ส่วนที่ 4 แนบรูปถ่ายอาการผู้ป่วย</h2>
      <label class="upload-box" id="img-drop">
        ลากรูปมาวาง หรือคลิกเพื่อเลือกไฟล์ (PNG/JPG/GIF)
        <input id="img-input" type="file" accept="image/*" hidden />
      </label>
      <img id="img-preview" class="img-preview" alt="" style="display:none;" />
    </div>
  `;

  // -------------------- BIND PATIENT --------------------
  const ptName = document.getElementById("pt-name");
  const ptHN = document.getElementById("pt-hn");
  const ptAge = document.getElementById("pt-age");
  const ptWeight = document.getElementById("pt-weight");
  const ptUnderlying = document.getElementById("pt-underlying");
  const ptAllergyHistory = document.getElementById("pt-allergy-history");

  // set initial
  if (ptName) ptName.value = data.patient.name || "";
  if (ptHN) ptHN.value = data.patient.hn || "";
  if (ptAge) ptAge.value = data.patient.age || "";
  if (ptWeight) ptWeight.value = data.patient.weight || "";
  if (ptUnderlying) ptUnderlying.value = data.patient.underlying || "";
  if (ptAllergyHistory) ptAllergyHistory.value = data.patient.drugAllergyHistory || "";

  // events
  ptName &&
    ptName.addEventListener("input", (e) => {
      data.patient.name = e.target.value;
    });
  ptHN &&
    ptHN.addEventListener("input", (e) => {
      data.patient.hn = e.target.value;
    });
  ptAge &&
    ptAge.addEventListener("input", (e) => {
      data.patient.age = e.target.value;
    });
  ptWeight &&
    ptWeight.addEventListener("input", (e) => {
      data.patient.weight = e.target.value;
    });
  ptUnderlying &&
    ptUnderlying.addEventListener("input", (e) => {
      data.patient.underlying = e.target.value;
    });
  ptAllergyHistory &&
    ptAllergyHistory.addEventListener("input", (e) => {
      data.patient.drugAllergyHistory = e.target.value;
    });

  // -------------------- RASH SHAPE --------------------
  const rashShapeGroup = document.getElementById("rash-shape-group");
  if (rashShapeGroup) {
    // set initial
    const checkboxes = rashShapeGroup.querySelectorAll("input[type=checkbox]");
    checkboxes.forEach((cb) => {
      cb.checked = (data.skin.rashShape || []).includes(cb.value);
      cb.addEventListener("change", () => {
        const current = new Set(data.skin.rashShape || []);
        if (cb.checked) current.add(cb.value);
        else current.delete(cb.value);
        data.skin.rashShape = Array.from(current);
      });
    });
    const other = document.getElementById("rash-shape-other");
    if (other) {
      other.value = data.skin.rashShapeOther || "";
      other.addEventListener("input", (e) => {
        data.skin.rashShapeOther = e.target.value;
      });
    }
  }

  // -------------------- RASH COLOR --------------------
  const rashColorGroup = document.getElementById("rash-color-group");
  if (rashColorGroup) {
    const checkboxes = rashColorGroup.querySelectorAll("input[type=checkbox]");
    checkboxes.forEach((cb) => {
      cb.checked = (data.skin.rashColor || []).includes(cb.value);
      cb.addEventListener("change", () => {
        const current = new Set(data.skin.rashColor || []);
        if (cb.checked) current.add(cb.value);
        else current.delete(cb.value);
        data.skin.rashColor = Array.from(current);
      });
    });
    const other = document.getElementById("rash-color-other");
    if (other) {
      other.value = data.skin.rashColorOther || "";
      other.addEventListener("input", (e) => {
        data.skin.rashColorOther = e.target.value;
      });
    }
  }

  // -------------------- BLISTERS --------------------
  const blisterList = document.getElementById("blister-list");
  const blisterButtons = root.querySelectorAll(".blister-buttons button");

  function renderBlisters() {
    if (!blisterList) return;
    blisterList.innerHTML = "";
    (data.skin.blisters || []).forEach((b, idx) => {
      const row = document.createElement("div");
      row.className = "blister-row";
      row.innerHTML = `
        <span class="blister-label">${b.size === "small" ? "เล็ก" : b.size === "medium" ? "กลาง" : "ใหญ่"}</span>
        <input type="number" min="0" class="blister-count-input" value="${b.count || ""}" />
        <button type="button" class="blister-del">ลบ</button>
      `;
      const countInput = row.querySelector("input");
      const delBtn = row.querySelector("button");
      countInput.addEventListener("input", (e) => {
        data.skin.blisters[idx].count = e.target.value;
      });
      delBtn.addEventListener("click", () => {
        data.skin.blisters.splice(idx, 1);
        renderBlisters();
      });
      blisterList.appendChild(row);
    });
  }

  blisterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const size = btn.getAttribute("data-size");
      data.skin.blisters = data.skin.blisters || [];
      data.skin.blisters.push({ size, count: "" });
      renderBlisters();
    });
  });

  // render ถ้ามีของเก่า
  if (!Array.isArray(data.skin.blisters)) {
    data.skin.blisters = [];
  }
  renderBlisters();

  // -------------------- PEELING --------------------
  const peelingGroup = document.getElementById("peeling-group");
  if (peelingGroup) {
    const radios = peelingGroup.querySelectorAll("input[type=radio][name=peeling]");
    radios.forEach((r) => {
      r.checked = data.skin.peeling === r.value;
      r.addEventListener("change", () => {
        if (r.checked) {
          data.skin.peeling = r.value;
        }
      });
    });
    const peelingOther = document.getElementById("peeling-other");
    if (peelingOther) {
      peelingOther.value = data.skin.peelingOther || "";
      peelingOther.addEventListener("input", (e) => {
        data.skin.peelingOther = e.target.value;
      });
    }
  }

  // -------------------- SCALING --------------------
  const scFlaky = document.getElementById("scaling-flaky");
  const scDry = document.getElementById("scaling-dry");
  const scPeel = document.getElementById("scaling-peeling");
  const scDetail = document.getElementById("scaling-detail");
  const scOther = document.getElementById("scaling-other");

  if (scFlaky) {
    scFlaky.checked = !!data.skin.scaling.flaky;
    scFlaky.addEventListener("change", (e) => {
      data.skin.scaling.flaky = e.target.checked;
    });
  }
  if (scDry) {
    scDry.checked = !!data.skin.scaling.dry;
    scDry.addEventListener("change", (e) => {
      data.skin.scaling.dry = e.target.checked;
    });
  }
  if (scPeel) {
    scPeel.checked = !!data.skin.scaling.peeling;
    scPeel.addEventListener("change", (e) => {
      data.skin.scaling.peeling = e.target.checked;
    });
  }
  if (scDetail) {
    scDetail.value = data.skin.scaling.detail || "";
    scDetail.addEventListener("input", (e) => {
      data.skin.scaling.detail = e.target.value;
    });
  }
  if (scOther) {
    scOther.value = data.skin.scaling.other || "";
    scOther.addEventListener("input", (e) => {
      data.skin.scaling.other = e.target.value;
    });
  }

  // -------------------- EXUDATE --------------------
  const exSerous = document.getElementById("exudate-serous");
  const exSerousDet = document.getElementById("exudate-serous-detail");
  const exCrust = document.getElementById("exudate-crust");
  const exCrustDet = document.getElementById("exudate-crust-detail");

  if (exSerous) {
    exSerous.checked = !!data.skin.exudate.serous;
    exSerous.addEventListener("change", (e) => {
      data.skin.exudate.serous = e.target.checked;
    });
  }
  if (exSerousDet) {
    exSerousDet.value = data.skin.exudate.serousDetail || "";
    exSerousDet.addEventListener("input", (e) => {
      data.skin.exudate.serousDetail = e.target.value;
    });
  }
  if (exCrust) {
    exCrust.checked = !!data.skin.exudate.crust;
    exCrust.addEventListener("change", (e) => {
      data.skin.exudate.crust = e.target.checked;
    });
  }
  if (exCrustDet) {
    exCrustDet.value = data.skin.exudate.crustDetail || "";
    exCrustDet.addEventListener("input", (e) => {
      data.skin.exudate.crustDetail = e.target.value;
    });
  }

  // -------------------- ITCH --------------------
  const itchGroup = document.getElementById("itch-group");
  const itchSeverity = document.getElementById("itch-severity");
  if (itchGroup) {
    const radios = itchGroup.querySelectorAll("input[type=radio][name=itch]");
    radios.forEach((r) => {
      r.checked = data.skin.itch.hasItch === r.value;
      r.addEventListener("change", () => {
        data.skin.itch.hasItch = r.value;
        if (r.value === "คัน") {
          itchSeverity.style.display = "inline-block";
        } else {
          itchSeverity.style.display = "none";
          data.skin.itch.severity = "";
          itchSeverity.value = "";
        }
      });
    });
  }
  if (itchSeverity) {
    if (data.skin.itch.hasItch === "คัน") {
      itchSeverity.style.display = "inline-block";
      itchSeverity.value = data.skin.itch.severity || "";
    }
    itchSeverity.addEventListener("change", (e) => {
      data.skin.itch.severity = e.target.value;
    });
  }

  // -------------------- PAIN --------------------
  const painPain = document.getElementById("pain-pain");
  const painBurn = document.getElementById("pain-burn");
  const painSore = document.getElementById("pain-sore");
  if (painPain) {
    painPain.checked = !!data.skin.pain.pain;
    painPain.addEventListener("change", (e) => {
      data.skin.pain.pain = e.target.checked;
    });
  }
  if (painBurn) {
    painBurn.checked = !!data.skin.pain.burn;
    painBurn.addEventListener("change", (e) => {
      data.skin.pain.burn = e.target.checked;
    });
  }
  if (painSore) {
    painSore.checked = !!data.skin.pain.sore;
    painSore.addEventListener("change", (e) => {
      data.skin.pain.sore = e.target.checked;
    });
  }

  // -------------------- SWELLING --------------------
  const swellingGroup = document.getElementById("swelling-group");
  const swellingDetail = document.getElementById("swelling-detail");
  if (swellingGroup) {
    const radios = swellingGroup.querySelectorAll("input[type=radio][name=swelling]");
    radios.forEach((r) => {
      r.checked = data.skin.swelling.has === r.value;
      r.addEventListener("change", () => {
        data.skin.swelling.has = r.value;
        if (r.value === "บวม") {
          swellingDetail.style.display = "inline-block";
          swellingDetail.value = data.skin.swelling.detail || "";
        } else {
          swellingDetail.style.display = "none";
          data.skin.swelling.detail = "";
          swellingDetail.value = "";
        }
      });
    });
  }
  if (swellingDetail && data.skin.swelling.has === "บวม") {
    swellingDetail.style.display = "inline-block";
    swellingDetail.value = data.skin.swelling.detail || "";
    swellingDetail.addEventListener("input", (e) => {
      data.skin.swelling.detail = e.target.value;
    });
  }

  // -------------------- PUSTULE --------------------
  const pustuleGroup = document.getElementById("pustule-group");
  const pustuleSize = document.getElementById("pustule-size");
  const pustuleCount = document.getElementById("pustule-count");
  if (pustuleGroup) {
    const radios = pustuleGroup.querySelectorAll("input[type=radio][name=pustule]");
    radios.forEach((r) => {
      r.checked = data.skin.pustule.has === r.value;
      r.addEventListener("change", () => {
        data.skin.pustule.has = r.value;
        if (r.value === "พบ") {
          pustuleSize.style.display = "inline-block";
          pustuleCount.style.display = "inline-block";
          pustuleSize.value = data.skin.pustule.size || "";
          pustuleCount.value = data.skin.pustule.count || "";
        } else {
          pustuleSize.style.display = "none";
          pustuleCount.style.display = "none";
          data.skin.pustule.size = "";
          data.skin.pustule.count = "";
        }
      });
    });
  }
  if (pustuleSize) {
    pustuleSize.addEventListener("input", (e) => {
      data.skin.pustule.size = e.target.value;
    });
  }
  if (pustuleCount) {
    pustuleCount.addEventListener("input", (e) => {
      data.skin.pustule.count = e.target.value;
    });
  }

  // -------------------- LOCATION / DISTRIBUTION --------------------
  const locationGroup = document.getElementById("location-group");
  if (locationGroup) {
    const boxes = locationGroup.querySelectorAll("input[type=checkbox]");
    boxes.forEach((cb) => {
      cb.checked = (data.skin.location || []).includes(cb.value);
      cb.addEventListener("change", () => {
        const set = new Set(data.skin.location || []);
        if (cb.checked) set.add(cb.value);
        else set.delete(cb.value);
        data.skin.location = Array.from(set);
      });
    });

    const locOther = document.getElementById("location-other");
    if (locOther) {
      locOther.value = data.skin.locationOther || "";
      locOther.addEventListener("input", (e) => {
        data.skin.locationOther = e.target.value;
      });
    }
  }

  const distributionGroup = document.getElementById("distribution-group");
  if (distributionGroup) {
    const radios = distributionGroup.querySelectorAll("input[type=radio][name=distribution]");
    radios.forEach((r) => {
      r.checked = data.skin.distribution === r.value;
      r.addEventListener("change", () => {
        data.skin.distribution = r.value;
      });
    });
    const distOther = document.getElementById("distribution-other");
    if (distOther) {
      distOther.value = data.skin.distributionOther || "";
      distOther.addEventListener("input", (e) => {
        data.skin.distributionOther = e.target.value;
      });
    }
  }

  // -------------------- ONSET --------------------
  const onsetSelect = document.getElementById("onset-select");
  const onsetOther = document.getElementById("onset-other");
  if (onsetSelect) {
    onsetSelect.value = data.skin.onset || "";
    if (data.skin.onset === "อื่นๆ") {
      onsetOther.style.display = "block";
      onsetOther.value = data.skin.onsetOther || "";
    }
    onsetSelect.addEventListener("change", (e) => {
      data.skin.onset = e.target.value;
      if (e.target.value === "อื่นๆ") {
        onsetOther.style.display = "block";
      } else {
        onsetOther.style.display = "none";
        data.skin.onsetOther = "";
        onsetOther.value = "";
      }
    });
  }
  if (onsetOther) {
    onsetOther.addEventListener("input", (e) => {
      data.skin.onsetOther = e.target.value;
    });
  }

  // -------------------- IMAGE UPLOAD --------------------
  const imgDrop = document.getElementById("img-drop");
  const imgInput = document.getElementById("img-input");
  const imgPreview = document.getElementById("img-preview");

  function showImageFromDataUrl(url) {
    if (!imgPreview) return;
    if (url) {
      imgPreview.src = url;
      imgPreview.style.display = "block";
    } else {
      imgPreview.style.display = "none";
    }
  }

  // ถ้ามีรูปเดิม
  if (data.skin.imageDataUrl) {
    showImageFromDataUrl(data.skin.imageDataUrl);
  }

  function handleFile(file) {
    if (!file) return;
    if (!/image\/(png|jpe?g|gif)/i.test(file.type)) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      const url = ev.target.result;
      data.skin.imageDataUrl = url;
      showImageFromDataUrl(url);
    };
    reader.readAsDataURL(file);
  }

  if (imgDrop) {
    imgDrop.addEventListener("click", () => {
      imgInput && imgInput.click();
    });
    imgDrop.addEventListener("dragover", (e) => {
      e.preventDefault();
      imgDrop.classList.add("dragging");
    });
    imgDrop.addEventListener("dragleave", () => {
      imgDrop.classList.remove("dragging");
    });
    imgDrop.addEventListener("drop", (e) => {
      e.preventDefault();
      imgDrop.classList.remove("dragging");
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      handleFile(file);
    });
  }
  if (imgInput) {
    imgInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      handleFile(file);
    });
  }
});

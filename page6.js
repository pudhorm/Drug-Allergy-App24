// page6.js
(function () {
  if (!window.drugAllergyData) {
    window.drugAllergyData = {};
  }

  // ====================== ตัวช่วยดูว่าครบ 3 หน้าไหม (ดูเฉพาะ __saved เท่านั้น) ======================
  function checkCorePagesReady() {
    const d = window.drugAllergyData || {};
    const p1 = !!(d.page1 && d.page1.__saved === true);
    const p2 = !!(d.page2 && d.page2.__saved === true);
    const p3 = !!(d.page3 && d.page3.__saved === true);

    const missing = [];
    if (!p1) missing.push("หน้า 1 ผิวหนัง");
    if (!p2) missing.push("หน้า 2 ระบบอื่นๆ");
    if (!p3) missing.push("หน้า 3 Lab");

    return {
      ready: p1 && p2 && p3,
      missing,
    };
  }

  // ====================== ส่วนที่ 2 (placeholder) ======================
  function renderSection2(drugNames) {
    return `
      <div class="p6-block sec2">
        <div class="p6-head">
          <div class="p6-emoji">💊</div>
          <div class="p6-head-title">ส่วนที่ 2: ยาที่มีรายงานการเกิดการแพ้ยาดังกล่าว</div>
        </div>
        <div class="p6-subcard">
          <div class="p6-sub-title">ยาที่ผู้ป่วยได้รับ:</div>
          <p class="p6-muted">
            ${drugNames && drugNames.length ? drugNames.join(", ") : "ยังไม่มีข้อมูลยา (รอข้อมูลจากหน้า 4 / 5 หรือระบบ timeline)"}
          </p>
        </div>
        <div class="p6-subcard">
          <div class="p6-sub-title">รายงานการแพ้:</div>
          <p class="p6-muted">รอข้อมูลและการวิเคราะห์ภายหลังกำหนดกฎการประเมิน…</p>
        </div>
      </div>
    `;
  }

  // ====================== ส่วนที่ 3 (เหลือเฉพาะการรักษาเฉพาะ) ======================
  function renderSection3() {
    return `
      <div class="p6-block sec3">
        <div class="p6-head">
          <div class="p6-emoji">💉</div>
          <div class="p6-head-title">ส่วนที่ 3: แนวทางการรักษาเฉพาะตามชนิดการแพ้</div>
        </div>
        <div class="p6-subcard">
          <div class="p6-sub-title">การรักษาเฉพาะ:</div>
          <p class="p6-muted">
            ส่วนนี้จะดึงจาก “สมองการแพ้ยา” ที่เราจะใส่ทีหลัง โดยอิงชนิดการแพ้ที่ได้จากส่วนที่ 1
            เช่น ถ้าเป็น Immediate/Type I → ให้ Antihistamine, ถ้ารุนแรง → Epinephrine, ถ้าเป็น DRESS → systemic steroid ฯลฯ
          </p>
        </div>
      </div>
    `;
  }

  // ====================== ส่วนที่ 4 (Naranjo + Timeline) ======================
  function getNaranjoFromPage4() {
    const d = window.drugAllergyData || {};
    const p4 = d.page4 || {};
    return p4.naranjo || null;
  }

  function getTimelineFromPage5() {
    const d = window.drugAllergyData || {};
    const p5 = d.page5 || {};
    return p5.timeline || null;
  }

  function renderSection4() {
    const naranjo = getNaranjoFromPage4();
    const timeline = getTimelineFromPage5();

    return `
      <div class="p6-block sec4">
        <div class="p6-head">
          <div class="p6-emoji">📊</div>
          <div class="p6-head-title">ส่วนที่ 4: ผลการประเมิน Naranjo และ Timeline</div>
        </div>

        <div class="p6-subcard">
          <div class="p6-sub-title">ผลประเมิน Naranjo Adverse Drug Reaction Probability Scale</div>
          ${
            naranjo
              ? `
                <div class="p6-naranjo-item">
                  <div class="p6-naranjo-name">ยา 1</div>
                  <div class="p6-naranjo-score">${naranjo.total ?? 0}</div>
                </div>
                <p class="p6-muted">สรุป: ${naranjo.interpretation || "ยังไม่ได้สรุป"}</p>
              `
              : `<div class="p6-empty">ยังไม่มีข้อมูล Naranjo (กรุณากดบันทึกในหน้า 4)</div>`
          }
        </div>

        <div class="p6-subcard">
          <div class="p6-sub-title">Timeline แสดงความสัมพันธ์ระหว่างยาและอาการ</div>
          ${
            timeline
              ? `<div class="p6-timeline-box"><pre style="white-space:pre-wrap;margin:0;font-size:.8rem;">${JSON.stringify(
                  timeline,
                  null,
                  2
                )}</pre></div>`
              : `<div class="p6-empty">ไม่มีข้อมูล Timeline (กรุณากรอกข้อมูลในหน้า 5 แล้วกดบันทึก)</div>`
          }
        </div>
      </div>
    `;
  }

  // ====================== เรนเดอร์หลักของหน้า 6 ======================
  function renderPage6() {
    const root = document.getElementById("p6Root");
    if (!root) return;

    const status = checkCorePagesReady();

    // ส่วนที่ 1 ถ้ายังไม่ครบ 3 หน้า
    let section1HTML = "";
    if (!status.ready) {
      section1HTML = `
        <div class="p6-block sec1">
          <div class="p6-head">
            <div class="p6-emoji">🤖</div>
            <div class="p6-head-title">ส่วนที่ 1: สรุปผลการวิเคราะห์อัตโนมัติ</div>
          </div>
          <p class="p6-muted">
            ต้องกดปุ่ม <strong>บันทึก</strong> ให้ครบทั้ง 3 หน้า (หน้า 1 ผิวหนัง, หน้า 2 ระบบอื่นๆ, หน้า 3 Lab) ก่อน
            ระบบจึงจะเริ่มประเมินชนิดการแพ้ยาให้ได้
          </p>
          <div class="p6-empty">
            ยังขาดข้อมูลจาก: ${status.missing.join(", ")}
          </div>
          <div class="p6-subcard" style="margin-top:.6rem;">
            <div class="p6-sub-title">ข้อมูลที่ใช้ประเมิน</div>
            <p class="p6-muted">
              • หน้า 1 ผิวหนัง<br>
              • หน้า 2 ระบบอื่นๆ<br>
              • หน้า 3 Lab
            </p>
          </div>
        </div>
      `;
    } else {
      // ครบ 3 หน้าแล้ว → แสดงโครงการประเมินตามที่สั่ง
      section1HTML = `
        <div class="p6-block sec1">
          <div class="p6-head">
            <div class="p6-emoji">🤖</div>
            <div class="p6-head-title">ส่วนที่ 1: สรุปผลการวิเคราะห์อัตโนมัติ</div>
          </div>

          <!-- 1.1 Rawlins & Thompson -->
          <div class="p6-subcard">
            <div class="p6-sub-title">1.1 Pharmacological effects (Rawlins &amp; Thompson)</div>
            <p class="p6-muted">
              ระบบจะพิจารณาจากข้อมูลหน้า 1–3 แล้วจัดเข้ากลุ่ม Type A–F โดยอัตโนมัติภายหลังจากที่เรากำหนด “สมองประเมิน” แล้ว
            </p>
            <ul class="p6-muted" style="margin-top:.35rem;">
              <li>Type A – Augmented</li>
              <li>Type B – Bizarre</li>
              <li>Type C – Chronic</li>
              <li>Type D – Delayed</li>
              <li>Type E – End of use</li>
              <li>Type F – Failure</li>
            </ul>
          </div>

          <!-- 1.2 Immunologic / Non-immunologic -->
          <div class="p6-subcard">
            <div class="p6-sub-title">1.2 Immunologic type &amp; Non-immunologic type</div>
            <p class="p6-muted">
              ขั้นแรกระบบจะดูว่าลักษณะอาการสอดคล้องกับการแพ้ที่ผ่านระบบภูมิคุ้มกันหรือไม่
              ถ้าใช่ → จะจัดเป็น Immunologic type แล้วแตกย่อยตาม Gell &amp; Coombs 4 ชนิด
            </p>
            <ul class="p6-muted" style="margin-top:.35rem;">
              <li>Type I — IgE-mediated, immediate</li>
              <li>Type II — Cytotoxic</li>
              <li>Type III — Immune-complex</li>
              <li>Type IV — T-cell / Delayed-type</li>
            </ul>
            <p class="p6-muted" style="margin-top:.35rem;">
              ตอนนี้ยังเป็นโครงแสดงผล — เดี๋ยวตอนเรา “ใส่สมอง” ให้กดบันทึกหน้า 1–3 แล้วระบบจะเติมผลจริงตรงนี้ให้อัตโนมัติ
            </p>
          </div>

          <!-- ข้อมูลที่ใช้ประเมิน -->
          <div class="p6-subcard">
            <div class="p6-sub-title">ข้อมูลที่ใช้ประเมิน</div>
            <p class="p6-muted">
              ✓ หน้า 1 ผิวหนัง &nbsp; ✓ หน้า 2 ระบบอื่นๆ &nbsp; ✓ หน้า 3 Lab
            </p>
          </div>
        </div>
      `;
    }

    // ดึงชื่อยาพอให้ส่วนที่ 2 มีอะไรโชว์ (ตอนนี้ยังเป็นตัวอย่าง)
    const drugNames =
      (window.drugAllergyData.page4 && window.drugAllergyData.page4.drugs) ||
      (window.drugAllergyData.page5 && window.drugAllergyData.page5.drugs) ||
      [];

    root.innerHTML = `
      <div class="p6-wrapper">
        ${section1HTML}
        ${renderSection2(drugNames)}
        ${renderSection3()}
        ${renderSection4()}
        <div class="p6-footer-btns">
          <button class="p6-btn p6-btn-print" onclick="window.print()">🖨️ Print / PDF</button>
          <button class="p6-btn p6-btn-next" onclick="alert('ยังไม่ได้สร้างหน้า 7 — เดี๋ยวเราต่อให้ตอนใส่สมอง')">➡️ บันทึกข้อมูลและไปหน้า 7</button>
        </div>
      </div>
    `;
  }

  window.renderPage6 = renderPage6;
})();

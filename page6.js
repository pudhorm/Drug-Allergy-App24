// page6.js
(function () {
  // ให้มีที่เก็บในตัวแปรกลางเหมือนหน้าอื่น
  if (!window.drugAllergyData) window.drugAllergyData = {};
  if (!window.drugAllergyData.page6) window.drugAllergyData.page6 = {};

  // ===== 1) ตัวช่วยอ่านข้อมูลจากหน้า 1–5 แบบทน ๆ =====

  // อ่าน Naranjo จากหน้า 4 (ชื่ออาจจะไม่ตรงทุกโปรเจ็กต์ แต่พยายามรองรับหลายแบบ)
  function getNaranjoFromPage4() {
    const p4 = window.drugAllergyData.page4;
    if (!p4) return [];

    const out = [];

    // รูปแบบที่ 1: { drugs: [ { name, totalScore, interpretation }, ... ] }
    if (Array.isArray(p4.drugs)) {
      p4.drugs.forEach((d, idx) => {
        out.push({
          name: d.name || `ยา ${idx + 1}`,
          score: typeof d.totalScore === "number" ? d.totalScore : (d.score || 0),
          level: d.interpretation || d.level || "",
        });
      });
      return out;
    }

    // รูปแบบที่ 2: เก็บเป็นตัวเดียว
    if (typeof p4.totalScore === "number") {
      out.push({
        name: p4.drugName || "ยา 1",
        score: p4.totalScore,
        level: p4.interpretation || "",
      });
      return out;
    }

    // รูปแบบอื่น ๆ → แปลงเป็นแถวเดียว
    out.push({
      name: "ผล Naranjo",
      score: 0,
      level: "ยังไม่พบรูปแบบที่รองรับ",
    });
    return out;
  }

  // อ่าน timeline จากหน้า 5
  function getTimelineFromPage5() {
    const p5 = window.drugAllergyData.page5;
    if (!p5) return { drugs: [], adrs: [] };

    // พยายามรองรับชื่อที่เจอบ่อย
    const drugs = p5.drugs || p5.drugLines || [];
    const adrs = p5.adrs || p5.adrLines || [];

    return { drugs, adrs };
  }

  // ตรวจว่าหน้า 1–3 มีข้อมูลพอให้ “สมอง” ทำงานยัง
  function checkDataReady() {
    const p1 = window.drugAllergyData.page1 || window.drugAllergyData.skin || {};
    const p2 = window.drugAllergyData.page2 || {};
    const p3 = window.drugAllergyData.page3 || {};

    const hasP1 = Object.keys(p1).length > 0;
    const hasP2 = Object.keys(p2).length > 0;
    const hasP3 = Object.keys(p3).length > 0;

    return {
      hasP1,
      hasP2,
      hasP3,
      allReady: hasP1 && hasP2 && hasP3,
    };
  }

  // ตอนนี้เรายัง "ไม่ใส่สมอง" → ให้คืนค่าหลอก ๆ เอาไว้ก่อน
  function fakeAutoAssessment() {
    const ready = checkDataReady();

    if (!ready.hasP1 && !ready.hasP2 && !ready.hasP3) {
      return {
        adrType: "ยังไม่พบข้อมูลจากหน้า 1–3",
        adrNote: "กรุณากรอกข้อมูลหน้า 1–3 แล้วกดบันทึก (แต่ไม่จำเป็นต้องกรอกครบทุกช่อง)",
        mechanism: "รอข้อมูล",
        mechanismNote: "ต้องมีข้อมูลผิวหนัง/ระบบอื่นๆ/ผลตรวจอย่างน้อย 1 หน้า",
        usedPages: [],
      };
    }

    return {
      adrType: "รอสมองประเมินจากข้อมูลที่มี",
      adrNote:
        "ระบบพบว่ามีข้อมูลจากหน้า " +
        [
          ready.hasP1 ? "1" : null,
          ready.hasP2 ? "2" : null,
          ready.hasP3 ? "3" : null,
        ]
          .filter(Boolean)
          .join(", ") +
        " แล้ว สามารถใส่กฎวินิจฉัยได้เลยในภายหลัง",
      mechanism: "รอใส่กฎ Immunologic / Non-immunologic",
      mechanismNote:
        "ให้ผูกเกณฑ์ไว้ที่ฟังก์ชัน fakeAutoAssessment() ภายหลังได้เลย",
      usedPages: [
        ready.hasP1 ? "หน้า 1 ผิวหนัง" : null,
        ready.hasP2 ? "หน้า 2 ระบบอื่นๆ" : null,
        ready.hasP3 ? "หน้า 3 Lab" : null,
      ].filter(Boolean),
    };
  }

  // ===== 2) เรนเดอร์จริง =====
  function renderPage6() {
    const root = document.getElementById("p6Root");
    if (!root) return;

    const auto = fakeAutoAssessment();
    const naranjoList = getNaranjoFromPage4();
    const timeline = getTimelineFromPage5();

    root.innerHTML = `
      <div class="p6-wrapper">

        <!-- ส่วนที่ 1 -->
        <div class="p6-block sec1">
          <div class="p6-head">
            <div class="p6-emoji">🤖</div>
            <div class="p6-head-title">ส่วนที่ 1: สรุปผลการวิเคราะห์อัตโนมัติ</div>
          </div>

          <div class="p6-subcard">
            <div class="p6-sub-title">1. ประเภทแพ้ยา (Type of ADR)</div>
            <div>${auto.adrType}</div>
            <div class="p6-muted" style="margin-top:.35rem;">${auto.adrNote}</div>
          </div>

          <div class="p6-subcard">
            <div class="p6-sub-title">Mechanism:</div>
            <div>${auto.mechanism}</div>
            <div class="p6-muted" style="margin-top:.35rem;">${auto.mechanismNote}</div>
          </div>

          <div class="p6-subcard">
            <div class="p6-sub-title">ข้อมูลที่ใช้ประเมิน</div>
            ${
              auto.usedPages.length
                ? auto.usedPages
                    .map((t) => `<span class="p6-pill">✔ ${t}</span>`)
                    .join(" ")
                : `<div class="p6-muted">ยังไม่มีข้อมูลจากหน้า 1–3</div>`
            }
          </div>
        </div>

        <!-- ส่วนที่ 2 -->
        <div class="p6-block sec2">
          <div class="p6-head">
            <div class="p6-emoji">💊</div>
            <div class="p6-head-title">ส่วนที่ 2: ยาที่มีรายงานการเกิดการแพ้ดังกล่าว</div>
          </div>
          <div class="p6-subcard">
            <div class="p6-sub-title">ยาที่ผู้ป่วยได้รับ:</div>
            <div class="p6-muted">ยังไม่เชื่อมสมองระบุชื่อยา → ให้ไปเพิ่ม logic ในหน้า 6 ภายหลัง</div>
          </div>
          <div class="p6-subcard">
            <div class="p6-sub-title">รายงานการแพ้:</div>
            <div class="p6-muted">รอผูกกับฐานความรู้ / guideline / ตารางยา ที่จะใส่ทีหลัง</div>
          </div>
        </div>

        <!-- ส่วนที่ 3 -->
        <div class="p6-block sec3">
          <div class="p6-head">
            <div class="p6-emoji">💉</div>
            <div class="p6-head-title">ส่วนที่ 3: แนวทางการรักษา (เฉพาะตามชนิดการแพ้)</div>
          </div>
          <div class="p6-subcard">
            <div class="p6-sub-title">การรักษาเฉพาะตามชนิดการแพ้:</div>
            <div class="p6-muted">
              ส่วนนี้จะดึงจาก “สมอง” เดียวกันกับส่วนที่ 1 (เช่น ถ้าวินิจฉัยว่าเป็น DRESS ก็แสดง protocol ของ DRESS ถ้าเป็น SJS/TEN ก็แสดงของ SJS/TEN)
            </div>
          </div>
        </div>

        <!-- ส่วนที่ 4 -->
        <div class="p6-block sec4">
          <div class="p6-head">
            <div class="p6-emoji">📈</div>
            <div class="p6-head-title">ส่วนที่ 4: ผลการประเมิน Naranjo และ Timeline</div>
          </div>

          <div class="p6-subcard">
            <div class="p6-sub-title">ผลการประเมิน Naranjo Adverse Drug Reaction Probability Scale</div>
            ${
              naranjoList.length
                ? naranjoList
                    .map((n) => {
                      const levelText = n.level
                        ? `<div class="p6-muted" style="margin-top:.25rem;">${n.level}</div>`
                        : "";
                      return `
                        <div class="p6-naranjo-item">
                          <div>
                            <div class="p6-naranjo-name">${n.name}</div>
                            ${levelText}
                          </div>
                          <div class="p6-naranjo-score">${n.score ?? 0}</div>
                        </div>
                      `;
                    })
                    .join("")
                : `<div class="p6-empty">ยังไม่มีข้อมูล Naranjo (กรุณากรอกในหน้า 4 แล้วกดบันทึก)</div>`
            }
          </div>

          <div class="p6-subcard">
            <div class="p6-sub-title">Timeline แสดงความสัมพันธ์ระหว่างยาและอาการ</div>
            <div class="p6-timeline-box">
              ${
                (timeline.drugs && timeline.drugs.length) ||
                (timeline.adrs && timeline.adrs.length)
                  ? `
                    ${timeline.drugs && timeline.drugs.length ? `<div style="font-weight:600;color:#0f766e;margin-bottom:.3rem;">ยา</div>` : ""}
                    ${
                      (timeline.drugs || [])
                        .map(
                          (d, i) =>
                            `<div class="p6-pill">💊 ${d.name || d.drugName || ("ยา " + (i + 1))} (${d.startDate || d.start || "ไม่ทราบวัน"} → ${d.endDate || d.end || "ยังไม่ระบุ"})</div>`
                        )
                        .join(" ")
                    }
                    ${timeline.adrs && timeline.adrs.length ? `<div style="font-weight:600;color:#be123c;margin:.5rem 0 .3rem;">ADR</div>` : ""}
                    ${
                      (timeline.adrs || [])
                        .map(
                          (a, i) =>
                            `<div class="p6-pill" style="background:rgba(254,226,226,.8);border-color:rgba(248,113,113,.3);">🧪 ${a.name || a.reactionName || ("ADR " + (i + 1))} (${a.date || a.onsetDate || "ไม่ทราบวัน"})</div>`
                        )
                        .join(" ")
                    }
                  `
                  : `<div class="p6-empty">ยังไม่มีข้อมูล Timeline (กรุณากรอกในหน้า 5 แล้วกดบันทึก)</div>`
              }
            </div>
          </div>
        </div>

        <!-- ปุ่มล่าง -->
        <div class="p6-footer-btns">
          <button class="p6-btn p6-btn-print" id="p6PrintBtn">🖨️ พิมพ์ / บันทึก PDF</button>
          <button class="p6-btn p6-btn-next" id="p6NextBtn">💾 บันทึกข้อมูลและไปหน้า 7</button>
        </div>

      </div>
    `;

    // ผูกปุ่มพิมพ์ → ใช้ window.print ธรรมดา (browser จะให้บันทึก PDF เอง)
    const printBtn = document.getElementById("p6PrintBtn");
    if (printBtn) {
      printBtn.addEventListener("click", function () {
        window.print();
      });
    }

    // ผูกปุ่มไปหน้า 7 (ถ้ายังไม่มีหน้า 7 ให้แจ้งเฉยๆ)
    const nextBtn = document.getElementById("p6NextBtn");
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        // เก็บข้อมูลหน้าที่ 6 ไว้ในตัวแปรกลาง (ตอนนี้ยังไม่มี input → เก็บสเตตัสว่า render แล้วเฉยๆ)
        window.drugAllergyData.page6.lastSavedAt = new Date().toISOString();

        const hasP7 = document.getElementById("page7");
        if (hasP7 && typeof window.showPage === "function") {
          window.showPage("page7");
        } else {
          alert("ยังไม่ได้สร้างหน้า 7 (ประวัติผู้ป่วย) — แต่ข้อมูลหน้า 6 ถูกบันทึกไว้ในตัวแปรกลางแล้ว");
        }
      });
    }
  }

  // export ฟังก์ชันให้ index.html เรียกได้
  window.renderPage6 = renderPage6;
})();

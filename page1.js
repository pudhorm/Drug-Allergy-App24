// ===================== page1.js (REPLACE WHOLE FILE) =====================
(function () {
  if (!window.drugAllergyData) window.drugAllergyData = {};
  if (!window.drugAllergyData.page1) window.drugAllergyData.page1 = {};

  // ===== ตัวเลือกหลักของหน้า 1 =====
  const SHAPES = [
    "ตุ่มนูน",
    "ปื้นนูน",
    "ปื้นแดง",
    "วงกลม",
    "วงรี",
    "วงกลม 3 ชั้น (เป้าธนู)",
    "วงกลมคล้ายเป้าธนู (ไม่ครบ 3 ชั้น)"
  ];
  const COLORS = [
    "แดง",
    "แดงซีด",
    "ซีด",
    "สีผิวปกติ",
    "ดำ/คล้ำ",
    "เทา",
    "เหลือง",
    "ใส",
    "แดงไหม้",
    "ม่วง/คล้ำ"
  ];
  const BORDERS = [
    "ขอบหยัก",
    "ขอบเรียบ",
    "ขอบเขตชัดเจน",
    "ขอบไม่ชัดเจน",
    "ขอบวงนูนแดงด้านในเรียบ"
  ];
  const BLISTERS = [
    "ตุ่มน้ำขนาดเล็ก",
    "ตุ่มน้ำขนาดกลาง",
    "ตุ่มน้ำขนาดใหญ่",
    "พอง"
  ];
  const LOCATIONS = [
    "ลำตัว","แขน","ขา","มือ","เท้า","หน้า","หลัง","ลำคอ",
    "ริมฝีปาก","รอบดวงตา","ลิ้น","อวัยวะเพศ","ศีรษะ","ทั่วร่างกาย",
    "ช่องปาก","จมูก","ทวาร","ตำแหน่งเดิมกับครั้งก่อน"
  ];
  const ONSET_OPTIONS = [
    "ภายใน 1 ชั่วโมง",
    "ภายใน 1-6 ชั่วโมง",
    "ภายใน 6-24 ชั่วโมง",
    "ภายใน 1 สัปดาห์",
    "ภายใน 2 สัปดาห์",
    "ภายใน 3 สัปดาห์",
    "ภายใน 4 สัปดาห์",
    "ภายใน 5 สัปดาห์",
    "ภายใน 6 สัปดาห์"
  ];

  function renderPage1() {
    const root = document.getElementById("page1");
    if (!root) return;

    const d = window.drugAllergyData.page1 || {};

    root.innerHTML = `
      <div class="p1-wrap" style="background:radial-gradient(circle at top,#f5f3ff 0%,#faf5ff 32%,#fff 92%);border:1px solid rgba(139,92,246,.18);border-radius:1.25rem;padding:1rem 1rem 1.2rem;box-shadow:0 12px 28px rgba(139,92,246,.12);">

        <!-- ส่วนที่ 1: ข้อมูลผื่น -->
        <section style="background:rgba(250,245,255,.92);border:1px solid rgba(139,92,246,.25);border-radius:1rem;padding:1rem;">
          <h2 style="display:flex;align-items:center;gap:.5rem;margin:0 0 .8rem 0;font-weight:800;color:#6d28d9">
            <span>🩹</span><span>ส่วนที่ 2 ประเมินอาการผิวหนัง</span>
          </h2>

          <!-- รูปร่าง -->
          <div style="margin:.6rem 0 .4rem;font-weight:700;">1.1 รูปร่าง</div>
          <div class="grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.5rem;">
            ${SHAPES.map((label, i) => {
              const checked = (d.rashShapes||[]).includes(label) ? "checked" : "";
              return `
                <label style="display:flex;gap:.5rem;align-items:flex-start;background:#fff;border:1px solid rgba(139,92,246,.2);border-radius:.7rem;padding:.45rem .6rem;">
                  <input type="checkbox" class="p1-shape" data-val="${label}" ${checked}>
                  <span>${label}</span>
                </label>
              `;
            }).join("")}
          </div>

          <!-- สี -->
          <div style="margin:1rem 0 .4rem;font-weight:700;">1.2 สีผื่น</div>
          <div class="grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.5rem;">
            ${COLORS.map((label) => {
              const checked = (d.rashColors||[]).includes(label) ? "checked" : "";
              return `
                <label style="display:flex;gap:.5rem;align-items:flex-start;background:#fff;border:1px solid rgba(139,92,246,.2);border-radius:.7rem;padding:.45rem .6rem;">
                  <input type="checkbox" class="p1-color" data-val="${label}" ${checked}>
                  <span>${label}</span>
                </label>
              `;
            }).join("")}
          </div>

          <!-- ขอบ -->
          <div style="margin:1rem 0 .4rem;font-weight:700;">1.3 ขอบผื่น</div>
          <div class="grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.5rem;">
            ${BORDERS.map((label) => {
              const checked = (d.rashBorders||[]).includes(label) ? "checked" : "";
              return `
                <label style="display:flex;gap:.5rem;align-items:flex-start;background:#fff;border:1px solid rgba(139,92,246,.2);border-radius:.7rem;padding:.45rem .6rem;">
                  <input type="checkbox" class="p1-border" data-val="${label}" ${checked}>
                  <span>${label}</span>
                </label>
              `;
            }).join("")}
          </div>

          <!-- ตุ่มน้ำ/พอง + ตุ่มหนอง -->
          <div style="margin:1rem 0 .4rem;font-weight:700;">1.4 ตุ่มน้ำ / พอง / ตุ่มหนอง</div>
          <div class="grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.5rem;">
            ${BLISTERS.map((label) => {
              const checked = (d.blisterTypes||[]).includes(label) ? "checked" : "";
              return `
                <label style="display:flex;gap:.5rem;align-items:flex-start;background:#fff;border:1px solid rgba(139,92,246,.2);border-radius:.7rem;padding:.45rem .6rem;">
                  <input type="checkbox" class="p1-blister" data-val="${label}" ${checked}>
                  <span>${label}</span>
                </label>
              `;
            }).join("")}
            <label style="display:flex;gap:.5rem;align-items:flex-start;background:#fff;border:1px solid rgba(139,92,246,.2);border-radius:.7rem;padding:.45rem .6rem;">
              <input type="checkbox" id="p1-bulla" ${d.bulla ? "checked":""}>
              <span>พอง (bulla flag)</span>
            </label>
            <label style="display:flex;gap:.5rem;align-items:flex-start;background:#fff;border:1px solid rgba(139,92,246,.2);border-radius:.7rem;padding:.45rem .6rem;">
              <input type="checkbox" id="p1-pustule" ${d.pustule && d.pustule.has ? "checked":""}>
              <span>ตุ่มหนอง</span>
            </label>
          </div>

          <!-- ผิวหลุดลอก -->
          <div style="margin:1rem 0 .4rem;font-weight:700;">1.5 ผิวหลุดลอก</div>
          <div class="grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.5rem;">
            ${[
              {key:"center", label:"ผิวหนังหลุดลอกตรงกลางผื่น"},
              {key:"lt10",  label:"ไม่เกิน10%BSA"},
              {key:"gt30",  label:"เกิน30%BSA"}
            ].map(opt => {
              const checked = d.skinDetach && d.skinDetach[opt.key] ? "checked" : "";
              return `
                <label style="display:flex;gap:.5rem;align-items:flex-start;background:#fff;border:1px solid rgba(139,92,246,.2);border-radius:.7rem;padding:.45rem .6rem;">
                  <input type="checkbox" class="p1-detach" data-key="${opt.key}" ${checked}>
                  <span>${opt.label}</span>
                </label>
              `;
            }).join("")}
          </div>

          <!-- อาการผิวหนัง: คัน / ปวด-แสบ-ตึง / บวม -->
          <div style="margin:1rem 0 .4rem;font-weight:700;">1.6 อาการผิวหนัง</div>
          <div class="grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.5rem;">
            <label style="display:flex;gap:.5rem;align-items:flex-start;background:#fff;border:1px solid rgba(139,92,246,.2);border-radius:.7rem;padding:.45rem .6rem;">
              <input type="checkbox" id="p1-itch" ${d.itch && d.itch.has ? "checked":""}>
              <span>คัน</span>
            </label>
            <label style="display:flex;gap:.5rem;align-items:flex-start;background:#fff;border:1px solid rgba(139,92,246,.2);border-radius:.7rem;padding:.45rem .6rem;">
              <input type="checkbox" id="p1-nonitch" ${d.itch && d.itch.none ? "checked":""}>
              <span>ไม่คัน</span>
            </label>

            <label style="display:flex;gap:.5rem;align-items:flex-start;background:#fff;border:1px solid rgba(139,92,246,.2);border-radius:.7rem;padding:.45rem .6rem;">
              <input type="checkbox" id="p1-pain" ${d.pain && d.pain.pain ? "checked":""}>
              <span>ปวด</span>
            </label>
            <label style="display:flex;gap:.5rem;align-items:flex-start;background:#fff;border:1px solid rgba(139,92,246,.2);border-radius:.7rem;padding:.45rem .6rem;">
              <input type="checkbox" id="p1-burning" ${d.pain && d.pain.burning ? "checked":""}>
              <span>แสบ</span>
            </label>
            <label style="display:flex;gap:.5rem;align-items:flex-start;background:#fff;border:1px solid rgba(139,92,246,.2);border-radius:.7rem;padding:.45rem .6rem;">
              <input type="checkbox" id="p1-tight" ${d.pain && d.pain.tight ? "checked":""}>
              <span>ตึง</span>
            </label>

            <label style="display:flex;gap:.5rem;align-items:flex-start;background:#fff;border:1px solid rgba(139,92,246,.2);border-radius:.7rem;padding:.45rem .6rem;">
              <input type="checkbox" id="p1-swelling" ${d.swelling && d.swelling.has ? "checked":""}>
              <span>บวม</span>
            </label>
          </div>

          <!-- ผิวลักษณะอื่น -->
          <div style="margin:1rem 0 .4rem;font-weight:700;">1.7 ลักษณะผิวเพิ่มเติม</div>
          <div class="grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.5rem;">
            ${[
              {key:"crust", label:"สะเก็ด"},
              {key:"serous",label:"น้ำเหลือง"},
              {key:"dry",   label:"แห้ง"},
              {key:"scale", label:"ขุย"},
              {key:"peel",  label:"ลอก"},
              {key:"shiny", label:"มันเงา"},
              {key:"smallRedDot", label:"จุดเล็กแดง"} // <- ให้สมองใช้เป็น skin:จุดเล็กแดง
            ].map(opt=>{
              const checked = d[opt.key] ? "checked": "";
              return `
                <label style="display:flex;gap:.5rem;align-items:flex-start;background:#fff;border:1px solid rgba(139,92,246,.2);border-radius:.7rem;padding:.45rem .6rem;">
                  <input type="checkbox" class="p1-skinflag" data-key="${opt.key}" ${checked}>
                  <span>${opt.label}</span>
                </label>
              `;
            }).join("")}
          </div>

          <!-- ตำแหน่ง/การกระจาย -->
          <div style="margin:1rem 0 .4rem;font-weight:700;">1.8 ตำแหน่งที่พบ / การกระจายตัว</div>
          <div class="grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.5rem;">
            ${LOCATIONS.map((label)=>{
              const checked = (d.rashLocations||d.locations||[]).includes(label)?"checked":"";
              return `
                <label style="display:flex;gap:.5rem;align-items:flex-start;background:#fff;border:1px solid rgba(139,92,246,.2);border-radius:.7rem;padding:.45rem .6rem;">
                  <input type="checkbox" class="p1-loc" data-val="${label}" ${checked}>
                  <span>${label}</span>
                </label>
              `;
            }).join("")}
          </div>
          <div style="display:flex;gap:.75rem;align-items:center;margin-top:.6rem;">
            <label style="display:flex;gap:.4rem;align-items:center;">
              <input type="checkbox" id="p1-symm" ${d.distribution==="สมมาตร"?"checked":""}>
              <span>สมมาตร</span>
            </label>
          </div>

          <!-- ระยะเวลา -->
          <div style="margin:1rem 0 .4rem;font-weight:700;">1.9 ระยะเวลาการเกิดอาการ</div>
          <select id="p1-onset" style="width:100%;max-width:420px;border:1px solid rgba(139,92,246,.35);border-radius:.6rem;padding:.55rem .7rem;">
            <option value="">-- เลือก --</option>
            ${ONSET_OPTIONS.map(opt=>{
              const sel = d.onset===opt?"selected":"";
              return `<option ${sel}>${opt}</option>`;
            }).join("")}
          </select>
        </section>

        <!-- ปุ่ม -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:1rem;">
          <button id="p1_clear" style="background:#ef4444;color:#fff;border:none;border-radius:1rem;padding:.65rem 1rem;font-weight:800;box-shadow:0 10px 20px rgba(239,68,68,.25);cursor:pointer;">🗑️ ล้างข้อมูลหน้านี้</button>
          <button id="p1_save" style="background:linear-gradient(120deg,#7c3aed 0%,#6d28d9 60%,#5b21b6 100%);color:#fff;border:none;border-radius:1rem;padding:.75rem 1.15rem;font-weight:900;box-shadow:0 12px 26px rgba(124,58,237,.28);cursor:pointer;">บันทึกข้อมูลและไปหน้า 2</button>
        </div>
      </div>
    `;

    // ====== ผูกเหตุการณ์ ======
    // รูปร่าง
    root.querySelectorAll(".p1-shape").forEach(el=>{
      el.addEventListener("change", saveDraft);
    });
    // สี
    root.querySelectorAll(".p1-color").forEach(el=>{
      el.addEventListener("change", saveDraft);
    });
    // ขอบ
    root.querySelectorAll(".p1-border").forEach(el=>{
      el.addEventListener("change", saveDraft);
    });
    // ตุ่มน้ำ/พอง
    root.querySelectorAll(".p1-blister").forEach(el=>{
      el.addEventListener("change", saveDraft);
    });
    // flags bulla/pustule
    root.getElementById?.("p1-bulla")?.addEventListener("change", saveDraft);
    root.getElementById?.("p1-pustule")?.addEventListener("change", saveDraft);

    // ผิวหลุดลอก
    root.querySelectorAll(".p1-detach").forEach(el=>{
      el.addEventListener("change", saveDraft);
    });

    // อาการผิวหนัง: คัน/ไม่คัน/ปวด/แสบ/**ตึง**
    ["p1-itch","p1-nonitch","p1-pain","p1-burning","p1-tight","p1-swelling"].forEach(id=>{
      const el = document.getElementById(id);
      if (el) el.addEventListener("change", saveDraft);
    });

    // ลักษณะผิวเพิ่มเติม (รวม “จุดเล็กแดง”)
    root.querySelectorAll(".p1-skinflag").forEach(el=>{
      el.addEventListener("change", saveDraft);
    });

    // ตำแหน่ง + สมมาตร
    root.querySelectorAll(".p1-loc").forEach(el=>{
      el.addEventListener("change", saveDraft);
    });
    document.getElementById("p1-symm").addEventListener("change", saveDraft);

    // ระยะเวลา
    document.getElementById("p1-onset").addEventListener("change", saveDraft);

    // ปุ่มล้าง
    document.getElementById("p1_clear").addEventListener("click", ()=>{
      window.drugAllergyData.page1 = {};
      if (window.saveDrugAllergyData) window.saveDrugAllergyData();
      renderPage1();
      alert("ล้างข้อมูลหน้า 1 แล้ว");
    });

    // ปุ่มบันทึก
    document.getElementById("p1_save").addEventListener("click", ()=>{
      saveDraft();
      finalizePage1();
      alert("บันทึกหน้า 1 แล้ว");
      const btn2 = document.querySelector('.tabs button[data-target="page2"]');
      if (btn2) btn2.click();
    });
  }

  function saveDraft() {
    const root = document.getElementById("page1");
    if (!root) return;

    const d = window.drugAllergyData.page1 = window.drugAllergyData.page1 || {};

    // รูปร่าง
    d.rashShapes = Array.from(root.querySelectorAll(".p1-shape:checked")).map(i=>i.getAttribute("data-val"));
    // สี
    d.rashColors = Array.from(root.querySelectorAll(".p1-color:checked")).map(i=>i.getAttribute("data-val"));
    // ขอบ
    d.rashBorders = Array.from(root.querySelectorAll(".p1-border:checked")).map(i=>i.getAttribute("data-val"));
    // ตุ่มน้ำ/พอง
    d.blisterTypes = Array.from(root.querySelectorAll(".p1-blister:checked")).map(i=>i.getAttribute("data-val"));
    d.bulla = !!document.getElementById("p1-bulla")?.checked;
    d.pustule = { has: !!document.getElementById("p1-pustule")?.checked };

    // ผิวหลุดลอก
    const detach = {};
    root.querySelectorAll(".p1-detach").forEach(el=>{
      const key = el.getAttribute("data-key");
      detach[key] = el.checked;
    });
    d.skinDetach = detach;

    // อาการผิวหนัง
    d.itch = { has: !!document.getElementById("p1-itch")?.checked, none: !!document.getElementById("p1-nonitch")?.checked };
    d.pain = {
      pain:    !!document.getElementById("p1-pain")?.checked,
      burning: !!document.getElementById("p1-burning")?.checked,
      tight:   !!document.getElementById("p1-tight")?.checked   // <<< สำคัญ: ให้สมองอ่านเป็น "sym:ตึง"
    };
    d.swelling = { has: !!document.getElementById("p1-swelling")?.checked };

    // ลักษณะผิวเพิ่มเติม
    ["crust","serous","dry","scale","peel","shiny","smallRedDot"].forEach(k=>{
      const el = root.querySelector(`.p1-skinflag[data-key="${k}"]`);
      d[k] = !!(el && el.checked);
    });

    // ตำแหน่ง + การกระจาย
    d.rashLocations = Array.from(root.querySelectorAll(".p1-loc:checked")).map(i=>i.getAttribute("data-val"));
    d.locations = d.rashLocations; // alias เผื่อบางส่วนเรียกชื่อเดิม
    d.distribution = document.getElementById("p1-symm").checked ? "สมมาตร" : "";

    // ระยะเวลา
    d.onset = (document.getElementById("p1-onset").value || "").trim();

    if (window.saveDrugAllergyData) window.saveDrugAllergyData();
    // ไม่ยิง da:update ที่นี่ เพื่อกันการรีเรนเดอร์ถี่ — ให้ยิงตอน "บันทึก"
  }

  function finalizePage1() {
    const d = window.drugAllergyData.page1 || (window.drugAllergyData.page1 = {});
    d.__saved = true;
    d.__ts = Date.now();
    if (window.saveDrugAllergyData) window.saveDrugAllergyData();
    document.dispatchEvent(new Event("da:update"));
    if (typeof window.evaluateDrugAllergy === "function") window.evaluateDrugAllergy();
  }

  // export
  window.renderPage1 = renderPage1;
})();

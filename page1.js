// ===================== page1.js (REPLACE WHOLE FILE) =====================
(function () {
  // ---------- 1.1 รูปร่างผื่น (16 รายการ) ----------
  const SHAPES = [
    "ตุ่มนูน",
    "ตุ่มแบนราบ",
    "ปื้นนูน",
    "วงกลม",
    "วงกลมคล้ายเป้าธนู (ไม่ครบ 3 ชั้น)",
    "วงกลม 3 ชั้น (เป้าธนู)",
    "วงรี",
    "ขอบหยัก",
    "ขอบเรียบ",
    "ขอบไม่ชัดเจน",
    "จุดเล็กแดง",
    "ปื้นแดง",
    "ขอบเขตชัด",
    "ขอบวงนูนแดงด้านในเรียบ",
    "ผื่นราบ",
    "ผิวหนังตึง" // ← ย้ายจาก 1.8
  ];

  // ---------- 1.2 สีผื่น (ใหม่ 11 รายการ) ----------
  const COLORS = [
    "แดง",
    "แดงไหม้",
    "แดงซีด",
    "ซีด",
    "ใส",
    "เหลือง",
    "มันเงา",
    "เทา",
    "ดำ/คล้ำ",
    "ม่วง/คล้ำ",
    "สีผิวปกติ"
  ];

  // ---------- 1.11 ตำแหน่งที่พบ (18 ตัวเลือก) ----------
  const LOCS = [
    "ทั่วร่างกาย",
    "มือ",
    "เท้า",
    "หน้า",
    "แขน",
    "ขา",
    "ริมฝีปาก",
    "รอบดวงตา",
    "ลำคอ",
    "อวัยวะเพศ",
    "ทวาร",
    "หลัง",
    "ลำตัว",
    "รักแร้",
    "ขาหนีบ",
    "ศีรษะ",
    "ลิ้น",
    "ตำแหน่งเดิมกับครั้งก่อน"
  ];

  // ---------- utils ----------
  function buildAgeOptions(selected){
    const out=[];
    for(let i=0;i<=120;i++){
      const v=String(i);
      out.push(`<option value="${v}" ${selected==v?"selected":""}>${i} ปี</option>`);
    }
    out.push(`<option value="other" ${selected==="other"?"selected":""}>อื่นๆ ระบุ…</option>`);
    return out.join("");
  }
  function buildWeightOptions(selected){
    const out=[];
    for(let i=1;i<=200;i++){
      const v=String(i);
      out.push(`<option value="${v}" ${selected==v?"selected":""}>${i} กก.</option>`);
    }
    out.push(`<option value="other" ${selected==="other"?"selected":""}>อื่นๆ ระบุ…</option>`);
    return out.join("");
  }
  function buildUnderlyingOptions(selected){
    const base=["ไม่มีโรคประจำตัว","เบาหวาน","ความดันโลหิตสูง","โรคหัวใจ","โรคตับ","โรคไต","หอบหืด/ภูมิแพ้","อื่นๆ ระบุ…"];
    return base.map(opt=>{
      const val=opt==="อื่นๆ ระบุ…"? "other":opt;
      return `<option value="${val}" ${selected===val?"selected":""}>${opt}</option>`;
    }).join("");
  }
  function cb(id,label,checked){return `<label class="p1-chk"><input type="checkbox" id="${id}" ${checked?"checked":""}><span>${label}</span></label>`;}

  // ป้องกัน id ของ checkbox มีช่องว่าง/อักขระไม่ถูกต้อง
  const safeId = (prefix, txt) => {
    const idtxt = String(txt).trim().replace(/\s+/g, "_").replace(/[^0-9A-Za-zก-๙_/-]/g, "_");
    return `${prefix}${idtxt}`;
  };

  // helper แปลงค่า onset เดิมเป็น code สำหรับ select
  function deriveOnsetCodeFromData(d){
    if (!d) return "";
    if (d.onsetCode) return d.onsetCode; // เคยเก็บแบบใหม่แล้ว

    const raw = d.onset || "";
    const s = String(raw).replace(/[–—−]/g,"-").replace(/\s+/g,"");
    if (!s) return "";
    if (s.indexOf("ภายใน1ชั่วโมง") !== -1 || s.indexOf("ภายใน1ชม") !== -1) return "1h";
    if (s.indexOf("1-6ชั่วโมง") !== -1 || s.indexOf("1–6ชั่วโมง") !== -1 || s.indexOf("1-6ชม") !== -1) return "1to6h";
    if (s.indexOf("6-24ชั่วโมง") !== -1 || s.indexOf("6–24ชั่วโมง") !== -1 || s.indexOf("6-24ชม") !== -1) return "6to24h";
    if (s.indexOf("1สัปดาห์") !== -1) return "1w";
    if (s.indexOf("2สัปดาห์") !== -1) return "2w";
    if (s.indexOf("3สัปดาห์") !== -1) return "3w";
    if (s.indexOf("4สัปดาห์") !== -1) return "4w";
    return "";
  }

  // ---------- select visibility fix ----------
  function injectSelectFixOnce(){
    if(document.getElementById("p1-select-visibility-fix"))return;
    const style=document.createElement("style");
    style.id="p1-select-visibility-fix";
    style.textContent=`
      .p1-section-onset{overflow:visible!important;}
      #page1 select option{color:#111827!important;background:#fff!important;}
      #page1 select{color:#111827;}
    `;
    document.head.appendChild(style);
  }

  // ---------- render ----------
  function renderPage1(){
    if(!window.drugAllergyData) window.drugAllergyData = {};
    if(!window.drugAllergyData.page1) window.drugAllergyData.page1 = {};
    const d = window.drugAllergyData.page1;
    const root = document.getElementById("page1");
    if(!root) return;

    // ค่าปัจจุบันของ onset สำหรับ select (code)
    const onsetCodeCurrent = deriveOnsetCodeFromData(d);

    root.innerHTML = `
<div class="p1-wrapper">
  <h2 class="p1-title">หน้า 1: ระบบผิวหนัง / ข้อมูลผู้ป่วย</h2>

  <!-- ส่วนที่ 1: ข้อมูลผู้ป่วย -->
  <section class="p1-section">
    <h3 class="p1-sec-title"><span class="icon">👤</span>ส่วนที่ 1 ข้อมูลผู้ป่วย</h3>
    <div class="p1-grid">
      <label>ชื่อ-สกุล <input id="p1_name" value="${d.name||""}"></label>
      <label>HN <input id="p1_hn" value="${d.hn||""}"></label>

      <label>อายุ (ปี)
        <select id="p1_age_sel"><option value="">เลือก...</option>${buildAgeOptions(d.ageSel??d.age??"")}</select>
        <input id="p1_age_other" class="p1-other" style="margin-top:.4rem; ${(d.ageSel==="other"||d.age==="other")?"":"display:none"}" placeholder="ระบุอายุ (ปี)" value="${d.ageOther||""}">
      </label>

      <label>น้ำหนัก (กก.)
        <select id="p1_weight_sel"><option value="">เลือก...</option>${buildWeightOptions(d.weightSel??d.weight??"")}</select>
        <input id="p1_weight_other" class="p1-other" style="margin-top:.4rem; ${(d.weightSel==="other"||d.weight==="other")?"":"display:none"}" placeholder="ระบุน้ำหนัก (กก.)" value="${d.weightOther||""}">
      </label>

      <label class="p1-col-2">โรคประจำตัว
        <select id="p1_under_sel"><option value="">เลือก...</option>${buildUnderlyingOptions(d.underSel??d.underlying??"")}</select>
        <input id="p1_under_other" class="p1-other" style="margin-top:.4rem; ${(d.underSel==="other"||d.underlying==="other")?"":"display:none"}" placeholder="ระบุโรคประจำตัวอื่นๆ" value="${d.underOther||""}">
      </label>

      <label class="p1-col-2">ประวัติการแพ้ยา (เดิม)<textarea id="p1_history">${d.drugAllergyHistory||""}</textarea></label>
    </div>
  </section>

  <!-- ส่วนที่ 2: ประเมินอาการ -->
  <section class="p1-section">
    <h3 class="p1-sec-title blue"><span class="icon">🔍</span>ส่วนที่ 2 ประเมินอาการ</h3>

    <!-- 1.1 รูปร่างผื่น (ไม่มีช่องอื่นๆ) -->
    <div class="p1-block">
      <h4>1.1 รูปร่างผื่น</h4>
      <div class="p1-two-cols">
        ${SHAPES.map((s,i)=>cb("shape_"+i,s,d.rashShapes&&d.rashShapes.includes(s))).join("")}
      </div>
    </div>

    <!-- 1.2 สีผื่น (ไม่มีช่องอื่นๆ) -->
    <div class="p1-block">
      <h4>1.2 สีผื่น</h4>
      <div class="p1-two-cols">
        ${COLORS.map((c,i)=>cb("color_"+i,c,d.rashColors&&d.rashColors.includes(c))).join("")}
      </div>
    </div>

    <!-- 1.3 ตุ่มน้ำ -->
    <div class="p1-block">
      <h4>1.3 ตุ่มน้ำ</h4>
      <div class="p1-col p1-col-2col">
        ${cb("blister_small","ตุ่มน้ำขนาดเล็ก",d.blisters?.small)}
        ${cb("blister_medium","ตุ่มน้ำขนาดกลาง",d.blisters?.medium)}
        ${cb("blister_large","ตุ่มน้ำขนาดใหญ่",d.blisters?.large)}
      </div>
      <input id="blister_other" class="p1-other" placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" value="${d.blisters?.other||""}">
    </div>

    <!-- 1.4 ผิวหนังหลุดลอก -->
    <div class="p1-block">
      <h4>1.4 ผิวหนังหลุดลอก</h4>
      <div class="p1-col p1-col-2col">
        ${cb("detach_center","ผิวหนังหลุดลอกตรงกลางผื่น",d.skinDetach?.center)}
        ${cb("detach_lt10","ผิวหนังหลุดลอกไม่เกิน 10% ของ BSA",d.skinDetach?.lt10)}
        ${cb("detach_gt30","ผิวหนังหลุดลอกเกิน 30% ของ BSA",d.skinDetach?.gt30)}
        ${cb("detach_none","ไม่พบ",d.skinDetach?.none)}
      </div>
      <input id="detach_other" class="p1-other" placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" value="${d.skinDetach?.other||""}">
    </div>

    <!-- 1.5 ขุย/แห้ง/ลอก -->
    <div class="p1-block">
      <h4>1.5 ขุย/แห้ง/ลอก</h4>
      <div class="p1-col p1-col-2col">
        ${cb("scale_scale","ขุย",d.scales?.scale)}
        ${cb("scale_dry","แห้ง",d.scales?.dry)}
        ${cb("scale_peel","ลอก",d.scales?.peel)}
        ${cb("scale_none","ไม่พบ",d.scales?.none)}
      </div>
      <input id="scale_other" class="p1-other" placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" value="${d.scales?.other||""}">
    </div>

    <!-- 1.6 น้ำเหลือง / สะเก็ด -->
    <div class="p1-block">
      <h4>1.6 น้ำเหลือง / สะเก็ด</h4>
      <div class="p1-col p1-col-2col">
        ${cb("ex_serous","น้ำเหลือง",d.exudate?.serous)}
        ${cb("ex_crust","สะเก็ด",d.exudate?.crust)}
        ${cb("ex_none","ไม่พบ",d.exudate?.none)}
      </div>
      <input id="ex_other" class="p1-other" placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" value="${d.exudate?.other||""}">
    </div>

    <!-- 1.7 คัน -->
    <div class="p1-block">
      <h4>1.7 คัน</h4>
      <div class="p1-col">
        ${cb("itch_has","คัน ✓",d.itch?.has)}
        <div class="p1-indent">
          ${cb("itch_severe","คันมาก",d.itch?.severe)}
          ${cb("itch_mild","คันน้อย",d.itch?.mild)}
        </div>
        ${cb("itch_none","ไม่คัน",d.itch?.none)}
      </div>
    </div>

    <!-- 1.8 ปวด / แสบ / เจ็บ (ตัด “ตึง” ออกแล้ว) -->
    <div class="p1-block">
      <h4>1.8 ปวด / แสบ / เจ็บ</h4>
      <div class="p1-col p1-col-2col">
        ${cb("pain_pain","ปวด",d.pain?.pain)}
        ${cb("pain_burn","แสบ",d.pain?.burn)}
        ${cb("pain_sore","เจ็บ",d.pain?.sore)}
        ${cb("pain_none","ไม่พบ",d.pain?.none)}
      </div>
    </div>

    <!-- 1.9 บวม -->
    <div class="p1-block">
      <h4>1.9 บวม</h4>
      <div class="p1-col p1-col-2col">
        ${cb("sw_has","บวม",d.swelling?.has)}
        ${cb("sw_none","ไม่บวม",d.swelling?.none)}
      </div>
    </div>

    <!-- 1.10 ตุ่มหนอง -->
    <div class="p1-block">
      <h4>1.10 ตุ่มหนอง</h4>
      <div class="p1-col p1-col-2col">
        ${cb("pus_has","พบ",d.pustule?.has)}
        ${cb("pus_none","ไม่พบ",d.pustule?.none)}
      </div>
      <input id="pus_detail" class="p1-other" placeholder="รายละเอียด..." value="${d.pustule?.detail||""}">
    </div>

    <!-- 1.11 ตำแหน่งที่พบ / การกระจายตัว -->
    <div class="p1-block">
      <h4>1.11 ตำแหน่งที่พบ / การกระจายตัว</h4>
      <div class="p1-two-cols">
        ${LOCS.map(loc=>{
          const id = safeId("loc_", loc);
          const checked = d.locations && Array.isArray(d.locations) && d.locations.includes(loc);
          return cb(id, loc, checked);
        }).join("")}
      </div>
      <label class="p1-chk" style="margin-top:.5rem;">
        <input type="checkbox" id="p1_mucosal_gt1" ${d.mucosalCountGt1?"checked":""}>
        <span>จำนวนผื่นบริเวณเยื่อบุ > 1</span>
      </label>
      <label>การกระจายตัว
        <select id="p1_distribution">
          <option value="">เลือก...</option>
          <option value="สมมาตร" ${d.distribution==="สมมาตร"?"selected":""}>สมมาตร</option>
          <option value="ไม่สมมาตร" ${d.distribution==="ไม่สมมาตร"?"selected":""}>ไม่สมมาตร</option>
          <option value="อื่นๆ" ${d.distribution==="อื่นๆ"?"selected":""}>อื่นๆ</option>
        </select>
      </label>
      <input id="p1_distribution_other" class="p1-other" placeholder="ถ้าเลือกอื่นๆ ระบุ..." value="${d.distributionOther||""}" style="${d.distribution==="อื่นๆ"?"":"display:none"}">
    </div>
  </section>

  <!-- ส่วนที่ 3: ระยะเวลาการเกิด -->
  <section class="p1-section p1-section-onset">
    <h3 class="p1-sec-title purple"><span class="icon">⏱️</span>ส่วนที่ 3 ระยะเวลาการเกิดอาการ</h3>
    <label>เลือกช่วงเวลา
      <select id="p1_onset">
        <option value="">เลือก...</option>
        <option value="1h" ${onsetCodeCurrent==="1h"?"selected":""}>ภายใน 1 ชั่วโมง</option>
        <option value="1to6h" ${onsetCodeCurrent==="1to6h"?"selected":""}>ภายใน 1–6 ชั่วโมง</option>
        <option value="6to24h" ${onsetCodeCurrent==="6to24h"?"selected":""}>ภายใน 6–24 ชั่วโมง</option>
        <option value="1w" ${onsetCodeCurrent==="1w"?"selected":""}>ภายใน 1 สัปดาห์</option>
        <option value="2w" ${onsetCodeCurrent==="2w"?"selected":""}>ภายใน 2 สัปดาห์</option>
        <option value="3w" ${onsetCodeCurrent==="3w"?"selected":""}>ภายใน 3 สัปดาห์</option>
        <option value="4w" ${onsetCodeCurrent==="4w"?"selected":""}>ภายใน 4 สัปดาห์</option>
        <option value="other" ${onsetCodeCurrent==="other"?"selected":""}>อื่นๆ ระบุ…</option>
      </select>
    </label>
    <input id="p1_onset_other" class="p1-other" style="${onsetCodeCurrent==="other"?"":"display:none"}" placeholder="ระบุระยะเวลา" value="${d.onsetOther||""}">
  </section>

  <!-- ส่วนที่ 4: แนบรูป -->
  <section class="p1-section">
    <h3 class="p1-sec-title green"><span class="icon">🖼️</span>ส่วนที่ 4 แนบรูปถ่ายอาการผู้ป่วย</h3>
    <div class="p1-upload" id="p1_drop">
      <p>อัปโหลดรูปภาพ หรือ ลากมาวาง</p>
      <button type="button" class="btn-upload" id="p1_pick">เลือกไฟล์</button>
      <input type="file" id="p1_file" accept="image/*" style="display:none">
      <p class="p1-upload-name" id="p1_file_name">${d.imageName? "ไฟล์ปัจจุบัน: "+d.imageName : "ยังไม่ได้เลือกรูป"}</p>
      ${d.imageDataUrl? `<img src="${d.imageDataUrl}" class="p1-preview">` : ""}
    </div>
  </section>

  <div class="p1-actions">
    <button class="btn-danger" id="p1_clear">🗑️ ล้างข้อมูลหน้านี้</button>
    <button class="btn-primary" id="p1_save">บันทึกข้อมูลและไปหน้า 2</button>
  </div>
</div>`;

    injectSelectFixOnce();

    // dropdown dependent inputs
    const ageSelEl=document.getElementById("p1_age_sel");
    const ageOtherEl=document.getElementById("p1_age_other");
    ageSelEl.addEventListener("change",()=>{ageOtherEl.style.display=ageSelEl.value==="other"?"block":"none";});
    const weightSelEl=document.getElementById("p1_weight_sel");
    const weightOtherEl=document.getElementById("p1_weight_other");
    weightSelEl.addEventListener("change",()=>{weightOtherEl.style.display=weightSelEl.value==="other"?"block":"none";});
    const underSelEl=document.getElementById("p1_under_sel");
    const underOtherEl=document.getElementById("p1_under_other");
    underSelEl.addEventListener("change",()=>{underOtherEl.style.display=underSelEl.value==="other"?"block":"none";});
    const distSel=document.getElementById("p1_distribution");
    const distOther=document.getElementById("p1_distribution_other");
    distSel.addEventListener("change",()=>{distOther.style.display=distSel.value==="อื่นๆ"?"block":"none";});
    const onsetSel=document.getElementById("p1_onset");
    const onsetOther=document.getElementById("p1_onset_other");
    onsetSel.addEventListener("change",()=>{onsetOther.style.display=onsetSel.value==="other"?"block":"none";});
    onsetSel.style.position="relative";onsetSel.style.zIndex="10000";

    // image upload
    const fileInput=document.getElementById("p1_file");
    const pickBtn=document.getElementById("p1_pick");
    const dropZone=document.getElementById("p1_drop");
    const fileNameEl=document.getElementById("p1_file_name");
    function handleFile(file){
      const reader=new FileReader();
      reader.onload=(ev)=>{
        d.imageName=file.name;
        d.imageDataUrl=ev.target.result;
        fileNameEl.textContent="ไฟล์ปัจจุบัน: "+file.name;
        if(window.saveDrugAllergyData)window.saveDrugAllergyData();
        renderPage1();
      };
      reader.readAsDataURL(file);
    }
    pickBtn.addEventListener("click",()=>fileInput.click());
    fileInput.addEventListener("change",(e)=>{const f=e.target.files[0];if(f)handleFile(f);});
    dropZone.addEventListener("dragover",(e)=>{e.preventDefault();dropZone.classList.add("dragover");});
    dropZone.addEventListener("dragleave",()=>{dropZone.classList.remove("dragover");});
    dropZone.addEventListener("drop",(e)=>{e.preventDefault();dropZone.classList.remove("dragover");const f=e.dataTransfer.files[0];if(f)handleFile(f);});

    // clear & save
    document.getElementById("p1_clear").addEventListener("click",()=>{
      window.drugAllergyData.page1={};
      if(window.saveDrugAllergyData)window.saveDrugAllergyData();
      renderPage1();
      alert("ล้างข้อมูลหน้า 1 แล้ว");
    });

    document.getElementById("p1_save").addEventListener("click",()=>{
      const store = window.drugAllergyData.page1;

      store.name=document.getElementById("p1_name").value;
      store.hn=document.getElementById("p1_hn").value;

      const ageSel=document.getElementById("p1_age_sel").value;
      store.ageSel=ageSel; store.ageOther=document.getElementById("p1_age_other").value;
      store.age = (ageSel==="other")? store.ageOther : ageSel;

      const weightSel=document.getElementById("p1_weight_sel").value;
      store.weightSel=weightSel; store.weightOther=document.getElementById("p1_weight_other").value;
      store.weight = (weightSel==="other")? store.weightOther : weightSel;

      const underSel=document.getElementById("p1_under_sel").value;
      store.underSel=underSel; store.underOther=document.getElementById("p1_under_other").value;
      store.underlying = (underSel==="other")? store.underOther : underSel;

      store.drugAllergyHistory=document.getElementById("p1_history").value;

      // ✅ เก็บตัวเลือกตามสเปคใหม่ (ไม่มี "อื่นๆ ระบุ...")
      store.rashShapes = SHAPES.filter((s,i)=>document.getElementById("shape_"+i).checked);
      store.rashColors = COLORS.filter((c,i)=>document.getElementById("color_"+i).checked);

      store.blisters = {
        small:document.getElementById("blister_small").checked,
        medium:document.getElementById("blister_medium").checked,
        large:document.getElementById("blister_large").checked,
        other:document.getElementById("blister_other").value
      };

      store.skinDetach = {
        center:document.getElementById("detach_center").checked,
        lt10:document.getElementById("detach_lt10").checked,
        gt30:document.getElementById("detach_gt30").checked,
        none:document.getElementById("detach_none").checked,
        other:document.getElementById("detach_other").value
      };

      store.scales = {
        scale:document.getElementById("scale_scale").checked,
        dry:document.getElementById("scale_dry").checked,
        peel:document.getElementById("scale_peel").checked,
        none:document.getElementById("scale_none").checked,
        other:document.getElementById("scale_other").value
      };

      store.exudate = {
        serous:document.getElementById("ex_serous").checked,
        crust:document.getElementById("ex_crust").checked,
        none:document.getElementById("ex_none").checked,
        other:document.getElementById("ex_other").value
      };

      store.itch = {
        has:document.getElementById("itch_has").checked,
        severe:document.getElementById("itch_severe").checked,
        mild:document.getElementById("itch_mild").checked,
        none:document.getElementById("itch_none").checked
      };

      // ✅ 1.8 ตัด "ตึง" ออกแล้ว
      store.pain = {
        pain:document.getElementById("pain_pain").checked,
        burn:document.getElementById("pain_burn").checked,
        sore:document.getElementById("pain_sore").checked,
        none:document.getElementById("pain_none").checked
      };

      store.swelling = {
        has:document.getElementById("sw_has").checked,
        none:document.getElementById("sw_none").checked
      };

      store.pustule = {
        has:document.getElementById("pus_has").checked,
        none:document.getElementById("pus_none").checked,
        detail:document.getElementById("pus_detail").value
      };

      // ✅ 1.11 ตำแหน่งครบ 18 + mucosal >1 (ใช้ safeId)
      store.locations = LOCS.filter(loc=>{
        const id = safeId("loc_", loc);
        const el = document.getElementById(id);
        return el && el.checked;
      });
      store.mucosalCountGt1 = document.getElementById("p1_mucosal_gt1").checked;

      store.distribution = document.getElementById("p1_distribution").value;
      store.distributionOther = document.getElementById("p1_distribution_other").value;

      // ---------- บันทึก onset สำหรับ UI + สมอง ----------
      const onsetCodeSel = document.getElementById("p1_onset").value;
      store.onsetCode = onsetCodeSel;
      store.onsetOther = document.getElementById("p1_onset_other").value;

      let onsetLabel = "";
      switch (onsetCodeSel) {
        case "1h":
          onsetLabel = "ภายใน 1 ชั่วโมง";
          break;
        case "1to6h":
          onsetLabel = "ภายใน 1-6 ชั่วโมง";
          break;
        case "6to24h":
          onsetLabel = "ภายใน 6-24 ชั่วโมง";
          break;
        case "1w":
          onsetLabel = "ภายใน 1 สัปดาห์";
          break;
        case "2w":
          onsetLabel = "ภายใน 2 สัปดาห์";
          break;
        case "3w":
          onsetLabel = "ภายใน 3 สัปดาห์";
          break;
        case "4w":
          onsetLabel = "ภายใน 4 สัปดาห์";
          break;
        case "other":
          onsetLabel = store.onsetOther || "";
          break;
        default:
          onsetLabel = "";
      }
      // ให้ brain.rules.js ตัวเดิมใช้ field นี้ไป map category ต่อ
      store.onset = onsetLabel;

      store.__saved = true;
      store.__ts = Date.now();

      window.drugAllergyData.page1 = (window.structuredClone? structuredClone(store) : JSON.parse(JSON.stringify(store)));
      document.dispatchEvent(new Event("da:update"));
      if(window.evaluateDrugAllergy) window.evaluateDrugAllergy();
      if(window.saveDrugAllergyData) window.saveDrugAllergyData();

      alert("บันทึกหน้า 1 แล้ว");
      const btn2=document.querySelector('.tabs button[data-target="page2"]'); if(btn2) btn2.click();
    });
  }

  window.renderPage1 = renderPage1;
})();

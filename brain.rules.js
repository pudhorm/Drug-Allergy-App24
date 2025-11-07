// ===================== brain.rules.js (REPLACE WHOLE FILE) =====================
(function () {
  // ---------- SAFE GUARD ----------
  if (window.__brainRulesBound) return;
  window.__brainRulesBound = true;

  // ---------- HELPERS: ดึงค่า/ทำแท็ก ----------
  function truthy(x){ return !!x; }
  function asArray(v){ return Array.isArray(v) ? v : (v ? [v] : []); }

  // สร้างชุด "แท็ก" จากข้อมูลหน้า 1–3 (+บางส่วนจาก 5)
  function collectTags(d){
    const tags = new Set();

    const p1 = d.page1 || {};
    const p2 = d.page2 || {};
    const p3 = d.page3 || {};
    const p5 = d.page5 || {};

    // ----- หน้า 1: รูปร่าง/สี/อาการผิว/ตำแหน่ง/เวลา -----
    asArray(p1.rashShapes).forEach(s => { if(!s) return; tags.add("รูปร่าง:"+s.trim()); });
    asArray(p1.rashColors).forEach(c => { if(!c) return; tags.add("สี:"+c.trim()); });

    if (p1.itch?.has) tags.add("อาการผิว:คัน");
    if (p1.swelling?.has) tags.add("อาการผิว:บวม");
    if (p1.pain?.pain) tags.add("อาการผิว:ปวด");
    if (p1.pain?.burn) tags.add("อาการผิว:แสบ");
    if (p1.tight?.has) tags.add("อาการผิว:ตึง");
    if (p1.pustule?.has) tags.add("อาการผิว:ตุ่มหนอง");
    if (p1.bullae?.small) tags.add("ตุ่มน้ำ:เล็ก");
    if (p1.bullae?.medium) tags.add("ตุ่มน้ำ:กลาง");
    if (p1.bullae?.large) tags.add("ตุ่มน้ำ:ใหญ่");
    if (p1.serum?.has) tags.add("อาการผิว:น้ำเหลือง");
    if (p1.crust?.has) tags.add("อาการผิว:สะเก็ด");
    if (p1.centerPeel?.has) tags.add("อาการผิว:ผิวหนังหลุดลอกตรงกลางผื่น");
    if (p1.skinDetach?.lt10) tags.add("BSA:<=10%");
    if (p1.skinDetach?.gt30) tags.add("BSA:>=30%");
    if (p1.skinDetach?.center) tags.add("อาการผิว:ผิวหนังหลุดลอก");

    // ตำแหน่ง
    asArray(p1.locations).forEach(loc => { if(!loc) return; tags.add("ตำแหน่ง:"+loc.trim()); });
    if (p1.distribution?.symmetric) tags.add("การกระจาย:สมมาตร");

    // เวลา/Onset (ชื่อค่าคาดหวังจาก UI เดิม)
    if (p1.onset) {
      const o = String(p1.onset).trim();
      if (/ภายใน\s*1\s*ชั่วโมง/.test(o)) tags.add("เวลา:<=1h");
      if (/1\s*–?\s*6\s*ชั่วโมง/.test(o) || /1-6\s*ชั่วโมง/.test(o)) tags.add("เวลา:1-6h");
      if (/6\s*–?\s*24\s*ชั่วโมง|6-24/.test(o)) tags.add("เวลา:6-24h");
      if (/1\s*สัปดาห์/.test(o)) tags.add("เวลา:1w");
      if (/2\s*สัปดาห์/.test(o)) tags.add("เวลา:2w");
      if (/3\s*สัปดาห์/.test(o)) tags.add("เวลา:3w");
      if (/4\s*สัปดาห์/.test(o)) tags.add("เวลา:4w");
      if (/5\s*สัปดาห์/.test(o)) tags.add("เวลา:5w");
      if (/6\s*สัปดาห์/.test(o)) tags.add("เวลา:6w");
    }

    // ----- หน้า 2: ระบบอื่น ๆ / CV / resp / GI ฯลฯ -----
    // หายใจ
    const gResp = p2.resp || {};
    if (gResp["หายใจมีเสียงวี๊ด"]?.checked || gResp.wheeze) tags.add("ระบบอื่น:หายใจมีเสียงวี๊ด");
    if (gResp["หอบเหนื่อย/หายใจลำบาก (RR>21 หรือ HR>100 หรือ SpO2<94%)"]?.checked || gResp.dyspnea) tags.add("ระบบอื่น:หายใจลำบาก");
    if (gResp.tachypnea) tags.add("ระบบอื่น:หายใจเร็ว");

    // CV
    const gCV = p2.cv || {};
    if (gCV["BP ต่ำ (<90/60)"]?.checked || gCV.hypotension) tags.add("ระบบอื่น:BPต่ำ");
    if (gCV["HR สูง (>100)"]?.checked || gCV.tachycardia) tags.add("Lab:HR>100");
    // เงื่อนไขลดลงจาก baseline (ชื่อที่ผู้ใช้ขอ)
    if (gCV["BP ลดลง ≥30% ของ baseline systolic เดิม"]?.checked) tags.add("ระบบอื่น:BPลง30%");
    if (gCV["BP ลดลง ≥40 mmHg ของ baseline systolic เดิม"]?.checked) tags.add("ระบบอื่น:BPลง40mmHg");

    // GI
    const gGI = p2.gi || {};
    if (gGI["ท้องเสีย"]?.checked) tags.add("ระบบอื่น:ท้องเสีย");
    if (gGI["กลืนลำบาก"]?.checked) tags.add("ระบบอื่น:กลืนลำบาก");
    if (gGI["ปวดบิดท้อง"]?.checked) tags.add("ระบบอื่น:ปวดบิดท้อง");
    if (gGI["คลื่นไส้/อาเจียน"]?.checked) tags.add("ระบบอื่น:คลื่นไส้อาเจียน");

    // Eye
    const gEye = p2.eye || {};
    if (gEye["เยื่อบุตาอักเสบ (ตาแดง)"]?.checked) tags.add("ระบบอื่น:เยื่อบุตาอักเสบ");

    // อื่นๆ
    const gOther = p2.other || {};
    if (gOther["ไข้ Temp > 37.5 °C"]?.checked) tags.add("ระบบอื่น:ไข้");
    if (gOther["อ่อนเพลีย"]?.checked) tags.add("ระบบอื่น:อ่อนเพลีย");

    // อวัยวะผิดปกติ (ส่วนที่ 2)
    const organs = p2.organs || {};
    if (organs["ต่อมน้ำเหลืองโต"]?.checked) tags.add("อวัยวะ:ต่อมน้ำเหลืองโต");
    if (organs["ม้ามโต"]?.checked) tags.add("อวัยวะ:ม้ามโต");
    if (organs["ตับอักเสบ"]?.checked) tags.add("อวัยวะ:ตับอักเสบ");
    if (organs["ตับโต"]?.checked) tags.add("อวัยวะ:ตับโต");
    if (organs["ไตอักเสบ"]?.checked) tags.add("อวัยวะ:ไตอักเสบ");
    if (organs["ไตวาย"]?.checked) tags.add("อวัยวะ:ไตวาย");
    if (organs["กล้ามเนื้อหัวใจอักเสบ"]?.checked) tags.add("อวัยวะ:กล้ามเนื้อหัวใจอักเสบ");
    if (organs["ปอดอักเสบ"]?.checked) tags.add("อวัยวะ:ปอดอักเสบ");
    if (organs["ขาบวม"]?.checked) tags.add("อวัยวะ:ขาบวม");

    // ----- หน้า 3: LAB (ใช้เฉพาะที่ระบุ) -----
    function num(v){ const n=Number(String(v??"").replace(/[, ]+/g,"")); return Number.isFinite(n)?n:NaN; }

    const eosPct  = num(p3?.cbc?.eos?.value);
    if (Number.isFinite(eosPct) && eosPct >= 5) tags.add("Lab:Eosinophil>=5%");
    if (Number.isFinite(eosPct) && eosPct >= 10) tags.add("Lab:Eosinophil>=10%");
    const wbc     = num(p3?.cbc?.wbc?.value);
    if (Number.isFinite(wbc) && wbc > 11000) tags.add("Lab:WBC>11000");
    const neutPct = num(p3?.cbc?.neutrophil?.value);
    if (Number.isFinite(neutPct) && neutPct > 75) tags.add("Lab:Neutrophil>75%");
    const hb      = num(p3?.cbc?.hb?.value);
    if (Number.isFinite(hb) && hb < 10) tags.add("Lab:HB<10");
    const hct     = num(p3?.cbc?.hct?.value);
    if (Number.isFinite(hct) && hct < 30) tags.add("Lab:Hct<30");
    const plt     = num(p3?.cbc?.platelet?.value);
    if (Number.isFinite(plt) && plt < 150000) tags.add("Lab:PLT<150k");
    if (Number.isFinite(plt) && plt < 100000) tags.add("Lab:PLT<100k");

    const alt     = num(p3?.lft?.alt?.value);
    const ast     = num(p3?.lft?.ast?.value);
    if ((Number.isFinite(alt) && alt >= 40) || (Number.isFinite(ast) && ast >= 40)) tags.add("Lab:LFT>=40");
    if ((Number.isFinite(alt) && alt >= 80) || (Number.isFinite(ast) && ast >= 80)) tags.add("Lab:LFT>=2xULN");

    const cr      = num(p3?.rft?.creatinine?.value);
    if (Number.isFinite(cr)) {
      // flag เพิ่มขึ้นใช้จากคำอธิบาย → ให้ผู้ใช้ติ๊กในหน้า 2/บันทึก detail; ที่นี่ใส่ธงทั่วไปไว้ก่อน
      if (cr >= 1.5) tags.add("Lab:CrHigh");
    }
    const egfr = num(p3?.rft?.egfr?.value);
    if (Number.isFinite(egfr) && egfr < 60) tags.add("Lab:eGFR<60");
    const spo2 = num(p2?.resp?.spo2?.value ?? p3?.vitals?.spo2?.value);
    if (Number.isFinite(spo2) && spo2 < 94) tags.add("Lab:SpO2<94");
    const hr = num(p2?.cv?.hr?.value ?? p3?.vitals?.hr?.value);
    if (Number.isFinite(hr) && hr > 100) tags.add("Lab:HR>100");

    // UA protein+
    const uaProtein = String(p3?.ua?.protein?.value || "").trim();
    if (/^\+/.test(uaProtein) || /positive/i.test(uaProtein)) tags.add("Lab:protein+");

    // LDH
    const ldh = num(p3?.others?.ldh?.value);
    if (Number.isFinite(ldh) && ldh > 2) tags.add("Lab:LDHHigh"); // หมายเหตุ: ถ้ากรอกเป็น xULN ให้ติ๊กผ่าน detail

    // ----- หน้า 5 (timeline) ไม่ได้ใช้ในการเทียบลักษณะ จึงไม่สร้างแท็กเพิ่มเติม -----

    return tags;
  }

  // ช่วยตรวจว่ามีแท็กย่อยตรงกับชุดไหนสักตัวไหม
  function groupHit(tagSet, subTags){
    // subTags: string[] ของแท็กที่ถือว่า "ทริกเกอร์" ข้อใหญ่นี้
    for (const t of subTags) if (tagSet.has(t)) return true;
    return false;
  }

  // ---------- รูปแบบกฎ ----------
  // majors: [{ name, weight(=1 default), sub: [list of tags that indicate a hit] }]
  // % = sum(weight of hit majors) / sum(weight of all majors) * 100
  const R = {};

  R.urticaria = {
    title: "Urticaria",
    majors: [
      { name:"รูปร่าง", sub:[
        "รูปร่าง:ขอบหยัก","รูปร่าง:วงกลม","รูปร่าง:ขอบวงนูนแดงด้านในเรียบ"
      ]},
      { name:"สี", sub:["สี:แดง","สี:แดงซีด","สี:ซีด","สี:สีผิวปกติ"]},
      { name:"ลักษณะสำคัญ", weight:2, sub:["รูปร่าง:ตุ่มนูน","รูปร่าง:ปื้นนูน"]},
      { name:"อาการเพิ่มเติมผิว", sub:["อาการผิว:คัน"]},
      { name:"อาการพบน้อย", sub:["อาการผิว:บวม"]},
      { name:"ตำแหน่ง", sub:[
        "ตำแหน่ง:ทั่วร่างกาย","ตำแหน่ง:มือ","ตำแหน่ง:เท้า","ตำแหน่ง:แขน","ตำแหน่ง:ขา",
        "ตำแหน่ง:หน้า","ตำแหน่ง:รอบดวงตา","ตำแหน่ง:ลำคอ","ตำแหน่ง:ลำตัว","ตำแหน่ง:หลัง"
      ]},
      { name:"เวลา", sub:["เวลา:<=1h"]},
    ]
  };

  R.anaphylaxis = {
    title: "Anaphylaxis",
    majors: [
      { name:"รูปร่าง", sub:["รูปร่าง:ตุ่มนูน","รูปร่าง:ปื้นนูน","อาการผิว:บวม","รูปร่าง:นูนหนา","อาการผิว:ตึง"]},
      { name:"ลักษณะสำคัญ", weight:2, sub:["ระบบอื่น:หายใจมีเสียงวี๊ด","ระบบอื่น:หายใจลำบาก"]},
      { name:"อาการผิว", sub:["อาการผิว:คัน","สี:แดง","สี:สีผิวปกติ"]},
      { name:"อาการพบน้อย", sub:["ระบบอื่น:ท้องเสีย","ระบบอื่น:กลืนลำบาก","ระบบอื่น:ปวดบิดท้อง","ระบบอื่น:คลื่นไส้อาเจียน"]},
      { name:"เวลา", sub:["เวลา:<=1h","เวลา:1-6h"]},
      { name:"ระบบอื่น", sub:["ระบบอื่น:BPต่ำ","ระบบอื่น:BPลง30%","ระบบอื่น:BPลง40mmHg"]},
      { name:"Lab/Vital", sub:["Lab:HR>100","Lab:SpO2<94"]},
    ]
  };

  R.angioedema = {
    title: "Angioedema",
    majors: [
      { name:"รูปร่าง", sub:["รูปร่าง:นูนหนา","รูปร่าง:ขอบไม่ชัดเจน"]},
      { name:"สี", sub:["สี:สีผิวปกติ","สี:แดง"]},
      { name:"ลักษณะสำคัญ", weight:2, sub:["อาการผิว:บวม"]},
      { name:"อาการผิว", sub:["อาการผิว:ตึง"]},
      { name:"อาการพบน้อย", sub:["อาการผิว:คัน","อาการผิว:ปวด","อาการผิว:แสบ"]},
      { name:"ตำแหน่ง", sub:["ตำแหน่ง:ริมฝีปาก","ตำแหน่ง:รอบดวงตา","ตำแหน่ง:ลิ้น","ตำแหน่ง:อวัยวะเพศ"]},
      { name:"เวลา", sub:["เวลา:<=1h"]},
    ]
  };

  R.maculopapular = {
    title: "Maculopapular rash",
    majors: [
      { name:"รูปร่าง", sub:["รูปร่าง:ปื้นแดง","รูปร่าง:ปื้นนูน","รูปร่าง:ตุ่มนูน"]},
      { name:"สี", sub:["สี:แดง"]},
      { name:"ลักษณะสำคัญ", weight:2, sub:["อาการผิว:จุดเล็กแดง"]}, // ถ้า UI มี tag จุดเล็กแดง
      { name:"อาการผิว", sub:["อาการผิว:คัน"]},
      { name:"อาการพบน้อย", sub:["ระบบอื่น:ไข้","Lab:Eosinophil>=5%"]},
      { name:"ตำแหน่ง", sub:["การกระจาย:สมมาตร","ตำแหน่ง:ลำตัว","ตำแหน่ง:แขน","ตำแหน่ง:ใบหน้า","ตำแหน่ง:ลำคอ"]},
      { name:"เวลา", sub:["เวลา:1-6h","เวลา:6-24h","เวลา:1w","เวลา:2w"]},
      { name:"อวัยวะผิดปกติ", sub:["อวัยวะ:ต่อมน้ำเหลืองโต","ระบบอื่น:ข้ออักเสบ","อวัยวะ:ไตอักเสบ","อวัยวะ:ตับอักเสบ"]},
    ]
  };

  R.fde = {
    title: "Fixed drug eruption",
    majors: [
      { name:"รูปร่าง", sub:["รูปร่าง:วงกลม","รูปร่าง:วงรี"]},
      { name:"สี", sub:["สี:แดง","สี:ดำ","สี:ดำ/คล้ำ","สี:คล้ำ","สี:ม่วง","สี:เทา"]},
      { name:"ลักษณะสำคัญ", weight:3, sub:["สี:ม่วง","สี:ดำ/คล้ำ","สี:คล้ำ"]},
      { name:"อาการผิว", sub:["อาการผิว:ผิวหนังหลุดลอกตรงกลางผื่น","อาการผิว:เจ็บ","อาการผิว:แสบ","อาการผิว:ตึง"]},
      { name:"อาการพบน้อย", sub:["อาการผิว:บวม","ตุ่มน้ำ:ใหญ่","ตุ่มน้ำ:กลาง","ตุ่มน้ำ:เล็ก"]},
      { name:"ตำแหน่ง", sub:["ตำแหน่ง:ริมฝีปาก","ตำแหน่ง:หน้า","ตำแหน่ง:มือ","ตำแหน่ง:เท้า","ตำแหน่ง:แขน","ตำแหน่ง:ขา","ตำแหน่ง:อวัยวะเพศ","ตำแหน่ง:ตำแหน่งเดิมกับครั้งก่อน"]},
      { name:"เวลา", sub:["เวลา:1w","เวลา:2w"]},
      { name:"ระบบอื่น", sub:["ระบบอื่น:ไข้","ระบบอื่น:คลื่นไส้อาเจียน","ระบบอื่น:ปวดเมื่อยกล้ามเนื้อ"]},
      { name:"ขอบ", sub:["รูปร่าง:ขอบเรียบ","รูปร่าง:ขอบเขตชัดเจน"]},
    ]
  };

  R.agep = {
    title: "AGEP",
    majors: [
      { name:"รูปร่าง", sub:["รูปร่าง:ผื่นแดง","สี:แดง"]},
      { name:"สี", sub:["สี:แดง","สี:เหลือง"]},
      { name:"ลักษณะสำคัญ", weight:3, sub:["อาการผิว:ตุ่มหนอง"]},
      { name:"อาการผิว", sub:["อาการผิว:บวม","อาการผิว:คัน","อาการผิว:เจ็บ"]},
      { name:"อาการพบน้อย", sub:["อาการผิว:ปื้น/จ้ำเลือด","อาการผิว:แห้ง","อาการผิว:ลอก","อาการผิว:ขุย"]},
      { name:"ตำแหน่ง", sub:["ตำแหน่ง:หน้า","ตำแหนง:รักแร้","ตำแหน่ง:ทั่วร่างกาย","ตำแหน่ง:ขาหนีบ"]},
      { name:"เวลา", sub:["เวลา:6-24h","เวลา:1w","เวลา:2w","เวลา:3w"]},
      { name:"ระบบอื่น", sub:["ระบบอื่น:ไข้"]},
      { name:"Lab", sub:["Lab:WBC>11000","Lab:Neutrophil>75%"]},
    ]
  };

  R.sjs = {
    title: "SJS",
    majors: [
      { name:"รูปร่าง", sub:["รูปร่าง:วงกลมคล้ายเป้าธนู (ไม่ครบ 3 ชั้น)","อาการผิว:ผิวหนังหลุดลอก"]},
      { name:"สี", sub:["สี:ดำ/คล้ำ","สี:เทา","สี:แดง"]},
      { name:"ลักษณะสำคัญ", weight:3, sub:["BSA:<=10%"]},
      { name:"อาการผิว", sub:["อาการผิว:น้ำเหลือง","ตุ่มน้ำ:เล็ก","ตุ่มน้ำ:กลาง","ตุ่มน้ำ:ใหญ่"]},
      { name:"อาการ", sub:["อาการผิว:สะเก็ด"]},
      { name:"ตำแหน่ง", sub:["ตำแหน่ง:ลำตัว"]},
      { name:"เวลา", sub:["เวลา:1-6h","เวลา:6-24h","เวลา:1w","เวลา:2w","เวลา:3w","เวลา:<=1h"]},
      { name:"ระบบอื่น", sub:["ระบบอื่น:ไข้","ระบบอื่น:ปวดเมื่อยกล้ามเนื้อ","ระบบอื่น:คลื่นไส้อาเจียน","ระบบอื่น:เลือดออกในทางเดินอาหาร"]},
      { name:"อวัยวะ", sub:["ตำแหน่ง:ริมฝีปาก","ตำแหน่ง:รอบดวงตา","ตำแหน่ง:ลำตัว","ตำแหน่ง:แขน","ตำแหน่ง:ขา","ตำแหน่ง:หน้า","ตำแหน่ง:มือ","ตำแหน่ง:เท้า"]},
      { name:"เยื่อบุ", sub:["เยื่อบุ:>1ตำแหน่ง"]}, // ไว้รองรับหากหน้า 1 เก็บค่าเยื่อบุ
    ]
  };

  R.ten = {
    title: "TEN",
    majors: [
      { name:"รูปร่าง", sub:["รูปร่าง:ผื่นแดง","รูปร่าง:ปื้นแดง","รูปร่าง:วงกลมคล้ายเป้าธนู (ไม่ครบ 3 ชั้น)"]},
      { name:"สี", sub:["สี:แดง","สี:ดำ/คล้ำ"]},
      { name:"ลักษณะสำคัญ", weight:3, sub:["BSA:>=30%"]},
      { name:"อาการผิว", sub:["ตุ่มน้ำ:ใหญ่","อาการผิว:น้ำเหลือง","อาการผิว:สะเก็ด"]},
      { name:"อาการพบน้อย", sub:["สี:ซีด","ระบบอื่น:โลหิตจาง","ระบบอื่น:เลือดออกในทางเดินอาหาร","ระบบอื่น:กลืนลำบาก"]},
      { name:"ตำแหน่ง", sub:["ตำแหน่ง:ลำตัว","ตำแหน่ง:แขน","ตำแหน่ง:ขา","ตำแหน่ง:หน้า","ตำแหน่ง:มือ","ตำแหน่ง:เท้า","ตำแหน่ง:ศีรษะ","ตำแหน่ง:ทั่วร่างกาย","ตำแหน่ง:ริมฝีปาก"]},
      { name:"เวลา", sub:["เวลา:1w","เวลา:2w","เวลา:3w"]},
      { name:"ระบบอื่น", sub:["ระบบอื่น:ไข้","ระบบอื่น:ปวดเมื่อยกล้ามเนื้อ","ระบบอื่น:คลื่นไส้อาเจียน","ระบบอื่น:เจ็บคอ","ระบบอื่น:ปวดข้อ","ระบบอื่น:ท้องเสีย","ระบบอื่น:เยื่อบุตาอักเสบ"]},
      { name:"อวัยวะ", sub:["อวัยวะ:ไตวาย","อวัยวะ:ตับอักเสบ","อวัยวะ:ปอดอักเสบ"]},
      { name:"Lab", sub:["Lab:CrHigh","Lab:protein+","Lab:SpO2<94","Lab:LFT>=2xULN","Lab:LFT>=40"]},
    ]
  };

  R.dress = {
    title: "DRESS",
    majors: [
      { name:"รูปร่าง", sub:["รูปร่าง:ผื่นแดง","รูปร่าง:ปื้นแดง"]},
      { name:"สี", sub:["สี:แดง"]},
      { name:"ลักษณะสำคัญ", weight:3, sub:["Lab:Eosinophil>=10%","Lab:atypicalLymph"]}, // atypical lymph ถ้ามีใน page3 ให้ map เป็นแท็กนี้
      { name:"อาการผิว", sub:["ตุ่มน้ำ:เล็ก","ตุ่มน้ำ:กลาง","ตุ่มน้ำ:ใหญ่","อาการผิว:ปื้น/จ้ำเลือด"]},
      { name:"ตำแหน่ง", sub:["ตำแหน่ง:หน้า","ตำแหน่ง:ลำตัว","ตำแหน่ง:แขน","ตำแหน่ง:ขา"]},
      { name:"ระบบอื่น", sub:["ระบบอื่น:ไข้"]},
      { name:"เวลา", sub:["เวลา:1w","เวลา:2w","เวลา:3w","เวลา:4w","เวลา:5w","เวลา:6w"]},
      { name:"Lab", sub:["Lab:LFT>=2xULN","Lab:LFT>=40","Lab:CrHigh","Lab:protein+","Lab:SpO2<94","Lab:EKGผิดปกติ","Lab:Troponinสูง"]},
      { name:"อวัยวะ", sub:["อวัยวะ:ต่อมน้ำเหลืองโต","อวัยวะ:ตับอักเสบ","อวัยวะ:ไตอักเสบ","อวัยวะ:ไตวาย","อวัยวะ:ปอดอักเสบ","อวัยวะ:กล้ามเนื้อหัวใจอักเสบ","อวัยวะ:ต่อมไทรอยด์อักเสบ"]},
    ]
  };

  R.em = {
    title: "Erythema multiforme (EM)",
    majors: [
      { name:"รูปร่าง", sub:["รูปร่าง:ตุ่มนูน","รูปร่าง:ขอบวงนูนแดงด้านในเรียบ"]},
      { name:"สี", sub:["สี:แดง","สี:แดงซีด"]},
      { name:"ลักษณะสำคัญ", weight:3, sub:["รูปร่าง:วงกลม 3 ชั้น (เป้าธนู)","รูปร่าง:วงกลม 3 ชั้น"]},
      { name:"อาการผิว", sub:["ตุ่มน้ำ:เล็ก","ตุ่มน้ำ:กลาง","อาการผิว:พอง"]},
      { name:"อาการ", sub:["อาการผิว:สะเก็ด"]},
      { name:"เวลา", sub:["เวลา:1-6h","เวลา:6-24h","เวลา:1w"]},
      { name:"ตำแหน่งเยื่อบุ", sub:["ตำแหน่ง:ช่องปาก","ตำแหน่ง:จมูก","ตำแหน่ง:ทวาร","ตำแหน่ง:อวัยวะเพศ"]},
      { name:"ระบบอื่น", sub:["ระบบอื่น:ไข้","ระบบอื่น:อ่อนเพลีย","ระบบอื่น:ปวดเมื่อยกล้ามเนื้อ","ระบบอื่น:เจ็บคอ","ระบบอื่น:ปวดข้อ"]},
      { name:"ตำแหน่งร่างกาย", sub:["ตำแหน่ง:มือ","ตำแหน่ง:เท้า","ตำแหน่ง:แขน","ตำแหน่ง:ขา","ตำแหน่ง:หน้า","ตำแหน่ง:ลำตัว","ตำแหน่ง:หลัง","ตำแหน่ง:ลำคอ"]},
    ]
  };

  R.photosensitivity = {
    title: "Photosensitivity drug eruption",
    majors: [
      { name:"รูปร่าง", sub:["รูปร่าง:ขอบเขตชัดเจน","รูปร่าง:ปื้นแดง","อาการผิว:จุดเล็กแดง"]},
      { name:"สี", sub:["สี:ดำ/คล้ำ","สี:แดง"]},
      { name:"ลักษณะสำคัญ", weight:2, sub:["สี:แดงไหม้"]},
      { name:"อาการผิว", sub:["อาการผิว:น้ำเหลือง","อาการผิว:สะเก็ด"]},
      { name:"อาการอาจพบ", sub:["ตุ่มน้ำ:เล็ก","ตุ่มน้ำ:กลาง","ตุ่มน้ำ:ใหญ่","อาการผิว:ลอก","อาการผิว:ขุย","อาการผิว:คัน"]},
      { name:"ตำแหน่ง", sub:["ตำแหน่ง:หน้า","ตำแหน่ง:หน้าอก","ตำแหน่ง:มือ","ตำแหน่ง:แขน","ตำแหน่ง:ขา"]},
      { name:"เวลา", sub:["เวลา:1-6h","เวลา:6-24h","เวลา:1w","เวลา:<=1h"]},
      { name:"อาการเด่น", weight:2, sub:["อาการผิว:แสบ"]},
    ]
  };

  R.exfoliative = {
    title: "Exfoliative dermatitis",
    majors: [
      { name:"รูปร่าง", sub:["อาการผิว:ตึง"]},
      { name:"สี", sub:["สี:แดง"]},
      { name:"ลักษณะสำคัญ", weight:3, sub:["อาการผิว:แห้ง"]},
      { name:"อาการผิว(เด่น)", weight:3, sub:["อาการผิว:ขุย"]},
      { name:"อาการอื่น", sub:["อาการผิว:คัน"]},
      { name:"ตำแหน่ง", sub:["ตำแหน่ง:ทั่วร่างกาย","ตำแหน่ง:มือ","ตำแหน่ง:เท้า","ตำแหน่ง:ศีรษะ"]},
      { name:"เวลา", sub:["เวลา:3w","เวลา:1-6h","เวลา:6-24h","เวลา:1w","เวลา:2w","เวลา:4w"]},
      { name:"ระบบอื่น", sub:["ระบบอื่น:ไข้","ระบบอื่น:หนาวสั่น","ระบบอื่น:อ่อนเพลีย","ระบบอื่น:ดีซ่าน"]},
      { name:"อวัยวะ", sub:["อวัยวะ:ต่อมน้ำเหลืองโต","อวัยวะ:ตับโต","อวัยวะ:ม้ามโต","อวัยวะ:ขาบวม"]},
      { name:"ลักษณะเด่น", weight:3, sub:["อาการผิว:มันเงา","อาการผิว:ลอก"]},
    ]
  };

  R.eczematous = {
    title: "Eczematous drug eruption",
    majors: [
      { name:"รูปร่าง", sub:["รูปร่าง:ตุ่มนูน","รูปร่าง:ปื้นแดง"]},
      { name:"สี", sub:["สี:แดง"]},
      { name:"ลักษณะสำคัญ", weight:2, sub:["อาการผิว:คัน"]},
      { name:"อาการผิวเพิ่ม", sub:["รูปร่าง:นูนหนา","อาการผิว:ผื่นแดง"]},
      { name:"อาการอื่น", sub:["อาการผิว:จุดเล็กแดง","อาการผิว:น้ำเหลือง","อาการผิว:สะเก็ด"]},
      { name:"ตำแหน่ง", sub:["ตำแหน่ง:ลำตัว","ตำแหน่ง:แขน","ตำแหน่ง:ขา","ตำแหน่ง:หน้า","ตำแหน่ง:ลำคอ"]},
      { name:"เวลา", sub:["เวลา:1-6h","เวลา:6-24h","เวลา:1w","เวลา:2w","เวลา:3w"]},
      { name:"อาการอาจพบ", weight:2, sub:["อาการผิว:ขุย","อาการผิว:แห้ง","อาการผิว:ลอก"]},
      { name:"การกระจาย", sub:["การกระจาย:สมมาตร"]},
      { name:"ตุ่มน้ำ", sub:["ตุ่มน้ำ:เล็ก","ตุ่มน้ำ:กลาง","ตุ่มน้ำ:ใหญ่"]},
    ]
  };

  R.bullous = {
    title: "Bullous Drug Eruption",
    majors: [
      { name:"รูปร่าง", sub:["ตุ่มน้ำ:เล็ก","อาการผิว:พอง","อาการผิว:ตึง"]},
      { name:"สี", sub:["สี:แดง"]},
      { name:"ลักษณะสำคัญ", weight:2, sub:["ตุ่มน้ำ:กลาง","ตุ่มน้ำ:ใหญ่"]},
      { name:"อาการผิว", sub:["อาการผิว:เจ็บ","อาการผิว:แสบ"]},
      { name:"สีด้านใน", weight:3, sub:["สี:ใส"]}, // ถ้ามี field แยก "ใส"
      { name:"ตำแหน่ง", sub:["ตำแหน่ง:ลำตัว","ตำแหน่ง:แขน","ตำแหน่ง:ขา","ตำแหน่ง:เท้า"]},
      { name:"เวลา", sub:["เวลา:1-6h","เวลา:6-24h","เวลา:1w","เวลา:2w","เวลา:3w"]},
    ]
  };

  R.serumSickness = {
    title: "Serum sickness",
    majors: [
      { name:"อาการ", sub:["รูปร่าง:ตุ่มนูน","สี:แดง","อาการผิว:บวม","อาการผิว:คัน"]},
      { name:"อาการเด่น", weight:2, sub:["ระบบอื่น:ไข้"]},
      { name:"อวัยวะ", sub:["อวัยวะ:ต่อมน้ำเหลืองโต","อวัยวะ:ไตอักเสบ"]},
      { name:"Lab", sub:["Lab:protein+","Lab:C3ต่ำ","Lab:C4ต่ำ"]}, // ถ้ากรอก C3/C4 ให้ map เป็นแท็กนี้
      { name:"เวลา", sub:["เวลา:1-6h","เวลา:6-24h","เวลา:1w","เวลา:2w","เวลา:3w"]},
      { name:"Lab2", sub:["Lab:RBC5-10/HPF"]},
      { name:"ระบบอื่น(เด่น)", weight:2, sub:["ระบบอื่น:ปวดข้อ","ระบบอื่น:ข้ออักเสบ"]},
      { name:"ตำแหน่ง", sub:["ตำแหน่ง:รอบดวงตา","ตำแหน่ง:มือ","ตำแหน่ง:เท้า","ตำแหน่ง:ลำตัว","ตำแหน่ง:แขน","ตำแหน่ง:ขา"]},
    ]
  };

  R.vasculitis = {
    title: "Vasculitis",
    majors: [
      { name:"อาการ", sub:["รูปร่าง:ตุ่มนูน","รูปร่าง:ผื่นแดง","สี:แดง"]},
      { name:"ระบบอื่น", sub:["ระบบอื่น:ไข้","ระบบอื่น:ปวดข้อ","ระบบอื่น:ข้ออักเสบ","ระบบอื่น:ปวดกล้ามเนื้อ","อวัยวะ:ต่อมน้ำเหลืองโต"]},
      { name:"อวัยวะ", sub:["อวัยวะ:ไตอักเสบ","อวัยวะ:ไตวาย","อวัยวะ:ต่อมน้ำเหลืองโต"]},
      { name:"อาการเด่น", sub:["ระบบอื่น:ไอเป็นเลือด","ระบบอื่น:ถุงลมเลือดออก","ระบบอื่น:เลือดออกในทางเดินอาหาร"]},
      { name:"เวลา", sub:["เวลา:1-6h","เวลา:6-24h","เวลา:1w","เวลา:2w","เวลา:3w"]},
      { name:"Lab2", sub:["Lab:protein+","Lab:C3ต่ำ","Lab:C4ต่ำ"]},
      { name:"Lab3", sub:["Lab:CrHigh"]},
      { name:"ลักษณะเด่น", weight:2, sub:["อาการผิว:จ้ำเลือด","ตำแหน่ง:ขา"]},
    ]
  };

  R.hemolytic = {
    title: "Hemolytic anemia",
    majors: [
      { name:"อาการเด่น", weight:2, sub:["สี:ซีด","ระบบอื่น:ดีซ่าน"]},
      { name:"ระบบอื่นเด่น", weight:3, sub:["ระบบอื่น:ปัสสาวะสีชา/สีดำ"]},
      { name:"อวัยวะ", sub:["อวัยวะ:ไตวาย"]},
      { name:"Lab", sub:["Lab:IgG+","Lab:C3+"]},
      { name:"เวลา", sub:["เวลา:1-6h","เวลา:6-24h","เวลา:1w"]},
      { name:"Lab2เด่น", weight:3, sub:["Lab:HB<10"]}, // แทนเงื่อนไข Hb ลดลง 2–3 g/dL
      { name:"Lab3", sub:["Lab:LDHHigh"]},
      { name:"BP", sub:["ระบบอื่น:BPต่ำ","ระบบอื่น:BPลง40mmHg"]},
      { name:"อื่น", sub:["ระบบอื่น:ปวดหลังส่วนเอว","ระบบอื่น:ปวดแน่นชายโครงขวา"]},
    ]
  };

  R.pancytopenia = {
    title: "Pancytopenia",
    majors: [
      { name:"อาการ", sub:["สี:ซีด","ระบบอื่น:อ่อนเพลีย"]},
      { name:"ระบบอื่น", sub:["ระบบอื่น:ปัสสาวะสีชา/สีดำ","ระบบอื่น:หนาวสั่น","ระบบอื่น:เจ็บคอ","ระบบอื่น:แผลในปาก"]},
      { name:"อาการผิดปกติ(เด่น)", weight:3, sub:["อาการผิว:จุดเลือดออก","อาการผิว:ฟกช้ำ","ระบบอื่น:เลือดกำเดาไหล","ระบบอื่น:เหงือกเลือดออก"]},
      { name:"Vitals", sub:["Lab:HR>100"]},
      { name:"เวลา", sub:["เวลา:1-6h","เวลา:6-24h","เวลา:1w","เวลา:2w"]},
      { name:"Lab2", sub:["ระบบอื่น:ไข้"]},
      { name:"Hb", weight:2, sub:["Lab:HB<10"]},
      { name:"Hct", weight:2, sub:["Lab:Hct<30"]},
      { name:"WBC", weight:2, sub:["Lab:WBC<4000","Lab:WBC<4k"]}, // ถ้า UI ใส่ค่าตัวเลข ต่ำกว่า 4000 ให้แม็ปแท็กนี้
      { name:"Platelet", weight:2, sub:["Lab:PLT<100k"]},
    ]
  };

  R.neutropenia = {
    title: "Neutropenia",
    majors: [
      { name:"อาการ", sub:["ระบบอื่น:หนาวสั่น","ระบบอื่น:เจ็บคอ","ระบบอื่น:แผลในปาก"]},
      { name:"ระบบอื่น", sub:["ระบบอื่น:ไข้","ระบบอื่น:แผลในปาก","ระบบอื่น:ทอนซิลอักเสบ"]},
      { name:"อวัยวะ", sub:["อวัยวะ:ปอดอักเสบ"]},
      { name:"Labเด่น", weight:4, sub:["Lab:ANC<1500"]}, // หากหน้า 3 บันทึก ANC ให้ map แท็กนี้
    ]
  };

  R.thrombocytopenia = {
    title: "Thrombocytopenia",
    majors: [
      { name:"อาการเด่น", weight:2, sub:["อาการผิว:จุดเลือดออก","อาการผิว:ปื้น/จ้ำเลือด"]},
      { name:"ระบบอื่น", sub:["ระบบอื่น:เหงือกเลือดออก","ระบบอื่น:เลือดออกในทางเดินอาหาร","ระบบอื่น:ปัสสาวะเลือดออก"]},
      { name:"Lab", sub:["Lab:PLT<150k"]},
      { name:"เวลา", sub:["เวลา:1-6h","เวลา:6-24h","เวลา:1w"]},
    ]
  };

  R.nephritis = {
    title: "Nephritis",
    majors: [
      { name:"อาการ", sub:["ระบบอื่น:ไข้","ระบบอื่น:ปวดข้อ","ระบบอื่น:อ่อนเพลีย"]},
      { name:"ระบบอื่น", sub:["ระบบอื่น:ปัสสาวะออกน้อย","ระบบอื่น:ปัสสาวะขุ่น"]},
      { name:"อวัยวะ", sub:["อวัยวะ:ขาบวม","อาการผิว:บวม"]},
      { name:"Labเด่น", weight:3, sub:["Lab:CrHigh","Lab:eGFR<60"]},
      { name:"เวลา", sub:["เวลา:1-6h","เวลา:6-24h","เวลา:1w","เวลา:2w"]},
    ]
  };

  // ---------- ENGINE ----------
  function evalADR(rule, tagSet){
    let denom = 0;
    let score = 0;
    const detail = [];
    for (const m of rule.majors) {
      const w = Number(m.weight || 1);
      denom += w;
      const hit = groupHit(tagSet, m.sub);
      if (hit) { score += w; detail.push({name:m.name, weight:w, hit:true}); }
      else { detail.push({name:m.name, weight:w, hit:false}); }
    }
    const pct = denom>0 ? Math.round((score/denom)*100) : 0;
    return { pct, score, denom, detail };
  }

  function rankAll(d){
    const tags = collectTags(d || window.drugAllergyData || {});
    const results = [];
    Object.keys(R).forEach(key => {
      const out = evalADR(R[key], tags);
      results.push({ key, title: R[key].title, ...out });
    });
    results.sort((a,b)=> b.pct - a.pct || b.score - a.score);
    return { tags: Array.from(tags), results };
  }

  // ---------- EXPORT ----------
  window.brainRules = R;
  window.brainRank = function(){
    try { return rankAll(window.drugAllergyData || {}); }
    catch(e){ console.error("[brainRules] rank error", e); return {tags:[], results:[]}; }
  };

  // ตัวช่วยให้ brain.js (ถ้ามีเรียก) เรนเดอร์ได้
  window.brainComputeAndRender && document.addEventListener("da:update", function(){
    try { window.brainComputeAndRender(); } catch(_) {}
  });

})();

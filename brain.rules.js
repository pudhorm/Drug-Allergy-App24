// ===================== brain.rules.js (REPLACE WHOLE FILE) =====================
(function () {
  // ---------- SAFE GUARD ----------
  if (window.__brainRulesBound) return;
  window.__brainRulesBound = true;

  // ---------- HELPERS ----------
  function asArray(v){ return Array.isArray(v) ? v : (v ? [v] : []); }
  function truthy(x){ return !!x; }
  function num(v){ const n=Number(String(v??"").replace(/[, ]+/g,"")); return Number.isFinite(n)?n:NaN; }

  // ---------- TAG COLLECTOR: รวมแท็กจากหน้า 1–3 ----------
  function collectTags(d){
    const tags = new Set();
    const p1 = d.page1 || {};
    const p2 = d.page2 || {};
    const p3 = d.page3 || {};

    // ----- หน้า 1: รูปร่าง/สี/อาการผิว/ตำแหน่ง/เวลา -----
    asArray(p1.rashShapes).forEach(s => { if(!s) return; tags.add("รูปร่าง:"+String(s).trim()); });
    asArray(p1.rashColors).forEach(c => { if(!c) return; tags.add("สี:"+String(c).trim()); });

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

    asArray(p1.locations).forEach(loc => { if(!loc) return; tags.add("ตำแหน่ง:"+String(loc).trim()); });
    if (p1.distribution?.symmetric) tags.add("การกระจาย:สมมาตร");

    if (p1.onset) {
      const o = String(p1.onset).trim();
      if (/ภายใน\s*1\s*ชั่วโมง/.test(o)) tags.add("เวลา:<=1h");
      if (/1\s*–?\s*6\s*ชั่วโมง|1-6\s*ชั่วโมง/.test(o)) tags.add("เวลา:1-6h");
      if (/6\s*–?\s*24\s*ชั่วโมง|6-24/.test(o)) tags.add("เวลา:6-24h");
      if (/1\s*สัปดาห์/.test(o)) tags.add("เวลา:1w");
      if (/2\s*สัปดาห์/.test(o)) tags.add("เวลา:2w");
      if (/3\s*สัปดาห์/.test(o)) tags.add("เวลา:3w");
      if (/4\s*สัปดาห์/.test(o)) tags.add("เวลา:4w");
      if (/5\s*สัปดาห์/.test(o)) tags.add("เวลา:5w");
      if (/6\s*สัปดาห์/.test(o)) tags.add("เวลา:6w");
    }

    // ----- หน้า 2: ระบบอื่น ๆ / Vitals -----
    const gResp = p2.resp || {};
    if (gResp.wheeze || gResp["หายใจมีเสียงวี๊ด"]?.checked) tags.add("ระบบอื่น:หายใจมีเสียงวี๊ด");
    if (gResp.dyspnea || gResp["หอบเหนื่อย/หายใจลำบาก (RR>21 หรือ HR>100 หรือ SpO2<94%)"]?.checked) tags.add("ระบบอื่น:หายใจลำบาก");
    if (gResp.tachypnea) tags.add("ระบบอื่น:หายใจเร็ว");

    const gCV = p2.cv || {};
    if (gCV.hypotension || gCV["BP ต่ำ (<90/60)"]?.checked) tags.add("ระบบอื่น:BPต่ำ");
    if (gCV["BP ลดลง ≥30% ของ baseline systolic เดิม"]?.checked) tags.add("ระบบอื่น:BPลง30%");
    if (gCV["BP ลดลง ≥40 mmHg ของ baseline systolic เดิม"]?.checked) tags.add("ระบบอื่น:BPลง40mmHg");
    if (gCV.tachycardia) tags.add("Lab:HR>100");

    const gGI = p2.gi || {};
    if (gGI["ท้องเสีย"]?.checked) tags.add("ระบบอื่น:ท้องเสีย");
    if (gGI["กลืนลำบาก"]?.checked) tags.add("ระบบอื่น:กลืนลำบาก");
    if (gGI["ปวดบิดท้อง"]?.checked) tags.add("ระบบอื่น:ปวดบิดท้อง");
    if (gGI["คลื่นไส้/อาเจียน"]?.checked) tags.add("ระบบอื่น:คลื่นไส้อาเจียน");

    const gEye = p2.eye || {};
    if (gEye["เยื่อบุตาอักเสบ (ตาแดง)"]?.checked) tags.add("ระบบอื่น:เยื่อบุตาอักเสบ");

    const gOther = p2.other || {};
    if (gOther["ไข้ Temp > 37.5 °C"]?.checked) tags.add("ระบบอื่น:ไข้");
    if (gOther["อ่อนเพลีย"]?.checked) tags.add("ระบบอื่น:อ่อนเพลีย");

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

    // ----- หน้า 3: LAB/VITALS -----
    const eosPct  = num(p3?.cbc?.eos?.value);
    if (Number.isFinite(eosPct) && eosPct >= 5) tags.add("Lab:Eosinophil>=5%");
    if (Number.isFinite(eosPct) && eosPct >= 10) tags.add("Lab:Eosinophil>=10%");
    const wbc     = num(p3?.cbc?.wbc?.value);
    if (Number.isFinite(wbc) && wbc > 11000) tags.add("Lab:WBC>11000");
    if (Number.isFinite(wbc) && wbc < 4000) tags.add("Lab:WBC<4000");
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
      // กฎ TEN/DRESS/Nephritis ต้องการเงื่อนไขเพิ่มขึ้นจาก baseline → ให้ติ๊กไว้ที่หน้า 2/รายละเอียด
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

    // Complement
    const c3 = num(p3?.immuno?.c3?.value);
    if (Number.isFinite(c3) && c3 < 90) tags.add("Lab:C3ต่ำ");
    const c4 = num(p3?.immuno?.c4?.value);
    if (Number.isFinite(c4) && c4 < 10) tags.add("Lab:C4ต่ำ");

    // Atypical lymphocyte
    const atyp = num(p3?.cbc?.atypicalLymph?.value);
    if (Number.isFinite(atyp) && atyp > 0) tags.add("Lab:atypicalLymph");

    // LDH (ถ้าใส่เป็น xULN ให้ติ๊กในรายละเอียดหน้า 2; ที่นี่ flag ทั่วไป)
    const ldh = num(p3?.others?.ldh?.value);
    if (Number.isFinite(ldh) && ldh > 2) tags.add("Lab:LDHHigh");

    // Cardiac
    const troponin = num(p3?.cardiac?.troponin?.value);
    if (Number.isFinite(troponin) && troponin > 0.04) tags.add("Lab:Troponinสูง");
    if (p3?.cardiac?.ekgAbnormal) tags.add("Lab:EKGผิดปกติ");

    return tags;
  }

  // ช่วยเช็คว่ามีแท็กย่อย “ตรงอย่างน้อย 1 ตัว” ในข้อใหญ่นั้นไหม
  function hitAny(tagSet, needles){ for (const t of needles) if (tagSet.has(t)) return true; return false; }

  // ---------- นิยามกฎ 21 แบบ (สูตร C) ----------
  // โครง: { key, title, majors:[ { name, sub:[tags...], weight? } ] }
  // ตัวหาร = majors.length, ตัวเศษ = ผลรวม weight ของ “ข้อใหญ่ที่เข้าเงื่อนไข”
  const ADR = [];

  // 1) Urticaria (7 ข้อใหญ่; x2 ที่ "ลักษณะสำคัญ")
  ADR.push({
    key: "urticaria", title: "Urticaria",
    majors: [
      { name:"รูปร่าง", sub:["รูปร่าง:ขอบหยัก","รูปร่าง:วงกลม","รูปร่าง:ขอบวงนูนแดงด้านในเรียบ"] },
      { name:"สี", sub:["สี:แดง","สี:แดงซีด","สี:ซีด","สี:สีผิวปกติ"] },
      { name:"ลักษณะสำคัญ", sub:["รูปร่าง:ตุ่มนูน","รูปร่าง:ปื้นนูน"], weight:2 },
      { name:"อาการผิว", sub:["อาการผิว:คัน"] },
      { name:"อาการพบน้อย", sub:["อาการผิว:บวม"] },
      { name:"ตำแหน่ง", sub:["ตำแหน่ง:ทั่วร่างกาย","ตำแหน่ง:มือ","ตำแหน่ง:เท้า","ตำแหน่ง:แขน","ตำแหน่ง:ขา","ตำแหน่ง:หน้า","ตำแหน่ง:rอบดวงตา","ตำแหน่ง:รอบดวงตา","ตำแหน่ง:ลำคอ","ตำแหน่ง:ลำตัว","ตำแหน่ง:หลัง"] },
      { name:"เวลา", sub:["เวลา:<=1h"] },
    ]
  });

  // 2) Anaphylaxis (7 ข้อใหญ่; x2 ที่ "ลักษณะสำคัญ")
  ADR.push({
    key:"anaphylaxis", title:"Anaphylaxis",
    majors:[
      { name:"รูปร่าง", sub:["รูปร่าง:ตุ่มนูน","รูปร่าง:ปื้นนูน","อาการผิว:บวม","รูปร่าง:นูนหนา","อาการผิว:ตึง"] },
      { name:"ลักษณะสำคัญ", sub:["ระบบอื่น:หายใจมีเสียงวี๊ด","ระบบอื่น:หายใจลำบาก"], weight:2 },
      { name:"อาการผิว", sub:["อาการผิว:คัน","สี:แดง","สี:สีผิวปกติ"] },
      { name:"อาการพบน้อย", sub:["ระบบอื่น:ท้องเสีย","ระบบอื่น:กลืนลำบาก","ระบบอื่น:ปวดบิดท้อง","ระบบอื่น:คลื่นไส้อาเจียน"] },
      { name:"เวลา", sub:["เวลา:<=1h","เวลา:1-6h"] },
      { name:"ระบบอื่น", sub:["ระบบอื่น:BPต่ำ","ระบบอื่น:BPลง40mmHg","ระบบอื่น:BPลง30%"] },
      { name:"Lab/Vital", sub:["Lab:HR>100","Lab:SpO2<94"] },
    ]
  });

  // 3) Angioedema (7 ข้อใหญ่; x2 ที่ "ลักษณะสำคัญ")
  ADR.push({
    key:"angioedema", title:"Angioedema",
    majors:[
      { name:"รูปร่าง", sub:["รูปร่าง:นูนหนา","รูปร่าง:ขอบไม่ชัดเจน"] },
      { name:"สี", sub:["สี:สีผิวปกติ","สี:แดง"] },
      { name:"ลักษณะสำคัญ", sub:["อาการผิว:บวม"], weight:2 },
      { name:"อาการผิว", sub:["อาการผิว:ตึง"] },
      { name:"อาการพบน้อย", sub:["อาการผิว:คัน","อาการผิว:ปวด","อาการผิว:แสบ"] },
      { name:"ตำแหน่ง", sub:["ตำแหน่ง:ริมฝีปาก","ตำแหน่ง:รอบดวงตา","ตำแหน่ง:ลิ้น","ตำแหน่ง:อวัยวะเพศ"] },
      { name:"เวลา", sub:["เวลา:<=1h"] },
    ]
  });

  // 4) Maculopapular rash (8 ข้อใหญ่; x2 ที่ "ลักษณะสำคัญ")
  ADR.push({
    key:"maculopapular", title:"Maculopapular rash",
    majors:[
      { name:"รูปร่าง", sub:["รูปร่าง:ปื้นแดง","รูปร่าง:ปื้นนูน","รูปร่าง:ตุ่มนูน"] },
      { name:"สี", sub:["สี:แดง"] },
      { name:"ลักษณะสำคัญ", sub:["อาการผิว:จุดเล็กแดง"], weight:2 },
      { name:"อาการผิว", sub:["อาการผิว:คัน"] },
      { name:"อาการพบน้อย", sub:["ระบบอื่น:ไข้","Lab:Eosinophil>=5%"] },
      { name:"ตำแหน่ง", sub:["การกระจาย:สมมาตร","ตำแหน่ง:ลำตัว","ตำแหน่ง:แขน","ตำแหน่ง:ใบหน้า","ตำแหน่ง:ลำคอ"] },
      { name:"เวลา", sub:["เวลา:1-6h","เวลา:6-24h","เวลา:1w","เวลา:2w"] },
      { name:"อวัยวะ", sub:["อวัยวะ:ต่อมน้ำเหลืองโต","ระบบอื่น:ข้ออักเสบ","อวัยวะ:ไตอักเสบ","อวัยวะ:ตับอักเสบ"] },
    ]
  });

  // 5) Fixed drug eruption (9 ข้อใหญ่; x3 ที่ "ลักษณะสำคัญ")
  ADR.push({
    key:"fde", title:"Fixed drug eruption",
    majors:[
      { name:"รูปร่าง", sub:["รูปร่าง:วงกลม","รูปร่าง:วงรี"] },
      { name:"สี", sub:["สี:แดง","สี:ดำ","สี:ดำ/คล้ำ","สี:คล้ำ","สี:ม่วง","สี:เทา"] },
      { name:"ลักษณะสำคัญ", sub:["สี:ม่วง","สี:ดำ/คล้ำ","สี:คล้ำ"], weight:3 },
      { name:"อาการผิว", sub:["อาการผิว:ผิวหนังหลุดลอกตรงกลางผื่น","อาการผิว:เจ็บ","อาการผิว:แสบ","อาการผิว:ตึง"] },
      { name:"อาการพบน้อย", sub:["อาการผิว:บวม","ตุ่มน้ำ:ใหญ่","ตุ่มน้ำ:กลาง","ตุ่มน้ำ:เล็ก","อาการผิว:พอง"] },
      { name:"ตำแหน่ง", sub:["ตำแหน่ง:ริมฝีปาก","ตำแหน่ง:หน้า","ตำแหน่ง:มือ","ตำแหน่ง:เท้า","ตำแหน่ง:แขน","ตำแหน่ง:ขา","ตำแหน่ง:อวัยวะเพศ","ตำแหน่ง:ตำแหน่งเดิมกับครั้งก่อน"] },
      { name:"เวลา", sub:["เวลา:1w","เวลา:2w"] },
      { name:"ระบบอื่น", sub:["ระบบอื่น:ไข้","ระบบอื่น:คลื่นไส้อาเจียน","ระบบอื่น:ปวดเมื่อยกล้ามเนื้อ"] },
      { name:"ขอบ", sub:["รูปร่าง:ขอบเรียบ","รูปร่าง:ขอบเขตชัดเจน"] },
    ]
  });

  // 6) AGEP (9 ข้อใหญ่; x3 ที่ "ลักษณะสำคัญ")
  ADR.push({
    key:"agep", title:"AGEP",
    majors:[
      { name:"รูปร่าง", sub:["รูปร่าง:ผื่นแดง","สี:แดง"] },
      { name:"สี", sub:["สี:แดง","สี:เหลือง"] },
      { name:"ลักษณะสำคัญ", sub:["อาการผิว:ตุ่มหนอง"], weight:3 },
      { name:"อาการผิว", sub:["อาการผิว:บวม","อาการผิว:คัน","อาการผิว:เจ็บ"] },
      { name:"อาการพบน้อย", sub:["อาการผิว:ปื้น/จ้ำเลือด","อาการผิว:แห้ง","อาการผิว:ลอก","อาการผิว:ขุย"] },
      { name:"ตำแหน่ง", sub:["ตำแหน่ง:หน้า","ตำแหน่ง:รักแร้","ตำแหน่ง:ทั่วร่างกาย","ตำแหน่ง:ขาหนีบ"] },
      { name:"เวลา", sub:["เวลา:6-24h","เวลา:1w","เวลา:2w","เวลา:3w"] },
      { name:"ระบบอื่น", sub:["ระบบอื่น:ไข้"] },
      { name:"Lab", sub:["Lab:WBC>11000","Lab:Neutrophil>75%"] },
    ]
  });

  // 7) SJS (10 ข้อใหญ่; x3 ที่ "ลักษณะสำคัญ")
  ADR.push({
    key:"sjs", title:"SJS",
    majors:[
      { name:"รูปร่าง", sub:["รูปร่าง:วงกลมคล้ายเป้าธนู (ไม่ครบ 3 ชั้น)","อาการผิว:ผิวหนังหลุดลอก"] },
      { name:"สี", sub:["สี:ดำ/คล้ำ","สี:เทา","สี:แดง"] },
      { name:"ลักษณะสำคัญ", sub:["BSA:<=10%"], weight:3 },
      { name:"อาการผิว", sub:["อาการผิว:น้ำเหลือง","ตุ่มน้ำ:เล็ก","ตุ่มน้ำ:กลาง","ตุ่มน้ำ:ใหญ่","อาการผิว:พอง"] },
      { name:"อาการ", sub:["อาการผิว:สะเก็ด"] },
      { name:"ตำแหน่ง", sub:["ตำแหน่ง:ลำตัว"] },
      { name:"เวลา", sub:["เวลา:<=1h","เวลา:1-6h","เวลา:6-24h","เวลา:1w","เวลา:2w","เวลา:3w"] },
      { name:"ระบบอื่น", sub:["ระบบอื่น:ไข้","ระบบอื่น:ปวดเมื่อยกล้ามเนื้อ","ระบบอื่น:คลื่นไส้อาเจียน","ระบบอื่น:เลือดออกในทางเดินอาหาร"] },
      { name:"อวัยวะ", sub:["ตำแหน่ง:ริมฝีปาก","ตำแหน่ง:รอบดวงตา","ตำแหน่ง:แขน","ตำแหน่ง:ขา","ตำแหน่ง:หน้า","ตำแหน่ง:มือ","ตำแหนง:มือ","ตำแหน่ง:เท้า"] },
      { name:"เยื่อบุ", sub:["เยื่อบุ:>1ตำแหน่ง"] },
    ]
  });

  // 8) TEN (10 ข้อใหญ่; x3 ที่ "ลักษณะสำคัญ")
  ADR.push({
    key:"ten", title:"TEN",
    majors:[
      { name:"รูปร่าง", sub:["รูปร่าง:ผื่นแดง","รูปร่าง:ปื้นแดง","รูปร่าง:วงกลมคล้ายเป้าธนู (ไม่ครบ 3 ชั้น)"] },
      { name:"สี", sub:["สี:แดง","สี:ดำ/คล้ำ"] },
      { name:"ลักษณะสำคัญ", sub:["BSA:>=30%"], weight:3 },
      { name:"อาการผิว", sub:["ตุ่มน้ำ:ใหญ่","อาการผิว:น้ำเหลือง","อาการผิว:สะเก็ด"] },
      { name:"อาการพบน้อย", sub:["สี:ซีด","ระบบอื่น:โลหิตจาง","ระบบอื่น:เลือดออกในทางเดินอาหาร","ระบบอื่น:กลืนลำบาก"] },
      { name:"ตำแหน่ง", sub:["ตำแหน่ง:ลำตัว","ตำแหน่ง:แขน","ตำแหน่ง:ขา","ตำแหน่ง:หน้า","ตำแหน่ง:มือ","ตำแหน่ง:เท้า","ตำแหน่ง:ศีรษะ","ตำแหน่ง:ทั่วร่างกาย","ตำแหน่ง:ริมฝีปาก"] },
      { name:"เวลา", sub:["เวลา:1w","เวลา:2w","เวลา:3w"] },
      { name:"ระบบอื่น", sub:["ระบบอื่น:ไข้","ระบบอื่น:ปวดเมื่อยกล้ามเนื้อ","ระบบอื่น:คลื่นไส้อาเจียน","ระบบอื่น:เจ็บคอ","ระบบอื่น:ปวดข้อ","ระบบอื่น:ท้องเสีย","ระบบอื่น:เยื่อบุตาอักเสบ"] },
      { name:"อวัยวะ", sub:["อวัยวะ:ไตวาย","อวัยวะ:ตับอักเสบ","อวัยวะ:ปอดอักเสบ"] },
      { name:"Lab", sub:["Lab:CrHigh","Lab:protein+","Lab:SpO2<94","Lab:LFT>=2xULN","Lab:LFT>=40"] },
    ]
  });

  // 9) DRESS (9 ข้อใหญ่; x3 ที่ "ลักษณะสำคัญ")
  ADR.push({
    key:"dress", title:"DRESS",
    majors:[
      { name:"รูปร่าง", sub:["รูปร่าง:ผื่นแดง","รูปร่าง:ปื้นแดง"] },
      { name:"สี", sub:["สี:แดง"] },
      { name:"ลักษณะสำคัญ", sub:["Lab:Eosinophil>=10%","Lab:atypicalLymph"], weight:3 },
      { name:"อาการผิว", sub:["ตุ่มน้ำ:เล็ก","ตุ่มน้ำ:กลาง","ตุ่มน้ำ:ใหญ่","อาการผิว:ปื้น/จ้ำเลือด"] },
      { name:"ตำแหน่ง", sub:["ตำแหน่ง:หน้า","ตำแหน่ง:ลำตัว","ตำแหน่ง:แขน","ตำแหน่ง:ขา"] },
      { name:"ระบบอื่น", sub:["ระบบอื่น:ไข้"] },
      { name:"เวลา", sub:["เวลา:1w","เวลา:2w","เวลา:3w","เวลา:4w","เวลา:5w","เวลา:6w"] },
      { name:"Lab", sub:["Lab:LFT>=2xULN","Lab:LFT>=40","Lab:CrHigh","Lab:protein+","Lab:SpO2<94","Lab:EKGผิดปกติ","Lab:Troponinสูง"] },
      { name:"อวัยวะ", sub:["อวัยวะ:ต่อมน้ำเหลืองโต","อวัยวะ:ตับอักเสบ","อวัยวะ:ไตอักเสบ","อวัยวะ:ไตวาย","อวัยวะ:ปอดอักเสบ","อวัยวะ:กล้ามเนื้อหัวใจอักเสบ","อวัยวะ:ต่อมไทรอยด์อักเสบ"] },
    ]
  });

  // 10) EM (9 ข้อใหญ่; x3 ที่ "ลักษณะสำคัญ")
  ADR.push({
    key:"em", title:"Erythema multiforme (EM)",
    majors:[
      { name:"รูปร่าง", sub:["รูปร่าง:ตุ่มนูน","รูปร่าง:ขอบวงนูนแดงด้านในเรียบ"] },
      { name:"สี", sub:["สี:แดง","สี:แดงซีด"] },
      { name:"ลักษณะสำคัญ", sub:["รูปร่าง:วงกลม 3 ชั้น (เป้าธนู)","รูปร่าง:วงกลม 3 ชั้น"], weight:3 },
      { name:"อาการผิว", sub:["อาการผิว:พอง","ตุ่มน้ำ:เล็ก","ตุ่มน้ำ:กลาง"] },
      { name:"อาการ", sub:["อาการผิว:สะเก็ด"] },
      { name:"เวลา", sub:["เวลา:1-6h","เวลา:6-24h","เวลา:1w"] },
      { name:"ตำแหน่งเยื่อบุ", sub:["ตำแหน่ง:ช่องปาก","ตำแหน่ง:จมูก","ตำแหน่ง:ทวาร","ตำแหน่ง:อวัยวะเพศ"] },
      { name:"ระบบอื่น", sub:["ระบบอื่น:ไข้","ระบบอื่น:อ่อนเพลีย","ระบบอื่น:ปวดเมื่อยกล้ามเนื้อ","ระบบอื่น:เจ็บคอ","ระบบอื่น:ปวดข้อ"] },
      { name:"ตำแหน่งร่างกาย", sub:["ตำแหน่ง:มือ","ตำแหน่ง:เท้า","ตำแหน่ง:แขน","ตำแหน่ง:ขา","ตำแหน่ง:หน้า","ตำแหน่ง:ลำตัว","ตำแหน่ง:หลัง","ตำแหน่ง:ลำคอ"] },
    ]
  });

  // 11) Photosensitivity (8 ข้อใหญ่; x2 ที่ "ลักษณะสำคัญ" และ "อาการเด่น")
  ADR.push({
    key:"photosensitivity", title:"Photosensitivity drug eruption",
    majors:[
      { name:"รูปร่าง", sub:["รูปร่าง:ขอบเขตชัดเจน","รูปร่าง:ขอบเขตชัด","รูปร่าง:ปื้นแดง","อาการผิว:จุดเล็กแดง","รูปร่าง:จุดเล็กแดง"] },
      { name:"สี", sub:["สี:ดำ/คล้ำ","สี:แดง"] },
      { name:"ลักษณะสำคัญ", sub:["สี:แดงไหม้"], weight:2 },
      { name:"อาการผิว", sub:["อาการผิว:น้ำเหลือง","อาการผิว:สะเก็ด"] },
      { name:"อาการอาจพบ", sub:["ตุ่มน้ำ:เล็ก","ตุ่มน้ำ:กลาง","ตุ่มน้ำ:ใหญ่","อาการผิว:ลอก","อาการผิว:ขุย","อาการผิว:คัน"] },
      { name:"ตำแหน่ง", sub:["ตำแหน่ง:หน้า","ตำแหน่ง:หน้าอก","ตำแหน่ง:มือ","ตำแหน่ง:แขน","ตำแหน่ง:ขา"] },
      { name:"เวลา", sub:["เวลา:1-6h","เวลา:6-24h","เวลา:1w","เวลา:<=1h"] },
      { name:"อาการเด่น", sub:["อาการผิว:แสบ"], weight:2 },
    ]
  });

  // 12) Exfoliative dermatitis (10 ข้อใหญ่; x3 ที่ 3,4,10)
  ADR.push({
    key:"exfoliative", title:"Exfoliative dermatitis",
    majors:[
      { name:"รูปร่าง", sub:["อาการผิว:ตึง"] },
      { name:"สี", sub:["สี:แดง"] },
      { name:"ลักษณะสำคัญ", sub:["อาการผิว:แห้ง"], weight:3 },
      { name:"อาการผิว(เด่น)", sub:["อาการผิว:ขุย"], weight:3 },
      { name:"อาการอื่น", sub:["อาการผิว:คัน"] },
      { name:"ตำแหน่ง", sub:["ตำแหน่ง:ทั่วร่างกาย","ตำแหน่ง:มือ","ตำแหน่ง:เท้า","ตำแหน่ง:ศีรษะ"] },
      { name:"เวลา", sub:["เวลา:3w","เวลา:1-6h","เวลา:6-24h","เวลา:1w","เวลา:2w","เวลา:4w"] },
      { name:"ระบบอื่น", sub:["ระบบอื่น:ไข้","ระบบอื่น:หนาวสั่น","ระบบอื่น:อ่อนเพลีย","ระบบอื่น:ดีซ่าน"] },
      { name:"อวัยวะ", sub:["อวัยวะ:ต่อมน้ำเหลืองโต","อวัยวะ:ตับโต","อวัยวะ:ม้ามโต","อวัยวะ:ขาบวม"] },
      { name:"ลักษณะเด่น", sub:["อาการผิว:มันเงา","อาการผิว:ลอก"], weight:3 },
    ]
  });

  // 13) Eczematous (10 ข้อใหญ่; x2 ที่ "ลักษณะสำคัญ" และ "อาการที่อาจพบ")
  ADR.push({
    key:"eczematous", title:"Eczematous drug eruption",
    majors:[
      { name:"รูปร่าง", sub:["รูปร่าง:ตุ่มนูน","รูปร่าง:ปื้นแดง"] },
      { name:"สี", sub:["สี:แดง"] },
      { name:"ลักษณะสำคัญ", sub:["อาการผิว:คัน"], weight:2 },
      { name:"อาการผิวเพิ่ม", sub:["รูปร่าง:นูนหนา","อาการผิว:ผื่นแดง"] },
      { name:"อาการอื่น", sub:["อาการผิว:จุดเล็กแดง","อาการผิว:น้ำเหลือง","อาการผิว:สะเก็ด"] },
      { name:"ตำแหน่ง", sub:["ตำแหน่ง:ลำตัว","ตำแหน่ง:แขน","ตำแหน่ง:ขา","ตำแหน่ง:หน้า","ตำแหน่ง:ลำคอ"] },
      { name:"เวลา", sub:["เวลา:1-6h","เวลา:6-24h","เวลา:1w","เวลา:2w","เวลา:3w"] },
      { name:"อาการอาจพบ", sub:["อาการผิว:ขุย","อาการผิว:แห้ง","อาการผิว:ลอก"], weight:2 },
      { name:"การกระจาย", sub:["การกระจาย:สมมาตร"] },
      { name:"ตุ่มน้ำ", sub:["ตุ่มน้ำ:เล็ก","ตุ่มน้ำ:กลาง","ตุ่มน้ำ:ใหญ่"] },
    ]
  });

  // 14) Bullous Drug Eruption (7 ข้อใหญ่; x2 ที่ "ลักษณะสำคัญ", x3 ที่ "สีด้านใน")
  ADR.push({
    key:"bullous", title:"Bullous Drug Eruption",
    majors:[
      { name:"รูปร่าง", sub:["ตุ่มน้ำ:เล็ก","อาการผิว:พอง","อาการผิว:ตึง"] },
      { name:"สี", sub:["สี:แดง"] },
      { name:"ลักษณะสำคัญ", sub:["ตุ่มน้ำ:กลาง","ตุ่มน้ำ:ใหญ่"], weight:2 },
      { name:"อาการผิว", sub:["อาการผิว:เจ็บ","อาการผิว:แสบ"] },
      { name:"สีด้านใน", sub:["สี:ใส"], weight:3 },
      { name:"ตำแหน่ง", sub:["ตำแหน่ง:ลำตัว","ตำแหน่ง:แขน","ตำแหน่ง:ขา","ตำแหน่ง:เท้า"] },
      { name:"เวลา", sub:["เวลา:1-6h","เวลา:6-24h","เวลา:1w","เวลา:2w","เวลา:3w"] },
    ]
  });

  // 15) Serum sickness (8 ข้อใหญ่; x2 ที่ "อาการ(เด่น)" และ "อาการระบบอื่นๆ")
  ADR.push({
    key:"serumSickness", title:"Serum sickness",
    majors:[
      { name:"อาการ", sub:["รูปร่าง:ตุ่มนูน","สี:แดง","อาการผิว:บวม","อาการผิว:คัน"] },
      { name:"อาการเด่น", sub:["ระบบอื่น:ไข้"], weight:2 },
      { name:"อวัยวะ", sub:["อวัยวะ:ต่อมน้ำเหลืองโต","อวัยวะ:ไตอักเสบ"] },
      { name:"Lab", sub:["Lab:protein+","Lab:C3ต่ำ","Lab:C4ต่ำ"] },
      { name:"เวลา", sub:["เวลา:1-6h","เวลา:6-24h","เวลา:1w","เวลา:2w","เวลา:3w"] },
      { name:"Lab2", sub:["Lab:RBC5-10/HPF","Lab:RBC 5-10/HPF"] },
      { name:"ระบบอื่น(เด่น)", sub:["ระบบอื่น:ปวดข้อ","ระบบอื่น:ข้ออักเสบ"], weight:2 },
      { name:"ตำแหน่ง", sub:["ตำแหน่ง:รอบดวงตา","ตำแหน่ง:มือ","ตำแหน่ง:เท้า","ตำแหน่ง:ลำตัว","ตำแหน่ง:แขน","ตำแหน่ง:ขา"] },
    ]
  });

  // 16) Vasculitis (8 ข้อใหญ่; x2 ที่ "ลักษณะเด่น")
  ADR.push({
    key:"vasculitis", title:"Vasculitis",
    majors:[
      { name:"อาการ", sub:["รูปร่าง:ตุ่มนูน","รูปร่าง:ผื่นแดง","สี:แดง"] },
      { name:"ระบบอื่น", sub:["ระบบอื่น:ไข้","ระบบอื่น:ปวดข้อ","ระบบอื่น:ข้ออักเสบ","ระบบอื่น:ปวดกล้ามเนื้อ","อวัยวะ:ต่อมน้ำเหลืองโต"] },
      { name:"อวัยวะ", sub:["อวัยวะ:ไตอักเสบ","อวัยวะ:ไตวาย","อวัยวะ:ต่อมน้ำเหลืองโต"] },
      { name:"อาการเด่นระบบหายใจ/ทางเดินอาหาร", sub:["ระบบอื่น:ไอเป็นเลือด","ระบบอื่น:ถุงลมเลือดออก","ระบบอื่น:เลือดออกในทางเดินอาหาร"] },
      { name:"เวลา", sub:["เวลา:1-6h","เวลา:6-24h","เวลา:1w","เวลา:2w","เวลา:3w"] },
      { name:"Lab2", sub:["Lab:protein+","Lab:C3ต่ำ","Lab:C4ต่ำ"] },
      { name:"Lab3", sub:["Lab:CrHigh"] },
      { name:"ลักษณะเด่น", sub:["อาการผิว:จ้ำเลือด","ตำแหน่ง:ขา"], weight:2 },
    ]
  });

  // 17) Hemolytic anemia (9 ข้อใหญ่; x2/x3 ตามกำหนด)
  ADR.push({
    key:"hemolytic", title:"Hemolytic anemia",
    majors:[
      { name:"อาการเด่น", sub:["สี:ซีด","ระบบอื่น:ดีซ่าน"], weight:2 },
      { name:"ระบบอื่นเด่น", sub:["ระบบอื่น:ปัสสาวะสีชา/สีดำ"], weight:3 },
      { name:"อวัยวะ", sub:["อวัยวะ:ไตวาย"] },
      { name:"Lab", sub:["Lab:IgG+","Lab:C3+"] },
      { name:"เวลา", sub:["เวลา:1-6h","เวลา:6-24h","เวลา:1w"] },
      { name:"Lab2เด่น", sub:["Lab:HB<10"], weight:3 },
      { name:"Lab3", sub:["Lab:LDHHigh"] },
      { name:"BP", sub:["ระบบอื่น:BPต่ำ","ระบบอื่น:BPลง40mmHg"] },
      { name:"อื่น", sub:["ระบบอื่น:ปวดหลังส่วนเอว","ระบบอื่น:ปวดแน่นชายโครงขวา"] },
    ]
  });

  // 18) Pancytopenia (10 ข้อใหญ่; หลายข้อ x2/x3)
  ADR.push({
    key:"pancytopenia", title:"Pancytopenia",
    majors:[
      { name:"อาการ", sub:["สี:ซีด","ระบบอื่น:อ่อนเพลีย"] },
      { name:"ระบบอื่น", sub:["ระบบอื่น:ปัสสาวะสีชา/สีดำ","ระบบอื่น:หนาวสั่น","ระบบอื่น:เจ็บคอ","ระบบอื่น:แผลในปาก"] },
      { name:"อาการผิดปกติ(เด่น)", sub:["อาการผิว:จุดเลือดออก","อาการผิว:ฟกช้ำ","ระบบอื่น:เลือดกำเดาไหล","ระบบอื่น:เหงือกเลือดออก"], weight:3 },
      { name:"Vitals", sub:["Lab:HR>100"] },
      { name:"เวลา", sub:["เวลา:1-6h","เวลา:6-24h","เวลา:1w","เวลา:2w"] },
      { name:"Lab2", sub:["ระบบอื่น:ไข้"] },
      { name:"Hb", sub:["Lab:HB<10"], weight:2 },
      { name:"Hct", sub:["Lab:Hct<30"], weight:2 },
      { name:"WBC", sub:["Lab:WBC<4000"], weight:2 },
      { name:"Platelet", sub:["Lab:PLT<100k"], weight:2 },
    ]
  });

  // 19) Neutropenia (4 ข้อใหญ่; x4 ที่ ANC)
  ADR.push({
    key:"neutropenia", title:"Neutropenia",
    majors:[
      { name:"อาการ", sub:["ระบบอื่น:หนาวสั่น","ระบบอื่น:เจ็บคอ","ระบบอื่น:แผลในปาก"] },
      { name:"ระบบอื่น", sub:["ระบบอื่น:ไข้","ระบบอื่น:แผลในปาก","ระบบอื่น:ทอนซิลอักเสบ"] },
      { name:"อวัยวะ", sub:["อวัยวะ:ปอดอักเสบ"] },
      { name:"Labเด่น", sub:["Lab:ANC<1500"], weight:4 }, // หากมีช่อง ANC แยก ให้ map -> Lab:ANC<1500
    ]
  });

  // 20) Thrombocytopenia (4 ข้อใหญ่; x2 ที่อาการเด่น)
  ADR.push({
    key:"thrombocytopenia", title:"Thrombocytopenia",
    majors:[
      { name:"อาการเด่น", sub:["อาการผิว:จุดเลือดออก","อาการผิว:ปื้น/จ้ำเลือด"], weight:2 },
      { name:"ระบบอื่น", sub:["ระบบอื่น:เหงือกเลือดออก","ระบบอื่น:เลือดออกในทางเดินอาหาร","ระบบอื่น:ปัสสาวะเลือดออก"] },
      { name:"Lab", sub:["Lab:PLT<150k"] },
      { name:"เวลา", sub:["เวลา:1-6h","เวลา:6-24h","เวลา:1w"] },
    ]
  });

  // 21) Nephritis (5 ข้อใหญ่; x3 ที่ Lab)
  ADR.push({
    key:"nephritis", title:"Nephritis",
    majors:[
      { name:"อาการ", sub:["ระบบอื่น:ไข้","ระบบอื่น:ปวดข้อ","ระบบอื่น:อ่อนเพลีย"] },
      { name:"ระบบอื่น", sub:["ระบบอื่น:ปัสสาวะออกน้อย","ระบบอื่น:ปัสสาวะขุ่น"] },
      { name:"อวัยวะ", sub:["อวัยวะ:ขาบวม","อาการผิว:บวม"] },
      { name:"Labเด่น", sub:["Lab:CrHigh","Lab:eGFR<60"], weight:3 },
      { name:"เวลา", sub:["เวลา:1-6h","เวลา:6-24h","เวลา:1w","เวลา:2w"] },
    ]
  });

  // ---------- ENGINE (สูตร C) ----------
  function scoreC(rule, tagSet){
    const majors = rule.majors || [];
    if (!majors.length) return {score:0, denom:0, pct:0};
    let score = 0;
    for (const m of majors) {
      const w = Number(m.weight || 1);
      if (hitAny(tagSet, m.sub || [])) score += w;
    }
    const denom = majors.length; // สูตร C: ตัวหาร = จำนวนข้อใหญ่ทั้งหมด
    const pct = Math.max(0, Math.min(100, Math.round((score/denom)*100)));
    return { score, denom, pct };
  }

  function rankAllC(d){
    const tagSet = collectTags(d || window.drugAllergyData || {});
    const results = ADR.map(def => {
      const out = scoreC(def, tagSet);
      return { key:def.key, title:def.title, pctC: out.pct, _scoreC: out.score, _denom: out.denom };
    }).sort((a,b)=> (b.pctC - a.pctC) || (b._scoreC - a._scoreC));
    return { tags: Array.from(tagSet), results };
  }

  // ---------- EXPORT ----------
  // ให้ brain.js เรียกใช้
  window.brainRank = function(mode){
    // ตอนนี้เรารองรับเฉพาะสูตร C ที่คุณเลือก
    return rankAllC(window.drugAllergyData || {});
  };

  // เผื่อ fallback เก่าในบางที่ยังอ้างถึง brainRules
  window.brainRules = ADR.reduce((acc, def) => {
    acc[def.key] = { title: def.title, majors: def.majors.slice() };
    return acc;
  }, {});

  // แจ้งหน้า 6 ให้คำนวณใหม่เมื่อมีอัปเดตข้อมูล
  document.addEventListener("da:update", function(){
    try { window.brainComputeAndRender && window.brainComputeAndRender(); } catch(_) {}
  });

})();

// ===================== brain.rules.js (REPLACE WHOLE FILE) =====================
// โครงสร้างกฎแบบ "แยก ADR" ไม่แชร์ token กัน
// น้ำหนักค่าเริ่มต้น = 1 เว้นแต่กำกับ (x2) หรือ (x3) ตามสเปคผู้ใช้
// *ทุกเงื่อนไขจะถูกนับ "ก็ต่อเมื่อผู้ใช้ติ๊ก/เลือกจริง" ตามข้อมูลจาก page1/page2/page3 เท่านั้น*

(function () {
  // ยูทิลช่วยสร้างรายการแบบมีน้ำหนัก
  function w(list, weight) {
    return list.map((k) => ({ key: k, w: weight || 1 }));
  }

  // ---- Normalized keys (อ้างอิงจากหน้า 1–3 ที่เก็บจริง) ----
  // รูปร่าง (shape:)
  const shape = {
    ตุ่มนูน: "shape:ตุ่มนูน",
    ตุ่มแบนราบ: "shape:ตุ่มแบนราบ",
    ปื้นนูน: "shape:ปื้นนูน",
    นูนหนา: "shape:นูนหนา",
    วงกลมชั้นเดียว: "shape:วงกลมชั้นเดียว",
    วงกลม3ชั้น: "shape:วงกลม 3 ชั้น",
    วงรี: "shape:วงรี",
    ขอบหยัก: "shape:ขอบหยัก",
    ขอบเรียบ: "shape:ขอบเรียบ",
    ขอบไม่ชัดเจน: "shape:ขอบไม่ชัดเจน",
    จุดเล็ก: "shape:จุดเล็ก",
    ปื้นแดง: "shape:ปื้นแดง", // ใช้กับบาง ADR
    ผื่นแดง: "shape:ผื่นแดง",
    เป้าไม่ครบ3: "shape:วงกลมคล้ายเป้าธนู (ไม่ครบ 3 ชั้น)",
  };

  // สี (color:)
  const color = {
    แดง: "color:แดง",
    แดงซีด: "color:แดงซีด",
    แดงไหม้: "color:แดงไหม้",
    ซีด: "color:ซีด",
    ใส: "color:ใส",
    เหลือง: "color:เหลือง",
    มันเงา: "color:มันเงา",
    เทา: "color:เทา",
    ดำคล้ำ: "color:ดำ/คล้ำ",
    ม่วงคล้ำ: "color:ม่วง/คล้ำ",
    ผิวปกติ: "color:สีผิวปกติ",
  };

  // อาการผิวหนัง/อื่นๆ (derm:/sys:/lab:/pos:/onset:)
  const derm = {
    คัน: "derm:คัน",
    บวม: "derm:บวม",
    ตึง: "derm:ตึง",
    เจ็บ: "derm:เจ็บ",
    แสบ: "derm:แสบ",
    น้ำเหลือง: "derm:น้ำเหลือง",
    สะเก็ด: "derm:สะเก็ด",
    ผิวหลุดกลาง: "derm:ผิวหนังหลุดลอกตรงกลางผื่น",
    BSA_lt10: "derm:ผิวหลุด<10%",
    BSA_gt30: "derm:ผิวหลุด>30%",
    พอง: "derm:พอง",
    ตุ่มน้ำเล็ก: "derm:ตุ่มน้ำเล็ก",
    ตุ่มน้ำกลาง: "derm:ตุ่มน้ำกลาง",
    ตุ่มน้ำใหญ่: "derm:ตุ่มน้ำใหญ่",
    แห้ง: "derm:แห้ง",
    ลอก: "derm:ลอก",
    ขุย: "derm:ขุย",
    จุดเลือดออก: "derm:จุดเลือดออก",
    ปื้นจ้ำเลือด: "derm:ปื้น/จ้ำเลือด",
  };

  const sys = {
    ไข้: "sys:ไข้",
    หนาวสั่น: "sys:หนาวสั่น",
    อ่อนเพลีย: "sys:อ่อนเพลีย",
    คลื่นไส้อาเจียน: "sys:คลื่นไส้อาเจียน",
    ปวดบิดท้อง: "sys:ปวดบิดท้อง",
    กลืนลำบาก: "sys:กลืนลำบาก",
    ท้องเสีย: "sys:ท้องเสีย",
    เจ็บคอ: "sys:เจ็บคอ",
    ปวดข้อ: "sys:ปวดข้อ",
    ข้ออักเสบ: "sys:ข้ออักเสบ",
    ปวดเมื่อย: "sys:ปวดเมื่อยกล้ามเนื้อ",
    เยื่อบุตาอักเสบ: "sys:เยื่อบุตาอักเสบ",
    ดีซ่าน: "sys:ดีซ่าน",
    ปัสสาวะชาดำ: "sys:ปัสสาวะสีชา/สีดำ",
    ปัสสาวะน้อย: "sys:ปัสสาวะออกน้อย",
    ปัสสาวะขุ่น: "sys:ปัสสาวะขุ่น",
    เลือดออกGI: "sys:เลือดออกในทางเดินอาหาร",
    wheeze: "sys:wheeze",
    dyspnea: "sys:dyspnea",
    hypotension: "sys:hypotension",
    bp_drop: "sys:bp_drop", // ใช้แทน ≥30% หรือ ≥40 mmHg ตามที่หน้า 2 เก็บได้
    HRสูง: "sys:HR>100",
    SpO2ต่ำ: "sys:SpO2<94",
  };

  const pos = {
    ทั่วร่างกาย: "pos:ทั่วร่างกาย",
    มือ: "pos:มือ",
    เท้า: "pos:เท้า",
    แขน: "pos:แขน",
    ขา: "pos:ขา",
    หน้า: "pos:หน้า",
    รอบดวงตา: "pos:รอบดวงตา",
    ลำคอ: "pos:ลำคอ",
    ลำตัว: "pos:ลำตัว",
    หลัง: "pos:หลัง",
    ริมฝีปาก: "pos:ริมฝีปาก",
    ลิ้น: "pos:ลิ้น",
    อวัยวะเพศ: "pos:อวัยวะเพศ",
    ช่องปาก: "pos:ช่องปาก",
    จมูก: "pos:จมูก",
    ทวาร: "pos:ทวาร",
    ศีรษะ: "pos:ศีรษะ",
    รักแร้: "pos:รักแร้",
    ขาหนีบ: "pos:ขาหนีบ",
    ตำแหน่งเดิม: "pos:ตำแหน่งเดิม",
    สมมาตร: "pos:สมมาตร",
  };

  const onset = {
    h1: "onset:1h",
    h1_6: "onset:1-6h",
    h6_24: "onset:6-24h",
    w1: "onset:1w",
    w2: "onset:2w",
    w3: "onset:3w",
    w4: "onset:4w",
  };

  const organ = {
    ต่อมน้ำเหลืองโต: "organ:LN",
    ม้ามโต: "organ:SP",
    ตับอักเสบ: "organ:hepatitis",
    ไตอักเสบ: "organ:nephritis",
    ไตวาย: "organ:AKI",
    ปอดอักเสบ: "organ:pneumonia",
    กล้ามเนื้อหัวใจอักเสบ: "organ:myocarditis",
    ตับโต: "organ:hepatomegaly",
    ขาบวม: "organ:legEdema",
  };

  const lab = {
    WBCสูง: "lab:WBC>11000",
    NEสูง: "lab:Neut>75",
    Eo5: "lab:Eo>5",
    Eo10: "lab:Eo>=10",
    CrRise: "lab:CrRise",
    eGFRlt60: "lab:eGFR<60",
    UAprotein: "lab:UA:protein+",
    ALTAST2x: "lab:ALT/AST>=2x",
    ALT40: "lab:ALT/AST>=40",
    HRสูง: sys.HRสูง, // reuse sys flags ที่มาจาก vitals
    SpO2ต่ำ: sys.SpO2ต่ำ,
    ANC1500: "lab:ANC<1500",
    HbLow10: "lab:Hb<10",
    PltLow100k: "lab:Plt<100k",
    PltLow150k: "lab:Plt<150k",
    LDHสูง: "lab:LDHสูง",
    IgGpos: "lab:IgG+",
    C3pos: "lab:C3+",
    C3low: "lab:C3<90",
    C4low: "lab:C4<10",
    RBC_UA_5_10: "lab:UA:RBC5-10",
    EKGผิดปกติ: "lab:EKGผิดปกติ",
    TropI: "lab:TropI>0.04",
    TropT: "lab:TropT>0.01-0.03",
  };

  // ========= กฎของแต่ละ ADR (token แยก ไม่แชร์) =========
  // แต่ละรายการ: { id, name, tokens: [{key,w}], notes? }
  const ADRS = [
    {
      id: "A.urticaria",
      name: "Urticaria (Type I / Pseudoallergy)",
      tokens: [
        // 1 รูปร่าง
        ...w([shape.ขอบหยัก, shape.วงกลมชั้นเดียว, shape.ขอบเรียบ], 1),
        // 2 สี
        ...w([color.แดง, color.แดงซีด, color.ซีด, color.ผิวปกติ], 1),
        // 3 ลักษณะสำคัญ (x2)
        ...w([shape.ตุ่มนูน, shape.ปื้นนูน], 2),
        // 4 อาการเพิ่มเติม
        ...w([derm.คัน], 1),
        // 5 อาการที่พบน้อย
        ...w([derm.บวม], 1),
        // 6 ตำแหน่ง
        ...w([pos.ทั่วร่างกาย, pos.มือ, pos.เท้า, pos.แขน, pos.ขา, pos.หน้า, pos.รอบดวงตา, pos.ลำคอ, pos.ลำตัว, pos.หลัง], 1),
        // 7 ระยะเวลา
        ...w([onset.h1], 1),
      ],
    },

    {
      id: "A.anaphylaxis",
      name: "Anaphylaxis (Type I / Pseudoallergy)",
      tokens: [
        // 1 รูปร่าง
        ...w([shape.ตุ่มนูน, shape.ปื้นนูน, derm.บวม, shape.นูนหนา, derm.ตึง], 1),
        // 2 ลักษณะสำคัญ x2
        ...w([sys.wheeze, sys.dyspnea], 2),
        // 3 ผิวหนัง
        ...w([derm.คัน, color.แดง, color.ผิวปกติ], 1),
        // 4 อาการ GI
        ...w([sys.ท้องเสีย, sys.กลืนลำบาก, sys.ปวดบิดท้อง, sys.คลื่นไส้อาเจียน], 1),
        // 5 ระยะเวลา
        ...w([onset.h1, onset.h1_6], 1),
        // 6 ระบบอื่น
        ...w([sys.hypotension, sys.bp_drop], 1), // bp_drop มาจากหน้า 2 (≥30% proxy ให้ ≥40 mmHg)
        // 7 Lab/Vitals
        ...w([sys.HRสูง, sys.SpO2ต่ำ], 1),
      ],
    },

    {
      id: "A.angioedema",
      name: "Angioedema (Type I / Pseudoallergy)",
      tokens: [
        // 1 รูปร่าง
        ...w([shape.นูนหนา, shape.ขอบไม่ชัดเจน], 1),
        // 2 สี
        ...w([color.ผิวปกติ, color.แดง], 1),
        // 3 ลักษณะสำคัญ x2
        ...w([derm.บวม], 2),
        // 4 เพิ่มเติม
        ...w([derm.ตึง], 1),
        // 5 พบน้อย
        ...w([derm.คัน, "derm:ไม่คัน", derm.เจ็บ, derm.แสบ], 1),
        // 6 ตำแหน่ง
        ...w([pos.ริมฝีปาก, pos.รอบดวงตา, pos.ลิ้น, pos.อวัยวะเพศ], 1),
        // 7 เวลา
        ...w([onset.h1], 1),
      ],
    },

    {
      id: "A.maculopapular",
      name: "Maculopapular rash (Type IV)",
      tokens: [
        // 1 รูปร่าง
        ...w([shape.ปื้นแดง, shape.ปื้นนูน, shape.ตุ่มนูน], 1),
        // 2 สี
        ...w([color.แดง], 1),
        // 3 สำคัญ x2
        ...w([ "derm:จุดเล็กแดง" ], 2),
        // 4 เพิ่มเติม
        ...w([derm.คัน], 1),
        // 5 พบน้อย
        ...w([sys.ไข้, "lab:Eo>5"], 1),
        // 6 ตำแหน่ง/การกระจาย
        ...w([pos.สมมาตร, pos.ลำตัว, pos.แขน, pos.หน้า, pos.ลำคอ], 1),
        // 7 เวลา
        ...w([onset.h1_6, onset.h6_24, onset.w1, onset.w2], 1),
        // 8 อวัยวะ
        ...w([organ.ต่อมน้ำเหลืองโต, sys.ข้ออักเสบ, organ.ไตอักเสบ, organ.ตับอักเสบ], 1),
      ],
    },

    {
      id: "A.fde",
      name: "Fixed drug eruption (Type IV)",
      tokens: [
        // 1 รูปร่าง
        ...w([shape.วงกลมชั้นเดียว, shape.วงรี], 1),
        // 2 สี
        ...w([color.แดง, color.ดำคล้ำ], 1),
        // 3 สำคัญ x3
        ...w([color.ม่วงคล้ำ], 3),
        // 4 เพิ่มเติม
        ...w([derm.ผิวหลุดกลาง, derm.เจ็บ, derm.แสบ, derm.ตึง], 1),
        // 5 พบน้อย
        ...w([derm.บวม, derm.พอง, derm.ตุ่มน้ำเล็ก, derm.ตุ่มน้ำกลาง, derm.ตุ่มน้ำใหญ่], 1),
        // 6 ตำแหน่ง
        ...w([pos.ริมฝีปาก, pos.หน้า, pos.มือ, pos.เท้า, pos.แขน, pos.ขา, pos.อวัยวะเพศ, pos.ตำแหน่งเดิม], 1),
        // 7 เวลา
        ...w([onset.w1, onset.w2], 1),
        // 8 ระบบอื่น
        ...w([sys.ไข้, sys.คลื่นไส้อาเจียน, sys.ปวดเมื่อย], 1),
        // 9 ขอบ
        ...w([shape.ขอบเรียบ, "shape:ขอบเขตชัดเจน"], 1),
      ],
    },

    {
      id: "A.agep",
      name: "AGEP (Type IV)",
      tokens: [
        // 1 รูปร่าง
        ...w([shape.ผื่นแดง], 1),
        // 2 สี
        ...w([color.แดง, color.เหลือง], 1),
        // 3 สำคัญ x3
        ...w([derm.ตุ่มน้ำใหญ่ /*ใช้แทนตุ่มหนอง*/, "derm:ตุ่มหนอง"], 3),
        // 4 เพิ่มเติม
        ...w([derm.บวม, derm.คัน, derm.เจ็บ], 1),
        // 5 พบน้อย
        ...w([derm.ปื้นจ้ำเลือด, derm.แห้ง, derm.ลอก, derm.ขุย], 1),
        // 6 ตำแหน่ง
        ...w([pos.หน้า, pos.รักแร้, pos.ทั่วร่างกาย, pos.ขาหนีบ], 1),
        // 7 เวลา
        ...w([onset.h6_24, onset.w1, onset.w2, onset.w3], 1),
        // 8 ระบบอื่น
        ...w([sys.ไข้], 1),
        // 9 Lab
        ...w([lab.WBCสูง, lab.NEสูง], 1),
      ],
    },

    {
      id: "A.sjs",
      name: "SJS (Type IV)",
      tokens: [
        ...w([shape.เป้าไม่ครบ3], 1),
        ...w([color.ดำคล้ำ, color.เทา, color.แดง], 1),
        ...w([derm.BSA_lt10], 3), // สำคัญ x3
        ...w([derm.น้ำเหลือง, derm.พอง, derm.ตุ่มน้ำเล็ก, derm.ตุ่มน้ำกลาง, derm.ตุ่มน้ำใหญ่], 1),
        ...w([derm.สะเก็ด], 1),
        ...w([pos.ลำตัว], 1),
        ...w([onset.h1_6, onset.h6_24, onset.w1, onset.w2, onset.w3], 1),
        ...w([sys.ไข้, sys.ปวดเมื่อย, sys.คลื่นไส้อาเจียน, sys.เลือดออกGI], 1),
        ...w([pos.ริมฝีปาก, pos.รอบดวงตา, pos.ลำตัว, pos.แขน, pos.ขา, pos.หน้า, pos.มือ, pos.เท้า], 1),
        ...w(["mucosa:>1"], 1), // เยื่อบุ >1 ตำแหน่ง
      ],
    },

    {
      id: "A.ten",
      name: "TEN (Type IV)",
      tokens: [
        ...w([shape.ผื่นแดง, shape.ปื้นแดง, shape.เป้าไม่ครบ3], 1),
        ...w([color.แดง, color.ดำคล้ำ], 1),
        ...w([derm.BSA_gt30], 3),
        ...w([derm.ตุ่มน้ำใหญ่, derm.น้ำเหลือง, derm.สะเก็ด], 1),
        ...w([sys.ซีด, "sys:โลหิตจาง", sys.เลือดออกGI, sys.กลืนลำบาก], 1),
        ...w([pos.ลำตัว, pos.แขน, pos.ขา, pos.หน้า, pos.มือ, pos.เท้า, pos.ศีรษะ, pos.ทั่วร่างกาย, pos.ริมฝีปาก], 1),
        ...w([onset.w1, onset.w2, onset.w3], 1),
        ...w([sys.ไข้, sys.ปวดเมื่อย, sys.คลื่นไส้อาเจียน, sys.เจ็บคอ, sys.ปวดข้อ, sys.ท้องเสีย, sys.เยื่อบุตาอักเสบ], 1),
        ...w([organ.ไตวาย, organ.ตับอักเสบ, organ.ปอดอักเสบ], 1),
        ...w([lab.CrRise, lab.UAprotein, sys.SpO2ต่ำ, lab.ALTAST2x, lab.ALT40], 1),
      ],
    },

    {
      id: "A.dress",
      name: "DRESS (Type IV)",
      tokens: [
        ...w([shape.ผื่นแดง, shape.ปื้นแดง], 1),
        ...w([color.แดง], 1),
        ...w([lab.Eo10, "lab:AtypicalLym"], 3),
        ...w([derm.ตุ่มน้ำเล็ก, derm.ตุ่มน้ำกลาง, derm.ตุ่มน้ำใหญ่, derm.ปื้นจ้ำเลือด], 1),
        ...w([pos.หน้า, pos.ลำตัว, pos.แขน, pos.ขา], 1),
        ...w([sys.ไข้], 1),
        ...w([onset.w1, onset.w2, onset.w3, onset.w4], 1),
        ...w([ "onset:5w", "onset:6w" ], 1),
        ...w([lab.ALTAST2x, lab.ALT40, lab.CrRise, lab.UAprotein, sys.SpO2ต่ำ, lab.EKGผิดปกติ, lab.TropI, lab.TropT], 1),
        ...w([organ.ต่อมน้ำเหลืองโต, organ.ตับอักเสบ, organ.ไตอักเสบ, organ.ไตวาย, organ.ปอดอักเสบ, organ.กล้ามเนื้อหัวใจอักเสบ, "organ:thyroiditis"], 1),
      ],
    },

    {
      id: "A.em",
      name: "Erythema multiforme (Type IV)",
      tokens: [
        ...w([shape.ตุ่มนูน, "shape:ขอบวงนูนแดงด้านในเรียบ"], 1),
        ...w([color.แดง, color.แดงซีด], 1),
        ...w([shape.วงกลม3ชั้น], 3),
        ...w([derm.พอง, derm.ตุ่มน้ำเล็ก, derm.ตุ่มน้ำกลาง], 1),
        ...w([derm.สะเก็ด], 1),
        ...w([onset.h1_6, onset.h6_24, onset.w1], 1),
        ...w([pos.ช่องปาก, pos.จมูก, pos.ทวาร, pos.อวัยวะเพศ], 1),
        ...w([sys.ไข้, sys.อ่อนเพลีย, sys.ปวดเมื่อย, sys.เจ็บคอ, sys.ปวดข้อ], 1),
        ...w([pos.มือ, pos.เท้า, pos.แขน, pos.ขา, pos.หน้า, pos.ลำตัว, pos.หลัง, pos.ลำคอ], 1),
      ],
    },

    {
      id: "A.photo",
      name: "Photosensitivity drug eruption (Type IV)",
      tokens: [
        ...w([ "shape:ขอบเขตชัดเจน", shape.ปื้นแดง, "derm:จุดแดงเล็ก" ], 1),
        ...w([color.ดำคล้ำ, color.แดง], 1),
        ...w([color.แดงไหม้], 2),
        ...w([derm.น้ำเหลือง, derm.สะเก็ด], 1),
        ...w([derm.ตุ่มน้ำเล็ก, derm.ตุ่มน้ำกลาง, derm.ตุ่มน้ำใหญ่, derm.ลอก, derm.ขุย, derm.คัน], 1),
        ...w([pos.หน้า, "pos:หน้าอก", pos.มือ, pos.แขน, pos.ขา], 1),
        ...w([onset.h1_6, onset.h6_24, onset.w1, onset.h1], 1),
        ...w([derm.แสบ], 2),
      ],
    },

    {
      id: "A.exfoliative",
      name: "Exfoliative dermatitis (Type IV)",
      tokens: [
        ...w([derm.ตึง], 1),
        ...w([color.แดง], 1),
        ...w([derm.แห้ง], 3),
        ...w([derm.ขุย], 3),
        ...w([derm.คัน], 1),
        ...w([pos.ทั่วร่างกาย, pos.มือ, pos.เท้า, "pos:ศีรษะ"], 1),
        ...w([ "onset:3w", onset.h1_6, onset.h6_24, onset.w1, onset.w2, onset.w4, "onset:<4w" ], 1),
        ...w([sys.ไข้, sys.หนาวสั่น, sys.อ่อนเพลีย, sys.ดีซ่าน], 1),
        ...w([organ.ต่อมน้ำเหลืองโต, organ.ตับโต, organ.ม้ามโต, organ.ขาบวม], 1),
        ...w([color.มันเงา, derm.ลอก], 3),
      ],
    },

    {
      id: "A.eczematous",
      name: "Eczematous drug eruption (Type IV)",
      tokens: [
        ...w([shape.ตุ่มนูน, shape.ปื้นแดง], 1),
        ...w([color.แดง], 1),
        ...w([derm.คัน], 2),
        ...w([shape.นูนหนา, shape.ผื่นแดง], 1),
        ...w([ "derm:จุดเล็กแดง", derm.น้ำเหลือง, derm.สะเก็ด ], 1),
        ...w([pos.ลำตัว, pos.แขน, pos.ขา, pos.หน้า, pos.ลำคอ], 1),
        ...w([onset.h1_6, onset.h6_24, onset.w1, onset.w2, onset.w3], 1),
        ...w([derm.ขุย, derm.แห้ง, derm.ลอก], 2),
        ...w([pos.สมมาตร], 1),
        ...w([derm.ตุ่มน้ำเล็ก, derm.ตุ่มน้ำกลาง, derm.ตุ่มน้ำใหญ่], 1),
      ],
    },

    {
      id: "A.bullous",
      name: "Bullous drug eruption (Type IV)",
      tokens: [
        ...w([derm.ตุ่มน้ำเล็ก, derm.พอง, derm.ตึง], 1),
        ...w([color.แดง], 1),
        ...w([derm.ตุ่มน้ำกลาง, derm.ตุ่มน้ำใหญ่], 2),
        ...w([derm.เจ็บ, derm.แสบ], 1),
        ...w([color.ใส], 3),
        ...w([pos.ลำตัว, pos.แขน, pos.ขา, pos.เท้า], 1),
        ...w([onset.h1_6, onset.h6_24, onset.w1, onset.w2, onset.w3], 1),
      ],
    },

    {
      id: "A.serumSickness",
      name: "Serum sickness (Type III)",
      tokens: [
        ...w([shape.ตุ่มนูน, color.แดง, derm.บวม, derm.คัน], 1),
        ...w([sys.ไข้], 2),
        ...w([organ.ต่อมน้ำเหลืองโต, organ.ไตอักเสบ], 1),
        ...w([lab.UAprotein, lab.C3low, lab.C4low], 1),
        ...w([onset.h1_6, onset.h6_24, onset.w1, onset.w2, onset.w3], 1),
        ...w([lab.RBC_UA_5_10], 1),
        ...w([sys.ปวดข้อ, sys.ข้ออักเสบ], 2),
        ...w([pos.รอบดวงตา, pos.มือ, pos.เท้า, pos.ลำตัว, pos.แขน, pos.ขา], 1),
      ],
    },

    {
      id: "A.vasculitis",
      name: "Vasculitis (Type III)",
      tokens: [
        ...w([shape.ตุ่มนูน, shape.ผื่นแดง, color.แดง], 1),
        ...w([sys.ไข้, sys.ปวดข้อ, sys.ข้ออักเสบ, sys.ปวดเมื่อย, organ.ต่อมน้ำเหลืองโต], 1),
        ...w([organ.ไตอักเสบ, organ.ไตวาย, organ.ต่อมน้ำเหลืองโต], 1),
        ...w([ "sys:ไอเป็นเลือด", "sys:ถุงลมเลือดออก", sys.เลือดออกGI ], 1),
        ...w([onset.h1_6, onset.h6_24, onset.w1, onset.w2, onset.w3], 1),
        ...w([lab.UAprotein, lab.C3low, lab.C4low], 1),
        ...w([lab.CrRise], 1),
        ...w([derm.ปื้นจ้ำเลือด, pos.ขา], 2),
      ],
    },

    {
      id: "A.hemolytic",
      name: "Hemolytic anemia (Type II)",
      tokens: [
        ...w([ "sys:ซีด", sys.ดีซ่าน ], 2),
        ...w([sys.ปัสสาวะชาดำ], 3),
        ...w([organ.ไตวาย], 1),
        ...w([lab.IgGpos, lab.C3pos], 1),
        ...w([onset.h1_6, onset.h6_24, onset.w1], 1),
        ...w([ "lab:Hb↓≥2-3g/dL/48h" ], 3),
        ...w([ lab.LDHสูง ], 1),
        ...w([ sys.hypotension, sys.bp_drop ], 1),
        ...w([ "sys:ปวดหลังเอว", "sys:ปวดชายโครงขวา" ], 1),
      ],
    },

    {
      id: "A.pancytopenia",
      name: "Pancytopenia (Type II)",
      tokens: [
        ...w([ "sys:ซีด", sys.อ่อนเพลีย ], 1),
        ...w([ sys.ปัสสาวะชาดำ, sys.หนาวสั่น, sys.เจ็บคอ, "sys:แผลในปาก" ], 1),
        ...w([ derm.จุดเลือดออก, "derm:ฟกช้ำ", "sys:เลือดกำเดาไหล", "sys:เหงือกเลือดออก" ], 3),
        ...w([ sys.HRสูง ], 1),
        ...w([ onset.h1_6, onset.h6_24, onset.w1, onset.w2 ], 1),
        ...w([ sys.ไข้ ], 1),
        ...w([ lab.HbLow10 ], 2),
        ...w([ "lab:Hct<30%" ], 2),
        ...w([ "lab:WBC<4000" ], 2),
        ...w([ lab.PltLow100k ], 2),
      ],
    },

    {
      id: "A.neutropenia",
      name: "Neutropenia (Type II)",
      tokens: [
        ...w([ sys.หนาวสั่น, sys.เจ็บคอ, "sys:แผลในปาก" ], 1),
        ...w([ sys.ไข้, "sys:แผลในปาก", "sys:ทอนซิลอักเสบ" ], 1),
        ...w([ organ.ปอดอักเสบ ], 1),
        ...w([ lab.ANC1500 ], 4),
      ],
    },

    {
      id: "A.thrombocytopenia",
      name: "Thrombocytopenia (Type II)",
      tokens: [
        ...w([ derm.จุดเลือดออก, derm.ปื้นจ้ำเลือด ], 2),
        ...w([ "sys:เหงือกเลือดออก", sys.เลือดออกGI, "sys:ปัสสาวะเลือด" ], 1),
        ...w([ lab.PltLow150k ], 1),
        ...w([ onset.h1_6, onset.h6_24, onset.w1 ], 1),
      ],
    },

    {
      id: "A.nephritis",
      name: "Nephritis (Type II)",
      tokens: [
        ...w([ sys.ไข้, sys.ปวดข้อ, sys.อ่อนเพลีย ], 1),
        ...w([ sys.ปัสสาวะน้อย, sys.ปัสสาวะขุ่น ], 1),
        ...w([ organ.ขาบวม, derm.บวม ], 1),
        ...w([ lab.CrRise, lab.eGFRlt60 ], 3),
        ...w([ onset.h1_6, onset.h6_24, onset.w1, onset.w2 ], 1),
      ],
    },
  ];

  window.brainRules = ADRS;
})();

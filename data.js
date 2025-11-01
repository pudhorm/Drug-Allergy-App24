// data.js
// ศูนย์กลางข้อมูลของแอพ
window.drugAllergyData = window.drugAllergyData || {};

// ✅ หน้า 1 — แบบละเอียดตามฟอร์มที่แนบมา
if (!window.drugAllergyData.page1) {
  window.drugAllergyData.page1 = {
    // ส่วนที่ 1 ผู้ป่วย
    name: "",
    hn: "",
    age: "",
    weight: "",
    underlying: "",
    drugAllergyHistory: "",

    // ส่วนที่ 2 อาการทางผิวหนัง
    rashShapes: [],          // 1.1 รูปร่างผื่น (เลือกหลายข้อ)
    rashShapesOther: "",
    rashColors: [],          // 1.2 สีผื่น
    rashColorsOther: "",
    blisters: {              // 1.3 ตุ่มน้ำ
      small: false,
      medium: false,
      large: false,
      other: ""
    },
    skinDetach: {            // 1.4 ผิวหลุดลอก
      center: false,
      lt10: false,
      gt30: false,
      none: false,
      other: ""
    },
    scales: {                // 1.5 ขุย/แห้ง/ลอก
      scale: false,
      dry: false,
      peel: false,
      none: false,
      other: ""
    },
    exudate: {               // 1.6 น้ำเหลือง/สะเก็ด
      serous: false,
      crust: false,
      none: false,
      other: ""
    },
    itch: {                  // 1.7 คัน
      has: false,
      severe: false,
      mild: false,
      none: false
    },
    pain: {                  // 1.8 ปวด/แสบ/เจ็บ
      pain: false,
      burn: false,
      sore: false,
      none: false
    },
    swelling: {              // 1.9 บวม
      has: false,
      none: false
    },
    pustule: {               // 1.10 ตุ่มหนอง
      has: false,
      none: false,
      detail: ""
    },
    locations: [],           // 1.21 ตำแหน่งที่พบ (เลือกหลายข้อ)
    distribution: "",        // สมมาตร / ไม่สมมาตร / อื่นๆ
    distributionOther: "",

    // ส่วนที่ 3 ระยะเวลาเริ่มอาการ
    onset: "",
    onsetOther: "",

    // ส่วนที่ 4 รูป
    imageName: "",
    imageDataUrl: ""
  };
}

// ✅ หน้า 2 / หน้า 3 ถ้ายังไม่มี ให้สร้างโครงว่างไว้ก่อน
window.drugAllergyData.page2 = window.drugAllergyData.page2 || {};
window.drugAllergyData.page3 = window.drugAllergyData.page3 || {};

// ✅ หน้า 4 — คุณทำไว้แล้วในไฟล์อื่น เราแค่กันช่องให้
window.drugAllergyData.page4 = window.drugAllergyData.page4 || {
  naranjo: {},
  other: {}
};

// ✅ หน้า 5 — Timeline / ประวัติการใช้ยา + เหตุการณ์อาการ
// ตรงนี้สำคัญ เพราะหน้า 6 จะต้อง "เอาไปแสดง" แต่ "ไม่เอาไปคิดคะแนน"
window.drugAllergyData.page5 = window.drugAllergyData.page5 || {
  // ถ้าคุณอยากให้ timeline ผูกกับวันเริ่มใช้ ให้ใช้ตัวนี้ (ไม่บังคับ)
  baseDate: "",

  // รายการยา
  drugLines: [
    // ตัวอย่างโครงที่หน้า 5 ต้องเขียนเพิ่มเข้ามาเรื่อยๆ
    // {
    //   id: 1730458210000,
    //   drugName: "Amoxicillin",
    //   startDate: "2025-10-31",
    //   stopDate: "2025-11-02",
    //   dose: "500 mg PO tid",
    //   indication: "Pharyngitis",
    //   suspect: false
    // }
  ],

  // รายการอาการ/เหตุการณ์
  adrLines: [
    // {
    //   id: 1730458222000,
    //   eventDate: "2025-11-01",
    //   eventTime: "14:30",
    //   symptom: "ผื่นแดงทั้งตัว",
    //   severity: "moderate",
    //   relatedDrug: "Amoxicillin"
    // }
  ]
};

// ✅ หน้า 6 — ผลการประเมิน (ให้หน้า 6.js มาอ่านโชว์เฉยๆ)
// เดี๋ยว "สมอง" จริงจะค่อยเติมทีหลัง
window.drugAllergyData.page6 = window.drugAllergyData.page6 || {
  autoLevel: "",     // ระดับความน่าจะเป็นที่คำนวณ
  autoReason: "",    // เหตุผลที่ได้ระดับนั้น
  autoFromPages: [], // ใช้ข้อมูลจากหน้าไหนบ้าง
  manualNote: ""     // ช่องให้แพทย์/พยาบาลเขียนเพิ่ม
};

// ====== โหลดจาก localStorage ถ้ามี ======
const STORAGE_KEY = "drug_allergy_app_v1";

(function () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // ผสานค่าเก่ามาทับของเริ่มต้น
      window.drugAllergyData = Object.assign(window.drugAllergyData, parsed);
    }
  } catch (err) {
    console.warn("โหลดข้อมูลเก่าไม่ได้ ใช้ค่าเริ่มต้น");
  }
})();

// ====== ฟังก์ชันบันทึกกลาง ======
window.saveDrugAllergyData = function () {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(window.drugAllergyData));
};

// ====== ฟังก์ชันประเมินกลาง (ตอนนี้ยังใช้หน้า 1 เป็นหลัก) ======
// หมายเหตุ: ตาม requirement ตอนนี้ "หน้า 4 และหน้า 5 ไม่ได้นำมาประกอบการประเมินผล"
// ดังนั้นเราจะยังไม่แตะ page4/page5 ตรงนี้ แค่เก็บโชว์ไว้ที่ page6
window.evaluateDrugAllergy = function () {
  const d = window.drugAllergyData;
  const p1 = d.page1 || {};
  const p2 = d.page2 || {};
  const p3 = d.page3 || {};

  let level = "ข้อมูลยังไม่พอประเมิน";
  const reasons = [];
  const usedPages = ["page1"]; // ตอนนี้ยังใช้แค่หน้า 1 เป็นหลัก

  // ถ้ามีผิวหลุดลอก >30% → สงสัย SJS/TEN
  if (p1.skinDetach && p1.skinDetach.gt30) {
    level = "รุนแรงมาก (สงสัย SJS/TEN)";
    reasons.push("ผิวหนังหลุดลอกเกิน 30% BSA");
  }

  // ถ้ามีตุ่มน้ำ + ผิวหลุดลอกตรงกลางผื่น → ใส่เป็นผื่นรุนแรงไว้ก่อน
  if (
    p1.blisters &&
    (p1.blisters.small || p1.blisters.medium || p1.blisters.large) &&
    p1.skinDetach &&
    p1.skinDetach.center
  ) {
    if (level === "ข้อมูลยังไม่พอประเมิน") {
      level = "ผื่นรุนแรง (bullous + central detachment)";
    }
    reasons.push("มีตุ่มน้ำ + ผิวหนังหลุดลอกตรงกลางผื่น");
  }

  // onset 1–3 สัปดาห์ + ผื่นแบบตุ่ม/ปื้น → ผื่นแพ้ยาทั่วไป
  if (p1.onset === "1w" || p1.onset === "2w" || p1.onset === "3w") {
    if (p1.rashShapes && (p1.rashShapes.includes("ตุ่มนูน") || p1.rashShapes.includes("ปื้นนูน"))) {
      if (level === "ข้อมูลยังไม่พอประเมิน") {
        level = "ผื่นแพ้ยาทั่วไป (morbilliform/exanthematous)";
      }
      reasons.push("onset 1–3 สัปดาห์ + ผื่นตุ่ม/ปื้น");
    }
  }

  // สร้างอ็อบเจ็กต์ผล
  const result = {
    level,
    reason: reasons.length ? reasons.join(" / ") : "รอข้อมูลจากหน้า 2–3 เพิ่มเติม",
    usedPages
  };

  // เก็บทั้งแบบเดิม (assessment) และแบบใหม่ (page6) เพื่อให้หน้า 6 หยิบไปโชว์
  window.drugAllergyData.assessment = result;
  window.drugAllergyData.page6.autoLevel = result.level;
  window.drugAllergyData.page6.autoReason = result.reason;
  window.drugAllergyData.page6.autoFromPages = result.usedPages;

  window.saveDrugAllergyData();
};

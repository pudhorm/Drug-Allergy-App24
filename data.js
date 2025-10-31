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

// ถ้าคุณมี page2 / page3 อยู่แล้วให้คงไว้
window.drugAllergyData.page2 = window.drugAllergyData.page2 || {};
window.drugAllergyData.page3 = window.drugAllergyData.page3 || {};

// key สำหรับ localStorage
const STORAGE_KEY = "drug_allergy_app_v1";

(function () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      window.drugAllergyData = Object.assign(window.drugAllergyData, parsed);
    }
  } catch (err) {
    console.warn("โหลดข้อมูลเก่าไม่ได้ ใช้ค่าเริ่มต้น");
  }
})();

window.saveDrugAllergyData = function () {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(window.drugAllergyData));
};

// ฟังก์ชันประเมินกลาง (ตอนนี้ยังใช้หน้า 1 ได้บางส่วน เดี๋ยวค่อยเพิ่มหน้า 2–3)
window.evaluateDrugAllergy = function () {
  const d = window.drugAllergyData;
  const p1 = d.page1;

  let level = "ข้อมูลยังไม่พอประเมิน";
  const reasons = [];

  // ถ้ามีผิวหลุดลอก >30% → สงสัย SJS/TEN
  if (p1.skinDetach && p1.skinDetach.gt30) {
    level = "รุนแรงมาก (สงสัย SJS/TEN)";
    reasons.push("ผิวหนังหลุดลอกเกิน 30% BSA");
  }

  // ถ้ามีตุ่มน้ำ + ผิวหลุดลอกตรงกลางผื่น → ใส่เป็นผื่นรุนแรงไว้ก่อน
  if (p1.blisters && (p1.blisters.small || p1.blisters.medium || p1.blisters.large) && p1.skinDetach && p1.skinDetach.center) {
    if (level === "ข้อมูลยังไม่พอประเมิน") {
      level = "ผื่นรุนแรง (bullous + central detachment)";
    }
    reasons.push("มีตุ่มน้ำ + ผิวหนังหลุดลอกตรงกลางผื่น");
  }

  // onset 1–3 สัปดาห์ + ผื่นแบบ mp → ผื่นแพ้ยาทั่วไป
  if (p1.onset === "1w" || p1.onset === "2w" || p1.onset === "3w") {
    if (p1.rashShapes && p1.rashShapes.includes("ตุ่มนูน") || p1.rashShapes.includes("ปื้นนูน")) {
      if (level === "ข้อมูลยังไม่พอประเมิน") {
        level = "ผื่นแพ้ยาทั่วไป (morbilliform/exanthematous)";
      }
      reasons.push("onset 1–3 สัปดาห์ + ผื่นตุ่ม/ปื้น");
    }
  }

  window.drugAllergyData.assessment = {
    level,
    reason: reasons.length ? reasons.join(" / ") : "รอข้อมูลจากหน้า 2–3 เพิ่มเติม",
    usedPages: ["page1"]
  };

  window.saveDrugAllergyData();
};

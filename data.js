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
    rashShapes: [],
    rashShapesOther: "",
    rashColors: [],
    rashColorsOther: "",
    blisters: {
      small: false,
      medium: false,
      large: false,
      other: ""
    },
    skinDetach: {
      center: false,
      lt10: false,
      gt30: false,
      none: false,
      other: ""
    },
    scales: {
      scale: false,
      dry: false,
      peel: false,
      none: false,
      other: ""
    },
    exudate: {
      serous: false,
      crust: false,
      none: false,
      other: ""
    },
    itch: {
      has: false,
      severe: false,
      mild: false,
      none: false
    },
    pain: {
      pain: false,
      burn: false,
      sore: false,
      none: false
    },
    swelling: {
      has: false,
      none: false
    },
    pustule: {
      has: false,
      none: false,
      detail: ""
    },
    locations: [],
    distribution: "",
    distributionOther: "",

    // ส่วนที่ 3 ระยะเวลาเริ่มอาการ
    onset: "",
    onsetOther: "",

    // ส่วนที่ 4 รูป
    imageName: "",
    imageDataUrl: ""
  };
}

// เตรียมช่องของหน้าอื่น (อย่าลบ จะได้ไม่ error)
window.drugAllergyData.page2 = window.drugAllergyData.page2 || {};
window.drugAllergyData.page3 = window.drugAllergyData.page3 || {};
window.drugAllergyData.page5 = window.drugAllergyData.page5 || {
  drugLines: [],
  adrLines: []
};

// ===== ปิดการจำใน localStorage =====
const STORAGE_KEY = "drug_allergy_app_v1";

// เดิมเรามี IIFE โหลดข้อมูลเก่าออกมา ตอนนี้ “ปิดไว้” ให้รีเฟรชแล้วหาย
// (function () {
//   try {
//     const raw = localStorage.getItem(STORAGE_KEY);
//     if (raw) {
//       const parsed = JSON.parse(raw);
//       window.drugAllergyData = Object.assign(window.drugAllergyData, parsed);
//     }
//   } catch (err) {
//     console.warn("โหลดข้อมูลเก่าไม่ได้ ใช้ค่าเริ่มต้น");
//   }
// })();

// ตอนนี้ให้ save เป็น no-op ไปก่อน เพื่อไม่ให้มันเขียนกลับ
window.saveDrugAllergyData = function () {
  // ถ้าอยากกลับมาเก็บในเครื่อง ค่อยยกเลิกคอมเมนต์ด้านล่าง
  // localStorage.setItem(STORAGE_KEY, JSON.stringify(window.drugAllergyData));
};

// ฟังก์ชันประเมินกลาง (ยังเหมือนเดิม)
window.evaluateDrugAllergy = function () {
  const d = window.drugAllergyData;
  const p1 = d.page1;

  let level = "ข้อมูลยังไม่พอประเมิน";
  const reasons = [];

  if (p1.skinDetach && p1.skinDetach.gt30) {
    level = "รุนแรงมาก (สงสัย SJS/TEN)";
    reasons.push("ผิวหนังหลุดลอกเกิน 30% BSA");
  }
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

  if (p1.onset === "1w" || p1.onset === "2w" || p1.onset === "3w") {
    if (p1.rashShapes && (p1.rashShapes.includes("ตุ่มนูน") || p1.rashShapes.includes("ปื้นนูน"))) {
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

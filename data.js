// data.js
// ศูนย์รวมข้อมูลกลาง
window.drugAllergyData = {
  page1: {
    name: "",
    hn: "",
    age: "",
    weight: "",
    underlying: "",
    drugAllergyHistory: "",
    rashShape: "",
    rashColor: "",
    skinDetach: "",
    onset: ""
  },
  // กันที่ไว้ก่อนสำหรับหน้า 2-3
  page2: {
    resp: { dyspnea: false, wheeze: false },
    cvs: { lowBP: "", tachy: false },
    gi: { nvd: false, diarrhea: false }
  },
  page3: {
    wbc: "",
    eos: "",
    ast: "",
    alt: ""
  },
  assessment: {
    level: "ข้อมูลยังไม่พอประเมิน",
    reason: "ยังไม่มีข้อมูลจากหน้า 1–3",
    usedPages: ["page1", "page2", "page3"]
  }
};

const STORAGE_KEY = "drug_allergy_app_v1";

// โหลดข้อมูลเก่า (ถ้ามี)
(function () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      window.drugAllergyData = Object.assign(window.drugAllergyData, parsed);
    }
  } catch (err) {
    console.warn("โหลดข้อมูลไม่ได้ ใช้ค่าเริ่มต้นแทน");
  }
})();

window.saveDrugAllergyData = function () {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(window.drugAllergyData));
};

// ประเมินอัตโนมัติ (ตอนนี้เอาจากหน้า 1 ก่อน)
window.evaluateDrugAllergy = function () {
  const d = window.drugAllergyData;
  const p1 = d.page1;

  let level = "ข้อมูลยังไม่พอประเมิน";
  const reasons = [];

  if (p1.skinDetach === "gt30") {
    level = "รุนแรงมาก (สงสัย SJS/TEN)";
    reasons.push("ผิวหนังหลุดลอก >30%");
  }

  if (
    p1.onset === "8to21d" &&
    (p1.rashShape === "mp" || p1.rashShape === "target")
  ) {
    if (level === "ข้อมูลยังไม่พอประเมิน") {
      level = "ผื่นแพ้ยาทั่วไป (exanthematous)";
    }
    reasons.push("ผื่น MP + onset 1–3 สัปดาห์");
  }

  d.assessment.level = level;
  d.assessment.reason = reasons.length
    ? reasons.join(" / ")
    : "ยังไม่มีเกณฑ์ชี้ชัด ต้องใส่ข้อมูลเพิ่มจากหน้า 2 และ 3";

  window.saveDrugAllergyData();
};

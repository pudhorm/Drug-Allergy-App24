// data.js
// ศูนย์กลางข้อมูลของแอพ — ทุกหน้าอ่าน/เขียนจากตรงนี้
window.drugAllergyData = {
  // หน้า 1: ผิวหนัง + ข้อมูลผู้ป่วย
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
  // หน้า 2 (ยังไม่ทำ): กันที่ไว้ก่อน
  page2: {
    resp: { dyspnea: false, wheeze: false },
    cvs: { lowBP: "", tachy: false },
    gi: { nvd: false, diarrhea: false }
  },
  // หน้า 3 (ยังไม่ทำ): กันที่ไว้ก่อน
  page3: {
    wbc: "",
    eos: "",
    ast: "",
    alt: ""
  },
  // ผลประเมินรวมที่หน้า 6 จะมาอ่าน
  assessment: {
    level: "ข้อมูลยังไม่พอประเมิน",
    reason: "ยังไม่มีข้อมูลจากหน้า 1–3",
    usedPages: ["page1", "page2", "page3"]
  }
};

// key สำหรับเก็บใน browser
const STORAGE_KEY = "drug_allergy_app_v1";

// โหลดของเก่า (ถ้ามี)
(function () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      window.drugAllergyData = Object.assign(window.drugAllergyData, parsed);
    }
  } catch (err) {
    console.warn("โหลดข้อมูลเก่าไม่ได้ ใช้ค่าเริ่มต้นแทน");
  }
})();

// ฟังก์ชันเซฟ (ทุกหน้าจะเรียกตัวนี้ได้)
window.saveDrugAllergyData = function () {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(window.drugAllergyData));
};

// ฟังก์ชันประเมินอัตโนมัติ
// ตอนนี้ยังเอาข้อมูลจากหน้า 1 ได้บางส่วนก่อน
// เดี๋ยวพอทำหน้า 2–3 แล้วค่อยเติมกฎเพิ่มตรงนี้
window.evaluateDrugAllergy = function () {
  const d = window.drugAllergyData;
  const p1 = d.page1;
  // เมื่อยังไม่มีหน้า 2–3 จริงๆ เราจะประเมินคร่าวๆ จากผิวหนังก่อน

  let level = "ข้อมูลยังไม่พอประเมิน";
  const reasons = [];

  // ถ้าผิวหนังหลุดลอก >30% → ยิงขึ้นรุนแรงไว้ก่อน
  if (p1.skinDetach === "gt30") {
    level = "รุนแรงมาก (สงสัย SJS/TEN)";
    reasons.push("ผิวหนังหลุดลอกมากกว่า 30%");
  }

  // ถ้า onset อยู่ช่วง 8–21 วัน และผื่นเป็น MP → เอาเข้ากลุ่มผื่นแพ้ยาทั่วไปได้
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
    : "ยังไม่มีเกณฑ์ชี้ชัด ต้องใส่ข้อมูลเพิ่ม (โดยเฉพาะหน้า 2 และหน้า 3)";

  window.saveDrugAllergyData();
};

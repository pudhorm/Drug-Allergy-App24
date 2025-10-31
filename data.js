// data.js
// ตัวแปรกลางของแอพ — ทุกหน้าต้องอ่าน/เขียนจากตัวนี้เท่านั้น
window.drugAllergyData = {
  // หน้า 1: ระบบผิวหนัง / ข้อมูลผู้ป่วย
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

  // หน้า 2: ระบบอื่นๆ
  page2: {
    resp: {
      dyspnea: false,
      wheeze: false
    },
    cvs: {
      lowBP: "",
      tachy: false
    },
    gi: {
      nvd: false,
      diarrhea: false
    }
  },

  // หน้า 3: Lab
  page3: {
    wbc: "",
    eos: "",
    ast: "",
    alt: ""
  },

  // หน้า 4: Naranjo (เก็บไว้โชว์ในหน้า 6)
  page4: {
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: "",
    totalScore: ""
  },

  // หน้า 5: Timeline (เก็บไว้โชว์ในหน้า 6)
  page5: {
    suspectDrug: "",
    startDate: "",
    reactionDate: "",
    note: ""
  },

  // หน้า 6: ผลประเมินรวม
  assessment: {
    level: "",
    reason: "",
    usedPages: ["page1", "page2", "page3"]
  }
};

const STORAGE_KEY = "drug_allergy_app_v1";

// โหลดค่าเก่า (ถ้ามี)
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

// ฟังก์ชันเซฟ
window.saveDrugAllergyData = function () {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(window.drugAllergyData));
};

// ฟังก์ชัน "ให้โปรแกรมประเมินอัตโนมัติ" จากหน้า 1–3
// ถ้าคุณจะใส่ความรู้เพิ่ม (เช่น DRESS, SJS/TEN, AGEP, pseudoallergy)
// ให้มาเพิ่มที่ฟังก์ชันนี้เท่านั้น ไม่ต้องแก้หน้าอื่น
window.evaluateDrugAllergy = function () {
  const d = window.drugAllergyData;
  const p1 = d.page1;
  const p2 = d.page2;
  const p3 = d.page3;

  let level = "ข้อมูลยังไม่พอประเมิน";
  const reasons = [];

  // ====== กฎชุดที่ 1: ผิวหนังรุนแรง (จากหน้า 1) ======
  if (p1.skinDetach === "gt30") {
    level = "รุนแรงมาก (สงสัย SJS/TEN)";
    reasons.push("ผิวหนังหลุดลอก >30%");
  }

  // ====== กฎชุดที่ 2: อวัยวะอื่นร่วม (จากหน้า 2) ======
  const lowBP = p2.cvs.lowBP && Number(p2.cvs.lowBP) < 90;
  if (p2.resp.dyspnea || p2.resp.wheeze || lowBP) {
    level = "รุนแรง (anaphylaxis/เกี่ยวข้องหลายระบบ)";
    reasons.push("มีอาการทางระบบหายใจหรือความดันต่ำ");
  }

  // ====== กฎชุดที่ 3: Lab (จากหน้า 3) ======
  if (p3.eos && Number(p3.eos) > 10) {
    if (level === "ข้อมูลยังไม่พอประเมิน") {
      level = "สงสัย DRESS / eosinophilia จากยา";
    }
    reasons.push("Eosinophil สูง (>10%)");
  }

  // ====== กฎชุดที่ 4: onset + ลักษณะผื่น (จากหน้า 1) ======
  if (
    p1.onset === "8to21d" &&
    (p1.rashShape === "mp" || p1.rashShape === "target")
  ) {
    if (level === "ข้อมูลยังไม่พอประเมิน") {
      level = "ผื่นแพ้ยาทั่วไป (exanthematous)";
    }
    reasons.push("ผื่นขึ้นช่วง 1–3 สัปดาห์หลังได้ยา + ลักษณะผื่นเข้าได้");
  }

  // สรุปผลเก็บไว้
  d.assessment.level = level;
  d.assessment.reason = reasons.length
    ? reasons.join(" / ")
    : "ยังไม่มีเกณฑ์ชี้ชัด ต้องใส่ข้อมูลเพิ่มในหน้า 1–3";

  // เซฟทุกครั้ง
  window.saveDrugAllergyData();
};


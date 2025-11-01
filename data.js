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
  drugLines:

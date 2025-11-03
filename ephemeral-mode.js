/* ephemeral-mode.js — เปิดโหมดไม่จำค่าเมื่อรีเฟรช */
(function () {
  // ล้าง localStorage ทุกครั้งที่โหลดเว็บ
  try { localStorage.removeItem("drugAllergyData"); } catch (e) {}

  // โครงเก็บข้อมูลกลางใหม่ทุกครั้ง
  window.drugAllergyData = {};

  // ปิดการบันทึกถาวรทั้งหมด
  window.saveDrugAllergyData = function () {
    // no-op: ไม่บันทึกลง storage ใดๆ
  };

  // ปิดการโหลดข้อมูลเก่าทั้งหมด
  window.loadDrugAllergyData = function () {
    return {}; // บังคับให้ว่างเสมอ
  };
})();

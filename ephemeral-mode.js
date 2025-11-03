// ephemeral-mode.js
(function () {
  try {
    // ล้างที่เก็บชั่วคราว/ถาวร
    localStorage.removeItem("drugAllergyData");
    sessionStorage.clear();

    // ตัดการรีสโตร์/การบันทึกทั้งหมด
    window.loadDrugAllergyData = function () { return {}; };
    window.saveDrugAllergyData = function () { /* no-op: ไม่บันทึก */ };

    // รีเซ็ตตัวแปรกลาง ให้เริ่มใหม่ทุกครั้ง
    window.drugAllergyData = {};
  } catch (e) {
    console.warn("ephemeral-mode init error:", e);
  }
})();

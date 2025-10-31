// page6.js
window.renderPage6 = function () {
  const d = window.drugAllergyData;
  const el = document.getElementById("page6");
  el.innerHTML = `
    <h2>หน้า 6 ผลการประเมิน</h2>
    <div class="card">
      <p><strong>ระดับการสงสัย:</strong> ${d.assessment.level || "-"}</p>
      <p><strong>เหตุผล:</strong> ${d.assessment.reason || "-"}</p>
      <p class="small-note">* ตอนนี้ยังคำนวณจากหน้า 1 อย่างเดียว เดี๋ยวเราค่อยเสริมหน้า 2–3</p>
    </div>
  `;
};

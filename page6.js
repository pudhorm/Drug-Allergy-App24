// page6.js
function renderSummary() {
  const box = document.getElementById("summary-box");
  const d = window.drugAllergyData || {};
  box.innerHTML = `
    <h3>📊 ข้อมูลจากทุกหน้า</h3>
    <pre style="white-space:pre-wrap; background:#f8fafc; padding:.75rem; border-radius:.5rem;">


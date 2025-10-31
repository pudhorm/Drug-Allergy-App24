// page6.js
function renderSummary() {
  const box = document.getElementById("summary-box");
  if (!box) return; // ถ้ายังหาไม่เจอให้หยุดเลย

  // ดึงจาก localStorage ก่อน
  let d = {};
  const saved = localStorage.getItem("drugAllergyData");
  if (saved) {
    try {
      d = JSON.parse(saved);
    } catch (e) {
      d = window.drugAllergyData || {};
    }
  } else {
    d = window.drugAllergyData || {};
  }

  const patient = d.patient || {};
  const skin = d.skin || {};

  box.innerHTML = `
    <div style="display:grid; gap:1rem;">
      <div style="background:white; padding:1rem 1.25rem; border-radius:.75rem; box-shadow:0 1px 5px rgba(0,0,0,.03);">
        <h3>🧑‍⚕️ ข้อมูลผู้ป่วย</h3>
        <p><strong>ชื่อ-สกุล:</strong> ${patient.name || "-"}</p>
        <p><strong>HN:</strong> ${patient.hn || "-"}</p>
        <p><strong>อายุ:</strong> ${patient.age || "-"}</p>
        <p><strong>น้ำหนัก:</strong> ${patient.weight || "-"}</p>
        <p><strong>โรคประจำตัว:</strong> ${patient.underlying || "-"}</p>
        <p><strong>ประวัติการแพ้ยาเดิม:</strong> ${patient.drugAllergyHistory || "-"}</p>
      </div>

      <div style="background:white; padding:1rem 1.25rem; border-radius:.75rem; box-shadow:0 1px 5px rgba(0,0,0,.03);">
        <h3>🩹 อาการทางผิวหนัง (จากหน้า 1)</h3>
        <p><strong>รูปร่างผื่น:</strong> ${(skin.rashShape && skin.rashShape.length) ? skin.rashShape.join(", ") : "ยังไม่ระบุ"}</p>
        <p><strong>สีผื่น:</strong> ${(skin.rashColor && skin.rashColor.length) ? skin.rashColor.join(", ") : "ยังไม่ระบุ"}</p>
        <p><strong>ตุ่มน้ำ:</strong> ${(skin.blister && skin.blister.length) ? skin.blister.join(", ") : "ยังไม่ระบุ"}</p>
        <p><strong>ผิวหนังหลุดลอก:</strong> ${skin.peeling || "ยังไม่ระบุ"}</p>
        <p><strong>อาการคัน:</strong> ${(skin.itch && skin.itch.length) ? skin.itch.join(", ") : "ยังไม่ระบุ"}</p>
        <p><strong>ปวด/แสบ/เจ็บ:</strong> ${(skin.pain && skin.pain.length) ? skin.pain.join(", ") : "ยังไม่ระบุ"}</p>
        <p><strong>บวม:</strong> ${(skin.swelling && skin.swelling.length) ? skin.swelling.join(", ") : "ยังไม่ระบุ"}</p>
        <p><strong>ตำแหน่งที่พบผื่น:</strong> ${skin.location || "ยังไม่ระบุตำแหน่ง"}</p>
        <p><strong>การกระจายตัว:</strong> ${skin.distribution || "ยังไม่ระบุ"}</p>
        <p><strong>น้ำเหลือง/สะเก็ด:</strong> ${skin.exudate || "ยังไม่ระบุ"}</p>
        <p><strong>ระยะเวลาที่เริ่มมีอาการ:</strong> ${skin.onset || "ยังไม่ระบุ"}</p>
      </div>

      <div style="background:white; padding:1rem 1.25rem; border-radius:.75rem; box-shadow:0 1px 5px rgba(0,0,0,.03);">
        <h3>📦 ข้อมูลดิบทั้งหมด (debug)</h3>
        <pre style="white-space:pre-wrap; background:#f8fafc; padding:.75rem; border-radius:.5rem; font-size:.8rem;">${JSON.stringify(d, null, 2)}</pre>
      </div>
    </div>
  `;
}

// โหลดมาหน้า 6 แล้วให้ลองเรนเดอร์เลย
document.addEventListener("DOMContentLoaded", () => {
  const box = document.getElementById("summary-box");
  if (box) {
    renderSummary();
  }
});

// page6.js
function renderSummary() {
  const box = document.getElementById("summary-box");
  if (!box) return;

  const d = window.drugAllergyData || {};
  const patient = d.patient || {};
  const skin = d.skin || {};
  const other = d.otherSystems || {};
  const labs = d.labs || {};

  // แปลง array ให้สวยหน่อย
  const skinRashShape = Array.isArray(skin.rashShape) && skin.rashShape.length
    ? skin.rashShape.join(", ")
    : "ยังไม่ระบุ";

  const skinRashColor = Array.isArray(skin.rashColor) && skin.rashColor.length
    ? skin.rashColor.join(", ")
    : "ยังไม่ระบุ";

  const skinBlister = Array.isArray(skin.blister) && skin.blister.length
    ? skin.blister.join(", ")
    : "ยังไม่ระบุ";

  const skinItch = Array.isArray(skin.itch) && skin.itch.length
    ? skin.itch.join(", ")
    : (skin.itch ? skin.itch : "ยังไม่ระบุ");

  const skinSwelling = Array.isArray(skin.swelling) && skin.swelling.length
    ? skin.swelling.join(", ")
    : (skin.swelling ? skin.swelling : "ยังไม่ระบุ");

  const skinPain = Array.isArray(skin.pain) && skin.pain.length
    ? skin.pain.join(", ")
    : (skin.pain ? skin.pain : "ยังไม่ระบุ");

  box.innerHTML = `
    <div style="display:grid; gap:1rem;">
      <!-- ผู้ป่วย -->
      <div style="background:white; padding:1rem 1.25rem; border-radius:.75rem; box-shadow:0 1px 5px rgba(0,0,0,.03);">
        <h3>🧑‍⚕️ ข้อมูลผู้ป่วย</h3>
        <p><strong>ชื่อ-สกุล:</strong> ${patient.name || "-"}</p>
        <p><strong>HN:</strong> ${patient.hn || "-"}</p>
        <p><strong>อายุ:</strong> ${patient.age || "-"}</p>
        <p><strong>น้ำหนัก:</strong> ${patient.weight || "-"}</p>
        <p><strong>โรคประจำตัว:</strong> ${patient.underlying || "-"}</p>
        <p><strong>ประวัติการแพ้ยาเดิม:</strong> ${patient.drugAllergyHistory || "-"}</p>
      </div>

      <!-- ผิวหนัง -->
      <div style="background:white; padding:1rem 1.25rem; border-radius:.75rem; box-shadow:0 1px 5px rgba(0,0,0,.03);">
        <h3>🩹 อาการทางผิวหนัง (จากหน้า 1)</h3>
        <p><strong>รูปร่างผื่น:</strong> ${skinRashShape}</p>
        <p><strong>สีผื่น:</strong> ${skinRashColor}</p>
        <p><strong>ตุ่มน้ำ:</strong> ${skinBlister}</p>
        <p><strong>ผิวหนังหลุดลอก:</strong> ${skin.peeling || "ยังไม่ระบุ"}</p>
        <p><strong>อาการคัน:</strong> ${skinItch}</p>
        <p><strong>ปวด/แสบ/เจ็บ:</strong> ${skinPain}</p>
        <p><strong>บวม:</strong> ${skinSwelling}</p>
        <p><strong>ตำแหน่งที่พบผื่น:</strong> ${skin.location || "ยังไม่ระบุตำแหน่ง"}</p>
        <p><strong>การกระจายตัว:</strong> ${skin.distribution || "ยังไม่ระบุ"}</p>
        <p><strong>น้ำเหลือง/สะเก็ด:</strong> ${skin.exudate || "ยังไม่ระบุ"}</p>
        <p><strong>ระยะเวลาที่เริ่มมีอาการ:</strong> ${skin.onset || "ยังไม่ระบุ"}</p>
      </div>

      <!-- ข้อมูลดิบทั้งหมด -->
      <div style="background:white; padding:1rem 1.25rem; border-radius:.75rem; box-shadow:0 1px 5px rgba(0,0,0,.03);">
        <h3>📦 ข้อมูลดิบทั้งหมด (debug)</h3>
        <pre style="white-space:pre-wrap; background:#f8fafc; padding:.75rem; border-radius:.5rem; font-size:.8rem;">${JSON.stringify(d, null, 2)}</pre>
      </div>
    </div>
  `;
}

// ถ้าคลิกปุ่มในหน้า 6 ก็จะเรียกฟังก์ชันนี้อยู่แล้ว
// แต่เผื่อคนลืมคลิก เราให้มันแสดงครั้งแรกตอนโหลดด้วยก็ได้
document.addEventListener("DOMContentLoaded", () => {
  // หน้าอื่นก็จะเรียกนะ แต่ถ้าไม่มี summary-box ก็ไม่ทำอะไร
  const box = document.getElementById("summary-box");
  if (box) {
    renderSummary();
  }
});

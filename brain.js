// ===================== brain.js (REPLACE WHOLE FILE) =====================
(function () {
  // ===== จุดหมายการเรนเดอร์: เฉพาะหน้า 6 =====
  function renderIntoPage6(html) {
    var box = document.getElementById("p6BrainBox");
    if (!box) return;
    box.innerHTML = html;
  }

  // ===== ตัวช่วย: ถือว่า “บันทึกแล้ว/พอมีข้อมูล” ถ้ามีธง __saved หรือมีข้อมูลจริงอย่างน้อย 1 ฟิลด์ =====
  function isSavedOrHasData(pageObj) {
    if (!pageObj) return false;
    if (pageObj.__saved) return true;
    // มีคีย์ที่ไม่ใช่เมตาอย่างน้อย 1 อันถือว่า “กรอกมาแล้วบางส่วน”
    var keys = Object.keys(pageObj).filter(function (k) { return k.indexOf("__") !== 0; });
    return keys.length > 0;
  }

  // ===== คำนวณผลสรุป: ใช้ window.brainRules ถ้ามี =====
  function computeSummary() {
    var d = window.drugAllergyData || {};

    // ➜ เดิม: บังคับต้องมี __saved ครบ 1–3
    // ➜ ใหม่: ยอมรับทั้งกรณี __saved หรือมีข้อมูลจริงอย่างน้อย 1 ช่องในหน้านั้น
    var ok1 = isSavedOrHasData(d.page1);
    var ok2 = isSavedOrHasData(d.page2);
    var ok3 = isSavedOrHasData(d.page3);
    var ready = !!(ok1 && ok2 && ok3);

    if (!ready) {
      return '<div class="p6-muted">ยังไม่มีข้อมูลเพียงพอจากหน้า 1–3 หรือยังไม่คำนวณ</div>';
    }

    // ต้องมีสมอง/กฎ
    var rules = window.brainRules || null;
    if (!rules) {
      return '<div class="p6-muted">ยังไม่ได้ใส่ “สมอง/กฎการให้คะแนน” ของ 21 กลุ่ม<br/>คุณสามารถเพิ่มกฎใน <code>window.brainRules</code> ภายหลังได้</div>';
    }

    // เรียก score ทุกกลุ่ม → จัดอันดับ
    var results = [];
    Object.keys(rules).forEach(function (key) {
      try {
        var fn = rules[key] && rules[key].score;
        var sc = (typeof fn === "function") ? Number(fn(d)) || 0 : 0;
        results.push({ key: key, name: rules[key].title || key, score: sc });
      } catch (e) { /* ignore */ }
    });

    // ถ้าไม่มีคะแนนเลย
    if (!results.length) {
      return '<div class="p6-empty">ยังไม่มีผล</div>';
    }

    // เรียงมาก→น้อย แล้วตัดเหลือ 3 อันดับแรก (คงรูปแบบเดิม)
    results.sort(function(a,b){ return b.score - a.score; });
    var top3 = results.slice(0, 3);

    // แสดงเฉพาะชื่อ “ไม่โชว์คะแนน”
    var listHTML = top3.map(function (r, i) {
      return '<li><strong>' + (i+1) + ')</strong> ' + r.name + '</li>';
    }).join("");

    var topName = top3[0] ? top3[0].name : "";

    return '' +
      '<div>' +
        (topName ? '<div style="font-weight:800;margin-bottom:.35rem;">ผลเด่น: ' + topName + '</div>' : '') +
        '<ol class="p6-list">' + (listHTML || '<li>ยังไม่มีผล</li>') + '</ol>' +
      '</div>';
  }

  // ===== ฟังก์ชันสาธารณะ: ให้หน้า 6 เรียกใช้ =====
  function brainComputeAndRender() {
    try {
      renderIntoPage6('<div class="p6-muted">กำลังประมวลผล…</div>');
      var html = computeSummary();
      renderIntoPage6(html);
    } catch (e) {
      renderIntoPage6('<div class="p6-empty">เกิดข้อผิดพลาดในการคำนวณ</div>');
      console.error("[brain] compute error:", e);
    }
  }

  // export
  window.brainComputeAndRender = brainComputeAndRender;

  // เฝ้าฟังเหตุการณ์อัพเดตข้อมูล → รีเฟรชผลอัตโนมัติเมื่ออยู่หน้า 6
  document.addEventListener("da:update", function () {
    var page6 = document.getElementById("page6");
    if (page6 && page6.classList.contains("visible")) {
      if (window.brainComputeAndRender) window.brainComputeAndRender();
    }
  });
})();

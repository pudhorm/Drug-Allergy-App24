// ===================== brain.js (REPLACE WHOLE FILE) =====================
// กลไกประเมิน ADR แบบโหมด C (ใช้เฉพาะตัวที่ถูกติ้ก) + กราฟสรุป 21 ADR เป็นเปอร์เซ็นต์
// เวอร์ชันนี้ออกแบบให้:
//   • ไม่ทำให้หน้าเว็บล้ม ถ้าข้อมูลไม่ครบ / โครงสร้างเปลี่ยน
//   • ซ่อนบล็อก "กราฟผลคะแนนย่อย (Top signals)" ออกจากหน้า 6
//   • แสดงกราฟแนวนอนสำหรับ ADR ครบ 21 รายการ เรียงตามเปอร์เซ็นต์มากไปน้อย
//   • ในส่วน "รายละเอียดตัวแปรที่ถูกนับ" จะแสดงทุก ADR ที่มีคะแนน > 0 (ถูกคิดคะแนนจริง)

(function () {
  // -----------------------------------------------------------------------
  // 1) Utilities
  // -----------------------------------------------------------------------
  function getData() {
    return window.drugAllergyData || {};
  }

  function esc(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function createScoreBox() {
    return { total: 0, max: 0, tokens: [] };
  }

  function addToken(box, label, usedWeight, maxWeight) {
    if (!box) return;
    if (typeof usedWeight !== "number") usedWeight = 0;
    if (typeof maxWeight !== "number") maxWeight = usedWeight;
    box.total += usedWeight;
    box.max += maxWeight;
    box.tokens.push({ label: label, w: usedWeight });
  }

  function toPercent(score, maxScore) {
    if (!maxScore || maxScore <= 0) return 0;
    var p = Math.round((score / maxScore) * 100);
    if (p < 0) p = 0;
    if (p > 100) p = 100;
    return p;
  }

  function renderIntoPage6(html) {
    var box = document.getElementById("p6BrainBox");
    if (!box) return;
    box.innerHTML = html;
  }

  // ซ่อนส่วน "กราฟผลคะแนนย่อย (Top signals)" โดยค้นหาจากข้อความ
  function hideTopSignalsSection() {
    try {
      // ถ้ามี id โดยตรงใช้ก่อน
      var byId = document.getElementById("p6TopSignalsBox");
      if (byId) {
        byId.style.display = "none";
        return;
      }

      // ถ้าไม่มี id ให้ค้นหาบล็อกที่มีคำว่า "Top signals"
      var nodes = document.querySelectorAll("section, div, article, .card, .box");
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (!el || !el.textContent) continue;
        if (el.textContent.indexOf("Top signals") !== -1) {
          el.style.display = "none";
          break;
        }
      }
    } catch (e) {
      console.error("hideTopSignalsSection error", e);
    }
  }

  // helper เล็ก ๆ สำหรับอ่าน array / flag (ให้ปลอดภัยถ้า key เปลี่ยน)
  function hasInArray(arr, value) {
    return Array.isArray(arr) && arr.indexOf(value) !== -1;
  }

  // -----------------------------------------------------------------------
  // 2) กฎประเมินบางส่วน (เริ่มทำละเอียด 5 กลุ่มก่อน)
  //    ใช้งานเฉพาะตัวแปรที่ถูกติ้กจริง ๆ เท่านั้น
  //    ถ้า field ไม่เจอจะถือว่า "ไม่ถูกติ้ก" และไม่ให้คะแนน
  // -----------------------------------------------------------------------

  // NOTE: โครงสร้าง data ด้านล่างเดาให้เข้ากับโค้ดหน้า 1–3 เวอร์ชันล่าสุด:
  //   d.page1 : ข้อมูลผิวหนัง
  //   d.page2 : ระบบอื่น ๆ
  //   d.page3 : Lab
  // ถ้าโครงสร้างจริงต่างไป ฟังก์ชันจะให้คะแนน = 0 โดยอัตโนมัติ (แต่ไม่ทำให้เว็บล่ม)

  function evalUrticaria(d) {
    var box = createScoreBox();
    var p1 = d.page1 || {};
    var shapes = p1.shapes || p1.rashShapes || [];
    var colors = p1.colors || p1.rashColors || [];
    var locs   = p1.locations || p1.rashLocations || [];
    var onset  = p1.onset || p1.onsetTiming || "";

    // 1) รูปร่าง
    if (hasInArray(shapes, "ขอบหยัก")) addToken(box, "รูปร่าง: ขอบหยัก", 1, 1);
    if (hasInArray(shapes, "วงกลม")) addToken(box, "รูปร่าง: วงกลม", 1, 1);
    if (hasInArray(shapes, "ขอบวงนูนแดงด้านในเรียบ")) {
      addToken(box, "รูปร่าง: ขอบวงนูนแดงด้านในเรียบ", 1, 1);
    }

    // 2) สี
    if (hasInArray(colors, "แดง")) addToken(box, "สี: แดง", 1, 1);
    if (hasInArray(colors, "แดงซีด")) addToken(box, "สี: แดงซีด", 1, 1);
    if (hasInArray(colors, "ซีด")) addToken(box, "สี: ซีด", 1, 1);
    if (hasInArray(colors, "สีผิวปกติ")) addToken(box, "สี: สีผิวปกติ", 1, 1);

    // 3) ลักษณะสำคัญ (x2)
    if (hasInArray(shapes, "ตุ่มนูน")) addToken(box, "ตุ่มนูน (เกณฑ์หลัก x2)", 2, 2);
    if (hasInArray(shapes, "ปื้นนูน")) addToken(box, "ปื้นนูน (เกณฑ์หลัก x2)", 2, 2);

    // 4) คัน
    if (p1.itch && (p1.itch === true || p1.itch.value === "คัน" || p1.itch.has)) {
      addToken(box, "คัน", 1, 1);
    }

    // 5) บวม (พบน้อย)
    if (p1.swelling && (p1.swelling === true || p1.swelling.has)) {
      addToken(box, "บวม (พบน้อย)", 1, 1);
    }

    // 6) ตำแหน่ง
    var locList = [
      "ทั่วร่างกาย", "มือ", "เท้า", "แขน", "ขา",
      "หน้า", "รอบดวงตา", "ลำคอ", "ลำตัว", "หลัง"
    ];
    for (var i = 0; i < locList.length; i++) {
      if (hasInArray(locs, locList[i])) {
        addToken(box, "ตำแหน่ง: " + locList[i], 1, 1);
      }
    }

    // 7) ระยะเวลา: ภายใน 1 ชม.
    if (onset === "1h" || onset === "ภายใน 1 ชั่วโมง") {
      addToken(box, "ระยะเวลา: ภายใน 1 ชั่วโมง", 1, 1);
    }

    return box;
  }

  function evalAnaphylaxis(d) {
    var box = createScoreBox();
    var p1 = d.page1 || {};
    var p2 = d.page2 || {};
    var p3 = d.page3 || {};

    var shapes = p1.shapes || p1.rashShapes || [];
    var colors = p1.colors || p1.rashColors || [];
    var onset  = p1.onset || p1.onsetTiming || "";

    // รูปร่าง
    if (hasInArray(shapes, "ตุ่มนูน")) addToken(box, "รูปร่าง: ตุ่มนูน", 1, 1);
    if (hasInArray(shapes, "ปื้นนูน")) addToken(box, "รูปร่าง: ปื้นนูน", 1, 1);
    if (p1.swelling && (p1.swelling === true || p1.swelling.has)) {
      addToken(box, "รูปร่าง: บวม", 1, 1);
    }
    if (hasInArray(shapes, "นูนหนา")) addToken(box, "รูปร่าง: นูนหนา", 1, 1);
    if (hasInArray(shapes, "ตึง") || hasInArray(shapes, "ผิวหนังตึง")) {
      addToken(box, "รูปร่าง: ตึง", 1, 1);
    }

    // ลักษณะสำคัญ (x2) ระบบหายใจ
    var resp = p2.resp || {};
    var misc = p2.misc || {};
    var cv   = p2.cv || {};
    var vit  = p2.vitals || {};

    if (resp.wheeze) {
      addToken(box, "หายใจมีเสียงวี๊ด (เกณฑ์หลัก x2)", 2, 2);
    }

    var rr = Number(resp.RR || vit.RR || misc.RR || 0);
    var hr = Number(resp.HR || vit.HR || misc.HR || 0);
    var spo2 = Number(resp.SpO2 || vit.SpO2 || misc.SpO2 || 0);

    var severeResp =
      resp.dyspnea ||
      rr > 21 ||
      hr > 100 ||
      (spo2 && spo2 < 94);

    if (severeResp) {
      addToken(
        box,
        "หอบเหนื่อย/หายใจลำบาก (RR>21 หรือ HR>100 หรือ SpO₂<94%) (เกณฑ์หลัก x2)",
        2,
        2
      );
    }

    // อาการเพิ่มเติมทางผิวหนัง
    if (p1.itch && (p1.itch === true || p1.itch.has)) addToken(box, "คัน", 1, 1);
    if (hasInArray(colors, "แดง")) addToken(box, "ผื่นแดง", 1, 1);
    if (hasInArray(colors, "สีผิวปกติ")) addToken(box, "สีผิวปกติ", 1, 1);

    // อาการ GI (พบน้อย)
    var gi = p2.gi || {};
    if (gi.diarrhea) addToken(box, "ท้องเสีย (พบน้อย)", 1, 1);
    if (gi.dysphagia) addToken(box, "กลืนลำบาก (พบน้อย)", 1, 1);
    if (gi.cramp) addToken(box, "ปวดบิดท้อง (พบน้อย)", 1, 1);
    if (gi.nausea || gi.vomiting) addToken(box, "คลื่นไส้/อาเจียน (พบน้อย)", 1, 1);

    // ระยะเวลา
    if (onset === "1h" || onset === "ภายใน 1 ชั่วโมง" ||
        onset === "1to6h" || onset === "ภายใน 1–6 ชั่วโมง") {
      addToken(box, "ระยะเวลา: ภายใน 6 ชั่วโมง", 1, 1);
    }

    // ความดันต่ำ
    if (cv.hypotension || misc.hypotension) {
      addToken(box, "BP ต่ำ (<90/60)", 1, 1);
    }
    if (cv.drop30 || misc.drop30) {
      addToken(box, "BP ลดลง ≥30–40 mmHg จาก baseline", 1, 1);
    }

    // Lab/ชีพจร
    if (hr > 100) addToken(box, "HR สูง (>100)", 1, 1);
    if (spo2 && spo2 < 94) addToken(box, "SpO₂ <94%", 1, 1);

    return box;
  }

  function evalAngioedema(d) {
    var box = createScoreBox();
    var p1 = d.page1 || {};

    var shapes = p1.shapes || p1.rashShapes || [];
    var colors = p1.colors || p1.rashColors || [];
    var locs   = p1.locations || p1.rashLocations || [];
    var onset  = p1.onset || p1.onsetTiming || "";
    var pain   = p1.pain || {};

    if (hasInArray(shapes, "นูนหนา")) addToken(box, "รูปร่าง: นูนหนา", 1, 1);
    if (hasInArray(shapes, "ขอบไม่ชัดเจน")) addToken(box, "รูปร่าง: ขอบไม่ชัดเจน", 1, 1);

    if (hasInArray(colors, "สีผิวปกติ")) addToken(box, "สี: สีผิวปกติ", 1, 1);
    if (hasInArray(colors, "แดง")) addToken(box, "สี: แดง", 1, 1);

    if (p1.swelling && (p1.swelling === true || p1.swelling.has)) {
      addToken(box, "บวม (เกณฑ์หลัก x2)", 2, 2);
    }

    if (hasInArray(shapes, "ตึง") || hasInArray(shapes, "ผิวหนังตึง")) {
      addToken(box, "ผิวหนังตึง", 1, 1);
    }

    if (p1.itch && p1.itch.has) addToken(box, "คัน (พบน้อย)", 1, 1);
    if (!p1.itch || !p1.itch.has) addToken(box, "ไม่คัน (พบน้อย)", 1, 1);

    if (pain.pain) addToken(box, "ปวด (พบน้อย)", 1, 1);
    if (pain.burn) addToken(box, "แสบ (พบน้อย)", 1, 1);

    var locList = ["ริมฝีปาก", "รอบดวงตา", "ลิ้น", "อวัยวะเพศ"];
    for (var i = 0; i < locList.length; i++) {
      if (hasInArray(locs, locList[i])) {
        addToken(box, "ตำแหน่ง: " + locList[i], 1, 1);
      }
    }

    if (onset === "1h" || onset === "ภายใน 1 ชั่วโมง") {
      addToken(box, "ระยะเวลา: ภายใน 1 ชั่วโมง", 1, 1);
    }

    return box;
  }

  function evalMaculoPapular(d) {
    var box = createScoreBox();
    var p1 = d.page1 || {};
    var p2 = d.page2 || {};
    var p3 = d.page3 || {};

    var shapes = p1.shapes || p1.rashShapes || [];
    var colors = p1.colors || p1.rashColors || [];
    var locs   = p1.locations || p1.rashLocations || [];
    var onset  = p1.onset || p1.onsetTiming || "";
    var dist   = p1.distribution || "";

    if (hasInArray(shapes, "ปื้นแดง")) addToken(box, "รูปร่าง: ปื้นแดง", 1, 1);
    if (hasInArray(shapes, "ปื้นนูน")) addToken(box, "รูปร่าง: ปื้นนูน", 1, 1);
    if (hasInArray(shapes, "ตุ่มนูน")) addToken(box, "รูปร่าง: ตุ่มนูน", 1, 1);

    if (hasInArray(colors, "แดง")) addToken(box, "สี: แดง", 1, 1);

    if (hasInArray(shapes, "จุดเล็กแดง")) addToken(box, "จุดเล็กแดง (เกณฑ์หลัก x2)", 2, 2);

    if (p1.itch && p1.itch.has) addToken(box, "คัน", 1, 1);

    var misc = p2.misc || {};
    var fever = misc.fever || misc.tempHigh || false;
    var eosPct = NaN;
    if (p3.cbc && p3.cbc.eosPct != null) {
      eosPct = Number(p3.cbc.eosPct);
    }
    if (fever) addToken(box, "ไข้ Temp > 37.5 °C", 1, 1);
    if (eosPct > 5) addToken(box, "Eosinophil >5%", 1, 1);

    if (dist === "สมมาตร" || dist === "symmetrical") {
      addToken(box, "การกระจายตัว: สมมาตร", 1, 1);
    }

    var locList = ["ลำตัว", "แขน", "หน้า", "ลำคอ"];
    for (var i = 0; i < locList.length; i++) {
      if (hasInArray(locs, locList[i])) {
        addToken(box, "ตำแหน่ง: " + locList[i], 1, 1);
      }
    }

    if (
      onset === "1to6h" || onset === "6to24h" ||
      onset === "1w" || onset === "2w" ||
      onset === "ภายใน 1-6 ชั่วโมง" || onset === "ภายใน 6-24 ชั่วโมง" ||
      onset === "ภายใน 1 สัปดาห์" || onset === "ภายใน 2 สัปดาห์"
    ) {
      addToken(box, "ระยะเวลา: เข้าเกณฑ์", 1, 1);
    }

    var organs = p2.organsFlags || {};
    if (organs.lymph || organs.lymphNode) addToken(box, "ต่อมน้ำเหลืองโต", 1, 1);
    if (organs.arhtritis || organs.arthritis) addToken(box, "ข้ออักเสบ", 1, 1);
    if (organs.nephritis || organs.kidney) addToken(box, "ไตอักเสบ", 1, 1);
    if (organs.hepatitis || organs.liver) addToken(box, "ตับอักเสบ", 1, 1);

    return box;
  }

  function evalFDE(d) {
    var box = createScoreBox();
    var p1 = d.page1 || {};
    var p2 = d.page2 || {};

    var shapes   = p1.shapes || p1.rashShapes || [];
    var colors   = p1.colors || p1.rashColors || [];
    var locs     = p1.locations || p1.rashLocations || [];
    var onset    = p1.onset || p1.onsetTiming || "";
    var pain     = p1.pain || {};
    var blisters = p1.blisters || {};
    var peeling  = p1.peeling || p1.skinDetach || {};
    var misc2    = p2.misc || {};
    var gi       = p2.gi || {};

    if (hasInArray(shapes, "วงกลม")) addToken(box, "รูปร่าง: วงกลม", 1, 1);
    if (hasInArray(shapes, "วงรี")) addToken(box, "รูปร่าง: วงรี", 1, 1);

    if (hasInArray(colors, "แดง")) addToken(box, "สี: แดง", 1, 1);
    if (hasInArray(colors, "ดำ") || hasInArray(colors, "ดำ/คล้ำ")) {
      addToken(box, "สี: ดำ/คล้ำ", 1, 1);
    }
    if (hasInArray(colors, "ม่วง/คล้ำ")) {
      addToken(box, "สี: ม่วง/คล้ำ (เกณฑ์หลัก x3)", 3, 3);
    }

    if (peeling.center || peeling.centerPeel) {
      addToken(box, "ผิวหนังหลุดลอกตรงกลางผื่น", 1, 1);
    }
    if (pain.pain || pain.sore) addToken(box, "เจ็บ", 1, 1);
    if (pain.burn) addToken(box, "แสบ", 1, 1);
    if (hasInArray(shapes, "ตึง") || hasInArray(shapes, "ผิวหนังตึง")) {
      addToken(box, "ตึง", 1, 1);
    }

    if (p1.swelling && (p1.swelling === true || p1.swelling.has)) {
      addToken(box, "บวม (พบน้อย)", 1, 1);
    }

    if (blisters.small) addToken(box, "ตุ่มน้ำขนาดเล็ก", 1, 1);
    if (blisters.medium) addToken(box, "ตุ่มน้ำขนาดกลาง", 1, 1);
    if (blisters.large) addToken(box, "ตุ่มน้ำขนาดใหญ่", 1, 1);

    var locList = [
      "ริมฝีปาก", "หน้า", "มือ", "เท้า",
      "แขน", "ขา", "อวัยวะเพศ", "ตำแหน่งเดิมกับครั้งก่อน"
    ];
    for (var i = 0; i < locList.length; i++) {
      if (hasInArray(locs, locList[i])) {
        addToken(box, "ตำแหน่ง: " + locList[i], 1, 1);
      }
    }

    if (
      onset === "1w" || onset === "2w" ||
      onset === "ภายใน 1 สัปดาห์" || onset === "ภายใน 2 สัปดาห์"
    ) {
      addToken(box, "ระยะเวลา: 1–2 สัปดาห์", 1, 1);
    }

    if (misc2.fever) addToken(box, "ไข้", 1, 1);
    if (gi.nausea || gi.vomiting) addToken(box, "คลื่นไส้/อาเจียน", 1, 1);

    if (hasInArray(shapes, "ขอบเรียบ")) addToken(box, "ขอบเรียบ", 1, 1);
    if (hasInArray(shapes, "ขอบเขตชัด")) addToken(box, "ขอบเขตชัดเจน", 1, 1);

    return box;
  }

  // ADR อื่น ๆ ยังไม่ได้ใส่เกณฑ์ละเอียด ใช้ evalNoop ไว้ก่อน (คะแนน = 0)
  function evalNoop(/*d*/) {
    return createScoreBox();
  }

  // -----------------------------------------------------------------------
  // 3) รายการ 21 ADR และการคำนวณรวม
  // -----------------------------------------------------------------------
  var ADR_EVALS = [
    { id: "urticaria",        label: "Urticaria",                             fn: evalUrticaria },
    { id: "anaphylaxis",      label: "Anaphylaxis",                           fn: evalAnaphylaxis },
    { id: "angioedema",       label: "Angioedema",                            fn: evalAngioedema },
    { id: "maculopapular",    label: "Maculopapular rash",                    fn: evalMaculoPapular },
    { id: "fde",              label: "Fixed drug eruption",                   fn: evalFDE },
    { id: "agep",             label: "AGEP",                                  fn: evalNoop },
    { id: "sjs",              label: "SJS",                                   fn: evalNoop },
    { id: "ten",              label: "TEN",                                   fn: evalNoop },
    { id: "dress",            label: "DRESS",                                 fn: evalNoop },
    { id: "em",               label: "Erythema multiforme (EM)",              fn: evalNoop },
    { id: "photo",            label: "Photosensitivity drug eruption",        fn: evalNoop },
    { id: "exfol",            label: "Exfoliative dermatitis",                fn: evalNoop },
    { id: "eczema",           label: "Eczematous drug eruption",              fn: evalNoop },
    { id: "bullous",          label: "Bullous Drug Eruption",                 fn: evalNoop },
    { id: "serum",            label: "Serum sickness",                        fn: evalNoop },
    { id: "vasculitis",       label: "Vasculitis",                            fn: evalNoop },
    { id: "hemolytic",        label: "Hemolytic anemia",                      fn: evalNoop },
    { id: "pancytopenia",     label: "Pancytopenia",                          fn: evalNoop },
    { id: "neutropenia",      label: "Neutropenia",                           fn: evalNoop },
    { id: "thrombocytopenia", label: "Thrombocytopenia",                      fn: evalNoop },
    { id: "nephritis",        label: "Nephritis",                             fn: evalNoop }
  ];

  function evaluateAllADR() {
    var d = getData();

    var results = [];
    for (var i = 0; i < ADR_EVALS.length; i++) {
      var R = ADR_EVALS[i];
      try {
        var box = R.fn(d) || createScoreBox();
        var pct = toPercent(box.total, box.max || 0);
        results.push({
          id: R.id,
          label: R.label,
          total: box.total,
          max: box.max || 0,
          percent: pct,
          tokens: box.tokens || []
        });
      } catch (e) {
        console.error("ADR eval error for", R.id, e);
      }
    }

    // เรียงจากเปอร์เซ็นต์มากไปน้อย
    results.sort(function (a, b) {
      return b.percent - a.percent;
    });

    return results;
  }

  // -----------------------------------------------------------------------
  // 4) วาดผลลัพธ์ลงหน้า 6
  // -----------------------------------------------------------------------
  function renderSummary(results) {
    if (!results || !results.length) {
      renderIntoPage6(
        '<div class="p6-muted">ยังไม่มีสัญญาณเด่นพอจากข้อมูลที่กรอก หากต้องการประเมิน โปรดกรอกข้อมูลหน้า 1–3 แล้วกด "บันทึก" ก่อน</div>'
      );
      return;
    }

    var html = "";
    html += '<section class="p6-section">';
    html += '  <h3 class="p6-section-title">📊 สรุปคะแนนเป็นเปอร์เซ็นต์ (ครบ 21 ADR)</h3>';
    html += '  <div class="p6-top5-list">';

    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      var rankNo = i + 1;
      var rankLabel = rankNo < 10 ? "0" + rankNo : "" + rankNo;
      var barPercent = r.percent;

      html += '    <div class="p6-top5-item">';
      html += '      <div class="p6-top5-rank">' + rankLabel + "</div>";
      html += '      <div class="p6-top5-main">';
      html += '        <div class="p6-top5-name">' + esc(r.label) + "</div>";
      html += '        <div class="p6-top5-bar-wrap">';
      html += '          <div class="p6-top5-bar-bg">';
      html += '            <div class="p6-top5-bar-fill" style="width:' + barPercent + '%;"></div>';
      html += "          </div>";
      html += "        </div>";
      html += "      </div>";
      html += '      <div class="p6-top5-score">' + r.percent + "%</div>";
      html += "    </div>";
    }

    html += "  </div>";

    // รายละเอียดตัวแปรที่ถูกนับ — แสดง "ทุก ADR ที่มีคะแนน > 0"
    html += '  <details class="p6-token-details" open>';
    html += '    <summary>ดูรายละเอียดตัวแปรที่ถูกนับ (เฉพาะ ADR ที่มีคะแนน)</summary>';
    html += '    <div class="p6-token-grid">';
    for (var j = 0; j < results.length; j++) {
      var rr = results[j];
      if (rr.total <= 0) continue;               // ต้องมีคะแนนก่อน
      if (!rr.tokens || !rr.tokens.length) continue; // และต้องมี token ที่ถูกนับจริง

      html += '      <div class="p6-token-card">';
      html += '        <div class="p6-token-title">' + esc(rr.label) + "</div>";
      html += "        <ul>";
      for (var k = 0; k < rr.tokens.length; k++) {
        var tk = rr.tokens[k];
        html += "          <li>" + esc(tk.label);
        if (tk.w && tk.w !== 1) {
          html += " (+" + tk.w + ")";
        }
        html += "</li>";
      }
      html += "        </ul>";
      html += "      </div>";
    }
    html += "    </div>";
    html += "  </details>";

    html += "</section>";

    renderIntoPage6(html);
  }

  function refreshBrain() {
    try {
      hideTopSignalsSection();
      var results = evaluateAllADR();
      renderSummary(results);
    } catch (e) {
      console.error("drugAllergyBrain.refresh error", e);
    }
  }

  // -----------------------------------------------------------------------
  // 5) export API ให้ปุ่มหน้า 6 เรียกใช้
  // -----------------------------------------------------------------------
  window.drugAllergyBrain = {
    refresh: refreshBrain
  };

  // ซ่อน Top signals ตั้งแต่โหลดหน้า
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hideTopSignalsSection);
  } else {
    hideTopSignalsSection();
  }
})();

// ===================== brain.rules.js (REPLACE WHOLE FILE) =====================
// โหมด C: "แมตช์ตรงตัว" ระหว่างสิ่งที่ผู้ใช้ติ๊กในหน้า 1–3 กับเกณฑ์ของแต่ละ ADR
// - คิดเฉพาะข้อที่ติ๊กจริง
// - แต่ละ ADR แยกเกณฑ์กัน ไม่เอามาปนกัน
// - 1 ข้อใหญ่ = 1 แต้ม (ถ้ามี weight x2/x3/x4 ก็คูณ)
// - แปลงเป็น % ภายในแต่ละ ADR เอง (ไม่จำเป็นต้องรวม 100%)

(function () {
  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  function num(v) {
    const n = Number(String(v ?? "").toString().replace(/[, ]+/g, ""));
    return Number.isFinite(n) ? n : NaN;
  }

  function arr(v) {
    if (!v) return [];
    return Array.isArray(v) ? v : [v];
  }

  function hasAny(list, targets) {
    const src = arr(list);
    return src.some((x) => targets.includes(x));
  }

  function flag(v) {
    if (v === true) return true;
    if (typeof v === "string") {
      const s = v.trim();
      if (!s) return false;
      return !/^(false|null|undefined|0|no|ไม่|ไม่มี)$/i.test(s);
    }
    return !!v;
  }

  function getCtx() {
    const d = window.drugAllergyData || {};
    const p1 = d.page1 || {};
    const p2 = d.page2 || {};
    const p3 = d.page3 || {};

    // หน้า 1
    const shapes = arr(p1.rashShapes || p1.rashShape);
    const colors = arr(p1.rashColors || p1.rashColor);
    const locs = arr(p1.locations || p1.location);
    const onset = p1.onset || "";

    const itch = !!(p1.itch && p1.itch.has);
    const swell = !!(p1.swelling && p1.swelling.has);
    const pain = !!(p1.pain && p1.pain.has);
    const burn = !!(p1.burn && p1.burn.has);

    const bullaeSmall = !!(p1.blister && p1.blister.small);
    const bullaeMed = !!(p1.blister && p1.blister.medium);
    const bullaeLarge = !!(p1.blister && p1.blister.large);

    const pustule = !!(p1.pustule && p1.pustule.has);
    const peelCenter = !!(p1.skinDetach && p1.skinDetach.center);
    const peelLt10 = !!(p1.skinDetach && p1.skinDetach.lt10);
    const peelGt30 = !!(p1.skinDetach && p1.skinDetach.gt30);

    const scaleDry = !!(p1.scale && p1.scale.dry);
    const scalePeel = !!(p1.scale && p1.scale.peel);
    const scaleCrust = !!(p1.scale && p1.scale.crust);

    const mucosalCountGt1 = !!p1.mucosalCountGt1 || !!p1.sjs_mucosal_gt1;

    // หน้า 2
    const resp = p2.resp || {};
    const cv = p2.cv || {};
    const gi = p2.gi || {};
    const msk = p2.msk || {};
    const urine = p2.urine || p2.urinary || {};
    const eye = p2.eye || {};
    const other = p2.other || {};

    const dyspnea = flag(resp.dyspnea);
    const wheeze = flag(resp.wheeze);
    const tachypnea = flag(resp.tachypnea);

    const hypotension = flag(cv.bpLow || cv.hypotension);
    const bpDrop40 = flag(cv.bpDrop40 || cv.bpDrop40pct || cv.bpDrop40mmhg);
    const shockLike = flag(cv.shock);

    const nauseaVomiting = flag(gi.nauseaVomiting || gi.nausea || gi.vomiting);
    const diarrhea = flag(gi.diarrhea);
    const colickyPain = flag(gi.colickyPain || gi.abdPain);
    const dysphagia = flag(gi.dysphagia || gi.swallowingPain);
    const soreThroat = flag(gi.soreThroat);
    const anorexia = flag(gi.anorexia);

    const arthralgia = flag(msk.arthralgia);
    const arthritis = flag(msk.arthritis);
    const myalgia = flag(msk.myalgia);

    const oliguria = flag(urine.oliguria);
    const hematuria = flag(urine.hematuria);

    const conjunctivitis = flag(eye.conjunctivitis);
    const cornealUlcer = flag(eye.cornealUlcer);

    const fever = num(other.fever) || num(p2.fever);
    const fatigue = flag(other.fatigue);

    // หน้า 3
    const cbc = p3.cbc || {};
    const lft = p3.lft || {};
    const rft = p3.rft || {};
    const inflam = p3.inflam || p3.inflammation || {};
    const immuno = p3.immunology || p3.immuno || {};
    const urineLab = p3.urine || {};
    const cardioLab = p3.cardio || {};
    const gas = p3.gas || {};

    const wbc = num(cbc.wbc && cbc.wbc.value);
    const neutroPct = num(
      (cbc.neutrophil && cbc.neutrophil.value) ||
        (cbc.neut && cbc.neut.value)
    );
    const lymphoPct = num(cbc.lymphocyte && cbc.lymphocyte.value);
    const eosPct = num(cbc.eosinophil && cbc.eosinophil.value);
    const hb = num(cbc.hb && cbc.hb.value);
    const hct = num(cbc.hct && cbc.hct.value);
    const plt = num(cbc.plt && cbc.plt.value);
    const anc = num(cbc.anc && cbc.anc.value);

    const ast = num(lft.ast && lft.ast.value);
    const alt = num(lft.alt && lft.alt.value);
    const alp = num(lft.alp && lft.alp.value);
    const tbil = num(lft.tbil && lft.tbil.value);
    const dbil = num(lft.dbil && lft.dbil.value);

    const bun = num(rft.bun && rft.bun.value);
    const cr = num(rft.cr && rft.cr.value);
    const egfr = num(rft.egfr && rft.egfr.value);
    const uo = num(rft.uo && rft.uo.value);

    const crp = num(inflam.crp && inflam.crp.value);
    const esr = num(inflam.esr && inflam.esr.value);

    const igE = num(immuno.ige && immuno.ige.value);
    const tryptase = num(immuno.tryptase && immuno.tryptase.value);

    const protU =
      (urineLab.protein &&
        String(urineLab.protein.value || urineLab.protein).trim()) ||
      "";
    const rbcU = num(urineLab.rbc && urineLab.rbc.value);
    const c3 = num(immuno.c3 && immuno.c3.value);
    const c4 = num(immuno.c4 && immuno.c4.value);

    const spo2 = num((gas.spo2 && gas.spo2.value) || p2.spo2 || p3.spo2);

    const ekgAbnormal = flag(cardioLab.ekgAbnormal || cardioLab.ekg);
    const troponin = num(cardioLab.troponin && cardioLab.troponin.value);

    return {
      p1,
      p2,
      p3,
      shapes,
      colors,
      locs,
      onset,
      itch,
      swell,
      pain,
      burn,
      bullaeSmall,
      bullaeMed,
      bullaeLarge,
      pustule,
      peelCenter,
      peelLt10,
      peelGt30,
      scaleDry,
      scalePeel,
      scaleCrust,
      mucosalCountGt1,
      dyspnea,
      wheeze,
      tachypnea,
      hypotension,
      bpDrop40,
      shockLike,
      nauseaVomiting,
      diarrhea,
      colickyPain,
      dysphagia,
      soreThroat,
      anorexia,
      arthralgia,
      arthritis,
      myalgia,
      oliguria,
      hematuria,
      conjunctivitis,
      cornealUlcer,
      fever,
      fatigue,
      wbc,
      neutroPct,
      lymphoPct,
      eosPct,
      hb,
      hct,
      plt,
      anc,
      ast,
      alt,
      alp,
      tbil,
      dbil,
      bun,
      cr,
      egfr,
      uo,
      crp,
      esr,
      igE,
      tryptase,
      protU,
      rbcU,
      c3,
      c4,
      spo2,
      ekgAbnormal,
      troponin,
      urine
    };
  }

  // ---------------------------------------------------------------------------
  // Helper สำหรับกลุ่ม lab-based ADR (ใช้เป็น "ฐาน" ว่ามีปัญหาจริง ๆ ก่อน)
  // ---------------------------------------------------------------------------
  function hasRenalBase(c) {
    return (
      (Number.isFinite(c.cr) && c.cr >= 1.3) ||
      (Number.isFinite(c.egfr) && c.egfr < 60) ||
      /(^\+|protein)/i.test(c.protU || "")
    );
  }

  function hasCytopeniaBase(c) {
    const lowHb = Number.isFinite(c.hb) && c.hb < 10;
    const lowHct = Number.isFinite(c.hct) && c.hct < 30;
    const lowWbc = Number.isFinite(c.wbc) && c.wbc < 4000;
    const lowPlt = Number.isFinite(c.plt) && c.plt < 100000;
    return lowHb || lowHct || lowWbc || lowPlt;
  }

  function hasANCBase(c) {
    return Number.isFinite(c.anc) && c.anc < 1500;
  }

  // ---------------------------------------------------------------------------
  // ADR Definitions — 21 ชนิด (แยกเกณฑ์คนละก้อน)
  // แต่ละ ADR มี majors[]: { id, label, weight, check(ctx) }
  // ---------------------------------------------------------------------------

  const ADR_DEFS = [
    // 1) Urticaria
    {
      id: "urticaria",
      label: "Urticaria",
      majors: [
        {
          id: "shape",
          label: "รูปร่าง: ขอบหยัก/วงกลม/ขอบวงนูนแดงด้านในเรียบ",
          weight: 1,
          check: (c) =>
            hasAny(c.shapes, [
              "ขอบหยัก",
              "วงกลม",
              "วงกลมชั้นเดียว",
              "วงกลม 1 ชั้น",
              "ขอบวงนูนแดงด้านในเรียบ"
            ])
        },
        {
          id: "color",
          label: "สี: แดง/แดงซีด/ซีด/สีผิวปกติ",
          weight: 1,
          check: (c) =>
            hasAny(c.colors, ["แดง", "แดงซีด", "ซีด", "สีผิวปกติ"])
        },
        {
          id: "typical",
          label: "ลักษณะสำคัญ: ตุ่มนูน/ปื้นนูน (x2)",
          weight: 2,
          check: (c) => hasAny(c.shapes, ["ตุ่มนูน", "ปื้นนูน"])
        },
        {
          id: "itch",
          label: "คัน",
          weight: 1,
          check: (c) => c.itch
        },
        {
          id: "swelling",
          label: "บวม",
          weight: 1,
          check: (c) => c.swell
        },
        {
          id: "location",
          label:
            "ตำแหน่ง: ทั่วร่างกาย/มือ/เท้า/แขน/ขา/หน้า/รอบดวงตา/ลำคอ/ลำตัว/หลัง",
          weight: 1,
          check: (c) =>
            hasAny(c.locs, [
              "ทั่วร่างกาย",
              "มือ",
              "เท้า",
              "แขน",
              "ขา",
              "หน้า",
              "รอบดวงตา",
              "ลำคอ",
              "ลำตัว",
              "หลัง"
            ])
        },
        {
          id: "onset",
          label: "ระยะเวลา: ภายใน 1 ชั่วโมง",
          weight: 1,
          check: (c) => String(c.onset).includes("ภายใน 1 ชั่วโมง")
        }
      ]
    },

    // 2) Anaphylaxis
    {
      id: "anaphylaxis",
      label: "Anaphylaxis",
      majors: [
        {
          id: "shape_skin",
          label: "รูปร่างผื่น/บวม/ตึง",
          weight: 1,
          check: (c) =>
            hasAny(c.shapes, ["ตุ่มนูน", "ปื้นนูน", "บวม", "นูนหนา", "ตึง"]) ||
            c.swell
        },
        {
          id: "resp_major",
          label: "หายใจมีเสียงวี๊ด/หอบเหนื่อย/หายใจลำบาก (x2)",
          weight: 2,
          check: (c) => c.wheeze || c.dyspnea || c.tachypnea
        },
        {
          id: "skin_extra",
          label: "อาการผิวหนัง: คัน/แดง/สีผิวปกติ",
          weight: 1,
          check: (c) =>
            c.itch || hasAny(c.colors, ["แดง", "สีผิวปกติ"])
        },
        {
          id: "gi",
          label: "ท้องเสีย/กลืนลำบาก/ปวดบิดท้อง/คลื่นไส้-อาเจียน",
          weight: 1,
          check: (c) =>
            c.diarrhea || c.dysphagia || c.colickyPain || c.nauseaVomiting
        },
        {
          id: "bp_major",
          label: "BP ต่ำ หรือ BP ลด ≥40 mmHg จาก baseline",
          weight: 2,
          check: (c) => c.hypotension || c.bpDrop40 || c.shockLike
        },
        {
          id: "lab_major",
          label: "Lab: HR สูง หรือ SpO2 < 94%",
          weight: 1,
          check: (c) =>
            num(c.p2 && c.p2.cv && c.p2.cv.hrValue) > 100 ||
            (Number.isFinite(c.spo2) && c.spo2 < 94)
        },
        {
          id: "onset",
          label: "ระยะเวลา: ภายใน 1–6 ชั่วโมง (รวม ≤1ชม.)",
          weight: 1,
          check: (c) =>
            String(c.onset).includes("ภายใน 1 ชั่วโมง") ||
            String(c.onset).includes("1–6 ชั่วโมง")
        }
      ]
    },

    // 3) Angioedema
    {
      id: "angioedema",
      label: "Angioedema",
      majors: [
        {
          id: "shape_thick",
          label: "รูปร่าง: นูนหนา/ขอบไม่ชัดเจน",
          weight: 1,
          check: (c) => hasAny(c.shapes, ["นูนหนา", "ขอบไม่ชัดเจน"])
        },
        {
          id: "color",
          label: "สี: สีผิวปกติ/แดง",
          weight: 1,
          check: (c) =>
            hasAny(c.colors, ["สีผิวปกติ", "แดง"])
        },
        {
          id: "swelling_major",
          label: "ลักษณะสำคัญ: บวม (x2)",
          weight: 2,
          check: (c) => c.swell
        },
        {
          id: "skin_tense",
          label: "ผิวหนังตึง",
          weight: 1,
          check: (c) => c.burn || c.pain || hasAny(c.shapes, ["ตึง"])
        },
        {
          id: "sym_others",
          label: "อาการอื่น: คัน/ไม่คัน/ปวด/แสบ",
          weight: 1,
          check: (c) => c.itch || c.pain || c.burn
        },
        {
          id: "location",
          label: "ตำแหน่ง: ริมฝีปาก/รอบดวงตา/ลิ้น/อวัยวะเพศ",
          weight: 1,
          check: (c) =>
            hasAny(c.locs, ["ริมฝีปาก", "รอบดวงตา", "ลิ้น", "อวัยวะเพศ"])
        },
        {
          id: "onset",
          label: "ระยะเวลา: ภายใน 1 ชั่วโมง",
          weight: 1,
          check: (c) => String(c.onset).includes("ภายใน 1 ชั่วโมง")
        }
      ]
    },

    // 4) Maculopapular rash
    {
      id: "mpr",
      label: "Maculopapular rash",
      majors: [
        {
          id: "shape",
          label: "รูปร่าง: ปื้นแดง/ปื้นนูน/ตุ่มนูน",
          weight: 1,
          check: (c) =>
            hasAny(c.shapes, ["ปื้นแดง", "ปื้นนูน", "ตุ่มนูน"])
        },
        {
          id: "color",
          label: "สี: แดง",
          weight: 1,
          check: (c) => hasAny(c.colors, ["แดง"])
        },
        {
          id: "typical",
          label: "ลักษณะสำคัญ: จุดเล็กแดง (x2)",
          weight: 2,
          check: (c) =>
            hasAny(c.shapes, ["จุดเล็กแดง", "จุดเล็ก"])
        },
        {
          id: "itch",
          label: "คัน",
          weight: 1,
          check: (c) => c.itch
        },
        {
          id: "rare_sym",
          label: "ไข้ หรือ Eosinophil > 5%",
          weight: 1,
          check: (c) =>
            (Number.isFinite(c.fever) && c.fever > 37.5) ||
            (Number.isFinite(c.eosPct) && c.eosPct > 5)
        },
        {
          id: "distribution",
          label: "ตำแหน่ง: สมมาตร/ลำตัว/แขน/หน้า/ลำคอ",
          weight: 1,
          check: (c) =>
            hasAny(c.locs, ["สมมาตร", "ลำตัว", "แขน", "หน้า", "ลำคอ"])
        },
        {
          id: "onset",
          label: "ระยะเวลา: ภายใน 1 ชม.–2 สัปดาห์",
          weight: 1,
          check: (c) =>
            ["ภายใน 1-6 ชั่วโมง", "ภายใน 6-24 ชั่วโมง", "ภายใน 1 สัปดาห์", "ภายใน 2 สัปดาห์"].some(
              (t) => String(c.onset).includes(t)
            )
        }
      ]
    },

    // 5) Fixed drug eruption
    {
      id: "fde",
      label: "Fixed drug eruption",
      majors: [
        {
          id: "shape",
          label: "รูปร่าง: วงกลม/วงรี",
          weight: 1,
          check: (c) => hasAny(c.shapes, ["วงกลม", "วงรี"])
        },
        {
          id: "color",
          label: "สี: แดง/ดำ-คล้ำ",
          weight: 1,
          check: (c) =>
            hasAny(c.colors, ["แดง", "ดำ", "ดำ/คล้ำ", "คล้ำ", "ม่วง/คล้ำ"])
        },
        {
          id: "typical",
          label: "ลักษณะสำคัญ: ม่วง/คล้ำ (x3)",
          weight: 3,
          check: (c) =>
            hasAny(c.colors, ["ม่วง", "ม่วง/คล้ำ", "ดำ/คล้ำ", "คล้ำ"])
        },
        {
          id: "skin_extra",
          label: "ผิวหนังหลุดลอกตรงกลาง/เจ็บ/แสบ/ตึง",
          weight: 1,
          check: (c) =>
            c.peelCenter || c.pain || c.burn || hasAny(c.shapes, ["ตึง"])
        },
        {
          id: "rare",
          label: "บวม/พอง/ตุ่มน้ำ",
          weight: 1,
          check: (c) =>
            c.swell || c.bullaeSmall || c.bullaeMed || c.bullaeLarge
        },
        {
          id: "location",
          label:
            "ตำแหน่ง: ริมฝีปาก/หน้า/มือ/เท้า/แขน/ขา/อวัยวะเพศ/ตำแหน่งเดิม",
          weight: 1,
          check: (c) =>
            hasAny(c.locs, [
              "ริมฝีปาก",
              "หน้า",
              "มือ",
              "เท้า",
              "แขน",
              "ขา",
              "อวัยวะเพศ",
              "ตำแหน่งเดิมกับครั้งก่อน"
            ])
        }
      ]
    },

    // 6) AGEP
    {
      id: "agep",
      label: "AGEP",
      majors: [
        {
          id: "shape",
          label: "รูปร่าง: ผื่นแดง",
          weight: 1,
          check: (c) => hasAny(c.shapes, ["ผื่นแดง", "ปื้นแดง"])
        },
        {
          id: "color",
          label: "สี: แดง/เหลือง",
          weight: 1,
          check: (c) => hasAny(c.colors, ["แดง", "เหลือง"])
        },
        {
          id: "typical",
          label: "ลักษณะสำคัญ: ตุ่มหนอง (x3)",
          weight: 3,
          check: (c) => c.pustule
        },
        {
          id: "skin_extra",
          label: "บวม/คัน/เจ็บ",
          weight: 1,
          check: (c) => c.swell || c.itch || c.pain
        },
        {
          id: "scale",
          label: "ปื้น/จ้ำเลือด/แห้ง/ลอก/ขุย",
          weight: 1,
          check: (c) =>
            hasAny(c.shapes, ["ปื้น/จ้ำเลือด", "จ้ำเลือด"]) ||
            c.scaleDry ||
            c.scalePeel ||
            c.scaleCrust
        },
        {
          id: "location",
          label: "หน้า/รักแร้/ทั่วร่างกาย/ขาหนีบ",
          weight: 1,
          check: (c) =>
            hasAny(c.locs, ["หน้า", "รักแร้", "ทั่วร่างกาย", "ขาหนีบ"])
        },
        {
          id: "onset",
          label: "ระยะเวลา: 6–24 ชม. ถึง 3 สัปดาห์",
          weight: 1,
          check: (c) =>
            [
              "ภายใน 6-24 ชั่วโมง",
              "ภายใน 1 สัปดาห์",
              "ภายใน 2 สัปดาห์",
              "ภายใน 3 สัปดาห์"
            ].some((t) => String(c.onset).includes(t))
        },
        {
          id: "fever",
          label: "ไข้ > 37.5 °C",
          weight: 1,
          check: (c) => Number.isFinite(c.fever) && c.fever > 37.5
        },
        {
          id: "lab",
          label: "WBC > 11,000 หรือ Neutrophil > 75%",
          weight: 1,
          check: (c) =>
            (Number.isFinite(c.wbc) && c.wbc > 11000) ||
            (Number.isFinite(c.neutroPct) && c.neutroPct > 75)
        }
      ]
    },

    // 7) SJS
    {
      id: "sjs",
      label: "SJS",
      majors: [
        {
          id: "shape_target",
          label: "วงกลมคล้ายเป้าธนู (ไม่ครบ 3 ชั้น)",
          weight: 1,
          check: (c) =>
            hasAny(c.shapes, ["วงกลมคล้ายเป้าธนู", "เป้าธนูไม่ครบ 3 ชั้น"])
        },
        {
          id: "color",
          label: "สี: ดำ/คล้ำ/เทา/แดง",
          weight: 1,
          check: (c) =>
            hasAny(c.colors, ["ดำ", "ดำ/คล้ำ", "คล้ำ", "เทา", "แดง"])
        },
        {
          id: "skin_detach",
          label: "ผิวหนังหลุดลอกไม่เกิน 10% BSA (x3)",
          weight: 3,
          check: (c) => c.peelLt10 || c.peelCenter
        },
        {
          id: "blister",
          label: "น้ำเหลือง/พอง/ตุ่มน้ำ",
          weight: 1,
          check: (c) =>
            c.bullaeSmall || c.bullaeMed || c.bullaeLarge || c.pustule
        },
        {
          id: "crust",
          label: "สะเก็ด",
          weight: 1,
          check: (c) => c.scaleCrust
        },
        {
          id: "location",
          label: "ตำแหน่ง: ลำตัว",
          weight: 1,
          check: (c) => hasAny(c.locs, ["ลำตัว"])
        },
        {
          id: "onset",
          label: "ระยะเวลา: 1 ชม.–3 สัปดาห์",
          weight: 1,
          check: (c) =>
            [
              "ภายใน 1-6 ชั่วโมง",
              "ภายใน 6-24 ชั่วโมง",
              "ภายใน 1 สัปดาห์",
              "ภายใน 2 สัปดาห์",
              "ภายใน 3 สัปดาห์"
            ].some((t) => String(c.onset).includes(t))
        },
        {
          id: "systemic",
          label:
            "ไข้/ปวดกล้ามเนื้อ/คลื่นไส้-อาเจียน/เลือดออกในทางเดินอาหาร",
          weight: 1,
          check: (c) =>
            (Number.isFinite(c.fever) && c.fever > 37.5) ||
            c.myalgia ||
            c.nauseaVomiting
        },
        {
          id: "mucosal",
          label: "จำนวนผื่นบริเวณเยื่อบุ > 1 (x2)",
          weight: 2,
          check: (c) => c.mucosalCountGt1
        }
      ]
    },

    // 8) TEN
    {
      id: "ten",
      label: "TEN",
      majors: [
        {
          id: "shape",
          label: "ผื่นแดง/ปื้นแดง/วงกลมคล้ายเป้าธนู",
          weight: 1,
          check: (c) =>
            hasAny(c.shapes, ["ผื่นแดง", "ปื้นแดง", "วงกลมคล้ายเป้าธนู"])
        },
        {
          id: "color",
          label: "สี: แดง/ดำ-คล้ำ",
          weight: 1,
          check: (c) =>
            hasAny(c.colors, ["แดง", "ดำ", "ดำ/คล้ำ", "คล้ำ"])
        },
        {
          id: "skin_detach_major",
          label: "ผิวหนังหลุดลอกเกิน 30% BSA (x3)",
          weight: 3,
          check: (c) => c.peelGt30
        },
        {
          id: "bullae_major",
          label: "ตุ่มน้ำขนาดใหญ่/น้ำเหลือง/สะเก็ด",
          weight: 1,
          check: (c) => c.bullaeLarge || c.scaleCrust || c.pustule
        },
        {
          id: "anemia_bp",
          label: "ซีด/โลหิตจาง/เลือดออกในทางเดินอาหาร/กลืนลำบาก",
          weight: 1,
          check: (c) =>
            (Number.isFinite(c.hb) && c.hb < 10) ||
            c.dysphagia ||
            c.colickyPain
        },
        {
          id: "location",
          label:
            "ตำแหน่ง: ลำตัว/แขน/ขา/หน้า/มือ/เท้า/ศีรษะ/ทั่วร่างกาย/ริมฝีปาก",
          weight: 1,
          check: (c) =>
            hasAny(c.locs, [
              "ลำตัว",
              "แขน",
              "ขา",
              "หน้า",
              "มือ",
              "เท้า",
              "ศีรษะ",
              "ทั่วร่างกาย",
              "ริมฝีปาก"
            ])
        },
        {
          id: "onset",
          label: "ระยะเวลา: 1–3 สัปดาห์",
          weight: 1,
          check: (c) =>
            [
              "ภายใน 1 สัปดาห์",
              "ภายใน 2 สัปดาห์",
              "ภายใน 3 สัปดาห์"
            ].some((t) => String(c.onset).includes(t))
        },
        {
          id: "systemic",
          label:
            "ไข้/ปวดกล้ามเนื้อ/คลื่นไส้-อาเจียน/เจ็บคอ/ปวดข้อ/ท้องเสีย/เยื่อบุตาอักเสบ",
          weight: 1,
          check: (c) =>
            (Number.isFinite(c.fever) && c.fever > 37.5) ||
            c.myalgia ||
            c.nauseaVomiting ||
            c.soreThroat ||
            c.arthralgia ||
            c.diarrhea ||
            c.conjunctivitis
        },
        {
          id: "organ",
          label: "ไตวาย/ตับอักเสบ/ปอดอักเสบ",
          weight: 1,
          check: (c) =>
            (Number.isFinite(c.cr) && c.cr >= 1.5) ||
            (Number.isFinite(c.egfr) && c.egfr < 60) ||
            (Number.isFinite(c.alt) && c.alt >= 40) ||
            (Number.isFinite(c.ast) && c.ast >= 40)
        }
      ]
    },

    // 9) DRESS
    {
      id: "dress",
      label: "DRESS",
      majors: [
        {
          id: "rash",
          label: "ผื่นแดง/ปื้นแดง",
          weight: 1,
          check: (c) => hasAny(c.shapes, ["ผื่นแดง", "ปื้นแดง"])
        },
        {
          id: "color",
          label: "สีแดง",
          weight: 1,
          check: (c) => hasAny(c.colors, ["แดง"])
        },
        {
          id: "blood_major",
          label: "Eosinophil ≥ 10% หรือ atypical lymphocyte (x3)",
          weight: 3,
          check: (c) =>
            (Number.isFinite(c.eosPct) && c.eosPct >= 10) ||
            (c.p3 && c.p3.cbc && flag(c.p3.cbc.atypicalLymph))
        },
        {
          id: "skin_extra",
          label: "ตุ่มน้ำ/จ้ำเลือด",
          weight: 1,
          check: (c) =>
            c.bullaeSmall || c.bullaeMed || c.bullaeLarge || c.pustule
        },
        {
          id: "location",
          label: "หน้า/ลำตัว/แขน/ขา",
          weight: 1,
          check: (c) =>
            hasAny(c.locs, ["หน้า", "ลำตัว", "แขน", "ขา"])
        },
        {
          id: "fever",
          label: "ไข้ > 37.5 °C",
          weight: 1,
          check: (c) => Number.isFinite(c.fever) && c.fever > 37.5
        },
        {
          id: "onset",
          label: "ระยะเวลา: 1–6 สัปดาห์",
          weight: 1,
          check: (c) =>
            [
              "ภายใน 1 สัปดาห์",
              "ภายใน 2 สัปดาห์",
              "ภายใน 3 สัปดาห์",
              "ภายใน 4 สัปดาห์",
              "ภายใน 5 สัปดาห์",
              "ภายใน 6 สัปดาห์"
            ].some((t) => String(c.onset).includes(t))
        },
        {
          id: "organ_lab",
          label:
            "ALT/AST ≥2x ULN หรือ Cr เพิ่มขึ้น หรือ protein+ / SpO2 < 94% / EKG หรือตัวชี้วัดหัวใจ",
          weight: 1,
          check: (c) =>
            (Number.isFinite(c.alt) && c.alt >= 40) ||
            (Number.isFinite(c.ast) && c.ast >= 40) ||
            (Number.isFinite(c.cr) && c.cr >= 1.5) ||
            /(^\+|protein)/i.test(c.protU || "") ||
            (Number.isFinite(c.spo2) && c.spo2 < 94) ||
            c.ekgAbnormal ||
            (Number.isFinite(c.troponin) && c.troponin > 0.04)
        }
      ]
    },

    // 10) Erythema multiforme
    {
      id: "em",
      label: "Erythema multiforme",
      majors: [
        {
          id: "shape",
          label: "ตุ่มนูน/ขอบวงนูนแดงด้านในเรียบ",
          weight: 1,
          check: (c) =>
            hasAny(c.shapes, ["ตุ่มนูน", "ขอบวงนูนแดงด้านในเรียบ"])
        },
        {
          id: "color",
          label: "สีแดง/แดงซีด",
          weight: 1,
          check: (c) => hasAny(c.colors, ["แดง", "แดงซีด"])
        },
        {
          id: "typical",
          label: "วงกลม 3 ชั้น (เป้าธนู) (x3)",
          weight: 3,
          check: (c) =>
            hasAny(c.shapes, ["วงกลม 3 ชั้น", "เป้าธนู 3 ชั้น"])
        },
        {
          id: "blister",
          label: "พอง/ตุ่มน้ำ",
          weight: 1,
          check: (c) => c.bullaeSmall || c.bullaeMed || c.bullaeLarge
        },
        {
          id: "crust",
          label: "สะเก็ด",
          weight: 1,
          check: (c) => c.scaleCrust
        },
        {
          id: "mucosal",
          label: "ช่องปาก/จมูก/ทวาร/อวัยวะเพศ",
          weight: 1,
          check: (c) =>
            hasAny(c.locs, ["ช่องปาก", "จมูก", "ทวาร", "อวัยวะเพศ"])
        },
        {
          id: "systemic",
          label: "ไข้/อ่อนเพลีย/ปวดกล้ามเนื้อ/เจ็บคอ/ปวดข้อ",
          weight: 1,
          check: (c) =>
            (Number.isFinite(c.fever) && c.fever > 37.5) ||
            c.fatigue ||
            c.myalgia ||
            c.soreThroat ||
            c.arthralgia
        },
        {
          id: "limb_loc",
          label: "มือ/เท้า/แขน/ขา/หน้า/ลำตัว/หลัง/ลำคอ",
          weight: 1,
          check: (c) =>
            hasAny(c.locs, [
              "มือ",
              "เท้า",
              "แขน",
              "ขา",
              "หน้า",
              "ลำตัว",
              "หลัง",
              "ลำคอ"
            ])
        }
      ]
    },

    // 11) Photosensitivity drug eruption
    {
      id: "photo",
      label: "Photosensitivity drug eruption",
      majors: [
        {
          id: "shape",
          label: "ขอบเขตชัด/ปื้นแดง/จุดแดงเล็ก",
          weight: 1,
          check: (c) =>
            hasAny(c.shapes, [
              "ขอบเขตชัด",
              "ปื้นแดง",
              "จุดแดงเล็ก",
              "จุดเล็กแดง"
            ])
        },
        {
          id: "color",
          label: "ดำ/คล้ำ/แดง",
          weight: 1,
          check: (c) =>
            hasAny(c.colors, ["ดำ", "ดำ/คล้ำ", "คล้ำ", "แดง"])
        },
        {
          id: "burn_major",
          label: "แดงไหม้ (x2)",
          weight: 2,
          check: (c) =>
            hasAny(c.colors, ["แดงไหม้"]) || c.burn
        },
        {
          id: "exudate",
          label: "น้ำเหลือง/สะเก็ด/ตุ่มน้ำ/ลอก/ขุย/คัน",
          weight: 1,
          check: (c) =>
            c.scaleCrust ||
            c.scaleDry ||
            c.scalePeel ||
            c.itch ||
            c.bullaeSmall ||
            c.bullaeMed ||
            c.bullaeLarge
        },
        {
          id: "location",
          label: "หน้า/หน้าอก/มือ/แขน/ขา",
          weight: 1,
          check: (c) =>
            hasAny(c.locs, ["หน้า", "หน้าอก", "มือ", "แขน", "ขา"])
        }
      ]
    },

    // 12) Exfoliative dermatitis
    {
      id: "exf",
      label: "Exfoliative dermatitis",
      majors: [
        {
          id: "shape",
          label: "ตึง",
          weight: 1,
          check: (c) => hasAny(c.shapes, ["ตึง"])
        },
        {
          id: "color",
          label: "สีแดง",
          weight: 1,
          check: (c) => hasAny(c.colors, ["แดง"])
        },
        {
          id: "dry_major",
          label: "แห้ง (x3)",
          weight: 3,
          check: (c) => c.scaleDry
        },
        {
          id: "scale_major",
          label: "ขุย (x3)",
          weight: 3,
          check: (c) => c.scaleCrust
        },
        {
          id: "itch",
          label: "คัน",
          weight: 1,
          check: (c) => c.itch
        },
        {
          id: "location",
          label: "ทั่วร่างกาย/มือ/เท้า/ศีรษะ",
          weight: 1,
          check: (c) =>
            hasAny(c.locs, ["ทั่วร่างกาย", "มือ", "เท้า", "ศีรษะ"])
        },
        {
          id: "systemic",
          label: "ไข้/หนาวสั่น/อ่อนเพลีย/ดีซ่าน",
          weight: 1,
          check: (c) =>
            (Number.isFinite(c.fever) && c.fever > 37.5) || c.fatigue
        }
      ]
    },

    // 13) Eczematous drug eruption
    {
      id: "eczema",
      label: "Eczematous drug eruption",
      majors: [
        {
          id: "shape",
          label: "ตุ่มนูน/ปื้นแดง",
          weight: 1,
          check: (c) => hasAny(c.shapes, ["ตุ่มนูน", "ปื้นแดง"])
        },
        {
          id: "color",
          label: "สีแดง",
          weight: 1,
          check: (c) => hasAny(c.colors, ["แดง"])
        },
        {
          id: "itch_major",
          label: "คัน (x2)",
          weight: 2,
          check: (c) => c.itch
        },
        {
          id: "thick",
          label: "นูนหนา/ผื่นแดง",
          weight: 1,
          check: (c) =>
            hasAny(c.shapes, ["นูนหนา", "ผื่นแดง", "ปื้นแดง"])
        },
        {
          id: "exudate",
          label: "จุดเล็กแดง/น้ำเหลือง/สะเก็ด",
          weight: 1,
          check: (c) =>
            hasAny(c.shapes, ["จุดเล็กแดง"]) || c.scaleCrust
        },
        {
          id: "location",
          label: "ลำตัว/แขน/ขา/หน้า/ลำคอ",
          weight: 1,
          check: (c) =>
            hasAny(c.locs, ["ลำตัว", "แขน", "ขา", "หน้า", "ลำคอ"])
        },
        {
          id: "dry_scale",
          label: "ขุย/แห้ง/ลอก (x2)",
          weight: 2,
          check: (c) => c.scaleDry || c.scalePeel || c.scaleCrust
        }
      ]
    },

    // 14) Bullous Drug Eruption
    {
      id: "bullous",
      label: "Bullous drug eruption",
      majors: [
        {
          id: "vesicle",
          label: "ตุ่มน้ำขนาดเล็ก/พอง/ตึง",
          weight: 1,
          check: (c) =>
            c.bullaeSmall ||
            c.bullaeMed ||
            c.bullaeLarge ||
            hasAny(c.shapes, ["พอง", "ตึง"])
        },
        {
          id: "color",
          label: "สีแดง",
          weight: 1,
          check: (c) => hasAny(c.colors, ["แดง"])
        },
        {
          id: "vesicle_major",
          label: "ตุ่มน้ำขนาดกลาง/ใหญ่ (x2)",
          weight: 2,
          check: (c) => c.bullaeMed || c.bullaeLarge
        },
        {
          id: "pain_burn",
          label: "เจ็บ/แสบ",
          weight: 1,
          check: (c) => c.pain || c.burn
        },
        {
          id: "inside_clear",
          label: "น้ำใส (x3)",
          weight: 3,
          check: (c) => hasAny(c.colors, ["ใส"])
        },
        {
          id: "location",
          label: "ลำตัว/แขน/ขา/เท้า",
          weight: 1,
          check: (c) =>
            hasAny(c.locs, ["ลำตัว", "แขน", "ขา", "เท้า"])
        }
      ]
    },

    // 15) Serum sickness
    {
      id: "serum_sickness",
      label: "Serum sickness",
      majors: [
        {
          id: "skin",
          label: "ตุ่มนูน/แดง/บวม/คัน",
          weight: 1,
          check: (c) => c.itch || c.swell || hasAny(c.colors, ["แดง"])
        },
        {
          id: "fever_major",
          label: "ไข้ > 37.5 °C (x2)",
          weight: 2,
          check: (c) => Number.isFinite(c.fever) && c.fever > 37.5
        },
        {
          id: "organ",
          label: "ต่อมน้ำเหลืองโต/ไตอักเสบ",
          weight: 1,
          check: (c) =>
            (c.p3 && flag(c.p3.lymphNodeEnlarge)) ||
            (Number.isFinite(c.cr) && c.cr >= 1.3)
        },
        {
          id: "lab",
          label: "protein+ / C3, C4 ต่ำ",
          weight: 1,
          check: (c) =>
            /(^\+|protein)/i.test(c.protU || "") ||
            (Number.isFinite(c.c3) && c.c3 < 90) ||
            (Number.isFinite(c.c4) && c.c4 < 10)
        },
        {
          id: "joint_major",
          label: "ปวดข้อ/ข้ออักเสบ (x2)",
          weight: 2,
          check: (c) => c.arthralgia || c.arthritis
        }
      ]
    },

    // 16) Vasculitis
    {
      id: "vasculitis",
      label: "Vasculitis",
      majors: [
        {
          id: "skin",
          label: "ตุ่มนูน/ผื่นแดง/แดง",
          weight: 1,
          check: (c) =>
            hasAny(c.shapes, ["ตุ่มนูน", "ผื่นแดง"]) ||
            hasAny(c.colors, ["แดง"])
        },
        {
          id: "systemic",
          label: "ไข้/ปวดข้อ/ข้ออักเสบ/ปวดกล้ามเนื้อ/ต่อมน้ำเหลืองโต",
          weight: 1,
          check: (c) =>
            (Number.isFinite(c.fever) && c.fever > 37.5) ||
            c.arthralgia ||
            c.arthritis ||
            c.myalgia ||
            (c.p3 && flag(c.p3.lymphNodeEnlarge))
        },
        {
          id: "organ",
          label: "ไตอักเสบ/ไตวาย/ต่อมน้ำเหลืองโต",
          weight: 1,
          check: (c) =>
            (Number.isFinite(c.cr) && c.cr >= 1.5) ||
            (Number.isFinite(c.egfr) && c.egfr < 60)
        },
        {
          id: "bleed",
          label: "ไอเป็นเลือด/เลือดออกในปอด/เลือดออกในทางเดินอาหาร",
          weight: 1,
          check: (c) => c.p2 && flag(c.p2.resp && c.p2.resp.hemoptysis)
        },
        {
          id: "lab_major",
          label: "protein+ / C3, C4 ต่ำ / Cr เพิ่ม (x2)",
          weight: 2,
          check: (c) =>
            /(^\+|protein)/i.test(c.protU || "") ||
            (Number.isFinite(c.c3) && c.c3 < 90) ||
            (Number.isFinite(c.c4) && c.c4 < 10) ||
            (Number.isFinite(c.cr) && c.cr >= 1.5)
        },
        {
          id: "purpura_major",
          label: "จ้ำเลือด/ขา (x2)",
          weight: 2,
          check: (c) =>
            hasAny(c.shapes, ["จ้ำเลือด"]) || hasAny(c.locs, ["ขา"])
        }
      ]
    },

    // 17) Hemolytic anemia
    {
      id: "hemolytic_anemia",
      label: "Hemolytic anemia",
      majors: [
        {
          id: "pale_jaundice_major",
          label: "ซีด/ดีซ่าน (x2)",
          weight: 2,
          check: (c) =>
            (Number.isFinite(c.hb) && c.hb < 10) ||
            (c.p1 && flag(c.p1.jaundice))
        },
        {
          id: "urine_major",
          label: "ปัสสาวะสีชา/สีดำ (x3)",
          weight: 3,
          check: (c) =>
            c.urine && flag(c.urine.darkUrine)
        },
        {
          id: "renal",
          label: "ไตวาย",
          weight: 1,
          check: (c) =>
            (Number.isFinite(c.cr) && c.cr >= 1.5) ||
            (Number.isFinite(c.egfr) && c.egfr < 60)
        },
        {
          id: "hb_drop",
          label: "Hb ลด ≥ 2–3 g/dL ใน 24–48 ชม.",
          weight: 3,
          check: (c) =>
            c.p3 && flag(c.p3.cbc && c.p3.cbc.hbDrop)
        },
        {
          id: "ldh",
          label: "LDH สูง (2–10x ULN)",
          weight: 1,
          check: (c) => c.p3 && num(c.p3.ldh && c.p3.ldh.value) > 2
        }
      ]
    },

    // 18) Pancytopenia
    {
      id: "pancytopenia",
      label: "Pancytopenia",
      majors: [
        {
          id: "sym",
          label: "ซีด/อ่อนเพลีย (ต้องมี cytopenia ด้วย)",
          weight: 1,
          check: (c) =>
            hasCytopeniaBase(c) &&
            ((Number.isFinite(c.hb) && c.hb < 10) || c.fatigue)
        },
        {
          id: "bleed_major",
          label: "จุดเลือดออก/ฟกช้ำ/เลือดกำเดา/เหงือกเลือดออก (x3)",
          weight: 3,
          check: (c) =>
            hasCytopeniaBase(c) &&
            c.p3 &&
            flag(c.p3.bleedingSigns)
        },
        {
          id: "lab_wbc",
          label: "WBC < 4000 (x2)",
          weight: 2,
          check: (c) => Number.isFinite(c.wbc) && c.wbc < 4000
        },
        {
          id: "lab_plt",
          label: "Plt < 100,000 (x2)",
          weight: 2,
          check: (c) => Number.isFinite(c.plt) && c.plt < 100000
        },
        {
          id: "lab_hb_hct",
          label: "Hb < 10 หรือ Hct < 30% (x2)",
          weight: 2,
          check: (c) =>
            (Number.isFinite(c.hb) && c.hb < 10) ||
            (Number.isFinite(c.hct) && c.hct < 30)
        }
      ]
    },

    // 19) Neutropenia
    {
      id: "neutropenia",
      label: "Neutropenia",
      majors: [
        {
          id: "sym",
          label: "หนาวสั่น/เจ็บคอ/แผลในปาก (ต้องมี ANC < 1500)",
          weight: 1,
          check: (c) =>
            hasANCBase(c) &&
            (c.soreThroat ||
              (c.p2 && flag(c.p2.other && c.p2.other.chills)))
        },
        {
          id: "fever",
          label: "ไข้ > 37.5 °C (ต้องมี ANC < 1500)",
          weight: 1,
          check: (c) =>
            hasANCBase(c) &&
            Number.isFinite(c.fever) &&
            c.fever > 37.5
        },
        {
          id: "organ",
          label: "ปอดอักเสบ (ต้องมี ANC < 1500)",
          weight: 1,
          check: (c) =>
            hasANCBase(c) && c.p3 && flag(c.p3.lungInvolve)
        },
        {
          id: "anc_major",
          label: "ANC < 1500 (x4)",
          weight: 4,
          check: (c) => hasANCBase(c)
        }
      ]
    },

    // 20) Thrombocytopenia
    {
      id: "thrombocytopenia",
      label: "Thrombocytopenia",
      majors: [
        {
          id: "bleed_skin_major",
          label: "จุดเลือดออก/ปื้น-จ้ำเลือด (x2)",
          weight: 2,
          check: (c) =>
            hasAny(c.shapes, ["จุดเลือดออก", "ปื้น/จ้ำเลือด", "จ้ำเลือด"])
        },
        {
          id: "bleed_sys",
          label: "เหงือกเลือดออก/เลือดออกในทางเดินอาหาร/ปัสสาวะเลือดออก",
          weight: 1,
          check: (c) => c.p3 && flag(c.p3.bleedingGI)
        },
        {
          id: "plt_major",
          label: "Plt < 150,000",
          weight: 1,
          check: (c) => Number.isFinite(c.plt) && c.plt < 150000
        }
      ]
    },

    // 21) Nephritis
    {
      id: "nephritis",
      label: "Nephritis",
      majors: [
        {
          id: "sym",
          label: "ไข้/ปวดข้อ/อ่อนเพลีย (ต้องมี renal lab ผิดปกติ)",
          weight: 1,
          check: (c) =>
            hasRenalBase(c) &&
            ((Number.isFinite(c.fever) && c.fever > 37.5) ||
              c.arthralgia ||
              c.fatigue)
        },
        {
          id: "urine_sym",
          label: "ปัสสาวะออกน้อย/ปัสสาวะขุ่น (ต้องมี renal lab ผิดปกติ)",
          weight: 1,
          check: (c) =>
            hasRenalBase(c) &&
            (c.oliguria || (c.urine && flag(c.urine.turbid)))
        },
        {
          id: "edema",
          label: "ขาบวม/บวม (ต้องมี renal lab ผิดปกติ)",
          weight: 1,
          check: (c) =>
            hasRenalBase(c) &&
            (hasAny(c.locs, ["ขา"]) || c.swell)
        },
        {
          id: "renal_major",
          label: "Cr เพิ่ม ≥0.3 mg/dL หรือ eGFR < 60 (x3)",
          weight: 3,
          check: (c) => hasRenalBase(c)
        }
      ]
    }
  ];

  // ---------------------------------------------------------------------------
  // Core scoring: คิดทีละ ADR, แยกเกณฑ์ไม่ปนกัน
  // ---------------------------------------------------------------------------

  function computeAllADR() {
    const ctx = getCtx();
    const results = {};
    const scoresForChart = {};

    ADR_DEFS.forEach((def) => {
      let raw = 0;
      let max = 0;
      const matchedMajors = [];

      def.majors.forEach((m) => {
        const w = m.weight || 1;
        max += w;
        let ok = false;
        try {
          ok = !!m.check(ctx);
        } catch (e) {
          ok = false;
        }
        if (ok) {
          raw += w;
          matchedMajors.push(m.label);
        }
      });

      const percent = max > 0 ? (raw / max) * 100 : 0;
      results[def.id] = {
        id: def.id,
        label: def.label,
        raw,
        max,
        percent,
        matchedMajors
      };
      scoresForChart[def.label] = Math.round(percent);
    });

    return { results, scoresForChart };
  }

  function renderResultIntoP6Box(all) {
    const box = document.getElementById("p6BrainBox");
    if (!box) return;

    const { results } = all;

    // เรียงตาม % จากมากไปน้อย (แต่โชว์ครบทั้ง 21 ADR)
    const sorted = Object.values(results).sort((a, b) => b.percent - a.percent);

    const html = `
      <div class="p6-brain-summary">
        <p class="p6-muted" style="margin-bottom:.35rem;">
          แสดงผลการประเมินตามโหมด C จากข้อมูลหน้า 1–3 (คิดเป็นเปอร์เซ็นต์ภายในแต่ละชนิดแยกกัน)
        </p>
        <div class="p6-adr-list">
          ${sorted
            .map((r, idx) => {
              const pct = r.percent.toFixed(1).replace(/\.0$/, "");
              const majorsHtml = r.matchedMajors.length
                ? `<ul class="p6-adr-majors">${r.matchedMajors
                    .map((m) => `<li>${m}</li>`)
                    .join("")}</ul>`
                : `<p class="p6-muted" style="margin:.15rem 0 0;">ยังไม่มีข้อใหญ่ที่เข้าเกณฑ์จากข้อมูลที่ติ๊ก</p>`;
              return `
                <div class="p6-adr-item">
                  <div class="p6-adr-header">
                    <div class="p6-adr-rank">${idx + 1}</div>
                    <div class="p6-adr-title">${r.label}</div>
                    <div class="p6-adr-pct">${pct}%</div>
                  </div>
                  <div class="p6-adr-body">
                    ${majorsHtml}
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    `;

    box.innerHTML = html;
  }

  function injectStylesOnce() {
    if (document.getElementById("p6-brain-style")) return;
    const css = `
      .p6-brain-summary{border-radius:18px;border:1px solid rgba(244,114,182,.45);background:linear-gradient(135deg,rgba(255,241,246,0.95),rgba(251,207,232,0.9));padding:12px 14px;}
      .p6-adr-list{display:flex;flex-direction:column;gap:8px;max-height:360px;overflow:auto;padding-right:4px;}
      .p6-adr-item{background:rgba(255,255,255,0.9);border-radius:14px;padding:8px 10px;border:1px solid rgba(244,114,182,.35);box-shadow:0 8px 20px rgba(190,24,93,0.08);}
      .p6-adr-header{display:flex;align-items:center;gap:8px;margin-bottom:4px;}
      .p6-adr-rank{width:22px;height:22px;border-radius:999px;background:linear-gradient(135deg,#f9a8d4,#f472b6);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;box-shadow:0 4px 10px rgba(236,72,153,0.35);}
      .p6-adr-title{flex:1 1 auto;font-weight:700;font-size:13px;color:#9d174d;}
      .p6-adr-pct{min-width:46px;text-align:right;font-weight:800;font-size:13px;color:#be185d;}
      .p6-adr-body{margin-left:30px;margin-top:2px;}
      .p6-adr-majors{margin:0;padding-left:16px;font-size:12px;color:#4b5563;}
      .p6-adr-majors li{margin:1px 0;}
    `;
    const el = document.createElement("style");
    el.id = "p6-brain-style";
    el.textContent = css;
    document.head.appendChild(el);
  }

  // ---------------------------------------------------------------------------
  // Public API: brainComputeAndRender()
  // ---------------------------------------------------------------------------

  function brainComputeAndRender() {
    injectStylesOnce();

    // ตรวจ readiness แบบเดียวกับ page6.js
    const d = window.drugAllergyData || {};
    const p1 = d.page1 || {};
    const p2 = d.page2 || {};
    const p3 = d.page3 || {};
    const ready =
      (p1 && (p1.__saved || Object.keys(p1).length > 0)) &&
      (p2 && (p2.__saved || Object.keys(p2).length > 0)) &&
      (p3 && (p3.__saved || Object.keys(p3).length > 0));

    const box = document.getElementById("p6BrainBox");
    if (!ready) {
      if (box) {
        box.innerHTML =
          '<div class="p6-muted">ยังไม่มีข้อมูลเพียงพอจากหน้า 1–3 หรือยังไม่กดบันทึก</div>';
      }
      const empty = { results: {}, scoresForChart: {} };
      window.brainResult = empty;
      return empty;
    }

    const all = computeAllADR();
    window.brainResult = all;
    renderResultIntoP6Box(all);
    return all;
  }

  // ติดตั้ง global
  window.brainComputeAndRender = brainComputeAndRender;
  window.brainRules = {
    mode: "C",
    version: "2025-11-14-21ADR",
    defs: ADR_DEFS
  };
})();

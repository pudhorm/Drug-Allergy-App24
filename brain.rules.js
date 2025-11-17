// ===================== brain.rules.js (REPLACE WHOLE FILE) =====================
// โหมด C: "แมตช์ตรงตัว" ระหว่างสิ่งที่ผู้ใช้ติ๊กในหน้า 1–3 กับเกณฑ์ของแต่ละ ADR
// - คิดเฉพาะข้อที่ติ๊กจริง
// - แต่ละ ADR แยกเกณฑ์กัน ไม่เอามาปนกัน
// - 1 ข้อใหญ่ = 1 แต้ม (ถ้ามี weight x2/x3/x4 ก็คูณ)
// - แปลงเป็น % ภายในแต่ละ ADR เอง

(function () {
  // ---------------------------------------------------------------------------
  // Helpers พื้นฐาน
  // ---------------------------------------------------------------------------
  function num(v) {
    if (v === null || v === undefined) return NaN;
    const s = String(v).replace(/[, ]+/g, "").trim();
    if (!s) return NaN;
    const n = Number(s);
    if (!Number.isFinite(n)) return NaN;
    if (n <= 0) return NaN;
    return n;
  }

  function arr(v) {
    if (!v) return [];
    return Array.isArray(v) ? v : [v];
  }

  function hasAny(list, targets) {
    const src = arr(list);
    return src.some((x) => targets.includes(x));
  }

  // ใช้กับช่องติ้ก / object ที่มี gate
  function flag(v) {
    if (!v) return false;
    if (v === true) return true;
    if (v === false) return false;

    if (typeof v === "string") {
      const s = v.trim();
      if (!s) return false;
      return !/^(false|null|undefined|0|no|ไม่|ไม่มี)$/i.test(s);
    }

    if (typeof v === "object") {
      const gateKeys = ["checked", "use", "tick", "on", "selected"];
      for (let i = 0; i < gateKeys.length; i++) {
        const k = gateKeys[i];
        if (Object.prototype.hasOwnProperty.call(v, k)) {
          return !!v[k];
        }
      }
      for (const k in v) {
        if (!Object.prototype.hasOwnProperty.call(v, k)) continue;
        if (v[k]) return true;
      }
      return false;
    }

    return !!v;
  }

  // numeric field ที่มี gate (ใช้กับข้อมูลจากหน้า 2 / หน้า 3 แบบเก่า)
  function nField(x) {
    if (x == null) return NaN;
    if (typeof x === "object") {
      const hasGate =
        "use" in x || "checked" in x || "tick" in x || "on" in x || "selected" in x;
      const used =
        flag(x.use) ||
        flag(x.checked) ||
        flag(x.tick) ||
        flag(x.on) ||
        flag(x.selected);
      if (hasGate && !used) return NaN;
      if ("value" in x) return num(x.value);
      return NaN;
    }
    return num(x);
  }

  function tField(x) {
    if (x == null) return "";
    if (typeof x === "object") {
      const hasGate =
        "use" in x || "checked" in x || "tick" in x || "on" in x || "selected" in x;
      const used =
        flag(x.use) ||
        flag(x.checked) ||
        flag(x.tick) ||
        flag(x.on) ||
        flag(x.selected);
      if (hasGate && !used) return "";
      const v =
        x.value != null
          ? x.value
          : x.label != null
          ? x.label
          : x.text != null
          ? x.text
          : "";
      return String(v).trim();
    }
    return String(x).trim();
  }

  function normOnset(str) {
    return String(str || "")
      .replace(/[–—−]/g, "-")
      .replace(/\s+/g, "");
  }

  function onsetCategory(str) {
    const s = normOnset(str);
    if (!s) return "";
    if (s.includes("ภายใน1ชั่วโมง") || s.includes("ภายใน1ชม")) return "within1h";
    if (
      s.includes("ภายใน1-6ชั่วโมง") ||
      s.includes("1-6ชั่วโมง") ||
      s.includes("1–6ชั่วโมง") ||
      s.includes("1-6ชม")
    )
      return "h1to6";
    if (
      s.includes("ภายใน6-24ชั่วโมง") ||
      s.includes("6-24ชั่วโมง") ||
      s.includes("6–24ชั่วโมง") ||
      s.includes("6-24ชม")
    )
      return "h6to24";
    if (s.includes("1สัปดาห์")) return "w1";
    if (s.includes("2สัปดาห์")) return "w2";
    if (s.includes("3สัปดาห์")) return "w3";
    if (s.includes("4สัปดาห์")) return "w4";
    if (s.includes("5สัปดาห์")) return "w5";
    if (s.includes("6สัปดาห์")) return "w6";
    return "other";
  }

  function autoDetectOnset(p1) {
    if (!p1) return { raw: "", cat: "" };

    if (typeof p1.onsetCategory === "string" && p1.onsetCategory.trim()) {
      const s = p1.onsetCategory.trim();
      return { raw: s, cat: s };
    }

    const candidateKeys = [
      "onset",
      "onsetSelect",
      "onsetChoice",
      "onsetLabel",
      "onsetText",
      "onsetRaw"
    ];

    let raw = "";
    for (let i = 0; i < candidateKeys.length; i++) {
      const key = candidateKeys[i];
      const v = p1[key];
      if (!v) continue;
      if (typeof v === "string" && v.trim()) {
        raw = v.trim();
        break;
      } else if (typeof v === "object") {
        const vv =
          v.value != null
            ? v.value
            : v.label != null
            ? v.label
            : v.text != null
            ? v.text
            : "";
        if (String(vv).trim()) {
          raw = String(vv).trim();
          break;
        }
      }
    }

    const cat = onsetCategory(raw);
    return { raw, cat };
  }

  function onsetIsAny(c, cats) {
    const cat = c.onsetCat || "";
    if (!cats) return false;
    if (!Array.isArray(cats)) cats = [cats];
    return cats.includes(cat);
  }

  // ใช้กับ Lab หน้า 3: เช็คจาก token ที่ได้จาก checkbox
  function hasLabToken(ctx, keys) {
    const set = ctx.labTokenSet || new Set();
    if (!Array.isArray(keys)) keys = [keys];
    return keys.some((k) => set.has(k));
  }

  // ---------------------------------------------------------------------------
  // ดึง context จากหน้า 1–3
  // ---------------------------------------------------------------------------
  function getCtx() {
    const d = window.drugAllergyData || {};
    const p1 = d.page1 || {};
    const p2 = d.page2 || {};
    const p3 = d.page3 || {};

    // ---------- หน้า 1 ----------
    const shapes = arr(p1.rashShapes || p1.rashShape);
    const colors = arr(p1.rashColors || p1.rashColor);
    const locs = arr(p1.locations || p1.location);

    const onsetInfo = autoDetectOnset(p1);
    const onsetRaw = onsetInfo.raw;
    const onsetCat = onsetInfo.cat;

    const itch = !!(p1.itch && flag(p1.itch.has));
    const swell = !!(p1.swelling && flag(p1.swelling.has));
    const pain = !!(p1.pain && flag(p1.pain.has));
    const burn = !!(p1.burn && flag(p1.burn.has));

    const bullaeSmall = !!(p1.blister && flag(p1.blister.small));
    const bullaeMed = !!(p1.blister && flag(p1.blister.medium));
    const bullaeLarge = !!(p1.blister && flag(p1.blister.large));

    const pustule = !!(p1.pustule && flag(p1.pustule.has));
    const peelCenter = !!(p1.skinDetach && flag(p1.skinDetach.center));
    const peelLt10 = !!(p1.skinDetach && flag(p1.skinDetach.lt10));
    const peelGt30 = !!(p1.skinDetach && flag(p1.skinDetach.gt30));

    const scaleDry = !!(p1.scale && flag(p1.scale.dry));
    const scalePeel = !!(p1.scale && flag(p1.scale.peel));
    const scaleCrust = !!(p1.scale && flag(p1.scale.crust));

    const mucosalCountGt1 = !!p1.mucosalCountGt1 || !!p1.sjs_mucosal_gt1;

    // ---------- หน้า 2 ----------
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
    const bpDrop40 =
      flag(cv.bpDrop40) || flag(cv.bpDrop40pct) || flag(cv.bpDrop40mmhg);
    const shockLike = flag(cv.shock);

    let fever = nField(other.fever);
    if (!Number.isFinite(fever)) fever = nField(p2.fever);

    const fatigue = flag(other.fatigue);

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

    // ---------- หน้า 3 (Lab ใหม่: ใช้ token จาก checkbox เป็นหลัก) ----------
    const cbc = p3.cbc || {};
    const lft = p3.lft || {};
    const rft = p3.rft || {};
    const urineLab = p3.ua || p3.urine || {};
    const cardioLab = p3.heart || p3.cardio || {};
    const lungLab = p3.lung || {};
    const immuno = p3.immuno || p3.immunology || {};
    const chem = p3.chem || {};

    // ค่า numeric (fallback จากเวอร์ชันเก่า / ใช้แสดงผลต่อท้ายข้อความ)
    const wbc = nField(cbc.wbc);
    const neutroPct = nField(cbc.neutrophil || cbc.neut);
    const eosPct = nField(cbc.eosinophil || cbc.eos);
    const hb = nField(cbc.hb);
    const hct = nField(cbc.hct);
    const plt = nField(cbc.plt);
    const anc = nField(cbc.anc);

    const ast = nField(lft.ast);
    const alt = nField(lft.alt);
    const tbil = nField(lft.tbil || lft.tBil);
    const dbil = nField(lft.dbil || lft.dBil);

    const bun = nField(rft.bun);
    const cr = nField(rft.cr || rft.creatinine);
    const egfr = nField(rft.egfr);
    const uo = nField(rft.uo);

    const c3 = nField(immuno.c3);
    const c4 = nField(immuno.c4);

    const protU = tField(urineLab.protein);
    const rbcU = nField(urineLab.rbc);

    let spo2 = nField(lungLab.spo2);
    if (!Number.isFinite(spo2)) spo2 = nField(p2.spo2);
    if (!Number.isFinite(spo2)) spo2 = nField(p3.spo2);

    const ekgAbnormal = flag(cardioLab.ekgAbnormal || cardioLab.ekg);
    const troponin = nField(cardioLab.troponin);

    // token จากหน้า 3: ใช้เป็นหลักในการประเมิน Lab
    const labTokens = Array.isArray(p3.__tokens) ? p3.__tokens.slice() : [];
    const labTokenSet = new Set(labTokens);

    return {
      p1,
      p2,
      p3,
      shapes,
      colors,
      locs,
      onset: onsetRaw,
      onsetCat,
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
      // lab numeric (ใช้ประกอบข้อความ)
      wbc,
      neutroPct,
      eosPct,
      hb,
      hct,
      plt,
      anc,
      ast,
      alt,
      tbil,
      dbil,
      bun,
      cr,
      egfr,
      uo,
      c3,
      c4,
      protU,
      rbcU,
      spo2,
      ekgAbnormal,
      troponin,
      urine,
      lungLab,
      labTokens,
      labTokenSet
    };
  }

  // ---------------------------------------------------------------------------
  // ADR Definitions — 21 ชนิด
  // ใช้ Lab จากหน้า 3 ผ่าน token เช่น "eos_gt5", "cr_aki", "protein_pos" เท่านั้น
  // และให้ m.check(c) สามารถคืน:
  //   - boolean          → ใช้ label ของ major
  //   - {ok, details[]}  → ok=true/false, details = รายการข้อความย่อยสำหรับแสดงผล
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
            hasAny(c.shapes, ["ขอบหยัก", "วงกลม", "ขอบวงนูนแดงด้านในเรียบ"])
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
          check: (c) => onsetIsAny(c, "within1h")
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
          check: (c) => c.itch || hasAny(c.colors, ["แดง", "สีผิวปกติ"])
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
          label: "Lab: HR สูง หรือ SpO₂ < 94%",
          weight: 1,
          check: (c) => {
            const details = [];
            const hr = nField(c.p2 && c.p2.cv && c.p2.cv.hrValue);
            if (Number.isFinite(hr) && hr > 100) {
              details.push(`HR สูง (>100 bpm${Number.isFinite(hr) ? `, ปัจจุบัน ${hr}` : ""})`);
            }
            if (hasLabToken(c, "spo2_lt94") || (Number.isFinite(c.spo2) && c.spo2 < 94)) {
              let txt = "SpO₂ < 94%";
              if (Number.isFinite(c.spo2)) txt += ` (${c.spo2}%)`;
              details.push(txt);
            }
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "onset",
          label: "ระยะเวลา: ภายใน 1–6 ชั่วโมง (รวม ≤1ชม.)",
          weight: 1,
          check: (c) => onsetIsAny(c, ["within1h", "h1to6"])
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
          check: (c) => hasAny(c.colors, ["สีผิวปกติ", "แดง"])
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
          check: (c) => onsetIsAny(c, "within1h")
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
          check: (c) => hasAny(c.shapes, ["จุดเล็กแดง", "จุดเล็ก"])
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
            hasLabToken(c, "eos_gt5") // แยก eos >5% ออกจาก eos ≥10%
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
            onsetIsAny(c, [
              "within1h",
              "h1to6",
              "h6to24",
              "w1",
              "w2"
            ])
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
            hasAny(c.shapes, ["จ้ำเลือด"]) ||
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
          check: (c) => onsetIsAny(c, ["h6to24", "w1", "w2", "w3"])
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
            hasLabToken(c, ["wbc_gt11000", "neut_gt75"])
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
            onsetIsAny(c, [
              "within1h",
              "h1to6",
              "h6to24",
              "w1",
              "w2",
              "w3"
            ])
        },
        {
          id: "systemic",
          label: "ไข้/ปวดกล้ามเนื้อ/คลื่นไส้-อาเจียน/เลือดออกในทางเดินอาหาร",
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
          check: (c) =>
            c.bullaeLarge || c.scaleCrust || c.pustule
        },
        {
          id: "anemia_bp",
          // ตัด Hb < 10 g/dL ออกจาก TEN ตามคำสั่ง (ให้ไปอยู่ Pancytopenia อย่างเดียว)
          label: "เลือดออกในทางเดินอาหาร/กลืนลำบาก",
          weight: 1,
          check: (c) =>
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
          check: (c) => onsetIsAny(c, ["w1", "w2", "w3"])
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
          // เพิ่ม protein+ ตามคำสั่ง และไม่ใช้ eGFR < 60 ลิ้งว่าไตวายโดยตรง
          label: "ไตวาย/ตับอักเสบ/ปอดอักเสบ (ใช้ Lab จากหน้า 3)",
          weight: 1,
          check: (c) => {
            const details = [];
            if (hasLabToken(c, "alt_ast_ge2x")) {
              let txt = "ALT/AST ≥2x ULN";
              const parts = [];
              if (Number.isFinite(c.ast)) parts.push(`AST ${c.ast}`);
              if (Number.isFinite(c.alt)) parts.push(`ALT ${c.alt}`);
              if (parts.length) txt += ` (${parts.join(", ")})`;
              details.push(txt);
            }
            if (hasLabToken(c, "cr_aki")) {
              let txt = "Serum creatinine เพิ่มขึ้นตามเกณฑ์ AKI";
              if (Number.isFinite(c.cr)) txt += ` (Cr ${c.cr})`;
              details.push(txt);
            }
            if (hasLabToken(c, "protein_pos")) {
              let txt = "protein+ ในปัสสาวะ";
              if (c.protU) txt += ` (${c.protU})`;
              details.push(txt);
            }
            return details.length ? { ok: true, details } : { ok: false };
          }
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
            hasLabToken(c, ["eos_ge10", "atypical_lymph"])
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
            onsetIsAny(c, ["w1", "w2", "w3", "w4", "w5", "w6"])
        },
        {
          id: "organ_lab",
          // แยก sub-item เป็นรายละเอียด: ALT/AST, Cr, protein+, SpO2, Lung function, EKG, Troponin
          // เพื่อไม่ให้ SpO2 <94% ลากข้อความทั้งข้อใหญ่
          label:
            "Lab organ involvement",
          weight: 1,
          check: (c) => {
            const details = [];

            if (hasLabToken(c, "alt_ast_ge2x")) {
              let txt = "ALT/AST ≥2x ULN";
              const parts = [];
              if (Number.isFinite(c.ast)) parts.push(`AST ${c.ast}`);
              if (Number.isFinite(c.alt)) parts.push(`ALT ${c.alt}`);
              if (parts.length) txt += ` (${parts.join(", ")})`;
              details.push(txt);
            }

            if (hasLabToken(c, "cr_aki")) {
              let txt = "Serum creatinine เพิ่มขึ้นตามเกณฑ์ AKI";
              if (Number.isFinite(c.cr)) txt += ` (Cr ${c.cr})`;
              details.push(txt);
            }

            if (hasLabToken(c, "protein_pos")) {
              let txt = "protein+ ในปัสสาวะ";
              if (c.protU) txt += ` (${c.protU})`;
              details.push(txt);
            }

            if (hasLabToken(c, "spo2_lt94") || (Number.isFinite(c.spo2) && c.spo2 < 94)) {
              let txt = "SpO₂ < 94%";
              if (Number.isFinite(c.spo2)) txt += ` (${c.spo2}%)`;
              details.push(txt);
            }

            // Lung function (Abnormal Sound/CXR) → ให้แสดงใน DRESS ตามคำสั่ง
            const lungTokens = [
              "lung_abnormal",
              "cxr_abnormal",
              "lung_fn_abnormal",
              "lung_sound_abnormal"
            ];
            if (hasLabToken(c, lungTokens)) {
              details.push("Lung function: abnormal sound/CXR");
            }

            if (hasLabToken(c, "ekg_abnormal") || c.ekgAbnormal) {
              details.push("EKG ผิดปกติ");
            }

            if (hasLabToken(c, ["tropi_gt004", "tropt_gt001_003"])) {
              let txt = "Troponin ผิดปกติ";
              if (Number.isFinite(c.troponin)) txt += ` (${c.troponin})`;
              details.push(txt);
            }

            return details.length ? { ok: true, details } : { ok: false };
          }
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
          check: (c) =>
            c.bullaeSmall || c.bullaeMed || c.bullaeLarge
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
            hasAny(c.shapes, ["ขอบเขตชัด", "ปื้นแดง", "จุดแดงเล็ก", "จุดเล็กแดง"])
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
          check: (c) => hasAny(c.colors, ["แดงไหม้"]) || c.burn
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
          // ตัด Cr/eGFR ออกจาก Serum sickness ตามคำสั่ง เหลือเฉพาะต่อมน้ำเหลืองโต
          label: "ต่อมน้ำเหลืองโต",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.p3 && flag(c.p3.lymphNodeEnlarge)) {
              details.push("ต่อมน้ำเหลืองโต");
            }
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "lab",
          label: "protein+ / C3<90, C4<10",
          weight: 1,
          check: (c) => {
            const details = [];
            if (hasLabToken(c, "protein_pos")) {
              let txt = "protein+ ในปัสสาวะ";
              if (c.protU) txt += ` (${c.protU})`;
              details.push(txt);
            }
            if (hasLabToken(c, "c3c4_low")) {
              let txt = "C3/C4 ต่ำ";
              const parts = [];
              if (Number.isFinite(c.c3)) parts.push(`C3 ${c.c3}`);
              if (Number.isFinite(c.c4)) parts.push(`C4 ${c.c4}`);
              if (parts.length) txt += ` (${parts.join(", ")})`;
              details.push(txt);
            }
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "rbc_lab",
          label: "RBC 5–10/HPF",
          weight: 1,
          check: (c) => {
            if (hasLabToken(c, "rbc_5_10_hpf")) {
              return { ok: true, details: ["RBC 5–10/HPF ในปัสสาวะ"] };
            }
            return { ok: false };
          }
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
          label:
            "ไข้/ปวดข้อ/ข้ออักเสบ/ปวดกล้ามเนื้อ/ต่อมน้ำเหลืองโต",
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
          // ไม่ใช้ eGFR < 60 มาแปลว่าไตอักเสบโดยตรง
          label: "ไตเกี่ยวข้องจาก Lab (Cr/Protein/RBC)",
          weight: 1,
          check: (c) => {
            const details = [];
            if (hasLabToken(c, "cr_aki")) {
              let txt = "Cr เพิ่มขึ้นตามเกณฑ์ AKI";
              if (Number.isFinite(c.cr)) txt += ` (Cr ${c.cr})`;
              details.push(txt);
            }
            if (hasLabToken(c, "protein_pos")) {
              let txt = "protein+ ในปัสสาวะ";
              if (c.protU) txt += ` (${c.protU})`;
              details.push(txt);
            }
            if (hasLabToken(c, "rbc_5_10_hpf")) {
              details.push("RBC 5–10/HPF ในปัสสาวะ");
            }
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "bleed",
          label: "ไอเป็นเลือด/เลือดออกในปอด/เลือดออกในทางเดินอาหาร",
          weight: 1,
          check: (c) =>
            c.p2 && c.p2.resp && flag(c.p2.resp.hemoptysis)
        },
        {
          id: "lab_major",
          label: "protein+ / C3, C4 ต่ำ / Cr เพิ่ม (x2)",
          weight: 2,
          check: (c) => {
            const details = [];
            if (hasLabToken(c, "protein_pos")) {
              let txt = "protein+ ในปัสสาวะ";
              if (c.protU) txt += ` (${c.protU})`;
              details.push(txt);
            }
            if (hasLabToken(c, "c3c4_low")) {
              let txt = "C3/C4 ต่ำ";
              const parts = [];
              if (Number.isFinite(c.c3)) parts.push(`C3 ${c.c3}`);
              if (Number.isFinite(c.c4)) parts.push(`C4 ${c.c4}`);
              if (parts.length) txt += ` (${parts.join(", ")})`;
              details.push(txt);
            }
            if (hasLabToken(c, "cr_aki")) {
              let txt = "Cr เพิ่มขึ้นตามเกณฑ์ AKI";
              if (Number.isFinite(c.cr)) txt += ` (Cr ${c.cr})`;
              details.push(txt);
            }
            return details.length ? { ok: true, details } : { ok: false };
          }
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
          // ตัด Hb < 10 g/dL ออกตามคำสั่ง เหลือโฟกัสที่ดีซ่าน/คลินิก
          label: "ซีด/ดีซ่าน (x2)",
          weight: 2,
          check: (c) => {
            const details = [];
            if (c.p1 && flag(c.p1.jaundice)) {
              details.push("ดีซ่าน");
            }
            return details.length ? { ok: true, details } : { ok: false };
          }
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
          // ตัด Cr/eGFR ออกจาก Hemolytic anemia ตามคำสั่ง
          label: "ไตวายจาก hemolysis",
          weight: 1,
          check: () => ({ ok: false })
        },
        {
          id: "immune_lab",
          // แยก IgG+ และ C3+ เป็นรายละเอียดคนละบรรทัด
          label: "IgG+ / C3+",
          weight: 1,
          check: (c) => {
            const details = [];
            if (hasLabToken(c, "igg_pos")) {
              details.push("IgG+ (Direct Coombs)");
            }
            if (hasLabToken(c, "c3_pos")) {
              details.push("C3+ (Complement)");
            }
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "hb_drop",
          label: "Hb ลด ≥ 2–3 g/dL ใน 24–48 ชม. (x3)",
          weight: 3,
          check: (c) =>
            hasLabToken(c, "hb_drop_ge2_3")
        },
        {
          id: "ldh",
          label: "LDH สูง (2–10x ULN)",
          weight: 1,
          check: (c) =>
            hasLabToken(c, "ldh_high")
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
          label: "ซีด/อ่อนเพลีย",
          weight: 1,
          check: (c) => {
            const details = [];
            if (hasLabToken(c, "hb_lt10")) {
              let txt = "Hb < 10 g/dL";
              if (Number.isFinite(c.hb)) txt += ` (Hb ${c.hb})`;
              details.push(txt);
            }
            if (c.fatigue) {
              details.push("อ่อนเพลีย");
            }
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "bleed_major",
          label: "จุดเลือดออก/ฟกช้ำ/เลือดกำเดา/เหงือกเลือดออก (x3)",
          weight: 3,
          check: (c) => c.p3 && flag(c.p3.bleedingSigns)
        },
        {
          id: "lab_wbc",
          label: "WBC < 4000 (x2)",
          weight: 2,
          check: (c) => {
            if (hasLabToken(c, "wbc_lt4000")) {
              let txt = "WBC < 4,000/µL";
              if (Number.isFinite(c.wbc)) txt += ` (WBC ${c.wbc})`;
              return { ok: true, details: [txt] };
            }
            return { ok: false };
          }
        },
        {
          id: "lab_plt",
          label: "Plt < 100,000 (x2)",
          weight: 2,
          check: (c) => {
            if (hasLabToken(c, "plt_lt100k")) {
              let txt = "Plt < 100,000/µL";
              if (Number.isFinite(c.plt)) txt += ` (Plt ${c.plt})`;
              return { ok: true, details: [txt] };
            }
            return { ok: false };
          }
        },
        {
          id: "lab_hb_hct",
          label: "Hb < 10 หรือ Hct < 30% (x2)",
          weight: 2,
          check: (c) => {
            const details = [];
            if (hasLabToken(c, "hb_lt10")) {
              let txt = "Hb < 10 g/dL";
              if (Number.isFinite(c.hb)) txt += ` (Hb ${c.hb})`;
              details.push(txt);
            }
            if (hasLabToken(c, "hct_lt30")) {
              let txt = "Hct < 30%";
              if (Number.isFinite(c.hct)) txt += ` (Hct ${c.hct}%)`;
              details.push(txt);
            }
            return details.length ? { ok: true, details } : { ok: false };
          }
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
          label: "หนาวสั่น/เจ็บคอ/แผลในปาก",
          weight: 1,
          check: (c) =>
            c.soreThroat ||
            (c.p2 &&
              c.p2.other &&
              flag(c.p2.other.chills))
        },
        {
          id: "fever",
          label: "ไข้ > 37.5 °C",
          weight: 1,
          check: (c) =>
            Number.isFinite(c.fever) && c.fever > 37.5
        },
        {
          id: "organ",
          label: "ปอดอักเสบ",
          weight: 1,
          check: (c) => c.p3 && flag(c.p3.lungInvolve)
        },
        {
          id: "anc_major",
          label: "ANC < 1500 (x4)",
          weight: 4,
          check: (c) => {
            if (hasLabToken(c, "anc_lt1500")) {
              let txt = "ANC < 1,500/µL";
              if (Number.isFinite(c.anc)) txt += ` (ANC ${c.anc})`;
              return { ok: true, details: [txt] };
            }
            return { ok: false };
          }
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
          label:
            "เหงือกเลือดออก/เลือดออกในทางเดินอาหาร/ปัสสาวะเลือดออก",
          weight: 1,
          check: (c) => c.p3 && flag(c.p3.bleedingGI)
        },
        {
          id: "plt_major",
          label: "Plt < 150,000",
          weight: 1,
          check: (c) => {
            if (hasLabToken(c, "plt_lt150k")) {
              let txt = "Plt < 150,000/µL";
              if (Number.isFinite(c.plt)) txt += ` (Plt ${c.plt})`;
              return { ok: true, details: [txt] };
            }
            return { ok: false };
          }
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
          label: "ไข้/ปวดข้อ/อ่อนเพลีย",
          weight: 1,
          check: (c) =>
            (Number.isFinite(c.fever) && c.fever > 37.5) ||
            c.arthralgia ||
            c.fatigue
        },
        {
          id: "urine_sym",
          label: "ปัสสาวะออกน้อย/ปัสสาวะขุ่น",
          weight: 1,
          check: (c) => c.oliguria || (c.urine && flag(c.urine.turbid))
        },
        {
          id: "edema",
          label: "ขาบวม/บวม",
          weight: 1,
          check: (c) =>
            hasAny(c.locs, ["ขา"]) || c.swell
        },
        {
          id: "renal_major",
          // ใช้ Cr ตามเกณฑ์ AKI เป็นหลัก ไม่ใช้ eGFR < 60 ลิ้งตรง ๆ
          label: "Cr เพิ่ม ≥0.3 mg/dL หรือ AKI (x3)",
          weight: 3,
          check: (c) => {
            const details = [];
            if (hasLabToken(c, "cr_aki")) {
              let txt = "Serum creatinine เพิ่มขึ้นตามเกณฑ์ AKI";
              if (Number.isFinite(c.cr)) txt += ` (Cr ${c.cr})`;
              details.push(txt);
            }
            // ถ้าต้องการใช้ eGFR จริง ๆ ให้เพิ่ม token ในภายหลัง
            return details.length ? { ok: true, details } : { ok: false };
          }
        }
      ]
    }
  ];

  // ---------------------------------------------------------------------------
  // Core scoring
  // ---------------------------------------------------------------------------
  function computeAllADR() {
    const ctx = getCtx();
    const results = {};
    const scoresForChart = {};

    ADR_DEFS.forEach((def) => {
      let raw = 0;
      let max = 0;
      const matchedDetails = [];

      def.majors.forEach((m) => {
        const w = m.weight || 1;
        max += w;

        let ok = false;
        let details = [];

        try {
          const res = m.check(ctx);
          if (typeof res === "boolean") {
            ok = res;
            if (ok) details = [m.label];
          } else if (res && typeof res === "object") {
            if (Array.isArray(res.details)) {
              details = res.details.filter(Boolean);
              ok = typeof res.ok === "boolean" ? res.ok : details.length > 0;
            } else if (res.detail) {
              details = [res.detail];
              ok = typeof res.ok === "boolean" ? res.ok : true;
            } else if (typeof res.ok === "boolean") {
              ok = res.ok;
              if (ok) details = [m.label];
            } else {
              ok = !!res;
              if (ok) details = [m.label];
            }
          } else if (res) {
            ok = true;
            details = [m.label];
          }
        } catch (e) {
          ok = false;
          details = [];
        }

        if (ok) {
          raw += w;
          if (!details || !details.length) details = [m.label];
          matchedDetails.push(...details);
        }
      });

      const percent = max > 0 ? (raw / max) * 100 : 0;
      results[def.id] = {
        id: def.id,
        label: def.label,
        raw,
        max,
        percent,
        matchedMajors: matchedDetails
      };
      scoresForChart[def.label] = Math.round(percent);
    });

    return { results, scoresForChart };
  }

  function renderResultIntoP6Box(all) {
    const box = document.getElementById("p6BrainBox");
    if (!box) return;

    const { results } = all;
    const sorted = Object.values(results).sort(
      (a, b) => b.percent - a.percent
    );

    const html = `
      <div class="p6-brain-summary">
        <p class="p6-muted" style="margin-bottom:.35rem;">
          แสดงผลการประเมินตามโหมด C จากข้อมูลหน้า 1–3 (คิดเป็นเปอร์เซ็นต์ภายในแต่ละชนิดแยกกัน) — Lab หน้า 3 จะถูกนำไปคิดเฉพาะรายการที่ติ้กเลือกแล้วเท่านั้น และจะแสดงค่าที่กรอก/รายละเอียดต่อท้ายแต่ละข้อย่อย
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
  // Public API
  // ---------------------------------------------------------------------------
  function brainComputeAndRender() {
    injectStylesOnce();

    const d = window.drugAllergyData || {};
    const p1 = d.page1 || {};
    const p2 = d.page2 || {};
    const p3 = d.page3 || {};

    const hasData = (p) =>
      p && (p.__saved || Object.keys(p).some((k) => !k.startsWith("__")));

    const ready = hasData(p1) && hasData(p2) && hasData(p3);
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

  window.brainComputeAndRender = brainComputeAndRender;
  window.brainRules = {
    mode: "C",
    version: "2025-11-17-21ADR-LABTOKENS-FIXDISPLAY",
    defs: ADR_DEFS
  };
})();

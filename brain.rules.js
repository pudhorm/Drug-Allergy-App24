// ===================== brain.rules.js (REPLACE WHOLE FILE) =====================
// โหมด C: คิดคะแนนจำแนก ADR จากข้อมูลหน้า 1–3
// - แต่ละ ADR มี "ข้อใหญ่ (major)" หลายข้อ ตามเกณฑ์ที่ผู้ใช้กำหนด
// - ถ้าข้อใหญ่นั้นมีน้ำหนัก x2 / x3 / x4 ให้ weight = 2/3/4
// - ถ้ามีข้อย่อยในข้อนั้น ติ๊กข้อย่อยไหนก็ได้ = นับ 1 ครั้ง ตาม weight นั้น
// - คิด % = (คะแนนที่เข้าเกณฑ์ / คะแนนรวมสูงสุดของ ADR นั้น) * 100

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
    return n;
  }

  function arr(v) {
    if (!v) return [];
    return Array.isArray(v) ? v : [v];
  }

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
      const keys = ["checked", "use", "tick", "on", "selected"];
      for (const k of keys) {
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

  function detailFromList(list, allowed) {
    const src = arr(list);
    const out = [];
    for (const a of allowed) {
      if (src.includes(a)) out.push(a);
    }
    return out;
  }

  function hasAny(list, targets) {
    const src = arr(list);
    targets = arr(targets);
    return src.some((x) => targets.includes(x));
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
      s.includes("1-6ชั่วโมง") ||
      s.includes("1–6ชั่วโมง") ||
      s.includes("ภายใน1-6ชั่วโมง")
    )
      return "h1to6";
    if (
      s.includes("6-24ชั่วโมง") ||
      s.includes("6–24ชั่วโมง") ||
      s.includes("ภายใน6-24ชั่วโมง")
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
    const keys = [
      "onset",
      "onsetSelect",
      "onsetChoice",
      "onsetLabel",
      "onsetText",
      "onsetRaw"
    ];
    let raw = "";
    for (const k of keys) {
      const v = p1[k];
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

  function onsetIsAny(ctx, cats) {
    const cat = ctx.onsetCat || "";
    cats = arr(cats);
    return cats.includes(cat);
  }

  function hasLabToken(ctx, keys) {
    const set = ctx.labTokenSet || new Set();
    keys = arr(keys);
    return keys.some((k) => set.has(k));
  }

  // ---------------------------------------------------------------------------
  // flatten กลุ่ม "อวัยวะที่ผิดปกติ" จาก object ซ้อน ๆ ในหน้า 3
  // ---------------------------------------------------------------------------
  function flattenOrganGroupsIntoP3(p3) {
    if (!p3 || typeof p3 !== "object") return;
    const known = [
      p3.organs,
      p3.organ,
      p3.organAbnormal,
      p3.organAbnormal2,
      p3.section2,
      p3.organSection
    ];
    known.forEach((og) => {
      if (!og || typeof og !== "object") return;
      Object.keys(og).forEach((k) => {
        if (p3[k] === undefined) p3[k] = og[k];
      });
    });

    const skipKeys = [
      "cbc",
      "lft",
      "rft",
      "ua",
      "urine",
      "heart",
      "cardio",
      "lung",
      "immuno",
      "immunology",
      "chem",
      "__tokens",
      "__saved"
    ];
    Object.keys(p3).forEach((key) => {
      if (skipKeys.includes(key)) return;
      const og = p3[key];
      if (!og || typeof og !== "object") return;
      let looksGroup = false;
      for (const subKey in og) {
        if (!Object.prototype.hasOwnProperty.call(og, subKey)) continue;
        const v = og[subKey];
        if (!v || typeof v !== "object") continue;
        if ("checked" in v || "tick" in v || "use" in v || "on" in v || "selected" in v) {
          looksGroup = true;
          break;
        }
      }
      if (!looksGroup) return;
      Object.keys(og).forEach((subKey) => {
        if (p3[subKey] === undefined) p3[subKey] = og[subKey];
      });
    });
  }

  function collectOrgans(p2, p3) {
    const o = {};
    function mark(name, v) {
      if (flag(v)) o[name] = true;
    }
    if (p3 && typeof p3 === "object") {
      mark("lymph", p3.lymphNodeEnlarge || p3.lymphadenopathy || p3.lymph);
      mark("hepatitis", p3.hepatitis);
      mark("nephritis", p3.nephritis);
      mark("renalFailure", p3.renalFailure || p3.renalFail || p3.kidneyFailure);
      mark("pneumonia", p3.pneumonia || p3.lungInflammation);
      mark("myocarditis", p3.myocarditis);
      mark("thyroiditis", p3.thyroiditis);
      mark("hepatomegaly", p3.hepatomegaly || p3.liverEnlarge || p3.liverBig);
      mark("splenomegaly", p3.splenomegaly || p3.spleenEnlarge || p3.spleenBig);
      mark("legEdema", p3.legEdema || p3.legSwelling);
    }
    if (p2 && typeof p2 === "object") {
      mark("pneumonia", p2.pneumonia || (p2.resp && p2.resp.pneumonia));
      mark("renalFailure", p2.renalFailure || (p2.urine && p2.urine.renalFailure));
    }
    return o;
  }

  // ---------------------------------------------------------------------------
  // ดึง context จากหน้า 1–3
  // ---------------------------------------------------------------------------
  function getCtx() {
    const d = window.drugAllergyData || {};
    const p1 = d.page1 || {};
    const p2 = d.page2 || {};
    const p3 = d.page3 || {};

    flattenOrganGroupsIntoP3(p3);

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
    const tense = hasAny(shapes, ["ตึง"]);

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

    const ooze = !!(p1.ooze && flag(p1.ooze.has));
    const mucosalCountGt1 = !!p1.mucosalCountGt1 || !!p1.sjs_mucosal_gt1;

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
    const coughBlood = flag(resp.coughBlood || resp.hemoptysis);

    const hypotension = flag(cv.bpLow || cv.hypotension);
    const bpDrop40 =
      flag(cv.bpDrop40) || flag(cv.bpDrop40pct) || flag(cv.bpDrop40mmhg);
    const shockLike = flag(cv.shock);

    let hr = nField(cv.hrValue || cv.hr || other.hr);
    const fever = nField(other.fever || p2.fever);
    const fatigue = flag(other.fatigue || other.weak);

    const nauseaVomiting = flag(gi.nauseaVomiting || gi.nausea || gi.vomiting);
    const diarrhea = flag(gi.diarrhea);
    const colickyPain = flag(gi.colickyPain || gi.abdPain);
    const dysphagia = flag(gi.dysphagia || gi.swallowingPain);
    const soreThroat = flag(gi.soreThroat);
    const anorexia = flag(gi.anorexia);
    const giBleed = flag(gi.giBleed || gi.bleeding);

    const arthralgia = flag(msk.arthralgia);
    const arthritis = flag(msk.arthritis);
    const myalgia = flag(msk.myalgia);

    const oliguria = flag(urine.oliguria);
    const hematuria = flag(urine.hematuria);
    const darkUrine = flag(urine.dark || urine.teaColor);

    const conjunctivitis = flag(eye.conjunctivitis);
    const cornealUlcer = flag(eye.cornealUlcer);

    const cbc = p3.cbc || {};
    const lft = p3.lft || {};
    const rft = p3.rft || {};
    const urineLab = p3.ua || p3.urine || {};
    const cardioLab = p3.heart || p3.cardio || {};
    const lungLab = p3.lung || {};
    const immuno = p3.immuno || p3.immunology || {};
    const chem = p3.chem || {};

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

    const labTokens = Array.isArray(p3.__tokens) ? p3.__tokens.slice() : [];
    const labTokenSet = new Set(labTokens);

    const organs = collectOrgans(p2, p3);

    const lungFunctionAbnormal =
      flag(p2.lungFunctionAbnormal) ||
      flag(p2.lungAbnormal) ||
      flag(resp.abnormalCxr);

    return {
      d,
      p1,
      p2,
      p3,
      shapes,
      colors,
      locs,
      onsetRaw,
      onsetCat,
      itch,
      swell,
      pain,
      burn,
      tense,
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
      ooze,
      mucosalCountGt1,
      resp,
      cv,
      gi,
      msk,
      urine,
      eye,
      other,
      dyspnea,
      wheeze,
      tachypnea,
      coughBlood,
      hypotension,
      bpDrop40,
      shockLike,
      hr,
      fever,
      fatigue,
      nauseaVomiting,
      diarrhea,
      colickyPain,
      dysphagia,
      soreThroat,
      anorexia,
      giBleed,
      arthralgia,
      arthritis,
      myalgia,
      oliguria,
      hematuria,
      darkUrine,
      conjunctivitis,
      cornealUlcer,
      cbc,
      lft,
      rft,
      urineLab,
      cardioLab,
      lungLab,
      immuno,
      chem,
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
      labTokens,
      labTokenSet,
      organs,
      lungFunctionAbnormal
    };
  }

  // ---------------------------------------------------------------------------
  // ADR Definitions — 21 ชนิด
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
          check: (c) => {
            const details = detailFromList(c.shapes, [
              "ขอบหยัก",
              "วงกลม",
              "ขอบวงนูนแดงด้านในเรียบ"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "color",
          label: "สี: แดง/แดงซีด/ซีด/สีผิวปกติ",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.colors, [
              "แดง",
              "แดงซีด",
              "ซีด",
              "สีผิวปกติ"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "typical",
          label: "ลักษณะสำคัญ (x2): ตุ่มนูน/ปื้นนูน",
          weight: 2,
          check: (c) => {
            const details = detailFromList(c.shapes, ["ตุ่มนูน", "ปื้นนูน"]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "itch",
          label: "คัน",
          weight: 1,
          check: (c) => (c.itch ? { ok: true, details: ["คัน"] } : { ok: false })
        },
        {
          id: "rare_swelling",
          label: "อาการที่พบน้อย: บวม",
          weight: 1,
          check: (c) =>
            c.swell ? { ok: true, details: ["บวม"] } : { ok: false }
        },
        {
          id: "location",
          label:
            "ตำแหน่ง: ทั่วร่างกาย/มือ/เท้า/แขน/ขา/หน้า/รอบดวงตา/ลำคอ/ลำตัว/หลัง",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.locs, [
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
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
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
          id: "shape",
          label: "รูปร่าง: ตุ่มนูน/ปื้นนูน/บวม/นูนหนา/ผิวหนังตึง",
          weight: 1,
          check: (c) => {
            const details = [];
            details.push(
              ...detailFromList(c.shapes, ["ตุ่มนูน", "ปื้นนูน", "บวม", "นูนหนา"])
            );
            if (c.tense) details.push("ผิวหนังตึง");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "resp_major",
          label: "ลักษณะสำคัญ (x2): หายใจมีเสียงวี๊ด/หอบเหนื่อย/หายใจลำบาก",
          weight: 2,
          check: (c) => {
            const details = [];
            if (c.wheeze) details.push("หายใจมีเสียงวี๊ด");
            if (c.dyspnea || c.tachypnea)
              details.push("หอบเหนื่อย/หายใจลำบาก");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "skin_extra",
          label: "อาการเพิ่มเติมทางผิวหนัง: คัน/แดง/สีผิวปกติ",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.itch) details.push("คัน");
            details.push(...detailFromList(c.colors, ["แดง", "สีผิวปกติ"]));
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "gi_rare",
          label:
            "อาการที่พบน้อย: ท้องเสีย/กลืนลำบาก/ปวดบิดท้อง/คลื่นไส้-อาเจียน",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.diarrhea) details.push("ท้องเสีย");
            if (c.dysphagia) details.push("กลืนลำบาก");
            if (c.colickyPain) details.push("ปวดบิดท้อง");
            if (c.nauseaVomiting) details.push("คลื่นไส้/อาเจียน");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "onset",
          label: "ระยะเวลาการเกิด: ภายใน 1 ชม. หรือ 1–6 ชม.",
          weight: 1,
          check: (c) => onsetIsAny(c, ["within1h", "h1to6"])
        },
        {
          id: "bp_other",
          label: "อาการระบบอื่นๆ: BP ต่ำ หรือ BP ลดลง ≥40 mmHg",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.hypotension) details.push("BP ต่ำ (<90/60)");
            if (c.bpDrop40) details.push("BP ลดลง ≥40 mmHg ของ baseline");
            if (c.shockLike) details.push("ภาวะช็อก");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "lab_major",
          label: "Lab: HR สูง (>100) / SpO2 <94%",
          weight: 1,
          check: (c) => {
            const details = [];
            if (!Number.isFinite(c.hr)) {
              if (hasLabToken(c, "hr_gt100")) details.push("HR สูง (>100)");
            } else if (c.hr > 100) {
              details.push(`HR สูง (>100 bpm, ปัจจุบัน ${c.hr})`);
            }
            if (hasLabToken(c, "spo2_lt94") || (Number.isFinite(c.spo2) && c.spo2 < 94)) {
              let txt = "SpO₂ < 94%";
              if (Number.isFinite(c.spo2)) txt += ` (${c.spo2}%)`;
              details.push(txt);
            }
            return details.length ? { ok: true, details } : { ok: false };
          }
        }
      ]
    },

    // 3) Angioedema
    {
      id: "angioedema",
      label: "Angioedema",
      majors: [
        {
          id: "shape",
          label: "รูปร่าง: นูนหนา/ขอบไม่ชัดเจน",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.shapes, ["นูนหนา", "ขอบไม่ชัดเจน"]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "color",
          label: "สี: สีผิวปกติ/แดง",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.colors, ["สีผิวปกติ", "แดง"]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "typical",
          label: "ลักษณะสำคัญ (x2): บวม",
          weight: 2,
          check: (c) =>
            c.swell ? { ok: true, details: ["บวม"] } : { ok: false }
        },
        {
          id: "skin_extra",
          label: "อาการเพิ่มเติมทางผิวหนัง: ผิวหนังตึง",
          weight: 1,
          check: (c) =>
            c.tense ? { ok: true, details: ["ผิวหนังตึง"] } : { ok: false }
        },
        {
          id: "rare",
          label: "อาการที่พบน้อย: คัน/ไม่คัน/ปวด/แสบ",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.itch) details.push("คัน");
            if (!c.itch) details.push("ไม่คัน");
            if (c.pain) details.push("ปวด");
            if (c.burn) details.push("แสบ");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "location",
          label: "ตำแหน่ง: ริมฝีปาก/รอบดวงตา/ลิ้น/อวัยวะเพศ",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.locs, [
              "ริมฝีปาก",
              "รอบดวงตา",
              "ลิ้น",
              "อวัยวะเพศ"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
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
          check: (c) => {
            const details = detailFromList(c.shapes, [
              "ปื้นแดง",
              "ปื้นนูน",
              "ตุ่มนูน"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "color",
          label: "สี: แดง",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.colors, ["แดง"]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "typical",
          label: "ลักษณะสำคัญ (x2): จุดเล็กแดง",
          weight: 2,
          check: (c) => {
            const details = detailFromList(c.shapes, ["จุดเล็กแดง", "จุดเล็ก"]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "itch",
          label: "คัน",
          weight: 1,
          check: (c) => (c.itch ? { ok: true, details: ["คัน"] } : { ok: false })
        },
        {
          id: "rare",
          label: "อาการที่พบน้อย: ไข้ >37.5°C / Eosinophil>5%",
          weight: 1,
          check: (c) => {
            const details = [];
            if (Number.isFinite(c.fever) && c.fever > 37.5) {
              details.push(`ไข้ Temp > 37.5 °C (${c.fever.toFixed(1)} °C)`);
            }
            if (hasLabToken(c, "eos_gt5")) {
              let txt = "Eosinophil >5%";
              if (Number.isFinite(c.eosPct)) txt += ` (${c.eosPct}%)`;
              details.push(txt);
            }
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "location",
          label: "ตำแหน่ง: สมมาตร/ลำตัว/แขน/ใบหน้า/ลำคอ",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.locs, [
              "สมมาตร",
              "ลำตัว",
              "แขน",
              "ใบหน้า",
              "หน้า",
              "ลำคอ"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "onset",
          label: "ระยะเวลา: 1–6 ชม./6–24 ชม./1–2 สัปดาห์",
          weight: 1,
          check: (c) => onsetIsAny(c, ["h1to6", "h6to24", "w1", "w2"])
        },
        {
          id: "organ",
          label: "อวัยวะที่ผิดปกติ: ต่อมน้ำเหลืองโต/ข้ออักเสบ/ไตอักเสบ/ตับอักเสบ",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.organs.lymph) details.push("ต่อมน้ำเหลืองโต");
            if (c.arthritis) details.push("ข้ออักเสบ");
            if (c.organs.nephritis) details.push("ไตอักเสบ");
            if (c.organs.hepatitis) details.push("ตับอักเสบ");
            return details.length ? { ok: true, details } : { ok: false };
          }
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
          check: (c) => {
            const details = detailFromList(c.shapes, ["วงกลม", "วงรี"]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "color",
          label: "สี: แดง/ดำ-คล้ำ",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.colors, [
              "แดง",
              "ดำ",
              "ดำ/คล้ำ",
              "คล้ำ",
              "ม่วง/คล้ำ"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "typical",
          label: "ลักษณะสำคัญ (x3): ม่วง/คล้ำ",
          weight: 3,
          check: (c) => {
            const details = detailFromList(c.colors, [
              "ม่วง",
              "ม่วง/คล้ำ",
              "ดำ/คล้ำ",
              "คล้ำ"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "skin_extra",
          label: "ผิวหนังหลุดลอกตรงกลาง/เจ็บ/แสบ/ผิวหนังตึง",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.peelCenter) details.push("ผิวหนังหลุดลอกตรงกลางผื่น");
            if (c.pain) details.push("เจ็บ");
            if (c.burn) details.push("แสบ");
            if (c.tense) details.push("ผิวหนังตึง");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "rare_skin",
          label:
            "อาการที่พบน้อย: บวม/พอง/ตุ่มน้ำเล็ก/ตุ่มน้ำกลาง/ตุ่มน้ำใหญ่",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.swell) details.push("บวม");
            if (hasAny(c.shapes, ["พอง"])) details.push("พอง");
            if (c.bullaeSmall) details.push("ตุ่มน้ำขนาดเล็ก");
            if (c.bullaeMed) details.push("ตุ่มน้ำขนาดกลาง");
            if (c.bullaeLarge) details.push("ตุ่มน้ำขนาดใหญ่");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "location",
          label:
            "ตำแหน่ง: ริมฝีปาก/หน้า/มือ/เท้า/แขน/ขา/อวัยวะเพศ/ตำแหน่งเดิมกับครั้งก่อน",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.locs, [
              "ริมฝีปาก",
              "หน้า",
              "มือ",
              "เท้า",
              "แขน",
              "ขา",
              "อวัยวะเพศ",
              "ตำแหน่งเดิมกับครั้งก่อน"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "onset",
          label: "ระยะเวลา: ภายใน 1–2 สัปดาห์",
          weight: 1,
          check: (c) => onsetIsAny(c, ["w1", "w2"])
        },
        {
          id: "systemic",
          label: "อาการระบบอื่นๆ: ไข้/คลื่นไส้-อาเจียน/ปวดเมื่อยกล้ามเนื้อ",
          weight: 1,
          check: (c) => {
            const details = [];
            if (Number.isFinite(c.fever) && c.fever > 37.5)
              details.push("ไข้ Temp > 37.5 °C");
            if (c.nauseaVomiting) details.push("คลื่นไส้/อาเจียนปวด");
            if (c.myalgia) details.push("ปวดเมื่อยกล้ามเนื้อ");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "border",
          label: "ขอบ: ขอบเรียบ/ขอบเขตชัดเจน",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.shapes, [
              "ขอบเรียบ",
              "ขอบเขตชัดเจน",
              "ขอบชัด"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
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
          check: (c) => {
            const details = detailFromList(c.shapes, ["ผื่นแดง", "ปื้นแดง"]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "color",
          label: "สี: แดง/เหลือง",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.colors, ["แดง", "เหลือง"]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "typical",
          label: "ลักษณะสำคัญ (x3): ตุ่มหนอง",
          weight: 3,
          check: (c) => {
            const details = [];
            if (c.pustule) details.push("ตุ่มหนอง");
            if (hasAny(c.shapes, ["ตุ่มหนอง"])) details.push("ตุ่มหนอง");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "skin_extra",
          label: "อาการเพิ่มเติมทางผิวหนัง: บวม/คัน/เจ็บ",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.swell) details.push("บวม");
            if (c.itch) details.push("คัน");
            if (c.pain) details.push("เจ็บ");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "rare",
          label: "อาการที่พบน้อย: ปื้น/จ้ำเลือด/แห้ง/ลอก/ขุย",
          weight: 1,
          check: (c) => {
            const details = [];
            if (hasAny(c.shapes, ["ปื้น/จ้ำเลือด", "ปื้นเลือด", "จ้ำเลือด"]))
              details.push("ปื้น/จ้ำเลือด");
            if (c.scaleDry) details.push("แห้ง");
            if (c.scalePeel) details.push("ลอก");
            if (c.scaleCrust) details.push("ขุย");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "location",
          label: "ตำแหน่ง: หน้า/รักแร้/ทั่วร่างกาย/ขาหนีบ",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.locs, [
              "หน้า",
              "รักแร้",
              "ทั่วร่างกาย",
              "ขาหนีบ"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "onset",
          label: "ระยะเวลา: 6–24 ชม. หรือ 1–3 สัปดาห์",
          weight: 1,
          check: (c) => onsetIsAny(c, ["h6to24", "w1", "w2", "w3"])
        },
        {
          id: "systemic",
          label: "อาการระบบอื่นๆ: ไข้ Temp >37.5°C",
          weight: 1,
          check: (c) =>
            Number.isFinite(c.fever) && c.fever > 37.5
              ? { ok: true, details: [`ไข้ ${c.fever.toFixed(1)} °C`] }
              : { ok: false }
        },
        {
          id: "lab",
          label: "Lab: WBC>11000 / Neutrophil>75%",
          weight: 1,
          check: (c) => {
            const details = [];
            if (
              hasLabToken(c, "wbc_gt11000") ||
              (Number.isFinite(c.wbc) && c.wbc > 11000)
            ) {
              details.push("WBC > 11000");
            }
            if (
              hasLabToken(c, "neut_gt75") ||
              (Number.isFinite(c.neutroPct) && c.neutroPct > 75)
            ) {
              details.push("Neutrophil > 75%");
            }
            return details.length ? { ok: true, details } : { ok: false };
          }
        }
      ]
    },

    // 7) SJS
    {
      id: "sjs",
      label: "SJS",
      majors: [
        {
          id: "shape",
          label: "รูปร่าง: วงกลมคล้ายเป้าธนู (ไม่ครบ 3 ชั้น)",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.shapes, [
              "วงกลมคล้ายเป้าธนู (ไม่ครบ 3 ชั้น)",
              "วงกลมคล้ายเป้าธนู",
              "เป้าธนูไม่ครบ3ชั้น"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "color",
          label: "สี: ดำ/คล้ำ/เทา/แดง",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.colors, [
              "ดำ/คล้ำ",
              "ดำ",
              "คล้ำ",
              "เทา",
              "แดง"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "typical",
          label:
            "ลักษณะสำคัญ (x3): ผิวหนังหลุดลอกไม่เกิน 10% ของ BSA",
          weight: 3,
          check: (c) =>
            c.peelLt10
              ? { ok: true, details: ["ผิวหนังหลุดลอกไม่เกิน 10% BSA"] }
              : { ok: false }
        },
        {
          id: "skin_extra",
          label:
            "อาการเพิ่มเติม: น้ำเหลือง/พอง/ตุ่มน้ำเล็ก/ตุ่มน้ำกลาง/ตุ่มน้ำใหญ่",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.ooze) details.push("น้ำเหลือง");
            if (hasAny(c.shapes, ["พอง"])) details.push("พอง");
            if (c.bullaeSmall) details.push("ตุ่มน้ำขนาดเล็ก");
            if (c.bullaeMed) details.push("ตุ่มน้ำขนาดกลาง");
            if (c.bullaeLarge) details.push("ตุ่มน้ำขนาดใหญ่");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "scale",
          label: "อาการที่พบ: สะเก็ด",
          weight: 1,
          check: (c) =>
            c.scaleCrust ? { ok: true, details: ["สะเก็ด"] } : { ok: false }
        },
        {
          id: "location",
          label: "ตำแหน่ง: ลำตัว",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.locs, ["ลำตัว"]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "onset",
          label: "ระยะเวลา: 1–6 ชม./6–24 ชม./1–3 สัปดาห์",
          weight: 1,
          check: (c) =>
            onsetIsAny(c, ["h1to6", "h6to24", "w1", "w2", "w3"])
        },
        {
          id: "systemic",
          label:
            "อาการระบบอื่นๆ: ไข้/ปวดเมื่อยกล้ามเนื้อ/คลื่นไส้-อาเจียน/เลือดออกทางเดินอาหาร",
          weight: 1,
          check: (c) => {
            const details = [];
            if (Number.isFinite(c.fever) && c.fever > 37.5)
              details.push("ไข้ > 37.5 °C");
            if (c.myalgia) details.push("ปวดเมื่อยกล้ามเนื้อ");
            if (c.nauseaVomiting) details.push("คลื่นไส้/อาเจียน");
            if (c.giBleed) details.push("เลือดออกในทางเดินอาหาร");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "organ_sites",
          label:
            "อวัยวะที่ผิดปกติ/ตำแหน่งผื่น: ริมฝีปาก/รอบดวงตา/ลำตัว/แขน/ขา/หน้า/มือ/เท้า",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.locs, [
              "ริมฝีปาก",
              "รอบดวงตา",
              "ลำตัว",
              "แขน",
              "ขา",
              "หน้า",
              "มือ",
              "เท้า"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "mucosal",
          label: "จำนวนผื่นบริเวณเยื่อบุ > 1",
          weight: 1,
          check: (c) =>
            c.mucosalCountGt1
              ? { ok: true, details: ["จำนวนผื่นบริเวณเยื่อบุ > 1"] }
              : { ok: false }
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
          label: "รูปร่าง: ผื่นแดง/ปื้นแดง/วงกลมคล้ายเป้าธนู (ไม่ครบ 3 ชั้น)",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.shapes, [
              "ผื่นแดง",
              "ปื้นแดง",
              "วงกลมคล้ายเป้าธนู (ไม่ครบ 3 ชั้น)",
              "วงกลมคล้ายเป้าธนู"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "color",
          label: "สี: แดง/ดำ-คล้ำ",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.colors, ["แดง", "ดำ", "ดำ/คล้ำ", "คล้ำ"]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "typical",
          label:
            "ลักษณะสำคัญ (x3): ผิวหนังหลุดลอกเกิน 30% ของ BSA",
          weight: 3,
          check: (c) =>
            c.peelGt30
              ? { ok: true, details: ["ผิวหนังหลุดลอกเกิน 30% BSA"] }
              : { ok: false }
        },
        {
          id: "skin_extra",
          label: "อาการเพิ่มเติม: ตุ่มน้ำขนาดใหญ่/น้ำเหลือง/สะเก็ด",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.bullaeLarge) details.push("ตุ่มน้ำขนาดใหญ่");
            if (c.ooze) details.push("น้ำเหลือง");
            if (c.scaleCrust) details.push("สะเก็ด");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "rare",
          label:
            "อาการที่พบน้อย: ซีด/โลหิตจาง/เลือดออกในทางเดินอาหาร/กลืนลำบาก",
          weight: 1,
          check: (c) => {
            const details = [];
            if (hasAny(c.colors, ["ซีด"])) details.push("ซีด");
            if (hasLabToken(c, "anemia") || Number.isFinite(c.hb) && c.hb < 10)
              details.push("โลหิตจาง");
            if (c.giBleed) details.push("เลือดออกในทางเดินอาหาร");
            if (c.dysphagia) details.push("กลืนลำบาก");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "location",
          label:
            "ตำแหน่ง: ลำตัว/แขน/ขา/หน้า/มือ/เท้า/ศีรษะ/ทั่วร่างกาย/ริมฝีปาก",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.locs, [
              "ลำตัว",
              "แขน",
              "ขา",
              "หน้า",
              "มือ",
              "เท้า",
              "ศีรษะ",
              "ทั่วร่างกาย",
              "ริมฝีปาก"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "onset",
          label: "ระยะเวลา: ภายใน 1–3 สัปดาห์",
          weight: 1,
          check: (c) => onsetIsAny(c, ["w1", "w2", "w3"])
        },
        {
          id: "systemic",
          label:
            "อาการระบบอื่นๆ: ไข้/ปวดเมื่อยกล้ามเนื้อ/คลื่นไส้-อาเจียน/เจ็บคอ/ปวดข้อ/ท้องเสีย/เยื่อบุตาอักเสบ",
          weight: 1,
          check: (c) => {
            const details = [];
            if (Number.isFinite(c.fever) && c.fever > 37.5)
              details.push("ไข้ > 37.5 °C");
            if (c.myalgia) details.push("ปวดเมื่อยกล้ามเนื้อ");
            if (c.nauseaVomiting) details.push("คลื่นไส้/อาเจียน");
            if (c.soreThroat) details.push("เจ็บคอ");
            if (c.arthralgia) details.push("ปวดข้อ");
            if (c.diarrhea) details.push("ท้องเสีย");
            if (c.conjunctivitis) details.push("เยื่อบุตาอักเสบ (ตาแดง)");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "organ",
          label: "อวัยวะที่ผิดปกติ: ไตวาย/ตับอักเสบ/ปอดอักเสบ",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.organs.renalFailure) details.push("ไตวาย");
            if (c.organs.hepatitis) details.push("ตับอักเสบ");
            if (c.organs.pneumonia) details.push("ปอดอักเสบ");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "lab",
          label:
            "Lab: Cr เพิ่ม ≥0.3 mg/dL หรือ ≥1.5X baseline / protein+ / SpO2<94% / ALT/AST ≥2X ULN หรือ ≥40 U/L",
          weight: 1,
          check: (c) => {
            const details = [];
            if (
              hasLabToken(c, "cr_rise") ||
              (Number.isFinite(c.cr) && c.cr > 0)
            )
              details.push("Serum creatinine เพิ่มขึ้นตามเกณฑ์");
            if (hasLabToken(c, "protein_plus") || /[\+]/.test(c.protU || ""))
              details.push("protein +");
            if (hasLabToken(c, "spo2_lt94") || (Number.isFinite(c.spo2) && c.spo2 < 94))
              details.push("SpO₂ < 94%");
            if (
              hasLabToken(c, "altast_ge2x") ||
              (Number.isFinite(c.ast) && c.ast >= 40) ||
              (Number.isFinite(c.alt) && c.alt >= 40)
            )
              details.push("ALT/AST ≥ 2X ULN หรือ ≥ 40 U/L");
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
          id: "shape",
          label: "รูปร่าง: ผื่นแดง/ปื้นแดง",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.shapes, ["ผื่นแดง", "ปื้นแดง"]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "color",
          label: "สี: แดง",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.colors, ["แดง"]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "typical",
          label:
            "ลักษณะสำคัญ (x3): Eosinophil ≥10% / Atypical lymphocyte",
          weight: 3,
          check: (c) => {
            const details = [];
            if (
              hasLabToken(c, "eos_ge10") ||
              (Number.isFinite(c.eosPct) && c.eosPct >= 10)
            )
              details.push("Eosinophil ≥ 10%");
            if (hasLabToken(c, "atypical_lymph"))
              details.push("Atypical lymphocyte");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "skin_extra",
          label:
            "อาการเพิ่มเติมทางผิวหนัง: ตุ่มน้ำเล็ก/กลาง/ใหญ่/จ้ำเลือด",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.bullaeSmall) details.push("ตุ่มน้ำขนาดเล็ก");
            if (c.bullaeMed) details.push("ตุ่มน้ำขนาดกลาง");
            if (c.bullaeLarge) details.push("ตุ่มน้ำขนาดใหญ่");
            if (hasAny(c.shapes, ["จ้ำเลือด", "ปื้น/จ้ำเลือด"]))
              details.push("จ้ำเลือด");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "location",
          label: "ตำแหน่ง: หน้า/ลำตัว/แขน/ขา",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.locs, [
              "หน้า",
              "ลำตัว",
              "แขน",
              "ขา"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "systemic",
          label:
            "อาการระบบอื่นๆ: ไข้ / Lung function (Abnormal Sound/CXR)",
          weight: 1,
          check: (c) => {
            const details = [];
            if (Number.isFinite(c.fever) && c.fever > 37.5)
              details.push("ไข้ > 37.5 °C");
            if (c.lungFunctionAbnormal)
              details.push("Lung function (Abnormal Sound/CXR)");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "onset",
          label: "ระยะเวลา: 1–6 สัปดาห์",
          weight: 1,
          check: (c) =>
            onsetIsAny(c, ["w1", "w2", "w3", "w4", "w5", "w6"])
        },
        {
          id: "lab",
          label:
            "Lab: ALT/AST ≥2X ULN หรือ ≥40 / Cr เพิ่มตามเกณฑ์ / protein+ / SpO2<94% / EKG ผิดปกติ / Troponin สูง",
          weight: 1,
          check: (c) => {
            const details = [];
            if (
              hasLabToken(c, "altast_ge2x") ||
              (Number.isFinite(c.ast) && c.ast >= 40) ||
              (Number.isFinite(c.alt) && c.alt >= 40)
            )
              details.push("ALT/AST ≥ 2X ULN หรือ ≥ 40 U/L");
            if (hasLabToken(c, "cr_rise")) details.push("Cr เพิ่มขึ้นตามเกณฑ์");
            if (hasLabToken(c, "protein_plus") || /[\+]/.test(c.protU || ""))
              details.push("protein +");
            if (hasLabToken(c, "spo2_lt94") || (Number.isFinite(c.spo2) && c.spo2 < 94))
              details.push("SpO₂ <94%");
            if (c.ekgAbnormal || hasLabToken(c, "ekg_abnormal"))
              details.push("EKG ผิดปกติ");
            if (hasLabToken(c, "troponin_pos") || Number.isFinite(c.troponin))
              details.push("Troponin สูง");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "organ",
          label:
            "อวัยวะที่ผิดปกติ: ต่อมน้ำเหลืองโต/ตับอักเสบ/ไตอักเสบ/ไตวาย/ปอดอักเสบ/กล้ามเนื้อหัวใจอักเสบ/ต่อมไทรอยด์อักเสบ",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.organs.lymph) details.push("ต่อมน้ำเหลืองโต");
            if (c.organs.hepatitis) details.push("ตับอักเสบ");
            if (c.organs.nephritis) details.push("ไตอักเสบ");
            if (c.organs.renalFailure) details.push("ไตวาย");
            if (c.organs.pneumonia) details.push("ปอดอักเสบ");
            if (c.organs.myocarditis) details.push("กล้ามเนื้อหัวใจอักเสบ");
            if (c.organs.thyroiditis) details.push("ต่อมไทรอยด์อักเสบ");
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
          label: "รูปร่าง: ตุ่มนูน/ขอบวงนูนแดงด้านในเรียบ",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.shapes, [
              "ตุ่มนูน",
              "ขอบวงนูนแดงด้านในเรียบ"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "color",
          label: "สี: แดง/แดงซีด",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.colors, ["แดง", "แดงซีด"]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "typical",
          label: "ลักษณะสำคัญ (x3): วงกลม 3 ชั้น (เป้าธนู)",
          weight: 3,
          check: (c) => {
            const details = detailFromList(c.shapes, [
              "วงกลม 3 ชั้น (เป้าธนู)",
              "วงกลม 3 ชั้น",
              "เป้าธนู 3 ชั้น"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "skin_extra",
          label: "อาการเพิ่มเติมทางผิวหนัง: พอง/ตุ่มน้ำเล็ก/ตุ่มน้ำกลาง",
          weight: 1,
          check: (c) => {
            const details = [];
            if (hasAny(c.shapes, ["พอง"])) details.push("พอง");
            if (c.bullaeSmall) details.push("ตุ่มน้ำขนาดเล็ก");
            if (c.bullaeMed) details.push("ตุ่มน้ำขนาดกลาง");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "rare",
          label: "อาการที่พบน้อย: สะเก็ด",
          weight: 1,
          check: (c) =>
            c.scaleCrust ? { ok: true, details: ["สะเก็ด"] } : { ok: false }
        },
        {
          id: "onset",
          label: "ระยะเวลา: 1–6 ชม./6–24 ชม./1 สัปดาห์",
          weight: 1,
          check: (c) => onsetIsAny(c, ["h1to6", "h6to24", "w1"])
        },
        {
          id: "mucosal_sites",
          label: "ตำแหน่งที่พบ1: ช่องปาก/จมูก/ทวาร/อวัยวะเพศ",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.locs, [
              "ช่องปาก",
              "ปาก",
              "จมูก",
              "ทวาร",
              "อวัยวะเพศ"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "systemic",
          label:
            "อาการระบบอื่นๆ: ไข้/อ่อนเพลีย/ปวดเมื่อยกล้ามเนื้อ/เจ็บคอ/ปวดข้อ",
          weight: 1,
          check: (c) => {
            const details = [];
            if (Number.isFinite(c.fever) && c.fever > 37.5)
              details.push("ไข้ > 37.5 °C");
            if (c.fatigue) details.push("อ่อนเพลีย");
            if (c.myalgia) details.push("ปวดเมื่อยกล้ามเนื้อ");
            if (c.soreThroat) details.push("เจ็บคอ");
            if (c.arthralgia) details.push("ปวดข้อ");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "ext_sites",
          label:
            "ตำแหน่งที่พบ2: มือ/เท้า/แขน/ขา/หน้า/ลำตัว/หลัง/ลำคอ",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.locs, [
              "มือ",
              "เท้า",
              "แขน",
              "ขา",
              "หน้า",
              "ลำตัว",
              "หลัง",
              "ลำคอ"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
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
          label: "รูปร่าง: ขอบเขตชัด/ปื้นแดง/จุดแดงเล็ก",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.shapes, [
              "ขอบเขตชัด",
              "ปื้นแดง",
              "จุดแดงเล็ก"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "color",
          label: "สี: ดำ/คล้ำ/แดง",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.colors, [
              "ดำ",
              "ดำ/คล้ำ",
              "คล้ำ",
              "แดง"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "typical",
          label: "ลักษณะสำคัญ (x2): แดงไหม้",
          weight: 2,
          check: (c) => {
            const details = detailFromList(c.colors, ["แดงไหม้", "สีแดงไหม้"]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "skin_extra",
          label: "อาการเพิ่มเติมทางผิวหนัง: น้ำเหลือง/สะเก็ด",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.ooze) details.push("น้ำเหลือง");
            if (c.scaleCrust) details.push("สะเก็ด");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "may_have",
          label:
            "อาการที่อาจพบ: ตุ่มน้ำเล็ก/กลาง/ใหญ่/ลอก/ขุย/คัน",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.bullaeSmall) details.push("ตุ่มน้ำขนาดเล็ก");
            if (c.bullaeMed) details.push("ตุ่มน้ำขนาดกลาง");
            if (c.bullaeLarge) details.push("ตุ่มน้ำขนาดใหญ่");
            if (c.scalePeel) details.push("ลอก");
            if (c.scaleDry) details.push("ขุย");
            if (c.itch) details.push("คัน");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "location",
          label: "ตำแหน่ง: หน้า/หน้าอก/มือ/แขน/ขา",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.locs, [
              "หน้า",
              "หน้าอก",
              "มือ",
              "แขน",
              "ขา"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "onset",
          label: "ระยะเวลา: 1–6 ชม./6–24 ชม./1 สัปดาห์/1 ชั่วโมง (ซ้ำ)",
          weight: 1,
          check: (c) => onsetIsAny(c, ["within1h", "h1to6", "h6to24", "w1"])
        },
        {
          id: "burn_pain",
          label: "อาการเด่น (x2): แสบ",
          weight: 2,
          check: (c) =>
            c.burn ? { ok: true, details: ["แสบ"] } : { ok: false }
        }
      ]
    },

    // 12) Exfoliative dermatitis
    {
      id: "exfoliative",
      label: "Exfoliative dermatitis",
      majors: [
        {
          id: "shape",
          label: "รูปร่าง: ตึง",
          weight: 1,
          check: (c) =>
            c.tense || hasAny(c.shapes, ["ตึง"])
              ? { ok: true, details: ["ตึง"] }
              : { ok: false }
        },
        {
          id: "color",
          label: "สี: แดง",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.colors, ["แดง"]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "dry_major",
          label: "ลักษณะสำคัญ (x3): แห้ง",
          weight: 3,
          check: (c) =>
            c.scaleDry ? { ok: true, details: ["แห้ง"] } : { ok: false }
        },
        {
          id: "scale_major",
          label: "อาการเพิ่มเติมทางผิวหนัง (x3): ขุย",
          weight: 3,
          check: (c) =>
            c.scaleCrust ? { ok: true, details: ["ขุย"] } : { ok: false }
        },
        {
          id: "itch",
          label: "อาการอื่นๆ: คัน",
          weight: 1,
          check: (c) => (c.itch ? { ok: true, details: ["คัน"] } : { ok: false })
        },
        {
          id: "location",
          label: "ตำแหน่ง: ทั่วร่างกาย/มือ/เท้า/ศีรษะ",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.locs, [
              "ทั่วร่างกาย",
              "มือ",
              "เท้า",
              "ศีรษะ"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "onset",
          label:
            "ระยะเวลา: ภายใน 3 สัปดาห์ หรือ 1–6 ชม./6–24 ชม./1–4 สัปดาห์",
          weight: 1,
          check: (c) =>
            onsetIsAny(c, [
              "h1to6",
              "h6to24",
              "w1",
              "w2",
              "w3",
              "w4"
            ])
        },
        {
          id: "systemic",
          label:
            "อาการระบบอื่นๆ: ไข้/หนาวสั่น/อ่อนเพลีย/ดีซ่าน",
          weight: 1,
          check: (c) => {
            const details = [];
            if (Number.isFinite(c.fever) && c.fever > 37.5)
              details.push("ไข้");
            if (hasLabToken(c, "chill") || flag(c.other && c.other.chill))
              details.push("หนาวสั่น");
            if (c.fatigue) details.push("อ่อนเพลีย");
            if (hasAny(c.colors, ["ดีซ่าน", "ตัวเหลือง", "ตาเหลือง"]) || (Number.isFinite(c.tbil) && c.tbil > 0))
              details.push("ดีซ่าน");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "organ",
          label: "อวัยวะที่ผิดปกติ: ต่อมน้ำเหลืองโต/ตับโต/ม้ามโต/ขาบวม",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.organs.lymph) details.push("ต่อมน้ำเหลืองโต");
            if (c.organs.hepatomegaly) details.push("ตับโต");
            if (c.organs.splenomegaly) details.push("ม้ามโต");
            if (c.organs.legEdema) details.push("ขาบวม");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "highlight",
          label: "ลักษณะเด่น (x3): มันเงา/ลอก",
          weight: 3,
          check: (c) => {
            const details = [];
            if (hasAny(c.colors, ["มันเงา"])) details.push("มันเงา");
            if (c.scalePeel) details.push("ลอก");
            return details.length ? { ok: true, details } : { ok: false };
          }
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
          label: "รูปร่าง: ตุ่มนูน/ปื้นแดง",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.shapes, ["ตุ่มนูน", "ปื้นแดง"]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "color",
          label: "สี: แดง",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.colors, ["แดง"]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "typical",
          label: "ลักษณะสำคัญ (x2): คัน",
          weight: 2,
          check: (c) =>
            c.itch ? { ok: true, details: ["คัน"] } : { ok: false }
        },
        {
          id: "skin_extra",
          label: "อาการเพิ่มเติม: นูนหนา/ผื่นแดง",
          weight: 1,
          check: (c) => {
            const details = [];
            if (hasAny(c.shapes, ["นูนหนา"])) details.push("นูนหนา");
            if (hasAny(c.shapes, ["ผื่นแดง", "ปื้นแดง"])) details.push("ผื่นแดง");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "other_skin",
          label: "อาการที่พบอื่นๆ: จุดเล็กแดง/น้ำเหลือง/สะเก็ด",
          weight: 1,
          check: (c) => {
            const details = [];
            if (hasAny(c.shapes, ["จุดเล็กแดง", "จุดเล็ก"]))
              details.push("จุดเล็กแดง");
            if (c.ooze) details.push("น้ำเหลือง");
            if (c.scaleCrust) details.push("สะเก็ด");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "location",
          label: "ตำแหน่ง: ลำตัว/แขน/ขา/หน้า/ลำคอ",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.locs, [
              "ลำตัว",
              "แขน",
              "ขา",
              "หน้า",
              "ลำคอ"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "onset",
          label:
            "ระยะเวลา: 1–6 ชม./6–24 ชม./1–3 สัปดาห์",
          weight: 1,
          check: (c) =>
            onsetIsAny(c, ["h1to6", "h6to24", "w1", "w2", "w3"])
        },
        {
          id: "may_have",
          label: "อาการที่อาจพบ (x2): ขุย/แห้ง/ลอก",
          weight: 2,
          check: (c) => {
            const details = [];
            if (c.scaleCrust) details.push("ขุย");
            if (c.scaleDry) details.push("แห้ง");
            if (c.scalePeel) details.push("ลอก");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "distribution",
          label: "การกระจายตัว: สมมาตร",
          weight: 1,
          check: (c) =>
            detailFromList(c.locs, ["สมมาตร"]).length
              ? { ok: true, details: ["สมมาตร"] }
              : { ok: false }
        },
        {
          id: "bullae",
          label: "ตุ่มน้ำ: เล็ก/กลาง/ใหญ่",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.bullaeSmall) details.push("ตุ่มน้ำขนาดเล็ก");
            if (c.bullaeMed) details.push("ตุ่มน้ำขนาดกลาง");
            if (c.bullaeLarge) details.push("ตุ่มน้ำขนาดใหญ่");
            return details.length ? { ok: true, details } : { ok: false };
          }
        }
      ]
    },

    // 14) Bullous Drug Eruption
    {
      id: "bullous",
      label: "Bullous Drug Eruption",
      majors: [
        {
          id: "shape",
          label: "รูปร่าง: ตุ่มน้ำเล็ก/พอง/ตึง",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.bullaeSmall) details.push("ตุ่มน้ำขนาดเล็ก");
            if (hasAny(c.shapes, ["พอง"])) details.push("พอง");
            if (c.tense) details.push("ตึง");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "color",
          label: "สี: แดง",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.colors, ["แดง"]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "typical",
          label:
            "ลักษณะสำคัญ (x2): ตุ่มน้ำขนาดกลาง/ตุ่มน้ำขนาดใหญ่",
          weight: 2,
          check: (c) => {
            const details = [];
            if (c.bullaeMed) details.push("ตุ่มน้ำขนาดกลาง");
            if (c.bullaeLarge) details.push("ตุ่มน้ำขนาดใหญ่");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "skin_extra",
          label: "อาการเพิ่มเติมทางผิวหนัง: เจ็บ/แสบ",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.pain) details.push("เจ็บ");
            if (c.burn) details.push("แสบ");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "inner_color",
          label: "สีด้านใน (x3): ใส",
          weight: 3,
          check: (c) =>
            hasAny(c.colors, ["ใส"])
              ? { ok: true, details: ["ใส"] }
              : { ok: false }
        },
        {
          id: "location",
          label: "ตำแหน่ง: ลำตัว/แขน/ขา/เท้า",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.locs, [
              "ลำตัว",
              "แขน",
              "ขา",
              "เท้า"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "onset",
          label:
            "ระยะเวลา: 1–6 ชม./6–24 ชม./1–3 สัปดาห์",
          weight: 1,
          check: (c) =>
            onsetIsAny(c, ["h1to6", "h6to24", "w1", "w2", "w3"])
        }
      ]
    },

    // 15) Serum sickness
    {
      id: "serum_sickness",
      label: "Serum sickness",
      majors: [
        {
          id: "symptoms",
          label: "อาการ: ตุ่มนูน/แดง/บวม/คัน",
          weight: 1,
          check: (c) => {
            const details = [];
            if (hasAny(c.shapes, ["ตุ่มนูน"])) details.push("ตุ่มนูน");
            if (hasAny(c.colors, ["แดง"])) details.push("แดง");
            if (c.swell) details.push("บวม");
            if (c.itch) details.push("คัน");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "fever_major",
          label: "อาการ (x2): ไข้ Temp > 37.5 °C",
          weight: 2,
          check: (c) =>
            Number.isFinite(c.fever) && c.fever > 37.5
              ? { ok: true, details: [`ไข้ ${c.fever.toFixed(1)} °C`] }
              : { ok: false }
        },
        {
          id: "organs",
          label: "อวัยวะที่ผิดปกติ: ต่อมน้ำเหลืองโต/ไตอักเสบ",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.organs.lymph) details.push("ต่อมน้ำเหลืองโต");
            if (c.organs.nephritis) details.push("ไตอักเสบ");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "lab",
          label: "Lab: protein+ / C3<90 / C4<10",
          weight: 1,
          check: (c) => {
            const details = [];
            if (hasLabToken(c, "protein_plus") || /[\+]/.test(c.protU || ""))
              details.push("protein +");
            if (
              hasLabToken(c, "c3_low") ||
              (Number.isFinite(c.c3) && c.c3 < 90)
            )
              details.push("C3 < 90 mg/dL");
            if (
              hasLabToken(c, "c4_low") ||
              (Number.isFinite(c.c4) && c.c4 < 10)
            )
              details.push("C4 < 10 mg/dL");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "onset",
          label: "ระยะเวลา: 1–3 สัปดาห์ (รวม 1–6/6–24 ชม.)",
          weight: 1,
          check: (c) =>
            onsetIsAny(c, ["h1to6", "h6to24", "w1", "w2", "w3"])
        },
        {
          id: "lab2",
          label: "Lab2: RBC 5–10/HPF",
          weight: 1,
          check: (c) =>
            hasLabToken(c, "rbc_5to10") || (Number.isFinite(c.rbcU) && c.rbcU >= 5)
              ? { ok: true, details: ["RBC 5–10/HPF"] }
              : { ok: false }
        },
        {
          id: "joint_major",
          label: "อาการระบบอื่นๆ (x2): ปวดข้อ/ข้ออักเสบ",
          weight: 2,
          check: (c) => {
            const details = [];
            if (c.arthralgia) details.push("ปวดข้อ");
            if (c.arthritis) details.push("ข้ออักเสบ");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "location",
          label:
            "ตำแหน่งที่เกิด: รอบดวงตา/มือ/เท้า/ลำตัว/แขน/ขา",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.locs, [
              "รอบดวงตา",
              "มือ",
              "เท้า",
              "ลำตัว",
              "แขน",
              "ขา"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        }
      ]
    },

    // 16) Vasculitis
    {
      id: "vasculitis",
      label: "Vasculitis",
      majors: [
        {
          id: "rash",
          label: "อาการ: ตุ่มนูน/ผื่นแดง/แดง",
          weight: 1,
          check: (c) => {
            const details = [];
            if (hasAny(c.shapes, ["ตุ่มนูน"])) details.push("ตุ่มนูน");
            if (hasAny(c.shapes, ["ผื่นแดง"])) details.push("ผื่นแดง");
            if (hasAny(c.colors, ["แดง"])) details.push("แดง");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "systemic",
          label:
            "อาการระบบอื่นๆ: ไข้/ปวดข้อ/ข้ออักเสบ/ปวดกล้ามเนื้อ/ต่อมน้ำเหลืองโต",
          weight: 1,
          check: (c) => {
            const details = [];
            if (Number.isFinite(c.fever) && c.fever > 37.5)
              details.push("ไข้");
            if (c.arthralgia) details.push("ปวดข้อ");
            if (c.arthritis) details.push("ข้ออักเสบ");
            if (c.myalgia) details.push("ปวดกล้ามเนื้อ");
            if (c.organs.lymph) details.push("ต่อมน้ำเหลืองโต");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "organ",
          label: "อวัยวะที่ผิดปกติ: ไตอักเสบ/ไตวาย/ต่อมน้ำเหลืองโต",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.organs.nephritis) details.push("ไตอักเสบ");
            if (c.organs.renalFailure) details.push("ไตวาย");
            if (c.organs.lymph) details.push("ต่อมน้ำเหลืองโต");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "bleed",
          label:
            "อาการ: ไอเป็นเลือด/ถุงลมเลือดออก/เลือดออกในทางเดินอาหาร",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.coughBlood) details.push("ไอเป็นเลือด");
            if (hasLabToken(c, "alveolar_bleed"))
              details.push("ถุงลมเลือดออก");
            if (c.giBleed) details.push("เลือดออกในทางเดินอาหาร");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "onset",
          label: "ระยะเวลา: 1–3 สัปดาห์ (รวม 1–6/6–24 ชม.)",
          weight: 1,
          check: (c) =>
            onsetIsAny(c, ["h1to6", "h6to24", "w1", "w2", "w3"])
        },
        {
          id: "lab2",
          label: "Lab2: protein+ / C3<90 / C4<10",
          weight: 1,
          check: (c) => {
            const details = [];
            if (hasLabToken(c, "protein_plus") || /[\+]/.test(c.protU || ""))
              details.push("protein +");
            if (
              hasLabToken(c, "c3_low") ||
              (Number.isFinite(c.c3) && c.c3 < 90)
            )
              details.push("C3 < 90 mg/dL");
            if (
              hasLabToken(c, "c4_low") ||
              (Number.isFinite(c.c4) && c.c4 < 10)
            )
              details.push("C4 < 10 mg/dL");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "lab3",
          label:
            "Lab3: Cr เพิ่ม ≥0.3 mg/dL หรือ ≥1.5X baseline",
          weight: 1,
          check: (c) =>
            hasLabToken(c, "cr_rise")
              ? { ok: true, details: ["Serum creatinine เพิ่มขึ้นตามเกณฑ์"] }
              : { ok: false }
        },
        {
          id: "highlight",
          label: "อาการเด่น (x2): จ้ำเลือด/ขา",
          weight: 2,
          check: (c) => {
            const details = [];
            if (hasAny(c.shapes, ["จ้ำเลือด", "ปื้น/จ้ำเลือด"]))
              details.push("จ้ำเลือด");
            if (detailFromList(c.locs, ["ขา"]).length) details.push("ขา");
            return details.length ? { ok: true, details } : { ok: false };
          }
        }
      ]
    },

    // 17) Hemolytic anemia
    {
      id: "hemolytic",
      label: "Hemolytic anemia",
      majors: [
        {
          id: "symptoms_major",
          label: "อาการ (x2): ซีด/ดีซ่าน",
          weight: 2,
          check: (c) => {
            const details = [];
            if (hasAny(c.colors, ["ซีด"])) details.push("ซีด");
            if (
              hasAny(c.colors, ["ดีซ่าน", "ตัวเหลือง", "ตาเหลือง"]) ||
              Number.isFinite(c.tbil)
            )
              details.push("ดีซ่าน(ตัวเหลือง/ตาเหลือง)");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "dark_urine_major",
          label: "อาการระบบอื่นๆ (x3): ปัสสาวะสีชา/สีดำ",
          weight: 3,
          check: (c) =>
            c.darkUrine
              ? { ok: true, details: ["ปัสสาวะสีชา/สีดำ"] }
              : { ok: false }
        },
        {
          id: "organ",
          label: "อวัยวะที่ผิดปกติ: ไตวาย",
          weight: 1,
          check: (c) =>
            c.organs.renalFailure
              ? { ok: true, details: ["ไตวาย"] }
              : { ok: false }
        },
        {
          id: "lab_igg_c3",
          label: "Lab: IgG+ / C3+",
          weight: 1,
          check: (c) => {
            const details = [];
            if (hasLabToken(c, "igg_pos")) details.push("IgG+");
            if (hasLabToken(c, "c3_pos")) details.push("C3+");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "onset",
          label: "ระยะเวลา: 1–24 ชม./1 สัปดาห์",
          weight: 1,
          check: (c) =>
            onsetIsAny(c, ["h1to6", "h6to24", "w1"])
        },
        {
          id: "lab_hb_major",
          label:
            "Lab2 (x3): Hemoglobin ลดลง ≥2–3 g/dL ใน 24–48 ชม.",
          weight: 3,
          check: (c) =>
            hasLabToken(c, "hb_drop2") ||
            (Number.isFinite(c.hb) && c.hb < 10)
              ? { ok: true, details: ["Hb ลดลงตามเกณฑ์"] }
              : { ok: false }
        },
        {
          id: "lab_ldh",
          label: "Lab3: LDH สูง (2–10X ULN)",
          weight: 1,
          check: (c) =>
            hasLabToken(c, "ldh_high")
              ? { ok: true, details: ["LDH สูง (2–10X ULN)"] }
              : { ok: false }
        },
        {
          id: "bp",
          label: "BP: BP ต่ำ หรือ BP ลดลง ≥40 mmHg",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.hypotension) details.push("BP ต่ำ (<90/60)");
            if (c.bpDrop40) details.push("BP ลดลง ≥40 mmHg");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "other_pain",
          label: "อาการอื่น: ปวดหลังส่วนเอว/ปวดแน่นชายโครงขวา",
          weight: 1,
          check: (c) => {
            const details = [];
            if (flag(c.other && c.other.backPain))
              details.push("ปวดหลังส่วนเอว");
            if (flag(c.other && c.other.ruqPain))
              details.push("ปวดแน่นชายโครงขวา");
            return details.length ? { ok: true, details } : { ok: false };
          }
        }
      ]
    },

    // 18) Pancytopenia
    {
      id: "pancytopenia",
      label: "Pancytopenia",
      majors: [
        {
          id: "symptoms",
          label: "อาการ: ซีด/อ่อนเพลีย",
          weight: 1,
          check: (c) => {
            const details = [];
            if (hasAny(c.colors, ["ซีด"])) details.push("ซีด");
            if (c.fatigue) details.push("อ่อนเพลีย");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "systemic",
          label:
            "อาการระบบอื่นๆ: ปัสสาวะสีชา/ดำ/หนาวสั่น/เจ็บคอ/แผลในปาก",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.darkUrine) details.push("ปัสสาวะสีชา/สีดำ");
            if (flag(c.other && c.other.chill)) details.push("หนาวสั่น");
            if (c.soreThroat) details.push("เจ็บคอ");
            if (flag(c.other && c.other.mouthUlcer))
              details.push("แผลในปาก");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "bleeding_major",
          label:
            "อาการที่ผิดปกติ (x3): จุดเลือดออก/ฟกช้ำ/เลือดกำเดา/เหงือกเลือดออก",
          weight: 3,
          check: (c) => {
            const details = [];
            if (hasAny(c.shapes, ["จุดเลือดออก"])) details.push("จุดเลือดออก");
            if (hasAny(c.shapes, ["ฟกช้ำ"])) details.push("ฟกช้ำ");
            if (flag(c.other && c.other.noseBleed))
              details.push("เลือดกำเดาไหล");
            if (flag(c.other && c.other.gumBleed))
              details.push("เหงือกเลือดออก");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "hr",
          label: "ผลตรวจร่างกาย: HR สูง (>100)",
          weight: 1,
          check: (c) =>
            (!Number.isFinite(c.hr) && hasLabToken(c, "hr_gt100")) ||
            (Number.isFinite(c.hr) && c.hr > 100)
              ? { ok: true, details: ["HR สูง (>100 bpm)"] }
              : { ok: false }
        },
        {
          id: "onset",
          label: "ระยะเวลา: 1–3 สัปดาห์ (รวม 1–6/6–24 ชม.)",
          weight: 1,
          check: (c) =>
            onsetIsAny(c, ["h1to6", "h6to24", "w1", "w2", "w3"])
        },
        {
          id: "lab_fever",
          label: "Lab2: ไข้ Temp >37.5 °C",
          weight: 1,
          check: (c) =>
            Number.isFinite(c.fever) && c.fever > 37.5
              ? { ok: true, details: [`ไข้ ${c.fever.toFixed(1)} °C`] }
              : { ok: false }
        },
        {
          id: "lab_hb",
          label: "Hemoglobin (x2): Hb <10 g/dL",
          weight: 2,
          check: (c) =>
            hasLabToken(c, "hb_lt10") ||
            (Number.isFinite(c.hb) && c.hb < 10)
              ? { ok: true, details: ["Hb < 10 g/dL"] }
              : { ok: false }
        },
        {
          id: "lab_hct",
          label: "Hematocrit (x2): Hct <30%",
          weight: 2,
          check: (c) =>
            hasLabToken(c, "hct_lt30") ||
            (Number.isFinite(c.hct) && c.hct < 30)
              ? { ok: true, details: ["Hct < 30%"] }
              : { ok: false }
        },
        {
          id: "lab_wbc",
          label: "WBC (x2): WBC <4000",
          weight: 2,
          check: (c) =>
            hasLabToken(c, "wbc_lt4000") ||
            (Number.isFinite(c.wbc) && c.wbc < 4000)
              ? { ok: true, details: ["WBC < 4000"] }
              : { ok: false }
        },
        {
          id: "lab_plt",
          label: "Platelet (x2): Plt <100,000",
          weight: 2,
          check: (c) =>
            hasLabToken(c, "plt_lt100k") ||
            (Number.isFinite(c.plt) && c.plt < 100000)
              ? { ok: true, details: ["Platelet < 100,000"] }
              : { ok: false }
        }
      ]
    },

    // 19) Neutropenia
    {
      id: "neutropenia",
      label: "Neutropenia",
      majors: [
        {
          id: "symptoms",
          label: "อาการ: หนาวสั่น/เจ็บคอ/แผลในปาก",
          weight: 1,
          check: (c) => {
            const details = [];
            if (flag(c.other && c.other.chill)) details.push("หนาวสั่น");
            if (c.soreThroat) details.push("เจ็บคอ");
            if (flag(c.other && c.other.mouthUlcer))
              details.push("แผลในปาก");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "systemic",
          label: "อาการระบบอื่นๆ: ไข้/แผลในปาก/ทอนซิลอักเสบ",
          weight: 1,
          check: (c) => {
            const details = [];
            if (Number.isFinite(c.fever) && c.fever > 37.5)
              details.push("ไข้");
            if (flag(c.other && c.other.mouthUlcer))
              details.push("แผลในปาก");
            if (flag(c.other && c.other.tonsillitis))
              details.push("ทอนซิลอักเสบ");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "organ",
          label: "อวัยวะที่ผิดปกติ: ปอดอักเสบ/Lung function ผิดปกติ",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.organs.pneumonia) details.push("ปอดอักเสบ");
            if (c.lungFunctionAbnormal)
              details.push("Lung function (Abnormal Sound/CXR)");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "lab_anc",
          label: "Lab (x4): ANC <1500",
          weight: 4,
          check: (c) =>
            hasLabToken(c, "anc_lt1500") ||
            (Number.isFinite(c.anc) && c.anc < 1500)
              ? { ok: true, details: ["ANC < 1500"] }
              : { ok: false }
        }
      ]
    },

    // 20) Thrombocytopenia
    {
      id: "thrombocytopenia",
      label: "Thrombocytopenia",
      majors: [
        {
          id: "symptoms_major",
          label: "อาการ (x2): จุดเลือดออก/ปื้น-จ้ำเลือด",
          weight: 2,
          check: (c) => {
            const details = [];
            if (hasAny(c.shapes, ["จุดเลือดออก"])) details.push("จุดเลือดออก");
            if (hasAny(c.shapes, ["ปื้น/จ้ำเลือด", "จ้ำเลือด"]))
              details.push("ปื้น/จ้ำเลือด");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "systemic",
          label: "อาการระบบอื่นๆ: เหงือกเลือดออก/เลือดออกทางเดินอาหาร/ปัสสาวะเลือดออก",
          weight: 1,
          check: (c) => {
            const details = [];
            if (flag(c.other && c.other.gumBleed))
              details.push("เหงือกเลือดออก");
            if (c.giBleed) details.push("เลือดออกในทางเดินอาหาร");
            if (c.hematuria) details.push("ปัสสาวะเลือดออก");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "lab_plt",
          label: "Lab: Platelet <150,000",
          weight: 1,
          check: (c) =>
            hasLabToken(c, "plt_lt150k") ||
            (Number.isFinite(c.plt) && c.plt < 150000)
              ? { ok: true, details: ["Platelet < 150,000"] }
              : { ok: false }
        },
        {
          id: "onset",
          label: "ระยะเวลา: 1–24 ชม./1 สัปดาห์",
          weight: 1,
          check: (c) =>
            onsetIsAny(c, ["h1to6", "h6to24", "w1"])
        }
      ]
    },

    // 21) Nephritis
    {
      id: "nephritis",
      label: "Nephritis",
      majors: [
        {
          id: "symptoms",
          label: "อาการ: ไข้/ปวดข้อ/อ่อนเพลีย",
          weight: 1,
          check: (c) => {
            const details = [];
            if (Number.isFinite(c.fever) && c.fever > 37.5)
              details.push("ไข้");
            if (c.arthralgia) details.push("ปวดข้อ");
            if (c.fatigue) details.push("อ่อนเพลีย");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "systemic",
          label: "อาการระบบอื่นๆ: ปัสสาวะออกน้อย/ปัสสาวะขุ่น",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.oliguria) details.push("ปัสสาวะออกน้อย");
            if (flag(c.urine && c.urine.cloudy)) details.push("ปัสสาวะขุ่น");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "organ",
          label: "อวัยวะที่ผิดปกติ: ขาบวม/บวม",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.organs.legEdema) details.push("ขาบวม");
            if (c.swell) details.push("บวม");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "lab_renal_major",
          label:
            "Lab (x3): Cr เพิ่มตามเกณฑ์ / eGFR <60",
          weight: 3,
          check: (c) => {
            const details = [];
            if (hasLabToken(c, "cr_rise")) details.push("Cr เพิ่มขึ้น");
            if (
              hasLabToken(c, "egfr_lt60") ||
              (Number.isFinite(c.egfr) && c.egfr < 60)
            )
              details.push("eGFR < 60 mL/min/1.73m²");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "onset",
          label: "ระยะเวลา: 1–2 สัปดาห์ (รวม 1–6/6–24 ชม.)",
          weight: 1,
          check: (c) =>
            onsetIsAny(c, ["h1to6", "h6to24", "w1", "w2"])
        }
      ]
    }
  ];

  // ---------------------------------------------------------------------------
  // การประเมินคะแนนตาม ADR_DEFS
  // ---------------------------------------------------------------------------
  function evalOne(def, ctx) {
    let score = 0;
    let maxScore = 0;
    const majors = [];

    for (const m of def.majors) {
      const w = m.weight || 1;
      maxScore += w;

      let res = m.check(ctx);
      let ok = false;
      let details = [];

      if (typeof res === "boolean") {
        ok = res;
      } else if (res && typeof res === "object") {
        ok = !!res.ok;
        if (Array.isArray(res.details)) details = res.details;
      }

      if (ok) score += w;

      majors.push({
        id: m.id,
        label: m.label,
        weight: w,
        ok,
        details
      });
    }

    const percent = maxScore > 0 ? (score * 100) / maxScore : 0;
    return {
      id: def.id,
      label: def.label,
      score,
      maxScore,
      percent,
      majors
    };
  }

  function evalAll(data) {
    // อนุญาตให้ส่ง data มา หรือใช้ window.drugAllergyData ปัจจุบัน
    let backup = null;
    if (data) {
      backup = window.drugAllergyData;
      window.drugAllergyData = data;
    }

    const ctx = getCtx();
    const items = ADR_DEFS.map((def) => evalOne(def, ctx));

    if (backup) {
      window.drugAllergyData = backup;
    }

    return {
      ctx,
      items,
      list: items
    };
  }

  window.brainRules = {
    ADR_DEFS,
    evalAll
  };
})();

```js
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

  function detailFromList(list, allowed) {
    const src = arr(list);
    const result = [];
    allowed.forEach((item) => {
      if (src.includes(item)) result.push(item);
    });
    return result;
  }

  function hasAny(list, targets) {
    const src = arr(list);
    return src.some((x) => targets.includes(x));
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

  // ดึง "อวัยวะที่ผิดปกติ" จากหน้า 2 เท่านั้น
  function extractOrganFlagsFromPage2(p2) {
    const result = {
      organLiver: false,
      organKidney: false,
      organRenalFailure: false,
      organLung: false,
      organMyocarditis: false,
      organThyroiditis: false,
      organLymph: false,
      organHepatomegaly: false,
      organSplenomegaly: false
    };
    if (!p2) return result;

    const organs = p2.organs || p2.organ || p2.organsAbnormal || {};
    if (!organs || typeof organs !== "object") return result;

    const norm = (s) => String(s || "").toLowerCase();

    Object.keys(organs).forEach((key) => {
      const val = organs[key];
      if (!flag(val)) return;
      const name = norm(key);

      if (/ต่อมน้ำเหลือง|lymph/.test(name)) {
        result.organLymph = true;
      }
      if (/ตับอักเสบ|ตับโต?/.test(name) || /hepat|liver/.test(name)) {
        result.organLiver = true;
        if (/ตับโต|hepatomegaly/.test(name)) result.organHepatomegaly = true;
      }
      if (/ไตอักเสบ/.test(name) || /nephritis/.test(name)) {
        result.organKidney = true;
      }
      if (/ไตวาย/.test(name) || /renal\s*fail/.test(name)) {
        result.organRenalFailure = true;
      }
      if (/ปอด/.test(name) || /pneum|lung/.test(name)) {
        result.organLung = true;
      }
      if (/กล้ามเนื้อหัวใจ|myocard/.test(name)) {
        result.organMyocarditis = true;
      }
      if (/ไทรอยด์/.test(name) || /thyroid/.test(name)) {
        result.organThyroiditis = true;
      }
      if (/ม้ามโต|splenomegaly/.test(name)) {
        result.organSplenomegaly = true;
      }
    });

    return result;
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

    // ---------- หน้า 3 ----------
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

    const organFlags = extractOrganFlagsFromPage2(p2);
    const {
      organLiver,
      organKidney,
      organRenalFailure,
      organLung,
      organMyocarditis,
      organThyroiditis,
      organLymph,
      organHepatomegaly,
      organSplenomegaly
    } = organFlags;

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
      labTokenSet,
      organLiver,
      organKidney,
      organRenalFailure,
      organLung,
      organMyocarditis,
      organThyroiditis,
      organLymph,
      organHepatomegaly,
      organSplenomegaly
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
          label: "ลักษณะสำคัญ: ตุ่มนูน/ปื้นนูน (x2)",
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
          id: "swelling",
          label: "บวม",
          weight: 1,
          check: (c) => (c.swell ? { ok: true, details: ["บวม"] } : { ok: false })
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
          id: "shape_skin",
          label: "รูปร่างผื่น/บวม/ตึง",
          weight: 1,
          check: (c) => {
            const details = [];
            details.push(
              ...detailFromList(c.shapes, ["ตุ่มนูน", "ปื้นนูน", "บวม", "นูนหนา", "ตึง"])
            );
            if (c.swell) details.push("บวม");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "resp_major",
          label: "หายใจมีเสียงวี๊ด/หอบเหนื่อย/หายใจลำบาก (x2)",
          weight: 2,
          check: (c) => {
            const details = [];
            if (c.wheeze) details.push("หายใจมีเสียงวี๊ด");
            if (c.dyspnea) details.push("หายใจลำบาก");
            if (c.tachypnea) details.push("หอบเหนื่อย");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "skin_extra",
          label: "อาการผิวหนัง: คัน/แดง/สีผิวปกติ",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.itch) details.push("คัน");
            details.push(...detailFromList(c.colors, ["แดง", "สีผิวปกติ"]));
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "gi",
          label: "ท้องเสีย/กลืนลำบาก/ปวดบิดท้อง/คลื่นไส้-อาเจียน",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.diarrhea) details.push("ท้องเสีย");
            if (c.dysphagia) details.push("กลืนลำบาก");
            if (c.colickyPain) details.push("ปวดบิดท้อง");
            if (c.nauseaVomiting) details.push("คลื่นไส้-อาเจียน");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "bp_major",
          label: "BP ต่ำ หรือ BP ลด ≥40 mmHg จาก baseline",
          weight: 2,
          check: (c) => {
            const details = [];
            if (c.hypotension) details.push("BP ต่ำ");
            if (c.bpDrop40) details.push("BP ลด ≥40 mmHg จาก baseline");
            if (c.shockLike) details.push("ภาวะช็อก");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "lab_major",
          label: "Lab: HR สูง หรือ SpO₂ < 94%",
          weight: 1,
          check: (c) => {
            const details = [];
            const hr = nField(c.p2 && c.p2.cv && c.p2.cv.hrValue);
            if (Number.isFinite(hr) && hr > 100) {
              details.push(
                `HR สูง (>100 bpm${Number.isFinite(hr) ? `, ปัจจุบัน ${hr}` : ""})`
              );
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
          id: "swelling_major",
          label: "ลักษณะสำคัญ: บวม (x2)",
          weight: 2,
          check: (c) =>
            c.swell ? { ok: true, details: ["บวม"] } : { ok: false }
        },
        {
          id: "skin_tense",
          label: "ผิวหนังตึง",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.burn || c.pain) details.push("ผิวหนังตึง/เจ็บ/แสบ");
            if (hasAny(c.shapes, ["ตึง"])) details.push("ตึง");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "sym_others",
          label: "อาการอื่น: คัน/ไม่คัน/ปวด/แสบ",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.itch) details.push("คัน");
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

    // 4) Maculopapular rash (MP rash)
    {
      id: "mpr",
      label: "Maculopapular rash",
      majors: [
        {
          id: "shape",
          label: "รูปร่าง: ปื้นแดง/ปื้นนูน/ตุ่มนูน",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.shapes, ["ปื้นแดง", "ปื้นนูน", "ตุ่มนูน"]);
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
          label: "อาการเพิ่มเติมทางผิวหนัง: คัน",
          weight: 1,
          check: (c) =>
            c.itch ? { ok: true, details: ["คัน"] } : { ok: false }
        },
        {
          id: "rare_sym",
          label: "อาการที่พบน้อย: ไข้ > 37.5 °C / Eosinophil > 5%",
          weight: 1,
          check: (c) => {
            const details = [];
            if (Number.isFinite(c.fever) && c.fever > 37.5) {
              details.push(`ไข้ Temp > 37.5 °C (${c.fever.toFixed(1)} °C)`);
            }
            if (hasLabToken(c, "eos_gt5")) {
              let txt = "Eosinophil > 5%";
              if (Number.isFinite(c.eosPct)) txt += ` (${c.eosPct}%)`;
              details.push(txt);
            }
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "location",
          label: "ตำแหน่งที่พบ: สมมาตร/ลำตัว/แขน/ใบหน้า/ลำคอ",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.locs, [
              "สมมาตร",
              "ลำตัว",
              "แขน",
              "หน้า",
              "ใบหน้า",
              "ลำคอ"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "onset",
          label: "ระยะเวลาการเกิด: 1–6 ชม. / 6–24 ชม. / 1–2 สัปดาห์",
          weight: 1,
          check: (c) =>
            onsetIsAny(c, ["h1to6", "h6to24", "w1", "w2"])
        },
        {
          id: "organ",
          label: "อวัยวะที่ผิดปกติ: ต่อมน้ำเหลืองโต/ข้ออักเสบ/ไตอักเสบ/ตับอักเสบ",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.organLymph) details.push("ต่อมน้ำเหลืองโต");
            if (c.arthritis) details.push("ข้ออักเสบ");
            if (c.organKidney) details.push("ไตอักเสบ");
            if (c.organLiver) details.push("ตับอักเสบ");
            return details.length ? { ok: true, details } : { ok: false };
          }
        }
      ]
    },

    // 5) Fixed drug eruption — ปรับตามเกณฑ์: สี = แดง/ดำ-คล้ำ, ลักษณะสำคัญ (x3) = ม่วง/คล้ำ เท่านั้น
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
            // ข้อ 2 สี: แดง, ดำ/คล้ำ (น้ำหนักปกติ)
            const details = detailFromList(c.colors, [
              "แดง",
              "ดำ/คล้ำ",
              "ดำ",
              "คล้ำ"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "typical",
          label: "ลักษณะสำคัญ (พบมาก) (x3): ม่วง/คล้ำ",
          weight: 3,
          check: (c) => {
            // ข้อ 3 ลักษณะสำคัญ: ให้คิดคะแนนเฉพาะ ม่วง/คล้ำ (และรองรับคำว่า ม่วง ถ้ามี)
            const details = detailFromList(c.colors, [
              "ม่วง/คล้ำ",
              "ม่วง"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "skin_extra",
          label: "อาการเพิ่มเติมทางผิวหนัง: ผิวหนังหลุดลอกตรงกลาง/เจ็บ/แสบ/ผิวหนังตึง",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.peelCenter) details.push("ผิวหนังหลุดลอกตรงกลางผื่น");
            if (c.pain) details.push("เจ็บ");
            if (c.burn) details.push("แสบ");
            if (hasAny(c.shapes, ["ตึง"])) details.push("ผิวหนังตึง");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "rare",
          label: "อาการที่พบน้อย: บวม/พอง/ตุ่มน้ำเล็ก-กลาง-ใหญ่",
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
            "ตำแหน่งที่พบ: ริมฝีปาก/หน้า/มือ/เท้า/แขน/ขา/อวัยวะเพศ/ตำแหน่งเดิมกับครั้งก่อน",
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
          label: "ระยะเวลาการเกิด: 1–2 สัปดาห์",
          weight: 1,
          check: (c) => onsetIsAny(c, ["w1", "w2"])
        },
        {
          id: "systemic",
          label: "อาการระบบอื่นๆ: ไข้/คลื่นไส้อาเจียน/ปวดเมื่อยกล้ามเนื้อ",
          weight: 1,
          check: (c) => {
            const details = [];
            if (Number.isFinite(c.fever) && c.fever > 37.5) {
              details.push(`ไข้ Temp > 37.5 °C (${c.fever.toFixed(1)} °C)`);
            }
            if (c.nauseaVomiting) details.push("คลื่นไส้/อาเจียน");
            if (c.myalgia) details.push("ปวดเมื่อยกล้ามเนื้อ");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "border",
          label: "ขอบ: ขอบเรียบ/ขอบเขตชัดเจน",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.shapes, ["ขอบเรียบ", "ขอบเขตชัดเจน", "ขอบเขตชัด"]);
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
          label: "รูปร่าง: ผื่นแดง/ปื้นแดง",
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
          check: (c) =>
            c.pustule ? { ok: true, details: ["ตุ่มหนอง"] } : { ok: false }
        },
        {
          id: "skin_extra",
          label: "บวม/คัน/เจ็บ",
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
          id: "scale",
          label: "ปื้น/จ้ำเลือด/แห้ง/ลอก/ขุย",
          weight: 1,
          check: (c) => {
            const details = [];
            if (hasAny(c.shapes, ["จ้ำเลือด"])) details.push("จ้ำเลือด");
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
          label: "ระยะเวลา: 6–24 ชม. ถึง 3 สัปดาห์",
          weight: 1,
          check: (c) => onsetIsAny(c, ["h6to24", "w1", "w2", "w3"])
        },
        {
          id: "fever",
          label: "ไข้ > 37.5 °C",
          weight: 1,
          check: (c) =>
            Number.isFinite(c.fever) && c.fever > 37.5
        },
        {
          id: "lab",
          label: "Lab: WBC > 11,000 / Neutrophil > 75%",
          weight: 1,
          check: (c) => {
            const details = [];
            if (hasLabToken(c, "wbc_gt11000")) {
              let txt = "White Blood Cell (WBC) > 11,000 cells/cu.mm";
              if (Number.isFinite(c.wbc)) txt += ` (WBC ${c.wbc})`;
              details.push(txt);
            }
            if (hasLabToken(c, "neut_gt75")) {
              let txt = "Neutrophil > 75%";
              if (Number.isFinite(c.neutroPct)) txt += ` (${c.neutroPct}%)`;
              details.push(txt);
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
              "วงกลมคล้ายเป้าธนู",
              "เป้าธนูไม่ครบ 3 ชั้น"
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
              "ดำ",
              "ดำ/คล้ำ",
              "คล้ำ",
              "เทา",
              "แดง"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "typical",
          label: "ลักษณะสำคัญ (x3): ผิวหนังหลุดลอกไม่เกิน 10% BSA",
          weight: 3,
          check: (c) => {
            if (c.peelLt10 || c.peelCenter) {
              return { ok: true, details: ["ผิวหนังหลุดลอกไม่เกิน 10% BSA"] };
            }
            return { ok: false };
          }
        },
        {
          id: "skin_extra",
          label: "อาการผิวหนัง: น้ำเหลือง/พอง/ตุ่มน้ำเล็ก-กลาง-ใหญ่",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.bullaeSmall) details.push("ตุ่มน้ำขนาดเล็ก");
            if (c.bullaeMed) details.push("ตุ่มน้ำขนาดกลาง");
            if (c.bullaeLarge) details.push("ตุ่มน้ำขนาดใหญ่");
            if (c.pustule) details.push("ตุ่มหนอง/น้ำเหลือง");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "crust",
          label: "อาการที่พบน้อย: สะเก็ด",
          weight: 1,
          check: (c) =>
            c.scaleCrust ? { ok: true, details: ["สะเก็ด"] } : { ok: false }
        },
        {
          id: "location",
          label: "ตำแหน่งที่พบ: ลำตัว",
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
          label: "อาการระบบอื่นๆ: ไข้/ปวดกล้ามเนื้อ/คลื่นไส้อาเจียน/เลือดออกในทางเดินอาหาร",
          weight: 1,
          check: (c) => {
            const details = [];
            if (Number.isFinite(c.fever) && c.fever > 37.5) {
              details.push(`ไข้ Temp > 37.5 °C (${c.fever.toFixed(1)} °C)`);
            }
            if (c.myalgia) details.push("ปวดกล้ามเนื้อ");
            if (c.nauseaVomiting) details.push("คลื่นไส้อาเจียน");
            if (c.p3 && flag(c.p3.gibleeding)) details.push("เลือดออกในทางเดินอาหาร");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "organs",
          label: "อวัยวะที่ผิดปกติ: ริมฝีปาก/รอบดวงตา/ลำตัว/แขน/ขา/หน้า/มือ/เท้า",
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
          label: "จำนวนผื่นบริเวณเยื่อบุ > 1 (x2)",
          weight: 2,
          check: (c) =>
            c.mucosalCountGt1
              ? { ok: true, details: ["จำนวนผื่นบริเวณเยื่อบุ > 1 จุด"] }
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
          label: "รูปร่าง: ผื่นแดง/ปื้นแดง/วงกลมคล้ายเป้าธนู",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.shapes, [
              "ผื่นแดง",
              "ปื้นแดง",
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
          label: "ลักษณะสำคัญ (x3): ผิวหนังหลุดลอกเกิน 30% BSA",
          weight: 3,
          check: (c) =>
            c.peelGt30
              ? { ok: true, details: ["ผิวหนังหลุดลอกเกิน 30% BSA"] }
              : { ok: false }
        },
        {
          id: "skin_extra",
          label: "อาการเพิ่มเติมทางผิวหนัง: ตุ่มน้ำขนาดใหญ่/น้ำเหลือง/สะเก็ด",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.bullaeLarge) details.push("ตุ่มน้ำขนาดใหญ่");
            if (c.pustule) details.push("น้ำเหลือง/ตุ่มหนอง");
            if (c.scaleCrust) details.push("สะเก็ด");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "rare",
          label: "อาการที่พบน้อย: ซีด/โลหิตจาง/เลือดออกในทางเดินอาหาร/กลืนลำบาก",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.p1 && flag(c.p1.pale)) details.push("ซีด/โลหิตจาง");
            if (c.p3 && flag(c.p3.anemia)) details.push("โลหิตจาง");
            if (c.p3 && flag(c.p3.gibleeding)) details.push("เลือดออกในทางเดินอาหาร");
            if (c.dysphagia) details.push("กลืนลำบาก");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "location",
          label:
            "ตำแหน่งที่พบ: ลำตัว/แขน/ขา/หน้า/มือ/เท้า/ศีรษะ/ทั่วร่างกาย/ริมฝีปาก",
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
          label: "ระยะเวลาการเกิด: 1–3 สัปดาห์",
          weight: 1,
          check: (c) => onsetIsAny(c, ["w1", "w2", "w3"])
        },
        {
          id: "systemic",
          label:
            "อาการระบบอื่นๆ: ไข้/ปวดกล้ามเนื้อ/คลื่นไส้อาเจียน/เจ็บคอ/ปวดข้อ/ท้องเสีย/เยื่อบุตาอักเสบ",
          weight: 1,
          check: (c) => {
            const details = [];
            if (Number.isFinite(c.fever) && c.fever > 37.5) {
              details.push(`ไข้ Temp > 37.5 °C (${c.fever.toFixed(1)} °C)`);
            }
            if (c.myalgia) details.push("ปวดกล้ามเนื้อ");
            if (c.nauseaVomiting) details.push("คลื่นไส้อาเจียน");
            if (c.soreThroat) details.push("เจ็บคอ");
            if (c.arthralgia) details.push("ปวดข้อ");
            if (c.diarrhea) details.push("ท้องเสีย");
            if (c.conjunctivitis) details.push("เยื่อบุตาอักเสบ");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "organ",
          label: "อวัยวะที่ผิดปกติ: ไตวาย/ตับอักเสบ/ปอดอักเสบ",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.organRenalFailure) details.push("ไตวาย");
            if (c.organLiver) details.push("ตับอักเสบ");
            if (c.organLung) details.push("ปอดอักเสบ");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "lab",
          label:
            "ผลตรวจ Lab: Cr เพิ่มขึ้น / protein+ / SpO₂ <94% / ALT/AST ≥ 2X ULN หรือ ≥ 40 U/L",
          weight: 1,
          check: (c) => {
            const details = [];
            if (hasLabToken(c, "cr_aki")) {
              let txt =
                "Serum creatinine (Cr) เพิ่มขึ้น ≥0.3 mg/dL ภายใน 48 ชม. หรือ ≥1.5X จาก baseline ภายใน 7 วัน";
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
            if (hasLabToken(c, "alt_ast_ge2x")) {
              let txt = "ALT/AST ≥ 2X ULN หรือ ≥ 40 U/L";
              const parts = [];
              if (Number.isFinite(c.ast)) parts.push(`AST ${c.ast}`);
              if (Number.isFinite(c.alt)) parts.push(`ALT ${c.alt}`);
              if (parts.length) txt += ` (${parts.join(", ")})`;
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
          id: "blood_major",
          label: "ลักษณะสำคัญ (x3): Eosinophil ≥ 10% / Atypical lymphocyte",
          weight: 3,
          check: (c) => {
            const details = [];
            if (hasLabToken(c, "eos_ge10")) {
              let txt = "Eosinophil ≥ 10%";
              if (Number.isFinite(c.eosPct)) txt += ` (${c.eosPct}%)`;
              details.push(txt);
            }
            if (hasLabToken(c, "atypical_lymph")) {
              details.push("Atypical lymphocyte");
            }
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "skin_extra",
          label: "อาการเพิ่มเติมทางผิวหนัง: ตุ่มน้ำเล็ก-กลาง-ใหญ่/จ้ำเลือด",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.bullaeSmall) details.push("ตุ่มน้ำขนาดเล็ก");
            if (c.bullaeMed) details.push("ตุ่มน้ำขนาดกลาง");
            if (c.bullaeLarge) details.push("ตุ่มน้ำขนาดใหญ่");
            if (c.pustule) details.push("ตุ่มหนอง/จ้ำเลือด");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "location",
          label: "ตำแหน่งที่พบ: หน้า/ลำตัว/แขน/ขา",
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
          label: "อาการระบบอื่นๆ: ไข้ / Lung function (Abnormal Sound/CXR)",
          weight: 1,
          check: (c) => {
            const details = [];
            if (Number.isFinite(c.fever) && c.fever > 37.5) {
              details.push(`ไข้ Temp > 37.5 °C (${c.fever.toFixed(1)} °C)`);
            }
            const lungTokens = [
              "lung_abnormal",
              "cxr_abnormal",
              "lung_fn_abnormal",
              "lung_sound_abnormal"
            ];
            if (hasLabToken(c, lungTokens)) {
              details.push("Lung function (Abnormal Sound/CXR)");
            }
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "onset",
          label: "ระยะเวลาการเกิด: 1–6 สัปดาห์",
          weight: 1,
          check: (c) =>
            onsetIsAny(c, ["w1", "w2", "w3", "w4", "w5", "w6"])
        },
        {
          id: "lab",
          label:
            "ผลตรวจ Lab: ALT/AST ≥ 2X ULN หรือ ≥ 40 U/L / Cr เพิ่มขึ้น / protein+ / SpO₂ <94% / EKG ผิดปกติ / Troponin I/T > ULN",
          weight: 1,
          check: (c) => {
            const details = [];
            if (hasLabToken(c, "alt_ast_ge2x")) {
              let txt = "ALT/AST ≥ 2X ULN หรือ ≥ 40 U/L";
              const parts = [];
              if (Number.isFinite(c.ast)) parts.push(`AST ${c.ast}`);
              if (Number.isFinite(c.alt)) parts.push(`ALT ${c.alt}`);
              if (parts.length) txt += ` (${parts.join(", ")})`;
              details.push(txt);
            }
            if (hasLabToken(c, "cr_aki")) {
              let txt =
                "Serum creatinine (Cr) เพิ่มขึ้น ≥0.3 mg/dL ภายใน 48 ชม. หรือ ≥1.5X จาก baseline ภายใน 7 วัน";
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
            if (hasLabToken(c, "ekg_abnormal") || c.ekgAbnormal) {
              details.push("EKG ผิดปกติ");
            }
            if (hasLabToken(c, ["tropi_gt004", "tropt_gt001_003"])) {
              let txt = "Troponin I/T > ULN";
              if (Number.isFinite(c.troponin)) txt += ` (${c.troponin})`;
              details.push(txt);
            }
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
            if (c.organLymph) details.push("ต่อมน้ำเหลืองโต");
            if (c.organLiver) details.push("ตับอักเสบ");
            if (c.organKidney) details.push("ไตอักเสบ");
            if (c.organRenalFailure) details.push("ไตวาย");
            if (c.organLung) details.push("ปอดอักเสบ");
            if (c.organMyocarditis) details.push("กล้ามเนื้อหัวใจอักเสบ");
            if (c.organThyroiditis) details.push("ต่อมไทรอยด์อักเสบ");
            return details.length ? { ok: true, details } : { ok: false };
          }
        }
      ]
    },

    // 10) EM
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
              "วงกลม 3 ชั้น",
              "เป้าธนู 3 ชั้น"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "skin_extra",
          label: "อาการเพิ่มเติมทางผิวหนัง: พอง/ตุ่มน้ำเล็ก-กลาง",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.bullaeSmall) details.push("ตุ่มน้ำขนาดเล็ก");
            if (c.bullaeMed) details.push("ตุ่มน้ำขนาดกลาง");
            if (hasAny(c.shapes, ["พอง"])) details.push("พอง");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "crust",
          label: "อาการที่พบน้อย: สะเก็ด",
          weight: 1,
          check: (c) =>
            c.scaleCrust ? { ok: true, details: ["สะเก็ด"] } : { ok: false }
        },
        {
          id: "onset",
          label: "ระยะเวลาการเกิด: 1–6 ชม./6–24 ชม./1 สัปดาห์",
          weight: 1,
          check: (c) =>
            onsetIsAny(c, ["h1to6", "h6to24", "w1"])
        },
        {
          id: "mucosal",
          label: "ตำแหน่งที่พบ 1: ช่องปาก/จมูก/ทวาร/อวัยวะเพศ",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.locs, [
              "ช่องปาก",
              "จมูก",
              "ทวาร",
              "อวัยวะเพศ"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "systemic",
          label: "อาการระบบอื่นๆ: ไข้/อ่อนเพลีย/ปวดกล้ามเนื้อ/เจ็บคอ/ปวดข้อ",
          weight: 1,
          check: (c) => {
            const details = [];
            if (Number.isFinite(c.fever) && c.fever > 37.5) {
              details.push(`ไข้ Temp > 37.5 °C (${c.fever.toFixed(1)} °C)`);
            }
            if (c.fatigue) details.push("อ่อนเพลีย");
            if (c.myalgia) details.push("ปวดกล้ามเนื้อ");
            if (c.soreThroat) details.push("เจ็บคอ");
            if (c.arthralgia) details.push("ปวดข้อ");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "location2",
          label: "ตำแหน่งที่พบ 2: มือ/เท้า/แขน/ขา/หน้า/ลำตัว/หลัง/ลำคอ",
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

    // 11) Photosensitivity
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
              "จุดแดงเล็ก",
              "จุดเล็กแดง"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "color",
          label: "สี: ดำ/คล้ำ/แดง",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.colors, ["ดำ", "ดำ/คล้ำ", "คล้ำ", "แดง"]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "burn_major",
          label: "ลักษณะสำคัญ (x2): แดงไหม้",
          weight: 2,
          check: (c) => {
            const details = [];
            if (hasAny(c.colors, ["แดงไหม้"])) details.push("แดงไหม้");
            if (c.burn) details.push("แสบ/ไหม้แดด");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "skin_extra",
          label: "อาการเพิ่มเติมทางผิวหนัง: น้ำเหลือง/สะเก็ด",
          weight: 1,
          check: (c) =>
            c.scaleCrust
              ? { ok: true, details: ["สะเก็ด/น้ำเหลืองแห้ง"] }
              : { ok: false }
        },
        {
          id: "may",
          label: "อาการที่อาจพบ: ตุ่มน้ำเล็ก-กลาง-ใหญ่/ลอก/ขุย/คัน",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.bullaeSmall) details.push("ตุ่มน้ำขนาดเล็ก");
            if (c.bullaeMed) details.push("ตุ่มน้ำขนาดกลาง");
            if (c.bullaeLarge) details.push("ตุ่มน้ำขนาดใหญ่");
            if (c.scalePeel) details.push("ลอก");
            if (c.scaleDry) details.push("ขุย/แห้ง");
            if (c.itch) details.push("คัน");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "location",
          label: "ตำแหน่งที่พบ: หน้า/หน้าอก/มือ/แขน/ขา",
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
          label: "ระยะเวลาการเกิด: ภายใน 1 ชม./1–6 ชม./6–24 ชม./1 สัปดาห์",
          weight: 1,
          check: (c) =>
            onsetIsAny(c, ["within1h", "h1to6", "h6to24", "w1"])
        },
        {
          id: "burn_pain_major",
          label: "อาการเด่น (x2): แสบ",
          weight: 2,
          check: (c) =>
            c.burn ? { ok: true, details: ["แสบ"] } : { ok: false }
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
          label: "รูปร่าง: ตึง",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.shapes, ["ตึง"]);
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
          check: (c) =>
            c.itch ? { ok: true, details: ["คัน"] } : { ok: false }
        },
        {
          id: "location",
          label: "ตำแหน่งที่พบ: ทั่วร่างกาย/มือ/เท้า/ศีรษะ",
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
            "ระยะเวลาการเกิด: 3 สัปดาห์ / 1–6 ชม. / 6–24 ชม. / 1–2 สัปดาห์ / 4 สัปดาห์ / อื่นๆ <4สัปดาห์",
          weight: 1,
          check: (c) =>
            onsetIsAny(c, ["w3", "h1to6", "h6to24", "w1", "w2", "w4", "other"])
        },
        {
          id: "systemic",
          label: "อาการระบบอื่นๆ: ไข้/หนาวสั่น/อ่อนเพลีย/ดีซ่าน",
          weight: 1,
          check: (c) => {
            const details = [];
            if (Number.isFinite(c.fever) && c.fever > 37.5) {
              details.push(`ไข้ Temp > 37.5 °C (${c.fever.toFixed(1)} °C)`);
            }
            if (c.p2 && c.p2.other && flag(c.p2.other.chills)) {
              details.push("หนาวสั่น");
            }
            if (c.fatigue) details.push("อ่อนเพลีย");
            if (c.p1 && flag(c.p1.jaundice)) {
              details.push("ดีซ่าน (ตัวเหลือง/ตาเหลือง)");
            }
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "organ",
          label: "อวัยวะที่ผิดปกติ: ต่อมน้ำเหลืองโต/ตับโต/ม้ามโต/ขาบวม",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.organLymph) details.push("ต่อมน้ำเหลืองโต");
            if (c.organHepatomegaly) details.push("ตับโต");
            if (c.organSplenomegaly) details.push("ม้ามโต");
            if (c.swell && hasAny(c.locs, ["ขา"])) details.push("ขาบวม");
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
          id: "itch_major",
          label: "ลักษณะสำคัญ (x2): คัน",
          weight: 2,
          check: (c) =>
            c.itch ? { ok: true, details: ["คัน"] } : { ok: false }
        },
        {
          id: "thick",
          label: "อาการเพิ่มเติมทางผิวหนัง: นูนหนา/ผื่นแดง",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.shapes, ["นูนหนา", "ผื่นแดง", "ปื้นแดง"]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "exudate",
          label: "อาการที่พบอื่นๆ: จุดเล็กแดง/น้ำเหลือง/สะเก็ด",
          weight: 1,
          check: (c) => {
            const details = [];
            if (hasAny(c.shapes, ["จุดเล็กแดง"])) details.push("จุดเล็กแดง");
            if (c.scaleCrust) details.push("น้ำเหลือง/สะเก็ด");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "location",
          label: "ตำแหน่งที่พบ: ลำตัว/แขน/ขา/หน้า/ลำคอ",
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
          label: "ระยะเวลาการเกิด: 1–6 ชม./6–24 ชม./1–3 สัปดาห์",
          weight: 1,
          check: (c) =>
            onsetIsAny(c, ["h1to6", "h6to24", "w1", "w2", "w3"])
        },
        {
          id: "dry_scale",
          label: "อาการที่อาจพบ (x2): ขุย/แห้ง/ลอก",
          weight: 2,
          check: (c) => {
            const details = [];
            if (c.scaleDry) details.push("แห้ง");
            if (c.scalePeel) details.push("ลอก");
            if (c.scaleCrust) details.push("ขุย");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "distribution",
          label: "การกระจายตัว: สมมาตร",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.locs, ["สมมาตร"]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "vesicles",
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

    // 14) Bullous drug eruption
    {
      id: "bullous",
      label: "Bullous drug eruption",
      majors: [
        {
          id: "vesicle",
          label: "รูปร่าง: ตุ่มน้ำขนาดเล็ก/พอง/ตึง",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.bullaeSmall) details.push("ตุ่มน้ำขนาดเล็ก");
            if (hasAny(c.shapes, ["พอง"])) details.push("พอง");
            if (hasAny(c.shapes, ["ตึง"])) details.push("ตึง");
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
          id: "vesicle_major",
          label: "ลักษณะสำคัญ (x2): ตุ่มน้ำขนาดกลาง/ใหญ่",
          weight: 2,
          check: (c) => {
            const details = [];
            if (c.bullaeMed) details.push("ตุ่มน้ำขนาดกลาง");
            if (c.bullaeLarge) details.push("ตุ่มน้ำขนาดใหญ่");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "pain_burn",
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
          id: "inside_clear",
          label: "สีด้านใน (x3): ใส",
          weight: 3,
          check: (c) => {
            const details = detailFromList(c.colors, ["ใส"]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "location",
          label: "ตำแหน่งที่พบ: ลำตัว/แขน/ขา/เท้า",
          weight: 1,
          check: (c) => {
            const details = detailFromList(c.locs, ["ลำตัว", "แขน", "ขา", "เท้า"]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "onset",
          label: "ระยะเวลาการเกิด: 1–6 ชม./6–24 ชม./1–3 สัปดาห์",
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
          id: "skin",
          label: "อาการผิวหนัง: ตุ่มนูน/แดง/บวม/คัน",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.itch) details.push("คัน");
            if (c.swell) details.push("บวม");
            details.push(...detailFromList(c.colors, ["แดง"]));
            details.push(...detailFromList(c.shapes, ["ตุ่มนูน"]));
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "fever_major",
          label: "อาการ (พบมาก) (x2): ไข้ > 37.5 °C",
          weight: 2,
          check: (c) =>
            Number.isFinite(c.fever) && c.fever > 37.5
        },
        {
          id: "organ",
          label: "อวัยวะที่ผิดปกติ: ต่อมน้ำเหลืองโต/ไตอักเสบ",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.organLymph) details.push("ต่อมน้ำเหลืองโต");
            if (c.organKidney) details.push("ไตอักเสบ");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "lab1",
          label: "ผลตรวจ Lab: protein+ / C3 และ/หรือ C4 < LLN",
          weight: 1,
          check: (c) => {
            const details = [];
            if (hasLabToken(c, "protein_pos")) {
              let txt = "protein+ ในปัสสาวะ";
              if (c.protU) txt += ` (${c.protU})`;
              details.push(txt);
            }
            if (hasLabToken(c, "c3c4_low")) {
              let txt = "C3 และ/หรือ C4 < LLN";
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
          id: "onset",
          label: "ระยะเวลาการเกิด: 1–6 ชม./6–24 ชม./1–3 สัปดาห์",
          weight: 1,
          check: (c) =>
            onsetIsAny(c, ["h1to6", "h6to24", "w1", "w2", "w3"])
        },
        {
          id: "lab2",
          label: "ผลตรวจ Lab2: RBC 5–10/HPF ในปัสสาวะ",
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
          label: "ตำแหน่งที่เกิด: รอบดวงตา/มือ/เท้า/ลำตัว/แขน/ขา",
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
          id: "skin",
          label: "อาการผิวหนัง: ตุ่มนูน/ผื่นแดง/แดง",
          weight: 1,
          check: (c) => {
            const details = [];
            details.push(...detailFromList(c.shapes, ["ตุ่มนูน", "ผื่นแดง"]));
            details.push(...detailFromList(c.colors, ["แดง"]));
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
            if (Number.isFinite(c.fever) && c.fever > 37.5) {
              details.push(`ไข้ Temp > 37.5 °C (${c.fever.toFixed(1)} °C)`);
            }
            if (c.arthralgia) details.push("ปวดข้อ");
            if (c.arthritis) details.push("ข้ออักเสบ");
            if (c.myalgia) details.push("ปวดกล้ามเนื้อ");
            if (c.organLymph) details.push("ต่อมน้ำเหลืองโต");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "organ",
          label: "อวัยวะที่ผิดปกติ: ไตอักเสบ/ไตวาย/ต่อมน้ำเหลืองโต",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.organKidney) details.push("ไตอักเสบ");
            if (c.organRenalFailure) details.push("ไตวาย");
            if (c.organLymph) details.push("ต่อมน้ำเหลืองโต");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "bleed",
          label: "อาการ: ไอเป็นเลือด/ถุงลมเลือดออก/เลือดออกในทางเดินอาหาร",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.p2 && c.p2.resp && flag(c.p2.resp.hemoptysis)) {
              details.push("ไอเป็นเลือด");
            }
            if (c.p3 && flag(c.p3.alveolarHemorrhage)) {
              details.push("ถุงลมเลือดออก");
            }
            if (c.p3 && flag(c.p3.gibleeding)) {
              details.push("เลือดออกในทางเดินอาหาร");
            }
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "onset",
          label: "ระยะเวลาการเกิด: 1–6 ชม./6–24 ชม./1–3 สัปดาห์",
          weight: 1,
          check: (c) =>
            onsetIsAny(c, ["h1to6", "h6to24", "w1", "w2", "w3"])
        },
        {
          id: "lab2",
          label: "ผลตรวจ Lab2: protein+ / C3 และ/หรือ C4 < LLN",
          weight: 1,
          check: (c) => {
            const details = [];
            if (hasLabToken(c, "protein_pos")) {
              let txt = "protein+ ในปัสสาวะ";
              if (c.protU) txt += ` (${c.protU})`;
              details.push(txt);
            }
            if (hasLabToken(c, "c3c4_low")) {
              let txt = "C3 และ/หรือ C4 < LLN";
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
          id: "lab3",
          label:
            "ผลตรวจ Lab3: Serum creatinine (Cr) เพิ่มขึ้น ≥0.3 mg/dL ภายใน 48 ชม. หรือ ≥1.5X จาก baseline ภายใน 7 วัน",
          weight: 1,
          check: (c) => {
            if (hasLabToken(c, "cr_aki")) {
              let txt =
                "Serum creatinine (Cr) เพิ่มขึ้น ≥0.3 mg/dL ภายใน 48 ชม. หรือ ≥1.5X จาก baseline ภายใน 7 วัน";
              if (Number.isFinite(c.cr)) txt += ` (Cr ${c.cr})`;
              return { ok: true, details: [txt] };
            }
            return { ok: false };
          }
        },
        {
          id: "highlight",
          label: "อาการเด่น (x2): จ้ำเลือด/ขา",
          weight: 2,
          check: (c) => {
            const details = [];
            if (hasAny(c.shapes, ["จ้ำเลือด"])) details.push("จ้ำเลือด");
            if (hasAny(c.locs, ["ขา"])) details.push("ขา");
            return details.length ? { ok: true, details } : { ok: false };
          }
        }
      ]
    },

    // 17) Hemolytic anemia
    {
      id: "hemolytic_anemia",
      label: "Hemolytic anemia",
      majors: [
        {
          id: "sym_major",
          label: "อาการ (x2): ซีด/ดีซ่าน",
          weight: 2,
          check: (c) => {
            const details = [];
            if (c.p1 && flag(c.p1.pale)) details.push("ซีด");
            if (c.p1 && flag(c.p1.jaundice)) {
              details.push("ดีซ่าน (ตัวเหลือง/ตาเหลือง)");
            }
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "urine_major",
          label: "อาการระบบอื่นๆ (x3): ปัสสาวะสีชา/สีดำ",
          weight: 3,
          check: (c) =>
            c.urine && flag(c.urine.darkUrine)
              ? { ok: true, details: ["ปัสสาวะสีชา/สีดำ"] }
              : { ok: false }
        },
        {
          id: "organ",
          label: "อวัยวะที่ผิดปกติ: ไตวาย",
          weight: 1,
          check: (c) =>
            c.organRenalFailure
              ? { ok: true, details: ["ไตวาย"] }
              : { ok: false }
        },
        {
          id: "lab1",
          label: "ผลตรวจ Lab: IgG+ / C3+",
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
          id: "onset",
          label: "ระยะเวลาการเกิด: 1–6 ชม./6–24 ชม./1 สัปดาห์",
          weight: 1,
          check: (c) =>
            onsetIsAny(c, ["h1to6", "h6to24", "w1"])
        },
        {
          id: "lab2",
          label:
            "ผลตรวจ Lab2 (x3): Hb ลดลง ≥ 2–3 g/dL ภายใน 24–48 ชม.",
          weight: 3,
          check: (c) =>
            hasLabToken(c, "hb_drop_ge2_3")
              ? { ok: true, details: ["Hb ลดลง ≥ 2–3 g/dL ภายใน 24–48 ชม."] }
              : { ok: false }
        },
        {
          id: "lab3",
          label: "ผลตรวจ Lab3: LDH สูง (2–10X ULN)",
          weight: 1,
          check: (c) =>
            hasLabToken(c, "ldh_high")
              ? { ok: true, details: ["LDH สูง (2–10X ULN)"] }
              : { ok: false }
        },
        {
          id: "bp",
          label: "BP: BP ต่ำ (<90/60) หรือ BP ลดลง ≥30% ของ baseline systolic เดิม",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.hypotension) {
              details.push("BP ต่ำ (<90/60)");
            }
            if (c.bpDrop40) {
              details.push("BP ลดลง ≥40 mmHg ของ baseline systolic เดิม");
            }
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "others",
          label: "อาการอื่น: ปวดหลังส่วนเอว/ปวดแน่นชายโครงขวา",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.p3 && flag(c.p3.flankPain)) details.push("ปวดหลังส่วนเอว");
            if (c.p3 && flag(c.p3.ruqPain)) details.push("ปวดแน่นชายโครงขวา");
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
          id: "sym",
          label: "อาการ: ซีด/อ่อนเพลีย",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.p1 && flag(c.p1.pale)) details.push("ซีด");
            if (c.fatigue) details.push("อ่อนเพลีย");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "systemic",
          label: "อาการระบบอื่นๆ: ปัสสาวะสีชา/สีดำ/หนาวสั่น/เจ็บคอ/แผลในปาก",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.urine && flag(c.urine.darkUrine)) {
              details.push("ปัสสาวะสีชา/สีดำ");
            }
            if (c.p2 && c.p2.other && flag(c.p2.other.chills)) {
              details.push("หนาวสั่น");
            }
            if (c.soreThroat) details.push("เจ็บคอ");
            if (c.p2 && c.p2.other && flag(c.p2.other.mouthUlcer)) {
              details.push("แผลในปาก");
            }
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "bleed_major",
          label:
            "อาการที่ผิดปกติ (x3): จุดเลือดออก/ฟกช้ำ/เลือดกำเดา/เหงือกเลือดออก",
          weight: 3,
          check: (c) =>
            c.p3 && flag(c.p3.bleedingSigns)
              ? { ok: true, details: ["จุดเลือดออก/ฟกช้ำ/เลือดออกง่าย"] }
              : { ok: false }
        },
        {
          id: "hr_high",
          label: "ผลตรวจร่างกาย: HR สูง (>100)",
          weight: 1,
          check: (c) => {
            const hr = nField(c.p2 && c.p2.cv && c.p2.cv.hrValue);
            if (Number.isFinite(hr) && hr > 100) {
              return {
                ok: true,
                details: [`HR สูง (>100 bpm, ปัจจุบัน ${hr})`]
              };
            }
            return { ok: false };
          }
        },
        {
          id: "onset",
          label: "ระยะเวลาการเกิด: 1–6 ชม./6–24 ชม./1–2 สัปดาห์",
          weight: 1,
          check: (c) =>
            onsetIsAny(c, ["h1to6", "h6to24", "w1", "w2"])
        },
        {
          id: "lab_fever",
          label: "ผลตรวจ Lab2: ไข้ Temp > 37.5 °C",
          weight: 1,
          check: (c) =>
            Number.isFinite(c.fever) && c.fever > 37.5
        },
        {
          id: "lab_hb",
          label: "ผลตรวจ Lab3 (x2): Hemoglobin (Hb) < 10 g/dL",
          weight: 2,
          check: (c) => {
            if (hasLabToken(c, "hb_lt10")) {
              let txt = "Hemoglobin (Hb) < 10 g/dL";
              if (Number.isFinite(c.hb)) txt += ` (Hb ${c.hb})`;
              return { ok: true, details: [txt] };
            }
            return { ok: false };
          }
        },
        {
          id: "lab_hct",
          label: "ผลตรวจ Lab4 (x2): Hematocrit (Hct) < 30%",
          weight: 2,
          check: (c) => {
            if (hasLabToken(c, "hct_lt30")) {
              let txt = "Hematocrit (Hct) < 30%";
              if (Number.isFinite(c.hct)) txt += ` (Hct ${c.hct}%)`;
              return { ok: true, details: [txt] };
            }
            return { ok: false };
          }
        },
        {
          id: "lab_wbc",
          label:
            "ผลตรวจ Lab5 (x2): White Blood Cell (WBC) < 4000 cells/cu.mm",
          weight: 2,
          check: (c) => {
            if (hasLabToken(c, "wbc_lt4000")) {
              let txt = "White Blood Cell (WBC) < 4000 cells/cu.mm";
              if (Number.isFinite(c.wbc)) txt += ` (WBC ${c.wbc})`;
              return { ok: true, details: [txt] };
            }
            return { ok: false };
          }
        },
        {
          id: "lab_plt",
          label:
            "ผลตรวจ Lab6 (x2): Platelet (Plt) < 100,000 cells/cu.mm",
          weight: 2,
          check: (c) => {
            if (hasLabToken(c, "plt_lt100k")) {
              let txt = "Platelet (Plt) < 100,000 cells/cu.mm";
              if (Number.isFinite(c.plt)) txt += ` (Plt ${c.plt})`;
              return { ok: true, details: [txt] };
            }
            return { ok: false };
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
          label: "อาการ: หนาวสั่น/เจ็บคอ/แผลในปาก",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.p2 && c.p2.other && flag(c.p2.other.chills)) details.push("หนาวสั่น");
            if (c.soreThroat) details.push("เจ็บคอ");
            if (c.p2 && c.p2.other && flag(c.p2.other.mouthUlcer)) {
              details.push("แผลในปาก");
            }
            return details.length ? { ok: true, details } : { ok: false };
          }
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
          label:
            "อวัยวะที่ผิดปกติ: ปอดอักเสบ / Lung function (Abnormal Sound/CXR)",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.organLung) {
              details.push("ปอดอักเสบ");
            }
            const lungTokens = [
              "lung_abnormal",
              "cxr_abnormal",
              "lung_fn_abnormal",
              "lung_sound_abnormal"
            ];
            if (hasLabToken(c, lungTokens)) {
              details.push("Lung function (Abnormal Sound/CXR)");
            }
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "anc_major",
          label: "Absolute neutrophil count (ANC) < 1500 cells/cu.mm (x4)",
          weight: 4,
          check: (c) => {
            if (hasLabToken(c, "anc_lt1500")) {
              let txt = "ANC < 1500 cells/cu.mm";
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
          label: "อาการ (x2): จุดเลือดออก/ปื้น-จ้ำเลือด",
          weight: 2,
          check: (c) => {
            const details = detailFromList(c.shapes, [
              "จุดเลือดออก",
              "ปื้น/จ้ำเลือด",
              "จ้ำเลือด"
            ]);
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "bleed_sys",
          label:
            "อาการระบบอื่นๆ: เหงือกเลือดออก/เลือดออกในทางเดินอาหาร/ปัสสาวะเลือดออก",
          weight: 1,
          check: (c) =>
            c.p3 && flag(c.p3.bleedingGI)
              ? { ok: true, details: ["เลือดออกในทางเดินอาหาร/อวัยวะอื่น"] }
              : { ok: false }
        },
        {
          id: "plt_major",
          label: "ผลตรวจ Lab: Platelet (Plt) < 150,000 cells/cu.mm",
          weight: 1,
          check: (c) => {
            if (hasLabToken(c, "plt_lt150k")) {
              let txt = "Platelet (Plt) < 150,000 cells/cu.mm";
              if (Number.isFinite(c.plt)) txt += ` (Plt ${c.plt})`;
              return { ok: true, details: [txt] };
            }
            return { ok: false };
          }
        },
        {
          id: "onset",
          label: "ระยะเวลาการเกิด: 1–6 ชม./6–24 ชม./1 สัปดาห์",
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
          id: "sym",
          label: "อาการ: ไข้/ปวดข้อ/อ่อนเพลีย",
          weight: 1,
          check: (c) => {
            const details = [];
            if (Number.isFinite(c.fever) && c.fever > 37.5) {
              details.push(`ไข้ Temp > 37.5 °C (${c.fever.toFixed(1)} °C)`);
            }
            if (c.arthralgia) details.push("ปวดข้อ");
            if (c.fatigue) details.push("อ่อนเพลีย");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "urine_sym",
          label: "อาการระบบอื่นๆ: ปัสสาวะออกน้อย/ปัสสาวะขุ่น",
          weight: 1,
          check: (c) => {
            const details = [];
            if (c.oliguria) details.push("ปัสสาวะออกน้อย");
            if (c.urine && flag(c.urine.turbid)) details.push("ปัสสาวะขุ่น");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "edema",
          label: "อวัยวะที่ผิดปกติ: ขาบวม/บวม",
          weight: 1,
          check: (c) => {
            const details = [];
            if (hasAny(c.locs, ["ขา"])) details.push("ขาบวม");
            if (c.swell) details.push("บวม");
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "renal_major",
          label:
            "ผลตรวจ Lab (x3): Cr เพิ่มขึ้น หรือ eGFR < 60 mL/min/1.73m²",
          weight: 3,
          check: (c) => {
            const details = [];
            if (hasLabToken(c, "cr_aki")) {
              let txt =
                "Serum creatinine (Cr) เพิ่มขึ้น ≥0.3 mg/dL ภายใน 48 ชม. หรือ ≥1.5X จาก baseline ภายใน 7 วัน";
              if (Number.isFinite(c.cr)) txt += ` (Cr ${c.cr})`;
              details.push(txt);
            }
            if (hasLabToken(c, "egfr_lt60")) {
              let txt = "eGFR < 60 mL/min/1.73m²";
              if (Number.isFinite(c.egfr)) txt += ` (eGFR ${c.egfr})`;
              details.push(txt);
            }
            return details.length ? { ok: true, details } : { ok: false };
          }
        },
        {
          id: "onset",
          label: "ระยะเวลาการเกิด: 1–6 ชม./6–24 ชม./1–2 สัปดาห์",
          weight: 1,
          check: (c) =>
            onsetIsAny(c, ["h1to6", "h6to24", "w1", "w2"])
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

          const texts = [];
          const seen = new Set();

          if (details && details.length) {
            if (w > 1) {
              details.forEach((d) => {
                const base = String(d || "").trim();
                if (!base) return;
                const txt = `${base} (x${w})`;
                if (!seen.has(txt)) {
                  seen.add(txt);
                  texts.push(txt);
                }
              });
            } else {
              details.forEach((d) => {
                const base = String(d || "").trim();
                if (!base) return;
                if (!seen.has(base)) {
                  seen.add(base);
                  texts.push(base);
                }
              });
            }
          } else if (m.label) {
            let labelText = m.label;
            if (w > 1 && !/\(x\d+\)/.test(labelText)) {
              labelText += ` (x${w})`;
            }
            texts.push(labelText);
          }

          matchedDetails.push(...texts);
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
                : `<p class="p6-muted" style="margin:.15rem 0 0;">ยังไม่มีข้อใหญ่ที่เข้าเกณฑ์จากข้อมูลที่ติ้ก</p>`;
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
      .p6-muted{font-size:12px;color:#6b7280;}
    `;
    const el = document.createElement("style");
    el.id = "p6-brain-style";
    el.textContent = css;
    document.head.appendChild(el);
  }

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
    version: "2025-11-20-21ADR-LABTOKENS-FDE-MUANGx3-NOTBLACK",
    defs: ADR_DEFS
  };
})();
```

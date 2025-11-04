/* brain.js — สมองประเมิน Type of ADR (ไฟล์เดียว) */
/* ทำงานร่วมกับ window.drugAllergyData ของแอปเดิม โดยไม่แก้ไฟล์หน้าอื่น */

(function () {
  const g = (window.drugAllergyData = window.drugAllergyData || {});
  g.page6 = g.page6 || {};
  g.page6.ai = g.page6.ai || { lastEvaluatedAt: 0, best: null, ranking: [], reasons: {} };

  // -------------------------------
  // 0) ตัวช่วยอ่านข้อมูลจากหน้า 1–3 แบบยืดหยุ่น
  // -------------------------------
  function arr(x) { return Array.isArray(x) ? x : []; }
  function hasInArr(a, label) { return arr(a).some(v => String(v).trim() === String(label).trim()); }
  function hasAny(a, labels) { return labels.some(l => hasInArr(a, l)); }
  function num(x) {
    if (x == null) return NaN;
    const n = parseFloat(String(x).replace(/[^\d.\-]/g, ""));
    return isNaN(n) ? NaN : n;
  }
  function str(x) { return (x == null) ? "" : String(x); }

  // ====== อ่าน facts จาก page1/page2/page3 (คาดเค้าโครงตามสเปกเดิม) ======
  function collectFacts() {
    const p1 = g.page1 || {};
    const s  = p1.skin || {};
    const p2 = g.page2 || {};
    const p3 = g.page3 || {};

    // ผิวหนัง
    const rashShape = arr(s.rashShape);   // ex. "ตุ่มนูน","ปื้นนูน","วงกลม","วงกลม 3 ชั้น", ...
    const rashColor = arr(s.rashColor);   // ex. "แดง","แดงซีด","ซีด","ม่วง","ดำ/คล้ำ","ใส","แดงไหม้"...
    const blister   = arr(s.blister);     // ex. "ขนาดเล็ก","ขนาดกลาง","ขนาดใหญ่"
    const peeling   = str(s.peeling || ""); // ex. "ไม่เกิน 10% BSA", ">30% BSA", "ตรงกลางผื่น"
    const itch      = str(s.itch || "");    // "คัน" / "ไม่คัน" (+ระดับ)
    const pain      = str(s.pain || "");    // "ปวด/แสบ/เจ็บ"
    const swelling  = str(s.swelling || "");// "บวม" / "ไม่บวม"
    const dryScaly  = arr(s.scales || s.dry || []); // ถ้ามีฟิลด์ขุย/แห้ง/ลอกเป็น array
    const exudCrust = arr(s.exudateCrust || []);    // ถ้ามี "น้ำเหลือง","สะเก็ด"
    const positions = arr(s.positions || s.locations || []); // "ทั่วร่างกาย","มือ","เท้า",...

    // เวลาเริ่มอาการ หน้า 1 ส่วนที่ 3 (string ไทย)
    const onset = str(p1.onset || s.onset || ""); // ex. "ภายใน 1 ชั่วโมง","1–6 ชั่วโมง","6–24 ชั่วโมง","1 สัปดาห์",...

    // หน้า 2 ระบบอื่นๆ (ตีความจาก checkbox/รายละเอียด)
    const resp = p2.resp || {}; // { dyspnea, wheeze, stridor, ...}
    const circ = p2.circ || {}; // { dizziness, hrHighValue, bpSys, bpDia, ...}
    const gi   = p2.gi   || {}; // { diarrhea, abdPain, dysphagia, nauseaVomiting, ...}

    // พยายามอ่านตัวเลข vital จากหน้า 2 ถ้าผู้ใช้พิมพ์ไว้
    const RR = num(circ.rr) || NaN;
    const HR = num(circ.hr) || NaN;
    const bpSys = num(circ.bpSys) || NaN;
    const bpDia = num(circ.bpDia) || NaN;

    // หน้า 3 Labs — โครงจากไฟล์ page3.js ที่คุณให้
    // โครงสร้าง: page3 = { cbc:{wbc:{value,checked}, ...}, rft:{cre:{value}}, ... }
    function lab(group, key) {
      const gobj = p3[group] || {};
      const it = gobj[key] || {};
      return { checked: !!it.checked, value: str(it.value || ""), detail: str(it.detail || "") };
    }
    // ตัวเลข labs ที่ใช้ cutpoint
    const WBC = num(lab("cbc","wbc").value);
    const NEUTp = num(lab("cbc","neut").value);
    const EOSp = num(lab("cbc","eos").value);
    const AEC = num(lab("cbc","aec").value);
    const Hb = num(lab("cbc","hb").value);
    const Plt = num(lab("cbc","plt").value);
    const AST = num(lab("lft","ast").value);
    const ALT = num(lab("lft","alt").value);
    const ALP = num(lab("lft","alp").value);
    const TBil = num(lab("lft","tbil").value);
    const DBil = num(lab("lft","dbil").value);
    const BUN = num(lab("rft","bun").value);
    const Cr  = num(lab("rft","cre").value);
    const eGFR = num(lab("rft","egfr").value);
    const UO   = num(lab("rft","uo").value);
    const UAprotein = lab("ua","protein").value; // อาจเป็นตัวเลขหรือ "+"

    const SpO2 = (function(){
      const v = num(lab("lung","spo2").value);
      if (!isNaN(v)) return v;
      // เผื่อผู้ใช้ไปกรอกในหน้า 2
      const v2 = num(resp.spo2);
      return isNaN(v2) ? NaN : v2;
    })();

    const tropI = num(lab("heart","tropi").value);
    const tropT = num(lab("heart","tropt").value);
    const ckmb  = num(lab("heart","ckmb").value);
    const ekgTxt = lab("heart","ekg").value.toLowerCase();

    // สร้างชุด facts สะดวกสำหรับกติกา
    const facts = {
      onset: {
        within1h: onset.includes("ภายใน 1 ชั่วโมง"),
        within1to6h: /1.?–.?6 ชั่วโมง|1-6 ชั่วโมง/.test(onset),
        within6to24h: onset.includes("6–24 ชั่วโมง") || onset.includes("6-24 ชั่วโมง"),
        week1: onset.includes("1 สัปดาห์"),
        week2: onset.includes("2 สัปดาห์"),
        week3: onset.includes("3 สัปดาห์"),
        week4: onset.includes("4 สัปดาห์"),
      },
      skin: {
        urticaria: hasAny(rashShape, ["ตุ่มนูน","ปื้นนูน"]) && str(itch).includes("คัน"),
        angioedema: str(swelling).includes("บวม") && hasAny(positions, ["ริมฝีปาก","รอบดวงตา","ลิ้น","อวัยวะเพศ"]),
        mp: hasAny(rashColor, ["แดง","จุดเล็กแดง","ปื้นแดง"]) || hasInArr(rashShape, "ตุ่มนูน"),
        bullous: hasAny(blister, ["ขนาดเล็ก","ขนาดกลาง","ขนาดใหญ่"]),
        target3ring: hasInArr(rashShape, "วงกลม 3 ชั้น"),
        circle: hasInArr(rashShape, "วงกลม"),
        oval: hasInArr(rashShape, "วงรี"),
        irregularEdge: hasInArr(rashShape, "ขอบหยัก") || hasInArr(rashShape, "ขอบไม่ชัดเจน"),
        smoothEdge: hasInArr(rashShape, "ขอบเรียบ"),
        peelingCenter: peeling.includes("ตรงกลางผื่น"),
        peel10: peeling.includes("ไม่เกิน 10%"), // SJS Gate
        peel30: peeling.includes("เกิน 30%"),    // TEN Gate
        red: hasInArr(rashColor, "แดง"),
        redPale: hasInArr(rashColor, "แดงซีด"),
        pale: hasInArr(rashColor, "ซีด"),
        purple: hasInArr(rashColor, "ม่วง"),
        black: hasInArr(rashColor, "ดำ") || hasInArr(rashColor, "ดำ/คล้ำ"),
        gray: hasInArr(rashColor, "เทา"),
        burnRed: hasInArr(rashColor, "แดงไหม้"),
        glossy: hasInArr(rashColor, "มันเงา"),
        clear: hasInArr(rashColor, "ใส"),
        itch: str(itch).includes("คัน"),
        noItch: str(itch).includes("ไม่คัน"),
        pain: /ปวด|แสบ|เจ็บ/.test(pain),
        exudate: hasInArr(exudCrust, "น้ำเหลือง"),
        crust: hasInArr(exudCrust, "สะเก็ด"),
        dry: hasInArr(dryScaly, "แห้ง"),
        scale: hasInArr(dryScaly, "ขุย") || hasInArr(dryScaly, "ลอก"),
        swelling: str(swelling).includes("บวม"),
        thickRaised: hasInArr(rashShape, "ปื้นนูน") || hasInArr(rashShape, "นูนหนา"),
        locations: {
          allBody: hasInArr(positions, "ทั่วร่างกาย"),
          face: hasInArr(positions, "หน้า") || hasInArr(positions,"ใบหน้า"),
          periorbital: hasInArr(positions, "รอบดวงตา"),
          lip: hasInArr(positions, "ริมฝีปาก"),
          neck: hasInArr(positions, "ลำคอ"),
          scalp: hasInArr(positions, "ศีรษะ"),
          chest: hasInArr(positions, "หน้าอก"),
          arm: hasInArr(positions, "แขน"),
          leg: hasInArr(positions, "ขา"),
          hand: hasInArr(positions, "มือ"),
          foot: hasInArr(positions, "เท้า"),
          axilla: hasInArr(positions, "รักแร้"),
          groin: hasInArr(positions, "ขาหนีบ"),
          genital: hasInArr(positions, "อวัยวะเพศ"),
          trunk: hasInArr(positions, "ลำตัว"),
          symmetric: hasInArr(s.distribution || [], "สมมาตร"),
        },
        petechiae: hasInArr(rashShape, "จ้ำเลือด"),
      },
      resp: {
        any: !!(resp.dyspnea || resp.wheeze || resp.stridor || (!isNaN(SpO2) && SpO2 < 94)),
        dyspnea: !!resp.dyspnea,
        wheeze: !!resp.wheeze,
        stridor: !!resp.stridor,
        hypox: !isNaN(SpO2) && SpO2 < 94,
        SpO2,
      },
      circ: {
        hypotension: (!isNaN(bpSys) && bpSys < 90) || (!isNaN(bpDia) && bpDia < 60) || !!circ.hypotension,
        bpSys, bpDia,
        HR, RR
      },
      gi: {
        any: !!(gi.diarrhea || gi.abdPain || gi.dysphagia || gi.nausea || gi.vomiting || gi.nauseaVomiting),
        diarrhea: !!gi.diarrhea,
        abdPain: !!gi.abdPain,
        dysphagia: !!gi.dysphagia || !!gi.difficultSwallow,
        nv: !!gi.nausea || !!gi.vomiting || !!gi.nauseaVomiting
      },
      fever: (function(){
        // page1/2 อาจมี temp ในรายละเอียด — ถ้าไม่มี ให้ใช้ lab/ข้อความไม่ได้
        // ที่กติกาใช้ “Temp > 37.5 °C” จึงมองเป็น flag จากหน้า 2 (อาการระบบอื่นๆ)
        return !!(p2.fever || p2.other?.fever || /37\.5|38|ไข้/.test(JSON.stringify(p2)));
      })(),
      heme: {
        eosPctHigh: !isNaN(EOSp) && EOSp >= 10,
        atypicalLym: !!( (p3.cbc && p3.cbc.atypical && (p3.cbc.atypical.checked || num(p3.cbc.atypical.value) > 0)) )
      },
      liver: {
        enzymeHigh: (!isNaN(AST) && AST >= 40) || (!isNaN(ALT) && ALT >= 40) || (!isNaN(AST) && AST >= 2*40) || (!isNaN(ALT) && ALT >= 2*40),
        hepatitis: !!(p2.other?.hepatitis || /ตับอักเสบ/.test(JSON.stringify(p2)) ),
      },
      kidney: {
        creatRise: (!isNaN(Cr) && Cr >= 0.3) || (!!p2.other?.aki),
        proteinUA: UAprotein && (/\+|[1-9]/.test(UAprotein) || /protein/i.test(UAprotein)),
        nephritis: !!(p2.other?.nephritis || /ไตอักเสบ/.test(JSON.stringify(p2))),
        failure:  !!(p2.other?.renalFailure || /ไตวาย/.test(JSON.stringify(p2))),
      },
      lung: {
        pneumonia: !!(p2.other?.pneumonia || /ปอดอักเสบ/.test(JSON.stringify(p2))),
      },
      heart: {
        mi: (!isNaN(tropI) && tropI > 0.04) || (!isNaN(tropT) && tropT > 0.03),
        ekgAbn: /(st[\- ]?t|arrhythm|av block|qt)/i.test(ekgTxt)
      },
      thyroid: {
        thyroiditis: !!(p2.other?.thyroiditis || /ไทรอยด์อักเสบ/.test(JSON.stringify(p2)))
      },
      hemat: {
        anemia: (!isNaN(Hb) && Hb < 12) || /โลหิตจาง|ซีด/.test(JSON.stringify(p2)),
        pancytopenia: (!!p2.other?.pancytopenia),
        neutropenia: (!isNaN(NEUTp) && NEUTp < 40) || !!p2.other?.neutropenia,
        thrombocytopenia: (!isNaN(Plt) && Plt < 150000) || !!p2.other?.thrombocytopenia
      },
      nodes: /ต่อมน้ำเหลืองโต/.test(JSON.stringify(p1)) || /ต่อมน้ำเหลืองโต/.test(JSON.stringify(p2)),
      malaise: /อ่อนเพลีย/.test(JSON.stringify(p2)),
      chill: /หนาวสั่น/.test(JSON.stringify(p2)),
      appetiteLoss: /เบื่ออาหาร/.test(JSON.stringify(p2)),
      jaundice: /ดีซ่าน|ตาเหลือง|ตัวเหลือง/.test(JSON.stringify(p2)),
      spleen: /ม้ามโต/.test(JSON.stringify(p2)),
      liverEnlarge: /ตับโต/.test(JSON.stringify(p2)),
      legEdema: /ขาบวม/.test(JSON.stringify(p2)),
    };
    return facts;
  }

  // -------------------------------
  // 1) Engine แบบง่าย: กำหนด Rule ต่อโรค
  // -------------------------------
  const rules = [];
  function addRule(id, label, config) {
    rules.push({ id, label, config });
  }

  // Helper: ให้คะแนนถ้าจริง พร้อมอธิบาย
  function maybeScore(ok, pts, reason, bag) {
    if (ok) {
      bag.score += pts;
      bag.reasons.push(`${pts > 0 ? "+" : ""}${pts} ${reason}`);
    }
  }

  // Gate evaluator
  function passGate(gate, f, bag) {
    if (!gate) return true;
    // onset gate
    if (gate.onset) {
      const okOnset =
        (gate.onset.within1h && f.onset.within1h) ||
        (gate.onset.within1to6h && f.onset.within1to6h) ||
        (gate.onset.within6to24h && f.onset.within6to24h) ||
        (gate.onset.anyWeeks && (f.onset.week1 || f.onset.week2 || f.onset.week3 || f.onset.week4));
      if (!okOnset) return false;
    }
    // custom criteria mode ANY of c1/c2/c3
    if (gate.criteriaAny) {
      let ok = false;
      for (const fn of gate.criteriaAny) { if (fn(f)) { ok = true; break; } }
      if (!ok) return false;
    }
    // custom criteria ALL
    if (gate.criteriaAll) {
      for (const fn of gate.criteriaAll) { if (!fn(f)) return false; }
    }
    bag.reasons.push("✓ ผ่าน Gate");
    return true;
  }

  // -------------------------------
  // 2) นิยาม Rule ตามกติกาที่ผู้ใช้ให้มา
  // -------------------------------

  // ========== Urticaria ==========
  addRule("urticaria", "Urticaria", {
    score: (f, bag) => {
      maybeScore(hasInArr((g.page1?.skin?.rashShape)||[], "ตุ่มนูน"), 4, "ตุ่มนูน", bag);
      maybeScore(hasInArr((g.page1?.skin?.rashShape)||[], "ปื้นนูน"), 4, "ปื้นนูน", bag);
      maybeScore(f.skin.itch, 4, "คัน", bag);
      maybeScore(f.skin.irregularEdge, 3, "ขอบหยัก/ขอบไม่ชัด", bag);
      maybeScore(f.skin.red, 3, "แดง", bag);
      maybeScore(f.skin.redPale, 3, "แดงซีด", bag);
      maybeScore(f.skin.pale, 3, "ซีด", bag);
      maybeScore(f.skin.circle, 2, "วงกลม", bag);
      maybeScore(f.skin.swelling, 2, "บวม", bag);
      maybeScore(f.onset.within1h, 1, "ภายใน 1 ชั่วโมง", bag);
      const L = f.skin.locations;
      maybeScore(L.allBody, 1, "ทั่วร่างกาย", bag);
      maybeScore(L.hand, 1, "มือ", bag);
      maybeScore(L.foot, 1, "เท้า", bag);
      maybeScore(L.arm, 1, "แขน", bag);
      maybeScore(L.leg, 1, "ขา", bag);
      maybeScore(L.face, 1, "หน้า", bag);
      maybeScore(L.periorbital, 1, "รอบดวงตา", bag);
      maybeScore(L.neck, 1, "ลำคอ", bag);
    }
  });

  // ========== Anaphylaxis ==========
  addRule("anaphylaxis", "Anaphylaxis", {
    gate: {
      onset: { within1h: true, within1to6h: true },
      criteriaAny: [
        // Criteria 1
        (f) => (f.skin.urticaria || f.skin.angioedema) && (f.resp.any || f.circ.hypotension),
        // Criteria 2 (>=2 systems from {skin,resp,circ,gi})
        (f) => {
          let c = 0;
          if (f.skin.urticaria || f.skin.angioedema || f.skin.mp || f.skin.bullous) c++;
          if (f.resp.any) c++;
          if (f.circ.hypotension || (!isNaN(f.circ.HR) && f.circ.HR>100)) c++;
          if (f.gi.any) c++;
          return c >= 2;
        },
        // Criteria 3: hypotension
        (f) => f.circ.hypotension
      ]
    },
    score: (f, bag) => {
      maybeScore(f.resp.wheeze, 4, "หายใจมีเสียงวี้ด", bag);
      maybeScore(f.resp.dyspnea || (!isNaN(f.circ.RR) && f.circ.RR>21) || (!isNaN(f.circ.HR) && f.circ.HR>100) || (f.resp.SpO2<94),
                 4, "หอบเหนื่อย/หายใจลำบาก/RR>21 หรือ HR>100 หรือ SpO2<94%", bag);
      maybeScore(f.gi.diarrhea, 2, "ท้องเสีย", bag);
      maybeScore(f.gi.abdPain, 2, "ปวดบิดท้อง", bag);
      maybeScore(f.gi.dysphagia, 2, "กลืนลำบาก", bag);
      maybeScore(f.gi.nv, 2, "คลื่นไส้/อาเจียน", bag);
      maybeScore(f.circ.hypotension || (!isNaN(f.circ.bpSys) && !isNaN(f.circ.bpDia) && (f.circ.bpSys<90 || f.circ.bpDia<60)),
                 3, "BP ต่ำ (<90/60)", bag);
      // systolic ลด ≥30% จาก baseline: ไม่มี baseline → ให้ติ๊กในหน้า 2 เป็น hypotensionSpecific=true ในอนาคต
      if (g.page2?.circ?.systolicDrop30) maybeScore(true, 4, "Systolic ลดลง ≥30% จาก baseline", bag);
      maybeScore(!isNaN(f.circ.HR) && f.circ.HR>100, 2, "HR สูง (>100)", bag);
      maybeScore(!isNaN(f.resp.SpO2) && f.resp.SpO2<95, 1, "SpO2 <95%", bag);
      maybeScore(f.skin.urticaria || f.skin.angioedema, 2, "Urticaria/Angioedema (หลักฐานสนับสนุน)", bag);
    }
  });

  // ========== Angioedema ==========
  addRule("angioedema", "Angioedema", {
    score: (f, bag) => {
      const L = f.skin.locations;
      maybeScore(f.skin.swelling, 4, "บวม", bag);
      maybeScore(f.skin.thickRaised, 4, "นูนหนา", bag);
      maybeScore(L.lip, 4, "ริมฝีปาก", bag);
      maybeScore(L.periorbital, 4, "รอบดวงตา", bag);
      maybeScore(!f.skin.red && !f.skin.purple && !f.skin.black, 3, "สีผิวปกติ", bag);
      maybeScore(true && /ตึง/.test(JSON.stringify(g.page1||{})), 3, "ตึง", bag);
      maybeScore(f.skin.noItch, 2, "ไม่คัน", bag);
      maybeScore(f.skin.itch, 2, "คัน", bag);
      maybeScore(f.skin.irregularEdge, 2, "ขอบไม่ชัดเจน", bag);
      maybeScore(L.face && str((g.page1?.skin?.tongue)||"").includes("ลิ้น") || L.genital, 2, "ลิ้น/อวัยวะเพศ", bag);
      maybeScore(f.skin.pain, 1, "ปวด/แสบ", bag);
      maybeScore(f.onset.within1h, 1, "ภายใน 1 ชั่วโมง", bag);
      maybeScore(L.genital, 1, "อวัยวะเพศ", bag);
      maybeScore(f.skin.red, 1, "แดง", bag);
    }
  });

  // ========== Maculopapular rash ==========
  addRule("mp", "Maculopapular rash", {
    // หมายเหตุในคำอธิบาย: ให้ประเมิน DRESS/SJS/TEN/AGEP/Exfoliative ด้วย (engine จะคำนวณแยกโรคให้เอง)
    score: (f, bag) => {
      maybeScore(f.skin.red, 4, "แดง", bag);
      maybeScore(hasInArr((g.page1?.skin?.rashColor)||[], "จุดเล็กแดง"), 4, "จุดเล็กแดง", bag);
      maybeScore(hasInArr((g.page1?.skin?.rashColor)||[], "ปื้นแดง"), 4, "ปื้นแดง", bag);
      maybeScore(hasInArr((g.page1?.skin?.rashShape)||[], "ตุ่มนูน"), 3, "ตุ่มนูน", bag);
      maybeScore(f.skin.locations.symmetric, 3, "สมมาตร", bag);
      maybeScore(f.skin.itch, 3, "คัน", bag);
      // onsets
      maybeScore(f.onset.within1h, 1, "ภายใน 1 ชั่วโมง", bag);
      maybeScore(f.onset.within1to6h, 1, "ภายใน 1–6 ชั่วโมง", bag);
      maybeScore(f.onset.within6to24h, 1, "ภายใน 6–24 ชั่วโมง", bag);
      maybeScore(f.onset.week1, 1, "ภายใน 1 สัปดาห์", bag);
      maybeScore(f.onset.week2, 1, "ภายใน 2 สัปดาห์", bag);
      // ตำแหน่ง
      const L = f.skin.locations;
      maybeScore(L.trunk, 1, "ลำตัว", bag);
      maybeScore(L.arm, 1, "แขน", bag);
      maybeScore(L.face, 1, "ใบหน้า", bag);
      maybeScore(L.neck, 1, "ลำคอ", bag);
      // อื่นๆร่วม
      maybeScore(f.fever, 1, "ไข้ > 37.5°C", bag);
      maybeScore(f.nodes, 1, "ต่อมน้ำเหลืองโต", bag);
      maybeScore(/ข้ออักเสบ/.test(JSON.stringify(g.page2||{})), 1, "ข้ออักเสบ", bag);
      maybeScore(f.kidney.nephritis, 1, "ไตอักเสบ", bag);
      maybeScore(f.liver.hepatitis || f.liver.enzymeHigh, 1, "ตับอักเสบ/เอนไซม์สูง", bag);
    }
  });

  // ========== Fixed Drug Eruption (FDE) ==========
  addRule("fde", "Fixed drug eruption", {
    score: (f, bag) => {
      maybeScore(f.skin.circle, 3, "วงกลม", bag);
      maybeScore(f.skin.oval, 2, "วงรี", bag);
      maybeScore(f.skin.red, 3, "แดง", bag);
      maybeScore(f.skin.peelingCenter, 4, "ผิวหลุดกลางผื่น", bag);
      maybeScore(f.skin.purple, 4, "ม่วง", bag);
      maybeScore(f.skin.black, 3, "ดำ/คล้ำ", bag);
      maybeScore(f.skin.swelling, 3, "บวม", bag);
      maybeScore(hasInArr((g.page1?.skin?.blister)||[], "ขนาดเล็ก"), 2, "ตุ่มน้ำเล็ก", bag);
      maybeScore(hasInArr((g.page1?.skin?.blister)||[], "ขนาดกลาง"), 2, "ตุ่มน้ำกลาง", bag);
      maybeScore(hasInArr((g.page1?.skin?.blister)||[], "ขนาดใหญ่"), 2, "ตุ่มน้ำใหญ่", bag);
      maybeScore(f.skin.pain, 3, "เจ็บ/แสบ/ตึง", bag);
      maybeScore(f.fever, 1, "ไข้ > 37.5°C", bag);
      maybeScore(f.gi.nv, 1, "คลื่นไส้/อาเจียน", bag);
      maybeScore(/ปวดเมื่อย/.test(JSON.stringify(g.page2||{})), 1, "ปวดเมื่อย", bag);
      maybeScore(f.skin.itch, 1, "คัน", bag);
      maybeScore(f.onset.week1, 1, "ภายใน 1 สัปดาห์", bag);
      maybeScore(f.onset.week2, 1, "ภายใน 2 สัปดาห์", bag);
      maybeScore(f.skin.smoothEdge, 2, "ขอบเรียบ", bag);
      const L = f.skin.locations;
      maybeScore(L.lip, 3, "ริมฝีปาก", bag);
      ["face","hand","foot","arm","leg","genital"].forEach(k=>{
        const map={face:"หน้า",hand:"มือ",foot:"เท้า",arm:"แขน",leg:"ขา",genital:"อวัยวะเพศ"};
        maybeScore(L[k], 1, map[k], bag);
      });
      // ตำแหน่งเดิมกับครั้งก่อน → ให้ผู้ใช้ติ๊ก flag page1.skin.sameSpot=true ในอนาคต
      if (g.page1?.skin?.sameSpot) maybeScore(true, 2, "ตำแหน่งเดิมกับครั้งก่อน", bag);
    }
  });

  // ========== AGEP ==========
  addRule("agep", "AGEP", {
    score: (f, bag) => {
      maybeScore(/ตุ่มหนอง/.test(JSON.stringify(g.page1||{})), 4, "ตุ่มหนอง", bag);
      maybeScore(hasInArr((g.page1?.skin?.rashColor)||[], "ปื้นแดง"), 3, "ปื้นแดง", bag);
      maybeScore(f.fever, 2, "ไข้ > 37.5°C", bag);
      maybeScore(f.skin.red, 3, "แดง", bag);
      maybeScore(hasInArr((g.page1?.skin?.rashColor)||[], "เหลือง"), 3, "เหลือง", bag);
      maybeScore(f.skin.swelling, 1, "บวม", bag);
      maybeScore(f.skin.pain, 1, "เจ็บ", bag);
      maybeScore(f.skin.itch, 1, "คัน", bag);
      maybeScore(f.skin.petechiae, 1, "จ้ำเลือด", bag);
      ["ขนาดเล็ก","ขนาดกลาง","ขนาดใหญ่"].forEach(sz=>{
        maybeScore(hasInArr((g.page1?.skin?.blister)||[], sz), 1, `ตุ่มน้ำ${sz}`, bag);
      });
      maybeScore(!isNaN(WBC) && WBC>11000, 1, "WBC > 11000", bag);
      maybeScore(!isNaN(NEUTp) && NEUTp>75, 1, "Neutrophil > 75%", bag);
      // onset
      maybeScore(f.onset.within1h, 1, "ภายใน 1 ชั่วโมง", bag);
      maybeScore(f.onset.within1to6h, 1, "ภายใน 1–6 ชั่วโมง", bag);
      maybeScore(f.onset.within6to24h, 1, "ภายใน 6–24 ชั่วโมง", bag);
      maybeScore(f.onset.week1, 1, "ภายใน 1 สัปดาห์", bag);
      maybeScore(f.onset.week2, 1, "ภายใน 2 สัปดาห์", bag);
      maybeScore(f.onset.week3, 1, "ภายใน 3 สัปดาห์", bag);
      // scale/dry
      maybeScore(f.skin.dry, 1, "แห้ง", bag);
      maybeScore(f.skin.scale, 1, "ลอก/ขุย", bag);
      // ตำแหน่ง
      const L = f.skin.locations;
      maybeScore(L.face, 1, "หน้า", bag);
      maybeScore(L.axilla, 2, "รักแร้", bag);
      maybeScore(L.groin, 2, "ขาหนีบ", bag);
      maybeScore(L.allBody, 1, "ทั่วร่างกาย", bag);
    }
  });

  // ========== SJS ==========
  addRule("sjs", "SJS", {
    gate: {
      criteriaAny: [
        (f) => f.skin.peel10 // ผิวหนังหลุดลอก <=10% BSA → เป็น SJS
      ]
    },
    score: (f, bag) => {
      maybeScore(f.skin.red, 2, "แดง", bag);
      maybeScore(f.skin.black, 3, "ดำ/คล้ำ", bag);
      maybeScore(f.skin.gray, 1, "เทา", bag);
      ["ขนาดเล็ก","ขนาดกลาง","ขนาดใหญ่"].forEach(sz=>{
        maybeScore(hasInArr((g.page1?.skin?.blister)||[], sz), 1, `ตุ่มน้ำ${sz}`, bag);
      });
      maybeScore(f.skin.exudate, 2, "น้ำเหลือง", bag);
      maybeScore(f.skin.crust, 2, "สะเก็ด", bag);
      maybeScore(f.fever, 1, "ไข้ > 37.5°C", bag);
      ["ปวดเมื่อยกล้ามเนื้อ","คลื่นไส้/อาเจียน","เจ็บคอ","ปวดข้อ","เลือดออกในทางเดินอาหาร"]
        .forEach(txt=>maybeScore(new RegExp(txt).test(JSON.stringify(g.page2||{})),1,txt,bag));
      // onset
      maybeScore(f.onset.within1h, 1, "ภายใน 1 ชั่วโมง", bag);
      maybeScore(f.onset.within1to6h, 1, "ภายใน 1–6 ชั่วโมง", bag);
      maybeScore(f.onset.within6to24h, 1, "ภายใน 6–24 ชั่วโมง", bag);
      maybeScore(f.onset.week1, 1, "ภายใน 1 สัปดาห์", bag);
      maybeScore(f.onset.week2, 1, "ภายใน 2 สัปดาห์", bag);
      maybeScore(f.onset.week3, 1, "ภายใน 3 สัปดาห์", bag);
      // ตำแหน่ง
      const L=f.skin.locations;
      ["trunk","arm","leg","face","hand","foot","scalp"].forEach(k=>{
        const map={trunk:"ลำตัว",arm:"แขน",leg:"ขา",face:"ใบหน้า",hand:"มือ",foot:"เท้า",scalp:"ศีรษะ"};
        maybeScore(L[k],1,map[k],bag);
      });
    }
  });

  // ========== TEN ==========
  addRule("ten", "TEN", {
    gate: {
      criteriaAny: [
        (f) => f.skin.peel30, // >30% BSA เป็น TEN
      ],
      criteriaAll: [
        // ต้องมี "ผิวหนัง" + "ระบบอื่นๆสักอย่าง" + "อวัยวะผิดปกติอย่างน้อย 1"
        (f) => (f.skin.bullous || f.skin.peel30 || f.skin.red),
        (f) => (f.resp.any || f.gi.any || f.circ.hypotension || /กล้ามเนื้อ/.test(JSON.stringify(g.page2||{})) || /อื่นๆ/.test(JSON.stringify(g.page2||{}))),
        (f) => (f.liver.enzymeHigh || f.liver.hepatitis || f.kidney.creatRise || f.kidney.proteinUA || f.kidney.nephritis || f.kidney.failure || f.lung.pneumonia || f.resp.hypox || f.heart.mi)
      ]
    },
    score: (f, bag) => {
      maybeScore(f.skin.red, 2, "แดง", bag);
      maybeScore(f.skin.purple, 2, "ม่วง", bag);
      maybeScore(f.skin.black, 3, "ดำ/คล้ำ", bag);
      maybeScore(hasInArr((g.page1?.skin?.blister)||[], "ขนาดใหญ่"), 2, "ตุ่มน้ำขนาดใหญ่", bag);
      maybeScore(f.skin.exudate, 2, "น้ำเหลือง", bag);
      maybeScore(f.skin.crust, 2, "สะเก็ด", bag);
      maybeScore(f.skin.peel30, 1, "ผิวหนังหลุดลอก >30% BSA", bag);
      // อาการร่วม
      maybeScore(f.fever, 1, "ไข้ > 37.5°C", bag);
      ["ปวดเมื่อยกล้ามเนื้อ","คลื่นไส้/อาเจียน","เจ็บคอ","ปวดข้อ","เลือดออกในทางเดินอาหาร"]
        .forEach(txt=>maybeScore(new RegExp(txt).test(JSON.stringify(g.page2||{})),1,txt,bag));
      // onsets
      maybeScore(f.onset.within1h, 1, "ภายใน 1 ชั่วโมง", bag);
      maybeScore(f.onset.within1to6h, 1, "ภายใน 1–6 ชั่วโมง", bag);
      maybeScore(f.onset.within6to24h, 1, "ภายใน 6–24 ชั่วโมง", bag);
      maybeScore(f.onset.week1, 1, "ภายใน 1 สัปดาห์", bag);
      maybeScore(f.onset.week2, 1, "ภายใน 2 สัปดาห์", bag);
      maybeScore(f.onset.week3, 1, "ภายใน 3 สัปดาห์", bag);
      // ตำแหน่ง
      const L=f.skin.locations;
      ["trunk","arm","leg","face","hand","foot","scalp"].forEach(k=>{
        const map={trunk:"ลำตัว",arm:"แขน",leg:"ขา",face:"ใบหน้า",hand:"มือ",foot:"เท้า",scalp:"ศีรษะ"};
        maybeScore(L[k],1,map[k],bag);
      });
      // อวัยวะภายใน
      maybeScore(f.gi.diarrhea, 1, "ท้องเสีย", bag);
      maybeScore(f.liver.hepatitis||f.liver.enzymeHigh, 1, "ตับอักเสบ/เอนไซม์สูง", bag);
      maybeScore(f.lung.pneumonia, 1, "ปอดอักเสบ", bag);
      maybeScore(f.hemat.anemia, 1, "โลหิตจาง/ซีด", bag);
      maybeScore(f.resp.hypox, 1, "SpO₂ <94%", bag);
      maybeScore(f.liver.enzymeHigh, 1, "ALT/AST ≥ 40 หรือ ≥2x ULN", bag);
      maybeScore(f.kidney.creatRise, 1, "Cr เพิ่ม ≥0.3 mg/dL ภายใน 48ชม. หรือ ≥1.5x ใน 7วัน", bag);
      maybeScore(f.kidney.proteinUA, 1, "UA: protein", bag);
      maybeScore(f.kidney.failure, 1, "ไตวาย", bag);
      // ปาก/ตา
      const L2=f.skin.locations;
      maybeScore(L2.lip, 1, "ริมฝีปาก", bag);
      maybeScore(L2.periorbital, 1, "รอบดวงตา", bag);
    }
  });

  // ========== DRESS ==========
  addRule("dress", "DRESS", {
    gate: {
      onset: { anyWeeks: true }, // 2–6 สัปดาห์ (เรายอมทุกสัปดาห์ในโค้ด baseline นี้)
      criteriaAll: [
        // 1) ผิวหนังผิดปกติ
        (f) => f.skin.mp || f.skin.bullous || f.skin.red || f.skin.petechiae,
        // 2) systemic/hematologic ≥1
        (f) => f.fever || g.page6?.ai?.__tmp_nodes || f.heme.eosPctHigh || f.heme.atypicalLym || f.nodes,
        // 3) internal organ ≥1
        (f) => f.liver.enzymeHigh || f.liver.hepatitis ||
               f.kidney.creatRise || f.kidney.proteinUA || f.kidney.nephritis || f.kidney.failure ||
               f.lung.pneumonia || f.resp.hypox || f.heart.mi || f.heart.ekgAbn || f.thyroid.thyroiditis
      ]
    },
    score: (f, bag) => {
      bag.reasons.push("Timing: 2–6 สัปดาห์ (ยอมรับช่วงสัปดาห์ใน baseline)");
      // เราให้คะแนนตามองค์ประกอบสำคัญ (เน้น org involvement / heme)
      maybeScore(f.skin.mp || f.skin.bullous || f.skin.red, 3, "ผิวหนังผิดปกติ", bag);
      maybeScore(f.heme.eosPctHigh, 4, "Eosinophil ≥10%", bag);
      maybeScore(f.heme.atypicalLym, 3, "Atypical lymphocyte", bag);
      maybeScore(f.fever || f.nodes, 2, "ไข้/ต่อมน้ำเหลืองโต", bag);
      // organ
      maybeScore(f.liver.enzymeHigh || f.liver.hepatitis, 4, "ตับผิดปกติ", bag);
      maybeScore(f.kidney.creatRise || f.kidney.proteinUA || f.kidney.nephritis || f.kidney.failure, 4, "ไตผิดปกติ", bag);
      maybeScore(f.lung.pneumonia || f.resp.hypox, 3, "ปอดเกี่ยวข้อง", bag);
      maybeScore(f.heart.mi || f.heart.ekgAbn, 3, "หัวใจเกี่ยวข้อง", bag);
      maybeScore(f.thyroid.thyroiditis, 2, "ต่อมไทรอยด์เกี่ยวข้อง", bag);
    }
  });

  // ========== Erythema multiforme (EM) ==========
  addRule("em", "Erythema multiforme", {
    // *มีข้อสั่ง: ถ้าผิวหนัง + เยื่อบุกว่า 2 ตำแหน่ง → จัด SJS ทันที (ให้ SJS gate ทำงานเอง)
    score: (f, bag) => {
      maybeScore(hasInArr((g.page1?.skin?.rashShape)||[], "ตุ่มนูน"), 2, "ตุ่มนูน", bag);
      ["ขนาดเล็ก","ขนาดกลาง","ขนาดใหญ่"].forEach(sz=>{
        maybeScore(hasInArr((g.page1?.skin?.blister)||[], sz), 1, `ตุ่มน้ำ${sz}`, bag);
      });
      maybeScore(f.skin.red, 3, "แดง", bag);
      maybeScore(f.skin.target3ring, 30, "Target lesion (วงกลม 3 ชั้น)", bag);
      maybeScore(f.skin.redPale, 2, "แดงซีด", bag);
      maybeScore(f.skin.crust, 2, "สะเก็ด", bag);
      maybeScore(/ขอบวงนูนแดงด้านในซีด/.test(JSON.stringify(g.page1||{})), 2, "ขอบวงนูนแดง/ในซีด", bag);
      maybeScore(f.fever, 2, "ไข้ > 37.5°C", bag);
      ["อ่อนเพลีย","ปวดเมื่อยกล้ามเนื้อ","ปวดข้อ","เจ็บคอ"].forEach(txt=>{
        maybeScore(new RegExp(txt).test(JSON.stringify(g.page2||{})),1,txt,bag);
      });
      // onset
      maybeScore(f.onset.within1h, 1, "ภายใน 1 ชั่วโมง", bag);
      maybeScore(f.onset.within1to6h, 1, "ภายใน 1–6 ชั่วโมง", bag);
      maybeScore(f.onset.within6to24h, 1, "ภายใน 6–24 ชั่วโมง", bag);
      maybeScore(f.onset.week1, 1, "ภายใน 1 สัปดาห์", bag);
      // positions
      const L = f.skin.locations;
      maybeScore(L.hand,2,"มือ",bag);
      ["foot","arm","leg","face","neck"].forEach(k=>{
        const map={foot:"เท้า",arm:"แขน",leg:"ขา",face:"หน้า",neck:"ลำคอ"};
        maybeScore(L[k],1,map[k],bag);
      });
    }
  });

  // ========== Photosensitivity ==========
  addRule("photosens", "Photosensitivity drug eruption", {
    score: (f, bag) => {
      maybeScore(/ขอบเขตชัด/.test(JSON.stringify(g.page1||{})), 3, "ขอบเขตชัด", bag);
      maybeScore(hasInArr((g.page1?.skin?.rashColor)||[], "แดงไหม้"), 4, "แดงไหม้", bag);
      maybeScore(f.skin.pain, 3, "แสบ", bag);
      ["ขนาดเล็ก","ขนาดกลาง","ขนาดใหญ่"].forEach(sz=>{
        maybeScore(hasInArr((g.page1?.skin?.blister)||[], sz), 1, `ตุ่มน้ำ${sz}`, bag);
      });
      maybeScore(f.skin.black, 1, "ดำ/คล้ำ", bag);
      maybeScore(hasInArr((g.page1?.skin?.rashColor)||[], "ปื้นแดง"), 3, "ปื้นแดง", bag);
      maybeScore(f.skin.scale, 3, "ลอก", bag);
      maybeScore(f.skin.scale, 2, "ขุย", bag);
      maybeScore(hasInArr((g.page1?.skin?.rashColor)||[], "จุดเล็กแดง"), 3, "จุดเล็กแดง", bag);
      maybeScore(f.skin.red, 3, "แดง", bag);
      maybeScore(f.skin.itch, 3, "คัน", bag);
      maybeScore(f.skin.exudate, 2, "น้ำเหลือง", bag);
      maybeScore(f.skin.crust, 3, "สะเก็ด", bag);
      const L=f.skin.locations;
      ["face","chest","hand","arm","leg"].forEach(k=>{
        const map={face:"หน้า",chest:"หน้าอก",hand:"มือ",arm:"แขน",leg:"ขา"};
        maybeScore(L[k],1,map[k],bag);
      });
      // onset
      maybeScore(f.onset.within1h,1,"ภายใน 1 ชั่วโมง",bag);
      maybeScore(f.onset.within1to6h,1,"ภายใน 1–6 ชั่วโมง",bag);
      maybeScore(f.onset.within6to24h,1,"ภายใน 6–24 ชั่วโมง",bag);
      maybeScore(f.onset.week1,1,"ภายใน 1 สัปดาห์",bag);
    }
  });

  // ========== Exfoliative dermatitis ==========
  addRule("exfol", "Exfoliative dermatitis", {
    score: (f, bag) => {
      maybeScore(f.skin.red,3,"แดง",bag);
      maybeScore(f.skin.scale,3,"ขุย/ลอก",bag);
      maybeScore(f.skin.dry,3,"แห้ง",bag);
      maybeScore(f.skin.glossy,4,"มันเงา",bag);
      maybeScore(f.skin.exudate,3,"น้ำเหลือง",bag);
      maybeScore(f.skin.crust,3,"สะเก็ด",bag);
      maybeScore(f.skin.itch,2,"คัน",bag);
      maybeScore(f.skin.pain,1,"แสบ/เจ็บ",bag);
      const L=f.skin.locations;
      maybeScore(L.scalp,1,"ศีรษะ",bag);
      // ระบบร่วม
      maybeScore(f.fever,1,"ไข้ > 37.5°C",bag);
      maybeScore(/หนาวสั่น/.test(JSON.stringify(g.page2||{})),1,"หนาวสั่น",bag);
      maybeScore(f.malaise,1,"อ่อนเพลีย",bag);
      maybeScore(f.appetiteLoss,1,"เบื่ออาหาร",bag);
      maybeScore(f.jaundice,1,"ดีซ่าน",bag);
      maybeScore(f.spleen,1,"ม้ามโต",bag);
      maybeScore(f.liverEnlarge,1,"ตับโต",bag);
      maybeScore(f.legEdema,1,"ขาบวม",bag);
      // onsets
      ["within1h","within1to6h","within6to24h","week1","week2","week3","week4"].forEach(k=>{
        if (f.onset[k]) maybeScore(true,1,`Onset ${k}`,bag);
      });
      // ตำแหน่งกว้าง
      maybeScore(f.skin.locations.allBody,1,"ทั่วร่างกาย",bag);
      ["hand","foot","scalp"].forEach(k=>{
        const map={hand:"มือ",foot:"เท้า",scalp:"ศีรษะ"};
        maybeScore(f.skin.locations[k],1,map[k],bag);
      });
    }
  });

  // ========== Eczematous drug eruption ==========
  addRule("eczema", "Eczematous drug eruption", {
    score: (f, bag) => {
      maybeScore(hasInArr((g.page1?.skin?.rashShape)||[], "ตุ่มนูน"),2,"ตุ่มนูน",bag);
      maybeScore(f.skin.red,3,"แดง",bag);
      maybeScore(f.skin.dry,4,"แห้ง",bag);
      maybeScore(f.skin.scale,4,"ลอก/ขุย",bag);
      maybeScore(hasInArr((g.page1?.skin?.rashColor)||[], "ปื้นแดง"),2,"ปื้นแดง",bag);
      maybeScore(hasInArr((g.page1?.skin?.rashShape)||[], "ปื้นนูน"),2,"ปื้นนูน",bag);
      maybeScore(f.skin.exudate,1,"น้ำเหลือง",bag);
      maybeScore(f.skin.crust,1,"สะเก็ด",bag);
      ["ขนาดเล็ก","ขนาดกลาง","ขนาดใหญ่"].forEach(sz=>{
        maybeScore(hasInArr((g.page1?.skin?.blister)||[], sz), 1, `ตุ่มน้ำ${sz}`, bag);
      });
      maybeScore(f.skin.itch,3,"คัน",bag);
      // onset
      ["within1h","within1to6h","within6to24h","week1","week2","week3"].forEach(k=>{
        if (f.onset[k]) maybeScore(true,1,`Onset ${k}`,bag);
      });
      // ตำแหน่ง
      const L=f.skin.locations;
      ["trunk","arm","leg","foot","face","neck"].forEach(k=>{
        const map={trunk:"ลำตัว",arm:"แขน",leg:"ขา",foot:"เท้า",face:"หน้า",neck:"ลำคอ"};
        maybeScore(L[k],1,map[k],bag);
      });
      maybeScore(L.symmetric,3,"สมมาตร",bag);
    }
  });

  // ========== Bullous Drug Eruption ==========
  addRule("bde", "Bullous Drug Eruption", {
    score: (f, bag) => {
      maybeScore(hasInArr((g.page1?.skin?.blister)||[], "ขนาดเล็ก"),2,"ตุ่มน้ำเล็ก",bag);
      maybeScore(hasInArr((g.page1?.skin?.blister)||[], "ขนาดกลาง"),4,"ตุ่มน้ำกลาง",bag);
      maybeScore(hasInArr((g.page1?.skin?.blister)||[], "ขนาดใหญ่"),4,"ตุ่มน้ำใหญ่",bag);
      maybeScore(f.skin.clear,4,"ตุ่มน้ำใส",bag);
      maybeScore(f.skin.red,2,"แดง",bag);
      maybeScore(f.skin.pain,3,"เจ็บ/แสบ",bag);
      // onset
      ["within1h","within1to6h","within6to24h","week1","week2","week3"].forEach(k=>{
        if (f.onset[k]) maybeScore(true,1,`Onset ${k}`,bag);
      });
      // ตำแหน่ง
      const L=f.skin.locations;
      ["trunk","arm","leg"].forEach(k=>{
        const map={trunk:"ลำตัว",arm:"แขน",leg:"ขา"};
        maybeScore(L[k],1,map[k],bag);
      });
      maybeScore(L.foot,2,"เท้า",bag);
      // หมายเหตุ: engine จะให้ SJS/TEN/DRESS คิดคะแนนคู่ขนานเองตามกติกา
    }
  });

  // -------------------------------
  // 3) ประเมินทั้งหมด → เก็บผลไว้ให้หน้า 6 ใช้
  // -------------------------------
  function evaluateAll() {
    const f = collectFacts();
    const ranking = [];
    const reasons = {};
    for (const r of rules) {
      const bag = { score: 0, reasons: [] };
      // Gate
      if (r.config.gate) {
        const ok = passGate(r.config.gate, f, bag);
        if (!ok) {
          reasons[r.id] = bag.reasons.concat(["ไม่ผ่าน Gate → 0 คะแนน"]);
          ranking.push({ id: r.id, label: r.label, score: 0 });
          continue;
        }
      }
      // Score body
      if (typeof r.config.score === "function") {
        r.config.score(f, bag);
      }
      reasons[r.id] = bag.reasons;
      ranking.push({ id: r.id, label: r.label, score: bag.score });
    }
    ranking.sort((a,b)=>b.score - a.score);
    g.page6.ai = {
      lastEvaluatedAt: Date.now(),
      best: ranking[0] || null,
      ranking,
      reasons
    };
    // แจ้งหน้า 6 ให้รีเรนเดอร์ (ถ้าต้องการ)
    try { document.dispatchEvent(new CustomEvent("da:update", { detail: { source: "brain", ts: Date.now() } })); } catch {}
    return g.page6.ai;
  }

  // รันอัตโนมัติเมื่อข้อมูลเปลี่ยน
  document.addEventListener("da:update", () => { evaluateAll(); });
  // รันครั้งแรกตอนโหลดสมอง
  evaluateAll();

  // export (เผื่ออยากเรียกเอง)
  window.DABrain = { evaluateAll, rulesCount: () => rules.length };
})();

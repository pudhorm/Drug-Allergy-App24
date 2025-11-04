/* brain.rules.js — กฎประเมินเบื้องต้นสำหรับหน้า 6
   หมายเหตุ:
   - โค้ดตั้งใจให้ "ทนทาน" ต่อโครงสร้างข้อมูลต่างเวอร์ชัน: ถ้าคีย์ไม่ตรงจะพยายามหาแบบหลวมๆ
   - ถ้า field บางตัวไม่มี ระบบจะให้ 0 คะแนนในส่วนนั้น (ไม่เด้ง error)
*/

/* ---------- helpers ---------- */
function arr(x){ return Array.isArray(x) ? x : (x == null ? [] : [x]); }
function str(x){ return (x == null ? "" : String(x)).trim(); }
function num(x){ var n = Number(x); return isNaN(n) ? null : n; }
function includesAny(list, options){
  list = arr(list).map(String);
  return options.some(o => list.some(v => v.includes(o)));
}
function has(list, key){ return arr(list).some(v => String(v).includes(key)); }
function scoreIf(cond, pts){ return cond ? pts : 0; }

/* ค้นค่าตาม path ปลอดภัย */
function getPath(o, path){
  try { return path.split(".").reduce((a,k)=> (a && a[k] != null) ? a[k] : undefined, o); }
  catch(e){ return undefined; }
}

/* หา value แบบหลวมๆ ใน object ลึกๆ จากชื่อคีย์ (regex) */
function deepFindNumber(obj, re){
  let out = null;
  function walk(o){
    if (!o || typeof o !== "object") return;
    for (const k of Object.keys(o)){
      const v = o[k];
      if (re.test(k) && (typeof v === "number" || /^[\d.+-]+$/.test(String(v)))) {
        const n = Number(v);
        if (!isNaN(n)) { out = n; return; }
      }
      if (v && typeof v === "object") walk(v);
      if (out != null) return;
    }
  }
  walk(obj);
  return out;
}
function deepHas(obj, re, expected=true){
  let hit = false;
  function walk(o){
    if (!o || typeof o !== "object") return;
    for (const k of Object.keys(o)){
      const v = o[k];
      if (re.test(k)) {
        if (typeof v === "boolean") { hit = (v === expected); return; }
        if (typeof v === "string") { hit = expected ? v !== "" : v === ""; return; }
        if (typeof v === "number") { hit = expected ? true : false; return; }
      }
      if (v && typeof v === "object") walk(v);
      if (hit) return;
    }
  }
  walk(obj);
  return hit;
}

/* รวมข้อมูลจากหน้า 1–3 ให้ชื่ออ่านง่าย */
function norm(d){
  const p1 = d.page1 || d.skin || d.pageSkin || {};
  const skin = p1.skin || p1;
  const p2 = d.page2 || {};
  const p3 = d.page3 || {};

  // หน้า 1 (ผิวหนัง)
  const shapes = arr(skin.rashShape || skin.shape || []);
  const colors = arr(skin.rashColor || skin.color || []);
  const blisters = arr(skin.blister || skin.blisters || []);
  const borders = arr(skin.border || []);
  const itch = str(skin.itch || "");
  const pain = str(skin.pain || "");  // อาจเป็น "ปวด/แสบ/เจ็บ" คั่นด้วยเครื่องหมาย
  const swelling = str(skin.swelling || "");
  const peeling = str(skin.peeling || "");   // เช่น "ผิวหนังหลุดลอกตรงกลางผื่น", "ไม่เกิน 10% BSA", "เกิน 30% BSA"
  const onset = str(skin.onset || skin.timeline || "");
  const symmetry = str(skin.distributionSymmetry || skin.symmetry || "");
  const positions = arr(skin.positions || skin.locs || []);
  const fever = str(skin.fever || ""); // บางเวอร์ชั่นอาจใส่ไว้หน้า 2/3

  // หน้า 2 (ระบบอื่นๆ)
  const resp = p2.respiratory || p2.lungs || {};
  const circ = p2.circulation || p2.cardiac || {};
  const gi   = p2.gi || p2.gastro || {};
  const other= p2.other || {};

  const wheeze = !!(resp.wheeze || deepHas(p2, /wheeze|วี๊ด/i));
  const dyspnea = !!(resp.dyspnea || resp.difficult || deepHas(p2, /dyspnea|หายใจลำบาก|หอบ/i));
  const diarrhea = !!(gi.diarrhea || deepHas(p2, /ท้องเสีย|diarr/i));
  const abdCramp = !!(gi.cramp || deepHas(p2, /ปวดบิด|colic/i));
  const dysphagia = !!(gi.dysphagia || deepHas(p2, /กลืนลำบาก|dysphagia/i));
  const n_v = !!(gi.nausea || gi.vomit || deepHas(p2, /คลื่นไส้|อาเจียน|nausea|vomit/i));
  const hypotension = !!(circ.bpLow || deepHas(p2, /BP\s*ต่ำ|hypotension/i));
  const systolicDrop30 = !!deepHas(p2, /(systolic.*30)|ลดลง.*30/i);
  const tachy = !!(circ.hrHigh || deepHas(p2, /HR\s*สูง|tachy/i));
  const spo2 = deepFindNumber(p2, /spo2/i); // % ถ้าพบ

  // หน้า 3 (lab)
  const WBC = getPath(p3, "cbc.wbc") ?? deepFindNumber(p3, /^wbc$/i);
  const neutPct = getPath(p3, "cbc.neutrophilPct") ?? deepFindNumber(p3, /neutro.*%/i);
  const eosPct  = getPath(p3, "cbc.eosinophilPct") ?? deepFindNumber(p3, /eosinoph.*%/i);
  const AST = getPath(p3, "lft.ast") ?? deepFindNumber(p3, /^ast$/i);
  const ALT = getPath(p3, "lft.alt") ?? deepFindNumber(p3, /^alt$/i);
  const Cr  = getPath(p3, "rft.creatinine") ?? deepFindNumber(p3, /creat/i);
  const uaProtein = deepHas(p3, /ua.*protein|urinalysis.*protein/i);
  const troponinI = deepFindNumber(p3, /troponin.?i/i);
  const troponinT = deepFindNumber(p3, /troponin.?t/i);

  return {
    shapes, colors, blisters, borders, itch, pain, swelling, peeling,
    onset, symmetry, positions, fever,
    wheeze, dyspnea, diarrhea, abdCramp, dysphagia, n_v, hypotension, systolicDrop30, tachy,
    spo2, WBC, neutPct, eosPct, AST, ALT, Cr, uaProtein, troponinI, troponinT
  };
}

/* เช็คช่วงเวลาเริ่มอาการ */
function onsetIn(onset, arrStr){
  return arrStr.some(s => onset.includes(s));
}

/* ---------- RULES ---------- */
window.brainRules = window.brainRules || {};

/* Urticaria */
window.brainRules.urticaria = {
  title: "Urticaria",
  score: function (d) {
    const n = norm(d);
    let s = 0;
    s += scoreIf(includesAny(n.shapes, ["ตุ่มนูน"]), 4);
    s += scoreIf(includesAny(n.shapes, ["ปื้นนูน"]), 4);
    s += scoreIf(n.itch.includes("คัน"), 4);
    s += scoreIf(includesAny(n.borders, ["ขอบหยัก"]), 3);
    s += scoreIf(includesAny(n.colors, ["แดง"]), 3);
    s += scoreIf(includesAny(n.colors, ["แดงซีด"]), 3);
    s += scoreIf(includesAny(n.colors, ["ซีด"]), 3);
    s += scoreIf(includesAny(n.shapes, ["วงกลม"]), 2);
    s += scoreIf(n.swelling.includes("บวม"), 2);
    s += scoreIf(onsetIn(n.onset, ["ภายใน 1 ชั่วโมง"]), 1);
    s += scoreIf(includesAny(n.positions, ["ทั่วร่างกาย","มือ","เท้า","แขน","ขา","หน้า","รอบดวงตา","ลำคอ"]), 1);
    return s;
  }
};

/* Anaphylaxis (มี Gate) */
window.brainRules.anaphylaxis = {
  title: "Anaphylaxis",
  score: function (d) {
    const n = norm(d);
    const onsetOk = onsetIn(n.onset, ["ภายใน 1 ชั่วโมง","1–6 ชั่วโมง","1-6 ชั่วโมง"]);
    const hasSkin = includesAny(n.shapes, ["ตุ่มนูน","ปื้นนูน"]) || includesAny(n.colors, ["แดง"]) || n.swelling.includes("บวม");
    const respProb = n.wheeze || n.dyspnea || (n.spo2 != null && n.spo2 < 94);
    const circProb = n.hypotension || n.systolicDrop30;
    const giProb = n.diarrhea || n.abdCramp || n.n_v || n.dysphagia;

    // Criteria:
    const c1 = hasSkin && (respProb || circProb);
    const c2 = ([hasSkin, respProb, circProb, giProb].filter(Boolean).length >= 2);
    const c3 = (n.hypotension || n.systolicDrop30);
    const passGate = onsetOk && (c1 || c2 || c3);
    if (!passGate) return 0;

    let s = 0;
    s += scoreIf(n.wheeze, 4);
    s += scoreIf(n.dyspnea, 4);
    s += scoreIf(n.diarrhea, 2);
    s += scoreIf(n.abdCramp, 2);
    s += scoreIf(n.dysphagia, 2);
    s += scoreIf(n.n_v, 2);
    s += scoreIf(n.hypotension, 3);
    s += scoreIf(n.systolicDrop30, 4);
    s += scoreIf(n.tachy, 2);
    s += scoreIf(n.spo2 != null && n.spo2 < 95, 1);
    s += scoreIf(hasSkin, 2);
    return s;
  }
};

/* Angioedema */
window.brainRules.angioedema = {
  title: "Angioedema",
  score: function (d) {
    const n = norm(d);
    let s = 0;
    s += scoreIf(n.swelling.includes("บวม"), 4);
    s += scoreIf(includesAny(n.shapes, ["นูนหนา"]), 4);
    s += scoreIf(includesAny(n.positions, ["ริมฝีปาก","รอบดวงตา"]), 4);
    s += scoreIf(includesAny(n.colors, ["สีผิวปกติ"]), 3);
    s += scoreIf(includesAny(n.shapes, ["ตึง"]), 3);
    s += scoreIf(n.itch.includes("ไม่คัน"), 2);
    s += scoreIf(n.itch.includes("คัน"), 2);
    s += scoreIf(includesAny(n.borders, ["ขอบไม่ชัดเจน"]), 2);
    s += scoreIf(includesAny(n.positions, ["ลิ้น"]), 2);
    s += scoreIf(n.pain.includes("ปวด"), 1);
    s += scoreIf(n.pain.includes("แสบ"), 1);
    s += scoreIf(onsetIn(n.onset, ["ภายใน 1 ชั่วโมง"]), 1);
    s += scoreIf(includesAny(n.positions, ["อวัยวะเพศ"]), 1);
    s += scoreIf(includesAny(n.colors, ["แดง"]), 1);
    return s;
  }
};

/* Maculopapular rash (เตือนให้พิจารณา DRESS/SJS/TEN/AGEP ด้วย) */
window.brainRules.mp_rash = {
  title: "Maculopapular rash",
  score: function (d) {
    const n = norm(d);
    let s = 0;
    s += scoreIf(includesAny(n.colors, ["แดง"]), 4);
    s += scoreIf(includesAny(n.shapes, ["จุดเล็กแดง"]), 4);
    s += scoreIf(includesAny(n.shapes, ["ปื้นแดง"]), 4);
    s += scoreIf(includesAny(n.shapes, ["ตุ่มนูน"]), 3);
    s += scoreIf(n.symmetry.includes("สมมาตร"), 2);
    s += scoreIf(n.itch.includes("คัน"), 3);
    s += scoreIf(onsetIn(n.onset, ["ภายใน 1 ชั่วโมง","1-6 ชั่วโมง","1–6 ชั่วโมง","6-24 ชั่วโมง","1 สัปดาห์","2 สัปดาห์"]), 1);
    s += scoreIf(includesAny(n.positions, ["ลำตัว","แขน","ใบหน้า","ลำคอ"]), 1);
    s += scoreIf(deepHas(d.page2||{}, /ไข้|temp/i) || deepHas(d.page1||{}, /ไข้/i), 1);
    s += scoreIf(deepHas(d.page2||{}, /ต่อมน้ำเหลือง/i), 1);
    s += scoreIf(deepHas(d.page2||{}, /ข้ออักเสบ/i), 1);
    s += scoreIf(deepHas(d.page2||{}, /ไตอักเสบ/i), 1);
    s += scoreIf(deepHas(d.page2||{}, /ตับอักเสบ/i), 1);
    return s;
  }
};

/* Fixed Drug Eruption */
window.brainRules.fde = {
  title: "Fixed drug eruption",
  score: function (d) {
    const n = norm(d);
    let s = 0;
    s += scoreIf(includesAny(n.shapes, ["วงกลม"]), 3);
    s += scoreIf(includesAny(n.shapes, ["วงรี"]), 2);
    s += scoreIf(includesAny(n.colors, ["แดง"]), 3);
    s += scoreIf(n.peeling.includes("หลุดลอกตรงกลาง"), 4);
    s += scoreIf(includesAny(n.colors, ["ม่วง"]), 4);
    s += scoreIf(includesAny(n.colors, ["ดำ","คล้ำ"]), 3);
    s += scoreIf(n.swelling.includes("บวม"), 3);
    s += scoreIf(includesAny(n.blisters, ["เล็ก"]), 2);
    s += scoreIf(includesAny(n.blisters, ["กลาง"]), 2);
    s += scoreIf(includesAny(n.blisters, ["ใหญ่"]), 2);
    s += scoreIf(n.pain.includes("เจ็บ"), 3);
    s += scoreIf(n.pain.includes("แสบ"), 3);
    s += scoreIf(n.pain.includes("ตึง"), 3);
    s += scoreIf(deepHas(d.page2||{}, /ไข้/i), 1);
    s += scoreIf(deepHas(d.page2||{}, /คลื่นไส้|อาเจียน/i), 1);
    s += scoreIf(deepHas(d.page2||{}, /ปวดเมื่อย/i), 1);
    s += scoreIf(n.itch.includes("คัน"), 1);
    s += scoreIf(onsetIn(n.onset, ["1 สัปดาห์","2 สัปดาห์"]), 1);
    s += scoreIf(includesAny(n.borders, ["ขอบเรียบ"]), 2);
    s += scoreIf(includesAny(n.positions, ["ริมฝีปาก"]), 3);
    s += scoreIf(includesAny(n.positions, ["หน้า","มือ","เท้า","แขน","ขา","อวัยวะเพศ"]), 1);
    s += scoreIf(includesAny(n.positions, ["ตำแหน่งเดิม"]), 2);
    return s;
  }
};

/* AGEP */
window.brainRules.agep = {
  title: "AGEP",
  score: function (d) {
    const n = norm(d);
    let s = 0;
    s += scoreIf(includesAny(n.shapes, ["ตุ่มหนอง"]), 4);
    s += scoreIf(includesAny(n.shapes, ["ปื้นแดง"]), 3);
    s += scoreIf(deepHas(d.page2||{}, /ไข้/i), 2);
    s += scoreIf(includesAny(n.colors, ["แดง","เหลือง"]), 3);
    s += scoreIf(n.swelling.includes("บวม"), 1);
    s += scoreIf(n.pain.includes("เจ็บ"), 1);
    s += scoreIf(n.itch.includes("คัน"), 1);
    s += scoreIf(includesAny(n.colors, ["จ้ำเลือด"]), 1);
    s += scoreIf(includesAny(n.blisters, ["เล็ก","กลาง","ใหญ่"]), 1);
    s += scoreIf(n.WBC != null && n.WBC > 11000, 1);
    s += scoreIf(n.neutPct != null && n.neutPct > 75, 1);
    s += scoreIf(onsetIn(n.onset, ["ภายใน 1 ชั่วโมง","1-6 ชั่วโมง","6-24 ชั่วโมง","1 สัปดาห์","2 สัปดาห์","3 สัปดาห์"]), 1);
    s += scoreIf(includesAny(n.shapes, ["แห้ง","ลอก","ขุย"]), 1);
    s += scoreIf(includesAny(n.positions, ["หน้า"]), 1);
    s += scoreIf(includesAny(n.positions, ["รักแร้","ขาหนีบ"]), 2);
    s += scoreIf(includesAny(n.positions, ["ทั่วร่างกาย"]), 1);
    return s;
  }
};

/* SJS (Gate: peeling ≤10% BSA) */
window.brainRules.sjs = {
  title: "SJS",
  score: function (d) {
    const n = norm(d);
    const gate = n.peeling.includes("ไม่เกิน 10%") || n.peeling.includes("≤10");
    if (!gate) return 0;
    let s = 0;
    s += scoreIf(includesAny(n.colors, ["แดง"]), 2);
    s += scoreIf(includesAny(n.colors, ["ดำ","คล้ำ"]), 3);
    s += scoreIf(includesAny(n.colors, ["เทา"]), 1);
    s += scoreIf(includesAny(n.shapes, ["พอง","ตุ่มน้ำ"]), 2);
    s += scoreIf(n.peeling.includes("ไม่เกิน 10%"), 4);
    s += scoreIf(includesAny(n.shapes, ["น้ำเหลือง"]), 2);
    s += scoreIf(includesAny(n.shapes, ["สะเก็ด"]), 2);
    s += scoreIf(deepHas(d.page2||{}, /ไข้/i), 1);
    s += scoreIf(deepHas(d.page2||{}, /ปวดเมื่อย|คลื่นไส้|เจ็บคอ|ปวดข้อ|เลือดออก/i), 1);
    s += scoreIf(onsetIn(n.onset, ["ภายใน 1 ชั่วโมง","1-6 ชั่วโมง","6-24 ชั่วโมง","1 สัปดาห์","2 สัปดาห์","3 สัปดาห์"]), 1);
    s += scoreIf(includesAny(n.positions, ["ลำตัว","แขน","ขา","ใบหน้า","มือ","เท้า","ศีรษะ"]), 1);
    return s;
  }
};

/* TEN (Gate: >30% BSA + multi-system แนวคิด) */
window.brainRules.ten = {
  title: "TEN",
  score: function (d) {
    const n = norm(d);
    const gate = n.peeling.includes("เกิน 30%") || n.peeling.includes(">30");
    if (!gate) return 0;

    let systems = 0;
    if (includesAny(n.shapes.concat(n.colors), ["แดง","ม่วง","ดำ","ตุ่มน้ำ","น้ำเหลือง","สะเก็ด"])) systems++;
    if (n.dyspnea || n.wheeze || (n.spo2 != null && n.spo2 < 94)) systems++;
    if (n.diarrhea || n.abdCramp || n.n_v) systems++;
    if (n.hypotension) systems++;
    if (systems < 2) return 0;

    let s = 0;
    s += scoreIf(includesAny(n.colors, ["แดง"]), 2);
    s += scoreIf(includesAny(n.colors, ["ม่วง"]), 2);
    s += scoreIf(includesAny(n.colors, ["ดำ","คล้ำ"]), 3);
    s += scoreIf(includesAny(n.blisters, ["ใหญ่"]), 2);
    s += scoreIf(includesAny(n.shapes, ["น้ำเหลือง"]), 2);
    s += scoreIf(includesAny(n.shapes, ["สะเก็ด"]), 2);
    s += scoreIf(deepHas(d.page2||{}, /ไข้/i), 1);
    s += scoreIf(deepHas(d.page2||{}, /ปวดเมื่อย|คลื่นไส้|เจ็บคอ|ปวดข้อ|เลือดออก/i), 1);
    s += scoreIf(onsetIn(n.onset, ["ภายใน 1 ชั่วโมง","1-6 ชั่วโมง","6-24 ชั่วโมง","1 สัปดาห์","2 สัปดาห์","3 สัปดาห์"]), 1);
    s += scoreIf(includesAny(n.positions, ["ลำตัว","แขน","ขา","ใบหน้า","มือ","เท้า","ศีรษะ","ริมฝีปาก","รอบดวงตา"]), 1);
    s += scoreIf(n.diarrhea, 1);
    s += scoreIf(deepHas(d.page2||{}, /ตับอักเสบ/i) || (n.ALT!=null && n.ALT>=40) || (n.AST!=null && n.AST>=40), 1);
    s += scoreIf(deepHas(d.page2||{}, /ปอดอักเสบ/i) || (n.spo2!=null && n.spo2<94), 1);
    s += scoreIf(deepHas(d.page2||{}, /โลหิตจาง|ซีด/i), 1);
    s += scoreIf(n.spo2!=null && n.spo2<94, 1);
    s += scoreIf((n.ALT!=null && n.ALT>=40) || (n.AST!=null && n.AST>=40), 1);
    s += scoreIf(n.Cr!=null && (n.Cr>=1.5), 1);
    s += scoreIf(n.uaProtein, 1);
    return s;
  }
};

/* DRESS (Gate: timing 2–6wk + skin + systemic/hematologic + organ) */
window.brainRules.dress = {
  title: "DRESS",
  score: function (d) {
    const n = norm(d);
    const timingOK = onsetIn(n.onset, ["2 สัปดาห์","3 สัปดาห์","4 สัปดาห์","5 สัปดาห์","6 สัปดาห์"]);
    const skinOK = includesAny(n.shapes.concat(n.colors), ["MP","maculo","Exfoliative","ตุ่มน้ำ","ตุ่มหนอง","ผื่นแดง","สีแดง","จ้ำเลือด","หลุดลอก","ขุย","ลอก"]);
    const systemicOK = deepHas(d.page2||{}, /ไข้/i) || deepHas(d.page2||{}, /ต่อมน้ำเหลือง/i) || (n.eosPct!=null && n.eosPct>=10);
    const organOK =
      (n.ALT!=null && n.ALT>=40) || (n.AST!=null && n.AST>=40) || deepHas(d.page2||{}, /ตับอักเสบ/i) ||
      (n.Cr!=null && (n.Cr>=1.5 || n.Cr - (d.__baselineCr||0) >= 0.3)) || n.uaProtein || deepHas(d.page2||{}, /ไตอักเสบ|ไตวาย/i) ||
      deepHas(d.page2||{}, /ปอดอักเสบ/i) || (n.spo2!=null && n.spo2<94) ||
      deepHas(d.page2||{}, /กล้ามเนื้อหัวใจอักเสบ/i) || (n.troponinI!=null && n.troponinI>0.04) || (n.troponinT!=null && n.troponinT>0.03) ||
      deepHas(d.page2||{}, /ไทรอยด์อักเสบ/i);

    const pass = timingOK && skinOK && systemicOK && organOK;
    if (!pass) return 0;

    let s = 0;
    s += scoreIf(timingOK, 3);
    s += scoreIf(skinOK, 3);
    s += scoreIf(systemicOK, 3);
    s += scoreIf(organOK, 4);
    return s;
  }
};

/* EM */
window.brainRules.em = {
  title: "Erythema multiforme (EM)",
  score: function (d) {
    const n = norm(d);
    let s = 0;
    s += scoreIf(includesAny(n.shapes, ["ตุ่มนูน"]), 2);
    s += scoreIf(includesAny(n.blisters, ["เล็ก","กลาง","ใหญ่"]), 1);
    s += scoreIf(includesAny(n.colors, ["แดง"]), 3);
    s += scoreIf(includesAny(n.shapes, ["วงกลม 3 ชั้น"]), 30);
    s += scoreIf(includesAny(n.colors, ["แดงซีด"]), 2);
    s += scoreIf(includesAny(n.shapes, ["สะเก็ด"]), 2);
    s += scoreIf(includesAny(n.shapes, ["ขอบวงนูนแดงด้านในซีด"]), 2);
    s += scoreIf(deepHas(d.page2||{}, /ไข้/i), 2);
    s += scoreIf(deepHas(d.page2||{}, /อ่อนเพลีย|ปวดเมื่อย|ปวดข้อ|เจ็บคอ/i), 1);
    s += scoreIf(onsetIn(n.onset, ["ภายใน 1 ชั่วโมง","1-6 ชั่วโมง","6-24 ชั่วโมง","1 สัปดาห์"]), 1);
    s += scoreIf(includesAny(n.positions, ["มือ","เท้า","แขน","ขา","หน้า","ลำคอ"]), 1);
    return s;
  }
};

/* Photosensitivity drug eruption */
window.brainRules.photo = {
  title: "Photosensitivity drug eruption",
  score: function (d) {
    const n = norm(d);
    let s = 0;
    s += scoreIf(includesAny(n.shapes, ["ขอบเขตชัด"]), 3);
    s += scoreIf(includesAny(n.colors, ["แดงไหม้"]), 4);
    s += scoreIf(n.pain.includes("แสบ"), 3);
    s += scoreIf(includesAny(n.blisters, ["เล็ก","กลาง","ใหญ่"]), 1);
    s += scoreIf(includesAny(n.colors, ["ดำ","คล้ำ"]), 1);
    s += scoreIf(includesAny(n.shapes, ["ปื้นแดง"]), 3);
    s += scoreIf(includesAny(n.shapes, ["ลอก","ขุย"]), 2);
    s += scoreIf(includesAny(n.shapes, ["จุดเล็กแดง","แดง"]), 3);
    s += scoreIf(n.itch.includes("คัน"), 3);
    s += scoreIf(includesAny(n.shapes, ["น้ำเหลือง","สะเก็ด"]), 2);
    s += scoreIf(includesAny(n.positions, ["หน้า","หน้าอก","มือ","แขน","ขา"]), 1);
    s += scoreIf(onsetIn(n.onset, ["ภายใน 1 ชั่วโมง","1-6 ชั่วโมง","6-24 ชั่วโมง","1 สัปดาห์"]), 1);
    return s;
  }
};

/* Exfoliative dermatitis */
window.brainRules.exfol = {
  title: "Exfoliative dermatitis",
  score: function (d) {
    const n = norm(d);
    let s = 0;
    s += scoreIf(includesAny(n.colors, ["แดง"]), 3);
    s += scoreIf(includesAny(n.shapes, ["ขุย","แห้ง","ลอก"]), 3);
    s += scoreIf(includesAny(n.colors, ["มันเงา"]), 4);
    s += scoreIf(includesAny(n.shapes, ["น้ำเหลือง","สะเก็ด"]), 3);
    s += scoreIf(n.itch.includes("คัน"), 2);
    s += scoreIf(n.pain.includes("แสบ") || n.pain.includes("เจ็บ"), 1);
    s += scoreIf(includesAny(n.positions, ["ศีรษะ","มือ","เท้า"]), 1);
    s += scoreIf(deepHas(d.page2||{}, /ไข้|หนาวสั่น|อ่อนเพลีย|เบื่ออาหาร|ดีซ่าน|ม้ามโต|ตับโต|ขาบวม/i), 1);
    s += scoreIf(onsetIn(n.onset, ["ภายใน 1 ชั่วโมง","1-6 ชั่วโมง","6-24 ชั่วโมง","1 สัปดาห์","2 สัปดาห์","3 สัปดาห์","4 สัปดาห์"]), 1);
    s += scoreIf(includesAny(n.positions, ["ทั่วร่างกาย"]), 1);
    return s;
  }
};

/* Eczematous drug eruption */
window.brainRules.eczem = {
  title: "Eczematous drug eruption",
  score: function (d) {
    const n = norm(d);
    let s = 0;
    s += scoreIf(includesAny(n.shapes, ["ตุ่มนูน"]), 2);
    s += scoreIf(includesAny(n.colors, ["แดง"]), 3);
    s += scoreIf(includesAny(n.shapes, ["แห้ง","ลอก","ขุย"]), 4);
    s += scoreIf(includesAny(n.shapes, ["ปื้นแดง","ปื้นนูน"]), 2);
    s += scoreIf(includesAny(n.shapes, ["น้ำเหลือง","สะเก็ด"]), 1);
    s += scoreIf(n.itch.includes("คัน"), 3);
    s += scoreIf(onsetIn(n.onset, ["ภายใน 1 ชั่วโมง","1-6 ชั่วโมง","6-24 ชั่วโมง","1 สัปดาห์","2 สัปดาห์","3 สัปดาห์"]), 1);
    s += scoreIf(includesAny(n.positions, ["ลำตัว","แขน","ขา","เท้า","หน้า","ลำคอ"]), 1);
    s += scoreIf(n.symmetry.includes("สมมาตร"), 3);
    return s;
  }
};

/* Bullous Drug Eruption */
window.brainRules.bde = {
  title: "Bullous Drug Eruption",
  score: function (d) {
    const n = norm(d);
    let s = 0;
    s += scoreIf(includesAny(n.blisters, ["เล็ก"]), 2);
    s += scoreIf(includesAny(n.blisters, ["กลาง"]), 4);
    s += scoreIf(includesAny(n.blisters, ["ใหญ่"]), 4);
    s += scoreIf(includesAny(n.colors, ["ใส"]), 4);
    s += scoreIf(includesAny(n.colors, ["แดง"]), 2);
    s += scoreIf(n.pain.includes("เจ็บ"), 3);
    s += scoreIf(n.pain.includes("แสบ"), 3);
    s += scoreIf(onsetIn(n.onset, ["ภายใน 1 ชั่วโมง","1-6 ชั่วโมง","6-24 ชั่วโมง","1 สัปดาห์","2 สัปดาห์","3 สัปดาห์"]), 1);
    s += scoreIf(includesAny(n.positions, ["ลำตัว","แขน","ขา","เท้า"]), 1);
    return s;
  }
};


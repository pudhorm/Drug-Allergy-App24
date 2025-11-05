// brain_page3_hook.js — DROP-IN REPLACEMENT (single binding + debounce + scoped observer)
(function () {
  // ====== singleton guard ======
  if (window.__p3hook_installed__) return;
  window.__p3hook_installed__ = true;

  // ===== utils =====
  function toArabicDigits(str = "") {
    const map = {"๐":"0","๑":"1","๒":"2","๓":"3","๔":"4","๕":"5","๖":"6","๗":"7","๘":"8","๙":"9"};
    return String(str).replace(/[๐-๙]/g, d => map[d]);
  }
  function parseNumber(text) {
    if (text === 0) return 0;
    if (text == null) return null;
    const s = toArabicDigits(String(text)).replace(/,/g, "").trim();
    const m = s.match(/-?\d+(?:\.\d+)?/);
    return m ? Number(m[0]) : null;
  }
  const pick = (root, sel) => root.querySelector(sel);

  // ===== read DOM =====
  function readPage3Dom(root) {
    const groups = [
      { key: "cbc",     items: ["wbc","aec","neut","lymph","atypical","eos","hb","plt"] },
      { key: "lft",     items: ["ast","alt","alp","tbil","dbil"] },
      { key: "rft",     items: ["bun","cre","egfr","uo"] },
      { key: "lung",    items: ["spo2","cxr"] },
      { key: "heart",   items: ["tropi","tropt","ckmb","ekg"] },
      { key: "immuno",  items: ["ige","c3c4"] },
      { key: "ua",      items: ["protein","rbc","wbc","nitrite","le","sg","ph","glucose","ketone"] },
      { key: "electro", items: ["na","k","cl","hco3","ca","mg","phos"] },
    ];
    const data = {};
    for (const g of groups) {
      data[g.key] = {};
      for (const k of g.items) {
        const valEl = pick(root, `input[data-type="value"][data-group="${g.key}"][data-item="${k}"]`);
        const detEl = pick(root,  `input[data-type="detail"][data-group="${g.key}"][data-item="${k}"]`);
        const value  = valEl ? valEl.value : "";
        const detail = detEl ? detEl.value : "";
        data[g.key][k] = { value, detail };
      }
    }
    return data;
  }

  // ===== build facts =====
  function buildFactsFromDom(domData) {
    function v(group, item) {
      const obj = domData[group]?.[item];
      const num = parseNumber(obj?.value ?? obj?.detail ?? null);
      return num;
    }
    function posneg(group, item) {
      const t = (domData[group]?.[item]?.value || domData[group]?.[item]?.detail || "").trim().toLowerCase();
      if (!t) return null;
      if (/(pos|positive|\+|พบ|reactive)/i.test(t)) return true;
      if (/(neg|negative|-|ไม่พบ|non-reactive)/i.test(t)) return false;
      return null;
    }

    const eosAbs = v("cbc","aec");
    const eosPct = v("cbc","eos");
    const wbc    = v("cbc","wbc");
    const plt    = v("cbc","plt");
    const hb     = v("cbc","hb");

    const ast = v("lft","ast");
    const alt = v("lft","alt");
    const alp = v("lft","alp");
    const tb  = v("lft","tbil");
    const db  = v("lft","dbil");

    const bun = v("rft","bun");
    const cr  = v("rft","cre");
    const egfr = v("rft","egfr");
    const uo   = v("rft","uo");

    const spo2 = v("lung","spo2");

    const ige  = v("immuno","ige");

    const uaProtein = (domData.ua?.protein?.value || domData.ua?.protein?.detail || "").trim();
    const uaRbc     = v("ua","rbc");
    const uaWbc     = v("ua","wbc");
    const uaNitrite = posneg("ua","nitrite");
    const uaLE      = posneg("ua","le");

    const flags = {
      eosHigh: (typeof eosAbs === "number" && eosAbs >= 700) || (typeof eosPct === "number" && eosPct >= 10),
      hepatitisPattern: (typeof ast === "number" && ast > 80) || (typeof alt === "number" && alt > 80),
      cholestasisPattern: (typeof alp === "number" && alp > 150) || (typeof db === "number" && db > 0.3),
      akiByCr: (typeof cr === "number" && cr >= 1.5) || (typeof egfr === "number" && egfr < 60),
      lowUO: (typeof uo === "number" && uo < 0.5),
      hypoxemia: (typeof spo2 === "number" && spo2 < 92),
      anemia: (typeof hb === "number" && hb < 11),
      thrombocytopenia: (typeof plt === "number" && plt < 150000),
      leukocytosis: (typeof wbc === "number" && wbc > 11000),
      highIgE: (typeof ige === "number" && ige > 100),

      proteinuria: /\+|[1-9]\d*|[1-9]\d* ?(mg\/dL)/i.test(uaProtein),
      hematuria: typeof uaRbc === "number" && uaRbc > 5,
      pyuria: typeof uaWbc === "number" && uaWbc > 10,
      nitritePos: uaNitrite === true,
      lePos: uaLE === true,
    };

    return {
      raw: { wbc, eosAbs, eosPct, plt, hb, ast, alt, alp, tb, db, bun, cr, egfr, uo, spo2, ige, uaRbc, uaWbc },
      ua:  { protein: uaProtein, nitrite: uaNitrite, le: uaLE },
      flags
    };
  }

  // ===== publish =====
  function publishFactsFromPage3Dom(page3Root) {
    const domData = readPage3Dom(page3Root);
    const facts = buildFactsFromDom(domData);
    const store = (window.drugAllergyData = window.drugAllergyData || {});
    store.facts = store.facts || {};
    store.facts.labs = facts;

    try {
      document.dispatchEvent(new CustomEvent("da:update", { detail:{ source:"page3-hook", ts:Date.now() }}));
    } catch {}

    if (typeof window.saveDrugAllergyData === "function") window.saveDrugAllergyData();
    return facts;
  }

  // ===== binding (single, debounced) =====
  let debTimer = null;
  function queuePublish(page3Root) {
    clearTimeout(debTimer);
    debTimer = setTimeout(() => publishFactsFromPage3Dom(page3Root), 150);
  }

  function bindLiveListeners(page3Root) {
    if (!page3Root || page3Root.__p3hook_bound__) return;
    page3Root.__p3hook_bound__ = true;

    const handler = (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const isLabField =
        (t.matches('input[data-type="value"]') || t.matches('input[data-type="detail"]') || t.matches('input[type="checkbox"]')) &&
        t.closest("#page3");
      if (isLabField) queuePublish(page3Root);
    };
    page3Root.addEventListener("input", handler);
    page3Root.addEventListener("change", handler);

    const saveNextBtn = page3Root.querySelector("#p3-save-next");
    if (saveNextBtn && !saveNextBtn.__p3hook_bound__) {
      saveNextBtn.__p3hook_bound__ = true;
      saveNextBtn.addEventListener("click", () => {
        clearTimeout(debTimer);
        publishFactsFromPage3Dom(page3Root); // flush once on save-next
      });
    }
  }

  // ===== watch re-render (scoped to #page3 only) =====
  let mo = null;
  function ensureObserver() {
    if (mo) return;
    mo = new MutationObserver(() => {
      const page3 = document.getElementById("page3");
      if (page3) bindLiveListeners(page3);
    });
    const anchor = document.getElementById("page3") || document.body;
    // เฝ้าแค่ระดับที่จำเป็น ไม่เฝ้า subtree ทั้งเอกสาร
    mo.observe(anchor.parentElement || document.body, { childList: true });
  }

  // ===== init =====
  function init() {
    const page3 = document.getElementById("page3");
    if (page3) {
      bindLiveListeners(page3);
      // compute ครั้งแรกแบบเบาๆ
      queuePublish(page3);
    }
    ensureObserver();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

*** a/pageTypeADR.js
--- b/pageTypeADR.js
@@
   window.renderPageTypeADR = function () {
     const root = document.getElementById("pageTypeADR");
     if (!root) return;
 
     root.innerHTML = `
       <div class="pType-wrapper">
         <h2 class="pType-title">🧩 Type of ADR (Rawlins & Thompson)</h2>
 
         <div class="pType-grid">
           ${cardHTML("A","Type A — dose-related (Augmented)","typeA")}
           ${cardHTML("B","Type B — non-dose-related (Bizarre)","typeB")}
           ${cardHTML("C","Type C — dose-related & time-related (Chronic)","typeC")}
           ${cardHTML("D","Type D — time-related (Delayed)","typeD")}
           ${cardHTML("E","Type E — withdrawal (End of use)","typeE")}
           ${cardHTML("F","Type F — unexpected failure of therapy (Failure)","typeF")}
         </div>
-
-        <div class="pType-result" id="pTypeResult">
-          <h4>ผลที่เลือก</h4>
-          <div class="pType-selected" id="pTypeSelected">
-            <span class="pType-chip">ยังไม่ได้เลือก</span>
-          </div>
-        </div>
-
-        <div class="pType-actions">
-          <button class="pType-confirm-btn" id="pTypeConfirm">กดยืนยันผล</button>
-        </div>
       </div>
-
-      <div class="pType-toast" id="pTypeToast" role="alert" aria-live="polite"></div>
     `;
 
     // ---------- hooks ----------
     const checkboxes = root.querySelectorAll('.pType-option input[type="checkbox"]');
-    const selectedBox = root.querySelector("#pTypeSelected");
-    const confirmBtn = root.querySelector("#pTypeConfirm");
-    const toast = root.querySelector("#pTypeToast");
@@
       };
       cb.addEventListener("change", onChange);
     });
@@
     function onChange() {
       Object.values(mapCodeToEls).forEach(({ input, card }) => {
         if (!card) return;
         card.classList.toggle("is-selected", !!input.checked);
       });
-      renderSelected();
     }
 
-    function renderSelected() {
-      const chosen = getChosen();
-      if (!chosen.length) {
-        selectedBox.innerHTML = `<span class="pType-chip">ยังไม่ได้เลือก</span>`;
-        return;
-      }
-      selectedBox.innerHTML = chosen.map((c) =>
-        `<span class="pType-chip">${codeToFull(c)}</span>`
-      ).join(" ");
-    }
-
     function getChosen() {
       const arr = [];
       ["A","B","C","D","E","F"].forEach((c)=>{
         const el = mapCodeToEls[c];
         if (el?.input?.checked) arr.push(c);
       });
       return arr;
     }
@@
-    function showToast(kind, msg) {
-      toast.classList.remove("success","danger","show");
-      void toast.offsetWidth;
-      toast.textContent = msg;
-      toast.classList.add(kind === "success" ? "success" : "danger","show");
-      setTimeout(()=>toast.classList.remove("show"),2200);
-    }
-
-    // Logic ของปุ่มยืนยันตามที่กำหนด
-    confirmBtn.addEventListener("click", () => {
-      const chosen = getChosen();
-      const hasB = chosen.includes("B");
-      const hasOthers = chosen.some((c)=>c!=="B");
-
-      if (hasB && !hasOthers) {
-        showToast("success","✅ ได้ Type B — ทำต่อหน้าถัดไปได้");
-      } else if (!chosen.length) {
-        showToast("danger","โปรดเลือกอย่างน้อย 1 ประเภทก่อน");
-      } else {
-        showToast("danger","⚠️ ไม่ใช่ Type B — ไม่ทำต่อหน้าถัดไป");
-      }
-    });
   };

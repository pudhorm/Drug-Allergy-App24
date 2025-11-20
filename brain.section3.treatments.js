// ===================== brain.section3.treatments.js (REPLACE WHOLE FILE) =====================
// ฐานข้อมูล "แนวทางการรักษาเฉพาะตามชนิดการแพ้" สำหรับหน้า 6 ส่วนที่ 3
// เก็บเป็นข้อความยาวต่อ 1 ADR (ใช้ข้อความตามที่ผู้ใช้ให้มาแบบไม่ปรับเปลี่ยน)
// ADR ที่ยังไม่มีรายละเอียดจากผู้ใช้ เติมจากแนวเวชปฏิบัติทางการแพทย์ปัจจุบัน

(function () {
  const tx = {
    // 1) Urticaria
    "Urticaria": {
      label: "Urticaria",
      text: `urticaria
Acute urticaria
Treatment
1) ประเมินทันที
•	คัดกรอง anaphylaxis ทุกเคส (ความดันตก หายใจลำบาก เสียงแหบ กลืนลำบาก/คอบวม อาเจียนมาก/ปวดท้องบิด)
•	True allergy และ Pseudoallergy ต้องรักษาแบบเดียวกัน เพราะความรุนแรงเท่าๆกัน
2) การรักษาหลักเมื่อ ไม่มี anaphylaxis
•	ให้ H1 antihistamine รุ่นที่ 2 (non-sedating) เป็น “ตัวแรกและให้ทุกวัน” ไม่ใช่เฉพาะเวลามีผื่น
•	ตัวเลือกที่ใช้บ่อย: cetirizine 10 mg/d, levocetirizine 5 mg/d, loratadine 10 mg/d, fexofenadine 120–180 mg/d
•	ถ้าอาการยังรบกวนมาก → ชั่วคราว “เพิ่มขนาด” (up-dose) ได้ถึง 2–4 เท่า ของขนาดมาตรฐานในผู้ใหญ่ (เช่น cetirizine 20–40 mg/วัน แบ่งให้) 
•	จนกว่าคุมอาการอยู่ จากนั้นค่อย ๆ ลดลง 
•	ใช้เมื่อผื่นมาก/บวมมาก/ทรมานหรือไม่ตอบสนองต่อ antihistamine: prednisolone 0.3–1 mg/kg/d ไม่เกิน 5–10 วัน แล้วหยุด (หลีกเลี่ยงใช้ต่อเนื่อง/ซ้ำบ่อย)
•	หลีกเลี่ยงตัวกระตุ้น: NSAIDs/แอลกอฮอล์/ความร้อนสูง/แรงกด/ออกแรงมาก; ค้นหาสาเหตุชัดเจน (ยา อาหาร การติดเชื้อ แมลงต่อย)
หมายเหตุ: แนวทางสากลปัจจุบัน ไม่แนะนำให้ใช้ H2 blocker หรือ first-gen H1 เป็นประจำ (ง่วง/anticholinergic) ยกเว้นกรณีใช้ในผู้ที่คันมากตอนกลางคืน

Chronic urticaria
Treatment
STEP 1 — การรักษาหลัก
•	H1 antihistamine รุ่นที่ 2 ขนาดมาตรฐานทุกวัน (เช่นข้างต้น)
•	ประเมินผล 2–4 สัปดาห์
STEP 2 — เพิ่มขนาด (updosing)
•	ถ้ายังไม่สงบ → เพิ่มขนาด H1 รุ่นที่ 2 ได้สูงสุด “4 เท่า” ของขนาดมาตรฐาน (ปรับแบบไล่ระดับ)
•	ตัวอย่างผู้ใหญ่:
o	cetirizine 20–40 mg/วัน
o	fexofenadine 240–720 mg/วัน แบ่ง 1–2 ครั้ง
o	loratadine 20–40 mg/วัน
o	จากนั้น คงขนาดที่ควบคุมได้ “ไล่ลดทีละขั้น” (taper) เดือนละครึ่งโดส/สัปดาห์ แล้วเฝ้าระวังอาการกลับเป็นซ้ำ
การ taper ตามบทความปฏิบัติ 2025: เมื่อควบคุมได้ดี น้ำหนักยาเกินมาตรฐาน ให้ลดทีละ 1 เม็ด/เดือน หรือครึ่งโดส/สัปดาห์ 
STEP 3 — ชีววัตถุ (Biologic)
•	Omalizumab (anti-IgE) มาตรฐาน 300 mg SC ทุก 4 สัปดาห์ เป็น add-on เมื่อ up-dose H1 แล้วคุมไม่ได้
o	ผู้ป่วยบางรายอาจต้อง “ปรับสูงสุด” ได้ถึง 600 mg ทุก 2 สัปดาห์ ดูการตอบสนองใน 6 เดือน ก่อนสรุปว่าผลการรักษา
STEP 4 — ยากดภูมิ (add-on หลัง omalizumab)
•	Cyclosporine 3–5 mg/kg/day (มักเริ่มราว 3 mg/kg/day) ร่วมกับ H1 รุ่นที่ 2 ใช้เมื่อไม่ตอบสนองต่อ H1 (4×) + omalizumab`,
    },

    // 2) Angioedema
    "Angioedema": {
      label: "Angioedema",
      text: `Angioedema
Histamine-mediated Angioedema  (*** เกิด Anaphylaxis)
Treatment
1) ประเมินทันที
•	คัดกรอง anaphylaxis ทุกเคส (ความดันตก หายใจลำบาก เสียงแหบ กลืนลำบาก/คอบวม อาเจียนมาก/ปวดท้องบิด)
2) First-line: H1 antihistamines เช่น Cetirizine 10 mg วันละครั้ง (ถ้าอาการมาก → เพิ่มได้ถึง 20–40 mg/วัน ชั่วคราว) Chlorpheniramine 10–20 mg ทุก 4–6 ชม. IV / IM ให้ต่อเนื่องจนกว่าบวม/ผื่นยุบทั้งหมด — โดยทั่วไป 3–5 วัน, หากยังมีอาการ → ให้ต่อถึง 7–10 วัน
แนะนำในกรณีบวมมาก : Corticosteroids ลดการอักเสบ / ป้องกัน recurrence เช่น Prednisolone 0.5–1 mg/kg/day (30–60 mg/day ในผู้ใหญ่) PO 3–5 วัน แล้ว taper
•	หลีกเลี่ยงยากระตุ้นเพิ่มเติม: NSAIDs, opioids, แอลกอฮอล์
Bradykinin-mediated Angioedema (*** ไม่เกิด Anaphylaxis)
Treatment
•	ห้ามใช้ antihistamine / steroid / adrenaline เดี่ยว ๆ เพราะไม่ตอบสนองใน bradykinin type
•	non-IgE, non-mast cell reaction → จึงไม่พบ anaphylaxis
•	Fresh Frozen Plasma (FFP) มี C1 esterase inhibitor และ kininase II ช่วยสลาย bradykinin 2 unit IV infusion ครั้งเดียว (ซ้ำได้ 1 ครั้ง ถ้าไม่ดีขึ้น ภายใน 4–6 ชม.) ประมาณ 10 mL/min ใน 10 นาทีแรก เพื่อสังเกต reaction → ถ้าไม่มีอาการ ค่อยๆ เพิ่มได้ถึง 30–50 mL/min ตามความดันและภาวะหัวใจของผู้ป่วยให้หมดภายใน 30–60 นาทีต่อ 1 unit (โดยทั่วไป 2 unit จะใช้เวลารวม ประมาณ 1–1.5 ชั่วโมง)`,
    },

    // 3) Anaphylaxis
    "Anaphylaxis": {
      label: "Anaphylaxis",
      text: `Anaphylaxis
1: Epinephrine (Adrenaline) IM 
•	ขนาดยา aqueous epinephrine 1:1000 (1 มก./1 มล.) 0.01 มก./กก. หรือ 0.01 มล./กก. ฉีดเข้าชั้นกล้ามเนื้อ
•	โดยขนาดยาสูงสุดที่ให้ คือ 0.3 มล. ในเด็ก หรือ 0.2–0.5 มล. ในผู้ใหญ่
•	หากมีน้ำหนักตัวอยู่ในเกณฑ์ปกติหรือคนท้อง ควรพิจารณาให้ขนาด 0.3 มล.
•	ถ้าผู้ป่วยมีอาการรุนแรงและไม่ตอบสนองต่อการให้ยาครั้งแรก สามารถให้ซ้ำได้อีก 1–2 ครั้งทุก 5–15 นาที
2.β₂-agonist พ่น/neb (salbutamol) 
•	ถ้ามีหลอดลมหดเกร็ง/หอบหืดกำเริบร่วม
•	salbutamol solution (5 มก./1 มล.) 0.03 มล./กก./ครั้ง พ่นผ่าน nebulizer (ขนาดสูงสุดไม่เกิน 5 มก./ครั้ง)
3.H1-antihistamine (อาการผิวหนังคัน/ลมพิษ): ให้ต่อเนื่อง 3-5 วัน
•	Diphenhydramine 25–50 mg IV/IM ช่วยเรื่องผื่น/คัน 
4.H2-blocker (famotidine 20 mg IV/PO) มีฤทธิ์ช่วยลดการขยายตัวของหลอดเลือด ลดอาการปวดศีรษะ และลดความดันโลหิตต่ำ
•	จึงแนะนำให้ใช้ยาทั้งสองกลุ่มร่วมกัน***
5.คอร์ติโคสเตียรอยด์ (พิจารณาในรายอาการมาก/บวมทางเดินหายใจ/เสี่ยง biphasic):
•	Hydrocortisone 100 mg IV แล้วต่อ Prednisolone 40–50 mg PO อีก 2–3 วัน
6.Glucagon (เฉพาะผู้ใช้ β-blocker และ ไม่ตอบสนองต่อ adrenaline):
•	1–5 mg IV ช้า ๆ (5 นาที) → ต่อด้วย infusion 5–15 µg/นาที ปรับตามความดัน/ชีพจร; ระวังคลื่นไส้อาเจียน
7.Crystalloids (NSS หรือ Ringer’s lactate) 10–20 มล./กก. IV loading ภายใน 5–10 นาที
8.Dopamine 2–20 มคก./กก./นาที IV drip
9.Atropine (ยาที่ใช้ในผู้ป่วยที่ได้รับ β-blocker) 0.5 มก./ครั้ง IV ในผู้ใหญ่ ให้ซ้ำได้ทุก 3–5 นาที (ขนาดสูงสุดรวมไม่เกิน 3 มก. ในผู้ใหญ่)`,
    },

    // 4) Fixed drug eruption
    "Fixed drug eruption": {
      label: "Fixed drug eruption",
      text: `Fixed drug eruption
กรณีอาการไม่รุนแรง / ไม่มีพุพอง / ไม่หลายตำแหน่ง
•	Topical corticosteroid เช่น Betamethasone valerate 0.1% cream หรือ Mometasone furoate 0.1% cream
ทาบาง ๆ วันละ 1–2 ครั้ง บริเวณผื่นแดง / คัน / แสบ 7–10 วัน หรือจนแผลแห้งและรอยเข้มเริ่มจาง
•	Cetirizine 10 mg 1 เม็ด วันละ 1 ครั้ง PO 7–14 วัน (ลดอาการคัน)
กรณีรุนแรง / หลายตำแหน่ง มีตุ่มพอง / แผลถลอกคล้าย SJS
•	Prednisolone 0.5–1 mg/kg/day (ปกติ 30–60 mg/วัน สำหรับผู้ใหญ่) PO วันละครั้ง เช้า 
5–7 วัน → ลดขนาดลงภายใน 1–2 สัปดาห์
•	Methylprednisolone IV (กรณีรุนแรงมาก / รับประทานไม่ได้) 1 mg/kg/day (ปกติ 40–60 mg/วัน) IV OD 3–5 วัน แล้วเปลี่ยนเป็น prednisolone PO taper`,
    },

    // 5) Maculopapular rash
    "Maculopapular rash": {
      label: "Maculopapular rash",
      text: `MP rash
1.หยุดยาที่สงสัยทันที 
•	เป็นการรักษาที่สำคัญที่สุด
•	ผื่นจะเริ่มดีขึ้นภายใน 48–72 ชม. และหายภายใน 1–2 สัปดาห์
2.ประเมินความรุนแรงและสัญญาณเตือนของ SCARs (Severe Cutaneous Adverse Reactions)
ถ้าผู้ป่วยมี ≥ 1 ข้อต่อไปนี้ → ต้องประเมิน SCARs ทันที
•	ไข้ ≥38°C
•	Eosinophil ≥700 /µL
•	LFT >2X ULN หรือ Cr >1.5X baseline
•	เจ็บผิว หรือเยื่อบุพอง
•	ใบหน้า–ตาบวม
3.H1-antihistamine บรรเทาคัน ให้ 7–14 วัน หรือจนกว่าผื่นหาย
▪ Cetirizine 10 mg วันละครั้ง 
▪ Loratadine 10 mg วันละครั้ง 
▪ Hydroxyzine 25 mg วันละ 1–2 ครั้ง (ถ้าคันมาก)
4.1 Topical corticosteroid (Mild – moderate; ผื่นและอาการคันไม่มาก)
เพื่อลดอักเสบ / แดง / คัน ให้ 7–10 วัน
▪ Betamethasone valerate 0.1% cream วันละ 1–2 ครั้ง 
▪ Mometasone furoate 0.1% cream วันละครั้ง 
▪ Hydrocortisone 1% (ใช้บริเวณหน้า/อวัยวะเพศ)
4.2 systemic corticosteroid (Severe: ผื่นทั่วร่างกายและมีอาการคันมาก)
•	Prednisolone 0.5–1 mg/kg/day (ปกติ 30–60 mg/วัน) PO เช้า ใช้ 3–5 วัน แล้ว taper ลงภายใน 1–2 สัปดาห์ ถ้าผื่นดีขึ้น
5.ยาลดไข้
•	Paracetamol 500 mg ทุก 6 ชม. (สูงสุด 4 g/วัน)`,
    },

    // 6) AGEP
    "AGEP": {
      label: "AGEP",
      text: `AGEP
Treatment
1.หยุดยาที่สงสัยทันที 
2.ยาลดไข้
•	Paracetamol 500 mg ทุก 6 ชม. (สูงสุด 4 g/วัน)
3.ให้ สารน้ำและอิเล็กโทรไลต์ หากมีการสูญเสียของเหลวจากผิวหนังหรือมีไข้สูง
4.ใช้ oral antihistamines เพื่อบรรเทาคันให้ 7–14 วัน หรือจนผื่นหาย
•	Cetirizine 10 mg วันละครั้ง PO หลังอาหารเย็น 
•	Loratadine 10 mg วันละครั้ง PO หลังอาหาร 
Hydroxyzine 25 mg วันละ 2–3 ครั้ง (สูงสุด 100 mg/วัน) PO ถ้าคันมาก
5.ใช้ emollients / moisturisers เพื่อบำรุงผิวที่ลอกและลดการระคายเคือง
6.ใช้ topical corticosteroids (Mild – moderate symptom)
•	Medium potency Betamethasone valerate 0.1%, Mometasone 0.1%, Triamcinolone 0.1%
ทาบาง ๆ วันละ 1–2 ครั้ง 7–14 วัน
•	Low potency (ใบหน้า/รอยพับ) Hydrocortisone 1% cream วันละ 2 ครั้ง 7 วัน
7. พิจารณาเริ่ม systemic corticosteroid → ถ้ามี ≥ 1 ใน 4 เกณฑ์ ข้างต้น (ไม่ใช่ first-line สำหรับ AGEP ทุกราย)
1) พิจารณาเฉพาะรายที่มี organ involvement (ตับ/ไต/ปอด/หัวใจ) 
2) ผื่นลอก, ตุ่มหนองทั่วตัวมาก, ผื่นแดงทั่วตัว > 50 % BSA 
3) อ่อนเพลียมาก รับประทานไม่ได้, WBC > 12,000 /µL, ไข้สูง > 38.5 °C นาน > 3 วัน 
4) ผื่นหรือตุ่มหนองเพิ่มขึ้นต่อเนื่อง (ไม่ดีขึ้นหลังหยุดยา 48–72 ชม.)
•	Prednisolone 0.5 mg/kg/day PO 3–5 วัน → taper ลงใน 7 วันเมื่อผื่นดีขึ้น`,
    },

    // 7) Exfoliative dermatitis
    "Exfoliative dermatitis": {
      label: "Exfoliative dermatitis",
      text: `Exfoliative dermatitis
1.หยุดยาที่สงสัยทันที 
2.การดูแลทั่วไป (Supportive care)
•	Hydration & Electrolyte balance ให้ IV fluid (0.9 % NaCl หรือ 5% Dextrose ½ NSS) + ตรวจ electrolyte รายวัน
•	Temperature control ห้องอุ่น (≈ 30 °C) ป้องกัน hypothermia
•	Nutrition เพิ่มพลังงาน 30–35 kcal/kg/day และ protein 1.5 g/kg/day
•	Infection prevention ดูแลความสะอาด เปลี่ยนผ้าปูบ่อย → ถ้าสงสัยติดเชื้อให้ culture ก่อน antibiotic
•	Pruritus ใช้ oral antihistamine เช่น Cetirizine 10 mg HS หรือ Hydroxyzine 25 mg q8h prn
3.ยาทาภายนอก (Topical therapy)
•	Topical steroids: Hydrocortisone 1%, Betamethasone 0.05–0.1%, Mometasone 0.1% 
ทาวันละ 1–2 ครั้ง ทั่วบริเวณแดง แต่หลีกเลี่ยงบริเวณบาง
•	Emollients: Paraffin cream, Petrolatum, Ceramide lotion ทาบาง ๆ ทุก 4–6 ชม. โดยเฉพาะหลังอาบน้ำ
4.ยา Systemic therapy 
ใช้ในรายที่มี อาการรุนแรงหรือ organ involvement (เช่น ตับ/ไต/หัวใจ/ปอด) หรือมี BSA > 90 % / มี leukocytosis เด่น / ไม่ดีขึ้น > 72 ชม. หลังหยุดยา
•	Prednisolone (PO) 0.5–1 mg/kg/day (30–60 mg/day ผู้ใหญ่) ให้จนผื่นดีขึ้น → ค่อย taper ลง ใน 2–3 สัปดาห์
•	Methylprednisolone (IV) 1 mg/kg/day (หรือ 40–60 mg IV OD)
•	Dexamethasone (IV/IM) ขนาดมาตรฐาน: 4–8 mg IV หรือ IM วันละครั้ง (สูงสุด 16 mg/วัน)
ระยะเวลา: 3–5 วัน → taper หรือเปลี่ยนเป็น prednisolone 0.5 mg/kg/day
5.Cyclosporine 2–3 mg/kg/day (บางกรณี resistant case) ใช้ในผู้ป่วย refractory ต่อ steroid`,
    },

    // 8) Photosensitivity drug eruption
    "Photosensitivity drug eruption": {
      label: "Photosensitivity drug eruption",
      text: `Photosensitivity drug eruption
1.หยุดยาที่สงสัยทันที 
2.หลีกเลี่ยงแสงแดดโดยเด็ดขาด ใช้ครีมกันแดด (Broad-spectrum) SPF ≥ 50 ทาซ้ำทุก 2–3 ชม.
3.ยาแก้คัน (Antihistamine) รับประทานวันละ 1 ครั้ง 7–14 วัน หรือตามอาการคัน
- Cetirizine 10 mg/day
- Hydroxyzine 25 mg q8h (ง่วงนอน)
4.ยาทาภายนอก (Topical therapy)
- Medium potency เช่น Betamethasone valerate 0.1%, Mometasone furoate 0.1%, Triamcinolone acetonide 0.1%
ทาบาง ๆ วันละ 1–2 ครั้ง บริเวณผื่น 5–10 วัน
- Low potency steroid (ใบหน้า/คอ) Hydrocortisone 1% cream วันละ 2 ครั้ง 5–7 วัน
5.Emollient / Moisturizer
- Petroleum jelly, Ceramide-based lotion, Aloe vera gel ทาทั่วบริเวณผื่นหลังอาบน้ำ ต่อเนื่องจนผิวกลับสู่ปกติ (2–3 สัปดาห์)
6. ยาสเตียรอยด์ชนิดรับประทาน (Systemic corticosteroid) ใช้เฉพาะกรณี photoallergic reaction ที่ลุกลาม, คันมาก
- Prednisolone (PO) 0.5 mg/kg/day 5–7 วัน taper ลงภายใน 1–2 สัปดาห์`,
    },

    // 9) Bullous Drug Eruption
    "Bullous Drug Eruption": {
      label: "Bullous Drug Eruption",
      text: `Bullous Drug Eruption
Treatment
1.หยุดยาที่สงสัยทันที 
2. ยาทาภายนอก (Topical therapy)
•	Topical corticosteroids : Betamethasone valerate 0.1%, Mometasone 0.1% ทาบาง ๆ วันละ 1–2 ครั้ง 7–10 วัน ลดอักเสบ
Low-potency steroid (ใบหน้า/คอ): Hydrocortisone 1% cream วันละ 2 ครั้ง 5–7 วัน ใช้เฉพาะบริเวณบาง
•	Moisturizer / Emollient Paraffin, Petroleum jelly, Ceramide lotion ทาวันละหลายครั้ง ใช้ต่อเนื่องจนหาย
3.ยา Systemic therapy
•	Prednisolone (PO) 0.5–1 mg/kg/day (30–60 mg/วัน ผู้ใหญ่) 5–7 วัน → taper ภายใน 2 สัปดาห์ ใช้เมื่อผื่นกว้างหรือมีหลายตำแหน่ง
4.Antibiotic (ถ้ามีติดเชื้อ) 
•	Dicloxacillin 500 mg PO q6h × 7 วัน เฉพาะเมื่อมีหนอง/แดง ร้อน/ไข้ WBC ขึ้นสูง
5.Antiseptic compress
•	NSS / Potassium permanganate 0.01% 10–15 นาที วันละ 2–3 ครั้ง ลดการติดเชื้อทุติยภูมิ`,
    },

    // 10) Erythema multiforme
    "Erythema multiforme": {
      label: "Erythema multiforme",
      text: `Erythema multiforme 
1.หยุดยาที่สงสัยทันที 
2.ประเมินภาวะรุนแรง
•	แยกจาก SJS/TEN
•	ถ้ามี mucosal involvement หลายจุด → พิจารณาเป็น EM major
3.Supportive care
•	คัน/อักเสบเล็กน้อย > ยาแก้แพ้: Cetirizine 10 mg PO OD หรือ Chlorpheniramine 4 mg PO q6h
•	ผื่นไม่รุนแรง > ยาทาสเตียรอยด์: Hydrocortisone 1% cream หรือ Triamcinolone 0.1% cream วันละ 2–3 ครั้ง
•	มี mucosal ulcer (ปาก) > น้ำยาบ้วนปากผสมยาชา: Lidocaine viscous 2% 5 mL swish & spit q4h PRN
•	ปวด > Analgesic: Paracetamol 500–1000 mg PO q6h PRN (ไม่เกิน 4 g/day)
•	ให้การดูแลรักษาผู้ป่วยตามอาการ โดยเฉพาะอย่างยิ่งทางด้านโภชนาการและสารน้ำ เพราะผู้ป่วยมักจะมีแผลเจ็บในปากทำให้ทานอาหารได้น้อย
4. Local treatment 
•	Antibiotic eye ointment ป้ายตา หรือใช้ corticosteroid eyedrops
•	ใช้ Vaselin หรือ Glycerin borax ป้ายริมฝีปาก และควรให้ Oral hygiene care
•	บริเวณอวัยวะเพศ ควรทำความสะอาดให้ดี เพราะอาจเป็นต้นเหตุการติดเชื้อทางปัสสาวะ และอาจมีท่อปัสสาวะตีบตันภายหลังได้
•	แผลที่ผิวหนัง ควรทำความสะอาดโดยการประคบ (wet dressing) ด้วย Burow’s solution หรือ normal saline หรือน้ำต้มสุก
5. Systemic treatment
•	Prednisolone 30–60 mg/วัน (0.5 mg/kg/day ) และควรลดลงจนหยุดได้ภายใน 2–4 สัปดาห์`,
    },

    // 11) Eczematous drug eruption
    "Eczematous drug eruption": {
      label: "Eczematous drug eruption",
      text: `Eczematous drug eruption
1.หยุดยาที่สงสัยทันที 
2.การดูแลทั่วไป (Supportive care)
•	Emollient: ทาบ่อยๆ ทุก 2–4 ชม. โดยเฉพาะหลังอาบน้ำ (เลือก petrolatum-based หรือ urea 5–10% หากผิวแห้งมาก)
•	หลีกเลี่ยงสารระคายเคือง: สบู่แรง น้ำหอม ผงซักฟอก; อาบน้ำอุ่นสั้นๆ
•	Compress/soak เมื่อมี exudative eczema
- Burow’s solution (aluminium acetate 1:40) ประคบ 15–20 นาที วันละ 2–3 ครั้ง × 3–5 วัน
- หรือ potassium permanganate 1:10,000 แช่/ประคบวันละ 1–2 ครั้ง × 3–5 วัน
3.ยาทาสเตียรอยด์ (topical corticosteroids)
•	ใบหน้า/รอยพับ/อวัยวะเพศ (ผิวบาง): Hydrocortisone 1% cream/ointment หรือ Desonide 0.05% วันละ 2 ครั้ง 5–7 วัน, จากนั้นลดความถี่/หยุดเมื่อดีขึ้น
•	ลำตัว–แขนขา (ผิวหนาปานกลาง): Triamcinolone acetonide 0.1% วันละ 2 ครั้ง × 7–14 วัน
•	ฝ่ามือ/ฝ่าเท้า หรือผื่นหนา: Clobetasol propionate 0.05% วันละ 1–2 ครั้ง × 1–2 สัปดาห์ (หลีกเลี่ยงในใบหน้า/รอยพับ)
•	เมื่อสงบแล้ว ใช้ “weekend therapy” (ทาเสาร์-อาทิตย์สัปดาห์ละ 2 วัน) อีก 2–4 สัปดาห์ เพื่อลดการกำเริบ
4.ยา systemic therapy (เมื่อผื่นกว้าง, exudative มาก, หรือทาอย่างเดียวเอาไม่อยู่)
•	Prednisolone 0.5 mg/kg/day PO (เช่น 30–40 mg/วันในผู้ใหญ่) × 5–7 วัน, แล้ว taper ลดลงภายใน 1–2 สัปดาห์
•	Antihistamines (คุมคัน/นอนหลับดีขึ้น): กลางวัน: Cetirizine 10 mg PO OD หรือ Loratadine 10 mg PO OD
กลางคืน (ง่วง): Chlorpheniramine 4 mg PO q6h PRN หรือ Hydroxyzine 25 mg PO nocte
5. การติดเชื้อ (เฉพาะเมื่อมีหลักฐานคลินิก)
•	Dicloxacillin 500 mg PO q6h × 5–7 วัน`,
    },

    // 12) DRESS
    "DRESS": {
      label: "DRESS",
      text: `DRESS
1.หยุดยาที่สงสัยทันที 
2.การดูแลทั่วไป (Supportive care)
•	ไข้ ปวดเมื่อย: ยาลดไข้ (หลีกเลี่ยง NSAIDs) Paracetamol 500–1000 mg PO q6h PRN
•	ผื่น คัน: Cetirizine 10 mg OD หรือ Chlorpheniramine 4 mg q6h 
3.1 Systemic Corticosteroid — ยาหลักของการรักษา DRESS
•	Mild (เฉพาะผิวหนัง): Prednisolone 0.5–1 mg/kg/day PO 2–4 สัปดาห์ แล้ว taper ลดลง 6–8 สัปดาห์
•	Moderate–Severe (มี visceral involvement): Prednisolone 1 mg/kg/day PO (เช่น 40–60 mg/day ในผู้ใหญ่) อย่างน้อย 4 สัปดาห์ แล้ว taper ช้าใน 8–12 สัปดาห์
*** ห้ามหยุดยาทันที — ต้อง taper ลงช้าๆ 5–10 mg/สัปดาห์
3.2 IVIG (Intravenous Immunoglobulin) ใช้ในกรณีที่:
•	ไม่ตอบสนองต่อ corticosteroid ภายใน 3–5 วัน
•	มี myocarditis, hepatitis, encephalitis หรือ ตับวาย/หัวใจล้มเหลวรุนแรง (ให้ร่วมกับสเตรียรอยด์ชนิดรับประทาน)
ขนาดยา: 0.4 g/kg/day × 5 วัน (รวม 2 g/kg ต่อคอร์ส)
3.3 Immunosuppressive Agents (ใช้ในรายดื้อ steroid / relapsing DRESS)
•	Cyclosporine 2–3 mg/kg/day PO 2–4 สัปดาห์ (ใช้ร่วมกับ steroid ลดการอักเสบเร็ว)`,
    },

    // 13) SJS
    "SJS": {
      label: "SJS",
      text: `SJS
1.หยุดยาที่สงสัยทันที 
2.การดูแลทั่วไป (Supportive care)
•	สารน้ำ/อิเล็กโทรไลต์: เริ่มที่ 1.5–2.0 mL/kg/%BSA ผิวหนังที่ลอก/วัน หรือ 2–3 L/วัน (ผู้ใหญ่ทั่วไป)
ประเมินตามเป้าหมาย: Urine output ≥0.5–1 mL/kg/h, HR 
ชนิดสารน้ำ: Ringer’s lactate หรือ 0.45% NaCl + 5% Dextrose เป็นหลัก
hypoalbuminemia (
•	โภชนาการ: พลังงาน 30–35 kcal/kg/day, โปรตีน 1.5–2 g/kg/day
กลืนลำบาก → NG feeding ภายใน 24–48 ชม.
•	ดูแลแผลผิวหนัง (แนว burn unit): ทำแผลวันละ 1–2 ครั้ง ด้วย 0.9% NSS หรือ 0.05% Chlorhexidine compress
ปิดแผลด้วย non-adhesive dressing (Jelonet®/paraffin gauze)
•	ยาทาเฉพาะที่เมื่อมีเชื้อแบคทีเรียเฉพาะจุด:
- Mupirocin 2% ointment บาง ๆ BID
- Fusidic acid 2% cream BID
•	ควบคุมปวด/ไข้
- Paracetamol 500–1000 mg PO q6h PRN (สูงสุด 4 g/day)
- ปวดมาก: Morphine 0.05–0.1 mg/kg IV q4h PRN หรือ Fentanyl 25–50 µg IV q1–2h PRN
3.การดูแลเยื่อบุ (Mucosal Care)
•	ตา (จำเป็นต้อง consult จักษุทันที)
o	Artificial tears q1–2h กลางวัน + lubricating ointment ก่อนนอน
o	Antibiotic ointment (เช่น chloramphenicol 1% HS) เมื่อมี risk infection
•	ช่องปาก/ริมฝีปาก: บ้วน 0.9% NSS / benzydamine วันละ 4–6 ครั้ง, ทา petrolatum กันแตก
•	อวัยวะเพศ/ทวารหนัก: petrolatum หรือ hydrocortisone 1% บางๆ BID
4) การป้องกันและรักษาการติดเชื้อ
•	งดยาปฏิชีวนะแบบ prophylaxis หากไม่มีหลักฐานติดเชื้อ
•	ส่ง wound swab/culture, เลือด/ปัสสาวะ เมื่อมีไข้, CRP↑, WBC↑, หนอง/กลิ่นแผล
•	Empiric (เมื่อสงสัย sepsis/แผลติดเชื้อจริง):
o	ตัวอย่าง: Piperacillin-tazobactam 4.5 g IV q6–8h หรือ Cefepime 2 g IV q8–12h ± Vancomycin
o	ปรับตาม culture & sensitivity
5) การรักษาเฉพาะ (Specific Immunomodulatory Therapy)
เริ่มให้ เร็วที่สุดภายใน 48–72 ชม.แรก หลังวินิจฉัย/เริ่มลอกผิว โดยเฉพาะราย SJS-TEN overlap/TEN หรือ SJS ที่มี mucosa หลายตำแหน่ง/อวัยวะภายในเกี่ยวข้อง
5.1 Cyclosporine (แนะนำมากที่สุดใน moderate–severe SJS/TEN)
•	ขนาด: 2–3 mg/kg/day PO แบ่ง BID
•	ระยะเวลา: 7–10 วัน → taper จนครบ 3–4 สัปดาห์
5.2 Corticosteroids
•	SJS (BSA <10%): Prednisolone 0.5–1 mg/kg/day PO 3–7 วัน → taper จบใน 1–2 สัปดาห์
•	SJS–TEN overlap/TEN:
o	IV Methylprednisolone 1–2 mg/kg/day หรือ pulse 500–1000 mg/day × 3 วัน,
o	แล้ว เปลี่ยนเป็น Prednisolone 1 mg/kg/day PO → taper รวมคอร์ส 3–4 สัปดาห์
5.3 IVIG (เมื่อไม่ตอบสนอง/ overlap/TEN กว้าง)
•	ขนาด: 0.4 g/kg/day × 5 วัน (รวม 2 g/kg/คอร์ส`,
    },

    // 14) TEN
    "TEN": {
      label: "TEN",
      text: `TEN
1.หยุดยาที่สงสัยทันที 
2.การดูแลทั่วไป (Supportive care)
•	สารน้ำและไต (Fluid & Renal Support): ใช้ Crystalloid solution เช่น 0.9% Normal Saline หรือ Ringer’s lactate
ตั้งเป้า Urine output ผู้ใหญ่: ≥ 0.5–1 mL/kg/hr, เด็ก: ≥ 1–1.5 mL/kg/hr
•	แผลและผิวหนัง (Wound / Skin Care) ล้างแผล ด้วย 0.9% Normal saline หรือ Chlorhexidine 0.05% (เจือจาง)
•	การติดเชื้อ (Infection Control): ไม่ให้ antibiotic prophylaxis ให้เมื่อมีหลักฐานติดเชื้อเท่านั้น เช่น มีไข้, neutrophilia, wound culture positive
•	ป้องกันลิ่มเลือด (Thrombosis Prophylaxis) ให้ Enoxaparin 40 mg SC once daily
•	โภชนาการ พลังงาน 25–30 kcal/kg/day, โปรตีน 1.5–2 g/kg/day
•	ควบคุมปวด:
•	Mild → Paracetamol 500–1000 mg PO q6h PRN (≤ 4 g/day)
•	Severe → Morphine 2–4 mg IV q3–4h PRN หรือ Fentanyl 25–50 µg IV q1–2h PRN
•	ควบคุมอุณหภูมิห้อง: 28–30 °C เพื่อป้องกัน hypothermia
•	การดูแลตา (Eye Care — ภายใน 24 ชม.)
•	Artificial tears (preservative-free) → Carboxymethylcellulose 0.5% หรือ Hypromellose 0.3% หยอด q1–2h
•	Topical antibiotic/steroid (เฉพาะตามจักษุสั่ง) → Tobramycin-dexamethasone ointment วันละ 2–3 ครั้ง ช่วงสั้น
•	ช่องปาก: Chlorhexidine 0.12% mouthwash วันละ 2–3 ครั้ง
•	อวัยวะเพศ/ทวาร: ทา Vaseline® หรือ Liquid paraffin วันละ 2–3 ครั้ง
3.Cyclosporine (CsA) – แนะนำบ่อย
•	ขนาด: 3–5 mg/kg/วัน แบ่งวันละ 2 ครั้ง
4.Systemic Corticosteroids (ให้เร็ว ระยะสั้น) ตัวเลือกที่ใช้จริง 2 แบบ
1.	Pulse methylprednisolone 500–1,000 mg IV วันละครั้ง × 3 วัน, จากนั้น prednisone 0.5–1 mg/kg/วัน แล้ว taper เร็วใน 1–2 สัปดาห์เมื่อโรคหยุดลุกลาม
2.	Prednisone/Prednisolone 1–2 mg/kg/วัน ระยะสั้น 3–5 วัน แล้ว taper เร็วตามอาการ (ใช้เมื่อไม่สามารถ pulse)
เมื่อไร “ไม่ให้ pulse” หรือควรหลีกเลี่ยง
1.	มีภาวะติดเชื้อ (sepsis / bacteremia / pneumonia) → การกดภูมิรุนแรงจะทำให้เชื้อแพร่กระจายเร็ว
2.	อยู่ในระยะ late phase (ผิวหนังเริ่มหลุดลอกมากแล้ว >30–40% BSA) → ประโยชน์ลดลง เพราะการทำลายผิวหนังเกิดไปแล้ว
5.IVIG (พิจารณาให้ร่วมสเตียรอยด์)
•	ขนาดรวม (total dose): 2 g/kg แบ่งให้ 0.4 g/kg/วัน × 5 วัน หรือ 1 g/kg/วัน × 2 วัน (2–3 วันก็ใช้) ภายใน 3–6 วันแรกของการนอน รพ.`,
    },

    // 15) Hemolytic anemia (เพิ่มจาก guideline)
    "Hemolytic anemia": {
      label: "Hemolytic anemia",
      text: `Hemolytic anemia (Drug-induced)
1.หยุดยาที่สงสัยทันที 
•	เป็นการรักษาหลักของ drug-induced immune hemolytic anemia ส่วนใหญ่จะดีขึ้นภายใน 1–2 สัปดาห์หลังหยุดยา
2.ประเมินความรุนแรง
•	ตรวจ CBC, reticulocyte, LDH, indirect bilirubin, haptoglobin, Coombs test
•	ติดตามสัญญาณชีพ, ปริมาณปัสสาวะ, อาการเหนื่อยหรืออกเจ็บ
3.Supportive care
•	ให้ Packed RBC transfusion เมื่อมีอาการจากภาวะซีด หรือ Hb < 7–8 g/dL (ปรับตาม guideline รพ.)
•	ให้กรดโฟลิกเสริมในราย hemolysis เรื้อรัง
4.Immunosuppressive therapy (กรณี immune-mediated / hemolysis รุนแรง)
•	Prednisolone 1 mg/kg/day PO (หรือเทียบเท่า IV) 1–2 สัปดาห์ แล้ว taper ตามการตอบสนอง
•	พิจารณา IVIG 0.4 g/kg/day × 5 วัน ในรายไม่ตอบสนองต่อ steroid หรือ hemolysis รุนแรงมาก
5.ส่งต่อ/ปรึกษาอายุรแพทย์โลหิตวิทยา
•	กรณี hemolysis รุนแรง, สงสัยภาวะอื่นร่วม (เช่น TTP, HUS) หรือสงสัยต้องใช้ rituximab/การรักษาเฉพาะทาง`,
    },

    // 16) Pancytopenia (เพิ่มจาก guideline)
    "Pancytopenia": {
      label: "Pancytopenia",
      text: `Pancytopenia (Drug-induced bone marrow suppression)
1.หยุดยาที่สงสัยทันที และค้นหาสาเหตุอื่นร่วม (เช่น การติดเชื้อไวรัส, โรคไขกระดูก)
2.ประเมินความรุนแรง
•	CBC, smear, reticulocyte, ค่าไต/ตับ, coagulation profile
•	พิจารณาตรวจ bone marrow หาก pancytopenia ไม่ดีขึ้นหลังหยุดยา หรือสงสัยสาเหตุอื่น
3.Supportive care
•	Transfusion: 
  - Packed RBC เมื่อมีอาการซีดหรือ Hb < 7–8 g/dL
  - Platelet transfusion เมื่อ PLT < 10,000/µL หรือ < 20,000/µL ร่วมกับไข้/หัตถการ หรือมีเลือดออก
•	หลีกเลี่ยงยาที่มีผลต่อเกล็ดเลือดเพิ่ม (NSAIDs, antiplatelet) หากไม่จำเป็น
4.การจัดการภาวะ Neutropenia ใน Pancytopenia
•	ถ้ามี neutrophil < 500/µL หรือมีไข้ร่วม → ให้ broad-spectrum IV antibiotics ทันที ตามแนวทาง febrile neutropenia
•	พิจารณา G-CSF (Filgrastim 5 µg/kg/day SC) ในรายที่มี neutropenia รุนแรงร่วมกับการติดเชื้อหรือเสี่ยงสูง
5.ติดตามใกล้ชิด/ส่งต่อ Hematology
•	ถ้าภาวะ pancytopenia ไม่ดีขึ้นภายใน 1–2 สัปดาห์หลังหยุดยา หรือสงสัย aplastic anemia / MDS`,
    },

    // 17) Neutropenia (เพิ่มจาก guideline)
    "Neutropenia": {
      label: "Neutropenia",
      text: `Neutropenia (Drug-induced)
1.หยุดยาที่สงสัยทันที 
2.จำแนกระดับความรุนแรง
•	Mild: ANC 1,000–1,500/µL
•	Moderate: ANC 500–1,000/µL
•	Severe: ANC < 500/µL (เสี่ยงติดเชื้อสูง)
3.Febrile neutropenia (ANC < 500/µL + ไข้)
•	ให้ broad-spectrum IV antibiotics ทันที โดยไม่รอผลเพาะเชื้อ (เช่น piperacillin-tazobactam, cefepime หรือ carbapenem ตาม guideline รพ.)
•	ให้สารน้ำและดูแลระบบไหลเวียน/หายใจตามความจำเป็น
4.G-CSF (Granulocyte colony-stimulating factor)
•	พิจารณาให้ Filgrastim 5 µg/kg/day SC/IV วันละครั้ง จนกว่า ANC > 1,000–2,000/µL ในรายที่ neutropenia รุนแรงหรือมีการติดเชื้อ
5.หลีกเลี่ยงแหล่งติดเชื้อ
•	แนะนำ strict hand hygiene, หลีกเลี่ยงอาหารดิบ/สุก ๆ ดิบ ๆ, หลีกเลี่ยงคนป่วยติดเชื้อทางเดินหายใจ
6.ติดตาม CBC ซ้ำ
•	ทุก 2–3 วัน หรือถี่กว่านั้นในราย severe neutropenia จนกว่าเม็ดเลือดจะฟื้นตัว`,
    },

    // 18) Thrombocytopenia (เพิ่มจาก guideline)
    "Thrombocytopenia": {
      label: "Thrombocytopenia",
      text: `Thrombocytopenia (Drug-induced)
1.หยุดยาที่สงสัยทันที 
•	โดยเฉพาะ heparin, quinine, sulfonamides, linezolid, rifampin ฯลฯ ตามที่สงสัย
2.ประเมินความเสี่ยงเลือดออก
•	ซักประวัติเลือดออกผิดปกติ (จ้ำเลือด, เลือดกำเดา, เลือดออกเหงือก, ปัสสาวะ/อุจจาระเป็นเลือด)
•	ตรวจ PLT ซ้ำยืนยัน และประเมินค่า PT/INR, aPTT
3.Supportive care
•	หลีกเลี่ยง IM injection และยาที่มีผลต่อเกล็ดเลือด (aspirin, NSAIDs, clopidogrel ฯลฯ)
•	Platelet transfusion:
  - PLT < 10,000/µL แม้ไม่มีเลือดออก
  - PLT < 20,000–30,000/µL ร่วมกับไข้/ติดเชื้อ หรือมีเลือดออกเล็กน้อย
  - เลือดออกรุนแรง/ต้องผ่าตัด → transfuse ตาม guideline
4.กรณีสงสัย immune thrombocytopenia จากยา (DITP)
•	Prednisolone 1 mg/kg/day PO 1–2 สัปดาห์ แล้ว taper ตามการตอบสนอง
•	พิจารณา IVIG 1 g/kg/day × 1–2 วัน ในรายเลือดออกรุนแรงหรือ PLT ต่ำมาก
5.กรณี Heparin-induced thrombocytopenia (HIT)
•	หยุด heparin ทุกชนิดทันที
•	เปลี่ยนเป็น non-heparin anticoagulant (เช่น fondaparinux หรือ DOAC ตามข้อบ่งชี้)
•	หลีกเลี่ยง platelet transfusion หากไม่มีเลือดออกรุนแรง เพราะเสี่ยงลิ่มเลือดเพิ่ม`,
    },

    // 19) Nephritis (เพิ่มจาก guideline)
    "Nephritis": {
      label: "Nephritis",
      text: `Nephritis (Drug-induced acute interstitial nephritis / nephrotoxicity)
1.หยุดยาที่สงสัยทันที 
•	เช่น β-lactams, sulfonamides, rifampin, NSAIDs, PPIs, allopurinol ฯลฯ
2.ประเมินความรุนแรงของไตวาย
•	ตรวจ BUN, Creatinine, eGFR, electrolytes, ปริมาณปัสสาวะ
•	ประเมิน volume status (ขาดน้ำ / น้ำเกิน)
3.Supportive care
•	ให้สารน้ำให้เหมาะสม หลีกเลี่ยงทั้ง volume overload และ dehydration
•	หลีกเลี่ยง nephrotoxic drugs อื่น ๆ (เช่น NSAIDs, aminoglycosides, radiocontrast เพิ่มเติม)
•	ควบคุมความดันโลหิต และภาวะเกลือแร่ผิดปกติ (เช่น hyperkalemia, metabolic acidosis)
4.Corticosteroid (พิจารณาใน AIN จากภูมิคุ้มกัน หลัง exclude sepsis)
•	Prednisolone 0.5–1 mg/kg/day PO (หรือเทียบเท่า IV) นาน 1–2 สัปดาห์ แล้ว taper ใน 4–6 สัปดาห์ ตาม renal response
•	ประโยชน์ชัดเจนเมื่อเริ่มภายใน 1–2 สัปดาห์หลังเริ่มมี AIN
5.Indication สำหรับ Nephrologist / Dialysis
•	Cr เพิ่มเร็ว, oliguria/anuria, hyperkalemia ดื้อยา, volume overload, หรือ uremic symptoms (pericarditis, encephalopathy)
•	พิจารณา hemodialysis ตามข้อบ่งชี้มาตรฐาน`,
    },

    // 20) Serum sickness (เพิ่มจาก guideline)
    "Serum sickness": {
      label: "Serum sickness",
      text: `Serum sickness / Serum sickness–like reaction
1.หยุดยาหรือสารก่อปฏิกิริยาทันที 
•	เช่น cefaclor, penicillin, sulfonamides, biologics, antisera ฯลฯ
2.ประเมินระบบสำคัญ
•	ฟังหัวใจ ปอด ประเมินข้อบวม ผื่นลักษณะ vasculitis/urticaria, ต่อมน้ำเหลือง, ตับ/ม้ามโต
3.การรักษาตามอาการ (Symptomatic treatment)
•	ผื่น/คัน: ให้ H1 antihistamine (เช่น cetirizine 10 mg/day หรือ chlorpheniramine 4 mg q6h)
•	ปวดข้อ/ปวดกล้ามเนื้อ: พิจารณา paracetamol 500–1000 mg q6h PRN (หลีกเลี่ยง NSAIDs ในผู้ป่วยที่สงสัยแพ้ NSAIDs)
4.Corticosteroid (ใช้เมื่อมีอาการปานกลาง–รุนแรง)
•	Prednisolone 0.5–1 mg/kg/day PO ประมาณ 5–7 วัน → taper ลงใน 1–2 สัปดาห์ เมื่อผื่น/ข้อบวมดีขึ้น
5.กรณีรุนแรงมาก / organ involvement (ไต, หัวใจ, ระบบประสาท)
•	พิจารณาให้ methylprednisolone IV dose สูงระยะสั้น (เช่น 0.5–1 mg/kg/day หรือ pulse ตามดุลยพินิจเฉพาะราย)
•	พิจารณา IVIG หรือ plasmapheresis ในรายที่ไม่ตอบสนองต่อ steroid หรือมีภาวะ immune-complex รุนแรง (ตามดุลยพินิจแพทย์เฉพาะทาง)`,
    },

    // 21) Vasculitis (เพิ่มจาก guideline)
    "Vasculitis": {
      label: "Vasculitis",
      text: `Vasculitis (Drug-induced leukocytoclastic / immune-complex vasculitis)
1.หยุดยาที่สงสัยทันที 
•	เช่น β-lactams, sulfonamides, fluoroquinolones, allopurinol, PTU/methimazole, hydralazine, biologics ฯลฯ
2.ประเมินว่าจำกัดเฉพาะผิวหนัง หรือมี organ involvement
•	ซักประวัติ/ตรวจร่างกายหา hematuria/proteinuria, ไอหอบ/มีเลือดออกทางเดินหายใจ, ปวดท้อง, neuropathy
•	ตรวจ UA, Cr, LFT, ESR/CRP; พิจารณา ANCA/ANA ตามข้อบ่งชี้
3.กรณีจำกัดเฉพาะผิวหนัง (skin-limited)
•	พักยกขาสูง/ถุงน่องรัดแก้บวมขา
•	ยาแก้คันและปวด: cetirizine หรือ loratadine วันละครั้ง + paracetamol PRN
•	ทา topical corticosteroid potency ปานกลาง (เช่น triamcinolone 0.1%) วันละ 1–2 ครั้ง บริเวณผื่นนูน/คัน
4.กรณีมีอาการปานกลาง–รุนแรง หรือมี organ involvement
•	Prednisolone 0.5–1 mg/kg/day PO 2–4 สัปดาห์ แล้ว taper ตามอาการและค่าตรวจทางห้องปฏิบัติการ
•	พิจารณาเสริม immunosuppressive agent (เช่น azathioprine, methotrexate หรือ cyclophosphamide) ในรายที่รุนแรงมากหรือมี systemic vasculitis ตามดุลยพินิจแพทย์เฉพาะทาง
5.ติดตามระยะยาว
•	ตรวจ UA, Cr, ความดันโลหิต และประเมินผื่นซ้ำทุก 1–3 เดือน จนกว่าจะสงบ`,
    },
  };

  // เปิดให้หน้าอื่นเรียกใช้
  window.adrTreatmentDB = tx;
})();


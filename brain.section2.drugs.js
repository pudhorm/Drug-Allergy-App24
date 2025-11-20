// ===================== brain.section2.drugs.js =====================
// ฐานข้อมูล "ยาที่มีรายงานการเกิดการแพ้" แยกตามชนิด ADR
// ใช้ร่วมกับหน้า 6 ส่วนที่ 2 โดยจะเลือก ADR ที่มีเปอร์เซ็นต์สูงสุดจาก brainResult
// แล้วให้ page6.js นำข้อมูลจาก window.adrDrugDB[adrLabel] ไปแสดง

(function () {
  const db = {
    // 1) Urticaria
    "Urticaria": {
      label: "Urticaria",
      notes: "ลมพิษจากการแพ้ยา ทั้งแบบ True allergy (IgE-mediated) และ pseudoallergy",
      drugs: [
        // True allergy
        {
          category: "True allergy",
          group: "β-lactam antibiotics",
          examples: "Penicillin, Cephalosporins",
        },
        {
          category: "True allergy",
          group: "Sulfonamides",
          examples: "Cotrimoxazole, Sulfasalazine",
        },
        {
          category: "True allergy",
          group: "Anticonvulsants",
          examples: "Phenytoin, Carbamazepine, Lamotrigine",
        },
        {
          category: "True allergy",
          group: "NSAIDs (เฉพาะผู้ที่ sensitized จริง)",
          examples: "เช่น Ibuprofen, Diclofenac, Naproxen (ในผู้ป่วยที่มี IgE/ selective reaction)",
        },

        // Pseudoallergy
        {
          category: "Pseudoallergy",
          group: "NSAIDs (cross-reactive)",
          examples: "Aspirin, Ibuprofen, Diclofenac, Naproxen",
        },
        {
          category: "Pseudoallergy",
          group: "Opioids",
          examples: "Morphine, Codeine, Meperidine",
        },
        {
          category: "Pseudoallergy",
          group: "Vancomycin",
          examples: "Vancomycin (เช่น Red man syndrome)",
        },
        {
          category: "Pseudoallergy",
          group: "Radiocontrast media",
          examples: "Iodinated / Gadolinium-based contrast media",
        },
        {
          category: "Pseudoallergy",
          group: "ACE inhibitors",
          examples: "Enalapril, Captopril",
        },
      ],
    },

    // 2) Angioedema
    "Angioedema": {
      label: "Angioedema",
      notes: "บวมลึกของชั้นผิว / mucosa จากยา ทั้ง IgE-mediated และ bradykinin / pseudoallergy",
      drugs: [
        // True allergy
        {
          category: "True allergy",
          group: "β-lactam antibiotics",
          examples: "Penicillin, Cephalosporins",
        },
        {
          category: "True allergy",
          group: "Sulfonamides",
          examples: "Cotrimoxazole, Sulfasalazine",
        },
        {
          category: "True allergy",
          group: "Anticonvulsants",
          examples: "Phenytoin, Carbamazepine, Lamotrigine",
        },
        {
          category: "True allergy",
          group: "NSAIDs (เฉพาะผู้ที่ sensitized จริง)",
          examples: "NSAIDs selective reaction",
        },
        {
          category: "True allergy",
          group: "Monoclonal antibodies / Biologics",
          examples: "Infliximab, Omalizumab (บางราย)",
        },

        // Pseudoallergy
        {
          category: "Pseudoallergy",
          group: "NSAIDs (cross-reactive)",
          examples: "Aspirin, Ibuprofen, Diclofenac, Naproxen",
        },
        {
          category: "Pseudoallergy",
          group: "Opioids",
          examples: "Morphine, Codeine, Meperidine",
        },
        {
          category: "Pseudoallergy",
          group: "Vancomycin",
          examples: "Vancomycin",
        },
        {
          category: "Pseudoallergy",
          group: "Radiocontrast media",
          examples: "Iodinated / Gadolinium contrast",
        },
        {
          category: "Pseudoallergy / Bradykinin-mediated",
          group: "ACE inhibitors",
          examples: "Enalapril, Captopril",
        },
      ],
    },

    // 3) Anaphylaxis
    "Anaphylaxis": {
      label: "Anaphylaxis",
      notes: "ช็อกจากการแพ้ยา ทั้ง IgE-mediated และ pseudoallergy โดยเฉพาะ NSAIDs/contrast/opioids",
      drugs: [
        // True allergy
        {
          category: "True allergy",
          group: "β-lactam antibiotics",
          examples:
            "Penicillin, Amoxicillin, Ampicillin, Cloxacillin, Cephalexin, Cefazolin, Ceftriaxone, Cefotaxime, Cefuroxime",
        },
        {
          category: "True allergy",
          group: "Sulfonamides",
          examples: "Cotrimoxazole (TMP–SMX), Sulfasalazine",
        },
        {
          category: "True allergy",
          group: "Macrolides",
          examples: "Erythromycin, Azithromycin",
        },
        {
          category: "True allergy",
          group: "Fluoroquinolones",
          examples: "Ciprofloxacin, Levofloxacin, Moxifloxacin (บางเคส IgE-positive)",
        },
        {
          category: "True allergy",
          group: "Vancomycin",
          examples: "พบ IgE-mediated บางราย",
        },
        {
          category: "True allergy",
          group: "Platinum-based agents",
          examples: "Carboplatin, Cisplatin, Oxaliplatin",
        },
        {
          category: "True allergy",
          group: "Taxanes",
          examples: "Paclitaxel, Docetaxel (บางส่วนจาก solvent Cremophor EL)",
        },
        {
          category: "True allergy",
          group: "Monoclonal antibodies",
          examples: "Rituximab, Cetuximab, Trastuzumab, Infliximab, Omalizumab",
        },
        {
          category: "True allergy",
          group: "Insulin",
          examples: "โดยเฉพาะ animal-derived หรือ recombinant human insulin",
        },
        {
          category: "True allergy",
          group: "Neuromuscular blocking agents (NMBAs)",
          examples: "Succinylcholine, Rocuronium, Vecuronium, Atracurium, Cisatracurium",
        },
        {
          category: "True allergy",
          group: "Chlorhexidine",
          examples: "สารทำความสะอาดผิว / mouthwash",
        },
        {
          category: "True allergy",
          group: "Latex",
          examples: "ถุงมือยาง, สายสวน ฯลฯ",
        },
        {
          category: "True allergy",
          group: "Protamine sulfate",
          examples: "ใช้คืนฤทธิ์ Heparin",
        },
        {
          category: "True allergy",
          group: "Heparin",
          examples: "พบ IgE-mediated ได้น้อย",
        },
        {
          category: "True allergy",
          group: "Paracetamol (Acetaminophen)",
          examples: "<0.01% ของผู้ป่วย (พบได้น้อยมาก)",
        },
        {
          category: "True allergy",
          group: "Vaccines",
          examples: "Influenza, COVID-19 ฯลฯ",
        },

        // Pseudoallergy
        {
          category: "Pseudoallergy",
          group: "NSAIDs (cross-reactive)",
          examples: "Aspirin, Ibuprofen, Diclofenac, Naproxen, Ketorolac",
        },
        {
          category: "Pseudoallergy",
          group: "Opioids",
          examples: "Morphine, Codeine, Meperidine",
        },
        {
          category: "Pseudoallergy",
          group: "Radiocontrast media (iodinated)",
          examples: "Iohexol, Iopamidol, Iodixanol",
        },
        {
          category: "Pseudoallergy",
          group: "Radiocontrast media (gadolinium-based)",
          examples: "Gadobutrol, Gadoterate",
        },
        {
          category: "Pseudoallergy",
          group: "Vancomycin",
          examples: "เช่น Red man syndrome",
        },
      ],
    },

    // 4) Fixed drug eruption (FDE)
    "Fixed drug eruption": {
      label: "Fixed drug eruption",
      notes: "ผื่นลักษณะวงกลม/วงรี ม่วงคล้ำซ้ำตำแหน่งเดิมเมื่อกินยาซ้ำ",
      drugs: [
        {
          category: "Reported culprit drugs",
          group: "Sulfonamides",
          examples: "Trimethoprim–Sulfamethoxazole (co-trimoxazole)",
        },
        {
          category: "Reported culprit drugs",
          group: "Tetracyclines",
          examples: "Tetracycline, Doxycycline",
        },
        {
          category: "Reported culprit drugs",
          group: "Penicillins / β-lactams",
          examples: "Amoxicillin, Ampicillin, Penicillin; Cephalosporins บางตัว",
        },
        {
          category: "Reported culprit drugs",
          group: "Macrolides",
          examples: "Erythromycin",
        },
        {
          category: "Reported culprit drugs",
          group: "Fluoroquinolones",
          examples: "Ciprofloxacin, Levofloxacin, Norfloxacin",
        },
        {
          category: "Reported culprit drugs",
          group: "Nitroimidazoles",
          examples: "Metronidazole, Tinidazole",
        },
        {
          category: "Reported culprit drugs",
          group: "Rifampicin / Dapsone",
          examples: "Rifampicin, Dapsone",
        },
        {
          category: "Reported culprit drugs",
          group: "Antifungals (Azoles / อื่นๆ)",
          examples: "Fluconazole, Ketoconazole, Griseofulvin",
        },
        {
          category: "Reported culprit drugs",
          group: "Antivirals (nucleoside analogs)",
          examples: "Acyclovir, Valacyclovir, Famciclovir",
        },
        {
          category: "Reported culprit drugs",
          group: "Antimalarial",
          examples: "Quinine",
        },
        {
          category: "Reported culprit drugs",
          group: "Paracetamol (Acetaminophen)",
          examples: "Paracetamol",
        },
        {
          category: "Reported culprit drugs",
          group: "NSAIDs",
          examples:
            "Aspirin, Ibuprofen, Naproxen, Piroxicam, Mefenamic acid, Metamizole/Dipyrone, Etoricoxib, Feprazone",
        },
        {
          category: "Reported culprit drugs",
          group: "Anticonvulsants",
          examples: "Carbamazepine, Phenytoin, Phenobarbital, Lamotrigine",
        },
      ],
    },

    // 5) Maculopapular rash (MP rash)
    "Maculopapular rash": {
      label: "Maculopapular rash",
      notes: "ผื่นแดงปื้น/นูนกระจายทั้งตัว พบได้บ่อยสุดในการแพ้ยาแบบ exanthematous",
      drugs: [
        {
          category: "Reported culprit drugs",
          group: "β-lactam antibiotics",
          examples:
            "Penicillin, Amoxicillin, Ampicillin, Cloxacillin, Amoxicillin-clavulanate, Cephalexin, Cefazolin, Cefuroxime, Cefotaxime, Ceftriaxone",
        },
        {
          category: "Reported culprit drugs",
          group: "Sulfonamides",
          examples: "Co-trimoxazole, Sulfadiazine, Sulfasalazine",
        },
        {
          category: "Reported culprit drugs",
          group: "Macrolides",
          examples: "Erythromycin, Azithromycin, Clarithromycin",
        },
        {
          category: "Reported culprit drugs",
          group: "Tetracyclines",
          examples: "Doxycycline, Minocycline, Tetracycline",
        },
        {
          category: "Reported culprit drugs",
          group: "Fluoroquinolones",
          examples: "Ciprofloxacin, Levofloxacin, Moxifloxacin, Norfloxacin",
        },
        {
          category: "Reported culprit drugs",
          group: "Nitroimidazoles",
          examples: "Metronidazole, Tinidazole",
        },
        {
          category: "Reported culprit drugs",
          group: "Other antibiotics",
          examples: "Isoniazid, Rifampicin, Chloramphenicol, Streptomycin, Vancomycin",
        },
        {
          category: "Reported culprit drugs",
          group: "Allopurinol",
          examples: "Allopurinol (พบทั้ง MP rash และ SCARs)",
        },
        {
          category: "Reported culprit drugs",
          group: "Antiepileptics",
          examples:
            "Carbamazepine, Phenytoin, Lamotrigine, Phenobarbital, Valproate",
        },
        {
          category: "Reported culprit drugs",
          group: "NSAIDs",
          examples: "Ibuprofen, Diclofenac, Naproxen, Piroxicam, Mefenamic acid, Indomethacin",
        },
        {
          category: "Reported culprit drugs",
          group: "Antifungals",
          examples: "Fluconazole, Ketoconazole, Griseofulvin, Terbinafine",
        },
        {
          category: "Reported culprit drugs",
          group: "Antivirals",
          examples: "Nevirapine, Abacavir, Acyclovir/Valacyclovir",
        },
        {
          category: "Reported culprit drugs",
          group: "Antimalarial / Antirheumatic",
          examples: "Hydroxychloroquine",
        },
        {
          category: "Reported culprit drugs",
          group: "Miscellaneous",
          examples: "Proton-pump inhibitors, Hydralazine, Methyldopa",
        },
      ],
    },

    // 6) AGEP
    "AGEP": {
      label: "AGEP",
      notes: "Acute generalized exanthematous pustulosis",
      drugs: [
        {
          category: "Reported culprit drugs",
          group: "β-lactam antibiotics / Penicillins",
          examples: "เช่น Amoxicillin",
        },
        {
          category: "Reported culprit drugs",
          group: "Macrolides",
          examples: "เช่น Clarithromycin",
        },
        {
          category: "Reported culprit drugs",
          group: "Quinolones",
          examples: "เช่น Levofloxacin",
        },
        {
          category: "Reported culprit drugs",
          group: "Sulfonamides",
          examples: "TMP–SMX และยาในกลุ่ม sulfonamide อื่น ๆ",
        },
        {
          category: "Reported culprit drugs",
          group: "Antifungals",
          examples: "เช่น Terbinafine",
        },
        {
          category: "Reported culprit drugs",
          group: "Antimalarial / Hydroxychloroquine",
          examples: "Hydroxychloroquine",
        },
        {
          category: "Reported culprit drugs",
          group: "Calcium channel blockers",
          examples: "เช่น Diltiazem",
        },
        {
          category: "Reported culprit drugs",
          group: "Proton-pump inhibitors",
          examples: "เช่น Omeprazole",
        },
      ],
    },

    // 7) Exfoliative dermatitis
    "Exfoliative dermatitis": {
      label: "Exfoliative dermatitis",
      notes: "ผื่นแดงลอกทั้งตัว (erythroderma) จากยา",
      drugs: [
        {
          category: "Reported culprit drugs",
          group: "ACE inhibitors",
          examples: "Captopril, Enalapril, Quinapril",
        },
        {
          category: "Reported culprit drugs",
          group: "Antibiotics",
          examples:
            "Amoxicillin, Ampicillin, Ciprofloxacin, Demeclocycline, Doxycycline, Minocycline, Nalidixic acid, Nitrofurantoin, Norfloxacin, Penicillin, Rifampicin, Streptomycin, Tetracycline, Tobramycin, Trimethoprim, TMP–SMX, Vancomycin",
        },
        {
          category: "Reported culprit drugs",
          group: "Anticonvulsants",
          examples:
            "Barbiturates, Carbamazepine, Phenobarbital, Phenytoin, Primidone",
        },
        {
          category: "Reported culprit drugs",
          group: "Phenothiazine derivatives / Antipsychotics",
          examples:
            "Perphenazine, Prochlorperazine, Trifluoperazine, Chlorpromazine, Fluphenazine",
        },
        {
          category: "Reported culprit drugs",
          group: "Antimalarial agents",
          examples: "Chloroquine, Hydroxychloroquine",
        },
        {
          category: "Reported culprit drugs",
          group: "NSAIDs",
          examples:
            "Diclofenac, Diflunisal, Etodolac, Fenoprofen, Flurbiprofen, Indomethacin, Ketoprofen, Ketorolac, Meclofenamate, Mefenamic acid, Naproxen, Phenylbutazone, Piroxicam, Sulindac, Aspirin",
        },
        {
          category: "Reported culprit drugs",
          group: "Tricyclic antidepressants",
          examples: "Amitriptyline, Desipramine, Imipramine",
        },
        {
          category: "Reported culprit drugs",
          group: "Miscellaneous (รายงานอื่น ๆ)",
          examples:
            "Allopurinol, Aminoglutethimide, Amiodarone, Arsenic, Atropine, β-blockers (เช่น Propranolol), Bumetanide, Bupropion, Carbidopa, Chlorpropamide, Cimetidine, Clofazimine, Clofibrate, Cromolyn, Cytarabine, Dapsone, Diazepam, Diltiazem, Doxorubicin, Trazodone, Verapamil, Fluconazole, Furosemide, Gemfibrozil, Griseofulvin, Isoniazid, Isosorbide, Ketoconazole, Lithium, Meprobamate, Methylphenidate, Nifedipine, Nitroglycerin, Nizatidine, Omeprazole, Penicillamine, Pentobarbital, Phenothiazines, Propranolol, Pyrazolones, Quinidine, Quinine, Oral retinoids, Sulfadoxine, Sulfamethoxazole, Sulfasalazine, Sulfisoxazole, Sulfonamides, Sulfonylureas",
        },
      ],
    },

    // 8) Photosensitivity drug eruption
    "Photosensitivity drug eruption": {
      label: "Photosensitivity drug eruption",
      notes: "ผื่นเฉพาะบริเวณสัมผัสแดดจากยา (photoallergy / phototoxicity)",
      drugs: [
        {
          category: "Reported culprit drugs",
          group: "Antibiotics",
          examples:
            "Doxycycline, Minocycline, Tetracycline, Ciprofloxacin, Levofloxacin, Ofloxacin, Nalidixic acid, TMP–SMX",
        },
        {
          category: "Reported culprit drugs",
          group: "NSAIDs / Analgesics",
          examples:
            "Piroxicam, Naproxen, Ibuprofen, Ketoprofen, Diclofenac, Indomethacin",
        },
        {
          category: "Reported culprit drugs",
          group: "Cardiovascular drugs",
          examples:
            "Amiodarone, Diltiazem, Hydrochlorothiazide, Furosemide, Quinidine, Atorvastatin, Simvastatin",
        },
        {
          category: "Reported culprit drugs",
          group: "Psychotropic / Phenothiazines",
          examples:
            "Chlorpromazine, Promethazine, Thioridazine, Perphenazine, Prochlorperazine",
        },
        {
          category: "Reported culprit drugs",
          group: "Antifungals",
          examples: "Voriconazole, Griseofulvin",
        },
        {
          category: "Reported culprit drugs",
          group: "Antineoplastics / Targeted therapy",
          examples: "Vemurafenib, Imatinib, 5-Fluorouracil",
        },
        {
          category: "Reported culprit drugs",
          group: "Other drugs",
          examples:
            "Oral retinoids (Acitretin, Isotretinoin), Sulfonylureas (Glipizide, Glyburide), St. John's wort",
        },
      ],
    },

    // 9) Bullous Drug Eruption
    "Bullous Drug Eruption": {
      label: "Bullous Drug Eruption",
      notes: "ผื่นตุ่มพอง/ตุ่มน้ำจากยา นอกกลุ่ม SJS/TEN",
      drugs: [
        {
          category: "Reported culprit drugs",
          group: "Antibiotics",
          examples:
            "Sulfonamides (TMP–SMX, Sulfadiazine), β-lactams (Penicillin, Amoxicillin, Ampicillin, Cephalosporins), Tetracyclines (Doxycycline, Minocycline), Fluoroquinolones (Ciprofloxacin, Levofloxacin)",
        },
        {
          category: "Reported culprit drugs",
          group: "Anticonvulsants",
          examples:
            "Carbamazepine, Phenytoin, Lamotrigine, Phenobarbital, Valproate",
        },
        {
          category: "Reported culprit drugs",
          group: "NSAIDs",
          examples: "Ibuprofen, Diclofenac, Piroxicam, Naproxen, Indomethacin",
        },
        {
          category: "Reported culprit drugs",
          group: "Antimalarial / Antirheumatic",
          examples: "Hydroxychloroquine, Chloroquine",
        },
        {
          category: "Reported culprit drugs",
          group: "Other drugs",
          examples:
            "Vancomycin, Dapsone, Proton-pump inhibitors (Omeprazole, Pantoprazole – รายงานน้อย), Diuretics (Furosemide, Thiazides), Allopurinol",
        },
      ],
    },

    // 10) Erythema multiforme
    "Erythema multiforme": {
      label: "Erythema multiforme",
      notes: "ผื่น target lesion จากยา (นอกเหนือจากเชื้อ HSV / การติดเชื้อ)",
      drugs: [
        {
          category: "Reported culprit drugs",
          group: "Antibiotics",
          examples:
            "β-lactam antibiotics (Ampicillin, Amoxicillin), Sulfonamides (TMP–SMX), Macrolides, Nitrofurantoin",
        },
        {
          category: "Reported culprit drugs",
          group: "Antiepileptics",
          examples: "Phenytoin, Carbamazepine, Lamotrigine, Barbiturates",
        },
        {
          category: "Reported culprit drugs",
          group: "NSAIDs",
          examples: "Ibuprofen, Naproxen, Diclofenac",
        },
        {
          category: "Reported culprit drugs",
          group: "Antituberculosis drugs",
          examples: "Isoniazid, Rifampicin",
        },
        {
          category: "Reported culprit drugs",
          group: "Other drugs",
          examples: "Sulfasalazine, Allopurinol",
        },
      ],
    },

    // 11) Eczematous drug eruption
    "Eczematous drug eruption": {
      label: "Eczematous drug eruption",
      notes: "ผื่นคล้าย eczema / contact dermatitis จากยา",
      drugs: [
        {
          category: "Reported culprit drugs",
          group: "Antihypertensives / Cardiac drugs",
          examples:
            "β-blockers (เช่น Propranolol), Thiazides (Hydrochlorothiazide), ACE inhibitors (Captopril, Enalapril), Calcium-channel blockers",
        },
        {
          category: "Reported culprit drugs",
          group: "Antiepileptics",
          examples: "Carbamazepine, Phenytoin, Lamotrigine, Phenobarbital",
        },
        {
          category: "Reported culprit drugs",
          group: "Antibiotics",
          examples:
            "Penicillins, Cephalosporins, Sulfonamides (TMP–SMX), Macrolides, Nitrofurantoin, Neomycin",
        },
        {
          category: "Reported culprit drugs",
          group: "NSAIDs",
          examples: "Ibuprofen, Naproxen, Diclofenac",
        },
        {
          category: "Reported culprit drugs",
          group: "Other drugs",
          examples: "Allopurinol, Proton-pump inhibitors, Statins",
        },
      ],
    },

    // 12) DRESS
    "DRESS": {
      label: "DRESS",
      notes: "Drug Reaction with Eosinophilia and Systemic Symptoms",
      drugs: [
        {
          category: "Reported culprit drugs",
          group: "Anticonvulsants",
          examples:
            "Carbamazepine (renal), Lamotrigine, Phenobarbital, Phenytoin (hepatic), Valproic acid, Zonisamide",
        },
        {
          category: "Reported culprit drugs",
          group: "Antibiotics",
          examples:
            "Ampicillin (cardiac), Cefotaxime, Dapsone (hepatic & renal), Ethambutol, Isoniazid, Linezolid, Metronidazole, Minocycline (hepatic, pulmonary & cardiac), Pyrazinamide, Quinine, Rifampin, Sulfasalazine, Streptomycin, TMP–SMX, Vancomycin, Ciprofloxacin",
        },
        {
          category: "Reported culprit drugs",
          group: "Antiviral / Antiretroviral drugs",
          examples: "Abacavir, Nevirapine, Zalcitabine",
        },
        {
          category: "Reported culprit drugs",
          group: "Antidepressants",
          examples: "Bupropion, Fluoxetine",
        },
        {
          category: "Reported culprit drugs",
          group: "Antihypertensives",
          examples: "Amlodipine, Captopril",
        },
        {
          category: "Reported culprit drugs",
          group: "Biologic / Targeted therapy",
          examples: "Efalizumab, Imatinib",
        },
        {
          category: "Reported culprit drugs",
          group: "Anti-inflammatory / NSAIDs",
          examples: "Celecoxib, Ibuprofen",
        },
        {
          category: "Reported culprit drugs",
          group: "Other drugs",
          examples: "Allopurinol (renal), Epoetin alfa, Mexiletine, Ranitidine",
        },
      ],
    },

    // 13) SJS
    "SJS": {
      label: "SJS",
      notes: "Stevens–Johnson syndrome",
      drugs: [
        {
          category: "Reported culprit drugs",
          group: "Anticonvulsants / Antiepileptics",
          examples:
            "Carbamazepine, Phenytoin, Phenobarbital, Lamotrigine, Oxcarbazepine, Zonisamide",
        },
        {
          category: "Reported culprit drugs",
          group: "Antibiotics",
          examples:
            "Sulfonamides (TMP–SMX, Sulfadiazine, Sulfasalazine), Penicillins (Ampicillin, Amoxicillin, Oxacillin), Cephalosporins (Ceftriaxone, Cefotaxime), Tetracyclines (โดยเฉพาะ Minocycline), Macrolides (Erythromycin, Azithromycin – ไม่บ่อย), Fluoroquinolones (Ciprofloxacin, Levofloxacin), Vancomycin",
        },
        {
          category: "Reported culprit drugs",
          group: "Anti-gout",
          examples: "Allopurinol, Febuxostat",
        },
        {
          category: "Reported culprit drugs",
          group: "Antituberculosis drugs",
          examples: "Isoniazid, Rifampicin, Ethambutol, Pyrazinamide",
        },
        {
          category: "Reported culprit drugs",
          group: "Antiviral / Antiretroviral drugs",
          examples: "Nevirapine, Abacavir, Efavirenz, Zidovudine, Tenofovir",
        },
        {
          category: "Reported culprit drugs",
          group: "NSAIDs / Analgesics",
          examples:
            "Oxicam derivatives (Piroxicam, Meloxicam), Naproxen, Diclofenac, Ibuprofen, Paracetamol (พบได้น้อย)",
        },
      ],
    },

    // 14) TEN
    "TEN": {
      label: "TEN",
      notes: "Toxic epidermal necrolysis",
      drugs: [
        {
          category: "Reported culprit drugs",
          group: "Antibiotics",
          examples:
            "Ampicillin, Chloramphenicol, Erythromycin, Neomycin, Penicillin G/V, Procaine penicillin, Tetracycline, Streptomycin",
        },
        {
          category: "Reported culprit drugs",
          group: "Sulfonamides",
          examples:
            "Sulfadiazine, Sulfadimethoxine, Sulfadoxine, TMP–SMX, Sulfamathoxypyridazine, Sulfamathoxydiazine, Sulfasalazine, Sulfathiazole, Sulfisoxazole",
        },
        {
          category: "Reported culprit drugs",
          group: "Other antiinfectives",
          examples:
            "Benznidazole, Chloroquine, Dapsone, Isoniazid, Nitrofurantoin, Pyrimethamine with sulfadoxine, Quinine, Tetrachloroethylene, Thiabendazole, Thioacetazone",
        },
        {
          category: "Reported culprit drugs",
          group: "Analgesics / Antipyretics / Antirheumatics",
          examples:
            "Aspirin, Aminophenazone, Antipyrine, Benoxaprofen, Codeine, Fenbufen, Gold, Ibuprofen, Indomethacin, Isoxicam, Metamizole, Oxyphenbutazone, Pentazocine, d-Penicillamine, Pethidine, Phenacetine, Phenylbutazone, Piroxicam, Propyphenazone, Salicylamide, Sulindac, Tolmetin, Zomepirac",
        },
        {
          category: "Reported culprit drugs",
          group: "Antigout",
          examples: "Allopurinol",
        },
        {
          category: "Reported culprit drugs",
          group: "Neurologic / Psychiatric drugs",
          examples:
            "Amobarbital, Barbital, Carbamazepine, Chlormezanone, Chlorpromazine, Diphenhydramine, Levomepromazine, Mephenytoin, Mephobarbital, Meprobamate, Phenytoin, Primidone, Promethazine, Pyridinol",
        },
        {
          category: "Reported culprit drugs",
          group: "Cardiovascular drugs",
          examples: "Beta-blockers, Captopril, Enalapril",
        },
        {
          category: "Reported culprit drugs",
          group: "Cytostatic drugs",
          examples:
            "Actinomycin C, Chlorambucil, Cyclophosphamide, Mercaptopurine, Methotrexate, Mithramycin, Procarbazine",
        },
        {
          category: "Reported culprit drugs",
          group: "Other drugs",
          examples:
            "Acetazolamide, Cimetidine, Phenolphthalein, Carbutamide, Tolbutamide, Immunotherapeutic drugs / Vaccines (BCG, Measles, Smallpox vaccine, Tetanus antitoxin), Local anesthetics (Benzocaine), Iodine, Bromide",
        },
      ],
    },

    // 15) Hemolytic anemia
    "Hemolytic anemia": {
      label: "Hemolytic anemia",
      notes: "ยา-เหนี่ยวนำให้เกิดภาวะเม็ดเลือดแดงแตก",
      drugs: [
        {
          category: "Reported culprit drugs",
          group: "Cephalosporins",
          examples: "Ceftriaxone (เด่นสุด), Cefotetan, Cefotaxime, Ceftazidime",
        },
        {
          category: "Reported culprit drugs",
          group: "Penicillins / β-lactams",
          examples:
            "High-dose Penicillin G, Piperacillin–Tazobactam, Amoxicillin/Clavulanate",
        },
        {
          category: "Reported culprit drugs",
          group: "Antimalarials",
          examples: "Quinine / Quinidine",
        },
        {
          category: "Reported culprit drugs",
          group: "Antihypertensives",
          examples: "Methyldopa",
        },
        {
          category: "Reported culprit drugs",
          group: "Other drugs",
          examples:
            "Fludarabine, Rifampin, Ibuprofen, Acetaminophen, Furosemide, Voriconazole/Fluconazole, Oxaliplatin",
        },
      ],
    },

    // 16) Pancytopenia
    "Pancytopenia": {
      label: "Pancytopenia",
      notes: "ยา-เหนี่ยวนำให้เกิดเม็ดเลือดแดง เม็ดเลือดขาว และเกล็ดเลือดต่ำร่วมกัน",
      drugs: [
        {
          category: "Reported culprit drugs",
          group: "Antibiotics",
          examples: "Chloramphenicol, Sulfonamides, β-lactams (Penicillin, Piperacillin, Ceftriaxone), Rifampin",
        },
        {
          category: "Reported culprit drugs",
          group: "Antithyroid drugs",
          examples: "Methimazole, Carbimazole, Propylthiouracil (PTU)",
        },
        {
          category: "Reported culprit drugs",
          group: "Anticonvulsants",
          examples: "Phenytoin, Carbamazepine, Valproate",
        },
        {
          category: "Reported culprit drugs",
          group: "NSAIDs",
          examples: "Ibuprofen, Diclofenac, Naproxen",
        },
        {
          category: "Reported culprit drugs",
          group: "Antimalarials",
          examples: "Quinine, Quinidine",
        },
        {
          category: "Reported culprit drugs",
          group: "Antineoplastics / Immunomodulators",
          examples: "Fludarabine, Azathioprine",
        },
        {
          category: "Reported culprit drugs",
          group: "Other drugs",
          examples: "Methyldopa",
        },
      ],
    },

    // 17) Neutropenia
    "Neutropenia": {
      label: "Neutropenia",
      notes: "เม็ดเลือดขาว neutrophil ต่ำจากยา",
      drugs: [
        {
          category: "Reported culprit drugs",
          group: "Antithyroid drugs (ATD)",
          examples: "Methimazole/Carbimazole, Propylthiouracil (PTU)",
        },
        {
          category: "Reported culprit drugs",
          group: "Antipsychotic",
          examples: "Clozapine",
        },
        {
          category: "Reported culprit drugs",
          group: "Antiplatelets",
          examples: "Ticlopidine (เด่น), Clopidogrel",
        },
        {
          category: "Reported culprit drugs",
          group: "Anti-infectives",
          examples:
            "β-lactams (เช่น Amoxicillin, Piperacillin/Tazobactam, Cephalosporins), Co-trimoxazole (TMP–SMX), Rifampin, Metronidazole, Vancomycin",
        },
        {
          category: "Reported culprit drugs",
          group: "NSAIDs / Analgesics",
          examples: "Metamizole (Dipyrone), Ibuprofen (รายงาน), Diclofenac",
        },
      ],
    },

    // 18) Thrombocytopenia
    "Thrombocytopenia": {
      label: "Thrombocytopenia",
      notes: "เกล็ดเลือดต่ำจากยา",
      drugs: [
        {
          category: "Reported culprit drugs",
          group: "Antimalarials / Others",
          examples: "Quinine / Quinidine",
        },
        {
          category: "Reported culprit drugs",
          group: "Sulfonamides",
          examples: "Co-trimoxazole (TMP–SMX)",
        },
        {
          category: "Reported culprit drugs",
          group: "Antibiotics",
          examples:
            "Vancomycin, β-lactams (Penicillins, Cephalosporins เช่น Ceftriaxone), Linezolid, Rifampin",
        },
        {
          category: "Reported culprit drugs",
          group: "Antiplatelet / Anticoagulant-related",
          examples: "GPIIb/IIIa inhibitors (Abciximab, Eptifibatide, Tirofiban), Heparin",
        },
        {
          category: "Reported culprit drugs",
          group: "Anticonvulsants",
          examples: "Carbamazepine, Valproate, Phenytoin",
        },
        {
          category: "Reported culprit drugs",
          group: "Antihypertensives",
          examples: "Methyldopa",
        },
      ],
    },

    // 19) Nephritis
    "Nephritis": {
      label: "Nephritis",
      notes: "ยา-กระตุ้นให้เกิด interstitial nephritis / nephrotoxicity",
      drugs: [
        {
          category: "Reported culprit drugs",
          group: "Antibiotics",
          examples:
            "β-lactams (Penicillin, Methicillin, Amoxicillin, Cephalosporins), Sulfonamides, Rifampin, Ciprofloxacin",
        },
        {
          category: "Reported culprit drugs",
          group: "NSAIDs",
          examples: "Ibuprofen, Naproxen, Indomethacin",
        },
        {
          category: "Reported culprit drugs",
          group: "Proton-pump inhibitors",
          examples: "Omeprazole, Lansoprazole, Pantoprazole",
        },
        {
          category: "Reported culprit drugs",
          group: "Diuretics",
          examples: "Furosemide, Thiazides",
        },
        {
          category: "Reported culprit drugs",
          group: "Anticonvulsants",
          examples: "Phenytoin, Carbamazepine",
        },
        {
          category: "Reported culprit drugs",
          group: "Other drugs",
          examples: "Allopurinol, Methyldopa",
        },
      ],
    },

    // 20) Serum sickness
    "Serum sickness": {
      label: "Serum sickness",
      notes: "immune-complex mediated reaction (serum sickness / serum sickness–like)",
      drugs: [
        {
          category: "Reported culprit drugs",
          group: "Antibiotics",
          examples:
            "Cefaclor (พบบ่อยในเด็ก), Amoxicillin/Amoxicillin–Clavulanate, Penicillin G, Cefprozil, Cefuroxime, Ciprofloxacin",
        },
        {
          category: "Reported culprit drugs",
          group: "Sulfonamides",
          examples: "Co-trimoxazole (TMP–SMX)",
        },
        {
          category: "Reported culprit drugs",
          group: "Tetracyclines",
          examples: "Minocycline",
        },
        {
          category: "Reported culprit drugs",
          group: "NSAIDs",
          examples: "Ibuprofen, Naproxen, Diclofenac",
        },
        {
          category: "Reported culprit drugs",
          group: "Biologics / Antisera",
          examples:
            "Rituximab, Infliximab, Omalizumab, antitoxins/antisera ต่างสายพันธุ์ (เช่น antivenom, rabies immune globulin)",
        },
        {
          category: "Reported culprit drugs",
          group: "Anticonvulsants",
          examples: "Phenytoin, Carbamazepine",
        },
      ],
    },

    // 21) Vasculitis
    "Vasculitis": {
      label: "Vasculitis",
      notes: "leukocytoclastic vasculitis / immune-complex vasculitis จากยา",
      drugs: [
        {
          category: "Reported culprit drugs",
          group: "β-lactam antibiotics",
          examples:
            "Penicillins, Cephalosporins (เช่น Cefaclor, Cefuroxime, Ceftriaxone) – immune-complex / SSLR-vasculitis",
        },
        {
          category: "Reported culprit drugs",
          group: "Sulfonamides",
          examples: "Co-trimoxazole (TMP–SMX)",
        },
        {
          category: "Reported culprit drugs",
          group: "Fluoroquinolones",
          examples: "Ciprofloxacin",
        },
        {
          category: "Reported culprit drugs",
          group: "NSAIDs",
          examples: "Ibuprofen, Naproxen, Diclofenac",
        },
        {
          category: "Reported culprit drugs",
          group: "Allopurinol",
          examples: "Allopurinol",
        },
        {
          category: "Reported culprit drugs",
          group: "Proton-pump inhibitors",
          examples: "Omeprazole, Lansoprazole",
        },
        {
          category: "Reported culprit drugs",
          group: "Antithyroid drugs",
          examples: "Propylthiouracil, Methimazole/Carbimazole",
        },
        {
          category: "Reported culprit drugs",
          group: "Hydralazine",
          examples: "Hydralazine",
        },
        {
          category: "Reported culprit drugs",
          group: "Minocycline",
          examples: "Minocycline",
        },
        {
          category: "Reported culprit drugs",
          group: "Biologics / Monoclonal antibodies",
          examples: "Infliximab, Adalimumab, Rituximab",
        },
      ],
    },
  };

  // เปิดให้หน้าอื่นเรียกใช้
  window.adrDrugDB = db;
})();


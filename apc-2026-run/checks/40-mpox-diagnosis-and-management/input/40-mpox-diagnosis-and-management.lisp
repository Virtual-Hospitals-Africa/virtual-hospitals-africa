(task
  "Check for mpox exposure, lesion sites and associated symptoms"
  adult
  (or (clinical_finding (snomed_concept "Skin lesion" "disorder"))
      (clinical_finding (snomed_concept "Eruption" "morphologic abnormality"))
      (clinical_finding (snomed_concept "Lesion of face" "disorder"))
      (clinical_finding (snomed_concept "Lesion of genitalia" "disorder"))
      (clinical_finding (snomed_concept "Lesion of rectum" "disorder"))
      (clinical_finding (snomed_concept "Oral lesion" "disorder"))
      (clinical_finding (snomed_concept "Lesion of eye" "disorder"))
  )
  (check_for
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Monkeypox virus" "organism"))

    (clinical_finding (snomed_concept "Lesion of face" "disorder") (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Skin lesion" "disorder") (finding_site (snomed_concept "Entire skin of palmar area of hand" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Skin lesion" "disorder") (finding_site (snomed_concept "Entire skin of sole of foot" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Lesion of genitalia" "disorder") (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Skin lesion" "disorder") (finding_site (snomed_concept "Anal structure" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Lesion of rectum" "disorder") (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Oral lesion" "disorder") (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Lesion of eye" "disorder") (qualifier (snomed_concept "New" "qualifier value")))

    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Sore throat" "finding"))
    (clinical_finding (snomed_concept "Nasal congestion" "finding"))
    (clinical_finding (snomed_concept "Cough" "finding"))
    (clinical_finding (snomed_concept "Lymphadenopathy" "disorder"))
    (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
    (clinical_finding (snomed_concept "Muscle pain" "finding"))
    (clinical_finding (snomed_concept "Backache" "finding"))
    (clinical_finding (snomed_concept "Fatigue" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Asthenia" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
  )
)


(task
  "Check for urgent mpox danger signs"
  adult
  (diagnosis (snomed_concept "Monkeypox" "disorder") possible)
  (check_for
    (clinical_finding (snomed_concept "Shock" "disorder"))

    (clinical_finding (snomed_concept "Thirst due to water deprivation" "finding"))
    (clinical_finding (snomed_concept "Xerostomia" "finding"))
    (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))

    (clinical_finding (snomed_concept "Unable to void urine" "finding"))
    (clinical_finding (snomed_concept "Obstipation" "disorder"))

    (clinical_finding (snomed_concept "Dyspnea at rest" "finding"))
    (clinical_finding (snomed_concept "Unable to complete a sentence in one breath" "finding"))

    (clinical_finding (snomed_concept "Bleeding from anus" "disorder") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Anal pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Discharge from anus" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))

    (clinical_finding (snomed_concept "Tightly retracted foreskin" "finding"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Glans penis structure" "body structure")))
    (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Glans penis structure" "body structure")))

    (clinical_finding (snomed_concept "Unable to swallow" "finding"))
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))

    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Pulse irregular" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))

    (clinical_finding (snomed_concept "Lesion of eye" "disorder"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))

    (clinical_finding (snomed_concept "Patient immunocompromised" "finding"))
    (clinical_finding (snomed_concept "Human immunodeficiency virus infection" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Copies of human immunodeficiency virus ribonucleic acid above reference range" "finding"))
    (clinical_finding (snomed_concept "Malignant neoplastic disease" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Transplant present" "finding"))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Hypertensive disorder, systemic arterial" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Chronic lung disease" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Chronic disease of skin" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Obesity" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))

    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))

    (clinical_finding (snomed_concept "Skin lesion" "disorder") (qualifier (snomed_concept "Extensive" "qualifier value")))
    (clinical_finding (snomed_concept "Severe pain" "finding"))
  )
)


(task
  "Check for proctitis and other causes of rash/lesions in suspected mpox"
  adult
  (diagnosis (snomed_concept "Monkeypox" "disorder") possible)
  (check_for
    (clinical_finding (snomed_concept "Anal penetration" "finding"))
    (clinical_finding (snomed_concept "Bleeding from anus" "disorder"))
    (clinical_finding (snomed_concept "Anal pain" "finding"))
    (clinical_finding (snomed_concept "Discharge from anus" "finding"))

    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
    (clinical_finding (snomed_concept "Localized skin lesion" "disorder"))
    (clinical_finding (snomed_concept "Itching" "finding"))

    (clinical_finding (snomed_concept "Vesicular eruption" "disorder"))
    (clinical_finding (snomed_concept "Acquired immune deficiency syndrome" "disorder"))
    (clinical_finding (snomed_concept "Papule of skin" "disorder"))
    (clinical_finding (snomed_concept "Hyperpigmentation of skin" "disorder"))
    (clinical_finding (snomed_concept "Burrows in skin" "disorder"))
    (clinical_finding (snomed_concept "Itching" "finding") (qualifier (snomed_concept "Night time" "qualifier value")))
    (clinical_finding (snomed_concept "New medication commenced" "finding"))

    (clinical_finding (snomed_concept "Conjunctivitis" "disorder"))
    (clinical_finding (snomed_concept "Nasal discharge" "finding"))
    (clinical_finding (snomed_concept "Macular eruption" "disorder"))
    (clinical_finding (snomed_concept "Tick bite" "disorder"))
    (clinical_finding (snomed_concept "Skin eschar" "disorder"))

    (clinical_finding (snomed_concept "Papule of skin" "disorder") (qualifier (snomed_concept "Firm" "qualifier value")) (qualifier (snomed_concept "Dome shape" "qualifier value")))
    (clinical_finding (snomed_concept "Skin dimple" "finding"))
    (clinical_finding (snomed_concept "Pain of skin" "finding"))
    (clinical_finding (snomed_concept "Vesicle of skin" "disorder") (qualifier (snomed_concept "Grouped" "qualifier value")))
    (clinical_finding (snomed_concept "Erythema" "finding"))
    (clinical_finding (snomed_concept "Vesicle of skin" "disorder") (finding_site (snomed_concept "Mouth region structure" "body structure")))
    (clinical_finding (snomed_concept "Vesicle of skin" "disorder") (finding_site (snomed_concept "Entire skin of palmar area of hand" "body structure")))
    (clinical_finding (snomed_concept "Vesicle of skin" "disorder") (finding_site (snomed_concept "Entire skin of sole of foot" "body structure")))
    (clinical_finding (snomed_concept "Blister of skin" "disorder") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Crust on skin" "finding"))
  )
)


(system_diagnosis_rule
  "Diagnose possible mpox (contact or new lesions with systemic symptoms)"
  (diagnosis
    (snomed_concept "Monkeypox" "disorder")
    possible
  )
  adult
  (or

    (<= (onset (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Monkeypox virus" "organism"))) (time_ago 21 days))

    (and
      (or (clinical_finding (snomed_concept "Lesion of face" "disorder") (qualifier (snomed_concept "New" "qualifier value")))
          (clinical_finding (snomed_concept "Skin lesion" "disorder") (finding_site (snomed_concept "Entire skin of palmar area of hand" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
          (clinical_finding (snomed_concept "Skin lesion" "disorder") (finding_site (snomed_concept "Entire skin of sole of foot" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
          (clinical_finding (snomed_concept "Lesion of genitalia" "disorder") (qualifier (snomed_concept "New" "qualifier value")))
          (clinical_finding (snomed_concept "Skin lesion" "disorder") (finding_site (snomed_concept "Anal structure" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
          (clinical_finding (snomed_concept "Lesion of rectum" "disorder") (qualifier (snomed_concept "New" "qualifier value")))
          (clinical_finding (snomed_concept "Oral lesion" "disorder") (qualifier (snomed_concept "New" "qualifier value")))
          (clinical_finding (snomed_concept "Lesion of eye" "disorder") (qualifier (snomed_concept "New" "qualifier value")))
      )
      (or (clinical_finding (snomed_concept "Headache" "finding"))
          (> (measurement (snomed_concept "Body temperature" "observable entity") °C) 38.5)
          (clinical_finding (snomed_concept "Sore throat" "finding"))
          (clinical_finding (snomed_concept "Nasal congestion" "finding"))
          (clinical_finding (snomed_concept "Cough" "finding"))
          (clinical_finding (snomed_concept "Lymphadenopathy" "disorder"))
          (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
          (clinical_finding (snomed_concept "Muscle pain" "finding"))
          (clinical_finding (snomed_concept "Backache" "finding"))
          (clinical_finding (snomed_concept "Fatigue" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
          (clinical_finding (snomed_concept "Asthenia" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      )
    )
  )
)


(system_diagnosis_rule
  "Diagnose probable dehydration in suspected mpox"
  (diagnosis
    (snomed_concept "Dehydration" "disorder")
    probable
  )
  adult
  (and
    (diagnosis (snomed_concept "Monkeypox" "disorder") possible)
    (or (clinical_finding (snomed_concept "Thirst due to water deprivation" "finding"))
        (clinical_finding (snomed_concept "Xerostomia" "finding"))
        (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
        (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
        (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable proctitis in suspected mpox"
  (diagnosis
    (snomed_concept "Proctitis" "disorder")
    probable
  )
  adult
  (and
    (diagnosis (snomed_concept "Monkeypox" "disorder") possible)
    (or

      (clinical_finding (snomed_concept "Bleeding from anus" "disorder") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      (clinical_finding (snomed_concept "Anal pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      (clinical_finding (snomed_concept "Discharge from anus" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))

      (and (clinical_finding (snomed_concept "Anal penetration" "finding"))
           (or (clinical_finding (snomed_concept "Bleeding from anus" "disorder"))
               (clinical_finding (snomed_concept "Anal pain" "finding"))
               (clinical_finding (snomed_concept "Discharge from anus" "finding"))
           )
      )
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable paraphimosis in suspected mpox"
  (diagnosis
    (snomed_concept "Paraphimosis" "disorder")
    probable
  )
  adult
  (and
    (diagnosis (snomed_concept "Monkeypox" "disorder") possible)
    (clinical_finding (snomed_concept "Tightly retracted foreskin" "finding"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Glans penis structure" "body structure")))
    (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Glans penis structure" "body structure")))
  )
)
(system_diagnosis_rule
  "Diagnose probable myocarditis in suspected mpox"
  (diagnosis
    (snomed_concept "Myocarditis" "disorder")
    probable
  )
  adult
  (and
    (diagnosis (snomed_concept "Monkeypox" "disorder") possible)
    (or (clinical_finding (snomed_concept "Chest pain" "finding"))
        (clinical_finding (snomed_concept "Pulse irregular" "finding"))
        (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable corneal infection in suspected mpox"
  (diagnosis
    (snomed_concept "Corneal infection" "disorder")
    probable
  )
  adult
  (and
    (diagnosis (snomed_concept "Monkeypox" "disorder") possible)
    (clinical_finding (snomed_concept "Lesion of eye" "disorder"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
  )
)



(system_diagnosis_rule
  "Diagnose probable chickenpox in suspected mpox"
  (diagnosis
    (snomed_concept "Varicella" "disorder")
    probable
  )
  adult
  (and
    (diagnosis (snomed_concept "Monkeypox" "disorder") possible)
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
    (clinical_finding (snomed_concept "Itching" "finding"))
    (clinical_finding (snomed_concept "Vesicular eruption" "disorder"))
    (no (clinical_finding (snomed_concept "Lymphadenopathy" "disorder")))
  )
)
(system_diagnosis_rule
  "Diagnose probable papular pruritic eruption in suspected mpox"
  (diagnosis
    (snomed_concept "Papular pruritic eruption of skin due to human immunodeficiency virus infection" "disorder")
    probable
  )
  adult
  (and
    (diagnosis (snomed_concept "Monkeypox" "disorder") possible)
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
    (clinical_finding (snomed_concept "Itching" "finding"))
    (clinical_finding (snomed_concept "Acquired immune deficiency syndrome" "disorder"))
    (clinical_finding (snomed_concept "Papule of skin" "disorder"))
    (clinical_finding (snomed_concept "Hyperpigmentation of skin" "disorder"))
  )
)
(system_diagnosis_rule
  "Diagnose probable scabies in suspected mpox"
  (diagnosis
    (snomed_concept "Infestation caused by Sarcoptes scabiei var hominis" "disorder")
    probable
  )
  adult
  (and
    (diagnosis (snomed_concept "Monkeypox" "disorder") possible)
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
    (clinical_finding (snomed_concept "Itching" "finding"))
    (clinical_finding (snomed_concept "Burrows in skin" "disorder"))
    (clinical_finding (snomed_concept "Itching" "finding") (qualifier (snomed_concept "Night time" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose probable drug-induced rash in suspected mpox"
  (diagnosis
    (snomed_concept "Eruption caused by drug" "disorder")
    probable
  )
  adult
  (and
    (diagnosis (snomed_concept "Monkeypox" "disorder") possible)
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
    (clinical_finding (snomed_concept "Itching" "finding"))
    (<= (onset (clinical_finding (snomed_concept "New medication commenced" "finding"))) (time_ago 3 months))
  )
)

(system_diagnosis_rule
  "Diagnose probable measles in suspected mpox"
  (diagnosis
    (snomed_concept "Measles" "disorder")
    probable
  )
  adult
  (and
    (diagnosis (snomed_concept "Monkeypox" "disorder") possible)
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
    (no (clinical_finding (snomed_concept "Itching" "finding")))
    (clinical_finding (snomed_concept "Conjunctivitis" "disorder"))
    (clinical_finding (snomed_concept "Cough" "finding"))
    (clinical_finding (snomed_concept "Nasal discharge" "finding"))
    (clinical_finding (snomed_concept "Macular eruption" "disorder"))
  )
)
(system_diagnosis_rule
  "Diagnose probable tick bite fever in suspected mpox"
  (diagnosis
    (snomed_concept "Spotted fever group rickettsial disease" "disorder")
    probable
  )
  adult
  (and
    (diagnosis (snomed_concept "Monkeypox" "disorder") possible)
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
    (no (clinical_finding (snomed_concept "Itching" "finding")))
    (or (clinical_finding (snomed_concept "Tick bite" "disorder"))
        (clinical_finding (snomed_concept "Skin eschar" "disorder"))
    )
  )
)

(system_diagnosis_rule
  "Diagnose probable molluscum contagiosum in suspected mpox"
  (diagnosis
    (snomed_concept "Infection caused by Molluscum contagiosum" "disorder")
    probable
  )
  adult
  (and
    (diagnosis (snomed_concept "Monkeypox" "disorder") possible)
    (clinical_finding (snomed_concept "Localized skin lesion" "disorder"))
    (no (clinical_finding (snomed_concept "Itching" "finding")))
    (clinical_finding (snomed_concept "Papule of skin" "disorder") (qualifier (snomed_concept "Firm" "qualifier value")) (qualifier (snomed_concept "Dome shape" "qualifier value")))
    (clinical_finding (snomed_concept "Skin dimple" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable herpes simplex in suspected mpox"
  (diagnosis
    (snomed_concept "Herpes simplex" "disorder")
    probable
  )
  adult
  (and
    (diagnosis (snomed_concept "Monkeypox" "disorder") possible)
    (clinical_finding (snomed_concept "Localized skin lesion" "disorder"))
    (no (clinical_finding (snomed_concept "Itching" "finding")))
    (clinical_finding (snomed_concept "Pain of skin" "finding"))
    (clinical_finding (snomed_concept "Vesicle of skin" "disorder") (qualifier (snomed_concept "Grouped" "qualifier value")))
    (clinical_finding (snomed_concept "Erythema" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable hand-foot and mouth disease in suspected mpox"
  (diagnosis
    (snomed_concept "Enteroviral vesicular stomatitis with exanthem" "disorder")
    probable
  )
  adult
  (and
    (diagnosis (snomed_concept "Monkeypox" "disorder") possible)
    (clinical_finding (snomed_concept "Localized skin lesion" "disorder"))
    (no (clinical_finding (snomed_concept "Itching" "finding")))
    (clinical_finding (snomed_concept "Pain of skin" "finding"))
    (clinical_finding (snomed_concept "Vesicle of skin" "disorder") (finding_site (snomed_concept "Mouth region structure" "body structure")))
    (clinical_finding (snomed_concept "Vesicle of skin" "disorder") (finding_site (snomed_concept "Entire skin of palmar area of hand" "body structure")))
    (clinical_finding (snomed_concept "Vesicle of skin" "disorder") (finding_site (snomed_concept "Entire skin of sole of foot" "body structure")))
  )
)
(system_diagnosis_rule
  "Diagnose probable shingles in suspected mpox"
  (diagnosis
    (snomed_concept "Herpes zoster" "disorder")
    probable
  )
  adult
  (and
    (diagnosis (snomed_concept "Monkeypox" "disorder") possible)
    (clinical_finding (snomed_concept "Localized skin lesion" "disorder"))
    (no (clinical_finding (snomed_concept "Itching" "finding")))
    (clinical_finding (snomed_concept "Pain of skin" "finding"))
    (clinical_finding (snomed_concept "Blister of skin" "disorder") (qualifier (snomed_concept "Unilateral" "qualifier value")))
  )
)

(system_diagnosis_rule
  "Diagnose probable impetigo in suspected mpox"
  (diagnosis
    (snomed_concept "Impetigo" "disorder")
    probable
  )
  adult
  (and
    (diagnosis (snomed_concept "Monkeypox" "disorder") possible)
    (clinical_finding (snomed_concept "Localized skin lesion" "disorder"))
    (clinical_finding (snomed_concept "Itching" "finding"))
    (clinical_finding (snomed_concept "Crust on skin" "finding"))
  )
)


(system_priority_evaluation
  "Urgent: suspected mpox with danger signs"
  adult
  Urgent
  (and
    (diagnosis (snomed_concept "Monkeypox" "disorder") possible)
    (or

      (clinical_finding (snomed_concept "Shock" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)

      (active_condition (snomed_concept "Dehydration" "disorder"))

      (clinical_finding (snomed_concept "Unable to void urine" "finding"))
      (clinical_finding (snomed_concept "Obstipation" "disorder"))

      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (clinical_finding (snomed_concept "Dyspnea at rest" "finding"))
      (clinical_finding (snomed_concept "Unable to complete a sentence in one breath" "finding"))
      (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %) 90)

      (clinical_finding (snomed_concept "Bleeding from anus" "disorder") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      (clinical_finding (snomed_concept "Anal pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      (clinical_finding (snomed_concept "Discharge from anus" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))

      (active_condition (snomed_concept "Paraphimosis" "disorder"))

      (clinical_finding (snomed_concept "Unable to swallow" "finding"))
      (and (clinical_finding (snomed_concept "Nausea" "finding"))
           (clinical_finding (snomed_concept "Persistent vomiting" "disorder")))

      (active_condition (snomed_concept "Myocarditis" "disorder"))
      (active_condition (snomed_concept "Corneal infection" "disorder"))

      (clinical_finding (snomed_concept "Patient immunocompromised" "finding"))
      (and (clinical_finding (snomed_concept "Human immunodeficiency virus infection" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
           (clinical_finding (snomed_concept "Copies of human immunodeficiency virus ribonucleic acid above reference range" "finding")))
      (clinical_finding (snomed_concept "Malignant neoplastic disease" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
      (clinical_finding (snomed_concept "Transplant present" "finding"))
      (clinical_finding (snomed_concept "Pregnancy" "finding"))
      (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
      (clinical_finding (snomed_concept "Hypertensive disorder, systemic arterial" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
      (clinical_finding (snomed_concept "Chronic lung disease" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
      (clinical_finding (snomed_concept "Chronic disease of skin" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
      (clinical_finding (snomed_concept "Obesity" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))

      (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
      (clinical_finding (snomed_concept "Acute confusion" "finding"))

      (clinical_finding (snomed_concept "Skin lesion" "disorder") (qualifier (snomed_concept "Extensive" "qualifier value")))
      (clinical_finding (snomed_concept "Severe pain" "finding"))
    )
  )
)

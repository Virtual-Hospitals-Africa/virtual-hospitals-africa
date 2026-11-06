;; Page 94 - Changes in skin colour
(task
  "Check for causes of changes in skin colour"
  adult
  (clinical_finding (snomed_concept "Discoloration of skin" "finding"))
  (check_for
    ;; Yellow skin: jaundice likely
    (clinical_finding (snomed_concept "Yellow skin" "finding"))

    ;; Dark patches: where are patches on body?
    (clinical_finding (snomed_concept "Hyperpigmentation of skin" "disorder") (finding_site (snomed_concept "Structure of lower limb from knee to ankle" "body structure")))
    (clinical_finding (snomed_concept "Hyperpigmentation of skin" "disorder") (finding_site (snomed_concept "Face structure" "body structure")))
    (clinical_finding (snomed_concept "Hyperpigmentation of skin" "disorder") (finding_site (snomed_concept "Trunk structure" "body structure")))

    ;; Light patches, and the fine scale of tinea versicolor
    (clinical_finding (snomed_concept "Hypopigmentation of skin" "disorder"))
    (clinical_finding (snomed_concept "Scaly skin" "finding"))

    ;; Absence of colour: patchy or generalised?
    (clinical_finding (snomed_concept "Achromia of skin" "disorder") (qualifier (snomed_concept "Patchy" "qualifier value")))
    (clinical_finding (snomed_concept "Achromia of skin" "disorder") (qualifier (snomed_concept "Generalized" "qualifier value")) (qualifier (snomed_concept "Congenital" "qualifier value")))
    (clinical_finding (snomed_concept "White hair" "finding"))
    (clinical_finding (snomed_concept "Iris hypopigmentation" "finding"))
  )
)
(task
  "Check for urgent jaundice conditions (changes in skin colour)"
  adult
  (or (clinical_finding (snomed_concept "Jaundice" "finding"))
      (active_condition (snomed_concept "Jaundice" "finding")))
  (check_for
    (clinical_finding (snomed_concept "Shock" "disorder"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Easy bruising" "finding"))
    (clinical_finding (snomed_concept "Bleeds easily" "finding"))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))

    (clinical_finding (snomed_concept "Alcohol dependence" "disorder"))
    (clinical_finding (snomed_concept "Drinking binge" "finding"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
    (clinical_finding (snomed_concept "Illicit drug use" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable jaundice from yellow skin"
  (diagnosis
    (snomed_concept "Jaundice" "finding")
    probable
  )
  adult
  (clinical_finding (snomed_concept "Yellow skin" "finding"))
)
(system_diagnosis_rule
  "Diagnose probable venous stasis from dark patches on lower legs"
  (diagnosis
    (snomed_concept "Venous stasis syndrome" "disorder")
    probable
  )
  adult
  (clinical_finding (snomed_concept "Hyperpigmentation of skin" "disorder") (finding_site (snomed_concept "Structure of lower limb from knee to ankle" "body structure")))
)
(system_diagnosis_rule
  "Diagnose probable melasma from dark patches on face"
  (diagnosis
    (snomed_concept "Chloasma" "disorder")
    probable
  )
  adult
  (clinical_finding (snomed_concept "Hyperpigmentation of skin" "disorder") (finding_site (snomed_concept "Face structure" "body structure")))
)
(system_diagnosis_rule
  "Diagnose probable tinea versicolor from scaly light or dark patches"
  (diagnosis
    (snomed_concept "Pityriasis versicolor" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Scaly skin" "finding"))
       (or (clinical_finding (snomed_concept "Hyperpigmentation of skin" "disorder") (finding_site (snomed_concept "Trunk structure" "body structure")))
           (clinical_finding (snomed_concept "Hypopigmentation of skin" "disorder"))))
)
(system_diagnosis_rule
  "Diagnose probable vitiligo from patchy absence of skin colour"
  (diagnosis
    (snomed_concept "Vitiligo" "disorder")
    probable
  )
  adult
  (clinical_finding (snomed_concept "Achromia of skin" "disorder") (qualifier (snomed_concept "Patchy" "qualifier value")))
)
(system_diagnosis_rule
  "Diagnose probable albinism from generalised absence of colour from birth"
  (diagnosis
    (snomed_concept "Albinism" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Achromia of skin" "disorder") (qualifier (snomed_concept "Generalized" "qualifier value")) (qualifier (snomed_concept "Congenital" "qualifier value")))
       (clinical_finding (snomed_concept "White hair" "finding"))
       (clinical_finding (snomed_concept "Iris hypopigmentation" "finding")))
)
(system_priority_evaluation
  "Urgent: jaundice with danger signs (changes in skin colour)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Jaundice" "finding"))
        (active_condition (snomed_concept "Jaundice" "finding")))
    (or
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      ;; Hb < 12 (woman) or < 13 (man): not representable (no haemoglobin observable/unit)
      (clinical_finding (snomed_concept "Shock" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
      (clinical_finding (snomed_concept "Abdominal pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Acute confusion" "finding"))
      (clinical_finding (snomed_concept "Easy bruising" "finding"))
      (clinical_finding (snomed_concept "Bleeds easily" "finding"))
      (clinical_finding (snomed_concept "Pregnancy" "finding"))
      (clinical_finding (snomed_concept "Alcohol dependence" "disorder"))
      (clinical_finding (snomed_concept "Drinking binge" "finding"))
      (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
      (clinical_finding (snomed_concept "Illicit drug use" "finding"))
    )
  )
)

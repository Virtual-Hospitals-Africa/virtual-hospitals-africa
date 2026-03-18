;; Page 67 - Skin Symptoms: Meningococcal disease likely with purpuric rash and meningitis signs
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Meningococcal infectious disease" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    (or
      (clinical_finding (snomed_concept "Stiff neck" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      (clinical_finding (snomed_concept "Fever" "finding"))
    )
  )
)
;; Page 67 - Skin Symptoms: Adverse drug reaction likely with drug-induced eruption and systemic signs
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Adverse reaction caused by drug" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
    (or
      (clinical_finding (snomed_concept "Fever" "finding"))
      (clinical_finding (snomed_concept "Abdominal pain" "finding"))
      (clinical_finding (snomed_concept "Jaundice" "finding"))
      (clinical_finding (snomed_concept "Blister of skin" "disorder"))
    )
  )
)

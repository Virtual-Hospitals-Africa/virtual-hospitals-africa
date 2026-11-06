(task
  "Check for painful skin conditions"
  adult
  (clinical_finding (snomed_concept "Pain of skin" "finding"))
  (check_for

    (clinical_finding (snomed_concept "Mass of skin" "finding"))
    (clinical_finding (snomed_concept "Erythema" "finding"))
    (clinical_finding (snomed_concept "Warm skin" "finding"))


    (clinical_finding (snomed_concept "Swelling of skin" "finding"))
    (clinical_finding (snomed_concept "Erythema" "finding") (qualifier (snomed_concept "Poorly defined" "qualifier value")))
    (clinical_finding (snomed_concept "Erythema" "finding") (qualifier (snomed_concept "Well defined" "qualifier value")) (qualifier (snomed_concept "Raised" "qualifier value")))


    (clinical_finding (snomed_concept "Blister of skin" "disorder") (qualifier (snomed_concept "Zosteriform" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))


    (clinical_finding (snomed_concept "Recurrent abscess of skin" "disorder") (finding_site (snomed_concept "Axillary region structure" "body structure")))
    (clinical_finding (snomed_concept "Recurrent abscess of skin" "disorder") (finding_site (snomed_concept "Inguinal region structure" "body structure")))
    (clinical_finding (snomed_concept "Recurrent abscess of skin" "disorder") (finding_site (snomed_concept "Perineal structure" "body structure")))
  )
)
(system_diagnosis_rule
  "Diagnose probable boil/abscess (painful skin)"
  (diagnosis
    (snomed_concept "Abscess of skin and/or subcutaneous tissue" "disorder")
    probable
  )
  adult


  (and (clinical_finding (snomed_concept "Pain of skin" "finding"))
       (clinical_finding (snomed_concept "Mass of skin" "finding"))
       (clinical_finding (snomed_concept "Erythema" "finding"))
       (clinical_finding (snomed_concept "Warm skin" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable cellulitis (painful skin)"
  (diagnosis
    (snomed_concept "Cellulitis" "disorder")
    probable
  )
  adult


  (and (clinical_finding (snomed_concept "Pain of skin" "finding"))
       (clinical_finding (snomed_concept "Erythema" "finding") (qualifier (snomed_concept "Poorly defined" "qualifier value")))
       (clinical_finding (snomed_concept "Warm skin" "finding"))
       (clinical_finding (snomed_concept "Swelling of skin" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable erysipelas (painful skin)"
  (diagnosis
    (snomed_concept "Erysipelas" "disorder")
    probable
  )
  adult


  (and (clinical_finding (snomed_concept "Pain of skin" "finding"))
       (clinical_finding (snomed_concept "Erythema" "finding") (qualifier (snomed_concept "Well defined" "qualifier value")) (qualifier (snomed_concept "Raised" "qualifier value")))
       (clinical_finding (snomed_concept "Warm skin" "finding"))
       (clinical_finding (snomed_concept "Swelling of skin" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable herpes zoster (painful skin)"
  (diagnosis
    (snomed_concept "Herpes zoster" "disorder")
    probable
  )
  adult

  (and (clinical_finding (snomed_concept "Pain of skin" "finding"))
       (clinical_finding (snomed_concept "Blister of skin" "disorder") (qualifier (snomed_concept "Zosteriform" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose probable hidradenitis suppurativa (painful skin)"
  (diagnosis
    (snomed_concept "Hidradenitis suppurativa" "disorder")
    probable
  )
  adult

  (and (clinical_finding (snomed_concept "Pain of skin" "finding"))
       (or (clinical_finding (snomed_concept "Recurrent abscess of skin" "disorder") (finding_site (snomed_concept "Axillary region structure" "body structure")))
           (clinical_finding (snomed_concept "Recurrent abscess of skin" "disorder") (finding_site (snomed_concept "Inguinal region structure" "body structure")))
           (clinical_finding (snomed_concept "Recurrent abscess of skin" "disorder") (finding_site (snomed_concept "Perineal structure" "body structure")))
       )
  )
)

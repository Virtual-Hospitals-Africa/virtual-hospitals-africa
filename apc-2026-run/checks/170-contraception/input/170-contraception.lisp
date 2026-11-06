(task
  "Check for suspected pregnancy on combined oral contraceptive"
  adult
  (clinical_finding (snomed_concept "Uses combined oral contraception" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Tenderness of breast" "finding"))
    (clinical_finding (snomed_concept "Missed period" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose possible pregnancy on combined oral contraceptive"
  (diagnosis
    (snomed_concept "Pregnancy" "finding")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Uses combined oral contraception" "finding"))
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Tenderness of breast" "finding"))
        (clinical_finding (snomed_concept "Missed period" "finding"))
    )
  )
)

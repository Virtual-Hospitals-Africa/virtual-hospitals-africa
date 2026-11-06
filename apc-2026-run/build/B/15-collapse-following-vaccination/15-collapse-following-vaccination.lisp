;; Page 15 - Collapse following vaccination
;; The red box ("Treat as anaphylaxis 28") is a pointer only; it is not encoded here.
;; The page's own diagnostic logic outside the box ("Fainting episode likely") is encoded below.
;; See 15-collapse-following-vaccination-flowchart.md.
(task
  "Check for features of delayed collapse following vaccination"
  adult
  (and (clinical_finding (snomed_concept "Collapse" "finding"))
       (clinical_finding (snomed_concept "Vaccination given" "situation")))
  (check_for
    ;; Delayed collapse: "Breathing: may have wheeze, stridor, cough"
    (clinical_finding (snomed_concept "Wheezing" "finding"))
    (clinical_finding (snomed_concept "Stridor" "finding"))
    (clinical_finding (snomed_concept "Cough" "finding"))

    ;; Delayed collapse: "Other signs and symptoms (like swelling or rash) present"
    (clinical_finding (snomed_concept "Swelling" "finding"))
    (clinical_finding (snomed_concept "Eruption" "morphologic abnormality"))
  )
)
(system_diagnosis_rule
  "Diagnose probable fainting episode following vaccination"
  (diagnosis
    (snomed_concept "Syncope" "finding")
    probable
  )
  adult
  (and
    ;; Sudden collapse at the time of vaccination
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (clinical_finding (snomed_concept "Vaccination given" "situation"))
    ;; "BP is: briefly low but rapidly normal again" (vs delayed: "BP < 90/60 and remains low")
    (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
    (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
    ;; "Pulse may be slow" (vs delayed: "Pulse > 120")
    (<= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 120)
    ;; "No other signs or symptoms present" (the delayed-collapse signs are absent)
    (no (clinical_finding (snomed_concept "Wheezing" "finding")))
    (no (clinical_finding (snomed_concept "Stridor" "finding")))
    (no (clinical_finding (snomed_concept "Cough" "finding")))
    (no (clinical_finding (snomed_concept "Swelling" "finding")))
    (no (clinical_finding (snomed_concept "Eruption" "morphologic abnormality")))
  )
)

;; Page 22 - Wheeze/tight chest
(task
  "Check for wheeze/tight chest severity and causes"
  adult
  (or (clinical_finding (snomed_concept "Wheezing" "finding"))
      (clinical_finding (snomed_concept "Tight chest" "finding")))
  (check_for
    ;; Red box, life threatening: unable to talk, drowsy or confused
    (clinical_finding (snomed_concept "Unable to speak" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))

    ;; Red box, severe: unable to talk in full sentences, agitated
    (clinical_finding (snomed_concept "Unable to complete a sentence in one breath" "finding"))
    (clinical_finding (snomed_concept "Feeling agitated" "finding"))

    ;; Anaphylaxis pre-screen (bullet 1): sudden wheeze/tight chest and any of ...
    (clinical_finding (snomed_concept "Wheezing" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Tight chest" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Generalized pruritus" "finding"))
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Food" "substance"))
    (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
    (clinical_finding (snomed_concept "Insect sting" "disorder"))

    ;; Heart failure (bullet 2): difficulty breathing worse on lying flat and leg swelling
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
  )
)
(task
  "Check for wheeze in the patient with tight chest"
  adult
  (clinical_finding (snomed_concept "Tight chest" "finding"))
  (check_for
    ;; Silent chest = tight chest but no wheeze (needs wheeze recorded as absent)
    (clinical_finding (snomed_concept "Wheezing" "finding"))
  )
)
(task
  "Measure PEFR for wheeze/tight chest"
  adult
  (or (clinical_finding (snomed_concept "Wheezing" "finding"))
      (clinical_finding (snomed_concept "Tight chest" "finding")))
  (measure
    (measurement (snomed_concept "Recorded/predicted peak expiratory flow rate ratio" "observable entity") %)
  )
)
(system_diagnosis_rule
  "Diagnose possible anaphylaxis from sudden wheeze/tight chest"
  (diagnosis
    (snomed_concept "Anaphylaxis" "disorder")
    possible
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Wheezing" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Tight chest" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value"))))
    (or (clinical_finding (snomed_concept "Generalized pruritus" "finding"))
        (clinical_finding (snomed_concept "Generalized rash" "disorder"))
        (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
        (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
        (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
        (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
        (clinical_finding (snomed_concept "Dizziness" "finding"))
        (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Abdominal pain" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Food" "substance"))
        (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
        (clinical_finding (snomed_concept "Insect sting" "disorder"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable heart failure from wheeze/tight chest"
  (diagnosis
    (snomed_concept "Heart failure" "disorder")
    probable
  )
  adult
  ;; The page's second branch (patient >= 50 years with first episode) is not representable: no age comparison in the language
  (and
    (or (clinical_finding (snomed_concept "Wheezing" "finding"))
        (clinical_finding (snomed_concept "Tight chest" "finding")))
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
  )
)
(system_priority_evaluation
  "Emergency: life-threatening wheeze/tight chest"
  adult
  Emergency
  (and
    (or (clinical_finding (snomed_concept "Wheezing" "finding"))
        (clinical_finding (snomed_concept "Tight chest" "finding")))
    (or (< (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 50)
        (clinical_finding (snomed_concept "Unable to speak" "finding"))
        (and (clinical_finding (snomed_concept "Tight chest" "finding"))
             (no (clinical_finding (snomed_concept "Wheezing" "finding"))))
        (< (measurement (snomed_concept "Recorded/predicted peak expiratory flow rate ratio" "observable entity") %) 33)
        (clinical_finding (snomed_concept "Drowsy" "finding"))
        (clinical_finding (snomed_concept "Acute confusion" "finding"))
    )
  )
)
(system_priority_evaluation
  "Urgent: severe wheeze/tight chest episode"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Wheezing" "finding"))
        (clinical_finding (snomed_concept "Tight chest" "finding")))
    (or (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %) 90)
        (> (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
        (> (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 120)
        (clinical_finding (snomed_concept "Unable to complete a sentence in one breath" "finding"))
        (< (measurement (snomed_concept "Recorded/predicted peak expiratory flow rate ratio" "observable entity") %) 60)
        (clinical_finding (snomed_concept "Feeling agitated" "finding"))
    )
  )
)
(system_priority_evaluation
  "Urgent: wheeze/tight chest"
  adult
  Urgent
  (or (clinical_finding (snomed_concept "Wheezing" "finding"))
      (clinical_finding (snomed_concept "Tight chest" "finding")))
)

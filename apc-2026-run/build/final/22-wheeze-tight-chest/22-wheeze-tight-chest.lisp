;; Page 22 - Wheeze/tight chest
;; See 22-wheeze-tight-chest-flowchart.md for the decision nodes behind each rule.
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

    ;; Heart failure likely: difficulty breathing worse on lying flat and leg swelling
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))

    ;; Check for anaphylaxis: sudden wheeze/tight chest and any of the listed features
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
  )
)
(task
  "Check for wheeze in tight chest"
  adult
  ;; Silent chest = tight chest but no wheeze, so a patient with tight chest is examined for wheeze
  (clinical_finding (snomed_concept "Tight chest" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Wheezing" "finding"))
  )
)
(task
  "Measure PEFR in wheeze/tight chest"
  adult
  (or (clinical_finding (snomed_concept "Wheezing" "finding"))
      (clinical_finding (snomed_concept "Tight chest" "finding")))
  ;; PEFR is expressed as a percentage of the predicted normal value (footnote 2)
  (measure (measurement (snomed_concept "Recorded/predicted peak expiratory flow rate ratio" "observable entity") %))
)
(system_diagnosis_rule
  "Diagnose probable heart failure from wheeze/tight chest"
  (diagnosis
    (snomed_concept "Heart failure" "disorder")
    probable
  )
  adult
  ;; "If difficulty breathing worse on lying flat and leg swelling ... heart failure likely".
  ;; The other branch ("patient >= 50 years with first episode of wheeze/tight chest") needs age,
  ;; which the language cannot express; see remaining questions.
  (and
    (or (clinical_finding (snomed_concept "Wheezing" "finding"))
        (clinical_finding (snomed_concept "Tight chest" "finding")))
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose possible anaphylaxis from sudden wheeze/tight chest"
  (diagnosis
    (snomed_concept "Anaphylaxis" "disorder")
    possible
  )
  adult
  ;; "If sudden wheeze/tight chest and any of: ... check for anaphylaxis 28"
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
        ;; exposure to possible allergen: medication, food or insect bite/sting (footnote 1)
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Food" "substance"))
        (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
        (clinical_finding (snomed_concept "Insect sting" "disorder"))
    )
  )
)
(system_priority_evaluation
  "Emergency: life-threatening wheeze/tight chest"
  adult
  Emergency
  ;; "Assess severity of episode: Any of: pulse < 50, unable to talk, silent chest (tight chest but
  ;; no wheeze), PEFR < 33% of predicted, drowsy or confused?" Yes: Life threatening
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
  "Urgent: severe wheeze/tight chest"
  adult
  Urgent
  ;; "Any of: oxygen saturation < 90%, respiratory rate > 30, pulse > 120, unable to talk in full
  ;; sentences, PEFR < 60% of predicted, agitated?" Yes: Severe
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
  ;; "Give urgent attention to the patient with wheeze/tight chest" (the header applies to every
  ;; patient with the complaint, including mild or moderate episodes)
  (or (clinical_finding (snomed_concept "Wheezing" "finding"))
      (clinical_finding (snomed_concept "Tight chest" "finding")))
)

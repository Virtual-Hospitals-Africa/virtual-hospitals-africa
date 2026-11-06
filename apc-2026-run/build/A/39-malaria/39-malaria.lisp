;; Page 39 - Malaria
;; See 39-malaria-flowchart.md and 39-malaria-remaining-questions.md

;; "Suspect malaria if patient in a malaria area in the past 3 months and now presents with ..."
;; Triggered by any of the page's suspicion symptoms that the app records, to ask about exposure
(task
  "Check for malaria exposure and symptoms"
  adult
  (or (active_condition (snomed_concept "Fever" "finding"))
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (clinical_finding (snomed_concept "Headache" "finding"))
      (clinical_finding (snomed_concept "Fatigue" "finding"))
      (clinical_finding (snomed_concept "Muscle pain" "finding"))
      (clinical_finding (snomed_concept "Cough" "finding"))
      (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (clinical_finding (snomed_concept "Diarrhea" "finding"))
  )
  (check_for
    (clinical_finding (snomed_concept "History of travel with high risk of exposure to communicable disease" "situation"))

    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Shivering or rigors" "finding"))
    (clinical_finding (snomed_concept "Pain of joint" "finding"))
    (clinical_finding (snomed_concept "Influenza-like illness" "finding"))
    (clinical_finding (snomed_concept "Dry cough" "finding"))
  )
)

;; Red box: "Give urgent attention to the patient with suspected malaria and any of:"
(task
  "Check for urgent signs of suspected malaria"
  adult
  (diagnosis (snomed_concept "Malaria" "disorder") possible)
  (check_for
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Post-ictal state" "finding"))

    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Shock" "disorder"))

    (clinical_finding (snomed_concept "Asthenia" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))

    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (clinical_finding (snomed_concept "Bleeds easily" "finding"))
    (clinical_finding (snomed_concept "Easy bruising" "finding"))

    (clinical_finding (snomed_concept "Black urine" "finding"))
    (clinical_finding (snomed_concept "Anuria" "finding"))
    (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))
  )
)

;; "Suspect malaria ..." → possible
(system_diagnosis_rule
  "Diagnose possible malaria"
  (diagnosis
    (snomed_concept "Malaria" "disorder")
    possible
  )
  adult
  (and
    ;; "in a malaria area in the past 3 months"
    (<= (onset (clinical_finding (snomed_concept "History of travel with high risk of exposure to communicable disease" "situation"))) (time_ago 3 months))
    (or (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
        (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
        (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Shivering or rigors" "finding"))
        (clinical_finding (snomed_concept "Pain of joint" "finding"))
        (clinical_finding (snomed_concept "Muscle pain" "finding"))
        (clinical_finding (snomed_concept "Influenza-like illness" "finding"))
        (clinical_finding (snomed_concept "Dry cough" "finding"))
        (and (clinical_finding (snomed_concept "Nausea" "finding"))
             (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
        (clinical_finding (snomed_concept "Diarrhea" "finding"))
    )
  )
)

(system_priority_evaluation
  "Urgent: suspected malaria with danger signs"
  adult
  Urgent
  (and
    (diagnosis (snomed_concept "Malaria" "disorder") possible)
    (or
      ;; Decreased consciousness, drowsy/confused
      (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Acute confusion" "finding"))
      ;; Respiratory rate > 30 or difficulty breathing
      (> (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      ;; Seizure or just had a seizure
      (clinical_finding (snomed_concept "Seizure" "finding"))
      (clinical_finding (snomed_concept "Post-ictal state" "finding"))
      ;; Severe general body weakness
      (clinical_finding (snomed_concept "Asthenia" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      ;; Glucose < 3 (< 4 if diabetes)
      (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
      (and (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
           (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 4))
      ;; Shock/systolic BP < 80 (this page's own logic)
      (clinical_finding (snomed_concept "Shock" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
      ;; Jaundice; easy bleeding or bruising
      (clinical_finding (snomed_concept "Jaundice" "finding"))
      (clinical_finding (snomed_concept "Bleeds easily" "finding"))
      (clinical_finding (snomed_concept "Easy bruising" "finding"))
      ;; Black urine or no urine passed in past 12 hours
      (clinical_finding (snomed_concept "Black urine" "finding"))
      (>= (onset (clinical_finding (snomed_concept "Anuria" "finding"))) (time_ago 12 hours))
      ;; Persistent vomiting
      (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))
      ;; Hb < 7: not representable (no haemoglobin unit/observable), see remaining-questions
    )
  )
)

;; Page 67 - Skin Symptoms
;; Also covers pages 68 (Painful skin), 69 (Generalized itch rash),
;; 70 (Localized itchy rash), 71 (Itch with no rash), 72 (Generalized non-itchy rash)
(task
  "Check for urgent skin symptom conditions"
  adult
  (clinical_finding (finding_site (snomed_concept "Skin structure" "body structure")))
  (check_for
    (clinical_finding (snomed_concept "Generalized pruritus" "finding"))
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
    (clinical_finding (snomed_concept "Wheezing" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Substance" "substance"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding"))
    (<= (onset (clinical_finding (snomed_concept "Eruption caused by drug" "disorder")))
        (time_ago 3 months))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (clinical_finding (snomed_concept "Blister" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Diarrhea" "finding"))
    (clinical_finding (snomed_concept "Perioral dermatitis" "disorder"))
    (clinical_finding (snomed_concept "Periocular dermatitis" "disorder"))
    (clinical_finding (snomed_concept "Rash of genitalia" "disorder"))
    (clinical_finding (snomed_concept "Peeling of skin" "finding"))
    (clinical_finding (snomed_concept "Blister of skin" "disorder"))
  )
)
;; Page 67 - Skin Symptoms: Adverse drug reaction likely with drug-induced eruption and systemic signs
(system_diagnosis_rule
  "Diagnose possible adverse drug reaction"
  (diagnosis
    (snomed_concept "Adverse reaction caused by drug" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
    (or
      (active_condition (snomed_concept "Fever" "finding"))
      (clinical_finding (snomed_concept "Abdominal pain" "finding"))
      (clinical_finding (snomed_concept "Jaundice" "finding"))
      (clinical_finding (snomed_concept "Blister of skin" "disorder"))
    )
  )
)
;; Page 67 - Skin Symptoms: Urgent for meningococcal disease signs
(system_priority_evaluation
  "Urgent: purpuric rash with meningococcal signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    (or
      (clinical_finding (snomed_concept "Stiff neck" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (clinical_finding (snomed_concept "Headache" "finding"))
    )
  )
)
;; Page 67 - Skin Symptoms: Urgent for serious drug reaction signs
(system_priority_evaluation
  "Urgent: drug eruption with systemic signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
    (or
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (clinical_finding (snomed_concept "Abdominal pain" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (clinical_finding (snomed_concept "Diarrhea" "finding"))
      (clinical_finding (snomed_concept "Jaundice" "finding"))
      (clinical_finding (snomed_concept "Blister of skin" "disorder"))
    )
  )
)

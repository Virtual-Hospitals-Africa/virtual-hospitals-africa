;; Page 11 - Initial assessment of the patient
;; The red box applies to every patient, so the check_for task is anchored on the root
;; "Clinical finding" concept (descendants match in due_to): it fires once anything is recorded.
(task
  "Check for urgent signs at initial assessment of the patient"
  adult
  (clinical_finding (snomed_concept "Clinical finding" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Feeling agitated" "finding"))
    (clinical_finding (snomed_concept "Unable to sit up" "finding"))

    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Unable to complete a sentence in one breath" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Cough" "finding"))

    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Recent" "qualifier value")))

    (clinical_finding (snomed_concept "Bleeding" "finding"))
    (clinical_finding (snomed_concept "Hematemesis" "disorder"))
    (clinical_finding (snomed_concept "Hemoptysis" "finding"))

    (clinical_finding (snomed_concept "Burn" "disorder"))
    (clinical_finding (snomed_concept "Injury of eye region" "disorder"))
    (clinical_finding (snomed_concept "Fracture of bone" "disorder"))
    (clinical_finding (snomed_concept "Dislocation of joint" "disorder"))
    (clinical_finding (snomed_concept "Overdose" "disorder"))
    (clinical_finding (snomed_concept "Victim of sexual aggression" "finding") (qualifier (snomed_concept "Recent" "qualifier value")))

    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Non-blanching rash" "disorder"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))

    (clinical_finding (snomed_concept "Severe pain" "finding"))
    (clinical_finding (snomed_concept "Unable to void urine" "finding"))

    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))

    ;; Management line: "known diabetic" (known chronic condition, Will's briefing form)
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
  )
)
;; Red box management: "If decreased consciousness, seizures, confused, unable to sit up or known diabetic, also check glucose."
(task
  "Initial assessment: measure glucose if decreased consciousness, seizures, confused, unable to sit up or diabetic"
  adult
  (or (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
      (clinical_finding (snomed_concept "Seizure" "finding"))
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      (clinical_finding (snomed_concept "Unable to sit up" "finding"))
      (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
      (active_condition (snomed_concept "Diabetes mellitus" "disorder"))
  )
  (measure (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L))
)
;; Routine tests: "If coughing/difficulty breathing, also check respiratory rate and oxygen saturation, if available."
(task
  "Initial assessment: measure respiratory rate and oxygen saturation if coughing or difficulty breathing"
  adult
  (or (clinical_finding (snomed_concept "Cough" "finding"))
      (clinical_finding (snomed_concept "Dyspnea" "finding"))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
  )
  (measure
    (measurement (snomed_concept "Respiratory rate" "observable entity") bpm)
    (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %)
  )
)
;; Continue to assess: patient is pregnant (booking visit). Pregnancy uses the checked-for clinical_finding form (no probable rule diagnoses it). Weight is routine; Hb, rhesus, syphilis and dipstick cannot be modelled.
(task
  "Initial assessment: measure MUAC and height in the pregnant patient"
  adult
  (clinical_finding (snomed_concept "Pregnancy" "finding"))
  (measure
    (measurement (snomed_concept "Mid upper arm circumference" "observable entity") cm)
    (measurement (snomed_concept "Body height" "observable entity") cm)
  )
)
;; Continue to assess: patient has hypertension (once a year: BMI, waist circumference, fingerprick glucose).
(task
  "Initial assessment: measure BMI inputs, waist circumference and glucose in the patient with hypertension"
  adult
  (active_condition (snomed_concept "Hypertensive disorder, systemic arterial" "disorder"))
  (measure
    (measurement (snomed_concept "Body height" "observable entity") cm)
    (measurement (snomed_concept "Waist circumference" "observable entity") cm)
    (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L)
  )
)
;; Continue to assess: patient has diabetes (every visit: fingerprick glucose; once a year: BMI, waist circumference, waist-hip ratio).
(task
  "Initial assessment: measure glucose, BMI inputs, waist and hip circumference in the patient with diabetes"
  adult
  (or (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
      (active_condition (snomed_concept "Diabetes mellitus" "disorder"))
  )
  (measure
    (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L)
    (measurement (snomed_concept "Body height" "observable entity") cm)
    (measurement (snomed_concept "Waist circumference" "observable entity") cm)
    (measurement (snomed_concept "Hip circumference" "observable entity") cm)
  )
)
;; Red box: "Give urgent attention to the patient with any of:"
(system_priority_evaluation
  "Urgent: initial assessment danger signs"
  adult
  Urgent
  (or
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Unable to complete a sentence in one breath" "finding"))
    (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
    (clinical_finding (snomed_concept "Chest pain" "finding"))

    (and (clinical_finding (snomed_concept "Headache" "finding"))
         (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Feeling agitated" "finding"))
    (clinical_finding (snomed_concept "Overdose" "disorder"))
    (clinical_finding (snomed_concept "Victim of sexual aggression" "finding") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Hematemesis" "disorder"))
    (clinical_finding (snomed_concept "Hemoptysis" "finding"))

    (clinical_finding (snomed_concept "Bleeding" "finding"))
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (clinical_finding (snomed_concept "Injury of eye region" "disorder"))
    (clinical_finding (snomed_concept "Severe pain" "finding"))
    (clinical_finding (snomed_concept "Unable to void urine" "finding"))

    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Fracture of bone" "disorder"))
    (clinical_finding (snomed_concept "Dislocation of joint" "disorder"))
    (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Recent" "qualifier value")))
    (and (clinical_finding (snomed_concept "Pregnancy" "finding"))
         (or (clinical_finding (snomed_concept "Abdominal pain" "finding"))
             (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))))
    (clinical_finding (snomed_concept "Non-blanching rash" "disorder"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
  )
)

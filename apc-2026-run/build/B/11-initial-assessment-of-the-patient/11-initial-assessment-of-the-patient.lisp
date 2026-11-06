;; Page 11 - Initial assessment of the patient
;; The red box applies to every patient at first contact. There is no single presenting complaint,
;; so the check_for task is anchored to any recorded common symptom (see remaining-questions).
(task
  "Check for urgent signs at initial assessment of the patient"
  adult
  (or (active_condition (snomed_concept "Fever" "finding"))
      (clinical_finding (snomed_concept "Cough" "finding"))
      (clinical_finding (snomed_concept "Nasal discharge" "finding"))
      (clinical_finding (snomed_concept "Sore throat" "finding"))
      (clinical_finding (snomed_concept "Headache" "finding"))
      (clinical_finding (snomed_concept "Fatigue" "finding"))
      (clinical_finding (snomed_concept "Dyspnea" "finding"))
      (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (clinical_finding (snomed_concept "Diarrhea" "finding"))
      (clinical_finding (snomed_concept "Dizziness" "finding"))
      (clinical_finding (snomed_concept "Muscle pain" "finding"))
      (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
      (clinical_finding (snomed_concept "Backache" "finding"))
      (clinical_finding (snomed_concept "Constipation" "finding"))
      (clinical_finding (snomed_concept "Mass of body region" "finding"))
  )
  (check_for
    ;; Consciousness, seizures, behaviour
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Feeling agitated" "finding"))

    ;; Breathing and chest
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Unable to complete a sentence in one breath" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))

    ;; Bleeding, overdose, assault
    (clinical_finding (snomed_concept "Overdose" "disorder"))
    (clinical_finding (snomed_concept "Victim of sexual aggression" "finding") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Hematemesis" "disorder"))
    (clinical_finding (snomed_concept "Hemoptysis" "finding"))
    (clinical_finding (snomed_concept "Bleeding" "finding"))

    ;; Injury, burn, pain, urine
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (clinical_finding (snomed_concept "Injury of eye region" "disorder"))
    (clinical_finding (snomed_concept "Severe pain" "finding"))
    (clinical_finding (snomed_concept "Unable to void urine" "finding"))
    (clinical_finding (snomed_concept "Fracture of bone" "disorder"))
    (clinical_finding (snomed_concept "Dislocation of joint" "disorder"))

    ;; Swelling, neurology, rash
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Recent" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness" "finding") (qualifier (snomed_concept "Recent" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Non-blanching rash" "disorder"))

    ;; Pregnancy
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))

    ;; Management line: also check glucose if unable to sit up or known diabetic
    (clinical_finding (snomed_concept "Unable to sit up" "finding"))
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
  )
)
;; Red box management: "If decreased consciousness, seizures, confused, unable to sit up or known
;; diabetic, also check glucose." Diabetes box: fingerprick glucose at every visit.
(task
  "Measure glucose at initial assessment: decreased consciousness, seizures, confused, unable to sit up or diabetic"
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
  "Measure respiratory rate and oxygen saturation at initial assessment: coughing or difficulty breathing"
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
;; Red box: "Give urgent attention to the patient with any of:"
(system_priority_evaluation
  "Urgent: initial assessment red-box signs"
  adult
  Urgent
  (or (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
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
      (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Recent" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness" "finding") (qualifier (snomed_concept "Recent" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (and (clinical_finding (snomed_concept "Pregnancy" "finding"))
           (or (clinical_finding (snomed_concept "Abdominal pain" "finding"))
               (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))))
      (clinical_finding (snomed_concept "Non-blanching rash" "disorder"))
  )
)

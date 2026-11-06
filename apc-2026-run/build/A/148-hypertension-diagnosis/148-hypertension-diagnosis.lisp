;; Page 148 - Hypertension: diagnosis
(task
  "Check for urgent severely raised BP conditions"
  adult
  (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
      (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110))
  (check_for
    ;; Sudden onset symptoms: stroke likely
    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Seizure" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty swallowing" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))

    ;; Hypertensive emergency
    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Renal failure syndrome" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Preinfarction syndrome" "disorder"))
    (clinical_finding (snomed_concept "Dyspnea" "finding"))
    (clinical_finding (snomed_concept "Heart failure" "disorder") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))

    ;; Hypertensive urgency (severe headache above)
    (clinical_finding (snomed_concept "Renal impairment" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
  )
)
;; Red box: sudden onset of symptoms with SBP >= 180 and/or DBP >= 110, stroke likely
(system_diagnosis_rule
  "Diagnose probable stroke with severely raised BP"
  (diagnosis
    (snomed_concept "Cerebrovascular accident" "disorder")
    probable
  )
  adult
  (and (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
            (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110))
       (or (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Seizure" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Difficulty swallowing" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))))
)
;; Red box left column: hypertensive emergency likely if SBP >= 180 and/or DBP >= 130 and any of
(system_diagnosis_rule
  "Diagnose probable hypertensive emergency"
  (diagnosis
    (snomed_concept "Hypertensive emergency" "disorder")
    probable
  )
  adult
  (and (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
            (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 130))
       (or (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
           (clinical_finding (snomed_concept "Renal failure syndrome" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
           (clinical_finding (snomed_concept "Chest pain" "finding"))
           (clinical_finding (snomed_concept "Preinfarction syndrome" "disorder"))
           (clinical_finding (snomed_concept "Dyspnea" "finding"))
           (clinical_finding (snomed_concept "Heart failure" "disorder") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))))
)
;; Red box right column: hypertensive urgency likely if SBP >= 180 and/or DBP >= 110 and any of
(system_diagnosis_rule
  "Diagnose probable hypertensive urgency"
  (diagnosis
    (snomed_concept "Hypertensive urgency" "disorder")
    probable
  )
  adult
  (and (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
            (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110))
       (or (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
           (clinical_finding (snomed_concept "Renal impairment" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
           (clinical_finding (snomed_concept "Orthopnea" "finding"))
           (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))))
)
;; Red box right column: difficulty breathing worse on lying flat or leg swelling, heart failure likely
(system_diagnosis_rule
  "Diagnose probable heart failure with severely raised BP"
  (diagnosis
    (snomed_concept "Heart failure" "disorder")
    probable
  )
  adult
  (and (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
            (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110))
       (or (clinical_finding (snomed_concept "Orthopnea" "finding"))
           (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))))
)
;; Red box header: give urgent attention to the patient with SBP >= 180 and/or DBP >= 110 and symptoms
(system_priority_evaluation
  "Urgent: severely raised BP with symptoms"
  adult
  Urgent
  (and (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
            (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110))
       (or (active_condition (snomed_concept "Cerebrovascular accident" "disorder"))
           (active_condition (snomed_concept "Hypertensive emergency" "disorder"))
           (active_condition (snomed_concept "Hypertensive urgency" "disorder"))))
)

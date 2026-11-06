;; Page 148 - Hypertension: diagnosis
;; Red box: give urgent attention to the patient with systolic BP >= 180 and/or diastolic BP >= 110 and symptoms
(task
  "Check for urgent symptoms with BP ≥ 180/110"
  adult
  (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180) (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110))
  (check_for
    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Seizure" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty swallowing" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))

    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Chronic kidney disease stage 5" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Preinfarction syndrome" "disorder"))
    (clinical_finding (snomed_concept "Dyspnea" "finding"))
    (clinical_finding (snomed_concept "Heart failure" "disorder") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))

    (clinical_finding (snomed_concept "Renal impairment" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
  )
)
;; "Sudden onset of: ... stroke likely 152"
(system_diagnosis_rule
  "Diagnose probable stroke with BP ≥ 180/110 (hypertension diagnosis)"
  (diagnosis
    (snomed_concept "Cerebrovascular accident" "disorder")
    probable
  )
  adult
  (and
    (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180) (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110))
    (or (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Seizure" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Difficulty swallowing" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    )
  )
)
;; "Hypertensive emergency likely if SBP >= 180 and/or DBP >= 130 and any of"
(system_diagnosis_rule
  "Diagnose probable hypertensive emergency"
  (diagnosis
    (snomed_concept "Hypertensive emergency" "disorder")
    probable
  )
  adult
  (and
    (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180) (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 130))
    (or (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
        (clinical_finding (snomed_concept "Chronic kidney disease stage 5" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
        (clinical_finding (snomed_concept "Chest pain" "finding"))
        (clinical_finding (snomed_concept "Preinfarction syndrome" "disorder"))
        (clinical_finding (snomed_concept "Dyspnea" "finding"))
        (clinical_finding (snomed_concept "Heart failure" "disorder") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    )
  )
)
;; "Hypertensive urgency likely if SBP >= 180 and/or DBP >= 110 and any of"
(system_diagnosis_rule
  "Diagnose probable hypertensive urgency"
  (diagnosis
    (snomed_concept "Hypertensive urgency" "disorder")
    probable
  )
  adult
  (and
    (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180) (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110))
    (or (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
        (clinical_finding (snomed_concept "Renal impairment" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
        (clinical_finding (snomed_concept "Orthopnea" "finding"))
        (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
    )
  )
)
;; "Difficulty breathing worse on lying flat or leg swelling, heart failure likely"
(system_diagnosis_rule
  "Diagnose probable heart failure with BP ≥ 180/110 (hypertension diagnosis)"
  (diagnosis
    (snomed_concept "Heart failure" "disorder")
    probable
  )
  adult
  (and
    (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180) (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110))
    (or (clinical_finding (snomed_concept "Orthopnea" "finding"))
        (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
    )
  )
)
(system_priority_evaluation
  "Urgent: symptomatic BP ≥ 180/110 (hypertension diagnosis)"
  adult
  Urgent
  (and
    (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180) (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110))
    (or (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Seizure" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Difficulty swallowing" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
        (clinical_finding (snomed_concept "Chronic kidney disease stage 5" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
        (clinical_finding (snomed_concept "Chest pain" "finding"))
        (clinical_finding (snomed_concept "Preinfarction syndrome" "disorder"))
        (clinical_finding (snomed_concept "Dyspnea" "finding"))
        (clinical_finding (snomed_concept "Heart failure" "disorder") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
        (clinical_finding (snomed_concept "Renal impairment" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
        (clinical_finding (snomed_concept "Orthopnea" "finding"))
        (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
    )
  )
)

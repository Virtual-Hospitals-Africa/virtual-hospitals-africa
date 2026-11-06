;; Page 23 - Cough or difficulty breathing
(task
  "Check for urgent cough or difficulty breathing conditions"
  adult
  (or (clinical_finding (snomed_concept "Cough" "finding"))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding")))
  (check_for
    ;; heart failure likely
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Swelling of lower limb" "finding"))

    ;; cyanosed
    (clinical_finding (snomed_concept "Cyanosis" "finding"))

    ;; tension pneumothorax likely
    (clinical_finding (snomed_concept "Dyspnea" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Hyperresonance" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Decreased breath sounds" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Trachea displaced" "disorder"))

    ;; wheeze/tight chest
    (clinical_finding (snomed_concept "Wheezing" "finding"))
    (clinical_finding (snomed_concept "Tight chest" "finding"))

    ;; confused, agitated or reduced consciousness
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Feeling agitated" "finding"))
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))

    ;; breathless at rest or while talking
    (clinical_finding (snomed_concept "Dyspnea at rest" "finding"))
    (clinical_finding (snomed_concept "Unable to complete a sentence in one breath" "finding"))

    ;; shock, coughing blood, calf
    (clinical_finding (snomed_concept "Shock" "disorder"))
    (clinical_finding (snomed_concept "Hemoptysis" "finding"))
    (clinical_finding (snomed_concept "Swollen calf" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Pain in calf" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))

    ;; rapid deep breathing -> fingerprick glucose
    (clinical_finding (snomed_concept "Kussmaul's respiration" "finding"))
  )
)
(task
  "Check for causes of cough or difficulty breathing not needing urgent attention"
  adult
  (or (clinical_finding (snomed_concept "Cough" "finding"))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding")))
  (check_for
    ;; duration and recurrence
    (clinical_finding (snomed_concept "Cough" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))

    ;; cough < 2 weeks: auscultation, recent cold
    (clinical_finding (snomed_concept "Respiratory crackles" "finding"))
    (clinical_finding (snomed_concept "Bronchial breathing" "finding"))
    (clinical_finding (snomed_concept "Common cold" "disorder"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Productive cough" "finding"))

    ;; cough/difficulty breathing >= 2 weeks or recurrent
    (clinical_finding (snomed_concept "Itching" "finding") (finding_site (snomed_concept "Nasal structure" "body structure")))
    (clinical_finding (snomed_concept "Nasal congestion" "finding"))
    (clinical_finding (snomed_concept "Clearing throat - hawking" "finding"))
    (clinical_finding (snomed_concept "Human immunodeficiency virus infection" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Dry cough" "finding"))
    (clinical_finding (snomed_concept "Habitual snoring" "finding"))
    (clinical_finding (snomed_concept "Poor sleep pattern" "finding"))
    (clinical_finding (snomed_concept "Upper respiratory infection" "disorder"))
    (clinical_finding (snomed_concept "Smoker" "finding"))
    (clinical_finding (snomed_concept "Ex-smoker" "finding"))
    (clinical_finding (snomed_concept "Weight decreased" "finding"))
  )
)
(task
  "Measure fingerprick glucose if rapid deep breathing with cough/difficulty breathing"
  adult
  (clinical_finding (snomed_concept "Kussmaul's respiration" "finding"))
  (measure (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L))
)
(system_diagnosis_rule
  "Diagnose probable heart failure (cough/difficulty breathing page)"
  (diagnosis
    (snomed_concept "Heart failure" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Orthopnea" "finding"))
       (clinical_finding (snomed_concept "Swelling of lower limb" "finding")))
)
(system_diagnosis_rule
  "Diagnose probable tension pneumothorax (cough/difficulty breathing page)"
  (diagnosis
    (snomed_concept "Tension pneumothorax" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Dyspnea" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (or (clinical_finding (snomed_concept "Hyperresonance" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
        (clinical_finding (snomed_concept "Decreased breath sounds" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
        (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value"))))
    (clinical_finding (snomed_concept "Trachea displaced" "disorder"))
    (or (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
        (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60))
  )
)
;; Cough < 2 weeks and not recurrent, no crackles or bronchial breathing (see 23-cough-or-difficulty-breathing-flowchart.md)
(system_diagnosis_rule
  "Diagnose probable acute viral infection (short cough, no crackles)"
  (diagnosis
    (snomed_concept "Acute viral disease" "disorder")
    probable
  )
  adult
  (and
    (<= (onset (clinical_finding (snomed_concept "Cough" "finding"))) (time_ago 2 weeks))
    (no (clinical_finding (snomed_concept "Cough" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value"))))
    (no (clinical_finding (snomed_concept "Respiratory crackles" "finding")))
    (no (clinical_finding (snomed_concept "Bronchial breathing" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable acute bronchitis (short cough, recent cold)"
  (diagnosis
    (snomed_concept "Acute bronchitis" "disorder")
    probable
  )
  adult
  (and
    (<= (onset (clinical_finding (snomed_concept "Cough" "finding"))) (time_ago 2 weeks))
    (no (clinical_finding (snomed_concept "Cough" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value"))))
    (no (clinical_finding (snomed_concept "Respiratory crackles" "finding")))
    (no (clinical_finding (snomed_concept "Bronchial breathing" "finding")))
    (clinical_finding (snomed_concept "Common cold" "disorder"))
    (or (clinical_finding (snomed_concept "Tight chest" "finding"))
        (clinical_finding (snomed_concept "Chest pain" "finding"))
        (clinical_finding (snomed_concept "Productive cough" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable pneumonia (short cough with crackles/bronchial breathing)"
  (diagnosis
    (snomed_concept "Pneumonia" "disorder")
    probable
  )
  adult
  (and
    (<= (onset (clinical_finding (snomed_concept "Cough" "finding"))) (time_ago 2 weeks))
    (no (clinical_finding (snomed_concept "Cough" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value"))))
    (or (clinical_finding (snomed_concept "Respiratory crackles" "finding"))
        (clinical_finding (snomed_concept "Bronchial breathing" "finding")))
  )
)
;; Cough/difficulty breathing >= 2 weeks or recurrent episodes
(system_diagnosis_rule
  "Diagnose possible nose disorder (chronic or recurrent cough)"
  (diagnosis
    (snomed_concept "Disorder of the nose" "disorder")
    possible
  )
  adult
  (and
    (or (>= (onset (clinical_finding (snomed_concept "Cough" "finding"))) (time_ago 2 weeks))
        (>= (onset (clinical_finding (snomed_concept "Difficulty breathing" "finding"))) (time_ago 2 weeks))
        (clinical_finding (snomed_concept "Cough" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))
        (clinical_finding (snomed_concept "Difficulty breathing" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value"))))
    (or (clinical_finding (snomed_concept "Itching" "finding") (finding_site (snomed_concept "Nasal structure" "body structure")))
        (clinical_finding (snomed_concept "Nasal congestion" "finding"))
        (clinical_finding (snomed_concept "Clearing throat - hawking" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose possible asthma (chronic or recurrent cough/difficulty breathing)"
  (diagnosis
    (snomed_concept "Asthma" "disorder")
    possible
  )
  adult
  (or (>= (onset (clinical_finding (snomed_concept "Cough" "finding"))) (time_ago 2 weeks))
      (>= (onset (clinical_finding (snomed_concept "Difficulty breathing" "finding"))) (time_ago 2 weeks))
      (clinical_finding (snomed_concept "Cough" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value"))))
)
(system_diagnosis_rule
  "Diagnose possible COPD (chronic or recurrent cough/difficulty breathing)"
  (diagnosis
    (snomed_concept "Chronic obstructive pulmonary disease" "disorder")
    possible
  )
  adult
  (or (>= (onset (clinical_finding (snomed_concept "Cough" "finding"))) (time_ago 2 weeks))
      (>= (onset (clinical_finding (snomed_concept "Difficulty breathing" "finding"))) (time_ago 2 weeks))
      (clinical_finding (snomed_concept "Cough" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value"))))
)
(system_diagnosis_rule
  "Diagnose probable PJP (chronic cough with HIV)"
  (diagnosis
    (snomed_concept "Pneumocystosis jirovecii pneumonia" "disorder")
    probable
  )
  adult
  (and
    (or (>= (onset (clinical_finding (snomed_concept "Cough" "finding"))) (time_ago 2 weeks))
        (>= (onset (clinical_finding (snomed_concept "Difficulty breathing" "finding"))) (time_ago 2 weeks))
        (clinical_finding (snomed_concept "Cough" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))
        (clinical_finding (snomed_concept "Difficulty breathing" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value"))))
    (clinical_finding (snomed_concept "Human immunodeficiency virus infection" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Dry cough" "finding"))
    (clinical_finding (snomed_concept "Dyspnea" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable obstructive sleep apnoea (chronic cough page)"
  (diagnosis
    (snomed_concept "Obstructive sleep apnea syndrome" "disorder")
    probable
  )
  adult
  (and
    (or (>= (onset (clinical_finding (snomed_concept "Cough" "finding"))) (time_ago 2 weeks))
        (>= (onset (clinical_finding (snomed_concept "Difficulty breathing" "finding"))) (time_ago 2 weeks))
        (clinical_finding (snomed_concept "Cough" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))
        (clinical_finding (snomed_concept "Difficulty breathing" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value"))))
    (or (clinical_finding (snomed_concept "Habitual snoring" "finding"))
        (clinical_finding (snomed_concept "Poor sleep pattern" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable post-infectious cough"
  (diagnosis
    (snomed_concept "Persistent cough after viral respiratory infection" "disorder")
    probable
  )
  adult
  (and
    (or (>= (onset (clinical_finding (snomed_concept "Cough" "finding"))) (time_ago 2 weeks))
        (clinical_finding (snomed_concept "Cough" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value"))))
    (clinical_finding (snomed_concept "Upper respiratory infection" "disorder"))
    (no (clinical_finding (snomed_concept "Difficulty breathing" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose possible lung cancer (smoker with chronic cough and weight loss)"
  (diagnosis
    (snomed_concept "Malignant neoplasm of lung" "disorder")
    possible
  )
  adult
  (and
    (or (>= (onset (clinical_finding (snomed_concept "Cough" "finding"))) (time_ago 2 weeks))
        (>= (onset (clinical_finding (snomed_concept "Difficulty breathing" "finding"))) (time_ago 2 weeks))
        (clinical_finding (snomed_concept "Cough" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))
        (clinical_finding (snomed_concept "Difficulty breathing" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value"))))
    (or (clinical_finding (snomed_concept "Smoker" "finding"))
        (clinical_finding (snomed_concept "Ex-smoker" "finding")))
    (clinical_finding (snomed_concept "Weight decreased" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable COPD (smoker with cough for 2 years or more)"
  (diagnosis
    (snomed_concept "Chronic obstructive pulmonary disease" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Smoker" "finding"))
        (clinical_finding (snomed_concept "Ex-smoker" "finding")))
    (>= (onset (clinical_finding (snomed_concept "Cough" "finding"))) (time_ago 2 years))
  )
)
(system_priority_evaluation
  "Urgent: cough or difficulty breathing with red-box signs"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Cough" "finding"))
        (clinical_finding (snomed_concept "Difficulty breathing" "finding")))
    (or
      (active_condition (snomed_concept "Heart failure" "disorder"))
      (clinical_finding (snomed_concept "Cyanosis" "finding"))
      (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %) 92)
      (active_condition (snomed_concept "Tension pneumothorax" "disorder"))
      (clinical_finding (snomed_concept "Wheezing" "finding"))
      (clinical_finding (snomed_concept "Tight chest" "finding"))
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      (clinical_finding (snomed_concept "Feeling agitated" "finding"))
      (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
      (clinical_finding (snomed_concept "Dyspnea at rest" "finding"))
      (clinical_finding (snomed_concept "Unable to complete a sentence in one breath" "finding"))
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (clinical_finding (snomed_concept "Shock" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
      (> (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 120)
      (clinical_finding (snomed_concept "Hemoptysis" "finding"))
      (and (clinical_finding (snomed_concept "Swollen calf" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
           (clinical_finding (snomed_concept "Pain in calf" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value"))))
    )
  )
)

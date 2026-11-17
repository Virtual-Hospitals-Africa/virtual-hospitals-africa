;; Page 46 - Dizziness
;; See 46-dizziness-flowchart.md for the decision nodes behind each rule.
(task
  "Check for urgent dizziness conditions"
  adult
  (clinical_finding (snomed_concept "Dizziness" "finding"))
  (check_for
    ;; New sudden asymmetric weakness or numbness of face, arm or leg; difficulty speaking or visual disturbance
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))

    ;; New sudden severe dizziness with nausea/vomiting, abnormal eye movements/walk
    (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Disorder of eye movements" "disorder"))
    (clinical_finding (snomed_concept "Abnormal gait" "finding"))

    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))

    (clinical_finding (snomed_concept "Injury of head" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Unable to stand alone" "finding"))
    (clinical_finding (snomed_concept "Shock" "disorder"))
    (clinical_finding (snomed_concept "Pulse irregular" "finding"))
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
  )
)
(task
  "Check for causes of dizziness not needing urgent attention"
  adult
  (clinical_finding (snomed_concept "Dizziness" "finding"))
  (check_for
    ;; Was patient breathing very quickly or deeply immediately before or during the collapse?
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (clinical_finding (snomed_concept "Tachypnea" "finding"))
    (clinical_finding (snomed_concept "Excessively deep breathing" "finding"))

    ;; Is there hearing loss or tinnitus?
    (clinical_finding (snomed_concept "Hearing loss" "disorder"))
    (clinical_finding (snomed_concept "Tinnitus" "finding"))

    ;; Associated symptoms and length of dizziness
    (clinical_finding (snomed_concept "Positional vertigo" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)
(task
  "Measure lying and standing BP for dizziness"
  adult
  (clinical_finding (snomed_concept "Dizziness" "finding"))
  (measure
    (measurement (snomed_concept "Lying systolic blood pressure" "observable entity") mmHg)
    (measurement (snomed_concept "Lying diastolic blood pressure" "observable entity") mmHg)
    (measurement (snomed_concept "Standing systolic blood pressure" "observable entity") mmHg)
    (measurement (snomed_concept "Standing diastolic blood pressure" "observable entity") mmHg)
  )
)
(system_diagnosis_rule
  "Diagnose possible stroke with dizziness"
  (diagnosis
    (snomed_concept "Cerebrovascular accident" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (or
      (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    )
  )
)
(system_diagnosis_rule
  "Diagnose possible TIA with dizziness"
  (diagnosis
    (snomed_concept "Transient ischemic attack" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (or
      (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable hyperventilation with dizziness"
  (diagnosis
    (snomed_concept "Hyperventilation" "finding")
    probable
  )
  adult
  ;; Q2 = Yes: breathing very quickly or deeply immediately before or during the collapse
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (or
      (clinical_finding (snomed_concept "Tachypnea" "finding"))
      (clinical_finding (snomed_concept "Excessively deep breathing" "finding"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable positional vertigo with dizziness"
  (diagnosis
    (snomed_concept "Positional vertigo" "finding")
    probable
  )
  adult
  ;; Q2 = No, Q3 = No: sudden dizziness lasting seconds, precipitated by head movements
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (or
      (no (clinical_finding (snomed_concept "Collapse" "finding")))
      (and
        (no (clinical_finding (snomed_concept "Tachypnea" "finding")))
        (no (clinical_finding (snomed_concept "Excessively deep breathing" "finding")))
      )
    )
    (no (clinical_finding (snomed_concept "Hearing loss" "disorder")))
    (no (clinical_finding (snomed_concept "Tinnitus" "finding")))
    (clinical_finding (snomed_concept "Positional vertigo" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose probable vestibular neuronitis with dizziness"
  (diagnosis
    (snomed_concept "Vestibular neuronitis of inner ear" "disorder")
    probable
  )
  adult
  ;; Q2 = No, Q3 = No: sudden dizziness lasting hours/days with nausea/vomiting
  (and
    (or
      (no (clinical_finding (snomed_concept "Collapse" "finding")))
      (and
        (no (clinical_finding (snomed_concept "Tachypnea" "finding")))
        (no (clinical_finding (snomed_concept "Excessively deep breathing" "finding")))
      )
    )
    (no (clinical_finding (snomed_concept "Hearing loss" "disorder")))
    (no (clinical_finding (snomed_concept "Tinnitus" "finding")))
    (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (>= (onset (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))) (time_ago 1 hours))
    (or
      (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    )
  )
)
;; New sudden asymmetric weakness or numbness of face, arm or leg; difficulty speaking or visual disturbance
(system_priority_evaluation
  "Urgent: dizziness with weakness of face muscles (sudden onset)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: dizziness with muscle weakness of upper limb (sudden onset)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: dizziness with weakness of muscle of lower limb (sudden onset)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: dizziness with numbness of face (sudden onset)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: dizziness with numbness of upper limb (sudden onset)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: dizziness with numbness of lower limb (sudden onset)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: dizziness with difficulty talking (sudden onset)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: dizziness with visual disturbance (sudden onset)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)
;; New sudden severe dizziness with nausea/vomiting, abnormal eye movements/walk
(system_priority_evaluation
  "Urgent: dizziness with dizziness (sudden onset, severe) and nausea or finding of vomiting …"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (or
      (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (clinical_finding (snomed_concept "Disorder of eye movements" "disorder"))
      (clinical_finding (snomed_concept "Abnormal gait" "finding"))
    )
  )
)
;; Difficulty breathing, especially on lying flat with leg swelling
(system_priority_evaluation
  "Urgent: dizziness with difficulty breathing"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: dizziness with chest pain"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: dizziness with injury of head (recent)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Injury of head" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: dizziness with unable to stand alone"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Unable to stand alone" "finding"))
  )
)
;; Shock/SBP < 80
(system_priority_evaluation
  "Urgent: dizziness with shock"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Shock" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: dizziness with systolic blood pressure < 80 mmHg"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
  )
)
;; Pulse < 50 or irregular
(system_priority_evaluation
  "Urgent: dizziness with pulse, function < 50 bpm"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (< (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 50)
  )
)

(system_priority_evaluation
  "Urgent: dizziness with pulse irregular"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Pulse irregular" "finding"))
  )
)
;; Glucose < 3 (or < 4 if diabetes)

(system_priority_evaluation
  "Urgent: dizziness with blood glucose status < 3 mmol/L"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
  )
)

(system_priority_evaluation
  "Urgent: dizziness with diabetes mellitus (known present) and blood glucose status < 4 mmol/L"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 4)
  )
)

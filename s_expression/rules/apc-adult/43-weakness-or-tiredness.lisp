;; Page 43 - Weakness or tiredness
(task
  "Check for urgent weakness or tiredness conditions"
  adult
  (or (clinical_finding (snomed_concept "Fatigue" "finding"))
      (clinical_finding (snomed_concept "Asthenia" "finding")))
  (check_for
    ;; New sudden asymmetric weakness or numbness of face, arm or leg; difficulty speaking or visual disturbance
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))

    ;; Glucose < 4 if diabetes
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))

    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))

    ;; Heart failure likely
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))

    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))

    ;; Dehydration likely
    (clinical_finding (snomed_concept "Increased thirst" "finding"))
    (clinical_finding (snomed_concept "Xerostomia" "finding"))
    (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose possible stroke (weakness or tiredness page)"
  (diagnosis
    (snomed_concept "Cerebrovascular accident" "disorder")
    possible
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding")))
    (or (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
        (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
        (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
        (clinical_finding (snomed_concept "Difficulty talking" "finding"))
        (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose possible TIA (weakness or tiredness page)"
  (diagnosis
    (snomed_concept "Transient ischemic attack" "disorder")
    possible
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding")))
    (or (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
        (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
        (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
        (clinical_finding (snomed_concept "Difficulty talking" "finding"))
        (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable heart failure (weakness or tiredness page)"
  (diagnosis
    (snomed_concept "Heart failure" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding")))
    ;; Difficulty breathing worse on lying flat and leg swelling
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable dehydration (weakness or tiredness page)"
  (diagnosis
    (snomed_concept "Dehydration" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding")))
    ;; Read as "any of" the listed signs; see remaining-questions
    (or (clinical_finding (snomed_concept "Increased thirst" "finding"))
        (clinical_finding (snomed_concept "Xerostomia" "finding"))
        (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
        (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
        (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
    )
  )
)
;; Consider stroke or TIA
(system_priority_evaluation
  "Urgent: weakness or tiredness with weakness of face muscles (sudden onset, asymmetry)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding")))
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: weakness or tiredness with muscle weakness of upper limb (sudden onset, asymmetry)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: weakness or tiredness with weakness of muscle of lower limb (sudden onset, asymmetry)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: weakness or tiredness with numbness of face (sudden onset, asymmetry)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding")))
    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: weakness or tiredness with numbness of upper limb (sudden onset, asymmetry)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding")))
    (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: weakness or tiredness with numbness of lower limb (sudden onset, asymmetry)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: weakness or tiredness with difficulty talking"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: weakness or tiredness with visual disturbance"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding")))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
  )
)
;; Glucose < 3 (or < 4 if diabetes) or >= 11.1
(system_priority_evaluation
  "Urgent: weakness or tiredness with blood glucose status < 3 mmol/L"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding")))
    (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
  )
)

(system_priority_evaluation
  "Urgent: weakness or tiredness with blood glucose status < 4 mmol/L and diabetes mellitus (known present)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding")))
    (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 4)
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: weakness or tiredness with blood glucose status ≥ 11.1 mmol/L"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding")))
    (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)
  )
)

(system_priority_evaluation
  "Urgent: weakness or tiredness with chest pain"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding")))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: weakness or tiredness with difficulty breathing"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding")))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: weakness or tiredness with respiratory rate ≥ 30 bpm"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding")))
    (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
  )
)
;; Heart failure likely
(system_priority_evaluation
  "Urgent: weakness or tiredness with heart failure"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding")))
    (active_condition (snomed_concept "Heart failure" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: weakness or tiredness with weakness of muscle of lower limb (worsening)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
  )
)
;; Dehydration likely
(system_priority_evaluation
  "Urgent: weakness or tiredness with dehydration"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding")))
    (active_condition (snomed_concept "Dehydration" "disorder"))
  )
)
;; Temperature >= 38 now or in past 3 days
(system_priority_evaluation
  "Urgent: weakness or tiredness with body temperature ≥ 38 °C"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding")))
    (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
  )
)

(system_priority_evaluation
  "Urgent: weakness or tiredness with fever"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding")))
    (active_condition (snomed_concept "Fever" "finding"))
  )
)

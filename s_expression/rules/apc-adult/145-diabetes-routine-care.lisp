;; Page 145 - Diabetes: routine care
(task
  "Check for urgent diabetes conditions"
  adult
  (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
  (check_for
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Abnormal behavior" "finding"))

    (clinical_finding (snomed_concept "Asthenia" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Tremor" "finding"))
    (clinical_finding (snomed_concept "Sweating" "finding"))
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Kussmaul's respiration" "finding"))

    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Excessive thirst" "finding"))
    (clinical_finding (snomed_concept "Hungry" "finding"))

    (clinical_finding (snomed_concept "Dehydration" "disorder"))
    (clinical_finding (snomed_concept "Xerostomia" "finding"))
    (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
  )
)
(task
  "Check urine dipstick for ketones in diabetes with fingerprick glucose >= 11.1"
  adult
  (and (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
       (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1))
  (check_for
    (clinical_finding (snomed_concept "Ketonuria" "finding"))
  )
)
(task
  "Measure waist circumference in routine diabetes care"
  adult
  (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
  (measure
    (measurement (snomed_concept "Waist circumference" "observable entity") cm)
  )
)

(system_priority_evaluation
  "Urgent: diabetes with chest pain"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: diabetes with seizure"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (clinical_finding (snomed_concept "Seizure" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: diabetes with decreased level of consciousness"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: diabetes with drowsy"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: diabetes with acute confusion"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: diabetes with abnormal behavior"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (clinical_finding (snomed_concept "Abnormal behavior" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: diabetes with asthenia"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (clinical_finding (snomed_concept "Asthenia" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: diabetes with dizziness"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: diabetes with tremor"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (clinical_finding (snomed_concept "Tremor" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: diabetes with sweating"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (clinical_finding (snomed_concept "Sweating" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: diabetes with palpitations"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (clinical_finding (snomed_concept "Palpitations" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: diabetes with kussmaul's respiration"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (clinical_finding (snomed_concept "Kussmaul's respiration" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: diabetes with nausea"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (clinical_finding (snomed_concept "Nausea" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: diabetes with finding of vomiting"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: diabetes with abdominal pain"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: diabetes with excessive thirst"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (clinical_finding (snomed_concept "Excessive thirst" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: diabetes with hungry"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (clinical_finding (snomed_concept "Hungry" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: diabetes with body temperature ≥ 38 °C"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
  )
)
;; Dehydration: dry mouth, poor skin turgor, BP < 90/60, pulse >= 100 (each sign counts on its own)

(system_priority_evaluation
  "Urgent: diabetes with dehydration"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (clinical_finding (snomed_concept "Dehydration" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: diabetes with xerostomia"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (clinical_finding (snomed_concept "Xerostomia" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: diabetes with decreased skin turgor"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: diabetes with systolic blood pressure < 90 mmHg"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
  )
)

(system_priority_evaluation
  "Urgent: diabetes with diastolic blood pressure < 60 mmHg"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
  )
)

(system_priority_evaluation
  "Urgent: diabetes with pulse, function ≥ 100 bpm"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
  )
)
;; fingerprick glucose < 4 with/without symptoms
(system_priority_evaluation
  "Urgent: diabetes with low or high fingerprick glucose: blood glucose status < 4 mmol/L"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 4)
  )
)
;; fingerprick glucose >= 11.1 and ketones present on urine dipstick
;; (>= 11.1 WITH symptoms is already covered by "Urgent: diabetes with danger signs")

(system_priority_evaluation
  "Urgent: diabetes with low or high fingerprick glucose: blood glucose status ≥ 11.1 mmol/L and ketonuria"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)
    (clinical_finding (snomed_concept "Ketonuria" "finding"))
  )
)

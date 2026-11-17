;; Page 26 - Palpitations
;; Red box: "Give urgent attention to the patient with palpitations and any of:"
(task
  "Check for urgent palpitations conditions"
  adult
  (clinical_finding (snomed_concept "Palpitations" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Syncope" "finding"))
    (clinical_finding (snomed_concept "Loss of consciousness" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Lightheadedness" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))

    (clinical_finding (snomed_concept "Pulse irregular" "finding"))
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))

    (clinical_finding (snomed_concept "Pain in calf" "finding"))
    (clinical_finding (snomed_concept "Thigh pain" "finding"))
    (clinical_finding (snomed_concept "Swollen calf" "finding"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Thigh structure" "body structure")))

    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))

    (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)
;; Approach to the patient not needing urgent attention: "Check for fever, dehydration, anaemia,
;; pregnancy and medication side effects". Only the dehydration signs are representable
;; (fever uses the routine temperature; anaemia needs Hb; pregnancy needs a urine test).
(task
  "Check for causes of palpitations"
  adult
  (clinical_finding (snomed_concept "Palpitations" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Thirst due to water deprivation" "finding"))
    (clinical_finding (snomed_concept "Xerostomia" "finding"))
    (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
    (clinical_finding (snomed_concept "Decreased urine output" "finding"))
  )
)
;; Red box: "Difficulty breathing worse on lying flat and leg swelling, heart failure likely"
(system_diagnosis_rule
  "Diagnose probable heart failure from palpitations"
  (diagnosis
    (snomed_concept "Heart failure" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
  )
)
;; Red box: "New sudden asymmetric weakness or numbness, difficulty speaking or visual disturbance, consider stroke/TIA"
(system_diagnosis_rule
  "Diagnose possible stroke from palpitations"
  (diagnosis
    (snomed_concept "Cerebrovascular accident" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (or
      (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    )
  )
)
(system_diagnosis_rule
  "Diagnose possible TIA from palpitations"
  (diagnosis
    (snomed_concept "Transient ischemic attack" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (or
      (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    )
  )
)
;; "If thirst, dry mouth, poor skin turgor or decreased urine output, dehydration likely"
(system_diagnosis_rule
  "Diagnose probable dehydration from palpitations"
  (diagnosis
    (snomed_concept "Dehydration" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (or
      (clinical_finding (snomed_concept "Thirst due to water deprivation" "finding"))
      (clinical_finding (snomed_concept "Xerostomia" "finding"))
      (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
      (clinical_finding (snomed_concept "Decreased urine output" "finding"))
    )
  )
)
;; "If none of the above, consider thyroid or electrolyte abnormalities."
;; Only the representable parts of "none of the above" are excluded: temperature >= 38 °C and the
;; dehydration signs. ECG, Hb, pregnancy test and medication review cannot be expressed.
(system_diagnosis_rule
  "Diagnose possible thyroid disorder from palpitations"
  (diagnosis
    (snomed_concept "Disorder of thyroid gland" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (< (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
    (no (clinical_finding (snomed_concept "Thirst due to water deprivation" "finding")))
    (no (clinical_finding (snomed_concept "Xerostomia" "finding")))
    (no (clinical_finding (snomed_concept "Decreased skin turgor" "finding")))
    (no (clinical_finding (snomed_concept "Decreased urine output" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose possible electrolyte imbalance from palpitations"
  (diagnosis
    (snomed_concept "Electrolyte imbalance" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (< (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
    (no (clinical_finding (snomed_concept "Thirst due to water deprivation" "finding")))
    (no (clinical_finding (snomed_concept "Xerostomia" "finding")))
    (no (clinical_finding (snomed_concept "Decreased skin turgor" "finding")))
    (no (clinical_finding (snomed_concept "Decreased urine output" "finding")))
  )
)
;; Red box. Hb < 8 is not representable (no Hb observable or unit).
;; Faint or loss of consciousness
(system_priority_evaluation
  "Urgent: palpitations with syncope"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Syncope" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: palpitations with loss of consciousness"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Loss of consciousness" "finding"))
  )
)
;; Dizziness or light-headedness
(system_priority_evaluation
  "Urgent: palpitations with dizziness"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: palpitations with lightheadedness"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Lightheadedness" "finding"))
  )
)
;; Confusion
(system_priority_evaluation
  "Urgent: palpitations with clouded consciousness"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
  )
)
;; Chest pain
(system_priority_evaluation
  "Urgent: palpitations with chest pain"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
  )
)
;; BP >= 180/110 or < 90/60
(system_priority_evaluation
  "Urgent: palpitations with systolic blood pressure ≥ 180 mmHg"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
  )
)

(system_priority_evaluation
  "Urgent: palpitations with diastolic blood pressure ≥ 110 mmHg"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110)
  )
)

(system_priority_evaluation
  "Urgent: palpitations with systolic blood pressure < 90 mmHg"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
  )
)

(system_priority_evaluation
  "Urgent: palpitations with diastolic blood pressure < 60 mmHg"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
  )
)
;; Pulse irregular, > 150 or < 50
(system_priority_evaluation
  "Urgent: palpitations with pulse irregular"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Pulse irregular" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: palpitations with pulse, function > 150 bpm"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (> (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 150)
  )
)

(system_priority_evaluation
  "Urgent: palpitations with pulse, function < 50 bpm"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (< (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 50)
  )
)
;; Fingerprick glucose < 3 (< 4 if diabetes)

(system_priority_evaluation
  "Urgent: palpitations with blood glucose status < 3 mmol/L"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
  )
)

(system_priority_evaluation
  "Urgent: palpitations with diabetes mellitus (known present) and blood glucose status < 4 mmol/L"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 4)
  )
)
;; Calf or thigh pain and/or swelling
(system_priority_evaluation
  "Urgent: palpitations with pain in calf"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Pain in calf" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: palpitations with thigh pain"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Thigh pain" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: palpitations with swollen calf"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Swollen calf" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: palpitations with swelling (site: thigh structure)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Thigh structure" "body structure")))
  )
)
;; Difficulty breathing, respiratory rate >= 30 or oxygen saturation < 94%
(system_priority_evaluation
  "Urgent: palpitations with difficulty breathing"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: palpitations with respiratory rate ≥ 30 bpm"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
  )
)

(system_priority_evaluation
  "Urgent: palpitations with hemoglobin saturation with oxygen < 94 %"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %) 94)
  )
)
;; Difficulty breathing worse on lying flat and leg swelling, heart failure likely
(system_priority_evaluation
  "Urgent: palpitations with heart failure"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (active_condition (snomed_concept "Heart failure" "disorder"))
  )
)
;; New sudden asymmetric weakness or numbness, difficulty speaking or visual disturbance (stroke/TIA)

(system_priority_evaluation
  "Urgent: palpitations with muscle weakness (sudden onset, asymmetry)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: palpitations with numbness (sudden onset, asymmetry)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Numbness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: palpitations with difficulty talking (sudden onset)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: palpitations with visual disturbance (sudden onset)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)

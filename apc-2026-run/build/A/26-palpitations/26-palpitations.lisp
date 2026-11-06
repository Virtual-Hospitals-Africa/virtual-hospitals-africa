;; Page 26 - Palpitations
;; Red box: "Give urgent attention to the patient with palpitations and any of: ..."
;; BP, pulse rate, respiratory rate, SpO2 and fingerprick glucose are routine vitals (no measure task).
;; Hb < 8 cannot be expressed (no Hb unit/observable); see 26-palpitations-remaining-questions.md.
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
    (clinical_finding (snomed_concept "Swollen calf" "finding"))
    (clinical_finding (snomed_concept "Thigh pain" "finding"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Thigh structure" "body structure")))

    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))

    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)
;; Lower half of the page: "Check for fever, dehydration, anaemia, pregnancy and medication side effects".
;; Only the dehydration signs can be expressed (fever is a routine vital; anaemia needs Hb;
;; pregnancy needs a urine test; medication review is management).
(task
  "Check for dehydration in palpitations"
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
  "Diagnose probable heart failure in palpitations"
  (diagnosis
    (snomed_concept "Heart failure" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Palpitations" "finding"))
       (clinical_finding (snomed_concept "Orthopnea" "finding"))
       (clinical_finding (snomed_concept "Leg swelling symptom" "finding")))
)
;; Red box: "New sudden asymmetric weakness or numbness, difficulty speaking or visual disturbance, consider stroke/TIA"
(system_diagnosis_rule
  "Diagnose possible stroke in palpitations"
  (diagnosis
    (snomed_concept "Cerebrovascular accident" "disorder")
    possible
  )
  adult
  (and (clinical_finding (snomed_concept "Palpitations" "finding"))
       (or (clinical_finding (snomed_concept "Muscle weakness of limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Numbness of limbs" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))))
)
(system_diagnosis_rule
  "Diagnose possible TIA in palpitations"
  (diagnosis
    (snomed_concept "Transient ischemic attack" "disorder")
    possible
  )
  adult
  (and (clinical_finding (snomed_concept "Palpitations" "finding"))
       (or (clinical_finding (snomed_concept "Muscle weakness of limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Numbness of limbs" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))))
)
;; "If thirst, dry mouth, poor skin turgor or decreased urine output, dehydration likely"
(system_diagnosis_rule
  "Diagnose probable dehydration in palpitations"
  (diagnosis
    (snomed_concept "Dehydration" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Palpitations" "finding"))
       (or (clinical_finding (snomed_concept "Thirst due to water deprivation" "finding"))
           (clinical_finding (snomed_concept "Xerostomia" "finding"))
           (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
           (clinical_finding (snomed_concept "Decreased urine output" "finding"))))
)
(system_priority_evaluation
  "Urgent: palpitations with danger signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (or
      ;; Faint or loss of consciousness
      (clinical_finding (snomed_concept "Syncope" "finding"))
      (clinical_finding (snomed_concept "Loss of consciousness" "finding"))
      ;; Dizziness or light-headedness
      (clinical_finding (snomed_concept "Dizziness" "finding"))
      (clinical_finding (snomed_concept "Lightheadedness" "finding"))
      ;; Confusion
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      ;; Chest pain
      (clinical_finding (snomed_concept "Chest pain" "finding"))
      ;; BP >= 180/110 or < 90/60
      (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
      (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110)
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      ;; Pulse irregular, > 150 or < 50
      (clinical_finding (snomed_concept "Pulse irregular" "finding"))
      (> (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 150)
      (< (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 50)
      ;; Fingerprick glucose < 3 (< 4 if diabetes)
      (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
      (and (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 4)
           (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value"))))
      ;; Calf or thigh pain and/or swelling
      (clinical_finding (snomed_concept "Pain in calf" "finding"))
      (clinical_finding (snomed_concept "Swollen calf" "finding"))
      (clinical_finding (snomed_concept "Thigh pain" "finding"))
      (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Thigh structure" "body structure")))
      ;; Difficulty breathing, respiratory rate >= 30 or oxygen saturation < 94%
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %) 94)
      ;; Difficulty breathing worse on lying flat and leg swelling, heart failure likely
      (active_condition (snomed_concept "Heart failure" "disorder"))
      ;; New sudden asymmetric weakness or numbness, difficulty speaking or visual disturbance (stroke/TIA)
      (clinical_finding (snomed_concept "Muscle weakness of limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of limbs" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      ;; Hb < 8: not representable (no haemoglobin unit/observable in the language)
    )
  )
)

;; Page 46 - Dizziness
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

    (clinical_finding (snomed_concept "Injury of head" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Unable to stand" "finding"))

    ;; New sudden severe dizziness with nausea/vomiting, abnormal eye movements/walk
    (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Disorder of eye movements" "disorder"))
    (clinical_finding (snomed_concept "Abnormal gait" "finding"))

    (clinical_finding (snomed_concept "Shock" "disorder"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Pulse irregular" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
  )
)
(task
  "Check for causes of dizziness not needing urgent attention"
  adult
  (clinical_finding (snomed_concept "Dizziness" "finding"))
  (check_for
    ;; Was patient breathing very quickly or deeply immediately before or during the collapse?
    (clinical_finding (snomed_concept "Tachypnea" "finding"))
    (clinical_finding (snomed_concept "Deep breathing" "finding"))

    ;; Is there hearing loss or tinnitus?
    (clinical_finding (snomed_concept "Hearing loss" "disorder"))
    (clinical_finding (snomed_concept "Tinnitus" "finding"))

    ;; Sudden dizziness lasting seconds, precipitated by head movements
    (clinical_finding (snomed_concept "Positional vertigo" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    ;; Sudden dizziness lasting hours/days with nausea/vomiting
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
  "Diagnose possible stroke in dizziness"
  (diagnosis
    (snomed_concept "Cerebrovascular accident" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (or (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
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
  "Diagnose possible TIA in dizziness"
  (diagnosis
    (snomed_concept "Transient ischemic attack" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (or (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
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
  "Diagnose probable hyperventilation in dizziness"
  (diagnosis
    (snomed_concept "Hyperventilation" "finding")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    ;; breathing very quickly or deeply immediately before or during the collapse (see 46-dizziness-flowchart.md, HV = Yes)
    (or (clinical_finding (snomed_concept "Tachypnea" "finding"))
        (clinical_finding (snomed_concept "Deep breathing" "finding"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable positional vertigo"
  (diagnosis
    (snomed_concept "Positional vertigo" "finding")
    probable
  )
  adult
  (and
    ;; HV = No
    (no (clinical_finding (snomed_concept "Tachypnea" "finding")))
    (no (clinical_finding (snomed_concept "Deep breathing" "finding")))
    ;; EAR = No
    (no (clinical_finding (snomed_concept "Hearing loss" "disorder")))
    (no (clinical_finding (snomed_concept "Tinnitus" "finding")))
    ;; Sudden dizziness precipitated by head movements
    (clinical_finding (snomed_concept "Positional vertigo" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose probable vestibular neuronitis"
  (diagnosis
    (snomed_concept "Vestibular neuronitis of inner ear" "disorder")
    probable
  )
  adult
  (and
    ;; HV = No
    (no (clinical_finding (snomed_concept "Tachypnea" "finding")))
    (no (clinical_finding (snomed_concept "Deep breathing" "finding")))
    ;; EAR = No
    (no (clinical_finding (snomed_concept "Hearing loss" "disorder")))
    (no (clinical_finding (snomed_concept "Tinnitus" "finding")))
    ;; Sudden dizziness lasting hours/days with nausea/vomiting
    (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    )
  )
)
(system_priority_evaluation
  "Urgent: dizziness with danger signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (or
      ;; New sudden asymmetric weakness or numbness of face, arm or leg; difficulty speaking or visual disturbance
      (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      ;; Recent head injury
      (clinical_finding (snomed_concept "Injury of head" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
      ;; Unable to stand without support
      (clinical_finding (snomed_concept "Unable to stand" "finding"))
      ;; New sudden severe dizziness with nausea/vomiting, abnormal eye movements/walk
      (and (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
           (or (clinical_finding (snomed_concept "Nausea" "finding"))
               (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
               (clinical_finding (snomed_concept "Disorder of eye movements" "disorder"))
               (clinical_finding (snomed_concept "Abnormal gait" "finding"))
           )
      )
      ;; Shock/SBP < 80
      (clinical_finding (snomed_concept "Shock" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
      ;; Difficulty breathing, especially on lying flat with leg swelling
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      ;; Pulse < 50 or irregular
      (< (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 50)
      (clinical_finding (snomed_concept "Pulse irregular" "finding"))
      ;; Chest pain
      (clinical_finding (snomed_concept "Chest pain" "finding"))
      ;; Glucose < 3 (or < 4 if diabetes)
      (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
      (and (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
           (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 4))
    )
  )
)

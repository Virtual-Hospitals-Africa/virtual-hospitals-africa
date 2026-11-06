;; Page 79 - Neck pain
(task
  "Check for urgent neck pain conditions"
  adult
  (clinical_finding (snomed_concept "Neck pain" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    (clinical_finding (snomed_concept "Erythematous rash" "disorder"))

    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Clumsiness" "finding"))
    (clinical_finding (snomed_concept "Muscle rigidity" "finding") (finding_site (snomed_concept "Limb structure" "body structure")))
    (clinical_finding (snomed_concept "Abnormal gait" "finding"))
    (clinical_finding (snomed_concept "Decreased coordination" "finding"))

    (clinical_finding (snomed_concept "Injury of neck" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Plain X-ray of cervical spine abnormal" "finding"))
  )
)

;; Page 79 - Arm or hand symptoms
(task
  "Check for arm or hand symptom conditions"
  adult
  (clinical_finding (snomed_concept "Finding of upper limb" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Pain in upper limb" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))

    (clinical_finding (snomed_concept "Injury of upper extremity" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Pain in upper limb" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling of upper limb" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Deformity of upper limb" "finding"))

    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))

    (clinical_finding (snomed_concept "Joint warm" "finding"))
    (clinical_finding (snomed_concept "Tenderness of joint" "finding"))
    (clinical_finding (snomed_concept "Joint swelling" "finding"))
    (clinical_finding (snomed_concept "Limitation of joint movement" "finding"))

    (clinical_finding (snomed_concept "Pain of shoulder region" "finding"))

    (clinical_finding (snomed_concept "Pain of wrist region" "finding") (qualifier (snomed_concept "Intermittent" "qualifier value")))
    (clinical_finding (snomed_concept "Hand pain" "finding") (qualifier (snomed_concept "Intermittent" "qualifier value")))
    (clinical_finding (snomed_concept "Night pain" "finding"))

    (clinical_finding (snomed_concept "Pain of elbow region" "finding"))

    (clinical_finding (snomed_concept "Pain in thumb" "finding"))
    (clinical_finding (snomed_concept "Joint catching" "finding") (finding_site (snomed_concept "Finger structure" "body structure")))
    (clinical_finding (snomed_concept "Locking of joint" "finding") (finding_site (snomed_concept "Finger structure" "body structure")))
  )
)

;; Page 79 - Neck pain: diagnosis rules
(system_diagnosis_rule
  "Diagnose probable meningitis from neck stiffness (neck pain page)"
  (diagnosis
    (snomed_concept "Meningitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (or (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
        (clinical_finding (snomed_concept "Headache" "finding"))
        (clinical_finding (snomed_concept "Drowsy" "finding"))
        (clinical_finding (snomed_concept "Acute confusion" "finding"))
        (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
        (clinical_finding (snomed_concept "Erythematous rash" "disorder"))
    )
  )
)

;; Page 79 - Arm or hand symptoms: diagnosis rules
(system_diagnosis_rule
  "Diagnose probable fracture of upper limb (arm or hand symptoms)"
  (diagnosis
    (snomed_concept "Fracture of upper limb" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Injury of upper extremity" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (or (clinical_finding (snomed_concept "Pain in upper limb" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
        (clinical_finding (snomed_concept "Swelling of upper limb" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
        (clinical_finding (snomed_concept "Deformity of upper limb" "finding"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose possible stroke from sudden arm weakness (arm or hand symptoms)"
  (diagnosis
    (snomed_concept "Cerebrovascular accident" "disorder")
    possible
  )
  adult
  (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
)
(system_diagnosis_rule
  "Diagnose possible TIA from sudden arm weakness (arm or hand symptoms)"
  (diagnosis
    (snomed_concept "Transient ischemic attack" "disorder")
    possible
  )
  adult
  (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
)
(system_diagnosis_rule
  "Diagnose probable joint problem (arm or hand symptoms)"
  (diagnosis
    (snomed_concept "Arthropathy" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Finding of upper limb" "finding"))
    (or (clinical_finding (snomed_concept "Joint warm" "finding"))
        (clinical_finding (snomed_concept "Tenderness of joint" "finding"))
        (clinical_finding (snomed_concept "Joint swelling" "finding"))
        (clinical_finding (snomed_concept "Limitation of joint movement" "finding"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable referred pain from painful shoulder (arm or hand symptoms)"
  (diagnosis
    (snomed_concept "Referred pain" "finding")
    probable
  )
  adult
  (clinical_finding (snomed_concept "Pain of shoulder region" "finding"))
)
(system_diagnosis_rule
  "Diagnose probable carpal tunnel syndrome (arm or hand symptoms)"
  (diagnosis
    (snomed_concept "Carpal tunnel syndrome" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Pain of wrist region" "finding") (qualifier (snomed_concept "Intermittent" "qualifier value")))
        (clinical_finding (snomed_concept "Hand pain" "finding") (qualifier (snomed_concept "Intermittent" "qualifier value")))
    )
    (clinical_finding (snomed_concept "Night pain" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable tennis or golfer's elbow (arm or hand symptoms)"
  (diagnosis
    (snomed_concept "Elbow tendinopathy" "disorder")
    probable
  )
  adult
  (clinical_finding (snomed_concept "Pain of elbow region" "finding"))
)
(system_diagnosis_rule
  "Diagnose probable tenosynovitis (arm or hand symptoms)"
  (diagnosis
    (snomed_concept "Tenosynovitis" "disorder")
    probable
  )
  adult
  (or (clinical_finding (snomed_concept "Pain in thumb" "finding"))
      (clinical_finding (snomed_concept "Joint catching" "finding") (finding_site (snomed_concept "Finger structure" "body structure")))
      (clinical_finding (snomed_concept "Locking of joint" "finding") (finding_site (snomed_concept "Finger structure" "body structure")))
  )
)

;; Page 79 - Priority evaluations
(system_priority_evaluation
  "Urgent: neck pain with meningitis, neurological symptoms or recent injury"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Neck pain" "finding"))
    (or
      (active_condition (snomed_concept "Meningitis" "disorder"))
      (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
      (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
      (clinical_finding (snomed_concept "Clumsiness" "finding"))
      (clinical_finding (snomed_concept "Muscle rigidity" "finding") (finding_site (snomed_concept "Limb structure" "body structure")))
      (clinical_finding (snomed_concept "Abnormal gait" "finding"))
      (clinical_finding (snomed_concept "Decreased coordination" "finding"))
      (and
        (clinical_finding (snomed_concept "Injury of neck" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
        (or (clinical_finding (snomed_concept "Plain X-ray of cervical spine abnormal" "finding"))
            (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
            (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
            (clinical_finding (snomed_concept "Clumsiness" "finding"))
            (clinical_finding (snomed_concept "Muscle rigidity" "finding") (finding_site (snomed_concept "Limb structure" "body structure")))
            (clinical_finding (snomed_concept "Abnormal gait" "finding"))
            (clinical_finding (snomed_concept "Decreased coordination" "finding"))
        )
      )
    )
  )
)
(system_priority_evaluation
  "Urgent: arm or hand symptoms with chest pain, fracture or sudden weakness"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Finding of upper limb" "finding"))
    (or
      (and (clinical_finding (snomed_concept "Pain in upper limb" "finding"))
           (clinical_finding (snomed_concept "Chest pain" "finding")))
      (active_condition (snomed_concept "Fracture of upper limb" "disorder"))
      (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    )
  )
)

;; Page 79 - Neck pain
;; Top half of the page: NECK PAIN (red box 2 in the element list).
(task
  "Check for urgent neck pain conditions"
  adult
  (clinical_finding (snomed_concept "Neck pain" "finding"))
  (check_for
    ;; Meningitis likely: neck stiffness and any of T >= 38 (routine vital), headache, drowsy/confused, purple/red rash
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    (clinical_finding (snomed_concept "Erythematous rash" "disorder"))

    ;; Neurological symptoms in arms/legs
    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Clumsiness" "finding"))
    (clinical_finding (snomed_concept "Stiff limbs" "finding"))
    (clinical_finding (snomed_concept "Abnormal gait" "finding"))
    (clinical_finding (snomed_concept "Decreased coordination" "finding"))

    ;; Recent injury
    (clinical_finding (snomed_concept "Injury of neck" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Plain X-ray of cervical spine abnormal" "finding"))
  )
)

;; Bottom half of the page: ARM OR HAND SYMPTOMS (red box 1 in the element list).
(task
  "Check for urgent arm or hand conditions"
  adult
  (clinical_finding (snomed_concept "Finding of upper limb" "finding"))
  (check_for
    ;; Arm pain with chest pain
    (clinical_finding (snomed_concept "Pain in upper limb" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))

    ;; Recent injury and severe pain/swelling or deformity: fracture likely
    (clinical_finding (snomed_concept "Injury of upper extremity" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Pain in upper limb" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling of upper limb" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Deformity of upper limb" "finding"))

    ;; New sudden onset of weakness of arm: consider stroke or TIA
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)
(task
  "Check for causes of arm or hand symptoms"
  adult
  (clinical_finding (snomed_concept "Finding of upper limb" "finding"))
  (check_for
    ;; Joint warm/tender/swollen or unable to do all actions comfortably: joint problem likely
    (clinical_finding (snomed_concept "Joint warm" "finding"))
    (clinical_finding (snomed_concept "Tenderness of joint" "finding"))
    (clinical_finding (snomed_concept "Joint swelling" "finding"))
    (clinical_finding (snomed_concept "Limitation of joint movement" "finding"))

    ;; Painful shoulder: referred pain likely
    (clinical_finding (snomed_concept "Pain of shoulder region" "finding"))

    ;; Wrist/hand pain: intermittent, worse at night: carpal tunnel syndrome likely
    (clinical_finding (snomed_concept "Pain of wrist region" "finding") (qualifier (snomed_concept "Intermittent" "qualifier value")) (qualifier (snomed_concept "Night time" "qualifier value")))
    (clinical_finding (snomed_concept "Hand pain" "finding") (qualifier (snomed_concept "Intermittent" "qualifier value")) (qualifier (snomed_concept "Night time" "qualifier value")))

    ;; Elbow pain with or after elbow flexion/extension: tennis or golfer's elbow likely
    (clinical_finding (snomed_concept "Pain provoked by movement" "finding") (finding_site (snomed_concept "Elbow region structure" "body structure")))

    ;; Thumb pain worse with thumb/wrist movement or catching/locking of finger: tenosynovitis likely
    (clinical_finding (snomed_concept "Pain in thumb" "finding"))
    (clinical_finding (snomed_concept "Pain provoked by movement" "finding") (finding_site (snomed_concept "Thumb structure" "body structure")))
    (clinical_finding (snomed_concept "Pain provoked by movement" "finding") (finding_site (snomed_concept "Wrist region structure" "body structure")))
    (clinical_finding (snomed_concept "Joint catching" "finding") (finding_site (snomed_concept "Finger structure" "body structure")))
    (clinical_finding (snomed_concept "Locking of joint" "finding") (finding_site (snomed_concept "Finger structure" "body structure")))
  )
)

;; Neck pain: meningitis likely
(system_diagnosis_rule
  "Diagnose probable meningitis from neck pain page"
  (diagnosis
    (snomed_concept "Meningitis" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Stiff neck" "finding"))
       (or (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
           (clinical_finding (snomed_concept "Headache" "finding"))
           (clinical_finding (snomed_concept "Drowsy" "finding"))
           (clinical_finding (snomed_concept "Acute confusion" "finding"))
           (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
           (clinical_finding (snomed_concept "Erythematous rash" "disorder"))))
)

;; Arm or hand symptoms: fracture likely
(system_diagnosis_rule
  "Diagnose probable fracture of upper limb from arm or hand symptoms"
  (diagnosis
    (snomed_concept "Fracture of upper limb" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Injury of upper extremity" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
       (or (clinical_finding (snomed_concept "Pain in upper limb" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
           (clinical_finding (snomed_concept "Swelling of upper limb" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
           (clinical_finding (snomed_concept "Deformity of upper limb" "finding"))))
)

;; Arm or hand symptoms: consider stroke or TIA
(system_diagnosis_rule
  "Diagnose possible stroke from sudden arm weakness"
  (diagnosis
    (snomed_concept "Cerebrovascular accident" "disorder")
    possible
  )
  adult
  (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
)
(system_diagnosis_rule
  "Diagnose possible TIA from sudden arm weakness"
  (diagnosis
    (snomed_concept "Transient ischemic attack" "disorder")
    possible
  )
  adult
  (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
)

;; Arm or hand symptoms: joint problem likely (-> page 77)
(system_diagnosis_rule
  "Diagnose probable joint problem from arm or hand symptoms"
  (diagnosis
    (snomed_concept "Arthropathy" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Finding of upper limb" "finding"))
       (or (clinical_finding (snomed_concept "Joint warm" "finding"))
           (clinical_finding (snomed_concept "Tenderness of joint" "finding"))
           (clinical_finding (snomed_concept "Joint swelling" "finding"))
           (clinical_finding (snomed_concept "Limitation of joint movement" "finding"))))
)

;; Arm or hand symptoms, not urgent: painful shoulder -> referred pain likely
(system_diagnosis_rule
  "Diagnose probable referred pain from painful shoulder"
  (diagnosis
    (snomed_concept "Referred pain" "finding")
    probable
  )
  adult
  (clinical_finding (snomed_concept "Pain of shoulder region" "finding"))
)

;; Wrist/hand pain -> carpal tunnel syndrome likely
(system_diagnosis_rule
  "Diagnose probable carpal tunnel syndrome from wrist or hand pain"
  (diagnosis
    (snomed_concept "Carpal tunnel syndrome" "disorder")
    probable
  )
  adult
  (or (clinical_finding (snomed_concept "Pain of wrist region" "finding") (qualifier (snomed_concept "Intermittent" "qualifier value")) (qualifier (snomed_concept "Night time" "qualifier value")))
      (clinical_finding (snomed_concept "Hand pain" "finding") (qualifier (snomed_concept "Intermittent" "qualifier value")) (qualifier (snomed_concept "Night time" "qualifier value"))))
)

;; Elbow pain with/after flexion/extension -> tennis or golfer's elbow likely
(system_diagnosis_rule
  "Diagnose probable elbow tendinopathy from elbow pain on movement"
  (diagnosis
    (snomed_concept "Elbow tendinopathy" "disorder")
    probable
  )
  adult
  (clinical_finding (snomed_concept "Pain provoked by movement" "finding") (finding_site (snomed_concept "Elbow region structure" "body structure")))
)

;; Thumb pain worse with thumb/wrist movement or catching/locking of finger -> tenosynovitis likely
(system_diagnosis_rule
  "Diagnose probable tenosynovitis from thumb pain or finger locking"
  (diagnosis
    (snomed_concept "Tenosynovitis" "disorder")
    probable
  )
  adult
  (or (and (clinical_finding (snomed_concept "Pain in thumb" "finding"))
           (or (clinical_finding (snomed_concept "Pain provoked by movement" "finding") (finding_site (snomed_concept "Thumb structure" "body structure")))
               (clinical_finding (snomed_concept "Pain provoked by movement" "finding") (finding_site (snomed_concept "Wrist region structure" "body structure")))))
      (clinical_finding (snomed_concept "Joint catching" "finding") (finding_site (snomed_concept "Finger structure" "body structure")))
      (clinical_finding (snomed_concept "Locking of joint" "finding") (finding_site (snomed_concept "Finger structure" "body structure"))))
)

(system_priority_evaluation
  "Urgent: neck pain with meningitis, neurological symptoms or recent injury"
  adult
  Urgent
  (and (clinical_finding (snomed_concept "Neck pain" "finding"))
       (or (active_condition (snomed_concept "Meningitis" "disorder"))
           (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
           (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
           (clinical_finding (snomed_concept "Clumsiness" "finding"))
           (clinical_finding (snomed_concept "Stiff limbs" "finding"))
           (clinical_finding (snomed_concept "Abnormal gait" "finding"))
           (clinical_finding (snomed_concept "Decreased coordination" "finding"))
           ;; Recent injury and (x-ray abnormal [unavailable not representable] or neurological symptoms)
           (and (clinical_finding (snomed_concept "Injury of neck" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
                (or (clinical_finding (snomed_concept "Plain X-ray of cervical spine abnormal" "finding"))
                    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
                    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
                    (clinical_finding (snomed_concept "Clumsiness" "finding"))
                    (clinical_finding (snomed_concept "Stiff limbs" "finding"))
                    (clinical_finding (snomed_concept "Abnormal gait" "finding"))
                    (clinical_finding (snomed_concept "Decreased coordination" "finding"))))))
)
(system_priority_evaluation
  "Urgent: arm or hand symptoms with chest pain, fracture or sudden weakness"
  adult
  Urgent
  (and (clinical_finding (snomed_concept "Finding of upper limb" "finding"))
       (or (and (clinical_finding (snomed_concept "Pain in upper limb" "finding"))
                (clinical_finding (snomed_concept "Chest pain" "finding")))
           (active_condition (snomed_concept "Fracture of upper limb" "disorder"))
           (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))))
)

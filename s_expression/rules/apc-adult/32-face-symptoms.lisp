;; Page 32 - Face Symptoms
;; (task
;;   "Check for urgent face symptom conditions"
;;   adult
;;   (clinical_finding (finding_site (snomed_concept "Face structure" "body structure"))
;;     (excluding (clinical_finding (snomed_concept "Eye / vision finding" "finding")))
;;     (excluding (clinical_finding (finding_site (snomed_concept "Structure of eye proper" "body structure"))))
;;     (excluding (clinical_finding (finding_site (snomed_concept "Ear structure" "body structure"))))
;;     (excluding (clinical_finding (snomed_concept "Nose finding" "finding")))
;;     (excluding (clinical_finding (finding_site (snomed_concept "Nasal structure" "body structure"))))
;;     (excluding (clinical_finding (finding_site (snomed_concept "Structure of mouth and/or pharynx" "body structure"))))
;;     (excluding (clinical_finding (finding_site (snomed_concept "Tooth, gum, and/or supporting structure" "body structure"))))
;;   )
;;   (check_for
;;     (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
;;     (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
;;     (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
;;     (clinical_finding (snomed_concept "Numbness of face" "finding"))
;;     (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
;;     (clinical_finding (snomed_concept "Difficulty talking" "finding"))
;;     (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
;;     (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Red color" "qualifier value")) (qualifier (snomed_concept "Pain" "finding")))
;;     (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden" "qualifier value")))
;;     (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
;;     (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
;;     (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden" "qualifier value")))
;;     (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
;;     (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
;;     (clinical_finding (snomed_concept "Collapse" "finding"))
;;     (clinical_finding (snomed_concept "Abdominal pain" "finding"))
;;     (clinical_finding (snomed_concept "Vomiting" "disorder"))
;;     (clinical_finding (snomed_concept "Blood in urine" "finding"))
;;     (clinical_finding (snomed_concept "Proteinuria" "finding"))
;;   )
;; )
;; Page 32 - Face: Facial cellulitis likely with painful red facial swelling and fever
(system_diagnosis_rule
  "Diagnose probable facial cellulitis"
  (diagnosis
    (snomed_concept "Cellulitis of face" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Red color" "qualifier value")) (qualifier (snomed_concept "Pain" "finding")))
    (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
  )
)
(task
  "Check for orbital cellulitis"
  adult
  (active_condition (snomed_concept "Cellulitis of face" "disorder"))
  (check_for
    (clinical_finding
      (snomed_concept "Swelling" "finding")
      (finding_site (snomed_concept "Eyelid" "body structure"))
      (qualifier (snomed_concept "Entire" "qualifier value"))
      (qualifier (snomed_concept "Red color" "qualifier value"))
      (qualifier (snomed_concept "Pain" "finding"))
    )
  )
)
;; Page 32 - Face: Facial cellulitis likely with painful red facial swelling and fever
(system_diagnosis_rule
  "Diagnose probable orbital cellulitis"
  (diagnosis
    (snomed_concept "Orbital cellulitis" "disorder")
    probable
  )
  adult
  (and
    (active_condition (snomed_concept "Cellulitis of face" "disorder"))
    (clinical_finding
      (snomed_concept "Swelling" "finding")
      (finding_site (snomed_concept "Eyelid" "body structure"))
      (qualifier (snomed_concept "Entire" "qualifier value"))
      (qualifier (snomed_concept "Red color" "qualifier value"))
      (qualifier (snomed_concept "Pain" "finding"))
    )
  )
)
;; Page 32 - Face: Check for urgent kidney disease complications
(task
  "Check for urgent kidney disease complications"
  adult
  (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
  (check_for
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Proteinuria" "finding"))
  )
)
;; Page 32 - Face: Kidney disease likely with facial swelling and blood/protein in urine
(system_diagnosis_rule
  "Diagnose possible kidney disease"
  (diagnosis
    (snomed_concept "Kidney disease" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
    (or
      (clinical_finding (snomed_concept "Blood in urine" "finding"))
      (clinical_finding (snomed_concept "Proteinuria" "finding"))
    )
  )
)
;; Page 32 - Face: Facial cellulitis
(system_priority_evaluation
  "Urgent: facial cellulitis"
  adult
  Urgent
  (active_condition (snomed_concept "Cellulitis of face" "disorder"))
)
;; Page 32 - Face: Kidney disease signs with facial swelling
(system_priority_evaluation
  "Urgent: Kidney disease"
  adult
  Urgent
  (active_condition (snomed_concept "Kidney disease" "disorder"))
)
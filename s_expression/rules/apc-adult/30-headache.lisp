;; Page 30 - Headache
(task
  "Check for urgent headache conditions"
  adult
  (clinical_finding (snomed_concept "Headache" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (clinical_finding (snomed_concept "Speech problem" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))

    (clinical_finding (snomed_concept "Visual symptoms" "finding") (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Pain in eye" "finding") (qualifier (snomed_concept "New" "qualifier value")))

    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    
    (clinical_finding (snomed_concept "Frequent headache" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Wakes up during night" "finding")))
    (clinical_finding (snomed_concept "Morning headache" "finding"))

    ;; Meningitis likely
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))

    (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))
    (clinical_finding (snomed_concept "Nausea" "finding") (qualifier (snomed_concept "Symptom is continuous" "finding")))

    (clinical_finding 
      (snomed_concept "Headache" "finding")
      (qualifier (snomed_concept "Symptom is continuous" "finding"))
    )

    (clinical_finding (snomed_concept "Chronic headache disorder" "disorder"))

    (clinical_finding (snomed_concept "Seizure" "finding") (qualifier (snomed_concept "Recent" "qualifier value")))

    (<= (onset (clinical_finding (snomed_concept "Highly active antiretroviral therapy" "procedure")))
        (time_ago 3 months))

    (clinical_finding (snomed_concept "Injury of head" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))

    (clinical_finding (snomed_concept "Anisocoria" "disorder"))

    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
    (clinical_finding (snomed_concept "Pain in eye" "finding"))
    (clinical_finding (snomed_concept "Nausea and vomiting" "disorder"))
    (clinical_finding (snomed_concept "Injury of head" "disorder"))
    (clinical_finding (snomed_concept "Frequent headache" "finding"))
  )
)
;; ;; Page 30 – Headache
;; (system_diagnosis_rule
;;   "Diagnose Sinusitis likely"
;;   (diagnosis
;;     (snomed_concept "Sinusitis" "disorder")
;;     probable 
;;   )
;;   adult
;;   (and
;;     (clinical_finding (snomed_concept "Headache" "finding"))
;;     (or (clinical_finding (snomed_concept "Common cold" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
;;         (and (active_condition (snomed_concept "Fever" "finding"))
;;              (active_condition (snomed_concept "Generalized aches and pains" "finding"))
;;         )
;;     )
;;     (or (clinical_finding (snomed_concept "Headache" "finding") (attribute (snomed_concept "Worse" "qualifier value") (snomed_concept "Forward bending" "observable entity")))
;;         (clinical_finding (snomed_concept "Nasal discharge" "finding") (qualifier (snomed_concept "Thick" "qualifier value")))
;;         (clinical_finding (snomed_concept "Posterior rhinorrhea" "disorder") (qualifier (snomed_concept "Thick" "qualifier value")))
;;         (clinical_finding 
;;           (snomed_concept "Pain" "finding") 
;;           (finding_site (snomed_concept "Cheek structure" "body structure")) 
;;           (attribute (snomed_concept "Aggravated by" "attribute") (snomed_concept "Pressure - physical agent" "physical force"))
;;         )
;;         (clinical_finding 
;;           (snomed_concept "Pain" "finding") 
;;           (finding_site (snomed_concept "Forehead structure" "body structure")) 
;;           (attribute (snomed_concept "Aggravated by" "attribute") (snomed_concept "Pressure - physical agent" "physical force"))
;;         )
;;     )
;;   )
;; )
;; Page 30 - Headache: Emergency signs
(system_priority_evaluation
  "Emergency: headache with emergency signs"
  adult
  Emergency
  (and
    (clinical_finding (snomed_concept "Headache" "finding"))
    (or
      (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
      (clinical_finding (snomed_concept "Seizure" "finding"))
      (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
      (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    )
  )
)
;; Page 30 - Headache: Urgent for other danger signs
(system_priority_evaluation
  "Urgent: headache with meningism, hypertensive or neurological signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Headache" "finding"))
    (or
      (clinical_finding (snomed_concept "Stiff neck" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
      (clinical_finding (snomed_concept "Pain in eye" "finding"))
      (clinical_finding (snomed_concept "Nausea and vomiting" "disorder"))
      (clinical_finding (snomed_concept "Injury of head" "disorder"))
      (clinical_finding (snomed_concept "Anisocoria" "disorder"))
      (clinical_finding (snomed_concept "Morning headache" "finding"))
      (clinical_finding (snomed_concept "Frequent headache" "finding"))
      (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
      (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110)
    )
  )
)

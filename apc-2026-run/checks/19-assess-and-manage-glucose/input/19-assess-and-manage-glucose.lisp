(task
  "Check for known diabetes when fingerprick glucose is low or high"
  adult
  (or (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 4)
      (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1))
  (check_for
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
  )
)
(task
  "Check for urgent signs when fingerprick glucose is 11.1 or more"
  adult
  (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)
  (check_for

    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Seizure" "finding"))

    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Kussmaul's respiration" "finding"))

    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Dehydration" "disorder"))
  )
)
(task
  "Check urine for ketones when fingerprick glucose is 11.1 or more"
  adult
  (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)
  (check_for
    (clinical_finding (snomed_concept "Ketonuria" "finding"))
  )
)
(task
  "Check for symptoms of diabetes when glucose is 11.1 or more without ketones"
  adult

  (and (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)
       (no (clinical_finding (snomed_concept "Ketonuria" "finding")))
       (no (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))))
  (check_for
    (clinical_finding (snomed_concept "Unexplained weight loss" "finding"))
    (clinical_finding (snomed_concept "Fatigue" "finding"))
    (clinical_finding (snomed_concept "Excessive thirst" "finding"))
    (clinical_finding (snomed_concept "Polyuria" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
    (clinical_finding (snomed_concept "Recurrent infectious disease" "disorder"))
  )
)
(system_diagnosis_rule
  "Diagnose probable hypoglycaemia from fingerprick glucose"
  (diagnosis
    (snomed_concept "Hypoglycemia" "disorder")
    probable
  )
  adult

  (or (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
      (and (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 4)
           (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))))
)
(system_diagnosis_rule
  "Diagnose probable diabetes from random glucose 11.1 or more with symptoms"
  (diagnosis
    (snomed_concept "Diabetes mellitus" "disorder")
    probable
  )
  adult


  (and (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)
       (no (clinical_finding (snomed_concept "Ketonuria" "finding")))
       (no (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value"))))
       (or (clinical_finding (snomed_concept "Unexplained weight loss" "finding"))
           (clinical_finding (snomed_concept "Fatigue" "finding"))
           (clinical_finding (snomed_concept "Excessive thirst" "finding"))
           (clinical_finding (snomed_concept "Polyuria" "finding"))
           (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
           (clinical_finding (snomed_concept "Recurrent infectious disease" "disorder"))))
)
(system_priority_evaluation
  "Urgent: hypoglycaemia on fingerprick glucose"
  adult
  Urgent

  (active_condition (snomed_concept "Hypoglycemia" "disorder"))
)
(system_priority_evaluation
  "Urgent: glucose 11.1 or more with danger signs"
  adult
  Urgent

  (and (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)
       (or (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
           (clinical_finding (snomed_concept "Chest pain" "finding"))
           (clinical_finding (snomed_concept "Seizure" "finding"))
           (clinical_finding (snomed_concept "Drowsy" "finding"))
           (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
           (clinical_finding (snomed_concept "Nausea" "finding"))
           (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
           (clinical_finding (snomed_concept "Abdominal pain" "finding"))
           (clinical_finding (snomed_concept "Kussmaul's respiration" "finding"))
           (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
           (clinical_finding (snomed_concept "Dehydration" "disorder"))))
)
(system_priority_evaluation
  "Urgent: glucose 11.1 or more with urine ketones"
  adult
  Urgent

  (and (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)
       (clinical_finding (snomed_concept "Ketonuria" "finding")))
)

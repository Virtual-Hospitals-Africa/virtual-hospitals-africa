;; Page 19 - Assess and manage glucose
;; Random fingerprick glucose is a routine vital: (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L)
;; See 19-assess-and-manage-glucose-flowchart.md for the decision nodes behind each rule.

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
    ;; Red box 2. Temperature >= 38 is a routine vital and is not listed here.
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
  ;; No ketones and not known diabetes -> "does patient have symptoms of diabetes?" (footnote 8)
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
  ;; "Glucose < 3 (< 4 if diabetes) Patient has hypoglycaemia."
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
  ;; Glucose >= 11.1 -> no ketones -> not known diabetes -> symptoms of diabetes = Yes -> "Diagnose diabetes".
  ;; The fasting-glucose routes to "Diagnose diabetes" cannot be modelled (no fasting glucose observable).
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
  ;; Red box 1: "Give urgent attention"
  (active_condition (snomed_concept "Hypoglycemia" "disorder"))
)
(system_priority_evaluation
  "Urgent: glucose 11.1 or more with danger signs"
  adult
  Urgent
  ;; Red box 2 = Yes -> red box 3 ("Refer urgently")
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
  ;; "Ketones present" -> red box 3 ("Refer urgently")
  (and (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)
       (clinical_finding (snomed_concept "Ketonuria" "finding")))
)

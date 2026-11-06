;; Page 19 - Assess and manage glucose
;; Interpret a random fingerprick glucose (Blood glucose status, mmol/L, a routine vital).
;; See 19-assess-and-manage-glucose-flowchart.md for the decision nodes behind each rule.

;; Low glucose branch: "< 4 if diabetes" needs to know whether diabetes is known.
(task
  "Check for known diabetes when glucose is low"
  adult
  (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 4)
  (check_for
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
  )
)

;; Glucose >= 11.1 branch: red box "Check if patient needs urgent attention", then urine ketones,
;; then (if not known diabetes) symptoms of diabetes (footnote 8).
(task
  "Check for urgent high glucose conditions"
  adult
  (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)
  (check_for
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Seizure" "finding"))

    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Kussmaul's respiration" "finding"))

    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Signs of dehydration" "finding"))

    (clinical_finding (snomed_concept "Ketonuria" "finding"))

    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))

    (clinical_finding (snomed_concept "Unexplained weight loss" "finding"))
    (clinical_finding (snomed_concept "Fatigue" "finding"))
    (clinical_finding (snomed_concept "Excessive thirst" "finding"))
    (clinical_finding (snomed_concept "Polyuria" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
    (clinical_finding (snomed_concept "Recurrent infectious disease" "disorder"))
  )
)

;; "Glucose < 3 (< 4 if diabetes) Patient has hypoglycaemia."
(system_diagnosis_rule
  "Diagnose probable hypoglycaemia from fingerprick glucose"
  (diagnosis
    (snomed_concept "Hypoglycemia" "disorder")
    probable
  )
  adult
  (or
    (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
    (and
      (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 4)
      (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    )
  )
)

;; Glucose >= 11.1, urgent box = No, "No ketones", "If not known diabetes, does patient have
;; symptoms(8) of diabetes?" = Yes -> "Diagnose diabetes".
;; The ketone check only happens on the urgent-box "No" path, so a recorded "No" for ketonuria
;; stands in for that path (see remaining-questions).
(system_diagnosis_rule
  "Diagnose probable diabetes from random glucose >= 11.1 with symptoms"
  (diagnosis
    (snomed_concept "Diabetes mellitus" "disorder")
    probable
  )
  adult
  (and
    (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)
    (no (clinical_finding (snomed_concept "Ketonuria" "finding")))
    (no (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value"))))
    (or
      (clinical_finding (snomed_concept "Unexplained weight loss" "finding"))
      (clinical_finding (snomed_concept "Fatigue" "finding"))
      (clinical_finding (snomed_concept "Excessive thirst" "finding"))
      (clinical_finding (snomed_concept "Polyuria" "finding"))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
      (clinical_finding (snomed_concept "Recurrent infectious disease" "disorder"))
    )
  )
)

;; Red box 1 "Give urgent attention" for glucose < 3 (< 4 if diabetes).
(system_priority_evaluation
  "Urgent: low fingerprick glucose (hypoglycaemia)"
  adult
  Urgent
  (or
    (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
    (and
      (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 4)
      (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    )
  )
)

;; Glucose >= 11.1 and any red box 2 item (Yes) or ketones present -> red box 3 ("Refer urgently").
(system_priority_evaluation
  "Urgent: high glucose with danger signs or ketones"
  adult
  Urgent
  (and
    (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)
    (or
      (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
      (clinical_finding (snomed_concept "Chest pain" "finding"))
      (clinical_finding (snomed_concept "Seizure" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Acute confusion" "finding"))
      (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (clinical_finding (snomed_concept "Abdominal pain" "finding"))
      (clinical_finding (snomed_concept "Kussmaul's respiration" "finding"))
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (clinical_finding (snomed_concept "Signs of dehydration" "finding"))
      (clinical_finding (snomed_concept "Ketonuria" "finding"))
    )
  )
)

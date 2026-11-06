;; Page 176 - Manage the patient requesting a termination of pregnancy (TOP)
;; Encoded: the "Review the patient who had a TOP within the past 14 days" section (red box and
;; its diagnoses). The upper half of the page is management/referral routing (see flowchart).
(task
  "Check for complications after recent termination of pregnancy"
  adult
  (<= (onset (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder"))) (time_ago 14 days))
  (check_for
    ;; Red box question: danger signs after TOP
    (clinical_finding (snomed_concept "Mass of uterine adnexa" "finding"))
    (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
    (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
    (clinical_finding (snomed_concept "Offensive vaginal discharge" "finding"))

    ;; Incomplete TOP question
    (clinical_finding (snomed_concept "Enlarged uterus" "finding"))
    (clinical_finding (snomed_concept "Cervical os open" "finding"))
    (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
    (clinical_finding (snomed_concept "Products of conception at uterine os cervix" "finding"))
  )
)
;; Page 176 - Red box: "If adnexal mass, ectopic pregnancy likely"
(system_diagnosis_rule
  "Diagnose probable ectopic pregnancy after recent termination of pregnancy"
  (diagnosis
    (snomed_concept "Ectopic pregnancy" "disorder")
    probable
  )
  adult
  (and
    (<= (onset (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder"))) (time_ago 14 days))
    (clinical_finding (snomed_concept "Mass of uterine adnexa" "finding"))
  )
)
;; Page 176 - "Is there an enlarged uterus or open cervical os with bleeding/products of conception
;; visible? Yes to either, incomplete TOP likely"
(system_diagnosis_rule
  "Diagnose probable incomplete termination of pregnancy"
  (diagnosis
    (snomed_concept "Incomplete induced termination of pregnancy" "disorder")
    probable
  )
  adult
  (and
    (<= (onset (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder"))) (time_ago 14 days))
    (or
      (clinical_finding (snomed_concept "Enlarged uterus" "finding"))
      (and
        (clinical_finding (snomed_concept "Cervical os open" "finding"))
        (or
          (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
          (clinical_finding (snomed_concept "Products of conception at uterine os cervix" "finding"))
        )
      )
    )
  )
)
;; Page 176 - Red box: "Yes. Manage urgently"
(system_priority_evaluation
  "Urgent: complications after recent termination of pregnancy"
  adult
  Urgent
  (and
    (<= (onset (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder"))) (time_ago 14 days))
    (or
      (clinical_finding (snomed_concept "Mass of uterine adnexa" "finding"))
      (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
      (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
      (clinical_finding (snomed_concept "Offensive vaginal discharge" "finding"))
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
      (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
    )
  )
)

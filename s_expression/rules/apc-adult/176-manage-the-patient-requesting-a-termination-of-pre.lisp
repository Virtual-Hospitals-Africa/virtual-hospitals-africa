;; Page 176 - Manage the patient requesting a termination of pregnancy (TOP)
;; Triage logic is the lower part of the page: "Review the patient who had a TOP within the past 14 days".
;; The upper part (requesting a TOP: comorbidity referral, gestation routing, regimens) is management only.
;; See 176-manage-the-patient-requesting-a-termination-of-pre-flowchart.md.
(task
  "Check for complications after a termination of pregnancy"
  adult
  (<= (onset (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder"))) (time_ago 14 days))
  (check_for
    ;; adnexal mass (closed cervix and small uterus)
    (clinical_finding (snomed_concept "Mass of uterine adnexa" "finding"))
    (clinical_finding (snomed_concept "Cervical os closed" "finding"))
    (clinical_finding (snomed_concept "Small uterus" "finding"))

    ;; guarding/rebound abdominal tenderness, foul-smelling discharge
    (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
    (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
    (clinical_finding (snomed_concept "Offensive vaginal discharge" "finding"))

    ;; incomplete TOP: enlarged uterus, or open cervical os with bleeding/products of conception visible
    (clinical_finding (snomed_concept "Enlarged uterus" "finding"))
    (clinical_finding (snomed_concept "Cervical os open" "finding"))
    (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
    (clinical_finding (snomed_concept "Products of conception at uterine os cervix" "finding"))
    (clinical_finding (snomed_concept "Products of conception in vagina" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable ectopic pregnancy after a termination of pregnancy"
  (diagnosis
    (snomed_concept "Ectopic pregnancy" "disorder")
    probable
  )
  adult
  ;; Red box: "If adnexal mass, ectopic pregnancy likely", with the question's "(closed cervix and small uterus)"
  (and
    (<= (onset (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder"))) (time_ago 14 days))
    (clinical_finding (snomed_concept "Mass of uterine adnexa" "finding"))
    (clinical_finding (snomed_concept "Cervical os closed" "finding"))
    (clinical_finding (snomed_concept "Small uterus" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable incomplete termination of pregnancy"
  (diagnosis
    (snomed_concept "Incomplete induced termination of pregnancy" "disorder")
    probable
  )
  adult
  ;; "Is there an enlarged uterus or open cervical os with bleeding/products of conception visible? Yes to either, incomplete TOP likely."
  (and
    (<= (onset (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder"))) (time_ago 14 days))
    (or
      (clinical_finding (snomed_concept "Enlarged uterus" "finding"))
      (and
        (clinical_finding (snomed_concept "Cervical os open" "finding"))
        (or
          (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
          (clinical_finding (snomed_concept "Products of conception at uterine os cervix" "finding"))
          (clinical_finding (snomed_concept "Products of conception in vagina" "finding"))
        )
      )
    )
  )
)
(system_priority_evaluation
  "Urgent: complications within 14 days of a termination of pregnancy"
  adult
  Urgent
  ;; Red box: Yes to any of the review question's items -> "Manage urgently 182". Hb < 6 is not representable.
  (and
    (<= (onset (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder"))) (time_ago 14 days))
    (or
      (and
        (clinical_finding (snomed_concept "Mass of uterine adnexa" "finding"))
        (clinical_finding (snomed_concept "Cervical os closed" "finding"))
        (clinical_finding (snomed_concept "Small uterus" "finding"))
      )
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

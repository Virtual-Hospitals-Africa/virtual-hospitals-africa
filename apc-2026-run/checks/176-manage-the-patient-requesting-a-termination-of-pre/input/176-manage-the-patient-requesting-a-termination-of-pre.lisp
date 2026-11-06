(task
  "Check for complications after a termination of pregnancy"
  adult
  (<= (onset (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder"))) (time_ago 14 days))
  (check_for

    (clinical_finding (snomed_concept "Mass of uterine adnexa" "finding"))
    (clinical_finding (snomed_concept "Cervical os closed" "finding"))
    (clinical_finding (snomed_concept "Small uterus" "finding"))


    (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
    (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
    (clinical_finding (snomed_concept "Offensive vaginal discharge" "finding"))


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

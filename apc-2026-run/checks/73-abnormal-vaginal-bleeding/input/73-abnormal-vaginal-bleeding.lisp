(task
  "Check for urgent abnormal vaginal bleeding conditions"
  adult
  (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Postpartum state" "finding"))
    (clinical_finding (snomed_concept "Miscarriage" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))

    (clinical_finding (snomed_concept "Shock" "disorder"))

    (clinical_finding (snomed_concept "Pallor of skin of face" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Asthenia" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))

    (clinical_finding (snomed_concept "Victim of sexual aggression" "finding"))
    (clinical_finding (snomed_concept "Victim of rape" "finding"))
  )
)


(system_priority_evaluation
  "Urgent: abnormal vaginal bleeding with danger signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
    (or
      (clinical_finding (snomed_concept "Pregnancy" "finding"))
      (clinical_finding (snomed_concept "Postpartum state" "finding"))
      (clinical_finding (snomed_concept "Miscarriage" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
      (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))

      (clinical_finding (snomed_concept "Shock" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)

      (and
        (clinical_finding (snomed_concept "Pallor of skin of face" "finding"))
        (or
          (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
          (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
          (clinical_finding (snomed_concept "Dizziness" "finding"))
          (clinical_finding (snomed_concept "Asthenia" "finding"))
          (clinical_finding (snomed_concept "Chest pain" "finding"))
        )
      )
      (clinical_finding (snomed_concept "Victim of sexual aggression" "finding"))
      (clinical_finding (snomed_concept "Victim of rape" "finding"))
    )
  )
)

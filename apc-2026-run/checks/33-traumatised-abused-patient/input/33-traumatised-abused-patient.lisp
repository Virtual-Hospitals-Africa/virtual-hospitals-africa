(task
  "Check for traumatised/abused patient urgent signs and abuse type"
  adult
  (or (clinical_finding (snomed_concept "Victim of abuse" "finding"))
      (clinical_finding (snomed_concept "Victim of psychological trauma" "finding"))
      (diagnosis (snomed_concept "Victim of abuse" "finding") possible))
  (check_for

    (clinical_finding (snomed_concept "Victim of forced sexual activity" "finding"))
    (clinical_finding (snomed_concept "Female" "finding"))
    (clinical_finding (snomed_concept "Male" "finding"))
    (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
    (clinical_finding (snomed_concept "Suicidal thoughts" "finding"))
    (clinical_finding (snomed_concept "Planning suicide" "finding"))
    (clinical_finding (snomed_concept "Overdose" "disorder"))
    (clinical_finding (snomed_concept "Self-injurious behavior" "finding"))


    (clinical_finding (snomed_concept "Victim of physical assault" "finding"))
    (clinical_finding (snomed_concept "Scar" "disorder"))
    (clinical_finding (snomed_concept "Multiple bruising" "finding"))


    (clinical_finding (snomed_concept "Intimidation" "finding"))
    (clinical_finding (snomed_concept "Victim of threats" "finding"))
    (clinical_finding (snomed_concept "Withdrawn behavior" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Fearful mood" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Anxiety" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose possible abuse (traumatised/abused patient page)"
  (diagnosis
    (snomed_concept "Victim of abuse" "finding")
    possible
  )
  adult


  (clinical_finding (snomed_concept "Abnormal behavior" "finding"))
)
(system_diagnosis_rule
  "Diagnose probable sexual assault/rape (traumatised/abused patient page)"
  (diagnosis
    (snomed_concept "Victim of sexual aggression" "finding")
    probable
  )
  adult

  (clinical_finding (snomed_concept "Victim of forced sexual activity" "finding"))
)
(system_diagnosis_rule
  "Diagnose probable physical abuse (traumatised/abused patient page)"
  (diagnosis
    (snomed_concept "Victim of physical abuse" "finding")
    probable
  )
  adult

  (and
    (or (clinical_finding (snomed_concept "Victim of abuse" "finding"))
        (clinical_finding (snomed_concept "Victim of psychological trauma" "finding")))
    (or (clinical_finding (snomed_concept "Victim of physical assault" "finding"))
        (clinical_finding (snomed_concept "Scar" "disorder"))
        (clinical_finding (snomed_concept "Multiple bruising" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable emotional/verbal/psychological abuse (traumatised/abused patient page)"
  (diagnosis
    (snomed_concept "Victim of emotional abuse" "finding")
    probable
  )
  adult

  (and
    (or (clinical_finding (snomed_concept "Victim of abuse" "finding"))
        (clinical_finding (snomed_concept "Victim of psychological trauma" "finding")))
    (or (clinical_finding (snomed_concept "Intimidation" "finding"))
        (clinical_finding (snomed_concept "Victim of threats" "finding"))
        (clinical_finding (snomed_concept "Withdrawn behavior" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
        (clinical_finding (snomed_concept "Fearful mood" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
        (clinical_finding (snomed_concept "Anxiety" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value"))))
  )
)
(system_priority_evaluation
  "Urgent: traumatised/abused patient with recent sexual assault, injuries or suicide risk"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Victim of abuse" "finding"))
        (clinical_finding (snomed_concept "Victim of psychological trauma" "finding")))
    (or

      (and (clinical_finding (snomed_concept "Female" "finding"))
           (<= (onset (clinical_finding (snomed_concept "Victim of forced sexual activity" "finding"))) (time_ago 5 days)))
      (and (clinical_finding (snomed_concept "Male" "finding"))
           (<= (onset (clinical_finding (snomed_concept "Victim of forced sexual activity" "finding"))) (time_ago 3 days)))

      (clinical_finding (snomed_concept "Traumatic injury" "disorder"))

      (clinical_finding (snomed_concept "Suicidal thoughts" "finding"))
      (clinical_finding (snomed_concept "Planning suicide" "finding"))
      (clinical_finding (snomed_concept "Overdose" "disorder"))
      (clinical_finding (snomed_concept "Self-injurious behavior" "finding"))
    )
  )
)

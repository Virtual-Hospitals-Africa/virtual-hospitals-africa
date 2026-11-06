;; Page 33 - Traumatised/abused patient
(task
  "Check for urgent and abuse-type findings in the traumatised/abused patient"
  adult
  (or (clinical_finding (snomed_concept "Victim of abuse" "finding"))
      (clinical_finding (snomed_concept "Victim of psychological trauma" "finding"))
      (diagnosis (snomed_concept "Victim of abuse" "finding") possible))
  (check_for
    ;; Red box
    (clinical_finding (snomed_concept "Sexual assault" "event"))
    (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
    (clinical_finding (snomed_concept "Suicidal thoughts" "finding"))
    (clinical_finding (snomed_concept "Planning suicide" "finding"))
    (clinical_finding (snomed_concept "Overdose" "disorder"))
    (clinical_finding (snomed_concept "Self-injurious behavior" "finding"))

    ;; Physical abuse
    (clinical_finding (snomed_concept "Victim of physical assault" "finding"))
    (clinical_finding (snomed_concept "Scar" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Multiple bruising" "finding"))

    ;; Emotional/verbal/psychological abuse
    (clinical_finding (snomed_concept "Intimidation" "finding"))
    (clinical_finding (snomed_concept "Victim of threats" "finding"))
    (clinical_finding (snomed_concept "Withdrawn" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Fearful mood" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Anxiety" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose possible abuse (suspect abuse, traumatised/abused patient page)"
  (diagnosis
    (snomed_concept "Victim of abuse" "finding")
    possible
  )
  adult
  (clinical_finding (snomed_concept "Strange and inexplicable behavior" "finding"))
)
(system_diagnosis_rule
  "Diagnose probable sexual assault/rape in the traumatised/abused patient"
  (diagnosis
    (snomed_concept "Victim of sexual aggression" "finding")
    probable
  )
  adult
  (clinical_finding (snomed_concept "Sexual assault" "event"))
)
(system_diagnosis_rule
  "Diagnose probable physical abuse in the traumatised/abused patient"
  (diagnosis
    (snomed_concept "Victim of physical abuse" "finding")
    probable
  )
  adult
  (or (clinical_finding (snomed_concept "Victim of physical assault" "finding"))
      (and (or (clinical_finding (snomed_concept "Victim of abuse" "finding"))
               (clinical_finding (snomed_concept "Victim of psychological trauma" "finding")))
           (or (clinical_finding (snomed_concept "Scar" "morphologic abnormality"))
               (clinical_finding (snomed_concept "Multiple bruising" "finding")))))
)
(system_diagnosis_rule
  "Diagnose probable emotional/verbal/psychological abuse in the traumatised/abused patient"
  (diagnosis
    (snomed_concept "Victim of emotional abuse" "finding")
    probable
  )
  adult
  (or (clinical_finding (snomed_concept "Intimidation" "finding"))
      (clinical_finding (snomed_concept "Victim of threats" "finding"))
      (and (or (clinical_finding (snomed_concept "Victim of abuse" "finding"))
               (clinical_finding (snomed_concept "Victim of psychological trauma" "finding")))
           (or (clinical_finding (snomed_concept "Withdrawn" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
               (clinical_finding (snomed_concept "Fearful mood" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
               (clinical_finding (snomed_concept "Anxiety" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value"))))))
)
(system_priority_evaluation
  "Urgent: traumatised/abused patient with recent sexual assault, injury or suicide risk"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Victim of abuse" "finding"))
        (clinical_finding (snomed_concept "Victim of psychological trauma" "finding")))
    (or (<= (onset (clinical_finding (snomed_concept "Sexual assault" "event"))) (time_ago 5 days))
        (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
        (clinical_finding (snomed_concept "Suicidal thoughts" "finding"))
        (clinical_finding (snomed_concept "Planning suicide" "finding"))
        (clinical_finding (snomed_concept "Overdose" "disorder"))
        (clinical_finding (snomed_concept "Self-injurious behavior" "finding"))))
)

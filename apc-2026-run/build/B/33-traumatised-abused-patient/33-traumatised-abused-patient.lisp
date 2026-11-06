;; Page 33 - Traumatised/abused patient
;; The presenting complaint is recorded as "Victim of abuse" (descendants include victims of
;; sexual abuse, physical assault, physical/emotional/psychological/verbal abuse) or
;; "Victim of psychological trauma". Neither is yet a recorded common symptom or warning sign.
;; "Suspect abuse if ... patient's behaviour seems strange" is a possible-diagnosis pre-screen
;; that also triggers the check_for task.
(task
  "Check for traumatised/abused patient urgent signs and abuse type"
  adult
  (or (clinical_finding (snomed_concept "Victim of abuse" "finding"))
      (clinical_finding (snomed_concept "Victim of psychological trauma" "finding"))
      (diagnosis (snomed_concept "Victim of abuse" "finding") possible))
  (check_for
    ;; Red box
    (clinical_finding (snomed_concept "Victim of forced sexual activity" "finding"))
    (clinical_finding (snomed_concept "Female" "finding"))
    (clinical_finding (snomed_concept "Male" "finding"))
    (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
    (clinical_finding (snomed_concept "Suicidal thoughts" "finding"))
    (clinical_finding (snomed_concept "Planning suicide" "finding"))
    (clinical_finding (snomed_concept "Overdose" "disorder"))
    (clinical_finding (snomed_concept "Self-injurious behavior" "finding"))

    ;; Physical abuse
    (clinical_finding (snomed_concept "Victim of physical assault" "finding"))
    (clinical_finding (snomed_concept "Scar" "disorder"))
    (clinical_finding (snomed_concept "Multiple bruising" "finding"))

    ;; Emotional/verbal/psychological abuse
    (clinical_finding (snomed_concept "Intimidation" "finding"))
    (clinical_finding (snomed_concept "Victim of threats" "finding"))
    (clinical_finding (snomed_concept "Withdrawn behavior" "finding"))
    (clinical_finding (snomed_concept "Fearful mood" "finding"))
    (clinical_finding (snomed_concept "Anxiety" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose possible abuse (traumatised/abused patient page)"
  (diagnosis
    (snomed_concept "Victim of abuse" "finding")
    possible
  )
  adult
  ;; "Suspect abuse if ... patient's behaviour seems strange". Disclosure is the trigger finding
  ;; itself; "examination contradicts history" and "abuse clear on examination" have no concept.
  (clinical_finding (snomed_concept "Abnormal behavior" "finding"))
)
(system_diagnosis_rule
  "Diagnose probable sexual assault/rape (traumatised/abused patient page)"
  (diagnosis
    (snomed_concept "Victim of sexual aggression" "finding")
    probable
  )
  adult
  ;; "If forced to do any form of sexual act without consent, sexual assault/rape likely"
  (clinical_finding (snomed_concept "Victim of forced sexual activity" "finding"))
)
(system_diagnosis_rule
  "Diagnose probable physical abuse (traumatised/abused patient page)"
  (diagnosis
    (snomed_concept "Victim of physical abuse" "finding")
    probable
  )
  adult
  ;; Context: the page applies to the traumatised/abused patient (scars or bruises alone are not enough)
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
        (clinical_finding (snomed_concept "Withdrawn behavior" "finding"))
        (clinical_finding (snomed_concept "Fearful mood" "finding"))
        (clinical_finding (snomed_concept "Anxiety" "finding")))
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
      ;; Sexual assault/rape within last 5 days if woman or last 3 days if man
      (and (clinical_finding (snomed_concept "Female" "finding"))
           (<= (onset (clinical_finding (snomed_concept "Victim of forced sexual activity" "finding"))) (time_ago 5 days)))
      (and (clinical_finding (snomed_concept "Male" "finding"))
           (<= (onset (clinical_finding (snomed_concept "Victim of forced sexual activity" "finding"))) (time_ago 3 days)))
      ;; Injuries needing attention
      (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
      ;; Suicidal thoughts/plans, overdose or self harm
      (clinical_finding (snomed_concept "Suicidal thoughts" "finding"))
      (clinical_finding (snomed_concept "Planning suicide" "finding"))
      (clinical_finding (snomed_concept "Overdose" "disorder"))
      (clinical_finding (snomed_concept "Self-injurious behavior" "finding"))
    )
  )
)

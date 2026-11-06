;; Page 32 - Sexual assault and/or rape
(task
  "Check for urgent sexual assault/rape conditions"
  adult
  (or (clinical_finding (snomed_concept "Victim of sexual aggression" "finding"))
      (diagnosis (snomed_concept "Victim of sexual aggression" "finding") possible)
      (diagnosis (snomed_concept "Victim of rape" "finding") possible)
  )
  (check_for
    (clinical_finding (snomed_concept "Pregnancy" "finding"))

    (clinical_finding (snomed_concept "Traumatic injury" "disorder"))

    (clinical_finding (snomed_concept "Suicidal thoughts" "finding"))
    (clinical_finding (snomed_concept "Planning suicide" "finding"))
    (clinical_finding (snomed_concept "Overdose" "disorder"))
    (clinical_finding (snomed_concept "Self-injurious behavior" "finding"))
  )
)
;; Page 32 - "Suspect sexual assault if patient forced into sexual act (excluding penetration) without consent."
(system_diagnosis_rule
  "Diagnose possible sexual assault"
  (diagnosis
    (snomed_concept "Victim of sexual aggression" "finding")
    possible
  )
  adult
  (clinical_finding (snomed_concept "Victim of forced sexual activity" "finding"))
)
;; Page 32 - "Suspect rape if intentional penetration of patient's vagina/anus/mouth with any object, without consent."
(system_diagnosis_rule
  "Diagnose possible rape"
  (diagnosis
    (snomed_concept "Victim of rape" "finding")
    possible
  )
  adult
  (or (clinical_finding (snomed_concept "Sexual assault with digital penetration of vagina" "event"))
      (clinical_finding (snomed_concept "Sexual assault with penetration of vagina with foreign body" "event"))
      (clinical_finding (snomed_concept "Sexual assault with anal penetration by penis" "event"))
      (clinical_finding (snomed_concept "Sexual assault with digital penetration of anus" "event"))
      (clinical_finding (snomed_concept "Sexual assault with penetration of anus with foreign body" "event"))
      (clinical_finding (snomed_concept "Sexual assault with oral penetration by penis" "event"))
  )
)
;; Page 32 - red box: "Give urgent attention to the patient who was sexually assaulted and/or raped with any of:"
;; The page's "within last 5 days if woman or last 3 days if man" cannot be split by sex (no sex in the
;; language); the wider 5-day window is used for everyone (see remaining-questions).
(system_priority_evaluation
  "Urgent: sexual assault/rape with urgent signs"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Victim of sexual aggression" "finding"))
        (diagnosis (snomed_concept "Victim of sexual aggression" "finding") possible)
        (diagnosis (snomed_concept "Victim of rape" "finding") possible)
    )
    (or
      (<= (onset (clinical_finding (snomed_concept "Victim of sexual aggression" "finding"))) (time_ago 5 days))
      (<= (onset (clinical_finding (snomed_concept "Victim of forced sexual activity" "finding"))) (time_ago 5 days))
      (<= (onset (clinical_finding (snomed_concept "Sexual assault with digital penetration of vagina" "event"))) (time_ago 5 days))
      (<= (onset (clinical_finding (snomed_concept "Sexual assault with penetration of vagina with foreign body" "event"))) (time_ago 5 days))
      (<= (onset (clinical_finding (snomed_concept "Sexual assault with anal penetration by penis" "event"))) (time_ago 5 days))
      (<= (onset (clinical_finding (snomed_concept "Sexual assault with digital penetration of anus" "event"))) (time_ago 5 days))
      (<= (onset (clinical_finding (snomed_concept "Sexual assault with penetration of anus with foreign body" "event"))) (time_ago 5 days))
      (<= (onset (clinical_finding (snomed_concept "Sexual assault with oral penetration by penis" "event"))) (time_ago 5 days))
      (clinical_finding (snomed_concept "Pregnancy" "finding"))
      (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
      (clinical_finding (snomed_concept "Suicidal thoughts" "finding"))
      (clinical_finding (snomed_concept "Planning suicide" "finding"))
      (clinical_finding (snomed_concept "Overdose" "disorder"))
      (clinical_finding (snomed_concept "Self-injurious behavior" "finding"))
    )
  )
)

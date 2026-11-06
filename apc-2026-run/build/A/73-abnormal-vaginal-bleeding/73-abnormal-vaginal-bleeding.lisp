;; Page 73 - Abnormal vaginal bleeding
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

    (clinical_finding (snomed_concept "Pale complexion" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Asthenia" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))

    (clinical_finding (snomed_concept "Victim of sexual aggression" "finding"))
  )
)
(system_priority_evaluation
  "Urgent: abnormal vaginal bleeding with danger signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
    (or
      ;; Pregnant; recent delivery/miscarriage/termination of pregnancy
      (clinical_finding (snomed_concept "Pregnancy" "finding"))
      (clinical_finding (snomed_concept "Postpartum state" "finding"))
      (clinical_finding (snomed_concept "Miscarriage" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
      (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
      ;; Shock/SBP < 80 (this page's own wording; footnote 1 not encoded as a shock definition)
      (clinical_finding (snomed_concept "Shock" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
      ;; Pallor with pulse >= 100, respiratory rate >= 30, dizziness/weakness or chest pain
      (and
        (clinical_finding (snomed_concept "Pale complexion" "finding"))
        (or
          (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
          (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
          (clinical_finding (snomed_concept "Dizziness" "finding"))
          (clinical_finding (snomed_concept "Asthenia" "finding"))
          (clinical_finding (snomed_concept "Chest pain" "finding"))
        )
      )
      ;; Hb < 6: not representable (no haemoglobin observable/unit in the language)
      ;; Sexual assault and/or rape
      (clinical_finding (snomed_concept "Victim of sexual aggression" "finding"))
    )
  )
)

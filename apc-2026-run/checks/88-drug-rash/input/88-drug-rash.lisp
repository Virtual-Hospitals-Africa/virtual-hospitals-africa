(task
  "Check for new medication in generalised rash"
  adult
  (clinical_finding (snomed_concept "Generalized rash" "disorder"))
  (check_for
    (clinical_finding (snomed_concept "New medication commenced" "finding"))
  )
)
(task
  "Check for drug rash markers of severity"
  adult
  (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
      (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
  (check_for
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Shock" "disorder"))

    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Diarrhea" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Jaundice" "finding"))

    (clinical_finding (snomed_concept "Eruption caused by drug" "disorder") (finding_site (snomed_concept "Mouth region structure" "body structure")))
    (clinical_finding (snomed_concept "Eruption caused by drug" "disorder") (finding_site (snomed_concept "Eye region structure" "body structure")))
    (clinical_finding (snomed_concept "Eruption caused by drug" "disorder") (finding_site (snomed_concept "Genital structure" "body structure")))
    (clinical_finding (snomed_concept "Blister of skin" "disorder"))
    (clinical_finding (snomed_concept "Peeling of skin" "finding"))
    (clinical_finding (snomed_concept "Denuded skin" "disorder"))

    (clinical_finding (snomed_concept "Generally unwell" "finding"))
    (clinical_finding (snomed_concept "Malaise" "finding"))
    (clinical_finding (snomed_concept "Fatigue" "finding"))
    (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))

    (clinical_finding (snomed_concept "Hyperpigmentation of skin" "disorder"))
    (clinical_finding (snomed_concept "Macule of skin" "disorder"))
  )
)
(system_diagnosis_rule
  "Suspect drug rash: generalised rash after new medication"
  (diagnosis
    (snomed_concept "Eruption caused by drug" "disorder")
    possible
  )
  adult

  (and (clinical_finding (snomed_concept "Generalized rash" "disorder"))
       (<= (onset (clinical_finding (snomed_concept "New medication commenced" "finding"))) (time_ago 3 months)))
)
(system_diagnosis_rule
  "Diagnose probable fixed drug eruption"
  (diagnosis
    (snomed_concept "Fixed drug eruption" "disorder")
    probable
  )
  adult

  (and (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
           (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
       (clinical_finding (snomed_concept "Hyperpigmentation of skin" "disorder"))
       (clinical_finding (snomed_concept "Macule of skin" "disorder")))
)
(system_priority_evaluation
  "Urgent: drug rash with markers of severity"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
        (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
    (or
      (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
      (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))

      (clinical_finding (snomed_concept "Shock" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (clinical_finding (snomed_concept "Abdominal pain" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (clinical_finding (snomed_concept "Diarrhea" "finding"))
      (clinical_finding (snomed_concept "Eruption caused by drug" "disorder") (finding_site (snomed_concept "Mouth region structure" "body structure")))
      (clinical_finding (snomed_concept "Eruption caused by drug" "disorder") (finding_site (snomed_concept "Eye region structure" "body structure")))
      (clinical_finding (snomed_concept "Eruption caused by drug" "disorder") (finding_site (snomed_concept "Genital structure" "body structure")))
      (clinical_finding (snomed_concept "Blister of skin" "disorder"))
      (clinical_finding (snomed_concept "Peeling of skin" "finding"))
      (clinical_finding (snomed_concept "Denuded skin" "disorder"))
      (clinical_finding (snomed_concept "Jaundice" "finding"))
      (clinical_finding (snomed_concept "Generally unwell" "finding"))
      (clinical_finding (snomed_concept "Malaise" "finding"))
      (clinical_finding (snomed_concept "Fatigue" "finding"))
      (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))

      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
    )
  )
)

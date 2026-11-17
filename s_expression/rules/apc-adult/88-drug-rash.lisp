;; Page 88 - Drug rash
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
  ;; "generalised rash which appeared within 3 months of starting a new medication"
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
  ;; "dark coloured round flat spots ... following ingestion of a medication ... fixed drug eruption likely"
  (and (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
           (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
       (clinical_finding (snomed_concept "Hyperpigmentation of skin" "disorder"))
       (clinical_finding (snomed_concept "Macule of skin" "disorder")))
)

(system_priority_evaluation
  "Urgent: drug rash with swelling (site: face structure)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
        (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
  )
)

(system_priority_evaluation
  "Urgent: drug rash with swelling (site: tongue structure)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
        (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
  )
)

(system_priority_evaluation
  "Urgent: drug rash with difficulty breathing"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
        (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
  )
)
;; Shock¹/SBP < 80, as the page writes it
(system_priority_evaluation
  "Urgent: drug rash with shock"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
        (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
    (clinical_finding (snomed_concept "Shock" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: drug rash with systolic blood pressure < 80 mmHg"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
        (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
  )
)

(system_priority_evaluation
  "Urgent: drug rash with body temperature ≥ 38 °C"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
        (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
    (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
  )
)

(system_priority_evaluation
  "Urgent: drug rash with abdominal pain"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
        (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: drug rash with finding of vomiting"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
        (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: drug rash with diarrhea"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
        (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
    (clinical_finding (snomed_concept "Diarrhea" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: drug rash with eruption caused by drug (site: mouth region structure)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
        (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
    (clinical_finding (snomed_concept "Eruption caused by drug" "disorder") (finding_site (snomed_concept "Mouth region structure" "body structure")))
  )
)

(system_priority_evaluation
  "Urgent: drug rash with eruption caused by drug (site: eye region structure)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
        (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
    (clinical_finding (snomed_concept "Eruption caused by drug" "disorder") (finding_site (snomed_concept "Eye region structure" "body structure")))
  )
)

(system_priority_evaluation
  "Urgent: drug rash with eruption caused by drug (site: genital structure)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
        (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
    (clinical_finding (snomed_concept "Eruption caused by drug" "disorder") (finding_site (snomed_concept "Genital structure" "body structure")))
  )
)

(system_priority_evaluation
  "Urgent: drug rash with blister of skin"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
        (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
    (clinical_finding (snomed_concept "Blister of skin" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: drug rash with peeling of skin"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
        (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
    (clinical_finding (snomed_concept "Peeling of skin" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: drug rash with denuded skin"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
        (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
    (clinical_finding (snomed_concept "Denuded skin" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: drug rash with jaundice"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
        (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: drug rash with generally unwell"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
        (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
    (clinical_finding (snomed_concept "Generally unwell" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: drug rash with malaise"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
        (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
    (clinical_finding (snomed_concept "Malaise" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: drug rash with fatigue"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
        (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
    (clinical_finding (snomed_concept "Fatigue" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: drug rash with generalized aches and pains"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
        (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
    (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
  )
)
;; Footnote 2 markers of severity (review step → "Give urgent attention as above"): BP < 90/60
(system_priority_evaluation
  "Urgent: drug rash with systolic blood pressure < 90 mmHg"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
        (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
  )
)

(system_priority_evaluation
  "Urgent: drug rash with diastolic blood pressure < 60 mmHg"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
        (diagnosis (snomed_concept "Eruption caused by drug" "disorder") possible))
    (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
  )
)

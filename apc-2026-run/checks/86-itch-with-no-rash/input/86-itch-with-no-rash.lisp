(task
  "Check for causes of itch with no rash"
  adult
  (clinical_finding (snomed_concept "Itching" "finding"))
  (check_for

    (clinical_finding (snomed_concept "Eruption" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Infestation caused by Sarcoptes scabiei var hominis" "disorder"))
    (clinical_finding (snomed_concept "Louse infestation" "disorder"))
    (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))


    (clinical_finding (snomed_concept "Severe dry skin" "disorder"))


    (clinical_finding (snomed_concept "New medication commenced" "finding"))


    (clinical_finding (snomed_concept "Yellow skin" "finding"))
    (clinical_finding (snomed_concept "Scleral icterus" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable dry skin in itch with no rash"
  (diagnosis
    (snomed_concept "Xeroderma" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Itching" "finding"))
    (no (clinical_finding (snomed_concept "Eruption" "morphologic abnormality")))
    (no (clinical_finding (snomed_concept "Infestation caused by Sarcoptes scabiei var hominis" "disorder")))
    (no (clinical_finding (snomed_concept "Louse infestation" "disorder")))
    (no (clinical_finding (snomed_concept "Insect bite - wound" "disorder")))

    (clinical_finding (snomed_concept "Severe dry skin" "disorder"))
  )
)
(system_diagnosis_rule
  "Diagnose probable medication side-effect in itch with no rash"
  (diagnosis
    (snomed_concept "Adverse reaction caused by drug" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Itching" "finding"))
    (no (clinical_finding (snomed_concept "Eruption" "morphologic abnormality")))
    (no (clinical_finding (snomed_concept "Infestation caused by Sarcoptes scabiei var hominis" "disorder")))
    (no (clinical_finding (snomed_concept "Louse infestation" "disorder")))
    (no (clinical_finding (snomed_concept "Insect bite - wound" "disorder")))

    (no (clinical_finding (snomed_concept "Severe dry skin" "disorder")))

    (clinical_finding (snomed_concept "New medication commenced" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable jaundice in itch with no rash"
  (diagnosis
    (snomed_concept "Jaundice" "finding")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Itching" "finding"))
    (no (clinical_finding (snomed_concept "Eruption" "morphologic abnormality")))
    (no (clinical_finding (snomed_concept "Infestation caused by Sarcoptes scabiei var hominis" "disorder")))
    (no (clinical_finding (snomed_concept "Louse infestation" "disorder")))
    (no (clinical_finding (snomed_concept "Insect bite - wound" "disorder")))

    (no (clinical_finding (snomed_concept "Severe dry skin" "disorder")))

    (no (clinical_finding (snomed_concept "New medication commenced" "finding")))

    (or (clinical_finding (snomed_concept "Yellow skin" "finding"))
        (clinical_finding (snomed_concept "Scleral icterus" "finding")))
  )
)

(task
  "Check for causes of generalised non-itchy rash"
  adult
  (clinical_finding (snomed_concept "Generalized rash" "disorder"))
  (check_for

    (clinical_finding (snomed_concept "Tick bite" "disorder"))
    (clinical_finding (snomed_concept "Infestation caused by Ixodidae" "disorder"))
    (clinical_finding (snomed_concept "Infestation caused by Argasidae" "disorder"))
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))


    (clinical_finding (snomed_concept "Lesion of genitalia" "disorder"))
    (clinical_finding (snomed_concept "Lesion" "morphologic abnormality") (finding_site (snomed_concept "Anal structure" "body structure")))
    (clinical_finding (snomed_concept "Lesion of rectum" "disorder"))
    (clinical_finding (snomed_concept "Oral lesion" "disorder"))
    (clinical_finding (snomed_concept "Lesion of eye" "disorder"))
    (clinical_finding (snomed_concept "Backache" "finding"))
    (clinical_finding (snomed_concept "Lymphadenopathy" "disorder"))
    (clinical_finding (snomed_concept "Fatigue" "finding"))
    (clinical_finding (snomed_concept "Sore throat" "finding"))
    (clinical_finding (snomed_concept "Nasal congestion" "finding"))
    (clinical_finding (snomed_concept "Cough" "finding"))


    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))


    (clinical_finding (snomed_concept "Syphilis titer detected" "finding"))
    (clinical_finding (snomed_concept "Syphilis titer not detected" "finding"))
    (clinical_finding (snomed_concept "Human immunodeficiency virus not detected" "finding"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Human immunodeficiency virus" "organism"))
  )
)
(system_diagnosis_rule
  "Diagnose probable tick bite fever (generalised rash page)"
  (diagnosis
    (snomed_concept "Spotted fever group rickettsial disease" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))

    (or (clinical_finding (snomed_concept "Tick bite" "disorder"))
        (clinical_finding (snomed_concept "Infestation caused by Ixodidae" "disorder"))
        (clinical_finding (snomed_concept "Infestation caused by Argasidae" "disorder"))
    )
    (or (clinical_finding (snomed_concept "Headache" "finding"))
        (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
        (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose possible mpox (generalised rash page)"
  (diagnosis
    (snomed_concept "Monkeypox" "disorder")
    possible
  )
  adult
  (and

    (or (clinical_finding (snomed_concept "Skin lesion" "disorder"))
        (clinical_finding (snomed_concept "Lesion of genitalia" "disorder"))
        (clinical_finding (snomed_concept "Lesion" "morphologic abnormality") (finding_site (snomed_concept "Anal structure" "body structure")))
        (clinical_finding (snomed_concept "Lesion of rectum" "disorder"))
        (clinical_finding (snomed_concept "Oral lesion" "disorder"))
        (clinical_finding (snomed_concept "Lesion of eye" "disorder"))
    )

    (or (clinical_finding (snomed_concept "Headache" "finding"))
        (clinical_finding (snomed_concept "Backache" "finding"))
        (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
        (clinical_finding (snomed_concept "Lymphadenopathy" "disorder"))
        (> (measurement (snomed_concept "Body temperature" "observable entity") °C) 38.5)
        (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Sore throat" "finding"))
        (clinical_finding (snomed_concept "Nasal congestion" "finding"))
        (clinical_finding (snomed_concept "Cough" "finding"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose possible drug rash (generalised rash page)"
  (diagnosis
    (snomed_concept "Eruption caused by drug" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))

    (<= (onset (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))) (time_ago 3 months))
  )
)
(system_diagnosis_rule
  "Diagnose probable secondary syphilis (generalised rash page)"
  (diagnosis
    (snomed_concept "Secondary syphilis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
    (clinical_finding (snomed_concept "Syphilis titer detected" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose possible HIV seroconversion illness (generalised rash page)"
  (diagnosis
    (snomed_concept "Acute human immunodeficiency virus infection" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
    (clinical_finding (snomed_concept "Syphilis titer not detected" "finding"))
    (clinical_finding (snomed_concept "Human immunodeficiency virus not detected" "finding"))

    (<= (onset (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Human immunodeficiency virus" "organism"))) (time_ago 6 weeks))
  )
)
(system_diagnosis_rule
  "Diagnose probable non-specific viral rash (generalised rash page)"
  (diagnosis
    (snomed_concept "Viral exanthem" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
    (clinical_finding (snomed_concept "Syphilis titer not detected" "finding"))
    (clinical_finding (snomed_concept "Human immunodeficiency virus not detected" "finding"))

    (or (no (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Human immunodeficiency virus" "organism")))
        (>= (onset (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Human immunodeficiency virus" "organism"))) (time_ago 6 weeks))
    )
  )
)

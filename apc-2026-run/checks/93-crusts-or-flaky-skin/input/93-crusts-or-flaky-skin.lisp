(task
  "Check for causes of crusts or flaky skin"
  adult
  (or (clinical_finding (snomed_concept "Crust on skin" "finding"))
      (clinical_finding (snomed_concept "Scaly skin" "finding")))
  (check_for

    (clinical_finding (snomed_concept "Crust on skin" "finding") (qualifier (snomed_concept "Yellow color" "qualifier value")))
    (clinical_finding (snomed_concept "Blister of skin" "disorder"))


    (clinical_finding (snomed_concept "Erythema" "finding"))
    (clinical_finding (snomed_concept "Greasy skin" "finding"))


    (clinical_finding (snomed_concept "Skin plaque" "disorder") (qualifier (snomed_concept "Well defined" "qualifier value")) (qualifier (snomed_concept "Raised" "qualifier value")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Silver color" "qualifier value")))


    (clinical_finding (snomed_concept "Xeroderma" "disorder"))
    (clinical_finding (snomed_concept "Itching of skin" "finding"))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Skin structure of wrist region" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Skin structure of ankle" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Skin structure of antecubital fossa" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Skin structure of popliteal fossa" "body structure")))
  )
)
(system_diagnosis_rule
  "Diagnose probable impetigo (crusts or flaky skin)"
  (diagnosis
    (snomed_concept "Impetigo" "disorder")
    probable
  )
  adult

  (and (clinical_finding (snomed_concept "Blister of skin" "disorder"))
       (clinical_finding (snomed_concept "Crust on skin" "finding") (qualifier (snomed_concept "Yellow color" "qualifier value"))))
)
(system_diagnosis_rule
  "Diagnose probable seborrhoeic dermatitis (crusts or flaky skin)"
  (diagnosis
    (snomed_concept "Seborrheic dermatitis" "disorder")
    probable
  )
  adult

  (and (clinical_finding (snomed_concept "Scaly skin" "finding"))
       (clinical_finding (snomed_concept "Erythema" "finding"))
       (clinical_finding (snomed_concept "Greasy skin" "finding")))
)
(system_diagnosis_rule
  "Diagnose probable psoriasis (crusts or flaky skin)"
  (diagnosis
    (snomed_concept "Psoriasis" "disorder")
    probable
  )
  adult

  (and (clinical_finding (snomed_concept "Skin plaque" "disorder") (qualifier (snomed_concept "Well defined" "qualifier value")) (qualifier (snomed_concept "Raised" "qualifier value")))
       (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Silver color" "qualifier value"))))
)
(system_diagnosis_rule
  "Diagnose probable eczema (crusts or flaky skin)"
  (diagnosis
    (snomed_concept "Eczema" "disorder")
    probable
  )
  adult

  (and (or (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Skin structure of wrist region" "body structure")))
           (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Skin structure of ankle" "body structure")))
           (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Skin structure of antecubital fossa" "body structure")))
           (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Skin structure of popliteal fossa" "body structure"))))
       (clinical_finding (snomed_concept "Xeroderma" "disorder"))
       (clinical_finding (snomed_concept "Itching of skin" "finding")))
)

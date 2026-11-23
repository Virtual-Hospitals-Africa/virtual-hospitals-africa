;; Page 93 - Crusts or flaky skin
;; Red box is a pointer only: "Check if the patient needs urgent attention 82" (triage lives on page 82).
(task
  "Check for causes of crusts or flaky skin"
  adult
  (or (clinical_finding (snomed_concept "Crust on skin" "finding"))
      (clinical_finding (snomed_concept "Scaly skin" "finding")))
  (check_for
    ;; Crusts: impetigo
    (clinical_finding (snomed_concept "Crust on skin" "finding") (qualifier (snomed_concept "Yellow color" "qualifier value")))
    (clinical_finding (snomed_concept "Blister of skin" "disorder"))

    ;; Flaky skin: seborrhoeic dermatitis
    (clinical_finding (snomed_concept "Erythema" "finding"))
    (clinical_finding (snomed_concept "Greasy skin" "finding"))

    ;; Flaky skin: psoriasis
    (clinical_finding (snomed_concept "Skin plaque" "disorder") (qualifier (snomed_concept "Well defined" "qualifier value")) (qualifier (snomed_concept "Raised" "qualifier value")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Silver color" "qualifier value")))

    ;; Flaky skin: eczema
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
  ;; Crusts branch: "Blisters which dry to form yellow crusts"
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
  ;; Flaky skin branch: "Red/pink scaly patches with fine, greasy scales"
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
  ;; Flaky skin branch: "Well-defined, raised plaques covered with silvery scale"
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
  ;; Flaky skin branch: "Patches of dry, scaly, itchy skin on wrists, ankles, inside elbows or behind knees"
  (and (or (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Skin structure of wrist region" "body structure")))
           (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Skin structure of ankle" "body structure")))
           (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Skin structure of antecubital fossa" "body structure")))
           (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Skin structure of popliteal fossa" "body structure"))))
       (clinical_finding (snomed_concept "Xeroderma" "disorder"))
       (clinical_finding (snomed_concept "Itching of skin" "finding")))
)

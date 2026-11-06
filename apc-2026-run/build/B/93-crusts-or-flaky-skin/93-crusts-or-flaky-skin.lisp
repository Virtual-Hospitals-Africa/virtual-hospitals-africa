;; Page 93 - Crusts or flaky skin
;; Red box: pointer only ("Check if the patient needs urgent attention 82") - no priority evaluation on this page.
(task
  "Check for crusts or flaky skin conditions"
  adult
  (or (clinical_finding (snomed_concept "Crust on skin" "finding"))
      (clinical_finding (snomed_concept "Scaly skin" "finding")))
  (check_for
    ;; Crusts branch: impetigo
    (clinical_finding (snomed_concept "Blister of skin" "disorder"))
    (clinical_finding (snomed_concept "Crust on skin" "finding") (qualifier (snomed_concept "Yellow color" "qualifier value")))

    ;; Flaky skin branch: seborrhoeic dermatitis
    (clinical_finding (snomed_concept "Erythema" "finding"))
    (clinical_finding (snomed_concept "Greasy skin" "finding"))

    ;; Flaky skin branch: psoriasis
    (clinical_finding (snomed_concept "Skin plaque" "disorder"))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Silver color" "qualifier value")))

    ;; Flaky skin branch: eczema
    (clinical_finding (snomed_concept "Xeroderma" "disorder"))
    (clinical_finding (snomed_concept "Itching of skin" "finding"))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Wrist region structure" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Ankle region structure" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Structure of cubital fossa" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Popliteal region structure" "body structure")))
  )
)
(system_diagnosis_rule
  "Diagnose probable impetigo (crusts or flaky skin)"
  (diagnosis
    (snomed_concept "Impetigo" "disorder")
    probable
  )
  adult
  ;; Crusts: blisters which dry to form yellow crusts
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
  ;; Flaky skin: red/pink scaly patches with fine, greasy scales
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
  ;; Flaky skin: well-defined, raised plaques covered with silvery scale
  (and (clinical_finding (snomed_concept "Skin plaque" "disorder"))
       (clinical_finding (snomed_concept "Scaly skin" "finding") (qualifier (snomed_concept "Silver color" "qualifier value"))))
)
(system_diagnosis_rule
  "Diagnose probable eczema (crusts or flaky skin)"
  (diagnosis
    (snomed_concept "Eczema" "disorder")
    probable
  )
  adult
  ;; Flaky skin: patches of dry, scaly, itchy skin on wrists, ankles, inside elbows or behind knees
  (and (clinical_finding (snomed_concept "Xeroderma" "disorder"))
       (clinical_finding (snomed_concept "Itching of skin" "finding"))
       (or (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Wrist region structure" "body structure")))
           (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Ankle region structure" "body structure")))
           (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Structure of cubital fossa" "body structure")))
           (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Popliteal region structure" "body structure")))))
)

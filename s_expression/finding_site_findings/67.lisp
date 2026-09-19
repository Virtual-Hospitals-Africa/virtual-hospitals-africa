;; Skin symptoms ⇢ 67
(finding_site_findings
  "Skin"
  (finding_site_structure (snomed_concept "Skin structure" "body structure"))
  (excluding_structures
    (snomed_concept "Nail unit structure" "body structure")
    (snomed_concept "Scalp structure" "body structure")
  )
  (clinical_findings
    ;; Sudden generalised itch/rash or face/tongue swelling and any of
    (clinical_finding (snomed_concept "Generalized pruritus" "finding"))
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
    (clinical_finding (snomed_concept "Wheezing" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    ;; Purple/red rash with neck stiffness, drowsy/confused, temperature, headache
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Fever" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding"))
    ;; Diffuse rash within 3 months of a new medication, involving mouth, eyes or genitals
    (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
    (clinical_finding (snomed_concept "Perioral dermatitis" "disorder"))
    (clinical_finding (snomed_concept "Periocular dermatitis" "disorder"))
    (clinical_finding (snomed_concept "Rash of genitalia" "disorder"))
    (clinical_finding (snomed_concept "Blister of skin" "disorder"))
    (clinical_finding (snomed_concept "Peeling of skin" "finding"))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (clinical_finding (snomed_concept "Diarrhea" "finding"))
    ;; Manage according to skin symptom/s
    (clinical_finding (snomed_concept "Pain of skin" "finding"))
    (clinical_finding (snomed_concept "Itching of skin" "finding"))
    (clinical_finding (snomed_concept "Eruption of skin" "disorder"))
    (clinical_finding (snomed_concept "Skin lesion" "disorder"))
    (clinical_finding (snomed_concept "Acne" "disorder"))
    (clinical_finding (snomed_concept "Comedo" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Skin ulcer" "disorder"))
    (clinical_finding (snomed_concept "Crust on skin" "finding"))
    (clinical_finding (snomed_concept "Scaly skin" "finding"))
    (clinical_finding (snomed_concept "Discoloration of skin" "finding"))
  )
)

;; Ear/hearing symptoms ⇢ 33
(finding_site_findings
  "Ear"
  (finding_site_structure (snomed_concept "Ear structure" "body structure"))
  (clinical_findings
    (clinical_finding (snomed_concept "Itching of ear" "finding"))
    (clinical_finding (snomed_concept "Ear discharge" "finding"))
    (clinical_finding (snomed_concept "Pain of ear" "finding"))
    (clinical_finding (snomed_concept "Pain of ear" "finding") (qualifier (snomed_concept "Wakes up during night" "finding")))
    (clinical_finding (snomed_concept "Hearing difficulty" "finding"))
    (clinical_finding (snomed_concept "Tinnitus" "finding"))
    ;; Redness, swelling and/or pus in ear canal; red swollen painful ear lobe
    (clinical_finding (snomed_concept "Swelling of ear" "finding") (qualifier (snomed_concept "Red color" "qualifier value")) (qualifier (snomed_concept "Pain" "finding")))
    (clinical_finding (snomed_concept "Tenderness in ear canal" "finding"))
    ;; Look in ear
    (clinical_finding (snomed_concept "Perforation of tympanic membrane" "disorder"))
    (clinical_finding (snomed_concept "Bulging tympanic membrane" "finding"))
    (clinical_finding (snomed_concept "Bright red tympanic membrane" "finding"))
    (clinical_finding (snomed_concept "Foreign body in ear" "disorder"))
    (clinical_finding (snomed_concept "Impacted cerumen" "disorder"))
    ;; Painful swelling behind ear; neck stiffness
    (clinical_finding (snomed_concept "Swelling over mastoid" "finding") (qualifier (snomed_concept "Pain" "finding")))
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Vertigo" "finding"))
    (clinical_finding (snomed_concept "Fever" "finding"))
  )
)

;; Mouth/throat symptoms ⇢ 35
(finding_site_findings
  "Mouth or throat"
  (finding_site_structure (snomed_concept "Structure of mouth and/or pharynx" "body structure"))
  (excluding_structures
    (snomed_concept "Tooth, gum, and/or supporting structure" "body structure")
  )
  (clinical_findings
    ;; Red swelling blocking airway; unable to open mouth; unable to swallow at all
    (clinical_finding (snomed_concept "Pharyngeal swelling" "finding"))
    (clinical_finding (snomed_concept "Upper respiratory tract obstruction" "disorder"))
    (clinical_finding (snomed_concept "Unable to open mouth" "finding"))
    (clinical_finding (snomed_concept "Unable to swallow" "finding"))
    (clinical_finding (snomed_concept "Difficulty swallowing" "finding"))
    ;; Sudden face/tongue swelling and any of
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Wheezing" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    ;; Examine the mouth and throat for redness, white patches, blisters, ulcers or cracks
    (clinical_finding (snomed_concept "Sore throat" "finding"))
    (clinical_finding (snomed_concept "Enlarged tonsil" "finding"))
    (clinical_finding (snomed_concept "Exudate on tonsils" "finding"))
    (clinical_finding (snomed_concept "White patches on oral mucosa" "finding"))
    (clinical_finding (snomed_concept "Ulcer of mouth" "disorder") (qualifier (snomed_concept "Pain" "finding")))
    (clinical_finding (snomed_concept "Blister of skin AND/OR mucosa" "disorder") (finding_site (snomed_concept "Structure of mouth and/or pharynx" "body structure")) (qualifier (snomed_concept "Pain" "finding")))
    (clinical_finding (snomed_concept "Cracked lips" "finding"))
    (clinical_finding (snomed_concept "Xerostomia" "finding"))
    (clinical_finding (snomed_concept "Taste sense altered" "finding"))
    (clinical_finding (snomed_concept "Cough" "finding"))
    (clinical_finding (snomed_concept "Nasal discharge" "finding"))
  )
)

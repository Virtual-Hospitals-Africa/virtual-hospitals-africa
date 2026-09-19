;; Gum/teeth symptoms ⇢ 36
(finding_site_findings
  "Teeth & gums"
  (finding_site_structure (snomed_concept "Tooth, gum, and/or supporting structure" "body structure"))
  (clinical_findings
    (clinical_finding (snomed_concept "Toothache" "finding"))
    ;; Tooth pain felt without touching tooth/gum, or that wakes patient at night
    (clinical_finding (snomed_concept "Toothache" "finding") (qualifier (snomed_concept "Spontaneous" "qualifier value")))
    (clinical_finding (snomed_concept "Toothache" "finding") (qualifier (snomed_concept "Wakes up during night" "finding")))
    ;; Temperature and swelling of face/jaw/next to tooth
    (clinical_finding (snomed_concept "Fever" "finding"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling of lower jaw region" "finding"))
    (clinical_finding (snomed_concept "Unable to eat" "finding"))
    (clinical_finding (snomed_concept "Unable to drink" "finding"))
    ;; Look in mouth: lift lips to look at teeth and gums
    (clinical_finding (snomed_concept "Bleeding gums" "finding"))
    (clinical_finding (snomed_concept "Swollen gums" "finding"))
    (clinical_finding (snomed_concept "Gingival recession" "disorder"))
    (clinical_finding (snomed_concept "Mobile tooth" "finding"))
    (clinical_finding (snomed_concept "Tooth absent" "finding"))
    (clinical_finding (snomed_concept "Breath smells unpleasant" "finding"))
  )
)

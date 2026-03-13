;; Page 36 - Gum/Teeth Symptoms
(task
  "Check for urgent dental conditions"
  adult
  (or
    (clinical_finding (snomed_concept "Tooth symptoms" "finding")) ;; use finding site instead?
    (clinical_finding (finding_site (snomed_concept "Gingival structure" "body structure")))
  )
  (clinical_finding (finding_site (snomed_concept "Dental arch structure" "body structure")))
  (check_for
    (clinical_finding (snomed_concept "Facial swelling" "finding"))
    (clinical_finding (snomed_concept "Swelling of lower jaw region" "finding"))
    (clinical_finding (snomed_concept "Unable to eat" "finding"))
    (clinical_finding (snomed_concept "Unable to drink" "finding"))
    (clinical_finding (snomed_concept "Toothache" "finding") (qualifier (snomed_concept "Wakes up during night" "finding")))
    (clinical_finding (snomed_concept "Toothache" "finding") (qualifier (snomed_concept "Spontaneous" "qualifier value")))
  )
)

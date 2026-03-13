;; Page 32 - Face Symptoms
(task
  "Check for urgent ear symptom conditions"
  adult
  (clinical_finding (finding_site (snomed_concept "Ear structure" "body structure")))
  (check_for
    (clinical_finding (snomed_concept "Itching of ear" "finding"))
    (clinical_finding (snomed_concept "Ear discharge" "finding"))
    (clinical_finding (snomed_concept "Pain of ear" "finding"))
    (clinical_finding (snomed_concept "Hearing difficulty" "finding"))
    (clinical_finding (snomed_concept "Tinnitus" "finding"))
  )
)

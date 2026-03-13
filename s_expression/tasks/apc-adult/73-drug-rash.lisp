;; Page 73 - Drug Rash
(task
  "Check for urgent drug rash conditions"
  adult
  (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
  (check_for
    (clinical_finding (snomed_concept "Facial swelling" "finding"))
    (clinical_finding (snomed_concept "Tongue swelling" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Diarrhea" "finding"))
    (clinical_finding (snomed_concept "Perioral dermatitis" "disorder"))
    (clinical_finding (snomed_concept "Periocular dermatitis" "disorder"))
    (clinical_finding (snomed_concept "Rash of genitalia" "disorder"))
    (clinical_finding (snomed_concept "Blister" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Peeling of skin" "finding"))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
  )
)

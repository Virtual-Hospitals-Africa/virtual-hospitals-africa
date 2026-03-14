;; Page 67 - Skin Symptoms
;; Also covers pages 68 (Painful skin), 69 (Generalized itch rash),
;; 70 (Localized itchy rash), 71 (Itch with no rash), 72 (Generalized non-itchy rash)
(task
  "Check for urgent skin symptom conditions"
  adult
  (or
    (clinical_finding (finding_site (snomed_concept "Skin structure" "body structure")))
    (clinical_finding (snomed_concept "Eruption" "morphologic abnormality")))
  (check_for
    (clinical_finding (snomed_concept "Generalized pruritus" "finding"))
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
    (clinical_finding (snomed_concept "Facial swelling" "finding"))
    (clinical_finding (snomed_concept "Tongue swelling" "finding"))
    (clinical_finding (snomed_concept "Wheezing" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Substance" "substance"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding"))
    (<= (timestamp (clinical_finding (snomed_concept "Eruption caused by drug" "disorder")))
        (time_ago 3 months))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (clinical_finding (snomed_concept "Blister" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Diarrhea" "finding"))
    (clinical_finding (snomed_concept "Perioral dermatitis" "disorder"))
    (clinical_finding (snomed_concept "Periocular dermatitis" "disorder"))
    (clinical_finding (snomed_concept "Rash of genitalia" "disorder"))
    (clinical_finding (snomed_concept "Peeling of skin" "finding"))
  )
)

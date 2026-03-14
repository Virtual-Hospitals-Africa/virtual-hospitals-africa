;; Page 25 - Lump/Swelling in Neck, Axilla or Groin
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Groin mass" "finding"))
    (or
      (clinical_finding (snomed_concept "Strangulated inguinal hernia" "disorder"))
      (clinical_finding (snomed_concept "Irreducible inguinal hernia" "disorder"))
      (clinical_finding (snomed_concept "Aneurysm" "disorder") (qualifier (snomed_concept "Pulsatile" "qualifier value")))
      (clinical_finding (snomed_concept "Severe pain" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (clinical_finding (snomed_concept "Unable to break wind" "finding"))
    )
  )
)

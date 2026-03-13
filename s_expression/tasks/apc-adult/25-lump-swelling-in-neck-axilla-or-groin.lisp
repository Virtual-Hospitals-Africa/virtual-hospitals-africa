;; Page 25 - Lump/Swelling in Neck, Axilla or Groin
(task
  "Check for urgent groin lump conditions"
  adult
  (clinical_finding (snomed_concept "Groin mass" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Severe pain" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (<= (timestamp (clinical_finding (snomed_concept "Unable to break wind" "finding")))
        (time_ago 24 hours))
    (<= (timestamp (clinical_finding (snomed_concept "Acute constipation" "finding")))
        (time_ago 24 hours))
    (clinical_finding (snomed_concept "Irreducible hernia" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))
  )
)

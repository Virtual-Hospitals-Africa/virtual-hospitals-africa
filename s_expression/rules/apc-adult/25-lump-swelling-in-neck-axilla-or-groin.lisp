;; Page 25 - Lump/Swelling in Neck, Axilla or Groin
(task
  "Check for urgent groin lump conditions"
  adult
  (clinical_finding (snomed_concept "Groin mass" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Severe pain" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (<= (onset (clinical_finding (snomed_concept "Unable to break wind" "finding")))
        (time_ago 24 hours))
    (<= (onset (clinical_finding (snomed_concept "Acute constipation" "finding")))
        (time_ago 24 hours))
    (clinical_finding (snomed_concept "Irreducible hernia" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))
    (clinical_finding (snomed_concept "Groin mass" "finding") (qualifier (snomed_concept "Pulsatile" "qualifier value")))
    (clinical_finding (snomed_concept "Strangulated inguinal hernia" "disorder"))
    (clinical_finding (snomed_concept "Irreducible inguinal hernia" "disorder"))
    (clinical_finding (snomed_concept "Aneurysm" "disorder") (qualifier (snomed_concept "Pulsatile" "qualifier value")))
  )
)
;; Page 25 - Strangulated inguinal hernia likely with groin mass + bowel obstruction signs
(system_diagnosis_rule
  "Diagnose probable strangulated inguinal hernia"
  (diagnosis
    (snomed_concept "Strangulated inguinal hernia" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Groin mass" "finding"))
    (or
      (clinical_finding (snomed_concept "Severe pain" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (clinical_finding (snomed_concept "Unable to break wind" "finding"))
    )
  )
)
;; Page 25 - Aneurysm likely with pulsatile groin mass
(system_diagnosis_rule
  "Diagnose possible aneurysm"
  (diagnosis
    (snomed_concept "Aneurysm" "disorder")
    possible
  )
  adult
  (clinical_finding (snomed_concept "Groin mass" "finding") (qualifier (snomed_concept "Pulsatile" "qualifier value")))
)
;; Page 25 - Lump/Swelling in Neck, Axilla or Groin
(system_priority_evaluation
  "Urgent: groin mass with obstruction or vascular signs"
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

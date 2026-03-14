;; Page 25 - Strangulated inguinal hernia likely with groin mass + bowel obstruction signs
(system_diagnosis_rule
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
  (diagnosis
    (snomed_concept "Aneurysm" "disorder")
    possible
  )
  adult
  (clinical_finding (snomed_concept "Groin mass" "finding") (qualifier (snomed_concept "Pulsatile" "qualifier value")))
)

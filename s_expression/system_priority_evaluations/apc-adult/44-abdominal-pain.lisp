;; Page 44 - Abdominal Pain: Urgent for danger signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (or
      (clinical_finding (snomed_concept "Unable to void urine" "finding"))
      (clinical_finding (snomed_concept "Jaundice" "finding"))
      (clinical_finding (snomed_concept "Abdominal mass" "finding"))
      (clinical_finding (snomed_concept "Mass of pelvic structure" "finding"))
      (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))
      (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
      (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
      (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
      (clinical_finding (snomed_concept "Unable to break wind" "finding"))
      (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)
    )
  )
)

;; Page 32 - Face: Facial cellulitis likely with painful swelling and fever
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Cellulitis of face" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Facial swelling" "finding"))
    (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
  )
)
;; Page 32 - Face: Kidney disease likely with facial swelling and blood/protein in urine
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Kidney disease" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Facial swelling" "finding"))
    (or
      (clinical_finding (snomed_concept "Blood in urine" "finding"))
      (clinical_finding (snomed_concept "Proteinuria" "finding"))
    )
  )
)

;; Page 37 - Chest Pain: Ischaemic heart disease likely with radiating pain or pallor/sweating
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Ischemic heart disease" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (or
      (clinical_finding (snomed_concept "Radiating chest pain" "finding"))
      (clinical_finding (snomed_concept "Pain radiating to jaw" "finding"))
      (clinical_finding (snomed_concept "Pain radiating to neck" "finding"))
      (clinical_finding (snomed_concept "Pain radiating to left arm" "finding"))
      (clinical_finding (snomed_concept "Pain radiating to right arm" "finding"))
      (clinical_finding (snomed_concept "Pallor of skin of face" "finding"))
      (clinical_finding (snomed_concept "Sweating" "finding"))
    )
  )
)

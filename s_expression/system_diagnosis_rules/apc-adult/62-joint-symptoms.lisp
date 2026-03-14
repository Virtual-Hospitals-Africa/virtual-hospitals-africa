;; Page 62 - Joint Symptoms: Infective arthritis likely with warm swollen painful joint
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Infective arthritis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Pain of joint" "finding"))
    (clinical_finding (snomed_concept "Joint warm" "finding"))
    (clinical_finding (snomed_concept "Joint swelling" "finding"))
  )
)

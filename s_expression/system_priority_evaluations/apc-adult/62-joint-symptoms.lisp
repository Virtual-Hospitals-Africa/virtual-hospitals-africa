;; Page 62 - Joint Symptoms: Urgent for septic arthritis, fracture and fever signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Pain of joint" "finding"))
    (or
      (and
        (clinical_finding (snomed_concept "Joint warm" "finding"))
        (clinical_finding (snomed_concept "Joint swelling" "finding"))
      )
      (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
    )
  )
)

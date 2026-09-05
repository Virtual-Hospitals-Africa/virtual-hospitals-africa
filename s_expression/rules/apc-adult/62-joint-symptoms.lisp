;; Page 62 - Joint Symptoms
(task
  "Check for urgent joint conditions"
  adult
  (clinical_finding (finding_site (snomed_concept "Joint structure" "body structure")))
  (check_for
    (clinical_finding (snomed_concept "Pain of joint" "finding") (qualifier (snomed_concept "Acute pain" "finding")))
    (clinical_finding (snomed_concept "Joint warm" "finding"))
    (clinical_finding (snomed_concept "Injury of musculoskeletal system" "disorder"))
    (clinical_finding (snomed_concept "Limitation of joint movement" "finding"))
    (clinical_finding (snomed_concept "Severe pain" "finding"))
    (clinical_finding (snomed_concept "Joint swelling" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Deformity" "finding"))
    (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))
    (clinical_finding (snomed_concept "Pain of joint" "finding"))
    (clinical_finding (snomed_concept "Joint swelling" "finding"))
  )
)
;; Page 62 - Joint Symptoms: Infective arthritis likely with warm swollen painful joint
(system_diagnosis_rule
  "Diagnose probable infective arthritis"
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
;; Page 62 - Joint Symptoms: Urgent for septic arthritis, fracture and fever signs
(system_priority_evaluation
  "Urgent: joint pain with septic, traumatic or systemic signs"
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

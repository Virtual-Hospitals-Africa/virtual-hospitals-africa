;; Page 62 - Joint Symptoms
(task
  "Check for urgent joint conditions"
  adult
  (clinical_finding (finding_site (snomed_concept "Joint structure" "body structure")))
  (check_for
    (clinical_finding (snomed_concept "Pain of joint" "finding") (qualifier (snomed_concept "Acute (qualifier value)" "qualifier value")))
    (clinical_finding (snomed_concept "Joint swelling" "finding"))
    (clinical_finding (snomed_concept "Joint warm" "finding"))
    (<= (timestamp (clinical_finding (snomed_concept "Injury of musculoskeletal system" "disorder")))
        (time_ago 48 hours))
    (clinical_finding (snomed_concept "Limitation of joint movement" "finding"))
    (clinical_finding (snomed_concept "Severe pain" "finding"))
    (clinical_finding (snomed_concept "Joint swelling" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Deformity" "finding"))
    (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))
  )
)

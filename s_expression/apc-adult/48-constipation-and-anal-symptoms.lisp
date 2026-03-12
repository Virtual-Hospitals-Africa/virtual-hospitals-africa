;; Page 48 - Constipation Symptoms
(task
  "Check for urgent constipation conditions"
  adult
  (clinical_finding (snomed_concept "Acute constipation" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
    (<= (timestamp (clinical_finding (snomed_concept "Constipation" "finding")))
        (time_ago 24 hours))
    (<= (timestamp (clinical_finding (snomed_concept "Unable to break wind" "finding")))
        (time_ago 24 hours))
  )
)

;; Page 48 - Anal Symptoms
(task
  "Check for urgent anal conditions"
  adult
  (clinical_finding (snomed_concept "Anal pain" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Anal pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Anal polyp" "disorder"))
    (clinical_finding (snomed_concept "Difficulty in ability to defecate" "finding"))
  )
)

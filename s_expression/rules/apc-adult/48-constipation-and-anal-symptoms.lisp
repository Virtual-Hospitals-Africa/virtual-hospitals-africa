;; Page 48 - Constipation Symptoms
(task
  "Check for urgent constipation conditions"
  adult
  (clinical_finding (snomed_concept "Constipation" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
    (>= (onset (clinical_finding (snomed_concept "Constipation" "finding")))
        (time_ago 24 hours))
    (>= (onset (clinical_finding (snomed_concept "Unable to break wind" "finding")))
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
    (clinical_finding (snomed_concept "Perianal lump" "finding"))
  )
)
;; Page 48 - Constipation: Urgent for bowel obstruction signs
(system_priority_evaluation
  "Urgent: constipation lasting over 24 hours with abdominal pain"
  adult
  Urgent
  (and
    (or
      (>= (onset (active_condition (snomed_concept "Constipation" "finding")))
          (time_ago 24 hours))
      (>= (onset (active_condition (snomed_concept "Unable to break wind" "finding")))
          (time_ago 24 hours))
    )
    (or
      (active_condition (snomed_concept "Abdominal pain" "finding"))
      (active_condition (snomed_concept "Distension of abdomen" "finding"))
    )
  )
)
;; Page 48 - Anal Symptoms: Urgent for painful lump or unable to pass stool
(system_priority_evaluation
  "Urgent: anal pain with lump or difficulty defecating"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Anal pain" "finding"))
    (or
      (clinical_finding (snomed_concept "Perianal lump" "finding"))
      (clinical_finding (snomed_concept "Difficulty in ability to defecate" "finding"))
    )
  )
)

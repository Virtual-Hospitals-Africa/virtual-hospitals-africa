;; Page 61 - Anal symptoms
(task
  "Check for urgent anal symptom conditions"
  adult
  (clinical_finding (snomed_concept "Anal finding" "finding"))
  (check_for
    ;; Red box: extremely painful lump on anus
    (clinical_finding (snomed_concept "Perianal lump" "finding"))
    (clinical_finding (snomed_concept "Anal pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    ;; Red box: unable to pass stool because of anal symptoms
    (clinical_finding (snomed_concept "Does not defecate" "finding"))

    ;; Approach: painless bleeding, passing mucus or tenesmus -> treat for sexually transmitted proctitis
    (clinical_finding (snomed_concept "Painless rectal bleeding" "finding"))
    (clinical_finding (snomed_concept "Mucus in stool" "finding"))
    (clinical_finding (snomed_concept "Tenesmus of anus and/or rectum" "finding"))

    ;; Suspected worms -> thin white worm with anal itch worse at night -> pinworm likely
    (clinical_finding (snomed_concept "Worms in stool" "finding"))
    (clinical_finding (snomed_concept "Pruritus ani" "disorder") (qualifier (snomed_concept "Night time" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose probable sexually transmitted proctitis from anal symptoms"
  (diagnosis
    (snomed_concept "Infective proctitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Anal finding" "finding"))
    (or (clinical_finding (snomed_concept "Painless rectal bleeding" "finding"))
        (clinical_finding (snomed_concept "Mucus in stool" "finding"))
        (clinical_finding (snomed_concept "Tenesmus of anus and/or rectum" "finding"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable pinworm from anal itch at night"
  (diagnosis
    (snomed_concept "Enterobiasis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Worms in stool" "finding"))
    (clinical_finding (snomed_concept "Pruritus ani" "disorder") (qualifier (snomed_concept "Night time" "qualifier value")))
  )
)
(system_priority_evaluation
  "Urgent: anal symptoms with painful lump or unable to pass stool"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Anal finding" "finding"))
    (or
      (and (clinical_finding (snomed_concept "Perianal lump" "finding"))
           (clinical_finding (snomed_concept "Anal pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value"))))
      (clinical_finding (snomed_concept "Does not defecate" "finding"))
    )
  )
)

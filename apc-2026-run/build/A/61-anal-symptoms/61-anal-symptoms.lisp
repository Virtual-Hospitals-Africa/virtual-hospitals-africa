;; Page 61 - Anal symptoms
(task
  "Check for urgent anal symptoms and their causes"
  adult
  (clinical_finding (snomed_concept "Anal finding" "finding"))
  (check_for
    ;; Red box
    (clinical_finding (snomed_concept "Perianal lump" "finding"))
    (clinical_finding (snomed_concept "Anal pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Does not defecate" "finding"))

    ;; Sexually transmitted proctitis
    (clinical_finding (snomed_concept "Painless rectal bleeding" "finding"))
    (clinical_finding (snomed_concept "Mucus in stool" "finding"))
    (clinical_finding (snomed_concept "Tenesmus of anus and/or rectum" "finding"))

    ;; Worms
    (clinical_finding (snomed_concept "Worms in stool" "finding"))
    (clinical_finding (snomed_concept "Pruritus ani" "disorder") (qualifier (snomed_concept "Night time" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose probable sexually transmitted proctitis (anal symptoms)"
  (diagnosis
    (snomed_concept "Infective proctitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Anal finding" "finding"))
    (or
      (clinical_finding (snomed_concept "Painless rectal bleeding" "finding"))
      (clinical_finding (snomed_concept "Mucus in stool" "finding"))
      (clinical_finding (snomed_concept "Tenesmus of anus and/or rectum" "finding"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable pinworm (anal symptoms)"
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
  "Urgent: anal symptoms with very painful lump or unable to pass stool"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Anal finding" "finding"))
    (or
      (and
        (clinical_finding (snomed_concept "Perianal lump" "finding"))
        (clinical_finding (snomed_concept "Anal pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      )
      (clinical_finding (snomed_concept "Does not defecate" "finding"))
    )
  )
)

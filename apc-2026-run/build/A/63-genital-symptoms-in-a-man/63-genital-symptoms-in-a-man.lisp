;; Page 63 - Genital symptoms in a man
(task
  "Check for urgent genital conditions in a man"
  adult
  (clinical_finding (snomed_concept "Male genitalia finding" "finding"))
  (check_for
    ;; Torsion of testicle
    (clinical_finding (snomed_concept "Swelling of scrotum" "finding"))
    (clinical_finding (snomed_concept "Pain in scrotum" "finding"))
    (clinical_finding (snomed_concept "Pain in scrotum" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Injury of scrotum" "disorder"))
    (clinical_finding (snomed_concept "Injury of testis" "disorder"))

    ;; Paraphimosis
    (clinical_finding (snomed_concept "Fixed, retracted foreskin" "finding"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Glans penis structure" "body structure")))
    (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Glans penis structure" "body structure")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))

    ;; Priapism
    (clinical_finding (snomed_concept "Prolonged erection of penis" "finding"))

    ;; Approach to the man not needing urgent attention
    (clinical_finding (snomed_concept "Urethral discharge" "finding"))
    (clinical_finding (snomed_concept "Mass of testicle" "finding") (qualifier (snomed_concept "Painless" "qualifier value")))
    (clinical_finding (snomed_concept "Mass of scrotum" "finding") (qualifier (snomed_concept "Painless" "qualifier value")))
    (clinical_finding (snomed_concept "Inflammatory morphology" "morphologic abnormality") (finding_site (snomed_concept "Glans penis structure" "body structure")))
  )
)
(system_diagnosis_rule
  "Diagnose probable torsion of testis from genital symptoms"
  (diagnosis
    (snomed_concept "Torsion of testis" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Swelling of scrotum" "finding"))
        (clinical_finding (snomed_concept "Pain in scrotum" "finding"))
    )
    (or (clinical_finding (snomed_concept "Pain in scrotum" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
        (clinical_finding (snomed_concept "Injury of scrotum" "disorder"))
        (clinical_finding (snomed_concept "Injury of testis" "disorder"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable paraphimosis from genital symptoms"
  (diagnosis
    (snomed_concept "Paraphimosis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Fixed, retracted foreskin" "finding"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Glans penis structure" "body structure")))
    (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Glans penis structure" "body structure")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose probable priapism from genital symptoms"
  (diagnosis
    (snomed_concept "Priapism" "disorder")
    probable
  )
  adult
  ;; Page: "Prolonged erection > 4 hours". Written >= because the database rejects > in onset comparisons.
  (>= (onset (clinical_finding (snomed_concept "Prolonged erection of penis" "finding"))) (time_ago 4 hours))
)
(system_diagnosis_rule
  "Diagnose probable male urethritis syndrome from urethral discharge"
  (diagnosis
    (snomed_concept "Urethritis" "disorder")
    probable
  )
  adult
  (clinical_finding (snomed_concept "Urethral discharge" "finding"))
)
(system_diagnosis_rule
  "Diagnose possible testicular cancer from painless scrotal lump"
  (diagnosis
    (snomed_concept "Malignant neoplasm of testis" "disorder")
    possible
  )
  adult
  (or (clinical_finding (snomed_concept "Mass of testicle" "finding") (qualifier (snomed_concept "Painless" "qualifier value")))
      (clinical_finding (snomed_concept "Mass of scrotum" "finding") (qualifier (snomed_concept "Painless" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose probable balanitis/balanoposthitis from inflamed glans"
  (diagnosis
    (snomed_concept "Balanitis" "disorder")
    probable
  )
  adult
  (clinical_finding (snomed_concept "Inflammatory morphology" "morphologic abnormality") (finding_site (snomed_concept "Glans penis structure" "body structure")))
)
(system_priority_evaluation
  "Urgent: genital symptoms in a man with torsion, paraphimosis or priapism"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Male genitalia finding" "finding"))
    (or (active_condition (snomed_concept "Torsion of testis" "disorder"))
        (active_condition (snomed_concept "Paraphimosis" "disorder"))
        (active_condition (snomed_concept "Priapism" "disorder"))
    )
  )
)

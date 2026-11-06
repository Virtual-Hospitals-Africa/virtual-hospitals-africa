;; Page 63 - Genital symptoms in a man
(task
  "Check for urgent genital symptoms in a man"
  adult
  (or (clinical_finding (snomed_concept "Male genitalia finding" "finding"))
      (clinical_finding (snomed_concept "Urethral discharge" "finding")))
  (check_for
    ;; Torsion of testicle
    (clinical_finding (snomed_concept "Swelling of scrotum" "finding"))
    (clinical_finding (snomed_concept "Pain in scrotum" "finding"))
    (clinical_finding (snomed_concept "Pain in scrotum" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Testicle out of place" "finding"))
    (clinical_finding (snomed_concept "Testes - transverse lie" "finding"))
    (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
    (clinical_finding (snomed_concept "Overexertion and strenuous movements" "event"))

    ;; Paraphimosis
    (clinical_finding (snomed_concept "Fixed, retracted foreskin" "finding"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Glans penis structure" "body structure")))
    (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Glans penis structure" "body structure")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))

    ;; Priapism
    (clinical_finding (snomed_concept "Prolonged erection of penis" "finding"))

    ;; Approach: painless lump, inflamed glans
    (clinical_finding (snomed_concept "Mass of scrotum" "finding") (qualifier (snomed_concept "Painless" "qualifier value")))
    (clinical_finding (snomed_concept "Mass of testicle" "finding") (qualifier (snomed_concept "Painless" "qualifier value")))
    (clinical_finding (snomed_concept "Inflammatory morphology" "morphologic abnormality") (finding_site (snomed_concept "Glans penis structure" "body structure")))
  )
)
(system_diagnosis_rule
  "Diagnose probable torsion of testis (genital symptoms in a man)"
  (diagnosis
    (snomed_concept "Torsion of testis" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Swelling of scrotum" "finding"))
        (clinical_finding (snomed_concept "Pain in scrotum" "finding")))
    (or (clinical_finding (snomed_concept "Pain in scrotum" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
        (clinical_finding (snomed_concept "Testicle out of place" "finding"))
        (clinical_finding (snomed_concept "Testes - transverse lie" "finding"))
        (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
        (clinical_finding (snomed_concept "Overexertion and strenuous movements" "event")))
  )
)
(system_diagnosis_rule
  "Diagnose probable paraphimosis (genital symptoms in a man)"
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
  "Diagnose probable priapism (genital symptoms in a man)"
  (diagnosis
    (snomed_concept "Priapism" "disorder")
    probable
  )
  adult
  (>= (onset (clinical_finding (snomed_concept "Prolonged erection of penis" "finding"))) (time_ago 4 hours))
)
(system_diagnosis_rule
  "Diagnose probable male urethritis syndrome (genital symptoms in a man)"
  (diagnosis
    (snomed_concept "Urethritis" "disorder")
    probable
  )
  adult
  (clinical_finding (snomed_concept "Urethral discharge" "finding"))
)
(system_diagnosis_rule
  "Diagnose probable balanitis/balanoposthitis (genital symptoms in a man)"
  (diagnosis
    (snomed_concept "Balanitis" "disorder")
    probable
  )
  adult
  (clinical_finding (snomed_concept "Inflammatory morphology" "morphologic abnormality") (finding_site (snomed_concept "Glans penis structure" "body structure")))
)
(system_diagnosis_rule
  "Diagnose possible testicular cancer (painless scrotal lump)"
  (diagnosis
    (snomed_concept "Malignant neoplasm of testis" "disorder")
    possible
  )
  adult
  (or (clinical_finding (snomed_concept "Mass of scrotum" "finding") (qualifier (snomed_concept "Painless" "qualifier value")))
      (clinical_finding (snomed_concept "Mass of testicle" "finding") (qualifier (snomed_concept "Painless" "qualifier value"))))
)
(system_priority_evaluation
  "Urgent: genital symptoms in a man with torsion, paraphimosis or priapism"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Male genitalia finding" "finding"))
        (clinical_finding (snomed_concept "Urethral discharge" "finding")))
    (or (active_condition (snomed_concept "Torsion of testis" "disorder"))
        (active_condition (snomed_concept "Paraphimosis" "disorder"))
        (active_condition (snomed_concept "Priapism" "disorder")))
  )
)

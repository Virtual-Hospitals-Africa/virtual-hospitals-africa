;; Page 50 - Genital Symptoms in Man
(task
  "Check for urgent genital symptoms in a man"
  adult
  (or
    (clinical_finding (finding_site (snomed_concept "Scrotal structure" "body structure")))
    (clinical_finding (snomed_concept "Male genitalia finding" "finding"))
  )
  (check_for
    (clinical_finding (snomed_concept "Acute pain of scrotum" "finding"))
    (clinical_finding (snomed_concept "Pain in scrotum" "finding"))
    (clinical_finding (snomed_concept "Swelling of scrotum" "finding"))
    (clinical_finding (snomed_concept "Severe pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Retractile testis" "disorder"))
    (clinical_finding (snomed_concept "Torsion of testis" "disorder"))
    (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
    (clinical_finding (snomed_concept "Pain in penis" "finding"))
    (clinical_finding (snomed_concept "Penile swelling" "disorder"))
    (clinical_finding (snomed_concept "Tightly retracted foreskin" "finding"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Glans penis structure" "body structure")))
    (clinical_finding (snomed_concept "Severe pain" "finding") (finding_site (snomed_concept "Glans penis structure" "body structure")))
    (<= (onset (clinical_finding (snomed_concept "Priapism" "disorder")))
        (time_ago 4 hours))
  )
)
;; Page 50 - Genital symptoms (man): testicular torsion likely with sudden severe scrotal pain and swelling
(system_diagnosis_rule
  "Diagnose probable torsion of testis"
  (diagnosis
    (snomed_concept "Torsion of testis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Acute pain of scrotum" "finding"))
    (clinical_finding (snomed_concept "Swelling of scrotum" "finding"))
  )
)
;; Page 50 - Genital symptoms (man): paraphimosis likely with penile pain and swelling
(system_diagnosis_rule
  "Diagnose probable paraphimosis"
  (diagnosis
    (snomed_concept "Paraphimosis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Pain in penis" "finding"))
    (clinical_finding (snomed_concept "Penile swelling" "disorder"))
  )
)

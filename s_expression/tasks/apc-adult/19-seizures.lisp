;; Page 50 - Genital Symptoms in Man
(task
  "Check patient was indeed fitting"
  adult
  (clinical_finding (snomed_concept "Post-ictal state" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Pain in scrotum" "finding"))
    (clinical_finding (snomed_concept "Swelling of scrotum" "finding"))
    (clinical_finding (snomed_concept "Severe pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Retractile testis" "disorder"))
    (clinical_finding (snomed_concept "Torsion of testis" "disorder"))
    (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
    (clinical_finding (snomed_concept "Tightly retracted foreskin" "finding"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Glans penis structure" "body structure")))
    (clinical_finding (snomed_concept "Severe pain" "finding") (finding_site (snomed_concept "Glans penis structure" "body structure")))
    (<= (timestamp (clinical_finding (snomed_concept "Priapism" "disorder")))
        (time_ago 4 hours))
  )
)

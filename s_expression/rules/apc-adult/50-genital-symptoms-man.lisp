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
    (clinical_finding (snomed_concept "Priapism" "disorder"))
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
    (or
      (clinical_finding (snomed_concept "Swelling of scrotum" "finding"))
      (clinical_finding (snomed_concept "Acute pain of scrotum" "finding"))
    )
    (or
    ;; sudden severe pain, affected testicle higher/rotated, preceding trauma/strenous activity
      ()
    )
    (clinical_finding (snomed_concept "Finding of size of testicle" "finding") (qualifier (snomed_concept "Asymmetry" "qualifier")))
  )
)
(system_priority_evaluation
  "Urgent: Torsion of testis"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (or
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      (clinical_finding (snomed_concept "Electrical burn" "disorder"))
      (clinical_finding (snomed_concept "Chemical burn" "disorder"))
      (clinical_finding (snomed_concept "Full thickness burn" "disorder"))
      (clinical_finding (snomed_concept "Partial thickness burn" "disorder") (qualifier (snomed_concept "Extensive" "qualifier value")))
      (clinical_finding (snomed_concept "Smoke inhalation injury" "disorder"))
      (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Chest structure" "body structure")) (qualifier (snomed_concept "Circumferential" "qualifier value")))
      (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Limb structure" "body structure")) (qualifier (snomed_concept "Circumferential" "qualifier value")))
      (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Face structure" "body structure")))
      (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Hand structure" "body structure")))
      (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Foot structure" "body structure")))
      (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Genital structure" "body structure")))
      (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Joint structure" "body structure")))
      (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %) 94)
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
    )
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

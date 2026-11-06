;; Page 64 - Abnormal vaginal discharge
(task
  "Check for abnormal vaginal discharge findings"
  adult
  (clinical_finding (snomed_concept "Vaginal discharge" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Delivery finding" "finding") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Miscarriage" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Missed period" "finding"))
    (clinical_finding (snomed_concept "Abnormal vaginal bleeding" "finding"))

    (clinical_finding (snomed_concept "Abdominal mass" "finding"))
    (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
    (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
    (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
    (clinical_finding (snomed_concept "Shock" "disorder"))

    (clinical_finding (snomed_concept "Sexually active" "finding"))
    (clinical_finding (snomed_concept "Lower abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Pain on movement of cervix" "finding"))

    (clinical_finding (snomed_concept "Itching" "finding") (finding_site (snomed_concept "Vaginal structure" "body structure")))
    (clinical_finding (snomed_concept "Erythema of vulva" "disorder"))
    (clinical_finding (snomed_concept "Scratch marks" "finding") (finding_site (snomed_concept "Vulval structure" "body structure")))
    (clinical_finding (snomed_concept "Inflammation of vulva" "disorder"))

    (clinical_finding (snomed_concept "Erythema" "finding") (finding_site (snomed_concept "Cervix uteri structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Cervix uteri structure" "body structure")))
    (clinical_finding (snomed_concept "Cervical discharge" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable LAP syndrome (vaginal discharge)"
  (diagnosis
    (snomed_concept "Female pelvic inflammatory disease" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Vaginal discharge" "finding"))
    (clinical_finding (snomed_concept "Pain on movement of cervix" "finding"))
    (or
      ;; Sexually active → lower abdominal pain or pain on moving cervix → pain on moving cervix = Yes
      (clinical_finding (snomed_concept "Sexually active" "finding"))
      ;; Not sexually active → no curd-like/vulval signs → BV → speculum: pain on moving cervix = Yes
      (and (no (clinical_finding (snomed_concept "Sexually active" "finding")))
           (no (clinical_finding (snomed_concept "Erythema of vulva" "disorder")))
           (no (clinical_finding (snomed_concept "Scratch marks" "finding") (finding_site (snomed_concept "Vulval structure" "body structure"))))
           (no (clinical_finding (snomed_concept "Inflammation of vulva" "disorder"))))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable cervicitis (vaginal discharge)"
  (diagnosis
    (snomed_concept "Inflammation of cervix" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Vaginal discharge" "finding"))
    (or
      ;; Sexually active, no to both lower abdominal pain and pain on moving cervix
      (and (clinical_finding (snomed_concept "Sexually active" "finding"))
           (no (clinical_finding (snomed_concept "Lower abdominal pain" "finding")))
           (no (clinical_finding (snomed_concept "Pain on movement of cervix" "finding"))))
      ;; Not sexually active → BV path → no pain on moving cervix → cervical redness/swelling/discharge
      (and (no (clinical_finding (snomed_concept "Sexually active" "finding")))
           (no (clinical_finding (snomed_concept "Erythema of vulva" "disorder")))
           (no (clinical_finding (snomed_concept "Scratch marks" "finding") (finding_site (snomed_concept "Vulval structure" "body structure"))))
           (no (clinical_finding (snomed_concept "Inflammation of vulva" "disorder")))
           (no (clinical_finding (snomed_concept "Pain on movement of cervix" "finding")))
           (or (clinical_finding (snomed_concept "Erythema" "finding") (finding_site (snomed_concept "Cervix uteri structure" "body structure")))
               (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Cervix uteri structure" "body structure")))
               (clinical_finding (snomed_concept "Cervical discharge" "finding"))))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable bacterial vaginosis (vaginal discharge)"
  (diagnosis
    (snomed_concept "Bacterial vaginosis" "disorder")
    probable
  )
  adult
  ;; Not sexually active, discharge not curd-like and vulva not red, scratched or inflamed
  (and
    (clinical_finding (snomed_concept "Vaginal discharge" "finding"))
    (no (clinical_finding (snomed_concept "Sexually active" "finding")))
    (no (clinical_finding (snomed_concept "Erythema of vulva" "disorder")))
    (no (clinical_finding (snomed_concept "Scratch marks" "finding") (finding_site (snomed_concept "Vulval structure" "body structure"))))
    (no (clinical_finding (snomed_concept "Inflammation of vulva" "disorder")))
  )
)
(system_diagnosis_rule
  "Diagnose probable vaginal candidiasis (vaginal discharge)"
  (diagnosis
    (snomed_concept "Candidiasis of vagina" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Vaginal discharge" "finding"))
    (or
      ;; Not sexually active: curd-like (no SNOMED concept) or vulva red, scratched or inflamed
      (and (no (clinical_finding (snomed_concept "Sexually active" "finding")))
           (or (clinical_finding (snomed_concept "Erythema of vulva" "disorder"))
               (clinical_finding (snomed_concept "Scratch marks" "finding") (finding_site (snomed_concept "Vulval structure" "body structure")))
               (clinical_finding (snomed_concept "Inflammation of vulva" "disorder"))))
      ;; Sexually active, no to both → cervicitis, plus itchy/curd-like discharge or vulva red, scratched or inflamed
      (and (clinical_finding (snomed_concept "Sexually active" "finding"))
           (no (clinical_finding (snomed_concept "Lower abdominal pain" "finding")))
           (no (clinical_finding (snomed_concept "Pain on movement of cervix" "finding")))
           (or (clinical_finding (snomed_concept "Itching" "finding") (finding_site (snomed_concept "Vaginal structure" "body structure")))
               (clinical_finding (snomed_concept "Erythema of vulva" "disorder"))
               (clinical_finding (snomed_concept "Scratch marks" "finding") (finding_site (snomed_concept "Vulval structure" "body structure")))
               (clinical_finding (snomed_concept "Inflammation of vulva" "disorder"))))
    )
  )
)
(system_diagnosis_rule
  "Diagnose possible UTI (vaginal discharge, lower abdominal pain)"
  (diagnosis
    (snomed_concept "Urinary tract infectious disease" "disorder")
    possible
  )
  adult
  ;; Sexually active, lower abdominal pain, no pain on moving cervix → Assess for UTI → 69
  (and
    (clinical_finding (snomed_concept "Vaginal discharge" "finding"))
    (clinical_finding (snomed_concept "Sexually active" "finding"))
    (clinical_finding (snomed_concept "Lower abdominal pain" "finding"))
    (no (clinical_finding (snomed_concept "Pain on movement of cervix" "finding")))
  )
)
(system_priority_evaluation
  "Urgent: vaginal discharge with danger signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Vaginal discharge" "finding"))
    (or
      (clinical_finding (snomed_concept "Delivery finding" "finding") (qualifier (snomed_concept "Recent" "qualifier value")))
      (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
      (clinical_finding (snomed_concept "Miscarriage" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
      (clinical_finding (snomed_concept "Pregnancy" "finding"))
      (clinical_finding (snomed_concept "Missed period" "finding"))
      (clinical_finding (snomed_concept "Abnormal vaginal bleeding" "finding"))
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (> (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
      (clinical_finding (snomed_concept "Shock" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
      (clinical_finding (snomed_concept "Abdominal mass" "finding"))
      (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
      (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
      (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
    )
  )
)

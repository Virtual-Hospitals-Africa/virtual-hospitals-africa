;; Page 64 - Abnormal vaginal discharge
(task
  "Check for abnormal vaginal discharge danger signs and syndromic findings"
  adult
  (clinical_finding (snomed_concept "Vaginal discharge" "finding"))
  (check_for
    ;; Red box: pregnancy-related
    (clinical_finding (snomed_concept "Postpartum state" "finding"))
    (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Miscarriage" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Missed period" "finding"))
    (clinical_finding (snomed_concept "Menstrual period late" "finding"))
    (clinical_finding (snomed_concept "Abnormal vaginal bleeding" "finding"))

    ;; Red box: shock, abdominal mass, peritonitis
    (clinical_finding (snomed_concept "Shock" "disorder"))
    (clinical_finding (snomed_concept "Abdominal mass" "finding"))
    (clinical_finding (snomed_concept "Peritonitis" "disorder"))
    (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
    (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
    (clinical_finding (snomed_concept "Rebound tenderness" "finding"))

    ;; Approach: history and syndromic questions
    (clinical_finding (snomed_concept "Sexually active" "finding"))
    (clinical_finding (snomed_concept "Lower abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Cervical excitation present" "finding"))
    (clinical_finding (snomed_concept "Pruritus of vagina" "disorder"))

    ;; Approach: vulva red, scratched or inflamed
    (clinical_finding (snomed_concept "Erythema of vulva" "disorder"))
    (clinical_finding (snomed_concept "Scratch marks" "finding") (finding_site (snomed_concept "Vulval structure" "body structure")))
    (clinical_finding (snomed_concept "Inflammation of vulva" "disorder"))

    ;; Approach: speculum examination - cervical redness/swelling/discharge
    (clinical_finding (snomed_concept "Erythema" "finding") (finding_site (snomed_concept "Cervix uteri structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Cervix uteri structure" "body structure")))
    (clinical_finding (snomed_concept "Cervical discharge" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable cervicitis (vaginal discharge approach)"
  (diagnosis
    (snomed_concept "Inflammation of cervix" "disorder")
    probable
  )
  adult
  (or
    ;; Sexually active: no lower abdominal pain and no pain on moving the cervix
    (and
      (clinical_finding (snomed_concept "Sexually active" "finding"))
      (no (clinical_finding (snomed_concept "Lower abdominal pain" "finding")))
      (no (clinical_finding (snomed_concept "Cervical excitation present" "finding")))
    )
    ;; Not sexually active, no vulval signs (BV path), no pain on moving the cervix, cervical redness/swelling/discharge
    (and
      (no (clinical_finding (snomed_concept "Sexually active" "finding")))
      (no (clinical_finding (snomed_concept "Erythema of vulva" "disorder")))
      (no (clinical_finding (snomed_concept "Scratch marks" "finding") (finding_site (snomed_concept "Vulval structure" "body structure"))))
      (no (clinical_finding (snomed_concept "Inflammation of vulva" "disorder")))
      (no (clinical_finding (snomed_concept "Cervical excitation present" "finding")))
      (or
        (clinical_finding (snomed_concept "Erythema" "finding") (finding_site (snomed_concept "Cervix uteri structure" "body structure")))
        (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Cervix uteri structure" "body structure")))
        (clinical_finding (snomed_concept "Cervical discharge" "finding"))
      )
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable vaginal candidiasis (vaginal discharge approach)"
  (diagnosis
    (snomed_concept "Candidiasis of vagina" "disorder")
    probable
  )
  adult
  (or
    ;; Sexually active, no to both, and discharge itchy or vulva red/scratched/inflamed (curd-like: no SNOMED concept)
    (and
      (clinical_finding (snomed_concept "Sexually active" "finding"))
      (no (clinical_finding (snomed_concept "Lower abdominal pain" "finding")))
      (no (clinical_finding (snomed_concept "Cervical excitation present" "finding")))
      (or
        (clinical_finding (snomed_concept "Pruritus of vagina" "disorder"))
        (clinical_finding (snomed_concept "Erythema of vulva" "disorder"))
        (clinical_finding (snomed_concept "Scratch marks" "finding") (finding_site (snomed_concept "Vulval structure" "body structure")))
        (clinical_finding (snomed_concept "Inflammation of vulva" "disorder"))
      )
    )
    ;; Not sexually active and vulva red/scratched/inflamed (curd-like: no SNOMED concept)
    (and
      (no (clinical_finding (snomed_concept "Sexually active" "finding")))
      (or
        (clinical_finding (snomed_concept "Erythema of vulva" "disorder"))
        (clinical_finding (snomed_concept "Scratch marks" "finding") (finding_site (snomed_concept "Vulval structure" "body structure")))
        (clinical_finding (snomed_concept "Inflammation of vulva" "disorder"))
      )
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable bacterial vaginosis (vaginal discharge approach)"
  (diagnosis
    (snomed_concept "Bacterial vaginosis" "disorder")
    probable
  )
  adult
  ;; Not sexually active and no to curd-like/vulva red, scratched or inflamed (curd-like: no SNOMED concept)
  (and
    (no (clinical_finding (snomed_concept "Sexually active" "finding")))
    (no (clinical_finding (snomed_concept "Erythema of vulva" "disorder")))
    (no (clinical_finding (snomed_concept "Scratch marks" "finding") (finding_site (snomed_concept "Vulval structure" "body structure"))))
    (no (clinical_finding (snomed_concept "Inflammation of vulva" "disorder")))
  )
)
(system_diagnosis_rule
  "Diagnose probable LAP syndrome (vaginal discharge approach)"
  (diagnosis
    (snomed_concept "Female pelvic inflammatory disease" "disorder")
    probable
  )
  adult
  (or
    ;; Sexually active and pain on moving the cervix
    (and
      (clinical_finding (snomed_concept "Sexually active" "finding"))
      (clinical_finding (snomed_concept "Cervical excitation present" "finding"))
    )
    ;; Not sexually active, no vulval signs (BV path), pain on moving the cervix
    (and
      (no (clinical_finding (snomed_concept "Sexually active" "finding")))
      (no (clinical_finding (snomed_concept "Erythema of vulva" "disorder")))
      (no (clinical_finding (snomed_concept "Scratch marks" "finding") (finding_site (snomed_concept "Vulval structure" "body structure"))))
      (no (clinical_finding (snomed_concept "Inflammation of vulva" "disorder")))
      (clinical_finding (snomed_concept "Cervical excitation present" "finding"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose possible UTI (vaginal discharge approach)"
  (diagnosis
    (snomed_concept "Urinary tract infectious disease" "disorder")
    possible
  )
  adult
  ;; Sexually active, lower abdominal pain, no pain on moving the cervix: assess for UTI (page 69)
  (and
    (clinical_finding (snomed_concept "Sexually active" "finding"))
    (clinical_finding (snomed_concept "Lower abdominal pain" "finding"))
    (no (clinical_finding (snomed_concept "Cervical excitation present" "finding")))
  )
)
(system_priority_evaluation
  "Urgent: abnormal vaginal discharge with danger signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Vaginal discharge" "finding"))
    (or
      (clinical_finding (snomed_concept "Postpartum state" "finding"))
      (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
      (clinical_finding (snomed_concept "Miscarriage" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
      (clinical_finding (snomed_concept "Pregnancy" "finding"))
      (clinical_finding (snomed_concept "Missed period" "finding"))
      (clinical_finding (snomed_concept "Menstrual period late" "finding"))
      (clinical_finding (snomed_concept "Abnormal vaginal bleeding" "finding"))
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (> (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
      (clinical_finding (snomed_concept "Shock" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
      (clinical_finding (snomed_concept "Abdominal mass" "finding"))
      (clinical_finding (snomed_concept "Peritonitis" "disorder"))
      (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
      (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
      (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
    )
  )
)

;; Page 177 - Routine antenatal care
;; Red box: "Give urgent attention to the pregnant patient with any of:"
(task
  "Check for urgent routine antenatal care conditions"
  adult
  (clinical_finding (snomed_concept "Pregnancy" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Shock" "disorder"))

    ;; pre-eclampsia symptoms and proteinuria
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Blurring of visual image" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Proteinuria" "finding"))

    ;; temperature >= 38 with severe back/abdominal pain
    (clinical_finding (snomed_concept "Backache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Abdominal pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))

    ;; swollen painful calf
    (clinical_finding (snomed_concept "Swollen calf" "finding"))
    (clinical_finding (snomed_concept "Pain in calf" "finding"))

    ;; labour, membranes, fetal movements
    (clinical_finding (snomed_concept "Painful uterine contractions" "finding"))
    (clinical_finding (snomed_concept "Uterine contractions present" "finding"))
    (clinical_finding (snomed_concept "Watery vaginal discharge" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Reduced fetal movement" "finding"))
    (clinical_finding (snomed_concept "Fetal movements absent" "situation"))
  )
)
;; Vaginal bleeding column: "Cervical os open/dilated or products of conception in cervical os/vagina?"
(task
  "Check for miscarriage signs in pregnant patient with vaginal bleeding"
  adult
  (and
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
  )
  (check_for
    (clinical_finding (snomed_concept "Cervical os open" "finding"))
    (clinical_finding (snomed_concept "Products of conception at uterine os cervix" "finding"))
    (clinical_finding (snomed_concept "Products of conception in vagina" "finding"))
  )
)
;; "treat as severe pre-eclampsia" (two red-box criteria)
(system_diagnosis_rule
  "Diagnose probable severe pre-eclampsia in antenatal patient"
  (diagnosis (snomed_concept "Severe pre-eclampsia" "disorder") probable)
  adult
  (and
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (or
      (and
        (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 140)
            (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 90))
        (or (clinical_finding (snomed_concept "Headache" "finding"))
            (clinical_finding (snomed_concept "Blurring of visual image" "finding"))
            (clinical_finding (snomed_concept "Abdominal pain" "finding")))
      )
      (and
        (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 160)
            (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110))
        (clinical_finding (snomed_concept "Proteinuria" "finding"))
      )
    )
  )
)
;; "Painful contractions < 37 weeks: preterm labour likely" (gestational age not representable)
(system_diagnosis_rule
  "Diagnose probable preterm labour in antenatal patient"
  (diagnosis (snomed_concept "Premature labor" "finding") probable)
  adult
  (and
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Painful uterine contractions" "finding"))
  )
)
;; "Sudden gush of clear/pale fluid from vagina with no contractions: PROM likely"
(system_diagnosis_rule
  "Diagnose probable prelabour rupture of membranes in antenatal patient"
  (diagnosis (snomed_concept "Premature rupture of membranes" "disorder") probable)
  adult
  (and
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Watery vaginal discharge" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (no (clinical_finding (snomed_concept "Uterine contractions present" "finding")))
  )
)
;; Seizures column: "If between 20 weeks and 1 week postpartum, treat for eclampsia" (gestational age not representable)
(system_diagnosis_rule
  "Diagnose probable eclampsia in antenatal patient with seizures"
  (diagnosis (snomed_concept "Eclampsia" "disorder") probable)
  adult
  (and
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Seizure" "finding"))
  )
)
;; Vaginal bleeding, early pregnancy (< 22 weeks, not representable), os question = No:
;; "Threatened or complete miscarriage likely" and "Refer to exclude ectopic pregnancy"
(system_diagnosis_rule
  "Diagnose possible threatened miscarriage in antenatal patient"
  (diagnosis (snomed_concept "Threatened abortion" "disorder") possible)
  adult
  (and
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
    (no (clinical_finding (snomed_concept "Cervical os open" "finding")))
    (no (clinical_finding (snomed_concept "Products of conception at uterine os cervix" "finding")))
    (no (clinical_finding (snomed_concept "Products of conception in vagina" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose possible complete miscarriage in antenatal patient"
  (diagnosis (snomed_concept "Complete miscarriage" "disorder") possible)
  adult
  (and
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
    (no (clinical_finding (snomed_concept "Cervical os open" "finding")))
    (no (clinical_finding (snomed_concept "Products of conception at uterine os cervix" "finding")))
    (no (clinical_finding (snomed_concept "Products of conception in vagina" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose possible ectopic pregnancy in antenatal patient with vaginal bleeding"
  (diagnosis (snomed_concept "Ectopic pregnancy" "disorder") possible)
  adult
  (and
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
    (no (clinical_finding (snomed_concept "Cervical os open" "finding")))
    (no (clinical_finding (snomed_concept "Products of conception at uterine os cervix" "finding")))
    (no (clinical_finding (snomed_concept "Products of conception in vagina" "finding")))
  )
)
;; Os question = Yes: "Incomplete or inevitable miscarriage likely"
(system_diagnosis_rule
  "Diagnose possible incomplete miscarriage in antenatal patient"
  (diagnosis (snomed_concept "Incomplete miscarriage" "disorder") possible)
  adult
  (and
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
    (or (clinical_finding (snomed_concept "Cervical os open" "finding"))
        (clinical_finding (snomed_concept "Products of conception at uterine os cervix" "finding"))
        (clinical_finding (snomed_concept "Products of conception in vagina" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose possible inevitable miscarriage in antenatal patient"
  (diagnosis (snomed_concept "Inevitable abortion" "disorder") possible)
  adult
  (and
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
    (or (clinical_finding (snomed_concept "Cervical os open" "finding"))
        (clinical_finding (snomed_concept "Products of conception at uterine os cervix" "finding"))
        (clinical_finding (snomed_concept "Products of conception in vagina" "finding")))
  )
)
(system_priority_evaluation
  "Urgent: pregnant patient with antenatal danger signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (or
      (clinical_finding (snomed_concept "Seizure" "finding"))
      (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
      (active_condition (snomed_concept "Severe pre-eclampsia" "disorder"))
      ;; "BP >= 160/110 without proteinuria: treat as severe hypertension" (no SNOMED concept for severe hypertension)
      (and
        (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 160)
            (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110))
        (no (clinical_finding (snomed_concept "Proteinuria" "finding")))
      )
      (active_condition (snomed_concept "Premature labor" "finding"))
      (active_condition (snomed_concept "Premature rupture of membranes" "disorder"))
      (and
        (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
        (or (clinical_finding (snomed_concept "Backache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
            (clinical_finding (snomed_concept "Abdominal pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value"))))
      )
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (and
        (clinical_finding (snomed_concept "Swollen calf" "finding"))
        (clinical_finding (snomed_concept "Pain in calf" "finding"))
      )
      (clinical_finding (snomed_concept "Reduced fetal movement" "finding"))
      (clinical_finding (snomed_concept "Fetal movements absent" "situation"))
      (clinical_finding (snomed_concept "Shock" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
    )
  )
)

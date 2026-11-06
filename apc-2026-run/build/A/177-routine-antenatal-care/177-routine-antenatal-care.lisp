;; Page 177 - Routine antenatal care
(task
  "Check for urgent signs in the pregnant patient (antenatal care)"
  adult
  (active_condition (snomed_concept "Pregnancy" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Shock" "disorder"))

    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Blurring of visual image" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Proteinuria" "finding"))

    (clinical_finding (snomed_concept "Backache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Abdominal pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))

    (clinical_finding (snomed_concept "Swollen calf" "finding"))
    (clinical_finding (snomed_concept "Pain in calf" "finding"))

    (clinical_finding (snomed_concept "Reduced fetal movement" "finding"))
    (clinical_finding (snomed_concept "Fetal movements absent" "situation"))

    (clinical_finding (snomed_concept "Painful uterine contractions" "finding"))
    (clinical_finding (snomed_concept "Uterine contractions present" "finding"))
    (clinical_finding (snomed_concept "Watery vaginal discharge" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)
(task
  "Check cervical os and products of conception in pregnant patient with vaginal bleeding"
  adult
  (and
    (active_condition (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
  )
  (check_for
    (clinical_finding (snomed_concept "Cervical os open" "finding"))
    (clinical_finding (snomed_concept "Cervix dilated" "finding"))
    (clinical_finding (snomed_concept "Products of conception at uterine os cervix" "finding"))
    (clinical_finding (snomed_concept "Products of conception in vagina" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable severe pre-eclampsia in pregnancy (antenatal care)"
  (diagnosis
    (snomed_concept "Severe pre-eclampsia" "disorder")
    probable
  )
  adult
  (and
    (active_condition (snomed_concept "Pregnancy" "finding"))
    (or
      ;; BP >= 140/90 and persistent headache/blurred vision/abdominal pain
      (and
        (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 140)
            (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 90))
        (or (clinical_finding (snomed_concept "Headache" "finding"))
            (clinical_finding (snomed_concept "Blurring of visual image" "finding"))
            (clinical_finding (snomed_concept "Abdominal pain" "finding")))
      )
      ;; BP >= 160/110 and >= 1+ proteinuria
      (and
        (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 160)
            (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110))
        (clinical_finding (snomed_concept "Proteinuria" "finding"))
      )
    )
  )
)
(system_diagnosis_rule
  "Diagnose possible preterm labour from painful contractions in pregnancy"
  (diagnosis
    (snomed_concept "Premature labor" "finding")
    possible
  )
  adult
  ;; "< 37 weeks" cannot be expressed (no gestational-age unit), so this is possible, not probable
  (and
    (active_condition (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Painful uterine contractions" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable prelabour rupture of membranes (antenatal care)"
  (diagnosis
    (snomed_concept "Premature rupture of membranes" "disorder")
    probable
  )
  adult
  (and
    (active_condition (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Watery vaginal discharge" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (no (clinical_finding (snomed_concept "Uterine contractions present" "finding")))
  )
)
;; Vaginal bleeding, early pregnancy (< 22 weeks not representable): cervical os question = No
(system_diagnosis_rule
  "Diagnose possible threatened miscarriage (antenatal vaginal bleeding)"
  (diagnosis
    (snomed_concept "Threatened abortion" "disorder")
    possible
  )
  adult
  (and
    (active_condition (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
    (no (clinical_finding (snomed_concept "Cervical os open" "finding")))
    (no (clinical_finding (snomed_concept "Cervix dilated" "finding")))
    (no (clinical_finding (snomed_concept "Products of conception at uterine os cervix" "finding")))
    (no (clinical_finding (snomed_concept "Products of conception in vagina" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose possible complete miscarriage (antenatal vaginal bleeding)"
  (diagnosis
    (snomed_concept "Complete miscarriage" "disorder")
    possible
  )
  adult
  (and
    (active_condition (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
    (no (clinical_finding (snomed_concept "Cervical os open" "finding")))
    (no (clinical_finding (snomed_concept "Cervix dilated" "finding")))
    (no (clinical_finding (snomed_concept "Products of conception at uterine os cervix" "finding")))
    (no (clinical_finding (snomed_concept "Products of conception in vagina" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose possible ectopic pregnancy (antenatal vaginal bleeding, os closed)"
  (diagnosis
    (snomed_concept "Ectopic pregnancy" "disorder")
    possible
  )
  adult
  (and
    (active_condition (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
    (no (clinical_finding (snomed_concept "Cervical os open" "finding")))
    (no (clinical_finding (snomed_concept "Cervix dilated" "finding")))
    (no (clinical_finding (snomed_concept "Products of conception at uterine os cervix" "finding")))
    (no (clinical_finding (snomed_concept "Products of conception in vagina" "finding")))
  )
)
;; Vaginal bleeding, early pregnancy: cervical os question = Yes
(system_diagnosis_rule
  "Diagnose possible incomplete miscarriage (antenatal vaginal bleeding)"
  (diagnosis
    (snomed_concept "Incomplete miscarriage" "disorder")
    possible
  )
  adult
  (and
    (active_condition (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
    (or (clinical_finding (snomed_concept "Cervical os open" "finding"))
        (clinical_finding (snomed_concept "Cervix dilated" "finding"))
        (clinical_finding (snomed_concept "Products of conception at uterine os cervix" "finding"))
        (clinical_finding (snomed_concept "Products of conception in vagina" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose possible inevitable miscarriage (antenatal vaginal bleeding)"
  (diagnosis
    (snomed_concept "Inevitable abortion" "disorder")
    possible
  )
  adult
  (and
    (active_condition (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
    (or (clinical_finding (snomed_concept "Cervical os open" "finding"))
        (clinical_finding (snomed_concept "Cervix dilated" "finding"))
        (clinical_finding (snomed_concept "Products of conception at uterine os cervix" "finding"))
        (clinical_finding (snomed_concept "Products of conception in vagina" "finding")))
  )
)
(system_priority_evaluation
  "Urgent: pregnant patient with antenatal danger signs"
  adult
  Urgent
  (and
    (active_condition (snomed_concept "Pregnancy" "finding"))
    (or
      (clinical_finding (snomed_concept "Seizure" "finding"))
      (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
      (active_condition (snomed_concept "Severe pre-eclampsia" "disorder"))
      (and
        (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
        (or (clinical_finding (snomed_concept "Backache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
            (clinical_finding (snomed_concept "Abdominal pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value"))))
      )
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      ;; BP >= 160/110 without proteinuria: severe hypertension (no SNOMED concept, so written out)
      (and
        (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 160)
            (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110))
        (no (clinical_finding (snomed_concept "Proteinuria" "finding")))
      )
      (and (clinical_finding (snomed_concept "Swollen calf" "finding"))
           (clinical_finding (snomed_concept "Pain in calf" "finding")))
      ;; Painful contractions < 37 weeks (gestational age not representable)
      (clinical_finding (snomed_concept "Painful uterine contractions" "finding"))
      (or (clinical_finding (snomed_concept "Reduced fetal movement" "finding"))
          (clinical_finding (snomed_concept "Fetal movements absent" "situation")))
      (active_condition (snomed_concept "Premature rupture of membranes" "disorder"))
      ;; Shock/systolic BP < 80, as written on this page
      (or (clinical_finding (snomed_concept "Shock" "disorder"))
          (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80))
    )
  )
)

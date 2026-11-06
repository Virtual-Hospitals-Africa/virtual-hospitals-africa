(task
  "Check for urgent joint symptom conditions"
  adult
  (clinical_finding (snomed_concept "Pain of joint" "finding"))
  (check_for

    (clinical_finding (snomed_concept "Joint warm" "finding"))
    (clinical_finding (snomed_concept "Tenderness of joint" "finding"))
    (clinical_finding (snomed_concept "Joint swelling" "finding"))
    (clinical_finding (snomed_concept "Limitation of joint movement" "finding"))
    (clinical_finding (snomed_concept "Pain of joint" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))


    (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
    (clinical_finding (snomed_concept "Joint swelling" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Deformity" "finding"))


    (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))


    (clinical_finding (snomed_concept "Gout" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Pain of joint" "finding") (finding_site (snomed_concept "Structure of joint of hallux" "body structure")))
    (clinical_finding (snomed_concept "Pain of joint" "finding") (finding_site (snomed_concept "Structure of midfoot region of foot" "body structure")))
    (clinical_finding (snomed_concept "Pain of joint" "finding") (finding_site (snomed_concept "Ankle joint structure" "body structure")))
    (clinical_finding (snomed_concept "Fever" "finding"))
    (clinical_finding (snomed_concept "Wound" "disorder"))


    (clinical_finding (snomed_concept "Vaginal discharge" "finding"))
    (clinical_finding (snomed_concept "Urethral discharge" "finding"))
    (clinical_finding (snomed_concept "Eruption" "morphologic abnormality") (qualifier (snomed_concept "Painless" "qualifier value")))
    (clinical_finding (snomed_concept "Itching" "finding"))


    (clinical_finding (snomed_concept "Pain of joint" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Erythema" "finding") (finding_site (snomed_concept "Joint structure" "body structure")))
  )
)
(system_diagnosis_rule
  "Diagnose probable septic arthritis (joint symptoms)"
  (diagnosis
    (snomed_concept "Infective arthritis" "disorder")
    probable
  )
  adult


  (and (clinical_finding (snomed_concept "Joint warm" "finding"))
       (clinical_finding (snomed_concept "Joint swelling" "finding"))
       (clinical_finding (snomed_concept "Pain of joint" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
       (clinical_finding (snomed_concept "Limitation of joint movement" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable fracture (joint symptoms)"
  (diagnosis
    (snomed_concept "Fracture of bone" "disorder")
    probable
  )
  adult

  (and (<= (onset (clinical_finding (snomed_concept "Traumatic injury" "disorder"))) (time_ago 48 hours))
       (or (clinical_finding (snomed_concept "Pain of joint" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
           (clinical_finding (snomed_concept "Joint swelling" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
           (clinical_finding (snomed_concept "Deformity" "finding"))
       )
  )
)
(system_diagnosis_rule
  "Diagnose probable sprain/strain (joint symptoms)"
  (diagnosis
    (snomed_concept "Sprain of ligament of joint" "disorder")
    probable
  )
  adult

  (and (or (clinical_finding (snomed_concept "Joint warm" "finding"))
           (clinical_finding (snomed_concept "Tenderness of joint" "finding"))
           (clinical_finding (snomed_concept "Joint swelling" "finding"))
           (clinical_finding (snomed_concept "Limitation of joint movement" "finding"))
       )
       (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
  )
)
(system_diagnosis_rule
  "Diagnose probable chronic arthritis (joint symptoms)"
  (diagnosis
    (snomed_concept "Chronic arthritis" "disorder")
    probable
  )
  adult

  (and (or (clinical_finding (snomed_concept "Joint warm" "finding"))
           (clinical_finding (snomed_concept "Tenderness of joint" "finding"))
           (clinical_finding (snomed_concept "Joint swelling" "finding"))
           (clinical_finding (snomed_concept "Limitation of joint movement" "finding"))
       )
       (no (clinical_finding (snomed_concept "Traumatic injury" "disorder")))
       (>= (onset (clinical_finding (snomed_concept "Pain of joint" "finding"))) (time_ago 6 weeks))
  )
)
(system_diagnosis_rule
  "Diagnose probable gonococcal arthritis (joint symptoms)"
  (diagnosis
    (snomed_concept "Gonococcal infection of joint" "disorder")
    probable
  )
  adult


  (and (or (clinical_finding (snomed_concept "Joint warm" "finding"))
           (clinical_finding (snomed_concept "Tenderness of joint" "finding"))
           (clinical_finding (snomed_concept "Joint swelling" "finding"))
           (clinical_finding (snomed_concept "Limitation of joint movement" "finding"))
       )
       (no (clinical_finding (snomed_concept "Traumatic injury" "disorder")))
       (<= (onset (clinical_finding (snomed_concept "Pain of joint" "finding"))) (time_ago 6 weeks))
       (or (clinical_finding (snomed_concept "Vaginal discharge" "finding"))
           (clinical_finding (snomed_concept "Urethral discharge" "finding"))
           (and (clinical_finding (snomed_concept "Eruption" "morphologic abnormality") (qualifier (snomed_concept "Painless" "qualifier value")))
                (no (clinical_finding (snomed_concept "Itching" "finding"))))
       )
  )
)
(system_diagnosis_rule
  "Diagnose probable acute gout (joint symptoms)"
  (diagnosis
    (snomed_concept "Acute gout" "disorder")
    probable
  )
  adult
  (or


    (and (clinical_finding (snomed_concept "Gout" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
         (or (clinical_finding (snomed_concept "Pain of joint" "finding") (finding_site (snomed_concept "Structure of joint of hallux" "body structure")))
             (clinical_finding (snomed_concept "Pain of joint" "finding") (finding_site (snomed_concept "Structure of midfoot region of foot" "body structure")))
             (clinical_finding (snomed_concept "Pain of joint" "finding") (finding_site (snomed_concept "Ankle joint structure" "body structure")))
         )
         (no (clinical_finding (snomed_concept "Fever" "finding")))
         (no (clinical_finding (snomed_concept "Wound" "disorder")))
    )


    (and (no (clinical_finding (snomed_concept "Traumatic injury" "disorder")))
         (<= (onset (clinical_finding (snomed_concept "Pain of joint" "finding"))) (time_ago 6 weeks))
         (no (clinical_finding (snomed_concept "Vaginal discharge" "finding")))
         (no (clinical_finding (snomed_concept "Urethral discharge" "finding")))
         (no (clinical_finding (snomed_concept "Eruption" "morphologic abnormality") (qualifier (snomed_concept "Painless" "qualifier value"))))
         (clinical_finding (snomed_concept "Joint warm" "finding"))
         (clinical_finding (snomed_concept "Pain of joint" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
         (clinical_finding (snomed_concept "Erythema" "finding") (finding_site (snomed_concept "Joint structure" "body structure")))
         (clinical_finding (snomed_concept "Joint swelling" "finding"))
    )
  )
)
(system_priority_evaluation
  "Urgent: joint symptoms with danger signs"
  adult
  Urgent
  (and (clinical_finding (snomed_concept "Pain of joint" "finding"))
       (or (active_condition (snomed_concept "Infective arthritis" "disorder"))
           (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
           (active_condition (snomed_concept "Fracture of bone" "disorder"))
           (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))

           (and (clinical_finding (snomed_concept "Gout" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
                (or (clinical_finding (snomed_concept "Pain of joint" "finding") (finding_site (snomed_concept "Structure of joint of hallux" "body structure")))
                    (clinical_finding (snomed_concept "Pain of joint" "finding") (finding_site (snomed_concept "Structure of midfoot region of foot" "body structure")))
                    (clinical_finding (snomed_concept "Pain of joint" "finding") (finding_site (snomed_concept "Ankle joint structure" "body structure")))
                )
                (no (clinical_finding (snomed_concept "Fever" "finding")))
                (no (clinical_finding (snomed_concept "Wound" "disorder")))
           )
       )
  )
)

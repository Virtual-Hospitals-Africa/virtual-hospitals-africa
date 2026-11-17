;; Page 77 - Joint symptoms
;; See 77-joint-symptoms-flowchart.md for the page's algorithm and how each node maps to a rule.
(task
  "Check for urgent joint symptom conditions"
  adult
  (clinical_finding (snomed_concept "Pain of joint" "finding"))
  (check_for
    ;; Red box: septic arthritis likely; flowchart Q1 (joint warm/tender/swollen or unable to do all actions)
    (clinical_finding (snomed_concept "Joint warm" "finding"))
    (clinical_finding (snomed_concept "Tenderness of joint" "finding"))
    (clinical_finding (snomed_concept "Joint swelling" "finding"))
    (clinical_finding (snomed_concept "Limitation of joint movement" "finding"))
    (clinical_finding (snomed_concept "Pain of joint" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))

    ;; Red box: injury in past 48 hours and severe pain/swelling or deformity, fracture likely; flowchart Q2 (recent injury)
    (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
    (clinical_finding (snomed_concept "Joint swelling" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Deformity" "finding"))

    ;; Red box: unable to weight-bear
    (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))

    ;; Red box: known gout, affected joint big toe/midfoot/ankle, no fever or wound
    (clinical_finding (snomed_concept "Gout" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Pain of joint" "finding") (finding_site (snomed_concept "Structure of joint of hallux" "body structure")))
    (clinical_finding (snomed_concept "Pain of joint" "finding") (finding_site (snomed_concept "Structure of midfoot region of foot" "body structure")))
    (clinical_finding (snomed_concept "Pain of joint" "finding") (finding_site (snomed_concept "Ankle joint structure" "body structure")))
    (clinical_finding (snomed_concept "Fever" "finding"))
    (clinical_finding (snomed_concept "Wound" "disorder"))

    ;; Flowchart Q4: recent genital discharge or painless non-itchy skin rash (gonococcal arthritis)
    (clinical_finding (snomed_concept "Vaginal discharge" "finding"))
    (clinical_finding (snomed_concept "Urethral discharge" "finding"))
    (clinical_finding (snomed_concept "Eruption" "morphologic abnormality") (qualifier (snomed_concept "Painless" "qualifier value")))
    (clinical_finding (snomed_concept "Itching" "finding"))

    ;; Flowchart Q5: sudden onset of warm, extremely painful, red, swollen joints (acute gout)
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
  ;; Red box: short history of single warm, swollen, extremely painful joint with limited range of movement.
  ;; "Short history" and "single" joint cannot be expressed (see remaining questions).
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
  ;; Red box: injury in past 48 hours and severe pain/swelling or deformity
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
  ;; Q1 = Yes (joint warm/tender/swollen or unable to do all actions) and Q2 = Yes (recent injury)
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
  ;; Q1 = Yes, Q2 = No (no recent injury), Q3 = Yes (joint pain lasted >= 6 weeks)
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
  ;; Q1 = Yes, Q2 = No, Q3 = No (joint pain < 6 weeks, written <= because onset comparisons allow only >= and <=),
  ;; Q4 = Yes (recent genital discharge or painless non-itchy skin rash)
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
    ;; Red box: known gout and affected joint involves big toe, midfoot or ankle and no fever, wound,
    ;; surgery or injection into joint (surgery/injection not modelled)
    (and (clinical_finding (snomed_concept "Gout" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
         (or (clinical_finding (snomed_concept "Pain of joint" "finding") (finding_site (snomed_concept "Structure of joint of hallux" "body structure")))
             (clinical_finding (snomed_concept "Pain of joint" "finding") (finding_site (snomed_concept "Structure of midfoot region of foot" "body structure")))
             (clinical_finding (snomed_concept "Pain of joint" "finding") (finding_site (snomed_concept "Ankle joint structure" "body structure")))
         )
         (no (clinical_finding (snomed_concept "Fever" "finding")))
         (no (clinical_finding (snomed_concept "Wound" "disorder")))
    )
    ;; Flowchart: Q2 = No, Q3 = No, Q5 = Yes (sudden onset of 1-3 warm, extremely painful, red, swollen joints).
    ;; Q4 = No: no genital discharge and no painless rash ("non-itchy" not part of the No branch). "1-3" joints not modelled.
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
           ;; known gout acute attack (red box); not (active_condition Acute gout), which the non-urgent flowchart also diagnoses
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

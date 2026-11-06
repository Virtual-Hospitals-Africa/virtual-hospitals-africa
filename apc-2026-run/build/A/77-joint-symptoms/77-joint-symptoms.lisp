;; Page 77 - Joint symptoms
;; See 77-joint-symptoms-flowchart.md. "Pain of joint" is not a recorded common symptom, so a
;; possible-arthropathy pre-screen (anaphylaxis pattern) triggers the check tasks.
(system_diagnosis_rule
  "Diagnose possible arthropathy from joint symptoms"
  (diagnosis
    (snomed_concept "Arthropathy" "disorder")
    possible
  )
  adult
  (or (clinical_finding (snomed_concept "Pain of joint" "finding"))
      (clinical_finding (snomed_concept "Joint swelling" "finding"))
      (clinical_finding (snomed_concept "Joint stiffness" "finding"))
  )
)
(task
  "Check for urgent joint symptom conditions"
  adult
  (diagnosis (snomed_concept "Arthropathy" "disorder") possible)
  (check_for
    ;; the joint symptom itself
    (clinical_finding (snomed_concept "Pain of joint" "finding"))
    (clinical_finding (snomed_concept "Joint swelling" "finding"))
    (clinical_finding (snomed_concept "Joint stiffness" "finding"))

    ;; septic arthritis: warm, swollen, extremely painful joint with limited range of movement
    (clinical_finding (snomed_concept "Joint warm" "finding"))
    (clinical_finding (snomed_concept "Pain of joint" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Limitation of joint movement" "finding"))

    ;; fracture: injury in past 48 hours and severe pain/swelling or deformity
    (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
    (clinical_finding (snomed_concept "Joint swelling" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Deformity" "finding"))

    (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))

    ;; acute gout in known gout: big toe, midfoot or ankle; no fever, wound
    (clinical_finding (snomed_concept "Gout" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Pain of joint" "finding") (finding_site (snomed_concept "Great toe structure" "body structure")))
    (clinical_finding (snomed_concept "Pain of joint" "finding") (finding_site (snomed_concept "Structure of midfoot region of foot" "body structure")))
    (clinical_finding (snomed_concept "Pain of joint" "finding") (finding_site (snomed_concept "Ankle joint structure" "body structure")))
    (clinical_finding (snomed_concept "Wound" "disorder"))
  )
)
(task
  "Assess joint symptom not needing urgent attention"
  adult
  (diagnosis (snomed_concept "Arthropathy" "disorder") possible)
  (check_for
    ;; joint warm/tender/swollen or unable to do all actions comfortably
    (clinical_finding (snomed_concept "Tenderness of joint" "finding"))

    ;; recent genital discharge or painless non-itchy skin rash
    (clinical_finding (snomed_concept "Vaginal discharge" "finding"))
    (clinical_finding (snomed_concept "Urethral discharge" "finding"))
    (clinical_finding (snomed_concept "Eruption" "morphologic abnormality") (qualifier (snomed_concept "Painless" "qualifier value")))
    (clinical_finding (snomed_concept "Itching" "finding"))

    ;; sudden onset of warm, extremely painful, red, swollen joints
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
  ;; "short history of single ... joint": duration and joint count are not modelled
  (and (clinical_finding (snomed_concept "Joint warm" "finding"))
       (clinical_finding (snomed_concept "Joint swelling" "finding"))
       (clinical_finding (snomed_concept "Pain of joint" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
       (clinical_finding (snomed_concept "Limitation of joint movement" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable fracture after joint injury"
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
  "Diagnose probable acute gout in known gout (joint red box)"
  (diagnosis
    (snomed_concept "Acute gout" "disorder")
    probable
  )
  adult
  ;; "no ... surgery or injection into joint" is not modelled (procedures cannot be negated)
  (and (clinical_finding (snomed_concept "Gout" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
       (or (clinical_finding (snomed_concept "Pain of joint" "finding") (finding_site (snomed_concept "Great toe structure" "body structure")))
           (clinical_finding (snomed_concept "Pain of joint" "finding") (finding_site (snomed_concept "Structure of midfoot region of foot" "body structure")))
           (clinical_finding (snomed_concept "Pain of joint" "finding") (finding_site (snomed_concept "Ankle joint structure" "body structure")))
       )
       (no (clinical_finding (snomed_concept "Fever" "finding")))
       (no (clinical_finding (snomed_concept "Wound" "disorder")))
  )
)
(system_diagnosis_rule
  "Diagnose probable joint sprain"
  (diagnosis
    (snomed_concept "Sprain of ligament of joint" "disorder")
    probable
  )
  adult
  ;; A = Yes and recent injury = Yes
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
  ;; A = Yes, injury = No, joint pain >= 6 weeks = Yes
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
  "Diagnose probable gonococcal arthritis"
  (diagnosis
    (snomed_concept "Gonococcal infection of joint" "disorder")
    probable
  )
  adult
  ;; A = Yes, injury = No, joint pain >= 6 weeks = No, discharge/rash = Yes
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
  "Diagnose probable acute gout (sudden hot swollen joint)"
  (diagnosis
    (snomed_concept "Acute gout" "disorder")
    probable
  )
  adult
  ;; A = Yes, injury = No, >= 6 weeks = No, discharge/rash = No, sudden hot red swollen joint = Yes
  ;; "1-3 joints" is not modelled. A = Yes is implied by the warm, swollen joint below, so it is not repeated.
  (and (no (clinical_finding (snomed_concept "Traumatic injury" "disorder")))
       (<= (onset (clinical_finding (snomed_concept "Pain of joint" "finding"))) (time_ago 6 weeks))
       (no (clinical_finding (snomed_concept "Vaginal discharge" "finding")))
       (no (clinical_finding (snomed_concept "Urethral discharge" "finding")))
       (no (clinical_finding (snomed_concept "Eruption" "morphologic abnormality") (qualifier (snomed_concept "Painless" "qualifier value"))))
       (clinical_finding (snomed_concept "Pain of joint" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
       (clinical_finding (snomed_concept "Joint warm" "finding"))
       (clinical_finding (snomed_concept "Erythema" "finding") (finding_site (snomed_concept "Joint structure" "body structure")))
       (clinical_finding (snomed_concept "Joint swelling" "finding"))
  )
)
(system_priority_evaluation
  "Urgent: joint symptoms with red-box sign"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Pain of joint" "finding"))
        (clinical_finding (snomed_concept "Joint swelling" "finding"))
        (clinical_finding (snomed_concept "Joint stiffness" "finding"))
    )
    (or (active_condition (snomed_concept "Infective arthritis" "disorder"))
        (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
        (active_condition (snomed_concept "Fracture of bone" "disorder"))
        (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))
        ;; known-gout criteria written out, so that acute gout from the non-urgent flowchart is not urgent
        (and (clinical_finding (snomed_concept "Gout" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
             (or (clinical_finding (snomed_concept "Pain of joint" "finding") (finding_site (snomed_concept "Great toe structure" "body structure")))
                 (clinical_finding (snomed_concept "Pain of joint" "finding") (finding_site (snomed_concept "Structure of midfoot region of foot" "body structure")))
                 (clinical_finding (snomed_concept "Pain of joint" "finding") (finding_site (snomed_concept "Ankle joint structure" "body structure")))
             )
             (no (clinical_finding (snomed_concept "Fever" "finding")))
             (no (clinical_finding (snomed_concept "Wound" "disorder")))
        )
    )
  )
)

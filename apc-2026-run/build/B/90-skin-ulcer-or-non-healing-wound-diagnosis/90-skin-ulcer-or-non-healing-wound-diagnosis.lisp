;; Page 90 - Skin ulcer or non-healing wound: diagnosis
(task
  "Check for skin ulcer or non-healing wound danger signs and cause"
  adult
  (or (clinical_finding (snomed_concept "Skin ulcer" "disorder"))
      (clinical_finding (snomed_concept "Chronic wound" "disorder")))
  (check_for
    ;; Red box: infection (surrounding skin red/warm/swollen)
    (clinical_finding (snomed_concept "Infected ulcer of skin" "disorder"))
    (clinical_finding (snomed_concept "Local infection of wound" "disorder"))
    (clinical_finding (snomed_concept "Erythema" "finding"))
    (clinical_finding (snomed_concept "Warm skin" "finding"))
    (clinical_finding (snomed_concept "Swelling" "finding"))

    ;; Red box: with any of (besides SBP, pulse and temperature, which are vitals)
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Blister of skin" "disorder"))
    (clinical_finding (snomed_concept "Subcutaneous crepitus" "finding"))
    (clinical_finding (snomed_concept "Severe pain" "finding"))

    ;; Red box: critical limb ischaemia; flowchart: arterial ulcer
    (clinical_finding (snomed_concept "Intermittent claudication" "finding"))
    (clinical_finding (snomed_concept "Pain provoked by rest" "finding"))
    (clinical_finding (snomed_concept "Gangrenous disorder" "disorder"))
    (clinical_finding (snomed_concept "Foot pulse absent" "finding"))
    (clinical_finding (snomed_concept "Abnormal foot pulse" "finding"))

    ;; Flowchart: pressure ulcer
    (clinical_finding (snomed_concept "Bed-ridden" "finding"))
    (clinical_finding (snomed_concept "Dependence on wheelchair" "finding"))

    ;; Flowchart: is ulcer on the lower leg or foot?
    (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Structure of lower limb from knee to ankle" "body structure")))
    (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Foot structure" "body structure")))
    (clinical_finding (snomed_concept "Chronic wound" "disorder") (finding_site (snomed_concept "Structure of lower limb from knee to ankle" "body structure")))
    (clinical_finding (snomed_concept "Chronic wound" "disorder") (finding_site (snomed_concept "Foot structure" "body structure")))

    ;; Flowchart: venous ulcer
    (clinical_finding (snomed_concept "Hyperpigmentation of skin" "disorder"))
    (clinical_finding (snomed_concept "Varicose veins of lower extremity" "disorder"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding") (qualifier (snomed_concept "Chronic" "qualifier value")))

    ;; Flowchart: diabetic ulcer
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose probable critical limb ischaemia in skin ulcer or non-healing wound"
  (diagnosis
    (snomed_concept "Critical lower limb ischemia" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Skin ulcer" "disorder"))
        (clinical_finding (snomed_concept "Chronic wound" "disorder")))
    (clinical_finding (snomed_concept "Intermittent claudication" "finding"))
    (or (clinical_finding (snomed_concept "Pain provoked by rest" "finding"))
        (clinical_finding (snomed_concept "Gangrenous disorder" "disorder")))
  )
)
(system_diagnosis_rule
  "Diagnose probable pressure ulcer"
  (diagnosis
    (snomed_concept "Pressure injury" "disorder")
    probable
  )
  adult
  ;; Q1 = Yes. The "common pressure ulcer site" half is not modelled (sites shown only in a picture)
  (and
    (or (clinical_finding (snomed_concept "Skin ulcer" "disorder"))
        (clinical_finding (snomed_concept "Chronic wound" "disorder")))
    (or (clinical_finding (snomed_concept "Bed-ridden" "finding"))
        (clinical_finding (snomed_concept "Dependence on wheelchair" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable arterial (ischaemic) ulcer"
  (diagnosis
    (snomed_concept "Ischemic ulcer of lower limb" "disorder")
    probable
  )
  adult
  ;; Q2 = Yes, Q3 = Yes
  (and
    (or (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Structure of lower limb from knee to ankle" "body structure")))
        (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Foot structure" "body structure")))
        (clinical_finding (snomed_concept "Chronic wound" "disorder") (finding_site (snomed_concept "Structure of lower limb from knee to ankle" "body structure")))
        (clinical_finding (snomed_concept "Chronic wound" "disorder") (finding_site (snomed_concept "Foot structure" "body structure"))))
    (or (clinical_finding (snomed_concept "Intermittent claudication" "finding"))
        (clinical_finding (snomed_concept "Foot pulse absent" "finding"))
        (clinical_finding (snomed_concept "Abnormal foot pulse" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable venous ulcer"
  (diagnosis
    (snomed_concept "Venous ulcer of lower limb" "disorder")
    probable
  )
  adult
  ;; Q2 = Yes, Q3 = No, Q4 = Yes
  (and
    (or (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Structure of lower limb from knee to ankle" "body structure")))
        (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Foot structure" "body structure")))
        (clinical_finding (snomed_concept "Chronic wound" "disorder") (finding_site (snomed_concept "Structure of lower limb from knee to ankle" "body structure")))
        (clinical_finding (snomed_concept "Chronic wound" "disorder") (finding_site (snomed_concept "Foot structure" "body structure"))))
    (no (clinical_finding (snomed_concept "Intermittent claudication" "finding")))
    (no (clinical_finding (snomed_concept "Foot pulse absent" "finding")))
    (no (clinical_finding (snomed_concept "Abnormal foot pulse" "finding")))
    (or (clinical_finding (snomed_concept "Hyperpigmentation of skin" "disorder"))
        (clinical_finding (snomed_concept "Varicose veins of lower extremity" "disorder"))
        (clinical_finding (snomed_concept "Leg swelling symptom" "finding") (qualifier (snomed_concept "Chronic" "qualifier value"))))
  )
)
(system_diagnosis_rule
  "Diagnose probable diabetic ulcer"
  (diagnosis
    (snomed_concept "Skin ulcer due to diabetes mellitus" "disorder")
    probable
  )
  adult
  ;; Q2 = Yes, Q3 = No, Q4 = No, Q5 = Yes
  (and
    (or (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Structure of lower limb from knee to ankle" "body structure")))
        (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Foot structure" "body structure")))
        (clinical_finding (snomed_concept "Chronic wound" "disorder") (finding_site (snomed_concept "Structure of lower limb from knee to ankle" "body structure")))
        (clinical_finding (snomed_concept "Chronic wound" "disorder") (finding_site (snomed_concept "Foot structure" "body structure"))))
    (no (clinical_finding (snomed_concept "Intermittent claudication" "finding")))
    (no (clinical_finding (snomed_concept "Foot pulse absent" "finding")))
    (no (clinical_finding (snomed_concept "Abnormal foot pulse" "finding")))
    (no (clinical_finding (snomed_concept "Hyperpigmentation of skin" "disorder")))
    (no (clinical_finding (snomed_concept "Varicose veins of lower extremity" "disorder")))
    (no (clinical_finding (snomed_concept "Leg swelling symptom" "finding") (qualifier (snomed_concept "Chronic" "qualifier value"))))
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
  )
)
(system_priority_evaluation
  "Urgent: skin ulcer or non-healing wound with infection or critical limb ischaemia"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Skin ulcer" "disorder"))
        (clinical_finding (snomed_concept "Chronic wound" "disorder")))
    (or
      (and
        (or (clinical_finding (snomed_concept "Infected ulcer of skin" "disorder"))
            (clinical_finding (snomed_concept "Local infection of wound" "disorder"))
            (clinical_finding (snomed_concept "Erythema" "finding"))
            (clinical_finding (snomed_concept "Warm skin" "finding"))
            (clinical_finding (snomed_concept "Swelling" "finding")))
        (or (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
            (> (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
            (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
            (clinical_finding (snomed_concept "Acute confusion" "finding"))
            (clinical_finding (snomed_concept "Blister of skin" "disorder"))
            (clinical_finding (snomed_concept "Subcutaneous crepitus" "finding"))
            (clinical_finding (snomed_concept "Severe pain" "finding"))))
      (active_condition (snomed_concept "Critical lower limb ischemia" "disorder"))
    )
  )
)

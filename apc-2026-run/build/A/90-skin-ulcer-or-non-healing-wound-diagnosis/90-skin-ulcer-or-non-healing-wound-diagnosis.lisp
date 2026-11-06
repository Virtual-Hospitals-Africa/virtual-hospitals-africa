;; Page 90 - SKIN ULCER OR NON-HEALING WOUND: DIAGNOSIS
;; See 90-skin-ulcer-or-non-healing-wound-diagnosis-flowchart.md
(task
  "Check for urgent skin ulcer or non-healing wound conditions"
  adult
  (or (clinical_finding (snomed_concept "Skin ulcer" "disorder"))
      (clinical_finding (snomed_concept "Wound, non-healed" "morphologic abnormality")))
  (check_for
    ;; Infection (surrounding skin red/warm/swollen)
    (clinical_finding (snomed_concept "Infected ulcer of skin" "disorder"))
    (clinical_finding (snomed_concept "Local infection of wound" "disorder"))

    ;; ... with any of (vitals are routine: systolic BP, pulse, temperature)
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Blister of skin" "disorder"))
    (clinical_finding (snomed_concept "Subcutaneous crepitus" "finding"))
    (clinical_finding (snomed_concept "Severe pain" "finding"))

    ;; Critical limb ischaemia; claudication is also the arterial-ulcer question
    (clinical_finding (snomed_concept "Intermittent claudication" "finding"))
    (clinical_finding (snomed_concept "Pain provoked by rest" "finding"))
    (clinical_finding (snomed_concept "Gangrenous disorder" "disorder"))
  )
)
(task
  "Check for the cause of a skin ulcer or non-healing wound"
  adult
  (or (clinical_finding (snomed_concept "Skin ulcer" "disorder"))
      (clinical_finding (snomed_concept "Wound, non-healed" "morphologic abnormality")))
  (check_for
    ;; Q1: bedridden/in wheelchair and ulcer in a common pressure ulcer site (sites from the page's figure)
    (clinical_finding (snomed_concept "Bed-ridden" "finding"))
    (clinical_finding (snomed_concept "Confined to chair" "finding"))
    (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Occipital region structure" "body structure")))
    (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Structure of vertebral column" "body structure")))
    (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Structure of scapular region of back" "body structure")))
    (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Elbow region structure" "body structure")))
    (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Sacral region back structure" "body structure")))
    (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Hip region structure" "body structure")))
    (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Ankle region structure" "body structure")))
    (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Heel structure" "body structure")))

    ;; Q2: ulcer on the lower leg or foot
    (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Structure of lower limb from knee to ankle" "body structure")))
    (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Foot structure" "body structure")))

    ;; Q3: reduced/absent foot pulses (muscle pain on exercise is checked in the urgent task)
    (clinical_finding (snomed_concept "Weak arterial pulse" "finding") (finding_site (snomed_concept "Foot structure" "body structure")))
    (clinical_finding (snomed_concept "Foot pulse absent" "finding"))

    ;; Q4: darkening of skin around ulcer, varicose veins, chronic swelling of the leg
    (clinical_finding (snomed_concept "Hyperpigmentation of skin" "disorder"))
    (clinical_finding (snomed_concept "Varicose veins of lower extremity" "disorder"))
    (clinical_finding (snomed_concept "Swelling of lower limb" "finding") (qualifier (snomed_concept "Chronic" "qualifier value")))

    ;; Q5: known with diabetes
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose probable critical limb ischaemia in a patient with a skin ulcer or non-healing wound"
  (diagnosis
    (snomed_concept "Critical lower limb ischemia" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Intermittent claudication" "finding"))
       (or (clinical_finding (snomed_concept "Pain provoked by rest" "finding"))
           (clinical_finding (snomed_concept "Gangrenous disorder" "disorder"))))
)
(system_diagnosis_rule
  "Diagnose probable pressure ulcer (APC 2026 page 90)"
  (diagnosis
    (snomed_concept "Pressure injury" "disorder")
    probable
  )
  adult
  ;; Q1 = Yes
  (and
    (or (clinical_finding (snomed_concept "Bed-ridden" "finding"))
        (clinical_finding (snomed_concept "Confined to chair" "finding")))
    (or
      (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Occipital region structure" "body structure")))
      (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Structure of vertebral column" "body structure")))
      (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Structure of scapular region of back" "body structure")))
      (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Elbow region structure" "body structure")))
      (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Sacral region back structure" "body structure")))
      (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Hip region structure" "body structure")))
      (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Ankle region structure" "body structure")))
      (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Heel structure" "body structure")))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable arterial (ischaemic) ulcer (APC 2026 page 90)"
  (diagnosis
    (snomed_concept "Ischemic ulcer" "disorder")
    probable
  )
  adult
  ;; Q1 = No, Q2 = Yes, Q3 = Yes
  (and
    (or (and (no (clinical_finding (snomed_concept "Bed-ridden" "finding")))
             (no (clinical_finding (snomed_concept "Confined to chair" "finding"))))
        (and
          (no (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Occipital region structure" "body structure"))))
          (no (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Structure of vertebral column" "body structure"))))
          (no (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Structure of scapular region of back" "body structure"))))
          (no (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Elbow region structure" "body structure"))))
          (no (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Sacral region back structure" "body structure"))))
          (no (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Hip region structure" "body structure"))))
          (no (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Ankle region structure" "body structure"))))
          (no (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Heel structure" "body structure"))))
        ))
    (or (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Structure of lower limb from knee to ankle" "body structure")))
        (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Foot structure" "body structure"))))
    (or (clinical_finding (snomed_concept "Intermittent claudication" "finding"))
        (clinical_finding (snomed_concept "Weak arterial pulse" "finding") (finding_site (snomed_concept "Foot structure" "body structure")))
        (clinical_finding (snomed_concept "Foot pulse absent" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable venous ulcer (APC 2026 page 90)"
  (diagnosis
    (snomed_concept "Venous ulcer of lower limb" "disorder")
    probable
  )
  adult
  ;; Q1 = No, Q2 = Yes, Q3 = No, Q4 = Yes
  (and
    (or (and (no (clinical_finding (snomed_concept "Bed-ridden" "finding")))
             (no (clinical_finding (snomed_concept "Confined to chair" "finding"))))
        (and
          (no (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Occipital region structure" "body structure"))))
          (no (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Structure of vertebral column" "body structure"))))
          (no (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Structure of scapular region of back" "body structure"))))
          (no (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Elbow region structure" "body structure"))))
          (no (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Sacral region back structure" "body structure"))))
          (no (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Hip region structure" "body structure"))))
          (no (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Ankle region structure" "body structure"))))
          (no (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Heel structure" "body structure"))))
        ))
    (or (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Structure of lower limb from knee to ankle" "body structure")))
        (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Foot structure" "body structure"))))
    (no (clinical_finding (snomed_concept "Intermittent claudication" "finding")))
    (no (clinical_finding (snomed_concept "Weak arterial pulse" "finding") (finding_site (snomed_concept "Foot structure" "body structure"))))
    (no (clinical_finding (snomed_concept "Foot pulse absent" "finding")))
    (or (clinical_finding (snomed_concept "Hyperpigmentation of skin" "disorder"))
        (clinical_finding (snomed_concept "Varicose veins of lower extremity" "disorder"))
        (clinical_finding (snomed_concept "Swelling of lower limb" "finding") (qualifier (snomed_concept "Chronic" "qualifier value"))))
  )
)
(system_diagnosis_rule
  "Diagnose probable diabetic ulcer (APC 2026 page 90)"
  (diagnosis
    (snomed_concept "Skin ulcer due to diabetes mellitus" "disorder")
    probable
  )
  adult
  ;; Q1 = No, Q2 = Yes, Q3 = No, Q4 = No, Q5 = Yes
  (and
    (or (and (no (clinical_finding (snomed_concept "Bed-ridden" "finding")))
             (no (clinical_finding (snomed_concept "Confined to chair" "finding"))))
        (and
          (no (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Occipital region structure" "body structure"))))
          (no (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Structure of vertebral column" "body structure"))))
          (no (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Structure of scapular region of back" "body structure"))))
          (no (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Elbow region structure" "body structure"))))
          (no (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Sacral region back structure" "body structure"))))
          (no (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Hip region structure" "body structure"))))
          (no (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Ankle region structure" "body structure"))))
          (no (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Heel structure" "body structure"))))
        ))
    (or (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Structure of lower limb from knee to ankle" "body structure")))
        (clinical_finding (snomed_concept "Skin ulcer" "disorder") (finding_site (snomed_concept "Foot structure" "body structure"))))
    (no (clinical_finding (snomed_concept "Intermittent claudication" "finding")))
    (no (clinical_finding (snomed_concept "Weak arterial pulse" "finding") (finding_site (snomed_concept "Foot structure" "body structure"))))
    (no (clinical_finding (snomed_concept "Foot pulse absent" "finding")))
    (no (clinical_finding (snomed_concept "Hyperpigmentation of skin" "disorder")))
    (no (clinical_finding (snomed_concept "Varicose veins of lower extremity" "disorder")))
    (no (clinical_finding (snomed_concept "Swelling of lower limb" "finding") (qualifier (snomed_concept "Chronic" "qualifier value"))))
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
  )
)
(system_priority_evaluation
  "Urgent: skin ulcer or non-healing wound with infection and systemic or severe signs"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Skin ulcer" "disorder"))
      (clinical_finding (snomed_concept "Wound, non-healed" "morphologic abnormality")))
    (or (clinical_finding (snomed_concept "Infected ulcer of skin" "disorder"))
        (clinical_finding (snomed_concept "Local infection of wound" "disorder")))
    (or (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
        (> (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
        (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
        (clinical_finding (snomed_concept "Acute confusion" "finding"))
        (clinical_finding (snomed_concept "Blister of skin" "disorder"))
        (clinical_finding (snomed_concept "Subcutaneous crepitus" "finding"))
        (clinical_finding (snomed_concept "Severe pain" "finding")))
  )
)
(system_priority_evaluation
  "Urgent: skin ulcer or non-healing wound with critical limb ischaemia"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Skin ulcer" "disorder"))
      (clinical_finding (snomed_concept "Wound, non-healed" "morphologic abnormality")))
    (active_condition (snomed_concept "Critical lower limb ischemia" "disorder"))
  )
)

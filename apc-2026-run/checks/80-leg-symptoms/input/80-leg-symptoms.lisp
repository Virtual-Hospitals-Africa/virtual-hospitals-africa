(task
  "Check for urgent leg symptom conditions"
  adult
  (or (clinical_finding (snomed_concept "Finding of lower limb" "finding"))
      (clinical_finding (snomed_concept "Muscle pain" "finding")))
  (check_for

    (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))
    (clinical_finding (snomed_concept "Injury of lower limb" "disorder"))


    (clinical_finding (snomed_concept "Swollen calf" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Pain in calf" "finding"))


    (clinical_finding (snomed_concept "Pain in lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "At rest" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding"))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))
    (clinical_finding (snomed_concept "White discoloration of skin" "finding") (finding_site (snomed_concept "Lower limb structure" "body structure")))
    (clinical_finding (snomed_concept "Absent pulse" "finding") (finding_site (snomed_concept "Lower limb structure" "body structure")))


    (clinical_finding (snomed_concept "Intermittent claudication" "finding"))
    (clinical_finding (snomed_concept "Pain in lower limb" "finding") (qualifier (snomed_concept "At rest" "qualifier value")))
    (clinical_finding (snomed_concept "Ulcer of lower extremity" "disorder"))
    (clinical_finding (snomed_concept "Gangrenous disorder" "disorder") (finding_site (snomed_concept "Lower limb structure" "body structure")))
  )
)
(task
  "Check leg symptoms not needing urgent attention"
  adult
  (or (clinical_finding (snomed_concept "Finding of lower limb" "finding"))
      (clinical_finding (snomed_concept "Muscle pain" "finding")))
  (check_for

    (clinical_finding (snomed_concept "Joint warm" "finding"))
    (clinical_finding (snomed_concept "Tenderness of joint" "finding"))
    (clinical_finding (snomed_concept "Joint swelling" "finding"))
    (clinical_finding (snomed_concept "Difficulty walking" "finding"))
    (clinical_finding (snomed_concept "Difficulty sitting down" "finding"))
    (clinical_finding (snomed_concept "Difficulty standing up" "finding"))


    (clinical_finding (snomed_concept "Swelling of lower limb" "finding"))
    (clinical_finding (snomed_concept "Swelling of bilateral lower limbs" "finding"))
    (clinical_finding (snomed_concept "Orthopnea" "finding"))


    (clinical_finding (snomed_concept "Pain in buttock" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to left leg" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to right leg" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable fracture of leg (leg symptoms)"
  (diagnosis
    (snomed_concept "Fracture of lower limb" "disorder")
    probable
  )
  adult

  (and (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))
       (clinical_finding (snomed_concept "Injury of lower limb" "disorder")))
)
(system_diagnosis_rule
  "Diagnose probable DVT (leg symptoms)"
  (diagnosis
    (snomed_concept "Deep venous thrombosis" "disorder")
    probable
  )
  adult

  (and (clinical_finding (snomed_concept "Swollen calf" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
       (clinical_finding (snomed_concept "Pain in calf" "finding")))
)
(system_diagnosis_rule
  "Diagnose probable acute limb ischaemia (leg symptoms)"
  (diagnosis
    (snomed_concept "Acute lower limb ischemia" "disorder")
    probable
  )
  adult

  (and (clinical_finding (snomed_concept "Pain in lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "At rest" "qualifier value")))
       (or (clinical_finding (snomed_concept "Numbness of lower limb" "finding"))
           (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))
           (clinical_finding (snomed_concept "White discoloration of skin" "finding") (finding_site (snomed_concept "Lower limb structure" "body structure")))
           (clinical_finding (snomed_concept "Absent pulse" "finding") (finding_site (snomed_concept "Lower limb structure" "body structure")))))
)
(system_diagnosis_rule
  "Diagnose probable critical limb ischaemia (leg symptoms)"
  (diagnosis
    (snomed_concept "Critical lower limb ischemia" "disorder")
    probable
  )
  adult

  (and (clinical_finding (snomed_concept "Intermittent claudication" "finding"))
       (or (clinical_finding (snomed_concept "Pain in lower limb" "finding") (qualifier (snomed_concept "At rest" "qualifier value")))
           (clinical_finding (snomed_concept "Ulcer of lower extremity" "disorder"))
           (clinical_finding (snomed_concept "Gangrenous disorder" "disorder") (finding_site (snomed_concept "Lower limb structure" "body structure")))))
)
(system_diagnosis_rule
  "Diagnose probable joint problem (leg symptoms)"
  (diagnosis
    (snomed_concept "Arthropathy" "disorder")
    probable
  )
  adult

  (or (clinical_finding (snomed_concept "Joint warm" "finding"))
      (clinical_finding (snomed_concept "Tenderness of joint" "finding"))
      (clinical_finding (snomed_concept "Joint swelling" "finding"))
      (clinical_finding (snomed_concept "Difficulty walking" "finding"))
      (clinical_finding (snomed_concept "Difficulty sitting down" "finding"))
      (clinical_finding (snomed_concept "Difficulty standing up" "finding")))
)
(system_diagnosis_rule
  "Diagnose probable sciatic nerve irritation (leg symptoms)"
  (diagnosis
    (snomed_concept "Sciatica" "disorder")
    probable
  )
  adult

  (and (no (clinical_finding (snomed_concept "Swelling of lower limb" "finding")))
       (clinical_finding (snomed_concept "Pain in buttock" "finding"))
       (or (clinical_finding (snomed_concept "Pain radiating to left leg" "finding"))
           (clinical_finding (snomed_concept "Pain radiating to right leg" "finding"))))
)
(system_diagnosis_rule
  "Diagnose probable peripheral vascular disease (leg symptoms)"
  (diagnosis
    (snomed_concept "Peripheral vascular disease" "disorder")
    probable
  )
  adult

  (and (no (clinical_finding (snomed_concept "Swelling of lower limb" "finding")))
       (clinical_finding (snomed_concept "Intermittent claudication" "finding")))
)
(system_diagnosis_rule
  "Diagnose probable heart failure (leg symptoms)"
  (diagnosis
    (snomed_concept "Heart failure" "disorder")
    probable
  )
  adult

  (and (clinical_finding (snomed_concept "Swelling of bilateral lower limbs" "finding"))
       (clinical_finding (snomed_concept "Orthopnea" "finding")))
)
(system_diagnosis_rule
  "Diagnose probable sprain (leg symptoms)"
  (diagnosis
    (snomed_concept "Sprain of ligament of lower limb" "disorder")
    probable
  )
  adult

  (and (clinical_finding (snomed_concept "Joint swelling" "finding"))
       (clinical_finding (snomed_concept "Injury of lower limb" "disorder")))
)
(system_diagnosis_rule
  "Diagnose probable strain (leg symptoms)"
  (diagnosis
    (snomed_concept "Strain of muscle of lower limb" "disorder")
    probable
  )
  adult

  (and (clinical_finding (snomed_concept "Joint swelling" "finding"))
       (clinical_finding (snomed_concept "Injury of lower limb" "disorder")))
)
(system_priority_evaluation
  "Urgent: leg symptoms with fracture, DVT or limb ischaemia"
  adult
  Urgent
  (and (or (clinical_finding (snomed_concept "Finding of lower limb" "finding"))
           (clinical_finding (snomed_concept "Muscle pain" "finding")))
       (or (active_condition (snomed_concept "Fracture of lower limb" "disorder"))
           (active_condition (snomed_concept "Deep venous thrombosis" "disorder"))
           (active_condition (snomed_concept "Acute lower limb ischemia" "disorder"))
           (active_condition (snomed_concept "Critical lower limb ischemia" "disorder"))))
)

;; Page 80 - Leg symptoms
;; Red box: "Give urgent attention to the patient with leg symptoms and any of:" (see 80-leg-symptoms-flowchart.md)
(task
  "Check for urgent leg symptom conditions"
  adult
  (or (clinical_finding (snomed_concept "Finding of lower limb" "finding"))
      (clinical_finding (snomed_concept "Muscle pain" "finding")))
  (check_for
    ;; Fracture likely
    (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))
    (clinical_finding (snomed_concept "Injury of lower limb" "disorder"))

    ;; Deep venous thrombosis likely
    (clinical_finding (snomed_concept "Swollen calf" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Pain in calf" "finding"))

    ;; Acute limb ischaemia likely
    (clinical_finding (snomed_concept "Pain in lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "At rest" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding"))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))
    (clinical_finding (snomed_concept "White discoloration of skin" "finding") (finding_site (snomed_concept "Lower limb structure" "body structure")))
    (clinical_finding (snomed_concept "Peripheral pulse absent" "finding") (finding_site (snomed_concept "Lower limb structure" "body structure")))

    ;; Critical limb ischaemia likely
    (clinical_finding (snomed_concept "Intermittent claudication" "finding"))
    (clinical_finding (snomed_concept "Pain in lower limb" "finding") (qualifier (snomed_concept "At rest" "qualifier value")))
    (clinical_finding (snomed_concept "Ulcer of lower extremity" "disorder"))
    (clinical_finding (snomed_concept "Gangrene" "morphologic abnormality") (finding_site (snomed_concept "Lower limb structure" "body structure")))
  )
)
(task
  "Check for causes of leg symptoms not needing urgent attention"
  adult
  (or (clinical_finding (snomed_concept "Finding of lower limb" "finding"))
      (clinical_finding (snomed_concept "Muscle pain" "finding")))
  (check_for
    ;; Screen for joint problem
    (clinical_finding (snomed_concept "Joint warm" "finding"))
    (clinical_finding (snomed_concept "Tenderness of joint" "finding"))
    (clinical_finding (snomed_concept "Joint swelling" "finding"))
    (clinical_finding (snomed_concept "Difficulty walking" "finding"))
    (clinical_finding (snomed_concept "Difficulty sitting down" "finding"))
    (clinical_finding (snomed_concept "Difficulty standing up" "finding"))

    ;; No leg swelling: leg pain/discomfort
    (clinical_finding (snomed_concept "Pain in buttock" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to left leg" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to right leg" "finding"))

    ;; Both legs swollen
    (clinical_finding (snomed_concept "Swelling of bilateral lower limbs" "finding"))
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable fracture of lower limb (leg symptoms)"
  (diagnosis
    (snomed_concept "Fracture of lower limb" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))
       (clinical_finding (snomed_concept "Injury of lower limb" "disorder")))
)
(system_diagnosis_rule
  "Diagnose probable deep venous thrombosis (leg symptoms)"
  (diagnosis
    (snomed_concept "Deep venous thrombosis of lower extremity" "disorder")
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
           (clinical_finding (snomed_concept "Peripheral pulse absent" "finding") (finding_site (snomed_concept "Lower limb structure" "body structure")))))
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
           (clinical_finding (snomed_concept "Gangrene" "morphologic abnormality") (finding_site (snomed_concept "Lower limb structure" "body structure")))))
)
(system_diagnosis_rule
  "Diagnose probable joint problem from leg symptom screen"
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
  (and (clinical_finding (snomed_concept "Pain in buttock" "finding"))
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
  (clinical_finding (snomed_concept "Intermittent claudication" "finding"))
)
(system_diagnosis_rule
  "Diagnose probable heart failure (bilateral leg swelling)"
  (diagnosis
    (snomed_concept "Heart failure" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Swelling of bilateral lower limbs" "finding"))
       (clinical_finding (snomed_concept "Orthopnea" "finding")))
)
(system_diagnosis_rule
  "Diagnose probable sprain of lower limb (swollen joint after injury)"
  (diagnosis
    (snomed_concept "Sprain of ligament of lower limb" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Joint swelling" "finding"))
       (clinical_finding (snomed_concept "Injury of lower limb" "disorder")))
)
(system_diagnosis_rule
  "Diagnose probable strain of lower limb (swollen joint after injury)"
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
           (active_condition (snomed_concept "Deep venous thrombosis of lower extremity" "disorder"))
           (active_condition (snomed_concept "Acute lower limb ischemia" "disorder"))
           (active_condition (snomed_concept "Critical lower limb ischemia" "disorder"))))
)

;; Page 80 - Leg symptoms
;; See 80-leg-symptoms-flowchart.md for the decision nodes behind each rule.
(task
  "Check for urgent leg symptom conditions"
  adult
  (clinical_finding (snomed_concept "Finding of lower limb" "finding"))
  (check_for
    ;; Fracture: unable to bear weight following injury
    (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))
    (clinical_finding (snomed_concept "Injury of lower limb" "disorder"))

    ;; DVT: swelling and pain in one calf
    (clinical_finding (snomed_concept "Swollen calf" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Pain in calf" "finding"))

    ;; Acute limb ischaemia: sudden severe leg pain at rest with numbness, weakness, pallor or no pulse in the leg
    (clinical_finding (snomed_concept "Pain in lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "At rest" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding"))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))
    (clinical_finding (snomed_concept "White discoloration of skin" "finding") (finding_site (snomed_concept "Skin structure of lower limb" "body structure")))
    (clinical_finding (snomed_concept "Absent pulse" "finding") (finding_site (snomed_concept "Lower limb structure" "body structure")))

    ;; Critical limb ischaemia: muscle pain on exercise with pain at rest, ulcer or gangrene
    (clinical_finding (snomed_concept "Intermittent claudication" "finding"))
    (clinical_finding (snomed_concept "Pain in lower limb" "finding") (qualifier (snomed_concept "At rest" "qualifier value")))
    (clinical_finding (snomed_concept "Ulcer of lower extremity" "disorder"))
    (clinical_finding (snomed_concept "Gangrenous disorder" "disorder") (finding_site (snomed_concept "Lower limb structure" "body structure")))
  )
)
(task
  "Check leg symptoms not needing urgent attention"
  adult
  (clinical_finding (snomed_concept "Finding of lower limb" "finding"))
  (check_for
    ;; Screen for joint problem
    (clinical_finding (snomed_concept "Joint warm" "finding"))
    (clinical_finding (snomed_concept "Tenderness of joint" "finding"))
    (clinical_finding (snomed_concept "Joint swelling" "finding"))
    (clinical_finding (snomed_concept "Difficulty walking" "finding"))
    (clinical_finding (snomed_concept "Difficulty standing up" "finding"))

    ;; Is there leg swelling?
    (clinical_finding (snomed_concept "Swelling of lower limb" "finding"))
    (clinical_finding (snomed_concept "Swelling of bilateral lower limbs" "finding"))
    (clinical_finding (snomed_concept "Orthopnea" "finding"))

    ;; No leg swelling: ask about leg pain/discomfort
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
  ;; Red box: unable to bear weight following injury
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
  ;; Red box: swelling and pain in one calf. The "especially if" risk factors are not required.
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
  ;; Red box: sudden severe leg pain at rest with any of numbness, weakness, pallor, no pulse in the leg
  (and (clinical_finding (snomed_concept "Pain in lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "At rest" "qualifier value")))
       (or (clinical_finding (snomed_concept "Numbness of lower limb" "finding"))
           (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))
           (clinical_finding (snomed_concept "White discoloration of skin" "finding") (finding_site (snomed_concept "Skin structure of lower limb" "body structure")))
           (clinical_finding (snomed_concept "Absent pulse" "finding") (finding_site (snomed_concept "Lower limb structure" "body structure")))))
)
(system_diagnosis_rule
  "Diagnose probable critical limb ischaemia (leg symptoms)"
  (diagnosis
    (snomed_concept "Critical lower limb ischemia" "disorder")
    probable
  )
  adult
  ;; Red box: muscle pain in legs or buttocks on exercise associated with pain at rest, ulcer or gangrene
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
  ;; Screen: joint warm/tender/swollen or unable to walk, sit and stand up comfortably
  (or (clinical_finding (snomed_concept "Joint warm" "finding"))
      (clinical_finding (snomed_concept "Tenderness of joint" "finding"))
      (clinical_finding (snomed_concept "Joint swelling" "finding"))
      (clinical_finding (snomed_concept "Difficulty walking" "finding"))
      (clinical_finding (snomed_concept "Difficulty standing up" "finding")))
)
(system_diagnosis_rule
  "Diagnose probable sciatic nerve irritation (leg symptoms)"
  (diagnosis
    (snomed_concept "Sciatica" "disorder")
    probable
  )
  adult
  ;; Q1 = No (no leg swelling) → pain in buttock radiating down back of lower leg
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
  ;; Q1 = No (no leg swelling) → muscle pain in legs or buttocks on exercise that is relieved by rest
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
  ;; Q1 = Yes → both legs swollen → Q2 = Yes: difficulty breathing worse on lying flat
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
  ;; Q1 = Yes → swelling over one joint → Q3 = Yes: recent injury
  (and (clinical_finding (snomed_concept "Joint swelling" "finding"))
       (clinical_finding (snomed_concept "Injury of lower limb" "disorder")))
)
(system_priority_evaluation
  "Urgent: leg symptoms with fracture, DVT or limb ischaemia"
  adult
  Urgent
  (and (clinical_finding (snomed_concept "Finding of lower limb" "finding"))
       (or (active_condition (snomed_concept "Fracture of lower limb" "disorder"))
           (active_condition (snomed_concept "Deep venous thrombosis" "disorder"))
           (active_condition (snomed_concept "Acute lower limb ischemia" "disorder"))
           (active_condition (snomed_concept "Critical lower limb ischemia" "disorder"))))
)

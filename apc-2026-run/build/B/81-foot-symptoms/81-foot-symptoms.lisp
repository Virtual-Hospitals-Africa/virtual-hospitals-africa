;; Page 81 - Foot symptoms
(task
  "Check for urgent foot symptom conditions"
  adult
  (clinical_finding (snomed_concept "Finding of foot region" "finding"))
  (check_for
    ;; Unable to bear weight following injury: fracture likely
    (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))
    (clinical_finding (snomed_concept "Injury of lower limb" "disorder"))

    ;; Sudden severe foot pain at rest with numbness, weakness, pallor or no pulse in the leg: acute limb ischaemia likely
    (clinical_finding (snomed_concept "Foot pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Pain provoked by rest" "finding") (finding_site (snomed_concept "Foot structure" "body structure")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding"))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))
    (clinical_finding (snomed_concept "White discoloration of skin" "finding") (finding_site (snomed_concept "Lower limb structure" "body structure")))
    (clinical_finding (snomed_concept "Foot pulse absent" "finding"))

    ;; Muscle pain in legs or buttocks on exercise with foot pain at rest, ulcer or gangrene: critical limb ischaemia likely
    (clinical_finding (snomed_concept "Intermittent claudication" "finding"))
    (clinical_finding (snomed_concept "Ulcer of foot" "disorder"))
    (clinical_finding (snomed_concept "Gangrene of foot" "disorder"))
  )
)
(task
  "Check for causes of foot symptoms not needing urgent attention"
  adult
  (clinical_finding (snomed_concept "Finding of foot region" "finding"))
  (check_for
    ;; Tinea pedis: cracks/peeling/scaly lesions between toes, scaly skin on soles/heels/sides of feet
    (clinical_finding (snomed_concept "Fissure in skin" "disorder") (finding_site (snomed_concept "Structure of interdigital space of foot" "body structure")))
    (clinical_finding (snomed_concept "Peeling of skin" "finding") (finding_site (snomed_concept "Structure of interdigital space of foot" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Structure of interdigital space of foot" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Skin structure of sole of foot" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Heel structure" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Skin structure of lateral border of foot" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Skin structure of medial border of foot" "body structure")))

    ;; Generalised foot pain
    (clinical_finding (snomed_concept "Foot pain" "finding") (qualifier (snomed_concept "Generalized" "qualifier value")))
    (clinical_finding (snomed_concept "Burning pain" "finding") (finding_site (snomed_concept "Foot structure" "body structure")))
    (clinical_finding (snomed_concept "Pins and needles" "finding") (finding_site (snomed_concept "Foot structure" "body structure")))
    (clinical_finding (snomed_concept "Numbness of foot" "finding"))
    (clinical_finding (snomed_concept "Muscle pain" "finding") (finding_site (snomed_concept "Lower limb structure" "body structure")))
    (clinical_finding (snomed_concept "Muscle pain" "finding") (finding_site (snomed_concept "Buttock structure" "body structure")))

    ;; Localised pain
    (clinical_finding (snomed_concept "Heel pain" "finding"))
    (clinical_finding (snomed_concept "Pain provoked by walking" "finding"))
    (clinical_finding (snomed_concept "Deformity of foot" "finding"))
    (clinical_finding (snomed_concept "Bony swelling of toe joint" "finding") (finding_site (snomed_concept "First metatarsophalangeal joint structure" "body structure")))
  )
)
(system_diagnosis_rule
  "Diagnose probable fracture with foot symptoms"
  (diagnosis
    (snomed_concept "Fracture of bone" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Finding of foot region" "finding"))
       (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))
       (clinical_finding (snomed_concept "Injury of lower limb" "disorder")))
)
(system_diagnosis_rule
  "Diagnose probable acute lower limb ischaemia with foot symptoms"
  (diagnosis
    (snomed_concept "Acute lower limb ischemia" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Foot pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
       (clinical_finding (snomed_concept "Pain provoked by rest" "finding") (finding_site (snomed_concept "Foot structure" "body structure")))
       (or (clinical_finding (snomed_concept "Numbness of lower limb" "finding"))
           (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))
           (clinical_finding (snomed_concept "White discoloration of skin" "finding") (finding_site (snomed_concept "Lower limb structure" "body structure")))
           (clinical_finding (snomed_concept "Foot pulse absent" "finding"))))
)
(system_diagnosis_rule
  "Diagnose probable critical lower limb ischaemia with foot symptoms"
  (diagnosis
    (snomed_concept "Critical lower limb ischemia" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Intermittent claudication" "finding"))
       (or (clinical_finding (snomed_concept "Pain provoked by rest" "finding") (finding_site (snomed_concept "Foot structure" "body structure")))
           (clinical_finding (snomed_concept "Ulcer of foot" "disorder"))
           (clinical_finding (snomed_concept "Gangrene of foot" "disorder"))))
)
(system_diagnosis_rule
  "Diagnose probable tinea pedis from foot skin changes"
  (diagnosis
    (snomed_concept "Tinea pedis" "disorder")
    probable
  )
  adult
  (or (clinical_finding (snomed_concept "Fissure in skin" "disorder") (finding_site (snomed_concept "Structure of interdigital space of foot" "body structure")))
      (clinical_finding (snomed_concept "Peeling of skin" "finding") (finding_site (snomed_concept "Structure of interdigital space of foot" "body structure")))
      (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Structure of interdigital space of foot" "body structure")))
      (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Skin structure of sole of foot" "body structure")))
      (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Heel structure" "body structure")))
      (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Skin structure of lateral border of foot" "body structure")))
      (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Skin structure of medial border of foot" "body structure"))))
)
(system_diagnosis_rule
  "Diagnose probable peripheral neuropathy from foot symptoms"
  (diagnosis
    (snomed_concept "Peripheral nerve disease" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Foot pain" "finding") (qualifier (snomed_concept "Generalized" "qualifier value")))
       (or (clinical_finding (snomed_concept "Burning pain" "finding") (finding_site (snomed_concept "Foot structure" "body structure")))
           (clinical_finding (snomed_concept "Pins and needles" "finding") (finding_site (snomed_concept "Foot structure" "body structure")))
           (clinical_finding (snomed_concept "Numbness of foot" "finding"))))
)
(system_diagnosis_rule
  "Diagnose probable peripheral vascular disease from foot symptoms"
  (diagnosis
    (snomed_concept "Peripheral vascular disease" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Foot pain" "finding") (qualifier (snomed_concept "Generalized" "qualifier value")))
       (or (clinical_finding (snomed_concept "Muscle pain" "finding") (finding_site (snomed_concept "Lower limb structure" "body structure")))
           (clinical_finding (snomed_concept "Muscle pain" "finding") (finding_site (snomed_concept "Buttock structure" "body structure")))))
)
(system_diagnosis_rule
  "Diagnose probable plantar fasciitis from heel pain"
  (diagnosis
    (snomed_concept "Plantar fasciitis" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Heel pain" "finding"))
       (clinical_finding (snomed_concept "Pain provoked by walking" "finding")))
)
(system_diagnosis_rule
  "Diagnose probable bunion from foot deformity"
  (diagnosis
    (snomed_concept "Swelling of first metatarsophalangeal joint of hallux" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Deformity of foot" "finding"))
       (clinical_finding (snomed_concept "Bony swelling of toe joint" "finding") (finding_site (snomed_concept "First metatarsophalangeal joint structure" "body structure"))))
)
(system_priority_evaluation
  "Urgent: foot symptoms with fracture or limb ischaemia"
  adult
  Urgent
  (and (clinical_finding (snomed_concept "Finding of foot region" "finding"))
       (or (active_condition (snomed_concept "Fracture of bone" "disorder"))
           (active_condition (snomed_concept "Acute lower limb ischemia" "disorder"))
           (active_condition (snomed_concept "Critical lower limb ischemia" "disorder"))))
)

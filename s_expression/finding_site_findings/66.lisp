;; Foot symptoms ⇢ 66
(finding_site_findings
  "Foot"
  (finding_site_structure (snomed_concept "Foot structure" "body structure"))
  (excluding_structures
    (snomed_concept "Nail unit structure" "body structure")
  )
  (clinical_findings
    (clinical_finding (snomed_concept "Foot pain" "finding"))
    (clinical_finding (snomed_concept "Foot pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))
    (clinical_finding (snomed_concept "Injury of lower limb" "disorder"))
    ;; Numbness, weakness, pallor, no pulse in the leg
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding"))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))
    (clinical_finding (snomed_concept "Pale complexion" "finding"))
    (clinical_finding (snomed_concept "Peripheral pulse absent" "finding"))
    (clinical_finding (snomed_concept "Absent pulse" "finding") (finding_site (snomed_concept "Lower limb structure" "body structure")))
    ;; Muscle pain in legs or buttocks on exercise with foot pain at rest, ulcer or gangrene
    (clinical_finding (snomed_concept "Intermittent claudication" "finding"))
    (clinical_finding (snomed_concept "Intermittent claudication" "finding") (finding_site (snomed_concept "Buttock structure" "body structure")))
    (clinical_finding (snomed_concept "Ulcer of foot" "disorder"))
    (clinical_finding (snomed_concept "Gangrene of foot" "disorder"))
    ;; Cracks/peeling/scaly lesions between toes, thickened scaly skin on soles/heels
    (clinical_finding (snomed_concept "Peeling of skin" "finding") (finding_site (snomed_concept "Foot structure" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Foot structure" "body structure")))
    ;; Constant burning pain, pins/needles or numbness of feet worse at night
    (clinical_finding (snomed_concept "Burning feet" "finding"))
    (clinical_finding (snomed_concept "Paresthesia of foot" "finding"))
    (clinical_finding (snomed_concept "Numbness of foot" "finding"))
    ;; Heel pain worse on starting walking; foot deformity, bony lump at base of big toe
    (clinical_finding (snomed_concept "Heel pain" "finding"))
    (clinical_finding (snomed_concept "Deformity of foot" "finding"))
    (clinical_finding (snomed_concept "Hallux valgus AND bunion" "disorder"))
    (clinical_finding (snomed_concept "Callosity" "disorder"))
    ;; The foot at risk in the patient with diabetes or peripheral vascular disease
    (clinical_finding (snomed_concept "Blister of skin" "disorder") (finding_site (snomed_concept "Foot structure" "body structure")))
    (clinical_finding (snomed_concept "Abnormal sensation" "finding") (finding_site (snomed_concept "Foot structure" "body structure")))
  )
)

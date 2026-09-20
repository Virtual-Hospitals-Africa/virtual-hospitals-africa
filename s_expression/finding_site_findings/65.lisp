;; Leg symptoms ⇢ 65
(finding_site_findings
  "Leg"
  (finding_site_structure (snomed_concept "Lower limb structure" "body structure"))
  (excluding_structures
    (snomed_concept "Foot structure" "body structure")
  )
  (clinical_findings
    (clinical_finding (snomed_concept "Pain in lower limb" "finding"))
    (clinical_finding (snomed_concept "Pain in lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    ;; Swelling and pain in one calf
    (clinical_finding (snomed_concept "Pain in calf" "finding"))
    (clinical_finding (snomed_concept "Pain in calf" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Swollen calf" "finding"))
    (clinical_finding (snomed_concept "Swollen calf" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Lower limb structure" "body structure")))
    ;; Numbness, weakness, pallor, no pulse
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
    (clinical_finding (snomed_concept "Pale complexion" "finding"))
    (clinical_finding (snomed_concept "Peripheral pulse absent" "finding"))
    (clinical_finding (snomed_concept "Absent pulse" "finding"))
    ;; Muscle pain in legs or buttocks on exercise, with rest pain, gangrene or ulceration
    (clinical_finding (snomed_concept "Intermittent claudication" "finding"))
    (clinical_finding (snomed_concept "Intermittent claudication" "finding") (finding_site (snomed_concept "Buttock structure" "body structure")))
    (clinical_finding (snomed_concept "Gangrene" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Ulcer" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))
    (clinical_finding (snomed_concept "Injury of lower limb" "disorder"))
    ;; Both legs swollen: difficulty breathing worse on lying flat, or kidney disease on dipstick
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Proteinuria" "finding"))
    ;; Pain in buttock radiating down back of lower leg
    (clinical_finding (snomed_concept "Sciatica" "disorder"))
    (clinical_finding (snomed_concept "Cramp" "finding"))
    ;; Retention or incontinence of urine or stool; numbness of buttocks or perineum
    (clinical_finding (snomed_concept "Retention of urine" "disorder"))
    (clinical_finding (snomed_concept "Urinary incontinence" "finding"))
    (clinical_finding (snomed_concept "Incontinence of feces" "finding"))
    (clinical_finding (snomed_concept "Numbness" "finding") (finding_site (snomed_concept "Buttock structure" "body structure")))
    (clinical_finding (snomed_concept "Difficulty walking" "finding"))
    ;; Check skin: painful areas, ulcer/s, lump/s or changes in skin colour; groin lump
    (clinical_finding (snomed_concept "Skin ulcer" "disorder"))
    (clinical_finding (snomed_concept "Skin lesion" "disorder"))
    (clinical_finding (snomed_concept "Groin mass" "finding"))
  )
)

;; Page 21 - Burns
(task
  "Check for urgent burn conditions"
  adult
  (clinical_finding (snomed_concept "Burn" "disorder"))
  (check_for
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Electrical burn" "disorder"))
    (clinical_finding (snomed_concept "Chemical burn" "disorder"))
    (clinical_finding (snomed_concept “White discoloration of skin” (finding))
		(clinical_finding (snomed_concept “Gray skin” (finding))
		(clinical_finding (snomed_concept “Painless” (qualifier value)) 
		(clinical_finding (snomed_concept “Xeroderma” (disorder))
    (clinical_finding (snomed_concept "Burn injury with charring" "morphologic abnormality"))
    (clinical_finding (snomed_concept “Pink skin” (finding))
		(clinical_finding (snomed_concept “Redness of skin over lesion” (finding))
		(clinical_finding (snomed_concept “Pain” (finding))
		(clinical_finding (snomed_concept “Skin-ache syndrome” (finding))
		(clinical_finding (snomed_concept “Blister” (morphologic abnormality))
		(clinical_finding (snomed_concept “Moist skin”(finding))
		(clinical_finding (snomed_concept “Burn of neck” (disorder))
		(clinical_finding (snomed_concept “Burn of face” (disorder))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Hoarse" "finding"))
    (clinical_finding (snomed_concept "Stridor" "finding"))
    (clinical_finding (snomed_concept “Finding of color of sputum” (finding) “Black color” (qualifier value))
		(clinical_finding (snomed_concept “Brown sputum” (finding))
		(clinical_finding (snomed_concept “Gray sputum” (finding)) 
  	(clinical_finding (snomed_concept “Burn of chest wall” (disorder) "Circumferential" "qualifier value")))
    (clinical_finding (snomed_concept “Burn of lower limb” (disorder) “Circumferential” (qualifier value))
		(clinical_finding (snomed_concept “Burn of upper limb (disorder) “Circumferential” (qualifier value))
    (clinical_finding (snomed_concept “Burn of hand” (disorder))
    (clinical_finding (snomed_concept “Burn of foot” (disorder))
    (clinical_finding (snomed_concept “Burn of genitalia” (disorder))
    (clinical_finding (snomed_concept “Burn” (disorder) “Joint structure of limb” (body structure))
		(<measurement (clinical_finding (snomed_concept “Hemoglobin saturation with oxygen” (observable entity) “Percent” (property) (qualifier value) 94))
    (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
  	)
  )
)









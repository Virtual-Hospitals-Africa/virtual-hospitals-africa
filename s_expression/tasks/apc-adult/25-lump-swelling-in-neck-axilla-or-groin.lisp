;; Page 25 - Lump/Swelling in Neck, Axilla or Groin
(task
  "Check for urgent groin lump conditions"
  adult
  (clinical_finding (snomed_concept "Groin mass" "finding"))
  (check_for
		(clinical_finding (snomed_concept “Groin mass” (finding))
		(clinical_finding (snomed_concept “Standing up” (observable entity) “Increased size” (finding))
		(clinical_finding (snomed_concept “Coughing” (observable entity) “Increased size” (finding))
		(clinical_finding (snomed_concept “Defecation” (observable entity) “Increased size” (finding))
    (clinical_finding (snomed_concept "Severe pain" "finding"))
    (clinical_finding (snomed_concept “Vomiting” (disorder))
    (<= (timestamp (clinical_finding (snomed_concept "Unable to break wind" "finding")))
        (time_ago 24 hours))
    (<= (timestamp (clinical_finding (snomed_concept "Acute constipation" "finding")))
        (time_ago 24 hours))
    (clinical_finding (snomed_concept "Irreducible hernia" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))
    (clinical_finding (snomed_concept "Groin mass" "finding") (qualifier (snomed_concept "Pulsatile" "qualifier value")))
  )
)
;; Page 25 - Lump/Swelling in Neck, Axilla or Groin
(task
  "Check for urgent neck/axilla lump conditions"
  adult
  (clinical_finding (snomed_concept "Mass of neck" "finding"))
	(clinical_finding (snomed_concept "Mass of axilla" "finding"))
  (check_for 
(clinical_finding (snomed_concept "Mass of neck" "finding") "Pulsatile" "qualifier value"))
	(clinical_finding (snomed_concept "Mass of axilla" "finding") "Pulsatile" "qualifier value"))
 	)
)
	
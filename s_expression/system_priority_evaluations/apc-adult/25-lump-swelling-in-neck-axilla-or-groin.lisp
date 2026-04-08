;; Page 25 - Lump/Swelling in Neck, Axilla or Groin
(system_priority_evaluation
  "Urgent: groin mass with obstruction or vascular signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Groin mass" "finding"))
    (or
      (clinical_finding (snomed_concept “Groin mass” (finding))
			(clinical_finding (snomed_concept “Standing up” (observable entity) “Increased size” (finding))
			(clinical_finding (snomed_concept “Coughing” (observable entity) “Increased size” (finding))
			(clinical_finding (snomed_concept “Defecation” (observable entity) “Increased size” (finding))
			ANY
      (clinical_finding (snomed_concept "Severe pain" "finding"))
      (clinical_finding (snomed_concept “Vomiting” (disorder))
			(clinical_finding (snomed_concept “Constipation” (finding) “hour” (qualifier value) 24))
      (clinical_finding (snomed_concept "Unable to break wind" "finding") “hour” (qualifier value) 24))
			(clinical_finding (snomed_concept “Irreducible hernia” (morphologic abnormality))
			(clinical_finding (snomed_concept “Groin mass” (finding)) Pulsatile” (qualifier value))
		)
	)
)
;; Page 25 - Lump/Swelling in Neck, Axilla or Groin
(system_priority_evaluation
  "Urgent: neck or axilla mass with obstruction or vascular signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept “Mass of neck” (finding))
		(clinical_finding (snomed_concept “Mass of axilla” (finding)
    (or
			(clinical_finding (snomed_concept “Mass of neck” (finding) Pulsatile” (qualifier value))
			OR
			(clinical_finding (snomed_concept “Mass of axilla” (finding) Pulsatile” (qualifier value))
	)
)

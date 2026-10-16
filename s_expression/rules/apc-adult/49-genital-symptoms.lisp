;;Page 49 - Genital symptoms 
(system_diagnosis_rule
  "Diagnose probable genital warts"
  (diagnosis
    (snomed_concept “Genital warts” "disorder")
    probable
  )
  adult
  (and
			(clinical_finding (snomed_concept “Skin nodule” (disorder) “Atypical” (qualifier value))
			(clinical_finding (snomed_concept “Skin nodule” (disorder) “Wet” (qualifier value))
		)
	)
;;Page 49 - Genital symptoms 
(system_diagnosis_rule
  "Diagnose probable secondary syphilis"
  (diagnosis
    (snomed_concept “Secondary syphilis” "disorder")
    probable
  )
  adult
  (and
			(clinical_finding (snomed_concept “Ulcer” (disorder) “After” (attribute) week) 6-8))
			(clinical_finding (snomed_concept “Generalized rash” (disorder))
				(clinical_finding (snomed_concept “Including” (qualifier value) “Palm (region) structure” (body structure))
				(clinical_finding (snomed_concept “Including” (qualifier value) “Structure of sole of foot” (body structure))
			(clinical_finding (snomed_concept “Influenza-like illness” (finding))
			(clinical_finding (snomed_concept “Plane wart” (disorder))
			(clinical_finding (snomed_concept “Ulcer of mouth” (disorder))
			(clinical_finding (snomed_concept “Alopecia areata” (disorder))
		)
	)
;;Page 49 - Genital symptoms 
(system_diagnosis_rule
  "Diagnose probable tertiary syphilis"
  (diagnosis
    (snomed_concept “Late syphilis” (disorder))
    probable
  )
  adult
  (and
		(> (snomed_concept “After” (attribute) year) 1))
		(clinical_finding (snomed_concept “Late syphilis of skin” (disorder))
		or
		(clinical_finding (snomed_concept “Skin finding” (finding))
		)
		(clinical_finding (snomed_concept “Syphilis of bone” (disorder))
		or
		(clinical_finding (snomed_concept “Bone finding” (finding))
		)
		(clinical_finding (snomed_concept “Cardiovascular syphilis” (disorder))
		or
		(clinical_finding (snomed_concept “Cardiac finding” (finding))
		)
		(clinical_finding (snomed_concept “Neurosyphilis” (disorder))
		or
		(clinical_finding (snomed_concept “Neurological finding” (finding))
		)
	)
)

 
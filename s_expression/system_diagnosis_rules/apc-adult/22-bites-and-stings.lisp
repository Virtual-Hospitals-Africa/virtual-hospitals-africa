;; Page 22 - Bites and Stings
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Prurigo simplex" "disorder")
    probable
  )
  adult
  (or
		(clinical_finding (snomed_concept “Prurigo simplex” (disorder))
		(clinical_finding (snomed_concept “Hypersensitivity finding” (finding) “Bite of insect” (event))
		(clinical_finding (snomed_concept “Papule” (morphologic abnormality) “Red color” (qualifier value) “Into” (attribute) “Blister” (morphologic abnormality))
		(clinical_finding (snomed_concept “Structure resulting from tissue repair process” (morphologic abnormality) “Hyperpigmentation” (morphologic abnormality))
	)
)

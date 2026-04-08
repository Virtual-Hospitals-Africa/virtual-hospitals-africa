;; Page 26 - Weakness or tiredness
(system_diagnosis_rule
  "Heart failure likely"
  (diagnosis
  (snomed_concept "Heart failure" "disorder")
  (probable
	(adult
		(clinical_finding ( snomed_concept “Asthenia” (finding))
		(clinical_finding ( snomed_concept “Muscle fatigue” (finding)
		(clinical_finding ( snomed_concept “Difficulty breathing” (finding))
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept ""Swelling of lower limb” (finding))
		(clinical_finding ( snomed_concept “Cough” (finding))
		(clinical_finding ( snomed_concept “Wheezing” (finding))
		(clinical_finding ( snomed_concept “Tight chest” (finding))
		)
  )
)
;; Page 26 - Weakness or tiredness
(system_diagnosis_rule
  "Stroke or TIA likely"
  (diagnosis
  (clinical_finding ( snomed_concept “Cerebrovascular accident” (disorder))
	(clinical_finding ( snomed_concept “Transient ischemic attack” (disorder))   
	(probable
  (adult
		(clinical_finding ( snomed_concept “Weakness of face muscles” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		(clinical_finding ( snomed_concept “Numbness of face” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		(clinical_finding ( snomed_concept “Muscle weakness of upper limb” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		(clinical_finding ( snomed_concept “Numbness of upper limb” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		(clinical_finding ( snomed_concept “Weakness of muscle of lower limb” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		(clinical_finding ( snomed_concept “Numbness of lower limb” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
		(clinical_finding ( snomed_concept “Difficulty talking” (finding))
		(clinical_finding ( snomed_concept “Visual disturbance” (disorder))
		)
	)
)
;; Page 26 - Weakness or tiredness
(system_diagnosis_rule
  "Weakness or tiredness likely"
  (consult   
	(clinical_finding ( snomed_concept “Asthenia” (finding))
	(clinical_finding ( snomed_concept “Weakness" (finding)
	AND
	(clinical_finding ( snomed_concept “Consultation” (procedure) “Medical practitioner” (occupation)
	(clinical_finding ( snomed_concept “Review of medication” (procedure))
  (probable
  (adult
		(clinical_finding ( snomed_concept “Abacavir” (substance))
		(clinical_finding ( snomed_concept “Zidovudine” (substance))
		(clinical_finding ( snomed_concept “Chlorphenamine” (substance))
		(clinical_finding ( snomed_concept “Enalapril” (substance))
		(clinical_finding ( snomed_concept “Amlodipine” (substance))
		(clinical_finding ( snomed_concept “Fluoxetine” (substance))
		(clinical_finding ( snomed_concept “Amitriptyline” (substance))
		(clinical_finding ( snomed_concept “Metoclopramide” (substance))
		(clinical_finding ( snomed_concept “Sodium valproate” (substance))
		(clinical_finding ( snomed_concept “Phenytoin” (substance))
		(clinical_finding ( snomed_concept “Spironolactone” (substance))
		)
	)
)
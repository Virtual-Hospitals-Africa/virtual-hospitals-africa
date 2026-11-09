;;Page 60 - Body or General Pain
“Joint problem likely” 
(system_diagnosis_rule
  "Diagnose probable joint problem"
  (diagnosis
    (snomed_concept "Joint finding” (finding))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Muscle pain” (finding))
		(clinical_finding (snomed_concept “Cramp” (finding))
		(clinical_finding (snomed_concept “Muscle weakness” (finding))
	)
;;Page 60 - Body or General Pain
“Joint problem likely” 
(system_diagnosis_rule
  "Diagnose probable joint problem"
  (diagnosis
	(consult
	(referral
    (snomed_concept "Joint finding” (finding))
		(snomed_concept “Consultation (procedure) or
		(snomed_concept “Patient referral” (procedure))
  )
  adult
  (and
		(snomed_concept “Referral to doctor” (procedure)) or
		(snomed_concept “Patient referral to specialist” (procedure))
		(clinical_finding (snomed_concept “Review of medication” (procedure))
		(clinical_finding (snomed_concept “Simvastatin” (substance))
	)
)
;;Page 60 - Body or General Pain
“Fibromyalgia likely” 
(system_diagnosis_rule
  "Diagnose probable fibromyalgia"
  (diagnosis
    (snomed_concept “Fibromyalgia” (disorder))
    probable
  )
  adult
  (and
		(>=(clinical_finding (snomed_concept “Generalized aches and pains” (finding) week) 4))
		(clinical_finding (snomed_concept “Blood substance level within reference range” (finding))
	)
)
;;Page 60 - Body or General Pain
“Thyroid disease likely” 
(system_diagnosis_rule
  "Diagnose probable thyroid disease"
  (diagnosis
    (snomed_concept “Disorder of thyroid gland” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Asthenia” (finding))
		(clinical_finding (snomed_concept “Fatigue” (finding))
		(clinical_finding (snomed_concept “Weight increased” (finding))
		(clinical_finding (snomed_concept “Depressed mood” (finding))
		(clinical_finding (snomed_concept “Xeroderma” (disorder))
		(clinical_finding (snomed_concept “Constipation” (finding))
		(clinical_finding (snomed_concept “Intolerant of cold” (finding))
	)
)
 ;;Page 60 - Body or General Pain
“Influenza or COVID-19 likely” 
(system_diagnosis_rule
  "Diagnose probable influenza or COVID-19"
  (diagnosis
    (snomed_concept “Influenza” (disorder))
		(snomed_concept “Disease caused by severe acute respiratory syndrome coronavirus 2” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Generalized aches and pains” (finding) “Recent” (qualifier value) “Onset of” (contextual qualifier) (qualifier value))
		(clinical_finding (snomed_concept “Headache” (finding))
		(clinical_finding (snomed_concept “Fever” (finding))
		(clinical_finding (snomed_concept “Nausea” (finding))
		(clinical_finding (snomed_concept “Vomiting” (disorder))
		(clinical_finding (snomed_concept “Fever with chills” (finding))
	)
)
;;Page 60 - Body or General Pain
“Meningitis likely” 
(system_diagnosis_rule
  "Diagnose probable meningitis"
  (diagnosis
    (snomed_concept "Meningitis” (disorder))
    probable
  )
  adult
  (and 
		(clinical_finding (snomed_concept “Generalized aches and pains” (finding) “Recent” (qualifier value) “Onset of” (contextual qualifier) (qualifier value))
		(clinical_finding (snomed_concept “Headache” (finding))
		(clinical_finding (snomed_concept “Fever” (finding))
		(clinical_finding (snomed_concept “Nausea” (finding))
		(clinical_finding (snomed_concept “Vomiting” (disorder))
		(clinical_finding (snomed_concept “Stiff neck” (finding))
		(clinical_finding (snomed_concept “Drowsy” (finding))
		(clinical_finding (snomed_concept “Clouded consciousness” (finding))
		(clinical_finding (snomed_concept “Purpuric rash” (disorder))
		(clinical_finding (snomed_concept “Erythematous rash” (disorder))
	)
)
;;Page 60 - Body or General Pain
“Sinusitis likely” 
(system_diagnosis_rule
  "Diagnose probable sinusitis"
  (diagnosis
    (snomed_concept "Sinusitis” (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Generalized aches and pains” (finding) “Recent” (qualifier value) “Onset of” (contextual qualifier) (qualifier value))
		(clinical_finding (snomed_concept “Headache” (finding))
		(clinical_finding (snomed_concept “Fever” (finding))
		(clinical_finding (snomed_concept “Nausea” (finding))
		(clinical_finding (snomed_concept “Vomiting” (disorder))
		(clinical_finding (snomed_concept “Maxillary sinus pain” (finding))
		)
	)
)
;; Page 53 - Positive Syphilis Result 
“Early syphilis likely” 
(system_diagnosis_rule
  "Diagnose probable early syphilis"
  (diagnosis
    (snomed_concept "Early symptomatic syphilis" "disorder")
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Rapid plasma reagin test” (procedure) “Reactive” (qualifier value))
		(clinical_finding (snomed_concept “Syphilis titer detected” (finding))
		(clinical_finding (snomed_concept “Rapid plasma reagin test” (procedure) “Negative” (qualifier value) “In the past” (qualifier value) year) 2))
		(clinical_finding (snomed_concept “Secondary syphilis” (disorder))
	)
)
;; Page 53 - Positive Syphilis Result 
“Late syphilis likely” 
(system_diagnosis_rule
  "Diagnose probable late syphilis"
  (diagnosis
    (snomed_concept "Late syphilis" "disorder")
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Rapid plasma reagin test” (procedure) “Reactive” (qualifier value))
		(clinical_finding (snomed_concept “Secondary syphilis” (disorder) “No” (qualifier value))
		(clinical_finding (snomed_concept “Ulcer of genital organ” (disorder) “No” (qualifier value))
		(clinical_finding (snomed_concept “Rapid plasma reagin test” (procedure) “Positive” (qualifier value) “In the past” (qualifier value) year) 2))
		)
	)
)

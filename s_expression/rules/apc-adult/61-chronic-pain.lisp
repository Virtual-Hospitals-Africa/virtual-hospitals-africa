;;Page 61 - Chronic Pain
“Cancer pain likely” 
(system_diagnosis_rule
  "Diagnose probable cancer pain"
  (diagnosis
    (snomed_concept "Pain due to neoplastic disease” (finding))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Chronic pain” (finding))
		(clinical_finding (snomed_concept “Neoplastic disease” (disorder))
	)
)
;;Page 61 - Chronic Pain
“Tissue pain likely” 
(system_diagnosis_rule
  "Diagnose probable tissue pain"
  (diagnosis
    (snomed_concept "Somatic pain” (finding))
    probable
  )
  adult
  (and 
		(clinical_finding (snomed_concept “Chronic pain” (finding))
		(clinical_finding (snomed_concept “Musculoskeletal pain” (finding))
		(clinical_finding (snomed_concept “Arthritis” (disorder))
		(clinical_finding (snomed_concept “Pain of joint” (finding))
		(clinical_finding (snomed_concept “Low back pain” (finding))
		(clinical_finding (snomed_concept “Neck pain” (finding) “Lower” (qualifier value))
		(clinical_finding (snomed_concept “Chronic lung disease” (disorder))
	)
)
;;Page 61 - Chronic Pain
“Nerve pain likely” 
(system_diagnosis_rule
  "Diagnose probable nerve pain"
  (diagnosis
    (snomed_concept "Neuralgia” (finding))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Chronic pain” (finding))
		(clinical_finding (snomed_concept “History of herpes zoster” (situation))
		(clinical_finding (snomed_concept “Trigeminal neuralgia” (disorder))
		(clinical_finding (snomed_concept “Peripheral nerve disease” (disorder))
		(clinical_finding (snomed_concept “Neuropathy due to diabetes” mellitus (disorder))
	)
)
;;Page 61 - Chronic Pain
“Central pain likely” 
(system_diagnosis_rule
  "Diagnose probable central pain"
  (diagnosis
    (snomed_concept "Central pain” (finding))
    probable
  )
  adult
  (and 
		(clinical_finding (snomed_concept “Chronic pain” (finding))
		(clinical_finding (snomed_concept “Fibromyalgia” (disorder))
		(clinical_finding (snomed_concept “Irritable bowel syndrome” (disorder))
		)
	)
)

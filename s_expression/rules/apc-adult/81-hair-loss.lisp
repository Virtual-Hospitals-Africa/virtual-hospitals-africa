;; Page 81 - Hair Loss
“Traction alopecia likely”
(system_diagnosis_rule
  "Diagnose probable traction alopecia"
  (diagnosis
    (snomed_concept "Traction alopecia" (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Syphilis titer detected” (finding))
		(clinical_finding (snomed_concept “Treponema pallidum antibody detected by hemagglutination test” (finding))
		(clinical_finding (snomed_concept “Tightness sensation” (finding))
		(clinical_finding (snomed_concept “Wig, device” (physical object))
		(clinical_finding (snomed_concept “Care of hair” (procedure))
		(clinical_finding (snomed_concept “Loss of scalp hair” (finding))
		(clinical_finding (snomed_concept “Abnormal hairline” (finding))
		(clinical_finding (snomed_concept “Hair follicle structure” (body structure) “Structure of adnexal orifice of skin” (body structure) “Visible” (qualifier value))
	)
;; Page 81 - Hair Loss
“Traction alopecia likely”
(system_diagnosis_rule
  "Diagnose probable traction alopecia"
  (diagnosis
	(referral 
    (snomed_concept "Traction alopecia" (disorder))
    (snomed_concept “Patient referral” (procedure))
		(snomed_concept “Referral to counselor” (procedure))
  )
  adult
  (and
		(clinical_finding (snomed_concept “Mental distress” (finding))
	)
)
;; Page 81 - Hair Loss
“Alopecia areata likely”
(system_diagnosis_rule
  "Diagnose probable alopecia areata"
  (diagnosis
    (snomed_concept "Alopecia areata" (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Plaque” (morphologic abnormality) “Well defined” (qualifier value))
		(clinical_finding (snomed_concept “Skin appearance normal” (finding))
		(clinical_finding (snomed_concept “Hair follicle structure” (body structure) “Structure of adnexal orifice of skin” (body structure) “Visible” (qualifier value))
	)
;; Page 81 - Hair Loss
“Alopecia areata likely”
(system_diagnosis_rule
  "Diagnose probable alopecia areata"
  (diagnosis
	(referral 
    (snomed_concept "Alopecia areata" (disorder))
    (snomed_concept “Patient referral” (procedure))
		(snomed_concept “Referral to counselor” (procedure))
  )
  adult
  (and
		(snomed_concept “Patient referral” (procedure))
		(clinical_finding (snomed_concept “Plaque” (morphologic abnormality) “Extensive” (qualifier value))
		(clinical_finding (snomed_concept “Plaque” (morphologic abnormality) “Multiple” (qualifier value))
		(clinical_finding (snomed_concept “Patient condition unchanged” (finding) “After” (attribute) “Treatment given” (situation))
		(clinical_finding (snomed_concept “Recurrent episode” (qualifier value))
		)
		(snomed_concept “Referral to counselor” (procedure))
		(clinical_finding (snomed_concept “Mental distress” (finding))
	)
)
;; Page 81 - Hair Loss
“Female pattern hair loss likely”
(system_diagnosis_rule
  "Diagnose probable female pattern hair loss"
  (diagnosis
    (snomed_concept "Female pattern alopecia" (disorder))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Woman” (person))
		(clinical_finding (snomed_concept “Loss of hair” (finding) “Vertex structure” (body structure)
		(clinical_finding (snomed_concept “Hair follicle structure” (body structure) “Structure of adnexal orifice of skin” (body structure) “Visible” (qualifier value))
	)
;; Page 81 - Hair Loss
“Female pattern hair loss likely”
(system_diagnosis_rule
  "Diagnose probable female pattern hair loss"
  (diagnosis
	(referral 
    (snomed_concept "Female pattern alopecia" (disorder))
    (snomed_concept “Patient referral” (procedure))
		(snomed_concept “Referral to counselor” (procedure))
  )
  adult
  (and
		(snomed_concept “Patient referral” (procedure))
		(clinical_finding (snomed_concept “Abnormal hair growth” (finding) “Face structure” (body structure))
		(clinical_finding (snomed_concept “Abnormal hair growth” (finding) “Body region structure” (body structure))
		(clinical_finding (snomed_concept “Irregular periods” (finding))
		(clinical_finding (snomed_concept “Infertile” (finding))
		(clinical_finding (snomed_concept “Acne” (disorder) “Severe” (severity modifier) (qualifier value))
		(clinical_finding (snomed_concept “Mental distress” (finding) “Mental distress” (finding))
		)
		(snomed_concept “Referral to counselor” (procedure))
		(clinical_finding (snomed_concept “Mental distress” (finding))
	)
)
;; Page 81 - Hair Loss
“Hair loss non-urgent likely”
(system_diagnosis_rule
  "Diagnose probable hair loss non-urgent"
  (diagnosis
	(referral 
    (snomed_concept "Traction alopecia" (disorder))
		(snomed_concept “Loss of hair” (finding) “Non-urgent” (qualifier value))
		(snomed_concept “Patient referral” (procedure))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Syphilis titer not detected” (finding))
		or
		(clinical_finding (snomed_concept “Treponema pallidum antibody not detected by hemagglutination test” (finding))
		)
		(clinical_finding (snomed_concept “Syphilis titer detected” (finding)) 		and 
		(clinical_finding (snomed_concept “Patient condition unchanged” (finding) “After” (attribute) month) 3) “Treatment given” (situation) 
		or
		(clinical_finding (snomed_concept “Treponema pallidum antibody detected by hemagglutination test” (finding)) 
		and 
		(clinical_finding (snomed_concept “Patient condition unchanged” (finding) “After” (attribute) month) 3) “Treatment given” (situation))
	)
)
;; Page 81 - Hair Loss
“Generalised hair loss likely”
(system_diagnosis_rule
  "Diagnose probable generalised hair loss"
  (diagnosis
    (snomed_concept “Loss of hair” (finding) “Generalized” (qualifier value))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Hair follicle structure” (body structure) “Structure of adnexal orifice of skin” (body structure) “Visible” (qualifier value))
		(clinical_finding (snomed_concept “Illness” (finding) “Major” (qualifier value))
		(clinical_finding (snomed_concept “Surgical procedure” (procedure) “Major” (qualifier value))
		(clinical_finding (snomed_concept “Stress” (finding) “Major” (qualifier value))
		(clinical_finding (snomed_concept “Human parturition, function” (observable entity))
		(clinical_finding (snomed_concept “Diet poor” (finding))
		(clinical_finding (snomed_concept “Weight decreased” (finding) “Significant” (qualifier value))
	)
;; Page 81 - Hair Loss
“Generalised hair loss likely”
(system_diagnosis_rule
  "Diagnose probable generalised hair loss"
  (diagnosis
	(consult 
    (snomed_concept “Loss of hair” (finding) “Generalized” (qualifier value))
		(snomed_concept “Consultation” (procedure))
  )
  adult
  (and
		(clinical_finding (snomed_concept “Review of medication” (procedure))
		(clinical_finding (snomed_concept “Sodium valproate” (substance))
		(clinical_finding (snomed_concept “Simvastatin” (substance))
		(clinical_finding (snomed_concept “Uses hormone method of contraception” (finding))
	)
;; Page 81 - Hair Loss
“Generalised hair loss likely”
(system_diagnosis_rule
  "Diagnose probable generalised hair loss"
  (diagnosis
	(referral 
    (snomed_concept “Loss of hair” (finding) “Generalized” (qualifier value))
    (snomed_concept “Patient referral” (procedure))
  )
  adult
  (and
		(clinical_finding (snomed_concept “Unknown” (origin) (qualifier value))
		)
		(clinical_finding (snomed_concept “Woman” (person)
		(clinical_finding (snomed_concept “Abnormal hair growth”(finding) “Face structure” (body structure))
		or
		(clinical_finding (snomed_concept “Abnormal hair growth” (finding) “Body structure” (body structure))
		(clinical_finding (snomed_concept “Irregular periods” (finding))
		(clinical_finding (snomed_concept “Infertile” (finding))
		(clinical_finding (snomed_concept “Acne” (disorder) “Severe” (severity modifier) (qualifier value))
		)
		(clinical_finding (snomed_concept “Loss of hair” (finding) “Persistence” (finding) “After” (attribute) month) 12))
		(clinical_finding (snomed_concept “Patient condition resolved” (finding))
		(clinical_finding (snomed_concept “Patient cured” (finding))
	)
)
;; Page 81 - Hair Loss
“Scarring alopecia likely”
(system_diagnosis_rule
  "Diagnose probable scarring alopecia"
  (diagnosis
	(referral 
    (snomed_concept "Scarring alopecia" (disorder))
		(snomed_concept “Patient referral” (procedure))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Hair follicle structure” (body structure) “Structure of adnexal orifice of skin” (body structure) “Not seen” (qualifier value))
		)
	)
)

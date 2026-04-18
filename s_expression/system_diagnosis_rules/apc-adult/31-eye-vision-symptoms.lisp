;; Page 31 - Eye/vision symptoms
" Orbital cellulitis likely" 
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Orbital cellulitis" "disorder")
    probable
 	  adult
    (clinical_finding (snomed_concept "Swelling of eyelid" "finding") “Entire” (qualifier value))
		(clinical_finding (snomed_concept “Erythema of skin of eyelid” (disorder))
    (clinical_finding (snomed_concept “Pain around eye” (finding))
		)
	) 
;; Page 31 - Eye/vision symptoms
" Orbital cellulitis likely" 
(system_diagnosis_rule
  (referral
    (snomed_concept "Orbital cellulitis" "disorder")
		(and
		(clinical_finding (snomed_concept “Patient referral” (procedure))
 	  adult
			(clinical_finding (snomed_concept “Patient condition unchanged” (finding) “With” (attribute) “Thermotherapy with hot packs” (regime/therapy))
			(clinical_finding (snomed_concept “Trichiasis” (disorder))
			(clinical_finding (snomed_concept “Entropion of eyelid” (disorder))
			(clinical_finding (snomed_concept “Ectropion of eyelid” (disorder))
		)
	)
)
;; Page 31 - Eye/vision symptoms
" Acute glaucoma likely" 
(system_diagnosis_rule
  (diagnosis
   (snomed_concept “Glaucoma” (disorder) “Acute phase” (qualifier value))
   probable
   adult 
  	  (clinical_finding (snomed_concept "Pain in eye" "finding"))
			(clinical_finding (snomed_concept “Red eye” (finding))
      (clinical_finding (snomed_concept "Sees haloes around lights" "finding"))
      (clinical_finding (snomed_concept "Blurring of visual image" "finding"))
			(clinical_finding (snomed_concept “Fixed dilatation of pupil” (finding))
      (clinical_finding (snomed_concept "Headache" "finding"))
      (clinical_finding (snomed_concept “Nausea” (finding))
			(clinical_finding (snomed_concept “Vomiting” (disorder))
    )
  )
)
;; Page 31 - Eye/vision symptoms
" Severe pre-eclampsia likely" 
(system_diagnosis_rule
  (diagnosis
    (snomed_concept “Severe pre-eclampsia” (disorder))
    probable
 	  adult
			(clinical_finding (snomed_concept “Eye symptom” (finding))
			(clinical_finding (snomed_concept “Finding of vision of eye” (finding))
			(clinical_finding (snomed_concept “Pregnancy” (finding))
			(>= measurement (clinical_finding (snomed_concept “Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 140))
			(>= measurement (clinical_finding (snomed_concept “Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 90))
			(clinical_finding (snomed_concept “Postpartum period, 7 days” (finding))
			(>= measurement (clinical_finding (snomed_concept “Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 140))
			(>= measurement (clinical_finding (snomed_concept “Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 90))
		)
	)
)
;; Page 31 - Eye/vision symptoms
" Jaundice likely" 
(system_diagnosis_rule
  (diagnosis
    (clinical_finding (snomed_concept “Hyperbilirubinemia” (disorder))
		(clinical_finding (snomed_concept “Jaundice” (finding))
    probable
  	adult
			(clinical_finding (snomed_concept “Scleral icterus” (finding))
			(clinical_finding (snomed_concept “Yellow nails” (finding))
			(clinical_finding (snomed_concept “Yellow skin” (finding))
;; Page 31 - Eye/vision symptoms
" Jaundice likely" 
(system_diagnosis_rule
  (referral
  (clinical_finding (snomed_concept “Hyperbilirubinemia” (disorder))
	(clinical_finding (snomed_concept “Jaundice” (finding))
	(and
	(clinical_finding (snomed_concept “Urgent referral” (procedure))
  adult
		(>= measurement (clinical_finding (snomed_concept “Body temperature” (observable entity) “Degrees Celsius” (qualifier value) 38))
		(<measurement (clinical_finding (snomed_concept “Measurement of total hemoglobin concentration” (procedure) “Woman” (person) “Gram/deciliter” (qualifier value) 12))
		(< measurement (clinical_finding (snomed_concept “Measurement of total hemoglobin concentration” (procedure) “Man” (person) “Gram/deciliter” (qualifier value) 13))
		(< measurement (clinical_finding (snomed_concept “Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 90))
		(< measurement (clinical_finding (snomed_concept “Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 60))
		(clinical_finding (snomed_concept “Abdominal pain” (finding) “Severe” (severity modifier) (qualifier value))
		(clinical_finding (snomed_concept “Drowsy” (finding))
		(clinical_finding (snomed_concept “Clouded consciousness” (finding))
		(clinical_finding (snomed_concept “Easy bruising” (finding))
		(clinical_finding (snomed_concept “Bleeding” (finding) “Easy” (qualifier value))
		(clinical_finding (snomed_concept “Pregnancy” (finding))
		(clinical_finding (snomed_concept “Alcohol dependence” (disorder))
		(clinical_finding (snomed_concept “Drinking binge” (finding) “Recent” (qualifier value))
		(>= measurement (clinical_finding (snomed_concept “Drinker of hard liquor “ (finding) “alcohol units/day” (qualifier value) “4 Milliliter” (qualifier value) 200))
		(>= measurement (clinical_finding (snomed_concept “Drinks wine” (finding) “alcohol units/day” (qualifier value) “Glassful - unit of product usage” (qualifier value) “Milliliter” (qualifier value) 600))
		(>= measurement (clinical_finding (snomed_concept “Beer drinker” (finding) “alcohol units/day” (qualifier value) “Can - unit of product usage” (qualifier value) “4 Milliliter” (qualifier value) 1320))
		(>= measurement (clinical_finding (snomed_concept “Beer drinker” (finding) “alcohol units/day” (qualifier value) “Bottle - unit of product usage” (qualifier value) “4 Milliliter” (qualifier value) 1320))
		(clinical_finding (snomed_concept “Misuse of medication” (finding))
		(clinical_finding (snomed_concept “Illicit drug use” (finding))
		)
	)
)
;; Page 31 - Eye/vision symptoms
" Gonococcal conjunctivitis likely " 
(system_diagnosis_rule
  (diagnosis
  (snomed_concept “Gonococcal conjunctivitis” (disorder))
  probable
  adult 
		(clinical_finding (snomed_concept “Red eye” (finding))
		(clinical_finding (snomed_concept “Discharge from eye” (finding))
		(clinical_finding (snomed_concept “Sexually transmitted infectious disease” (disorder))
		(clinical_finding (snomed_concept “Vaginal ulcer” (disorder) “Recent” (qualifier value))
		(clinical_finding (snomed_concept “Ulcer of penis” (disorder) “Recent” (qualifier value))
		(clinical_finding (snomed_concept “Discharge from female genitalia” (finding) “Recent” (qualifier value))
		(clinical_finding (snomed_concept “Discharge from penis” (finding) “Recent” (qualifier value))
		)
	)
)
;; Page 31 - Eye/vision symptoms
" Allergic conjunctivitis likely" 
(system_diagnosis_rule
  (diagnosis
    (snomed_concept “Allergic conjunctivitis” (disorder))
    probable
  adult 
			(clinical_finding (snomed_concept “Discharge from eye” (finding))
			(clinical_finding (snomed_concept “Watery eye” (finding))
			(clinical_finding (snomed_concept “Itching of bilateral eyes” (finding) “Prominent” (qualifier value))
			(clinical_finding (snomed_concept “Eczema” (disorder))
			(clinical_finding (snomed_concept “Allergic rhinitis” (disorder))
			(clinical_finding (snomed_concept “Asthma” (disorder))
		)
	)
)
;; Page 31 - Eye/vision symptoms
" Viral conjunctivitis likely" 
(system_diagnosis_rule
  (diagnosis
    (snomed_concept “Viral conjunctivitis” (disorder))
    probable
  adult
			(clinical_finding (snomed_concept “Serous conjunctival discharge” (finding))
		)
	)
)
 ;; Page 31 - Eye/vision symptoms
" Bacterial conjunctivitis likely" 
(system_diagnosis_rule
  (diagnosis
    (snomed_concept “Bacterial conjunctivitis” (disorder))
    probable
  adult 
			(clinical_finding (snomed_concept “Purulent conjunctival discharge” (finding))
			(clinical_finding (snomed_concept “Pus” (substance))
		)
	)
)
;; Page 31 - Eye/vision symptoms
" Superficial foreign body likely" 
(system_diagnosis_rule
  (diagnosis
    (snomed_concept “Foreign body of eye region” (disorder))
		(and
		(clinical_finding (snomed_concept “Urgent referral” (procedure))
    probable
  adult
			(clinical_finding (snomed_concept “Removal of foreign body from eye” (procedure) “Unsuccessful” (qualifier value))
			(clinical_finding (snomed_concept “Injury of eye region” (disorder))
			(clinical_finding (snomed_concept “Abnormal vision” (finding))
			(clinical_finding (snomed_concept “Abnormal ocular motility” (finding))
			(clinical_finding (snomed_concept “Patient condition unchanged” (finding) “Removal of foreign body from eye” (procedure) “After” (attribute) “24 hours” (qualifier value))
		)
	)
)



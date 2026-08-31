;; Page 36 - Gum/Teeth Symptoms
(task
  "Check for urgent dental conditions"
  adult
  (clinical_finding (finding_site (snomed_concept "Tooth, gum, and/or supporting structure" "body structure")))
  (check_for
    (clinical_finding (snomed_concept "Facial swelling” (finding) “Tooth structure” (body structure) “Juxta-posed” (qualifier value))
    (clinical_finding (snomed_concept "Swelling of lower jaw region" "finding") “Tooth structure” (body structure) “Juxta-posed” (qualifier value))
    (clinical_finding (snomed_concept "Unable to eat" "finding"))
    (clinical_finding (snomed_concept "Unable to drink" "finding"))
    (clinical_finding (snomed_concept "Toothache" "finding") "Wakes up during night" "finding")))
    (clinical_finding (snomed_concept "Toothache" "finding") “Without” (attribute) “Touch sensation, function” (observable entity)) “Gingival structure” (body structure))
    (clinical_finding (snomed_concept "Toothache" "finding")
“Without” (attribute) “Touch sensation, function” (observable entity)) “Tooth structure” (body structure))
		)
  )
)
;; Page 36 - Gum/Teeth Symptoms 
(system_priority_evaluation
  "Urgent dental conditions 
  adult
	(snomed_concept "Toothache" "finding"))
  Urgent
  (and
    (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
    (clinical_finding (snomed_concept “Facial swelling” (finding) “Tooth structure” (body structure) “Juxta-posed” (qualifier value))
		(clinical_finding ( snomed_concept “Swelling of lower jaw region” (finding) “Tooth structure” (body structure) “Juxta-posed” (qualifier value))
		)
    (clinical_finding (snomed_concept "Unable to eat" "finding"))
		or
    (clinical_finding (snomed_concept "Unable to drink" "finding"))
		)
		(clinical_finding ( snomed_concept “Toothache” (finding))
“Without” (attribute) “Touch sensation, function” (observable entity)) “Tooth structure” (body structure))
		or
		(clinical_finding ( snomed_concept “Toothache” (finding))
“Without” (attribute) “Touch sensation, function” (observable entity)) “Gingival structure” (body structure))
		(clinical_finding ( snomed_concept “Toothache” (finding) “Wakes up during night” (finding))
    )
  )
)
Page 36 Gum/Teeth Symptom
(system_diagnosis_rule
	"Dental caries likely"
	(adult 
	(referral 
	(snomed_concept “Dental caries” (disorder))
	(snomed_concept “Patient referral” (procedure))
	(snomed_concept “Referral to dentist” (procedure))
	)
	probable
	(and
		(clinical_finding (snomed_concept “Extrinsic staining of tooth - black” (disorder) “Gingival structure” (body structure))
		(clinical_finding (snomed_concept “Extrinsic staining of tooth - brown” (disorder) “Gingival structure” (body structure))
		(clinical_finding (snomed_concept “Cavity” (morphologic abnormality))
		(clinical_finding (snomed_concept “Loss of teeth” (disorder))
		(clinical_finding (snomed_concept “Toothache” (finding) “With” (attribute) “Hot food” (substance))
		(clinical_finding (snomed_concept “Toothache” (finding) “With” (attribute) “Cold food” (substance))
		(clinical_finding (snomed_concept “Toothache” (finding) “With” (attribute) “Hot drink” (substance))
		(clinical_finding (snomed_concept “Toothache” (finding) “With” (attribute) “Cold drink” (substance))
		)
	)
Page 36 Gum/Teeth Symptom
(system_diagnosis_rule
	“Gingivitis likely"
	(adult 
	(snomed_concept “Gingivitis” (disorder))
	)
	probable
	(and
		(clinical_finding (snomed_concept “Bleeding gums” (finding))
		(clinical_finding (snomed_concept “Swollen gums” (finding))
		)
Page 36 Gum/Teeth Symptom
(system_diagnosis_rule
	“Gingivitis likely"
	(adult 
	(referral 
	(snomed_concept “Gingivitis” (disorder))
	(snomed_concept “Patient referral” (procedure))
	(snomed_concept “Referral to dentist” (procedure))
	)
	probable
	(and 
		(clinical_finding (snomed_concept “Patient condition unchanged” (finding) “After” (attribute) “day” (qualifier value) 5))
		(clinical_finding (snomed_concept “Breath smells unpleasant) (finding))
		(clinical_finding (snomed_concept “Swollen gums” (finding))
		(>=measurement (snomed_concept “Body temperature” (observable entity) °C )38))
		(clinical_finding (snomed_concept “Mobile tooth” (finding))
		(clinical_finding (snomed_concept “Gingival recession” (disorder))
		(clinical_finding (snomed_concept “Alveolar bone loss” (disorder)) 		(clinical_finding (snomed_concept “Human immunodeficiency virus infection” (disorder))
		(clinical_finding (snomed_concept “Diabetes mellitus” (disorder))
		)
	)
Page 36 Gum/Teeth Symptom
(system_diagnosis_rule
	"Dental abscess likely"
	(adult 
	(snomed_concept “Dental abscess” (disorder))
	)
	probable
	(and
		(clinical_finding (snomed_concept “Toothache” (finding))
		(clinical_finding (snomed_concept “Pus” (substance) “In” (attribute) “Mouth region structure” (body structure))
		(clinical_finding (snomed_concept “Swollen gums” (finding) “Juxta-posed” (qualifier value) “Tooth structure” (body structure))
		)
Page 36 Gum/Teeth Symptom
(system_diagnosis_rule
	"Dental abscess likely"
	(adult 
	(referral 
	(snomed_concept “Dental abscess” (disorder))
	(snomed_concept “Patient referral” (procedure))
	)
	probable
	(and  
		(clinical_finding (snomed_concept “Worse” (qualifier value)) 
		(>=measurement (snomed_concept “Body temperature” (observable entity) °C )38))
		(clinical_finding (snomed_concept “Patient condition unchanged” (finding) “After” (attribute) day) 2))
		)
Page 36 Gum/Teeth Symptom
(system_diagnosis_rule
	"Dental abscess likely"
	(adult 
	(urgent_referral
	(snomed_concept “Dental abscess” (disorder))
	(snomed_concept “Urgent referral” (procedure) “In” (attribute) hour) 24))
	)
	probable
	(and
		(> (snomed_concept “Current chronological age” (observable entity) year) 65)
		(clinical_finding (snomed_concept “Alcohol use disorder” (disorder))
		(clinical_finding (snomed_concept “Substance use disorder” (disorder))
		(clinical_finding (snomed_concept “Human immunodeficiency virus infection” (disorder))
		(clinical_finding (snomed_concept “Diabetes mellitus” (disorder))
		)
	)
)



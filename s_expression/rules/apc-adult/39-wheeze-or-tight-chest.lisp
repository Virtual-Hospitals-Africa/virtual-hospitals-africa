;; Page 39 - Wheeze or Tight Chest
(task
  "Check for urgent wheeze or tight chest conditions"
  adult
  (or
    (clinical_finding (snomed_concept "Wheezing" "finding"))
    (clinical_finding (snomed_concept "Tight chest" "finding")))
  (check_for
    (clinical_finding (snomed_concept "Unable to complete a sentence in one breath" "finding"))
    (clinical_finding (snomed_concept "Accessory respiratory muscles used" "finding"))
    (clinical_finding (snomed_concept “Thoracic structure” (body structure) Silent (qualifier value)
		(clinical_finding (snomed_concept “Tight chest” (finding) Wheezing” (finding) No (qualifier value)
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Feeling agitated" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Asthma" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Chronic obstructive pulmonary disease" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
  )
)
;; Page 39 - Wheeze: Severe wheeze
(system_priority_evaluation
  "Urgent: severe wheeze with respiratory distress"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Wheezing" "finding"))
    (or
      (> (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (> (measurement (snomed_concept “Heart rate” "observable entity") bpm) 120)
      (clinical_finding (snomed_concept "Feeling agitated" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
			(clinical_finding (snomed_concept “Unable to complete a sentence in one breath” (finding)
			(clinical_finding (snomed_concept “Accessory respiratory muscles” used (finding)
			(clinical_finding (snomed_concept “Thoracic structure” (body structure) Silent (qualifier value)
			(clinical_finding (snomed_concept “Tight chest” (finding) Wheezing” (finding) No (qualifier value)
			(clinical_finding (snomed_concept “Asthma” (disorder) Known (qualifier value)
			(clinical_finding (snomed_concept “Chronic obstructive pulmonary disease” (disorder) Known (qualifier value)
    )
  )
)
Page 39 Wheeze/Tight Chest
(system_diagnosis_rule
	"Wheeze or tight chest likely"
	(adult
	(urgent_referral
	(snomed_concept “Wheezing” (finding))
	(snomed_concept “Tight chest” (finding))
	(snomed_concept “Urgent referral” (procedure))
	)
	(and
		(>measurement (snomed_concept “Respiratory rate” (observable entity) bpm) 30))
		(>measurement (snomed_concept “Heart rate” (observable entity) bpm) 120))
		(clinical_finding (snomed_concept “Unable to complete a sentence in one breath” (finding))
		(clinical_finding (snomed_concept “Accessory respiratory muscles used” (finding))
		(clinical_finding (snomed_concept “Silent” (qualifier value) “Thoracic structure” (body structure))
		(clinical_finding (snomed_concept “Tight chest” (finding))
		(clinical_finding (snomed_concept “Wheeze absent” (situation))
		(clinical_finding (snomed_concept “Feeling agitated” (finding))
		(clinical_finding (snomed_concept “Drowsy” (finding))
		(clinical_finding (snomed_concept “Clouded consciousness” (finding))
		)
	)
Page 39 Wheeze/Tight Chest
(system_diagnosis_rule
	"Heart failure likely"
	(adult
	(urgent_referral
	(snomed_concept “Heart failure” (disorder))
	)
	probable
	(and
		(clinical_finding (snomed_concept “Difficulty breathing” (finding))
		(clinical_finding (snomed_concept “Orthopnea” (finding))
		(clinical_finding (snomed_concept “Leg swelling symptom” (finding))
		)
	)
)


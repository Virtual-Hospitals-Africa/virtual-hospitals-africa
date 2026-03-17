;; Page 24 - Fever: meningitis likely with neck stiffness, or drowsy/confused with purpuric rash
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Meningitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Fever" "finding"))
    (or
      (clinical_finding (snomed_concept "Stiff neck" "finding"))
      (and
        (or
          (clinical_finding (snomed_concept "Drowsy" "finding"))
          (clinical_finding (snomed_concept "Confusional state" "disorder"))
        )
        (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
      )
    )
  )
)
;; Page 24 - Fever: appendicitis likely with right lower abdominal tenderness
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Acute appendicitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Fever" "finding"))
    (clinical_finding (snomed_concept "Tenderness of right lower quadrant of abdomen" "finding"))
  )
Page 24 - Fever: Complicated malaria” (disorder)
(system_diagnosis_rule
  (diagnosis
    (snomed_concept Complicated malaria” (disorder)
    probable
		(clinical_finding (snomed_concept “Complicated malaria” (disorder)(
		(<clinical_finding (snomed_concept “Measurement of total hemoglobin concentration” (procedure) “Gram/deciliter” (qualifier value) 7))					

		(<clinical_finding (snomed_concept “Finding of blood glucose level” (finding) “Millimole/liter” (qualifier value) 3))
		(clinical_finding (snomed_concept “Unable to take medication” (finding) “Oral route” (qualifier value))
(clinical_finding (snomed_concept “Patient's condition worsened” (finding))
(referral
		(clinical_finding (snomed_concept “Urgent referral” (procedure) “In” (attribute) “hour” (qualifier value) 24))
		(>clinical_finding (snomed_concept “Current chronological age (observable entity) year (qualifier value) 65))
		(clinical_finding (snomed_concept “Pregnancy” (finding))
		(clinical_finding (snomed_concept “Human immunodeficiency virus infection” (disorder) “Known” (qualifier value))
	(clinical_finding (snomed_concept “Diabetes mellitus” (disorder))
(clinical_finding (snomed_concept “Malaria” (disorder)  “Drug not available due to being out of stock” (finding)) 

)

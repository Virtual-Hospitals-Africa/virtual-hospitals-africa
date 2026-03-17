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
)
Page 24 - Fever: malaria likely
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Malaria" "disorder")
    probable
		(clnical_finding (snomed_concept “Fever” (finding))
		(clinical_finding (snomed_concept “Nausea” (finding))
		(clinical_finding (snomed_concept “Vomiting” (disorder))
		(clinical_finding (snomed_concept “History of travel with high risk of exposure to communicable disease” (situation) “Malaria” (disorder) “month” (qualifier value)3))
		(clinical_finding (snomed_concept “Malaria antigen test” (procedure) “Positive” (qualifier value))

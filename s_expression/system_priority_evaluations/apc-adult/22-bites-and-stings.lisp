;; Page 22 - Bites and Stings
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Bite - wound" "disorder"))
    OR
    (clinical_finding (snomed_concept "Snake bite - wound" "disorder"))
		OR
		(clinical_finding (snomed_concept "Snake bite - wound" "disorder")
“Not seen” (qualifier value))
		OR
    (clinical_finding (snomed_concept "Snake venom" "substance")) “Structure of eye proper” (body structure))
)
   (clinical_finding (snomed_concept “Generalized pruritus” (finding) “Sudden onset" "qualifier value"))
		AND ANY
		(clinical_finding (snomed_concept "Generalized rash” (disorder) Sudden onset" "qualifier value"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure"))
		(clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure"))
		(clinical_finding (snomed_concept "Wheezing” (finding))
		(clinical_finding (snomed_concept "Difficulty breathing" "finding"))
		(< measurement(clinical_finding (snomed_concept " Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value)90)) AND
		(<measurement(clinical_finding (snomed_concept "Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 60))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Collapse" "finding"))
		(clinical_finding (snomed_concept "Abdominal pain” (finding))
		(clinical_finding (snomed_concept "Vomiting” (disorder))
)
    (clinical_finding (snomed_concept "Generalized muscle weakness" "finding"))
		AND ANY
    (clinical_finding (snomed_concept "Has drooping eyelids" "finding"))
    (clinical_finding (snomed_concept "Difficulty swallowing" "finding"))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Diplopia" "disorder"))
)
    (clinical_finding (snomed_concept "Animal bite wound” (disorder)
		(clinical_finding (snomed_concept "Human bite - wound” (disorder))
		AND ANY
		(clinical_finding (snomed_concept "Multiple wounds” (morphologic abnormality) “Bite” (morphologic abnormality))
		(clinical_finding (snomed_concept "Deep bite wound" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Bite - wound" "disorder") (finding_site (snomed_concept "Joint structure" "body structure")))
    (clinical_finding (snomed_concept "Bite - wound" "disorder") (finding_site (snomed_concept "Bone structure" "body structure")))
    )
    (clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Excessive" "qualifier value")))
		OR
    (clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Pulsatile" "qualifier value")))
		)
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
		AND
    (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
		)
    (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
		OR
		(clinical_finding (snomed_concept "Infection of bite wound" "disorder"))
    )
  )


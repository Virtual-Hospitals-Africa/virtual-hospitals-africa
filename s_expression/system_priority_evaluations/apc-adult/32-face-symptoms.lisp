;; Page 32 - Face symptoms
(system_priority_evaluation
  "Urgent facial symptoms" 
  adult
  Urgent
  (and
		  (clinical_finding ( snomed_concept “Weakness of face muscles” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value) “Forehead structure” (body structure) “Uninvolved” (qualifier value))
			OR
			(clinical_finding ( snomed_concept “Weakness of face muscles” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value) “Forehead structure” (body structure)  “Involved” (qualifier value) “Minimal” (qualifier value))
			OR
			(clinical_finding ( snomed_concept “Muscle weakness of upper limb” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
			OR
			(clinical_finding ( snomed_concept “Weakness of muscle of lower limb” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
			OR
			(clinical_finding ( snomed_concept “Numbness of face” (finding))
			OR
			(clinical_finding ( snomed_concept “Numbness of limbs” (finding))
			OR
			(clinical_finding ( snomed_concept “Difficulty talking” (finding))
			OR
			(clinical_finding ( snomed_concept “Visual disturbance” (disorder))
			) 
			(clinical_finding ( snomed_concept “Facial swelling” (finding) “Sudden” (qualifier value))
			OR
			(clinical_finding ( snomed_concept “Tongue swelling” (finding) “Sudden” (qualifier value))
			AND ANY OF
					clinical_finding (snomed_concept “Difficulty breathing” (finding))
					(<measurement ( (snomed_concept “Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value)90))
					AND
					(<measurement ( (snomed_concept “Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value)60))
					(clinical_finding (snomed_concept “Dizziness” (finding) “Sudden” (qualifier value) “Severe” (severity modifier))
					(clinical_finding ( snomed_concept “Collapse” (finding))
					(clinical_finding ( snomed_concept “Abdominal pain” (finding))
					(clinical_finding (snomed_concept “Vomiting” (disorder))
					(clinical_finding ( snomed_concept “Exposure to” (contextual qualifier) “Substance” (substance) (qualifier value) “Possible” (qualifier value) “Allergen” (attribute))
			) 
			(clinical_finding (snomed_concept “Facial swelling” (finding) “Red color” (qualifier value) “Pain” (finding))
			AND
		 (>= (measurement (snomed_concept "Body temperature" "observable entity")  “Degrees Celsius” (qualifier value) 38))
			)
			(clinical_finding (snomed_concept “Facial swelling” (finding) “New” (qualifier value))
			AND  
      (clinical_finding (snomed_concept "Blood in urine" "finding"))
			OR
      (clinical_finding (snomed_concept "Proteinuria" "finding"))
	    )
  )
)






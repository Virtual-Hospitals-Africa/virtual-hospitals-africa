;; Page 35 - Mouth/Throat Symptoms 
(system_priority_evaluation
  "Urgent Mouth or Throat Symptoms"
  adult
	(clinical_finding ( snomed_concept “Mouth symptoms” (finding))
	(clinical_finding ( snomed_concept “Finding of pharynx” (finding))
  Urgent
  (or
    (clinical_finding ( snomed_concept “Redness of throat” (finding))
		(clinical_finding ( snomed_concept “Pharyngeal swelling” (finding)) “Blocking” (qualifier value) “Airway structure” (body structure))
		(clinical_finding (snomed_concept "Unable to open mouth" "finding"))
    (clinical_finding (snomed_concept "Unable to swallow" "finding") “Complete” (qualifier value))
		(clinical_finding ( snomed_concept “Facial swelling” (finding) “Sudden” (qualifier value))
		(clinical_finding ( snomed_concept “Tongue swelling” (finding) “Sudden” (qualifier value))
		(clinical_finding ( snomed_concept “Wheezing” (finding))
		(clinical_finding (snomed_concept “Difficulty breathing” (finding))
		(<measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
		(<measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
		(clinical_finding (snomed_concept “Dizziness” (finding) “Sudden” (qualifier value) “Severe” (severity modifier))
		(clinical_finding ( snomed_concept “Collapse” (finding))
		(clinical_finding ( snomed_concept “Abdominal pain” (finding))
		(clinical_finding (snomed_concept “Vomiting” (disorder))
		(clinical_finding ( snomed_concept “Exposure to” (contextual qualifier) “Substance” (substance) (qualifier value) “Possible” (qualifier value) “Allergen” (attribute))
  )
)
;; Page 22 - Bites and Stings
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Bite - wound" "disorder"))
    (or
      (clinical_finding (snomed_concept "Snake bite - wound" "disorder"))
      (clinical_finding (snomed_concept "Generalized muscle weakness" "finding"))
      (clinical_finding (snomed_concept "Has drooping eyelids" "finding"))
      (clinical_finding (snomed_concept "Difficulty swallowing" "finding"))
      (clinical_finding (snomed_concept "Difficulty talking" "finding"))
      (clinical_finding (snomed_concept "Diplopia" "disorder"))
      (clinical_finding (snomed_concept "Deep bite wound" "morphologic abnormality"))
      (clinical_finding (snomed_concept "Bite - wound" "disorder") (finding_site (snomed_concept "Joint structure" "body structure")))
      (clinical_finding (snomed_concept "Bite - wound" "disorder") (finding_site (snomed_concept "Bone structure" "body structure")))
      (clinical_finding (snomed_concept "Infection of bite wound" "disorder"))
      (clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Excessive" "qualifier value")))
      (clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Pulsatile" "qualifier value")))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
    )
  )
)

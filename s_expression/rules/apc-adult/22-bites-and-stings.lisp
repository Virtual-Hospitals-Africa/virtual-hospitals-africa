;; Page 22 - Bites and Stings
(task
  "Check for urgent bite/sting conditions"
  adult
  (clinical_finding (snomed_concept "Bite - wound" "disorder"))
  (check_for
    (clinical_finding (snomed_concept "Generalized muscle weakness" "finding"))
    (clinical_finding (snomed_concept "Has drooping eyelids" "finding"))
    (clinical_finding (snomed_concept "Difficulty swallowing" "finding"))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Diplopia" "disorder"))
    (clinical_finding (snomed_concept "Deep bite wound" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Avulsion - injury" "disorder"))
    (clinical_finding (snomed_concept "Bite - wound" "disorder") (finding_site (snomed_concept "Joint structure" "body structure")))
    (clinical_finding (snomed_concept "Bite - wound" "disorder") (finding_site (snomed_concept "Bone structure" "body structure")))
    (clinical_finding (snomed_concept "Infection of bite wound" "disorder"))
    (clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Excessive" "qualifier value")))
    (clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Pulsatile" "qualifier value")))
  )
)
(task
  "Check for snake bite"
  adult
  (clinical_finding (snomed_concept "Bite - wound" "disorder")
    ;; (excluding (clinical_finding (snomed_concept "Animal bite wound" "disorder")))
  )
  (check_for
    (clinical_finding (snomed_concept "Snake bite - wound" "disorder"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Snake venom" "substance"))
  )
)
;; Page 22 - Bites and Stings: snake bite poisoning
(system_diagnosis_rule
  "Diagnose possible snake bite poisoning"
  (diagnosis
    (snomed_concept "Poisoning caused by venomous snake" "disorder")
    possible
  )
  adult
  (or
    (clinical_finding (snomed_concept "Snake bite - wound" "disorder"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Snake venom" "substance"))
  )
)
;; Page 22 - Bites and Stings
(system_priority_evaluation
  "Urgent: bite with danger signs"
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

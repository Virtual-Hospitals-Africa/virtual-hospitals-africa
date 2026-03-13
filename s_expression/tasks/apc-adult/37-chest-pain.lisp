;; Page 37 - Chest Pain
(task
  "Check for urgent chest pain conditions"
  adult
  (clinical_finding (snomed_concept "Chest pain" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Pulse irregular" "finding"))
    (clinical_finding (snomed_concept "Severe pain" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Chest discomfort" "finding") (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Pallor of skin of face" "finding"))
    (clinical_finding (snomed_concept "Sweating" "finding"))
    (clinical_finding (snomed_concept "Radiating chest pain" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to jaw" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to neck" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to left arm" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to right arm" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to left shoulder" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to right shoulder" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "History of treatment for ischemic heart disease" "situation"))
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Smoker" "finding"))
    (clinical_finding (snomed_concept "Hypertensive disorder, systemic arterial" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Hypercholesterolemia" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Family history of ischemic heart disease" "situation"))
    (clinical_finding (snomed_concept "ST segment elevation" "finding"))
    (clinical_finding (snomed_concept "ST segment depression" "finding"))
    (clinical_finding (snomed_concept "Electrocardiographic left bundle branch block" "finding"))
    (clinical_finding (snomed_concept "Chest pain on breathing" "finding"))
    (clinical_finding (snomed_concept "Pleuritic pain" "finding"))
  )
)
(task
  "Check for urgent chest pain conditions"
  adult
  (clinical_finding (snomed_concept "Chest pain" "finding"))
  (measure
    (measurement (snomed_concept "Heart rate measured at systemic artery" "observable entity") bpm)
  )
)

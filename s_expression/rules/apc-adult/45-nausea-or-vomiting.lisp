;; Page 45 - Nausea or Vomiting
(task
  "Check for urgent nausea or vomiting conditions"
  adult
  (or
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
  (check_for
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Diarrhea" "finding") (qualifier (snomed_concept "Watery" "qualifier value")))
    (<= (onset (clinical_finding (snomed_concept "History of travel with high risk of exposure to communicable disease" "situation")))
        (time_ago 5 days))
    (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
    (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
    (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
    (clinical_finding (snomed_concept "Tenderness of right lower quadrant of abdomen" "finding"))
    (clinical_finding (snomed_concept "Hematemesis" "disorder"))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    (clinical_finding (snomed_concept "Deep breathing" "finding") (qualifier (snomed_concept "Rapid" "qualifier value")))
    (clinical_finding (snomed_concept "Right lower quadrant pain" "finding"))
    (clinical_finding (snomed_concept "Upper abdominal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Pain radiating to lumbar region of back" "finding"))
    (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
    (clinical_finding (snomed_concept "Constipation" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Nausea" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (<= (onset (clinical_finding (snomed_concept "Unable to break wind" "finding")))
        (time_ago 24 hours))
    (clinical_finding (snomed_concept "Generalized pruritus" "finding"))
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
    (clinical_finding (snomed_concept "Wheezing" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Substance" "substance"))
    (clinical_finding (snomed_concept "Deep breathing" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
  )
)
;; Page 45 - Nausea/Vomiting: peritonitis likely with guarding, rigidity or rebound tenderness
(system_diagnosis_rule
  "Diagnose probable peritonitis based on nausea"
  (diagnosis
    (snomed_concept "Peritonitis" "disorder")
    probable
  )
  adult
  (and
    (or
      (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    )
    (or
      (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
      (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
      (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
    )
  )
)
;; Page 45 - Nausea/Vomiting: appendicitis likely with right lower abdominal tenderness
(system_diagnosis_rule
  "Diagnose probable appendicitis based on nausea"
  (diagnosis
    (snomed_concept "Acute appendicitis" "disorder")
    probable
  )
  adult
  (and
    (or
      (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    )
    (clinical_finding (snomed_concept "Tenderness of right lower quadrant of abdomen" "finding"))
  )
);; Page 45 - Nausea/Vomiting: Urgent for danger signs
(system_priority_evaluation
  "Urgent: nausea or vomiting with haemorrhagic, peritoneal or systemic signs"
  adult
  Urgent
  (and
    (or
      (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    )
    (or
      (clinical_finding (snomed_concept "Hematemesis" "disorder"))
      (clinical_finding (snomed_concept "Jaundice" "finding"))
      (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
      (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
      (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      (clinical_finding (snomed_concept "Deep breathing" "finding"))
      (and
        (clinical_finding (snomed_concept "Abdominal pain" "finding"))
        (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
        (clinical_finding (snomed_concept "Unable to break wind" "finding"))
      )
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
    )
  )
)

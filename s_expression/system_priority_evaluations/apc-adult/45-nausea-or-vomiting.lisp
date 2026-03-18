;; Page 45 - Nausea/Vomiting: Urgent for danger signs
(system_priority_evaluation
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

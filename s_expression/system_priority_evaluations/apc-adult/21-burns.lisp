(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (or
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      (clinical_finding (snomed_concept "Electrical burn" "disorder"))
      (clinical_finding (snomed_concept "Chemical burn" "disorder"))
      (clinical_finding (snomed_concept "Full thickness burn" "disorder"))
      (clinical_finding (snomed_concept "Partial thickness burn" "disorder") (qualifier (snomed_concept "Extensive" "qualifier value")))
      (clinical_finding (snomed_concept "Smoke inhalation injury" "disorder"))
      (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Chest structure" "body structure")) (qualifier (snomed_concept "Circumferential" "qualifier value")))
      (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Limb structure" "body structure")) (qualifier (snomed_concept "Circumferential" "qualifier value")))
      (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Face structure" "body structure")))
      (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Hand structure" "body structure")))
      (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Foot structure" "body structure")))
      (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Genital structure" "body structure")))
      (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Joint structure" "body structure")))
      (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %) 94)
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
    )
  )
)

(task
  "Check for urgent burn features"
  adult
  (clinical_finding (snomed_concept "Burn" "disorder"))
  (check_for

    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))


    (clinical_finding (snomed_concept "Electrical burn" "disorder"))
    (clinical_finding (snomed_concept "Chemical burn" "disorder"))
    (clinical_finding (snomed_concept "Full thickness burn" "disorder"))
    (clinical_finding (snomed_concept "Partial thickness burn" "disorder"))


    (clinical_finding (snomed_concept "Burn any degree involving 10-19 percent of body surface" "disorder"))
    (clinical_finding (snomed_concept "Burn any degree involving 20-29 percent of body surface" "disorder"))
    (clinical_finding (snomed_concept "Burn any degree involving 30-39 percent of body surface" "disorder"))
    (clinical_finding (snomed_concept "Burn any degree involving 40-49 percent of body surface" "disorder"))
    (clinical_finding (snomed_concept "Burn any degree involving 50-59 percent of body surface" "disorder"))
    (clinical_finding (snomed_concept "Burn any degree involving 60-69 percent of body surface" "disorder"))
    (clinical_finding (snomed_concept "Burn any degree involving 70-79 percent of body surface" "disorder"))
    (clinical_finding (snomed_concept "Burn any degree involving 80-89 percent of body surface" "disorder"))
    (clinical_finding (snomed_concept "Burn any degree involving 90 percent OR more of body surface" "disorder"))
    (clinical_finding (snomed_concept "Over 70 percent body burnt" "disorder"))


    (clinical_finding (snomed_concept "Burn of chest wall" "disorder") (qualifier (snomed_concept "Circumferential" "qualifier value")))
    (clinical_finding (snomed_concept "Burn of upper limb" "disorder") (qualifier (snomed_concept "Circumferential" "qualifier value")))
    (clinical_finding (snomed_concept "Burn of lower limb" "disorder") (qualifier (snomed_concept "Circumferential" "qualifier value")))
    (clinical_finding (snomed_concept "Burn of face" "disorder"))
    (clinical_finding (snomed_concept "Burn of hand" "disorder"))
    (clinical_finding (snomed_concept "Burn of foot" "disorder"))
    (clinical_finding (snomed_concept "Burn of genitalia" "disorder"))
    (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Joint structure" "body structure")))
    (clinical_finding (snomed_concept "Burn of neck" "disorder"))


    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Hoarse" "finding"))
    (clinical_finding (snomed_concept "Stridor" "finding"))
    (clinical_finding (snomed_concept "Finding of color of sputum" "finding") (qualifier (snomed_concept "Black color" "qualifier value")))


    (clinical_finding (snomed_concept "Shock" "disorder"))


    (clinical_finding (snomed_concept "Traumatic injury" "disorder") (excluding (clinical_finding (snomed_concept "Burn" "disorder"))))


    (clinical_finding (snomed_concept "Cigarette burn" "disorder"))
  )
)
(system_diagnosis_rule
  "Diagnose probable inhalation injury in patient with burns"
  (diagnosis
    (snomed_concept "Injury to respiratory system due to inhaled substance" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (or (clinical_finding (snomed_concept "Burn of face" "disorder"))
        (clinical_finding (snomed_concept "Burn of neck" "disorder"))
        (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
        (clinical_finding (snomed_concept "Hoarse" "finding"))
        (clinical_finding (snomed_concept "Stridor" "finding"))
        (clinical_finding (snomed_concept "Finding of color of sputum" "finding") (qualifier (snomed_concept "Black color" "qualifier value")))
    )
  )
)
(system_diagnosis_rule
  "Consider abuse in patient with cigarette burns"
  (diagnosis
    (snomed_concept "Victim of abuse" "finding")
    possible
  )
  adult
  (clinical_finding (snomed_concept "Cigarette burn" "disorder"))
)
(system_diagnosis_rule
  "Consider self-harm in patient with cigarette burns"
  (diagnosis
    (snomed_concept "Self-injurious behavior" "finding")
    possible
  )
  adult
  (clinical_finding (snomed_concept "Cigarette burn" "disorder"))
)
(system_priority_evaluation
  "Urgent: burns with urgent features"
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
      (and
        (clinical_finding (snomed_concept "Partial thickness burn" "disorder"))
        (or (clinical_finding (snomed_concept "Burn any degree involving 10-19 percent of body surface" "disorder"))
            (clinical_finding (snomed_concept "Burn any degree involving 20-29 percent of body surface" "disorder"))
            (clinical_finding (snomed_concept "Burn any degree involving 30-39 percent of body surface" "disorder"))
            (clinical_finding (snomed_concept "Burn any degree involving 40-49 percent of body surface" "disorder"))
            (clinical_finding (snomed_concept "Burn any degree involving 50-59 percent of body surface" "disorder"))
            (clinical_finding (snomed_concept "Burn any degree involving 60-69 percent of body surface" "disorder"))
            (clinical_finding (snomed_concept "Burn any degree involving 70-79 percent of body surface" "disorder"))
            (clinical_finding (snomed_concept "Burn any degree involving 80-89 percent of body surface" "disorder"))
            (clinical_finding (snomed_concept "Burn any degree involving 90 percent OR more of body surface" "disorder"))
            (clinical_finding (snomed_concept "Over 70 percent body burnt" "disorder"))
        )
      )
      (active_condition (snomed_concept "Injury to respiratory system due to inhaled substance" "disorder"))
      (clinical_finding (snomed_concept "Burn of chest wall" "disorder") (qualifier (snomed_concept "Circumferential" "qualifier value")))
      (clinical_finding (snomed_concept "Burn of upper limb" "disorder") (qualifier (snomed_concept "Circumferential" "qualifier value")))
      (clinical_finding (snomed_concept "Burn of lower limb" "disorder") (qualifier (snomed_concept "Circumferential" "qualifier value")))
      (clinical_finding (snomed_concept "Burn of face" "disorder"))
      (clinical_finding (snomed_concept "Burn of hand" "disorder"))
      (clinical_finding (snomed_concept "Burn of foot" "disorder"))
      (clinical_finding (snomed_concept "Burn of genitalia" "disorder"))
      (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Joint structure" "body structure")))
      (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %) 94)
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (clinical_finding (snomed_concept "Shock" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
      (clinical_finding (snomed_concept "Traumatic injury" "disorder") (excluding (clinical_finding (snomed_concept "Burn" "disorder"))))
    )
  )
)

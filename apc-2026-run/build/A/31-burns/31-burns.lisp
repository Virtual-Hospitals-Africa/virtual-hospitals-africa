;; Page 31 - Burns
(task
  "Check for urgent burn conditions"
  adult
  (clinical_finding (snomed_concept "Burn" "disorder"))
  (check_for
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Shock" "disorder"))

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

    (clinical_finding (snomed_concept "Traumatic injury" "disorder") (excluding (clinical_finding (snomed_concept "Burn" "disorder"))))

    (clinical_finding (snomed_concept "Cigarette burn" "disorder"))
  )
)
(system_diagnosis_rule
  "Diagnose probable inhalation injury in a patient with burns"
  (diagnosis
    (snomed_concept "Injury to respiratory system due to inhaled substance" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (or
      (clinical_finding (snomed_concept "Burn of face" "disorder"))
      (clinical_finding (snomed_concept "Burn of neck" "disorder"))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (clinical_finding (snomed_concept "Hoarse" "finding"))
      (clinical_finding (snomed_concept "Stridor" "finding"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose possible abuse in a patient with cigarette burns"
  (diagnosis
    (snomed_concept "Adult victim of abuse" "finding")
    possible
  )
  adult
  (clinical_finding (snomed_concept "Cigarette burn" "disorder"))
)
(system_diagnosis_rule
  "Diagnose possible self-harm in a patient with cigarette burns"
  (diagnosis
    (snomed_concept "Self-injurious behavior" "finding")
    possible
  )
  adult
  (clinical_finding (snomed_concept "Cigarette burn" "disorder"))
)
(system_priority_evaluation
  "Urgent: burns with danger signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (or
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Acute confusion" "finding"))

      (clinical_finding (snomed_concept "Electrical burn" "disorder"))
      (clinical_finding (snomed_concept "Chemical burn" "disorder"))

      (clinical_finding (snomed_concept "Full thickness burn" "disorder"))

      ;; Partial thickness burn > 10% TBSA: no % TBSA observable; SNOMED extent bands start at 10% (see remaining questions)
      (and
        (clinical_finding (snomed_concept "Partial thickness burn" "disorder"))
        (or
          (clinical_finding (snomed_concept "Burn any degree involving 10-19 percent of body surface" "disorder"))
          (clinical_finding (snomed_concept "Burn any degree involving 20-29 percent of body surface" "disorder"))
          (clinical_finding (snomed_concept "Burn any degree involving 30-39 percent of body surface" "disorder"))
          (clinical_finding (snomed_concept "Burn any degree involving 40-49 percent of body surface" "disorder"))
          (clinical_finding (snomed_concept "Burn any degree involving 50-59 percent of body surface" "disorder"))
          (clinical_finding (snomed_concept "Burn any degree involving 60-69 percent of body surface" "disorder"))
          (clinical_finding (snomed_concept "Burn any degree involving 70-79 percent of body surface" "disorder"))
          (clinical_finding (snomed_concept "Burn any degree involving 80-89 percent of body surface" "disorder"))
          (clinical_finding (snomed_concept "Burn any degree involving 90 percent OR more of body surface" "disorder"))
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

      ;; Shock/systolic BP < 80, as this page writes it
      (clinical_finding (snomed_concept "Shock" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)

      (clinical_finding (snomed_concept "Traumatic injury" "disorder") (excluding (clinical_finding (snomed_concept "Burn" "disorder"))))
    )
  )
)

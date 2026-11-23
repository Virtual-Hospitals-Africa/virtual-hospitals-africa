;; Page 31 - Burns
(task
  "Check for urgent burn features"
  adult
  (clinical_finding (snomed_concept "Burn" "disorder"))
  (check_for
    ;; Level of consciousness
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))

    ;; Type and depth of burn
    (clinical_finding (snomed_concept "Electrical burn" "disorder"))
    (clinical_finding (snomed_concept "Chemical burn" "disorder"))
    (clinical_finding (snomed_concept "Full thickness burn" "disorder"))
    (clinical_finding (snomed_concept "Partial thickness burn" "disorder"))

    ;; Extent of burn (% TBSA, SNOMED bands of 10% or more)
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

    ;; Site of burn
    (clinical_finding (snomed_concept "Burn of chest wall" "disorder") (qualifier (snomed_concept "Circumferential" "qualifier value")))
    (clinical_finding (snomed_concept "Burn of upper limb" "disorder") (qualifier (snomed_concept "Circumferential" "qualifier value")))
    (clinical_finding (snomed_concept "Burn of lower limb" "disorder") (qualifier (snomed_concept "Circumferential" "qualifier value")))
    (clinical_finding (snomed_concept "Burn of face" "disorder"))
    (clinical_finding (snomed_concept "Burn of hand" "disorder"))
    (clinical_finding (snomed_concept "Burn of foot" "disorder"))
    (clinical_finding (snomed_concept "Burn of genitalia" "disorder"))
    (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Joint structure" "body structure")))
    (clinical_finding (snomed_concept "Burn of neck" "disorder"))

    ;; Inhalation injury
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Hoarse" "finding"))
    (clinical_finding (snomed_concept "Stridor" "finding"))
    (clinical_finding (snomed_concept "Finding of color of sputum" "finding") (qualifier (snomed_concept "Black color" "qualifier value")))

    ;; Shock
    (clinical_finding (snomed_concept "Shock" "disorder"))

    ;; Other injury (Burn is_a Traumatic injury, so burn records are excluded)
    (clinical_finding (snomed_concept "Traumatic injury" "disorder") (excluding (clinical_finding (snomed_concept "Burn" "disorder"))))

    ;; Abuse or self-harm
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
  "Urgent: burns with drowsy"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: burns with clouded consciousness"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: burns with electrical burn"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (clinical_finding (snomed_concept "Electrical burn" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: burns with chemical burn"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (clinical_finding (snomed_concept "Chemical burn" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: burns with full thickness burn"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (clinical_finding (snomed_concept "Full thickness burn" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: burns with partial thickness burn and burn any degree involving 10-19 percent of body surface …"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
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
)

(system_priority_evaluation
  "Urgent: burns with injury to respiratory system due to inhaled substance"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (active_condition (snomed_concept "Injury to respiratory system due to inhaled substance" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: burns with burn of chest wall (circumferential)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (clinical_finding (snomed_concept "Burn of chest wall" "disorder") (qualifier (snomed_concept "Circumferential" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: burns with burn of upper limb (circumferential)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (clinical_finding (snomed_concept "Burn of upper limb" "disorder") (qualifier (snomed_concept "Circumferential" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: burns with burn of lower limb (circumferential)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (clinical_finding (snomed_concept "Burn of lower limb" "disorder") (qualifier (snomed_concept "Circumferential" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: burns with burn of face"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (clinical_finding (snomed_concept "Burn of face" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: burns with burn of hand"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (clinical_finding (snomed_concept "Burn of hand" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: burns with burn of foot"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (clinical_finding (snomed_concept "Burn of foot" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: burns with burn of genitalia"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (clinical_finding (snomed_concept "Burn of genitalia" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: burns with burn (site: joint structure)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Joint structure" "body structure")))
  )
)

(system_priority_evaluation
  "Urgent: burns with hemoglobin saturation with oxygen < 94 %"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %) 94)
  )
)

(system_priority_evaluation
  "Urgent: burns with body temperature ≥ 38 °C"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
  )
)

(system_priority_evaluation
  "Urgent: burns with shock"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (clinical_finding (snomed_concept "Shock" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: burns with systolic blood pressure < 80 mmHg"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
  )
)

(system_priority_evaluation
  "Urgent: burns with traumatic injury"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (clinical_finding (snomed_concept "Traumatic injury" "disorder") (excluding (clinical_finding (snomed_concept "Burn" "disorder"))))
  )
)

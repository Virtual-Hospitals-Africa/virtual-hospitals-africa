;; Cross-cutting: pain level recorded as an attribute of any clinical finding.
;;
;; Pain isn't a finding you can make on its own — it's always the pain *of* something.
;; So rather than offering "Severe pain" / "Moderate pain" as standalone warning signs,
;; a pain level is attached to whichever finding hurts (see islands/finding/PainLevel.tsx)
;; and these rules lift that finding's priority accordingly.
(system_priority_evaluation
  "Very urgent: finding with severe pain"
  all_ages
  "Very urgent"
  (clinical_finding
    (snomed_concept "Clinical finding" "finding")
    (attribute (snomed_concept "Pain level" "observable entity") (snomed_concept "Severe pain" "finding"))
  )
)
(system_priority_evaluation
  "Urgent: finding with moderate pain"
  all_ages
  Urgent
  (clinical_finding
    (snomed_concept "Clinical finding" "finding")
    (attribute (snomed_concept "Pain level" "observable entity") (snomed_concept "Moderate pain" "finding"))
  )
)

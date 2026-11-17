;; Page 158 - The mentally ill patient needing treatment or admission
;; Red box: "Give urgent attention if a delay in referral may lead to the patient's mental illness causing any of:"
;; The page's flowchart below the red box is the Mental Health Care Act consent/admission
;; process (voluntary / assisted / involuntary user, MHCA forms). It is management and legal
;; routing, not triage or diagnosis, so it has no rules (see the flowchart file).
(task
  "Check for urgent risks in the mentally ill patient needing admission"
  adult
  (clinical_finding (snomed_concept "Mental disorder" "disorder"))
  (check_for
    ;; Patient inflicting serious harm to self/others
    (clinical_finding (snomed_concept "At increased risk of self-injurious behavior" "finding"))
    (clinical_finding (snomed_concept "At increased risk for suicide" "finding"))
    (clinical_finding (snomed_concept "High risk of harm to others" "finding"))

    ;; Patient causing serious damage to or loss of property
    (clinical_finding (snomed_concept "At increased risk for destructive behavior to property" "finding"))
  )
)
(system_priority_evaluation
  "Urgent: mentally ill patient at risk of harm or property damage if referral delayed"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Mental disorder" "disorder"))
    (or
      (clinical_finding (snomed_concept "At increased risk of self-injurious behavior" "finding"))
      (clinical_finding (snomed_concept "At increased risk for suicide" "finding"))
      (clinical_finding (snomed_concept "High risk of harm to others" "finding"))
      (clinical_finding (snomed_concept "At increased risk for destructive behavior to property" "finding"))
    )
  )
)

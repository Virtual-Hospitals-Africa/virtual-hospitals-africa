;; Page 20 - Seizures/fits
;; Red box: "Give urgent attention to the patient who is unconscious and fitting".
;; Everything else on the page is management (positioning, oxygen, IV access, benzodiazepines,
;; levetiracetam, airway support, referral) or a pointer to another page (head injury 30,
;; low glucose 19, pregnancy 177). No "X likely" or "consider X" appears on the page.
(task
  "Check for urgent seizure/fit conditions"
  adult
  (clinical_finding (snomed_concept "Seizure" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Unconscious" "finding"))
  )
)
(system_priority_evaluation
  "Urgent: unconscious and fitting"
  adult
  Urgent
  (and (clinical_finding (snomed_concept "Seizure" "finding"))
       (clinical_finding (snomed_concept "Unconscious" "finding")))
)

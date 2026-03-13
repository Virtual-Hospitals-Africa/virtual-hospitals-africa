;; Page 79 - Jaundice
(task
  "Check for urgent jaundice conditions"
  adult
  (clinical_finding (snomed_concept "Jaundice" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
    (clinical_finding (snomed_concept "Acute abdominal pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Easy bruising" "finding"))
    (clinical_finding (snomed_concept "Finding of tendency to bleed" "finding"))
    (clinical_finding (snomed_concept "Bleeds easily" "finding"))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Alcohol dependence" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Illicit drug use" "finding"))
    (clinical_finding (snomed_concept "Taking medication" "observable entity"))
  )
)

;; Page 79 - Changes in Skin Colour
(task
  "Check for urgent skin colour change conditions"
  adult
  (clinical_finding (snomed_concept "Discoloration of skin" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Abdominal pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Easy bruising" "finding"))
    (clinical_finding (snomed_concept "Bleeds easily" "finding"))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Alcohol dependence" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Illicit drug use" "finding"))
    (clinical_finding (snomed_concept "Taking medication" "observable entity"))
  )
)

;; Page 44 - Abdominal Pain
(task
  "Check for urgent abdominal pain conditions"
  adult
  (clinical_finding (snomed_concept "Abdominal pain" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Delivery finding" "finding") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Miscarriage" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Unable to void urine" "finding"))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (clinical_finding (snomed_concept "Abdominal mass" "finding"))
    (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
    (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
    (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
    (<= (timestamp (clinical_finding (snomed_concept "Unable to break wind" "finding")))
        (time_ago 24 hours))
    (<= (timestamp (clinical_finding (snomed_concept "Acute constipation" "finding")))
        (time_ago 24 hours))
    (clinical_finding (snomed_concept "Tenderness of right upper quadrant of abdomen" "finding"))
    (clinical_finding (snomed_concept "Loss of appetite" "finding"))
    (and
      (clinical_finding (snomed_concept "Pain radiating to lumbar region of back" "finding"))
      (clinical_finding (snomed_concept "Vomiting" "disorder")))
    (and
      (clinical_finding (snomed_concept "Right lower quadrant pain" "finding"))
      (or
        (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Vomiting" "disorder"))
        (clinical_finding (snomed_concept "Fever" "finding"))))
    (and
      (clinical_finding (snomed_concept "Right upper quadrant pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      (or
        (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Fever" "finding"))
        (clinical_finding (snomed_concept "Loss of appetite" "finding"))))
    (and
      (clinical_finding (snomed_concept "Upper abdominal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      (clinical_finding (snomed_concept "Pain radiating to lumbar region of back" "finding")))
    (clinical_finding (snomed_concept "Generalized pruritus" "finding"))
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
    (clinical_finding (snomed_concept "Facial swelling" "finding"))
    (clinical_finding (snomed_concept "Tongue swelling" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Substance" "substance"))
  )
)

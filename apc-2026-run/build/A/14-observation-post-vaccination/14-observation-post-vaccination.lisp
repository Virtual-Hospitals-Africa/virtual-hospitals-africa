;; Page 14 - Observation post vaccination
(task
  "Check for adverse reaction after vaccination"
  adult
  (clinical_finding (snomed_concept "Vaccination given" "situation"))
  (check_for
    (clinical_finding (snomed_concept "Feeling faint" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Lightheadedness" "finding"))
    (clinical_finding (snomed_concept "Feels hot" "finding"))
    (clinical_finding (snomed_concept "Sensation of being cold" "finding"))
    (clinical_finding (snomed_concept "Sweating" "finding"))
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Blurring of visual image" "finding"))
    (clinical_finding (snomed_concept "Hearing difficulty" "finding"))
    (clinical_finding (snomed_concept "Pale complexion" "finding"))

    (clinical_finding (snomed_concept "Itching" "finding"))
    (clinical_finding (snomed_concept "Urticaria" "disorder"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Eye region structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Lip structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Hand structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Foot structure" "body structure")))
    (clinical_finding (snomed_concept "Nasal congestion" "finding"))
    (clinical_finding (snomed_concept "Urticaria" "disorder") (qualifier (snomed_concept "Generalized" "qualifier value")))

    (clinical_finding (snomed_concept "Wheezing" "finding"))
    (clinical_finding (snomed_concept "Cough" "finding"))
    (clinical_finding (snomed_concept "Tightness in throat" "finding"))
    (clinical_finding (snomed_concept "Stridor" "finding"))
    (clinical_finding (snomed_concept "Dyspnea" "finding"))
    (clinical_finding (snomed_concept "Hoarse" "finding"))
    (clinical_finding (snomed_concept "Difficulty swallowing" "finding"))
    (clinical_finding (snomed_concept "Dribbling from mouth" "finding"))

    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Diarrhea" "finding"))
    (clinical_finding (snomed_concept "Stomach cramps" "finding"))

    (clinical_finding (snomed_concept "Low blood pressure" "disorder"))
    (clinical_finding (snomed_concept "Respiratory distress" "finding"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Lip structure" "body structure")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))

    (clinical_finding (snomed_concept "Generally unwell" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable anaphylaxis after vaccination"
  (diagnosis
    (snomed_concept "Anaphylaxis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Vaccination given" "situation"))
    (or
      ;; Are 2 or more body systems involved? (each group counts once)
      (any2
        ;; Feeling faint/unwell symptoms (counted whether or not they improved quickly: not representable)
        (or
          (clinical_finding (snomed_concept "Feeling faint" "finding"))
          (clinical_finding (snomed_concept "Dizziness" "finding"))
          (clinical_finding (snomed_concept "Lightheadedness" "finding"))
          (clinical_finding (snomed_concept "Feels hot" "finding"))
          (clinical_finding (snomed_concept "Sensation of being cold" "finding"))
          (clinical_finding (snomed_concept "Sweating" "finding"))
          (clinical_finding (snomed_concept "Palpitations" "finding"))
          (clinical_finding (snomed_concept "Blurring of visual image" "finding"))
          (clinical_finding (snomed_concept "Hearing difficulty" "finding"))
          (clinical_finding (snomed_concept "Pale complexion" "finding"))
        )
        ;; Skin/mucosal symptoms
        (or
          (clinical_finding (snomed_concept "Itching" "finding"))
          (clinical_finding (snomed_concept "Urticaria" "disorder"))
          (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Eye region structure" "body structure")))
          (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Lip structure" "body structure")))
          (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
          (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
          (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Hand structure" "body structure")))
          (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Foot structure" "body structure")))
          (clinical_finding (snomed_concept "Nasal congestion" "finding"))
        )
        ;; Respiratory symptoms
        (or
          (clinical_finding (snomed_concept "Wheezing" "finding"))
          (clinical_finding (snomed_concept "Cough" "finding"))
          (clinical_finding (snomed_concept "Tightness in throat" "finding"))
          (clinical_finding (snomed_concept "Stridor" "finding"))
          (clinical_finding (snomed_concept "Dyspnea" "finding"))
          (clinical_finding (snomed_concept "Hoarse" "finding"))
          (clinical_finding (snomed_concept "Difficulty swallowing" "finding"))
          (clinical_finding (snomed_concept "Dribbling from mouth" "finding"))
          (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %) 92)
        )
        ;; Gastrointestinal symptoms
        (or
          (clinical_finding (snomed_concept "Nausea" "finding"))
          (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
          (clinical_finding (snomed_concept "Diarrhea" "finding"))
          (clinical_finding (snomed_concept "Stomach cramps" "finding"))
        )
      )
      ;; No. Generalised urticaria involving the whole body?
      (clinical_finding (snomed_concept "Urticaria" "disorder") (qualifier (snomed_concept "Generalized" "qualifier value")))
      ;; No. Serious or life-threatening, even if only single body system?
      (clinical_finding (snomed_concept "Low blood pressure" "disorder"))
      (clinical_finding (snomed_concept "Respiratory distress" "finding"))
      (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Lip structure" "body structure")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable pseudoallergic rash after vaccination"
  (diagnosis
    (snomed_concept "Non-allergic hypersensitivity reaction" "disorder")
    probable
  )
  adult
  ;; Isolated raised red rash, no other associated symptoms, patient remains well
  (and
    (clinical_finding (snomed_concept "Vaccination given" "situation"))
    (clinical_finding (snomed_concept "Urticaria" "disorder"))
    (no (clinical_finding (snomed_concept "Urticaria" "disorder") (qualifier (snomed_concept "Generalized" "qualifier value"))))
    (no (clinical_finding (snomed_concept "Feeling faint" "finding")))
    (no (clinical_finding (snomed_concept "Dizziness" "finding")))
    (no (clinical_finding (snomed_concept "Lightheadedness" "finding")))
    (no (clinical_finding (snomed_concept "Feels hot" "finding")))
    (no (clinical_finding (snomed_concept "Sensation of being cold" "finding")))
    (no (clinical_finding (snomed_concept "Sweating" "finding")))
    (no (clinical_finding (snomed_concept "Palpitations" "finding")))
    (no (clinical_finding (snomed_concept "Blurring of visual image" "finding")))
    (no (clinical_finding (snomed_concept "Hearing difficulty" "finding")))
    (no (clinical_finding (snomed_concept "Pale complexion" "finding")))
    (no (clinical_finding (snomed_concept "Itching" "finding")))
    (no (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Eye region structure" "body structure"))))
    (no (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Lip structure" "body structure"))))
    (no (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure"))))
    (no (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure"))))
    (no (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Hand structure" "body structure"))))
    (no (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Foot structure" "body structure"))))
    (no (clinical_finding (snomed_concept "Nasal congestion" "finding")))
    (no (clinical_finding (snomed_concept "Wheezing" "finding")))
    (no (clinical_finding (snomed_concept "Cough" "finding")))
    (no (clinical_finding (snomed_concept "Tightness in throat" "finding")))
    (no (clinical_finding (snomed_concept "Stridor" "finding")))
    (no (clinical_finding (snomed_concept "Dyspnea" "finding")))
    (no (clinical_finding (snomed_concept "Hoarse" "finding")))
    (no (clinical_finding (snomed_concept "Difficulty swallowing" "finding")))
    (no (clinical_finding (snomed_concept "Dribbling from mouth" "finding")))
    (no (clinical_finding (snomed_concept "Nausea" "finding")))
    (no (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (no (clinical_finding (snomed_concept "Diarrhea" "finding")))
    (no (clinical_finding (snomed_concept "Stomach cramps" "finding")))
    (no (clinical_finding (snomed_concept "Low blood pressure" "disorder")))
    (no (clinical_finding (snomed_concept "Respiratory distress" "finding")))
    (no (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value"))))
    (no (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Lip structure" "body structure")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value"))))
    (no (clinical_finding (snomed_concept "Generally unwell" "finding")))
  )
)

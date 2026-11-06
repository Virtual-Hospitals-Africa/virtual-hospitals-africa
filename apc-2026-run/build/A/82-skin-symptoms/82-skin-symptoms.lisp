;; Page 82 - Skin symptoms
(task
  "Check for urgent skin symptom conditions"
  adult
  (or (clinical_finding (snomed_concept "Skin finding" "finding"))
      (clinical_finding (snomed_concept "Disorder of skin" "disorder"))
      (clinical_finding (snomed_concept "Eruption" "morphologic abnormality"))
      (clinical_finding (snomed_concept "Itching" "finding")))
  (check_for
    ;; Anaphylaxis screen (red box bullet 1)
    (clinical_finding (snomed_concept "Generalized pruritus" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Generalized rash" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Wheezing" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Food" "substance"))
    (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
    (clinical_finding (snomed_concept "Insect sting" "disorder"))

    ;; Meningococcal disease (red box bullet 2)
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    (clinical_finding (snomed_concept "Erythematous rash" "disorder"))
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding"))

    ;; Serious drug reaction (red box bullet 3)
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
    (clinical_finding (snomed_concept "New medication commenced" "finding"))
    (clinical_finding (snomed_concept "Shock" "disorder"))
    (clinical_finding (snomed_concept "Diarrhea" "finding"))
    (clinical_finding (snomed_concept "Eruption" "morphologic abnormality") (finding_site (snomed_concept "Oral cavity structure" "body structure")))
    (clinical_finding (snomed_concept "Eruption" "morphologic abnormality") (finding_site (snomed_concept "Eye region structure" "body structure")))
    (clinical_finding (snomed_concept "Eruption" "morphologic abnormality") (finding_site (snomed_concept "Genital structure" "body structure")))
    (clinical_finding (snomed_concept "Blister of skin" "disorder"))
    (clinical_finding (snomed_concept "Peeling of skin" "finding"))
    (clinical_finding (snomed_concept "Denuded skin" "disorder"))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (clinical_finding (snomed_concept "Generally unwell" "finding"))
    (clinical_finding (snomed_concept "Malaise" "finding"))
    (clinical_finding (snomed_concept "Fatigue" "finding"))
    (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
  )
)
(task
  "Check for mpox features with skin symptoms"
  adult
  (or (clinical_finding (snomed_concept "Skin finding" "finding"))
      (clinical_finding (snomed_concept "Disorder of skin" "disorder"))
      (clinical_finding (snomed_concept "Eruption" "morphologic abnormality")))
  (check_for
    (clinical_finding (snomed_concept "Lesion" "morphologic abnormality") (finding_site (snomed_concept "Genital structure" "body structure")))
    (clinical_finding (snomed_concept "Lesion" "morphologic abnormality") (finding_site (snomed_concept "Anal structure" "body structure")))
    (clinical_finding (snomed_concept "Lesion" "morphologic abnormality") (finding_site (snomed_concept "Rectum structure" "body structure")))
    (clinical_finding (snomed_concept "Lesion" "morphologic abnormality") (finding_site (snomed_concept "Oral cavity structure" "body structure")))
    (clinical_finding (snomed_concept "Lesion" "morphologic abnormality") (finding_site (snomed_concept "Eye region structure" "body structure")))

    (clinical_finding (snomed_concept "Lymphadenopathy" "disorder"))
    (clinical_finding (snomed_concept "Nasal congestion" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose possible anaphylaxis from skin symptoms"
  (diagnosis
    (snomed_concept "Anaphylaxis" "disorder")
    possible
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Generalized pruritus" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Generalized rash" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value"))))
    (or (clinical_finding (snomed_concept "Wheezing" "finding"))
        (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
        (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
        (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
        (clinical_finding (snomed_concept "Dizziness" "finding"))
        (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Abdominal pain" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Food" "substance"))
        (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
        (clinical_finding (snomed_concept "Insect sting" "disorder")))
  )
)
(system_diagnosis_rule
  "Diagnose probable meningococcal disease from purple/red rash"
  (diagnosis
    (snomed_concept "Meningococcal infectious disease" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
        (clinical_finding (snomed_concept "Erythematous rash" "disorder")))
    (or (clinical_finding (snomed_concept "Stiff neck" "finding"))
        (clinical_finding (snomed_concept "Drowsy" "finding"))
        (clinical_finding (snomed_concept "Acute confusion" "finding"))
        (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
        (clinical_finding (snomed_concept "Headache" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable serious drug reaction with diffuse rash"
  (diagnosis
    (snomed_concept "Adverse reaction caused by drug" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
    (clinical_finding (snomed_concept "New medication commenced" "finding"))
    (<= (onset (clinical_finding (snomed_concept "New medication commenced" "finding"))) (time_ago 3 months))
    (or (clinical_finding (snomed_concept "Shock" "disorder"))
        (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
        (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
        (clinical_finding (snomed_concept "Abdominal pain" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
        (clinical_finding (snomed_concept "Diarrhea" "finding"))
        (clinical_finding (snomed_concept "Eruption" "morphologic abnormality") (finding_site (snomed_concept "Oral cavity structure" "body structure")))
        (clinical_finding (snomed_concept "Eruption" "morphologic abnormality") (finding_site (snomed_concept "Eye region structure" "body structure")))
        (clinical_finding (snomed_concept "Eruption" "morphologic abnormality") (finding_site (snomed_concept "Genital structure" "body structure")))
        (clinical_finding (snomed_concept "Blister of skin" "disorder"))
        (clinical_finding (snomed_concept "Peeling of skin" "finding"))
        (clinical_finding (snomed_concept "Denuded skin" "disorder"))
        (clinical_finding (snomed_concept "Jaundice" "finding"))
        (clinical_finding (snomed_concept "Generally unwell" "finding"))
        (clinical_finding (snomed_concept "Malaise" "finding"))
        (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
        (clinical_finding (snomed_concept "Difficulty breathing" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose possible mpox from skin symptoms"
  (diagnosis
    (snomed_concept "Monkeypox" "disorder")
    possible
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Eruption" "morphologic abnormality"))
        (clinical_finding (snomed_concept "Skin lesion" "disorder"))
        (clinical_finding (snomed_concept "Lesion" "morphologic abnormality") (finding_site (snomed_concept "Genital structure" "body structure")))
        (clinical_finding (snomed_concept "Lesion" "morphologic abnormality") (finding_site (snomed_concept "Anal structure" "body structure")))
        (clinical_finding (snomed_concept "Lesion" "morphologic abnormality") (finding_site (snomed_concept "Rectum structure" "body structure")))
        (clinical_finding (snomed_concept "Lesion" "morphologic abnormality") (finding_site (snomed_concept "Oral cavity structure" "body structure")))
        (clinical_finding (snomed_concept "Lesion" "morphologic abnormality") (finding_site (snomed_concept "Eye region structure" "body structure"))))
    (or (clinical_finding (snomed_concept "Headache" "finding"))
        (clinical_finding (snomed_concept "Backache" "finding"))
        (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
        (clinical_finding (snomed_concept "Lymphadenopathy" "disorder"))
        (> (measurement (snomed_concept "Body temperature" "observable entity") °C) 38.5)
        (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Sore throat" "finding"))
        (clinical_finding (snomed_concept "Nasal congestion" "finding"))
        (clinical_finding (snomed_concept "Cough" "finding")))
  )
)
(system_priority_evaluation
  "Urgent: skin symptoms with anaphylaxis signs, meningococcal disease or serious drug reaction"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Skin finding" "finding"))
        (clinical_finding (snomed_concept "Disorder of skin" "disorder"))
        (clinical_finding (snomed_concept "Eruption" "morphologic abnormality"))
        (clinical_finding (snomed_concept "Itching" "finding")))
    (or
      ;; Bullet 1: sudden generalised itch/rash or face/tongue swelling and any of the listed signs
      (and
        (or (clinical_finding (snomed_concept "Generalized pruritus" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
            (clinical_finding (snomed_concept "Generalized rash" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
            (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
            (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value"))))
        (or (clinical_finding (snomed_concept "Wheezing" "finding"))
            (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
            (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
            (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
            (clinical_finding (snomed_concept "Dizziness" "finding"))
            (clinical_finding (snomed_concept "Collapse" "finding"))
            (clinical_finding (snomed_concept "Abdominal pain" "finding"))
            (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
            (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
            (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Food" "substance"))
            (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
            (clinical_finding (snomed_concept "Insect sting" "disorder"))))
      ;; Bullet 2
      (active_condition (snomed_concept "Meningococcal infectious disease" "disorder"))
      ;; Bullet 3
      (active_condition (snomed_concept "Adverse reaction caused by drug" "disorder"))
    )
  )
)

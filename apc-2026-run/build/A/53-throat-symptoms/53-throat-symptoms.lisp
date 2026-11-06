;; Page 53 - Throat symptoms
(task
  "Check for urgent throat symptom conditions"
  adult
  (or (clinical_finding (snomed_concept "Sore throat" "finding"))
      (clinical_finding (snomed_concept "Difficulty swallowing" "finding"))
      (clinical_finding (snomed_concept "Swallowing painful" "finding")))
  (check_for
    (clinical_finding (snomed_concept "Unable to open mouth" "finding"))
    (clinical_finding (snomed_concept "Unable to swallow" "finding"))

    (clinical_finding (snomed_concept "Pharyngeal swelling" "finding"))
    (clinical_finding (snomed_concept "Upper respiratory tract obstruction" "disorder"))

    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Generalized pruritus" "finding"))
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
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
  )
)
(task
  "Assess throat symptoms not needing urgent attention"
  adult
  (or (clinical_finding (snomed_concept "Sore throat" "finding"))
      (clinical_finding (snomed_concept "Difficulty swallowing" "finding"))
      (clinical_finding (snomed_concept "Swallowing painful" "finding")))
  (check_for
    (clinical_finding (snomed_concept "White patches on oral mucosa" "finding"))

    (clinical_finding (snomed_concept "Redness of throat" "finding"))
    (clinical_finding (snomed_concept "Pseudomembrane" "morphologic abnormality") (finding_site (snomed_concept "Pharyngeal structure" "body structure")))
    (clinical_finding (snomed_concept "Pseudomembrane" "morphologic abnormality") (finding_site (snomed_concept "Nasal structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling of tonsil" "finding"))
    (clinical_finding (snomed_concept "Exudate on tonsils" "finding"))

    (clinical_finding (snomed_concept "Cough" "finding"))
    (clinical_finding (snomed_concept "Nasal discharge" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose possible anaphylaxis from throat symptoms with sudden face/tongue swelling"
  (diagnosis
    (snomed_concept "Anaphylaxis" "disorder")
    possible
  )
  adult
  (and
    ;; Red box: patient with throat symptoms ...
    (or (clinical_finding (snomed_concept "Sore throat" "finding"))
        (clinical_finding (snomed_concept "Difficulty swallowing" "finding"))
        (clinical_finding (snomed_concept "Swallowing painful" "finding")))
    ;; ... and sudden face/tongue swelling with any of the listed features -> check for anaphylaxis 28
    (and
        (or (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
            (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value"))))
        (or (clinical_finding (snomed_concept "Generalized pruritus" "finding"))
            (clinical_finding (snomed_concept "Generalized rash" "disorder"))
            (clinical_finding (snomed_concept "Wheezing" "finding"))
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
  )
)
(system_diagnosis_rule
  "Diagnose probable oesophageal candida from painful or difficult swallowing"
  (diagnosis
    (snomed_concept "Candidiasis of esophagus" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Difficulty swallowing" "finding"))
        (clinical_finding (snomed_concept "Swallowing painful" "finding")))
    (clinical_finding (snomed_concept "White patches on oral mucosa" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose possible diphtheria from throat/nose pseudomembrane"
  (diagnosis
    (snomed_concept "Diphtheria caused by Corynebacterium diphtheriae" "disorder")
    possible
  )
  adult
  ;; Q1 = Yes: sore throat and a thick grey layer (pseudomembrane) in throat/nose; fever is "with or without"
  (and
    (clinical_finding (snomed_concept "Sore throat" "finding"))
    (or (clinical_finding (snomed_concept "Pseudomembrane" "morphologic abnormality") (finding_site (snomed_concept "Pharyngeal structure" "body structure")))
        (clinical_finding (snomed_concept "Pseudomembrane" "morphologic abnormality") (finding_site (snomed_concept "Nasal structure" "body structure"))))
  )
)
(system_diagnosis_rule
  "Diagnose probable bacterial tonsillopharyngitis"
  (diagnosis
    (snomed_concept "Bacterial tonsillitis" "disorder")
    probable
  )
  adult
  (and
    ;; Q1 = No: no pseudomembrane in throat/nose
    (no (clinical_finding (snomed_concept "Pseudomembrane" "morphologic abnormality") (finding_site (snomed_concept "Pharyngeal structure" "body structure"))))
    (no (clinical_finding (snomed_concept "Pseudomembrane" "morphologic abnormality") (finding_site (snomed_concept "Nasal structure" "body structure"))))
    ;; Q2 = Yes: swollen tonsils and any of pus/white patches on tonsils, no cough, no runny nose
    (clinical_finding (snomed_concept "Swelling of tonsil" "finding"))
    (or (clinical_finding (snomed_concept "Exudate on tonsils" "finding"))
        (no (clinical_finding (snomed_concept "Cough" "finding")))
        (no (clinical_finding (snomed_concept "Nasal discharge" "finding"))))
  )
)
(system_diagnosis_rule
  "Diagnose probable viral tonsillopharyngitis"
  (diagnosis
    (snomed_concept "Viral tonsillitis" "disorder")
    probable
  )
  adult
  (and
    ;; Descriptive box on the No branch: red throat and/or swollen tonsils
    (or (clinical_finding (snomed_concept "Redness of throat" "finding"))
        (clinical_finding (snomed_concept "Swelling of tonsil" "finding")))
    ;; Q1 = No: no pseudomembrane in throat/nose
    (no (clinical_finding (snomed_concept "Pseudomembrane" "morphologic abnormality") (finding_site (snomed_concept "Pharyngeal structure" "body structure"))))
    (no (clinical_finding (snomed_concept "Pseudomembrane" "morphologic abnormality") (finding_site (snomed_concept "Nasal structure" "body structure"))))
    ;; Q2 = No: no swollen tonsils, or swollen tonsils without pus/white patches and with cough and runny nose
    (or (no (clinical_finding (snomed_concept "Swelling of tonsil" "finding")))
        (and (no (clinical_finding (snomed_concept "Exudate on tonsils" "finding")))
             (clinical_finding (snomed_concept "Cough" "finding"))
             (clinical_finding (snomed_concept "Nasal discharge" "finding"))))
  )
)
(system_priority_evaluation
  "Urgent: throat symptoms with danger signs"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Sore throat" "finding"))
        (clinical_finding (snomed_concept "Difficulty swallowing" "finding"))
        (clinical_finding (snomed_concept "Swallowing painful" "finding")))
    (or (clinical_finding (snomed_concept "Unable to open mouth" "finding"))
        (clinical_finding (snomed_concept "Unable to swallow" "finding"))
        ;; Red swelling blocking airway
        (and (clinical_finding (snomed_concept "Pharyngeal swelling" "finding"))
             (clinical_finding (snomed_concept "Upper respiratory tract obstruction" "disorder")))
        ;; Sudden face/tongue swelling and any of the anaphylaxis features
        (and
          (or (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
              (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value"))))
          (or (clinical_finding (snomed_concept "Generalized pruritus" "finding"))
              (clinical_finding (snomed_concept "Generalized rash" "disorder"))
              (clinical_finding (snomed_concept "Wheezing" "finding"))
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
    )
  )
)

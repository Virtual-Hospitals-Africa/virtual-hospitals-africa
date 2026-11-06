;; Page 52 - Mouth symptoms
;; Red box: give urgent attention to the patient with mouth symptoms and any of the listed signs
(task
  "Check for urgent mouth symptom conditions"
  adult
  (clinical_finding (snomed_concept "Mouth symptoms" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Unable to open mouth" "finding"))

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
  )
)
;; Approach to the patient with mouth symptoms not needing urgent attention
(task
  "Check mouth for white patches, blisters, ulcers, cracks and dry mouth"
  adult
  (clinical_finding (snomed_concept "Mouth symptoms" "finding"))
  (check_for
    (clinical_finding (snomed_concept "White patches on oral mucosa" "finding"))
    (clinical_finding (snomed_concept "Difficulty swallowing" "finding"))
    (clinical_finding (snomed_concept "Swallowing painful" "finding"))

    (clinical_finding (snomed_concept "Blister" "morphologic abnormality") (finding_site (snomed_concept "Lip structure" "body structure")))
    (clinical_finding (snomed_concept "Blister" "morphologic abnormality") (finding_site (snomed_concept "Oral cavity structure" "body structure")))

    (clinical_finding (snomed_concept "Ulcer of mouth" "disorder"))

    (clinical_finding (snomed_concept "Fissure" "morphologic abnormality") (finding_site (snomed_concept "Structure of angle of mouth" "body structure")))
    (clinical_finding (snomed_concept "Crust" "morphologic abnormality") (finding_site (snomed_concept "Skin structure of perioral region of face" "body structure")))
    (clinical_finding (snomed_concept "Blister" "morphologic abnormality") (finding_site (snomed_concept "Skin structure of perioral region of face" "body structure")))
    (clinical_finding (snomed_concept "Itching" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))

    (clinical_finding (snomed_concept "Xerostomia" "finding"))
    (clinical_finding (snomed_concept "Increased thirst" "finding"))
    (clinical_finding (snomed_concept "Increased frequency of urination" "finding"))
    (clinical_finding (snomed_concept "Weight decreased" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable oral thrush (mouth symptoms page)"
  (diagnosis
    (snomed_concept "Candidiasis of mouth" "disorder")
    probable
  )
  adult
  (clinical_finding (snomed_concept "White patches on oral mucosa" "finding"))
)
(system_diagnosis_rule
  "Diagnose probable oesophageal candida (mouth symptoms page)"
  (diagnosis
    (snomed_concept "Candidiasis of esophagus" "disorder")
    probable
  )
  adult
  ;; Box sits under the white-patches column: white patches and difficulty or pain on swallowing
  (and (clinical_finding (snomed_concept "White patches on oral mucosa" "finding"))
       (or (clinical_finding (snomed_concept "Difficulty swallowing" "finding"))
           (clinical_finding (snomed_concept "Swallowing painful" "finding"))))
)
(system_diagnosis_rule
  "Diagnose probable herpes simplex (mouth symptoms page)"
  (diagnosis
    (snomed_concept "Herpes simplex" "disorder")
    probable
  )
  adult
  (or (clinical_finding (snomed_concept "Blister" "morphologic abnormality") (finding_site (snomed_concept "Lip structure" "body structure")))
      (clinical_finding (snomed_concept "Blister" "morphologic abnormality") (finding_site (snomed_concept "Oral cavity structure" "body structure"))))
)
(system_diagnosis_rule
  "Diagnose probable aphthous ulcer (mouth symptoms page)"
  (diagnosis
    (snomed_concept "Aphthous ulcer of mouth" "disorder")
    probable
  )
  adult
  (clinical_finding (snomed_concept "Ulcer of mouth" "disorder"))
)
(system_diagnosis_rule
  "Diagnose probable angular cheilitis (mouth symptoms page)"
  (diagnosis
    (snomed_concept "Angular cheilitis" "disorder")
    probable
  )
  adult
  (clinical_finding (snomed_concept "Fissure" "morphologic abnormality") (finding_site (snomed_concept "Structure of angle of mouth" "body structure")))
)
(system_diagnosis_rule
  "Diagnose probable impetigo around the mouth (mouth symptoms page)"
  (diagnosis
    (snomed_concept "Impetigo" "disorder")
    probable
  )
  adult
  ;; Red, cracked corners of mouth column: "If crusts and blisters around mouth, impetigo likely"
  (and (clinical_finding (snomed_concept "Fissure" "morphologic abnormality") (finding_site (snomed_concept "Structure of angle of mouth" "body structure")))
       (clinical_finding (snomed_concept "Crust" "morphologic abnormality") (finding_site (snomed_concept "Skin structure of perioral region of face" "body structure")))
       (clinical_finding (snomed_concept "Blister" "morphologic abnormality") (finding_site (snomed_concept "Skin structure of perioral region of face" "body structure"))))
)
(system_diagnosis_rule
  "Diagnose probable contact dermatitis at corners of mouth (mouth symptoms page)"
  (diagnosis
    (snomed_concept "Contact dermatitis" "disorder")
    probable
  )
  adult
  ;; Red, cracked corners of mouth column: "If very itchy, contact dermatitis likely"
  (and (clinical_finding (snomed_concept "Fissure" "morphologic abnormality") (finding_site (snomed_concept "Structure of angle of mouth" "body structure")))
       (clinical_finding (snomed_concept "Itching" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value"))))
)
(system_diagnosis_rule
  "Diagnose possible diabetes from dry mouth (mouth symptoms page)"
  (diagnosis
    (snomed_concept "Diabetes mellitus" "disorder")
    possible
  )
  adult
  ;; Dry mouth column: "If thirst, urinary frequency, weight loss, check for diabetes 19"
  (and (clinical_finding (snomed_concept "Xerostomia" "finding"))
       (or (clinical_finding (snomed_concept "Increased thirst" "finding"))
           (clinical_finding (snomed_concept "Increased frequency of urination" "finding"))
           (clinical_finding (snomed_concept "Weight decreased" "finding"))))
)
(system_diagnosis_rule
  "Diagnose possible anaphylaxis from mouth symptoms"
  (diagnosis
    (snomed_concept "Anaphylaxis" "disorder")
    possible
  )
  adult
  ;; Red box bullet 2: sudden face/tongue swelling and any of ..., check for anaphylaxis 28
  (and (clinical_finding (snomed_concept "Mouth symptoms" "finding"))
       (or (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
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
)
(system_priority_evaluation
  "Urgent: mouth symptoms with inability to open mouth or anaphylaxis signs"
  adult
  Urgent
  (and (clinical_finding (snomed_concept "Mouth symptoms" "finding"))
       (or (clinical_finding (snomed_concept "Unable to open mouth" "finding"))
           (and (or (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
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
                    (clinical_finding (snomed_concept "Insect sting" "disorder"))))))
)

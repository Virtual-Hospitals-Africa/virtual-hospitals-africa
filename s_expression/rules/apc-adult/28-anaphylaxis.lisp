;; Page 28 - Anaphylaxis
;; Red box: "Give urgent attention to the patient with possible anaphylaxis" (see 28-anaphylaxis-flowchart.md)
(task
  "Check for anaphylaxis"
  adult
  (diagnosis (snomed_concept "Anaphylaxis" "disorder") possible)
  (check_for
    (clinical_finding (snomed_concept "Itching" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Eruption" "morphologic abnormality") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
    (clinical_finding (snomed_concept "Insect sting" "disorder"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))

    (allergy (snomed_concept "Fish" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Fish" "substance"))
    (allergy (snomed_concept "Milk" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Milk" "substance"))
    (allergy (snomed_concept "Eggs (edible)" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Eggs (edible)" "substance"))
    (allergy (snomed_concept "Peanut" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Peanut" "substance"))
    (allergy (snomed_concept "Tree nut" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Tree nut" "substance"))
    (allergy (snomed_concept "Drug or medicament" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
    (allergy (snomed_concept "Insect venom" "substance"))
  )
)
;; Assess the patient with previous anaphylaxis, at first visit, row "Other allergy"
(task
  "Assess the patient with previous anaphylaxis for other allergy"
  adult
  (clinical_finding (snomed_concept "History of anaphylaxis" "situation"))
  (check_for
    (clinical_finding (snomed_concept "Cough" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))
    (clinical_finding (snomed_concept "Wheezing" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))
    (clinical_finding (snomed_concept "Tight chest" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))

    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Wrist region structure" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Ankle region structure" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Structure of cubital fossa" "body structure")))
    (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Popliteal fossa structure" "body structure")))
    (clinical_finding (snomed_concept "Xeroderma" "disorder"))
    (clinical_finding (snomed_concept "Itching of skin" "finding"))

    (clinical_finding (snomed_concept "Wheal" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))

    (clinical_finding (snomed_concept "Sneezing" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))
    (clinical_finding (snomed_concept "Itching" "finding") (finding_site (snomed_concept "Nasal structure" "body structure")))
    (clinical_finding (snomed_concept "Nasal discharge" "finding"))
    (clinical_finding (snomed_concept "Nasal congestion" "finding"))

    (clinical_finding (snomed_concept "Watery eye" "finding"))
    (clinical_finding (snomed_concept "Itching of bilateral eyes" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable anaphylaxis"
  (diagnosis
    (snomed_concept "Anaphylaxis" "disorder")
    probable
  )
  adult
  (or
    ;; Q1 = Yes: exposed to medication, food or insect bite/sting which has caused anaphylaxis before
    (and (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Fish" "substance"))
         (allergy (snomed_concept "Fish" "substance")))
    (and (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Milk" "substance"))
         (allergy (snomed_concept "Milk" "substance")))
    (and (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Eggs (edible)" "substance"))
         (allergy (snomed_concept "Eggs (edible)" "substance")))
    (and (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Peanut" "substance"))
         (allergy (snomed_concept "Peanut" "substance")))
    (and (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Tree nut" "substance"))
         (allergy (snomed_concept "Tree nut" "substance")))
    (and (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
         (allergy (snomed_concept "Drug or medicament" "substance")))
    (and (or (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
             (clinical_finding (snomed_concept "Insect sting" "disorder")))
         (allergy (snomed_concept "Insect venom" "substance")))
    ;; Q1 = No, Q2 = Yes, Q3 = Yes: exposed, and sudden onset of >= 2 of the four groups
    (and
      (or (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Fish" "substance"))
          (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Milk" "substance"))
          (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Eggs (edible)" "substance"))
          (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Peanut" "substance"))
          (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Tree nut" "substance"))
          (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
          (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
          (clinical_finding (snomed_concept "Insect sting" "disorder"))
      )
      (any2
        (or (clinical_finding (snomed_concept "Itching" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
            (clinical_finding (snomed_concept "Eruption" "morphologic abnormality") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
            (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
            (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        )
        (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
        (or (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
            (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
            (clinical_finding (snomed_concept "Dizziness" "finding"))
            (clinical_finding (snomed_concept "Collapse" "finding"))
        )
        (or (clinical_finding (snomed_concept "Abdominal pain" "finding"))
            (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
        )
      )
    )
    ;; Q2 = No, Q4 = Yes: sudden onset skin sign and any of difficulty breathing, BP < 90/60, dizziness/collapse
    (and
      (or (clinical_finding (snomed_concept "Itching" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
          (clinical_finding (snomed_concept "Eruption" "morphologic abnormality") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
          (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
          (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      )
      (or (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
          (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
          (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
          (clinical_finding (snomed_concept "Dizziness" "finding"))
          (clinical_finding (snomed_concept "Collapse" "finding"))
      )
    )
  )
)
(system_diagnosis_rule
  "Diagnose possible anaphylaxis"
  (diagnosis
    (snomed_concept "Anaphylaxis" "disorder")
    possible
  )
  adult
  (or (clinical_finding (snomed_concept "Itching" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Eruption" "morphologic abnormality") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (any2
        (or (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
            (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
        )
        (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
        (clinical_finding (snomed_concept "Insect sting" "disorder"))
        (clinical_finding (snomed_concept "Itching" "finding"))
        (clinical_finding (snomed_concept "Eruption" "morphologic abnormality"))
        (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
        (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
        (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
        (clinical_finding (snomed_concept "Dizziness" "finding"))
        (clinical_finding (snomed_concept "Collapse" "finding"))
      )
  )
)
;; Other allergy: "If recurrent cough, wheeze, tight chest or difficulty breathing, exclude asthma"
(system_diagnosis_rule
  "Diagnose possible asthma in previous anaphylaxis"
  (diagnosis
    (snomed_concept "Asthma" "disorder")
    possible
  )
  adult
  (and (clinical_finding (snomed_concept "History of anaphylaxis" "situation"))
       (or (clinical_finding (snomed_concept "Cough" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))
           (clinical_finding (snomed_concept "Wheezing" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))
           (clinical_finding (snomed_concept "Tight chest" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))
           (clinical_finding (snomed_concept "Difficulty breathing" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))
       )
  )
)
;; Other allergy: "patches of dry, scaly, itchy skin on wrists, ankles, inside elbows or behind knees, eczema likely"
(system_diagnosis_rule
  "Diagnose probable eczema in previous anaphylaxis"
  (diagnosis
    (snomed_concept "Eczema" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "History of anaphylaxis" "situation"))
       (or (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Wrist region structure" "body structure")))
           (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Ankle region structure" "body structure")))
           (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Structure of cubital fossa" "body structure")))
           (clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Popliteal fossa structure" "body structure")))
       )
       (clinical_finding (snomed_concept "Xeroderma" "disorder"))
       (clinical_finding (snomed_concept "Itching of skin" "finding"))
  )
)
;; Other allergy: "itchy, red, raised wheals that appear suddenly and usually disappear within 24 hours, urticaria likely"
(system_diagnosis_rule
  "Diagnose probable urticaria in previous anaphylaxis"
  (diagnosis
    (snomed_concept "Urticaria" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "History of anaphylaxis" "situation"))
       (clinical_finding (snomed_concept "Wheal" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
       (clinical_finding (snomed_concept "Itching of skin" "finding"))
  )
)
;; Other allergy: "recurrent sneezing or itchy/runny/blocked nose most days for > 4 weeks, allergic rhinitis likely"
(system_diagnosis_rule
  "Diagnose probable allergic rhinitis in previous anaphylaxis"
  (diagnosis
    (snomed_concept "Allergic rhinitis" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "History of anaphylaxis" "situation"))
       (or (>= (onset (clinical_finding (snomed_concept "Sneezing" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))) (time_ago 4 weeks))
           (>= (onset (clinical_finding (snomed_concept "Itching" "finding") (finding_site (snomed_concept "Nasal structure" "body structure")))) (time_ago 4 weeks))
           (>= (onset (clinical_finding (snomed_concept "Nasal discharge" "finding"))) (time_ago 4 weeks))
           (>= (onset (clinical_finding (snomed_concept "Nasal congestion" "finding"))) (time_ago 4 weeks))
       )
  )
)
;; Other allergy: "both eyes watery and itchy, allergic conjunctivitis likely"
(system_diagnosis_rule
  "Diagnose probable allergic conjunctivitis in previous anaphylaxis"
  (diagnosis
    (snomed_concept "Allergic conjunctivitis" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "History of anaphylaxis" "situation"))
       (clinical_finding (snomed_concept "Watery eye" "finding"))
       (clinical_finding (snomed_concept "Itching of bilateral eyes" "finding"))
  )
)
(system_priority_evaluation
  "Urgent: anaphylaxis"
  adult
  Urgent
  (active_condition (snomed_concept "Anaphylaxis" "disorder"))
)

;; Page 20 - Anaphylaxis
(task
  "Check for Anaphylaxis"
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
(task
  "Raise legs"
  adult
  (active_condition (snomed_concept "Anaphylaxis" "disorder"))
  (manage
    (snomed_concept "Elevation of lower limb" "procedure")
  )
)
(task
  "Administer 100% face mask oxygen"
  adult
  (active_condition (snomed_concept "Anaphylaxis" "disorder"))
  (manage
    (snomed_concept "Oxygen therapy" "procedure")
  )
)
(task
  "Administer epinephrine 0.5mL (1:1000 solution) IM into mid outer thigh"
  adult
  (active_condition (snomed_concept "Anaphylaxis" "disorder"))
  (manage
    (snomed_concept "Product containing epinephrine" "medicinal product")
    (approved_by (role shcp))
  )
)
(task
  "Administer sodium chloride 0.9% 1-2L IV rapidly"
  adult
  (active_condition (snomed_concept "Anaphylaxis" "disorder"))
  (manage
    (snomed_concept "Product containing precisely sodium chloride 9 milligram/1 milliliter conventional release solution for infusion and/or injection" "clinical drug")
    (approved_by (role shcp))
  )
)
(task
  "Administer hydrocortisone 200mg IM/slow IV"
  adult
  (active_condition (snomed_concept "Anaphylaxis" "disorder"))
  (manage
    (snomed_concept "Product containing only hydrocortisone" "medicinal product")
    (approved_by (role shcp))
  )
)
(task
  "Administer promethazine 50mg IM/slow IV"
  adult
  (active_condition (snomed_concept "Anaphylaxis" "disorder"))
  (manage
    (snomed_concept "Product containing only promethazine" "medicinal product")
    (approved_by (role shcp))
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
    ;; Q1 = Yes: exposed to something which has caused anaphylaxis before (see 20-anaphylaxis-flowchart.md)
    (and (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Fish" "substance"))
         (allergy (snomed_concept "Fish" "substance")))
    (and (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Milk" "substance"))
         (allergy (snomed_concept "Milk" "substance")))
    (and (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Eggs (edible)" "substance"))
         (allergy (snomed_concept "Eggs (edible)" "substance")))
    (and (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Tree nut" "substance"))
         (allergy (snomed_concept "Tree nut" "substance")))
    (and (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Peanut" "substance"))
         (allergy (snomed_concept "Peanut" "substance")))
    (and (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
         (allergy (snomed_concept "Drug or medicament" "substance")))
    (and (or (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
             (clinical_finding (snomed_concept "Insect sting" "disorder")))
         (allergy (snomed_concept "Insect venom" "substance")))
    ;; Q2 = Yes: exposed to medication, food or insect bite/sting (no prior anaphylaxis to it) → need ≥ 2 symptom groups
    (and
      (or (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Fish" "substance"))
          (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Milk" "substance"))
          (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Eggs (edible)" "substance"))
          (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Tree nut" "substance"))
          (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Peanut" "substance"))
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
    ;; Q2 = No → Q4 = Yes: sudden onset skin sign AND any of difficulty breathing, BP < 90/60, dizziness/collapse
    ;; (the page's Q4 does not list abdominal pain/vomiting here)
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
(system_priority_evaluation
  "Urgent: Anaphylaxis"
  all_ages
  Urgent
  (active_condition (snomed_concept "Anaphylaxis" "disorder"))
)

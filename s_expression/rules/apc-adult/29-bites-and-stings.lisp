;; Page 29 - Bites and stings
;; See 29-bites-and-stings-flowchart.md and 29-bites-and-stings-remaining-questions.md.
;; Presenting complaint "bite/sting": Bite - wound (covers insect, spider, snake, animal, human bites and
;; scorpion poisoning by descent) or Venomous sting (covers insect sting and other stings).
;; Reconciled from builders A and B; see reconcile.json.
(task
  "Check for urgent bite/sting conditions"
  adult
  (or (clinical_finding (snomed_concept "Bite - wound" "disorder"))
      (clinical_finding (snomed_concept "Venomous sting" "disorder")))
  (check_for
    ;; Red box: type of bite/sting
    (clinical_finding (snomed_concept "Snake bite - wound" "disorder"))
    (clinical_finding (snomed_concept "Poisoning due to bite of Scorpiones" "disorder"))
    (clinical_finding (snomed_concept "Spider bite wound" "disorder"))
    (clinical_finding (snomed_concept "Dribbling from mouth" "finding"))
    (clinical_finding (snomed_concept "Restlessness" "finding"))
    (clinical_finding (snomed_concept "Cramp" "finding"))

    ;; Red box: wound
    (clinical_finding (snomed_concept "Deep bite wound" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Bite - wound" "disorder") (qualifier (snomed_concept "Large" "qualifier value")))
    (clinical_finding (snomed_concept "Bleeding" "finding"))
    (clinical_finding (snomed_concept "Toxic effect of venom" "disorder") (finding_site (snomed_concept "Structure of eye proper" "body structure")))

    ;; Red box: neurotoxicity
    (clinical_finding (snomed_concept "Muscle weakness" "finding"))
    (clinical_finding (snomed_concept "Has drooping eyelids" "finding"))
    (clinical_finding (snomed_concept "Difficulty swallowing" "finding"))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Diplopia" "disorder"))

    ;; Red box: shock (systolic BP is a routine vital)
    (clinical_finding (snomed_concept "Shock" "disorder"))

    ;; Red box: anaphylaxis likely (sudden onset of any of)
    (clinical_finding (snomed_concept "Generalized pruritus" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Generalized rash" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Itching" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Itching" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Tightness in throat" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Hoarse" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Cough" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Wheezing" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Collapse" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Abdominal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Nausea" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Diarrhea" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))

    ;; Spider bite or insect bite/sting: extensive local response -> papular urticaria likely
    (clinical_finding (snomed_concept "Insect bite reaction" "disorder") (qualifier (snomed_concept "Extensive" "qualifier value")))

    ;; Skin red, warm, painful -> cellulitis likely
    (clinical_finding (snomed_concept "Erythema" "finding"))
    (clinical_finding (snomed_concept "Warm skin" "finding"))
    (clinical_finding (snomed_concept "Pain of skin" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable anaphylaxis after bite/sting"
  (diagnosis
    (snomed_concept "Anaphylaxis" "disorder")
    probable
  )
  adult
  ;; Red box: bite/sting and sudden onset of any of the listed features, anaphylaxis likely 28.
  ;; The bite/sting itself is the "exposure to possible allergen" (footnote 3).
  (and
    (or (clinical_finding (snomed_concept "Bite - wound" "disorder"))
      (clinical_finding (snomed_concept "Venomous sting" "disorder")))
    (or
      (clinical_finding (snomed_concept "Generalized pruritus" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Generalized rash" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Itching" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Itching" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Tightness in throat" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Hoarse" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Cough" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Wheezing" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Collapse" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Abdominal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Nausea" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Diarrhea" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable papular urticaria after bite/sting"
  (diagnosis
    (snomed_concept "Prurigo simplex" "disorder")
    probable
  )
  adult
  ;; Spider bite or insect bite/sting: if extensive local response to bite, papular urticaria likely 84.
  ;; "Insect bite reaction" is itself a kind of insect bite, so no separate bite conjunct is needed.
  (clinical_finding (snomed_concept "Insect bite reaction" "disorder") (qualifier (snomed_concept "Extensive" "qualifier value")))
)
(system_diagnosis_rule
  "Diagnose probable cellulitis after bite/sting"
  (diagnosis
    (snomed_concept "Cellulitis" "disorder")
    probable
  )
  adult
  ;; If skin red, warm painful, cellulitis likely 83
  (and
    (or (clinical_finding (snomed_concept "Bite - wound" "disorder"))
      (clinical_finding (snomed_concept "Venomous sting" "disorder")))
    (clinical_finding (snomed_concept "Erythema" "finding"))
    (clinical_finding (snomed_concept "Warm skin" "finding"))
    (clinical_finding (snomed_concept "Pain of skin" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: bite/sting with snake bite - wound"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Bite - wound" "disorder"))
      (clinical_finding (snomed_concept "Venomous sting" "disorder")))
    (clinical_finding (snomed_concept "Snake bite - wound" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: bite/sting with spider bite wound and dribbling from mouth or restlessness or cramp"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Bite - wound" "disorder"))
      (clinical_finding (snomed_concept "Venomous sting" "disorder")))
    (clinical_finding (snomed_concept "Spider bite wound" "disorder"))
    (or (clinical_finding (snomed_concept "Dribbling from mouth" "finding"))
        (clinical_finding (snomed_concept "Restlessness" "finding"))
        (clinical_finding (snomed_concept "Cramp" "finding")))
  )
)

(system_priority_evaluation
  "Urgent: bite/sting with poisoning due to bite of Scorpiones"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Bite - wound" "disorder"))
      (clinical_finding (snomed_concept "Venomous sting" "disorder")))
    (clinical_finding (snomed_concept "Poisoning due to bite of Scorpiones" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: bite/sting with deep bite wound"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Bite - wound" "disorder"))
      (clinical_finding (snomed_concept "Venomous sting" "disorder")))
    (clinical_finding (snomed_concept "Deep bite wound" "morphologic abnormality"))
  )
)

(system_priority_evaluation
  "Urgent: bite/sting with bite - wound (large)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Bite - wound" "disorder"))
      (clinical_finding (snomed_concept "Venomous sting" "disorder")))
    (clinical_finding (snomed_concept "Bite - wound" "disorder") (qualifier (snomed_concept "Large" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: bite/sting with bleeding"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Bite - wound" "disorder"))
      (clinical_finding (snomed_concept "Venomous sting" "disorder")))
    (clinical_finding (snomed_concept "Bleeding" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: bite/sting with toxic effect of venom (site: structure of eye proper)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Bite - wound" "disorder"))
      (clinical_finding (snomed_concept "Venomous sting" "disorder")))
    (clinical_finding (snomed_concept "Toxic effect of venom" "disorder") (finding_site (snomed_concept "Structure of eye proper" "body structure")))
  )
)

(system_priority_evaluation
  "Urgent: bite/sting with muscle weakness"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Bite - wound" "disorder"))
      (clinical_finding (snomed_concept "Venomous sting" "disorder")))
    (clinical_finding (snomed_concept "Muscle weakness" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: bite/sting with has drooping eyelids"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Bite - wound" "disorder"))
      (clinical_finding (snomed_concept "Venomous sting" "disorder")))
    (clinical_finding (snomed_concept "Has drooping eyelids" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: bite/sting with difficulty swallowing"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Bite - wound" "disorder"))
      (clinical_finding (snomed_concept "Venomous sting" "disorder")))
    (clinical_finding (snomed_concept "Difficulty swallowing" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: bite/sting with difficulty talking"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Bite - wound" "disorder"))
      (clinical_finding (snomed_concept "Venomous sting" "disorder")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: bite/sting with diplopia"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Bite - wound" "disorder"))
      (clinical_finding (snomed_concept "Venomous sting" "disorder")))
    (clinical_finding (snomed_concept "Diplopia" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: bite/sting with shock"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Bite - wound" "disorder"))
      (clinical_finding (snomed_concept "Venomous sting" "disorder")))
    (clinical_finding (snomed_concept "Shock" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: bite/sting with systolic blood pressure < 80 mmHg"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Bite - wound" "disorder"))
      (clinical_finding (snomed_concept "Venomous sting" "disorder")))
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
  )
)

(system_priority_evaluation
  "Urgent: bite/sting with anaphylaxis"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Bite - wound" "disorder"))
      (clinical_finding (snomed_concept "Venomous sting" "disorder")))
    (active_condition (snomed_concept "Anaphylaxis" "disorder"))
  )
)

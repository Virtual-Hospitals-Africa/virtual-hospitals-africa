;; Page 29 - Bites and stings
(task
  "Check for urgent bite and sting conditions"
  adult
  (or (clinical_finding (snomed_concept "Bite - wound" "disorder"))
      (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
      (clinical_finding (snomed_concept "Insect sting" "disorder"))
  )
  (check_for
    ;; Type of bite/sting named in the red box
    (clinical_finding (snomed_concept "Snake bite - wound" "disorder"))
    (clinical_finding (snomed_concept "Poisoning due to bite of Scorpiones" "disorder"))
    (clinical_finding (snomed_concept "Spider bite wound" "disorder"))

    ;; Wound
    (clinical_finding (snomed_concept "Deep bite wound" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Bite - wound" "disorder") (qualifier (snomed_concept "Large" "qualifier value")))
    (clinical_finding (snomed_concept "Bleeding" "finding"))
    (clinical_finding (snomed_concept "Toxic effect of venom" "disorder") (finding_site (snomed_concept "Structure of eye proper" "body structure")))

    ;; Envenomation signs
    (clinical_finding (snomed_concept "Muscle weakness" "finding"))
    (clinical_finding (snomed_concept "Has drooping eyelids" "finding"))
    (clinical_finding (snomed_concept "Difficulty swallowing" "finding"))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Diplopia" "disorder"))
    (clinical_finding (snomed_concept "Shock" "disorder"))

    ;; Spider bite signs
    (clinical_finding (snomed_concept "Dribbling from mouth" "finding"))
    (clinical_finding (snomed_concept "Restlessness" "finding"))
    (clinical_finding (snomed_concept "Cramp" "finding"))

    ;; Sudden-onset allergic symptoms (anaphylaxis likely)
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

    ;; Non-urgent approach: papular urticaria and cellulitis
    (clinical_finding (snomed_concept "Insect bite reaction" "disorder") (qualifier (snomed_concept "Extensive" "qualifier value")))
    (clinical_finding (snomed_concept "Erythema" "finding"))
    (clinical_finding (snomed_concept "Warm skin" "finding"))
    (clinical_finding (snomed_concept "Pain of skin" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable anaphylaxis after a bite or sting"
  (diagnosis
    (snomed_concept "Anaphylaxis" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Bite - wound" "disorder"))
        (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
        (clinical_finding (snomed_concept "Insect sting" "disorder"))
        (clinical_finding (snomed_concept "Poisoning due to bite of Scorpiones" "disorder"))
    )
    (or (clinical_finding (snomed_concept "Generalized pruritus" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
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
  "Diagnose probable papular urticaria after a bite or sting"
  (diagnosis
    (snomed_concept "Prurigo simplex" "disorder")
    probable
  )
  adult
  ;; "Insect bite reaction" is itself a kind of "Insect bite - wound", so it carries the
  ;; "insect bite" context. SNOMED has no local-reaction concept for spider bites or stings.
  (clinical_finding (snomed_concept "Insect bite reaction" "disorder") (qualifier (snomed_concept "Extensive" "qualifier value")))
)
(system_diagnosis_rule
  "Diagnose probable cellulitis after a bite or sting"
  (diagnosis
    (snomed_concept "Cellulitis" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Bite - wound" "disorder"))
        (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
        (clinical_finding (snomed_concept "Insect sting" "disorder"))
    )
    (clinical_finding (snomed_concept "Erythema" "finding"))
    (clinical_finding (snomed_concept "Warm skin" "finding"))
    (clinical_finding (snomed_concept "Pain of skin" "finding"))
  )
)
(system_priority_evaluation
  "Urgent: bite or sting with danger signs"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Bite - wound" "disorder"))
        (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
        (clinical_finding (snomed_concept "Insect sting" "disorder"))
        (clinical_finding (snomed_concept "Poisoning due to bite of Scorpiones" "disorder"))
    )
    (or (clinical_finding (snomed_concept "Snake bite - wound" "disorder"))
        (clinical_finding (snomed_concept "Poisoning due to bite of Scorpiones" "disorder"))
        (clinical_finding (snomed_concept "Deep bite wound" "morphologic abnormality"))
        (clinical_finding (snomed_concept "Bite - wound" "disorder") (qualifier (snomed_concept "Large" "qualifier value")))
        (clinical_finding (snomed_concept "Bleeding" "finding"))
        (clinical_finding (snomed_concept "Toxic effect of venom" "disorder") (finding_site (snomed_concept "Structure of eye proper" "body structure")))
        (clinical_finding (snomed_concept "Muscle weakness" "finding"))
        (clinical_finding (snomed_concept "Has drooping eyelids" "finding"))
        (clinical_finding (snomed_concept "Difficulty swallowing" "finding"))
        (clinical_finding (snomed_concept "Difficulty talking" "finding"))
        (clinical_finding (snomed_concept "Diplopia" "disorder"))
        (clinical_finding (snomed_concept "Shock" "disorder"))
        (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
        (and (clinical_finding (snomed_concept "Spider bite wound" "disorder"))
             (or (clinical_finding (snomed_concept "Dribbling from mouth" "finding"))
                 (clinical_finding (snomed_concept "Restlessness" "finding"))
                 (clinical_finding (snomed_concept "Cramp" "finding"))
             )
        )
        (active_condition (snomed_concept "Anaphylaxis" "disorder"))
    )
  )
)

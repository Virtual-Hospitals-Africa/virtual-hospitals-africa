;; Page 38 - Fever
(task
  "Check for urgent fever conditions"
  adult
  (or (active_condition (snomed_concept "Fever" "finding"))
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38))
  (check_for
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))

    (clinical_finding (snomed_concept "Shock" "disorder"))

    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))

    (clinical_finding (snomed_concept "Tenderness of right lower quadrant of abdomen" "finding"))

    (clinical_finding (snomed_concept "Abdominal pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Backache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (clinical_finding (snomed_concept "Finding of tendency to bleed" "finding"))
    (clinical_finding (snomed_concept "Easy bruising" "finding"))
  )
)
(task
  "Check for causes of fever not needing urgent attention"
  adult
  (or (active_condition (snomed_concept "Fever" "finding"))
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38))
  (check_for
    (clinical_finding (snomed_concept "Tick bite" "disorder"))
    (clinical_finding (snomed_concept "Infestation caused by Ixodidae" "disorder"))
    (clinical_finding (snomed_concept "Infestation caused by Argasidae" "disorder"))

    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
    (clinical_finding (snomed_concept "Common cold" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))

    (clinical_finding (snomed_concept "Eruption" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Lesion" "morphologic abnormality") (finding_site (snomed_concept "Skin structure" "body structure")))
    (clinical_finding (snomed_concept "Lesion" "morphologic abnormality") (finding_site (snomed_concept "Genital structure" "body structure")))
    (clinical_finding (snomed_concept "Lesion" "morphologic abnormality") (finding_site (snomed_concept "Anal structure" "body structure")))
    (clinical_finding (snomed_concept "Lesion" "morphologic abnormality") (finding_site (snomed_concept "Rectum structure" "body structure")))
    (clinical_finding (snomed_concept "Lesion" "morphologic abnormality") (finding_site (snomed_concept "Oral cavity structure" "body structure")))
    (clinical_finding (snomed_concept "Lesion" "morphologic abnormality") (finding_site (snomed_concept "Structure of eye proper" "body structure")))
    (clinical_finding (snomed_concept "Backache" "finding"))
    (clinical_finding (snomed_concept "Lymphadenopathy" "disorder"))
    (clinical_finding (snomed_concept "Fatigue" "finding"))
    (clinical_finding (snomed_concept "Sore throat" "finding"))
    (clinical_finding (snomed_concept "Nasal congestion" "finding"))
    (clinical_finding (snomed_concept "Cough" "finding"))

    (clinical_finding (snomed_concept "Pseudomembrane" "morphologic abnormality") (finding_site (snomed_concept "Nasal structure" "body structure")))
    (clinical_finding (snomed_concept "Pseudomembrane" "morphologic abnormality") (finding_site (snomed_concept "Pharyngeal structure" "body structure")))
  )
)
(system_diagnosis_rule
  "Diagnose probable meningitis from fever page"
  (diagnosis
    (snomed_concept "Meningitis" "disorder")
    probable
  )
  adult
  (and
    (or (active_condition (snomed_concept "Fever" "finding"))
        (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38))
    (or (clinical_finding (snomed_concept "Stiff neck" "finding"))
        (clinical_finding (snomed_concept "Drowsy" "finding"))
        (clinical_finding (snomed_concept "Acute confusion" "finding"))
        (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable appendicitis from fever page"
  (diagnosis
    (snomed_concept "Appendicitis" "disorder")
    probable
  )
  adult
  (and
    (or (active_condition (snomed_concept "Fever" "finding"))
        (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38))
    (clinical_finding (snomed_concept "Tenderness of right lower quadrant of abdomen" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose possible mpox from fever page"
  (diagnosis
    (snomed_concept "Monkeypox" "disorder")
    possible
  )
  adult
  (and
    (or (active_condition (snomed_concept "Fever" "finding"))
        (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38))
    (or (clinical_finding (snomed_concept "Eruption" "morphologic abnormality"))
        (clinical_finding (snomed_concept "Lesion" "morphologic abnormality") (finding_site (snomed_concept "Skin structure" "body structure")))
        (clinical_finding (snomed_concept "Lesion" "morphologic abnormality") (finding_site (snomed_concept "Genital structure" "body structure")))
        (clinical_finding (snomed_concept "Lesion" "morphologic abnormality") (finding_site (snomed_concept "Anal structure" "body structure")))
        (clinical_finding (snomed_concept "Lesion" "morphologic abnormality") (finding_site (snomed_concept "Rectum structure" "body structure")))
        (clinical_finding (snomed_concept "Lesion" "morphologic abnormality") (finding_site (snomed_concept "Oral cavity structure" "body structure")))
        (clinical_finding (snomed_concept "Lesion" "morphologic abnormality") (finding_site (snomed_concept "Structure of eye proper" "body structure")))
    )
    (or (clinical_finding (snomed_concept "Headache" "finding"))
        (clinical_finding (snomed_concept "Backache" "finding"))
        (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
        (clinical_finding (snomed_concept "Lymphadenopathy" "disorder"))
        (> (measurement (snomed_concept "Body temperature" "observable entity") °C) 38.5)
        (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Sore throat" "finding"))
        (clinical_finding (snomed_concept "Nasal congestion" "finding"))
        (clinical_finding (snomed_concept "Cough" "finding"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose possible diphtheria from fever page"
  (diagnosis
    (snomed_concept "Diphtheria caused by Corynebacterium diphtheriae" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Sore throat" "finding"))
    (or (active_condition (snomed_concept "Fever" "finding"))
        (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38))
    (or (clinical_finding (snomed_concept "Pseudomembrane" "morphologic abnormality") (finding_site (snomed_concept "Nasal structure" "body structure")))
        (clinical_finding (snomed_concept "Pseudomembrane" "morphologic abnormality") (finding_site (snomed_concept "Pharyngeal structure" "body structure")))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable tick bite fever"
  (diagnosis
    (snomed_concept "South African tick-bite fever" "disorder")
    probable
  )
  adult
  (and
    (or (active_condition (snomed_concept "Fever" "finding"))
        (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38))
    (or (clinical_finding (snomed_concept "Tick bite" "disorder"))
        (clinical_finding (snomed_concept "Infestation caused by Ixodidae" "disorder"))
        (clinical_finding (snomed_concept "Infestation caused by Argasidae" "disorder"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable acute viral infection from fever page"
  (diagnosis
    (snomed_concept "Acute viral disease" "disorder")
    probable
  )
  adult
  (and
    (or (active_condition (snomed_concept "Fever" "finding"))
        (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38))
    ;; Tick question answered No (see 38-fever-flowchart.md)
    (no (clinical_finding (snomed_concept "Tick bite" "disorder")))
    (no (clinical_finding (snomed_concept "Infestation caused by Ixodidae" "disorder")))
    (no (clinical_finding (snomed_concept "Infestation caused by Argasidae" "disorder")))
    (or (clinical_finding (snomed_concept "Headache" "finding"))
        (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
        (clinical_finding (snomed_concept "Common cold" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    )
  )
)
(system_priority_evaluation
  "Urgent: fever with red-box danger signs"
  adult
  Urgent
  (and
    (or (active_condition (snomed_concept "Fever" "finding"))
        (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38))
    (or (clinical_finding (snomed_concept "Seizure" "finding"))
        (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
        (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
        (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
        (clinical_finding (snomed_concept "Shock" "disorder"))
        (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
        (active_condition (snomed_concept "Meningitis" "disorder"))
        (active_condition (snomed_concept "Appendicitis" "disorder"))
        (clinical_finding (snomed_concept "Abdominal pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
        (clinical_finding (snomed_concept "Backache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
        (clinical_finding (snomed_concept "Jaundice" "finding"))
        (clinical_finding (snomed_concept "Finding of tendency to bleed" "finding"))
        (clinical_finding (snomed_concept "Easy bruising" "finding"))
    )
  )
)

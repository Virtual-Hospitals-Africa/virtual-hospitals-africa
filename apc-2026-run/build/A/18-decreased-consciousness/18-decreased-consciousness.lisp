;; Page 18 - Decreased consciousness
(task
  "Check for causes of decreased consciousness"
  adult
  (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
  (check_for
    ;; Anaphylaxis screen (sudden decreased consciousness and any of …)
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Generalized pruritus" "finding"))
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
    (clinical_finding (snomed_concept "Wheezing" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Food" "substance"))
    (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
    (clinical_finding (snomed_concept "Insect sting" "disorder"))

    ;; Glucose ≥ 11.1 branch
    (clinical_finding (snomed_concept "Asthenia" "finding"))

    ;; Pupils
    (clinical_finding (snomed_concept "Constricted pupil" "finding"))
    (clinical_finding (snomed_concept "Dilated pupil" "finding") (finding_site (snomed_concept "Structure of pupil of both eyes" "body structure")))
    (clinical_finding (snomed_concept "Illicit drug use" "finding"))
    (clinical_finding (snomed_concept "Excessive salivation" "disorder"))
    (clinical_finding (snomed_concept "Excessive bronchial secretion" "finding"))
    (clinical_finding (snomed_concept "Muscle twitch" "finding"))
  )
)
(system_diagnosis_rule
  "Consider anaphylaxis in sudden decreased consciousness"
  (diagnosis
    (snomed_concept "Anaphylaxis" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (or (clinical_finding (snomed_concept "Generalized pruritus" "finding"))
        (clinical_finding (snomed_concept "Generalized rash" "disorder"))
        (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
        (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
        (clinical_finding (snomed_concept "Wheezing" "finding"))
        (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
        (clinical_finding (snomed_concept "Abdominal pain" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
        ;; exposure to possible allergen: footnote 1 = medication, food or insect bite/sting
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Food" "substance"))
        (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
        (clinical_finding (snomed_concept "Insect sting" "disorder"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable shock in decreased consciousness with glucose ≥ 11.1"
  (diagnosis
    (snomed_concept "Shock" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)
    (or (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
        (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
        (> (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
        (clinical_finding (snomed_concept "Asthenia" "finding"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose possible meningitis in decreased consciousness with fever"
  (diagnosis
    (snomed_concept "Meningitis" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
  )
)
(system_diagnosis_rule
  "Diagnose probable overdose in decreased consciousness with dilated pupils"
  (diagnosis
    (snomed_concept "Overdose" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Dilated pupil" "finding") (finding_site (snomed_concept "Structure of pupil of both eyes" "body structure")))
  )
)
(system_diagnosis_rule
  "Diagnose probable poisoning in decreased consciousness"
  (diagnosis
    (snomed_concept "Poisoning" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (or
      ;; Pinpoint pupils with illegal drug use and/or RR < 12, or with excessive secretions or muscle twitching
      (and
        (clinical_finding (snomed_concept "Constricted pupil" "finding"))
        (or (clinical_finding (snomed_concept "Illicit drug use" "finding"))
            (< (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 12)
            (clinical_finding (snomed_concept "Excessive salivation" "disorder"))
            (clinical_finding (snomed_concept "Excessive bronchial secretion" "finding"))
            (clinical_finding (snomed_concept "Muscle twitch" "finding"))
        )
      )
      ;; Both pupils equally dilated (stimulant or other drug overdose likely) also leads to Poisoning likely
      (clinical_finding (snomed_concept "Dilated pupil" "finding") (finding_site (snomed_concept "Structure of pupil of both eyes" "body structure")))
    )
  )
)
(system_priority_evaluation
  "Urgent: decreased consciousness"
  adult
  Urgent
  (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
)

;; Page 18 - Decreased consciousness
;; See 18-decreased-consciousness-flowchart.md for the decision tree.
;; Decreased consciousness = the general finding, or an AVPU level below Alert (voice, pain, unresponsive).
(task
  "Check for causes of decreased consciousness"
  adult
  (or (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
      (clinical_finding (snomed_concept "Impairment of mental alertness" "finding"))
      (clinical_finding (snomed_concept "Responds to pain" "finding"))
      (clinical_finding (snomed_concept "Unresponsive" "finding"))
  )
  (check_for
    ;; Anaphylaxis screen: sudden decreased consciousness and any of …
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

    ;; Glucose ≥ 11.1 branch: shock
    (clinical_finding (snomed_concept "Muscle weakness" "finding"))

    ;; Pupils branch: poisoning / overdose
    (clinical_finding (snomed_concept "Pin point pupils" "finding"))
    (clinical_finding (snomed_concept "Illicit drug use" "finding"))
    (clinical_finding (snomed_concept "Excessive salivation" "disorder"))
    (clinical_finding (snomed_concept "Bronchorrhea" "finding"))
    (clinical_finding (snomed_concept "Muscle twitch" "finding"))
    (clinical_finding (snomed_concept "Dilated pupil" "finding") (finding_site (snomed_concept "Structure of pupil of both eyes" "body structure")))
  )
)
(system_diagnosis_rule
  "Diagnose possible anaphylaxis with sudden decreased consciousness"
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
        ;; exposure to possible allergen: footnote 1, medication, food or insect bite/sting
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Food" "substance"))
        (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
        (clinical_finding (snomed_concept "Insect sting" "disorder"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable shock with decreased consciousness and glucose ≥ 11.1"
  (diagnosis
    (snomed_concept "Shock" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
        (clinical_finding (snomed_concept "Impairment of mental alertness" "finding"))
        (clinical_finding (snomed_concept "Responds to pain" "finding"))
        (clinical_finding (snomed_concept "Unresponsive" "finding"))
    )
    (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)
    (or (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
        (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
        (> (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
        (clinical_finding (snomed_concept "Muscle weakness" "finding"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose possible meningitis with decreased consciousness and temperature ≥ 38"
  (diagnosis
    (snomed_concept "Meningitis" "disorder")
    possible
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
        (clinical_finding (snomed_concept "Impairment of mental alertness" "finding"))
        (clinical_finding (snomed_concept "Responds to pain" "finding"))
        (clinical_finding (snomed_concept "Unresponsive" "finding"))
    )
    (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
  )
)
(system_diagnosis_rule
  "Diagnose probable drug overdose with decreased consciousness and dilated pupils"
  (diagnosis
    (snomed_concept "Overdose" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
        (clinical_finding (snomed_concept "Impairment of mental alertness" "finding"))
        (clinical_finding (snomed_concept "Responds to pain" "finding"))
        (clinical_finding (snomed_concept "Unresponsive" "finding"))
    )
    (clinical_finding (snomed_concept "Dilated pupil" "finding") (finding_site (snomed_concept "Structure of pupil of both eyes" "body structure")))
  )
)
(system_diagnosis_rule
  "Diagnose probable poisoning with decreased consciousness"
  (diagnosis
    (snomed_concept "Poisoning" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
        (clinical_finding (snomed_concept "Impairment of mental alertness" "finding"))
        (clinical_finding (snomed_concept "Responds to pain" "finding"))
        (clinical_finding (snomed_concept "Unresponsive" "finding"))
    )
    (or
      ;; Pinpoint pupils and (illegal drug use and/or RR < 12) or (excessive secretions or muscle twitching)
      (and (clinical_finding (snomed_concept "Pin point pupils" "finding"))
           (or (clinical_finding (snomed_concept "Illicit drug use" "finding"))
               (< (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 12)
               (clinical_finding (snomed_concept "Excessive salivation" "disorder"))
               (clinical_finding (snomed_concept "Bronchorrhea" "finding"))
               (clinical_finding (snomed_concept "Muscle twitch" "finding"))
           )
      )
      ;; Both equally dilated → stimulant or other drug overdose likely → poisoning likely
      (clinical_finding (snomed_concept "Dilated pupil" "finding") (finding_site (snomed_concept "Structure of pupil of both eyes" "body structure")))
    )
  )
)
(system_priority_evaluation
  "Urgent: decreased consciousness"
  adult
  Urgent
  (or (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
      (clinical_finding (snomed_concept "Impairment of mental alertness" "finding"))
      (clinical_finding (snomed_concept "Responds to pain" "finding"))
      (clinical_finding (snomed_concept "Unresponsive" "finding"))
  )
)

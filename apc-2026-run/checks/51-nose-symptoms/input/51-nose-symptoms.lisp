(task
  "Check for urgent nose symptom conditions"
  adult

  (clinical_finding (snomed_concept "Nose finding" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Injury of head" "disorder"))
    (clinical_finding (snomed_concept "Nasal discharge" "finding") (qualifier (snomed_concept "Clear" "qualifier value")) (qualifier (snomed_concept "Watery" "qualifier value")))
  )
)
(task
  "Check for causes of nose symptoms"
  adult

  (clinical_finding (snomed_concept "Nose finding" "finding"))
  (check_for

    (clinical_finding (snomed_concept "Nasal congestion" "finding"))
    (clinical_finding (snomed_concept "Bleeding from nose" "finding"))


    (clinical_finding (snomed_concept "Sore throat" "finding"))
    (clinical_finding (snomed_concept "Fever" "finding") (qualifier (snomed_concept "Mild" "qualifier value")))
    (clinical_finding (snomed_concept "Pseudomembrane" "morphologic abnormality") (finding_site (snomed_concept "Nasal structure" "body structure")))
    (clinical_finding (snomed_concept "Pseudomembrane" "morphologic abnormality") (finding_site (snomed_concept "Pharyngeal structure" "body structure")))


    (clinical_finding (snomed_concept "Chill" "finding"))
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Muscle pain" "finding"))


    (clinical_finding (snomed_concept "Tenderness over frontal sinus" "finding"))
    (clinical_finding (snomed_concept "Tenderness over maxillary sinus" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Common cold" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))


    (clinical_finding (snomed_concept "Sneezing" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))
    (clinical_finding (snomed_concept "Itching" "finding") (finding_site (snomed_concept "Nasal structure" "body structure")) (qualifier (snomed_concept "Recurrent" "qualifier value")))
    (clinical_finding (snomed_concept "Nasal discharge" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))
    (clinical_finding (snomed_concept "Nasal congestion" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))


    (clinical_finding (snomed_concept "Persistent cough" "finding"))
    (clinical_finding (snomed_concept "Clearing throat - hawking" "finding") (qualifier (snomed_concept "Frequent" "qualifier value")))


    (clinical_finding (snomed_concept "Repetitive rubbing of body parts" "finding") (finding_site (snomed_concept "Nasal structure" "body structure")))
    (clinical_finding (snomed_concept "Itching" "finding") (finding_site (snomed_concept "Nasal structure" "body structure")))
  )
)
(system_diagnosis_rule
  "Diagnose possible diphtheria from nose symptoms"
  (diagnosis
    (snomed_concept "Diphtheria caused by Corynebacterium diphtheriae" "disorder")
    possible
  )
  adult
  (and (clinical_finding (snomed_concept "Sore throat" "finding"))
       (clinical_finding (snomed_concept "Fever" "finding") (qualifier (snomed_concept "Mild" "qualifier value")))
       (or (clinical_finding (snomed_concept "Pseudomembrane" "morphologic abnormality") (finding_site (snomed_concept "Nasal structure" "body structure")))
           (clinical_finding (snomed_concept "Pseudomembrane" "morphologic abnormality") (finding_site (snomed_concept "Pharyngeal structure" "body structure")))))
)
(system_diagnosis_rule
  "Diagnose probable common cold from nose symptoms"
  (diagnosis
    (snomed_concept "Common cold" "disorder")
    probable
  )
  adult
  (and

    (or (clinical_finding (snomed_concept "Nasal discharge" "finding"))
        (clinical_finding (snomed_concept "Nasal congestion" "finding")))

    (or (<= (onset (clinical_finding (snomed_concept "Sore throat" "finding"))) (time_ago 3 days))
        (<= (onset (active_condition (snomed_concept "Fever" "finding"))) (time_ago 3 days)))

    (< (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
    (no (clinical_finding (snomed_concept "Chill" "finding")))
    (no (clinical_finding (snomed_concept "Nausea" "finding")))
    (no (clinical_finding (snomed_concept "Muscle pain" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable acute viral infection from nose symptoms"
  (diagnosis
    (snomed_concept "Acute viral disease" "disorder")
    probable
  )
  adult
  (and

    (or (clinical_finding (snomed_concept "Nasal discharge" "finding"))
        (clinical_finding (snomed_concept "Nasal congestion" "finding")))

    (or (<= (onset (clinical_finding (snomed_concept "Sore throat" "finding"))) (time_ago 3 days))
        (<= (onset (active_condition (snomed_concept "Fever" "finding"))) (time_ago 3 days)))

    (or (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
        (clinical_finding (snomed_concept "Chill" "finding"))
        (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Muscle pain" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable sinusitis from nose symptoms"
  (diagnosis
    (snomed_concept "Sinusitis" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Nasal discharge" "finding"))
        (clinical_finding (snomed_concept "Nasal congestion" "finding")))

    (or (clinical_finding (snomed_concept "Tenderness over frontal sinus" "finding"))
        (clinical_finding (snomed_concept "Tenderness over maxillary sinus" "finding")))

    (clinical_finding (snomed_concept "Headache" "finding"))

    (clinical_finding (snomed_concept "Common cold" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose probable allergic rhinitis from nose symptoms"
  (diagnosis
    (snomed_concept "Allergic rhinitis" "disorder")
    probable
  )
  adult

  (or (>= (onset (clinical_finding (snomed_concept "Sneezing" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))) (time_ago 4 weeks))
      (>= (onset (clinical_finding (snomed_concept "Itching" "finding") (finding_site (snomed_concept "Nasal structure" "body structure")) (qualifier (snomed_concept "Recurrent" "qualifier value")))) (time_ago 4 weeks))
      (>= (onset (clinical_finding (snomed_concept "Nasal discharge" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))) (time_ago 4 weeks))
      (>= (onset (clinical_finding (snomed_concept "Nasal congestion" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))) (time_ago 4 weeks)))
)
(system_diagnosis_rule
  "Diagnose probable postnasal drip from nose symptoms"
  (diagnosis
    (snomed_concept "Posterior rhinorrhea" "disorder")
    probable
  )
  adult

  (and (clinical_finding (snomed_concept "Nasal discharge" "finding"))
       (or (clinical_finding (snomed_concept "Persistent cough" "finding"))
           (clinical_finding (snomed_concept "Clearing throat - hawking" "finding") (qualifier (snomed_concept "Frequent" "qualifier value")))))
)
(system_diagnosis_rule
  "Diagnose possible allergic rhinitis from nosebleed"
  (diagnosis
    (snomed_concept "Allergic rhinitis" "disorder")
    possible
  )
  adult

  (and (clinical_finding (snomed_concept "Bleeding from nose" "finding"))
       (or (clinical_finding (snomed_concept "Repetitive rubbing of body parts" "finding") (finding_site (snomed_concept "Nasal structure" "body structure")))
           (clinical_finding (snomed_concept "Itching" "finding") (finding_site (snomed_concept "Nasal structure" "body structure")))))
)
(system_priority_evaluation
  "Urgent: nose symptoms with head injury and clear watery nasal discharge"
  adult
  Urgent

  (and (clinical_finding (snomed_concept "Injury of head" "disorder"))
       (clinical_finding (snomed_concept "Nasal discharge" "finding") (qualifier (snomed_concept "Clear" "qualifier value")) (qualifier (snomed_concept "Watery" "qualifier value"))))
)

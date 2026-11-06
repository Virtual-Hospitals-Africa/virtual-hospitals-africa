(task
  "Check for urgent low mood, stress or anxiety conditions"
  adult
  (or (clinical_finding (snomed_concept "Depressed mood" "finding"))
      (clinical_finding (snomed_concept "Stress" "finding"))
      (clinical_finding (snomed_concept "Anxiety" "finding")))
  (check_for

    (clinical_finding (snomed_concept "Suicidal thoughts" "finding"))
    (clinical_finding (snomed_concept "Suicidal behavior" "finding"))
  )
)
(task
  "Check for generalised anxiety disorder and PTSD features"
  adult
  (or (clinical_finding (snomed_concept "Depressed mood" "finding"))
      (clinical_finding (snomed_concept "Stress" "finding"))
      (clinical_finding (snomed_concept "Anxiety" "finding")))
  (check_for

    (clinical_finding (snomed_concept "Worried" "finding") (qualifier (snomed_concept "Excessive" "qualifier value")))
    (clinical_finding (snomed_concept "Distress" "finding"))


    (clinical_finding (snomed_concept "Muscle tension" "finding"))
    (clinical_finding (snomed_concept "Restlessness" "finding"))
    (clinical_finding (snomed_concept "Feeling irritable" "finding"))
    (clinical_finding (snomed_concept "Difficulty sleeping" "finding"))
    (clinical_finding (snomed_concept "Poor concentration" "finding"))
    (clinical_finding (snomed_concept "Fatigue" "finding"))


    (clinical_finding (snomed_concept "Victim of psychological trauma" "finding"))


    (clinical_finding (snomed_concept "Nightmares" "finding"))
    (clinical_finding (snomed_concept "Flashback due to and following trauma" "finding"))
    (clinical_finding (snomed_concept "Avoidance behavior" "finding"))
    (clinical_finding (snomed_concept "Hypervigilant behavior" "finding"))
    (clinical_finding (snomed_concept "Predisposed to startle" "finding"))
    (clinical_finding (snomed_concept "Emotionally detached" "finding"))
    (clinical_finding (snomed_concept "Derealization" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable generalised anxiety disorder (low mood, stress or anxiety page)"
  (diagnosis
    (snomed_concept "Generalized anxiety disorder" "disorder")
    probable
  )
  adult
  (and

    (>= (onset (clinical_finding (snomed_concept "Worried" "finding") (qualifier (snomed_concept "Excessive" "qualifier value")))) (time_ago 6 months))

    (clinical_finding (snomed_concept "Distress" "finding"))

    (or
      (and (clinical_finding (snomed_concept "Muscle tension" "finding"))
           (any2 (clinical_finding (snomed_concept "Restlessness" "finding"))
                 (clinical_finding (snomed_concept "Feeling irritable" "finding"))
                 (clinical_finding (snomed_concept "Difficulty sleeping" "finding"))
                 (clinical_finding (snomed_concept "Poor concentration" "finding"))
                 (clinical_finding (snomed_concept "Fatigue" "finding"))))
      (and (clinical_finding (snomed_concept "Restlessness" "finding"))
           (any2 (clinical_finding (snomed_concept "Feeling irritable" "finding"))
                 (clinical_finding (snomed_concept "Difficulty sleeping" "finding"))
                 (clinical_finding (snomed_concept "Poor concentration" "finding"))
                 (clinical_finding (snomed_concept "Fatigue" "finding"))))
      (and (clinical_finding (snomed_concept "Feeling irritable" "finding"))
           (any2 (clinical_finding (snomed_concept "Difficulty sleeping" "finding"))
                 (clinical_finding (snomed_concept "Poor concentration" "finding"))
                 (clinical_finding (snomed_concept "Fatigue" "finding"))))
      (and (clinical_finding (snomed_concept "Difficulty sleeping" "finding"))
           (clinical_finding (snomed_concept "Poor concentration" "finding"))
           (clinical_finding (snomed_concept "Fatigue" "finding")))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable post-traumatic stress disorder (low mood, stress or anxiety page)"
  (diagnosis
    (snomed_concept "Post-traumatic stress disorder" "disorder")
    probable
  )
  adult
  (and

    (>= (onset (clinical_finding (snomed_concept "Anxiety" "finding"))) (time_ago 1 months))

    (clinical_finding (snomed_concept "Victim of psychological trauma" "finding"))

    (or
      (and (or (clinical_finding (snomed_concept "Nightmares" "finding"))
               (clinical_finding (snomed_concept "Flashback due to and following trauma" "finding")))
           (any2 (clinical_finding (snomed_concept "Avoidance behavior" "finding"))
                 (or (clinical_finding (snomed_concept "Hypervigilant behavior" "finding"))
                     (clinical_finding (snomed_concept "Predisposed to startle" "finding")))
                 (or (clinical_finding (snomed_concept "Emotionally detached" "finding"))
                     (clinical_finding (snomed_concept "Derealization" "finding")))))
      (and (clinical_finding (snomed_concept "Avoidance behavior" "finding"))
           (or (clinical_finding (snomed_concept "Hypervigilant behavior" "finding"))
               (clinical_finding (snomed_concept "Predisposed to startle" "finding")))
           (or (clinical_finding (snomed_concept "Emotionally detached" "finding"))
               (clinical_finding (snomed_concept "Derealization" "finding"))))
    )
  )
)
(system_priority_evaluation
  "Urgent: low mood, stress or anxiety with suicidal thoughts or behaviour"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Depressed mood" "finding"))
        (clinical_finding (snomed_concept "Stress" "finding"))
        (clinical_finding (snomed_concept "Anxiety" "finding")))
    (or (clinical_finding (snomed_concept "Suicidal thoughts" "finding"))
        (clinical_finding (snomed_concept "Suicidal behavior" "finding")))
  )
)

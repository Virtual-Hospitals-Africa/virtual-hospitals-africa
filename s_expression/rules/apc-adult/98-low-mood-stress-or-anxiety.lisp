;; Page 98 - Low mood, stress or anxiety
(task
  "Check for urgent low mood, stress or anxiety conditions"
  adult
  (or (clinical_finding (snomed_concept "Depressed mood" "finding"))
      (clinical_finding (snomed_concept "Stress" "finding"))
      (clinical_finding (snomed_concept "Anxiety" "finding")))
  (check_for
    ;; Red box: suicidal thoughts or behaviour
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
    ;; Generalised anxiety disorder: excessive worry causing impaired function/distress
    (clinical_finding (snomed_concept "Worried" "finding") (qualifier (snomed_concept "Excessive" "qualifier value")))
    (clinical_finding (snomed_concept "Distress" "finding"))

    ;; Generalised anxiety disorder: >= 3 of these
    (clinical_finding (snomed_concept "Muscle tension" "finding"))
    (clinical_finding (snomed_concept "Restlessness" "finding"))
    (clinical_finding (snomed_concept "Feeling irritable" "finding"))
    (clinical_finding (snomed_concept "Difficulty sleeping" "finding"))
    (clinical_finding (snomed_concept "Poor concentration" "finding"))
    (clinical_finding (snomed_concept "Fatigue" "finding"))

    ;; PTSD: anxiety linked to a bad experience
    (clinical_finding (snomed_concept "Victim of psychological trauma" "finding"))

    ;; PTSD: >= 3 of these
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
    ;; excessive worry for at least 6 months
    (>= (onset (clinical_finding (snomed_concept "Worried" "finding") (qualifier (snomed_concept "Excessive" "qualifier value")))) (time_ago 6 months))
    ;; causing impaired function/distress (only distress is representable)
    (clinical_finding (snomed_concept "Distress" "finding"))
    ;; >= 3 of six symptoms, written as: first present item plus at least 2 of the items after it
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
    ;; anxiety > 1 month (written as >= 1 month; the database rejects >)
    (>= (onset (clinical_finding (snomed_concept "Anxiety" "finding"))) (time_ago 1 months))
    ;; linked to a bad experience
    (clinical_finding (snomed_concept "Victim of psychological trauma" "finding"))
    ;; >= 3 of four groups, written as: first group plus 2 of the rest, or the last three groups
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

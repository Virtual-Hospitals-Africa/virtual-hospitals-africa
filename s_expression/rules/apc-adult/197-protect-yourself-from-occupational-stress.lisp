;; Page 197 - Protect yourself from occupational stress
;; The patient here is the health worker. Trigger: occupational stress (Stress at work).
(task
  "Check for urgent features and signs of occupational stress in the health worker"
  adult
  (clinical_finding (snomed_concept "Stress at work" "finding"))
  (check_for
    ;; Red box: arrange urgent assessment
    (clinical_finding (snomed_concept "Intoxication caused by psychoactive substance" "disorder"))
    (clinical_finding (snomed_concept "Inappropriate behavior" "finding"))
    (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
    (clinical_finding (snomed_concept "Physical aggression" "finding"))
    (clinical_finding (snomed_concept "Suicidal thoughts" "finding"))
    (clinical_finding (snomed_concept "Planning suicide" "finding"))

    ;; Identify occupational stress: Possible alcohol or drug problem
    (clinical_finding (snomed_concept "Heavy drinking session" "finding"))
    (clinical_finding (snomed_concept "Illicit drug use" "finding"))
    (clinical_finding (snomed_concept "Misuse of medication" "finding"))
    (clinical_finding (snomed_concept "Smell of alcohol on breath" "finding"))

    ;; Identify occupational stress: Change in mood
    (clinical_finding (snomed_concept "Indifference" "finding"))
    (clinical_finding (snomed_concept "Feeling tense" "finding"))
    (clinical_finding (snomed_concept "Feeling irritable" "finding"))
    (clinical_finding (snomed_concept "Feeling angry" "finding"))
    (clinical_finding (snomed_concept "Depressed mood" "finding"))
    (clinical_finding (snomed_concept "Feeling hopeless" "finding"))
    (clinical_finding (snomed_concept "Loss of interest" "finding"))
    (clinical_finding (snomed_concept "Anhedonia" "finding"))

    ;; Identify occupational stress: Recent distressing event
    (clinical_finding (snomed_concept "Bereavement" "finding"))
    (clinical_finding (snomed_concept "Accidental needle stick injury" "disorder"))
    (clinical_finding (snomed_concept "Traumatic event" "event"))

    ;; Identify occupational stress: Poor attendance at work
    (clinical_finding (snomed_concept "Absenteeism at work" "finding"))
    (clinical_finding (snomed_concept "Excess sick leave" "finding"))

    ;; Identify occupational stress: Marked decline in work performance
    (clinical_finding (snomed_concept "Poor concentration" "finding"))
    (clinical_finding (snomed_concept "Fatigue" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose possible substance misuse in health worker with occupational stress"
  (diagnosis
    (snomed_concept "Substance misuse behavior" "finding")
    possible
  )
  adult
  ;; "The health worker with any of the above may have ... substance misuse ..."
  (and (clinical_finding (snomed_concept "Stress at work" "finding"))
       (or
         (clinical_finding (snomed_concept "Heavy drinking session" "finding"))
         (clinical_finding (snomed_concept "Illicit drug use" "finding"))
         (clinical_finding (snomed_concept "Misuse of medication" "finding"))
         (clinical_finding (snomed_concept "Smell of alcohol on breath" "finding"))
         (clinical_finding (snomed_concept "Indifference" "finding"))
         (clinical_finding (snomed_concept "Feeling tense" "finding"))
         (clinical_finding (snomed_concept "Feeling irritable" "finding"))
         (clinical_finding (snomed_concept "Feeling angry" "finding"))
         (clinical_finding (snomed_concept "Depressed mood" "finding"))
         (clinical_finding (snomed_concept "Feeling hopeless" "finding"))
         (clinical_finding (snomed_concept "Loss of interest" "finding"))
         (clinical_finding (snomed_concept "Anhedonia" "finding"))
         (clinical_finding (snomed_concept "Bereavement" "finding"))
         (clinical_finding (snomed_concept "Accidental needle stick injury" "disorder"))
         (clinical_finding (snomed_concept "Traumatic event" "event"))
         (clinical_finding (snomed_concept "Absenteeism at work" "finding"))
         (clinical_finding (snomed_concept "Excess sick leave" "finding"))
         (clinical_finding (snomed_concept "Poor concentration" "finding"))
         (clinical_finding (snomed_concept "Fatigue" "finding"))
       )
  )
)
(system_diagnosis_rule
  "Diagnose possible depression in health worker with occupational stress"
  (diagnosis
    (snomed_concept "Depressive disorder" "disorder")
    possible
  )
  adult
  ;; "The health worker with any of the above may have ... depression ..."
  (and (clinical_finding (snomed_concept "Stress at work" "finding"))
       (or
         (clinical_finding (snomed_concept "Heavy drinking session" "finding"))
         (clinical_finding (snomed_concept "Illicit drug use" "finding"))
         (clinical_finding (snomed_concept "Misuse of medication" "finding"))
         (clinical_finding (snomed_concept "Smell of alcohol on breath" "finding"))
         (clinical_finding (snomed_concept "Indifference" "finding"))
         (clinical_finding (snomed_concept "Feeling tense" "finding"))
         (clinical_finding (snomed_concept "Feeling irritable" "finding"))
         (clinical_finding (snomed_concept "Feeling angry" "finding"))
         (clinical_finding (snomed_concept "Depressed mood" "finding"))
         (clinical_finding (snomed_concept "Feeling hopeless" "finding"))
         (clinical_finding (snomed_concept "Loss of interest" "finding"))
         (clinical_finding (snomed_concept "Anhedonia" "finding"))
         (clinical_finding (snomed_concept "Bereavement" "finding"))
         (clinical_finding (snomed_concept "Accidental needle stick injury" "disorder"))
         (clinical_finding (snomed_concept "Traumatic event" "event"))
         (clinical_finding (snomed_concept "Absenteeism at work" "finding"))
         (clinical_finding (snomed_concept "Excess sick leave" "finding"))
         (clinical_finding (snomed_concept "Poor concentration" "finding"))
         (clinical_finding (snomed_concept "Fatigue" "finding"))
       )
  )
)
(system_diagnosis_rule
  "Diagnose possible anxiety in health worker with occupational stress"
  (diagnosis
    (snomed_concept "Anxiety disorder" "disorder")
    possible
  )
  adult
  ;; "The health worker with any of the above may have ... anxiety ..."
  (and (clinical_finding (snomed_concept "Stress at work" "finding"))
       (or
         (clinical_finding (snomed_concept "Heavy drinking session" "finding"))
         (clinical_finding (snomed_concept "Illicit drug use" "finding"))
         (clinical_finding (snomed_concept "Misuse of medication" "finding"))
         (clinical_finding (snomed_concept "Smell of alcohol on breath" "finding"))
         (clinical_finding (snomed_concept "Indifference" "finding"))
         (clinical_finding (snomed_concept "Feeling tense" "finding"))
         (clinical_finding (snomed_concept "Feeling irritable" "finding"))
         (clinical_finding (snomed_concept "Feeling angry" "finding"))
         (clinical_finding (snomed_concept "Depressed mood" "finding"))
         (clinical_finding (snomed_concept "Feeling hopeless" "finding"))
         (clinical_finding (snomed_concept "Loss of interest" "finding"))
         (clinical_finding (snomed_concept "Anhedonia" "finding"))
         (clinical_finding (snomed_concept "Bereavement" "finding"))
         (clinical_finding (snomed_concept "Accidental needle stick injury" "disorder"))
         (clinical_finding (snomed_concept "Traumatic event" "event"))
         (clinical_finding (snomed_concept "Absenteeism at work" "finding"))
         (clinical_finding (snomed_concept "Excess sick leave" "finding"))
         (clinical_finding (snomed_concept "Poor concentration" "finding"))
         (clinical_finding (snomed_concept "Fatigue" "finding"))
       )
  )
)
(system_diagnosis_rule
  "Diagnose possible burnout in health worker with occupational stress"
  (diagnosis
    (snomed_concept "Physical AND emotional exhaustion state" "disorder")
    possible
  )
  adult
  ;; "The health worker with any of the above may have ... burnout ..."
  (and (clinical_finding (snomed_concept "Stress at work" "finding"))
       (or
         (clinical_finding (snomed_concept "Heavy drinking session" "finding"))
         (clinical_finding (snomed_concept "Illicit drug use" "finding"))
         (clinical_finding (snomed_concept "Misuse of medication" "finding"))
         (clinical_finding (snomed_concept "Smell of alcohol on breath" "finding"))
         (clinical_finding (snomed_concept "Indifference" "finding"))
         (clinical_finding (snomed_concept "Feeling tense" "finding"))
         (clinical_finding (snomed_concept "Feeling irritable" "finding"))
         (clinical_finding (snomed_concept "Feeling angry" "finding"))
         (clinical_finding (snomed_concept "Depressed mood" "finding"))
         (clinical_finding (snomed_concept "Feeling hopeless" "finding"))
         (clinical_finding (snomed_concept "Loss of interest" "finding"))
         (clinical_finding (snomed_concept "Anhedonia" "finding"))
         (clinical_finding (snomed_concept "Bereavement" "finding"))
         (clinical_finding (snomed_concept "Accidental needle stick injury" "disorder"))
         (clinical_finding (snomed_concept "Traumatic event" "event"))
         (clinical_finding (snomed_concept "Absenteeism at work" "finding"))
         (clinical_finding (snomed_concept "Excess sick leave" "finding"))
         (clinical_finding (snomed_concept "Poor concentration" "finding"))
         (clinical_finding (snomed_concept "Fatigue" "finding"))
       )
  )
)
(system_priority_evaluation
  "Urgent: health worker with occupational stress and intoxication, inappropriate or aggressive behaviour, or suicidal thoughts"
  adult
  Urgent
  (and (clinical_finding (snomed_concept "Stress at work" "finding"))
       (or
         (clinical_finding (snomed_concept "Intoxication caused by psychoactive substance" "disorder"))
         (clinical_finding (snomed_concept "Inappropriate behavior" "finding"))
         (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
         (clinical_finding (snomed_concept "Physical aggression" "finding"))
         (clinical_finding (snomed_concept "Suicidal thoughts" "finding"))
         (clinical_finding (snomed_concept "Planning suicide" "finding"))
       )
  )
)

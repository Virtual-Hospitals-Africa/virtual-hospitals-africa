;; Page 197 - Protect yourself from occupational stress

(task
  "Check for urgent occupational stress conditions in a health worker"
  adult
  (or (clinical_finding (snomed_concept "Stress at work" "finding"))
      (diagnosis (snomed_concept "Stress at work" "finding") possible))
  (check_for
    (clinical_finding (snomed_concept "Intoxication caused by psychoactive substance" "disorder"))
    (clinical_finding (snomed_concept "Inappropriate behavior" "finding"))
    (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
    (clinical_finding (snomed_concept "Physical aggression" "finding"))
    (clinical_finding (snomed_concept "Suicidal thoughts" "finding"))
    (clinical_finding (snomed_concept "Planning suicide" "finding"))
  )
)
(task
  "Check for signs of occupational stress in a health worker"
  adult
  (clinical_finding (snomed_concept "Stress at work" "finding"))
  (check_for
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
    (clinical_finding (snomed_concept "Anhedonia" "finding"))

    (clinical_finding (snomed_concept "Bereavement" "finding"))
    (clinical_finding (snomed_concept "Accidental needle stick injury" "disorder"))
    (clinical_finding (snomed_concept "Victim of psychological trauma" "finding"))

    (clinical_finding (snomed_concept "Absenteeism at work" "finding"))
    (clinical_finding (snomed_concept "Excess sick leave" "finding"))

    (clinical_finding (snomed_concept "Poor concentration" "finding"))
    (clinical_finding (snomed_concept "Fatigue" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose possible occupational stress"
  (diagnosis
    (snomed_concept "Stress at work" "finding")
    possible
  )
  adult
  ;; "The health worker with any of the above may have substance misuse, stress, depression/anxiety or burnout"
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
    (clinical_finding (snomed_concept "Anhedonia" "finding"))
    (clinical_finding (snomed_concept "Bereavement" "finding"))
    (clinical_finding (snomed_concept "Accidental needle stick injury" "disorder"))
    (clinical_finding (snomed_concept "Victim of psychological trauma" "finding"))
    (clinical_finding (snomed_concept "Absenteeism at work" "finding"))
    (clinical_finding (snomed_concept "Excess sick leave" "finding"))
    (clinical_finding (snomed_concept "Poor concentration" "finding"))
    (clinical_finding (snomed_concept "Fatigue" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose possible substance misuse in a health worker with occupational stress signs"
  (diagnosis
    (snomed_concept "Harmful pattern of substance use" "disorder")
    possible
  )
  adult
  ;; "The health worker with any of the above may have substance misuse, stress, depression/anxiety or burnout"
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
    (clinical_finding (snomed_concept "Anhedonia" "finding"))
    (clinical_finding (snomed_concept "Bereavement" "finding"))
    (clinical_finding (snomed_concept "Accidental needle stick injury" "disorder"))
    (clinical_finding (snomed_concept "Victim of psychological trauma" "finding"))
    (clinical_finding (snomed_concept "Absenteeism at work" "finding"))
    (clinical_finding (snomed_concept "Excess sick leave" "finding"))
    (clinical_finding (snomed_concept "Poor concentration" "finding"))
    (clinical_finding (snomed_concept "Fatigue" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose possible depression in a health worker with occupational stress signs"
  (diagnosis
    (snomed_concept "Depressive disorder" "disorder")
    possible
  )
  adult
  ;; "The health worker with any of the above may have substance misuse, stress, depression/anxiety or burnout"
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
    (clinical_finding (snomed_concept "Anhedonia" "finding"))
    (clinical_finding (snomed_concept "Bereavement" "finding"))
    (clinical_finding (snomed_concept "Accidental needle stick injury" "disorder"))
    (clinical_finding (snomed_concept "Victim of psychological trauma" "finding"))
    (clinical_finding (snomed_concept "Absenteeism at work" "finding"))
    (clinical_finding (snomed_concept "Excess sick leave" "finding"))
    (clinical_finding (snomed_concept "Poor concentration" "finding"))
    (clinical_finding (snomed_concept "Fatigue" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose possible anxiety in a health worker with occupational stress signs"
  (diagnosis
    (snomed_concept "Anxiety disorder" "disorder")
    possible
  )
  adult
  ;; "The health worker with any of the above may have substance misuse, stress, depression/anxiety or burnout"
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
    (clinical_finding (snomed_concept "Anhedonia" "finding"))
    (clinical_finding (snomed_concept "Bereavement" "finding"))
    (clinical_finding (snomed_concept "Accidental needle stick injury" "disorder"))
    (clinical_finding (snomed_concept "Victim of psychological trauma" "finding"))
    (clinical_finding (snomed_concept "Absenteeism at work" "finding"))
    (clinical_finding (snomed_concept "Excess sick leave" "finding"))
    (clinical_finding (snomed_concept "Poor concentration" "finding"))
    (clinical_finding (snomed_concept "Fatigue" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose possible burnout in a health worker with occupational stress signs"
  (diagnosis
    (snomed_concept "Physical AND emotional exhaustion state" "disorder")
    possible
  )
  adult
  ;; "The health worker with any of the above may have substance misuse, stress, depression/anxiety or burnout"
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
    (clinical_finding (snomed_concept "Anhedonia" "finding"))
    (clinical_finding (snomed_concept "Bereavement" "finding"))
    (clinical_finding (snomed_concept "Accidental needle stick injury" "disorder"))
    (clinical_finding (snomed_concept "Victim of psychological trauma" "finding"))
    (clinical_finding (snomed_concept "Absenteeism at work" "finding"))
    (clinical_finding (snomed_concept "Excess sick leave" "finding"))
    (clinical_finding (snomed_concept "Poor concentration" "finding"))
    (clinical_finding (snomed_concept "Fatigue" "finding"))
  )
)
(system_priority_evaluation
  "Urgent: occupational stress with intoxication, inappropriate or violent behaviour, or suicidality"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Stress at work" "finding"))
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

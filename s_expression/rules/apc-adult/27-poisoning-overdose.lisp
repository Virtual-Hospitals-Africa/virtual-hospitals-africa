;; Page 27 - Poisoning/Overdose
(task
  "Check for urgent poisoning/overdose conditions"
  adult
  (clinical_finding (snomed_concept "Poisoning" "disorder"))
  (check_for
    (clinical_finding (snomed_concept "Suicide attempt" "event"))
    (clinical_finding (snomed_concept "Intentionally harming self" "event"))
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Post-ictal state" "finding"))

    (clinical_finding (snomed_concept "Dilated pupil" "finding"))
    (clinical_finding (snomed_concept "Pin point pupils" "finding"))

    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Feeling agitated" "finding"))
    (clinical_finding (snomed_concept "Hallucinations" "finding"))

    (clinical_finding (snomed_concept "Muscle weakness" "finding"))
    (clinical_finding (snomed_concept "Muscle twitch" "finding"))
    (clinical_finding (snomed_concept "Dribbling from mouth" "finding"))
    (clinical_finding (snomed_concept "Excessive sweating" "finding"))
    (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))

    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Tight chest" "finding"))
    (clinical_finding (snomed_concept "Slow respiration" "finding"))
    (clinical_finding (snomed_concept "Shallow breathing" "finding"))
    (clinical_finding (snomed_concept "Shock" "disorder"))
  )
)
(system_diagnosis_rule
  "Diagnose probable organophosphate poisoning"
  (diagnosis
    (snomed_concept "Organophosphate poisoning" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    ;; "If pinpoint pupils, excessive drooling/sweating, excessive secretions, vomiting/diarrhoea,
    ;; pulse < 60, BP < 90/60, organophosphate poisoning likely" - read as any of (see remaining questions)
    (or
      (clinical_finding (snomed_concept "Pin point pupils" "finding"))
      (clinical_finding (snomed_concept "Dribbling from mouth" "finding"))
      (clinical_finding (snomed_concept "Excessive sweating" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (clinical_finding (snomed_concept "Diarrhea" "finding"))
      (< (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 60)
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
    )
  )
)

(system_priority_evaluation
  "Urgent: poisoning/overdose with suicide attempt"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (clinical_finding (snomed_concept "Suicide attempt" "event"))
  )
)

(system_priority_evaluation
  "Urgent: poisoning/overdose with intentionally harming self"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (clinical_finding (snomed_concept "Intentionally harming self" "event"))
  )
)

(system_priority_evaluation
  "Urgent: poisoning/overdose with decreased level of consciousness"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: poisoning/overdose with seizure"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (clinical_finding (snomed_concept "Seizure" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: poisoning/overdose with post-ictal state"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (clinical_finding (snomed_concept "Post-ictal state" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: poisoning/overdose with dilated pupil"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (clinical_finding (snomed_concept "Dilated pupil" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: poisoning/overdose with pin point pupils"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (clinical_finding (snomed_concept "Pin point pupils" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: poisoning/overdose with acute confusion"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: poisoning/overdose with clouded consciousness"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: poisoning/overdose with feeling agitated"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (clinical_finding (snomed_concept "Feeling agitated" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: poisoning/overdose with hallucinations"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (clinical_finding (snomed_concept "Hallucinations" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: poisoning/overdose with muscle weakness"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (clinical_finding (snomed_concept "Muscle weakness" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: poisoning/overdose with muscle twitch"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (clinical_finding (snomed_concept "Muscle twitch" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: poisoning/overdose with dribbling from mouth"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (clinical_finding (snomed_concept "Dribbling from mouth" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: poisoning/overdose with excessive sweating"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (clinical_finding (snomed_concept "Excessive sweating" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: poisoning/overdose with persistent vomiting"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: poisoning/overdose with difficulty breathing"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: poisoning/overdose with tight chest"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (clinical_finding (snomed_concept "Tight chest" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: poisoning/overdose with slow respiration"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (clinical_finding (snomed_concept "Slow respiration" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: poisoning/overdose with shallow breathing"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (clinical_finding (snomed_concept "Shallow breathing" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: poisoning/overdose with respiratory rate < 12 bpm"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (< (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 12)
  )
)

(system_priority_evaluation
  "Urgent: poisoning/overdose with shock"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (clinical_finding (snomed_concept "Shock" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: poisoning/overdose with systolic blood pressure < 80 mmHg"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
  )
)

(system_priority_evaluation
  "Urgent: poisoning/overdose with pulse, function < 60 bpm"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (< (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 60)
  )
)

(system_priority_evaluation
  "Urgent: poisoning/overdose with pulse, function > 100 bpm"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (> (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
  )
)

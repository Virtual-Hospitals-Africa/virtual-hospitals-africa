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
  "Urgent: poisoning/overdose with danger signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Poisoning" "disorder"))
    (or
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
      (< (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 12)
      (clinical_finding (snomed_concept "Shock" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
      (< (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 60)
      (> (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
    )
  )
)

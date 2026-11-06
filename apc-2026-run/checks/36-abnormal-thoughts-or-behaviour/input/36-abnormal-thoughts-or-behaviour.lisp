(task
  "Check for urgent abnormal thoughts or behaviour conditions"
  adult
  (or (clinical_finding (snomed_concept "Abnormal behavior" "finding"))
      (clinical_finding (snomed_concept "Disturbance in thinking" "finding")))
  (check_for

    (clinical_finding (snomed_concept "Abnormal behavior" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Disturbance in thinking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Abnormal behavior" "finding") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Disturbance in thinking" "finding") (qualifier (snomed_concept "Recent" "qualifier value")))


    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))


    (clinical_finding (snomed_concept "Fluctuation of level of consciousness" "finding"))


    (clinical_finding (snomed_concept "Elevated mood" "finding"))
    (clinical_finding (snomed_concept "Increased energy" "finding"))
    (clinical_finding (snomed_concept "Pressure of speech" "finding"))
    (clinical_finding (snomed_concept "Feeling irritable" "finding"))


    (clinical_finding (snomed_concept "Lack of insight" "finding"))
    (clinical_finding (snomed_concept "Hallucinations" "finding"))
    (clinical_finding (snomed_concept "Delusion" "finding"))
    (clinical_finding (snomed_concept "Incoherent speech" "finding"))


    (clinical_finding (snomed_concept "Dilated pupil" "finding"))
    (clinical_finding (snomed_concept "Restlessness" "finding"))
    (clinical_finding (snomed_concept "Paranoid ideation" "finding"))
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Sweating" "finding"))


    (clinical_finding (snomed_concept "Smell of alcohol on breath" "finding"))
    (clinical_finding (snomed_concept "Slurred speech" "finding"))
    (clinical_finding (snomed_concept "Incoordination" "finding"))
    (clinical_finding (snomed_concept "Unsteady when walking" "finding"))


    (clinical_finding (snomed_concept "Stopped drinking alcohol" "finding"))
    (clinical_finding (snomed_concept "Decreased alcohol consumption" "finding"))
    (clinical_finding (snomed_concept "Abstinent from drug misuse" "finding"))
    (clinical_finding (snomed_concept "Tremor" "finding"))
    (clinical_finding (snomed_concept "Restlessness" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Feeling agitated" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))


    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Substance" "substance"))


    (clinical_finding (snomed_concept "Memory impairment" "finding"))
    (clinical_finding (snomed_concept "Disorientated" "finding"))
    (clinical_finding (snomed_concept "Language difficulty" "finding"))
    (clinical_finding (snomed_concept "Difficulty coping" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose possible stroke in abnormal thoughts or behaviour"
  (diagnosis (snomed_concept "Cerebrovascular accident" "disorder") possible)
  adult
  (and
    (or (clinical_finding (snomed_concept "Abnormal behavior" "finding"))
        (clinical_finding (snomed_concept "Disturbance in thinking" "finding")))
    (or (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value"))))
  )
)
(system_diagnosis_rule
  "Diagnose possible TIA in abnormal thoughts or behaviour"
  (diagnosis (snomed_concept "Transient ischemic attack" "disorder") possible)
  adult
  (and
    (or (clinical_finding (snomed_concept "Abnormal behavior" "finding"))
        (clinical_finding (snomed_concept "Disturbance in thinking" "finding")))
    (or (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value"))))
  )
)
(system_diagnosis_rule
  "Diagnose probable delirium in abnormal thoughts or behaviour"
  (diagnosis (snomed_concept "Delirium" "disorder") probable)
  adult
  (and
    (or (clinical_finding (snomed_concept "Abnormal behavior" "finding"))
        (clinical_finding (snomed_concept "Disturbance in thinking" "finding")))
    (clinical_finding (snomed_concept "Fluctuation of level of consciousness" "finding"))
    (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
  )
)
(system_diagnosis_rule
  "Diagnose probable mania in abnormal thoughts or behaviour"
  (diagnosis (snomed_concept "Mania" "disorder") probable)
  adult
  (and
    (or (clinical_finding (snomed_concept "Abnormal behavior" "finding"))
        (clinical_finding (snomed_concept "Disturbance in thinking" "finding")))
    (or (clinical_finding (snomed_concept "Elevated mood" "finding"))
        (clinical_finding (snomed_concept "Increased energy" "finding"))
        (clinical_finding (snomed_concept "Pressure of speech" "finding"))
        (clinical_finding (snomed_concept "Feeling irritable" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable psychosis in abnormal thoughts or behaviour"
  (diagnosis (snomed_concept "Psychotic disorder" "disorder") probable)
  adult
  (and
    (or (clinical_finding (snomed_concept "Abnormal behavior" "finding"))
        (clinical_finding (snomed_concept "Disturbance in thinking" "finding")))
    (clinical_finding (snomed_concept "Lack of insight" "finding"))
    (or (clinical_finding (snomed_concept "Hallucinations" "finding"))
        (clinical_finding (snomed_concept "Delusion" "finding"))
        (clinical_finding (snomed_concept "Incoherent speech" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable stimulant drug intoxication in abnormal thoughts or behaviour"
  (diagnosis (snomed_concept "Intoxication caused by stimulant" "disorder") probable)
  adult
  (and
    (or (clinical_finding (snomed_concept "Abnormal behavior" "finding"))
        (clinical_finding (snomed_concept "Disturbance in thinking" "finding")))
    (or (clinical_finding (snomed_concept "Dilated pupil" "finding"))
        (clinical_finding (snomed_concept "Restlessness" "finding"))
        (clinical_finding (snomed_concept "Paranoid ideation" "finding"))
        (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Sweating" "finding"))
        (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
        (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 140)
        (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 90))
  )
)
(system_diagnosis_rule
  "Diagnose probable alcohol intoxication in abnormal thoughts or behaviour"
  (diagnosis (snomed_concept "Alcohol intoxication" "disorder") probable)
  adult
  (and
    (or (clinical_finding (snomed_concept "Abnormal behavior" "finding"))
        (clinical_finding (snomed_concept "Disturbance in thinking" "finding")))
    (or (clinical_finding (snomed_concept "Smell of alcohol on breath" "finding"))
        (clinical_finding (snomed_concept "Slurred speech" "finding"))
        (clinical_finding (snomed_concept "Incoordination" "finding"))
        (clinical_finding (snomed_concept "Unsteady when walking" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable alcohol/drug withdrawal in abnormal thoughts or behaviour"
  (diagnosis (snomed_concept "Substance withdrawal syndrome" "disorder") probable)
  adult
  (and
    (or (clinical_finding (snomed_concept "Abnormal behavior" "finding"))
        (clinical_finding (snomed_concept "Disturbance in thinking" "finding")))
    (or (clinical_finding (snomed_concept "Stopped drinking alcohol" "finding"))
        (clinical_finding (snomed_concept "Decreased alcohol consumption" "finding"))
        (clinical_finding (snomed_concept "Abstinent from drug misuse" "finding")))
    (or (clinical_finding (snomed_concept "Tremor" "finding"))
        (clinical_finding (snomed_concept "Sweating" "finding"))
        (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Restlessness" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
        (clinical_finding (snomed_concept "Feeling agitated" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
        (clinical_finding (snomed_concept "Hallucinations" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable poisoning in abnormal thoughts or behaviour"
  (diagnosis (snomed_concept "Poisoning" "disorder") probable)
  adult
  (and
    (or (clinical_finding (snomed_concept "Abnormal behavior" "finding"))
        (clinical_finding (snomed_concept "Disturbance in thinking" "finding")))
    (or (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Substance" "substance")))
  )
)
(system_diagnosis_rule
  "Diagnose possible dementia in abnormal thoughts or behaviour"
  (diagnosis (snomed_concept "Dementia" "disorder") possible)
  adult
  (and
    (or (clinical_finding (snomed_concept "Abnormal behavior" "finding"))
        (clinical_finding (snomed_concept "Disturbance in thinking" "finding")))

    (or (>= (onset (clinical_finding (snomed_concept "Memory impairment" "finding"))) (time_ago 6 months))
        (>= (onset (clinical_finding (snomed_concept "Disorientated" "finding"))) (time_ago 6 months))
        (>= (onset (clinical_finding (snomed_concept "Language difficulty" "finding"))) (time_ago 6 months))
        (>= (onset (clinical_finding (snomed_concept "Difficulty coping" "finding"))) (time_ago 6 months)))
  )
)
(system_priority_evaluation
  "Urgent: abnormal thoughts or behaviour of sudden or recent onset"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Abnormal behavior" "finding"))
        (clinical_finding (snomed_concept "Disturbance in thinking" "finding")))
    (or (clinical_finding (snomed_concept "Abnormal behavior" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Disturbance in thinking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Abnormal behavior" "finding") (qualifier (snomed_concept "Recent" "qualifier value")))
        (clinical_finding (snomed_concept "Disturbance in thinking" "finding") (qualifier (snomed_concept "Recent" "qualifier value"))))
  )
)

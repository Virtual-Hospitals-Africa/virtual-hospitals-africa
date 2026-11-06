(task
  "Check for emergency patient airway, breathing and circulation signs"
  adult
  (or (clinical_finding (snomed_concept "Unresponsive" "finding"))
      (clinical_finding (snomed_concept "Cardiac arrest" "disorder"))
      (clinical_finding (snomed_concept "Respiratory obstruction" "disorder"))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
      (< (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 50)
      (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
      (< (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 9)
      (> (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %) 94)
  )
  (check_for

    (clinical_finding (snomed_concept "Absent pulse" "finding"))
    (clinical_finding (snomed_concept "Gasping for breath" "finding"))
    (clinical_finding (snomed_concept "Agonal respiration" "finding"))
    (clinical_finding (snomed_concept "Apnea" "finding"))


    (clinical_finding (snomed_concept "Snoring" "finding"))
    (clinical_finding (snomed_concept "Gurgling" "finding"))
    (clinical_finding (snomed_concept "Noisy respiration" "finding"))


    (clinical_finding (snomed_concept "Blue lips" "finding"))
    (clinical_finding (snomed_concept "Blue tongue" "finding"))
    (clinical_finding (snomed_concept "Dyspnea" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Hyperresonance" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Decreased breath sounds" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Trachea displaced" "disorder"))


    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Acute heart failure" "disorder"))
    (clinical_finding (snomed_concept "Swelling of lower limb" "finding"))
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Dyspnea on exertion" "finding"))
    (clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Restlessness" "finding"))
    (clinical_finding (snomed_concept "Asthenia" "finding"))


    (clinical_finding (snomed_concept "Glasgow coma scale, 3" "finding"))
    (clinical_finding (snomed_concept "Glasgow coma scale, 4" "finding"))
    (clinical_finding (snomed_concept "Glasgow coma scale, 5" "finding"))
    (clinical_finding (snomed_concept "Glasgow coma scale, 6" "finding"))
    (clinical_finding (snomed_concept "Glasgow coma scale, 7" "finding"))
    (clinical_finding (snomed_concept "Glasgow coma scale, 8" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable tension pneumothorax (emergency patient)"
  (diagnosis
    (snomed_concept "Tension pneumothorax" "disorder")
    probable
  )
  adult

  (and (clinical_finding (snomed_concept "Dyspnea" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
       (or (clinical_finding (snomed_concept "Hyperresonance" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
           (clinical_finding (snomed_concept "Decreased breath sounds" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
           (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
       )
       (clinical_finding (snomed_concept "Trachea displaced" "disorder"))
  )
)
(system_diagnosis_rule
  "Diagnose probable shock (emergency patient)"
  (diagnosis
    (snomed_concept "Shock" "disorder")
    probable
  )
  adult

  (and (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
       (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
       (> (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
       (or (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
           (clinical_finding (snomed_concept "Acute confusion" "finding"))
           (clinical_finding (snomed_concept "Restlessness" "finding"))
       )
       (clinical_finding (snomed_concept "Asthenia" "finding"))
  )
)
(system_priority_evaluation
  "Emergency: emergency patient unresponsive, pulseless or not breathing"
  adult
  Emergency
  (or (clinical_finding (snomed_concept "Unresponsive" "finding"))
      (clinical_finding (snomed_concept "Absent pulse" "finding"))
      (clinical_finding (snomed_concept "Cardiac arrest" "disorder"))
      (clinical_finding (snomed_concept "Gasping for breath" "finding"))
      (clinical_finding (snomed_concept "Agonal respiration" "finding"))
      (clinical_finding (snomed_concept "Apnea" "finding"))
  )
)
(system_priority_evaluation
  "Emergency: emergency patient with airway, breathing, circulation or consciousness compromise"
  adult
  Emergency
  (or

    (clinical_finding (snomed_concept "Respiratory obstruction" "disorder"))
    (clinical_finding (snomed_concept "Snoring" "finding"))
    (clinical_finding (snomed_concept "Gurgling" "finding"))
    (clinical_finding (snomed_concept "Noisy respiration" "finding"))

    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %) 94)
    (< (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 9)
    (clinical_finding (snomed_concept "Blue lips" "finding"))
    (clinical_finding (snomed_concept "Blue tongue" "finding"))
    (active_condition (snomed_concept "Tension pneumothorax" "disorder"))

    (and (< (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 50)
         (or (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
             (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
             (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
             (clinical_finding (snomed_concept "Chest pain" "finding"))

             (clinical_finding (snomed_concept "Acute heart failure" "disorder"))
             (and (clinical_finding (snomed_concept "Swelling of lower limb" "finding"))
                  (or (clinical_finding (snomed_concept "Orthopnea" "finding"))
                      (clinical_finding (snomed_concept "Dyspnea on exertion" "finding"))
                  )
             )
         )
    )

    (active_condition (snomed_concept "Shock" "disorder"))
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
    (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
    (clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))

    (clinical_finding (snomed_concept "Glasgow coma scale, 3" "finding"))
    (clinical_finding (snomed_concept "Glasgow coma scale, 4" "finding"))
    (clinical_finding (snomed_concept "Glasgow coma scale, 5" "finding"))
    (clinical_finding (snomed_concept "Glasgow coma scale, 6" "finding"))
    (clinical_finding (snomed_concept "Glasgow coma scale, 7" "finding"))
    (clinical_finding (snomed_concept "Glasgow coma scale, 8" "finding"))
  )
)

;; Page 16 - The emergency patient
;; See 16-the-emergency-patient-flowchart.md. Management steps (CPR, airway manoeuvres, oxygen,
;; atropine, fluids, intubation, chest decompression, referral) are not modelled.
(task
  "Check for emergency patient airway, breathing and circulation signs"
  adult
  (or (clinical_finding (snomed_concept "Unresponsive" "finding"))
      (clinical_finding (snomed_concept "Cardiac arrest" "disorder"))
      (clinical_finding (snomed_concept "Respiratory obstruction" "disorder"))
      (clinical_finding (snomed_concept "Dyspnea" "finding"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
      (< (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 50)
      (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
      (< (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 9)
      (> (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %) 94)
  )
  (check_for
    ;; Pulse and breathing (unresponsive patient)
    (clinical_finding (snomed_concept "Absent pulse" "finding"))
    (clinical_finding (snomed_concept "Gasping for breath" "finding"))
    (clinical_finding (snomed_concept "Apnea" "finding"))

    ;; Airway
    (clinical_finding (snomed_concept "Snoring" "finding"))
    (clinical_finding (snomed_concept "Gurgling" "finding"))
    (clinical_finding (snomed_concept "Noisy respiration" "finding"))

    ;; Breathing
    (clinical_finding (snomed_concept "Blue lips" "finding"))
    (clinical_finding (snomed_concept "Blue tongue" "finding"))
    (clinical_finding (snomed_concept "Dyspnea" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Hyperresonance" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Decreased breath sounds" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Trachea displaced" "disorder"))

    ;; Circulation
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Acute heart failure" "disorder"))
    (clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Restlessness" "finding"))
    (clinical_finding (snomed_concept "Asthenia" "finding"))

    ;; Level of consciousness: GCS <= 8
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
  ;; "sudden breathlessness, more resonant/decreased breath sounds/pain on 1 side, deviated trachea"
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
  ;; Footnote 3: "If SBP < 80, pulse >= 100, respiratory rate > 30, confusion/restlessness, weakness, shock likely."
  (and (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
       (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
       (> (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
       (or (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
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
      (clinical_finding (snomed_concept "Apnea" "finding"))
  )
)
(system_priority_evaluation
  "Emergency: emergency patient with airway, breathing, circulation or consciousness compromise"
  adult
  Emergency
  (or
    ;; Airway obstructed (snoring, gurgling, noisy breathing)
    (clinical_finding (snomed_concept "Respiratory obstruction" "disorder"))
    (clinical_finding (snomed_concept "Snoring" "finding"))
    (clinical_finding (snomed_concept "Gurgling" "finding"))
    (clinical_finding (snomed_concept "Noisy respiration" "finding"))
    ;; Breathing
    (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %) 94)
    (< (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 9)
    (clinical_finding (snomed_concept "Blue lips" "finding"))
    (clinical_finding (snomed_concept "Blue tongue" "finding"))
    (active_condition (snomed_concept "Tension pneumothorax" "disorder"))
    ;; Circulation: pulse < 50 and unstable
    (and (< (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 50)
         (or (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
             (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
             (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
             (clinical_finding (snomed_concept "Chest pain" "finding"))
             (clinical_finding (snomed_concept "Acute heart failure" "disorder"))
         )
    )
    ;; Circulation: shock/SBP < 80, pulse >= 100 or heavy bleeding
    (active_condition (snomed_concept "Shock" "disorder"))
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
    (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
    (clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    ;; Level of consciousness: GCS <= 8
    (clinical_finding (snomed_concept "Glasgow coma scale, 3" "finding"))
    (clinical_finding (snomed_concept "Glasgow coma scale, 4" "finding"))
    (clinical_finding (snomed_concept "Glasgow coma scale, 5" "finding"))
    (clinical_finding (snomed_concept "Glasgow coma scale, 6" "finding"))
    (clinical_finding (snomed_concept "Glasgow coma scale, 7" "finding"))
    (clinical_finding (snomed_concept "Glasgow coma scale, 8" "finding"))
  )
)

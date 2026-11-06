;; Page 16 - The emergency patient
(task
  "Check for emergency patient airway, breathing, circulation signs"
  adult
  (or
    (clinical_finding (snomed_concept "Unresponsive" "finding"))
    (clinical_finding (snomed_concept "Cardiac arrest" "disorder"))
    (clinical_finding (snomed_concept "Respiratory obstruction" "disorder"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %) 94)
    (< (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 9)
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
    (< (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 50)
  )
  (check_for
    ;; Pulse and breathing (unresponsive patient)
    (clinical_finding (snomed_concept "Absent pulse" "finding"))
    (clinical_finding (snomed_concept "Apnea" "finding"))
    (clinical_finding (snomed_concept "Agonal respiration" "finding"))
    (clinical_finding (snomed_concept "Gasping for breath" "finding"))

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
    (clinical_finding (snomed_concept "Swelling of lower limb" "finding"))
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Dyspnea on exertion" "finding"))
    (clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))

    ;; Shock (footnote 3)
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Restlessness" "finding"))
    (clinical_finding (snomed_concept "Asthenia" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable tension pneumothorax (emergency patient)"
  (diagnosis
    (snomed_concept "Tension pneumothorax" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Dyspnea" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (or
      (clinical_finding (snomed_concept "Hyperresonance" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
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
  (or
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
    (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
    (> (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Restlessness" "finding"))
    (clinical_finding (snomed_concept "Asthenia" "finding"))
  )
)
(system_priority_evaluation
  "Emergency: the emergency patient with airway, breathing, circulation or consciousness compromise"
  adult
  Emergency
  (and
    ;; The emergency patient (same entry features as the check_for trigger)
    (or
      (clinical_finding (snomed_concept "Unresponsive" "finding"))
      (clinical_finding (snomed_concept "Cardiac arrest" "disorder"))
      (clinical_finding (snomed_concept "Respiratory obstruction" "disorder"))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %) 94)
      (< (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 9)
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
      (< (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 50)
    )
    (or
      ;; Does not respond to voice or physical stimulation
      (clinical_finding (snomed_concept "Unresponsive" "finding"))
      ;; No pulse felt
      (clinical_finding (snomed_concept "Absent pulse" "finding"))
      (clinical_finding (snomed_concept "Cardiac arrest" "disorder"))
      ;; Gasping or not breathing
      (clinical_finding (snomed_concept "Apnea" "finding"))
      (clinical_finding (snomed_concept "Agonal respiration" "finding"))
      (clinical_finding (snomed_concept "Gasping for breath" "finding"))
      ;; Airway obstructed (snoring, gurgling, noisy breathing)
      (clinical_finding (snomed_concept "Respiratory obstruction" "disorder"))
      (clinical_finding (snomed_concept "Snoring" "finding"))
      (clinical_finding (snomed_concept "Gurgling" "finding"))
      (clinical_finding (snomed_concept "Noisy respiration" "finding"))
      ;; Difficulty breathing or SpO2 < 94%
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %) 94)
      ;; RR < 9 or blue lips/tongue
      (< (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 9)
      (clinical_finding (snomed_concept "Blue lips" "finding"))
      (clinical_finding (snomed_concept "Blue tongue" "finding"))
      ;; Tension pneumothorax likely
      (active_condition (snomed_concept "Tension pneumothorax" "disorder"))
      ;; Pulse < 50 and unstable
      (and
        (< (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 50)
        (or
          (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
          (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
          (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
          (clinical_finding (snomed_concept "Chest pain" "finding"))
          ;; acute heart failure (footnote 3: leg swelling, difficulty breathing which worsens on lying down/with effort)
          (clinical_finding (snomed_concept "Swelling of lower limb" "finding"))
          (clinical_finding (snomed_concept "Orthopnea" "finding"))
          (clinical_finding (snomed_concept "Dyspnea on exertion" "finding"))
        )
      )
      ;; Shock/SBP < 80, pulse >= 100 or heavy bleeding
      (active_condition (snomed_concept "Shock" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
      (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
      (clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    )
  )
)

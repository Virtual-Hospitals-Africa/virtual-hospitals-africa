;; Page 24 - Chest pain
;; Red box: "Give urgent attention to the patient with chest pain and any of:" plus the ECG / pain-character
;; flowchart inside it (see 24-chest-pain-flowchart.md).
(task
  "Check for urgent chest pain conditions"
  adult
  (clinical_finding (snomed_concept "Chest pain" "finding"))
  (check_for
    ;; Red box: respiratory rate >= 30 (routine vital) or difficulty breathing
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))

    ;; Red box: severe pain; new pain or discomfort in centre or left side of chest
    (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Central chest pain" "finding") (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Left sided chest pain" "finding") (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Chest discomfort" "finding") (qualifier (snomed_concept "New" "qualifier value")))

    ;; Red box: pain radiates to neck, jaw, shoulder/s or arm/s
    (clinical_finding (snomed_concept "Pain radiating to neck" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to jaw" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to left shoulder" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to right shoulder" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to left arm" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to right arm" "finding"))

    ;; Red box: nausea or vomiting; pallor or sweating; pulse irregular
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Pale complexion" "finding"))
    (clinical_finding (snomed_concept "Sweating" "finding"))
    (clinical_finding (snomed_concept "Pulse irregular" "finding"))

    ;; Red box: known with ischaemic heart disease; at risk of heart attack
    (clinical_finding (snomed_concept "Ischemic heart disease" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Smoker" "finding"))
    (clinical_finding (snomed_concept "Hypertensive disorder, systemic arterial" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Hypercholesterolemia" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Family history of ischemic heart disease" "situation"))

    ;; Flowchart: do an ECG (doctor to review); ECG abnormal = ST elevation, ST depression or LBBB
    (clinical_finding (snomed_concept "ST segment elevation" "finding"))
    (clinical_finding (snomed_concept "ST segment depression" "finding"))
    (clinical_finding (snomed_concept "Electrocardiographic left bundle branch block" "finding"))

    ;; Flowchart: is chest pain worse on lying down, palpation or breathing deeply?
    (clinical_finding (snomed_concept "Tenderness of chest wall" "finding"))
    (clinical_finding (snomed_concept "Chest pain on breathing" "finding"))

    ;; Flowchart: is chest pain/discomfort any of: at rest, worse/lasts longer than usual (lasts >= 10 minutes uses onset)
    (clinical_finding (snomed_concept "Chest pain at rest" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
    (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Prolonged" "qualifier value")))

    ;; Flowchart: is patient known with stable angina?
    (clinical_finding (snomed_concept "Stable angina" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
  )
)
(task
  "Check for tension pneumothorax and pneumonia in chest pain worse on palpation or breathing"
  adult
  ;; Flowchart: "Is chest pain worse on lying down, palpation or breathing deeply?" = Yes
  (or (clinical_finding (snomed_concept "Tenderness of chest wall" "finding"))
      (clinical_finding (snomed_concept "Chest pain on breathing" "finding")))
  (check_for
    ;; Tension pneumothorax likely: sudden breathlessness, more resonant/decreased breath sounds/pain on one side, deviated trachea
    (clinical_finding (snomed_concept "Dyspnea" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Hyperresonance" "finding"))
    (clinical_finding (snomed_concept "Decreased breath sounds" "finding"))
    (clinical_finding (snomed_concept "Left sided chest pain" "finding"))
    (clinical_finding (snomed_concept "Right sided chest pain" "finding"))
    (clinical_finding (snomed_concept "Trachea displaced" "disorder"))

    ;; Pneumonia likely: chest pain worse on breathing deeply, coughing sputum and temperature >= 38 (routine vital)
    (clinical_finding (snomed_concept "Productive cough" "finding"))
  )
)
(task
  "Record known cardiovascular risk in chest pain"
  adult
  (clinical_finding (snomed_concept "Chest pain" "finding"))
  ;; Red box: at risk of heart attack ... known CVD risk > 20%
  (measure (measurement (snomed_concept "Risk of cardiovascular disease" "observable entity") %))
)
(system_diagnosis_rule
  "Diagnose probable acute coronary syndrome from chest pain"
  (diagnosis
    (snomed_concept "Acute coronary syndrome" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    ;; Entry to "Is chest pain/discomfort any of": ECG abnormal, or ECG normal/unavailable and Q1 = No
    (or (clinical_finding (snomed_concept "ST segment elevation" "finding"))
        (clinical_finding (snomed_concept "ST segment depression" "finding"))
        (clinical_finding (snomed_concept "Electrocardiographic left bundle branch block" "finding"))
        (and (no (clinical_finding (snomed_concept "Tenderness of chest wall" "finding")))
             (no (clinical_finding (snomed_concept "Chest pain on breathing" "finding"))))
    )
    ;; Q2 = Yes (any feature), or Q2 = No and Q3 = No (not known with stable angina)
    (or (clinical_finding (snomed_concept "Chest pain at rest" "finding"))
        (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
        (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Prolonged" "qualifier value")))
        (>= (onset (clinical_finding (snomed_concept "Chest pain" "finding"))) (time_ago 10 minutes))
        (no (clinical_finding (snomed_concept "Stable angina" "disorder") (qualifier (snomed_concept "Known present" "qualifier value"))))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable tension pneumothorax from chest pain"
  (diagnosis
    (snomed_concept "Tension pneumothorax" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Tenderness of chest wall" "finding"))
        (clinical_finding (snomed_concept "Chest pain on breathing" "finding")))
    (clinical_finding (snomed_concept "Dyspnea" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (or (clinical_finding (snomed_concept "Hyperresonance" "finding"))
        (clinical_finding (snomed_concept "Decreased breath sounds" "finding"))
        (clinical_finding (snomed_concept "Left sided chest pain" "finding"))
        (clinical_finding (snomed_concept "Right sided chest pain" "finding")))
    (clinical_finding (snomed_concept "Trachea displaced" "disorder"))
  )
)
(system_diagnosis_rule
  "Diagnose probable pneumonia from pleuritic chest pain"
  (diagnosis
    (snomed_concept "Pneumonia" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Chest pain on breathing" "finding"))
    (clinical_finding (snomed_concept "Productive cough" "finding"))
    (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
  )
)
(system_priority_evaluation
  "Urgent: chest pain with danger signs or heart attack risk"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (or
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
      (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110)
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (clinical_finding (snomed_concept "Pulse irregular" "finding"))
      (> (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
      (< (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 50)

      (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      (clinical_finding (snomed_concept "Central chest pain" "finding") (qualifier (snomed_concept "New" "qualifier value")))
      (clinical_finding (snomed_concept "Left sided chest pain" "finding") (qualifier (snomed_concept "New" "qualifier value")))
      (clinical_finding (snomed_concept "Chest discomfort" "finding") (qualifier (snomed_concept "New" "qualifier value")))
      (clinical_finding (snomed_concept "Pain radiating to neck" "finding"))
      (clinical_finding (snomed_concept "Pain radiating to jaw" "finding"))
      (clinical_finding (snomed_concept "Pain radiating to left shoulder" "finding"))
      (clinical_finding (snomed_concept "Pain radiating to right shoulder" "finding"))
      (clinical_finding (snomed_concept "Pain radiating to left arm" "finding"))
      (clinical_finding (snomed_concept "Pain radiating to right arm" "finding"))

      (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (clinical_finding (snomed_concept "Pale complexion" "finding"))
      (clinical_finding (snomed_concept "Sweating" "finding"))
      (clinical_finding (snomed_concept "Ischemic heart disease" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))

      ;; At risk of heart attack
      (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
      (clinical_finding (snomed_concept "Smoker" "finding"))
      (clinical_finding (snomed_concept "Hypertensive disorder, systemic arterial" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
      (clinical_finding (snomed_concept "Hypercholesterolemia" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
      (> (measurement (snomed_concept "Risk of cardiovascular disease" "observable entity") %) 20)
      (clinical_finding (snomed_concept "Family history of ischemic heart disease" "situation"))
    )
  )
)
(system_priority_evaluation
  "Urgent: probable acute coronary syndrome from chest pain"
  adult
  Urgent
  (active_condition (snomed_concept "Acute coronary syndrome" "disorder"))
)
(system_priority_evaluation
  "Urgent: probable tension pneumothorax from chest pain"
  adult
  Urgent
  (active_condition (snomed_concept "Tension pneumothorax" "disorder"))
)
(system_priority_evaluation
  "Urgent: probable pneumonia from pleuritic chest pain"
  adult
  Urgent
  (active_condition (snomed_concept "Pneumonia" "disorder"))
)

;; Page 24 - Chest pain
(task
  "Check for urgent chest pain signs"
  adult
  (clinical_finding (snomed_concept "Chest pain" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Pulse irregular" "finding"))

    (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Central chest pain" "finding") (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Left sided chest pain" "finding") (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Pain radiating to neck" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to jaw" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to left shoulder" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to right shoulder" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to left arm" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to right arm" "finding"))

    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Pallor of skin of face" "finding"))
    (clinical_finding (snomed_concept "Sweating" "finding"))

    (clinical_finding (snomed_concept "Ischemic heart disease" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Smoker" "finding"))
    (clinical_finding (snomed_concept "Hypertensive disorder, systemic arterial" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Hypercholesterolemia" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Family history of ischemic heart disease" "situation"))
  )
)
(task
  "Record known cardiovascular disease risk for chest pain"
  adult
  (clinical_finding (snomed_concept "Chest pain" "finding"))
  (measure (measurement (snomed_concept "Risk of cardiovascular disease" "observable entity") %))
)
(task
  "Do an ECG for chest pain (doctor to review)"
  adult
  (clinical_finding (snomed_concept "Chest pain" "finding"))
  (check_for
    (clinical_finding (snomed_concept "ST segment elevation" "finding"))
    (clinical_finding (snomed_concept "ST segment depression" "finding"))
    (clinical_finding (snomed_concept "Electrocardiographic left bundle branch block" "finding"))
  )
)
(task
  "Check chest pain character for acute coronary syndrome"
  adult
  (clinical_finding (snomed_concept "Chest pain" "finding"))
  (check_for
    ;; Is chest pain worse on lying down, palpation or breathing deeply?
    (clinical_finding (snomed_concept "Pain aggravated by position" "finding"))
    (clinical_finding (snomed_concept "Tenderness of chest wall" "finding"))
    (clinical_finding (snomed_concept "Chest pain on breathing" "finding"))

    ;; Is chest pain/discomfort any of: ...
    (clinical_finding (snomed_concept "Chest pain at rest" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
    (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Prolonged" "qualifier value")))

    ;; Is patient known with stable angina?
    (clinical_finding (snomed_concept "Stable angina" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
  )
)
(task
  "Check for tension pneumothorax or pneumonia in chest pain"
  adult
  (or (clinical_finding (snomed_concept "Pain aggravated by position" "finding"))
      (clinical_finding (snomed_concept "Tenderness of chest wall" "finding"))
      (clinical_finding (snomed_concept "Chest pain on breathing" "finding")))
  (check_for
    (clinical_finding (snomed_concept "Dyspnea" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Hyperresonance" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Decreased breath sounds" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Left sided chest pain" "finding"))
    (clinical_finding (snomed_concept "Right sided chest pain" "finding"))
    (clinical_finding (snomed_concept "Trachea displaced" "disorder"))

    (clinical_finding (snomed_concept "Productive cough" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable acute coronary syndrome in chest pain"
  (diagnosis
    (snomed_concept "Acute coronary syndrome" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (or
      ;; ECG abnormal (ST elevation, ST depression or left bundle branch block)
      (clinical_finding (snomed_concept "ST segment elevation" "finding"))
      (clinical_finding (snomed_concept "ST segment depression" "finding"))
      (clinical_finding (snomed_concept "Electrocardiographic left bundle branch block" "finding"))
      ;; Not worse on lying down, palpation or breathing deeply, and either any of the listed
      ;; features (Yes) or none of them and not known with stable angina (No → No)
      (and
        (no (clinical_finding (snomed_concept "Pain aggravated by position" "finding")))
        (no (clinical_finding (snomed_concept "Tenderness of chest wall" "finding")))
        (no (clinical_finding (snomed_concept "Chest pain on breathing" "finding")))
        (or
          (clinical_finding (snomed_concept "Chest pain at rest" "finding"))
          (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
          (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Prolonged" "qualifier value")))
          (>= (onset (clinical_finding (snomed_concept "Chest pain" "finding"))) (time_ago 10 minutes))
          (no (clinical_finding (snomed_concept "Stable angina" "disorder") (qualifier (snomed_concept "Known present" "qualifier value"))))
        )
      )
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable stable angina in chest pain"
  (diagnosis
    (snomed_concept "Stable angina" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    ;; ECG normal/other abnormalities or unavailable or uncertain: none of the three abnormal
    ;; ECG findings recorded as present (written with `no`, as VHA's evidence code rejects `not`)
    (no (clinical_finding (snomed_concept "ST segment elevation" "finding")))
    (no (clinical_finding (snomed_concept "ST segment depression" "finding")))
    (no (clinical_finding (snomed_concept "Electrocardiographic left bundle branch block" "finding")))
    ;; Not worse on lying down, palpation or breathing deeply
    (no (clinical_finding (snomed_concept "Pain aggravated by position" "finding")))
    (no (clinical_finding (snomed_concept "Tenderness of chest wall" "finding")))
    (no (clinical_finding (snomed_concept "Chest pain on breathing" "finding")))
    ;; None of the listed features
    (no (clinical_finding (snomed_concept "Chest pain at rest" "finding")))
    (no (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Worsening" "qualifier value"))))
    (no (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Prolonged" "qualifier value"))))
    ;; Not "lasts ≥ 10 minutes": onset within the last 10 minutes (VHA accepts only >= and <= here)
    (<= (onset (clinical_finding (snomed_concept "Chest pain" "finding"))) (time_ago 10 minutes))
    ;; Known with stable angina
    (clinical_finding (snomed_concept "Stable angina" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose probable tension pneumothorax in chest pain"
  (diagnosis
    (snomed_concept "Tension pneumothorax" "disorder")
    probable
  )
  adult
  (and
    ;; Inside the "worse on lying down, palpation or breathing deeply = Yes" box
    (or (clinical_finding (snomed_concept "Pain aggravated by position" "finding"))
        (clinical_finding (snomed_concept "Tenderness of chest wall" "finding"))
        (clinical_finding (snomed_concept "Chest pain on breathing" "finding")))
    (clinical_finding (snomed_concept "Dyspnea" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (or (clinical_finding (snomed_concept "Hyperresonance" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
        (clinical_finding (snomed_concept "Decreased breath sounds" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
        (clinical_finding (snomed_concept "Left sided chest pain" "finding"))
        (clinical_finding (snomed_concept "Right sided chest pain" "finding")))
    (clinical_finding (snomed_concept "Trachea displaced" "disorder"))
  )
)
(system_diagnosis_rule
  "Diagnose probable pneumonia in chest pain"
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
  "Urgent: chest pain with danger signs"
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
      (clinical_finding (snomed_concept "Pain radiating to neck" "finding"))
      (clinical_finding (snomed_concept "Pain radiating to jaw" "finding"))
      (clinical_finding (snomed_concept "Pain radiating to left shoulder" "finding"))
      (clinical_finding (snomed_concept "Pain radiating to right shoulder" "finding"))
      (clinical_finding (snomed_concept "Pain radiating to left arm" "finding"))
      (clinical_finding (snomed_concept "Pain radiating to right arm" "finding"))

      (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (clinical_finding (snomed_concept "Pallor of skin of face" "finding"))
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
  "Urgent: probable acute coronary syndrome in chest pain"
  adult
  Urgent
  (active_condition (snomed_concept "Acute coronary syndrome" "disorder"))
)
(system_priority_evaluation
  "Urgent: chest pain worse on lying down, palpation or breathing deeply"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (or (clinical_finding (snomed_concept "Pain aggravated by position" "finding"))
        (clinical_finding (snomed_concept "Tenderness of chest wall" "finding"))
        (clinical_finding (snomed_concept "Chest pain on breathing" "finding")))
  )
)

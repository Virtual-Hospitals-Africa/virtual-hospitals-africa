;; Page 78 - Back pain
(task
  "Check for urgent back pain conditions"
  adult
  (clinical_finding (snomed_concept "Backache" "finding"))
  (check_for
    ;; Bladder or bowel disturbance (retention or incontinence)
    (clinical_finding (snomed_concept "Retention of urine" "disorder"))
    (clinical_finding (snomed_concept "Urinary incontinence" "finding"))
    (clinical_finding (snomed_concept "Incontinence of feces" "finding"))

    ;; Numbness of buttocks, perineum or legs; leg weakness or difficulty walking
    (clinical_finding (snomed_concept "Numbness of saddle area" "finding"))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding"))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))
    (clinical_finding (snomed_concept "Difficulty walking" "finding"))

    ;; Recent injury (x-ray unavailable or abnormal cannot be expressed)
    (clinical_finding (snomed_concept "Traumatic injury" "disorder"))

    ;; Pancreatitis: sudden onset severe upper abdominal pain with nausea/vomiting
    (clinical_finding (snomed_concept "Upper abdominal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))

    ;; Flank pain (leads to the urine dipstick task)
    (clinical_finding (snomed_concept "Flank pain" "finding"))

    ;; Abdominal aortic aneurysm; known cancer
    (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))
    (clinical_finding (snomed_concept "Malignant neoplastic disease" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))

    ;; Not urgent: TB symptoms (cough, weight loss, night sweats; fever is a common symptom)
    (clinical_finding (snomed_concept "Cough" "finding"))
    (clinical_finding (snomed_concept "Weight decreased" "finding"))
    (clinical_finding (snomed_concept "Night sweats" "finding"))

    ;; Not urgent: mpox (rash or lesions, and associated symptoms)
    (clinical_finding (snomed_concept "Eruption" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Skin lesion" "disorder"))
    (clinical_finding (snomed_concept "Lesion of genitalia" "disorder"))
    (clinical_finding (snomed_concept "Lesion of rectum" "disorder"))
    (clinical_finding (snomed_concept "Oral lesion" "disorder"))
    (clinical_finding (snomed_concept "Lesion of eye" "disorder"))
    (clinical_finding (snomed_concept "Lymphadenopathy" "disorder"))
    (clinical_finding (snomed_concept "Generalized acute body pains" "finding"))
    (clinical_finding (snomed_concept "Nasal congestion" "finding"))
  )
)
(task
  "Check urine dipstick and pyelonephritis/kidney stone signs in back pain with flank pain"
  adult
  (clinical_finding (snomed_concept "Flank pain" "finding"))
  (check_for
    ;; Urine dipstick
    (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
    (clinical_finding (snomed_concept "Nitrite detected in urine" "finding"))
    (clinical_finding (snomed_concept "Blood in urine" "finding"))

    ;; Complicated pyelonephritis: vomiting, sepsis, diabetes, male, pregnant or post menopause
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Male" "finding"))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Postmenopausal state" "finding"))

    ;; Kidney stone: sudden, severe, one-sided pain radiating to groin
    (clinical_finding (snomed_concept "Flank pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Inguinal pain" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable acute pancreatitis in back pain"
  (diagnosis
    (snomed_concept "Acute pancreatitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Backache" "finding"))
    (clinical_finding (snomed_concept "Upper abdominal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable pyelonephritis in back pain with flank pain"
  (diagnosis
    (snomed_concept "Acute pyelonephritis" "disorder")
    probable
  )
  adult
  ;; Covers both "complicated pyelonephritis likely" (red box) and "uncomplicated pyelonephritis
  ;; likely" (approach box): SNOMED has no complicated/uncomplicated pyelonephritis concept.
  (and
    (clinical_finding (snomed_concept "Flank pain" "finding"))
    (or (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
        (clinical_finding (snomed_concept "Nitrite detected in urine" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable kidney stone in back pain with flank pain"
  (diagnosis
    (snomed_concept "Kidney stone" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Flank pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Inguinal pain" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable abdominal aortic aneurysm in back pain"
  (diagnosis
    (snomed_concept "Abdominal aortic aneurysm" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Backache" "finding"))
    (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose possible tuberculosis in back pain with TB symptoms"
  (diagnosis
    (snomed_concept "Tuberculosis" "disorder")
    possible
  )
  adult
  ;; Not-urgent flowchart: "Does patient have any of: cough, weight loss, night sweats or fever?" Yes → Check for TB 102
  (and
    (clinical_finding (snomed_concept "Backache" "finding"))
    (or (clinical_finding (snomed_concept "Cough" "finding"))
        (clinical_finding (snomed_concept "Weight decreased" "finding"))
        (clinical_finding (snomed_concept "Night sweats" "finding"))
        (active_condition (snomed_concept "Fever" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose possible mpox in back pain with rash or lesions"
  (diagnosis
    (snomed_concept "Monkeypox" "disorder")
    possible
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Eruption" "morphologic abnormality"))
        (clinical_finding (snomed_concept "Skin lesion" "disorder"))
        (clinical_finding (snomed_concept "Lesion of genitalia" "disorder"))
        (clinical_finding (snomed_concept "Lesion of rectum" "disorder"))
        (clinical_finding (snomed_concept "Oral lesion" "disorder"))
        (clinical_finding (snomed_concept "Lesion of eye" "disorder")))
    (or (clinical_finding (snomed_concept "Headache" "finding"))
        (clinical_finding (snomed_concept "Backache" "finding"))
        (clinical_finding (snomed_concept "Generalized acute body pains" "finding"))
        (clinical_finding (snomed_concept "Lymphadenopathy" "disorder"))
        (> (measurement (snomed_concept "Body temperature" "observable entity") °C) 38.5)
        (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Sore throat" "finding"))
        (clinical_finding (snomed_concept "Nasal congestion" "finding"))
        (clinical_finding (snomed_concept "Cough" "finding")))
  )
)
(system_priority_evaluation
  "Urgent: back pain with red flag signs"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Backache" "finding"))
        (clinical_finding (snomed_concept "Flank pain" "finding")))
    (or
      ;; Bladder or bowel disturbance (retention or incontinence)
      (clinical_finding (snomed_concept "Retention of urine" "disorder"))
      (clinical_finding (snomed_concept "Urinary incontinence" "finding"))
      (clinical_finding (snomed_concept "Incontinence of feces" "finding"))
      ;; Numbness of buttocks, perineum or legs
      (clinical_finding (snomed_concept "Numbness of saddle area" "finding"))
      (clinical_finding (snomed_concept "Numbness of lower limb" "finding"))
      ;; Leg weakness or difficulty walking
      (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))
      (clinical_finding (snomed_concept "Difficulty walking" "finding"))
      ;; Recent injury (and x-ray unavailable or abnormal: not expressible)
      (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
      ;; Pancreatitis likely
      (active_condition (snomed_concept "Acute pancreatitis" "disorder"))
      ;; Complicated pyelonephritis likely (no SNOMED concept, so written out)
      (and
        (clinical_finding (snomed_concept "Flank pain" "finding"))
        (or (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
            (clinical_finding (snomed_concept "Nitrite detected in urine" "finding")))
        (or (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
            ;; Sepsis (footnote 1): SBP < 80, pulse >= 100, respiratory rate > 30, confusion
            (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
            (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
            (> (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
            (clinical_finding (snomed_concept "Acute confusion" "finding"))
            (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
            (clinical_finding (snomed_concept "Male" "finding"))
            (clinical_finding (snomed_concept "Pregnancy" "finding"))
            (clinical_finding (snomed_concept "Postmenopausal state" "finding")))
      )
      ;; Kidney stone likely
      (active_condition (snomed_concept "Kidney stone" "disorder"))
      ;; Pulsatile abdominal mass: abdominal aortic aneurysm likely
      (active_condition (snomed_concept "Abdominal aortic aneurysm" "disorder"))
      ;; Known cancer patient
      (clinical_finding (snomed_concept "Malignant neoplastic disease" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    )
  )
)

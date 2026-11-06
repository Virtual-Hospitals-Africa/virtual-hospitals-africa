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

    ;; Numbness of buttocks, perineum or legs
    (clinical_finding (snomed_concept "Numbness of saddle area" "finding"))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding"))

    ;; Leg weakness or difficulty walking
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))
    (clinical_finding (snomed_concept "Difficulty walking" "finding"))

    ;; Recent injury
    (clinical_finding (snomed_concept "Traumatic injury" "disorder"))

    ;; Sudden onset severe upper abdominal pain with nausea/vomiting: pancreatitis likely
    (clinical_finding (snomed_concept "Upper abdominal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))

    ;; Flank pain (then urine dipstick) and the features of complicated pyelonephritis / kidney stone
    (clinical_finding (snomed_concept "Flank pain" "finding"))
    (clinical_finding (snomed_concept "Flank pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Radiating pain" "finding") (finding_site (snomed_concept "Inguinal region structure" "body structure")))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Male" "finding"))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Postmenopausal state" "finding"))

    ;; Pulsatile abdominal mass: abdominal aortic aneurysm likely
    (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))

    ;; Known cancer patient
    (clinical_finding (snomed_concept "Malignant neoplastic disease" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
  )
)
(task
  "Check urine dipstick in back pain with flank pain"
  adult
  (and (clinical_finding (snomed_concept "Backache" "finding"))
       (clinical_finding (snomed_concept "Flank pain" "finding")))
  (check_for
    (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
    (clinical_finding (snomed_concept "Nitrite detected in urine" "finding"))
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
  )
)
(task
  "Check for causes of back pain not needing urgent attention"
  adult
  (clinical_finding (snomed_concept "Backache" "finding"))
  (check_for
    ;; Unexplained rash or lesions (consider mpox)
    (clinical_finding (snomed_concept "Eruption" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Skin lesion" "disorder"))
    (clinical_finding (snomed_concept "Lesion of genitalia" "disorder"))
    (clinical_finding (snomed_concept "Lesion of rectum" "disorder"))
    (clinical_finding (snomed_concept "Oral lesion" "disorder"))
    (clinical_finding (snomed_concept "Lesion of eye" "disorder"))

    ;; Q1: cough, weight loss, night sweats or fever
    (clinical_finding (snomed_concept "Cough" "finding"))
    (clinical_finding (snomed_concept "Weight decreased" "finding"))
    (clinical_finding (snomed_concept "Night sweats" "finding"))

    ;; Q2: pain progressive, previous cancer or back surgery, osteoporosis, oral steroid use, HIV, IV drug use, deformity
    (clinical_finding (snomed_concept "Backache" "finding") (qualifier (snomed_concept "Progressive" "qualifier value")))
    (clinical_finding (snomed_concept "History of malignant neoplasm" "situation"))
    (clinical_finding (snomed_concept "History of spinal surgery" "situation"))
    (clinical_finding (snomed_concept "Osteoporosis" "disorder"))
    (clinical_finding (snomed_concept "Use of steroids" "finding"))
    (clinical_finding (snomed_concept "Human immunodeficiency virus infection" "disorder"))
    (clinical_finding (snomed_concept "Intravenous drug user" "finding"))
    (clinical_finding (snomed_concept "Deformity of spine" "finding"))

    ;; Q3: sleep disturbed by pain, morning stiffness
    (clinical_finding (snomed_concept "Sleep pattern disturbance" "finding"))
    (clinical_finding (snomed_concept "Stiff back" "finding") (qualifier (snomed_concept "Morning" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose probable pancreatitis in back pain"
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
  "Diagnose probable complicated pyelonephritis in back pain"
  (diagnosis
    (snomed_concept "Acute pyelonephritis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Flank pain" "finding"))
    (or (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
        (clinical_finding (snomed_concept "Nitrite detected in urine" "finding")))
    (or (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
        ;; sepsis (footnote 1): SBP < 80, pulse >= 100, respiratory rate > 30, confusion
        (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
        (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
        (> (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
        (clinical_finding (snomed_concept "Acute confusion" "finding"))
        (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
        (clinical_finding (snomed_concept "Male" "finding"))
        (clinical_finding (snomed_concept "Pregnancy" "finding"))
        (clinical_finding (snomed_concept "Postmenopausal state" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable kidney stone in back pain"
  (diagnosis
    (snomed_concept "Kidney stone" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Flank pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Radiating pain" "finding") (finding_site (snomed_concept "Inguinal region structure" "body structure")))
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
  "Diagnose probable uncomplicated pyelonephritis in back pain"
  (diagnosis
    (snomed_concept "Acute pyelonephritis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Flank pain" "finding"))
    (or (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
        (clinical_finding (snomed_concept "Nitrite detected in urine" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose possible mpox in back pain"
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
        (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
        (clinical_finding (snomed_concept "Lymphadenopathy" "disorder"))
        (> (measurement (snomed_concept "Body temperature" "observable entity") °C) 38.5)
        (clinical_finding (snomed_concept "Fatigue" "finding"))
        (clinical_finding (snomed_concept "Sore throat" "finding"))
        (clinical_finding (snomed_concept "Nasal congestion" "finding"))
        (clinical_finding (snomed_concept "Cough" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose possible TB in back pain"
  (diagnosis
    (snomed_concept "Tuberculosis" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Backache" "finding"))
    (or (clinical_finding (snomed_concept "Cough" "finding"))
        (clinical_finding (snomed_concept "Weight decreased" "finding"))
        (clinical_finding (snomed_concept "Night sweats" "finding"))
        (active_condition (snomed_concept "Fever" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable mechanical back pain"
  (diagnosis
    (snomed_concept "Mechanical low back pain" "finding")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Backache" "finding"))
    ;; Q1 = No
    (no (clinical_finding (snomed_concept "Cough" "finding")))
    (no (clinical_finding (snomed_concept "Weight decreased" "finding")))
    (no (clinical_finding (snomed_concept "Night sweats" "finding")))
    (no (clinical_finding (snomed_concept "Fever" "finding")))
    ;; Q2 = No (age > 50 years cannot be expressed)
    (no (clinical_finding (snomed_concept "Backache" "finding") (qualifier (snomed_concept "Progressive" "qualifier value"))))
    (<= (onset (clinical_finding (snomed_concept "Backache" "finding"))) (time_ago 6 weeks))
    (no (clinical_finding (snomed_concept "History of malignant neoplasm" "situation")))
    (no (clinical_finding (snomed_concept "History of spinal surgery" "situation")))
    (no (clinical_finding (snomed_concept "Osteoporosis" "disorder")))
    (no (clinical_finding (snomed_concept "Use of steroids" "finding")))
    (no (clinical_finding (snomed_concept "Human immunodeficiency virus infection" "disorder")))
    (no (clinical_finding (snomed_concept "Intravenous drug user" "finding")))
    (no (clinical_finding (snomed_concept "Deformity of spine" "finding")))
    ;; Q3 = No (age < 40 years, pain better with exercise, not better with rest cannot be expressed)
    (no (clinical_finding (snomed_concept "Sleep pattern disturbance" "finding")))
    (no (clinical_finding (snomed_concept "Stiff back" "finding") (qualifier (snomed_concept "Morning" "qualifier value"))))
  )
)
(system_priority_evaluation
  "Urgent: back pain with red box features"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Backache" "finding"))
    (or
      (clinical_finding (snomed_concept "Retention of urine" "disorder"))
      (clinical_finding (snomed_concept "Urinary incontinence" "finding"))
      (clinical_finding (snomed_concept "Incontinence of feces" "finding"))
      (clinical_finding (snomed_concept "Numbness of saddle area" "finding"))
      (clinical_finding (snomed_concept "Numbness of lower limb" "finding"))
      (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))
      (clinical_finding (snomed_concept "Difficulty walking" "finding"))
      (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
      (active_condition (snomed_concept "Acute pancreatitis" "disorder"))
      ;; complicated pyelonephritis likely (written out: the diagnosis concept is shared with uncomplicated pyelonephritis)
      (and
        (clinical_finding (snomed_concept "Flank pain" "finding"))
        (or (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
            (clinical_finding (snomed_concept "Nitrite detected in urine" "finding")))
        (or (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
            (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
            (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
            (> (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
            (clinical_finding (snomed_concept "Acute confusion" "finding"))
            (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
            (clinical_finding (snomed_concept "Male" "finding"))
            (clinical_finding (snomed_concept "Pregnancy" "finding"))
            (clinical_finding (snomed_concept "Postmenopausal state" "finding")))
      )
      (active_condition (snomed_concept "Kidney stone" "disorder"))
      (active_condition (snomed_concept "Abdominal aortic aneurysm" "disorder"))
      (clinical_finding (snomed_concept "Malignant neoplastic disease" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    )
  )
)

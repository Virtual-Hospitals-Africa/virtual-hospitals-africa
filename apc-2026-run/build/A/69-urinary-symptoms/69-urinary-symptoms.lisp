;; Page 69 - Urinary symptoms
;; Red box: "Give urgent attention to the patient with urinary symptoms and any of:"
(task
  "Check for urgent urinary symptom conditions"
  adult
  (clinical_finding (snomed_concept "Urinary symptoms" "finding"))
  (check_for
    ;; Unable to pass urine with lower abdominal discomfort/distension
    (clinical_finding (snomed_concept "Unable to void urine" "finding"))
    (clinical_finding (snomed_concept "Abdominal discomfort" "finding") (finding_site (snomed_concept "Lower abdomen structure" "body structure")))
    (clinical_finding (snomed_concept "Distension of abdomen" "finding") (finding_site (snomed_concept "Lower abdomen structure" "body structure")))

    ;; Flank pain with leucocytes/nitrites and any of: vomiting, BP < 90/60, pulse >= 100, diabetes, male, pregnant, post menopause
    (clinical_finding (snomed_concept "Flank pain" "finding"))
    (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
    (clinical_finding (snomed_concept "Nitrite detected in urine" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (clinical_finding (snomed_concept "Male" "finding"))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Postmenopausal state" "finding"))

    ;; Blood/protein in urine with new swelling of face/feet, BP >= 140/90 or passing little urine
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Proteinuria" "finding"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Foot structure" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Oliguria" "finding"))

    ;; Blood in urine and sudden, severe, one-sided pain in flank or groin
    (clinical_finding (snomed_concept "Left flank pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Right flank pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Left inguinal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Right inguinal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
  )
)
;; Approach to the patient with urinary symptoms not needing urgent attention
(task
  "Check for urinary infection features"
  adult
  (clinical_finding (snomed_concept "Urinary symptoms" "finding"))
  (check_for
    ;; Burning/frequency/urgency
    (clinical_finding (snomed_concept "Dysuria" "finding"))
    (clinical_finding (snomed_concept "Increased frequency of urination" "finding"))
    (clinical_finding (snomed_concept "Urgent desire to urinate" "finding"))

    ;; Woman: glucose; catheter, diabetes, pregnancy or urinary tract problem
    (clinical_finding (snomed_concept "Female" "finding"))
    (clinical_finding (snomed_concept "Glycosuria" "finding"))
    (clinical_finding (snomed_concept "Urinary catheter in situ" "finding"))
    (clinical_finding (snomed_concept "Disorder of urinary system" "disorder"))

    ;; Man: urethral discharge; perineal/body pain or prostate tender on rectal exam
    (clinical_finding (snomed_concept "Urethral discharge" "finding"))
    (clinical_finding (snomed_concept "Perineal pain" "finding"))
    (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
    (clinical_finding (snomed_concept "Tenderness of prostate" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable acute pyelonephritis from urinary symptoms"
  (diagnosis
    (snomed_concept "Acute pyelonephritis" "disorder")
    probable
  )
  adult
  ;; Red box "complicated pyelonephritis likely" and approach box "uncomplicated pyelonephritis likely"
  ;; share this evidence; SNOMED has no complicated/uncomplicated split. The complicating items live in the priority rule.
  (and
    (clinical_finding (snomed_concept "Flank pain" "finding"))
    (or (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
        (clinical_finding (snomed_concept "Nitrite detected in urine" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable kidney disease from urinary symptoms"
  (diagnosis
    (snomed_concept "Kidney disease" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Blood in urine" "finding"))
        (clinical_finding (snomed_concept "Proteinuria" "finding")))
    (or (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
        (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Foot structure" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
        (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 140)
        (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 90)
        (clinical_finding (snomed_concept "Oliguria" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable kidney stone from urinary symptoms"
  (diagnosis
    (snomed_concept "Kidney stone" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (or (clinical_finding (snomed_concept "Left flank pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
        (clinical_finding (snomed_concept "Right flank pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
        (clinical_finding (snomed_concept "Left inguinal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
        (clinical_finding (snomed_concept "Right inguinal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value"))))
  )
)
(system_diagnosis_rule
  "Diagnose probable simple UTI (urinary symptoms page)"
  (diagnosis
    (snomed_concept "Acute cystitis" "disorder")
    probable
  )
  adult
  ;; Woman with leucocytes/nitrites, and No to: catheter, diabetes, pregnancy or urinary tract problem
  (and
    (clinical_finding (snomed_concept "Female" "finding"))
    (or (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
        (clinical_finding (snomed_concept "Nitrite detected in urine" "finding")))
    (no (clinical_finding (snomed_concept "Urinary catheter in situ" "finding")))
    (no (clinical_finding (snomed_concept "Diabetes mellitus" "disorder")))
    (no (clinical_finding (snomed_concept "Pregnancy" "finding")))
    (no (clinical_finding (snomed_concept "Disorder of urinary system" "disorder")))
  )
)
(system_diagnosis_rule
  "Diagnose probable complicated UTI (urinary symptoms page)"
  (diagnosis
    (snomed_concept "Urinary tract infectious disease" "disorder")
    probable
  )
  adult
  (or
    ;; Woman with leucocytes/nitrites and Yes to: catheter, diabetes, pregnancy or urinary tract problem
    (and
      (clinical_finding (snomed_concept "Female" "finding"))
      (or (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
          (clinical_finding (snomed_concept "Nitrite detected in urine" "finding")))
      (or (clinical_finding (snomed_concept "Urinary catheter in situ" "finding"))
          (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
          (clinical_finding (snomed_concept "Pregnancy" "finding"))
          (clinical_finding (snomed_concept "Disorder of urinary system" "disorder"))))
    ;; Man, No to perineal/body pain or tender prostate, leucocytes/nitrites, with frequency/urgency
    (and
      (clinical_finding (snomed_concept "Male" "finding"))
      (no (clinical_finding (snomed_concept "Perineal pain" "finding")))
      (no (clinical_finding (snomed_concept "Generalized aches and pains" "finding")))
      (no (clinical_finding (snomed_concept "Tenderness of prostate" "finding")))
      (or (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
          (clinical_finding (snomed_concept "Nitrite detected in urine" "finding")))
      (or (clinical_finding (snomed_concept "Increased frequency of urination" "finding"))
          (clinical_finding (snomed_concept "Urgent desire to urinate" "finding"))))
  )
)
(system_diagnosis_rule
  "Diagnose probable MUS (urethritis) from urinary symptoms"
  (diagnosis
    (snomed_concept "Urethritis" "disorder")
    probable
  )
  adult
  (or
    ;; Man with urethral discharge
    (and
      (clinical_finding (snomed_concept "Male" "finding"))
      (clinical_finding (snomed_concept "Urethral discharge" "finding")))
    ;; Man, No to perineal/body pain or tender prostate, leucocytes/nitrites, no frequency/urgency
    (and
      (clinical_finding (snomed_concept "Male" "finding"))
      (no (clinical_finding (snomed_concept "Perineal pain" "finding")))
      (no (clinical_finding (snomed_concept "Generalized aches and pains" "finding")))
      (no (clinical_finding (snomed_concept "Tenderness of prostate" "finding")))
      (or (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
          (clinical_finding (snomed_concept "Nitrite detected in urine" "finding")))
      (no (clinical_finding (snomed_concept "Increased frequency of urination" "finding")))
      (no (clinical_finding (snomed_concept "Urgent desire to urinate" "finding"))))
  )
)
(system_diagnosis_rule
  "Diagnose probable acute prostatitis from urinary symptoms"
  (diagnosis
    (snomed_concept "Acute prostatitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Male" "finding"))
    ;; entry: burning/frequency/urgency or leucocytes/nitrites on dipstick
    (or (clinical_finding (snomed_concept "Dysuria" "finding"))
        (clinical_finding (snomed_concept "Increased frequency of urination" "finding"))
        (clinical_finding (snomed_concept "Urgent desire to urinate" "finding"))
        (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
        (clinical_finding (snomed_concept "Nitrite detected in urine" "finding")))
    (or (clinical_finding (snomed_concept "Perineal pain" "finding"))
        (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
        (clinical_finding (snomed_concept "Tenderness of prostate" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose possible diabetes from urinary symptoms"
  (diagnosis
    (snomed_concept "Diabetes mellitus" "disorder")
    possible
  )
  adult
  (or
    ;; Woman, burning/frequency/urgency, no leucocytes or nitrites, glucose: exclude diabetes
    (and
      (clinical_finding (snomed_concept "Female" "finding"))
      (or (clinical_finding (snomed_concept "Dysuria" "finding"))
          (clinical_finding (snomed_concept "Increased frequency of urination" "finding"))
          (clinical_finding (snomed_concept "Urgent desire to urinate" "finding")))
      (no (clinical_finding (snomed_concept "Leukocytes in urine" "finding")))
      (no (clinical_finding (snomed_concept "Nitrite detected in urine" "finding")))
      (clinical_finding (snomed_concept "Glycosuria" "finding")))
    ;; Man, burning/frequency/urgency, No to prostatitis features, no leucocytes/nitrites, glucose on dipstick
    (and
      (clinical_finding (snomed_concept "Male" "finding"))
      (or (clinical_finding (snomed_concept "Dysuria" "finding"))
          (clinical_finding (snomed_concept "Increased frequency of urination" "finding"))
          (clinical_finding (snomed_concept "Urgent desire to urinate" "finding")))
      (no (clinical_finding (snomed_concept "Perineal pain" "finding")))
      (no (clinical_finding (snomed_concept "Generalized aches and pains" "finding")))
      (no (clinical_finding (snomed_concept "Tenderness of prostate" "finding")))
      (no (clinical_finding (snomed_concept "Leukocytes in urine" "finding")))
      (no (clinical_finding (snomed_concept "Nitrite detected in urine" "finding")))
      (clinical_finding (snomed_concept "Glycosuria" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose possible pregnancy from urinary symptoms"
  (diagnosis
    (snomed_concept "Pregnancy" "finding")
    possible
  )
  adult
  ;; Woman, no leucocytes or nitrites, frequency: exclude pregnancy
  (and
    (clinical_finding (snomed_concept "Female" "finding"))
    (no (clinical_finding (snomed_concept "Leukocytes in urine" "finding")))
    (no (clinical_finding (snomed_concept "Nitrite detected in urine" "finding")))
    (clinical_finding (snomed_concept "Increased frequency of urination" "finding"))
  )
)
(system_priority_evaluation
  "Urgent: urinary symptoms with retention, complicated pyelonephritis, kidney disease or kidney stone"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Urinary symptoms" "finding"))
    (or
      ;; Unable to pass urine with lower abdominal discomfort/distension
      (and
        (clinical_finding (snomed_concept "Unable to void urine" "finding"))
        (or (clinical_finding (snomed_concept "Abdominal discomfort" "finding") (finding_site (snomed_concept "Lower abdomen structure" "body structure")))
            (clinical_finding (snomed_concept "Distension of abdomen" "finding") (finding_site (snomed_concept "Lower abdomen structure" "body structure")))))
      ;; Complicated pyelonephritis likely
      (and
        (clinical_finding (snomed_concept "Flank pain" "finding"))
        (or (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
            (clinical_finding (snomed_concept "Nitrite detected in urine" "finding")))
        (or (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
            (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
            (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
            (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
            (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
            (clinical_finding (snomed_concept "Male" "finding"))
            (clinical_finding (snomed_concept "Pregnancy" "finding"))
            (clinical_finding (snomed_concept "Postmenopausal state" "finding"))))
      ;; Kidney disease likely
      (and
        (or (clinical_finding (snomed_concept "Blood in urine" "finding"))
            (clinical_finding (snomed_concept "Proteinuria" "finding")))
        (or (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
            (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Foot structure" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
            (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 140)
            (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 90)
            (clinical_finding (snomed_concept "Oliguria" "finding"))))
      ;; Kidney stone likely
      (and
        (clinical_finding (snomed_concept "Blood in urine" "finding"))
        (or (clinical_finding (snomed_concept "Left flank pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
            (clinical_finding (snomed_concept "Right flank pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
            (clinical_finding (snomed_concept "Left inguinal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
            (clinical_finding (snomed_concept "Right inguinal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))))
    )
  )
)

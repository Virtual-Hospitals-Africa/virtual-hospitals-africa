(task
  "Check for urgent urinary symptom conditions"
  adult
  (clinical_finding (snomed_concept "Urinary symptoms" "finding"))
  (check_for

    (clinical_finding (snomed_concept "Unable to void urine" "finding"))
    (clinical_finding (snomed_concept "Abdominal discomfort" "finding") (finding_site (snomed_concept "Lower abdomen structure" "body structure")))
    (clinical_finding (snomed_concept "Distension of abdomen" "finding") (finding_site (snomed_concept "Lower abdomen structure" "body structure")))


    (clinical_finding (snomed_concept "Flank pain" "finding"))
    (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
    (clinical_finding (snomed_concept "Nitrite detected in urine" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
    (clinical_finding (snomed_concept "Male" "finding"))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Postmenopausal state" "finding"))


    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Proteinuria" "finding"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Foot structure" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Oliguria" "finding"))


    (clinical_finding (snomed_concept "Flank pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Inguinal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
  )
)

(task
  "Check for urinary infection features"
  adult
  (clinical_finding (snomed_concept "Urinary symptoms" "finding"))
  (check_for

    (clinical_finding (snomed_concept "Dysuria" "finding"))
    (clinical_finding (snomed_concept "Increased frequency of urination" "finding"))
    (clinical_finding (snomed_concept "Urgent desire to urinate" "finding"))
    (clinical_finding (snomed_concept "Female" "finding"))
    (clinical_finding (snomed_concept "Glycosuria" "finding"))


    (clinical_finding (snomed_concept "Urinary catheter in situ" "finding"))
    (clinical_finding (snomed_concept "Disorder of urinary system" "disorder"))


    (clinical_finding (snomed_concept "Urethral discharge" "finding"))
    (clinical_finding (snomed_concept "Perineal pain" "finding"))
    (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
    (clinical_finding (snomed_concept "Tenderness of prostate" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable complicated pyelonephritis (urinary symptoms)"
  (diagnosis
    (snomed_concept "Acute pyelonephritis" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Flank pain" "finding"))
       (or (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
           (clinical_finding (snomed_concept "Nitrite detected in urine" "finding")))
       (or (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
           (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
           (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
           (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
           (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
           (clinical_finding (snomed_concept "Male" "finding"))
           (clinical_finding (snomed_concept "Pregnancy" "finding"))
           (clinical_finding (snomed_concept "Postmenopausal state" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable uncomplicated pyelonephritis (urinary symptoms)"
  (diagnosis
    (snomed_concept "Acute pyelonephritis" "disorder")
    probable
  )
  adult


  (and (clinical_finding (snomed_concept "Flank pain" "finding"))
       (or (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
           (clinical_finding (snomed_concept "Nitrite detected in urine" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable kidney disease (urinary symptoms)"
  (diagnosis
    (snomed_concept "Kidney disease" "disorder")
    probable
  )
  adult
  (and (or (clinical_finding (snomed_concept "Blood in urine" "finding"))
           (clinical_finding (snomed_concept "Proteinuria" "finding")))
       (or (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
           (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Foot structure" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
           (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 140)
           (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 90)
           (clinical_finding (snomed_concept "Oliguria" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable kidney stone (urinary symptoms)"
  (diagnosis
    (snomed_concept "Kidney stone" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Blood in urine" "finding"))
       (or (clinical_finding (snomed_concept "Flank pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
           (clinical_finding (snomed_concept "Inguinal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value"))))
  )
)
(system_diagnosis_rule
  "Diagnose probable simple UTI in a woman (urinary symptoms)"
  (diagnosis
    (snomed_concept "Lower urinary tract infectious disease" "disorder")
    probable
  )
  adult

  (and (clinical_finding (snomed_concept "Female" "finding"))
       (or (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
           (clinical_finding (snomed_concept "Nitrite detected in urine" "finding")))
       (no (clinical_finding (snomed_concept "Urinary catheter in situ" "finding")))
       (no (clinical_finding (snomed_concept "Diabetes mellitus" "disorder")))
       (no (clinical_finding (snomed_concept "Pregnancy" "finding")))
       (no (clinical_finding (snomed_concept "Disorder of urinary system" "disorder")))
  )
)
(system_diagnosis_rule
  "Diagnose probable complicated UTI (urinary symptoms)"
  (diagnosis
    (snomed_concept "Urinary tract infectious disease" "disorder")
    probable
  )
  adult
  (or

    (and (clinical_finding (snomed_concept "Female" "finding"))
         (or (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
             (clinical_finding (snomed_concept "Nitrite detected in urine" "finding")))
         (or (clinical_finding (snomed_concept "Urinary catheter in situ" "finding"))
             (clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))
             (clinical_finding (snomed_concept "Pregnancy" "finding"))
             (clinical_finding (snomed_concept "Disorder of urinary system" "disorder"))))

    (and (clinical_finding (snomed_concept "Male" "finding"))
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
  "Diagnose probable male urethritis syndrome (urinary symptoms)"
  (diagnosis
    (snomed_concept "Urethritis" "disorder")
    probable
  )
  adult
  (or

    (and (clinical_finding (snomed_concept "Male" "finding"))
         (or (clinical_finding (snomed_concept "Dysuria" "finding"))
             (clinical_finding (snomed_concept "Increased frequency of urination" "finding"))
             (clinical_finding (snomed_concept "Urgent desire to urinate" "finding"))
             (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
             (clinical_finding (snomed_concept "Nitrite detected in urine" "finding")))
         (clinical_finding (snomed_concept "Urethral discharge" "finding")))

    (and (clinical_finding (snomed_concept "Male" "finding"))
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
  "Diagnose probable acute prostatitis (urinary symptoms)"
  (diagnosis
    (snomed_concept "Acute prostatitis" "disorder")
    probable
  )
  adult

  (and (clinical_finding (snomed_concept "Male" "finding"))
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
  "Diagnose possible diabetes (urinary symptoms with glycosuria)"
  (diagnosis
    (snomed_concept "Diabetes mellitus" "disorder")
    possible
  )
  adult

  (and (or (clinical_finding (snomed_concept "Dysuria" "finding"))
           (clinical_finding (snomed_concept "Increased frequency of urination" "finding"))
           (clinical_finding (snomed_concept "Urgent desire to urinate" "finding")))
       (no (clinical_finding (snomed_concept "Leukocytes in urine" "finding")))
       (no (clinical_finding (snomed_concept "Nitrite detected in urine" "finding")))
       (clinical_finding (snomed_concept "Glycosuria" "finding"))
       (or (clinical_finding (snomed_concept "Female" "finding"))
           (and (clinical_finding (snomed_concept "Male" "finding"))
                (no (clinical_finding (snomed_concept "Perineal pain" "finding")))
                (no (clinical_finding (snomed_concept "Generalized aches and pains" "finding")))
                (no (clinical_finding (snomed_concept "Tenderness of prostate" "finding"))))))
)
(system_diagnosis_rule
  "Diagnose possible pregnancy (urinary frequency)"
  (diagnosis
    (snomed_concept "Pregnancy" "finding")
    possible
  )
  adult

  (and (clinical_finding (snomed_concept "Female" "finding"))
       (no (clinical_finding (snomed_concept "Leukocytes in urine" "finding")))
       (no (clinical_finding (snomed_concept "Nitrite detected in urine" "finding")))
       (clinical_finding (snomed_concept "Increased frequency of urination" "finding")))
)
(system_priority_evaluation
  "Urgent: urinary symptoms with danger signs"
  adult
  Urgent
  (and (clinical_finding (snomed_concept "Urinary symptoms" "finding"))
       (or

         (and (clinical_finding (snomed_concept "Unable to void urine" "finding"))
              (or (clinical_finding (snomed_concept "Abdominal discomfort" "finding") (finding_site (snomed_concept "Lower abdomen structure" "body structure")))
                  (clinical_finding (snomed_concept "Distension of abdomen" "finding") (finding_site (snomed_concept "Lower abdomen structure" "body structure")))))


         (and (clinical_finding (snomed_concept "Flank pain" "finding"))
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

         (active_condition (snomed_concept "Kidney disease" "disorder"))

         (active_condition (snomed_concept "Kidney stone" "disorder"))
       )
  )
)

;; Page 21 - SEIZURES/FITS (cont. 2)
;; Approach to the patient who is not fitting now (see 21-seizures-fits-cont-2-flowchart.md)
(task
  "Check for seizure/fit same-day referral conditions"
  adult
  (or (clinical_finding (snomed_concept "Seizure" "finding"))
      (clinical_finding (snomed_concept "Post-ictal state" "finding")))
  (check_for
    ;; Meningitis likely
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))

    ;; New/different or worsening headache
    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))

    ;; HIV and no known epilepsy
    (clinical_finding (snomed_concept "Human immunodeficiency virus infection" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Epilepsy" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))

    ;; Decreased consciousness after fit
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))

    ;; Glucose threshold depends on diabetes
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))

    ;; Focal neurology (red box, and the No branch: stroke or TIA likely)
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))

    ;; Alcohol/drug use, head injury, pregnancy
    (clinical_finding (snomed_concept "Overdose" "disorder"))
    (clinical_finding (snomed_concept "Substance withdrawal syndrome" "disorder"))
    (clinical_finding (snomed_concept "Injury of head" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Postpartum state" "finding"))

    ;; No branch: common faint likely
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (clinical_finding (snomed_concept "Muscle twitch" "finding"))
    (clinical_finding (snomed_concept "Flushing" "disorder"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Sweating" "finding"))
  )
)
;; Red box: "Temperature >= 38°C, headache, neck stiffness or purple/red rash, meningitis likely"
(system_diagnosis_rule
  "Diagnose probable meningitis after a seizure/fit"
  (diagnosis
    (snomed_concept "Meningitis" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Seizure" "finding"))
        (clinical_finding (snomed_concept "Post-ictal state" "finding")))
    (or (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
        (clinical_finding (snomed_concept "Headache" "finding"))
        (clinical_finding (snomed_concept "Stiff neck" "finding"))
        (clinical_finding (snomed_concept "Purpuric rash" "disorder")))
  )
)
;; No branch: "New sudden asymmetric weakness or numbness of face, arm or leg; difficulty speaking or visual disturbance" -> Stroke or TIA likely
(system_diagnosis_rule
  "Diagnose probable stroke after a reported fit"
  (diagnosis
    (snomed_concept "Cerebrovascular accident" "disorder")
    probable
  )
  adult
  (or (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
      (clinical_finding (snomed_concept "Muscle weakness of limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of limbs" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty talking" "finding"))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder")))
)
;; No branch: "Collapse with twitching lasting < 15 seconds following flushing, dizziness, nausea, sweating and with rapid recovery" -> Common faint likely
;; (duration < 15 seconds and rapid recovery cannot be expressed)
(system_diagnosis_rule
  "Diagnose probable common faint after a reported fit"
  (diagnosis
    (snomed_concept "Vasovagal syncope" "finding")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (clinical_finding (snomed_concept "Muscle twitch" "finding"))
    (or (clinical_finding (snomed_concept "Flushing" "disorder"))
        (clinical_finding (snomed_concept "Dizziness" "finding"))
        (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Sweating" "finding")))
  )
)
;; Red box: "Refer patient same day if any of:"
(system_priority_evaluation
  "Urgent: seizure/fit needing same-day referral"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Seizure" "finding"))
        (clinical_finding (snomed_concept "Post-ictal state" "finding")))
    (or
      (active_condition (snomed_concept "Meningitis" "disorder"))

      (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "New" "qualifier value")))
      (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))

      (and (clinical_finding (snomed_concept "Human immunodeficiency virus infection" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
           (no (clinical_finding (snomed_concept "Epilepsy" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))))

      (and (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
           (>= (onset (clinical_finding (snomed_concept "Seizure" "finding"))) (time_ago 1 hours)))

      (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
      (and (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
           (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 4))
      (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)

      (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
      (clinical_finding (snomed_concept "Muscle weakness of limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of limbs" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty talking" "finding"))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder"))

      (and (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
               (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 130))
           (>= (onset (clinical_finding (snomed_concept "Seizure" "finding"))) (time_ago 1 hours)))

      (clinical_finding (snomed_concept "Overdose" "disorder"))
      (clinical_finding (snomed_concept "Substance withdrawal syndrome" "disorder"))

      (clinical_finding (snomed_concept "Injury of head" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))

      (clinical_finding (snomed_concept "Pregnancy" "finding"))
      (<= (onset (clinical_finding (snomed_concept "Postpartum state" "finding"))) (time_ago 1 weeks))
    )
  )
)

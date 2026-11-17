;; Page 21 - SEIZURES/FITS (cont. 2)
;; Approach to the patient who is not fitting now. Red box: "Refer patient same day if any of:"
;; See 21-seizures-fits-cont-2-flowchart.md. Final build: reconciled from builders A and B (see reconcile.json).
(task
  "Check for same-day referral after a seizure/fit"
  adult
  (clinical_finding (snomed_concept "Seizure" "finding"))
  (check_for
    ;; meningitis likely
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))

    ;; headache change
    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
    (clinical_finding (snomed_concept "Frequent headache" "finding"))

    ;; known conditions
    (clinical_finding (snomed_concept "Human immunodeficiency virus infection" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Epilepsy" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))

    ;; consciousness after the fit
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))

    ;; focal neurology (stroke or TIA likely)
    (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))

    ;; alcohol/drug use, head injury, pregnancy
    (clinical_finding (snomed_concept "Overdose" "disorder"))
    (clinical_finding (snomed_concept "Substance withdrawal syndrome" "disorder"))
    (clinical_finding (snomed_concept "Injury of head" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Postpartum state" "finding"))

    ;; not a seizure: common faint likely
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (clinical_finding (snomed_concept "Muscle twitch" "finding"))
    (clinical_finding (snomed_concept "Flushing" "disorder"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Sweating" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable meningitis after a seizure/fit"
  (diagnosis
    (snomed_concept "Meningitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (or (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
        (clinical_finding (snomed_concept "Headache" "finding"))
        (clinical_finding (snomed_concept "Stiff neck" "finding"))
        (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable stroke from focal signs (seizure/fit page)"
  (diagnosis
    (snomed_concept "Cerebrovascular accident" "disorder")
    probable
  )
  adult
  (or (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty talking" "finding"))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
  )
)
(system_diagnosis_rule
  "Diagnose probable TIA from focal signs (seizure/fit page)"
  (diagnosis
    (snomed_concept "Transient ischemic attack" "disorder")
    probable
  )
  adult
  (or (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty talking" "finding"))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
  )
)
(system_diagnosis_rule
  "Diagnose probable common faint (seizure/fit page)"
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
        (clinical_finding (snomed_concept "Sweating" "finding"))
    )
  )
)
(system_priority_evaluation
  "Urgent: same-day referral after a seizure/fit"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (or
      ;; meningitis likely
      (active_condition (snomed_concept "Meningitis" "disorder"))

      ;; new/different headache or headache getting worse/more frequent
      (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "New" "qualifier value")))
      (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
      (clinical_finding (snomed_concept "Frequent headache" "finding"))

      ;; patient with HIV and no known epilepsy
      (and (clinical_finding (snomed_concept "Human immunodeficiency virus infection" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
           (no (clinical_finding (snomed_concept "Epilepsy" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))))

      ;; decreased consciousness > 1 hour after fit
      (and (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
           (>= (onset (clinical_finding (snomed_concept "Seizure" "finding"))) (time_ago 1 hours)))

      ;; glucose < 3 (< 4 if diabetes); glucose >= 11.1
      (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
      (and (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
           (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 4))
      (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)

      ;; new sudden asymmetric weakness or numbness, difficulty speaking or visual disturbance
      (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty talking" "finding"))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder"))

      ;; BP >= 180/130 more than 1 hour after fit has stopped
      (and (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
               (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 130))
           (>= (onset (clinical_finding (snomed_concept "Seizure" "finding"))) (time_ago 1 hours)))

      ;; alcohol/drug use: overdose or withdrawal
      (clinical_finding (snomed_concept "Overdose" "disorder"))
      (clinical_finding (snomed_concept "Substance withdrawal syndrome" "disorder"))

      ;; recent head injury
      (clinical_finding (snomed_concept "Injury of head" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))

      ;; pregnant or up to 1 week postpartum
      (clinical_finding (snomed_concept "Pregnancy" "finding"))
      (and (clinical_finding (snomed_concept "Postpartum state" "finding"))
           (<= (onset (clinical_finding (snomed_concept "Postpartum state" "finding"))) (time_ago 1 weeks)))
    )
  )
)

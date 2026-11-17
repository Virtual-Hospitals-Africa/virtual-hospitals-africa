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
;; meningitis likely
(system_priority_evaluation
  "Urgent: same-day referral after a seizure/fit: meningitis"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (active_condition (snomed_concept "Meningitis" "disorder"))
  )
)
;; new/different headache or headache getting worse/more frequent
(system_priority_evaluation
  "Urgent: same-day referral after a seizure/fit: headache (new)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "New" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: same-day referral after a seizure/fit: headache (worsening)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: same-day referral after a seizure/fit: frequent headache"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Frequent headache" "finding"))
  )
)
;; patient with HIV and no known epilepsy
(system_priority_evaluation
  "Urgent: same-day referral after a seizure/fit: human immunodeficiency virus infection (known present) and no epilepsy (known present)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Human immunodeficiency virus infection" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (no (clinical_finding (snomed_concept "Epilepsy" "disorder") (qualifier (snomed_concept "Known present" "qualifier value"))))
  )
)
;; decreased consciousness > 1 hour after fit
(system_priority_evaluation
  "Urgent: same-day referral after a seizure/fit: decreased level of consciousness and onset of seizure ≥ 1 hours ago"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (>= (onset (clinical_finding (snomed_concept "Seizure" "finding"))) (time_ago 1 hours))
  )
)
;; glucose < 3 (< 4 if diabetes); glucose >= 11.1
(system_priority_evaluation
  "Urgent: same-day referral after a seizure/fit: blood glucose status < 3 mmol/L"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
  )
)

(system_priority_evaluation
  "Urgent: same-day referral after a seizure/fit: diabetes mellitus (known present) and blood glucose status < 4 mmol/L"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 4)
  )
)

(system_priority_evaluation
  "Urgent: same-day referral after a seizure/fit: blood glucose status ≥ 11.1 mmol/L"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)
  )
)
;; new sudden asymmetric weakness or numbness, difficulty speaking or visual disturbance
(system_priority_evaluation
  "Urgent: same-day referral after a seizure/fit: muscle weakness (sudden onset, asymmetry)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: same-day referral after a seizure/fit: numbness (sudden onset, asymmetry)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Numbness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: same-day referral after a seizure/fit: difficulty talking"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: same-day referral after a seizure/fit: visual disturbance"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
  )
)
;; BP >= 180/130 more than 1 hour after fit has stopped
(system_priority_evaluation
  "Urgent: same-day referral after a seizure/fit: systolic blood pressure ≥ 180 mmHg or diastolic blood pressure ≥ 130 mmHg …"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
        (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 130))
    (>= (onset (clinical_finding (snomed_concept "Seizure" "finding"))) (time_ago 1 hours))
  )
)
;; alcohol/drug use: overdose or withdrawal
(system_priority_evaluation
  "Urgent: same-day referral after a seizure/fit: overdose"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Overdose" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: same-day referral after a seizure/fit: substance withdrawal syndrome"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Substance withdrawal syndrome" "disorder"))
  )
)
;; recent head injury
(system_priority_evaluation
  "Urgent: same-day referral after a seizure/fit: injury of head (recent)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Injury of head" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
  )
)
;; pregnant or up to 1 week postpartum
(system_priority_evaluation
  "Urgent: same-day referral after a seizure/fit: pregnancy"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: same-day referral after a seizure/fit: postpartum state and onset of postpartum state ≤ 1 weeks ago"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Postpartum state" "finding"))
    (<= (onset (clinical_finding (snomed_concept "Postpartum state" "finding"))) (time_ago 1 weeks))
  )
)

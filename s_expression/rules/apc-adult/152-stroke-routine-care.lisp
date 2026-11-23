;; Page 152 - Stroke: routine care
;; Reconciled from builds A and B (base B). "Sudden onset of one or more of the following
;; suggests a stroke" and the red box "Give urgent attention to the patient with a new stroke/TIA".
;; Every red-box bullet is management and is not encoded (see the remaining-questions file).
(task
  "Check for new stroke/TIA"
  adult
  (or
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding"))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))
    (clinical_finding (snomed_concept "Numbness of face" "finding"))
    (clinical_finding (snomed_concept "Numbness of upper limb" "finding"))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding"))
    (clinical_finding (snomed_concept "Blurring of visual image" "finding"))
    (clinical_finding (snomed_concept "Reduced visual acuity" "finding"))
    (clinical_finding (snomed_concept "Diplopia" "disorder"))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Difficulty understanding verbal language" "finding"))
    (clinical_finding (snomed_concept "Difficulty walking" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Impairment of balance" "finding"))
    (clinical_finding (snomed_concept "Decreased coordination" "finding"))
    ;; recorded stroke (Focal neurology warning sign)
    (clinical_finding (snomed_concept "Cerebrovascular accident" "disorder"))
  )
  (check_for
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))

    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))

    (clinical_finding (snomed_concept "Blurring of visual image" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Reduced visual acuity" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Diplopia" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))

    (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty understanding verbal language" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))

    (clinical_finding (snomed_concept "Difficulty walking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Impairment of balance" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Decreased coordination" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))

    ;; "a new stroke/TIA"
    (clinical_finding (snomed_concept "Transient ischemic attack" "disorder") (qualifier (snomed_concept "New" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose possible stroke from sudden-onset neurological symptoms"
  (diagnosis
    (snomed_concept "Cerebrovascular accident" "disorder")
    possible
  )
  adult
  (or
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Blurring of visual image" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Reduced visual acuity" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Diplopia" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty understanding verbal language" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty walking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Impairment of balance" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Decreased coordination" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: new stroke/TIA: weakness of face muscles (sudden onset)"
  adult
  Urgent
  (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
)

(system_priority_evaluation
  "Urgent: new stroke/TIA: muscle weakness of upper limb (sudden onset)"
  adult
  Urgent
  (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
)

(system_priority_evaluation
  "Urgent: new stroke/TIA: weakness of muscle of lower limb (sudden onset)"
  adult
  Urgent
  (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
)

(system_priority_evaluation
  "Urgent: new stroke/TIA: numbness of face (sudden onset)"
  adult
  Urgent
  (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
)

(system_priority_evaluation
  "Urgent: new stroke/TIA: numbness of upper limb (sudden onset)"
  adult
  Urgent
  (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
)

(system_priority_evaluation
  "Urgent: new stroke/TIA: numbness of lower limb (sudden onset)"
  adult
  Urgent
  (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
)

(system_priority_evaluation
  "Urgent: new stroke/TIA: blurring of visual image (sudden onset)"
  adult
  Urgent
  (clinical_finding (snomed_concept "Blurring of visual image" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
)

(system_priority_evaluation
  "Urgent: new stroke/TIA: reduced visual acuity (sudden onset)"
  adult
  Urgent
  (clinical_finding (snomed_concept "Reduced visual acuity" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
)

(system_priority_evaluation
  "Urgent: new stroke/TIA: diplopia (sudden onset)"
  adult
  Urgent
  (clinical_finding (snomed_concept "Diplopia" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
)

(system_priority_evaluation
  "Urgent: new stroke/TIA: difficulty talking (sudden onset)"
  adult
  Urgent
  (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
)

(system_priority_evaluation
  "Urgent: new stroke/TIA: difficulty understanding verbal language (sudden onset)"
  adult
  Urgent
  (clinical_finding (snomed_concept "Difficulty understanding verbal language" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
)

(system_priority_evaluation
  "Urgent: new stroke/TIA: difficulty walking (sudden onset)"
  adult
  Urgent
  (clinical_finding (snomed_concept "Difficulty walking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
)

(system_priority_evaluation
  "Urgent: new stroke/TIA: dizziness (sudden onset)"
  adult
  Urgent
  (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
)

(system_priority_evaluation
  "Urgent: new stroke/TIA: impairment of balance (sudden onset)"
  adult
  Urgent
  (clinical_finding (snomed_concept "Impairment of balance" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
)

(system_priority_evaluation
  "Urgent: new stroke/TIA: decreased coordination (sudden onset)"
  adult
  Urgent
  (clinical_finding (snomed_concept "Decreased coordination" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
)

(system_priority_evaluation
  "Urgent: new stroke/TIA: cerebrovascular accident"
  adult
  Urgent
  (clinical_finding (snomed_concept "Cerebrovascular accident" "disorder"))
)

(system_priority_evaluation
  "Urgent: new stroke/TIA: transient ischemic attack (new)"
  adult
  Urgent
  (clinical_finding (snomed_concept "Transient ischemic attack" "disorder") (qualifier (snomed_concept "New" "qualifier value")))
)

;; Page 152 - Stroke: routine care
;; "Sudden onset of one or more of the following suggests a stroke (or a transient ischaemic
;; attack (TIA) ...)" and the red box "Give urgent attention to the patient with a new stroke/TIA".
;; Every red-box bullet is management (oxygen, nil by mouth, glucose, BP, referral) and is not
;; encoded here (see 152-stroke-routine-care-remaining-questions.md).
(task
  "Check for sudden-onset stroke/TIA symptoms"
  adult
  (or (clinical_finding (snomed_concept "Dizziness" "finding"))
      (clinical_finding (snomed_concept "Cerebrovascular accident" "disorder"))
      (diagnosis (snomed_concept "Cerebrovascular accident" "disorder") possible))
  (check_for
    ;; Weakness or numbness of face/arm/leg
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))

    ;; Blurred or decreased vision in one/both eyes or double vision
    (clinical_finding (snomed_concept "Blurring of visual image" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Reduced visual acuity" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Diplopia" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))

    ;; Difficulty speaking or understanding
    (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty comprehending speech" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))

    ;; Difficulty walking, dizziness, loss of balance or co-ordination
    (clinical_finding (snomed_concept "Difficulty walking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Unable to balance" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Incoordination" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))

    ;; New TIA (red box: "a new stroke/TIA")
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
  ;; "Sudden onset of one or more of the following suggests a stroke"
  (or (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Blurring of visual image" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Reduced visual acuity" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Diplopia" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty comprehending speech" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty walking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Unable to balance" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Incoordination" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)
(system_priority_evaluation
  "Urgent: new stroke/TIA"
  adult
  Urgent
  ;; "Give urgent attention to the patient with a new stroke/TIA"
  (or (clinical_finding (snomed_concept "Cerebrovascular accident" "disorder"))
      (clinical_finding (snomed_concept "Transient ischemic attack" "disorder") (qualifier (snomed_concept "New" "qualifier value")))
      (diagnosis (snomed_concept "Cerebrovascular accident" "disorder") possible))
)

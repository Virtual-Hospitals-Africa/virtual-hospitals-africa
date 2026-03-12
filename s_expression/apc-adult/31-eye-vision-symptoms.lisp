;; Page 31 - Eye or Vision Symptoms
(task
  "Check for urgent eye or vision conditions"
  adult
  (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Sees haloes around lights" "finding"))
    (clinical_finding (snomed_concept "Blurring of visual image" "finding"))
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of face" "finding"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Sudden visual loss" "disorder"))
    (clinical_finding (snomed_concept "Corneal ulcer" "disorder"))
    (clinical_finding (snomed_concept "Corneal opacity" "disorder"))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (and
      (not (clinical_finding (snomed_concept "Pregnancy" "finding")))
      (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmhg) 180)
      (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmhg) 110))
    (and
      (or
        (clinical_finding (snomed_concept "Pregnancy" "finding"))
        (<= (timestamp (clinical_finding (snomed_concept "Postpartum state" "finding"))) (time_ago 7 days)))
      (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmhg) 140)
      (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmhg) 90))
    (clinical_finding (snomed_concept "Edema of eyelid" "disorder") (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Red eye" "finding"))
    (clinical_finding (snomed_concept "Pain in eye" "finding"))
    (clinical_finding (snomed_concept "Abnormal vision" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Herpes zoster involving tip of nose" "disorder"))
    (clinical_finding (snomed_concept "Herpes zoster ophthalmicus" "disorder"))
    (clinical_finding (snomed_concept "Penetrating wound of eye" "disorder"))
    (clinical_finding (snomed_concept "Laceration of eyelid" "disorder"))
    (clinical_finding (snomed_concept "Metal foreign body in eye region" "disorder"))
    (clinical_finding (snomed_concept "Penetration of eyeball with magnetic foreign body" "disorder"))
    (clinical_finding (snomed_concept "Burn of cornea" "disorder"))
    (clinical_finding (snomed_concept "Ptosis of eyelid" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)

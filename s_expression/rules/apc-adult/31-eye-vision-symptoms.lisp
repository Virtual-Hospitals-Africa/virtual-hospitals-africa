;; Page 31 - Eye or Vision Symptoms
(task
  "Check for urgent eye or vision conditions"
  adult
  (or
    (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
    (clinical_finding (finding_site (snomed_concept "Structure of eye proper" "body structure")))
  )
  (check_for
    (clinical_finding (snomed_concept "Sees haloes around lights" "finding"))
    (clinical_finding (snomed_concept "Blurring of visual image" "finding"))
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of face" "finding"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Sudden visual loss" "disorder"))
    (clinical_finding (snomed_concept "Corneal ulcer" "disorder"))
    (clinical_finding (snomed_concept "Corneal opacity" "disorder"))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (<= (timestamp (clinical_finding (snomed_concept "Postpartum state" "finding"))) (time_ago 7 days))
    (clinical_finding (snomed_concept "Edema of eyelid" "disorder") (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Red eye" "finding"))
    (clinical_finding (snomed_concept "Pain in eye" "finding"))
    (clinical_finding (snomed_concept "Abnormal vision" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (clinical_finding (snomed_concept "Herpes zoster involving tip of nose" "disorder"))
    (clinical_finding (snomed_concept "Herpes zoster ophthalmicus" "disorder"))
    (clinical_finding (snomed_concept "Penetrating wound of eye" "disorder"))
    (clinical_finding (snomed_concept "Laceration of eyelid" "disorder"))
    (clinical_finding (snomed_concept "Metal foreign body in eye region" "disorder"))
    (clinical_finding (snomed_concept "Penetration of eyeball with magnetic foreign body" "disorder"))
    (clinical_finding (snomed_concept "Burn of cornea" "disorder"))
    (clinical_finding (snomed_concept "Ptosis of eyelid" "disorder") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling of eyelid" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Nausea and vomiting" "disorder"))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Orbital cellulitis" "disorder"))
    (clinical_finding (snomed_concept "Chemical burn" "disorder") (finding_site (snomed_concept "Structure of eye proper" "body structure")))
    (clinical_finding (snomed_concept "Corneal haze" "disorder"))
    (clinical_finding (snomed_concept "Herpes zoster keratoconjunctivitis" "disorder"))
  )
)
;; Page 31 - Eye: Orbital cellulitis likely with swollen painful eyelid
(system_diagnosis_rule
  "Diagnose probable orbital cellulitis"
  (diagnosis
    (snomed_concept "Orbital cellulitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Swelling of eyelid" "finding"))
    (clinical_finding (snomed_concept "Pain in eye" "finding"))
    (clinical_finding (snomed_concept "Red eye" "finding"))
  )
)
;; Page 31 - Eye: Acute angle-closure glaucoma with painful eye and haloes/blurred vision
(system_diagnosis_rule
  "Diagnose probable Acute-on-chronic glaucoma"
  (diagnosis
    (snomed_concept "Acute-on-chronic glaucoma" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Pain in eye" "finding"))
    (clinical_finding (snomed_concept "Red eye" "finding"))
    (clinical_finding (snomed_concept "Sees haloes around lights" "finding"))
    (clinical_finding (snomed_concept "Blurring of visual image" "finding"))
    (or
      (clinical_finding (snomed_concept "Headache" "finding"))
      (clinical_finding (snomed_concept "Nausea and vomiting" "disorder"))
    )
  )
)
;; Page 31 - Eye/Vision: Emergency signs
(system_priority_evaluation
  "Emergency: stroke or neurological signs with visual symptoms"
  adult
  Emergency
  (and
    (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
    (or
      (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
      (clinical_finding (snomed_concept "Difficulty talking" "finding"))
      (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))
    )
  )
)
;; Page 31 - Eye/Vision: Urgent for standalone urgent eye conditions
(system_priority_evaluation
  "Urgent: serious eye condition requiring immediate assessment"
  adult
  Urgent
  (or
    (clinical_finding (snomed_concept "Orbital cellulitis" "disorder"))
    (clinical_finding (snomed_concept "Sudden visual loss" "disorder"))
    (clinical_finding (snomed_concept "Penetrating wound of eye" "disorder"))
    (clinical_finding (snomed_concept "Laceration of eyelid" "disorder"))
    (clinical_finding (snomed_concept "Chemical burn" "disorder") (finding_site (snomed_concept "Structure of eye proper" "body structure")))
    (clinical_finding (snomed_concept "Corneal ulcer" "disorder"))
    (clinical_finding (snomed_concept "Corneal haze" "disorder"))
    (clinical_finding (snomed_concept "Corneal opacity" "disorder"))
    (clinical_finding (snomed_concept "Herpes zoster keratoconjunctivitis" "disorder"))
    (clinical_finding (snomed_concept "Ptosis of eyelid" "disorder") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (clinical_finding (snomed_concept "Metal foreign body in eye region" "disorder"))
    (clinical_finding (snomed_concept "Penetration of eyeball with magnetic foreign body" "disorder"))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
  )
)

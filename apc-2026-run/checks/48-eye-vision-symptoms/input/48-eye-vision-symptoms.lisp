(task
  "Check for urgent eye/vision conditions"
  adult
  (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
  (check_for

    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))


    (clinical_finding (snomed_concept "Red eye" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Discharge from eye" "finding") (qualifier (snomed_concept "Excessive" "qualifier value")))
    (clinical_finding (snomed_concept "Sexually transmitted infectious disease" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))


    (clinical_finding (snomed_concept "Swelling of eyelid" "finding"))
    (clinical_finding (snomed_concept "Erythema" "finding") (finding_site (snomed_concept "Eyelid structure" "body structure")))
    (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Eyelid structure" "body structure")))
    (clinical_finding (snomed_concept "Pain in eye" "finding"))
    (clinical_finding (snomed_concept "Red eye" "finding"))
    (clinical_finding (snomed_concept "Blurring of visual image" "finding"))
    (clinical_finding (snomed_concept "Sees haloes around lights" "finding"))
    (clinical_finding (snomed_concept "Fixed dilatation of pupil" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))


    (clinical_finding (snomed_concept "Pain in eye" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Red eye" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Watery eye" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))


    (clinical_finding (snomed_concept "Sudden visual loss" "disorder"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Disorder of eye movements" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Exophthalmos" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Ptosis of eyelid" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))


    (clinical_finding (snomed_concept "Penetrating wound of eye" "disorder"))
    (clinical_finding (snomed_concept "Laceration of eyelid" "disorder"))
    (clinical_finding (snomed_concept "Penetrating wound of eyeball with foreign body" "disorder"))
    (clinical_finding (snomed_concept "Metal foreign body in eye region" "disorder"))
    (clinical_finding (snomed_concept "Chemical burn" "disorder"))


    (clinical_finding (snomed_concept "Herpes zoster ophthalmicus" "disorder"))
    (clinical_finding (snomed_concept "Herpes zoster" "disorder") (finding_site (snomed_concept "Nasal structure" "body structure")))
    (clinical_finding (snomed_concept "Corneal ulcer" "disorder"))
    (clinical_finding (snomed_concept "Corneal haze" "disorder"))


    (clinical_finding (snomed_concept "Scleral icterus" "finding"))


    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Postpartum state" "finding"))
  )
)


(task
  "Check for causes of non-urgent eye/vision symptoms"
  adult
  (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
  (check_for

    (clinical_finding (snomed_concept "Discharge from eye" "finding"))
    (clinical_finding (snomed_concept "Watery eye" "finding"))
    (clinical_finding (snomed_concept "Itching of eye" "finding"))


    (clinical_finding (snomed_concept "Discharge from eye" "finding") (qualifier (snomed_concept "Right and left" "qualifier value")))
    (clinical_finding (snomed_concept "Watery eye" "finding") (qualifier (snomed_concept "Right and left" "qualifier value")))
    (clinical_finding (snomed_concept "Eczema" "disorder"))
    (clinical_finding (snomed_concept "Allergic rhinitis caused by pollen" "disorder"))
    (clinical_finding (snomed_concept "Asthma" "disorder"))


    (clinical_finding (snomed_concept "Serous conjunctival discharge" "finding"))
    (clinical_finding (snomed_concept "Sore throat" "finding"))
    (clinical_finding (snomed_concept "Localized enlarged lymph nodes" "disorder"))
    (clinical_finding (snomed_concept "Purulent conjunctival discharge" "finding"))


    (clinical_finding (snomed_concept "Lump in eyelid" "finding"))
  )
)


(system_diagnosis_rule
  "Diagnose probable stroke or TIA in a patient with eye/vision symptoms"
  (diagnosis
    (snomed_concept "Cerebrovascular accident" "disorder")
    probable
  )
  adult
  (or
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)


(system_diagnosis_rule
  "Diagnose probable gonococcal conjunctivitis"
  (diagnosis
    (snomed_concept "Gonococcal conjunctivitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Red eye" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Discharge from eye" "finding") (qualifier (snomed_concept "Excessive" "qualifier value")))
    (clinical_finding (snomed_concept "Sexually transmitted infectious disease" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
  )
)


(system_diagnosis_rule
  "Diagnose probable orbital cellulitis"
  (diagnosis
    (snomed_concept "Orbital cellulitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Swelling of eyelid" "finding"))
    (clinical_finding (snomed_concept "Erythema" "finding") (finding_site (snomed_concept "Eyelid structure" "body structure")))
    (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Eyelid structure" "body structure")))
  )
)



(system_diagnosis_rule
  "Diagnose probable acute glaucoma in a patient with eye/vision symptoms"
  (diagnosis
    (snomed_concept "Acute angle closure" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Pain in eye" "finding"))
    (clinical_finding (snomed_concept "Red eye" "finding"))
    (clinical_finding (snomed_concept "Blurring of visual image" "finding"))
    (clinical_finding (snomed_concept "Sees haloes around lights" "finding"))
    (clinical_finding (snomed_concept "Fixed dilatation of pupil" "finding"))
    (or (clinical_finding (snomed_concept "Headache" "finding"))
        (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
  )
)


(system_diagnosis_rule
  "Diagnose probable jaundice from yellow eyes"
  (diagnosis
    (snomed_concept "Jaundice" "finding")
    probable
  )
  adult
  (clinical_finding (snomed_concept "Scleral icterus" "finding"))
)



(system_diagnosis_rule
  "Diagnose probable allergic conjunctivitis"
  (diagnosis
    (snomed_concept "Allergic conjunctivitis" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Discharge from eye" "finding"))
        (clinical_finding (snomed_concept "Watery eye" "finding")))
    (clinical_finding (snomed_concept "Itching of eye" "finding"))
    (or (clinical_finding (snomed_concept "Discharge from eye" "finding") (qualifier (snomed_concept "Right and left" "qualifier value")))
        (clinical_finding (snomed_concept "Watery eye" "finding") (qualifier (snomed_concept "Right and left" "qualifier value")))
        (clinical_finding (snomed_concept "Eczema" "disorder"))
        (clinical_finding (snomed_concept "Allergic rhinitis caused by pollen" "disorder"))
        (clinical_finding (snomed_concept "Asthma" "disorder")))
  )
)



(system_diagnosis_rule
  "Diagnose probable viral conjunctivitis"
  (diagnosis
    (snomed_concept "Viral conjunctivitis" "disorder")
    probable
  )
  adult
  (and
    (no (clinical_finding (snomed_concept "Itching of eye" "finding")))
    (clinical_finding (snomed_concept "Serous conjunctival discharge" "finding"))
    (or (active_condition (snomed_concept "Fever" "finding"))
        (clinical_finding (snomed_concept "Sore throat" "finding"))
        (clinical_finding (snomed_concept "Localized enlarged lymph nodes" "disorder")))
  )
)


(system_diagnosis_rule
  "Diagnose probable bacterial conjunctivitis"
  (diagnosis
    (snomed_concept "Bacterial conjunctivitis" "disorder")
    probable
  )
  adult
  (and
    (no (clinical_finding (snomed_concept "Itching of eye" "finding")))
    (clinical_finding (snomed_concept "Purulent conjunctival discharge" "finding"))
  )
)


(system_diagnosis_rule
  "Diagnose probable stye"
  (diagnosis
    (snomed_concept "Hordeolum" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Lump in eyelid" "finding"))
    (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Eyelid structure" "body structure")))
  )
)


(system_priority_evaluation
  "Urgent: eye/vision symptoms with danger signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
    (or
      (active_condition (snomed_concept "Cerebrovascular accident" "disorder"))
      (and (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
               (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110))
           (no (clinical_finding (snomed_concept "Pregnancy" "finding"))))
      (and (clinical_finding (snomed_concept "Pain in eye" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
           (or (clinical_finding (snomed_concept "Red eye" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
               (clinical_finding (snomed_concept "Watery eye" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))))
      (active_condition (snomed_concept "Gonococcal conjunctivitis" "disorder"))
      (clinical_finding (snomed_concept "Herpes zoster ophthalmicus" "disorder"))
      (clinical_finding (snomed_concept "Herpes zoster" "disorder") (finding_site (snomed_concept "Nasal structure" "body structure")))
      (active_condition (snomed_concept "Orbital cellulitis" "disorder"))
      (clinical_finding (snomed_concept "Exophthalmos" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Sudden visual loss" "disorder"))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Disorder of eye movements" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Penetrating wound of eye" "disorder"))
      (and (or (clinical_finding (snomed_concept "Pregnancy" "finding"))
               (<= (onset (clinical_finding (snomed_concept "Postpartum state" "finding"))) (time_ago 1 weeks)))
           (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 140)
               (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 90)))
      (clinical_finding (snomed_concept "Laceration of eyelid" "disorder"))
      (clinical_finding (snomed_concept "Penetrating wound of eyeball with foreign body" "disorder"))
      (clinical_finding (snomed_concept "Metal foreign body in eye region" "disorder"))
      (clinical_finding (snomed_concept "Chemical burn" "disorder"))
      (clinical_finding (snomed_concept "Corneal ulcer" "disorder"))
      (clinical_finding (snomed_concept "Corneal haze" "disorder"))
      (clinical_finding (snomed_concept "Ptosis of eyelid" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (active_condition (snomed_concept "Jaundice" "finding"))
      (active_condition (snomed_concept "Acute angle closure" "disorder"))
    )
  )
)

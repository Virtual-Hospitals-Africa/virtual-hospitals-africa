;; Eye/vision symptoms ⇢ 31
(finding_site_findings
  "Eye"
  (finding_site_structure (snomed_concept "Structure of eye proper" "body structure"))
  (clinical_findings
    (clinical_finding (snomed_concept "Red eye" "finding"))
    (clinical_finding (snomed_concept "Pain in eye" "finding"))
    (clinical_finding (snomed_concept "Sudden visual loss" "disorder"))
    (clinical_finding (snomed_concept "Abnormal vision" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Blurring of visual image" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
    (clinical_finding (snomed_concept "Sees haloes around lights" "finding"))
    (clinical_finding (snomed_concept "Dilated pupil" "finding"))
    (clinical_finding (snomed_concept "Discharge from eye" "finding"))
    (clinical_finding (snomed_concept "Itching of eye" "finding"))
    ;; Yellow eyes — jaundice itself is the diagnosis the page reaches for
    (clinical_finding (snomed_concept "Scleral icterus" "finding"))
    ;; New sudden asymmetric weakness or numbness of face, arm or leg
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of face" "finding"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    ;; Whole eyelid swollen, red and painful
    (clinical_finding (snomed_concept "Swelling of eyelid" "finding") (qualifier (snomed_concept "Entire" "qualifier value")) (qualifier (snomed_concept "Red color" "qualifier value")) (qualifier (snomed_concept "Pain" "finding")))
    (clinical_finding (snomed_concept "Swelling of eyelid" "finding"))
    (clinical_finding (snomed_concept "Edema of eyelid" "disorder") (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Ptosis of eyelid" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    ;; Shingles involving eye or nose
    (clinical_finding (snomed_concept "Herpes zoster ophthalmicus" "disorder"))
    (clinical_finding (snomed_concept "Herpes zoster involving tip of nose" "disorder"))
    ;; Penetrating or metallic foreign body, chemical burn, corneal signs
    (clinical_finding (snomed_concept "Penetrating wound of eye" "disorder"))
    (clinical_finding (snomed_concept "Laceration of eyelid" "disorder"))
    (clinical_finding (snomed_concept "Metal foreign body in eye region" "disorder"))
    (clinical_finding (snomed_concept "Penetration of eyeball with magnetic foreign body" "disorder"))
    (clinical_finding (snomed_concept "Chemical burn" "disorder") (finding_site (snomed_concept "Structure of eye proper" "body structure")))
    (clinical_finding (snomed_concept "Burn of cornea" "disorder"))
    (clinical_finding (snomed_concept "Corneal ulcer" "disorder"))
    (clinical_finding (snomed_concept "Corneal haze" "disorder"))
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Nausea and vomiting" "disorder"))
  )
)

;; Face symptoms ⇢ 32
(finding_site_findings
  "Face"
  (finding_site_structure (snomed_concept "Face structure" "body structure"))
  (excluding_structures
    (snomed_concept "Structure of eye proper" "body structure")
    (snomed_concept "Ear structure" "body structure")
    (snomed_concept "Nasal structure" "body structure")
    (snomed_concept "Structure of mouth and/or pharynx" "body structure")
    (snomed_concept "Tooth, gum, and/or supporting structure" "body structure")
  )
  (clinical_findings
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of face" "finding"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
    ;; Sudden face/tongue swelling; painful red facial swelling; new swelling of face
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Red color" "qualifier value")) (qualifier (snomed_concept "Pain" "finding")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Proteinuria" "finding"))
    ;; Whole eyelid swollen, red and painful
    (clinical_finding (snomed_concept "Swelling of eyelid" "finding") (qualifier (snomed_concept "Entire" "qualifier value")) (qualifier (snomed_concept "Red color" "qualifier value")) (qualifier (snomed_concept "Pain" "finding")))
    ;; Face pain columns: one-sided pain, sinus pain, previous shingles
    (clinical_finding (snomed_concept "Pain in face" "finding"))
    (clinical_finding (snomed_concept "Pain in face" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Herpes zoster" "disorder") (qualifier (snomed_concept "Previous" "qualifier value")))
    (clinical_finding (snomed_concept "Nasal discharge" "finding") (qualifier (snomed_concept "Thick" "qualifier value")))
    (clinical_finding (snomed_concept "Posterior rhinorrhea" "disorder") (qualifier (snomed_concept "Thick" "qualifier value")))
    (clinical_finding (snomed_concept "Common cold" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    ;; Unable to wrinkle forehead or close eye, impaired taste, dry eye
    (clinical_finding (snomed_concept "Unable to close eyes" "finding"))
    (clinical_finding (snomed_concept "Taste sense altered" "finding"))
    (clinical_finding (snomed_concept "Dry eyes" "finding"))
    ;; Painless swelling of lips/eyes
    (clinical_finding (snomed_concept "Lip swelling" "finding"))
    ;; Painful swelling of one/both sides of face with fever, headache, body pain
    (clinical_finding (snomed_concept "Fever" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
  )
)

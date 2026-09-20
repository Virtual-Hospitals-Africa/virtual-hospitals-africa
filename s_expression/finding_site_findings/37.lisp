;; Chest pain ⇢ 37
(finding_site_findings
  "Chest"
  (finding_site_structure (snomed_concept "Thoracic structure" "body structure"))
  (excluding_structures
    (snomed_concept "Breast structure" "body structure")
  )
  (clinical_findings
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Chest discomfort" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    ;; Pain radiates to neck, jaw, shoulder/s or arm/s
    (clinical_finding (snomed_concept "Radiating chest pain" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to neck" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to jaw" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to left arm" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to right arm" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to left shoulder" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to right shoulder" "finding"))
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Pale complexion" "finding"))
    (clinical_finding (snomed_concept "Excessive sweating" "finding"))
    ;; Is chest pain worse on lying down, palpation or breathing deeply?
    (clinical_finding (snomed_concept "Chest pain on breathing" "finding"))
    (clinical_finding (snomed_concept "Tenderness of chest wall" "finding"))
    ;; Sudden breathlessness, more resonant/decreased breath sounds, deviated trachea
    (clinical_finding (snomed_concept "Decreased breath sounds" "finding"))
    (clinical_finding (snomed_concept "Trachea displaced" "disorder"))
    (clinical_finding (snomed_concept "Cough" "finding"))
    (clinical_finding (snomed_concept "Fever" "finding"))
    ;; Retrosternal or epigastric pain with eating, hunger or lying down/bending forward
    (clinical_finding (snomed_concept "Heartburn" "finding"))
    (clinical_finding (snomed_concept "Difficulty swallowing" "finding"))
    (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))
    (clinical_finding (snomed_concept "Abdominal mass" "finding"))
    (clinical_finding (snomed_concept "Melena" "disorder"))
    (clinical_finding (snomed_concept "Abnormal weight loss" "finding"))
  )
)

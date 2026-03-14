;; Page 44 - Abdominal Pain: Peritonitis likely with guarding, rigidity or rebound tenderness
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Peritonitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (or
      (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
      (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
      (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
    )
  )
)
;; Page 44 - Abdominal Pain: Acute cholecystitis likely with RUQ tenderness and nausea/fever/anorexia
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Acute cholecystitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Tenderness of right upper quadrant of abdomen" "finding"))
    (or
      (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (clinical_finding (snomed_concept "Fever" "finding"))
      (clinical_finding (snomed_concept "Loss of appetite" "finding"))
    )
  )
)
;; Page 44 - Abdominal Pain: Acute pancreatitis likely with upper abdominal pain spreading to back
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Acute pancreatitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to lumbar region of back" "finding"))
    (or
      (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    )
  )
)
;; Page 44 - Abdominal Pain: Abdominal aortic aneurysm likely with pulsatile abdominal mass
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Abdominal aortic aneurysm" "disorder")
    possible
  )
  adult
  (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))
)

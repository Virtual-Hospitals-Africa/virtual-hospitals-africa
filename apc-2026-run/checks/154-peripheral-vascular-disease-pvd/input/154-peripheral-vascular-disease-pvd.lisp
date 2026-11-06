(task
  "Check for urgent peripheral vascular disease conditions"
  adult
  (clinical_finding (snomed_concept "Peripheral vascular disease" "disorder"))
  (check_for

    (clinical_finding (snomed_concept "Pain in lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "At rest" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding"))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))
    (clinical_finding (snomed_concept "White discoloration of skin" "finding") (finding_site (snomed_concept "Skin structure of lower limb" "body structure")))
    (clinical_finding (snomed_concept "Peripheral pulse absent" "finding") (finding_site (snomed_concept "Lower limb structure" "body structure")))


    (clinical_finding (snomed_concept "Pain in lower limb" "finding") (qualifier (snomed_concept "At rest" "qualifier value")))
    (clinical_finding (snomed_concept "Ulcer of lower extremity" "disorder"))
    (clinical_finding (snomed_concept "Gangrenous disorder" "disorder") (finding_site (snomed_concept "Lower limb structure" "body structure")))


    (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Backache" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable acute limb ischaemia in peripheral vascular disease"
  (diagnosis
    (snomed_concept "Acute lower limb ischemia" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Peripheral vascular disease" "disorder"))
    (clinical_finding (snomed_concept "Pain in lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "At rest" "qualifier value")))
    (or
      (clinical_finding (snomed_concept "Numbness of lower limb" "finding"))
      (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))
      (clinical_finding (snomed_concept "White discoloration of skin" "finding") (finding_site (snomed_concept "Skin structure of lower limb" "body structure")))
      (clinical_finding (snomed_concept "Peripheral pulse absent" "finding") (finding_site (snomed_concept "Lower limb structure" "body structure")))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable critical limb ischaemia in peripheral vascular disease"
  (diagnosis
    (snomed_concept "Critical lower limb ischemia" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Peripheral vascular disease" "disorder"))
    (or
      (clinical_finding (snomed_concept "Pain in lower limb" "finding") (qualifier (snomed_concept "At rest" "qualifier value")))
      (clinical_finding (snomed_concept "Ulcer of lower extremity" "disorder"))
      (clinical_finding (snomed_concept "Gangrenous disorder" "disorder") (finding_site (snomed_concept "Lower limb structure" "body structure")))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable ruptured abdominal aortic aneurysm in peripheral vascular disease"
  (diagnosis
    (snomed_concept "Ruptured abdominal aortic aneurysm" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Peripheral vascular disease" "disorder"))
    (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))
    (or
      (clinical_finding (snomed_concept "Abdominal pain" "finding"))
      (clinical_finding (snomed_concept "Backache" "finding"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
    )
  )
)
(system_diagnosis_rule
  "Diagnose possible abdominal aortic aneurysm in peripheral vascular disease"
  (diagnosis
    (snomed_concept "Abdominal aortic aneurysm" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Peripheral vascular disease" "disorder"))
    (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))
  )
)
(system_priority_evaluation
  "Urgent: peripheral vascular disease with acute/critical limb ischaemia or ruptured AAA"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Peripheral vascular disease" "disorder"))
    (or
      (active_condition (snomed_concept "Acute lower limb ischemia" "disorder"))
      (active_condition (snomed_concept "Critical lower limb ischemia" "disorder"))
      (active_condition (snomed_concept "Ruptured abdominal aortic aneurysm" "disorder"))
    )
  )
)

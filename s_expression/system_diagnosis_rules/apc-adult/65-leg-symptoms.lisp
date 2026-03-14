;; Page 65 - Leg Symptoms: Deep venous thrombosis likely with swollen painful calf
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Deep venous thrombosis" "disorder")
    possible
  )
  adult
  (or
    (clinical_finding (snomed_concept "Pain in calf" "finding"))
    (clinical_finding (snomed_concept "Swollen calf" "finding"))
  )
)
;; Page 65 - Leg Symptoms: Acute lower limb ischemia likely with pain, absent pulse and neurological signs
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Acute lower limb ischemia" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Pain in lower limb" "finding"))
    (clinical_finding (snomed_concept "Absent pulse" "finding"))
    (or
      (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
      (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
    )
  )
)

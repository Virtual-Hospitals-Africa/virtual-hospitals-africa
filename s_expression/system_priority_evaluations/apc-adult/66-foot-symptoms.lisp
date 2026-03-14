;; Page 66 - Foot Symptoms: Urgent for ischaemia and fracture signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Foot pain" "finding"))
    (or
      (and
        (clinical_finding (snomed_concept "Absent pulse" "finding"))
        (or
          (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
          (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
        )
      )
      (clinical_finding (snomed_concept "Gangrene of foot" "disorder"))
      (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
    )
  )
)

;; Page 64 - Neck Pain: Urgent for meningitis and neurological signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Neck pain" "finding"))
    (or
      (clinical_finding (snomed_concept "Stiff neck" "finding"))
      (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
      (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
      (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
    )
  )
)

;; Page 31 - Eye: Orbital cellulitis likely with swollen painful eyelid
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Orbital cellulitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Swelling of eyelid" "finding"))
    (clinical_finding (snomed_concept "Pain in eye" "finding"))
  )
)
;; Page 31 - Eye: Acute angle-closure glaucoma with painful eye and haloes/blurred vision
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Angle-closure glaucoma" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Pain in eye" "finding"))
    (or
      (clinical_finding (snomed_concept "Sees haloes around lights" "finding"))
      (clinical_finding (snomed_concept "Blurring of visual image" "finding"))
      (clinical_finding (snomed_concept "Headache" "finding"))
      (clinical_finding (snomed_concept "Nausea and vomiting" "disorder"))
    )
  )
)

;; Page 31 - Eye/Vision: Urgent for standalone urgent eye conditions
(system_priority_evaluation
  adult
  Urgent
  (or
    (clinical_finding (snomed_concept "Orbital cellulitis" "disorder"))
    (clinical_finding (snomed_concept "Sudden visual loss" "disorder"))
    (clinical_finding (snomed_concept "Penetrating wound of eye" "disorder"))
    (clinical_finding (snomed_concept "Laceration of eyelid" "disorder"))
    (clinical_finding (snomed_concept "Chemical burn" "disorder") (finding_site (snomed_concept "Structure of eye proper" "body structure")))
    (clinical_finding (snomed_concept "Corneal ulcer" "disorder"))
    (clinical_finding (snomed_concept "Corneal opacity" "disorder"))
    (clinical_finding (snomed_concept "Herpes zoster keratoconjunctivitis" "disorder"))
    (clinical_finding (snomed_concept "Ptosis of eyelid" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)

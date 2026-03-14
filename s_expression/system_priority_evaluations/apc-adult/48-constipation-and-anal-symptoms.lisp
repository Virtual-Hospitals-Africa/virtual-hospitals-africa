;; Page 48 - Constipation: Urgent for bowel obstruction signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Acute constipation" "finding"))
    (clinical_finding (snomed_concept "Unable to break wind" "finding"))
    (or
      (clinical_finding (snomed_concept "Abdominal pain" "finding"))
      (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
    )
  )
)
;; Page 48 - Anal Symptoms: Urgent for painful lump or unable to pass stool
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Anal pain" "finding"))
    (or
      (clinical_finding (snomed_concept "Perianal lump" "finding"))
      (clinical_finding (snomed_concept "Difficulty in ability to defecate" "finding"))
    )
  )
)

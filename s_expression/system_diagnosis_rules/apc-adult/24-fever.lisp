;; Page 24 - Fever: meningitis likely with neck stiffness, or drowsy/confused with purpuric rash
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Meningitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Fever" "finding"))
    (or
      (clinical_finding (snomed_concept "Stiff neck" "finding"))
			(clinical_finding (snomed_concept “Nausea” (finding))
			(clinical_finding (snomed_concept “Vomiting” (disorder))
			(clinical_finding (snomed_concept “Neck pain” (finding))
			(clinical_finding (snomed_concept "Drowsy" "finding")
			(clinical_finding (snomed_concept "Clouded consciousness” (finding))
      (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
			(clinical_finding (snomed_concept “Fever” (finding))
			(clinical_finding (snomed_concept “Headache” (finding))
			(>= measurement(clinical_finding (snomed_concept “Body temperature” (observable entity) “Degrees Celsius” (qualifier value)38))
      )
    )
  )
)
;; Page 24 - Fever: appendicitis likely with right lower abdominal tenderness
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Acute appendicitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Fever" "finding"))
    (clinical_finding (snomed_concept "Tenderness of right lower quadrant of abdomen" "finding"))
  )
)

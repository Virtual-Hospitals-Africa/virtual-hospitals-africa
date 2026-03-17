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
      (and
        (or
          (clinical_finding (snomed_concept "Drowsy" "finding"))
          (clinical_finding (snomed_concept "Confusional state" "disorder"))
        )
        (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
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
;; Page 24 - Fever: South African tick-bite fever
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "South African tick-bite fever" "disorder")
    probable
 (disorder)
		(clinical_finding (snomed_concept “Bite of tick” (event))
		(clinical_finding (snomed_concept “Scab” (morphologic abnormality) “Small” (qualifier value) “Black color” (qualifier value))
		(clinical_finding (snomed_concept “Scab” (morphologic abnormality) “Small” (qualifier value) “Brown color” (qualifier value) “Dark” (qualifier value))
		(clinical_finding (snomed_concept “Fever” (finding))
		(clinical_finding (snomed_concept “Headache” (finding))
		(clinical_finding (snomed_concept “Generalized aches and pains” (finding))
		(clinical_finding (snomed_concept “Eruption” (morphologic abnormality))
		(clinical_finding (snomed_concept “Localized enlarged lymph nodes” (disorder))


(system_priority_evaluation
  "Urgent: severe burn with danger signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (or
      (clinical_finding (snomed_concept "Drowsy" "finding"))
			OR
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
			)
      (clinical_finding (snomed_concept "Electrical burn" "disorder"))
			OR
      (clinical_finding (snomed_concept "Chemical burn" "disorder"))
			)
      (clinical_finding (snomed_concept "Full thickness burn" "disorder"))
				(clinical_finding (snomed_concept “White discoloration of skin” (finding))
				OR
				(clinical_finding (snomed_concept “Gray skin” (finding))
				AND
				(clinical_finding (snomed_concept “Painless” (qualifier value)) 
				AND
				(clinical_finding (snomed_concept “Xeroderma” (disorder))
				AND
				(clinical_finding (snomed_concept “Burn injury with charring” (morphologic abnormality))
			)
      (clinical_finding (snomed_concept "Partial thickness burn" "disorder") (qualifier (snomed_concept "Extensive" "qualifier value")))
				(clinical_finding (snomed_concept “Pink skin” (finding))
				AND
				(clinical_finding (snomed_concept “Redness of skin over lesion” (finding))
				AND
				(clinical_finding (snomed_concept “Pain” (finding))
				AND
				(clinical_finding (snomed_concept “Skin-ache syndrome” (finding))
				AND
				(clinical_finding (snomed_concept “Blister” (morphologic abnormality))
				AND
				(clinical_finding (snomed_concept “Moist skin”(finding))
			)
      (clinical_finding (snomed_concept "Smoke inhalation injury" "disorder"))
				(clinical_finding (snomed_concept “Burn of neck” (disorder))
				OR
				(clinical_finding (snomed_concept “Burn of face” (disorder))
				AND
				(clinical_finding (snomed_concept “Difficulty breathing” (finding))
				AND
				(clinical_finding (snomed_concept “Hoarse” (finding))
				AND
				(clinical_finding (snomed_concept “Stridor” (finding))
				AND
				(clinical_finding (snomed_concept “Finding of color of sputum” (finding) “Black color” (qualifier value))
				OR
				(clinical_finding (snomed_concept “Brown sputum” (finding))		
				OR
				(clinical_finding (snomed_concept “Gray sputum” (finding))
			)
      (clinical_finding (snomed_concept “Burn of trunk” (disorder) “Circumferential” (qualifier value))
			OR
			(clinical_finding (snomed_concept “Burn of chest wall” (disorder) “Circumferential” (qualifier value))
			OR
      (clinical_finding (snomed_concept “Burn of lower limb” (disorder) “Circumferential” (qualifier value))
			OR
			(clinical_finding (snomed_concept “Burn of upper limb (disorder) “Circumferential” (qualifier value))
			)
      (clinical_finding (snomed_concept “Burn of face” (disorder))
			AND
      (clinical_finding (snomed_concept “Burn of hand” (disorder))
			AND
      (clinical_finding (snomed_concept “Burn of foot” (disorder))
			AND
      (clinical_finding (snomed_concept “Burn of genitalia” (disorder))
			AND
      (clinical_finding (snomed_concept “Burn” (disorder) “Joint structure of limb” (body structure))
			)
      (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") “Percent” (property) (qualifier value) 94)
			)
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
			)
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") "Millimeter of mercury" (qualifier value) 90)
			AND
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") "Millimeter of mercury" (qualifier value)) 60)
			)
			(clinical_finding (snomed_concept "Traumatic injury" "disorder"))
    )
  )
)

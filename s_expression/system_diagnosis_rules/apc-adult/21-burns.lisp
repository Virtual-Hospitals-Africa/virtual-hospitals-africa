;;Page 21 - Burns
(system_diagnosis_rule
	"Full thickness burn likely 
	(probable
	(clinical_finding (snomed_concept "Full thickness burn" "disorder")
	(adult 
		(clinical_finding (snomed_concept “White discoloration of skin” (finding))
		(clinical_finding (snomed_concept “Gray skin” (finding))
		(clinical_finding (snomed_concept “Painless” (qualifier value) )
		(clinical_finding (snomed_concept “Xeroderma” (disorder))
		(clinical_finding (snomed_concept “Burn injury with charring” (morphologic abnormality))
		)
	)
)
;;Page 21 - Burns
(system_diagnosis_rule
	"Partial thickness burn likely 
	(probable
	(clinical_finding (snomed_concept "Partial thickness burn" (disorder)
	(adult 
		(clinical_finding (snomed_concept “Pink skin” (finding))
		(clinical_finding (snomed_concept “Redness of skin over lesion” (finding))
		(clinical_finding (snomed_concept “Pain”(finding))
		(clinical_finding (snomed_concept “Skin-ache syndrome” (finding)) 
		(clinical_finding (snomed_concept “Blister” (morphologic abnormality))
		(clinical_finding (snomed_concept “Moist skin”(finding))
		)
	)
)
;;Page 21 - Burns
(system_diagnosis_rule
	">10 % BDSA burn likely 
	(probable
	(> clinical_finding (snomed_concept "Burns classified according to percentage of body surface involved (disorder) 10))
	(adult 
		(clinical_finding (snomed_concept "Burn of face” (disorder)
		AND
		(clinical_finding (snomed_concept "Burn of neck” (disorder) “Anterior” (qualifier value) “Percent” (property) (qualifier value) 4.5))
		(clinical_finding (snomed_concept "Burn of head AND/OR neck” (disorder) “Posterior” (qualifier value) “Percent” (property) (qualifier value) 4.5))
		(clinical_finding (snomed_concept "Burn of left upper limb” (disorder) “Anterior” (qualifier value) “Percent” (property) (qualifier value) 4.5))
		(clinical_finding (snomed_concept "Burn of left upper limb” (disorder) “Posterior” (qualifier value) “Percent” (property) (qualifier value) 4.5))
		(clinical_finding (snomed_concept "Burn of right upper limb” (disorder) “Anterior” (qualifier value) “Percent” (property) (qualifier value) 4.5))
		(clinical_finding (snomed_concept "Burn of right upper limb” (disorder) “Posterior” (qualifier value) “Percent” (property) (qualifier value) 4.5))
		(clinical_finding (snomed_concept "Burn of trunk” (disorder) “Percent” (property) (qualifier value) 9))
		(clinical_finding (snomed_concept "Burn of back” (disorder) “Percent” (property) (qualifier value) 9))
		(clinical_finding (snomed_concept "Burn of inguinal region” (disorder) “Percent” (property) (qualifier value) 1))
		(clinical_finding (snomed_concept "Burn of left lower limb” (disorder) “Anterior” (qualifier value) “Percent” (property) (qualifier value) 9))
		(clinical_finding (snomed_concept "Burn of left lower limb” (disorder) “Posterior” (qualifier value) “Percent” (property) (qualifier value) 9))
		(clinical_finding (snomed_concept "Burn of right lower limb” (disorder) “Anterior” (qualifier value) “Percent” (property) (qualifier value) 9))
		(clinical_finding (snomed_concept "Burn of right lower limb” (disorder) “Posterior” (qualifier value) “Percent” (property) (qualifier value) 9))
		)
	)
)
;;Page 21 - Burns
(system_diagnosis_rule
	"Inhalation injury likely 
	(probable
	(clinical_finding (snomed_concept “Injury to respiratory system due to inhaled substance” (disorder))
	(adult 
		(clinical_finding (snomed_concept "Burn of face” (disorder))
		(clinical_finding (snomed_concept "Burn of neck” (disorder))
		(clinical_finding (snomed_concept "Difficulty breathing” (finding))
		(clinical_finding (snomed_concept "Hoarse” (finding))
		(clinical_finding (snomed_concept "Stridor” (finding))
		(clinical_finding (snomed_concept "Finding of color of sputum” (finding) “Black color” (qualifier value))
		(clinical_finding (snomed_concept "Brown sputum” (finding))
		(clinical_finding (snomed_concept "Gray sputum” (finding))
		)
	)
)
 ;;Page 21 - Burns
(system_diagnosis_rule
	"Abuse likely
	(probable
	(clinical_finding (snomed_concept "Adult abuse” (event))
	(adult 
		(clinical_finding (snomed_concept "Cigarette burn” (disorder))
		(clinical_finding (snomed_concept "Burn caused by hot object” (disorder))
			(snomed_concept “Clothes iron, device” (physical object))
			(snomed_concept "Heater, device” (physical object))
			(snomed_concept "Stove, device” (physical object))
			(snomed_concept "Fork” (physical object))
			(snomed_concept "Knife, utensil” (physical object))
			(snomed_concept "Spoon” (physical object))
			(snomed_concept "Lighter, device” (physical object))
			(snomed_concept "Cigarette lighter, device” (physical object))
		(clinical_finding (snomed_concept "Burning due to contact with hot light bulb” (event))
		(clinical_finding (snomed_concept "Burning due to contact with hot substance” (event) “Intentional event” (event))
		(clinical_finding (snomed_concept "Burn” (disorder) “Repeat” (qualifier value))
		(clinical_finding (snomed_concept "Traumatic injury” (disorder) “Repeat” (qualifier value))
		(clinical_finding (snomed_concept "Burn” (disorder) “Strange and inexplicable behavior” (finding))
		(clinical_finding (snomed_concept "Traumatic injury” (disorder) “Strange and inexplicable behavior” (finding))
		)
	)
)
;;Page 21 - Burns
(system_diagnosis_rule
	"Burn non urgent likely
	(referral
	(clinical_finding (snomed_concept "Burn” (disorder) “Non-urgent” (qualifier value))
	(clinical_finding (snomed_concept "Patient referral” (procedure))
	(adult 
		(clinical_finding (snomed_concept "Local infection of wound” (disorder) “Severe” (severity modifier) (qualifier value))
			(clinical_finding (snomed_concept "Redness of skin over lesion” (finding))
			(clinical_finding (snomed_concept "Swelling of periwound skin” (finding))
			(clinical_finding (snomed_concept "Offensive wound odor” (finding))
			(clinical_finding (snomed_concept "Pus” (substance))
		(>= measurement clinical_finding (snomed_concept "Body temperature” (observable entity) “Degrees Celsius” (qualifier value) 38))
		(clinical_finding (snomed_concept "Wound pain” (finding) “After” (attribute) “Treatment given” (situation))
		(clinical_finding (snomed_concept "Burn” (disorder) “Non-healed” (qualifier value) “In” (attribute) “week” (qualifier value) 2))
		)
	)
)
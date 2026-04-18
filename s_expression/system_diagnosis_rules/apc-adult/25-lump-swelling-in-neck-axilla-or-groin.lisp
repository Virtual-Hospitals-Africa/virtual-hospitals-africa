;; Page 25 - Strangulated inguinal hernia likely with groin mass + bowel obstruction signs
(system_diagnosis_rule
  "Inarcerated/strangulated inguinal hernia likely"
  (diagnosis
	(clinical_finding (snomed_concept “Irreducible inguinal hernia” (disorder))   
	(clinical_finding (snomed_concept "Strangulated inguinal hernia" "disorder")
    probable
  adult
  (and
    (clinical_finding (snomed_concept "Groin mass" "finding"))
    (or
      (clinical_finding (snomed_concept “Groin mass” (finding) “Increased size” (finding) “Standing up” (observable entity))
			(clinical_finding (snomed_concept “Groin mass (finding) Increased size (finding) Coughing (observable entity))
			(clinical_finding (snomed_concept “Groin mass (finding) Increased size (finding) Defecation (observable entity))
			AND
			(clinical_finding (snomed_concept "Severe pain" "finding"))
      (clinical_finding (snomed_concept “Vomiting” (disorder))
			(clinical_finding (snomed_concept "Constipation” (finding) “hour” (qualifier value) 24))
      (clinical_finding (snomed_concept "Unable to break wind" "finding"))
“hour” (qualifier value) 24))
			(clinical_finding (snomed_concept “Irreducible inguinal hernia” (disorder))
    )
  )
)
;; Page 25 - Aneurysm likely
(system_diagnosis_rule
  "Diagnose possible aneurysm"
  (diagnosis
    (snomed_concept "Aneurysm" "disorder")
    probable 
  adult
		  (clinical_finding (snomed_concept "Groin mass" "finding") (qualifier (snomed_concept "Pulsatile" "qualifier value"))
			(clinical_finding (snomed_concept “Mass of neck” (finding) “Pulsatile” (qualifier value))
			(clinical_finding (snomed_concept “Mass of neck” (finding) “Pulsatile” (qualifier value))
		)
	)
)
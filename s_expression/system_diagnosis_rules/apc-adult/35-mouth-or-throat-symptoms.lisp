Page 35 – Mouth or Throat Symptoms
(system_diagnosis_rule
	"Anaphylaxis likely"
	(adult
	(snomed_concept “Anaphylaxis” (disorder))
	)
	probable
	(and
		(clinical_finding (snomed_concept "Facial swelling (finding) Sudden (qualifier value)
    (clinical_finding (snomed_concept "Tongue swelling (finding) Sudden (qualifier value))
    (clinical_finding (snomed_concept “Wheezing” (finding))
		(clinical_finding (snomed_concept "Abdominal pain” (finding))
		(clinical_finding (snomed_concept "Vomiting” (disorder))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
		(clinical_finding (snomed_concept “Collapse” (finding))
    (< measurement (snomed_concept " Systolic blood pressure” (observable entity) mmHg) 90)) 
		(<measurement (snomed_concept "Diastolic blood pressure” (observable entity) mmHg) 60))
		(clinical_finding (snomed_concept “Bite of insect” (event) “Exposure to” (contextual qualifier) (qualifier value))
		(clinical_finding (snomed_concept “ Food” (substance) “Exposure to” (contextual qualifier) (qualifier value))
		(clinical_finding (snomed_concept “Drug or medicament” (substance) “Exposure to” (contextual qualifier) (qualifier value) (substance))
		)
	)
)
Page 35 – Mouth or Throat Symptoms
(system_diagnosis_rule
	"Oral or oesophageal candida likely"
	(adult
	(snomed_concept “Candidiasis of mouth” (disorder))
	(snomed_concept “Candidiasis of esophagus” (disorder))
	)
	probable
	(and
		(clinical_finding (snomed_concept “Painful mouth” (finding))
		(clinical_finding (snomed_concept “Difficulty swallowing” (finding))
		(clinical_finding (snomed_concept “White patches on oral mucosa” (finding))
			(snomed_concept “Cheek structure” (body structure))
			(snomed_concept “Gingival structure” (body structure))
			(snomed_concept “Tongue structure” (body structure))
			(snomed_concept “Palatal structure” (body structure))
		)
	)
)
Page 35 – Mouth or Throat Symptoms
(system_diagnosis_rule
	"Oesophageal candida likely"
	(adult
	(snomed_concept “Candidiasis of esophagus” (disorder))
	)
	probable
	(and
		(clinical_finding (snomed_concept “Difficulty swallowing” (finding))
		(clinical_finding (snomed_concept “Swallowing painful” (finding))
		)
	)
)
Page 35 – Mouth or Throat Symptoms
(system_diagnosis_rule
	"Impetigo likely"
	(adult
	(snomed_concept “Impetigo” (disorder))
	)
	probable
	(and 
		(clinical_finding (snomed_concept “Crust on skin” (finding) “Mouth region structure” (body structure))
		(clinical_finding (snomed_concept “Blister of mouth with infection” (disorder))
		)
	)
)
Page 35 – Mouth or Throat Symptoms
(system_diagnosis_rule
	"Herpes simplex likely"
	(adult
	(snomed_concept “Herpes simplex’ (disorder))
	)
	probable
	(and 
		(clinical_finding (snomed_concept “Pain” (finding) “Blister of mouth with infection” (disorder))
		(clinical_finding (snomed_concept “Pain” (finding) “Blister of lip with infection” (disorder))
		)
	)
)
Page 35 – Mouth or Throat Symptoms
(system_diagnosis_rule
	"Contact dermatitis likely"
	(adult
	(snomed_concept “Contact dermatitis” (disorder))
	)
	probable
	(and 
		(clinical_finding (snomed_concept “Pruritus of oral soft tissues” (finding) “Very” (qualifier value))
		)
	)
)
Page 35 – Mouth or Throat Symptoms
(system_diagnosis_rule
	"Aphthous ulcer likely"
	(adult
	(snomed_concept “Aphthous ulceration of skin and/or mucous membrane” (disorder))
	)
	probable
	(and
		(clinical_finding (snomed_concept “Pain” (finding) “Ulcer of mouth” (disorder))
		(clinical_finding (snomed_concept “Mucous patch of oral mucosa” (disorder) “Central” (qualifier value) “White color” (qualifier value))
		)
	)
Page 35 – Mouth or Throat Symptoms
(system_diagnosis_rule
	"Aphthous ulcer likely"
	(adult
	(referral
	(snomed_concept “Aphthous ulceration of skin and/or mucous membrane” (disorder))
	(snomed_concept “Patient referral” (procedure))
	)
	probable
	(and
		(> (snomed_concept “Ulcer observable” (observable entity) cm) 1))
		(clinical_finding (snomed_concept “Non-healed” (qualifier value) “In” (attribute) day) 10))
		)
	)
)
Page 35 – Mouth or Throat Symptoms
(system_diagnosis_rule
	"Angular cheilitis/stomatitis likely"
	(adult
	(snomed_concept “Angular cheilitis” (disorder))
	(snomed_concept “Stomatitis” (disorder))
	)
	probable
	(and
		(clinical_finding (snomed_concept “Cracked lips” (finding) “Structure of angle of mouth” (body structure))
		(clinical_finding (snomed_concept “Redness of skin over lesion” (finding) “Structure of angle of mouth” (body structure))
		)
	)
)
Page 35 – Mouth or Throat Symptoms
(system_diagnosis_rule
	"Dry mouth likely "
	(adult
	(snomed_concept “Xerostomia” (finding))
	)
	probable
	(and
		(clinical_finding (snomed_concept “Increased thirst” (finding))
		(clinical_finding (snomed_concept “Increased frequency of urination” (finding))
		(clinical_finding (snomed_concept “Weight decreased” (finding))
		(clinical_finding (snomed_concept “Nasal congestion” (finding))
		(clinical_finding (snomed_concept “Nasal discharge” (finding))
		(clinical_finding (snomed_concept “Terminal illness” (finding))
		)
	)
Page 35 – Mouth or Throat Symptoms
(system_diagnosis_rule
	"Dry mouth likely "
	(adult
	(consult
	(snomed_concept “Xerostomia” (finding))
	(snomed_concept “Consultation” (procedure))
	)
	probable
	(and
		(snomed_concept “Review of medication” (procedure))
		(snomed_concept “Furosemide” (substance))
		(snomed_concept “Amitriptyline” (substance))
		(snomed_concept “Chlorphenamine” (substance))
		(snomed_concept “Anti-psychotic agent” (substance))
		(snomed_concept “Morphine” (substance))
		)
	)
)
Page 35 – Mouth or Throat Symptoms
(system_diagnosis_rule
	"Swallowing difficulty likely"
	(adult
	(snomed_concept “Difficulty swallowing” (finding))
	)
	probable
	(and
		(clinical_finding (snomed_concept “Xerostomia” (finding))
		(clinical_finding (snomed_concept “Swallowing finding” (finding))
		)
	)
)
Page 35 – Mouth or Throat Symptoms
(system_diagnosis_rule
	"Viral pharyngitis likely"
	(adult
	(snomed_concept “Viral pharyngitis” (disorder))
	)
	probable
	(and
		(clinical_finding (snomed_concept “Redness of throat” (finding))
		(clinical_finding (snomed_concept “Sore throat” (finding))
		(clinical_finding (snomed_concept “Normal sized tonsils” (finding))
		)
	)
)
Page 35 – Mouth or Throat Symptoms
(system_diagnosis_rule
	"Bacterial pharyngitis/ tonsillitis likely"
	(adult
	(snomed_concept “Acute bacterial pharyngitis” (disorder)
	(snomed_concept “Tonsillitis” (disorder))
	)
	probable
	(and 
		(clinical_finding (snomed_concept “Redness of throat” (finding))
		(clinical_finding (snomed_concept “Sore throat” (finding))
		(clinical_finding (snomed_concept “Enlarged tonsil” (finding))
		(clinical_finding (snomed_concept “White patches on oral mucosa” (finding) “Palatine tonsillar structure” (body structure))
		(clinical_finding (snomed_concept “Pus” (substance) “Palatine tonsillar structure” (body structure))
		(clinical_finding (snomed_concept “No cough” (situation))
		(clinical_finding (snomed_concept “Nasal discharge” (finding) “Absent” (qualifier value))
		)
	)
)
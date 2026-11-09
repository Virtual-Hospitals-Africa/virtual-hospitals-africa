;;Page 23 – Weight loss
(system_diagnosis_rule
	"Unintentional weight loss likely"
	(adult
	(clinical_finding (snomed_concept “Unintentional weight loss” (finding))
	)
	probable 
	(and
		(> (snomed_concept “Body weight” (observable entity) “Percent” (property) (qualifier value) 5))
		(clinical_finding (snomed_concept “Tuberculosis” (disorder))
		(clinical_finding (snomed_concept “Diabetes mellitus” (disorder))
		(clinical_finding (snomed_concept “Human immunodeficiency virus infection” (disorder))
		(clinical_finding (snomed_concept “Nausea” (finding))
		(clinical_finding (snomed_concept “Vomiting” (disorder))
		(clinical_finding (snomed_concept “Loss of appetite” (finding))
		(clinical_finding (snomed_concept “Stress” (finding))
		(clinical_finding (snomed_concept “Anxiety” (finding))
		(clinical_finding (snomed_concept “Food insecurity” (finding))
		(clinical_finding (snomed_concept “Limited access to nutrition supplies” (finding))
		(clinical_finding (snomed_concept “Terminal illness” (finding))
		(clinical_finding (snomed_concept “Abdominal pain” (finding))
		(clinical_finding (snomed_concept “Diarrhea” (finding))
		(clinical_finding (snomed_concept “Constipation” (finding))
		)
	)
)
;;Page 23 – Weight loss
(system_diagnosis_rule
	"Unintentional weight loss likely"
	(adult
	(consultation 
	(clinical_finding (snomed_concept “Unintentional weight loss” (finding))
	(clinical_finding (snomed_concept “Consultation” (procedure))
	)
	(and
		(clinical_finding (snomed_concept “Review of medication” (procedure))
			(snomed_concept “Anticonvulsant” (substance))
			(snomed_concept “Antidepressant” (substance))
			(snomed_concept “Substance with glucagon-like peptide 1 receptor agonist mechanism of action” (substance))
			(snomed_concept “Metformin” (substance))
			(snomed_concept “Substance with sodium glucose cotransporter subtype 2 inhibitor mechanism of action” (substance))
			(snomed_concept “Levothyroxine” (substance))
		)
	)
)
;;Page 23 – Weight loss
(system_diagnosis_rule
	"Unintentional weight loss likely"
	(adult
	(referral 
	(clinical_finding (snomed_concept “Unintentional weight loss” (finding))
	(clinical_finding (snomed_concept “Patient referral” (procedure) “Referral to social worker” (procedure))
	)
	(and
		(clinical_finding (snomed_concept “Elderly victim of maltreatment” (finding))
		(clinical_finding (snomed_concept “Functionally dependent” (finding))
		(clinical_finding (snomed_concept “Complex care needs” (finding))
		(clinical_finding (snomed_concept “Food support service” (qualifier value))
		)
	)
)
;;Page 23 – Weight loss
(system_diagnosis_rule
	"Thyroid disease likely"
	(adult
	(clinical_finding (snomed_concept “Disorder of thyroid gland” (disorder))
	)
	probable 
	(and
		(>=measurement (snomed_concept “Heart rate” (observable entity) bpm)100))
		(clinical_finding (snomed_concept “Palpitations” (finding))
		(clinical_finding (snomed_concept “Tremor” (finding))
		(clinical_finding (snomed_concept “Intolerant of heat” (finding))
		(clinical_finding (snomed_concept “Goiter” (disorder))
	(or
		(clinical_finding (snomed_concept “Muscle fatigue” (finding))
		(clinical_finding (snomed_concept “Muscle weakness” (finding))
		(clinical_finding (snomed_concept “Weight increased” (finding))
		(clinical_finding (snomed_concept “Depressed mood” (finding))
		(clinical_finding (snomed_concept “Xeroderma” (disorder))
		(clinical_finding (snomed_concept “Constipation” (finding))
		(clinical_finding (snomed_concept “Intolerant of cold” (finding))
		)
	)
)
;;Page 23 – Weight loss
(system_diagnosis_rule
	"Thyroid disease likely"
	(adult
	(referral 
	(clinical_finding (snomed_concept “Disorder of thyroid gland” (disorder))
	(clinical_finding (snomed_concept “Patient referral” (procedure))
	(clinical_finding (snomed_concept “Referral to doctor” (procedure))
	)
	(and
		(clinical_finding (snomed_concept “Muscle weakness” (finding))
		)
	)
;;Page 23 – Weight loss
(system_diagnosis_rule
	"Cervical cancer likely"
	(adult
	(clinical_finding (snomed_concept “Malignant neoplasm of cervix uteri” (disorder))
	)
	probable 
	(and 
		(clinical_finding (snomed_concept “Unintentional weight loss” (finding))
		(clinical_finding (snomed_concept “Vaginal discharge” (finding))
		(clinical_finding (snomed_concept “Abnormal vaginal bleeding” (finding))
		)
	)
;;Page 23 – Weight loss
(system_diagnosis_rule
	"Breast cancer likely"
	(adult
	(clinical_finding (snomed_concept “Malignant neoplasm of breast” (disorder))
	)
	probable 
	(and
		(clinical_finding (snomed_concept “Unintentional weight loss” (finding))
		(clinical_finding (snomed_concept “Breast lump” (finding))
		(clinical_finding (snomed_concept “Discharge from nipple” (disorder))
		)
	)
;;Page 23 – Weight loss
(system_diagnosis_rule
	"Prostate cancer likely "
	(adult
	(clinical_finding (snomed_concept “Malignant neoplasm of prostate” (disorder))
	)
	probable 
	(and
		(clinical_finding (snomed_concept “Unintentional weight loss” (finding))
		(clinical_finding (snomed_concept “Micturition finding” (finding) “Man” (person))
		)
	)
;;Page 23 – Weight loss
(system_diagnosis_rule
	"Prostate cancer likely "
	(adult
	(referral 
	(clinical_finding (snomed_concept “Malignant neoplasm of prostate” (disorder))
	(clinical_finding (snomed_concept “Patient referral” (procedure) “week” (qualifier value) 1))
	)
	(and
		(clinical_finding (snomed_concept “Hard prostate” (finding))
		(clinical_finding (snomed_concept “Nodular prostate without urinary obstruction” (disorder))
		)
	)
)
;;Page 23 – Weight loss
(system_diagnosis_rule
	"Bowel cancer likely"
	(adult
	(clinical_finding (snomed_concept “Malignant neoplasm of bowel” (disorder))
	)
	probable 
	(and
		(clinical_finding (snomed_concept “Unintentional weight loss” (finding))
		(clinical_finding (snomed_concept “Altered bowel function” (finding))
		)
	)
;;Page 23 – Weight loss
(system_diagnosis_rule
	"Bowel cancer likely"
	(adult
	(referral 
	(clinical_finding (snomed_concept “Malignant neoplasm of bowel” (disorder))
	(clinical_finding (snomed_concept “Patient referral” (procedure) “In” (attribute) “week” (qualifier value) 1))
	)
	(and	
		(clinical_finding (snomed_concept “Abdominal mass” (finding))
		(clinical_finding (snomed_concept “Rectal mass” (finding))
		(clinical_finding (snomed_concept “Occult blood detected in feces” (finding))
		)
	)
)
;;Page 23 – Weight loss
(system_diagnosis_rule
	"Lung cancer likely"
	(adult
	(clinical_finding (snomed_concept “Malignant neoplasm of lung” (disorder))
	)
	probable 
	(and
		(clinical_finding (snomed_concept “Unintentional weight loss” (finding))
		(>(clinical_finding (snomed_concept “ Cough” (finding) “week” (qualifier value) 2))
		(clinical_finding (snomed_concept “Bloodstained sputum” (finding))
		(clinical_finding (snomed_concept “Smoker” (finding))
		(clinical_finding (snomed_concept “Ex-smoker” (finding))
		)
	)
;;Page 23 – Weight loss
(system_diagnosis_rule
	"Lung cancer likely"
	(adult
	(referral
	(clinical_finding (snomed_concept “Malignant neoplasm of lung” (disorder))
	(clinical_finding (snomed_concept “Patient referral” (procedure) “In” (attribute) “week” (qualifier value) 1))
	)
	(and
		(clinical_finding (snomed_concept “Suspicion” (finding) “Plain X-ray of chest” (procedure))
		)
	)
)
;;Page 23 – Weight loss
(system_diagnosis_rule
	"Oral/esophageal candida likely"
	(adult
	(clinical_finding (snomed_concept “Candidiasis of mouth” (disorder))
	(clinical_finding (snomed_concept “Candidiasis of esophagus” (disorder))
	)
	probable 
	(and
		(clinical_finding (snomed_concept “Painful mouth” (finding))
		(clinical_finding (snomed_concept “Difficulty swallowing” (finding))
		(clinical_finding (snomed_concept “Unintentional weight loss” (finding))
		)
	)
)
;;Page 23 – Weight loss
(system_diagnosis_rule
	"Depression likely"
	(adult
	(clinical_finding (snomed_concept “Depressive disorder” (disorder)
	)
	probable 
	(and
		(clinical_finding (snomed_concept “Depressed mood” (finding) “In the past” (qualifier value) “month” (qualifier value) 1))
		(clinical_finding (snomed_concept “Feeling unhappy” (finding) “In the past” (qualifier value) “month” (qualifier value) 1))
		(clinical_finding (snomed_concept “Feeling hopeless” (finding) “In the past” (qualifier value) “month” (qualifier value) 1))
		(clinical_finding (snomed_concept “Loss of interest” (finding) “In the past” (qualifier value) “month” (qualifier value) 1))
		(clinical_finding (snomed_concept “Loss of capacity for enjoyment” (finding) “In the past” (qualifier value) “month” (qualifier value) 1))
		)
	)
)
;;Page 23 – Weight loss
(system_diagnosis_rule
	"Alcohol/ drug use likely"
	(adult
	(clinical_finding (snomed_concept “Alcohol use disorder” (disorder))
	(clinical_finding (snomed_concept “Substance use disorder” (disorder))
	)
	probable 
	(and
		(clinical_finding (snomed_concept “Drinking binge” (finding) “In the past” (qualifier value) “year” (qualifier value) 1))
		(clinical_finding (snomed_concept “Drinking episode” (finding) “Bottle - unit of product usage” (qualifier value) >= 4) “In the past” (qualifier value) “year” (qualifier value) 1))
		(clinical_finding (snomed_concept “Drinking episode” (finding) “Can - unit of product usage” (qualifier value) >= 4) “In the past” (qualifier value) “year” (qualifier value) 1))
		(clinical_finding (snomed_concept “Drinking episode” (finding) “Glassful - unit of product usage” (qualifier value) >= 4) “In the past” (qualifier value) “year” (qualifier value) 1))
		(clinical_finding (snomed_concept “Misuses drugs” (finding) “In the past” (qualifier value) “year” (qualifier value) 1))
		(clinical_finding (snomed_concept “Misuse of prescription only drugs” (finding) “In the past” (qualifier value) “year” (qualifier value) 1))
		(clinical_finding (snomed_concept “Misuse of medication” (finding) “In the past” (qualifier value) “year” (qualifier value) 1))
		)
	)
)

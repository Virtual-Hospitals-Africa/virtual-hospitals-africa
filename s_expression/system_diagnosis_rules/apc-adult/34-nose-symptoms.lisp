;;Page 34 – Nose symptoms 
(system_diagnosis-rule
	"Allergic rhinitis likely"
	(adult
	(clinical_finding ( snomed_concept “Allergic rhinitis” (disorder))
	)
	probable 
	(and
		(clinical_finding ( snomed_concept “Sneezing” (finding) “Recurrent” (qualifier value) “Most” (qualifier value) “day” (qualifier value) > “For” (qualifier value) “week” (qualifier value) 4))
		(clinical_finding ( snomed_concept “Itching” (finding) “Most” (qualifier value) “day” (qualifier value) > “For” (qualifier value) “week” (qualifier value) 4))
		(clinical_finding ( snomed_concept “Nasal discharge” (finding) “Most” (qualifier value) “day”  (qualifier value) > “For” (qualifier value) “week” (qualifier value) 4))
		(clinical_finding ( snomed_concept “Nasal congestion” (finding) “Most” (qualifier value) “day” (qualifier value) > “For” (qualifier value) “week” (qualifier value) 4))
		(clinical_finding ( snomed_concept “Itching of bilateral eyes” (finding))
		(clinical_finding ( snomed_concept “Itching of ear” (finding) “Both ears” (body structure))
		(clinical_finding ( snomed_concept “Itching” (finding) “Structure of pharynx and/or larynx” (body structure)) “Provoked by” (attribute) “Exposure to” (contextual qualifier) (qualifier value)		 
			( snomed_concept “Pollen” (substance))
			( snomed_concept “Keeps pets” (finding))
			( snomed_concept “House dust mite” (substance))
			( snomed_concept “Cockroach” (organism))
			( snomed_concept “Mold” (organism))
		)
	)
)
;;Page 34 – Nose symptoms 
(system_diagnosis-rule
	"Acute viral infection likely"
	(adult
	(clinical_finding ( snomed_concept “Acute viral disease” (disorder))
	(clinical_finding ( snomed_concept “Common cold” (disorder))
	(clinical_finding ( snomed_concept “Influenza” (disorder))
	(clinical_finding ( snomed_concept “Disease caused by severe acute respiratory syndrome coronavirus 2” (disorder))
	)
	probable 
	(and
		(clinical_finding ( snomed_concept “Sore throat” (finding))
		(clinical_finding ( snomed_concept “Fever” (finding))
		(clinical_finding ( snomed_concept “Nasal congestion” (finding))
		(clinical_finding ( snomed_concept “Nasal discharge” (finding))
		)
	)
)
;;Page 34 – Nose symptoms 
(system_diagnosis-rule
	"Influenza or COVID-19 more likely"
	(adult
	(clinical_finding ( snomed_concept “Influenza” (disorder))
	(clinical_finding ( snomed_concept “Disease caused by severe acute respiratory syndrome coronavirus 2” (disorder))
	)
	probable 
	(and
		(clinical_finding ( snomed_concept “Sore throat” (finding))
		(clinical_finding ( snomed_concept “Fever” (finding))
		(clinical_finding ( snomed_concept “Nasal congestion” (finding))
		(clinical_finding ( snomed_concept “Nasal discharge” (finding))
		(>=measurement ( snomed_concept “Body temperature” (observable entity) °C 38))
		(clinical_finding ( snomed_concept “Fever with chills” (finding))
		(clinical_finding ( snomed_concept “Generalized acute body pains” (finding))
		)
	)
)
;;Page 34 – Nose symptoms 
(system_diagnosis-rule
	"Sinusitis likely"
	(adult
	(clinical_finding ( snomed_concept “Sinusitis” (disorder))
	)
	probable 
	(and
		(clinical_finding ( snomed_concept “Nasal congestion” (finding))
		(clinical_finding ( snomed_concept “Nasal discharge” (finding))
		(clinical_finding ( snomed_concept “Frontal sinus pain” (finding))
		(clinical_finding ( snomed_concept “Maxillary sinus pain” (finding))
		(clinical_finding ( snomed_concept “Headache” (finding) “Worse” (qualifier value) “Forward bending” (observable entity))
		(clinical_finding ( snomed_concept “Common cold” (disorder) “Recent” (qualifier value)
		)
	)
;;Page 34 – Nose symptoms 
(system_diagnosis-rule
	"Sinusitis likely"
	(adult
	(urgent_referral
	(clinical_finding ( snomed_concept “Sinusitis” (disorder))
	(clinical_finding ( snomed_concept “Urgent referral” (procedure) “In” (attribute) “24 hours” (qualifier value))
	)
	probable 
	(and
		(clinical_finding ( snomed_concept “Infection of tooth” (disorder))
		(clinical_finding ( snomed_concept “Swelling over frontal sinus” (finding))
		(clinical_finding ( snomed_concept “Swelling over maxillary sinus” (finding))
		(clinical_finding ( snomed_concept “Swelling around eyes” (finding))
		(clinical_finding ( snomed_concept “Stiff neck” (finding))
		)
	)
)
;;Page 34 – Nose symptoms 
(system_diagnosis-rule
	"Upper airway cough syndrome (postnasal drip) likely"
	(adult
	(clinical_finding ( snomed_concept “Posterior rhinorrhea” (disorder))
	)
	probable 
	(and
		(clinical_finding ( snomed_concept “Nasal discharge” (finding))
		(clinical_finding ( snomed_concept “Persistent cough” (finding))
		(clinical_finding ( snomed_concept “Throat clearing” (observable entity) “Frequent” (qualifier value))
		)
	)
)

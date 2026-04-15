;;Page 33 – Ear symptoms
(system_diagnosis_rule 
	"Otitis externa likely"
	(adult
	(clinical_finding ( snomed_concept “Otitis externa” (disorder))
	)
	probable
	(and
		(clinical_finding ( snomed_concept “Pain of ear” (finding))
		(clinical_finding ( snomed_concept “Itching of ear” (finding))
		(clinical_finding ( snomed_concept “Red pinna” (finding))
		(clinical_finding ( snomed_concept “Swelling of ear” (finding))
		(clinical_finding ( snomed_concept “Purulent drainage from external ear canal” (disorder))
		)
	)
;;Page 33 – Ear symptoms
(system_diagnosis_rule
	"Otitis externa likely"
	(adult
	(referral
	(clinical_finding ( snomed_concept “Otitis externa” (disorder))
	(clinical_finding ( snomed_concept “Patient referral” (procedure))
	)
	(and
		(clinical_finding ( snomed_concept “Patient condition unchanged” (finding) “day” (qualifier value) 5))
		(clinical_finding ( snomed_concept “Blister of ear with infection” (disorder))
		(clinical_finding ( snomed_concept “Red color” (qualifier value) “Ear lobule structure” (body structure))
		(clinical_finding ( snomed_concept “Swelling of ear” (finding) “Ear lobule structure” (body structure))
		(clinical_finding ( snomed_concept “Pain of ear” (finding) “Ear lobule structure” (body structure))
		)
	)
)
;;Page 33 – Ear symptoms
(system_diagnosis_rule
	"Chronic suppurative otitis media likely"
	(adult
	(clinical_finding ( snomed_concept “Chronic purulent otitis media” (disorder))
	)
	probable
	(and
		(clinical_finding ( snomed_concept “Ear discharge” (finding)
		(>=(clinical_finding ( snomed_concept “Ear finding” (finding) “week” (qualifier value) 2))
		(clinical_finding ( snomed_concept “Perforation of tympanic membrane” (disorder))
		)
	)
;;Page 33 – Ear symptoms
(system_diagnosis_rule
	"Chronic suppurative otitis media likely"
	(adult
	(referral
	(clinical_finding ( snomed_concept “Chronic purulent otitis media” (disorder))
	(clinical_finding ( snomed_concept “Patient referral” (procedure))
	)
	(and
		(clinical_finding ( snomed_concept “Patient condition unchanged” (finding) “week” (qualifier value) 4))
		(clinical_finding ( snomed_concept “Perforation of tympanic membrane” (disorder) “No status change” (qualifier value) “After” (attribute) “month” (qualifier value) 3))
		(>(clinical_finding ( snomed_concept “Perforation of tympanic membrane” (disorder) “Persistence” (finding) “month” (qualifier value) 6))
		(clinical_finding ( snomed_concept “Hearing loss” (disorder))
		(clinical_finding ( snomed_concept “Deposition” (morphologic abnormality) “White color” (qualifier value) “Tympanic membrane structure” (body structure))
		(clinical_finding ( snomed_concept “Deposition” (morphologic abnormality) “Yellow color” (qualifier value) “Tympanic membrane structure” (body structure))
		)
	)
;;Page 33 – Ear symptoms
(system_diagnosis_rule
	"Chronic suppurative otitis media likely"
	(adult
	(urgent_referral
	(clinical_finding ( snomed_concept “Chronic purulent otitis media” (disorder))
(clinical_finding ( snomed_concept “Urgent referral” (procedure) In (attribute) “24 hours” (qualifier value))
	)	
	(and		
		(clinical_finding ( snomed_concept “Posterior auricular pain” (finding))
		(clinical_finding ( snomed_concept “Swelling” (finding) “Behind” (qualifier value) “Ear structure” (body structure))
		(clinical_finding ( snomed_concept “Stiff neck” (finding))
		)
	)
)
;;Page 33 – Ear symptoms
(system_diagnosis_rule
	"Acute otitis media likely"
	(adult
	(clinical_finding ( snomed_concept “Acute otitis media” (disorder))
	)
	probable
	(and
		(clinical_finding ( snomed_concept “Ear discharge” (finding))
		(> (clinical_finding ( snomed_concept “Pain of ear” (finding) “day” (qualifier value)2))
		(clinical_finding ( snomed_concept “Pain of ear” (finding) “Wakes up during night” (finding))
		(>=measurement (clinical_finding ( snomed_concept “Body temperature” (observable entity) °C) 38  “In the past” (qualifier value) “day” (qualifier value)2))
		(<(clinical_finding ( snomed_concept “Ear finding” (finding) “week” (qualifier value) 2))
		(clinical_finding ( snomed_concept “Bright red tympanic membrane” (finding))
		(clinical_finding ( snomed_concept “Bulging tympanic membrane” (finding))
		)
	)
;;Page 33 – Ear symptoms
(system_diagnosis_rule
	"Acute otitis media likely"
	(adult
	(urgent_referral
	(clinical_finding ( snomed_concept “Acute otitis media” (disorder))
	(clinical_finding ( snomed_concept “Urgent referral” (procedure) “In” (attribute) “24 hours” (qualifier value))
	)
	(and
		(clinical_finding ( snomed_concept “Posterior auricular pain” (finding))
		(clinical_finding ( snomed_concept “Swelling” (finding) “Behind” (qualifier value) “Ear structure” (body structure))
		(clinical_finding ( snomed_concept “Stiff neck” (finding))
		)
	)
)
;;Page 33 – Ear symptoms
(system_diagnosis_rule
	"Cholesteatoma likely"
	(adult
	(clinical_finding ( snomed_concept “Cholesteatoma” (disorder))
	)
	probable
	(and
		(clinical_finding ( snomed_concept “Deposition” (morphologic abnormality) “White color” (qualifier value) “Tympanic membrane structure” (body structure))
		(clinical_finding ( snomed_concept “Deposition” (morphologic abnormality) “Yellow color” (qualifier value) “Tympanic membrane structure” (body structure))
		)
	)
)
;;Page 33 – Ear symptoms
(system_diagnosis_rule
	"Herpes zoster likely"
	(adult
	(clinical_finding ( snomed_concept “Herpes zoster” (disorder))
	)
	probable
	(and
		(clinical_finding ( snomed_concept “Blister of ear with infection” (disorder))
		)
	)
)
;;Page 33 – Ear symptoms
(system_diagnosis_rule
	"Cellulitis likely"
	(adult
	(clinical_finding ( snomed_concept “Cellulitis” (disorder))
	)
	probable
	(and
		(clinical_finding ( snomed_concept “Red color” (qualifier value) “Ear lobule structure” (body structure))
		(clinical_finding ( snomed_concept “Swelling of ear” (finding) “Ear lobule structure” (body structure))
		(clinical_finding ( snomed_concept “Pain of ear” (finding) “Ear lobule structure” (body structure))
		)
	)
)
;;Page 33 – Ear symptoms
(system_diagnosis_rule
	"Referred pain likely"
	(adult
	(clinical_finding ( snomed_concept “Referred pain” (finding))
	(clinical_finding ( snomed_concept “Referred otalgia” (finding))
	)
	probable
	(and
		(clinical_finding ( snomed_concept “Pain of ear” (finding))
		(clinical_finding ( snomed_concept “Itching of ear” (finding))
		(clinical_finding ( snomed_concept “Ear examination normal” (finding))
		)
	)
)
;;Page 33 – Ear symptoms
(system_diagnosis_rule
	"Mumps likely"
	(adult
	(clinical_finding ( snomed_concept “Mumps” (disorder))
	)
	probable
	(and
		(clinical_finding ( snomed_concept “Pain in face” (finding) “Side” (qualifier value))
		(clinical_finding ( snomed_concept “Facial swelling” (finding) “Side” (qualifier value))
		)
	)
)
;;Page 33 – Ear symptoms
(system_diagnosis_rule
	"Mastoiditis likely"
	(adult
	(clinical_finding ( snomed_concept “Mastoiditis” (disorder))
	)
	probable
	(and
		(clinical_finding ( snomed_concept “Posterior auricular pain” (finding))
		(clinical_finding ( snomed_concept “Swelling” (finding) “Behind” (qualifier value) “Ear structure” (body structure))
		(clinical_finding ( snomed_concept “Stiff neck” (finding))
		)
	)
)
;;Page 33 – Ear symptoms
(system_diagnosis_rule
	"Difficulty hearing or tinnitus with foreign body likely"
	(adult
	(clinical_finding ( snomed_concept “Hearing loss” (disorder))
	(clinical_finding ( snomed_concept “Tinnitus” (finding))
	(clinical_finding ( snomed_concept “Foreign body in ear” (disorder))
	)
	probable
	(and
		(clinical_finding ( snomed_concept “Buzzing in ear” (finding))
		(clinical_finding ( snomed_concept “Ringing in ear” (finding))
		(clinical_finding ( snomed_concept “Foreign body in ear” (disorder))
		(clinical_finding ( snomed_concept “Perforation of tympanic membrane” (disorder))
		(clinical_finding ( snomed_concept “Wax in ear canal” (finding))
		)
	)
;;Page 33 – Ear symptoms
(system_diagnosis_rule
	"Difficulty hearing or tinnitus with foreign body likely"
	(adult
	(referral 
	(clinical_finding ( snomed_concept “Hearing loss” (disorder))
	(clinical_finding ( snomed_concept “Tinnitus” (finding))
	(clinical_finding ( snomed_concept “Foreign body in ear” (disorder))
	(clinical_finding ( snomed_concept “Patient referral” (procedure))
	)
	probable
	(and
		(clinical_finding ( snomed_concept “Perforation of tympanic membrane” (disorder))
		(clinical_finding ( snomed_concept “Chronic purulent otitis media” (disorder))
		(clinical_finding ( snomed_concept “Hearing unchanged” (finding) “After” (attribute) “Removal of foreign body” (procedure))
		(clinical_finding ( snomed_concept “Hearing unchanged” (finding) “After” (attribute) “Removal of ear wax” (procedure))
		(clinical_finding ( snomed_concept “Hearing examination” (procedure))
		)
	)
)
;;Page 33 – Ear symptoms
(system_diagnosis_rule
	""Difficulty hearing or tinnitus with foreign body likely"
	(adult
	(consultation 
	(clinical_finding ( snomed_concept “Hearing loss” (disorder))
	(clinical_finding ( snomed_concept “Tinnitus” (finding))
	(clinical_finding ( snomed_concept “Foreign body in ear” (disorder))
	(clinical_finding ( snomed_concept “Consultation” (procedure) “Medical practitioner” (occupation))
	probable
	(and
		(clinical_finding ( snomed_concept “Review of medication” (procedure) “Amikacin” (substance))
		(clinical_finding ( snomed_concept “Syringing of external auditory canal” (procedure) “Failed attempted procedure” (situation) 3))
		(clinical_finding ( snomed_concept “Pain of ear” (finding) “During” (attribute) “Syringing of external auditory canal” (procedure))
		)
	)
)
;;Page 33 – Ear symptoms
(system_diagnosis_rule
	"Difficulty hearing or tinnitus in normal looking ear likely"
	(adult
	(clinical_finding ( snomed_concept “Hearing loss” (disorder))
	(clinical_finding ( snomed_concept “Tinnitus” (finding))
	)
	probable
	(and
		(clinical_finding ( snomed_concept “Buzzing in ear” (finding))
		(clinical_finding ( snomed_concept “Ringing in ear” (finding))
		(clinical_finding ( snomed_concept “Ear examination normal” (finding))
		)
	)
;;Page 33 – Ear symptoms
(system_diagnosis_rule
	"Difficulty hearing or tinnitus in normal looking ear likely"
	(adult
	(referral 
	(clinical_finding ( snomed_concept “Hearing loss” (disorder))
	(clinical_finding ( snomed_concept “Tinnitus” (finding))
	(clinical_finding ( snomed_concept “Patient referral” (procedure))
	)
	(and
		(clinical_finding ( snomed_concept “Sudden onset” (attribute))
		(clinical_finding ( snomed_concept “Unilateral” (qualifier value))
		(clinical_finding ( snomed_concept “Dizziness” (finding))
		(clinical_finding ( snomed_concept “Vertigo” (finding))
		(clinical_finding ( snomed_concept “Does take medication (finding) “Amikacin” (substance))
		)
	)
)



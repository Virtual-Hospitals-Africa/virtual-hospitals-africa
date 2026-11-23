;; Page 58 - Sexual problems
“Pain with sex - deep likely” 
(system_diagnosis_rule
  "Diagnose probable pain with sex - deep"
  (diagnosis
    (snomed_concept "Dyspareunia" "disorder")
		(snomed_concept “Deep pain on intercourse” (finding))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Vaginal penetration” (finding))
		(clinical_finding (snomed_concept “Anal penetration” (finding))
		(clinical_finding (snomed_concept “Genital finding” (finding))
	)
;; Page 58 - Sexual problems
“Pain with sex - deep likely” 
(system_diagnosis_rule
  "Diagnose probable pain with sex - deep"
  (diagnosis
	(referral 
    (snomed_concept "Dyspareunia" "disorder")
		(snomed_concept “Deep pain on intercourse” (finding))
		(snomed_concept “Patient referral” (procedure))
  )
  adult
  (and
		(clinical_finding (snomed_concept “Menorrhagia” (finding))
		(clinical_finding (snomed_concept “Dysmenorrhea” (disorder))
		(clinical_finding (snomed_concept “Prolonged periods” (finding))
		(clinical_finding (snomed_concept “Infertile” (finding))
		(clinical_finding (snomed_concept “Abdominal mass” (finding))
		(clinical_finding (snomed_concept “Mass of pelvic structure” (finding))
		(clinical_finding (snomed_concept “Mass of body structure” (finding) “Anal structure” (body structure))
		(clinical_finding (snomed_concept “Rectal mass” (finding))
	)
)
;; Page 58 - Sexual problems
“irritable bowel syndrome likely” 
(system_diagnosis_rule
  "Diagnose probable irritable bowel syndrome"
  (diagnosis
	(referral 
    (snomed_concept “Irritable bowel syndrome” (disorder))
		(snomed_concept “Patient referral” (procedure))
		(snomed_concept “Referral to doctor” (procedure))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Deep pain on intercourse” (finding))
		(clinical_finding (snomed_concept “Recurrent abdominal pain” (finding) “Relieved by” (attribute) “Defecation” (observable entity))
		(clinical_finding (snomed_concept “Abdominal bloating” (finding))
		(clinical_finding (snomed_concept “Constipation” (finding))
		(clinical_finding (snomed_concept “Diarrhea” (finding))
	)
)
;; Page 58 - Sexual problems
“Pain with sex - superficial likely” 
(system_diagnosis_rule
  "Diagnose probable pain with sex - superficial"
  (diagnosis
    (snomed_concept "Dyspareunia" "disorder")
		(snomed_concept “Superficial pain on intercourse” (finding))
    probable
  )
  adult
  (and 
		(clinical_finding (snomed_concept “Vaginal penetration” (finding))
		(clinical_finding (snomed_concept “Anal penetration” (finding))
		(clinical_finding (snomed_concept “Anal finding” (finding))
		(clinical_finding (snomed_concept “Urogenital finding” (finding))
		(clinical_finding (snomed_concept “Vaginal dryness” (disorder))
	)
)
;; Page 58 - Sexual problems
“Vaginal dryness likely” 
(system_diagnosis_rule
  "Diagnose probable vaginal dryness"
  (diagnosis
    (snomed_concept “Vaginal dryness” (disorder))
    probable
  )
  adult
  (and 
		(clinical_finding (snomed_concept “Superficial pain on intercourse” (finding))
		(clinical_finding (snomed_concept “Vaginal penetration” (finding))
		(clinical_finding (snomed_concept “Anal penetration” (finding))
		(>(snomed_concept “Current chronological age” (observable entity) year) 40))
		(clinical_finding (snomed_concept “Menopause finding” (finding))
		(clinical_finding (snomed_concept “Menopausal flushing” (disorder))
		(clinical_finding (snomed_concept “Night sweats” (finding))
		(clinical_finding (snomed_concept “Mood swings” (finding))
		(clinical_finding (snomed_concept “Difficulty sleeping” (finding))
	)
;; Page 58 - Sexual problems
“Vaginal dryness likely” 
(system_diagnosis_rule
  "Diagnose probable vaginal dryness"
  (diagnosis
	(consult
    (snomed_concept “Vaginal dryness” (disorder))
		(snomed_concept “Consultation” (procedure))
  )
  adult
  (and 
		(clinical_finding (snomed_concept “Review of medication” (procedure))
		(clinical_finding (snomed_concept “Uses oral contraception” (finding))
		(clinical_finding (snomed_concept “Antidepressant” (substance))
		(clinical_finding (snomed_concept “Hypotensive agent” (substance))
	)
)
;; Page 58 - Sexual problems
“Painful ejaculation likely” 
(system_diagnosis_rule
  "Diagnose probable painful ejaculation"
  (diagnosis
	(consult
    (snomed_concept “Painful ejaculation” (finding))
		(snomed_concept “Consultation” (procedure))
  )
  adult
  (and 
		(clinical_finding (snomed_concept “Review of medication” (procedure))
		(clinical_finding (snomed_concept “Antidepressant” (substance))
		(clinical_finding (snomed_concept “Anti-psychotic agent” (substance))
	)
)
;; Page 58 - Sexual problems
“Erection problem likely” 
(system_diagnosis_rule
  "Diagnose probable erection problem"
  (diagnosis
    (snomed_concept ““Penile erection (finding)
		(snomed_concept “Waking erection” (finding))
	probable
  )
  adult
  (and 
		(clinical_finding (snomed_concept “Waking erection” (finding))
		(clinical_finding (snomed_concept “Depressed mood” (finding))
		(clinical_finding (snomed_concept “Stress” (finding))
		(clinical_finding (snomed_concept “Anxiety” (finding))
		(clinical_finding (snomed_concept “Relationship problem” (finding))
		(clinical_finding (snomed_concept “Anxiety” (finding))
		(clinical_finding (snomed_concept “Erotophobia” (finding))
		(clinical_finding (snomed_concept “Unwanted pregnancy” (finding))
		(clinical_finding (snomed_concept “Infertile” (finding))
		(clinical_finding (snomed_concept “Performance anxiety” (finding))
		(clinical_finding (snomed_concept “Sexual abuse” (event))
		(clinical_finding (snomed_concept “Sexual assault” (event))
	)
;; Page 58 - Sexual problems
“Erection problem likely” 
(system_diagnosis_rule
  "Diagnose probable erection problem"
  (diagnosis
    (snomed_concept ““Penile erection (finding)
		(snomed_concept “Waking erection” (finding) “No” (qualifier value))
	probable
  )
  adult
  (and 
		(clinical_finding (snomed_concept “Waking erection” (finding) “No” (qualifier value))
		(clinical_finding (snomed_concept “At increased risk for cardiovascular event” (finding))
		(clinical_finding (snomed_concept “Current drinker of alcohol” (finding))
		(clinical_finding (snomed_concept “Misuses drugs” (finding))
		(clinical_finding (snomed_concept “Depressed mood” (finding))
		(clinical_finding (snomed_concept “Stress” (finding))
		(clinical_finding (snomed_concept “Anxiety” (finding))
	)
 ;; Page 58 - Sexual problems
“Erection problem likely” 
(system_diagnosis_rule
  "Diagnose probable erection problem"
  (diagnosis
	(consult
    (snomed_concept ““Penile erection (finding)
		(snomed_concept “Waking erection” (finding)“No” (qualifier value))
		(snomed_concept “Consultation” (procedure))
	probable
  )
  adult
  (and 
		(clinical_finding (snomed_concept “Review of medication” (procedure))
		(clinical_finding (snomed_concept “Hydrochlorothiazide” (substance))
		(clinical_finding (snomed_concept “Spironolactone” (substance))
		(clinical_finding (snomed_concept “Risperidone” (substance))
		(clinical_finding (snomed_concept “Fluoxetine” (substance))
		(clinical_finding (snomed_concept “Amitriptyline” (substance))
	)
)
;; Page 58 - Sexual problems
“Loss of libido likely” 
(system_diagnosis_rule
  "Diagnose probable loss of libido"
  (diagnosis
	(referral 
    (snomed_concept “Lack of libido” (finding))
		(snomed_concept “Patient referral” (procedure))
		(snomed_concept “Referral to counselor” (procedure))
	probable
  )
  adult
  (and 
		(clinical_finding (snomed_concept “Current drinker of alcohol” (finding))
		(clinical_finding (snomed_concept “Depressed mood” (finding))
		(clinical_finding (snomed_concept “Stress” (finding))
		(clinical_finding (snomed_concept “Anxiety” (finding))
		(clinical_finding (snomed_concept “Relationship problem” (finding))
		(clinical_finding (snomed_concept “Anxiety” (finding))
		(clinical_finding (snomed_concept “Erotophobia” (finding))
		(clinical_finding (snomed_concept “Unwanted pregnancy” (finding))
		(clinical_finding (snomed_concept “Infertile” (finding))
		(clinical_finding (snomed_concept “Performance anxiety” (finding))
		(clinical_finding (snomed_concept “Sexual abuse” (event))
		(clinical_finding (snomed_concept “Sexual assault” (event))
	)
;; Page 58 - Sexual problems
“Loss of libido likely” 
(system_diagnosis_rule
  "Diagnose probable loss of libido"
  (diagnosis
	(consult
    (snomed_concept “Lack of libido” (finding))
		(snomed_concept “Consultation (procedure)
	probable
  )
  adult
  (and 
		(clinical_finding (snomed_concept “Review of medication” (procedure))
		(clinical_finding (snomed_concept “Phenytoin” (substance))
		(clinical_finding (snomed_concept “Hydrochlorothiazide” (substance))
		(clinical_finding (snomed_concept “Spironolactone” (substance))
		(clinical_finding (snomed_concept “Chlorpromazine” (substance))
		(clinical_finding (snomed_concept “Risperidone” (substance))
		(clinical_finding (snomed_concept “Fluoxetine” (substance))
		(clinical_finding (snomed_concept “Amitriptyline” (substance))
		(clinical_finding (snomed_concept “Lopinavir” (substance))
		(clinical_finding (snomed_concept “Ritonavir” (substance))
		)
	)
)
;; Page 48 - Constipation
(task
  "Check for urgent constipation conditions"
  adult
  (clinical_finding (snomed_concept "Constipation" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
    (<= (timestamp (clinical_finding (snomed_concept "Constipation" "finding")))
        (time_ago 24 hours))
    (<= (timestamp (clinical_finding (snomed_concept "Unable to break wind" "finding")))
        (time_ago 24 hours))
    )
)
;; Page 48 - Anal Symptoms
(task
  "Check for urgent anal conditions"
  adult
  (clinical_finding (snomed_concept “Anal finding” (finding))
  (check_for
    (clinical_finding (snomed_concept "Anal pain" "finding") (qualifier (snomed_concept "Extreme" (qualifier value))
    (clinical_finding (snomed_concept "Anal polyp" "disorder"))
		(clinical_finding ( snomed_concept “Does not defecate” (finding)
    (clinical_finding (snomed_concept "Perianal lump" "finding"))
		)
  )
)
;; Page 48 - Constipation: Urgent for bowel obstruction signs
(system_priority_evaluation
  "Urgent: constipation with bowel obstruction signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Constipation" "finding"))
		(or
  		(<= (timestamp (clinical_finding (snomed_concept "Constipation" "finding")))
        (time_ago 24 hours))
  		(<= (timestamp (clinical_finding (snomed_concept "Unable to break wind" "finding")))
        (time_ago 24 hours))
      (clinical_finding (snomed_concept "Abdominal pain" "finding"))
      (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
  )
)
;; Page 48 - Anal Symptoms: Urgent for painful lump or unable to pass stool
(system_priority_evaluation
  "Urgent: anal pain with lump or difficulty defecating"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept “Anal finding” (finding))
    (or
      (clinical_finding (snomed_concept “Anal polyp”(disorder))
      (clinical_finding (snomed_concept “Does not defecate” (finding))
    )
  )
)
;; Page 48 Constipation
(system_diagnosis_evaluation
	"Constipation non-urgent likely"
	(adult
	(consult
	(snomed_concept “Constipation” (finding) “Non-urgent” (qualifier value))
	(snomed_concept “Consultation” (procedure))
	(and
		(or
		(clinical_finding (snomed_concept “Dietary finding” (finding))
		(clinical_finding (snomed_concept “Finding of fluid intake” (finding))
		)
		(clinical_finding (snomed_concept “Review of medication” (procedure))
		(snomed_concept “Amitriptyline” (substance))
		(snomed_concept “Anti-psychotic agent” (substance))
		(snomed_concept “Codeine” (substance))
		(snomed_concept “Morphine” (substance))
		)
;; Page 48 Constipation
(system_diagnosis_evaluation
	"Constipation non-urgent likely"
	(adult
	(referral 
	(snomed_concept “Constipation” (finding) “Non-urgent” (qualifier value))
	(snomed_concept “Patient referral” (procedure))
	(and
		(or
			(clinical_finding (snomed_concept 
			(clinical_finding (snomed_concept “Patient condition unchanged” (finding) “After” (attribute) week) 1 “Treatment given” (situation) Laxative (substance)
			(clinical_finding (snomed_concept “Altered bowel function” (finding) “Recent” (qualifier value))
			(clinical_finding (snomed_concept “Weight decreased” (finding))
			(clinical_finding (snomed_concept “Hematochezia” (finding))
			(clinical_finding (snomed_concept “Occult blood detected in feces” (finding))
			(clinical_finding (snomed_concept “Uncertain diagnosis” (observable entity))
	)
)
;; Page 48 Constipation
(system_diagnosis_evaluation
	"Thyroid disease likely"
	(adult
	(snomed_concept	“Disorder of thyroid gland” (disorder))
	)
	probable 
	(and
		(or
			(clinical_finding (snomed_concept “Asthenia” (finding))
			(clinical_finding (snomed_concept “Fatigue” (finding))
			(clinical_finding (snomed_concept “Weight increased” (finding))
			(clinical_finding (snomed_concept “Depressed mood” (finding))
			(clinical_finding (snomed_concept “Xeroderma” (disorder))
			(clinical_finding (snomed_concept “Intolerant of cold” (finding))
		)
)
;; Page 48 Constipation
(system_diagnosis_evaluation
	"Impaction likely"
	(adult
	(snomed_concept “Fecal impaction” (disorder))
	)
	probable 
	(and
		(or
			(clinical_finding (snomed_concept “Constipation” (finding)
			(clinical_finding (snomed_concept “Bed-ridden” (finding))
			(clinical_finding (snomed_concept “Terminal illness” (finding))
			(> (snomed_concept “Current chronological age” (observable entity) year) 65))
			(clinical_finding (snomed_concept “Palliative care” (regime/therapy))
			(clinical_finding (snomed_concept “Feces in rectum” (finding) “Impacted” (qualifier value))
			(clinical_finding (snomed_concept “Feces in rectum” (finding) “Hard stool” (finding))
			(clinical_finding (snomed_concept “Feces in rectum” (finding) “Dry stool” (finding))
		)
	)
)
;; Page 48 Anal symptoms
(system_diagnosis_evaluation
	"Sexually transmitted proctitis likely"
	(adult
	(snomed_concept	“Infective proctitis” (disorder) “Sexual transmission” (qualifier value))
	)
	probable 
	(and
		(or
			(clinical_finding (snomed_concept “Anal penetration” (finding))
			(clinical_finding (snomed_concept “Genital finding” (finding))
			(clinical_finding (snomed_concept “Painless rectal bleeding” (finding)
			(clinical_finding (snomed_concept “Mucus in stool” (finding))
			(clinical_finding (snomed_concept “Tenesmus of anus and/or rectum” (finding))
	)
)
;; Page 48 Anal symptoms
(system_diagnosis_evaluation
	"Lump/pile likely"
	(adult
	(snomed_concept	“Hemorrhoids” (disorder))
	)
	probable 
	(and
		(or
			(clinical_finding (snomed_concept “Rectal mass” (finding))
			(clinical_finding (snomed_concept “Mass of body structure” (finding) “Anal structure” (body structure)))
		)
;; Page 48 Anal symptoms
(system_diagnosis_evaluation
	"Lump/pile likely"
	(adult
	(referral 
	(snomed_concept	“Hemorrhoids” (disorder))
	(snomed_concept “Patient referral” (procedure))
	)
	probable 
	(and
		(or
			(clinical_finding (snomed_concept “Prolapsed pile irreducible” (disorder))
			(clinical_finding (snomed_concept “Thrombosed external hemorrhoids” (disorder))
		)
	)
)

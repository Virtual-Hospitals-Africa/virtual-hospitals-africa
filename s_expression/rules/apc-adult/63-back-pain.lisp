;; Page 63 - Back Pain
(task
  "Check for urgent back pain conditions"
  adult
  (clinical_finding (snomed_concept "Backache" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Incomplete emptying of urinary bladder" "finding"))
    (clinical_finding (snomed_concept "Fecal impaction" "disorder"))
    (clinical_finding (snomed_concept "Urinary incontinence" "finding"))
    (clinical_finding (snomed_concept "Incontinence of feces" "finding"))
		(clinical_finding ( snomed_concept “Numbness” (finding)) “Buttock structure” (body structure))
    (clinical_finding (snomed_concept "Numbness of saddle area" "finding"))
    (clinical_finding (snomed_concept "Numbness of lower limbs" "finding"))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb”" "finding"))
    (clinical_finding (snomed_concept "Difficulty walking" "finding"))
		(clinical_finding ( snomed_concept “Traumatic or non-traumatic injury of back” (disorder)  “Recent” (qualifier value))
		(clinical_finding ( snomed_concept “Plain X-ray of lumbar spine abnormal” (finding))
		(clinical_finding ( snomed_concept “Plain X-ray of lumbar vertebral column region” (procedure) “Not available” (qualifier value))
    (clinical_finding (snomed_concept "Upper abdominal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))
    (clinical_finding (snomed_concept "Left flank pain" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Right flank pain" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
		(clinical_finding ( snomed_concept “Fever” (finding))
    (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
    (clinical_finding (snomed_concept "Nitrite detected in urine" "finding"))
		(clinical_finding (snomed_concept “Nausea” (finding))
    (clinical_finding (snomed_concept "Vomiting” (disorder))
		(clinical_finding ( snomed_concept “Diabetes mellitus” (disorder))
		(clinical_finding ( snomed_concept “Pregnancy” (finding))
    (clinical_finding (snomed_concept "Postmenopausal state" "finding"))
    (clinical_finding (snomed_concept "Left inguinal pain" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Right inguinal pain" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
		(clinical_finding ( snomed_concept “Backache with radiation” (finding) “Inguinal region structure” (body structure))
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
		(clinical_finding ( snomed_concept “Malignant neoplastic disease” (disorder) Known (qualifier value))
  )
)
;; Page 63 - Back pain
"Abdominal aortic aneurysm likely"
(system_diagnosis_rule
  "Diagnose probable abdominal aortic aneurysm"
  (diagnosis
    (snomed_concept "Abdominal aortic aneurysm" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Backache" "finding"))
    (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))
  )
)
;; Page 63 - Back pain
"Complicated pyelonephritis likely"
(system_diagnosis_rule
  "Diagnose probable complicated  pyelonephritis"
  (diagnosis
    (snomed_concept “Pyelonephritis” (disorder) “Complicated” (qualifier value))
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Backache" "finding"))
    (or
      (clinical_finding (snomed_concept “Pain in flank” (finding))
			(clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
      (clinical_finding (snomed_concept "Nitrite detected in urine" "finding"))
	    (clinical_finding (snomed_concept "Fever" "finding"))
      (clinical_finding (snomed_concept "Vomiting” (disorder))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90))
			(<measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
      (>= (measurement (snomed_concept "Heart rate” "observable entity") bpm) 100))
			(clinical_finding (snomed_concept “Diabetes mellitus” (disorder))
			(clinical_finding (snomed_concept “Male” (finding))
			(clinical_finding (snomed_concept “Pregnancy” (finding))
			(clinical_finding (snomed_concept “Postmenopausal state” (finding))
	)
)
;; Page 63 - Back pain
"Pancreatitis likely"
(system_diagnosis_rule
  "Diagnose probable pancreatitis"
  (diagnosis
    (snomed_concept "Pancreatitis" "disorder")
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Backache” (finding))
		(clinical_finding (snomed_concept “Upper abdominal pain” (finding))
			(snomed_concept “Sudden onset” (qualifier value))
			(snomed_concept “Severe” (severity modifier) (qualifier value))
		(clinical_finding (snomed_concept “Nausea” (finding))		
		(clinical_finding (snomed_concept “Vomiting” (disorder))
		(<measurement (snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
		(<measurement (snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
	)
)
;; Page 63 - Back pain
"Kidney stone likely"
(system_diagnosis_rule
  "Diagnose probable kidney stone"
  (diagnosis
    (snomed_concept "Kidney stone" "disorder")
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Pain in flank” (finding))
		(clinical_finding (snomed_concept “Blood in urine” (finding))
		(clinical_finding (snomed_concept “Backache” (finding))
			(snomed_concept “Unilateral” (qualifier value)) 
			(snomed_concept “Sudden” (qualifier value)) 
			(snomed_concept “Severe” (severity modifier) (qualifier value))
	(clinical_finding (snomed_concept “Backache with radiation” (finding) “Inguinal region structure” (body structure))
	)
)
;; Page 63 - Back pain
"Uncomplicated pyelonephritis likely"
(system_diagnosis_rule
  "Diagnose probable uncomplicated pyelonephritis"
  (diagnosis
    (snomed_concept “Pyelonephritis” (disorder) “Uncomplicated” (qualifier value))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Pain in flank” (finding))
		(clinical_finding (snomed_concept “Leukocytes in urine” (finding))
		(clinical_finding (snomed_concept “Nitrite detected in urine” (finding))
	)
)
;; Page 63 - Back pain
"Back pain non-urgent likely"
(system_diagnosis_rule
  "Diagnose probable back pain non-urgent"
  (diagnosis
	(consult
	(referral 
    (snomed_concept “Backache” (finding) “Non-urgent” (qualifier value))
		(snomed_concept “Consultation” (procedure))
		(snomed_concept “Patient referral to specialist” (procedure))
    probable
  )
  adult
  (and
		(snomed_concept “Evaluation of test results” (procedure))
		(clinical_finding (snomed_concept “C-reactive protein within reference range” (finding))
		(clinical_finding (snomed_concept “C-reactive protein outside reference range” (finding))
		(clinical_finding (snomed_concept “Plain X-ray finding” (finding))
		)
		(>(clinical_finding (snomed_concept “Current chronological age” (observable entity) year) 50))
		(>(clinical_finding (snomed_concept “Backache” (finding) “Progressive” (qualifier value) week) 60))
		(clinical_finding (snomed_concept “History of malignant neoplasm” (situation))
		(clinical_finding (snomed_concept “History of” (contextual qualifier) (qualifier value) “Surgical procedure” (procedure) “Structure of posterior region of trunk” (body structure))
		(clinical_finding (snomed_concept “Osteoporosis” (disorder))
		(clinical_finding (snomed_concept “Use of steroids” (finding) “Oral route” (qualifier value))
		(clinical_finding (snomed_concept “Human immunodeficiency virus infection” (disorder))
		(clinical_finding (snomed_concept “Intravenous drug user” (finding))
		(clinical_finding (snomed_concept “Deformity” (finding))
	)
)
;; Page 63 - Back pain
"Mechanical back pain likely"
(system_diagnosis_rule
  "Diagnose probable mechanical back pain"
  (diagnosis
    (snomed_concept “Mechanical low back pain” (finding))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Backache” (finding))
		(clinical_finding (snomed_concept “Finding reported by subject or history provider” (finding) “Other” (qualifier value) “No” (qualifier value))
	)
;; Page 63 - Back pain
"Mechanical back pain likely"
(system_diagnosis_rule
  "Diagnose probable mechanical back pain"
  (diagnosis
	(referral 
	(urgent_referral
    (snomed_concept “Mechanical low back pain” (finding))
		(snomed_concept “Patient referral” (procedure))
		(snomed_concept “Referral to physiotherapist” (procedure))
		(snomed_concept “Referral to doctor” (procedure))
		(snomed_concept “Urgent referral” (procedure))
  )
  adult
  (and
		(snomed_concept “Referral to physiotherapist” (procedure))
		(>(clinical_finding (snomed_concept “Backache” (finding) “Continual” (qualifier value) week) 2))
		(clinical_finding (snomed_concept “Basic activity of daily living” (finding) “Inability to cope” (finding))
		(clinical_finding (snomed_concept “Temporarily unable to perform work activities due to medical condition” (finding))
		)
		(snomed_concept “Referral to doctor” (procedure))
		(>= (clinical_finding (snomed_concept “Backache” (finding) “Continual” (qualifier value) week) 4))
		)
		(snomed_concept “Urgent referral” (procedure))
		(clinical_finding (snomed_concept “Urinary bladder finding” (finding))
		(clinical_finding (snomed_concept “Bowel finding” (finding))
		(clinical_finding (snomed_concept “Numbness” (finding))
		(clinical_finding (snomed_concept “Asthenia” (finding))
		(clinical_finding (snomed_concept “Muscle weakness” (finding))
	)
)
;; Page 63 - Back pain
"Inflammatory back pain likely"
(system_diagnosis_rule
  "Diagnose probable inflammatory back pain"
  (diagnosis
	(consult
	(referral 
    (snomed_concept “Inflammatory pain” (finding) “Structure of posterior region of trunk” (body structure))
		(snomed_concept “Consultation” (procedure))
		(snomed_concept “Patient referral to specialist” (procedure))
    probable
  )
  adult
  (and
		(clinical_finding (snomed_concept “Backache” (finding))
		(<(clinical_finding (snomed_concept “Current chronological age” (observable entity) year) 40))
		(clinical_finding (snomed_concept “Dyssomnia” (disorder))
		(clinical_finding (snomed_concept “Pain onset during sleep” (finding))
		(clinical_finding (snomed_concept “Pain relief by walking” (finding) or 		(clinical_finding (snomed_concept “Physical activity” (observable entity))
		(clinical_finding (snomed_concept “Pain provoked by rest” (finding))
    )
  )
)
;; Page 63 - Back Pain
(system_priority_evaluation
  "Urgent back pain symptoms"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Backache" "finding"))
    (or
      (clinical_finding ( snomed_concept “Incomplete emptying of urinary bladder” (finding))
			or
			(clinical_finding ( snomed_concept “Fecal impaction” (disorder))
			(clinical_finding (snomed_concept "Urinary incontinence" "finding"))
      (clinical_finding (snomed_concept "Incontinence of feces" "finding"))
			)
			(clinical_finding ( snomed_concept “Numbness” (finding)) “Buttock structure” (body structure))
			or
			(clinical_finding ( snomed_concept “Numbness of saddle area” (finding))
      (clinical_finding (snomed_concept "Numbness of lower limb" "finding"))
			)
      (clinical_finding (snomed_concept "Weakness of muscle of lower limb” "finding"))
			or
			(clinical_finding ( snomed_concept “Difficulty walking” (finding))
			)
      (clinical_finding (snomed_concept "Traumatic or non-traumatic injury of back” (disorder)  “Recent” (qualifier value))
			and 
			(clinical_finding ( snomed_concept “Plain X-ray of lumbar spine abnormal” (finding))
			(clinical_finding ( snomed_concept “Plain X-ray of lumbar vertebral column region” (procedure) “Not available” (qualifier value))
			)
			(clinical_finding (snomed_concept “Pancreatitis” (disorder))
			(clinical_finding (snomed_concept “Upper abdominal pain” (finding))
			(snomed_concept “Sudden onset” (qualifier value))
			(snomed_concept “Severe” (severity modifier) (qualifier value))
			(clinical_finding (snomed_concept “Nausea” (finding))
			(clinical_finding (snomed_concept “Vomiting” (disorder))
			)
			(clinical_finding (snomed_concept “Abdominal aortic aneurysm” (disorder))
			(clinical_finding ( snomed_concept “Pulsatile mass of abdomen” (finding))
			)
			(clinical_finding (snomed_concept “Pyelonephritis” (disorder) “Complicated” (qualifier value))
			(clinical_finding ( snomed_concept “Left flank pain” (finding) Sudden (qualifier value) Severe (severity modifier) (qualifier value))
			(clinical_finding ( snomed_concept “Right flank pain” (finding) Sudden (qualifier value) Severe (severity modifier) (qualifier value))
			(clinical_finding ( snomed_concept “Fever” (finding))
			(clinical_finding ( snomed_concept “Leukocytes in urine” (finding))
			(clinical_finding ( snomed_concept “Nitrite detected in urine” (finding))
			and
			(<measurement ( snomed_concept “Systolic blood pressure” (observable entity) mmHg) 90))
			(<measurement ( snomed_concept “Diastolic blood pressure” (observable entity) mmHg) 60))
			(>=measurement (snomed_concept “Heart rate” (observable entity) bpm) 100))
			(clinical_finding ( snomed_concept “Male” (finding))
			(clinical_finding ( snomed_concept “Vomiting” (disorder))
			(clinical_finding ( snomed_concept “Diabetes mellitus” (disorder))
			(clinical_finding ( snomed_concept “Pregnancy” (finding))
			(clinical_finding ( snomed_concept “Postmenopausal state” (finding))
			)
			(clinical_finding (snomed_concept “Kidney stone” (disorder))
			(clinical_finding ( snomed_concept “Left inguinal pain” (finding) Sudden (qualifier value) Severe (severity modifier) (qualifier value))
			(clinical_finding ( snomed_concept “Right inguinal pain” (finding) Sudden (qualifier value) Severe (severity modifier) (qualifier value))
			(clinical_finding ( snomed_concept “Backache with radiation” (finding) “Inguinal region structure” (body structure))
			(clinical_finding ( snomed_concept “Blood in urine” (finding))
			)
			(clinical_finding ( snomed_concept “Malignant neoplastic disease” (disorder) Known (qualifier value))
    )
  )
)
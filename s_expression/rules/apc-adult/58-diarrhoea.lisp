;; Page 58 - Diarrhoea
(task
  "Check for diarrhoea urgent signs and causes"
  adult
  (clinical_finding (snomed_concept "Diarrhea" "finding"))
  (check_for
    ;; Red box
    (clinical_finding (snomed_concept "Shock" "disorder"))
    (clinical_finding (snomed_concept "Diarrhea" "finding") (qualifier (snomed_concept "Watery" "qualifier value")))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Vibrio cholerae" "organism"))

    ;; Dehydration
    (clinical_finding (snomed_concept "Increased thirst" "finding"))
    (clinical_finding (snomed_concept "Xerostomia" "finding"))
    (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))

    ;; Overflow diarrhoea
    (clinical_finding (snomed_concept "Chronic constipation" "disorder"))

    ;; Diarrhoea <= 2 weeks: blood in the stool?
    (clinical_finding (snomed_concept "Hematochezia" "finding"))

    ;; Who needs a rectal check for impaction
    (clinical_finding (snomed_concept "Bed-ridden" "finding"))
    (clinical_finding (snomed_concept "Seen by palliative care service" "finding"))
  )
)
(task
  "Check rectum for faecal impaction in diarrhoea"
  adult
  (and (clinical_finding (snomed_concept "Diarrhea" "finding"))
       (or (clinical_finding (snomed_concept "Bed-ridden" "finding"))
           (clinical_finding (snomed_concept "Seen by palliative care service" "finding"))))
  (check_for
    (clinical_finding (snomed_concept "Fullness of rectum due to feces" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable cholera in diarrhoea"
  (diagnosis
    (snomed_concept "Cholera" "disorder")
    probable
  )
  adult
  (and
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Vibrio cholerae" "organism"))
    (or
      ;; Red box: watery diarrhoea (with or without vomiting) and cholera outbreak area
      (clinical_finding (snomed_concept "Diarrhea" "finding") (qualifier (snomed_concept "Watery" "qualifier value")))
      ;; Flowchart: diarrhoea <= 2 weeks, no blood in stool, cholera outbreak area
      (and (<= (onset (clinical_finding (snomed_concept "Diarrhea" "finding"))) (time_ago 2 weeks))
           (no (clinical_finding (snomed_concept "Hematochezia" "finding"))))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable dehydration in diarrhoea"
  (diagnosis
    (snomed_concept "Dehydration" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Diarrhea" "finding"))
    (or (clinical_finding (snomed_concept "Increased thirst" "finding"))
        (clinical_finding (snomed_concept "Xerostomia" "finding"))
        (clinical_finding (snomed_concept "Decreased skin turgor" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable overflow diarrhoea"
  (diagnosis
    (snomed_concept "Chronic constipation with overflow" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Chronic constipation" "disorder"))
    (clinical_finding (snomed_concept "Diarrhea" "finding") (qualifier (snomed_concept "Watery" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose probable dysentery in diarrhoea"
  (diagnosis
    (snomed_concept "Dysenteric diarrhea" "disorder")
    probable
  )
  adult
  (and
    (<= (onset (clinical_finding (snomed_concept "Diarrhea" "finding"))) (time_ago 2 weeks))
    (clinical_finding (snomed_concept "Hematochezia" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable gastroenteritis in diarrhoea"
  (diagnosis
    (snomed_concept "Inflammation of stomach and intestine" "disorder")
    probable
  )
  adult
  (and
    (<= (onset (clinical_finding (snomed_concept "Diarrhea" "finding"))) (time_ago 2 weeks))
    (no (clinical_finding (snomed_concept "Hematochezia" "finding")))
    (no (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Vibrio cholerae" "organism")))
  )
)
(system_diagnosis_rule
  "Diagnose probable faecal impaction in diarrhoea"
  (diagnosis
    (snomed_concept "Fecal impaction" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Diarrhea" "finding"))
    (or (clinical_finding (snomed_concept "Bed-ridden" "finding"))
        (clinical_finding (snomed_concept "Seen by palliative care service" "finding")))
    (clinical_finding (snomed_concept "Fullness of rectum due to feces" "finding"))
  )
)
(system_priority_evaluation
  "Urgent: diarrhoea with shock or cholera"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diarrhea" "finding"))
    (or (clinical_finding (snomed_concept "Shock" "disorder"))
        (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
        (active_condition (snomed_concept "Cholera" "disorder")))
  )
)

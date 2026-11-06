;; Page 58 - Diarrhoea
(task
  "Check for diarrhoea danger signs and causes"
  adult
  (clinical_finding (snomed_concept "Diarrhea" "finding"))
  (check_for
    ;; Red box
    (clinical_finding (snomed_concept "Shock" "disorder"))
    (clinical_finding (snomed_concept "Diarrhea" "finding") (qualifier (snomed_concept "Watery" "qualifier value")))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Vibrio cholerae" "organism"))

    ;; Dehydration
    (clinical_finding (snomed_concept "Thirst due to water deprivation" "finding"))
    (clinical_finding (snomed_concept "Xerostomia" "finding"))
    (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))

    ;; Overflow diarrhoea
    (clinical_finding (snomed_concept "Chronic constipation" "disorder"))

    ;; Diarrhoea <= 2 weeks: blood in the stool?
    (clinical_finding (snomed_concept "Hematochezia" "finding"))

    ;; Impaction
    (clinical_finding (snomed_concept "Bed-ridden" "finding"))
    (clinical_finding (snomed_concept "Fullness of rectum due to feces" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable cholera (diarrhoea page)"
  (diagnosis
    (snomed_concept "Cholera" "disorder")
    probable
  )
  adult
  (or
    ;; Red box: watery diarrhoea (with or without vomiting) and in cholera outbreak area in past 5 days
    (and (clinical_finding (snomed_concept "Diarrhea" "finding") (qualifier (snomed_concept "Watery" "qualifier value")))
         (<= (onset (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Vibrio cholerae" "organism"))) (time_ago 5 days)))
    ;; Flowchart: diarrhoea <= 2 weeks, no blood in stool, in cholera outbreak area in past 5 days
    (and (<= (onset (clinical_finding (snomed_concept "Diarrhea" "finding"))) (time_ago 2 weeks))
         (no (clinical_finding (snomed_concept "Hematochezia" "finding")))
         (<= (onset (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Vibrio cholerae" "organism"))) (time_ago 5 days)))
  )
)
(system_diagnosis_rule
  "Diagnose probable dehydration from diarrhoea"
  (diagnosis
    (snomed_concept "Dehydration" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Diarrhea" "finding"))
       (or (clinical_finding (snomed_concept "Thirst due to water deprivation" "finding"))
           (clinical_finding (snomed_concept "Xerostomia" "finding"))
           (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
       )
  )
)
(system_diagnosis_rule
  "Diagnose probable overflow diarrhoea"
  (diagnosis
    (snomed_concept "Chronic constipation with overflow" "disorder")
    probable
  )
  adult
  ;; History of prolonged constipation followed by watery stool (the sequence is not modelled)
  (and (clinical_finding (snomed_concept "Chronic constipation" "disorder"))
       (clinical_finding (snomed_concept "Diarrhea" "finding") (qualifier (snomed_concept "Watery" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose probable dysentery"
  (diagnosis
    (snomed_concept "Dysenteric diarrhea" "disorder")
    probable
  )
  adult
  ;; Diarrhoea <= 2 weeks and blood in the stool
  (and (<= (onset (clinical_finding (snomed_concept "Diarrhea" "finding"))) (time_ago 2 weeks))
       (clinical_finding (snomed_concept "Hematochezia" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable gastroenteritis"
  (diagnosis
    (snomed_concept "Inflammation of stomach and intestine" "disorder")
    probable
  )
  adult
  ;; Diarrhoea <= 2 weeks, no blood in stool, not in cholera outbreak area in past 5 days
  (and (<= (onset (clinical_finding (snomed_concept "Diarrhea" "finding"))) (time_ago 2 weeks))
       (no (clinical_finding (snomed_concept "Hematochezia" "finding")))
       (or (no (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Vibrio cholerae" "organism")))
           (>= (onset (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Vibrio cholerae" "organism"))) (time_ago 5 days))
       )
  )
)
(system_diagnosis_rule
  "Diagnose probable faecal impaction (diarrhoea page)"
  (diagnosis
    (snomed_concept "Fecal impaction" "disorder")
    probable
  )
  adult
  ;; Page: > 65 years, bed-bound or receiving palliative care, and solid immobile bulk of stool in rectum.
  ;; Age > 65 and palliative care cannot be expressed; only bed-bound is kept.
  (and (clinical_finding (snomed_concept "Bed-ridden" "finding"))
       (clinical_finding (snomed_concept "Fullness of rectum due to feces" "finding"))
  )
)
(system_priority_evaluation
  "Urgent: diarrhoea with shock or cholera"
  adult
  Urgent
  (and (clinical_finding (snomed_concept "Diarrhea" "finding"))
       (or (clinical_finding (snomed_concept "Shock" "disorder"))
           (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
           (active_condition (snomed_concept "Cholera" "disorder"))
       )
  )
)

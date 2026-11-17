;; Page 60 - Constipation
(task
  "Check for urgent constipation conditions"
  adult
  (clinical_finding (snomed_concept "Constipation" "finding"))
  (check_for
    ;; Red box: no stools or flatus/wind in the past 24 hours with abdominal pain/distension
    (clinical_finding (snomed_concept "Obstipation" "disorder"))
    (clinical_finding (snomed_concept "Unable to break wind" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Distension of abdomen" "finding"))

    ;; Impaction gate: bed-bound/receiving palliative care, or overflow diarrhoea
    (clinical_finding (snomed_concept "Bed-ridden" "finding"))
    (clinical_finding (snomed_concept "Seen by palliative care service" "finding"))
    (clinical_finding (snomed_concept "Chronic constipation with overflow" "disorder"))
  )
)
(task
  "Check for faecal impaction in constipation"
  adult
  (and (clinical_finding (snomed_concept "Constipation" "finding"))
       (or (clinical_finding (snomed_concept "Bed-ridden" "finding"))
           (clinical_finding (snomed_concept "Seen by palliative care service" "finding"))
           (clinical_finding (snomed_concept "Chronic constipation with overflow" "disorder"))
       )
  )
  (check_for
    ;; Solid immobile bulk of stool in rectum
    (clinical_finding (snomed_concept "Hard stool" "finding") (finding_site (snomed_concept "Rectum structure" "body structure")))
  )
)
(task
  "Check for colorectal cancer symptoms in constipation"
  adult
  (clinical_finding (snomed_concept "Constipation" "finding"))
  (check_for
    ;; Change in bowel habits: "Altered bowel function" is an ancestor of Constipation, so it is not used
    (clinical_finding (snomed_concept "Diarrhea" "finding"))

    (clinical_finding (snomed_concept "Rectal hemorrhage" "disorder"))
    (clinical_finding (snomed_concept "Hematochezia" "finding"))

    (clinical_finding (snomed_concept "Abdominal discomfort" "finding"))
    (clinical_finding (snomed_concept "Abdominal colic" "finding"))
    (clinical_finding (snomed_concept "Flatulence symptom" "finding"))

    (clinical_finding (snomed_concept "Tenesmus of anus and/or rectum" "finding"))

    (clinical_finding (snomed_concept "Unexplained weight loss" "finding"))
    (clinical_finding (snomed_concept "Asthenia" "finding"))
    (clinical_finding (snomed_concept "Fatigue" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable faecal impaction in constipation"
  (diagnosis
    (snomed_concept "Fecal impaction" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Constipation" "finding"))
       ;; "> 65 years" cannot be expressed (no age in years in the language)
       (or (clinical_finding (snomed_concept "Bed-ridden" "finding"))
           (clinical_finding (snomed_concept "Seen by palliative care service" "finding"))
           (clinical_finding (snomed_concept "Chronic constipation with overflow" "disorder"))
       )
       (clinical_finding (snomed_concept "Hard stool" "finding") (finding_site (snomed_concept "Rectum structure" "body structure")))
  )
)
(system_diagnosis_rule
  "Diagnose possible colorectal cancer in constipation"
  (diagnosis
    (snomed_concept "Malignant neoplasm of cecum and/or colon and/or rectum" "disorder")
    possible
  )
  adult
  (and (clinical_finding (snomed_concept "Constipation" "finding"))
       (or (clinical_finding (snomed_concept "Diarrhea" "finding"))
           (clinical_finding (snomed_concept "Rectal hemorrhage" "disorder"))
           (clinical_finding (snomed_concept "Hematochezia" "finding"))
           (clinical_finding (snomed_concept "Abdominal discomfort" "finding"))
           (clinical_finding (snomed_concept "Abdominal colic" "finding"))
           (clinical_finding (snomed_concept "Flatulence symptom" "finding"))
           (clinical_finding (snomed_concept "Abdominal pain" "finding"))
           (clinical_finding (snomed_concept "Tenesmus of anus and/or rectum" "finding"))
           (clinical_finding (snomed_concept "Unexplained weight loss" "finding"))
           (clinical_finding (snomed_concept "Asthenia" "finding"))
           (clinical_finding (snomed_concept "Fatigue" "finding"))
       )
  )
)
(system_priority_evaluation
  "Urgent: constipation with no stools or flatus for 24 hours"
  adult
  Urgent
  (and (clinical_finding (snomed_concept "Constipation" "finding"))
       (>= (onset (clinical_finding (snomed_concept "Obstipation" "disorder"))) (time_ago 24 hours))
       (>= (onset (clinical_finding (snomed_concept "Unable to break wind" "finding"))) (time_ago 24 hours))
       (or (clinical_finding (snomed_concept "Abdominal pain" "finding"))
           (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
       )
  )
)

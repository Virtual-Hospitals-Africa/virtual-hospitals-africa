;; Page 60 - Constipation
(task
  "Check for urgent constipation signs"
  adult
  (clinical_finding (snomed_concept "Constipation" "finding"))
  (check_for
    ;; Red box: no stools or flatus/wind in the past 24 hours with abdominal pain/distension
    (clinical_finding (snomed_concept "Unable to break wind" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
  )
)
(task
  "Check for faecal impaction in constipation"
  adult
  (clinical_finding (snomed_concept "Constipation" "finding"))
  (check_for
    ;; Who to examine: bed-bound/receiving palliative care, or overflow diarrhoea
    (clinical_finding (snomed_concept "Bed-ridden" "finding"))
    (clinical_finding (snomed_concept "Seen by palliative care service" "finding"))
    (clinical_finding (snomed_concept "Spurious diarrhea - overflow" "finding"))

    ;; Solid immobile bulk of stool in rectum
    (clinical_finding (snomed_concept "Hard stool" "finding") (finding_site (snomed_concept "Rectum structure" "body structure")))
  )
)
(system_diagnosis_rule
  "Diagnose probable faecal impaction in constipation"
  (diagnosis
    (snomed_concept "Fecal impaction" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Constipation" "finding"))
    ;; "> 65 years" cannot be expressed (no age-in-years comparison); see remaining questions
    (or (clinical_finding (snomed_concept "Bed-ridden" "finding"))
        (clinical_finding (snomed_concept "Seen by palliative care service" "finding"))
        (clinical_finding (snomed_concept "Spurious diarrhea - overflow" "finding"))
    )
    (clinical_finding (snomed_concept "Hard stool" "finding") (finding_site (snomed_concept "Rectum structure" "body structure")))
  )
)
(system_priority_evaluation
  "Urgent: constipation with no stools or flatus for 24 hours and abdominal pain/distension"
  adult
  Urgent
  (and
    ;; No stools in the past 24 hours
    (>= (onset (clinical_finding (snomed_concept "Constipation" "finding"))) (time_ago 24 hours))
    ;; No flatus/wind in the past 24 hours
    (>= (onset (clinical_finding (snomed_concept "Unable to break wind" "finding"))) (time_ago 24 hours))
    (or (clinical_finding (snomed_concept "Abdominal pain" "finding"))
        (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
    )
  )
)

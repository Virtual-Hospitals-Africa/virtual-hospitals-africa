;; Page 54 - Gum/teeth symptoms
(task
  "Check for urgent and likely gum/teeth conditions"
  adult
  (or (clinical_finding (snomed_concept "Tooth finding" "finding"))
      (clinical_finding (snomed_concept "Gingivae finding" "finding")))
  (check_for
    ;; Red box: swelling of face/jaw/next to tooth (with temperature >= 38 °C, a routine vital)
    (clinical_finding (snomed_concept "Facial swelling" "finding"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Jaw region structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tooth, gum, and/or supporting structure" "body structure")))

    ;; Red box: unable to eat or drink
    (clinical_finding (snomed_concept "Unable to eat" "finding"))
    (clinical_finding (snomed_concept "Unable to drink" "finding"))

    ;; Red box: tooth pain felt without touching tooth/gum, or that wakes patient at night
    (clinical_finding (snomed_concept "Toothache" "finding") (qualifier (snomed_concept "Spontaneous" "qualifier value")))
    (clinical_finding (snomed_concept "Toothache" "finding") (qualifier (snomed_concept "Night time" "qualifier value")))

    ;; Dental caries: staining, holes/pits, missing teeth
    (clinical_finding (snomed_concept "Staining of tooth" "disorder"))
    (clinical_finding (snomed_concept "Cavity" "morphologic abnormality") (finding_site (snomed_concept "Tooth structure" "body structure")))
    (clinical_finding (snomed_concept "Tooth absent" "finding"))

    ;; Gum problem: gums red/bleeding or enlarged
    (clinical_finding (snomed_concept "Gingival erythema" "disorder"))
    (clinical_finding (snomed_concept "Bleeding gums" "finding"))
    (clinical_finding (snomed_concept "Gingival enlargement" "disorder"))

    ;; Dental abscess: tooth pain with pus in mouth, swelling next to tooth
    (clinical_finding (snomed_concept "Toothache" "finding"))
    (clinical_finding (snomed_concept "Pus" "morphologic abnormality") (finding_site (snomed_concept "Oral cavity structure" "body structure")))
  )
)
(system_diagnosis_rule
  "Diagnose probable dental caries (gum/teeth symptoms)"
  (diagnosis
    (snomed_concept "Dental caries" "disorder")
    probable
  )
  adult
  (or (clinical_finding (snomed_concept "Staining of tooth" "disorder"))
      (clinical_finding (snomed_concept "Cavity" "morphologic abnormality") (finding_site (snomed_concept "Tooth structure" "body structure")))
      (clinical_finding (snomed_concept "Tooth absent" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable gum problem (gum/teeth symptoms)"
  (diagnosis
    (snomed_concept "Gingival disease" "disorder")
    probable
  )
  adult
  (or (clinical_finding (snomed_concept "Gingival erythema" "disorder"))
      (clinical_finding (snomed_concept "Bleeding gums" "finding"))
      (clinical_finding (snomed_concept "Gingival enlargement" "disorder"))
  )
)
(system_diagnosis_rule
  "Diagnose probable dental abscess (gum/teeth symptoms)"
  (diagnosis
    (snomed_concept "Dental abscess" "disorder")
    probable
  )
  adult
  (and (clinical_finding (snomed_concept "Toothache" "finding"))
       (clinical_finding (snomed_concept "Pus" "morphologic abnormality") (finding_site (snomed_concept "Oral cavity structure" "body structure")))
       (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tooth, gum, and/or supporting structure" "body structure")))
  )
)
(system_priority_evaluation
  "Urgent: gum/teeth symptoms with danger signs"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Tooth finding" "finding"))
        (clinical_finding (snomed_concept "Gingivae finding" "finding")))
    (or
      (and (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
           (or (clinical_finding (snomed_concept "Facial swelling" "finding"))
               (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Jaw region structure" "body structure")))
               (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tooth, gum, and/or supporting structure" "body structure")))))
      (clinical_finding (snomed_concept "Unable to eat" "finding"))
      (clinical_finding (snomed_concept "Unable to drink" "finding"))
      (clinical_finding (snomed_concept "Toothache" "finding") (qualifier (snomed_concept "Spontaneous" "qualifier value")))
      (clinical_finding (snomed_concept "Toothache" "finding") (qualifier (snomed_concept "Night time" "qualifier value")))
    )
  )
)

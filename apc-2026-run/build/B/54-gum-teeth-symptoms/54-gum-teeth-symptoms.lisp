;; Page 54 - Gum/teeth symptoms
(task
  "Check for urgent gum/teeth conditions"
  adult
  (or (clinical_finding (snomed_concept "Tooth finding" "finding"))
      (clinical_finding (snomed_concept "Gingivae finding" "finding")))
  (check_for
    ;; Red box: temperature >= 38 (routine vital) and swelling of face/jaw/next to tooth
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Jaw region structure" "body structure")))
    (clinical_finding (snomed_concept "Swollen gums" "finding"))

    ;; Red box: unable to eat or drink
    (clinical_finding (snomed_concept "Unable to eat" "finding"))
    (clinical_finding (snomed_concept "Unable to drink" "finding"))

    ;; Red box: tooth pain felt without touching tooth/gum, or that wakes patient at night
    (clinical_finding (snomed_concept "Toothache" "finding") (qualifier (snomed_concept "Spontaneous" "qualifier value")))
    (clinical_finding (snomed_concept "Toothache" "finding") (qualifier (snomed_concept "Night time" "qualifier value")))

    ;; Approach: tooth pain; look in mouth
    (clinical_finding (snomed_concept "Toothache" "finding"))

    ;; Dental caries: brown/black staining, holes/pits, missing teeth
    (clinical_finding (snomed_concept "Staining of tooth" "disorder"))
    (clinical_finding (snomed_concept "Cavity" "morphologic abnormality") (finding_site (snomed_concept "Tooth structure" "body structure")))
    (clinical_finding (snomed_concept "Tooth loss" "finding"))

    ;; Gum problem: gums red/bleeding or enlarged
    (clinical_finding (snomed_concept "Gingival erythema" "disorder"))
    (clinical_finding (snomed_concept "Bleeding gums" "finding"))
    (clinical_finding (snomed_concept "Gingival enlargement" "disorder"))

    ;; Dental abscess: pus in mouth, swelling next to tooth (Swollen gums, above)
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
      (clinical_finding (snomed_concept "Tooth loss" "finding"))
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
       (or (clinical_finding (snomed_concept "Pus" "morphologic abnormality") (finding_site (snomed_concept "Oral cavity structure" "body structure")))
           (clinical_finding (snomed_concept "Swollen gums" "finding"))
       )
  )
)
(system_priority_evaluation
  "Urgent: gum/teeth symptoms with fever and swelling, unable to eat/drink or spontaneous/night tooth pain"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Tooth finding" "finding"))
        (clinical_finding (snomed_concept "Gingivae finding" "finding")))
    (or
      (and (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
           (or (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
               (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Jaw region structure" "body structure")))
               (clinical_finding (snomed_concept "Swollen gums" "finding"))
           )
      )
      (clinical_finding (snomed_concept "Unable to eat" "finding"))
      (clinical_finding (snomed_concept "Unable to drink" "finding"))
      (clinical_finding (snomed_concept "Toothache" "finding") (qualifier (snomed_concept "Spontaneous" "qualifier value")))
      (clinical_finding (snomed_concept "Toothache" "finding") (qualifier (snomed_concept "Night time" "qualifier value")))
    )
  )
)

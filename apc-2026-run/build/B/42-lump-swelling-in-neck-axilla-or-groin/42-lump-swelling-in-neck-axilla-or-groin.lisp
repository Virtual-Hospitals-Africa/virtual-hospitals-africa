;; Page 42 - Lump/swelling in neck, axilla or groin
(task
  "Check for causes of lump/swelling in neck, axilla or groin"
  adult
  (clinical_finding (snomed_concept "Mass of body region" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Mass of neck" "finding"))
    (clinical_finding (snomed_concept "Mass of axilla" "finding"))
    (clinical_finding (snomed_concept "Groin mass" "finding"))
    (clinical_finding (snomed_concept "Mass of skin" "finding"))

    (clinical_finding (snomed_concept "Thyroid gland moves with swallowing" "finding"))
    (clinical_finding (snomed_concept "Cough impulse of mass present" "finding"))

    (clinical_finding (snomed_concept "Recurrent abscess" "disorder"))
    (clinical_finding (snomed_concept "Abscess of axilla" "disorder"))
    (clinical_finding (snomed_concept "Abscess of groin" "disorder"))
    (clinical_finding (snomed_concept "Abscess of perineum" "disorder"))
    (clinical_finding (snomed_concept "Pain in axilla" "finding"))
    (clinical_finding (snomed_concept "Inguinal pain" "finding"))
    (clinical_finding (snomed_concept "Perineal pain" "finding"))
  )
)
;; Page 42 - Red box: lump/swelling in groin
(task
  "Check for urgent lump/swelling in groin conditions"
  adult
  (clinical_finding (snomed_concept "Groin mass" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Cough impulse of mass present" "finding"))
    (clinical_finding (snomed_concept "Severe pain" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Constipation" "finding"))
    (clinical_finding (snomed_concept "Unable to break wind" "finding"))
    (clinical_finding (snomed_concept "Groin mass" "finding") (qualifier (snomed_concept "Irreducible" "qualifier value")))

    (clinical_finding (snomed_concept "Groin mass" "finding") (qualifier (snomed_concept "Pulsatile" "qualifier value")))
  )
)
;; Page 42 - Lymphadenopathy work-up: consider mpox
(task
  "Check for mpox features in lymphadenopathy (lump in neck, axilla or groin)"
  adult
  (active_condition (snomed_concept "Lymphadenopathy" "disorder"))
  (check_for
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Monkeypox virus" "organism"))

    (clinical_finding (snomed_concept "Eruption" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Skin lesion" "disorder"))
    (clinical_finding (snomed_concept "Lesion of genitalia" "disorder"))
    (clinical_finding (snomed_concept "Lesion of rectum" "disorder"))
    (clinical_finding (snomed_concept "Oral lesion" "disorder"))
    (clinical_finding (snomed_concept "Lesion of eye" "disorder"))

    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Backache" "finding"))
    (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
    (clinical_finding (snomed_concept "Fatigue" "finding"))
    (clinical_finding (snomed_concept "Sore throat" "finding"))
    (clinical_finding (snomed_concept "Nasal congestion" "finding"))
    (clinical_finding (snomed_concept "Cough" "finding"))
  )
)
;; Page 42 - Red box: incarcerated/strangulated inguinal hernia likely
(system_diagnosis_rule
  "Diagnose probable incarcerated (irreducible) inguinal hernia, lump in groin"
  (diagnosis
    (snomed_concept "Irreducible inguinal hernia" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Groin mass" "finding"))
    ;; "gets bigger when standing/coughing/passing stool": only the cough impulse has a concept
    (clinical_finding (snomed_concept "Cough impulse of mass present" "finding"))
    (or
      (clinical_finding (snomed_concept "Severe pain" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      ;; "no stools or flatus/wind for past 24 hours"
      (and (>= (onset (clinical_finding (snomed_concept "Constipation" "finding"))) (time_ago 24 hours))
           (>= (onset (clinical_finding (snomed_concept "Unable to break wind" "finding"))) (time_ago 24 hours)))
      (clinical_finding (snomed_concept "Groin mass" "finding") (qualifier (snomed_concept "Irreducible" "qualifier value")))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable strangulated inguinal hernia, lump in groin"
  (diagnosis
    (snomed_concept "Strangulated inguinal hernia" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Groin mass" "finding"))
    (clinical_finding (snomed_concept "Cough impulse of mass present" "finding"))
    (or
      (clinical_finding (snomed_concept "Severe pain" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (and (>= (onset (clinical_finding (snomed_concept "Constipation" "finding"))) (time_ago 24 hours))
           (>= (onset (clinical_finding (snomed_concept "Unable to break wind" "finding"))) (time_ago 24 hours)))
      (clinical_finding (snomed_concept "Groin mass" "finding") (qualifier (snomed_concept "Irreducible" "qualifier value")))
    )
  )
)
;; Page 42 - Red box: pulsating lump, aneurysm likely
(system_diagnosis_rule
  "Diagnose probable aneurysm, pulsating lump in groin"
  (diagnosis
    (snomed_concept "Aneurysm" "disorder")
    probable
  )
  adult
  (clinical_finding (snomed_concept "Groin mass" "finding") (qualifier (snomed_concept "Pulsatile" "qualifier value")))
)
;; Page 42 - Approach (not needing urgent attention)
(system_diagnosis_rule
  "Diagnose probable thyroid mass, lump in neck moving on swallowing"
  (diagnosis
    (snomed_concept "Mass of thyroid gland" "finding")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Mass of neck" "finding"))
    (clinical_finding (snomed_concept "Thyroid gland moves with swallowing" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable inguinal hernia, lump in groin"
  (diagnosis
    (snomed_concept "Inguinal hernia" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Groin mass" "finding"))
    (clinical_finding (snomed_concept "Cough impulse of mass present" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable hidradenitis suppurativa, recurrent painful abscesses"
  (diagnosis
    (snomed_concept "Hidradenitis suppurativa" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Recurrent abscess" "disorder"))
    (or
      (and (clinical_finding (snomed_concept "Abscess of axilla" "disorder"))
           (clinical_finding (snomed_concept "Pain in axilla" "finding")))
      (and (clinical_finding (snomed_concept "Abscess of groin" "disorder"))
           (clinical_finding (snomed_concept "Inguinal pain" "finding")))
      (and (clinical_finding (snomed_concept "Abscess of perineum" "disorder"))
           (clinical_finding (snomed_concept "Perineal pain" "finding")))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable lymphadenopathy, lump in neck, axilla or groin"
  (diagnosis
    (snomed_concept "Lymphadenopathy" "disorder")
    probable
  )
  adult
  (and
    (or
      (clinical_finding (snomed_concept "Mass of neck" "finding"))
      (clinical_finding (snomed_concept "Mass of axilla" "finding"))
      (clinical_finding (snomed_concept "Groin mass" "finding"))
    )
    ;; "If none of above": not on the skin, not thyroid, not hernia, not hidradenitis
    (no (clinical_finding (snomed_concept "Mass of skin" "finding")))
    (no (clinical_finding (snomed_concept "Thyroid gland moves with swallowing" "finding")))
    (no (clinical_finding (snomed_concept "Cough impulse of mass present" "finding")))
    (no (clinical_finding (snomed_concept "Recurrent abscess" "disorder")))
  )
)
;; Page 42 - Lymphadenopathy work-up: consider mpox
(system_diagnosis_rule
  "Diagnose possible mpox in lymphadenopathy (lump in neck, axilla or groin)"
  (diagnosis
    (snomed_concept "Monkeypox" "disorder")
    possible
  )
  adult
  (and
    (active_condition (snomed_concept "Lymphadenopathy" "disorder"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Monkeypox virus" "organism"))
    (or
      (clinical_finding (snomed_concept "Eruption" "morphologic abnormality"))
      (clinical_finding (snomed_concept "Skin lesion" "disorder"))
      (clinical_finding (snomed_concept "Lesion of genitalia" "disorder"))
      (clinical_finding (snomed_concept "Lesion of rectum" "disorder"))
      (clinical_finding (snomed_concept "Oral lesion" "disorder"))
      (clinical_finding (snomed_concept "Lesion of eye" "disorder"))
    )
    (or
      (clinical_finding (snomed_concept "Headache" "finding"))
      (clinical_finding (snomed_concept "Backache" "finding"))
      (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
      (> (measurement (snomed_concept "Body temperature" "observable entity") °C) 38.5)
      (clinical_finding (snomed_concept "Fatigue" "finding"))
      (clinical_finding (snomed_concept "Sore throat" "finding"))
      (clinical_finding (snomed_concept "Nasal congestion" "finding"))
      (clinical_finding (snomed_concept "Cough" "finding"))
    )
  )
)
(system_priority_evaluation
  "Urgent: lump/swelling in groin with incarcerated/strangulated hernia or aneurysm"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Groin mass" "finding"))
    (or
      (active_condition (snomed_concept "Irreducible inguinal hernia" "disorder"))
      (active_condition (snomed_concept "Strangulated inguinal hernia" "disorder"))
      (active_condition (snomed_concept "Aneurysm" "disorder"))
    )
  )
)

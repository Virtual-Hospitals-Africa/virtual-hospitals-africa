;; Page 42 - Lump/swelling in neck, axilla or groin

;; Where is the lump? (the presenting complaint is the common symptom "Lump" = Mass of body region)
(task
  "Check for site of lump/swelling in neck, axilla or groin"
  adult
  (clinical_finding (snomed_concept "Mass of body region" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Mass of neck" "finding"))
    (clinical_finding (snomed_concept "Mass of axilla" "finding"))
    (clinical_finding (snomed_concept "Groin mass" "finding"))

    (clinical_finding (snomed_concept "Mass of skin" "finding"))
    (clinical_finding (snomed_concept "Recurrent abscess" "disorder") (finding_site (snomed_concept "Perineal structure" "body structure")))
  )
)

;; Red box: lump/swelling in groin
(task
  "Check for urgent lump/swelling in groin conditions"
  adult
  (clinical_finding (snomed_concept "Groin mass" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Cough impulse in inguinal canal" "finding"))
    (clinical_finding (snomed_concept "Severe pain" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Obstipation" "disorder"))
    (clinical_finding (snomed_concept "Groin mass" "finding") (qualifier (snomed_concept "Irreducible" "qualifier value")))

    (clinical_finding (snomed_concept "Groin mass" "finding") (qualifier (snomed_concept "Pulsatile" "qualifier value")))

    (clinical_finding (snomed_concept "Recurrent abscess" "disorder") (finding_site (snomed_concept "Inguinal region structure" "body structure")))
  )
)

;; Approach box: lump in neck
(task
  "Check for thyroid mass in patient with lump/swelling in neck"
  adult
  (clinical_finding (snomed_concept "Mass of neck" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Thyroid gland moves with swallowing" "finding"))
  )
)

;; Approach box: lump in axilla
(task
  "Check for hidradenitis suppurativa in patient with lump/swelling in axilla"
  adult
  (clinical_finding (snomed_concept "Mass of axilla" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Recurrent abscess" "disorder") (finding_site (snomed_concept "Axillary region structure" "body structure")))
  )
)

;; Lymphadenopathy, "Is medication or infective cause likely?" = No: mpox
(task
  "Check for mpox in patient with lymphadenopathy"
  adult
  (active_condition (snomed_concept "Lymphadenopathy" "disorder"))
  (check_for
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Monkeypox virus" "organism"))

    (clinical_finding (snomed_concept "Eruption" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Skin lesion" "disorder"))
    (clinical_finding (snomed_concept "Lesion of genitalia" "disorder"))
    (clinical_finding (snomed_concept "Skin lesion" "disorder") (finding_site (snomed_concept "Anal structure" "body structure")))
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

;; Red box: "incarcerated/strangulated inguinal hernia likely"
(system_diagnosis_rule
  "Diagnose probable incarcerated/strangulated inguinal hernia from lump in groin"
  (diagnosis
    (snomed_concept "Irreducible inguinal hernia" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Groin mass" "finding"))
    (clinical_finding (snomed_concept "Cough impulse in inguinal canal" "finding"))
    (or
      (clinical_finding (snomed_concept "Severe pain" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (>= (onset (clinical_finding (snomed_concept "Obstipation" "disorder"))) (time_ago 24 hours))
      (clinical_finding (snomed_concept "Groin mass" "finding") (qualifier (snomed_concept "Irreducible" "qualifier value")))
    )
  )
)

;; Red box: "Pulsating lump: aneurysm likely"
(system_diagnosis_rule
  "Diagnose probable aneurysm from pulsating lump in groin"
  (diagnosis
    (snomed_concept "Aneurysm" "disorder")
    probable
  )
  adult
  (clinical_finding (snomed_concept "Groin mass" "finding") (qualifier (snomed_concept "Pulsatile" "qualifier value")))
)

;; Approach box: "Thyroid mass likely if lump in neck that moves up when patient swallows"
(system_diagnosis_rule
  "Diagnose probable thyroid mass from lump in neck"
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

;; Approach box: "Inguinal hernia likely if lump in groin that gets bigger when standing/coughing/passing stools"
(system_diagnosis_rule
  "Diagnose probable inguinal hernia from lump in groin"
  (diagnosis
    (snomed_concept "Inguinal hernia" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Groin mass" "finding"))
    (clinical_finding (snomed_concept "Cough impulse in inguinal canal" "finding"))
  )
)

;; Approach box: "Hidradenitis suppurativa likely if recurrent, painful abscesses in axilla, groin or perineum"
(system_diagnosis_rule
  "Diagnose probable hidradenitis suppurativa from recurrent abscesses in axilla, groin or perineum"
  (diagnosis
    (snomed_concept "Hidradenitis suppurativa" "disorder")
    probable
  )
  adult
  (or
    (clinical_finding (snomed_concept "Recurrent abscess" "disorder") (finding_site (snomed_concept "Axillary region structure" "body structure")))
    (clinical_finding (snomed_concept "Recurrent abscess" "disorder") (finding_site (snomed_concept "Inguinal region structure" "body structure")))
    (clinical_finding (snomed_concept "Recurrent abscess" "disorder") (finding_site (snomed_concept "Perineal structure" "body structure")))
  )
)

;; Approach box: "If none of above: a lump in neck, axilla or groin is likely an enlarged lymph node (lymphadenopathy)"
(system_diagnosis_rule
  "Diagnose probable lymphadenopathy from lump in neck, axilla or groin"
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
    (no (clinical_finding (snomed_concept "Mass of skin" "finding")))
    (no (clinical_finding (snomed_concept "Thyroid gland moves with swallowing" "finding")))
    (no (clinical_finding (snomed_concept "Cough impulse in inguinal canal" "finding")))
    (no (clinical_finding (snomed_concept "Recurrent abscess" "disorder") (finding_site (snomed_concept "Axillary region structure" "body structure"))))
    (no (clinical_finding (snomed_concept "Recurrent abscess" "disorder") (finding_site (snomed_concept "Inguinal region structure" "body structure"))))
    (no (clinical_finding (snomed_concept "Recurrent abscess" "disorder") (finding_site (snomed_concept "Perineal structure" "body structure"))))
  )
)

;; "consider mpox": contact with a probable/confirmed mpox case, unexplained rash or lesion/s, and >= 1 systemic symptom
(system_diagnosis_rule
  "Diagnose possible mpox in patient with lymphadenopathy"
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
      (clinical_finding (snomed_concept "Skin lesion" "disorder") (finding_site (snomed_concept "Anal structure" "body structure")))
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

;; Red box: "Give urgent attention to the patient with lump/swelling in groin and any of: ... Refer urgently."
(system_priority_evaluation
  "Urgent: lump/swelling in groin with incarcerated/strangulated hernia or aneurysm"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Groin mass" "finding"))
    (or
      (active_condition (snomed_concept "Irreducible inguinal hernia" "disorder"))
      (active_condition (snomed_concept "Aneurysm" "disorder"))
    )
  )
)

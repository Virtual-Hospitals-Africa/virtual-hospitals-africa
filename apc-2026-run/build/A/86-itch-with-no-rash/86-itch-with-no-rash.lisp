;; Page 86 - Itch with no rash
;; Red box is a pointer only: "Check if the patient needs urgent attention 82" (no priority evaluation here).
;; The rules below follow the page's flowchart (see 86-itch-with-no-rash-flowchart.md).
(task
  "Check for causes of itch with no rash"
  adult
  (clinical_finding (snomed_concept "Itching" "finding"))
  (check_for
    ;; Confirm there is no rash, scabies, lice or insect bites
    (clinical_finding (snomed_concept "Eruption" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Infestation caused by Sarcoptes scabiei var hominis" "disorder"))
    (clinical_finding (snomed_concept "Infestation caused by Pediculus" "disorder"))
    (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))

    ;; Is the skin very dry?
    (clinical_finding (snomed_concept "Severe dry skin" "disorder"))

    ;; Did the patient start any new medication in the weeks before the itch started?
    (clinical_finding (snomed_concept "New medication commenced" "finding"))

    ;; If yellow skin/eyes, jaundice likely
    (clinical_finding (snomed_concept "Yellow skin" "finding"))
    (clinical_finding (snomed_concept "Scleral icterus" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable dry skin causing itch with no rash"
  (diagnosis
    (snomed_concept "Xeroderma" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Itching" "finding"))
    (no (clinical_finding (snomed_concept "Eruption" "morphologic abnormality")))
    (no (clinical_finding (snomed_concept "Infestation caused by Sarcoptes scabiei var hominis" "disorder")))
    (no (clinical_finding (snomed_concept "Infestation caused by Pediculus" "disorder")))
    (no (clinical_finding (snomed_concept "Insect bite - wound" "disorder")))
    ;; Is the skin very dry? = Yes
    (clinical_finding (snomed_concept "Severe dry skin" "disorder"))
  )
)
(system_diagnosis_rule
  "Diagnose probable medication side-effect causing itch with no rash"
  (diagnosis
    (snomed_concept "Adverse reaction caused by drug" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Itching" "finding"))
    (no (clinical_finding (snomed_concept "Eruption" "morphologic abnormality")))
    (no (clinical_finding (snomed_concept "Infestation caused by Sarcoptes scabiei var hominis" "disorder")))
    (no (clinical_finding (snomed_concept "Infestation caused by Pediculus" "disorder")))
    (no (clinical_finding (snomed_concept "Insect bite - wound" "disorder")))
    ;; Is the skin very dry? = No
    (no (clinical_finding (snomed_concept "Severe dry skin" "disorder")))
    ;; New medication in the weeks before the itch started = Yes
    (clinical_finding (snomed_concept "New medication commenced" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable jaundice in itch with no rash"
  (diagnosis
    (snomed_concept "Jaundice" "finding")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Itching" "finding"))
    (no (clinical_finding (snomed_concept "Eruption" "morphologic abnormality")))
    (no (clinical_finding (snomed_concept "Infestation caused by Sarcoptes scabiei var hominis" "disorder")))
    (no (clinical_finding (snomed_concept "Infestation caused by Pediculus" "disorder")))
    (no (clinical_finding (snomed_concept "Insect bite - wound" "disorder")))
    ;; Is the skin very dry? = No; new medication = No
    (no (clinical_finding (snomed_concept "Severe dry skin" "disorder")))
    (no (clinical_finding (snomed_concept "New medication commenced" "finding")))
    ;; If yellow skin/eyes
    (or (clinical_finding (snomed_concept "Yellow skin" "finding"))
        (clinical_finding (snomed_concept "Scleral icterus" "finding")))
  )
)

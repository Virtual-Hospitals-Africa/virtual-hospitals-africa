;; Page 170 - Contraception
;; The red box (emergency contraception) is management only: indication, pregnancy test,
;; Copper IUD / levonorgestrel choice and doses, PEP assessment. No manage tasks in this pass,
;; so it is accounted for as management_step in the provenance file.
;; The page's diagnostic logic is the Pregnancy row of the assessment table:
;; "if pregnancy suspected (nausea/breast tenderness/missed period when using combined oral
;; contraceptive), check for pregnancy 174".
(task
  "Check for suspected pregnancy on combined oral contraceptive"
  adult
  (clinical_finding (snomed_concept "Uses combined oral contraception" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Tenderness of breast" "finding"))
    (clinical_finding (snomed_concept "Missed period" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose possible pregnancy on combined oral contraceptive"
  (diagnosis
    (snomed_concept "Pregnancy" "finding")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Uses combined oral contraception" "finding"))
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Tenderness of breast" "finding"))
        (clinical_finding (snomed_concept "Missed period" "finding"))
    )
  )
)

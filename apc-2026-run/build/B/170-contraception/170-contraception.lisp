;; Page 170 - Contraception
;; The red box (emergency contraception after unprotected sex in the past 5 days) is management only:
;; pregnancy test, Copper IUD / levonorgestrel choice and dose, PEP referral. No manage tasks in this
;; pass, so it is accounted for in provenance, not encoded. See 170-contraception-remaining-questions.md.
;; The page's one "suspected" logic is in the Pregnancy row of the assessment table:
;; "if pregnancy suspected (nausea/breast tenderness/missed period when using combined oral contraceptive)".
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
    (or
      (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Tenderness of breast" "finding"))
      (clinical_finding (snomed_concept "Missed period" "finding"))
    )
  )
)

;; Cross-cutting: low blood pressure is classified from the routine systolic/diastolic measurements
;; (health workers take those rather than entering "Low blood pressure"), the way Fever is
;; classified from body temperature. Thresholds: SBP < 90 or DBP < 60 (BP < 90/60), as elsewhere in the APC rules.
(system_diagnosis_rule
  "Diagnose low blood pressure"
  (diagnosis
    (snomed_concept "Low blood pressure" "disorder")
    definite
  )
  adult
  (or
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
    (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
  )
)

;; Cross-cutting: Stroke/TIA signs
(system_diagnosis_rule
  "Diagnose possible stroke or TIA"
  (diagnosis
    (snomed_concept "Cerebrovascular accident" "disorder")
    possible
  )
  adult
  (and
    (or
      (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
      (clinical_finding (snomed_concept "Generalized muscle weakness" "finding"))
    )
    (or
      (clinical_finding (snomed_concept "Difficulty talking" "finding"))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
    )
  )
)

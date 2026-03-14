;; Page 22 - Bites and Stings: snake bite poisoning
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Poisoning caused by venomous snake" "disorder")
    possible
  )
  adult
  (or
    (clinical_finding (snomed_concept "Snake bite - wound" "disorder"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Snake venom" "substance"))
  )
)

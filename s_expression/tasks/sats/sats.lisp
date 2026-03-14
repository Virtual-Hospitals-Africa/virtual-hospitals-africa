(task
  "Check Sp0₂ if respiratory rate < 9 bpm"
  adult
  (< (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 9)
  (measure (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %))
)
(task
  "Check Sp0₂ if respiratory rate >= 15 bpm"
  adult
  (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 15)
  (measure (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %))
)
(task
  "Give oxygen if saturation below 92%"
  adult
  (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %) 92)
  (procedure (snomed_concept "Procedure" "procedure") (snomed_concept "Oxygen therapy" "procedure"))
)
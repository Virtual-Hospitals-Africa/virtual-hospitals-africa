// Auto-generated from system_priority_evaluations.lisp
// Do not edit manually

export const SYSTEM_PRIORITY_EVALUATIONS = [
  `(system_priority_evaluation (ages "adult" "older child" "younger child") "Emergency" (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3))`,
  `(system_priority_evaluation (ages "older child" "younger child") "Emergency" (and (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Cold hands" "finding")) (any2 (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Weak arterial pulse" "finding")) (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pulse fast" "finding")) (finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Lethargy" "finding")))))`,
  `(system_priority_evaluation (ages "adult" "older child" "younger child") "Urgent" (diagnosis (snomed_concept "Anaphylaxis" "disorder") probable))`,
]

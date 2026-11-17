;; Page 102 - Tuberculosis (TB): Diagnosis
(task
  "Check for urgent suspected TB conditions"
  adult
  (diagnosis (snomed_concept "Tuberculosis" "disorder") possible)
  (check_for
    (clinical_finding (snomed_concept "Dyspnea at rest" "finding"))
    (clinical_finding (snomed_concept "Unable to complete a sentence in one breath" "finding"))
    (clinical_finding (snomed_concept "Accessory respiratory muscles used" "finding"))
    (clinical_finding (snomed_concept "Hemoptysis" "finding"))

    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding") (qualifier (snomed_concept "New" "qualifier value")))

    (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))
    (clinical_finding (snomed_concept "Unable to walk" "finding"))
    (clinical_finding (snomed_concept "Deficiency of macronutrients" "disorder") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Nutritional wasting" "disorder"))
  )
)
(system_diagnosis_rule
  "Diagnose possible TB from TB symptoms, TB contact or abnormal screening CXR"
  (diagnosis
    (snomed_concept "Tuberculosis" "disorder")
    possible
  )
  adult
  (or
    ;; TB symptoms: current cough, weight loss, drenching night sweats or fever
    (clinical_finding (snomed_concept "Cough" "finding"))
    (clinical_finding (snomed_concept "Weight decreased" "finding"))
    (clinical_finding (snomed_concept "Night sweats" "finding"))
    (active_condition (snomed_concept "Fever" "finding"))
    ;; Test even in the absence of symptoms: TB contact; abnormal digital CXR + CAD screening
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Mycobacterium tuberculosis complex" "organism"))
    (clinical_finding (snomed_concept "Plain X-ray of chest for tuberculosis screening abnormal" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: suspected TB with respiratory rate ≥ 30 bpm"
  adult
  Urgent
  (and
    (diagnosis (snomed_concept "Tuberculosis" "disorder") possible)
    (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
  )
)

(system_priority_evaluation
  "Urgent: suspected TB with pulse, function > 120 bpm"
  adult
  Urgent
  (and
    (diagnosis (snomed_concept "Tuberculosis" "disorder") possible)
    (> (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 120)
  )
)

(system_priority_evaluation
  "Urgent: suspected TB with body temperature > 39 °C"
  adult
  Urgent
  (and
    (diagnosis (snomed_concept "Tuberculosis" "disorder") possible)
    (> (measurement (snomed_concept "Body temperature" "observable entity") °C) 39)
  )
)

(system_priority_evaluation
  "Urgent: suspected TB with dyspnea at rest"
  adult
  Urgent
  (and
    (diagnosis (snomed_concept "Tuberculosis" "disorder") possible)
    (clinical_finding (snomed_concept "Dyspnea at rest" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: suspected TB with unable to complete a sentence in one breath"
  adult
  Urgent
  (and
    (diagnosis (snomed_concept "Tuberculosis" "disorder") possible)
    (clinical_finding (snomed_concept "Unable to complete a sentence in one breath" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: suspected TB with accessory respiratory muscles used"
  adult
  Urgent
  (and
    (diagnosis (snomed_concept "Tuberculosis" "disorder") possible)
    (clinical_finding (snomed_concept "Accessory respiratory muscles used" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: suspected TB with hemoptysis"
  adult
  Urgent
  (and
    (diagnosis (snomed_concept "Tuberculosis" "disorder") possible)
    (clinical_finding (snomed_concept "Hemoptysis" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: suspected TB with drowsy"
  adult
  Urgent
  (and
    (diagnosis (snomed_concept "Tuberculosis" "disorder") possible)
    (clinical_finding (snomed_concept "Drowsy" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: suspected TB with acute confusion"
  adult
  Urgent
  (and
    (diagnosis (snomed_concept "Tuberculosis" "disorder") possible)
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: suspected TB with stiff neck"
  adult
  Urgent
  (and
    (diagnosis (snomed_concept "Tuberculosis" "disorder") possible)
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: suspected TB with muscle weakness of limb (new)"
  adult
  Urgent
  (and
    (diagnosis (snomed_concept "Tuberculosis" "disorder") possible)
    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding") (qualifier (snomed_concept "New" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: suspected TB with persistent vomiting"
  adult
  Urgent
  (and
    (diagnosis (snomed_concept "Tuberculosis" "disorder") possible)
    (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: suspected TB with unable to walk"
  adult
  Urgent
  (and
    (diagnosis (snomed_concept "Tuberculosis" "disorder") possible)
    (clinical_finding (snomed_concept "Unable to walk" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: suspected TB with deficiency of macronutrients (severe)"
  adult
  Urgent
  (and
    (diagnosis (snomed_concept "Tuberculosis" "disorder") possible)
    (clinical_finding (snomed_concept "Deficiency of macronutrients" "disorder") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: suspected TB with nutritional wasting"
  adult
  Urgent
  (and
    (diagnosis (snomed_concept "Tuberculosis" "disorder") possible)
    (clinical_finding (snomed_concept "Nutritional wasting" "disorder"))
  )
)

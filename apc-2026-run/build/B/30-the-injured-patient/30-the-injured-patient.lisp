;; Page 30 - The injured patient
(task
  "Check for urgent conditions in the injured patient"
  adult
  (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
  (check_for
    ;; The four red-box sub-boxes: bruising and blood in urine, wound, fracture, head injury
    (clinical_finding (snomed_concept "Contusion" "disorder"))
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Wound" "disorder"))
    (clinical_finding (snomed_concept "Fracture of bone" "disorder"))
    (clinical_finding (snomed_concept "Injury of head" "disorder"))

    ;; Footnote 1: signs that make shock likely (SBP, pulse and respiratory rate are routine vitals)
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Restlessness" "finding"))
    (clinical_finding (snomed_concept "Asthenia" "finding"))
  )
)
(task
  "Check for urgent wound conditions in the injured patient"
  adult
  (clinical_finding (snomed_concept "Wound" "disorder"))
  (check_for
    ;; Poor perfusion (cold, pale, numb, no pulse) below injury
    (clinical_finding (snomed_concept "Cold extremity" "finding"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Peripheral pulse absent" "finding"))

    ;; Excessive or pulsatile bleeding
    (clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Excessive" "qualifier value")))
    (clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Pulsatile" "qualifier value")))

    ;; Penetrating wound to head/neck/chest/abdomen
    (clinical_finding (snomed_concept "Penetrating wound" "disorder") (finding_site (snomed_concept "Head structure" "body structure")))
    (clinical_finding (snomed_concept "Penetrating wound of neck" "disorder"))
    (clinical_finding (snomed_concept "Penetrating wound" "disorder") (finding_site (snomed_concept "Thoracic structure" "body structure")))
    (clinical_finding (snomed_concept "Penetrating wound of abdomen" "disorder"))
  )
)
(task
  "Check for urgent fracture conditions in the injured patient"
  adult
  (clinical_finding (snomed_concept "Fracture of bone" "disorder"))
  (check_for
    ;; Poor perfusion (cold, pale, numb, no pulse) below fracture; weak/numb below fracture
    (clinical_finding (snomed_concept "Cold extremity" "finding"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Peripheral pulse absent" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))

    ;; Increasing pain, muscle tightness, numbness in limb
    (clinical_finding (snomed_concept "Pain in limb" "finding") (qualifier (snomed_concept "Increasing" "qualifier value")))

    ;; Suspected femur, pelvis or spine fracture
    (clinical_finding (snomed_concept "Fracture of femur" "disorder"))
    (clinical_finding (snomed_concept "Fracture of pelvis" "disorder"))
    (clinical_finding (snomed_concept "Fracture of vertebral column" "disorder"))

    ;; Open fracture; severe deformity
    (clinical_finding (snomed_concept "Fracture, open" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Deformity" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))

    ;; > 2 rib fractures
    (clinical_finding (snomed_concept "Fracture of three ribs" "disorder"))
    (clinical_finding (snomed_concept "Fracture of four ribs" "disorder"))
    (clinical_finding (snomed_concept "Fracture of five ribs" "disorder"))
    (clinical_finding (snomed_concept "Fracture of six ribs" "disorder"))
    (clinical_finding (snomed_concept "Fracture of seven ribs" "disorder"))
    (clinical_finding (snomed_concept "Fracture of eight OR more ribs" "disorder"))
  )
)
(task
  "Check for urgent head injury conditions in the injured patient"
  adult
  (clinical_finding (snomed_concept "Injury of head" "disorder"))
  (check_for
    ;; Consciousness, seizure, headache, amnesia
    (clinical_finding (snomed_concept "Loss of consciousness" "finding"))
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Amnesia" "finding"))

    ;; Signs of skull fracture
    (clinical_finding (snomed_concept "Fracture of skull" "disorder"))
    (clinical_finding (snomed_concept "Ecchymosis of periorbital region" "disorder"))
    (clinical_finding (snomed_concept "Ecchymosis of postauricular region" "finding"))
    (clinical_finding (snomed_concept "Hematotympanum" "disorder"))
    (clinical_finding (snomed_concept "Bleeding from nose" "finding"))
    (clinical_finding (snomed_concept "Bleeding from ear" "disorder"))
    (clinical_finding (snomed_concept "Cerebrospinal fluid rhinorrhea" "disorder"))
    (clinical_finding (snomed_concept "Cerebrospinal fluid otorrhea" "disorder"))

    ;; Neurological signs
    (clinical_finding (snomed_concept "Anisocoria" "disorder"))
    (clinical_finding (snomed_concept "Abnormal pupil reaction" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))

    ;; Other injuries and intoxication
    (clinical_finding (snomed_concept "Multiple injuries" "disorder"))
    (clinical_finding (snomed_concept "Intoxication" "disorder"))

    ;; Head injury not needing urgent attention: concussion likely
    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Mild" "qualifier value")))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable shock in the injured patient"
  (diagnosis
    (snomed_concept "Shock" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
        (clinical_finding (snomed_concept "Wound" "disorder"))
        (clinical_finding (snomed_concept "Fracture of bone" "disorder"))
        (clinical_finding (snomed_concept "Injury of head" "disorder"))
    )
    ;; Footnote 1: "If SBP < 80, pulse >= 100, respiratory rate > 30, confusion/restlessness, weakness, shock likely"
    (or (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
        (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
        (> (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
        (clinical_finding (snomed_concept "Acute confusion" "finding"))
        (clinical_finding (snomed_concept "Restlessness" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable concussion after head injury"
  (diagnosis
    (snomed_concept "Concussion injury of brain" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Injury of head" "disorder"))
    ;; "If mild headache, dizziness or mental fogginess, concussion likely"
    (or (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Mild" "qualifier value")))
        (clinical_finding (snomed_concept "Dizziness" "finding"))
        (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    )
  )
)
(system_priority_evaluation
  "Urgent: injured patient with bruising and blood in urine"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Contusion" "disorder"))
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
  )
)
(system_priority_evaluation
  "Urgent: injured patient with wound and poor perfusion, severe bleeding or penetrating wound"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Wound" "disorder"))
    (or
      ;; Poor perfusion (cold, pale, numb, no pulse) below injury
      (clinical_finding (snomed_concept "Cold extremity" "finding"))
      (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
      (clinical_finding (snomed_concept "Peripheral pulse absent" "finding"))
      ;; Excessive or pulsatile bleeding
      (clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Excessive" "qualifier value")))
      (clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Pulsatile" "qualifier value")))
      ;; Penetrating wound to head/neck/chest/abdomen
      (clinical_finding (snomed_concept "Penetrating wound" "disorder") (finding_site (snomed_concept "Head structure" "body structure")))
      (clinical_finding (snomed_concept "Penetrating wound of neck" "disorder"))
      (clinical_finding (snomed_concept "Penetrating wound" "disorder") (finding_site (snomed_concept "Thoracic structure" "body structure")))
      (clinical_finding (snomed_concept "Penetrating wound of abdomen" "disorder"))
    )
  )
)
(system_priority_evaluation
  "Urgent: injured patient with fracture and danger signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Fracture of bone" "disorder"))
    (or
      ;; Poor perfusion (cold, pale, numb, no pulse) below fracture; weak/numb below fracture
      (clinical_finding (snomed_concept "Cold extremity" "finding"))
      (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
      (clinical_finding (snomed_concept "Peripheral pulse absent" "finding"))
      (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
      ;; Increasing pain, muscle tightness, numbness in limb
      (clinical_finding (snomed_concept "Pain in limb" "finding") (qualifier (snomed_concept "Increasing" "qualifier value")))
      ;; Suspected femur, pelvis or spine fracture
      (clinical_finding (snomed_concept "Fracture of femur" "disorder"))
      (clinical_finding (snomed_concept "Fracture of pelvis" "disorder"))
      (clinical_finding (snomed_concept "Fracture of vertebral column" "disorder"))
      ;; Open fracture; severe deformity
      (clinical_finding (snomed_concept "Fracture, open" "morphologic abnormality"))
      (clinical_finding (snomed_concept "Deformity" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      ;; > 2 rib fractures
      (clinical_finding (snomed_concept "Fracture of three ribs" "disorder"))
      (clinical_finding (snomed_concept "Fracture of four ribs" "disorder"))
      (clinical_finding (snomed_concept "Fracture of five ribs" "disorder"))
      (clinical_finding (snomed_concept "Fracture of six ribs" "disorder"))
      (clinical_finding (snomed_concept "Fracture of seven ribs" "disorder"))
      (clinical_finding (snomed_concept "Fracture of eight OR more ribs" "disorder"))
    )
  )
)
(system_priority_evaluation
  "Urgent: injured patient with head injury and danger signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Injury of head" "disorder"))
    (or
      (clinical_finding (snomed_concept "Loss of consciousness" "finding"))
      (clinical_finding (snomed_concept "Seizure" "finding"))
      (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      (clinical_finding (snomed_concept "Amnesia" "finding"))
      (clinical_finding (snomed_concept "Fracture of skull" "disorder"))
      ;; Bruising around eyes or behind ears
      (clinical_finding (snomed_concept "Ecchymosis of periorbital region" "disorder"))
      (clinical_finding (snomed_concept "Ecchymosis of postauricular region" "finding"))
      ;; Blood behind eardrum
      (clinical_finding (snomed_concept "Hematotympanum" "disorder"))
      ;; Blood/clear fluid leaking from nose/ear
      (clinical_finding (snomed_concept "Bleeding from nose" "finding"))
      (clinical_finding (snomed_concept "Bleeding from ear" "disorder"))
      (clinical_finding (snomed_concept "Cerebrospinal fluid rhinorrhea" "disorder"))
      (clinical_finding (snomed_concept "Cerebrospinal fluid otorrhea" "disorder"))
      ;; Pupils unequal or respond poorly to light
      (clinical_finding (snomed_concept "Anisocoria" "disorder"))
      (clinical_finding (snomed_concept "Abnormal pupil reaction" "finding"))
      ;; Weak/numb limb/s
      (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
      (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
      ;; Vomiting >= 2 times (count not representable)
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      ;; >= 1 other injury
      (clinical_finding (snomed_concept "Multiple injuries" "disorder"))
      ;; Drug/alcohol intoxication
      (clinical_finding (snomed_concept "Intoxication" "disorder"))
    )
  )
)

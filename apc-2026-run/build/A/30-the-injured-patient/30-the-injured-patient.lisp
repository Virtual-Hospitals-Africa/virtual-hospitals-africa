;; Page 30 - The injured patient
;; Red box: "Give urgent attention to the injured patient:" with four groups
;; (Bruising and blood in urine / Wound and any of / Fracture and any of / Head injury and any of).
;; Footnote 1 (shock likely) and the lower "Head injury" box (concussion likely) give the
;; diagnosis rules. Management (fluids, morphine, splinting, collar, referral, monitoring) is not encoded.

(task
  "Check for urgent injured patient conditions"
  adult
  (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
  (check_for
    ;; Which kind of injury (each opens its own red-box group)
    (clinical_finding (snomed_concept "Wound" "disorder"))
    (clinical_finding (snomed_concept "Fracture of bone" "disorder"))
    (clinical_finding (snomed_concept "Injury of head" "disorder"))

    ;; Bruising and blood in urine
    (clinical_finding (snomed_concept "Contusion" "disorder"))
    (clinical_finding (snomed_concept "Blood in urine" "finding"))

    ;; Footnote 1: shock likely
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
    (clinical_finding (snomed_concept "Limb ischemia" "disorder"))
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
    ;; Poor perfusion (cold, pale, numb, no pulse) below fracture
    (clinical_finding (snomed_concept "Limb ischemia" "disorder"))
    (clinical_finding (snomed_concept "Peripheral pulse absent" "finding"))

    ;; Increasing pain, muscle tightness, numbness in limb / Weak/numb below fracture
    (clinical_finding (snomed_concept "Pain in limb" "finding") (qualifier (snomed_concept "Increasing" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))

    ;; Suspected femur, pelvis or spine fracture
    (clinical_finding (snomed_concept "Fracture of femur" "disorder"))
    (clinical_finding (snomed_concept "Fracture of pelvis" "disorder"))
    (clinical_finding (snomed_concept "Fracture of vertebral column" "disorder"))

    ;; Open fracture / > 2 rib fractures / Severe deformity
    (clinical_finding (snomed_concept "Fracture, open" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Fracture of three ribs" "disorder"))
    (clinical_finding (snomed_concept "Fracture of four ribs" "disorder"))
    (clinical_finding (snomed_concept "Fracture of five ribs" "disorder"))
    (clinical_finding (snomed_concept "Fracture of six ribs" "disorder"))
    (clinical_finding (snomed_concept "Fracture of seven ribs" "disorder"))
    (clinical_finding (snomed_concept "Fracture of eight OR more ribs" "disorder"))
    (clinical_finding (snomed_concept "Deformity" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
  )
)
(task
  "Check for urgent head injury conditions in the injured patient"
  adult
  (clinical_finding (snomed_concept "Injury of head" "disorder"))
  (check_for
    ;; Consciousness and seizure
    (clinical_finding (snomed_concept "Loss of consciousness" "finding"))
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Amnesia" "finding"))

    ;; Headache, vomiting
    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))

    ;; Signs of skull fracture
    (clinical_finding (snomed_concept "Fracture of skull" "disorder"))
    (clinical_finding (snomed_concept "Ecchymosis of periorbital region" "disorder"))
    (clinical_finding (snomed_concept "Ecchymosis of postauricular region" "finding"))
    (clinical_finding (snomed_concept "Hematotympanum" "disorder"))
    (clinical_finding (snomed_concept "Bleeding from nose" "finding"))
    (clinical_finding (snomed_concept "Bleeding from ear" "disorder"))
    (clinical_finding (snomed_concept "Nasal discharge" "finding") (qualifier (snomed_concept "Clear" "qualifier value")))
    (clinical_finding (snomed_concept "Ear discharge" "finding") (qualifier (snomed_concept "Clear" "qualifier value")))

    ;; Pupils and limbs
    (clinical_finding (snomed_concept "Anisocoria" "disorder"))
    (clinical_finding (snomed_concept "Sluggish pupil movement" "finding"))
    (clinical_finding (snomed_concept "No pupillary reaction to light" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))

    ;; Other injury, intoxication
    (clinical_finding (snomed_concept "Multiple injuries" "disorder"))
    (clinical_finding (snomed_concept "Intoxication" "disorder"))
    (clinical_finding (snomed_concept "Alcohol intoxication" "disorder"))

    ;; Lower "Head injury" box: concussion likely
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
  ;; Footnote 1: "If SBP < 80, pulse >= 100, respiratory rate > 30, confusion/restlessness, weakness, shock likely."
  (and
    (or (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
        (clinical_finding (snomed_concept "Wound" "disorder"))
        (clinical_finding (snomed_concept "Fracture of bone" "disorder"))
        (clinical_finding (snomed_concept "Injury of head" "disorder"))
    )
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
  ;; Lower "Head injury" box: "If mild headache, dizziness or mental fogginess, concussion likely"
  (and
    (clinical_finding (snomed_concept "Injury of head" "disorder"))
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
  "Urgent: injured patient with wound danger signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Wound" "disorder"))
    (or (clinical_finding (snomed_concept "Limb ischemia" "disorder"))
        (clinical_finding (snomed_concept "Peripheral pulse absent" "finding"))
        (clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Excessive" "qualifier value")))
        (clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Pulsatile" "qualifier value")))
        (clinical_finding (snomed_concept "Penetrating wound" "disorder") (finding_site (snomed_concept "Head structure" "body structure")))
        (clinical_finding (snomed_concept "Penetrating wound of neck" "disorder"))
        (clinical_finding (snomed_concept "Penetrating wound" "disorder") (finding_site (snomed_concept "Thoracic structure" "body structure")))
        (clinical_finding (snomed_concept "Penetrating wound of abdomen" "disorder"))
    )
  )
)
(system_priority_evaluation
  "Urgent: injured patient with fracture danger signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Fracture of bone" "disorder"))
    (or (clinical_finding (snomed_concept "Limb ischemia" "disorder"))
        (clinical_finding (snomed_concept "Peripheral pulse absent" "finding"))
        (clinical_finding (snomed_concept "Pain in limb" "finding") (qualifier (snomed_concept "Increasing" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
        (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
        (clinical_finding (snomed_concept "Fracture of femur" "disorder"))
        (clinical_finding (snomed_concept "Fracture of pelvis" "disorder"))
        (clinical_finding (snomed_concept "Fracture of vertebral column" "disorder"))
        (clinical_finding (snomed_concept "Fracture, open" "morphologic abnormality"))
        (clinical_finding (snomed_concept "Fracture of three ribs" "disorder"))
        (clinical_finding (snomed_concept "Fracture of four ribs" "disorder"))
        (clinical_finding (snomed_concept "Fracture of five ribs" "disorder"))
        (clinical_finding (snomed_concept "Fracture of six ribs" "disorder"))
        (clinical_finding (snomed_concept "Fracture of seven ribs" "disorder"))
        (clinical_finding (snomed_concept "Fracture of eight OR more ribs" "disorder"))
        (clinical_finding (snomed_concept "Deformity" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    )
  )
)
(system_priority_evaluation
  "Urgent: injured patient with head injury danger signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Injury of head" "disorder"))
    (or (clinical_finding (snomed_concept "Loss of consciousness" "finding"))
        (clinical_finding (snomed_concept "Seizure" "finding"))
        (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
        (clinical_finding (snomed_concept "Amnesia" "finding"))
        (clinical_finding (snomed_concept "Fracture of skull" "disorder"))
        (clinical_finding (snomed_concept "Ecchymosis of periorbital region" "disorder"))
        (clinical_finding (snomed_concept "Ecchymosis of postauricular region" "finding"))
        (clinical_finding (snomed_concept "Hematotympanum" "disorder"))
        (clinical_finding (snomed_concept "Bleeding from nose" "finding"))
        (clinical_finding (snomed_concept "Bleeding from ear" "disorder"))
        (clinical_finding (snomed_concept "Nasal discharge" "finding") (qualifier (snomed_concept "Clear" "qualifier value")))
        (clinical_finding (snomed_concept "Ear discharge" "finding") (qualifier (snomed_concept "Clear" "qualifier value")))
        (clinical_finding (snomed_concept "Anisocoria" "disorder"))
        (clinical_finding (snomed_concept "Sluggish pupil movement" "finding"))
        (clinical_finding (snomed_concept "No pupillary reaction to light" "finding"))
        (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
        (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
        ;; "Vomiting >= 2 times": the count cannot be expressed; any vomiting is used (see remaining questions)
        (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
        (clinical_finding (snomed_concept "Multiple injuries" "disorder"))
        (clinical_finding (snomed_concept "Intoxication" "disorder"))
        (clinical_finding (snomed_concept "Alcohol intoxication" "disorder"))
    )
  )
)

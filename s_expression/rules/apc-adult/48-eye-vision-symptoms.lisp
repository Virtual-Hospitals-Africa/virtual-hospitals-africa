;; Page 48 - Eye/vision symptoms (APC 2026; was APC 2023 page 31)
;; Triage-only encoding, agreed at the 2026-11-09 dev/eng meeting:
;;   - the red box is a list of urgent signs: one system_priority_evaluation per bullet;
;;   - one system_diagnosis_rule per bullet that names a diagnosis;
;;   - nothing from outside the red box, and nothing from "Manage and refer urgently".
;; Each priority rule holds the bullet's own signs, so it does not wait on a diagnosis rule.
;; Conventions follow Dr Ngwenya's PR #1142 (as checked in #1346): the "Sudden" qualifier;
;; chemical burn with its finding site in the eye.
;; Open questions are in 48-eye-vision-symptoms-remaining-questions.md.

;; "Give urgent attention to the patient with eye or vision symptoms and any of:"
;; Triggered by an eye/vision finding, or any finding whose site is in the eye (as on main).
(task
  "Check for urgent eye or vision conditions"
  adult
  (or
    (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
    (clinical_finding (finding_site (snomed_concept "Structure of eye proper" "body structure")))
  )
  (check_for
    ;; New sudden asymmetric weakness or numbness of face, arm or leg; difficulty speaking or visual disturbance
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden" "qualifier value")))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden" "qualifier value")))
    ;; BP >= 180/110 and not pregnant; pregnant or up to 1 week post-partum with BP >= 140/90
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Postpartum state" "finding"))
    ;; Penetrating or metallic foreign body; penetrating injury; eyelid laceration; chemical burn
    (clinical_finding (snomed_concept "Penetrating wound of eyeball with foreign body" "disorder"))
    (clinical_finding (snomed_concept "Metal foreign body in eye region" "disorder"))
    (clinical_finding (snomed_concept "Penetrating wound of eye" "disorder"))
    (clinical_finding (snomed_concept "Laceration of eyelid" "disorder"))
    (clinical_finding (snomed_concept "Chemical burn" "disorder") (finding_site (snomed_concept "Structure of eye proper" "body structure")))
    ;; One painful red/watery eye
    (clinical_finding (snomed_concept "Pain in eye" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Red eye" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Watery eye" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    ;; Sudden redness and excessive eye discharge with recent STI symptoms
    (clinical_finding (snomed_concept "Red eye" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (clinical_finding (snomed_concept "Discharge from eye" "finding") (qualifier (snomed_concept "Excessive" "qualifier value")))
    (clinical_finding (snomed_concept "Sexually transmitted infectious disease" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    ;; Shingles involving eye or nose
    (clinical_finding (snomed_concept "Herpes zoster ophthalmicus" "disorder"))
    (clinical_finding (snomed_concept "Herpes zoster" "disorder") (finding_site (snomed_concept "Nasal structure" "body structure")))
    ;; Corneal ulcer; hazy cornea
    (clinical_finding (snomed_concept "Corneal ulcer" "disorder"))
    (clinical_finding (snomed_concept "Corneal haze" "disorder"))
    ;; Whole eyelid swollen, red and painful
    (clinical_finding (snomed_concept "Swelling of eyelid" "finding"))
    (clinical_finding (snomed_concept "Erythema" "finding") (finding_site (snomed_concept "Eyelid structure" "body structure")))
    (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Eyelid structure" "body structure")))
    ;; Sudden bulging of eye; sudden loss or change in vision/movement of eye; sudden drooping of eyelid
    (clinical_finding (snomed_concept "Exophthalmos" "disorder") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (clinical_finding (snomed_concept "Sudden visual loss" "disorder"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (clinical_finding (snomed_concept "Disorder of eye movements" "disorder") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (clinical_finding (snomed_concept "Ptosis of eyelid" "disorder") (qualifier (snomed_concept "Sudden" "qualifier value")))
    ;; Yellow eyes
    (clinical_finding (snomed_concept "Scleral icterus" "finding"))
  )
)

;; ---------------------------------------------------------------------------------------
;; One priority rule per red-box bullet. Each requires eye or vision symptoms (the red box's
;; header) and that bullet's signs.
;; ---------------------------------------------------------------------------------------

;; Bullet: "New sudden asymmetric weakness or numbness of face, arm or leg; difficulty speaking or visual disturbance: stroke or TIA"
(system_priority_evaluation
  "Urgent: eye/vision symptoms with signs of stroke or TIA"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
        (clinical_finding (finding_site (snomed_concept "Structure of eye proper" "body structure"))))
    (or
      (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
      (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
      (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden" "qualifier value")))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden" "qualifier value")))
    )
  )
)

;; Bullet: "BP ≥ 180/110 and not pregnant"
;; "Not pregnant" needs a recorded absence of pregnancy: the (no X) support in progress.
(system_priority_evaluation
  "Urgent: eye/vision symptoms with BP >= 180/110, not pregnant"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
        (clinical_finding (finding_site (snomed_concept "Structure of eye proper" "body structure"))))
    (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
        (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110))
    (no (clinical_finding (snomed_concept "Pregnancy" "finding")))
  )
)

;; Bullet: "Penetrating or metallic foreign body"
(system_priority_evaluation
  "Urgent: eye/vision symptoms with penetrating or metallic foreign body"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
        (clinical_finding (finding_site (snomed_concept "Structure of eye proper" "body structure"))))
    (or (clinical_finding (snomed_concept "Penetrating wound of eyeball with foreign body" "disorder"))
        (clinical_finding (snomed_concept "Metal foreign body in eye region" "disorder")))
  )
)

;; Bullet: "One painful red/watery eye"
;; The language can't say the painful eye and the red/watery eye are the same eye.
(system_priority_evaluation
  "Urgent: one painful red or watery eye"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
        (clinical_finding (finding_site (snomed_concept "Structure of eye proper" "body structure"))))
    (clinical_finding (snomed_concept "Pain in eye" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (or (clinical_finding (snomed_concept "Red eye" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
        (clinical_finding (snomed_concept "Watery eye" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value"))))
  )
)

;; Bullet: "Chemical burn"
(system_priority_evaluation
  "Urgent: chemical burn of the eye"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
        (clinical_finding (finding_site (snomed_concept "Structure of eye proper" "body structure"))))
    (clinical_finding (snomed_concept "Chemical burn" "disorder") (finding_site (snomed_concept "Structure of eye proper" "body structure")))
  )
)

;; Bullet: "If sudden redness and excessive eye discharge with recent STI symptoms: gonococcal conjunctivitis likely"
;; "STI symptoms" is approximated by a recent sexually transmitted infection.
(system_priority_evaluation
  "Urgent: sudden red eye with excessive discharge and recent STI symptoms"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
        (clinical_finding (finding_site (snomed_concept "Structure of eye proper" "body structure"))))
    (clinical_finding (snomed_concept "Red eye" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (clinical_finding (snomed_concept "Discharge from eye" "finding") (qualifier (snomed_concept "Excessive" "qualifier value")))
    (clinical_finding (snomed_concept "Sexually transmitted infectious disease" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
  )
)

;; Bullet: "Shingles involving eye or nose"
(system_priority_evaluation
  "Urgent: shingles involving eye or nose"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
        (clinical_finding (finding_site (snomed_concept "Structure of eye proper" "body structure"))))
    (or (clinical_finding (snomed_concept "Herpes zoster ophthalmicus" "disorder"))
        (clinical_finding (snomed_concept "Herpes zoster" "disorder") (finding_site (snomed_concept "Nasal structure" "body structure"))))
  )
)

;; Bullet: "Corneal ulcer"
(system_priority_evaluation
  "Urgent: corneal ulcer"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
        (clinical_finding (finding_site (snomed_concept "Structure of eye proper" "body structure"))))
    (clinical_finding (snomed_concept "Corneal ulcer" "disorder"))
  )
)

;; Bullet: "Whole eyelid swollen, red and painful: orbital cellulitis likely"
;; "Whole" eyelid can't be said, so this fires for any swollen, red and painful eyelid.
(system_priority_evaluation
  "Urgent: whole eyelid swollen, red and painful"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
        (clinical_finding (finding_site (snomed_concept "Structure of eye proper" "body structure"))))
    (clinical_finding (snomed_concept "Swelling of eyelid" "finding"))
    (clinical_finding (snomed_concept "Erythema" "finding") (finding_site (snomed_concept "Eyelid structure" "body structure")))
    (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Eyelid structure" "body structure")))
  )
)

;; Bullet: "Sudden bulging of eye"
(system_priority_evaluation
  "Urgent: sudden bulging of eye"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
        (clinical_finding (finding_site (snomed_concept "Structure of eye proper" "body structure"))))
    (clinical_finding (snomed_concept "Exophthalmos" "disorder") (qualifier (snomed_concept "Sudden" "qualifier value")))
  )
)

;; Bullet: "Hazy cornea"
(system_priority_evaluation
  "Urgent: hazy cornea"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
        (clinical_finding (finding_site (snomed_concept "Structure of eye proper" "body structure"))))
    (clinical_finding (snomed_concept "Corneal haze" "disorder"))
  )
)

;; Bullet: "Sudden loss or change in vision/movement of eye"
(system_priority_evaluation
  "Urgent: sudden loss or change in vision or eye movement"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
        (clinical_finding (finding_site (snomed_concept "Structure of eye proper" "body structure"))))
    (or (clinical_finding (snomed_concept "Sudden visual loss" "disorder"))
        (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden" "qualifier value")))
        (clinical_finding (snomed_concept "Disorder of eye movements" "disorder") (qualifier (snomed_concept "Sudden" "qualifier value"))))
  )
)

;; Bullet: "Penetrating injury"
(system_priority_evaluation
  "Urgent: penetrating eye injury"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
        (clinical_finding (finding_site (snomed_concept "Structure of eye proper" "body structure"))))
    (clinical_finding (snomed_concept "Penetrating wound of eye" "disorder"))
  )
)

;; Bullet: "Sudden drooping of eyelid"
(system_priority_evaluation
  "Urgent: sudden drooping of eyelid"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
        (clinical_finding (finding_site (snomed_concept "Structure of eye proper" "body structure"))))
    (clinical_finding (snomed_concept "Ptosis of eyelid" "disorder") (qualifier (snomed_concept "Sudden" "qualifier value")))
  )
)

;; Bullet: "Pregnant or up to 1 week post-partum, and BP ≥ 140/90: treat as severe pre-eclampsia"
(system_priority_evaluation
  "Urgent: eye/vision symptoms, pregnant or up to 1 week post-partum, BP >= 140/90"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
        (clinical_finding (finding_site (snomed_concept "Structure of eye proper" "body structure"))))
    (or (clinical_finding (snomed_concept "Pregnancy" "finding"))
        (<= (onset (clinical_finding (snomed_concept "Postpartum state" "finding"))) (time_ago 1 weeks)))
    (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 140)
        (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 90))
  )
)

;; Bullet: "Eyelid laceration"
(system_priority_evaluation
  "Urgent: eyelid laceration"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
        (clinical_finding (finding_site (snomed_concept "Structure of eye proper" "body structure"))))
    (clinical_finding (snomed_concept "Laceration of eyelid" "disorder"))
  )
)

;; Bullet: "Yellow eyes: jaundice likely"
(system_priority_evaluation
  "Urgent: yellow eyes"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
        (clinical_finding (finding_site (snomed_concept "Structure of eye proper" "body structure"))))
    (clinical_finding (snomed_concept "Scleral icterus" "finding"))
  )
)

;; ---------------------------------------------------------------------------------------
;; One diagnosis rule per bullet that names a diagnosis.
;; ---------------------------------------------------------------------------------------

;; Bullet: "... stroke or TIA". One rule gives one diagnosis, so TIA is not diagnosed separately.
(system_diagnosis_rule
  "Diagnose probable stroke or TIA in a patient with eye/vision symptoms"
  (diagnosis
    (snomed_concept "Cerebrovascular accident" "disorder")
    probable
  )
  adult
  (or
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden" "qualifier value")))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Sudden" "qualifier value")))
  )
)

;; Bullet: "... gonococcal conjunctivitis likely"
(system_diagnosis_rule
  "Diagnose probable gonococcal conjunctivitis"
  (diagnosis
    (snomed_concept "Gonococcal conjunctivitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Red eye" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (clinical_finding (snomed_concept "Discharge from eye" "finding") (qualifier (snomed_concept "Excessive" "qualifier value")))
    (clinical_finding (snomed_concept "Sexually transmitted infectious disease" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
  )
)

;; Bullet: "... orbital cellulitis likely"
(system_diagnosis_rule
  "Diagnose probable orbital cellulitis"
  (diagnosis
    (snomed_concept "Orbital cellulitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Swelling of eyelid" "finding"))
    (clinical_finding (snomed_concept "Erythema" "finding") (finding_site (snomed_concept "Eyelid structure" "body structure")))
    (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Eyelid structure" "body structure")))
  )
)

;; Bullet: "Yellow eyes: jaundice likely"
(system_diagnosis_rule
  "Diagnose probable jaundice from yellow eyes"
  (diagnosis
    (snomed_concept "Jaundice" "finding")
    probable
  )
  adult
  (clinical_finding (snomed_concept "Scleral icterus" "finding"))
)

;; Bullet: "... treat as severe pre-eclampsia". The page says "treat as", not "likely": see the open questions.
(system_diagnosis_rule
  "Diagnose probable severe pre-eclampsia from eye/vision symptoms with raised BP"
  (diagnosis
    (snomed_concept "Severe pre-eclampsia" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
        (clinical_finding (finding_site (snomed_concept "Structure of eye proper" "body structure"))))
    (or (clinical_finding (snomed_concept "Pregnancy" "finding"))
        (<= (onset (clinical_finding (snomed_concept "Postpartum state" "finding"))) (time_ago 1 weeks)))
    (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 140)
        (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 90))
  )
)

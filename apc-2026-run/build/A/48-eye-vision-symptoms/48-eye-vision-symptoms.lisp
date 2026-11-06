;; Page 48 - Eye/vision symptoms

;; Page 48 - Red box: "Give urgent attention to the patient with eye or vision symptoms and any of:"
(task
  "Check for urgent eye/vision conditions"
  adult
  (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
  (check_for
    ;; Stroke or TIA likely
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))

    ;; Gonococcal conjunctivitis likely
    (clinical_finding (snomed_concept "Red eye" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Discharge from eye" "finding") (qualifier (snomed_concept "Excessive" "qualifier value")))
    (clinical_finding (snomed_concept "Sexually transmitted infectious disease" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))

    ;; Orbital cellulitis likely; acute glaucoma likely
    (clinical_finding (snomed_concept "Swelling of eyelid" "finding"))
    (clinical_finding (snomed_concept "Erythema" "finding") (finding_site (snomed_concept "Eyelid structure" "body structure")))
    (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Eyelid structure" "body structure")))
    (clinical_finding (snomed_concept "Pain in eye" "finding"))
    (clinical_finding (snomed_concept "Red eye" "finding"))
    (clinical_finding (snomed_concept "Blurring of visual image" "finding"))
    (clinical_finding (snomed_concept "Sees haloes around lights" "finding"))
    (clinical_finding (snomed_concept "Fixed dilatation of pupil" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))

    ;; One painful red/watery eye
    (clinical_finding (snomed_concept "Pain in eye" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Watery eye" "finding"))

    ;; Sudden loss or change in vision/movement of eye; sudden bulging; sudden drooping
    (clinical_finding (snomed_concept "Sudden visual loss" "disorder"))
    (clinical_finding (snomed_concept "Disorder of eye movements" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Exophthalmos" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Ptosis of eyelid" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))

    ;; Injuries, burns, foreign bodies
    (clinical_finding (snomed_concept "Penetrating wound of eye" "disorder"))
    (clinical_finding (snomed_concept "Laceration of eyelid" "disorder"))
    (clinical_finding (snomed_concept "Penetrating wound of eyeball with foreign body" "disorder"))
    (clinical_finding (snomed_concept "Metal foreign body in eye region" "disorder"))
    (clinical_finding (snomed_concept "Chemical burn" "disorder"))

    ;; Shingles, cornea
    (clinical_finding (snomed_concept "Herpes zoster ophthalmicus" "disorder"))
    (clinical_finding (snomed_concept "Herpes zoster involving tip of nose" "disorder"))
    (clinical_finding (snomed_concept "Corneal ulcer" "disorder"))
    (clinical_finding (snomed_concept "Corneal haze" "disorder"))

    ;; Yellow eyes: jaundice likely
    (clinical_finding (snomed_concept "Scleral icterus" "finding"))

    ;; Pregnancy / post-partum (BP >= 180/110 and not pregnant; pre-eclampsia)
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Postpartum state" "finding"))
  )
)

;; Page 48 - "Approach to patient with eye/vision symptoms not needing urgent attention"
(task
  "Check for causes of non-urgent eye/vision symptoms"
  adult
  (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
  (check_for
    ;; Eyes discharging or watery. Is there a prominent itch?
    (clinical_finding (snomed_concept "Discharge from eye" "finding"))
    (clinical_finding (snomed_concept "Itching of eye" "finding"))

    ;; Yes: both eyes involved or eczema, hayfever or asthma
    (clinical_finding (snomed_concept "Discharge from eye" "finding") (qualifier (snomed_concept "Right and left" "qualifier value")))
    (clinical_finding (snomed_concept "Watery eye" "finding") (qualifier (snomed_concept "Right and left" "qualifier value")))
    (clinical_finding (snomed_concept "Eczema" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Allergic rhinitis caused by pollen" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Asthma" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))

    ;; No: is the discharge clear or pus?
    (clinical_finding (snomed_concept "Serous conjunctival discharge" "finding"))
    (clinical_finding (snomed_concept "Sore throat" "finding"))
    (clinical_finding (snomed_concept "Localized enlarged lymph nodes" "disorder"))
    (clinical_finding (snomed_concept "Purulent conjunctival discharge" "finding"))

    ;; Eyelid problems: painful lump on eyelid
    (clinical_finding (snomed_concept "Lump in eyelid" "finding"))
  )
)

;; Page 48 - Red box: "... difficulty speaking or visual disturbance: stroke or TIA likely"
(system_diagnosis_rule
  "Diagnose probable stroke or TIA in a patient with eye/vision symptoms"
  (diagnosis
    (snomed_concept "Cerebrovascular accident" "disorder")
    probable
  )
  adult
  (or
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)

;; Page 48 - Red box: "If sudden redness and excessive eye discharge with recent STI symptoms: gonococcal conjunctivitis likely"
(system_diagnosis_rule
  "Diagnose probable gonococcal conjunctivitis"
  (diagnosis
    (snomed_concept "Gonococcal conjunctivitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Red eye" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Discharge from eye" "finding") (qualifier (snomed_concept "Excessive" "qualifier value")))
    (clinical_finding (snomed_concept "Sexually transmitted infectious disease" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
  )
)

;; Page 48 - Red box: "Whole eyelid swollen, red and painful: orbital cellulitis likely"
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

;; Page 48 - Red box, "Manage and refer urgently": "If painful eye with redness, blurred vision, haloes around light,
;; dilated unreactive pupil, headache/nausea/vomiting, acute glaucoma likely"
(system_diagnosis_rule
  "Diagnose probable acute glaucoma in a patient with eye/vision symptoms"
  (diagnosis
    (snomed_concept "Acute angle closure" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Pain in eye" "finding"))
    (clinical_finding (snomed_concept "Red eye" "finding"))
    (clinical_finding (snomed_concept "Blurring of visual image" "finding"))
    (clinical_finding (snomed_concept "Sees haloes around lights" "finding"))
    (clinical_finding (snomed_concept "Fixed dilatation of pupil" "finding"))
    (or (clinical_finding (snomed_concept "Headache" "finding"))
        (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
  )
)

;; Page 48 - Red box: "Yellow eyes: jaundice likely"
(system_diagnosis_rule
  "Diagnose probable jaundice from yellow eyes"
  (diagnosis
    (snomed_concept "Jaundice" "finding")
    probable
  )
  adult
  (clinical_finding (snomed_concept "Scleral icterus" "finding"))
)

;; Page 48 - Approach: prominent itch = Yes, "If both eyes involved or patient has eczema, hayfever or asthma,
;; allergic conjunctivitis likely"
(system_diagnosis_rule
  "Diagnose probable allergic conjunctivitis"
  (diagnosis
    (snomed_concept "Allergic conjunctivitis" "disorder")
    probable
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Discharge from eye" "finding"))
        (clinical_finding (snomed_concept "Watery eye" "finding")))
    (clinical_finding (snomed_concept "Itching of eye" "finding"))
    (or (clinical_finding (snomed_concept "Discharge from eye" "finding") (qualifier (snomed_concept "Right and left" "qualifier value")))
        (clinical_finding (snomed_concept "Watery eye" "finding") (qualifier (snomed_concept "Right and left" "qualifier value")))
        (clinical_finding (snomed_concept "Eczema" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
        (clinical_finding (snomed_concept "Allergic rhinitis caused by pollen" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
        (clinical_finding (snomed_concept "Asthma" "disorder") (qualifier (snomed_concept "Known present" "qualifier value"))))
  )
)

;; Page 48 - Approach: prominent itch = No, "Clear watery discharge, fever, sore throat, enlarged lymph nodes":
;; viral conjunctivitis likely
(system_diagnosis_rule
  "Diagnose probable viral conjunctivitis"
  (diagnosis
    (snomed_concept "Viral conjunctivitis" "disorder")
    probable
  )
  adult
  (and
    (no (clinical_finding (snomed_concept "Itching of eye" "finding")))
    (clinical_finding (snomed_concept "Serous conjunctival discharge" "finding"))
    (or (active_condition (snomed_concept "Fever" "finding"))
        (clinical_finding (snomed_concept "Sore throat" "finding"))
        (clinical_finding (snomed_concept "Localized enlarged lymph nodes" "disorder")))
  )
)

;; Page 48 - Approach: prominent itch = No, discharge is pus: bacterial conjunctivitis likely
(system_diagnosis_rule
  "Diagnose probable bacterial conjunctivitis"
  (diagnosis
    (snomed_concept "Bacterial conjunctivitis" "disorder")
    probable
  )
  adult
  (and
    (no (clinical_finding (snomed_concept "Itching of eye" "finding")))
    (clinical_finding (snomed_concept "Purulent conjunctival discharge" "finding"))
  )
)

;; Page 48 - Eyelid problems: "If painful lump on eyelid, stye likely"
(system_diagnosis_rule
  "Diagnose probable stye"
  (diagnosis
    (snomed_concept "Hordeolum" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Lump in eyelid" "finding"))
    (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Eyelid structure" "body structure")))
  )
)

;; Page 48 - Red box: "Give urgent attention to the patient with eye or vision symptoms and any of:"
(system_priority_evaluation
  "Urgent: eye/vision symptoms with danger signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
    (or
      (active_condition (snomed_concept "Cerebrovascular accident" "disorder"))
      (and (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
               (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110))
           (no (clinical_finding (snomed_concept "Pregnancy" "finding"))))
      (and (clinical_finding (snomed_concept "Pain in eye" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
           (or (clinical_finding (snomed_concept "Red eye" "finding"))
               (clinical_finding (snomed_concept "Watery eye" "finding"))))
      (active_condition (snomed_concept "Gonococcal conjunctivitis" "disorder"))
      (clinical_finding (snomed_concept "Herpes zoster ophthalmicus" "disorder"))
      (clinical_finding (snomed_concept "Herpes zoster involving tip of nose" "disorder"))
      (active_condition (snomed_concept "Orbital cellulitis" "disorder"))
      (clinical_finding (snomed_concept "Exophthalmos" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Sudden visual loss" "disorder"))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Disorder of eye movements" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Penetrating wound of eye" "disorder"))
      (and (or (clinical_finding (snomed_concept "Pregnancy" "finding"))
               (<= (onset (clinical_finding (snomed_concept "Postpartum state" "finding"))) (time_ago 1 weeks)))
           (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 140)
               (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 90)))
      (clinical_finding (snomed_concept "Laceration of eyelid" "disorder"))
      (clinical_finding (snomed_concept "Penetrating wound of eyeball with foreign body" "disorder"))
      (clinical_finding (snomed_concept "Metal foreign body in eye region" "disorder"))
      (clinical_finding (snomed_concept "Chemical burn" "disorder"))
      (clinical_finding (snomed_concept "Corneal ulcer" "disorder"))
      (clinical_finding (snomed_concept "Corneal haze" "disorder"))
      (clinical_finding (snomed_concept "Ptosis of eyelid" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (active_condition (snomed_concept "Jaundice" "finding"))
      (active_condition (snomed_concept "Acute angle closure" "disorder"))
    )
  )
)

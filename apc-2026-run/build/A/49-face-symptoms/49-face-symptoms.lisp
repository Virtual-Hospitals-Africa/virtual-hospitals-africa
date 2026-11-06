;; Page 49 - Face symptoms
;; Presenting complaint "face symptoms": no single recorded common symptom or warning sign covers it,
;; so the tasks are anchored to the face findings the page's own tree branches on
;; (swelling of face, face pain, weakness/numbness of face), plus lip and eye swelling (angioedema branch).
(task
  "Check for urgent face symptom conditions"
  adult
  (or (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
      (clinical_finding (snomed_concept "Pain in face" "finding"))
      (clinical_finding (snomed_concept "Weakness of face muscles" "finding"))
      (clinical_finding (snomed_concept "Numbness of face" "finding"))
      (clinical_finding (snomed_concept "Lip swelling" "finding"))
      (clinical_finding (snomed_concept "Swelling around eyes" "finding"))
  )
  (check_for
    ;; Stroke or TIA
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Upper facial weakness" "finding"))
    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))

    ;; Anaphylaxis
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Food" "substance"))
    (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
    (clinical_finding (snomed_concept "Insect sting" "disorder"))

    ;; Facial cellulitis / orbital cellulitis
    (clinical_finding (snomed_concept "Redness of skin of face" "finding"))
    (clinical_finding (snomed_concept "Swelling of eyelid" "finding"))
    (clinical_finding (snomed_concept "Erythema of skin of eyelid" "disorder"))
    (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Eyelid structure" "body structure")))

    ;; Kidney disease
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Proteinuria" "finding"))
  )
)
(task
  "Check for causes of face pain"
  adult
  (clinical_finding (snomed_concept "Pain in face" "finding"))
  (check_for
    ;; Pain on one side of face: trigeminal / post-herpetic neuralgia
    (clinical_finding (snomed_concept "Pain in face" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Stabbing pain" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "History of herpes zoster" "situation"))

    ;; Sinusitis
    (clinical_finding (snomed_concept "Tenderness of face" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Nasal discharge" "finding") (qualifier (snomed_concept "Thick" "qualifier value")))
    (clinical_finding (snomed_concept "Posterior rhinorrhea" "disorder"))
    (clinical_finding (snomed_concept "Common cold" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
  )
)
(task
  "Check for causes of facial weakness"
  adult
  (clinical_finding (snomed_concept "Weakness of face muscles" "finding"))
  (check_for
    ;; Bell's palsy: unable to wrinkle forehead or close eye
    (clinical_finding (snomed_concept "Upper facial weakness" "finding"))
    (clinical_finding (snomed_concept "Unable to close eyes" "finding"))
  )
)
(task
  "Check for causes of facial swelling"
  adult
  (or (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
      (clinical_finding (snomed_concept "Lip swelling" "finding"))
      (clinical_finding (snomed_concept "Swelling around eyes" "finding"))
  )
  (check_for
    ;; Angioedema: painless swelling of lips/eyes
    (clinical_finding (snomed_concept "Lip swelling" "finding") (qualifier (snomed_concept "Painless" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling around eyes" "finding") (qualifier (snomed_concept "Painless" "qualifier value")))

    ;; Mumps / facial cellulitis: painful swelling with fever, headache, body pain
    (clinical_finding (snomed_concept "Pain in face" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
    (clinical_finding (snomed_concept "Muscle pain" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose possible stroke from face symptoms"
  (diagnosis
    (snomed_concept "Cerebrovascular accident" "disorder")
    possible
  )
  adult
  (or
    ;; "with no/minimal forehead involvement" applies to the face weakness
    (and (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
         (no (clinical_finding (snomed_concept "Upper facial weakness" "finding"))))
    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (and (or (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
             (clinical_finding (snomed_concept "Pain in face" "finding"))
             (clinical_finding (snomed_concept "Weakness of face muscles" "finding"))
             (clinical_finding (snomed_concept "Numbness of face" "finding"))
             (clinical_finding (snomed_concept "Lip swelling" "finding"))
             (clinical_finding (snomed_concept "Swelling around eyes" "finding"))
         )
         (or (clinical_finding (snomed_concept "Muscle weakness of limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
             (clinical_finding (snomed_concept "Numbness of limbs" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
             (clinical_finding (snomed_concept "Difficulty talking" "finding"))
             (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
         )
    )
  )
)
(system_diagnosis_rule
  "Diagnose possible TIA from face symptoms"
  (diagnosis
    (snomed_concept "Transient ischemic attack" "disorder")
    possible
  )
  adult
  (or
    (and (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
         (no (clinical_finding (snomed_concept "Upper facial weakness" "finding"))))
    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (and (or (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
             (clinical_finding (snomed_concept "Pain in face" "finding"))
             (clinical_finding (snomed_concept "Weakness of face muscles" "finding"))
             (clinical_finding (snomed_concept "Numbness of face" "finding"))
             (clinical_finding (snomed_concept "Lip swelling" "finding"))
             (clinical_finding (snomed_concept "Swelling around eyes" "finding"))
         )
         (or (clinical_finding (snomed_concept "Muscle weakness of limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
             (clinical_finding (snomed_concept "Numbness of limbs" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
             (clinical_finding (snomed_concept "Difficulty talking" "finding"))
             (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
         )
    )
  )
)
(system_diagnosis_rule
  "Diagnose possible anaphylaxis from face swelling"
  (diagnosis
    (snomed_concept "Anaphylaxis" "disorder")
    possible
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    )
    (or (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
        (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
        (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
        (clinical_finding (snomed_concept "Dizziness" "finding"))
        (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Abdominal pain" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Food" "substance"))
        (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
        (clinical_finding (snomed_concept "Insect sting" "disorder"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable facial cellulitis"
  (diagnosis
    (snomed_concept "Cellulitis of face" "disorder")
    probable
  )
  adult
  (and
    ;; Painful red facial swelling and temperature >= 38°C
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
    (clinical_finding (snomed_concept "Pain in face" "finding"))
    (clinical_finding (snomed_concept "Redness of skin of face" "finding"))
    (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
  )
)
(system_diagnosis_rule
  "Diagnose probable orbital cellulitis from facial cellulitis"
  (diagnosis
    (snomed_concept "Orbital cellulitis" "disorder")
    probable
  )
  adult
  (and
    ;; Likely facial cellulitis ...
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
    (clinical_finding (snomed_concept "Pain in face" "finding"))
    (clinical_finding (snomed_concept "Redness of skin of face" "finding"))
    (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
    ;; ... with whole eyelid swollen, red and painful
    (clinical_finding (snomed_concept "Swelling of eyelid" "finding"))
    (clinical_finding (snomed_concept "Erythema of skin of eyelid" "disorder"))
    (clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Eyelid structure" "body structure")))
  )
)
(system_diagnosis_rule
  "Diagnose probable kidney disease from facial swelling"
  (diagnosis
    (snomed_concept "Kidney disease" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
    (or (clinical_finding (snomed_concept "Blood in urine" "finding"))
        (clinical_finding (snomed_concept "Proteinuria" "finding"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable trigeminal neuralgia"
  (diagnosis
    (snomed_concept "Trigeminal neuralgia" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Pain in face" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Stabbing pain" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose probable post-herpetic neuralgia of face"
  (diagnosis
    (snomed_concept "Postherpetic neuralgia" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Pain in face" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "History of herpes zoster" "situation"))
  )
)
(system_diagnosis_rule
  "Diagnose probable sinusitis from face pain"
  (diagnosis
    (snomed_concept "Sinusitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Pain in face" "finding"))
    (clinical_finding (snomed_concept "Tenderness of face" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding"))
    (or (clinical_finding (snomed_concept "Nasal discharge" "finding") (qualifier (snomed_concept "Thick" "qualifier value")))
        (clinical_finding (snomed_concept "Posterior rhinorrhea" "disorder"))
    )
    (clinical_finding (snomed_concept "Common cold" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose probable Bell's palsy"
  (diagnosis
    (snomed_concept "Bell's palsy" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (or (clinical_finding (snomed_concept "Upper facial weakness" "finding"))
        (clinical_finding (snomed_concept "Unable to close eyes" "finding"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable angioedema from face swelling"
  (diagnosis
    (snomed_concept "Angioedema" "disorder")
    probable
  )
  adult
  (or (clinical_finding (snomed_concept "Lip swelling" "finding") (qualifier (snomed_concept "Painless" "qualifier value")))
      (clinical_finding (snomed_concept "Swelling around eyes" "finding") (qualifier (snomed_concept "Painless" "qualifier value")))
  )
)
(system_diagnosis_rule
  "Diagnose probable mumps"
  (diagnosis
    (snomed_concept "Mumps" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
    (clinical_finding (snomed_concept "Pain in face" "finding"))
    (active_condition (snomed_concept "Fever" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding"))
    (or (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
        (clinical_finding (snomed_concept "Muscle pain" "finding"))
    )
  )
)
(system_priority_evaluation
  "Urgent: face symptoms with stroke, anaphylaxis, facial cellulitis or kidney disease signs"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
        (clinical_finding (snomed_concept "Pain in face" "finding"))
        (clinical_finding (snomed_concept "Weakness of face muscles" "finding"))
        (clinical_finding (snomed_concept "Numbness of face" "finding"))
        (clinical_finding (snomed_concept "Lip swelling" "finding"))
        (clinical_finding (snomed_concept "Swelling around eyes" "finding"))
    )
    (or
      ;; Stroke or TIA
      (and (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (no (clinical_finding (snomed_concept "Upper facial weakness" "finding"))))
      (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Muscle weakness of limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of limbs" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty talking" "finding"))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
      ;; Anaphylaxis
      (and
        (or (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
            (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        )
        (or (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
            (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
            (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
            (clinical_finding (snomed_concept "Dizziness" "finding"))
            (clinical_finding (snomed_concept "Collapse" "finding"))
            (clinical_finding (snomed_concept "Abdominal pain" "finding"))
            (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
            (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
            (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Food" "substance"))
            (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
            (clinical_finding (snomed_concept "Insect sting" "disorder"))
        )
      )
      ;; Facial cellulitis likely / kidney disease likely
      (active_condition (snomed_concept "Cellulitis of face" "disorder"))
      (active_condition (snomed_concept "Kidney disease" "disorder"))
    )
  )
)

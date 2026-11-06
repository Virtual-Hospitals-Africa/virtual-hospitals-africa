;; Page 45 - Collapse/Falls
(task
  "Check for urgent collapse/falls conditions"
  adult
  (or (clinical_finding (snomed_concept "Collapse" "finding"))
      (clinical_finding (snomed_concept "Falls" "finding")))
  (check_for
    ;; Stroke/TIA signs
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))

    ;; Injury, shock
    (clinical_finding (snomed_concept "Traumatic injury" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Shock" "disorder"))

    ;; Sudden collapse with anaphylaxis features
    (clinical_finding (snomed_concept "Collapse" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Itching" "finding"))
    (clinical_finding (snomed_concept "Eruption" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
    (clinical_finding (snomed_concept "Wheezing" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Food" "substance"))
    (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
    (clinical_finding (snomed_concept "Insect sting" "disorder"))

    ;; Cardiac
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Pulse irregular" "finding"))
    (clinical_finding (snomed_concept "Family history of syncope" "situation"))
    (clinical_finding (snomed_concept "Family history of sudden death" "situation"))
    (clinical_finding (snomed_concept "Electrocardiogram abnormal" "finding"))
    (clinical_finding (snomed_concept "Heart disease" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Collapse" "finding") (qualifier (snomed_concept "During exercise" "qualifier value")))

    ;; Neurological
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Seizure" "finding"))

    ;; Vaccination
    (clinical_finding (snomed_concept "Vaccination given" "situation"))

    ;; Chest, bleeding, pain
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Hematemesis" "disorder"))
    (clinical_finding (snomed_concept "Hematochezia" "finding"))
    (clinical_finding (snomed_concept "Melena" "disorder"))
    (clinical_finding (snomed_concept "Backache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Abdominal pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))

    ;; Glucose
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))

    ;; Pregnancy
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Missed period" "finding"))
    (clinical_finding (snomed_concept "Abnormal vaginal bleeding" "finding"))
  )
)
(task
  "Check for cause of collapse/falls"
  adult
  (or (clinical_finding (snomed_concept "Collapse" "finding"))
      (clinical_finding (snomed_concept "Falls" "finding")))
  (check_for
    ;; Breathing very quickly or deeply before/during the collapse
    (clinical_finding (snomed_concept "Tachypnea" "finding"))
    (clinical_finding (snomed_concept "Excessively deep breathing" "finding"))

    ;; Prodrome of a common faint
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Lightheadedness" "finding"))
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Sweating" "finding"))
    (clinical_finding (snomed_concept "Asthenia" "finding"))
  )
)
(task
  "Measure postural blood pressure drop after collapse/falls"
  adult
  (or (clinical_finding (snomed_concept "Collapse" "finding"))
      (clinical_finding (snomed_concept "Falls" "finding")))
  (measure
    (measurement (snomed_concept "Level of reduction in systolic blood pressure on standing" "observable entity") mmHg)
  )
)
(system_diagnosis_rule
  "Collapse/falls: consider stroke"
  (diagnosis
    (snomed_concept "Cerebrovascular accident" "disorder")
    possible
  )
  adult
  (or (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty talking" "finding"))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
  )
)
(system_diagnosis_rule
  "Collapse/falls: consider TIA"
  (diagnosis
    (snomed_concept "Transient ischemic attack" "disorder")
    possible
  )
  adult
  (or (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty talking" "finding"))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
  )
)
(system_diagnosis_rule
  "Collapse/falls: check for possible anaphylaxis"
  (diagnosis
    (snomed_concept "Anaphylaxis" "disorder")
    possible
  )
  adult
  ;; Sudden collapse and any of the listed features or exposure to a possible allergen (footnote 1)
  (and
    (clinical_finding (snomed_concept "Collapse" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (or (clinical_finding (snomed_concept "Itching" "finding"))
        (clinical_finding (snomed_concept "Eruption" "morphologic abnormality"))
        (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
        (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
        (clinical_finding (snomed_concept "Wheezing" "finding"))
        (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
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
  "Diagnose probable orthostatic hypotension after collapse/falls"
  (diagnosis
    (snomed_concept "Orthostatic hypotension" "disorder")
    probable
  )
  adult
  ;; Systolic drop >= 20 lying to standing. The diastolic arm (drop >= 10) has no observable.
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (>= (measurement (snomed_concept "Level of reduction in systolic blood pressure on standing" "observable entity") mmHg) 20)
  )
)
(system_diagnosis_rule
  "Diagnose probable hyperventilation after collapse/falls"
  (diagnosis
    (snomed_concept "Hyperventilation" "finding")
    probable
  )
  adult
  ;; Breathing very quickly or deeply immediately before or during the collapse
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (or (clinical_finding (snomed_concept "Tachypnea" "finding"))
        (clinical_finding (snomed_concept "Excessively deep breathing" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable common faint after collapse/falls"
  (diagnosis
    (snomed_concept "Vasovagal syncope" "finding")
    probable
  )
  adult
  ;; Dizziness, light-headedness, nausea, sweating, weakness or vision changes before the collapse
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (or (clinical_finding (snomed_concept "Dizziness" "finding"))
        (clinical_finding (snomed_concept "Lightheadedness" "finding"))
        (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Sweating" "finding"))
        (clinical_finding (snomed_concept "Asthenia" "finding"))
        (clinical_finding (snomed_concept "Visual disturbance" "disorder")))
  )
)
(system_priority_evaluation
  "Urgent: collapse/falls with danger signs"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (or
      ;; New sudden asymmetric weakness or numbness of face, arm or leg; difficulty speaking or visual disturbance
      (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty talking" "finding"))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
      ;; Recent injury
      (clinical_finding (snomed_concept "Traumatic injury" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
      ;; Shock/SBP < 80
      (clinical_finding (snomed_concept "Shock" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
      ;; Sudden collapse and any of the anaphylaxis features or exposure to possible allergen
      (and
        (clinical_finding (snomed_concept "Collapse" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (or (clinical_finding (snomed_concept "Itching" "finding"))
            (clinical_finding (snomed_concept "Eruption" "morphologic abnormality"))
            (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
            (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
            (clinical_finding (snomed_concept "Wheezing" "finding"))
            (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
            (clinical_finding (snomed_concept "Abdominal pain" "finding"))
            (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
            (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
            (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Food" "substance"))
            (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
            (clinical_finding (snomed_concept "Insect sting" "disorder"))
        )
      )
      ;; Palpitations, pulse < 50 or irregular
      (clinical_finding (snomed_concept "Palpitations" "finding"))
      (< (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 50)
      (clinical_finding (snomed_concept "Pulse irregular" "finding"))
      ;; Family history of collapse or sudden death
      (clinical_finding (snomed_concept "Family history of syncope" "situation"))
      (clinical_finding (snomed_concept "Family history of sudden death" "situation"))
      ;; Abnormal ECG or known heart problem
      (clinical_finding (snomed_concept "Electrocardiogram abnormal" "finding"))
      (clinical_finding (snomed_concept "Heart disease" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
      ;; Decreased consciousness
      (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
      ;; Collapse with exercise
      (clinical_finding (snomed_concept "Collapse" "finding") (qualifier (snomed_concept "During exercise" "qualifier value")))
      ;; Seizure
      (clinical_finding (snomed_concept "Seizure" "finding"))
      ;; Collapse following vaccination (the complaint is already required above)
      (clinical_finding (snomed_concept "Vaccination given" "situation"))
      ;; Chest pain
      (clinical_finding (snomed_concept "Chest pain" "finding"))
      ;; Vomited blood or blood in stool
      (clinical_finding (snomed_concept "Hematemesis" "disorder"))
      (clinical_finding (snomed_concept "Hematochezia" "finding"))
      (clinical_finding (snomed_concept "Melena" "disorder"))
      ;; Difficulty breathing
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      ;; Severe back or abdominal pain
      (clinical_finding (snomed_concept "Backache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      (clinical_finding (snomed_concept "Abdominal pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      ;; Glucose < 3 (or < 4 if diabetes)
      (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
      (and (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
           (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 4))
      ;; Pregnant or missed/overdue period with abdominal pain and vaginal bleeding
      (and (or (clinical_finding (snomed_concept "Pregnancy" "finding"))
               (clinical_finding (snomed_concept "Missed period" "finding")))
           (clinical_finding (snomed_concept "Abdominal pain" "finding"))
           (clinical_finding (snomed_concept "Abnormal vaginal bleeding" "finding")))
    )
  )
)

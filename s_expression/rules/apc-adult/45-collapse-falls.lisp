;; Page 45 - Collapse/Falls
(task
  "Check for urgent collapse/falls conditions"
  adult
  (or (clinical_finding (snomed_concept "Collapse" "finding"))
      (clinical_finding (snomed_concept "Falls" "finding")))
  (check_for
    ;; New sudden asymmetric weakness or numbness of face, arm or leg; difficulty speaking or visual disturbance
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))

    ;; Sudden collapse and any of the allergy signs or exposure to a possible allergen (footnote 1)
    (clinical_finding (snomed_concept "Collapse" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Generalized pruritus" "finding"))
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
    (clinical_finding (snomed_concept "Wheezing" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Food" "substance"))
    (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
    (clinical_finding (snomed_concept "Insect sting" "disorder"))

    ;; Recent injury, shock, circulation and heart
    (clinical_finding (snomed_concept "Traumatic injury" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Shock" "disorder"))
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Pulse irregular" "finding"))
    (clinical_finding (snomed_concept "Family history of syncope" "situation"))
    (clinical_finding (snomed_concept "Family history of sudden death" "situation"))
    (clinical_finding (snomed_concept "Electrocardiogram abnormal" "finding"))
    (clinical_finding (snomed_concept "Heart disease" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Chest pain" "finding"))

    ;; Circumstances of the collapse
    (clinical_finding (snomed_concept "Collapse" "finding") (qualifier (snomed_concept "During exercise" "qualifier value")))
    (clinical_finding (snomed_concept "Vaccination given" "situation"))

    ;; Neurological
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Seizure" "finding"))

    ;; Bleeding, breathing and pain
    (clinical_finding (snomed_concept "Hematemesis" "disorder"))
    (clinical_finding (snomed_concept "Hematochezia" "finding"))
    (clinical_finding (snomed_concept "Melena" "disorder"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Backache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Abdominal pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))

    ;; Glucose threshold depends on diabetes
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))

    ;; Pregnant or missed/overdue period with abdominal pain and vaginal bleeding
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Missed period" "finding"))
    (clinical_finding (snomed_concept "Menstrual period late" "finding"))
    (clinical_finding (snomed_concept "Abnormal vaginal bleeding" "finding"))
  )
)
(task
  "Check for causes of collapse/falls"
  adult
  (or (clinical_finding (snomed_concept "Collapse" "finding"))
      (clinical_finding (snomed_concept "Falls" "finding")))
  (check_for
    ;; Q2: breathing very quickly or deeply immediately before or during the collapse
    (clinical_finding (snomed_concept "Tachypnea" "finding"))
    (clinical_finding (snomed_concept "Excessively deep breathing" "finding"))

    ;; Q3: dizziness, light-headedness, nausea, sweating, weakness or vision changes before the collapse
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Lightheadedness" "finding"))
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Sweating" "finding"))
    (clinical_finding (snomed_concept "Asthenia" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
  )
)
(task
  "Measure lying and standing blood pressure after collapse/falls"
  adult
  (or (clinical_finding (snomed_concept "Collapse" "finding"))
      (clinical_finding (snomed_concept "Falls" "finding")))
  (measure
    (measurement (snomed_concept "Lying systolic blood pressure" "observable entity") mmHg)
    (measurement (snomed_concept "Lying diastolic blood pressure" "observable entity") mmHg)
    (measurement (snomed_concept "Standing systolic blood pressure" "observable entity") mmHg)
    (measurement (snomed_concept "Standing diastolic blood pressure" "observable entity") mmHg)
    (measurement (snomed_concept "Level of reduction in systolic blood pressure on standing" "observable entity") mmHg)
  )
)
(system_diagnosis_rule
  "Diagnose possible stroke after collapse/falls"
  (diagnosis
    (snomed_concept "Cerebrovascular accident" "disorder")
    possible
  )
  adult
  (and (or (clinical_finding (snomed_concept "Collapse" "finding"))
           (clinical_finding (snomed_concept "Falls" "finding")))
       (or (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
       )
  )
)
(system_diagnosis_rule
  "Diagnose possible TIA after collapse/falls"
  (diagnosis
    (snomed_concept "Transient ischemic attack" "disorder")
    possible
  )
  adult
  (and (or (clinical_finding (snomed_concept "Collapse" "finding"))
           (clinical_finding (snomed_concept "Falls" "finding")))
       (or (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
           (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
       )
  )
)
(system_diagnosis_rule
  "Diagnose possible anaphylaxis after sudden collapse"
  (diagnosis
    (snomed_concept "Anaphylaxis" "disorder")
    possible
  )
  adult
  ;; Sudden collapse and any of the listed signs or exposure to a footnote-1 allergen
  (and (clinical_finding (snomed_concept "Collapse" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
       (or (clinical_finding (snomed_concept "Generalized pruritus" "finding"))
           (clinical_finding (snomed_concept "Generalized rash" "disorder"))
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
  ;; Q1 = Yes: systolic BP drop >= 20 on standing (the diastolic drop >= 10 arm has no observable)
  (and (or (clinical_finding (snomed_concept "Collapse" "finding"))
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
  ;; Q1 = No (systolic part only) -> Q2 = Yes
  (and (or (clinical_finding (snomed_concept "Collapse" "finding"))
           (clinical_finding (snomed_concept "Falls" "finding")))
       (< (measurement (snomed_concept "Level of reduction in systolic blood pressure on standing" "observable entity") mmHg) 20)
       (or (clinical_finding (snomed_concept "Tachypnea" "finding"))
           (clinical_finding (snomed_concept "Excessively deep breathing" "finding"))
       )
  )
)
(system_diagnosis_rule
  "Diagnose probable common faint after collapse/falls"
  (diagnosis
    (snomed_concept "Vasovagal syncope" "finding")
    probable
  )
  adult
  ;; Q1 = No (systolic part only) -> Q2 = No -> Q3 = Yes
  (and (or (clinical_finding (snomed_concept "Collapse" "finding"))
           (clinical_finding (snomed_concept "Falls" "finding")))
       (< (measurement (snomed_concept "Level of reduction in systolic blood pressure on standing" "observable entity") mmHg) 20)
       (no (clinical_finding (snomed_concept "Tachypnea" "finding")))
       (no (clinical_finding (snomed_concept "Excessively deep breathing" "finding")))
       (or (clinical_finding (snomed_concept "Dizziness" "finding"))
           (clinical_finding (snomed_concept "Lightheadedness" "finding"))
           (clinical_finding (snomed_concept "Nausea" "finding"))
           (clinical_finding (snomed_concept "Sweating" "finding"))
           (clinical_finding (snomed_concept "Asthenia" "finding"))
           (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
       )
  )
)
;; New sudden asymmetric weakness or numbness of face, arm or leg; difficulty speaking or visual disturbance: consider stroke or TIA
(system_priority_evaluation
  "Urgent: collapse/falls with weakness of face muscles (sudden onset)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: collapse/falls with muscle weakness of upper limb (sudden onset)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: collapse/falls with weakness of muscle of lower limb (sudden onset)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: collapse/falls with numbness of face (sudden onset)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: collapse/falls with numbness of upper limb (sudden onset)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: collapse/falls with numbness of lower limb (sudden onset)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: collapse/falls with difficulty talking (sudden onset)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: collapse/falls with visual disturbance (sudden onset)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)
;; Recent injury
(system_priority_evaluation
  "Urgent: collapse/falls with traumatic injury (recent)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Traumatic injury" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
  )
)
;; Shock/SBP < 80
(system_priority_evaluation
  "Urgent: collapse/falls with shock"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Shock" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: collapse/falls with systolic blood pressure < 80 mmHg"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
  )
)
;; Sudden collapse and any of the allergy signs or exposures: check for anaphylaxis
(system_priority_evaluation
  "Urgent: collapse/falls with collapse (sudden onset) and generalized pruritus or generalized rash …"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Collapse" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (or (clinical_finding (snomed_concept "Generalized pruritus" "finding"))
        (clinical_finding (snomed_concept "Generalized rash" "disorder"))
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
;; Palpitations, pulse < 50 or irregular
(system_priority_evaluation
  "Urgent: collapse/falls with palpitations"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Palpitations" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: collapse/falls with pulse, function < 50 bpm"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (< (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 50)
  )
)

(system_priority_evaluation
  "Urgent: collapse/falls with pulse irregular"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Pulse irregular" "finding"))
  )
)
;; Family history of collapse or sudden death
(system_priority_evaluation
  "Urgent: collapse/falls with family history of syncope"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Family history of syncope" "situation"))
  )
)

(system_priority_evaluation
  "Urgent: collapse/falls with family history of sudden death"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Family history of sudden death" "situation"))
  )
)
;; Abnormal ECG or known heart problem
(system_priority_evaluation
  "Urgent: collapse/falls with electrocardiogram abnormal"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Electrocardiogram abnormal" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: collapse/falls with heart disease (known present)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Heart disease" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
  )
)
;; Decreased consciousness
(system_priority_evaluation
  "Urgent: collapse/falls with decreased level of consciousness"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
  )
)
;; Collapse with exercise
(system_priority_evaluation
  "Urgent: collapse/falls with collapse (during exercise)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Collapse" "finding") (qualifier (snomed_concept "During exercise" "qualifier value")))
  )
)
;; Seizure
(system_priority_evaluation
  "Urgent: collapse/falls with seizure"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Seizure" "finding"))
  )
)
;; Collapse following vaccination (the complaint is already required above)

(system_priority_evaluation
  "Urgent: collapse/falls with vaccination given"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Vaccination given" "situation"))
  )
)
;; Chest pain
(system_priority_evaluation
  "Urgent: collapse/falls with chest pain"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
  )
)
;; Vomited blood or blood in stool
(system_priority_evaluation
  "Urgent: collapse/falls with hematemesis"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Hematemesis" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: collapse/falls with hematochezia"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Hematochezia" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: collapse/falls with melena"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Melena" "disorder"))
  )
)
;; Difficulty breathing
(system_priority_evaluation
  "Urgent: collapse/falls with difficulty breathing"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
  )
)
;; Severe back or abdominal pain
(system_priority_evaluation
  "Urgent: collapse/falls with backache (severe)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Backache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
  )
)

(system_priority_evaluation
  "Urgent: collapse/falls with abdominal pain (severe)"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Abdominal pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
  )
)
;; Glucose < 3 (or < 4 if diabetes)

(system_priority_evaluation
  "Urgent: collapse/falls with blood glucose status < 3 mmol/L"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
  )
)

(system_priority_evaluation
  "Urgent: collapse/falls with diabetes mellitus (known present) and blood glucose status < 4 mmol/L"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 4)
  )
)
;; Pregnant or missed/overdue period with abdominal pain and vaginal bleeding
(system_priority_evaluation
  "Urgent: collapse/falls with pregnancy or missed period or menstrual period late and abdominal pain …"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Collapse" "finding"))
        (clinical_finding (snomed_concept "Falls" "finding")))
    (or (clinical_finding (snomed_concept "Pregnancy" "finding"))
        (clinical_finding (snomed_concept "Missed period" "finding"))
        (clinical_finding (snomed_concept "Menstrual period late" "finding")))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Abnormal vaginal bleeding" "finding"))
  )
)

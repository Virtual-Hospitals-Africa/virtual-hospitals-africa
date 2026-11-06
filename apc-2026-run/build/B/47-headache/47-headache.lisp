;; Page 47 - Headache
(task
  "Check for urgent headache danger signs"
  adult
  (clinical_finding (snomed_concept "Headache" "finding"))
  (check_for
    ;; Pregnant or 1 week postpartum (with BP >= 140/90); BP >= 180/110 and not pregnant
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Postpartum state" "finding"))

    ;; New sudden asymmetric weakness or numbness of face, arm or leg; difficulty speaking
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))

    ;; New vision problems or eye pain
    (clinical_finding (snomed_concept "Abnormal vision" "finding") (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Pain in eye" "finding"))

    ;; Character of the headache
    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Frequent headache" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
    (clinical_finding (snomed_concept "Morning headache" "finding"))

    ;; Meningitis likely
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))

    ;; Other danger signs
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))
    (clinical_finding (snomed_concept "Seizure" "finding") (qualifier (snomed_concept "First episode" "qualifier value")))
    (clinical_finding (snomed_concept "Injury of head" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Anisocoria" "disorder"))
  )
)
(task
  "Check for causes of headache not needing urgent attention"
  adult
  (clinical_finding (snomed_concept "Headache" "finding"))
  (check_for
    ;; Fever and body pain or recent common cold?
    (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
    (clinical_finding (snomed_concept "Common cold" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))

    ;; Sinusitis
    (clinical_finding (snomed_concept "Nasal discharge" "finding") (qualifier (snomed_concept "Thick" "qualifier value")))
    (clinical_finding (snomed_concept "Posterior rhinorrhea" "disorder") (qualifier (snomed_concept "Thick" "qualifier value")))
    (clinical_finding (snomed_concept "Tenderness" "finding") (finding_site (snomed_concept "Forehead structure" "body structure")))
    (clinical_finding (snomed_concept "Tenderness" "finding") (finding_site (snomed_concept "Cheek structure" "body structure")))

    ;; Tick bite fever
    (clinical_finding (snomed_concept "Tick bite" "disorder"))

    ;; Migraine
    (clinical_finding (snomed_concept "Throbbing headache" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Photophobia" "finding"))
    (clinical_finding (snomed_concept "Phonophobia" "finding"))

    ;; Type and site of pain
    (clinical_finding (snomed_concept "Tightening pain" "finding") (finding_site (snomed_concept "Head structure" "body structure")))
    (clinical_finding (snomed_concept "Generalized headache" "finding"))
    (clinical_finding (snomed_concept "Aching pain" "finding") (qualifier (snomed_concept "Continuous" "qualifier value")))
    (clinical_finding (snomed_concept "Tenderness" "finding") (finding_site (snomed_concept "Skeletal muscle structure of neck" "body structure")))
    (clinical_finding (snomed_concept "Temporal headache" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable meningitis in patient with headache"
  (diagnosis
    (snomed_concept "Meningitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Headache" "finding"))
    (or (clinical_finding (snomed_concept "Stiff neck" "finding"))
        (clinical_finding (snomed_concept "Drowsy" "finding"))
        (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
        (clinical_finding (snomed_concept "Acute confusion" "finding"))
        (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose possible stroke in patient with headache"
  (diagnosis
    (snomed_concept "Cerebrovascular accident" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Headache" "finding"))
    (or (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    )
  )
)
(system_diagnosis_rule
  "Diagnose possible TIA in patient with headache"
  (diagnosis
    (snomed_concept "Transient ischemic attack" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Headache" "finding"))
    (or (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable sinusitis in patient with headache"
  (diagnosis
    (snomed_concept "Sinusitis" "disorder")
    probable
  )
  adult
  ;; Q0 = Yes → Q1 = Yes (see 47-headache-flowchart.md)
  (and
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Common cold" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (or (clinical_finding (snomed_concept "Nasal discharge" "finding") (qualifier (snomed_concept "Thick" "qualifier value")))
        (clinical_finding (snomed_concept "Posterior rhinorrhea" "disorder") (qualifier (snomed_concept "Thick" "qualifier value")))
        (clinical_finding (snomed_concept "Tenderness" "finding") (finding_site (snomed_concept "Forehead structure" "body structure")))
        (clinical_finding (snomed_concept "Tenderness" "finding") (finding_site (snomed_concept "Cheek structure" "body structure")))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable tick bite fever in patient with headache"
  (diagnosis
    (snomed_concept "African tick bite fever" "disorder")
    probable
  )
  adult
  ;; Q0 = Yes → Q1 = No → tick bite (see 47-headache-flowchart.md)
  (and
    (clinical_finding (snomed_concept "Headache" "finding"))
    (or (and (active_condition (snomed_concept "Fever" "finding"))
             (clinical_finding (snomed_concept "Generalized aches and pains" "finding")))
        (clinical_finding (snomed_concept "Common cold" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    )
    (clinical_finding (snomed_concept "Tick bite" "disorder"))
  )
)
(system_diagnosis_rule
  "Diagnose possible acute viral infection in patient with headache"
  (diagnosis
    (snomed_concept "Acute viral disease" "disorder")
    possible
  )
  adult
  ;; Q0 = Yes → Q1 = No → "If none of above, treat as acute viral infection"
  (and
    (clinical_finding (snomed_concept "Headache" "finding"))
    (or (and (active_condition (snomed_concept "Fever" "finding"))
             (clinical_finding (snomed_concept "Generalized aches and pains" "finding")))
        (clinical_finding (snomed_concept "Common cold" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    )
    ;; none of above: no sinusitis features (or no recent cold), no tick bite
    (or (no (clinical_finding (snomed_concept "Common cold" "disorder") (qualifier (snomed_concept "Recent" "qualifier value"))))
        (and (no (clinical_finding (snomed_concept "Nasal discharge" "finding") (qualifier (snomed_concept "Thick" "qualifier value"))))
             (no (clinical_finding (snomed_concept "Posterior rhinorrhea" "disorder") (qualifier (snomed_concept "Thick" "qualifier value"))))
             (no (clinical_finding (snomed_concept "Tenderness" "finding") (finding_site (snomed_concept "Forehead structure" "body structure"))))
             (no (clinical_finding (snomed_concept "Tenderness" "finding") (finding_site (snomed_concept "Cheek structure" "body structure")))))
    )
    (no (clinical_finding (snomed_concept "Tick bite" "disorder")))
  )
)
(system_diagnosis_rule
  "Diagnose probable migraine in patient with headache"
  (diagnosis
    (snomed_concept "Migraine" "disorder")
    probable
  )
  adult
  ;; Q0 = No → Q2 = Yes
  (and
    (clinical_finding (snomed_concept "Throbbing headache" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Photophobia" "finding"))
        (clinical_finding (snomed_concept "Phonophobia" "finding"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable tension headache in patient with headache"
  (diagnosis
    (snomed_concept "Tension-type headache" "disorder")
    probable
  )
  adult
  ;; Q2 = No → tightness around head or generalised pressure-like pain
  (and
    (clinical_finding (snomed_concept "Headache" "finding"))
    (or (clinical_finding (snomed_concept "Tightening pain" "finding") (finding_site (snomed_concept "Head structure" "body structure")))
        (clinical_finding (snomed_concept "Generalized headache" "finding"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable muscular neck pain in patient with headache"
  (diagnosis
    (snomed_concept "Myofascial neck pain" "finding")
    probable
  )
  adult
  ;; Q2 = No → constant aching pain, tender neck muscles
  (and
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Aching pain" "finding") (qualifier (snomed_concept "Continuous" "qualifier value")))
    (clinical_finding (snomed_concept "Tenderness" "finding") (finding_site (snomed_concept "Skeletal muscle structure of neck" "body structure")))
  )
)
(system_diagnosis_rule
  "Diagnose probable giant cell arteritis in patient with headache"
  (diagnosis
    (snomed_concept "Giant cell arteritis" "disorder")
    probable
  )
  adult
  ;; Q2 = No → patient > 50 years (not representable), pain over temples
  (clinical_finding (snomed_concept "Temporal headache" "finding"))
)
(system_priority_evaluation
  "Urgent: headache with danger signs (APC p47)"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Headache" "finding"))
    (or
      ;; Pregnant or 1 week postpartum, and BP >= 140/90
      (and (or (clinical_finding (snomed_concept "Pregnancy" "finding"))
               (<= (onset (clinical_finding (snomed_concept "Postpartum state" "finding"))) (time_ago 1 weeks)))
           (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 140)
               (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 90)))
      ;; BP >= 180/110 and not pregnant
      (and (or (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
               (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110))
           (no (clinical_finding (snomed_concept "Pregnancy" "finding"))))
      ;; New sudden asymmetric weakness or numbness of face, arm or leg; difficulty speaking
      (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty talking" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      ;; New vision problems or eye pain
      (clinical_finding (snomed_concept "Abnormal vision" "finding") (qualifier (snomed_concept "New" "qualifier value")))
      (clinical_finding (snomed_concept "Pain in eye" "finding"))
      ;; Sudden severe headache or dizziness
      (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      ;; Headache that is getting worse and more frequent
      (clinical_finding (snomed_concept "Frequent headache" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
      ;; Headache that wakes patient or is worse in the morning
      (clinical_finding (snomed_concept "Morning headache" "finding"))
      ;; Neck stiffness, drowsy/confused or purple/red rash: meningitis likely
      (active_condition (snomed_concept "Meningitis" "disorder"))
      ;; Decreased consciousness
      (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
      ;; Persistent nausea/vomiting
      (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))
      ;; Following a first seizure
      (clinical_finding (snomed_concept "Seizure" "finding") (qualifier (snomed_concept "First episode" "qualifier value")))
      ;; Recent head injury
      (clinical_finding (snomed_concept "Injury of head" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
      ;; Unequal pupils
      (clinical_finding (snomed_concept "Anisocoria" "disorder"))
    )
  )
)

;; Page 47 - Headache
;; Red box: "Give urgent attention to the patient with headache and any of:" (see 47-headache-flowchart.md)
(task
  "Check for urgent headache conditions"
  adult
  (clinical_finding (snomed_concept "Headache" "finding"))
  (check_for
    ;; Pregnant or 1 week postpartum, and BP >= 140/90 / BP >= 180/110 and not pregnant
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Postpartum state" "finding"))

    ;; New sudden asymmetric weakness or numbness of face, arm or leg; difficulty speaking: consider stroke or TIA
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))

    ;; New vision problems or eye pain
    (clinical_finding (snomed_concept "Abnormal vision" "finding") (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Pain in eye" "finding"))

    ;; Sudden severe headache or dizziness
    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))

    ;; Headache that is getting worse and more frequent
    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
    (clinical_finding (snomed_concept "Frequent headache" "finding"))

    ;; Headache that wakes patient or is worse in the morning
    (clinical_finding (snomed_concept "Wakes up during night" "finding"))
    (clinical_finding (snomed_concept "Morning headache" "finding"))

    ;; Neck stiffness, drowsy/confused or purple/red rash: meningitis likely
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))

    ;; Persistent headache since starting ART
    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Chronic persistent" "qualifier value")))
    (finding (snomed_concept "Procedure" "procedure") (snomed_concept "Highly active antiretroviral therapy" "procedure"))

    ;; Decreased consciousness, persistent nausea/vomiting, first seizure, recent head injury, unequal pupils
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))
    (clinical_finding (snomed_concept "Seizure" "finding") (qualifier (snomed_concept "First episode" "qualifier value")))
    (clinical_finding (snomed_concept "Injury of head" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Anisocoria" "disorder"))
  )
)
;; "Approach to the patient with headache not needing urgent attention" (flowchart)
(task
  "Check for causes of headache not needing urgent attention"
  adult
  (clinical_finding (snomed_concept "Headache" "finding"))
  (check_for
    ;; Does patient have fever and body pain or recent common cold?
    (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
    (clinical_finding (snomed_concept "Common cold" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))

    ;; Sinusitis: thick nasal/postnasal discharge, pain when pushing on forehead/cheeks
    (clinical_finding (snomed_concept "Nasal discharge" "finding") (qualifier (snomed_concept "Thick" "qualifier value")))
    (clinical_finding (snomed_concept "Posterior rhinorrhea" "disorder") (qualifier (snomed_concept "Thick" "qualifier value")))
    (clinical_finding (snomed_concept "Tenderness" "finding") (finding_site (snomed_concept "Forehead structure" "body structure")))
    (clinical_finding (snomed_concept "Tenderness" "finding") (finding_site (snomed_concept "Cheek structure" "body structure")))

    ;; Tick bite fever
    (clinical_finding (snomed_concept "Tick bite" "disorder"))

    ;; Migraine: recurrent throbbing headaches with nausea or light/noise sensitivity
    (clinical_finding (snomed_concept "Throbbing headache" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Photophobia" "finding"))
    (clinical_finding (snomed_concept "Phonophobia" "finding"))

    ;; Type and site of pain
    (clinical_finding (snomed_concept "Tightness sensation" "finding") (finding_site (snomed_concept "Head structure" "body structure")))
    (clinical_finding (snomed_concept "Generalized headache" "finding"))
    (clinical_finding (snomed_concept "Aching pain" "finding") (qualifier (snomed_concept "Continuous" "qualifier value")))
    (clinical_finding (snomed_concept "Tenderness" "finding") (finding_site (snomed_concept "Skeletal muscle structure of neck" "body structure")))
    (clinical_finding (snomed_concept "Temporal headache" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable meningitis in headache"
  (diagnosis
    (snomed_concept "Meningitis" "disorder")
    probable
  )
  adult
  ;; Red box: "Neck stiffness, drowsy/confused or purple/red rash: meningitis likely"
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
  "Diagnose possible stroke in headache"
  (diagnosis
    (snomed_concept "Cerebrovascular accident" "disorder")
    possible
  )
  adult
  ;; Red box: "New sudden asymmetric weakness or numbness of face, arm or leg; difficulty speaking: consider stroke or TIA"
  (and
    (clinical_finding (snomed_concept "Headache" "finding"))
    (or (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose possible TIA in headache"
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
        (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable sinusitis in headache"
  (diagnosis
    (snomed_concept "Sinusitis" "disorder")
    probable
  )
  adult
  ;; Flowchart: fever and body pain or recent common cold = Yes -> recent common cold and now any of ... -> Yes
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
  "Diagnose probable tick bite fever in headache"
  (diagnosis
    (snomed_concept "African tick bite fever" "disorder")
    probable
  )
  adult
  ;; Flowchart: fever and body pain or recent common cold = Yes -> sinusitis question = No -> tick bite -> tick bite fever likely
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
  "Diagnose possible acute viral infection in headache"
  (diagnosis
    (snomed_concept "Acute viral disease" "disorder")
    possible
  )
  adult
  ;; Flowchart: fever and body pain or recent common cold = Yes -> sinusitis question = No -> no tick bite
  ;; -> "If none of above, treat as acute viral infection" (the malaria-area branch is not representable)
  (and
    (clinical_finding (snomed_concept "Headache" "finding"))
    (or (and (active_condition (snomed_concept "Fever" "finding"))
             (clinical_finding (snomed_concept "Generalized aches and pains" "finding")))
        (clinical_finding (snomed_concept "Common cold" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    )
    ;; none of above: no recent cold, or none of the sinusitis features; and no tick bite
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
  "Diagnose probable migraine in headache"
  (diagnosis
    (snomed_concept "Migraine" "disorder")
    probable
  )
  adult
  ;; Flowchart: recurrent headaches that are throbbing, disabling with nausea or light/noise sensitivity
  ;; ("disabling" and "resolve completely within 72 hours" are not modelled; see remaining questions)
  (and
    (clinical_finding (snomed_concept "Throbbing headache" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Photophobia" "finding"))
        (clinical_finding (snomed_concept "Phonophobia" "finding"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable tension headache in headache"
  (diagnosis
    (snomed_concept "Tension-type headache" "disorder")
    probable
  )
  adult
  ;; Flowchart: tightness around head or generalised pressure-like pain
  (and
    (clinical_finding (snomed_concept "Headache" "finding"))
    (or (clinical_finding (snomed_concept "Tightness sensation" "finding") (finding_site (snomed_concept "Head structure" "body structure")))
        (clinical_finding (snomed_concept "Generalized headache" "finding"))
    )
  )
)
(system_diagnosis_rule
  "Diagnose probable muscular neck pain in headache"
  (diagnosis
    (snomed_concept "Myofascial neck pain" "finding")
    probable
  )
  adult
  ;; Flowchart: constant aching pain, tender neck muscles
  (and
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Aching pain" "finding") (qualifier (snomed_concept "Continuous" "qualifier value")))
    (clinical_finding (snomed_concept "Tenderness" "finding") (finding_site (snomed_concept "Skeletal muscle structure of neck" "body structure")))
  )
)
(system_diagnosis_rule
  "Diagnose probable giant cell arteritis in headache"
  (diagnosis
    (snomed_concept "Giant cell arteritis" "disorder")
    probable
  )
  adult
  ;; Flowchart: patient > 50 years, pain over temples (age is not representable; see remaining questions)
  (clinical_finding (snomed_concept "Temporal headache" "finding"))
)
(system_priority_evaluation
  "Urgent: headache with red-box danger signs"
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
      ;; BP >= 180/110 and not pregnant. "and not pregnant" only routes to page 148 instead of 177:
      ;; a pregnant patient with BP >= 180/110 already meets the line above, so inside this "or"
      ;; the clause changes nothing and is left out (the gate rejects "not"; "no" would need an
      ;; explicit "not pregnant" record and would miss men)
      (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
      (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110)
      ;; New sudden asymmetric weakness or numbness of face, arm or leg; difficulty speaking
      (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Numbness of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      (clinical_finding (snomed_concept "Difficulty talking" "finding"))
      ;; New vision problems or eye pain
      (clinical_finding (snomed_concept "Abnormal vision" "finding") (qualifier (snomed_concept "New" "qualifier value")))
      (clinical_finding (snomed_concept "Pain in eye" "finding"))
      ;; Sudden severe headache or dizziness
      (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      ;; Headache that is getting worse and more frequent
      (and (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
           (clinical_finding (snomed_concept "Frequent headache" "finding")))
      ;; Headache that wakes patient or is worse in the morning
      (clinical_finding (snomed_concept "Wakes up during night" "finding"))
      (clinical_finding (snomed_concept "Morning headache" "finding"))
      ;; Neck stiffness, drowsy/confused or purple/red rash: meningitis likely
      (active_condition (snomed_concept "Meningitis" "disorder"))
      ;; Persistent headache since starting ART
      (and (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Chronic persistent" "qualifier value")))
           (finding (snomed_concept "Procedure" "procedure") (snomed_concept "Highly active antiretroviral therapy" "procedure")))
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

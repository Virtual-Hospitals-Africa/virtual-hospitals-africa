;; Page 57 - Nausea/vomiting
(task
  "Check for urgent nausea/vomiting conditions"
  adult
  (or (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
  (check_for
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))

    (clinical_finding (snomed_concept "Diarrhea" "finding") (qualifier (snomed_concept "Watery" "qualifier value")))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Vibrio cholerae" "organism"))

    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    (clinical_finding (snomed_concept "Kussmaul's respiration" "finding"))

    (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
    (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
    (clinical_finding (snomed_concept "Right lower quadrant pain" "finding"))
    (clinical_finding (snomed_concept "Upper abdominal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Pain radiating to lumbar region of back" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
    (clinical_finding (snomed_concept "Obstipation" "disorder"))
    (clinical_finding (snomed_concept "Constipation" "finding"))
    (clinical_finding (snomed_concept "Passing flatus" "finding"))

    (clinical_finding (snomed_concept "Shock" "disorder"))
    (clinical_finding (snomed_concept "Hematemesis" "disorder"))
    (clinical_finding (snomed_concept "Jaundice" "finding"))

    (clinical_finding (snomed_concept "Nausea" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Generalized pruritus" "finding"))
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
    (clinical_finding (snomed_concept "Wheezing" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Food" "substance"))
    (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
    (clinical_finding (snomed_concept "Insect sting" "disorder"))
  )
)
(task
  "Check for causes of nausea/vomiting not needing urgent attention"
  adult
  (or (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
  (check_for
    (clinical_finding (snomed_concept "Thirst due to water deprivation" "finding"))
    (clinical_finding (snomed_concept "Xerostomia" "finding"))
    (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))

    (clinical_finding (snomed_concept "Finding of vomiting" "finding") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Abdominal colic" "finding"))
    (clinical_finding (snomed_concept "Diarrhea" "finding"))
    (clinical_finding (snomed_concept "Loss of appetite" "finding"))
    (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))

    (clinical_finding (snomed_concept "Epigastric pain" "finding"))
    (clinical_finding (snomed_concept "Pain provoked by eating" "finding"))
    (clinical_finding (snomed_concept "Hunger pain" "finding"))
    (clinical_finding (snomed_concept "Pain aggravated by position" "finding"))
  )
)
(task
  "Measure BMI and waist circumference in dyspepsia with nausea/vomiting"
  adult
  (active_condition (snomed_concept "Indigestion" "finding"))
  (measure
    (measurement (snomed_concept "Body mass index" "observable entity") kg/m²)
    (measurement (snomed_concept "Waist circumference" "observable entity") cm)
  )
)
(system_diagnosis_rule
  "Diagnose probable cholera in nausea/vomiting"
  (diagnosis (snomed_concept "Cholera" "disorder") probable)
  adult
  (and
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (clinical_finding (snomed_concept "Diarrhea" "finding") (qualifier (snomed_concept "Watery" "qualifier value")))
    (<= (onset (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Vibrio cholerae" "organism"))) (time_ago 5 days))
  )
)
(system_diagnosis_rule
  "Diagnose probable meningitis in nausea/vomiting"
  (diagnosis (snomed_concept "Meningitis" "disorder") probable)
  adult
  (and
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (or (clinical_finding (snomed_concept "Stiff neck" "finding"))
        (clinical_finding (snomed_concept "Drowsy" "finding"))
        (clinical_finding (snomed_concept "Acute confusion" "finding"))
        (clinical_finding (snomed_concept "Purpuric rash" "disorder")))
  )
)
(system_diagnosis_rule
  "Diagnose probable peritonitis in nausea/vomiting"
  (diagnosis (snomed_concept "Peritonitis" "disorder") probable)
  adult
  (and
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (or (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
        (clinical_finding (snomed_concept "Abdominal rigidity" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable appendicitis in nausea/vomiting"
  (diagnosis (snomed_concept "Acute appendicitis" "disorder") probable)
  adult
  (and
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (clinical_finding (snomed_concept "Right lower quadrant pain" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose probable pancreatitis in nausea/vomiting"
  (diagnosis (snomed_concept "Acute pancreatitis" "disorder") probable)
  adult
  (and
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (clinical_finding (snomed_concept "Upper abdominal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Pain radiating to lumbar region of back" "finding"))
  )
)
(system_diagnosis_rule
  "Diagnose possible anaphylaxis in nausea/vomiting"
  (diagnosis (snomed_concept "Anaphylaxis" "disorder") possible)
  adult
  (and
    (or (clinical_finding (snomed_concept "Nausea" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value"))))
    (or (clinical_finding (snomed_concept "Generalized pruritus" "finding"))
        (clinical_finding (snomed_concept "Generalized rash" "disorder"))
        (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
        (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
        (clinical_finding (snomed_concept "Wheezing" "finding"))
        (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
        (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
        (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
        (clinical_finding (snomed_concept "Dizziness" "finding"))
        (clinical_finding (snomed_concept "Collapse" "finding"))
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Food" "substance"))
        (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
        (clinical_finding (snomed_concept "Insect sting" "disorder")))
  )
)
(system_diagnosis_rule
  "Diagnose probable dehydration in nausea/vomiting"
  (diagnosis (snomed_concept "Dehydration" "disorder") probable)
  adult
  (and
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (or (clinical_finding (snomed_concept "Thirst due to water deprivation" "finding"))
        (clinical_finding (snomed_concept "Xerostomia" "finding"))
        (clinical_finding (snomed_concept "Decreased skin turgor" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose possible pregnancy in nausea/vomiting"
  (diagnosis (snomed_concept "Pregnancy" "finding") possible)
  adult
  (or (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
)
(system_diagnosis_rule
  "Diagnose probable gastroenteritis in nausea/vomiting"
  (diagnosis (snomed_concept "Inflammation of stomach and intestine" "disorder") probable)
  adult
  (and
    (clinical_finding (snomed_concept "Finding of vomiting" "finding") (qualifier (snomed_concept "Recent" "qualifier value")))
    (or (clinical_finding (snomed_concept "Abdominal colic" "finding"))
        (clinical_finding (snomed_concept "Diarrhea" "finding"))
        (clinical_finding (snomed_concept "Loss of appetite" "finding"))
        (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
        (active_condition (snomed_concept "Fever" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable dyspepsia in nausea/vomiting"
  (diagnosis (snomed_concept "Indigestion" "finding") probable)
  adult
  (and
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (clinical_finding (snomed_concept "Epigastric pain" "finding"))
    (or (clinical_finding (snomed_concept "Pain provoked by eating" "finding"))
        (clinical_finding (snomed_concept "Hunger pain" "finding"))
        (clinical_finding (snomed_concept "Pain aggravated by position" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable GORD in nausea/vomiting with dyspepsia"
  (diagnosis (snomed_concept "Gastroesophageal reflux disease" "disorder") probable)
  adult
  (and
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (clinical_finding (snomed_concept "Epigastric pain" "finding"))
    (or (clinical_finding (snomed_concept "Pain provoked by eating" "finding"))
        (clinical_finding (snomed_concept "Hunger pain" "finding"))
        (clinical_finding (snomed_concept "Pain aggravated by position" "finding")))
    (>= (measurement (snomed_concept "Body mass index" "observable entity") kg/m²) 25)
    (>= (measurement (snomed_concept "Waist circumference" "observable entity") cm) 80)
  )
)

(system_priority_evaluation
  "Urgent: nausea/vomiting with headache"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (clinical_finding (snomed_concept "Headache" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: nausea/vomiting with chest pain"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: nausea/vomiting with cholera"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (active_condition (snomed_concept "Cholera" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: nausea/vomiting with meningitis"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (active_condition (snomed_concept "Meningitis" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: nausea/vomiting with peritonitis"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (active_condition (snomed_concept "Peritonitis" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: nausea/vomiting with acute appendicitis"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (active_condition (snomed_concept "Acute appendicitis" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: nausea/vomiting with acute pancreatitis"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (active_condition (snomed_concept "Acute pancreatitis" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: nausea/vomiting with shock"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (clinical_finding (snomed_concept "Shock" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: nausea/vomiting with systolic blood pressure < 80 mmHg"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 80)
  )
)

(system_priority_evaluation
  "Urgent: nausea/vomiting with hematemesis"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (clinical_finding (snomed_concept "Hematemesis" "disorder"))
  )
)

(system_priority_evaluation
  "Urgent: nausea/vomiting with jaundice"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: nausea/vomiting with abdominal pain or distension of abdomen and obstipation or constipation and no passing flatus"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (or (clinical_finding (snomed_concept "Abdominal pain" "finding"))
        (clinical_finding (snomed_concept "Distension of abdomen" "finding")))
    (or (clinical_finding (snomed_concept "Obstipation" "disorder"))
        (and (clinical_finding (snomed_concept "Constipation" "finding"))
             (no (clinical_finding (snomed_concept "Passing flatus" "finding")))))
  )
)

(system_priority_evaluation
  "Urgent: nausea/vomiting with drowsy"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: nausea/vomiting with acute confusion"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: nausea/vomiting with kussmaul's respiration"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (clinical_finding (snomed_concept "Kussmaul's respiration" "finding"))
  )
)

(system_priority_evaluation
  "Urgent: nausea/vomiting with nausea (sudden onset) or finding of vomiting (sudden onset) and generalized pruritus …"
  adult
  Urgent
  (and
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
    (or (clinical_finding (snomed_concept "Nausea" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value"))))
    (or (clinical_finding (snomed_concept "Generalized pruritus" "finding"))
        (clinical_finding (snomed_concept "Generalized rash" "disorder"))
        (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
        (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
        (clinical_finding (snomed_concept "Wheezing" "finding"))
        (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
        (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
        (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
        (clinical_finding (snomed_concept "Dizziness" "finding"))
        (clinical_finding (snomed_concept "Collapse" "finding"))
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
        (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Food" "substance"))
        (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
        (clinical_finding (snomed_concept "Insect sting" "disorder")))
  )
)

;; Page 56 - Abdominal pain
(task
  "Check for urgent abdominal pain conditions"
  adult
  (clinical_finding (snomed_concept "Abdominal pain" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
    (clinical_finding (snomed_concept "Postpartum state" "finding"))
    (clinical_finding (snomed_concept "Miscarriage" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Unable to void urine" "finding"))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (clinical_finding (snomed_concept "Abdominal mass" "finding"))
    (clinical_finding (snomed_concept "Mass of pelvic structure" "finding"))
    (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))

    (clinical_finding (snomed_concept "Right lower quadrant pain" "finding"))
    (clinical_finding (snomed_concept "Right upper quadrant pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Upper abdominal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Pain radiating to lumbar region of back" "finding"))
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Loss of appetite" "finding"))
    (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
    (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
    (clinical_finding (snomed_concept "Vaginal discharge problem" "finding"))
    (clinical_finding (snomed_concept "Obstipation" "disorder"))
    (clinical_finding (snomed_concept "Unable to break wind" "finding"))

    (clinical_finding (snomed_concept "Abdominal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Generalized pruritus" "finding"))
    (clinical_finding (snomed_concept "Generalized rash" "disorder"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
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
  "Check for causes of abdominal pain not needing urgent attention"
  adult
  (clinical_finding (snomed_concept "Abdominal pain" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Abdominal colic" "finding"))
    (clinical_finding (snomed_concept "Diarrhea" "finding"))
    (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))

    (clinical_finding (snomed_concept "Abdominal colic" "finding") (finding_site (snomed_concept "Lower abdomen structure" "body structure")) (qualifier (snomed_concept "During menstruation" "qualifier value")))

    (clinical_finding (snomed_concept "Epigastric pain" "finding"))
    (clinical_finding (snomed_concept "Epigastric pain" "finding") (qualifier (snomed_concept "Postprandial" "qualifier value")))
    (clinical_finding (snomed_concept "Hunger pain" "finding"))
    (clinical_finding (snomed_concept "Pain aggravated by position" "finding"))

    (clinical_finding (snomed_concept "Recurrent abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Abdominal discomfort" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value")))
    (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
    (clinical_finding (snomed_concept "Abnormal frequency of defecation" "finding"))
    (clinical_finding (snomed_concept "Abnormal feces" "finding"))
    (clinical_finding (snomed_concept "Mucus in stool" "finding"))
  )
)
(task
  "Measure waist circumference and BMI for dyspepsia"
  adult
  (diagnosis (snomed_concept "Indigestion" "finding") probable)
  (measure
    (measurement (snomed_concept "Body mass index" "observable entity") kg/m²)
    (measurement (snomed_concept "Waist circumference" "observable entity") cm)
  )
)

;; Red box "X likely" diagnoses
(system_diagnosis_rule
  "Diagnose probable abdominal aortic aneurysm from abdominal pain"
  (diagnosis (snomed_concept "Abdominal aortic aneurysm" "disorder") probable)
  adult
  (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))
)
(system_diagnosis_rule
  "Diagnose probable acute appendicitis from abdominal pain"
  (diagnosis (snomed_concept "Acute appendicitis" "disorder") probable)
  adult
  (and
    (clinical_finding (snomed_concept "Right lower quadrant pain" "finding"))
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
        (active_condition (snomed_concept "Fever" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable peritonitis from abdominal pain"
  (diagnosis (snomed_concept "Peritonitis" "disorder") probable)
  adult
  (or (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
      (clinical_finding (snomed_concept "Abdominal rigidity" "finding")))
)
(system_diagnosis_rule
  "Diagnose probable acute cholecystitis from abdominal pain"
  (diagnosis (snomed_concept "Acute cholecystitis" "disorder") probable)
  adult
  (and
    (clinical_finding (snomed_concept "Right upper quadrant pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (active_condition (snomed_concept "Fever" "finding"))
        (clinical_finding (snomed_concept "Loss of appetite" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable acute pancreatitis from abdominal pain"
  (diagnosis (snomed_concept "Acute pancreatitis" "disorder") probable)
  adult
  (and
    (clinical_finding (snomed_concept "Upper abdominal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Pain radiating to lumbar region of back" "finding"))
    (or (clinical_finding (snomed_concept "Nausea" "finding"))
        (clinical_finding (snomed_concept "Finding of vomiting" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable pelvic infection from abdominal pain"
  (diagnosis (snomed_concept "Female pelvic inflammatory disease" "disorder") probable)
  adult
  (and
    (or (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
        (clinical_finding (snomed_concept "Abdominal rigidity" "finding")))
    (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
    (clinical_finding (snomed_concept "Vaginal discharge problem" "finding"))
  )
)
;; "If sudden abdominal pain and any of ... check for anaphylaxis" (pointer to page 28)
(system_diagnosis_rule
  "Diagnose possible anaphylaxis from sudden abdominal pain"
  (diagnosis (snomed_concept "Anaphylaxis" "disorder") possible)
  adult
  (and
    (clinical_finding (snomed_concept "Abdominal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (or (clinical_finding (snomed_concept "Generalized pruritus" "finding"))
        (clinical_finding (snomed_concept "Generalized rash" "disorder"))
        (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
        (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
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

;; Approach to the patient with abdominal pain not needing urgent attention
(system_diagnosis_rule
  "Diagnose probable gastroenteritis from abdominal pain"
  (diagnosis (snomed_concept "Inflammation of stomach and intestine" "disorder") probable)
  adult
  (and
    (clinical_finding (snomed_concept "Abdominal colic" "finding"))
    (or (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
        (clinical_finding (snomed_concept "Diarrhea" "finding"))
        (clinical_finding (snomed_concept "Loss of appetite" "finding"))
        (clinical_finding (snomed_concept "Generalized aches and pains" "finding"))
        (active_condition (snomed_concept "Fever" "finding")))
  )
)
(system_diagnosis_rule
  "Diagnose probable dysmenorrhoea from abdominal pain"
  (diagnosis (snomed_concept "Dysmenorrhea" "disorder") probable)
  adult
  (clinical_finding (snomed_concept "Abdominal colic" "finding") (finding_site (snomed_concept "Lower abdomen structure" "body structure")) (qualifier (snomed_concept "During menstruation" "qualifier value")))
)
(system_diagnosis_rule
  "Diagnose probable dyspepsia from abdominal pain"
  (diagnosis (snomed_concept "Indigestion" "finding") probable)
  adult
  (or
    (clinical_finding (snomed_concept "Epigastric pain" "finding") (qualifier (snomed_concept "Postprandial" "qualifier value")))
    (and
      (clinical_finding (snomed_concept "Epigastric pain" "finding"))
      (or (clinical_finding (snomed_concept "Hunger pain" "finding"))
          (clinical_finding (snomed_concept "Pain aggravated by position" "finding"))))
  )
)
(system_diagnosis_rule
  "Diagnose probable GORD from dyspepsia with raised BMI and waist"
  (diagnosis (snomed_concept "Gastroesophageal reflux disease" "disorder") probable)
  adult
  (and
    (or
      (clinical_finding (snomed_concept "Epigastric pain" "finding") (qualifier (snomed_concept "Postprandial" "qualifier value")))
      (and
        (clinical_finding (snomed_concept "Epigastric pain" "finding"))
        (or (clinical_finding (snomed_concept "Hunger pain" "finding"))
            (clinical_finding (snomed_concept "Pain aggravated by position" "finding")))))
    (>= (measurement (snomed_concept "Body mass index" "observable entity") kg/m²) 25)
    ;; page: >= 80cm (woman) or >= 94cm (man); sex cannot be expressed, so the lower cut-off is used
    (>= (measurement (snomed_concept "Waist circumference" "observable entity") cm) 80)
  )
)
(system_diagnosis_rule
  "Diagnose probable irritable bowel syndrome from abdominal pain"
  (diagnosis (snomed_concept "Irritable bowel syndrome" "disorder") probable)
  adult
  (and
    (or (clinical_finding (snomed_concept "Recurrent abdominal pain" "finding"))
        (clinical_finding (snomed_concept "Abdominal discomfort" "finding") (qualifier (snomed_concept "Recurrent" "qualifier value"))))
    ;; "pain relieved with passing stool" has no SNOMED concept and is not encoded
    (any2
      (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
      (or (clinical_finding (snomed_concept "Abnormal frequency of defecation" "finding"))
          (clinical_finding (snomed_concept "Abnormal feces" "finding")))
      (clinical_finding (snomed_concept "Mucus in stool" "finding")))
  )
)

;; Red box: "Give urgent attention to the patient with abdominal pain and any of:"
(system_priority_evaluation
  "Urgent: abdominal pain with red-box signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (or
      (clinical_finding (snomed_concept "Chest pain" "finding"))
      (and (clinical_finding (snomed_concept "Pregnancy" "finding"))
           (clinical_finding (snomed_concept "Bleeding from vagina" "finding")))
      (clinical_finding (snomed_concept "Postpartum state" "finding"))
      (clinical_finding (snomed_concept "Miscarriage" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
      (clinical_finding (snomed_concept "Induced termination of pregnancy" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
      (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)
      (clinical_finding (snomed_concept "Unable to void urine" "finding"))
      (clinical_finding (snomed_concept "Jaundice" "finding"))
      (clinical_finding (snomed_concept "Abdominal mass" "finding"))
      (clinical_finding (snomed_concept "Mass of pelvic structure" "finding"))
      (active_condition (snomed_concept "Abdominal aortic aneurysm" "disorder"))
      (active_condition (snomed_concept "Acute appendicitis" "disorder"))
      (active_condition (snomed_concept "Peritonitis" "disorder"))
      (active_condition (snomed_concept "Acute cholecystitis" "disorder"))
      (active_condition (snomed_concept "Acute pancreatitis" "disorder"))
      ;; "No stools or flatus/wind for past 24 hours"
      (and (>= (onset (clinical_finding (snomed_concept "Obstipation" "disorder"))) (time_ago 24 hours))
           (>= (onset (clinical_finding (snomed_concept "Unable to break wind" "finding"))) (time_ago 24 hours)))
      ;; "If sudden abdominal pain and any of ... check for anaphylaxis"
      (and
        (clinical_finding (snomed_concept "Abdominal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        (or (clinical_finding (snomed_concept "Generalized pruritus" "finding"))
            (clinical_finding (snomed_concept "Generalized rash" "disorder"))
            (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
            (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
            (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
            (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
            (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
            (clinical_finding (snomed_concept "Dizziness" "finding"))
            (clinical_finding (snomed_concept "Collapse" "finding"))
            (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
            (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Food" "substance"))
            (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
            (clinical_finding (snomed_concept "Insect sting" "disorder"))))
      (active_condition (snomed_concept "Female pelvic inflammatory disease" "disorder"))
    )
  )
)

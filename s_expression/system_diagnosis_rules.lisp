(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Anaphylaxis" "disorder")
    probable
  )
  adult
  (or
    (and (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Fish" "substance"))
         (allergy (snomed_concept "Fish" "substance")))
    (and (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Milk" "substance"))
         (allergy (snomed_concept "Milk" "substance")))
    (and (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Eggs (edible)" "substance"))
         (allergy (snomed_concept "Eggs (edible)" "substance")))
    (and (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Tree nut" "substance"))
         (allergy (snomed_concept "Tree nut" "substance")))
    (and (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Peanut" "substance"))
         (allergy (snomed_concept "Peanut" "substance")))
    (and
      (or (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Fish" "substance"))
          (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Milk" "substance"))
          (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Eggs (edible)" "substance"))
          (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Tree nut" "substance"))
          (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Peanut" "substance"))
      )
      (any2
        (or (clinical_finding (snomed_concept "Itching" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
            (clinical_finding (snomed_concept "Eruption" "morphologic abnormality") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
            (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
            (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
        )
        (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
        (or (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
            (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
            (clinical_finding (snomed_concept "Dizziness" "finding"))
            (clinical_finding (snomed_concept "Collapse" "finding"))
        )
        (or (clinical_finding (snomed_concept "Abdominal pain" "finding"))
            (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
        )
      )
    )
    (and
      (or (clinical_finding (snomed_concept "Itching" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
          (clinical_finding (snomed_concept "Eruption" "morphologic abnormality") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
          (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
          (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
      )
      (or (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
          (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
          (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
          (clinical_finding (snomed_concept "Dizziness" "finding"))
          (clinical_finding (snomed_concept "Collapse" "finding"))
          (clinical_finding (snomed_concept "Abdominal pain" "finding"))
          (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      )
    )
  )
)
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Anaphylaxis" "disorder")
    possible
  )
  adult
  (or (clinical_finding (snomed_concept "Itching" "finding"))
      (clinical_finding (snomed_concept "Eruption" "morphologic abnormality"))
      (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
      (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
      (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
  )
)
;; Page 22 - Bites and Stings: snake bite poisoning
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Poisoning caused by venomous snake" "disorder")
    possible
  )
  adult
  (or
    (clinical_finding (snomed_concept "Snake bite - wound" "disorder"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Snake venom" "substance"))
  )
)
;; Page 24 - Fever: meningitis likely with neck stiffness, or drowsy/confused with purpuric rash
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Meningitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Fever" "finding"))
    (or
      (clinical_finding (snomed_concept "Stiff neck" "finding"))
      (and
        (or
          (clinical_finding (snomed_concept "Drowsy" "finding"))
          (clinical_finding (snomed_concept "Confusional state" "disorder"))
        )
        (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
      )
    )
  )
)
;; Page 24 - Fever: appendicitis likely with right lower abdominal tenderness
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Acute appendicitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Fever" "finding"))
    (clinical_finding (snomed_concept "Tenderness of right lower quadrant of abdomen" "finding"))
  )
)
;; Cross-cutting: Stroke/TIA signs
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Cerebrovascular accident" "disorder")
    possible
  )
  adult
  (and
    (or
      (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
      (clinical_finding (snomed_concept "Generalized muscle weakness" "finding"))
    )
    (or
      (clinical_finding (snomed_concept "Difficulty talking" "finding"))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
    )
  )
)
;; Page 25 - Strangulated inguinal hernia likely with groin mass + bowel obstruction signs
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Strangulated inguinal hernia" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Groin mass" "finding"))
    (or
      (clinical_finding (snomed_concept "Severe pain" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (clinical_finding (snomed_concept "Unable to break wind" "finding"))
    )
  )
)
;; Page 25 - Aneurysm likely with pulsatile groin mass
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Aneurysm" "disorder")
    possible
  )
  adult
  (clinical_finding (snomed_concept "Groin mass" "finding") (qualifier (snomed_concept "Pulsatile" "qualifier value")))
)
;; Page 26 - Heart failure likely with orthopnea and leg swelling
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Heart failure" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
  )
)
;; Page 31 - Eye: Orbital cellulitis likely with swollen painful eyelid
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Orbital cellulitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Swelling of eyelid" "finding"))
    (clinical_finding (snomed_concept "Pain in eye" "finding"))
  )
)
;; Page 31 - Eye: Acute angle-closure glaucoma with painful eye and haloes/blurred vision
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Angle-closure glaucoma" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Pain in eye" "finding"))
    (or
      (clinical_finding (snomed_concept "Sees haloes around lights" "finding"))
      (clinical_finding (snomed_concept "Blurring of visual image" "finding"))
      (clinical_finding (snomed_concept "Headache" "finding"))
      (clinical_finding (snomed_concept "Nausea and vomiting" "disorder"))
    )
  )
)
;; Page 32 - Face: Facial cellulitis likely with painful swelling and fever
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Cellulitis of face" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Facial swelling" "finding"))
    (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
  )
)
;; Page 32 - Face: Kidney disease likely with facial swelling and blood/protein in urine
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Kidney disease" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Facial swelling" "finding"))
    (or
      (clinical_finding (snomed_concept "Blood in urine" "finding"))
      (clinical_finding (snomed_concept "Proteinuria" "finding"))
    )
  )
)
;; Page 37 - Chest Pain: Ischaemic heart disease likely with radiating pain or pallor/sweating
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Ischemic heart disease" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (or
      (clinical_finding (snomed_concept "Radiating chest pain" "finding"))
      (clinical_finding (snomed_concept "Pain radiating to jaw" "finding"))
      (clinical_finding (snomed_concept "Pain radiating to neck" "finding"))
      (clinical_finding (snomed_concept "Pain radiating to left arm" "finding"))
      (clinical_finding (snomed_concept "Pain radiating to right arm" "finding"))
      (clinical_finding (snomed_concept "Pallor of skin of face" "finding"))
      (clinical_finding (snomed_concept "Sweating" "finding"))
    )
  )
)
;; Page 38 - Cough/Breathing: Pulmonary embolism likely with calf swelling and breathlessness
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Pulmonary embolism" "disorder")
    possible
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Cough" "finding"))
        (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    )
    (clinical_finding (snomed_concept "Swollen calf" "finding"))
  )
)
;; Page 38 - Cough/Breathing: Tension pneumothorax likely with breathlessness, chest pain and hypotension
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Tension pneumothorax" "disorder")
    possible
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Cough" "finding"))
        (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    )
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
  )
)
;; Page 44 - Abdominal Pain: Peritonitis likely with guarding, rigidity or rebound tenderness
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Peritonitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (or
      (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
      (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
      (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
    )
  )
)
;; Page 44 - Abdominal Pain: Acute cholecystitis likely with RUQ tenderness and nausea/fever/anorexia
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Acute cholecystitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Tenderness of right upper quadrant of abdomen" "finding"))
    (or
      (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (clinical_finding (snomed_concept "Fever" "finding"))
      (clinical_finding (snomed_concept "Loss of appetite" "finding"))
    )
  )
)
;; Page 44 - Abdominal Pain: Acute pancreatitis likely with upper abdominal pain spreading to back
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Acute pancreatitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to lumbar region of back" "finding"))
    (or
      (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    )
  )
)
;; Page 44 - Abdominal Pain: Abdominal aortic aneurysm likely with pulsatile abdominal mass
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Abdominal aortic aneurysm" "disorder")
    possible
  )
  adult
  (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))
)
;; Page 59 - Urinary Symptoms: Kidney stone likely with blood in urine and flank pain
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Kidney stone" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Flank pain" "finding"))
  )
)
;; Page 59 - Urinary Symptoms: Acute pyelonephritis likely with flank pain, fever and systemic signs
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Acute pyelonephritis" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Flank pain" "finding"))
    (clinical_finding (snomed_concept "Fever" "finding"))
    (or
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (>= (measurement (snomed_concept "Heart rate" "observable entity") bpm) 100)
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
    )
  )
)
;; Page 62 - Joint Symptoms: Infective arthritis likely with warm swollen painful joint
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Infective arthritis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Pain of joint" "finding"))
    (clinical_finding (snomed_concept "Joint warm" "finding"))
    (clinical_finding (snomed_concept "Joint swelling" "finding"))
  )
)
;; Page 65 - Leg Symptoms: Deep venous thrombosis likely with swollen painful calf
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Deep venous thrombosis" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Pain in calf" "finding"))
    (clinical_finding (snomed_concept "Swollen calf" "finding"))
  )
)
;; Page 65 - Leg Symptoms: Acute lower limb ischemia likely with pain, absent pulse and neurological signs
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Acute lower limb ischemia" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Pain in lower limb" "finding"))
    (clinical_finding (snomed_concept "Absent pulse" "finding"))
    (or
      (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
      (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
    )
  )
)
;; Page 67 - Skin Symptoms: Meningococcal disease likely with purpuric rash and meningitis signs
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Meningococcal infectious disease" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    (or
      (clinical_finding (snomed_concept "Stiff neck" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Confusional state" "disorder"))
      (clinical_finding (snomed_concept "Fever" "finding"))
    )
  )
)
;; Page 67 - Skin Symptoms: Adverse drug reaction likely with drug-induced eruption and systemic signs
(system_diagnosis_rule
  (diagnosis
    (snomed_concept "Adverse reaction caused by drug" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
    (or
      (clinical_finding (snomed_concept "Fever" "finding"))
      (clinical_finding (snomed_concept "Abdominal pain" "finding"))
      (clinical_finding (snomed_concept "Jaundice" "finding"))
      (clinical_finding (snomed_concept "Blister of skin" "disorder"))
    )
  )
)
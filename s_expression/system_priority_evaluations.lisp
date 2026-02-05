(system_priority_evaluation
  all_ages
  Emergency
  (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
)
(system_priority_evaluation
  (ages "older child" "younger child")
  Emergency
  (and
    (clinical_finding (snomed_concept "Cold hands" "finding"))
    (any2 (clinical_finding (snomed_concept "Weak arterial pulse" "finding"))
          (clinical_finding (snomed_concept "Pulse fast" "finding"))
          (clinical_finding (snomed_concept "Lethargy" "finding"))
    )
  )
)
(system_priority_evaluation
  all_ages
  Urgent
  (diagnosis
    (snomed_concept "Anaphylaxis" "disorder")
    probable
  )
)
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (or
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      (clinical_finding (snomed_concept "Electrical burn" "disorder"))
      (clinical_finding (snomed_concept "Chemical burn" "disorder"))
      (clinical_finding (snomed_concept "Full thickness burn" "disorder"))
      (clinical_finding (snomed_concept "Partial thickness burn" "disorder") (qualifier (snomed_concept "Extensive" "qualifier value")))
      (clinical_finding (snomed_concept "Smoke inhalation injury" "disorder"))
      (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Chest structure" "body structure")) (qualifier (snomed_concept "Circumferential" "qualifier value")))
      (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Limb structure" "body structure")) (qualifier (snomed_concept "Circumferential" "qualifier value")))
      (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Face structure" "body structure")))
      (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Hand structure" "body structure")))
      (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Foot structure" "body structure")))
      (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Genital structure" "body structure")))
      (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Joint structure" "body structure")))
      (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %) 94)
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
    )
  )
)
;; Page 22 - Bites and Stings
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Bite - wound" "disorder"))
    (or
      (clinical_finding (snomed_concept "Snake bite - wound" "disorder"))
      (clinical_finding (snomed_concept "Generalized muscle weakness" "finding"))
      (clinical_finding (snomed_concept "Has drooping eyelids" "finding"))
      (clinical_finding (snomed_concept "Difficulty swallowing" "finding"))
      (clinical_finding (snomed_concept "Difficulty talking" "finding"))
      (clinical_finding (snomed_concept "Diplopia" "disorder"))
      (clinical_finding (snomed_concept "Deep bite wound" "morphologic abnormality"))
      (clinical_finding (snomed_concept "Bite - wound" "disorder") (finding_site (snomed_concept "Joint structure" "body structure")))
      (clinical_finding (snomed_concept "Bite - wound" "disorder") (finding_site (snomed_concept "Bone structure" "body structure")))
      (clinical_finding (snomed_concept "Infection of bite wound" "disorder"))
      (clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Excessive" "qualifier value")))
      (clinical_finding (snomed_concept "Bleeding" "finding") (qualifier (snomed_concept "Pulsatile" "qualifier value")))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
    )
  )
)
;; Page 24 - Fever: Emergency if seizure or decreased consciousness
(system_priority_evaluation
  adult
  Emergency
  (and
    (clinical_finding (snomed_concept "Fever" "finding"))
    (or
      (clinical_finding (snomed_concept "Seizure" "finding"))
      (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    )
  )
)
;; Page 24 - Fever: Urgent for other danger signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Fever" "finding"))
    (or
      (clinical_finding (snomed_concept "Stiff neck" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Confusional state" "disorder"))
      (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (clinical_finding (snomed_concept "Tenderness of right lower quadrant of abdomen" "finding"))
      (clinical_finding (snomed_concept "Acute abdominal pain" "finding"))
      (clinical_finding (snomed_concept "Backache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      (clinical_finding (snomed_concept "Jaundice" "finding"))
      (clinical_finding (snomed_concept "Easy bruising" "finding"))
      (clinical_finding (snomed_concept "Finding of tendency to bleed" "finding"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (> (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
    )
  )
)
;; Cross-cutting: Stroke/TIA signs (asymmetric weakness/numbness + speech or visual disturbance)
(system_priority_evaluation
  adult
  Urgent
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
;; Page 25 - Lump/Swelling in Neck, Axilla or Groin
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Groin mass" "finding"))
    (or
      (clinical_finding (snomed_concept "Strangulated inguinal hernia" "disorder"))
      (clinical_finding (snomed_concept "Irreducible inguinal hernia" "disorder"))
      (clinical_finding (snomed_concept "Aneurysm" "disorder") (qualifier (snomed_concept "Pulsatile" "qualifier value")))
      (clinical_finding (snomed_concept "Severe pain" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (clinical_finding (snomed_concept "Unable to break wind" "finding"))
    )
  )
)
;; Page 26 - Weakness or Tiredness
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Fatigue" "finding"))
    (or
      (clinical_finding (snomed_concept "Chest pain" "finding"))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (clinical_finding (snomed_concept "Orthopnea" "finding"))
      (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
      (clinical_finding (snomed_concept "Signs of dehydration" "finding"))
      (clinical_finding (snomed_concept "Anemia" "disorder"))
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)
      (> (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
    )
  )
)
;; Page 27 - Pallor and Anaemia
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
    (or
      (clinical_finding (snomed_concept "Palpitations" "finding"))
      (clinical_finding (snomed_concept "Dizziness" "finding"))
      (clinical_finding (snomed_concept "Collapse" "finding"))
      (clinical_finding (snomed_concept "Chest pain" "finding"))
      (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
      (clinical_finding (snomed_concept "Jaundice" "finding"))
      (clinical_finding (snomed_concept "Melena" "disorder"))
      (clinical_finding (snomed_concept "Hematochezia" "finding"))
      (clinical_finding (snomed_concept "Easy bruising" "finding"))
      (clinical_finding (snomed_concept "Finding of tendency to bleed" "finding"))
      (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (>= (measurement (snomed_concept "Heart rate" "observable entity") bpm) 100)
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
    )
  )
)
;; Page 28 - Collapse/Falls: Emergency if seizure or decreased consciousness
(system_priority_evaluation
  adult
  Emergency
  (and
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (or
      (clinical_finding (snomed_concept "Seizure" "finding"))
      (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    )
  )
)
;; Page 28 - Collapse/Falls: Urgent for other danger signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (or
      (clinical_finding (snomed_concept "Chest pain" "finding"))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (clinical_finding (snomed_concept "Palpitations" "finding"))
      (clinical_finding (snomed_concept "Pulse slow" "finding"))
      (clinical_finding (snomed_concept "Pulse irregular" "finding"))
      (clinical_finding (snomed_concept "Hematemesis" "disorder"))
      (clinical_finding (snomed_concept "Hematochezia" "finding"))
      (clinical_finding (snomed_concept "Acute abdominal pain" "finding"))
      (clinical_finding (snomed_concept "Backache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      (clinical_finding (snomed_concept "Abnormal vaginal bleeding" "finding"))
      (clinical_finding (snomed_concept "Injury of head" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Heart rate" "observable entity") bpm) 50)
    )
  )
)
;; Page 29 - Dizziness
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (or
      (clinical_finding (snomed_concept "Chest pain" "finding"))
      (clinical_finding (snomed_concept "Orthopnea" "finding"))
      (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
      (clinical_finding (snomed_concept "Injury of head" "disorder"))
      (clinical_finding (snomed_concept "Unable to stand" "finding"))
      (clinical_finding (snomed_concept "Nausea and vomiting" "disorder"))
      (clinical_finding (snomed_concept "Abnormal ocular motility" "finding"))
      (clinical_finding (snomed_concept "Pulse slow" "finding"))
      (clinical_finding (snomed_concept "Pulse irregular" "finding"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (< (measurement (snomed_concept "Heart rate" "observable entity") bpm) 50)
    )
  )
)
;; Page 30 - Headache: Emergency if decreased consciousness or seizure
(system_priority_evaluation
  adult
  Emergency
  (and
    (clinical_finding (snomed_concept "Headache" "finding"))
    (or
      (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
      (clinical_finding (snomed_concept "Seizure" "finding"))
    )
  )
)
;; Page 30 - Headache: Urgent for other danger signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Headache" "finding"))
    (or
      (clinical_finding (snomed_concept "Stiff neck" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Confusional state" "disorder"))
      (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
      (clinical_finding (snomed_concept "Pain in eye" "finding"))
      (clinical_finding (snomed_concept "Nausea and vomiting" "disorder"))
      (clinical_finding (snomed_concept "Injury of head" "disorder"))
      (clinical_finding (snomed_concept "Anisocoria" "disorder"))
      (clinical_finding (snomed_concept "Morning headache" "finding"))
      (clinical_finding (snomed_concept "Frequent headache" "finding"))
      (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
      (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110)
    )
  )
)
;; Page 31 - Eye/Vision: Urgent for standalone urgent eye conditions
(system_priority_evaluation
  adult
  Urgent
  (or
    (clinical_finding (snomed_concept "Orbital cellulitis" "disorder"))
    (clinical_finding (snomed_concept "Sudden visual loss" "disorder"))
    (clinical_finding (snomed_concept "Penetrating wound of eye" "disorder"))
    (clinical_finding (snomed_concept "Laceration of eyelid" "disorder"))
    (clinical_finding (snomed_concept "Chemical burn" "disorder") (finding_site (snomed_concept "Structure of eye proper" "body structure")))
    (clinical_finding (snomed_concept "Corneal ulcer" "disorder"))
    (clinical_finding (snomed_concept "Corneal opacity" "disorder"))
    (clinical_finding (snomed_concept "Herpes zoster keratoconjunctivitis" "disorder"))
    (clinical_finding (snomed_concept "Ptosis of eyelid" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)
;; Page 32 - Face: Facial cellulitis with fever
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Cellulitis of face" "disorder"))
    (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
  )
)
;; Page 32 - Face: Kidney disease signs with facial swelling
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Facial swelling" "finding"))
    (or
      (clinical_finding (snomed_concept "Blood in urine" "finding"))
      (clinical_finding (snomed_concept "Proteinuria" "finding"))
    )
  )
)
;; Page 34 - Nose: Head injury with nose symptoms (possible CSF leak)
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Injury of head" "disorder"))
    (clinical_finding (finding_site (snomed_concept "Nasal structure" "body structure")))
  )
)
;; Page 35 - Mouth/Throat: Airway obstruction
(system_priority_evaluation
  adult
  Emergency
  (clinical_finding (snomed_concept "Upper respiratory tract obstruction" "disorder"))
)
;; Page 35 - Mouth/Throat: Unable to open mouth or swallow
(system_priority_evaluation
  adult
  Urgent
  (or
    (clinical_finding (snomed_concept "Unable to open mouth" "finding"))
    (clinical_finding (snomed_concept "Unable to swallow" "finding"))
  )
)
;; Page 36 - Gum/Teeth: Urgent dental conditions
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Toothache" "finding"))
    (or
      (and
        (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
        (clinical_finding (snomed_concept "Facial swelling" "finding"))
      )
      (clinical_finding (snomed_concept "Unable to eat" "finding"))
      (clinical_finding (snomed_concept "Unable to drink" "finding"))
    )
  )
)
;; Page 37 - Chest Pain: Emergency for cardiac signs
(system_priority_evaluation
  adult
  Emergency
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
      (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (clinical_finding (snomed_concept "Ischemic heart disease" "disorder"))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (clinical_finding (snomed_concept "Pulse irregular" "finding"))
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
      (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110)
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (>= (measurement (snomed_concept "Heart rate" "observable entity") bpm) 100)
      (< (measurement (snomed_concept "Heart rate" "observable entity") bpm) 50)
    )
  )
)
;; Page 38 - Cough/Breathing: Emergency for severe signs
(system_priority_evaluation
  adult
  Emergency
  (and
    (or
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (clinical_finding (snomed_concept "Dyspnea at rest" "finding"))
    )
    (or
      (clinical_finding (snomed_concept "Confusional state" "disorder"))
      (clinical_finding (snomed_concept "Feeling agitated" "finding"))
      (clinical_finding (snomed_concept "Tension pneumothorax" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %) 92)
    )
  )
)
;; Page 38 - Cough/Breathing: Urgent for other signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (or
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (clinical_finding (snomed_concept "Dyspnea at rest" "finding"))
    )
    (or
      (clinical_finding (snomed_concept "Hemoptysis" "finding"))
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (>= (measurement (snomed_concept "Heart rate" "observable entity") bpm) 120)
      (clinical_finding (snomed_concept "Wheezing" "finding"))
    )
  )
)
;; Page 38 - Cough/Breathing: Pulmonary embolism signs (DVT + breathlessness)
(system_priority_evaluation
  adult
  Emergency
  (and
    (clinical_finding (snomed_concept "Swollen calf" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
  )
)
;; Page 39 - Wheeze: Severe wheeze
(system_priority_evaluation
  adult
  Emergency
  (and
    (clinical_finding (snomed_concept "Wheezing" "finding"))
    (or
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (>= (measurement (snomed_concept "Heart rate" "observable entity") bpm) 120)
      (clinical_finding (snomed_concept "Feeling agitated" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Confusional state" "disorder"))
    )
  )
)
;; Page 44 - Abdominal Pain: Urgent for danger signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (or
      (clinical_finding (snomed_concept "Unable to void urine" "finding"))
      (clinical_finding (snomed_concept "Jaundice" "finding"))
      (clinical_finding (snomed_concept "Abdominal mass" "finding"))
      (clinical_finding (snomed_concept "Mass of pelvic structure" "finding"))
      (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))
      (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
      (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
      (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
      (clinical_finding (snomed_concept "Unable to break wind" "finding"))
      (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)
    )
  )
)
;; Page 45 - Nausea/Vomiting: Urgent for danger signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (or
      (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    )
    (or
      (clinical_finding (snomed_concept "Hematemesis" "disorder"))
      (clinical_finding (snomed_concept "Jaundice" "finding"))
      (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
      (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
      (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Confusional state" "disorder"))
      (clinical_finding (snomed_concept "Deep breathing" "finding"))
      (and
        (clinical_finding (snomed_concept "Abdominal pain" "finding"))
        (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
        (clinical_finding (snomed_concept "Unable to break wind" "finding"))
      )
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
    )
  )
)
;; Page 46 - Diarrhoea: Urgent for dehydration signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Diarrhea" "finding"))
    (or
      (clinical_finding (snomed_concept "Signs of dehydration" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Confusional state" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (>= (measurement (snomed_concept "Heart rate" "observable entity") bpm) 100)
    )
  )
)
;; Page 48 - Constipation: Urgent for bowel obstruction signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Acute constipation" "finding"))
    (clinical_finding (snomed_concept "Unable to break wind" "finding"))
    (or
      (clinical_finding (snomed_concept "Abdominal pain" "finding"))
      (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
    )
  )
)
;; Page 48 - Anal Symptoms: Urgent for painful lump or unable to pass stool
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Anal pain" "finding"))
    (or
      (clinical_finding (snomed_concept "Perianal lump" "finding"))
      (clinical_finding (snomed_concept "Difficulty in ability to defecate" "finding"))
    )
  )
)
;; Page 57 - Abnormal Vaginal Bleeding: Urgent for haemodynamic signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Abnormal vaginal bleeding" "finding"))
    (or
      (and
        (clinical_finding (snomed_concept "Pallor of skin of face" "finding"))
        (or
          (>= (measurement (snomed_concept "Heart rate" "observable entity") bpm) 100)
          (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
          (clinical_finding (snomed_concept "Dizziness" "finding"))
          (clinical_finding (snomed_concept "Chest pain" "finding"))
        )
      )
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
    )
  )
)
;; Page 59 - Urinary Symptoms: Urgent for retention with distension
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Unable to void urine" "finding"))
    (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
  )
)
;; Page 59 - Urinary Symptoms: Urgent for kidney stone signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Flank pain" "finding"))
  )
)
;; Page 59 - Urinary Symptoms: Urgent for complicated pyelonephritis signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Flank pain" "finding"))
    (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
    (or
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (>= (measurement (snomed_concept "Heart rate" "observable entity") bpm) 100)
    )
  )
)
;; Page 62 - Joint Symptoms: Urgent for septic arthritis, fracture and fever signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Pain of joint" "finding"))
    (or
      (and
        (clinical_finding (snomed_concept "Joint warm" "finding"))
        (clinical_finding (snomed_concept "Joint swelling" "finding"))
      )
      (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
    )
  )
)
;; Page 63 - Back Pain: Urgent for cauda equina and other danger signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Backache" "finding"))
    (or
      (clinical_finding (snomed_concept "Urinary incontinence" "finding"))
      (clinical_finding (snomed_concept "Incontinence of feces" "finding"))
      (clinical_finding (snomed_concept "Unable to void urine" "finding"))
      (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
      (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
      (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
    )
  )
)
;; Page 64 - Neck Pain: Urgent for meningitis and neurological signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Neck pain" "finding"))
    (or
      (clinical_finding (snomed_concept "Stiff neck" "finding"))
      (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
      (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
      (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
    )
  )
)
;; Page 64 - Arm Symptoms: Urgent for fracture signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Pain in upper limb" "finding"))
    (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
  )
)
;; Page 65 - Leg Symptoms: Urgent for DVT signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Pain in calf" "finding"))
    (clinical_finding (snomed_concept "Swollen calf" "finding"))
  )
)
;; Page 65 - Leg Symptoms: Urgent for acute and critical limb ischaemia
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Pain in lower limb" "finding"))
    (or
      (and
        (clinical_finding (snomed_concept "Absent pulse" "finding"))
        (or
          (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
          (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
        )
      )
      (clinical_finding (snomed_concept "Gangrenous disorder" "disorder"))
    )
  )
)
;; Page 66 - Foot Symptoms: Urgent for ischaemia and fracture signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Foot pain" "finding"))
    (or
      (and
        (clinical_finding (snomed_concept "Absent pulse" "finding"))
        (or
          (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
          (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
        )
      )
      (clinical_finding (snomed_concept "Gangrene of foot" "disorder"))
      (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
    )
  )
)
;; Page 67 - Skin Symptoms: Urgent for meningococcal disease signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    (or
      (clinical_finding (snomed_concept "Stiff neck" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Confusional state" "disorder"))
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (clinical_finding (snomed_concept "Headache" "finding"))
    )
  )
)
;; Page 67 - Skin Symptoms: Urgent for serious drug reaction signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
    (or
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (clinical_finding (snomed_concept "Abdominal pain" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (clinical_finding (snomed_concept "Diarrhea" "finding"))
      (clinical_finding (snomed_concept "Jaundice" "finding"))
      (clinical_finding (snomed_concept "Blister of skin" "disorder"))
    )
  )
)
;; Page 79 - Jaundice: Urgent for danger signs
(system_priority_evaluation
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (or
      (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
      (clinical_finding (snomed_concept "Acute abdominal pain" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Confusional state" "disorder"))
      (clinical_finding (snomed_concept "Easy bruising" "finding"))
      (clinical_finding (snomed_concept "Finding of tendency to bleed" "finding"))
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
    )
  )
)

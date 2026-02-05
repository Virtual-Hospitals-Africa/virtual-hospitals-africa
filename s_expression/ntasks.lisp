(task 
  "Check for Anaphylaxis"
  adult
  (diagnosis (snomed_concept "Anaphylaxis" "disorder") possible)
  (check_for
    (clinical_finding (snomed_concept "Itching" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Eruption" "morphologic abnormality") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Peanut" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Tree nut" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Eggs (edible)" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Milk" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Fish" "substance"))
  )
)
(task
  "Check Sp0₂ if respiratory rate < 9 bpm"
  adult
  (< (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 9)
  (measure (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %))
)
(task
  "Check Sp0₂ if respiratory rate >= 15 bpm"
  adult
  (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 15)
  (measure (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %))
)
(task
  "Give oxygen if saturation below 92%"
  adult
  (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %) 92)
  (procedure (snomed_concept "Procedure" "procedure") (snomed_concept "Oxygen therapy" "procedure"))
)
(task
  "Check for head injury for any nose symptoms"
  adult
  (clinical_finding (finding_site (snomed_concept "Nasal structure" "body structure")))
  (check_for (clinical_finding (snomed_concept "Injury of head" "disorder")))
)
(task
  "Check in case of chest pain"
  adult
  (clinical_finding (snomed_concept "Chest pain" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Vomiting" "disorder"))
    (clinical_finding (snomed_concept "Pallor of skin of face" "finding"))
    (clinical_finding (snomed_concept "Sweating" "finding"))
    (clinical_finding (snomed_concept "Radiating chest pain" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to jaw" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to neck" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to left arm" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to right arm" "finding"))
    (clinical_finding (snomed_concept "Ischemic heart disease" "disorder"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
  )
)
(task
  "Check for urgent burn conditions"
  adult
  (clinical_finding (snomed_concept "Burn" "disorder"))
  (check_for
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Electrical burn" "disorder"))
    (clinical_finding (snomed_concept "Chemical burn" "disorder"))
    (clinical_finding (snomed_concept "Full thickness burn" "disorder"))
    (clinical_finding (snomed_concept "Partial thickness burn" "disorder") (qualifier (snomed_concept "Extensive" "qualifier value")))
    (clinical_finding (snomed_concept "Smoke inhalation injury" "disorder"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Hoarse" "finding"))
    (clinical_finding (snomed_concept "Stridor" "finding"))
    (clinical_finding (snomed_concept "Dirty sputum" "finding"))
    (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Neck structure" "body structure")))
    (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Chest structure" "body structure")) (qualifier (snomed_concept "Circumferential" "qualifier value")))
    (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Limb structure" "body structure")) (qualifier (snomed_concept "Circumferential" "qualifier value")))
    (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Face structure" "body structure")))
    (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Hand structure" "body structure")))
    (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Foot structure" "body structure")))
    (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Genital structure" "body structure")))
    (clinical_finding (snomed_concept "Burn" "disorder") (finding_site (snomed_concept "Joint structure" "body structure")))
    (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
  )
)
(task
  "Measure SpO₂ if burn present"
  adult
  (clinical_finding (snomed_concept "Burn" "disorder"))
  (measure (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %))
)
;; Page 22 - Bites and Stings
(task
  "Check for urgent bite/sting conditions"
  adult
  (clinical_finding (snomed_concept "Bite - wound" "disorder"))
  (check_for
    (clinical_finding (snomed_concept "Snake bite - wound" "disorder"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Snake venom" "substance"))
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
  )
)
;; Page 24 - Fever
(task
  "Check for urgent fever conditions"
  adult
  (clinical_finding (snomed_concept "Fever" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
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
  )
)
;; Page 25 - Lump/Swelling in Neck, Axilla or Groin
(task
  "Check for urgent groin lump conditions"
  adult
  (clinical_finding (snomed_concept "Groin mass" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Strangulated inguinal hernia" "disorder"))
    (clinical_finding (snomed_concept "Irreducible inguinal hernia" "disorder"))
    (clinical_finding (snomed_concept "Aneurysm" "disorder") (qualifier (snomed_concept "Pulsatile" "qualifier value")))
    (clinical_finding (snomed_concept "Severe pain" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Unable to break wind" "finding"))
    (clinical_finding (snomed_concept "Acute constipation" "finding"))
  )
)
;; Page 26 - Weakness or Tiredness
(task
  "Check for urgent weakness/tiredness conditions"
  adult
  (clinical_finding (snomed_concept "Fatigue" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
    (clinical_finding (snomed_concept "Signs of dehydration" "finding"))
    (clinical_finding (snomed_concept "Anemia" "disorder"))
  )
)
;; Page 27 - Pallor and Anaemia
(task
  "Check for urgent pallor/anaemia conditions"
  adult
  (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
  (check_for
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
  )
)
;; Page 28 - Collapse/Falls
(task
  "Check for urgent collapse conditions"
  adult
  (clinical_finding (snomed_concept "Collapse" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Pulse slow" "finding"))
    (clinical_finding (snomed_concept "Pulse irregular" "finding"))
    (clinical_finding (snomed_concept "Hematemesis" "disorder"))
    (clinical_finding (snomed_concept "Hematochezia" "finding"))
    (clinical_finding (snomed_concept "Acute abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Backache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Abnormal vaginal bleeding" "finding"))
    (clinical_finding (snomed_concept "Injury of head" "disorder"))
  )
)
;; Page 29 - Dizziness
(task
  "Check for urgent dizziness conditions"
  adult
  (clinical_finding (snomed_concept "Dizziness" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
    (clinical_finding (snomed_concept "Injury of head" "disorder"))
    (clinical_finding (snomed_concept "Unable to stand" "finding"))
    (clinical_finding (snomed_concept "Nausea and vomiting" "disorder"))
    (clinical_finding (snomed_concept "Abnormal ocular motility" "finding"))
  )
)
;; Page 30 - Headache
(task
  "Check for urgent headache conditions"
  adult
  (clinical_finding (snomed_concept "Headache" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
    (clinical_finding (snomed_concept "Pain in eye" "finding"))
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Confusional state" "disorder"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    (clinical_finding (snomed_concept "Nausea and vomiting" "disorder"))
    (clinical_finding (snomed_concept "Injury of head" "disorder"))
    (clinical_finding (snomed_concept "Anisocoria" "disorder"))
    (clinical_finding (snomed_concept "Morning headache" "finding"))
    (clinical_finding (snomed_concept "Frequent headache" "finding"))
  )
)
;; Page 31 - Eye/Vision Symptoms
(task
  "Check for urgent eye conditions"
  adult
  (clinical_finding (snomed_concept "Pain in eye" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Orbital cellulitis" "disorder"))
    (clinical_finding (snomed_concept "Sees haloes around lights" "finding"))
    (clinical_finding (snomed_concept "Blurring of visual image" "finding"))
    (clinical_finding (snomed_concept "Sudden visual loss" "disorder"))
    (clinical_finding (snomed_concept "Corneal ulcer" "disorder"))
    (clinical_finding (snomed_concept "Corneal opacity" "disorder"))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (clinical_finding (snomed_concept "Herpes zoster keratoconjunctivitis" "disorder"))
  )
)
;; Page 32 - Face Symptoms
(task
  "Check for urgent face conditions"
  adult
  (clinical_finding (snomed_concept "Facial swelling" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Cellulitis of face" "disorder"))
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Proteinuria" "finding"))
  )
)
;; Page 36 - Gum/Teeth Symptoms
(task
  "Check for urgent dental conditions"
  adult
  (clinical_finding (snomed_concept "Toothache" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Facial swelling" "finding"))
    (clinical_finding (snomed_concept "Unable to eat" "finding"))
    (clinical_finding (snomed_concept "Unable to drink" "finding"))
  )
)
;; Page 38 - Cough or Difficulty Breathing
(task
  "Check for urgent cough/breathing conditions"
  adult
  (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Confusional state" "disorder"))
    (clinical_finding (snomed_concept "Feeling agitated" "finding"))
    (clinical_finding (snomed_concept "Hemoptysis" "finding"))
    (clinical_finding (snomed_concept "Swollen calf" "finding"))
    (clinical_finding (snomed_concept "Wheezing" "finding"))
    (clinical_finding (snomed_concept "Dyspnea at rest" "finding"))
  )
)
;; Page 44 - Abdominal Pain
(task
  "Check for urgent abdominal pain conditions"
  adult
  (clinical_finding (snomed_concept "Abdominal pain" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Unable to void urine" "finding"))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (clinical_finding (snomed_concept "Abdominal mass" "finding"))
    (clinical_finding (snomed_concept "Mass of pelvic structure" "finding"))
    (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))
    (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
    (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
    (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
    (clinical_finding (snomed_concept "Unable to break wind" "finding"))
    (clinical_finding (snomed_concept "Acute constipation" "finding"))
    (clinical_finding (snomed_concept "Tenderness of right upper quadrant of abdomen" "finding"))
    (clinical_finding (snomed_concept "Loss of appetite" "finding"))
    (clinical_finding (snomed_concept "Pain radiating to lumbar region of back" "finding"))
  )
)
;; Page 45 - Nausea or Vomiting
(task
  "Check for urgent nausea/vomiting conditions"
  adult
  (or
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
  )
  (check_for
    (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
    (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
    (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
    (clinical_finding (snomed_concept "Hematemesis" "disorder"))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Confusional state" "disorder"))
    (clinical_finding (snomed_concept "Deep breathing" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
    (clinical_finding (snomed_concept "Unable to break wind" "finding"))
  )
)
;; Page 46 - Diarrhoea
(task
  "Check for urgent diarrhoea conditions"
  adult
  (clinical_finding (snomed_concept "Diarrhea" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Signs of dehydration" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Confusional state" "disorder"))
  )
)
;; Page 48 - Constipation and Anal Symptoms
(task
  "Check for urgent constipation/anal conditions"
  adult
  (or
    (clinical_finding (snomed_concept "Acute constipation" "finding"))
    (clinical_finding (snomed_concept "Anal pain" "finding"))
  )
  (check_for
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
    (clinical_finding (snomed_concept "Unable to break wind" "finding"))
    (clinical_finding (snomed_concept "Perianal lump" "finding"))
    (clinical_finding (snomed_concept "Difficulty in ability to defecate" "finding"))
  )
)
;; Page 57 - Abnormal Vaginal Bleeding
(task
  "Check for urgent vaginal bleeding conditions"
  adult
  (clinical_finding (snomed_concept "Abnormal vaginal bleeding" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Pallor of skin of face" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
  )
)
;; Page 59 - Urinary Symptoms
(task
  "Check for urgent urinary symptom conditions"
  adult
  (or
    (clinical_finding (snomed_concept "Unable to void urine" "finding"))
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Flank pain" "finding"))
  )
  (check_for
    (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
    (clinical_finding (snomed_concept "Flank pain" "finding"))
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Oliguria" "finding"))
    (clinical_finding (snomed_concept "Facial swelling" "finding"))
    (clinical_finding (snomed_concept "Proteinuria" "finding"))
  )
)
;; Page 62 - Joint Symptoms
(task
  "Check for urgent joint conditions"
  adult
  (clinical_finding (snomed_concept "Pain of joint" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Joint swelling" "finding"))
    (clinical_finding (snomed_concept "Joint warm" "finding"))
    (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))
    (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
  )
)
;; Page 63 - Back Pain
(task
  "Check for urgent back pain conditions"
  adult
  (clinical_finding (snomed_concept "Backache" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Urinary incontinence" "finding"))
    (clinical_finding (snomed_concept "Incontinence of feces" "finding"))
    (clinical_finding (snomed_concept "Unable to void urine" "finding"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
    (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
    (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))
    (clinical_finding (snomed_concept "Flank pain" "finding"))
  )
)
;; Page 64 - Neck Pain
(task
  "Check for urgent neck pain conditions"
  adult
  (clinical_finding (snomed_concept "Neck pain" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
    (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
  )
)
;; Page 64 - Arm or Hand Symptoms
(task
  "Check for urgent arm symptom conditions"
  adult
  (clinical_finding (snomed_concept "Pain in upper limb" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
  )
)
;; Page 65 - Leg Symptoms
(task
  "Check for urgent leg conditions"
  adult
  (clinical_finding (snomed_concept "Pain in lower limb" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Pain in calf" "finding"))
    (clinical_finding (snomed_concept "Swollen calf" "finding"))
    (clinical_finding (snomed_concept "Absent pulse" "finding"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
    (clinical_finding (snomed_concept "Gangrenous disorder" "disorder"))
    (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
    (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))
  )
)
;; Page 66 - Foot Symptoms
(task
  "Check for urgent foot conditions"
  adult
  (clinical_finding (snomed_concept "Foot pain" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Absent pulse" "finding"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
    (clinical_finding (snomed_concept "Gangrene of foot" "disorder"))
    (clinical_finding (snomed_concept "Ulcer of foot" "disorder"))
    (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
    (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))
  )
)
;; Page 67 - Skin Symptoms
(task
  "Check for urgent skin symptom conditions"
  adult
  (clinical_finding (snomed_concept "Eruption" "morphologic abnormality"))
  (check_for
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (clinical_finding (snomed_concept "Blister of skin" "disorder"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
  )
)
;; Page 79 - Jaundice
(task
  "Check for urgent jaundice conditions"
  adult
  (clinical_finding (snomed_concept "Jaundice" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
    (clinical_finding (snomed_concept "Acute abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Confusional state" "disorder"))
    (clinical_finding (snomed_concept "Easy bruising" "finding"))
    (clinical_finding (snomed_concept "Finding of tendency to bleed" "finding"))
  )
)
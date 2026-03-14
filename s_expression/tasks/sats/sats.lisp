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

;; Chapter 6: Additional Investigations
;; Reduced level of consciousness

(task
  "Do finger prick glucotest if reduced level of consciousness"
  all_ages
  (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
  (measure (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L))
)
(task
  "Refer to SHCP if reduced level of consciousness"
  all_ages
  (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
  (refer (role shcp))
)
(task
  "Move to stabilization area if glucose less than 3 mmol/L and reduced level of consciousness"
  all_ages
  (and
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
  )
  (move_to (room "Stabilization area"))
)

;; Active seizure / fitting

(task
  "Do finger prick glucotest if active seizure"
  all_ages
  (clinical_finding (snomed_concept "Seizure" "finding"))
  (measure (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L))
)
(task
  "Refer to SHCP if active seizure"
  all_ages
  (clinical_finding (snomed_concept "Seizure" "finding"))
  (refer (role shcp))
)
(task
  "Move to stabilization area if glucose less than 3 mmol/L after seizure"
  all_ages
  (and
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
  )
  (move_to (room "Stabilization area"))
)

;; History of diabetes

(task
  "Do finger prick glucotest if history of diabetes"
  all_ages
  (active_condition (snomed_concept "Diabetes mellitus" "disorder"))
  (measure (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L))
)
(task
  "Refer to SHCP if history of diabetes"
  all_ages
  (active_condition (snomed_concept "Diabetes mellitus" "disorder"))
  (refer (role shcp))
)
(task
  "Move to stabilization area if glucose less than 3 mmol/L and known diabetes"
  all_ages
  (and
    (active_condition (snomed_concept "Diabetes mellitus" "disorder"))
    (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
  )
  (move_to (room "Stabilization area"))
)

;; Diabetes and hyperglycaemia (glucose >= 11 mmol/L) — urine dipstick for ketones

(task
  "Do urine dipstick to check for ketones if glucose 11 mmol/L or more"
  all_ages
  (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11)
  (procedure (snomed_concept "Procedure" "procedure") (snomed_concept "Urine dipstick test" "procedure"))
)

;; Hypoglycaemia (glucose <= 3 mmol/L)

(task
  "Move to stabilization area if glucose 3 mmol/L or less"
  all_ages
  (<= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
  (move_to (room "Stabilization area"))
)
(task
  "Refer to SHCP if glucose 3 mmol/L or less"
  all_ages
  (<= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
  (refer (role shcp))
)

;; Chest pain

(task
  "Do finger prick glucotest if chest pain"
  adult
  (clinical_finding (snomed_concept "Chest pain" "finding"))
  (measure (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L))
)
(task
  "Do ECG if chest pain"
  adult
  (clinical_finding (snomed_concept "Chest pain" "finding"))
  (procedure (snomed_concept "Procedure" "procedure") (snomed_concept "Electrocardiographic procedure" "procedure"))
)
(task
  "Refer to SHCP if chest pain"
  adult
  (clinical_finding (snomed_concept "Chest pain" "finding"))
  (refer (role shcp))
)

;; Abdominal pain or backache — urine dipstick (all adults) and pregnancy test

(task
  "Do urine dipstick if abdominal pain"
  adult
  (clinical_finding (snomed_concept "Abdominal pain" "finding"))
  (procedure (snomed_concept "Procedure" "procedure") (snomed_concept "Urine dipstick test" "procedure"))
)
(task
  "Do urine pregnancy test if abdominal pain"
  adult
  (clinical_finding (snomed_concept "Abdominal pain" "finding"))
  (procedure (snomed_concept "Procedure" "procedure") (snomed_concept "Urine pregnancy test" "procedure"))
)
(task
  "Do urine dipstick if backache"
  adult
  (clinical_finding (snomed_concept "Backache" "finding"))
  (procedure (snomed_concept "Procedure" "procedure") (snomed_concept "Urine dipstick test" "procedure"))
)
(task
  "Do urine pregnancy test if backache"
  adult
  (clinical_finding (snomed_concept "Backache" "finding"))
  (procedure (snomed_concept "Procedure" "procedure") (snomed_concept "Urine pregnancy test" "procedure"))
)

;; Malnutrition with visible severe wasting (paediatric)

(task
  "Do finger prick glucotest if visible severe wasting"
  (ages "older child" "younger child")
  (clinical_finding (snomed_concept "Nutritional wasting" "disorder"))
  (measure (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L))
)
(task
  "Refer to SHCP if visible severe wasting"
  (ages "older child" "younger child")
  (clinical_finding (snomed_concept "Nutritional wasting" "disorder"))
  (refer (role shcp))
)
(task
  "Move to stabilization area if glucose less than 3 mmol/L and severe wasting"
  (ages "older child" "younger child")
  (and
    (clinical_finding (snomed_concept "Nutritional wasting" "disorder"))
    (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
  )
  (move_to (room "Stabilization area"))
)

;; Chapter 7: Additional Tasks — Adult

(task
  "Administer paracetamol 1g orally stat if temperature 38.5°C or more"
  adult
  (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38.5)
  (procedure (snomed_concept "Procedure" "procedure") (snomed_concept "Administration of drug or medicament via oral route" "procedure"))
)
(task
  "Warm patient with blankets if temperature 35°C or less"
  adult
  (<= (measurement (snomed_concept "Body temperature" "observable entity") °C) 35)
  (procedure (snomed_concept "Procedure" "procedure") (snomed_concept "Patient warming therapy" "procedure"))
)
(task
  "Do finger prick haemoglobin if history of bleeding"
  adult
  (history (clinical_finding (snomed_concept "Bleeding" "finding")))
  (procedure (snomed_concept "Procedure" "procedure") (snomed_concept "Measurement of total hemoglobin concentration" "procedure"))
)
(task
  "Do finger prick haemoglobin if rectal bleeding"
  adult
  (clinical_finding (snomed_concept "Rectal hemorrhage" "disorder"))
  (procedure (snomed_concept "Procedure" "procedure") (snomed_concept "Measurement of total hemoglobin concentration" "procedure"))
)
(task
  "Do urine dipstick if vaginal bleeding"
  adult
  (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
  (procedure (snomed_concept "Procedure" "procedure") (snomed_concept "Urine dipstick test" "procedure"))
)
(task
  "Do urine pregnancy test if vaginal bleeding"
  adult
  (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
  (procedure (snomed_concept "Procedure" "procedure") (snomed_concept "Urine pregnancy test" "procedure"))
)
(task
  "Do finger prick haemoglobin if vaginal bleeding"
  adult
  (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
  (procedure (snomed_concept "Procedure" "procedure") (snomed_concept "Measurement of total hemoglobin concentration" "procedure"))
)

;; Chapter 7: Additional Tasks — Paediatric

(task
  "Refer to SHCP if poisoning or overdose"
  (ages "older child" "younger child")
  (clinical_finding (snomed_concept "Poisoning caused by drug AND/OR medicinal substance" "disorder"))
  (refer (role shcp))
)
(task
  "Refer to SHCP for analgesia initiation if child in pain or inconsolably crying"
  (ages "older child" "younger child")
  (clinical_finding (snomed_concept "Severe pain" "finding"))
  (refer (role shcp))
)
(task
  "Refer to SHCP for analgesia initiation if child has burn"
  (ages "older child" "younger child")
  (clinical_finding (snomed_concept "Burn of skin" "disorder"))
  (refer (role shcp))
)
(task
  "Cool burnt area with water if burn occurred within 3 hours"
  (ages "older child" "younger child")
  (and
    (clinical_finding (snomed_concept "Burn of skin" "disorder"))
    (<= (timestamp (clinical_finding (snomed_concept "Burn of skin" "disorder"))) (time_ago 3 hours))
  )
  (procedure (snomed_concept "Procedure" "procedure") (snomed_concept "Cooling the patient" "procedure"))
)
(task
  "Refer to SHCP if child temperature 38.5°C or more"
  (ages "older child" "younger child")
  (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38.5)
  (refer (role shcp))
)
(task
  "Warm child with blankets if temperature 35°C or less"
  (ages "older child" "younger child")
  (<= (measurement (snomed_concept "Body temperature" "observable entity") °C) 35)
  (procedure (snomed_concept "Procedure" "procedure") (snomed_concept "Patient warming therapy" "procedure"))
)
(task
  "Refer to SHCP if child temperature 35°C or less"
  (ages "older child" "younger child")
  (<= (measurement (snomed_concept "Body temperature" "observable entity") °C) 35)
  (refer (role shcp))
)
(task
  "Start oral rehydration therapy if diarrhoea"
  (ages "older child" "younger child")
  (clinical_finding (snomed_concept "Diarrhea" "finding"))
  (procedure (snomed_concept "Procedure" "procedure") (snomed_concept "Oral rehydration therapy" "procedure"))
)
(task
  "Refer to SHCP if vomiting without diarrhoea and dehydrated"
  (ages "older child" "younger child")
  (and
    (clinical_finding (snomed_concept "Vomiting" "disorder"))
    (not (clinical_finding (snomed_concept "Diarrhea" "finding")))
  )
  (refer (role shcp))
)
(task
  "Collect urine specimen if abdominal pain"
  (ages "older child" "younger child")
  (clinical_finding (snomed_concept "Abdominal pain" "finding"))
  (procedure (snomed_concept "Procedure" "procedure") (snomed_concept "Urine specimen collection" "procedure"))
)
(task
  "Refer to SHCP for analgesia initiation if closed fracture"
  (ages "older child" "younger child")
  (clinical_finding (snomed_concept "Closed fracture of bone" "disorder"))
  (refer (role shcp))
)
(task
  "Immobilize affected limb if closed fracture"
  (ages "older child" "younger child")
  (clinical_finding (snomed_concept "Closed fracture of bone" "disorder"))
  (procedure (snomed_concept "Procedure" "procedure") (snomed_concept "Immobilization by splinting" "procedure"))
)
(task
  "Apply direct pressure to bleeding site if active ongoing bleeding"
  (ages "older child" "younger child")
  (clinical_finding (snomed_concept "Bleeding" "finding"))
  (procedure (snomed_concept "Procedure" "procedure") (snomed_concept "Control of hemorrhage by application of direct pressure" "procedure"))
)
(task
  "Do finger prick haemoglobin if active ongoing bleeding"
  (ages "older child" "younger child")
  (clinical_finding (snomed_concept "Bleeding" "finding"))
  (procedure (snomed_concept "Procedure" "procedure") (snomed_concept "Measurement of total hemoglobin concentration" "procedure"))
)
(task
  "Refer to SHCP if active ongoing bleeding"
  (ages "older child" "younger child")
  (clinical_finding (snomed_concept "Bleeding" "finding"))
  (refer (role shcp))
)
(task
  "Do finger prick haemoglobin if history of recent bleeding"
  (ages "older child" "younger child")
  (history (clinical_finding (snomed_concept "Bleeding" "finding")))
  (procedure (snomed_concept "Procedure" "procedure") (snomed_concept "Measurement of total hemoglobin concentration" "procedure"))
)

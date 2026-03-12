export const ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS_TO_SNOMED = {
  'Abused patient': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Victim of abuse" "finding") possible)',
      'snomed_concept_id': '386702006',
      'name': 'Victim of abuse',
      'category': 'finding',
    },
  ],
  'Abdominal pain': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Abdominal pain" "finding") possible)',
      'snomed_concept_id': '21522001',
      'name': 'Abdominal pain',
      'category': 'finding',
    },
  ],
  'Aggressive patient': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Aggressive behavior" "finding") possible)',
      'snomed_concept_id': '61372001',
      'name': 'Aggressive behavior',
      'category': 'finding',
    },
  ],
  'Anaemia': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Anemia" "disorder") possible)',
      'snomed_concept_id': '271737000',
      'name': 'Anemia',
      'category': 'disorder',
    },
  ],
  'Anal symptoms': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Rectal symptoms" "finding") possible)',
      'snomed_concept_id': '309572008',
      'name': 'Rectal symptoms',
      'category': 'finding',
    },
  ],
  'Anaphylaxis': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Anaphylaxis" "disorder") possible)',
      'snomed_concept_id': '39579001',
      'name': 'Anaphylaxis',
      'category': 'disorder',
    },
  ],
  'Anxiety': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Anxiety" "finding") possible)',
      'snomed_concept_id': '48694002',
      'name': 'Anxiety',
      'category': 'finding',
    },
  ],
  'Arm symptoms': [
    {
      'type': 'by_finding_site',
      's_expression': '(clinical_finding (finding_site (snomed_concept "Upper limb structure" "body structure")))',
      'snomed_concept_id': '53120007',
      'name': 'Upper limb structure',
      'category': 'body structure',
    },
  ],
  'Back pain': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Backache" "finding") possible)',
      'snomed_concept_id': '161891005',
      'name': 'Backache',
      'category': 'finding',
    },
  ],
  'Bites': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Bite - wound" "disorder") possible)',
      'snomed_concept_id': '3404009',
      'name': 'Bite',
      'category': 'disorder',
    },
  ],
  'Blackheads': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Comedone" "disorder") possible)',
      'snomed_concept_id': '247467008',
      'name': 'Comedone',
      'category': 'disorder',
    },
  ],
  // Commenting out synonyms
  // 'Blackout': [
  //   {
  //     'type': 'specific_concept',
  //     's_expression': '(active_condition (snomed_concept "Syncope" "finding") possible)',
  //     'snomed_concept_id': '271594007',
  //     'name': 'Syncope',
  //     'category': 'finding',
  //   },
  // ],
  'Body pain': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Generalized aches and pains" "finding") possible)',
      'snomed_concept_id': '82991003',
      'name': 'Generalized aches and pains',
      'category': 'finding',
    },
  ],
  'Breast symptoms': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Breast signs and symptoms" "finding") possible)',
      'snomed_concept_id': '198116001',
      'name': 'Breast signs and symptoms',
      'category': 'finding',
    },
  ],
  'Breathing difficulty': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Difficulty breathing" "finding") possible)',
      'snomed_concept_id': '230145002',
      'name': 'Difficulty breathing',
      'category': 'finding',
    },
  ],
  'Burns': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Burn" "disorder") possible)',
      'snomed_concept_id': '125666000',
      'name': 'Burn',
      'category': 'disorder',
    },
  ],
  'Cardiac arrest': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Cardiac arrest" "disorder") possible)',
      'snomed_concept_id': '410429000',
      'name': 'Cardiac arrest',
      'category': 'disorder',
    },
  ],
  // TODO handle these
  // "Cervical screening": "not_a_symptom",
  'Chest pain': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Chest pain" "finding") possible)',
      'snomed_concept_id': '29857009',
      'name': 'Chest pain',
      'category': 'finding',
    },
  ],
  'Cholera': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Cholera" "disorder") possible)',
      'snomed_concept_id': '63650001',
      'name': 'Cholera',
      'category': 'disorder',
    },
  ],
  'Collapse': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Collapse" "finding") possible)',
      'snomed_concept_id': '271787007',
      'name': 'Collapse',
      'category': 'finding',
    },
  ],
  'Coma': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Coma" "disorder") possible)',
      'snomed_concept_id': '371632003',
      'name': 'Coma',
      'category': 'disorder',
    },
  ],
  // TODO handle these
  // "Condom broken": "not_a_symptom",
  'Confused patient': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Clouded consciousness" "finding") possible)',
      'snomed_concept_id': '40917007',
      'name': 'Clouded consciousness',
      'category': 'finding',
    },
  ],
  'Constipation': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Constipation" "finding") possible)',
      'snomed_concept_id': '14760008',
      'name': 'Constipation',
      'category': 'finding',
    },
  ],
  // TODO remove this I think: you only need one page for the same type
  // Commenting out synonyms
  // 'Convulsion': [
  //   {
  //     'type': 'specific_concept',
  //     's_expression': '(active_condition (snomed_concept "Seizure related finding" "finding") possible)',
  //     'snomed_concept_id': '313287004',
  //     'name': 'Seizure',
  //     'category': 'finding',
  //   },
  // ],
  'Cough': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Cough" "finding") possible)',
      'snomed_concept_id': '49727002',
      'name': 'Cough',
      'category': 'finding',
    },
  ],
  'Dental symptoms': [
    {
      'type': 'by_finding_site',
      's_expression': '(clinical_finding (finding_site (snomed_concept "Dental arch structure" "body structure")))',
      'snomed_concept_id': '4442007',
      'name': 'Dental arch structure',
      'category': 'body structure',
    },
  ],
  'Diarrhoea': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Diarrhea" "finding") possible)',
      'snomed_concept_id': '62315008',
      'name': 'Diarrhea',
      'category': 'finding',
    },
  ],
  'Discharge, genital': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Abnormal urogenital discharge" "finding") possible)',
      'snomed_concept_id': '422910009',
      'name': 'Abnormal urogenital discharge',
      'category': 'finding',
    },
  ],
  'Disruptive patient': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Disruptive behavior" "finding") possible)',
      'snomed_concept_id': '248044002',
      'name': 'Disruptive behavior',
      'category': 'finding',
    },
  ],
  'Dizziness': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Dizziness" "finding") possible)',
      'snomed_concept_id': '404640003',
      'name': 'Dizziness',
      'category': 'finding',
    },
  ],
  'Ear symptoms': [
    {
      'type': 'by_finding_site',
      's_expression': '(clinical_finding (finding_site (snomed_concept "Ear structure" "body structure")))',
      'snomed_concept_id': '117590005',
      'name': 'Ear structure',
      'category': 'body structure',
    },
  ],
  // TODO handle these
  // "Emergency patient": "not_a_symptom",
  'Eye symptoms': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Eye symptom" "finding") possible)',
      'snomed_concept_id': '308923001',
      'name': 'Eye symptom',
      'category': 'finding',
    },
  ],
  'Lump, skin': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Mass of skin" "finding") possible)',
      'snomed_concept_id': '297960002',
      'name': 'Mass of skin',
      'category': 'finding',
    },
  ],
  'Lymphadenopathy': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Lymphadenopathy" "disorder") possible)',
      'snomed_concept_id': '30746006',
      'name': 'Lymphadenopathy',
      'category': 'disorder',
    },
  ],
  'Menstrual symptoms': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Disorder of menstruation" "disorder") possible)',
      'snomed_concept_id': '386804004',
      'name': 'Disorder of menstruation',
      'category': 'disorder',
    },
  ],
  'Miserable patient': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Symptoms of depression" "finding") possible)',
      'snomed_concept_id': '359746009',
      'name': 'Symptoms of depression',
      'category': 'finding',
    },
  ],
  'Mouth symptoms': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Mouth symptoms" "finding") possible)',
      'snomed_concept_id': '162009001',
      'name': 'Mouth symptoms',
      'category': 'finding',
    },
  ],
  'Face symptoms': [
    {
      'type': 'by_finding_site',
      's_expression': '(clinical_finding (finding_site (snomed_concept "Face structure" "body structure")))',
      'snomed_concept_id': '89545001',
      'name': 'Face structure',
      'category': 'body structure',
    },
  ],
  'Faint': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Syncope" "finding") possible)',
      'snomed_concept_id': '271594007',
      'name': 'Syncope',
      'category': 'finding',
    },
  ],
  'Falls': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Falls" "finding") possible)',
      'snomed_concept_id': '161898004',
      'name': 'Falls',
      'category': 'finding',
    },
  ],
  'Fatigue': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Fatigue" "finding") possible)',
      'snomed_concept_id': '84229001',
      'name': 'Fatigue',
      'category': 'finding',
    },
  ],
  'Fever': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Fever" "finding") possible)',
      'snomed_concept_id': '386661006',
      'name': 'Fever',
      'category': 'finding',
    },
  ],
  // Commenting out synonyms
  // 'Fits': [
  //   {
  //     'type': 'specific_concept',
  //     's_expression': '(active_condition (snomed_concept "Seizure related finding" "finding") possible)',
  //     'snomed_concept_id': '313287004',
  //     'name': 'Seizure',
  //     'category': 'finding',
  //   },
  // ],
  'Foot symptoms': [
    {
      'type': 'by_finding_site',
      's_expression': '(clinical_finding (finding_site (snomed_concept "Foot structure" "body structure")))',
      'snomed_concept_id': '56459004',
      'name': 'Foot structure',
      'category': 'body structure',
    },
  ],
  // TODO I don't think we need this per se
  // "Foot care": "site",
  'Fracture': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Fracture" "morphologic abnormality") possible)',
      'snomed_concept_id': '72704001',
      'name': 'Fracture',
      'category': 'morphologic abnormality',
    },
  ],
  'Nail symptoms': [
    {
      'type': 'by_finding_site',
      's_expression': '(clinical_finding (finding_site (snomed_concept "Nail unit structure" "body structure")))',
      'snomed_concept_id': '770802007',
      'name': 'Nail unit structure',
      'category': 'body structure',
    },
  ],
  'Nausea': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Nausea" "finding") possible)',
      'snomed_concept_id': '422587007',
      'name': 'Nausea',
      'category': 'finding',
    },
  ],
  'Neck pain': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Neck pain" "finding") possible)',
      'snomed_concept_id': '81680005',
      'name': 'Neck pain',
      'category': 'finding',
    },
  ],
  'Needlestick injury': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Accidental needle stick injury" "disorder") possible)',
      'snomed_concept_id': '10850741000119108',
      'name': 'Accidental needle stick injury',
      'category': 'disorder',
    },
  ],
  'Nose symptoms': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Nasal symptom" "finding") possible)',
      'snomed_concept_id': '249307003',
      'name': 'Nasal symptom',
      'category': 'finding',
    },
  ],
  'Genital symptoms': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Symptom: genital area" "finding") possible)',
      'snomed_concept_id': '162428001',
      'name': 'Symptom: genital area',
      'category': 'finding',
    },
  ],
  'Glucose': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Finding of glucose level" "finding") possible)',
      'snomed_concept_id': '365811003',
      'name': 'Finding of glucose level',
      'category': 'finding',
    },
  ],
  'Gum symptoms': [
    {
      'type': 'by_finding_site',
      's_expression': '(clinical_finding (finding_site (snomed_concept "Gingival structure" "body structure")))',
      'snomed_concept_id': '113279002',
      'name': 'Gingival structure',
      'category': 'body structure',
    },
  ],
  'Overweight patient': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Overweight" "finding") possible)',
      'snomed_concept_id': '238131007',
      'name': 'Overweight',
      'category': 'finding',
    },
  ],
  'Hair loss': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Alopecia" "disorder") possible)',
      'snomed_concept_id': '56317004',
      'name': 'Alopecia',
      'category': 'disorder',
    },
  ],
  'Hand symptoms': [
    {
      'type': 'by_finding_site',
      's_expression': '(clinical_finding (finding_site (snomed_concept "Hand structure" "body structure")))',
      'snomed_concept_id': '85562004',
      'name': 'Hand structure',
      'category': 'body structure',
    },
  ],
  'Headache': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Headache" "finding") possible)',
      'snomed_concept_id': '25064002',
      'name': 'Headache',
      'category': 'finding',
    },
  ],
  'Hearing symptoms': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Hearing symptoms" "finding") possible)',
      'snomed_concept_id': '162338005',
      'name': 'Hearing symptoms',
      'category': 'finding',
    },
  ],
  'Heartburn': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Heartburn" "finding") possible)',
      'snomed_concept_id': '16331000',
      'name': 'Heartburn',
      'category': 'finding',
    },
  ],
  // Commenting out synonyms
  // 'Pain, back': [
  //   {
  //     'type': 'specific_concept',
  //     's_expression': '(active_condition (snomed_concept "Backache" "finding") possible)',
  //     'snomed_concept_id': '161891005',
  //     'name': 'Backache',
  //     'category': 'finding',
  //   },
  // ],
  // Commenting out synonyms
  // 'Pain, body/general': [
  //   {
  //     'type': 'specific_concept',
  //     's_expression': '(active_condition (snomed_concept "Generalized aches and pains" "finding") possible)',
  //     'snomed_concept_id': '82991003',
  //     'name': 'Generalized aches and pains',
  //     'category': 'finding',
  //   },
  // ],
  // Commenting out synonyms
  // 'Pain, chest': [
  //   {
  //     'type': 'specific_concept',
  //     's_expression': '(active_condition (snomed_concept "Chest pain" "finding") possible)',
  //     'snomed_concept_id': '29857009',
  //     'name': 'Chest pain',
  //     'category': 'finding',
  //   },
  // ],
  'Pain, chronic': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Chronic pain" "finding") possible)',
      'snomed_concept_id': '82423001',
      'name': 'Chronic pain',
      'category': 'finding',
    },
  ],
  // Commenting out synonyms
  // 'Pain, neck': [
  //   {
  //     'type': 'specific_concept',
  //     's_expression': '(active_condition (snomed_concept "Neck pain" "finding") possible)',
  //     'snomed_concept_id': '81680005',
  //     'name': 'Neck pain',
  //     'category': 'finding',
  //   },
  // ],
  'Pallor': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Pale complexion" "finding") possible)',
      'snomed_concept_id': '398979000',
      'name': 'Pale complexion',
      'category': 'finding',
    },
  ],
  // Commenting out synonyms
  // 'Period problems': [
  //   {
  //     'type': 'specific_concept',
  //     's_expression': '(active_condition (snomed_concept "Disorder of menstruation" "disorder") possible)',
  //     'snomed_concept_id': '386804004',
  //     'name': 'Disorder of menstruation',
  //     'category': 'disorder',
  //   },
  // ],
  'Pimples': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Pimple" "morphologic abnormality") possible)',
      'snomed_concept_id': '103605005',
      'name': 'Pimple',
      'category': 'morphologic abnormality',
    },
  ],
  'Injured patient': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Traumatic or non-traumatic injury" "finding") possible)',
      'snomed_concept_id': '417163006',
      'name': 'Traumatic or non-traumatic injury',
      'category': 'disorder',
    },
  ],
  'Itch': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Itching" "finding") possible)',
      'snomed_concept_id': '418290006',
      'name': 'Itching',
      'category': 'finding',
    },
  ],
  'Rape': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Victim of rape" "finding") possible)',
      'snomed_concept_id': '42085001',
      'name': 'Victim of rape',
      'category': 'finding',
    },
  ],
  'Rash': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Eruption of skin" "disorder") possible)',
      'snomed_concept_id': '271807003',
      'name': 'Eruption of skin',
      'category': 'disorder',
    },
  ],
  'Respiratory arrest': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Respiratory arrest" "disorder") possible)',
      'snomed_concept_id': '87317003',
      'name': 'Respiratory arrest',
      'category': 'disorder',
    },
  ],
  'Jaundice': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Jaundice" "finding") possible)',
      'snomed_concept_id': '18165001',
      'name': 'Jaundice',
      'category': 'finding',
    },
  ],
  'Joint symptoms': [
    {
      'type': 'by_finding_site',
      's_expression': '(clinical_finding (finding_site (snomed_concept "Joint structure" "body structure")))',
      'snomed_concept_id': '39352004',
      'name': 'Joint structure',
      'category': 'body structure',
    },
  ],
  'Leg symptoms': [
    {
      'type': 'by_finding_site',
      's_expression': '(clinical_finding (finding_site (snomed_concept "Lower limb structure" "body structure")))',
      'snomed_concept_id': '61685007',
      'name': 'Lower limb structure',
      'category': 'body structure',
    },
  ],
  'Lump, neck/axilla/groin': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Groin mass" "finding") possible)',
      'snomed_concept_id': '281398003',
      'name': 'Groin mass',
      'category': 'finding',
    },
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Mass of axilla" "finding") possible)',
      'snomed_concept_id': '300863000',
      'name': 'Mass of axilla',
      'category': 'finding',
    },
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Mass of neck" "finding") possible)',
      'snomed_concept_id': '299703001',
      'name': 'Mass of neck',
      'category': 'finding',
    },
  ],
  'Scalp symptoms': [
    {
      'type': 'by_finding_site',
      's_expression': '(clinical_finding (finding_site (snomed_concept "Scalp structure" "body structure")))',
      'snomed_concept_id': '41695006',
      'name': 'Scalp structure',
      'category': 'body structure',
    },
  ],
  'Scrotal symptoms': [
    {
      'type': 'by_finding_site',
      's_expression': '(clinical_finding (finding_site (snomed_concept "Scrotal structure" "body structure")))',
      'snomed_concept_id': '20233005',
      'name': 'Scrotal structure',
      'category': 'body structure',
    },
  ],
  'Seizures': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Seizure related finding" "finding") possible)',
      'snomed_concept_id': '313287004',
      'name': 'Seizure',
      'category': 'finding',
    },
  ],
  'Self-harm': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Self-injurious behavior" "finding") possible)',
      'snomed_concept_id': '248062006',
      'name': 'Self-injurious behavior',
      'category': 'finding',
    },
  ],
  'Sexual problems': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Sexuality related problem" "finding") possible)',
      'snomed_concept_id': '106143002',
      'name': 'Sexuality related problem',
      'category': 'finding',
    },
  ],
  'Sexually transmitted infections': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Sexually transmitted infectious disease" "disorder") possible)',
      'snomed_concept_id': '8098009',
      'name': 'Sexually transmitted infectious disease',
      'category': 'disorder',
    },
  ],
  'Skin symptoms': [
    {
      'type': 'by_finding_site',
      's_expression': '(clinical_finding (finding_site (snomed_concept "Skin structure" "body structure")))',
      'snomed_concept_id': '39937001',
      'name': 'Skin structure',
      'category': 'body structure',
    },
  ],
  'Sleeping difficulty': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Difficulty sleeping" "finding") possible)',
      'snomed_concept_id': '301345002',
      'name': 'Difficulty sleeping',
      'category': 'finding',
    },
  ],
  'Smoking': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Finding of tobacco smoking behavior" "finding") possible)',
      'snomed_concept_id': '365981007',
      'name': 'Finding of tobacco smoking behavior',
      'category': 'finding',
    },
  ],
  'Stings': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Sting" "morphologic abnormality") possible)',
      'snomed_concept_id': '72587008',
      'name': 'Sting',
      'category': 'morphologic abnormality',
    },
  ],
  'Stress': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Stress" "finding") possible)',
      'snomed_concept_id': '73595000',
      'name': 'Stress',
      'category': 'finding',
    },
  ],
  'Suicidal patient': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Suicidal" "finding") possible)',
      'snomed_concept_id': '267073005',
      'name': 'Suicidal',
      'category': 'finding',
    },
  ],
  'Syphilis': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Syphilis" "disorder") possible)',
      'snomed_concept_id': '76272004',
      'name': 'Syphilis',
      'category': 'disorder',
    },
  ],
  'Tasting difficulty': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Finding of sense of taste" "finding") possible)',
      'snomed_concept_id': '76489005',
      'name': 'Finding of sense of taste',
      'category': 'finding',
    },
  ],
  'Teeth symptoms': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Tooth symptoms" "finding") possible)',
      'snomed_concept_id': '162004006',
      'name': 'Tooth symptoms',
      'category': 'finding',
    },
  ],
  'Throat symptoms': [
    {
      'type': 'by_finding_site',
      's_expression': '(clinical_finding (finding_site (snomed_concept "Structure of internal nose and/or pharynx and/or larynx" "body structure")))',
      'snomed_concept_id': '1162925002',
      'name': 'Structure of internal nose and/or pharynx and/or larynx',
      'category': 'body structure',
    },
  ],
  // Commenting out synonyms
  // 'Tiredness': [
  //   {
  //     'type': 'specific_concept',
  //     's_expression': '(active_condition (snomed_concept "Fatigue" "finding") possible)',
  //     'snomed_concept_id': '84229001',
  //     'name': 'Fatigue',
  //     'category': 'finding',
  //   },
  // ],
  // Commenting out synonyms
  // 'Traumatised patient': [
  //   {
  //     'type': 'specific_concept',
  //     's_expression': '(active_condition (snomed_concept "Victim of abuse" "finding") possible)',
  //     'snomed_concept_id': '386702006',
  //     'name': 'Victim of abuse',
  //     'category': 'finding',
  //   },
  // ],
  'Ulcer, genital': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Ulceration of genital organ" "disorder") possible)',
      'snomed_concept_id': '1371402009',
      'name': 'Ulceration of genital organ',
      'category': 'disorder',
    },
  ],
  'Ulcer, skin': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Skin ulcer" "disorder") possible)',
      'snomed_concept_id': '46742003',
      'name': 'Skin ulcer',
      'category': 'disorder',
    },
  ],
  'Unconscious patient': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Unconscious" "finding") possible)',
      'snomed_concept_id': '418107008',
      'name': 'Unconscious',
      'category': 'finding',
    },
  ],
  'Urinary symptoms': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Urinary symptoms" "finding") possible)',
      'snomed_concept_id': '249274008',
      'name': 'Urinary symptoms',
      'category': 'finding',
    },
  ],
  'Vaginal bleeding': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Bleeding from vagina" "finding") possible)',
      'snomed_concept_id': '289530006',
      'name': 'Bleeding from vagina',
      'category': 'finding',
    },
  ],
  'Vaginal discharge': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Vaginal discharge" "finding") possible)',
      'snomed_concept_id': '271939006',
      'name': 'Vaginal discharge',
      'category': 'finding',
    },
  ],
  // Commenting out synonyms
  // 'Violent patient': [
  //   {
  //     'type': 'specific_concept',
  //     's_expression': '(active_condition (snomed_concept "Aggressive behavior" "finding") possible)',
  //     'snomed_concept_id': '61372001',
  //     'name': 'Aggressive behavior',
  //     'category': 'finding',
  //   },
  // ],
  'Vision symptoms': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Visual symptoms" "finding") possible)',
      'snomed_concept_id': '162274004',
      'name': 'Visual symptoms',
      'category': 'finding',
    },
  ],
  'Vomiting': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Vomiting" "disorder") possible)',
      'snomed_concept_id': '422400008',
      'name': 'Vomiting',
      'category': 'disorder',
    },
  ],
  'Warts, genital': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Genital warts" "disorder") possible)',
      'snomed_concept_id': '266113007',
      'name': 'Genital warts',
      'category': 'disorder',
    },
  ],
  'Weakness': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Asthenia" "finding") possible)',
      'snomed_concept_id': '13791008',
      'name': 'Asthenia',
      'category': 'finding',
    },
  ],
  'Weight loss': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Unintentional weight loss" "finding") possible)',
      'snomed_concept_id': '448765001',
      'name': 'Unintentional weight loss',
      'category': 'finding',
    },
  ],
  'Wheeze': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Wheezing" "finding") possible)',
      'snomed_concept_id': '56018004',
      'name': 'Wheezing',
      'category': 'finding',
    },
  ],
  'Wound, acute': [
    {
      'type': 'specific_concept',
      's_expression': `
        (and (active_condition (snomed_concept "Wound" "disorder") possible)
             (not (active_condition (snomed_concept "Bite - wound" "disorder") possible))
        )
      `,
      'snomed_concept_id': '416462003',
      'name': 'Wound',
      'category': 'disorder',
    },
  ],
  'Wound, chronic': [
    {
      'type': 'specific_concept',
      's_expression': '(active_condition (snomed_concept "Chronic wound" "disorder") possible)',
      'snomed_concept_id': '92161000112103',
      'name': 'Chronic wound',
      'category': 'disorder',
    },
  ],
  //   'Foot symptoms care': [
  //     {
  //       'type': 'by_finding_site',
  //       's_expression': '(clinical_finding (finding_site (snomed_concept "Foot structure" "body structure")))',
  //       'snomed_concept_id': '56459004',
  //       'name': 'Foot structure',
  //       'category': 'body structure',
  //     },
  //   ],
}

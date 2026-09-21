/*
  The body sites, in the order the adult guide presents their pages, that a nurse can filter
  the warning signs page by, and the findings each page tells her to check for.

  Maintained by hand, read off the guide pages themselves rather than derived from the rules:
  a page's columns branch on the symptom the patient presents with, so a task's check_for is
  only ever part of the story, and several of these pages gate no task at all.

  A page's bold "<condition> likely/possible" or "consider <condition>" is a diagnosis, not a
  finding, so it is left out — the findings that lead to it are what the nurse records. The
  same goes for measurements (blood pressure, temperature, pulse, Hb), which are recorded as
  measurements and not as signs.

  excluding_structures names the sites a patient does not mean when they present with this
  one — by "face symptoms" they do not mean their eye, ear, nose, mouth or teeth. A search
  under this site drops the findings sited within any of them.

  Every concept named here needs modifiers, so rerun
  scripts/data-munging/finding-site-signs-modifiers.ts after editing this file.
*/
export type FindingSiteFindings = {
  label: string
  finding_site_structure: string
  excluding_structures: string[]
  including_s_expressions?: string[]
  clinical_finding_s_expressions: string[]
}

export const FINDING_SITE_FINDINGS: FindingSiteFindings[] = [
  {
    // Headache ⇢ 30
    label: 'Head',
    finding_site_structure: 'Head structure',
    excluding_structures: [
      'Structure of eye proper',
      'Face structure',
      'Ear structure',
      'Nasal structure',
      'Structure of mouth and/or pharynx',
      'Tooth, gum, and/or supporting structure',
      'Scalp structure',
    ],
    clinical_finding_s_expressions: [
      '(clinical_finding (snomed_concept "Headache" "finding"))',
      '(clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))',
      '(clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Wakes up during night" "finding")))',
      '(clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Symptom is continuous" "finding")))',
      '(clinical_finding (snomed_concept "Morning headache" "finding"))',
      '(clinical_finding (snomed_concept "Frequent headache" "finding"))',
      '(clinical_finding (snomed_concept "Frequent headache" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))',
      '(clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))',
      '(clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))',
      '(clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))',
      '(clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))',
      '(clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))',
      '(clinical_finding (snomed_concept "Numbness of limbs" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))',
      '(clinical_finding (snomed_concept "Speech problem" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))',
      '(clinical_finding (snomed_concept "Visual symptoms" "finding") (qualifier (snomed_concept "New" "qualifier value")))',
      '(clinical_finding (snomed_concept "Pain in eye" "finding") (qualifier (snomed_concept "New" "qualifier value")))',
      '(clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))',
      // Neck stiffness, drowsy/confused or purple/red rash
      '(clinical_finding (snomed_concept "Stiff neck" "finding"))',
      '(clinical_finding (snomed_concept "Drowsy" "finding"))',
      '(clinical_finding (snomed_concept "Clouded consciousness" "finding"))',
      '(clinical_finding (snomed_concept "Purpuric rash" "disorder"))',
      '(clinical_finding (snomed_concept "Persistent vomiting" "disorder"))',
      '(clinical_finding (snomed_concept "Nausea" "finding") (qualifier (snomed_concept "Symptom is continuous" "finding")))',
      '(clinical_finding (snomed_concept "Nausea and vomiting" "disorder"))',
      '(clinical_finding (snomed_concept "Highly active antiretroviral therapy" "procedure"))',
      '(clinical_finding (snomed_concept "Seizure" "finding"))',
      '(clinical_finding (snomed_concept "Injury of head" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))',
      '(clinical_finding (snomed_concept "Anisocoria" "disorder"))',
      '(clinical_finding (snomed_concept "Visual disturbance" "disorder"))',
      // Fever and body pain, or recent common cold
      '(clinical_finding (snomed_concept "Fever" "finding"))',
      '(clinical_finding (snomed_concept "Generalized aches and pains" "finding"))',
      '(clinical_finding (snomed_concept "Common cold" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))',
      '(clinical_finding (snomed_concept "Nasal discharge" "finding") (qualifier (snomed_concept "Thick" "qualifier value")))',
      '(clinical_finding (snomed_concept "Posterior rhinorrhea" "disorder") (qualifier (snomed_concept "Thick" "qualifier value")))',
    ],
  },
  {
    // Eye/vision symptoms ⇢ 31
    label: 'Eye',
    finding_site_structure: 'Structure of eye proper',
    including_s_expressions: [
      '(finding (finding_site "Structure of visual system"))',
      '(finding (interprets "Visual function"))',
      '(finding (interprets "Vision observable"))',
    ],
    excluding_structures: [],
    clinical_finding_s_expressions: [
      '(clinical_finding (snomed_concept "Red eye" "finding"))',
      '(clinical_finding (snomed_concept "Pain in eye" "finding"))',
      '(clinical_finding (snomed_concept "Sudden visual loss" "disorder"))',
      '(clinical_finding (snomed_concept "Abnormal vision" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))',
      '(clinical_finding (snomed_concept "Blurring of visual image" "finding"))',
      '(clinical_finding (snomed_concept "Visual disturbance" "disorder"))',
      '(clinical_finding (snomed_concept "Sees haloes around lights" "finding"))',
      '(clinical_finding (snomed_concept "Dilated pupil" "finding"))',
      '(clinical_finding (snomed_concept "Discharge from eye" "finding"))',
      '(clinical_finding (snomed_concept "Itching of eye" "finding"))',
      // Yellow eyes — jaundice itself is the diagnosis the page reaches for
      '(clinical_finding (snomed_concept "Scleral icterus" "finding"))',
      // New sudden asymmetric weakness or numbness of face, arm or leg
      '(clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))',
      '(clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))',
      '(clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))',
      '(clinical_finding (snomed_concept "Numbness of face" "finding"))',
      '(clinical_finding (snomed_concept "Numbness of limbs" "finding"))',
      '(clinical_finding (snomed_concept "Difficulty talking" "finding"))',
      // Whole eyelid swollen, red and painful
      '(clinical_finding (snomed_concept "Swelling of eyelid" "finding") (qualifier (snomed_concept "Entire" "qualifier value")) (qualifier (snomed_concept "Red color" "qualifier value")) (qualifier (snomed_concept "Pain" "finding")))',
      '(clinical_finding (snomed_concept "Swelling of eyelid" "finding"))',
      '(clinical_finding (snomed_concept "Edema of eyelid" "disorder") (qualifier (snomed_concept "New" "qualifier value")))',
      '(clinical_finding (snomed_concept "Ptosis of eyelid" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))',
      // Shingles involving eye or nose
      '(clinical_finding (snomed_concept "Herpes zoster ophthalmicus" "disorder"))',
      '(clinical_finding (snomed_concept "Herpes zoster involving tip of nose" "disorder"))',
      // Penetrating or metallic foreign body, chemical burn, corneal signs
      '(clinical_finding (snomed_concept "Penetrating wound of eye" "disorder"))',
      '(clinical_finding (snomed_concept "Laceration of eyelid" "disorder"))',
      '(clinical_finding (snomed_concept "Metal foreign body in eye region" "disorder"))',
      '(clinical_finding (snomed_concept "Penetration of eyeball with magnetic foreign body" "disorder"))',
      '(clinical_finding (snomed_concept "Chemical burn" "disorder") (finding_site (snomed_concept "Structure of eye proper" "body structure")))',
      '(clinical_finding (snomed_concept "Burn of cornea" "disorder"))',
      '(clinical_finding (snomed_concept "Corneal ulcer" "disorder"))',
      '(clinical_finding (snomed_concept "Corneal haze" "disorder"))',
      '(clinical_finding (snomed_concept "Headache" "finding"))',
      '(clinical_finding (snomed_concept "Nausea and vomiting" "disorder"))',
    ],
  },
  {
    // Face symptoms ⇢ 32
    label: 'Face',
    finding_site_structure: 'Face structure',
    excluding_structures: [
      'Structure of eye proper',
      'Ear structure',
      'Nasal structure',
      'Structure of mouth and/or pharynx',
      'Tooth, gum, and/or supporting structure',
    ],
    clinical_finding_s_expressions: [
      '(clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))',
      '(clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))',
      '(clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))',
      '(clinical_finding (snomed_concept "Numbness of face" "finding"))',
      '(clinical_finding (snomed_concept "Numbness of limbs" "finding"))',
      '(clinical_finding (snomed_concept "Difficulty talking" "finding"))',
      '(clinical_finding (snomed_concept "Visual disturbance" "disorder"))',
      // Sudden face/tongue swelling; painful red facial swelling; new swelling of face
      '(clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))',
      '(clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))',
      '(clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))',
      '(clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Red color" "qualifier value")) (qualifier (snomed_concept "Pain" "finding")))',
      '(clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))',
      '(clinical_finding (snomed_concept "Difficulty breathing" "finding"))',
      '(clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))',
      '(clinical_finding (snomed_concept "Collapse" "finding"))',
      '(clinical_finding (snomed_concept "Abdominal pain" "finding"))',
      '(clinical_finding (snomed_concept "Finding of vomiting" "finding"))',
      '(clinical_finding (snomed_concept "Blood in urine" "finding"))',
      '(clinical_finding (snomed_concept "Proteinuria" "finding"))',
      // Whole eyelid swollen, red and painful
      '(clinical_finding (snomed_concept "Swelling of eyelid" "finding") (qualifier (snomed_concept "Entire" "qualifier value")) (qualifier (snomed_concept "Red color" "qualifier value")) (qualifier (snomed_concept "Pain" "finding")))',
      // Face pain columns: one-sided pain, sinus pain, previous shingles
      '(clinical_finding (snomed_concept "Pain in face" "finding"))',
      '(clinical_finding (snomed_concept "Pain in face" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))',
      '(clinical_finding (snomed_concept "Herpes zoster" "disorder") (qualifier (snomed_concept "Previous" "qualifier value")))',
      '(clinical_finding (snomed_concept "Nasal discharge" "finding") (qualifier (snomed_concept "Thick" "qualifier value")))',
      '(clinical_finding (snomed_concept "Posterior rhinorrhea" "disorder") (qualifier (snomed_concept "Thick" "qualifier value")))',
      '(clinical_finding (snomed_concept "Common cold" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))',
      // Unable to wrinkle forehead or close eye, impaired taste, dry eye
      '(clinical_finding (snomed_concept "Unable to close eyes" "finding"))',
      '(clinical_finding (snomed_concept "Taste sense altered" "finding"))',
      '(clinical_finding (snomed_concept "Dry eyes" "finding"))',
      // Painless swelling of lips/eyes
      '(clinical_finding (snomed_concept "Lip swelling" "finding"))',
      // Painful swelling of one/both sides of face with fever, headache, body pain
      '(clinical_finding (snomed_concept "Fever" "finding"))',
      '(clinical_finding (snomed_concept "Headache" "finding"))',
      '(clinical_finding (snomed_concept "Generalized aches and pains" "finding"))',
    ],
  },
  {
    // Ear/hearing symptoms ⇢ 33
    label: 'Ear',
    finding_site_structure: 'Ear structure',
    excluding_structures: [],
    clinical_finding_s_expressions: [
      '(clinical_finding (snomed_concept "Itching of ear" "finding"))',
      '(clinical_finding (snomed_concept "Ear discharge" "finding"))',
      '(clinical_finding (snomed_concept "Pain of ear" "finding"))',
      '(clinical_finding (snomed_concept "Pain of ear" "finding") (qualifier (snomed_concept "Wakes up during night" "finding")))',
      '(clinical_finding (snomed_concept "Hearing difficulty" "finding"))',
      '(clinical_finding (snomed_concept "Tinnitus" "finding"))',
      // Redness, swelling and/or pus in ear canal; red swollen painful ear lobe
      '(clinical_finding (snomed_concept "Swelling of ear" "finding") (qualifier (snomed_concept "Red color" "qualifier value")) (qualifier (snomed_concept "Pain" "finding")))',
      '(clinical_finding (snomed_concept "Tenderness in ear canal" "finding"))',
      // Look in ear
      '(clinical_finding (snomed_concept "Perforation of tympanic membrane" "disorder"))',
      '(clinical_finding (snomed_concept "Bulging tympanic membrane" "finding"))',
      '(clinical_finding (snomed_concept "Bright red tympanic membrane" "finding"))',
      '(clinical_finding (snomed_concept "Foreign body in ear" "disorder"))',
      '(clinical_finding (snomed_concept "Impacted cerumen" "disorder"))',
      // Painful swelling behind ear; neck stiffness
      '(clinical_finding (snomed_concept "Swelling over mastoid" "finding") (qualifier (snomed_concept "Pain" "finding")))',
      '(clinical_finding (snomed_concept "Stiff neck" "finding"))',
      '(clinical_finding (snomed_concept "Vertigo" "finding"))',
      '(clinical_finding (snomed_concept "Fever" "finding"))',
    ],
  },
  {
    // Nose symptoms ⇢ 34
    label: 'Nose',
    finding_site_structure: 'Nasal structure',
    including_s_expressions: [
      '(finding (finding_site "Structure of olfactory system"))',
      '(finding (interprets "Sense of smell, function"))',
    ],
    excluding_structures: [],
    clinical_finding_s_expressions: [
      '(clinical_finding (snomed_concept "Nasal discharge" "finding"))',
      '(clinical_finding (snomed_concept "Nasal discharge" "finding") (qualifier (snomed_concept "Clear" "qualifier value")))',
      '(clinical_finding (snomed_concept "Nasal discharge" "finding") (qualifier (snomed_concept "Thick" "qualifier value")))',
      '(clinical_finding (snomed_concept "Nasal congestion" "finding"))',
      '(clinical_finding (snomed_concept "Bleeding from nose" "finding"))',
      '(clinical_finding (snomed_concept "Sneezing" "finding"))',
      '(clinical_finding (snomed_concept "Itching" "finding") (finding_site (snomed_concept "Nasal structure" "body structure")))',
      '(clinical_finding (snomed_concept "Itching of eye" "finding"))',
      '(clinical_finding (snomed_concept "Itching of ear" "finding"))',
      '(clinical_finding (snomed_concept "Posterior rhinorrhea" "disorder"))',
      '(clinical_finding (snomed_concept "Clearing throat - hawking" "finding"))',
      // Head injury with clear watery discharge from nose
      '(clinical_finding (snomed_concept "Injury of head" "disorder"))',
      '(clinical_finding (snomed_concept "Cerebrospinal fluid rhinorrhea" "disorder"))',
      // Sore throat or fever; sinus pain; neck stiffness
      '(clinical_finding (snomed_concept "Sore throat" "finding"))',
      '(clinical_finding (snomed_concept "Fever" "finding"))',
      '(clinical_finding (snomed_concept "Generalized aches and pains" "finding"))',
      '(clinical_finding (snomed_concept "Common cold" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))',
      '(clinical_finding (snomed_concept "Headache" "finding"))',
      '(clinical_finding (snomed_concept "Cough" "finding"))',
      '(clinical_finding (snomed_concept "Stiff neck" "finding"))',
    ],
  },
  {
    // Mouth/throat symptoms ⇢ 35
    label: 'Mouth or throat',
    finding_site_structure: 'Structure of mouth and/or pharynx',
    excluding_structures: ['Tooth, gum, and/or supporting structure'],
    clinical_finding_s_expressions: [
      // Red swelling blocking airway; unable to open mouth; unable to swallow at all
      '(clinical_finding (snomed_concept "Pharyngeal swelling" "finding"))',
      '(clinical_finding (snomed_concept "Upper respiratory tract obstruction" "disorder"))',
      '(clinical_finding (snomed_concept "Unable to open mouth" "finding"))',
      '(clinical_finding (snomed_concept "Unable to swallow" "finding"))',
      '(clinical_finding (snomed_concept "Difficulty swallowing" "finding"))',
      // Sudden face/tongue swelling and any of
      '(clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))',
      '(clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))',
      '(clinical_finding (snomed_concept "Wheezing" "finding"))',
      '(clinical_finding (snomed_concept "Difficulty breathing" "finding"))',
      '(clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))',
      '(clinical_finding (snomed_concept "Collapse" "finding"))',
      '(clinical_finding (snomed_concept "Abdominal pain" "finding"))',
      '(clinical_finding (snomed_concept "Finding of vomiting" "finding"))',
      // Examine the mouth and throat for redness, white patches, blisters, ulcers or cracks
      '(clinical_finding (snomed_concept "Sore throat" "finding"))',
      '(clinical_finding (snomed_concept "Enlarged tonsil" "finding"))',
      '(clinical_finding (snomed_concept "Exudate on tonsils" "finding"))',
      '(clinical_finding (snomed_concept "White patches on oral mucosa" "finding"))',
      '(clinical_finding (snomed_concept "Ulcer of mouth" "disorder") (qualifier (snomed_concept "Pain" "finding")))',
      '(clinical_finding (snomed_concept "Blister of skin AND/OR mucosa" "disorder") (finding_site (snomed_concept "Structure of mouth and/or pharynx" "body structure")) (qualifier (snomed_concept "Pain" "finding")))',
      '(clinical_finding (snomed_concept "Cracked lips" "finding"))',
      '(clinical_finding (snomed_concept "Xerostomia" "finding"))',
      '(clinical_finding (snomed_concept "Taste sense altered" "finding"))',
      '(clinical_finding (snomed_concept "Cough" "finding"))',
      '(clinical_finding (snomed_concept "Nasal discharge" "finding"))',
    ],
  },
  {
    // Gum/teeth symptoms ⇢ 36
    label: 'Teeth & gums',
    finding_site_structure: 'Tooth, gum, and/or supporting structure',
    excluding_structures: [],
    including_s_expressions: [
      '(finding (finding_site "Jaw region structure"))',
      '(finding (interprets "Eating, feeding and drinking abilities"))',
    ],
    clinical_finding_s_expressions: [
      '(clinical_finding (snomed_concept "Toothache" "finding"))',
      // Tooth pain felt without touching tooth/gum, or that wakes patient at night
      '(clinical_finding (snomed_concept "Toothache" "finding") (qualifier (snomed_concept "Spontaneous" "qualifier value")))',
      '(clinical_finding (snomed_concept "Toothache" "finding") (qualifier (snomed_concept "Wakes up during night" "finding")))',
      // Temperature and swelling of face/jaw/next to tooth
      '(clinical_finding (snomed_concept "Fever" "finding"))',
      '(clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))',
      '(clinical_finding (snomed_concept "Swelling of lower jaw region" "finding"))',
      '(clinical_finding (snomed_concept "Unable to eat" "finding"))',
      '(clinical_finding (snomed_concept "Unable to drink" "finding"))',
      // Look in mouth: lift lips to look at teeth and gums
      '(clinical_finding (snomed_concept "Bleeding gums" "finding"))',
      '(clinical_finding (snomed_concept "Swollen gums" "finding"))',
      '(clinical_finding (snomed_concept "Gingival recession" "disorder"))',
      '(clinical_finding (snomed_concept "Mobile tooth" "finding"))',
      '(clinical_finding (snomed_concept "Tooth absent" "finding"))',
      '(clinical_finding (snomed_concept "Breath smells unpleasant" "finding"))',
    ],
  },
  {
    // Chest pain ⇢ 37
    label: 'Chest',
    finding_site_structure: 'Thoracic structure',
    excluding_structures: ['Breast structure'],
    clinical_finding_s_expressions: [
      '(clinical_finding (snomed_concept "Chest pain" "finding"))',
      '(clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))',
      '(clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "New" "qualifier value")))',
      '(clinical_finding (snomed_concept "Chest discomfort" "finding"))',
      '(clinical_finding (snomed_concept "Difficulty breathing" "finding"))',
      // Pain radiates to neck, jaw, shoulder/s or arm/s
      '(clinical_finding (snomed_concept "Radiating chest pain" "finding"))',
      '(clinical_finding (snomed_concept "Pain radiating to neck" "finding"))',
      '(clinical_finding (snomed_concept "Pain radiating to jaw" "finding"))',
      '(clinical_finding (snomed_concept "Pain radiating to left arm" "finding"))',
      '(clinical_finding (snomed_concept "Pain radiating to right arm" "finding"))',
      '(clinical_finding (snomed_concept "Pain radiating to left shoulder" "finding"))',
      '(clinical_finding (snomed_concept "Pain radiating to right shoulder" "finding"))',
      '(clinical_finding (snomed_concept "Nausea" "finding"))',
      '(clinical_finding (snomed_concept "Finding of vomiting" "finding"))',
      '(clinical_finding (snomed_concept "Pale complexion" "finding"))',
      '(clinical_finding (snomed_concept "Excessive sweating" "finding"))',
      // Is chest pain worse on lying down, palpation or breathing deeply?
      '(clinical_finding (snomed_concept "Chest pain on breathing" "finding"))',
      '(clinical_finding (snomed_concept "Tenderness of chest wall" "finding"))',
      // Sudden breathlessness, more resonant/decreased breath sounds, deviated trachea
      '(clinical_finding (snomed_concept "Decreased breath sounds" "finding"))',
      '(clinical_finding (snomed_concept "Trachea displaced" "disorder"))',
      '(clinical_finding (snomed_concept "Cough" "finding"))',
      '(clinical_finding (snomed_concept "Fever" "finding"))',
      // Retrosternal or epigastric pain with eating, hunger or lying down/bending forward
      '(clinical_finding (snomed_concept "Heartburn" "finding"))',
      '(clinical_finding (snomed_concept "Difficulty swallowing" "finding"))',
      '(clinical_finding (snomed_concept "Persistent vomiting" "disorder"))',
      '(clinical_finding (snomed_concept "Abdominal mass" "finding"))',
      '(clinical_finding (snomed_concept "Melena" "disorder"))',
      '(clinical_finding (snomed_concept "Abnormal weight loss" "finding"))',
    ],
  },
  {
    // Breast symptoms ⇢ 43
    label: 'Breast',
    finding_site_structure: 'Breast structure',
    excluding_structures: [],
    including_s_expressions: [
      '(finding (finding_site "Axillary region structure"))',
    ],
    clinical_finding_s_expressions: [
      // The patient who is not breastfeeding
      '(clinical_finding (snomed_concept "Breast lump" "finding"))',
      '(clinical_finding (snomed_concept "Pain of breast" "finding"))',
      '(clinical_finding (snomed_concept "Discharge from nipple" "disorder"))',
      '(clinical_finding (snomed_concept "Bloody nipple discharge" "disorder"))',
      '(clinical_finding (snomed_concept "Retraction of nipple" "finding"))',
      '(clinical_finding (snomed_concept "Swelling of breast" "finding"))',
      '(clinical_finding (snomed_concept "Mass of axilla" "finding"))',
      // The patient who is breastfeeding
      '(clinical_finding (snomed_concept "Maternal breastfeeding" "finding"))',
      '(clinical_finding (snomed_concept "Sore nipple" "finding"))',
      '(clinical_finding (snomed_concept "Fissure of nipple" "disorder"))',
      '(clinical_finding (snomed_concept "Fever" "finding"))',
      '(clinical_finding (snomed_concept "Generalized aches and pains" "finding"))',
    ],
  },
  {
    // Abdominal pain ⇢ 44. The structure's "content of abdominopelvic cavity" covers the stomach
    label: 'Abdomen',
    finding_site_structure: 'Structure of abdominopelvic cavity and/or content of abdominopelvic cavity and/or anterior abdominal wall',
    excluding_structures: [
      'Structure of anus and/or rectum',
      'Genital structure',
      'Urinary system structure',
    ],
    clinical_finding_s_expressions: [
      '(clinical_finding (snomed_concept "Abdominal pain" "finding"))',
      '(clinical_finding (snomed_concept "Abdominal pain" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))',
      '(clinical_finding (snomed_concept "Right lower quadrant pain" "finding"))',
      '(clinical_finding (snomed_concept "Right upper quadrant pain" "finding"))',
      '(clinical_finding (snomed_concept "Abdominal discomfort" "finding"))',
      '(clinical_finding (snomed_concept "Distension of abdomen" "finding"))',
      '(clinical_finding (snomed_concept "Abdominal mass" "finding"))',
      '(clinical_finding (snomed_concept "Pelvic swelling" "finding"))',
      '(clinical_finding (snomed_concept "Abdominal guarding" "finding"))',
      '(clinical_finding (snomed_concept "Abdominal rigidity" "finding"))',
      '(clinical_finding (snomed_concept "Rebound tenderness" "finding"))',
      '(clinical_finding (snomed_concept "Chest pain" "finding"))',
      '(clinical_finding (snomed_concept "Jaundice" "finding"))',
      '(clinical_finding (snomed_concept "Retention of urine" "disorder"))',
      '(clinical_finding (snomed_concept "Nausea" "finding"))',
      '(clinical_finding (snomed_concept "Finding of vomiting" "finding"))',
      '(clinical_finding (snomed_concept "Persistent vomiting" "disorder"))',
      '(clinical_finding (snomed_concept "Fever" "finding"))',
      '(clinical_finding (snomed_concept "Loss of appetite" "finding"))',
      '(clinical_finding (snomed_concept "Constipation" "finding"))',
      '(clinical_finding (snomed_concept "Diarrhea" "finding"))',
      // Sudden abdominal pain with generalised itch/rash, face/tongue swelling, etc.
      '(clinical_finding (snomed_concept "Generalized pruritus" "finding"))',
      '(clinical_finding (snomed_concept "Generalized rash" "disorder"))',
      '(clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))',
      '(clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))',
      '(clinical_finding (snomed_concept "Difficulty breathing" "finding"))',
      '(clinical_finding (snomed_concept "Dizziness" "finding"))',
      '(clinical_finding (snomed_concept "Collapse" "finding"))',
      // Lower abdominal pain in a woman
      '(clinical_finding (snomed_concept "Vaginal discharge" "finding") (qualifier (snomed_concept "Abnormal" "qualifier value")))',
      // Epigastric pain worse with eating, hunger or lying down/bending forward
      '(clinical_finding (snomed_concept "Heartburn" "finding"))',
      '(clinical_finding (snomed_concept "Difficulty swallowing" "finding"))',
      '(clinical_finding (snomed_concept "Melena" "disorder"))',
      '(clinical_finding (snomed_concept "Abnormal weight loss" "finding"))',
    ],
  },
  {
    // Constipation and anal symptoms ⇢ 48
    label: 'Anal & rectal',
    finding_site_structure: 'Structure of anus and/or rectum',
    excluding_structures: [],
    clinical_finding_s_expressions: [
      // Constipation
      '(clinical_finding (snomed_concept "Constipation" "finding"))',
      '(clinical_finding (snomed_concept "Abdominal pain" "finding"))',
      '(clinical_finding (snomed_concept "Distension of abdomen" "finding"))',
      '(clinical_finding (snomed_concept "Irregular bowel habits" "finding"))',
      // Anal symptoms
      '(clinical_finding (snomed_concept "Anal pain" "finding"))',
      '(clinical_finding (snomed_concept "Perianal lump" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "Pain" "finding")))',
      '(clinical_finding (snomed_concept "Does not defecate" "finding"))',
      '(clinical_finding (snomed_concept "Painless rectal bleeding" "finding"))',
      '(clinical_finding (snomed_concept "Rectal discharge" "finding"))',
      '(clinical_finding (snomed_concept "Tenesmus of anus and/or rectum" "finding"))',
      // Examine the anal area to look for cause
      '(clinical_finding (snomed_concept "Anal fissure" "disorder"))',
      '(clinical_finding (snomed_concept "Hemorrhoids" "disorder"))',
      '(clinical_finding (snomed_concept "Ulcer of anus" "disorder"))',
      '(clinical_finding (snomed_concept "Anal warts" "disorder"))',
      '(clinical_finding (snomed_concept "Erythema" "finding") (finding_site (snomed_concept "Anal structure" "body structure")))',
      '(clinical_finding (snomed_concept "Pruritus ani" "disorder"))',
      '(clinical_finding (snomed_concept "Melena" "disorder"))',
      '(clinical_finding (snomed_concept "Abnormal weight loss" "finding"))',
    ],
  },
  {
    // Genital symptoms ⇢ 49, in a man ⇢ 50, vaginal discharge ⇢ 51, vaginal bleeding ⇢ 57
    label: 'Genital',
    finding_site_structure: 'Genital structure',
    excluding_structures: ['Urinary system structure', 'Structure of anus and/or rectum'],
    clinical_finding_s_expressions: [
      // Assess the patient with genital symptoms ⇢ 49
      '(clinical_finding (snomed_concept "Abnormal urogenital discharge" "finding"))',
      '(clinical_finding (snomed_concept "Ulcer" "morphologic abnormality") (finding_site (snomed_concept "Genital structure" "body structure")))',
      '(clinical_finding (snomed_concept "Rash of genitalia" "disorder"))',
      '(clinical_finding (snomed_concept "Itching" "finding") (finding_site (snomed_concept "Genital structure" "body structure")))',
      '(clinical_finding (snomed_concept "Mass of body region" "finding") (finding_site (snomed_concept "Genital structure" "body structure")))',
      '(clinical_finding (snomed_concept "Anogenital warts" "disorder"))',
      '(clinical_finding (snomed_concept "Infestation caused by Phthirus pubis" "disorder"))',
      '(clinical_finding (snomed_concept "Pain in pelvis" "finding"))',
      // Genital symptoms in a man ⇢ 50
      '(clinical_finding (snomed_concept "Swelling of scrotum" "finding"))',
      '(clinical_finding (snomed_concept "Pain in scrotum" "finding"))',
      '(clinical_finding (snomed_concept "Acute pain of scrotum" "finding"))',
      '(clinical_finding (snomed_concept "Severe pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))',
      '(clinical_finding (snomed_concept "Retractile testis" "disorder"))',
      '(clinical_finding (snomed_concept "Mass of scrotum" "finding"))',
      '(clinical_finding (snomed_concept "Urethral discharge" "finding"))',
      '(clinical_finding (snomed_concept "Dysuria" "finding"))',
      '(clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Glans penis structure" "body structure")) (qualifier (snomed_concept "Pain" "finding")))',
      '(clinical_finding (snomed_concept "Severe pain" "finding") (finding_site (snomed_concept "Glans penis structure" "body structure")))',
      '(clinical_finding (snomed_concept "Tightly retracted foreskin" "finding"))',
      '(clinical_finding (snomed_concept "Pain in penis" "finding"))',
      '(clinical_finding (snomed_concept "Penile swelling" "disorder"))',
      '(clinical_finding (snomed_concept "Priapism" "disorder"))',
      // Abnormal vaginal discharge ⇢ 51
      '(clinical_finding (snomed_concept "Vaginal discharge" "finding"))',
      '(clinical_finding (snomed_concept "Vaginal discharge" "finding") (qualifier (snomed_concept "Abnormal" "qualifier value")))',
      '(clinical_finding (snomed_concept "Pruritus of vulva" "disorder"))',
      '(clinical_finding (snomed_concept "Inflammation of vulva" "disorder"))',
      '(clinical_finding (snomed_concept "Cervical excitation present" "finding"))',
      '(clinical_finding (snomed_concept "Abdominal mass" "finding"))',
      '(clinical_finding (snomed_concept "Fever" "finding"))',
      // Abnormal vaginal bleeding ⇢ 57
      '(clinical_finding (snomed_concept "Bleeding from vagina" "finding"))',
      '(clinical_finding (snomed_concept "Menorrhagia" "finding"))',
      '(clinical_finding (snomed_concept "Irregular periods" "finding"))',
      '(clinical_finding (snomed_concept "Bleeding between periods" "finding"))',
      '(clinical_finding (snomed_concept "Postcoital bleeding" "finding"))',
      '(clinical_finding (snomed_concept "Pelvic swelling" "finding"))',
      '(clinical_finding (snomed_concept "Pale complexion" "finding"))',
      '(clinical_finding (snomed_concept "Dizziness" "finding"))',
      '(clinical_finding (snomed_concept "Chest pain" "finding"))',
    ],
  },
  {
    // Urinary symptoms ⇢ 59
    label: 'Urinary',
    finding_site_structure: 'Urinary system structure',
    excluding_structures: ['Genital structure'],
    clinical_finding_s_expressions: [
      '(clinical_finding (snomed_concept "Dysuria" "finding"))',
      '(clinical_finding (snomed_concept "Increased frequency of urination" "finding"))',
      '(clinical_finding (snomed_concept "Urgent desire to urinate" "finding"))',
      '(clinical_finding (snomed_concept "Retention of urine" "disorder"))',
      '(clinical_finding (snomed_concept "Urinary incontinence" "finding"))',
      '(clinical_finding (snomed_concept "Abnormal urinary stream" "finding"))',
      '(clinical_finding (snomed_concept "Oliguria" "finding"))',
      '(clinical_finding (snomed_concept "Blood in urine" "finding"))',
      '(clinical_finding (snomed_concept "Proteinuria" "finding"))',
      '(clinical_finding (snomed_concept "Abdominal discomfort" "finding"))',
      '(clinical_finding (snomed_concept "Distension of abdomen" "finding"))',
      // New swelling of face/feet
      '(clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))',
      '(clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Foot structure" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))',
      // Sudden, severe, one-sided pain in flank or groin
      '(clinical_finding (snomed_concept "Flank pain" "finding"))',
      '(clinical_finding (snomed_concept "Flank pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))',
      '(clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Inguinal region structure" "body structure")))',
      '(clinical_finding (snomed_concept "Finding of vomiting" "finding"))',
      '(clinical_finding (snomed_concept "Fever" "finding"))',
      '(clinical_finding (snomed_concept "Urethral discharge" "finding"))',
      '(clinical_finding (snomed_concept "Tenderness of prostate" "finding"))',
      '(clinical_finding (snomed_concept "Generalized aches and pains" "finding"))',
    ],
  },
  {
    // Joint symptoms ⇢ 62
    label: 'Joint',
    finding_site_structure: 'Joint structure',
    excluding_structures: [],
    clinical_finding_s_expressions: [
      '(clinical_finding (snomed_concept "Pain of joint" "finding"))',
      '(clinical_finding (snomed_concept "Pain of joint" "finding") (qualifier (snomed_concept "Acute pain" "finding")))',
      '(clinical_finding (snomed_concept "Pain of joint" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))',
      '(clinical_finding (snomed_concept "Joint swelling" "finding"))',
      '(clinical_finding (snomed_concept "Joint warm" "finding"))',
      '(clinical_finding (snomed_concept "Tenderness of joint" "finding"))',
      '(clinical_finding (snomed_concept "Erythema" "finding") (finding_site (snomed_concept "Joint structure" "body structure")))',
      '(clinical_finding (snomed_concept "Limitation of joint movement" "finding"))',
      '(clinical_finding (snomed_concept "Deformity" "finding"))',
      '(clinical_finding (snomed_concept "Unable to weight-bear" "finding"))',
      '(clinical_finding (snomed_concept "Fever" "finding"))',
      '(clinical_finding (snomed_concept "Injury of musculoskeletal system" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))',
      // Recent genital discharge or painless non-itchy skin rash
      '(clinical_finding (snomed_concept "Abnormal urogenital discharge" "finding") (qualifier (snomed_concept "Recent" "qualifier value")))',
      '(clinical_finding (snomed_concept "Eruption of skin" "disorder"))',
    ],
  },
  {
    // Back pain ⇢ 63
    label: 'Back',
    finding_site_structure: 'Structure of posterior region of trunk',
    excluding_structures: ['Neck structure'],
    clinical_finding_s_expressions: [
      '(clinical_finding (snomed_concept "Backache" "finding"))',
      '(clinical_finding (snomed_concept "Backache" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))',
      // Bladder or bowel disturbance — retention or incontinence
      '(clinical_finding (snomed_concept "Retention of urine" "disorder"))',
      '(clinical_finding (snomed_concept "Urinary incontinence" "finding"))',
      '(clinical_finding (snomed_concept "Incontinence of feces" "finding"))',
      // Numbness of buttocks, perineum or legs; leg weakness or difficulty walking
      '(clinical_finding (snomed_concept "Numbness" "finding") (finding_site (snomed_concept "Buttock structure" "body structure")))',
      '(clinical_finding (snomed_concept "Numbness" "finding") (finding_site (snomed_concept "Perineal structure" "body structure")))',
      '(clinical_finding (snomed_concept "Numbness of limbs" "finding"))',
      '(clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))',
      '(clinical_finding (snomed_concept "Difficulty walking" "finding"))',
      '(clinical_finding (snomed_concept "Injury of musculoskeletal system" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))',
      // Sudden onset severe upper abdominal pain with nausea/vomiting; pulsatile abdominal mass
      '(clinical_finding (snomed_concept "Abdominal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))',
      '(clinical_finding (snomed_concept "Nausea" "finding"))',
      '(clinical_finding (snomed_concept "Finding of vomiting" "finding"))',
      '(clinical_finding (snomed_concept "Abdominal mass" "finding") (qualifier (snomed_concept "Pulsatile" "qualifier value")))',
      // If flank, check urine dipstick
      '(clinical_finding (snomed_concept "Flank pain" "finding"))',
      '(clinical_finding (snomed_concept "Blood in urine" "finding"))',
      '(clinical_finding (snomed_concept "Fever" "finding"))',
      // Cough, weight loss, night sweats or fever
      '(clinical_finding (snomed_concept "Cough" "finding"))',
      '(clinical_finding (snomed_concept "Abnormal weight loss" "finding"))',
      '(clinical_finding (snomed_concept "Night sweats" "finding"))',
      '(clinical_finding (snomed_concept "Deformity" "finding"))',
    ],
  },
  {
    // Neck pain ⇢ 64
    label: 'Neck',
    finding_site_structure: 'Neck structure',
    excluding_structures: [],
    clinical_finding_s_expressions: [
      '(clinical_finding (snomed_concept "Neck pain" "finding"))',
      '(clinical_finding (snomed_concept "Neck pain" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))',
      '(clinical_finding (snomed_concept "Stiff neck" "finding"))',
      // Neck stiffness and any of: temperature, headache, drowsy/confused or purple/red rash
      '(clinical_finding (snomed_concept "Fever" "finding"))',
      '(clinical_finding (snomed_concept "Headache" "finding"))',
      '(clinical_finding (snomed_concept "Drowsy" "finding"))',
      '(clinical_finding (snomed_concept "Clouded consciousness" "finding"))',
      '(clinical_finding (snomed_concept "Purpuric rash" "disorder"))',
      // Neurological symptoms in arms/legs
      '(clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding"))',
      '(clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))',
      '(clinical_finding (snomed_concept "Numbness of limbs" "finding"))',
      '(clinical_finding (snomed_concept "Clumsiness" "finding"))',
      '(clinical_finding (snomed_concept "Abnormal gait" "finding"))',
      '(clinical_finding (snomed_concept "Decreased coordination" "finding"))',
      '(clinical_finding (snomed_concept "Injury of neck" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))',
      '(clinical_finding (snomed_concept "Abnormal weight loss" "finding"))',
      '(clinical_finding (snomed_concept "Mass of neck" "finding"))',
    ],
  },
  {
    // Arm or hand symptoms ⇢ 64
    label: 'Arm',
    finding_site_structure: 'Upper limb structure',
    excluding_structures: ['Hand structure'],
    clinical_finding_s_expressions: [
      '(clinical_finding (snomed_concept "Pain in upper limb" "finding"))',
      '(clinical_finding (snomed_concept "Pain in left arm" "finding"))',
      '(clinical_finding (snomed_concept "Pain in right arm" "finding"))',
      '(clinical_finding (snomed_concept "Chest pain" "finding"))',
      // New sudden onset of weakness of arm with/without difficulty speaking or visual disturbance
      '(clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")))',
      '(clinical_finding (snomed_concept "Difficulty talking" "finding"))',
      '(clinical_finding (snomed_concept "Visual disturbance" "disorder"))',
      // Recent injury and severe pain/swelling or deformity
      '(clinical_finding (snomed_concept "Injury of musculoskeletal system" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))',
      '(clinical_finding (snomed_concept "Severe pain" "finding"))',
      '(clinical_finding (snomed_concept "Swelling of upper arm" "finding"))',
      '(clinical_finding (snomed_concept "Deformity of upper limb" "finding"))',
      // Joint warm/tender/swollen
      '(clinical_finding (snomed_concept "Joint swelling" "finding"))',
      '(clinical_finding (snomed_concept "Joint warm" "finding"))',
      '(clinical_finding (snomed_concept "Tenderness of joint" "finding"))',
      // Painful shoulder; elbow pain with or after elbow flexion/extension
      '(clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Shoulder region structure" "body structure")))',
      '(clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Elbow region structure" "body structure")))',
    ],
  },
  {
    // Arm or hand symptoms ⇢ 64, the wrist and hand columns
    label: 'Hand',
    finding_site_structure: 'Hand structure',
    excluding_structures: ['Nail unit structure'],
    clinical_finding_s_expressions: [
      '(clinical_finding (snomed_concept "Hand pain" "finding"))',
      '(clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Wrist region structure" "body structure")))',
      '(clinical_finding (snomed_concept "Chest pain" "finding"))',
      // Recent injury and severe pain/swelling or deformity
      '(clinical_finding (snomed_concept "Injury of musculoskeletal system" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))',
      '(clinical_finding (snomed_concept "Severe pain" "finding"))',
      '(clinical_finding (snomed_concept "Swelling of hand" "finding"))',
      '(clinical_finding (snomed_concept "Deformity of upper limb" "finding"))',
      '(clinical_finding (snomed_concept "Joint swelling" "finding"))',
      '(clinical_finding (snomed_concept "Joint warm" "finding"))',
      '(clinical_finding (snomed_concept "Tenderness of joint" "finding"))',
      // Wrist/hand pain worse at night, relieved by shaking, with numbness/tingling or weakness
      '(clinical_finding (snomed_concept "Hand pain" "finding") (qualifier (snomed_concept "Wakes up during night" "finding")))',
      '(clinical_finding (snomed_concept "Numbness of finger" "finding"))',
      '(clinical_finding (snomed_concept "Numbness and tingling sensation of skin" "finding") (finding_site (snomed_concept "Hand structure" "body structure")))',
      '(clinical_finding (snomed_concept "Weakness of hand" "finding"))',
      // Pain at base of thumb worsened by thumb or wrist movement; catching/locking of finger
      '(clinical_finding (snomed_concept "Pain in thumb" "finding"))',
      '(clinical_finding (snomed_concept "Acquired trigger finger" "disorder"))',
    ],
  },
  {
    // Leg symptoms ⇢ 65
    label: 'Leg',
    finding_site_structure: 'Lower limb structure',
    excluding_structures: ['Foot structure'],
    clinical_finding_s_expressions: [
      '(clinical_finding (snomed_concept "Pain in lower limb" "finding"))',
      '(clinical_finding (snomed_concept "Pain in lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))',
      // Swelling and pain in one calf
      '(clinical_finding (snomed_concept "Pain in calf" "finding"))',
      '(clinical_finding (snomed_concept "Pain in calf" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))',
      '(clinical_finding (snomed_concept "Swollen calf" "finding"))',
      '(clinical_finding (snomed_concept "Swollen calf" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))',
      '(clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Lower limb structure" "body structure")))',
      // Numbness, weakness, pallor, no pulse
      '(clinical_finding (snomed_concept "Numbness of limbs" "finding"))',
      '(clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))',
      '(clinical_finding (snomed_concept "Pale complexion" "finding"))',
      '(clinical_finding (snomed_concept "Peripheral pulse absent" "finding"))',
      '(clinical_finding (snomed_concept "Absent pulse" "finding"))',
      // Muscle pain in legs or buttocks on exercise, with rest pain, gangrene or ulceration
      '(clinical_finding (snomed_concept "Intermittent claudication" "finding"))',
      '(clinical_finding (snomed_concept "Intermittent claudication" "finding") (finding_site (snomed_concept "Buttock structure" "body structure")))',
      '(clinical_finding (snomed_concept "Gangrene" "morphologic abnormality"))',
      '(clinical_finding (snomed_concept "Ulcer" "morphologic abnormality"))',
      '(clinical_finding (snomed_concept "Unable to weight-bear" "finding"))',
      '(clinical_finding (snomed_concept "Injury of lower limb" "disorder"))',
      // Both legs swollen: difficulty breathing worse on lying flat, or kidney disease on dipstick
      '(clinical_finding (snomed_concept "Orthopnea" "finding"))',
      '(clinical_finding (snomed_concept "Blood in urine" "finding"))',
      '(clinical_finding (snomed_concept "Proteinuria" "finding"))',
      // Pain in buttock radiating down back of lower leg
      '(clinical_finding (snomed_concept "Sciatica" "disorder"))',
      '(clinical_finding (snomed_concept "Cramp" "finding"))',
      // Retention or incontinence of urine or stool; numbness of buttocks or perineum
      '(clinical_finding (snomed_concept "Retention of urine" "disorder"))',
      '(clinical_finding (snomed_concept "Urinary incontinence" "finding"))',
      '(clinical_finding (snomed_concept "Incontinence of feces" "finding"))',
      '(clinical_finding (snomed_concept "Numbness" "finding") (finding_site (snomed_concept "Buttock structure" "body structure")))',
      '(clinical_finding (snomed_concept "Difficulty walking" "finding"))',
      // Check skin: painful areas, ulcer/s, lump/s or changes in skin colour; groin lump
      '(clinical_finding (snomed_concept "Skin ulcer" "disorder"))',
      '(clinical_finding (snomed_concept "Skin lesion" "disorder"))',
      '(clinical_finding (snomed_concept "Groin mass" "finding"))',
    ],
  },
  {
    // Foot symptoms ⇢ 66
    label: 'Foot',
    finding_site_structure: 'Foot structure',
    excluding_structures: ['Nail unit structure'],
    clinical_finding_s_expressions: [
      '(clinical_finding (snomed_concept "Foot pain" "finding"))',
      '(clinical_finding (snomed_concept "Foot pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))',
      '(clinical_finding (snomed_concept "Unable to weight-bear" "finding"))',
      '(clinical_finding (snomed_concept "Injury of lower limb" "disorder"))',
      // Numbness, weakness, pallor, no pulse in the leg
      '(clinical_finding (snomed_concept "Numbness of lower limb" "finding"))',
      '(clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))',
      '(clinical_finding (snomed_concept "Pale complexion" "finding"))',
      '(clinical_finding (snomed_concept "Peripheral pulse absent" "finding"))',
      '(clinical_finding (snomed_concept "Absent pulse" "finding") (finding_site (snomed_concept "Lower limb structure" "body structure")))',
      // Muscle pain in legs or buttocks on exercise with foot pain at rest, ulcer or gangrene
      '(clinical_finding (snomed_concept "Intermittent claudication" "finding"))',
      '(clinical_finding (snomed_concept "Intermittent claudication" "finding") (finding_site (snomed_concept "Buttock structure" "body structure")))',
      '(clinical_finding (snomed_concept "Ulcer of foot" "disorder"))',
      '(clinical_finding (snomed_concept "Gangrene of foot" "disorder"))',
      // Cracks/peeling/scaly lesions between toes, thickened scaly skin on soles/heels
      '(clinical_finding (snomed_concept "Peeling of skin" "finding") (finding_site (snomed_concept "Foot structure" "body structure")))',
      '(clinical_finding (snomed_concept "Scaly skin" "finding") (finding_site (snomed_concept "Foot structure" "body structure")))',
      // Constant burning pain, pins/needles or numbness of feet worse at night
      '(clinical_finding (snomed_concept "Burning feet" "finding"))',
      '(clinical_finding (snomed_concept "Paresthesia of foot" "finding"))',
      '(clinical_finding (snomed_concept "Numbness of foot" "finding"))',
      // Heel pain worse on starting walking; foot deformity, bony lump at base of big toe
      '(clinical_finding (snomed_concept "Heel pain" "finding"))',
      '(clinical_finding (snomed_concept "Deformity of foot" "finding"))',
      '(clinical_finding (snomed_concept "Hallux valgus AND bunion" "disorder"))',
      '(clinical_finding (snomed_concept "Callosity" "disorder"))',
      // The foot at risk in the patient with diabetes or peripheral vascular disease
      '(clinical_finding (snomed_concept "Blister of skin" "disorder") (finding_site (snomed_concept "Foot structure" "body structure")))',
      '(clinical_finding (snomed_concept "Abnormal sensation" "finding") (finding_site (snomed_concept "Foot structure" "body structure")))',
    ],
  },
  {
    // Skin symptoms ⇢ 67
    label: 'Skin',
    finding_site_structure: 'Skin structure',
    excluding_structures: ['Nail unit structure', 'Scalp structure'],
    clinical_finding_s_expressions: [
      // Sudden generalised itch/rash or face/tongue swelling and any of
      '(clinical_finding (snomed_concept "Generalized pruritus" "finding"))',
      '(clinical_finding (snomed_concept "Generalized rash" "disorder"))',
      '(clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))',
      '(clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))',
      '(clinical_finding (snomed_concept "Wheezing" "finding"))',
      '(clinical_finding (snomed_concept "Difficulty breathing" "finding"))',
      '(clinical_finding (snomed_concept "Dizziness" "finding"))',
      '(clinical_finding (snomed_concept "Collapse" "finding"))',
      '(clinical_finding (snomed_concept "Abdominal pain" "finding"))',
      '(clinical_finding (snomed_concept "Finding of vomiting" "finding"))',
      // Purple/red rash with neck stiffness, drowsy/confused, temperature, headache
      '(clinical_finding (snomed_concept "Purpuric rash" "disorder"))',
      '(clinical_finding (snomed_concept "Stiff neck" "finding"))',
      '(clinical_finding (snomed_concept "Drowsy" "finding"))',
      '(clinical_finding (snomed_concept "Clouded consciousness" "finding"))',
      '(clinical_finding (snomed_concept "Fever" "finding"))',
      '(clinical_finding (snomed_concept "Headache" "finding"))',
      // Diffuse rash within 3 months of a new medication, involving mouth, eyes or genitals
      '(clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))',
      '(clinical_finding (snomed_concept "Perioral dermatitis" "disorder"))',
      '(clinical_finding (snomed_concept "Periocular dermatitis" "disorder"))',
      '(clinical_finding (snomed_concept "Rash of genitalia" "disorder"))',
      '(clinical_finding (snomed_concept "Blister of skin" "disorder"))',
      '(clinical_finding (snomed_concept "Peeling of skin" "finding"))',
      '(clinical_finding (snomed_concept "Jaundice" "finding"))',
      '(clinical_finding (snomed_concept "Diarrhea" "finding"))',
      // Manage according to skin symptom/s
      '(clinical_finding (snomed_concept "Pain of skin" "finding"))',
      '(clinical_finding (snomed_concept "Itching of skin" "finding"))',
      '(clinical_finding (snomed_concept "Eruption of skin" "disorder"))',
      '(clinical_finding (snomed_concept "Skin lesion" "disorder"))',
      '(clinical_finding (snomed_concept "Acne" "disorder"))',
      '(clinical_finding (snomed_concept "Comedo" "morphologic abnormality"))',
      '(clinical_finding (snomed_concept "Skin ulcer" "disorder"))',
      '(clinical_finding (snomed_concept "Crust on skin" "finding"))',
      '(clinical_finding (snomed_concept "Scaly skin" "finding"))',
      '(clinical_finding (snomed_concept "Discoloration of skin" "finding"))',
    ],
  },
  {
    // Scalp symptoms ⇢ 80, hair loss ⇢ 81
    label: 'Hair & scalp',
    finding_site_structure: 'Scalp structure',
    excluding_structures: [],
    clinical_finding_s_expressions: [
      // Scalp symptoms ⇢ 80
      '(clinical_finding (snomed_concept "Itching of skin" "finding") (finding_site (snomed_concept "Scalp structure" "body structure")))',
      '(clinical_finding (snomed_concept "Eruption of scalp" "disorder"))',
      '(clinical_finding (snomed_concept "Pediculosis capitis" "disorder"))',
      '(clinical_finding (snomed_concept "Scaly scalp" "finding"))',
      '(clinical_finding (snomed_concept "Erythema" "finding") (finding_site (snomed_concept "Scalp structure" "body structure")))',
      '(clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Scalp structure" "body structure")))',
      '(clinical_finding (snomed_concept "Blister of skin" "disorder") (finding_site (snomed_concept "Scalp structure" "body structure")))',
      '(clinical_finding (snomed_concept "Pustule" "morphologic abnormality") (finding_site (snomed_concept "Scalp structure" "body structure")))',
      '(clinical_finding (snomed_concept "Pitting of nails" "disorder"))',
      // Hair loss ⇢ 81
      '(clinical_finding (snomed_concept "Loss of scalp hair" "finding"))',
      '(clinical_finding (snomed_concept "Loss of hair" "finding"))',
      '(clinical_finding (snomed_concept "Hirsutism" "disorder"))',
      '(clinical_finding (snomed_concept "Irregular periods" "finding"))',
      '(clinical_finding (snomed_concept "Abnormal weight loss" "finding"))',
    ],
  },
  {
    // Nail symptoms ⇢ 82
    label: 'Nail',
    finding_site_structure: 'Nail unit structure',
    excluding_structures: [],
    clinical_finding_s_expressions: [
      // Disfigured nail with swollen nail bed and loss of cuticle
      '(clinical_finding (snomed_concept "Nail deformity" "disorder"))',
      '(clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Nail bed structure" "body structure")))',
      '(clinical_finding (snomed_concept "Nail fold finding" "finding") (finding_site (snomed_concept "Structure of cuticle of nail" "body structure")))',
      // Pain, redness and swelling of nail folds, there may be pus
      '(clinical_finding (snomed_concept "Pain" "finding") (finding_site (snomed_concept "Nail unit structure" "body structure")))',
      '(clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Structure of proximal nail fold" "body structure")))',
      '(clinical_finding (snomed_concept "Purulent discharge" "morphologic abnormality") (finding_site (snomed_concept "Nail unit structure" "body structure")))',
      // White/yellow disfigured or crumbling nails
      '(clinical_finding (snomed_concept "Yellow nails" "finding"))',
      '(clinical_finding (snomed_concept "Nails crumble" "finding"))',
      // Blue/brown/black discolouration of nail, and recent trauma to nail
      '(clinical_finding (snomed_concept "Nail discoloration" "finding"))',
      '(clinical_finding (snomed_concept "Injury of nail" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))',
      // Transverse dents in nails
      '(clinical_finding (snomed_concept "Beau\'s lines" "disorder"))',
      // Nails long and dirty and patient unkempt
      '(clinical_finding (snomed_concept "Nails dirty" "finding"))',
      '(clinical_finding (snomed_concept "Unkempt appearance" "finding"))',
    ],
  },
]

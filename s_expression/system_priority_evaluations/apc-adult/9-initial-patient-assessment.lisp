;; Page 9 - Initial Patient Assessment: Emergency signs
(system_priority_evaluation
  "Emergency: health assessment with emergency danger signs"
  adult
  Emergency
  (or
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Unable to complete a sentence in one breath" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Hematemesis" "disorder"))
    (clinical_finding (snomed_concept "Hemoptysis" "finding"))
    (clinical_finding (snomed_concept "Overdose" "disorder"))
    (clinical_finding (snomed_concept "Burn" "disorder"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
  )
)
;; Page 9 - Initial Patient Assessment: Urgent signs
(system_priority_evaluation
  "Urgent: health assessment with urgent danger signs"
  adult
  Urgent
  (or
    (clinical_finding (snomed_concept "Vomiting" "disorder"))
    (clinical_finding (snomed_concept "Aggressive behavior" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Feeling agitated" "finding"))
    (clinical_finding (snomed_concept "Bleeding" "finding"))
    (clinical_finding (snomed_concept "Injury of eye region" "disorder"))
    (clinical_finding (snomed_concept "Severe pain" "finding"))
    (clinical_finding (snomed_concept "Bone injury" "disorder"))
    (clinical_finding (snomed_concept "Dislocation of joint" "disorder"))
    (clinical_finding (snomed_concept "Muscle weakness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Unable to void urine" "finding"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
  )
)

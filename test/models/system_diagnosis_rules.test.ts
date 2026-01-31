import { afterAll } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'

import { SYSTEM_DIAGNOSIS_RULES_PARSED } from '../../db/models/system_diagnosis_rules.ts'

describeParallel('db/models/system_diagnosis_rules.ts', () => {
  afterAll(() => db.destroy())

  itParallel(
    'returns positive findings where they exist',
    () => {
      console.log({ SYSTEM_DIAGNOSIS_RULES_PARSED })
      // const exposure_to_fish_s_expr = '(finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Fish" "substance"))'

      // const { patient_id, patient_encounter_id } = await setupTriageNewPatient({
      //   patient_demographics: randomDemographics('ZA', 'female', 'adult'),
      //   warning_signs: asWarningSigns([], { pregnant: false }, exposure_to_fish_s_expr),
      //   brief_history: {
      //     diabetes: {
      //       existence: 'No',
      //     },
      //     pregnancy: {
      //       existence: 'No',
      //     },
      //   },
      // })

      // const exposure_to_fish = await patient_findings.findOne(db, {
      //   patient_id,
      //   s_expression: exposure_to_fish_s_expr
      // })

      // const result = await system_diagnosis_rules.insertSystemDiagnosesIfNotAlreadyIdentified(db, {
      //   patient_id,
      //   patient_encounter_id,
      //   patient_age_determination: 'adult',
      //   findings: [{
      //     id: exposure_to_fish.id,
      //     existence: 'Yes'
      //   }]
      // })

      // console.log(result)
    },
  )
})

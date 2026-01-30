import { afterAll } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'

import { TASKS } from '../../shared/tasks.ts'
import { pMap } from '../../util/inParallel.ts'
import { nameAndCategorySnomedConceptBase } from '../../db/models/s_expression.ts'
import { assert } from 'std/assert/assert.ts'
import { snomed_concept_id } from '../../util/validators.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { system_diagnosis_rules, SYSTEM_DIAGNOSIS_RULES_PARSED } from '../../db/models/system_diagnosis_rules.ts'
import { asWarningSigns, setupTriageNewPatient } from '../web/patients/open_encounter/triage/_setup.ts'
import randomDemographics from '../../mocks/randomDemographics.ts'
import { patient_findings } from '../../db/models/patient_findings.ts'

describeParallel('db/models/system_diagnosis_rules.ts', () => {
  afterAll(() => db.destroy())


  itParallel(
    'returns positive findings where they exist',
    async () => {
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

// import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
// import { afterAll } from 'std/testing/bdd.ts'
// import db from '../../db/db.ts'
// import {
//   parseExpression,
//   parseExpressionExpectingAtom,
// } from '../../shared/s_expression.ts'
// import { addTestEmployee } from '../_helpers/employees.ts'
// import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from '../_helpers/workflows.ts'
// import {
//   CLINICAL_FINDING,
//   patient_findings,
// } from '../../db/models/patient_findings.ts'
// import { assertEquals } from 'std/assert/assert_equals.ts'
// import { WORKFLOW_STEP_SNOMED_CONCEPT_IDS } from '../../shared/workflow.ts'
// import {
//   buildExpression,
//   satisfyingSExpression,
// } from '../../db/models/s_expression.ts'
// import { patient_procedures } from '../../db/models/patient_procedures.ts'
// import { patient_record_providers } from '../../db/models/patient_record_providers.ts'
// import { assertMatches } from '../../util/assertMatches.ts'
// import { assert } from 'std/assert/assert.ts'
// import z from 'zod'
// import { debugLog } from '../../db/helpers.ts'

// describeParallel('db/models/patient_interpreter.ts', () => {
//   afterAll(() => db.destroy())

//   itParallel(
//     'can model complex rules such as BP >= 180/110 and not pregnant',
//     async () => {
//       // setupTriage()

//       const patient_with_gum_teeth = `
//         (patient
//           (this_visit
//             (symptom
//               (finding_site (snomed_concept "Tooth, gum, and/or supporting structure" "body structure")))

//           ))

//         `

//   })
// })

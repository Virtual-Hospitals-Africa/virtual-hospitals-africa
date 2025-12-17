// import { describe, it } from 'std/testing/bdd.ts'
// import { assertEquals } from 'std/assert/assert_equals.ts'
// import {
//   addTestEmployeeWithSession,
//   getFormValues,
//   route,
// } from '../utilities.ts'
// import * as patient_encounters from '../../../db/models/patient_encounters.ts'
// import db from '../../../db/db.ts'

// describe(
//   '/app/patients/[patient_id]/encounters/open/symptoms',
//   { sanitizeResources: false, sanitizeOps: false },
//   () => {
//     it('renders a page on GET for an open encounter', async () => {
//       const { health_worker, fetchCheerio } =
//         await addTestEmployeeWithSession(db, {
//           profession: 'nurse', specialty: 'Primary care', registration_status: 'approved',
//         })
//       const { patient_id } = await patient_encounters
//         .insertSeekingTreatmentWithEmployeeForTest(
//           db,
//           '00000000-0000-0000-0000-000000000001',
//           {
//             patient_name: 'Test Patient',
//             employment_id: health_worker.employee_id,
//           },
//         )

//       const $ = await fetchCheerio(
//         `${route}/app/patients/${patient_id}/encounters/open/symptoms`,
//       )

//       const form_values = getFormValues($)

//       assertEquals(form_values, {
//         done: true,
//         chief_complaint: null,
//       })
//     })
//   },
// )

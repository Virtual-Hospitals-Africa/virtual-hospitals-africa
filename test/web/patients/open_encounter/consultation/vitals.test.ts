// import { describe, it } from 'std/testing/bdd.ts'
// import * as cheerio from 'cheerio'
// import { assertEquals } from 'std/assert/assert_equals.ts'
// import {
//   addTestEmployeeWithSession,
//   getFormValues,
//   route,
// } from '../utilities.ts'
// import * as patients from '../../../db/models/patients.ts'
// import * as patient_encounters from '../../../db/models/patient_encounters.ts'
// import { patient_measurements } from '../../../db/models/patient_measurements.ts'
// import db from '../../../db/db.ts'
// import { VITALS_SNOMED_CODE, VITALS_UNITS } from '../../../shared/vitals.ts'
// import generateUUID from '../../../util/uuid.ts'
// import { assert } from 'std/assert/assert.ts'
// import isObjectLike from '../../../util/isObjectLike.ts'
// import { assertArrayIncludes } from 'std/assert/assert_array_includes.ts'

// describe(
//   '/app/patients/[patient_id]/encounters/[patient_encounter_id]/vitals',
//   { sanitizeResources: false, sanitizeOps: false },
//   () => {
//     it('renders a page on GET for an open encounter', async () => {
//       const patient = await patients.insert(db, { name: 'Test Patient' })
//       const { health_worker, fetch } = await addTestEmployeeWithSession(
//         db,
//         {
//           profession: 'nurse', specialty: 'primary care', registration_status: 'approved',
//         },
//       )
//       const encounter = await patient_encounters
//         .insertReturningSeekingTreatmentWithEmployeeForTest(
//           db,
//           '00000000-0000-0000-0000-000000000001',
//           {
//             patient_id: patient.id,
//             employment_id: health_worker.employee_id,
//           },
//         )

//       const response = await fetch(
//         `${route}/app/patients/${patient.id}/encounters/${encounter.id}/vitals`,
//       )

//       if (!response.ok) throw new Error(await response.text())
//       const page_contents =await response.text()

//       const $ = cheerio.load(page_contents)

//       const form_values = getFormValues($)
//       assert(isObjectLike(form_values))
//       const findings = Object.values(form_values.findings || {})

//       assertArrayIncludes(findings, [{
//         snomed_concept_id: 103228002,
//         units: '%',
//         value: null,
//       }])
//       assertArrayIncludes(findings, [{
//         snomed_concept_id: 271649006,
//         units: 'mmHg',
//         value: null,
//       }])
//       assertArrayIncludes(findings, [{
//         snomed_concept_id: 1153637007,
//         units: 'cm',
//         value: null,
//       }])
//       assertArrayIncludes(findings, [{
//         snomed_concept_id: 86290005,
//         units: 'bpm',
//         value: null,
//       }])
//       assertArrayIncludes(findings, [{
//         snomed_concept_id: 405176005,
//         units: 'mg/dL',
//         value: null,
//       }])
//       assertArrayIncludes(findings, [{
//         snomed_concept_id: 8499008,
//         units: 'bpm',
//         value: null,
//       }])
//       assertArrayIncludes(findings, [{
//         snomed_concept_id: 271650006,
//         units: 'mmHg',
//         value: null,
//       }])
//       assertArrayIncludes(findings, [{
//         snomed_concept_id: 386725007,
//         units: '°C',
//         value: null,
//       }])
//       assertArrayIncludes(findings, [{
//         snomed_concept_id: 363808001,
//         units: 'kg',
//         value: null,
//       }])
//     })

//     it('404s on a GET for a patient with no open encounter', async () => {
//       const patient = await patients.insert(db, { name: 'Test Patient' })
//       const { fetch } = await addTestEmployeeWithSession(db, {
//         profession: 'nurse', specialty: 'primary care', registration_status: 'approved',
//       })

//       const response = await fetch(
//         `${route}/app/patients/${patient.id}/encounters/open/vitals?expectedTestError=1`,
//       )

//       assertEquals(response.status, 404)
//       assertEquals(await response.text(), 'No open visit with this patient')
//     })

//     it('can save vitals on POST', async () => {
//       const { health_worker, fetch } = await addTestEmployeeWithSession(
//         db,
//         {
//           profession: 'nurse', specialty: 'primary care', registration_status: 'approved',
//         },
//       )
//       const encounter = await patient_encounters
//         .insertReturningSeekingTreatmentWithEmployeeForTest(
//           db,
//           '00000000-0000-0000-0000-000000000001',
//           {
//             patient_name: 'Test Patient',
//             employment_id: health_worker.employee_id,
//           },
//         )

//       const body = new FormData()
//       const finding_id = generateUUID()
//       body.append(
//         `findings.${finding_id}.snomed_concept_id`,
//         VITALS_SNOMED_CODE.height,
//       )
//       body.append(`findings.${finding_id}.units`, VITALS_UNITS.height)
//       body.append(`findings.${finding_id}.value`, '123')

//       const response = await fetch(
//         `${route}/app/patients/${encounter.patient.id}/encounters/${encounter.id}/vitals/measurements`,
//         {
//           method: 'POST',
//           body,
//           redirect: 'manual',
//         },
//       )

//       console.log(await response.text())

//       assertEquals(
//         response.headers.get('location'),
//         `${route}/app/patients/${encounter.patient.id}/encounters/${encounter.id}/vitals/evaluations`,
//       )

//       const all_vitals_snomed_codes = Object.values(VITALS_SNOMED_CODE).filter(
//         (code) => code !== '---',
//       )

//       const vitals = await patient_measurements.getMostRecent(db, {
//         patient_id: encounter.patient.id,
//         snomed_concept_ids: all_vitals_snomed_codes,
//       })
//       assertEquals(vitals, [
//         {
//           finding_type: 'manual',
//           snomed_concept_id: VITALS_SNOMED_CODE.height,
//           value_display: '123 cm',
//           patient_encounter_id: encounter.patient_encounter_id,
//           finding_id,
//           created_at: vitals[0].created_at,
//           provider: {
//             patient_encounter_employee_id: encounter.employee.id,
//             employee_id: health_worker.employee_id,
//             organization: {
//               id: '00000000-0000-0000-0000-000000000001',
//               name: 'VHA Test Clinic South Africa',
//             },
//             health_worker_id: health_worker.id,
//             avatar_url: health_worker.avatar_url,
//             name: health_worker.name,
//             profession: 'nurse',
//           },
//           evaluations: [],
//         },
//       ])

//       {
//         const response = await fetch(
//           `${route}/app/patients/${encounter.patient.id}/encounters/${encounter.id}/vitals/measurements`,
//         )

//         if (!response.ok) throw new Error(await response.text())
//         const page_contents =await response.text()

//         const $ = cheerio.load(page_contents)

//         const form_values = getFormValues($)
//         assert(isObjectLike(form_values))
//         const findings = Object.values(form_values.findings || {})

//         assertArrayIncludes(findings, [{
//           snomed_concept_id: 103228002,
//           units: '%',
//           value: null,
//         }])
//         assertArrayIncludes(findings, [{
//           snomed_concept_id: 271649006,
//           units: 'mmHg',
//           value: null,
//         }])
//         assertArrayIncludes(findings, [{
//           snomed_concept_id: 1153637007,
//           units: 'cm',
//           value: null,
//         }])
//         assertArrayIncludes(findings, [{
//           snomed_concept_id: 86290005,
//           units: 'bpm',
//           value: null,
//         }])
//         assertArrayIncludes(findings, [{
//           snomed_concept_id: 405176005,
//           units: 'mg/dL',
//           value: null,
//         }])
//         assertArrayIncludes(findings, [{
//           snomed_concept_id: 8499008,
//           units: 'bpm',
//           value: null,
//         }])
//         assertArrayIncludes(findings, [{
//           snomed_concept_id: 271650006,
//           units: 'mmHg',
//           value: null,
//         }])
//         assertArrayIncludes(findings, [{
//           snomed_concept_id: 386725007,
//           units: '°C',
//           value: null,
//         }])
//         assertArrayIncludes(findings, [{
//           snomed_concept_id: 363808001,
//           units: 'kg',
//           value: null,
//         }])
//       }
//     })
//   },
// )

// import { describe, it } from 'std/testing/bdd.ts'
// import { assert } from 'std/assert/assert.ts'
// import {
//   addTestEmployeeWithSession,
//   getFormValues,
//   route,
// } from '../../../utilities.ts'
// import * as cheerio from 'cheerio'
// import { assertEquals } from 'std/assert/assert_equals.ts'
// import { patients } from '../../../../../db/models/patients.ts'
// import db from '../../../../../db/db.ts'
// import generateUUID from '../../../../../util/uuid.ts'

// describe(
//   '/app/organizations/[organization_id]/waiting_room/add',
//   { sanitizeResources: false, sanitizeOps: false },
//   () => {
//     itParallel('renders a page on GET', async () => {
//       const { fetch } = await addTestEmployeeWithSession(db, {
//         profession: 'nurse',
//         specialty: 'Primary care',
//
//       })

//       const test_patient =await patients.insert(db, {
//         name: 'Test Patient',
//       })

//       const response = await fetch(
//         `${route}/app/organizations/00000000-0000-1000-8000-000000000001/waiting_room/add?patient_id=${test_patient.id}`,
//         {},
//       )

//       assert(response.ok, 'should have returned ok')
//       const page_contents =await response.text()

//       const $ = cheerio.load(page_contents)

//       const form_values = getFormValues($)
//       assertEquals(form_values, {
//         notes: null,
//         patient_id: test_patient.id,
//         patient_name: test_patient.name,
//         reason: 'seeking treatment',
//       })
//     })

//     itParallel('creates a patient encounter on POST', async () => {
//       const test_patient =await patients.insert(db, {
//         name: 'Test Patient',
//       })
//       const { fetch } = await addTestEmployeeWithSession(db, {
//         profession: 'nurse',
//         specialty: 'Primary care',
//
//       })

//       const body = new FormData()
//       body.set('patient_id', test_patient.id)
//       body.set('reason', 'seeking treatment')
//       body.set('notes', 'Test notes')
//       body.set('patient_name', 'Test Patient')
//       body.set('provider_id', 'next_available')
//       body.set('provider_name', 'Next Available')
//       body.set('waiting_room', 'true')

//       const response = await fetch(
//         `${route}/app/organizations/00000000-0000-1000-8000-000000000001/waiting_room/add`,
//         {
//           method: 'POST',
//           body,
//         },
//       )

//       if (!response.ok) {
//         throw new Error(await response.text())
//       }

//       // Assert that the patient encounter is created and added to the waiting room
//       const patient_encounter =await db
//         .selectFrom('patient_encounters')
//         .where('patient_id', '=', test_patient.id)
//         .selectAll()
//         .executeTakeFirstOrThrow()

//       const waiting_room = await db
//         .selectFrom('waiting_room')
//         .selectAll()
//         .where('patient_encounter_id', '=', patient_encounter.id)
//         .executeTakeFirstOrThrow()

//       assertEquals(patient_encounter.appointment_id, null)
//       assertEquals(patient_encounter.closed_at, null)
//       assertEquals(patient_encounter.notes, 'Test notes')
//       assertEquals(patient_encounter.patient_id, test_patient.id)
//       assertEquals(patient_encounter.reason, 'seeking treatment')

//       assertEquals(
//         waiting_room.organization_id,
//         '00000000-0000-1000-8000-000000000001',
//       )
//       assertEquals(waiting_room.patient_encounter_id, patient_encounter.id)
//     })

//     it.skip('can create a patient encounter for a new patient on POST', async () => {
//       const { fetch } = await addTestEmployeeWithSession(db, {
//         profession: 'nurse',
//         specialty: 'Primary care',
//
//       })

//       const patient_name = generateUUID()
//       const body = new FormData()
//       body.set('notes', 'Test notes')
//       body.set('patient_name', patient_name)
//       body.set('provider_id', 'next_available')
//       body.set('provider_name', 'Next Available')
//       body.set('reason', 'seeking treatment')

//       const response = await fetch(
//         `${route}/app/organizations/00000000-0000-1000-8000-000000000001/waiting_room/add`,
//         {
//           method: 'POST',
//           body,
//         },
//       )

//       if (!response.ok) {
//         throw new Error(await response.text())
//       }

//       // Assert that the patient encounter is created and added to the waiting room
//       const patient_encounter =await db
//         .selectFrom('patient_encounters')
//         .where(
//           'patient_id',
//           '=',
//           db.selectFrom('patients').select('id').where(
//             'name',
//             '=',
//             patient_name,
//           ),
//         )
//         .selectAll()
//         .executeTakeFirstOrThrow()

//       const waiting_room = await db
//         .selectFrom('waiting_room')
//         .where('patient_encounter_id', '=', patient_encounter.id)
//         .selectAll()
//         .executeTakeFirstOrThrow()

//       assertEquals(patient_encounter.appointment_id, null)
//       assertEquals(patient_encounter.closed_at, null)
//       assertEquals(patient_encounter.notes, 'Test notes')
//       assertEquals(patient_encounter.reason, 'seeking treatment')

//       assertEquals(
//         waiting_room.organization_id,
//         '00000000-0000-1000-8000-000000000001',
//       )
//       assertEquals(waiting_room.patient_encounter_id, patient_encounter.id)

//       const { name } = await db.selectFrom('patients').select(['name']).where(
//         'id',
//         '=',
//         patient_encounter.patient_id,
//       ).executeTakeFirstOrThrow()
//       assertEquals(name, patient_name)
//     })
//   },
// )

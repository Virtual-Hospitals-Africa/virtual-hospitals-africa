import { describe } from 'std/testing/bdd.ts'
// import { assert } from 'std/assert/assert.ts'
// import { assertEquals } from 'std/assert/assert_equals.ts'
// import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import * as prescriptions from '../../db/models/prescriptions.ts'
import * as patient_encounters from '../../db/models/patient_encounters.ts'
import * as patient_conditions from '../../db/models/patient_conditions.ts'
import * as patients from '../../db/models/patients.ts'
import { addTestHealthWorker, itUsesTrxAnd } from '../web/utilities.ts'

describe('db/models/prescriptions.ts', { sanitizeResources: false }, () => {
  describe('insert', () => {
    itUsesTrxAnd(
      'makes a prescription for a given prescriber and patient with 1 or more medications',
      async (trx) => {
        const healthWorker = await addTestHealthWorker(trx, {
          scenario: 'nurse',
        })
        const patient = await patients.insert(trx, { name: 'Billy Bob' })
        const encounter = await patient_encounters.upsert(
          trx,
          '00000000-0000-0000-0000-000000000001',
          {
            patient_id: patient.id,
            reason: 'seeking treatment',
            notes: null,
            provider_ids: [healthWorker.employee_id!],
          },
        )

        // const
        await patient_conditions.upsertPreExisting(trx, patient.id, [
          {
            id: 'c_4373',
            start_date: '2022-01-01',
            medications: [],
          },
        ])

        const condition = await trx.selectFrom('patient_conditions')
          .selectAll()
          .where('patient_id', '=', patient.id)
          .executeTakeFirstOrThrow()

        const tablet = await trx
          .selectFrom('manufactured_medications')
          .innerJoin(
            'medications',
            'manufactured_medications.medication_id',
            'medications.id',
          )
          .innerJoin('drugs', 'medications.drug_id', 'drugs.id')
          .select([
            'manufactured_medications.id',
            'manufactured_medications.medication_id',
            'manufactured_medications.strength_numerators',
            'drugs.generic_name',
            'routes',
          ])
          .where(
            'form',
            '=',
            'TABLET',
          )
          .orderBy('drugs.generic_name desc')
          .executeTakeFirstOrThrow()

        await prescriptions.createtPrescriptions(trx, {
          prescriber_id: encounter.providers[0].encounter_provider_id,
          patient_id: patient.id,
          prescribing: [
            {
              condition_id: condition.condition_id,
              start_date: '2020-01-01',
              medications: [
                {
                  manufactured_medication_id: tablet.id,
                  medication_id: null,
                  dosage: 1,
                  strength: tablet.strength_numerators[0],
                  intake_frequency: 'qw',
                  route: tablet.routes[0],
                },
              ],
            },
          ],
        })

        // assertEquals(
        //   result,
        //   {
        //     id: healthWorker.employee_id!,
        //   },
        // )
      },
    )
  })
})

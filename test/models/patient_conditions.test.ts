import { beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { resetInTest } from '../../db/reset.ts'
import * as patients from '../../db/models/patients.ts'
import * as patient_conditions from '../../db/models/patient_conditions.ts'

describe(
  'db/models/patient_conditions.ts',
  { sanitizeResources: false },
  () => {
    beforeEach(resetInTest)

    describe('upsertPreExisting', () => {
      it('upserts pre-existing conditions (those without an end_date) where the manufacturer is known', async () => {
        const patient = await patients.upsert(db, { name: 'Billy Bob' })

        const tablet = await db
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
          ])
          .where(
            'form',
            '=',
            'TABLET; ORAL',
          ).executeTakeFirstOrThrow()

        await patient_conditions.upsertPreExisting(db, patient.id, [
          {
            key_id: 'c_22401',
            start_date: '2020-01-01',
            medications: [
              {
                manufactured_medication_id: tablet.id,
                medication_id: null,
                dosage: 1,
                strength: tablet.strength_numerators[0],
                intake_frequency: 'qw',
              },
            ],
          },
        ])
        const preExistingConditions = await patient_conditions
          .getPreExistingConditions(db, {
            patient_id: patient.id,
          })
        assertEquals(preExistingConditions.length, 1)
        const [preExistingCondition] = preExistingConditions
        assertEquals(preExistingCondition.comorbidities, [])
        assertEquals(preExistingCondition.key_id, 'c_22401')
        assertEquals(preExistingCondition.primary_name, 'Filtering bleb failed')
        assertEquals(preExistingCondition.start_date, '2020-01-01')
        assertEquals(preExistingCondition.medications.length, 1)
        assertEquals(preExistingCondition.medications[0].dosage, 1)
        assertEquals(
          preExistingCondition.medications[0].generic_name,
          tablet.generic_name,
        )
        assertEquals(
          preExistingCondition.medications[0].intake_frequency,
          'qw',
        )
        assertEquals(
          preExistingCondition.medications[0].manufactured_medication_id,
          tablet.id,
        )
        assertEquals(
          preExistingCondition.medications[0].medication_id,
          tablet.medication_id,
        )
        // TODO remove the Number cast
        // https://github.com/kysely-org/kysely/issues/802
        assertEquals(
          preExistingCondition.medications[0].strength,
          Number(tablet.strength_numerators[0]),
        )
      })

      it('upserts pre-existing conditions (those without an end_date) where the manufacturer is unknown', async () => {
        const patient = await patients.upsert(db, { name: 'Billy Bob' })

        const tablet = await db
          .selectFrom('medications')
          .innerJoin('drugs', 'medications.drug_id', 'drugs.id')
          .select([
            'medications.id',
            'medications.strength_numerators',
            'drugs.generic_name',
          ])
          .where(
            'form',
            '=',
            'TABLET; ORAL',
          ).executeTakeFirstOrThrow()

        await patient_conditions.upsertPreExisting(db, patient.id, [
          {
            key_id: 'c_22401',
            start_date: '2020-01-01',
            medications: [
              {
                manufactured_medication_id: null,
                medication_id: tablet.id,
                dosage: 1,
                strength: tablet.strength_numerators[0],
                intake_frequency: 'qw',
              },
            ],
          },
        ])
        const preExistingConditions = await patient_conditions
          .getPreExistingConditions(db, {
            patient_id: patient.id,
          })
        assertEquals(preExistingConditions.length, 1)
        const [preExistingCondition] = preExistingConditions
        assertEquals(preExistingCondition.comorbidities, [])
        assertEquals(preExistingCondition.key_id, 'c_22401')
        assertEquals(preExistingCondition.primary_name, 'Filtering bleb failed')
        assertEquals(preExistingCondition.start_date, '2020-01-01')
        assertEquals(preExistingCondition.medications.length, 1)
        assertEquals(preExistingCondition.medications[0].dosage, 1)
        assertEquals(
          preExistingCondition.medications[0].generic_name,
          tablet.generic_name,
        )
        assertEquals(
          preExistingCondition.medications[0].intake_frequency,
          'qw',
        )
        assertEquals(
          preExistingCondition.medications[0].manufactured_medication_id,
          null,
        )
        assertEquals(
          preExistingCondition.medications[0].medication_id,
          tablet.id,
        )
        // TODO remove the Number cast
        // https://github.com/kysely-org/kysely/issues/802
        assertEquals(
          preExistingCondition.medications[0].strength,
          Number(tablet.strength_numerators[0]),
        )
      })
    })
  },
)

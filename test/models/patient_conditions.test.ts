import { sql } from 'kysely'
import { describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as patients from '../../db/models/patients.ts'
import * as patient_conditions from '../../db/models/patient_conditions.ts'
import { assertRejects } from 'std/assert/assert_rejects.ts'
import { StatusError } from '../../util/assertOr.ts'
import { itUsesTrxAnd } from '../web/utilities.ts'

describe(
  'db/models/patient_conditions.ts',
  { sanitizeResources: false },
  () => {
    describe('upsertPreExisting', () => {
      itUsesTrxAnd(
        'upserts pre-existing conditions (those without an end_date) where the manufacturer is known',
        async (trx) => {
          const patient = await patients.upsert(trx, { name: 'Billy Bob' })

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

          await patient_conditions.upsertPreExisting(trx, patient.id, [
            {
              id: 'c_22401',
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
          ])
          const preExistingConditions = await patient_conditions
            .getPreExistingConditions(trx, {
              patient_id: patient.id,
            })
          assertEquals(preExistingConditions.length, 1)
          const [preExistingCondition] = preExistingConditions
          assertEquals(preExistingCondition.comorbidities, [])
          assertEquals(preExistingCondition.id, 'c_22401')
          assertEquals(preExistingCondition.name, 'Filtering bleb failed')
          assertEquals(preExistingCondition.start_date, '2020-01-01')
          assertEquals(preExistingCondition.medications.length, 1)
          assertEquals(preExistingCondition.medications[0].dosage, 1)
          assertEquals(
            preExistingCondition.medications[0].name,
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
          assertEquals(
            preExistingCondition.medications[0].start_date,
            '2020-01-01',
          )
          assertEquals(
            preExistingCondition.medications[0].end_date,
            null,
          )

          const patient_medication = await trx
            .selectFrom('patient_condition_medications')
            .where('manufactured_medication_id', '=', tablet.id)
            .select(sql`TO_JSON(schedules)`.as('schedules'))
            .executeTakeFirstOrThrow()

          assertEquals(patient_medication.schedules, [{
            dosage: 1,
            duration: 1,
            duration_unit: 'indefinitely',
            frequency: 'qw',
          }])
        },
      )

      itUsesTrxAnd(
        'upserts pre-existing conditions (those without an end_date) where the manufacturer is unknown',
        async (trx) => {
          const patient = await patients.upsert(trx, { name: 'Billy Bob' })

          const tablet = await trx
            .selectFrom('medications')
            .innerJoin('drugs', 'medications.drug_id', 'drugs.id')
            .select([
              'medications.id',
              'medications.strength_numerators',
              'drugs.generic_name',
              'routes',
            ])
            .where(
              'form',
              '=',
              'TABLET',
            ).executeTakeFirstOrThrow()

          await patient_conditions.upsertPreExisting(trx, patient.id, [
            {
              id: 'c_22401',
              start_date: '2020-01-01',
              medications: [
                {
                  manufactured_medication_id: null,
                  medication_id: tablet.id,
                  dosage: 1,
                  strength: tablet.strength_numerators[0],
                  intake_frequency: 'qw',
                  route: tablet.routes[0],
                },
              ],
            },
          ])
          const preExistingConditions = await patient_conditions
            .getPreExistingConditions(trx, {
              patient_id: patient.id,
            })
          assertEquals(preExistingConditions.length, 1)
          const [preExistingCondition] = preExistingConditions
          assertEquals(preExistingCondition.comorbidities, [])
          assertEquals(preExistingCondition.id, 'c_22401')
          assertEquals(preExistingCondition.name, 'Filtering bleb failed')
          assertEquals(preExistingCondition.start_date, '2020-01-01')
          assertEquals(preExistingCondition.medications.length, 1)
          assertEquals(preExistingCondition.medications[0].dosage, 1)
          assertEquals(
            preExistingCondition.medications[0].name,
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
          assertEquals(
            preExistingCondition.medications[0].start_date,
            '2020-01-01',
          )
          assertEquals(
            preExistingCondition.medications[0].end_date,
            null,
          )

          const patient_medication = await trx
            .selectFrom('patient_condition_medications')
            .where('medication_id', '=', tablet.id)
            .select(sql`TO_JSON(schedules)`.as('schedules'))
            .executeTakeFirstOrThrow()

          assertEquals(patient_medication.schedules, [{
            dosage: 1,
            duration: 1,
            duration_unit: 'indefinitely',
            frequency: 'qw',
          }])
        },
      )

      itUsesTrxAnd(
        'converts a medication with an end_date into schedule with a duration in days',
        async (trx) => {
          const patient = await patients.upsert(trx, { name: 'Billy Bob' })

          const tablet = await trx
            .selectFrom('medications')
            .innerJoin('drugs', 'medications.drug_id', 'drugs.id')
            .select([
              'medications.id',
              'medications.strength_numerators',
              'drugs.generic_name',
              'routes',
            ])
            .where(
              'form',
              '=',
              'TABLET',
            ).executeTakeFirstOrThrow()

          await patient_conditions.upsertPreExisting(trx, patient.id, [
            {
              id: 'c_22401',
              start_date: '2020-01-01',
              medications: [
                {
                  manufactured_medication_id: null,
                  medication_id: tablet.id,
                  dosage: 1,
                  strength: tablet.strength_numerators[0],
                  intake_frequency: 'qw',
                  start_date: '2021-01-01',
                  end_date: '2021-01-16',
                  route: tablet.routes[0],
                },
              ],
            },
          ])
          const preExistingConditions = await patient_conditions
            .getPreExistingConditions(trx, {
              patient_id: patient.id,
            })
          assertEquals(preExistingConditions.length, 1)
          const [preExistingCondition] = preExistingConditions
          assertEquals(preExistingCondition.comorbidities, [])
          assertEquals(preExistingCondition.id, 'c_22401')
          assertEquals(preExistingCondition.name, 'Filtering bleb failed')
          assertEquals(preExistingCondition.start_date, '2020-01-01')
          assertEquals(preExistingCondition.medications.length, 1)
          assertEquals(preExistingCondition.medications[0].dosage, 1)
          assertEquals(
            preExistingCondition.medications[0].name,
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
          assertEquals(
            preExistingCondition.medications[0].start_date,
            '2021-01-01',
          )
          assertEquals(
            preExistingCondition.medications[0].end_date,
            '2021-01-16',
          )

          const patient_medication = await trx
            .selectFrom('patient_condition_medications')
            .innerJoin(
              'patient_conditions',
              'patient_conditions.id',
              'patient_condition_medications.patient_condition_id',
            )
            .where('medication_id', '=', tablet.id)
            .where('patient_id', '=', patient.id)
            .select(sql`TO_JSON(schedules)`.as('schedules'))
            .executeTakeFirstOrThrow()

          assertEquals(patient_medication.schedules, [{
            dosage: 1,
            duration: 15,
            duration_unit: 'days',
            frequency: 'qw',
          }])
        },
      )

      itUsesTrxAnd('handles comorbidities', async (trx) => {
        const patient = await patients.upsert(trx, { name: 'Billy Bob' })

        await patient_conditions.upsertPreExisting(trx, patient.id, [
          {
            id: 'c_22401',
            start_date: '2020-01-01',
            comorbidities: [{ id: 'c_10846' }],
          },
        ])
        const preExistingConditions = await patient_conditions
          .getPreExistingConditions(trx, {
            patient_id: patient.id,
          })
        assertEquals(preExistingConditions.length, 1)
        const [preExistingCondition] = preExistingConditions
        assertEquals(preExistingCondition.id, 'c_22401')
        assertEquals(preExistingCondition.name, 'Filtering bleb failed')
        assertEquals(preExistingCondition.start_date, '2020-01-01')
        assertEquals(preExistingCondition.comorbidities.length, 1)
        assertEquals(preExistingCondition.comorbidities[0], {
          id: 'c_10846',
          name: 'Histiocytosis - malignant',
          start_date: '2020-01-01',
          patient_condition_id:
            preExistingCondition.comorbidities[0].patient_condition_id,
        })
      })

      itUsesTrxAnd(
        'removes comorbidities if not present by their id, while editing others',
        async (trx) => {
          const patient = await patients.upsert(trx, { name: 'Billy Bob' })

          await patient_conditions.upsertPreExisting(trx, patient.id, [
            {
              id: 'c_22401',
              start_date: '2020-01-01',
              comorbidities: [{ id: 'c_8251' }, { id: 'c_10846' }],
            },
          ])
          const [preExistingConditionBefore] = await patient_conditions
            .getPreExistingConditions(trx, {
              patient_id: patient.id,
            })

          await patient_conditions.upsertPreExisting(trx, patient.id, [{
            ...preExistingConditionBefore,
            comorbidities: [{
              id: 'c_8251',
              start_date: '2020-01-03',
            }],
          }])

          const [preExistingConditionAfter] = await patient_conditions
            .getPreExistingConditions(trx, {
              patient_id: patient.id,
            })

          assertEquals(preExistingConditionAfter, {
            ...preExistingConditionBefore,
            patient_condition_id:
              preExistingConditionAfter.patient_condition_id,
            comorbidities: [
              {
                id: 'c_8251',
                name: 'Esophageal dysphagia',
                start_date: '2020-01-03',
                patient_condition_id: preExistingConditionAfter.comorbidities[0]
                  .patient_condition_id,
              },
            ],
          })
        },
      )

      itUsesTrxAnd(
        'removes medications if not present by their id, while editing others',
        async (trx) => {
          const patient = await patients.upsert(trx, { name: 'Billy Bob' })

          const injection = await trx
            .selectFrom('medications')
            .innerJoin('drugs', 'medications.drug_id', 'drugs.id')
            .select([
              'medications.id',
              'medications.strength_numerators',
              'drugs.generic_name',
              'routes',
            ])
            .where(
              'form',
              '=',
              'INJECTABLE',
            ).orderBy('drugs.generic_name desc').executeTakeFirstOrThrow()

          const capsule = await trx
            .selectFrom('medications')
            .innerJoin('drugs', 'medications.drug_id', 'drugs.id')
            .select([
              'medications.id',
              'medications.strength_numerators',
              'drugs.generic_name',
              'routes',
            ])
            .where(
              'form',
              '=',
              'CAPSULE',
            ).orderBy('drugs.generic_name desc')
            .executeTakeFirstOrThrow()

          await patient_conditions.upsertPreExisting(trx, patient.id, [
            {
              id: 'c_22401',
              start_date: '2020-01-01',
              medications: [
                {
                  medication_id: injection.id,
                  manufactured_medication_id: null,
                  strength: injection.strength_numerators[0],
                  dosage: 1,
                  intake_frequency: 'qw',
                  route: injection.routes[0],
                },
                {
                  medication_id: capsule.id,
                  manufactured_medication_id: null,
                  strength: capsule.strength_numerators[0],
                  dosage: 2,
                  intake_frequency: 'qw',
                  route: capsule.routes[0],
                },
              ],
            },
          ])
          const [preExistingConditionBefore] = await patient_conditions
            .getPreExistingConditions(trx, {
              patient_id: patient.id,
            })

          const medication_to_keep = preExistingConditionBefore.medications
            .find(
              (m) => m.medication_id === capsule.id,
            )!
          await patient_conditions.upsertPreExisting(trx, patient.id, [{
            ...preExistingConditionBefore,
            medications: [{
              medication_id: capsule.id,
              manufactured_medication_id: null,
              intake_frequency: 'qid',
              dosage: 3,
              strength: capsule.strength_numerators[0],
              route: capsule.routes[0],
            }],
          }])

          const [preExistingConditionAfter] = await patient_conditions
            .getPreExistingConditions(trx, {
              patient_id: patient.id,
            })

          assertEquals(preExistingConditionAfter.medications.length, 1)
          const [medicationAfter] = preExistingConditionAfter.medications

          assertEquals(medicationAfter.dosage, 3)
          assertEquals(medicationAfter.end_date, null)
          assertEquals(
            medicationAfter.name,
            medication_to_keep.name,
          )
          assertEquals(medicationAfter.intake_frequency, 'qid')
          assertEquals(medicationAfter.manufactured_medication_id, null)
          assertEquals(medicationAfter.id, medication_to_keep.id)
          assertEquals(medicationAfter.id, medication_to_keep.id)
          assertEquals(
            medicationAfter.medication_id,
            medication_to_keep.medication_id,
          )
          assertEquals(medicationAfter.start_date, '2020-01-01')
          assertEquals(medicationAfter.strength, medication_to_keep.strength)
        },
      )
    })

    describe('upsertPastMedical', () => {
      itUsesTrxAnd(
        'upserts past conditions, those with an end_date',
        async (trx) => {
          const patient = await patients.upsert(trx, { name: 'Billy Bob' })

          await patient_conditions.upsertPastMedical(trx, patient.id, [
            {
              id: 'c_22401',
              start_date: '2020-01-01',
              end_date: '2021-03-01',
            },
          ])
          const past_conditions = await patient_conditions
            .getPastMedicalConditions(trx, {
              patient_id: patient.id,
            })
          assertEquals(past_conditions.length, 1)
          const [preExistingCondition] = past_conditions
          assertEquals(preExistingCondition.id, 'c_22401')
          assertEquals(preExistingCondition.name, 'Filtering bleb failed')
          assertEquals(preExistingCondition.start_date, '2020-01-01')
          assertEquals(preExistingCondition.end_date, '2021-03-01')
        },
      )
      itUsesTrxAnd('400s if no end date is provided', async (trx) => {
        const patient = await patients.upsert(trx, { name: 'Billy Bob' })

        await assertRejects(
          () =>
            patient_conditions.upsertPastMedical(trx, patient.id, [
              {
                id: 'c_22401',
                start_date: '2020-01-01',
                end_date: 'not a date',
              },
            ]),
          StatusError,
          'Condition end_date must be an ISO Date',
        )
      })
    })
  },
)

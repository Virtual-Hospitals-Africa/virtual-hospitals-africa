import { sql } from 'kysely'
import { afterAll, describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as patient_conditions from '../../db/models/patient_conditions.ts'
import * as patient_encounters from '../../db/models/patient_encounters.ts'
import * as examinations from '../../db/models/examinations.ts'
import { assertRejects } from 'std/assert/assert_rejects.ts'
import { StatusError } from '../../util/assertOr.ts'
import { addTestHealthWorker, itUsesTrxAnd } from '../web/utilities.ts'
import permutations from '../../util/permutations.ts'
import db from '../../db/db.ts'

describe(
  'db/models/patient_conditions.ts',
  () => {
    afterAll(() => db.destroy())
    describe('upsertPreExisting', () => {
      itUsesTrxAnd(
        'upserts pre-existing conditions (those without an end_date) where the manufacturer is known',
        async (trx) => {
          const nurse = await addTestHealthWorker(trx, { scenario: 'nurse' })
          const encounter = await patient_encounters.insert(
            trx,
            nurse.organization_id,
            {
              patient_name: 'Billy Bob',
              reason: 'seeking treatment',
              provider_ids: [nurse.employee_id!],
            },
          )

          const patient_examination = await examinations.upsert(
            trx,
            {
              patient_id: encounter.patient_id,
              encounter_id: encounter.id,
              encounter_provider_id:
                encounter.providers[0].encounter_provider_id,
              examination_identifier: 'history_pre_existing_conditions',
              completed: true,
            },
          )

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

          await patient_conditions.upsertPreExisting(trx, {
            patient_id: encounter.patient_id,
            patient_examination_id: patient_examination.id,
            patient_conditions: [
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
            ],
          })
          const preExistingConditions = await patient_conditions
            .getPreExistingConditions(trx, {
              patient_id: encounter.patient_id,
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
          const nurse = await addTestHealthWorker(trx, { scenario: 'nurse' })
          const encounter = await patient_encounters.insert(
            trx,
            nurse.organization_id,
            {
              patient_name: 'Billy Bob',
              reason: 'seeking treatment',
              provider_ids: [nurse.employee_id!],
            },
          )

          const patient_examination = await examinations.upsert(
            trx,
            {
              patient_id: encounter.patient_id,
              encounter_id: encounter.id,
              encounter_provider_id:
                encounter.providers[0].encounter_provider_id,
              examination_identifier: 'history_pre_existing_conditions',
              completed: true,
            },
          )

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

          await patient_conditions.upsertPreExisting(trx, {
            patient_id: encounter.patient_id,
            patient_examination_id: patient_examination.id,
            patient_conditions: [
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
            ],
          })
          const preExistingConditions = await patient_conditions
            .getPreExistingConditions(trx, {
              patient_id: encounter.patient_id,
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
          const nurse = await addTestHealthWorker(trx, { scenario: 'nurse' })
          const encounter = await patient_encounters.insert(
            trx,
            nurse.organization_id,
            {
              patient_name: 'Billy Bob',
              reason: 'seeking treatment',
              provider_ids: [nurse.employee_id!],
            },
          )

          const patient_examination = await examinations.upsert(
            trx,
            {
              patient_id: encounter.patient_id,
              encounter_id: encounter.id,
              encounter_provider_id:
                encounter.providers[0].encounter_provider_id,
              examination_identifier: 'history_pre_existing_conditions',
              completed: true,
            },
          )

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

          await patient_conditions.upsertPreExisting(trx, {
            patient_id: encounter.patient_id,
            patient_examination_id: patient_examination.id,
            patient_conditions: [
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
            ],
          })
          const preExistingConditions = await patient_conditions
            .getPreExistingConditions(trx, {
              patient_id: encounter.patient_id,
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
            .where('patient_id', '=', encounter.patient_id)
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
        const nurse = await addTestHealthWorker(trx, { scenario: 'nurse' })
        const encounter = await patient_encounters.insert(
          trx,
          nurse.organization_id,
          {
            patient_name: 'Billy Bob',
            reason: 'seeking treatment',
            provider_ids: [nurse.employee_id!],
          },
        )

        const patient_examination = await examinations.upsert(
          trx,
          {
            patient_id: encounter.patient_id,
            encounter_id: encounter.id,
            encounter_provider_id: encounter.providers[0].encounter_provider_id,
            examination_identifier: 'history_pre_existing_conditions',
            completed: true,
          },
        )

        await patient_conditions.upsertPreExisting(trx, {
          patient_id: encounter.patient_id,
          patient_examination_id: patient_examination.id,
          patient_conditions: [
            {
              id: 'c_22401',
              start_date: '2020-01-01',
              comorbidities: [{ id: 'c_10846' }],
            },
          ],
        })
        const preExistingConditions = await patient_conditions
          .getPreExistingConditions(trx, {
            patient_id: encounter.patient_id,
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
          const nurse = await addTestHealthWorker(trx, { scenario: 'nurse' })
          const encounter = await patient_encounters.insert(
            trx,
            nurse.organization_id,
            {
              patient_name: 'Billy Bob',
              reason: 'seeking treatment',
              provider_ids: [nurse.employee_id!],
            },
          )

          const patient_examination = await examinations.upsert(
            trx,
            {
              patient_id: encounter.patient_id,
              encounter_id: encounter.id,
              encounter_provider_id:
                encounter.providers[0].encounter_provider_id,
              examination_identifier: 'history_pre_existing_conditions',
              completed: true,
            },
          )

          await patient_conditions.upsertPreExisting(trx, {
            patient_id: encounter.patient_id,
            patient_examination_id: patient_examination.id,
            patient_conditions: [
              {
                id: 'c_22401',
                start_date: '2020-01-01',
                comorbidities: [{ id: 'c_8251' }, { id: 'c_10846' }],
              },
            ],
          })
          const [preExistingConditionBefore] = await patient_conditions
            .getPreExistingConditions(trx, {
              patient_id: encounter.patient_id,
            })

          await patient_conditions.upsertPreExisting(trx, {
            patient_id: encounter.patient_id,
            patient_examination_id: patient_examination.id,
            patient_conditions: [{
              ...preExistingConditionBefore,
              comorbidities: [{
                id: 'c_8251',
                start_date: '2020-01-03',
              }],
            }],
          })

          const [preExistingConditionAfter] = await patient_conditions
            .getPreExistingConditions(trx, {
              patient_id: encounter.patient_id,
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
          const nurse = await addTestHealthWorker(trx, { scenario: 'nurse' })
          const encounter = await patient_encounters.insert(
            trx,
            nurse.organization_id,
            {
              patient_name: 'Billy Bob',
              reason: 'seeking treatment',
              provider_ids: [nurse.employee_id!],
            },
          )

          const patient_examination = await examinations.upsert(
            trx,
            {
              patient_id: encounter.patient_id,
              encounter_id: encounter.id,
              encounter_provider_id:
                encounter.providers[0].encounter_provider_id,
              examination_identifier: 'history_pre_existing_conditions',
              completed: true,
            },
          )

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

          await patient_conditions.upsertPreExisting(trx, {
            patient_id: encounter.patient_id,
            patient_examination_id: patient_examination.id,
            patient_conditions: [
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
            ],
          })
          const [preExistingConditionBefore] = await patient_conditions
            .getPreExistingConditions(trx, {
              patient_id: encounter.patient_id,
            })

          const medication_to_keep = preExistingConditionBefore.medications
            .find(
              (m) => m.medication_id === capsule.id,
            )!
          await patient_conditions.upsertPreExisting(trx, {
            patient_id: encounter.patient_id,
            patient_examination_id: patient_examination.id,
            patient_conditions: [{
              ...preExistingConditionBefore,
              medications: [{
                medication_id: capsule.id,
                manufactured_medication_id: null,
                intake_frequency: 'qid',
                dosage: 3,
                strength: capsule.strength_numerators[0],
                route: capsule.routes[0],
              }],
            }],
          })

          const [preExistingConditionAfter] = await patient_conditions
            .getPreExistingConditions(trx, {
              patient_id: encounter.patient_id,
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

      itUsesTrxAnd(
        'removes pre-existing conditions no longer present',
        async (trx) => {
          const nurse = await addTestHealthWorker(trx, { scenario: 'nurse' })
          const encounter = await patient_encounters.insert(
            trx,
            nurse.organization_id,
            {
              patient_name: 'Billy Bob',
              reason: 'seeking treatment',
              provider_ids: [nurse.employee_id!],
            },
          )

          const patient_examination = await examinations.upsert(
            trx,
            {
              patient_id: encounter.patient_id,
              encounter_id: encounter.id,
              encounter_provider_id:
                encounter.providers[0].encounter_provider_id,
              examination_identifier: 'history_pre_existing_conditions',
              completed: true,
            },
          )

          await patient_conditions.upsertPreExisting(trx, {
            patient_id: encounter.patient_id,
            patient_examination_id: patient_examination.id,
            patient_conditions: [
              {
                id: 'c_22401',
                start_date: '2020-01-01',
              },
            ],
          })

          await patient_conditions.upsertPreExisting(trx, {
            patient_id: encounter.patient_id,
            patient_examination_id: patient_examination.id,
            patient_conditions: [
              {
                id: 'c_8815',
                start_date: '2020-01-01',
              },
            ],
          })

          const preExistingConditions = await patient_conditions
            .getPreExistingConditions(trx, {
              patient_id: encounter.patient_id,
            })
          assertEquals(preExistingConditions.length, 1)
          assertEquals(preExistingConditions[0].id, 'c_8815')
        },
      )

      itUsesTrxAnd(
        '400s if the condition is a procedure or surgery',
        async (trx) => {
          const nurse = await addTestHealthWorker(trx, { scenario: 'nurse' })
          const encounter = await patient_encounters.insert(
            trx,
            nurse.organization_id,
            {
              patient_name: 'Billy Bob',
              reason: 'seeking treatment',
              provider_ids: [nurse.employee_id!],
            },
          )

          const patient_examination = await examinations.upsert(
            trx,
            {
              patient_id: encounter.patient_id,
              encounter_id: encounter.id,
              encounter_provider_id:
                encounter.providers[0].encounter_provider_id,
              examination_identifier: 'history_pre_existing_conditions',
              completed: true,
            },
          )

          await assertRejects(
            () =>
              patient_conditions.upsertPreExisting(trx, {
                patient_id: encounter.patient_id,
                patient_examination_id: patient_examination.id,
                patient_conditions: [
                  {
                    id: 'c_4145',
                    start_date: '2020-01-01',
                  },
                ],
              }),
            StatusError,
            'Pre-Existing Condition cannot be a surgery or procedure',
          )
        },
      )
    })

    describe('upsertPastMedical', () => {
      itUsesTrxAnd(
        'upserts past conditions, those with an end_date',
        async (trx) => {
          const nurse = await addTestHealthWorker(trx, { scenario: 'nurse' })
          const encounter = await patient_encounters.insert(
            trx,
            nurse.organization_id,
            {
              patient_name: 'Billy Bob',
              reason: 'seeking treatment',
              provider_ids: [nurse.employee_id!],
            },
          )

          const patient_examination = await examinations.upsert(
            trx,
            {
              patient_id: encounter.patient_id,
              encounter_id: encounter.id,
              encounter_provider_id:
                encounter.providers[0].encounter_provider_id,
              examination_identifier: 'history_pre_existing_conditions',
              completed: true,
            },
          )

          await patient_conditions.upsertPastMedical(trx, {
            patient_id: encounter.patient_id,
            patient_examination_id: patient_examination.id,
            patient_conditions: [
              {
                id: 'c_22401',
                start_date: '2020-01-01',
                end_date: '2021-03-01',
              },
            ],
          })
          const past_conditions = await patient_conditions
            .getPastMedicalConditions(trx, {
              patient_id: encounter.patient_id,
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
        const nurse = await addTestHealthWorker(trx, { scenario: 'nurse' })
        const encounter = await patient_encounters.insert(
          trx,
          nurse.organization_id,
          {
            patient_name: 'Billy Bob',
            reason: 'seeking treatment',
            provider_ids: [nurse.employee_id!],
          },
        )

        const patient_examination = await examinations.upsert(
          trx,
          {
            patient_id: encounter.patient_id,
            encounter_id: encounter.id,
            encounter_provider_id: encounter.providers[0].encounter_provider_id,
            examination_identifier: 'history_pre_existing_conditions',
            completed: true,
          },
        )

        await assertRejects(
          () =>
            patient_conditions.upsertPastMedical(trx, {
              patient_id: encounter.patient_id,
              patient_examination_id: patient_examination.id,
              patient_conditions: [
                {
                  id: 'c_22401',
                  start_date: '2020-01-01',
                  end_date: 'not a date',
                },
              ],
            }),
          StatusError,
          'Condition end_date must be an ISO Date',
        )
      })
    })

    describe('upsertMajorSurgeries', () => {
      itUsesTrxAnd(
        'upserts major surgery, those condition with is_procedure = true',
        async (trx) => {
          const nurse = await addTestHealthWorker(trx, { scenario: 'nurse' })
          const encounter = await patient_encounters.insert(
            trx,
            nurse.organization_id,
            {
              patient_name: 'Billy Bob',
              reason: 'seeking treatment',
              provider_ids: [nurse.employee_id!],
            },
          )

          const patient_examination = await examinations.upsert(
            trx,
            {
              patient_id: encounter.patient_id,
              encounter_id: encounter.id,
              encounter_provider_id:
                encounter.providers[0].encounter_provider_id,
              examination_identifier: 'history_pre_existing_conditions',
              completed: true,
            },
          )

          await patient_conditions.upsertMajorSurgeries(trx, {
            patient_id: encounter.patient_id,
            patient_examination_id: patient_examination.id,
            major_surgeries: [
              { id: 'c_4145', start_date: '2020-02-01' },
            ],
          })

          const major_surgeries = await patient_conditions.getMajorSurgeries(
            trx,
            {
              patient_id: encounter.patient_id,
            },
          )
          assertEquals(major_surgeries.length, 1)
          const [major_surgery] = major_surgeries
          assertEquals(major_surgery.id, 'c_4145')
          assertEquals(major_surgery.name, 'Breast surgery')
          assertEquals(major_surgery.start_date, '2020-02-01')
        },
      )

      itUsesTrxAnd('400s if the condition is not a procedure', async (trx) => {
        const nurse = await addTestHealthWorker(trx, { scenario: 'nurse' })
        const encounter = await patient_encounters.insert(
          trx,
          nurse.organization_id,
          {
            patient_name: 'Billy Bob',
            reason: 'seeking treatment',
            provider_ids: [nurse.employee_id!],
          },
        )

        const patient_examination = await examinations.upsert(
          trx,
          {
            patient_id: encounter.patient_id,
            encounter_id: encounter.id,
            encounter_provider_id: encounter.providers[0].encounter_provider_id,
            examination_identifier: 'history_pre_existing_conditions',
            completed: true,
          },
        )

        await assertRejects(
          () =>
            patient_conditions.upsertMajorSurgeries(trx, {
              patient_id: encounter.patient_id,
              patient_examination_id: patient_examination.id,
              major_surgeries: [
                {
                  id: 'c_22401',
                  start_date: '2020-01-01',
                },
              ],
            }),
          StatusError,
          'Condition is not a major surgery',
        )
      })

      itUsesTrxAnd(
        'allows 2 surgeries if the dates are distinct',
        async (trx) => {
          const nurse = await addTestHealthWorker(trx, { scenario: 'nurse' })
          const encounter = await patient_encounters.insert(
            trx,
            nurse.organization_id,
            {
              patient_name: 'Billy Bob',
              reason: 'seeking treatment',
              provider_ids: [nurse.employee_id!],
            },
          )

          const patient_examination = await examinations.upsert(
            trx,
            {
              patient_id: encounter.patient_id,
              encounter_id: encounter.id,
              encounter_provider_id:
                encounter.providers[0].encounter_provider_id,
              examination_identifier: 'history_pre_existing_conditions',
              completed: true,
            },
          )

          await patient_conditions.upsertMajorSurgeries(trx, {
            patient_id: encounter.patient_id,
            patient_examination_id: patient_examination.id,
            major_surgeries: [
              { id: 'c_4145', start_date: '2020-02-01' },
              { id: 'c_4145', start_date: '2020-03-01' },
            ],
          })

          const major_surgeries = await patient_conditions.getMajorSurgeries(
            trx,
            {
              patient_id: encounter.patient_id,
            },
          )
          assertEquals(major_surgeries.length, 2)
        },
      )

      itUsesTrxAnd('400s if 2 surgeries have the same date', async (trx) => {
        const nurse = await addTestHealthWorker(trx, { scenario: 'nurse' })
        const encounter = await patient_encounters.insert(
          trx,
          nurse.organization_id,
          {
            patient_name: 'Billy Bob',
            reason: 'seeking treatment',
            provider_ids: [nurse.employee_id!],
          },
        )

        const patient_examination = await examinations.upsert(
          trx,
          {
            patient_id: encounter.patient_id,
            encounter_id: encounter.id,
            encounter_provider_id: encounter.providers[0].encounter_provider_id,
            examination_identifier: 'history_pre_existing_conditions',
            completed: true,
          },
        )

        const error = await assertRejects(
          () =>
            patient_conditions.upsertMajorSurgeries(trx, {
              patient_id: encounter.patient_id,
              patient_examination_id: patient_examination.id,
              major_surgeries: [
                { id: 'c_4145', start_date: '2020-02-01' },
                { id: 'c_4145', start_date: '2020-02-01' },
              ],
            }),
          StatusError,
        )

        assertEquals(error.status, 400)
      })
    })

    describe('onboarding', () => {
      itUsesTrxAnd(
        'can add conditions and surgeries in any order, with all being preserved',
        async (trx) => {
          // let patient: { id: string }

          const insertions = [
            ({ encounter, patient_examination }: {
              encounter: Awaited<ReturnType<typeof patient_encounters.insert>>
              patient_examination: {
                patient_id: string
                created_at: Date
                id: string
                updated_at: Date
                encounter_provider_id: string
                encounter_id: string
                completed: boolean
                examination_identifier: string
                ordered: boolean
                skipped: boolean
              }
            }) =>
              patient_conditions.upsertPreExisting(trx, {
                patient_id: encounter.patient_id,
                patient_examination_id: patient_examination.id,
                patient_conditions: [
                  {
                    id: 'c_22401',
                    start_date: '2020-01-01',
                  },
                ],
              }),
            ({ encounter, patient_examination }: {
              encounter: Awaited<ReturnType<typeof patient_encounters.insert>>
              patient_examination: {
                patient_id: string
                created_at: Date
                id: string
                updated_at: Date
                encounter_provider_id: string
                encounter_id: string
                completed: boolean
                examination_identifier: string
                ordered: boolean
                skipped: boolean
              }
            }) =>
              patient_conditions.upsertPastMedical(trx, {
                patient_id: encounter.patient_id,
                patient_examination_id: patient_examination.id,
                patient_conditions: [
                  {
                    id: 'c_8815',
                    start_date: '2020-01-01',
                    end_date: '2021-03-01',
                  },
                ],
              }),
            ({ encounter, patient_examination }: {
              encounter: Awaited<ReturnType<typeof patient_encounters.insert>>
              patient_examination: {
                patient_id: string
                created_at: Date
                id: string
                updated_at: Date
                encounter_provider_id: string
                encounter_id: string
                completed: boolean
                examination_identifier: string
                ordered: boolean
                skipped: boolean
              }
            }) =>
              patient_conditions.upsertMajorSurgeries(trx, {
                patient_id: encounter.patient_id,
                patient_examination_id: patient_examination.id,
                major_surgeries: [
                  { id: 'c_4145', start_date: '2020-02-01' },
                ],
              }),
          ]

          const insertionOrders = permutations(insertions)
          for (const insertionOrder of insertionOrders) {
            const nurse = await addTestHealthWorker(trx, { scenario: 'nurse' })
            const encounter = await patient_encounters.insert(
              trx,
              nurse.organization_id,
              {
                patient_name: 'Billy Bob',
                reason: 'seeking treatment',
                provider_ids: [nurse.employee_id!],
              },
            )

            const patient_examination = await examinations.upsert(
              trx,
              {
                patient_id: encounter.patient_id,
                encounter_id: encounter.id,
                encounter_provider_id:
                  encounter.providers[0].encounter_provider_id,
                examination_identifier: 'history_pre_existing_conditions',
                completed: true,
              },
            )
            for (const insertion of insertionOrder) {
              await insertion({ encounter, patient_examination })
            }
            const pre_existing_conditions = await patient_conditions
              .getPreExistingConditions(
                trx,
                {
                  patient_id: encounter.patient_id,
                },
              )
            const past_conditions = await patient_conditions
              .getPastMedicalConditions(
                trx,
                {
                  patient_id: encounter.patient_id,
                },
              )
            const major_surgeries = await patient_conditions.getMajorSurgeries(
              trx,
              {
                patient_id: encounter.patient_id,
              },
            )

            assertEquals(pre_existing_conditions.length, 1)
            assertEquals(past_conditions.length, 1)
            assertEquals(major_surgeries.length, 1)
            assertEquals(pre_existing_conditions[0].id, 'c_22401')
            assertEquals(past_conditions[0].id, 'c_8815')
            assertEquals(major_surgeries[0].id, 'c_4145')
          }
        },
      )
    })
  },
)

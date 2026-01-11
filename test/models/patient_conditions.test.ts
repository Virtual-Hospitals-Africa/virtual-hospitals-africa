import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { sql } from 'kysely'
import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { patient_conditions } from '../../db/models/patient_conditions.ts'
import { examinations } from '../../db/models/examinations.ts'
import { assertRejects } from 'std/assert/assert_rejects.ts'
import { StatusError } from '../../util/assertOr.ts'
import permutations from '../../util/permutations.ts'
import db from '../../db/db.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from '../_helpers/workflows.ts'
import randomDemographics from '../../mocks/randomDemographics.ts'
import { asTextArray } from '../../db/helpers.ts'
import { createTestOrganization } from 'test/_helpers/organizations.ts'
import { itUsesTrxAnd } from 'test/_helpers/transaction.ts'

describeParallel(
  'db/models/patient_conditions.ts',
  () => {
    afterAll(() => db.destroy())
    describe.skip('upsertPreExisting', () => {
      it(
        'upserts pre-existing conditions (those without an end_date) where the manufacturer is known',
        async () => {
          const clinic = await createTestOrganization(db)
          const nurse = await addTestEmployee(db, {
            profession: 'nurse',
            registration_status: 'not started',
            organization_id: clinic.id,
          })
          const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
            db,
            nurse.organization_id,
            {
              patient_demographics: randomDemographics(),
              employment_id: nurse.employee_id,
            },
          )

          const patient_examination = await examinations.upsert(
            db,
            {
              patient_id: encounter.patient.id,
              patient_encounter_id: encounter.patient_encounter_id,
              patient_encounter_employee_id: encounter.employee.patient_encounter_employee_id,
              examination_identifier: 'history_pre_existing_conditions',
              completed: true,
            },
          )

          const tablet = await db
            .selectFrom('manufactured_medications')
            .innerJoin(
              'medications',
              'manufactured_medications.medication_id',
              'medications.id',
            )
            .innerJoin('drugs', 'medications.drug_id', 'drugs.id')
            .select((eb) => [
              'routes',
              'drugs.generic_name',
              'manufactured_medications.id',
              'manufactured_medications.medication_id',
              asTextArray(eb, 'manufactured_medications.strength_numerators')
                .as('strength_numerators'),
            ])
            .where(
              'form',
              '=',
              'TABLET',
            )
            .orderBy('drugs.generic_name', 'desc')
            .executeTakeFirstOrThrow()

          await patient_conditions.upsertPreExisting(db, {
            patient_id: encounter.patient.id,
            patient_examination_id: patient_examination.id,
            patient_conditions: [
              {
                id: 'c_22401',
                start_date: '2020-01-01',
                medications: [
                  {
                    manufactured_medication_id: tablet.id,
                    medication_id: null,
                    dosage: '1',
                    strength: tablet.strength_numerators[0],
                    registration_frequency: 'qw',
                    route: tablet.routes[0],
                  },
                ],
              },
            ],
          })
          const pre_existing_conditions = await patient_conditions
            .getPreExistingConditions(db, {
              patient_id: encounter.patient.id,
            })
          assertEquals(pre_existing_conditions.length, 1)
          const [preExistingCondition] = pre_existing_conditions
          assertEquals(preExistingCondition.comorbidities, [])
          assertEquals(preExistingCondition.id, 'c_22401')
          assertEquals(preExistingCondition.name, 'Filtering bleb failed')
          assertEquals(preExistingCondition.start_date, '2020-01-01')
          assertEquals(preExistingCondition.medications.length, 1)
          assertEquals(preExistingCondition.medications[0].dosage, '1')
          assertEquals(
            preExistingCondition.medications[0].name,
            tablet.generic_name,
          )
          assertEquals(
            preExistingCondition.medications[0].registration_frequency,
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
          assertEquals(
            preExistingCondition.medications[0].strength,
            tablet.strength_numerators[0],
          )
          assertEquals(
            preExistingCondition.medications[0].start_date,
            '2020-01-01',
          )
          assertEquals(
            preExistingCondition.medications[0].end_date,
            null,
          )

          const patient_medication = await db
            .selectFrom('patient_condition_medications')
            .where('manufactured_medication_id', '=', tablet.id)
            .select(sql`TO_JSON(schedules)`.as('schedules'))
            .executeTakeFirstOrThrow()

          assertEquals(patient_medication.schedules, [{
            dosage: '1',
            duration: 1,
            duration_unit: 'indefinitely',
            frequency: 'qw',
          }])
        },
      )

      it(
        'upserts pre-existing conditions (those without an end_date) where the manufacturer is unknown',
        async () => {
          const clinic = await createTestOrganization(db)
          const nurse = await addTestEmployee(db, {
            profession: 'nurse',
            registration_status: 'not started',
            organization_id: clinic.id,
          })
          const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
            db,
            nurse.organization_id,
            {
              patient_demographics: randomDemographics(),
              employment_id: nurse.employee_id,
            },
          )

          const patient_examination = await examinations.upsert(
            db,
            {
              patient_id: encounter.patient.id,
              patient_encounter_id: encounter.patient_encounter_id,
              patient_encounter_employee_id: encounter.employee.patient_encounter_employee_id,
              examination_identifier: 'history_pre_existing_conditions',
              completed: true,
            },
          )

          const tablet = await db
            .selectFrom('medications')
            .innerJoin('drugs', 'medications.drug_id', 'drugs.id')
            .select((eb) => [
              'routes',
              'drugs.generic_name',
              'medications.id',
              'medications.strength_numerators',
              asTextArray(eb, 'medications.strength_numerators')
                .as('strength_numerators'),
            ])
            .where(
              'form',
              '=',
              'TABLET',
            ).executeTakeFirstOrThrow()

          await patient_conditions.upsertPreExisting(db, {
            patient_id: encounter.patient.id,
            patient_examination_id: patient_examination.id,
            patient_conditions: [
              {
                id: 'c_22401',
                start_date: '2020-01-01',
                medications: [
                  {
                    manufactured_medication_id: null,
                    medication_id: tablet.id,
                    dosage: '1',
                    strength: tablet.strength_numerators[0],
                    registration_frequency: 'qw',
                    route: tablet.routes[0],
                  },
                ],
              },
            ],
          })
          const pre_existing_conditions = await patient_conditions
            .getPreExistingConditions(db, {
              patient_id: encounter.patient.id,
            })
          assertEquals(pre_existing_conditions.length, 1)
          const [preExistingCondition] = pre_existing_conditions
          assertEquals(preExistingCondition.comorbidities, [])
          assertEquals(preExistingCondition.id, 'c_22401')
          assertEquals(preExistingCondition.name, 'Filtering bleb failed')
          assertEquals(preExistingCondition.start_date, '2020-01-01')
          assertEquals(preExistingCondition.medications.length, 1)
          assertEquals(preExistingCondition.medications[0].dosage, '1')
          assertEquals(
            preExistingCondition.medications[0].name,
            tablet.generic_name,
          )
          assertEquals(
            preExistingCondition.medications[0].registration_frequency,
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
          assertEquals(
            preExistingCondition.medications[0].strength,
            tablet.strength_numerators[0],
          )
          assertEquals(
            preExistingCondition.medications[0].start_date,
            '2020-01-01',
          )
          assertEquals(
            preExistingCondition.medications[0].end_date,
            null,
          )

          const patient_medication = await db
            .selectFrom('patient_condition_medications')
            .where('medication_id', '=', tablet.id)
            .select(sql`TO_JSON(schedules)`.as('schedules'))
            .executeTakeFirstOrThrow()

          assertEquals(patient_medication.schedules, [{
            dosage: '1',
            duration: 1,
            duration_unit: 'indefinitely',
            frequency: 'qw',
          }])
        },
      )

      it(
        'converts a medication with an end_date into schedule with a duration in days',
        async () => {
          const clinic = await createTestOrganization(db)
          const nurse = await addTestEmployee(db, {
            profession: 'nurse',
            registration_status: 'not started',
            organization_id: clinic.id,
          })
          const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
            db,
            nurse.organization_id,
            {
              patient_demographics: randomDemographics(),
              employment_id: nurse.employee_id,
            },
          )

          const patient_examination = await examinations.upsert(
            db,
            {
              patient_id: encounter.patient.id,
              patient_encounter_id: encounter.patient_encounter_id,
              patient_encounter_employee_id: encounter.employee.patient_encounter_employee_id,
              examination_identifier: 'history_pre_existing_conditions',
              completed: true,
            },
          )

          const tablet = await db
            .selectFrom('medications')
            .innerJoin('drugs', 'medications.drug_id', 'drugs.id')
            .select((eb) => [
              'routes',
              'drugs.generic_name',
              'medications.id',
              asTextArray(eb, 'medications.strength_numerators')
                .as('strength_numerators'),
            ])
            .where(
              'form',
              '=',
              'TABLET',
            ).executeTakeFirstOrThrow()

          await patient_conditions.upsertPreExisting(db, {
            patient_id: encounter.patient.id,
            patient_examination_id: patient_examination.id,
            patient_conditions: [
              {
                id: 'c_22401',
                start_date: '2020-01-01',
                medications: [
                  {
                    manufactured_medication_id: null,
                    medication_id: tablet.id,
                    dosage: '1',
                    strength: tablet.strength_numerators[0],
                    registration_frequency: 'qw',
                    start_date: '2021-01-01',
                    end_date: '2021-01-16',
                    route: tablet.routes[0],
                  },
                ],
              },
            ],
          })
          const pre_existing_conditions = await patient_conditions
            .getPreExistingConditions(db, {
              patient_id: encounter.patient.id,
            })
          assertEquals(pre_existing_conditions.length, 1)
          const [preExistingCondition] = pre_existing_conditions
          assertEquals(preExistingCondition.comorbidities, [])
          assertEquals(preExistingCondition.id, 'c_22401')
          assertEquals(preExistingCondition.name, 'Filtering bleb failed')
          assertEquals(preExistingCondition.start_date, '2020-01-01')
          assertEquals(preExistingCondition.medications.length, 1)
          assertEquals(preExistingCondition.medications[0].dosage, '1')
          assertEquals(
            preExistingCondition.medications[0].name,
            tablet.generic_name,
          )
          assertEquals(
            preExistingCondition.medications[0].registration_frequency,
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
          assertEquals(
            preExistingCondition.medications[0].strength,
            tablet.strength_numerators[0],
          )
          assertEquals(
            preExistingCondition.medications[0].start_date,
            '2021-01-01',
          )
          assertEquals(
            preExistingCondition.medications[0].end_date,
            '2021-01-16',
          )

          const patient_medication = await db
            .selectFrom('patient_condition_medications')
            .innerJoin(
              'patient_conditions',
              'patient_conditions.id',
              'patient_condition_medications.patient_condition_id',
            )
            .where('medication_id', '=', tablet.id)
            .where('patient_id', '=', encounter.patient.id)
            .select(sql`TO_JSON(schedules)`.as('schedules'))
            .executeTakeFirstOrThrow()

          assertEquals(patient_medication.schedules, [{
            dosage: '1',
            duration: 15,
            duration_unit: 'days',
            frequency: 'qw',
          }])
        },
      )

      itParallel.skip('handles comorbidities', async () => {
        const clinic = await createTestOrganization(db)
        const nurse = await addTestEmployee(db, {
          profession: 'nurse',
          registration_status: 'not started',
          organization_id: clinic.id,
        })
        const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
          db,
          nurse.organization_id,
          {
            patient_demographics: randomDemographics(),
            employment_id: nurse.employee_id,
          },
        )

        const patient_examination = await examinations.upsert(
          db,
          {
            patient_id: encounter.patient.id,
            patient_encounter_id: encounter.patient_encounter_id,
            patient_encounter_employee_id: encounter.employee.patient_encounter_employee_id,
            examination_identifier: 'history_pre_existing_conditions',
            completed: true,
          },
        )

        await patient_conditions.upsertPreExisting(db, {
          patient_id: encounter.patient.id,
          patient_examination_id: patient_examination.id,
          patient_conditions: [
            {
              id: 'c_22401',
              start_date: '2020-01-01',
              comorbidities: [{ id: 'c_10846' }],
            },
          ],
        })
        const pre_existing_conditions = await patient_conditions
          .getPreExistingConditions(db, {
            patient_id: encounter.patient.id,
          })
        assertEquals(pre_existing_conditions.length, 1)
        const [preExistingCondition] = pre_existing_conditions
        assertEquals(preExistingCondition.id, 'c_22401')
        assertEquals(preExistingCondition.name, 'Filtering bleb failed')
        assertEquals(preExistingCondition.start_date, '2020-01-01')
        assertEquals(preExistingCondition.comorbidities.length, 1)
        assertEquals(preExistingCondition.comorbidities[0], {
          id: 'c_10846',
          name: 'Histiocytosis - malignant',
          start_date: '2020-01-01',
          patient_condition_id: preExistingCondition.comorbidities[0].patient_condition_id,
        })
      })

      it(
        'removes comorbidities if not present by their id, while editing others',
        async () => {
          const clinic = await createTestOrganization(db)
          const nurse = await addTestEmployee(db, {
            profession: 'nurse',
            registration_status: 'not started',
            organization_id: clinic.id,
          })
          const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
            db,
            nurse.organization_id,
            {
              patient_demographics: randomDemographics(),
              employment_id: nurse.employee_id,
            },
          )

          const patient_examination = await examinations.upsert(
            db,
            {
              patient_id: encounter.patient.id,
              patient_encounter_id: encounter.patient_encounter_id,
              patient_encounter_employee_id: encounter.employee.patient_encounter_employee_id,
              examination_identifier: 'history_pre_existing_conditions',
              completed: true,
            },
          )

          await patient_conditions.upsertPreExisting(db, {
            patient_id: encounter.patient.id,
            patient_examination_id: patient_examination.id,
            patient_conditions: [
              {
                id: 'c_22401',
                start_date: '2020-01-01',
                comorbidities: [{ id: 'c_8251' }, { id: 'c_10846' }],
              },
            ],
          })
          const [pre_existing_condition_before] = await patient_conditions
            .getPreExistingConditions(db, {
              patient_id: encounter.patient.id,
            })

          await patient_conditions.upsertPreExisting(db, {
            patient_id: encounter.patient.id,
            patient_examination_id: patient_examination.id,
            patient_conditions: [{
              ...pre_existing_condition_before,
              comorbidities: [{
                id: 'c_8251',
                start_date: '2020-01-03',
              }],
            }],
          })

          const [preExistingConditionAfter] = await patient_conditions
            .getPreExistingConditions(db, {
              patient_id: encounter.patient.id,
            })

          assertEquals(preExistingConditionAfter, {
            ...pre_existing_condition_before,
            patient_condition_id: preExistingConditionAfter.patient_condition_id,
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

      // TODO: this is doing something quite funky. Obviously this will need to be refactored when porting to append-only logic
      itUsesTrxAnd(
        'removes medications if not present by their id, while editing others',
        async () => {
          const clinic = await createTestOrganization(db)
          const nurse = await addTestEmployee(db, {
            profession: 'nurse',
            registration_status: 'not started',
            organization_id: clinic.id,
          })
          const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
            db,
            nurse.organization_id,
            {
              patient_demographics: randomDemographics(),
              employment_id: nurse.employee_id,
            },
          )

          const patient_examination = await examinations.upsert(
            db,
            {
              patient_id: encounter.patient.id,
              patient_encounter_id: encounter.patient_encounter_id,
              patient_encounter_employee_id: encounter.employee.patient_encounter_employee_id,
              examination_identifier: 'history_pre_existing_conditions',
              completed: true,
            },
          )

          const injection = await db
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
            ).orderBy('drugs.generic_name', 'desc').executeTakeFirstOrThrow()

          const capsule = await db
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
            ).orderBy('drugs.generic_name', 'desc')
            .executeTakeFirstOrThrow()

          await patient_conditions.upsertPreExisting(db, {
            patient_id: encounter.patient.id,
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
                    dosage: '1',
                    registration_frequency: 'qw',
                    route: injection.routes[0],
                  },
                  {
                    medication_id: capsule.id,
                    manufactured_medication_id: null,
                    strength: capsule.strength_numerators[0],
                    dosage: '2',
                    registration_frequency: 'qw',
                    route: capsule.routes[0],
                  },
                ],
              },
            ],
          })
          const [pre_existing_condition_before] = await patient_conditions
            .getPreExistingConditions(db, {
              patient_id: encounter.patient.id,
            })

          const medication_to_keep = pre_existing_condition_before.medications
            .find(
              (m) => m.medication_id === capsule.id,
            )!
          await patient_conditions.upsertPreExisting(db, {
            patient_id: encounter.patient.id,
            patient_examination_id: patient_examination.id,
            patient_conditions: [{
              ...pre_existing_condition_before,
              medications: [{
                medication_id: capsule.id,
                manufactured_medication_id: null,
                registration_frequency: 'qid',
                dosage: '3',
                strength: capsule.strength_numerators[0],
                route: capsule.routes[0],
              }],
            }],
          })

          const [preExistingConditionAfter] = await patient_conditions
            .getPreExistingConditions(db, {
              patient_id: encounter.patient.id,
            })

          assertEquals(preExistingConditionAfter.medications.length, 1)
          const [medicationAfter] = preExistingConditionAfter.medications

          assertEquals(medicationAfter.dosage, '3')
          assertEquals(medicationAfter.end_date, null)
          assertEquals(
            medicationAfter.name,
            medication_to_keep.name,
          )
          assertEquals(medicationAfter.registration_frequency, 'qid')
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

      it(
        'removes pre-existing conditions no longer present',
        async () => {
          const clinic = await createTestOrganization(db)
          const nurse = await addTestEmployee(db, {
            profession: 'nurse',
            registration_status: 'not started',
            organization_id: clinic.id,
          })
          const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
            db,
            nurse.organization_id,
            {
              patient_demographics: randomDemographics(),
              employment_id: nurse.employee_id,
            },
          )

          const patient_examination = await examinations.upsert(
            db,
            {
              patient_id: encounter.patient.id,
              patient_encounter_id: encounter.patient_encounter_id,
              patient_encounter_employee_id: encounter.employee.patient_encounter_employee_id,
              examination_identifier: 'history_pre_existing_conditions',
              completed: true,
            },
          )

          await patient_conditions.upsertPreExisting(db, {
            patient_id: encounter.patient.id,
            patient_examination_id: patient_examination.id,
            patient_conditions: [
              {
                id: 'c_22401',
                start_date: '2020-01-01',
              },
            ],
          })

          await patient_conditions.upsertPreExisting(db, {
            patient_id: encounter.patient.id,
            patient_examination_id: patient_examination.id,
            patient_conditions: [
              {
                id: 'c_8815',
                start_date: '2020-01-01',
              },
            ],
          })

          const pre_existing_conditions = await patient_conditions
            .getPreExistingConditions(db, {
              patient_id: encounter.patient.id,
            })
          assertEquals(pre_existing_conditions.length, 1)
          assertEquals(pre_existing_conditions[0].id, 'c_8815')
        },
      )

      it(
        '400s if the condition is a procedure or surgery',
        async () => {
          const clinic = await createTestOrganization(db)
          const nurse = await addTestEmployee(db, {
            profession: 'nurse',
            registration_status: 'not started',
            organization_id: clinic.id,
          })
          const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
            db,
            nurse.organization_id,
            {
              patient_demographics: randomDemographics(),
              employment_id: nurse.employee_id,
            },
          )

          const patient_examination = await examinations.upsert(
            db,
            {
              patient_id: encounter.patient.id,
              patient_encounter_id: encounter.patient_encounter_id,
              patient_encounter_employee_id: encounter.employee.patient_encounter_employee_id,
              examination_identifier: 'history_pre_existing_conditions',
              completed: true,
            },
          )

          await assertRejects(
            () =>
              patient_conditions.upsertPreExisting(db, {
                patient_id: encounter.patient.id,
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

    describeParallel('upsertPastMedical', () => {
      it(
        'upserts past conditions, those with an end_date',
        async () => {
          const clinic = await createTestOrganization(db)
          const nurse = await addTestEmployee(db, {
            profession: 'nurse',
            registration_status: 'not started',
            organization_id: clinic.id,
          })
          const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
            db,
            nurse.organization_id,
            {
              patient_demographics: randomDemographics(),
              employment_id: nurse.employee_id,
            },
          )

          const patient_examination = await examinations.upsert(
            db,
            {
              patient_id: encounter.patient.id,
              patient_encounter_id: encounter.patient_encounter_id,
              patient_encounter_employee_id: encounter.employee.patient_encounter_employee_id,
              examination_identifier: 'history_pre_existing_conditions',
              completed: true,
            },
          )

          await patient_conditions.upsertPastMedical(db, {
            patient_id: encounter.patient.id,
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
            .getPastMedicalConditions(db, {
              patient_id: encounter.patient.id,
            })
          assertEquals(past_conditions.length, 1)
          const [preExistingCondition] = past_conditions
          assertEquals(preExistingCondition.id, 'c_22401')
          assertEquals(preExistingCondition.name, 'Filtering bleb failed')
          assertEquals(preExistingCondition.start_date, '2020-01-01')
          assertEquals(preExistingCondition.end_date, '2021-03-01')
        },
      )
      itParallel('400s if no end date is provided', async () => {
        const clinic = await createTestOrganization(db)
        const nurse = await addTestEmployee(db, {
          profession: 'nurse',
          registration_status: 'not started',
          organization_id: clinic.id,
        })
        const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
          db,
          nurse.organization_id,
          {
            patient_demographics: randomDemographics(),
            employment_id: nurse.employee_id,
          },
        )

        const patient_examination = await examinations.upsert(
          db,
          {
            patient_id: encounter.patient.id,
            patient_encounter_id: encounter.patient_encounter_id,
            patient_encounter_employee_id: encounter.employee.patient_encounter_employee_id,
            examination_identifier: 'history_pre_existing_conditions',
            completed: true,
          },
        )

        await assertRejects(
          () =>
            patient_conditions.upsertPastMedical(db, {
              patient_id: encounter.patient.id,
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

    describeParallel('upsertMajorSurgeries', () => {
      it.skip(
        'upserts major surgery, those condition with is_procedure = true',
        async () => {
          const clinic = await createTestOrganization(db)
          const nurse = await addTestEmployee(db, {
            profession: 'nurse',
            registration_status: 'not started',
            organization_id: clinic.id,
          })
          const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
            db,
            nurse.organization_id,
            {
              patient_demographics: randomDemographics(),
              employment_id: nurse.employee_id,
            },
          )

          const patient_examination = await examinations.upsert(
            db,
            {
              patient_id: encounter.patient.id,
              patient_encounter_id: encounter.patient_encounter_id,
              patient_encounter_employee_id: encounter.employee.patient_encounter_employee_id,
              examination_identifier: 'history_pre_existing_conditions',
              completed: true,
            },
          )

          await patient_conditions.upsertMajorSurgeries(db, {
            patient_id: encounter.patient.id,
            patient_examination_id: patient_examination.id,
            major_surgeries: [
              { id: 'c_4145', start_date: '2020-02-01' },
            ],
          })

          const major_surgeries = await patient_conditions.getMajorSurgeries(
            db,
            {
              patient_id: encounter.patient.id,
            },
          )
          assertEquals(major_surgeries.length, 1)
          const [major_surgery] = major_surgeries
          assertEquals(major_surgery.id, 'c_4145')
          assertEquals(major_surgery.name, 'Breast surgery')
          assertEquals(major_surgery.start_date, '2020-02-01')
        },
      )

      itParallel('400s if the condition is not a procedure', async () => {
        const clinic = await createTestOrganization(db)
        const nurse = await addTestEmployee(db, {
          profession: 'nurse',
          registration_status: 'not started',
          organization_id: clinic.id,
        })
        const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
          db,
          nurse.organization_id,
          {
            patient_demographics: randomDemographics(),
            employment_id: nurse.employee_id,
          },
        )

        const patient_examination = await examinations.upsert(
          db,
          {
            patient_id: encounter.patient.id,
            patient_encounter_id: encounter.patient_encounter_id,
            patient_encounter_employee_id: encounter.employee.patient_encounter_employee_id,
            examination_identifier: 'history_pre_existing_conditions',
            completed: true,
          },
        )

        await assertRejects(
          () =>
            patient_conditions.upsertMajorSurgeries(db, {
              patient_id: encounter.patient.id,
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

      itParallel.skip(
        'allows 2 surgeries if the dates are distinct',
        async () => {
          const clinic = await createTestOrganization(db)
          const nurse = await addTestEmployee(db, {
            profession: 'nurse',
            registration_status: 'not started',
            organization_id: clinic.id,
          })
          const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
            db,
            nurse.organization_id,
            {
              patient_demographics: randomDemographics(),
              employment_id: nurse.employee_id,
            },
          )

          const patient_examination = await examinations.upsert(
            db,
            {
              patient_id: encounter.patient.id,
              patient_encounter_id: encounter.patient_encounter_id,
              patient_encounter_employee_id: encounter.employee.patient_encounter_employee_id,
              examination_identifier: 'history_pre_existing_conditions',
              completed: true,
            },
          )

          await patient_conditions.upsertMajorSurgeries(db, {
            patient_id: encounter.patient.id,
            patient_examination_id: patient_examination.id,
            major_surgeries: [
              { id: 'c_4145', start_date: '2020-02-01' },
              { id: 'c_4145', start_date: '2020-03-01' },
            ],
          })

          const major_surgeries = await patient_conditions.getMajorSurgeries(
            db,
            {
              patient_id: encounter.patient.id,
            },
          )
          assertEquals(major_surgeries.length, 2)
        },
      )

      itParallel('400s if 2 surgeries have the same date', async () => {
        const clinic = await createTestOrganization(db)
        const nurse = await addTestEmployee(db, {
          profession: 'nurse',
          registration_status: 'not started',
          organization_id: clinic.id,
        })
        const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
          db,
          nurse.organization_id,
          {
            patient_demographics: randomDemographics(),
            employment_id: nurse.employee_id,
          },
        )

        const patient_examination = await examinations.upsert(
          db,
          {
            patient_id: encounter.patient.id,
            patient_encounter_id: encounter.patient_encounter_id,
            patient_encounter_employee_id: encounter.employee.patient_encounter_employee_id,
            examination_identifier: 'history_pre_existing_conditions',
            completed: true,
          },
        )

        const error = await assertRejects(
          () =>
            patient_conditions.upsertMajorSurgeries(db, {
              patient_id: encounter.patient.id,
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

    describeParallel('onboarding', () => {
      it.skip(
        'can add conditions and surgeries in any order, with all being preserved',
        async () => {
          // let patient: { id: string }

          const insertions = [
            ({ encounter, patient_examination }: {
              encounter: Awaited<
                ReturnType<
                  typeof insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest
                >
              >
              patient_examination: {
                patient_id: string
                created_at: Date
                id: string
                updated_at: Date
                patient_encounter_employee_id: string
                patient_encounter_id: string
                completed: boolean
                examination_identifier: string
                ordered: boolean
                skipped: boolean
              }
            }) =>
              patient_conditions.upsertPreExisting(db, {
                patient_id: encounter.patient.id,
                patient_examination_id: patient_examination.id,
                patient_conditions: [
                  {
                    id: 'c_22401',
                    start_date: '2020-01-01',
                  },
                ],
              }),
            ({ encounter, patient_examination }: {
              encounter: Awaited<
                ReturnType<
                  typeof insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest
                >
              >
              patient_examination: {
                patient_id: string
                created_at: Date
                id: string
                updated_at: Date
                patient_encounter_employee_id: string
                patient_encounter_id: string
                completed: boolean
                examination_identifier: string
                ordered: boolean
                skipped: boolean
              }
            }) =>
              patient_conditions.upsertPastMedical(db, {
                patient_id: encounter.patient.id,
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
              encounter: Awaited<
                ReturnType<
                  typeof insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest
                >
              >
              patient_examination: {
                patient_id: string
                created_at: Date
                id: string
                updated_at: Date
                patient_encounter_employee_id: string
                patient_encounter_id: string
                completed: boolean
                examination_identifier: string
                ordered: boolean
                skipped: boolean
              }
            }) =>
              patient_conditions.upsertMajorSurgeries(db, {
                patient_id: encounter.patient.id,
                patient_examination_id: patient_examination.id,
                major_surgeries: [
                  { id: 'c_4145', start_date: '2020-02-01' },
                ],
              }),
          ]

          const insertion_orders = permutations(insertions)
          for (const insertion_order of insertion_orders) {
            const clinic = await createTestOrganization(db)
            const nurse = await addTestEmployee(db, {
              profession: 'nurse',
              registration_status: 'not started',
              organization_id: clinic.id,
            })
            const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
              db,
              nurse.organization_id,
              {
                patient_demographics: randomDemographics(),
                employment_id: nurse.employee_id,
              },
            )

            const patient_examination = await examinations.upsert(
              db,
              {
                patient_id: encounter.patient.id,
                patient_encounter_id: encounter.patient_encounter_id,
                patient_encounter_employee_id: encounter.employee.patient_encounter_employee_id,
                examination_identifier: 'history_pre_existing_conditions',
                completed: true,
              },
            )
            for (const insertion of insertion_order) {
              await insertion({ encounter, patient_examination })
            }
            const pre_existing_conditions = await patient_conditions
              .getPreExistingConditions(
                db,
                {
                  patient_id: encounter.patient.id,
                },
              )
            const past_conditions = await patient_conditions
              .getPastMedicalConditions(
                db,
                {
                  patient_id: encounter.patient.id,
                },
              )
            const major_surgeries = await patient_conditions.getMajorSurgeries(
              db,
              {
                patient_id: encounter.patient.id,
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

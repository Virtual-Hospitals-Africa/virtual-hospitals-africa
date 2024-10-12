import { sql } from 'kysely'
import { Address, PatientIntake, TrxOrDb } from '../../types.ts'
import * as patient_occupations from './patient_occupations.ts'
import * as patient_conditions from './patient_conditions.ts'
import * as patient_family from './family.ts'
import { jsonArrayFromColumn, jsonBuildObject } from '../helpers.ts'
import { assertOr404 } from '../../util/assertOr.ts'
import { RenderedPatientAge } from '../../types.ts'
import * as patients from './patients.ts'
import { IntakeStep } from '../../db.d.ts'

export function getById(
  trx: TrxOrDb,
  patient_id: string,
): Promise<PatientIntake> {
  return trx
    .selectFrom('patients')
    .leftJoin('addresses', 'addresses.id', 'patients.address_id')
    .leftJoin(
      'organizations',
      'organizations.id',
      'patients.nearest_organization_id',
    )
    .leftJoin(
      'addresses as organization_address',
      'organizations.address_id',
      'organization_address.id',
    )
    .leftJoin(
      'employment',
      'employment.id',
      'patients.primary_doctor_id',
    )
    .leftJoin(
      'health_workers',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .leftJoin('patient_age', 'patient_age.patient_id', 'patients.id')
    .select((eb) => [
      'patients.id',
      'patients.name',
      'patients.phone_number',
      'patients.location',
      'patients.gender',
      'patients.ethnicity',
      sql<null | string>`TO_CHAR(patients.date_of_birth, 'YYYY-MM-DD')`.as(
        'date_of_birth',
      ),
      'patients.national_id_number',
      sql<
        string | null
      >`patients.gender || ', ' || TO_CHAR(patients.date_of_birth, 'DD/MM/YYYY')`
        .as(
          'description',
        ),
      sql<null | Address>`TO_JSON(addresses)`.as('address'),
      'patients.completed_intake',
      jsonArrayFromColumn(
        'intake_step',
        eb.selectFrom('patient_intake')
          .innerJoin(
            'intake',
            'intake.step',
            'patient_intake.intake_step',
          )
          .whereRef('patient_id', '=', 'patients.id')
          .orderBy(['intake.order desc'])
          .select(['intake_step']),
      ).as('intake_steps_completed'),
      'patients.primary_doctor_id',
      'patients.unregistered_primary_doctor_name',
      sql<
        string | null
      >`CASE WHEN patients.avatar_media_id IS NOT NULL THEN concat('/app/patients/', patients.id::text, '/avatar') ELSE NULL END`
        .as('avatar_url'),
      'patients.nearest_organization_id',
      'organizations.name as nearest_organization_name',
      'organization_address.formatted as nearest_organization_address',
      'health_workers.name as primary_doctor_name',
      sql<RenderedPatientAge>`TO_JSON(patient_age)`.as('age'),
      jsonBuildObject({
        clinical_notes: patients.intake_clinical_notes_href_sql,
      }).as('actions'),
    ])
    .where('patients.id', '=', patient_id)
    .executeTakeFirstOrThrow()
}

export async function getSummaryById(
  trx: TrxOrDb,
  patient_id: string,
) {
  const getting_review = trx
    .selectFrom('patients')
    .leftJoin('addresses', 'addresses.id', 'patients.address_id')
    .leftJoin(
      'organizations',
      'organizations.id',
      'patients.nearest_organization_id',
    )
    .leftJoin(
      'employment',
      'employment.id',
      'patients.primary_doctor_id',
    )
    .leftJoin(
      'health_workers',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .leftJoin('patient_age', 'patient_age.patient_id', 'patients.id')
    .select((eb) => [
      'patients.id',
      eb.ref('patients.name').$notNull().as('name'),
      'patients.phone_number',
      'patients.gender',
      'patients.ethnicity',
      sql<null | string>`TO_CHAR(patients.date_of_birth, 'YYYY-MM-DD')`.as(
        'date_of_birth',
      ),
      'patients.national_id_number',
      sql<
        string | null
      >`patients.gender || ', ' || TO_CHAR(patients.date_of_birth, 'DD/MM/YYYY')`
        .as(
          'description',
        ),
      sql<
        string
      >`'Dr. ' || coalesce(health_workers.name, patients.unregistered_primary_doctor_name)`
        .as('primary_doctor_name'),
      'addresses.formatted as address',
      sql<
        string | null
      >`CASE WHEN patients.avatar_media_id IS NOT NULL THEN concat('/app/patients/', patients.id::text, '/avatar') ELSE NULL END`
        .as('avatar_url'),
      'patients.nearest_organization_id',
      'organizations.name as nearest_organization_name',
      sql<RenderedPatientAge>`TO_JSON(patient_age)`.as('age'),
      jsonBuildObject({
        clinical_notes: patients.intake_clinical_notes_href_sql,
      }).as('actions'),
      jsonArrayFromColumn(
        'intake_step',
        eb.selectFrom('patient_intake')
          .innerJoin(
            'intake',
            'intake.step',
            'patient_intake.intake_step',
          )
          .whereRef('patient_id', '=', 'patients.id')
          .orderBy(['intake.order desc'])
          .select(['intake_step']),
      ).as('intake_steps_completed'),
      'completed_intake',
    ])
    .where('patients.id', '=', patient_id)
    .executeTakeFirst()

  const q = { patient_id }
  const getting_family = patient_family.get(trx, q)
  const getting_occupation = patient_occupations.get(trx, q)
  const getting_pre_existing_conditions = patient_conditions
    .getPreExistingConditionsSummary(trx, q)
  const getting_past_medical_conditions = patient_conditions
    .getPastMedicalConditions(trx, q)
  const getting_major_surgeries = patient_conditions.getMajorSurgeries(trx, q)

  const review = await getting_review
  assertOr404(review)

  return {
    ...review,
    family: await getting_family,
    occupation: await getting_occupation,
    pre_existing_conditions: await getting_pre_existing_conditions,
    past_medical_conditions: await getting_past_medical_conditions,
    major_surgeries: await getting_major_surgeries,
  }
}

export async function updateCompletion(
  trx: TrxOrDb,
  {
    patient_id,
    intake_step_just_completed,
    completed_intake,
  }: {
    patient_id: string
    intake_step_just_completed: IntakeStep
    completed_intake?: boolean
  },
): Promise<void> {
  const upserting_intake_step = trx
    .insertInto('patient_intake')
    .values({
      patient_id: patient_id,
      intake_step: intake_step_just_completed,
    })
    .onConflict((oc) => oc.doNothing())
    .execute()

  const updating_patient = completed_intake && trx.updateTable('patients')
    .where('id', '=', patient_id)
    .set({ completed_intake })
    .execute()

  await Promise.all([upserting_intake_step, updating_patient])
}

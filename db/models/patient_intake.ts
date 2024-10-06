import { sql } from 'kysely'
import { PatientIntake, TrxOrDb } from '../../types.ts'
import { completeIntake } from './patients.ts'
import { name_string_sql } from './human_name.ts'
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
    .selectFrom('Patient')
    .innerJoin('HumanName as PatientName', 
      'PatientName.resourceId', 'Patient.id'
    )
    .leftJoin('Address', 'Address.resourceId', 'Patient.id')
    .leftJoin(
      'Organization',
      'Organization.id',
      'Patient.organizationId',
    )
    .leftJoin(
      'Address as OrganizationAddress',
      'Organization.id',
      'OrganizationAddress.resourceId',
    )
    .leftJoin(
      'employment',
      'employment.id',
      'Patient.primary_doctor_id',
    )
    .leftJoin(
      'health_workers',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .leftJoin('patient_age', 'patient_age.patient_id', 'Patient.id')
    .leftJoin('patient_intake_completed', 'Patient.id', 'patient_intake_completed.patient_id')
    .select((eb) => [
      'Patient.id',
      name_string_sql('PatientName').as('name'),
      'Patient.phone_number',
      'Patient.location',
      'Patient.gender',
      'Patient.ethnicity',
      sql<null | string>`TO_CHAR(Patient.birthDate, 'YYYY-MM-DD')`.as(
        'birthDate',
      ),
      'Patient.national_id_number',
      sql<
        string | null
      >`Patient.gender || ', ' || TO_CHAR(Patient.birthDate, 'DD/MM/YYYY')`
        .as(
          'description',
        ),
      jsonBuildObject({
        address: eb.ref('Address.address'),
        city: eb.ref('Address.city'),
        country: eb.ref('Address.country'),
        postalCode: eb.ref('Address.postalCode'),
        state: eb.ref('Address.state'),
        use: eb.ref('Address.use'),
      }).as('address'),
      eb('patient_intake_completed.patient_id', 'is not', null).as('intake_completed'),
      jsonArrayFromColumn(
        'intake_step',
        eb.selectFrom('patient_intake')
          .innerJoin(
            'intake',
            'intake.step',
            'patient_intake.intake_step',
          )
          .whereRef('patient_id', '=', 'Patient.id')
          .orderBy(['intake.order desc'])
          .select(['intake_step']),
      ).as('intake_steps_completed'),
      'Patient.primary_doctor_id',
      'Patient.unregistered_primary_doctor_name',
      sql<
        string | null
      >`CASE WHEN Patient.avatar_media_id IS NOT NULL THEN concat('/app/patients/', Patient.id::text, '/avatar') ELSE NULL END`
        .as('avatar_url'),
      'Patient.organizationId',
      'Organization.canonicalName as nearest_organization_name',
      'OrganizationAddress.address as nearest_organization_address',
      'health_workers.name as primary_doctor_name',
      sql<RenderedPatientAge>`TO_JSON(patient_age)`.as('age'),
      jsonBuildObject({
        clinical_notes: patients.intake_clinical_notes_href_sql,
      }).as('actions'),
    ])
    .where('Patient.id', '=', patient_id)
    .executeTakeFirstOrThrow()
}

export async function getSummaryById(
  trx: TrxOrDb,
  patient_id: string,
) {
  const getting_review = trx
    .selectFrom('Patient')
    .innerJoin('HumanName', 'HumanName.resourceId', 'Patient.id')
    .leftJoin('Address', 'Address.resourceId', 'Patient.id')
    .leftJoin(
      'Organization',
      'Organization.id',
      'Patient.organizationId',
    )
    .leftJoin(
      'employment',
      'employment.id',
      'Patient.primary_doctor_id',
    )
    .leftJoin(
      'health_workers',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .leftJoin('patient_age', 'patient_age.patient_id', 'Patient.id')
    .leftJoin('patient_intake_completed', 'Patient.id', 'patient_intake_completed.patient_id')
    .select((eb) => [
      'Patient.id',
      name_string_sql('HumanName').as('name'),
      'Patient.phone_number',
      'Patient.gender',
      'Patient.ethnicity',
      sql<null | string>`TO_CHAR(Patient.birthDate, 'YYYY-MM-DD')`.as(
        'birthDate',
      ),
      'Patient.national_id_number',
      sql<
        string | null
      >`Patient.gender || ', ' || TO_CHAR(Patient.birthDate, 'DD/MM/YYYY')`
        .as(
          'description',
        ),
      sql<
        string
      >`'Dr. ' || coalesce(health_workers.name, Patient.unregistered_primary_doctor_name)`
        .as('primary_doctor_name'),
      'Address.address',
      sql<
        string | null
      >`CASE WHEN Patient.avatar_media_id IS NOT NULL THEN concat('/app/patients/', Patient.id::text, '/avatar') ELSE NULL END`
        .as('avatar_url'),
      'Patient.organizationId',
      'Organization.canonicalName as nearest_organization_name',
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
          .whereRef('patient_id', '=', 'Patient.id')
          .orderBy(['intake.order desc'])
          .select(['intake_step']),
      ).as('intake_steps_completed'),
      eb('patient_intake_completed.patient_id', 'is not', null).as('intake_completed'),
    ])
    .where('Patient.id', '=', patient_id)
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
    intake_completed,
    completed_by_employment_id,
  }: {
    patient_id: string
    intake_step_just_completed: IntakeStep
    intake_completed?: boolean
    completed_by_employment_id: string
  },
): Promise<void> {
  const upserting_intake_step = trx
    .insertInto('patient_intake')
    .values({
      patient_id,
      completed_by_employment_id,
      intake_step: intake_step_just_completed,
    })
    .onConflict((oc) => oc.doNothing())
    .execute()

  const completing_intake = intake_completed && completeIntake(trx, {
    patient_id,
    completed_by_employment_id,
  })

  await Promise.all([upserting_intake_step, completing_intake])
}

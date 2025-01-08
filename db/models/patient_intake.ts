import { sql } from 'kysely'
import { Address, PatientIntake, TrxOrDb } from '../../types.ts'
import * as patient_occupations from './patient_occupations.ts'
import * as patient_conditions from './patient_conditions.ts'
import * as patient_family from './family.ts'
import * as patient_allergies from './patient_allergies.ts'
import { jsonBuildObject } from '../helpers.ts'
import { assertOr404 } from '../../util/assertOr.ts'
import { RenderedPatientAge } from '../../types.ts'
import * as patients from './patients.ts'
import { promiseProps } from '../../util/promiseProps.ts'

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
    .select([
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
        view: patients.view_href_sql,
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
      jsonBuildObject({
        name: eb.ref('patients.name').$notNull(),
        phone_number: eb.ref('patients.phone_number'),
        gender: eb.ref('patients.gender'),
        ethnicity: eb.ref('patients.ethnicity'),
        date_of_birth: sql<
          null | string
        >`TO_CHAR(patients.date_of_birth, 'YYYY-MM-DD')`,
        national_id_number: eb.ref('patients.national_id_number'),
        description: sql<
          string | null
        >`patients.gender || ', ' || TO_CHAR(patients.date_of_birth, 'DD/MM/YYYY')`,
      }).as('personal'),
      jsonBuildObject({
        primary_doctor_name: sql<
          string
        >`'Dr. ' || coalesce(health_workers.name, patients.unregistered_primary_doctor_name)`,
        nearest_organization_id: eb.ref('patients.nearest_organization_id'),
        nearest_organization_name: eb.ref('organizations.name'),
      }).as('nearest_health_care'),
      jsonBuildObject({
        street: eb.ref('addresses.street'),
        locality: eb.ref('addresses.locality'),
        administrative_area_level_1: eb.ref(
          'addresses.administrative_area_level_1',
        ),
        administrative_area_level_2: eb.ref(
          'addresses.administrative_area_level_2',
        ),
      }).as('address'),
      sql<
        string | null
      >`CASE WHEN patients.avatar_media_id IS NOT NULL THEN concat('/app/patients/', patients.id::text, '/avatar') ELSE NULL END`
        .as('avatar_url'),
      sql<RenderedPatientAge>`TO_JSON(patient_age)`.as('age'),
      jsonBuildObject({
        view: patients.view_href_sql,
      }).as('actions'),
      'completed_intake',
    ])
    .where('patients.id', '=', patient_id)

  const q = { patient_id }

  // const review = await getting_review
  // assertOr404(review)

  const {
    review,
    family,
    occupation,
    allergies,
    pre_existing_conditions,
    past_medical_conditions,
    major_surgeries,
  } = await promiseProps({
    review: getting_review.executeTakeFirst(),
    family: patient_family.get(trx, q),
    occupation: patient_occupations.get(trx, q),
    allergies: patient_allergies.getWithName(trx, patient_id),
    pre_existing_conditions: patient_conditions.getPreExistingConditionsSummary(
      trx,
      q,
    ),
    past_medical_conditions: patient_conditions.getPastMedicalConditions(
      trx,
      q,
    ),
    major_surgeries: patient_conditions.getMajorSurgeries(trx, q),
  })

  assertOr404(review)

  return {
    ...review,
    family,
    occupation,
    allergies,
    pre_existing_conditions,
    past_medical_conditions,
    major_surgeries,
  }
}

export function completed(
  trx: TrxOrDb,
  {
    patient_id,
  }: {
    patient_id: string
  },
) {
  return trx.updateTable('patients')
    .where('id', '=', patient_id)
    .set({ completed_intake: true })
    .execute()
}

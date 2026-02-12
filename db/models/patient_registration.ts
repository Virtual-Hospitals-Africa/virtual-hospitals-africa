import { sql } from 'kysely'
import { HealthWorkerOrganization, PatientProfileSummary, RenderedOrganization, TrxOrDb } from '../../types.ts'
import { patient_occupations } from './patient_occupations.ts'
import { family as patient_family } from './family.ts'
import { patient_allergies } from './patient_allergies.ts'
import { isoDate, jsonBuildObject } from '../helpers.ts'
import { assertOr404 } from '../../util/assertOr.ts'
import { RenderedPatientAge } from '../../types.ts'
import { promiseProps } from '../../util/promiseProps.ts'
import { description_sql } from './patients.ts'
import { patient_new } from './patient_new.ts'

export const patient_registration = {
  start(
    trx: TrxOrDb,
    organization: RenderedOrganization,
    organization_employment: HealthWorkerOrganization,
  ) {
    return patient_new.create(
      trx,
      { organization, organization_employment, current_workflow: 'registration', next_workflows: [] },
    )
  },
  async getSummaryById(
    trx: TrxOrDb,
    patient_id: string,
  ): Promise<PatientProfileSummary> {
    return trx
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
          first_names: eb.ref('patients.first_names').$notNull(),
          preferred_name: eb.ref('patients.preferred_name'),
          surname: eb.ref('patients.surname'),
          phone_number: eb.ref('patients.phone_number'),
          sex: eb.ref('patients.sex'),
          gender: eb.ref('patients.gender'),
          ethnicity: eb.ref('patients.ethnicity'),
          date_of_birth: isoDate(eb.ref('patients.date_of_birth')),
          national_id_number: eb.ref('patients.national_id_number'),
          preferred_language_code_iso_639_2_b: eb.ref(
            'patients.preferred_language_code_iso_639_2_b',
          ),
          description: description_sql,
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
        sql<RenderedPatientAge>`TO_JSON(patient_age)`.as('age'),
        'completed_registration',
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
      pre_existing_conditions: patient_conditions
        .getPreExistingConditionsSummary(
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
      family_history: family,
      occupation: occupation ?? null,
      allergies: allergies ?? null,
      pre_existing_conditions,
      past_medical_conditions,
      major_surgeries,
    }
  },
  completed(
    trx: TrxOrDb,
    {
      patient_id,
    }: {
      patient_id: string
    },
  ) {
    return trx.updateTable('patients')
      .where('id', '=', patient_id)
      .set({ completed_registration: true })
      .execute()
  },
}

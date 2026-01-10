import { sql } from 'kysely'
import {
  HealthWorkerOrganization,
  RegistrationPatientSummary,
  RenderedOrganization,
  TrxOrDb,
} from '../../types.ts'
import { patient_occupations } from './patient_occupations.ts'
import { patient_conditions } from './patient_conditions.ts'
import { family as patient_family } from './family.ts'
import { patient_allergies } from './patient_allergies.ts'
import {
  isoDate,
  jsonBuildObject,
  literalLocation,
  success_true,
} from '../helpers.ts'
import { assertOr403, assertOr404 } from '../../util/assertOr.ts'
import { RenderedPatientAge } from '../../types.ts'
import { promiseProps } from '../../util/promiseProps.ts'
import generateUUID from '../../util/uuid.ts'
import { assert } from 'std/assert/assert.ts'
import { SERVER_COUNTRY } from './countries.ts'
import { description_sql } from './patients.ts'
import isEmployedInDepartment from '../../shared/isEmployedInDepartment.ts'

export const patient_registration = {
  async start(
    trx: TrxOrDb,
    { id: organization_id, location, reception_id }: RenderedOrganization,
    organization_employment: HealthWorkerOrganization,
  ) {
    assert(location)
    assert(reception_id)
    assertOr403(
      isEmployedInDepartment(organization_employment, 'Reception'),
      'Must work in the reception department to register patients',
    )

    const patient_id = generateUUID()
    const patient_encounter_id = generateUUID()
    const patient_encounter_employee_id = generateUUID()
    const patient_workflow_id = generateUUID()

    const { success } = await trx.with(
      'inserting_patient',
      (qb) =>
        qb.insertInto('patients')
          .values({ id: patient_id, country: SERVER_COUNTRY }),
    ).with(
      'inserting_patient_encounter',
      (qb) =>
        qb.insertInto('patient_encounters')
          .values({
            patient_id,
            organization_id,
            id: patient_encounter_id,
            location: literalLocation(location),
          }),
    )
      .with(
        'inserting_registration_workflow',
        (qb) =>
          qb.insertInto('patient_workflows')
            .values({
              id: patient_workflow_id,
              patient_encounter_id,
              workflow: 'registration',
            }),
      )
      .with(
        'inserting_patient_presence',
        (qb) =>
          qb.insertInto('patient_presence')
            .values({
              id: patient_id,
              patient_encounter_id,
              organization_id,
              department_name: 'Reception',
              current_workflow: 'registration',
              organization_room_id: reception_id,
            }),
      )
      .with(
        'inserting_patient_encounter_employee',
        (qb) =>
          qb.insertInto('patient_encounter_employees')
            .values({
              id: patient_encounter_employee_id,
              patient_encounter_id,
              employment_id: organization_employment.employment_id,
            }),
      )
      .with(
        'inserting_employment_presence',
        (qb) =>
          qb.insertInto('employment_presence')
            .values({
              id: organization_employment.employment_id,
              at_work: true,
              with_patient_id: patient_id,
            }).onConflict((oc) =>
              oc.column('id').doUpdateSet({
                at_work: true,
                with_patient_id: patient_id,
              })
            ),
      )
      .with(
        'inserting_patient_workflow_started',
        (qb) =>
          qb.insertInto('patient_workflows_started')
            .values({
              patient_workflow_id,
              patient_encounter_employee_id,
            }),
      )
      .selectNoFrom([
        success_true,
      ])
      .executeTakeFirstOrThrow()

    return {
      success,
      patient_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      patient_workflow_id,
    }
  },
  async getSummaryById(
    trx: TrxOrDb,
    patient_id: string,
  ): Promise<RegistrationPatientSummary> {
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
      family,
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

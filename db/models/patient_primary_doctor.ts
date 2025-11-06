import { sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'
import { jsonBuildObject } from '../helpers.ts'

export function get(
  trx: TrxOrDb,
  { patient_id }: { patient_id: string },
) {
  return trx.selectFrom('patients')
    .innerJoin('employment', 'employment.id', 'patients.primary_doctor_id')
    .innerJoin(
      'health_workers',
      'employment.health_worker_id',
      'health_workers.id',
    )
    .innerJoin(
      'organizations as primary_doctor_organizations',
      'employment.organization_id',
      'primary_doctor_organizations.id',
    )
    .select((eb) => [
      'employment.id as employment_id',
      'employment.health_worker_id',
      'health_workers.name',
      'health_workers.avatar_url',
      'employment.specialty',
      // TODO implement last_visit_relative_to_now
      sql<string>`'2 months ago'`.as('last_visit_relative_to_now'),
      jsonBuildObject({
        id: eb.ref('primary_doctor_organizations.id'),
        name: eb.ref('primary_doctor_organizations.name'),
      }).as('organization'),
    ])
    .where(
      'patients.id',
      '=',
      patient_id,
    )
    .executeTakeFirst()
}

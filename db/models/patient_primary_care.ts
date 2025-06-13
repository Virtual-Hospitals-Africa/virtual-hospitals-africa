import { sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'
import { promiseProps } from '../../util/promiseProps.ts'

export function getPrimaryDoctor(
  trx: TrxOrDb,
  { patient_id }: { patient_id: string },
) {
  return trx
    .selectFrom('patients')
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
    .select([
      'patients.primary_doctor_id',
      sql<
        string
      >`'Dr. ' || coalesce(health_workers.name, patients.unregistered_primary_doctor_name)`
        .as('primary_doctor_name'),
    ])
    .where('patients.id', '=', patient_id)
    .where((eb) =>
      eb.or([
        eb('primary_doctor_id', 'is not', null),
        eb('unregistered_primary_doctor_name', 'is not', null),
      ])
    )
    .executeTakeFirst()
}

export function getNearestHealthFacility(
  trx: TrxOrDb,
  { patient_id }: { patient_id: string },
) {
  return trx
    .selectFrom('patients')
    .innerJoin(
      'organizations',
      'organizations.id',
      'patients.nearest_organization_id',
    )
    .select((eb) => [
      eb.ref('nearest_organization_id').$notNull().as('organization_id'),
      eb.ref('organizations.name').$notNull().as('organization_name'),
    ])
    .where('patients.id', '=', patient_id)
    .where('nearest_organization_id', 'is not', null)
    .executeTakeFirst()
}

export function getById(
  trx: TrxOrDb,
  { patient_id }: { patient_id: string },
) {
  return promiseProps({
    primary_doctor: getPrimaryDoctor(trx, {
      patient_id,
    }),
    nearest_health_facility: getNearestHealthFacility(
      trx,
      {
        patient_id,
      },
    ),
  })
}

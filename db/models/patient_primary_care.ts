import { sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'
import { promiseProps } from '../../util/promiseProps.ts'

export const patient_primary_care = {
  getPrimaryDoctor(
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
      .select((eb) => [
        eb.ref('patients.primary_doctor_id').as('id'),
        sql<
          string
        >`'Dr. ' || coalesce(health_workers.name, patients.unregistered_primary_doctor_name)`
          .as('name'),
      ])
      .where('patients.id', '=', patient_id)
      .where((eb) =>
        eb.or([
          eb('primary_doctor_id', 'is not', null),
          eb('unregistered_primary_doctor_name', 'is not', null),
        ])
      )
      .executeTakeFirst()
  },

  getNearestHealthFacility(
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
        eb.ref('nearest_organization_id').$notNull().as('id'),
        eb.ref('organizations.name').$notNull().as('name'),
      ])
      .where('patients.id', '=', patient_id)
      .where('nearest_organization_id', 'is not', null)
      .executeTakeFirst()
  },

  getById(
    trx: TrxOrDb,
    { patient_id }: { patient_id: string },
  ) {
    return promiseProps({
      primary_doctor: patient_primary_care.getPrimaryDoctor(trx, {
        patient_id,
      }),
      nearest_health_facility: patient_primary_care.getNearestHealthFacility(
        trx,
        {
          patient_id,
        },
      ),
    })
  },

  setPrimaryDoctor(
    trx: TrxOrDb,
    { patient_id, primary_doctor_id }: {
      patient_id: string
      primary_doctor_id: string
    },
  ) {
    return trx.updateTable('patients').where('id', '=', patient_id).set(
      'primary_doctor_id',
      primary_doctor_id,
    ).executeTakeFirstOrThrow()
  },

  setUnregisteredPrimaryDoctor(
    trx: TrxOrDb,
    { patient_id, primary_doctor_name }: {
      patient_id: string
      primary_doctor_name: string
    },
  ) {
    return trx.updateTable('patients').where('id', '=', patient_id)
      .set('unregistered_primary_doctor_name', primary_doctor_name)
      .executeTakeFirstOrThrow()
  },

  setNearestHealthFacility(
    trx: TrxOrDb,
    { patient_id, nearest_organization_id }: {
      patient_id: string
      nearest_organization_id: string
    },
  ) {
    return trx.updateTable('patients')
      .where('id', '=', patient_id)
      .set('nearest_organization_id', nearest_organization_id)
      .executeTakeFirstOrThrow()
  },
}

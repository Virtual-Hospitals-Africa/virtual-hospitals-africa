import { TrxOrDbOrQueryCreator } from '../../types.ts'

export const patient_nearest_organization = {
  get(
    trx: TrxOrDbOrQueryCreator,
    { patient_id }: { patient_id: string },
  ) {
    return trx.selectFrom('patients')
      .innerJoin(
        'organizations',
        'organizations.id',
        'patients.nearest_organization_id',
      )
      .select([
        'organizations.id',
        'organizations.name',
      ])
      .where('patients.id', '=', patient_id)
      .executeTakeFirst()
  },
}

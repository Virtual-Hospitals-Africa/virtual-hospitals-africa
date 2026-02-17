import { addresses } from './addresses.ts'
import { Address, OptionalMaybeFields, TrxOrDbOrQueryCreator } from '../../types.ts'

export const patient_address = {
  getByPatientId(trx: TrxOrDbOrQueryCreator, { patient_id }: { patient_id: string }) {
    return trx
      .selectFrom('patients')
      .innerJoin(
        'addresses',
        'addresses.id',
        'patients.address_id',
      )
      .where('patients.id', '=', patient_id)
      .selectAll('addresses')
      .executeTakeFirst()
  },
  async updateByPatientId(
    trx: TrxOrDbOrQueryCreator,
    { patient_id, address }: {
      patient_id: string
      address: OptionalMaybeFields<Address>
    },
  ) {
    const created_address = await addresses.insert(
      trx,
      address,
    )
    await trx.updateTable('patients')
      .where('patients.id', '=', patient_id)
      .set('address_id', created_address.id)
      .executeTakeFirstOrThrow()
  },
}

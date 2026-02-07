import { TrxOrDb } from '../../types.ts'

export const patient_contacts = {
  get(
    trx: TrxOrDb,
    { patient_id }: { patient_id: string },
  ) {
    return trx.selectFrom('patients')
      .leftJoin('addresses', 'patients.address_id', 'addresses.id')
      .select([
        'patients.phone_number',
        'addresses.formatted as formatted_address',
      ])
      .where('patients.id', '=', patient_id)
      .executeTakeFirst()
  },

  updatePhoneNumber(
    trx: TrxOrDb,
    { patient_id, phone_number }: {
      patient_id: string
      phone_number: string
    },
  ) {
    return trx.updateTable('patients')
      .set({ phone_number })
      .where('id', '=', patient_id)
      .executeTakeFirst()
  },
}

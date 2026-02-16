import { TrxOrDbOrQueryCreator } from '../../types.ts'

export const patient_contacts = {
  get(
    trx: TrxOrDbOrQueryCreator,
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
    trx: TrxOrDbOrQueryCreator,
    { patient_id, phone_number }: {
      patient_id: string
      phone_number?: string
    },
  ) {
    return trx.updateTable('patients')
      .set({ phone_number: phone_number || null })
      .where('id', '=', patient_id)
      .executeTakeFirst()
  },
}

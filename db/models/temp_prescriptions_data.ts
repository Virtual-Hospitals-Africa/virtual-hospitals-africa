import { TrxOrDb } from '../../types.ts'

export async function insertID(
  trx: TrxOrDb,
  opts: {
    id: string
    prescription_id?: string
    code?: string
  },
) {
  // const phoneNumber = await(
  //   trx.selectFrom('employment')
  //     .where('phone_number', '=', opts.phone_number)
  //     .select('phone_number')
  //     .executeTakeFirst()
  // )
  // if(phoneNumber !== undefined && phoneNumber !== null){
  //   await deleteRecord(trx, opts.phone_number)
  // }
  return trx
    .insertInto('temporary_prescription_data')
    .values(opts)
    .onConflict((oc) => oc.column('id').doUpdateSet(opts))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export function updateCode(
  trx: TrxOrDb,
  opts: {
    id: string
    prescription_id?: string
    code?: string
  },
){
  return trx
  .updateTable('temporary_prescription_data')
  .set({ code: opts.code })  
  .where('id', '=', opts.id)  
  .returningAll()
  .executeTakeFirstOrThrow();
}

// export function deleteRecord(
//   trx: TrxOrDb,
//   phone_number: string
// ) {
//   return trx
//     .deleteFrom('temporary_prescription_data')
//     .where('phone_number', '=', phone_number)
//     .executeTakeFirstOrThrow()
// }




export function getByPhoneNumber(
  trx: TrxOrDb,
  phone_number: string,
) {
  return trx
    .selectFrom('temporary_prescription_data')
    .where('phone_number', '=', phone_number)
    .selectAll()
    .executeTakeFirst()
}

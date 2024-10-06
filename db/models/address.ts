import { jsonArrayFrom } from '../helpers.ts'
import { CountryAddressTree, TrxOrDb } from '../../types.ts'
// import { Address } from '../../db.d.ts'

let fullCountryInfo: CountryAddressTree | undefined
export async function getCountryAddressTree(
  trx: TrxOrDb,
): Promise<CountryAddressTree> {
  if (fullCountryInfo) return fullCountryInfo
  return fullCountryInfo = await trx
    .selectFrom('countries')
    .select((ebProvinces) => [
      'id',
      'name',
      jsonArrayFrom(
        ebProvinces.selectFrom('provinces')
          .select((ebDistricts) => [
            'id',
            'name',
            jsonArrayFrom(
              ebDistricts.selectFrom('districts')
                .select((ebWards) => [
                  'id',
                  'name',
                  jsonArrayFrom(
                    ebWards.selectFrom('wards')
                      .select((ebSuburbs) => [
                        'id',
                        'name',
                        jsonArrayFrom(
                          ebSuburbs.selectFrom('suburbs')
                            .select([
                              'id',
                              'name',
                            ])
                            .whereRef(
                              'suburbs.ward_id',
                              '=',
                              'wards.id',
                            ),
                        ).as('suburbs'),
                      ])
                      .whereRef('wards.district_id', '=', 'districts.id'),
                  ).as('wards'),
                ])
                .whereRef('districts.province_id', '=', 'provinces.id'),
            ).as('districts'),
          ])
          .whereRef('provinces.country_id', '=', 'countries.id'),
      ).as('provinces'),
    ])
    .execute()
}

// export function upsert(
//   trx: TrxOrDb,
//   address: Address,
// ) {
//   return trx
//     .insertInto('Address')
//     .values(address)
//     .onConflict((oc) => oc.column('resourceId').doUpdateSet(address))
//     .returningAll()
//     .executeTakeFirstOrThrow()
// }

// export async function upsertFromFormFields(
//   trx: TrxOrDb,
//   resourceId: string,
//   form_values: AddressFormFields,
// ) {
//   const country_address_tree = await getCountryAddressTree()

//   return upsert(trx, {
//     resourceId,
//     address: form_values.street,
//     city,
//     country: null,
//     postalCode: 'ZW',
//     state
//   })

//   trx
//     .insertInto('Address')
//     .values(address)
//     .onConflict((oc) => oc.column('resourceId').doUpdateSet(specified))
//     .returningAll()
//     .executeTakeFirstOrThrow()
// }

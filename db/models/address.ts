import { AdminDistricts, TrxOrDb } from '../../types.ts'
import { jsonArrayFrom } from '../helpers.ts'

export function getAll(
  trx: TrxOrDb,
): Promise<AdminDistricts> {
  return trx
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

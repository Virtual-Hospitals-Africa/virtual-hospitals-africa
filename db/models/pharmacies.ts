import { TrxOrDb } from '../../types.ts'

export async function get(
  trx: TrxOrDb,
  page: number = 1,
  rowsPerPage: number = 10,
) {
  const offset = (page - 1) * rowsPerPage
  const pharmacies = await trx
    .selectFrom('premises')
    .select([
      'id',
      'name',
      'licence_number',
      'licensee',
      'address',
      'town',
      'expiry_date',
      'premises_types',
    ])
    .orderBy('name', 'asc')
    .limit(rowsPerPage)
    .offset(offset)
    .execute()

  const totalRowsResult = await trx
    .selectFrom('premises')
    .select((eb) => eb.fn.count('id').as('totalRows'))
    .execute()

  const totalRows = parseInt(totalRowsResult[0].totalRows.toString(), 10)

  const pharmaciesList = pharmacies.map((pharmacy) => ({
    ...pharmacy,
    expiry_date: new Date(pharmacy.expiry_date).toISOString().split('T')[0],
  }))

  return {
    pharmaciesList,
    totalRows,
  }
}

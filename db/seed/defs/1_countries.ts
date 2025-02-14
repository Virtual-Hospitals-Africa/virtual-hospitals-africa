import { create } from '../create.ts'

export default create(['countries'], (trx) => {
  return trx.insertInto('countries')
    .values([
      { iso_3166: 'ZA', full_name: 'South Africa' },
      { iso_3166: 'ZW', full_name: 'Zimbabwe' },
    ])
    .execute()
})

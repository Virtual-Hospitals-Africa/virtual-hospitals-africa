import { define } from '../define.ts'
import { COUNTRIES } from '../../../shared/countries.ts'

export default define(['countries'], (trx) =>
  trx.insertInto('countries')
    .values(COUNTRIES.map((country) => ({
      ...country,
      alternate_names: country.alternate_names ? [country.alternate_names] : [],
    })))
    .execute())

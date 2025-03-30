import { parseTsvResource } from '../../parseTsvResource.ts'
import { create } from '../create.ts'
import z from 'zod'

export const countries = await parseTsvResource(
  'countries',
  z.object({
    iso_3166: z.string().length(2),
    full_name: z.string(),
  }),
)

export default create(['countries'], (trx) =>
  trx.insertInto('countries')
    .values(countries)
    .execute())

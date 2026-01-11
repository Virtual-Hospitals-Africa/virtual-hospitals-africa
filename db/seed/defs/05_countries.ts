import { define } from '../define.ts'
import { collectTsvResource } from '../../parseTsvResource.ts'
import z from 'zod'

export const countries = await collectTsvResource(
  'countries',
  z.object({
    iso_3166_2: z.string().length(2),
    iso_3166_3: z.string().length(3),
    official_name: z.string(),
    alternate_names: z.string().nullable().transform((names) => names?.split(',') || []),
  }),
)

export default define(['countries'], (trx) =>
  trx.insertInto('countries')
    .values(countries)
    .execute())

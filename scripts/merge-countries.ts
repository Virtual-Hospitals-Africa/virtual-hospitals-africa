import z from 'zod'
import { collectTsvResource } from '../db/parseTsvResource.ts'
import { groupByUniq } from '../util/groupBy.ts'

export const countries_official_names = await collectTsvResource(
  'countries_official_names',
  z.object({
    iso_3166_2: z.string().length(2),
    official_name: z.string(),
  }),
)

export const countries_common_names = await collectTsvResource(
  'countries_common_names',
  z.object({
    iso_3166_2: z.string().length(2),
    iso_3166_3: z.string().length(3),
    common_name: z.string(),
  }),
)

if (import.meta.main) {
  const official_names_by_iso_3166_2 = groupByUniq(
    countries_official_names,
    'iso_3166_2',
  )
  const countries = countries_common_names.map(
    ({ iso_3166_2, iso_3166_3, common_name }) => {
      const { official_name } = official_names_by_iso_3166_2.get(iso_3166_2)!
      const alternate_names = common_name === official_name ? [] : [common_name]
      return { iso_3166_2, iso_3166_3, official_name, alternate_names }
    },
  )
  const file = await Deno.open('./db/resources/countries.tsv', {
    write: true,
    create: true,
    truncate: true,
  })
  const encoder = new TextEncoder()
  await file.truncate()
  await file.write(
    encoder.encode('iso_3166_2\tiso_3166_3\tofficial_name\talternate_names\n'),
  )
  for (
    const { iso_3166_2, iso_3166_3, official_name, alternate_names }
      of countries
  ) {
    await file.write(
      encoder.encode(
        `${iso_3166_2}\t${iso_3166_3}\t${official_name}\t${alternate_names}\n`,
      ),
    )
  }
}

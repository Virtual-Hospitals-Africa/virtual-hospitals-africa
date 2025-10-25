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

export const countries_emoji = await collectTsvResource(
  'countries_emoji',
  z.object({
    emoji: z.string(),
    country: z.string(),
  }),
)

export const countries_phone_code = await collectTsvResource(
  'countries_phone_code',
  z.object({
    country: z.string(),
    phone_calling_code: z.string(),
  }),
)

if (import.meta.main) {
  // Create lookup maps
  const official_names_by_iso_3166_2 = groupByUniq(
    countries_official_names,
    'iso_3166_2',
  )

  // Create maps by country name for emoji and phone codes
  const emoji_by_country = new Map(
    countries_emoji.map(({ country, emoji }) => [country, emoji]),
  )
  const phone_code_by_country = new Map(
    countries_phone_code.map((
      { country, phone_calling_code },
    ) => [country, phone_calling_code]),
  )

  // Helper function to find matching emoji or phone code
  const findMatch = <T>(
    map: Map<string, T>,
    official_name: string,
    common_name: string,
  ): T | undefined => {
    return map.get(official_name) || map.get(common_name)
  }

  const countries = countries_common_names.map(
    ({ iso_3166_2, iso_3166_3, common_name }) => {
      const { official_name } = official_names_by_iso_3166_2.get(iso_3166_2)!
      const alternate_names = common_name === official_name ? [] : [common_name]

      // Try to match emoji and phone code
      const emoji = findMatch(emoji_by_country, official_name, common_name) ||
        ''
      const phone_calling_code =
        findMatch(phone_code_by_country, official_name, common_name) || ''

      return {
        iso_3166_2,
        iso_3166_3,
        official_name,
        alternate_names,
        emoji,
        phone_calling_code,
      }
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
    encoder.encode(
      'iso_3166_2\tiso_3166_3\tofficial_name\talternate_names\temoji\tphone_calling_code\n',
    ),
  )
  for (
    const {
      iso_3166_2,
      iso_3166_3,
      official_name,
      alternate_names,
      emoji,
      phone_calling_code,
    } of countries
  ) {
    await file.write(
      encoder.encode(
        `${iso_3166_2}\t${iso_3166_3}\t${official_name}\t${alternate_names}\t${emoji}\t${phone_calling_code}\n`,
      ),
    )
  }
}

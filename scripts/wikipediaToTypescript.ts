import { assert } from 'std/assert/assert.ts'
import z from 'zod'
import { rewriteTsvAsTypescript } from './tsvAsTypescript.ts'

const split_semi = (s: string) => s.split('; ').map((s) => s.startsWith('*') && s.endsWith('*') ? s.slice(1, -1) : s)

const schema = z.object({
  'iso_639_2': z.string(),
  'iso_639_1': z.string().nullable(),
  'language_names': z.string().transform(split_semi),
  'scope': z.enum([
    'Individual',
    'Macrolanguage',
    'Special',
    'Collective',
    'Local',
  ])
    .nullable(),
  'type': z.enum([
    'Living',
    'Genetic',
    'Constructed',
    'Historical',
    'Genetic-like',
    'Geographic',
    'Extinct',
    'Special',
  ]).nullable(),
  'native_names': z.string().transform(split_semi).nullable().transform((x) => x ?? []),
  'other_names': z.string().transform(split_semi).nullable().transform((x) => x ?? []),
  // Omitting these as unused
  // 'iso_639_3': z.string().nullable(),
  // 'iso_639_5': z.string().nullable(),
}).transform(({
  iso_639_2,
  ...rest
}) => {
  let [iso_639_2_b, iso_639_2_t] = iso_639_2.split(' / ')
  if (!iso_639_2_t) {
    iso_639_2_t = iso_639_2_b
  } else {
    assert(iso_639_2_t.endsWith('*'))
    iso_639_2_t = iso_639_2_t.slice(0, 3)
  }

  assert(iso_639_2_b.length === 3)
  assert(iso_639_2_t)
  assert(iso_639_2_t.length === 3)

  return {
    iso_639_2_b,
    iso_639_2_t,
    ...rest,
  }
})

export type Language = z.infer<typeof schema>

async function main(filepath: string) {
  await rewriteTsvAsTypescript(filepath, schema)
}

if (import.meta.main) {
  const filepath = 'db/resources/languages/wikipedia-iso-languages.tsv'
  await main(filepath)
}

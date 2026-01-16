import { Maybe } from '../../../types.ts'
import { SelectWithOptions } from './select_with_options.tsx'
import { LIVING_LANGUAGES, OFFICIAL_LANGUAGES } from '../../../shared/languages.ts'
import { assert } from 'std/assert/assert.ts'
import partition from '../../../util/partition.ts'
import uniq from '../../../util/uniq.ts'

export function LanguageSelect(
  { value, default_language_code, server_country }: {
    value: Maybe<string>
    default_language_code: Maybe<string>
    server_country: string
  },
) {
  assert(server_country === 'ZA')
  const official_languages_of_country_set = OFFICIAL_LANGUAGES[server_country]

  const language_options = LIVING_LANGUAGES.map((lang) => ({
    value: lang.iso_639_2_b,
    label: uniq(lang.language_names.concat(lang.native_names)).join('; '),
  }))

  const [official_languages, other_languages] = partition(
    language_options,
    (lang) => official_languages_of_country_set.has(lang.value),
  )

  return (
    <SelectWithOptions
      name='preferred_language_code'
      value={value ?? default_language_code ?? undefined}
      groups={[
        {
          label: 'South African Official Languages',
          options: official_languages,
        },
        { label: 'Other Languages', options: other_languages },
      ]}
    />
  )
}

import { Iso6392BLanguages } from '../../../db.d.ts'
import { Maybe } from '../../../types.ts'
import { SelectWithOptions } from './select_with_options.tsx'

export function LanguageInput(
  { value, default_language_code, languages }: {
    value: Maybe<string>
    default_language_code: Maybe<string>
    languages: Iso6392BLanguages[]
  },
) {
  return (
    <SelectWithOptions
      name='language_code'
      value={value ?? default_language_code ?? undefined}
      options={languages.map((lang) => ({
        value: lang.iso_639_2_b,
        label: lang.english_name,
      }))}
    />
  )
}

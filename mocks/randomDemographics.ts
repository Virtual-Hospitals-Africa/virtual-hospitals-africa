import { OFFICIAL_LANGUAGES } from '../shared/languages.ts'
import { AgeDetermination } from '../types.ts'
import isKeyOf from '../util/isKeyOf.ts'
import sample from '../util/sample.ts'
import randomDateOfBirth from './randomDateOfBirth.ts'
import randomNamesAndSex from './randomNamesAndSex.ts'
import randomNationalId from './randomNationalId.ts'

export default function randomDemographics(
  country: 'ZA' | 'ZW' = 'ZA',
  sex?: 'male' | 'female',
  age_determination?: AgeDetermination,
) {
  const date_of_birth = randomDateOfBirth(age_determination)
  const names_and_sex = randomNamesAndSex(country, sex)
  const national_id_number = randomNationalId({
    country,
    date_of_birth,
    sex: names_and_sex.sex,
  })
  return {
    ...names_and_sex,
    date_of_birth,
    national_id_number,
    country,
    gender: names_and_sex.sex === 'female' ? 'woman' : 'man',
    preferred_language_code_iso_639_2_b: isKeyOf(country, OFFICIAL_LANGUAGES) ? sample(Array.from(OFFICIAL_LANGUAGES[country])) : 'eng',
  }
}

import randomDateOfBirth from './randomDateOfBirth.ts'
import randomNamesAndSex from './randomNamesAndSex.ts'
import randomNationalId from './randomNationalId.ts'

export default function randomDemographics(
  country: 'ZA' | 'ZW' = 'ZA',
  sex?: 'male' | 'female',
) {
  const date_of_birth = randomDateOfBirth()
  const names_and_sex = randomNamesAndSex(country, sex)
  const national_id_number = randomNationalId({
    country,
    sex: names_and_sex.sex,
    date_of_birth,
  })
  return {
    ...names_and_sex,
    date_of_birth,
    national_id_number,
    country,
    gender: names_and_sex.sex === 'female' ? 'woman' : 'man',
  }
}

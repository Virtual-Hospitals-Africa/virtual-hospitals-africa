import randomDateOfBirth from './randomDateOfBirth.ts'
import { randomNamesAndGender } from './randomDemographics.ts'

export default function randomPatientMandatoryRegistrationInformation(
  country: 'za' | 'zw' = 'za',
  gender?: 'male' | 'female',
) {
  const demographics = randomNamesAndGender(country, gender)
  return {
    name: `${demographics.first_name} ${demographics.last_name}`,
    date_of_birth: randomDateOfBirth(),
    gender: demographics.gender,
  }
}

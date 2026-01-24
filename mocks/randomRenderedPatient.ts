import { RenderedPatient } from '../types.ts'
import { prettyPatientDateOfBirth } from '../util/date.ts'
import randomDemographics from './randomDemographics.ts'
import { randomUUID } from 'node:crypto'

function calculateAge(dateOfBirth: string): {
  age_years: number
  age_days: number
  age_display: string
} {
  const dob = new Date(dateOfBirth)
  const today = new Date()

  const diffTime = Math.abs(today.getTime() - dob.getTime())
  const age_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const age_years = Math.floor(age_days / 365.25)

  if (age_years >= 1) {
    return {
      age_years,
      age_days,
      age_display: `${age_years} year${age_years === 1 ? '' : 's'}`,
    }
  }

  const age_months = Math.floor(age_days / 30.44)
  if (age_months >= 1) {
    return {
      age_years,
      age_days,
      age_display: `${age_months} month${age_months === 1 ? '' : 's'}`,
    }
  }

  return {
    age_years,
    age_days,
    age_display: `${age_days} day${age_days === 1 ? '' : 's'}`,
  }
}

export default function randomRenderedPatient(
  country: 'ZA' | 'ZW' = 'ZA',
  sex?: 'male' | 'female',
): RenderedPatient {
  const demographics = randomDemographics(country, sex)
  const age = calculateAge(demographics.date_of_birth)

  return {
    id: randomUUID(),
    sex: demographics.sex,
    gender: demographics.gender,
    national_id_number: demographics.national_id_number,
    completed_registration: true,
    date_of_birth: demographics.date_of_birth,
    dob_formatted: prettyPatientDateOfBirth(demographics.date_of_birth),
    name: demographics.name,
    names: {
      name: demographics.name,
      first_names: demographics.first_names,
      surname: demographics.surname,
      preferred_name: demographics.preferred_name,
    },
    description: `${demographics.sex} • ${prettyPatientDateOfBirth(demographics.date_of_birth)}`,
    age_display: age.age_display,
    age_years: age.age_years,
    age_days: age.age_days,
    avatar_url: null,
    preferred_language_code_iso_639_2_b: demographics.preferred_language_code_iso_639_2_b,
    most_recent_height_cm_measurement: null,
  }
}

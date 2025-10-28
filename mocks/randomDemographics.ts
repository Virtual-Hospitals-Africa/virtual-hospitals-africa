import memoize from '../util/memoize.ts'
import { last_names as za_last_names } from '../db/resources/demographics/last_names/za.ts'
import { first_names as za_first_names } from '../db/resources/demographics/first_names/za.ts'
import { last_names as zw_last_names } from '../db/resources/demographics/last_names/zw.ts'
import { first_names as zw_first_names } from '../db/resources/demographics/first_names/zw.ts'

const names = {
  ZA: {
    last_names: za_last_names,
    first_names: za_first_names,
  },
  ZW: {
    last_names: zw_last_names,
    first_names: zw_first_names,
  },
}

type Demographics = {
  first_name: string
  last_name: string
  name: string
  gender: 'female' | 'male'
}

const incidences = memoize(function (country: 'ZA' | 'ZW') {
  const { last_names, first_names } = names[country]

  // Keep track of the total incidence of each name
  let last_name_incidence = 0
  const last_name_incidences = last_names.map((entry) => {
    last_name_incidence += entry.incidence
    return {
      name: entry.last_name,
      incidence: last_name_incidence,
    }
  })
  const total_last_name_incidence =
    last_name_incidences[last_name_incidences.length - 1].incidence

  let first_name_incidence = 0
  const first_name_incidences = first_names.map((entry) => {
    first_name_incidence += entry.incidence
    return {
      name: entry.first_name,
      incidence: first_name_incidence,
      female_percentage: entry.female_percentage,
      male_percentage: entry.male_percentage,
    }
  })
  const total_first_name_incidence =
    first_name_incidences[first_name_incidences.length - 1].incidence

  return {
    last_name_incidences,
    first_name_incidences,
    total_last_name_incidence,
    total_first_name_incidence,
  }
})

export function randomNamesAndGender(
  country: 'ZA' | 'ZW' = 'ZA',
  gender?: 'male' | 'female',
): Demographics {
  const {
    last_name_incidences,
    first_name_incidences,
    total_last_name_incidence,
    total_first_name_incidence,
  } = incidences(country)
  const last_name_seed = Math.random() * total_last_name_incidence
  const first_name_seed = Math.random() * total_first_name_incidence
  const gender_seed = 100 * Math.random()
  const last_name = last_name_incidences.find((entry) => {
    return last_name_seed < entry.incidence
  })!.name
  const first_name_entry = first_name_incidences.find((entry) => {
    return first_name_seed < entry.incidence
  })!
  const first_name = first_name_entry.name
  const of_sex = first_name_entry.female_percentage > gender_seed
    ? 'female'
    : 'male'
  if (gender && gender !== of_sex) {
    // Just re-roll the dice until we get one that matches
    return randomNamesAndGender(country, gender)
  }
  return {
    first_name,
    last_name,
    gender: of_sex,
    name: `${first_name} ${last_name}`,
  }
}

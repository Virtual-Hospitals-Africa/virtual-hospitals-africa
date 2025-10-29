import memoize from '../util/memoize.ts'
import { surnames as za_surnames } from '../db/resources/demographics/surnames/za.ts'
import { first_names as za_first_names } from '../db/resources/demographics/first_names/za.ts'
import { surnames as zw_surnames } from '../db/resources/demographics/surnames/zw.ts'
import { first_names as zw_first_names } from '../db/resources/demographics/first_names/zw.ts'

const names = {
  ZA: {
    surnames: za_surnames,
    first_names: za_first_names,
  },
  ZW: {
    surnames: zw_surnames,
    first_names: zw_first_names,
  },
}

type Demographics = {
  first_names: string
  surname: string
  name: string
  preferred_name: string
  sex: 'female' | 'male'
}

const incidences = memoize(function (country: 'ZA' | 'ZW') {
  const { surnames, first_names } = names[country]

  // Keep track of the total incidence of each name
  let surname_incidence = 0
  const surname_incidences = surnames.map((entry) => {
    surname_incidence += entry.incidence
    return {
      name: entry.surname,
      incidence: surname_incidence,
    }
  })
  const total_surname_incidence =
    surname_incidences[surname_incidences.length - 1].incidence

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
    surname_incidences,
    first_name_incidences,
    total_surname_incidence,
    total_first_name_incidence,
  }
})

export default function randomNamesAndSex(
  country: 'ZA' | 'ZW' = 'ZA',
  sex?: 'male' | 'female',
): Demographics {
  const {
    surname_incidences,
    first_name_incidences,
    total_surname_incidence,
    total_first_name_incidence,
  } = incidences(country)
  const surname_seed = Math.random() * total_surname_incidence
  const first_name_seed = Math.random() * total_first_name_incidence
  const sex_seed = 100 * Math.random()
  const surname = surname_incidences.find((entry) => {
    return surname_seed < entry.incidence
  })!.name
  const first_name_entry = first_name_incidences.find((entry) => {
    return first_name_seed < entry.incidence
  })!
  const first_names = first_name_entry.name
  const of_sex = first_name_entry.female_percentage > sex_seed
    ? 'female'
    : 'male'
  if (sex && sex !== of_sex) {
    // Just re-roll the dice until we get one that matches
    return randomNamesAndSex(country, sex)
  }
  return {
    first_names,
    surname,
    preferred_name: first_names,
    sex: of_sex,
    name: `${first_names} ${surname}`,
  }
}

import { assert } from 'std/assert/assert.ts'
import last from './last.ts'

export function fromHumanName(name: {
  given: string[] | string
  family: string
}) {
  const given = Array.isArray(name.given) ? name.given.join(' ') : name.given
  return `${given} ${name.family}`
}

export function toHumanName(name: string) {
  let given_names = name.split(' ').filter((n) => !!n)
  let family_name = given_names.pop()

  // Interpret "de" in "Camille de Bruglia" into part of the family name
  if (given_names.length >= 2) {
    const maybe_part_of_family_name = last(given_names)!
    if (
      maybe_part_of_family_name[0].toLowerCase() ===
        maybe_part_of_family_name[0]
    ) {
      given_names = given_names.slice(0, -1)
      family_name = `${maybe_part_of_family_name} ${family_name}`
    }
  }
  assert(family_name)
  assert(given_names.length >= 1)
  return {
    given: given_names,
    family: family_name,
  }
}

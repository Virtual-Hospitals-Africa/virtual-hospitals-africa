import { assert } from 'std/assert/assert.ts'
import first from '../../util/first.ts'

import { exists } from '../../util/exists.ts'
import last from '../../util/last.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { Names } from '../../types.ts'

export type NameInputs = {
  name: string
  first_names?: string
  surname?: string
  preferred_name?: string
} | {
  name?: never
  first_names: string
  surname: string
  preferred_name: string
}

export function asNames(
  names: NameInputs,
): Names {
  return exists(asMaybeNames(names))
}

export function asMaybeNames(
  {
    name,
    first_names,
    surname,
    preferred_name,
  }: {
    name?: string
    first_names?: string
    surname?: string
    preferred_name?: string
  },
): null | Names {
  if (first_names) {
    assert(surname)
    if (name) {
      assertEquals(name, first_names + ' ' + surname)
    } else {
      name = first_names + ' ' + surname
    }
    if (!preferred_name) {
      // This is more likely to come from Google, so just leave it as is. The user can change it later
      preferred_name = first_names
    }
  } else if (!name) {
    return null
  } else {
    assert(!surname)
    assert(!preferred_name)
    const names = name.split(' ')
    surname = exists(last(names))
    preferred_name = exists(first(names))
    first_names = names.slice(0, -1).join(' ')
  }

  return {
    name,
    first_names,
    surname,
    preferred_name,
  }
}

import { AvailabilityJSON } from '../types.ts'
import set from './set.ts'

export default function parseAvailabilityForm(
  params: URLSearchParams | FormData,
): AvailabilityJSON {
  const availability = {
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  }

  params.forEach((value, key) => {
    const toSet = /^\d+$/g.test(value as string)
      ? parseInt(value as string)
      : value
    set(availability, key, toSet)
  })

  return availability
}

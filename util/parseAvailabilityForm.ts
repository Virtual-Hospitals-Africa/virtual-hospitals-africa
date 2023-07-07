import { parseForm } from './parseForm.ts'
import { AvailabilityJSON } from '../types.ts'

// TODO: implement
function isAvailabilityJson(_values: unknown): _values is AvailabilityJSON {
  return true
}

export default function parseAvailabilityForm(
  params: URLSearchParams | FormData,
): AvailabilityJSON {
  return parseForm(params, {
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  }, isAvailabilityJson)
}

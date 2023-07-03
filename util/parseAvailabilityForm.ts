import parseForm from './parseForm.ts'
import { AvailabilityJSON } from '../types.ts'

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
  })
}

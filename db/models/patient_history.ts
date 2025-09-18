// deno-lint-ignore-file no-unused-vars
import { RenderedPatientHistory, TrxOrDb } from '../../types.ts'

export function get(
  trx: TrxOrDb,
  { encounter_id, encounter_provider_id }: {
    encounter_id: string
    encounter_provider_id: string
  },
): Promise<RenderedPatientHistory> {
  return Promise.resolve({
    pre_existing_conditions: [],
    allergies: [],
    family_history: [],
    major_surgeries: [],
    medications: [],
    lifestyle: [],
  })
}

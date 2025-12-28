import { assert } from 'std/assert/assert.ts'
import {
  RenderedFindingProvider,
  RenderedPatientEncounter,
  TrxOrDb,
} from '../../types.ts'
import { groupByUniq } from '../../util/groupBy.ts'
import uniq from '../../util/uniq.ts'
import * as patient_encounters from './patient_encounters.ts'
import { IntermediateFinding } from './patient_findings.ts'
import { buildValueDisplay } from '../../shared/patient_records.ts'

export async function hydrateIntermediateRecords<
  IntermediateRecord extends IntermediateFinding,
>(
  trx: TrxOrDb,
  { records, encounter, health_worker_id }: {
    records: IntermediateRecord[]
    health_worker_id: string
    encounter?: RenderedPatientEncounter
  },
): Promise<
  Array<
    IntermediateRecord & {
      full_display: string
      value_display: string | null
      provider: RenderedFindingProvider
    }
  >
> {
  const encounter_ids = uniq(
    records.map((record) => record.patient_encounter_id),
  )

  const other_encounter_ids = encounter_ids.filter((encounter_id) =>
    encounter ? encounter_id !== encounter.patient_encounter_id : true
  )

  const encounters: RenderedPatientEncounter[] = other_encounter_ids.length
    ? await patient_encounters.getByIds(trx, other_encounter_ids)
    : []

  if (encounter) {
    encounters.push(encounter)
  }

  const encounter_id_to_encounter = groupByUniq(
    encounters,
    'patient_encounter_id',
  )

  return records.map(
    (record) => {
      const matching_encounter = encounter_id_to_encounter.get(
        record.patient_encounter_id,
      )
      assert(
        matching_encounter,
        `Matching encounter not found ${record.patient_encounter_id} ${record.record_id}`,
      )

      const matching_employee = matching_encounter.all_employees_seen.find((
        employee,
      ) =>
        employee.patient_encounter_employee_id ===
          record.patient_encounter_employee_id
      )
      assert(
        matching_employee,
        `Matching employee not found ${record.patient_encounter_employee_id} ${record.record_id}`,
      )

      return {
        ...record,
        ...buildValueDisplay(record),
        provider: {
          is_me: matching_employee.id === health_worker_id,
          ...matching_employee,
        },
      }
    },
  )
}

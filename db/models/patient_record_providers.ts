import { assert } from 'std/assert/assert.ts'
import { IdSelection, RenderedPatientEncounter, RenderedRecordProvider, TrxOrDb } from '../../types.ts'
import { groupByUniq } from '../../util/groupBy.ts'
import uniq from '../../util/uniq.ts'
import { patient_encounters } from './patient_encounters.ts'
import { patient_findings } from './patient_findings.ts'
import { patient_evaluations } from './patient_evaluations.ts'
import { patient_procedures } from './patient_procedures.ts'
import { SearchResult } from './_base.ts'

async function hydrateIntermediateRecords<
  IntermediateRecord extends SearchResult<typeof patient_findings>,
>(
  trx: TrxOrDb,
  { records, encounter, health_worker_id }: {
    records: IntermediateRecord[]
    health_worker_id: string | IdSelection
    encounter?: RenderedPatientEncounter
  },
): Promise<
  Array<
    IntermediateRecord & {
      provider: RenderedRecordProvider
    }
  >
>
async function hydrateIntermediateRecords<
  IntermediateRecord extends SearchResult<typeof patient_evaluations | typeof patient_procedures>,
>(
  trx: TrxOrDb,
  { records, encounter, health_worker_id }: {
    records: IntermediateRecord[]
    health_worker_id: string | IdSelection
    encounter?: RenderedPatientEncounter
  },
): Promise<
  Array<
    IntermediateRecord & {
      provider: null | RenderedRecordProvider
    }
  >
>

/**
 * Adds provider and value display, which aren't populated on initial selection from the DB.
 * Fetches the corresponding encounters to do so, which can be skipped if the caller provides
 * an encounter and all the findings are from that encounter.
 */

async function hydrateIntermediateRecords<
  IntermediateRecord extends SearchResult<typeof patient_findings | typeof patient_evaluations | typeof patient_procedures>,
>(
  trx: TrxOrDb,
  { records, encounter, health_worker_id }: {
    records: IntermediateRecord[]
    health_worker_id: string | IdSelection
    encounter?: RenderedPatientEncounter
  },
): Promise<
  Array<
    IntermediateRecord & {
      provider: RenderedRecordProvider | null
    }
  >
> {
  const encounter_id_to_encounter = await getReferencedEncounters()
  return records.map(hydrate)

  async function getReferencedEncounters(): Promise<
    Map<string, RenderedPatientEncounter>
  > {
    const encounter_ids = uniq(
      records.map((record) => record.patient_encounter_id),
    )

    const other_encounter_ids = encounter_ids.filter((encounter_id) => encounter ? encounter_id !== encounter.patient_encounter_id : true)

    const encounters: RenderedPatientEncounter[] = other_encounter_ids.length ? await patient_encounters.getByIds(trx, other_encounter_ids) : []

    if (encounter) {
      encounters.push(encounter)
    }

    return groupByUniq(encounters, 'patient_encounter_id')
  }

  function hydrate(record: IntermediateRecord) {
    const matching_encounter = encounter_id_to_encounter.get(
      record.patient_encounter_id,
    )
    assert(
      matching_encounter,
      `Matching encounter not found ${record.patient_encounter_id} ${record.id}`,
    )

    const matching_employee = matching_encounter.all_employees_seen.find((
      employee,
    ) =>
      record.type === 'finding'
        ? employee.patient_encounter_employee_id === record.patient_encounter_employee_id
        : employee.employee_id === record.employment_id
    )
    assert(
      matching_employee || record.type !== 'finding',
      `Matching employee not found ${record.id}`,
    )

    return {
      ...record,
      provider: matching_employee
        ? {
          ...matching_employee,
          is_me: matching_employee.id === health_worker_id,
        }
        : null,
    }
  }
}

export const patient_record_providers = {
  hydrateIntermediateRecords,
}

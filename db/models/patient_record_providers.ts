import { assert } from 'std/assert/assert.ts'
import { IdSelection, RenderedPatientEncounter, RenderedRecordProvider, TrxOrDbOrQueryCreator } from '../../types.ts'
import { patient_findings } from './patient_findings.ts'
import { patient_evaluations } from './patient_evaluations.ts'
import { patient_procedures } from './patient_procedures.ts'
import { SearchResult } from './_base.ts'
import { patient_encounter_employees } from './patient_encounter_employees.ts'
import compact from '../../util/compact.ts'
import { collapse } from '../helpers.ts'
import { groupByUniq } from '../../util/groupBy.ts'

async function hydrateIntermediateRecords<
  IntermediateRecord extends SearchResult<typeof patient_findings>,
>(
  trx: TrxOrDbOrQueryCreator,
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
  trx: TrxOrDbOrQueryCreator,
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
 * Adds provider, which aren't populated on initial selection from the DB.
 * Fetches the corresponding encounters to do so, which can be skipped if the caller provides
 * an encounter and all the findings are from that encounter.
 */

async function hydrateIntermediateRecords<
  IntermediateRecord extends SearchResult<typeof patient_findings | typeof patient_evaluations | typeof patient_procedures>,
>(
  trx: TrxOrDbOrQueryCreator,
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
  const all_employees = await getAllReferencedEmployees(trx, { encounter, records })
  return records.map(hydrate)

  function hydrate(record: IntermediateRecord) {
    const matching_employee = all_employees.find((
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

type AnyIntermediateRecord = SearchResult<typeof patient_findings> | SearchResult<typeof patient_evaluations> | SearchResult<typeof patient_procedures>

type ReferencedEmployeeQuery = [{
  records: AnyIntermediateRecord[]
  encounter?: RenderedPatientEncounter
}]

const getAllReferencedEmployees = collapse(
  async function getAllReferencedEmployees(
    trx: TrxOrDbOrQueryCreator,
    queries: ReferencedEmployeeQuery[],
  ) {
    const to_look_for = {
      employee_ids: [] as string[],
      employees: [] as { patient_encounter_id: string; employment_id: string }[],
    }

    const encounters_we_already_have = groupByUniq(compact(queries.map(([q]) => q.encounter)), 'patient_encounter_id', { allow_multiple: true })

    for (const [{ records }] of queries) {
      for (const record of records) {
        if (encounters_we_already_have.has(record.patient_encounter_id)) continue

        if (record.type === 'finding') {
          to_look_for.employee_ids.push(record.patient_encounter_employee_id)
          continue
        }
        if (record.employment_id) {
          to_look_for.employees.push({
            patient_encounter_id: record.patient_encounter_id,
            employment_id: record.employment_id,
          })
        }
      }
    }

    const employees_from_other_encounters = to_look_for.employee_ids.length || to_look_for.employees.length
      ? await patient_encounter_employees.baseQuery(trx, {})
        .where((eb) =>
          eb.or(compact([
            to_look_for.employee_ids.length && eb('patient_encounter_employees.id', 'in', to_look_for.employee_ids),
            ...to_look_for.employees.map(({ patient_encounter_id, employment_id }) =>
              eb.and([
                eb('patient_encounter_id', '=', patient_encounter_id),
                eb('employment_id', '=', employment_id),
              ])
            ),
          ]))
        )
        .execute()
      : []

    return [
      ...queries.flatMap(([{ encounter }]) => encounter?.all_employees_seen || []),
      ...employees_from_other_encounters,
    ]
  },
  (employee, params) =>
    params[0].records.some((record) =>
      record.type === 'finding'
        ? employee.patient_encounter_employee_id === record.patient_encounter_employee_id
        : employee.employee_id === record.employment_id
    ),
)

export const patient_record_providers = {
  hydrateIntermediateRecords,
}

import { TrxOrDb } from '../../types.ts'

export async function hydrateIntermediateRecords(
  trx: TrxOrDb,
  { patient_id, encounter, health_worker_id }: {
    records: string
    health_worker_id: string
    encounter?: RenderedPatientEncounter
  },
): Promise<MostRecentBriefHistoryFindings> {
  const most_recent_findings = await mostRecentFindings(trx, { patient_id })

  const most_recent_findings_by_common_condition_key = mapEntries(
    groupBy(most_recent_findings, 'pertaining_to_key'),
    mostRecentFinding,
  )

  const encounter_ids = uniq(
    Object.values(most_recent_findings_by_common_condition_key).flatMap((
      finding,
    ) => [
      finding.patient_encounter_id,
    ]),
  )

  const other_encounter_ids = encounter_ids.filter((encounter_id) =>
    encounter_id !== encounter.patient_encounter_id
  )

  const other_encounters: RenderedPatientEncounter[] =
    other_encounter_ids.length
      ? await patient_encounters.getByIds(trx, other_encounter_ids)
      : []

  const encounters = [encounter, ...other_encounters]
  const encounter_id_to_encounter = groupByUniq(
    encounters,
    'patient_encounter_id',
  )

  const most_recent_all_conditions_raw = fromEntries(
    COMMON_CONDITION_KEYS.map(
      (condition) => [
        condition,
        most_recent_findings_by_common_condition_key[condition],
      ],
    ),
  )

  return mapEntries(
    most_recent_all_conditions_raw,
    (most_recent_finding) => {
      if (!most_recent_finding) return null

      const { patient_encounter_employee_id, ...finding } = most_recent_finding

      const matching_encounter = encounter_id_to_encounter.get(
        finding.patient_encounter_id,
      )
      assert(
        matching_encounter,
        `Matching encounter not found ${finding.patient_encounter_id} ${finding.record_id}`,
      )

      const matching_employee = matching_encounter.all_employees_seen.find((
        employee,
      ) =>
        employee.patient_encounter_employee_id ===
          patient_encounter_employee_id
      )
      assert(
        matching_employee,
        `Matching employee not found ${patient_encounter_employee_id} ${finding.record_id}`,
      )

      return {
        ...finding,
        value_display: buildValueDisplay(finding),
        provider: {
          is_me: matching_employee.id === health_worker_id,
          ...matching_employee,
        },
      } satisfies RenderedFindingRelativeToHealthWorker
    },
  )
}

import type { RenderedPatientExaminationFinding, TrxOrDb } from '../../types.ts'
import { jsonArrayFrom } from '../helpers.ts'
import { assertIsExamination } from '../../shared/examinations.ts'

export async function forPatientEncounter(trx: TrxOrDb, opts: {
  patient_id: string
  encounter_id: string
}): Promise<RenderedPatientExaminationFinding[]> {
  const examinations = await trx.selectFrom('patient_examination_findings')
    .innerJoin(
      'patient_examinations',
      'patient_examination_findings.patient_examination_id',
      'patient_examinations.id',
    )
    .innerJoin(
      'examinations',
      'patient_examinations.examination_name',
      'examinations.name',
    )
    .select((eb) => [
      'examinations.name as examination_name',
      'examinations.path',
      'snomed_code',
      'snomed_english_term',
      'additional_notes',
      jsonArrayFrom(
        eb.selectFrom('patient_examination_finding_body_sites')
          .select([
            'snomed_code',
            'snomed_english_term',
          ]),
      ).as('body_sites'),
    ])
    .orderBy(['examinations.order asc', 'patient_examinations.created_at asc'])
    .execute()

  return examinations.map(({ examination_name, path, ...ex }) => {
    assertIsExamination(examination_name)
    const examination_href =
      `/app/patients/${opts.patient_id}/encounters/${opts.encounter_id}${path}`

    const edit_href = `${examination_href}#edit=${ex.snomed_code}`
    return {
      ...ex,
      examination_name,
      edit_href,
      text: ex.snomed_english_term,
    }
  })
}

// function getFindings(trx: TrxOrDb, examination_name: string) {
//   return trx
//     .selectFrom('examinations')
//     .innerJoin(
//       'examination_categories',
//       'examinations.name',
//       'examination_categories.examination_name',
//     )
//     .innerJoin(
//       'examination_findings',
//       'examination_categories.id',
//       'examination_findings.examination_category_id',
//     )
//     .where('examinations.name', '=', examination_name)
//     .selectAll('examination_findings')
//     .select('category')
//     .execute()
// }

// function assertFindingType(examination_finding: {
//   options: string[] | null
//   required: boolean
//   type: ExaminationFindingType
//   // deno-lint-ignore no-explicit-any
// }, value: any) {
//   assert(value != null, 'Value must be present')
//   switch (examination_finding.type) {
//     case 'boolean': {
//       return assertOr400(
//         value === true || value === false,
//         'Value must be a boolean',
//       )
//     }
//     case 'integer': {
//       return assertOr400(
//         typeof value === 'number' && Math.floor(value) === value,
//         'Value must be a number',
//       )
//     }
//     case 'float': {
//       return assertOr400(typeof value === 'number', 'Value must be a float')
//     }
//     case 'string': {
//       return assertOr400(typeof value === 'string', 'Value must be a string')
//     }
//     case 'date': {
//       return assertOr400(
//         isISODateString(value),
//         'Value must be an ISO date string',
//       )
//     }
//     case 'select':
//     case 'multiselect': {
//       return assertOr400(
//         typeof value === 'string' &&
//           examination_finding.options?.includes(value),
//         `Value must be one of (${examination_finding.options?.join(', ')})`,
//       )
//     }
//     default: {
//       throw new Error(
//         `Unknown examination finding type ${examination_finding.type}`,
//       )
//     }
//   }
// }

// export async function upsertFindings(
//   trx: TrxOrDb,
//   {
//     patient_id,
//     encounter_id,
//     encounter_provider_id,
//     examination_name,
//     skipped,
//     values,
//   }: {
//     patient_id: string
//     encounter_id: string
//     encounter_provider_id: string
//     examination_name: string
//     skipped?: boolean
//     values: Record<string, Record<string, unknown>>
//   },
// ): Promise<void> {
//   const getting_examination_findings = getFindings(trx, examination_name)

//   const updating_patient_examination = trx
//     .insertInto('patient_examinations')
//     .values({
//       examination_name,
//       encounter_id,
//       encounter_provider_id,
//       completed: !skipped,
//       skipped,
//       patient_id: trx.selectFrom('patient_encounters')
//         .where('id', '=', encounter_id)
//         .where('patient_id', '=', patient_id)
//         .select('patient_id'),
//     })
//     .onConflict((oc) =>
//       oc.constraint('patient_examination_unique').doUpdateSet({
//         encounter_provider_id,
//         completed: true,
//       })
//     )
//     .returning('id')
//     .executeTakeFirstOrThrow()

//   const removing = trx
//     .deleteFrom('patient_examination_findings')
//     .where(
//       'patient_examination_id',
//       'in',
//       trx.selectFrom('patient_examinations')
//         .select('id')
//         .where('encounter_id', '=', encounter_id)
//         .where('examination_name', '=', examination_name),
//     )
//     .where('patient_examination_findings.created_at', '<=', now)
//     .execute()

//   const examination_findings = await getting_examination_findings
//   const patient_examination = await updating_patient_examination

//   const required_findings = new Set(
//     examination_findings.filter((f) => f.required),
//   )

//   const patient_findings_to_insert: {
//     patient_examination_id: string
//     examination_finding_id: string
//     // deno-lint-ignore no-explicit-any
//     value: any
//   }[] = []

//   for (const [category, findings] of Object.entries(values)) {
//     for (const [finding_name, value] of Object.entries(findings)) {
//       const examination_finding = examination_findings.find(
//         (f) => f.name === finding_name && f.category === category,
//       )
//       assertOr400(
//         examination_finding,
//         `Finding ${category}.${finding_name} not found`,
//       )
//       assertFindingType(examination_finding, value)
//       // TODO assert dependent values are unanswered if dependent on is unanswered

//       patient_findings_to_insert.push({
//         patient_examination_id: patient_examination.id,
//         examination_finding_id: examination_finding.id,
//         value,
//       })
//       required_findings.delete(examination_finding)
//     }
//   }

//   assertOr400(
//     required_findings.size === 0,
//     `Required findings not found: ${
//       Array.from(required_findings)
//         .map((f) => `${f.category}.${f.name}`)
//         .join(', ')
//     }`,
//   )

//   const adding = patient_findings_to_insert.length && trx
//     .insertInto('patient_examination_findings')
//     .values(patient_findings_to_insert)
//     .execute()

//   await Promise.all([removing, adding])
// }

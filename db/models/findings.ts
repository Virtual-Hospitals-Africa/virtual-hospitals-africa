import type { RenderedPatientExaminationFinding, TrxOrDb } from '../../types.ts'
import { jsonArrayFrom, upsertOne } from '../helpers.ts'
import { assertIsExamination } from '../../shared/examinations.ts'
import { promiseProps } from '../../util/promiseProps.ts'
import { insertConcepts } from './snomed.ts'
import partition from '../../util/partition.ts'

export function baseQuery(trx: TrxOrDb) {
  return trx.selectFrom('patient_examination_findings')
    .innerJoin(
      'patient_examinations',
      'patient_examination_findings.patient_examination_id',
      'patient_examinations.id',
    )
    .innerJoin(
      'patient_encounters',
      'patient_examinations.encounter_id',
      'patient_encounters.id',
    )
    .innerJoin(
      'examinations',
      'patient_examinations.examination_name',
      'examinations.name',
    )
    .innerJoin(
      'snomed_concepts as sc_findings',
      'sc_findings.snomed_concept_id',
      'patient_examination_findings.snomed_concept_id',
    )
    .select((eb) => [
      'examinations.name as examination_name',
      'examinations.path',
      'sc_findings.snomed_concept_id',
      'sc_findings.snomed_english_term',
      'additional_notes',
      'patient_examination_findings.id as patient_examination_finding_id',
      'patient_examination_findings.patient_examination_id',
      'patient_examinations.patient_id',
      'patient_examinations.encounter_id',
      'patient_examinations.encounter_provider_id',
      eb('patient_encounters.closed_at', 'is', null).as('encounter_open'),
      jsonArrayFrom(
        eb.selectFrom('patient_examination_finding_body_sites')
          .whereRef(
            'patient_examination_finding_id',
            '=',
            'patient_examination_findings.id',
          )
          .innerJoin(
            'snomed_concepts as sc_body_sites',
            'sc_body_sites.snomed_concept_id',
            'patient_examination_finding_body_sites.snomed_concept_id',
          )
          .select([
            'patient_examination_finding_body_sites.id as patient_examination_finding_body_site_id',
            'sc_body_sites.snomed_concept_id',
            'sc_body_sites.snomed_english_term',
          ]),
      ).as('body_sites'),
    ])
    .orderBy(['examinations.order asc', 'patient_examinations.created_at asc'])
}

type ExaminationResults = Awaited<
  ReturnType<Awaited<ReturnType<typeof baseQuery>['execute']>>
>

function render(
  examinations: ExaminationResults,
): RenderedPatientExaminationFinding[] {
  return examinations.map(({ examination_name, path, ...ex }) => {
    assertIsExamination(examination_name)
    const examination_href =
      `/app/patients/${ex.patient_id}/encounters/${ex.encounter_id}${path}`

    const edit_href = `${examination_href}#edit=${ex.snomed_concept_id}`
    return {
      ...ex,
      examination_name,
      edit_href,
      text: ex.snomed_english_term,
    }
  })
}

export async function forPatientEncounter(trx: TrxOrDb, opts: {
  patient_id: string
  encounter_id: string
}): Promise<RenderedPatientExaminationFinding[]> {
  const examinations = await baseQuery(trx)
    .where('patient_examinations.encounter_id', '=', opts.encounter_id)
    .where('patient_examinations.patient_id', '=', opts.patient_id)
    .execute()

  return render(examinations)
}

export async function forPatient(trx: TrxOrDb, opts: {
  patient_id: string
}): Promise<{
  open: RenderedPatientExaminationFinding[]
  past: RenderedPatientExaminationFinding[]
}> {
  const examinations = await baseQuery(trx)
    .where('patient_examinations.patient_id', '=', opts.patient_id)
    .execute()

  const rendered = render(examinations)

  const [open, past] = partition(rendered, (ex) => !!ex.encounter_open)
  return { open, past }
}

export async function upsertForPatientExamination(
  trx: TrxOrDb,
  {
    patient_id,
    encounter_id,
    encounter_provider_id,
    examination_name,
    findings,
    patient_examination_id,
  }: {
    patient_id: string
    encounter_id: string
    encounter_provider_id: string
    examination_name: string
    patient_examination_id: string
    findings: {
      patient_examination_finding_id: string
      snomed_concept_id: number
      snomed_english_term: string
      additional_notes: string | null
      body_sites?: {
        patient_examination_finding_body_site_id: string
        snomed_concept_id: number
        snomed_english_term: string
      }[]
    }[]
  },
) {
  const result = await promiseProps({
    deleting_other_findings: trx.deleteFrom('patient_examination_findings')
      .where('patient_examination_id', '=', patient_examination_id)
      .$if(
        findings.length > 0,
        (qb) =>
          qb.where(
            'id',
            'not in',
            findings.map((f) => f.patient_examination_finding_id),
          ),
      )
      .execute(),
    snomed_concepts: insertConcepts(
      trx,
      findings.flatMap((finding) => {
        const body_sites = (finding.body_sites || []).map((body_site) => ({
          snomed_concept_id: body_site.snomed_concept_id,
          snomed_english_term: body_site.snomed_english_term,
        }))
        return [{
          snomed_concept_id: finding.snomed_concept_id,
          snomed_english_term: finding.snomed_english_term,
        }, ...body_sites]
      }),
    ),
    examination: upsertOne(trx, 'patient_examinations', {
      patient_id,
      encounter_id,
      encounter_provider_id,
      examination_name,
      id: patient_examination_id,
      completed: true,
    }),
    findings: Promise.all(
      findings.map((finding) =>
        upsertOne(trx, 'patient_examination_findings', {
          id: finding.patient_examination_finding_id,
          patient_examination_id: patient_examination_id,
          snomed_concept_id: finding.snomed_concept_id,
          additional_notes: finding.additional_notes,
        })
      ),
    ),
    body_sites: Promise.all(
      findings.flatMap((finding) =>
        (finding.body_sites || []).map((body_site) =>
          upsertOne(trx, 'patient_examination_finding_body_sites', {
            id: body_site.patient_examination_finding_body_site_id,
            patient_examination_finding_id:
              finding.patient_examination_finding_id,
            snomed_concept_id: body_site.snomed_concept_id,
          })
        )
      ),
    ),
  })

  return {
    examination: result.examination,
    findings: result.findings,
    body_sites: result.body_sites,
  }
}

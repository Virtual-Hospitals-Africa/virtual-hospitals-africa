import { assert } from 'std/assert/assert.ts'
import { PatientFindings } from '../../db.d.ts'
import {
  relation_from_snomed_id,
  SEXED_RELATION_SNOMED_CONCEPT_IDS,
} from '../../shared/family.ts'
import {
  InsertShape,
  PatientFamilyHistoryUpsert,
  RenderedPatientFamilyHistory,
  TrxOrDb,
} from '../../types.ts'
import pick from '../../util/pick.ts'
import generateUUID from '../../util/uuid.ts'
import { blankSelection, jsonArrayFrom, success_true } from '../helpers.ts'
import { markAltered, nowInvalidRecords } from './patient_records.ts'

export const PATIENT_FAMILY_HISTORY_TAKING_SNOMED_CONCEPT_ID = '410551005'

// TODO: get this into a single round trip with the DB
export async function upsertOne(
  trx: TrxOrDb,
  {
    patient_id,
    patient_encounter_id,
    employment_id,
    patient_encounter_employee_id,
    family_history,
  }: {
    patient_id: string
    patient_encounter_id: string
    employment_id: string
    patient_encounter_employee_id: string
    family_history: PatientFamilyHistoryUpsert
  },
) {
  const {
    altered_patient_family_history_id,
    snomed_concept_id,
    // TODO use this and other fields related
    // relation_sexed,
  } = family_history

  assert(family_history.family_members.length)

  const existing_procedure = await trx.selectFrom('patient_records')
    .innerJoin(
      'patient_procedures',
      'patient_records.id',
      'patient_procedures.id',
    )
    .where(
      'patient_records.patient_id',
      '=',
      patient_id,
    )
    .where(
      'patient_records.patient_encounter_id',
      '=',
      patient_encounter_id,
    )
    .where(
      'patient_records.snomed_concept_id',
      '=',
      PATIENT_FAMILY_HISTORY_TAKING_SNOMED_CONCEPT_ID,
    )
    .select(['patient_procedures.id'])
    .executeTakeFirst()

  const procedure_id = existing_procedure?.id || generateUUID()

  if (altered_patient_family_history_id) {
    await markAltered(trx, {
      patient_id,
      patient_encounter_id,
      procedure_id,
      employment_id,
      altered_record_id: altered_patient_family_history_id,
    })
  }

  const family_history_id = generateUUID()
  const { family_members } = family_history
  const family_members_insert: Array<
    {
      patient_id: string
      patient_encounter_id: string
      snomed_concept_id: string
    } & InsertShape<PatientFindings>
  > = family_members
    .map((member) => {
      const id = generateUUID()
      assert(member.relation_sexed in SEXED_RELATION_SNOMED_CONCEPT_IDS)
      const snomed_concept_id =
        SEXED_RELATION_SNOMED_CONCEPT_IDS[member.relation_sexed]

      return {
        id,
        patient_id,
        patient_encounter_id,
        snomed_concept_id,
        procedure_id,
        patient_encounter_employee_id,
      }
    })

  return trx.with(
    'inserting_procedure_record',
    (qb) =>
      !existing_procedure
        ? qb.insertInto('patient_records')
          .values({
            id: procedure_id,
            patient_id,
            patient_encounter_id,
            snomed_concept_id: PATIENT_FAMILY_HISTORY_TAKING_SNOMED_CONCEPT_ID,
          })
        : blankSelection(qb),
  ).with(
    'inserting_procedure',
    (qb) =>
      !existing_procedure
        ? qb.insertInto('patient_procedures')
          .values({
            id: procedure_id,
            employment_id,
            by_system: false,
          })
        : blankSelection(qb),
  ).with('inserting_finding_records', (qb) =>
    qb.insertInto('patient_records')
      .values({
        id: family_history_id,
        patient_id,
        patient_encounter_id,
        snomed_concept_id,
      })).with('inserting_findings', (qb) =>
      qb.insertInto('patient_findings')
        .values({
          id: family_history_id,
          procedure_id,
          patient_encounter_employee_id,
        }))
    .with(
      'inserting_family_member_records',
      (qb) =>
        qb.insertInto('patient_records')
          .values(
            family_members_insert.map(
              pick([
                'id',
                'patient_id',
                'patient_encounter_id',
                'snomed_concept_id',
              ]),
            ),
          ),
    ).with('inserting_family_members', (qb) =>
      qb.insertInto('patient_findings')
        .values(family_members_insert.map(
          pick([
            'id',
            'procedure_id',
            'patient_encounter_employee_id',
          ]),
        )))
    .with(
      'inserting_family_member_relations',
      (qb) =>
        qb.insertInto('patient_record_relations')
          .values(family_members_insert.map((member) => ({
            id: member.id,
            source_id: member.id,
            destination_id: family_history_id,
          }))),
    )
    .selectNoFrom([
      success_true,
    ])
    .executeTakeFirstOrThrow()
}

export async function getEncounter(
  trx: TrxOrDb,
  { patient_id, patient_encounter_id }: {
    patient_id: string
    patient_encounter_id: string
  },
): Promise<RenderedPatientFamilyHistory[]> {
  const results = await trx
    .selectFrom('patient_records')
    .innerJoin(
      'patient_findings',
      'patient_findings.id',
      'patient_records.id',
    )
    .innerJoin(
      'snomed_inferred_canonical_name_and_category',
      'patient_records.snomed_concept_id',
      'snomed_inferred_canonical_name_and_category.id',
    )
    .where('patient_records.patient_id', '=', patient_id)
    .where('patient_records.patient_encounter_id', '=', patient_encounter_id)
    .where(
      'patient_records.id',
      'not in',
      nowInvalidRecords(trx, { patient_id }),
    )
    .selectAll('patient_records')
    .select((eb) => [
      'patient_findings.id',
      'patient_records.snomed_concept_id',
      'snomed_inferred_canonical_name_and_category.name',
      jsonArrayFrom(
        eb.selectFrom('patient_records as family_member_patient_records')
          .innerJoin(
            'patient_findings as family_member_patient_findings',
            'family_member_patient_findings.id',
            'family_member_patient_records.id',
          )
          .innerJoin(
            'patient_record_relations',
            'patient_record_relations.source_id',
            'family_member_patient_records.id',
          )
          .innerJoin(
            'snomed_inferred_canonical_name_and_category',
            'family_member_patient_records.snomed_concept_id',
            'snomed_inferred_canonical_name_and_category.id',
          )
          .select([
            'family_member_patient_records.id',
            'family_member_patient_records.snomed_concept_id',
            'snomed_inferred_canonical_name_and_category.name',
          ])
          .where(
            'snomed_inferred_canonical_name_and_category.category',
            '=',
            'person',
          )
          .whereRef(
            'patient_record_relations.destination_id',
            '=',
            'patient_records.id',
          ),
      ).as('family_members'),
    ]).execute()
  return results.map((r) => ({
    ...r,
    family_members: r.family_members.map((fm) => ({
      relation_sexed: relation_from_snomed_id(fm.snomed_concept_id),
      condition_name: fm.name,
      altered_family_member_id: fm.id,
      snomed_concept_id: fm.snomed_concept_id,
    })),
  }))
}

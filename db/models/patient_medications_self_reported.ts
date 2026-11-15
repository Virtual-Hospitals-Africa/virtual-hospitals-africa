import { sql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import type { InsertRows, RenderedSelfReportedMedication, TrxOrDbOrQueryCreator } from '../../types.ts'
import type { SnomedCategory } from '../../db.d.ts'
import generateUUID from '../../util/uuid.ts'
import isString from '../../util/isString.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { asText, blankSelection, jsonArrayFrom, jsonObjectFrom } from '../helpers.ts'
import { base } from './_base.ts'
import {
  ATTRIBUTE,
  DATE_TREATMENT_STARTED,
  DOSAGE,
  DUE_TO,
  DURATION,
  EVENT,
  FREQUENCY,
  HAS_MANUFACTURED_DOSE_FORM,
  HAS_STRENGTH,
  RELATIONSHIP,
  ROUTE_OF_ADMINISTRATION,
  TAKING_MEDICATION,
} from '../../shared/snomed_concepts.ts'
import {
  Medication,
  medicationDisplay,
  MedicationMeasurement,
  MedicationSnomedConcept,
  medicationToSExpression,
  parseMedicationSExpression,
} from '../../shared/medication_s_expression.ts'

/*
  A self-reported medication is one the patient told us they are taking. It is a patient_records
  row (root "Taking medication", specific = the medicinal product) that is

    - a patient_medications row, with the manufactured (brand) medication when known
    - a patient_findings row, because it was reported to us

  When the patient said what they take it for, it is also the source of a "Due to"
  patient_record_relations row whose destination is the record of that condition. Form, route,
  strength, dosage, frequency, duration and start date are attribute records qualifying the
  medication, written only when given; notes go in patient_records.notes.
*/

type MedicationSearch = {
  patient_id?: string
  patient_encounter_id?: string
  include_invalid?: boolean
}

type AttributeValue =
  | { type: 'snomed_concept'; snomed_concept_id: string; name: string; category: SnomedCategory }
  | { type: 'measurement'; value: string | number; units: string }
  | { type: 'event'; datetime: string }

function isAttributeValue(value: unknown): value is AttributeValue {
  return !!value && typeof value === 'object' && 'type' in value &&
    (value.type === 'snomed_concept' || value.type === 'measurement' || value.type === 'event')
}

function baseQuery(
  trx: TrxOrDbOrQueryCreator,
  { patient_id, patient_encounter_id, include_invalid }: MedicationSearch,
) {
  return trx.selectFrom('patient_medications')
    .innerJoin('patient_findings as medication_findings', 'medication_findings.id', 'patient_medications.id')
    .innerJoin('patient_records', 'patient_records.id', 'patient_medications.id')
    .innerJoin('patient_records_aggregated as medication_records', 'medication_records.id', 'patient_medications.id')
    .leftJoin('medications', 'medications.id', 'patient_medications.medication_id')
    .$if(
      !include_invalid,
      (qb) => qb.innerJoin('patient_records_still_valid', 'patient_records_still_valid.id', 'patient_medications.id'),
    )
    .$if(!!patient_id, (qb) => qb.where('patient_records.patient_id', '=', patient_id!))
    .$if(!!patient_encounter_id, (qb) => qb.where('patient_records.patient_encounter_id', '=', patient_encounter_id!))
    .select((eb) => [
      'patient_medications.id',
      'patient_medications.medication_id',
      'medications.trade_name as brand_name',
      'patient_records.notes',
      'patient_records.created_at',
      'patient_records.patient_id',
      'patient_records.patient_encounter_id',
      'medication_records.specific_snomed_concept_name',
      'medication_records.specific_snomed_concept_category',
      // What the patient takes it for, so long as that record still stands
      jsonObjectFrom(
        eb.selectFrom('patient_record_relations')
          .innerJoin(
            'patient_records as relation_records',
            (join) =>
              join.onRef('relation_records.id', '=', 'patient_record_relations.id')
                .on('relation_records.specific_snomed_concept_id', '=', DUE_TO.id),
          )
          .innerJoin('patient_records_still_valid as due_to_valid', 'due_to_valid.id', 'patient_record_relations.destination_id')
          .innerJoin('patient_records_aggregated as due_to_records', 'due_to_records.id', 'patient_record_relations.destination_id')
          .whereRef('patient_record_relations.source_id', '=', 'patient_medications.id')
          .select([
            'due_to_records.id as record_id',
            'due_to_records.specific_snomed_concept_name as name',
            'due_to_records.specific_snomed_concept_category as category',
          ])
          .limit(1),
      ).as('due_to'),
      jsonArrayFrom(
        eb.selectFrom('patient_record_qualifiers')
          .innerJoin('patient_records_aggregated as attribute_records', 'attribute_records.id', 'patient_record_qualifiers.id')
          .whereRef('patient_record_qualifiers.qualifies_record_id', '=', 'patient_medications.id')
          .select((eb_attributes) => [
            asText(eb_attributes, 'attribute_records.specific_snomed_concept_id').as('attribute_snomed_concept_id'),
            'attribute_records.value',
          ])
          // Attributes are written with increasing created_at so that repeated ones (strength) keep their order
          .orderBy('attribute_records.created_at', 'asc'),
      ).as('attributes'),
    ])
    .orderBy('patient_records.created_at', 'asc')
    .orderBy('patient_medications.id', 'asc')
}

type Intermediate = Awaited<ReturnType<ReturnType<typeof baseQuery>['executeTakeFirstOrThrow']>>

function asMedication(result: Intermediate): Medication {
  const attributes = result.attributes.map(({ attribute_snomed_concept_id, value }) => {
    assert(isAttributeValue(value), `Unexpected medication attribute value ${JSON.stringify(value)}`)
    return { attribute_snomed_concept_id, value }
  })

  function concept(attribute_id: string): MedicationSnomedConcept | null {
    const attribute = attributes.find((a) => a.attribute_snomed_concept_id === attribute_id)
    if (!attribute) return null
    assert(attribute.value.type === 'snomed_concept')
    return { name: attribute.value.name, category: attribute.value.category }
  }

  function measurements(attribute_id: string): MedicationMeasurement[] {
    return attributes.filter((a) => a.attribute_snomed_concept_id === attribute_id).map(({ value }) => {
      assert(value.type === 'measurement')
      return { value: Number(value.value), units: value.units }
    })
  }

  const started = attributes.find((a) => a.attribute_snomed_concept_id === DATE_TREATMENT_STARTED.id)
  assert(!started || started.value.type === 'event')

  return {
    snomed_concept: {
      name: result.specific_snomed_concept_name,
      category: result.specific_snomed_concept_category,
    },
    form: concept(HAS_MANUFACTURED_DOSE_FORM.id),
    route: concept(ROUTE_OF_ADMINISTRATION.id),
    strengths: measurements(HAS_STRENGTH.id),
    dosage: measurements(DOSAGE.id).find(() => true) ?? null,
    frequency: concept(FREQUENCY.id),
    duration: measurements(DURATION.id).find(() => true) ?? null,
    // Stored at noon UTC, see startedDatetime
    started: started && started.value.type === 'event' ? new Date(started.value.datetime).toISOString().slice(0, 10) : null,
    taken_for: result.due_to && { name: result.due_to.name, category: result.due_to.category },
    medication_id: result.medication_id,
    notes: result.notes,
  }
}

function formatResult(result: Intermediate): RenderedSelfReportedMedication {
  const medication = asMedication(result)
  return {
    id: result.id,
    patient_id: result.patient_id,
    patient_encounter_id: result.patient_encounter_id,
    created_at: result.created_at,
    s_expression: medicationToSExpression(medication),
    display: medicationDisplay(medication),
    brand_name: result.brand_name,
    due_to: result.due_to,
  }
}

// A date has no timezone. Noon UTC is the same calendar day in every timezone we operate in.
function startedDatetime(started: string) {
  return `${started}T12:00:00Z`
}

/*
  The record of the condition the patient takes a medication for: their most recent standing
  finding or evaluation (a diagnosis, say) of that concept which says they have it.
*/
function takenForRecord(
  trx: TrxOrDbOrQueryCreator,
  { patient_id, taken_for }: { patient_id: string; taken_for: MedicationSnomedConcept },
) {
  return trx.selectFrom('patient_records_aggregated')
    .innerJoin('patient_records_still_valid', 'patient_records_still_valid.id', 'patient_records_aggregated.id')
    .where('patient_records_aggregated.patient_id', '=', patient_id)
    .where('patient_records_aggregated.specific_snomed_concept_name', '=', taken_for.name)
    .where('patient_records_aggregated.specific_snomed_concept_category', '=', taken_for.category)
    .where('patient_records_aggregated.existence', '=', 'Yes')
    .where((eb) =>
      eb.or([
        eb.exists(eb.selectFrom('patient_findings').whereRef('patient_findings.id', '=', 'patient_records_aggregated.id').select('patient_findings.id')),
        eb.exists(
          eb.selectFrom('patient_evaluations').whereRef('patient_evaluations.id', '=', 'patient_records_aggregated.id').select('patient_evaluations.id'),
        ),
      ])
    )
    .orderBy('patient_records_aggregated.created_at', 'desc')
    .select('patient_records_aggregated.id')
    .limit(1)
    .executeTakeFirst()
}

type InsertOne = {
  patient_id: string
  patient_encounter_id: string
  // Who the medication was reported to, and the procedure during which it was
  patient_encounter_employee_id: string
  procedure_id: string
  medication_s_expression: string | Medication
  id?: string
}

/*
  Inserts everything about one medication in a single statement, as the trigger that fills
  patient_records_aggregated needs the measurement and event rows to exist in the same
  statement as their patient_records row.

  A medication said to be taken for a condition must be for one the patient is on record as
  having: record the condition first. That is a 400 otherwise, rather than a medication
  quietly related to nothing.
*/
async function insertOne(
  trx: TrxOrDbOrQueryCreator,
  { patient_id, patient_encounter_id, patient_encounter_employee_id, procedure_id, medication_s_expression, id = generateUUID() }: InsertOne,
) {
  let medication: Medication
  if (isString(medication_s_expression)) {
    const parsed = parseMedicationSExpression(medication_s_expression)
    assertOr400(parsed.ok, parsed.ok ? '' : parsed.error)
    medication = parsed.value
  } else {
    medication = medication_s_expression
  }

  const taken_for_record = medication.taken_for && await takenForRecord(trx, { patient_id, taken_for: medication.taken_for })
  assertOr400(
    !medication.taken_for || taken_for_record,
    `The patient has no record of ${medication.taken_for?.name} for a medication to be taken for`,
  )

  const snomedConceptId = ({ name, category }: MedicationSnomedConcept) =>
    trx.selectFrom('snomed_inferred_canonical_name_and_category')
      .where('name', '=', name)
      .where('category', '=', category)
      .select('id')

  const record_rows: InsertRows<'patient_records'> = [{
    id,
    patient_id,
    patient_encounter_id,
    root_snomed_concept_id: TAKING_MEDICATION.id,
    specific_snomed_concept_id: snomedConceptId(medication.snomed_concept),
    notes: medication.notes,
  }]
  const relation_rows: InsertRows<'patient_record_relations'> = []
  const attribute_links: InsertRows<'patient_record_qualifiers'> = []
  const measurement_rows: InsertRows<'patient_measurements'> = []
  const event_rows: InsertRows<'patient_events'> = []

  if (taken_for_record) {
    const relation_id = generateUUID()
    record_rows.push({
      id: relation_id,
      patient_id,
      patient_encounter_id,
      root_snomed_concept_id: RELATIONSHIP.id,
      specific_snomed_concept_id: DUE_TO.id,
    })
    relation_rows.push({ id: relation_id, source_id: id, destination_id: taken_for_record.id })
  }

  function addAttribute(
    attribute: { id: string },
    opts: { root_snomed_concept_id?: string; value?: MedicationSnomedConcept } = {},
  ) {
    const attribute_id = generateUUID()
    record_rows.push({
      id: attribute_id,
      patient_id,
      patient_encounter_id,
      root_snomed_concept_id: opts.root_snomed_concept_id ?? ATTRIBUTE.id,
      specific_snomed_concept_id: attribute.id,
      value_snomed_concept_id: opts.value ? snomedConceptId(opts.value) : null,
      // Increasing, so attributes read back in the order they were given. Kysely has no builder for interval arithmetic.
      created_at: sql<Date>`now() + ${attribute_links.length + 1} * interval '1 microsecond'`,
    })
    attribute_links.push({ id: attribute_id, qualifies_record_id: id })
    return attribute_id
  }

  function addMeasurement(attribute: { id: string }, { value, units }: MedicationMeasurement) {
    measurement_rows.push({ id: addAttribute(attribute), value, units })
  }

  if (medication.form) addAttribute(HAS_MANUFACTURED_DOSE_FORM, { value: medication.form })
  if (medication.route) addAttribute(ROUTE_OF_ADMINISTRATION, { value: medication.route })
  for (const strength of medication.strengths) addMeasurement(HAS_STRENGTH, strength)
  if (medication.dosage) addMeasurement(DOSAGE, medication.dosage)
  if (medication.frequency) addAttribute(FREQUENCY, { value: medication.frequency })
  if (medication.duration) addMeasurement(DURATION, medication.duration)
  if (medication.started) {
    event_rows.push({
      id: addAttribute(DATE_TREATMENT_STARTED, { root_snomed_concept_id: EVENT.id }),
      datetime: startedDatetime(medication.started),
    })
  }

  return trx
    .with('inserting_records', (qb) => qb.insertInto('patient_records').values(record_rows).returning('id'))
    .with('inserting_finding', (qb) => qb.insertInto('patient_findings').values({ id, patient_encounter_employee_id, procedure_id }))
    .with('inserting_medication', (qb) => qb.insertInto('patient_medications').values({ id, medication_id: medication.medication_id }))
    .with('inserting_relation', (qb) => relation_rows.length ? qb.insertInto('patient_record_relations').values(relation_rows) : blankSelection(qb))
    .with('inserting_attribute_links', (qb) => attribute_links.length ? qb.insertInto('patient_record_qualifiers').values(attribute_links) : blankSelection(qb))
    .with('inserting_measurements', (qb) => measurement_rows.length ? qb.insertInto('patient_measurements').values(measurement_rows) : blankSelection(qb))
    .with('inserting_events', (qb) => event_rows.length ? qb.insertInto('patient_events').values(event_rows) : blankSelection(qb))
    .selectFrom('inserting_records')
    .where('inserting_records.id', '=', id)
    .select('inserting_records.id')
    .executeTakeFirstOrThrow()
}

export const patient_medications_self_reported = base({
  top_level_table: 'patient_medications',
  baseQuery,
  formatResult,
  insertOne,
})

import { TrxOrDb } from '../../types.ts'
import { sql } from 'kysely'
import {
  ParsedExpression,
  ParsedFindingExpression,
  ParsedQualifierExpression,
  parseExpression,
} from './simple_record_language.ts'

type SatisfyingResult = {
  satisfies: boolean
  record_ids: string[]
}

/**
 * Evaluates an s_expression against patient findings to determine if the condition is satisfied.
 *
 * Supported expressions:
 * - (finding <snomed_concept_id>) - checks if a finding with this concept exists
 * - (finding <snomed_concept_id> (qualifier <qualifier_snomed_concept_id>)) - checks if a finding with qualifier exists
 * - (not <expression>) - negates the result
 */
export function satisfyingSExpression(
  trx: TrxOrDb,
  { patient_id, s_expression }: {
    patient_id: string
    s_expression: string
  },
): Promise<SatisfyingResult> {
  const parsed = parseExpression(s_expression)
  return evaluateExpression(trx, patient_id, parsed)
}

function evaluateExpression(
  trx: TrxOrDb,
  patient_id: string,
  parsed: ParsedExpression,
): Promise<SatisfyingResult> {
  switch (parsed.type) {
    case 'finding':
      return evaluateFinding(trx, patient_id, parsed)
    case 'not':
      return evaluateNot(trx, patient_id, parsed.expression)
    case 'qualifier':
      throw new Error('Top-level qualifier expressions are not supported')
  }
}

async function evaluateFinding(
  trx: TrxOrDb,
  patient_id: string,
  parsed: ParsedFindingExpression,
): Promise<SatisfyingResult> {
  const { snomed_concept_id, qualifiers } = parsed

  // Extract qualifier snomed_concept_ids (only positive qualifiers, not 'not' expressions)
  const qualifier_snomed_concept_ids: string[] = []
  for (const q of qualifiers) {
    if (q.type === 'qualifier') {
      qualifier_snomed_concept_ids.push(q.snomed_concept_id)
    }
  }

  // Build query to find matching patient findings
  if (qualifier_snomed_concept_ids.length === 0) {
    // Simple case: no qualifiers
    const results = await trx
      .selectFrom('patient_findings')
      .innerJoin(
        'patient_records',
        'patient_findings.id',
        'patient_records.id',
      )
      .where('patient_records.patient_id', '=', patient_id)
      .where('patient_records.snomed_concept_id', '=', snomed_concept_id)
      .select('patient_records.id as record_id')
      .execute()

    return {
      satisfies: results.length > 0,
      record_ids: results.map((r) => r.record_id),
    }
  }

  // With qualifiers: use EXISTS subqueries for each qualifier
  let query = trx
    .selectFrom('patient_findings')
    .innerJoin('patient_records', 'patient_findings.id', 'patient_records.id')
    .where('patient_records.patient_id', '=', patient_id)
    .where('patient_records.snomed_concept_id', '=', snomed_concept_id)
    .select('patient_records.id as record_id')

  for (const qualifier_id of qualifier_snomed_concept_ids) {
    query = query.where((eb) =>
      eb.exists(
        eb.selectFrom('patient_record_qualifiers')
          .innerJoin(
            'patient_records as qr',
            'patient_record_qualifiers.id',
            'qr.id',
          )
          .whereRef(
            'patient_record_qualifiers.qualifies_record_id',
            '=',
            'patient_findings.id',
          )
          .where('qr.snomed_concept_id', '=', qualifier_id)
          .select(sql`1`.as('one')),
      )
    )
  }

  const results = await query.execute()

  return {
    satisfies: results.length > 0,
    record_ids: results.map((r) => r.record_id),
  }
}

async function evaluateNot(
  trx: TrxOrDb,
  patient_id: string,
  inner: ParsedFindingExpression | ParsedQualifierExpression,
): Promise<SatisfyingResult> {
  if (inner.type === 'qualifier') {
    throw new Error('(not (qualifier ...)) is not supported at top level')
  }

  const inner_result = await evaluateFinding(trx, patient_id, inner)

  return {
    satisfies: !inner_result.satisfies,
    // For (not ...), we return empty record_ids when satisfied
    // because the condition is satisfied by the absence of records
    record_ids: [],
  }
}

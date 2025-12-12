import { TrxOrDb } from '../../types.ts'
import s_expression from 's-expression'
import { assert } from 'std/assert/assert.ts'
import { sql } from 'kysely'

type SExpressionNode = string | SExpressionNode[]

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
  { patient_id, s_expression: s_expression_str }: {
    patient_id: string
    s_expression: string
  },
): Promise<SatisfyingResult> {
  const parsed = s_expression(s_expression_str)
  if (parsed instanceof Error) {
    throw parsed
  }

  return evaluateExpression(trx, patient_id, parsed)
}

function evaluateExpression(
  trx: TrxOrDb,
  patient_id: string,
  node: SExpressionNode,
): Promise<SatisfyingResult> {
  assert(Array.isArray(node), 'Expected array node')
  const [type, ...rest] = node

  switch (type) {
    case 'finding':
      return evaluateFinding(trx, patient_id, rest)
    case 'not':
      return evaluateNot(trx, patient_id, rest)
    default:
      throw new Error(`Unknown expression type: ${type}`)
  }
}

async function evaluateFinding(
  trx: TrxOrDb,
  patient_id: string,
  args: SExpressionNode[],
): Promise<SatisfyingResult> {
  const [snomed_concept_id, ...qualifier_nodes] = args
  assert(
    typeof snomed_concept_id === 'string',
    'Expected snomed_concept_id to be a string',
  )

  // Extract qualifier snomed_concept_ids from (qualifier <id>) nodes
  const qualifier_snomed_concept_ids: string[] = []
  for (const node of qualifier_nodes) {
    if (Array.isArray(node) && node[0] === 'qualifier') {
      const qualifier_id = node[1]
      assert(
        typeof qualifier_id === 'string',
        'Expected qualifier snomed_concept_id to be a string',
      )
      qualifier_snomed_concept_ids.push(qualifier_id)
    }
  }

  // Build query to find matching patient findings
  // Use raw SQL for the dynamic qualifier joins to avoid type issues
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

  const results = await query
    .select('patient_records.id as record_id')
    .execute()

  return {
    satisfies: results.length > 0,
    record_ids: results.map((r) => r.record_id),
  }
}

async function evaluateNot(
  trx: TrxOrDb,
  patient_id: string,
  args: SExpressionNode[],
): Promise<SatisfyingResult> {
  assert(args.length === 1, 'Expected exactly one argument to (not ...)')
  const inner = args[0]
  assert(Array.isArray(inner), 'Expected array inside (not ...)')

  const inner_result = await evaluateExpression(trx, patient_id, inner)

  return {
    satisfies: !inner_result.satisfies,
    // For (not ...), we return empty record_ids when satisfied
    // because the condition is satisfied by the absence of records
    record_ids: [],
  }
}

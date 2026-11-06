import { assert } from 'std/assert/assert.ts'
import { TrxOrDbOrQueryCreator } from '../../types.ts'
import { buildExpression } from './s_expression.ts'
import { literalString } from '../helpers.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { Lang, MeasurementComparison, QueryableEvidenceNode } from '../../shared/s_expression_schemas.ts'

export type EvidenceNode = Lang['finding' | 'evaluation' | 'diagnosis' | 'active_condition'] | MeasurementComparison

export function* allEvidenceToLookFor(node: QueryableEvidenceNode): Generator<EvidenceNode> {
  switch (node.atom) {
    case 'finding':
    case 'evaluation':
    case 'diagnosis':
    case 'active_condition':
      yield node
      break
    case '<':
    case '<=':
    case '=':
    case '>':
    case '>=':
      if (node.type === 'measurement') {
        yield node
      }
      break
    case 'or':
    case 'and':
    case 'any2':
      for (const expression of node.expressions) {
        yield* allEvidenceToLookFor(expression)
      }
      break
    default:
      throw new Error(`Not supported ${node.atom}`)
  }
}


export function* allPositiveEvidenceToLookFor(node: QueryableEvidenceNode): Generator<EvidenceNode> {
  for (const evidence of allEvidenceToLookFor(node)) {
    yield (
      'existence' in evidence && evidence.existence === 'No'
        ? { ...evidence, existence: 'Yes', value_snomed_concept: null }
        : evidence
    )
  }
}
type Result =
  | { satisfies: true; contributing_records: string[] }
  | { satisfies: false }

export const s_expression_evidence = {
  async evaluateMultiple(
    trx: TrxOrDbOrQueryCreator,
    patient: { patient_id: string; patient_encounter_id?: string | null },
    nodes: QueryableEvidenceNode[],
  ): Promise<Map<QueryableEvidenceNode, Result>> {
    // Collect all leaf evidence nodes across every node, keyed by object identity
    const evidence_to_s_expr = new Map<EvidenceNode, string>()
    for (const node of nodes) {
      for (const evidence of allEvidenceToLookFor(node)) {
        evidence_to_s_expr.set(evidence, inverseSExpression(evidence))
      }
    }

    // Deduplicate by s-expression string
    const unique_evidence = new Map<string, EvidenceNode>()
    for (const [evidence, s_expr] of evidence_to_s_expr) {
      if (!unique_evidence.has(s_expr)) unique_evidence.set(s_expr, evidence)
    }

    // Single round trip across all nodes combined
    const findings_map = new Map<string, string[]>()
    const entries = [...unique_evidence.entries()]
    if (entries.length > 0) {
      const [first, ...rest] = entries.map(([s_expr, evidence]) =>
        trx.selectFrom(
          buildExpression(trx, patient, evidence).as('sub'),
        ).select([
          literalString(s_expr).as('s_expr'),
          'sub.id',
        ])
      )
      const query = rest.reduce((acc, curr) => acc.unionAll(curr), first)
      for (const row of await query.execute()) {
        const ids = findings_map.get(row.s_expr) ?? []
        ids.push(row.id)
        findings_map.set(row.s_expr, ids)
      }
    }

    const results = new Map<QueryableEvidenceNode, Result>()
    for (const node of nodes) {
      results.set(node, evaluateEvidence(node))
    }
    return results

    function evaluateEvidence(evidence: QueryableEvidenceNode): Result {
      switch (evidence.atom) {
        case 'or': {
          const contributing_records: string[] = []
          let any_true = false
          for (const expr of evidence.expressions) {
            const result = evaluateEvidence(expr)
            if (result.satisfies) {
              any_true = true
              contributing_records.push(...result.contributing_records)
            }
          }
          if (any_true) return { satisfies: true, contributing_records }
          return { satisfies: false }
        }

        case 'and': {
          const contributing_records: string[] = []
          for (const expr of evidence.expressions) {
            const result = evaluateEvidence(expr)
            if (!result.satisfies) return { satisfies: false }
            contributing_records.push(...result.contributing_records)
          }
          return { satisfies: true, contributing_records }
        }

        case 'any2': {
          const contributing_records: string[] = []
          let true_count = 0
          for (const expr of evidence.expressions) {
            const result = evaluateEvidence(expr)
            if (result.satisfies) {
              true_count++
              contributing_records.push(...result.contributing_records)
            }
          }
          if (true_count >= 2) return { satisfies: true, contributing_records }
          return { satisfies: false }
        }

        case 'finding':
        case 'evaluation':
        case 'diagnosis':
        case 'active_condition':
          return evaluateSingle(evidence)

        case '<':
        case '<=':
        case '=':
        case '>':
        case '>=': {
          if (evidence.type === 'measurement') return evaluateSingle(evidence)
          return { satisfies: false }
        }

        default:
          throw new Error(`Not supported ${(evidence as QueryableEvidenceNode).atom}`)
      }
    }

    function evaluateSingle(evidence: EvidenceNode): Result {
      const s_expr = evidence_to_s_expr.get(evidence)
      assert(s_expr != null)
      const record_ids = findings_map.get(s_expr) ?? []
      if (record_ids.length > 0) {
        return { satisfies: true, contributing_records: record_ids }
      }
      return { satisfies: false }
    }
  },
  async evaluate(
    trx: TrxOrDbOrQueryCreator,
    patient: { patient_id: string; patient_encounter_id?: string | null },
    node: QueryableEvidenceNode,
  ): Promise<Result> {
    // Collect all leaf evidence nodes, mapping each to its canonical s-expression string.
    // We key by object identity so that evaluateSingle can look up the right s_expr
    // when it recurses back through the same tree nodes.
    const evidence_to_s_expr = new Map<EvidenceNode, string>()
    for (const evidence of allEvidenceToLookFor(node)) {
      evidence_to_s_expr.set(evidence, inverseSExpression(evidence))
    }

    // Deduplicate by s-expression string, keeping one Evidence per unique s_expr
    const unique_evidence = new Map<string, EvidenceNode>()
    for (const [evidence, s_expr] of evidence_to_s_expr) {
      if (!unique_evidence.has(s_expr)) unique_evidence.set(s_expr, evidence)
    }

    // Single round trip: union all sub-queries, each tagged with its s_expr string
    const findings_map = new Map<string, string[]>()
    const entries = [...unique_evidence.entries()]
    if (entries.length > 0) {
      const [first, ...rest] = entries.map(([s_expr, evidence]) =>
        trx.selectFrom(
          buildExpression(trx, patient, evidence).as('sub'),
        ).select([
          literalString(s_expr).as('s_expr'),
          'sub.id',
        ])
      )
      const query = rest.reduce((acc, curr) => acc.unionAll(curr), first)
      for (const row of await query.execute()) {
        const ids = findings_map.get(row.s_expr) ?? []
        ids.push(row.id)
        findings_map.set(row.s_expr, ids)
      }
    }

    return evaluateEvidence(node)

    function evaluateEvidence(evidence: QueryableEvidenceNode): Result {
      switch (evidence.atom) {
        case 'or': {
          const contributing_records: string[] = []
          let any_true = false
          for (const expr of evidence.expressions) {
            const result = evaluateEvidence(expr)
            if (result.satisfies) {
              any_true = true
              contributing_records.push(...result.contributing_records)
            }
          }
          if (any_true) return { satisfies: true, contributing_records }
          return { satisfies: false }
        }

        case 'and': {
          const contributing_records: string[] = []
          for (const expr of evidence.expressions) {
            const result = evaluateEvidence(expr)
            if (!result.satisfies) return { satisfies: false }
            contributing_records.push(...result.contributing_records)
          }
          return { satisfies: true, contributing_records }
        }

        case 'any2': {
          const contributing_records: string[] = []
          let true_count = 0
          for (const expr of evidence.expressions) {
            const result = evaluateEvidence(expr)
            if (result.satisfies) {
              true_count++
              contributing_records.push(...result.contributing_records)
            }
          }
          if (true_count >= 2) return { satisfies: true, contributing_records }
          return { satisfies: false }
        }

        case 'finding':
        case 'evaluation':
        case 'diagnosis':
        case 'active_condition':
          return evaluateSingle(evidence)

        case '<':
        case '<=':
        case '=':
        case '>':
        case '>=': {
          if (evidence.type === 'measurement') return evaluateSingle(evidence)
          // time_ago comparisons are not yet supported for evidence tracking
          return { satisfies: false }
        }

        default:
          throw new Error(`Not supported ${(evidence as QueryableEvidenceNode).atom}`)
      }
    }

    function evaluateSingle(evidence: EvidenceNode): Result {
      const s_expr = evidence_to_s_expr.get(evidence)
      assert(s_expr != null)
      const record_ids = findings_map.get(s_expr) ?? []
      if (record_ids.length > 0) {
        return { satisfies: true, contributing_records: record_ids }
      }
      return { satisfies: false }
    }
  },
}

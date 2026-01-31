import { sql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import { patient_evaluations, type PatientEvaluationsSearch } from './patient_evaluations.ts'
import { buildExpression, EXPRESSION_BUILDERS } from './s_expression.ts'
import { AgeDetermination, TrxOrDb } from '../../types.ts'
import { arrayAggIds, jsonObjectFrom, literalString, success_true, temporaryTable } from '../helpers.ts'
import {
  DEFINITE,
  DIAGNOSIS,
  EQUIVOCAL,
  EVIDENCE_OF_CONTEXTUAL_QUALIFIER,
  IMPROBABLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER,
  POSSIBLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER,
  PROBABLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER,
  RELATIONSHIP,
} from '../../shared/snomed_concepts.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { Comparisons, Lang, QueryableNode, system_diagnosis_rule } from '../../shared/s_expression_schemas.ts'
import { SYSTEM_DIAGNOSIS_RULES } from '../../s_expression/system_diagnosis_rules.ts'
import compactMap from '../../util/compactMap.ts'
import generateUUID from '../../util/uuid.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import matching from '../../util/matching.ts'
import uniq from '../../util/uniq.ts'
import isKeyOf from '../../util/isKeyOf.ts'

export const SYSTEM_DIAGNOSIS_RULES_PARSED = SYSTEM_DIAGNOSIS_RULES.map((d) => parseWithSchema(d, system_diagnosis_rule))

const rules_by_age = {
  'adult': SYSTEM_DIAGNOSIS_RULES_PARSED.filter((rule) => rule.ages.includes('adult')),
  'older child': SYSTEM_DIAGNOSIS_RULES_PARSED.filter((rule) => rule.ages.includes('older child')),
  'younger child': SYSTEM_DIAGNOSIS_RULES_PARSED.filter((rule) => rule.ages.includes('younger child')),
}

const finding_nodes_to_s_expressions = new Map<Lang['finding' | Comparisons], string>()
const finding_s_expressions_to_nodes = new Map<string, Lang['finding' | Comparisons]>()
const finding_s_expressions_to_rules = new Map<string, Set<Lang['system_diagnosis_rule']>>()
const rules_to_finding_s_expressions = new Map<Lang['system_diagnosis_rule'], Set<string>>()
const rules_to_diagnosis_s_expressions = new Map<Lang['system_diagnosis_rule'], string>()
const rules_to_diagnosis_concept_s_expressions = new Map<Lang['system_diagnosis_rule'], string>()
const diagnosis_s_expressions_to_nodes = new Map<string, Lang['diagnosis']>()
const diagnosis_s_expressions_to_evaluations = new Map<string, Lang['evaluation']>()
for (const rule of SYSTEM_DIAGNOSIS_RULES_PARSED) {
  const finding_s_expressions = new Set<string>()
  const diagnosis_s_expression = inverseSExpression(rule.diagnosis)
  rules_to_finding_s_expressions.set(rule, finding_s_expressions)
  rules_to_diagnosis_s_expressions.set(rule, diagnosis_s_expression)
  rules_to_diagnosis_concept_s_expressions.set(rule, inverseSExpression(rule.diagnosis.snomed_concept))
  if (!diagnosis_s_expressions_to_nodes.has(diagnosis_s_expression)) {
    diagnosis_s_expressions_to_nodes.set(diagnosis_s_expression, rule.diagnosis)
    assert(!diagnosis_s_expressions_to_evaluations.has(diagnosis_s_expression))
    diagnosis_s_expressions_to_evaluations.set(diagnosis_s_expression, diagnosisToEvaluation(rule.diagnosis))
  }
  for (const finding of allFindingsToLookFor(rule.evidence)) {
    const finding_s_expr = inverseSExpression(finding)
    finding_nodes_to_s_expressions.set(finding, finding_s_expr)
    finding_s_expressions_to_nodes.set(finding_s_expr, finding)
    finding_s_expressions.add(finding_s_expr)

    if (!finding_s_expressions_to_rules.has(finding_s_expr)) {
      finding_s_expressions_to_rules.set(finding_s_expr, new Set())
    }
    finding_s_expressions_to_rules.get(finding_s_expr)!.add(rule)
  }
}

function* allFindingsToLookFor(node: QueryableNode): Generator<Lang['finding' | Comparisons]> {
  switch (node.atom) {
    case 'finding':
    case '<':
    case '<=':
    case '=':
    case '>':
    case '>=':
      yield node
      break
    case 'or':
    case 'and':
    case 'any2':
      for (const expression of node.expressions) {
        yield* allFindingsToLookFor(expression)
      }
      break
    default:
      throw new Error(`Not supported ${node.atom}`)
  }
}

export function baseQuery(trx: TrxOrDb, opts: PatientEvaluationsSearch) {
  return patient_evaluations.baseQuery(trx, opts)
    .where('patient_records_aggregated.root_snomed_concept_id', '=', DIAGNOSIS.id)
}

function diagnosisToEvaluation(diagnosis: {
  snomed_concept: Lang['snomed_concept']
  certainty_qualifier?: Lang['diagnosis']['certainty_qualifier']
}): Lang['evaluation'] {
  const certainty_qualifier_map = {
    'definite': DEFINITE,
    'probable': PROBABLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER,
    'equivocal': EQUIVOCAL,
    'possible': POSSIBLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER,
    'improbable': IMPROBABLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER,
  } as const

  const certainty_qualifier_concept = diagnosis.certainty_qualifier ? certainty_qualifier_map[diagnosis.certainty_qualifier] : null

  return {
    atom: 'evaluation',
    root_snomed_concept: {
      atom: 'snomed_concept',
      name: DIAGNOSIS.name,
      category: DIAGNOSIS.category,
    },
    specific_snomed_concept: diagnosis.snomed_concept,
    value_snomed_concept: certainty_qualifier_concept && {
      atom: 'snomed_concept',
      name: certainty_qualifier_concept.name,
      category: certainty_qualifier_concept.category,
    },
    evaluates: null,
    qualifiers: [],
    attributes: [],
  }
}

export const system_diagnosis_rules = {
  async insertSystemDiagnosesIfNotAlreadyIdentified(
    trx: TrxOrDb,
    { patient_id, patient_encounter_id, patient_age_determination, /*procedure_id, */ findings }: {
      patient_id: string
      patient_encounter_id: string
      // procedure_id: string
      patient_age_determination: AgeDetermination | null
      findings: {
        id: string
        existence: 'Yes' | 'No'
      }[]
    },
  ) {
    if (!patient_age_determination) return

    // TODO, maybe handle negative findings? There could be diagnoses that call for them
    const positive_findings = findings.filter((f) => f.existence === 'Yes')

    if (!positive_findings.length) return

    const rules_of_age = rules_by_age[patient_age_determination]

    if (!rules_of_age.length) return

    assert(finding_s_expressions_to_nodes.size)

    const concepts_to_consider = new Map<string, Lang['snomed_concept']>()
    for (const rule of rules_of_age) {
      const diagnosis_concept_s_expression = rules_to_diagnosis_concept_s_expressions.get(rule)
      assert(diagnosis_concept_s_expression)
      if (!concepts_to_consider.has(diagnosis_concept_s_expression)) {
        concepts_to_consider.set(diagnosis_concept_s_expression, rule.diagnosis.snomed_concept)
      }
    }

    const already_present_diagnoses = await trx.with('all_diagnoses', (qb) => {
      const [first_diagnosis_rule, ...other_diagnosis_rules] = concepts_to_consider.entries().map(
        ([diagnosis_concept_s_expression, snomed_concept]) =>
          qb.selectNoFrom([
            literalString(diagnosis_concept_s_expression).as('diagnosis_concept_s_expression'),
            jsonObjectFrom(
              EXPRESSION_BUILDERS.evaluation(
                trx,
                { patient_id, patient_encounter_id },
                diagnosisToEvaluation({ snomed_concept }),
              ).select([
                'patient_records_aggregated.value',
              ])
                .orderBy('patient_records_aggregated.created_at', 'desc')
                .limit(1),
            )
              .as('matching_diagnosis'),
          ]),
      )

      return other_diagnosis_rules.reduce(
        (acc, curr) => acc.unionAll(curr),
        first_diagnosis_rule,
      )
    })
      .selectFrom('all_diagnoses')
      .selectAll()
      .where('matching_diagnosis', 'is not', null)
      .execute()

    console.log({ already_present_diagnoses })
    // If we've already made diagnoses of equal or higher certainty, there's no need to reevaluate certain rules
    const rules_to_consider = rules_of_age.filter((rule) => {
      const diagnosis_concept_s_expression = rules_to_diagnosis_concept_s_expressions.get(rule)
      assert(diagnosis_concept_s_expression)
      const present_diagnosis = already_present_diagnoses.find(matching({ diagnosis_concept_s_expression }))
      if (!present_diagnosis) return true
      const { matching_diagnosis } = present_diagnosis
      assert(matching_diagnosis)
      assert(isObjectLike(matching_diagnosis.value))

      const concept_to_certainty_qualifier_map = {
        [DEFINITE.name]: 'definite' as const,
        [PROBABLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER.name]: 'probable' as const,
        [EQUIVOCAL.name]: 'equivocal' as const,
        [POSSIBLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER.name]: 'possible' as const,
        [IMPROBABLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER.name]: 'improbable' as const,
      } as const

      assert(isKeyOf(matching_diagnosis.value.name, concept_to_certainty_qualifier_map))

      const certainty = concept_to_certainty_qualifier_map[matching_diagnosis.value.name]
      if (certainty === 'definite') return false
      if (certainty === 'probable') return false
      if (certainty === 'improbable') return false
      if (certainty === 'equivocal') {
        return ['probable', 'improbable'].includes(rule.diagnosis.certainty_qualifier)
      }
      if (certainty === 'possible') {
        return rule.diagnosis.certainty_qualifier !== 'possible'
      }
    })

    if (!rules_to_consider.length) return

    const new_findings_applicable_query = trx
      .with('positive_findings', () => temporaryTable(trx, positive_findings))
      .with('all_findings', (qb) => {
        const finding_s_expressions_to_consider = uniq(rules_to_consider.flatMap(
          (rule) => Array.from(rules_to_finding_s_expressions.get(rule)!),
        ))

        const [first, ...others] = finding_s_expressions_to_consider.map((finding_s_expression) =>
          qb.selectNoFrom([
            literalString(finding_s_expression).as('finding_s_expression'),
            arrayAggIds(
              buildExpression(
                trx,
                { patient_id, patient_encounter_id },
                finding_s_expressions_to_nodes.get(finding_s_expression)!,
              ).where(
                'patient_records_aggregated.id',
                'in',
                qb.selectFrom('positive_findings').select('id'),
              ),
            ).as('matching_finding_ids'),
          ])
        )

        return others.reduce(
          (acc, curr) => acc.unionAll(curr),
          first,
        )
      })
      .selectFrom('all_findings')
      .selectAll()
      .where(sql`cardinality(matching_finding_ids)`, '>', 0)

    const new_findings_applicable = await new_findings_applicable_query.execute()

    if (!new_findings_applicable.length) return

    const rules_for_which_new_findings_applicable = rules_to_consider.filter((rule) => {
      const finding_s_expressions = rules_to_finding_s_expressions.get(rule)!
      return new_findings_applicable.some(({ finding_s_expression }) => finding_s_expressions.has(finding_s_expression))
    })

    // Second round: For rules where new findings are applicable, check ALL patient records
    // (not just the newly created findings) to see if evidence is satisfied
    const all_finding_s_expressions_for_applicable_rules = new Map<string, Lang['finding' | Comparisons]>()

    for (const rule of rules_for_which_new_findings_applicable) {
      const finding_s_expressions = rules_to_finding_s_expressions.get(rule)
      assert(finding_s_expressions)
      for (const finding_s_expr of finding_s_expressions) {
        const node = finding_s_expressions_to_nodes.get(finding_s_expr)
        assert(node)
        all_finding_s_expressions_for_applicable_rules.set(finding_s_expr, node)
      }
    }

    if (!all_finding_s_expressions_for_applicable_rules.size) return

    const [first_all_findings_rule, ...other_all_findings_rules] = all_finding_s_expressions_for_applicable_rules.entries().map(
      ([finding_s_expression, node]) =>
        trx.selectNoFrom([
          literalString(finding_s_expression).as('finding_s_expression'),
          arrayAggIds(
            buildExpression(
              trx,
              { patient_id, patient_encounter_id },
              node,
            ),
          ).as('matching_finding_ids'),
        ]),
    )

    const all_findings_for_rules_query = trx
      .with('all_findings_for_rules', () =>
        other_all_findings_rules.reduce(
          (acc, curr) => acc.unionAll(curr),
          first_all_findings_rule,
        ))
      .selectFrom('all_findings_for_rules')
      .where(sql`cardinality(matching_finding_ids)`, '>', 0)
      .selectAll()

    const all_findings_for_rules = await all_findings_for_rules_query.execute()

    // Create a map for quick lookup of findings by their s-expression
    const findings_map = new Map<string, string[]>()
    for (const { finding_s_expression, matching_finding_ids } of all_findings_for_rules) {
      findings_map.set(finding_s_expression, matching_finding_ids)
    }

    const rules_for_which_to_make_new_diagnosis = compactMap(rules_for_which_new_findings_applicable, (rule) => {
      const x = evaluateEvidence(rule.evidence)
      if (x.result) return { rule, contributing_finding_ids: x.contributing_finding_ids }
    })

    if (!rules_for_which_to_make_new_diagnosis.length) return

    for (const { rule, contributing_finding_ids } of rules_for_which_to_make_new_diagnosis) {
      const evaluation_id = generateUUID()
      const relations = Array.from(contributing_finding_ids).map((finding_id) => ({
        id: generateUUID(),
        source_id: finding_id,
        destination_id: evaluation_id,
      }))

      await patient_evaluations.insertOneNestedQuery(trx, {
        evaluation_id,
        patient_id,
        patient_encounter_id,
        evaluation: diagnosisToEvaluation(rule.diagnosis),
        by_system: true,
      }).with(
        'inserting_relation_patient_records',
        (qb) =>
          qb.insertInto('patient_records').values(relations.map(({ id }) => ({
            id,
            patient_id,
            patient_encounter_id,
            root_snomed_concept_id: RELATIONSHIP.id,
            specific_snomed_concept_id: EVIDENCE_OF_CONTEXTUAL_QUALIFIER.id,
          }))),
      ).with(
        'inserting_relations',
        (qb) => qb.insertInto('patient_record_relations').values(relations),
      ).selectNoFrom([
        success_true,
      ]).executeTakeFirstOrThrow()
    }

    function evaluateEvidence(evidence: QueryableNode):
      | { result: true; contributing_finding_ids: Set<string> }
      | { result: false } {
      const contributing_finding_ids = new Set<string>()
      switch (evidence.atom) {
        case 'or': {
          let any_true = false

          for (const expr of evidence.expressions) {
            const evaluation = evaluateEvidence(expr)
            if (evaluation.result) {
              any_true = true
              for (const id of evaluation.contributing_finding_ids) {
                contributing_finding_ids.add(id)
              }
            }
          }

          if (any_true) {
            return { result: true, contributing_finding_ids }
          }
          return { result: false }
        }

        case 'and': {
          for (const expr of evidence.expressions) {
            const evaluation = evaluateEvidence(expr)
            if (!evaluation.result) {
              return { result: false }
            }
            for (const id of evaluation.contributing_finding_ids) {
              contributing_finding_ids.add(id)
            }
          }

          return { result: true, contributing_finding_ids }
        }

        case 'any2': {
          let true_count = 0

          for (const expr of evidence.expressions) {
            const evaluation = evaluateEvidence(expr)
            if (evaluation.result) {
              true_count++
              for (const id of evaluation.contributing_finding_ids) {
                contributing_finding_ids.add(id)
              }
            }
          }

          if (true_count >= 2) {
            return { result: true, contributing_finding_ids }
          }
          return { result: false }
        }

        case 'finding':
        case '<':
        case '<=':
        case '=':
        case '>':
        case '>=': {
          const finding_s_expr = finding_nodes_to_s_expressions.get(evidence)
          assert(finding_s_expr)
          const matching_finding_ids = findings_map.get(finding_s_expr)

          if (matching_finding_ids && matching_finding_ids.length > 0) {
            return { result: true, contributing_finding_ids: new Set(matching_finding_ids) }
          }
          return { result: false }
        }
        default:
          throw new Error(`Not supported ${evidence.atom}`)
      }
    }
  },
}

import type {
  AgeDetermination,
  ApplicableRule,
  ApplicableRuleEffectSystemDiagnosisRule,
  FindingRelatedModifiers,
  FindingToCheckFor,
  RulesDryRun,
  TrxOrDbOrQueryCreator,
} from '../../types.ts'
import type { InsertableFindingBase, Lang } from '../../shared/s_expression_schemas.ts'
import { snomed_predefined_attributes } from './snomed_predefined_attributes.ts'
import { snomed_relevant_qualifiers } from './snomed_relevant_qualifiers.ts'
import { snomed_onset_required } from './snomed_onset_required.ts'
import { jsonArrayFrom } from '../helpers.ts'
import { pMap } from '../../util/inParallel.ts'
import { promiseProps } from '../../util/promiseProps.ts'
import uniq from '../../util/uniq.ts'
import assertHasProperty from '../../util/assertHasProperty.ts'
import { due_to } from './due_to.ts'
import { rules } from './rules.ts'
import { existingFindingsMatching, isCheckFor } from './additional_tasks.ts'
import { getTaskById } from '../../shared/tasks.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { asNormalFormSExpression, formatRecord } from '../../shared/patient_records.ts'
import { arrayIsEmpty } from '../../util/arraySize.ts'
import sortBy from '../../util/sortBy.ts'
import matching from '../../util/matching.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { higherPriority, type Priority } from '../../shared/priorities.ts'
import { exists } from '../../util/exists.ts'
import { groupDiagnosisEffectsByConcept } from '../../shared/diagnosis.ts'

/*
  A dry run of the rules pipeline: what would happen if `finding` were recorded for this
  patient in this encounter? Which check_for findings would the health worker be prompted
  for, which diagnoses would be indicated and what priority would triage be raised to?

  Follows the same three steps that run when a finding is actually inserted
  (due_to tagging → rule evaluation → task materialisation) but reads only:
    1. due_to.forHypotheticalFinding matches the node against the due_to tables
    2. rules.getApplicableForHypotheticalRecord evaluates rules with the node as
       in-memory evidence alongside the patient's real evidence
    3. the check_for tasks of the applicable rules are flattened to findings, each
       annotated with the record already made for it in this encounter, if any,
       while the diagnosis and priority rule effects are collected as they are
*/
/*
  The modifiers the finding modal offers for each finding, looked up by its specific concept
  the same way the warning signs search does for its results.
  TODO: batch?
*/
async function modifiersOf(
  trx: TrxOrDbOrQueryCreator,
  nodes: Map<string, Lang['finding']>,
): Promise<Map<string, FindingRelatedModifiers>> {
  const entries = await pMap([...nodes.entries()], async ([s_expression, node]): Promise<[string, FindingRelatedModifiers]> => {
    assertHasProperty(node, 'specific_snomed_concept')
    const snomed_concept = node.specific_snomed_concept
    const row = await trx.selectNoFrom((eb) => [
      jsonArrayFrom(snomed_predefined_attributes.baseQuery(trx, { snomed_concept })).as('predefined_attributes'),
      jsonArrayFrom(snomed_relevant_qualifiers.baseQuery(trx, { snomed_concept })).as('relevant_qualifiers'),
      eb.exists(snomed_onset_required.baseQuery(trx, { snomed_concept })).$castTo<boolean>().as('onset_required'),
    ]).executeTakeFirstOrThrow()
    return [s_expression, row]
  })
  return new Map(entries)
}

const EMPTY_DRY_RUN: RulesDryRun = { findings_to_check_for: [], would_indicate_diagnoses: [], would_indicate_priority: null }

type RuleEffects = {
  // The check_for findings by s_expression. The same finding may be checked for by more than one task
  nodes: Map<string, Lang['finding']>
  task_ids_by_s_expression: Map<string, string[]>
  diagnoses: ApplicableRuleEffectSystemDiagnosisRule[]
  priority: null | Priority
}

// Flattens what the applicable rules would do: which findings their tasks check for, which
// diagnoses they indicate and the highest priority they would raise triage to
function collectRuleEffects(applicable_rules: ApplicableRule[]): RuleEffects {
  const nodes = new Map<string, Lang['finding']>()
  const task_ids_by_s_expression = new Map<string, string[]>()
  const diagnoses: ApplicableRuleEffectSystemDiagnosisRule[] = []
  let priority: null | Priority = null
  for (const rule of sortBy(applicable_rules, 'description')) {
    switch (rule.rule_effect.type) {
      case 'task': {
        const { to_be_done } = getTaskById(rule.id)
        if (!isCheckFor(to_be_done)) break
        for (const node of to_be_done.value) {
          const s_expression = inverseSExpression(node)
          nodes.set(s_expression, node)
          task_ids_by_s_expression.set(s_expression, uniq([...(task_ids_by_s_expression.get(s_expression) || []), rule.id]))
        }
        break
      }
      case 'system_diagnosis_rule':
        diagnoses.push(rule.rule_effect)
        break
      case 'system_priority_evaluation':
        priority = exists(higherPriority(rule.rule_effect.priority, priority))
        break
    }
  }
  return { nodes, task_ids_by_s_expression, diagnoses, priority }
}

// Each check_for finding annotated with its modifiers and the record already made for it in
// this encounter, if any
async function findingsToCheckFor(
  trx: TrxOrDbOrQueryCreator,
  { patient_id, patient_encounter_id, nodes, task_ids_by_s_expression }: {
    patient_id: string
    patient_encounter_id: string
  } & Pick<RuleEffects, 'nodes' | 'task_ids_by_s_expression'>,
): Promise<FindingToCheckFor[]> {
  // Rules may have indicated a diagnosis or a priority without checking for anything
  if (!nodes.size) return []

  const { existing_findings, modifiers } = await promiseProps({
    existing_findings: existingFindingsMatching(trx, { patient_id, patient_encounter_id, nodes }),
    modifiers: modifiersOf(trx, nodes),
  })

  return [...nodes.entries()].map(([s_expression, node]) => {
    const existing = existing_findings.find(matching({ s_expression }))
    assertHasProperty(node, 'specific_snomed_concept')
    return {
      s_expression,
      name: node.specific_snomed_concept.name,
      task_ids: task_ids_by_s_expression.get(s_expression)!,
      ...modifiers.get(s_expression)!,
      existing_record: existing
        ? {
          id: existing.id,
          s_expression: asNormalFormSExpression(formatRecord(existing)),
          existence: existing.existence,
        }
        : null,
    }
  })
}

export const rules_dry_run = {
  async forHypotheticalFinding(
    trx: TrxOrDbOrQueryCreator,
    { patient_id, patient_encounter_id, patient_age_determination, finding }: {
      patient_id: string
      patient_encounter_id: string
      patient_age_determination: AgeDetermination
      finding: InsertableFindingBase
    },
  ): Promise<RulesDryRun> {
    assertEquals(finding.existence, 'Yes', 'dry run only used to test against hypothetical positive findings')

    const finding_due_tos = await due_to.forHypotheticalFinding(trx, { patient_age_determination, finding })
    if (arrayIsEmpty(finding_due_tos)) return EMPTY_DRY_RUN

    const applicable_rules = await rules.getApplicableForHypotheticalRecord(trx, {
      patient_id,
      patient_encounter_id,
      patient_age_determination,
      matched_due_tos: finding_due_tos,
    })
    const effects = collectRuleEffects(applicable_rules)

    const would_indicate_diagnoses: RulesDryRun['would_indicate_diagnoses'] = groupDiagnosisEffectsByConcept(effects.diagnoses)
      .map(({ diagnosis }) => ({ diagnosis, would_indicate_priority: null, findings_to_check_for: [] }))

    return {
      findings_to_check_for: await findingsToCheckFor(trx, { patient_id, patient_encounter_id, ...effects }),
      would_indicate_diagnoses,
      would_indicate_priority: effects.priority,
    }
  },
}

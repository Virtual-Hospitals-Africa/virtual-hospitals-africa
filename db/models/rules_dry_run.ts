import type {
  AgeDetermination,
  ApplicableRule,
  ApplicableRuleEffectSystemDiagnosisRule,
  FindingToCheckFor,
  RulesDryRun,
  TrxOrDbOrQueryCreator,
} from '../../types.ts'
import type { InsertableFindingBase, Lang } from '../../shared/s_expression_schemas.ts'
import { modifiersOf } from './snomed_finding_modifiers.ts'
import { pMap } from '../../util/inParallel.ts'
import { promiseProps } from '../../util/promiseProps.ts'
import uniq from '../../util/uniq.ts'
import assertHasProperty from '../../util/assertHasProperty.ts'
import { due_to, type HypotheticalDueToMatch } from './due_to.ts'
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
import { type DiagnosisEffectGroup, groupDiagnosisEffectsByConcept } from '../../shared/diagnosis.ts'

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
    4. for each diagnosis the rules would record, steps 1–3 run again for the diagnosis
       (at the highest certainty given it) with the finding's matches alongside, over
       task and priority rules only, reporting what the diagnosis adds
*/
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

/*
  What recording the diagnosis the rules would make of `group` adds on top of what the finding
  does by itself. The task and priority rules due to the diagnosis are evaluated with the
  finding's own due_to matches alongside, so an (and (finding ...) (diagnosis ...)) rule can be
  satisfied, and the rules the finding already made applicable are left out.

  Diagnosis rules are not evaluated again, so a diagnosis never indicates further diagnoses
  here. The real pipeline does chain them: EvaluationAdded in events/handlers.ts runs
  insertSystemDiagnosesIfNotAlreadyIdentified for the diagnosis record too. In practice the only
  diagnoses other diagnosis rules are due to are Fever, which is diagnosed from a body
  temperature measurement alone and so can never follow from a hypothetical finding, and
  Cellulitis of face, which also needs a temperature measurement and so can follow from a finding
  only when one is already on record (orbital cellulitis is due to it). If a diagnosis rule due to
  another finding-only diagnosis is ever added, this dry run will under-report and this pass
  needs to recurse over system_diagnosis_rule as well.

  The certainty is the highest any applicable rule gives the concept, as insertPositiveDiagnoses
  records it, and it decides which due_tos match: a possible diagnosis satisfies a check_for task
  due to (diagnosis X possible) but not a priority rule due to (active_condition X).
*/
async function consequencesOfDiagnosis(
  trx: TrxOrDbOrQueryCreator,
  { patient_id, patient_encounter_id, patient_age_determination, finding_due_tos, directly_applicable_rule_ids, group }: {
    patient_id: string
    patient_encounter_id: string
    patient_age_determination: AgeDetermination
    finding_due_tos: HypotheticalDueToMatch[]
    directly_applicable_rule_ids: Set<string>
    group: DiagnosisEffectGroup<ApplicableRuleEffectSystemDiagnosisRule>
  },
): Promise<RulesDryRun['would_indicate_diagnoses'][number]> {
  const { strongest } = group
  const diagnosis_due_tos = await due_to.forHypotheticalDiagnosis(trx, {
    patient_age_determination,
    diagnosis: {
      snomed_concept: { atom: 'snomed_concept', ...strongest.snomed_concept },
      certainty_qualifier: strongest.certainty,
    },
  })

  const applicable_rules = arrayIsEmpty(diagnosis_due_tos) ? [] : await rules.getApplicableForHypotheticalRecord(trx, {
    patient_id,
    patient_encounter_id,
    patient_age_determination,
    matched_due_tos: [...finding_due_tos, ...diagnosis_due_tos],
    type: ['task', 'system_priority_evaluation'],
  })
  const effects = collectRuleEffects(applicable_rules.filter((rule) => !directly_applicable_rule_ids.has(rule.id)))

  return {
    diagnosis: group.diagnosis,
    would_indicate_priority: effects.priority,
    findings_to_check_for: await findingsToCheckFor(trx, { patient_id, patient_encounter_id, ...effects }),
  }
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

    const directly_applicable_rule_ids = new Set(applicable_rules.map((rule) => rule.id))
    const would_indicate_diagnoses = await pMap(
      groupDiagnosisEffectsByConcept(effects.diagnoses),
      (group) =>
        consequencesOfDiagnosis(trx, {
          patient_id,
          patient_encounter_id,
          patient_age_determination,
          finding_due_tos,
          directly_applicable_rule_ids,
          group,
        }),
    )

    return {
      findings_to_check_for: await findingsToCheckFor(trx, { patient_id, patient_encounter_id, ...effects }),
      would_indicate_diagnoses,
      would_indicate_priority: effects.priority,
    }
  },
}

import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { TASKS_LISP } from '../../s_expression/tasks.ts'
import { system_diagnosis_rule, system_priority_evaluation, task } from '../../shared/s_expression_schemas.ts'
import db from '../../db/db.ts'
import { collect, filter } from '../../util/inParallel.ts'
import { assertArrayEmpty } from '../../util/arraySize.ts'
import { SYSTEM_PRIORITY_EVALUATIONS_LISP } from '../../s_expression/system_priority_evaluations.ts'
import { SYSTEM_DIAGNOSIS_RULES_LISP } from '../../s_expression/system_diagnosis_rules.ts'
import { parseLispFile, walkDirectory } from '../../s_expression/compile.ts'
import { allEvidenceToLookFor } from '../../db/models/s_expression_evidence.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { ALL_ASESSMENT_OPTIONS_PARSED, VITALS_ADULT_SNOMED_CONCEPT_NAMES } from '../../shared/vitals.ts'
import { isCheckFor } from '../../db/models/additional_tasks.ts'
import compactMap from '../../util/compactMap.ts'
import { allConceptsToLookFor } from '../../shared/s_expression_concepts.ts'
import { conceptDoesNotExist } from '../../db/models/snomed_concept_exists.ts'

function* nodesAndConceptsTasks() {
  for (const s_expression of TASKS_LISP) {
    const node = parseWithSchema(s_expression, task)
    for (const concept of allConceptsToLookFor(node)) {
      yield { concept, node }
    }
  }
}

function* nodesAndConceptsSystemPriorityEvaluations() {
  for (const s_expression of SYSTEM_PRIORITY_EVALUATIONS_LISP) {
    const node = parseWithSchema(s_expression, system_priority_evaluation)
    for (const concept of allConceptsToLookFor(node)) {
      yield { concept, node }
    }
  }
}

function* nodesAndConceptsSystemDiagnosisRules() {
  for (const s_expression of SYSTEM_DIAGNOSIS_RULES_LISP) {
    const node = parseWithSchema(s_expression, system_diagnosis_rule)
    for (const concept of allConceptsToLookFor(node)) {
      yield { concept, node }
    }
  }
}

describe('s_expression', () => {
  afterAll(() => db.destroy())
  describe('TASKS_LISP', () => {
    it('has valid snomed concepts', async () => {
      const not_found = await filter(nodesAndConceptsTasks(), conceptDoesNotExist)
      assertArrayEmpty(not_found)
    })
    it('each finding we check_for is used as part of a due_to for at least one system_diagnosis_rule or system_priority_evaluation', () => {
      const checked_for_but_never_used_as_evidence = [...checkedForButNeverUsedAsEvidence()]
      assertArrayEmpty(checked_for_but_never_used_as_evidence)

      function* checkedForButNeverUsedAsEvidence() {
        const task_nodes = TASKS_LISP.map((s_expression) => parseWithSchema(s_expression, task))

        const rule_evidence = new Set([
          ...SYSTEM_DIAGNOSIS_RULES_LISP.map((s_expression) => parseWithSchema(s_expression, system_diagnosis_rule)),
          ...SYSTEM_PRIORITY_EVALUATIONS_LISP.map((s_expression) => parseWithSchema(s_expression, system_priority_evaluation)),
        ].flatMap((rule) => Array.from(allEvidenceToLookFor(rule.due_to), (evidence) => inverseSExpression(evidence))))

        // Which tasks each piece of evidence triggers, by index into task_nodes
        const tasks_triggered_by = new Map<string, Set<number>>()
        for (const [index, task_node] of task_nodes.entries()) {
          for (const evidence of allEvidenceToLookFor(task_node.due_to)) {
            const evidence_s_expression = inverseSExpression(evidence)
            const triggered = tasks_triggered_by.get(evidence_s_expression) ?? new Set()
            triggered.add(index)
            tasks_triggered_by.set(evidence_s_expression, triggered)
          }
        }

        const already_yielded = new Set<string>()

        for (const [index, task_node] of task_nodes.entries()) {
          if (!isCheckFor(task_node.to_be_done)) continue
          for (const finding of task_node.to_be_done.value) {
            const finding_s_expression = inverseSExpression(finding)
            // A rule keying off of the finding's absence still relies on us having checked for it
            if (isUsedByAnythingElse(finding_s_expression, index)) continue
            if (isUsedByAnythingElse(`(no ${finding_s_expression})`, index)) continue
            if (already_yielded.has(finding_s_expression)) continue
            already_yielded.add(finding_s_expression)
            yield {
              description: task_node.description,
              never_used_as_evidence: finding_s_expression,
            }
          }
        }

        // Triggering some other task counts as using the finding. Triggering only the very task
        // that checks for it does not; see the self-referentiality test below.
        function isUsedByAnythingElse(evidence_s_expression: string, checking_task_index: number): boolean {
          if (rule_evidence.has(evidence_s_expression)) return true
          const triggered = tasks_triggered_by.get(evidence_s_expression)
          if (!triggered) return false
          return [...triggered].some((index) => index !== checking_task_index)
        }
      }
    })
    it('no task checks for a finding that is already part of its own due_to', async () => {
      const tasks_checking_for_their_own_due_to = await collect(tasksCheckingForTheirOwnDueTo())
      assertArrayEmpty(tasks_checking_for_their_own_due_to)

      async function* tasksCheckingForTheirOwnDueTo() {
        for await (const file_path of walkDirectory()) {
          for (const task_node of await parseLispFile(file_path)) {
            if (task_node.atom !== 'task') continue
            if (!isCheckFor(task_node.to_be_done)) continue
            const due_to = new Set(Array.from(allEvidenceToLookFor(task_node.due_to), (evidence) => inverseSExpression(evidence)))
            for (const finding of task_node.to_be_done.value) {
              const finding_s_expression = inverseSExpression(finding)
              if (due_to.has(finding_s_expression)) {
                yield {
                  file_path,
                  description: task_node.description,
                  already_known_from_due_to: finding_s_expression,
                }
              }
            }
          }
        }
      }
    })
  })
  describe('SYSTEM_PRIORITY_EVALUATIONS_LISP', () => {
    it('has valid snomed concepts', async () => {
      const not_found = await filter(nodesAndConceptsSystemPriorityEvaluations(), conceptDoesNotExist)
      assertArrayEmpty(not_found)
    })

    it('leverages findings we check for in TASKS_LISP or things that we can diagnose as probable based on the apc adult guidelines', async () => {
      const system_diagnosis_rules = SYSTEM_DIAGNOSIS_RULES_LISP.map((s_expression) => parseWithSchema(s_expression, system_diagnosis_rule))

      const all_probable_diagnoses = compactMap(system_diagnosis_rules, (system_diagnosis_rule) => {
        if (system_diagnosis_rule.diagnosis.certainty_qualifier !== 'probable') return
        return system_diagnosis_rule.diagnosis.snomed_concept
      })

      const rules_without_corresponding_check_for_system_diagnosis_rule = await collect(systemPriorityEvaluationsWithNoCheckForNorDiagnosis())
      assertArrayEmpty(rules_without_corresponding_check_for_system_diagnosis_rule)

      async function* systemPriorityEvaluationsWithNoCheckForNorDiagnosis() {
        for await (const { file_path, system_priority_evaluations, tasks } of correspondingAPCRules()) {
          const all_checking_for = new Set(tasks.flatMap((task_node) => {
            const due_to = allEvidenceToLookFor(task_node.due_to).map(inverseSExpression)
            // TODO  || isMeasurements(task_node.to_be_done)?
            const checking_for = isCheckFor(task_node.to_be_done) ? task_node.to_be_done.value.map(inverseSExpression) : []

            return [
              ...due_to,
              ...checking_for,
            ]
          }))

          for (const rule of system_priority_evaluations) {
            for (const evidence of allEvidenceToLookFor(rule.due_to)) {
              const finding = (
                  evidence.atom === '>' ||
                  evidence.atom === '<' ||
                  evidence.atom === '>=' ||
                  evidence.atom === '<=' ||
                  evidence.atom === '='
                )
                ? evidence.measurement
                : evidence

              const evidence_collected_during_vitals = (
                finding.atom === 'measurement' && VITALS_ADULT_SNOMED_CONCEPT_NAMES.has(finding.snomed_concept.name)
              ) || (
                finding.atom === 'active_condition' && finding.snomed_concept.name === 'Fever'
              ) || (
                finding.atom === 'finding' &&
                ALL_ASESSMENT_OPTIONS_PARSED.some((option) =>
                  option.specific_snomed_concept!.name === finding.specific_snomed_concept?.name &&
                  option.specific_snomed_concept!.category === finding.specific_snomed_concept?.category
                )
              )
              if (evidence_collected_during_vitals) continue
              const evaluating_a_diagnosed_condition = finding.atom === 'active_condition' &&
                all_probable_diagnoses.some((probable_diagnosis) =>
                  finding.snomed_concept.name === probable_diagnosis.name &&
                  finding.snomed_concept.category === probable_diagnosis.category
                )
              if (evaluating_a_diagnosed_condition) continue
              const finding_s_expression = inverseSExpression(finding)
              if (all_checking_for.has(finding_s_expression)) continue

              yield {
                file_path,
                description: rule.description,
                didnt_check_for: finding_s_expression,
              }
            }
          }
        }
      }

      async function* correspondingAPCRules() {
        for await (const file_path of walkDirectory('s_expression/rules/apc-adult')) {
          const rules = await parseLispFile(file_path)
          yield {
            file_path,
            tasks: rules.filter((rule) => rule.atom === 'task'),
            system_priority_evaluations: rules.filter((rule) => rule.atom === 'system_priority_evaluation'),
          }
        }
      }
    })
  })
  describe('SYSTEM_DIAGNOSIS_RULES_LISP', () => {
    it('has valid snomed concepts', async () => {
      const not_found = await filter(nodesAndConceptsSystemDiagnosisRules(), conceptDoesNotExist)
      assertArrayEmpty(not_found)
    })

    it('leverages findings we check for in TASKS_LISP based on the apc adult guidelines', async () => {
      const rules_without_corresponding_check_for = await collect(probableSystemDiagnosisRulesWithNoCheckFor())
      assertArrayEmpty(rules_without_corresponding_check_for)

      async function* probableSystemDiagnosisRulesWithNoCheckFor() {
        for await (const { file_path, system_diagnosis_rules, tasks } of correspondingAPCRules()) {
          const all_checking_for = new Set(tasks.flatMap((task_node) => {
            const due_to = allEvidenceToLookFor(task_node.due_to).map(inverseSExpression)
            // TODO  || isMeasurements(task_node.to_be_done)?
            const checking_for = isCheckFor(task_node.to_be_done) ? task_node.to_be_done.value.map(inverseSExpression) : []

            return [
              ...due_to,
              ...checking_for,
            ]
          }))

          for (const rule of system_diagnosis_rules) {
            if (rule.diagnosis.certainty_qualifier !== 'probable') continue
            for (const evidence of allEvidenceToLookFor(rule.due_to)) {
              const finding = (
                  evidence.atom === '>' ||
                  evidence.atom === '<' ||
                  evidence.atom === '>=' ||
                  evidence.atom === '<=' ||
                  evidence.atom === '='
                )
                ? evidence.measurement
                : evidence

              const evidence_collected_during_vitals = (
                finding.atom === 'measurement' && VITALS_ADULT_SNOMED_CONCEPT_NAMES.has(finding.snomed_concept.name)
              ) || (
                finding.atom === 'active_condition' && finding.snomed_concept.name === 'Fever'
              )
              if (evidence_collected_during_vitals) continue
              const finding_s_expression = inverseSExpression(finding)
              if (!all_checking_for.has(finding_s_expression)) {
                yield {
                  file_path,
                  description: rule.description,
                  didnt_check_for: finding_s_expression,
                }
              }
            }
          }
        }
      }

      async function* correspondingAPCRules() {
        for await (const file_path of walkDirectory('s_expression/rules/apc-adult')) {
          const rules = await parseLispFile(file_path)
          yield {
            file_path,
            tasks: rules.filter((rule) => rule.atom === 'task'),
            system_diagnosis_rules: rules.filter((rule) => rule.atom === 'system_diagnosis_rule'),
          }
        }
      }
    })
  })

  describe('apc-adult', () => {
    it('has maximum one file per page number', async () => {
      const filepaths = await collect(walkDirectory('s_expression/rules/apc-adult'))
      assertUniquePageNumbers(filepaths)

      function assertUniquePageNumbers(filepaths: string[]) {
        const page_numbers = new Set<string>()
        for (const filepath of filepaths) {
          const page_number = filepath.match(/(\d+)/)![1]
          if (page_numbers.has(page_number)) {
            throw new Error(page_number + ' xx ' + filepath)
          }
          page_numbers.add(page_number)
        }
      }
    })
  })
})

import { EnteredFinding, Existence, FindingToCheckFor, FollowUpGroup, RecordedFinding, RulesDryRun } from '../../types.ts'
import { parseSExpressionAsInsertableFinding } from '../../shared/parseSExpressionAsInsertableFinding.ts'
import { evaluationFullDisplay, findingFullDisplay } from '../../shared/patient_records.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { NoneOfTheAboveFindingsPostBody } from '../../shared/none_of_the_above_findings_post.ts'
import { diagnosisToEvaluation, strongestDiagnosisEffect } from '../../shared/diagnosis.ts'
import { Lang } from '../../shared/s_expression_schemas.ts'
import { openFinding } from '../finding/metadata.ts'

/*
  Follow ups accumulate across saves within a visit to a workflow page, grouped by what
  caused them (FollowUpGroup in types.ts).

  A save raises a group for the sign itself and one for each diagnosis the sign would
  indicate, as the findings a diagnosis has us check for are due to the diagnosis rather
  than to the sign behind it. A diagnosis's group is keyed by the sign's key and the
  diagnosed concept, so that saving the sign again replaces the groups its diagnoses raised
  before, including those it no longer indicates.
*/

export const EMPTY_RULES_DRY_RUN: RulesDryRun = {
  findings_to_check_for: [],
  would_indicate_diagnoses: [],
  would_indicate_priority: null,
}

const DIAGNOSIS_KEY_PREFIX = '.diagnosis.'

/*
  Folding a sign's own group in first sweeps the diagnosis groups of its previous save,
  so the diagnosis groups folded in after it are the ones this save indicates.
*/
export function accumulateFollowUps(
  groups: FollowUpGroup[],
  { key, due_to, findings_to_check_for }: {
    key: string
    due_to: EnteredFinding | null
    findings_to_check_for: FindingToCheckFor[]
  },
): FollowUpGroup[] {
  const without_sign = groups.filter((group) => group.key !== key && !group.key.startsWith(key + DIAGNOSIS_KEY_PREFIX))
  if (!due_to || !findings_to_check_for.length) return without_sign
  return [...without_sign, { key, due_to, findings_to_check_for }]
}

// Removes every group the sign with this key raised
export function retractFollowUps(groups: FollowUpGroup[], key: string): FollowUpGroup[] {
  return accumulateFollowUps(groups, { key, due_to: null, findings_to_check_for: [] })
}

/*
  A diagnosis the sign would indicate, as the pipeline would record it: one per concept at
  the highest certainty any applicable rule gives it, displayed as the diagnosis itself
  would be, "Anaphylaxis Diagnosis: Possible diagnosis".
*/
export function indicatedDiagnosisNode(diagnosis: RulesDryRun['would_indicate_diagnoses'][number]['diagnosis']): Lang['diagnosis'] {
  const { snomed_concept, certainty } = strongestDiagnosisEffect(diagnosis)
  return {
    atom: 'diagnosis',
    snomed_concept: { atom: 'snomed_concept', name: snomed_concept.name, category: snomed_concept.category },
    certainty_qualifier: certainty,
  }
}

export function asIndicatedDiagnosis(diagnosis: RulesDryRun['would_indicate_diagnoses'][number]['diagnosis']): EnteredFinding {
  const node = indicatedDiagnosisNode(diagnosis)
  return {
    s_expression: inverseSExpression(node),
    display: evaluationFullDisplay(diagnosisToEvaluation(node)),
  }
}

// The group for one of a sign's indicated diagnoses, to fold in after the sign's own group
export function indicatedDiagnosisFollowUp(
  sign_key: string,
  { diagnosis, findings_to_check_for }: RulesDryRun['would_indicate_diagnoses'][number],
): FollowUpGroup {
  return {
    key: `${sign_key}${DIAGNOSIS_KEY_PREFIX}${strongestDiagnosisEffect(diagnosis).snomed_concept.id}`,
    due_to: asIndicatedDiagnosis(diagnosis),
    findings_to_check_for,
  }
}

export function followUpDisplay(s_expression: string): string {
  return findingFullDisplay(parseSExpressionAsInsertableFinding(s_expression))
}

export function normalized(s_expression: string): string {
  return inverseSExpression(parseSExpressionAsInsertableFinding(s_expression))
}

/*
  A follow up's key is its finding rather than any sign, as the same follow up may be listed
  by several groups and on several pages. Checking it from a warning signs table instead
  keys it by the sign, so lists match on the record and the entered finding too (findRecordedFollowUp).
*/
export function followUpKey(finding: FindingToCheckFor): string {
  return normalized(finding.s_expression)
}

/*
  A follow up already recorded as Yes in this encounter starts out recorded, entered as it
  was recorded so that opening it shows any qualifiers added at the time.
*/
export function asRecordedFollowUp(finding: FindingToCheckFor): RecordedFinding | null {
  const { existing_record } = finding
  if (existing_record?.existence !== 'Yes') return null
  return {
    key: followUpKey(finding),
    entered: { s_expression: existing_record.s_expression, display: followUpDisplay(existing_record.s_expression) },
    record_id: existing_record.id,
    saving: false,
  }
}

/*
  The recorded finding standing for a follow up, if any. A follow up may coincide with a
  warning sign already checked in the tables (the insect bite that prompted checking for
  anaphylaxis is itself listed), so match on what was entered rather than on the key.
*/
export function findRecordedFollowUp(
  recorded: RecordedFinding[],
  finding: FindingToCheckFor,
): RecordedFinding | undefined {
  const target = normalized(finding.s_expression)
  return recorded.find((candidate) =>
    (finding.existing_record && candidate.record_id === finding.existing_record.id) ||
    normalized(candidate.entered.s_expression) === target
  )
}

export function isUnanswered(recorded: RecordedFinding[], finding: FindingToCheckFor): boolean {
  return !finding.existing_record && !findRecordedFollowUp(recorded, finding)
}

export function someUnanswered(groups: FollowUpGroup[], recorded: RecordedFinding[]): boolean {
  return groups.some((group) => group.findings_to_check_for.some((finding) => isUnanswered(recorded, finding)))
}

/*
  Checking a follow up behaves exactly like checking a warning sign: the finding modal opens
  and on save the finding is posted and joins the recorded findings of every list. It has no
  priority of its own.
*/
export function openFollowUp(finding: FindingToCheckFor, recorded: RecordedFinding | undefined) {
  const { existing_record } = finding
  const existing: null | { record_id: string; existence: Existence } = recorded
    ? { record_id: recorded.record_id, existence: 'Yes' }
    : existing_record
    ? { record_id: existing_record.id, existence: existing_record.existence }
    : null

  openFinding({
    key: recorded?.key || followUpKey(finding),
    finding: { ...finding, clinical_finding_s_expression: finding.s_expression, priority: null },
    entered: recorded?.entered || { s_expression: finding.s_expression, display: followUpDisplay(finding.s_expression) },
    just_checked: !recorded,
    existing,
  })
}

/*
  One request per task with follow ups still unanswered, listing the positive findings the
  backend will record as negatives. A finding checked for by two tasks is sent with both.
  The backend records nothing for a finding that has since gained a record, so posting the
  requests one after another never records the same finding twice.
*/
export function noneOfTheAboveRequests(
  groups: FollowUpGroup[],
  recorded: RecordedFinding[],
): NoneOfTheAboveFindingsPostBody[] {
  const by_task = new Map<string, Set<string>>()
  for (const group of groups) {
    for (const finding of group.findings_to_check_for) {
      if (!isUnanswered(recorded, finding)) continue
      for (const task_id of finding.task_ids) {
        const s_expressions = by_task.get(task_id) || new Set<string>()
        s_expressions.add(finding.s_expression)
        by_task.set(task_id, s_expressions)
      }
    }
  }
  return [...by_task.entries()].map(([task_description, s_expressions]) => ({
    task_description,
    s_expressions: `(${[...s_expressions].join(' ')})`,
  }))
}

/*
  Findings a round of "none of the above" recorded as absent, from this island or another,
  gain that record in every group listing them, so they roll up as previously absent and a
  later check overturns the negative record.
*/
export function markRecordedAbsent(
  groups: FollowUpGroup[],
  records: { id: string; s_expression: string }[],
): FollowUpGroup[] {
  if (!records.length) return groups
  const by_s_expression = new Map(records.map((record) => [normalized(record.s_expression), record]))
  return groups.map((group) => ({
    ...group,
    findings_to_check_for: group.findings_to_check_for.map((finding) => {
      if (finding.existing_record) return finding
      const record = by_s_expression.get(normalized(finding.s_expression))
      if (!record) return finding
      return { ...finding, existing_record: { id: record.id, s_expression: record.s_expression, existence: 'No' as const } }
    }),
  }))
}

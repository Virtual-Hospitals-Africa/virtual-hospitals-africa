# Dry Run: Consequences of Indicated Diagnoses — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a hypothetical finding would make the rules record a diagnosis, the dry run also reports the check_for findings and the priority that diagnosis would in turn cause, per diagnosis, respecting its certainty.

**Architecture:** `rules_dry_run.forHypotheticalFinding` already does one pass: match the finding against `due_to`, evaluate rules in memory, flatten task/diagnosis/priority effects. This plan adds a second pass per indicated diagnosis concept: build the diagnosis evaluation node the real pipeline would insert (`diagnosisToEvaluation`, at the highest certainty any applicable rule gives that concept), match *it* against `due_to` with a new `due_to.forHypotheticalDiagnosis`, then call `rules.getApplicableForHypotheticalRecord` with the finding's and the diagnosis's matches together, restricted to `['task', 'system_priority_evaluation']`. Rules already applicable from the finding alone are left out of the per-diagnosis result. Diagnosis rules are deliberately not evaluated again (no diagnosis→diagnosis chaining).

**Tech Stack:** Deno 2.8, Kysely + PostgreSQL 16, `std/testing/bdd`, repo test helpers under `test/_helpers/`.

**Spec:** No separate document. The spec is the request of 2026-09-19, reproduced here:

> `types.ts` now has
> ```ts
> export type RulesDryRun = {
>   findings_to_check_for: FindingToCheckFor[]
>   would_indicate_diagnoses: {
>     diagnosis: ApplicableRuleEffectSystemDiagnosisRule[]
>     would_indicate_priority: null | Priority
>     findings_to_check_for: FindingToCheckFor[]
>   }[]
>   would_indicate_priority: null | Priority
> }
> ```
> When the rules are actually run, a system diagnosis rule can in turn result in its own priority and additional findings to check for (but not *more* diagnoses, hence not recursion). So when we find diagnoses, do another call to `rules.getApplicableForHypotheticalRecord` with `matched_due_tos` including both the finding's and the diagnosis's matches and `type: ['task', 'system_priority_evaluation']`. The certainty matters for `system_priority_evaluation`, so account for it. Frontend need not use this yet; focus on the model.

**Decisions made while planning (flag to the user if they disagree):**
1. `diagnosis: ApplicableRuleEffectSystemDiagnosisRule[]` is read as *one entry per diagnosed concept*, holding every rule effect for that concept. This mirrors `system_diagnosis_rules.insertPositiveDiagnoses`, which groups by concept and records one diagnosis at the highest certainty. The second pass uses that highest certainty.
2. Top-level `would_indicate_priority` keeps its current meaning: the priority the finding raises *directly*. Each diagnosis entry's `would_indicate_priority` is what the diagnosis *adds*. The overall priority is `higherPriority` over all of them; the frontend can derive it.
3. Per-diagnosis `findings_to_check_for` exclude rules that the finding already made applicable by itself, so the entry lists only *additional* prompts.
4. The dry run does not check whether an equal-or-higher-certainty diagnosis is already on record (the real pipeline skips the insert then). Showing what the finding indicates is still informative; YAGNI for now.
5. Why certainty matters: `(diagnosis X possible)` and `(diagnosis X probable)` are different `due_to` rows (`dueToInsert` turns a diagnosis into an evaluation whose value concept is the certainty qualifier), and `active_condition` due_tos expand to probable + definite only (plus possible/equivocal only when flagged). So a *possible* anaphylaxis satisfies `Check for Anaphylaxis` but not `Urgent: Anaphylaxis`.

## Global Constraints

- Runtime is Deno 2.8.0. Type check with `deno task check | tail -40` (errors are at the bottom). Format with `deno fmt`.
- Tests are database-first; the local Postgres runs in docker and must be up. Run one file with `deno task test ./test/path/to.ts`. Model tests need no web servers.
- Only `external-clients/` may be mocked. Nothing here touches it.
- Naming: `snake_case` for data, `camelCase` for functions, `PascalCase` for types.
- Test files use `describeParallel`/`itParallel` from `test/_helpers/testParallel.ts` for DB tests, and `describe`/`it` from `std/testing/bdd.ts` for pure tests.
- The dry run must never write to the database.
- Do not run `deno task db:codegen` or rebuild databases; no migrations are needed here.
- Commit messages end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `shared/diagnosis.ts` | Certainty concepts and diagnosis→evaluation node. | Add `CERTAINTY_ORDER` (moved here from the model) and `groupDiagnosisEffectsByConcept`. |
| `db/models/system_diagnosis_rules.ts` | Real pipeline diagnosis insertion. | Import `CERTAINTY_ORDER` from shared instead of defining it. |
| `db/models/due_to.ts` | Matching records that are not yet inserted against `due_to`. | Generalise `hypotheticalInputs` to findings *or* evaluations; add `due_to.forHypotheticalDiagnosis`. |
| `db/models/rules_dry_run.ts` | The dry run. | Extract `collectRuleEffects` and `findingsToCheckFor`; add `consequencesOfDiagnosis`; produce the new `would_indicate_diagnoses` shape. |
| `test/shared/diagnosis_effects.test.ts` | Pure tests for grouping. | Create. |
| `test/models/rules_dry_run.test.ts` | DB tests for the dry run. | Add `due_to.forHypotheticalDiagnosis` and `would_indicate_diagnoses` describes, plus a parity test. |

Nothing in `islands/`, `routes/` or `test/web/` needs to change: `EMPTY_RULES_DRY_RUN` in `islands/WarningSigns/follow_ups.ts` already assigns `[]`, and the web test only asserts `Array.isArray(response.would_indicate_diagnoses)`.

**Current state:** `types.ts` already carries the new `RulesDryRun` type, so `deno task check` currently fails at `db/models/rules_dry_run.ts:100` (`would_indicate_diagnoses.push(rule.rule_effect)`). Task 3 fixes that.

---

### Task 1: `CERTAINTY_ORDER` and `groupDiagnosisEffectsByConcept` in `shared/diagnosis.ts`

**Files:**
- Modify: `shared/diagnosis.ts`
- Modify: `db/models/system_diagnosis_rules.ts:31-37` (remove the local `CERTAINTY_ORDER`, import it)
- Create: `test/shared/diagnosis_effects.test.ts`

**Interfaces:**
- Consumes: `DiagnosisCertainty` from `db.d.ts` (`'definite' | 'equivocal' | 'improbable' | 'possible' | 'probable'`).
- Produces:
  ```ts
  export const CERTAINTY_ORDER: Record<DiagnosisCertainty, number>
  export type DiagnosisEffectGroup<E extends { snomed_concept: { id: string; name: string }; certainty: DiagnosisCertainty }> = {
    diagnosis: E[]   // every effect for this concept, input order preserved
    strongest: E     // the highest-certainty effect among them
  }
  export function groupDiagnosisEffectsByConcept<E>(effects: E[]): DiagnosisEffectGroup<E>[]  // sorted by snomed_concept.name
  ```

- [ ] **Step 1: Write the failing test**

Create `test/shared/diagnosis_effects.test.ts`:

```ts
import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { CERTAINTY_ORDER, groupDiagnosisEffectsByConcept } from '../../shared/diagnosis.ts'

const anaphylaxis = { id: '39579001', name: 'Anaphylaxis' }
const meningitis = { id: '7180009', name: 'Meningitis' }

describe('shared/diagnosis.ts groupDiagnosisEffectsByConcept', () => {
  it('groups effects by concept, keeping the highest certainty as strongest', () => {
    const possible = { snomed_concept: anaphylaxis, certainty: 'possible' as const }
    const probable = { snomed_concept: anaphylaxis, certainty: 'probable' as const }
    assertEquals(
      groupDiagnosisEffectsByConcept([possible, probable]),
      [{ diagnosis: [possible, probable], strongest: probable }],
    )
  })

  it('sorts groups by concept name and keeps each group in input order', () => {
    const m = { snomed_concept: meningitis, certainty: 'probable' as const }
    const a1 = { snomed_concept: anaphylaxis, certainty: 'probable' as const }
    const a2 = { snomed_concept: anaphylaxis, certainty: 'possible' as const }
    assertEquals(
      groupDiagnosisEffectsByConcept([m, a1, a2]),
      [
        { diagnosis: [a1, a2], strongest: a1 },
        { diagnosis: [m], strongest: m },
      ],
    )
  })

  it('returns no groups for no effects', () => {
    assertEquals(groupDiagnosisEffectsByConcept([]), [])
  })

  it('orders certainties definite > probable > equivocal > possible > improbable', () => {
    assertEquals(
      Object.entries(CERTAINTY_ORDER).toSorted(([, a], [, b]) => b - a).map(([certainty]) => certainty),
      ['definite', 'probable', 'equivocal', 'possible', 'improbable'],
    )
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `deno task test ./test/shared/diagnosis_effects.test.ts`
Expected: FAIL — `CERTAINTY_ORDER`/`groupDiagnosisEffectsByConcept` are not exported from `shared/diagnosis.ts`.

- [ ] **Step 3: Implement in `shared/diagnosis.ts`**

Add these imports at the top (keep the existing ones):

```ts
import type { DiagnosisCertainty } from '../db.d.ts'
import sortBy from '../util/sortBy.ts'
```

Append at the bottom of the file:

```ts
export const CERTAINTY_ORDER: Record<DiagnosisCertainty, number> = {
  definite: 4,
  probable: 3,
  equivocal: 2,
  possible: 1,
  improbable: 0,
}

type DiagnosisEffect = {
  snomed_concept: { id: string; name: string }
  certainty: DiagnosisCertainty
}

export type DiagnosisEffectGroup<E extends DiagnosisEffect> = {
  // Every rule effect indicating this concept, in the order given
  diagnosis: E[]
  // The one the pipeline would record: the highest certainty among them
  strongest: E
}

/*
  The real pipeline records one diagnosis per concept, at the highest certainty any applicable
  rule gives it (system_diagnosis_rules.insertPositiveDiagnoses). Groups are sorted by concept
  name so callers are deterministic.
*/
export function groupDiagnosisEffectsByConcept<E extends DiagnosisEffect>(effects: E[]): DiagnosisEffectGroup<E>[] {
  const by_concept = new Map<string, E[]>()
  for (const effect of effects) {
    const group = by_concept.get(effect.snomed_concept.id)
    if (group) group.push(effect)
    else by_concept.set(effect.snomed_concept.id, [effect])
  }
  return sortBy([...by_concept.values()], (group) => group[0].snomed_concept.name).map((diagnosis) => ({
    diagnosis,
    strongest: diagnosis.reduce((best, effect) => CERTAINTY_ORDER[effect.certainty] > CERTAINTY_ORDER[best.certainty] ? effect : best),
  }))
}
```

- [ ] **Step 4: Point the model at the shared constant**

In `db/models/system_diagnosis_rules.ts`, delete the local block:

```ts
const CERTAINTY_ORDER: Record<ApplicableRuleEffectSystemDiagnosisRule['certainty'], number> = {
  definite: 4,
  probable: 3,
  equivocal: 2,
  possible: 1,
  improbable: 0,
}
```

and change the existing import line

```ts
import { CERTAINTY_QUALIFIER_TO_CONCEPT, diagnosisToEvaluation } from '../../shared/diagnosis.ts'
```

to

```ts
import { CERTAINTY_ORDER, CERTAINTY_QUALIFIER_TO_CONCEPT, diagnosisToEvaluation } from '../../shared/diagnosis.ts'
```

- [ ] **Step 5: Run the tests and type check**

Run: `deno task test ./test/shared/diagnosis_effects.test.ts`
Expected: PASS (4 tests).

Run: `deno task test ./test/models/system_diagnosis_rules.test.ts`
Expected: PASS (behaviour unchanged; the constant only moved).

Run: `deno task check | tail -40`
Expected: only the pre-existing error at `db/models/rules_dry_run.ts` about `would_indicate_diagnoses` (fixed in Task 3). No new errors.

- [ ] **Step 6: Commit**

```bash
deno fmt shared/diagnosis.ts db/models/system_diagnosis_rules.ts test/shared/diagnosis_effects.test.ts
git add shared/diagnosis.ts db/models/system_diagnosis_rules.ts test/shared/diagnosis_effects.test.ts
git commit -m "diagnosis: share CERTAINTY_ORDER and group diagnosis effects by concept

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: `due_to.forHypotheticalDiagnosis`

**Files:**
- Modify: `db/models/due_to.ts:396-536` (`hypotheticalInputs` and the `due_to` export)
- Test: `test/models/rules_dry_run.test.ts`

**Interfaces:**
- Consumes: `diagnosisToEvaluation` from `shared/diagnosis.ts`; `matchingQuery`/`hypotheticalInputs` already in `due_to.ts`.
- Produces:
  ```ts
  export type HypotheticalEvaluation = NonNullableProperty<Lang['evaluation'], 'root_snomed_concept' | 'specific_snomed_concept'>
  export type HypotheticalRecord = InsertableFindingBase | HypotheticalEvaluation
  due_to.forHypotheticalDiagnosis(trx, { patient_age_determination: AgeDetermination; diagnosis: Pick<Lang['diagnosis'], 'snomed_concept' | 'certainty_qualifier'> }): Promise<HypotheticalDueToMatch[]>
  ```
  `HypotheticalDueToMatch` is unchanged: `{ due_to_id: string; s_expression: string; history: boolean }`.

Background for the implementer: `dueToInsert` in `shared/rules.ts` stores a `(diagnosis X certainty)` due_to as the evaluation node `diagnosisToEvaluation` returns (root = Diagnosis, specific = X, value = the certainty qualifier concept), so its `s_expression` column is `inverseSExpression(diagnosisToEvaluation(...))`. The real pipeline inserts diagnoses through `patient_evaluations.insertOneNestedQuery`, whose CTEs are read by the same `matchingQuery`; the hypothetical only needs to fill those CTEs from literals, which `hypotheticalInputs` already does for findings. An evaluation node has the same `root_snomed_concept`/`specific_snomed_concept`/`value_snomed_concept`/`qualifiers`/`attributes` fields, and a diagnosis has no qualifiers or attributes.

- [ ] **Step 1: Write the failing test**

In `test/models/rules_dry_run.test.ts`, add these imports:

```ts
import { diagnosis as diagnosis_schema } from '../../shared/s_expression_schemas.ts'
import { diagnosisToEvaluation } from '../../shared/diagnosis.ts'
```

(`insertable_finding_base` is already imported from the schemas module; merge into that line if you prefer.)

Add this helper near the other helpers at the top:

```ts
// The s_expression the due_to table stores for a (diagnosis ...) rule clause
function diagnosisDueToSExpression(s_expression: string) {
  return inverseSExpression(diagnosisToEvaluation(parseWithSchema(s_expression, diagnosis_schema)))
}
```

Add this describe inside the top-level `describeParallel('db/models/rules_dry_run.ts', ...)`, after the `rules.getApplicableForHypotheticalRecord` describe:

```ts
  describeParallel('due_to.forHypotheticalDiagnosis', () => {
    itParallel('matches the due_to of exactly the stated certainty, without inserting anything', async () => {
      const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)

      const matched = await due_to.forHypotheticalDiagnosis(db, {
        patient_age_determination: 'adult',
        diagnosis: {
          snomed_concept: { atom: 'snomed_concept', name: 'Anaphylaxis', category: 'disorder' },
          certainty_qualifier: 'possible',
        },
      })

      // Check for Anaphylaxis is due to (diagnosis Anaphylaxis possible)
      const possible = diagnosisDueToSExpression('(diagnosis (snomed_concept "Anaphylaxis" "disorder") possible)')
      // Urgent: Anaphylaxis is due to (active_condition Anaphylaxis), which expands to probable and definite only
      const probable = diagnosisDueToSExpression('(diagnosis (snomed_concept "Anaphylaxis" "disorder") probable)')
      assert(matched.some(matching({ s_expression: possible })), `Expected ${possible} among ${JSON.stringify(matched)}`)
      assert(!matched.some(matching({ s_expression: probable })), `Did not expect ${probable} among ${JSON.stringify(matched)}`)

      const evaluations = await patient_evaluations.findAll(db, { patient_id: encounter.patient_id })
      assertEquals(evaluations.filter((e) => e.by_system), [], 'Dry run must not insert any diagnosis')
    })

    itParallel('matches active_condition due_tos for a probable diagnosis', async () => {
      const matched = await due_to.forHypotheticalDiagnosis(db, {
        patient_age_determination: 'adult',
        diagnosis: {
          snomed_concept: { atom: 'snomed_concept', name: 'Meningitis', category: 'disorder' },
          certainty_qualifier: 'probable',
        },
      })
      const probable = diagnosisDueToSExpression('(diagnosis (snomed_concept "Meningitis" "disorder") probable)')
      assert(matched.some(matching({ s_expression: probable })), `Expected ${probable} among ${JSON.stringify(matched)}`)
    })
  })
```

Add the import for `patient_evaluations`:

```ts
import { patient_evaluations } from '../../db/models/patient_evaluations.ts'
```

If `patient_evaluations.findAll` does not accept `{ patient_id }` alone or rows lack `by_system`, replace the last two lines of the first test with the same no-write check the existing first test uses:

```ts
      const records = await patient_findings.findAll(db, { patient_id: encounter.patient_id, patient_encounter_id: encounter.patient_encounter_id, include_negative: true })
      assertEquals(records, [], 'Dry run must not insert any records')
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `deno task test ./test/models/rules_dry_run.test.ts`
Expected: FAIL — `due_to.forHypotheticalDiagnosis is not a function` (type error at check time, runtime TypeError in the test).

- [ ] **Step 3: Generalise `hypotheticalInputs` in `db/models/due_to.ts`**

Add imports (line 4 already imports from `types.ts`; extend it):

```ts
import { AgeDetermination, NonNullableProperty, TrxOrDbOrQueryCreator } from '../../types.ts'
import { InsertableFindingBase, Lang } from '../../shared/s_expression_schemas.ts'
import { diagnosisToEvaluation } from '../../shared/diagnosis.ts'
import assertHasProperty from '../../util/assertHasProperty.ts'
```

Just above `function hypotheticalInputs`, add:

```ts
// A record that has not been inserted, matched against due_to as if it had been: a positive
// finding, or an evaluation such as the diagnosis a system_diagnosis_rule would record
export type HypotheticalEvaluation = NonNullableProperty<Lang['evaluation'], 'root_snomed_concept' | 'specific_snomed_concept'>
export type HypotheticalRecord = InsertableFindingBase | HypotheticalEvaluation
```

Change the signature and the first assertion:

```ts
function hypotheticalInputs(trx: TrxOrDbOrQueryCreator, record: HypotheticalRecord) {
  if (record.atom === 'finding') assert(record.existence === 'Yes', 'Only a positive finding can satisfy a due_to')
```

Then rename every remaining `finding.` inside the function body to `record.`. There are exactly five: `finding.qualifiers.map(...)`, `finding.attributes.map(...)`, and in the `inserting_records` literal `finding.root_snomed_concept`, `finding.specific_snomed_concept`, `finding.value_snomed_concept` (twice on that line). Update the comment above the measurements CTE from `// A clinical finding is never a measurement` to `// Neither a clinical finding nor a diagnosis is a measurement`.

- [ ] **Step 4: Add `forHypotheticalDiagnosis` to the `due_to` export**

After `forHypotheticalFinding` in the `export const due_to = { ... }` object:

```ts
  /*
    Which due_tos a diagnosis the rules would record, but have not, would satisfy. The certainty
    is part of the match: (diagnosis X possible) and (diagnosis X probable) are different due_tos,
    and an active_condition due_to expands to probable and definite (and possible, equivocal only
    when flagged), see shared/s_expression_active_condition_as_or.ts.
  */
  forHypotheticalDiagnosis(
    trx: TrxOrDbOrQueryCreator,
    { patient_age_determination, diagnosis }: {
      patient_age_determination: AgeDetermination
      diagnosis: Pick<Lang['diagnosis'], 'snomed_concept' | 'certainty_qualifier'>
    },
  ): Promise<HypotheticalDueToMatch[]> {
    const evaluation = diagnosisToEvaluation(diagnosis)
    assertHasProperty(evaluation, 'root_snomed_concept')
    assertHasProperty(evaluation, 'specific_snomed_concept')

    return matchingQuery(hypotheticalInputs(trx, evaluation), { patient_age_determination })
      .selectFrom('matching_due_tos')
      .selectAll('matching_due_tos')
      .execute()
  },
```

- [ ] **Step 5: Run the tests**

Run: `deno task test ./test/models/rules_dry_run.test.ts`
Expected: the two new `due_to.forHypotheticalDiagnosis` tests PASS and no pre-existing test regresses. The file may still refuse to type check because of `rules_dry_run.ts:100` (fixed in Task 3). `scripts/test/test.sh` passes extra flags through to `deno test`, so until Task 3 lands run: `deno task test --no-check ./test/models/rules_dry_run.test.ts`.

- [ ] **Step 6: Commit**

```bash
deno fmt db/models/due_to.ts test/models/rules_dry_run.test.ts
git add db/models/due_to.ts test/models/rules_dry_run.test.ts
git commit -m "due_to: match a hypothetical diagnosis against due_to at its certainty

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Restructure `rules_dry_run.ts` and group indicated diagnoses by concept

This task makes `deno task check` pass again and delivers the grouping half of the new shape. Per-diagnosis consequences stay empty until Task 4.

**Files:**
- Modify: `db/models/rules_dry_run.ts`
- Test: `test/models/rules_dry_run.test.ts`

**Interfaces:**
- Consumes: `groupDiagnosisEffectsByConcept` (Task 1).
- Produces (module-private, used by Task 4):
  ```ts
  type RuleEffects = {
    nodes: Map<string, Lang['finding']>
    task_ids_by_s_expression: Map<string, string[]>
    diagnoses: ApplicableRuleEffectSystemDiagnosisRule[]
    priority: null | Priority
  }
  function collectRuleEffects(applicable_rules: ApplicableRule[]): RuleEffects
  async function findingsToCheckFor(trx, { patient_id, patient_encounter_id, nodes, task_ids_by_s_expression }): Promise<FindingToCheckFor[]>
  ```

- [ ] **Step 1: Write the failing test**

In `test/models/rules_dry_run.test.ts`, add near the fixtures at the top:

```ts
// A direct disjunct of "Diagnose possible anaphylaxis"
const ITCHING_SUDDEN_ONSET = '(clinical_finding (snomed_concept "Itching" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))'

function indicatedDiagnosis(result: RulesDryRun, name: string) {
  const entry = result.would_indicate_diagnoses.find((d) => d.diagnosis[0].snomed_concept.name === name)
  assert(
    entry,
    `Expected ${name} among ${JSON.stringify(result.would_indicate_diagnoses.map((d) => d.diagnosis.map((e) => `${e.snomed_concept.name} ${e.certainty}`)))}`,
  )
  return entry
}
```

and extend the `types.ts` import:

```ts
import { NewRecordsToConsider, RulesDryRun } from '../../types.ts'
```

Add a new describe after `would_indicate_priority`:

```ts
  describeParallel('would_indicate_diagnoses', () => {
    itParallel('groups the diagnosis rules a finding would satisfy by concept', async () => {
      const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)
      const result = await dryRun(encounter, ITCHING_SUDDEN_ONSET)

      const anaphylaxis = indicatedDiagnosis(result, 'Anaphylaxis')
      assertMatches(anaphylaxis.diagnosis, [
        { type: 'system_diagnosis_rule', snomed_concept: { name: 'Anaphylaxis', category: 'disorder' }, certainty: 'possible' },
      ])

      // One entry per concept
      const names = result.would_indicate_diagnoses.map((d) => d.diagnosis[0].snomed_concept.name)
      assertEquals(names, uniq(names).toSorted())
      for (const entry of result.would_indicate_diagnoses) {
        assertEquals(uniq(entry.diagnosis.map((e) => e.snomed_concept.id)).length, 1, 'Every effect in an entry indicates the same concept')
      }
    })
  })
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `deno task test ./test/models/rules_dry_run.test.ts`
Expected: FAIL. Either a type error (`rule.rule_effect` is not assignable to the new element type) or, with `--no-check`, `d.diagnosis` is undefined because the model still pushes bare effects.

- [ ] **Step 3: Rewrite `db/models/rules_dry_run.ts`**

Replace the imports and everything from `const EMPTY_DRY_RUN` onward with the following. Keep the header comment and `modifiersOf` as they are.

Imports (replace the current import block):

```ts
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
```

Body after `modifiersOf`:

```ts
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
```

- [ ] **Step 4: Run the tests and type check**

Run: `deno task check | tail -40`
Expected: no errors.

Run: `deno task test ./test/models/rules_dry_run.test.ts`
Expected: PASS, including the new `would_indicate_diagnoses` test and every pre-existing test (the parity test and `existing_record` test exercise `findingsToCheckFor`).

- [ ] **Step 5: Commit**

```bash
deno fmt db/models/rules_dry_run.ts test/models/rules_dry_run.test.ts
git add db/models/rules_dry_run.ts test/models/rules_dry_run.test.ts
git commit -m "rules_dry_run: group indicated diagnoses by concept

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Per-diagnosis consequences: additional check_fors and priority, at the diagnosis's certainty

**Files:**
- Modify: `db/models/rules_dry_run.ts`
- Test: `test/models/rules_dry_run.test.ts`

**Interfaces:**
- Consumes: `due_to.forHypotheticalDiagnosis` (Task 2), `HypotheticalDueToMatch` from `db/models/due_to.ts`, `DiagnosisEffectGroup` and `groupDiagnosisEffectsByConcept` (Task 1), `collectRuleEffects`/`findingsToCheckFor` (Task 3), `rules.getApplicableForHypotheticalRecord` with `type: ['task', 'system_priority_evaluation']`.
- Produces: the full `RulesDryRun` per `types.ts`.

Fixtures, verified against `s_expression/*.ts`:
- `Diagnose possible anaphylaxis` has `(finding Itching (qualifier Sudden onset))` as a direct `or` disjunct.
- `Check for Anaphylaxis` (a task) is due to `(diagnosis Anaphylaxis possible)`.
- `Urgent: Anaphylaxis` (a priority) is due to `(active_condition Anaphylaxis)`: probable/definite only, so possible anaphylaxis must **not** raise priority.
- `Diagnose probable meningitis based on fever` needs `Stiff neck` AND one of (`active_condition Fever`, `Finding of vomiting`, `Nausea`) AND one of (`Drowsy`, `Acute confusion`, `Clouded consciousness`, `Purpuric rash`).
- `Urgent: probable meningitis` is due to `(active_condition Meningitis)`, so a probable meningitis **must** raise priority to Urgent.

- [ ] **Step 1: Write the failing tests**

Add imports to `test/models/rules_dry_run.test.ts`:

```ts
import { getTaskById } from '../../shared/tasks.ts'
import { system_diagnosis_rules } from '../../db/models/system_diagnosis_rules.ts'
import { higherPriority, type Priority } from '../../shared/priorities.ts'
```

Add a fixture next to `ITCHING_SUDDEN_ONSET`:

```ts
const CHECK_FOR_ANAPHYLAXIS_CHECK_FORS = (() => {
  const { to_be_done } = getTaskById('Check for Anaphylaxis')
  assert(isCheckFor(to_be_done))
  // The task lists Peanut twice; the dry run keys check_fors by s_expression
  return uniq(to_be_done.value.map((f) => inverseSExpression(f))).toSorted()
})()
```

Inside `describeParallel('would_indicate_diagnoses', ...)` add:

```ts
    itParallel('lists the additional check_for findings the tasks due to the diagnosis would prompt for', async () => {
      const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)
      const result = await dryRun(encounter, ITCHING_SUDDEN_ONSET)

      const anaphylaxis = indicatedDiagnosis(result, 'Anaphylaxis')
      assertEquals(
        sortBy(anaphylaxis.findings_to_check_for, 's_expression').map((f) => f.s_expression),
        CHECK_FOR_ANAPHYLAXIS_CHECK_FORS,
      )
      assert(anaphylaxis.findings_to_check_for.every((f) => f.task_ids.includes('Check for Anaphylaxis')))
      assert(anaphylaxis.findings_to_check_for.every((f) => f.existing_record === null))

      // Check for Anaphylaxis is due to the diagnosis, not the finding, so it is not among the finding's own prompts
      assert(!result.findings_to_check_for.some((f) => f.task_ids.includes('Check for Anaphylaxis')))
    })

    itParallel('reports an existing record for check_for findings the diagnosis prompts for', async () => {
      const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)
      await insertFindings(encounter, ['(no (clinical_finding (snomed_concept "Insect sting" "disorder")))'])

      const anaphylaxis = indicatedDiagnosis(await dryRun(encounter, ITCHING_SUDDEN_ONSET), 'Anaphylaxis')
      assertMatches(
        anaphylaxis.findings_to_check_for.filter((f) => f.existing_record),
        [{
          s_expression: normalForm('(clinical_finding (snomed_concept "Insect sting" "disorder"))'),
          existing_record: { existence: 'No' },
        }],
      )
    })

    itParallel('does not raise the priority for a certainty the priority rule is not due to', async () => {
      const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)
      // Urgent: Anaphylaxis is due to (active_condition Anaphylaxis): probable or definite, not possible
      const anaphylaxis = indicatedDiagnosis(await dryRun(encounter, ITCHING_SUDDEN_ONSET), 'Anaphylaxis')
      assertMatches(anaphylaxis.diagnosis, [{ certainty: 'possible' }])
      assertEquals(anaphylaxis.would_indicate_priority, null)
    })

    itParallel('raises the priority a probable diagnosis is due to, combining the finding with recorded evidence', async () => {
      const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)
      const drowsy = '(clinical_finding (snomed_concept "Drowsy" "finding"))'

      // Diagnose probable meningitis based on fever needs a stiff neck and nausea alongside drowsiness
      const before = await dryRun(encounter, drowsy)
      assert(!before.would_indicate_diagnoses.some((d) => d.diagnosis[0].snomed_concept.name === 'Meningitis'))

      await insertFindings(encounter, [
        '(clinical_finding (snomed_concept "Stiff neck" "finding"))',
        '(clinical_finding (snomed_concept "Nausea" "finding"))',
      ])

      const meningitis = indicatedDiagnosis(await dryRun(encounter, drowsy), 'Meningitis')
      assertMatches(meningitis.diagnosis, [{ certainty: 'probable' }])
      // Urgent: probable meningitis is due to (active_condition Meningitis)
      assertEquals(meningitis.would_indicate_priority, 'Urgent')
    })

    itParallel('matches what the real pipeline does once the diagnosis is recorded', async () => {
      const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)
      const { patient_id, patient_encounter_id } = encounter

      const dry_run = indicatedDiagnosis(await dryRun(encounter, ITCHING_SUDDEN_ONSET), 'Anaphylaxis')

      const { new_records } = await insertFindings(encounter, [ITCHING_SUDDEN_ONSET])
      const diagnoses_result = await system_diagnosis_rules.insertSystemDiagnosesIfNotAlreadyIdentified(db, {
        ...new_records,
        listener_id: 'test',
        listener_name: 'test',
      })
      assert(diagnoses_result.startsWith('Inserted '), diagnoses_result)
      const recorded = await patient_evaluations.findOne(db, {
        patient_id,
        s_expression: '(diagnosis (snomed_concept "Anaphylaxis" "disorder") possible)',
      })
      const from_diagnosis: NewRecordsToConsider = {
        patient_id,
        patient_encounter_id,
        patient_age_determination: 'adult',
        records: [{ id: recorded.id, existence: 'Yes' }],
      }

      // What EvaluationAdded's insertTasksIfNotAlreadyIdentified would insert
      const tasks_to_insert = await additional_tasks.getTasksToInsertUsingPreComputedTables(db, from_diagnosis)
      assert(!isString(tasks_to_insert))
      const actual_check_fors = uniq(
        tasks_to_insert.flatMap((task) => isCheckFor(task.to_be_done) ? task.to_be_done.value.map((f) => inverseSExpression(f)) : []),
      ).toSorted()
      assertEquals(sortBy(dry_run.findings_to_check_for, 's_expression').map((f) => f.s_expression), actual_check_fors)

      // What EvaluationAdded's insertSystemPriorityEvaluationsIfNotAlreadyIdentified would raise triage to
      const priority_rules = await rules.getApplicableBasedOnNewRecords(db, from_diagnosis, 'system_priority_evaluation')
      assert(!isString(priority_rules))
      const actual_priority = priority_rules.reduce<null | Priority>((acc, rule) => {
        assert(rule.rule_effect.type === 'system_priority_evaluation')
        return higherPriority(rule.rule_effect.priority, acc) ?? null
      }, null)
      assertEquals(dry_run.would_indicate_priority, actual_priority)
    })
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `deno task test ./test/models/rules_dry_run.test.ts`
Expected: the five new tests FAIL. `findings_to_check_for` is `[]` where `CHECK_FOR_ANAPHYLAXIS_CHECK_FORS` is expected; `would_indicate_priority` is `null` where `'Urgent'` is expected; the parity test fails on the check_for list. The "does not raise the priority" test passes vacuously already, which is fine: it guards against Task 4 over-reaching.

- [ ] **Step 3: Implement `consequencesOfDiagnosis` in `db/models/rules_dry_run.ts`**

Add imports:

```ts
import type { HypotheticalDueToMatch } from './due_to.ts'
import { type DiagnosisEffectGroup, groupDiagnosisEffectsByConcept } from '../../shared/diagnosis.ts'
```

(replace the plain `groupDiagnosisEffectsByConcept` import from Task 3 with the second line).

Add above `export const rules_dry_run`:

```ts
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
      snomed_concept: { atom: 'snomed_concept', name: strongest.snomed_concept.name, category: strongest.snomed_concept.category },
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
```

In `forHypotheticalFinding`, replace the `would_indicate_diagnoses` computation from Task 3 with:

```ts
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
```

If `Lang['snomed_concept']['category']` is narrower than `SnomedCategory` from `db.d.ts` and the literal above fails to type check, look at how `system_diagnosis_rules.insertPositiveDiagnoses` builds its node (`{ atom: 'snomed_concept', ...highest_certainty_rule.rule_effect.snomed_concept }`) and do the same.

- [ ] **Step 4: Update the header comment of `rules_dry_run.ts`**

Replace the numbered steps in the file's header comment with:

```
  Follows the same steps that run when a finding is actually inserted
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
```

- [ ] **Step 5: Run the tests and type check**

Run: `deno task check | tail -40`
Expected: no errors.

Run: `deno task test ./test/models/rules_dry_run.test.ts`
Expected: PASS, all tests including the five new ones and the pre-existing parity test.

If the parity test fails on the check_for list, print both sides and compare: a mismatch where the real pipeline lists *more* means a task is due to both the finding and the diagnosis and Decision 3 dropped it; a mismatch where the dry run lists *more* means `getTasksToInsertUsingPreComputedTables` filtered a task because a matching procedure already exists. Report either to the user rather than loosening the assertion.

- [ ] **Step 6: Commit**

```bash
deno fmt db/models/rules_dry_run.ts test/models/rules_dry_run.test.ts
git add db/models/rules_dry_run.ts test/models/rules_dry_run.test.ts
git commit -m "rules_dry_run: report the check_fors and priority each indicated diagnosis adds

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Whole-suite verification

**Files:** none modified unless a failure is found.

- [ ] **Step 1: Type check and format**

Run: `deno task check | tail -40`
Expected: clean.

Run: `deno fmt --check`
Expected: clean. If not, `deno fmt` and amend the last commit.

- [ ] **Step 2: Run the affected model and shared tests**

Run:
```bash
deno task test ./test/shared/diagnosis_effects.test.ts
deno task test ./test/models/rules_dry_run.test.ts
deno task test ./test/models/system_diagnosis_rules.test.ts
deno task test ./test/models/additional_tasks.test.ts
deno task test ./test/models/system_priority_evaluations.test.ts
deno task test ./test/islands/WarningSigns/follow_ups.test.ts
```
Expected: all PASS.

- [ ] **Step 3: Run the web test for the dry-run route**

`scripts/test/test.sh` starts the test servers itself when given a `test/web` path. A cold start can exceed the 25s health-check timeout; if the run fails on health check, start `./scripts/test/run_servers.sh` in the background first, wait for ports 8004 and 8005 to answer, then rerun.

```bash
deno task test ./test/web/patients/open_encounter/rules_dry_run.test.ts
```
Expected: PASS. Its assertions are shape-only for `would_indicate_diagnoses`. If you started the servers by hand, kill the processes on ports 8004/8005 afterwards.

- [ ] **Step 4: Report**

State plainly which commands ran and their outcomes. If anything was skipped (for example the web test because servers could not start), say so.

---

## Self-Review

**Spec coverage**
- New `RulesDryRun` shape produced: Task 3 (grouping) + Task 4 (per-diagnosis priority and check_fors). ✔
- Second call to `rules.getApplicableForHypotheticalRecord` with finding + diagnosis due_tos and `type: ['task', 'system_priority_evaluation']`: Task 4 `consequencesOfDiagnosis`. ✔
- No diagnosis→diagnosis recursion: the `type` restriction excludes `system_diagnosis_rule`. ✔
- Certainty accounted for: Task 2 matches at the exact certainty; Task 4 uses the strongest certainty per concept; tests cover possible→no priority and probable→Urgent. ✔
- Frontend untouched. ✔

**Placeholder scan:** none. Every step has its code or exact command.

**Type consistency:** `collectRuleEffects`/`findingsToCheckFor`/`RuleEffects` named identically in Tasks 3 and 4; `HypotheticalDueToMatch` unchanged; `DiagnosisEffectGroup<E>` fields `diagnosis`/`strongest` used identically in Tasks 1 and 4; `forHypotheticalDiagnosis` takes `{ patient_age_determination, diagnosis: { snomed_concept, certainty_qualifier } }` in Tasks 2 and 4.

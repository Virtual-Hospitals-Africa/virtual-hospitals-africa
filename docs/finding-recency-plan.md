# Make finding-recency a first-class part of the rules system

## Your task

Two changes, already decided. Do them in order.

**A. Stop erasing the recency wrapper from `check_for`.** Today `(<= (timestamp (clinical_finding "Constipation")) (time_ago 24 hours))` inside a `check_for` parses to the _same node_ as `(clinical_finding "Constipation")`. The comparator and the duration are discarded before any test — or any runtime code — sees them. Preserve them.

**B. Teach a rule's `due_to` to consume recency.** Right now no `system_diagnosis_rule` or `system_priority_evaluation` can express "onset was more than 24 hours ago", so the 28 recency checks in the corpus collect data that nothing can ever read.

(These were options "A" and "D" in the discussion that produced this doc. There is no option C/B to revisit — the decision is made.)

Do not start by rewriting the `.lisp` corpus. The corpus is already correct; the machinery under it is what's missing.

## Background

`s_expression/rules/**/*.lisp` holds the clinical rules, hand-written in a small Lisp. Three node types matter here:

- `(task "description" adult <due_to> <to_be_done>)` — when `due_to` is satisfied, tell the health worker to do `to_be_done`. One `to_be_done` form is `(check_for <finding> …)`: findings to ask about or observe.
- `(system_diagnosis_rule "description" (diagnosis … probable) adult <due_to>)`
- `(system_priority_evaluation "description" adult Urgent <due_to>)`

The `.lisp` files are parsed by zod schemas in [shared/s_expression_schemas.ts](../shared/s_expression_schemas.ts) and compiled to three generated TS arrays — `s_expression/tasks.ts`, `s_expression/system_diagnosis_rules.ts`, `s_expression/system_priority_evaluations.ts` — by `deno task compile:s_expressions` ([s_expression/compile.ts:72](../s_expression/compile.ts#L72)). Those files say "Auto-generated / Do not edit manually"; `deno task rules:rebuild` regenerates them and reseeds `31_rules`.

Nodes round-trip back to source text through [`inverseSExpression`](../shared/s_expression_inverse.ts). Its output string is the canonical identity of a node everywhere in the codebase — used as map keys, for matching existing patient records, and by the tests below. `docs/rules-guide.md` documents the Lisp for rule authors; it does **not** currently mention the recency form at all.

## The problem, precisely

### 1. `check_for` throws the recency away

[shared/s_expression_schemas.ts:829-857](../shared/s_expression_schemas.ts#L829-L857):

```ts
const can_check_for = z.lazy(() => insertable_finding_base.or(event_recency_comparator))

export const check_for = z.lazy(() =>
  z.object({ atom: z.literal('check_for'), args: can_check_for.array() })
    .transform(({ args: check_for }) => ({
      atom: 'procedure' as const,
      // …
      value: check_for.map((node) => {
        const inner_finding: InsertableFindingBase = node.atom === 'finding' ? node : node.finding
        return { ...inner_finding, existence: 'Any' as const } // <-- comparator + duration lost here
      }),
    }))
)
```

`Lang['procedure'].value` is typed `… | MatchingFinding[]` ([:119](../shared/s_expression_schemas.ts#L119)), and `MatchingFinding` ([:197](../shared/s_expression_schemas.ts#L197)) has no slot for a comparator. The loss is baked into the generated files too: `s_expression/tasks.ts` contains a bare `(finding … "Constipation")` in that check_for list.

### 2. A rule cannot express recency even if it wanted to

- [`any_query_evidence`](../shared/s_expression_schemas.ts#L1172) and [`any_query_single`](../shared/s_expression_schemas.ts#L1156) admit `measurement_comparator` but **not** `event_recency_comparator`. A `(timestamp …)` comparison in a `due_to` is a parse error today.
- [`allEvidenceToLookFor`](../db/models/s_expression_evidence.ts#L21-L25) yields comparator nodes only `if (node.type === 'measurement')`.
- `s_expression_evidence.evaluate` returns `{ satisfies: false }` for the rest, with the comment _"time_ago comparisons are not yet supported for evidence tracking"_.
- The five comparator entries in [`EXPRESSION_BUILDERS`](../db/models/s_expression.ts#L385) (`'>'`, `'<'`, `'>='`, `'<='`, `'='`, around lines 640-671) each do `node as MeasurementComparison` — a cast that is already unsound, since `Lang[Comparisons]` is a union of the measurement _and_ event_recency variants and the object is declared `satisfies { [T in QueryableSingleNode['atom']]: (…, node: QueryableSingleNode & { atom: T }) => … }`.

### 3. What this breaks

Two tests on this branch, both in [test/shared/compiled_s_expressions.test.ts](../test/shared/compiled_s_expressions.test.ts), added to push the rules system toward being closed (every `check_for` feeding some rule, every rule fed by some `check_for`):

- **`each finding we check_for is used as part of a due_to for at least one system_diagnosis_rule or system_priority_evaluation`** — 240 failures. Roughly a dozen are recency checks flattened to bare findings. These are _expected_ failures for now: the test exists to enumerate the gaps.
- **`no task checks for a finding that is already part of its own due_to`** — 2 failures, and **one is a false positive caused by the erasure**:
  - `Check for urgent constipation conditions` / `Constipation` — **false positive**. [48-constipation-and-anal-symptoms.lisp](../s_expression/rules/apc-adult/48-constipation-and-anal-symptoms.lisp) is triggered by `Constipation` and then checks `(<= (timestamp (clinical_finding "Constipation")) (time_ago 24 hours))` — not a restatement of the trigger, a _narrowing_ of it. Phase A makes this clear automatically, since `inverseSExpression` renders the two differently.
  - `Check for urgent skin lump conditions` / `Mass of skin` — **genuine**, leave it failing. [74-skin-lumps.lisp:17](../s_expression/rules/apc-adult/74-skin-lumps.lisp#L17) literally re-checks its own bare trigger.

## Recency semantics

`(<= (timestamp X) (time_ago 24 hours))` means **onset at or before 24 hours ago**, i.e. "X has been going on for at least 24 hours" (APC page 48: constipation for more than 24 hours plus abdominal pain/distension is urgent). The comparator maps directly onto a datetime comparison — no inversion:

- `<=` → `onset <= now() - 24 hours` (been going on at least that long)
- `>=` → `onset >= now() - 24 hours` (started within that window)

This needs an **onset** datetime, not `created_at`. `patient_records_aggregated` has only `created_at`, so do not use it.

## The write path already exists (partly)

A finding can carry its onset as an event-typed attribute: `root_snomed_concept = EVENT` ([shared/snomed_concepts.ts:87](../shared/snomed_concepts.ts#L87)), `specific_snomed_concept = TIME_OF_ONSET` ([:682](../shared/snomed_concepts.ts#L682)), `value = { atom: 'event', datetime }`. It is written to `patient_events.datetime` ([db/models/patient_findings.ts:244-270](../db/models/patient_findings.ts#L244-L270)) and reachable in a query by joining `patient_record_qualifiers` then `patient_events` — see the existing `attribute` builder at [db/models/s_expression.ts:504-534](../db/models/s_expression.ts#L504-L534), which uses `qualifies_record_id` to get back to the qualified record.

The finding **modal** already collects it: [islands/finding/ModalContents.tsx:91-108](../islands/finding/ModalContents.tsx#L91-L108) builds exactly that attribute from [`OnsetRow`](../islands/finding/Onset.tsx).

**But the `check_for` UI does not.** [components/triage/tasks/CheckFor.tsx](../components/triage/tasks/CheckFor.tsx) is a Yes/No/Unknown grid with no date input, and [`check_for.CheckForSchema`](../db/models/check_for.ts) accepts only `{ s_expression, existence, existing_record }`. So a recency check answered "Yes" records the finding with no onset, and the Phase B query can never match. Phase C below covers this.

## Plan

### Phase A — preserve the recency (schema + every consumer)

Keep the comparator node in the array. `inverseSExpression` **already** renders it correctly ([shared/s_expression_inverse.ts:176-184](../shared/s_expression_inverse.ts#L176-L184)), which is why this shape is preferable to bolting a `recency?` field onto the finding node — a field on `MatchingFinding` would be silently dropped by `inverseSExpression`, since that function takes `AnyNode` and would never see it.

1. **Types** in `shared/s_expression_schemas.ts`:
   - Add a check_for-flavoured recency type whose inner finding can be `'Any'`, mirroring how `MatchingFinding` relates to `InsertableFindingBase`:
     ```ts
     export type CheckForRecency = Omit<EventTimeComparison, 'finding'> & { finding: MatchingFinding }
     export type CheckForItem = MatchingFinding | CheckForRecency
     ```
   - `Lang['procedure'].value` ([:119](../shared/s_expression_schemas.ts#L119)): `MatchingFinding[]` → `CheckForItem[]`.
   - `ToBeDoneProcedureCheckFor` ([:205](../shared/s_expression_schemas.ts#L205)): `value: CheckForItem[]`.
   - Export a helper the consumers can share — the finding a check_for item asks you to _record_:
     ```ts
     export function checkForFinding(item: CheckForItem): MatchingFinding {
       return item.atom === 'finding' ? item : item.finding
     }
     ```
2. **The transform** ([:849-855](../shared/s_expression_schemas.ts#L849-L855)): keep the wrapper, set `existence: 'Any'` on the inner finding in both branches.
3. **`inverseSExpression` line 99** ([shared/s_expression_inverse.ts:99](../shared/s_expression_inverse.ts#L99)):
   ```ts
   const atom = node.value[0].atom === 'finding' ? 'check_for' : 'measure'
   ```
   A recency item first in the list would render the whole procedure as `(measure …)` and corrupt the generated files on the next `compile:s_expressions`. Fix it to test for a measurement rather than sniffing `value[0]` for `'finding'`.
4. **`isCheckFor`** ([db/models/additional_tasks.ts:71](../db/models/additional_tasks.ts#L71)) has the same `value[0].atom === 'finding'` fragility. Make it robust (e.g. every item is a finding or a event_recency); `isMeasurements` just below stays as-is.
5. **`db/models/additional_tasks.ts`** — unwrap with `checkForFinding` at both sites:
   - [:199-218](../db/models/additional_tasks.ts#L199-L218), building `s_expression_to_existing_findings`. Key by the **inner finding**'s s_expression: that is what `buildExpression` can query, and "has the health worker recorded this at all?" is the right question here. (Extra attributes on the stored record, e.g. onset, do not exclude it from a bare-finding match, so this keeps working.)
   - [:371-383](../db/models/additional_tasks.ts#L371-L383), the render path. `s_expression` and `displays` must come from the inner finding — the form posts that string straight back through `CheckForSchema`, which validates against `insertable_finding_base`. Carry the recency alongside it so the UI can act on it.
   - While here: [83-self-harm-or-suicide.lisp](../s_expression/rules/apc-adult/83-self-harm-or-suicide.lisp) checks for both `(clinical_finding "Suicidal thoughts")` **and** its 1-month recency form. After Phase A those are two items rendering the same finding. Dedupe by inner finding and keep the recency requirement, or the health worker sees the question twice.
6. **`types.ts:2858-2863`** — add the optional recency to the finding variant of `RenderedTaskToBeDone`.
7. **`db/models/system_diagnosis_rules.ts:285`** — `task.to_be_done.value as unknown as Lang['finding'][]` then `{ ...finding, existence: 'No' }`. Unwrap properly and drop the cast.
8. **Regenerate**: `deno task compile:s_expressions`. The three generated arrays will change — the recency forms reappear in `s_expression/tasks.ts`. Expect that diff; review it to confirm every one of the 28 recency checks round-tripped.
9. **Tests**:
   - [test/models/additional_tasks.test.ts:29-30](../test/models/additional_tasks.test.ts#L29-L30) returns `to_be_done.value` raw.
   - The two older "leverages findings we check for …" tests ([:151](../test/shared/compiled_s_expressions.test.ts#L151) and [:229](../test/shared/compiled_s_expressions.test.ts#L229)) build `all_checking_for` from `to_be_done.value.map(inverseSExpression)`. Add **both** forms per item — the recency string and the bare inner finding — because a recency check necessarily also establishes the bare finding. Without this, those two currently-passing tests regress.
   - Expected after Phase A: self-referentiality drops 2 → 1 (`Mass of skin` only). The 240-failure test stays at roughly 240 — the recency entries change shape rather than disappearing. That is correct; they close in Phase D.

### Phase B — let `due_to` consume recency

1. `shared/s_expression_schemas.ts`: add `event_recency_comparator` to [`any_query_single`](../shared/s_expression_schemas.ts#L1156) and [`any_query_evidence`](../shared/s_expression_schemas.ts#L1172). It shares its `atom`s with `measurement_comparator`; zod discriminates on `args` shape (`[timestamp, time_ago]` vs `[measurement, decimal]`). Verify both still parse.
2. [`db/models/s_expression_evidence.ts`](../db/models/s_expression_evidence.ts): widen `EvidenceNode` to include `EventTimeComparison`; have `allEvidenceToLookFor` yield recency comparators; and in both `evaluate` and `evaluateMultiple`, route the comparator cases to `evaluateSingle` for `type === 'event_recency'` instead of returning `{ satisfies: false }`. Delete the stale "not yet supported" comment.
3. [`db/models/s_expression.ts`](../db/models/s_expression.ts), the five comparator builders (~640-671): branch on `node.type`. For `event_recency`, take the finding query from `EXPRESSION_BUILDERS.finding(trx, patient, node.finding)` and constrain it to records carrying an onset attribute past the cutoff:
   ```ts
   .where('patient_records_aggregated.id', 'in',
     trx.selectFrom('patient_records_aggregated as onset_record')
       .innerJoin('patient_record_qualifiers', 'patient_record_qualifiers.id', 'onset_record.id')
       .innerJoin('patient_events', 'patient_events.id', 'patient_record_qualifiers.id')
       .where('onset_record.root_snomed_concept_name', '=', EVENT.name)
       .where('onset_record.specific_snomed_concept_name', '=', TIME_OF_ONSET.name)
       .where('patient_events.datetime', node.atom, cutoff)
       .select('patient_record_qualifiers.qualifies_record_id'))
   ```
   Sketch, not gospel — follow the conventions of the neighbouring `attribute` builder, which does the same join and is the reason this shape works. Compute `cutoff` in SQL (`sql\`now() - ${…}::interval\``) rather than in TS so it is evaluated at query time;`Duration.units`are already plural lowercase (`hours`,`weeks`,`months`,`years`) and drop straight into a Postgres interval. Note the existing`attribute`builder hardcodes`=` on the datetime, so it cannot be reused directly for a range.
4. Write model tests for the new builder: a finding with onset inside the window, one outside it, and one with **no** onset attribute at all (must not match). Database-first, per this repo's convention — only `external-clients/` gets mocked.

### Phase C — capture onset when a recency check is answered

Without this, Phase B is dead code at runtime.

1. `components/triage/tasks/CheckFor.tsx` — when the item carries recency and the answer is Yes, collect the onset. `islands/finding/Onset.tsx` (`OnsetRow`, `DatetimeInput`) and `islands/finding/ModalContents.tsx:91-108` are the models to follow.
2. `db/models/check_for.ts` — extend `CheckForSchema` with the optional onset, and have `asInsertableFindings` attach the `EVENT` / `TIME_OF_ONSET` event attribute.
3. **Verify a suspected pre-existing bug while you are here**: `ModalContents.tsx:44` initialises `dates` to `null` and only populates it from `OnsetRow`'s `onChange`. If a health worker never touches the onset field, no onset attribute is attached — even though the input renders a default (`yesterdayAtNoonInJohannesburg()`) and is marked `required`. Confirm before changing anything; if real, initialising `dates` from the same defaults is the likely fix.

**Ask the user about the UI shape before building it.** A datetime picker revealed on "Yes" is the faithful option; a derived "started more / less than 24 hours ago" toggle built from the rule's own duration is faster for the health worker but records less. This is their call, not yours.

### Phase D — close the loop

Only now touch the corpus. With A-C in place, author `due_to`s that actually consume the recency (page 48's urgent constipation is the obvious first one), re-run the closed-system test, and watch the count drop. There are 28 recency checks over 14 files and 16 concepts — the biggest clusters are `Unable to break wind` (×4) and the four suicide-risk findings on page 83. Document the recency form in `docs/rules-guide.md`, which covers `check_for` at line 42 and never mentions it.

## Decisions already made (do not re-litigate)

- **A bare-finding reference in a rule does not count as "using" a recency check.** If a rule only asks for bare `Constipation`, the onset we collected is unused, and the closed-system test should keep saying so.
- **A recency check _does_ count as checking for the bare finding** in the two older forward tests — recording onset entails recording the finding.
- Self-referentiality is judged on exact `inverseSExpression` equality. A check that narrows its trigger (extra qualifier, recency wrapper) is not self-referential; only a literal restatement is.

## Verification

```bash
deno task check | tail                                        # errors are at the bottom
deno fmt
deno task test ./test/shared/compiled_s_expressions.test.ts
deno task test ./test/models/additional_tasks.test.ts
deno task test ./test/models/system_diagnosis_rules.test.ts
deno task compile:s_expressions                               # then review the generated diff
```

Expected end state: `no task checks for a finding that is already part of its own due_to` fails with exactly one entry (`Mass of skin`), the two older forward tests still pass, and the 240-entry closed-system test drops by up to 28 as Phase D rules land. It is fine — expected — for that test to stay red; it is an inventory of gaps, not a regression.

Leave `deno task local db:rebuild` and `deno task db:codegen` to the human devs.

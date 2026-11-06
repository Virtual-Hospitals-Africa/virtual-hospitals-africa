// Deterministic gate for a folder of APC rule files, using VHA's own parser and helpers.
// Mirrors test/shared/compiled_s_expressions.test.ts on PR #1310 (Will's six constraints),
// but reads .lisp files from disk so a candidate rule set can be checked before it is compiled.
// SNOMED existence (constraint 1) is not checked here: the concepts are written out and
// checked by check_concepts.py against a copy of VHA's lookup table built from the RF2 release.
//
// Run from the root of a VHA checkout (it is copied there as apc2026_gate.ts):
//   NO_EXTERNAL_CONNECT=1 deno run -A apc2026_gate.ts <out.json> <apc_dir> [<other .lisp files>...]
import { parseLispFile } from './s_expression/compile.ts'
import { parseWithSchema } from './shared/s_expression.ts'
import { insertable_finding_base, type Lang } from './shared/s_expression_schemas.ts'
import { allEvidenceToLookFor } from './db/models/s_expression_evidence.ts'
import { inverseSExpression } from './shared/s_expression_inverse.ts'
import { ALL_ASSESSMENT_OPTIONS_PARSED, VITALS_ADULT_SNOMED_CONCEPT_NAMES } from './shared/vitals.ts'
import { isCheckFor } from './db/models/additional_tasks.ts'
import { allConceptsToLookFor } from './shared/s_expression_concepts.ts'
import { WARNING_SIGNS } from './shared/warning_signs.ts'
import { COMMON_SYMPTOMS } from './shared/common_symptoms.ts'

const [out_path, apc_dir, ...other_files] = Deno.args
type Rule = Awaited<ReturnType<typeof parseLispFile>>[number]
type Finding = { file: string; page: string | null; check: string; description: string; detail: string }

const apc_files: string[] = []
for await (const e of Deno.readDir(apc_dir)) if (e.isFile && e.name.endsWith('.lisp')) apc_files.push(`${apc_dir}/${e.name}`)
apc_files.sort()

const parsed = new Map<string, Rule[]>()
const parse_errors: { file: string; error: string }[] = []
for (const f of [...apc_files, ...other_files]) {
  try {
    parsed.set(f, await parseLispFile(f))
  } catch (e) {
    parse_errors.push({ file: f, error: String(e).slice(0, 2000) })
  }
}
const pageOf = (f: string) => f.startsWith(apc_dir) ? f.split('/').pop()!.match(/^(\d+)/)?.[1] ?? null : null

const findings: Finding[] = []
const add = (file: string, check: string, description: string, detail: string) =>
  findings.push({ file, page: pageOf(file), check, description, detail })

// Constraint 6: one .lisp file per page number
const by_page = new Map<string, string[]>()
for (const f of apc_files) {
  const p = pageOf(f)
  if (!p) add(f, 'FILE NAME HAS NO PAGE NUMBER', '', f)
  else by_page.set(p, [...(by_page.get(p) ?? []), f])
}
for (const [p, fs] of by_page) if (fs.length > 1) for (const f of fs) add(f, 'MORE THAN ONE FILE FOR PAGE', '', `page ${p}: ${fs.join(', ')}`)

// Constraint 1 inputs: every concept, with where it came from
// VHA's allConceptsToLookFor skips some positions (e.g. the body site of a finding_site
// attribute), so also walk the whole parsed tree; `vha_checks` says whether VHA's test sees it.
const concepts: { file: string; description: string; name: string; category: string; vha_checks: boolean }[] = []
// deno-lint-ignore no-explicit-any
function* deepConcepts(x: any): Generator<{ name: string; category: string }> {
  if (Array.isArray(x)) for (const y of x) yield* deepConcepts(y)
  else if (x && typeof x === 'object') {
    if (typeof x.name === 'string' && typeof x.category === 'string') yield { name: x.name, category: x.category }
    for (const v of Object.values(x)) yield* deepConcepts(v)
  }
}
for (const [file, rules] of parsed) {
  for (const rule of rules) {
    // deno-lint-ignore no-explicit-any
    const vha = new Set(Array.from(allConceptsToLookFor(rule as any), (c) => `${c.name}\u0000${c.category}`))
    const seen = new Set<string>()
    for (const c of deepConcepts(rule)) {
      const k = `${c.name}\u0000${c.category}`
      if (seen.has(k)) continue
      seen.add(k)
      concepts.push({ file, description: rule.description, name: c.name, category: c.category, vha_checks: vha.has(k) })
    }
  }
}

const all = [...parsed.entries()].flatMap(([file, rules]) => rules.map((rule) => ({ file, rule })))
const tasks = all.filter((r) => r.rule.atom === 'task') as { file: string; rule: Lang['task'] }[]
const rules_with_due_to = all.filter((r) => r.rule.atom === 'system_diagnosis_rule' || r.rule.atom === 'system_priority_evaluation') as {
  file: string
  rule: Lang['system_diagnosis_rule' | 'system_priority_evaluation']
}[]

// Duplicate descriptions: a rule's database id is its description (db/seed/defs/31_rules.ts)
const by_desc = new Map<string, string[]>()
for (const { file, rule } of all) by_desc.set(rule.description, [...(by_desc.get(rule.description) ?? []), file])
for (const [d, fs] of by_desc) if (fs.length > 1) for (const f of new Set(fs)) add(f, 'DUPLICATE RULE DESCRIPTION', d, fs.join(', '))

// Two places where Will's test (PR #1310 at 936ef54e4) reads the constraints more strictly than this gate:
//  - its priority-evaluation and probable-diagnosis checks need (no X) itself checked for; this gate
//    accepts a check for X. (Unpatched, inverseSExpression also renders (no X) with the internal "No"
//    value, which defeats the test's own `(no ${s})` lookup; the loader patches that for the load.)
//    The "No" value sits right after X's main concept, so for a qualified X it comes before the
//    qualifier or finding site; `positive` removes it wherever it sits (fixed 2026-11-05: an end-only
//    pattern missed 65 qualified uses and caused 57 false findings);
//  - allEvidenceToLookFor skips time comparisons, so a finding used only inside (onset ...) counts
//    as unused, though the briefing documents onset in due_to positions.
// This gate follows the briefing's intent, and lists each case in `vha_test_differences` so the
// rule set can be reconciled with the CI test (APC_KNOWN_ISSUES) or the test fixed.
const NO_RE = /^\(no \((.*)\)\)$/s
const NO_VALUE = ' (snomed_concept "No" "qualifier value")'
// Accepts (no X) both as unfixed VHA writes it (with the "No" value inside) and as it reads
// with the one-line inverseSExpression fix (without it); fixed 2026-11-05 after review.
const positive = (s: string) => {
  const m = s.match(NO_RE)
  if (!m) return s
  const parts = m[1].split(NO_VALUE).length
  return parts === 2 ? `(${m[1].replace(NO_VALUE, '')})` : parts === 1 ? `(${m[1]})` : s
}
const vha_test_differences: { file: string; rule: string; kind: string; s_expression: string }[] = []
// deno-lint-ignore no-explicit-any
function* onsetSubjects(n: any): Generator<string> {
  if (!n || typeof n !== 'object') return
  if (['<', '<=', '>', '>=', '='].includes(n.atom) && n.type !== 'measurement' && n.timestamp_of_event) yield inverseSExpression(n.timestamp_of_event.subject)
  if (Array.isArray(n.expressions)) for (const e of n.expressions) yield* onsetSubjects(e)
  if (n.expression) yield* onsetSubjects(n.expression)
}
const rule_evidence = new Set<string>()
for (const { file, rule } of rules_with_due_to) {
  for (const e of allEvidenceToLookFor(rule.due_to)) {
    const s = inverseSExpression(e)
    rule_evidence.add(s)
    if (positive(s) !== s) { rule_evidence.add(positive(s)); vha_test_differences.push({ file, rule: rule.description, kind: 'no-evidence not matched by VHA test', s_expression: s }) }
  }
  for (const s of onsetSubjects(rule.due_to)) { rule_evidence.add(s); vha_test_differences.push({ file, rule: rule.description, kind: 'onset subject not seen by VHA test', s_expression: s }) }
}
const tasks_triggered_by = new Map<string, Set<number>>()
tasks.forEach(({ rule }, i) => {
  for (const s of [...Array.from(allEvidenceToLookFor(rule.due_to), (e) => inverseSExpression(e)).flatMap((x) => [x, positive(x)]), ...onsetSubjects(rule.due_to)]) {
    tasks_triggered_by.set(s, (tasks_triggered_by.get(s) ?? new Set()).add(i))
  }
})
const usedElsewhere = (s: string, i: number) => rule_evidence.has(s) || [...(tasks_triggered_by.get(s) ?? [])].some((j) => j !== i)

// Database constraint (db/migrations/20260905021111_due_to_event_time_comparisons.ts): a time
// comparison's comparator may only be >= or <=. The language accepts > and <, so seeding fails.
// deno-lint-ignore no-explicit-any
function* badTimeComparisons(n: any): Generator<string> {
  if (!n || typeof n !== 'object') return
  if (['<', '>', '='].includes(n.atom) && n.type !== 'measurement' && n.timestamp_of_event) yield inverseSExpression(n)
  if (Array.isArray(n.expressions)) for (const e of n.expressions) yield* badTimeComparisons(e)
  if (n.expression) yield* badTimeComparisons(n.expression)
}
for (const { file, rule } of all) {
  // deno-lint-ignore no-explicit-any
  for (const s of badTimeComparisons((rule as any).due_to)) add(file, 'DATABASE REJECTS TIME COMPARATOR', rule.description, s)
}

// Constraints 2 and 3
tasks.forEach(({ file, rule }, i) => {
  if (!isCheckFor(rule.to_be_done)) return
  const own = new Set(Array.from(allEvidenceToLookFor(rule.due_to), (e) => inverseSExpression(e)))
  for (const f of rule.to_be_done.value) {
    const s = inverseSExpression(f)
    if (!pageOf(file)) continue
    if (!usedElsewhere(s, i) && !usedElsewhere(`(no ${s})`, i)) add(file, 'CHECKED FOR BUT NEVER USED AS EVIDENCE', rule.description, s)
    if (own.has(s)) add(file, 'SELF-REFERENTIAL check_for', rule.description, s)
  }
})

// Constraints 4 and 5
type EvidenceFinding = ReturnType<typeof findingsOf> extends Generator<infer T> ? T : never
function* findingsOf(rule: Lang['system_priority_evaluation' | 'system_diagnosis_rule']) {
  for (const e of allEvidenceToLookFor(rule.due_to)) {
    // deno-lint-ignore no-explicit-any
    const ev = e as any
    yield ['>', '<', '>=', '<=', '='].includes(ev.atom) ? ev.measurement : ev
  }
}
// deno-lint-ignore no-explicit-any
function specificOf(f: any) {
  if (f.atom === 'active_condition' || f.atom === 'diagnosis') return f.snomed_concept
  if (f.atom === 'finding' || f.atom === 'evaluation') return f.specific_snomed_concept
  return null
}
// deno-lint-ignore no-explicit-any
function routine(f: any, rule: Lang['system_priority_evaluation' | 'system_diagnosis_rule']) {
  if (f.atom === 'measurement') return VITALS_ADULT_SNOMED_CONCEPT_NAMES.has(f.snomed_concept.name)
  if (f.atom === 'active_condition' && f.snomed_concept.name === 'Fever') return true
  const c = specificOf(f)
  if (!c) return false
  if (ALL_ASSESSMENT_OPTIONS_PARSED.some((o) => o.specific_snomed_concept!.name === c.name && o.specific_snomed_concept!.category === c.category)) return true
  return rule.ages.every((age) =>
    [...WARNING_SIGNS[age], ...COMMON_SYMPTOMS].some((sign) => {
      const n = parseWithSchema(sign.clinical_finding_s_expression, insertable_finding_base)
      return n.specific_snomed_concept!.name === c.name && n.specific_snomed_concept!.category === c.category
    })
  )
}
const probable = rules_with_due_to.flatMap(({ rule }) =>
  rule.atom === 'system_diagnosis_rule' && rule.diagnosis.certainty_qualifier === 'probable' ? [rule.diagnosis.snomed_concept] : []
)
for (const [file, rules] of parsed) {
  if (!pageOf(file)) continue
  const tasks = rules.filter((r) => r.atom === 'task') as Lang['task'][]
  const checked = new Set(tasks.flatMap((task) => [
    ...allEvidenceToLookFor(task.due_to).map(inverseSExpression),
    ...(isCheckFor(task.to_be_done) ? task.to_be_done.value.map(inverseSExpression) : []),
  ]))
  // a measure task's items count as checked for (Will's test has a TODO for exactly this), but his
  // test does not count them yet, so each use is listed in vha_test_differences
  const measured = new Set(tasks.flatMap((task) =>
    // deno-lint-ignore no-explicit-any
    !isCheckFor(task.to_be_done) && Array.isArray((task.to_be_done as any)?.value) ? (task.to_be_done as any).value.map(inverseSExpression) as string[] : []
  ))
  const checking = new Set([...checked, ...measured])
  const noteMeasured = (file: string, rule: string, s: string) => {
    if (!checked.has(s) && !checked.has(positive(s)) && (measured.has(s) || measured.has(positive(s)))) {
      vha_test_differences.push({ file, rule, kind: 'measured item not seen by VHA test', s_expression: s })
    }
  }
  for (const r of rules) {
    if (r.atom === 'system_diagnosis_rule' && r.diagnosis.certainty_qualifier === 'probable') {
      for (const f of findingsOf(r)) {
        if (routine(f, r)) continue
        const s = inverseSExpression(f)
        if (!checking.has(s) && !checking.has(positive(s))) add(file, 'PROBABLE DIAGNOSIS EVIDENCE NOT CHECKED FOR', r.description, s)
        else noteMeasured(file, r.description, s)
      }
    }
    if (r.atom === 'system_priority_evaluation') {
      for (const f of findingsOf(r)) {
        if (routine(f, r)) continue
        if (f.atom === 'active_condition' && probable.some((p) => p.name === f.snomed_concept.name && p.category === f.snomed_concept.category)) continue
        const s = inverseSExpression(f)
        if (!checking.has(s) && !checking.has(positive(s))) add(file, 'PRIORITY EVALUATION EVIDENCE NOT CHECKED FOR', r.description, s)
        else noteMeasured(file, r.description, s)
      }
    }
  }
}

// Every atomic condition of every rule, in VHA's canonical text (inverseSExpression), with its role.
// Provenance cites these strings exactly. Unlike allEvidenceToLookFor, this walks `not` and keeps
// time comparisons (onset/time_ago), so nothing a rule depends on goes without a citation.
const conditions: { file: string; rule: string; atom: string; role: string; expr: string }[] = []
// deno-lint-ignore no-explicit-any
function* leaves(node: any): Generator<any> {
  if (['and', 'or', 'any2'].includes(node.atom)) for (const e of node.expressions) yield* leaves(e)
  else if (node.atom === 'not') yield* leaves(node.expression)
  else yield node
}
// deno-lint-ignore no-explicit-any
const canon = (n: any) => { try { return inverseSExpression(n) } catch (e) { return `<<cannot render ${n?.atom}: ${String(e).slice(0, 80)}>>` } }
for (const [file, rules] of parsed) {
  for (const r of rules) {
    // deno-lint-ignore no-explicit-any
    const rule = r as any
    const role_due = r.atom === 'task' ? 'trigger' : r.atom === 'system_diagnosis_rule' ? 'diagnosis_condition' : 'priority_condition'
    for (const leaf of leaves(rule.due_to)) conditions.push({ file, rule: r.description, atom: r.atom, role: role_due, expr: canon(leaf) })
    if (r.atom === 'system_diagnosis_rule') conditions.push({ file, rule: r.description, atom: r.atom, role: 'diagnosis', expr: canon(rule.diagnosis) })
    if (r.atom === 'task') {
      const tbd = rule.to_be_done
      const role = isCheckFor(tbd) ? 'check_for' : (tbd?.specific_snomed_concept?.name ?? 'to_be_done')
      if (Array.isArray(tbd?.value)) for (const v of tbd.value) conditions.push({ file, rule: r.description, atom: r.atom, role, expr: canon(v) })
    }
  }
}

// Always-true candidates: (and A (or ... B ...)) where A's concept may be B or a descendant of B,
// so the or-branch is satisfied whenever A is. The is-a test runs in Python on the RF2 graph.
const always_true_candidates: { file: string; rule: string; and_member: string[]; or_member: string[]; and_extras: string[]; or_extras: string[] }[] = []
// deno-lint-ignore no-explicit-any
const extrasOf = (n: any) => [...(n?.qualifiers ?? []), ...(n?.attributes ?? []), ...(n?.excluding ?? [])].map((x) => canon(x)).concat(n?.value_snomed_concept ? [canon(n.value_snomed_concept)] : []).concat(n?.history ? ['history'] : [])
// deno-lint-ignore no-explicit-any
const conceptOf = (n: any) => n?.specific_snomed_concept ?? n?.snomed_concept ?? null
// deno-lint-ignore no-explicit-any
function* andNodes(n: any): Generator<any> {
  if (!n || typeof n !== 'object') return
  if (n.atom === 'and') yield n
  if (Array.isArray(n.expressions)) for (const e of n.expressions) yield* andNodes(e)
  if (n.expression) yield* andNodes(n.expression)
}
for (const [file, rules] of parsed) {
  for (const r of rules) {
    // deno-lint-ignore no-explicit-any
    for (const a of andNodes((r as any).due_to)) {
      // deno-lint-ignore no-explicit-any
      const direct = a.expressions.filter((e: any) => conceptOf(e))
      // deno-lint-ignore no-explicit-any
      for (const o of a.expressions.filter((e: any) => e.atom === 'or')) {
        for (const leaf of leaves(o)) {
          const b = conceptOf(leaf)
          if (!b) continue
          for (const d of direct) { const c = conceptOf(d); always_true_candidates.push({ file, rule: r.description, and_member: [c.name, c.category], or_member: [b.name, b.category], and_extras: extrasOf(d), or_extras: extrasOf(leaf) }) }
        }
      }
    }
  }
}

const counts: Record<string, Record<string, number>> = {}
for (const [file, rules] of parsed) {
  counts[file] = {}
  for (const r of rules) counts[file][r.atom] = (counts[file][r.atom] ?? 0) + 1
}
await Deno.writeTextFile(out_path, JSON.stringify({ apc_dir, files: apc_files, parse_errors, counts, findings, concepts, conditions, always_true_candidates, vha_test_differences }, null, 1))
console.log(`files ${apc_files.length}, parse errors ${parse_errors.length}, rules ${all.length}, concepts ${concepts.length}, constraint findings ${findings.length}, conditions ${conditions.length}`)

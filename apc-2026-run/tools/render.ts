// Deterministic plain-English rendering of VHA rule files, for the review page. No model involved.
// Walks the zod-transformed tree (as shared/s_expression_inverse.ts does) and words findings with
// the app's own label code (findingFullDisplay / evaluationFullDisplay) where it applies, so the
// reviewer reads concepts as health workers will see them. Every leaf keeps its canonical
// s-expression (inverseSExpression), the key that links it to provenance and checker verdicts.
//
// Run from the root of a VHA checkout (copied there as apc2026_render_<pid>.ts):
//   NO_EXTERNAL_CONNECT=1 deno run -A apc2026_render.ts <out.json> <file.lisp>...
import { parseLispFile } from './s_expression/compile.ts'
import { inverseSExpression } from './shared/s_expression_inverse.ts'
import { evaluationFullDisplay, findingFullDisplay } from './shared/patient_records.ts'
import { diagnosisToEvaluation } from './shared/diagnosis.ts'
import { isCheckFor } from './db/models/additional_tasks.ts'

const [out_path, ...files] = Deno.args
type Node = { kind: 'group'; op: string; text: string; children: Node[] } | { kind: 'leaf'; text: string; expr: string; atom: string }

const OPS: Record<string, string> = { '<': '<', '<=': '≤', '>': '>', '>=': '≥', '=': '=' }
// deno-lint-ignore no-explicit-any
const safe = (f: () => string, fallback: string) => { try { const s = f(); return s && s.trim() ? s : fallback } catch { return fallback } }
// deno-lint-ignore no-explicit-any
const c = (x: any) => x ? x.name : '?'

// deno-lint-ignore no-explicit-any
function manualFinding(n: any): string {
  const parts = [c(n.specific_snomed_concept ?? n.root_snomed_concept)]
  if (n.value_snomed_concept) parts.push(`= ${c(n.value_snomed_concept)}`)
  // deno-lint-ignore no-explicit-any
  for (const a of n.attributes ?? []) parts.push(`[${c(a.specific_snomed_concept)}: ${a.value?.name ?? '?'}]`)
  // deno-lint-ignore no-explicit-any
  for (const q of n.qualifiers ?? []) parts.push(`(${c(q.specific_snomed_concept)})`)
  // deno-lint-ignore no-explicit-any
  for (const e of n.excluding ?? []) parts.push(`excluding ${manualFinding(e.finding)}`)
  return parts.join(' ')
}

// deno-lint-ignore no-explicit-any
function leafText(n: any): string {
  switch (n.atom) {
    case 'finding': {
      const label = safe(() => findingFullDisplay({ ...n, existence: 'Yes', history: false }), manualFinding(n))
      const exact = manualFinding(n)
      const shown = label === exact ? label : `${label}  ⟨${exact}⟩`
      return (n.existence === 'No' ? 'NOT recorded present: ' : '') + (n.history ? 'history of ' : '') + shown
    }
    case 'evaluation':
      return safe(() => evaluationFullDisplay(n), manualFinding(n))
    case 'active_condition':
      return `has ${n.possible ? 'possible, probable, definite or known' : 'probable, definite or known'} ${c(n.snomed_concept)} (${n.snomed_concept.category})`
    case 'diagnosis':
      return `diagnosis of ${c(n.snomed_concept)} (${n.snomed_concept.category}) at certainty "${n.certainty_qualifier}"` +
        safe(() => `  — app label: ${evaluationFullDisplay(diagnosisToEvaluation(n))}`, '')
    case 'measurement':
      return `measure ${c(n.snomed_concept)} (${n.units})`
    case '<': case '<=': case '>': case '>=': case '=':
      if (n.type === 'measurement') return `${c(n.measurement.snomed_concept)} ${OPS[n.atom]} ${n.value} ${n.measurement.units}`
      return `${/onset/i.test(n.timestamp_of_event.event_snomed_concept.name) ? 'onset of' : c(n.timestamp_of_event.event_snomed_concept) + ' of'} ` +
        `${leafText(n.timestamp_of_event.subject)} ${OPS[n.atom]} ${n.duration.value} ${n.duration.units} ago` +
        `  (${n.atom === '>=' || n.atom === '>' ? 'i.e. at least that long ago' : 'i.e. within that time'})`
    default:
      return safe(() => inverseSExpression(n), n.atom)
  }
}

// deno-lint-ignore no-explicit-any
function tree(n: any): Node {
  if (n.atom === 'and') return { kind: 'group', op: 'and', text: 'ALL of:', children: n.expressions.map(tree) }
  if (n.atom === 'or') return { kind: 'group', op: 'or', text: 'ANY of:', children: n.expressions.map(tree) }
  if (n.atom === 'any2') return { kind: 'group', op: 'any2', text: 'AT LEAST TWO of:', children: n.expressions.map(tree) }
  if (n.atom === 'not') return { kind: 'group', op: 'not', text: 'NOT:', children: [tree(n.expression)] }
  return { kind: 'leaf', text: leafText(n), expr: safe(() => inverseSExpression(n), ''), atom: n.atom }
}

const out: Record<string, unknown[]> = {}
for (const f of files) {
  const rules = await parseLispFile(f)
  out[f] = rules.map((r) => {
    // deno-lint-ignore no-explicit-any
    const rule = r as any
    const base = { atom: r.atom, description: r.description, ages: rule.ages, raw: inverseSExpression(rule) }
    if (r.atom === 'task') {
      const tbd = rule.to_be_done
      const what = isCheckFor(tbd) ? 'Check for' : `${tbd?.specific_snomed_concept?.name ?? 'Do'}`
      return { ...base, headline: `Task: ${r.description}`, when: tree(rule.due_to), do_label: what,
        // deno-lint-ignore no-explicit-any
        do: Array.isArray(tbd?.value) ? tbd.value.map((v: any) => ({ kind: 'leaf', text: leafText(v), expr: inverseSExpression(v), atom: v.atom })) : [] }
    }
    if (r.atom === 'system_priority_evaluation') {
      return { ...base, headline: `Priority "${rule.priority}": ${r.description}`, priority: rule.priority, when: tree(rule.due_to) }
    }
    return { ...base, headline: `Diagnosis rule: ${r.description}`, diagnosis: { text: leafText(rule.diagnosis), expr: inverseSExpression(rule.diagnosis) }, when: tree(rule.due_to) }
  })
}
await Deno.writeTextFile(out_path, JSON.stringify(out, null, 1))
console.log(`rendered ${files.length} files, ${Object.values(out).reduce((n, r) => n + r.length, 0)} rules`)

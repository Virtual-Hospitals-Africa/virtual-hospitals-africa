import { PageProps } from 'fresh'
import { formatExpressionWithErrorAt, parseWithSchema } from '../shared/s_expression.ts'
import { any_rule, finding_site_findings } from '../shared/s_expression_schemas.ts'
import { json } from '../util/responses.ts'
import SExpressionPlayground, { FindingSiteSample } from '../islands/SExpressionPlayground.tsx'
import { basename } from 'std/path/mod.ts'
import { allConceptsToLookFor } from '../shared/s_expression_concepts.ts'
import { conceptDoesNotExist } from '../db/models/snomed_concept_exists.ts'
import { findingSiteFindingsLispFiles, stripComments } from '../s_expression/compile.ts'
import { findingFullDisplay } from '../shared/patient_records.ts'

function countInstances(str: string, needle: string): number {
  if (needle.length === 0) return 0
  return str.split(needle).length - 1
}

export const handler = {
  async POST(ctx: { req: Request }) {
    const { expression } = await ctx.req.json() as { expression?: string }
    if (typeof expression !== 'string' || !expression.trim()) {
      return json({ ok: false, error: 'Expression is empty' })
    }
    const sans_comments = stripComments(expression)
    const left_paren_count = countInstances(sans_comments, '(')
    const right_paren_count = countInstances(sans_comments, ')')

    if (left_paren_count > right_paren_count) {
      return json({ ok: false, error: 'Unbalanced parentheses, more "(" than ")' })
    }
    if (right_paren_count > left_paren_count) {
      return json({ ok: false, error: 'Unbalanced parentheses, more "(" than ")' })
    }
    if (countInstances(sans_comments, '”')) {
      return json({ ok: false, error: 'Cannot use ” character. Replace with "' })
    }
    if (countInstances(sans_comments, '“')) {
      return json({ ok: false, error: 'Cannot use “ character. Replace with "' })
    }

    const is_finding_site_findings = /^\s*\(\s*finding_site_findings\b/.test(sans_comments)

    try {
      const node = is_finding_site_findings ? parseWithSchema(sans_comments, finding_site_findings) : parseWithSchema(sans_comments, any_rule)
      for (const concept of allConceptsToLookFor(node)) {
        console.log({ concept })
        if (await conceptDoesNotExist({ concept })) {
          const formatted = formatExpressionWithErrorAt(
            sans_comments,
            (n) =>
              n[0] === 'snomed_concept' &&
              String(n[1]) === concept.name &&
              String(n[2]) === concept.category,
          )
          throw new Error(
            `Concept does not exist\n${formatted}\n\nsaw: (snomed_concept "${concept.name}" "${concept.category}")`,
          )
        }
      }
      return json({
        ok: true,
        finding_displays: node.atom === 'finding_site_findings' ? node.clinical_findings.map(findingFullDisplay) : null,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return json({ ok: false, error: message })
    }
  },
}

/*
  Every finding site page, labelled by its guide page number and the description in the
  first comment of its file (";; Nose symptoms ⇢ 34"), so one can be loaded into the editor
*/
async function loadFindingSiteSamples(): Promise<FindingSiteSample[]> {
  const samples: FindingSiteSample[] = []
  for (const lisp_path of await findingSiteFindingsLispFiles()) {
    const source = await Deno.readTextFile(lisp_path)
    const page = basename(lisp_path).match(/^\d+[a-z]?/)?.[0] ?? basename(lisp_path, '.lisp')
    const comment = source.match(/^;;\s*(.*)$/m)?.[1] ?? ''
    const description = comment.split('⇢')[0].trim() || comment
    samples.push({ label: description ? `${page} · ${description}` : page, source })
  }
  return samples
}

export default async function SExpressionPlaygroundPage(_props: PageProps) {
  const finding_site_samples = await loadFindingSiteSamples()
  return (
    <div class='relative p-6 max-w-5xl mx-auto'>
      <h1 class='text-2xl font-semibold mb-1'>S-Expression Playground</h1>
      <p class='text-gray-600 mb-4'>
        Validate an expression against <code>any_rule</code> or <code>finding_site_findings</code> from{' '}
        <code>shared/s_expression_schemas.ts</code>. An expression starting with <code>(finding_site_findings</code>{' '}
        is validated as a finding site page, anything else as a rule.
      </p>
      <SExpressionPlayground finding_site_samples={finding_site_samples} />
    </div>
  )
}

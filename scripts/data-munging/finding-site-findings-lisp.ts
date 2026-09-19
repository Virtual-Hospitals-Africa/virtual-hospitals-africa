import { assert } from 'std/assert/assert.ts'
import { FINDING_SITE_FINDINGS } from '../../shared/finding_site_findings.ts'
import { finding_site_findings } from '../../shared/s_expression_schemas.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { stripComments } from '../../s_expression/compile.ts'

/*
  Writes s_expression/finding_site_findings/$page.lisp, one (finding_site_findings)
  declaration per site, from shared/finding_site_findings.ts. The page numbers and the
  comments marking which column of a page a run of findings came from live only in that
  file's comments, so they are read back off its source rather than off the exported data.

  A page that several sites share — neck, arm and hand all come off page 64 — is split into
  64a, 64b and 64c, as each file holds a single declaration and the letter keeps the files
  sorting into the order the page presents its columns in.
*/
const SOURCE = 'shared/finding_site_findings.ts'
const OUT_DIR = 's_expression/finding_site_findings'

type SourceComments = {
  // The `// Headache ⇢ 30` line above the entry's label
  heading: string
  // Comments inside clinical_finding_s_expressions, by the index of the expression they precede
  sections: Map<number, string[]>
}

/*
  Walks the source file looking only for its comments. Entries are delimited by their
  `label:` line, so the heading is whatever comment ran most recently before one.
*/
function sourceComments(source: string): SourceComments[] {
  const entries: SourceComments[] = []
  let pending_comment: string | null = null
  let expressions_seen = 0
  let in_expressions = false

  // Everything above the exported array — the file comment and the type — names the same
  // keys, so start reading at the array itself
  const array_start = source.indexOf('export const FINDING_SITE_FINDINGS')
  assert(array_start >= 0, `${SOURCE} does not export FINDING_SITE_FINDINGS`)

  for (const line of source.slice(array_start).split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('//')) {
      const comment = trimmed.slice(2).trim()
      if (in_expressions) {
        const entry = entries[entries.length - 1]
        const at = entry.sections.get(expressions_seen) ?? []
        at.push(comment)
        entry.sections.set(expressions_seen, at)
      } else {
        pending_comment = comment
      }
      continue
    }
    if (trimmed.startsWith('label:')) {
      assert(pending_comment, `No heading comment above ${trimmed}`)
      entries.push({ heading: pending_comment, sections: new Map() })
      pending_comment = null
      continue
    }
    if (trimmed.startsWith('clinical_finding_s_expressions:')) {
      in_expressions = true
      expressions_seen = 0
      continue
    }
    if (in_expressions) {
      if (trimmed === '],') {
        in_expressions = false
      } else if (trimmed.startsWith("'(")) {
        expressions_seen += 1
      }
    }
  }
  return entries
}

function pageNumbers(heading: string): number[] {
  const pages = Array.from(heading.matchAll(/⇢\s*(\d+)/g), (match) => parseInt(match[1], 10))
  assert(pages.length, `No page number in comment "${heading}"`)
  return pages
}

function slug(label: string): string {
  return label.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/^-|-$/g, '')
}

function lispFile(
  { label, finding_site_structure, excluding_structures, clinical_finding_s_expressions }: typeof FINDING_SITE_FINDINGS[number],
  { heading, sections }: SourceComments,
): string {
  const lines = [
    `;; ${heading}`,
    '(finding_site_findings',
    `  "${label}"`,
    `  (finding_site_structure (snomed_concept "${finding_site_structure}" "body structure"))`,
  ]
  if (excluding_structures.length) {
    lines.push('  (excluding_structures')
    for (const structure of excluding_structures) {
      lines.push(`    (snomed_concept "${structure}" "body structure")`)
    }
    lines.push('  )')
  }
  lines.push('  (clinical_findings')
  clinical_finding_s_expressions.forEach((s_expression, index) => {
    for (const comment of sections.get(index) ?? []) {
      lines.push(`    ;; ${comment}`)
    }
    lines.push(`    ${s_expression}`)
  })
  lines.push('  )')
  lines.push(')')
  return lines.join('\n') + '\n'
}

async function main() {
  const comments = sourceComments(await Deno.readTextFile(SOURCE))
  assert(
    comments.length === FINDING_SITE_FINDINGS.length,
    `Read ${comments.length} entries out of ${SOURCE} but ${FINDING_SITE_FINDINGS.length} are exported`,
  )

  const first_pages = FINDING_SITE_FINDINGS.map((_, index) => pageNumbers(comments[index].heading)[0])
  const shared_pages = new Set(first_pages.filter((page, index) => first_pages.indexOf(page) !== index))
  const seen_per_page = new Map<number, number>()

  function basename(index: number): string {
    const page = first_pages[index]
    if (!shared_pages.has(page)) return `${page}`
    const nth = seen_per_page.get(page) ?? 0
    seen_per_page.set(page, nth + 1)
    assert(nth < 26, `Page ${page} has more sites than there are letters`)
    return `${page}${String.fromCharCode(97 + nth)}-${slug(FINDING_SITE_FINDINGS[index].label)}`
  }

  await Deno.mkdir(OUT_DIR, { recursive: true })
  for (const entry of Deno.readDirSync(OUT_DIR)) {
    if (entry.name.endsWith('.lisp')) await Deno.remove(`${OUT_DIR}/${entry.name}`)
  }

  for (const [index, site] of FINDING_SITE_FINDINGS.entries()) {
    const path = `${OUT_DIR}/${basename(index)}.lisp`
    const contents = lispFile(site, comments[index])

    // Every file holds exactly one declaration, and that declaration must parse
    parseWithSchema(stripComments(contents).trim(), finding_site_findings)

    await Deno.writeTextFile(path, contents)
    console.log(`${path} — ${site.label}, ${site.clinical_finding_s_expressions.length} findings`)
  }
}

if (import.meta.main) {
  await main()
}

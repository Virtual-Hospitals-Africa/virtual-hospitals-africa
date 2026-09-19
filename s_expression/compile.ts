import { assert } from 'std/assert/assert.ts'
import parse from 's-expression'
import { walk } from 'std/fs/mod.ts'
import { parseWithSchema } from '../shared/s_expression.ts'
import { inverseSExpression } from '../shared/s_expression_inverse.ts'
import { any_rule, finding_site_findings, Lang } from '../shared/s_expression_schemas.ts'
import { groupBy } from '../util/groupBy.ts'
import assertLength from '../util/assertLength.ts'
import { basename } from 'std/path/mod.ts'
import { collect } from '../util/inParallel.ts'

/**
 * Strip Lisp-style comments (lines starting with ;;) from the input text
 */
export function stripComments(text: string): string {
  return text
    .split('\n')
    .map((line) => {
      const comment_index = line.indexOf(';;')
      return comment_index >= 0 ? line.substring(0, comment_index) : line
    })
    .join('\n')
}

/**
 * Extract top-level s-expressions from text
 * Returns an array of s-expression strings
 */
function extractSExpressions<Schema extends typeof any_rule | typeof finding_site_findings>(text: string, schema: Schema) {
  const parsed = parse(`(${stripComments(text)})`)
  if (parsed instanceof Error) {
    throw parsed
  }
  assert(Array.isArray(parsed))
  return parsed.map((expr) => parseWithSchema(expr, schema))
}

function tsContent(const_name: string, expressions: string[]) {
  return `// Auto-generated
// Do not edit manually

export const ${const_name} = [
  ${expressions.map((expr) => `\`${expr}\`,`).join('\n  ')}
]
`
}

export async function parseLispFile(lisp_path: string) {
  const content = await Deno.readTextFile(lisp_path)
  return extractSExpressions(content, any_rule)
}

/*
  A finding site page declares the site itself rather than a rule, so its files live beside
  the rules and compile into their own s_expression/finding_site_findings.ts
*/
export async function parseFindingSiteFindingsLispFile(lisp_path: string) {
  const content = await Deno.readTextFile(lisp_path)
  const declarations = extractSExpressions(content, finding_site_findings)
  assertLength(declarations, 1, `${lisp_path} must hold exactly one (finding_site_findings) declaration`)
  return declarations[0]
}

const RULES_DIR = 's_expression/rules'
const FINDING_SITE_FINDINGS_DIR = 's_expression/finding_site_findings'

/*
  Sorted by the guide page the file is named for, so the sites come out in the order the
  guide presents them rather than in whatever order the directory is read
*/
async function findingSiteFindingsLispFiles() {
  const paths = await collect(walkDirectory(FINDING_SITE_FINDINGS_DIR))
  return paths.sort((a, b) => {
    const page = pageNumber(a) - pageNumber(b)
    return page === 0 ? a.localeCompare(b) : page
  })
}

function pageNumber(lisp_path: string) {
  const match = basename(lisp_path).match(/^(\d+)/)
  assert(match, `${lisp_path} is not named for a guide page`)
  return parseInt(match[1], 10)
}

export async function* walkDirectory(dir = RULES_DIR) {
  for await (const entry of walk(dir, { exts: ['.lisp'] })) {
    assert(entry.isFile)
    yield entry.path
  }
}

/**
 * Main function - process all .lisp files in s_expression directory
 */
async function main() {
  const all_rules: Lang['task' | 'system_diagnosis_rule' | 'system_priority_evaluation'][] = []
  for await (const lisp_file of walkDirectory()) {
    const rules = await parseLispFile(lisp_file)
    for (const rule of rules) {
      all_rules.push(rule)
    }
  }
  const grouped_rules = groupBy(all_rules, 'atom')

  await Deno.writeTextFile('s_expression/tasks.ts', tsContent('TASKS_LISP', grouped_rules.get('task')!.map(inverseSExpression)))
  await Deno.writeTextFile(
    's_expression/system_diagnosis_rules.ts',
    tsContent('SYSTEM_DIAGNOSIS_RULES_LISP', grouped_rules.get('system_diagnosis_rule')!.map(inverseSExpression)),
  )
  await Deno.writeTextFile(
    's_expression/system_priority_evaluations.ts',
    tsContent('SYSTEM_PRIORITY_EVALUATIONS_LISP', grouped_rules.get('system_priority_evaluation')!.map(inverseSExpression)),
  )

  const finding_sites: Lang['finding_site_findings'][] = []
  for (const lisp_file of await findingSiteFindingsLispFiles()) {
    finding_sites.push(await parseFindingSiteFindingsLispFile(lisp_file))
  }
  await Deno.writeTextFile(
    's_expression/finding_site_findings.ts',
    tsContent('FINDING_SITE_FINDINGS_LISP', finding_sites.map(inverseSExpression)),
  )

  console.log('\n✓ All files processed successfully')
}

if (import.meta.main) {
  main()
}

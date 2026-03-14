import { assert } from 'std/assert/assert.ts'
import parse from 's-expression'
import { walk } from 'std/fs/mod.ts'
import * as schemas from '../shared/s_expression_schemas.ts'
import { parseWithSchema } from '../shared/s_expression.ts'
import isKeyOf from '../util/isKeyOf.ts'
import { inverseSExpression } from '../shared/s_expression_inverse.ts'
import { forEach, pMap } from '../util/inParallel.ts'

/**
 * Strip Lisp-style comments (lines starting with ;;) from the input text
 */
function stripComments(text: string): string {
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
function extractSExpressions(text: string): string[] {
  const parsed = parse(`(${stripComments(text)})`)
  if (parsed instanceof Error) {
    throw parsed
  }
  assert(Array.isArray(parsed))
  return parsed.map((expr) => {
    const atom = expr[0]
    if (!isKeyOf(atom, schemas)) {
      throw new Error(`No schema for ${atom}`)
    }
    const schema = schemas[atom]
    return inverseSExpression(parseWithSchema(expr, schema))
  })
}

/**
 * Convert a filename to a valid TypeScript constant name
 * e.g., "tasks.lisp" -> "TASKS"
 */
function filenameToConstName(filename: string): string {
  return filename
    .replace(/^s_expression\//, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_TS$/, '_LISP')
}

function tsContent(const_name: string, expressions: string[]) {
  return `// Auto-generated
// Do not edit manually

export const ${const_name} = [
  ${expressions.map((expr) => `\`${expr}\`,`).join('\n  ')}
]
`
}

/**
 * Process multiple .lisp files and concatenate all expressions into a single .ts file
 */
async function processLispDirectory(lisp_paths: string[], out_ts_path: string) {
  console.log(`Processing ${lisp_paths.length} file(s) → ${out_ts_path}...`)

  const all_expressions: string[] = (await pMap(lisp_paths, async (lisp_path) => {
    console.log(`  Reading ${lisp_path}`)
    const content = await Deno.readTextFile(lisp_path)
    return extractSExpressions(content)
  })).flat()

  const const_name = filenameToConstName(out_ts_path)

  await Deno.writeTextFile(out_ts_path, tsContent(const_name, all_expressions))
  console.log(`  ✓ Generated ${out_ts_path} with ${all_expressions.length} expression(s)`)
}

const S_EXPRESSION_DIR = 's_expression'

async function walkDirectory() {
  const subdir_files = new Map<string, string[]>()
  for await (const entry of walk(S_EXPRESSION_DIR, { exts: ['.lisp'] })) {
    assert(entry.isFile)
    const rel = entry.path.slice(S_EXPRESSION_DIR.length + 1) // e.g. "foo.lisp" or "tasks/apc-adult/20.lisp"
    const first_sep = rel.indexOf('/')
    assert(first_sep >= 0)
    const subdir = rel.slice(0, first_sep) // e.g. "tasks"
    const existing = subdir_files.get(subdir) ?? []
    existing.push(entry.path)
    subdir_files.set(subdir, existing)
  }
  assert(subdir_files.size, `No files found in s_expression_dir ${S_EXPRESSION_DIR}`)
  return subdir_files
}

/**
 * Main function - process all .lisp files in s_expression directory
 */
async function main() {
  const subdir_files = await walkDirectory()
  await forEach(subdir_files.entries(), ([subdir, paths]) => processLispDirectory(paths, `${S_EXPRESSION_DIR}/${subdir}.ts`))
  console.log('\n✓ All files processed successfully')
}

if (import.meta.main) {
  main()
}

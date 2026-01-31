import parse from 's-expression'
import { walk } from 'std/fs/mod.ts'
import { basename } from 'std/path/mod.ts'
import * as schemas from '../shared/s_expression_schemas.ts'
import { parseWithSchema } from '../shared/s_expression.ts'
import isKeyOf from '../util/isKeyOf.ts'
import { inverseSExpression } from '../shared/s_expression_inverse.ts'
import { assert } from 'std/assert/assert.ts'
import { forEach } from '../util/inParallel.ts'

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
  return basename(filename, '.lisp').toUpperCase().replace(/[^A-Z0-9]/g, '_')
}

/**
 * Process a single .lisp file and generate corresponding .ts file
 */
async function processLispFile(lisp_path: string) {
  console.log(`Processing ${lisp_path}...`)

  const content = await Deno.readTextFile(lisp_path)
  const expressions = extractSExpressions(content)

  const const_name = filenameToConstName(lisp_path)
  const ts_path = lisp_path.replace(/\.lisp$/, '.ts')

  // Generate TypeScript file content
  const ts_content = `// Auto-generated from ${basename(lisp_path)}
// Do not edit manually

export const ${const_name} = [
${expressions.map((expr) => `  \`${expr}\`,`).join('\n')}
]
`

  await Deno.writeTextFile(ts_path, ts_content)
  console.log(`  ✓ Generated ${ts_path} with ${expressions.length} expression(s)`)
}

/**
 * Main function - process all .lisp files in s_expression directory
 */
async function main() {
  const s_expression_dir = 's_expression'

  let processed = 0
  await forEach(walk(s_expression_dir, { exts: ['.lisp'] }), async (entry) => {
    assert(entry.isFile)
    await processLispFile(entry.path)
    processed++
  })

  if (!processed) {
    throw new Error(`No files found in s_expression_dir ${s_expression_dir}`)
  }

  console.log('\n✓ All files processed successfully')
}

if (import.meta.main) {
  main()
}

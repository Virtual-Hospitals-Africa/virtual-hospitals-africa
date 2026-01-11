#!/usr/bin/env -S deno run --allow-run --allow-read --allow-write
/**
 * Removes unused imports detected by deno lint.
 *
 * Usage:
 *   deno task remove-unused-imports
 *   deno run --allow-run --allow-read --allow-write scripts/remove-unused-imports.ts
 */

interface LintDiagnostic {
  filename: string
  range: {
    start: { line: number; col: number; bytePos: number }
    end: { line: number; col: number; bytePos: number }
  }
  message: string
  code: string
  hint?: string
}

interface LintOutput {
  version: number
  diagnostics: LintDiagnostic[]
  errors: unknown[]
}

async function runLint(): Promise<LintOutput> {
  const command = new Deno.Command('deno', {
    args: ['lint', '--json'],
    stdout: 'piped',
    stderr: 'piped',
  })
  const { stdout } = await command.output()
  const output = new TextDecoder().decode(stdout)
  return JSON.parse(output)
}

function extractUnusedVarName(message: string): string | null {
  const match = message.match(/^`(.+?)` is never used$/)
  return match ? match[1] : null
}

function removeUnusedImports(
  content: string,
  unused_vars: Set<string>,
): string {
  // Match import statements (single-line and multi-line)
  const import_regex =
    /import\s+(\w+\s+from\s+|)(\{[\s\S]*?\})\s*from\s*['"][^'"]+['"]/g

  return content.replace(
    import_regex,
    (match, default_part, braces_content) => {
      // Extract items from braces
      const inner = braces_content.slice(1, -1) // Remove { and }
      const items = inner.split(',').map((s: string) => s.trim()).filter((
        s: string,
      ) => s)

      // Filter out unused vars
      const filtered = items.filter((item: string) => {
        const name = item.split(/\s+as\s+/)[0].trim()
        return !unused_vars.has(name)
      })

      if (filtered.length === 0 && !default_part.trim()) {
        return '' // Remove entire import
      }

      if (filtered.length === items.length) {
        return match // No changes needed
      }

      // Rebuild the import - extract the from clause
      const from_match = match.match(/from\s*(['"][^'"]+['"])/)
      if (!from_match) return match

      if (filtered.length === 0) {
        return '' // Remove entire import if no named imports left
      }

      return `import { ${filtered.join(', ')} } from ${from_match[1]}`
    },
  )
}

function removeDefaultImports(
  content: string,
  unused_vars: Set<string>,
): string {
  // Match default imports with optional named imports: import foo, { bar } from 'baz' or import foo from 'bar'
  const default_import_regex =
    /import\s+(\w+)\s*(,\s*\{[^}]*\})?\s*from\s*(['"][^'"]+['"])\s*\n?/g

  return content.replace(
    default_import_regex,
    (match, default_name, named_part, from_path) => {
      const default_unused = unused_vars.has(default_name)

      if (default_unused) {
        if (named_part) {
          // Keep the named imports, remove default
          const cleaned_named = named_part.replace(/^,\s*/, '')
          return `import ${cleaned_named} from ${from_path}\n`
        }
        return '' // Remove entire import
      }
      return match
    },
  )
}

async function processFile(
  filename: string,
  unused_vars: Set<string>,
): Promise<boolean> {
  const content = await Deno.readTextFile(filename)

  // Apply both removal functions
  let new_content = removeUnusedImports(content, unused_vars)
  new_content = removeDefaultImports(new_content, unused_vars)

  // Clean up empty lines left by removed imports
  new_content = new_content.replace(/\n{3,}/g, '\n\n')

  if (new_content !== content) {
    await Deno.writeTextFile(filename, new_content)
    return true
  }
  return false
}

async function main() {
  console.log('Running deno lint...')
  const lint_output = await runLint()

  // Group unused vars by file
  const unused_by_file = new Map<string, Set<string>>()

  for (const diag of lint_output.diagnostics) {
    if (diag.code !== 'no-unused-vars') continue

    const var_name = extractUnusedVarName(diag.message)
    if (!var_name) continue

    // Convert file:// URL to path
    const file_path = diag.filename.replace('file://', '')

    if (!unused_by_file.has(file_path)) {
      unused_by_file.set(file_path, new Set())
    }
    unused_by_file.get(file_path)!.add(var_name)
  }

  if (unused_by_file.size === 0) {
    console.log('No unused imports found.')
    return
  }

  console.log(`Found unused vars in ${unused_by_file.size} file(s)`)

  let files_modified = 0
  for (const [file_path, unused_vars] of unused_by_file) {
    console.log(`Processing ${file_path}: ${[...unused_vars].join(', ')}`)
    const modified = await processFile(file_path, unused_vars)
    if (modified) {
      files_modified++
    }
  }

  console.log(`Modified ${files_modified} file(s)`)

  // Run lint again to verify
  console.log('\nRunning deno lint again to verify...')
  const verify_output = await runLint()
  const remaining_unused = verify_output.diagnostics.filter(
    (d) => d.code === 'no-unused-vars',
  )

  if (remaining_unused.length > 0) {
    console.log(
      `\nNote: ${remaining_unused.length} unused var(s) remain (likely not imports):`,
    )
    for (const d of remaining_unused) {
      console.log(`  ${d.filename}:${d.range.start.line} - ${d.message}`)
    }
  } else {
    console.log('All unused imports removed!')
  }
}

main()

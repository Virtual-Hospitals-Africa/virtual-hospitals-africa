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

function removeImportFromLine(line: string, var_name: string): string | null {
  // Check if this line is an import statement containing the var
  if (!line.trim().startsWith('import ')) return line

  // Default import: import foo from 'bar'
  const default_import_match = line.match(/^import\s+(\w+)\s+from\s+/)
  if (default_import_match && default_import_match[1] === var_name) {
    return null // Remove entire line
  }

  // Named imports: import { foo, bar } from 'baz'
  const named_import_match = line.match(
    /^(import\s*\{)([^}]+)(\}\s*from\s*.+)$/,
  )
  if (named_import_match) {
    const [, prefix, imports, suffix] = named_import_match
    const import_items = imports.split(',').map((s) => s.trim())

    // Find and remove the var (handling 'as' aliases)
    const filtered = import_items.filter((item) => {
      const name = item.split(/\s+as\s+/)[0].trim()
      return name !== var_name
    })

    if (filtered.length === 0) {
      return null // Remove entire line
    }

    if (filtered.length === import_items.length) {
      return line // Var not found in this import
    }

    return `${prefix} ${filtered.join(', ')} ${suffix}`
  }

  return line
}

async function processFile(
  filename: string,
  unused_vars: Set<string>,
): Promise<boolean> {
  const content = await Deno.readTextFile(filename)
  const lines = content.split('\n')
  const new_lines: string[] = []
  let modified = false

  for (const line of lines) {
    let current_line: string | null = line

    for (const var_name of unused_vars) {
      if (current_line === null) break
      const result = removeImportFromLine(current_line, var_name)
      if (result !== current_line) {
        modified = true
        current_line = result
      }
    }

    if (current_line !== null) {
      new_lines.push(current_line)
    }
  }

  if (modified) {
    await Deno.writeTextFile(filename, new_lines.join('\n'))
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

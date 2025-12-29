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

function removeImportFromLine(line: string, varName: string): string | null {
  // Check if this line is an import statement containing the var
  if (!line.trim().startsWith('import ')) return line

  // Default import: import foo from 'bar'
  const defaultImportMatch = line.match(/^import\s+(\w+)\s+from\s+/)
  if (defaultImportMatch && defaultImportMatch[1] === varName) {
    return null // Remove entire line
  }

  // Named imports: import { foo, bar } from 'baz'
  const namedImportMatch = line.match(/^(import\s*\{)([^}]+)(\}\s*from\s*.+)$/)
  if (namedImportMatch) {
    const [, prefix, imports, suffix] = namedImportMatch
    const importItems = imports.split(',').map((s) => s.trim())

    // Find and remove the var (handling 'as' aliases)
    const filtered = importItems.filter((item) => {
      const name = item.split(/\s+as\s+/)[0].trim()
      return name !== varName
    })

    if (filtered.length === 0) {
      return null // Remove entire line
    }

    if (filtered.length === importItems.length) {
      return line // Var not found in this import
    }

    return `${prefix} ${filtered.join(', ')} ${suffix}`
  }

  return line
}

async function processFile(
  filename: string,
  unusedVars: Set<string>
): Promise<boolean> {
  const content = await Deno.readTextFile(filename)
  const lines = content.split('\n')
  const newLines: string[] = []
  let modified = false

  for (const line of lines) {
    let currentLine: string | null = line

    for (const varName of unusedVars) {
      if (currentLine === null) break
      const result = removeImportFromLine(currentLine, varName)
      if (result !== currentLine) {
        modified = true
        currentLine = result
      }
    }

    if (currentLine !== null) {
      newLines.push(currentLine)
    }
  }

  if (modified) {
    await Deno.writeTextFile(filename, newLines.join('\n'))
    return true
  }
  return false
}

async function main() {
  console.log('Running deno lint...')
  const lintOutput = await runLint()

  // Group unused vars by file
  const unusedByFile = new Map<string, Set<string>>()

  for (const diag of lintOutput.diagnostics) {
    if (diag.code !== 'no-unused-vars') continue

    const varName = extractUnusedVarName(diag.message)
    if (!varName) continue

    // Convert file:// URL to path
    const filePath = diag.filename.replace('file://', '')

    if (!unusedByFile.has(filePath)) {
      unusedByFile.set(filePath, new Set())
    }
    unusedByFile.get(filePath)!.add(varName)
  }

  if (unusedByFile.size === 0) {
    console.log('No unused imports found.')
    return
  }

  console.log(`Found unused vars in ${unusedByFile.size} file(s)`)

  let filesModified = 0
  for (const [filePath, unusedVars] of unusedByFile) {
    console.log(`Processing ${filePath}: ${[...unusedVars].join(', ')}`)
    const modified = await processFile(filePath, unusedVars)
    if (modified) {
      filesModified++
    }
  }

  console.log(`Modified ${filesModified} file(s)`)

  // Run lint again to verify
  console.log('\nRunning deno lint again to verify...')
  const verifyOutput = await runLint()
  const remainingUnused = verifyOutput.diagnostics.filter(
    (d) => d.code === 'no-unused-vars'
  )

  if (remainingUnused.length > 0) {
    console.log(
      `\nNote: ${remainingUnused.length} unused var(s) remain (likely not imports):`
    )
    for (const d of remainingUnused) {
      console.log(`  ${d.filename}:${d.range.start.line} - ${d.message}`)
    }
  } else {
    console.log('All unused imports removed!')
  }
}

main()

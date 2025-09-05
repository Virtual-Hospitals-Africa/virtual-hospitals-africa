function extractQuotedStrings(content: string): string[] {
  const strings: string[] = []

  // Regex to match both single and double quoted strings
  // Handles escaped quotes within strings
  const doubleQuotedRegex = /"((?:[^"\\]|\\.)*)"/g
  const singleQuotedRegex = /'((?:[^'\\]|\\.)*)'/g

  // Extract double-quoted strings
  let match
  while ((match = doubleQuotedRegex.exec(content)) !== null) {
    strings.push(`"${match[1]}"`)
  }

  while ((match = singleQuotedRegex.exec(content)) !== null) {
    strings.push(`'${match[1]}'`)
  }

  return strings
}

async function main() {
  const args = Deno.args

  if (args.length === 0) {
    console.error(
      'Usage: deno run --allow-read scripts/allStringsInFile.ts <filepath>',
    )
    Deno.exit(1)
  }

  const filepath = args[0]

  try {
    console.log(`Reading file: ${filepath}\n`)

    const content = await Deno.readTextFile(filepath)
    const quotedStrings = extractQuotedStrings(content)

    if (!quotedStrings.length) {
      console.log('No quoted strings found in the file.')
      Deno.exit(1)
    } else {
      console.log(`Found ${quotedStrings.length} quoted string(s):\n`)

      quotedStrings.forEach((str) => {
        console.log(str)
      })
    }
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.error(`Error: File not found: ${filepath}`)
    } else if (error instanceof Deno.errors.PermissionDenied) {
      console.error(`Error: Permission denied reading: ${filepath}`)
    } else {
      // deno-lint-ignore no-explicit-any
      console.error(`Error reading file: ${(error as any).message}`)
    }
    Deno.exit(1)
  }
}

if (import.meta.main) {
  await main()
}

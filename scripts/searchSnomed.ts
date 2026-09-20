import db from '../db/db.ts'
import { searchSnomedConceptsMatching } from '../db/models/s_expression_snomed_concepts.ts'

/*
  Prints every SNOMED concept that satisfies an s_expression on the strength of the
  ontology alone, one per line in the |id |name (category)| style SNOMED browsers use.

  deno task script searchSnomed '(finding
    (attribute (snomed_concept "Interprets" "attribute") (snomed_concept "Ability to speak" "observable entity"))
    (attribute (snomed_concept "Has interpretation" "attribute") (snomed_concept "Able with difficulty" "qualifier value"))
  )'

  The s_expression is whichever argument opens with a parenthesis, so it may be passed
  directly or after other arguments.
*/
const s_expression = Deno.args.find((arg) => arg.trim().startsWith('('))

if (!s_expression) {
  console.error("Usage: deno task script searchSnomed '(finding ...)'")
  Deno.exit(1)
}

const results = await searchSnomedConceptsMatching(db, s_expression)

const max_id_length = Math.max(
  ...results.map((result) => result.id.length),
)

// console.info is not monkey-patched with timestamps, so the readout stays clean
for (const { id, name, category } of results) {
  console.info(`${id.padStart(max_id_length)} |${name} (${category})|`)
}
console.info(`\n${results.length} matching concept${results.length === 1 ? '' : 's'}`)

await db.destroy()

import { writeRowsAsTypescript } from '../../scripts/tsvAsTypescript.ts'
import { asResult } from '../../util/asResult.ts'
import { MedicineRow, ParsedMedicineRecommendedDose } from './shared.ts'
import { MedicineParser } from './MedicineParser.ts'
import { humanReadableJson } from '../../util/humanReadableJson.ts'
import { getZARecommendedDoses } from './south_africa_recommended_doses.ts'

function parseAll() {
  const parsed: ParsedMedicineRecommendedDose[] = []
  const failures: { medicine_row: MedicineRow; error_message: string; error_stack: string }[] = []
  for (const medicine_row of getZARecommendedDoses()) {
    const result = asResult(() => MedicineParser.parse(medicine_row))
    if (result.success) {
      parsed.push(result.value.parsed)
    } else {
      failures.push({
        medicine_row,
        error_message: result.error.message,
        error_stack: result.error.stack!,
      })
    }
  }
  return { parsed, failures }
}

if (import.meta.main) {
  const { parsed, failures } = parseAll()

  const content = `${humanReadableJson(parsed)}\n`
  await Deno.writeTextFile('./backend/recommended_doses/parsed/recommended_doses.json', content, { create: true })
  console.log(`Written ${parsed.length} rows to ${'./backend/recommended_doses/parsed/recommended_doses.json'}`)
  await writeRowsAsTypescript('./backend/recommended_doses/parsed/recommended_dose_parse_failures.ts', failures)
  if (failures.length) {
    Deno.exit(1)
  }
}

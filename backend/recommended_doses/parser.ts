import { writeRowsAsTypescript } from '../../scripts/file-manipulation/tsvAsTypescript.ts'
import { asResult } from '../../util/asResult.ts'
import { MedicineRow, ParsedMedicineRecommendedDose } from './shared.ts'
import { MedicineParser } from './MedicineParser.ts'
import { humanReadableJson } from '../../util/humanReadableJson.ts'
import { getZARecommendedDoses } from './south_africa_recommended_doses.ts'

// Non-medicine devices/appliances that appear in the source alongside real
// medications but carry no ATC, form, route, or dose and should not be parsed
// as recommended doses.
const NON_MEDICINE_NAMES = new Set(['spacer'])

function isNonMedicineRow(medicine_row: MedicineRow): boolean {
  const name = medicine_row['MEDICINE NAME (International Nonproprietary Name)']
    .replace(/\(.*\)/, '')
    .trim()
    .toLowerCase()
  return NON_MEDICINE_NAMES.has(name)
}

function parseAll() {
  const parsed: ParsedMedicineRecommendedDose[] = []
  const failures: { medicine_row: MedicineRow; error_message: string; error_stack: string }[] = []
  for (const medicine_row of getZARecommendedDoses()) {
    if (isNonMedicineRow(medicine_row)) continue
    console.log({ medicine_row })
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

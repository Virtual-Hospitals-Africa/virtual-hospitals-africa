import { parseTsvTypedSync } from '../../util/parseCsv.ts'
import { MedicineRowSchema } from './shared.ts'

export function getZARecommendedDoses() {
  return parseTsvTypedSync(
    './backend/recommended_doses/raw_data/Essential-Medicines-List_V1.1-2-October-2025.xlsx - EML V1.1.tsv',
    MedicineRowSchema,
  )
}

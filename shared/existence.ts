import { Existence, Maybe } from '../types.ts'
import { NO_QUALIFIER, UNKNOWN_QUALIFIER } from './snomed_concepts.ts'

/*
  A record's existence follows from its value_snomed_concept, mirroring how the
  patient_records_aggregated trigger derives the column.
*/
export function asExistence(
  value_snomed_concept: Maybe<{ name: string }>,
): Existence {
  switch (value_snomed_concept?.name) {
    case NO_QUALIFIER.name:
      return 'No'
    case UNKNOWN_QUALIFIER.name:
      return 'Unknown'
    default:
      return 'Yes'
  }
}

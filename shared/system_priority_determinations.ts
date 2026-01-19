import { parseWithSchema } from './s_expression.ts'
import { system_priority_determination } from './s_expression_schemas.ts'
import { VITAL_MEASUREMENTS_SNOMED_CONCEPTS, VITAL_MEASUREMENTS_UNITS } from './vitals.ts'
import { AgeDetermination } from '../types.ts'
import { groupByUniq } from '../util/groupBy.ts'

function asSystemPriorityDetermination([age_determinations, s_expression]: ['all' | AgeDetermination[], string]) {
  return {
    age_determinations: age_determinations === 'all' ? ['adult' as const, 'older child' as const, 'younger child' as const] : age_determinations,
    system_priority_determination: parseWithSchema(
      s_expression,
      system_priority_determination,
    ),
  }
}

export const SYSTEM_PRIORITY_DETERMINATIONS_DEFS: ['all' | AgeDetermination[], string][] = [
  [
    'all',
    `(system_priority_determination
      "Emergency: Hypoglycaemia (glucose < 3)"
        (< (measurement ${VITAL_MEASUREMENTS_SNOMED_CONCEPTS.blood_glucose.s_expression} ${VITAL_MEASUREMENTS_UNITS.blood_glucose}) 3)
        Emergency)`,
  ],
  [
    ['older child', 'younger child'],
    `(system_priority_determination
      "Emergency: Cold hands + weak & fast pulse + lethargic"
        (clinical_finding (snomed_concept "Cold hands" "finding"))
        Emergency
        (clinical_finding (snomed_concept "Weak arterial pulse" "finding"))
        (clinical_finding (snomed_concept "Pulse fast" "finding"))
        (clinical_finding (snomed_concept "Lethargy" "finding")))`,
  ],
  // [
  //   ['older child', 'younger child'],
  //   `(system_priority_determination
  //     "Emergency: Cold hands + weak & fast pulse + lethargic"
  //       (clinical_finding (snomed_concept "Cold hands" "finding"))
  //       Emergency
  //       (clinical_finding (snomed_concept "Lethargy" "finding")))`,
  // ],
]

export const SYSTEM_PRIORITY_DETERMINATIONS = SYSTEM_PRIORITY_DETERMINATIONS_DEFS.map(asSystemPriorityDetermination)

export const KEYED_SYSTEM_PRIORITY_DETERMINATIONS = groupByUniq(SYSTEM_PRIORITY_DETERMINATIONS, (s) => s.system_priority_determination.description)

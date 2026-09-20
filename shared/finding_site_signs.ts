import { assert } from 'std/assert/assert.ts'
import { FindingSite, FindingSiteSign } from '../types.ts'
import { FINDING_SITE_FINDINGS } from './finding_site_findings.ts'
import { finding, MatchingFinding } from './s_expression_schemas.ts'
import { parseWithSchema } from './s_expression.ts'
import { inverseSExpression } from './s_expression_inverse.ts'
import { findingFullDisplay } from './patient_records.ts'
import finding_site_signs_modifiers from './finding_site_signs_modifiers.ts'

/*
  The body sites the warning signs page can be filtered by, each with the signs its guide
  page tells the nurse to check for, shaped like the common symptoms so the page can render
  the two the same way. Maintained in shared/finding_site_findings.ts and joined here with
  the modifiers every finding carries.
*/
function asSign({ s_expression, label }: { s_expression: string; label: string }): FindingSiteSign {
  const node = parseWithSchema(s_expression, finding)
  assert(node.specific_snomed_concept, `${s_expression} names no specific concept`)
  const matching = node as MatchingFinding
  const concept = inverseSExpression(matching.specific_snomed_concept)
  const modifiers = finding_site_signs_modifiers[concept]
  assert(modifiers, `No modifiers for ${concept}, run scripts/data-munging/finding-site-signs-modifiers.ts`)
  const display = findingFullDisplay({ ...matching, existence: 'Yes' as const })
  return {
    key: display,
    clinical_finding_s_expression: inverseSExpression({ ...matching, existence: 'Yes' as const }),
    name: display,
    description: null,
    category: label,
    ...modifiers,
  }
}

export const FINDING_SITES: FindingSite[] = FINDING_SITE_FINDINGS.map(
  ({ label, finding_site_structure, excluding_structures, including_s_expressions, clinical_finding_s_expressions }) => {
    const signs = clinical_finding_s_expressions.map((s_expression) => asSign({ s_expression, label }))
    const keys = new Set(signs.map((sign) => sign.key))
    assert(keys.size === signs.length, `Duplicate signs for finding site ${finding_site_structure}`)
    return {
      label,
      snomed_concept: { name: finding_site_structure, category: 'body structure' as const },
      excluding_structures,
      including_s_expressions,
      signs,
    }
  },
)

export const FINDING_SITES_BY_NAME = new Map(FINDING_SITES.map((site) => [site.snomed_concept.name, site]))

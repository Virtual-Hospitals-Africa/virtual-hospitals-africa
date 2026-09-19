import { assert } from 'std/assert/assert.ts'
import { FindingSite, FindingSiteSign } from '../types.ts'
import { TASKS } from './tasks.ts'
import { Lang, MatchingFinding, QueryableEvidenceNode } from './s_expression_schemas.ts'
import { inverseSExpression } from './s_expression_inverse.ts'
import { findingFullDisplay } from './patient_records.ts'
import { FINDING_SITE } from './snomed_concepts.ts'
import finding_site_signs_modifiers from './finding_site_signs_modifiers.ts'

/*
  The body sites, in the order the adult guide presents their pages, that a nurse can
  filter the warning signs page by. Each must gate exactly one adult task in the rules,
  which is where the site's signs come from. The label heads the site's table.
*/
const FINDING_SITE_LABELS: Array<[label: string, name: string]> = [
  ['Eye', 'Structure of eye proper'],
  ['Face', 'Face structure'],
  ['Ear', 'Ear structure'],
  ['Nose', 'Nasal structure'],
  ['Mouth or throat', 'Structure of mouth and/or pharynx'],
  ['Gums and teeth', 'Tooth, gum, and/or supporting structure'],
  ['Scrotum', 'Scrotal structure'],
  ['Joint', 'Joint structure'],
  ['Arm', 'Upper limb structure'],
  ['Hand', 'Hand structure'],
  ['Leg', 'Lower limb structure'],
  ['Foot', 'Foot structure'],
  ['Skin', 'Skin structure'],
  ['Scalp', 'Scalp structure'],
  ['Nail', 'Nail unit structure'],
]

/*
  A task applies by finding site when its evidence is a clinical finding naming no concept,
  only a site: (clinical_finding (finding_site ...)). Such a node may be one branch of an or.
*/
function* sitesGating(due_to: QueryableEvidenceNode): Generator<Lang['snomed_concept']> {
  if (due_to.atom === 'or') {
    for (const expression of due_to.expressions) yield* sitesGating(expression)
    return
  }
  if (due_to.atom !== 'finding') return
  if (due_to.specific_snomed_concept || due_to.qualifiers.length || due_to.attributes.length !== 1) return
  const [attribute] = due_to.attributes
  if (attribute.specific_snomed_concept.name !== FINDING_SITE.name) return
  assert(attribute.value.atom === 'snomed_concept')
  yield attribute.value
}

function isCheckFor(value: Lang['procedure']['value']): value is MatchingFinding[] {
  return Array.isArray(value) && value.every((node) => node.atom === 'finding')
}

function asSign(node: MatchingFinding, label: string): FindingSiteSign {
  const finding = { ...node, existence: 'Yes' as const }
  const display = findingFullDisplay(finding)
  const concept = inverseSExpression(node.specific_snomed_concept)
  const modifiers = finding_site_signs_modifiers[concept]
  assert(modifiers, `No modifiers for ${concept}, run scripts/data-munging/finding-site-signs-modifiers.ts`)
  return {
    key: display,
    clinical_finding_s_expression: inverseSExpression(finding),
    name: display,
    description: null,
    category: label,
    ...modifiers,
  }
}

const check_for_by_site = new Map<string, MatchingFinding[]>()
for (const task of TASKS) {
  if (!task.ages.includes('adult')) continue
  if (!isCheckFor(task.to_be_done.value)) continue
  for (const site of sitesGating(task.due_to)) {
    assert(site.category === 'body structure', `Finding site ${site.name} is not a body structure`)
    assert(!check_for_by_site.has(site.name), `More than one task is gated on ${site.name}`)
    check_for_by_site.set(site.name, task.to_be_done.value)
  }
}

export const FINDING_SITES: FindingSite[] = FINDING_SITE_LABELS.map(([label, name]) => {
  const check_for = check_for_by_site.get(name)
  assert(check_for, `No adult task is gated on finding site ${name}`)
  check_for_by_site.delete(name)
  return {
    label,
    snomed_concept: { name, category: 'body structure' as const },
    signs: check_for.map((node) => asSign(node, label)),
  }
})

assert(
  !check_for_by_site.size,
  `Tasks gated on finding sites without a label: ${[...check_for_by_site.keys()].join(', ')}`,
)

export const FINDING_SITES_BY_NAME = new Map(FINDING_SITES.map((site) => [site.snomed_concept.name, site]))

import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { nameAndCategorySnomedConceptBase } from '../../db/models/s_expression.ts'
import { FINDING_SITES } from '../../shared/finding_site_signs.ts'
import { insertable_finding_base } from '../../shared/s_expression_schemas.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { humanReadableJson } from '../../util/humanReadableJson.ts'

describe('shared/finding_site_signs.ts', () => {
  afterAll(() => db.destroy())

  it('lists every adult guide page whose task is gated on a finding site, in guide order', () => {
    assertEquals(
      FINDING_SITES.map((site) => [site.label, site.snomed_concept.name]),
      [
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
      ],
    )
  })

  it("takes a site's signs from the check_for list of its page, shaped like common symptoms", () => {
    const ear = FINDING_SITES.find((site) => site.label === 'Ear')!
    assertEquals(ear.snomed_concept, { name: 'Ear structure', category: 'body structure' })
    assertEquals(ear.signs.map((sign) => sign.name), [
      'Itching of ear',
      'Ear discharge',
      'Pain of ear',
      'Hearing difficulty',
      'Tinnitus',
    ])
    const pain_of_ear = ear.signs[2]
    assertEquals(pain_of_ear.key, 'Pain of ear')
    assertEquals(pain_of_ear.category, 'Ear')
    assertEquals(pain_of_ear.description, null)
    assertEquals(pain_of_ear.clinical_finding_s_expression, '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pain of ear" "finding"))')
    assertEquals(pain_of_ear.predefined_attributes, [
      { s_expression: '(attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Ear structure" "body structure"))' },
    ])
    assertEquals(pain_of_ear.onset_required, false)
    assert(Array.isArray(pain_of_ear.relevant_qualifiers))
  })

  it('shares one sign list between the arm and hand pages, which come from the same task', () => {
    const arm = FINDING_SITES.find((site) => site.label === 'Arm')!
    const hand = FINDING_SITES.find((site) => site.label === 'Hand')!
    assertEquals(arm.signs.map((sign) => sign.key), hand.signs.map((sign) => sign.key))
    assert(arm.signs.some((sign) => sign.key === 'Hand pain'))
    assertEquals(arm.signs[0].category, 'Arm')
    assertEquals(hand.signs[0].category, 'Hand')
  })

  it('keeps qualified findings distinct from their unqualified form by key', () => {
    const foot = FINDING_SITES.find((site) => site.label === 'Foot')!
    const ischemic = foot.signs.filter((sign) => sign.name.includes('Ischemic foot with rest pain'))
    assertEquals(ischemic.length, 2)
    assert(new Set(ischemic.map((sign) => sign.key)).size === 2, humanReadableJson(ischemic))
    for (const site of FINDING_SITES) {
      const keys = site.signs.map((sign) => sign.key)
      assertEquals(new Set(keys).size, keys.length, `Duplicate keys for ${site.label}: ${keys.join(', ')}`)
    }
  })

  it('refers to existing snomed concepts in each case', async () => {
    for (const site of FINDING_SITES) {
      const site_concept = await nameAndCategorySnomedConceptBase(db, { atom: 'snomed_concept', ...site.snomed_concept }).executeTakeFirst()
      assert(site_concept, `No snomed concept found for site ${humanReadableJson(site.snomed_concept)}`)
      for (const sign of site.signs) {
        const { specific_snomed_concept } = parseWithSchema(sign.clinical_finding_s_expression, insertable_finding_base)
        const result = await nameAndCategorySnomedConceptBase(db, specific_snomed_concept).executeTakeFirst()
        assert(result, `No snomed concept found for ${humanReadableJson(sign)}`)
      }
    }
  })
})

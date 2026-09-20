import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { nameAndCategorySnomedConceptBase } from '../../db/models/s_expression.ts'
import { FINDING_SITES } from '../../shared/finding_site_signs.ts'
import { FINDING_SITE_FINDINGS } from '../../shared/finding_site_findings.ts'
import { insertable_finding_base } from '../../shared/s_expression_schemas.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { humanReadableJson } from '../../util/humanReadableJson.ts'

describe('shared/finding_site_signs.ts', () => {
  afterAll(() => db.destroy())

  it('lists every adult guide page presented by finding site, in guide order', () => {
    assertEquals(
      FINDING_SITES.map((site) => [site.label, site.snomed_concept.name]),
      [
        ['Head', 'Head structure'],
        ['Eye', 'Structure of eye proper'],
        ['Face', 'Face structure'],
        ['Ear', 'Ear structure'],
        ['Nose', 'Nasal structure'],
        ['Mouth or throat', 'Structure of mouth and/or pharynx'],
        ['Teeth & gums', 'Tooth, gum, and/or supporting structure'],
        ['Chest', 'Thoracic structure'],
        ['Breast', 'Breast structure'],
        [
          'Abdomen',
          'Structure of abdominopelvic cavity and/or content of abdominopelvic cavity and/or anterior abdominal wall',
        ],
        ['Anal & rectal', 'Structure of anus and/or rectum'],
        ['Genital', 'Genital structure'],
        ['Urinary', 'Urinary system structure'],
        ['Joint', 'Joint structure'],
        ['Back', 'Structure of posterior region of trunk'],
        ['Neck', 'Neck structure'],
        ['Arm', 'Upper limb structure'],
        ['Hand', 'Hand structure'],
        ['Leg', 'Lower limb structure'],
        ['Foot', 'Foot structure'],
        ['Skin', 'Skin structure'],
        ['Hair & scalp', 'Scalp structure'],
        ['Nail', 'Nail unit structure'],
      ],
    )
  })

  it("takes a site's signs from the findings its guide page names, shaped like common symptoms", () => {
    const ear = FINDING_SITES.find((site) => site.label === 'Ear')!
    assertEquals(ear.snomed_concept, { name: 'Ear structure', category: 'body structure' })
    const pain_of_ear = ear.signs.find((sign) => sign.key === 'Pain of ear')!
    assertEquals(pain_of_ear.name, 'Pain of ear')
    assertEquals(pain_of_ear.category, 'Ear')
    assertEquals(pain_of_ear.description, null)
    assertEquals(pain_of_ear.clinical_finding_s_expression, '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Pain of ear" "finding"))')
    assertEquals(pain_of_ear.predefined_attributes, [
      { s_expression: '(attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Ear structure" "body structure"))' },
    ])
    assertEquals(pain_of_ear.onset_required, false)
    assert(Array.isArray(pain_of_ear.relevant_qualifiers))
  })

  it('sites the breast findings, which no task checks for, on the breast or the nipple', () => {
    const breast = FINDING_SITES.find((site) => site.label === 'Breast')!
    assertEquals(breast.signs.map((sign) => sign.name), [
      'Breast lump',
      'Pain of breast',
      'Discharge from nipple',
      'Bloody nipple discharge',
      'Retraction of nipple',
      'Swelling of breast',
      'Mass of axilla',
      'Maternal breastfeeding',
      'Sore nipple',
      'Fissure of nipple',
      'Fever',
      'Generalized aches and pains',
    ])
    for (const sign of breast.signs) assertEquals(sign.category, 'Breast')
  })

  it('curates the arm and hand pages apart, though the guide prints them together', () => {
    const arm = FINDING_SITES.find((site) => site.label === 'Arm')!
    const hand = FINDING_SITES.find((site) => site.label === 'Hand')!
    assert(arm.signs.some((sign) => sign.key === 'Pain in upper limb'))
    assert(hand.signs.some((sign) => sign.key === 'Hand pain'))
    assert(!arm.signs.some((sign) => sign.key === 'Hand pain'))
    assertEquals(arm.signs[0].category, 'Arm')
    assertEquals(hand.signs[0].category, 'Hand')
  })

  it('keeps qualified findings distinct from their unqualified form by key', () => {
    const chest = FINDING_SITES.find((site) => site.label === 'Chest')!
    const chest_pain = chest.signs.filter((sign) => sign.name.includes('Chest pain'))
    assert(chest_pain.length > 2, humanReadableJson(chest_pain))
    for (const site of FINDING_SITES) {
      const keys = site.signs.map((sign) => sign.key)
      assertEquals(new Set(keys).size, keys.length, `Duplicate keys for ${site.label}: ${keys.join(', ')}`)
    }
  })

  it('excludes only sites it also lists, so a page never excludes something unrecognised', () => {
    const structures = new Set(FINDING_SITE_FINDINGS.map((site) => site.finding_site_structure))
    for (const site of FINDING_SITES) {
      assert(Array.isArray(site.excluding_structures))
      for (const excluded of site.excluding_structures) {
        assert(structures.has(excluded), `${site.label} excludes ${excluded}, which is no finding site`)
        assert(excluded !== site.snomed_concept.name, `${site.label} excludes itself`)
      }
    }
  })

  it('refers to existing snomed concepts in each case', async () => {
    for (const site of FINDING_SITES) {
      const site_concept = await nameAndCategorySnomedConceptBase(db, { atom: 'snomed_concept', ...site.snomed_concept }).executeTakeFirst()
      assert(site_concept, `No snomed concept found for site ${humanReadableJson(site.snomed_concept)}`)
      for (const excluded of site.excluding_structures) {
        const excluded_concept = await nameAndCategorySnomedConceptBase(db, {
          atom: 'snomed_concept',
          name: excluded,
          category: 'body structure',
        }).executeTakeFirst()
        assert(excluded_concept, `No snomed concept found for excluded structure ${excluded}`)
      }
      for (const sign of site.signs) {
        const { specific_snomed_concept } = parseWithSchema(sign.clinical_finding_s_expression, insertable_finding_base)
        const result = await nameAndCategorySnomedConceptBase(db, specific_snomed_concept).executeTakeFirst()
        assert(result, `No snomed concept found for ${humanReadableJson(sign)}`)
      }
    }
  })
})

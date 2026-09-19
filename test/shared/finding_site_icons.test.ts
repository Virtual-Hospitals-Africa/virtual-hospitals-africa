import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { FINDING_SITE_ICONS, WHOLE_BODY_LABEL } from '../../components/library/icons/finding_sites.tsx'
import { FINDING_SITES } from '../../shared/finding_site_signs.ts'

describe('components/library/icons/finding_sites.tsx', () => {
  it('draws every finding site the warning signs page can filter by, and nothing besides', () => {
    assertEquals(
      Object.keys(FINDING_SITE_ICONS),
      [WHOLE_BODY_LABEL, ...FINDING_SITES.map((site) => site.label)],
    )
  })
})

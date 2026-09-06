import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { accumulateFollowUps, FollowUpGroup } from '../../../islands/WarningSigns/follow_ups.ts'
import { EnteredFinding, FindingToCheckFor } from '../../../types.ts'

const insect_bite: EnteredFinding = {
  s_expression: '(clinical_finding (snomed_concept "Insect bite - wound" "disorder"))',
  display: 'Insect bite - wound',
}
const insect_bite_on_arm: EnteredFinding = {
  s_expression: '(clinical_finding (snomed_concept "Insect bite - wound" "disorder") (finding_site (snomed_concept "Arm" "body structure")))',
  display: 'Insect bite - wound, Arm',
}
const nose_bleed: EnteredFinding = {
  s_expression: '(clinical_finding (snomed_concept "Epistaxis" "disorder"))',
  display: 'Epistaxis',
}

const check_for = (name: string): FindingToCheckFor => ({
  s_expression: `(clinical_finding (snomed_concept "${name}" "finding"))`,
  existing_record: null,
})

describe('islands/WarningSigns/follow_ups.ts', () => {
  describe('accumulateFollowUps', () => {
    it('appends a group for a newly saved sign', () => {
      const result = accumulateFollowUps([], { key: 'insect-bite', due_to: insect_bite, findings_to_check_for: [check_for('Diplopia')] })
      assertEquals(result, [{ key: 'insect-bite', due_to: insect_bite, findings_to_check_for: [check_for('Diplopia')] }])
    })

    it('keeps groups from earlier saves, most recent last', () => {
      const existing: FollowUpGroup[] = [{ key: 'insect-bite', due_to: insect_bite, findings_to_check_for: [check_for('Diplopia')] }]
      const result = accumulateFollowUps(existing, { key: 'nose-bleed', due_to: nose_bleed, findings_to_check_for: [check_for('Injury of head')] })
      assertEquals(result.map((group) => group.key), ['insect-bite', 'nose-bleed'])
    })

    it('replaces the group when the same sign is saved again with an edited finding', () => {
      const existing: FollowUpGroup[] = [
        { key: 'insect-bite', due_to: insect_bite, findings_to_check_for: [check_for('Diplopia')] },
        { key: 'nose-bleed', due_to: nose_bleed, findings_to_check_for: [check_for('Injury of head')] },
      ]
      const result = accumulateFollowUps(existing, { key: 'insect-bite', due_to: insect_bite_on_arm, findings_to_check_for: [check_for('Deep bite wound')] })
      assertEquals(result, [
        { key: 'nose-bleed', due_to: nose_bleed, findings_to_check_for: [check_for('Injury of head')] },
        { key: 'insect-bite', due_to: insect_bite_on_arm, findings_to_check_for: [check_for('Deep bite wound')] },
      ])
    })

    it('drops the group when the re-saved sign has nothing to check for', () => {
      const existing: FollowUpGroup[] = [{ key: 'insect-bite', due_to: insect_bite, findings_to_check_for: [check_for('Diplopia')] }]
      assertEquals(accumulateFollowUps(existing, { key: 'insect-bite', due_to: insect_bite_on_arm, findings_to_check_for: [] }), [])
    })

    it('adds nothing when a new sign has nothing to check for', () => {
      assertEquals(accumulateFollowUps([], { key: 'nose-bleed', due_to: nose_bleed, findings_to_check_for: [] }), [])
    })

    it('removes the group for a sign', () => {
      const existing: FollowUpGroup[] = [
        { key: 'insect-bite', due_to: insect_bite, findings_to_check_for: [check_for('Diplopia')] },
        { key: 'nose-bleed', due_to: nose_bleed, findings_to_check_for: [check_for('Injury of head')] },
      ]
      assertEquals(accumulateFollowUps(existing, { key: 'insect-bite', due_to: null, findings_to_check_for: [] }), [
        { key: 'nose-bleed', due_to: nose_bleed, findings_to_check_for: [check_for('Injury of head')] },
      ])
    })
  })
})

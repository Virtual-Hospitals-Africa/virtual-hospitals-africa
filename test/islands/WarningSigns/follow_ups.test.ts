import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { accumulateFollowUps, EMPTY_RULES_DRY_RUN, FollowUpGroup } from '../../../islands/WarningSigns/follow_ups.ts'
import { EnteredFinding, FindingToCheckFor, RulesDryRun } from '../../../types.ts'

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
  name,
  task_ids: ['Check for something'],
  predefined_attributes: [],
  relevant_qualifiers: [],
  onset_required: false,
  existing_record: null,
})

const dry_run = (...names: string[]): RulesDryRun => ({
  ...EMPTY_RULES_DRY_RUN,
  findings_to_check_for: names.map(check_for),
})

const group = (key: string, due_to: EnteredFinding, ...names: string[]): FollowUpGroup => ({
  key,
  due_to,
  ...dry_run(...names),
})

describe('islands/WarningSigns/follow_ups.ts', () => {
  describe('accumulateFollowUps', () => {
    it('appends a group for a newly saved sign', () => {
      const result = accumulateFollowUps([], { key: 'insect-bite', due_to: insect_bite, dry_run: dry_run('Diplopia') })
      assertEquals(result, [group('insect-bite', insect_bite, 'Diplopia')])
    })

    it('keeps groups from earlier saves, most recent last', () => {
      const existing: FollowUpGroup[] = [group('insect-bite', insect_bite, 'Diplopia')]
      const result = accumulateFollowUps(existing, { key: 'nose-bleed', due_to: nose_bleed, dry_run: dry_run('Injury of head') })
      assertEquals(result.map((group) => group.key), ['insect-bite', 'nose-bleed'])
    })

    it('replaces the group when the same sign is saved again with an edited finding', () => {
      const existing: FollowUpGroup[] = [
        group('insect-bite', insect_bite, 'Diplopia'),
        group('nose-bleed', nose_bleed, 'Injury of head'),
      ]
      const result = accumulateFollowUps(existing, { key: 'insect-bite', due_to: insect_bite_on_arm, dry_run: dry_run('Deep bite wound') })
      assertEquals(result, [
        group('nose-bleed', nose_bleed, 'Injury of head'),
        group('insect-bite', insect_bite_on_arm, 'Deep bite wound'),
      ])
    })

    it('carries the diagnoses and priority the sign would indicate', () => {
      const would_indicate: RulesDryRun = {
        ...dry_run('Diplopia'),
        would_indicate_priority: 'Urgent',
      }
      const [result] = accumulateFollowUps([], { key: 'insect-bite', due_to: insect_bite, dry_run: would_indicate })
      assertEquals(result.would_indicate_priority, 'Urgent')
      assertEquals(result.would_indicate_diagnoses, [])
    })

    it('drops the group when the re-saved sign has nothing to check for', () => {
      const existing: FollowUpGroup[] = [group('insect-bite', insect_bite, 'Diplopia')]
      assertEquals(accumulateFollowUps(existing, { key: 'insect-bite', due_to: insect_bite_on_arm, dry_run: EMPTY_RULES_DRY_RUN }), [])
    })

    it('adds nothing when a new sign has nothing to check for', () => {
      assertEquals(accumulateFollowUps([], { key: 'nose-bleed', due_to: nose_bleed, dry_run: EMPTY_RULES_DRY_RUN }), [])
    })

    it('removes the group for a sign', () => {
      const existing: FollowUpGroup[] = [
        group('insect-bite', insect_bite, 'Diplopia'),
        group('nose-bleed', nose_bleed, 'Injury of head'),
      ]
      assertEquals(accumulateFollowUps(existing, { key: 'insect-bite', due_to: null, dry_run: EMPTY_RULES_DRY_RUN }), [
        group('nose-bleed', nose_bleed, 'Injury of head'),
      ])
    })
  })
})

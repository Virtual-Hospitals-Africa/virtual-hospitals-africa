import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { accumulateFollowUps, FollowUpGroup, indicatedDiagnosisFollowUp } from '../../../islands/WarningSigns/follow_ups.ts'
import { ApplicableRuleEffectSystemDiagnosisRule, EnteredFinding, FindingToCheckFor, RulesDryRun } from '../../../types.ts'
import { DiagnosisCertainty } from '../../../db.d.ts'

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

const group = (key: string, due_to: EnteredFinding, ...names: string[]): FollowUpGroup => ({
  key,
  due_to,
  findings_to_check_for: names.map(check_for),
})

const anaphylaxis = (certainty: DiagnosisCertainty): ApplicableRuleEffectSystemDiagnosisRule => ({
  type: 'system_diagnosis_rule',
  snomed_concept: { id: '39579001', name: 'Anaphylaxis', category: 'disorder' },
  certainty,
})

const indicated = (
  diagnosis: ApplicableRuleEffectSystemDiagnosisRule[],
  ...names: string[]
): RulesDryRun['would_indicate_diagnoses'][number] => ({
  diagnosis,
  would_indicate_priority: null,
  findings_to_check_for: names.map(check_for),
})

describe('islands/WarningSigns/follow_ups.ts', () => {
  describe('accumulateFollowUps', () => {
    it('appends a group for a newly saved sign', () => {
      const result = accumulateFollowUps([], group('insect-bite', insect_bite, 'Diplopia'))
      assertEquals(result, [group('insect-bite', insect_bite, 'Diplopia')])
    })

    it('keeps groups from earlier saves, most recent last', () => {
      const existing: FollowUpGroup[] = [group('insect-bite', insect_bite, 'Diplopia')]
      const result = accumulateFollowUps(existing, group('nose-bleed', nose_bleed, 'Injury of head'))
      assertEquals(result.map((group) => group.key), ['insect-bite', 'nose-bleed'])
    })

    it('replaces the group when the same sign is saved again with an edited finding', () => {
      const existing: FollowUpGroup[] = [
        group('insect-bite', insect_bite, 'Diplopia'),
        group('nose-bleed', nose_bleed, 'Injury of head'),
      ]
      const result = accumulateFollowUps(existing, group('insect-bite', insect_bite_on_arm, 'Deep bite wound'))
      assertEquals(result, [
        group('nose-bleed', nose_bleed, 'Injury of head'),
        group('insect-bite', insect_bite_on_arm, 'Deep bite wound'),
      ])
    })

    it('sweeps the diagnosis groups a sign raised when its own group is folded in again', () => {
      const anaphylaxis_follow_up = indicatedDiagnosisFollowUp('insect-bite', indicated([anaphylaxis('possible')], 'Stridor'))
      const existing = accumulateFollowUps(
        accumulateFollowUps([], group('insect-bite', insect_bite, 'Diplopia')),
        anaphylaxis_follow_up,
      )
      assertEquals(existing.map((group) => group.key), ['insect-bite', 'insect-bite.diagnosis.39579001'])

      // Saved again, the sign no longer indicating anaphylaxis
      const result = accumulateFollowUps(existing, group('insect-bite', insect_bite_on_arm, 'Diplopia'))
      assertEquals(result, [group('insect-bite', insect_bite_on_arm, 'Diplopia')])
    })

    it('drops the group when the re-saved sign has nothing to check for', () => {
      const existing: FollowUpGroup[] = [group('insect-bite', insect_bite, 'Diplopia')]
      assertEquals(accumulateFollowUps(existing, group('insect-bite', insect_bite_on_arm)), [])
    })

    it('adds nothing when a new sign has nothing to check for', () => {
      assertEquals(accumulateFollowUps([], group('nose-bleed', nose_bleed)), [])
    })

    it('removes the group for a sign', () => {
      const existing: FollowUpGroup[] = [
        group('insect-bite', insect_bite, 'Diplopia'),
        group('nose-bleed', nose_bleed, 'Injury of head'),
      ]
      assertEquals(accumulateFollowUps(existing, { key: 'insect-bite', due_to: null, findings_to_check_for: [] }), [
        group('nose-bleed', nose_bleed, 'Injury of head'),
      ])
    })
  })

  describe('indicatedDiagnosisFollowUp', () => {
    it('is due to the diagnosis itself, keyed by the sign and the diagnosed concept', () => {
      assertEquals(indicatedDiagnosisFollowUp('insect-bite', indicated([anaphylaxis('possible')], 'Stridor')), {
        key: 'insect-bite.diagnosis.39579001',
        due_to: {
          s_expression: '(diagnosis (snomed_concept "Anaphylaxis" "disorder") possible)',
          display: 'Anaphylaxis Diagnosis: Possible diagnosis',
        },
        findings_to_check_for: [check_for('Stridor')],
      })
    })

    it('is due to the diagnosis at the highest certainty any rule effect gives it, as the pipeline would record it', () => {
      const follow_up = indicatedDiagnosisFollowUp(
        'insect-bite',
        indicated([anaphylaxis('possible'), anaphylaxis('probable')], 'Stridor'),
      )
      assertEquals(follow_up.due_to, {
        s_expression: '(diagnosis (snomed_concept "Anaphylaxis" "disorder") probable)',
        display: 'Anaphylaxis Diagnosis: Probable diagnosis',
      })
    })
  })
})

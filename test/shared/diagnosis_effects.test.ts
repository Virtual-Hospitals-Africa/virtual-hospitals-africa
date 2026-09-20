import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { CERTAINTY_ORDER, groupDiagnosisEffectsByConcept } from '../../shared/diagnosis.ts'

const anaphylaxis = { id: '39579001', name: 'Anaphylaxis' }
const meningitis = { id: '7180009', name: 'Meningitis' }

describe('shared/diagnosis.ts groupDiagnosisEffectsByConcept', () => {
  it('groups effects by concept, keeping the highest certainty as strongest', () => {
    const possible = { snomed_concept: anaphylaxis, certainty: 'possible' as const }
    const probable = { snomed_concept: anaphylaxis, certainty: 'probable' as const }
    assertEquals(
      groupDiagnosisEffectsByConcept([possible, probable]),
      [{ diagnosis: [possible, probable], strongest: probable }],
    )
  })

  it('sorts groups by concept name and keeps each group in input order', () => {
    const m = { snomed_concept: meningitis, certainty: 'probable' as const }
    const a1 = { snomed_concept: anaphylaxis, certainty: 'probable' as const }
    const a2 = { snomed_concept: anaphylaxis, certainty: 'possible' as const }
    assertEquals(
      groupDiagnosisEffectsByConcept([m, a1, a2]),
      [
        { diagnosis: [a1, a2], strongest: a1 },
        { diagnosis: [m], strongest: m },
      ],
    )
  })

  it('returns no groups for no effects', () => {
    assertEquals(groupDiagnosisEffectsByConcept([]), [])
  })

  it('orders certainties definite > probable > equivocal > possible > improbable', () => {
    assertEquals(
      Object.entries(CERTAINTY_ORDER).toSorted(([, a], [, b]) => b - a).map(([certainty]) => certainty),
      ['definite', 'probable', 'equivocal', 'possible', 'improbable'],
    )
  })
})

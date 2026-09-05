import { describe, it } from 'std/testing/bdd.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { clinical_finding, comparator, task } from '../../shared/s_expression_schemas.ts'
import { dueToInsert, getRuleByDescription } from '../../shared/rules.ts'
import assertLength from '../../util/assertLength.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assert } from 'std/assert/assert.ts'

describe('shared/rules.ts', () => {
  it('returns a single event_time_comparison insert for an onset comparison of an active_condition', () => {
    const parsed = parseWithSchema(
      `(>= (onset (active_condition (snomed_concept "Constipation" "finding"))) (time_ago 24 hours))`,
      comparator,
    )
    const inserts = dueToInsert(parsed)
    assertLength(inserts, 1)
    assert(inserts[0].type === 'event_time_comparison')
    const { duration, ...rest } = inserts[0]
    assertEquals(duration.value, 24)
    assertEquals(duration.units, 'hours')
    assertEquals(rest, {
      type: 'event_time_comparison',
      s_expression: `(>= (onset (active_condition (snomed_concept "Constipation" "finding"))) (time_ago 24 hours))`,
      event_snomed_concept: { atom: 'snomed_concept', name: 'Time of onset', category: 'observable entity' },
      root_snomed_concept: null,
      specific_snomed_concept: { atom: 'snomed_concept', name: 'Constipation', category: 'finding' },
      comparator: '>=',
      always_applies_if_present: true,
      history: true,
    })
  })

  it('returns a single event_time_comparison insert for an onset comparison of a clinical_finding', () => {
    const parsed = parseWithSchema(
      `(>= (onset (clinical_finding (snomed_concept "Constipation" "finding"))) (time_ago 24 hours))`,
      comparator,
    )
    const inserts = dueToInsert(parsed)
    assertLength(inserts, 1)
    assert(inserts[0].type === 'event_time_comparison')
    assertEquals(inserts[0].root_snomed_concept, { atom: 'snomed_concept', name: 'Clinical finding', category: 'finding' })
    assertEquals(inserts[0].specific_snomed_concept, { atom: 'snomed_concept', name: 'Constipation', category: 'finding' })
    assertEquals(inserts[0].history, false)
  })

  it('returns always_applies_if_present: false for dueToInsert for face symptoms', () => {
    const z = parseWithSchema(
      `
        (clinical_finding (finding_site (snomed_concept "Face structure" "body structure"))
          (excluding (clinical_finding (snomed_concept "Eye / vision finding" "finding")))
          (excluding (clinical_finding (finding_site (snomed_concept "Structure of eye proper" "body structure"))))
          (excluding (clinical_finding (finding_site (snomed_concept "Ear structure" "body structure"))))
          (excluding (clinical_finding (snomed_concept "Nose finding" "finding")))
          (excluding (clinical_finding (finding_site (snomed_concept "Nasal structure" "body structure"))))
          (excluding (clinical_finding (finding_site (snomed_concept "Structure of mouth and/or pharynx" "body structure"))))
          (excluding (clinical_finding (finding_site (snomed_concept "Tooth, gum, and/or supporting structure" "body structure"))))
        )
      `,
      clinical_finding,
    )
    console.log(z)
    const due_to_insert = dueToInsert(
      z,
    )

    assertLength(due_to_insert, 1)
    assertEquals(due_to_insert[0].always_applies_if_present, false)
  })

  it("keeps the excluding field within a task's due_to", () => {
    const urgent_face_symptom_task = parseWithSchema(
      `
      (task
        "Check for urgent face symptom conditions"
        adult
        (clinical_finding (finding_site (snomed_concept "Face structure" "body structure"))
          (excluding (clinical_finding (snomed_concept "Eye / vision finding" "finding")))
          (excluding (clinical_finding (finding_site (snomed_concept "Structure of eye proper" "body structure"))))
          (excluding (clinical_finding (finding_site (snomed_concept "Ear structure" "body structure"))))
          (excluding (clinical_finding (snomed_concept "Nose finding" "finding")))
          (excluding (clinical_finding (finding_site (snomed_concept "Nasal structure" "body structure"))))
          (excluding (clinical_finding (finding_site (snomed_concept "Structure of mouth and/or pharynx" "body structure"))))
          (excluding (clinical_finding (finding_site (snomed_concept "Tooth, gum, and/or supporting structure" "body structure"))))
        )
        (check_for
          (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
          (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
          (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")) (qualifier (snomed_concept "Asymmetry" "qualifier value")))
          (clinical_finding (snomed_concept "Numbness of face" "finding"))
          (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
          (clinical_finding (snomed_concept "Difficulty talking" "finding"))
          (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
          (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
          (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
          (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
          (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
          (clinical_finding (snomed_concept "Collapse" "finding"))
          (clinical_finding (snomed_concept "Abdominal pain" "finding"))
          (clinical_finding (snomed_concept "Vomiting" "disorder"))
          (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
          (clinical_finding (snomed_concept "Blood in urine" "finding"))
          (clinical_finding (snomed_concept "Proteinuria" "finding"))
          (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
          (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
          (clinical_finding (snomed_concept "Cellulitis of face" "disorder"))
        )
      )
    `,
      task,
    )

    assert(urgent_face_symptom_task.due_to.atom === 'finding')
    assert(urgent_face_symptom_task.due_to.excluding.length)
  })

  it('x', () => {
    const urgent_face_symptom_task = getRuleByDescription('Check for urgent face symptom conditions')
    assert(urgent_face_symptom_task.due_to.atom === 'finding')
    assert(urgent_face_symptom_task.due_to.excluding.length)
  })
})

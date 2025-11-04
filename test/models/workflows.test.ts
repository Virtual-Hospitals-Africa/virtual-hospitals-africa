import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import range from '../../util/range.ts'

describe('workflows', () => {
  afterAll(() => db.destroy())
  it('has a unique ordering', async () => {
    const workflows = await db.selectFrom('workflows').select(['order'])
      .orderBy('order asc').execute()
    const workflow_orders = workflows.map((workflow) =>
      parseInt(workflow.order)
    )
    assertEquals(workflow_orders, range(1, workflows.length + 1))
  })
})

describe('workflow_steps', () => {
  afterAll(() => db.destroy())
  it('has a unique ordering', async () => {
    const steps = await db.selectFrom('workflow_steps').select(['order'])
      .orderBy('order asc').execute()
    const step_orders = steps.map((step) => parseInt(step.order))
    assertEquals(step_orders, range(1, steps.length + 1))
  })
})

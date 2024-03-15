import { assert } from 'std/assert/assert.ts'
import { assertOrRedirect } from './assertOr.ts'
import last from './last.ts'
import { replaceParams } from './replaceParams.ts'

export function assertAllPriorStepsCompleted(
  workflow_steps: string[],
  base_route: string,
  process_name: string,
) {
  const last_step = last(workflow_steps)
  assert(base_route.includes('/:step'))
  return function (completed_steps: string[], params: Record<string, string>) {
    const steps_completed = new Set(completed_steps)
    const incomplete = workflow_steps.find((step) =>
      step !== last_step && !steps_completed.has(step)
    )
    if (!incomplete) return
    const is_plural = incomplete.endsWith('s')
    const pretty_name = is_plural ? incomplete : incomplete + ' information'
    const warning = encodeURIComponent(
      `Please fill out the ${
        pretty_name.replace('_', ' ')
      } form before ${process_name}`,
    )
    const url = replaceParams(base_route, {
      ...params,
      step: incomplete,
    })
    assertOrRedirect(false, `${url}?warning=${warning}`)
  }
}

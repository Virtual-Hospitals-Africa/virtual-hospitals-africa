import { describe, it } from 'std/testing/bdd.ts'
import { WARNING_SIGNS } from '../../shared/warning_signs.ts'
import { groupBy } from '../../util/groupBy.ts'

describe('shared/warning_signs.ts', () => {
  it('x', () => {
    const g = groupBy(WARNING_SIGNS, 'priority')
    const y = Object.fromEntries(g.entries().map(([priority, signs]) => [priority, signs.map((s) => s.key)]))
    // const vg = compactMap(WARNING_SIGNS, s => s.priority === 'Very urgent' && s.key)
    console.log(y)
  })
})

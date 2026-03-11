import { RenderedTask } from '../../../types.ts'
import { hyphenate } from '../../../util/hyphenate.ts'
import memoize from '../../../util/memoize.ts'

export const uniqueIdentifier = memoize(
  function uniqueIdentifier(task: RenderedTask) {
    if (task.atom === 'link') {
      return `${task.atom}-${hyphenate(task.title).toLowerCase()}`
    }
    return `${task.atom}-${hyphenate(task.displays.full).toLowerCase()}`
  },
)

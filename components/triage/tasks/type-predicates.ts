import { RenderedTask } from '../../../types.ts'

export function isLink(task: RenderedTask): task is RenderedTask & { atom: 'link' } {
  return task.atom === 'link'
}

export function isFinding(task: RenderedTask): task is RenderedTask & { atom: 'finding' } {
  return task.atom === 'finding'
}

export function isMeasurement(task: RenderedTask): task is RenderedTask & { atom: 'measurement' } {
  return task.atom === 'measurement'
}

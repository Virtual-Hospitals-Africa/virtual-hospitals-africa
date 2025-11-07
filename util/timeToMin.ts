import { Time } from '../types.ts'

export default function timeToMin(time: Time): number {
  const minutes = time.hour * 60 + (time.minute || 0)
  return time.am_pm === 'am' ? minutes : minutes + 12 * 60
}

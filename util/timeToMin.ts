import { Time } from '../types.ts'

export default function timeToMin(time: Time): number {
  const minutes = time.hour * 60 + (time.minute || 0)
  return time.amPm === 'am' ? minutes : minutes + 12 * 60
}

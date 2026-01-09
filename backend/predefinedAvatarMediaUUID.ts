import { padLeft } from '../util/pad.ts'

export function predefinedAvatarMediaUUID(sex: 'male' | 'female', int: number) {
  return `050f4d63-3cda-4571-a226-29a173eff${sex === 'male' ? '0' : '1'}${
    padLeft(String(int), 2, '0')
  }`
}

import { predefinedAvatarMediaUUID } from '../backend/predefinedAvatarMediaUUID.ts'
import sample from '../util/sample.ts'

export default function randomAvatarMediaId(
  sex: 'male' | 'female' = sample(['male', 'female']),
) {
  const int = 1 + Math.floor(Math.random() * 10)
  return predefinedAvatarMediaUUID(sex, int)
}

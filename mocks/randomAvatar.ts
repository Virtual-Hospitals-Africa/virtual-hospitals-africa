import sample from '../util/sample.ts'

export default function randomAvatar(
  gender: 'male' | 'female' = sample(['male', 'female']),
) {
  return `/images/avatars/random/${gender}/${
    1 + Math.floor(Math.random() * 10)
  }.png`
}

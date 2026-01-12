import { RenderedPatient } from '../types.ts'

export function pronoun(
  { gender }: Pick<RenderedPatient, 'gender'>,
) {
  switch (gender) {
    case 'man':
      return 'him'
    case 'woman':
      return 'her'
    default:
      'them'
  }
}

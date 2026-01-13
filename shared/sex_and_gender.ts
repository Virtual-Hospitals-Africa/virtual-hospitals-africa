import { RenderedPatient } from '../types.ts'

export function pronoun(
  { gender }: Pick<RenderedPatient, 'gender'>,
): string {
  switch (gender) {
    case 'man':
      return 'him'
    case 'woman':
      return 'her'
    default:
      return 'them'
  }
}

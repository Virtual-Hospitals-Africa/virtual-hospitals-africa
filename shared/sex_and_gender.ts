import { RenderedPatient } from '../types.ts'

export function pronoun(
  { gender }: Pick<RenderedPatient, 'gender'>,
): string {
  switch (gender) {
    case 'man':
      return 'he'
    case 'woman':
      return 'she'
    default:
      return 'they'
  }
}

export function objectPronoun(
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

export function posessivePronoun(
  { gender }: Pick<RenderedPatient, 'gender'>,
): string {
  switch (gender) {
    case 'man':
      return 'his'
    case 'woman':
      return 'her'
    default:
      return 'their'
  }
}

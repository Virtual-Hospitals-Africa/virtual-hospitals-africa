import { RenderedPatient } from '../types.ts'

export function pronoun(
  { sex, gender }: Pick<RenderedPatient, 'sex' | 'gender'>,
) {
  switch (`${sex}${gender}`) {
    case 'maleman':
      return 'him'
    case 'femalewoman':
      return 'her'
    default:
      'them'
  }
}

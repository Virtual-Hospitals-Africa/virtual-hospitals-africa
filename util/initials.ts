import last from './last.ts'

export function initials(
  name: string,
): string {
  const names = name.split(' ').filter((n) => !!n)
  switch (names.length) {
    case 0:
      return ''
    case 1:
      return names[0][0].toUpperCase()
    default:
      return names[0][0].toUpperCase() + last(names)![0].toUpperCase()
  }
}

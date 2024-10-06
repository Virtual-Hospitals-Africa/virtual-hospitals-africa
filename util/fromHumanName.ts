export function fromHumanName(name: {
  given: string[]
  family: string
}) {
  return `${name.given.join(' ')} ${name.family}`
}

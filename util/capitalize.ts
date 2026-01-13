export default function capitalize(
  str: string,
  opts?: { split_hyphen?: boolean, just_first?: boolean },
): string {
  if (opts?.just_first) {
    return str[0].toUpperCase() + str.slice(1).toLowerCase()
  }
  return str
    .split(opts?.split_hyphen ? /[\s_-]+/ : /[\s_]+/)
    .map((word) => capitalize(word, { just_first: true }))
    .join(' ')
}

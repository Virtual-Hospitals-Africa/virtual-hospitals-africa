export default function capitalize(
  str: string,
  opts?: { splitHyphen?: boolean },
) {
  return str
    .split(opts?.splitHyphen ? /[\s_-]+/ : /[\s_]+/)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export default function capitalize(str: string) {
  return str
    .split(/[\s_]+/)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export default function isValidLocationString(
  input: string | undefined,
): boolean {
  const latitudeMatch = input?.match(/"latitude"\s*:\s*(-?\d+(\.\d+)?)/)
  const longitudeMatch = input?.match(/"longitude"\s*:\s*(-?\d+(\.\d+)?)/)
  if (!input || !latitudeMatch || !longitudeMatch) {
    return false
  }
  return true
}

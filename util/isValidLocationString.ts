export default function isValidLocationString(
  input: string,
): boolean {
  const latitudeMatch = input.match(/"latitude"\s*:\s*(-?\d+(\.\d+)?)/)
  const longitudeMatch = input.match(/"longitude"\s*:\s*(-?\d+(\.\d+)?)/)
  if (!latitudeMatch || !longitudeMatch) {
    return false
  }
  return true
}

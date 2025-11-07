export default function isValidLocationString(
  input: string | undefined,
): boolean {
  const latitude_match = input?.match(/"latitude"\s*:\s*(-?\d+(\.\d+)?)/)
  const longitude_match = input?.match(/"longitude"\s*:\s*(-?\d+(\.\d+)?)/)
  if (!input || !latitude_match || !longitude_match) {
    return false
  }
  return true
}

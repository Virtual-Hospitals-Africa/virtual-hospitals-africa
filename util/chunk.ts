/**
 * Splits an array into chunks of a specified size.
 * * @param array - The array to process
 * @param size - The desired size of each chunk
 * @returns An array of chunks
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
  if (size <= 0) {
    return []
  }

  const result: T[][] = []

  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }

  return result
}

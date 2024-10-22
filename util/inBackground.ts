export async function inBackground<T>(
  promise: Promise<unknown>,
  task: () => Promise<T>,
): Promise<T> {
  const [, result] = await Promise.all([promise, task()])
  return result
}

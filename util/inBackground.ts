export async function inBackground<T>(
  promise: Promise<T>,
  task: () => Promise<unknown>,
): Promise<T> {
  await Promise.all([promise, task()])
  return promise
}

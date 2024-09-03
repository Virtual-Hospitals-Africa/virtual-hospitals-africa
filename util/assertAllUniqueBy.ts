export function assertAllUniqueBy<T>(arr: T[], key: keyof T): void {
  const set = new Set()
  for (const item of arr) {
    if (set.has(item[key])) {
      throw new Error(`Duplicate key ${item[key]}`)
    }
    set.add(item[key])
  }
}
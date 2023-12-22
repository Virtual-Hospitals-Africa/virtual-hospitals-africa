export function hasName<T extends Record<string, unknown>>(
  row: T,
): row is T & { name: string } {
  return 'name' in row && !!row.name && typeof row.name === 'string'
}

export default function haveNames<T extends Record<string, unknown>>(
  rows: T[],
): rows is Array<T & { name: string }> {
  return rows.every(hasName)
}

export function hasName<T extends Record<string, unknown>>(
  row: T,
): row is T & { name: string } {
  return 'name' in row && !!row.name && typeof row.name === 'string'
}

export function haveNames<T extends Record<string, unknown>>(
  rows: T[],
): rows is Array<T & { name: string }> {
  return rows.every(hasName)
}

export function hasStringField<
  T extends Record<string, unknown>,
  K extends keyof T,
>(
  row: T,
  key: K,
): row is T & { [k in K]: string } {
  return key in row && !!row[key] && typeof row[key] === 'string'
}

export function allHaveStringField<
  T extends Record<string, unknown>,
  K extends keyof T,
>(
  rows: T[],
  key: K,
): rows is Array<T & { [k in K]: string }> {
  return rows.every((row) => hasStringField(row, key))
}

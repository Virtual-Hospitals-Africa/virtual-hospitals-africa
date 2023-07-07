import { ReturnedSqlRow } from '../types.ts'

export function hasName<T extends Record<string, unknown>>(
  row: ReturnedSqlRow<T>,
): row is ReturnedSqlRow<T & { name: string }> {
  return 'name' in row && !!row.name && typeof row.name === 'string'
}

export default function haveNames<T extends Record<string, unknown>>(
  rows: ReturnedSqlRow<T>[],
): rows is ReturnedSqlRow<T & { name: string }>[] {
  return rows.every(hasName)
}

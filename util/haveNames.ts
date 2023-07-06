import { ReturnedSqlRow } from '../types.ts'

export default function haveNames<T extends Record<string, unknown>>(
  rows: ReturnedSqlRow<T>[],
): rows is ReturnedSqlRow<T & { name: string }>[] {
  return rows.every((row) => 'name' in row && !!row.name)
}

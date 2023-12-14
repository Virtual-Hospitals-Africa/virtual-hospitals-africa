import { assertEquals } from 'std/assert/assert_equals.ts'

export const units = new Set(['MG', 'G', 'ML', 'L', 'MCG', 'UG', 'IU'])

export const isUnits = (unit: string): boolean => {
  assertEquals(unit, unit.toUpperCase())
  return units.has(unit)
}

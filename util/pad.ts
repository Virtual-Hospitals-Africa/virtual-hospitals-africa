import { assert } from 'std/assert/assert.ts'
import isNumber from './isNumber.ts'

export function padLeft(
  str: string,
  len: number,
  padChar = ' ',
): string {
  while (str.length < len) {
    str = padChar + str
  }
  return str
}

export function padTime(num?: number): string {
  return num ? padLeft(String(num), 2, '0') : '00'
}

export function padMonth(month: number | string): string {
  const month_number = isNumber(month) ? month : parseInt(month)
  assert(month_number >= 1)
  assert(month_number <= 12)
  return padLeft(String(month), 2, '0')
}

export function padMonthDay(day: number | string): string {
  const day_number = isNumber(day) ? day : parseInt(day)
  assert(day_number >= 1)
  assert(day_number <= 31)
  return padLeft(String(day), 2, '0')
}

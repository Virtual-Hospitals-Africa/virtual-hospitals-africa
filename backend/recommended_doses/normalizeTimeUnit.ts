import { TimeUnit } from './shared.ts'

export function normalizeTimeUnit(unit: string): TimeUnit {
  if (unit.endsWith('s')) unit = unit.slice(0, -1)
  switch (unit) {
    case 'm':
    case 'min':
    case 'minute':
      return 'minute'
    case 'h':
    case 'hr':
    case 'hour':
      return 'hour'
    case 'd':
    case 'day':
      return 'day'
    case 'w':
    case 'wk':
    case 'week':
      return 'week'
    case 'month':
      return 'month'
    case 'y':
    case 'yr':
    case 'year':
      return 'year'
    default: {
      throw new Error(`Not a time unit ${unit}`)
    }
  }
}

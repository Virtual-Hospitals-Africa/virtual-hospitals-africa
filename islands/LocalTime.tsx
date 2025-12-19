import { formatDateTime } from '../util/date.ts'

type LocalTimeProps = {
  timestamp: string | Date
  expected_time_range: 'past' | 'any' /* | 'future' */
}

export function LocalTime({ timestamp, expected_time_range }: LocalTimeProps) {
  const formatted = formatDateTime(timestamp)
  function display(): string {
    if (expected_time_range === 'past') {
      switch (formatted.type) {
        case 'today':
          return `at ${formatted.time_display}`
        case 'yesterday':
          return `at ${formatted.time_display} yesterday`
        case 'past':
          return `on ${formatted.date_display}`
        default:
          throw new Error(`Unexpected ${formatted.type}`)
      }
    }
    switch (formatted.type) {
      case 'today':
        return `${formatted.time_display}`
      case 'yesterday':
        return `${formatted.time_display} yesterday`
      case 'tomorrow':
        return `${formatted.time_display} tomorrow`
      default:
        return `${formatted.time_display} ${formatted.date_display}`
    }
  }

  return <span>{display()}</span>
}

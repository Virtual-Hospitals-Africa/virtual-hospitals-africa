type LocalTimeProps = { timestamp: string | Date }

export function LocalTime({ timestamp }: LocalTimeProps) {
  return <span>{formatDateTime(timestamp)}</span>
}

function formatDateTime(date: string | Date) {
  const today = new Date()
  const input_date = new Date(date)

  // Reset time to compare just dates
  const today_date = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  )
  const compare_date = new Date(
    input_date.getFullYear(),
    input_date.getMonth(),
    input_date.getDate(),
  )

  if (compare_date.getTime() === today_date.getTime()) {
    // Today - show time only
    const time_string = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(input_date)
    return `at ${time_string}`
  } else {
    // Yesterday or earlier - show date only
    const date_string = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(input_date)
    return `on ${date_string}`
  }
}

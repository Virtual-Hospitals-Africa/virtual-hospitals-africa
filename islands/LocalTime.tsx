type LocalTimeProps = { timestamp: string | Date }

export function LocalTime({ timestamp }: LocalTimeProps) {
  return <div>{formatDateTime(timestamp)}</div>
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
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate(),
  )

  if (compareDate.getTime() === todayDate.getTime()) {
    // Today - show time only
    const time_string = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(inputDate)
    return `at ${timeString}`
  } else {
    // Yesterday or earlier - show date only
    const date_string = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(inputDate)
    return `on ${dateString}`
  }
}

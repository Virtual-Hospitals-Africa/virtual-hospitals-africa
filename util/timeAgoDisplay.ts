export function timeAgoDisplay(wait_time: string) {
  const day_regex = /(^\d+ days?)/

  const day_match = wait_time.match(day_regex)

  if (day_match) {
    return `${day_match[1]} ago`
  }
  const [hours, minutes] = wait_time.split(':').map(Number)

  if (!hours && !minutes) {
    return 'Just now'
  }
  if (hours > 1) {
    return `${hours} hours ago`
  }
  if (hours === 0 && minutes === 1) {
    return '1 minute ago'
  }
  return `${(60 * hours) + minutes} minutes ago`
}

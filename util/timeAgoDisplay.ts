import { PostgresInterval } from '../types.ts'

export function timeAgoDisplay(wait_time: PostgresInterval) {
  const { years = 0, months = 0, weeks = 0, days = 0, hours = 0, minutes = 0 } =
    wait_time
  if (years > 1) {
    return `${years} years ago`
  }
  if (years === 1) {
    return '1 year ago'
  }
  if (months > 1) {
    return `${months} months ago`
  }
  if (months === 1) {
    return '1 month ago'
  }
  if (weeks > 1) {
    return `${weeks} weeks ago`
  }
  if (weeks === 1) {
    return '1 week ago'
  }
  if (days > 1) {
    return `${days} days ago`
  }
  if (days === 1) {
    return '1 day ago'
  }
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

import getTag from './internal/getTag.ts'
import isObjectLike from './isObjectLike.ts'

export default function isNumber(value: unknown): value is number {
  return (
    typeof value === 'number' ||
    (isObjectLike(value) && getTag(value) === '[object Number]')
  )
}

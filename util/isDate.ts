import getTag from './internal/getTag.ts'
import isObjectLike from './isObjectLike.ts'

export default function isDate(value: unknown): value is Date {
  return isObjectLike(value) && getTag(value) == '[object Date]'
}

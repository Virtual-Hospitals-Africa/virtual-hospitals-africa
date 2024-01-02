import getTag from './internal/getTag.ts'
import isObjectLike from './isObjectLike.ts'

export default function isArguments(value: unknown) {
  return isObjectLike(value) && getTag(value) === '[object Arguments]'
}

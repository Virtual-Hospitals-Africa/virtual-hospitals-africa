import isObjectLike from './isObjectLike.ts'

export function deepMerge<T>(target: T, ...sources: T[]): T {
  if (!sources.length) return target
  const source = sources.shift()
  if (isObjectLike(target) && isObjectLike(source)) {
    for (const key in source) {
      if (isObjectLike(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepMerge(target[key], source[key])
      } else Object.assign(target, { [key]: source[key] })
    }
  }
  return deepMerge(target, ...sources)
}

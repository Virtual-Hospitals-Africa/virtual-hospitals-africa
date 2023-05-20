export default function sortBy<T>(
  arr: T[],
  ...iteratees: (keyof T | ((obj: T) => string | number))[]
): T[] {
  const getters = iteratees.map((iteratee) => {
    if (typeof iteratee === 'string') {
      return (obj: T) => obj[iteratee]
    } else if (typeof iteratee === 'function') {
      return iteratee
    } else {
      throw new Error('Invalid iteratee')
    }
  })

  return [...arr].sort((a, b) => {
    for (let i = 0; i < getters.length; i++) {
      const getter = getters[i]
      const aValue = getter(a)
      const bValue = getter(b)

      if (aValue < bValue) {
        return -1
      } else if (aValue > bValue) {
        return 1
      }
    }

    return 0
  })
}

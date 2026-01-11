export default function sortBy<T>(
  arr: T[],
  ...iteratees: (keyof T | ((obj: T, index: number) => string | number | Date))[]
): T[] {
  const getters = !iteratees.length ? [(x: T) => x] : iteratees.map((iteratee) => {
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
      const a_value = getter(a, i)
      const b_value = getter(b, i)

      if (a_value < b_value) {
        return -1
      } else if (a_value > b_value) {
        return 1
      }
    }

    return 0
  })
}

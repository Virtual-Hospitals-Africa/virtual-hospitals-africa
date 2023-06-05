const hasOwn = {}.hasOwnProperty

type ClassNameable = boolean | string | number | { [key: string]: boolean }

export default function classNames(...args: ClassNameable[]): string {
  const classes = []

  for (const arg of args) {
    if (!arg) continue

    const argType = typeof arg

    if (argType === 'string' || argType === 'number') {
      classes.push(arg)
    } else if (Array.isArray(arg)) {
      if (arg.length) {
        const inner = classNames.apply(null, arg)
        if (inner) {
          classes.push(inner)
        }
      }
    } else if (argType === 'object') {
      if (
        arg.toString !== Object.prototype.toString &&
        !arg.toString.toString().includes('[native code]')
      ) {
        classes.push(arg.toString())
        continue
      }

      const argObj = arg as { [key: string]: boolean }

      for (const key in argObj) {
        if (hasOwn.call(arg, key) && argObj[key]) {
          classes.push(key)
        }
      }
    }
  }

  return classes.join(' ')
}

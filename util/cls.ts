import { Maybe } from '../types.ts'

const has_own = {}.hasOwnProperty

type ClassNameable = Maybe<
  boolean | string | number | { [key: string]: boolean }
>

export default function classNames(...args: ClassNameable[]): string {
  const classes = []

  for (const arg of args) {
    if (!arg) continue

    const arg_type = typeof arg

    if (arg_type === 'string' || arg_type === 'number') {
      classes.push(arg)
    } else if (Array.isArray(arg)) {
      if (arg.length) {
        const inner = classNames.apply(null, arg)
        if (inner) {
          classes.push(inner)
        }
      }
    } else if (arg_type === 'object') {
      if (
        arg.toString !== Object.prototype.toString &&
        !arg.toString.toString().includes('[native code]')
      ) {
        classes.push(arg.toString())
        continue
      }

      const arg_obj = arg as { [key: string]: boolean }

      for (const key in arg_obj) {
        if (has_own.call(arg, key) && arg_obj[key]) {
          classes.push(key)
        }
      }
    }
  }

  return classes.join(' ')
}

export const cls = classNames
